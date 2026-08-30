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
