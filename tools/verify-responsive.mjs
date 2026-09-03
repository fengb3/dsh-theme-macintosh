// tools/verify-responsive.mjs — 响应式批活体门禁(2026-09-03)
// 用法: node tools/verify-responsive.mjs   (宿主须运行于 127.0.0.1:3080)
// 断言: 汉堡断点(1023 显/1024 隐) / 抽屉开合三通道(汉堡·遮罩·Esc)与 Esc 让路 /
//       层级(壳 60 > 遮罩 50 > 主列;窗框 76) / 跨档回退 / 密度两档(flow 12·dock 8) /
//       mc-field 溢出修复 / 遮罩深浅反转 / 零页面错误。
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SHOTS = join(process.cwd(), 'shots');
mkdirSync(SHOTS, { recursive: true });
let failures = 0;
const ok = (cond, label) => { if (cond) { console.log('PASS ' + label); } else { failures++; console.log('FAIL ' + label); } };
const info = (label, val) => console.log('INFO ' + label + ' = ' + JSON.stringify(val));

const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
const errors = [];
pg.on('pageerror', (e) => errors.push(String(e.message).slice(0, 200)));

await pg.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(8000);

const state = () => pg.evaluate(() => {
  const burger = document.querySelector('.mc-burger');
  const mask = document.querySelector('.mc-mask');
  const tb = document.querySelector('.mc-main-tb') || document.querySelector('.mc-hero-tb');
  return {
    burger: burger ? getComputedStyle(burger).display : 'absent',
    burgerAlive: !!burger,
    maskShow: mask ? getComputedStyle(mask).display : 'absent',
    maskZ: mask ? getComputedStyle(mask).zIndex : 'absent',
    collapsed: !!document.querySelector('#root > div > div[data-sidebar-collapsed]'),
    expanded: !!document.querySelector('#root > div > div:not([data-sidebar-collapsed]) > div:first-child'),
    shellZ: (() => { const sh = document.querySelector('#root > div > div:not([data-sidebar-collapsed]) > div:first-child > div > div'); return sh ? getComputedStyle(sh).zIndex : 'n/a'; })(),
    shellPos: (() => { const sh = document.querySelector('#root > div > div:not([data-sidebar-collapsed]) > div:first-child > div > div'); return sh ? getComputedStyle(sh).position : 'n/a'; })(),
    tbZ: tb ? getComputedStyle(tb).zIndex : 'absent',
    treeAlive: !!document.querySelector('.mc-sb-tree'),
    mediaNarrow: matchMedia('(max-width:1023px)').matches,
  };
});
const clickBurger = () => pg.evaluate(() => { const x = document.querySelector('.mc-burger'); if (x) x.click(); return !!x; });

// —— A. 宽窗基线 ——
let s = await state();
ok(s.burger === 'none', 'A1 宽窗1280: 汉堡隐藏 (' + s.burger + ')');
ok(s.maskShow === 'none', 'A2 宽窗1280: 遮罩不显 (' + s.maskShow + ')');

// —— B. 断点边界 ——
await pg.setViewportSize({ width: 1024, height: 800 }); await pg.waitForTimeout(600);
s = await state();
ok(s.burger === 'none', 'B1 1024: 汉堡隐藏 (' + s.burger + ')');
await pg.setViewportSize({ width: 1023, height: 800 }); await pg.waitForTimeout(600);
s = await state();
ok(s.burger === 'flex', 'B2 1023: 汉堡显形 (' + s.burger + ')');
ok(s.mediaNarrow, 'B3 1023: 媒介查询命中');

// —— C. 抽屉开(汉堡通道) ——
ok(await clickBurger(), 'C0 汉堡在场可点');
await pg.waitForTimeout(900);
s = await state();
ok(!s.collapsed && s.expanded, 'C1 汉堡→官方侧栏展开');
ok(s.treeAlive, 'C2 树 DOM 宿主挂载 (.mc-sb-tree)');
ok(s.shellZ === '60' && s.shellPos === 'relative', 'C3 抽屉壳提层 z:60 relative (' + s.shellZ + '/' + s.shellPos + ')');
ok(s.maskShow === 'block' && s.maskZ === '50', 'C4 遮罩显形 z:50 (' + s.maskShow + '/' + s.maskZ + ')');
ok(s.tbZ === '76', 'C5 窗框 z:76 盖遮罩 (' + s.tbZ + ')');
const hitMask = await pg.evaluate(() => {
  const m = document.querySelector('.mc-mask'); const r = m.getBoundingClientRect();
  const el = document.elementFromPoint(Math.round(r.x + r.width / 2), Math.round(r.y + Math.min(r.height / 2, 300)));
  return el ? String(el.className || el.tagName) : '?';
});
ok(String(hitMask).includes('mc-mask'), 'C6 主列被遮罩盖住 (hit=' + String(hitMask).slice(0, 30) + ')');
await pg.screenshot({ path: join(SHOTS, 'resp-verify-drawer.png') });

