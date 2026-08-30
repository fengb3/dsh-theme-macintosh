/**
 * dsh-theme-macintosh — Macintosh 复古主题 browser half（常驻 loader 格式，零构建）。
 * 由 dist/client-body.js（动态版评审快照）装配：tokens/sprite/chrome/sidebar/kit 语义逐字保留，
 * 差异仅在持久化 —— inject:['slots','theme'] 真实服务直达、字体走宿主 /mcx-assets/ 静态路由、
 * theme.overrideTokens 以 'dsh-theme-macintosh' 常驻叠层（无动态 fiber 守卫）。
 * 重新生成：node tools/make-persistent-client.mjs
 */
window.__ModuleLoader__.load({
	id: "dsh-theme-macintosh",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const react = require("react");
		const React = react;
// src/core/tokens.js —— 层1：token alias + 最小 --mc-* 底色（深浅两套，值照《笔记》§4.1）
const McTokens = {
  css: `:root{
  --mc-bg:#2b2b2b; --mc-bg-deep:#1f1f1f;
  --mc-surface:#3d3d3d; --mc-surface-2:#4a4a4a; --mc-surface-3:#575757;
  --mc-fg:#f2f2f2; --mc-muted:#bdbdbd; --mc-faint:#949494;
  --mc-border:#e9e9e9; --mc-accent:#dadaff; --mc-accent-strong:#f2f2ff; --mc-accent-dim:rgba(218,218,255,.4); --mc-accent-ink:#1f1f2e;
  --mc-spark:#e8b64c; --mc-success:#7ed07e; --mc-danger:#ff7a74; --mc-danger-ink:#2b1211; --mc-warn:#e8b64c;
  --mc-sel-bg:rgba(218,218,255,.26); --mc-rail-1:#383838; --mc-rail-2:#414141;
  --mc-border-soft:rgba(233,233,233,.5);
  /* 画布噪点纹（8×8 PNG 瓦片，照 workspace §1；浅色刻意不覆盖，靠 --mc-bg 区分） */
  --mc-desktop-pattern:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAACXBIWXMAAAWJAAAFiQFtaJ36AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAA2SURBVHgB1Y+xDQAgDMNacURvykVZ+SprPitiYYIDmDxYsuQk2QBCUtyYtvslN0dVzV8LZ30Buytmvd+9eVsAAAAASUVORK5CYII=");
  /* titlebar close/zoom box 多色位（sprite 引用原型名 --box-line/--box-face，别名见下） */
  --mc-box-line:#9d9dcf; --mc-box-face:#31314f;
  /* 硬投影——原型 §4：深 .85 / 浅 .72（此前两处装反） */
  --mc-shadow-panel:3px 3px 0 0 rgba(0,0,0,.85);
  --mc-shadow-pop:3px 3px 0 0 rgba(0,0,0,.7);
  --mc-shadow-field:2px 2px 0 0 rgba(0,0,0,.35);
  /* 标题栏条纹 / 滚动条 */
  --mc-title-stripe:rgba(255,255,255,.26);
  --mc-scroll-track:#4a4a4a; --mc-scroll-box:#717171;
  /* 几何 */
  --mc-rail-w:264px; --mc-menubar-h:20px; --mc-titlebar-h:20px;
  --mc-r-window:5px; --mc-r-card:4px; --mc-r-btn:4px; --mc-r-tag:2px; --mc-bw:1px;
  /* 动效（全部 steps 硬切，无平滑插值） */
  --mc-t-fast:.18s; --mc-t-mid:.32s; --mc-ease:steps(2,end); --mc-ease-sweep:steps(6,end);
  /* sprite 多色位别名（McSprite.markup 沿用原型变量名） */
  --box-line:var(--mc-box-line); --box-face:var(--mc-box-face);
  --surface:var(--mc-surface); --surface-2:var(--mc-surface-2); --surface-3:var(--mc-surface-3);
  /* 五族回退链（照《笔记》§4.2；@font-face 由 assemble 时 base64 内联注入本 css 头部） */
  --font-display:'ChiKareGo','Pixelify Sans','Fusion Pixel 12px monospaced zh','Noto Sans SC',sans-serif;
  --font-ui:'ChiKareGo','Fusion Pixel 12px monospaced zh','Noto Sans SC',sans-serif;
  --font-mono:'FindersKeepers','Fusion Pixel 12px monospaced','Noto Sans SC',monospace;
  --font-code:'Fusion Pixel 12px monospaced','Fusion Pixel 12px monospaced zh','Noto Sans SC',monospace;
  --font-sb:'ChiKareGo Latin','Fusion Pixel 12px monospaced','Fusion Pixel 12px monospaced zh','Noto Sans SC',monospace;
}
html[data-theme="light"]{
  --mc-bg:#8f8f8f; --mc-surface:#fff; --mc-surface-2:#eee; --mc-surface-3:#ddd;
  --mc-fg:#0a0a0a; --mc-muted:#333; --mc-faint:#555; --mc-border:#0a0a0a;
  --mc-accent:#8f8fc0; --mc-sel-bg:#dadaff; --mc-warn:#8a6a1f;
  --mc-bg-deep:#ffffff; --mc-accent-strong:#75759f; --mc-accent-dim:rgba(143,143,192,.42); --mc-accent-ink:#ffffff;
  --mc-spark:#a8720e; --mc-success:#2e7d32; --mc-danger:#c23a34; --mc-danger-ink:#ffffff;
  --mc-border-soft:rgba(10,10,10,.5);
  --mc-box-line:#545487; --mc-box-face:#dadaff;
  --mc-shadow-panel:3px 3px 0 0 rgba(0,0,0,.72);
  --mc-shadow-pop:3px 3px 0 0 #000;
  --mc-shadow-field:2px 2px 0 0 rgba(0,0,0,.5);
  --mc-title-stripe:rgba(0,0,0,.5);
  --mc-scroll-track:#e0e0e0; --mc-scroll-box:#c0c0c0;
  /* --mc-desktop-pattern 刻意不覆盖：浅色沿用同一噪点瓦片，靠 --mc-bg 底色区分 */
  /* 侧栏 Finder 白窗：rail 系浅色覆盖（System 7 白窗黑线；rail-1 与 --mc-surface 同为 #fff，无冲突） */
  --mc-rail-1:#fff; --mc-rail-2:#eee;
}
/* 官方 token 别名（层1）：宿主 ui-theme 把 --dsw-alias-* 定义在 body（深色 body[data-ds-dark-theme]）。
   选择器用 html body 前缀抬高特异性（0-0-2 / 0-1-2），压过宿主 0-0-1 / 0-1-1 —— 宿主重连/重装
   主题样式表再追加到我们之后也无法反超。值全部经 var(--mc-*) 间接引用，月牙钮翻转 html[data-theme]
   时别名随 --mc-* 动态跟随。全局字体一并接到像素链（--dsw-font-family 是官方正文字体位）。 */
html body, html body[data-ds-dark-theme]{
  --dsw-alias-bg-base:var(--mc-bg); --dsw-alias-bg-layer-1:var(--mc-surface); --dsw-alias-bg-layer-2:var(--mc-surface-2);
  --dsw-alias-bg-overlay:var(--mc-surface-3); --dsw-alias-border-l1:var(--mc-border); --dsw-alias-border-l2:var(--mc-border);
  --dsw-alias-brand-primary:var(--mc-accent); --dsw-alias-label-primary:var(--mc-fg); --dsw-alias-label-secondary:var(--mc-muted);
  --dsw-alias-state-error-primary:var(--mc-danger); --dsw-alias-state-success-primary:var(--mc-success); --dsw-alias-state-warn-primary:var(--mc-warn);
  --dsw-specific-sidebar-fill:var(--mc-rail-1);
  --dsw-font-family:var(--font-ui);
}
/* mcfx 闪烁类（照原型 interactive §172-183 逐行）：flash = ::after 全覆盖遮罩（z-index:3）；
   ghost = 边框透明 + 子内容透明。使用方须同时挂 'mcfx' 类（flashIn/flashOut/accToggle 自动加）。 */
.mcfx{position:relative}
.mcfx::after{content:'';position:absolute;inset:0;pointer-events:none;opacity:0;z-index:3;
  background:#fff;
  background-image:repeating-linear-gradient(0deg,transparent 0 2px,rgba(0,0,0,.06) 2px 3px)}
.mcfx.mc-flash::after{opacity:1}
.mcfx.mc-ghost{border-color:transparent}
.mcfx.mc-ghost>*{opacity:0}
html[data-theme="light"] .mcfx::after{
  background:#000;
  background-image:repeating-linear-gradient(0deg,transparent 0 2px,rgba(255,255,255,.07) 2px 3px)}
/* ===== §4.1 补全：画布 / selection / focus / 滚动条 / 动画豁免 ===== */
body{background-color:var(--mc-bg);
  background-image:var(--mc-desktop-pattern);
  background-size:8px 8px;background-position:0 0}
::selection{background:var(--mc-accent);color:var(--mc-accent-ink)}
html[data-theme="light"] ::selection{background:var(--mc-sel-bg);color:var(--mc-fg)}
/* 焦点环 — 经典 Mac 虚线环（向外偏移 2px） */
:focus-visible{outline:1px dashed var(--mc-border);outline-offset:2px}
:focus:not(:focus-visible){outline:none}
/* 15px 经典滚动条：仅作用于真实滚动容器（选择器经 chrome.js 的 MC_MAP 注入；kit 自带）。
   DEFERRED: 四向 single-button 箭头 SVG 未移植（8 条 data-URI 与 border 色硬耦合），后续任务补 */
/* 动画豁免 — 全局压到 .01ms（闪烁是 class 切换不受影响） */
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;
    transition-duration:.01ms!important}
}
/* ===== §5.1 基础原语（mc- 前缀，避免与宿主 UI 类名冲突） ===== */
/* 双线按钮 — System 7 push button：外 1px 线 + 2px 面缝 + 内 1px 线（box-shadow 双内环） */
.mc-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;
  height:28px;padding:0 16px;min-width:72px;
  border-radius:var(--mc-r-btn);border:1px solid var(--mc-border);
  box-shadow:inset 0 0 0 1px var(--mc-surface),inset 0 0 0 2px var(--mc-border);
  background:var(--mc-surface-2);color:var(--mc-fg);
  font:600 13px/1 var(--font-display);letter-spacing:.04em;white-space:nowrap;cursor:pointer}
.mc-btn:active{ /* 经典按下 = 内外圈反色实底 */
  background:var(--mc-border);color:var(--mc-surface);
  box-shadow:inset 0 0 0 1px var(--mc-border),inset 0 0 0 2px var(--mc-surface)}
.mc-btn.primary{background:var(--mc-accent);color:var(--mc-accent-ink);
  box-shadow:inset 0 0 0 1px var(--mc-accent),inset 0 0 0 2px var(--mc-border)}
.mc-btn.primary:active{background:var(--mc-border);color:var(--mc-surface);
  box-shadow:inset 0 0 0 1px var(--mc-border),inset 0 0 0 2px var(--mc-surface)}
.mc-btn.danger{background:var(--mc-danger);color:var(--mc-danger-ink);
  box-shadow:inset 0 0 0 1px var(--mc-danger),inset 0 0 0 2px var(--mc-border)}
.mc-btn:disabled{opacity:.4;cursor:not-allowed;transform:none;
  box-shadow:inset 0 0 0 1px var(--mc-surface),inset 0 0 0 2px var(--mc-border)}
.mc-btn svg{width:14px;height:14px;flex:none}
/* 图标钮 — close/zoom box 语汇：26px 方块，无内环 */
.mc-icon-btn{display:grid;place-items:center;width:26px;height:26px;flex:none;
  border-radius:var(--mc-r-tag);border:1px solid var(--mc-border);
  background:var(--mc-surface-2);color:var(--mc-fg);cursor:pointer}
.mc-icon-btn:active{background:var(--mc-border);color:var(--mc-surface)}
.mc-icon-btn:disabled{opacity:.4;cursor:not-allowed}
.mc-icon-btn svg{width:13px;height:13px}
/* 状态胶囊 — 方角小标签 + 八角像素圆点 */
.mc-pill{display:inline-flex;align-items:center;gap:5px;height:20px;padding:0 8px;
  border-radius:var(--mc-r-tag);border:1px solid var(--mc-border-soft);
  font:600 11px/1 var(--font-display);letter-spacing:.05em;
  color:var(--mc-muted);background:var(--mc-surface)}
.mc-pill::before{content:'';width:6px;height:6px;flex:none;background:currentColor;
  clip-path:polygon(33% 0,67% 0,100% 33%,100% 67%,67% 100%,33% 100%,0 67%,0 33%)}
.mc-pill.run{color:var(--mc-spark)}
.mc-pill.done{color:var(--mc-success)}
.mc-pill.fail{color:var(--mc-danger)}
.mc-pill.wait{color:var(--mc-faint)}
.mc-pill.accent{color:var(--mc-accent)}
.mc-pill.run::before{animation:mc-pulse 2.6s steps(1,end) infinite;
  animation-delay:var(--pulse-delay,0ms)}
/* 输入框 — 直角 + 小一级硬投影 */
.mc-field{display:flex;align-items:center;gap:8px;width:100%;
  height:31px;padding:0 8px;background:var(--mc-surface);
  border:1px solid var(--mc-border);border-radius:0;
  box-shadow:var(--mc-shadow-field);
  color:var(--mc-fg);font:400 13px/1 var(--font-ui)}
.mc-field input{flex:1;background:transparent;border:none;outline:none;color:inherit;font:inherit}
.mc-field input::placeholder{color:var(--mc-faint)}
.mc-field input:disabled{opacity:.45}
.mc-field:focus-within{box-shadow:0 0 0 1px var(--mc-accent-dim)}
/* 折叠三角 — Finder outline triangle，open 旋 90° 硬切 */
.mc-tri{display:block;width:11px;height:11px;flex:none;color:var(--mc-fg);overflow:visible}
.mc-tri.open{transform:rotate(90deg)}
.mc-tri.dim{color:var(--mc-faint)}
/* keyframes — 三色硬切（亮灭各 1/6 周期，比例勿动）与条纹扫掠 */
@keyframes mc-pulse{
  0%,16%{background:var(--mc-spark)} 17%,33%{background:transparent}
  34%,50%{background:var(--mc-accent)} 51%,67%{background:transparent}
  68%,84%{background:var(--mc-success)} 85%,100%{background:transparent}}
@keyframes mc-sweep{from{background-position:0 0}to{background-position:12px 0}}`
};

// src/core/clock.js —— 层1：100ms 栅格帧时钟（值照《笔记》§1.1；一切延时必须走 CLOCK.next）
// 纯顶层声明，无模块系统语法；纯函数经 CJS 兼容出口供测试 createRequire 使用
// 注意：动态 client 闭包里 setInterval/clearInterval 标识符被 runner 的
// DYNAMIC_CLIENT_REDIRECTS 抛错陷阱遮蔽 —— 原生实现必须经 window.* 获取。
function computeNext(now, at, grid) {
  // at = 目标时刻（调用方传 now+ms）：量化到 ≥at 的最近栅格沿
  // CLOCK.next 侧即 Math.ceil((now+ms+1)/grid)*grid（控制器裁定公式）
  if (!grid) grid = 100;
  return Math.ceil((at + 1) / grid) * grid;
}
if (typeof module !== 'undefined' && module.exports) module.exports = { computeNext };

const mcG = (typeof window !== 'undefined' ? window : globalThis);
const mcNativeInterval = mcG.setInterval.bind(mcG);
const mcNativeClear = mcG.clearInterval.bind(mcG);

// CLOCK 惰性单例：mount(ctx) 时才创建并起 100ms 分发定时器
let CLOCK = null;

const McClock = {
  mount(ctx) {
    if (CLOCK) return CLOCK.dispose;

    let timer = null;
    let queue = []; // { fn, at } —— at 已量化到 100ms 栅格沿

    const clock = {
      PULSE: 2600, // mc-pulse 三色周期
      SWEEP: 1000, // mc-sweep 条纹扫掠周期
      // 量化延时：回调推迟到 ≥ms 后的最近栅格沿，与全局动画同轴
      next(fn, ms) {
        const job = { fn, at: computeNext(Date.now(), Date.now() + ms, 100) };
        queue.push(job);
        return () => { queue = queue.filter((j) => j !== job); };
      },
      // 负延迟注入：任意时刻挂上的 CSS 动画与全局相位同步
      syncAnim(el, period, prop) {
        if (period === undefined) period = clock.PULSE;
        if (!prop) prop = '--pulse-delay';
        el.style.setProperty(prop, -(Date.now() % period) + 'ms');
      },
      dispose() { teardown(); },
    };

    function teardown() {
      if (timer !== null) { mcNativeClear(timer); timer = null; }
      queue = [];
      CLOCK = null;
    }

    CLOCK = clock;
    timer = mcNativeInterval(() => {
      const t = Date.now();
      const due = [];
      queue = queue.filter((j) => (j.at <= t ? (due.push(j), false) : true));
      for (const j of due) { try { j.fn(); } catch (e) { /* 单回调失败不拖垮时钟 */ } }
    }, 100);

    return teardown;
  },
};

// src/core/mcfx.js —— 层2：闪烁三件套（ghost→flash→swap 三拍协议，照《笔记》§0.3/§5.3/§8.2）
// 纯顶层声明，无模块系统语法；与 clock.js 拼进同一作用域，直接引用 CLOCK，勿重复声明
// 纯函数/入口经 CJS 兼容出口供测试 createRequire 使用

// 拍调度器：默认走 CLOCK.next（100ms 栅格），测试可经 __setSchedulerForTest 注入假时钟
let mcfxSchedule = (fn, ms) => CLOCK.next(fn, ms);

function esc(s) {
  // & 必须最先，避免把后续实体里的 & 再转一次
  return String(s).replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 出场三拍：拍0 同步 ghost → 拍1 show()（DOM 插入/显形）+ 换 flash → 拍2 撤两类
function flashIn(el, show) {
  try {
    if (!el || !el.isConnected) return;
    el.classList.add('mcfx', 'mc-ghost');
    show(); // 拍0：内容在 ghost 遮罩下瞬换（原型 §910-912）
  } catch (e) { /* 单元素失败不拖垮调用方 */ }
  mcfxSchedule(() => {
    try {
      if (!el || !el.isConnected) return;
      el.classList.add('mc-flash');
    } catch (e) { /* 同上 */ }
    mcfxSchedule(() => {
      try {
        if (!el || !el.isConnected) return;
        el.classList.remove('mc-flash');
        el.classList.remove('mc-ghost');
      } catch (e) { /* 同上 */ }
    }, 100);
  }, 100);
}

// 退场镜像（原型 §919-927）：拍0 flash 白块 → 拍1 hide() + 撤类
function flashOut(el, hide) {
  try {
    if (!el || !el.isConnected) return;
    el.classList.add('mcfx', 'mc-flash');
  } catch (e) { /* 同上 */ }
  mcfxSchedule(() => {
    try {
      if (!el || !el.isConnected) return;
      hide();
      el.classList.remove('mc-flash');
      el.classList.remove('mc-ghost');
    } catch (e) { /* 同上 */ }
  }, 100);
}

// 折叠四拍：ghost → flash → 清残高 + fn()（类切换在此发生）→ 撤 flash+ghost
// dataset.busy 防重入；断连/异常路径也要清 busy，避免卡片永久卡死
function accToggle(card, fn) {
  try {
    if (!card || !card.isConnected) return;
    if (card.dataset.busy) return; // 防重入
    card.dataset.busy = '1';
    card.classList.add('mcfx', 'mc-ghost');
  } catch (e) { return; }
  const done = () => { try { delete card.dataset.busy; } catch (e) { /* 忽略 */ } };
  mcfxSchedule(() => {
    try {
      if (!card || !card.isConnected) { done(); return; }
      card.classList.remove('mc-ghost');
      card.classList.add('mc-flash');
    } catch (e) { done(); return; }
    mcfxSchedule(() => {
      try {
        if (!card || !card.isConnected) { done(); return; }
        card.style.height = ''; // 清展开动画残留的 inline 高度
        fn();
      } catch (e) { /* fn 抛错仍走完撤拍 */ }
      mcfxSchedule(() => {
        try {
          if (card && card.isConnected) {
            card.classList.remove('mc-flash');
            card.classList.remove('mc-ghost');
          }
        } catch (e) { /* 同上 */ }
        done();
      }, 100);
    }, 100);
  }, 100);
}

// 测试钩子：注入假调度器，返回原调度器便于还原
function __setSchedulerForTest(fn) {
  const prev = mcfxSchedule;
  mcfxSchedule = fn;
  return prev;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { esc, flashIn, flashOut, accToggle, __setSchedulerForTest };
}

// 装配模块句柄：mcfx 无需 mount，仅登记入口供后续层引用
const McMcfx = { esc, flashIn, flashOut, accToggle };

// src/core/sprite.js —— SVG 符号库（源：prototype FIGMA-ASSETS 区间，逐只照搬；Watch 取 assets 快照并剥 Inkpad 元数据）
// 多色位挂 var(--box-line/--box-face/--surface-3)，单色位 currentColor（原型即如此，未改动）
// 品牌件：Apple/Finder/HappyMac/Watch（viewBox 0 0 2000 2000 的大件保持原样）；气球原型未收录，后续任务再补
// 协议：顶层声明 McSprite；mount 在 apply 时把 <svg data-mc-sprite> 挂到 body 首位，返回 teardown
const McSprite = {
  markup: `
<symbol id="i-apple" viewBox="0 0 16 16">
    <path d="M11 1H9V2H8V4H9V5H7V4H4V5H3V6H13V5H12V4H9V3H10V2H11V1Z" fill="#00CD00"/>
    <rect x="2" y="6" width="9" height="2" fill="#FFFF00"/>
    <rect x="3" y="11" width="10" height="2" fill="#FF00B3"/>
    <path d="M4 13H12V14H11V15H9V14H7V15H5V14H4V13Z" fill="#0000E7"/>
    <rect x="2" y="10" width="11" height="1" fill="#E70000"/>
    <path d="M11 8H2V10H12V9H11V8Z" fill="#FF8700"/>
  </symbol>
  <symbol id="i-doc" viewBox="0 0 8 10"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 0H6V1H8V10H0V0ZM7 3H5V1H1V9H7V3Z" fill="currentColor"/><path d="M5 1H1V9H7V3H5V1Z" fill="var(--surface)"/></symbol>
  <symbol id="i-folder" viewBox="0 0 11 9"><path d="M5 1H1V8H10V2H5V1Z" fill="var(--surface)"/><path d="M1 0H5V1H1V0Z" fill="currentColor"/><path d="M1 1V8H10V2H5V1H11V9H0V1H1Z" fill="currentColor"/></symbol>
  <symbol id="i-suitcase" viewBox="0 0 12 10"><rect x="1" y="3" width="9" height="6" fill="var(--surface)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M8 0H4V1H1V2H0V10H11V9H12V1H8V0ZM10 3H1V9H10V3Z" fill="currentColor"/></symbol>
  <symbol id="i-finder" viewBox="0 0 11 13"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 2H2V7H9V2ZM8 3H3V6H8V3Z" fill="currentColor"/><path d="M10 0H1V1H0V10H1V1H10V10H11V1H10V0Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 10H1V13H10V10ZM9 11H2V12H9V11Z" fill="currentColor"/><rect x="5" y="8" width="4" height="1" fill="currentColor"/></symbol>
  <symbol id="i-check" viewBox="0 0 9 8"><path d="M9 0H8V1H7V2H6V3H5V4H4V5H3V6H2V5H1V4H0V6H1V7H2V8H3V7H4V6H5V5H6V4H7V3H8V2H9V0Z" fill="currentColor"/></symbol>
  <symbol id="i-rdo" viewBox="0 0 12 12"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 0H4V1H2V2H1V4H0V8H1V10H2V11H4V12H8V11H10V10H11V8H12V4H11V2H10V1H8V0ZM8 1V2H10V4H11V8H10V10H8V11H4V10H2V8H1V4H2V2H4V1H8Z" fill="currentColor"/></symbol>
  <symbol id="i-rdo-on" viewBox="0 0 12 12"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 0H4V1H2V2H1V4H0V8H1V10H2V11H4V12H8V11H10V10H11V8H12V4H11V2H10V1H8V0ZM8 1V2H10V4H11V8H10V10H8V11H4V10H2V8H1V4H2V2H4V1H8Z" fill="currentColor"/><path d="M8 3H4V4H3V8H4V9H8V8H9V4H8V3Z" fill="currentColor"/></symbol>
  <symbol id="i-chk" viewBox="0 0 12 12"><rect x="0.5" y="0.5" width="11" height="11" fill="none" stroke="currentColor"/></symbol>
  <symbol id="i-chk-on" viewBox="0 0 12 12"><rect x="0.5" y="0.5" width="11" height="11" fill="none" stroke="currentColor"/><path d="M1 1H2V2H1V1Z" fill="currentColor"/><path d="M3 3H2V2H3V3Z" fill="currentColor"/><path d="M4 4H3V3H4V4Z" fill="currentColor"/><path d="M5 5H4V4H5V5Z" fill="currentColor"/><path d="M7 5H5V7H4V8H3V9H2V10H1V11H2V10H3V9H4V8H5V7H7V8H8V9H9V10H10V11H11V10H10V9H9V8H8V7H7V5Z" fill="currentColor"/><path d="M8 4V5H7V4H8Z" fill="currentColor"/><path d="M9 3V4H8V3H9Z" fill="currentColor"/><path d="M10 2V3H9V2H10Z" fill="currentColor"/><path d="M10 2V1H11V2H10Z" fill="currentColor"/></symbol>
  <symbol id="i-close" viewBox="0 0 11 11"><rect x="2" y="2" width="7" height="7" fill="var(--surface-3)"/><path d="M11 0H0V11H1V1H11V0Z" fill="var(--box-line)"/><path d="M10 2H9V9H2V10H10V2Z" fill="var(--box-line)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11 1H1V11H11V1ZM10 2H2V10H10V2Z" fill="var(--box-face)"/></symbol>
  <symbol id="i-zoom" viewBox="0 0 11 11"><rect x="2" y="2" width="7" height="7" fill="var(--surface-3)"/><path d="M11 0H0V11H1V1H11V0Z" fill="var(--box-line)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11 1H1V11H11V1ZM2 10H10V2H2V10Z" fill="var(--box-face)"/><path d="M10 2H9V9H2V10H10V2Z" fill="var(--box-line)"/><rect x="6" y="2" width="1" height="5" fill="var(--box-line)"/><rect x="2" y="6" width="5" height="1" fill="var(--box-line)"/></symbol>
  <symbol id="i-tri" viewBox="0 0 6 11"><path d="M0 0H1V1H2V2H1V9H2V10H1V11H0V0Z" fill="currentColor"/><path d="M3 8H2V9H3V8Z" fill="currentColor"/><path d="M4 7V8H3V7H4Z" fill="currentColor"/><path d="M5 6V7H4V6H5Z" fill="currentColor"/><path d="M5 5H6V6H5V5Z" fill="currentColor"/><path d="M4 4H5V5H4V4Z" fill="currentColor"/><path d="M3 3H4V4H3V3Z" fill="currentColor"/><path d="M3 3V2H2V3H3Z" fill="currentColor"/></symbol>
  <symbol id="i-caretright" viewBox="0 0 6 11"><path d="M1 0H0V11H1V10H2V9H3V8H4V7H5V6H6V5H5V4H4V3H3V2H2V1H1V0Z" fill="currentColor"/></symbol>
  <symbol id="i-command" viewBox="0 0 9 9"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 0H1V1H0V3H1V4H3V5H1V6H0V8H1V9H3V8H4V6H5V8H6V9H8V8H9V6H8V5H6V4H8V3H9V1H8V0H6V1H5V3H4V1H3V0ZM6 1H8V3H6V1ZM8 6V8H6V6H8ZM3 8H1V6H3V8ZM3 1V3H1V1H3ZM4 4V5H5V4H4Z" fill="currentColor"/></symbol>
  <symbol id="i-sparkle" viewBox="0 0 9 9"><path d="M5 0H4V3H5V0Z" fill="currentColor"/><path d="M2 1H1V2H2V3H3V2H2V1Z" fill="currentColor"/><path d="M8 1H7V2H6V3H7V2H8V1Z" fill="currentColor"/><path d="M1 7H2V8H1V7Z" fill="currentColor"/><path d="M2 7H3V6H2V7Z" fill="currentColor"/><path d="M8 7H7V6H6V7H7V8H8V7Z" fill="currentColor"/><path d="M4 6H5V9H4V6Z" fill="currentColor"/><path d="M3 4H0V5H3V4Z" fill="currentColor"/><path d="M6 4H9V5H6V4Z" fill="currentColor"/></symbol>
  <symbol id="i-px-plus" viewBox="0 0 24 24"><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4z" fill="currentColor"/></symbol>
  <symbol id="i-px-search" viewBox="0 0 24 24"><path d="M6 2h8v2H6V2zM4 6V4h2v2H4zm0 8H2V6h2v8zm2 2H4v-2h2v2zm8 0v2H6v-2h8zm2-2h-2v2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm0-8h2v8h-2V6zm0 0V4h-2v2h2z" fill="currentColor"/></symbol>
  <symbol id="i-px-sliders" viewBox="0 0 24 24"><path d="M17 4h2v10h-2V4zm0 12h-2v2h2v2h2v-2h2v-2h-4zm-4-6h-2v10h2V10zm-8 2H3v2h2v6h2v-6h2v-2H5zm8-8h-2v2H9v2h6V6h-2V4zM5 4h2v6H5V4z" fill="currentColor"/></symbol>
  <symbol id="i-px-dots" viewBox="0 0 24 24"><path d="M1 9h6v6H1V9zm2 2v2h2v-2H3zm6-2h6v6H9V9zm2 2v2h2v-2h-2zm6-2h6v6h-6V9zm2 2v2h2v-2h-2z" fill="currentColor"/></symbol>
  <symbol id="i-px-clock" viewBox="0 0 24 24"><path d="M19 3H5v2H3v14h2v2h14v-2h2V5h-2V3zm0 2v14H5V5h14zm-8 2h2v6h4v2h-6V7z" fill="currentColor"/></symbol>
  <symbol id="i-px-timeline" viewBox="0 0 24 24"><path d="M7 7h4v4H7V7zm-2 6v-2h2v2H5zm0 0v4H1v-4h4zm8 0h-2v-2h2v2zm4 0h-4v4h4v-4zm2-2v2h-2v-2h2zm0 0h4V7h-4v4z" fill="currentColor"/></symbol>
  <symbol id="i-px-terminal" viewBox="0 0 24 24"><path d="M6 2h2v2H6V2Zm4 9h4v2h-4v-2Zm4 4h-4v2h4v-2Z" fill="currentColor"/><path d="M16 4h-2v2h-4V4H8v2H6v3H4V7H2v2h2v2h2v2H2v2h4v2H4v2H2v2h2v-2h2v3h12v-3h2v2h2v-2h-2v-2h-2v-2h4v-2h-4v-2h2V9h2V7h-2v2h-2V6h-2V4ZM8 20V8h8v12H8Zm8-16V2h2v2h-2Z" fill="currentColor"/></symbol>
  <symbol id="i-px-edit" viewBox="0 0 24 24"><path d="M18 2h-2v2h-2v2h-2v2h-2v2H8v2H6v2H4v2H2v6h6v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2V8h2V6h-2V4h-2V2zm0 8h-2v2h-2v2h-2v2h-2v2H8v-2H6v-2h2v-2h2V8h2V6h2v2h2v-2h2v2zM6 16H4v4h4v-2H6v-2z" fill="currentColor"/></symbol>
  <symbol id="i-px-lock" viewBox="0 0 24 24"><path d="M15 2H9v2H7v4H4v14h16V8h-3V4h-2V2zm0 2v4H9V4h6zm-6 6h9v10H6V10h3zm4 3h-2v4h2v-4z" fill="currentColor"/></symbol>
  <symbol id="i-px-eye" viewBox="0 0 24 24"><path d="M8 6h8v2H8V6zm-4 4V8h4v2H4zm-2 2v-2h2v2H2zm0 2v-2H0v2h2zm2 2H2v-2h2v2zm4 2H4v-2h4v2zm8 0v2H8v-2h8zm4-2v2h-4v-2h4zm2-2v2h-2v-2h2zm0-2h2v2h-2v-2zm-2-2h2v2h-2v-2zm0 0V8h-4v2h4zm-10 1h4v4h-4v-4z" fill="currentColor"/></symbol>
  <symbol id="i-px-zap" viewBox="0 0 24 24"><path d="M12 1h2v8h8v4h-2v-2h-8V5h-2V3h2V1zM8 7V5h2v2H8zM6 9V7h2v2H6zm-2 2V9h2v2H4zm10 8v2h-2v2h-2v-8H2v-4h2v2h8v6h2zm2-2v2h-2v-2h2zm2-2v2h-2v-2h2zm0 0h2v-2h-2v2z" fill="currentColor"/></symbol>
  <symbol id="i-px-chevd" viewBox="0 0 24 24"><path d="M7 8H5v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2V8h-2v2h-2v2h-2v2h-2v-2H9v-2H7V8z" fill="currentColor"/></symbol>
  <symbol id="i-px-copy" viewBox="0 0 24 24"><path d="M4 2h11v2H6v13H4V2zm4 4h12v16H8V6zm2 2v12h8V8h-8z" fill="currentColor"/></symbol>
  <symbol id="i-px-reload" viewBox="0 0 24 24"><path d="M16 2h-2v2h2v2H4v2H2v5h2V8h12v2h-2v2h2v-2h2V8h2V6h-2V4h-2V2zM6 20h2v2h2v-2H8v-2h12v-2h2v-5h-2v5H8v-2h2v-2H8v2H6v2H4v2h2v2z" fill="currentColor"/></symbol>
  <symbol id="i-px-trash" viewBox="0 0 24 24"><path d="M16 2v4h6v2h-2v14H4V8H2V6h6V2h8zm-2 2h-4v2h4V4zm0 4H6v12h12V8h-4zm-5 2h2v8H9v-8zm6 0h-2v8h2v-8z" fill="currentColor"/></symbol>
  <symbol id="i-px-attach" viewBox="0 0 24 24"><path d="M7 5v14H5V3h14v18H9V7h6v10h-2V9h-2v10h6V5H7z" fill="currentColor"/></symbol>
  <symbol id="i-moon" viewBox="0 0 24 24"><path d="M6 2h2v2H6V2zM4 4h4v2H4V4zM2 6h6v2H2V6zM2 8h6v2H2V8zM2 10h6v2H2v-2zM2 12h8v2H2v-2zM2 14h10v2H2v-2zM2 16h20v2H2v-2zM4 18h16v2H4v-2zM6 20h12v2H6v-2z" fill="currentColor"/></symbol>
  <symbol id="i-cl-HappyMac" viewBox="0 0 2000 2000">
    <g>
      <path d="M1550+300L1500+300L1500+250L450+250L450+300L400+300L400+1550L1550+1550" fill="#ffffff"/>
    </g>
    <g>
      <path d="M400+250L450+250L450+300L400+300L400+250Z" fill="#000000"/>
      <path d="M450+200L1500+200L1500+250L450+250L450+200Z" fill="#000000"/>
      <path d="M1500+250L1550+250L1550+300L1500+300L1500+250Z" fill="#000000"/>
      <path d="M1550+300L1600+300L1600+1550L1550+1550L1550+300Z" fill="#000000"/>
      <path d="M350+300L400+300L400+1550L350+1550L350+300Z" fill="#000000"/>
      <path d="M500+1350L600+1350L600+1400L500+1400L500+1350Z" fill="#000000"/>
      <path d="M1100+1300L1400+1300L1400+1350L1100+1350L1100+1300Z" fill="#000000"/>
      <path d="M550+350L1400+350L1400+400L550+400L550+350Z" fill="#000000"/>
      <path d="M1400+400L1450+400L1450+1050L1400+1050L1400+400Z" fill="#000000"/>
      <path d="M500+400L550+400L550+1050L500+1050L500+400Z" fill="#000000"/>
      <path d="M550+1050L1400+1050L1400+1100L550+1100L550+1050Z" fill="#000000"/>
      <path d="M750+550L800+550L800+650L750+650L750+550Z" fill="#000000"/>
      <path d="M1100+550L1150+550L1150+650L1100+650L1100+550Z" fill="#000000"/>
      <path d="M800+850L850+850L850+900L800+900L800+850Z" fill="#000000"/>
      <path d="M850+900L1050+900L1050+950L850+950L850+900Z" fill="#000000"/>
      <path d="M1050+850L1100+850L1100+900L1050+900L1050+850Z" fill="#000000"/>
      <path d="M400+1550L1550+1550L1550+1800L400+1800L400+1550Z" fill="#000000"/>
      <path d="M1000+550L950+550L950+750L900+750L900+800L1000+800" fill="#000000"/>
      <path d="M450+1600L1500+1600L1500+1750L450+1750L450+1600Z" fill="#ffffff"/>
    </g>
  </symbol>
  <symbol id="i-cl-Watch" viewBox="0 0 2000 2000">
  <g id="Fill">
  <path d="M850+800L850+850L800+850L800+1150L850+1150L850+1200L1150+1200L1150+1150L1200+1150L1200+850L1150+850L1150+800" opacity="1" fill="#ffffff"/>
  </g>
  <g id="Outline">
  <path d="M850+600L1150+600L1150+800L850+800L850+600Z" opacity="1" fill="#000000"/>
  <path d="M1150+800L1200+800L1200+850L1150+850L1150+800Z" opacity="1" fill="#000000"/>
  <path d="M800+800L850+800L850+850L800+850L800+800Z" opacity="1" fill="#000000"/>
  <path d="M750+850L800+850L800+1150L750+1150L750+850Z" opacity="1" fill="#000000"/>
  <path d="M800+1150L850+1150L850+1200L800+1200L800+1150Z" opacity="1" fill="#000000"/>
  <path d="M850+1200L1150+1200L1150+1400L850+1400L850+1200Z" opacity="1" fill="#000000"/>
  <path d="M1150+1150L1200+1150L1200+1200L1150+1200L1150+1150Z" opacity="1" fill="#000000"/>
  <path d="M1050+850L1000+850L1000+1000L900+1000L900+1050L1050+1050" opacity="1" fill="#000000"/>
  <path d="M1200+850L1250+850L1250+950L1300+950L1300+1050L1250+1050L1250+1150L1200+1150" opacity="1" fill="#000000"/>
  </g></symbol>
`,
  mount(ctx) {
    const wrap = document.createElement('div');
    wrap.innerHTML = '<svg data-mc-sprite xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">'
      + McSprite.markup + '</svg>';
    const el = wrap.firstElementChild;
    document.body.insertBefore(el, document.body.firstChild);
    return function teardown() { el.remove(); };
  },
};

// src/chrome/map.js —— 宿主选择器管制文件：全主题唯一允许出现宿主选择器的地方（Task 6 探针回填）
// 探针方法：直读 DSH 部署源（@deepseek-ai/dsh 0.1.1-rc.1，node_modules 包体），未跑 DOM 探针——
// 发布包 lib/client.js 即页面运行源（window.__ModuleLoader__ 工厂），源码即 DOM 真相。
// 优先级纪律：data-* > aria/role > 结构/class（后两者标 DRIFT-RISK）。
//
// 探针出处（均在 C:\Users\fohhy\AppData\Roaming\npm\node_modules\@deepseek-ai\dsh\node_modules\@deepseek-ai\）：
//  - dsh-web-frontend/dist/index.html —— React 挂载点 <body><div id="root">（唯一稳定 id）
//  - dsh-client-ui-layout/lib/client.js —— AppFrame：frame=grid[sidebar|center|details]+overlayLayer，
//    无任何 data-* 业务锚点，class 为 CSS-module 哈希（pI_x6G_frame/_centerCol/_sidebarCol，随构建变）
//  - dsh-client-ui-conversation/lib/client.js ——
//      ConversationRoot(L~7287)：根 div 带 data-phase(settling|hero|active)，含 header 席位 +
//      div[data-conversation-scroll](L7292) + composer 席（data-composer-seat）
//      ConversationSessionHeader(L~7343)：<header> 元素，无 data-*（titleRow/crumbs/tabs 均哈希 class）
//      InputBar(L~3997-4000)：卡片 div 带 data-composer-card
//  - dsh-client-ui-workspace/lib/client.js —— SessionNodeItem(L718-721)：
//      会话行 div role="treeitem" + aria-selected（选中=true）
//  - dsh-client-ui-sidebar/lib/client.js —— SidebarRoot：logoRow/brand 全哈希 class、aria-label 走 i18n（不可用）
// src/chrome/map.js —— 宿主选择器管制文件：全主题唯一允许出现宿主选择器的地方（Task 6 探针回填）
// 探针方法：直读 DSH 部署源（@deepseek-ai/dsh 0.1.1-rc.1，node_modules 包体），未跑 DOM 探针——
// 发布包 lib/client.js 即页面运行源（window.__ModuleLoader__ 工厂），源码即 DOM 真相。
// 优先级纪律：data-* > aria/role > 结构/class（后两者标 DRIFT-RISK）。
//
// 探针出处（均在 C:\Users\fohhy\AppData\Roaming\npm\node_modules\@deepseek-ai\dsh\node_modules\@deepseek-ai\）：
//  - dsh-web-frontend/dist/index.html —— React 挂载点 <body><div id="root">（唯一稳定 id）
//  - dsh-client-ui-layout/lib/client.js —— AppFrame：frame=grid[sidebar|center|details]+overlayLayer，
//    无任何 data-* 业务锚点，class 为 CSS-module 哈希（pI_x6G_frame/_centerCol/_sidebarCol，随构建变）
//  - dsh-client-ui-conversation/lib/client.js ——
//      ConversationRoot(L~7287)：根 div 带 data-phase(settling|hero|active)，含 header 席位 +
//      div[data-conversation-scroll](L7292) + composer 席（data-composer-seat）
//      ConversationSessionHeader(L~7343)：<header> 元素，无 data-*（titleRow/crumbs/tabs 均哈希 class）
//      InputBar(L~3997-4000)：卡片 div 带 data-composer-card
//  - dsh-client-ui-workspace/lib/client.js —— SessionNodeItem(L718-721)：
//      会话行 div role="treeitem" + aria-selected（选中=true）
//  - dsh-client-ui-sidebar/lib/client.js —— SidebarRoot：logoRow/brand 全哈希 class、aria-label 走 i18n（不可用）
const MC_MAP = {
  // appRoot = 三列 frame grid（AppFrame 根 div）。注意：#root 与 frame 之间隔着一层
  // display:contents 的透传包装 div（padding 打在它上面无效）——真 grid 是 #root > div > div。
  // 无 data-* → 结构位。display:contents 包装经 probe-dom 实测（2026-08-30）。
  appRoot: '#root > div > div', /* DRIFT-RISK: structural */
  // appRootRail = 折叠态的 frame（官方 AppFrame 折叠时挂 data-sidebar-collapsed 属性，
  // 稳定 data-* 锚；供折叠态专属样式/检测引用）
  appRootRail: '#root > div > div[data-sidebar-collapsed]', /* stable: official data-attr */
  // mainColumn = 会话根（header + 滚动口 + composer 都在其内，正好是"主窗"区域）
  mainColumn: 'div[data-phase]',
  // sessionHeader = ConversationSessionHeader 的 <header>；无 data-* → 会话根内结构位
  sessionHeader: 'div[data-phase] > header', /* DRIFT-RISK: structural */
  scrollport: '[data-conversation-scroll]',
  composerCard: '[data-composer-card]',
  // —— 以下供 Task 7 侧栏使用（Task 7 已对部署包复核，出处行号如下） ——
  // sidebar = 网格首列 sidebarCol。frame children 顺序：sidebarCol / centerCol / detailsCol /
  //   overlayLayer / handle（后两者 absolute）。注意选择器要越过 display:contents 包装层。
  //   复核：dsh-client-ui-layout/lib/client.js L218-232；probe-dom 实测（2026-08-30）。
  sidebar: '#root > div > div > div:first-child', /* DRIFT-RISK: structural */
  // sidebarBrand = 侧栏列内首个 button。复核：dsh-client-ui-sidebar/lib/client.js L156-201 ——
  //   logoRow 首子 = 品牌 button（L158-181，仅 wide 形态渲染）；rail 收起时首个 button 变为
  //   折叠钮（L185-200）。aria-label 走 i18n（L161/188）不可依赖。样式覆写宽态命中品牌、窄态命中折叠钮，可接受。
  sidebarBrand: '#root > div > div > div:first-child > div > div > div:nth-child(2) button', /* DRIFT-RISK: structural（+1 标题栏占位；收窄到 logoRow——宽版会误伤标题栏 tbox 的 13px 规格） */
  // sessionRow / sessionRowSelected。复核：dsh-client-ui-workspace/lib/client.js L718-721 ——
  //   SessionNodeItem 行 div role="treeitem" + aria-selected（selected 时 "true"），稳定语义锚点。
  sessionRow: 'div[role="treeitem"]',
  sessionRowSelected: 'div[role="treeitem"][aria-selected="true"]',
  // 会话树行细分（probe-tree 实测 2026-08-30）：工作区行带 aria-expanded（直系 svg = 文件夹 + 折叠箭头
  // [class*="arrow"] 哈希子串）；会话行无 expanded（首个直系 svg = 状态图标）。行内"操作/新建"按钮走 aria-label。
  sessionRowWorkspace: 'div[role="treeitem"][aria-expanded]', /* DRIFT-RISK: structural */
  sessionRowArrow: 'div[role="treeitem"][aria-expanded] > svg[class*="arrow"]', /* DRIFT-RISK: hashed-substring */
  sessionRowFolder: 'div[role="treeitem"][aria-expanded] > svg:first-of-type', /* DRIFT-RISK: structural */
  sessionStatusIcon: 'div[role="treeitem"]:not([aria-expanded]) > svg:first-of-type', /* DRIFT-RISK: structural */
  // —— 侧栏内部结构位（精修2：元素级 Finder 语汇）。经 probe-session 实测（2026-08-30）——
  //   sidebarCol > div(h0 包装) > .hHd-Xa_root，root 官方 children 恒序：
  //   [1]logoRow(DIV) [2]newSession(BUTTON) [3]regionArea(DIV 工作区树) [4]footArea(DIV)。
  //   我们在首位插入 .mc-titlebar 真标题栏（McSidebar.mount，自愈重插）→ 官方子元素整体后移一位，
  //   nth-child 序号 +1（titlebar 万一缺席则失配=回退官方样式，不破版）。
  //   全无 data-*，nth-child 结构位（DRIFT-RISK：随官方侧栏改版漂移，失配=回退底色不破版）。
  sidebarRoot: '#root > div > div > div:first-child > div > div', /* DRIFT-RISK: structural */
  sidebarLogoRow: '#root > div > div > div:first-child > div > div > div:nth-child(2)', /* DRIFT-RISK: structural (+1 标题栏占位) */
  sidebarNewSession: '#root > div > div > div:first-child > div > div > button:nth-child(3)', /* DRIFT-RISK: structural (+1 标题栏占位) */
  sidebarRegion: '#root > div > div > div:first-child > div > div > div:nth-child(4)', /* DRIFT-RISK: structural (+1 标题栏占位) */
  sidebarFoot: '#root > div > div > div:first-child > div > div > div:nth-child(5)', /* DRIFT-RISK: structural (+1 标题栏占位) */
  // 官方折叠钮 = logoRow 末钮（wide 态 logoRow=[品牌钮, 折叠钮]；collapsed 态只剩折叠钮=首=末）。
  // 注意 nth-child(2)：我们注入的 .mc-titlebar 占了第 1 位（官方子元素整体后移）。
  // 折叠机制（部署源探明 2026-08-30 + probe-round6-pre 实测）：钮 onClick → panels.sidebar=0 ↔ 280；
  // frame 内联 gridTemplateColumns 280px→56px（官方 300ms grid 过渡，我们以 transition-duration:0s 压平）；
  // frame 带 data-sidebar-collapsed 属性（稳定 data-* 锚 = 折叠态检测）；sidebarRoot 在 150ms settle 后
  // 加 collapsed 类并给 sidebar.workspaces 席位传 {wide:false, expandSidebar}（迷你形态的官方信号）。
  sidebarCollapseBtn: '#root > div > div > div:first-child > div > div > div:nth-child(2) button:last-child', /* DRIFT-RISK: structural */
  // 展开态/折叠态限定版（:not()/:attr 打在链中 frame 一级，不能前缀整串——否则造出嵌套 #root 的死选择器）：
  // *Wide 仅展开态命中（frame 无 data-sidebar-collapsed）；*Rail 仅折叠轨命中。
  sidebarLogoRowWide: '#root > div > div:not([data-sidebar-collapsed]) > div:first-child > div > div > div:nth-child(2)', /* DRIFT-RISK: structural */
  sidebarNewSessionWide: '#root > div > div:not([data-sidebar-collapsed]) > div:first-child > div > div > button:nth-child(3)', /* DRIFT-RISK: structural */
  sidebarCollapseBtnWide: '#root > div > div:not([data-sidebar-collapsed]) > div:first-child > div > div > div:nth-child(2) button:last-child', /* DRIFT-RISK: structural */
  sidebarNewSessionRail: '#root > div > div[data-sidebar-collapsed] > div:first-child > div > div > button:nth-child(3)', /* DRIFT-RISK: structural */
  sidebarFootRail: '#root > div > div[data-sidebar-collapsed] > div:first-child > div > div > div:nth-child(5)', /* DRIFT-RISK: structural */
  sidebarLogoRowRail: '#root > div > div[data-sidebar-collapsed] > div:first-child > div > div > div:nth-child(2)', /* DRIFT-RISK: structural */
};


// src/chrome/chrome.js —— chrome 染色 + 桌面画布
// src/chrome/chrome.js —— chrome 染色 + 桌面画布
// 协议：{ css, mount(ctx) }。RULING：桌面画布走 mount（body 首元素 data-mc-desk，z-index:-1），
// 不占 shell.overlay 席（该席 z-index:20 在 React 树内、叠在内容之上，只适合 kit 检视页那种浮层）。
// 纪律：选择器字符串一律来自 map.js 的 MC_MAP（本文件只做插值）；无 :hover、无 transition。
// —— 标题栏 close/zoom 像素方块（pixelarticons close.svg/zoom.svg，24 栅格）——
// ::before 背景图用不了 sprite 多色位，fill 走固定深浅两组色：深色 #1f1f2e / 浅色 #ffffff。
// bg() 组装完整 background 声明：左 close（5px）右 zoom（right 5px），13px 见方，pinstripe 底。
const MC_TBOX_CLOSE_DARK = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%231f1f2e' d='M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z'/%3E%3C/svg%3E";
const MC_TBOX_ZOOM_DARK = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%231f1f2e' d='M11 5h2v2h2v2h2V7h-2V5h-2V3h-2v2zM9 7V5h2v2H9zm0 0v2H7V7h2zm-5 6h16v-2H4v2zm9 6h-2v-2H9v-2H7v2h2v2h2v2h2v-2zm2-2h-2v2h2v-2zm0 0h2v-2h-2v2z'/%3E%3C/svg%3E";
const MC_TBOX_CLOSE_LIGHT = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ffffff' d='M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z'/%3E%3C/svg%3E";
const MC_TBOX_ZOOM_LIGHT = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ffffff' d='M11 5h2v2h2v2h2V7h-2V5h-2V3h-2v2zM9 7V5h2v2H9zm0 0v2H7V7h2zm-5 6h16v-2H4v2zm9 6h-2v-2H9v-2H7v2h2v2h2v2h2v-2zm2-2h-2v2h2v-2zm0 0h2v-2h-2v2z'/%3E%3C/svg%3E";
const MC_TBOX = {
  closeDark: MC_TBOX_CLOSE_DARK, zoomDark: MC_TBOX_ZOOM_DARK,
  closeLight: MC_TBOX_CLOSE_LIGHT, zoomLight: MC_TBOX_ZOOM_LIGHT,
  bg: function (close, zoom, stripe) {
    return 'url("data:image/svg+xml,' + close + '") 5px center/13px 13px no-repeat'
      + ',url("data:image/svg+xml,' + zoom + '") right 5px center/13px 13px no-repeat'
      + ',repeating-linear-gradient(180deg,' + stripe + ' 0 1px,transparent 1px 3px),var(--mc-surface-2)';
  },
};
const McChrome = {
  css: [
    // frame 底色让位 + 桌面缝隙容器化：AppFrame 根自带实底 background（不清掉会盖住桌面噪点）。
    // 缝隙做在 grid 容器上（padding 四周 12px + 列间 gap 12px）——官方 grid 行高固定 100vh，
    // 给列加 margin 只会溢出屏幕（实测 bottom=914>900），容器 padding 才能真正收进视口。
    `${MC_MAP.appRoot}{background:transparent;box-sizing:border-box;padding:12px;gap:12px}`,
    // 主列 = 会话窗（.win 语汇）：surface 底 + 1px 边 + 3px 硬投影；桌面两大窗 = 直角（原型 .desk > .win）。
    // 刻意不收 overflow —— 宿主自管滚动（centerCol overflow:hidden + data-conversation-scroll）
    `${MC_MAP.mainColumn}{background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:0;box-shadow:var(--mc-shadow-panel)}`,
    // 会话头部条 = 装饰 titlebar（pinstripe 条纹面 + 顶缘 accent 高亮线，原型 §3 .titlebar 语汇；
    // close/zoom 方块与交互属三期结构级，此处只做 CSS 染色）。浅色条纹加深、深色条纹提亮。
    `${MC_MAP.sessionHeader}{background:repeating-linear-gradient(180deg,rgba(255,255,255,.10) 0 1px,transparent 1px 3px),var(--mc-surface-2);border-bottom:1px solid var(--mc-border);box-shadow:inset 0 1px 0 var(--mc-accent)}`,
    `html[data-theme="light"] ${MC_MAP.sessionHeader}{background:repeating-linear-gradient(180deg,rgba(0,0,0,.20) 0 1px,transparent 1px 3px),var(--mc-surface-2)}`,
    // hero/inert 阶段官方无 header —— 主窗补同款装饰 titlebar（标题 DeepSeek Harness；
    // active 阶段由真 header 吃 pinstripe 规则，不叠加）。::before 作首 flex 子，条纹+方块同侧栏。
    `div[data-phase="hero"]::before,div[data-phase="inert"]::before{content:'DeepSeek Harness';` +
      `display:flex;align-items:center;justify-content:center;flex:none;` +
      `height:20px;font:600 12px/1 var(--font-sb);letter-spacing:.03em;color:var(--mc-fg);` +
      `background:${MC_TBOX.bg(MC_TBOX.closeDark, MC_TBOX.zoomDark, 'rgba(255,255,255,.10)')};` +
      `border-bottom:1px solid var(--mc-border);box-shadow:inset 0 1px 0 var(--mc-accent)}`,
    `html[data-theme="light"] div[data-phase="hero"]::before,html[data-theme="light"] div[data-phase="inert"]::before{background:` +
      MC_TBOX.bg(MC_TBOX.closeLight, MC_TBOX.zoomLight, 'rgba(0,0,0,.20)') + '}',
    // 滚动口：最小干预 —— 只给深一档底色（窗内"文档区"），滚动条走 tokens 已有的全局 15px 经典款
    `${MC_MAP.scrollport}{background:var(--mc-bg-deep)}`,
    // composer 卡：surface 底 + 1px 边 + 小一级硬投影（方角，.mc-field 语汇）
    `${MC_MAP.composerCard}{background:var(--mc-surface);border:1px solid var(--mc-border);box-shadow:var(--mc-shadow-field);border-radius:0}`,
    // 15px 经典滚动条：只染会话滚动口（宿主侧栏刻意隐藏滚动条，勿全局强推）
    `${MC_MAP.scrollport}{scrollbar-width:thin;scrollbar-color:var(--mc-scroll-box) var(--mc-scroll-track)}`,
    `${MC_MAP.scrollport}::-webkit-scrollbar{width:15px;height:15px}`,
    `${MC_MAP.scrollport}::-webkit-scrollbar-track{background:var(--mc-scroll-track);border-left:1px solid var(--mc-border)}`,
    `${MC_MAP.scrollport}::-webkit-scrollbar-thumb{background:var(--mc-scroll-box);border:1px solid var(--mc-border)}`,
    `${MC_MAP.scrollport}::-webkit-scrollbar-corner{background:var(--mc-scroll-track)}`,
  ].join('\n'),
  // 桌面画布：fixed 全视口、置于内容之下（z-index:-1）、不接指针；噪点瓦片 8×8 平铺于 --mc-bg 之上。
  // body 自身也带同款底（tokens 已设），本 div 是画布的显式承载（data-mc-desk），二者视觉一致、互为冗余。
  mount(ctx) {
    const desk = document.createElement('div');
    desk.setAttribute('data-mc-desk', '');
    desk.setAttribute('aria-hidden', 'true');
    desk.style.cssText = 'position:fixed;inset:0;z-index:-1;pointer-events:none;'
      + 'background-color:var(--mc-bg);background-image:var(--mc-desktop-pattern);'
      + 'background-size:8px 8px;background-repeat:repeat;background-position:0 0';
    document.body.insertBefore(desk, document.body.firstChild); // sprite svg 之后也无妨（都无几何影响）
    return function teardown() { desk.remove(); };
  },
};


// src/chrome/sidebar.js —— 侧栏 Finder 窗覆写 + 真 DOM 标题栏 + 折叠迷你态 + 官方主题通道（Task 7 + 轮6）
// 协议：{ css, mount(ctx), slots(ctx) }。样式参考 prototype/component-dev-notes.md §7（侧栏 Finder 窗）。
// 纪律：宿主选择器一律取自 MC_MAP（本文件只做插值）；无 :hover、无 transition（官方的也压平）；
// 席位注册沿用 kit.js 在 Task 5 运行期验证过的 register(meta, render) 形态。
// 轮6 改造：
//   ① ::before 假标题栏 → mount 注入真 DOM .mc-titlebar（左 tclose=折叠/展开，点官方隐藏钮保状态持久化）；
//   ② 官方折叠/展开过渡（frame 300ms grid + 根 150ms fade/rail-in）全压 0，过场靠 flashIn 白闪；
//   ③ 去月牙钮：主题改走官方通道 body[data-ds-dark-theme] → html[data-theme]（初始同步 + observer 跟随）。
const McSidebar = {
  css: [
    // 侧栏列 = Finder 窗（.win 语汇完整版）：rail-1 底 + 四边 1px 黑边 + 3px 硬投影 + 直角。
    // 桌面缝隙由容器 padding/gap 提供（四边 12px，与主窗同浮在噪点桌面上）。整窗字体 --font-sb（§7.1）
    `${MC_MAP.sidebar}{background:var(--mc-rail-1);border:1px solid var(--mc-border);border-radius:0;box-shadow:var(--mc-shadow-panel);font-family:var(--font-sb)}`,
    // 官方侧栏根自带 padding:6px 12px —— 清零，窗内内容顶格（行级间距由各自行自带）
    `${MC_MAP.sidebarRoot}{padding:0}`,
    // —— 官方过渡压平（纪律：无 transition，官方的也压掉）：frame 的 grid-template-columns 300ms
    //    滑轨与 sidebarRoot 内 fading/railIn 淡入滑入全归零 —— 折叠/展开宽度瞬切，过场全靠
    //    tclose 的 flashIn 白闪遮罩。appRoot 带 ID 特异性必胜官方哈希类。animation:none 只打
    //    直接子元素/logoRow 钮（官方动画宿主），不殃及 McFinder 深处的 mc-pulse 脉冲点。 ——
    `${MC_MAP.appRoot}{transition-duration:0s}`,
    `${MC_MAP.sidebarRoot}>*,${MC_MAP.sidebarLogoRow} button{transition-duration:0s;animation:none}`,
    // 品牌行：字号 17px（finder 图标 24px 经 sidebar.brand.mark 席位注入，见 slots）；
    // 名称经 sidebar.brand.name 席位注入 "Deepseek + Harness" 反色标签（原型 sb-head §4）
    // :not([data-mc-finder]) —— 该 ID 级选择器命中侧栏列内一切 button（含 McFinder 自有钮），
    // 加排除避免 24px 强压 Finder 树图标；官方品牌钮无该属性，规则照常兜底。
    `${MC_MAP.sidebarBrand}:not([data-mc-finder]){font:400 17px/1 var(--font-sb);color:var(--mc-fg)}`,
    `${MC_MAP.sidebarBrand}:not([data-mc-finder]) svg{width:24px;height:24px;flex:none}`,
    '.mc-sb-name{display:inline-flex;align-items:center;min-width:0}',
    '.mc-sb-brand{font:700 17px/1.2 var(--font-sb);letter-spacing:.02em;color:var(--mc-fg)}',
    '.mc-sb-tag{font:600 14px/1.2 var(--font-sb);background:var(--mc-fg);color:var(--mc-rail-1);padding:1px 5px;margin-left:5px;flex:none}',
    // 会话树图标统一 15px（原型 group-head svg 15px；行内小钮 12px 走 18px 容器）
    `${MC_MAP.sessionRow} svg{width:15px;height:15px;flex:none}`,
    // —— 会话树像素图标（15px 起步：24 栅格像素画在 12px 下退化为细线，15px 才读得出像素块）——
    `${MC_MAP.sessionRowWorkspace} svg *{visibility:hidden}`,
    `${MC_MAP.sessionStatusIcon} *{visibility:hidden}`,
    `${MC_MAP.sessionRowWorkspace} svg,${MC_MAP.sessionStatusIcon}{background:currentColor}`,
    // 文件夹（工作区行首图标）
    `${MC_MAP.sessionRowFolder}{` +
      `-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M4%204h8v2h10v14H2V4h2zm16%204H10V6H4v12h16V8z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat;` +
      `mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M4%204h8v2h10v14H2V4h2zm16%204H10V6H4v12h16V8z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat}`,
    // 折叠箭头 → 像素 chev-down
    `${MC_MAP.sessionRowArrow}{` +
      `-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M7%208H5v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2V8h-2v2h-2v2h-2v2h-2v-2H9v-2H7V8z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat;` +
      `mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M7%208H5v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2V8h-2v2h-2v2h-2v2h-2v-2H9v-2H7V8z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat}`,
    // 会话行状态图标 → 像素 doc（通用占位；气泡/垃圾桶等异形后续按需映射）
    `${MC_MAP.sessionStatusIcon}{` +
      `-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M3%2022h18V8h-2V6h-2v2h-2V6h2V4h-2V2H3v20zm2-2V4h8v6h6v10H5z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat;` +
      `mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M3%2022h18V8h-2V6h-2v2h-2V6h2V4h-2V2H3v20zm2-2V4h8v6h6v10H5z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat}`,
    // 工作区行内"新建会话"加号 → 像素 plus
    `${MC_MAP.sidebarRegion} button[aria-label$="中新建会话"] svg{` +
      `-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M11%204h2v7h7v2h-7v7h-2v-7H4v-2h7V4z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat;` +
      `mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M11%204h2v7h7v2h-7v7h-2v-7H4v-2h7V4z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat}`,
    // 会话行：26px 细长条、单行 ellipsis、13px --font-sb、左缩进 20px（§7.2 行序）
    `${MC_MAP.sessionRow}{height:26px;display:flex;align-items:center;padding-left:20px;` +
      `overflow:hidden;white-space:nowrap;text-overflow:ellipsis;` +
      `font:400 13px/26px var(--font-sb);color:var(--mc-fg);border-radius:0}`,
    `${MC_MAP.sessionRow} *{flex-shrink:0}`,
    // 选中（aria-selected 语义）：整行反色 + 方角（§7.2 —— 漏 border-radius:0 会出"胶囊"破形）
    `${MC_MAP.sessionRowSelected}{background:var(--mc-fg);color:var(--mc-surface);border-radius:0}`,
    `${MC_MAP.sessionRowSelected} *{color:inherit}`,
    // —— 真 DOM 标题栏（mount 注入 .mc-titlebar 为 sidebarRoot 首子；pinstripe 样式自旧 ::before 迁移）——
    // 20px 条纹面 + 居中 "Sessions" 标题 + 顶缘 accent 线 + 左右 13px 方块钮（sprite #i-close/#i-zoom，
    // 多色位 var(--box-line/--box-face) 随 html[data-theme] 自动反色，无需 data-URI 双份）。
    '.mc-titlebar{position:relative;display:flex;align-items:center;justify-content:center;' +
      'height:20px;flex:none;font:600 12px/1 var(--font-sb);letter-spacing:.03em;color:var(--mc-fg);' +
      'background:repeating-linear-gradient(180deg,rgba(255,255,255,.10) 0 1px,transparent 1px 3px),var(--mc-surface-2);' +
      'border-bottom:1px solid var(--mc-border);box-shadow:inset 0 1px 0 var(--mc-accent)}',
    'html[data-theme="light"] .mc-titlebar{background:' +
      'repeating-linear-gradient(180deg,rgba(0,0,0,.20) 0 1px,transparent 1px 3px),var(--mc-surface-2)}',
    '.mc-title{max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.mc-tbox{position:absolute;top:50%;transform:translateY(-50%);width:13px;height:13px;' +
      'display:grid;place-items:center;padding:0;border:none;background:none;cursor:pointer}',
    '.mc-tclose{left:5px}',
    '.mc-tzoom{right:5px}',
    '.mc-tbox svg{width:13px;height:13px;display:block}',
    '.mc-tbox:active svg{opacity:.55}',
    // 折叠态标题栏整体隐藏（原型 .rail-mini .titlebar{display:none}）——展开入口 = 官方 rail
    // 首钮（渲染我们的 Finder mark），tclose 在轨内不重复占位
    `${MC_MAP.appRootRail} .mc-titlebar{display:none}`,
    // 折叠态页脚：原型 .rail-mini .sb-foot —— 纵排居中（设置图标钮单列）
    `${MC_MAP.sidebarFootRail}{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:8px;padding:8px 0}`,
    // 折叠态品牌行：原型 .rail-mini .sb-head{justify-content:center} —— Finder 图标在 56px 轨内水平居中
    `${MC_MAP.sidebarLogoRowRail}{justify-content:center}`,
    // 官方折叠钮：展开态隐藏（折叠/展开动作由 tclose 程序化触发，保官方行为与持久化）；
    // 折叠态保留官方钮 = rail 首钮（渲染我们的品牌 mark），作展开的双保险入口
    `${MC_MAP.sidebarCollapseBtnWide}{display:none}`,
    // 品牌行 sb-head：padding + 软底线（logoRow 官方 60px 定高放开为内容高）——仅展开态
    // （折叠态 logoRow 36px 官方轨：官方折叠钮独占，padding/底线交给官方 rail 布局）
    `${MC_MAP.sidebarLogoRowWide}{height:auto;min-height:0;padding:10px 12px 8px;background:var(--mc-rail-1);border-bottom:1px solid var(--mc-border-soft)}`,
    // New Session 钮 = .btn.primary 双内环语汇（§5）——仅展开态（折叠态官方图标钮隐藏，
    // 新建走 McFinderMini 的迷你加号钮，程序化点同一个官方钮保行为）
    `${MC_MAP.sidebarNewSessionWide}{display:flex;align-items:center;justify-content:center;gap:7px;` +
      `width:calc(100% - 20px);height:28px;margin:8px 10px;padding:0 16px;min-width:72px;` +
      `border-radius:var(--mc-r-btn);border:1px solid var(--mc-border);` +
      `box-shadow:inset 0 0 0 1px var(--mc-accent),inset 0 0 0 2px var(--mc-border);` +
      `background:var(--mc-accent);color:var(--mc-accent-ink);` +
      `font:600 13px/1 var(--font-sb);letter-spacing:.04em;cursor:pointer}`,
    `${MC_MAP.sidebarNewSession} svg{width:14px;height:14px;flex:none}`,
    // New Session 图标换像素风：官方轮廓 path 藏起，svg 元素本体以 currentColor + 像素加号 mask 重绘
    //（pixelarticons plus 24 栅格；mask 只吃 alpha，随主题 accent-ink 自动反色）
    `${MC_MAP.sidebarNewSession} svg *{visibility:hidden}`,
    `${MC_MAP.sidebarNewSession} svg{background:currentColor;` +
      `-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M11%204h2v7h7v2h-7v7h-2v-7H4v-2h7V4z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat;` +
      `mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M11%204h2v7h7v2h-7v7h-2v-7H4v-2h7V4z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat}`,
    `${MC_MAP.sidebarNewSession}:active{background:var(--mc-border);color:var(--mc-surface);` +
      `box-shadow:inset 0 0 0 1px var(--mc-border),inset 0 0 0 2px var(--mc-surface)}`,
    `${MC_MAP.sidebarNewSessionRail}{display:none}`,
    // 工作区树容器 sb-tree：随根 padding 清零，内衬也清零（用户要求侧栏完全无 padding）
    `${MC_MAP.sidebarRegion}{padding:0;min-width:0;overflow:hidden;width:auto;align-self:stretch;margin:0}`,
    // —— 像素图标替换（pixelarticons 24 栅格）：官方细轮廓 path 藏起，svg 本体 currentColor + 像素 mask 重绘 ——
    // 锚点 aria-label 为 zh i18n 文案（DRIFT-RISK：随语言/官方文案漂移，失配=回退官方轮廓图标，不破版）
    // :not([data-mc-finder]) —— McFinder 遮蔽成功时本区内容是自有组件（按钮带 data-mc-finder），
    // 降级规则只打官方 DOM；遮蔽失败时官方按钮无该属性，规则照常兜底。
    `${MC_MAP.sidebarRegion} button:not([data-mc-finder]) svg *{visibility:hidden}`,
    `${MC_MAP.sidebarRegion} button:not([data-mc-finder]) svg{background:currentColor}`,
    `${MC_MAP.sidebarRegion} button:not([data-mc-finder])[aria-label="搜索会话"] svg{` +
      `-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6%202h8v2H6V2zM4%206V4h2v2H4zm0%208H2V6h2v8zm2%202H4v-2h2v2zm8%200v2H6v-2h8zm2-2h-2v2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm0-8h2v8h-2V6zm0%200V4h-2v2h2z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat;` +
      `mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6%202h8v2H6V2zM4%206V4h2v2H4zm0%208H2V6h2v8zm2%202H4v-2h2v2zm8%200v2H6v-2h8zm2-2h-2v2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm0-8h2v8h-2V6zm0%200V4h-2v2h2z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat}`,
    `${MC_MAP.sidebarRegion} button:not([data-mc-finder])[aria-label="视图选项"] svg{` +
      `-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M17%204h2v10h-2V4zm0%2012h-2v2h2v2h2v-2h2v-2h-4zm-4-6h-2v10h2V10zm-8%202H3v2h2v6h2v-6h2v-2H5zm8-8h-2v2H9v2h6V6h-2V4zM5%204h2v6H5V4z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat;` +
      `mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M17%204h2v10h-2V4zm0%2012h-2v2h2v2h2v-2h2v-2h-4zm-4-6h-2v10h2V10zm-8%202H3v2h2v6h2v-6h2v-2H5zm8-8h-2v2H9v2h6V6h-2V4zM5%204h2v6H5V4z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat}`,
    `${MC_MAP.sidebarRegion} button:not([data-mc-finder])[aria-label="添加工作区"] svg{` +
      `-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M11%204h2v7h7v2h-7v7h-2v-7H4v-2h7V4z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat;` +
      `mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M11%204h2v7h7v2h-7v7h-2v-7H4v-2h7V4z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat}`,
    `${MC_MAP.sidebarRegion} button:not([data-mc-finder])[aria-label$="的操作"] svg{` +
      `-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M1%209h6v6H1V9zm2%202v2h2v-2H3zm6-2h6v6H9V9zm2%202v2h2v-2h-2zm6-2h6v6h-6V9zm2%202v2h2v-2h-2z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat;` +
      `mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M1%209h6v6H1V9zm2%202v2h2v-2H3zm6-2h6v6H9V9zm2%202v2h2v-2h-2zm6-2h6v6h-6V9zm2%202v2h2v-2h-2z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat}`,
    // 页脚 sb-foot：rail-2 面 + 顶线（§4）
    `${MC_MAP.sidebarFoot}{background:var(--mc-rail-2);border-top:1px solid var(--mc-border-soft)}`,
    // 页脚设置行 = 原型 sb-pref 纯文字钮（"Preferences…"语汇）：藏官方齿轮轮廓图标，文字 600 12px
    `${MC_MAP.sidebarFoot} button:not([aria-label]) svg{display:none}`,
    `${MC_MAP.sidebarFoot} button:not([aria-label]){font:600 12px/1.4 var(--font-sb);letter-spacing:.02em;color:var(--mc-fg)}`,
    // 折叠轨页脚：设置钮是纯图标钮（无文字位），把上面藏 svg 的规则在轨内翻回来
    `${MC_MAP.sidebarFootRail} button:not([aria-label]) svg{display:block}`,
    // 品牌行侧栏折叠钮 → 像素 menu（首钮是品牌 Finder，只掩 last-child）——仅展开态
    // （展开态官方折叠钮本就 display:none，此规则是隐藏失败的兜底；折叠态留给官方 rail 布局）
    `${MC_MAP.sidebarCollapseBtnWide} svg *{visibility:hidden}`,
    `${MC_MAP.sidebarCollapseBtnWide} svg{background:currentColor;` +
      `-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M4%206h16v2H4V6zm0%205h16v2H4v-2zm16%205H4v2h16v-2z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat;` +
      `mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M4%206h16v2H4V6zm0%205h16v2H4v-2zm16%205H4v2h16v-2z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat}`,
  ].join('\n'),

  // mount：①主题走官方通道（初始同步 + observer 跟随）②真 DOM 标题栏注入（自愈重插）。
  // 全部副作用可逆：teardown 断开 observer、移除标题栏 DOM、移除我们拥有的 html[data-theme]。
  mount() {
    const disposers = [];

    // —— 官方外观信号：ui-layout ThemePresenter 按解析快照 toggle body[data-ds-dark-theme]
    //    （部署源 dsh-client-ui-theme/lib/index.js L36，随官方设置→外观切换实时变化）。
    //    html[data-theme] 全程由本主题拥有：初始按信号同步，MutationObserver 跟随后续翻转；
    //    overrideTokens 双色对全指向 var(--mc-*)，html[data-theme] 走对了整套主题即正确跟随。 ——
    const syncTheme = function () {
      try {
        const dark = document.body.hasAttribute('data-ds-dark-theme');
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      } catch (e) { /* body 缺席（理论不可达）静默 */ }
    };
    syncTheme();
    const themeObs = new MutationObserver(syncTheme);
    themeObs.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });
    disposers.push(function () { themeObs.disconnect(); });

    // —— 真 DOM 标题栏：.mc-titlebar 插为 sidebarRoot 首子（React 容器内外来节点，
    //    MutationObserver 监听 childList 自愈重插；sidebarRoot 晚于 apply 出现时经
    //    CLOCK 100ms 栅格轮询定位，上限 ~10s）。tclose = 折叠/展开：flashIn 白闪包裹
    //    官方隐藏钮的程序化 click（保官方行为与状态持久化）。 ——
    let stopped = false;
    let bar = null;
    let heal = null;
    let cancelPoll = null;
    let tries = 0;
    const onTclose = function () {
      const btn = document.querySelector(MC_MAP.sidebarCollapseBtn);
      if (!btn) return;
      const col = document.querySelector(MC_MAP.sidebar);
      // 折叠/展开过场：ghost 下瞬切宽度 → 白闪 → 撤（官方 300ms/150ms 过渡已压 0）
      if (col) flashIn(col, function () { btn.click(); });
      else btn.click();
    };
    const build = function () {
      const el = document.createElement('div');
      el.className = 'mc-titlebar';
      // innerHTML 全静态字面量（零动态插值，不违反 esc 纪律）；方块钮走 sprite 多色位
      el.innerHTML = '<span class="mc-title">Sessions</span>' +
        '<button type="button" class="mc-tbox mc-tclose" aria-label="折叠或展开侧栏" title="折叠或展开侧栏">' +
        '<svg aria-hidden="true"><use href="#i-close"/></svg></button>' +
        '<button type="button" class="mc-tbox mc-tzoom" aria-label="缩放（二期）" title="二期" tabindex="-1">' +
        '<svg aria-hidden="true"><use href="#i-zoom"/></svg></button>';
      el.querySelector('.mc-tclose').addEventListener('click', onTclose);
      return el;
    };
    const watch = function (root) {
      heal = new MutationObserver(function () {
        if (stopped || !bar || bar.isConnected) return;
        if (root && root.isConnected) root.insertBefore(bar, root.firstChild);
      });
      heal.observe(root, { childList: true });
    };
    const find = function () {
      if (stopped) return;
      if (tries++ > 100) return; // ~10s 上限：侧栏始终未出现即放弃（静默，不抛错）
      const root = document.querySelector(MC_MAP.sidebarRoot);
      if (!root) { cancelPoll = CLOCK ? CLOCK.next(find, 100) : null; return; }
      bar = build();
      root.insertBefore(bar, root.firstChild);
      watch(root);
    };
    find();

    disposers.push(function () {
      stopped = true;
      try { if (cancelPoll) cancelPoll(); } catch (e) { /* 忽略 */ }
      try { if (heal) heal.disconnect(); } catch (e) { /* 忽略 */ }
      try { if (bar) bar.remove(); } catch (e) { /* 忽略 */ }
    });

    return function teardown() {
      for (const d of disposers) { try { d(); } catch (e) { /* 忽略 */ } }
      try { document.documentElement.removeAttribute('data-theme'); } catch (e) { /* 忽略 */ }
    };
  },

  slots(ctx) {
    // 可选读取 'slots' 服务（ctx.get 是守卫允许的路径；勿用 ctx.slot 属性访问、勿声明 inject）
    const S = ctx.slots; // 常驻插件：inject 已声明，直达
    if (!S || typeof S.register !== 'function' || typeof S.inject !== 'function') return;
    const reg = S.register.bind(S);
    const wait = S.inject.bind(S);
    // 品牌图标：Finder 24px 换掉宿主 FishLogo。single 槽必须以更低 priority 遮蔽注册
    // （官方占位 priority 0，lowest renders —— 同 0 会抛 "already has a registration"）。
    // 展开态品牌行与折叠轨 railMark 渲染同一席位：两处都是 Finder 标。
    ctx.effect(() => wait('sidebar.brand.mark', () => reg({
      name: 'sidebar.brand.mark',
      priority: -1,
      label: () => 'Finder',
    }, function FinderMark() {
      if (typeof React === 'undefined') return null;
      // 显式给色：不依赖宿主按钮的继承色，防止图标透明/隐形
      return React.createElement('svg', {
        width: 24, height: 24, 'aria-hidden': true,
        style: { color: 'var(--mc-fg)', display: 'block' },
      }, React.createElement('use', { href: '#i-finder' }));
    })));
    // 品牌名：sb-head 语汇 —— "Deepseek" 17px 粗体 + "Harness" 反色小标签（原型 §4 sb-name）。
    // single 槽同样以 priority:-1 遮蔽官方 wordmark。
    ctx.effect(() => wait('sidebar.brand.name', () => reg({
      name: 'sidebar.brand.name',
      priority: -1,
      label: () => 'Deepseek Harness',
    }, function BrandName() {
      if (typeof React === 'undefined') return null;
      return React.createElement('span', { className: 'mc-sb-name' },
        React.createElement('span', { className: 'mc-sb-brand' }, 'Deepseek'),
        React.createElement('span', { className: 'mc-sb-tag' }, 'Harness'));
    })));
  },
};

// src/finder.js —— 侧栏内容区重绘：遮蔽 sidebar.workspaces 席位，Finder 树接官方真实数据
// 协议：{ css, slots(ctx) }。样式全部 .mc- 自有类（宿主选择器零出现，audit §5 安全）；
// 无 :hover、无 transition，按压只 :active；一切延时走 CLOCK（经 mcfx 的 flashIn，100ms 栅格）。
// 数据：官方经席位 props 传入 useSessions/useWorkspaces（aurum AuBrowserWide 同款消费，
// 先例 dsh-theme-aurum/client.js L2285-2383）；缺钩子时降级假数据。
// 动作：点击行经 ctx.sessions.open(sessionId) 打开会话（aurum auActions.open 同款）。

// —— 降级假数据（props 钩子缺席时；结构：工作区 → 会话；status: run|done|wait；xtra 超 5 折叠）——
const MC_FINDER_DATA = [
  { id: 'ws-mac', name: 'dsh-theme-macintosh', sessions: [
    { id: 'mc-1', title: '侧栏骨架：遮蔽席位渲染', status: 'done' },
    { id: 'mc-2', title: '标题栏像素方块升级', status: 'run' },
    { id: 'mc-3', title: 'mcfx 闪烁接入会话行', status: 'done' },
    { id: 'mc-4', title: '镜像同步与 audit 走查', status: 'wait' },
    { id: 'mc-5', title: 'Playwright 截图留证', status: 'done' },
    { id: 'mc-6', title: '浅色主题对比度核对', status: 'wait', xtra: true },
  ] },
  { id: 'ws-aurum', name: 'dsh-theme-aurum', sessions: [
    { id: 'au-1', title: '金 token 色板对比度复核', status: 'done' },
    { id: 'au-2', title: '工具卡边框像素化', status: 'wait' },
  ] },
  { id: 'ws-algae', name: 'algae', sessions: [
    { id: 'al-1', title: '简历因子拆解与重写', status: 'wait' },
    { id: 'al-2', title: '周报要点摘取', status: 'done' },
    { id: 'al-3', title: '会议纪要归档', status: 'wait' },
  ] },
];
const MC_FINDER_SEL0 = 'mc-1'; // 初始选中行（假数据内 1 条）

// —— 官方数据推导（aurum auWsLabel/auTitle/auVisible/auByRecency 同款）——
// 实测字段（aurum 消费佐证 + client-runtime store 定义）：
//   sessions 快照 { current, ids, byId }；session: id/displayTitle/blank/origin/
//     running(bool)/pendingInteraction/completed(bool)/updatedAt
//   workspaces 快照 { items:[{ workspaceId, title, path, sessionIds }], archivedSessionIds }
function mcWsLabel(w) {
  if (!w) return '未分组';
  if (w.title && typeof w.title === 'string' && w.title !== '') return w.title;
  const cwd = typeof w.path === 'string' ? w.path : '';
  if (cwd === '') return '未分组';
  const base = cwd.replace(/[/\\]+$/, '').split(/[/\\]/).pop();
  return base && base !== '' ? base : cwd;
}
function mcTitle(s) { return s.blank ? '新会话' : (s.displayTitle || '未命名会话'); }
function mcVisible(s, current, archived) {
  return s.origin !== 'subagent' && !archived.has(s.id) && (!s.blank || s.id === current);
}
// 状态映射：running→run(脉冲点)；completed 且非当前→done(✓)；其余（含 pendingInteraction 等待）→wait
function mcSessStatus(s, current) {
  if (s.running === true) return 'run';
  if (s.completed === true && s.id !== current) return 'done';
  return 'wait';
}
// 快照 → 分组列表（结构与假数据同形：id/name/path/sessions[{id,title,status,xtra}]）
// 会话保持官方 sessionIds 手动序；每组前 5 条外标 xtra（sb-more 折叠语义）
function mcFinderGroups(list, wsState) {
  const archived = new Set((wsState && wsState.archivedSessionIds) || []);
  const workspaces = (wsState && wsState.items) || [];
  const current = list.current;
  const norm = function (s, xtra) {
    return { id: s.id, title: mcTitle(s), status: mcSessStatus(s, current), xtra: xtra };
  };
  const groups = [];
  const accounted = new Set();
  for (let i = 0; i < workspaces.length; i++) {
    const w = workspaces[i];
    const members = [];
    const ids = w.sessionIds || [];
    for (let j = 0; j < ids.length; j++) {
      const s = list.byId[ids[j]];
      if (s === undefined) continue;
      accounted.add(ids[j]);
      if (!mcVisible(s, current, archived)) continue;
      members.push(norm(s, members.length >= 5));
    }
    groups.push({ id: w.workspaceId, name: mcWsLabel(w), path: w.path || '', sessions: members });
  }
  const stray = (list.ids || []).filter(function (id) {
    const s = list.byId[id];
    return s !== undefined && !accounted.has(id) && mcVisible(s, current, archived);
  }).map(function (id, i) { return norm(list.byId[id], i >= 5); });
  if (stray.length > 0) groups.push({ id: '__ungrouped__', name: '未分组', path: '', sessions: stray });
  return groups;
}

// 滚动区标题栏：左「工作区」标签 + 紧邻右侧三个 18px 小钮（搜索/视图选项/添加）——
// 按钮跟标签走（flex:none），不顶到侧栏右缘（原型 §4 .sb-listbar 语汇）。
// 搜索钮：本地标题过滤（输入暂用 window.prompt 顶替，TODO 二期内嵌输入行）；
// 视图选项/添加：no-op（title 注明二期）。
function McFinderListbar(props) {
  const h = React.createElement;
  const btn = function (title, icon, onClick) {
    const p = { className: 'mc-gh-btn', type: 'button', title: title, 'aria-label': title, 'data-mc-finder': '' };
    if (onClick) p.onClick = onClick;
    return h('button', p, h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: icon })));
  };
  const onSearch = function () {
    // TODO(二期)：内嵌搜索输入行（aurum au-ws-search 同款）；暂用系统 prompt 顶替
    if (typeof window === 'undefined' || typeof window.prompt !== 'function') return;
    const v = window.prompt('搜索会话（按标题过滤，留空清除）', '');
    if (v === null) return;
    props.onQuery(v);
  };
  return h('div', { className: 'mc-sb-listbar' },
    h('span', { className: 'mc-sb-lb' }, '工作区'),
    h('span', { className: 'mc-sb-la' },
      btn('搜索会话', '#i-px-search', onSearch),
      btn('视图选项（二期）', '#i-px-sliders'),
      btn('添加新工作区（二期）', '#i-px-plus')));
}

