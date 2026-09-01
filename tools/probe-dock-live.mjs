// tools/probe-dock-live.mjs — dock 验收轮 live-runtime 勘定探针(一次性运行态勘定工具,收编入库)
// 用途: 经自绘坞真实发送恰好一条消息,全面勘定官方 composer 的 busy 运行态面貌 ——
//       SECTION A 官方卡底部钮全清单(idle) / SECTION B busy 时间线与 Stop/忙闲锚勘定 /
//       SECTION C module 图谱数据面 chunk 扫描 / SECTION D ctx 用量运行时文本搜索。
//       2026-09-01 验收轮1 的 MC_MAP dock 段回填值与 busy 判定裁定即出自本探针
//       (结论见 .superpowers/sdd/2026-09-01-macintosh-theme-dock/acceptance1-probe.md)。
// 用法: node tools/probe-dock-live.mjs   (宿主须运行于 127.0.0.1:3080;全量输出同步落盘
//       tools/probe-dock-live.out.txt —— 运行产物,不入库)
// 性质: 一次性运行态勘定(非门禁、非回归);官方卡全程只观察不点击;发送路径经自绘坞唯一通道。
import { chromium } from 'playwright';
import { appendFileSync, writeFileSync } from 'node:fs';

const OUT = new URL('./probe-dock-live.out.txt', import.meta.url);
writeFileSync(OUT, '');
const say = (s) => { console.log(s); appendFileSync(OUT, String(s) + '\n'); };

