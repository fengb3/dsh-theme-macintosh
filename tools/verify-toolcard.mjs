// tools/verify-toolcard.mjs — 工具卡批活体门禁(2026-09-02)
// 用法: node tools/verify-toolcard.mjs   (宿主须运行于 127.0.0.1:3080)
// 断言: 自绘 .mc-tool 在场且官方行退场 / 卡壳样式 / 图标与 pill / 收起态 / 子调用(遇则断) /
//       深浅两遍 / kit 工具卡分区(六卡) / 零页面错误。拔演练已另录( Task 3 手工执行,见 plan)。
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SHOTS = join(process.cwd(), 'shots');
mkdirSync(SHOTS, { recursive: true });
const errors = [];
let failures = 0;
const ok = (cond, label) => { if (cond) { console.log('PASS ' + label); } else { failures++; console.log('FAIL ' + label); } };
const info = (label, val) => console.log('INFO ' + label + ' = ' + JSON.stringify(val));

const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
pg.on('pageerror', (e) => errors.push(String(e.message).slice(0, 200)));

await pg.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(8000);

// 切进工具密集会话(全新 profile 无恢复态)
await pg.evaluate(() => { for (const more of [...document.querySelectorAll('.mc-sb-more')]) { try { more.click(); } catch (e) {} } });
await pg.waitForTimeout(700);
await pg.evaluate(() => {
  const row = [...document.querySelectorAll('.mc-sess')].find((n) => ((n.getAttribute('title') || '')).startsWith('搜索胡锡进'));
  if (row) row.click();
});
await pg.waitForTimeout(4500);

// —— 深色断言 ——
const dark = await pg.evaluate(() => {
  const cards = [...document.querySelectorAll('.mc-tool')];
  const first = cards[0];
  const r = { count: cards.length, official: document.querySelectorAll('[data-variant][data-tool]').length };
  if (first) {
    const cs = getComputedStyle(first);
    r.border = cs.borderTopWidth + ' ' + cs.borderTopStyle;
    r.radius = cs.borderTopLeftRadius;
    r.shadow = cs.boxShadow.indexOf('0px 0px') >= 0 || cs.boxShadow.indexOf('3px') >= 0;
    r.iconSvg = !!first.querySelector('.mc-t-ic svg');
    r.iconUse = !!first.querySelector('.mc-t-ic use');
    const iconSvg = first.querySelector('.mc-t-ic svg');
    r.iconShape = iconSvg ? String(getComputedStyle(iconSvg).shapeRendering).toLowerCase() : 'n/a';
    r.icW = getComputedStyle(first.querySelector('.mc-t-ic')).width;
    r.pill = first.querySelector('.mc-pill') ? first.querySelector('.mc-pill').className.replace('mc-pill', '').trim() : '';
    const body = first.querySelector('.mc-tool-body');
    r.collapsedH = body ? getComputedStyle(body).height : 'none';
    r.metaCols = getComputedStyle(first.querySelector('.mc-t-meta')).flexDirection;
  }
  r.subcalls = document.querySelectorAll('.mc-subcalls').length;
  r.pillSet = [...new Set(cards.map((c) => (c.querySelector('.mc-pill') || { className: '' }).className.replace('mc-pill', '').trim()))];
  return r;
});
ok(dark.count > 0, '深色: 自绘工具卡在场 (n=' + dark.count + ')');
ok(dark.official === 0, '深色: 官方 ToolRow 行退场 (n=' + dark.official + ')');
if (dark.count > 0) {
  ok(dark.border === '1px solid', '深色: 卡壳 1px 实线边 (' + dark.border + ')');
  ok(dark.radius === '4px', '深色: 卡壳 4px 圆角 (' + dark.radius + ')');
  ok(dark.shadow, '深色: 硬投影在场');
  ok(dark.iconSvg, '深色: 图标 svg 在场 (DSH 默认图标,非 sprite use=' + dark.iconUse + ')');
  ok(dark.iconShape === 'crispedges', '深色: 图标像素风格渲染 (shape-rendering ' + dark.iconShape + ')');
  ok(dark.icW === '26px', '深色: 图标格 26px (' + dark.icW + ')');
  ok(dark.collapsedH === '0px', '深色: 落地卡默认收起 (body ' + dark.collapsedH + ')');
  ok(dark.metaCols === 'column', '深色: 双行 meta (flex-direction ' + dark.metaCols + ')');
}
ok(dark.pillSet.some((p) => p === 'done') || dark.pillSet.length === 0, '深色: done pill 在场 (' + dark.pillSet.join('/') + ')');
if (dark.subcalls > 0) {
  const sc = await pg.evaluate(() => { const el = document.querySelector('.mc-subcalls'); const cs = getComputedStyle(el); return { bl: cs.borderLeftWidth + ' ' + cs.borderLeftStyle, ml: cs.marginLeft }; });
  ok(sc.bl === '2px solid', '子调用: 左 2px 软线缩进 (' + sc.bl + ')');
} else { info('子调用', '本会话窗口无子调用卡 — 缩进断言跳过(合法)'); }
await pg.screenshot({ path: join(SHOTS, 'toolcard-verify-dark.png') });

