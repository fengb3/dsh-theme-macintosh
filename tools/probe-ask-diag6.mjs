// tools/probe-ask-diag6.mjs — 实证:multiSelect=true 的多选卡主题渲染(两选+叉框+反色)(throwaway)
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
await pg.fill('[data-mc-dock] textarea', '调用 ask_user_question 工具,注意必须设置 multiSelect=true,问我一道多选题:question="主题验收:多选渲染",header="验收",options=["选项甲","选项乙","选项丙"],收到回答后结束回合。');
await pg.waitForTimeout(300);
await pg.click('[data-mc-dock] [data-mc-send]');
let hit = false;
for (let i = 0; i < 300; i++) {
  if (await pg.evaluate(() => !!document.querySelector('[data-question-key] [role="checkbox"]'))) { hit = true; break; }
  await pg.waitForTimeout(500);
}
if (!hit) { console.log('TIMEOUT no checkbox rows'); await b.close(); process.exit(2); }
await pg.waitForTimeout(800);
const info = await pg.evaluate(() => ({
  containerRole: (document.querySelector('[data-question-key] [role="group"],[data-question-key] [role="radiogroup"]') || {}).getAttribute ? document.querySelector('[data-question-key] [role="group"],[data-question-key] [role="radiogroup"]').getAttribute('role') : null,
  chkCount: document.querySelectorAll('[data-question-key] [role="checkbox"]').length,
  customHasChk: !!document.querySelector('[data-question-key] [class*="customRow"] [class*="checkbox"]'),
}));
console.log('form:', JSON.stringify(info));
// 点选两枚
await pg.evaluate(() => {
  const rows = [...document.querySelectorAll('[data-question-key] [role="checkbox"][aria-checked="false"]')];
  if (rows[0]) rows[0].click();
});
await pg.waitForTimeout(400);
await pg.evaluate(() => {
  const rows = [...document.querySelectorAll('[data-question-key] [role="checkbox"][aria-checked="false"]')];
  if (rows[0]) rows[0].click();
});
await pg.waitForTimeout(600);
const sel = await pg.evaluate(() => {
  const ons = [...document.querySelectorAll('[data-question-key] [role="checkbox"][aria-checked="true"]')];
  return ons.map((x) => {
    const box = x.querySelector('[class*="checkbox"]');
    const mask = box ? (getComputedStyle(box).maskImage || getComputedStyle(box).webkitMaskImage || '') : '';
    return { text: (x.textContent || '').slice(0, 10), bg: getComputedStyle(x).backgroundColor, boxMask: mask.indexOf('data:image/svg+xml') >= 0 };
  });
});
console.log('selected:', JSON.stringify(sel, null, 1));
await pg.screenshot({ path: 'shots/diag-multi-true.png' });
// 收尾作答提交
await pg.evaluate(() => {
  const card = document.querySelector('[data-question-key] section');
  const p = card && [...card.querySelectorAll('button')].find((x) => !x.disabled && /提交|下一题|Next|Submit/i.test(x.textContent || ''));
  if (p) p.click();
});
await pg.waitForTimeout(2000);
await b.close();
console.log('done');
