// tools/probe-ask-diag4.mjs — 疑点③再攻:经 agent 模式下拉(标准模式)切计划模式出审批卡(throwaway)
import { chromium } from 'playwright';
const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(2500);
await pg.evaluate(() => {
  const btn = [...document.querySelectorAll('button[aria-label="新建会话"]')].find((x) => !x.closest('[data-mc-finder]'));
  if (btn) btn.click();
});
await pg.waitForTimeout(1500);
// 找「标准模式」钮(hero 行或 composer)
const modeBtn = await pg.evaluate(() => {
  const cands = [...document.querySelectorAll('button')].filter((x) => /标准模式|模式/.test((x.textContent || '') + (x.getAttribute('aria-label') || '')) && !x.closest('[data-mc-finder]'));
  const btn = cands[0];
  if (!btn) return null;
  return { text: (btn.textContent || '').trim().slice(0, 20), aria: btn.getAttribute('aria-label') };
});
console.log('mode btn:', JSON.stringify(modeBtn));
if (modeBtn) {
  await pg.evaluate(() => {
    const cands = [...document.querySelectorAll('button')].filter((x) => /标准模式|模式/.test((x.textContent || '') + (x.getAttribute('aria-label') || '')) && !x.closest('[data-mc-finder]'));
    cands[0].click();
  });
  await pg.waitForTimeout(900);
  const picked = await pg.evaluate(() => {
    // 官方菜单可能是 role=menu 或普通浮层;全量扫可见浮层里的可点项
    const items = [...document.querySelectorAll('body > div [role="menuitem"], body > div[role="menu"] button, [role="listbox"] [role="option"]')];
    const texts = items.map((x) => (x.textContent || '').trim().slice(0, 20)).filter(Boolean);
    const it = items.find((x) => /计划|plan/i.test(x.textContent || ''));
    if (it) { it.click(); return { picked: (it.textContent || '').trim().slice(0, 20), all: texts }; }
    return { picked: null, all: texts };
  });
  console.log('mode menu:', JSON.stringify(picked));
  await pg.screenshot({ path: 'shots/diag-mode-menu.png' });
}
await b.close();
