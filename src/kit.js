// src/kit.js —— 检视页骨架（默认关闭零足迹；控制台 window.__MC_KIT_OPEN__ = true 打开）
// 布局类全部 kit- 前缀，样式不外泄 kit 根之外；组件类直接复用 mc- 原语
// 纯顶层声明，无模块系统语法；与 tokens/clock/mcfx/sprite 拼进同一作用域
const McKit = {
  css: `/* ===== kit 检视页专属布局（全部 kit- 前缀，不外泄） ===== */
.kit-scrim{position:fixed;inset:0;z-index:95;overflow-y:auto;box-sizing:border-box;
  padding:32px 16px;pointer-events:auto;
  background:radial-gradient(rgba(0,0,0,.5) 1px,transparent 1.5px);
  background-size:8px 8px} /* 点阵幕：与桌面同 8px 栅格，整块可点关闭 */
.kit-panel{max-width:960px;margin:0 auto;
  background:var(--mc-surface);
  border:1px solid var(--mc-border);border-radius:var(--mc-r-window);
  box-shadow:var(--mc-shadow-panel);overflow:hidden} /* 复用 .win 窗口语汇 */
.kit-titlebar{position:relative;display:flex;align-items:center;justify-content:center;
  height:var(--mc-titlebar-h);flex:none;
  background:repeating-linear-gradient(180deg,var(--mc-title-stripe) 0 1px,transparent 1px 3px),
    var(--mc-surface-2);
  border-bottom:1px solid var(--mc-border);padding:0 26px}
.kit-titlebar::before{content:'';position:absolute;left:0;top:0;right:0;height:1px;background:var(--mc-accent)}
.kit-title{max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  padding:0 8px;background:var(--mc-surface-2);color:var(--mc-fg);
  font:600 12px/1 var(--font-display);letter-spacing:.03em}
.kit-body{padding:20px 24px 28px;display:flex;flex-direction:column;gap:26px;
  color:var(--mc-fg);font:400 13px/1.7 var(--font-ui)}
.kit-h{font:600 15px/1 var(--font-display);letter-spacing:.03em;margin:0 0 10px}
.kit-grid{display:flex;flex-wrap:wrap;gap:10px}
.kit-chip{display:inline-flex;align-items:center;gap:8px;height:28px;padding:0 10px;
  border:1px solid var(--mc-border);border-radius:var(--mc-r-tag);background:var(--mc-surface-2);
  font:400 11px var(--font-mono);color:var(--mc-fg)}
.kit-swatch{width:18px;height:18px;flex:none;border:1px solid var(--mc-border)}
.kit-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.kit-cell{display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.kit-note{font:400 11px var(--font-mono);color:var(--mc-faint)}
.kit-demo{position:relative;display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  min-height:52px;padding:12px;border:1px dashed var(--mc-border-soft);background:var(--mc-surface-2)}
.kit-demo-target{position:relative;min-width:140px;padding:6px 12px;
  background:var(--mc-surface);border:1px solid var(--mc-border);
  font:400 12px var(--font-ui);color:var(--mc-fg)}
.kit-demo-target.kit-folded{display:none}
.kit-iconwall{display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:10px}
.kit-icell{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 4px;
  background:var(--mc-surface-2);border:1px solid var(--mc-border);border-radius:var(--mc-r-tag)}
.kit-icell svg{width:20px;height:20px;color:var(--mc-fg)}
.kit-ilabel{font:400 10px var(--font-mono);color:var(--mc-faint);word-break:break-all}
.kit-field{width:280px}`,

  slots(ctx) {
    // 席位：shell.overlay（additive 列表槽，order 靠后）；默认渲染 null
    const seat = (ctx && ctx.slot && ctx.slot.shell && ctx.slot.shell.overlay) || null;
    if (!seat || typeof seat.register !== 'function') return;
    const reg = seat.register(
      { id: 'mc-kit', order: 900, label: () => 'MC Kit' },
      function kitEntry() {
        if (typeof React === 'undefined') return null;
        return React.createElement(McKitPage);
      },
    );
    // register 可能返回注销器；幂等防重
    if (typeof reg === 'function') McKitDispose = reg;
  },
};

let McKitDispose = null;

