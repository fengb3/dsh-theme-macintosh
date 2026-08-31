// test/think.test.mjs — mcThinkTick 纯函数(验收四轮:缓冲积攒 + 周期吐出)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSrc } from './load-src.mjs';

const { mcThinkTick } = loadSrc('src/conv/think.js');

test('首帧全量吐出(cap 截断)', () => {
  const r = mcThinkTick('', '一二三四五', 3);
  assert.deepEqual(r, { shown: '一二三', delta: '一二三', rewritten: false });
});

test('追加前缀相符:吐增量并按 cap 截断', () => {
  const r1 = mcThinkTick('abc', 'abcdef', 2);
  assert.deepEqual(r1, { shown: 'abcde', delta: 'de', rewritten: false });
  const r2 = mcThinkTick('abcde', 'abcdefg', 10);
  assert.deepEqual(r2, { shown: 'abcdefg', delta: 'fg', rewritten: false });
});

test('积攒大于 cap:分多周期吐,不丢字', () => {
  let shown = '', text = 'x'.repeat(350);
  for (let i = 0; i < 5; i++) shown = mcThinkTick(shown, text, 140).shown;
  assert.equal(shown, text, '五周期(140/拍)吐完 350 字');
});

test('宿主整段重写(前缀不符):从头再来并标记 rewritten', () => {
  const r = mcThinkTick('旧内容', '全新文本', 10);
  assert.deepEqual(r, { shown: '全新文本', delta: '全新文本', rewritten: true });
});

test('无新增:零增量', () => {
  const r = mcThinkTick('abc', 'abc', 10);
  assert.deepEqual(r, { shown: 'abc', delta: '', rewritten: false });
});
