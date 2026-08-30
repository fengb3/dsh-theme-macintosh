// 检查一期各层在真实页面的生效情况：chrome 染色 / sidebar Finder / 桌面画布 / 月牙钮 / kit
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
const r = await page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const cs = (el, prop) => el ? getComputedStyle(el)[prop] : '(no match)';
  const root = q('#root > div');           // MAP.appRoot
  const mainCol = q('div[data-phase]');    // MAP.mainColumn
  const sidebar = q('#root > div > div:first-child'); // MAP.sidebar
  return {
    appRootMatch: !!root,
    mainColMatch: !!mainCol,
    sidebarMatch: !!sidebar,
    mainCol_border: cs(mainCol, 'border'),
    mainCol_borderRadius: cs(mainCol, 'borderRadius'),
    mainCol_boxShadow: cs(mainCol, 'boxShadow'),
    mainCol_background: cs(mainCol, 'backgroundColor'),
    sidebar_background: cs(sidebar, 'backgroundColor'),
    sidebar_borderRight: cs(sidebar, 'borderRight'),
    desk: (() => { const d = q('[data-mc-desk]'); return d ? { bg: getComputedStyle(d).backgroundImage.slice(0, 60), z: getComputedStyle(d).zIndex } : null; })(),
    moonBtn: !!q('[aria-label="切换深浅主题"]'),
    finderMark: !!q('svg use[href="#i-finder"]'),
    // 会话行
    sessionRow: (() => { const row = q('[role="treeitem"]'); return row ? { h: getComputedStyle(row).height, radius: getComputedStyle(row).borderRadius } : null; })(),
    scrollbarWidth: (() => { const sp = q('[data-conversation-scroll]'); return sp ? getComputedStyle(sp).scrollbarWidth : '(no scrollport)'; })(),
  };
});
console.log(JSON.stringify(r, null, 2));
await page.screenshot({ path: 'shots/phase1-check.png' });
await browser.close();
