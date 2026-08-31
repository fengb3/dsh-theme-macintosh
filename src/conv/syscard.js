// src/conv/syscard.js —— 系统卡四族重写（验收七轮：上下文注入 / 自动·手动压缩 / 模型重试）
// 镜像同步：本段与 client.js McSysCard 段手工同源维护（audit 直接扫描 client.js 全文）。
// 协议 { css, slots(ctx) }。遮蔽 conversation.chat.node keyed 槽 'context' / 'compaction' /
// 'manual-compaction' / 'model-retry'（priority:-1 同 user/assistant-step 先例）——宿主卡整体
// 替换为自有 DOM（真·重绘，非 CSS 套壳）；primitives 缺席时不注册（宿主原生渲染兜底）。
// 动效纪律（验收六轮改版沿用）：出场 = flowItem 行级 flashIn（McFlow 观察器供给）；折叠开合与
// 状态切换（压缩中→已压缩 / 重试 scheduled→started·cancelled）= lib accToggle 四拍，文字 A→B
// 挂 .s-in span（ghost 拍 color:transparent，白块随 span 宽）；REDUCED 全跳过功能不受影响。
// 纯函数经 CJS 兼容出口供测试 createRequire 使用。
var MC_SYS_PRIM = null;
try { if (typeof require === 'function') MC_SYS_PRIM = require("@deepseek-ai/dsh-client-ui-primitives"); } catch (e) { MC_SYS_PRIM = null; }

// 图标位 data-URI（与 McFlow 注入条四型同款；本段自持副本保持自包含，避免拼接顺序耦合）
const MC_SYS_ICON_DOC = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 10'%3E%3Cpath fill='%23000' fill-rule='evenodd' clip-rule='evenodd' d='M0 0H6V1H8V10H0V0ZM7 3H5V1H1V9H7V3Z'/%3E%3Cpath fill='%23000' d='M5 1H1V9H7V3H5V1Z'/%3E%3C/svg%3E";
const MC_SYS_ICON_LIST = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M2 5h20v14H2V5zm2 2v2h16V7H4zm16 4H4v2h16v-2zm0 4H4v2h16v-2z'/%3E%3C/svg%3E";
const MC_SYS_ICON_COPY = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M4 2h11v2H6v13H4V2zm4 4h12v16H8V6zm2 2v12h8V8h-8z'/%3E%3C/svg%3E";
const MC_SYS_ICON_CLOCK = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M19 3H5v2H3v14h2v2h14v-2h2V5h-2V3zm0 2v14H5V5h14zm-8 2h2v6h4v2h-6V7z'/%3E%3C/svg%3E";

// —— 纯函数（测试出口）——
// 压缩条一行摘要：全空 = 压缩进行中；双计数 = 完成语；有摘要无计数 = 展开提示；余 = 不可用/命令文案
function mcCompactionLine(summary, items, tokens, fallback) {
  if (items === null && tokens === null) return fallback ? String(fallback) : '正在压缩…';
  if (items !== null && tokens !== null) return '已压缩 ' + items + ' 条历史记录（约 ' + tokens + ' tokens）';
  return fallback ? String(fallback) : '压缩摘要不可用';
}
// 重试卡文案三件：active（=scheduled，八角点脉冲）+ 标签 + 上限（normal=数字 / 其余=∞）
function mcRetryParts(cur) {
  var state = cur ? cur.retryState : '';
  var active = state === 'scheduled';
  var label = active ? '正在重试模型请求'
    : state === 'cancelled' ? '模型请求重试已取消'
    : state === 'started' ? '已重试模型请求'
    : '等待重试模型请求';
  var maximum = cur && cur.mode === 'normal' ? cur.maxRetries : '∞';
  return { active: active, label: label, maximum: maximum };
}
// 上下文注入正文：文本块按模型所见顺序连缀（相邻无分隔），超 cap 截断；非文本块另册走 JsonBlock
function mcContextText(content, cap) {
  var out = '';
  try {
    var blocks = content || [];
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      if (b && b.type === 'text' && typeof b.text === 'string') out += b.text;
      if (out.length >= cap) return out.slice(0, cap) + '…';
    }
  } catch (e) { /* 结构漂移 → 空正文，条头照常 */ }
  return out;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mcCompactionLine, mcRetryParts, mcContextText };
}

