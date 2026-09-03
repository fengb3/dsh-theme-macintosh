// test/smoke.test.mjs — 验证 assemble 输出：无 import/require、含层1 dsw alias
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('assemble 产出无 import 且含 dsw alias', () => {
  execFileSync(process.execPath, [path.join(ROOT, 'tools', 'assemble.mjs')], { cwd: ROOT });
  const out = require('node:fs').readFileSync(path.join(ROOT, 'dist', 'client-body.js'), 'utf8');
  // think/syscard 镜像的守卫式 require（typeof require === 'function'，CJS 测试域/加载器域各取所需）
  // 与提及 require 的注释是设计差异，剥除后再检；裸 import/require 仍违禁。
  const noGuarded = out.split('\n')
    .filter((l) => !/typeof require === 'function'/.test(l))
    .map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1'))
    .join('\n');
  assert.ok(!/\bimport\b|\brequire\b/.test(noGuarded), 'client-body.js 不得含 import/require');
  assert.ok(out.includes('--dsw-alias-bg-base'), '应包含层1 dsw alias');
  assert.ok(out.includes('data-mc-root'), 'apply 应挂 data-mc-root style');
});

test('assemble 产出含字体 base64 内联与 unicode-range 别名', () => {
  execFileSync(process.execPath, [path.join(ROOT, 'tools', 'assemble.mjs')], { cwd: ROOT });
  const out = require('node:fs').readFileSync(path.join(ROOT, 'dist', 'client-body.js'), 'utf8');
  assert.ok(out.includes('data:font/ttf;base64,'), '应内联 ttf base64 @font-face');
  assert.ok(out.includes('unicode-range'), 'ChiKareGo Latin 别名应带 unicode-range');
});

test('assemble 产出含 SVG sprite 符号库', () => {
  execFileSync(process.execPath, [path.join(ROOT, 'tools', 'assemble.mjs')], { cwd: ROOT });
  const out = require('node:fs').readFileSync(path.join(ROOT, 'dist', 'client-body.js'), 'utf8');
  assert.ok(out.includes('data-mc-sprite'), 'McSprite.mount 应注入 data-mc-sprite svg');
  assert.ok(out.includes('i-cl-HappyMac'), '应含品牌 HappyMac 符号');
  assert.ok(out.includes('--font-sb'), 'tokens 应含五族回退链');
});

test('assemble --font-base 产出 URL 引用而非 base64', () => {
  const tmpOut = path.join(ROOT, 'dist', 'client-body.urltmp.js');
  execFileSync(process.execPath, [path.join(ROOT, 'tools', 'assemble.mjs'),
    '--font-base', 'http://127.0.0.1:3199/assets', '--out', tmpOut], { cwd: ROOT });
  const fs = require('node:fs');
  try {
    const out = fs.readFileSync(tmpOut, 'utf8');
    assert.ok(out.includes('url(http://127.0.0.1:3199/assets/fonts/'),
      '应含字体 URL 引用');
    assert.ok(!out.includes('data:font/ttf;base64,'), 'URL 模式不得内联 base64 字体');
    assert.ok(out.includes('unicode-range'), 'ChiKareGo Latin 别名应带 unicode-range');
    // 5 个 @font-face 全走 URL：至少 5 处 fonts/ 引用
    assert.ok(out.split('http://127.0.0.1:3199/assets/fonts/').length - 1 >= 5,
      '五个字体都应使用 URL 形式');
  } finally {
    if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
  }
});

test('sprite 无残留 inkscape/inkpad 元数据属性', () => {
  execFileSync(process.execPath, [path.join(ROOT, 'tools', 'assemble.mjs')], { cwd: ROOT });
  const out = require('node:fs').readFileSync(path.join(ROOT, 'dist', 'client-body.js'), 'utf8');
  assert.ok(!/inkscape:|inkpad:/.test(out), 'sprite 不应含 inkscape/inkpad 属性');
});

