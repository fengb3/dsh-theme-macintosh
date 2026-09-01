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
/* mcfx 闪烁类（原型 interactive §172-183 + 验收四轮①修订）：
   flash = ::after 全覆盖遮罩（z-index:3）；ghost = 整卡透明——底色/底图/边框/投影/子内容全隐
   （!important 压过宿主与我方覆写的 specificity；::after 非元素自身绘制不受影响,白块照常）。
   使用方须同时挂 'mcfx' 类（flashIn/flashOut/accToggle 自动加）。 */
.mcfx{position:relative}
.mcfx::after{content:'';position:absolute;inset:0;pointer-events:none;opacity:0;z-index:3;
  background:#fff;
  background-image:repeating-linear-gradient(0deg,transparent 0 2px,rgba(0,0,0,.06) 2px 3px)}
.mcfx.mc-flash::after{opacity:1}
.mcfx.mc-ghost{border-color:transparent!important;background:transparent!important;
  background-image:none!important;box-shadow:none!important;outline:none!important}
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
      // 句柄注销：next 返回的取消句柄经此统一注销（T7 flow mount 轮询 teardown 用）；
      // dispose 后调用为无害 no-op（句柄闭包只触碰旧 mount 的队列绑定）
      clear(handle) {
        if (typeof handle === 'function') { try { handle(); } catch (e) { /* 忽略 */ } }
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
// CJS 兼容出口（段尾守卫，同 mcfx 尾部模式）：McClock/__clockForTest 供 clear 用例测试；
// computeNext 早期出口（上方）保留 —— McClock 为 const 声明，出口前移会 TDZ
if (typeof module !== 'undefined' && module.exports)
  module.exports = { computeNext, McClock, __clockForTest: function () { return CLOCK; } };

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

// 出场三拍：拍0 同步 ghost+show()（DOM 插入/显形）→ 拍1 换 flash → 拍2 撤净（含 mcfx，零残留）
function flashIn(el, show) {
  try {
    if (!el || !el.isConnected) return;
    el.classList.add('mcfx', 'mc-ghost');
    show(); // 拍0：内容在 ghost 遮罩下瞬换（原型 §910-912）
  } catch (e) { /* 单元素失败不拖垮调用方 */ }
  mcfxSchedule(() => {
    try {
      if (!el || !el.isConnected) return;
      el.classList.remove('mc-ghost');
      el.classList.add('mc-flash');
    } catch (e) { /* 同上 */ }
    mcfxSchedule(() => {
      try {
        if (!el || !el.isConnected) return;
        el.classList.remove('mc-flash', 'mc-ghost', 'mcfx');
      } catch (e) { /* 同上 */ }
    }, 100);
  }, 100);
}

// 退场镜像（原型 §919-927）：拍0 flash 白块 → 拍1 hide() + 撤净（含 mcfx，零残留）
function flashOut(el, hide) {
  try {
    if (!el || !el.isConnected) return;
    el.classList.add('mcfx', 'mc-flash');
  } catch (e) { /* 同上 */ }
  mcfxSchedule(() => {
    try {
      if (!el || !el.isConnected) return;
      hide();
      el.classList.remove('mc-flash', 'mc-ghost', 'mcfx');
    } catch (e) { /* 同上 */ }
  }, 100);
}

// 状态切换五拍（八轮回退七轮并拍：并拍把「+flash」与「fn」合成一拍后，fn 内 React setState
// 重渲染会重写元素 className（如 mc-think→mc-think open），把同拍刚挂的 mcfx/mc-flash 在
// 浏览器绘制前一并擦掉——白遮罩从未显现（think/inject 卡开合白闪丢失的根因）；
// 拆回五拍让白块独占一拍先绘制）：
// t0 ghost(整卡透明) → t100 flash+清残高(白块绘制拍) → t200 fn(白块遮盖下瞬变被遮内容;
// React 擦类=揭盖) → t300 同撤 flash+ghost+mcfx(对被擦过的元素幂等无害) → t400 滞空(只清 busy)。
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
      card.classList.add('mc-flash');
      card.style.height = ''; // 清展开动画残留的 inline 高度
    } catch (e) { /* 异常仍走完后续拍 */ }
    mcfxSchedule(() => {
      try {
        if (card && card.isConnected) fn(); // 白块已全遮一拍，被遮内容在此拍瞬变（可大可小）
      } catch (e) { /* fn 抛错仍走撤拍 */ }
      mcfxSchedule(() => {
        // 拍3：flash 与 ghost 同时撤（含 mcfx 连撤，元素零残留、内容一步显回；幂等）
        try {
          if (card && card.isConnected) card.classList.remove('mc-flash', 'mc-ghost', 'mcfx');
        } catch (e) { /* 同上 */ }
        mcfxSchedule(() => {
          // 拍4：什么都不动（滞空拍，维持五拍栅格；只清 busy）
          done();
        }, 100);
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
  //   T10 复核（2026-08-31，本机宿主 rc.2：C:\Users\fengb\node_modules\@deepseek-ai\dsh-client-ui-workspace）：
  //   语义锚不变（工作区行 ownRow L469-472 亦 role=treeitem+aria-expanded）；但 rc.2 起行内图标均包进
  //   span 槽位（folder 槽=首 span / chevron 槽 / status 槽=会话行首 span），一期「直系 svg」三锚失配 → T10 换锚。
  sessionRow: 'div[role="treeitem"]',
  sessionRowSelected: 'div[role="treeitem"][aria-selected="true"]',
  // 会话树行细分（probe-tree 实测 2026-08-30；T10 对 rc.2 源码复核修正）：工作区行带 aria-expanded；
  //   会话行无 expanded（状态图标在首 span 槽）。行内"操作/新建"按钮走 aria-label。
  //   注意：主题在装时官方树被 McFinder 遮蔽（sidebar.workspaces 席位 priority:-1 lowest-render），
  //   live DOM 无 treeitem 属设计内行为——本组键是遮蔽失败（slots 服务缺席等）时的兜底样式通道。
  sessionRowWorkspace: 'div[role="treeitem"][aria-expanded]', /* DRIFT-RISK: structural */
  sessionRowArrow: 'div[role="treeitem"][aria-expanded] svg[class*="arrow"]', /* DRIFT-RISK: hashed-substring;T10 修:svg 入 chevron 槽→去直系改后代(箭头 svg 自带 *_arrow 哈希类,rc.2 源 L486-489) */
  sessionRowFolder: 'div[role="treeitem"][aria-expanded] > span:first-of-type > svg', /* DRIFT-RISK: structural;T10 修:首 span=folder 槽(rc.2 源 L482-485) */
  sessionStatusIcon: 'div[role="treeitem"]:not([aria-expanded]) > span:first-of-type > [data-state]', /* DRIFT-RISK: structural;T10 修:StateDot 恒带 data-state 且双形态(ongoing=svg/其余=span,primitives StateDot L66-93),纯 svg 锚先天不稳 */
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
  // —— flow 段(会话流;探针 2026-08-31,host 0.1.1-rc.2;dsh-client-ui-conversation 行号)——
  flowScroll: '[data-conversation-scroll]',                    // stable(L7276)
  flowColumn: '[data-chat-flow]',                             // stable(L5829)
  flowItem: '[data-chat-flow-kind]',                          // stable(L5506-5510)
  // 验收七轮:kindUser/kindSteering/kindContext/kindCompaction/kindManualCompaction/kindModelRetry
  // 六键随 McSysCard 重绘退役(user/steering 六轮、context/compaction/manual-compaction/model-retry
  // 七轮——四卡自有 .mc-* 类零宿主锚;行级出场 flashIn 走 flowItem 泛锚即可)
  kindAssistantStep: '[data-chat-flow-kind="assistant-step"]',
  kindCommand: '[data-chat-flow-kind="command"]',
  kindTurnError: '[data-chat-flow-kind="turn-error"]',
  kindTurnMaxTokens: '[data-chat-flow-kind="turn-max-tokens"]',
  kindTurnTail: '[data-chat-flow-kind="turn-tail"]',
  kindUnknown: '[data-chat-flow-kind="unknown"]',
  bubbleUser: ':is([data-chat-flow-kind="user"],[data-chat-flow-kind="steering"])>div>div>div>div', /* DRIFT-RISK: structural 四子级 flowItem>data-slot 包装>userRow>userStack>bubble;keyed slot 出口有 div[data-slot=…] 包装层(display:contents 不减选择器深度),结构位选择器须计入(裁定10;哈希三件套 gdEzaW_*,L5332-5361) */
  userGallery: '[data-align="end"] [data-variant]',            // stable(ATT L705-746)
  // 验收六轮:refChip 键随用户行重写退役(McUserNodeView 自有 .mc-user-chip 类)
  mdRoot: '[data-chat-flow-kind="assistant-step"] > div > div', /* DRIFT-RISK: structural;第一层 div 为 data-slot 包装层,原一层值命中包装层——当前无消费者,防未来误用(裁定10;Sxvs8a_*,L9461-9521) */
  // 验收四轮:thinkCard/thinkSummary/ariaExpanded 三键随宿主 ReasoningRow 覆写退役
  // (McThink 组件整体重写 assistant-step,自有 .mc-think 类零宿主锚)
  // 验收七轮:ctxBody/disclosureRow/contextForm/retryActive/compactionDisclosure 五键随 McSysCard
  // 重绘退役(宿主 context/retry/compaction DOM 整体被遮蔽,皮肤锚与 :has 图标细分、pulse 门控
  // data-active 锚、折叠图标 span 锚全部无消费者;重绘卡自有 .mc-* 类零宿主锚)
  turnTailBar: '[data-turn-tail]',                            // stable(L9715-9752)
  // —— 终审 F2 收编（2026-08-31）：此前 flow 规则里直写的宿主选择器一律进管制表（spec §1 唯一管制点）——
  pendingSteering: '[data-pending-steering]',  // stable(steering 待定态虚线廓，spec §4 行3)
  statusRow: '[role="status"]',                // stable(TurnStatus 宿主状态行；使用时限定 flowColumn 内，spec §4 行10)
  commandCard: '[data-variant="others"]',      // stable(command 卡壳锚，spec §4 行9「[data-variant="others"][data-state]」)
  dataState: '[data-state=',                   // 属性前缀键（任意取值形态；command 三态）
  // —— 用户验收三轮④收编（2026-09 live 探测，host 0.1.1-rc.2）——
  deliverRoot: '.P4kPIW_root',   // DRIFT-RISK: build-hash class(dsh-client-ui-deliverables 产物行;无 data-* 稳定锚,宿主升级先复核)
  deliverFile: '.P4kPIW_file',   // DRIFT-RISK: 同上(文件名 chip 按钮;含 measure 探针 P4kPIW_probe 同类复用)
  deliverMore: '.P4kPIW_more',   // DRIFT-RISK: 同上("+N 个文件"溢出标签)
  // —— menu 段(弹出菜单;探针 2026-09-01,host 0.1.1-rc.1——附录A)——
  // 宿主原生菜单 = dsh-client-ui-primitives Menu(portal:true):createPortal(list,document.body),
  // list 为 div[role="menu"] 定位浮层(position:fixed 内联 left/top,viewport 内 clamp;
  // primitives lib/index.js L1525-1704)。项为 button[role="menuitem"],分隔线 div[role="separator"]。
  // 触发 = 行内 dots 钮左键(workspace SessionNodeItem/ProjectRowItem 的 rowActions),无 contextmenu 右键。
  // 主题在装时官方树被 McFinder 遮蔽,此组键是遮蔽失败时的兜底隐藏通道(Task 4 自绘兜底藏原生菜单)。
  menuPortal: 'body > div[role="menu"]',            // 宿主菜单 portal 容器(createPortal 直挂 body;类名全哈希,role 语义锚 stable)
  menuHostItem: 'body > div[role="menu"] [role="menuitem"]', // 宿主原生菜单项(button[role=menuitem];自绘兜底藏;stable)
  // —— dock 段(输入坞;探针 2026-09-01,host 0.1.1-rc.2 rev aba836a0c42d——dock 附录A)——
  composerSeat: '[data-composer-seat]', // composer 席位容器(探针实测在场;官方卡 closest 命中)
  composerHide: '[data-composer-card]', // 官方卡壳=藏匿锚(一期键复核;属性门控 html[data-mc-dock-on] 藏未删)
  composerField: '[data-composer-card] textarea', // 官方 textarea(镜像目标;镜像冒烟 mirrored:true)
  composerSend: '[data-composer-card] [aria-label="发送消息"]', // 官方发送钮(程序化 click;镜像后 disabled true→false 翻转实测)
  composerStop: '',       // 官方停止钮(busy 态;空=Stop 不接桥,busy 断言降级 INFO)——idle 勘定无 Stop 钮在场
  composerPhase: '',      // 官方忙闲属性锚(空=降级读 Send/Stop disabled)——div[data-phase] 实测为页面态(settling|hero|active)非忙闲;role=status idle 缺席
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


// src/chrome/sidebar.js —— 侧栏 Finder 窗覆写 + 主题官方通道 + 真 DOM 标题栏
// 协议：{ css, mount?, slots? }。纪律：宿主选择器一律取自 MC_MAP；无 :hover、无 transition。
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
    // 会话树图标统一 15px（原型 group-head svg 15px；行内小钮 12px 走 18px 容器）。
    // sessionStatusIcon 一并入选：rc.2 StateDot 非 ongoing 态渲染为 span[data-state]（非 svg），
    // 不入本规则会以官方 10px 原尺寸出像素 doc —— T10 换锚配套。
    `${MC_MAP.sessionRow} svg,${MC_MAP.sessionStatusIcon}{width:15px;height:15px;flex:none}`,
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
    //    CLOCK 100ms 栅格轮询定位，上限 ~10s）。tclose = 折叠/展开：accToggle 五拍包裹
    //    官方隐藏钮的程序化 click（七轮裁定：状态切换统一走库；保官方行为与状态持久化）。 ——
    let stopped = false;
    let bar = null;
    let heal = null;
    let cancelPoll = null;
    let tries = 0;
    const onTclose = function () {
      const btn = document.querySelector(MC_MAP.sidebarCollapseBtn);
      if (!btn) return;
      const col = document.querySelector(MC_MAP.sidebar);
      // 折叠/展开过场：ghost 下瞬切宽度 → 白块+瞬变 → 揭开（官方 300ms/150ms 过渡已压 0）
      if (col) accToggle(col, function () { btn.click(); });
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
  const btn = function (title, icon, onClick, cls) {
    const p = { className: cls ? 'mc-gh-btn ' + cls : 'mc-gh-btn', type: 'button', title: title, 'aria-label': title, 'data-mc-finder': '' };
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
      // 二批 D：视图选项钮勘不通 no-op（spec §0 裁定4 延伸）——CSS 隐藏（钮保留 DOM，宿主实有视图选项后恢复）
      btn('视图选项', '#i-px-sliders', function (e) {
        if (MC_MENU_OPEN) MC_MENU_OPEN('view', e.currentTarget, null);
      }, 'mc-lb-view'),
      btn('添加', '#i-px-plus', function (e) {
        if (MC_MENU_OPEN) MC_MENU_OPEN('add', e.currentTarget, null);
      })));
}

// —— 折叠态迷你条（原型 .sb-mini）：官方 sidebar.workspaces 席位在折叠轨（wide:false）时的形态。
// 只渲染一列 26px 图标钮：新建（程序化点官方 newSession 钮保行为/状态持久化）+ 搜索（展开侧栏后过滤）。
// 搜索词经模块级 MC_FINDER_QUERY + 自定义事件 mcx-finder-query 传给展开态 McFinderTree
// （折叠/展开是组件形态切换=remount，state 不跨形态存活）。 ——
let MC_FINDER_QUERY = '';

// 二批 C：行内编辑桥——菜单「重命名」项（McMenus WIRING）不能直接设 React 状态，
// 经模块级 MC_EDIT_HOOK 回调（McFinderTree 挂载时注册 editing setter、卸载置空）。
// 声明在 src/conv/overlays.js（拼接同作用域；运行期注册，无加载序问题）。

// 二批 C：行内重命名输入（自有类 .mc-edit）。Enter→提交；Escape/失焦→取消（保守：blur 不提交防误触）。
// 无 :hover/无 transition/无定时器；autoFocus + 全选即取。
function McEditInput(props) {
  const h = React.createElement;
  const vState = React.useState(props.initial || '');
  const ref = React.useRef(null);
  React.useEffect(function () { // 挂载即聚焦全选（一次性，无定时器）
    const el = ref.current;
    if (el && typeof el.focus === 'function') { el.focus(); try { el.select(); } catch (e) {} }
  }, []);
  const done = function (submit) {
    const v = String(vState[0] || '').trim();
    if (submit && v !== '') props.onSubmit(v);
    else props.onCancel();
  };
  return h('input', {
    className: 'mc-edit', ref: ref, type: 'text', value: vState[0], 'data-mc-finder': '',
    onChange: function (e) { vState[1](e.target.value); },
    onKeyDown: function (e) {
      if (e.key === 'Enter') { e.preventDefault(); done(true); }
      else if (e.key === 'Escape') { e.preventDefault(); done(false); }
    },
    onBlur: function () { done(false); },
    onClick: function (e) { e.stopPropagation(); },
  });
}

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
// 选中行 .on 整行反色方角；onClick 走 accToggle 五拍（七轮裁定：选中=状态切换统一走库；
// t0 整行隐 → t100 白块+瞬切选中 → t200 揭开 → t300 滞空，走 CLOCK 100ms 栅格）。
function McFinderSess(props) {
  const h = React.createElement;
  const s = props.sess;
  const on = props.selected;
  const cls = 'mc-sess' + (on ? ' on' : '') + (s.status === 'run' ? ' run' : '') + (s.xtra ? ' xtra' : '');
  const pick = function (e) {
    const row = e.currentTarget; // 事件对象即刻取 DOM（不依赖事件池生命周期）
    accToggle(row, function () { props.onPick(s.id); }); // 选中态切换包进白块遮盖中拍
  };
  let slot = null;
  if (s.status === 'run') slot = h('i', { className: 'mc-s-dot' });
  else if (s.status === 'done') slot = h('svg', { className: 'mc-s-ok', 'aria-hidden': true }, h('use', { href: '#i-check' }));
  // 二批 C：行内重命名（菜单「重命名」项 → editing {kind:'sess',id} → 标题位换输入框）
  const ed = props.editing && props.editing.kind === 'sess' && props.editing.id === s.id;
  const titleEl = ed
    ? h(McEditInput, {
        initial: s.title,
        onSubmit: function (v) {
          props.onEdit(null);
          if (MC_MENU_FIRE) MC_MENU_FIRE('renameSubmit', { sess: s.id, title: v });
        },
        onCancel: function () { props.onEdit(null); },
      })
    : h('span', { className: 'mc-s-tt' }, esc(s.title));
  return h('div', { className: cls, role: 'button', tabIndex: 0, onClick: pick, title: s.title, 'aria-selected': on ? 'true' : 'false' },
    titleEl,
    h('span', { className: 'mc-s-slot' }, slot),
    h('button', {
      className: 'mc-s-menu', type: 'button', title: '会话菜单', 'aria-label': '会话菜单', 'data-mc-finder': '',
      onClick: function (e) { // 菜单钮不触发行选中；开 sess 菜单（上下文=会话 id）
        e.stopPropagation();
        if (MC_MENU_OPEN) MC_MENU_OPEN('sess', e.currentTarget, { sess: s.id });
      },
    }, h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-dots' }))));
}

// 工作区分组：group-head（折叠三角 i-tri + 文件夹 i-folder + 名称 + 计数 + dots/plus 小钮）+
// group-body（会话行 + 超 5 条的「展开其余 N 个会话」钮）。折叠开合走 accToggle 五拍
// （七轮裁定：状态切换统一走库；「展开其余」=元素出现，仍走 flashIn）。
function McFinderGroup(props) {
  const h = React.createElement;
  const g = props.group;
  const open = !!props.open;
  const expanded = !!props.expanded;
  const xtraCount = g.sessions.filter(function (s) { return s.xtra; }).length;
  const toggle = function (e) {
    const grp = e.currentTarget.closest('.mc-group');
    accToggle(grp, function () { props.onToggle(g.id); });
  };
  const ghBtn = function (title, icon, onClick) {
    const p = { className: 'mc-gh-btn', type: 'button', title: title, 'aria-label': title, 'data-mc-finder': '' };
    if (onClick) p.onClick = onClick;
    return h('button', p, h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: icon })));
  };
  // 二批 C：工作区名行内编辑（editing {kind:'ws',id} → 名称位换输入框）。
  // input 不能嵌 <button>（非法 HTML 且点击被钮吞）→ 编辑态整块降为无钮容器（图标/计数保留，折叠开合暂不可点）。
  const ed = props.editing && props.editing.kind === 'ws' && props.editing.id === g.id;
  const nameEl = ed
    ? h(McEditInput, {
        initial: g.name,
        onSubmit: function (v) {
          props.onEdit(null);
          if (MC_MENU_FIRE) MC_MENU_FIRE('groupRenameSubmit', { ws: g.id, title: v });
        },
        onCancel: function () { props.onEdit(null); },
      })
    : h('span', { className: 'mc-g-name' }, esc(g.name));
  const headInner = [
    h('svg', { className: open ? 'mc-tri open' : 'mc-tri', 'aria-hidden': true }, h('use', { href: '#i-tri' })),
    h('svg', { 'aria-hidden': true }, h('use', { href: '#i-folder' })),
    nameEl,
    h('span', { className: 'mc-g-count' }, esc(String(g.sessions.length))),
  ];
  const headMain = ed
    ? h('div', { className: 'mc-gh-main', 'data-mc-finder': '' }, headInner)
    : h('button', { className: 'mc-gh-main', type: 'button', onClick: toggle, 'aria-expanded': open, 'data-mc-finder': '' }, headInner);
  return h('div', { className: 'mc-group' + (expanded ? ' expanded' : '') },
    h('div', { className: 'mc-group-head' },
      headMain,
      h('span', { className: 'mc-gh-act' },
        ghBtn('工作区菜单', '#i-px-dots', function (e) { // group 菜单（上下文=工作区 id）
          if (MC_MENU_OPEN) MC_MENU_OPEN('group', e.currentTarget, { ws: g.id });
        }),
        ghBtn('新建会话', '#i-px-plus', function () { // 二批 B：直建会话（不弹菜单）；定向到本工作区
          if (MC_MENU_FIRE) MC_MENU_FIRE('groupNewSess', { ws: g.id });
        }))),
    h('div', { className: 'mc-group-body' + (open ? ' open' : '') },
      g.sessions.map(function (s) {
        return h(McFinderSess, { key: s.id, sess: s, selected: props.selected === s.id, onPick: props.onPick,
          editing: props.editing, onEdit: props.onEdit });
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
  // 开合覆盖 {gid:bool} 持久化 localStorage(七轮修复:刷新回全开 + 点一组全体误折两弊;
  // null=无记录默认全开;查不到键一律回落「开」——只有显式 false 才折,单组开合互不牵连)
  const MC_FINDER_OPEN_KEY = 'mcx-finder-open';
  const openState = React.useState(function () {
    try {
      const v = window.localStorage.getItem(MC_FINDER_OPEN_KEY);
      if (v) { const o = JSON.parse(v); if (o && typeof o === 'object') return o; }
    } catch (e) { /* 坏值/无存储 → 回落默认全开 */ }
    return null;
  });
  const expState = React.useState({});
  const qState = React.useState(MC_FINDER_QUERY); // 迷你态搜索词跨形态接力（惰性初值）
  const q = qState[0].trim().toLowerCase();
  // 二批 C：行内重命名编辑态 {kind:'ws'|'sess', id} | null；setter 注册到模块级 MC_EDIT_HOOK
  // （菜单重命名项经桥进入编辑态；卸载守卫置空——M3 同款）。
  const editState = React.useState(null);
  React.useEffect(function () {
    MC_EDIT_HOOK = editState[1];
    return function () { if (MC_EDIT_HOOK === editState[1]) MC_EDIT_HOOK = null; };
  }, []);
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
    openState[1](function (o) {
      const n = Object.assign({}, o || {});
      n[gid] = !(o ? o[gid] !== false : true); // 查无键=当前开 → 翻折;有键按记录翻
      try { window.localStorage.setItem(MC_FINDER_OPEN_KEY, JSON.stringify(n)); } catch (e) {}
      return n;
    });
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
          open: q !== '' ? true : (openState[0] === null ? true : openState[0][g.id] !== false),
          expanded: !!expState[0][g.id] || q !== '',
          selected: sel, onToggle: onToggle, onExpand: onExpand, onPick: onPick,
          editing: editState[0], onEdit: editState[1],
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
/* 二批 D：视图选项钮勘不通 no-op（spec §0 裁定4 延伸）——隐藏（DOM 保留；宿主实有视图选项后恢复） */
.mc-sb-find .mc-lb-view{display:none}
/* 二批 C：行内重命名输入（方角 1px 边框、font 同位、宽随容器；无 hover/transition） */
.mc-sb-find .mc-edit{flex:1;min-width:0;box-sizing:border-box;width:100%;
  padding:2px 4px;background:var(--mc-surface);
  border:1px solid var(--mc-border);border-radius:0;outline:none;
  font:400 13px/1.4 var(--font-sb);color:var(--mc-fg)}
.mc-sb-find .mc-gh-main .mc-edit{font:400 15px/1.25 var(--font-sb);letter-spacing:.02em} /* 与 .mc-g-name 同位 */
/* Task 5 菜单锚定(v2 裁剪 bug 修复后仅存样式作用)：按钮组/会话行容器预置 position:relative——
   菜单已改 body 挂载 fixed 定位不再依赖 offsetParent,.mc-anchor 锚类退役删除 */
.mc-sb-find .mc-sb-la,.mc-sb-find .mc-gh-act,.mc-sb-find .mc-sess{position:relative}
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
          ? function (id) { try { sessionsSvc.open(id); } catch (e) { /* 静默降级：保持假数据选中 */ } }
          : null; // TODO(二期)：服务缺席时行内提示；当前静默降级假数据选中
        return React.createElement(McFinderTree, p);
      }
    )));
  },
};

// src/kit.js —— 检视页骨架（默认关闭零足迹；控制台 window.__MC_KIT_OPEN__ = true 打开）
// 布局类全部 kit- 前缀，样式不外泄 kit 根之外；组件类直接复用 mc- 原语
// 纯顶层声明，无模块系统语法；与 tokens/clock/mcfx/sprite 拼进同一作用域

// src/conv/flow.js —— 会话流覆写(spec 2026-08-31)
// 协议 { css, mount(ctx) }。选择器一律插值 MC_MAP;无 :hover 无 transition。
// apply 段 overrideTokens 追加 --dsw-specific-bubble(见 client.js apply)
// MC_FLOW_ICONS:form→icon 名纯数据(kit 与 css 图标位共用;client.js McFlow 段同源保留映射)
var MC_FLOW_ICONS = { instructions:'doc', notice:'doc', relay:'doc', catalog:'list',
  snapshot:'copy', recall:'clock', compaction:'copy', 'manual-compaction':'copy' };
if (typeof module !== 'undefined') module.exports = { MC_FLOW_ICONS: MC_FLOW_ICONS };
// 注入条图标位 data-URI。验收二轮①:inject 四型原型(L958/L1245)用 sprite #i-doc(经典 Mac 手绘
// 款 8×10,FIGMA-ASSETS L633)而非 pixelarticons doc——DOC 常量换成 i-doc 双 path 联合剪影;
// catalog=list/snapshot=copy/recall=clock 保持 pixelarticons 24 栅格(原型即如此,L1245 特判 i-doc
// 独用 8×10 栅格)。mask 用,fill 仅占 alpha → 黑;百分号编码同 MC_TBOX 款:< > # 转义、属性单引号、
// d 串逐字保留(i-tri 同款:侧栏 .mc-tri 的 sprite 资产平移,fill 一并 %23000)
const MC_FLOW_ICON_DOC = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 10'%3E%3Cpath fill='%23000' fill-rule='evenodd' clip-rule='evenodd' d='M0 0H6V1H8V10H0V0ZM7 3H5V1H1V9H7V3Z'/%3E%3Cpath fill='%23000' d='M5 1H1V9H7V3H5V1Z'/%3E%3C/svg%3E";
const MC_FLOW_ICON_LIST = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M2 5h20v14H2V5zm2 2v2h16V7H4zm16 4H4v2h16v-2zm0 4H4v2h16v-2z'/%3E%3C/svg%3E";
const MC_FLOW_ICON_COPY = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M4 2h11v2H6v13H4V2zm4 4h12v16H8V6zm2 2v12h8V8h-8z'/%3E%3C/svg%3E";
const MC_FLOW_ICON_CLOCK = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M19 3H5v2H3v14h2v2h14v-2h2V5h-2V3zm0 2v14H5V5h14zm-8 2h2v6h4v2h-6V7z'/%3E%3C/svg%3E";
// 验收四轮:MC_FLOW_ICON_TRI(think 折叠三角 mask)退役——think 卡重写后用 sprite #i-tri 直引
var McFlow = {
  // IIFE 安放 var F:顶层作用域与 tokens/clock/mcfx/sprite 共享,F 不外泄
  css: (function () {
    if (typeof MC_MAP === 'undefined') return ''; // standalone CJS(测试 loadSrc)只消费纯数据;client.js 装配域恒有 MC_MAP
    var F = MC_MAP.kindAssistantStep;
    return [
      // §4-1:.flow 列(gap 16→14 原型 L462;padding 16;子项 flex:none 手册 §6.4)
      MC_MAP.flowColumn + '{gap:14px;padding:16px}',
      MC_MAP.flowItem + '{flex:none;min-width:0}',
      // §5:.md 正文覆写(md 全要素;值照原型 L298-315,前缀 .flow .md → F)
      F + '{font:400 14px/1.8 var(--font-ui);color:var(--mc-fg);word-break:break-word}',
      F + ' h1,' + F + ' h2,' + F + ' h3{font:600 17px/1.4 var(--font-display);letter-spacing:.01em;margin:14px 0 6px}',
      F + ' h2{font-size:15px}',
      F + ' h3{font-size:14px}',
      // h4-h6：原型 §5 未定义，官方样式兜底（spec §2 勘误见 ledger 裁定）
      F + ' p+p{margin-top:8px}',
      F + ' ul,' + F + ' ol{margin:6px 0;padding-left:22px}',
      F + ' li{margin:3px 0}',
      F + ' :not(pre)>code{font:500 12px/1.5 var(--font-code);padding:1px 5px;background:var(--mc-sel-bg);border-radius:var(--mc-r-tag);color:var(--mc-fg)}',
      F + ' pre{margin:8px 0;padding:10px 12px;overflow-x:auto;background:var(--mc-bg-deep);border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card)}',
      F + ' pre code{padding:0;background:none;font:400 12.5px/1.7 var(--font-code)}',
      F + ' table{border-collapse:collapse;margin:8px 0;font:400 12.5px/1.6 var(--font-ui)}',
      F + ' th,' + F + ' td{padding:4px 10px;text-align:left;border:1px solid var(--mc-border-soft)}',
      F + ' th{font:600 12px/1.4 var(--font-display);background:var(--mc-surface-2)}',
      F + ' blockquote{margin:8px 0;padding:2px 12px;color:var(--mc-muted);border-left:2px solid var(--mc-accent-dim)}',
      F + ' a{color:var(--mc-accent)}',
      F + ' input[type="checkbox"]{accent-color:var(--mc-accent)}',
      // 宿主代码块包装(.md-code-block 全局稳定类)。banner 重样式(验收② 2026-08-31 live 探明):
      // 首子 bannerWrap div 内还有一层 _banner 哈希壳(自带 tab 底/9px 粗 padding/12px 顶圆角 =
      // 宿主 tab 感来源)→ display:contents 让位;bannerWrap 直接作 22px 细条:surface-2 底 +
      // 底部 1px border-soft 分隔,infostring 语言名(mono 11 muted)左置,action 复制钮
      // (18×18 方钮+像素 copy 图标,「复制」文字 font-size:0 藏但 AT 可读)margin-left:auto 右置
      F + ' .md-code-block{background:var(--mc-bg-deep);border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card);overflow:hidden}',
      F + ' .md-code-block pre{margin:0;border:none;border-radius:0}',
      F + ' .md-code-block>div:first-child{display:flex;align-items:center;gap:8px;box-sizing:border-box;height:22px;padding:0 10px;background:var(--mc-surface-2);border-bottom:1px solid var(--mc-border-soft);border-radius:0;font:500 11px/1 var(--font-mono);color:var(--mc-muted)}',
      F + ' .md-code-block>div:first-child>div{display:contents}',
      F + ' .md-code-block>div:first-child>div>div:first-child{flex:none;min-width:0;font:500 11px/1 var(--font-mono);color:var(--mc-muted)}',
      F + ' .md-code-block>div:first-child>div>div:last-child{margin-left:auto;flex:none;display:inline-flex}',
      F + ' .md-code-block>div:first-child button{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:18px;height:18px;padding:0;border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);background:var(--mc-surface);color:var(--mc-fg);font-size:0;cursor:pointer}',
      F + ' .md-code-block>div:first-child button::before{content:"";width:11px;height:11px;background-color:currentColor;-webkit-mask:url("data:image/svg+xml,' + MC_FLOW_ICON_COPY + '") center/contain no-repeat;mask:url("data:image/svg+xml,' + MC_FLOW_ICON_COPY + '") center/contain no-repeat}',
      F + ' .md-code-block>div:first-child button:active{background:var(--mc-fg);color:var(--mc-surface);border-color:var(--mc-fg)}',
      F + ' .md-table-wide{overflow-x:auto}',
      // §6:用户气泡(user/steering)+ 变量通道(原型 L483-497;气泡底色走 overrideTokens --dsw-specific-bubble)
      // 验收①:宿主气泡自带 padding(~10px 16px)未覆写 → 补 7px 12px(原型 L485)
      MC_MAP.bubbleUser + '{color:var(--mc-accent-ink);border:1px solid var(--mc-border);border-radius:8px;padding:7px 12px;font:400 14px/1.7 var(--font-ui)}',
      MC_MAP.bubbleUser + ':active{border-color:var(--mc-fg)}',
      MC_MAP.userGallery + '{border:1px solid var(--mc-border);border-radius:var(--mc-r-card)}',
      // 验收六轮:refChip 宿主 chip 覆写随用户行重写退役(McUserNodeView 自有 .mc-user-chip)
      // 六轮续:pending steering 重绘改观察器嫁接(见 skinPending)——结构位皮肤规则退役,
      // 只留 .mc-pending 虚线待定廓(嫁接标记)
      '.mc-pending{outline:1px dashed var(--mc-faint);outline-offset:2px;border-radius:8px}',
      // 验收七轮:注入条/压缩条/重试条 CSS 皮肤随 syscard 重绘退役(McSysCard 遮蔽 context/
      // compaction/manual-compaction/model-retry 四槽,自有 .mc-inject/.mc-comp/.mc-retry 类)——
      // 原 §7 虚线条 + 表单图标 + leading 槽清理 + §8 重试八角点/chevron 规则与 T4 压缩图标位一并下岗;
      // 行级出场 flashIn(观察器)对四 kind 照常供给
      // §8:细长条组(实线 soft 边;retry 已重绘移出,余 unknown 同款壳)
      ':is(' + MC_MAP.kindTurnMaxTokens + ',' + MC_MAP.kindUnknown + '){display:flex;align-items:center;gap:8px;padding:6px 9px;background:var(--mc-surface-2);border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card);font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}',
      MC_MAP.kindTurnError + '{display:flex;align-items:center;gap:8px;padding:6px 9px;background:var(--mc-surface-2);border-left:2px solid var(--mc-danger);border-radius:var(--mc-r-card);font:400 12px/1.6 var(--font-ui);color:var(--mc-danger)}',
      MC_MAP.kindTurnMaxTokens + '::before{content:"";flex:none;border-left:5px solid var(--mc-faint);border-top:4px solid transparent;border-bottom:4px solid transparent}',
      // §9:TurnStatus(宿主运行中状态行)
      MC_MAP.flowColumn + ' ' + MC_MAP.statusRow + '{display:flex;align-items:center;gap:8px;font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}',
      MC_MAP.flowColumn + ' ' + MC_MAP.statusRow + '::before{content:"";flex:none;width:6px;height:6px;background:var(--mc-spark);clip-path:polygon(33% 0,67% 0,100% 33%,100% 67%,67% 100%,33% 100%,0 67%,0 33%);animation:mc-pulse 2600ms steps(1,end) infinite;animation-delay:var(--pulse-delay,0ms)}',
      // 验收四轮:think 卡整体重写(McThink 遮蔽 assistant-step 槽,自有 .mc-think 类)——
      // 此前对宿主 ReasoningRow 的全部覆写(shimmer/sweep 压制、像素三角替换、摘要行
      // .mc-line-flash 观察器)一并退役;.mc-app-cover 保留供 McThinkCard 正文追加段复用
      '.mc-app-cover{color:transparent;background:#fff;background-image:repeating-linear-gradient(0deg,transparent 0 2px,rgba(0,0,0,.06) 2px 3px);border-radius:1px}',
      'html[data-theme="light"] .mc-app-cover{background:#000;background-image:repeating-linear-gradient(0deg,transparent 0 2px,rgba(255,255,255,.07) 2px 3px)}',
      // 验收七轮:压缩条图标位/leading 槽清理随 syscard 重绘退役(.mc-comp 自有图标)
      // §10:turn-tail 操作条(spec §4 行6;原型 L533-536)+ 钳形钮壳(只造壳不换宿主图标;
      // 后代选择器命中 .actions 容器内钮,data-slot 包装层不减后代深度)
      // 验收二轮④(live 探明):root 宿主为 column flex,原 align-items:center 会把 deliverables
      // 产物行(chain 槽注入的 .P4kPIW grid 行)水平居中 → 改 flex-start 靠左;actions 行自带
      // align-self:stretch(下条)不受影响
      MC_MAP.turnTailBar + '{display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap;padding-top:2px;font:500 11px/1.6 var(--font-mono);color:var(--mc-faint)}',
      // 验收三轮④:钮壳收窄到 actions 行(>div:last-child)——原后代 ' button' 误伤 chain 槽
      // 注入的产物文件钮(P4kPIW_file,宿主按文件名测宽),把长方形 chip 锁成 20×20 方块
      MC_MAP.turnTailBar + '>div:last-child button{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);background:var(--mc-surface);color:var(--mc-fg)}',
      MC_MAP.turnTailBar + '>div:last-child button:active{background:var(--mc-fg);color:var(--mc-surface);border-color:var(--mc-fg)}',
      // 验收三轮④:产物文件 chip——自然宽度按文件名长度(宿主 measure 探针同类复用本皮肤,
      // 测宽即所见),20px 高小长方块;超长名 220px 封顶截断;溢出标签 "+N 个文件" 同语汇
      MC_MAP.deliverRoot + ' ' + MC_MAP.deliverFile + '{display:inline-flex;align-items:center;height:24px;padding:0 8px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);background:var(--mc-surface);color:var(--mc-fg);font:500 13px/1.6 var(--font-mono)}',
      MC_MAP.deliverRoot + ' ' + MC_MAP.deliverFile + ':active{background:var(--mc-fg);color:var(--mc-surface);border-color:var(--mc-fg)}',
      MC_MAP.deliverRoot + ' ' + MC_MAP.deliverMore + '{display:inline-flex;align-items:center;height:20px;padding:0 7px;white-space:nowrap;border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-btn);background:var(--mc-surface-2);color:var(--mc-faint);font:500 11px/1.6 var(--font-mono)}',
      // 验收⑤(2026-08-31 live 探明):钮组靠左、统计常驻靠右——root[data-time-hover-root] 下
      // 统计 span(.actions 末子 timeEnd)宿主 opacity:0 hover 显隐 → opacity/visibility 反制
      // (裁定:此两属性允许作为对宿主动效反制)+transition:none 压平;DOM 序本就 [copy,extra
      // (contents),branch,time] time 末位。宿主 root 为 flex-direction:column(实测)→ actions
      // align-self:stretch 横向撑满(行向由 flex:1 兜底,方向无关),margin-left:auto 推右
      MC_MAP.turnTailBar + '>div:last-child{display:flex;align-items:center;gap:8px;flex:1;min-width:0;align-self:stretch}',
      MC_MAP.turnTailBar + '>div:last-child>span:last-child{margin-left:auto;flex:none;white-space:nowrap;opacity:1!important;visibility:visible!important;transition:none;font:500 11px/1.6 var(--font-mono);color:var(--mc-faint)}',
      // §11:command 三态卡壳(spec §4 行9;默认 border / running spark / error danger;
      // [data-variant="others"] 在 kindCommand 行内任意深度;细节留 toolcard 周期)
      MC_MAP.kindCommand + ' ' + MC_MAP.commandCard + '{background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:var(--mc-r-card);overflow:hidden}',
      MC_MAP.kindCommand + ' ' + MC_MAP.commandCard + MC_MAP.dataState + '"running"]{border-color:var(--mc-spark)}',
      MC_MAP.kindCommand + ' ' + MC_MAP.commandCard + MC_MAP.dataState + '"error"]{border-color:var(--mc-danger)}',
    ].join('\n');
  })(),
  mount: function (ctx) {
    // Task 7：MutationObserver 出场三拍 + syncAnim 相位同步管道（spec 2026-08-31）。
    // 一切延时走 CLOCK.next（audit：禁裸定时器直调）；REDUCED 用户零闪烁（类不加，内容照常）。
    if (typeof MutationObserver === 'undefined' || typeof CLOCK === 'undefined' || !CLOCK) return null;
    var REDUCED = false;
    try { REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var SYNC = [
      [MC_MAP.flowColumn + ' ' + MC_MAP.statusRow, '--pulse-delay', CLOCK.PULSE],
    ];
    // 验收七轮:折叠卡开合点击委托表整体退役——context/model-retry/双 compaction 四卡已由
    // McSysCard 重绘(自有 DOM,开合/状态切换在组件内走 lib accToggle);think 卡四轮起已自管。
    // click 委托/onHeadClick/offClick 一并下岗,观察器只剩出场 flashIn/相位同步/pending 嫁接
    // 验收六轮改版:手抄变体全部收编回库——开合走 lib accToggle、新行入场走 lib flashIn,
    // 协议唯一定义在 src/core/mcfx.js(t0 ghost→t100 flash→t200 fn→t300 同撤 flash+ghost→t400 滞空)。
    // 宿主卡 fn=空转+清残高——宿主 React 在捕获拍后自行瞬切,几何变化发生在白块遮盖下
    var mo = null, tries = 0, timer = null;
    var seen = new WeakSet();
    function syncEl(el) {
      for (var i = 0; i < SYNC.length; i++) { try {
        if (el.matches(SYNC[i][0])) CLOCK.syncAnim(el, SYNC[i][2], SYNC[i][1]);
        var qs = el.querySelectorAll(SYNC[i][0]);
        for (var j = 0; j < qs.length; j++) CLOCK.syncAnim(qs[j], SYNC[i][2], SYNC[i][1]);
      } catch (e) {} }
    }
    // 验收六轮:enterFlash 收编为 lib flashIn 空回调(show 在 ghost 遮罩下空转,拍3 撤净含 mcfx)
    function enterFlash(el) { flashIn(el, function () {}); }
    // 六轮续:pending steering 重绘(嫁接)——宿主收件箱直渲染 PendingSteeringBubble(L5877),
    // 无 keyed 槽可遮蔽 → 观察器把自有类直接嫁到宿主结构上,吃到与 McUserNodeView 同一套 CSS:
    // 行→.mc-user-row 栈→flex 右对齐 气泡→.mc-user-bubble 图集→.mc-user-attach 引用→.mc-user-ref,
    // 标记 .mc-pending(虚线待定廓,host data-pending-steering 保留作锚)。幂等:已嫁接即跳过
    function skinPending(el) {
      try {
        if (el.classList.contains('mc-user-row')) return;
        el.classList.add('mc-user-row', 'mc-pending');
        var stack = el.firstElementChild; // 宿主 userStack
        if (!stack) return;
        stack.style.display = 'flex';
        stack.style.flexDirection = 'column';
        stack.style.alignItems = 'flex-end';
        stack.style.gap = '6px';
        var bub = null;
        for (var c = stack.firstElementChild; c; c = c.nextElementSibling) {
          if (c.hasAttribute('data-align')) { c.classList.add('mc-user-attach'); continue; }
          if (!bub) { bub = c; c.classList.add('mc-user-bubble'); }
          else c.classList.add('mc-user-ref');
        }
        if (bub && !REDUCED) flashIn(bub, function () {});
      } catch (e) { /* 宿主结构漂移即回退官方样式,不破版 */ }
    }
    // 验收四轮:think 摘要/正文观察器(thinkStream/thinkBodyStream)随宿主 ReasoningRow 覆写
    // 一并退役——think 卡由 McThink 组件整体重写(缓冲积攒+周期吐出),不再需要 DOM 干预
    function enter(node) {
      if (!(node instanceof Element)) return;
      syncEl(node); // 相位同步不限 flowItem 本行：[role=status] 常为 flowColumn 直接子节点，
      // 新入节点全量试 SYNC 两选择器（syncAnim 幂等，重复触发只是相位刷新）
      // pending steering:直渲染节点(flowColumn 直接子节点,非 flowItem),命中即嫁接重绘
      try {
        if (node.matches(MC_MAP.pendingSteering)) skinPending(node);
        var pq = node.querySelectorAll(MC_MAP.pendingSteering);
        for (var pi = 0; pi < pq.length; pi++) skinPending(pq[pi]);
      } catch (e) {}
      var items = node.matches(MC_MAP.flowItem) ? [node] : [];
      try { var q = node.querySelectorAll(MC_MAP.flowItem); for (var i = 0; i < q.length; i++) items.push(q[i]); } catch (e) {}
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (seen.has(it)) continue; seen.add(it);
        syncEl(it);
        // 验收六轮:user/steering 行由 McUserNodeView 气泡自带 flashIn 出场——
        // flowItem 级整行白块(铺满左右)不再适用,跳过
        var mk = null; try { mk = it.getAttribute('data-chat-flow-kind'); } catch (e) {}
        if (!REDUCED && mk !== 'user' && mk !== 'steering') enterFlash(it);
      }
    }
    function attach() { // 验收三轮⑥ live 探明:切会话时宿主会整体替换 [data-chat-flow] 节点,
      // observer/click 绑列节点随会话切换失效——一律绑 document.body(稳定根;域限定
      // 由 MC_MAP 选择器在 matches 内完成,body 级观察回调轻量早退)
      var root = document.body;
      try { // 存量行标记不闪（历史加载）
        var q = root.querySelectorAll(MC_MAP.flowItem); for (var i = 0; i < q.length; i++) seen.add(q[i]);
      } catch (e) {}
      mo = new MutationObserver(function (muts) {
        try {
          for (var i = 0; i < muts.length; i++) {
            var m = muts[i];
            if (m.type === 'characterData') continue; // 文本变化观察已随 think 重写退役
            for (var j = 0; j < m.addedNodes.length; j++) {
              var n = m.addedNodes[j];
              if (n instanceof Element) enter(n);
            }
          }
        } catch (e) {}
      });
      mo.observe(root, { childList: true, subtree: true });
    }
    timer = CLOCK.next(function poll() { // flowColumn 晚挂载轮询（不再限次——boot 停在空会话
      // (hero 态无列)时 8s 上限会耗尽,之后切会话 observer 永不挂载;验收三轮⑥ live 复现。
      // 列出现即 attach(绑 body,不再依赖列节点存续);每拍一次 querySelector 开销可忽略)
      tries++;
      var root = null; try { root = document.querySelector(MC_MAP.flowColumn); } catch (e) {}
      if (root) { attach(); return; }
      timer = CLOCK.next(poll, 400);
    }, 400);
    return function teardown() {
      try { if (mo) mo.disconnect(); } catch (e) {}
      try { if (timer) CLOCK.clear(timer); } catch (e) {}
    };
  },
};

// src/conv/think.js —— assistant-step 节点重写（验收四轮：缓冲区 + 定期吐出）
// 镜像同步：本段与 client.js McThink 段手工同源维护（audit 直接扫描 client.js 全文）。
// 差异：MC_PRIM 经 typeof require 守卫获取（loader 域 require 为工厂参数;CJS 测试域同样可用,
// require 失败静默 null → slots 不注册）。
var MC_PRIM = null;
try { if (typeof require === 'function') MC_PRIM = require("@deepseek-ai/dsh-client-ui-primitives"); } catch (e) { MC_PRIM = null; }

// 协议 { css, slots(ctx) }。遮蔽 conversation.chat.node keyed 槽 'assistant-step'
// (priority:-1 同侧栏先例);reasoning 块走我们自己的 McThinkCard(原型 showThinking 状态机
// L1362-1450 的 React 版:text prop 增量先进缓冲,500ms 周期末摘要 s-in 只装本次新字
// (白块=span 宽=字宽,零测宽)+正文追加 mc-app-cover 行内白块,100ms 揭盖;text/image 块
// 复用宿主 primitives MarkdownText/renderMessageImages 保真)。primitives 缺席时不注册
// (宿主原生渲染兜底)。选择器零宿主锚——全部 .mc-think 自有类,audit §5 安全。
// CJS shim 供 mcThinkTick 纯函数测试(src 镜像;loader 域 module 为自有 boilerplate)。
function mcThinkTick(shown, text, cap) {
  // 追加前缀不符 = 宿主整段重写:从头再来(base='')
  var base = shown && text.slice(0, shown.length) === shown ? shown : '';
  var rest = text.slice(base.length);
  var take = rest.slice(0, cap);
  return { shown: base + take, delta: take, rewritten: shown !== '' && base === '' };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mcThinkTick };
}
const MC_THINK_CAP = 140; // 每周期最多吐出字符数(对齐原型 PER_TICK=28 token 的节奏量级)
const McThink = {
  css: [
    /* AssistantMarkdown 布局平移(Sxvs8a_root/body/stopped → mc-amd-*;typography 由
       McFlow 的 F 段(.md 全要素)在 flowItem 级供给) */
    '.mc-amd-root{flex-direction:column;display:flex}',
    '.mc-amd-body{flex-direction:column;gap:16px;display:flex}',
    '.mc-amd-stopped{align-self:flex-start;padding:0 6px;font-size:11px;line-height:18px;border-radius:var(--mc-r-btn);background:var(--mc-surface-2);color:var(--mc-muted)}',
    /* 用户/steering 行重写(验收六轮):原型 .msg.user .bubble L316-321 语汇;右对齐纵栈 */
    '.mc-user-row{display:flex;flex-direction:column;align-items:flex-end;gap:6px;max-width:100%}',
    '.mc-user-bubble{max-width:520px;padding:7px 12px;background:var(--mc-accent);color:var(--mc-accent-ink);border:1px solid var(--mc-border);border-radius:8px;font:400 14px/1.7 var(--font-ui);white-space:pre-wrap;word-break:break-word;text-align:left}',
    /* 六轮排查:宿主 MessageText 根结点自带 border+padding(_text_* 双边框元凶)——气泡内一律剥净 */
    '.mc-user-bubble>*{border:none!important;padding:0!important;margin:0!important;background:none!important}',
    '.mc-user-copy{flex:none;align-self:flex-end;border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);padding:1px 7px;background:var(--mc-surface-2);color:var(--mc-muted);font:500 10px/1.6 var(--font-mono);cursor:pointer}',
    '.mc-user-chip{border:1px solid var(--mc-border);border-radius:var(--mc-r-tag);padding:0 4px;background:var(--mc-accent-strong);font:500 12px var(--font-mono)}',
    '.mc-user-attach{max-width:360px;display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap}',
    '.mc-user-ref{font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}',
    /* 原型 .reasoning 段(interactive L339-366)平移,.mc-think 前缀 */
    '.mc-think{background:var(--mc-surface-3);border:1px solid var(--mc-border);border-radius:var(--mc-r-card);overflow:hidden}',
    '.mc-think.run{background:color-mix(in oklab,var(--mc-spark) 9%,var(--mc-surface-3))}',
    '.mc-think-head{display:flex;align-items:center;gap:6px;width:100%;padding:6px 9px;background:none;border:none;cursor:pointer;text-align:left;color:inherit}',
    '.mc-think-head .mc-think-tag{font:400 13px/1.3 \'FindersKeepers\',\'Fusion Pixel 12px monospaced zh\',\'Noto Sans SC\',monospace;letter-spacing:.03em;color:var(--mc-fg)}',
    '.mc-think.run .mc-think-head .mc-think-tag{color:var(--mc-spark)}',
    '.mc-think-head .mc-think-sum{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:400 12px/1.5 var(--font-ui);color:var(--mc-faint)}',
    /* 六轮:展开态正文已可见,顶栏摘要(及其闪烁刷新)隐藏;折叠回来再现(visibility 保占位,高度零抖动) */
    '.mc-think.open .mc-think-sum{visibility:hidden}',
    '.mc-think-head .mc-think-dur{font:500 10px/1.5 var(--font-mono);color:var(--mc-faint);flex:none}',
    '.mc-think-body{overflow:hidden;height:auto}',
    '.mc-think:not(.open) .mc-think-body{height:0}',
    '.mc-think-body .mc-think-txt{padding:2px 9px 9px 26px;font:400 12px/1.8 var(--font-ui);color:var(--mc-muted);white-space:pre-wrap}',
    '.mc-think.run .mc-think-txt .mc-app-cover{color:transparent}',
    /* 摘要行文字 A→B(验收七轮并拍改版):统一走 lib accToggle 五拍——
       t0 旧字透明(.mc-ghost+color:transparent) → t100 白块盖+文本瞬换新字
       (mcfx::after 随 span 宽) → t200 同撤两类新字显现 → t300 滞空(周期余量) */
    '.mc-think-head .mc-think-sum .s-in{position:relative}',
    '.mc-think-head .mc-think-sum .s-in.mc-ghost{color:transparent}',
  ].join('\n'),
  slots(ctx) {
    if (!MC_PRIM || typeof React === 'undefined') return; // primitives 缺席:不遮蔽,宿主原生渲染兜底
    const S = ctx.slots;
    if (!S || typeof S.register !== 'function' || typeof S.inject !== 'function') return;
    const h = React.createElement;
    const MarkdownText = MC_PRIM.MarkdownText;
    const JsonBlock = MC_PRIM.JsonBlock;

    /* —— McThinkCard:缓冲积攒 + 周期吐出(原型 showThinking 状态机) ——
       摘要文字 A→B 与 running→完成 换形统一走 lib accToggle(验收六轮改版):
       t0 旧字/旧形透明 → t100 白块盖 → t200 瞬换 → t300 同撤两类 → t400 滞空 */
    function McThinkCard(props) {
      var text = props.text || '', running = !!props.running;
      var st = React.useRef({ committed: '', pending: '', sum: '', open: false, timer: null, mounted: true, wasRunning: false });
      st.current.text = text;
      var cardRef = React.useRef(null);
      var sumRef = React.useRef(null);
      var version = React.useState(0), setV = version[1];
      function paint() { setV(function (x) { return x + 1; }); }
      function tick() {
        var s = st.current;
        if (!s.mounted || !s.running) return;
        var r = mcThinkTick(s.committed, s.text, MC_THINK_CAP);
        if (r.delta) {
          // 原型帧 B/A 协议 + 六轮统一节拍:正文与摘要同一条时间轴——
          // t0 白块(pending 尾段)与摘要 ghost 同拍出现,t300 与摘要同拍揭开(零高度抽搐,刷新规律一致)
          s.committed = r.shown;
          s.pending = r.delta;
          paint();
          var spanEl = sumRef.current;
          var swap = function () { s.sum = r.delta.replace(/\n/g, ' '); paint(); };
          if (spanEl) accToggle(spanEl, swap); else swap();
          CLOCK.next(function () { // t300 揭盖:与摘要 accToggle 拍3(同撤 flash+ghost)同步(八轮五拍)
            var s6 = st.current; if (!s6.mounted) return;
            s6.pending = ''; paint();
          }, 300);
        }
        s.timer = CLOCK.next(tick, 700); // accToggle 五拍 500ms + 滞空 200ms(文本驻留可读)
      }
      React.useEffect(function () {
        var s = st.current; s.mounted = true;
        return function () { s.mounted = false; if (s.timer) { try { CLOCK.clear(s.timer); } catch (e) {} } };
      }, []);
      React.useEffect(function () {
        var s = st.current;
        var wasRunning = s.wasRunning; s.wasRunning = running;
        s.running = running;
        if (running) {
          if (!s.timer) s.timer = CLOCK.next(tick, 200);
        } else {
          if (s.timer) { try { CLOCK.clear(s.timer); } catch (e) {} s.timer = null; }
          // 六轮改版:running→完成 属「形 A→形 B」状态切换,统一走 accToggle(白块盖住期间定格);
          // 历史存量卡首挂不闪
          var settle = function () {
            s.committed = text; s.pending = ''; s.sum = text ? (text.length > 26 ? text.slice(0, 26) + '…' : text) : '';
            paint();
          };
          if (wasRunning && cardRef.current) accToggle(cardRef.current, settle);
          else settle();
        }
      }, [running]);
      function toggleCard() {
        var card = cardRef.current; if (!card) return;
        accToggle(card, function () { st.current.open = !st.current.open; paint(); });
      }
      var s = st.current;
      return h('div', { className: 'mc-think' + (running ? ' run' : '') + (s.open ? ' open' : ''), ref: cardRef },
        h('button', { className: 'mc-think-head', type: 'button', onClick: toggleCard },
          h('svg', { className: 'mc-tri' + (s.open ? ' open' : ''), 'aria-hidden': true }, h('use', { href: '#i-tri' })),
          h('span', { className: 'mc-think-tag' }, 'Think'),
          h('span', { className: 'mc-think-sum' },
            h('span', { className: 's-in', ref: sumRef }, running ? (s.sum || '正在思考…') : s.sum)),
          h('span', { className: 'mc-think-dur' }, running ? 'streaming' : '')),
        h('div', { className: 'mc-think-body' },
          h('div', { className: 'mc-think-txt' },
            (s.pending && s.committed.slice(-s.pending.length) === s.pending) ? s.committed.slice(0, s.committed.length - s.pending.length) : s.committed,
            s.pending ? h('span', { className: 'mc-app-cover' }, s.pending) : null)));
    }

    /* —— McAssistantNodeView:AssistantMarkdown 平移(L9476-9537) ——
       text→MarkdownText(宿主保真)/reasoning→McThinkCard/image→renderMessageImages/
       tool-call→跳过/其他→JsonBlock;mentions 复刻 owner 判定(useTurnData 可选)。 */
    function McAssistantNodeView(props) {
      var node = props.node, data = (node && node.data) || {};
      var blocks = data.blocks || [];
      var streaming = data.status === 'running';
      var interrupted = data.status === 'interrupted';
      var renderMessageImages = props.renderMessageImages, fileMentions = props.fileMentions;
      var useTurnData = props.useTurnData, openFile = props.openFile;
      var tail = useTurnData ? useTurnData('turn-tail') : undefined;
      var turn = node && (node.location.kind === 'turn' || node.location.kind === 'step') ? node.location.turn : undefined;
      var mentions = React.useMemo(function () {
        try {
          if (turn === undefined || (turn && turn.status) !== 'closed' || data.finalNode === undefined) return undefined;
          if (tail && tail.closing && tail.closing.finalNode && tail.closing.finalNode.seq !== data.finalNode.seq) return undefined;
          return fileMentions({ turn: turn, seq: data.finalNode.seq, openFile: openFile });
        } catch (e) { return undefined; }
      }, [tail, turn, data.finalNode, openFile]);
      if (!(streaming || interrupted === true || blocks.some(function (b) { return b.kind !== 'tool-call'; }))) return null;
      var codeLabels = { copyLabel: '复制', copiedLabel: '已复制' };
      var rendered = [];
      var last = blocks.length - 1;
      for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        if (block === undefined) continue;
        if (block.kind === 'text') {
          rendered.push(h(MarkdownText, { key: i, text: block.text, streaming: streaming, codeLabels: codeLabels, fileMentions: mentions }));
        } else if (block.kind === 'reasoning') {
          rendered.push(h(McThinkCard, { key: i, text: block.text, running: streaming && i === last }));
        } else if (block.kind === 'image') {
          var start = i, group = [block];
          while (i + 1 < blocks.length) {
            var next = blocks[i + 1];
            if (next === undefined || next.kind !== 'image') break;
            group.push(next); i += 1;
          }
          rendered.push(h(React.Fragment, { key: start }, renderMessageImages({ images: group.map(function (g) { return { attachment: g.attachment }; }), align: 'start' })));
        } else if (block.kind !== 'tool-call') {
          rendered.push(h(JsonBlock, { key: i, label: 'unknown', payload: block.block }));
        }
      }
      return h('div', { className: 'mc-amd-root', 'data-streaming': streaming || undefined },
        h('div', { className: 'mc-amd-body' }, rendered,
          interrupted ? h('span', { className: 'mc-amd-stopped' }, '已停止') : null));
    }

    ctx.effect(() => S.inject('conversation.chat.node', () => S.register({
      name: 'conversation.chat.node',
      key: 'assistant-step',
      priority: -1,
      registrant: 'macintosh',
    }, McAssistantNodeView)));

    /* —— McUserNodeView:用户/steering 行重写(验收六轮)——
       官方 UserMessageNodeView(L5393-5408)平移:content 块拆 text/images/rest;气泡为
       自有 .mc-user-bubble(原型 .msg.user .bubble L318-321 语汇),出场走 lib flashIn
       挂在气泡自身——白块=inset:0=气泡面积,不再整行铺白(此前观察器挂 flowItem 之弊);
       @引用//命令 chip 为自有 .mc-user-chip 类(audit §5 安全)。 */
    function mcProjectUserText(h, MessageText, text, referenceLabels) {
      var ranges = [];
      var labels = [];
      try { labels = Array.from(new Set(referenceLabels || [])).sort(function (a, b) { return b.length - a.length; }); } catch (e) {}
      for (var li = 0; li < labels.length; li++) {
        var lab = '@' + labels[li], st2 = text.indexOf(lab);
        while (st2 >= 0) { ranges.push({ start: st2, end: st2 + lab.length, label: lab, kind: 'session' }); st2 = text.indexOf(lab, st2 + lab.length); }
      }
      var re = /(^|\s)(\/[\w-]+|@"[^"\n]+"|@[^\s]+)/gu, m;
      while ((m = re.exec(text)) !== null) {
        var ts = m.index + (m[1] ? m[1].length : 0);
        var raw = m[2] || '';
        var lab2 = raw.indexOf('@"') === 0 ? raw : raw.replace(/[.,;:!?，。；：！？]+$/gu, '');
        if (lab2.length <= 1) continue;
        ranges.push({ start: ts, end: ts + lab2.length, label: lab2, kind: 'plain' });
      }
      ranges.sort(function (a, b) { return a.start - b.start || (a.kind === b.kind ? b.end - a.end : a.kind === 'session' ? -1 : 1); });
      var parts = [], cur = 0;
      for (var i = 0; i < ranges.length; i++) {
        var r = ranges[i];
        if (r.start < cur) continue;
        var kind = r.kind === 'session' ? 'session' : r.label.indexOf('@') === 0 ? (r.label.slice(-1) === '/' ? 'folder' : 'file') : 'skill';
        if (r.start > cur) parts.push(h(MessageText, { key: 't' + cur, text: text.slice(cur, r.start) }));
        parts.push(h('span', { key: 'c' + r.start, className: 'mc-user-chip', title: r.label }, r.label));
        cur = r.end;
      }
      if (!parts.length) return h(MessageText, { text: text });
      if (cur < text.length) parts.push(h(MessageText, { key: 't' + cur, text: text.slice(cur) }));
      return h(React.Fragment, null, parts);
    }
    function McUserNodeView(props) {
      var node = props.node, data = (node && node.data) || {};
      var renderMessageImages = props.renderMessageImages;
      var MessageText = MC_PRIM.MessageText;
      var texts = [], images = [], rest = [];
      var content = data.content || [];
      for (var i = 0; i < content.length; i++) {
        var b = content[i];
        if (b && b.type === 'text' && typeof b.text === 'string') texts.push(b.text);
        else if (b && b.type === 'image' && b.attachment !== undefined) images.push({ attachment: b.attachment });
        else rest.push(b);
      }
      var text = texts.join('');
      var bubbleRef = React.useRef(null);
      React.useEffect(function () { // 出场:气泡自身三拍(ghost→白块→显现),白块面积=气泡
        var el = bubbleRef.current;
        if (el) flashIn(el, function () {});
      }, []);
      var refs = data.referenceLabels;
      var copied = React.useState(false), setCopied = copied[1];
      function doCopy() { // 六轮:复制钮(用户输入内容可一键复制;反馈回落走 CLOCK)
        try { navigator.clipboard.writeText(text); } catch (e) {}
        setCopied(true);
        CLOCK.next(function () { setCopied(false); }, 1200);
      }
      return h('div', { className: 'mc-user-row' },
        images.length ? h('div', { className: 'mc-user-attach' }, renderMessageImages({ images: images, align: 'end' })) : null,
        (text !== '' || rest.length) ? h('div', { className: 'mc-user-bubble', ref: bubbleRef },
          mcProjectUserText(h, MessageText, text, refs),
          rest.map(function (b2, j) { return h(JsonBlock, { key: 'r' + j, label: 'extra', payload: b2 }); })) : null,
        text !== '' ? h('button', { className: 'mc-user-copy', type: 'button', onClick: doCopy }, copied[0] ? '已复制' : '复制') : null,
        refs && refs.length ? h('div', { className: 'mc-user-ref' }, '引用 · ' + refs.join(' · ')) : null);
    }
    ctx.effect(() => S.inject('conversation.chat.node', () => S.register({
      name: 'conversation.chat.node',
      key: 'user',
      priority: -1,
      registrant: 'macintosh',
    }, McUserNodeView)));
    ctx.effect(() => S.inject('conversation.chat.node', () => S.register({
      name: 'conversation.chat.node',
      key: 'steering',
      priority: -1,
      registrant: 'macintosh',
    }, McUserNodeView)));
  },
};

