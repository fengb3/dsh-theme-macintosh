// 溢出探针：行内右缘图标 vs 侧栏右缘
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const sb = document.querySelector('#root > div > div > div:first-child');
  const sbR = sb.getBoundingClientRect().right;
  const tree = document.querySelector('.mc-sb-tree');
  const treeR = tree ? tree.getBoundingClientRect().right : null;
  const out = [];
  if (tree) {
    for (const el of tree.querySelectorAll('.mc-gh-act, .mc-s-menu, .mc-g-count')) {
      const rc = el.getBoundingClientRect();
      if (rc.right > sbR - 2) out.push({ what: el.className, right: Math.round(rc.right), sbRight: Math.round(sbR), over: Math.round(rc.right - sbR) });
    }
  }
  // 也查 svg 是否溢出父按钮
  const svgOver = [];
  if (tree) {
    for (const svg of tree.querySelectorAll('svg')) {
      const rc = svg.getBoundingClientRect();
      const pr = svg.parentElement.getBoundingClientRect();
      if (rc.right > pr.right + 1 || rc.width > pr.width + 1) { svgOver.push({ cls: svg.getAttribute('class') || 'svg', w: Math.round(rc.width), pw: Math.round(pr.width), overR: Math.round(rc.right - pr.right) }); break; }
    }
  }
  const group = document.querySelector('.mc-group-head');
  return { sbRight: Math.round(sbR), treeRight: treeR ? Math.round(treeR) : null, overflowing: out.slice(0, 5), svgOver: svgOver.slice(0, 3), groupHeadRight: group ? Math.round(group.getBoundingClientRect().right) : null };
});
console.log(JSON.stringify(r, null, 2));
await b.close();