// —— 折叠态迷你条（原型 .sb-mini）：官方 sidebar.workspaces 席位在折叠轨（wide:false）时的形态。
// 只渲染一列 26px 图标钮：新建（程序化点官方 newSession 钮保行为/状态持久化）+ 搜索（展开侧栏后过滤）。
// 搜索词经模块级 MC_FINDER_QUERY + 自定义事件 mcx-finder-query 传给展开态 McFinderTree
// （折叠/展开是组件形态切换=remount，state 不跨形态存活）。 ——
let MC_FINDER_QUERY = '';

function McFinderMini(props) {
  const h = React.createElement;
  const expand = typeof props.expandSidebar === 'function' ? props.expandSidebar : null;
  const onNew = function () {
    const btn = document.querySelector(MC_MAP.sidebarNewSession);
    if (btn) { btn.click(); return; } // 官方新建钮（折叠态被我们 CSS 隐藏，click 仍生效）
    if (expand) expand();
  };
  const onSearch = function () {
    if (expand) expand(); // 先展开侧栏再搜（轨内放不下输入行）
    if (typeof window === 'undefined' || typeof window.prompt !== 'function') return;
    const v = window.prompt('搜索会话（按标题过滤，留空清除）', MC_FINDER_QUERY);
    if (v === null) return;
    MC_FINDER_QUERY = v;
    try { window.dispatchEvent(new CustomEvent('mcx-finder-query', { detail: v })); } catch (e) { /* 忽略 */ }
  };
  const btn = function (cls, title, icon, onClick) {
    return h('button', { className: cls, type: 'button', title: title, 'aria-label': title, 'data-mc-finder': '', onClick: onClick },
      h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: icon })));
  };
  return h('div', { className: 'mc-sb-mini' },
    btn('mc-mini-btn mc-mini-new', '新建会话', '#i-px-plus', onNew),
    btn('mc-mini-btn', '添加工作区（二期）', '#i-folder'),
    btn('mc-mini-btn', '搜索会话', '#i-px-search', onSearch));
}

