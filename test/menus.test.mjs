// test/menus.test.mjs
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { loadSrc } from './load-src.mjs';
const { mcMenuItems, mcMenuAlign, mcMenuState } = loadSrc('src/conv/overlays.js');

const DEF = { items: [
  { id: 'rename', label: '重命名' },
  { sep: true },
  { id: 'archive', label: '归档' },
  { id: 'delete', label: '删除', danger: true },
] };

test('mcMenuItems: 无接线的项被滤除,sep 恒保留', () => {
  assert.deepEqual(mcMenuItems(DEF, { rename: function () {}, delete: function () {} }).map((i) => i.id || 'sep'),
    ['rename', 'sep', 'delete']); // archive 无接线 → 不出现
  assert.deepEqual(mcMenuItems(DEF, {}).length, 1); // 只剩 sep
});

test('mcMenuAlign: 右缘溢出翻转', () => {
  assert.equal(mcMenuAlign({ left: 100, right: 200 }, 1440, 210), 'left');   // 常规左对齐
  assert.equal(mcMenuAlign({ left: 1300, right: 1420 }, 1440, 210), 'right'); // 溢出 → 右对齐
  assert.equal(mcMenuAlign(null, 1440, 210), 'left'); // 无锚（宿主钮失配等）→ 安全回退左对齐
});

test('mcMenuState: 单例互斥 + esc/外点/pick 关闭', () => {
  const s1 = mcMenuState({ open: null }, { t: 'open', id: 'sess', anchor: { left: 0 } });
  assert.equal(s1.open.id, 'sess');
  const s2 = mcMenuState(s1, { t: 'open', id: 'group', anchor: { left: 0 } });
  assert.equal(s2.open.id, 'group'); // 互斥:换开
  for (const t of ['close', 'esc', 'pick']) assert.equal(mcMenuState(s2, { t }).open, null);
  assert.deepEqual(mcMenuState({ open: null }, { t: 'esc' }), { open: null }); // 关空态无害
});
