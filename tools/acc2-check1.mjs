// tools/acc2-check1.mjs — 第一批静态项 live 验证(⑤①⑦⑨⑧成品态 + CSS 生效确认)
// 会话:「请先认真思考一下 9.11 与 9.9」(think 卡/context 行/turn-tail)+「hello」(retry 行)
import { boot, openSession, shotEl } from './live-common.mjs';

const { browser, page } = await boot();
const log = (...a) => console.log(...a);

// CSS 生效确认:新规则是否已入 head
const cssOk = await page.evaluate(() => {
  const style = document.querySelector('style[data-mc-root]');
  const t = style ? style.textContent : '';
  return {
    tri: t.includes('center/contain no-repeat') && /viewBox='0 0 6 11'/.test(t),
    iDoc: /viewBox='0 0 8 10'/.test(t) && t.includes('M0 0H6V1H8V10H0V0Z'),
    retryGated: t.includes(':has(details[data-active])::before'),
    retryChevronGone: t.includes('summary::after{content:none}'),
    sweepGone: t.includes('[data-disclosure-row]::after{content:none!important;background:none!important}'),
    tailLeft: /\[data-turn-tail\]\{display:flex;align-items:flex-start/.test(t),
    ctxLeadGone: /\[data-chat-flow-kind="context"\] \[data-disclosure-row\]>span:first-of-type\{display:none\}/.test(t),
  };
});
log('CSS rules:', JSON.stringify(cssOk));

await openSession(page, '请先认真思考一下 9.11 与 9.9');

// ═══ ⑤ context 行:leading 占位清理 ═══
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
      leadRect: lead ? JSON.stringify(lead.getBoundingClientRect()) : null,
      iconW: pb.width, iconRight: pr.left + parseFloat(pb.width),
      titleLeft: tr ? tr.left : null,
      gapIconToTitle: tr ? Math.round(tr.left - (pr.left + parseFloat(pb.width))) : null,
      chevrons: [...k.querySelectorAll('svg')].map((s) => ({ disp: getComputedStyle(s).display, w: Math.round(s.getBoundingClientRect().width) })),
    };
  });
  log('⑤ context:', JSON.stringify(r));
  const el = await page.$('[data-chat-flow-kind="context"]');
  if (el) await shotEl(page, el, 'acc2-05-context-leading.png');
}

// ═══ ① i-doc 图标 ═══
{
  const r = await page.evaluate(() => {
    const k = document.querySelector('[data-chat-flow-kind="context"]');
    if (!k) return null;
    const pb = getComputedStyle(k, '::before');
    return { w: pb.width, h: pb.height, mask: (pb.maskImage || pb.webkitMaskImage || '').slice(0, 120), color: pb.backgroundColor };
  });
  log('① i-doc:', JSON.stringify(r));
}

// ═══ ⑦ think 三角(像素 mask 版) ═══
{
  const r = await page.evaluate(() => {
    const t = document.querySelector('[data-variant="think"]');
    if (!t) return null;
    const row = t.querySelector('[data-disclosure-row]');
    const lead = row ? row.querySelector('span:first-of-type') : null;
    const pb = lead ? getComputedStyle(lead, '::before') : null;
    const svg = lead ? lead.querySelector('svg') : null;
    return {
      svgDisp: svg ? getComputedStyle(svg).display : 'none',
      pbW: pb ? pb.width : null, pbH: pb ? pb.height : null,
      mask: pb ? (pb.maskImage || '').slice(0, 90) : null,
      bg: pb ? pb.backgroundColor : null,
      expanded: row ? row.getAttribute('aria-expanded') : null,
      tf: pb ? pb.transform : null,
    };
  });
  log('⑦ think tri:', JSON.stringify(r));
  const el = await page.$('[data-variant="think"]');
  if (el) await shotEl(page, el, 'acc2-07-think-tri.png', 16);
  // 展开态 rotate
  await page.evaluate(() => { const row = document.querySelector('[data-variant="think"] [data-disclosure-row]'); if (row) row.click(); });
  await page.waitForTimeout(350);
  const rot = await page.evaluate(() => {
    const lead = document.querySelector('[data-variant="think"] [data-disclosure-row] span:first-of-type');
    return lead ? getComputedStyle(lead, '::before').transform : null;
  });
  log('⑦ expanded rotate:', rot);
  const el2 = await page.$('[data-variant="think"]');
  if (el2) await shotEl(page, el2, 'acc2-07-think-tri-open.png', 16);
  await page.evaluate(() => { const row = document.querySelector('[data-variant="think"] [data-disclosure-row]'); if (row) row.click(); });
  await page.waitForTimeout(300);
}

