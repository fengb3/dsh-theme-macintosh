// tools/acc4-check.mjs — 四轮重写活体验证
// ①存量 assistant 消息经我们组件渲染(md 保真 + think 卡折叠态) ②开合五拍 ③流式缓冲吐出
import { boot, openSession, send, shotEl } from './live-common.mjs';
import { join } from 'node:path';
import { SHOTS } from './live-common.mjs';
const { browser, page } = await boot();
const log = (...a) => console.log(...a);

// ① 存量渲染
log('sess:', await openSession(page, 'Markdown 测试文本示例'));
const r1 = await page.evaluate(() => {
  const root = document.querySelector('.mc-amd-root');
  const think = document.querySelector('.mc-think');
  const md = document.querySelector('[data-chat-flow-kind="assistant-step"] h1, [data-chat-flow-kind="assistant-step"] h2');
  return {
    amdRoot: !!root,
    thinkCard: !!think,
    thinkCls: think ? think.className : null,
    thinkSum: think ? (think.querySelector('.s-in') || {}).textContent : null,
    tri: think ? !!(think.querySelector('svg.mc-tri use') || {}).href : null,
    mdH: md ? getComputedStyle(md).fontSize : null,
    hostThink: !!document.querySelector('[data-variant="think"]'),
  };
});
log('① settled:', JSON.stringify(r1));
{ const el = await page.$('.mc-amd-root'); if (el) await shotEl(page, el, 'acc4-01-settled-md.png', 20); }
{ const el = await page.$('.mc-think'); if (el) await shotEl(page, el, 'acc4-01-think-collapsed.png', 16); }

// ② 开合五拍(真延迟 flip:beat3 才 open)
{
  const seq = [];
  const head = await page.$('.mc-think-head');
  if (head) {
    await head.click();
    for (let i = 0; i <= 4; i++) {
      await page.waitForTimeout(i === 0 ? 30 : 100);
      seq.push(await page.evaluate(() => {
        const t = document.querySelector('.mc-think');
        return t ? t.className.replace(/^.*?(mc-think|$)/, (m) => m) + '|bodyH=' + Math.round(t.querySelector('.mc-think-body').getBoundingClientRect().height) : '';
      }));
    }
    await page.waitForTimeout(1200);
    const settled = await page.evaluate(() => {
      const t = document.querySelector('.mc-think');
      return { cls: t.className, bodyH: Math.round(t.querySelector('.mc-think-body').getBoundingClientRect().height) };
    });
    log('② beats:', JSON.stringify(seq));
    log('② settled:', JSON.stringify(settled));
    const el = await page.$('.mc-think');
    if (el) await shotEl(page, el, 'acc4-02-think-open.png', 16);
  }
}

// ③ 流式:新会话发消息,观察摘要块(只装新字)与正文 cover
await page.evaluate(() => { const r = [...document.querySelectorAll('.mc-sess')][0]; if (r) r.click(); });
await page.waitForTimeout(2200);
await send(page, '请认真一步一步思考并详细推理:从 1 到 500 的整数里,数字 5 一共出现了多少次?请逐位分析,推理写长一点。');
const samples = [];
for (let i = 0; i < 60; i++) {
  await page.waitForTimeout(100);
  const s = await page.evaluate(() => {
    const card = document.querySelector('.mc-think.run');
    if (!card) return null;
    const sIn = card.querySelector('.s-in');
    const cover = card.querySelector('.mc-app-cover');
    return {
      sum: (sIn ? sIn.textContent : '').slice(0, 24),
      flash: sIn ? sIn.classList.contains('flash') : false,
      coverW: cover ? Math.round(cover.getBoundingClientRect().width) : 0,
      open: card.classList.contains('open'),
    };
  });
  if (s) samples.push(s);
}
const flashFrames = samples.filter((s) => s.flash).length;
const coverFrames = samples.filter((s) => s.coverW > 0).length;
log('③ samples:', JSON.stringify(samples.slice(0, 14)));
log('③ flashFrames:', flashFrames, 'coverFrames:', coverFrames);
if (flashFrames) {
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(60);
    const f = await page.evaluate(() => {
      const s = document.querySelector('.mc-think.run .s-in');
      return s ? s.classList.contains('flash') : false;
    });
    if (f) { await page.screenshot({ path: join(SHOTS, 'acc4-03-summary-flash.png'), fullPage: false }); break; }
  }
}
await page.waitForTimeout(4000);
const done = await page.evaluate(() => {
  const t = document.querySelector('.mc-think');
  return t ? { cls: t.className, sum: (t.querySelector('.s-in') || {}).textContent } : null;
});
log('③ done:', JSON.stringify(done));
await browser.close();
log('done');
