// tools/probe-ask-diag7.mjs — 活体触发 plan 审批卡:找命令→触发→dump 按钮computed(throwaway)
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
// 敲 "/" 唤官方斜杠 listbox
await pg.fill('[data-mc-dock] textarea', '/');
await pg.waitForTimeout(1200);
const cmds = await pg.evaluate(() => {
  const opts = [...document.querySelectorAll('[role="listbox"] [role="option"], [role="listbox"] button')];
  return opts.map((x) => (x.textContent || '').trim().slice(0, 40)).filter(Boolean).slice(0, 20);
});
console.log('slash cmds:', JSON.stringify(cmds));
await pg.screenshot({ path: 'shots/diag-slash.png' });
await b.close();