// ═══ ⑥ 顺手验一拍:think 开(捕获 flash 时刻) ═══
{
  await page.evaluate(() => { const row = document.querySelector('[data-variant="think"] [data-disclosure-row]'); if (row) row.click(); });
  await page.waitForTimeout(120); // 拍2 flash 窗口
  const cls = await page.evaluate(() => {
    const t = document.querySelector('[data-variant="think"]');
    return t ? { cls: t.className, busy: t.dataset.busy || '' } : null;
  });
  log('⑥ think open beat:', JSON.stringify(cls));
  const el = await page.$('[data-variant="think"]');
  if (el) await shotEl(page, el, 'acc2-06-think-open-flash.png', 16);
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => {
    const t = document.querySelector('[data-variant="think"]');
    return t ? { cls: t.className, busy: t.dataset.busy || '', expanded: t.querySelector('[data-disclosure-row]').getAttribute('aria-expanded') } : null;
  });
  log('⑥ after:', JSON.stringify(after));
  const el2 = await page.$('[data-variant="think"]');
  if (el2) await shotEl(page, el2, 'acc2-06-think-open-settled.png', 16);
  // 合上再来一帧
  await page.evaluate(() => { const row = document.querySelector('[data-variant="think"] [data-disclosure-row]'); if (row) row.click(); });
  await page.waitForTimeout(120);
  const el3 = await page.$('[data-variant="think"]');
  if (el3) await shotEl(page, el3, 'acc2-06-think-close-flash.png', 16);
  await page.waitForTimeout(400);
}

// ═══ context 卡开合四拍(⑥ 第二型) ═══
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

// 切 hello 会话看 retry 行
await openSession(page, 'hello');
// ═══ ⑧⑨ retry:成品态(无 data-active) ═══
{
  const r = await page.evaluate(() => {
    const k = document.querySelector('[data-chat-flow-kind="model-retry"]');
    if (!k) return null;
    const sum = k.querySelector('summary');
    const det = k.querySelector('details');
    const pb = getComputedStyle(k, '::before');
    const sa = sum ? getComputedStyle(sum, '::after') : null;
    return {
      activeAttr: det ? det.getAttribute('data-active') : 'no-details',
      anim: pb.animationName, animDur: pb.animationDuration,
      beforeVisible: pb.content !== 'none',
      sumAfterContent: sa ? sa.content : null,
      text: (sum ? sum.textContent : '').trim().slice(0, 40),
    };
  });
  log('⑧⑨ retry finished:', JSON.stringify(r));
  // 门控正向证:注入临时 data-active(仅本探针页内,验证 :has 规则触发)
  const gated = await page.evaluate(() => {
    const det = document.querySelector('[data-chat-flow-kind="model-retry"] details');
    if (!det) return null;
    det.setAttribute('data-active', '');
    const k = document.querySelector('[data-chat-flow-kind="model-retry"]');
    const pb = getComputedStyle(k, '::before');
    const anim = { name: pb.animationName, dur: pb.animationDuration, delay: pb.animationDelay };
    det.removeAttribute('data-active');
    return anim;
  });
  log('⑧ retry active-injected:', JSON.stringify(gated));
  const el = await page.$('[data-chat-flow-kind="model-retry"]');
  if (el) await shotEl(page, el, 'acc2-08-09-retry.png', 16);
}

await browser.close();
log('done');
