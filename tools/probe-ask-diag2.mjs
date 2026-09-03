// tools/probe-ask-diag2.mjs — 疑点③聚焦:plan 审批卡确认钮类别与挂载位(throwaway)
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

// 访问模式切 plan
const permOk = await pg.evaluate(() => {
  const btn = document.querySelector('[data-composer-card] button[aria-label^="访问模式"]');
  if (btn) { btn.click(); return true; }
  return false;
});
console.log('perm click:', permOk);
await pg.waitForTimeout(900);
const planMode = await pg.evaluate(() => {
  const items = [...document.querySelectorAll('body > div[role="menu"] [role="menuitem"]')];
  const it = items.find((x) => /计划|plan/i.test(x.textContent || ''));
  if (it) { it.click(); return (it.textContent || '').trim().slice(0, 24); }
  return null;
});
console.log('plan mode pick:', planMode);
await pg.waitForTimeout(600);

await pg.fill('[data-mc-dock] textarea', '请制定一个最小计划:在 README.md 末尾添加一行「ask 验收记录」。用计划提交通道把计划交给我审批,等我批准后再执行,除此之外什么都不要做。');
await pg.waitForTimeout(300);
await pg.click('[data-mc-dock] [data-mc-send]');
console.log('sent; polling plan card ...');

let hit = false;
for (let i = 0; i < 300; i++) {
  if (await pg.evaluate(() => !!document.querySelector('[data-plan-review-key]'))) { hit = true; break; }
  if (i % 40 === 39) console.log('...polling ' + (i + 1) + '/300');
  await pg.waitForTimeout(500);
}
if (!hit) { console.log('TIMEOUT no plan card'); await b.close(); process.exit(2); }
await pg.waitForTimeout(1000);

const d3 = await pg.evaluate(() => {
  const frame = document.querySelector('[data-plan-review-key]');
  const cs = (el) => { if (!el) return null; const c = getComputedStyle(el); return { cls: String(el.className).slice(0, 70), bg: c.backgroundColor, border: c.borderTopWidth + ' ' + c.borderTopStyle, shadow: c.boxShadow.slice(0, 44), radius: c.borderRadius, color: c.color }; };
  const sec = frame.querySelector('section');
  const btns = [...frame.querySelectorAll('button')];
  const inSec = (el) => !!el.closest('section');
  return {
    frameCls: String(frame.className).slice(0, 60),
    secAria: sec ? (sec.getAttribute('aria-label') || '').slice(0, 30) : null,
    secCls: sec ? String(sec.className).slice(0, 50) : null,
    btns: btns.map((x) => ({ text: (x.textContent || '').trim().slice(0, 12), cls: String(x.className).slice(0, 80), inSection: inSec(x) })),
    confirmCs: cs(btns.find((x) => /确认|批准|approve/i.test(x.textContent || ''))),
    rejectCs: cs(btns.find((x) => /拒绝|decline/i.test(x.textContent || ''))),
    strip: cs(frame.querySelector('[class*="strip"]')),
  };
});
console.log('PLAN:', JSON.stringify(d3, null, 1));
await pg.screenshot({ path: 'shots/diag-plan.png' });
await pg.evaluate(() => {
  const frame = document.querySelector('[data-plan-review-key]');
  const ok = frame && [...frame.querySelectorAll('button')].find((x) => /确认|批准|approve/i.test(x.textContent || ''));
  if (ok) ok.click();
});
await pg.waitForTimeout(2500);
console.log('[diag2] done(一次性会话留侧栏)。');
await b.close();
