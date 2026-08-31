// tools/dbg-user-bubble.mjs — 排查:气泡白边/margin 外扩 + 复制按钮缺失
import { boot, send } from './live-common.mjs';
const { browser, page } = await boot();
await page.evaluate(() => { const r = [...document.querySelectorAll('.mc-sess')][0]; if (r) r.click(); });
await page.waitForTimeout(1500);
await send(page, '你好,这是排查气泡样式的测试消息。');
await page.waitForTimeout(2500);
const info = await page.evaluate(() => {
  const bub = document.querySelector('.mc-user-bubble');
  if (!bub) return { err: 'no bubble' };
  const cs = getComputedStyle(bub);
  const pick = (el) => {
    if (!el) return null;
    const c = getComputedStyle(el);
    return {
      tag: el.tagName, cls: el.className && el.className.baseVal !== undefined ? el.className.baseVal : String(el.className || ''),
      background: c.backgroundColor, border: c.border, padding: c.padding, margin: c.margin,
      outline: c.outline, boxShadow: c.boxShadow, w: Math.round(el.getBoundingClientRect().width),
      h: Math.round(el.getBoundingClientRect().height),
    };
  };
  const kids = [...bub.children].map(pick);
  // 找白底/大padding的子孙
  const offenders = [];
  bub.querySelectorAll('*').forEach((el) => {
    const c = getComputedStyle(el);
    const bg = c.backgroundColor;
    const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    const bright = m && (+m[1] > 200 && +m[2] > 200 && +m[3] > 200);
    if (bright || (c.padding !== '0px' && parseFloat(c.padding) > 6)) offenders.push(pick(el));
  });
  return {
    bubble: { cs: { border: cs.border, padding: cs.padding, margin: cs.margin, background: cs.backgroundColor, maxWidth: cs.maxWidth }, rect: [Math.round(bub.getBoundingClientRect().width), Math.round(bub.getBoundingClientRect().height)] },
    parentChain: (() => { const a = []; let el = bub.parentElement; for (let i = 0; i < 4 && el; i++, el = el.parentElement) a.push(pick(el)); return a; })(),
    kids, offenders: offenders.slice(0, 6),
    childCount: bub.children.length,
    // 复制相关:宿主 user 行原先的复制钮在哪
    hostCopyBtns: [...document.querySelectorAll('[data-chat-flow-kind="user"] button, .mc-user-row button')].map((b) => b.className),
  };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
