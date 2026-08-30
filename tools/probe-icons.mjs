// 图标 mask + 阴影落点探针
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const region = document.querySelector('#root > div > div > div:first-child > div > div > div:nth-child(3)');
  const btn = region && region.querySelector('button[aria-label="搜索会话"]');
  const svg = btn && btn.querySelector('svg');
  const s = svg && getComputedStyle(svg);
  const main = document.querySelector('div[data-phase]');
  const ms = main && getComputedStyle(main);
  // 阴影下方 2px 处的元素是什么（谁压着阴影）
  const box = main.getBoundingClientRect();
  const at = document.elementFromPoint(box.right - 2, box.bottom - 2);
  return {
    searchSvg: s ? { mask: (s.maskImage || '').slice(0, 30), bg: s.backgroundColor, childVis: svg.querySelector('path') ? getComputedStyle(svg.querySelector('path')).visibility : null, color: s.color } : 'no svg',
    mainShadow: ms ? ms.boxShadow : null,
    cornerElement: at ? at.tagName + '.' + String(at.className).slice(0, 30) : null,
  };
});
console.log(JSON.stringify(r, null, 2));
await b.close();
