# Macintosh 主题 · 菜单体系（overlays 批 1）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付 `.menu` 弹出菜单体系 + sidebar 五处菜单补全——槽替换优先/自绘兜底，保官方插槽兼容，失配优雅降级。

**Architecture:** `client.js` 新增 `McMenus` 模块（`{css, mount}`）入 mods/order（McSysCard 后、McKit 前）。触发钮全部是 McFinder 自有 DOM（`data-mc-finder`），自绘菜单挂触发钮容器内 absolute 定位；官方 selector 仅「藏宿主原生菜单 + 动作接线目标」进 MC_MAP menu 段；菜单项渲染前经接线表过滤（勘不通的项自动不出现）；出场 flashIn/收场 flashOut，状态切换 accToggle。

**Tech Stack:** 纯 JavaScript（loader 格式 client.js，禁 import/TS/JSX）、React.createElement（仅 kit 需要）、CSS 自定义属性、node --test、playwright（门禁）。

**Spec:** `docs/superpowers/specs/2026-09-01-macintosh-theme-menus-design.md`（同行；原型 DOM 基准 `prototype/macintosh-workspace.html` L789-810 样式、L2466-2520 结构）

## Global Constraints

- plain JavaScript；client.js 为函数体（loader 格式），禁 `import/require 直调/TS/JSX`（镜像守卫式 require 与 CJS shim 除外，照 think/syscard 先例）。
- 动画纪律：无 `:hover`、无 `transition`（压平声明 `transition:none` 例外）、按压只 `:active`、一切延时走 `CLOCK.next`（禁裸 setTimeout）、`prefers-reduced-motion:reduce` 压 `.01ms` + JS 跳拍；出场=flashIn 三拍、状态切换=accToggle 四拍（七轮统一裁定）。
- 官方 selector 只允许出现在 client.js 的 `MC_MAP` 段（audit 管制）；失配 = 官方原生菜单照常，不破版。
- **dev 循环 = 改 client.js → 浏览器刷新即生效**；改 package.json/index.js/cordis.patch.yml 才需重启（`~/.dsh/restart-web.ps1`）。
- 每任务一 commit，`npm test` 全绿后才 commit。
- 值源：颜色/几何/字号一律 `--mc-*`/`--font-*` token 引用（浅色自动跟随）；动态文本经 esc()。
- 验收流程规则（用户裁定）：实现完**不自动跑活体验证**；活体须用户发起且覆盖多会话，单会话不作数。**探针（Task 1）是实现期动作，不在此列。**

## File Structure

```
client.js               MC_MAP menu 段 + McMenus 模块 + mods/order
src/conv/overlays.js    设计参照镜像（含纯函数 + CJS shim）
test/menus.test.mjs     状态机/过滤/定位纯函数测试（新建）
tools/probe-menus.mjs   宿主菜单管道探针（Task 1 建，勘定后保留复勘用）
tools/verify-menus.mjs  活体门禁（新建）
tools/audit.mjs         menu 段特征片段核验扩容
prototype/component-dev-notes.md  §8 追加菜单落地差异注记（收尾）
```

---

### Task 1: 宿主菜单管道探针 + MC_MAP menu 段 + audit 扩容

**Files:**
- Create: `tools/probe-menus.mjs`
- Modify: `client.js`（MC_MAP 闭合 `}` 前追加 menu 段）
- Modify: `tools/audit.mjs`（map 段特征清单）
- Modify: 本 plan 文件（探针结论回填处）

**Interfaces:**
- Produces: MC_MAP 新键（Task 4/5 消费）：`menuPortal`（宿主弹出菜单 portal 容器，若有）、`menuHostItem`（宿主原生菜单项，自绘兜底藏它）、以及 Task 5 各菜单动作接线勘定记录（写死进 plan 附录 A）。
- Consumes: 宿主 127.0.0.1:3080 运行中（空会话即可）。

