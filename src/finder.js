// src/finder.js —— 侧栏内容区重绘：遮蔽 sidebar.workspaces 席位，Finder 树骨架（静态假数据）
// 协议：{ css, slots(ctx) }。样式全部 .mc- 自有类（宿主选择器零出现，audit §5 安全）；
// 无 :hover、无 transition，按压只 :active；一切延时走 CLOCK（经 mcfx 的 flashIn，100ms 栅格）。
// 纯顶层声明，无模块系统语法；与 tokens/clock/mcfx/sprite 拼进同一作用域。
// 本步为骨架（假数据）。下一步接真实数据：官方经席位 props 传入 useSessions/useWorkspaces/
// renderSlot 等（aurum 先例 dsh-theme-aurum/client.js L3123-3150 的遮蔽注册写法），
// 届时只替换数据源与动作，DOM 结构不动。

// —— 假数据（结构对齐官方 workspace 树：工作区 → 会话；status: run|done|wait；xtra 超 5 折叠）——
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

// 滚动区标题栏：左「工作区」标签 + 紧邻右侧三个 18px 小钮（搜索/视图选项/添加）——
// 按钮跟标签走（flex:none），不顶到侧栏右缘（原型 §4 .sb-listbar 语汇）
function McFinderListbar() {
  const h = React.createElement;
  const btn = function (title, icon) {
    return h('button', { className: 'mc-gh-btn', type: 'button', title: title, 'aria-label': title, 'data-mc-finder': '' },
      h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: icon })));
  };
  return h('div', { className: 'mc-sb-listbar' },
    h('span', { className: 'mc-sb-lb' }, '工作区'),
    h('span', { className: 'mc-sb-la' },
      btn('搜索会话', '#i-px-search'),
      btn('视图选项', '#i-px-sliders'),
      btn('添加新工作区', '#i-px-plus')));
}

