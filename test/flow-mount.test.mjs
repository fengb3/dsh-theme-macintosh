// test/flow-mount.test.mjs — McFlow.mount 单测（T7：三拍 / 相位同步 / 存量不闪 / REDUCED / teardown）
// 镜像 src/conv/flow.js 逐字拷贝 + 尾部追加 McFlow 导出（镜像本体 CJS shim 不动，同 loadSrc
// 「内容逐字拷贝」纪律）；mount 的自由变量（MC_MAP/CLOCK/MutationObserver/document/window/Element）
// 经 globalThis 桩注入，测完还原——node --test 每文件独立进程，桩不外溢。
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(import.meta.url);
const tmp = mkdtempSync(join(tmpdir(), 'mc-flowmount-'));
// require 期 css IIFE 走 typeof MC_MAP 守卫返回 ''（此时 globalThis.MC_MAP 尚未注入）
// 验收六轮改版:flow 不再手抄 cardToggle/enterFlash,自由引用 lib accToggle/flashIn——
// 测试域照 client.js 拼接顺序前置 mcfx 源(其默认调度器闭包引用 CLOCK,桩注入后生效)
const flowSrc = readFileSync(join(ROOT, 'src/conv/flow.js'), 'utf8');
const mcfxSrc = readFileSync(join(ROOT, 'src/core/mcfx.js'), 'utf8');
writeFileSync(join(tmp, 'flow-mount.cjs'), mcfxSrc + '\n' + flowSrc + '\nmodule.exports.McFlow = McFlow;\n');
const { McFlow, MC_FLOW_ICONS } = req(join(tmp, 'flow-mount.cjs'));

// —— 假 CLOCK：next 入队 + flush 同步跑一拍；syncAnim 记录；clear 与真实现同语义（句柄闭包注销）——
function fakeClock() {
  const jobs = [];
  const synced = [];
  return {
    PULSE: 2600, SWEEP: 1000, synced,
    next(fn, ms) {
      const j = { fn, ms };
      jobs.push(j);
      return () => { const i = jobs.indexOf(j); if (i >= 0) jobs.splice(i, 1); };
    },
    clear(h) { if (typeof h === 'function') { try { h(); } catch (e) { /* 忽略 */ } } },
    syncAnim(el, period, prop) { synced.push({ el, period, prop }); },
    flush() { const due = jobs.splice(0); for (const j of due) j.fn(); },
    pending: () => jobs.length,
  };
}

// —— 假 Element：matches 按种子属性映射 MC_MAP 三键选择器；classList 走 Set；
// closest 沿 parent 链上溯（lineFlash 摘要锚/running 卡复合选择器两形态；
// 验收二轮⑥：head/card 复合选择器亦可种子命中,addEventListener 捕获注册可查）——
class FakeElement {
  constructor(opts = {}) {
    this.attrs = opts.attrs || {};
    this.isStatusInColumn = !!opts.isStatusInColumn;
    this.qsa = opts.qsa || {};
    this.isConnected = true;
    this.parent = opts.parent || null;
    this.compound = opts.compound || []; // 验收二轮⑥:closest 可命中的复合选择器种子
    this.listeners = [];
    this.dataset = {}; // 验收二轮⑥:cardToggle busy 标记
    this.style = {};   // 验收二轮⑥:拍2 清残高
    this._text = opts.text || ''; // 验收三轮②:摘要 span textContent 冻结/回写
    const classes = new Set();
    this.classes = classes;
    this.classList = {
      add: (...a) => a.forEach((c) => classes.add(c)),
      remove: (...a) => a.forEach((c) => classes.delete(c)),
      contains: (c) => classes.has(c),
    };
  }
  get textContent() { return this._text; }
  set textContent(v) { this._text = String(v); }
  matches(sel) {
    if (sel === '[data-chat-flow-kind]') return 'data-chat-flow-kind' in this.attrs;
    if (sel === '[data-chat-flow-kind="model-retry"]') return this.attrs['data-chat-flow-kind'] === 'model-retry';
    if (sel === '[data-chat-flow] [role="status"]') return this.isStatusInColumn;
    return false;
  }
  matchesCompound(sel) {
    if (sel === '[data-follow-end]') return 'data-follow-end' in this.attrs;
    if (sel === '[data-variant="think"][data-state="running"]')
      return this.attrs['data-variant'] === 'think' && this.attrs['data-state'] === 'running';
    return this.compound.includes(sel);
  }
  closest(sel) {
    for (let el = this; el; el = el.parent) if (el.matchesCompound(sel)) return el;
    return null;
  }
  querySelectorAll(sel) { return this.qsa[sel] || []; }
  addEventListener(type, fn, capture) { this.listeners.push({ type, fn, capture }); }
  removeEventListener(type, fn, capture) {
    const i = this.listeners.findIndex((l) => l.type === type && l.fn === fn && l.capture === capture);
    if (i >= 0) this.listeners.splice(i, 1);
  }
}