// 会话行：状态槽（run=脉冲点 / done=✓ / wait=空占位）+ 标题 + 三点菜单钮。
// 选中行 .on 整行反色方角；onClick 走 flashIn 三拍（ghost→show→白闪→撤，100ms×2 走 CLOCK）。
function McFinderSess(props) {
  const h = React.createElement;
  const s = props.sess;
  const on = props.selected;
  const cls = 'mc-sess' + (on ? ' on' : '') + (s.status === 'run' ? ' run' : '') + (s.xtra ? ' xtra' : '');
  const pick = function (e) {
    const row = e.currentTarget; // 事件对象即刻取 DOM（不依赖事件池生命周期）
    flashIn(row, function () { props.onPick(s.id); }); // 选中态切换包进闪烁中拍
  };
  let slot = null;
  if (s.status === 'run') slot = h('i', { className: 'mc-s-dot' });
  else if (s.status === 'done') slot = h('svg', { className: 'mc-s-ok', 'aria-hidden': true }, h('use', { href: '#i-check' }));
  return h('div', { className: cls, role: 'button', tabIndex: 0, onClick: pick, title: s.title, 'aria-selected': on ? 'true' : 'false' },
    h('span', { className: 'mc-s-tt' }, esc(s.title)),
    h('span', { className: 'mc-s-slot' }, slot),
    h('button', {
      className: 'mc-s-menu', type: 'button', title: '会话菜单', 'aria-label': '会话菜单', 'data-mc-finder': '',
      onClick: function (e) { e.stopPropagation(); }, // 菜单钮不触发行选中
    }, h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-dots' }))));
}

// 工作区分组：group-head（折叠三角 i-tri + 文件夹 i-folder + 名称 + 计数 + dots/plus 小钮）+
// group-body（会话行 + 超 5 条的「展开其余 N 个会话」钮）。折叠开合同走 flashIn 过场。
function McFinderGroup(props) {
  const h = React.createElement;
  const g = props.group;
  const open = !!props.open;
  const expanded = !!props.expanded;
  const xtraCount = g.sessions.filter(function (s) { return s.xtra; }).length;
  const toggle = function (e) {
    const grp = e.currentTarget.closest('.mc-group');
    flashIn(grp, function () { props.onToggle(g.id); });
  };
  const ghBtn = function (title, icon) {
    return h('button', { className: 'mc-gh-btn', type: 'button', title: title, 'aria-label': title, 'data-mc-finder': '' },
      h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: icon })));
  };
  return h('div', { className: 'mc-group' + (expanded ? ' expanded' : '') },
    h('div', { className: 'mc-group-head' },
      h('button', { className: 'mc-gh-main', type: 'button', onClick: toggle, 'aria-expanded': open, 'data-mc-finder': '' },
        h('svg', { className: open ? 'mc-tri open' : 'mc-tri', 'aria-hidden': true }, h('use', { href: '#i-tri' })),
        h('svg', { 'aria-hidden': true }, h('use', { href: '#i-folder' })),
        h('span', { className: 'mc-g-name' }, esc(g.name)),
        h('span', { className: 'mc-g-count' }, esc(String(g.sessions.length)))),
      h('span', { className: 'mc-gh-act' },
        ghBtn('工作区菜单', '#i-px-dots'),
        ghBtn('新建会话', '#i-px-plus'))),
    h('div', { className: 'mc-group-body' + (open ? ' open' : '') },
      g.sessions.map(function (s) {
        return h(McFinderSess, { key: s.id, sess: s, selected: props.selected === s.id, onPick: props.onPick });
      }),
      xtraCount > 0 && !expanded ? h('button', {
        className: 'mc-sb-more', type: 'button', 'data-mc-finder': '',
        onClick: function (e) {
          const row = e.currentTarget;
          flashIn(row, function () { props.onExpand(g.id); });
        },
      },
        h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-chevd' })),
        esc('展开其余 ' + xtraCount + ' 个会话')) : null));
}

