// tools/verify-ask.mjs — ask 批活体门禁(2026-09-03;复用 probe-ask.mjs v3 自治链路)
// 用法: node tools/verify-ask.mjs   (宿主须运行于 127.0.0.1:3080;一次性会话留侧栏,主人可删)
// 自治链路: GUI 新建会话 → 自绘坞发指令(新会话 agent 调 ask_user_question) → pending 断言 →
//           折叠态断言 → 选中反色断言 → 自动作答吃卡 → 坞归位断言 → kit 分区(addInitScript+reload)。
// 断言: 藏坞门控(:has 纯 CSS) / 卡壳直角+1px 边+pop 投影 / radio 环 mask / 选中整行反色 /
//       折叠 tri 双态旋转(展开 90°/折叠 0°) / prev 镜像+disabled / 作答后卡消坞归位 /
//       kit 问题卡分区(.kit-ask-* 静态样本:反色/chkOn mask/警示条 warn) / 零页面错误。
// 方法论(交接档 §1.3): ask 阻塞回合,勿同回合「起探针+发题」——本脚本 v3 自治形态(自问自答)为唯一推荐。
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SHOTS = join(process.cwd(), 'shots');
mkdirSync(SHOTS, { recursive: true });
let failures = 0;
const ok = (cond, label) => { if (cond) { console.log('PASS ' + label); } else { failures++; console.log('FAIL ' + label); } };

const INSTR = '请不要输出任何文字,直接调用 ask_user_question 工具问我一道单选题:' +
  'question="探针:主题 ask 卡勘定",header="探针",options=["A 勘定正常","B 需要重试"]。' +
  '收到回答后立即结束回合,不要再输出内容。';

const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errors = [];
pg.on('pageerror', (e) => errors.push(String(e.message).slice(0, 200)));

await pg.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(2500);

// —— A. 新建会话(官方钮;排除主题同名钮) → 等自绘坞挂载 ——
const created = await pg.evaluate(() => {
  const btn = [...document.querySelectorAll('button[aria-label="新建会话"]')].find((x) => !x.closest('[data-mc-finder]'));
  if (btn) { btn.click(); return true; }
  return false;
});
console.log('[verify-ask] new-session click:', created);
await pg.waitForTimeout(1500);
const dockReady = await pg.evaluate(() => {
  const dock = document.querySelector('[data-mc-dock]');
  return { ta: !!(dock && dock.querySelector('textarea')) };
});
if (!dockReady.ta) { console.log('[verify-ask] FATAL: dock textarea not ready'); await b.close(); process.exit(2); }

// —— B. 自绘坞发指令(真实用户路径) ——
await pg.fill('[data-mc-dock] textarea', INSTR);
await pg.waitForTimeout(300);
await pg.click('[data-mc-dock] [data-mc-send]');
console.log('[verify-ask] instruction sent; polling for pending card ...');

// —— C. 轮询 pending 卡(上限 150s) ——
let hit = false;
for (let i = 0; i < 300; i++) {
  if (await pg.evaluate(() => !!document.querySelector('[data-question-key]'))) { hit = true; break; }
  if (i % 40 === 39) console.log('[verify-ask] ...polling ' + (i + 1) + '/300');
  await pg.waitForTimeout(500);
}
if (!hit) { console.log('[verify-ask] TIMEOUT no pending card'); await b.close(); process.exit(2); }

