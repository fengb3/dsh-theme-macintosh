// src/conv/think.js —— assistant-step 节点重写（验收四轮：缓冲区 + 定期吐出）
// 镜像同步：本段与 client.js McThink 段手工同源维护（audit 直接扫描 client.js 全文）。
// 差异：MC_PRIM 经 typeof require 守卫获取（loader 域 require 为工厂参数;CJS 测试域同样可用,
// require 失败静默 null → slots 不注册）。
var MC_PRIM = null;
try { if (typeof require === 'function') MC_PRIM = require("@deepseek-ai/dsh-client-ui-primitives"); } catch (e) { MC_PRIM = null; }

// 协议 { css, slots(ctx) }。遮蔽 conversation.chat.node keyed 槽 'assistant-step'
// (priority:-1 同侧栏先例);reasoning 块走我们自己的 McThinkCard(原型 showThinking 状态机
// L1362-1450 的 React 版:text prop 增量先进缓冲,500ms 周期末摘要 s-in 只装本次新字
// (白块=span 宽=字宽,零测宽)+正文追加 mc-app-cover 行内白块,100ms 揭盖;text/image 块
// 复用宿主 primitives MarkdownText/renderMessageImages 保真)。primitives 缺席时不注册
// (宿主原生渲染兜底)。选择器零宿主锚——全部 .mc-think 自有类,audit §5 安全。
// CJS shim 供 mcThinkTick 纯函数测试(src 镜像;loader 域 module 为自有 boilerplate)。
function mcThinkTick(shown, text, cap) {
  // 追加前缀不符 = 宿主整段重写:从头再来(base='')
  var base = shown && text.slice(0, shown.length) === shown ? shown : '';
  var rest = text.slice(base.length);
  var take = rest.slice(0, cap);
  return { shown: base + take, delta: take, rewritten: shown !== '' && base === '' };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mcThinkTick };
}
const MC_THINK_CAP = 140; // 每周期最多吐出字符数(对齐原型 PER_TICK=28 token 的节奏量级)
const McThink = {
  css: [
    /* AssistantMarkdown 布局平移(Sxvs8a_root/body/stopped → mc-amd-*;typography 由
       McFlow 的 F 段(.md 全要素)在 flowItem 级供给) */
    '.mc-amd-root{flex-direction:column;display:flex}',
    '.mc-amd-body{flex-direction:column;gap:16px;display:flex}',
    '.mc-amd-stopped{align-self:flex-start;padding:0 6px;font-size:11px;line-height:18px;border-radius:var(--mc-r-btn);background:var(--mc-surface-2);color:var(--mc-muted)}',
    /* 原型 .reasoning 段(interactive L339-366)平移,.mc-think 前缀 */
    '.mc-think{background:var(--mc-surface-3);border:1px solid var(--mc-border);border-radius:var(--mc-r-card);overflow:hidden}',
    '.mc-think.run{background:color-mix(in oklab,var(--mc-spark) 9%,var(--mc-surface-3))}',
    '.mc-think-head{display:flex;align-items:center;gap:6px;width:100%;padding:6px 9px;background:none;border:none;cursor:pointer;text-align:left;color:inherit}',
    '.mc-think-head .mc-think-tag{font:400 13px/1.3 \'FindersKeepers\',\'Fusion Pixel 12px monospaced zh\',\'Noto Sans SC\',monospace;letter-spacing:.03em;color:var(--mc-fg)}',
    '.mc-think.run .mc-think-head .mc-think-tag{color:var(--mc-spark)}',
    '.mc-think-head .mc-think-sum{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:400 12px/1.5 var(--font-ui);color:var(--mc-faint)}',
    '.mc-think-head .mc-think-dur{font:500 10px/1.5 var(--font-mono);color:var(--mc-faint);flex:none}',
    '.mc-think-body{overflow:hidden;height:auto}',
    '.mc-think:not(.open) .mc-think-body{height:0}',
    '.mc-think-body .mc-think-txt{padding:2px 9px 9px 26px;font:400 12px/1.8 var(--font-ui);color:var(--mc-muted);white-space:pre-wrap}',
    '.mc-think.run .mc-think-txt .mc-app-cover{color:transparent}',
    /* 摘要行五阶段节拍(验收五轮):A .mcut 旧字全透明 → B .flash 白块盖 → C 文本瞬换新字
       (span 宽即块宽,白块随新字变宽) → D 撤两类新字显现 → E 滞空一拍 */
    '.mc-think-head .mc-think-sum .s-in{position:relative}',
    '.mc-think-head .mc-think-sum .s-in.mcut{color:transparent}',
    '.mc-think-head .mc-think-sum .s-in::after{content:\'\';position:absolute;inset:-1px -2px;opacity:0;pointer-events:none;background:#fff;background-image:repeating-linear-gradient(0deg,transparent 0 2px,rgba(0,0,0,.06) 2px 3px)}',
    '.mc-think-head .mc-think-sum .s-in.flash::after{opacity:1}',
    'html[data-theme="light"] .mc-think-head .mc-think-sum .s-in::after{background:#000;background-image:repeating-linear-gradient(0deg,transparent 0 2px,rgba(255,255,255,.07) 2px 3px)}',
  ].join('\n'),
  slots(ctx) {
    if (!MC_PRIM || typeof React === 'undefined') return; // primitives 缺席:不遮蔽,宿主原生渲染兜底
    const S = ctx.slots;
    if (!S || typeof S.register !== 'function' || typeof S.inject !== 'function') return;
    const h = React.createElement;
    const MarkdownText = MC_PRIM.MarkdownText;
    const JsonBlock = MC_PRIM.JsonBlock;

    /* —— McThinkCard:缓冲积攒 + 周期吐出(原型 showThinking 状态机) ——
       摘要行五阶段节拍(验收五轮,用户逐拍定义;每拍 100ms,500ms 一循环):
       A 旧字全透明(color:transparent,.mcut) → B 白块盖住(.flash) → C 文本瞬换新字
       (span 宽即块宽,白块随新字变宽) → D 撤透明撤块(新字显现) → E 滞空一拍 */
    function McThinkCard(props) {
      var text = props.text || '', running = !!props.running;
      var st = React.useRef({ committed: '', pending: '', sum: '', ghost: false, block: false, open: false, timer: null, mounted: true });
      st.current.text = text;
      var cardRef = React.useRef(null);
      var version = React.useState(0), setV = version[1];
      function paint() { setV(function (x) { return x + 1; }); }
      function tick() {
        var s = st.current;
        if (!s.mounted || !s.running) return;
        var r = mcThinkTick(s.committed, s.text, MC_THINK_CAP);
        if (r.delta) {
          s.committed = r.shown;
          s.pending = r.delta;
          s.ghost = true;                                   /* A:旧字全透明 */
          paint();
          CLOCK.next(function () {                          /* B:白块盖住 */
            var s2 = st.current; if (!s2.mounted) return;
            s2.block = true; paint();
            CLOCK.next(function () {                        /* C:换新字(块随新字宽) */
              var s3 = st.current; if (!s3.mounted) return;
              s3.sum = r.delta.replace(/\n/g, ' '); paint();
              CLOCK.next(function () {                      /* D:撤透明撤块,新字显现 */
                var s4 = st.current; if (!s4.mounted) return;
                s4.ghost = false; s4.block = false; paint();
                CLOCK.next(function () {                    /* E:滞空一拍 */
                  var s5 = st.current; if (!s5.mounted) return;
                  s5.pending = ''; paint();
                }, 100);
              }, 100);
            }, 100);
          }, 100);
        }
        s.timer = CLOCK.next(tick, 500); // A+B+C+D+E = 500ms 一循环
      }
      React.useEffect(function () {
        var s = st.current; s.mounted = true;
        return function () { s.mounted = false; if (s.timer) { try { CLOCK.clear(s.timer); } catch (e) {} } };
      }, []);
      React.useEffect(function () {
        var s = st.current;
        s.running = running;
        if (running) {
          if (!s.timer) s.timer = CLOCK.next(tick, 200);
        } else {
          if (s.timer) { try { CLOCK.clear(s.timer); } catch (e) {} s.timer = null; }
          s.committed = text; s.pending = ''; s.ghost = false; s.block = false;
          s.sum = text ? (text.length > 26 ? text.slice(0, 26) + '…' : text) : '';
          paint();
        }
      }, [running]);
      function toggleCard() {
        var card = cardRef.current; if (!card) return;
        accToggle(card, function () { st.current.open = !st.current.open; paint(); });
      }
      var s = st.current;
      var sInCls = 's-in' + (s.ghost ? ' mcut' : '') + (s.block ? ' flash' : '');
      return h('div', { className: 'mc-think' + (running ? ' run' : '') + (s.open ? ' open' : ''), ref: cardRef },
        h('button', { className: 'mc-think-head', type: 'button', onClick: toggleCard },
          h('svg', { className: 'mc-tri' + (s.open ? ' open' : ''), 'aria-hidden': true }, h('use', { href: '#i-tri' })),
          h('span', { className: 'mc-think-tag' }, 'Think'),
          h('span', { className: 'mc-think-sum' },
            h('span', { className: sInCls }, running ? (s.sum || '正在思考…') : s.sum)),
          h('span', { className: 'mc-think-dur' }, running ? 'streaming' : '')),
        h('div', { className: 'mc-think-body' },
          h('div', { className: 'mc-think-txt' }, s.committed,
            s.pending ? h('span', { className: 'mc-app-cover' }, s.pending) : null)));
    }

    /* —— McAssistantNodeView:AssistantMarkdown 平移(L9476-9537) ——
       text→MarkdownText(宿主保真)/reasoning→McThinkCard/image→renderMessageImages/
       tool-call→跳过/其他→JsonBlock;mentions 复刻 owner 判定(useTurnData 可选)。 */
    function McAssistantNodeView(props) {
      var node = props.node, data = (node && node.data) || {};
      var blocks = data.blocks || [];
      var streaming = data.status === 'running';
      var interrupted = data.status === 'interrupted';
      var renderMessageImages = props.renderMessageImages, fileMentions = props.fileMentions;
      var useTurnData = props.useTurnData, openFile = props.openFile;
      var tail = useTurnData ? useTurnData('turn-tail') : undefined;
      var turn = node && (node.location.kind === 'turn' || node.location.kind === 'step') ? node.location.turn : undefined;
      var mentions = React.useMemo(function () {
        try {
          if (turn === undefined || (turn && turn.status) !== 'closed' || data.finalNode === undefined) return undefined;
          if (tail && tail.closing && tail.closing.finalNode && tail.closing.finalNode.seq !== data.finalNode.seq) return undefined;
          return fileMentions({ turn: turn, seq: data.finalNode.seq, openFile: openFile });
        } catch (e) { return undefined; }
      }, [tail, turn, data.finalNode, openFile]);
      if (!(streaming || interrupted === true || blocks.some(function (b) { return b.kind !== 'tool-call'; }))) return null;
      var codeLabels = { copyLabel: '复制', copiedLabel: '已复制' };
      var rendered = [];
      var last = blocks.length - 1;
      for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        if (block === undefined) continue;
        if (block.kind === 'text') {
          rendered.push(h(MarkdownText, { key: i, text: block.text, streaming: streaming, codeLabels: codeLabels, fileMentions: mentions }));
        } else if (block.kind === 'reasoning') {
          rendered.push(h(McThinkCard, { key: i, text: block.text, running: streaming && i === last }));
        } else if (block.kind === 'image') {
          var start = i, group = [block];
          while (i + 1 < blocks.length) {
            var next = blocks[i + 1];
            if (next === undefined || next.kind !== 'image') break;
            group.push(next); i += 1;
          }
          rendered.push(h(React.Fragment, { key: start }, renderMessageImages({ images: group.map(function (g) { return { attachment: g.attachment }; }), align: 'start' })));
        } else if (block.kind !== 'tool-call') {
          rendered.push(h(JsonBlock, { key: i, label: 'unknown', payload: block.block }));
        }
      }
      return h('div', { className: 'mc-amd-root', 'data-streaming': streaming || undefined },
        h('div', { className: 'mc-amd-body' }, rendered,
          interrupted ? h('span', { className: 'mc-amd-stopped' }, '已停止') : null));
    }

    ctx.effect(() => S.inject('conversation.chat.node', () => S.register({
      name: 'conversation.chat.node',
      key: 'assistant-step',
      priority: -1,
      registrant: 'macintosh',
    }, McAssistantNodeView)));
  },
};