// Finder 树根：消费官方 props.useSessions/useWorkspaces 推导分组（缺钩子降级假数据）。
// 选中：真数据以 list.current 为准（官方权威）；假数据走本地 state。
// 本地 state 另管：分组开合 / 余量展开 / 搜索过滤词。
// 快照变更（ids/状态指纹变化）触发重渲染时，对 sb-tree 容器做一次 flashOut→flashIn 轻闪过场。
function McFinderTree(props) {
  const h = React.createElement;
  const live = typeof props.useSessions === 'function' && typeof props.useWorkspaces === 'function';
  const list = live ? props.useSessions(function (s) { return s; }) : null;
  const wsState = live ? props.useWorkspaces(function (s) { return s; }) : null;
  const openSession = typeof props.openSession === 'function' ? props.openSession : null;
  const groups = live && list && wsState ? mcFinderGroups(list, wsState) : MC_FINDER_DATA;
  const current = live ? (list ? list.current : null) : null;
  const selState = React.useState(MC_FINDER_SEL0);
  const sel = live ? current : selState[0];
  const openState = React.useState(null); // null = 默认全开；记录开合覆盖 {gid:bool}
  const expState = React.useState({});
  const qState = React.useState(MC_FINDER_QUERY); // 迷你态搜索词跨形态接力（惰性初值）
  const q = qState[0].trim().toLowerCase();
  const root = React.useRef(null);
  React.useEffect(function () {
    // 负延迟注入：多 run 点同屏不交错（CLOCK 惰性单例在 McClock.mount 后必在）
    if (CLOCK && root.current) {
      const dots = root.current.querySelectorAll('.mc-sess.run .mc-s-dot');
      for (let i = 0; i < dots.length; i++) CLOCK.syncAnim(dots[i]);
    }
  });
  // 数据变更轻闪：useSessions/useWorkspaces 快照变化 → 分组指纹变化 → flashOut→flashIn 过场。
  // 首次挂载只记指纹不闪（宁轻勿炸；McMcfx 内部 isConnected 校验兜底重渲染换节点）
  const sig = groups.map(function (g) {
    return g.id + ':' + g.sessions.map(function (s) { return s.id + '/' + s.status; }).join(',');
  }).join('|');
  const prevSig = React.useRef(null);
  React.useEffect(function () {
    if (prevSig.current === null) { prevSig.current = sig; return; }
    if (prevSig.current === sig) return;
    prevSig.current = sig;
    const tree = root.current && root.current.querySelector
      ? root.current.querySelector('.mc-sb-tree') : null;
    if (tree) flashOut(tree, function () { flashIn(tree, function () {}); });
  }, [sig]);
  // 迷你态搜索接力：折叠轨里 prompt 的结果经 mcx-finder-query 事件送达（展开完成后应用过滤词）
  React.useEffect(function () {
    const onQ = function (e) { qState[1](String((e && e.detail) || '')); };
    window.addEventListener('mcx-finder-query', onQ);
    return function () { window.removeEventListener('mcx-finder-query', onQ); };
  }, []);
  const onToggle = function (gid) {
    openState[1](function (o) { const n = Object.assign({}, o || {}); n[gid] = !(o ? o[gid] : true); return n; });
  };
  const onExpand = function (gid) {
    expState[1](function (m) { const n = Object.assign({}, m); n[gid] = true; return n; });
  };
  const onPick = function (sid) {
    if (openSession) openSession(sid); // 官方打开会话；current 随快照切换，选中行自跟上
    if (!live) selState[1](sid); // 假数据降级：本地选中
  };
  // 搜索过滤：命中标题（或分组名）的会话保留；过滤态不折叠 xtra（全量展示匹配行）
  const shown = q === '' ? groups : groups.map(function (g) {
    const gMatch = g.name.toLowerCase().indexOf(q) !== -1;
    const hit = g.sessions.filter(function (s) {
      return gMatch || s.title.toLowerCase().indexOf(q) !== -1;
    }).map(function (s) { return Object.assign({}, s, { xtra: false }); });
    return Object.assign({}, g, { sessions: hit });
  }).filter(function (g) { return g.sessions.length > 0; });
  return h('div', { className: 'mc-sb-find', ref: root },
    h(McFinderListbar, { onQuery: qState[1] }),
    h('nav', { className: 'mc-sb-tree' },
      shown.map(function (g) {
        return h(McFinderGroup, {
          key: g.id, group: g,
          open: q !== '' ? true : (openState[0] === null ? true : !!openState[0][g.id]),
          expanded: !!expState[0][g.id] || q !== '',
          selected: sel, onToggle: onToggle, onExpand: onExpand, onPick: onPick,
        });
      })));
}

