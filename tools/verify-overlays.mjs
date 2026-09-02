// tools/verify-overlays.mjs — overlays2 批活体门禁(2026-09-02;验收裁定轮改版 2026-09-03;裁定轮 2 增补;
// 终审修复 2026-09-03:tabbability 断言实心化——旧 '.mc-tbx [tabindex="0"]' 选择器计数对无 tabindex 的
// 裸 button 恒 0=虚断,改为逐钮读 tabIndex 属性(hero/main 全钮须 -1;dlg 缩放方块 -1+镜像关闭钮 0 双向钉死))
// 用法: node tools/verify-overlays.mjs   (宿主须运行于 127.0.0.1:3080)
// 断言(照 brief Step 2 清单+裁定轮五条+裁定轮 2 四条;switch 断言无——Task 3 勘定实证 settings
// 面板 0 switch,控制器裁定 1):
//   A hero: boot 相值(info)/.mc-hero 在场+own gate/官方空态容器 computed display=none(heroOfficial
//           在场时)/构图裁定版(mark 48px+use#i-cl-HappyMac+标题随 locale zh「探索未知之境」en
//           「Think Classic」+badge/sub 退役)/窗框标题栏(.mc-hero-tb 20px pinstripe+sprite
//           #i-close/#i-zoom 双方块+chrome ::before 让位)/heroGlow 官方晕 SVG 藏(椭圆渐变勘定)/
//           自绘坞钉窗口底(dock 本体量;裁定轮 2 席位 display:contents 盒消隐)/R9 双下拉行(拍平
//           升滚动口子件:双钮可见+水平居中+紧贴 hero 之下+行垂直中心屏幕中线偏下)/R10 mark-title
//           横排(左右相邻+中线对齐)/切实有会话 → 退场(含窗框)→ R8 主列窗框(.mc-main-tb 20px
//           root 首子+sprite 双方块+标题镜像官方 crumb+官方 header 保全+装饰方块零 tab 序)→
//           新建会话钮镜像 click → 复挂(主列窗框随 hero 相退场)+装饰方块零 tab 序逐钮实心断言
//           (深浅两遍 hero 窗框+深色 main 窗框+深浅两遍 dlg 顶栏;dlg 关闭方块设计 tabIndex=0——R11 镜像关路);
//   B dialog: MC_MAP.dlgTriggerSettings 点开 → dlgCard 壳(直角/1px 实线/像素字/硬投影 3px)/
//           scrim 点阵幕 radial-gradient(z 仅 info 记录不 assert 官方值)/顶栏注入(.mc-dlg-tb
//           20px+sprite 双方块+标题读 aria-labelledby)/R11 官方关闭钮 display:none(关窗只走
//           顶栏方块)/关闭方块 click → dlgCard 退场(镜像官方关闭钮,Mac 关窗语义——用户裁定);
//   C 确认框(遇则断): 删除确认小卡在场时同款壳断言;不可达合法 INFO(Task 3 实证官方树被
//           McFinder 遮蔽,删除确认非破坏路径不可达——预期走 INFO 分支);
//   D 深浅两遍: html[data-theme] 切换后 A/B 核心断言复跑(含 R9/R10/R11;dialog 闭路走 Esc,
//           双关闭路径各验一遍);
//   G 失配演练(spec §5 活体门禁硬项「破坏锚 → 官方原样 → 还原」;深色,顺序双演练,置于 kit 分区
//           之前——kit 的 addInitScript 持久注入,reload 会重开检视页且其 hero 样本直用 .mc-hero
//           真类,会污染演练② heroCount):①摘 style[data-mc-dlgskin] → 点设置 → 官方渲染回返
//           (dlgCard 圆角非 0)→ Esc → reload 主题重挂皮(单例 1 还原);②摘 .mc-hero+.mc-hero-tb
//           +own gate → 官方空态回返 → 良性突变拨一拍 body observer → 自愈复挂(构图+窗框+gate);
//   E 零页面错误 + 截图 shots/overlays2-{dark,light}-{hero,dlg}.png + dark-active.png(主列窗框);
//   F kit 浮层分区(verify-toolcard「kit 分区」先例补账): hero 样本裁定版构图(窗框+mark+title,
//           无 badge/sub)/控件样本(无 switch)/注记行。
// 只读纪律: 不发消息不删数据;新建会话镜像 click 为复挂验证所需(留一个空会话,不产生模型调用)。
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SHOTS = join(process.cwd(), 'shots');
mkdirSync(SHOTS, { recursive: true });
const errors = [];
let failures = 0;
const ok = (cond, label) => { if (cond) { console.log('PASS ' + label); } else { failures++; console.log('FAIL ' + label); } };
const info = (label, val) => console.log('INFO ' + label + ' = ' + JSON.stringify(val));

// 选择器实值 = src/chrome/map.js overlays2 段读值硬编码(verify-toolcard 先例);
// mirror/officialNew 为新建会话镜像双靶(控制器裁定 3:自绘钮优先,官方代理兜底)。
const SEL = {
  phase: 'div[data-phase]',                                     // MC_MAP.heroRoot(同 mainColumn 同源)
  heroOfficial: '.pXSMma_root',                                 // MC_MAP.heroOfficial(build-hash,漂移则 info 降级)
  heroGlow: 'svg[class*="heroGlow"]',                           // MC_MAP.heroGlow(hashed-substring,漂移则 info 降级)
  heroRow: '[class*="heroWorkspaceRow"]',                       // MC_MAP.heroRow(裁定轮 2 R9;hashed-substring,漂移则 info 降级)
  trigger: '#root > div > div > div:first-child button[aria-haspopup="dialog"]', // MC_MAP.dlgTriggerSettings
  dlgCard: '[role="dialog"][aria-labelledby]',                  // MC_MAP.dlgCard
  dlgMask: '[role="presentation"]:has([role="dialog"][aria-labelledby]) > div[aria-hidden="true"]', // MC_MAP.dlgMask
  mirror: 'button[data-mc-finder][aria-label="新建会话"]',        // 自绘新建钮(finder.js ghBtn/mini 同款 aria)
  officialNew: '#root > div > div > div:first-child > div > div > button:nth-child(3)', // MC_MAP.sidebarNewSession(+1 标题栏占位)
};

