// src/conv/tool.js —— 工具卡重绘（spec 2026-09-02 toolcard 批）
// 遮蔽 conversation.chat.node keyed 槽 'tool-call'（priority:-1 同 think/syscard 先例）——
// 官方 ToolCallTree 整体替换为自有 .mc-tool* DOM（原型 §7 L705-763 语汇）；内容体两级：
// wire view 结构化材料 → primitives Block 保真（TerminalBlock/DiffBlock/ReadBlock/
// SearchBlock/WebBlock），未命中 → JsonBlock(argsRaw) + text 连缀。primitives 缺席时
// 不注册（宿主原生渲染兜底）。纯函数经 CJS 兼容出口供测试 createRequire 使用。

// —— 官方变体表（dsh-client-ui-tool TOOL_VARIANTS 照抄；用户裁定：图标全用 DSH 默认）——
var MC_TOOL_VARIANTS = {
  bash: 'bash', pwsh: 'bash', read: 'read', web_fetch: 'read', web_search: 'search',
  grep: 'search', glob: 'search', write: 'write', edit: 'edit', run_code: 'code',
  cordis_package_inspect: 'read', cordis_runtime_inspect: 'read',
  cordis_run: 'others', cordis_stop: 'others', cordis_undefine: 'others',
};

// 参数摘要取值键：按工具名优先键表（grep 取 pattern 非 path 之类），未列名走扁表白名单
var MC_TOOL_ARG_KEYS = ['path', 'file_path', 'command', 'pattern', 'query', 'url',
  'objective', 'prompt', 'name', 'agent_id', 'job_id', 'description', 'title'];
var MC_TOOL_ARG_PICK = {
  grep: ['pattern'], glob: ['pattern'], web_search: ['queries', 'query'], web_fetch: ['url'],
  bash: ['command'], pwsh: ['command'],
  read: ['path'], read_image: ['path'], write: ['path'], edit: ['path'], str_replace_editor: ['path'],
  ask_user_question: ['query', 'question'], subagent: ['prompt', 'description'],
  send_message: ['agent_id'], interrupt_agent: ['agent_id'],
  job_output: ['job_id'], job_kill: ['job_id'],
  create_goal: ['objective'], update_goal: ['objective'], ralph: ['objective'],
  skill: ['name'], workflow: ['name'],
};

