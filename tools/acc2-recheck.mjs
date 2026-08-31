// tools/acc2-recheck.mjs — 验收二轮复验（2026-09 复跑）：指向现存会话
// ⑤①⑦⑥(think/context 卡) 活体 DOM 断言 + 截图刷新；⑧⑨③④ 以 CSS 规则命中为证
import { boot, openSession, shotEl } from './live-common.mjs';

const SESSION = 'Superpower skill 是否存在';
const { browser, page } = await boot();
const log = (...a) => console.log(...a);

const cssOk = await page.evaluate(() => {
  const t = document.querySelector('style[data-mc-root]')?.textContent || '';
  return {
    tri: t.includes("center/contain no-repeat") && /viewBox='0 0 6 11'/.test(t),
    iDoc: /viewBox='0 0 8 10'/.test(t) && t.includes('M0 0H6V1H8V10H0V0Z'),
    retryGated: t.includes(':has(details[data-active])::before'),
    retryChevronGone: t.includes('summary::after{content:none}'),
    sweepGone: t.includes('[data-disclosure-row]::after{content:none!important;background:none!important}'),
    tailLeft: /\[data-turn-tail\]\{display:flex;align-items:flex-start/.test(t),
    ctxLeadGone: /\[data-chat-flow-kind="context"\] \[data-disclosure-row\]>span:first-of-type\{display:none\}/.test(t),
    flashZ: t.includes('.mc-line-flash::after{content:"";position:absolute;inset:-1px -2px;pointer-events:none;z-index:2'),
  };
});
log('CSS rules:', JSON.stringify(cssOk));

log('openSession:', await openSession(page, SESSION));

// ⑤ context 行 leading 占位
{
  const r = await page.evaluate(() => {
    const k = document.querySelector('[data-chat-flow-kind="context"]');
    if (!k) return null;
    const row = k.querySelector('[data-disclosure-row]');
    const lead = row ? row.querySelector('span:first-of-type') : null;
    const title = row ? row.children[1] : null;
    const pb = getComputedStyle(k, '::before');
    const pr = k.getBoundingClientRect();
    const tr = title ? title.getBoundingClientRect() : null;
    return {
      leadDisp: lead ? getComputedStyle(lead).display : 'gone',
      gapIconToTitle: tr ? Math.round(tr.left - (pr.left + parseFloat(pb.width))) : null,
    };
  });
  log('⑤ context:', JSON.stringify(r));
  const el = await page.$('[data-chat-flow-kind="context"]');
  if (el) await shotEl(page, el, 'acc2-05-context-leading.png');
}

// ① i-doc 图标
{
  const r = await page.evaluate(() => {
    const k = document.querySelector('[data-chat-flow-kind="context"]');
    if (!k) return null;
    const pb = getComputedStyle(k, '::before');
    return { w: pb.width, h: pb.height, mask: (pb.maskImage || '').slice(0, 100) };
  });
  log('① i-doc:', JSON.stringify(r));
}

// ⑦ think 三角 + 展开态 rotate + ⑥ 开合四拍
{
  const r = await page.evaluate(() => {
    const t = document.querySelector('[data-variant="think"]');
    if (!t) return null;
    const row = t.querySelector('[data-disclosure-row]');
    const lead = row ? row.querySelector('span:first-of-type') : null;
    const pb = lead ? getComputedStyle(lead, '::before') : null;
    return { pbW: pb ? pb.width : null, pbH: pb ? pb.height : null, mask: pb ? (pb.maskImage || '').slice(0, 80) : null };
  });
  log('⑦ think tri:', JSON.stringify(r));
  const el = await page.$('[data-variant="think"]');
  if (el) await shotEl(page, el, 'acc2-07-think-tri.png', 16);

  // ⑥ 开：拍2 窗口
  await page.evaluate(() => { const row = document.querySelector('[data-variant="think"] [data-disclosure-row]'); if (row) row.click(); });
  await page.waitForTimeout(120);
  const beat = await page.evaluate(() => {
    const t = document.querySelector('[data-variant="think"]');
    return t ? { cls: t.className, busy: t.dataset.busy || '' } : null;
  });
  log('⑥ think open beat:', JSON.stringify(beat));
  const el2 = await page.$('[data-variant="think"]');
  if (el2) await shotEl(page, el2, 'acc2-06-think-open-flash.png', 16);
  await page.waitForTimeout(450);
  const after = await page.evaluate(() => {
    const t = document.querySelector('[data-variant="think"]');
    return t ? { cls: t.className, busy: t.dataset.busy || '' } : null;
  });
  log('⑥ after:', JSON.stringify(after));
  const el3 = await page.$('[data-variant="think"]');
  if (el3) await shotEl(page, el3, 'acc2-06-think-open-settled.png', 16);

  // ⑦ 展开 rotate
  const rot = await page.evaluate(() => {
    const lead = document.querySelector('[data-variant="think"] [data-disclosure-row] span:first-of-type');
    return lead ? getComputedStyle(lead, '::before').transform : null;
  });
  log('⑦ expanded rotate:', rot);
  const el4 = await page.$('[data-variant="think"]');
  if (el4) await shotEl(page, el4, 'acc2-07-think-tri-open.png', 16);
  await page.evaluate(() => { const row = document.querySelector('[data-variant="think"] [data-disclosure-row]'); if (row) row.click(); });
  await page.waitForTimeout(400);

  // ⑥ 合上一帧
  await page.evaluate(() => { const row = document.querySelector('[data-variant="think"] [data-disclosure-row]'); if (row) row.click(); });
  await page.waitForTimeout(120);
  const el5 = await page.$('[data-variant="think"]');
  if (el5) await shotEl(page, el5, 'acc2-06-think-close-flash.png', 16);
  await page.waitForTimeout(400);
  await page.evaluate(() => { const row = document.querySelector('[data-variant="think"] [data-disclosure-row]'); if (row) row.click(); });
  await page.waitForTimeout(300);
}

// ⑥ context 卡开合
{
  await page.evaluate(() => { const row = document.querySelector('[data-chat-flow-kind="context"] [data-disclosure-row]'); if (row) row.click(); });
  await page.waitForTimeout(120);
  const cls = await page.evaluate(() => {
    const k = document.querySelector('[data-chat-flow-kind="context"]');
    return k ? { cls: k.className } : null;
  });
  log('⑥ context open beat:', JSON.stringify(cls));
  const el = await page.$('[data-chat-flow-kind="context"]');
  if (el) await shotEl(page, el, 'acc2-06-context-open-flash.png', 16);
  await page.waitForTimeout(450);
  await page.evaluate(() => { const row = document.querySelector('[data-chat-flow-kind="context"] [data-disclosure-row]'); if (row) row.click(); });
  await page.waitForTimeout(400);
}

await browser.close();
log('done');
