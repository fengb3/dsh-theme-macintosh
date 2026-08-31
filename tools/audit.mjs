// tools/audit.mjs — 静态纪律走查（照《笔记》§13 可静态检查项）
// 扫描 src/**/*.js + dist/client-body.js（若存在），输出 PASS/FAIL，任一 FAIL 退出码 1。
// 各 check 的扫描范围：
//   1. hover/transition     —— src 全部 + dist 全量
//   2. setTimeout/setInterval —— src 除 clock.js + dist 除 clock 快照段（按 '// src/core/clock.js'..'// src/core/mcfx.js' 内容定位）
//   3. innerHTML+esc        —— src 全部 + dist 全量
//   4. 浅色 token 覆盖      —— 仅 src/core/tokens.js
//   5. 宿主选择器泄漏       —— src 除 map.js + dist 除 map 快照段（按 '// src/chrome/map.js'..'// src/chrome/chrome.js' 内容定位）
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
const srcText = new Map(srcFiles.map((f) => [f, stripComments(readFileSync(f, 'utf8'))]));

// dist 走查文本：先在「原始产物」上按 '// src/...' 注释定位豁免段（stripComments 会剥掉这些标记），
// 将豁免段整段替换为等长空白后再剥注释 —— 行数不变、豁免内容不参与扫描。
const distRaw = existsSync(distFile) ? readFileSync(distFile, 'utf8') : null;
function distSegmentRaw(fromMarker, toMarker) {
  if (distRaw == null) return null;
  const from = distRaw.indexOf(fromMarker);
  if (from < 0) return null;
  const to = toMarker ? distRaw.indexOf(toMarker, from) : -1;
  return distRaw.slice(from, to < 0 ? undefined : to);
}
function distScanText(exemptSegments) {
  if (distRaw == null) return null;
  let out = distRaw;
  for (const seg of exemptSegments) {
    if (seg == null) continue;
    out = out.split(seg).join(' '.repeat(seg.length));
  }
  return stripComments(out);
}

// 预备各 check 用的 dist 走查文本
const distText = distScanText([]); // 全量（check 1/3）
const distNoClock = distScanText([distSegmentRaw('// src/core/clock.js', '// src/core/mcfx.js')]); // check 2
const distNoMap = distScanText([distSegmentRaw('// src/chrome/map.js', '// src/chrome/chrome.js')]); // check 5

const failures = [];
const fail = (msg) => { failures.push(msg); console.log(`FAIL ${msg}`); };
const pass = (msg) => console.log(`PASS ${msg}`);
const rel = (f) => relative(ROOT, f).replace(/\\/g, '/');

// ── 1. 无 :hover；无 transition:（唯一豁免：reduced-motion 块内 transition-duration:.01ms!important）──
// 范围：src 全部 + dist 全量。
{
  let bad = [];
  for (const [f, t] of [...srcText, ...(distText ? [[distFile, distText]] : [])]) {
    for (const line of t.split('\n')) {
      if (/:hover/.test(line)) bad.push(`${rel(f)}: ${line.trim()}`);
      // 唯一豁免：reduced-motion 块内的 transition-duration:.01ms!important（tokens.js）
      if (/transition\s*:/.test(line) &&
          !/transition-duration\s*:\s*\.01ms!important/.test(line))
        bad.push(`${rel(f)}: ${line.trim()}`);
    }
  }
  bad.length ? fail(`hover/transition 违禁 ${bad.length} 处:\n  ` + bad.join('\n  '))
              : pass('无 :hover、无 transition（src 全部 + dist 全量；唯一豁免 reduced-motion .01ms）');
}

// ── 2. setTimeout/setInterval 直调仅限 clock 模块段 ──
// 范围：src 除 src/core/clock.js + dist 除 clock 快照段（内容特征定位，非文件名）。
{
  let bad = [];
  for (const [f, t] of [...srcText, ...(distNoClock ? [[distFile, distNoClock]] : [])]) {
    if (rel(f) === 'src/core/clock.js') continue;
    for (let line of t.split('\n')) {
      // window.setInterval/clearInterval 是合规绕法（runner 陷阱只遮蔽裸标识符），放行
      line = line.replace(/window\.(set(Timeout|Interval)|clear(Timeout|Interval))\s*\(/g, 'OK(');
      if (/set(Timeout|Interval)\s*\(/.test(line)) bad.push(`${rel(f)}: ${line.trim()}`);
    }
  }
  bad.length ? fail(`非 clock 段出现定时器直调:\n  ` + bad.join('\n  '))
              : pass('setTimeout/setInterval 直调仅存在于 clock 段（src/core/clock.js + dist 对应快照段豁免）');
}

// ── 3. innerHTML：含 ${ 的赋值必须经过 esc()；纯静态字面量放行 ──
// 范围：src 全部 + dist 全量。
{
  let bad = [];
  for (const [f, t] of [...srcText, ...(distText ? [[distFile, distText]] : [])]) {
    for (const line of t.split('\n')) {
      if (/\.innerHTML\s*=/.test(line) && /\$\{/.test(line) && !/\besc\s*\(/.test(line))
        bad.push(`${rel(f)}: ${line.trim()}`);
    }
  }
  bad.length ? fail(`innerHTML 插值未走 esc()（需人工复核）:\n  ` + bad.join('\n  '))
              : pass('innerHTML 全部为静态字面量或经 esc() 转义（src 全部 + dist 全量）');
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

// ── 5. 宿主选择器管制：MC_MAP 的值不得出现在其他 src 文件 / dist 其他段 ──
// 范围：src 除 src/chrome/map.js + dist 除 map 快照段（内容特征定位，非文件名）。
{
  const mapSrc = readFileSync(join(ROOT, 'src', 'chrome', 'map.js'), 'utf8');
  const values = [...mapSrc.matchAll(/:\s*'([^']+)'/g)].map((m) => m[1]);
  // 从值中提取特征片段：#id、[attr...]、[role=...]、[aria-...]
  const tokens = new Set();
  for (const v of values) for (const t of v.match(/#[\w-]+|\[[^\]]+\]/g) || []) tokens.add(t);
  // flow 段手动补片段（2026-08-31）：kind 系列任意取值形态 + think 卡双锚——
  // 前缀级特征（无闭合 ]）不进 map.js 值提取，须手动登记；只允许出现在 map 段。
  tokens.add('[data-chat-flow-kind=');
  tokens.add('[data-variant="think"]');
  let bad = [];
  for (const [f, t] of [...srcText, ...(distNoMap ? [[distFile, distNoMap]] : [])]) {
    if (rel(f) === 'src/chrome/map.js') continue;
    for (const tok of tokens)
      if (t.includes(tok)) bad.push(`${rel(f)} 含宿主选择器片段 ${tok}`);
  }
  bad.length ? fail(`MC_MAP 选择器泄漏到管制文件之外:\n  ` + [...new Set(bad)].join('\n  '))
              : pass(`宿主选择器仅存在于 map 段（src/chrome/map.js + dist 对应快照段豁免；${tokens.size} 个特征片段核验）`);
}

console.log(distText ? '（dist/client-body.js 已并入扫描，豁免段按内容特征定位）' : '（dist/client-body.js 不存在，仅扫 src）');
if (failures.length) { console.log(`\naudit: ${failures.length} 项 FAIL`); process.exit(1); }
console.log('\naudit: all green');
