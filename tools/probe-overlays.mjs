// tools/probe-overlays.mjs — overlays 批2 勘定探针(实现期动作)
import { chromium } from 'playwright';
const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(8000);

// A. hero 相：ConversationRoot data-phase 实值 + 官方空态内容 DOM
const hero = await pg.evaluate(() => {
  const root = document.querySelector('[data-phase]');
  const scroll = document.querySelector('[data-conversation-scroll]');
  const dump = (n) => n ? n.outerHTML.slice(0, 600) : null;
  return {
    phase: root ? root.getAttribute('data-phase') : null,
    rootTag: root ? root.tagName + '.' + root.className : null,
    scrollChildren: scroll ? [...scroll.children].map((c) => c.tagName + '.' + String(c.className).slice(0, 80)) : null,
    officialHeroHtml: scroll ? dump(scroll.firstElementChild) : null,
  };
});
console.log('A.hero:', JSON.stringify(hero, null, 2));

// B. 设置弹窗：触发钮 + portal/card/nav/backdrop DOM（点开 dump 后 Esc 关）
const trig = await pg.evaluate(() => {
  const cand = [...document.querySelectorAll('button,[role=button],[aria-label],[title]')].filter((n) =>
    /设置|settings|偏好|preferences/i.test((n.getAttribute('aria-label') || '') + (n.getAttribute('title') || '') + String(n.className)));
  return cand.map((n) => ({ tag: n.tagName, cls: String(n.className).slice(0, 80), aria: n.getAttribute('aria-label'), title: n.getAttribute('title') }));
});
console.log('B.triggers:', JSON.stringify(trig, null, 2));
// 取第一个候选点开（探针手工调参阶段允许试错重跑）
await pg.evaluate(() => { const el = document.querySelector('[aria-label*="设置"],[title*="设置"]'); if (el) el.click(); });
await pg.waitForTimeout(1200);
const dlg = await pg.evaluate(() => {
  const card = document.querySelector('[role="dialog"]');
  const chain = []; let n = card;
  while (n && n !== document.body) { chain.push(n.tagName + '.' + String(n.className).slice(0, 60)); n = n.parentElement; }
  const prev = card ? card.previousElementSibling : null;
  const dump = (x) => x ? x.outerHTML.slice(0, 800) : null;
  return {
    cardCls: card ? String(card.className) : null,
    cardHtml: dump(card ? card.firstElementChild : null),
    portalChain: chain,
    backdropPrev: prev ? { tag: prev.tagName, cls: String(prev.className), cs: (({ position, zIndex, background }) => ({ position, zIndex, background }))(getComputedStyle(prev)) } : null,
    navHtml: dump(card ? card.querySelector('nav,[class*="nav"],aside') : null),
    switches: card ? card.querySelectorAll('button[role="switch"],input[type="checkbox"]').length : 0,
  };
});
console.log('B.dialog:', JSON.stringify(dlg, null, 2));
await pg.keyboard.press('Escape');
await pg.waitForTimeout(600);

// C. 确认框（若有会话：右键/三点菜单里的删除项弹 confirm——只 dump 不点确认）
const confirmDlg = await pg.evaluate(() => {
  const cards = [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')];
  return cards.map((c) => ({ role: c.getAttribute('role'), cls: String(c.className).slice(0, 80), text: (c.textContent || '').slice(0, 120) }));
});
console.log('C.confirms:', JSON.stringify(confirmDlg, null, 2));
await b.close();