// —— D. Esc 让路: 假 menu 在场 Esc 不收 ——
await pg.evaluate(() => { const f = document.createElement('div'); f.setAttribute('role', 'menu'); f.setAttribute('data-mc-verify-fake', ''); document.body.appendChild(f); });
await pg.keyboard.press('Escape'); await pg.waitForTimeout(600);
s = await state();
ok(!s.collapsed && s.maskShow === 'block', 'D1 Esc 让路: 官方弹层在场不收抽屉');
await pg.evaluate(() => { const f = document.querySelector('[data-mc-verify-fake]'); if (f) f.remove(); });
await pg.keyboard.press('Escape'); await pg.waitForTimeout(700);
s = await state();
ok(s.collapsed && s.maskShow === 'none', 'D2 Esc(无弹层): 收抽屉+遮罩消失');

// —— E. 遮罩点收 ——
await clickBurger(); await pg.waitForTimeout(900);
await pg.evaluate(() => { document.querySelector('.mc-mask').click(); });
await pg.waitForTimeout(900);
s = await state();
ok(s.collapsed && s.maskShow === 'none', 'E1 遮罩点击: 收抽屉+遮罩消失');

// —— F. 密度两档(先进会话取 flow) ——
await pg.evaluate(() => { const row = document.querySelector('.mc-sess'); if (row) row.click(); });
await pg.waitForTimeout(3500);
await pg.setViewportSize({ width: 600, height: 800 }); await pg.waitForTimeout(700);
const flowPad = await pg.evaluate(() => { const f = document.querySelector('[data-conversation-scroll]'); return f ? getComputedStyle(f).paddingTop : 'absent'; });
ok(flowPad === '12px', 'F1 600宽(≤640): flow padding 12 (' + flowPad + ')');
await pg.setViewportSize({ width: 460, height: 800 }); await pg.waitForTimeout(700);
const dockPad = await pg.evaluate(() => { const d = document.querySelector('[data-mc-dock]'); return d ? getComputedStyle(d).paddingTop : 'absent'; });
ok(dockPad === '8px', 'F2 460宽(≤480): dock padding 8 (' + dockPad + ')');
const fieldOf = await pg.evaluate(() => {
  const c = document.querySelector('[data-mc-dock] .composer'); const f = document.querySelector('[data-mc-dock] .mc-field');
  if (!c || !f) return 'absent';
  return Math.round(f.getBoundingClientRect().right - c.getBoundingClientRect().right);
});
ok(fieldOf !== 'absent' && fieldOf <= 0, 'F3 mc-field 溢出修复 (right-delta=' + fieldOf + ')');
await pg.screenshot({ path: join(SHOTS, 'resp-verify-460.png') });

// —— G. 遮罩深浅反转 ——
const inversion = await pg.evaluate(() => {
  const m = document.createElement('div'); m.className = 'mc-mask'; m.style.display = 'block'; document.body.appendChild(m);
  const before = getComputedStyle(m).backgroundImage;
  const html = document.documentElement;
  const prev = html.getAttribute('data-theme');
  html.setAttribute('data-theme', 'light');
  const after = getComputedStyle(m).backgroundImage;
  html.setAttribute('data-theme', prev || 'dark');
  m.remove();
  return { before: before.slice(0, 30), inverted: before !== after };
});
ok(inversion.inverted, 'G1 遮罩点阵深浅反转 (' + inversion.before + '…)');

// —— I. 零页面错误 ——
ok(errors.length === 0, 'I1 零页面错误 (n=' + errors.length + (errors.length ? ': ' + errors[0] : ')'));

console.log(failures === 0 ? '\nverify-responsive: ALL GREEN' : '\nverify-responsive: ' + failures + ' FAIL');
await b.close();
process.exit(failures === 0 ? 0 : 1);
