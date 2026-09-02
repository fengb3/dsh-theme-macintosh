// test/tool.test.mjs —— 工具卡纯函数（spec 2026-09-02 toolcard 批；loadSrc CJS 兼容出口）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSrc } from './load-src.mjs';
const T = loadSrc('src/conv/tool.js');

test('mcToolState 四态推导（官方规则照抄）', () => {
  assert.equal(T.mcToolState({ name: 'bash', argsRaw: '{}' }), 'running');
  assert.equal(T.mcToolState({ kind: 'tool-result', isError: false }), 'ok');
  assert.equal(T.mcToolState({ kind: 'tool-result', isError: true }), 'error');
  assert.equal(T.mcToolState({ kind: 'tool-result', isError: false, error: { name: 'x', code: 'interrupted' } }), 'stopped');
  assert.equal(T.mcToolState(null), 'ok'); // 非法块兜底
});

test('mcToolName 兜底链 call?.name → name → callId', () => {
  assert.equal(T.mcToolName({ name: 'bash' }), 'bash');
  assert.equal(T.mcToolName({ kind: 'tool-result', call: { name: 'read', argsRaw: '{}' } }), 'read');
  assert.equal(T.mcToolName({ kind: 'tool-result', call: null, callId: 'c9' }), 'c9'); // 窗口截断
  assert.equal(T.mcToolName({ name: '', callId: 'cx' }), 'cx');
  assert.equal(T.mcToolName(null), '');
});

test('mcToolIconName 精确表 / mcp__ 前缀 / error 换 warning / 未知 dots', () => {
  assert.equal(T.mcToolIconName('bash', 'ok'), 'i-px-terminal');
  assert.equal(T.mcToolIconName('pwsh', 'running'), 'i-px-terminal');
  assert.equal(T.mcToolIconName('read', 'ok'), 'i-doc');
  assert.equal(T.mcToolIconName('read_image', 'ok'), 'i-doc');
  assert.equal(T.mcToolIconName('report', 'ok'), 'i-doc');
  assert.equal(T.mcToolIconName('write', 'ok'), 'i-floppy');
  assert.equal(T.mcToolIconName('edit', 'ok'), 'i-px-edit');
  assert.equal(T.mcToolIconName('str_replace_editor', 'ok'), 'i-px-edit');
  assert.equal(T.mcToolIconName('grep', 'ok'), 'i-px-search');
  assert.equal(T.mcToolIconName('web_search', 'ok'), 'i-px-search');
  assert.equal(T.mcToolIconName('glob', 'ok'), 'i-folder');
  assert.equal(T.mcToolIconName('web_fetch', 'ok'), 'i-px-ext');
  assert.equal(T.mcToolIconName('todo_write', 'ok'), 'i-px-list');
  assert.equal(T.mcToolIconName('ask_user_question', 'ok'), 'i-balloon');
  assert.equal(T.mcToolIconName('subagent', 'ok'), 'i-suitcase');
  assert.equal(T.mcToolIconName('send_message', 'ok'), 'i-px-copy');
  assert.equal(T.mcToolIconName('interrupt_agent', 'ok'), 'i-px-stop');
  assert.equal(T.mcToolIconName('workflow', 'ok'), 'i-px-timeline');
  assert.equal(T.mcToolIconName('ralph', 'ok'), 'i-px-reload');
  assert.equal(T.mcToolIconName('job_output', 'ok'), 'i-px-clock');
  assert.equal(T.mcToolIconName('job_kill', 'ok'), 'i-px-clock');
  assert.equal(T.mcToolIconName('create_goal', 'ok'), 'i-px-goal');
  assert.equal(T.mcToolIconName('update_goal', 'ok'), 'i-px-goal');
  assert.equal(T.mcToolIconName('skill', 'ok'), 'i-sparkle');
  assert.equal(T.mcToolIconName('mcp__glm__analyze', 'ok'), 'i-px-zap');
  assert.equal(T.mcToolIconName('read', 'error'), 'i-px-warning'); // 失败语境覆盖精确表
  assert.equal(T.mcToolIconName('mcp__x__y', 'error'), 'i-px-warning');
  assert.equal(T.mcToolIconName('totally_unknown', 'ok'), 'i-px-dots');
  assert.equal(T.mcToolIconName('', 'ok'), 'i-px-dots');
});

