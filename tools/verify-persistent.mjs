// tools/verify-persistent.mjs — 常驻主题验证：打开 GUI，等 ~8s，
// 断言 body fontFamily 含 ChiKareGo、backgroundColor 非 DSH 默认白/深色；
// RELOAD 后重复断言（持久性）。截图 shots/persist.png。
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(ROOT, 'shots'), { recursive: true });

const URL = 'http://127.0.0.1:3080';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const logs = [];
page.on('console', (m) => { const t = m.text(); if (t.includes('[mcx]')) logs.push(t); });
page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));

async function probe(label) {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const r = await page.evaluate(() => {
    const cs = getComputedStyle(document.body);
    const sprite = !!document.querySelector('svg[data-mc-sprite]');
    const desk = !!document.querySelector('[data-mc-desk]');
    const styleTag = !!document.querySelector('style[data-mc-root]');
    return {
      fontFamily: cs.fontFamily,
      backgroundColor: cs.backgroundColor,
      backgroundImage: cs.backgroundImage,
      sprite, desk, styleTag,
      themeAttr: document.documentElement.getAttribute('data-theme'),
      bodyDark: document.body.hasAttribute('data-ds-dark-theme'),
      htmlClass: document.documentElement.className,
    };
  });
  console.log(`[${label}] ` + JSON.stringify(r, null, 2));
  return r;
}

const first = await probe('first-load');
await page.screenshot({ path: join(ROOT, 'shots', 'persist.png') });

// —— T9 扩容:flow 三断言(flowColumn gap 14 / 气泡 accent 底 / 注入条存在性[任一 system-reminder 会话])——
// 无痕浏览器无 localStorage → hero 态起,当前无会话打开;迭代侧栏 DIV[title] 会话行找齐;
// first 与 reload 两轮各跑一次 → flow 样式随重载持久一并复验。深浅期望值按当前主题取。
async function flowProbe() {
  return await page.evaluate(() => {
    const fc = document.querySelector('[data-chat-flow]');
    // 气泡取四层链命中中「有盒」节点(空 images slot display:contents 无盒,裁定10)
    let bubble = null;
    for (const el of document.querySelectorAll(':is([data-chat-flow-kind="user"],[data-chat-flow-kind="steering"])>div>div>div>div')) {
      if (el.getClientRects().length) { bubble = el; break; }
    }
    const inject = document.querySelector('[data-chat-flow-kind="context"], [data-chat-flow-kind="compaction"], [data-chat-flow-kind="manual-compaction"]');
    const i = inject ? getComputedStyle(inject) : null;
    return {
      theme: document.documentElement.getAttribute('data-theme'),
      gap: fc ? getComputedStyle(fc).gap : null,
      bubble: bubble ? getComputedStyle(bubble).backgroundColor : null,
      inject: i ? { style: i.borderStyle, bg: i.backgroundColor } : null,
    };
  });
}
function flowComplete(p) { return !!(p && p.gap && p.bubble && p.inject); }
// 会话行 = 侧栏 DIV[title=会话名](live 实测 2026-08-31:host 0.1.1-rc.2 无 div[role=treeitem],
// 侧栏 [title] 里 DIV 恰为会话行;BUTTON[title] 均为动作钮,点会误开新会话,故只取 DIV)
async function seekFlowParts() {
  let p = await flowProbe();
  if (flowComplete(p)) return { probe: p, via: 'active-session' };
  for (let i = 0; i < 14; i++) {
    const clicked = await page.evaluate((idx) => {
      const side = document.querySelector('#root > div > div > div:first-child');
      const rows = side ? [...side.querySelectorAll('div[title]')].filter((e) => (e.getAttribute('title') || '').trim()) : [];
      if (idx >= rows.length) return null;
      rows[idx].click();
      return rows[idx].getAttribute('title').trim().slice(0, 24);
    }, i);
    if (clicked === null) break;
    await page.waitForTimeout(2000);
    p = await flowProbe();
    if (flowComplete(p)) return { probe: p, via: 'session:' + clicked };
  }
  return { probe: p, via: 'exhausted' };
}
const flowFirst = await seekFlowParts();
console.log('[flow-first] ' + JSON.stringify(flowFirst));

await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
const second = await page.evaluate(() => {
  const cs = getComputedStyle(document.body);
  return {
    fontFamily: cs.fontFamily,
    backgroundColor: cs.backgroundColor,
    sprite: !!document.querySelector('svg[data-mc-sprite]'),
    desk: !!document.querySelector('[data-mc-desk]'),
    styleTag: !!document.querySelector('style[data-mc-root]'),
  };
});
console.log('[after-reload] ' + JSON.stringify(second, null, 2));
await page.screenshot({ path: join(ROOT, 'shots', 'persist-reload.png') });

// 字体真实加载检查（document.fonts）
const fonts = await page.evaluate(async () => {
  await document.fonts.ready;
  const loaded = [];
  document.fonts.forEach((f) => { if (f.status === 'loaded') loaded.push(f.family); });
  return [...new Set(loaded)];
});
console.log('[fonts-loaded] ' + JSON.stringify(fonts));
const flowReload = await seekFlowParts();
console.log('[flow-reload] ' + JSON.stringify(flowReload));

let ok = true;
const check = (name, cond) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) ok = false; };
for (const [label, r] of [['first', first], ['reload', second]]) {
  check(`${label}: fontFamily 含 ChiKareGo`, /ChiKareGo/i.test(r.fontFamily));
  check(`${label}: backgroundColor 非 DSH 默认(白/官方深)`, r.backgroundColor !== 'rgb(255, 255, 255)' && r.backgroundColor !== 'rgba(0, 0, 0, 0)');
  check(`${label}: sprite 注入`, r.sprite);
  check(`${label}: 桌面画布注入`, r.desk);
  check(`${label}: style[data-mc-root] 在册`, r.styleTag);
}
check('字体真实加载含 ChiKareGo', fonts.some((f) => /ChiKareGo/i.test(f)));
// T9 扩容三断言(first + reload 两轮;期望值按当前主题深浅取)
for (const [label, fr] of [['first', flowFirst], ['reload', flowReload]]) {
  const p = fr.probe;
  const isLight = p.theme === 'light';
  const accent = isLight ? 'rgb(143, 143, 192)' : 'rgb(218, 218, 255)';
  const injBg = isLight ? 'rgb(238, 238, 238)' : 'rgb(74, 74, 74)';
  check(`${label}: flowColumn gap 14px`, p.gap === '14px');
  check(`${label}: 气泡 accent 底(${accent};via ${fr.via})`, p.bubble === accent);
  check(`${label}: 注入条存在且 dashed + surface-2(${injBg})`, !!p.inject && p.inject.style === 'dashed' && p.inject.bg === injBg);
}
// 轮6：主题走官方通道 —— 月牙钮已删，html[data-theme] 应跟随官方 body[data-ds-dark-theme] 信号
check('月牙钮不存在', await page.evaluate(() => document.querySelector('[aria-label="切换深浅主题"]') === null));
check('官方外观通道跟随：data-theme 与 body[data-ds-dark-theme] 一致',
  (first.themeAttr === 'dark') === first.bodyDark && first.themeAttr !== null);
console.log('--- [mcx] console lines (tail 10) ---');
for (const l of logs.slice(-10)) console.log(l);
await browser.close();
console.log(ok ? 'VERIFY: GREEN' : 'VERIFY: RED');
process.exit(ok ? 0 : 1);