- [ ] **Step 1: 写探针脚本**（结构照 live-common.mjs 复用；无 live-common 可用则照已删 probe-* 模式自含）：

```js
// tools/probe-menus.mjs — 宿主菜单管道探针(2026-09;勘定 MC_MAP menu 段与动作接线)
// 用法: node tools/probe-menus.mjs   (宿主须运行于 127.0.0.1:3080)
// 勘察目标:
//  1. sidebar 会话行/分组头是否有宿主原生 contextmenu(右键)或 dots 菜单 → portal 挂哪、菜单项 label 列表
//  2. 菜单项动作如何触发: 元素 data-* / aria / click 委托 / 服务名(ctx.sessions.* 有哪些方法)
//  3. slots 注册表有无 menu 相关 keyed 槽(遍历 slots.list?.() 或 fiber 注册表)
import { chromium } from 'playwright';
const b = await chromium.launch(); const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto('http://127.0.0.1:3080');
// A: 右键会话行 → dump 200ms 内新增 body 子节点(菜单 portal)及其 innerText/结构
await pg.waitForTimeout(1500);
const row = await pg.$('[role="treeitem"]'); if (row) { await row.click({ button: 'right' }); }
await pg.waitForTimeout(300);
const dump = await pg.evaluate(() => {
  const out = [];
  for (const el of document.body.children) out.push(el.tagName + '.' + el.className + ' :: ' + (el.textContent || '').slice(0, 200));
  return out;
});
console.log('BODY_CHILDREN_AFTER_RIGHTCLICK:\n' + dump.join('\n'));
// B: slots 注册表(经我们插件的 ctx 不可达则跳过;kit __MC_KIT_OPEN__ 不开)
// C: 宿主 sessions 服务面(经 window 上的调试钩子若有;无则记 NO_SURFACE)
console.log('PROBE_DONE');
await b.close();
```

- [ ] **Step 2: 跑探针** — `node tools/probe-menus.mjs`，把输出贴回本 plan 附录 A（下述空表回填）。
- [ ] **Step 3: 回填 MC_MAP menu 段**（client.js MC_MAP 闭合前；探针无发现的键保留占位字符串 `''` 并注明，Task 4 对空串跳过）：

```js
  // —— menu 段(弹出菜单;探针 2026-09-XX,host <版本>——附录A)——
  menuPortal: '',            // 宿主菜单 portal 容器选择器(勘定回填;空=宿主无全局菜单管道)
  menuHostItem: '',          // 宿主原生菜单项选择器(自绘兜底藏;空=无原生菜单)
```

- [ ] **Step 4: audit 扩容** — `tools/audit.mjs` map 段特征片段核验追加 1 条：`'menuPortal'`（确认该字面量只出现在 MC_MAP 段与 McMenus 段注释）。
- [ ] **Step 5: `npm test` 全绿**（MC_MAP 加键零行为变化，应直接绿）。
- [ ] **Step 6: Commit** — `feat(mcx-menus): 菜单探针与 MC_MAP menu 段`

### Task 2: .menu 原语 CSS + McMenus 骨架 + mods/order

**Files:**
- Modify: `client.js`（McSysCard 段后插 McMenus 骨架；mods/order 两处）
- Create: `src/conv/overlays.js`（镜像，含 CJS shim 空出口）

**Interfaces:**
- Produces: `McMenus = { css, mount(ctx) }`（mount Task 4 实装，本任务返回 null）；`.menu/.m-group/.m-opt/.m-sep/.mo-ic` 样式类（Task 4/7 消费）。

- [ ] **Step 1: src/conv/overlays.js 骨架 + 镜像同源段**（client.js 内同段直放；样式照原型 L789-810 直抄，token 换 `--mc-*` 名）：