// 标题 locale 期望 = overlays.js mcHeroTitle 同规(lang 前缀 zh → zh 否则 en;裁定轮:zh=用户裁定
// 文案,en=主题初代 slogan——「原版的那个 slogan」的转译,见注记 §11.3)
const wantTitle = (lang) => String(lang || '').toLowerCase().indexOf('zh') === 0 ? '探索未知之境' : 'Think Classic';

const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
pg.on('pageerror', (e) => errors.push(String(e.message).slice(0, 200)));

await pg.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(8000); // 主题注入 + 会话恢复(verify 全家同款节律)

// —— hero 快照探针(单次求值) ——
const heroProbe = () => pg.evaluate((sel) => {
  const root = document.querySelector(sel.phase);
  const hero = document.querySelector('.mc-hero');
  const tb = document.querySelector('.mc-hero-tb');
  const official = document.querySelector(sel.heroOfficial);
  const glow = document.querySelector(sel.heroGlow);
  const dock = document.querySelector('[data-mc-dock]'); // 裁定轮 2:席位 display:contents(盒消隐)→ 钉底量自绘坞本体
  const r = {
    phase: root ? root.getAttribute('data-phase') : null,
    gate: document.documentElement.hasAttribute('data-mc-hero'),
    heroCount: document.querySelectorAll('.mc-hero').length,
    tbCount: document.querySelectorAll('.mc-hero-tb').length,
    officialPresent: !!official,
    officialDisplay: official ? getComputedStyle(official).display : null,
    glowPresent: !!glow,
    glowDisplay: glow ? getComputedStyle(glow).display : null,
    beforeDisplay: root ? getComputedStyle(root, '::before').display : null, // chrome ::before 伪元素版让位断言
    lang: (document.documentElement && document.documentElement.lang) || navigator.language,
    dockBottom: dock ? Math.round(dock.getBoundingClientRect().bottom) : null,
    rootBottom: root ? Math.round(root.getBoundingClientRect().bottom) : null,
    vh: innerHeight,
  };
  if (hero) {
    const mark = hero.querySelector('.mh-mark');
    const title = hero.querySelector('.mh-title');
    const use = mark ? mark.querySelector('use') : null;
    r.markW = mark ? getComputedStyle(mark).width : null;
    r.markUse = use ? (use.getAttribute('href') || use.getAttribute('xlink:href') || '') : null;
    r.titleFont = title ? getComputedStyle(title).fontFamily : '';
    r.titleText = title ? title.textContent : null;
    r.badge = !!hero.querySelector('.mh-badge');
    r.sub = !!hero.querySelector('.mh-sub');
    // R10 横排几何:mark 在左、title 在右、垂直中线对齐
    if (mark && title) {
      const m = mark.getBoundingClientRect(), t = title.getBoundingClientRect();
      r.rowGeom = {
        sideBySide: t.left >= m.right - 2,
        centerYDelta: Math.abs((m.top + m.height / 2) - (t.top + t.height / 2)),
        markLeft: Math.round(m.left), titleLeft: Math.round(t.left),
      };
    }
  }
  // R9 双下拉行几何(gate 拍平后 = 滚动口直接 flex 子件)
  const row = document.querySelector(sel.heroRow);
  if (row) {
    const rb = row.getBoundingClientRect();
    const sb = document.querySelector('[data-conversation-scroll]');
    const sbc = sb ? sb.getBoundingClientRect() : null;
    r.rowGeom2 = {
      present: true,
      w: Math.round(rb.width), h: Math.round(rb.height),
      top: Math.round(rb.top), bottom: Math.round(rb.bottom),
      centerX: Math.round(rb.left + rb.width / 2),
      scrollCenterX: sbc ? Math.round(sbc.left + sbc.width / 2) : null,
      heroBottom: hero ? Math.round(hero.getBoundingClientRect().bottom) : null,
      btns: [...row.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).length,
      justify: getComputedStyle(row).justifyContent,
    };
  } else r.rowGeom2 = { present: false };
  if (tb) {
    const cl = tb.querySelector('.mc-tbx.cl use');
    const zm = tb.querySelector('.mc-tbx.zm use');
    r.tbH = getComputedStyle(tb).height;
    r.tbBg = getComputedStyle(tb).backgroundImage;
    r.tbClose = cl ? (cl.getAttribute('href') || '') : null;
    r.tbZoom = zm ? (zm.getAttribute('href') || '') : null;
    // 终审修复:tabbability 实心化——逐钮读 tabIndex 属性(旧 '.mc-tbx [tabindex="0"]' 选择器计数
    // 对无 tabindex 的裸 button 恒 0=虚断,摘掉 tabindex="-1" 也 PASS)。hero 窗框全钮装饰 → 全 -1。
    const tbBtns = [...tb.querySelectorAll('button')];
    r.tbBtns = tbBtns.length;
    r.tbFailIdx = tbBtns.filter((x) => x.tabIndex !== -1).length;
  }
  return r;
}, SEL);

