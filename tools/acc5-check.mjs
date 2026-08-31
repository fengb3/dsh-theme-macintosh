// tools/acc5-check.mjs — 五轮:摘要行 A→E 五阶段节拍活体验证
import { boot, send } from './live-common.mjs';
import { join } from 'node:path';
import { SHOTS } from './live-common.mjs';
const { browser, page } = await boot();
await page.evaluate(() => { const r = [...document.querySelectorAll('.mc-sess')][0]; if (r) r.click(); });
await page.waitForTimeout(2200);
await send(page, '请认真一步一步思考并详细推理:从 1 到 300 的整数里,数字 3 一共出现了多少次?请逐位分析,推理写长一点。');
// 密集采样 s-in 的类序列(mcut/flash)与文本,验证 A→E 节拍
const seq = [];
for (let i = 0; i < 90; i++) {
  await page.waitForTimeout(50);
  const s = await page.evaluate(() => {
    const sIn = document.querySelector('.mc-think.run .s-in');
    if (!sIn) return null;
    const r = sIn.getBoundingClientRect();
    return {
      cls: (sIn.className.match(/mcut|flash/g) || []).join('+') || '-',
      txt: (sIn.textContent || '').slice(0, 16),
      w: Math.round(r.width),
    };
  });
  if (s) seq.push(s);
}
// 压缩成状态段: [(cls,txt,w) × 连续拍数]
const runs2 = [];
for (const s of seq) {
  const last = runs2[runs2.length - 1];
  if (last && last.cls === s.cls && last.txt === s.txt) last.n++;
  else runs2.push({ cls: s.cls, txt: s.txt, w: s.w, n: 1 });
}
console.log('state runs (50ms/拍):', JSON.stringify(runs2.slice(0, 16)));
await page.waitForTimeout(3500);
console.log('done:', await page.evaluate(() => {
  const t = document.querySelector('.mc-think');
  return t ? { cls: t.className, sum: (t.querySelector('.s-in') || {}).textContent } : null;
}));
await browser.close();
