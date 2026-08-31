// test/mcfx.test.mjs — esc 纯函数 + 三拍/四拍时序（假 CLOCK 注入 + 假 el）
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadSrc } from './load-src.mjs';

const { esc, flashIn, flashOut, accToggle, __setSchedulerForTest } = loadSrc('src/core/mcfx.js');

// 假调度器：收集 (fn, ms)，flush() 按入队顺序同步执行一拍
function makeFakeClock() {
  const calls = [];
  const queue = [];
  return {
    calls,
    flush() { const q = queue.splice(0); for (const j of q) j.fn(); },
    pending: () => queue.length,
    schedule(fn, ms) { calls.push(ms); queue.push({ fn, ms }); },
  };
}

// 假 DOM 元素：classList 记录到 Set，dataset/style 为空对象
function fakeEl() {
  const classes = new Set();
  return {
    classes,
    classList: {
      add(...a) { a.forEach((c) => classes.add(c)); },
      remove(...a) { a.forEach((c) => classes.delete(c)); },
      contains(c) { return classes.has(c); },
    },
    dataset: {},
    style: {},
    isConnected: true,
  };
}

let clock;
beforeEach(() => { clock = makeFakeClock(); __setSchedulerForTest(clock.schedule); });

test('esc 转义四种字符（& 最先）', () => {
  assert.equal(esc('<a href="x">&'), '&lt;a href=&quot;x&quot;&gt;&amp;');
  assert.equal(esc('&lt;'), '&amp;lt;'); // & 先于其它，防止双重转义漏网
  assert.equal(esc('plain 中文 ✓'), 'plain 中文 ✓');
});

test('flashIn 三拍（原型 §909-918）：ghost+show 同拍0 → flash(撤 ghost) 拍1 → 撤净拍2，各 100ms', () => {
  const el = fakeEl();
  let shown = 0;
  flashIn(el, () => { shown++; });
  // 拍0：同步加 mcfx+mc-ghost，内容在遮罩下瞬换
  assert.equal(shown, 1);
  assert.ok(el.classList.contains('mcfx'));
  assert.ok(el.classList.contains('mc-ghost'));
  assert.ok(!el.classList.contains('mc-flash'));
  // 拍1：换 mc-flash（::after 覆盖遮罩），ghost 同拍撤（白块已全遮，等价显现）
  clock.flush();
  assert.equal(shown, 1);
  assert.ok(!el.classList.contains('mc-ghost'));
  assert.ok(el.classList.contains('mc-flash'));
  // 拍2：撤净（含 mcfx，零残留）
  clock.flush();
  assert.equal(shown, 1);
  assert.ok(!el.classList.contains('mc-flash'));
  assert.ok(!el.classList.contains('mc-ghost'));
  assert.ok(!el.classList.contains('mcfx'));
  assert.equal(clock.pending(), 0);
  assert.deepEqual(clock.calls, [100, 100]);
});

test('flashOut 镜像：flash → hide+撤净(含 mcfx) → 完', () => {
  const el = fakeEl();
  let hidden = 0;
  flashOut(el, () => { hidden++; });
  assert.ok(el.classList.contains('mc-flash'));
  assert.ok(!el.classList.contains('mc-ghost'));
  clock.flush();
  assert.equal(hidden, 1);
  assert.ok(!el.classList.contains('mc-flash'));
  assert.ok(!el.classList.contains('mc-ghost'));
  assert.ok(!el.classList.contains('mcfx'));
  assert.equal(clock.pending(), 0);
  assert.deepEqual(clock.calls, [100]);
});

test('flashIn 拍0 后断连则后续拍停走（类残留在已销毁元素上无害）', () => {
  const el = fakeEl();
  let shown = 0;
  flashIn(el, () => { shown++; });
  assert.equal(shown, 1); // 拍0 已瞬换
  el.isConnected = false;
  clock.flush();
  assert.ok(!el.classList.contains('mc-flash'), '断连后不再加 flash');
  assert.equal(clock.pending(), 0, 'beat1 早退 return，嵌套拍2 未再调度');
  clock.flush();
  assert.equal(clock.pending(), 0);
});

test('flashIn 回调抛错不向外传播（每拍 try/catch）', () => {
  const el = fakeEl();
  flashIn(el, () => { throw new Error('boom'); });
  assert.doesNotThrow(() => clock.flush());
});

test('accToggle 五拍(八轮回退并拍)：ghost → flash+清残高(白块先绘制一拍) → fn(白块遮下瞬变) → 同撤 flash+ghost+mcfx → 滞空拍只清 busy', () => {
  const card = fakeEl();
  card.style.height = '123px'; // 残高
  let fnArgs = 0;
  let heightAtFn = null;
  accToggle(card, () => { fnArgs++; heightAtFn = card.style.height; });
  // 拍0：busy + ghost（整卡透明）
  assert.equal(card.dataset.busy, '1');
  assert.ok(card.classList.contains('mc-ghost'));
  assert.ok(!card.classList.contains('mc-flash'));
  clock.flush(); // 拍1(t100)：+flash 盖白块 + 清残高——本拍不跑 fn（白块须先绘制一拍，
  // 否则 React setState 重渲染重写 className 会在绘制前擦掉 mcfx/mc-flash → 白遮罩消失）
  assert.ok(card.classList.contains('mc-flash'));
  assert.ok(card.classList.contains('mc-ghost'), 'ghost 保留到拍3');
  assert.equal(fnArgs, 0, 'fn 未提前（八轮回退并拍）');
  assert.ok(!card.style.height, '拍1 已清 inline height');
  clock.flush(); // 拍2(t200)：fn（白块遮盖下瞬变被遮内容）
  assert.equal(fnArgs, 1);
  assert.ok(!heightAtFn, 'fn 前已清 inline height'); // '' 即已清（真实 DOM 同款）
  clock.flush(); // 拍3(t300)：flash+ghost+mcfx 同时撤（揭开且显回，一步到位；React 若已在拍2擦类则幂等无害）
  assert.ok(!card.classList.contains('mc-flash'));
  assert.ok(!card.classList.contains('mc-ghost'));
  assert.ok(!card.classList.contains('mcfx'), 'mcfx 连撤零残留');
  assert.equal(card.dataset.busy, '1', 'busy 未清');
  clock.flush(); // 拍4(t400)：什么都不动（滞空拍），只清 busy
  assert.ok(!card.classList.contains('mc-flash'));
  assert.ok(!card.classList.contains('mc-ghost'));
  assert.equal(card.dataset.busy, undefined);
  assert.deepEqual(clock.calls, [100, 100, 100, 100]);
});

test('accToggle busy 期间重入直接拒绝', () => {
  const card = fakeEl();
  let n = 0;
  accToggle(card, () => { n++; });
  accToggle(card, () => { n += 10; }); // 应被 busy 挡下
  clock.flush(); clock.flush(); clock.flush(); clock.flush();
  assert.equal(n, 1);
  // busy 已清，再次可用
  accToggle(card, () => { n += 100; });
  clock.flush(); clock.flush(); clock.flush(); clock.flush();
  assert.equal(n, 101);
});

test('accToggle 中途断连清 busy 不再执行 fn', () => {
  const card = fakeEl();
  let n = 0;
  accToggle(card, () => { n++; });
  card.isConnected = false;
  clock.flush();
  assert.equal(n, 0);
  assert.equal(card.dataset.busy, undefined);
});
