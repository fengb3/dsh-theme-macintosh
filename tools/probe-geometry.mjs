// 精修几何探针：侧栏/主窗的实际盒位 vs 视口
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const sb = document.querySelector('#root > div > div:first-child');
  const main = document.querySelector('div[data-phase]');
  const rc = sb.getBoundingClientRect();
  const mc = main.getBoundingClientRect();
  const sbChild = sb.firstElementChild;
  const sbChildRc = sbChild ? sbChild.getBoundingClientRect() : null;
  return {
    viewport: { w: innerWidth, h: innerHeight },
    sidebarBox: { top: rc.top, bottom: rc.bottom, left: rc.left, right: rc.right, h: rc.height },
    sidebarFirstChildBox: sbChildRc ? { top: sbChildRc.top, bottom: sbChildRc.bottom, tag: sbChild.tagName, cls: String(sbChild.className).slice(0, 40) } : null,
    mainBox: { top: mc.top, bottom: mc.bottom, left: mc.left, right: mc.right },
    // 祖先链有没有实底（会盖住桌面缝隙）
    ancestors: (() => {
      const out = [];
      let el = sb.parentElement;
      while (el && out.length < 5) {
        const s = getComputedStyle(el);
        out.push({ tag: el.tagName, id: el.id, bg: s.backgroundColor, h: el.getBoundingClientRect().height });
        el = el.parentElement;
      }
      return out;
    })(),
  };
});
console.log(JSON.stringify(r, null, 2));
await p.screenshot({ path: 'shots/geometry-check.png' });
await b.close();