// —— 纯函数（测试出口）——
// 状态四态：官方 toolRowModel 推导照抄（running 落地前 / interrupted=stopped / isError=error）
function mcToolState(block) {
  if (!block || typeof block !== 'object') return 'ok';
  if (!('kind' in block)) return 'running';
  if (block.error && block.error.code === 'interrupted') return 'stopped';
  return block.isError ? 'error' : 'ok';
}
// 名称兜底链：落地形 call?.name → 运行形 name → callId（窗口截断卡头显示 callId，官方注释同款）
function mcToolName(block) {
  if (!block || typeof block !== 'object') return '';
  if ('kind' in block) {
    if (block.call && typeof block.call.name === 'string' && block.call.name) return block.call.name;
  } else if (typeof block.name === 'string' && block.name) return block.name;
  return block.callId == null ? '' : String(block.callId);
}
// 变体：官方 classifyTool 照抄（精确表 → others 兜底；mcp__*/未知全部 others = 官方 Sparkle 图标）
function mcToolVariant(name) {
  var n = String(name || '');
  return Object.prototype.hasOwnProperty.call(MC_TOOL_VARIANTS, n) ? MC_TOOL_VARIANTS[n] : 'others';
}
// 参数摘要：白名单键值（单行化 + 60 字符截断）→ argsRaw 单行化 → callId
function mcToolArgsSummary(name, argsRaw, callId) {
  var raw = '';
  try { raw = typeof argsRaw === 'string' ? argsRaw : (argsRaw == null ? '' : String(argsRaw)); } catch (e) { raw = ''; }
  var obj = null;
  try { obj = JSON.parse(raw); } catch (e) { obj = null; }
  var picked = '';
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    var keys = (Object.prototype.hasOwnProperty.call(MC_TOOL_ARG_PICK, String(name || ''))
      ? MC_TOOL_ARG_PICK[String(name || '')] : MC_TOOL_ARG_KEYS);
    for (var i = 0; i < keys.length; i++) {
      var v = obj[keys[i]];
      if (typeof v === 'string' && v) { picked = v; break; }
      if (Array.isArray(v) && v.length && typeof v[0] === 'string') { picked = v.slice(0, 2).join(' / '); break; } // queries 类数组取首两个
    }
    if (!picked && Array.isArray(obj.todos)) picked = obj.todos.length + ' items';
  }
  if (!picked) {
    var rawUseful = raw !== '' && raw !== '{}' && raw !== '[]' && raw !== '""' && raw !== 'null';
    picked = rawUseful ? raw.replace(/\s+/g, ' ').trim() : (callId == null ? '' : String(callId));
  }
  if (!picked) picked = callId == null ? '' : String(callId);
  picked = picked.replace(/\s+/g, ' ');
  if (picked.length > 60) picked = picked.slice(0, 60) + '…';
  return picked;
}
// wire view → 卡面材料 narrowing（防御式，坏载荷/未知 card 值 → null 走 generic 路径）
// 词表照 dsh-tools presentation.d.ts；web.kind 改名 webKind 避让卡面 kind 字段。
function mcViewCard(view) {
  if (!view || typeof view !== 'object') return null;
  var card = view.card;
  if (card === 'terminal') {
    return { kind: 'terminal', title: typeof view.title === 'string' ? view.title : '',
      description: typeof view.description === 'string' ? view.description : undefined,
      output: typeof view.output === 'string' ? view.output : undefined,
      exitCode: typeof view.exitCode === 'number' ? view.exitCode : undefined,
      signal: typeof view.signal === 'string' ? view.signal : undefined };
  }
  if (card === 'diff') {
    var diffs = view.diffs;
    if (!Array.isArray(diffs) || !diffs.length) return null;
    for (var i = 0; i < diffs.length; i++) {
      var d = diffs[i];
      if (!d || typeof d !== 'object' || typeof d.path !== 'string'
        || typeof d.newText !== 'string' || !(d.oldText === null || typeof d.oldText === 'string')) return null;
    }
    return { kind: 'diff', diffs: diffs };
  }
  if (card === 'read') {
    if (typeof view.path !== 'string' || typeof view.offset !== 'number'
      || !Array.isArray(view.lines) || typeof view.totalLines !== 'number') return null;
    for (var j = 0; j < view.lines.length; j++) {
      var L = view.lines[j];
      if (!L || typeof L !== 'object' || typeof L.number !== 'number' || typeof L.text !== 'string') return null;
    }
    return { kind: 'read', path: view.path, offset: view.offset, lines: view.lines,
      totalLines: view.totalLines, lang: typeof view.lang === 'string' ? view.lang : undefined };
  }
  if (card === 'search') {
    var total = typeof view.total === 'number' ? view.total : 0;
    var truncated = view.truncated === true;
    if (view.shape === 'matches') {
      var files = view.files;
      if (!Array.isArray(files)) return null;
      for (var k = 0; k < files.length; k++) {
        var f = files[k];
        if (!f || typeof f !== 'object' || typeof f.path !== 'string' || !Array.isArray(f.matches)) return null;
        for (var m = 0; m < f.matches.length; m++) {
          var mt = f.matches[m];
          if (!mt || typeof mt !== 'object' || typeof mt.lineNumber !== 'number' || typeof mt.line !== 'string') return null;
        }
      }
      return { kind: 'search', shape: 'matches', files: files, total: total, truncated: truncated,
        title: typeof view.title === 'string' ? view.title : undefined };
    }
    if (view.shape === 'paths') {
      var paths = view.paths;
      if (!Array.isArray(paths)) return null;
      for (var p2 = 0; p2 < paths.length; p2++) if (typeof paths[p2] !== 'string') return null;
      return { kind: 'search', shape: 'paths', paths: paths, total: total, truncated: truncated,
        title: typeof view.title === 'string' ? view.title : undefined };
    }
    return null;
  }
  if (card === 'web') {
    if (view.kind === 'search') {
      var sources = view.sources;
      if (!Array.isArray(sources)) return null;
      for (var s2 = 0; s2 < sources.length; s2++) {
        var src = sources[s2];
        if (!src || typeof src !== 'object' || typeof src.url !== 'string') return null;
      }
      return { kind: 'web', webKind: 'search', sources: sources,
        answer: typeof view.answer === 'string' ? view.answer : undefined, truncated: view.truncated === true };
    }
    if (view.kind === 'fetch') {
      if (typeof view.url !== 'string' || typeof view.statusCode !== 'number') return null;
      return { kind: 'web', webKind: 'fetch', url: view.url, statusCode: view.statusCode, truncated: view.truncated === true };
    }
    return null;
  }
  return null;
}
// 输出正文：text 块连缀（\n 分隔），超 cap 截断加省略号（syscard 20k 上界先例）
var MC_TOOL_TEXT_CAP = 20000;
function mcOutputText(content, cap) {
  var out = '';
  var n = typeof cap === 'number' ? cap : MC_TOOL_TEXT_CAP;
  try {
    var blocks = content || [];
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      if (b && b.type === 'text' && typeof b.text === 'string') out += (out ? '\n' : '') + b.text;
      if (out.length >= n) return out.slice(0, n) + '…';
    }
  } catch (e) { /* 结构漂移 → 空正文，卡壳照常 */ }
  return out;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { mcToolState: mcToolState, mcToolName: mcToolName, mcToolVariant: mcToolVariant,
    mcToolArgsSummary: mcToolArgsSummary, mcViewCard: mcViewCard, mcOutputText: mcOutputText };
}