// ---------- page-side helpers (以 fn.toString() 注入 evaluate,页面内自足) ----------
function __brief(n) { return n.tagName + (typeof n.className === 'string' && n.className ? '.' + n.className.trim().split(/\s+/).slice(0, 3).join('.') : ''); }
function __path3(n) { const c = []; let p = n.parentElement; for (let i = 0; p && i < 3; i++) { c.push(__brief(p)); p = p.parentElement; } return c.join(' < '); }
function __selPath(n) {
  const parts = []; let e = n;
  for (let i = 0; e && e.nodeType === 1 && i < 6; i++) {
    let s = e.tagName.toLowerCase();
    if (e.id) s += '#' + e.id;
    else {
      if (typeof e.className === 'string' && e.className.trim()) s += '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.');
      for (const k of Object.keys(e.dataset || {})) { s += '[data-' + k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()) + ']'; break; }
      if (!/id|class|data-/.test(s)) { const idx = e && e.parentElement ? [...e.parentElement.children].filter((c) => c.tagName === e.tagName).indexOf(e) : -1; if (idx > 0) s += ':nth-of-type(' + (idx + 1) + ')'; }
    }
    parts.unshift(s); e = e.parentElement;
  }
  return parts.join(' > ');
}
function __detail(b) {
  return {
    aria: b.getAttribute('aria-label') || '', text: (b.textContent || '').trim().slice(0, 48),
    type: b.getAttribute('type') || '', title: b.getAttribute('title') || '',
    disabled: !!b.disabled, hidden: !!b.hidden, visible: !!(b.offsetParent || b.getClientRects().length),
    cls: String(b.className).slice(0, 90),
    dataAttrs: [...b.attributes].filter((x) => x.name.indexOf('data-') === 0).map((x) => x.name + '=' + String(x.value).slice(0, 24)).join(','),
    path3: __path3(b),
  };
}
function __bkey(b) { return (b.getAttribute('aria-label') || '') + '|' + (b.textContent || '').trim().slice(0, 24) + '|' + String(b.className).slice(0, 30); }
function __snap(known) {
  const card = document.querySelector('[data-composer-card]');
  const phaseEl = document.querySelector('div[data-phase]');
  const status = document.querySelector('[role="status"]');
  const dock = document.querySelector('[data-mc-dock] .composer');
  const btns = card ? [...card.querySelectorAll('button')] : [];
  return {
    core: {
      btns: btns.map((b) => ({ a: b.getAttribute('aria-label') || '', t: (b.textContent || '').trim().slice(0, 20), d: b.disabled ? 1 : 0, h: b.hidden ? 1 : 0, v: (b.offsetParent || b.getClientRects().length) ? 1 : 0 })),
      phase: phaseEl ? phaseEl.getAttribute('data-phase') : null,
      status: status ? (status.textContent || '').replace(/\s+/g, ' ').slice(0, 50) : null,
      len: card ? card.innerHTML.length : -1,
      cardDisplay: card ? getComputedStyle(card).display : null,
      ariaBusy: card ? (card.getAttribute('aria-busy') === null ? null : card.getAttribute('aria-busy')) : null,
      cardData: card ? [...card.attributes].filter((x) => x.name.indexOf('data-') === 0 || x.name === 'aria-busy').map((x) => x.name + '=' + String(x.value).slice(0, 16)).join(',') : null,
      mcState: dock ? (dock.getAttribute('data-mc-state') || '') : null,
      mcClass: dock ? String(dock.className).slice(0, 100) : null,
    },
    newBtns: btns.filter((b) => !known.includes(__bkey(b))).map(__detail),
  };
}
function __dumpCard() {
  const card = document.querySelector('[data-composer-card]');
  if (!card) return { NO_CARD: true };
  const btns = [...card.querySelectorAll('button')].map(__detail);
  const others = [...card.querySelectorAll('select, [role="combobox"], [role="listbox"], [role="switch"], [role="menu"], [role="button"], [contenteditable="true"], input:not([type="hidden"]), textarea')].map((n) => ({
    tag: n.tagName, role: n.getAttribute('role') || '', aria: n.getAttribute('aria-label') || '',
    placeholder: n.getAttribute('placeholder') || '', disabled: n.disabled === undefined ? null : !!n.disabled,
    hidden: !!n.hidden, cls: String(n.className).slice(0, 70), path3: __path3(n),
  }));
  const cardAttrs = [...card.attributes].map((a) => a.name + '=' + String(a.value).slice(0, 40)).join(' ');
  return { cardAttrs, btns, others, childTags: [...card.children].map(__brief).slice(0, 30) };
}
function __usageScan() {
  const re = /(\d+(?:\.\d+)?k?\s*\/\s*\d+k?\s*tok)|((?:上下文|context)\s*[:：]?\s*\d+%)|(usage)/i;
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    const t = el.textContent || '';
    const m = t.match(re);
    if (!m) continue;
    let childMatch = false;
    for (const c of el.children) { if (re.test(c.textContent || '')) { childMatch = true; break; } }
    if (childMatch) continue;
    out.push({
      m: m[0].slice(0, 60), text: t.replace(/\s+/g, ' ').trim().slice(0, 90), tag: el.tagName,
      cls: String(el.className).slice(0, 60), inDock: !!el.closest('[data-mc-dock]'),
      inCard: !!el.closest('[data-composer-card]'), visible: !!(el.offsetParent || el.getClientRects().length),
      path: __selPath(el),
    });
    if (out.length >= 10) break;
  }
  return out;
}
const HELPERS = [__brief, __path3, __selPath, __detail, __bkey].map((f) => f.toString()).join('\n');
const evalSnap = (known) => pg.evaluate('(function(){' + HELPERS + __snap.toString() + '; return __snap(' + JSON.stringify(known) + ');})()');
const evalDump = () => pg.evaluate('(function(){' + HELPERS + __dumpCard.toString() + '; return __dumpCard();})()');
const evalUsage = () => pg.evaluate('(function(){' + HELPERS + __usageScan.toString() + '; return __usageScan();})()');

// ============================== RUN ==============================
const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto('http://127.0.0.1:3080');
await pg.waitForTimeout(4000); // 主题注入 + 会话恢复
say('PROBE_LIVE_START ' + new Date().toISOString());

// ---------- SECTION A: 官方卡 idle 全清单 ----------
const A = await evalDump();
say('\n===== SECTION A: 官方卡底部钮全清单(idle) =====');
say(JSON.stringify(A, null, 1));

const idle0 = await evalSnap([]);
const idleKeys = [];
for (const nb of idle0.newBtns) idleKeys.push(nb.aria + '|' + nb.text.slice(0, 24) + '|' + nb.cls.slice(0, 30));
const idleSig = JSON.stringify(idle0.core);
say('\nIDLE_SIG: ' + idleSig);