```js
// src/conv/overlays.js —— 弹出菜单体系(spec 2026-09-01 菜单批)
// 协议 { css, mount(ctx) }。自绘菜单挂触发钮容器(自有 DOM);无 :hover 无 transition。
// 菜单原语(原型 §9 L789-810 直抄;token 换 --mc-*)
const MC_MENUS_CSS = [
  '.mc-menu{position:absolute;display:flex;flex-direction:column;min-width:210px;padding:4px;',
  ' background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:var(--mc-r-card);',
  ' box-shadow:var(--mc-shadow-pop);z-index:70;font-family:var(--font-sb)}',
  '.mc-menu .m-group{padding:5px 9px 3px;font:600 10px/1.6 var(--font-display);letter-spacing:.1em;',
  ' color:var(--mc-faint);text-transform:uppercase}',
  '.mc-menu .m-opt{display:flex;align-items:center;gap:10px;padding:5px 9px;cursor:pointer;',
  ' border-radius:var(--mc-r-tag);font:400 13px/1.5 var(--font-ui);color:var(--mc-fg);background:none;border:0;text-align:left;width:100%}',
  '.mc-menu .m-opt:active{background:var(--mc-fg);color:var(--mc-surface)}',
  '.mc-menu .m-opt.danger{color:var(--mc-danger)}',
  '.mc-menu .m-opt.danger:active{background:var(--mc-danger);color:var(--mc-surface)}',
  '.mc-menu .m-opt.on{background:var(--mc-accent);color:var(--mc-accent-ink)}',
  '.mc-menu .m-opt .mo-ic{width:14px;height:14px;flex:none;color:var(--mc-muted)}',
  '.mc-menu .m-opt.on .mo-ic{color:var(--mc-accent-ink)}',
  '.mc-menu .m-opt.danger .mo-ic{color:inherit}',
  '.mc-menu .m-sep{height:1px;margin:4px 5px;background:var(--mc-border-soft)}',
].join('');
var McMenus = {
  css: MC_MENUS_CSS,
  mount: function (ctx) {
    // Task 4 实装:委托 click + 开合状态机 + 动作接线
    return null;
  },
};
if (typeof module !== 'undefined') module.exports = { McMenus: McMenus };
```

- [ ] **Step 2: mods/order 挂载** — client.js mods 表加 `McMenus: McMenus,`、order 数组 McSysCard 后插 `"McMenus"`；`src/assemble.input.js` ORDER/MODULE_MAP 同步加 `McMenus: 'src/conv/overlays.js'`；重跑 `node tools/assemble.mjs && node tools/make-persistent-client.mjs`（链路上轮已修复，刷新即入）。
- [ ] **Step 3: 刷新验证** — 打开 GUI 刷新，eval `document.querySelector('[data-mc-root]').textContent.includes('.mc-menu')` 为 true；无报错。
- [ ] **Step 4: `npm test` + Commit** — `feat(mcx-menus): .menu 原语与 McMenus 骨架`

### Task 3: 菜单纯函数（TDD）：定义表过滤 + 定位翻转 + 状态机

**Files:**
- Create: `test/menus.test.mjs`
- Modify: `src/conv/overlays.js` + client.js 镜像段（纯函数追加）

**Interfaces:**
- Produces（Task 4/5 消费，三函数全部纯数据进纯数据出）：
  - `mcMenuItems(def, wiring)` → 有效菜单项数组（wiring 缺失的项被滤除；`{sep:true}` 恒保留）
  - `mcMenuAlign(anchorRect, viewportW, menuW)` → `'left' | 'right'`（右缘溢出翻转）
  - `mcMenuState(state, ev)` → 新 state；state 形如 `{ open: null | { id, anchor } }`，ev 形如 `{ t: 'open', id, anchor } | { t: 'close' } | { t: 'esc' } | { t: 'pick' }`（open 新菜单时旧 open 让位=单例互斥）

- [ ] **Step 1: 写失败测试**：

