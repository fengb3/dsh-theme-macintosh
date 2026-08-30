// 真实会话页探针：打开一个会话，检查 header pinstripe / 主窗阴影 / 侧栏元素
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(6000);
// 打开第一个会话
const rows = p.locator('div[role="treeitem"]');
console.log('treeitem count:', await rows.count());
if (await rows.count()) {
  await rows.first().click({ force: true });
  for (let i = 0; i < 10; i++) {
    await p.waitForTimeout(500);
    const ph = await p.evaluate(() => { const m = document.querySelector('div[data-phase]'); return m ? m.getAttribute('data-phase') : null; });
    if (ph && ph !== 'hero') break;
  }
}
const r = await p.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const header = q('div[data-phase] > header');
  const hs = header && getComputedStyle(header);
  const main = q('div[data-phase]');
  const ms = main && getComputedStyle(main);
  // 找 centerCol（主窗的 flex 父容器）看是否裁剪阴影
  const center = main && main.parentElement;
  const cs2 = center && getComputedStyle(center);
  const sb = q('#root > div > div > div:first-child');
  return {
    phase: main && main.getAttribute('data-phase'),
    headerExists: !!header,
    headerBg: hs ? hs.backgroundImage.slice(0, 90) : null,
    headerBorderBottom: hs ? hs.borderBottom : null,
    mainShadow: ms ? ms.boxShadow : null,
    mainBorder: ms ? ms.border : null,
    centerOverflow: cs2 ? cs2.overflow : null,
    sidebarChildren: sb ? [...sb.querySelectorAll(':scope > *')].slice(0, 6).map((c) => c.tagName + '.' + String(c.className).slice(0, 30)) : null,
    sidebarDeep: (() => {
      const dump = (el, d, out) => {
        if (!el || d > 3 || out.length > 40) return out;
        const s = getComputedStyle(el);
        out.push('  '.repeat(d) + el.tagName + (el.getAttribute('aria-label') ? '[' + el.getAttribute('aria-label') + ']' : '') + '.' + String(el.className).slice(0, 24) + ' h=' + Math.round(el.getBoundingClientRect().height));
        for (const c of el.children) dump(c, d + 1, out);
        return out;
      };
      return sb ? dump(sb, 0, []) : null;
    })(),
  };
});
console.log(JSON.stringify(r, null, 2));
await p.screenshot({ path: 'shots/session-check.png' });
await b.close();