// src/conv/syscard.js —— 系统卡四族重写（验收七轮：上下文注入 / 自动·手动压缩 / 模型重试）
// 镜像同步：本段与 client.js McSysCard 段手工同源维护（audit 直接扫描 client.js 全文）。
// 协议 { css, slots(ctx) }。遮蔽 conversation.chat.node keyed 槽 'context' / 'compaction' /
// 'manual-compaction' / 'model-retry'（priority:-1 同 user/assistant-step 先例）——宿主卡整体
// 替换为自有 DOM（真·重绘，非 CSS 套壳）；primitives 缺席时不注册（宿主原生渲染兜底）。
// 动效纪律（验收六轮改版沿用）：出场 = flowItem 行级 flashIn（McFlow 观察器供给）；折叠开合与
// 状态切换（压缩中→已压缩 / 重试 scheduled→started·cancelled）= lib accToggle 五拍，文字 A→B
// 挂 .s-in span（ghost 拍 color:transparent，白块随 span 宽）；REDUCED 全跳过功能不受影响。
// 纯函数经 CJS 兼容出口供测试 createRequire 使用。
var MC_SYS_PRIM = null;
try { if (typeof require === 'function') MC_SYS_PRIM = require("@deepseek-ai/dsh-client-ui-primitives"); } catch (e) { MC_SYS_PRIM = null; }