```js
// test/menus.test.mjs
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { mcMenuItems, mcMenuAlign, mcMenuState } = createRequire(import.meta.url)('../src/conv/overlays.js');

const DEF = { items: [
  { id: 'rename', label: '重命名' },
  { sep: true },
  { id: 'archive', label: '归档' },
  { id: 'delete', label: '删除', danger: true },
] };

test('mcMenuItems: 无接线的项被滤除,sep 恒保留', () => {
  assert.deepEqual(mcMenuItems(DEF, { rename: function () {}, delete: function () {} }).map((i) => i.id || 'sep'),
    ['rename', 'sep', 'delete']); // archive 无接线 → 不出现
  assert.deepEqual(mcMenuItems(DEF, {}).length, 1); // 只剩 sep
});

test('mcMenuAlign: 右缘溢出翻转', () => {
  assert.equal(mcMenuAlign({ left: 100, right: 200 }, 1440, 210), 'left');   // 常规左对齐
  assert.equal(mcMenuAlign({ left: 1300, right: 1420 }, 1440, 210), 'right'); // 溢出 → 右对齐
});

test('mcMenuState: 单例互斥 + esc/外点/pick 关闭', () => {
  const s1 = mcMenuState({ open: null }, { t: 'open', id: 'sess', anchor: { left: 0 } });
  assert.equal(s1.open.id, 'sess');
  const s2 = mcMenuState(s1, { t: 'open', id: 'group', anchor: { left: 0 } });
  assert.equal(s2.open.id, 'group'); // 互斥:换开
  for (const t of ['close', 'esc', 'pick']) assert.equal(mcMenuState(s2, { t }).open, null);
  assert.deepEqual(mcMenuState({ open: null }, { t: 'esc' }), { open: null }); // 关空态无害
});
```

- [ ] **Step 2: 跑测试确认失败** — `node --test test/menus.test.mjs` → FAIL（无 export）。
- [ ] **Step 3: 实现**（src/conv/overlays.js 追加；client.js 镜像同段；CJS shim 出口扩三函数）：

```js
function mcMenuItems(def, wiring) {
  return (def && def.items ? def.items : []).filter(function (it) {
    return !!it.sep || !!(wiring && wiring[it.id]);
  });
}
function mcMenuAlign(anchorRect, viewportW, menuW) {
  if (!anchorRect) return 'left';
  return anchorRect.left + menuW > viewportW - 8 ? 'right' : 'left';
}
function mcMenuState(state, ev) {
  var s = state || { open: null };
  if (!ev) return s;
  if (ev.t === 'open') return { open: { id: ev.id, anchor: ev.anchor || null } };
  return { open: null }; // close/esc/pick 一律关
}
```

- [ ] **Step 4: 跑测试通过** — `node --test test/` 全绿（既有 34 + 新 3）。
- [ ] **Step 5: Commit** — `feat(mcx-menus): 菜单纯函数(过滤/定位/状态机)`

### Task 4: McMenus.mount 实装：开合管道 + 菜单渲染 + 全局关闭渠道

**Files:**
- Modify: `client.js`（McMenus.mount 替换占位）、`src/conv/overlays.js` 镜像
- Modify: `test/flow-mount` 相关（若 audit 对 mount 段有 setTimeout 特征依赖——无则不动）

**Interfaces:**
- Consumes: Task 2 `MC_MENUS_CSS`、Task 3 三纯函数、库 `flashIn/flashOut/accToggle`、`CLOCK`、`esc`、`MC_MAP.menuPortal/menuHostItem`。
- Produces: 全局 `McMenus` 渲染管道——菜单 id → 定义/接线注册表 `MC_MENU_DEFS`/`MC_MENU_WIRING`（Task 5 填充具体菜单）；DOM 协议：自绘菜单 `.mc-menu` 挂触发钮 `offsetParent` 容器（McFinder 按钮容器加 `position:relative`——CSS 追加 `.mc-sb-find .mc-anchor{position:relative}`，锚类由 Task 5 给触发钮包裹）。

- [ ] **Step 1: mount 实现**（替换骨架占位；client.js 与镜像同源）：