// —— 主列窗框快照探针(裁定轮 2 R8:active 相 .mc-main-tb;须 active 相调用) ——
const mainProbe = () => pg.evaluate(() => {
  const root = document.querySelector('div[data-phase]');
  const tb = document.querySelector('.mc-main-tb');
  const r = {
    phase: root ? root.getAttribute('data-phase') : null,
    mainCount: document.querySelectorAll('.mc-main-tb').length,
    headerPresent: !!document.querySelector('div[data-phase] header'),
    crumb: document.querySelector('div[data-phase] [class*="crumbCurrent"]'),
  };
  if (tb) {
    const bcs = getComputedStyle(tb);
    const cl = tb.querySelector('.mc-tbx.cl use');
    const zm = tb.querySelector('.mc-tbx.zm use');
    // 终审修复:同 hero——逐钮 tabIndex 属性实心断言(选择器计数虚断已废)
    const tbBtns = [...tb.querySelectorAll('button')];
    r.tb = {
      h: bcs.height,
      first: tb.parentElement === root && root.firstElementChild === tb,
      closeHref: cl ? (cl.getAttribute('href') || '') : null,
      zoomHref: zm ? (zm.getAttribute('href') || '') : null,
      title: (tb.querySelector('.mc-tb-title') || { textContent: '' }).textContent,
      btns: tbBtns.length,
      failIdx: tbBtns.filter((x) => x.tabIndex !== -1).length, // 装饰方块不应进 tab 序(逐钮属性)
    };
    r.crumbText = r.crumb ? String(r.crumb.textContent || '').trim() : null;
    // 官方 header 交互保全:标题钮+页签钮在场可点(零外科=只读镜像的前提)
    r.headerButtons = document.querySelectorAll('div[data-phase] header button').length;
    const crumbRect = r.crumb ? r.crumb.getBoundingClientRect() : null;
    r.crumbVisible = crumbRect ? crumbRect.width > 0 : false;
    const tbRect = tb.getBoundingClientRect();
    r.tbTop = Math.round(tbRect.top);
    const header = document.querySelector('div[data-phase] header');
    r.headerTop = header ? Math.round(header.getBoundingClientRect().top) : null;
  }
  return r;
});

// —— dialog 快照探针(dlgCard 壳 + 顶栏 + scrim;须开窗态调用) ——
const dlgProbe = () => pg.evaluate((sel) => {
  const card = document.querySelector(sel.dlgCard);
  const mask = document.querySelector(sel.dlgMask);
  const r = { card: !!card, mask: !!mask };
  if (card) {
    const cs = getComputedStyle(card);
    r.radius = cs.borderTopLeftRadius;
    r.btop = cs.borderTopWidth + ' ' + cs.borderTopStyle;
    r.font = cs.fontFamily;
    r.shadow = cs.boxShadow;
    const bar = card.querySelector('.mc-dlg-tb'); // 裁定轮 5:注入顶栏
    if (bar) {
      const bcs = getComputedStyle(bar);
      const cl = bar.querySelector('.mc-tbx.cl use');
      const zm = bar.querySelector('.mc-tbx.zm use');
      // 终审修复:dlg 顶栏 tab 序逐钮属性。注意与 hero/main 不同构:zm 缩放方块装饰(tabIndex=-1),
      // cl 关闭方块是 R11 官方关闭钮的镜像交互路径(aria 无「装饰」缀;官方钮 display:none 后它是
      // 唯一 tab 可达关路)→ 设计 tabIndex=0,断言双向钉死防双向回归。
      const clBtn = bar.querySelector('.mc-tbx.cl');
      const zmBtn = bar.querySelector('.mc-tbx.zm');
      r.bar = {
        h: bcs.height,
        pos: bcs.position,
        title: (bar.querySelector('.mc-tb-title') || { textContent: '' }).textContent,
        closeHref: cl ? (cl.getAttribute('href') || '') : null,
        zoomHref: zm ? (zm.getAttribute('href') || '') : null,
        btns: bar.querySelectorAll('button').length,
        clIdx: clBtn ? clBtn.tabIndex : null,
        zmIdx: zmBtn ? zmBtn.tabIndex : null,
      };
      const lab = card.getAttribute('aria-labelledby');
      const labEl = lab ? document.getElementById(lab) : null;
      r.cardTitle = labEl ? String(labEl.textContent || '').trim() : null; // 顶栏标题应读它
      const oclose = card.querySelector('button[class*="close"]'); // R11:官方关闭钮(=顶栏镜像靶)
      r.officialClose = oclose ? getComputedStyle(oclose).display : null;
    }
  }
  if (mask) {
    const ms = getComputedStyle(mask);
    r.maskBgImage = ms.backgroundImage;
    r.maskZ = ms.zIndex;
    const ov = mask.parentElement; // 官方 overlay(z:1000 载体,z 不动=spec 裁定 4)
    r.overlayZ = ov ? getComputedStyle(ov).zIndex : null;
  }
  return r;
}, SEL);

// —— 新建会话镜像 click(控制器裁定 3):自绘 [data-mc-finder] 钮优先,官方代理钮兜底 ——
const newSessionMirror = async () => await pg.evaluate((sel) => {
  const m = document.querySelector(sel.mirror);
  if (m) { m.click(); return 'self-drawn [data-mc-finder][aria-label="新建会话"]'; }
  const o = document.querySelector(sel.officialNew);
  if (o) { o.click(); return 'official proxied sidebarNewSession(button:nth-child(3))'; }
  return null;
}, SEL);

// —— Esc 关净轮询 ——
const escClosed = async () => {
  await pg.keyboard.press('Escape');
  for (let i = 0; i < 10; i++) {
    if (await pg.evaluate((s) => !document.querySelector(s), SEL.dlgCard)) return true;
    await pg.waitForTimeout(300);
  }
  return await pg.evaluate((s) => !document.querySelector(s), SEL.dlgCard);
};

