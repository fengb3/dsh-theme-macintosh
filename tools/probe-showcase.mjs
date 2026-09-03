// tools/probe-showcase.mjs — README showcase 截图探针(2026-09-04)
// 用法: node tools/probe-showcase.mjs   (宿主须运行于 127.0.0.1:3080)
// 产出: shots/showcase/*.png —— 深浅两套 token 各一遍。
//   · 组件镜头:kit 检视页(__MC_KIT_OPEN__)真组件克隆到「舞台」—— --mc-bg 底 + 桌面
//     --mc-desktop-pattern 8px 网点纹,居中陈列后按内容 bbox+pad 裁剪;脉冲动画定格落静态底色。
//   · 活体镜头:主界面(实有会话)/开机空态(hero 相,新建镜像)/设置弹窗(官方 scrim 点阵幕)/
//     实况菜单(会话行三点)/响应式抽屉(≤1023 汉堡)。
// 只读纪律: 不发消息不删数据;hero 空会话优先复用已存「新会话」,缺则新建镜像一次(verify-overlays
// 同款,留一个空会话,零模型调用);主题直钉 html[data-theme] 运行时生效,不落 profile 存档。
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'shots', 'showcase');
mkdirSync(OUT, { recursive: true });
const URL = 'http://127.0.0.1:3080';
const errors = [];
const made = [];
const skipped = [];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ───────────────────────── 舞台(注入页面的克隆/陈列帮手) ─────────────────────────
const STAGE_JS = () => {
  window.__mcx = {
    bySec(t) {
      return [...document.querySelectorAll('.kit-panel section')]
        .find((s) => { const h = s.querySelector('.kit-h'); return h && h.textContent === t; });
    },
    // 解析 {sec, q, idx, frameIdx} → kit 分区内节点
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
    // items: [{sec,q,idx,frameIdx,strip,width}];opts: {dir:'col'|'row',gap,pad}
    place(items, opts) {
      const o = opts || {};
      let st = document.getElementById('mcx-stage');
      if (!st) {
        st = document.createElement('div');
        st.id = 'mcx-stage';
        st.style.cssText = 'position:fixed;inset:0;z-index:2147483000;overflow:hidden;' +
          'background-color:var(--mc-bg);background-image:var(--mc-desktop-pattern);' +
          'background-size:8px 8px;background-position:0 0;' +
          'display:flex;align-items:center;justify-content:center;';
        document.body.appendChild(st);
        // 脉冲定格(scoped 到舞台):mc-pill.run 八角点 / retry s-dot 摘 animation 落静态底色
        if (!document.getElementById('mcx-freeze')) {
          const fz = document.createElement('style');
          fz.id = 'mcx-freeze';
          fz.textContent = '#mcx-stage .mc-pill.run::before,#mcx-stage .s-dot{animation:none!important}';
          document.head.appendChild(fz);
        }
      }
      let inner = st.firstElementChild;
      if (!inner) {
        inner = document.createElement('div');
        inner.className = 'kit-panel'; // 会话流等 scoped 样式(.kit-panel .xxx)依赖此前缀
        inner.style.cssText = 'background:transparent;border:none;box-shadow:none;border-radius:0;' +
          'max-width:none;margin:0;overflow:visible;display:flex;flex-direction:column;' +
          'align-items:center;justify-content:center;';
        st.appendChild(inner);
      }
      inner.innerHTML = '';
      const box = document.createElement('div');
      box.style.cssText = 'display:flex;flex-direction:' + (o.dir === 'row' ? 'row' : 'column') +
        ';align-items:' + (o.dir === 'row' ? 'flex-start' : 'center') +
        ';gap:' + (o.gap != null ? o.gap : 34) + 'px;';
      inner.appendChild(box);
      for (const it of items) {
        const src = this.find(it);
        if (!src) return { err: it.sec + ' / ' + it.q + (it.idx ? '[' + it.idx + ']' : '') };
        const node = src.cloneNode(true);
        if (it.strip) node.querySelectorAll(it.strip).forEach((n) => n.remove());
        const cell = document.createElement('div');
        // dock 原语以 [data-mc-dock] 祖先 scoping —— cell 直接顶替原 wrap 身份
        if (it.dock) { cell.className = 'kit-dockwrap'; cell.setAttribute('data-mc-dock', ''); }
        cell.style.cssText = 'display:flex;flex-direction:column;align-items:stretch;' +
          (it.width ? 'width:' + it.width + ';' : '');
        cell.appendChild(node);
        box.appendChild(cell);
      }
      return { ok: true };
    },
    bbox() {
      const box = document.querySelector('#mcx-stage > .kit-panel > div');
      const r = box.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    },
    drop() { const st = document.getElementById('mcx-stage'); if (st) st.remove(); },
  };
};

