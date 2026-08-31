// tools/probe-acc2-session.mjs — 打开指定会话,画像 retry/context/think/turn-tail 真实 DOM
// 用法:node tools/probe-acc2-session.mjs [sessionId-prefix]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(ROOT, 'shots'), { recursive: true });
const URL = 'http://127.0.0.1:3080';
const WANT = process.argv[2] || 'd1c75fd9';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);

// 在侧栏(McFinder 树)找目标会话行并点击
// 先展开所有「展开其余 N 个会话」,等 React 重渲染
await page.evaluate(() => { for (const more of [...document.querySelectorAll('.mc-sb-more')]) { try { more.click(); } catch (e) {} } });
await page.waitForTimeout(800);
const clicked = await page.evaluate((want) => {
  const rows = [...document.querySelectorAll('.mc-sess')];
  const all = rows.map((n) => (n.getAttribute('title') || ''));
  const row = rows.find((n) => ((n.getAttribute('title') || '')).toLowerCase().includes(want.toLowerCase()));
  if (row) { row.click(); return 'CLICKED: ' + row.getAttribute('title').slice(0, 60); }
  return 'NO MATCH among ' + all.length + ': ' + JSON.stringify(all.filter((t) => /executing|SECOND|SECOND/.test(t)).slice(0, 5));
}, WANT);
if (!clicked) {
  // 退路:按可见文本嗅探(标题截断风险,仅兜底)
  await page.evaluate(() => {
    const rows = [...document.querySelectorAll('[role="treeitem"], .mc-sess, [class*="sess"]')];
    console.log('rows:', rows.length);
  });
}
await page.waitForTimeout(4000);
console.log('session switch:', clicked);

const probe = await page.evaluate(() => {
  const out = {};
  // —— model-retry 行全画像 ——
  out.retry = [...document.querySelectorAll('[data-chat-flow-kind="model-retry"]')].map((k) => {
    const html = k.outerHTML;
    const details = k.querySelector('details');
    const summary = k.querySelector('summary');
    const text = summary ? summary.querySelector('span') : null;
    const svgs = [...k.querySelectorAll('svg')].map((s) => {
      const r = s.getBoundingClientRect();
      return { cls: (s.getAttribute('class') || '').slice(0, 50), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), disp: getComputedStyle(s).display, op: getComputedStyle(s).opacity };
    });
    const sumAfter = summary ? getComputedStyle(summary, '::after') : null;
    return {
      htmlLen: html.length,
      htmlHead: html.slice(0, 700),
      detailsAttrs: details ? [...details.attributes].map((a) => a.name + '=' + a.value.slice(0, 30)) : null,
      open: details ? details.open : null,
      svgs,
      sumAfter: sumAfter ? { content: sumAfter.content, w: sumAfter.width, h: sumAfter.height, tf: sumAfter.transform, disp: sumAfter.display } : null,
      textTxt: text ? text.textContent.slice(0, 60) : null,
      textRole: text ? text.getAttribute('role') : null,
    };
  });
  // —— context 行 ——
  out.context = [...document.querySelectorAll('[data-chat-flow-kind="context"]')].slice(0, 3).map((k) => {
    const row = k.querySelector('[data-disclosure-row]');
    return {
      lead: row ? row.children[0].outerHTML.slice(0, 500) : null,
      rowKids: row ? [...row.children].map((c) => ({ tag: c.tagName, cls: (c.className || '').toString().slice(0, 44), w: Math.round(c.getBoundingClientRect().width), txt: (c.textContent || '').slice(0, 24) })) : null,
    };
  });
  // —— think 卡 ——
  out.think = [...document.querySelectorAll('[data-variant="think"]')].slice(0, 4).map((t) => {
    const row = t.querySelector('[data-disclosure-row]');
    const grads = [];
    for (const e of [t, ...t.querySelectorAll('*')]) {
      try {
        const c = getComputedStyle(e);
        if (c.backgroundImage && c.backgroundImage !== 'none') grads.push({ el: e.tagName + '.' + (e.className || '').toString().slice(0, 30), bg: c.backgroundImage.slice(0, 90) });
        const ba = getComputedStyle(e, '::after');
        if (ba.content && ba.content !== 'none') grads.push({ pse: '::after→' + e.tagName + '.' + (e.className || '').toString().slice(0, 26), content: ba.content, bg: (ba.backgroundImage !== 'none' ? ba.backgroundImage : ba.backgroundColor).slice(0, 90), anim: ba.animationName, w: ba.width, left: ba.left });
      } catch (err) {}
    }
    return { state: t.getAttribute('data-state'), expanded: row ? row.getAttribute('aria-expanded') : null, grads };
  });
  // —— turn-tail + deliverables ——
  out.turnTail = [...document.querySelectorAll('[data-chat-flow-kind="turn-tail"]')].slice(0, 3).map((tt) => {
    const root = tt.querySelector('[data-time-hover-root]') || tt.firstElementChild;
    return {
      kids: root ? [...root.children].map((c) => {
        const r = c.getBoundingClientRect();
        return { tag: c.tagName, slot: c.getAttribute('data-slot') || '', cls: (c.className || '').toString().slice(0, 40), disp: getComputedStyle(c).display, x: Math.round(r.left), w: Math.round(r.width), alignSelf: getComputedStyle(c).alignSelf, txt: (c.textContent || '').trim().slice(0, 26) };
      }) : null,
      rootDir: root ? getComputedStyle(root).flexDirection : null,
    };
  });
  return out;
});
console.log(JSON.stringify(probe, null, 1));
await browser.close();
