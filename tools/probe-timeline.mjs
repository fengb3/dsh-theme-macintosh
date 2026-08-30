// 时间线探针：40s 轮询 + console 收集，观察 apply/dispose 节律
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const lines = [];
page.on('console', (m) => { const t = m.text(); if (t.includes('[mcx]') || t.includes('macintosh') || t.includes('error')) lines.push(`${new Date().toISOString().slice(17, 23)} ${t.slice(0, 150)}`); });
page.on('pageerror', (e) => lines.push(`${new Date().toISOString().slice(17, 23)} PAGEERROR ${String(e).slice(0, 150)}`));
await page.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded', timeout: 60000 });
for (let i = 0; i < 20; i++) {
  await page.waitForTimeout(2000);
  const st = await page.evaluate(() => ({
    root: document.querySelectorAll('style[data-mc-root]').length,
    sprite: !!document.querySelector('svg[data-mc-sprite]'),
    font: getComputedStyle(document.body).fontFamily.slice(0, 25),
  }));
  console.log(`t+${(i + 1) * 2}s root=${st.root} sprite=${st.sprite} font=${st.font}`);
}
console.log('--- console timeline ---');
console.log(lines.join('\n'));
await browser.close();
