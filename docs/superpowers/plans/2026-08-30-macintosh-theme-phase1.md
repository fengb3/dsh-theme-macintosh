# Macintosh 主题 · 一期（基础壳）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付一期基础壳——动态 Cordis 插件在本 GUI 呈现 Macintosh 风格画布 + 官方 token 映射 + chrome/sidebar 覆写 + 深浅切换 + kit 检视页骨架，可干净撤除。

**Architecture:** 单个动态 Cordis 插件（客户端为主）。源码按模块拆在 `src/`（每模块导出 `{ css, mount?, slots? }`），`tools/assemble.mjs` 在本地把模块拼接 + 字体 base64 内联成单文件客户端函数体 `dist/client-body.js`，再经 `cordis_define` 定义、`cordis_run` 激活。宿主 DOM 映射分三层（token alias / 自有 Slot DOM / 集中映射表）。

**Tech Stack:** 纯 JavaScript（无 TS/JSX/bundler）、node --test（仅纯函数测试）、Cordis 动态插件（client half）、CSS 自定义属性。

**Spec:** `docs/superpowers/specs/2026-08-30-macintosh-theme-design.md`

## Global Constraints

- 一切代码为 plain JavaScript；client half 内禁 `import/require/TS/JSX`；React 用 `React.createElement`。
- 动画纪律（spec §5）：无 hover、无 transition、按压只 `:active`、选中只 `.on` 整块反色；一切延时走 `CLOCK.next`；`prefers-reduced-motion:reduce` 压 `.01ms`；浅色下 flash/cover/refresh 遮罩三处反转。
- 主题变量前缀 `--mc-*`；深浅切换 = `<html data-theme="dark|light">`；浅色不覆盖 `--desktop-pattern`。
- 官方 selector 只允许出现在 `src/chrome/map.js`。
- 所有副作用可逆：style/sprite/CLOCK/Slot 全部走 `ctx.effect()` 或 Slot 自带销毁。
- token/样式规范源 = `prototype/macintosh-workspace.html`；行为参照 = `prototype/macintosh-interactive.html`；手册 = `prototype/component-dev-notes.md`（下称《笔记》）。
- 每任务一次 commit；`node --test test/` 全绿后才 commit。

## File Structure

```
src/core/tokens.js    —— --mc-* 双主题变量全集 + 字体 + primitives 样式（css 串）
src/core/clock.js     —— CLOCK 单例（next/syncAnim/dispose）
src/core/mcfx.js      —— flashIn/flashOut/accToggle + esc
src/core/sprite.js    —— SVG sprite 串 + 注入/撤除
src/chrome/map.js     —— 官方 DOM 层3映射表（唯一官方 selector 文件）
src/chrome/chrome.js  —— 官方固有元素染色 + 桌面噪点画布（shell.overlay）
src/chrome/sidebar.js —— 侧栏 Finder 窗覆写 + 月牙钮（sidebar.footer.action）
src/kit.js            —— kit 检视页（shell.overlay，默认关）
src/assemble.input.js —— 模块清单与装配序（assemble 的输入）
tools/assemble.mjs    —— 拼接 + 字体 base64 内联 → dist/client-body.js
test/clock.test.mjs / test/mcfx.test.mjs —— node --test 纯函数测试
dist/client-body.js   —— 生成物（.gitignore）
```

**模块协议**（各模块一律导出此形状）：

```js
// src/ 下每个模块文件最终被 assemble 拼接；在拼接产物中每个模块形如：
//   McTokens = { css: '...' }
//   McClock  = { mount(ctx) {...} }
//   McSidebar= { css: '...', slots(ctx) {...} }
// assemble.input.js 声明装配序：['McTokens','McClock','McMcfx','McSprite','McChrome','McSidebar','McKit']
```

---

### Task 1: 装配管线 + 最小 Package（层1 token alias）

**Files:**
- Create: `tools/assemble.mjs`、`src/assemble.input.js`、`src/core/tokens.js`（本任务先只放 alias 层）、`.gitignore`（补 `dist/`）、`test/smoke.test.mjs`

**Interfaces:**
- Produces: `tools/assemble.mjs` 用法 `node tools/assemble.mjs` → 写 `dist/client-body.js`（client 函数体全文，plain JS，无 import）；模块接口协议 `{ css?, mount?(ctx)?, slots?(ctx)? }`。