// —— 顶栏关闭方块 click 关净轮询(裁定轮 5:镜像官方关闭钮,Mac 关窗语义) ——
const closeBoxClosed = async () => {
  await pg.evaluate(() => {
    const bar = document.querySelector('[role="dialog"][aria-labelledby] .mc-dlg-tb');
    const cl = bar && bar.querySelector('.mc-tbx.cl');
    if (cl) cl.click();
  });
  for (let i = 0; i < 10; i++) {
    if (await pg.evaluate((s) => !document.querySelector(s), SEL.dlgCard)) return true;
    await pg.waitForTimeout(300);
  }
  return await pg.evaluate((s) => !document.querySelector(s), SEL.dlgCard);
};

// ═══ 起点归一:深色(theme0 存档,测毕还原) ═══
const theme0 = await pg.evaluate(() => document.documentElement.getAttribute('data-theme'));
info('起点 data-theme', theme0);
if (theme0 !== 'dark') { await pg.evaluate(() => { document.documentElement.dataset.theme = 'dark'; }); await pg.waitForTimeout(600); }

// ═══ A. hero(深色) ═══
info('A: boot data-phase', await pg.evaluate((s) => { const r = document.querySelector(s); return r ? r.getAttribute('data-phase') : null; }, SEL.phase));
let hp = await heroProbe();
if (hp.heroCount === 0) { // 宿主恢复态落在有内容会话 → 镜像新建归一到空会话(hero 相)
  info('A: boot 未落空会话(恢复态 phase=' + hp.phase + '),新建会话镜像归一', null);
  const used0 = await newSessionMirror();
  ok(!!used0, 'A: 归一 — 新建会话镜像 click 有靶');
  for (let i = 0; i < 20 && hp.heroCount === 0; i++) { await pg.waitForTimeout(400); hp = await heroProbe(); }
}
ok(hp.heroCount === 1 && hp.gate, '深色 hero: .mc-hero 在场且 own gate html[data-mc-hero] 置位 (count=' + hp.heroCount + ' gate=' + hp.gate + ')');
ok(hp.phase === 'hero', '深色 hero: data-phase=hero (实值 ' + hp.phase + ')');
if (hp.officialPresent) ok(hp.officialDisplay === 'none', '深色 hero: 官方空态容器 computed display=none (' + hp.officialDisplay + ')');
else info('深色 hero: 官方空态容器不在场(heroOfficial 锚漂移或宿主未渲染;藏匿断言降级)', hp.officialPresent);
ok(!hp.badge && !hp.sub, '深色 hero: 构图裁定 — badge/sub 双双退役 (badge=' + hp.badge + ' sub=' + hp.sub + ')');
ok(hp.titleText === wantTitle(hp.lang), '深色 hero: 标题随 locale (lang=' + hp.lang + ' 实值「' + hp.titleText + '」期「' + wantTitle(hp.lang) + '」)');
ok(hp.markW === '48px', '深色 hero: 构图 .mh-mark 宽 48px (' + hp.markW + ')');
ok(hp.markUse === '#i-cl-HappyMac', '深色 hero: 构图 svg use #i-cl-HappyMac (' + hp.markUse + ')');
ok(hp.titleFont.indexOf('ChiKareGo') >= 0, '深色 hero: 构图 .mh-title 像素字 ChiKareGo (' + hp.titleFont.slice(0, 40) + ')');
ok(hp.tbCount === 1 && hp.tbH === '20px', '深色 hero: 窗框标题栏在场 20px (count=' + hp.tbCount + ' h=' + hp.tbH + ')');
ok(hp.tbClose === '#i-close' && hp.tbZoom === '#i-zoom', '深色 hero: 窗框 sprite 双方块 (cl=' + hp.tbClose + ' zm=' + hp.tbZoom + ')');
ok(String(hp.tbBg).indexOf('repeating-linear-gradient') >= 0, '深色 hero: 窗框 pinstripe 条纹面');
info('深色 hero: 装饰方块 tab 序逐钮记录', { btns: hp.tbBtns, failIdx: hp.tbFailIdx });
ok(hp.tbBtns > 0 && hp.tbFailIdx === 0, '深色 hero: 装饰方块零 tab 序实心化 — 逐钮 tabIndex=-1 (钮数=' + hp.tbBtns + ' 违例=' + hp.tbFailIdx + ')');
ok(hp.beforeDisplay === 'none', '深色 hero: chrome ::before 伪元素版让位 (display=' + hp.beforeDisplay + ')');
if (hp.glowPresent) ok(hp.glowDisplay === 'none', '深色 hero: 官方 hero 晕 SVG 藏(椭圆渐变勘定) (' + hp.glowDisplay + ')');
else info('深色 hero: heroGlow 锚未命中(宿主未渲染晕或哈希漂移;渐变断言降级)', hp.glowPresent);
info('深色 hero: composer 钉底记录', { dockBottom: hp.dockBottom, rootBottom: hp.rootBottom, vh: hp.vh });
ok(hp.dockBottom != null && hp.rootBottom != null && hp.rootBottom - hp.dockBottom <= 8,
  '深色 hero: 自绘坞钉窗口底 (dock=' + hp.dockBottom + ' vs 窗底=' + hp.rootBottom + '; 距视口底 ' + (hp.vh - hp.dockBottom) + 'px=桌面缝隙 12px 语汇)');
// R10 横排构图:mark 左 / title 右、中线对齐
ok(!!hp.rowGeom && hp.rowGeom.sideBySide && hp.rowGeom.centerYDelta <= 4,
  '深色 hero: R10 构图横排 — mark 在左 title 在右且中线对齐 (sideBySide=' + (hp.rowGeom ? hp.rowGeom.sideBySide : null) + ' Δmid=' + (hp.rowGeom ? hp.rowGeom.centerYDelta.toFixed(1) : null) + 'px)');
