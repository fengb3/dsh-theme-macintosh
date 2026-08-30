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
  /* 硬投影（无模糊单偏移） */
  --mc-shadow-panel:3px 3px 0 0 rgba(0,0,0,.55);
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
  --mc-bg-deep:#7c7c7c; --mc-accent-strong:#75759f; --mc-accent-dim:rgba(143,143,192,.42); --mc-accent-ink:#ffffff;
  --mc-spark:#a8720e; --mc-success:#2e7d32; --mc-danger:#c23a34; --mc-danger-ink:#ffffff;
  --mc-border-soft:rgba(10,10,10,.5);
  --mc-box-line:#545487; --mc-box-face:#dadaff;
  --mc-shadow-panel:3px 3px 0 0 rgba(0,0,0,.85);
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
/* mcfx 闪烁类（照《笔记》§0.3）：只管遮罩本体，几何（定位/尺寸）由消费方给 */
.mc-ghost{opacity:0;pointer-events:none}
.mc-flash{background:#fff;pointer-events:none;position:relative}
.mc-flash::after{ /* 扫描线：单条 1px 硬边，随遮罩全宽 */
  content:'';position:absolute;left:0;right:0;top:0;height:1px;
  background:rgba(0,0,0,.35);
}
html[data-theme="light"] .mc-flash{background:#0a0a0a}
html[data-theme="light"] .mc-flash::after{background:rgba(255,255,255,.35)}
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
    el.classList.add('mc-ghost');
  } catch (e) { /* 单元素失败不拖垮调用方 */ }
  mcfxSchedule(() => {
    try {
      if (!el || !el.isConnected) return;
      show();
      el.classList.remove('mc-ghost');
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

// 退场镜像：flash → hide()（DOM 移除/隐藏）→ 撤两类
function flashOut(el, hide) {
  try {
    if (!el || !el.isConnected) return;
    el.classList.add('mc-flash');
  } catch (e) { /* 单元素失败不拖垮调用方 */ }
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
    card.classList.add('mc-ghost');
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
const MC_MAP = {
  // appRoot = 三列 frame（AppFrame 根 div）。无 data-* → 结构位（#root 唯一子div）
  appRoot: '#root > div', /* DRIFT-RISK: structural */
  // mainColumn = 会话根（header + 滚动口 + composer 都在其内，正好是"主窗"区域）
  mainColumn: 'div[data-phase]',
  // sessionHeader = ConversationSessionHeader 的 <header>；无 data-* → 会话根内结构位
  sessionHeader: 'div[data-phase] > header', /* DRIFT-RISK: structural */
  scrollport: '[data-conversation-scroll]',
  composerCard: '[data-composer-card]',
  // —— 以下供 Task 7 侧栏使用（Task 7 已对部署包复核，出处行号如下） ——
  // sidebar = 网格首列 sidebarCol。复核：dsh-client-ui-layout/lib/client.js L218-232 ——
  //   AppFrame 根 div（frame，即 #root 唯一子 div）children[0] 恒为 sidebarCol div
  //   （L226-232，无 data-*，class 为哈希 pI_x6G_sidebarCol）。结构位成立但随宿主改版漂移。
  sidebar: '#root > div > div:first-child', /* DRIFT-RISK: structural */
  // sidebarBrand = 侧栏列内首个 button。复核：dsh-client-ui-sidebar/lib/client.js L156-201 ——
  //   logoRow 首子 = 品牌 button（L158-181，仅 wide 形态渲染）；rail 收起时首个 button 变为
  //   折叠钮（L185-200）。aria-label 走 i18n（L161/188）不可依赖。样式覆写宽态命中品牌、窄态命中折叠钮，可接受。
  sidebarBrand: '#root > div > div:first-child button', /* DRIFT-RISK: structural */
  // sessionRow / sessionRowSelected。复核：dsh-client-ui-workspace/lib/client.js L718-721 ——
  //   SessionNodeItem 行 div role="treeitem" + aria-selected（selected 时 "true"），稳定语义锚点。
  sessionRow: 'div[role="treeitem"]',
  sessionRowSelected: 'div[role="treeitem"][aria-selected="true"]',
};

// src/chrome/chrome.js —— chrome 染色 + 桌面画布
// 协议：{ css, mount(ctx) }。RULING：桌面画布走 mount（body 首元素 data-mc-desk，z-index:-1），
// 不占 shell.overlay 席（该席 z-index:20 在 React 树内、叠在内容之上，只适合 kit 检视页那种浮层）。
// 纪律：选择器字符串一律来自 map.js 的 MC_MAP（本文件只做插值）；无 :hover、无 transition。
const McChrome = {
  css: [
    // frame 底色让位：AppFrame 根自带实底 background(--dsw-alias-bg-base)，不清掉会盖住桌面噪点；
    // 各列（sidebarCol/detailsCol/主窗）自有实底，不受影响
    `${MC_MAP.appRoot}{background:transparent}`,
    // 主列 = 会话窗（.win 语汇）：surface 底 + 1px 边 + 5px 圆角 + 3px 硬投影。
    // 刻意不收 overflow —— 宿主自管滚动（centerCol overflow:hidden + data-conversation-scroll）
    `${MC_MAP.mainColumn}{background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:var(--mc-r-window);box-shadow:var(--mc-shadow-panel)}`,
    // 会话头部条：surface-3 + 1px 底线（宿主 header::after 线已由 token 别名染成 --mc-border，视觉重叠成加重底线）
    `${MC_MAP.sessionHeader}{background:var(--mc-surface-3);border-bottom:1px solid var(--mc-border)}`,
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

// src/chrome/sidebar.js —— 侧栏 Finder 窗覆写 + 主题月牙钮（Task 7）
// 协议：{ css, slots(ctx) }。样式参考 prototype/component-dev-notes.md §7（侧栏 Finder 窗）。
// 纪律：宿主选择器一律取自 MC_MAP（本文件只做插值）；无 :hover、无 transition；
// 席位注册沿用 kit.js 在 Task 5 运行期验证过的 register(meta, render) 形态。
// teardown 用：首次 flip 前的 data-theme 原值（undefined = 从未 flip，null = 原本无属性）
let mcThemeOrig = undefined;

const McSidebar = {
  css: [
    // 侧栏列 = Finder 窗：rail-1 底 + 1px 右边线；整窗字体 --font-sb（§7.1）
    `${MC_MAP.sidebar}{background:var(--mc-rail-1);border-right:1px solid var(--mc-border);font-family:var(--font-sb)}`,
    // 品牌行：字号 17px（finder 图标 24px 经 sidebar.brand.mark 席位注入，见 slots）
    `${MC_MAP.sidebarBrand}{font:400 17px/1 var(--font-sb);color:var(--mc-fg)}`,
    `${MC_MAP.sidebarBrand} svg{width:24px;height:24px;flex:none}`,
    // 会话行：26px 细长条、单行 ellipsis、13px --font-sb、左缩进 20px（§7.2 行序）
    `${MC_MAP.sessionRow}{height:26px;display:flex;align-items:center;padding-left:20px;` +
      `overflow:hidden;white-space:nowrap;text-overflow:ellipsis;` +
      `font:400 13px/26px var(--font-sb);color:var(--mc-fg);border-radius:0}`,
    `${MC_MAP.sessionRow} *{flex-shrink:0}`,
    // 选中（aria-selected 语义）：整行反色 + 方角（§7.2 —— 漏 border-radius:0 会出"胶囊"破形）
    `${MC_MAP.sessionRowSelected}{background:var(--mc-fg);color:var(--mc-surface);border-radius:0}`,
    `${MC_MAP.sessionRowSelected} *{color:inherit}`,
  ].join('\n'),

  // 撤除恢复：装配器先调 mount 再调 slots，此处抢在首次 flip 前捕获 data-theme 原值
  mount() {
    if (mcThemeOrig === undefined) {
      mcThemeOrig = document.documentElement.getAttribute('data-theme');
      // 默认主题跟随宿主深浅：宿主浅色时补 data-theme=light，避免"浅色宿主 × 深色 mc 值"的对比度穿帮
      if (mcThemeOrig === null && !document.body.hasAttribute('data-ds-dark-theme')) {
        document.documentElement.setAttribute('data-theme', 'light');
        mcThemeOrig = null; // 仍记 null：卸载时移除属性，回到宿主原生
      }
    }
    return function teardown() {
      if (mcThemeOrig === undefined) return; // 从未捕获（未进入 mount）→ 不动
      if (mcThemeOrig === null) document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', mcThemeOrig);
    };
  },

  slots(ctx) {
    // 可选读取 'slots' 服务（ctx.get 是守卫允许的路径；勿用 ctx.slot 属性访问、勿声明 inject）
    const S = ctx.slots; // 常驻插件：inject 已声明，直达
    if (!S || typeof S.register !== 'function' || typeof S.inject !== 'function') return;
    const reg = S.register.bind(S);
    const wait = S.inject.bind(S);
    // 月牙主题钮：sidebar.footer.action（list 席）。ctx.slots.inject 等席位声明就绪后注册，
    // 返回的 disposer 经 ctx.effect 归入本 fiber（卸载即撤席位）。
    ctx.effect(() => wait('sidebar.footer.action', () => reg({
      name: 'sidebar.footer.action',
      id: 'mc-theme-toggle',
      order: 50,
      label: () => '切换深浅主题',
    }, function MoonToggle() {
      if (typeof React === 'undefined') return null;
      const flip = function () {
        const el = document.documentElement;
        if (mcThemeOrig === undefined) mcThemeOrig = el.getAttribute('data-theme');
        const cur = el.getAttribute('data-theme');
        el.setAttribute('data-theme', cur === 'light' ? 'dark' : 'light'); // 缺省视为 dark → light
      };
      return React.createElement('button', {
        type: 'button',
        className: 'mc-icon-btn',
        'aria-label': '切换深浅主题',
        title: '切换深浅主题',
        onClick: flip,
      }, React.createElement('svg', null, React.createElement('use', { href: '#i-moon' })));
    })));
    // 品牌图标：Finder 24px 换掉宿主 FishLogo。single 槽必须以更低 priority 遮蔽注册
    // （官方占位 priority 0，lowest renders —— 同 0 会抛 "already has a registration"）。
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
  McKit: McKit,
};
const order = ["McTokens","McClock","McMcfx","McSprite","MC_MAP","McChrome","McSidebar","McKit"];

return {
  inject: ["slots", "theme"],
  apply(ctx) {
    try { console.log('[mcx] apply — 主题注入开始（persistent）'); } catch (e) {}
    // 注意：不使用 ctx.interval 心跳 —— timer mixin 需 inject:['timer'] 声明，
    // 未声明时抛 "cannot get property timer without inject"（已验证）。
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
    // 月牙钮翻转 html[data-theme] 时随 --mc-* 动态跟随）。卸载时撤层。
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
