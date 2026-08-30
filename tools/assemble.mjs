// tools/assemble.mjs — 装配 dist/client-body.js（自包含 client 函数体，plain JS，无 import）
// 用法: node tools/assemble.mjs [--font-base <base-url>] [--out <file>]
//   --font-base  http://... 时 @font-face src 用 URL 引用（配合 tools/serve-assets.mjs），默认 base64 内联（自包含）
//   --out       输出文件，默认 dist/client-body.js
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// —— 参数解析：--font-base <url> / --out <file> ——
const args = process.argv.slice(2);
const argVal = (name) => {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : undefined;
};
const fontBase = argVal('--font-base');
const outFile = argVal('--out') || path.join(ROOT, 'dist', 'client-body.js');

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
// fontSrc: base64 模式内联数据 URI；--font-base 模式输出 url(<base>/fonts/<file>)
const fontSrc = (f) =>
  fontBase
    ? `url(${fontBase.replace(/\/+$/, '')}/fonts/${f})`
    : `url(data:font/ttf;base64,${b64(f)})`;
const face = (family, src) =>
  `@font-face{font-family:${family};src:${src} format('truetype');font-display:swap}`;
const fontCss = [
  face("'FindersKeepers'", fontSrc('FindersKeepers.ttf')),
  face("'ChiKareGo'", fontSrc('ChiKareGo.ttf')),
  face("'Fusion Pixel 12px monospaced'", fontSrc('fusion-pixel-12px-monospaced-latin.ttf')),
  face("'Fusion Pixel 12px monospaced zh'", fontSrc('fusion-pixel-12px-monospaced-zh_hans.ttf')),
  `@font-face{font-family:'ChiKareGo Latin';src:${fontSrc('ChiKareGo.ttf')} format('truetype');` +
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
    // 勿声明 inject:['slots']：动态 fiber 内该服务不可见时会永久 parked（apply 不执行但宿主仍报成功）。
    // 席位一律在模块内用 ctx.get('slots') 可选读取（守卫允许），拿不到则静默跳过。
    apply(ctx) {
      try { console.log('[mcx] apply — 主题注入开始'); } catch (e) {}
      try { window.__MC_LOADED_AT = Date.now(); } catch (e) {}
      // 心跳：每 10s 报一次存活（fiber 被拆则心跳消失）
      const hb = window.setInterval(() => { try { console.log('[mcx] alive t+' + Math.round((Date.now() - window.__MC_LOADED_AT) / 1000) + 's'); } catch (e) {} }, 10000);
      const style = document.createElement('style');
      style.setAttribute('data-mc-root','');
      let css = ${JSON.stringify(fontCss)};
      for (const k of order) { const m = mods[k]; if (!m) continue;
        if (m.css) css += m.css + '\\n';
        if (m.mount) try { const td = m.mount(ctx); if (typeof td === 'function') ctx.effect(() => td()); } catch(e) { try { console.error('[mcx] mount ' + k + ' failed:', e && e.message); } catch (e2) {} }
        if (m.slots) try { m.slots(ctx) } catch(e) { try { console.error('[mcx] slots ' + k + ' failed:', e && e.message); } catch (e2) {} }
      }
      style.textContent = css; document.head.appendChild(style);
      // 正规主题通道：宿主 ThemePresenter 把活动主题 token 以 inline style 写在 body 上，
      // CSS 选择器永远压不过 —— 必须经 theme.overrideTokens 叠层（值用 var(--mc-*) 间接引用，
      // 月牙钮翻转 html[data-theme] 时随 --mc-* 动态跟随）。卸载时撤层。
      try {
        const T = ctx.get('theme');
        if (T && typeof T.overrideTokens === 'function') {
          const pair = (v) => ({ light: v, dark: v });
          const off = T.overrideTokens('mcx-1', {
            '--dsw-alias-bg-base': pair('var(--mc-bg)'),
            '--dsw-alias-bg-layer-1': pair('var(--mc-surface)'),
            '--dsw-alias-bg-layer-2': pair('var(--mc-surface-2)'),
            '--dsw-alias-bg-overlay': pair('var(--mc-surface-3)'),
            '--dsw-alias-border-l1': pair('var(--mc-border)'),
            '--dsw-alias-border-l2': pair('var(--mc-border)'),
            '--dsw-alias-brand-primary': pair('var(--mc-accent)'),
            '--dsw-alias-label-primary': pair('var(--mc-fg)'),
            '--dsw-alias-label-secondary': pair('var(--mc-muted)'),
            '--dsw-alias-state-error-primary': pair('var(--mc-danger)'),
            '--dsw-alias-state-success-primary': pair('var(--mc-success)'),
            '--dsw-alias-state-warn-primary': pair('var(--mc-warn)'),
            '--dsw-specific-sidebar-fill': pair('var(--mc-rail-1)'),
            '--dsw-font-family': pair('var(--font-ui)'),
          });
          ctx.effect(() => { try { off(); } catch (e) {} });
          console.log('[mcx] theme.overrideTokens 已叠层');
        } else {
          console.warn('[mcx] theme 服务不可用，仅 CSS 层生效');
        }
      } catch (e) { console.error('[mcx] overrideTokens failed:', e && e.message); }
      try { console.log('[mcx] apply 完成，样式已入 head'); } catch (e) {}
      ctx.effect(() => { try { window.clearInterval(hb); console.log('[mcx] fiber dispose — 样式/叠层移除'); } catch (e) {} style.remove(); });
    },
  };
})();`;

mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, body);
console.log(`assemble: ${path.relative(ROOT, outFile)} (${present.join(', ')})`);
