// test/overlays.test.mjs — overlays 批2 纯函数
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { loadSrc } from './load-src.mjs';
const { mcHeroAction, MC_HERO_COPY } = loadSrc('src/conv/overlays.js');

test('mcHeroAction: 仅 hero 相挂载,active/settling/缺相一律摘除', () => {
  assert.equal(mcHeroAction('hero'), 'mount');
  assert.equal(mcHeroAction('active'), 'unmount');
  assert.equal(mcHeroAction('settling'), 'unmount');
  assert.equal(mcHeroAction(null), 'unmount');
  assert.equal(mcHeroAction(undefined), 'unmount');
});

test('MC_HERO_COPY: 文案沿原型字面(spec §0 裁定5)', () => {
  assert.equal(MC_HERO_COPY.title, 'Think Classic,跑点什么。');
  assert.equal(MC_HERO_COPY.titleEm, 'Classic');
  assert.equal(MC_HERO_COPY.badge, 'MACINTOSH · System 7 复古主题');
  assert.equal(MC_HERO_COPY.sub, '经典麦金塔工作区:白窗黑线、条纹标题栏、Finder 会话树。');
});