const McFinder = {
  css: `/* ===== 侧栏 Finder 树（McFinder 重绘区；原型 §4 .sb-listbar/.sb-tree/.group/.sess/.sb-more 移植，全 .mc- 自有类）===== */
.mc-sb-find{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden;background:var(--mc-rail-1)}
.mc-sb-listbar{display:flex;align-items:center;gap:4px;flex:none;
  padding:4px 6px 4px 10px;border-bottom:1px solid var(--mc-border-soft)}
.mc-sb-lb{font:600 11px/1.4 var(--font-sb);letter-spacing:.05em;color:var(--mc-faint)}
.mc-sb-la{display:flex;align-items:center;gap:2px;flex:none}
.mc-sb-tree{flex:1;overflow-y:auto;min-height:0;padding:8px}
.mc-group + .mc-group{margin-top:6px}
.mc-group-head{display:flex;align-items:center;gap:2px;width:100%;
  padding:4px 4px 4px 0;background:none;border:none;text-align:left}
.mc-gh-main{display:flex;align-items:center;gap:5px;flex:1;min-width:0;
  padding:0;background:none;border:none;cursor:pointer;text-align:left}
/* 图标尺寸加 .mc-sb-find 前缀抬特异性：压过官方区域级 button svg 规则（哈希类 0-2-1） */
.mc-sb-find .mc-group-head svg{width:15px;height:15px;flex:none;color:var(--mc-fg)}
.mc-gh-act{display:flex;align-items:center;gap:2px;flex:none}
.mc-gh-btn{display:grid;place-items:center;width:18px;height:18px;flex:none;
  background:none;border:none;cursor:pointer;color:var(--mc-faint);border-radius:var(--mc-r-tag)}
.mc-gh-btn:active{color:var(--mc-fg)}
.mc-sb-find .mc-gh-btn svg{width:12px;height:12px}
.mc-g-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font:400 15px/1.25 var(--font-sb);letter-spacing:.02em;color:var(--mc-fg)}
.mc-g-count{font:500 10px/1.3 var(--font-mono);color:var(--mc-faint)}
.mc-group-body{overflow:hidden;height:auto}
.mc-group-body:not(.open){height:0}
.mc-sess{display:flex;align-items:center;gap:6px;width:100%;box-sizing:border-box;
  padding:3px 4px 3px 5px;margin-top:2px;background:none;border:none;cursor:pointer;text-align:left;
  border-radius:var(--mc-r-tag)}
.mc-s-tt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font:400 13px/1.5 var(--font-sb);color:var(--mc-fg)}
.mc-s-slot{display:flex;align-items:center;justify-content:center;gap:4px;flex:none;order:-1;
  width:15px;height:15px;margin-left:14px}
.mc-s-menu{display:grid;place-items:center;width:18px;height:18px;flex:none;
  background:none;border:none;cursor:pointer;color:var(--mc-faint);border-radius:var(--mc-r-tag)}
.mc-s-menu:active{color:var(--mc-fg)}
.mc-sb-find .mc-s-menu svg{width:12px;height:12px}
.mc-sess.on{background:var(--mc-fg);border-radius:0}
.mc-sess.on .mc-s-tt,.mc-sess.on .mc-s-menu{color:var(--mc-surface)}
.mc-sess.on .mc-s-ok{color:var(--mc-surface)}
.mc-s-dot{display:block;width:6px;height:6px;background:var(--mc-spark);flex:none;
  clip-path:polygon(33% 0,67% 0,100% 33%,100% 67%,67% 100%,33% 100%,0 67%,0 33%)}
.mc-sess.run .mc-s-dot{animation:mc-pulse 2.6s steps(1,end) infinite;
  animation-delay:var(--pulse-delay,0ms)}
.mc-s-ok{width:11px;height:11px;flex:none;color:var(--mc-success)}
.mc-sess.xtra{display:none}
.mc-group.expanded .mc-sess.xtra{display:flex}
.mc-group.expanded .mc-sb-more{display:none}
.mc-sb-more{display:flex;align-items:center;gap:5px;box-sizing:border-box;
  width:calc(100% - 46px);margin:2px 0 0 46px;padding:2px 6px;
  border:none;background:none;cursor:pointer;text-align:left;
  color:var(--mc-accent);font:400 12px/1.6 var(--font-sb);border-radius:var(--mc-r-tag)}
.mc-sb-more:active{color:var(--mc-fg)}
.mc-sb-find .mc-sb-more svg{width:11px;height:11px;flex:none}
/* ===== 折叠态迷你条（原型 .sb-mini；56px 官方轨内一列 26px 图标钮）===== */
.mc-sb-mini{display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;min-height:0;padding:8px 0}
.mc-mini-btn{display:grid;place-items:center;width:34px;height:30px;flex:none;
  border:1px solid var(--mc-border);border-radius:var(--mc-r-tag);
  background:var(--mc-surface-2);color:var(--mc-fg);cursor:pointer}
.mc-mini-btn:active{background:var(--mc-border);color:var(--mc-surface)}
.mc-mini-btn svg{width:16px;height:16px}
.mc-mini-new{background:var(--mc-accent);color:var(--mc-accent-ink)}
.mc-mini-new:active{background:var(--mc-border);color:var(--mc-surface)}`,

  slots(ctx) {
    // 可选读取 'slots' 服务（ctx.slots 常驻直达；勿属性访问未声明服务）
    const S = ctx.slots;
    if (!S || typeof S.register !== 'function' || typeof S.inject !== 'function') return;
    // 遮蔽官方工作区树：priority:-1 lowest-render（aurum client.js L3123-3150 同款）。
    // 官方注册保留 —— 停插件即还原；McSidebar.css 的官方树覆写因此降级为兜底（遮蔽失败时不破版）。
    // inject 返回 disposer，register 返回 disposer —— 经 ctx.effect(() => disp) 归入本 fiber。
    // ctx.sessions：plugin 尾部 inject:['sessions'] 声明（aurum 同款）——打开会话走 sessionsSvc.open。
    const sessionsSvc = ctx.sessions;
    ctx.effect(() => S.inject('sidebar.workspaces', () => S.register(
      { name: 'sidebar.workspaces', priority: -1, registrant: 'macintosh' },
      function McFinderHost(props) {
        if (typeof React === 'undefined') return null;
        // 官方折叠信号：席位 props.wide=false 即 56px 轨道 → 渲染迷你图标条（McFinderTree 会挤爆窄轨）
        if (props && props.wide === false) return React.createElement(McFinderMini, props);
        const p = Object.assign({}, props);
        p.openSession = sessionsSvc && typeof sessionsSvc.open === 'function'
          ? function (id) { try { sessionsSvc.open(id); } catch (e) { try { console.error('[mcx] open session failed:', e && e.message); } catch (e2) {} } }
          : null; // TODO(二期)：服务缺席时行内提示；当前静默降级假数据选中
        return React.createElement(McFinderTree, p);
      }
    )));
  },
};