// 图标位 data-URI（与 McFlow 注入条四型同款；本段自持副本保持自包含，避免拼接顺序耦合）
const MC_SYS_ICON_DOC = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 10'%3E%3Cpath fill='%23000' fill-rule='evenodd' clip-rule='evenodd' d='M0 0H6V1H8V10H0V0ZM7 3H5V1H1V9H7V3Z'/%3E%3Cpath fill='%23000' d='M5 1H1V9H7V3H5V1Z'/%3E%3C/svg%3E";
const MC_SYS_ICON_LIST = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M2 5h20v14H2V5zm2 2v2h16V7H4zm16 4H4v2h16v-2zm0 4H4v2h16v-2z'/%3E%3C/svg%3E";
const MC_SYS_ICON_COPY = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M4 2h11v2H6v13H4V2zm4 4h12v16H8V6zm2 2v12h8V8h-8z'/%3E%3C/svg%3E";
const MC_SYS_ICON_CLOCK = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M19 3H5v2H3v14h2v2h14v-2h2V5h-2V3zm0 2v14H5V5h14zm-8 2h2v6h4v2h-6V7z'/%3E%3C/svg%3E";

// —— 纯函数（测试出口）——
// 压缩条一行摘要：全空 = 压缩进行中；双计数 = 完成语；有摘要无计数 = 展开提示；余 = 不可用/命令文案
function mcCompactionLine(summary, items, tokens, fallback) {
  if (items === null && tokens === null) return fallback ? String(fallback) : '正在压缩…';
  if (items !== null && tokens !== null) return '已压缩 ' + items + ' 条历史记录（约 ' + tokens + ' tokens）';
  return fallback ? String(fallback) : '压缩摘要不可用';
}
// 重试卡文案三件：active（=scheduled，八角点脉冲）+ 标签 + 上限（normal=数字 / 其余=∞）
function mcRetryParts(cur) {
  var state = cur ? cur.retryState : '';
  var active = state === 'scheduled';
  var label = active ? '正在重试模型请求'
    : state === 'cancelled' ? '模型请求重试已取消'
    : state === 'started' ? '已重试模型请求'
    : '等待重试模型请求';
  var maximum = cur && cur.mode === 'normal' ? cur.maxRetries : '∞';
  return { active: active, label: label, maximum: maximum };
}
// 上下文注入正文：文本块按模型所见顺序连缀（相邻无分隔），超 cap 截断；非文本块另册走 JsonBlock
function mcContextText(content, cap) {
  var out = '';
  try {
    var blocks = content || [];
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      if (b && b.type === 'text' && typeof b.text === 'string') out += b.text;
      if (out.length >= cap) return out.slice(0, cap) + '…';
    }
  } catch (e) { /* 结构漂移 → 空正文，条头照常 */ }
  return out;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mcCompactionLine, mcRetryParts, mcContextText };
}