// —— D. pending 断言:藏坞门控 / 卡壳皮 / radio 环 mask / prev 镜像 / fold 旋转 ——
// hex→rgb 归一(函数不可序列化进 evaluate → 挂 window;I 段 reload 后重挂)
await pg.evaluate(() => {
  window.__h2r = (h) => {
    const m = /^#([0-9a-f]{6})$/i.exec((h || '').trim());
    if (!m) return (h || '').trim();
    const n = parseInt(m[1], 16);
    return 'rgb(' + ((n >> 16) & 255) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255) + ')';
  };
});
const D = await pg.evaluate(() => {
  const h2r = window.__h2r;
  const cs = (el, pseudo) => getComputedStyle(el, pseudo || null);
  const card = document.querySelector('[data-question-key] section');
  const dock = document.querySelector('[data-mc-dock]');
  const radio = document.querySelector('[data-question-key] [role="radio"]');
  const rdoBefore = radio ? cs(radio, '::before') : null;
  const rootStyle = getComputedStyle(document.documentElement);
  const fg = h2r(rootStyle.getPropertyValue('--mc-fg'));
  const prev = [...document.querySelectorAll('[data-question-key] button[aria-label]')].find((x) => (x.getAttribute('aria-label') || '').indexOf('上一题') === 0);
  const fold = [...document.querySelectorAll('[data-question-key] button[aria-label]')].find((x) => (x.getAttribute('aria-label') || '').indexOf('收起问题卡片') === 0);
  const prog = document.querySelector('[data-question-key] [class*="progress"]');
  const num = radio ? radio.querySelector('[class*="number"]') : null;
  const eyebrow = document.querySelector('[data-question-key] [class*="eyebrow"]');
  const custom = document.querySelector('[data-question-key] [class*="customRow"]');
  const fieldEl = document.querySelector('[data-question-key] [class*="field"]');
  // 类名清单转储(常驻 INFO:Mbwy4a 族实形留档,防交接档形态勘误再犯)
  const clsInv = card ? [...new Set([...card.querySelectorAll('*')].map((x) => String(x.className).trim()).filter(Boolean))].slice(0, 40) : [];
  return {
    dockDisplay: dock ? cs(dock).display : 'absent',
    cardRadius: card ? cs(card).borderRadius : 'absent',
    cardBorder: card ? cs(card).borderTopWidth + ' ' + cs(card).borderTopStyle : 'absent',
    cardShadow: card ? cs(card).boxShadow : 'absent',
    rdoMask: rdoBefore ? (cs(radio, '::before').maskImage || rdoBefore.webkitMaskImage || '') : 'absent',
    prevMask: prev ? (cs(prev).maskImage || cs(prev).webkitMaskImage || '') : 'absent',
    prevTransform: prev ? cs(prev).transform : 'absent',
    prevOpacity: prev ? cs(prev).opacity : 'absent',
    prevDisabled: prev ? !!prev.disabled : null,
    foldTransform: fold ? cs(fold).transform : 'absent',
    foldSvgHidden: fold ? (!fold.querySelector('svg') || cs(fold.querySelector('svg')).display === 'none') : null,
    progress: prog ? (prog.textContent || '').trim() : 'absent',
    numberDisplay: num ? cs(num).display : 'absent',
    eyebrowIn: eyebrow ? true : false,
    customRing: custom ? (cs(custom, '::before').maskImage || cs(custom, '::before').webkitMaskImage || '') : 'absent',
    customBorder: custom ? cs(custom).borderTopColor : 'absent',
    fieldBg: fieldEl ? cs(fieldEl).backgroundColor : 'absent',
    clsInv: clsInv.join(' | ').slice(0, 600),
    fgResolved: fg,
  };
});
console.log('INFO 卡内类名清单: ' + D.clsInv);
ok(D.dockDisplay === 'none', 'D1 藏坞门控: pending 时自绘坞 display:none (' + D.dockDisplay + ')');
ok(D.cardRadius === '0px', 'D2 卡壳直角 (' + D.cardRadius + ')');
ok(D.cardBorder === '1px solid', 'D3 卡壳 1px 实线边 (' + D.cardBorder + ')');
ok(D.cardShadow !== 'none' && D.cardShadow !== 'absent', 'D4 卡壳 pop 投影在场 (' + String(D.cardShadow).slice(0, 40) + ')');
ok(D.rdoMask.indexOf('data:image/svg+xml') >= 0, 'D5 radio 环 ::before mask data-URI (' + D.rdoMask.slice(0, 46) + '…)');
ok(D.prevMask.indexOf('data:image/svg+xml') >= 0, 'D6 prev 钮 tri mask (' + D.prevMask.slice(0, 46) + '…)');
ok(D.prevTransform === 'matrix(-1, 0, 0, 1, 0, 0)', 'D7 prev scaleX(-1) 镜像 (' + D.prevTransform + ')');
ok(D.prevDisabled === true && D.prevOpacity === '0.35', 'D8 prev disabled+opacity .35 (' + D.prevDisabled + '/' + D.prevOpacity + ')');
ok(D.foldTransform === 'matrix(0, 1, -1, 0, 0, 0)', 'D9 折叠钮展开态 tri rotate(90deg) (' + D.foldTransform + ')');
ok(D.foldSvgHidden === true, 'D10 官方 svg 藏 (mask 代形)');
ok(D.progress !== 'absent' && D.progress.length > 0, 'D11 progress 页码在场 (' + D.progress + ')');
ok(D.numberDisplay === 'none', 'D12 单选隐数字(display:' + D.numberDisplay + ';裁定项,活体复核)');
ok(D.eyebrowIn, 'D13 eyebrow 题头小字锚命中');
ok(D.customRing.indexOf('data:image/svg+xml') >= 0, 'D14 自定义行选项化: ::before 像素环 (' + D.customRing.slice(0, 40) + '…)');
ok(D.customBorder === 'rgba(0, 0, 0, 0)' && D.fieldBg === 'rgba(0, 0, 0, 0)', 'D15 自定义行线框退役 (border=' + D.customBorder + ' fieldBg=' + D.fieldBg + ')');
await pg.screenshot({ path: join(SHOTS, 'ask-verify-pending.png') });

