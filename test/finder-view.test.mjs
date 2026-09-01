// test/finder-view.test.mjs — 视图选项遵从(轮5终):分组/排序纯函数
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { loadSrc } from './load-src.mjs';
const { mcViewPrefs, mcViewSortSessions, mcFinderGroups } = loadSrc('src/finder.js');

const mkList = (ids, byId) => ({ current: null, ids, byId });
const S = (id, updatedAt, extra) => Object.assign({ id, displayTitle: id, updatedAt }, extra || {});

test('mcViewPrefs: localStorage 缺席→null(降级默认态)', () => {
  assert.equal(mcViewPrefs(), null);
});

test('mcViewSortSessions: manual=账号序,缺席垫底原序', () => {
  const arr = [S('a'), S('b'), S('c')];
  const prefs = { orderBy: 'manual', sessionOrderByAccount: { ws1: ['c', 'a'] } };
  assert.deepEqual(mcViewSortSessions(arr, 'ws1', prefs).map(s => s.id), ['c', 'a', 'b']);
});

test('mcViewSortSessions: updated=updatedAt 降序,store 时间戳优先', () => {
  const arr = [S('a', 100), S('b', 300), S('c', 200)];
  const prefs = { orderBy: 'updated', sessionUpdatedAtByAccount: { ws1: { a: 999 } } };
  assert.deepEqual(mcViewSortSessions(arr, 'ws1', prefs).map(s => s.id), ['a', 'b', 'c']);
});

test('mcViewSortSessions: 无 prefs=updated 默认', () => {
  const arr = [S('a', 100), S('b', 300)];
  assert.deepEqual(mcViewSortSessions(arr, 'ws1', null).map(s => s.id), ['b', 'a']);
});

test('mcFinderGroups: 默认按工作区分组+updated 降序', () => {
  const list = mkList(['a', 'b'], { a: S('a', 100), b: S('b', 300) });
  const ws = { items: [{ workspaceId: 'w1', title: 'W1', sessionIds: ['a', 'b'] }] };
  const g = mcFinderGroups(list, ws);
  assert.equal(g.length, 1);
  assert.equal(g[0].name, 'W1');
  assert.deepEqual(g[0].sessions.map(s => s.id), ['b', 'a']);
});

test('mcFinderGroups: subagent/archived/空散会话滤除;散会话归未分组', () => {
  const list = mkList(['a', 'x', 'y'], {
    a: S('a', 1), x: S('x', 2, { origin: 'subagent' }), y: S('y', 3),
  });
  const ws = { items: [{ workspaceId: 'w1', title: 'W1', sessionIds: ['a'] }], archivedSessionIds: [] };
  const g = mcFinderGroups(list, ws);
  assert.deepEqual(g.map(x => x.name), ['W1', '未分组']);
  assert.deepEqual(g[1].sessions.map(s => s.id), ['y']);
});
