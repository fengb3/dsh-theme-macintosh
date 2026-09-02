// tools/make-persistent-client.mjs — 从 dist/client-body.js（评审过的动态版源真相）
// 装配常驻 loader 格式 client.js（仓库根交付物）。
// 变换清单（其余逐字保留）：
//  1. 包上 window.__ModuleLoader__.load({id, factory}) 头（require("react") → const React）；
//  2. 两个 'slots' 守卫读取（ctx.get）改为常驻直达 ctx.slots（inject 声明已生效）；
//  3. 尾部 IIFE 导出对象换成 Cordis 插件导出（inject + apply）：
//     theme.overrideTokens id 换 'dsh-theme-macintosh'、心跳改 ctx.interval（fiber 自动回收）、
//     @font-face 全部指向宿主静态路由 /mcx-assets/fonts/（无 base64、无开发端口）。
// 写盘前断言非空 + 关键标记齐全（aurum 0 字节事故教训）。
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'dist', 'client-body.js');
const OUT = join(ROOT, 'client.js');

const raw = readFileSync(SRC, 'utf8');
const CUT = 'return (function(){';
const cut = raw.indexOf(CUT);
if (cut < 0) throw new Error('marker missing: ' + CUT);
let body = raw.slice(0, cut);

// 变换 2：守卫读取 → 常驻直达（sidebar.js 与 kit.js 两处同串）
const GUARD = "    const S = (ctx && typeof ctx.get === 'function') ? ctx.get('slots') : null;";
if (!body.includes(GUARD)) throw new Error('slots guard marker missing');
body = body.split(GUARD).join('    const S = ctx.slots; // 常驻插件：inject 已声明，直达');

const header = `/**
 * dsh-theme-macintosh — Macintosh 复古主题 browser half（常驻 loader 格式，零构建）。
 * 由 dist/client-body.js（动态版评审快照）装配：tokens/sprite/chrome/sidebar/kit 语义逐字保留，
 * 差异仅在持久化 —— inject:['slots','theme'] 真实服务直达、字体走宿主 /mcx-assets/ 静态路由、
 * theme.overrideTokens 以 'dsh-theme-macintosh' 常驻叠层（无动态 fiber 守卫）。
 * 重新生成：node tools/make-persistent-client.mjs
 */
window.__ModuleLoader__.load({
	id: "dsh-theme-macintosh",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const react = require("react");
		const React = react;
`;

const tail = `
// ═══ 常驻插件导出（持久组合行；无动态 fiber 守卫）═══
// 装配模块登记（与动态版同名同序；dist 尾部 mods/order 原样重建）
const mods = {
  McTokens: McTokens,
  McClock: McClock,
  McMcfx: McMcfx,
  McSprite: McSprite,
  MC_MAP: MC_MAP,
  McChrome: McChrome,
  McSidebar: McSidebar,
  McFinder: McFinder,
  McFlow: McFlow,
  McThink: McThink,
  McSysCard: McSysCard,
  McTool: McTool,
  McDock: McDock,
  McMenus: McMenus,
  McKit: McKit,
};
const order = ["McTokens","McClock","McMcfx","McSprite","MC_MAP","McChrome","McSidebar","McFinder","McFlow","McThink","McSysCard","McTool","McDock","McMenus","McKit"];

return {
  inject: ["slots", "theme", "sessions", "workspaces"],
  apply(ctx) {
    const style = document.createElement('style');
    style.setAttribute('data-mc-root','');
    // @font-face ×5 —— 宿主静态路由（index.js 前缀路由 /mcx-assets/ → 本包 assets/）
    let css = "@font-face{font-family:'FindersKeepers';src:url(/mcx-assets/fonts/FindersKeepers.ttf) format('truetype');font-display:swap}\\n@font-face{font-family:'ChiKareGo';src:url(/mcx-assets/fonts/ChiKareGo.ttf) format('truetype');font-display:swap}\\n@font-face{font-family:'Fusion Pixel 12px monospaced';src:url(/mcx-assets/fonts/fusion-pixel-12px-monospaced-latin.ttf) format('truetype');font-display:swap}\\n@font-face{font-family:'Fusion Pixel 12px monospaced zh';src:url(/mcx-assets/fonts/fusion-pixel-12px-monospaced-zh_hans.ttf) format('truetype');font-display:swap}\\n@font-face{font-family:'ChiKareGo Latin';src:url(/mcx-assets/fonts/ChiKareGo.ttf) format('truetype');unicode-range:U+0041-005A,U+0061-007A,U+00C0-024F,U+1E00-1EFF,U+2000-206F;font-display:swap}";
    for (const k of order) { const m = mods[k]; if (!m) continue;
      if (m.css) css += m.css + '\\n';
      if (m.mount) try { const td = m.mount(ctx); if (typeof td === 'function') ctx.effect(() => td); } catch(e) { /* mount 失败不拖垮其余 */ }
      if (m.slots) try { m.slots(ctx) } catch(e) { /* slots 失败不拖垮其余 */ }
    }
    style.textContent = css; document.head.appendChild(style);
    // 正规主题通道：宿主 ThemePresenter 把活动主题 token 以 inline style 写在 body 上，
    // CSS 选择器永远压不过 —— 必须经 theme.overrideTokens 叠层（值用 var(--mc-*) 间接引用，
    // html[data-theme] 跟随官方 body[data-ds-dark-theme] 信号时随 --mc-* 动态跟随）。卸载时撤层。
    // 常驻插件直达：ctx.theme（inject:['theme'] 声明已生效）。
    try {
      const T = ctx.theme;
      if (T && typeof T.overrideTokens === 'function') {
        const pair = (v) => ({ light: v, dark: v });
        const off = T.overrideTokens('dsh-theme-macintosh', {
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
          '--dsw-specific-bubble': pair('var(--mc-accent)'),
        });
        ctx.effect(() => () => { try { off(); } catch (e) {} });
      } else {
        /* theme 服务不可用：仅 CSS 层生效（静默降级） */
      }
    } catch (e) { /* overrideTokens 失败：静默降级，CSS 层仍生效 */ }
    ctx.effect(() => () => {
      style.remove();
    });
  },
};
	}
});
`;

const out = header + body + tail;
// 写盘断言：非空 + 关键标记齐全
if (out.length < 1000) throw new Error('assembled output suspiciously small');
for (const mark of ['__ModuleLoader__.load', 'dsh-theme-macintosh', '/mcx-assets/fonts/ChiKareGo.ttf', 'inject: ["slots", "theme", "sessions", "workspaces"]', 'McFinder: McFinder', 'McFlow: McFlow', 'McThink: McThink', 'McSysCard: McSysCard', 'McTool: McTool', 'McDock: McDock', 'McMenus: McMenus', "--dsw-specific-bubble': pair('var(--mc-accent)')", 'return {\n  inject']) {
  if (!out.includes(mark)) throw new Error('marker missing in output: ' + mark);
}
writeFileSync(OUT, out);
console.log('client.js written: ' + out.length + ' chars, ' + out.split('\n').length + ' lines');
