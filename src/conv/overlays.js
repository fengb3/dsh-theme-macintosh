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
// 工作区=rename/delete L459-468；新建类=sessions.create/workspaces.create）。
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
  groupNew: { items: [
    { id: 'groupNewSess', label: '新建会话', icon: '#i-px-plus' },
    { id: 'groupNewWs', label: '新建工作区', icon: '#i-folder' },
  ] },
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
function mcMenuNewSess(w) { // sessions.create(opts)→id（附录 A sessions 方法面）
  var c = w && w.ctx;
  if (c && c.sessions && typeof c.sessions.create === 'function') c.sessions.create({});
}
function mcMenuNewWs(w) { // workspaces.create(input)（附录 A L9541-9570/L10036）
  var ws = mcMenuWsSvc(w);
  if (ws && typeof ws.create === 'function') ws.create({});
}
var MC_MENU_WIRING = {
  // —— sess（会话行 dots）——
  rename: function (w) { // sessions.binding(id).session.rename(title)（附录 A L7346）
    var id = w.ctxData && w.ctxData.sess;
    if (!id || !w.ctx.sessions || typeof w.ctx.sessions.binding !== 'function') return;
    var b = w.ctx.sessions.binding(id);
    if (!b || !b.session || typeof b.session.rename !== 'function') return;
    var t = window.prompt('重命名会话', '');
    if (t === null || t.trim() === '') return;
    b.session.rename(t.trim());
  },
  fork: function (w) { // sessions.fork({sessionId})→childId（附录 A sessions 方法面）
    var id = w.ctxData && w.ctxData.sess;
    if (!id || !w.ctx.sessions || typeof w.ctx.sessions.fork !== 'function') return;
    w.ctx.sessions.fork({ sessionId: id });
  },
  archive: function (w) { // 无 sessions.archive（附录 A）：归档在 workspaces.archiveSession
    var id = w.ctxData && w.ctxData.sess;
    if (!id) return;
    var ws = mcMenuWsSvc(w);
    if (ws) ws.archiveSession(id);
  },
  // —— group（分组头 dots）——
  groupRename: function (w) {
    var id = w.ctxData && w.ctxData.ws;
    if (!id) return;
    var ws = mcMenuWsSvc(w);
    if (!ws) return;
    var t = window.prompt('重命名工作区', '');
    if (t === null || t.trim() === '') return;
    ws.rename(id, t.trim());
  },
  groupDelete: function (w) {
    var id = w.ctxData && w.ctxData.ws;
    if (!id) return;
    var ws = mcMenuWsSvc(w);
    if (ws) ws.delete(id);
  },
  // —— 新建类 ——
  groupNew: mcMenuNewSess,
  groupNewSess: mcMenuNewSess,
  groupNewWs: mcMenuNewWs,
  addSess: mcMenuNewSess,
  addWs: mcMenuNewWs,
  // viewGroup/viewSortTime：勘不通 → 不写键（菜单项自动不出现）
};
var MC_MENU_OPEN = null; // Task 5 桥：McFinder 触发钮经此调 openMenu（mount 时赋值、teardown 置空）
var McMenus = {
  css: MC_MENUS_CSS,
  mount: function (ctx) {
    var state = { open: null };
    var wrap = null;           // 当前活动菜单 DOM
    var wiringCtx = { ctx: ctx, ctxData: null }; // 接线函数收到的统一上下文（ctxData 随 openMenu 刷新）
    var openHost = null;   // 最近一次 openMenu 的触发钮（closeMenu 记录 lastClose 用）
    var lastClose = null;  // {id,host,ts} —— 捕获段刚关掉的菜单（同钮同 id 50ms 内重开忽略；M1）
    MC_MENU_OPEN = openMenu;
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
      // M3 撤桥守卫：仅当桥仍指向本 mount 的 openMenu 才撤——防止先卸的旧 mount 误撤后 mount 的桥
      if (MC_MENU_OPEN === openMenu) MC_MENU_OPEN = null;
      try { document.removeEventListener('click', onDocClick, true); } catch (e) {}
      try { document.removeEventListener('keydown', onKey, true); } catch (e) {}
      try { document.removeEventListener('scroll', onScroll, { capture: true }); } catch (e) {}
      try { if (styleEl) styleEl.remove(); } catch (e) {}
      try { if (wrap) wrap.remove(); } catch (e) {}
    };
  },
};
if (typeof module !== 'undefined') module.exports = { McMenus: McMenus, mcMenuItems: mcMenuItems, mcMenuAlign: mcMenuAlign, mcMenuTop: mcMenuTop, mcMenuState: mcMenuState };