- [ ] **Step 1: 写失败测试**（验证 assemble 输出含 alias 且无 import）

```js
// test/smoke.test.mjs
import { test } from 'node:test'; import assert from 'node:assert/strict'; import { execFileSync } from 'node:child_process';
test('assemble 产出无 import 且含 dsw alias', () => {
  execFileSync('node', ['tools/assemble.mjs']);
  const out = require('node:fs').readFileSync('dist/client-body.js', 'utf8');
  assert.ok(!/\bimport\b|\brequire\b/.test(out));
  assert.ok(out.includes('--dsw-alias-bg-base'));
});
```

- [ ] **Step 2: 跑测试确认失败** — Run: `node --test test/`；Expected: FAIL（assemble.mjs 不存在）。

- [ ] **Step 3: 实现 assemble + tokens alias 层**

```js
// tools/assemble.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const ORDER = ['McTokens','McClock','McMcfx','McSprite','McChrome','McSidebar','McKit'];
const modules = ORDER.map(n => readFileSync(`src-build/${n}.js`, 'utf8')).join('\n');
const body = `${modules}
return (function(){
  const mods = { McTokens, McClock, McMcfx, McSprite, McChrome, McSidebar, McKit };
  const order = ${JSON.stringify(ORDER)};
  return {
    apply(ctx) {
      const style = document.createElement('style');
      style.setAttribute('data-mc-root','');
      let css = '';
      for (const k of order) { const m = mods[k]; if (!m) continue;
        if (m.css) css += m.css + '\\n';
        if (m.mount) try { ctx.effect(() => m.mount(ctx) && m.mountTeardown && m.mountTeardown()) } catch(e) { /* 模块失败不拖垮其余 */ }
        if (m.slots) try { m.slots(ctx) } catch(e) {}
      }
      style.textContent = css; document.head.appendChild(style);
      ctx.effect(() => style.remove());
    },
  };
})();`;
mkdirSync('dist', { recursive: true }); writeFileSync('dist/client-body.js', body);
```

（注意：本任务先建 `src-build/` 快照目录承接模块文件——`tools/sync-src.mjs` 把 `src/**` 按 ORDER 复制成 `src-build/Mc*.js` 平铺快照；模块文件即"函数体内的顶层声明"，文件内容不得含 import/export。）

```js
// src/core/tokens.js —— 本任务先写层1：alias + 最小 --mc-* 底色（深浅两套，值照《笔记》§4.1）
const McTokens = {
  css: `:root{
  --mc-bg:#2b2b2b; --mc-bg-deep:#1f1f1f;
  --mc-surface:#3d3d3d; --mc-surface-2:#4a4a4a; --mc-surface-3:#575757;
  --mc-fg:#f2f2f2; --mc-muted:#bdbdbd; --mc-faint:#949494;
  --mc-border:#e9e9e9; --mc-accent:#dadaff; --mc-accent-strong:#f2f2ff; --mc-accent-dim:rgba(218,218,255,.4); --mc-accent-ink:#1f1f2e;
  --mc-spark:#e8b64c; --mc-success:#7ed07e; --mc-danger:#ff7a74; --mc-danger-ink:#2b1211; --mc-warn:#e8b64c;
  --mc-sel-bg:rgba(218,218,255,.26); --mc-rail-1:#383838; --mc-rail-2:#414141;
  --dsw-alias-bg-base:var(--mc-bg); --dsw-alias-bg-layer-1:var(--mc-surface); --dsw-alias-bg-layer-2:var(--mc-surface-2);
  --dsw-alias-bg-overlay:var(--mc-surface-3); --dsw-alias-border-l1:var(--mc-border); --dsw-alias-border-l2:var(--mc-border);
  --dsw-alias-brand-primary:var(--mc-accent); --dsw-alias-label-primary:var(--mc-fg); --dsw-alias-label-secondary:var(--mc-muted);
  --dsw-alias-state-error-primary:var(--mc-danger); --dsw-alias-state-success-primary:var(--mc-success); --dsw-alias-state-warn-primary:var(--mc-warn);
  --dsw-specific-sidebar-fill:var(--mc-rail-1);
}
html[data-theme="light"]{
  --mc-bg:#8f8f8f; --mc-surface:#fff; --mc-surface-2:#eee; --mc-surface-3:#ddd;
  --mc-fg:#0a0a0a; --mc-muted:#333; --mc-faint:#555; --mc-border:#0a0a0a;
  --mc-accent:#8f8fc0; --mc-sel-bg:#dadaff; --mc-warn:#8a6a1f;
  --dsw-specific-sidebar-fill:var(--mc-surface);
}`
};
```