```js
  mount: function (ctx) {
    var state = { open: null };
    var wrap = null;           // 当前活动菜单 DOM
    var wiringCtx = { ctx: ctx }; // 接线函数收到的统一上下文
    function closeMenu() {
      if (!wrap) { state = mcMenuState(state, { t: 'close' }); return; }
      var w = wrap; wrap = null;
      state = mcMenuState(state, { t: 'close' });
      flashOut(w, function () { try { w.remove(); } catch (e) {} });
    }
    function openMenu(id, host) { // host=触发钮(button);菜单挂其 offsetParent
      var def = MC_MENU_DEFS[id]; if (!def) return;
      var anchor = host.offsetParent || host.parentElement; if (!anchor) return;
      closeMenu();
      anchor.classList.add('mc-anchor');
      wrap = document.createElement('div');
      wrap.className = 'mc-menu';
      var items = mcMenuItems(def, MC_MENU_WIRING);
      var html = '';
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        html += it.sep ? '<span class="m-sep"></span>'
          : '<button type="button" class="m-opt' + (it.danger ? ' danger' : '') + (it.on ? ' on' : '') +
            '" data-mc-mi="' + esc(it.id) + '">' +
            (it.icon ? '<svg class="mo-ic" viewBox="0 0 24 24" aria-hidden="true"><use href="' + esc(it.icon) + '"/></svg>' : '') +
            '<span>' + esc(it.label) + '</span></button>';
      }
      wrap.innerHTML = html; // 全动态段经 esc
      var side = mcMenuAlign(host.getBoundingClientRect(), window.innerWidth, 220);
      wrap.style.left = side === 'right' ? 'auto' : '0';
      wrap.style.right = side === 'right' ? '0' : 'auto';
      wrap.style.top = 'calc(100% + 6px)';
      anchor.appendChild(wrap);
      state = mcMenuState(state, { t: 'open', id: id, anchor: null });
      flashIn(wrap, function () {});
    }
    function onDocClick(e) { // 外点关 + 菜单项派发(捕获段早于按钮自身 React 处理)
      try {
        if (wrap && !wrap.contains(e.target)) { closeMenu(); return; }
        var mi = e.target instanceof Element && e.target.closest('.m-opt');
        if (mi && wrap && wrap.contains(mi)) {
          var id = state.open && state.open.id;
          var fn = MC_MENU_WIRING[mi.getAttribute('data-mc-mi')];
          closeMenu();
          try { if (fn) fn(wiringCtx); } catch (er) { /* 动作失败静默;官方状态为准 */ }
          void id;
        }
      } catch (er) {}
    }
    function onKey(e) { try { if (e.key === 'Escape') closeMenu(); } catch (er) {} }
    document.addEventListener('click', onDocClick, true);
    document.addEventListener('keydown', onKey, true);
    // 宿主原生菜单兜底隐藏(Task 1 勘定键为空则跳过;藏不删)
    var styleEl = null;
    if (MC_MAP.menuPortal) {
      styleEl = document.createElement('style');
      styleEl.setAttribute('data-mc-menuhide', '');
      styleEl.textContent = MC_MAP.menuPortal + '{display:none!important}';
      document.head.appendChild(styleEl);
    }
    return function teardown() {
      try { document.removeEventListener('click', onDocClick, true); } catch (e) {}
      try { document.removeEventListener('keydown', onKey, true); } catch (e) {}
      try { if (styleEl) styleEl.remove(); } catch (e) {}
      try { if (wrap) wrap.remove(); } catch (e) {}
    };
  },
```

CSS 追加（McMenus.css 段尾）：`'.mc-anchor{position:relative}'`。
`MC_MENU_DEFS/MC_MENU_WIRING` 先置空表 `var MC_MENU_DEFS = {}; var MC_MENU_WIRING = {};`（Task 5 填）。

- [ ] **Step 2: 刷新验证** — 控制台无报错；eval `typeof McMenus` 为 'object'（作用域内）或刷新后页面正常。
- [ ] **Step 3: `npm test` + Commit** — `feat(mcx-menus): mount 开合管道(单例互斥/外点/ESC/闪烁出场)`

