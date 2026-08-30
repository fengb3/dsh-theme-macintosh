// tools/audit.mjs — 静态纪律走查（照《笔记》§13 可静态检查项）
// 扫描 src/**/*.js + dist/client-body.js（若存在），输出 PASS/FAIL，任一 FAIL 退出码 1。
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
const distText = existsSync(distFile) ? stripComments(readFileSync(distFile, 'utf8')) : null;

const failures = [];
const fail = (msg) => { failures.push(msg); console.log(`FAIL ${msg}`); };
const pass = (msg) => console.log(`PASS ${msg}`);
const rel = (f) => relative(ROOT, f).replace(/\\/g, '/');

// ── 1. 无 :hover；无 transition:（唯一豁免：reduced-motion 块内 transition-duration:.01ms!important）──
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
             : pass('无 :hover、无 transition（唯一豁免 reduced-motion .01ms）');
}

// ── 2. setTimeout/setInterval 直调仅限 src/core/clock.js ──
{
  let bad = [];
  for (const [f, t] of srcText) {
    if (rel(f) === 'src/core/clock.js') continue;
    for (const line of t.split('\n'))
      if (/set(Timeout|Interval)\s*\(/.test(line)) bad.push(`${rel(f)}: ${line.trim()}`);
  }
  bad.length ? fail(`非 clock.js 出现定时器直调:\n  ` + bad.join('\n  '))
             : pass('setTimeout/setInterval 直调仅存在于 src/core/clock.js');
}

// ── 3. innerHTML：含 ${ 的赋值必须经过 esc()；纯静态字面量放行 ──
{
  let bad = [];
  for (const [f, t] of srcText) {
    for (const line of t.split('\n')) {
      if (/\.innerHTML\s*=/.test(line) && /\$\{/.test(line) && !/\besc\s*\(/.test(line))
        bad.push(`${rel(f)}: ${line.trim()}`);
    }
  }
  bad.length ? fail(`innerHTML 插值未走 esc()（需人工复核）:\n  ` + bad.join('\n  '))
             : pass('innerHTML 全部为静态字面量或经 esc() 转义');
}

// ── 4. --mc-desktop-pattern 不得在浅色块被覆盖 ──
{
  const tokens = stripComments(readFileSync(join(ROOT, 'src', 'core', 'tokens.js'), 'utf8'));
  const light = tokens.match(/html\[data-theme="light"\]\s*\{([\s\S]*?)\n\}/);
  let ok = !!light && !/--mc-desktop-pattern/.test(light[1]);
  ok ? pass('--desktop-pattern 浅色块未覆盖（沿用同一噪点瓦片）')
     : fail('--mc-desktop-pattern 出现在 html[data-theme="light"] 块内');
}

// ── 5. 宿主选择器管制：MC_MAP 的值不得出现在其他 src 文件 ──
{
  const mapSrc = readFileSync(join(ROOT, 'src', 'chrome', 'map.js'), 'utf8');
  const values = [...mapSrc.matchAll(/:\s*'([^']+)'/g)].map((m) => m[1]);
  // 从值中提取特征片段：#id、[attr...]、[role=...]、[aria-...]
  const tokens = new Set();
  for (const v of values) for (const t of v.match(/#[\w-]+|\[[^\]]+\]/g) || []) tokens.add(t);
  let bad = [];
  for (const [f, t] of srcText) {
    if (rel(f) === 'src/chrome/map.js') continue;
    for (const tok of tokens)
      if (t.includes(tok)) bad.push(`${rel(f)} 含宿主选择器片段 ${tok}`);
  }
  bad.length ? fail(`MC_MAP 选择器泄漏到管制文件之外:\n  ` + [...new Set(bad)].join('\n  '))
             : pass(`宿主选择器仅存在于 src/chrome/map.js（${tokens.size} 个特征片段核验）`);
}

console.log(distText ? '（dist/client-body.js 已并入扫描）' : '（dist/client-body.js 不存在，仅扫 src）');
if (failures.length) { console.log(`\naudit: ${failures.length} 项 FAIL`); process.exit(1); }
console.log('\naudit: all green');