const MC_SYS_TEXT_CAP = 20000; // 宿主 ModelFacingContent 同款上界（20k chars）

const McSysCard = {
  css: [
    /* —— 注入条（context）：虚线壳 + 表单图标；head 全宽按钮，body 折叠 height:0 —— */
    '.mc-inject-head{display:flex;align-items:center;gap:7px;box-sizing:border-box;width:100%;padding:7px 9px;background:var(--mc-surface-2);border:1px dashed var(--mc-border-soft);border-radius:var(--mc-r-card);font:400 12px/1.7 var(--font-ui);color:var(--mc-muted);cursor:pointer;text-align:left}',
    '.mc-inject-head::before{content:"";flex:none;width:15px;height:15px;background-color:var(--mc-faint);-webkit-mask:url("data:image/svg+xml,' + MC_SYS_ICON_DOC + '") center/contain no-repeat;mask:url("data:image/svg+xml,' + MC_SYS_ICON_DOC + '") center/contain no-repeat}',
    '.mc-inject[data-mc-form="catalog"] .mc-inject-head::before{-webkit-mask-image:url("data:image/svg+xml,' + MC_SYS_ICON_LIST + '");mask-image:url("data:image/svg+xml,' + MC_SYS_ICON_LIST + '")}',
    '.mc-inject[data-mc-form="snapshot"] .mc-inject-head::before{-webkit-mask-image:url("data:image/svg+xml,' + MC_SYS_ICON_COPY + '");mask-image:url("data:image/svg+xml,' + MC_SYS_ICON_COPY + '")}',
    '.mc-inject[data-mc-form="recall"] .mc-inject-head::before,.mc-inject[data-mc-role="recall"] .mc-inject-head::before{-webkit-mask-image:url("data:image/svg+xml,' + MC_SYS_ICON_CLOCK + '");mask-image:url("data:image/svg+xml,' + MC_SYS_ICON_CLOCK + '")}',
    '.mc-inject-head .mc-tri{flex:none;width:8px;height:8px;color:var(--mc-faint);transition:none}',
    '.mc-inject-src{flex:none;max-width:40%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--mc-faint)}',
    '.mc-inject-sum{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--mc-faint)}',
    '.mc-inject-body{height:0;overflow:hidden}',
    '.mc-inject.open .mc-inject-body{height:auto}',
    '.mc-inject-body-in{padding:4px 9px 8px 24px;font:400 12px/1.7 var(--font-ui);color:var(--mc-muted);white-space:pre-wrap;word-break:break-word}',
    /* —— 压缩条（compaction / manual-compaction）：同注入条语汇 + copy 图标；摘要文字 A→B 走 .s-in —— */
    '.mc-comp-head{display:flex;align-items:center;gap:7px;box-sizing:border-box;width:100%;padding:7px 9px;background:var(--mc-surface-2);border:1px dashed var(--mc-border-soft);border-radius:var(--mc-r-card);font:400 12px/1.7 var(--font-ui);color:var(--mc-muted);cursor:pointer;text-align:left}',
    '.mc-comp-head::before{content:"";flex:none;width:15px;height:15px;background-color:var(--mc-faint);-webkit-mask:url("data:image/svg+xml,' + MC_SYS_ICON_COPY + '") center/contain no-repeat;mask:url("data:image/svg+xml,' + MC_SYS_ICON_COPY + '") center/contain no-repeat}',
    '.mc-comp-head[disabled]{cursor:default}',
    '.mc-comp-head .mc-tri{flex:none;width:8px;height:8px;color:var(--mc-faint);transition:none}',
    '.mc-comp-sum{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.mc-comp-sum .s-in{position:relative}',
    '.mc-comp-sum .s-in.mc-ghost{color:transparent}',
    '.mc-comp-body{height:0;overflow:hidden}',
    '.mc-comp.open .mc-comp-body{height:auto}',
    '.mc-comp-body-in{padding:2px 9px 9px 26px;font:400 12px/1.8 var(--font-ui);color:var(--mc-muted)}',
    /* —— 重试条（model-retry）：实线 soft 壳 + 八角点（scheduled 脉冲）；状态文字 A→B 走 .s-in —— */
    '.mc-retry-head{display:flex;align-items:center;gap:8px;box-sizing:border-box;width:100%;padding:6px 9px;background:var(--mc-surface-2);border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card);font:400 12px/1.6 var(--font-ui);color:var(--mc-muted);cursor:pointer;text-align:left}',
    '.mc-retry-dot{flex:none;width:6px;height:6px;background:var(--mc-spark);clip-path:polygon(33% 0,67% 0,100% 33%,100% 67%,67% 100%,33% 100%,0 67%,0 33%)}',
    '.mc-retry.run .mc-retry-dot{animation:mc-pulse 2600ms steps(1,end) infinite;animation-delay:var(--pulse-delay,0ms)}',
    '.mc-retry-txt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.mc-retry-txt .s-in{position:relative}',
    '.mc-retry-txt .s-in.mc-ghost{color:transparent}',
    '.mc-retry-head .mc-tri{flex:none;width:8px;height:8px;color:var(--mc-faint);transition:none}',
    '.mc-retry-body{height:0;overflow:hidden}',
    '.mc-retry.open .mc-retry-body{height:auto}',
    '.mc-retry-body-in{display:flex;flex-direction:column;gap:2px;padding:4px 9px 8px 23px;font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}',
    '.mc-retry-body-in b{font-weight:500;color:var(--mc-faint)}',
    '.mc-inject-tt,.mc-comp-tt{flex:none;white-space:nowrap}',
  ].join('\n'),
  slots(ctx) {
    if (!MC_SYS_PRIM || typeof React === 'undefined') return; // primitives 缺席:不遮蔽,宿主原生渲染兜底
    const S = ctx.slots;
    if (!S || typeof S.register !== 'function' || typeof S.inject !== 'function') return;
    const h = React.createElement;
    const MarkdownText = MC_SYS_PRIM.MarkdownText;
    const JsonBlock = MC_SYS_PRIM.JsonBlock;
    let REDUCED = false;
    try { REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    // 持值切换：props 变化不在提交拍直出，而是包进 accToggle 五拍（t100 白块遮盖的同时瞬变）；
    // busy 期间到的新值直接落地（accToggle 防重入会吞 fn —— 不丢更新优先）；REDUCED 直出
    function mcSwap(el, apply) {
      if (REDUCED || !el || !el.isConnected || (el.dataset && el.dataset.busy)) { apply(); return; }
      accToggle(el, apply);
    }
    // 折叠开合（卡头点击）：REDUCED/busy 直翻，否则五拍（几何变化发生在白块遮盖下）
    function mcFold(card, flip) {
      if (!card) { flip(); return; }
      if (REDUCED || (card.dataset && card.dataset.busy)) { flip(); return; }
      accToggle(card, flip);
    }

    /* —— McContextNodeView：上下文注入条（keyed 'context'）——
       条头 = 表单图标 + 标题（跨会话召回/上下文注入）+ 来源 label + notice 摘要；
       展开体 = 文本块连缀（模型所见顺序，20k 截断）+ 非文本块 JsonBlock。 */
    function McContextNodeView(props) {
      var node = props.node, data = (node && node.data) || {};
      var prov = data.provenance || {};
      var role = prov.role || '';
      var form = data.form || '';
      var notice = '';
      try { var sm = (data.source || {}).summary; if (typeof sm === 'string' && sm) notice = sm; } catch (e) {}
      var rest = [];
      try {
        var blocks = data.content || [];
        for (var i = 0; i < blocks.length; i++) if (!(blocks[i] && blocks[i].type === 'text')) rest.push(blocks[i]);
      } catch (e) {}
      var st = React.useRef({ open: false });
      var cardRef = React.useRef(null);
      var v = React.useState(0), setV = v[1];
      function toggle() {
        var card = cardRef.current;
        mcFold(card, function () { st.current.open = !st.current.open; setV(function (x) { return x + 1; }); });
      }
      return h('div', { className: 'mc-inject' + (st.current.open ? ' open' : ''), ref: cardRef, 'data-mc-form': form, 'data-mc-role': role },
        h('button', { className: 'mc-inject-head', type: 'button', onClick: toggle, 'aria-expanded': st.current.open ? 'true' : 'false' },
          h('span', { className: 'mc-inject-tt' }, role === 'recall' ? '跨会话召回' : '上下文注入'),
          prov.label ? h('span', { className: 'mc-inject-src' }, String(prov.label)) : null,
          notice ? h('span', { className: 'mc-inject-sum' }, notice) : null,
          h('svg', { className: 'mc-tri' + (st.current.open ? ' open' : ''), 'aria-hidden': true }, h('use', { href: '#i-tri' }))),
        h('div', { className: 'mc-inject-body' },
          h('div', { className: 'mc-inject-body-in' },
            mcContextText(data.content, MC_SYS_TEXT_CAP),
            rest.map(function (b, j) { return h(JsonBlock, { key: 'r' + j, label: 'extra', payload: b }); }))));
    }

    /* —— McCompactionBar：压缩条共用体（自动 compaction / 手动 manual-compaction）——
       摘要行文字 A→B（正在压缩…→已压缩 N 条…）走 .s-in accToggle；折叠体 = 摘要 markdown。 */
    function McCompactionBar(props) {
      var d = props.node || {};
      var summary = d.summary == null ? null : String(d.summary);
      var items = d.shadowedItemCount == null ? null : d.shadowedItemCount;
      var tokens = d.shadowedTokenCount == null ? null : d.shadowedTokenCount;
      var fallback = props.fallback || '';
      var line = mcCompactionLine(summary, items, tokens, fallback);
      var expandable = summary !== null;
      var st = React.useRef({ open: false, line: line, mounted: true });
      var cardRef = React.useRef(null);
      var inRef = React.useRef(null);
      var v = React.useState(0), setV = v[1];
      React.useEffect(function () { st.current.mounted = true; return function () { st.current.mounted = false; }; }, []);
      React.useEffect(function () { // 状态切换（验收六轮裁定）：压缩中→完成 文字换形走五拍
        var s = st.current;
        if (s.line === line) return;
        var apply = function () { s.line = line; if (s.mounted) setV(function (x) { return x + 1; }); };
        mcSwap(inRef.current, apply);
      }, [line]);
      function toggle() {
        if (!expandable) return;
        var card = cardRef.current;
        mcFold(card, function () { st.current.open = !st.current.open; setV(function (x) { return x + 1; }); });
      }
      return h('div', { className: 'mc-comp' + (st.current.open ? ' open' : ''), ref: cardRef },
        h('button', { className: 'mc-comp-head', type: 'button', onClick: toggle, disabled: !expandable, 'aria-expanded': expandable ? (st.current.open ? 'true' : 'false') : undefined },
          h('span', { className: 'mc-comp-tt' }, props.title || '上下文已压缩'),
          h('span', { className: 'mc-comp-sum' }, h('span', { className: 's-in', ref: inRef }, st.current.line)),
          expandable ? h('svg', { className: 'mc-tri' + (st.current.open ? ' open' : ''), 'aria-hidden': true }, h('use', { href: '#i-tri' })) : null),
        h('div', { className: 'mc-comp-body' },
          h('div', { className: 'mc-comp-body-in' }, expandable ? h(MarkdownText, { text: summary }) : null)));
    }

    function McCompactionNodeView(props) {
      var node = props.node;
      return h(McCompactionBar, { node: (node && node.data) || {}, title: '上下文已压缩' });
    }

    /* 手动 /compact：压缩事务落定前 = compact · 正在压缩…；落定后与自动卡同款（fallback=命令文案） */
    function McManualCompactionNodeView(props) {
      var data = (props.node && props.node.data) || {};
      var command = data.command || {};
      var fallback = '';
      try { if (command.outcome && typeof command.outcome.text === 'string') fallback = command.outcome.text; } catch (e) {}
      return h(McCompactionBar, {
        node: data.compaction || { summary: null, shadowedItemCount: null, shadowedTokenCount: null },
        title: 'compact', fallback: fallback || '',
      });
    }

    /* —— McRetryNodeView：模型重试条（keyed 'model-retry'）——
       八角点 scheduled 脉冲（相位 CLOCK.syncAnim 注入）；状态文字 A→B（scheduled→started/
       cancelled）走 .s-in accToggle；倒计时 CLOCK 1s 栅格递减；详情折叠 = 延迟 + 失败原因。 */
    function McRetryNodeView(props) {
      var data = (props.node && props.node.data) || {};
      var cur = data.current || {};
      var parts = mcRetryParts(cur);
      var active = parts.active;
      var maximum = parts.maximum;
      var st = React.useRef({ open: false, label: parts.label, retry: cur.retry, mounted: true });
      var cardRef = React.useRef(null);
      var txtRef = React.useRef(null);
      var dotRef = React.useRef(null);
      var v = React.useState(0), setV = v[1];
      var secState = React.useState(Math.max(1, Math.ceil((cur.delayMs || 0) / 1000)));
      var sec = secState[0], setSec = secState[1];
      React.useEffect(function () { st.current.mounted = true; return function () { st.current.mounted = false; }; }, []);
      React.useEffect(function () { // 八角点相位（与主流程脉冲同栅格不交错）
        try { if (dotRef.current && CLOCK && typeof CLOCK.syncAnim === 'function') CLOCK.syncAnim(dotRef.current, CLOCK.PULSE, '--pulse-delay'); } catch (e) {}
      }, []);
      var stateKey = parts.label + '/' + cur.retry + '/' + maximum;
      React.useEffect(function () { // 状态切换：等待中→重试中/已重试/已取消 文字换形走五拍
        var prev = st.current.stateKey;
        st.current.stateKey = stateKey;
        if (prev === undefined) return; // 首挂不闪（历史存量卡）
        if (prev === stateKey) return;
        var apply = function () { st.current.label = parts.label; st.current.retry = cur.retry; st.current.maximum = maximum; if (st.current.mounted) setV(function (x) { return x + 1; }); };
        mcSwap(txtRef.current, apply);
      }, [stateKey]);
      React.useEffect(function () { // 倒计时：active 每秒递减到 1 停；非 active 静态展示
        var total = Math.max(1, Math.ceil((cur.delayMs || 0) / 1000));
        setSec(total);
        if (!active) return;
        var left = total, timer = null;
        var step = function () {
          left -= 1;
          if (left < 1) { setSec(1); return; }
          setSec(left);
          timer = CLOCK.next(step, 1000);
        };
        timer = CLOCK.next(step, 1000);
        return function () { if (timer) { try { CLOCK.clear(timer); } catch (e) {} } };
      }, [active, cur.seq, cur.delayMs]);
      function toggle() {
        var card = cardRef.current;
        mcFold(card, function () { st.current.open = !st.current.open; setV(function (x) { return x + 1; }); });
      }
      return h('div', { className: 'mc-retry' + (active ? ' run' : '') + (st.current.open ? ' open' : ''), ref: cardRef },
        h('button', { className: 'mc-retry-head', type: 'button', onClick: toggle, 'aria-expanded': st.current.open ? 'true' : 'false' },
          h('span', { className: 'mc-retry-dot', ref: dotRef }),
          h('span', { className: 'mc-retry-txt' },
            h('span', { className: 's-in', ref: txtRef }, st.current.label + '（' + st.current.retry + '/' + st.current.maximum + '） · ' + sec + 's')),
          h('svg', { className: 'mc-tri' + (st.current.open ? ' open' : ''), 'aria-hidden': true }, h('use', { href: '#i-tri' }))),
        h('div', { className: 'mc-retry-body' },
          h('div', { className: 'mc-retry-body-in' },
            h('div', null, h('b', null, '重试延迟：'), Math.round(cur.delayMs || 0) + 'ms'),
            h('div', null, h('b', null, '失败原因：'), (cur.failure && cur.failure.message) || '—'))));
    }

    ctx.effect(() => S.inject('conversation.chat.node', () => S.register({
      name: 'conversation.chat.node', key: 'context', priority: -1, registrant: 'macintosh',
    }, McContextNodeView)));
    ctx.effect(() => S.inject('conversation.chat.node', () => S.register({
      name: 'conversation.chat.node', key: 'compaction', priority: -1, registrant: 'macintosh',
    }, McCompactionNodeView)));
    ctx.effect(() => S.inject('conversation.chat.node', () => S.register({
      name: 'conversation.chat.node', key: 'manual-compaction', priority: -1, registrant: 'macintosh',
    }, McManualCompactionNodeView)));
    ctx.effect(() => S.inject('conversation.chat.node', () => S.register({
      name: 'conversation.chat.node', key: 'model-retry', priority: -1, registrant: 'macintosh',
    }, McRetryNodeView)));
  },
};

// src/conv/dock.js —— 输入坞体系(spec 2026-09-01 dock 批,B 路线全自绘+镜像驱动桥)
// 协议 { css, mount(ctx) }。自绘坞挂官方 composer 席位;官方卡经 html[data-mc-dock-on] 属性门控藏匿。
// 原语(原型 §6 L554-703 直抄;token 换 --mc-*;全部 scoped 到 [data-mc-dock])
const MC_DOCK_CSS = [
  // (藏匿门控规则 Task 4 追加:html[data-mc-dock-on] + MC_MAP.composerHide → display:none!important;骨架期零行为)
  '[data-mc-dock]{flex:none;display:flex;flex-direction:column;gap:8px;padding:10px 12px;background:var(--mc-rail-2);',
  ' border-top:1px solid var(--mc-border)}',
  '[data-mc-dock] .queue-row{display:flex;align-items:center;gap:8px;padding:5px 9px;',
  ' background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:var(--mc-r-card);',
  ' font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}',
  '[data-mc-dock] .queue-row svg{width:13px;height:13px;flex:none;color:var(--mc-spark)}',
  '[data-mc-dock] .todo-bar{flex:1;height:8px;background:var(--mc-surface-3);',
  ' border:1px solid var(--mc-border);padding:1px;display:flex;gap:1px}',
  '[data-mc-dock] .todo-bar i{flex:1;background:var(--mc-surface-2)}',
  '[data-mc-dock] .todo-bar.mc-ghost{background:transparent;border-color:transparent}',
  '[data-mc-dock] .todo-bar i.done{background:var(--mc-success)}',
  '[data-mc-dock] .todo-bar i.now{background:var(--mc-spark)}',
  '[data-mc-dock] .todo-meta{font:500 10px/1.6 var(--font-mono);color:var(--mc-faint);white-space:nowrap}',
  '[data-mc-dock] .todo-acc{background:var(--mc-surface);border:1px solid var(--mc-border);',
  ' border-radius:var(--mc-r-card);box-shadow:var(--mc-shadow-panel);overflow:hidden;position:relative}',
  '[data-mc-dock] .todo-acc-head{display:flex;align-items:center;gap:8px;width:100%;',
  ' padding:6px 9px;background:none;border:none;cursor:pointer;text-align:left}',
  '[data-mc-dock] .todo-acc-head .ta-title{flex:none;font:600 12px/1.4 var(--font-display);',
  ' letter-spacing:.02em;color:var(--mc-fg)}',
  '[data-mc-dock] .todo-acc-head svg.tri{width:12px;height:12px;flex:none;color:var(--mc-muted)}',
  '[data-mc-dock] .todo-acc .todo-bar{height:6px;min-width:0}',
  '[data-mc-dock] .todo-acc .todo-meta{flex:none}',
  '[data-mc-dock] .todo-body{overflow:hidden;height:auto}',
  '[data-mc-dock] .todo-acc:not(.open) .todo-body{height:0}',
  '[data-mc-dock] .todo-acc.open .todo-body{padding:2px 0 6px;border-top:1px solid var(--mc-border-soft)}',
  '[data-mc-dock] .t-item{display:flex;align-items:flex-start;gap:7px;padding:3px 9px;',
  ' font:400 12px/1.6 var(--font-ui);color:var(--mc-fg)}',
  '[data-mc-dock] .t-item .t-box{width:12px;height:12px;flex:none;margin-top:2px;',
  ' background:var(--mc-surface-2);border:1px solid var(--mc-border);border-radius:var(--mc-r-tag);',
  ' display:grid;place-items:center;color:var(--mc-surface)}',
  '[data-mc-dock] .t-item .t-box svg{width:9px;height:8px;display:none}',
  '[data-mc-dock] .t-item.done .t-box{background:var(--mc-fg);border-color:var(--mc-fg)}',
  '[data-mc-dock] .t-item.done .t-box svg{display:block}',
  '[data-mc-dock] .t-item.done .t-txt{color:var(--mc-muted);text-decoration:line-through}',
  '[data-mc-dock] .t-item.now .t-box{border-color:var(--mc-spark)}',
  '[data-mc-dock] .t-item.now .t-box::after{content:\'\';width:6px;height:6px;background:var(--mc-spark);',
  ' animation:mc-pulse 2.6s steps(1,end) infinite}',
  '[data-mc-dock] .goal-card{display:flex;align-items:center;gap:8px;padding:6px 9px;',
  ' background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:var(--mc-r-card);',
  ' box-shadow:var(--mc-shadow-panel);font:400 12px/1.6 var(--font-ui)}',
  '[data-mc-dock] .goal-card svg{width:13px;height:13px;flex:none;color:var(--mc-accent)}',
  '[data-mc-dock] .goal-card .gc-title{flex:none;font:600 12px/1.4 var(--font-display);',
  ' letter-spacing:.02em;color:var(--mc-fg)}',
  '[data-mc-dock] .goal-card .gc-obj{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;',
  ' white-space:nowrap;color:var(--mc-muted)}',
  '[data-mc-dock] .goal-card .gc-acts{flex:none;display:flex;gap:6px}',
  '[data-mc-dock] .goal-card[data-phase="blocked"]{border-color:var(--mc-spark)}',
  '[data-mc-dock] .composer{display:flex;flex-direction:column;gap:8px;background:var(--mc-surface);',
  ' border:1px solid var(--mc-border);border-radius:var(--mc-r-card);',
  ' box-shadow:var(--mc-shadow-panel);padding:8px}',
  '[data-mc-dock] .composer .mc-field{height:auto;min-height:44px;padding:6px 8px}',
  '[data-mc-dock] .composer.busy .mc-field{background:color-mix(in oklab,var(--mc-fg) 4%,var(--mc-surface))}',
  '[data-mc-dock] .composer textarea{flex:1;background:transparent;border:none;resize:none;outline:none;',
  ' font:inherit;color:inherit;min-height:32px}',
  '[data-mc-dock] .composer-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
  '[data-mc-dock] .cb-btn{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 9px;',
  ' background:var(--mc-surface-2);border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);',
  ' box-shadow:inset 0 0 0 1px var(--mc-surface),inset 0 0 0 2px var(--mc-border);',
  ' font:500 11px/1 var(--font-ui);color:var(--mc-muted);cursor:pointer;white-space:nowrap}',
  '[data-mc-dock] .cb-btn svg{width:12px;height:12px;flex:none}',
  '[data-mc-dock] .cb-btn.model{font-family:var(--font-mono);font-size:11px}',
  '[data-mc-dock] .cb-anchor{position:relative;display:inline-flex;flex:none}',
  '[data-mc-dock] .cb-right{margin-left:auto;display:flex;align-items:center;gap:8px;flex:none}',
  '[data-mc-dock] .ctx-ring{position:relative;width:22px;height:22px;flex:none;cursor:pointer}',
  '[data-mc-dock] .ctx-ring svg{width:22px;height:22px}',
  '[data-mc-dock] .ctx-ring .cr-track{stroke:var(--mc-surface-3)}',
  '[data-mc-dock] .ctx-ring .cr-arc{stroke:var(--mc-accent)}',
  '[data-mc-dock] .ctx-ring[data-hot] .cr-arc{stroke:var(--mc-danger)}',
  '[data-mc-dock] .ctx-pop{display:none;position:absolute;bottom:calc(100% + 6px);right:0;z-index:80;',
  ' width:236px;flex-direction:column;gap:6px;padding:9px 11px;background:var(--mc-surface);',
  ' border:1px solid var(--mc-border);border-radius:var(--mc-r-card);box-shadow:var(--mc-shadow-pop);',
  ' font:400 11.5px/1.7 var(--font-ui);color:var(--mc-muted);font-family:var(--font-sb)}',
  '[data-mc-dock] .ctx-pop.open{display:flex}',
  '[data-mc-dock] .ctx-pop b{color:var(--mc-fg);font-family:var(--font-sb);font-weight:500}',
  '[data-mc-dock] .ctx-line{display:flex;align-items:center;gap:7px}',
  '[data-mc-dock] .ctx-line i{width:8px;height:8px;flex:none;',
  ' clip-path:polygon(33% 0,67% 0,100% 33%,100% 67%,67% 100%,33% 100%,0 67%,0 33%)}',
  '[data-mc-dock] .ctx-line .cl-bar{flex:1;height:5px;background:var(--mc-surface-3);',
  ' border:1px solid var(--mc-border-soft);border-radius:0}',
  '[data-mc-dock] .ctx-line .cl-bar i{display:block;height:100%;border-radius:0;clip-path:none}',
].join('\n');
var McDock = {
  css: MC_DOCK_CSS,
  mount: function (ctx) {
    // Task 4 实装:挂载入口 + 镜像驱动桥 + 降级
    return function () {};
  },
};
// —— 纯函数(Task 3)——
function mcDockState(state, ev) {
  var s = state || { mode: 'idle', has: false };
  if (!ev) return s;
  if (ev.t === 'busy') return { mode: 'busy', has: s.has };
  if (ev.t === 'idle') return { mode: 'idle', has: s.has };
  if (ev.t === 'input') return { mode: s.mode === 'busy' ? 'busy' : (ev.has ? 'ready' : 'idle'), has: !!ev.has };
  return s; // 未知事件无害返回
}
function mcTodoSegments(todos) {
  var list = Array.isArray(todos) ? todos : [];
  var nowSet = false;
  return list.map(function (t) {
    if (t && t.done) return 'done';
    if (!nowSet) { nowSet = true; return 'now'; }
    return 'todo';
  });
}
function mcTodoMeta(todos) {
  var list = Array.isArray(todos) ? todos : [];
  var done = 0;
  for (var i = 0; i < list.length; i++) if (list[i] && list[i].done) done++;
  return done + '/' + list.length;
}
function mcCtxArc(pct) {
  var C = 53.4; var p = Math.max(0, Math.min(100, Number(pct) || 0));
  return { dash: (p / 100 * C).toFixed(1) + ' ' + C.toFixed(1), hot: p > 80 };
}
// React 受控 textarea 镜像(native setter + input event;spec §3 桥通道 1)
// Node 桩(无原型描述符)走 desc 缺省 false? 否——桩需镜像语义:true 路径不依赖宿主原型:
function mcMirrorValue(ta, text) {
  if (!ta) return false;
  var desc = (typeof window !== 'undefined' && window.HTMLTextAreaElement)
    ? Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value') : { set: function (v) { ta.value = v; } };
  if (!desc || !desc.set) return false;
  try {
    desc.set.call(ta, text);
    ta.dispatchEvent(new (typeof window !== 'undefined' ? window.Event : function (t) { return { type: t }; })('input', { bubbles: true }));
    return true;
  } catch (e) { return false; }
}
if (typeof module !== 'undefined') module.exports = { McDock: McDock, mcDockState: mcDockState, mcTodoSegments: mcTodoSegments, mcTodoMeta: mcTodoMeta, mcCtxArc: mcCtxArc, mcMirrorValue: mcMirrorValue };

// src/conv/overlays.js —— 弹出菜单体系(spec 2026-09-01 菜单批)
// 协议 { css, mount(ctx) }。自绘菜单 body 挂载 fixed 定位(宿主官方菜单 portal 先例);无 :hover 无 transition。
// 菜单原语(原型 §9 L789-810 直抄;token 换 --mc-*)
const MC_MENUS_CSS = [
  '.mc-menu{position:fixed;display:flex;flex-direction:column;min-width:210px;padding:4px;',
  ' background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:var(--mc-r-card);',
  ' box-shadow:var(--mc-shadow-pop);z-index:70;font-family:var(--font-sb)}',
  '.mc-menu .m-group{padding:5px 9px 3px;font:600 10px/1.6 var(--font-display);letter-spacing:.1em;',
  ' color:var(--mc-faint);text-transform:uppercase}',
  '.mc-menu .m-opt{display:flex;align-items:center;gap:10px;padding:5px 9px;cursor:pointer;',
  ' border-radius:var(--mc-r-tag);font:400 13px/1.5 var(--font-ui);color:var(--mc-fg);background:none;border:0;text-align:left;width:100%}',
  '.mc-menu .m-opt:active{background:var(--mc-fg);color:var(--mc-surface)}',
  '.mc-menu .m-opt.danger{color:var(--mc-danger)}',
  '.mc-menu .m-opt.danger:active{background:var(--mc-danger);color:var(--mc-surface)}',
  '.mc-menu .m-opt.on{background:var(--mc-accent);color:var(--mc-accent-ink)}',
  '.mc-menu .m-opt .mo-ic{width:14px;height:14px;flex:none;color:var(--mc-muted)}',
  '.mc-menu .m-opt.on .mo-ic{color:var(--mc-accent-ink)}',
  '.mc-menu .m-opt.danger .mo-ic{color:inherit}',
  '.mc-menu .m-sep{height:1px;margin:4px 5px;background:var(--mc-border-soft)}',
].join('');
function mcMenuItems(def, wiring) {
  return (def && def.items ? def.items : []).filter(function (it) {
    return !!it.sep || !!(wiring && wiring[it.id]);
  });
}
function mcMenuAlign(anchorRect, viewportW, menuW) {
  if (!anchorRect) return 'left';
  return anchorRect.left + menuW > viewportW - 8 ? 'right' : 'left';
}
// 垂直定位纯函数(body 挂载 fixed,视口直算):默认钮下方 bottom+6;
// 下方放不下(top+menuH > viewportH-8)→ 翻到钮上方 top-6-menuH。无锚安全回退 0。
function mcMenuTop(hostRect, menuH, viewportH) {
  if (!hostRect) return 0;
  var top = hostRect.bottom + 6;
  if (top + menuH > viewportH - 8) return hostRect.top - 6 - menuH;
  return top;
}
function mcMenuState(state, ev) {
  var s = state || { open: null };
  if (!ev) return s;
  if (ev.t === 'open') return { open: { id: ev.id, anchor: ev.anchor || null } };
  return { open: null }; // close/esc/pick 一律关
}
// Task 5 定义表：项集按附录 A 勘定对齐宿主实有菜单（会话=rename/fork/archive workspace L700-716；
// 工作区=rename/delete L459-468；新建类=workspaces.startSession/workspaces.create（二批 A 官方语义）。
// view 两项宿主无对应服务/勘不通 → 不写 WIRING 键（mcMenuItems 自动滤除，菜单整体 no-op）。
// 图标勘定：#i-px-box/#i-px-list 不在 sprite → 归档用 #i-suitcase、排序用 #i-px-clock。
var MC_MENU_DEFS = {
  sess: { items: [
    { id: 'rename', label: '重命名', icon: '#i-px-edit' },
    { id: 'fork', label: '复制会话', icon: '#i-px-copy' },
    { id: 'archive', label: '归档', icon: '#i-suitcase' },
  ] },
  group: { items: [
    { id: 'groupRename', label: '重命名工作区', icon: '#i-px-edit' },
    { id: 'groupNew', label: '在此新建会话', icon: '#i-px-plus' },
    { sep: true },
    { id: 'groupDelete', label: '删除工作区', icon: '#i-px-trash', danger: true },
  ] },
  // groupNew 菜单退役（二批 B）：分组头 plus 钮改直建会话（MC_MENU_FIRE），不再弹菜单。
  view: { items: [
    { id: 'viewGroup', label: '按工作区分组', icon: '#i-folder', on: true },
    { id: 'viewSortTime', label: '按时间排序', icon: '#i-px-clock' },
  ] },
  add: { items: [
    { id: 'addSess', label: '新建会话', icon: '#i-px-plus' },
    { id: 'addWs', label: '新建工作区', icon: '#i-folder' },
  ] },
};
// Task 5 接线（附录 A：宿主菜单受控 React onSelect 不可外部伪造 → 全走官方服务面）。
// 签名统一 function (w)：w.ctx=插件 ctx；w.ctxData=触发钮 openMenu 时写入的 {sess,ws} 上下文。
// 动作外层已有 try/catch（onDocClick 派发段），失败静默、官方状态为准。
// workspaces 服务不在 inject 直达面：ctx.workspaces 缺席时经 ctx.get('workspaces') 可选读取（附录 A ⚠ 行）。
function mcMenuWsSvc(w) {
  var c = w && w.ctx;
  if (!c) return null;
  if (c.workspaces && typeof c.workspaces.archiveSession === 'function') return c.workspaces;
  try {
    if (typeof c.get === 'function') {
      var s = c.get('workspaces');
      if (s && typeof s.archiveSession === 'function') return s;
    }
  } catch (e) {}
  return null;
}
// 二批 A：工作区 id 纯函数守卫——'__ungrouped__' 是 McFinder 的兜底假分组（非官方 id），
// 重命名/新建定向均不可下传 → 返回 null。
function mcMenuWsId(id) {
  return id && id !== '__ungrouped__' ? id : null;
}
// 二批 A1：新建会话 = 官方 workspaces.startSession（建+连+打开；无 wsId 自动落当前/最近工作区）。
// 旧 sessions.create({}) 语义不符（只建不开）——退役。
function mcMenuNewSess(w, wsId) {
  var c = w && w.ctx;
  var id = mcMenuWsId(wsId);
  if (c && c.workspaces && typeof c.workspaces.startSession === 'function') {
    try { c.workspaces.startSession(id || undefined); } catch (e) {} // 吞错纪律：官方状态为准
  }
}
function mcMenuNewWs(w) { // 二批 A3：官方 create(input) 需目录路径（local Workspace 须 materializable）
  var ws = mcMenuWsSvc(w);
  if (!ws || typeof ws.create !== 'function') return;
  if (typeof window === 'undefined' || typeof window.prompt !== 'function') return;
  var p = window.prompt('新建工作区 — 输入目录绝对路径', '');
  if (!p || !p.trim()) return;
  try { ws.create({ path: p.trim() }); } catch (e) {} // 路径无效时官方返回 error——静默（吞错纪律）
}
var MC_MENU_WIRING = {
  // —— sess（会话行 dots）——
  rename: function (w) { // 二批 C：菜单项点击只进入行内编辑态（prompt 退役）；提交走 renameSubmit
    var id = w.ctxData && w.ctxData.sess;
    if (id && MC_EDIT_HOOK) { try { MC_EDIT_HOOK({ kind: 'sess', id: id }); } catch (e) {} }
  },
  renameSubmit: function (w) { // 行内输入回车提交：sessions.binding(id).session.rename(title)
    var d = w.ctxData || {};
    var t = typeof d.title === 'string' ? d.title.trim() : '';
    if (!d.sess || !t || !w.ctx.sessions || typeof w.ctx.sessions.binding !== 'function') return;
    var b = w.ctx.sessions.binding(d.sess);
    if (b && b.session && typeof b.session.rename === 'function') {
      try { b.session.rename(t); } catch (e) {}
    }
  },
  fork: function (w) { // 二批 A4：官方语义补全——fork(increaseTitle)→childId→open
    var id = w.ctxData && w.ctxData.sess;
    var s = w.ctx && w.ctx.sessions;
    if (!id || !s || typeof s.fork !== 'function') return;
    try {
      s.fork({ sessionId: id, increaseTitle: true }).then(function (childId) {
        if (childId && typeof s.open === 'function') s.open(childId);
      }).catch(function () {});
    } catch (e) {}
  },
  archive: function (w) { // 无 sessions.archive（附录 A）：归档在 workspaces.archiveSession
    var id = w.ctxData && w.ctxData.sess;
    if (!id) return;
    var ws = mcMenuWsSvc(w);
    if (ws) ws.archiveSession(id);
  },
  // —— group（分组头 dots）——
  groupRename: function (w) { // 二批 C：进入行内编辑态（提交走 groupRenameSubmit）
    var id = mcMenuWsId(w.ctxData && w.ctxData.ws);
    if (id && MC_EDIT_HOOK) { try { MC_EDIT_HOOK({ kind: 'ws', id: id }); } catch (e) {} }
  },
  groupRenameSubmit: function (w) { // 行内输入回车提交：ws.rename(id, title)
    var d = w.ctxData || {};
    var id = mcMenuWsId(d.ws);
    var t = typeof d.title === 'string' ? d.title.trim() : '';
    if (!id || !t) return;
    var ws = mcMenuWsSvc(w);
    if (ws && typeof ws.rename === 'function') { try { ws.rename(id, t); } catch (e) {} }
  },
  groupDelete: function (w) {
    var id = mcMenuWsId(w.ctxData && w.ctxData.ws);
    if (!id) return;
    var ws = mcMenuWsSvc(w);
    if (ws) ws.delete(id);
  },
  // —— 新建类（二批 A1/A2：startSession 官方语义；「在此」=定向到触发分组的工作区）——
  groupNew: function (w) { mcMenuNewSess(w, w.ctxData && w.ctxData.ws); },
  groupNewSess: function (w) { mcMenuNewSess(w, w.ctxData && w.ctxData.ws); },
  groupNewWs: mcMenuNewWs,
  addSess: function (w) { mcMenuNewSess(w, null); }, // listbar 添加：无定向 → 官方自动落当前/最近
  addWs: mcMenuNewWs,
  // viewGroup/viewSortTime：勘不通 → 不写键（菜单项自动不出现）
};
var MC_MENU_OPEN = null; // Task 5 桥：McFinder 触发钮经此调 openMenu（mount 时赋值、teardown 置空）
// 二批 B 桥：不经菜单直发接线（分组头 plus 直建会话等）。
// mount 时赋值执行 WIRING[act](wiringCtx)；teardown 按 M3 同款守卫置空。
var MC_MENU_FIRE = null;
var MC_EDIT_HOOK = null; // 二批 C 桥：菜单「重命名」项 → McFinder 行内编辑态 setter（McFinder 树注册）
var McMenus = {
  css: MC_MENUS_CSS,
  mount: function (ctx) {
    var state = { open: null };
    var wrap = null;           // 当前活动菜单 DOM
    var wiringCtx = { ctx: ctx, ctxData: null }; // 接线函数收到的统一上下文（ctxData 随 openMenu 刷新）
    var openHost = null;   // 最近一次 openMenu 的触发钮（closeMenu 记录 lastClose 用）
    var lastClose = null;  // {id,host,ts} —— 捕获段刚关掉的菜单（同钮同 id 50ms 内重开忽略；M1）
    MC_MENU_OPEN = openMenu;
    // 二批 B 桥：直发接线（不弹菜单）。ctxData 由调用方随 act 传入。
    var fire = function (act, data) {
      wiringCtx.ctxData = data || null;
      try { if (MC_MENU_WIRING[act]) MC_MENU_WIRING[act](wiringCtx); } catch (e) {}
    };
    MC_MENU_FIRE = fire;
    function closeMenu() {
      // M1 toggle 守卫记录：id/host 取「被关菜单」的（openHost 尚未刷新），ts 纯 Date.now 比较——无定时器
      lastClose = { id: state.open && state.open.id, host: openHost, ts: Date.now() };
      if (!wrap) { state = mcMenuState(state, { t: 'close' }); return; }
      var w = wrap; wrap = null;
      state = mcMenuState(state, { t: 'close' });
      flashOut(w, function () { try { w.remove(); } catch (e) {} });
    }
    function openMenu(id, host, ctxData) { // host=触发钮(button);菜单 body 挂载 fixed 定位;ctxData={sess,ws} 触发上下文
      var def = MC_MENU_DEFS[id]; if (!def || !host) return;
      // M1 toggle 守卫：外点捕获段 closeMenu 刚关掉本钮的同 id 菜单 → React 冒泡段 onClick 迟到的
      // 重开忽略（同钮同 id 且 <50ms——半个 CLOCK 栅格内；纯 Date.now 比较，无定时器）
      if (lastClose && lastClose.id === id && lastClose.host === host
        && Date.now() - lastClose.ts < 50) { lastClose = null; return; }
      closeMenu();
      openHost = host; // closeMenu 之后才刷新（lastClose 须记被关菜单的 host）
      wiringCtx.ctxData = ctxData || null; // 供 WIRING 内读取会话/工作区 id
      var items = mcMenuItems(def, MC_MENU_WIRING);
      if (!items.length) return; // 控制器裁定:无可见项静默 no-op,不渲染空壳
      wrap = document.createElement('div');
      wrap.className = 'mc-menu';
      var html = '';
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        html += it.sep ? '<span class="m-sep"></span>'
          : '<button type="button" class="m-opt' + (it.danger ? ' danger' : '') + (it.on ? ' on' : '') +
            '" data-mc-mi="' + esc(it.id) + '">' +
            (it.icon ? '<svg class="mo-ic" viewBox="0 0 24 24" aria-hidden="true"><use href="' + esc(it.icon) + '"/></svg>' :
              '') +
            '<span>' + esc(it.label) + '</span></button>';
      }
      wrap.innerHTML = html; // 全动态段经 esc
      // v2 改 body 挂载,裁剪祖先收紧退役(裁剪 bug 修复)——旧 absolute 挂 offsetParent 被
      // 4 层裁剪祖先(.mc-group-body/.mc-sb-tree/.mc-sb-find/sidebarCol)截断;fixed 定位无祖先裁剪。
      // 先 append 到 body 测实宽高再定位(比 220 常量准);visibility 隐藏防定位前闪现。
      wrap.style.visibility = 'hidden';
      document.body.appendChild(wrap);
      var rect = host.getBoundingClientRect();
      var menuW = wrap.offsetWidth || 220;
      var menuH = wrap.offsetHeight || 0;
      var side = mcMenuAlign(rect, window.innerWidth, menuW);
      wrap.style.left = (side === 'right' ? rect.right - menuW : rect.left) + 'px';
      wrap.style.right = 'auto';
      wrap.style.top = mcMenuTop(rect, menuH, window.innerHeight) + 'px';
      wrap.style.visibility = '';
      state = mcMenuState(state, { t: 'open', id: id, anchor: host }); // M2:anchor 传触发钮(body 挂载后无锚容器)
      lastClose = null; // 成功开单后清守卫（后续同钮同 id 重开走正常 toggle 路径）
      flashIn(wrap, function () {});
    }
    function onDocClick(e) { // 外点关 + 菜单项派发(捕获段早于按钮自身 React 处理)
      try {
        if (wrap && !wrap.contains(e.target)) { closeMenu(); return; }
        var mi = e.target instanceof Element && e.target.closest('.m-opt');
        if (mi && wrap && wrap.contains(mi)) {
          var fn = MC_MENU_WIRING[mi.getAttribute('data-mc-mi')];
          closeMenu();
          try { if (fn) fn(wiringCtx); } catch (er) { /* 动作失败静默;官方状态为准 —— 不 console 打点（M4:一期已清 diagnostics,src/client.js 零 console 纪律保持,选择留注释） */ }
        }
      } catch (er) {}
    }
    function onKey(e) { try { if (e.key === 'Escape') closeMenu(); } catch (er) {} }
    // fixed 菜单滚动时与钮脱锚 → 任何滚动直接关(捕获段:scroll 不冒泡,须捕获;passive 只读)
    function onScroll() { try { if (wrap) closeMenu(); } catch (er) {} }
    document.addEventListener('click', onDocClick, true);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    // 宿主原生菜单兜底隐藏(Task 1 勘定键为空则跳过;藏不删)
    var styleEl = null;
    if (MC_MAP.menuPortal) {
      styleEl = document.createElement('style');
      styleEl.setAttribute('data-mc-menuhide', '');
      styleEl.textContent = MC_MAP.menuPortal + '{display:none!important}';
      document.head.appendChild(styleEl);
    }
    return function teardown() {
      // M3 撤桥守卫：仅当桥仍指向本 mount 的 openMenu/fire 才撤——防止先卸的旧 mount 误撤后 mount 的桥
      if (MC_MENU_OPEN === openMenu) MC_MENU_OPEN = null;
      if (MC_MENU_FIRE === fire) MC_MENU_FIRE = null;
      try { document.removeEventListener('click', onDocClick, true); } catch (e) {}
      try { document.removeEventListener('keydown', onKey, true); } catch (e) {}
      try { document.removeEventListener('scroll', onScroll, { capture: true }); } catch (e) {}
      try { if (styleEl) styleEl.remove(); } catch (e) {}
      try { if (wrap) wrap.remove(); } catch (e) {}
    };
  },
};
if (typeof module !== 'undefined') module.exports = { McMenus: McMenus, mcMenuItems: mcMenuItems, mcMenuAlign: mcMenuAlign, mcMenuTop: mcMenuTop, mcMenuState: mcMenuState, mcMenuWsId: mcMenuWsId };

