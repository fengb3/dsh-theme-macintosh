// tools/probe-banner.mjs — README 顶部 banner 探针(2026-09-04)
// 用法: node tools/probe-banner.mjs   (宿主须运行于 127.0.0.1:3080;showcase overview 截图须在库)
// 产出: shots/banner-plate-dark.png / banner-plate-light.png —— 1520×480 主题底板
//   (网点桌面 + 横贯 .mc-hero-tb 条纹窗框 + 左侧 hero「Seek Different」slogan)。
//       shots/banner.png —— 底板深左浅右 4px Bayer4 细棋盘溶解拼合后,右侧叠主界面级联双窗:
//   shots/showcase/overview-{dark,light}.png(活体实有会话)缩小为 656×410 两窗层叠,
//   浅窗左缘 80px 窄带内两窗逐块棋盘溶解(README 用)。
// 只读纪律: 不发消息不删数据;主题直钉 html[data-theme] 运行时生效,不落 profile 存档;
//   合成期临时摘 html[data-mc-hero](hero 相 margin-top:auto 门控会推歪克隆),页随 ctx 关闭即弃。
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'shots');
mkdirSync(OUT, { recursive: true });
const URL = 'http://127.0.0.1:3080';
const W = 1520, H = 480; // banner 成品尺寸
// 级联双窗几何(1440×900 活体截图 → 656×410,等比 0.4556)
const WIN = { dx: 640, dy: 36, lx: 840, ly: 52, dw: 656, dh: 410, band: 80 };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ───────────────────────── 主题底板(按 kit 分区定位 → 克隆,probe-showcase 同源) ─────────────────────────
const KIT_JS = () => {
  window.__mcx = {
    bySec(t) {
      return [...document.querySelectorAll('.kit-panel section')]
        .find((s) => { const h = s.querySelector('.kit-h'); return h && h.textContent === t; });
    },
    find(it) {
      let scope = this.bySec(it.sec);
      if (!scope) return null;
      if (it.frameIdx != null) {
        const frames = scope.querySelectorAll('.kit-frame');
        scope = frames[it.frameIdx];
        if (!scope) return null;
      }
      const nodes = scope.querySelectorAll(it.q);
      return nodes[it.idx || 0] || null;
    },
    // 合成 1520×480 主题底板:窗框条横贯顶部 + 左侧「Seek Different」slogan(贴左)
    plate(spec) {
      // hero 相门控摘除:.mc-hero{margin-top:auto!important} 会把克隆推到行底
      const hadHeroGate = document.documentElement.hasAttribute('data-mc-hero');
      if (hadHeroGate) document.documentElement.removeAttribute('data-mc-hero');
      // token 字面值直读内联(var() 内联在个别页面态下解析落空,不赌)
      const rootCs = getComputedStyle(document.documentElement);
      const bg = rootCs.getPropertyValue('--mc-bg').trim();
      const pat = rootCs.getPropertyValue('--mc-desktop-pattern').trim();
      let st = document.getElementById('mcx-banner');
      if (st) st.remove();
      st = document.createElement('div');
      st.id = 'mcx-banner';
      st.style.cssText = 'position:fixed;left:40px;top:30px;width:' + spec.w + 'px;height:' + spec.h + 'px;' +
        'z-index:2147483000;overflow:hidden;' +
        'background-color:' + bg + ';background-image:' + pat + ';background-size:8px 8px;';
      document.body.appendChild(st);
      const diag = { bg, patLen: pat.length, hadHeroGate };
      // scoped 样式(.kit-panel .xxx)依赖此前缀容器——probe-showcase 舞台同款
      const panel = document.createElement('div');
      panel.className = 'kit-panel';
      panel.style.cssText = 'position:absolute;inset:0;background:transparent;border:none;box-shadow:none;' +
        'border-radius:0;max-width:none;margin:0;overflow:hidden;display:flex;flex-direction:column;' +
        'justify-content:center;align-items:flex-start;padding:24px 24px 16px 64px;';
      st.appendChild(panel);
      const tb = this.find({ sec: '浮层', q: '.mc-hero-tb' });
      const hero = this.find({ sec: '浮层', q: '.mc-hero' });
      if (!tb || !hero) return { err: (!tb ? '.mc-hero-tb' : '.mc-hero') + ' not found', diag };
      // 窗框条:横贯 banner 顶(hero 相与 dialog 卡共用面,20px pinstripe+close/zoom 方块)
      const tbC = tb.cloneNode(true);
      tbC.style.cssText += ';position:absolute;top:0;left:0;right:0;width:100%;';
      st.appendChild(tbC);
      // slogan:mark 64px + 标题 48px,贴左垂中
      const heroC = hero.cloneNode(true);
      heroC.style.cssText += ';padding:0;gap:24px;width:max-content;margin:0;';
      const mark = heroC.querySelector('.mh-mark');
      if (mark) { mark.style.width = '64px'; mark.style.height = '64px'; }
      const title = heroC.querySelector('.mh-title');
      if (title) { title.style.fontSize = '48px'; title.textContent = 'Seek Different'; }
      panel.appendChild(heroC);
      const rc = getComputedStyle(st);
      diag.appliedBg = rc.backgroundColor;
      diag.appliedPat = rc.backgroundImage.slice(0, 40);
      return { ok: true, diag };
    },
  };
};