// —— E. 折叠态: 点收起 → scroll 卸载 + tri 回 0°(label 翻转同钮) → 复原 ——
const folded = await pg.evaluate(() => {
  const btn = [...document.querySelectorAll('[data-question-key] button[aria-label]')].find((x) => /收起问题卡片/.test(x.getAttribute('aria-label') || ''));
  if (btn) btn.click();
  return !!btn;
});
if (folded) {
  await pg.waitForTimeout(600);
  const E = await pg.evaluate(() => {
    const card = document.querySelector('[data-question-key] section');
    const fold = [...document.querySelectorAll('[data-question-key] button[aria-label]')].find((x) => /展开问题卡片/.test(x.getAttribute('aria-label') || ''));
    return {
      scrollGone: !document.querySelector('[data-question-key] [data-question-scroll]'),
      minimized: card ? /cardMinimized/.test(String(card.className)) : null,
      foldTransform: fold ? getComputedStyle(fold).transform : 'absent',
    };
  });
  ok(E.scrollGone === true, 'E1 折叠态卡体卸载 (data-question-scroll gone)');
  ok(E.foldTransform === 'none', 'E2 折叠态 tri 0deg (' + E.foldTransform + ')');
  await pg.evaluate(() => {
    const btn = [...document.querySelectorAll('[data-question-key] button[aria-label]')].find((x) => /展开问题卡片/.test(x.getAttribute('aria-label') || ''));
    if (btn) btn.click();
  });
  await pg.waitForTimeout(500);
} else {
  console.log('SKIP E (fold button not found)');
}

// —— F. 选中反色: 点未选 radio → 整行 fg 底 surface 字 + 环换 rdo-on(mask 变长) ——
const F = await pg.evaluate(() => {
  const rows = [...document.querySelectorAll('[data-question-key] [role="radio"]')];
  const target = rows.find((x) => x.getAttribute('aria-checked') !== 'true');
  if (!target) return { hit: false };
  target.click();
  return { hit: true };
});
if (F.hit) {
  await pg.waitForTimeout(500);
  const F2 = await pg.evaluate(() => {
    const h2r = window.__h2r;
    const on = document.querySelector('[data-question-key] [role="radio"][aria-checked="true"]');
    if (!on) return { hit: false };
    const cs = getComputedStyle(on);
    const before = getComputedStyle(on, '::before');
    return {
      hit: true,
      bg: cs.backgroundColor, fgText: cs.color,
      fg: h2r(getComputedStyle(document.documentElement).getPropertyValue('--mc-fg')),
      sf: h2r(getComputedStyle(document.documentElement).getPropertyValue('--mc-surface')),
      maskLen: (before.maskImage || before.webkitMaskImage || '').length,
      maskOn: before.maskImage || before.webkitMaskImage || '',
    };
  });
  ok(F2.hit && F2.bg === F2.fg, 'F1 选中行整行反色 fg 底 (' + F2.bg + ' = ' + F2.fg + ')');
  ok(F2.hit && F2.fgText === F2.sf, 'F2 选中行文字 surface 色 (' + F2.fgText + ' = ' + F2.sf + ')');
  ok(F2.maskOn.indexOf('data:image/svg+xml') >= 0 && F2.maskLen > (D.rdoMask ? D.rdoMask.length : 0), 'F3 选中环换 rdo-on (mask ' + F2.maskLen + ' > ' + (D.rdoMask || '').length + ')');
} else {
  console.log('SKIP F (no unchecked radio)');
}
await pg.screenshot({ path: join(SHOTS, 'ask-verify-inverted.png') });