// src/kit.js —— 检视页骨架（默认关闭零足迹；控制台 window.__MC_KIT_OPEN__ = true 打开）
// 布局类全部 kit- 前缀，样式不外泄 kit 根之外；组件类直接复用 mc- 原语
// 纯顶层声明，无模块系统语法；与 tokens/clock/mcfx/sprite 拼进同一作用域
const McKit = {
  css: `/* ===== kit 检视页专属布局（全部 kit- 前缀，不外泄） ===== */
.kit-scrim{position:fixed;inset:0;z-index:95;overflow-y:auto;box-sizing:border-box;
  padding:32px 16px;pointer-events:auto;
  background:radial-gradient(rgba(0,0,0,.5) 1px,transparent 1.5px);
  background-size:8px 8px} /* 点阵幕：与桌面同 8px 栅格，整块可点关闭 */
.kit-panel{max-width:960px;margin:0 auto;
  background:var(--mc-surface);
  border:1px solid var(--mc-border);border-radius:var(--mc-r-window);
  box-shadow:var(--mc-shadow-panel);overflow:hidden} /* 复用 .win 窗口语汇 */
.kit-titlebar{position:relative;display:flex;align-items:center;justify-content:center;
  height:var(--mc-titlebar-h);flex:none;
  background:repeating-linear-gradient(180deg,var(--mc-title-stripe) 0 1px,transparent 1px 3px),
    var(--mc-surface-2);
  border-bottom:1px solid var(--mc-border);padding:0 26px}
.kit-titlebar::before{content:'';position:absolute;left:0;top:0;right:0;height:1px;background:var(--mc-accent)}
.kit-title{max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  padding:0 8px;background:var(--mc-surface-2);color:var(--mc-fg);
  font:600 12px/1 var(--font-display);letter-spacing:.03em}
.kit-body{padding:20px 24px 28px;display:flex;flex-direction:column;gap:26px;
  color:var(--mc-fg);font:400 13px/1.7 var(--font-ui)}
.kit-h{font:600 15px/1 var(--font-display);letter-spacing:.03em;margin:0 0 10px}
.kit-grid{display:flex;flex-wrap:wrap;gap:10px}
.kit-chip{display:inline-flex;align-items:center;gap:8px;height:28px;padding:0 10px;
  border:1px solid var(--mc-border);border-radius:var(--mc-r-tag);background:var(--mc-surface-2);
  font:400 11px var(--font-mono);color:var(--mc-fg)}
.kit-swatch{width:18px;height:18px;flex:none;border:1px solid var(--mc-border)}
.kit-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.kit-cell{display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.kit-note{font:400 11px var(--font-mono);color:var(--mc-faint)}
.kit-demo{position:relative;display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  min-height:52px;padding:12px;border:1px dashed var(--mc-border-soft);background:var(--mc-surface-2)}
.kit-demo-target{position:relative;min-width:140px;padding:6px 12px;
  background:var(--mc-surface);border:1px solid var(--mc-border);
  font:400 12px var(--font-ui);color:var(--mc-fg)}
.kit-demo-target.kit-folded{display:none}
.kit-iconwall{display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:10px}
.kit-icell{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 4px;
  background:var(--mc-surface-2);border:1px solid var(--mc-border);border-radius:var(--mc-r-tag)}
.kit-icell svg{width:20px;height:20px;color:var(--mc-fg)}
.kit-ilabel{font:400 10px var(--font-mono);color:var(--mc-faint);word-break:break-all}
.kit-field{width:280px}
.kit-scrim{scrollbar-width:thin;scrollbar-color:var(--mc-scroll-box) transparent}
.kit-scrim::-webkit-scrollbar{width:15px}
.kit-scrim::-webkit-scrollbar-track{background:var(--mc-scroll-track);border-left:1px solid var(--mc-border)}
.kit-scrim::-webkit-scrollbar-thumb{background:var(--mc-scroll-box);border:1px solid var(--mc-border)}`,

  slots(ctx) {
    // 席位：shell.overlay（additive 列表槽，order 靠后）；默认渲染 null。
    // 'slots' 服务经 ctx.get 可选读取（勿声明 inject，勿属性访问）。
    const S = ctx.slots; // 常驻插件：inject 已声明，直达
    if (!S || typeof S.register !== 'function' || typeof S.inject !== 'function') return;
    ctx.effect(() => S.inject('shell.overlay', () => S.register({
      name: 'shell.overlay',
      id: 'mc-kit',
      order: 900,
      label: () => 'MC Kit',
    }, function KitEntry() {
      if (typeof React === 'undefined') return null;
      return React.createElement(McKitPage);
    })));
  },
};