// ───────────────────────── 截图帮手 ─────────────────────────
async function shootClip(pg, name, pad) {
  let b = await pg.evaluate(() => window.__mcx.bbox());
  const tw = Math.ceil(b.w) + pad * 2;
  const th = Math.ceil(b.h) + pad * 2;
  const vp = pg.viewportSize();
  if (vp.width < tw || vp.height < th) {
    await pg.setViewportSize({ width: Math.max(vp.width, tw), height: Math.max(vp.height, th) });
    await wait(300);
    b = await pg.evaluate(() => window.__mcx.bbox()); // 重居中后复量
  }
  await pg.screenshot({
    path: join(OUT, name),
    clip: { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: b.w + pad * 2, height: b.h + pad * 2 },
  }).catch((e) => { console.error('DIAG name=' + JSON.stringify(name) + ' bbox=' + JSON.stringify(b) + ' pad=' + pad); throw e; });
  made.push(name);
  console.log('SHOT ' + name + '  (' + Math.round(b.w) + '×' + Math.round(b.h) + ')');
}

// 舞台镜头:place → 可选交互 → 裁剪;{t} 由主题名替换
// ONLY=a,b 前缀过滤单图补拍;THEME=dark,light 选主题轮
async function stageShot(pg, theme, name, items, opts, act) {
  const only = process.env.ONLY;
  if (only && !only.split(',').some((k) => name.startsWith(k))) return false;
  const r = await pg.evaluate((spec) => window.__mcx.place(spec.items, spec.opts), { items, opts });
  if (!r.ok) { skipped.push(name); console.log('SKIP ' + name + ' (' + r.err + ')'); return false; }
  if (act) await act(pg);
  await shootClip(pg, name.replace('{t}', theme) + '.png', opts && opts.pad != null ? opts.pad : 56);
  await pg.evaluate(() => { const i = document.querySelector('#mcx-stage > .kit-panel'); if (i) i.innerHTML = ''; });
  return true;
}

async function shotFull(pg, name) {
  await pg.screenshot({ path: join(OUT, name) });
  made.push(name);
  console.log('SHOT ' + name + ' (full)');
}

// ───────────────────────── 活体镜头帮手 ─────────────────────────
// 展开侧栏全部「展开其余 N 个会话」后按标题前缀切会话(live-common openSession 同款)
async function openSession(pg, titlePrefix) {
  await pg.evaluate(() => { for (const more of [...document.querySelectorAll('.mc-sb-more')]) { try { more.click(); } catch (e) { /* 行已展尽 */ } } });
  await wait(700);
  const picked = await pg.evaluate((p) => {
    const rows = [...document.querySelectorAll('.mc-sess')];
    const row = rows.find((n) => ((n.getAttribute('title') || '')).startsWith(p))
      || rows.find((n) => (n.getAttribute('title') || '') !== '新会话')
      || rows[0];
    if (row) { row.click(); return row.getAttribute('title'); }
    return null;
  }, titlePrefix);
  await wait(3000);
  return picked;
}