test('assemble 产出含 tokens/primitives 全集与 kit 检视页', () => {
  execFileSync(process.execPath, [path.join(ROOT, 'tools', 'assemble.mjs')], { cwd: ROOT });
  const out = require('node:fs').readFileSync(path.join(ROOT, 'dist', 'client-body.js'), 'utf8');
  // §4.1 补全 token
  for (const tok of ['--mc-desktop-pattern', '--mc-shadow-panel', '--mc-shadow-pop', '--mc-shadow-field', '--mc-shadow-win',
    '--mc-title-stripe', '--mc-scroll-track', '--mc-scroll-box', '--mc-rail-w', '--mc-menubar-h',
    '--mc-titlebar-h', '--mc-r-window', '--mc-r-card', '--mc-r-btn', '--mc-r-tag', '--mc-bw',
    '--mc-t-fast', '--mc-t-mid', '--mc-ease', '--mc-ease-sweep', '--mc-box-line', '--mc-box-face']) {
    assert.ok(out.includes(tok), `tokens 应含 ${tok}`);
  }
  // primitives + keyframes + 画布/selection/focus/滚动条/动画豁免
  for (const sel of ['.mc-btn', '.mc-icon-btn', '.mc-pill', '.mc-field', '.mc-tri',
    '@keyframes mc-pulse', '@keyframes mc-sweep', '::selection', ':focus-visible',
    '::-webkit-scrollbar', 'prefers-reduced-motion', '--mc-desktop-pattern)']) {
    assert.ok(out.includes(sel), `css 应含 ${sel}`);
  }
  // kit 检视页：默认关闭 + shell.overlay 席位 + kit- 前缀布局
  assert.ok(out.includes('kit-scrim'), 'kit 应含 kit-scrim 点阵幕');
  assert.ok(out.includes('__MC_KIT_OPEN__'), 'kit 开关应走 window.__MC_KIT_OPEN__');
  assert.ok(out.includes("'mc-kit'"), 'kit 应注册 mc-kit 席位');
  assert.ok(out.includes('shell.overlay'), 'kit 应占 shell.overlay');
  // chrome：选择器管制 + 桌面画布
  assert.ok(out.includes('MC_MAP'), '应内联 MC_MAP 宿主选择器表');
  assert.ok(out.includes('data-mc-desk'), 'chrome.mount 应注入 data-mc-desk 桌面画布');
  assert.ok(out.includes('MC_MAP.mainColumnCell'), '主窗投影应落在网格格位(MC_MAP.mainColumnCell 插值)');
  assert.ok(out.includes('var(--mc-shadow-win)'), '主窗格位应套实心硬投影 --mc-shadow-win');
  // 插值是运行期的：静态产物只需证明接线（模板引用 MC_MAP.scrollport + 目标底色存在）
  assert.ok(out.includes('MC_MAP.scrollport'), 'chrome css 应经 MC_MAP.scrollport 插值');
  assert.ok(out.includes('var(--mc-rail-1)'), '滚动口应染侧栏同底 --mc-rail-1');
  // 动画纪律：全 css 无 hover 态、无 transition 声明（豁免媒体查询里的 transition-duration 除外）
  // 切片须覆盖全部模块 CSS：从模块区真正开始（const McTokens = {）到 apply 样板（return (function(){）之前
  const cssStart = out.indexOf('const McTokens = {');
  const cssEnd = out.indexOf('return (function(){');
  assert.ok(cssStart >= 0, '应找到模块 CSS 起点 const McTokens = {');
  assert.ok(cssEnd > cssStart, '应找到 apply 样板起点 return (function(){');
  const cssChunk = out.slice(cssStart, cssEnd);
  // 剥注释（照 audit.mjs 保守规则：base64/url( 行不剥 //，避免误伤 data-URI）
  const cssScan = cssChunk
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .map((line) => (/base64|url\(/.test(line) ? line : line.replace(/(^|[^:])\/\/.*$/, '$1')))
    .join('\n');
  assert.ok(!/:hover\b/.test(cssScan), '全主题不得出现 :hover');
  // 豁免与 audit §1 同规则：纯压平声明 transition:none(!important) 先剥；reduced-motion 块内的
  // transition-duration:.01ms!important 属压平关闭过渡，整行剥除后再扫。
  const flat = cssScan
    .replace(/transition\s*:\s*none(\s*!important)?(?=[;}'"}\s]|$)/g, 'FLAT')
    .split('\n').filter((l) => !/transition-duration\s*:\s*\.01ms!important/.test(l)).join('\n');
  assert.ok(!/(?<!-)transition\s*:/.test(flat), '全主题不得出现 transition 声明（豁免压平 none 与 .01ms）');
});

test('assemble 产出含侧栏 Finder 覆写与官方主题通道（轮6：去月牙钮）', () => {
  execFileSync(process.execPath, [path.join(ROOT, 'tools', 'assemble.mjs')], { cwd: ROOT });
  const out = require('node:fs').readFileSync(path.join(ROOT, 'dist', 'client-body.js'), 'utf8');
  // sidebar：经 MC_MAP 插值 + 真标题栏 + 官方折叠钮锚点
  assert.ok(out.includes('McSidebar'), '应装配 McSidebar 模块');
  assert.ok(out.includes('MC_MAP.sessionRow'), 'sidebar css 应经 MC_MAP.sessionRow 插值');
  assert.ok(out.includes('MC_MAP.sessionRowSelected'), '选中反色应经 MC_MAP.sessionRowSelected 插值');
  assert.ok(out.includes('MC_MAP.sidebar'), '侧栏列应经 MC_MAP.sidebar 插值');
  assert.ok(out.includes('MC_MAP.sidebarCollapseBtn'), '官方折叠钮应经 MC_MAP.sidebarCollapseBtn 插值');
  assert.ok(out.includes("var(--font-sb)"), '侧栏应使用 --font-sb 五族回退链');
  // 轮6：真 DOM 标题栏（.mc-titlebar / tclose）
  assert.ok(out.includes('mc-titlebar'), '应注入真 DOM 标题栏 .mc-titlebar');
  assert.ok(out.includes('mc-tclose'), '标题栏应有 tclose 折叠钮');
  assert.ok(out.includes('#i-close'), 'tclose 应使用 sprite i-close');
  // 轮6：主题走官方通道（body[data-ds-dark-theme] → html[data-theme]）
  assert.ok(out.includes('data-ds-dark-theme'), '主题应跟随官方 body[data-ds-dark-theme] 信号');
  assert.ok(out.includes('data-theme'), '应写 html[data-theme]');
  assert.ok(!out.includes('mc-theme-toggle'), '月牙钮席位注册应已删除');
  assert.ok(!out.includes('sidebar.footer.action'), '不应再占 sidebar.footer.action 席');
  assert.ok(!out.includes('切换深浅主题'), '月牙钮组件应已删除');
  // 轮6：折叠迷你态
  assert.ok(out.includes('mc-sb-mini'), 'McFinder 应有折叠迷你态 .mc-sb-mini');
  assert.ok(out.includes('props.wide === false'), '应以官方 wide:false 信号切换迷你形态');
});