### Task 5: 五处 sidebar 菜单定义与接线（依赖 Task 1 勘定）

**Files:**
- Modify: `client.js`（MC_MENU_DEFS/WIRING 填充 + McFinder 触发钮挂开菜单调用）、`src/conv/overlays.js` + `src/finder.js` 镜像
- Modify: 本 plan 附录 A（接线勘定记录）

**Interfaces:**
- Consumes: Task 4 管道；McFinder 组件内触发钮（`mc-gh-btn` 系，自有 DOM）。
- Produces: 五菜单 id：`sess`（会话行）/`group`（分组头 dots）/`groupNew`（分组头 plus）/`view`（listbar 视图选项）/`add`（listbar 添加）。

- [ ] **Step 1: 定义表填充**（client.js McMenus 段；`on` 态与实际项按附录 A 勘定调整——下方为原型基准版，勘定后以宿主真有动作增删）：

```js
var MC_MENU_DEFS = {
  sess: { items: [
    { id: 'rename', label: '重命名', icon: '#i-px-edit' },
    { id: 'archive', label: '归档', icon: '#i-px-box' },
    { sep: true },
    { id: 'delete', label: '删除会话', icon: '#i-px-trash', danger: true },
  ] },
  group: { items: [
    { id: 'groupRename', label: '重命名工作区', icon: '#i-px-edit' },
    { id: 'groupNew', label: '在 此 新建会话', icon: '#i-px-plus' },
  ] },
  groupNew: { items: [
    { id: 'groupNewSess', label: '新建会话', icon: '#i-px-plus' },
    { id: 'groupNewWs', label: '新建工作区', icon: '#i-folder' },
  ] },
  view: { items: [
    { id: 'viewGroup', label: '按工作区分组', icon: '#i-folder', on: true },
    { id: 'viewSortTime', label: '按时间排序', icon: '#i-px-list' },
  ] },
  add: { items: [
    { id: 'addSess', label: '新建会话', icon: '#i-px-plus' },
    { id: 'addWs', label: '新建工作区', icon: '#i-folder' },
  ] },
};
var MC_MENU_WIRING = {}; // 附录 A 勘定逐项填;勘不通的键不填(渲染自动滤除)
```

- [ ] **Step 2: 接线（按附录 A 实况，三条路径降序）**——每项一个条目，形如：

```js
// 路径1: 官方服务(最稳;sessions 方法面以附录A为准)
MC_MENU_WIRING.archive = function (w) { try { w.ctx.sessions.archive(currentSessId()); } catch (e) {} };
// 路径2: 程序化 click 官方原钮(tclose 先例;附录A给选择器,进 MC_MAP)
// 路径3: 勘不通 → 不写该键(菜单项自动不出现)
```

`currentSessId()` 等会话上下文经 McFinder 数据链传入（WIRING 函数签名统一 `(w)`，`w.ctx` 为插件 ctx；会话/分组 id 在 Task 5 实装时经 `w.setData('sess', id)` 由触发钮 click 时写入——openMenu 调用点随 `data-*` 带上，挂 `wrap.dataset.mcCtx`，WIRING 内读取）。
- [ ] **Step 3: 触发钮接线**——McFinder 五处钮（会话行 dots `src/finder.js:164`、分组头 dots/plus `:192-193`、listbar 视图/添加 `:107-108`）onClick 改为调 `mcMenusOpen(id, evt.currentTarget)`（模块级桥：McFinder 与 McMenus 同作用域，client.js 直引 `McMenus` 内部 openMenu——经模块级 `var MC_MENU_OPEN = null;` 桥接，mount 时赋值，McFinder 调 `if (MC_MENU_OPEN) MC_MENU_OPEN(id, btn)`；镜像同步）。
- [ ] **Step 4: 刷新验证** — 手动开 GUI：点会话行三点 → `.mc-menu` 出现（白底方角 shadow-pop）、再点分组头 dots → 前菜单闪退新菜单出场（单例互斥）；点外/ESC 关；勘不通的项确实不出现。
- [ ] **Step 5: `npm test` + Commit** — `feat(mcx-menus): sidebar 五菜单定义/接线(勘定项)`

