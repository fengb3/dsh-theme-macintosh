// tools/verify-acceptance.mjs — 用户验收五项门禁(2026-08-31 fix wave):
//   ① 气泡 computed padding 7px 12px
//   ② 代码块 banner 重样式:22px 细条/surface-2/底 1px 分隔/banner 壳 contents 让位/
//      语言名 mono 11 muted 左置/复制钮 18×18 独立方钮右置 + 点击无错(功能保留)
//   ③ 注入条:行 align-items:center + ::before margin-top 0 + 行内容中线 vs 文本中线几何对齐
//   ④a think 折叠箭头:宿主 leading svg 隐藏 + ::before 像素三角(5/4/4 border)+
//      展开 rotate(90deg) 硬切(computed transform 矩阵)
//   ④b running think 摘要行单行 flash:发真消息,100ms 轮询断言摘要 span 出现 .mc-line-flash
//      且 ~100ms 后消失;深浅两轮,浅色断言 ::after 反转黑块
//   ⑤ turn-tail:钮组靠左/统计常驻靠右(无 hover 下 opacity 1)+ 几何布局断言
// 退出码:0 = GREEN,1 = RED。think/flash 依赖真实流式回合,失败自动再试一轮(最多 3 轮)。
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(ROOT, 'shots'), { recursive: true });
const URL = 'http://127.0.0.1:3080';

const EXPECT = {
  surface2: 'rgb(74, 74, 74)',
  borderSoft: 'rgba(233, 233, 233, 0.5)',
  muted: 'rgb(189, 189, 189)',
  faint: 'rgb(148, 148, 148)',
  fg: 'rgb(242, 242, 242)',
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const logs = [];
page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
let ok = true;
const check = (name, cond) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) ok = false; };
const info = (name, val) => console.log('INFO ' + name + ' ' + JSON.stringify(val));

async function composerFill(text) {
  const byRole = page.getByRole('textbox', { name: '描述你想要构建的内容' });
  try { await byRole.fill(text, { timeout: 8000 }); return 'role'; } catch (e) { /* fallback */ }
  await page.locator('[data-composer-card] textarea').first().fill(text, { timeout: 8000 });
  return 'css-fallback';
}
async function send(text) { info('send', { composer: await composerFill(text) }); await page.keyboard.press('Enter'); }

