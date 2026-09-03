// tools/probe-ask-diag8.mjs — /plan 进计划模式→审批卡活体 dump(throwaway;命令清单见 diag7)
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
// /plan 进计划模式(斜杠命令走消息提交,官方解析)
await pg.fill('[data-mc-dock] textarea', '/plan');
await pg.waitForTimeout(400);
await pg.click('[data-mc-dock] [data-mc-send]');
await pg.waitForTimeout(2500);
// 发任务
await pg.fill('[data-mc-dock] textarea', '制定一个最小计划:在 README.md 末尾添加一行「plan 验收记录」。提交计划等我审批,批准前不要执行。');
await pg.waitForTimeout(300);
await pg.click('[data-mc-dock] [data-mc-send]');
console.log('task sent; polling plan card ...');
let hit = false;
for (let i = 0; i < 300; i++) {
  if (await pg.evaluate(() => !!document.querySelector('[data-plan-review-key]'))) { hit = true; break; }
  if (i % 40 === 39) console.log('...polling ' + (i + 1) + '/300');
  await pg.waitForTimeout(500);
}
if (!hit) { console.log('TIMEOUT'); await b.close(); process.exit(2); }
await pg.waitForTimeout(1000);
const d = await pg.evaluate(() => {
  const frame = document.querySelector('[data-plan-review-key]');
  const cs = (el) => { const c = getComputedStyle(el); return { bg: c.backgroundColor, color: c.color, border: c.borderTopWidth + '/' + c.borderTopStyle + '/' + c.borderTopColor, shadow: c.boxShadow.slice(0, 40), radius: c.borderRadius }; };
  const sec = frame.querySelector('section');
  const btns = [...frame.querySelectorAll('button')];
  return {
    frameAttrs: [...frame.attributes].map((a) => a.name).join(','),
    secExists: !!sec,
    secCls: sec ? String(sec.className).slice(0, 50) : null,
    strip: cs(frame.querySelector('[class*="strip"]')),
    btns: btns.map((x) => ({ t: (x.textContent || '').trim().slice(0, 8), cls: String(x.className).slice(0, 60), cs: cs(x) })),
  };
});
console.log(JSON.stringify(d, null, 1));
await pg.screenshot({ path: 'shots/diag-plan-live.png' });
// 批准收尾
await pg.evaluate(() => {
  const frame = document.querySelector('[data-plan-review-key]');
  const ok = frame && [...frame.querySelectorAll('button')].find((x) => /确认|批准/.test(x.textContent || ''));
  if (ok) ok.click();
});
await pg.waitForTimeout(2500);
await b.close();
console.log('done');