// ---------- SECTION B: 自绘坞真实发送 → busy 轮询 ----------
say('\n===== SECTION B: busy 运行态面貌 =====');
const ts = new Date().toLocaleString('sv-SE').replace(' ', 'T');
const MSG = '验收轮运行态勘定 ' + ts;
const taSel = '[data-mc-dock] .composer textarea';
const sendSel = '[data-mc-send]';
const hasDock = await pg.evaluate(`(function(){ return { ta: !!document.querySelector(${JSON.stringify(taSel)}), send: !!document.querySelector(${JSON.stringify(sendSel)}), card: !!document.querySelector('[data-composer-card]') }; })()`);
say('DOCK_PRESENCE: ' + JSON.stringify(hasDock));
if (!hasDock.ta || !hasDock.send) {
  say('BLOCKED: 自绘坞 textarea/send 未找到,发送链路无法验证');
  console.error('BLOCKED');
  await b.close();
  process.exit(2);
}
await pg.fill(taSel, MSG);
await pg.click(sendSel);
await pg.waitForTimeout(400);
const sendEv = await pg.evaluate(`(function(){ const ta=document.querySelector(${JSON.stringify(taSel)}); const sd=document.querySelector(${JSON.stringify(sendSel)}); const dock=document.querySelector('[data-mc-dock] .composer'); return { taValueAfter: ta ? String(ta.value).slice(0,40) : null, sendDisabled: sd ? !!sd.disabled : null, mcState: dock ? (dock.getAttribute('data-mc-state')||'') : null, mcClass: dock ? String(dock.className).slice(0,100) : null }; })()`);
say('SEND_EVIDENCE(msg=' + MSG + '): ' + JSON.stringify(sendEv));

// 轮询: 200ms/刻,≥8s 快窗,总帽 240s;终态判定 = 签名回到 idle 且稳定 12 刻(~2.4s)
const ticks = [];
const seenKeys = [...idleKeys];
let lastSig = idleSig, stable = 0, sawBusy = false, endTick = -1, usageMid = null;
const T0 = Date.now();
const MAX_MS = 240000;
let i = 0;
while (Date.now() - T0 < MAX_MS) {
  const s = await evalSnap(seenKeys);
  for (const nb of s.newBtns) {
    seenKeys.push(nb.aria + '|' + nb.text.slice(0, 24) + '|' + nb.cls.slice(0, 30));
    say('NEWBTN t=' + (Date.now() - T0) + 'ms :: ' + JSON.stringify(nb));
  }
  const sig = JSON.stringify(s.core);
  if (sig !== idleSig) { sawBusy = true; stable = 0; } else { stable++; }
  const c = s.core;
  if (sig !== lastSig) {
    say('TICK t=' + (Date.now() - T0) + 'ms len=' + c.len + ' disp=' + c.cardDisplay + ' phase=' + c.phase + ' status=' + JSON.stringify(c.status) + ' ariaBusy=' + c.ariaBusy + ' cardData=' + JSON.stringify(c.cardData) + ' mc=' + c.mcState + ' btns=' + JSON.stringify(c.btns));
  } else if (i % 10 === 0) {
    say('TICK(heartbeat) t=' + (Date.now() - T0) + 'ms len=' + c.len + ' phase=' + c.phase + ' mc=' + c.mcState + ' stableIdle=' + stable);
  }
  if (sawBusy && !usageMid && Date.now() - T0 > 5000) { usageMid = await evalUsage(); say('USAGE_MID_RUN: ' + JSON.stringify(usageMid)); }
  lastSig = sig;
  ticks.push({ i, t: Date.now() - T0, ...c });
  i++;
  if (sawBusy && stable >= 12 && Date.now() - T0 > 8000) { endTick = i; say('RUN_END detected at t=' + (Date.now() - T0) + 'ms (idle 稳定 12 刻)'); break; }
  await pg.waitForTimeout(200);
}
if (endTick < 0) say('RUN_END: 未在 ' + MAX_MS + 'ms 内回到 idle 签名(或从未进入 busy);以末刻快照收尾');
say('TICKS_TOTAL=' + ticks.length + ' SAW_BUSY=' + sawBusy);