// —— 检视页根组件：window.__MC_KIT_OPEN__ 真值才渲染，关闭走本地 state 强刷 ——
function McKitPage() {
  const h = React.createElement;
  const force = React.useState(0)[1];
  const open = !!(typeof window !== 'undefined' && window.__MC_KIT_OPEN__);
  if (!open) return null;

  const close = () => {
    window.__MC_KIT_OPEN__ = false;
    force(function (n) { return n + 1; });
  };

  // run 胶囊：挂载即向 CLOCK 对相位（负延迟），多 run 点同屏不交错
  const runPill = React.useRef(null);
  React.useEffect(function () {
    if (CLOCK && runPill.current) CLOCK.syncAnim(runPill.current);
  }, []);

  // mcfx 演示靶
  const tgtIn = React.useRef(null);
  const tgtOut = React.useRef(null);
  const tgtAcc = React.useRef(null);

  const doFlashIn = () => {
    const el = tgtIn.current;
    if (el) flashIn(el, function () { el.textContent = '出场后的内容 ' + new Date().getSeconds(); });
  };
  const doFlashOut = () => {
    const el = tgtOut.current;
    if (el) flashOut(el, function () { el.textContent = '已退场（再点出场复原）'; });
  };
  const doAccToggle = () => {
    const el = tgtAcc.current;
    if (el) accToggle(el, function () { el.classList.toggle('kit-folded'); });
  };

  const swatches = [
    ['--mc-bg', 'bg 桌面底'], ['--mc-surface', 'surface 窗面'], ['--mc-fg', 'fg 文字'],
    ['--mc-border', 'border 描边'], ['--mc-accent', 'accent 强调'], ['--mc-spark', 'spark 次强调'],
    ['--mc-success', 'success'], ['--mc-danger', 'danger'],
  ];
  const pills = [
    ['run', '运行中'], ['done', '完成'], ['fail', '失败'], ['wait', '等待'], ['accent', '强调'],
  ];
  const icons = [
    'i-close', 'i-zoom', 'i-apple', 'i-doc', 'i-folder', 'i-suitcase', 'i-finder',
    'i-check', 'i-command', 'i-sparkle', 'i-px-plus', 'i-px-search',
  ];

  // 外层 svg 不带 viewBox：<use> 引 <symbol> 时由 symbol 自带 viewBox 缩放适配
  return h('div', { className: 'kit-scrim', onClick: close },
    h('div', {
      className: 'kit-panel', onClick: function (e) { e.stopPropagation(); },
    },
      h('div', { className: 'kit-titlebar' }, h('span', { className: 'kit-title' }, 'MC Kit — 检视页')),
      h('div', { className: 'kit-body' },
        // (a) tokens 色板
        h('section', null,
          h('h3', { className: 'kit-h' }, 'Tokens 色板'),
          h('div', { className: 'kit-grid' },
            swatches.map(function (s) {
              return h('span', { className: 'kit-chip', key: s[0] },
                h('span', { className: 'kit-swatch', style: { background: 'var(' + s[0] + ')' } }),
                esc(s[1]));
            }))),
        // (b) 基础原语五态
        h('section', null,
          h('h3', { className: 'kit-h' }, '基础原语'),
          h('div', { className: 'kit-row' },
            h('div', { className: 'kit-cell' }, h('button', { className: 'mc-btn' }, '默认')),
            h('div', { className: 'kit-cell' }, h('button', { className: 'mc-btn primary' }, 'Primary')),
            h('div', { className: 'kit-cell' }, h('button', { className: 'mc-btn danger' }, 'Danger')),
            h('div', { className: 'kit-cell' }, h('button', { className: 'mc-btn', disabled: true }, '禁用')),
            h('span', { className: 'kit-note' }, '按住看 :active 反色（无 hover / 无过渡）')),
          h('div', { className: 'kit-row' },
            pills.map(function (p) {
              return h('span', {
                className: 'mc-pill ' + p[0],
                key: p[0],
                ref: p[0] === 'run' ? runPill : null,
              }, esc(p[1]));
            })),
          h('div', { className: 'kit-row' },
            h('div', { className: 'kit-cell kit-field' },
              h('div', { className: 'mc-field' },
                h('input', { placeholder: 'mc-field 聚焦看 accent 外环' }))),
            h('div', { className: 'kit-cell' },
              h('span', { className: 'kit-note' }, 'mc-tri：'),
              h('svg', { className: 'mc-tri' }, h('use', { href: '#i-tri' })),
              h('svg', { className: 'mc-tri open' }, h('use', { href: '#i-tri' }))))),
        // (c) mcfx 闪烁演示
        h('section', null,
          h('h3', { className: 'kit-h' }, 'mcfx 闪烁演示'),
          h('div', { className: 'kit-demo' },
            h('button', { className: 'mc-btn', onClick: doFlashIn }, 'flashIn'),
            h('span', { className: 'kit-demo-target', ref: tgtIn }, '出场演示靶'),
            h('button', { className: 'mc-btn', onClick: doFlashOut }, 'flashOut'),
            h('span', { className: 'kit-demo-target', ref: tgtOut }, '退场演示靶'),
            h('button', { className: 'mc-btn', onClick: doAccToggle }, 'accToggle'),
            h('span', { className: 'kit-demo-target', ref: tgtAcc }, '开合演示靶'))),
        // (d) sprite 图标墙
        h('section', null,
          h('h3', { className: 'kit-h' }, 'Sprite 图标墙'),
          h('div', { className: 'kit-iconwall' },
            icons.map(function (id) {
              return h('div', { className: 'kit-icell', key: id },
                h('svg', null, h('use', { href: '#' + id })),
                h('span', { className: 'kit-ilabel' }, esc(id)));
            }))))));
}