- [ ] **Step 4: 跑测试确认通过** — Run: `node --test test/`；Expected: PASS。
- [ ] **Step 5: 首次激活验证** — 把 `dist/client-body.js` 全文作为 `cordis_define`（新插件，idPrefix `mcx`）的 `code.client`，`cordis_run` mode:run；刷新页面看整体配色变为暗夜 Mac（层1 生效）；确认 stop 后无残留 `<style data-mc-root>`。
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat(mcx): 装配管线与层1 token alias"`

### Task 2: CLOCK 帧时钟（core/clock.js）

**Files:** Create `src/core/clock.js`、`test/clock.test.mjs`

**Interfaces:**
- Produces: `CLOCK.next(fn, ms)`（量化到 ≥ms 后的最近 100ms 栅格沿）、`CLOCK.syncAnim(el, period, prop)`（默认写 `--pulse-delay`，prop 可传 `'--sweep-delay'`，值为 `-(now % period)ms`）、`CLOCK.PULSE=2600`、`CLOCK.SWEEP=1000`、`CLOCK.dispose()`。模块导出 `{ mount(ctx) }`（mount 建 timer 循环并返回 teardown）。

- [ ] **Step 1: 失败测试**

```js
// test/clock.test.mjs —— 测纯函数量化逻辑；把 computeNext 抽成可测纯函数放文件顶部
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { computeNext } from '../src/core/clock.js';
test('computeNext 量化到最近栅格沿(向上)', () => {
  assert.equal(computeNext(1000, 1050, 100), 1100); // now=1000,ms=50 → ≥1050 的沿
  assert.equal(computeNext(1000, 1010, 100), 1100);
  assert.equal(computeNext(1000, 900, 100), 1000);  // 已在下个沿前
});
```

- [ ] **Step 2: 确认失败** — `node --test test/clock.test.mjs` → FAIL（无 export）。
  注：模块文件"不得含 import/export"与测试导入矛盾——解决：clock.js 顶部用 `const __export = {}; if (typeof module !== 'undefined') module.exports = { computeNext };`，测试用 `require`（.cjs 改名或 `createRequire`）。测试文件改用 `createRequire` 导入。
- [ ] **Step 3: 实现**（栅格沿 = `Math.ceil((now+ms+1)/100)*100`，照《笔记》§1.1；syncAnim 写 `el.style.setProperty(prop, -(Date.now()%period)+'ms')`；mount 起 100ms setInterval 分发队列，dispose 清空）
- [ ] **Step 4: 通过 + commit** — `node --test test/` 全绿；`git commit -m "feat(mcx): CLOCK 100ms 栅格帧时钟"`

### Task 3: mcfx 闪烁三件套（core/mcfx.js）

**Files:** Create `src/core/mcfx.js`、`test/mcfx.test.mjs`

**Interfaces:**
- Produces: `esc(s)`（`& < > "` 转义）；`flashIn(el, show)`（ghost→show()→flash→撤，各 100ms 走 CLOCK.next）；`flashOut(el, hide)`；`accToggle(card, fn)`（四拍，`dataset.busy` 防重入）。CSS 侧 `.mc-ghost/.mc-flash` 类与浅色反转（`html[data-theme="light"] .mc-flash{background:#0a0a0a}` + 扫描线反白）追加进 `McTokens.css`（照《笔记》§0.3/§5.3）。

- [ ] **Step 1: 失败测试**（esc 纯函数 + 三拍时序用假 CLOCK/假 el）

```js
// test/mcfx.test.mjs
import { test } from 'node:test'; import assert from 'node:assert/strict';
const { esc } = require('../src/core/mcfx.js');
test('esc 转义四种字符', () => {
  assert.equal(esc('<a href="x">&'), '&lt;a href=&quot;x&quot;&gt;&amp;');
});
```

