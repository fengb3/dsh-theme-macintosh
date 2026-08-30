// 探针：品牌行字号核对（任务1）+ 官方折叠态形态（任务4）+ 官方明暗信号（任务5）
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(7000);

const brand = await p.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const r = {};
  for (const [k, sel] of [
    ['brand', '.mc-sb-brand'], ['tag', '.mc-sb-tag'],
  ]) {
    const el = q(sel);
    if (!el) { r[k] = null; continue; }
    const cs = getComputedStyle(el);
    r[k] = { fontSize: cs.fontSize, fontWeight: cs.fontWeight, parent: String(el.parentElement.className).slice(0, 40) };
  }
  return r;
});
console.log('BRAND:', JSON.stringify(brand, null, 1));

const snap = () => p.evaluate(() => {
  const frame = document.querySelector('#root > div > div');
  const col = document.querySelector('#root > div > div > div:first-child');
  const root = document.querySelector('#root > div > div > div:first-child > div > div');
  return {
    colW: Math.round(col.getBoundingClientRect().width),
    gridCols: getComputedStyle(frame).gridTemplateColumns,
    frameCollapsedAttr: frame.hasAttribute('data-sidebar-collapsed'),
    rootCls: String(root.className),
    regionChildren: [...document.querySelector('#root > div > div > div:first-child > div > div > div:nth-child(3)').children].map((c) => c.className),
  };
});
const before = await snap();
await p.locator('#root > div > div > div:first-child > div > div > div:nth-child(1) button').last().click({ force: true });
await p.waitForTimeout(2500); // 等 settle(150ms)+grid slide(300ms)
const after = await snap();
await p.waitForTimeout(1500);
const afterLong = await snap();
// 恢复
await p.locator('#root > div > div > div:first-child > div > div > div:nth-child(1) button').first().click({ force: true });
await p.waitForTimeout(1500);
const restored = await snap();
console.log('COLLAPSE:', JSON.stringify({ before, after, afterLong, restored }, null, 1));
await b.close();
