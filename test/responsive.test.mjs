// test/responsive.test.mjs —— 模块10 响应式：抽屉开合纯函数（TDD 先行）
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { loadSrc } from './load-src.mjs';
const { mcDrawerAction, mcDrawerMaskOn, mcDrawerEscAllowed } = loadSrc('src/conv/responsive.js');

test('mcDrawerAction: 折叠态→expand;展开态→collapse（官方折叠态为唯一真相源）', () => {
  assert.equal(mcDrawerAction(true), 'expand');
  assert.equal(mcDrawerAction(false), 'collapse');
});

test('mcDrawerMaskOn: 窄窗且展开→true;窄窗折叠/宽窗一律→false', () => {
  assert.equal(mcDrawerMaskOn(true, false), true);   // 窄+展开=抽屉在场
  assert.equal(mcDrawerMaskOn(true, true), false);   // 窄+折叠=rail 正常态
  assert.equal(mcDrawerMaskOn(false, false), false); // 宽+展开=桌面正常态
  assert.equal(mcDrawerMaskOn(false, true), false);
});

test('mcDrawerEscAllowed: 官方弹层或设置面板在场→让路(false)', () => {
  assert.equal(mcDrawerEscAllowed(false, false), true);
  assert.equal(mcDrawerEscAllowed(true, false), false);  // 模型菜单等 [role=menu]/[role=listbox]
  assert.equal(mcDrawerEscAllowed(false, true), false);  // 设置 dialog
  assert.equal(mcDrawerEscAllowed(true, true), false);
});