- [ ] **Step 2: 确认失败** → **Step 3: 实现**（flashIn: el.classList.add('mc-ghost') → CLOCK.next(100) 里 show() + 换 'mc-flash' → CLOCK.next(100) 撤两类；每拍前 `if(!el.isConnected) return`）→ **Step 4: 通过** → **Step 5: commit** `feat(mcx): mcfx 闪烁三件套与 esc`

### Task 4: SVG sprite + 字体内联（core/sprite.js + assemble 字体步骤）

**Files:** Create `src/core/sprite.js`；Modify `tools/assemble.mjs`（字体 base64 内联）

**Interfaces:**
- Produces: `McSprite = { mount(ctx) }`——注入 `<svg data-mc-sprite style="display:none">`（symbol 库从 `prototype/macintosh-interactive.html` 的 FIGMA-ASSETS 区间逐只复制：品牌 5 件 + 一期用到的功能图标；多色位挂 `var(--box-line/--box-face/--surface-3)`，单色位 `currentColor`）。`tokens.js` 的 @font-face 由 assemble 生成：读 `assets/fonts/*.ttf`（5 个 ttf）→ base64 data URI → 拼 5 条 @font-face（unicode-range 别名照《笔记》§4.2，数字有意不截获）注入 `McTokens.css` 头部。assemble 增测试：输出含 `data:font/ttf;base64,` 且含 `unicode-range`。

- [ ] **Step 1: smoke.test.mjs 加字体断言（失败）** → **Step 2: 确认失败** → **Step 3: 实现** → **Step 4: 通过 + cordis_define append 新 Package + run，页面字体变像素体（菜单/按钮拉丁走 ChiKareGo，中文走 Fusion Pixel）** → **Step 5: commit** `feat(mcx): sprite 注入与字体 base64 内联`

### Task 5: tokens/primitives 完整样式段 + kit 检视页骨架

**Files:** Modify `src/core/tokens.js`（补全 §4.1 全集：阴影/几何/动效 token、::selection、focus 虚线环、15px 滚动条、primitives：.btn 双内环/.icon-btn/.pill 八角点/.field/.tri + mc-pulse/mc-sweep keyframes）；Create `src/kit.js`

**Interfaces:**
- Produces: `McKit = { css, slots(ctx) }`——占 `shell.overlay`（order 靠后），默认渲染 null；暴露全局开关 `window.__MC_KIT_OPEN__`（true 时渲染检视页：点阵 scrim + 一期组件分区：tokens 色板 / primitives 五态×（btn: 默认·primary·danger·active·disabled；pill: run·done·fail·wait·accent；field；tri）/ 闪烁演示按钮（点了触发 flashIn/flashOut/accToggle）/ sprite 图标墙）。React.createElement 编写；样式类名复用主题类，检视页专属布局类加 `kit-` 前缀。
- Consumes: Task 3 的 flashIn/accToggle（演示区直接调用）。

- [ ] **Step 1: 实现 tokens 补全**（无测试——纯样式；验证走 kit 页）
- [ ] **Step 2: 实现 kit.js**（结构：`React.createElement('div',{className:'kit-scrim',onClick:close}, …sections)`；`slots(ctx)` 里 `ctx.slot.shell.overlay.register({ id:'mc-kit', order:900, label:'MC Kit' })` 返回渲染函数）
- [ ] **Step 3: assemble + define + run**；控制台 `__MC_KIT_OPEN__=true` 打开检视页，与 `prototype/macintosh-workspace.html` 并排目视比对 primitives 区
- [ ] **Step 4: 走查**——无 hover/无 transition（DevTools 查 computed transition 全为 none）、深浅切换下 flash 反转
- [ ] **Step 5: commit** `feat(mcx): tokens/primitives 全集与 kit 检视页骨架`

### Task 6: 探针 spike + chrome 染色 + 桌面画布

**Files:** Create `src/chrome/map.js`、`src/chrome/chrome.js`

