// src/chrome/chrome.js —— chrome 染色 + 桌面画布
// src/chrome/chrome.js —— chrome 染色 + 桌面画布
// 协议：{ css, mount(ctx) }。RULING：桌面画布走 mount（body 首元素 data-mc-desk，z-index:-1），
// 不占 shell.overlay 席（该席 z-index:20 在 React 树内、叠在内容之上，只适合 kit 检视页那种浮层）。
// 纪律：选择器字符串一律来自 map.js 的 MC_MAP（本文件只做插值）；无 :hover、无 transition。
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
      `background:linear-gradient(var(--mc-surface-2),var(--mc-surface-2)) 6px center/11px 11px no-repeat,` +
        `linear-gradient(var(--mc-border),var(--mc-border)) 5px center/13px 13px no-repeat,` +
        `linear-gradient(var(--mc-surface-2),var(--mc-surface-2)) right 6px center/11px 11px no-repeat,` +
        `linear-gradient(var(--mc-border),var(--mc-border)) right 5px center/13px 13px no-repeat,` +
        `repeating-linear-gradient(180deg,rgba(255,255,255,.10) 0 1px,transparent 1px 3px),var(--mc-surface-2);` +
      `border-bottom:1px solid var(--mc-border);box-shadow:inset 0 1px 0 var(--mc-accent)}`,
    `html[data-theme="light"] div[data-phase="hero"]::before,html[data-theme="light"] div[data-phase="inert"]::before{background:` +
      `linear-gradient(var(--mc-surface-2),var(--mc-surface-2)) 6px center/11px 11px no-repeat,` +
      `linear-gradient(var(--mc-border),var(--mc-border)) 5px center/13px 13px no-repeat,` +
      `linear-gradient(var(--mc-surface-2),var(--mc-surface-2)) right 6px center/11px 11px no-repeat,` +
      `linear-gradient(var(--mc-border),var(--mc-border)) right 5px center/13px 13px no-repeat,` +
      `repeating-linear-gradient(180deg,rgba(0,0,0,.20) 0 1px,transparent 1px 3px),var(--mc-surface-2)}`,
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