const MC_SYS_TEXT_CAP = 20000; // 宿主 ModelFacingContent 同款上界（20k chars）

const McSysCard = {
  css: [
    /* —— 注入条（context）：虚线壳 + 表单图标；head 全宽按钮，body 折叠 height:0 —— */
    '.mc-inject-head{display:flex;align-items:center;gap:7px;box-sizing:border-box;width:100%;padding:7px 9px;background:var(--mc-surface-2);border:1px dashed var(--mc-border-soft);border-radius:var(--mc-r-card);font:400 12px/1.7 var(--font-ui);color:var(--mc-muted);cursor:pointer;text-align:left}',
    '.mc-inject-head::before{content:"";flex:none;width:15px;height:15px;background-color:var(--mc-faint);-webkit-mask:url("data:image/svg+xml,' + MC_SYS_ICON_DOC + '") center/contain no-repeat;mask:url("data:image/svg+xml,' + MC_SYS_ICON_DOC + '") center/contain no-repeat}',
    '.mc-inject[data-mc-form="catalog"] .mc-inject-head::before{-webkit-mask-image:url("data:image/svg+xml,' + MC_SYS_ICON_LIST + '");mask-image:url("data:image/svg+xml,' + MC_SYS_ICON_LIST + '")}',
    '.mc-inject[data-mc-form="snapshot"] .mc-inject-head::before{-webkit-mask-image:url("data:image/svg+xml,' + MC_SYS_ICON_COPY + '");mask-image:url("data:image/svg+xml,' + MC_SYS_ICON_COPY + '")}',
    '.mc-inject[data-mc-form="recall"] .mc-inject-head::before,.mc-inject[data-mc-role="recall"] .mc-inject-head::before{-webkit-mask-image:url("data:image/svg+xml,' + MC_SYS_ICON_CLOCK + '");mask-image:url("data:image/svg+xml,' + MC_SYS_ICON_CLOCK + '")}',
    '.mc-inject-head .mc-tri{flex:none;width:8px;height:8px;color:var(--mc-faint);transition:none}',
    '.mc-inject-src{flex:none;max-width:40%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--mc-faint)}',
    '.mc-inject-sum{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--mc-faint)}',
    '.mc-inject-body{height:0;overflow:hidden}',
    '.mc-inject.open .mc-inject-body{height:auto}',
    '.mc-inject-body-in{padding:4px 9px 8px 24px;font:400 12px/1.7 var(--font-ui);color:var(--mc-muted);white-space:pre-wrap;word-break:break-word}',
    /* —— 压缩条（compaction / manual-compaction）：同注入条语汇 + copy 图标；摘要文字 A→B 走 .s-in —— */
    '.mc-comp-head{display:flex;align-items:center;gap:7px;box-sizing:border-box;width:100%;padding:7px 9px;background:var(--mc-surface-2);border:1px dashed var(--mc-border-soft);border-radius:var(--mc-r-card);font:400 12px/1.7 var(--font-ui);color:var(--mc-muted);cursor:pointer;text-align:left}',
    '.mc-comp-head::before{content:"";flex:none;width:15px;height:15px;background-color:var(--mc-faint);-webkit-mask:url("data:image/svg+xml,' + MC_SYS_ICON_COPY + '") center/contain no-repeat;mask:url("data:image/svg+xml,' + MC_SYS_ICON_COPY + '") center/contain no-repeat}',
    '.mc-comp-head[disabled]{cursor:default}',
    '.mc-comp-head .mc-tri{flex:none;width:8px;height:8px;color:var(--mc-faint);transition:none}',
    '.mc-comp-sum{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.mc-comp-sum .s-in{position:relative}',
    '.mc-comp-sum .s-in.mc-ghost{color:transparent}',
    '.mc-comp-body{height:0;overflow:hidden}',
    '.mc-comp.open .mc-comp-body{height:auto}',
    '.mc-comp-body-in{padding:2px 9px 9px 26px;font:400 12px/1.8 var(--font-ui);color:var(--mc-muted)}',
    /* —— 重试条（model-retry）：实线 soft 壳 + 八角点（scheduled 脉冲）；状态文字 A→B 走 .s-in —— */
    '.mc-retry-head{display:flex;align-items:center;gap:8px;box-sizing:border-box;width:100%;padding:6px 9px;background:var(--mc-surface-2);border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card);font:400 12px/1.6 var(--font-ui);color:var(--mc-muted);cursor:pointer;text-align:left}',
    '.mc-retry-dot{flex:none;width:6px;height:6px;background:var(--mc-spark);clip-path:polygon(33% 0,67% 0,100% 33%,100% 67%,67% 100%,33% 100%,0 67%,0 33%)}',
    '.mc-retry.run .mc-retry-dot{animation:mc-pulse 2600ms steps(1,end) infinite;animation-delay:var(--pulse-delay,0ms)}',
    '.mc-retry-txt{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.mc-retry-txt .s-in{position:relative}',
    '.mc-retry-txt .s-in.mc-ghost{color:transparent}',
    '.mc-retry-head .mc-tri{flex:none;width:8px;height:8px;color:var(--mc-faint);transition:none}',
    '.mc-retry-body{height:0;overflow:hidden}',
    '.mc-retry.open .mc-retry-body{height:auto}',
    '.mc-retry-body-in{display:flex;flex-direction:column;gap:2px;padding:4px 9px 8px 23px;font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}',
    '.mc-retry-body-in b{font-weight:500;color:var(--mc-faint)}',
    '.mc-inject-tt,.mc-comp-tt{flex:none;white-space:nowrap}',
  ].join('\n'),
  slots(ctx) {
    if (!MC_SYS_PRIM || typeof React === 'undefined') return; // primitives 缺席:不遮蔽,宿主原生渲染兜底
    const S = ctx.slots;
    if (!S || typeof S.register !== 'function' || typeof S.inject !== 'function') return;
    const h = React.createElement;
    const MarkdownText = MC_SYS_PRIM.MarkdownText;
    const JsonBlock = MC_SYS_PRIM.JsonBlock;
    let REDUCED = false;
    try { REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    // 持值切换：props 变化不在提交拍直出，而是包进 accToggle 四拍（t100 白块遮盖的同时瞬变）；
    // busy 期间到的新值直接落地（accToggle 防重入会吞 fn —— 不丢更新优先）；REDUCED 直出
    function mcSwap(el, apply) {
      if (REDUCED || !el || !el.isConnected || (el.dataset && el.dataset.busy)) { apply(); return; }
      accToggle(el, apply);
    }
    // 折叠开合（卡头点击）：REDUCED/busy 直翻，否则四拍（几何变化发生在白块遮盖下）
    function mcFold(card, flip) {
      if (!card) { flip(); return; }
      if (REDUCED || (card.dataset && card.dataset.busy)) { flip(); return; }
      accToggle(card, flip);
    }

    /* —— McContextNodeView：上下文注入条（keyed 'context'）——
       条头 = 表单图标 + 标题（跨会话召回/上下文注入）+ 来源 label + notice 摘要；
       展开体 = 文本块连缀（模型所见顺序，20k 截断）+ 非文本块 JsonBlock。 */
    function McContextNodeView(props) {
      var node = props.node, data = (node && node.data) || {};
      var prov = data.provenance || {};
      var role = prov.role || '';
      var form = data.form || '';
      var notice = '';
      try { var sm = (data.source || {}).summary; if (typeof sm === 'string' && sm) notice = sm; } catch (e) {}
      var rest = [];
      try {
        var blocks = data.content || [];
        for (var i = 0; i < blocks.length; i++) if (!(blocks[i] && blocks[i].type === 'text')) rest.push(blocks[i]);
      } catch (e) {}
      var st = React.useRef({ open: false });
      var cardRef = React.useRef(null);
      var v = React.useState(0), setV = v[1];
      function toggle() {
        var card = cardRef.current;
        mcFold(card, function () { st.current.open = !st.current.open; setV(function (x) { return x + 1; }); });
      }
      return h('div', { className: 'mc-inject' + (st.current.open ? ' open' : ''), ref: cardRef, 'data-mc-form': form, 'data-mc-role': role },
        h('button', { className: 'mc-inject-head', type: 'button', onClick: toggle, 'aria-expanded': st.current.open ? 'true' : 'false' },
          h('span', { className: 'mc-inject-tt' }, role === 'recall' ? '跨会话召回' : '上下文注入'),
          prov.label ? h('span', { className: 'mc-inject-src' }, String(prov.label)) : null,
          notice ? h('span', { className: 'mc-inject-sum' }, notice) : null,
          h('svg', { className: 'mc-tri' + (st.current.open ? ' open' : ''), 'aria-hidden': true }, h('use', { href: '#i-tri' }))),
        h('div', { className: 'mc-inject-body' },
          h('div', { className: 'mc-inject-body-in' },
            mcContextText(data.content, MC_SYS_TEXT_CAP),
            rest.map(function (b, j) { return h(JsonBlock, { key: 'r' + j, label: 'extra', payload: b }); }))));
    }

    /* —— McCompactionBar：压缩条共用体（自动 compaction / 手动 manual-compaction）——
       摘要行文字 A→B（正在压缩…→已压缩 N 条…）走 .s-in accToggle；折叠体 = 摘要 markdown。 */
    function McCompactionBar(props) {
      var d = props.node || {};
      var summary = d.summary == null ? null : String(d.summary);
      var items = d.shadowedItemCount == null ? null : d.shadowedItemCount;
      var tokens = d.shadowedTokenCount == null ? null : d.shadowedTokenCount;
      var fallback = props.fallback || '';
      var line = mcCompactionLine(summary, items, tokens, fallback);
      var expandable = summary !== null;
      var st = React.useRef({ open: false, line: line, mounted: true });
      var cardRef = React.useRef(null);
      var inRef = React.useRef(null);
      var v = React.useState(0), setV = v[1];
      React.useEffect(function () { st.current.mounted = true; return function () { st.current.mounted = false; }; }, []);
      React.useEffect(function () { // 状态切换（验收六轮裁定）：压缩中→完成 文字换形走四拍
        var s = st.current;
        if (s.line === line) return;
        var apply = function () { s.line = line; if (s.mounted) setV(function (x) { return x + 1; }); };
        mcSwap(inRef.current, apply);
      }, [line]);
      function toggle() {
        if (!expandable) return;
        var card = cardRef.current;
        mcFold(card, function () { st.current.open = !st.current.open; setV(function (x) { return x + 1; }); });
      }
      return h('div', { className: 'mc-comp' + (st.current.open ? ' open' : ''), ref: cardRef },
        h('button', { className: 'mc-comp-head', type: 'button', onClick: toggle, disabled: !expandable, 'aria-expanded': expandable ? (st.current.open ? 'true' : 'false') : undefined },
          h('span', { className: 'mc-comp-tt' }, props.title || '上下文已压缩'),
          h('span', { className: 'mc-comp-sum' }, h('span', { className: 's-in', ref: inRef }, st.current.line)),
          expandable ? h('svg', { className: 'mc-tri' + (st.current.open ? ' open' : ''), 'aria-hidden': true }, h('use', { href: '#i-tri' })) : null),
        h('div', { className: 'mc-comp-body' },
          h('div', { className: 'mc-comp-body-in' }, expandable ? h(MarkdownText, { text: summary }) : null)));
    }

    function McCompactionNodeView(props) {
      var node = props.node;
      return h(McCompactionBar, { node: (node && node.data) || {}, title: '上下文已压缩' });
    }

    /* 手动 /compact：压缩事务落定前 = compact · 正在压缩…；落定后与自动卡同款（fallback=命令文案） */
    function McManualCompactionNodeView(props) {
      var data = (props.node && props.node.data) || {};
      var command = data.command || {};
      var fallback = '';
      try { if (command.outcome && typeof command.outcome.text === 'string') fallback = command.outcome.text; } catch (e) {}
      return h(McCompactionBar, {
        node: data.compaction || { summary: null, shadowedItemCount: null, shadowedTokenCount: null },
        title: 'compact', fallback: fallback || '',
      });
    }

    /* —— McRetryNodeView：模型重试条（keyed 'model-retry'）——
       八角点 scheduled 脉冲（相位 CLOCK.syncAnim 注入）；状态文字 A→B（scheduled→started/
       cancelled）走 .s-in accToggle；倒计时 CLOCK 1s 栅格递减；详情折叠 = 延迟 + 失败原因。 */
    function McRetryNodeView(props) {
      var data = (props.node && props.node.data) || {};
      var cur = data.current || {};
      var parts = mcRetryParts(cur);
      var active = parts.active;
      var maximum = parts.maximum;
      var st = React.useRef({ open: false, label: parts.label, retry: cur.retry, mounted: true });
      var cardRef = React.useRef(null);
      var txtRef = React.useRef(null);
      var dotRef = React.useRef(null);
      var v = React.useState(0), setV = v[1];
      var secState = React.useState(Math.max(1, Math.ceil((cur.delayMs || 0) / 1000)));
      var sec = secState[0], setSec = secState[1];
      React.useEffect(function () { st.current.mounted = true; return function () { st.current.mounted = false; }; }, []);
      React.useEffect(function () { // 八角点相位（与主流程脉冲同栅格不交错）
        try { if (dotRef.current && CLOCK && typeof CLOCK.syncAnim === 'function') CLOCK.syncAnim(dotRef.current, CLOCK.PULSE, '--pulse-delay'); } catch (e) {}
      }, []);
      var stateKey = parts.label + '/' + cur.retry + '/' + maximum;
      React.useEffect(function () { // 状态切换：等待中→重试中/已重试/已取消 文字换形走四拍
        var prev = st.current.stateKey;
        st.current.stateKey = stateKey;
        if (prev === undefined) return; // 首挂不闪（历史存量卡）
        if (prev === stateKey) return;
        var apply = function () { st.current.label = parts.label; st.current.retry = cur.retry; st.current.maximum = maximum; if (st.current.mounted) setV(function (x) { return x + 1; }); };
        mcSwap(txtRef.current, apply);
      }, [stateKey]);
      React.useEffect(function () { // 倒计时：active 每秒递减到 1 停；非 active 静态展示
        var total = Math.max(1, Math.ceil((cur.delayMs || 0) / 1000));
        setSec(total);
        if (!active) return;
        var left = total, timer = null;
        var step = function () {
          left -= 1;
          if (left < 1) { setSec(1); return; }
          setSec(left);
          timer = CLOCK.next(step, 1000);
        };
        timer = CLOCK.next(step, 1000);
        return function () { if (timer) { try { CLOCK.clear(timer); } catch (e) {} } };
      }, [active, cur.seq, cur.delayMs]);
      function toggle() {
        var card = cardRef.current;
        mcFold(card, function () { st.current.open = !st.current.open; setV(function (x) { return x + 1; }); });
      }
      return h('div', { className: 'mc-retry' + (active ? ' run' : '') + (st.current.open ? ' open' : ''), ref: cardRef },
        h('button', { className: 'mc-retry-head', type: 'button', onClick: toggle, 'aria-expanded': st.current.open ? 'true' : 'false' },
          h('span', { className: 'mc-retry-dot', ref: dotRef }),
          h('span', { className: 'mc-retry-txt' },
            h('span', { className: 's-in', ref: txtRef }, st.current.label + '（' + st.current.retry + '/' + st.current.maximum + '） · ' + sec + 's')),
          h('svg', { className: 'mc-tri' + (st.current.open ? ' open' : ''), 'aria-hidden': true }, h('use', { href: '#i-tri' }))),
        h('div', { className: 'mc-retry-body' },
          h('div', { className: 'mc-retry-body-in' },
            h('div', null, h('b', null, '重试延迟：'), Math.round(cur.delayMs || 0) + 'ms'),
            h('div', null, h('b', null, '失败原因：'), (cur.failure && cur.failure.message) || '—'))));
    }

    ctx.effect(() => S.inject('conversation.chat.node', () => S.register({
      name: 'conversation.chat.node', key: 'context', priority: -1, registrant: 'macintosh',
    }, McContextNodeView)));
    ctx.effect(() => S.inject('conversation.chat.node', () => S.register({
      name: 'conversation.chat.node', key: 'compaction', priority: -1, registrant: 'macintosh',
    }, McCompactionNodeView)));
    ctx.effect(() => S.inject('conversation.chat.node', () => S.register({
      name: 'conversation.chat.node', key: 'manual-compaction', priority: -1, registrant: 'macintosh',
    }, McManualCompactionNodeView)));
    ctx.effect(() => S.inject('conversation.chat.node', () => S.register({
      name: 'conversation.chat.node', key: 'model-retry', priority: -1, registrant: 'macintosh',
    }, McRetryNodeView)));
  },
};