// R9 双下拉行:拍平升为滚动口子件、水平居中、紧贴 hero 之下、垂直中心落于屏幕中线偏下
if (hp.rowGeom2.present) {
  const g = hp.rowGeom2;
  ok(g.btns >= 2, '深色 hero: R9 双下拉行在场且双钮可见 (btns=' + g.btns + ' w=' + g.w + ')');
  ok(g.scrollCenterX != null && Math.abs(g.centerX - g.scrollCenterX) <= 8, '深色 hero: R9 行水平居中 (行中=' + g.centerX + ' vs 口中=' + g.scrollCenterX + ')');
  ok(g.heroBottom != null && g.top >= g.heroBottom, '深色 hero: R9 行紧贴 logo+slogan 之下 (hero 底=' + g.heroBottom + ' 行顶=' + g.top + ')');
  ok(g.top + g.h / 2 >= hp.vh / 2, '深色 hero: R9 行垂直中心屏幕中线偏下 (行中Y=' + Math.round(g.top + g.h / 2) + ' vs 半屏=' + Math.round(hp.vh / 2) + ')');
} else info('深色 hero: R9 双下拉行未命中(heroRow 锚漂移或宿主未渲染;断言降级)', null);
await pg.screenshot({ path: join(SHOTS, 'overlays2-dark-hero.png') });

// 切进任一会话 → 相变退场 → 新建镜像复挂
const picked = await pg.evaluate(() => {
  const row = document.querySelector('.mc-sess:not(.on)') || document.querySelector('.mc-sess');
  if (!row) return null;
  row.click();
  return row.getAttribute('title');
});
if (picked == null) {
  info('A: 无实有会话行(.mc-sess)可切 — 退场/复挂断言 deferred(合法)', null);
} else {
  await pg.waitForTimeout(2500);
  const hp2 = await heroProbe();
  info('A: 切进会话「' + picked + '」后 data-phase', hp2.phase);
  ok(hp2.phase !== 'hero' && hp2.heroCount === 0 && hp2.tbCount === 0 && !hp2.gate, '深色 hero: 切实有会话 → 相变+.mc-hero/窗框退场+gate 撤 (phase=' + hp2.phase + ' count=' + hp2.heroCount + ' tb=' + hp2.tbCount + ')');
  // —— R8 主列窗框(active 相):.mc-main-tb 在场+sprite 双方块+标题镜像官方 crumb+官方 header 保全 ——
  let mp = await mainProbe();
  ok(mp.phase === 'active' && mp.mainCount === 1 && mp.tb && mp.tb.h === '20px' && mp.tb.first,
    '深色 main: R8 主列窗框在场 20px 且居 root 首子 (count=' + mp.mainCount + ' h=' + (mp.tb ? mp.tb.h : null) + ' first=' + (mp.tb ? mp.tb.first : null) + ')');
  if (mp.tb) {
    ok(mp.tb.closeHref === '#i-close' && mp.tb.zoomHref === '#i-zoom', '深色 main: 窗框 sprite 双方块 (cl=' + mp.tb.closeHref + ' zm=' + mp.tb.zoomHref + ')');
    ok(mp.crumbText != null && mp.tb.title === mp.crumbText, '深色 main: 标题只读镜像官方 crumb (「' + mp.tb.title + '」 vs 「' + mp.crumbText + '」)');
    ok(mp.headerPresent && mp.headerButtons >= 4 && mp.crumbVisible, '深色 main: 官方 header 保全(钮数=' + mp.headerButtons + ' 标题钮可见=' + mp.crumbVisible + ')');
    ok(mp.tbTop != null && mp.headerTop != null && mp.headerTop >= mp.tbTop + 18, '深色 main: 窗框在 header 上方且官方头部整体下移 (tb=' + mp.tbTop + ' header=' + mp.headerTop + ')');
    info('深色 main: 装饰方块 tab 序逐钮记录', { btns: mp.tb.btns, failIdx: mp.tb.failIdx });
    ok(mp.tb.btns > 0 && mp.tb.failIdx === 0, '深色 main: 装饰方块零 tab 序实心化 — 逐钮 tabIndex=-1 (钮数=' + mp.tb.btns + ' 违例=' + mp.tb.failIdx + ')');
    await pg.screenshot({ path: join(SHOTS, 'overlays2-dark-active.png') });
  }
  const used = await newSessionMirror();
  ok(!!used, '深色 hero: 新建会话镜像 click 有靶(自绘优先/官方代理兜底)');
  info('A: 镜像 click 使用目标', used);
  let hp3 = await heroProbe();
  for (let i = 0; i < 20 && hp3.heroCount === 0; i++) { await pg.waitForTimeout(400); hp3 = await heroProbe(); }
  ok(hp3.heroCount === 1 && hp3.tbCount === 1 && hp3.gate && hp3.phase === 'hero', '深色 hero: 切回空会话(新建镜像) → 复挂(构图+窗框) (count=' + hp3.heroCount + ' tb=' + hp3.tbCount + ' phase=' + hp3.phase + ')');
  const mp3 = await mainProbe(); // R8:回 hero 相 → 主列窗框退场(同根互斥共存)
  ok(mp3.mainCount === 0, '深色 main: 切回 hero 相 → .mc-main-tb 退场 (count=' + mp3.mainCount + ')');
}