// hero 相归一:优先复用已存「新会话」空会话,缺则新建镜像 click(verify-overlays 同款双靶)
async function ensureHero(pg) {
  const heroNow = async () => pg.evaluate(() => document.querySelectorAll('.mc-hero').length);
  const usedNew = await pg.evaluate(() => {
    for (const more of [...document.querySelectorAll('.mc-sb-more')]) { try { more.click(); } catch (e) { /* 已展尽 */ } }
    const rows = [...document.querySelectorAll('.mc-sess')];
    const row = rows.find((n) => (n.getAttribute('title') || '') === '新会话');
    if (row) { row.click(); return 'reused 新会话'; }
    return null;
  });
  await wait(2500);
  if (await heroNow() > 0) return usedNew || 'reused 新会话';
  const used = await pg.evaluate(() => {
    const m = document.querySelector('button[data-mc-finder][aria-label="新建会话"]');
    if (m) { m.click(); return 'mirror 新建会话'; }
    const o = document.querySelector('#root > div > div > div:first-child > div > div > button:nth-child(3)');
    if (o) { o.click(); return 'official 新建会话'; }
    return null;
  });
  for (let i = 0; i < 20 && await heroNow() === 0; i++) await wait(400);
  return used;
}

// 设置弹窗开/关(官方 scrim 自带点阵幕)
const DLG_TRIGGER = '#root > div > div > div:first-child button[aria-haspopup="dialog"]';
async function openDlg(pg) {
  await pg.evaluate((s) => { const t = document.querySelector(s); if (t) t.click(); }, DLG_TRIGGER);
  for (let i = 0; i < 15; i++) {
    if (await pg.evaluate(() => !!document.querySelector('[role="dialog"][aria-labelledby]'))) { await wait(600); return true; }
    await wait(300);
  }
  return false;
}
async function closeDlg(pg) {
  await pg.evaluate(() => {
    const bar = document.querySelector('[role="dialog"][aria-labelledby] .mc-dlg-tb');
    const cl = bar && bar.querySelector('.mc-tbx.cl');
    if (cl) cl.click();
  });
  for (let i = 0; i < 10; i++) {
    if (await pg.evaluate(() => !document.querySelector('[role="dialog"][aria-labelledby]'))) return;
    await wait(300);
  }
}