test('mcToolArgsSummary 白名单键 / 截断 / 单行化 / callId 兜底', () => {
  assert.equal(T.mcToolArgsSummary('read', JSON.stringify({ path: 'src/conv/tool.js', offset: 1 }), 'c1'), 'src/conv/tool.js');
  assert.equal(T.mcToolArgsSummary('bash', JSON.stringify({ command: 'node -e "1"', cwd: '.' }), 'c2'), 'node -e "1"');
  assert.equal(T.mcToolArgsSummary('grep', JSON.stringify({ pattern: 'renderSlot\\(', path: 'x' }), 'c2b'), 'renderSlot\\(');
  assert.equal(T.mcToolArgsSummary('todo_write', JSON.stringify({ todos: [{ content: 'a' }, { content: 'b' }] }), 'c3'), '2 items');
  const long = 'x'.repeat(80);
  const got = T.mcToolArgsSummary('grep', JSON.stringify({ pattern: long }), 'c4');
  assert.equal(got.length, 61); // 60 字符 + …
  assert.ok(got.endsWith('…'));
  assert.equal(T.mcToolArgsSummary('mcp__x__y', 'not json', 'c5'), 'not json'); // 非法 JSON 单行化兜底
  assert.equal(T.mcToolArgsSummary('unknown', '{}', 'c6'), 'c6'); // 空摘要 → callId
  assert.equal(T.mcToolArgsSummary('w', JSON.stringify({ path: 'a\nb' }), 'c7'), 'a b'); // 摘要单行化
});

test('mcViewCard 五类 narrowing 与坏载荷 null', () => {
  assert.equal(T.mcViewCard(null), null);
  assert.equal(T.mcViewCard({ card: 'generic' }), null);
  assert.equal(T.mcViewCard({ card: 'wat' }), null);
  // terminal
  const tm = T.mcViewCard({ card: 'terminal', title: 'node -v', output: 'v25', exitCode: 0 });
  assert.equal(tm.kind, 'terminal');
  assert.equal(tm.title, 'node -v');
  assert.equal(tm.exitCode, 0);
  assert.equal(tm.signal, undefined);
  // diff（DiffHunk = FileDiff 结构）
  assert.equal(T.mcViewCard({ card: 'diff', diffs: [{ path: 'a', oldText: null, newText: 'x' }] }).kind, 'diff');
  assert.equal(T.mcViewCard({ card: 'diff', diffs: 'no' }), null);
  assert.equal(T.mcViewCard({ card: 'diff', diffs: [{ path: 5, oldText: null, newText: 'x' }] }), null);
  assert.equal(T.mcViewCard({ card: 'diff', diffs: [{ path: 'a', oldText: 3, newText: 'x' }] }), null); // oldText 仅 string|null
  // read
  const rd = T.mcViewCard({ card: 'read', path: 'f', offset: 1, totalLines: 10, lines: [{ number: 1, text: 'x' }], lang: 'ts' });
  assert.equal(rd.kind, 'read');
  assert.equal(rd.lang, 'ts');
  assert.equal(rd.lines.length, 1);
  assert.equal(T.mcViewCard({ card: 'read', path: 1, offset: 1, lines: [], totalLines: 1 }), null);
  assert.equal(T.mcViewCard({ card: 'read', path: 'f', offset: 1, lines: [{ number: 'x', text: 'y' }], totalLines: 1 }), null);
  // search matches/paths（wire shape → 块组件 kind 映射在组件层；此处保 shape 原样）
  const sm = T.mcViewCard({ card: 'search', shape: 'matches', files: [{ path: 'a', matches: [{ lineNumber: 2, line: 'z' }] }], truncated: false, total: 1 });
  assert.equal(sm.kind, 'search');
  assert.equal(sm.shape, 'matches');
  assert.equal(sm.files.length, 1);
  assert.equal(sm.total, 1);
  const sp = T.mcViewCard({ card: 'search', shape: 'paths', paths: ['a', 'b'], truncated: true, total: 9 });
  assert.equal(sp.shape, 'paths');
  assert.equal(sp.paths.length, 2);
  assert.equal(T.mcViewCard({ card: 'search', shape: 'matches', files: [{ path: 'a' }] }), null); // matches 缺失
  assert.equal(T.mcViewCard({ card: 'search', shape: 'other', paths: [] }), null);
  // web search/fetch（kind 改名 webKind 避让卡面 kind 字段）
  const ws = T.mcViewCard({ card: 'web', kind: 'search', sources: [{ url: 'https://x' }], truncated: false });
  assert.equal(ws.webKind, 'search');
  assert.equal(ws.sources.length, 1);
  const wf = T.mcViewCard({ card: 'web', kind: 'fetch', url: 'https://x', statusCode: 200, truncated: false });
  assert.equal(wf.webKind, 'fetch');
  assert.equal(wf.statusCode, 200);
  assert.equal(T.mcViewCard({ card: 'web', kind: 'search', sources: 'no' }), null);
  assert.equal(T.mcViewCard({ card: 'web', kind: 'fetch', url: 'https://x' }), null); // statusCode 缺失
});

test('mcOutputText text 块连缀与截断（20k 上界）', () => {
  assert.equal(T.mcOutputText([{ type: 'text', text: 'a' }, { type: 'image' }, { type: 'text', text: 'b' }]), 'a\nb');
  assert.equal(T.mcOutputText([]), '');
  assert.equal(T.mcOutputText(null), '');
  const big = T.mcOutputText([{ type: 'text', text: 'y'.repeat(30000) }]);
  assert.equal(big.length, 20001); // 20000 + …
  assert.ok(big.endsWith('…'));
});