// src/kit.js —— 检视页骨架（默认关闭零足迹；控制台 window.__MC_KIT_OPEN__ = true 打开）
// 布局类全部 kit- 前缀，样式不外泄 kit 根之外；组件类直接复用 mc- 原语
// 会话流分区（T8）：原型 §5 类定义 scoped 到 .kit-panel（Ruling 3，非宿主选择器不进
// MC_MAP）+ ReasoningDemo 五帧流式驱动（§8.2 状态机 kit 化，延时全走 CLOCK.next）
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
.kit-scrim::-webkit-scrollbar-thumb{background:var(--mc-scroll-box);border:1px solid var(--mc-border)}
/* ===== 会话流演示分区(Ruling 3):原型 §5 类定义 scoped 到 kit 面板 =====
   T2-T6 的 css 只覆写宿主选择器;.md/.msg/.bubble/.inject/.reasoning/.turn-tail/.retry-row/
   .cap-row 及其子件(tri/s-in/cover/icon-btn/s-dot…)在主题内无任何已定义样式 —— 此处照
   prototype/macintosh-workspace.html §5 段(L461-548)逐行移植,全部选择器以 .kit-panel
   前缀 scoped 不外溢;--* 换 --mc-* 对应名(--font-*/--r-*/--sel-bg 沿 McTokens 现有名)。
   非宿主选择器,不进 MC_MAP(audit §5 不红)。kit- 前缀为检视页自有布局件(kit-band 词汇)。 */
