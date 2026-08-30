// tools/verify-persistent.mjs — 常驻主题验证：打开 GUI，等 ~8s，
// 断言 body fontFamily 含 ChiKareGo、backgroundColor 非 DSH 默认白/深色；
// RELOAD 后重复断言（持久性）。截图 shots/persist.png。
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(ROOT, 'shots'), { recursive: true });

const URL = 'http://127.0.0.1:3080';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const logs = [];
page.on('console', (m) => { const t = m.text(); if (t.includes('[mcx]')) logs.push(t); });
page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));

async function probe(label) {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const r = await page.evaluate(() => {
    const cs = getComputedStyle(document.body);
    const sprite = !!document.querySelector('svg[data-mc-sprite]');
    const desk = !!document.querySelector('[data-mc-desk]');
    const styleTag = !!document.querySelector('style[data-mc-root]');
    return {
      fontFamily: cs.fontFamily,
      backgroundColor: cs.backgroundColor,
      backgroundImage: cs.backgroundImage,
      sprite, desk, styleTag,
      themeAttr: document.documentElement.getAttribute('data-theme'),
      htmlClass: document.documentElement.className,
    };
  });
  console.log(`[${label}] ` + JSON.stringify(r, null, 2));
  return r;
}

const first = await probe('first-load');
await page.screenshot({ path: join(ROOT, 'shots', 'persist.png') });
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
const second = await page.evaluate(() => {
  const cs = getComputedStyle(document.body);
  return {
    fontFamily: cs.fontFamily,
    backgroundColor: cs.backgroundColor,
    sprite: !!document.querySelector('svg[data-mc-sprite]'),
    desk: !!document.querySelector('[data-mc-desk]'),
    styleTag: !!document.querySelector('style[data-mc-root]'),
  };
});
console.log('[after-reload] ' + JSON.stringify(second, null, 2));
await page.screenshot({ path: join(ROOT, 'shots', 'persist-reload.png') });

// 字体真实加载检查（document.fonts）
const fonts = await page.evaluate(async () => {
  await document.fonts.ready;
  const loaded = [];
  document.fonts.forEach((f) => { if (f.status === 'loaded') loaded.push(f.family); });
  return [...new Set(loaded)];
});
console.log('[fonts-loaded] ' + JSON.stringify(fonts));

let ok = true;
const check = (name, cond) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) ok = false; };
for (const [label, r] of [['first', first], ['reload', second]]) {
  check(`${label}: fontFamily 含 ChiKareGo`, /ChiKareGo/i.test(r.fontFamily));
  check(`${label}: backgroundColor 非 DSH 默认(白/官方深)`, r.backgroundColor !== 'rgb(255, 255, 255)' && r.backgroundColor !== 'rgba(0, 0, 0, 0)');
  check(`${label}: sprite 注入`, r.sprite);
  check(`${label}: 桌面画布注入`, r.desk);
  check(`${label}: style[data-mc-root] 在册`, r.styleTag);
}
check('字体真实加载含 ChiKareGo', fonts.some((f) => /ChiKareGo/i.test(f)));
console.log('--- [mcx] console lines (tail 10) ---');
for (const l of logs.slice(-10)) console.log(l);
await browser.close();
console.log(ok ? 'VERIFY: GREEN' : 'VERIFY: RED');
process.exit(ok ? 0 : 1);
