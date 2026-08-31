// tools/acc2-diag.mjs — ⑥ 失败诊断:listener 是否在、closest 路径是否通
import { boot, openSession } from './live-common.mjs';

const { browser, page } = await boot();
const log = (...a) => console.log(...a);

// CSS 与 mount 产物侧证
const css = await page.evaluate(() => {
  const t = document.querySelector('style[data-mc-root]').textContent;
  return { retryGated: t.includes(':has(details[data-active])::before'), compLead: t.includes(') button>span:first-of-type{display:none}') };
});
log('css:', JSON.stringify(css));

await openSession(page, 'hello');
const sel = await page.evaluate(() => {
  const s = document.querySelector('[data-chat-flow-kind="model-retry"] summary');
  if (!s) return { err: 'no summary' };
  const head = s.closest('[data-chat-flow-kind="model-retry"] summary');
  const card = head && head.closest('[data-chat-flow-kind="model-retry"]');
  return { headIsSummary: head === s, cardFound: !!card, cardKind: card ? card.getAttribute('data-chat-flow-kind') : null };
});
log('retry closest path:', JSON.stringify(sel));

// 点击 + 立即读类
const beat = await page.evaluate(() => new Promise((res) => {
  const s = document.querySelector('[data-chat-flow-kind="model-retry"] summary');
  if (!s) { res({ err: 'no summary' }); return; }
  s.click();
  setTimeout(() => {
    const k = document.querySelector('[data-chat-flow-kind="model-retry"]');
    res({ cls: k.className, busy: k.dataset.busy || '' });
  }, 60);
}));
log('retry click beat(60ms):', JSON.stringify(beat));
await page.waitForTimeout(500);

// think 头(已知 check1 过)对照:hello 有 think 卡
const beat2 = await page.evaluate(() => new Promise((res) => {
  const row = document.querySelector('[data-variant="think"] [data-disclosure-row]');
  if (!row) { res({ err: 'no think row' }); return; }
  row.click();
  setTimeout(() => {
    const t = document.querySelector('[data-variant="think"]');
    res({ cls: t.className, busy: t.dataset.busy || '' });
  }, 60);
}));
log('think click beat(60ms):', JSON.stringify(beat2));
await browser.close();
