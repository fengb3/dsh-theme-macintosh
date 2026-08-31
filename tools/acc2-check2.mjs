// tools/acc2-check2.mjs — 第二批 live 验证:④ 产物行靠左(真实写档回合) + ⑥ retry/compaction 四拍
// + ②③ 浅色轮 + ⑥ 合成 compaction(live 零节点,照宿主 CompactionItem 真实结构合成)
import { boot, openSession, send, shotEl, setTheme } from './live-common.mjs';

const { browser, page } = await boot();
const log = (...a) => console.log(...a);

// ═══ ④ deliverables:真实回合写一个文件 → turn-tail 产物行 ═══
await openSession(page, '请先认真思考一下 9.11 与 9.9');
log('sending file-write turn...');
await send(page, '请用写文件工具在 shots 目录创建 acc2-deliverable-demo.txt,内容一行:demo。不需要解释。');
let produced = null;
for (let i = 0; i < 200 && !produced; i++) {
  produced = await page.evaluate(() => document.querySelector('[data-produced-files-row]'));
  if (!produced) await page.waitForTimeout(1000);
}
log('④ produced row:', !!produced);
if (produced) {
  const r = await page.evaluate(() => {
    const tt = document.querySelector('[data-chat-flow-kind="turn-tail"]');
    const row = document.querySelector('[data-produced-files-row]');
    if (!tt || !row) return null;
    const tr = tt.getBoundingClientRect(), rr = row.getBoundingClientRect();
    const root = tt.querySelector('[data-time-hover-root]') || tt.firstElementChild;
    const rc = getComputedStyle(root);
    const actions = root.lastElementChild;
    const ar = actions ? actions.getBoundingClientRect() : null;
    return {
      rootAlign: rc.alignItems, rootDir: rc.flexDirection,
      rowLeft: Math.round(rr.left), rowW: Math.round(rr.width), rowRight: Math.round(rr.right),
      tailLeft: Math.round(tr.left), tailRight: Math.round(tr.right),
      actionsLeft: ar ? Math.round(ar.left) : null,
      leftAligned: Math.abs(rr.left - tr.left) < 8,
      label: (row.previousElementSibling ? row.previousElementSibling.textContent : '').trim(),
    };
  });
  log('④ probe:', JSON.stringify(r));
  const el = await page.$('[data-chat-flow-kind="turn-tail"]:has([data-produced-files-row])').catch(() => null);
  const el2 = el || await page.$('[data-produced-files-row]');
  await shotEl(page, el2, 'acc2-04-deliverables.png', 26);
}

// ═══ ⑥ 合成 compaction(live 零节点;结构照 CompactionItem L4301-4345 真实 JSX) ═══
{
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
  // 静态外观
  const el = await page.$('[data-chat-flow-kind="compaction"]');
  if (el) await shotEl(page, el, 'acc2-06-compaction-static.png', 16);
  const leadProbe = await page.evaluate(() => {
    const k = document.querySelector('[data-chat-flow-kind="compaction"]');
    const lead = k && k.querySelector('button>span:first-of-type');
    return lead ? getComputedStyle(lead).display : 'gone';
  });
  log('⑥ compaction leading hidden:', leadProbe);
  // 四拍:开(flash 帧 + 落定帧)+ 合(flash 帧)
  await page.evaluate(() => { const b = document.querySelector('[data-chat-flow-kind="compaction"] button'); if (b) b.click(); });
  await page.waitForTimeout(120);
  const beat = await page.evaluate(() => {
    const k = document.querySelector('[data-chat-flow-kind="compaction"]');
    return k ? k.className : null;
  });
  log('⑥ compaction open beat:', beat);
  const ec = await page.$('[data-chat-flow-kind="compaction"]');
  if (ec) await shotEl(page, ec, 'acc2-06-compaction-open-flash.png', 16);
  await page.waitForTimeout(450);
  const settle = await page.evaluate(() => {
    const k = document.querySelector('[data-chat-flow-kind="compaction"]');
    return k ? { cls: k.className, busy: k.dataset.busy || '' } : null;
  });
  log('⑥ compaction settled:', JSON.stringify(settle));
  // 手动压缩再来一帧(第二型容器)
  await page.evaluate(() => { const b = document.querySelector('[data-chat-flow-kind="manual-compaction"] button'); if (b) b.click(); });
  await page.waitForTimeout(120);
  const em = await page.$('[data-chat-flow-kind="manual-compaction"]');
  if (em) await shotEl(page, em, 'acc2-06-manual-open-flash.png', 16);
  await page.waitForTimeout(450);
  // 清理合成行
  await page.evaluate(() => {
    for (const k of [...document.querySelectorAll('[data-chat-flow-kind="compaction"],[data-chat-flow-kind="manual-compaction"]')]) k.remove();
  });
}