// 开合: 点首卡 → open + body 展开;展开态断言直角化 + 像素字体(用户裁定 2026-09-02 二轮)
if (dark.count > 0) {
  const allCollapsed = await pg.evaluate(() => [...document.querySelectorAll('.mc-tool')].every((c) => !c.className.includes('open')));
  ok(allCollapsed, '裁定: 全部卡首登折叠(无 .open)');
  await pg.evaluate(() => { document.querySelector('.mc-tool .mc-tool-head').click(); });
  await pg.waitForTimeout(1100);
  const opened = await pg.evaluate(() => {
    const c = document.querySelector('.mc-tool');
    const tb = c.querySelector('.mc-tb-in');
    const inner = tb.querySelector('*');
    return {
      open: c.className.includes('open'),
      h: getComputedStyle(c.querySelector('.mc-tool-body')).height,
      tbRadius: getComputedStyle(tb).borderTopLeftRadius,
      innerRadius: inner ? getComputedStyle(inner).borderTopLeftRadius : 'n/a',
      blockRadius: (function () { const b = tb.querySelector('.mc-tool-block, pre, [class*="block"]'); return b ? getComputedStyle(b).borderTopLeftRadius : 'n/a'; })(),
      font: getComputedStyle(tb).fontFamily,
      innerFont: inner ? getComputedStyle(inner).fontFamily.slice(0, 60) : 'n/a',
    };
  });
  ok(opened.open && opened.h !== '0px', '开合: accToggle 后展开 (open=' + opened.open + ' h=' + opened.h + ')');
  ok(opened.tbRadius === '0px' && opened.innerRadius === '0px', '裁定: 展开体直角化 (tb=' + opened.tbRadius + ' inner=' + opened.innerRadius + ' block=' + opened.blockRadius + ')');
  ok(opened.font.indexOf('Fusion Pixel') >= 0, '裁定: 展开体像素字体 (' + opened.font.slice(0, 50) + ')');
  ok(opened.innerFont.indexOf('Fusion Pixel') >= 0, '裁定: 块内像素字体压平 (' + opened.innerFont + ')');
  await pg.evaluate(() => { document.querySelector('.mc-tool .mc-tool-head').click(); });
  await pg.waitForTimeout(1100);
}

// —— 浅色断言 ——
await pg.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
await pg.waitForTimeout(500);
const light = await pg.evaluate(() => {
  const card = document.querySelector('.mc-tool');
  if (!card) return { NO: 1 };
  return { border: getComputedStyle(card).borderTopColor, name: getComputedStyle(card.querySelector('.mc-t-name')).color };
});
if (!light.NO) {
  ok(light.border === 'rgb(10, 10, 10)', '浅色: 卡边转黑 (' + light.border + ')');
  ok(light.name === 'rgb(10, 10, 10)', '浅色: 名称转黑 (' + light.name + ')');
} else { ok(false, '浅色: 无卡可断'); }
await pg.screenshot({ path: join(SHOTS, 'toolcard-verify-light.png') });
await pg.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });

// —— kit 工具卡分区 ——
await pg.addInitScript(() => { window.__MC_KIT_OPEN__ = true; });
await pg.reload({ waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(9000);
const kit = await pg.evaluate(() => {
  const sec = [...document.querySelectorAll('section')].find((x) => x.querySelector('.kit-h') && x.querySelector('.kit-h').textContent === '工具卡');
  if (!sec) return { NO: 1 };
  return {
    cards: sec.querySelectorAll('.mc-tool').length,
    names: [...sec.querySelectorAll('.mc-t-name')].map((n) => n.textContent),
    fails: sec.querySelectorAll('.mc-tool.mc-fail').length,
  };
});
if (!kit.NO) {
  ok(kit.cards >= 5, 'kit: 工具卡分区样本在场 (n=' + kit.cards + ')');
  ok(kit.names.includes('cast_glyph_v9'), 'kit: 未知工具兜底卡 (cast_glyph_v9)');
  ok(kit.fails >= 2, 'kit: fail 红边样本在场 (n=' + kit.fails + ')');
  // —— IN 按钮闪烁（用户裁定：JsonBlock 裸 button 命中）——展开 read 样本卡 → 点 IN 钮 → 轮询闪类
  await pg.evaluate(() => {
    const sec = [...document.querySelectorAll('section')].find((x) => x.querySelector('.kit-h') && x.querySelector('.kit-h').textContent === '工具卡');
    const card = sec && sec.querySelector('.mc-tool');
    if (card) card.querySelector('.mc-tool-head').click();
  });
  await pg.waitForTimeout(1100);
  await pg.evaluate(() => {
    const sec = [...document.querySelectorAll('section')].find((x) => x.querySelector('.kit-h') && x.querySelector('.kit-h').textContent === '工具卡');
    const btn = sec && sec.querySelector('.mc-tool.open .mc-tool-body button');
    if (btn) btn.click();
  });
  let flashed = false;
  for (let i = 0; i < 12 && !flashed; i++) {
    flashed = await pg.evaluate(() => {
      const sec = [...document.querySelectorAll('section')].find((x) => x.querySelector('.kit-h') && x.querySelector('.kit-h').textContent === '工具卡');
      if (!sec) return false;
      return !!sec.querySelector('.mc-tool.open .mc-tool-body .mc-ghost, .mc-tool.open .mc-tool-body .mc-flash, .mc-tool.open .mc-tool-body .mcfx');
    });
    if (!flashed) await pg.waitForTimeout(80);
  }
  ok(flashed, '裁定: IN 按钮(JsonBlock)点击触发 flash 闪类');
} else { ok(false, 'kit: 工具卡分区缺失'); }
await pg.evaluate(() => { window.__MC_KIT_OPEN__ = false; });

ok(errors.length === 0, '零页面错误 (' + errors.length + ')');
await b.close();
console.log(failures === 0 ? 'VERIFY-TOOLCARD GREEN' : 'VERIFY-TOOLCARD RED (' + failures + ' failures)');
process.exit(failures === 0 ? 0 : 1);
