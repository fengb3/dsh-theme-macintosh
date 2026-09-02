// src/conv/tool.js —— 工具卡重绘（spec 2026-09-02 toolcard 批）
// 遮蔽 conversation.chat.node keyed 槽 'tool-call'（priority:-1 同 think/syscard 先例）——
// 官方 ToolCallTree 整体替换为自有 .mc-tool* DOM（原型 §7 L705-763 语汇）；内容体两级：
// wire view 结构化材料 → primitives Block 保真（TerminalBlock/DiffBlock/ReadBlock/
// SearchBlock/WebBlock），未命中 → JsonBlock(argsRaw) + text 连缀。primitives 缺席时
// 不注册（宿主原生渲染兜底）。纯函数经 CJS 兼容出口供测试 createRequire 使用。

// —— 图标语义映射（笔记 §10.4 适配真实 wire 名；值 = sprite symbol id）——
var MC_TOOL_ICONS = {
  read: 'i-doc', read_image: 'i-doc', report: 'i-doc',
  write: 'i-floppy',
  edit: 'i-px-edit', str_replace_editor: 'i-px-edit',
  bash: 'i-px-terminal', pwsh: 'i-px-terminal',
  grep: 'i-px-search', web_search: 'i-px-search',
  glob: 'i-folder',
  web_fetch: 'i-px-ext',
  todo_write: 'i-px-list',
  ask_user_question: 'i-balloon',
  subagent: 'i-suitcase',
  send_message: 'i-px-copy',
  interrupt_agent: 'i-px-stop',
  workflow: 'i-px-timeline',
  ralph: 'i-px-reload',
  job_output: 'i-px-clock', job_list: 'i-px-clock', job_kill: 'i-px-clock',
  get_goal: 'i-px-goal', create_goal: 'i-px-goal', update_goal: 'i-px-goal',
  skill: 'i-sparkle',
};

// 参数摘要取值键：按工具名优先键表（grep 取 pattern 非 path 之类），未列名走扁表白名单
var MC_TOOL_ARG_KEYS = ['path', 'file_path', 'command', 'pattern', 'query', 'url',
  'objective', 'prompt', 'name', 'agent_id', 'job_id', 'description', 'title'];
var MC_TOOL_ARG_PICK = {
  grep: ['pattern'], glob: ['pattern'], web_search: ['query'], web_fetch: ['url'],
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
// 图标：error 态换 warning（真失败才叹号）→ 精确表 → mcp__ 前缀 zap → 未知 dots（中性）
function mcToolIconName(name, state) {
  if (state === 'error') return 'i-px-warning';
  var n = String(name || '');
  if (Object.prototype.hasOwnProperty.call(MC_TOOL_ICONS, n)) return MC_TOOL_ICONS[n];
  if (n.indexOf('mcp__') === 0) return 'i-px-zap';
  return 'i-px-dots';
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
  module.exports = { mcToolState: mcToolState, mcToolName: mcToolName, mcToolIconName: mcToolIconName,
    mcToolArgsSummary: mcToolArgsSummary, mcViewCard: mcViewCard, mcOutputText: mcOutputText };
}
