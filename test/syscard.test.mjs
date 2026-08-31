// test/syscard.test.mjs — McSysCard 纯函数单测（验收七轮：系统卡四族重绘）
// src/conv/syscard.js CJS shim 直读；镜像纪律同 flow-mount（client.js 段手工同源）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(import.meta.url);
const tmp = mkdtempSync(join(tmpdir(), 'mc-syscard-'));
const src = readFileSync(join(ROOT, 'src/conv/syscard.js'), 'utf8');
// require 守卫段（MC_SYS_PRIM require 失败静默 null）+ CJS shim 即可取纯函数
writeFileSync(join(tmp, 'syscard.cjs'), src + '\nmodule.exports.__McSysCard = McSysCard;\n');
const { mcCompactionLine, mcRetryParts, mcContextText, __McSysCard } = req(join(tmp, 'syscard.cjs'));

test('mcCompactionLine：全空=进行中；双计数=完成语；fallback 优先于占位', () => {
  assert.equal(mcCompactionLine(null, null, null, ''), '正在压缩…');
  assert.equal(mcCompactionLine(null, null, null, '命令输出的替代文案'), '命令输出的替代文案');
  assert.equal(mcCompactionLine('摘要', 12, 3456, ''), '已压缩 12 条历史记录（约 3456 tokens）');
  assert.equal(mcCompactionLine('摘要', 12, null, ''), '压缩摘要不可用');
});

test('mcRetryParts：scheduled=active+重试中标签；上限 normal=数字 / 其余=∞', () => {
  const a = mcRetryParts({ retryState: 'scheduled', mode: 'normal', maxRetries: 5 });
  assert.deepEqual([a.active, a.label, a.maximum], [true, '正在重试模型请求', 5]);
  assert.equal(mcRetryParts({ retryState: 'started', mode: 'normal', maxRetries: 5 }).label, '已重试模型请求');
  assert.equal(mcRetryParts({ retryState: 'cancelled', mode: 'backoff', maxRetries: 5 }).label, '模型请求重试已取消');
  assert.equal(mcRetryParts({ retryState: 'other', mode: 'backoff' }).maximum, '∞');
  assert.equal(mcRetryParts(null).label, '等待重试模型请求');
});

test('mcContextText：文本块连缀（相邻无分隔）+ cap 截断 + 非文本/异常安全', () => {
  assert.equal(mcContextText([{ type: 'text', text: 'a' }, { type: 'text', text: 'b' }, { type: 'x' }], 100), 'ab');
  assert.equal(mcContextText([{ type: 'text', text: 'abcdef' }], 3), 'abc…');
  assert.equal(mcContextText(null, 10), '');
  assert.equal(mcContextText({}, 10), '');
});

test('模块结构：css 自有类零宿主锚；四 keyed 槽注册（slots 需 MC_SYS_PRIM，CJS 域缺席即空）', () => {
  assert.ok(__McSysCard.css.includes('.mc-inject-head'));
  assert.ok(__McSysCard.css.includes('.mc-comp-head'));
  assert.ok(__McSysCard.css.includes('.mc-retry-head'));
  assert.ok(!/\[[a-z-]*chat-flow|data-context|data-compaction|data-active/.test(__McSysCard.css), 'css 不得出现宿主锚');
  assert.equal(typeof __McSysCard.slots, 'function');
});
