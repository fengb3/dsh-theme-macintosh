// listbar/foot 按钮锚点探针：aria-label 与结构
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const region = document.querySelector('#root > div > div > div:first-child > div > div > div:nth-child(3)');
  const foot = document.querySelector('#root > div > div > div:first-child > div > div > div:nth-child(4)');
  const dumpBtn = (bt) => ({ label: bt.getAttribute('aria-label') || bt.title || null, svg: !!bt.querySelector('svg') });
  return {
    regionButtons: region ? [...region.querySelectorAll('button')].slice(0, 10).map(dumpBtn) : null,
    footButtons: foot ? [...foot.querySelectorAll('button')].map(dumpBtn) : null,
    footHtml: foot ? foot.outerHTML.replace(/\s+/g, ' ').slice(0, 300) : null,
  };
});
console.log(JSON.stringify(r, null, 2));
await b.close();
