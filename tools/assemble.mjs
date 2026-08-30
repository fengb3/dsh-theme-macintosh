// tools/assemble.mjs — 装配 dist/client-body.js（自包含 client 函数体，plain JS，无 import）
// 用法: node tools/assemble.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// 先刷新快照，保证 src/** 最新
const sync = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'sync-src.mjs')], {
  cwd: ROOT, stdio: 'inherit',
});
if (sync.status !== 0) throw new Error('sync-src 失败');

const inputSrc = readFileSync(path.join(ROOT, 'src', 'assemble.input.js'), 'utf8');
const { ORDER } = new Function(`${inputSrc}; return { ORDER };`)();

// 只拼接存在的快照；缺失模块跳过（后续任务落地后自动并入）
const present = ORDER.filter((n) => existsSync(path.join(ROOT, 'src-build', `${n}.js`)));
const modules = present
  .map((n) => readFileSync(path.join(ROOT, 'src-build', `${n}.js`), 'utf8'))
  .join('\n');
const modsInit = present
  .map((n) => `  ${n}: ${n},`)
  .join('\n');

const body = `${modules}
return (function(){
  const mods = {
${modsInit}
  };
  const order = ${JSON.stringify(present)};
  return {
    apply(ctx) {
      const style = document.createElement('style');
      style.setAttribute('data-mc-root','');
      let css = '';
      for (const k of order) { const m = mods[k]; if (!m) continue;
        if (m.css) css += m.css + '\\n';
        if (m.mount) try { const td = m.mount(ctx); if (typeof td === 'function') ctx.effect(() => td()); } catch(e) { /* 模块失败不拖垮其余 */ }
        if (m.slots) try { m.slots(ctx) } catch(e) {}
      }
      style.textContent = css; document.head.appendChild(style);
      ctx.effect(() => style.remove());
    },
  };
})();`;

mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
writeFileSync(path.join(ROOT, 'dist', 'client-body.js'), body);
console.log(`assemble: dist/client-body.js (${present.join(', ')})`);