.kit-frames{display:grid;gap:16px;grid-template-columns:1fr}
.kit-frame{border-radius:var(--mc-r-window);overflow:hidden;background:var(--mc-surface);
  box-shadow:var(--mc-shadow-panel);border:1px solid var(--mc-border)}
.kit-frame-tag{display:flex;justify-content:space-between;gap:12px;align-items:center;
  padding:7px 12px;font:700 11px/1.3 var(--font-mono);letter-spacing:.08em;color:var(--mc-faint);
  text-transform:uppercase;background:var(--mc-surface-2);border-bottom:1px solid var(--mc-border)}
.kit-frame-tag em{font-style:normal;color:var(--mc-accent)}
.kit-frame-body{padding:16px}
.kit-stack{display:flex;flex-direction:column;gap:12px}
.kit-stack.sm{gap:10px}
.kit-injects{display:grid;gap:8px;max-width:680px}
.kit-panel .md{font:400 14px/1.8 var(--font-ui);color:var(--mc-fg);word-break:break-word}
.kit-panel .md p{margin:0} /* 原型 §2 全局 h/p{margin:0} 的 scoped 化:§5 的 p+p 间距依赖零基线 */
.kit-panel .md h1,.kit-panel .md h2,.kit-panel .md h3{font:600 17px/1.4 var(--font-display);letter-spacing:.01em;margin:14px 0 6px}
.kit-panel .md h2{font-size:15px}
.kit-panel .md h3{font-size:14px}
.kit-panel .md p + p{margin-top:8px}
.kit-panel .md ul,.kit-panel .md ol{margin:6px 0;padding-left:22px}
.kit-panel .md li{margin:3px 0}
.kit-panel .md code{font:500 12px/1.5 var(--font-code);
  padding:1px 5px;background:var(--mc-sel-bg);border-radius:var(--mc-r-tag);color:var(--mc-fg)}
