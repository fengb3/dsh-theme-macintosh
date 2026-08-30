// test/clock.test.mjs — CLOCK 纯函数量化逻辑（模块文件无 ESM export，走 createRequire）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { computeNext } = require('../src/core/clock.js');

test('computeNext 量化到最近栅格沿(向上)', () => {
  assert.equal(computeNext(1000, 1050, 100), 1100); // now=1000,ms=50 → ≥1050 的沿
  assert.equal(computeNext(1000, 1010, 100), 1100);
  assert.equal(computeNext(1000, 900, 100), 1000);  // 已在下个沿前
});

test('computeNext 边界：+1 保证严格 ≥ 目标时刻', () => {
  // at=1100 整：at+1=1101 → ceil(11.01)=12 → 1200（恰在沿上推到下一沿）
  assert.equal(computeNext(1000, 1100, 100), 1200);
  // at+1 恰好落在沿上：1099+1=1100 → ceil(11)=11 → 1100
  assert.equal(computeNext(1000, 1099, 100), 1100);
  // at 早于 now 也照量化，不回拨
  assert.equal(computeNext(1000, 999, 100), 1000);
});