// —— 检视页根组件：window.__MC_KIT_OPEN__ 真值才渲染，关闭走本地 state 强刷 ——
function McKitPage() {
  const h = React.createElement;
  const force = React.useState(0)[1];
  const open = !!(typeof window !== 'undefined' && window.__MC_KIT_OPEN__);
  if (!open) return null;

  const close = () => {
    window.__MC_KIT_OPEN__ = false;
    force(function (n) { return n + 1; });
  };

  // run 胶囊：挂载即向 CLOCK 对相位（负延迟），多 run 点同屏不交错
  const runPill = React.useRef(null);
  React.useEffect(function () {
    if (CLOCK && runPill.current) CLOCK.syncAnim(runPill.current);
  }, []);

  // mcfx 演示靶
  const tgtIn = React.useRef(null);
  const tgtOut = React.useRef(null);
  const tgtAcc = React.useRef(null);

  const doFlashIn = () => {
    const el = tgtIn.current;
    if (el) flashIn(el, function () { el.textContent = '出场后的内容 ' + new Date().getSeconds(); });
  };
  const doFlashOut = () => {
    const el = tgtOut.current;
    if (el) flashOut(el, function () { el.textContent = '已退场（再点出场复原）'; });
  };
  const doAccToggle = () => {
    const el = tgtAcc.current;
    if (el) accToggle(el, function () { el.classList.toggle('kit-folded'); });
  };

  const swatches = [
    ['--mc-bg', 'bg 桌面底'], ['--mc-surface', 'surface 窗面'], ['--mc-fg', 'fg 文字'],
    ['--mc-border', 'border 描边'], ['--mc-accent', 'accent 强调'], ['--mc-spark', 'spark 次强调'],
    ['--mc-success', 'success'], ['--mc-danger', 'danger'],
  ];
  const pills = [
    ['run', '运行中'], ['done', '完成'], ['fail', '失败'], ['wait', '等待'], ['accent', '强调'],
  ];
  const icons = [
    'i-close', 'i-zoom', 'i-apple', 'i-doc', 'i-folder', 'i-suitcase', 'i-finder',
    'i-check', 'i-command', 'i-sparkle', 'i-px-plus', 'i-px-search',
  ];

  // 外层 svg 不带 viewBox：<use> 引 <symbol> 时由 symbol 自带 viewBox 缩放适配
  return h('div', { className: 'kit-scrim', onClick: close },
    h('div', {
      className: 'kit-panel', onClick: function (e) { e.stopPropagation(); },
    },
      h('div', { className: 'kit-titlebar' }, h('span', { className: 'kit-title' }, 'MC Kit — 检视页')),
      h('div', { className: 'kit-body' },
        // (a) tokens 色板
        h('section', null,
          h('h3', { className: 'kit-h' }, 'Tokens 色板'),
          h('div', { className: 'kit-grid' },
            swatches.map(function (s) {
              return h('span', { className: 'kit-chip', key: s[0] },
                h('span', { className: 'kit-swatch', style: { background: 'var(' + s[0] + ')' } }),
                esc(s[1]));
            }))),
        // (b) 基础原语五态
        h('section', null,
          h('h3', { className: 'kit-h' }, '基础原语'),
          h('div', { className: 'kit-row' },
            h('div', { className: 'kit-cell' }, h('button', { className: 'mc-btn' }, '默认')),
            h('div', { className: 'kit-cell' }, h('button', { className: 'mc-btn primary' }, 'Primary')),
            h('div', { className: 'kit-cell' }, h('button', { className: 'mc-btn danger' }, 'Danger')),
            h('div', { className: 'kit-cell' }, h('button', { className: 'mc-btn', disabled: true }, '禁用')),
            h('span', { className: 'kit-note' }, '按住看 :active 反色（无 hover / 无过渡）')),
          h('div', { className: 'kit-row' },
            pills.map(function (p) {
              return h('span', {
                className: 'mc-pill ' + p[0],
                key: p[0],
                ref: p[0] === 'run' ? runPill : null,
              }, esc(p[1]));
            })),
          h('div', { className: 'kit-row' },
            h('div', { className: 'kit-cell kit-field' },
              h('div', { className: 'mc-field' },
                h('input', { placeholder: 'mc-field 聚焦看 accent 外环' }))),
            h('div', { className: 'kit-cell' },
              h('span', { className: 'kit-note' }, 'mc-tri：'),
              h('svg', { className: 'mc-tri' }, h('use', { href: '#i-tri' })),
              h('svg', { className: 'mc-tri open' }, h('use', { href: '#i-tri' }))))),
        // (c) mcfx 闪烁演示
        h('section', null,
          h('h3', { className: 'kit-h' }, 'mcfx 闪烁演示'),
          h('div', { className: 'kit-demo' },
            h('button', { className: 'mc-btn', onClick: doFlashIn }, 'flashIn'),
            h('span', { className: 'kit-demo-target', ref: tgtIn }, '出场演示靶'),
            h('button', { className: 'mc-btn', onClick: doFlashOut }, 'flashOut'),
            h('span', { className: 'kit-demo-target', ref: tgtOut }, '退场演示靶'),
            h('button', { className: 'mc-btn', onClick: doAccToggle }, 'accToggle'),
            h('span', { className: 'kit-demo-target', ref: tgtAcc }, '开合演示靶'))),
        // (d) sprite 图标墙
        h('section', null,
          h('h3', { className: 'kit-h' }, 'Sprite 图标墙'),
          h('div', { className: 'kit-iconwall' },
            icons.map(function (id) {
              return h('div', { className: 'kit-icell', key: id },
                h('svg', null, h('use', { href: '#' + id })),
                h('span', { className: 'kit-ilabel' }, esc(id)));
            }))))));
}