// 终态全量快照
const F = await evalDump();
say('\nFINAL_FULL_SNAPSHOT(运终/idle 回归): ' + JSON.stringify(F, null, 1));
const idleBtnKeys = A.NO_CARD ? [] : A.btns.map((x) => x.aria + '|' + x.text.slice(0, 24) + '|' + x.cls.slice(0, 30));
const finalBtnKeys = F.NO_CARD ? [] : F.btns.map((x) => x.aria + '|' + x.text.slice(0, 24) + '|' + x.cls.slice(0, 30));
say('BTN_DIFF idle→final: onlyIdle=' + JSON.stringify(idleBtnKeys.filter((k) => !finalBtnKeys.includes(k))) + ' onlyFinal=' + JSON.stringify(finalBtnKeys.filter((k) => !idleBtnKeys.includes(k))));
const usageEnd = await evalUsage();
say('USAGE_END: ' + JSON.stringify(usageEnd));

// ---------- SECTION C: 宿主 module 图谱数据面扫描 ----------
say('\n===== SECTION C: module 图谱数据面 chunk 扫描 =====');
const scanRes = await pg.evaluate(`(async function(){
  const seen = new Set(); const broad = []; const focus = []; const buckets = new Map();
  const BROAD = /(ctx|context|usage|token[s]?\\b|percent|percentage|conversation\\.input|composer\\.\\w+|input\\.model|input\\.plan|slashCommand|permission|mode\\b)/gi;
  const FOCUS = /(conversation\\.input[\\w.]*|composer\\.\\w+|input\\.model|input\\.plan|slashCommand|slash_command|slash-command|permissionMode|permission_mode|contextUsage|ctxUsage|allowedTools|permission\\s*[:=]|model\\s*[:=]\\s*["'][\\w.-]+)/g;
  async function scan(u) {
    if (seen.has(u) || seen.size > 80) return; seen.add(u);
    let t; try { t = await (await fetch(u)).text(); } catch (e) { return; }
    const fname = u.split('/').pop();
    let at = (idx) => { const pre = t.slice(0, idx); const line = pre.split('\\n').length; const col = idx - pre.lastIndexOf('\\n'); return line + ':' + col; };
    const ctx = (idx) => t.slice(Math.max(0, idx - 24), idx + 34).replace(/\\n/g, '⏎');
    let m; let perFile = 0;
    BROAD.lastIndex = 0;
    while ((m = BROAD.exec(t))) {
      const k = m[0].toLowerCase(); buckets.set(k, (buckets.get(k) || 0) + 1);
      if (broad.length < 120) broad.push(fname + ' @' + at(m.index) + ' :: [' + m[0] + '] …' + ctx(m.index) + '…');
      if (++perFile > 400) break;
    }
    FOCUS.lastIndex = 0; perFile = 0;
    while ((m = FOCUS.exec(t))) { if (focus.length < 80) focus.push(fname + ' @' + at(m.index) + ' :: [' + m[0] + '] …' + ctx(m.index) + '…'); if (++perFile > 200) break; }
    for (const imp of t.matchAll(/(?:from|import)\\s*"(\\.\\/[^"]+\\.js)"/g)) await scan(new URL(imp[1], u).href);
  }
  for (const s of [...document.querySelectorAll('script[src]')].map((x) => x.src)) await scan(s);
  const top = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, n]) => k + '×' + n);
  return { files: seen.size, broadTotal: [...buckets.values()].reduce((a, c) => a + c, 0), broadListed: broad.length, topBuckets: top, broad, focus };
})()`);
say('SCAN files=' + scanRes.files + ' broadTotal=' + scanRes.broadTotal + ' (listed ' + scanRes.broadListed + ', cap 120)');
say('TOP_BUCKETS: ' + scanRes.topBuckets.join('  '));
say('--- BROAD hits(file @line:col :: [match] …context…) ---');
say(scanRes.broad.join('\n') || '(无)');
say('--- FOCUS hits(高信号定向) ---');
say(scanRes.focus.join('\n') || '(无)');

// ---------- SECTION D: ctx 用量运行时文本搜索 ----------
say('\n===== SECTION D: ctx 用量运行时搜索 =====');
say('MID_RUN: ' + JSON.stringify(usageMid, null, 1));
say('END: ' + JSON.stringify(usageEnd, null, 1));

say('\nPROBE_LIVE_DONE');
await b.close();