### Task 6: verify-menus 门禁 + 失配演练

**Files:**
- Create: `tools/verify-menus.mjs`
- Modify: `package.json` 无需（playwright 已在 devDependencies）

**Interfaces:**
- Consumes: Tasks 2-5 全部。

- [ ] **Step 1: 写门禁脚本**（结构照 verify-flow.mjs：launch → goto → 断言 → 退出码）断言集：
  1. 点会话行 dots → `document.querySelector('.mc-menu')` computed `background rgb(255,255,255 或宿主浅色)/border 1px/box-shadow` 含 shadow-pop 值；`.m-opt` 字号 13px。
  2. 开菜单 A 再开菜单 B → A 已 remove（单例）。
  3. 点「归档」（若附录 A 勘定通了 archive）→ 会话行从侧栏消失（polling 2s）。
  4. ESC → 菜单 remove。
  5. 兼容断言：`MC_MAP.menuPortal` 非空时官方原生菜单节点仍 in DOM（被藏未删）；空则跳过。
  6. 深色一轮 + 点月牙切浅色再一轮（背景/描边反转断言）。
- [ ] **Step 2: 失配演练** — 临时把 MC_MAP.menuPortal 改 `'.nope'` → 刷新 → 官方右键菜单照常（若宿主有）→ **改回**；演练结论记 commit message。
- [ ] **Step 3: 门禁 GREEN + Commit** — `test(mcx-menus): verify 门禁与失配降级演练`（跑门禁属实现期验证，非活体验收，符合 Global Constraints）

### Task 7: kit 菜单分区 + 浅色 QA + 文档收尾 + 终验

**Files:**
- Modify: `client.js`（McKit 追加「菜单」分区）、`src/kit.js` 镜像说明
- Modify: `prototype/component-dev-notes.md`（§8 追加菜单落地差异注记）
- Modify: `README.md`（工具行补 verify-menus）

- [ ] **Step 1: kit 分区**——McKit 渲染函数内 sprite/flow 区后追加 section：静态陈列 `.mc-menu` 全形态（m-group 常规项 / danger 项 / m-sep / on 选中态 / 按钮演示「▶ 弹出菜单(闪烁出场)」走真 openMenu 管道）；DOM 照原型 L2497-2510 直抄换 mc- 前缀，文案演示字面量经 esc。
- [ ] **Step 2: 浅色 QA**——playwright 切浅色截图 `shots/menu-light-*.png`（五个菜单各一）与原型浅色形态并排核对；异常当场修（计入本 commit）。
- [ ] **Step 3: 注记回写**——component-dev-notes §8 追加：宿主菜单管道实况（附录 A 摘要）、自绘兜底 vs 槽路径实采、勘不通被滤除的菜单项清单。
- [ ] **Step 4: 终验** — `npm test` 全绿 + `node tools/verify-menus.mjs` GREEN；向用户演示五菜单 + 失配降级；活体验收按规则由用户发起（多会话）。
- [ ] **Step 5: Commit** — `docs(mcx-menus): kit 分区/浅色 QA/注记收尾`

---

## 附录 A · 探针勘定记录（Task 1 回填）

探针：`tools/probe-menus.mjs`（live DOM @127.0.0.1:3080）+ 部署源直读（map.js 探针先例）；host 版本 0.1.1-rc.1（@deepseek-ai/dsh package.json；GUI 页面 about 同源）。

