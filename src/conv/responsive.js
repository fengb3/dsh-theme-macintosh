// src/conv/responsive.js —— 层3 模块10：响应式（结构档抽屉 + 密度两档）
// 规范源：prototype 笔记 §12（三档断点 + 坑表）；DSH 转译裁定（2026-09-03 recon 实测）：
//  - 结构档 ≤820（原型）→ **对齐宿主折叠断点 ≤1023**（实测 1024 展开/1000 收叠）：宿主
//    窄窗强制收轨卸树（.mc-sb-tree 全无），824~1023 是今天树不可达的尴尬带，一并治理。
//  - 抽屉 = 程序化展开官方侧栏（tclose 同通道：sidebarCollapseBtn 程序化 click + accToggle
//    五拍），展开态侧栏本就完整显示在左侧 = 挤占式抽屉。**不脱流不压轨**（v2 裁定：
//    fixed 化 sidebarCol 令 grid 自动放置把 centerCol 掉进 0px 首轨全盘错位，实测
//    2026-09-03）。只做层级：抽屉壳 60 > 遮罩 50 > 主列其余(auto)；窗框 76 盖遮罩
//    （汉堡常可点）。遮罩/壳提层全 CSS（:has 官方 data-sidebar-collapsed 稳定锚派生，
//    零 JS 状态）；JS 只管：汉堡注入（hero/main 两态窗框左端，observer 自愈）、开合
//    通道、Esc 让路规则。
//  - 硬切纪律：transform 无 transition（坑表 §12.3）；遮罩点阵幕语汇同 kit/hero，浅色反转。
//  - 密度两档照原型映射：≤640 flow padding 12 + 用户气泡满宽；≤480 dock padding 8 +
//    dlgNav 收 52px 图标列（官方 nav 文字裁切为已知限制，活体复验）。mode 钮/统计条中段
//    隐藏无 DSH 对应物，记因不做（官方没有的结构不强造，spec §2 硬前提）。
//  - safe-area-inset 不做（桌面 GUI 无刘海，YAGNI 记因）；原型 app 壳规则（desk 转 block/
//    主窗 height calc）不适用——宿主 grid 自管布局。
var MC_RESPONSIVE_CSS = (typeof MC_MAP === 'undefined' ? '' : [ // 守卫同 dock.js：单测 CJS 装载无 MC_MAP，纯函数仍可测
  // —— 汉堡：窗框左端方块（hero/main 两态共用 i-px-menu）；宽窗隐藏（rail 展开钮通道已可用）——
  '.mc-burger{display:none;flex:none;cursor:pointer}',
  '@media (min-width:1024px){.mc-burger{display:none!important}}',
  '@media (max-width:1023px){',
  '  .mc-hero-tb .mc-burger,.mc-main-tb .mc-burger{display:flex}',
  // 抽屉 = 官方展开态侧栏**原样挤占式在场**（它本来就在左侧完整显示；v2 裁定：不脱流、
  // 不压轨——fixed 化 sidebarCol 会令 grid 自动放置把 centerCol 掉进 0px 首轨,全盘错位,
  // 实测 2026-09-03）。只做层级提升：抽屉壳 60 > 遮罩 50 > 主列其余；窗框 76 恒可点。
  '  html:has(' + MC_MAP.appRootWide + ') ' + MC_MAP.sidebarShell + '{position:relative;z-index:60}',
  // 窗框盖遮罩（汉堡常可点 = 开合切换钮）
  '  html:has(' + MC_MAP.appRootWide + ') .mc-hero-tb,html:has(' + MC_MAP.appRootWide + ') .mc-main-tb{z-index:76}',
  // 遮罩显形（唯一显隐开关，零 JS 状态）
  '  html:has(' + MC_MAP.appRootWide + ') .mc-mask{display:block}',
  '}',
  // 遮罩：点阵幕语汇（同 kit/hero 幕）；z:50 压主列(auto)不压抽屉壳 60；浅色反转（遮罩三处反转纪律）
  '.mc-mask{position:fixed;inset:0;z-index:50;display:none;cursor:pointer;',
  '  background-color:var(--mc-bg);',
  '  background-image:radial-gradient(rgba(0,0,0,.55) 1px,transparent 1px);background-size:8px 8px}',
  'html[data-theme="light"] .mc-mask{',
  '  background-image:radial-gradient(rgba(255,255,255,.55) 1px,transparent 1px)}',
  // —— 密度两档（纯 CSS，零 JS）——
  '@media (max-width:640px){',
  '  ' + MC_MAP.flowScroll + '{padding:12px}',                       // 原型 §10 密度档 flow padding 12
  '  ' + MC_MAP.bubbleUser + '{max-width:100%}',                     // 用户气泡满宽（待活体：官方帽位在 userRow 时为无害空转）
  '}',
  '@media (max-width:480px){',
  '  [data-mc-dock]{padding:8px}',                                   // 原型 §10 极窄档 dock padding 8（dock 根即 [data-mc-dock] 本体,勘定 2026-09-03）
  '  ' + MC_MAP.dlgNav + '{width:52px!important;overflow:hidden!important}', // 设置 nav 收图标列（文字裁切=已知限制）
  '}',
].join('\n'));
// —— 纯函数（CJS 出口供单测；mount 消费，非装饰）——
// 开合动作裁定：官方折叠态为唯一真相源（frame[data-sidebar-collapsed]）
function mcDrawerAction(collapsed) { return collapsed ? 'expand' : 'collapse'; }
// 遮罩在场判定：窄窗且展开（宽窗桌面态/窄窗 rail 态都无遮罩）——与 :has CSS 同一语义的 JS 面
function mcDrawerMaskOn(narrow, collapsed) { return !!(narrow && !collapsed); }
// Esc 让路规则：官方弹层（模型菜单/命令 listbox 等）或设置面板在场时不抢 Esc
function mcDrawerEscAllowed(popOpen, dlgOpen) { return !popOpen && !dlgOpen; }
var McResponsive = {
  css: MC_RESPONSIVE_CSS,
  mount: function (ctx) {
    var dead = false;
    // —— 遮罩 DOM：一次性挂 body；显隐全 CSS（:has 门控），这里零状态 ——
    var mask = document.createElement('div');
    mask.className = 'mc-mask';
    mask.setAttribute('data-mc-resp-mask', '');
    document.body.appendChild(mask);
    // —— 汉堡注入：窗框（hero/main 两态）左端首子；observer 自愈（sidebar.js watch 同款）——
    function burgerHtml() { // innerHTML 全静态字面量（零动态插值，esc 纪律同 sidebar.js build）
      return '<svg aria-hidden="true"><use href="#i-px-menu"/></svg>';
    }
    function injectBurger() {
      if (dead) return;
      var tb = document.querySelector('.mc-main-tb') || document.querySelector('.mc-hero-tb');
      if (!tb) return;
      var old = tb.querySelector('.mc-burger');
      if (old && old.isConnected) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'mc-tbx mc-burger';
      b.setAttribute('aria-label', '打开或关闭导航');
      b.setAttribute('title', '导航');
      b.innerHTML = burgerHtml(); // 静态字面量
      b.addEventListener('click', onBurger);
      tb.insertBefore(b, tb.firstChild);
    }
    // —— 开合通道：tclose 同款（官方钮程序化 click；accToggle 五拍闪过场）——
    function collapsedNow() {
      try { return !!document.querySelector(MC_MAP.appRootRail); } catch (e) { return false; }
    }
    function narrowNow() {
      try { return window.matchMedia('(max-width:1023px)').matches; } catch (e) { return false; }
    }
    function toggleDrawer() {
      var btn = null;
      try { btn = document.querySelector(MC_MAP.sidebarCollapseBtn); } catch (e) {}
      if (!btn) return; // 官方锚漂移 → 汉堡 no-op 优雅降级（官方行为为准）
      var col = null;
      try { col = document.querySelector(MC_MAP.sidebar); } catch (e) {}
      if (col) accToggle(col, function () { btn.click(); });
      else btn.click();
    }
    function onBurger() {
      toggleDrawer(); // 动作由 mcDrawerAction(折叠态) 裁定：折叠→展开 / 展开→收起
    }
    function onMask() {
      if (!mcDrawerMaskOn(narrowNow(), collapsedNow())) return; // 显隐虽全 CSS，点击面再校验一次
      toggleDrawer(); // 遮罩只在展开态可见 → 必为收起
    }
    function onKey(e) { // Esc 收抽屉：窄窗 + 展开态 + 无官方弹层/设置面板（让路规则）
      try {
        if (e.key !== 'Escape' || dead) return;
        if (!narrowNow() || collapsedNow()) return;
        var popOpen = !!document.querySelector('[role=menu],[role=listbox]');
        var dlgOpen = !!(MC_MAP.dlgCard && document.querySelector(MC_MAP.dlgCard));
        if (!mcDrawerEscAllowed(popOpen, dlgOpen)) return;
        toggleDrawer();
      } catch (er) {}
    }
    mask.addEventListener('click', onMask);
    document.addEventListener('keydown', onKey, true);
    // 汉堡自愈观察：heroRoot 在场则域定观察（省全局拍），缺席退 body 观察（overlays heroObs 先例）
    var io = null;
    function armObserver() {
      var root = null;
      try { root = document.querySelector(MC_MAP.heroRoot); } catch (e) {}
      io = new MutationObserver(function () { injectBurger(); });
      io.observe(root && root.isConnected ? root : document.body, { childList: true, subtree: true });
    }
    armObserver();
    injectBurger(); // 首拍（active 态刷新直达）
    return function teardown() {
      dead = true;
      try { if (io) io.disconnect(); } catch (e) {}
      try { document.removeEventListener('keydown', onKey, true); } catch (e) {}
      try { mask.remove(); } catch (e) {}
      try { // 汉堡随窗框归属摘除（窗框本体归 overlays 管）
        var b = document.querySelector('.mc-burger');
        if (b) b.remove();
      } catch (e) {}
    };
  },
};
if (typeof module !== 'undefined') module.exports = { McResponsive: McResponsive, mcDrawerAction: mcDrawerAction, mcDrawerMaskOn: mcDrawerMaskOn, mcDrawerEscAllowed: mcDrawerEscAllowed };