// —— G. 自动作答吃卡(照 probe F: 循环至卡消,上限 12 轮) ——
for (let r = 0; r < 12; r++) {
  const gone = await pg.evaluate(() => !document.querySelector('[data-question-key]'));
  if (gone) break;
  await pg.evaluate(() => {
    const opt = document.querySelector('[data-question-key] [role=radio][aria-checked="false"],[data-question-key] [role=checkbox][aria-checked="false"]');
    if (opt) opt.click();
  });
  await pg.waitForTimeout(400);
  await pg.evaluate(() => {
    const card = document.querySelector('[data-question-key] section');
    if (!card) return;
    const primary = [...card.querySelectorAll('button[class*="_primary"],button[class*="primary"]')]
      .find((x) => !x.disabled && /下一题|提交|Next|Submit/i.test(x.textContent || ''));
    if (primary) primary.click();
  });
  await pg.waitForTimeout(900);
}
const H = await pg.evaluate(() => {
  const dock = document.querySelector('[data-mc-dock]');
  return { cardGone: !document.querySelector('[data-question-key]'), dockDisplay: dock ? getComputedStyle(dock).display : 'absent' };
});
ok(H.cardGone && H.dockDisplay === 'flex', 'H1 作答后卡消坞归位 (dock display ' + H.dockDisplay + ')');

// —— I. kit 问题卡分区(addInitScript 持久注入 + reload;verify-overlays F 段先例) ——
await pg.addInitScript(() => { window.__MC_KIT_OPEN__ = true; });
await pg.reload({ waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(9000); // 主题重挂节律
await pg.evaluate(() => { // reload 清窗 → 重挂 hex 归一
  window.__h2r = (h) => {
    const m = /^#([0-9a-f]{6})$/i.exec((h || '').trim());
    if (!m) return (h || '').trim();
    const n = parseInt(m[1], 16);
    return 'rgb(' + ((n >> 16) & 255) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255) + ')';
  };
});
const K = await pg.evaluate(() => {
  const cs = (el, p) => getComputedStyle(el, p || null);
  const h2r = window.__h2r;
  const cards = document.querySelectorAll('.kit-ask-card');
  const on = document.querySelector('.kit-ask-opt.on');
  const chkOn = document.querySelector('.kit-ask-opt.on .kit-ask-chk');
  const nav = document.querySelector('.kit-ask-nav');
  const strip = document.querySelector('.kit-ask-strip');
  const root = getComputedStyle(document.documentElement);
  return {
    cards: cards.length,
    onBg: on ? cs(on).backgroundColor : 'absent',
    fg: h2r(root.getPropertyValue('--mc-fg')),
    onMask: on ? (cs(on, '::before').maskImage || cs(on, '::before').webkitMaskImage || '') : 'absent',
    chkMask: chkOn ? (cs(chkOn).maskImage || cs(chkOn).webkitMaskImage || '') : 'absent',
    navMask: nav ? (cs(nav).maskImage || cs(nav).webkitMaskImage || '') : 'absent',
    stripBg: strip ? cs(strip).backgroundColor : 'absent',
    warn: h2r(root.getPropertyValue('--mc-warn')),
    field: !!document.querySelector('.kit-ask-field textarea'),
    plan: !!document.querySelector('.kit-ask-strip .kit-ask-dot'),
  };
});
ok(K.cards >= 2, 'I1 kit 问题卡分区: 双卡样本在场 (n=' + K.cards + ')');
ok(K.onBg === K.fg, 'I2 kit 单选选中反色 (' + K.onBg + ' = ' + K.fg + ')');
ok(K.onMask.indexOf('data:image/svg+xml') >= 0, 'I3 kit 选中环 rdo-on mask');
ok(K.chkMask.indexOf('data:image/svg+xml') >= 0, 'I4 kit 多选勾方框 chk-on mask');
ok(K.navMask.indexOf('data:image/svg+xml') >= 0, 'I5 kit 翻页钮 tri mask');
ok(K.field && K.plan, 'I6 kit 自由输入场+审批警示条圆点在场');
ok(K.stripBg === K.warn, 'I7 kit 警示条 warn 底 (' + K.stripBg + ' = ' + K.warn + ')');
await pg.screenshot({ path: join(SHOTS, 'ask-verify-kit.png') });

// —— J. 零页面错误 ——
ok(errors.length === 0, 'J1 零页面错误 (n=' + errors.length + (errors.length ? ': ' + errors[0] : ')'));

console.log(failures === 0 ? '\nverify-ask: ALL GREEN' : '\nverify-ask: ' + failures + ' FAIL');
console.log('[verify-ask] 一次性会话留侧栏(首条消息为题),主人可删。');
await b.close();
process.exit(failures === 0 ? 0 : 1);