// ═══ B. dialog(深色) ═══
const trigFound = await pg.evaluate((s) => !!document.querySelector(s), SEL.trigger);
ok(trigFound, '深色 dlg: 设置触发钮在场(MC_MAP.dlgTriggerSettings 形态)');
await pg.evaluate((s) => { const t = document.querySelector(s); if (t) t.click(); }, SEL.trigger);
await pg.waitForTimeout(1500);
const dg = await dlgProbe();
ok(dg.card, '深色 dlg: dlgCard 在场');
if (dg.card) {
  ok(dg.radius === '0px', '深色 dlg: 卡直角 (' + dg.radius + ')');
  ok(dg.btop === '1px solid', '深色 dlg: 卡 1px 实线边 (' + dg.btop + ')');
  ok(/ChiKareGo|Fusion Pixel/.test(dg.font), '深色 dlg: 像素字 (' + dg.font.slice(0, 44) + ')');
  ok(String(dg.shadow).indexOf('3px') >= 0, '深色 dlg: 硬投影含 3px 偏移');
}
if (dg.bar) {
  ok(dg.bar.h === '20px' && dg.bar.pos === 'absolute', '深色 dlg: 顶栏注入 20px absolute 卡顶 (h=' + dg.bar.h + ' pos=' + dg.bar.pos + ')');
  ok(dg.bar.closeHref === '#i-close' && dg.bar.zoomHref === '#i-zoom', '深色 dlg: 顶栏 sprite 双方块 (cl=' + dg.bar.closeHref + ' zm=' + dg.bar.zoomHref + ')');
  ok(dg.bar.title === dg.cardTitle, '深色 dlg: 顶栏标题读 aria-labelledby (「' + dg.bar.title + '」)');
  info('深色 dlg: 顶栏钮 tab 序逐钮记录', { btns: dg.bar.btns, clIdx: dg.bar.clIdx, zmIdx: dg.bar.zmIdx });
  ok(dg.bar.btns >= 2 && dg.bar.zmIdx === -1 && dg.bar.clIdx === 0, '深色 dlg: 顶栏 tab 序实心化 — 装饰缩放方块 tabIndex=-1+镜像关闭钮 tabIndex=0 (cl=' + dg.bar.clIdx + ' zm=' + dg.bar.zmIdx + ')');
} else ok(false, '深色 dlg: 顶栏 .mc-dlg-tb 未注入');
if (dg.card) ok(dg.officialClose === 'none', '深色 dlg: R11 官方关闭钮 display:none (display=' + dg.officialClose + ')');
if (dg.mask) {
  ok(dg.maskBgImage.indexOf('radial-gradient') >= 0, '深色 scrim: 点阵幕 radial-gradient 在场');
  info('深色 scrim: zIndex 记录(mask=' + dg.maskZ + ' / overlay=' + dg.overlayZ + ',官方原值不 assert)', { maskZ: dg.maskZ, overlayZ: dg.overlayZ });
} else { ok(false, '深色 scrim: dlgMask 未命中(:has 域定失配?)'); }
await pg.screenshot({ path: join(SHOTS, 'overlays2-dark-dlg.png') });
ok(await closeBoxClosed(), '深色 dlg: 关闭方块 click → dlgCard 退场(镜像官方关闭钮,Mac 关窗语义)');

