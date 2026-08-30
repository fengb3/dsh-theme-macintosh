// 侧栏元素级探针：logoRow/newSession/region/foot 是否吃到 Finder 语汇
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const root = document.querySelector('#root > div > div > div:first-child > div > div');
  const pick = (s) => { const el = document.querySelector(s); if (!el) return '(no match)'; const c = getComputedStyle(el); return { h: Math.round(el.getBoundingClientRect().height), pad: c.padding, bg: c.backgroundColor, bb: c.borderBottom, bs: c.boxShadow.slice(0, 70), br: c.borderRadius }; };
  return {
    rootMatch: !!root,
    rootChildren: root ? [...root.children].map((c) => c.tagName + ':' + Math.round(c.getBoundingClientRect().height)) : null,
    logoRow: pick('#root > div > div > div:first-child > div > div > div:nth-child(1)'),
    newSession: pick('#root > div > div > div:first-child > div > div > button:nth-child(2)'),
    region: pick('#root > div > div > div:first-child > div > div > div:nth-child(3)'),
    foot: pick('#root > div > div > div:first-child > div > div > div:nth-child(4)'),
  };
});
console.log(JSON.stringify(r, null, 2));
await p.screenshot({ path: 'shots/sidebar-el-check.png' });
await b.close();
