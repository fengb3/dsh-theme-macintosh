// tools/acc6-check.mjs — 六轮活体验证(改版:统一 mcfx 协议):①摘要文本驻留 ②用户气泡白块=气泡面积 ③think 收尾 accToggle
import { boot, send, shotEl } from './live-common.mjs';
const { browser, page } = await boot();
const log = (...a) => console.log(...a);

// ② 用户气泡出场:白块应只盖气泡(bubble 尺寸),非整行
await page.evaluate(() => { const r = [...document.querySelectorAll('.mc-sess')][0]; if (r) r.click(); });
await page.waitForTimeout(2200);
await send(page, '请在思考(Think)过程里逐条列出至少 40 步详尽推理再作答:3 的 50 次方大约是 10 的多少次方?思考必须拉长。');
// 采样用户行 + think 卡
let bubbleFlash = null, userRowSeen = null;
for (let i = 0; i < 60; i++) {
  await page.waitForTimeout(50);
  const s = await page.evaluate(() => {
    const row = document.querySelector('[data-chat-flow-kind="user"]:last-of-type, [data-chat-flow-kind="user"]');
    const bubble = document.querySelector('.mc-user-bubble');
    const rowFlash = row ? row.className.includes('mc-flash') : null;
    const bubFlash = bubble ? bubble.className.includes('mc-flash') : null;
    return {
      hasOwn: !!bubble, hostBubble: !!document.querySelector('[data-chat-flow-kind="user"] .bubble, [data-align="end"]'),
      rowFlash, bubFlash,
      bubRect: bubble ? JSON.stringify([Math.round(bubble.getBoundingClientRect().width), Math.round(bubble.getBoundingClientRect().height)]) : null,
      rowW: row ? Math.round(row.getBoundingClientRect().width) : null,
    };
  });
  if (!userRowSeen && s.hasOwn) userRowSeen = s;
  if (s.bubFlash) bubbleFlash = s;
  if (userRowSeen && bubbleFlash) break;
}
log('② userRow:', JSON.stringify(userRowSeen));
log('② bubbleFlashFrame:', JSON.stringify(bubbleFlash));

// ①+③ 并发采样(顺序两段会在思考早已结束时才开跑,均扑空):同一循环里同时记
//   ① s-in 节拍(mc-ghost/mc-flash)与 ③ 卡级换形(run→done 过渡的 mc-flash + 终态类)
const seq = [];
let finishFlash = false, finalCls = null;
for (let i = 0; i < 220; i++) {
  await page.waitForTimeout(50);
  const s = await page.evaluate(() => {
    const sIn = document.querySelector('.mc-think.run .s-in');
    const card = document.querySelector('.mc-think');
    return {
      beat: sIn ? ((sIn.className.match(/mc-ghost|mc-flash/g) || []).join('+') || '-') : null,
      card: card ? { flash: card.className.includes('mc-flash'), cls: card.className } : null,
    };
  });
  if (s.beat !== null) seq.push(s.beat);
  if (s.card && s.card.flash) finishFlash = true;
  if (s.card && !s.card.cls.includes('run') && !s.card.flash) finalCls = s.card.cls;
  if (finalCls && !finalCls.includes('run') && finishFlash && seq.length > 20) break;
}
const runs = [];
for (const c of seq) { const l = runs[runs.length - 1]; if (l && l.c === c) l.n++; else runs.push({ c, n: 1 }); }
const visible = runs.filter((r) => r.c === '-').reduce((a, r) => a + r.n, 0);
const covered = seq.length - visible;
log('① beat runs(50ms/拍):', JSON.stringify(runs.slice(0, 12)), `可见 ${visible} vs 被遮 ${covered} 拍`);
log('③ finish accToggle flash seen:', finishFlash);
await page.waitForTimeout(1000);
const el = await page.$('.mc-user-bubble');
if (el) await shotEl(page, el, 'acc6-02-user-bubble.png', 14);
log('done:', await page.evaluate(() => {
  const t = document.querySelector('.mc-think');
  return t ? { cls: t.className, sum: (t.querySelector('.s-in') || {}).textContent } : null;
}));
await browser.close();
