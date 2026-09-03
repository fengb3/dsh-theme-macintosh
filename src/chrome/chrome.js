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
    // 主列 = 会话窗（.win 语汇）：surface 底 + 1px 边；桌面两大窗 = 直角（原型 .desk > .win）。
    // 刻意不收 overflow —— 宿主自管滚动（centerCol overflow:hidden + data-conversation-scroll）
    `${MC_MAP.mainColumn}{background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:0}`,
    // 主窗实心硬投影落在网格格位（centerCol）上：会话根与格位矩形完全重合，投影画在会话根上
    // 会被格位 overflow:hidden 裁得不可见（对照侧栏列——同层才可见，实测 2026-09-03）。
    // 纯黑不透明、偏移同规 3px（与侧栏/面板投影等距），深浅共用。
    `${MC_MAP.mainColumnCell}{box-shadow:var(--mc-shadow-win)}`,
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
    // 滚动口：窗内"文档区"与侧栏同底（用户裁定 2026-09-03：flow 底色=侧栏底色 rail-1，
    // 深 #383838/浅 #fff，勿再用更深档）。滚动条走 tokens 已有的全局 15px 经典款
    `${MC_MAP.scrollport}{background:var(--mc-rail-1)}`,
    // 输入坞席位：宿主自带 36px 透明→bg-base 淡入渐变（终点色与文档区不同色=深色脏带）——
    // 铲平为文档区同色实底（像素风硬切语汇，用户裁定 2026-09-03 删渐变）。
    // 宿主规则 .root[data-phase=active] .composerSeat=(0,3,0) → 复用 appRoot(#root 前缀,ID 列)
    // 拼后代选择器压杀；两段选择器均经 MC_MAP 插值（管制纪律）。
    `${MC_MAP.appRoot} div${MC_MAP.composerSeat}{background:var(--mc-rail-1)}`,
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