// ═══ 常驻插件导出（持久组合行；无动态 fiber 守卫）═══
// 装配模块登记（与动态版同名同序；dist 尾部 mods/order 原样重建）
const mods = {
  McTokens: McTokens,
  McClock: McClock,
  McMcfx: McMcfx,
  McSprite: McSprite,
  MC_MAP: MC_MAP,
  McChrome: McChrome,
  McSidebar: McSidebar,
  McFinder: McFinder,
  McKit: McKit,
};
const order = ["McTokens","McClock","McMcfx","McSprite","MC_MAP","McChrome","McSidebar","McFinder","McKit"];

return {
  inject: ["slots", "theme", "sessions"],
  apply(ctx) {
    try { console.log('[mcx] apply — 主题注入开始（persistent）'); } catch (e) {}
    const style = document.createElement('style');
    style.setAttribute('data-mc-root','');
    // @font-face ×5 —— 宿主静态路由（index.js 前缀路由 /mcx-assets/ → 本包 assets/）
    let css = "@font-face{font-family:'FindersKeepers';src:url(/mcx-assets/fonts/FindersKeepers.ttf) format('truetype');font-display:swap}\n@font-face{font-family:'ChiKareGo';src:url(/mcx-assets/fonts/ChiKareGo.ttf) format('truetype');font-display:swap}\n@font-face{font-family:'Fusion Pixel 12px monospaced';src:url(/mcx-assets/fonts/fusion-pixel-12px-monospaced-latin.ttf) format('truetype');font-display:swap}\n@font-face{font-family:'Fusion Pixel 12px monospaced zh';src:url(/mcx-assets/fonts/fusion-pixel-12px-monospaced-zh_hans.ttf) format('truetype');font-display:swap}\n@font-face{font-family:'ChiKareGo Latin';src:url(/mcx-assets/fonts/ChiKareGo.ttf) format('truetype');unicode-range:U+0041-005A,U+0061-007A,U+00C0-024F,U+1E00-1EFF,U+2000-206F;font-display:swap}";
    for (const k of order) { const m = mods[k]; if (!m) continue;
      if (m.css) css += m.css + '\n';
      if (m.mount) try { const td = m.mount(ctx); if (typeof td === 'function') ctx.effect(() => td); } catch(e) { try { console.error('[mcx] mount ' + k + ' failed:', e && e.message); } catch (e2) {} }
      if (m.slots) try { m.slots(ctx) } catch(e) { try { console.error('[mcx] slots ' + k + ' failed:', e && e.message); } catch (e2) {} }
    }
    style.textContent = css; document.head.appendChild(style);
    // 正规主题通道：宿主 ThemePresenter 把活动主题 token 以 inline style 写在 body 上，
    // CSS 选择器永远压不过 —— 必须经 theme.overrideTokens 叠层（值用 var(--mc-*) 间接引用，
    // html[data-theme] 跟随官方 body[data-ds-dark-theme] 信号时随 --mc-* 动态跟随）。卸载时撤层。
    // 常驻插件直达：ctx.theme（inject:['theme'] 声明已生效）。
    try {
      const T = ctx.theme;
      if (T && typeof T.overrideTokens === 'function') {
        const pair = (v) => ({ light: v, dark: v });
        const off = T.overrideTokens('dsh-theme-macintosh', {
          '--dsw-alias-bg-base': pair('var(--mc-bg)'),
          '--dsw-alias-bg-layer-1': pair('var(--mc-surface)'),
          '--dsw-alias-bg-layer-2': pair('var(--mc-surface-2)'),
          '--dsw-alias-bg-overlay': pair('var(--mc-surface-3)'),
          '--dsw-alias-border-l1': pair('var(--mc-border)'),
          '--dsw-alias-border-l2': pair('var(--mc-border)'),
          '--dsw-alias-brand-primary': pair('var(--mc-accent)'),
          '--dsw-alias-label-primary': pair('var(--mc-fg)'),
          '--dsw-alias-label-secondary': pair('var(--mc-muted)'),
          '--dsw-alias-state-error-primary': pair('var(--mc-danger)'),
          '--dsw-alias-state-success-primary': pair('var(--mc-success)'),
          '--dsw-alias-state-warn-primary': pair('var(--mc-warn)'),
          '--dsw-specific-sidebar-fill': pair('var(--mc-rail-1)'),
          '--dsw-font-family': pair('var(--font-ui)'),
        });
        ctx.effect(() => () => { try { off(); } catch (e) {} });
        console.log('[mcx] theme.overrideTokens 已叠层');
      } else {
        console.warn('[mcx] theme 服务不可用，仅 CSS 层生效');
      }
    } catch (e) { console.error('[mcx] overrideTokens failed:', e && e.message); }
    try { console.log('[mcx] apply 完成，样式已入 head'); } catch (e) {}
    ctx.effect(() => () => {
      style.remove();
    });
  },
};
	}
});