.kit-panel .md pre{margin:8px 0;padding:10px 12px;overflow-x:auto;
  background:var(--mc-bg-deep);border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card)}
.kit-panel .md pre code{padding:0;background:none;font:400 12.5px/1.7 var(--font-code)}
.kit-panel .md table{border-collapse:collapse;margin:8px 0;font:400 12.5px/1.6 var(--font-ui)}
.kit-panel .md th,.kit-panel .md td{padding:4px 10px;text-align:left;
  border:1px solid var(--mc-border-soft)}
.kit-panel .md th{font:600 12px/1.4 var(--font-display);background:var(--mc-surface-2)}
.kit-panel .md blockquote{margin:8px 0;padding:2px 12px;color:var(--mc-muted);
  border-left:2px solid var(--mc-accent-dim)}
.kit-panel .md a{color:var(--mc-accent)} /* 原型 §2 全局 a 染 accent 的 scoped 化(两文件均有) */
.kit-panel .msg{display:flex;flex-direction:column;gap:6px}
.kit-panel .msg.user{align-items:flex-end}
.kit-panel .msg.user .bubble{max-width:520px;padding:7px 12px;
  background:var(--mc-accent);color:var(--mc-accent-ink);
  border:1px solid var(--mc-border);border-radius:8px;
  font:400 14px/1.7 var(--font-ui)}
.kit-panel .msg.user .attach{max-width:360px;display:flex;gap:8px;align-items:flex-end}
.kit-panel .msg.user .attach .ph{width:132px;height:92px;flex:none;position:relative;
  background:var(--mc-surface-3);
  border:1px solid var(--mc-border);border-radius:var(--mc-r-card)}
.kit-panel .msg.user .attach .ph::after{content:'IMG';position:absolute;right:5px;bottom:5px;
  padding:1px 5px;background:var(--mc-surface);color:var(--mc-muted);
  border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-tag);
  font:600 9px/1.4 var(--font-mono)}
.kit-panel .msg.user .attach .cap{font:400 12px/1.6 var(--font-ui);color:var(--mc-muted);max-width:180px}
.kit-panel .inject{display:flex;align-items:flex-start;gap:7px;padding:7px 9px;
  background:var(--mc-surface-2);
  border:1px dashed var(--mc-border-soft);border-radius:var(--mc-r-card)}
.kit-panel .inject svg{width:15px;height:15px;flex:none;margin-top:1px;color:var(--mc-faint)}
.kit-panel .inject .i-tt{flex:1;min-width:0;font:400 12px/1.7 var(--font-ui);color:var(--mc-muted);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.kit-panel .reasoning{background:var(--mc-surface-3);
  border:1px solid var(--mc-border);border-radius:var(--mc-r-card);
  overflow:hidden}
.kit-panel .reasoning.run{background:color-mix(in oklab,var(--mc-spark) 9%,var(--mc-surface-3))}
.kit-panel .reasoning-head{display:flex;align-items:center;gap:6px;width:100%;
  padding:6px 9px;background:none;border:none;cursor:pointer;text-align:left}
.kit-panel .reasoning-head .r-tag{font:400 13px/1.3 'FindersKeepers','Fusion Pixel 12px monospaced zh','Noto Sans SC',monospace;letter-spacing:.03em;color:var(--mc-fg)}
.kit-panel .reasoning-head .r-sum{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font:400 12px/1.5 var(--font-ui);color:var(--mc-faint)}
.kit-panel .reasoning-head .r-sum .s-in{position:relative}
.kit-panel .reasoning-head .r-sum .s-in::after{content:'';position:absolute;inset:-1px -2px;opacity:0;pointer-events:none;
  background:#fff;
  background-image:repeating-linear-gradient(0deg,transparent 0 2px,rgba(0,0,0,.06) 2px 3px)}
.kit-panel .reasoning-head .r-sum .s-in.flash::after{opacity:1}
.kit-panel .reasoning-head .r-dur{font:500 10px/1.5 var(--font-mono);color:var(--mc-faint);flex:none}
.kit-panel .reasoning.run .reasoning-head .r-tag{color:var(--mc-spark)}
.kit-panel .reasoning-body{overflow:hidden;height:auto}
.kit-panel .reasoning:not(.open) .reasoning-body{height:0}
.kit-panel .reasoning-body .r-txt{padding:2px 9px 9px 26px;
  font:400 12px/1.8 var(--font-ui);color:var(--mc-muted);white-space:pre-wrap}
.kit-panel .reasoning.run .r-txt .cover{color:transparent;background:#fff;
  background-image:repeating-linear-gradient(0deg,transparent 0 2px,rgba(0,0,0,.06) 2px 3px)}
html[data-theme="light"] .kit-panel .reasoning.run .r-txt .cover{background:#000;
  background-image:repeating-linear-gradient(0deg,transparent 0 2px,rgba(255,255,255,.07) 2px 3px)}
.kit-panel .turn-tail{display:flex;align-items:center;gap:8px;flex-wrap:wrap;
  padding-top:2px}
.kit-panel .turn-tail .t-stats{margin-left:auto;font:500 11px/1.6 var(--font-mono);color:var(--mc-faint);
  white-space:nowrap}
.kit-panel .retry-row{display:flex;align-items:center;gap:8px;padding:6px 9px;
  background:var(--mc-surface-2);
  border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card);
  font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}
.kit-panel .retry-row .s-dot{width:6px;height:6px;background:var(--mc-spark);flex:none;
  clip-path:polygon(33% 0,67% 0,100% 33%,100% 67%,67% 100%,33% 100%,0 67%,0 33%); /* 八角像素圆点(§4 款) */
  animation:mc-pulse 2.6s steps(1,end) infinite;animation-delay:var(--pulse-delay,0ms)}
.kit-panel .cap-row{display:flex;align-items:center;gap:8px;padding:6px 9px;
  background:var(--mc-surface-2);
  border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card);
  font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}
/* 原型 .cap-row .tri{border-left-color} 系死规则(svg 无 border),不移植 */
.kit-panel .tri{width:11px;height:11px;flex:none;color:var(--mc-fg);overflow:visible}
.kit-panel .tri.open{transform:rotate(90deg)}
.kit-panel .tri.dim{color:var(--mc-faint)}
.kit-panel .icon-btn{display:grid;place-items:center;width:26px;height:26px;flex:none;
  border-radius:var(--mc-r-tag);border:1px solid var(--mc-border);
  background:var(--mc-surface-2);color:var(--mc-fg);cursor:pointer}
.kit-panel .icon-btn:active{background:var(--mc-border);color:var(--mc-surface)}
.kit-panel .icon-btn:disabled{opacity:.4;cursor:not-allowed}
.kit-panel .icon-btn svg{width:13px;height:13px}
.kit-panel .icon-btn.sm{width:20px;height:20px}
.kit-panel .icon-btn.sm svg{width:11px;height:11px}
/* 菜单分区(Task 7):静态陈列的 .mc-menu 归位到文档流(原语 absolute 供弹出锚定) */
.kit-panel .kit-menustatic .mc-menu{position:relative;top:auto;left:auto;right:auto;max-width:280px}`,

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

// —— 会话流演示数据（静态字面量；声明先于 McKitPage/McKitReasoningRun，任何求值时序下无 TDZ）——
// md 全要素 = interactive s-md 会话首条文案逐字（受信静态字面量，经 dangerouslySetInnerHTML
// 注入；无任何动态插值，audit §3 纪律不破）。其余分区文案一律结构化 h()，字面量无插值。
const MC_KIT_MD_HTML = `<h1>一级标题 Heading 1</h1><h2>二级标题 Heading 2</h2><h3>三级标题 Heading 3</h3><p>正文段落:经典麦金塔主题的 <strong>加粗</strong>、<em>斜体</em>、<code>行内代码 inline_code()</code>、以及一个 <a href="#" onclick="return false">超链接</a>。段与段之间有 8px 间距,长文本自动换行并保持 1.8 倍行距。</p><p>第二段:验证 p + p 的 margin-top。</p><blockquote>引用块 blockquote — 左侧 2px 淡紫竖线,文字 muted。适合放补充说明或原文摘录。</blockquote><h3>无序列表</h3><ul><li>列表项一</li><li>列表项二 <code>带行内代码</code></li><li>列表项三</li></ul><h3>有序列表</h3><ol><li>第一步:拆数</li><li>第二步:分配律</li><li>第三步:合并</li></ol><h3>代码块</h3><pre><code>function mul9(x) {
  return 9 * (x - 2) + 18; // 拆数还原
}
mul9(8); // =&gt; 72</code></pre><h3>表格</h3><table><thead><tr><th>拆法</th><th>算式</th><th>结果</th></tr></thead><tbody><tr><td>10 − 2</td><td>9×10 − 9×2</td><td>72</td></tr><tr><td>3 × 8 × 3</td><td>(9×8)×1</td><td>72</td></tr><tr><td><code>7 = 10 − 3</code></td><td>6×10 − 6×3</td><td>42</td></tr></tbody></table><p>以上覆盖 .md 支持的全部语法:h1–h3、段落、<strong>/<em>、行内 code、链接、引用、ul/ol、pre 代码块、table。</p>`;

// 推理流式正文（THINK_POOL 静态子集，三条长句量级对齐设计稿；静态字面量、无洗牌）
const MC_KIT_THINK_TXT = [
  '拆解意图:哪些约束是硬性的、哪些只是偏好,哪些信息已经给足、哪些还需要推断,这决定了回复的详略与结构',
  '组织骨架:先给结论,再给依据,最后给可选的延伸;推导链条超过三步就拆成分步列表,避免把过程铺成一大段没人读的文字',
  '收敛结论:主要判断已经过两路交叉验证,剩余的不确定性都标注了前提条件,现在可以停止思考,把结论组织成最终回复输出',
].join('\n');

// tokenize 副本（照 prototype/macintosh-interactive.html 逐行）：CJK 一字一词（无 + 号）、
// 数字/拉丁连续段为一词 → take(n) 的 n 即字符量级
function mcTokenize(s) {
  return s.match(/[\u2E80-\u9FFF\uF900-\uFFEF]|[0-9]+|[A-Za-z]+|\s|[^\s]/g) || [];
}
const MC_KIT_TOKS = mcTokenize(MC_KIT_THINK_TXT);
const MC_KIT_PER_TICK = 28; /* 一次追加 = 帧 B + 帧 A 两帧的量（设计稿同款） */