// ═══ C. 确认框(遇则断;Task 3 实证不可达 → 预期 INFO) ═══
const cf = await pg.evaluate(() => {
  const cards = [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')];
  const c = cards.find((x) => /删除/.test(x.textContent || ''));
  if (!c) return { none: true };
  const cs = getComputedStyle(c);
  return { radius: cs.borderTopLeftRadius, btop: cs.borderTopWidth + ' ' + cs.borderTopStyle, shadow: cs.boxShadow };
});
if (cf.none) info('C: 删除确认框不可达(官方树被 McFinder 遮蔽,非破坏路径无靶——Task 3 实证;合法跳过)', null);
else ok(cf.radius === '0px' && cf.btop === '1px solid' && String(cf.shadow).indexOf('3px') >= 0, 'C: 确认小卡同款壳(直角/1px 实线/硬投影)');

// ═══ D. 浅色复跑(html[data-theme] 切换) ═══
await pg.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
await pg.waitForTimeout(600);
const hl = await heroProbe();
ok(hl.heroCount === 1 && hl.gate, '浅色 hero: .mc-hero 仍在场+gate 保持 (count=' + hl.heroCount + ')');
ok(hl.titleText === wantTitle(hl.lang), '浅色 hero: 标题 locale 复跑 (「' + hl.titleText + '」)');
ok(/ChiKareGo/.test(hl.titleFont), '浅色 hero: 标题像素字复跑 (' + hl.titleFont.slice(0, 40) + ')');
ok(!hl.badge && !hl.sub && hl.markW === '48px', '浅色 hero: 构图复跑(badge/sub 退役+mark 48px)');
ok(hl.tbCount === 1 && hl.tbClose === '#i-close' && hl.tbZoom === '#i-zoom', '浅色 hero: 窗框复跑 (cl=' + hl.tbClose + ' zm=' + hl.tbZoom + ')');
info('浅色 hero: 装饰方块 tab 序复跑逐钮记录', { btns: hl.tbBtns, failIdx: hl.tbFailIdx });
ok(hl.tbBtns > 0 && hl.tbFailIdx === 0, '浅色 hero: 装饰方块零 tab 序实心化复跑 — 逐钮 tabIndex=-1 (钮数=' + hl.tbBtns + ' 违例=' + hl.tbFailIdx + ')');
if (hl.glowPresent) ok(hl.glowDisplay === 'none', '浅色 hero: hero 晕 SVG 仍藏 (' + hl.glowDisplay + ')');
ok(hl.dockBottom != null && hl.rootBottom != null && hl.rootBottom - hl.dockBottom <= 8, '浅色 hero: 自绘坞钉底复跑 (dock=' + hl.dockBottom + ' vs 窗底=' + hl.rootBottom + ')');
if (hl.rowGeom2.present) { // R9/R10 浅色复跑
  const gl = hl.rowGeom2;
  ok(gl.scrollCenterX != null && Math.abs(gl.centerX - gl.scrollCenterX) <= 8 && gl.top >= gl.heroBottom && gl.top + gl.h / 2 >= hl.vh / 2,
    '浅色 hero: R9 双下拉行复跑(居中/贴 hero/中线偏下) (行中=' + gl.centerX + ' 口中=' + gl.scrollCenterX + ' 行顶=' + gl.top + ')');
  ok(!!hl.rowGeom && hl.rowGeom.sideBySide && hl.rowGeom.centerYDelta <= 4, '浅色 hero: R10 横排复跑 (Δmid=' + (hl.rowGeom ? hl.rowGeom.centerYDelta.toFixed(1) : null) + 'px)');
} else info('浅色 hero: R9 双下拉行未命中(降级)', null);
if (hl.officialPresent) ok(hl.officialDisplay === 'none', '浅色 hero: 官方空态仍藏 (' + hl.officialDisplay + ')');
await pg.screenshot({ path: join(SHOTS, 'overlays2-light-hero.png') });

await pg.evaluate((s) => { const t = document.querySelector(s); if (t) t.click(); }, SEL.trigger);
await pg.waitForTimeout(1500);
const dl = await dlgProbe();
ok(dl.card, '浅色 dlg: dlgCard 在场');
if (dl.card) {
  ok(dl.radius === '0px' && dl.btop === '1px solid', '浅色 dlg: 卡壳复跑(直角+' + dl.btop + ')');
  ok(/ChiKareGo|Fusion Pixel/.test(dl.font), '浅色 dlg: 像素字复跑 (' + dl.font.slice(0, 44) + ')');
  ok(String(dl.shadow).indexOf('3px') >= 0, '浅色 dlg: 硬投影复跑');
  ok(dl.bar && dl.bar.h === '20px' && dl.bar.closeHref === '#i-close', '浅色 dlg: 顶栏复跑 (h=' + (dl.bar ? dl.bar.h : null) + ')');
  ok(dl.officialClose === 'none', '浅色 dlg: R11 官方关闭钮仍隐 (display=' + dl.officialClose + ')');
  ok(dl.bar && dl.bar.btns >= 2 && dl.bar.zmIdx === -1 && dl.bar.clIdx === 0, '浅色 dlg: 顶栏 tab 序实心化复跑 (cl=' + (dl.bar ? dl.bar.clIdx : null) + ' zm=' + (dl.bar ? dl.bar.zmIdx : null) + ')');
}
if (dl.mask) {
  ok(dl.maskBgImage.indexOf('radial-gradient') >= 0, '浅色 scrim: 点阵幕复跑');
  info('浅色 scrim: zIndex 记录(mask=' + dl.maskZ + ' / overlay=' + dl.overlayZ + ')', { maskZ: dl.maskZ, overlayZ: dl.overlayZ });
} else { ok(false, '浅色 scrim: dlgMask 未命中'); }
await pg.screenshot({ path: join(SHOTS, 'overlays2-light-dlg.png') });
ok(await escClosed(), '浅色 dlg: Esc 关闭 → dlgCard 退场(Esc 路径复跑;深色已验关闭方块路径)');
await pg.evaluate((t) => { document.documentElement.dataset.theme = t || 'dark'; }, theme0); // 测毕还原起点相

// ═══ G. 失配演练(spec §5 活体门禁硬项:破坏锚 → 官方原样 → 还原;深色,顺序双演练) ═══
// 置于 kit 分区之前:kit 走 addInitScript 持久注入,此后每次 reload 都会重开检视页,且其 hero 样本
// 直用 .mc-hero 真类,会污染演练②的 heroCount 断言(此处 reload 时 initScript 尚未注册,页面干净)。
// reload 后宿主回读存档主题,起点 dataset 直改不持久 → 重钉深色(起点归一同款形态)。
await pg.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
await pg.waitForTimeout(600);
info('失配演练: data-theme', await pg.evaluate(() => document.documentElement.getAttribute('data-theme')));

// —— ① dialog 皮:摘 style[data-mc-dlgskin] → 官方渲染回返 → reload 让主题重挂皮(单例还原) ——
info('失配演练① dlg: 摘 style[data-mc-dlgskin] → 点设置触发', null);
await pg.evaluate(() => { const s = document.querySelector('style[data-mc-dlgskin]'); if (s) s.remove(); });
await pg.evaluate((s) => { const t = document.querySelector(s); if (t) t.click(); }, SEL.trigger);
await pg.waitForTimeout(1500);
const dgM = await dlgProbe();
ok(dgM.card && dgM.radius !== '0px', '失配演练① dlg: 皮摘 → 官方渲染回返(dlgCard 在场+圆角非 0, 实值 ' + dgM.radius + ')');
ok(await escClosed(), '失配演练① dlg: Esc 关净(预备 reload 还原)');
await pg.reload({ waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(9000); // 主题重挂节律(kit 分区 reload 同款)
const skinN = await pg.evaluate(() => document.querySelectorAll('style[data-mc-dlgskin]').length);
ok(skinN === 1, '失配演练① 还原: reload → 主题重挂 → style[data-mc-dlgskin] 单例回返 (count=' + skinN + ')');

// —— ② hero:摘 .mc-hero+.mc-hero-tb+own gate → 官方空态回返 → 良性突变拨一拍 body observer → 自愈复挂 ——
// 破坏与官方回返断言须同一 evaluate 内同步取:remount 走 observer 微任务,一旦跨 await 中间态就
// 可能已被自愈抹掉;computed style 读取强制同步重排,摘 gate 后立即读值可信。
let hq = await heroProbe();
if (hq.heroCount === 0) { // reload 恢复态未落空会话 → 镜像新建归一(A 段守则同款)
  const usedM = await newSessionMirror();
  ok(!!usedM, '失配演练② 归一: 新建会话镜像 click 有靶');
  for (let i = 0; i < 20 && hq.heroCount === 0; i++) { await pg.waitForTimeout(400); hq = await heroProbe(); }
}
ok(hq.heroCount === 1 && hq.tbCount === 1 && hq.gate, '失配演练② hero: 基线 — .mc-hero+窗框在场+gate 置位 (count=' + hq.heroCount + ' tb=' + hq.tbCount + ' gate=' + hq.gate + ')');
const hM = await pg.evaluate((sel) => {
  const h = document.querySelector('.mc-hero');
  if (h) h.remove();
  const tb = document.querySelector('.mc-hero-tb');
  if (tb) tb.remove();
  document.documentElement.removeAttribute('data-mc-hero');
  const official = document.querySelector(sel.heroOfficial);
  return {
    heroCount: document.querySelectorAll('.mc-hero').length,
    tbCount: document.querySelectorAll('.mc-hero-tb').length,
    gate: document.documentElement.hasAttribute('data-mc-hero'),
    officialPresent: !!official,
    officialDisplay: official ? getComputedStyle(official).display : null,
  };
}, SEL);
ok(hM.heroCount === 0 && hM.tbCount === 0 && !hM.gate, '失配演练② hero: 破坏生效 — .mc-hero+窗框摘+gate 撤 (count=' + hM.heroCount + ' tb=' + hM.tbCount + ')');
ok(hM.officialPresent && hM.officialDisplay !== 'none', '失配演练② hero: gate 撤 → 官方空态回返 (present=' + hM.officialPresent + ' display=' + hM.officialDisplay + ')');
await pg.evaluate(() => { const poke = document.createElement('div'); poke.style.display = 'none'; document.body.appendChild(poke); poke.remove(); }); // 良性突变 → observer 一拍
let hH = await heroProbe();
for (let i = 0; i < 10 && (hH.heroCount === 0 || hH.tbCount === 0 || !hH.gate); i++) { await pg.waitForTimeout(400); hH = await heroProbe(); }
ok(hH.heroCount === 1 && hH.tbCount === 1 && hH.gate, '失配演练② 还原: observer 自愈 → 构图+窗框复挂+gate 置回 (count=' + hH.heroCount + ' tb=' + hH.tbCount + ' gate=' + hH.gate + ')');
if (hH.officialPresent) ok(hH.officialDisplay === 'none', '失配演练② 还原: gate 复位 → 官方空态复藏 (' + hH.officialDisplay + ')');

// ═══ F. kit 浮层分区(verify-toolcard「kit 分区」先例;裁定 1:无 switch 样本) ═══
await pg.addInitScript(() => { window.__MC_KIT_OPEN__ = true; });
await pg.reload({ waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(9000);
const kit = await pg.evaluate(() => {
  const sec = [...document.querySelectorAll('section')].find((x) => {
    const h = x.querySelector('.kit-h');
    return h && h.textContent === '浮层';
  });
  if (!sec) return { NO: 1 };
  const mark = sec.querySelector('.mh-mark');
  const use = sec.querySelector('.mh-mark use');
  const tb = sec.querySelector('.mc-hero-tb');
  const cl = tb ? tb.querySelector('.mc-tbx.cl use') : null;
  const zm = tb ? tb.querySelector('.mc-tbx.zm use') : null;
  const title = sec.querySelector('.mh-title');
  const lang = (document.documentElement && document.documentElement.lang) || navigator.language;
  return {
    hero: !!mark && !!use && (use.getAttribute('href') || '') === '#i-cl-HappyMac',
    markW: mark ? getComputedStyle(mark).width : null,
    tb: !!tb,
    tbClose: cl ? (cl.getAttribute('href') || '') : null,
    tbZoom: zm ? (zm.getAttribute('href') || '') : null,
    badgeAbsent: !sec.querySelector('.mh-badge') && !sec.querySelector('.mh-sub'),
    titleText: title ? title.textContent : '',
    // R10 kit 复跑:mark‖title 横排(title 左缘 ≥ mark 右缘;mark 是 SVG 无 offsetLeft,用 rect)
    row10: mark && title ? (t => title.getBoundingClientRect().left >= t.right - 2)(mark.getBoundingClientRect()) : false,
    lang,
    btns: sec.querySelectorAll('.mc-dlg-demo button').length,
    input: !!sec.querySelector('.mc-dlg-demo input'),
    sep: !!sec.querySelector('.mc-dlg-demo .dd-sep'),
    note: (sec.textContent || '').indexOf('toast') >= 0 && (sec.textContent || '').indexOf('存在门控') >= 0,
    switches: sec.querySelectorAll('.mc-dlg-demo [role="switch"], .mc-dlg-demo input[type="checkbox"]').length,
  };
});
if (!kit.NO) {
  ok(kit.hero && kit.markW === '48px' && kit.tb && kit.tbClose === '#i-close' && kit.tbZoom === '#i-zoom', 'kit: hero 样本构图(窗框 sprite 双方块+48px HappyMac mark)');
  ok(kit.badgeAbsent, 'kit: hero 样本裁定 — 无 badge/sub');
  ok(kit.row10, 'kit: R10 hero 样本横排(mark 左 title 右成对)');
  ok(kit.titleText === wantTitle(kit.lang), 'kit: hero 文案读 MC_HERO_COPY 按 locale (lang=' + kit.lang + ' 「' + kit.titleText + '」)');
  ok(kit.btns >= 2 && kit.input && kit.sep, 'kit: dialog 控件样本(方角钮×' + kit.btns + '+input+分隔线)');
  ok(kit.note, 'kit: 注记行(toast 不做裁定+存在门控说明)');
  ok(kit.switches === 0, 'kit: 无 switch 样本(裁定 1——Task 3 勘定官方 0 switch)');
} else { ok(false, 'kit: 浮层分区缺失'); }
await pg.evaluate(() => { window.__MC_KIT_OPEN__ = false; });

// ═══ E. 收口 ═══
ok(errors.length === 0, '零页面错误 (' + errors.length + ')');
await b.close();
console.log(failures === 0 ? 'VERIFY-OVERLAYS GREEN' : 'VERIFY-OVERLAYS RED (' + failures + ' failures)');
process.exit(failures === 0 ? 0 : 1);
