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
    /* 用户/steering 行重写(验收六轮):原型 .msg.user .bubble L316-321 语汇;右对齐纵栈 */
    '.mc-user-row{display:flex;flex-direction:column;align-items:flex-end;gap:6px;max-width:100%}',
    '.mc-user-bubble{max-width:520px;padding:7px 12px;background:var(--mc-accent);color:var(--mc-accent-ink);border:1px solid var(--mc-border);border-radius:8px;font:400 14px/1.7 var(--font-ui);white-space:pre-wrap;word-break:break-word;text-align:left}',
    /* 六轮排查:宿主 MessageText 根结点自带 border+padding(_text_* 双边框元凶)——气泡内一律剥净 */
    '.mc-user-bubble>*{border:none!important;padding:0!important;margin:0!important;background:none!important}',
    '.mc-user-copy{flex:none;align-self:flex-end;border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);padding:1px 7px;background:var(--mc-surface-2);color:var(--mc-muted);font:500 10px/1.6 var(--font-mono);cursor:pointer}',
    '.mc-user-chip{border:1px solid var(--mc-border);border-radius:var(--mc-r-tag);padding:0 4px;background:var(--mc-accent-strong);font:500 12px var(--font-mono)}',
    '.mc-user-attach{max-width:360px;display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap}',
    '.mc-user-ref{font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}',
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
    /* 摘要行文字 A→B(验收六轮改版):统一走 lib accToggle 五拍——
       t0 旧字透明(.mc-ghost+color:transparent) → t100 白块盖 → t200 文本瞬换新字
       (mcfx::after 随 span 宽) → t300 同撤两类新字显现 → t400 滞空(周期余量) */
    '.mc-think-head .mc-think-sum .s-in{position:relative}',
    '.mc-think-head .mc-think-sum .s-in.mc-ghost{color:transparent}',
  ].join('\n'),
  slots(ctx) {
    if (!MC_PRIM || typeof React === 'undefined') return; // primitives 缺席:不遮蔽,宿主原生渲染兜底
    const S = ctx.slots;
    if (!S || typeof S.register !== 'function' || typeof S.inject !== 'function') return;
    const h = React.createElement;
    const MarkdownText = MC_PRIM.MarkdownText;
    const JsonBlock = MC_PRIM.JsonBlock;

    /* —— McThinkCard:缓冲积攒 + 周期吐出(原型 showThinking 状态机) ——
       摘要文字 A→B 与 running→完成 换形统一走 lib accToggle(验收六轮改版):
       t0 旧字/旧形透明 → t100 白块盖 → t200 瞬换 → t300 同撤两类 → t400 滞空 */
    function McThinkCard(props) {
      var text = props.text || '', running = !!props.running;
      var st = React.useRef({ committed: '', pending: '', sum: '', open: false, timer: null, mounted: true, wasRunning: false });
      st.current.text = text;
      var cardRef = React.useRef(null);
      var sumRef = React.useRef(null);
      var version = React.useState(0), setV = version[1];
      function paint() { setV(function (x) { return x + 1; }); }
      function tick() {
        var s = st.current;
        if (!s.mounted || !s.running) return;
        var r = mcThinkTick(s.committed, s.text, MC_THINK_CAP);
        if (r.delta) {
          // 原型帧 B/A 协议 + 六轮统一节拍:正文与摘要同一条时间轴——
          // t0 白块(pending 尾段)与摘要 ghost 同拍出现,t300 与摘要同拍揭开(零高度抽搐,刷新规律一致)
          s.committed = r.shown;
          s.pending = r.delta;
          paint();
          var spanEl = sumRef.current;
          var swap = function () { s.sum = r.delta.replace(/\n/g, ' '); paint(); };
          if (spanEl) accToggle(spanEl, swap); else swap();
          CLOCK.next(function () { // t300 揭盖:与摘要 accToggle 拍3(同撤 flash+ghost)同步
            var s6 = st.current; if (!s6.mounted) return;
            s6.pending = ''; paint();
          }, 300);
        }
        s.timer = CLOCK.next(tick, 700); // accToggle 五拍 500ms + 滞空 200ms(文本驻留可读)
      }
      React.useEffect(function () {
        var s = st.current; s.mounted = true;
        return function () { s.mounted = false; if (s.timer) { try { CLOCK.clear(s.timer); } catch (e) {} } };
      }, []);
      React.useEffect(function () {
        var s = st.current;
        var wasRunning = s.wasRunning; s.wasRunning = running;
        s.running = running;
        if (running) {
          if (!s.timer) s.timer = CLOCK.next(tick, 200);
        } else {
          if (s.timer) { try { CLOCK.clear(s.timer); } catch (e) {} s.timer = null; }
          // 六轮改版:running→完成 属「形 A→形 B」状态切换,统一走 accToggle(白块盖住期间定格);
          // 历史存量卡首挂不闪
          var settle = function () {
            s.committed = text; s.pending = ''; s.sum = text ? (text.length > 26 ? text.slice(0, 26) + '…' : text) : '';
            paint();
          };
          if (wasRunning && cardRef.current) accToggle(cardRef.current, settle);
          else settle();
        }
      }, [running]);
      function toggleCard() {
        var card = cardRef.current; if (!card) return;
        accToggle(card, function () { st.current.open = !st.current.open; paint(); });
      }
      var s = st.current;
      return h('div', { className: 'mc-think' + (running ? ' run' : '') + (s.open ? ' open' : ''), ref: cardRef },
        h('button', { className: 'mc-think-head', type: 'button', onClick: toggleCard },
          h('svg', { className: 'mc-tri' + (s.open ? ' open' : ''), 'aria-hidden': true }, h('use', { href: '#i-tri' })),
          h('span', { className: 'mc-think-tag' }, 'Think'),
          h('span', { className: 'mc-think-sum' },
            h('span', { className: 's-in', ref: sumRef }, running ? (s.sum || '正在思考…') : s.sum)),
          h('span', { className: 'mc-think-dur' }, running ? 'streaming' : '')),
        h('div', { className: 'mc-think-body' },
          h('div', { className: 'mc-think-txt' },
            (s.pending && s.committed.slice(-s.pending.length) === s.pending) ? s.committed.slice(0, s.committed.length - s.pending.length) : s.committed,
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

    /* —— McUserNodeView:用户/steering 行重写(验收六轮)——
       官方 UserMessageNodeView(L5393-5408)平移:content 块拆 text/images/rest;气泡为
       自有 .mc-user-bubble(原型 .msg.user .bubble L318-321 语汇),出场走 lib flashIn
       挂在气泡自身——白块=inset:0=气泡面积,不再整行铺白(此前观察器挂 flowItem 之弊);
       @引用//命令 chip 为自有 .mc-user-chip 类(audit §5 安全)。 */
    function mcProjectUserText(h, MessageText, text, referenceLabels) {
      var ranges = [];
      var labels = [];
      try { labels = Array.from(new Set(referenceLabels || [])).sort(function (a, b) { return b.length - a.length; }); } catch (e) {}
      for (var li = 0; li < labels.length; li++) {
        var lab = '@' + labels[li], st2 = text.indexOf(lab);
        while (st2 >= 0) { ranges.push({ start: st2, end: st2 + lab.length, label: lab, kind: 'session' }); st2 = text.indexOf(lab, st2 + lab.length); }
      }
      var re = /(^|\s)(\/[\w-]+|@"[^"\n]+"|@[^\s]+)/gu, m;
      while ((m = re.exec(text)) !== null) {
        var ts = m.index + (m[1] ? m[1].length : 0);
        var raw = m[2] || '';
        var lab2 = raw.indexOf('@"') === 0 ? raw : raw.replace(/[.,;:!?，。；：！？]+$/gu, '');
        if (lab2.length <= 1) continue;
        ranges.push({ start: ts, end: ts + lab2.length, label: lab2, kind: 'plain' });
      }
      ranges.sort(function (a, b) { return a.start - b.start || (a.kind === b.kind ? b.end - a.end : a.kind === 'session' ? -1 : 1); });
      var parts = [], cur = 0;
      for (var i = 0; i < ranges.length; i++) {
        var r = ranges[i];
        if (r.start < cur) continue;
        var kind = r.kind === 'session' ? 'session' : r.label.indexOf('@') === 0 ? (r.label.slice(-1) === '/' ? 'folder' : 'file') : 'skill';
        if (r.start > cur) parts.push(h(MessageText, { key: 't' + cur, text: text.slice(cur, r.start) }));
        parts.push(h('span', { key: 'c' + r.start, className: 'mc-user-chip', title: r.label }, r.label));
        cur = r.end;
      }
      if (!parts.length) return h(MessageText, { text: text });
      if (cur < text.length) parts.push(h(MessageText, { key: 't' + cur, text: text.slice(cur) }));
      return h(React.Fragment, null, parts);
    }
    function McUserNodeView(props) {
      var node = props.node, data = (node && node.data) || {};
      var renderMessageImages = props.renderMessageImages;
      var MessageText = MC_PRIM.MessageText;
      var texts = [], images = [], rest = [];
      var content = data.content || [];
      for (var i = 0; i < content.length; i++) {
        var b = content[i];
        if (b && b.type === 'text' && typeof b.text === 'string') texts.push(b.text);
        else if (b && b.type === 'image' && b.attachment !== undefined) images.push({ attachment: b.attachment });
        else rest.push(b);
      }
      var text = texts.join('');
      var bubbleRef = React.useRef(null);
      React.useEffect(function () { // 出场:气泡自身三拍(ghost→白块→显现),白块面积=气泡
        var el = bubbleRef.current;
        if (el) flashIn(el, function () {});
      }, []);
      var refs = data.referenceLabels;
      var copied = React.useState(false), setCopied = copied[1];
      function doCopy() { // 六轮:复制钮(用户输入内容可一键复制;反馈回落走 CLOCK)
        try { navigator.clipboard.writeText(text); } catch (e) {}
        setCopied(true);
        CLOCK.next(function () { setCopied(false); }, 1200);
      }
      return h('div', { className: 'mc-user-row' },
        images.length ? h('div', { className: 'mc-user-attach' }, renderMessageImages({ images: images, align: 'end' })) : null,
        (text !== '' || rest.length) ? h('div', { className: 'mc-user-bubble', ref: bubbleRef },
          mcProjectUserText(h, MessageText, text, refs),
          rest.map(function (b2, j) { return h(JsonBlock, { key: 'r' + j, label: 'extra', payload: b2 }); })) : null,
        text !== '' ? h('button', { className: 'mc-user-copy', type: 'button', onClick: doCopy }, copied[0] ? '已复制' : '复制') : null,
        refs && refs.length ? h('div', { className: 'mc-user-ref' }, '引用 · ' + refs.join(' · ')) : null);
    }
    ctx.effect(() => S.inject('conversation.chat.node', () => S.register({
      name: 'conversation.chat.node',
      key: 'user',
      priority: -1,
      registrant: 'macintosh',
    }, McUserNodeView)));
    ctx.effect(() => S.inject('conversation.chat.node', () => S.register({
      name: 'conversation.chat.node',
      key: 'steering',
      priority: -1,
      registrant: 'macintosh',
    }, McUserNodeView)));
  },
};