// —— 检视页根组件：window.__MC_KIT_OPEN__ 真值才渲染，关闭走本地 state 强刷 ——
// hook 纪律：全部 hook 先于 `if (!open) return null` 早退（React #310：同一 fiber 两次
// 渲染的 hook 数必须恒定 —— 旧版 runPill 系列挂在早退之后，关闭→打开翻转即崩，T8 修复）；
// 相位对齐 effect 依赖 [open]：关闭态 ref 为 null 安全跳过，翻开时元素上树后再补对相。
function McKitPage() {
  const h = React.createElement;
  const force = React.useState(0)[1];
  const open = !!(typeof window !== 'undefined' && window.__MC_KIT_OPEN__);

  // run 胶囊：挂载即向 CLOCK 对相位（负延迟），多 run 点同屏不交错
  const runPill = React.useRef(null);
  React.useEffect(function () {
    if (CLOCK && runPill.current) CLOCK.syncAnim(runPill.current);
  }, [open]);

  // 会话流分区 retry 细长条 s-dot：同款负延迟相位对齐（与宿主 SYNC 管道同参数）
  const retryDot = React.useRef(null);
  React.useEffect(function () {
    if (CLOCK && retryDot.current) CLOCK.syncAnim(retryDot.current);
  }, [open]);

  // mcfx 演示靶
  const tgtIn = React.useRef(null);
  const tgtOut = React.useRef(null);
  const tgtAcc = React.useRef(null);

  if (!open) return null;

  const close = () => {
    window.__MC_KIT_OPEN__ = false;
    force(function (n) { return n + 1; });
  };

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

  // 菜单分区（Task 7）：真 openMenu 管道演示 —— MC_MENU_OPEN 桥由 McMenus.mount 赋值
  // （模块卸载时置 null 安全空转）。载荷取 sess 菜单；ctxData 传 null → 接线守卫
  // （w.ctxData.sess 缺席即 return）全部静默 no-op，纯演示开合/出场形态。
  const popMenu = (e) => {
    if (typeof MC_MENU_OPEN === 'function') MC_MENU_OPEN('sess', e.currentTarget, null);
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
            }))),
        // (e) 会话流分区（Ruling 3：原型 §5 类 scoped 定义 + 五帧流式演示；
        //     DOM 照 prototype/macintosh-workspace.html §5 kit-band L1760-1840 直抄，
        //     文案为演示字面量；md 全要素区走受信静态字面量 dangerouslySetInnerHTML）
        h('section', null,
          h('h3', { className: 'kit-h' }, '会话流'),
          h('div', { className: 'kit-frames' },
            // md 全要素
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, 'md 全要素 · h1–h3 / 段落 / 加粗斜体 / 行内 code / 链接 / 引用 / ul / ol / pre / table'),
                h('em', null, 'md')),
              h('div', { className: 'kit-frame-body' },
                h('div', { className: 'md', dangerouslySetInnerHTML: { __html: MC_KIT_MD_HTML } }))),
            // 用户消息 · 含图片附件
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '用户消息 · 含图片附件'),
                h('em', null, 'msg-user')),
              h('div', { className: 'kit-frame-body' },
                h('div', { className: 'msg user' },
                  h('div', { className: 'attach' },
                    h('span', { className: 'ph' }),
                    h('span', { className: 'cap' }, '截图:Finder 里手动验证 9×8 = 72 的便签一张,很长的说明文本用来验证多行换行形态。')),
                  h('div', { className: 'bubble' }, '顺便把这张桌面截图也存进会话记录里喵。')))),
            // 上下文注入 · 细长条四型
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '上下文注入 · 细长条四型（system-reminder / 运行时上下文 / 压缩 checkpoint / 技能内容）'),
                h('em', null, 'inject')),
              h('div', { className: 'kit-frame-body' },
                h('div', { className: 'kit-injects' },
                  h('div', { className: 'inject' },
                    h('svg', { 'aria-hidden': true }, h('use', { href: '#i-doc' })),
                    h('span', { className: 'i-tt' }, '上下文注入 <system-reminder> — 可用技能目录变更:grilling 已移除,brainstorming 已加入(完整目录见 system prompt)')),
                  h('div', { className: 'inject' },
                    h('svg', { 'aria-hidden': true }, h('use', { href: '#i-doc' })),
                    h('span', { className: 'i-tt' }, '上下文注入 Current runtime context — file policy: danger-full-access;approval prompts disabled;目标 round 2/6')),
                  h('div', { className: 'inject' },
                    h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-copy' })),
                    h('span', { className: 'i-tt' }, '压缩 checkpoint — 会话前段已压缩:菜单栏/图标库/输入坞五件套决策保留,逐 token 流式细节折叠(96.2k → 12.4k tok)')),
                  h('div', { className: 'inject' },
                    h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-attach' })),
                    h('span', { className: 'i-tt' }, '技能内容注入 <skill_content> brainstorming — 探索意图/需求/设计后再实现,禁止跳过直接动手…'))))),
            // 推理卡 · 五帧流式 vs 完成（ReasoningDemo 组件自带控制钮）
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '推理卡 · 五帧流式（帧 B 白块 → 帧 A 揭开 → 顿拍 ×3） vs 完成'),
                h('em', null, 'reasoning')),
              h('div', { className: 'kit-frame-body' },
                h(McKitReasoningRun, null))),
            // 自动重试行 / 上限行 / 回合尾部
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '自动重试行 / 上限行 / 回合尾部'),
                h('em', null, 'rows')),
              h('div', { className: 'kit-frame-body kit-stack sm' },
                h('div', { className: 'retry-row' },
                  h('i', { className: 's-dot', ref: retryDot }),
                  h('span', null, '自动重试第 2/3 次 · 等待上游恢复(5s 后发起)')),
                h('div', { className: 'cap-row' },
                  h('svg', { className: 'tri', 'aria-hidden': true }, h('use', { href: '#i-tri' })),
                  h('span', null, '已到单回合步数上限(50 steps)— 继续请发送「继续」')),
                h('div', { className: 'turn-tail' },
                  h('button', { className: 'icon-btn sm', type: 'button', title: '复制' },
                    h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-copy' }))),
                  h('button', { className: 'icon-btn sm', type: 'button', title: '重发' },
                    h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-reload' }))),
                  h('span', { className: 't-stats' }, '8.9s · token 1.9s · 83 tok/s')))))),
        // (f) 弹出菜单分区（Task 7）：静态陈列 .mc-menu 全形态 + 真 openMenu 管道演示。
        //     DOM 照 prototype/macintosh-workspace.html L2485-2507 直抄换 mc- 前缀
        //     （span 陈列态；#i-px-list 不在 sprite → 按时间排序按 T5 勘定用 #i-px-clock）
        h('section', null,
          h('h3', { className: 'kit-h' }, '弹出菜单'),
          h('div', { className: 'kit-frames' },
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '通用菜单 · m-group / 常规项 / danger 项 / m-sep / on 选中态'),
                h('em', null, 'menu')),
              h('div', { className: 'kit-frame-body kit-menustatic' },
                h('div', { className: 'mc-menu' },
                  h('span', { className: 'm-group' }, '会话'),
                  h('span', { className: 'm-opt' },
                    h('svg', { className: 'mo-ic', viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-plus' })), '新建会话'),
                  h('span', { className: 'm-opt' },
                    h('svg', { className: 'mo-ic', viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-edit' })), '重命名'),
                  h('span', { className: 'm-sep' }),
                  h('span', { className: 'm-group' }, '视图'),
                  h('span', { className: 'm-opt on' },
                    h('svg', { className: 'mo-ic', viewBox: '0 0 11 9', 'aria-hidden': true }, h('use', { href: '#i-folder' })), '按工作区分组'),
                  h('span', { className: 'm-opt' },
                    h('svg', { className: 'mo-ic', viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-clock' })), '按时间排序'),
                  h('span', { className: 'm-sep' }),
                  h('span', { className: 'm-opt danger' },
                    h('svg', { className: 'mo-ic', viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-trash' })), '删除会话')))),
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '弹出演示 · flashIn 出场 / 外点关 / Esc / :active 反色'),
                h('em', null, 'openMenu')),
              h('div', { className: 'kit-frame-body' },
                h('div', { className: 'kit-demo' },
                  h('button', { className: 'mc-btn', type: 'button', onClick: popMenu }, '▶ 弹出菜单(闪烁出场)'),
                  h('span', { className: 'kit-note' }, '演示载荷 = sess 菜单；ctxData 为空 → 接线守卫静默 no-op')))))))));

// —— ReasoningDemo：推理卡五帧流式演示（§8.2 状态机 kit 化）——
// 五帧一周期 500ms：帧 B（t+0）追加 span.cover + 标题换字挂 flash → 帧 A（t+100）合并进
// 持久文本节点 + 撤 cover → 空 ×3 顿拍。一切延时走 CLOCK.next（禁裸定时器）；组件卸载 /
// 关闭 kit / 重开演示均停流（CLOCK clear）。DOM 命令式照原型逐行，组件零 state 重渲，
// React 只负责静态骨架 —— r-txt 内的文本节点与 cover 由状态机独占管理。
function McKitReasoningRun() {
  const h = React.createElement;
  const cardRef = React.useRef(null);
  const triRef = React.useRef(null);  // 标题行 tri（开合态）
  const sumRef = React.useRef(null);  // .s-in 摘要行（帧 B 换字挂 flash）
  const txtRef = React.useRef(null);  // .r-txt（持久文本节点 T + cover 白块）
  const durRef = React.useRef(null);  // .r-dur（streaming → 实际秒）
  const st = React.useRef({
    running: false, timer: null, T: null, blk: null, pos: 0, pause: 0, card: null,
  }).current;

  function stopTimer() {
    if (st.timer) {
      try { CLOCK.clear(st.timer); } catch (e) { /* 时钟已 dispose：无害 no-op */ }
      st.timer = null;
    }
  }
  function take(n) { /* 顺序取 token：取尽返回空串（照原型） */
    var out = '';
    for (var j = 0; j < n && st.pos < MC_KIT_TOKS.length; j++, st.pos++) out += MC_KIT_TOKS[st.pos];
    return out;
  }
  function tick() {
    if (!st.running || st.card !== cardRef.current) return; /* 卸载/重开后旧流不写 */
    var txt = txtRef.current, sum = sumRef.current;
    if (!txt || !sum) return;
    if (st.pause > 0) {                        /* 帧 C/D/E：连续空帧，追加间顿三拍 */
      st.pause--;
    } else if (st.blk) {                       /* 帧 A（t+100）：白块消失，揭开成文字 */
      st.T.data = st.T.data + st.blk.textContent; /* 合并进持久文本节点（勿 innerHTML 重建） */
      st.blk.remove(); st.blk = null;
      sum.classList.remove('flash');           /* 标题栏白块同步消失 */
      if (st.pos >= MC_KIT_TOKS.length) {      /* 取尽：停拍挂 run 态，等「■ 收尾」信号 */
        st.running = false;
        return;
      }
      st.pause = 3;
    } else {                                   /* 帧 B（t+0）：白块出现（追加占位，不显字） */
      var nxt = take(MC_KIT_PER_TICK);
      if (nxt) {
        var blk = document.createElement('span');
        blk.className = 'cover';
        blk.textContent = nxt;
        txt.appendChild(blk);
        st.blk = blk;
        var flat = nxt.replace(/\n/g, ' ');    /* 标题栏：换行折叠空格，超 44 字掐头留尾 */
        sum.textContent = flat.length > 44 ? '…' + flat.slice(-44) : flat;
        sum.classList.add('flash');
      }
    }
    st.timer = CLOCK.next(tick, 100);          /* 每 tick 一格；五帧合计一周期 500ms */
  }
  function startStream() { /* 「▶ 播放流式」：重开演示从头流（复位全部帧状态） */
    var card = cardRef.current, txt = txtRef.current, sum = sumRef.current;
    if (!card || !txt || !sum || typeof CLOCK === 'undefined' || !CLOCK) return;
    stopTimer();
    st.pos = 0; st.pause = 0; st.blk = null;
    st.running = true; st.card = card;
    card.classList.add('run', 'open');
    if (triRef.current) triRef.current.classList.add('open');
    sum.classList.remove('flash');
    sum.textContent = '正在思考…';
    if (durRef.current) durRef.current.textContent = 'streaming';
    txt.textContent = '';                      /* 清上轮残余（含未收尾的 cover） */
    st.T = document.createTextNode('');
    txt.appendChild(st.T);
    st.timer = CLOCK.next(tick, 200);          /* 起拍 200ms（照原型） */
  }
  function finishStream() { /* 「■ 收尾」：finishThinking 语义（摘前 26 字 / r-dur 定格 / 撤 run） */
    var card = cardRef.current, sum = sumRef.current;
    if (!card || !sum || !st.card) return;     /* 未开过流：无收尾对象 */
    stopTimer();
    st.running = false;
    if (st.blk && st.T) {                      /* 在途 cover 先按帧 A 合并（hideThinking「等帧 A」） */
      st.T.data = st.T.data + st.blk.textContent;
      st.blk.remove(); st.blk = null;
    }
    var full = st.T ? st.T.data : '';
    card.classList.remove('run', 'open');      /* 摘 run：琥珀染与 cover 白块规则一并失效 */
    if (triRef.current) triRef.current.classList.remove('open');
    sum.classList.remove('flash');
    sum.textContent = full.length > 26 ? full.slice(0, 26) + '…' : full; /* 摘正文前 26 字 */
    if (durRef.current) durRef.current.textContent = '1.8s';             /* 演示定值（原型 r-dur 位） */
  }
  // 卸载 / 关闭 kit：停流（未决 tick 经 CLOCK.clear 注销，不再分发）
  React.useEffect(function () {
    return function () { st.running = false; stopTimer(); };
  }, []);

  // 点标题行：accToggle 五拍开合（照原型 accToggle 通道；与宿主 think 卡同款）
  function accCard(card) {
    if (!card) return;
    accToggle(card, function () {
      card.classList.toggle('open');
      var tri = card.querySelector('.tri');
      if (tri) tri.classList.toggle('open');
    });
  }

  const doneRef = React.useRef(null); // 完成帧卡（收合态）

  return h('div', { className: 'kit-stack' },
    h('div', { className: 'kit-row' },
      h('button', { className: 'mc-btn', type: 'button', onClick: startStream }, '▶ 播放流式'),
      h('button', { className: 'mc-btn', type: 'button', onClick: finishStream }, '■ 收尾'),
      h('span', { className: 'kit-note' }, '五帧一周期 500ms · PER_TICK=28 · CLOCK 100ms 栅格驱动')),
    // 运行帧（reasoning.run.open：流式靶卡）
    h('div', { className: 'reasoning run open', ref: cardRef },
      h('button', { className: 'reasoning-head', type: 'button', onClick: function () { accCard(cardRef.current); } },
        h('svg', { className: 'tri open', ref: triRef, 'aria-hidden': true }, h('use', { href: '#i-tri' })),
        h('span', { className: 'r-tag' }, 'Think'),
        h('span', { className: 'r-sum' }, h('span', { className: 's-in', ref: sumRef }, '待机 — 点「▶ 播放流式」')),
        h('span', { className: 'r-dur', ref: durRef }, 'streaming')),
      h('div', { className: 'reasoning-body' },
        h('div', { className: 'r-txt', ref: txtRef }))),
    // 完成帧（收合态定格，对照 workspace L1815-1824）
    h('div', { className: 'reasoning', ref: doneRef },
      h('button', { className: 'reasoning-head', type: 'button', onClick: function () { accCard(doneRef.current); } },
        h('svg', { className: 'tri', 'aria-hidden': true }, h('use', { href: '#i-tri' })),
        h('span', { className: 'r-tag' }, 'Think'),
        h('span', { className: 'r-sum' }, h('span', { className: 's-in' }, '已收敛:两种拆法互相验证 42。收合态。')),
        h('span', { className: 'r-dur' }, '1.8s')),
      h('div', { className: 'reasoning-body' },
        h('div', { className: 'r-txt' }, '收合态正文(窗口高度过渡露出)。'))));
}
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
  McFlow: McFlow,
  McThink: McThink,
  McSysCard: McSysCard,
  McDock: McDock,
  McMenus: McMenus,
  McKit: McKit,
};
const order = ["McTokens","McClock","McMcfx","McSprite","MC_MAP","McChrome","McSidebar","McFinder","McFlow","McThink","McSysCard","McDock","McMenus","McKit"];

return {
  inject: ["slots", "theme", "sessions", "workspaces"],
  apply(ctx) {
    const style = document.createElement('style');
    style.setAttribute('data-mc-root','');
    // @font-face ×5 —— 宿主静态路由（index.js 前缀路由 /mcx-assets/ → 本包 assets/）
    let css = "@font-face{font-family:'FindersKeepers';src:url(/mcx-assets/fonts/FindersKeepers.ttf) format('truetype');font-display:swap}\n@font-face{font-family:'ChiKareGo';src:url(/mcx-assets/fonts/ChiKareGo.ttf) format('truetype');font-display:swap}\n@font-face{font-family:'Fusion Pixel 12px monospaced';src:url(/mcx-assets/fonts/fusion-pixel-12px-monospaced-latin.ttf) format('truetype');font-display:swap}\n@font-face{font-family:'Fusion Pixel 12px monospaced zh';src:url(/mcx-assets/fonts/fusion-pixel-12px-monospaced-zh_hans.ttf) format('truetype');font-display:swap}\n@font-face{font-family:'ChiKareGo Latin';src:url(/mcx-assets/fonts/ChiKareGo.ttf) format('truetype');unicode-range:U+0041-005A,U+0061-007A,U+00C0-024F,U+1E00-1EFF,U+2000-206F;font-display:swap}";
    for (const k of order) { const m = mods[k]; if (!m) continue;
      if (m.css) css += m.css + '\n';
      if (m.mount) try { const td = m.mount(ctx); if (typeof td === 'function') ctx.effect(() => td); } catch(e) { /* mount 失败不拖垮其余 */ }
      if (m.slots) try { m.slots(ctx) } catch(e) { /* slots 失败不拖垮其余 */ }
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
          '--dsw-specific-bubble': pair('var(--mc-accent)'),
        });
        ctx.effect(() => () => { try { off(); } catch (e) {} });
      } else {
        /* theme 服务不可用：仅 CSS 层生效（静默降级） */
      }
    } catch (e) { /* overrideTokens 失败：静默降级，CSS 层仍生效 */ }
    ctx.effect(() => () => {
      style.remove();
    });
  },
};
	}
});
