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

  // 验收七轮:model-retry 行已重绘(McSysCard 自有八角点相位)——观察器只供给行级三拍出场
  const retryRow = new FakeEl2({ attrs: { 'data-chat-flow-kind': 'model-retry' } });
  mo.cb([{ addedNodes: [retryRow] }]);
  assert.ok(retryRow.classList.contains('mcfx') && retryRow.classList.contains('mc-ghost'), 'retry 行拍0:mcfx+mc-ghost(出场三拍)');
  assert.equal(clock.synced.filter((s) => s.el === retryRow).length, 0, 'retry 行不再走观察器 SYNC(组件内自管相位)');
  clock.flush(); clock.flush();
  assert.equal(retryRow.classes.size, 0, 'retry 行拍2 撤净');

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
  assert.equal(retry.classes.size, 0, 'REDUCED 重试行同样零类');
  clock.flush(); clock.flush();
  assert.equal(row.classes.size, 0, '后续拍也无类可撤（根本未排三拍）');
  assert.equal(clock.pending(), 0, 'enterFlash 未调度任何拍');
  td();
});

test('无 MutationObserver 环境静默返回 null', () => {
  const clock = fakeClock();
  stubEnv(clock, {}); // 注：MutationObserver 桩覆写为 undefined（模拟缺席）
  G.MutationObserver = undefined;
  assert.strictEqual(McFlow.mount({}), null);
});

// —— 验收七轮:卡头 click 委托整体退役(context/model-retry/双 compaction 四卡由 McSysCard
//    重绘自管开合,think 四轮起自管)——attach 后不得再注册任何 click 监听 ——
test('⑦ 卡头委托退役:attach 零 click 监听(四卡开合由 McSysCard 组件内 accToggle 自管)', () => {
  const clock = fakeClock();
  stubEnv(clock, { columnReady: true, column: new FakeElement({}) });
  const column = new FakeElement({});
  G.document = { querySelector: (sel) => (sel === '[data-chat-flow]' ? column : null), body: column };
  const td = McFlow.mount({});
  clock.flush(); // poll → attach
  const li = column.listeners.find((l) => l.type === 'click');
  assert.equal(li, undefined, '七轮起不再注册卡头捕获 click(McSysCard 重绘接管)');
  td();
});
