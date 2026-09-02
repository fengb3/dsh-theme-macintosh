// tools/audit.mjs — 静态纪律走查（照《笔记》§13 可静态检查项）
// 扫描 src/**/*.js + dist/client-body.js（若存在）+ client.js（运行交付物，若存在），输出 PASS/FAIL，任一 FAIL 退出码 1。
// 各 check 的扫描范围：
//   1. hover/transition     —— src 全部 + dist 全量 + client.js 全量
//   2. setTimeout/setInterval —— src 除 clock.js + dist 除 clock 快照段（按 '// src/core/clock.js'..'// src/core/mcfx.js' 内容定位）
//                                + client.js 全量（clock 段走 mcG.*.bind、loader 样板走 ctx.effect，无裸定时器，不需豁免）
//   3. innerHTML+esc        —— src 全部 + dist 全量 + client.js 全量
//   4. 浅色 token 覆盖      —— 仅 src/core/tokens.js
//   5. 宿主选择器泄漏       —— src 除 map.js + dist/client.js 各除 map 快照段（均按 '// src/chrome/map.js'..
//                             '// src/chrome/chrome.js' 内容定位——client.js 与 dist 同为 src 镜像拼接产物、
//                             段标记同构；client.js 头尾 loader 样板全量入检不豁免）
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}

