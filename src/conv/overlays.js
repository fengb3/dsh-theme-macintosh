// src/conv/overlays.js —— 弹出菜单体系(spec 2026-09-01 菜单批)
// 协议 { css, mount(ctx) }。自绘菜单 body 挂载 fixed 定位(宿主官方菜单 portal 先例);无 :hover 无 transition。
// 菜单原语(原型 §9 L789-810 直抄;token 换 --mc-*)
const MC_MENUS_CSS = [
  '.mc-menu{position:fixed;display:flex;flex-direction:column;min-width:210px;padding:4px;',
  ' background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:0;', // 验收轮5:菜单直角化(用户裁定,与弹层皮同规)
  ' box-shadow:var(--mc-shadow-pop);z-index:70;font-family:var(--font-sb)}',
  '.mc-menu .m-group{padding:5px 9px 3px;font:600 10px/1.6 var(--font-display);letter-spacing:.1em;',
  ' color:var(--mc-faint);text-transform:uppercase}',
  '.mc-menu .m-opt{display:flex;align-items:center;gap:10px;padding:5px 9px;cursor:pointer;',
  ' border-radius:0;font:400 13px/1.5 var(--font-ui);color:var(--mc-fg);background:none;border:0;text-align:left;width:100%}', // 轮5:选项行圆角彻底拍平(用户裁定)
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
// —— §B hero 空态(overlays 批2;原型 §9 L769-787,用户裁定:去芯片行/去模式下拉,纯静态零行为)——
var MC_HERO_COPY = {
  title: 'Think Classic,跑点什么。', titleEm: 'Classic',
  badge: 'MACINTOSH · System 7 复古主题',
  sub: '经典麦金塔工作区:白窗黑线、条纹标题栏、Finder 会话树。',
};
function mcHeroAction(phase) { return phase === 'hero' ? 'mount' : 'unmount'; }
var MC_HERO_CSS = [
  '.mc-hero{display:flex;flex-direction:column;align-items:center;gap:14px;padding:52px 24px 40px;text-align:center}',
  '.mc-hero .mh-mark{width:48px;height:48px;color:var(--mc-fg);filter:drop-shadow(2px 2px 0 rgba(0,0,0,.4))}',
  'html[data-theme="light"] .mc-hero .mh-mark{filter:none}',
  '.mc-hero .mh-title{font:700 34px/1.15 var(--font-display);letter-spacing:.01em;color:var(--mc-fg)}',
  '.mc-hero .mh-title em{font-style:normal;color:var(--mc-accent)}',
  '.mc-hero .mh-badge{display:inline-flex;align-items:center;padding:3px 10px;background:var(--mc-sel-bg);',
  ' border:1px solid var(--mc-border-soft);border-radius:0;font:600 11px/1.6 var(--font-display);',
  ' letter-spacing:.05em;color:var(--mc-fg)}',
  '.mc-hero .mh-sub{max-width:420px;font:400 13px/1.8 var(--font-ui);color:var(--mc-muted)}',
  '@media (max-width:640px){.mc-hero .mh-title{font-size:26px}}',
].join('');
// 官方空态藏匿 CSS:own gate 属性门控(html[data-mc-hero],dock 批 composerHide 藏匿同款形态;
// 控制器裁定——overlays 段零宿主属性片段硬编码,相位一致性由 heroSync 置/撤属性自动达成)。
// typeof 守卫:单文件被测试以 CJS 独立加载时 MC_MAP 缺席(装配体内恒在),照 dock 先例静默回退空串。
var MC_OVERLAYS2_CSS = MC_HERO_CSS
  + (typeof MC_MAP !== 'undefined' && MC_MAP.heroOfficial
    ? 'html[data-mc-hero] ' + MC_MAP.heroOfficial + '{display:none!important}' : '');
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
  css: MC_MENUS_CSS + MC_OVERLAYS2_CSS,
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
    // 验收轮5:官方菜单 portal 由「全局藏匿」改「CSS 注入皮肤」(用户裁定:视图选项/加号走官方
    // 代理弹层)——直角+像素皮(同 dock 弹层注入皮语汇),容器与子件全量拍平(!important 压宿主
    // 哈希类样式);官方菜单只在官方钮被程序化代理点击时出现,无并存双菜风险
    var styleEl = null;
    if (MC_MAP.menuPortal) {
      styleEl = document.createElement('style');
      styleEl.setAttribute('data-mc-menuskin', '');
      styleEl.textContent = MC_MAP.menuPortal + '{border-radius:0!important;background:var(--mc-surface)!important;'
        + 'border:1px solid var(--mc-border)!important;box-shadow:var(--mc-shadow-pop)!important;'
        + 'font-family:var(--font-ui)!important;color:var(--mc-fg)!important;padding:4px!important}'
        + MC_MAP.menuPortal + ' *{font-family:inherit!important;border-radius:0!important}';
      document.head.appendChild(styleEl);
    }
    // §B hero:官方空态 CSS 藏 + 自绘 .mc-hero 挂 flowScroll 首;-相变/内容换场全走一个 body observer
    // (heroRoot 缺席不轮询——body observer 兼职探测,吸取 McFlow「8s 上限耗尽」教训)。
    // own gate:挂载置 html[data-mc-hero]、摘除撤之——官方空态藏匿随相位自动一致(控制器裁定 1/2)。
    var heroEl = null, heroRoot = null;
    try { heroRoot = document.querySelector(MC_MAP.heroRoot); } catch (e) {}
    function heroSync() {
      var act = mcHeroAction(heroRoot ? heroRoot.getAttribute('data-phase') : null);
      if (act === 'mount' && !heroEl) {
        var host = heroRoot ? (heroRoot.querySelector(MC_MAP.flowScroll) || heroRoot) : null;
        if (!host) return;
        heroEl = document.createElement('div');
        heroEl.className = 'mc-hero';
        heroEl.innerHTML = '<svg class="mh-mark" aria-hidden="true"><use href="#i-cl-HappyMac"/></svg>'
          + '<div class="mh-title">Think <em>' + MC_HERO_COPY.titleEm + '</em>,跑点什么。</div>'
          + '<span class="mh-badge">' + MC_HERO_COPY.badge + '</span>'
          + '<p class="mh-sub">' + MC_HERO_COPY.sub + '</p>'; // 静态字面量拼接常量,audit §3 豁免形态
        host.insertBefore(heroEl, host.firstChild);
        try { document.documentElement.setAttribute('data-mc-hero', ''); } catch (e) {}
        flashIn(heroEl, function () {});
      } else if (act === 'unmount' && heroEl) {
        heroEl.remove(); heroEl = null;
        try { document.documentElement.removeAttribute('data-mc-hero'); } catch (e) {}
      }
    }
    var heroObs = new MutationObserver(function () {
      try { if (!heroRoot || !heroRoot.isConnected) heroRoot = document.querySelector(MC_MAP.heroRoot); } catch (e) {}
      heroSync();
    });
    try { heroObs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-phase', 'class'] }); } catch (e) {}
    heroSync();
    return function teardown() {
      // M3 撤桥守卫：仅当桥仍指向本 mount 的 openMenu/fire 才撤——防止先卸的旧 mount 误撤后 mount 的桥
      if (MC_MENU_OPEN === openMenu) MC_MENU_OPEN = null;
      if (MC_MENU_FIRE === fire) MC_MENU_FIRE = null;
      try { document.removeEventListener('click', onDocClick, true); } catch (e) {}
      try { document.removeEventListener('keydown', onKey, true); } catch (e) {}
      try { document.removeEventListener('scroll', onScroll, { capture: true }); } catch (e) {}
      try { if (styleEl) styleEl.remove(); } catch (e) {}
      try { if (wrap) wrap.remove(); } catch (e) {}
      // §B hero 撤净:observer 断开 + heroEl 摘除 + own gate 属性撤(藏匿门随卸载归零)
      try { heroObs.disconnect(); } catch (e) {}
      try { if (heroEl) heroEl.remove(); } catch (e) {}
      try { document.documentElement.removeAttribute('data-mc-hero'); } catch (e) {}
    };
  },
};
if (typeof module !== 'undefined') module.exports = { McMenus: McMenus, mcMenuItems: mcMenuItems, mcMenuAlign: mcMenuAlign, mcMenuTop: mcMenuTop, mcMenuState: mcMenuState, mcMenuWsId: mcMenuWsId, mcHeroAction: mcHeroAction, MC_HERO_COPY: MC_HERO_COPY };
