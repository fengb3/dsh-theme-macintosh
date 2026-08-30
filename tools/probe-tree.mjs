// treeitem 属性探针：区分工作区(文件夹)行 vs 会话行
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  return [...document.querySelectorAll('div[role="treeitem"]')].slice(0, 8).map((el) => ({
    level: el.getAttribute('aria-level'),
    expanded: el.getAttribute('aria-expanded'),
    selected: el.getAttribute('aria-selected'),
    svgs: [...el.querySelectorAll('svg')].map((s) => (s.getAttribute('class') || '') + '|' + String(s.innerHTML).slice(0, 40)),
  }));
});
console.log(JSON.stringify(r, null, 1));
await b.close();
