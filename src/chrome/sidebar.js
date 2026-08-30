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
    if (!ctx || !ctx.slots || typeof ctx.slots.register !== 'function') return;
    const reg = ctx.slots.register.bind(ctx.slots);
    const wait = ctx.slots.inject.bind(ctx.slots);
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
    // 品牌图标：Finder 24px 换掉宿主 FishLogo（single 席；动态条目优先于出厂件，实现换标）
    ctx.effect(() => wait('sidebar.brand.mark', () => reg({
      name: 'sidebar.brand.mark',
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
