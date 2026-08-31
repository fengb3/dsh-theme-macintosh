// tools/acc2-check3.mjs — ⑥ compaction(修后)+ retry 四拍帧 + ④ 精测
import { boot, openSession, shotEl } from './live-common.mjs';

const { browser, page } = await boot();
const log = (...a) => console.log(...a);

// ═══ ⑥ 合成 compaction(修后头锚:kind 行内 button) ═══
await openSession(page, '请先认真思考一下 9.11 与 9.9');
await page.evaluate(() => {
  const fc = document.querySelector('[data-chat-flow]');
  if (!fc) return;
  const mk = (kind, title, summary) => {
    const wrap = document.createElement('div');
    wrap.setAttribute('data-chat-flow-kind', kind);
    wrap.innerHTML =
      '<div data-slot="conversation.chat.node" style="display: contents;">' +
      '<div class="gdEzaW_compactionRow">' +
      '<button type="button" class="gdEzaW_compactionButton" aria-expanded="false">' +
      '<span class="gdEzaW_compactionLeading" aria-hidden="true">' +
      '<span class="gdEzaW_compactionContextIcon" data-compaction-icon="context">▣</span>' +
      '<span class="gdEzaW_compactionDisclosure" data-compaction-disclosure="collapsed">▸</span>' +
      '</span>' +
      '<span class="gdEzaW_compactionTitle">' + title + '</span>' +
      '<span class="gdEzaW_compactionSep" aria-hidden="true"></span>' +
      '<span class="gdEzaW_compactionSummary">' + summary + '</span>' +
      '</button>' +
      '</div></div>';
    fc.appendChild(wrap);
  };
  mk('compaction', '压缩', '已压缩 · 42 项 · 12345 tokens');
  mk('manual-compaction', '手动压缩', '手动压缩完成 · 5 项 · 800 tokens');
});
await page.waitForTimeout(300);
{
  const el = await page.$('[data-chat-flow-kind="compaction"]');
  if (el) await shotEl(page, el, 'acc2-06-compaction-static.png', 16);
  // 开:flash 拍帧 + 落定帧
  await page.evaluate(() => { const b = document.querySelector('[data-chat-flow-kind="compaction"] button'); if (b) b.click(); });
  const beat = await page.evaluate(() => document.querySelector('[data-chat-flow-kind="compaction"]').className);
  log('⑥ comp beat0:', JSON.stringify(beat));
  const ec = await page.$('[data-chat-flow-kind="compaction"]');
  if (ec) await shotEl(page, ec, 'acc2-06-compaction-open-flash.png', 16); // 立即截(ghost→flash 拍内)
  await page.waitForTimeout(500);
  const settle = await page.evaluate(() => {
    const k = document.querySelector('[data-chat-flow-kind="compaction"]');
    return { cls: k.className, busy: k.dataset.busy || '', expanded: k.querySelector('button').getAttribute('aria-expanded') };
  });
  log('⑥ comp settled:', JSON.stringify(settle));
  const e2 = await page.$('[data-chat-flow-kind="compaction"]');
  if (e2) await shotEl(page, e2, 'acc2-06-compaction-open-settled.png', 16);
  // 合:flash 拍帧
  await page.evaluate(() => { const b = document.querySelector('[data-chat-flow-kind="compaction"] button'); if (b) b.click(); });
  const beat2 = await page.evaluate(() => document.querySelector('[data-chat-flow-kind="compaction"]').className);
  log('⑥ comp close beat0:', JSON.stringify(beat2));
  const e3 = await page.$('[data-chat-flow-kind="compaction"]');
  if (e3) await shotEl(page, e3, 'acc2-06-compaction-close-flash.png', 16);
  await page.waitForTimeout(500);
  // manual-compaction 开一帧
  await page.evaluate(() => { const b = document.querySelector('[data-chat-flow-kind="manual-compaction"] button'); if (b) b.click(); });
  const beat3 = await page.evaluate(() => document.querySelector('[data-chat-flow-kind="manual-compaction"]').className);
  log('⑥ manual beat0:', JSON.stringify(beat3));
  const e4 = await page.$('[data-chat-flow-kind="manual-compaction"]');
  if (e4) await shotEl(page, e4, 'acc2-06-manual-open-flash.png', 16);
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    for (const k of [...document.querySelectorAll('[data-chat-flow-kind="compaction"],[data-chat-flow-kind="manual-compaction"]')]) k.remove();
  });
}

// ═══ ⑥ retry 四拍帧(hello) ═══
await openSession(page, 'hello');
{
  await page.evaluate(() => { const s = document.querySelector('[data-chat-flow-kind="model-retry"] summary'); if (s) s.click(); });
  const beat = await page.evaluate(() => document.querySelector('[data-chat-flow-kind="model-retry"]').className);
  log('⑥ retry beat0:', JSON.stringify(beat));
  const el = await page.$('[data-chat-flow-kind="model-retry"]');
  if (el) await shotEl(page, el, 'acc2-06-retry-open-flash.png', 16);
  await page.waitForTimeout(500);
  const settle = await page.evaluate(() => {
    const k = document.querySelector('[data-chat-flow-kind="model-retry"]');
    return { cls: k.className, busy: k.dataset.busy || '', open: k.querySelector('details').open };
  });
  log('⑥ retry settled:', JSON.stringify(settle));
  const e2 = await page.$('[data-chat-flow-kind="model-retry"]');
  if (e2) await shotEl(page, e2, 'acc2-06-retry-open-settled.png', 16);
  await page.evaluate(() => { const s = document.querySelector('[data-chat-flow-kind="model-retry"] summary'); if (s) s.click(); });
  const beat2 = await page.evaluate(() => document.querySelector('[data-chat-flow-kind="model-retry"]').className);
  log('⑥ retry close beat0:', JSON.stringify(beat2));
  const e3 = await page.$('[data-chat-flow-kind="model-retry"]');
  if (e3) await shotEl(page, e3, 'acc2-06-retry-close-flash.png', 16);
  await page.waitForTimeout(500);
}

// ═══ ④ deliverables 精测(上一轮已产生文件,直接量) ═══
await openSession(page, '请先认真思考一下 9.11 与 9.9');
{
  const r = await page.evaluate(() => {
    const row = document.querySelector('[data-produced-files-row]');
    if (!row) return null;
    const grid = row.parentElement; // .P4kPIW_root(label+row 两列 grid)
    const tt = grid.closest('[data-chat-flow-kind="turn-tail"]');
    const gr = grid.getBoundingClientRect(), tr = tt.getBoundingClientRect();
    const rc = getComputedStyle(tt.querySelector('[data-time-hover-root]') || tt.firstElementChild);
    const actions = (tt.querySelector('[data-time-hover-root]') || tt.firstElementChild).lastElementChild;
    const ar = actions.getBoundingClientRect();
    return {
      rootAlign: rc.alignItems, gridLeft: Math.round(gr.left), tailLeft: Math.round(tr.left),
      leftAligned: Math.abs(gr.left - tr.left) < 6,
      gridW: Math.round(gr.width), actionsLeft: Math.round(ar.left),
      chips: [...row.querySelectorAll('button')].map((b) => b.textContent.trim()),
      label: (grid.firstElementChild.textContent || '').trim(),
    };
  });
  log('④ precise:', JSON.stringify(r));
  const grid = await page.evaluateHandle(() => document.querySelector('[data-produced-files-row]').parentElement);
  if (grid) await shotEl(page, grid, 'acc2-04-deliverables.png', 26);
}

await browser.close();
log('done');
