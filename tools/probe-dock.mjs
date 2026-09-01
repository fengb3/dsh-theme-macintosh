// tools/probe-dock.mjs — 宿主输入坞探针(2026-09;勘定 MC_MAP dock 段与镜像桥可行性)
// 用法: node tools/probe-dock.mjs   (宿主须运行于 127.0.0.1:3080)
// 勘察目标:
//  A. 官方 composer 区结构: [data-composer-card] 后代清单(tag/class/aria/placeholder/data-*)
//  B. 官方 textarea: 属性面(disabled/placeholder/aria-label) + native setter 镜像冒烟
//     (镜像后官方 Send 钮 disabled 态是否翻转 = React state 真被驱动的证据)
//  C. Send/Stop 钮: aria-label/文案/disabled/hidden;busy 面貌(data-phase/role=status)
//  D. composer 席位: [data-composer-seat] 及官方卡的 parentElement 链(挂载入口)
import { chromium } from 'playwright';
const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto('http://127.0.0.1:3080');
await pg.waitForTimeout(4000); // 主题注入 + 会话恢复

const cardDump = await pg.evaluate(() => {
  const card = document.querySelector('[data-composer-card]');
  if (!card) return { NO_CARD: true };
  const brief = (n) => n.tagName
    + (n.className && typeof n.className === 'string' ? '.' + n.className.slice(0, 40) : '')
    + (n.getAttribute && n.getAttribute('aria-label') ? `[aria-label=${n.getAttribute('aria-label')}]` : '')
    + (n.getAttribute && n.getAttribute('placeholder') ? `[placeholder=${n.getAttribute('placeholder')}]` : '')
    + (n.disabled ? '[disabled]' : '') + (n.hidden ? '[hidden]' : '');
  const kids = [...card.querySelectorAll('textarea, button, [contenteditable], input')].map(brief);
  const seat = card.closest('[data-composer-seat]');
  const chain = [];
  let p = card.parentElement;
  for (let i = 0; p && i < 5; i++) { chain.push(p.tagName + '.' + String(p.className).slice(0, 40) + (p.hasAttribute('data-composer-seat') ? '[data-composer-seat]' : '')); p = p.parentElement; }
  const phaseEl = document.querySelector('div[data-phase]');
  const status = document.querySelector('[role="status"]');
  return {
    cardAttrs: [...card.attributes].map((a) => a.name + '=' + a.value).join(' '),
    interactive: kids,
    seatPresent: !!seat, seatAttrs: seat ? [...seat.attributes].map((a) => a.name).join(',') : '',
    parentChain: chain,
    phase: phaseEl ? phaseEl.getAttribute('data-phase') : 'NO_PHASE_EL',
    statusText: status ? (status.textContent || '').slice(0, 80) : 'NO_STATUS',
    stopVisible: !!([...card.querySelectorAll('button')].find((x) => /stop|停止/i.test((x.textContent || '') + (x.getAttribute('aria-label') || '')))),
  };
});
console.log('COMPOSER_DUMP:\n' + JSON.stringify(cardDump, null, 1));

// B: native setter 镜像冒烟(镜像后立刻读回;再探官方 Send disabled 是否翻转)
const mirror = await pg.evaluate(() => {
  const ta = document.querySelector('[data-composer-card] textarea') || document.querySelector('[data-composer-card] [contenteditable="true"]');
  if (!ta) return { NO_FIELD: true };
  const isTa = ta.tagName === 'TEXTAREA';
  const proto = isTa ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const desc = Object.getOwnPropertyDescriptor(proto, 'value');
  const before = ta.value;
  const sendBtn = [...document.querySelectorAll('[data-composer-card] button')]
    .find((x) => /send|发送/i.test((x.textContent || '') + (x.getAttribute('aria-label') || '')));
  const disBefore = sendBtn ? sendBtn.disabled : null;
  let setError = null;
  try { desc.set.call(ta, 'PROBE_MIRROR_试'); ta.dispatchEvent(new window.Event('input', { bubbles: true })); }
  catch (e) { setError = String(e); }
  const after = ta.value;
  const disAfter = sendBtn ? sendBtn.disabled : null;
  // 还原草稿(清空镜像,不留痕)
  try { desc.set.call(ta, ''); ta.dispatchEvent(new window.Event('input', { bubbles: true })); } catch (e) {}
  return { isTa, hasNativeDesc: !!desc, before: before.slice(0, 20), after: after.slice(0, 20),
    mirrored: after === 'PROBE_MIRROR_试', sendBtnFound: !!sendBtn,
    sendDisabledBefore: disBefore, sendDisabledAfter: disAfter, setError };
});
console.log('MIRROR_SMOKE:\n' + JSON.stringify(mirror, null, 1));

// 追加进 probe-dock.mjs 末尾(await b.close() 之前)——抓页面 module 图谱逐 chunk 正则
const hits = await pg.evaluate(async () => {
  const seen = new Set(); const out = [];
  const re = /(conversation\.input\.dock|composer\.dock|conversation\.composer[\w.]*|input\.model|input\.plan|archiveSession|startSession)/g;
  async function scan(u) {
    if (seen.has(u) || seen.size > 80) return; seen.add(u);
    let t; try { t = await (await fetch(u)).text(); } catch (e) { return; }
    let m; while ((m = re.exec(t))) out.push(u.split('/').pop() + ' :: ' + m[1] + ' @line~' + t.slice(0, m.index).split('\n').length);
    for (const imp of t.matchAll(/(?:from|import)\s*"(\.\/[^"]+\.js)"/g)) await scan(new URL(imp[1], u).href);
  }
  for (const s of [...document.querySelectorAll('script[src]')].map((x) => x.src)) await scan(s);
  return out;
});
console.log('DEPLOY_SOURCE_HITS:\n' + (hits.join('\n') || '(无槽名/服务名命中)'));
console.log('PROBE_DONE');
await b.close();
