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
// —— §B hero 空态(overlays 批2;原型 §9 L769-787,用户裁定:去芯片行/去模式下拉,纯静态零行为;
// 验收裁定轮 2026-09-03:构图砍成 mark+title 两件——badge/sub 整行退役;标题 i18n 双语,zh=用户
// 裁定文案「探索未知之境」,en=主题初代 slogan「Think Classic」(用户「原版的那个 slogan」的转译,
// 见注记 §11.3);locale 判定 documentElement.lang || navigator.language,前缀 zh → zh 否则 en;
// mcHeroTitle 纯函数只收 lang 字符串(heroSync 侧读 DOM,测试域零 DOM)。)——
var MC_HERO_COPY = { zh: '探索未知之境', en: 'Think Classic' };
function mcHeroTitle(lang) {
  var s = lang == null ? '' : String(lang).toLowerCase();
  return s.indexOf('zh') === 0 ? MC_HERO_COPY.zh : MC_HERO_COPY.en;
}
function mcHeroAction(phase) { return phase === 'hero' ? 'mount' : 'unmount'; }
var MC_HERO_CSS = [
  '.mc-hero{display:flex;flex-direction:column;align-items:center;gap:14px;padding:52px 24px 40px;text-align:center}',
  '.mc-hero .mh-mark{width:48px;height:48px;color:var(--mc-fg);filter:drop-shadow(2px 2px 0 rgba(0,0,0,.4))}',
  'html[data-theme="light"] .mc-hero .mh-mark{filter:none}',
  '.mc-hero .mh-title{font:700 34px/1.15 var(--font-display);letter-spacing:.01em;color:var(--mc-fg)}',
  '@media (max-width:640px){.mc-hero .mh-title{font-size:26px}}',
  // —— 窗框标题栏语汇(验收裁定轮 2026-09-03,原型 §titlebar L178 + sidebar .mc-titlebar 同族):
  // 20px pinstripe 条纹面 + 顶缘 1px accent 线 + 13px sprite 方块(#i-close 左/#i-zoom 右,用户指认
  // Kit Sprite 墙前两枚,三色位 var 随深浅自动反色)。hero 相(mc-hero-tb)与 dialog 卡(mc-dlg-tb)
  // 共用面/方块类;hero 相由 heroSync 注入真 DOM(伪元素装不进 <use>,chrome ::before 伪元素版退役)。
  '.mc-hero-tb,.mc-dlg-tb{display:flex;align-items:center;justify-content:center;height:20px;flex:none;',
  ' font:600 12px/1 var(--font-sb);letter-spacing:.03em;color:var(--mc-fg);',
  ' background:repeating-linear-gradient(180deg,rgba(255,255,255,.10) 0 1px,transparent 1px 3px),var(--mc-surface-2);',
  ' border-bottom:1px solid var(--mc-border);box-shadow:inset 0 1px 0 var(--mc-accent)}',
  'html[data-theme="light"] .mc-hero-tb,html[data-theme="light"] .mc-dlg-tb{background:',
  ' repeating-linear-gradient(180deg,rgba(0,0,0,.20) 0 1px,transparent 1px 3px),var(--mc-surface-2)}',
  '.mc-hero-tb{position:relative}',
  '.mc-dlg-tb{position:absolute;top:0;left:0;right:0;z-index:1}', // dialog 卡内横贯卡顶(flex row 布局外挂,裁定5)
  '.mc-tb-title{max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.mc-tbx{position:absolute;top:50%;transform:translateY(-50%);width:13px;height:13px;',
  ' display:grid;place-items:center;padding:0;border:none;background:none;cursor:pointer}',
  '.mc-tbx.cl{left:5px}',
  '.mc-tbx.zm{right:5px}',
  '.mc-tbx svg{width:13px;height:13px;display:block}',
  '.mc-tbx:active svg{opacity:.55}',
].join('');
// 官方空态藏匿 CSS:own gate 属性门控(html[data-mc-hero],dock 批 composerHide 藏匿同款形态;
// 控制器裁定——overlays 段零宿主属性片段硬编码,相位一致性由 heroSync 置/撤属性自动达成)。
// typeof 守卫:单文件被测试以 CJS 独立加载时 MC_MAP 缺席(装配体内恒在),照 dock 先例静默回退空串。
// 验收裁定轮四条门控追加(2026-09-03):①官方 hero 晕 SVG 藏(heroGlow,椭圆渐变真身);②chrome 批
// 的 hero ::before 装饰条让位(真 DOM 窗框替代伪元素版,unmount/teardown 撤 gate 即回返);③composer
// 席位 margin-top:auto 钉到滚动口底(hero 相「输入框靠屏幕最底下」裁定);④hero 本体上下 auto margin
// 与③均分剩余空间(构图垂直居中于标题栏与输入坞之间)。
var MC_OVERLAYS2_CSS = MC_HERO_CSS
  + (typeof MC_MAP !== 'undefined' && MC_MAP.heroOfficial
    ? 'html[data-mc-hero] ' + MC_MAP.heroOfficial + '{display:none!important}' : '')
  + (typeof MC_MAP !== 'undefined' && MC_MAP.heroGlow
    ? 'html[data-mc-hero] ' + MC_MAP.heroGlow + '{display:none!important}' : '')
  + (typeof MC_MAP !== 'undefined' && MC_MAP.heroRoot
    ? 'html[data-mc-hero] ' + MC_MAP.heroRoot + '::before{display:none!important}' : '')
  + (typeof MC_MAP !== 'undefined' && MC_MAP.composerSeat
    ? 'html[data-mc-hero] ' + MC_MAP.composerSeat + '{margin-top:auto!important}' : '')
  + 'html[data-mc-hero] .mc-hero{margin-top:auto!important;margin-bottom:auto!important}';
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
    // 验收裁定轮 2026-09-03:hero 相随挂 .mc-hero-tb 窗框标题栏(heroRoot 首子,sidebar .mc-titlebar
    // 同款形态;方块= sprite #i-close/#i-zoom,chrome ::before 伪元素版经 gate CSS 让位)+composer
    // 席位钉底(gate CSS)。窗框与 heroEl 同拍挂摘、同款 isConnected 自愈。
    var heroEl = null, heroRoot = null, heroTb = null;
    try { heroRoot = document.querySelector(MC_MAP.heroRoot); } catch (e) {}
    function mcHeroLang() {
      try {
        return (document.documentElement && document.documentElement.lang)
          || (typeof navigator !== 'undefined' && navigator.language) || '';
      } catch (e) { return ''; }
    }
    function heroTbBuild() {
      var tb = document.createElement('div');
      tb.className = 'mc-hero-tb';
      // innerHTML 全静态字面量(零动态插值;方块 sprite 多色位,深浅自动反色)——sidebar build 同款形态
      tb.innerHTML = '<span class="mc-tb-title">DeepSeek Harness</span>'
        + '<button type="button" class="mc-tbx cl" aria-label="关闭（装饰）" title="关闭" tabindex="-1">'
        + '<svg aria-hidden="true"><use href="#i-close"/></svg></button>'
        + '<button type="button" class="mc-tbx zm" aria-label="缩放（装饰）" title="缩放" tabindex="-1">'
        + '<svg aria-hidden="true"><use href="#i-zoom"/></svg></button>';
      return tb;
    }
    function heroSync() {
      var act = mcHeroAction(heroRoot ? heroRoot.getAttribute('data-phase') : null);
      if (act === 'mount' && (!heroEl || !heroEl.isConnected)) { // isConnected:宿主重建子树后滞留 detached 引用自愈(审查修复轮1)
        var host = heroRoot ? (heroRoot.querySelector(MC_MAP.flowScroll) || heroRoot) : null;
        if (!host) return;
        heroEl = document.createElement('div');
        heroEl.className = 'mc-hero';
        heroEl.innerHTML = '<svg class="mh-mark" aria-hidden="true"><use href="#i-cl-HappyMac"/></svg>'
          + '<div class="mh-title">' + mcHeroTitle(mcHeroLang()) + '</div>'; // 双语常量表查值,audit §3 豁免形态
        host.insertBefore(heroEl, host.firstChild);
        try { document.documentElement.setAttribute('data-mc-hero', ''); } catch (e) {}
        flashIn(heroEl, function () {});
      } else if (act === 'unmount' && heroEl) {
        heroEl.remove(); heroEl = null;
        try { document.documentElement.removeAttribute('data-mc-hero'); } catch (e) {}
      }
      // 窗框标题栏(heroRoot 首子;heroEl 挂成为准——本体没挂成时条不挂,下一拍 observer 再来)
      if (act === 'mount' && heroEl && heroRoot && (!heroTb || !heroTb.isConnected)) {
        heroTb = heroTbBuild();
        heroRoot.insertBefore(heroTb, heroRoot.firstChild);
        flashIn(heroTb, function () {});
      } else if (act === 'unmount' && heroTb) {
        heroTb.remove(); heroTb = null;
      }
    }
    var heroObs = new MutationObserver(function () {
      try { if (!heroRoot || !heroRoot.isConnected) heroRoot = document.querySelector(MC_MAP.heroRoot); } catch (e) {}
      heroSync();
      dlgSync(); // 裁定轮 5:同一 body observer 兼职 dialog 顶栏注入/摘除(官方开卡=childList 突变)
    });
    try { heroObs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-phase', 'class'] }); } catch (e) {}
    heroSync();
    // §C dialog/scrim 换皮:纯 CSS 存在门控(官方自开自关,JS 门控不可靠);menuPortal 皮形态复刻
    var dlgCss = '';
    if (MC_MAP.dlgCard) {
      var D = MC_MAP.dlgCard;
      dlgCss = D + '{background:var(--mc-surface)!important;border:1px solid var(--mc-border)!important;'
        + 'border-radius:0!important;box-shadow:var(--mc-shadow-pop)!important;'
        + 'font-family:var(--font-ui)!important;color:var(--mc-fg)!important}'
        + D + ' *{font-family:inherit!important;border-radius:0!important}'           // 像素字+直角全域压平
        + D + ' h1,' + D + ' h2,' + D + ' h3{font-family:var(--font-display)!important}' // 标题像素字(逗号臂逐臂带卡锚——裸 h2,h3 臂重置后代组合符会全域命中宿主标题)
        + D + ' button:not(.mc-tbx){background:var(--mc-surface-2)!important;border:1px solid var(--mc-border)!important;' // :not(.mc-tbx)=注入顶栏的 13px 方块钮不吃按钮皮(!important 皮会压过 .mc-tbx 裸规则,裁定轮 5)
        + 'border-radius:0!important;font:500 12px/1.6 var(--font-ui)!important;color:var(--mc-fg)!important;padding:4px 12px}'
        + D + ' button:not(.mc-tbx):active{background:var(--mc-fg)!important;color:var(--mc-surface)!important}'
        + D + ' input,' + D + ' textarea{background:var(--mc-surface)!important;border:1px solid var(--mc-border)!important;' // 输入域皮(逗号臂逐臂带卡锚——裸 textarea 臂全域命中活体 composer 输入框,见 Fix round 1b)
        + 'border-radius:0!important;font:400 12px/1.6 var(--font-ui)!important;color:var(--mc-fg)!important}'
        + D + ' hr,' + D + ' [class*="separator"]{background:var(--mc-border-soft)!important;height:1px}'; // 发丝线(class 臂同带卡锚——裸 [class*="separator"] 全域拍 1px)
      // switch 换皮两行已裁(控制器裁定 1:T1 勘定实证 settings 面板 0 switch——navCell/分段钮形态,
      // spec §2「官方没有的结构不强造」硬前提;官方日后引入 switch 时 verify B 段会提示补皮)
    }
    if (MC_MAP.dlgMask) {
      dlgCss += MC_MAP.dlgMask + '{background-image:radial-gradient(rgba(0,0,0,.55) 1px,transparent 1px)!important;'
        + 'background-size:8px 8px!important;background-color:var(--mc-bg)!important}'; // scrim 点阵幕;z 不动(spec 裁定4)
    }
    // 结构档(勘定裁:dlgNav 非空才上;官方无对应结构不强造——spec §2 硬前提)。
    // 冒烟实证(live 2026-09-02):面板 display:flex row,nav 即固定宽 flex 兄弟(188×800,旁 content
    // 612×800)——172px+border-right 结构成立,规则照上;唯 brief 原稿 `dlgCard+' '+dlgNav` 双前缀
    // 拼出嵌套 dialog 死选择器(live 0 命中),dlgNav 值本身已含 dlgCard 全前缀,单键即完整域定。
    if (MC_MAP.dlgNav) {
      dlgCss += MC_MAP.dlgNav + '{width:172px!important;flex:none!important;'
        + 'border-right:1px solid var(--mc-border-soft)!important;font-family:var(--font-sb)!important}';
    }
    // 裁定轮 5:顶栏占位——卡 padding-top:20px(:has 门控挂在自有类 .mc-dlg-tb 在场,零官方锚;
    // box-sizing 改 border-box 让 20px 吃进官方原高,面板不增高)。官方卡 display:flex row(nav|
    // content),顶栏走 absolute 外挂横贯卡顶,flex 布局不被打断——nav/content 整体下移 20px。
    if (MC_MAP.dlgCard) {
      dlgCss += MC_MAP.dlgCard + ':has(.mc-dlg-tb){padding-top:20px!important;box-sizing:border-box!important}';
    }
    if (dlgCss) {
      var dlgEl = document.createElement('style');
      dlgEl.setAttribute('data-mc-dlgskin', '');
      dlgEl.textContent = dlgCss;
      document.head.appendChild(dlgEl);
    }
    // —— §C+ 裁定轮 5:dialog Mac 顶栏注入(官方无 titlebar DOM,家具级注入)。幕后同款 pinstripe
    // 语汇+sprite 方块;关闭方块镜像官方「关闭」钮程序化 click(勘定 2026-09-03:VOzbGW_close
    // click→面板关净,与 Esc 同效;保官方行为),锚漂移兜底=向卡派发 Esc keydown(冒泡至 React
    // 根委托,live 实证退场)。缩放方块装饰(tabindex -1)。幂等:bar 在场且父为卡则跳过;卡被
    // React 重建则 bar detached → isConnected 判定重建(与 heroEl 自愈同款)。teardown 摘净。
    var dlgBar = null;
    function mcDlgTitle(card) { // 顶栏标题读官方 aria-labelledby 指题元素(动态文本 → esc 后入 innerHTML)
      try {
        var id = card.getAttribute('aria-labelledby');
        var el = id ? document.getElementById(id) : null;
        var t = el ? String(el.textContent || '').trim() : '';
        return t || '设置';
      } catch (e) { return '设置'; }
    }
    function dlgSync() {
      var card = null;
      try { card = MC_MAP.dlgCard ? document.querySelector(MC_MAP.dlgCard) : null; } catch (e) {}
      if (!card) {
        if (dlgBar) { try { dlgBar.remove(); } catch (e) {} dlgBar = null; }
        return;
      }
      if (dlgBar && dlgBar.isConnected && dlgBar.parentElement === card) return; // 幂等
      dlgBar = document.createElement('div');
      dlgBar.className = 'mc-dlg-tb';
      dlgBar.innerHTML = '<span class="mc-tb-title">' + esc(mcDlgTitle(card)) + '</span>'
        + '<button type="button" class="mc-tbx cl" aria-label="关闭" title="关闭">'
        + '<svg aria-hidden="true"><use href="#i-close"/></svg></button>'
        + '<button type="button" class="mc-tbx zm" aria-label="缩放（装饰）" title="缩放" tabindex="-1">'
        + '<svg aria-hidden="true"><use href="#i-zoom"/></svg></button>';
      dlgBar.querySelector('.mc-tbx.cl').addEventListener('click', function () {
        var btn = null;
        try { btn = MC_MAP.dlgClose ? card.querySelector(MC_MAP.dlgClose) : null; } catch (e) {}
        if (btn) { try { btn.click(); return; } catch (e) {} } // 主路:镜像官方关闭钮
        try { // 兜底:锚漂移时向卡派发 Esc(React 根委托捕获;live 实证同效)
          card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
        } catch (e) {}
      });
      card.insertBefore(dlgBar, card.firstChild);
      flashIn(dlgBar, function () {});
    }
    dlgSync();
    return function teardown() {
      // M3 撤桥守卫：仅当桥仍指向本 mount 的 openMenu/fire 才撤——防止先卸的旧 mount 误撤后 mount 的桥
      if (MC_MENU_OPEN === openMenu) MC_MENU_OPEN = null;
      if (MC_MENU_FIRE === fire) MC_MENU_FIRE = null;
      try { document.removeEventListener('click', onDocClick, true); } catch (e) {}
      try { document.removeEventListener('keydown', onKey, true); } catch (e) {}
      try { document.removeEventListener('scroll', onScroll, { capture: true }); } catch (e) {}
      try { if (styleEl) styleEl.remove(); } catch (e) {}
      try { if (wrap) wrap.remove(); } catch (e) {}
      // §B hero 撤净:observer 断开 + heroEl/heroTb 摘除 + own gate 属性撤(藏匿门随卸载归零)
      try { heroObs.disconnect(); } catch (e) {}
      try { if (heroEl) heroEl.remove(); } catch (e) {}
      try { if (heroTb) heroTb.remove(); } catch (e) {}
      try { document.documentElement.removeAttribute('data-mc-hero'); } catch (e) {}
      // §C dlg 皮撤净(styleEl menuPortal 同款:head 挂/teardown 摘)+顶栏 DOM 摘(裁定轮 5)
      try { if (dlgEl) dlgEl.remove(); } catch (e) {}
      try { if (dlgBar) dlgBar.remove(); } catch (e) {}
    };
  },
};
if (typeof module !== 'undefined') module.exports = { McMenus: McMenus, mcMenuItems: mcMenuItems, mcMenuAlign: mcMenuAlign, mcMenuTop: mcMenuTop, mcMenuState: mcMenuState, mcMenuWsId: mcMenuWsId, mcHeroAction: mcHeroAction, mcHeroTitle: mcHeroTitle, MC_HERO_COPY: MC_HERO_COPY };