// —— 假 MutationObserver：记录实例/挂载点/observe 配置，cb 由测试手动驱动 ——
class FakeMO {
  constructor(cb) { this.cb = cb; this.observed = null; this.opts = null; this.disconnects = 0; FakeMO.last = this; }
  observe(root, opts) { this.observed = root; this.opts = opts; }
  disconnect() { this.disconnects++; }
}

// —— globalThis 桩：注入/还原（原值为 undefined 的删属性还原）——
const G = globalThis;
const saved = new Map();
function setStub(name, value) { saved.set(name, G[name]); G[name] = value; }
function restoreStubs() {
  for (const [k, v] of saved) { if (v === undefined) delete G[k]; else G[k] = v; }
  saved.clear();
}
beforeEach(() => { FakeMO.last = null; });
afterEach(restoreStubs);

// 标准桩环境：MC_MAP 四键（statusRow 供 SYNC[1] 组合选择器） + 假 CLOCK + document/window 可控
function stubEnv(clock, { reduced = false, columnReady = false, column = null } = {}) {
  setStub('MC_MAP', {
    flowItem: '[data-chat-flow-kind]',
    flowColumn: '[data-chat-flow]',
    kindModelRetry: '[data-chat-flow-kind="model-retry"]',
    statusRow: '[role="status"]',
  });
  setStub('CLOCK', clock);
  setStub('MutationObserver', FakeMO);
  setStub('Element', FakeElement);
  setStub('document', {
    querySelector: (sel) => (sel === '[data-chat-flow]' && columnReady ? column : null),
    body: column || null, // 验收三轮⑥:attach 绑 document.body(列节点会话切换会被替换)
  });
  setStub('window', { matchMedia: () => ({ matches: reduced }) });
}

test('镜像加载：css 空串（MC_MAP 缺席守卫）+ MC_FLOW_ICONS shim 照常', () => {
  assert.equal(McFlow.css, '');
  assert.ok(MC_FLOW_ICONS && MC_FLOW_ICONS.compaction === 'copy');
});

test('mount 主线：轮询晚挂载→存量不闪→新行三拍(mcfx 同伴零残留)→retry/status 相位同步→teardown', () => {
  const clock = fakeClock();
  const oldRow = new FakeElement({ attrs: { 'data-chat-flow-kind': 'assistant-step' } });
  const column = new FakeElement({ qsa: { '[data-chat-flow-kind]': [oldRow] } }); // 存量一行
  let ready = false;
  stubEnv(clock, { column });
  // document 桩改用可变 ready 闭包：轮询第二拍才见列（模拟 flowColumn 晚挂载）
  G.document = { querySelector: (sel) => (sel === '[data-chat-flow]' && ready ? column : null), body: column };

  const td = McFlow.mount({});
  assert.equal(typeof td, 'function', 'mount 应返回 teardown 函数（验证⑤-1）');
  assert.equal(clock.pending(), 1, 'mount 即排首轮 poll（400ms）');
  clock.flush(); // poll#1：列未现 → 重排
  assert.equal(clock.pending(), 1, '未挂上应继续轮询');
  ready = true;
  clock.flush(); // poll#2：attach
  const mo = FakeMO.last;
  assert.ok(mo, 'attach 应建 MutationObserver');
  assert.equal(mo.observed, column, 'observer 应挂在 flowColumn 上');
  assert.deepEqual(mo.opts, { childList: true, subtree: true }, 'childList+subtree(验收四轮:characterData 观察随 think 重写退役)');
  assert.equal(clock.pending(), 0, '挂上后不再轮询');

  // 存量/已见行：宿主再次挂入（如懒加载补挂）不得闪
  mo.cb([{ addedNodes: [oldRow] }]);
  assert.equal(oldRow.classes.size, 0, 'attach 标记过的存量行不得加闪烁类（验证③）');

  // 新 assistant-step 行:三拍 ghost → flash → 撤净(mcfx 同伴,拍2 连撤)
  const stepRow = new FakeElement({ attrs: { 'data-chat-flow-kind': 'assistant-step' } });
  mo.cb([{ addedNodes: [stepRow] }]);
  assert.ok(stepRow.classList.contains('mcfx') && stepRow.classList.contains('mc-ghost'), '拍0：mcfx+mc-ghost');
  clock.flush();
  assert.ok(stepRow.classList.contains('mc-flash') && !stepRow.classList.contains('mc-ghost'), '拍1：换 mc-flash');
  clock.flush();
  assert.equal(stepRow.classes.size, 0, '拍2：mc-flash/mcfx 全撤净（零残留）');
  assert.equal(clock.pending(), 0);

  // 验收六轮②:user/steering 行由 McUserNodeView 气泡自带 flashIn——观察器跳过整行闪
  const FakeEl2 = class extends FakeElement {
    getAttribute(n) { return this.attrs[n] !== undefined ? String(this.attrs[n]) : null; }
  };
  const userRow = new FakeEl2({ attrs: { 'data-chat-flow-kind': 'user' } });
  const steerRow = new FakeEl2({ attrs: { 'data-chat-flow-kind': 'steering' } });
  mo.cb([{ addedNodes: [userRow, steerRow] }]);
  assert.equal(userRow.classes.size, 0, 'user 行不吃整行三拍');
  assert.equal(steerRow.classes.size, 0, 'steering 行不吃整行三拍');

  // retry 行：SYNC[0] 负延迟注入（kindModelRetry）
  const retryRow = new FakeElement({ attrs: { 'data-chat-flow-kind': 'model-retry' } });
  mo.cb([{ addedNodes: [retryRow] }]);
  const s0 = clock.synced.find((s) => s.el === retryRow);
  assert.ok(s0 && s0.period === 2600 && s0.prop === '--pulse-delay', 'retry 行应注入 PULSE 相位');

  // status 行（flowColumn 直接子节点、非 flowItem）：经 enter 顶层 syncEl 命中 SYNC[1]
  const statusRow = new FakeElement({ isStatusInColumn: true });
  mo.cb([{ addedNodes: [statusRow] }]);
  const s1 = clock.synced.find((s) => s.el === statusRow);
  assert.ok(s1 && s1.period === 2600 && s1.prop === '--pulse-delay', 'status 行（非 flowItem）也应相位同步（验证②）');
  assert.equal(statusRow.classes.size, 0, 'status 非 flowItem，不吃三拍');

  td();
  assert.equal(mo.disconnects, 1, 'teardown 应 disconnect observer（验证⑤-2）');
  assert.doesNotThrow(() => td(), 'teardown 幂等');
});