// ───────────────────────── 拼接(底板深左浅右 4px Bayer4 细溶解 + 主界面级联双窗) ─────────────────────────
// 4×4 Bayer 矩阵 16 级阈值;缝带 80px 窄带 @浅窗左缘,块尺寸 4px(棋盘格细)。
const STITCH_JS = (spec) => {
  const { w, h, darkPlate, lightPlate, shotDark, shotLight, win } = spec;
  const B4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const mk = (src) => new Promise((res) => {
    const im = new Image();
    im.onload = () => res(im);
    im.src = 'data:image/png;base64,' + src;
  });
  const frame = (cx, x, y, fw, fh) => { // 2px 硬边框(经典窗框)
    cx.fillStyle = '#000';
    cx.fillRect(x - 2, y - 2, fw + 4, 2);
    cx.fillRect(x - 2, y + fh, fw + 4, 2);
    cx.fillRect(x - 2, y, 2, fh);
    cx.fillRect(x + fw, y, 2, fh);
  };
  return (async () => {
    const [pD, pL, sD, sL] = await Promise.all(
      [darkPlate, lightPlate, shotDark, shotLight].map(mk));
    const cv = document.createElement('canvas');
    cv.id = 'mcx-cv';
    cv.width = w; cv.height = h;
    cv.style.cssText = 'position:fixed;left:0;top:0;';
    document.body.appendChild(cv);
    const cx = cv.getContext('2d');
    // 1) 底板:深色全幅 → 缝带棋盘 → 右段浅色
    cx.drawImage(pD, 0, 0, w, h);
    const B = 4, cols = Math.ceil(w / B), rows = Math.ceil(h / B);
    const b0 = Math.round(win.lx / B), b1 = Math.round((win.lx + win.band) / B);
    for (let bx = b1; bx < cols; bx++) {
      cx.drawImage(pL, bx * B, 0, B, h, bx * B, 0, B, h);
    }
    for (let by = 0; by < rows; by++) {
      for (let bx = b0; bx < b1; bx++) {
        const p = (bx - b0 + 0.5) / (b1 - b0);
        const t = (B4[by % 4][bx % 4] + 0.5) / 16;
        if (p > t) cx.drawImage(pL, bx * B, by * B, B, B, bx * B, by * B, B, B);
      }
    }
    // 2) 主界面级联双窗(硬阴影 + 2px 窗框;浅窗前压)
    const scale = sD.naturalWidth ? win.dw / sD.naturalWidth : 1;
    cx.fillStyle = 'rgba(0,0,0,.55)';
    cx.fillRect(win.dx + 6, win.dy + 6, win.dw, win.dh);   // 深窗阴影
    cx.drawImage(sD, win.dx, win.dy, win.dw, win.dh);
    frame(cx, win.dx, win.dy, win.dw, win.dh);
    cx.fillStyle = 'rgba(0,0,0,.55)';
    cx.fillRect(win.lx + 6, win.ly + 6, win.dw, win.dh);   // 浅窗阴影
    cx.drawImage(sL, win.lx, win.ly, win.dw, win.dh);
    frame(cx, win.lx, win.ly, win.dw, win.dh);
    // 3) 浅窗左缘窄带:两窗逐块棋盘溶解(p 小 → 深窗胜出,p 大 → 浅窗胜出)
    const ry0 = Math.max(0, Math.ceil(win.ly / B)), ry1 = Math.min(rows, Math.ceil((win.ly + win.dh) / B));
    for (let by = ry0; by < ry1; by++) {
      for (let bx = b0; bx < b1; bx++) {
        const p = (bx - b0 + 0.5) / (b1 - b0);
        const t = (B4[by % 4][bx % 4] + 0.5) / 16;
        if (p <= t) { // 深窗胜出:从深色截图源回贴对应块
          const sx = (bx * B - win.dx) / scale, sy = (by * B - win.dy) / scale, ss = B / scale;
          cx.drawImage(sD, sx, sy, ss, ss, bx * B, by * B, B, B);
        }
      }
    }
    return { ok: true };
  })();
};

