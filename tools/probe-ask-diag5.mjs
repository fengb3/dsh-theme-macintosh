// tools/probe-ask-diag5.mjs — 测量:勾框vs文字几何/自定义行结构与类名(throwaway)
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
await pg.fill('[data-mc-dock] textarea', '调用 ask_user_question 问我一道多选题:question="测量",header="测",options=["选项甲","选项乙"],收到回答后结束回合。');
await pg.waitForTimeout(300);
await pg.click('[data-mc-dock] [data-mc-send]');
let hit = false;
for (let i = 0; i < 300; i++) {
  if (await pg.evaluate(() => !!document.querySelector('[data-question-key] [role="checkbox"]'))) { hit = true; break; }
  await pg.waitForTimeout(500);
}
if (!hit) { console.log('TIMEOUT'); await b.close(); process.exit(2); }
await pg.waitForTimeout(800);
const d = await pg.evaluate(() => {
  const frame = document.querySelector('[data-question-key]');
  const row = frame.querySelector('[role="checkbox"]');
  const box = row.querySelector('[class*="checkbox"]');
  const label = row.querySelector('[class*="optionLabel"]') || row.querySelector('[class*="Label"]');
  const line = row.querySelector('[class*="optionLine"]');
  const r = (el) => { const x = el.getBoundingClientRect(); return { top: +x.top.toFixed(1), h: +x.height.toFixed(1), cy: +(x.top + x.height / 2).toFixed(1), left: +x.left.toFixed(1) }; };
  const custom = frame.querySelector('[class*="customRow"]');
  const cs = (el) => el ? getComputedStyle(el) : null;
  return {
    box: r(box), label: r(label), line: line ? r(line) : null,
    boxMarginTop: cs(box).marginTop, rowPadTop: cs(row).paddingTop,
    labelLineHeight: cs(label).lineHeight + '/' + cs(label).fontSize + '/' + cs(label).fontFamily.slice(0, 30),
    customHtml: custom ? custom.outerHTML.slice(0, 500) : null,
    customCls: custom ? String(custom.className) : null,
    customBox: custom ? (custom.querySelector('[class*="checkbox"]') ? String(custom.querySelector('[class*="checkbox"]').className) : 'NO-CHECKBOX') : null,
  };
});
console.log(JSON.stringify(d, null, 1));
await pg.evaluate(() => { // 作答收尾
  const o = document.querySelector('[data-question-key] [role=checkbox][aria-checked="false"]');
  if (o) o.click();
});
await pg.waitForTimeout(400);
await pg.evaluate(() => {
  const card = document.querySelector('[data-question-key] section');
  const p = card && [...card.querySelectorAll('button')].find((x) => !x.disabled && /提交|下一题|Next|Submit/i.test(x.textContent || ''));
  if (p) p.click();
});
await pg.waitForTimeout(1500);
await b.close();
