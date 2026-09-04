// test/finder-view.test.mjs — 视图选项遵从(轮5终):分组/排序纯函数
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { loadSrc } from './load-src.mjs';
const { mcViewPrefs, mcViewSortSessions, mcFinderGroups, mcFinderFilter } = loadSrc('src/finder.js');

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

// —— 搜索过滤（内嵌搜索行批）：空词恒等；标题/分组名命中；空组滤除；命中行 xtra 摘除 ——
test('mcFinderFilter: 空词原样返回(恒等,不重建分组)', () => {
  const groups = [{ id: 'w1', name: 'W1', sessions: [{ id: 'a', title: 'A', status: 'wait', xtra: true }] }];
  assert.equal(mcFinderFilter(groups, ''), groups);
  assert.equal(mcFinderFilter(groups, '   '), groups); // 全空白词同空
});

test('mcFinderFilter: 标题子串命中(大小写不敏感),命中行 xtra 摘除', () => {
  const groups = [{ id: 'w1', name: 'W1', sessions: [
    { id: 'a', title: '修复侧边栏', status: 'done', xtra: false },
    { id: 'b', title: 'Pixel Icons', status: 'wait', xtra: true },
  ] }];
  const out = mcFinderFilter(groups, 'pixel');
  assert.deepEqual(out[0].sessions.map(s => s.id), ['b']);
  assert.equal(out[0].sessions[0].xtra, false); // 过滤态全量展示匹配行
});

test('mcFinderFilter: 分组名命中保留整组;零命中组滤除', () => {
  const groups = [
    { id: 'w1', name: 'Macintosh', sessions: [
      { id: 'a', title: '随便什么', status: 'wait', xtra: true },
      { id: 'b', title: '另一样', status: 'done', xtra: true },
    ] },
    { id: 'w2', name: 'Aurum', sessions: [{ id: 'c', title: 'Zzz', status: 'wait', xtra: false }] },
  ];
  const out = mcFinderFilter(groups, 'macint');
  assert.equal(out.length, 1);
  assert.deepEqual(out[0].sessions.map(s => s.id), ['a', 'b']); // 整组保留
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