// ───────────────────────── 活体镜头组(每主题一遍) ─────────────────────────
async function liveShots(pg, theme) {
  const t = (n) => n + '-' + theme + '.png';

  // 1) 主界面整图(实有会话)
  await openSession(pg, '生成mul9');
  await wait(1200);
  await shotFull(pg, t('overview'));

  // 2) 实况菜单(会话行三点 → portal 菜单;裁 行+菜单 并集)
  try {
    const row = pg.locator('.mc-sess').first();
    await row.hover();
    await pg.locator('.mc-sess .mc-s-menu').first().click({ force: true });
    await wait(600);
    const box = await pg.evaluate(() => {
      // .mc-menu 是 position:fixed(offsetParent 恒 null)→ 用实盒判可见
      const menu = [...document.querySelectorAll('.mc-menu')]
        .find((m) => { const r = m.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
      const rowEl = document.querySelector('.mc-sess');
      if (!menu) return null;
      const a = menu.getBoundingClientRect(), b = rowEl.getBoundingClientRect();
      const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
      return { x, y, width: Math.max(a.right, b.right) - x, height: Math.max(a.bottom, b.bottom) - y };
    });
    if (box) {
      const pad = 26;
      await pg.screenshot({
        path: join(OUT, t('menu-live')),
        clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.width + pad * 2, height: box.height + pad * 2 },
      });
      made.push(t('menu-live')); console.log('SHOT ' + t('menu-live') + ' (live menu)');
    } else { skipped.push(t('menu-live')); console.log('SKIP ' + t('menu-live') + ' (菜单未开)'); }
    await pg.mouse.click(760, 500); // 外点关
    await wait(400);
  } catch (e) { skipped.push(t('menu-live')); console.log('SKIP ' + t('menu-live') + ' (' + String(e.message).slice(0, 80) + ')'); }

  // 3) 开机空态(hero 相;空会话复用/新建各一)
  await ensureHero(pg);
  await wait(1000);
  await shotFull(pg, t('boot'));

  // 4) 设置弹窗(点阵幕活体)
  if (await openDlg(pg)) {
    await shotFull(pg, t('dlg'));
    await closeDlg(pg);
  } else { skipped.push(t('dlg')); console.log('SKIP ' + t('dlg') + ' (dialog 未开)'); }

  // 5) 响应式抽屉(≤1023 汉堡;整窗)
  await pg.setViewportSize({ width: 900, height: 760 });
  await wait(700);
  try {
    await pg.evaluate(() => { const b = document.querySelector('.mc-burger'); if (b) b.click(); });
    await wait(800);
    await shotFull(pg, t('responsive'));
  } catch (e) { skipped.push(t('responsive')); console.log('SKIP ' + t('responsive') + ' (' + String(e.message).slice(0, 80) + ')'); }
  await pg.setViewportSize({ width: 1440, height: 900 });
  await wait(500);
}

// ───────────────────────── 舞台镜头组(每主题一遍) ─────────────────────────
async function stageShots(pg, theme) {
  // 等 kit 检视页就绪
  for (let i = 0; i < 30; i++) {
    if (await pg.evaluate(() => document.querySelectorAll('.kit-panel section').length >= 11)) break;
    await wait(500);
  }
  const secN = await pg.evaluate(() => document.querySelectorAll('.kit-panel section').length);
  console.log('KIT sections = ' + secN);

  // Tokens 色板
  await stageShot(pg, theme, 'tokens-{t}',
    [{ sec: 'Tokens 色板', q: '.kit-grid' }], { gap: 0, pad: 64 });

  // 基础原语 · 按钮(默认/Primary/Danger/禁用)
  await stageShot(pg, theme, 'btn-{t}',
    [{ sec: '基础原语', q: '.kit-row', idx: 0, strip: '.kit-note' }], { gap: 0, pad: 64 });
  // 按钮 :active 按下反色(按住首个钮截)
  await stageShot(pg, theme, 'btn-active-{t}',
    [{ sec: '基础原语', q: '.kit-row', idx: 0, strip: '.kit-note' }], { gap: 0, pad: 64 },
    async (p) => {
      const b = p.locator('#mcx-stage .mc-btn').first();
      await b.hover();
      await p.mouse.down();
      await wait(200);
    });
  await pg.mouse.up();
  // 状态胶囊五型
  await stageShot(pg, theme, 'pills-{t}',
    [{ sec: '基础原语', q: '.kit-row', idx: 1 }], { gap: 0, pad: 64 });
  // 输入域(聚焦 accent 外环)+ 折叠三角双态(三角 svg 2× 放大,symbol viewBox 矢量无损)
  await stageShot(pg, theme, 'field-tri-{t}',
    [{ sec: '基础原语', q: '.kit-row', idx: 2, width: '560px' }], { gap: 0, pad: 64 },
    async (p) => {
      await p.evaluate(() => {
        document.querySelectorAll('#mcx-stage .mc-tri').forEach((s) => {
          s.style.width = '22px'; s.style.height = '22px';
        });
      });
      await p.locator('#mcx-stage input').first().click();
      await wait(200);
    });

  // Sprite 图标墙
  await stageShot(pg, theme, 'icons-{t}',
    [{ sec: 'Sprite 图标墙', q: '.kit-iconwall', width: '940px' }], { gap: 0, pad: 64 });

  // 会话流 · md 全要素(卡片窗;section 级首个 .kit-frame 即 md 帧)
  await stageShot(pg, theme, 'flow-md-{t}',
    [{ sec: '会话流', q: '.kit-frame', width: '800px' }], { gap: 0, pad: 56 });
  // 用户消息 · 图片附件
  await stageShot(pg, theme, 'flow-msg-{t}',
    [{ sec: '会话流', q: '.msg.user', frameIdx: 1 }], { gap: 0, pad: 64 });
  // 上下文注入 · 细长条四型
  await stageShot(pg, theme, 'flow-inject-{t}',
    [{ sec: '会话流', q: '.kit-injects', frameIdx: 2, width: '680px' }], { gap: 0, pad: 64 });

  // 推理卡 · 流式(▶ 播放流式 → 正文过半即克隆,cover 白块可能在场)
  await pg.evaluate(() => {
    const sec = [...document.querySelectorAll('.kit-panel section')]
      .find((s) => s.querySelector('.kit-h') && s.querySelector('.kit-h').textContent === '会话流');
    const btn = [...sec.querySelectorAll('button')].find((b) => b.textContent.indexOf('播放流式') >= 0);
    if (btn) btn.click();
  });
  for (let i = 0; i < 40; i++) {
    const len = await pg.evaluate(() => {
      const r = document.querySelector('.kit-panel .reasoning.run .r-txt');
      return r ? r.textContent.length : 0;
    });
    if (len > 80) break;
    await wait(150);
  }
  await stageShot(pg, theme, 'flow-reasoning-run-{t}',
    [{ sec: '会话流', q: '.reasoning.run', frameIdx: 3, width: '640px' }], { gap: 0, pad: 64 });
  // 推理卡 · 完成(■ 收尾 → 收合态定格)
  await pg.evaluate(() => {
    const sec = [...document.querySelectorAll('.kit-panel section')]
      .find((s) => s.querySelector('.kit-h') && s.querySelector('.kit-h').textContent === '会话流');
    const btn = [...sec.querySelectorAll('button')].find((b) => b.textContent.indexOf('收尾') >= 0);
    if (btn) btn.click();
  });
  await wait(500);
  await stageShot(pg, theme, 'flow-reasoning-done-{t}',
    [{ sec: '会话流', q: '.reasoning', frameIdx: 3, idx: 0, width: '640px' }], { gap: 0, pad: 64 });

  // 自动重试行 / 上限行 / 回合尾
  await stageShot(pg, theme, 'flow-rows-{t}',
    [
      { sec: '会话流', q: '.retry-row', frameIdx: 4, width: '620px' },
      { sec: '会话流', q: '.cap-row', frameIdx: 4, width: '620px' },
      { sec: '会话流', q: '.turn-tail', frameIdx: 4, width: '620px' },
    ], { gap: 18, pad: 64 });

  // 输入坞 · composer 三态
  await stageShot(pg, theme, 'dock-composer-{t}',
    [
      { sec: '输入坞', q: '.composer[data-mc-state="idle"]', frameIdx: 0, width: '600px', dock: true },
      { sec: '输入坞', q: '.composer[data-mc-state="ready"]', frameIdx: 0, width: '600px', dock: true },
      { sec: '输入坞', q: '.composer[data-mc-state="busy"]', frameIdx: 0, width: '600px', dock: true },
    ], { gap: 20, pad: 64 });
  // 输入坞 · 家具(queue/todo 折叠+展开/goal active+blocked)
  await stageShot(pg, theme, 'dock-furn-{t}',
    [{ sec: '输入坞', q: '.kit-dockwrap', frameIdx: 1, width: '640px' }], { gap: 0, pad: 64 });
  // 输入坞 · ctx 圆环 + pop(先点源开 pop 再克隆;上叠 ready composer 构成完整坞底)
  await pg.evaluate(() => {
    const ring = document.querySelector('.kit-panel .kit-dockctx .ctx-ring');
    if (ring) ring.click();
  });
  await wait(300);
  await stageShot(pg, theme, 'dock-ctx-{t}',
    [
      { sec: '输入坞', q: '.composer[data-mc-state="ready"]', frameIdx: 0, width: '640px', dock: true },
      { sec: '输入坞', q: '.kit-dockctx', frameIdx: 2, width: '640px' },
    ], { gap: 0, pad: 64 });
  await pg.evaluate(() => {
    const ring = document.querySelector('.kit-panel .kit-dockctx .ctx-ring');
    if (ring) ring.click(); // 复位
  });

  // 弹出菜单 · 静态陈列
  await stageShot(pg, theme, 'menu-{t}',
    [{ sec: '弹出菜单', q: '.kit-menustatic', width: '300px' }], { gap: 0, pad: 64 });

  // 浮层 · hero 空态样本(窗框+mark‖标题)
  await stageShot(pg, theme, 'hero-{t}',
    [
      { sec: '浮层', q: '.mc-hero-tb', width: '720px' },
      { sec: '浮层', q: '.mc-hero', width: '720px' },
    ], { gap: 0, pad: 72 });
  // 浮层 · dialog 控件样本
  await stageShot(pg, theme, 'dlg-controls-{t}',
    [{ sec: '浮层', q: '.mc-dlg-demo', width: '440px' }], { gap: 0, pad: 64 });

  // 问题卡 · 问题卡 + 计划审批卡并排
  await stageShot(pg, theme, 'ask-{t}',
    [
      { sec: '问题卡', q: '.kit-ask-card', frameIdx: 0, width: '430px' },
      { sec: '问题卡', q: '.kit-ask-card', frameIdx: 1, width: '430px' },
    ], { dir: 'row', gap: 44, pad: 64 });

  // 工具卡 · 五样本
  await stageShot(pg, theme, 'tools-{t}',
    [0, 1, 2, 3, 4].map((i) => ({ sec: '工具卡', q: '.mc-tool', frameIdx: 0, idx: i, width: '700px' })),
    { gap: 16, pad: 56 });

  // 工具卡 · 状态三帧(轮播轮询:running/done/fail 各候一帧;states 框 = section 内第 2 个 frame)
  for (const [state, label] of [['mc-run', 'running'], ['', 'done'], ['mc-fail', 'fail']]) {
    let caught = false;
    for (let i = 0; i < 60 && !caught; i++) {
      const hit = await pg.evaluate((s) => {
        const sec = [...document.querySelectorAll('.kit-panel section')]
          .find((x) => x.querySelector('.kit-h') && x.querySelector('.kit-h').textContent === '工具卡');
        if (!sec) return false;
        const statesFrame = sec.querySelectorAll('.kit-frame')[1];
        const card = statesFrame && statesFrame.querySelector('.mc-tool');
        if (!card) return false;
        return s === '' ? (!card.classList.contains('mc-run') && !card.classList.contains('mc-fail'))
          : card.classList.contains(s);
      }, state);
      if (hit) {
        caught = await stageShot(pg, theme, 'tool-' + label + '-{t}',
          [{ sec: '工具卡', q: '.mc-tool', frameIdx: 1, width: '700px' }], { gap: 0, pad: 56 });
      } else {
        await wait(150);
      }
    }
    if (!caught) { skipped.push('tool-' + label); console.log('SKIP tool-' + label + ' (轮播状态未候到)'); }
  }
}

// ───────────────────────── 主流程 ─────────────────────────
const browser = await chromium.launch();
const themes = process.env.THEME ? process.env.THEME.split(',') : ['dark', 'light'];

for (const theme of themes) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  pg.on('pageerror', (e) => errors.push('[' + theme + '] ' + String(e.message).slice(0, 160)));

  await pg.goto(URL, { waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(8000); // 主题注入 + 会话恢复(verify 全家同款节律)
  await pg.evaluate((x) => { document.documentElement.dataset.theme = x; }, theme);
  await pg.waitForTimeout(600);

  // 活体镜头(无 kit 覆层;SKIP_LIVE=1 跳过,调试用;ONLY 补拍模式下自动跳过)
  if (!process.env.SKIP_LIVE && !process.env.ONLY) await liveShots(pg, theme);

  // kit 检视页(init script 挂旗 → reload)
  await pg.addInitScript(() => { window.__MC_KIT_OPEN__ = true; });
  await pg.reload({ waitUntil: 'domcontentloaded' });
  await pg.waitForTimeout(9000);
  await pg.evaluate((x) => { document.documentElement.dataset.theme = x; }, theme); // reload 后复钉

  await pg.evaluate(STAGE_JS);
  await stageShots(pg, theme);
  await pg.evaluate(() => window.__mcx.drop());

  await ctx.close();
  console.log('── ' + theme + ' done ──');
}

await browser.close();
console.log('\nSHOWCASE ' + made.length + ' shots, ' + skipped.length + ' skipped, ' + errors.length + ' pageerrors');
if (skipped.length) console.log('SKIPPED: ' + skipped.join(', '));
if (errors.length) console.log('PAGEERRORS:\n' + errors.join('\n'));
