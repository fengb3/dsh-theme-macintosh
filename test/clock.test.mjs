// test/clock.test.mjs — CLOCK 纯函数量化逻辑（模块文件无 ESM export，走 createRequire）
//   + clear 句柄注销集成用例（T7：真 100ms 栅格分发定时器，Node globalThis.setInterval）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSrc } from './load-src.mjs';

const { computeNext } = loadSrc('src/core/clock.js');

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

test('CLOCK.clear 注销 next 句柄：到期不再分发；幂等；dispose 后无害 no-op（T7）', async () => {
  const { McClock, __clockForTest } = loadSrc('src/core/clock.js');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const td = McClock.mount();
  let h = null;
  try {
    const c = __clockForTest();
    assert.ok(c, 'mount 后 __clockForTest 应取到实例');
    assert.equal(typeof c.clear, 'function', 'clock 实例应有 clear API');
    let fired = 0;
    h = c.next(() => { fired++; }, 50);
    c.clear(h);
    c.clear(h);      // 幂等：重复注销不抛
    c.clear(null);   // 非句柄入参静默忽略
    // 50ms 作业量化后 ≤150ms 到期 + 100ms 分发栅格，400ms 观察窗足够宽
    await sleep(400);
    assert.equal(fired, 0, '已 clear 的作业不得分发');
    let fired2 = 0;
    c.next(() => { fired2++; }, 50); // 对照组：未 clear 照常分发
    await sleep(400);
    assert.equal(fired2, 1, '对照组作业应照常分发恰好一次');
    td(); // dispose：清分发定时器 + 队列
    assert.equal(__clockForTest(), null, 'dispose 后模块单例复位');
    assert.doesNotThrow(() => c.clear(h), 'dispose 后 clear 旧句柄为无害 no-op');
  } finally {
    td(); // 幂等兜底：断言中途失败也不泄漏分发定时器
  }
});
