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
  assert.ok(!/\bimport\b|\brequire\b/.test(out), 'client-body.js 不得含 import/require');
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
  for (const tok of ['--mc-desktop-pattern', '--mc-shadow-panel', '--mc-shadow-pop', '--mc-shadow-field',
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
  // 动画纪律：全 css 无 hover 态、无 transition 声明（豁免媒体查询里的 transition-duration 除外）
  const cssStart = out.indexOf('data-mc-root');
  const cssChunk = out.slice(cssStart);
  assert.ok(!/:hover\b/.test(cssChunk), '全主题不得出现 :hover');
  assert.ok(!/(?<!-)transition\s*:/.test(cssChunk), '全主题不得出现 transition 声明');
});