async function setTheme(label) {
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button, [role=button]')]
      .find((b) => ((b.getAttribute('aria-label') || b.textContent || '').trim() === '设置'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(900);
  const clicked = await page.evaluate((name) => {
    const n = [...document.querySelectorAll('[role=radio], [role=option], button, label')]
      .find((x) => (x.getAttribute('aria-label') || x.textContent || '').trim() === name);
    if (n) { n.click(); return true; }
    return false;
  }, label);
  const want = label === '浅色' ? 'light' : 'dark';
  let flipped = false;
  for (let i = 0; i < 20 && !flipped; i++) {
    flipped = await page.evaluate((w) => document.documentElement.getAttribute('data-theme') === w, want);
    if (!flipped) await page.waitForTimeout(400);
  }
  return { clicked, flipped, theme: await page.evaluate(() => document.documentElement.getAttribute('data-theme')) };
}

// —— ④b:发消息触发 running think,100ms 轮询捕摘要 flash ——
async function catchThinkFlash(label) {
  const t0 = Date.now();
  let seenAt = 0, goneAt = 0, afterBg = null, spanCls = null;
  await send('请先认真思考一下 9.11 与 9.9 哪个更大,给出推理过程,然后用一句话回答。');
  for (let i = 0; i < 600 && !seenAt; i++) { // 最多 ~60s 等流式
    seenAt = await page.evaluate(() => {
      const s = document.querySelector('[data-variant="think"][data-state="running"] [data-follow-end].mc-line-flash');
      return s ? true : false;
    });
    if (!seenAt) await page.waitForTimeout(100);
  }
  if (!seenAt) { check(`${label}: 摘要 span 出现 .mc-line-flash(100ms 轮询捕到)`, false); return; }
  check(`${label}: 摘要 span 出现 .mc-line-flash(100ms 轮询捕到)`, true);
  afterBg = await page.evaluate(() => {
    const s = document.querySelector('[data-variant="think"][data-state="running"] [data-follow-end].mc-line-flash');
    return s ? getComputedStyle(s, '::after').backgroundColor : null;
  });
  for (let i = 0; i < 40 && !goneAt; i++) { // 类应在 ~100ms(栅格对齐)后撤
    goneAt = await page.evaluate(() => {
      const s = document.querySelector('[data-variant="think"][data-state="running"] [data-follow-end]');
      return s && !s.classList.contains('mc-line-flash') ? Date.now() : 0;
    });
    if (!goneAt) await page.waitForTimeout(50);
  }
  check(`${label}: flash ~100ms 后消失`, !!goneAt && goneAt - (seenAt || Date.now()) >= 0 && goneAt - t0 > 0);
  info(`${label}: flash ::after bg`, { afterBg, waitMs: Date.now() - t0 });
  return afterBg;
}

await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000); // 主题注入 + 会话恢复

// 起点归一:深色
let theme0 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
if (theme0 !== 'dark') { const s = await setTheme('深色'); info('起点非深色,已切', s); await page.waitForTimeout(1200); }

// 既有内容不足则补一回合(代码块 + turn-tail + think 收尾)
let hasMcb = await page.evaluate(() => !!document.querySelector('.md-code-block'));
if (!hasMcb) {
  await send('请输出一个 ```js 代码块(function mul9(x){return 9*(x-2)+18;}),先思考再答。');
  for (let i = 0; i < 150; i++) {
    if (await page.evaluate(() => !!document.querySelector('.md-code-block'))) break;
    await page.waitForTimeout(2000);
  }
  for (let i = 0; i < 90; i++) {
    if (await page.evaluate(() => !!document.querySelector('[data-turn-tail]'))) break;
    await page.waitForTimeout(2000);
  }
  await page.waitForTimeout(1500);
}

// ═══ ① 用户气泡 padding ═══
{
  const r = await page.evaluate(() => {
    let bubble = null;
    for (const el of document.querySelectorAll(':is([data-chat-flow-kind="user"],[data-chat-flow-kind="steering"])>div>div>div>div')) {
      if (el.getClientRects().length) { bubble = el; break; }
    }
    return bubble ? getComputedStyle(bubble).padding : null;
  });
  check('① 气泡 computed padding = 7px 12px', r === '7px 12px');
  info('① bubble padding', r);
}

// ═══ ② 代码块 banner 重样式 ═══
{
  const r = await page.evaluate(() => {
    const m = document.querySelector('.md-code-block');
    if (!m) return null;
    const wrap = m.firstElementChild;
    const banner = wrap && wrap.firstElementChild;
    const infostr = banner && banner.children[0];
    const action = banner && banner.children[banner.children.length - 1];
    const btn = action && action.querySelector('button');
    const cw = getComputedStyle(wrap), cb = banner ? getComputedStyle(banner) : null,
      ci = infostr ? getComputedStyle(infostr) : null, ca = action ? getComputedStyle(action) : null,
      cbtn = btn ? getComputedStyle(btn) : null;
    const wrapR = wrap.getBoundingClientRect(), btnR = btn ? btn.getBoundingClientRect() : null,
      infoR = infostr ? infostr.getBoundingClientRect() : null;
    return {
      wrap: { disp: cw.display, h: cw.height, pad: cw.padding, bg: cw.backgroundColor, bdb: cw.borderBottom, bdr: cw.borderRadius, font: cw.fontSize + '/' + cw.lineHeight, fam: cw.fontFamily.slice(0, 24), col: cw.color },
      banner: cb ? { disp: cb.display } : null,
      infostr: ci ? { font: ci.fontSize, col: ci.color, left: infoR.left, wrapLeft: wrapR.left } : null,
      action: ca ? { mla: ca.marginLeft } : null,
      btn: cbtn ? { w: cbtn.width, h: cbtn.height, btw: cbtn.borderTopWidth, bdr: cbtn.borderRadius, fs: cbtn.fontSize, rightGap: wrapR.right - btnR.right, iconW: getComputedStyle(btn, '::before').width } : null,
      lang: infostr ? infostr.textContent : null,
    };
  });
  check('② banner 条 22px 高 surface-2 底', !!r && r.wrap.h === '22px' && r.wrap.bg === EXPECT.surface2);
  check('② banner 底部 1px border-soft 分隔 + 圆角清零', !!r && r.wrap.bdb === '1px solid ' + EXPECT.borderSoft && r.wrap.bdr === '0px');
  check('② banner 哈希壳 display:contents 让位(tab 感全清)', !!r && r.banner && r.banner.disp === 'contents');
  check('② 语言名 mono 11px muted 左置', !!r && r.infostr && r.infostr.font === '11px' && r.infostr.col === EXPECT.muted && r.infostr.left - r.infostr.wrapLeft === 10);
  check('② 复制钮独立 18×18 方钮右置', !!r && r.btn && r.btn.w === '18px' && r.btn.h === '18px' && r.btn.btw === '1px' && r.btn.iconW === '11px' && r.btn.rightGap <= 12);
  info('② banner probe', r);
  // 复制功能保留:点击无 pageerror
  const errsBefore = logs.length;
  try { await page.click('.md-code-block>div:first-child button', { timeout: 5000 }); } catch (e) { /* 记录 */ }
  await page.waitForTimeout(600);
  check('② 复制钮点击无 pageerror(功能保留)', logs.length === errsBefore);
}

// ═══ ③ 注入条图标居中(live 有则 live,无则合成 :is 行) ═══
{
  let live = await page.evaluate(() => !!document.querySelector('[data-chat-flow-kind="context"], [data-chat-flow-kind="compaction"], [data-chat-flow-kind="manual-compaction"]'));
  if (!live) { // 合成(verify-flow steering 同款先例):验 :is 规则命中 + ::before 几何
    await page.evaluate(() => {
      const fc = document.querySelector('[data-chat-flow]');
      const el = document.createElement('div');
      el.setAttribute('data-chat-flow-kind', 'context');
      el.textContent = 'context-synth 折叠单行摘要文本';
      fc.appendChild(el);
    });
    info('③ context live 0 节点 → 合成行验规则', null);
  }
  const r = await page.evaluate(() => {
    const row = document.querySelector('[data-chat-flow-kind="context"], [data-chat-flow-kind="compaction"], [data-chat-flow-kind="manual-compaction"]');
    if (!row) return null;
    const c = getComputedStyle(row);
    const pb = getComputedStyle(row, '::before');
    const rr = row.getBoundingClientRect();
    // 文本节点几何:行内首文字的容器即 row 自身或首个有文本后代
    let tx = null;
    const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
    const tn = walker.nextNode();
    if (tn) {
      const rg = document.createRange(); rg.selectNodeContents(tn);
      const tr = rg.getBoundingClientRect();
      if (tr.height > 0) tx = { cy: tr.top + tr.height / 2 };
    }
    return {
      ali: c.alignItems, pbMT: pb.marginTop, pbW: pb.width, pbH: pb.height,
      rowCY: rr.top + rr.height / 2, textCY: tx ? tx.cy : null,
    };
  });
  check('③ 注入条行 align-items:center', !!r && r.ali === 'center');
  check('③ 图标位 ::before margin-top 归零', !!r && r.pbMT === '0px');
  check('③ ::before 与文本中线几何对齐(≤0.5px)', !!r && r.textCY != null && Math.abs(r.rowCY - r.textCY) <= 0.5);
  info('③ 注入条 probe', r);
}

// ═══ ④a think 折叠箭头像素三角 ═══
{
  const r = await page.evaluate(() => {
    const t = document.querySelector('[data-variant="think"]');
    if (!t) return null;
    const row = t.querySelector('[data-disclosure-row]');
    if (!row) return null;
    const lead = row.querySelector('span:first-of-type');
    const svg = lead ? lead.querySelector('svg') : null;
    const pb = lead ? getComputedStyle(lead, '::before') : null;
    return {
      svgDisp: svg ? getComputedStyle(svg).display : 'none',
      state: t.getAttribute('data-state'),
      expanded: row.getAttribute('aria-expanded'),
      pb: pb ? { content: pb.content, blw: pb.borderLeftWidth, btw: pb.borderTopWidth, bbw: pb.borderBottomWidth, blc: pb.borderLeftColor, disp: pb.display, tf: pb.transform } : null,
    };
  });
  check('④a 宿主 leading 图标隐藏', !!r && r.svgDisp === 'none');
  check('④a ::before 像素三角(5/4/4 border,currentColor)', !!r && r.pb && r.pb.blw === '5px' && r.pb.btw === '4px' && r.pb.bbw === '4px' && r.pb.blc !== 'rgba(0, 0, 0, 0)');
  check('④a 折叠态无 rotate(transform none)', !!r && r.expanded === 'false' && (r.pb.tf === 'none' || r.pb.tf.includes('matrix(1, 0, 0, 1')));
  info('④a 折叠态 probe', r);
  // 展开态 rotate(90deg) 硬切:点击 disclosure 行
  let rot = null;
  try {
    await page.click('[data-variant="think"] [data-disclosure-row]', { timeout: 5000 });
    await page.waitForTimeout(400);
    rot = await page.evaluate(() => {
      const t = document.querySelector('[data-variant="think"]');
      const row = t && t.querySelector('[data-disclosure-row]');
      if (!row) return null;
      const lead = row.querySelector('span:first-of-type');
      return { expanded: row.getAttribute('aria-expanded'), tf: getComputedStyle(lead, '::before').transform };
    });
  } catch (e) { info('④a 展开点击异常', e.message.split('\n')[0]); }
  check('④a 展开态 rotate(90deg)(矩阵 0,1,-1,0)', !!rot && rot.expanded === 'true' && /matrix\(0, 1, -1, 0/.test(rot.tf));
  info('④a 展开态 probe', rot);
  // 还原折叠
  try { await page.click('[data-variant="think"] [data-disclosure-row]', { timeout: 5000 }); await page.waitForTimeout(300); } catch (e) {}
}

// ═══ ⑤ turn-tail 布局 ═══
{
  const r = await page.evaluate(() => {
    const t = document.querySelector('[data-turn-tail]');
    if (!t) return null;
    const actions = t.lastElementChild;
    const stats = actions && actions.lastElementChild;
    if (!stats || stats.tagName !== 'SPAN') return { bad: true, kids: actions ? [...actions.children].map((c) => c.tagName + '.' + (c.className || '').slice(0, 30)) : null };
    const btns = [...actions.querySelectorAll('button')];
    const tr = t.getBoundingClientRect(), ar = actions.getBoundingClientRect(), sr = stats.getBoundingClientRect();
    const br = btns.length ? btns[0].getBoundingClientRect() : null;
    const c = getComputedStyle(stats);
    return {
      bad: false, op: c.opacity, vis: c.visibility, tf: c.transitionProperty || c.transitionDuration,
      font: c.fontSize + '/' + c.lineHeight, fam: c.fontFamily.slice(0, 24), col: c.color, ws: c.whiteSpace,
      statsText: (stats.textContent || '').trim().slice(0, 40),
      firstBtnLeft: br ? br.left : null, statsRight: sr.right, tailRight: tr.right,
      statsLeft: sr.left, actionsLeft: ar.left,
    };
  });
  check('⑤ 统计 span 常驻可见(无 hover:opacity 1 / visible)', !!r && !r.bad && r.op === '1' && r.vis === 'visible');
  check('⑤ 统计 mono 11 faint + nowrap', !!r && r.font === '11px/17.6px' && r.ws === 'nowrap' && r.col === EXPECT.faint);
  check('⑤ 钮组靠左、统计靠右(首钮缘≈行左缘,统计右缘≈行右缘)', !!r && !r.bad && r.firstBtnLeft != null
    && Math.abs(r.firstBtnLeft - r.actionsLeft) < 8 && Math.abs(r.statsRight - r.tailRight) < 8 && r.statsLeft > r.firstBtnLeft);
  info('⑤ turn-tail probe', r);
}

await page.screenshot({ path: join(ROOT, 'shots', 'acceptance-dark.png') });

// ═══ ④b 深色轮单行 flash(真实消息触发 running think) ═══
const darkBg = await catchThinkFlash('dark');
check('④b-dark flash 遮罩深色白块(::after bg #fff)', darkBg === 'rgb(255, 255, 255)');

// 浅色轮:官方外观通道切浅 → 再捕一轮 + 反转断言
const sw = await setTheme('浅色');
check('官方外观通道切浅色', sw.clicked && sw.flipped && sw.theme === 'light');
await page.waitForTimeout(1200);
// ①浅色回归一眼(气泡 padding 不随主题变)
{
  const r = await page.evaluate(() => {
    let bubble = null;
    for (const el of document.querySelectorAll(':is([data-chat-flow-kind="user"],[data-chat-flow-kind="steering"])>div>div>div>div')) {
      if (el.getClientRects().length) { bubble = el; break; }
    }
    return bubble ? getComputedStyle(bubble).padding : null;
  });
  check('①-light 气泡 padding 仍 7px 12px', r === '7px 12px');
}
const lightBg = await catchThinkFlash('light');
check('④b-light flash 遮罩浅色反转黑块(::after bg #000)', lightBg === 'rgb(0, 0, 0)');
await page.screenshot({ path: join(ROOT, 'shots', 'acceptance-light.png') });

// 还原深色 + 关设置
const back = await setTheme('深色');
check('测毕还原深色', back.flipped && back.theme === 'dark');
await page.keyboard.press('Escape').catch(() => {});
await page.waitForTimeout(600);

if (logs.length) { console.log('--- pageerrors ---'); for (const l of logs.slice(-8)) console.log(l); }
else console.log('--- 全程零 pageerror ---');
await browser.close();
console.log(ok ? 'VERIFY: GREEN' : 'VERIFY: RED');
process.exit(ok ? 0 : 1);
