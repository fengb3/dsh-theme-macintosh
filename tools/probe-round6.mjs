// tools/probe-round6.mjs — 轮6 冒烟：
//   ① 标题栏为真实 DOM（.mc-titlebar 在 sidebarRoot 首位）、tclose 可点击；
//   ② 点 tclose → 折叠态（记录折叠前后 colW/类名/mini 渲染）→ 再点恢复；全程无 console error；
//   ③ 折叠态截图 shots/collapse.png + 展开态截图 shots/expand.png；
//   ④ 月牙钮不存在（querySelector('[aria-label="切换深浅主题"]') 为 null）。
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(ROOT, 'shots'), { recursive: true });

const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

await page.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);

const sel = {
  frame: '#root > div > div',
  col: '#root > div > div > div:first-child',
  root: '#root > div > div > div:first-child > div > div',
  bar: '#root > div > div > div:first-child > div > div > .mc-titlebar',
  tclose: '#root > div > div > div:first-child > div > div > .mc-titlebar .mc-tclose',
  logoRow: '#root > div > div > div:first-child > div > div > div:nth-child(2)',
};

let ok = true;
const check = (name, cond) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) ok = false; };

const state = () => page.evaluate((s) => {
  const q = (x) => document.querySelector(x);
  const bar = q(s.bar);
  const rootEl = q(s.root);
  return {
    colW: Math.round(q(s.col).getBoundingClientRect().width),
    frameCollapsed: q(s.frame).hasAttribute('data-sidebar-collapsed'),
    rootCls: String(rootEl.className),
    barFirst: !!bar && rootEl.firstElementChild === bar,
    barH: bar ? Math.round(bar.getBoundingClientRect().height) : 0,
    tcloseVisible: !!q(s.tclose) && q(s.tclose).offsetParent !== null,
    mini: !!document.querySelector('.mc-sb-mini'),
    miniBtns: document.querySelectorAll('.mc-sb-mini .mc-mini-btn').length,
    tree: !!document.querySelector('.mc-sb-find'),
    moon: document.querySelector('[aria-label="切换深浅主题"]'),
    themeAttr: document.documentElement.getAttribute('data-theme'),
    bodyDark: document.body.hasAttribute('data-ds-dark-theme'),
  };
}, sel);

const expanded0 = await state();
check('展开态：.mc-titlebar 为 sidebarRoot 首子（真 DOM）', expanded0.barFirst);
check('展开态：标题栏高 20px（含底边框 21）', expanded0.barH === 20 || expanded0.barH === 21);
check('展开态：tclose 在版可点', expanded0.tcloseVisible);
check('展开态：colW=280 / 未折叠', expanded0.colW === 280 && !expanded0.frameCollapsed);
check('展开态：Finder 树在版、迷你条不在', expanded0.tree && !expanded0.mini);
check('月牙钮不存在', expanded0.moon === null);
check('官方外观通道：data-theme 与 body 信号一致', (expanded0.themeAttr === 'dark') === expanded0.bodyDark);
await page.screenshot({ path: join(ROOT, 'shots', 'expand.png') });

// tclose 点击 → 折叠（flash 过场 ~300ms，settle 150ms，等 1.5s 落定）
await page.locator(sel.tclose).click();
await page.waitForTimeout(1500);
const collapsed = await state();
check('折叠态：colW=56（官方轨）', collapsed.colW === 56);
check('折叠态：frame[data-sidebar-collapsed]', collapsed.frameCollapsed);
check('折叠态：root 带 collapsed 类', /collapsed/.test(collapsed.rootCls));
check('折叠态：迷你条在版（2 钮）', collapsed.mini && collapsed.miniBtns === 2);
check('折叠态：Finder 树不在版', !collapsed.tree);
check('折叠态：标题栏仍在（首位自愈）', collapsed.barFirst);
await page.screenshot({ path: join(ROOT, 'shots', 'collapse.png') });

// 再点 tclose → 恢复展开
await page.locator(sel.tclose).click();
await page.waitForTimeout(1500);
const restored = await state();
check('恢复：colW=280、折叠属性撤', restored.colW === 280 && !restored.frameCollapsed);
check('恢复：Finder 树回版、迷你条撤', restored.tree && !restored.mini);
check('恢复：标题栏仍首位', restored.barFirst);

// 自愈验证：把标题栏拆掉，等 observer 重插
await page.evaluate((s) => { document.querySelector(s.bar).remove(); }, sel);
await page.waitForTimeout(400);
const healed = await state();
check('自愈：标题栏被移除后重插首位', healed.barFirst);

console.log('STATE expanded : ' + JSON.stringify({ colW: expanded0.colW, rootCls: expanded0.rootCls }));
console.log('STATE collapsed : ' + JSON.stringify({ colW: collapsed.colW, rootCls: collapsed.rootCls, miniBtns: collapsed.miniBtns }));
console.log('STATE restored  : ' + JSON.stringify({ colW: restored.colW, rootCls: restored.rootCls }));
console.log('console errors  : ' + (errors.length ? JSON.stringify(errors) : 'none'));
check('全程无 console error / pageerror', errors.length === 0);

await browser.close();
console.log(ok ? 'PROBE-ROUND6: GREEN' : 'PROBE-ROUND6: RED');
process.exit(ok ? 0 : 1);
