// tools/probe-ask-diag3.mjs — 侦察:composer 访问模式钮的菜单结构(throwaway)
import { chromium } from 'playwright';
const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(2500);
const info = await pg.evaluate(() => {
  const btn = document.querySelector('[data-composer-card] button[aria-label^="访问模式"]');
  if (!btn) return { btn: null };
  return { aria: btn.getAttribute('aria-label'), title: btn.getAttribute('title'), haspopup: btn.getAttribute('aria-haspopup'), expanded: btn.getAttribute('aria-expanded'), text: (btn.textContent || '').slice(0, 40) };
});
console.log('perm btn:', JSON.stringify(info));
if (info.haspopup !== null || true) {
  await pg.evaluate(() => {
    const btn = document.querySelector('[data-composer-card] button[aria-label^="访问模式"]');
    if (btn) btn.click();
  });
  await pg.waitForTimeout(900);
  const menu = await pg.evaluate(() => {
    const out = { menus: [], dialogs: [], listboxes: [] };
    document.querySelectorAll('body > div[role="menu"]').forEach((m) => {
      out.menus.push([...m.querySelectorAll('[role="menuitem"]')].map((x) => (x.textContent || '').trim().slice(0, 30)));
    });
    document.querySelectorAll('[role="dialog"]').forEach((d) => {
      out.dialogs.push((d.textContent || '').trim().slice(0, 200));
    });
    document.querySelectorAll('[role="listbox"]').forEach((l) => {
      out.listboxes.push([...l.querySelectorAll('[role="option"]')].map((x) => (x.textContent || '').trim().slice(0, 30)));
    });
    return out;
  });
  console.log('after click:', JSON.stringify(menu, null, 1));
  await pg.screenshot({ path: 'shots/diag-perm-menu.png' });
}
await b.close();
