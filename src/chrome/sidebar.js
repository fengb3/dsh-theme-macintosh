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
    //    CLOCK 100ms 栅格轮询定位，上限 ~10s）。tclose = 折叠/展开：accToggle 四拍包裹
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

