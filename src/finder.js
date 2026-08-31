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
  const btn = function (title, icon, onClick) {
    const p = { className: 'mc-gh-btn', type: 'button', title: title, 'aria-label': title, 'data-mc-finder': '' };
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
      btn('视图选项', '#i-px-sliders', function (e) { // view 菜单（勘定全项不通时 openMenu 静默 no-op）
        if (MC_MENU_OPEN) MC_MENU_OPEN('view', e.currentTarget, null);
      }),
      btn('添加', '#i-px-plus', function (e) {
        if (MC_MENU_OPEN) MC_MENU_OPEN('add', e.currentTarget, null);
      })));
}

// —— 折叠态迷你条（原型 .sb-mini）：官方 sidebar.workspaces 席位在折叠轨（wide:false）时的形态。
// 只渲染一列 26px 图标钮：新建（程序化点官方 newSession 钮保行为/状态持久化）+ 搜索（展开侧栏后过滤）。
// 搜索词经模块级 MC_FINDER_QUERY + 自定义事件 mcx-finder-query 传给展开态 McFinderTree
// （折叠/展开是组件形态切换=remount，state 不跨形态存活）。 ——
let MC_FINDER_QUERY = '';

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
// 选中行 .on 整行反色方角；onClick 走 accToggle 四拍（七轮裁定：选中=状态切换统一走库；
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
  return h('div', { className: cls, role: 'button', tabIndex: 0, onClick: pick, title: s.title, 'aria-selected': on ? 'true' : 'false' },
    h('span', { className: 'mc-s-tt' }, esc(s.title)),
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
// group-body（会话行 + 超 5 条的「展开其余 N 个会话」钮）。折叠开合走 accToggle 四拍
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
  return h('div', { className: 'mc-group' + (expanded ? ' expanded' : '') },
    h('div', { className: 'mc-group-head' },
      h('button', { className: 'mc-gh-main', type: 'button', onClick: toggle, 'aria-expanded': open, 'data-mc-finder': '' },
        h('svg', { className: open ? 'mc-tri open' : 'mc-tri', 'aria-hidden': true }, h('use', { href: '#i-tri' })),
        h('svg', { 'aria-hidden': true }, h('use', { href: '#i-folder' })),
        h('span', { className: 'mc-g-name' }, esc(g.name)),
        h('span', { className: 'mc-g-count' }, esc(String(g.sessions.length)))),
      h('span', { className: 'mc-gh-act' },
        ghBtn('工作区菜单', '#i-px-dots', function (e) { // group 菜单（上下文=工作区 id）
          if (MC_MENU_OPEN) MC_MENU_OPEN('group', e.currentTarget, { ws: g.id });
        }),
        ghBtn('新建', '#i-px-plus', function (e) { // groupNew 菜单（上下文=工作区 id）
          if (MC_MENU_OPEN) MC_MENU_OPEN('groupNew', e.currentTarget, { ws: g.id });
        }))),
    h('div', { className: 'mc-group-body' + (open ? ' open' : '') },
      g.sessions.map(function (s) {
        return h(McFinderSess, { key: s.id, sess: s, selected: props.selected === s.id, onPick: props.onPick });
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
/* Task 5 菜单锚定：触发钮的 offsetParent 须收敛到按钮近旁容器（否则 .mc-menu 挂到侧栏大容器）——
   五处触发钮的容器（listbar 按钮组/分组头按钮组/会话行）预置 position:relative，
   openMenu 里 host.offsetParent 即命中这些容器，菜单出现在其正下方 */
.mc-sb-find .mc-sb-la,.mc-sb-find .mc-gh-act,.mc-sb-find .mc-sess{position:relative}
.mc-sb-find .mc-anchor{position:relative}
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
