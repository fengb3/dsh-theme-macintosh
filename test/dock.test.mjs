// test/dock.test.mjs
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { loadSrc } from './load-src.mjs';
const { mcDockState, mcTodoSegments, mcTodoMeta, mcCtxArc, mcMirrorValue, mcQueueText, mcGoalCard } = loadSrc('src/conv/dock.js');

test('mcDockState: busy 最高优先;idle 按 has 分 ready/idle', () => {
  assert.deepEqual(mcDockState(null, { t: 'busy' }), { mode: 'busy', has: false });
  assert.deepEqual(mcDockState({ mode: 'busy', has: false }, { t: 'input', has: true }),
    { mode: 'busy', has: true }); // busy 中打字不改模式(仍 Stop)
  assert.deepEqual(mcDockState({ mode: 'busy', has: true }, { t: 'idle' }), { mode: 'idle', has: true });
  assert.deepEqual(mcDockState({ mode: 'idle', has: true }, { t: 'input', has: false }),
    { mode: 'idle', has: false });
  assert.deepEqual(mcDockState({ mode: 'idle', has: false }, { t: 'input', has: true }),
    { mode: 'ready', has: true });
});

test('mcDockState: 未知事件无害返回', () => {
  const s = { mode: 'ready', has: true };
  assert.equal(mcDockState(s, { t: 'nope' }), s);
  assert.equal(mcDockState(s, null), s);
});

test('mcTodoSegments: 首个未完成=now;空表安全', () => {
  const todos = [{ done: true }, { done: true }, { done: false }, { done: false }];
  assert.deepEqual(mcTodoSegments(todos), ['done', 'done', 'now', 'todo']);
  assert.deepEqual(mcTodoSegments([]), []);
  assert.deepEqual(mcTodoSegments(null), []);
  assert.deepEqual(mcTodoSegments([{ done: false }]), ['now']);
  assert.deepEqual(mcTodoSegments([{ done: true }, { done: true }]), ['done', 'done']); // 无 now 合法(全完成)
});

test('mcTodoMeta: done/total 计数', () => {
  assert.equal(mcTodoMeta([{ done: true }, { done: true }, { done: false }]), '2/3');
  assert.equal(mcTodoMeta(null), '0/0');
});

test('mcCtxArc: 周长 53.4 比例 + >80% hot;越界钳制', () => {
  assert.deepEqual(mcCtxArc(74), { dash: '39.5 53.4', hot: false });
  assert.deepEqual(mcCtxArc(100), { dash: '53.4 53.4', hot: true });
  assert.deepEqual(mcCtxArc(81), { dash: '43.3 53.4', hot: true });
  assert.deepEqual(mcCtxArc(-5), { dash: '0.0 53.4', hot: false });
  assert.deepEqual(mcCtxArc('x'), { dash: '0.0 53.4', hot: false });
});

test('mcMirrorValue: 正常桩镜像 true;异常桩 false(降级路径)', () => {
  const events = [];
  const okTa = { dispatchEvent: (e) => events.push(e.type) };
  assert.equal(mcMirrorValue(okTa, 'hi'), true);
  assert.deepEqual(events, ['input']);
  assert.equal(mcMirrorValue(null, 'hi'), false);
  assert.equal(mcMirrorValue({ dispatchEvent() { throw new Error('boom'); } }, 'hi'), false);
});

// —— furn 批(2026-09-02):status 形 segments / queue 文案 / goal 卡归一 ——
test('mcTodoSegments: status 形——in_progress 全标 now;零 in_progress 首未完成兜底', () => {
  assert.deepEqual(
    mcTodoSegments([
      { content: 'a', status: 'completed' },
      { content: 'b', status: 'in_progress' },
      { content: 'c', status: 'pending' },
      { content: 'd', status: 'in_progress' },
    ]),
    ['done', 'now', 'todo', 'now']); // 宿主允许多行并行 in_progress,全标 now
  assert.deepEqual(
    mcTodoSegments([{ content: 'a', status: 'pending' }, { content: 'b', status: 'pending' }]),
    ['now', 'todo']); // 零 in_progress → 首未完成兜底(原型语义)
  assert.deepEqual(
    mcTodoSegments([{ content: 'a', status: 'completed' }]),
    ['done']); // 全完成无 now 合法
  assert.deepEqual(mcTodoSegments([{ content: 'a', status: 'in_progress' }]), ['now']);
});

test('mcTodoMeta: status 形计数(completed=done)', () => {
  assert.equal(mcTodoMeta([{ content: 'a', status: 'completed' }, { content: 'b', status: 'pending' }]), '1/2');
  assert.equal(mcTodoMeta(null), '0/0');
});

test('mcQueueText: 仅计 queued;preview||text;空安全', () => {
  const q = (placement, preview, text) => ({ id: 'x', messageId: 'x', placement, content: [], preview, text });
  assert.equal(mcQueueText(null), null);
  assert.equal(mcQueueText([]), null);
  assert.equal(mcQueueText([q('steering', 's1', 's1')]), null); // steering 不计
  assert.equal(mcQueueText([q('queued', '第一条内容', '第一条内容')]),
    '队列中还有 1 条消息 — 第一条:第一条内容');
  assert.equal(mcQueueText([q('queued', '', '纯text回退'), q('context', 'c', 'c')]),
    '队列中还有 1 条消息 — 第一条:纯text回退');
  assert.equal(mcQueueText([q('queued', '甲', '甲'), q('queued', '', '乙')]),
    '队列中还有 2 条消息 — 第一条:甲');
});

test('mcGoalCard: complete/缺席→null;徽标与轮次', () => {
  const G = (phase, roundsStarted, maxGoalRounds, blockedReason) => ({
    goal: { id: 'g', revision: 1, objective: '完成主题', phase, maxGoalRounds, blockedReason },
    roundsStarted, createdAt: 0, updatedAt: 0,
  });
  assert.equal(mcGoalCard(null), null);
  assert.equal(mcGoalCard(undefined), null);
  assert.equal(mcGoalCard(G('complete', 3, 5)), null); // complete 不渲染(官方 GoalBar 同款)
  assert.deepEqual(mcGoalCard(G('active', 2, 5)),
    { text: '完成主题', phase: 'active', badge: '', rounds: '第 2/5 轮', why: '' });
  assert.deepEqual(mcGoalCard(G('paused', 1, 4)),
    { text: '完成主题', phase: 'paused', badge: '已暂停', rounds: '第 1/4 轮', why: '' });
  assert.deepEqual(mcGoalCard(G('blocked', 7, 7)),
    { text: '完成主题', phase: 'blocked', badge: '受阻', rounds: '第 7/7 轮', why: '' });
  assert.equal(mcGoalCard(G('blocked', 7, 7, { code: 'round-limit', message: '轮上限受阻' })).why, '轮上限受阻');
  assert.equal(mcGoalCard(G('active', 0, 5)).rounds, ''); // 未开跑无轮次
  assert.equal(mcGoalCard(G('active', 2, 0)).rounds, ''); // M 缺席无轮次
});
