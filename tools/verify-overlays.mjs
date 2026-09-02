// tools/verify-overlays.mjs — overlays2 批活体门禁(2026-09-02)
// 用法: node tools/verify-overlays.mjs   (宿主须运行于 127.0.0.1:3080)
// 断言(照 brief Step 2 清单;switch 断言无——Task 3 勘定实证 settings 面板 0 switch,控制器裁定 1):
//   A hero: boot 相值(info)/.mc-hero 在场+own gate/官方空态容器 computed display=none(heroOfficial
//           在场时)/构图(.mh-mark 48px+use#i-cl-HappyMac/.mh-title 像素字/.mh-badge 直角)/
//           切实有会话 → 退场 → 新建会话钮镜像 click → 复挂;
//   B dialog: MC_MAP.dlgTriggerSettings 点开 → dlgCard 壳(直角/1px 实线/像素字/硬投影 3px)/
//           scrim 点阵幕 radial-gradient(z 仅 info 记录不 assert 官方值)/Esc 关净;
//   C 确认框(遇则断): 删除确认小卡在场时同款壳断言;不可达合法 INFO(Task 3 实证官方树被
//           McFinder 遮蔽,删除确认非破坏路径不可达——预期走 INFO 分支);
//   D 深浅两遍: html[data-theme] 切换后 A/B 核心断言复跑(verify-toolcard 直改 dataset 先例);
//   G 失配演练(spec §5 活体门禁硬项「破坏锚 → 官方原样 → 还原」;深色,顺序双演练,置于 kit 分区
//           之前——kit 的 addInitScript 持久注入,reload 会重开检视页且其 hero 样本直用 .mc-hero
//           真类,会污染演练② heroCount):①摘 style[data-mc-dlgskin] → 点设置 → 官方渲染回返
//           (dlgCard 圆角非 0)→ Esc → reload 主题重挂皮(单例 1 还原);②摘 .mc-hero+own gate →
//           官方空态回返 → 良性突变拨一拍 body observer → 自愈复挂+gate 复位(官方空态复藏);
//   E 零页面错误 + 截图 shots/overlays2-{dark,light}-{hero,dlg}.png;
//   F kit 浮层分区(verify-toolcard「kit 分区」先例补账): hero 样本构图/控件样本(无 switch)/注记行。
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
  trigger: '#root > div > div > div:first-child button[aria-haspopup="dialog"]', // MC_MAP.dlgTriggerSettings
  dlgCard: '[role="dialog"][aria-labelledby]',                  // MC_MAP.dlgCard
  dlgMask: '[role="presentation"]:has([role="dialog"][aria-labelledby]) > div[aria-hidden="true"]', // MC_MAP.dlgMask
  mirror: 'button[data-mc-finder][aria-label="新建会话"]',        // 自绘新建钮(finder.js ghBtn/mini 同款 aria)
  officialNew: '#root > div > div > div:first-child > div > div > button:nth-child(3)', // MC_MAP.sidebarNewSession(+1 标题栏占位)
};

const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
pg.on('pageerror', (e) => errors.push(String(e.message).slice(0, 200)));

await pg.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(8000); // 主题注入 + 会话恢复(verify 全家同款节律)

// —— hero 快照探针(单次求值) ——
const heroProbe = () => pg.evaluate((sel) => {
  const root = document.querySelector(sel.phase);
  const hero = document.querySelector('.mc-hero');
  const official = document.querySelector(sel.heroOfficial);
  const r = {
    phase: root ? root.getAttribute('data-phase') : null,
    gate: document.documentElement.hasAttribute('data-mc-hero'),
    heroCount: document.querySelectorAll('.mc-hero').length,
    officialPresent: !!official,
    officialDisplay: official ? getComputedStyle(official).display : null,
  };
  if (hero) {
    const mark = hero.querySelector('.mh-mark');
    const title = hero.querySelector('.mh-title');
    const badge = hero.querySelector('.mh-badge');
    const use = mark ? mark.querySelector('use') : null;
    r.markW = mark ? getComputedStyle(mark).width : null;
    r.markUse = use ? (use.getAttribute('href') || use.getAttribute('xlink:href') || '') : null;
    r.titleFont = title ? getComputedStyle(title).fontFamily : '';
    r.badgeRadius = badge ? getComputedStyle(badge).borderRadius : null;
  }
  return r;
}, SEL);

