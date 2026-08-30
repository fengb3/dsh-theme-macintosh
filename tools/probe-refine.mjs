// 精修项探针：侧栏成窗 / 月牙钮 / 品牌标签 / 图标尺寸
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const sb = document.querySelector('#root > div > div > div:first-child');
  const cs = getComputedStyle(sb);
  const moon = document.querySelector('[aria-label="切换深浅主题"]');
  const msvg = moon && moon.querySelector('svg');
  const tag = document.querySelector('.mc-sb-tag');
  const rowSvg = document.querySelector('div[role="treeitem"] svg');
  return {
    sb_margin: cs.margin, sb_border: cs.border, sb_shadow: cs.boxShadow.slice(0, 44), sb_radius: cs.borderRadius,
    moonSvg: msvg ? msvg.getAttribute('width') + 'x' + msvg.getAttribute('height') : null,
    moonBtn: moon ? { w: getComputedStyle(moon).width, bg: getComputedStyle(moon).backgroundColor, border: getComputedStyle(moon).border } : null,
    brandTag: tag ? { text: tag.textContent, bg: getComputedStyle(tag).backgroundColor, color: getComputedStyle(tag).color } : null,
    rowSvg: rowSvg ? getComputedStyle(rowSvg).width : null,
  };
});
console.log(JSON.stringify(r, null, 2));
await p.screenshot({ path: 'shots/refine-check.png' });
await b.close();