**Interfaces:**
- Produces: `map.js` 导出 `MAP = { appRoot, mainColumn, sessionHeader, scrollport, composerCard }`（值先为探针结论，选择器优先 data-* > aria/role > class）；`McChrome = { css, slots(ctx) }`——css 用 MAP 拼：主列容器套 `.win` 语汇染色（surface 底 + 1px `--mc-border` 边 + 硬投影 `3px 3px 0 0`、圆角 5px）、滚动条换 15px 双轨、会话头部条 surface-3 + 底线；`shell.overlay` 注册 `mc-desktop`（order:-1，渲染 `pointer-events:none; position:fixed; inset:0; z-index:0` 的噪点画布 div，`background:var(--mc-desktop-pattern)` 8×8 平铺，从 prototype HTML 拷 base64 瓦片进 tokens）。
- 探针（throwaway，不入库）：临时在插件 apply 里 `console.log` 各候选区域的外层结构（tagName/attrs/class 前 3 个），`cordis_define` 一次临时 Package 跑完即弃，结论回填 MAP。

- [ ] **Step 1: 跑探针 spike，回填 MAP** → **Step 2: 实现 chrome.js** → **Step 3: define+run，目视：主列成窗、桌面出噪点、官方消息区滚动条变经典款** → **Step 4: 失配演练**——把 MAP.scrollport 故意改成不存在值，确认该区回退 token 配色不破版，再改回 → **Step 5: commit** `feat(mcx): chrome 染色与桌面画布`

### Task 7: sidebar 覆写 + 月牙钮

**Files:** Create `src/chrome/sidebar.js`

**Interfaces:**
- Produces: `McSidebar = { css, slots(ctx) }`——css：经 MAP 侧栏锚点（复用 map.js 增 `sidebar`、`sidebarBrand`、`sessionRow`、`sessionRowSelected` 四键）套 Finder 窗：rail-1 底 + `--mc-border` 右边线 + 会话行 26px 高/ellipsis/选中 `.on` 语义（映射官方选中态类，整行反色 `background:var(--mc-fg)` 圆角 0）；`slots`：`ctx.slot.sidebar.footer.action.register({ id:'mc-theme-toggle', order:50, label:()=>'切换深浅主题' })` 渲染月牙 icon-btn（svg 用 sprite），onClick flip `document.documentElement.dataset.theme`（dark↔light，缺省视为 dark）。
- Consumes: map.js（Task 6）、sprite（Task 4）、.icon-btn 样式（Task 5）。

- [ ] **Step 1: 探针补充侧栏锚点回填 MAP** → **Step 2: 实现** → **Step 3: define+run，目视：侧栏成 Finder 窗、会话行选中反色方角、点月牙深浅切换且三处遮罩颜色反转（kit 页开着切最明显）** → **Step 4: commit** `feat(mcx): sidebar Finder 覆写与主题月牙钮`

### Task 8: 收尾——撤除回归 + 走查清单 + 交付说明

**Files:** Modify `README.md`（新增「一期预览」一节：如何 assemble/define/run/stop、kit 页开关）

- [ ] **Step 1: 撤除回归** — `cordis_stop` 后刷新：`document.querySelectorAll('[data-mc-root],[data-mc-sprite],[data-mc-desk]')` 为空、无 `--mc-` 残留 computed style、官方配色恢复。
- [ ] **Step 2: 走查清单**（照《笔记》§13 裁剪）：无 hover/无 transition/延时走 CLOCK（grep 产物无 setTimeout 直调）/pulse·sweep 负延迟/reduced-motion/浅色遮罩反转/`esc()` 用于一切动态文本。
- [ ] **Step 3: README 更新 + commit** `docs(mcx): 一期预览使用说明` — `git commit -m "docs(mcx): 一期预览使用说明"`
- [ ] **Step 4: 终验** — `node --test test/` 全绿；define 最终 Package（含全部模块）+ run；向用户演示：真实 UI 主题 + kit 检视页 + 深浅切换 + stop 干净撤除。

---

## Self-Review 结论

- Spec 覆盖：§1 架构（Task 1/6/7）、§2 文件组织与 kit（Task 1/5）、§3 一期模块 1–5（Task 2–7）、§4 映射三层（Task 1/6/7）、§5 动画纪律（Task 2/3/5/8）、§6 错误处理（Task 1 装配器 try/catch、Task 3 isConnected、Task 6 失配演练）、§7 测试（各任务 + Task 8）、§8 一期交付（Task 8）。二期/三期不在本计划，符合既定范围。
- 占位符：无 TBD/TODO；代码步骤均给出实现。
- 类型一致：模块协议 `{ css, mount?, slots? }`、`CLOCK.next/syncAnim/dispose`、`esc/flashIn/flashOut/accToggle`、MAP 键名各任务一致。