// —— dialog 快照探针(dlgCard 壳 + scrim;须开窗态调用) ——
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
ok(hp.markW === '48px', '深色 hero: 构图 .mh-mark 宽 48px (' + hp.markW + ')');
ok(hp.markUse === '#i-cl-HappyMac', '深色 hero: 构图 svg use #i-cl-HappyMac (' + hp.markUse + ')');
ok(hp.titleFont.indexOf('ChiKareGo') >= 0, '深色 hero: 构图 .mh-title 像素字 ChiKareGo (' + hp.titleFont.slice(0, 40) + ')');
ok(hp.badgeRadius === '0px', '深色 hero: 构图 .mh-badge 直角 (' + hp.badgeRadius + ')');
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
  ok(hp2.phase !== 'hero' && hp2.heroCount === 0 && !hp2.gate, '深色 hero: 切实有会话 → 相变+.mc-hero 退场+gate 撤 (phase=' + hp2.phase + ' count=' + hp2.heroCount + ')');
  const used = await newSessionMirror();
  ok(!!used, '深色 hero: 新建会话镜像 click 有靶(自绘优先/官方代理兜底)');
  info('A: 镜像 click 使用目标', used);
  let hp3 = await heroProbe();
  for (let i = 0; i < 20 && hp3.heroCount === 0; i++) { await pg.waitForTimeout(400); hp3 = await heroProbe(); }
  ok(hp3.heroCount === 1 && hp3.gate && hp3.phase === 'hero', '深色 hero: 切回空会话(新建镜像) → 复挂 (count=' + hp3.heroCount + ' phase=' + hp3.phase + ')');
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
if (dg.mask) {
  ok(dg.maskBgImage.indexOf('radial-gradient') >= 0, '深色 scrim: 点阵幕 radial-gradient 在场');
  info('深色 scrim: zIndex 记录(mask=' + dg.maskZ + ' / overlay=' + dg.overlayZ + ',官方原值不 assert)', { maskZ: dg.maskZ, overlayZ: dg.overlayZ });
} else { ok(false, '深色 scrim: dlgMask 未命中(:has 域定失配?)'); }
await pg.screenshot({ path: join(SHOTS, 'overlays2-dark-dlg.png') });
ok(await escClosed(), '深色 dlg: Esc 关闭 → dlgCard 退场');

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
ok(/ChiKareGo/.test(hl.titleFont), '浅色 hero: 标题像素字复跑 (' + hl.titleFont.slice(0, 40) + ')');
ok(hl.badgeRadius === '0px' && hl.markW === '48px', '浅色 hero: 构图复跑(徽标直角+mark 48px)');
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
}
if (dl.mask) {
  ok(dl.maskBgImage.indexOf('radial-gradient') >= 0, '浅色 scrim: 点阵幕复跑');
  info('浅色 scrim: zIndex 记录(mask=' + dl.maskZ + ' / overlay=' + dl.overlayZ + ')', { maskZ: dl.maskZ, overlayZ: dl.overlayZ });
} else { ok(false, '浅色 scrim: dlgMask 未命中'); }
await pg.screenshot({ path: join(SHOTS, 'overlays2-light-dlg.png') });
ok(await escClosed(), '浅色 dlg: Esc 关闭 → dlgCard 退场');
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

// —— ② hero:摘 .mc-hero+own gate → 官方空态回返 → 良性突变拨一拍 body observer → 自愈复挂 ——
// 破坏与官方回返断言须同一 evaluate 内同步取:remount 走 observer 微任务,一旦跨 await 中间态就
// 可能已被自愈抹掉;computed style 读取强制同步重排,摘 gate 后立即读值可信。
let hq = await heroProbe();
if (hq.heroCount === 0) { // reload 恢复态未落空会话 → 镜像新建归一(A 段守则同款)
  const usedM = await newSessionMirror();
  ok(!!usedM, '失配演练② 归一: 新建会话镜像 click 有靶');
  for (let i = 0; i < 20 && hq.heroCount === 0; i++) { await pg.waitForTimeout(400); hq = await heroProbe(); }
}
ok(hq.heroCount === 1 && hq.gate, '失配演练② hero: 基线 — .mc-hero 在场+gate 置位 (count=' + hq.heroCount + ' gate=' + hq.gate + ')');
const hM = await pg.evaluate((sel) => {
  const h = document.querySelector('.mc-hero');
  if (h) h.remove();
  document.documentElement.removeAttribute('data-mc-hero');
  const official = document.querySelector(sel.heroOfficial);
  return {
    heroCount: document.querySelectorAll('.mc-hero').length,
    gate: document.documentElement.hasAttribute('data-mc-hero'),
    officialPresent: !!official,
    officialDisplay: official ? getComputedStyle(official).display : null,
  };
}, SEL);
ok(hM.heroCount === 0 && !hM.gate, '失配演练② hero: 破坏生效 — .mc-hero 摘+gate 撤 (count=' + hM.heroCount + ')');
ok(hM.officialPresent && hM.officialDisplay !== 'none', '失配演练② hero: gate 撤 → 官方空态回返 (present=' + hM.officialPresent + ' display=' + hM.officialDisplay + ')');
await pg.evaluate(() => { const poke = document.createElement('div'); poke.style.display = 'none'; document.body.appendChild(poke); poke.remove(); }); // 良性突变 → observer 一拍
let hH = await heroProbe();
for (let i = 0; i < 10 && (hH.heroCount === 0 || !hH.gate); i++) { await pg.waitForTimeout(400); hH = await heroProbe(); }
ok(hH.heroCount === 1 && hH.gate, '失配演练② 还原: observer 自愈 → .mc-hero 复挂+gate 置回 (count=' + hH.heroCount + ' gate=' + hH.gate + ')');
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
  const badge = sec.querySelector('.mh-badge');
  const use = sec.querySelector('.mh-mark use');
  return {
    hero: !!mark && !!use && (use.getAttribute('href') || '') === '#i-cl-HappyMac',
    markW: mark ? getComputedStyle(mark).width : null,
    badgeRadius: badge ? getComputedStyle(badge).borderRadius : null,
    titleText: (sec.querySelector('.mh-title') || { textContent: '' }).textContent,
    btns: sec.querySelectorAll('.mc-dlg-demo button').length,
    input: !!sec.querySelector('.mc-dlg-demo input'),
    sep: !!sec.querySelector('.mc-dlg-demo .dd-sep'),
    note: (sec.textContent || '').indexOf('toast') >= 0 && (sec.textContent || '').indexOf('存在门控') >= 0,
    switches: sec.querySelectorAll('.mc-dlg-demo [role="switch"], .mc-dlg-demo input[type="checkbox"]').length,
  };
});
if (!kit.NO) {
  ok(kit.hero && kit.markW === '48px' && kit.badgeRadius === '0px', 'kit: hero 样本构图(48px HappyMac mark+直角徽标)');
  ok(kit.titleText.indexOf('Think') === 0 && kit.titleText.indexOf('Classic') > 0, 'kit: hero 文案读 MC_HERO_COPY (Think Classic…:「' + kit.titleText.slice(0, 24) + '」)');
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
