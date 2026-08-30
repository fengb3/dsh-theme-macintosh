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
