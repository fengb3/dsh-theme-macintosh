// tools/acc3-check.mjs — 验收三轮活体验证（②摘要积攒-吐出 / ④产物块宽 / ⑥五拍开合）
// ④⑥ 用现存会话静态验证;② 需 live 回合(send 一条触发 reasoning),走 verify-flow 同款管道
import { boot, openSession, send, shotEl } from './live-common.mjs';

const { browser, page } = await boot();
const log = (...a) => console.log(...a);

// ── ④ 产物行 chip:宽度应随文件名长度(非 20×20 方块) ──
log('openSession:', await openSession(page, '让DSH在局域网可被手机访问'));
{
  const r = await page.evaluate(() => {
    const root = document.querySelector('.P4kPIW_root');
    if (!root) return null;
    const chips = [...root.querySelectorAll('.P4kPIW_file')].map((c) => ({
      txt: (c.textContent || '').trim().slice(0, 24),
      w: Math.round(c.getBoundingClientRect().width),
      h: Math.round(c.getBoundingClientRect().height),
    }));
    const css = getComputedStyle(root.querySelector('.P4kPIW_file'));
    return { chips, border: css.borderTopWidth + ' ' + css.borderTopColor, bg: css.backgroundColor };
  });
  log('④ deliver chips:', JSON.stringify(r));
  const el = await page.$('.P4kPIW_root');
  if (el) await shotEl(page, el, 'acc3-04-deliver-chips.png', 14);
}

// ── ⑥ 五拍:think 卡头点击,采样 0/100/200/300/400ms 类序列 ──
{
  await openSession(page, 'Superpower skill 是否存在');
  const seq = [];
  const row = await page.$('[data-variant="think"] [data-disclosure-row]');
  if (row) {
    await row.click();
    for (let t = 0; t <= 4; t++) {
      await page.waitForTimeout(t === 0 ? 20 : 100);
      const cls = await page.evaluate(() => {
        const c = document.querySelector('[data-variant="think"]');
        return c ? c.className.replace(/^(\S+_root\s*)?/, '') + '|busy=' + (c.dataset.busy || '') : '';
      });
      seq.push(cls);
    }
    const el = await page.$('[data-variant="think"]');
    if (el) await shotEl(page, el, 'acc3-06-think-open-flash.png', 16); // 拍后快照(几何已变)
    await page.waitForTimeout(600);
  }
  log('⑥ beats:', JSON.stringify(seq));
  const el2 = await page.$('[data-variant="think"]');
  if (el2) await shotEl(page, el2, 'acc3-06-think-open-settled.png', 16);
}

// ── ② 摘要积攒-吐出:新会话发一条触发 reasoning,采样摘要文本变化节奏 ──
{
  await openSession(page, '新会话');
  await send(page, '请认真思考后用一句话回答:9.11 和 9.9 哪个大?');
  const samples = [];
  let sawFlash = false, sawFrozen = false;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(100);
    const s = await page.evaluate(() => {
      const span = document.querySelector('[data-variant="think"][data-state="running"] [data-follow-end]');
      if (!span) return null;
      return { txt: (span.textContent || '').slice(0, 30), flash: span.classList.contains('mc-line-flash') };
    });
    if (s) {
      if (s.flash) sawFlash = true;
      samples.push(s.txt);
    }
  }
  // 冻结判定:采样序列中出现「同一文本连停 ≥4 拍(400ms) 后跳变」
  let runs = [], cur = samples[0] || '', n = 0;
  for (const t of samples) { if (t === cur) n++; else { runs.push(n); cur = t; n = 1; } }
  runs.push(n);
  sawFrozen = runs.some((r) => r >= 4) && runs.length > 1;
  log('② flashSeen:', sawFlash, 'frozenSeen(≥400ms 停顿+跳变):', sawFrozen, 'runs:', JSON.stringify(runs.slice(0, 12)));
  const el = await page.$('[data-variant="think"]');
  if (el) await shotEl(page, el, 'acc3-02-think-summary.png', 16);
}

await browser.close();
log('done');
