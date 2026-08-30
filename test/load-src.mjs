// test/load-src.mjs — 以 CJS 方式加载 src/ 下的纯声明 JS 模块。
// 包 package.json 声明 "type":"module"（常驻插件 index.js 需要 ESM）后，
// src/*.js 被 Node 按 ESM 解析，module.exports 守卫不再生效 —— 这里把源文件
// 拷入临时 .cjs 再 require，恢复测试用的 CJS 兼容出口（module.exports 守卫在
// CJS 下照常工作）。内容逐字拷贝，不经过任何变换。
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tmp = mkdtempSync(join(tmpdir(), 'mc-cjs-'));
const req = createRequire(import.meta.url);

export function loadSrc(rel) {
  const base = rel.replace(/[\\/]/g, '_').replace(/\.js$/, '.cjs');
  const p = join(tmp, base);
  writeFileSync(p, readFileSync(join(ROOT, rel)));
  return req(p);
}
