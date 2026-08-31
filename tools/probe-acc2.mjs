// tools/probe-acc2.mjs — 验收二轮 live 探针:flow 区 DOM 结构画像(⑤①⑦⑧⑨③④ 探测共用)
// 用法:node tools/probe-acc2.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(ROOT, 'shots'), { recursive: true });
const URL = 'http://127.0.0.1:3080';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);

const report = await page.evaluate(() => {
  const out = { theme: document.documentElement.getAttribute('data-theme'), sections: {} };
  const fc = document.querySelector('[data-chat-flow]');
  out.flowCount = fc ? fc.children.length : 0;

  // —— context 行:disclosure row 结构 + chevron 占位 ——
  out.sections.context = [...document.querySelectorAll('[data-chat-flow-kind="context"]')].slice(0, 2).map((k) => {
    const row = k.querySelector('[data-disclosure-row]');
    const kids = row ? [...row.children].map((c) => {
      const r = c.getBoundingClientRect();
      return {
        tag: c.tagName, slot: c.getAttribute('data-slot') || '', cls: (c.className || '').slice(0, 40),
        w: Math.round(r.width), x: Math.round(r.left), txt: (c.textContent || '').slice(0, 30),
        svgs: [...c.querySelectorAll('svg')].map((s) => {
          const sr = s.getBoundingClientRect();
          const cs = getComputedStyle(s);
          return { cls: (s.className || '').baseVal?.slice?.(0, 30) || '', w: Math.round(sr.width), h: Math.round(sr.height), disp: cs.display, op: cs.opacity };
        }),
      };
    }) : null;
    const cs = row ? getComputedStyle(row) : null;
    return { form: k.getAttribute('data-context-form') || (k.querySelector('[data-context-form]') || {}).getAttribute?.('data-context-form'), rowKids: kids, rowGap: cs ? cs.gap : null };
  });

  // —— think 卡:结构与 running 渐变残留 ——
  out.sections.think = [...document.querySelectorAll('[data-variant="think"]')].slice(0, 3).map((t) => {
    const row = t.querySelector('[data-disclosure-row]');
    const grad = [];
    // 扫描卡内所有元素+伪元素,找 background-image 渐变
    const scanGrad = (el, depth) => {
      if (depth > 6) return;
      for (const e of [el, ...el.querySelectorAll('*')]) {
        try {
          const c = getComputedStyle(e);
          if (c.backgroundImage && c.backgroundImage !== 'none') grad.push({ tag: e.tagName, cls: (e.className || '').toString().slice(0, 50), bg: c.backgroundImage.slice(0, 120) });
          const ba = getComputedStyle(e, '::after'), bb = getComputedStyle(e, '::before');
          if (ba.content && ba.content !== 'none' && (ba.backgroundImage !== 'none' || ba.background !== 'rgba(0, 0, 0, 0)')) grad.push({ pse: 'after', tag: e.tagName, cls: (e.className || '').toString().slice(0, 50), content: ba.content, bg: (ba.backgroundImage !== 'none' ? ba.backgroundImage : ba.backgroundColor).slice(0, 100), anim: ba.animationName, op: ba.opacity });
          if (bb.content && bb.content !== 'none' && (bb.backgroundImage !== 'none' || bb.backgroundColor !== 'rgba(0, 0, 0, 0)')) grad.push({ pse: 'before', tag: e.tagName, cls: (e.className || '').toString().slice(0, 50), content: bb.content, bg: (bb.backgroundImage !== 'none' ? bb.backgroundImage : bb.backgroundColor).slice(0, 100), anim: bb.animationName, op: bb.opacity });
        } catch (err) {}
      }
    };
    scanGrad(t, 0);
    return {
      state: t.getAttribute('data-state'),
      rowKids: row ? [...row.children].map((c) => {
        const r = c.getBoundingClientRect();
        return { tag: c.tagName, slot: c.getAttribute('data-slot') || '', cls: (c.className || '').slice(0, 40), w: Math.round(r.width), txt: (c.textContent || '').slice(0, 26), svgs: [...c.querySelectorAll('svg')].map((s) => ({ w: Math.round(s.getBoundingClientRect().width), disp: getComputedStyle(s).display, cls: (s.getAttribute('class') || '').slice(0, 40) })) };
      }) : null,
      gradients: grad,
      pos: getComputedStyle(t).position,
    };
  });

  // —— model-retry 行:结构 + 状态锚 ——
  out.sections.retry = [...document.querySelectorAll('[data-chat-flow-kind="model-retry"]')].slice(0, 3).map((k) => {
    const dump = (el, d) => {
      if (!el || d > 5) return null;
      return {
        tag: el.tagName, attrs: [...el.attributes].filter((a) => a.name.startsWith('data-') || a.name === 'aria-' || a.name === 'role').map((a) => a.name + '=' + a.value.slice(0, 24)), cls: (el.className || '').toString().slice(0, 40),
        txt: (el.textContent || '').trim().slice(0, 40),
        kids: [...el.children].slice(0, 6).map((c) => dump(c, d + 1)),
      };
    };
    return dump(k, 0);
  });

  // —— turn-tail:产物行(deliverables) ——
  out.sections.turnTail = [...document.querySelectorAll('[data-chat-flow-kind="turn-tail"]')].slice(0, 2).map((t) => {
    const root = t.querySelector('[data-time-hover-root]') || t;
    return {
      rootTag: root.tagName, rootAttrs: [...root.attributes].map((a) => a.name + '=' + a.value.slice(0, 20)),
      rootDisplay: getComputedStyle(root).display, rootDir: getComputedStyle(root).flexDirection, rootAlign: getComputedStyle(root).alignItems,
      kids: [...root.children].map((c) => {
        const r = c.getBoundingClientRect();
        return { tag: c.tagName, slot: c.getAttribute('data-slot') || '', cls: (c.className || '').toString().slice(0, 44), disp: getComputedStyle(c).display, x: Math.round(r.left), w: Math.round(r.width), txt: (c.textContent || '').trim().slice(0, 30) };
      }),
    };
  });

  // —— mc-line-flash CSS 规则是否在 ——
  let rule = null;
  for (const ss of document.styleSheets) {
    try { for (const r of ss.cssRules) { if (r.selectorText && r.selectorText.includes('mc-line-flash')) rule = (rule || '') + r.selectorText + '{' + r.style.cssText.slice(0, 100) + '}'; } } catch (e) {}
  }
  out.sections.lineFlashRule = rule;
  return out;
});
console.log(JSON.stringify(report, null, 1));

// 滚到最后一屏截图基线
await page.evaluate(() => { const sc = document.querySelector('[data-conversation-scroll]'); if (sc) sc.scrollTop = sc.scrollHeight; });
await page.waitForTimeout(600);
await page.screenshot({ path: join(ROOT, 'shots', 'acc2-baseline.png') });
await browser.close();