// ═══ ⑥ retry 四拍(hello 会话真实行) ═══
await openSession(page, 'hello');
{
  await page.evaluate(() => { const s = document.querySelector('[data-chat-flow-kind="model-retry"] summary'); if (s) s.click(); });
  await page.waitForTimeout(120);
  const beat = await page.evaluate(() => {
    const k = document.querySelector('[data-chat-flow-kind="model-retry"]');
    const d = k.querySelector('details');
    return k ? { cls: k.className, open: d.open } : null;
  });
  log('⑥ retry open beat:', JSON.stringify(beat));
  const el = await page.$('[data-chat-flow-kind="model-retry"]');
  if (el) await shotEl(page, el, 'acc2-06-retry-open-flash.png', 16);
  await page.waitForTimeout(450);
  const settle = await page.evaluate(() => {
    const k = document.querySelector('[data-chat-flow-kind="model-retry"]');
    return k ? { cls: k.className, busy: k.dataset.busy || '', open: k.querySelector('details').open } : null;
  });
  log('⑥ retry settled:', JSON.stringify(settle));
  const el2 = await page.$('[data-chat-flow-kind="model-retry"]');
  if (el2) await shotEl(page, el2, 'acc2-06-retry-open-settled.png', 16);
  // 合上(flash 帧)
  await page.evaluate(() => { const s = document.querySelector('[data-chat-flow-kind="model-retry"] summary'); if (s) s.click(); });
  await page.waitForTimeout(120);
  const el3 = await page.$('[data-chat-flow-kind="model-retry"]');
  if (el3) await shotEl(page, el3, 'acc2-06-retry-close-flash.png', 16);
  await page.waitForTimeout(400);
}

// ═══ ②③ 浅色轮:切浅 + 再来一轮 thinking ═══
const theme = await setTheme(page, '浅色');
log('theme:', theme);
await openSession(page, '请先认真思考一下 9.11 与 9.9');
log('sending light-mode thinking turn...');
await send(page, '浅色模式下请认真思考 7.7 与 7.07 哪个更大,思考长一些,一句话回答。');
let run2 = null;
for (let i = 0; i < 300 && !run2; i++) {
  run2 = await page.evaluate(() => document.querySelector('[data-variant="think"][data-state="running"]'));
  if (!run2) await page.waitForTimeout(200);
}
log('light running:', !!run2);
if (run2) {
  const sweep = await page.evaluate(() => {
    const row = document.querySelector('[data-variant="think"][data-state="running"] [data-disclosure-row]');
    const ra = getComputedStyle(row, '::after');
    return { content: ra.content, bg: ra.backgroundImage };
  });
  log('③-light sweep:', JSON.stringify(sweep));
  const el = await page.$('[data-variant="think"][data-state="running"]');
  await shotEl(page, el, 'acc2-03-light-running-nosweep.png', 16);
  // ② 浅色:冻结挂类截图(黑块)
  await page.evaluate(() => {
    const s = document.querySelector('[data-variant="think"][data-state="running"] [data-follow-end]');
    if (s) s.classList.add('mc-line-flash');
  });
  await page.waitForTimeout(120);
  const el2 = await page.$('[data-variant="think"][data-state="running"]');
  await shotEl(page, el2, 'acc2-02-light-frozen.png', 16);
  const bg = await page.evaluate(() => {
    const s = document.querySelector('.mc-line-flash');
    return s ? getComputedStyle(s, '::after').backgroundColor : null;
  });
  log('②-light flash bg:', bg);
  await page.evaluate(() => { const s = document.querySelector('.mc-line-flash'); if (s) s.classList.remove('mc-line-flash'); });
}

await browser.close();
log('done');