// 会话行：状态槽（run=脉冲点 / done=✓ / wait=空占位）+ 标题 + 三点菜单钮。
// 选中行 .on 整行反色方角；onClick 走 flashIn 三拍（ghost→show→白闪→撤，100ms×2 走 CLOCK）。
function McFinderSess(props) {
  const h = React.createElement;
  const s = props.sess;
  const on = props.selected;
  const cls = 'mc-sess' + (on ? ' on' : '') + (s.status === 'run' ? ' run' : '') + (s.xtra ? ' xtra' : '');
  const pick = function (e) {
    const row = e.currentTarget; // 事件对象即刻取 DOM（不依赖事件池生命周期）
    flashIn(row, function () { props.onPick(s.id); }); // 选中态切换包进闪烁中拍
  };
  let slot = null;
  if (s.status === 'run') slot = h('i', { className: 'mc-s-dot' });
  else if (s.status === 'done') slot = h('svg', { className: 'mc-s-ok', 'aria-hidden': true }, h('use', { href: '#i-check' }));
  return h('div', { className: cls, role: 'button', tabIndex: 0, onClick: pick, title: s.title },
    h('span', { className: 'mc-s-tt' }, esc(s.title)),
    h('span', { className: 'mc-s-slot' }, slot),
    h('button', {
      className: 'mc-s-menu', type: 'button', title: '会话菜单', 'aria-label': '会话菜单', 'data-mc-finder': '',
      onClick: function (e) { e.stopPropagation(); }, // 菜单钮不触发行选中
    }, h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-dots' }))));
}

// 工作区分组：group-head（折叠三角 i-tri + 文件夹 i-folder + 名称 + 计数 + dots/plus 小钮）+
// group-body（会话行 + 超 5 条的「展开其余 N 个会话」钮）。折叠开合同走 flashIn 过场。
function McFinderGroup(props) {
  const h = React.createElement;
  const g = props.group;
  const open = !!props.open;
  const expanded = !!props.expanded;
  const xtraCount = g.sessions.filter(function (s) { return s.xtra; }).length;
  const toggle = function (e) {
    const grp = e.currentTarget.closest('.mc-group');
    flashIn(grp, function () { props.onToggle(g.id); });
  };
  const ghBtn = function (title, icon) {
    return h('button', { className: 'mc-gh-btn', type: 'button', title: title, 'aria-label': title, 'data-mc-finder': '' },
      h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: icon })));
  };
  return h('div', { className: 'mc-group' + (expanded ? ' expanded' : '') },
    h('div', { className: 'mc-group-head' },
      h('button', { className: 'mc-gh-main', type: 'button', onClick: toggle, 'aria-expanded': open, 'data-mc-finder': '' },
        h('svg', { className: open ? 'mc-tri open' : 'mc-tri', 'aria-hidden': true }, h('use', { href: '#i-tri' })),
        h('svg', { 'aria-hidden': true }, h('use', { href: '#i-folder' })),
        h('span', { className: 'mc-g-name' }, esc(g.name)),
        h('span', { className: 'mc-g-count' }, esc(String(g.sessions.length)))),
      h('span', { className: 'mc-gh-act' },
        ghBtn('工作区菜单', '#i-px-dots'),
        ghBtn('新建会话', '#i-px-plus'))),
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

// Finder 树根：本地 state 管选中 / 分组开合 / 余量展开。运行脉冲点挂载即与 CLOCK 三色相位对齐。
function McFinderTree() {
  const h = React.createElement;
  const selState = React.useState(MC_FINDER_SEL0);
  const sel = selState[0]; const setSel = selState[1];
  const openState = React.useState({ 'ws-mac': true, 'ws-aurum': true, 'ws-algae': false });
  const expState = React.useState({});
  const root = React.useRef(null);
  React.useEffect(function () {
    // 负延迟注入：多 run 点同屏不交错（CLOCK 惰性单例在 McClock.mount 后必在）
    if (CLOCK && root.current) {
      const dots = root.current.querySelectorAll('.mc-sess.run .mc-s-dot');
      for (let i = 0; i < dots.length; i++) CLOCK.syncAnim(dots[i]);
    }
  }, []);
  const onToggle = function (gid) {
    openState[1](function (o) { const n = Object.assign({}, o); n[gid] = !o[gid]; return n; });
  };
  const onExpand = function (gid) {
    expState[1](function (m) { const n = Object.assign({}, m); n[gid] = true; return n; });
  };
  const onPick = function (sid) { setSel(sid); };
  return h('div', { className: 'mc-sb-find', ref: root },
    h(McFinderListbar),
    h('nav', { className: 'mc-sb-tree' },
      MC_FINDER_DATA.map(function (g) {
        return h(McFinderGroup, {
          key: g.id, group: g,
          open: !!openState[0][g.id], expanded: !!expState[0][g.id],
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
  font:400 15px/1.25 var(--font-mono);letter-spacing:.02em;color:var(--mc-fg)}
.mc-g-count{font:500 10px/1.3 var(--font-sb);color:var(--mc-faint)}
.mc-group-body{overflow:hidden;height:auto}
.mc-group-body:not(.open){height:0}
.mc-sess{display:flex;align-items:center;gap:6px;width:100%;box-sizing:border-box;
  padding:3px 4px 3px 5px;margin-top:2px;background:none;border:none;cursor:pointer;text-align:left;
  border-radius:var(--mc-r-tag)}
.mc-s-tt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font:400 13px/1.5 var(--font-sb);color:var(--mc-fg)}
.mc-s-slot{display:flex;align-items:center;justify-content:center;gap:4px;flex:none;order:-1;
  width:15px;height:15px;margin-left:20px}
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
.mc-sb-find .mc-sb-more svg{width:11px;height:11px;flex:none}`,

  slots(ctx) {
    // 可选读取 'slots' 服务（ctx.slots 常驻直达；勿属性访问未声明服务）
    const S = ctx.slots;
    if (!S || typeof S.register !== 'function' || typeof S.inject !== 'function') return;
    // 遮蔽官方工作区树：priority:-1 lowest-render（aurum client.js L3123-3150 同款）。
    // 官方注册保留 —— 停插件即还原；McSidebar.css 的官方树覆写因此降级为兜底（遮蔽失败时不破版）。
    // inject 返回 disposer，register 返回 disposer —— 经 ctx.effect(() => disp) 归入本 fiber。
    ctx.effect(() => S.inject('sidebar.workspaces', () => S.register(
      { name: 'sidebar.workspaces', priority: -1, registrant: 'macintosh' },
      function McFinderHost(props) {
        if (typeof React === 'undefined') return null;
        // props（官方经席位传入，本步骨架不用）：useSessions / useWorkspaces / renderSlot —— 下一步接
        return React.createElement(McFinderTree, props);
      }
    )));
  },
};
