// DOM 结构探针：搞清 frame/columns 的真实布局方式
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const dump = (el, depth, out) => {
    if (!el || depth > 3) return out;
    const s = getComputedStyle(el);
    const rc = el.getBoundingClientRect();
    out.push({
      depth, tag: el.tagName, cls: String(el.className).slice(0, 36),
      display: s.display, pos: s.position, h: s.height, pad: s.padding, gap: s.gap,
      box: { t: Math.round(rc.top), b: Math.round(rc.bottom), l: Math.round(rc.left), r: Math.round(rc.right) },
    });
    for (const c of el.children) dump(c, depth + 1, out);
    return out;
  };
  const root = document.querySelector('#root');
  return dump(root, 0, []);
});
console.log(JSON.stringify(r, null, 1));
await b.close();