// —— 注释剥离：去 /* */ 与 // 行注释，供模式扫描。
// 保守规则：含 base64/url( 的行不剥 //（避免误伤 data-URI / base64 内的 '/'）。
function stripComments(text) {
  let s = text.replace(/\/\*[\s\S]*?\*\//g, ' ');
  return s
    .split('\n')
    .map((line) =>
      /base64|url\(/.test(line) ? line : line.replace(/(^|[^:])\/\/.*$/, '$1')
    )
    .join('\n');
}

const srcFiles = walk(join(ROOT, 'src'));
const distFile = join(ROOT, 'dist', 'client-body.js');
const clientFile = join(ROOT, 'client.js'); // 浏览器真正执行的常驻交付物（终审 F1 并入扫描）
const srcText = new Map(srcFiles.map((f) => [f, stripComments(readFileSync(f, 'utf8'))]));

// 产物走查文本（dist 快照与 client.js 同一套机制）：先在「原始产物」上按 '// src/...' 注释定位
// 豁免段（stripComments 会剥掉这些标记），将豁免段整段替换为等长空白后再剥注释 —— 行数不变、
// 豁免内容不参与扫描。
function segmentRaw(raw, fromMarker, toMarker) {
  if (raw == null) return null;
  const from = raw.indexOf(fromMarker);
  if (from < 0) return null;
  const to = toMarker ? raw.indexOf(toMarker, from) : -1;
  return raw.slice(from, to < 0 ? undefined : to);
}
function scanText(raw, exemptSegments) {
  if (raw == null) return null;
  let out = raw;
  for (const seg of exemptSegments) {
    if (seg == null) continue;
    out = out.split(seg).join(' '.repeat(seg.length));
  }
  return stripComments(out);
}

const distRaw = existsSync(distFile) ? readFileSync(distFile, 'utf8') : null;
const clientRaw = existsSync(clientFile) ? readFileSync(clientFile, 'utf8') : null;

// 预备各 check 用的走查文本
const distText = scanText(distRaw, []); // dist 全量（check 1/2/3）
const distNoClock = scanText(distRaw, [segmentRaw(distRaw, '// src/core/clock.js', '// src/core/mcfx.js')]); // check 2
const distNoMap = scanText(distRaw, [segmentRaw(distRaw, '// src/chrome/map.js', '// src/chrome/chrome.js'), segmentRaw(distRaw, '// src/conv/overlays.js', '// src/kit.js'), segmentRaw(distRaw, '// src/conv/dock.js', '// src/conv/overlays.js'), segmentRaw(distRaw, '// src/finder.js', '// src/conv/think.js'), segmentRaw(distRaw, '// src/conv/tool.js', '// src/conv/dock.js')]); // check 5
const clientText = scanText(clientRaw, []); // client.js 全量（check 1/2/3；clock 段无裸定时器，无需豁免）
const clientNoMap = scanText(clientRaw, [segmentRaw(clientRaw, '// src/chrome/map.js', '// src/chrome/chrome.js'), segmentRaw(clientRaw, '// src/conv/overlays.js', '// src/kit.js'), segmentRaw(clientRaw, '// src/conv/dock.js', '// src/conv/overlays.js'), segmentRaw(clientRaw, '// src/finder.js', '// src/conv/think.js'), segmentRaw(clientRaw, '// src/conv/tool.js', '// src/conv/dock.js')]); // check 5
// M5（终审修复批）：overlays 段不再整段豁免为盲区 —— 段内白名单反查。
// 段内仅允许 menuPortal/menuHostItem 两 token 出现（Task 4 mount 兜底隐藏引用 MC_MAP.menuPortal）；
// overlays2 批防御性登记 hero/dlg 六键名（键名非括号形态不产 token，Task 2/3/4 按名消费）；
// 其余任何 MC_MAP 特征片段（[data-…/[role=…/[aria-… 等）在段内出现即 FAIL。
const distOverlays = distRaw != null ? stripComments(segmentRaw(distRaw, '// src/conv/overlays.js', '// src/kit.js') || '') : null;
const clientOverlays = clientRaw != null ? stripComments(segmentRaw(clientRaw, '// src/conv/overlays.js', '// src/kit.js') || '') : null;
const srcOverlaysFile = join(ROOT, 'src', 'conv', 'overlays.js');
const srcOverlaysText = srcText.get(srcOverlaysFile) || null;
const OVERLAYS_WHITELIST = new Set(['menuPortal', 'menuHostItem', 'heroRoot', 'heroOfficial', 'heroGlow', 'dlgCard', 'dlgMask', 'dlgNav', 'dlgTriggerSettings', 'dlgClose', 'sessTitle', 'heroRow', 'heroStack']); // overlays2 批(2026-09-02)防御性登记六键名——键名非括号形态不产 token,照 dock 先例;裁定轮(2026-09-03)增 heroGlow/dlgClose 两键;裁定轮2(2026-09-03)增 sessTitle/heroRow/heroStack 三键(键名防御性登记,同前)
// dock 段照 overlays 段同款机制：段定位 '// src/conv/dock.js' → '// src/conv/overlays.js'，
// 白名单 DOCK_WHITELIST = composerCard + MC_MAP dock 键（骨架期零选择器；Task 4+ mount 引用时放行；
// 验收轮1 2026-09-01 增四新键 composerCmd/composerPerm/composerModel/composerCtx——新值全为闭合
// bracket 形态，由 map 值自动提取，无需前缀登记）。
const distDock = distRaw != null ? stripComments(segmentRaw(distRaw, '// src/conv/dock.js', '// src/conv/overlays.js') || '') : null;
const clientDock = clientRaw != null ? stripComments(segmentRaw(clientRaw, '// src/conv/dock.js', '// src/conv/overlays.js') || '') : null;
const srcDockFile = join(ROOT, 'src', 'conv', 'dock.js');
const srcDockText = srcText.get(srcDockFile) || null;
const DOCK_WHITELIST = new Set(['composerCard', 'composerSeat', 'composerHide', 'composerField', 'composerSend', 'composerStop', 'composerPhase', 'composerCmd', 'composerPerm', 'composerModel', 'composerCtx', 'composerDockSlot', 'goalPause', 'goalResume', 'goalEditBtn', 'goalClear', 'goalInput', 'goalSave', 'goalCancel']); // dock2 批:官方 input dock 槽藏匿键 + GoalBar 动作镜像七键(闭合 bracket,自动提取)
// finder 段照 overlays/dock 同款机制（验收轮5）：段定位 '// src/finder.js' → '// src/conv/think.js'，
// 白名单 = menuPortal（视图选项瞬时换场的菜单在场探测引用 MC_MAP.menuPortal）+
// sidebar 三键名（sidebarRegion/sidebarViewOpts/sidebarNewSess——官方代理与换场藏匿引用）。
const distFinder = distRaw != null ? stripComments(segmentRaw(distRaw, '// src/finder.js', '// src/conv/think.js') || '') : null;
const clientFinder = clientRaw != null ? stripComments(segmentRaw(clientRaw, '// src/finder.js', '// src/conv/think.js') || '') : null;
const srcFinderFile = join(ROOT, 'src', 'finder.js');
const srcFinderText = srcText.get(srcFinderFile) || null;
const FINDER_WHITELIST = new Set(['menuPortal', 'sidebarRegion', 'sidebarViewOpts', 'sidebarNewSess']);
// tool 段照 overlays/dock/finder 同款机制（toolcard 批补账 2026-09-02）：段定位 '// src/conv/tool.js'
// → '// src/conv/dock.js'，白名单 = [aria-expanded]（用户裁定二轮:展开体折叠面板 flash 的卡体
// onClickCapture 委托 closest 命中宿主 DisclosureRow 系折叠钮——纯读态行为钩子，非样式选择器；
// 样式仍全走 .mc-* 自有类，data-state 三态已裁改类驱动）。
const distTool = distRaw != null ? stripComments(segmentRaw(distRaw, '// src/conv/tool.js', '// src/conv/dock.js') || '') : null;
const clientTool = clientRaw != null ? stripComments(segmentRaw(clientRaw, '// src/conv/tool.js', '// src/conv/dock.js') || '') : null;
const srcToolFile = join(ROOT, 'src', 'conv', 'tool.js');
const srcToolText = srcText.get(srcToolFile) || null;
const TOOL_WHITELIST = new Set(['[aria-expanded]']);

const failures = [];
const fail = (msg) => { failures.push(msg); console.log(`FAIL ${msg}`); };
const pass = (msg) => console.log(`PASS ${msg}`);
const rel = (f) => relative(ROOT, f).replace(/\\/g, '/');

// ── 1. 无 :hover;无 transition:(豁免:纯压平声明 transition:none(!important) 与
//     reduced-motion 块内 transition-duration:.01ms!important——spec flow §3「宿主自带的
//     transition 以 transition:none 压平保持硬切」,压平即关闭过渡、不新增动画)──
// 范围：src 全部 + dist 全量 + client.js 全量。
{
  let bad = [];
  for (const [f, t] of [...srcText, ...(distText ? [[distFile, distText]] : []), ...(clientText ? [[clientFile, clientText]] : [])]) {
    for (let line of t.split('\n')) {
      if (/:hover/.test(line)) bad.push(`${rel(f)}: ${line.trim()}`);
      // 豁免：纯压平声明不新增动画——transition:none(!important)(flow T5 think 卡)与
      // reduced-motion 块内的 transition-duration:.01ms!important(tokens.js)。剥压平项后再扫。
      // 右边界断言(?=[;}'"}\s]|$,T10 加固):仅当 none 后随声明边界才剥——防
      // `transition:nonexistent` 这类前缀撞车被误剥而漏检(应留在线上被下方 transition: 检出)。
      const scan = line.replace(/transition\s*:\s*none(\s*!important)?(?=[;}'"}\s]|$)/g, 'FLAT');
      if (/transition\s*:/.test(scan) &&
          !/transition-duration\s*:\s*\.01ms!important/.test(scan))
        bad.push(`${rel(f)}: ${line.trim()}`);
    }
  }
  bad.length ? fail(`hover/transition 违禁 ${bad.length} 处:\n  ` + bad.join('\n  '))
              : pass('无 :hover、无 transition(src 全部 + dist/client.js 全量；豁免压平声明 none(!important) 与 reduced-motion .01ms)');
}

// ── 2. setTimeout/setInterval 直调仅限 clock 模块段 ──
// 范围：src 除 src/core/clock.js + dist 除 clock 快照段（内容特征定位，非文件名）+ client.js 全量。
{
  let bad = [];
  for (const [f, t] of [...srcText, ...(distNoClock ? [[distFile, distNoClock]] : []), ...(clientText ? [[clientFile, clientText]] : [])]) {
    if (rel(f) === 'src/core/clock.js') continue;
    for (let line of t.split('\n')) {
      // window.setInterval/clearInterval 是合规绕法（runner 陷阱只遮蔽裸标识符），放行
      line = line.replace(/window\.(set(Timeout|Interval)|clear(Timeout|Interval))\s*\(/g, 'OK(');
      if (/set(Timeout|Interval)\s*\(/.test(line)) bad.push(`${rel(f)}: ${line.trim()}`);
    }
  }
  bad.length ? fail(`非 clock 段出现定时器直调:\n  ` + bad.join('\n  '))
              : pass('setTimeout/setInterval 直调仅存在于 clock 段（src/core/clock.js + dist 对应快照段豁免；client.js 全量零直调）');
}

// ── 3. innerHTML：含 ${ 的赋值必须经过 esc()；纯静态字面量放行 ──
// 范围：src 全部 + dist 全量 + client.js 全量。
{
  let bad = [];
  for (const [f, t] of [...srcText, ...(distText ? [[distFile, distText]] : []), ...(clientText ? [[clientFile, clientText]] : [])]) {
    for (const line of t.split('\n')) {
      if (/\.innerHTML\s*=/.test(line) && /\$\{/.test(line) && !/\besc\s*\(/.test(line))
        bad.push(`${rel(f)}: ${line.trim()}`);
    }
  }
  bad.length ? fail(`innerHTML 插值未走 esc()（需人工复核）:\n  ` + bad.join('\n  '))
              : pass('innerHTML 全部为静态字面量或经 esc() 转义（src 全部 + dist/client.js 全量）');
}

// ── 4. --mc-desktop-pattern 不得在浅色块被覆盖 ──
// 范围：仅 src/core/tokens.js（设计源头；dist 为其快照）。
{
  const tokens = stripComments(readFileSync(join(ROOT, 'src', 'core', 'tokens.js'), 'utf8'));
  const light = tokens.match(/html\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/);
  let ok = !!light && !/--mc-desktop-pattern/.test(light[1]);
  ok ? pass('--desktop-pattern 浅色块未覆盖（沿用同一噪点瓦片）')
      : fail('--mc-desktop-pattern 出现在 html[data-theme="light"] 块内');
}

// ── 5. 宿主选择器管制：MC_MAP 的值不得出现在其他 src 文件 / 产物其他段 ──
// 范围：src 除 src/chrome/map.js + dist/client.js 各除 map 快照段（内容特征定位，非文件名）。
{
  const mapSrc = readFileSync(join(ROOT, 'src', 'chrome', 'map.js'), 'utf8');
  const values = [...mapSrc.matchAll(/:\s*'([^']+)'/g)].map((m) => m[1]);
  // 从值中提取特征片段：#id、[attr...]、[role=...]、[aria-...]
  const tokens = new Set();
  for (const v of values) for (const t of v.match(/#[\w-]+|\[[^\]]+\]/g) || []) tokens.add(t);
  // flow 段手动补片段（2026-08-31；终审 F2 增补 contextForm/dataState）：kind 系列、context form、
  // data-state 系列任意取值形态——前缀级特征（无闭合 ]）不进 map.js 值提取，须手动登记；只允许出现在 map 段。
  tokens.add('[data-chat-flow-kind=');
  tokens.add('[data-variant="think"]');
  tokens.add('[data-context-form=');
  tokens.add('[data-state=');
  tokens.add('[aria-expanded='); // 验收④a:think 像素三角展开态前缀键(2026-08-31 收编,同 dataState 先例)
  tokens.add('menuPortal'); // menu 段(2026-09-01):宿主菜单 portal 锚字面量,只允许出现在 map 段与 McMenus 段(src/conv/overlays.js + dist/client 对应快照段,Task 4 mount 兜底隐藏引用)
  let bad = [];
  for (const [f, t] of [...srcText, ...(distNoMap ? [[distFile, distNoMap]] : []), ...(clientNoMap ? [[clientFile, clientNoMap]] : [])]) {
    if (rel(f) === 'src/chrome/map.js' || rel(f) === 'src/conv/overlays.js' || rel(f) === 'src/conv/dock.js' || rel(f) === 'src/finder.js' || rel(f) === 'src/conv/tool.js') continue;
    for (const tok of tokens)
      if (t.includes(tok)) bad.push(`${rel(f)} 含宿主选择器片段 ${tok}`);
  }
  // M5：overlays 段白名单反查（src/conv/overlays.js + dist/client 对应段）——白名单键名（menu 两键 + overlays2 hero/dlg 六键名，键名防御性登记）
  for (const [name, seg] of [['src/conv/overlays.js', srcOverlaysText], ['dist/client-body.js', distOverlays], ['client.js', clientOverlays]]) {
    if (!seg) continue;
    for (const tok of tokens) {
      if (OVERLAYS_WHITELIST.has(tok)) continue;
      if (seg.includes(tok)) bad.push(`${name} overlays 段含未白名单宿主选择器片段 ${tok}`);
    }
  }
  // dock 段白名单反查(同 M5):只许 DOCK_WHITELIST 六键 + composerCard 出现在 dock 段
  for (const [name, seg] of [['src/conv/dock.js', srcDockText], ['dist/client-body.js', distDock], ['client.js', clientDock]]) {
    if (!seg) continue;
    for (const tok of tokens) {
      if (DOCK_WHITELIST.has(tok)) continue;
      if (seg.includes(tok)) bad.push(`${name} dock 段含未白名单宿主选择器片段 ${tok}`);
    }
  }
  // finder 段白名单反查(轮5):只许 FINDER_WHITELIST 键名出现在 finder 段
  for (const [name, seg] of [['src/finder.js', srcFinderText], ['dist/client-body.js', distFinder], ['client.js', clientFinder]]) {
    if (!seg) continue;
    for (const tok of tokens) {
      if (FINDER_WHITELIST.has(tok)) continue;
      if (seg.includes(tok)) bad.push(`${name} finder 段含未白名单宿主选择器片段 ${tok}`);
    }
  }
  // tool 段白名单反查(toolcard 批补账):只许 [aria-expanded] 读态钩子出现在 tool 段
  for (const [name, seg] of [['src/conv/tool.js', srcToolText], ['dist/client-body.js', distTool], ['client.js', clientTool]]) {
    if (!seg) continue;
    for (const tok of tokens) {
      if (TOOL_WHITELIST.has(tok)) continue;
      if (seg.includes(tok)) bad.push(`${name} tool 段含未白名单宿主选择器片段 ${tok}`);
    }
  }
  bad.length ? fail(`MC_MAP 选择器泄漏到管制文件之外:\n  ` + [...new Set(bad)].join('\n  '))
              : pass(`宿主选择器仅存在于 map 段（src/chrome/map.js + dist/client.js 对应快照段豁免；overlays 段白名单反查 menuPortal/menuHostItem + overlays2 hero/dlg 六键名；tool 段白名单反查 [aria-expanded] 读态钩子；${tokens.size} 个特征片段核验）`);
}

const joined = [distText ? 'dist/client-body.js' : null, clientText ? 'client.js' : null].filter(Boolean);
console.log(joined.length ? `（${joined.join(' + ')} 已并入扫描，豁免段按内容特征定位）` : '（dist/client-body.js 与 client.js 均不存在，仅扫 src）');
if (failures.length) { console.log(`\naudit: ${failures.length} 项 FAIL`); process.exit(1); }
console.log('\naudit: all green');
