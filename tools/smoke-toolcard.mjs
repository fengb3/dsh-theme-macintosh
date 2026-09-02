// tools/smoke-toolcard.mjs — 工具卡活体冒烟(实现期动作;非验收门禁)
// 用法: node tools/smoke-toolcard.mjs   (宿主须运行于 127.0.0.1:3080;须有含工具卡的会话)
// 断言: .mc-tool 在场 / 官方 [data-variant] 行退场 / 卡壳样式 / 开合 / 深浅两遍 / 零页面错误
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SHOTS = join(process.cwd(), 'shots');
mkdirSync(SHOTS, { recursive: true });
const errors = [];

const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
pg.on('pageerror', (e) => { errors.push('pageerror: ' + e.message); console.log('PAGEERROR: ' + e.message.slice(0, 400)); });
pg.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)); });

await pg.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(8000); // 主题注入 + 会话恢复

// 切进工具密集会话(全新 profile 无恢复态)
await pg.evaluate(() => { for (const more of [...document.querySelectorAll('.mc-sb-more')]) { try { more.click(); } catch (e) {} } });
await pg.waitForTimeout(700);
const opened = await pg.evaluate(() => {
  const row = [...document.querySelectorAll('.mc-sess')].find((n) => ((n.getAttribute('title') || '')).startsWith('搜索胡锡进'));
  if (row) { row.click(); return row.getAttribute('title').slice(0, 40); }
  return null;
});
console.log('OPENED: ' + opened);
await pg.waitForTimeout(4000);

const report = { dark: {}, light: {}, errors };

report.dark = await pg.evaluate(() => {
  const r = {};
  const cards = document.querySelectorAll('.mc-tool');
  r.mcToolCount = cards.length;
  r.officialRows = document.querySelectorAll('[data-variant][data-tool]').length;
  r.subcallWraps = document.querySelectorAll('.mc-subcalls').length;
  r.spriteHasNew = !!(document.querySelector('#i-floppy') && document.querySelector('#i-balloon') && document.querySelector('#i-px-warning'));
  const card = cards[0];
  if (card) {
    const cs = getComputedStyle(card);
    r.firstCard = {
      border: cs.borderTopWidth + ' ' + cs.borderTopStyle,
      radius: cs.borderTopLeftRadius,
      shadow: cs.boxShadow.slice(0, 60),
      state: card.className.includes('mc-run') ? 'running' : card.className.includes('mc-fail') ? 'error' : 'ok',
    };
    const name = card.querySelector('.mc-t-name');
    const args = card.querySelector('.mc-t-args');
    const ic = card.querySelector('.mc-t-ic');
    r.head = {
      name: name ? name.textContent : '',
      args: args ? args.textContent.slice(0, 50) : '',
      icBox: ic ? getComputedStyle(ic).width : '',
      iconSvg: !!card.querySelector('.mc-t-ic use'),
      pill: card.querySelector('.mc-pill') ? card.querySelector('.mc-pill').className.replace('mc-pill', '').trim() : '',
    };
    r.bodyCollapsed = (() => { const bd = card.querySelector('.mc-tool-body'); return bd ? getComputedStyle(bd).height : 'none'; })();
  }
  r.pills = [...document.querySelectorAll('.mc-tool .mc-pill')].map((p) => p.className.replace('mc-pill', '').trim()).slice(0, 8);
  return r;
});

await pg.screenshot({ path: join(SHOTS, 'toolcard-smoke-dark.png') });

// 开合: 点第一张卡头 → .open 出现 + body 高度变化
const toggle = await pg.evaluate(() => {
  const card = document.querySelector('.mc-tool');
  if (!card) return { NO_CARD: true };
  const before = card.className + '|' + getComputedStyle(card.querySelector('.mc-tool-body')).height;
  try { card.querySelector('.mc-tool-head').click(); } catch (e) { return { before, CLICK_ERR: String(e) }; }
  return { before };
});
await pg.waitForTimeout(1200); // accToggle 四拍
toggle.after = await pg.evaluate(() => {
  const card = document.querySelector('.mc-tool');
  if (!card) return { GONE: true, mcToolCount: document.querySelectorAll('.mc-tool').length, officialRows: document.querySelectorAll('[data-variant][data-tool]').length, bodyKids: document.body.children.length };
  return card.className + '|' + getComputedStyle(card.querySelector('.mc-tool-body')).height;
});
toggle.changed = toggle.before !== toggle.after;
report.toggle = toggle;

// 深→浅
await pg.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
await pg.waitForTimeout(400);
report.light = await pg.evaluate(() => {
  const card = document.querySelector('.mc-tool');
  if (!card) return { NO_CARD: true };
  const cs = getComputedStyle(card);
  const ic = card.querySelector('.mc-t-ic');
  return {
    border: cs.borderTopColor,
    icBg: ic ? getComputedStyle(ic).backgroundColor : '',
    nameColor: getComputedStyle(card.querySelector('.mc-t-name')).color,
  };
});
await pg.screenshot({ path: join(SHOTS, 'toolcard-smoke-light.png') });
await pg.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });

await b.close();
console.log(JSON.stringify(report, null, 1));
const ok = report.dark.mcToolCount > 0 && report.dark.officialRows === 0 && report.dark.spriteHasNew && report.toggle.changed && errors.length === 0;
console.log(ok ? 'SMOKE GREEN' : 'SMOKE RED');
process.exit(ok ? 0 : 1);
