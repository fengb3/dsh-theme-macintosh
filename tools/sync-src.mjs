// tools/sync-src.mjs — 把 src/** 平铺复制成 src-build/Mc*.js 快照（缺失模块跳过）
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// assemble.input.js 是顶层声明，不含 export；用 new Function 取出常量
function loadInput() {
  const src = readFileSync(path.join(ROOT, 'src', 'assemble.input.js'), 'utf8');
  return new Function(`${src}; return { ORDER, MODULE_MAP };`)();
}

const { ORDER, MODULE_MAP } = loadInput();
mkdirSync(path.join(ROOT, 'src-build'), { recursive: true });

for (const name of ORDER) {
  const file = MODULE_MAP[name];
  const abs = path.join(ROOT, file);
  if (!existsSync(abs)) {
    console.log(`sync-src: skip ${name} (${file} 不存在)`);
    continue;
  }
  const text = readFileSync(abs, 'utf8');
  if (/\bimport\b|\bexport\b/.test(text)) {
    throw new Error(`${file} 含 import/export：模块文件必须是纯顶层声明`);
  }
  writeFileSync(path.join(ROOT, 'src-build', `${name}.js`), text);
  console.log(`sync-src: ${file} -> src-build/${name}.js`);
}
