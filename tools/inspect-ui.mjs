// throwaway 探针：截图 + 诊断主题注入效果（不经 cordis，直接执行 dist 函数体）
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';

const dist = readFileSync('dist/client-body.js', 'utf8');
mkdirSync('shots', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
await page.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: 'shots/before.png' });

// 以伪 ctx 执行插件（effect 记录 disposer；无 slots 服务 → 席位模块静默跳过）
await page.evaluate((src) => {
  const fakeCtx = { effect(fn) { return () => { try { const d = fn(); if (typeof d === 'function') d(); } catch (e) {} }; }, on() { return () => {}; } };
  try {
    const plugin = new Function(src)();
    plugin.apply(fakeCtx);
    window.__mcOk = true;
  } catch (e) { window.__mcErr = String(e && e.stack || e); }
}, dist);
await page.waitForTimeout(1500);
console.log('inject:', await page.evaluate(() => window.__mcErr || (window.__mcOk ? 'ok' : '???')));
await page.waitForTimeout(8000); // 等 CJK 字体（~14MB）加载
await page.screenshot({ path: 'shots/after.png' });
const fontDiag = await page.evaluate(() => {
  const probes = ['12px ChiKareGo', '12px "Fusion Pixel 12px monospaced"', '12px "Fusion Pixel 12px monospaced zh"', '12px FindersKeepers'];
  return probes.map((p) => p + ' => ' + document.fonts.check(p, 'A中'));
});

const diag = await page.evaluate(() => {
  const cs = getComputedStyle(document.body);
  const root = document.documentElement;
  const q = (s) => !!document.querySelector(s);
  const pick = (el) => {
    const c = getComputedStyle(el);
    return { bg: c.backgroundColor, color: c.color, font: c.fontFamily.slice(0, 40) };
  };
  const main = document.querySelector('div[data-phase]');
  const sidebar = document.querySelector('#root > div > div:first-child');
  return {
    hasRoot: q('style[data-mc-root]'),
    hasSprite: q('svg[data-mc-sprite]'),
    hasDesk: q('[data-mc-desk]'),
    bodyAttr: { dsDark: document.body.hasAttribute('data-ds-dark-theme'), htmlTheme: root.getAttribute('data-theme') },
    tokens: {
      aliasBgBase: cs.getPropertyValue('--dsw-alias-bg-base').trim(),
      mcBg: cs.getPropertyValue('--mc-bg').trim(),
      fontVar: cs.getPropertyValue('--dsw-font-family').trim().slice(0, 60),
    },
    body: pick(document.body),
    mainColumn: main ? pick(main) : null,
    sidebar: sidebar ? pick(sidebar) : null,
    headStyleOrder: [...document.querySelectorAll('head style')].slice(-5).map((s) => s.dataset.pluginCss || s.getAttribute('data-mc-root') || s.className || '(anon)'),
  };
});
console.log(JSON.stringify(diag, null, 2));
console.log(fontDiag.join('\n'));
await browser.close();