// —— CSS（原型 §7 L705-763 直抄；token 换 --mc-*；全部自有 .mc-tool* 类，audit 零宿主锚）——
const MC_TOOL_CSS = [
  '.mc-tool{background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:var(--mc-r-card);box-shadow:var(--mc-shadow-panel);overflow:hidden;position:relative}',
  '.mc-tool-head{display:flex;align-items:center;gap:8px;width:100%;padding:7px 9px;background:none;border:none;cursor:pointer;text-align:left;font-family:inherit}',
  '.mc-t-ic{width:26px;height:26px;flex:none;display:grid;place-items:center;background:var(--mc-surface-2);border:1px solid var(--mc-border);border-radius:var(--mc-r-tag);color:var(--mc-fg)}',
  '.mc-t-ic svg{width:15px;height:15px;shape-rendering:crispEdges}', // DSH 默认图标像素风格渲染(用户裁定)
  '.mc-t-meta{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;text-align:left}',
  '.mc-t-name{font:600 12px/1.3 var(--font-display);letter-spacing:.02em;color:var(--mc-fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.mc-t-args{font:400 11px/1.5 var(--font-code);color:var(--mc-faint);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.mc-tool-head .chev{flex:none;width:9px;height:10px;color:var(--mc-muted)}',
  '.mc-tool.open .mc-tool-head .chev{transform:rotate(90deg)}',
  '.mc-tool-body{height:0;overflow:hidden}',
  '.mc-tool.open .mc-tool-body{height:auto}',
  '.mc-tb-in{padding:8px 9px 9px;border-top:1px solid var(--mc-border-soft);font:400 12px/1.8 var(--font-code);color:var(--mc-muted)}',
  '.mc-tb-in b{color:var(--mc-fg);font-weight:500}',
  // 运行态 — 琥珀边 + 标题条条纹扫掠(--sweep-delay 组件内 CLOCK.syncAnim 相位对齐)
  '.mc-tool.mc-run{border-color:var(--mc-spark)}',
  '.mc-tool.mc-run .mc-tool-head{background:repeating-linear-gradient(90deg,color-mix(in oklab,var(--mc-spark) 26%,transparent) 0 4px,transparent 4px 8px);background-size:12px 100%;animation:mc-sweep 1s steps(2,end) infinite;animation-delay:var(--sweep-delay,0ms)}',
  // 失败态 — 红边 + 图标格转红
  '.mc-tool.mc-fail{border-color:var(--mc-danger)}',
  '.mc-tool.mc-fail .mc-t-ic{color:var(--mc-danger);border-color:var(--mc-danger)}',
  // 展开体：错误首行 + 输出 pre + 宿主结构化块外壳
  // 裁定（2026-09-02 二轮）：展开体内一切内容直角化 + 统一像素字体（宿主块的圆角/dsw 字族压平）
  '.mc-tb-in,.mc-tb-in *{border-radius:0!important;font-family:var(--font-code)!important}',
  '.mc-tb-err{color:var(--mc-danger);margin:0 0 4px}',
  '.mc-tb-out{margin:6px 0 0;padding:6px 8px;background:var(--mc-bg-deep);border:1px solid var(--mc-border-soft);font:400 11.5px/1.7 var(--font-code);color:var(--mc-muted);white-space:pre-wrap;word-break:break-word;overflow-x:auto}',
  '.mc-tool-block{margin:2px 0}',
  // 浅色:WebBlock 根底色为宿主硬编码深色(非 token),翻白保引用列表可读;链接色宿主自管
  'html[data-theme="light"] .mc-tbb-web{background:var(--mc-surface);border:1px solid var(--mc-border-soft)}',
  // 子调用缩进列表（原型 subcalls 语汇：左 2px 软线；内层同构卡压掉投影）
  '.mc-subcalls{display:flex;flex-direction:column;gap:4px;margin:4px 0 2px 22px;padding-left:8px;border-left:2px solid var(--mc-border-soft)}',
  '.mc-subcalls .mc-tool{box-shadow:none}',
].join('\n');