test('teardown 注销未决轮询句柄（走 CLOCK.clear）', () => {
  const clock = fakeClock();
  stubEnv(clock, { columnReady: false, column: null });
  const td = McFlow.mount({});
  clock.flush(); // poll#1：列始终不现 → 重排（未决）
  assert.equal(clock.pending(), 1);
  td();
  assert.equal(clock.pending(), 0, 'clear 应撤掉未决 poll 句柄');
  assert.ok(!FakeMO.last, '从未 attach，不应建 observer');
});

test('REDUCED：新行零闪烁类，相位同步照常（验证④逻辑）', () => {
  const clock = fakeClock();
  const column = new FakeElement({});
  stubEnv(clock, { reduced: true, columnReady: true, column });
  const td = McFlow.mount({});
  clock.flush(); // poll → 立即 attach
  const mo = FakeMO.last;
  assert.ok(mo, '应已挂载');
  const row = new FakeElement({ attrs: { 'data-chat-flow-kind': 'user' } });
  const retry = new FakeElement({ attrs: { 'data-chat-flow-kind': 'model-retry' } });
  mo.cb([{ addedNodes: [row, retry] }]);
  assert.equal(row.classes.size, 0, 'REDUCED 不加闪烁类');
  clock.flush(); clock.flush();
  assert.equal(row.classes.size, 0, '后续拍也无类可撤（根本未排三拍）');
  assert.equal(clock.pending(), 0, 'enterFlash 未调度任何拍');
  assert.ok(clock.synced.some((s) => s.el === retry), '相位同步不受 REDUCED 门控');
  td();
});

test('无 MutationObserver 环境静默返回 null', () => {
  const clock = fakeClock();
  stubEnv(clock, {}); // 注：MutationObserver 桩覆写为 undefined（模拟缺席）
  G.MutationObserver = undefined;
  assert.strictEqual(McFlow.mount({}), null);
});

// —— 验收二轮⑥:折叠卡开合五拍(捕获 click 委托 → accToggle;四轮起 think 卡由 McThinkCard
//    自管,不在表内) ——
function stubToggleEnv(clock, opts = {}) {
  stubEnv(clock, { columnReady: true, column: new FakeElement({}), ...opts });
  G.MC_MAP.disclosureRow = '[data-disclosure-row]';
  G.MC_MAP.kindContext = '[data-chat-flow-kind="context"]';
  G.MC_MAP.kindCompaction = '[data-chat-flow-kind="compaction"]';
  G.MC_MAP.kindManualCompaction = '[data-chat-flow-kind="manual-compaction"]';
  G.MC_MAP.compactionDisclosure = '[data-compaction-disclosure]';
}
const CTX_HEAD = '[data-chat-flow-kind="context"] [data-disclosure-row]';
const CTX_CARD = '[data-chat-flow-kind="context"]';
const RETRY_HEAD = '[data-chat-flow-kind="model-retry"] summary';
const RETRY_CARD = '[data-chat-flow-kind="model-retry"]';
const COMP_HEAD = ':is([data-chat-flow-kind="compaction"],[data-chat-flow-kind="manual-compaction"]) button';
const COMP_CARD = ':is([data-chat-flow-kind="compaction"],[data-chat-flow-kind="manual-compaction"])';

