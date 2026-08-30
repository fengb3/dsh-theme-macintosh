// 检查 centerCol/detailsCol 是否有实底盖住桌面（主窗阴影落在灰底上的根因排查）
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const cols = [...document.querySelectorAll('#root > div > div > div')].slice(0, 3);
  return cols.map((c) => {
    const s = getComputedStyle(c);
    return { cls: String(c.className).slice(0, 26), bg: s.backgroundColor, w: Math.round(c.getBoundingClientRect().width) };
  });
});
console.log(JSON.stringify(r, null, 2));
await b.close();
