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

// —— 字体 base64 内联（照《笔记》§4.2）：5 条 @font-face 注入 css 头部 ——
// ChiKareGo 同一 ttf 复用两族；'ChiKareGo Latin' 别名 unicode-range 只截字母/扩展拉丁/通用标点，
// 数字有意不截获（走等宽 Fusion Pixel），勿"修复"
const FONT_DIR = path.join(ROOT, 'assets', 'fonts');
const b64 = (f) => readFileSync(path.join(FONT_DIR, f)).toString('base64');
const chiB64 = b64('ChiKareGo.ttf');
const face = (family, data) =>
  `@font-face{font-family:${family};src:url(data:font/ttf;base64,${data}) format('truetype');font-display:swap}`;
const fontCss = [
  face("'FindersKeepers'", b64('FindersKeepers.ttf')),
  face("'ChiKareGo'", chiB64),
  face("'Fusion Pixel 12px monospaced'", b64('fusion-pixel-12px-monospaced-latin.ttf')),
  face("'Fusion Pixel 12px monospaced zh'", b64('fusion-pixel-12px-monospaced-zh_hans.ttf')),
  `@font-face{font-family:'ChiKareGo Latin';src:url(data:font/ttf;base64,${chiB64}) format('truetype');` +
    `unicode-range:U+0041-005A,U+0061-007A,U+00C0-024F,U+1E00-1EFF,U+2000-206F;font-display:swap}`,
].join('\n');

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
      let css = ${JSON.stringify(fontCss)};
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