test('⑥ 主线:attach 对 flowColumn 注册捕获 click;三卡头命中即对卡容器跑五拍(含 mcfx 撤净)', () => {
  const clock = fakeClock();
  stubToggleEnv(clock);
  const column = new FakeElement({});
  G.document = { querySelector: (sel) => (sel === '[data-chat-flow]' ? column : null), body: column };
  const td = McFlow.mount({});
  clock.flush(); // poll → attach
  const li = column.listeners.find((l) => l.type === 'click');
  assert.ok(li, 'flowColumn 上应注册 click 监听');
  assert.equal(li.capture, true, '捕获阶段(先于宿主 React onClick)');

  // context 卡:点击 disclosure 行 → 卡容器五拍(原型 accToggle 同款;busy 防重入)
  const ctxCard = new FakeElement({ compound: [CTX_CARD] });
  const ctxRow = new FakeElement({ compound: [CTX_HEAD], parent: ctxCard });
  li.fn({ target: ctxRow });
  assert.ok(ctxCard.classList.contains('mcfx') && ctxCard.classList.contains('mc-ghost'), '拍0:mcfx+mc-ghost');
  assert.equal(ctxCard.dataset.busy, '1', 'busy 防重入标记');
  li.fn({ target: ctxRow }); // busy 期间重入
  clock.flush(); // 拍1(t100):+flash,ghost 保留
  assert.ok(ctxCard.classList.contains('mc-flash') && ctxCard.classList.contains('mc-ghost'), '拍1:白块遮盖,内容仍隐');
  clock.flush(); // 拍2(t200):清残高+fn(被遮内容瞬变拍)
  clock.flush(); // 拍3(t300):flash+ghost+mcfx 同撤(揭开且显回,一步到位)
  assert.equal(ctxCard.classes.size, 0, '拍3:mc-flash/mc-ghost/mcfx 同撤净(零残留)');
  assert.equal(ctxCard.dataset.busy, '1', 'busy 未清(滞空拍守防重入)');
  clock.flush(); // 拍4(t400):什么都不动,只清 busy
  assert.equal(ctxCard.classes.size, 0, '拍4:滞空拍零类操作');
  assert.notEqual(ctxCard.dataset.busy, '1', 'busy 清除');
  assert.equal(clock.pending(), 0);

  // model-retry / compaction 两头逐一命中(拍0 即验,撤拍协议同上)
  const seen = [];
  const hit = (headSel, cardSel) => {
    const card = new FakeElement({ compound: [cardSel] });
    li.fn({ target: new FakeElement({ compound: [headSel], parent: card }) });
    assert.ok(card.classList.contains('mc-ghost'), headSel + ' 命中拍0');
    seen.push(card);
  };
  hit(RETRY_HEAD, RETRY_CARD);
  hit(COMP_HEAD, COMP_CARD);
  clock.flush(); clock.flush(); clock.flush(); clock.flush();
  for (const c of seen) assert.equal(c.classes.size, 0, '各卡撤净');

  // 非卡头点击(普通行/非 Element 目标):零触发
  const plain = new FakeElement({ attrs: { 'data-chat-flow-kind': 'user' } });
  li.fn({ target: plain });
  li.fn({ target: {} });
  assert.equal(plain.classes.size, 0, '非卡头零类');

  td();
  assert.equal(column.listeners.length, 0, 'teardown 注销 click 监听');
});

test('⑥ REDUCED:卡头点击零触发(开合交宿主,纯装饰拍跳过)', () => {
  const clock = fakeClock();
  stubToggleEnv(clock, { reduced: true });
  const column = new FakeElement({});
  G.document = { querySelector: (sel) => (sel === '[data-chat-flow]' ? column : null), body: column };
  const td = McFlow.mount({});
  clock.flush();
  const li = column.listeners.find((l) => l.type === 'click');
  assert.ok(li, '监听仍注册(轻量早退)');
  const card = new FakeElement({ compound: [CTX_CARD] });
  li.fn({ target: new FakeElement({ compound: [CTX_HEAD], parent: card }) });
  assert.equal(card.classes.size, 0, 'REDUCED 不跑五拍');
  assert.equal(clock.pending(), 0, '未调度任何拍');
  td();
});