| 勘察项 | 结果 |
|--------|------|
| 宿主原生右键/dots 菜单 | **有，仅 dots 左键**（无 contextmenu 右键——live 右键 .mc-sess 行 300ms 零新增节点）。原生菜单 = dsh-client-ui-primitives `Menu({portal:true})`：`createPortal(list, document.body)`，list 为 `div[role="menu"]` 定位浮层（fixed 内联 left/top + viewport clamp，primitives lib/index.js L1525-1704）→ portal 选择器勘定 `body > div[role="menu"]`。菜单项 = `button[role="menuitem"]`（selected 勾 IconCheck/danger 类，类名全哈希）。工作区行菜单 items：rename / delete(danger)（workspace lib L459-468）；会话行菜单 items：rename / fork / archive（L700-716）。live DOM 中官方树被 McFinder 遮蔽（priority:-1），无 treeitem——native 菜单仅遮蔽失败时出现 |
| 菜单项动作触发方式 | **无 data-*/aria 动作编码**：Menu 项是受控 React 组件，`onClick → onSelect(entry.id)`（字符串 id：`rename`/`fork`/`archive`/`delete`），由 workspace 层回调分发：session → `onRename(id,title)/onFork(id)/onArchive(id)`（L764-769），workspace → `actions.rename()/actions.delete()`（L505-510）。dots 钮 = `button[aria-label$="的操作"]`（i18n，不可依赖）左键 toggle `menuOpen`。外部无法伪造 onSelect——接线只能走服务面（下行）或遮蔽自绘（Task 4/5 路线） |
| ctx.sessions 方法面 | `sessions` 服务（dsh-client-runtime reflect.provide("sessions")，SessionRuntime）：`open(id)`、`openSubagent(addr)`、`create(opts)`→id、`fork({sessionId,atSeq?,increaseTitle?})`→childId、`scope(id)`、`binding(id)`（binding.session 有 `rename(title)` 异步方法，L7346）、`list`(snapshot store: ids/byId/current/phase)、`clear()`。**无 sessions.archive/delete**——归档在 `workspaces` 服务（WorkspaceRuntime）：`archiveSession(sessionId)`、`create(input)`、`rename(workspaceId,title)`、`delete(workspaceId)`（L9541-9570/L10036）。⚠ 两服务均需 inject 声明（现 inject 列表须加 `'@deepseek-ai/dsh-client-runtime'` 已有；workspaces 走 ctx.get 可选读取） |
| menu 相关 keyed 槽 | **无**。dsh-client-ui-slots 注册表零 menu 槽位；workspace 侧仅 `sidebar.workspaces` / `sidebar.workspaces.directoryFlow` / `conversation.hero.workspace` 三键（lib L2434-2444）。Menu 原语完全内部受控（open/onSelect props），不可槽位注入 → 五菜单 Task 4 走自绘（McMenus 自有 .mc-menu 类零宿主锚），menuPortal/menuHostItem 仅作遮蔽失败时藏原生菜单的兜底样式通道 |

## Self-Review 结论

- **Spec 覆盖**：§1 三层策略（Task 1 探针 + Task 4 兜底隐藏 + 附录A 槽勘定）、§2 原语与五菜单（Task 2/5）、§3 状态机/接线三降序/定位（Task 3/4/5）、§4 动画纪律（Global Constraints + Task 4 flashIn/flashOut）、§5 测试/门禁/失配演练/kit/验收规则（Task 3/6/7）。无缺口。
- **占位符**：Task 5 接线与附录 A 为显式探针依赖（spec §0 裁定 4 与 Self-Review 已声明该模式）；定义表给了原型基准版可编译运行，勘定只增删。无 TBD。
- **类型一致**：`mcMenuItems(def, wiring)/mcMenuAlign(anchorRect, viewportW, menuW)/mcMenuState(state, ev)`、`MC_MENU_DEFS/MC_MENU_WIRING`、菜单 id 五枚（sess/group/groupNew/view/add）各任务一致；`MC_MENU_OPEN` 桥与 `mc-anchor` 类名 Task 4/5 对齐。
- **顺序依赖**：Task 1 先行（勘定回填后续消费）；2→3→4 顺序链；5 依赖 1+4；6/7 收尾。