// —— 模块（协议 { css, slots(ctx) }；遮蔽 tool-call keyed 槽）——
var MC_TOOL_PRIM = null;
try { if (typeof require === 'function') MC_TOOL_PRIM = require("@deepseek-ai/dsh-client-ui-primitives"); } catch (e) { MC_TOOL_PRIM = null; }
// kit 演示桥：slots 装配后指向 { card }（真 McToolCard 渲染 demo block）；缺席 = kit 分区降级静态说明
var MC_TOOL_DEMO = null;

const McTool = {
  css: MC_TOOL_CSS,
  slots(ctx) {
    if (!MC_TOOL_PRIM || typeof React === 'undefined') return; // primitives 缺席:不遮蔽,宿主 ToolCallTree 兜底
    const S = ctx.slots;
    if (!S || typeof S.register !== 'function' || typeof S.inject !== 'function') return;
    const h = React.createElement;
    const TerminalBlock = MC_TOOL_PRIM.TerminalBlock;
    const DiffBlock = MC_TOOL_PRIM.DiffBlock;
    const ReadBlock = MC_TOOL_PRIM.ReadBlock;
    const SearchBlock = MC_TOOL_PRIM.SearchBlock;
    const WebBlock = MC_TOOL_PRIM.WebBlock;
    const JsonBlock = MC_TOOL_PRIM.JsonBlock;
    const StateDot = MC_TOOL_PRIM.StateDot;
    // 官方默认工具图标（dsh-client-ui-tool VARIANT_ICONS 同源，组件取自 primitives）
    const MC_TOOL_ICON_COMP = {
      search: MC_TOOL_PRIM.IconSearchOutline16,
      read: MC_TOOL_PRIM.IconBrowseOutline16,
      bash: MC_TOOL_PRIM.IconApiOutline14,
      write: MC_TOOL_PRIM.IconEditOutline16,
      edit: MC_TOOL_PRIM.IconEditOutline16,
      code: MC_TOOL_PRIM.IconCodeOutline16,
      others: MC_TOOL_PRIM.IconSparkle16,
    };
    let REDUCED = false;
    try { REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    // 开合（syscard mcFold 同款）：REDUCED/busy 直翻，否则 accToggle 四拍（几何变化在白块遮盖下）
    function mcFold(card, flip) {
      if (!card) { flip(); return; }
      if (REDUCED || (card.dataset && card.dataset.busy)) { flip(); return; }
      accToggle(card, flip);
    }
    // 取参 raw：运行形 block.argsRaw / 落地形 block.call?.argsRaw
    function rawOf(block) {
      if (!block) return '';
      if ('kind' in block) return (block.call && block.call.argsRaw) || '';
      return block.argsRaw || '';
    }
    function tryParse(raw) {
      try { return JSON.parse(raw); } catch (e) { return undefined; }
    }

    /* McToolCard：单卡（头：图标格 + 名称/参数双行 + pill + 三角；体：结构化块 | JsonBlock+文本）。
       running 默认展开（interactive 先例），落地自动收起（accToggle 拍内）；data-state 驱动三态 CSS。 */
    function McToolCard(props) {
      var block = props.block;
      var name = mcToolName(block);
      var state = mcToolState(block);
      var done = block && typeof block === 'object' && ('kind' in block);
      var openV = React.useState(false); // 裁定（2026-09-02 二轮）：首登场一律折叠
      var open = openV[0], setOpen = openV[1];
      var cardRef = React.useRef(null);
      var headRef = React.useRef(null);
      var pillRef = React.useRef(null);
      var bodyRef = React.useRef(null);
      React.useEffect(function () { // 扫掠/脉冲相位对齐（组件内自管，syscard retry 先例）
        try {
          if (state === 'running' && headRef.current && CLOCK && typeof CLOCK.syncAnim === 'function') CLOCK.syncAnim(headRef.current, CLOCK.SWEEP, '--sweep-delay');
          if (state === 'running' && pillRef.current && CLOCK && typeof CLOCK.syncAnim === 'function') CLOCK.syncAnim(pillRef.current);
        } catch (e) {}
      }, [state]);
      function toggle() {
        mcFold(cardRef.current, function () { setOpen(function (o) { return !o; }); });
      }
      // 展开体内折叠面板点击 → 方向判定 + 库 flash：展开 flashIn / 收起 flashOut（用户裁定⑤）。
      // 宿主自身 handler 照常切换（不拦截），我们只在切换后补白块闪烁；REDUCED 不挂。
      // 命中面：DisclosureRow 系（[data-expandable]/[aria-expanded]）+ JsonBlock IN 裸钮
      // （button，方向读 ▸/▾ 文案前缀——二轮补：该钮无 aria/data 钩子，首轮委托漏网）。
      function mcPanelOpen(head) {
        var a = head.getAttribute('aria-expanded');
        if (a === 'true') return true;
        if (a === 'false') return false;
        var ds = head.getAttribute('data-state');
        if (ds === 'open') return true;
        if (ds === 'closed') return false;
        var txt = (head.textContent || '').replace(/^\s+/, '');
        if (txt.charAt(0) === '▾') return true;
        if (txt.charAt(0) === '▸') return false;
        return false;
      }
      function onBodyCapture(ev) {
        var t = ev.target;
        if (!t || !t.closest) return;
        var head = null;
        try { head = t.closest('[data-expandable],[aria-expanded],button'); } catch (e) { return; }
        if (!head || !bodyRef.current || !bodyRef.current.contains(head)) return;
        var wasOpen = mcPanelOpen(head);
        var panel = head.closest('[data-expandable]') || head.parentElement || head;
        if (REDUCED || !CLOCK || typeof CLOCK.next !== 'function') return;
        CLOCK.next(function () {
          try {
            if (!panel.isConnected) return;
            if (wasOpen) { if (typeof flashOut === 'function') flashOut(panel, function () {}); }
            else { if (typeof flashIn === 'function') flashIn(panel, function () {}); }
          } catch (e) {}
        }, 100);
      }
      var variant = mcToolVariant(name);
      // leading：官方 leadingFor 照抄——error→StateDot(error)/stopped→StateDot(warning)，其余变体图标
      var leading = null;
      if (state === 'error' && StateDot) leading = h(StateDot, { state: 'error' });
      else if (state === 'stopped' && StateDot) leading = h(StateDot, { state: 'warning' });
      else {
        var Ic = MC_TOOL_ICON_COMP[variant] || MC_TOOL_ICON_COMP.others;
        if (Ic) leading = h(Ic, { size: 14 });
      }
      var pillCls = state === 'running' ? 'run' : state === 'error' ? 'fail' : 'done';
      var pillText = state === 'running' ? 'running' : state === 'error' ? 'fail' : 'done';
      var argsText = mcToolArgsSummary(name, rawOf(block), block && block.callId);
      if (state === 'stopped') argsText += ' · 已停止';
      return h('div', { className: 'mc-tool' + (open ? ' open' : '') + (state === 'running' ? ' mc-run' : state === 'error' ? ' mc-fail' : ''), ref: cardRef },
        h('button', { type: 'button', className: 'mc-tool-head', ref: headRef, onClick: toggle },
          h('span', { className: 'mc-t-ic' }, leading),
          h('span', { className: 'mc-t-meta' },
            h('span', { className: 'mc-t-name' }, name),
            h('span', { className: 'mc-t-args' }, argsText)),
          h('span', { className: 'mc-pill ' + pillCls, ref: pillRef }, pillText),
          h('svg', { className: 'chev' + (open ? ' open' : ''), 'aria-hidden': true }, h('use', { href: '#i-caretright' }))),
        h('div', { className: 'mc-tool-body', ref: bodyRef, onClickCapture: onBodyCapture },
          h('div', { className: 'mc-tb-in' }, mcBody(block, name, state, done))));
    }

    // 展开体：wire view 结构化材料 → 宿主 Block 保真；未命中 → JsonBlock(IN) + text(OUT)
    function mcBody(block, name, state, done) {
      var err = (done && block.error && block.error.name) ? (block.error.name + ': ' + block.error.code) : '';
      var callV = mcViewCard(block && block.callView);
      var resV = done ? mcViewCard(block.resultView) : null;
      var view = resV || callV;
      var kids = [];
      if (view && view.kind === 'terminal') {
        var command = (resV && callV && callV.kind === 'terminal' && callV.title) ? callV.title
          : (view.title || name);
        kids.push(h(TerminalBlock, { key: 't', command: command, output: view.output, exitCode: view.exitCode,
          signal: view.signal, running: !done && callV && callV.kind === 'terminal', maxLines: 8, className: 'mc-tool-block' }));
        return kids;
      }
      if (view && view.kind === 'diff') { kids.push(h(DiffBlock, { key: 'd', diffs: view.diffs, maxLines: 8, className: 'mc-tool-block' })); return kids; }
      if (view && view.kind === 'read') { kids.push(h(ReadBlock, { key: 'r', path: view.path, offset: view.offset, lines: view.lines, totalLines: view.totalLines, lang: view.lang, maxLines: 8, className: 'mc-tool-block' })); return kids; }
      if (view && view.kind === 'search') {
        kids.push(view.shape === 'matches'
          ? h(SearchBlock, { key: 's', kind: 'matches', files: view.files, truncated: view.truncated, total: view.total, maxLines: 8, className: 'mc-tool-block' })
          : h(SearchBlock, { key: 's', kind: 'paths', paths: view.paths, truncated: view.truncated, total: view.total, maxLines: 8, className: 'mc-tool-block' }));
        return kids;
      }
      if (view && view.kind === 'web') {
        kids.push(view.webKind === 'search'
          ? h(WebBlock, { key: 'w', kind: 'search', sources: view.sources, answer: view.answer, truncated: view.truncated, className: 'mc-tool-block mc-tbb-web' })
          : h(WebBlock, { key: 'w', kind: 'fetch', url: view.url, statusCode: view.statusCode, truncated: view.truncated, className: 'mc-tool-block mc-tbb-web' }));
        return kids;
      }
      // generic 路径
      if (err) kids.push(h('div', { key: 'e', className: 'mc-tb-err' }, err));
      var raw = rawOf(block);
      if (raw) kids.push(h(JsonBlock, { key: 'a', label: 'IN', payload: tryParse(raw) !== undefined ? tryParse(raw) : raw }));
      var out = done ? mcOutputText(block.content) : '';
      if (out) kids.push(h('pre', { key: 'o', className: 'mc-tb-out' }, out));
      if (!kids.length) kids.push(h('span', { key: 'n' }, state === 'running' ? '运行中…' : '（无输出）'));
      return kids;
    }

    /* McToolBranch：一卡 + 子调用递归缩进（subcalls 挂卡后；callId 作 React key） */
    function McToolBranch(props) {
      var block = props.block;
      var sub = (block && block.subCalls) || [];
      var kids = [h(McToolCard, { key: 'card', block: block })];
      if (sub.length) {
        kids.push(h('div', { key: 'sub', className: 'mc-subcalls' },
          sub.map(function (c, i) { return h(McToolBranch, { key: (c && c.callId) || i, block: c }); })));
      }
      return h(React.Fragment, null, kids);
    }

    /* McToolTree：遮蔽组件——node.data.root 递归（窗口截断 root 缺席渲染 null） */
    function McToolTree(props) {
      var node = props.node;
      var root = node && node.data && node.data.root;
      if (!root) return null;
      return h(McToolBranch, { block: root });
    }

    ctx.effect(() => S.inject('conversation.chat.node', () => S.register({
      name: 'conversation.chat.node', key: 'tool-call', priority: -1, registrant: 'macintosh',
    }, McToolTree)));

    // kit 演示桥（kit.js 在 order 中后于 McTool；组件闭包内真卡渲染 demo block）
    MC_TOOL_DEMO = {
      card: function (block) { return h(McToolCard, { block: block }); },
    };
  },
};
