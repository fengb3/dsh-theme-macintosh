// test/dock.test.mjs
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { loadSrc } from './load-src.mjs';
const { mcDockState, mcTodoSegments, mcTodoMeta, mcCtxArc, mcMirrorValue } = loadSrc('src/conv/dock.js');

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
