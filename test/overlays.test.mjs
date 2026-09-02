// test/overlays.test.mjs — overlays 批2 纯函数(验收裁定轮 2026-09-03 改版:hero 构图砍成
// mark+title 两件,标题 i18n 双语 zh/en + mcHeroTitle 纯函数;badge/sub 字段随裁定退役)
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { loadSrc } from './load-src.mjs';
const { mcHeroAction, MC_HERO_COPY, mcHeroTitle } = loadSrc('src/conv/overlays.js');

test('mcHeroAction: 仅 hero 相挂载,active/settling/缺相一律摘除', () => {
  assert.equal(mcHeroAction('hero'), 'mount');
  assert.equal(mcHeroAction('active'), 'unmount');
  assert.equal(mcHeroAction('settling'), 'unmount');
  assert.equal(mcHeroAction(null), 'unmount');
  assert.equal(mcHeroAction(undefined), 'unmount');
});

test('MC_HERO_COPY: zh/en 双语标题——badge/sub/title/titleEm 字段全部退役(裁定:hero=mark+title)', () => {
  assert.equal(MC_HERO_COPY.zh, '探索未知之境');
  assert.equal(MC_HERO_COPY.en, 'Think Classic');
  assert.ok(!('badge' in MC_HERO_COPY), 'badge 字段应已裁除');
  assert.ok(!('sub' in MC_HERO_COPY), 'sub 字段应已裁除');
  assert.ok(!('title' in MC_HERO_COPY), '单语 title 字段应已裁除(改 zh/en 双语)');
  assert.ok(!('titleEm' in MC_HERO_COPY), 'titleEm 字段应已裁除');
});

test('mcHeroTitle: lang 前缀 zh → 中文题,其余 → en slogan(Think Classic);空值/异域回退 en', () => {
  assert.equal(mcHeroTitle('zh'), '探索未知之境');
  assert.equal(mcHeroTitle('zh-CN'), '探索未知之境');
  assert.equal(mcHeroTitle('zh-TW'), '探索未知之境');
  assert.equal(mcHeroTitle('en-US'), 'Think Classic');
  assert.equal(mcHeroTitle('en'), 'Think Classic');
  assert.equal(mcHeroTitle('ja-JP'), 'Think Classic');
  assert.equal(mcHeroTitle('de'), 'Think Classic');
  assert.equal(mcHeroTitle(''), 'Think Classic');
  assert.equal(mcHeroTitle(null), 'Think Classic');
  assert.equal(mcHeroTitle(undefined), 'Think Classic');
});