// ───────────────────────── 主流程 ─────────────────────────
const browser = await chromium.launch();
const themes = process.env.THEME ? process.env.THEME.split(',') : ['dark', 'light'];
const plates = {};

if (process.env.STITCH_ONLY) {
  // 免重拍:直接读已存两块底板,只重跑级联溶解拼合
  plates.dark = readFileSync(join(OUT, 'banner-plate-dark.png')).toString('base64');
  plates.light = readFileSync(join(OUT, 'banner-plate-light.png')).toString('base64');
}
for (const theme of (!process.env.STITCH_ONLY ? themes : [])) {
  const ctx = await browser.newContext({ viewport: { width: W + 80, height: H + 60 } });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => console.error('[' + theme + '] pageerror: ' + String(e.message).slice(0, 160)));

  await pg.goto(URL, { waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(8000); // 主题注入 + 会话恢复(verify 全家同款节律)
  await pg.evaluate((x) => { document.documentElement.dataset.theme = x; }, theme);

  // kit 检视页(init script 挂旗 → reload)
  await pg.addInitScript(() => { window.__MC_KIT_OPEN__ = true; });
  await pg.reload({ waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(9000);
  await pg.evaluate((x) => { document.documentElement.dataset.theme = x; }, theme); // reload 后复钉

  await pg.evaluate(KIT_JS);
  const r = await pg.evaluate((s) => window.__mcx.plate(s), { w: W, h: H });
  console.log('PLATE [' + theme + '] ' + JSON.stringify(r));
  if (!r.ok) { await ctx.close(); continue; }
  await wait(400);
  const file = 'banner-plate-' + theme + '.png';
  await pg.screenshot({ path: join(OUT, file), clip: { x: 40, y: 30, width: W, height: H } });
  plates[theme] = readFileSync(join(OUT, file)).toString('base64');
  console.log('SHOT ' + file + '  (' + W + '×' + H + ')');
  await ctx.close();
}

// 级联溶解拼合(底板两块 + showcase 活体主界面截图两开)
const SHOT_D = join(OUT, 'showcase', 'overview-dark.png');
const SHOT_L = join(OUT, 'showcase', 'overview-light.png');
if (plates.dark && plates.light && existsSync(SHOT_D) && existsSync(SHOT_L)) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const pg = await ctx.newPage();
  await pg.goto('about:blank');
  const r = await pg.evaluate(STITCH_JS, {
    w: W, h: H,
    darkPlate: plates.dark, lightPlate: plates.light,
    shotDark: readFileSync(SHOT_D).toString('base64'),
    shotLight: readFileSync(SHOT_L).toString('base64'),
    win: WIN,
  });
  console.log('STITCH ' + JSON.stringify(r));
  await pg.waitForSelector('#mcx-cv');
  await wait(300);
  await pg.screenshot({ path: join(OUT, 'banner.png'), clip: { x: 0, y: 0, width: W, height: H } });
  console.log('SHOT banner.png  (stitched ' + W + '×' + H + ')');
  await ctx.close();
} else {
  console.error('STITCH SKIP: 需要底板两块 + ' + SHOT_D + ' / ' + SHOT_L);
}

await browser.close();
console.log('\nBANNER done: ' + Object.keys(plates).join(' + ') + (plates.dark && plates.light ? ' + stitched' : ''));
