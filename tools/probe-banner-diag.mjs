// tools/probe-banner-diag.mjs — banner 舞台诊断(一次性;查 token 解析/hero 定位/卡片体)
import { chromium } from 'playwright';
import { join } from 'node:path';

const URL = 'http://127.0.0.1:3080';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const CARD = { sec: '工具卡', q: '.mc-tool', frameIdx: 0, idx: 1 };

const KIT_JS = () => {
  window.__mcx = {
    bySec(t) {
      return [...document.querySelectorAll('.kit-panel section')]
        .find((s) => { const h = s.querySelector('.kit-h'); return h && h.textContent === t; });
    },
    find(it) {
      let scope = this.bySec(it.sec);
      if (!scope) return null;
      if (it.frameIdx != null) scope = scope.querySelectorAll('.kit-frame')[it.frameIdx];
      if (!scope) return null;
      return scope.querySelectorAll(it.q)[it.idx || 0] || null;
    },
    diag(spec) {
      const st = document.createElement('div');
      st.id = 'mcx-banner';
      st.style.cssText = 'position:fixed;left:40px;top:30px;width:400px;height:200px;' +
        'background-color:var(--mc-bg);background-image:var(--mc-desktop-pattern);background-size:8px 8px;';
      document.body.appendChild(st);
      const heroSrc = this.find({ sec: '浮层', q: '.mc-hero' });
      const cardSrc = this.find(spec.card);
      const cs = (n) => (n ? getComputedStyle(n) : null);
      const pick = (c, keys) => (c ? Object.fromEntries(keys.map((k) => [k, c[k]])) : null);
      const heroC = heroSrc ? heroSrc.cloneNode(true) : null;
      const cardC = cardSrc ? cardSrc.cloneNode(true) : null;
      return {
        root: getComputedStyle(document.documentElement).getPropertyValue('--mc-bg'),
        rootPat: getComputedStyle(document.documentElement).getPropertyValue('--mc-desktop-pattern').slice(0, 60),
        bodyBg: getComputedStyle(document.body).backgroundColor,
        stageBg: getComputedStyle(st).backgroundColor,
        stagePat: getComputedStyle(st).backgroundImage.slice(0, 60),
        heroSrcStyle: pick(cs(heroSrc), ['position', 'top', 'bottom', 'left', 'marginTop', 'height', 'width']),
        heroSrcParent: heroSrc ? heroSrc.parentElement.className : null,
        heroCloneStyle: heroC ? pick(cs(heroC), ['position', 'marginTop', 'height']) : null,
        cardSrcH: cardSrc ? cardSrc.getBoundingClientRect().height : null,
        cardSrcScrollH: cardSrc ? cardSrc.scrollHeight : null,
        cardSrcParent: cardSrc ? cardSrc.parentElement.className : null,
        cardCloneH: cardC ? cardC.getBoundingClientRect().height : null,
        cardCloneKids: cardC ? [...cardC.children].map((k) => k.className + ':' + Math.round(k.getBoundingClientRect().height)).join(' | ') : null,
        htmlTheme: document.documentElement.dataset.theme,
        kitPanelCount: document.querySelectorAll('.kit-panel').length,
      };
    },
  };
};

const browser = await chromium.launch();
for (const theme of ['dark', 'light']) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const pg = await ctx.newPage();
  await pg.goto(URL, { waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(8000);
  await pg.evaluate((x) => { document.documentElement.dataset.theme = x; }, theme);
  await pg.addInitScript(() => { window.__MC_KIT_OPEN__ = true; });
  await pg.reload({ waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(9000);
  await pg.evaluate((x) => { document.documentElement.dataset.theme = x; }, theme);
  await pg.evaluate(KIT_JS);
  const d = await pg.evaluate((s) => window.__mcx.diag(s), { card: CARD });
  console.log('=== ' + theme + ' ===\n' + JSON.stringify(d, null, 1));
  await ctx.close();
}
await browser.close();
