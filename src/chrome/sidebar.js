// src/chrome/sidebar.js —— 侧栏 Finder 窗覆写 + 主题月牙钮（Task 7）
// 协议：{ css, slots(ctx) }。样式参考 prototype/component-dev-notes.md §7（侧栏 Finder 窗）。
// 纪律：宿主选择器一律取自 MC_MAP（本文件只做插值）；无 :hover、无 transition。
// src/chrome/sidebar.js —— 侧栏 Finder 窗覆写 + 主题月牙钮（Task 7）
// 协议：{ css, slots(ctx) }。样式参考 prototype/component-dev-notes.md §7（侧栏 Finder 窗）。
// 纪律：宿主选择器一律取自 MC_MAP（本文件只做插值）；无 :hover、无 transition；
// 席位注册沿用 kit.js 在 Task 5 运行期验证过的 register(meta, render) 形态。
// teardown 用：首次 flip 前的 data-theme 原值（undefined = 从未 flip，null = 原本无属性）
let mcThemeOrig = undefined;

const McSidebar = {
  css: [
    // 侧栏列 = Finder 窗（.win 语汇完整版）：rail-1 底 + 四边 1px 黑边 + 3px 硬投影 + 直角。
    // 桌面缝隙由容器 padding/gap 提供（四边 12px，与主窗同浮在噪点桌面上）。整窗字体 --font-sb（§7.1）
    `${MC_MAP.sidebar}{background:var(--mc-rail-1);border:1px solid var(--mc-border);border-radius:0;box-shadow:var(--mc-shadow-panel);font-family:var(--font-sb)}`,
    // 官方侧栏根自带 padding:6px 12px —— 清零，窗内内容顶格（行级间距由各自行自带）
    `${MC_MAP.sidebarRoot}{padding:0}`,
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
    // —— 侧栏元素级 Finder 语汇（原型 §4 sb-head/sb-actions/sb-tree/sb-foot）——
    // System 7 窗标题栏（CSS 装饰版）：20px pinstripe 条纹面 + 居中 "Sessions" 标题 + 顶缘 accent 线 +
    // 左右 13px 像素方块（pixelarticons close/zoom data-URI，fill 深浅两组固定色，见 MC_TBOX；
    // 交互属三期）。经 ::before 作首 flex 子。
    `${MC_MAP.sidebarRoot}::before{content:'Sessions';display:flex;align-items:center;justify-content:center;` +
      `height:20px;flex:none;font:600 12px/1 var(--font-sb);letter-spacing:.03em;color:var(--mc-fg);` +
      `background:${MC_TBOX.bg(MC_TBOX.closeDark, MC_TBOX.zoomDark, 'rgba(255,255,255,.10)')};` +
      `border-bottom:1px solid var(--mc-border);box-shadow:inset 0 1px 0 var(--mc-accent)}`,
    `html[data-theme="light"] ${MC_MAP.sidebarRoot}::before{background:` +
      MC_TBOX.bg(MC_TBOX.closeLight, MC_TBOX.zoomLight, 'rgba(0,0,0,.20)') + '}',
    // 品牌行 sb-head：padding + 软底线（logoRow 官方 60px 定高放开为内容高）
    `${MC_MAP.sidebarLogoRow}{height:auto;min-height:0;padding:10px 12px 8px;background:var(--mc-rail-1);border-bottom:1px solid var(--mc-border-soft)}`,
    // New Session 钮 = .btn.primary 双内环语汇（§5）：accent 底 + 外 1px 线 + 2px 面缝双环；14px 图标
    `${MC_MAP.sidebarNewSession}{display:flex;align-items:center;justify-content:center;gap:7px;` +
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
    // 工作区树容器 sb-tree：内衬 8px（§4 .sb-tree padding:8px）
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
    // 品牌行侧栏折叠钮 → 像素 menu（首钮是品牌 Finder，只掩 last-child；圆角轮廓是最后的平滑残留）
    `${MC_MAP.sidebarLogoRow} button:last-child svg *{visibility:hidden}`,
    `${MC_MAP.sidebarLogoRow} button:last-child svg{background:currentColor;` +
      `-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M4%206h16v2H4V6zm0%205h16v2H4v-2zm16%205H4v2h16v-2z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat;` +
      `mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M4%206h16v2H4V6zm0%205h16v2H4v-2zm16%205H4v2h16v-2z' fill='black'/%3E%3C/svg%3E") center/contain no-repeat}`,
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
        style: { background: 'none', border: 'none', padding: 0, margin: 0, width: '18px', height: '18px', display: 'grid', placeItems: 'center', color: 'var(--mc-muted)', cursor: 'pointer' },
      }, React.createElement('svg', { width: 15, height: 15, 'aria-hidden': true, style: { display: 'block' } }, React.createElement('use', { href: '#i-moon' })));
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

