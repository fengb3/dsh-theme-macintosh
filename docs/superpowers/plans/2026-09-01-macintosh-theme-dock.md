# Macintosh 主题 · 输入坞（dock 批：自绘 composer + 家具 + ctx 圆环）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付 B 路线全自绘输入坞——镜像驱动桥（官方为唯一真相源）上的 composer 卡壳/三态 + todo/goal/queue 家具 + ctx 圆环，勘不通的子件静默不渲染，桥断整体退场恢复官方。

**Architecture:** client.js 新增 `McDock` 模块（`{css, mount}`）入 mods/order（McSysCard 后、McMenus 前）。自绘坞（`.dock` 家具区 + `.composer` 卡）挂官方 composer 席位容器；官方卡经 `html[data-mc-dock-on]` 属性门控 CSS 藏匿（卸载即恢复）。四通道镜像桥：输入经 native setter + input event 镜像进官方受控 textarea、发送/中断程序化 click 官方原钮、忙闲/禁用经 MutationObserver 读官方属性。子件按探针勘定分级渲染（勘不通不渲染）。

**Tech Stack:** 纯 JavaScript（loader 格式 client.js，禁 import/TS/JSX）、原生 textarea（IME 天然成立）、MutationObserver、node --test、playwright（门禁）。

**Spec:** `docs/superpowers/specs/2026-09-01-macintosh-theme-dock-design.md`（同行；原型基准 `prototype/macintosh-workspace.html` CSS L554-703、dock DOM L1243-1320、todo/goal 帧 L1898-1998；行为规范 `prototype/component-dev-notes.md` §9）

## Global Constraints

- plain JavaScript；client.js 为函数体（loader 格式），禁 `import/require 直调/TS/JSX`（CJS shim 除外，照 overlays 先例）。
- **runner 陷阱**（一期教训 5）：`Event/HTMLTextAreaElement/MutationObserver` 等原生构造器一律 `window.*` 获取；延时只走 `CLOCK.next`（禁裸 setTimeout，audit 查获）。
- 动画纪律：无 `:hover`、无 `transition`（压平 `transition:none` 例外）、按压只 `:active`；出场 flashIn 三拍、状态切换 accToggle；`prefers-reduced-motion:reduce` 压 `.01ms` + JS 跳拍；动态文本一律 `esc()`。
- 官方 selector 只允许出现在 client.js 的 `MC_MAP` dock 段（audit 管制，M5 白名单反查扩容 dock 段）；失配 = 官方 composer 照常，自绘坞退场，**绝不双输入框并存**。
- **Go/No-Go（spec 裁定 3）**：Task 1 探针若勘定「native setter 镜像 + 官方 Send 程序化 click」不可行 → 批次整体回退方案 A（MC_MAP 样式覆写收官），本 plan 作废并修订 spec——回退裁决须写入 commit message 并报告用户。
- dev 循环 = 改 client.js → 浏览器刷新即生效；改 package.json/index.js/cordis.patch.yml 才需重启（`~/.dsh/restart-web.ps1`，须用户发起）。刷新不生效（宿主进程缓存）时记入任务报告，活体门禁留待重启窗口（verify-menus 同款裁定）。
- 每任务一 commit；`npm test`（= `node --test "test/*.test.mjs" && node tools/audit.mjs`）全绿后才 commit。
- 值源：颜色/几何/字号一律 `--mc-*`/`--font-*` token 引用（浅色自动跟随）；文本经 `esc()`。
- 验收流程规则（用户多轮裁定）：实现完**不自动跑活体验证**；活体须用户发起且覆盖多会话。**探针与门禁是实现期动作，不在此列。**
- 镜像桥纪律：官方 textarea/Send/Stop 的真实状态是唯一真相源；自绘钮只是视觉替身——禁止绕过官方件直接调服务面发消息（发送管道唯一通道 = 官方原钮）。

## File Structure

```
client.js               MC_MAP dock 段 + McDock 模块 + mods/order
src/conv/dock.js        设计参照镜像（含纯函数 + CJS shim）
src/assemble.input.js   ORDER/MODULE_MAP 加 McDock
tools/make-persistent-client.mjs  模板 mods/order + marks 清单加 McDock
test/dock.test.mjs      状态机/分段/弧值/镜像纯函数测试（新建）
tools/probe-dock.mjs    宿主输入坞探针（Task 1 建，勘定后保留复勘用）
tools/verify-dock.mjs   活体门禁（新建，含拔桥演练）
tools/audit.mjs         dock 段白名单反查扩容
prototype/component-dev-notes.md  §8.8 追加输入坞落地差异注记（收尾）
README.md               工具行补 verify-dock（收尾）
```

---

### Task 1: 宿主输入坞探针 + MC_MAP dock 段 + go/no-go 裁定

**Files:**
- Create: `tools/probe-dock.mjs`
- Modify: `client.js`（MC_MAP 闭合 `}` 前追加 dock 段）+ `src/chrome/map.js` 镜像
- Modify: 本 plan 附录 A（探针结论回填处）+ spec 附录 A（新建）

**Interfaces:**
- Produces: MC_MAP dock 段六键（Task 4/5/6 消费）：`composerSeat`（composer 席位容器）、`composerHide`（官方卡壳=藏匿锚）、`composerField`（官方 textarea=镜像目标）、`composerSend`（官方发送钮）、`composerStop`（官方停止钮）、`composerPhase`（官方忙闲属性锚）。**勘不出的键保留 `''` 并注明**，消费方对空串跳过（降级）。
- 裁定产出：go/no-go ①结论（native setter 镜像 + Send 可 click）写入附录 A。

- [ ] **Step 1: 写探针脚本**（DOM 结构勘定 + 镜像冒烟；部署源勘定 Step 3 单独跑）：

```js
// tools/probe-dock.mjs — 宿主输入坞探针(2026-09;勘定 MC_MAP dock 段与镜像桥可行性)
// 用法: node tools/probe-dock.mjs   (宿主须运行于 127.0.0.1:3080)
// 勘察目标:
//  A. 官方 composer 区结构: [data-composer-card] 后代清单(tag/class/aria/placeholder/data-*)
//  B. 官方 textarea: 属性面(disabled/placeholder/aria-label) + native setter 镜像冒烟
//     (镜像后官方 Send 钮 disabled 态是否翻转 = React state 真被驱动的证据)
//  C. Send/Stop 钮: aria-label/文案/disabled/hidden;busy 面貌(data-phase/role=status)
//  D. composer 席位: [data-composer-seat] 及官方卡的 parentElement 链(挂载入口)
import { chromium } from 'playwright';
const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto('http://127.0.0.1:3080');
await pg.waitForTimeout(4000); // 主题注入 + 会话恢复

const cardDump = await pg.evaluate(() => {
  const card = document.querySelector('[data-composer-card]');
  if (!card) return { NO_CARD: true };
  const brief = (n) => n.tagName
    + (n.className && typeof n.className === 'string' ? '.' + n.className.slice(0, 40) : '')
    + (n.getAttribute && n.getAttribute('aria-label') ? `[aria-label=${n.getAttribute('aria-label')}]` : '')
    + (n.getAttribute && n.getAttribute('placeholder') ? `[placeholder=${n.getAttribute('placeholder')}]` : '')
    + (n.disabled ? '[disabled]' : '') + (n.hidden ? '[hidden]' : '');
  const kids = [...card.querySelectorAll('textarea, button, [contenteditable], input')].map(brief);
  const seat = card.closest('[data-composer-seat]');
  const chain = [];
  let p = card.parentElement;
  for (let i = 0; p && i < 5; i++) { chain.push(p.tagName + '.' + String(p.className).slice(0, 40) + (p.hasAttribute('data-composer-seat') ? '[data-composer-seat]' : '')); p = p.parentElement; }
  const phaseEl = document.querySelector('div[data-phase]');
  const status = document.querySelector('[role="status"]');
  return {
    cardAttrs: [...card.attributes].map((a) => a.name + '=' + a.value).join(' '),
    interactive: kids,
    seatPresent: !!seat, seatAttrs: seat ? [...seat.attributes].map((a) => a.name).join(',') : '',
    parentChain: chain,
    phase: phaseEl ? phaseEl.getAttribute('data-phase') : 'NO_PHASE_EL',
    statusText: status ? (status.textContent || '').slice(0, 80) : 'NO_STATUS',
    stopVisible: !!([...card.querySelectorAll('button')].find((x) => /stop|停止/i.test((x.textContent || '') + (x.getAttribute('aria-label') || '')))),
  };
});
console.log('COMPOSER_DUMP:\n' + JSON.stringify(cardDump, null, 1));

// B: native setter 镜像冒烟(镜像后立刻读回;再探官方 Send disabled 是否翻转)
const mirror = await pg.evaluate(() => {
  const ta = document.querySelector('[data-composer-card] textarea') || document.querySelector('[data-composer-card] [contenteditable="true"]');
  if (!ta) return { NO_FIELD: true };
  const isTa = ta.tagName === 'TEXTAREA';
  const proto = isTa ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const desc = Object.getOwnPropertyDescriptor(proto, 'value');
  const before = ta.value;
  const sendBtn = [...document.querySelectorAll('[data-composer-card] button')]
    .find((x) => /send|发送/i.test((x.textContent || '') + (x.getAttribute('aria-label') || '')));
  const disBefore = sendBtn ? sendBtn.disabled : null;
  let setError = null;
  try { desc.set.call(ta, 'PROBE_MIRROR_试'); ta.dispatchEvent(new window.Event('input', { bubbles: true })); }
  catch (e) { setError = String(e); }
  const after = ta.value;
  const disAfter = sendBtn ? sendBtn.disabled : null;
  // 还原草稿(清空镜像,不留痕)
  try { desc.set.call(ta, ''); ta.dispatchEvent(new window.Event('input', { bubbles: true })); } catch (e) {}
  return { isTa, hasNativeDesc: !!desc, before: before.slice(0, 20), after: after.slice(0, 20),
    mirrored: after === 'PROBE_MIRROR_试', sendBtnFound: !!sendBtn,
    sendDisabledBefore: disBefore, sendDisabledAfter: disAfter, setError };
});
console.log('MIRROR_SMOKE:\n' + JSON.stringify(mirror, null, 1));
console.log('PROBE_DONE');
await b.close();
```

- [ ] **Step 2: 跑探针** — `node tools/probe-dock.mjs`，输出全文贴回本 plan 附录 A。
- [ ] **Step 3: 部署源勘定**（槽名/服务名；照 menus 批附录 A「部署源直读」先例——宿主 bundle 内正则勘定 `conversation.input.dock`/`composer.dock`/`composer.*` 槽与 `sessions`/`workspaces` 服务面上与输入相关的成员）。自含式 chunk 扫描（不依赖本地部署路径）：

```js
// 追加进 probe-dock.mjs 末尾(await b.close() 之前)——抓页面 module 图谱逐 chunk 正则
const hits = await pg.evaluate(async () => {
  const seen = new Set(); const out = [];
  const re = /(conversation\.input\.dock|composer\.dock|conversation\.composer[\w.]*|input\.model|input\.plan|archiveSession|startSession)/g;
  async function scan(u) {
    if (seen.has(u) || seen.size > 80) return; seen.add(u);
    let t; try { t = await (await fetch(u)).text(); } catch (e) { return; }
    let m; while ((m = re.exec(t))) out.push(u.split('/').pop() + ' :: ' + m[1] + ' @line~' + t.slice(0, m.index).split('\n').length);
    for (const imp of t.matchAll(/(?:from|import)\s*"(\.\/[^"]+\.js)"/g)) await scan(new URL(imp[1], u).href);
  }
  for (const s of [...document.querySelectorAll('script[src]')].map((x) => x.src)) await scan(s);
  return out;
});
console.log('DEPLOY_SOURCE_HITS:\n' + (hits.join('\n') || '(无槽名/服务名命中)'));
```

  勘定结论（槽存在与否 → Task 4 走槽渲染还是席位插入）记附录 A。
- [ ] **Step 4: 回填 MC_MAP dock 段**（client.js MC_MAP 闭合 `};`（现 L587）前；src/chrome/map.js 镜像同步；探针无发现的键保留占位 `''` 并注明，消费方对空串跳过）：

```js
  // —— dock 段(输入坞;探针 2026-09-XX,host 0.1.1-rc.X——dock 附录A)——
  composerSeat: '',       // composer 席位容器(勘定回填;空=回退官方卡 parentElement)
  composerHide: '[data-composer-card]', // 官方卡壳=藏匿锚(一期键复核;属性门控 html[data-mc-dock-on] 藏未删)
  composerField: '',      // 官方 textarea(镜像目标;空=批次回退方案A)
  composerSend: '',       // 官方发送钮(程序化 click;空=该钮不接桥)
  composerStop: '',       // 官方停止钮(busy 态;空=Stop 不接桥,busy 断言降级 INFO)
  composerPhase: '',      // 官方忙闲属性锚(如 div[data-phase];空=降级读 Send/Stop disabled)
```

- [ ] **Step 5: go/no-go 裁定** — 附录 A 写明：① `mirrored:true` 且 `sendDisabledBefore/After` 出现翻转（或 Send 本就可点）= **GO**；`mirrored:false` 或无 native value 描述符 = **NO-GO → 批次回退方案 A**（报告用户 + 修订 spec + 本 plan 作废）。②③ 勘定结论一并回填。
- [ ] **Step 6: audit 前缀键登记（仅当有前缀形态键）** — 若勘定键值含前缀形态（如 `composerPhase: 'div[data-phase]'` 的取值形态前缀），照 dataState 先例在 `tools/audit.mjs` L164 附近追加 `tokens.add('[data-phase=');` 一类前缀行；纯 bracket 键（`[data-composer-…]`）由 map 值自动提取，无需登记。无前缀键则本步跳过。
- [ ] **Step 7: `npm test` 全绿**（MC_MAP 加键零行为变化，应直接绿）。
- [ ] **Step 8: Commit** — `feat(mc-dock): 输入坞探针与 MC_MAP dock 段(go/no-go 裁定回填)`

### Task 2: dock 原语 CSS + McDock 骨架 + 装配链

**Files:**
- Create: `src/conv/dock.js`
- Modify: `client.js`（McSysCard 段后、`// src/conv/overlays.js` 段标前插 McDock 段；mods 表 + order 数组）、`src/assemble.input.js`、`tools/make-persistent-client.mjs`（模板 mods/order + marks 清单）、`tools/audit.mjs`（dock 段白名单反查扩容）

**Interfaces:**
- Produces: `McDock = { css, mount(ctx) }`（mount Task 4 实装，本任务返回 `function(){}` 空 teardown）；`MC_DOCK_CSS` 全部规则 scoped 在 `[data-mc-dock]` 根下（Task 5/6 消费；kit Task 8 复用同根）；CJS shim 出口 `McDock`。

- [ ] **Step 1: src/conv/dock.js 骨架 + CSS 移植**（原型 L554-703 直抄，token 换 `--mc-*`，全部规则挂 `[data-mc-dock]` 根）：

```js
// src/conv/dock.js —— 输入坞体系(spec 2026-09-01 dock 批,B 路线全自绘+镜像驱动桥)
// 协议 { css, mount(ctx) }。自绘坞挂官方 composer 席位;官方卡经 html[data-mc-dock-on] 属性门控藏匿。
// 原语(原型 §6 L554-703 直抄;token 换 --mc-*;全部 scoped 到 [data-mc-dock])
const MC_DOCK_CSS = [
  // (藏匿门控规则 Task 4 追加:html[data-mc-dock-on] + MC_MAP.composerHide → display:none!important;骨架期零行为)
  '[data-mc-dock]{flex:none;display:flex;flex-direction:column;gap:8px;padding:10px 12px;background:var(--mc-rail-2);',
  ' border-top:1px solid var(--mc-border)}',
  '[data-mc-dock] .queue-row{display:flex;align-items:center;gap:8px;padding:5px 9px;',
  ' background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:var(--mc-r-card);',
  ' font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}',
  '[data-mc-dock] .queue-row svg{width:13px;height:13px;flex:none;color:var(--mc-spark)}',
  '[data-mc-dock] .todo-bar{flex:1;height:8px;background:var(--mc-surface-3);',
  ' border:1px solid var(--mc-border);padding:1px;display:flex;gap:1px}',
  '[data-mc-dock] .todo-bar i{flex:1;background:var(--mc-surface-2)}',
  '[data-mc-dock] .todo-bar.mc-ghost{background:transparent;border-color:transparent}',
  '[data-mc-dock] .todo-bar i.done{background:var(--mc-success)}',
  '[data-mc-dock] .todo-bar i.now{background:var(--mc-spark)}',
  '[data-mc-dock] .todo-meta{font:500 10px/1.6 var(--font-mono);color:var(--mc-faint);white-space:nowrap}',
  '[data-mc-dock] .todo-acc{background:var(--mc-surface);border:1px solid var(--mc-border);',
  ' border-radius:var(--mc-r-card);box-shadow:var(--mc-shadow-panel);overflow:hidden;position:relative}',
  '[data-mc-dock] .todo-acc-head{display:flex;align-items:center;gap:8px;width:100%;',
  ' padding:6px 9px;background:none;border:none;cursor:pointer;text-align:left}',
  '[data-mc-dock] .todo-acc-head .ta-title{flex:none;font:600 12px/1.4 var(--font-display);',
  ' letter-spacing:.02em;color:var(--mc-fg)}',
  '[data-mc-dock] .todo-acc-head svg.tri{width:12px;height:12px;flex:none;color:var(--mc-muted)}',
  '[data-mc-dock] .todo-acc .todo-bar{height:6px;min-width:0}',
  '[data-mc-dock] .todo-acc .todo-meta{flex:none}',
  '[data-mc-dock] .todo-body{overflow:hidden;height:auto}',
  '[data-mc-dock] .todo-acc:not(.open) .todo-body{height:0}',
  '[data-mc-dock] .todo-acc.open .todo-body{padding:2px 0 6px;border-top:1px solid var(--mc-border-soft)}',
  '[data-mc-dock] .t-item{display:flex;align-items:flex-start;gap:7px;padding:3px 9px;',
  ' font:400 12px/1.6 var(--font-ui);color:var(--mc-fg)}',
  '[data-mc-dock] .t-item .t-box{width:12px;height:12px;flex:none;margin-top:2px;',
  ' background:var(--mc-surface-2);border:1px solid var(--mc-border);border-radius:var(--mc-r-tag);',
  ' display:grid;place-items:center;color:var(--mc-surface)}',
  '[data-mc-dock] .t-item .t-box svg{width:9px;height:8px;display:none}',
  '[data-mc-dock] .t-item.done .t-box{background:var(--mc-fg);border-color:var(--mc-fg)}',
  '[data-mc-dock] .t-item.done .t-box svg{display:block}',
  '[data-mc-dock] .t-item.done .t-txt{color:var(--mc-muted);text-decoration:line-through}',
  '[data-mc-dock] .t-item.now .t-box{border-color:var(--mc-spark)}',
  '[data-mc-dock] .t-item.now .t-box::after{content:\'\';width:6px;height:6px;background:var(--mc-spark);',
  ' animation:mc-pulse 2.6s steps(1,end) infinite}',
  '[data-mc-dock] .goal-card{display:flex;align-items:center;gap:8px;padding:6px 9px;',
  ' background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:var(--mc-r-card);',
  ' box-shadow:var(--mc-shadow-panel);font:400 12px/1.6 var(--font-ui)}',
  '[data-mc-dock] .goal-card svg{width:13px;height:13px;flex:none;color:var(--mc-accent)}',
  '[data-mc-dock] .goal-card .gc-title{flex:none;font:600 12px/1.4 var(--font-display);',
  ' letter-spacing:.02em;color:var(--mc-fg)}',
  '[data-mc-dock] .goal-card .gc-obj{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;',
  ' white-space:nowrap;color:var(--mc-muted)}',
  '[data-mc-dock] .goal-card .gc-acts{flex:none;display:flex;gap:6px}',
  '[data-mc-dock] .goal-card[data-phase="blocked"]{border-color:var(--mc-spark)}',
  '[data-mc-dock] .composer{display:flex;flex-direction:column;gap:8px;background:var(--mc-surface);',
  ' border:1px solid var(--mc-border);border-radius:var(--mc-r-card);',
  ' box-shadow:var(--mc-shadow-panel);padding:8px}',
  '[data-mc-dock] .composer .mc-field{height:auto;min-height:44px;padding:6px 8px}',
  '[data-mc-dock] .composer.busy .mc-field{background:color-mix(in oklab,var(--mc-fg) 4%,var(--mc-surface))}',
  '[data-mc-dock] .composer textarea{flex:1;background:transparent;border:none;resize:none;outline:none;',
  ' font:inherit;color:inherit;min-height:32px}',
  '[data-mc-dock] .composer-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
  '[data-mc-dock] .cb-btn{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 9px;',
  ' background:var(--mc-surface-2);border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);',
  ' box-shadow:inset 0 0 0 1px var(--mc-surface),inset 0 0 0 2px var(--mc-border);',
  ' font:500 11px/1 var(--font-ui);color:var(--mc-muted);cursor:pointer;white-space:nowrap}',
  '[data-mc-dock] .cb-btn svg{width:12px;height:12px;flex:none}',
  '[data-mc-dock] .cb-btn.model{font-family:var(--font-mono);font-size:11px}',
  '[data-mc-dock] .cb-anchor{position:relative;display:inline-flex;flex:none}',
  '[data-mc-dock] .cb-right{margin-left:auto;display:flex;align-items:center;gap:8px;flex:none}',
  '[data-mc-dock] .ctx-ring{position:relative;width:22px;height:22px;flex:none;cursor:pointer}',
  '[data-mc-dock] .ctx-ring svg{width:22px;height:22px}',
  '[data-mc-dock] .ctx-ring .cr-track{stroke:var(--mc-surface-3)}',
  '[data-mc-dock] .ctx-ring .cr-arc{stroke:var(--mc-accent)}',
  '[data-mc-dock] .ctx-ring[data-hot] .cr-arc{stroke:var(--mc-danger)}',
  '[data-mc-dock] .ctx-pop{display:none;position:absolute;bottom:calc(100% + 6px);right:0;z-index:80;',
  ' width:236px;flex-direction:column;gap:6px;padding:9px 11px;background:var(--mc-surface);',
  ' border:1px solid var(--mc-border);border-radius:var(--mc-r-card);box-shadow:var(--mc-shadow-pop);',
  ' font:400 11.5px/1.7 var(--font-ui);color:var(--mc-muted);font-family:var(--font-sb)}',
  '[data-mc-dock] .ctx-pop.open{display:flex}',
  '[data-mc-dock] .ctx-pop b{color:var(--mc-fg);font-family:var(--font-sb);font-weight:500}',
  '[data-mc-dock] .ctx-line{display:flex;align-items:center;gap:7px}',
  '[data-mc-dock] .ctx-line i{width:8px;height:8px;flex:none;',
  ' clip-path:polygon(33% 0,67% 0,100% 33%,100% 67%,67% 100%,33% 100%,0 67%,0 33%)}',
  '[data-mc-dock] .ctx-line .cl-bar{flex:1;height:5px;background:var(--mc-surface-3);',
  ' border:1px solid var(--mc-border-soft);border-radius:0}',
  '[data-mc-dock] .ctx-line .cl-bar i{display:block;height:100%;border-radius:0;clip-path:none}',
].join('\n');
var McDock = {
  css: MC_DOCK_CSS,
  mount: function (ctx) {
    // Task 4 实装:挂载入口 + 镜像驱动桥 + 降级
    return function () {};
  },
};
if (typeof module !== 'undefined') module.exports = { McDock: McDock };
```

  **藏匿规则说明**：`'html[data-mc-dock-on] ' + MC_MAP.composerHide + '{display:none!important}'` 一行**本任务不加入**（骨架期零行为，官方卡照常）；Task 4 把该行追加进 MC_DOCK_CSS 尾部（client.js 与镜像同改），挂载成功置 `html[data-mc-dock-on]` 后生效，卸载/降级摘属性即恢复。

- [ ] **Step 2: client.js 镜像段 + mods/order** — client.js 内 McSysCard 段结束与 `// src/conv/overlays.js` 段标之间插入同源段（含文件头注释 `// src/conv/dock.js —— …`，audit 靠它定位段边界）；mods 表（现 L3023-3037）`McMenus: McMenus,` 前加 `McDock: McDock,`；order 数组（现 L3038）`"McMenus"` 前插 `"McDock"`。
- [ ] **Step 3: 装配链三处** — `src/assemble.input.js` ORDER 数组 `'McMenus'` 前插 `'McDock'`、MODULE_MAP 加 `McDock: 'src/conv/dock.js',`；`tools/make-persistent-client.mjs` 模板 mods 表（现 L62 附近）与 order 数组（现 L65）同步，**marks 清单（现 L122）追加 `'McDock: McDock'`**（5fb9caf 教训：漏 marks 不校验 → order 漏插模块静默不执行）；重跑 `node tools/assemble.mjs && node tools/make-persistent-client.mjs`。
- [ ] **Step 4: audit dock 段白名单反查**（照 overlays M5 先例）——`tools/audit.mjs`：

```js
// L77-81 区域追加(dock 段照 overlays 段同款机制):
const distDock = distRaw != null ? stripComments(segmentRaw(distRaw, '// src/conv/dock.js', '// src/conv/overlays.js') || '') : null;
const clientDock = clientRaw != null ? stripComments(segmentRaw(clientRaw, '// src/conv/dock.js', '// src/conv/overlays.js') || '') : null;
const srcDockFile = join(ROOT, 'src', 'conv', 'dock.js');
const srcDockText = srcText.get(srcDockFile) || null;
const DOCK_WHITELIST = new Set(['composerCard', 'composerSeat', 'composerHide', 'composerField', 'composerSend', 'composerStop', 'composerPhase']);
```

  selector 泄漏检查（L169）skip 名单 `src/conv/overlays.js` 后追加 `|| rel(f) === 'src/conv/dock.js'`；白名单反查循环（L173-180）追加第二组：

```js
  // dock 段白名单反查(同 M5):只许 DOCK_WHITELIST 六键 + composerCard 出现在 dock 段
  for (const [name, seg] of [['src/conv/dock.js', srcDockText], ['dist/client-body.js', distDock], ['client.js', clientDock]]) {
    if (!seg) continue;
    for (const tok of tokens) {
      if (DOCK_WHITELIST.has(tok)) continue;
      if (seg.includes(tok)) bad.push(`${name} dock 段含未白名单宿主选择器片段 ${tok}`);
    }
  }
```

- [ ] **Step 5: 刷新验证** — 打开 GUI 刷新：eval `!!document.querySelector('style')` 的注入含 `[data-mc-dock]`（`[...document.querySelectorAll('style')].some(s=>s.textContent.includes('[data-mc-dock]'))` 为 true）；页面无报错；composer 区无变化（骨架零行为）。
- [ ] **Step 6: `npm test` + Commit** — `feat(mc-dock): dock 原语 CSS 与 McDock 骨架(装配链+audit 反查)`

### Task 3: dock 纯函数（TDD）：三态状态机 + todo 分段 + ctx 弧值 + 镜像

**Files:**
- Create: `test/dock.test.mjs`
- Modify: `src/conv/dock.js` + client.js 镜像段（纯函数追加）、CJS shim 出口扩容

**Interfaces:**
- Produces（Task 4/5/6 消费，纯数据进纯数据出；Node 侧 shim 导出供测试）：
  - `mcDockState(state, ev)` → `{ mode: 'busy'|'ready'|'idle', has: bool }`；ev ∈ `{t:'busy'}|{t:'idle'}|{t:'input',has}`；busy 最高优先（原型 §9.2：busy→Stop 可点；否则 has→Send 激活；空→disabled）
  - `mcTodoSegments(todos)` → `('done'|'now'|'todo')[]`（首个未完成 = now）
  - `mcTodoMeta(todos)` → `'2/5'` 计数字符串
  - `mcCtxArc(pct)` → `{ dash: '39.6 53.4', hot: bool }`（周长 53.4、>80% hot）
  - `mcMirrorValue(ta, text)` → bool（浏览器侧；Node 测试用假 ta 桩测 try/catch 路径）

- [ ] **Step 1: 写失败测试**：

```js
// test/dock.test.mjs
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { loadSrc } from './load-src.mjs';
const { mcDockState, mcTodoSegments, mcTodoMeta, mcCtxArc, mcMirrorValue } = loadSrc('src/conv/dock.js');

test('mcDockState: busy 最高优先;idle 按 has 分 ready/idle', () => {
  assert.deepEqual(mcDockState(null, { t: 'busy' }), { mode: 'busy', has: false });
  assert.deepEqual(mcDockState({ mode: 'busy', has: false }, { t: 'input', has: true }),
    { mode: 'busy', has: true }); // busy 中打字不改模式(仍 Stop)
  assert.deepEqual(mcDockState({ mode: 'busy', has: true }, { t: 'idle' }), { mode: 'idle', has: true });
  assert.deepEqual(mcDockState({ mode: 'idle', has: true }, { t: 'input', has: false }),
    { mode: 'idle', has: false });
  assert.deepEqual(mcDockState({ mode: 'idle', has: false }, { t: 'input', has: true }),
    { mode: 'ready', has: true });
});

test('mcDockState: 未知事件无害返回', () => {
  const s = { mode: 'ready', has: true };
  assert.equal(mcDockState(s, { t: 'nope' }), s);
  assert.equal(mcDockState(s, null), s);
});

test('mcTodoSegments: 首个未完成=now;空表安全', () => {
  const todos = [{ done: true }, { done: true }, { done: false }, { done: false }];
  assert.deepEqual(mcTodoSegments(todos), ['done', 'done', 'now', 'todo']);
  assert.deepEqual(mcTodoSegments([]), []);
  assert.deepEqual(mcTodoSegments(null), []);
  assert.deepEqual(mcTodoSegments([{ done: false }]), ['now']);
  assert.deepEqual(mcTodoSegments([{ done: true }, { done: true }]), ['done', 'done']); // 无 now 合法(全完成)
});

test('mcTodoMeta: done/total 计数', () => {
  assert.equal(mcTodoMeta([{ done: true }, { done: true }, { done: false }]), '2/3');
  assert.equal(mcTodoMeta(null), '0/0');
});

test('mcCtxArc: 周长 53.4 比例 + >80% hot;越界钳制', () => {
  assert.deepEqual(mcCtxArc(74), { dash: '39.5 53.4', hot: false });
  assert.deepEqual(mcCtxArc(100), { dash: '53.4 53.4', hot: true });
  assert.deepEqual(mcCtxArc(81), { dash: '43.3 53.4', hot: true });
  assert.deepEqual(mcCtxArc(-5), { dash: '0.0 53.4', hot: false });
  assert.deepEqual(mcCtxArc('x'), { dash: '0.0 53.4', hot: false });
});

test('mcMirrorValue: 正常桩镜像 true;异常桩 false(降级路径)', () => {
  const events = [];
  const okTa = { dispatchEvent: (e) => events.push(e.type) };
  assert.equal(mcMirrorValue(okTa, 'hi'), true);
  assert.deepEqual(events, ['input']);
  assert.equal(mcMirrorValue(null, 'hi'), false);
  assert.equal(mcMirrorValue({ dispatchEvent() { throw new Error('boom'); } }, 'hi'), false);
});
```

- [ ] **Step 2: 跑测试确认失败** — `node --test test/dock.test.mjs` → FAIL（无 export）。
- [ ] **Step 3: 实现**（src/conv/dock.js 追加；client.js 镜像同段；shim 出口扩五函数）：

```js
// —— 纯函数(Task 3)——
function mcDockState(state, ev) {
  var s = state || { mode: 'idle', has: false };
  if (!ev) return s;
  if (ev.t === 'busy') return { mode: 'busy', has: s.has };
  if (ev.t === 'idle') return { mode: 'idle', has: s.has };
  if (ev.t === 'input') return { mode: s.mode === 'busy' ? 'busy' : (ev.has ? 'ready' : 'idle'), has: !!ev.has };
  return s; // 未知事件无害返回
}
function mcTodoSegments(todos) {
  var list = Array.isArray(todos) ? todos : [];
  var nowSet = false;
  return list.map(function (t) {
    if (t && t.done) return 'done';
    if (!nowSet) { nowSet = true; return 'now'; }
    return 'todo';
  });
}
function mcTodoMeta(todos) {
  var list = Array.isArray(todos) ? todos : [];
  var done = 0;
  for (var i = 0; i < list.length; i++) if (list[i] && list[i].done) done++;
  return done + '/' + list.length;
}
function mcCtxArc(pct) {
  var C = 53.4; var p = Math.max(0, Math.min(100, Number(pct) || 0));
  return { dash: (p / 100 * C).toFixed(1) + ' ' + C.toFixed(1), hot: p > 80 };
}
// React 受控 textarea 镜像(native setter + input event;spec §3 桥通道 1)
// Node 桩(无原型描述符)走 desc 缺省 false? 否——桩需镜像语义:true 路径不依赖宿主原型:
function mcMirrorValue(ta, text) {
  if (!ta) return false;
  var desc = (typeof window !== 'undefined' && window.HTMLTextAreaElement)
    ? Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value') : { set: function (v) { ta.value = v; } };
  if (!desc || !desc.set) return false;
  try {
    desc.set.call(ta, text);
    ta.dispatchEvent(new (typeof window !== 'undefined' ? window.Event : function (t) { return { type: t }; })('input', { bubbles: true }));
    return true;
  } catch (e) { return false; }
}
```

  注意：`mcMirrorValue` 浏览器侧用 `window.HTMLTextAreaElement.prototype` 描述符（React 18 受控组件标准驱动法）；Node 桩无 window → 走直接赋值桩路径，保证测试覆盖 try/catch 与事件派发。`window.Event` 防 runner 陷阱（Global Constraints）。
- [ ] **Step 4: 跑测试通过** — `npm test` 全绿（既有测试 + 新 6 条）。
- [ ] **Step 5: Commit** — `feat(mc-dock): dock 纯函数(三态/分段/弧值/镜像)`

### Task 4: McDock.mount 实装：挂载入口 + 镜像驱动桥 + 桥断降级

**Files:**
- Modify: `client.js`（McDock.mount 替换占位；MC_DOCK_CSS 尾部追加藏匿规则）、`src/conv/dock.js` 镜像

**Interfaces:**
- Consumes: Task 1 `MC_MAP` dock 六键；Task 3 五纯函数；库 `flashIn/flashOut`、`CLOCK`、`esc`。
- Produces: 全局桥 `MC_DOCK_API = null`（mount 时赋值 `{ send, stop, setBusy, setText, state }`，teardown 置空——Task 5/6/kit 消费）；DOM 协议：`[data-mc-dock]` 根（内含家具区 `[data-mc-dock-furn]` + composer 卡 `[data-mc-dock-cmp]`，后者 Task 5 填充）；`html[data-mc-dock-on]` 藏匿门控属性。
- **挂载入口双通道（Task 1 附录 A 裁定）**：槽真实存在 → 槽渲染（McSysCard priority:-1 先例）；无槽（默认）→ `composerSeat` 容器（空串回退官方卡 parentElement）appendChild + MutationObserver 守护。

- [ ] **Step 1: mount 实现**（替换骨架占位；client.js 与镜像同源）：

```js
  mount: function (ctx) {
    var state = { mode: 'idle', has: false };
    var root = null, furn = null, cmp = null;
    var mo = null, dead = false;
    var off = { card: null, field: null, send: null, stop: null, phaseEl: null, phaseVal: '' };
    var MC_DOCK_API = null; // 模块级桥(Task 5/6/kit 消费)
    function q(sel) { try { return sel ? document.querySelector(sel) : null; } catch (e) { return null; } }
    function findOfficial() {
      off.card = q(MC_MAP.composerHide);
      off.field = q(MC_MAP.composerField);
      off.send = q(MC_MAP.composerSend);
      off.stop = q(MC_MAP.composerStop);
      off.phaseEl = q(MC_MAP.composerPhase);
      return !!(off.card && off.field);
    }
    function bridgeFail() { // 桥断降级(spec §1):自绘坞退场 + 摘门控属性恢复官方;绝不双输入框
      if (dead) return; dead = true;
      try { if (MC_DOCK_API === api) MC_DOCK_API = null; } catch (e) {}
      try { document.documentElement.removeAttribute('data-mc-dock-on'); } catch (e) {}
      try { if (mo) { mo.disconnect(); mo = null; } } catch (e) {}
      try { if (root) flashOut(root, function () { try { root.remove(); } catch (e) {} }); } catch (e) {}
      root = null;
    }
    function mountDock() {
      if (!findOfficial()) return false;
      var seat = q(MC_MAP.composerSeat) || off.card.parentElement;
      if (!seat) return false;
      root = document.createElement('div');
      root.setAttribute('data-mc-dock', '');
      root.className = 'dock';
      furn = document.createElement('div'); // Task 6 家具区(本任务先空置)
      furn.setAttribute('data-mc-dock-furn', '');
      cmp = document.createElement('div');  // Task 5 composer 卡(本任务先空置)
      cmp.setAttribute('data-mc-dock-cmp', '');
      root.appendChild(furn); root.appendChild(cmp);
      seat.appendChild(root); // 官方卡之后(视觉在下方;官方卡被藏后占整个席位)
      document.documentElement.setAttribute('data-mc-dock-on', '');
      flashIn(root, function () {});
      return true;
    }
    // 官方属性镜像 → 状态机(忙闲通道;composerPhase 空 = 降级读 Send/Stop disabled)
    function syncBusy() {
      try {
        if (dead) return;
        var busy = false;
        if (off.phaseEl) busy = off.phaseEl.getAttribute('data-phase') === 'running'
          || off.phaseEl.getAttribute('data-phase') === 'busy';
        else if (off.stop && off.send) busy = !off.stop.hidden || off.send.hidden;
        if (busy !== (state.mode === 'busy')) {
          state = mcDockState(state, { t: busy ? 'busy' : 'idle' });
          if (api && api.onState) api.onState(state);
        }
      } catch (e) {}
    }
    // React 重渲染守护:官方卡/自绘坞被冲 → 重插;官方件失活 → 降级(McThink 观察器嫁接先例)
    mo = new window.MutationObserver(function () {
      try {
        if (dead) return;
        if (!findOfficial()) { bridgeFail(); return; }
        if ((!root || !root.isConnected) && off.card) {
          var seat = q(MC_MAP.composerSeat) || off.card.parentElement;
          if (seat && root && root.parentNode !== seat) seat.appendChild(root);
        }
        syncBusy();
      } catch (e) {}
    });
    var api = {
      state: function () { return state; },
      onState: null, // Task 5 注册:状态机 → 三态渲染回调
      setText: function (text) { return mcMirrorValue(off.field, text); }, // 桥通道 1
      send: function () { // 桥通道 2:唯一发送通道 = 官方原钮
        if (!off.send || off.send.disabled) return false;
        try { off.send.click(); return true; } catch (e) { return false; }
      },
      stop: function () {
        if (!off.stop) return false;
        try { off.stop.click(); return true; } catch (e) { return false; }
      },
      officials: function () { return off; },
      die: bridgeFail,
    };
    MC_DOCK_API = api;
    if (!mountDock()) { MC_DOCK_API = null; return function () {}; } // 探针失配=静默退场,官方照常
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-phase', 'disabled', 'hidden'] });
    syncBusy();
    return function teardown() {
      try { if (MC_DOCK_API === api) MC_DOCK_API = null; } catch (e) {}
      try { if (mo) mo.disconnect(); } catch (e) {}
      try { document.documentElement.removeAttribute('data-mc-dock-on'); } catch (e) {}
      try { if (root) root.remove(); } catch (e) {}
    };
  },
```

  MC_DOCK_CSS 尾部追加藏匿行（client.js 与镜像同改；加在 `].join('\n')` 前的数组末位）：

```js
  'html[data-mc-dock-on] ' + MC_MAP.composerHide + '{display:none!important}',
```
- [ ] **Step 2: 刷新验证** — 刷新 GUI：eval `!!document.querySelector('[data-mc-dock]')` 为 true；`document.documentElement.hasAttribute('data-mc-dock-on')` 为 true；`getComputedStyle(document.querySelector('[data-composer-card]')).display` 为 `'none'`；**官方 composer 内 textarea 仍 in DOM**（藏未删）；`[data-mc-dock]` 内暂无输入框（Task 5 前），页面输入功能由官方（隐藏）件承担——本任务验证到「坞挂上、官方藏了」为止，输入恢复在 Task 5。
- [ ] **Step 3: `npm test` + Commit** — `feat(mc-dock): mount 挂载入口+镜像桥+桥断降级(观察器守护)`

### Task 5: 自绘 composer 卡壳 + 三态 + Enter 纪律

**Files:**
- Modify: `client.js`（McDock.mount 内补 renderCmp + onState 渲染回调）、`src/conv/dock.js` 镜像

**Interfaces:**
- Consumes: Task 4 `MC_DOCK_API`/`api.onState` 钩子、`MC_DOCK_CSS` composer 段、Task 3 `mcDockState/mcMirrorValue`、`esc`、`accToggle`。
- Produces: `[data-mc-dock-cmp]` 内 DOM：`.composer` 卡（`.mc-field` textarea + `.composer-bar`）；全局派生钮 `data-mc-send`/`data-mc-stop`；Enter 发送纪律。

- [ ] **Step 1: renderCmp 实现**（mount 内、`mountDock()` 成功后调用；左组控件按 Task 1 附录 A 勘定——勘不通不渲染，本步骤代码按「左右组都只有已勘定钮」的默认形态写）：

```js
    function renderCmp() {
      var bar = '';
      // —— 左组(斜杠命令/权限位;Task 1 附录A勘定逐钮补,勘不通不渲染;本批默认无)——
      bar += '<span class="cb-right">';
      // —— 模型位(勘定补;勘不通不渲染;本批默认无)——
      bar += '<button type="button" class="btn sm primary" data-mc-send>' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-px-send"/></svg>Send</button>';
      bar += '<button type="button" class="btn sm danger" data-mc-stop hidden>' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-px-stop"/></svg>Stop</button>';
      bar += '</span>';
      cmp.innerHTML = '<div class="composer" data-mc-state="idle">' +
        '<label class="mc-field"><textarea rows="1" placeholder="Message the agent…"></textarea></label>' +
        '<div class="composer-bar">' + bar + '</div></div>';
      var ta = cmp.querySelector('textarea');
      ta.addEventListener('input', function () {
        state = mcDockState(state, { t: 'input', has: !!ta.value.trim() });
        paint();
      });
      ta.addEventListener('keydown', function (e) { // 原型 §9.2:Enter 无 Shift=发送;busy 早退
        try { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } } catch (er) {}
      });
      cmp.querySelector('[data-mc-send]').addEventListener('click', function () { doSend(); });
      cmp.querySelector('[data-mc-stop]').addEventListener('click', function () {
        try { api.stop(); } catch (er) {}
      });
    }
    function doSend() { // 镜像桥唯一发送路径:本地值 → 官方 textarea → 官方 Send click
      try {
        var ta = cmp.querySelector('textarea');
        var text = ta ? ta.value : '';
        if (state.mode === 'busy' || !text.trim()) return; // busy 早退(原型 §9.2)
        if (!api.setText(text)) { bridgeFail(); return; } // 镜像失败 = 桥断 → 降级
        if (!api.send()) return; // 官方钮 disabled = 官方拒绝,保留草稿不降级
        ta.value = '';
        state = mcDockState(state, { t: 'input', has: false });
        paint();
      } catch (er) {}
    }
    function paint() { // 三态渲染(原型 §9.2;accToggle 状态切换)
      var box = cmp.querySelector('.composer');
      if (!box) return;
      box.setAttribute('data-mc-state', state.mode);
      box.classList.toggle('busy', state.mode === 'busy');
      var send = cmp.querySelector('[data-mc-send]');
      var stop = cmp.querySelector('[data-mc-stop]');
      var busy = state.mode === 'busy';
      if (busy) { stop.hidden = false; send.hidden = true; }
      else { stop.hidden = true; send.hidden = false; send.disabled = state.mode === 'idle'; }
    }
    api.onState = paint; // Task 4 syncBusy → 状态机 → 本渲染
```

  （`renderCmp()` 在 `mountDock()` 内 `flashIn(root,…)` 前调用；`api`/`paint`/`doSend`/`renderCmp` 均在 mount 闭包内，`api.onState = paint` 在 api 定义后赋值——实现时把 renderCmp/paint/doSend 定义提至 api 之前、赋值放之后，保引用序一致。）
- [ ] **Step 2: 刷新验证** — 刷新 GUI：自绘坞出现可输入 textarea；打字 → Send 由 disabled 转激活；Enter → 消息真发出（会话流出现用户气泡）且本地草稿清空；实现期冒烟一次即可（活体验证仍归用户）。
- [ ] **Step 3: `npm test` + Commit** — `feat(mc-dock): 自绘 composer 卡壳与三态(镜像发送/Enter 纪律)`

### Task 6: 家具与圆环（按勘定分级渲染）

**Files:**
- Modify: `client.js`（mount 内补 renderFurn + DOCK_DATA 勘定数据面）、`src/conv/dock.js` 镜像

**Interfaces:**
- Consumes: Task 4 `furn` 容器、Task 3 `mcTodoSegments/mcTodoMeta/mcCtxArc`、`esc`、`accToggle`、`CLOCK`。
- Produces: `[data-mc-dock-furn]` 内家具 DOM（queue-row/todo-acc/goal-card 按 Task 1 附录 A 勘定渲染；勘不通的件整件不出现）；`.ctx-ring` + `.ctx-pop`（ctx 用量勘通才渲染）。`DOCK_DATA = {}` 勘定数据面注册表（附录 A 回填 getter；空表 = 全家具静默）。

- [ ] **Step 1: DOCK_DATA 注册表 + 渲染器**（mount 内、renderCmp 后调用 renderFurn()；每件家具独立 try/catch——一件勘坏不拖垮其余）：

```js
    // DOCK_DATA:Task 1 附录A勘定回填——键 → function():数据|null。全部勘不通 = 空表(家具静默)。
    // 形态约定(照原型 §9;勘定后按实况调整字段名):
    //   queue: { text:'队列中还有 2 条消息 — …' }
    //   todos: [{done:true},{done:false},…]
    //   goal:  { text:'…', phase:'active'|'blocked' }
    //   ctx:   { pct: 74, used:'96.2k', total:'130k', parts:[{name:'对话消息',pct:52,color:'accent'},…] }
    var DOCK_DATA = {}; // 附录A勘定回填(本步先置空——家具全静默,验证零行为)
    function esc2(s) { return esc(String(s == null ? '' : s)); }
    function renderFurn() {
      var html = '';
      try { var qd = DOCK_DATA.queue && DOCK_DATA.queue();
        if (qd) html += '<div class="queue-row"><svg aria-hidden="true"><use href="#i-px-clock"/></svg>' + esc2(qd.text) + '</div>';
      } catch (e) {}
      try { var td = DOCK_DATA.todos && DOCK_DATA.todos();
        if (td && td.length) {
          var segs = mcTodoSegments(td);
          var bar = '';
          for (var i = 0; i < segs.length; i++) bar += '<i class="' + segs[i] + '"></i>';
          var items = '';
          for (var j = 0; j < td.length; j++) {
            var cls = td[j].done ? ' done' : (segs[j] === 'now' ? ' now' : '');
            items += '<div class="t-item' + cls + '"><span class="t-box">' +
              (td[j].done ? '<svg viewBox="0 0 9 8" aria-hidden="true"><use href="#i-check"/></svg>' : '') +
              '</span><span class="t-txt">' + esc2(td[j].text) + '</span></div>';
          }
          html += '<div class="todo-acc open" data-mc-todo><button type="button" class="todo-acc-head">' +
            '<svg class="tri" aria-hidden="true"><use href="#i-tri"/></svg>' +
            '<span class="ta-title">To-Do List</span>' +
            '<div class="todo-bar">' + bar + '</div>' +
            '<span class="todo-meta">' + esc2(mcTodoMeta(td)) + '</span></button>' +
            '<div class="todo-body">' + items + '</div></div>';
        }
      } catch (e) {}
      try { var gd = DOCK_DATA.goal && DOCK_DATA.goal();
        if (gd) html += '<div class="goal-card" data-phase="' + esc2(gd.phase || 'active') + '">' +
          '<svg aria-hidden="true"><use href="#i-sparkle"/></svg><span class="gc-title">Goal</span>' +
          '<span class="gc-obj">' + esc2(gd.text) + '</span></div>';
      } catch (e) {}
      try { var cd = DOCK_DATA.ctx && DOCK_DATA.ctx();
        if (cd) {
          var arc = mcCtxArc(cd.pct);
          var lines = '';
          var colors = { accent: 'var(--mc-accent)', spark: 'var(--mc-spark)', muted: 'var(--mc-muted)' };
          var parts = Array.isArray(cd.parts) ? cd.parts : [];
          for (var k = 0; k < parts.length; k++) {
            lines += '<div class="ctx-line"><i style="background:' + colors[parts[k].color] + '"></i>' +
              esc2(parts[k].name) + '<span class="cl-bar"><i style="width:' + Number(parts[k].pct) +
              '%;background:' + colors[parts[k].color] + '"></i></span>' + Number(parts[k].pct) + '%</div>';
          }
          html += '<span class="cb-anchor" data-mc-ctx><span class="ctx-ring"' + (arc.hot ? ' data-hot' : '') +
            ' title="上下文占用 ' + Number(cd.pct) + '% · ' + esc2(cd.used) + ' / ' + esc2(cd.total) + ' tok">' +
            '<svg viewBox="0 0 22 22" aria-hidden="true" shape-rendering="crispEdges">' +
            '<circle class="cr-track" cx="11" cy="11" r="8.5" fill="none" stroke-width="3"/>' +
            '<circle class="cr-arc" cx="11" cy="11" r="8.5" fill="none" stroke-width="3" stroke-dasharray="' +
            arc.dash + '" transform="rotate(-90 11 11)"/></svg></span>' +
            '<div class="ctx-pop" data-mc-ctxpop><div><b>' + esc2(cd.used) + ' / ' + esc2(cd.total) +
            ' tok</b> · 上下文占用 ' + Number(cd.pct) + '%</div>' + lines + '</div></span>';
        }
      } catch (e) {}
      furn.innerHTML = html; // 全动态段经 esc2
      var head = furn.querySelector('.todo-acc-head');
      if (head) head.addEventListener('click', function () { // 折叠开合 = accToggle 状态切换
        var acc = furn.querySelector('[data-mc-todo]');
        accToggle(acc, function () { acc.classList.toggle('open'); });
      });
      var ring = furn.querySelector('[data-mc-ctx] .ctx-ring');
      if (ring) ring.addEventListener('click', function (e) { // ctx-pop 硬切显隐(原型 §9 无淡入)
        try {
          e.stopPropagation();
          var pop = furn.querySelector('[data-mc-ctxpop]');
          pop.classList.toggle('open');
        } catch (er) {}
      });
    }
    function onDocClose(e) { // 点外收 ctx-pop(浮层互斥,原型 §9.4)
      try { var pop = furn && furn.querySelector('[data-mc-ctxpop]');
        if (pop && pop.classList.contains('open') && !pop.contains(e.target)) pop.classList.remove('open');
      } catch (er) {}
    }
    document.addEventListener('click', onDocClose, true);
```

  teardown 追加 `try { document.removeEventListener('click', onDocClose, true); } catch (e) {}`。
- [ ] **Step 2: 勘定回填** — 按 Task 1 附录 A：勘通的数据面以 getter 形式填入 DOCK_DATA（读 `ctx.sessions.list()` 快照/`ctx.get('workspaces')`/ctx 用量面——照 menus 批 `mcMenuWsSvc` 的可选读取守卫模式）；**勘不通的键保持不写**（该家具自动静默）。若四件全勘不通，DOCK_DATA 保持空表并记附录 A「全家具静默」结论——Task 6 照常收口（零行为也是合法终态）。
- [ ] **Step 3: 刷新验证** — 刷新 GUI：勘定项家具出现且与原型形态一致；未勘定项不出现；todo-acc 点击折叠/展开走 accToggle；ctx-ring 点击弹 ctx-pop、点外收。
- [ ] **Step 4: `npm test` + Commit** — `feat(mc-dock): 家具与 ctx 圆环(勘定分级渲染/点外互斥)`

### Task 7: verify-dock 门禁 + 拔桥演练

**Files:**
- Create: `tools/verify-dock.mjs`

**Interfaces:**
- Consumes: Tasks 2-6 全部。
- Produces: 门禁脚本（退出码 0=GREEN / 1=RED；`--dry-run` 只验注入）。

- [ ] **Step 1: 写门禁脚本**（结构照 verify-menus.mjs：launch → goto → 8s 等待 → 断言 → 深浅两轮截图 → 退出码；`--dry-run` 分支照抄改选择器为 `[data-mc-dock]`）。断言集：

```js
// 1) 自绘坞在场 + 单输入框保证:官方卡藏未删
//    - !!document.querySelector('[data-mc-dock] .composer textarea')
//    - official = document.querySelector('[data-composer-card]')
//    - getComputedStyle(official).display === 'none' 且 !!official(藏未删)
//    - document.documentElement.hasAttribute('data-mc-dock-on')
// 2) 三态:初始 Send disabled;打字(自绘 textarea page.fill)→ Send enabled;.busy 类缺省
// 3) e2e 镜像发送:自绘 textarea 填 '门禁镜像自检 <ts>' → 点 [data-mc-send] → 轮询 4s
//    document 源文本含该串(用户气泡入场);自绘 textarea 复位为空
// 4) 观察器守护:page.evaluate(() => document.querySelector('[data-mc-dock]').remove())
//    → 轮询 4s [data-mc-dock] 回归(React 重插守护有效)
// 5) 拔桥演练(spec §5-6):page.evaluate 重定义 value setter 抛错 →
//      Object.defineProperty(HTMLTextAreaElement.prototype, 'value', {
//        get: desc.get, set() { throw new Error('BROKEN'); }, configurable: true })
//    → 打字+点 Send → 轮询 4s:[data-mc-dock] 消失 && html[data-mc-dock-on] 摘除 &&
//    官方卡 display 恢复(非 none) → goto 刷新还原原型描述符
// 6) 家具断言:按 Task 6 附录A勘定实况逐件——勘定项在场+形态断言;未勘定项断言 absent
// 7) 深浅两轮:setTheme('浅色') → .composer computed background 反转断言 → 截图
//    shots/dock-verify-dark.png / dock-verify-light.png → setTheme('深色') 还原
// 8) Stop/busy:仅 INFO——需真实运行态,活体验收由用户覆盖(与 verify-menus 归档断言 deferred 同款裁定)
```

  每条 check 照 verify-menus 的 `check(name, cond)`/`info(name, val)` 格式；断言 3/5 之间必须先断言 4 通过（守护在场才演拔桥）。
- [ ] **Step 2: 门禁 GREEN** — `node tools/verify-dock.mjs` 全 PASS（宿主进程缓存旧 client.js 时：先试刷新等待 30s 重跑；仍缓存则 `--dry-run` 留证 + 完整门禁记 deferred，照 verify-menus 同款裁定，commit message 注明）。
- [ ] **Step 3: Commit** — `test(mc-dock): verify 门禁与拔桥演练`

### Task 8: kit 输入坞分区 + 浅色 QA + 文档收尾 + 终验

**Files:**
- Modify: `src/kit.js`（菜单分区后追加输入坞分区）、`client.js` 镜像
- Modify: `prototype/component-dev-notes.md`（§8.8 追加 dock 落地差异注记）、`README.md`（工具行补 verify-dock）

- [ ] **Step 1: kit 分区**——照菜单分区先例（src/kit.js L250 起「真 openMenu 管道演示」模式）：`h('section', …)` 陈列 `[data-mc-dock]` 样本全形态——composer 三态（`data-mc-state="idle|ready|busy"` 三张静态卡 + 「▶ 三态轮播」演示钮走 kit 本地 `mcDockState` 状态机，**不经 MC_DOCK_API**（kit 上下文无官方镜像桥；桥空转守卫已保安全））；todo-acc 折叠+展开各一；goal-card active/blocked 各一；queue-row 一条；ctx-ring+ctx-pop（pct 74 静态示意，点开展开）。DOM 照原型 L1898-1998 直抄换 token；文案字面量经 `h()` 结构化（无 innerHTML 插值，audit §3 不破）。
- [ ] **Step 2: 浅色 QA** — playwright 切浅色截图 `shots/dock-light-*.png`（composer 三态/家具/ctx-pop 各一）与原型浅色形态并排核对；异常当场修（计入本 commit）。
- [ ] **Step 3: 注记回写** — `prototype/component-dev-notes.md` §8.7 后追加 **§8.8 输入坞落地差异（2026-09-01 dock 批实录，host 0.1.1-rc.X）**：镜像桥实况（官方 textarea/钮锚点实况）、挂载入口实采（槽 vs 席位插入）、勘不通被滤除的子件清单、拔桥演练结论、busy 面貌勘定。
- [ ] **Step 4: README 工具行** — tools 清单补一行（verify-menus 行后）：`node tools/verify-dock.mjs        # 输入坞门禁：镜像发送/守护重插/拔桥降级深浅两轮（--dry-run 只验注入）`。
- [ ] **Step 5: 终验** — `npm test` 全绿 + `node tools/verify-dock.mjs` GREEN（或记 deferred 实况）；向用户演示：自绘坞输入发送、三态、家具、拔桥恢复；**活体验收按规则由用户发起**（多会话）。
- [ ] **Step 6: Commit** — `docs(mc-dock): kit 分区/浅色 QA/注记收尾`

---

## 附录 A · 探针勘定记录（Task 1 回填）

> 探针：`tools/probe-dock.mjs`（live DOM @127.0.0.1:3080 + 部署源 chunk 扫描）；**宿主 0.1.1-rc.2（bundle rev aba836a0c42d），2026-09-01 实测**。

| 勘察项 | 结果 |
|--------|------|
| COMPOSER_DUMP（卡内交互件清单） | 卡内 5 交互件：`TEXTAREA[placeholder=描述你想要构建的内容]`、`BUTTON[aria-label=命令]`（add）、`BUTTON[aria-label=访问模式，当前：Full access]`（trigger）、`BUTTON[aria-label=选择模型，当前 GLM-5.3-flash]`（trigger）、`BUTTON[aria-label=发送消息][disabled]`（primary=Send）；**Stop 钮 idle 不在场**（stopVisible:false）；role=status 缺席（NO_STATUS） |
| MIRROR_SMOKE（native setter 镜像 + Send disabled 翻转） | `hasNativeDesc:true`；镜像 `PROBE_MIRROR_试` 读回一致（`mirrored:true`）；**Send disabled true→false 翻转**（React state 真被驱动）；setError:null；草稿已还原清空 |
| 官方 textarea 锚（composerField） | `[data-composer-card] textarea`（镜像冒烟即用此锚命中；TEXTAREA 原生元素非 contenteditable） |
| 官方 Send/Stop 锚（composerSend/composerStop） | Send=`[data-composer-card] [aria-label="发送消息"]`（实测命中）；**Stop 勘不出**（busy 态才渲染，idle 无此钮）→ `composerStop:''` 降级（busy 断言降级 INFO） |
| 忙闲面貌（composerPhase） | **勘不出忙闲锚**：`div[data-phase]` 实测值为页面态 `hero`（已知枚举 settling\|hero\|active，非忙闲）；`role=status` idle 缺席 → `composerPhase:''` 降级（读 Send/Stop disabled/hidden） |
| 席位容器（composerSeat） | `[data-composer-seat]` **实测在场**（官方卡 `closest('[data-composer-seat]')` 命中；注意卡的 parentElement 链 5 级内无 seat 标记——seat 在更上层，勿用 parentElement 兜底猜位） |
| 槽勘定（conversation.input.dock / composer.dock / conversation.composer.*） | **全零命中**——部署源 chunk 扫描仅见 `archiveSession`（L~9621/9622/10027/10028）与 `startSession`（L~9925）服务成员，无任何 composer 输入槽 → **Task 4 走席位插入（默认通道），无槽渲染通道** |
| 数据面（todo/goal/queue/ctx 用量） | 本次探针未勘通（regex 面仅 slots/服务名，未见 todo/goal/queue/ctx 用量成员）→ Task 6 `DOCK_DATA` 先空表（家具全静默=合法终态），Task 6 开工前可加勘回填 |
| **Go/No-Go 裁定** | **GO** —— ① `mirrored:true` 且 Send disabled **true→false 翻转**（native setter + input event 真驱动官方受控 textarea）；② 席位插入通道在场（`[data-composer-seat]`）；③ 家具数据面未勘通但降级路径定义完整（空表静默），不阻塞批次。**回退方案 A 不触发** |

### 探针输出全文（2026-09-01 live @127.0.0.1:3080）

```text
COMPOSER_DUMP:
{
 "cardAttrs": "class=uV2eYG_card data-composer-card=true",
 "interactive": [
  "TEXTAREA.uV2eYG_input[placeholder=描述你想要构建的内容]",
  "BUTTON.uV2eYG_add[aria-label=命令]",
  "BUTTON.Sh0Q9G_trigger[aria-label=访问模式，当前：Full access]",
  "BUTTON._7KE1Ra_trigger[aria-label=选择模型，当前 GLM-5.3-flash]",
  "BUTTON.uV2eYG_primary[aria-label=发送消息][disabled]"
 ],
 "seatPresent": true,
 "seatAttrs": "class,data-composer-seat",
 "parentChain": [
  "DIV.uV2eYG_root uV2eYG_hero",
  "DIV.",
  "DIV.wSkVaW_composerStack wSkVaW_composerHero",
  "DIV.",
  "DIV."
 ],
 "phase": "hero",
 "statusText": "NO_STATUS",
 "stopVisible": false
}
MIRROR_SMOKE:
{
 "isTa": true,
 "hasNativeDesc": true,
 "before": "",
 "after": "PROBE_MIRROR_试",
 "mirrored": true,
 "sendBtnFound": true,
 "sendDisabledBefore": true,
 "sendDisabledAfter": false,
 "setError": null
}
DEPLOY_SOURCE_HITS:
client.js?rev=aba836a0c42d :: archiveSession @line~9621
client.js?rev=aba836a0c42d :: archiveSession @line~9622
client.js?rev=aba836a0c42d :: startSession @line~9925
client.js?rev=aba836a0c42d :: archiveSession @line~10027
client.js?rev=aba836a0c42d :: archiveSession @line~10028
PROBE_DONE
```

### MC_MAP dock 段回填值（client.js + src/chrome/map.js 镜像同步）

```js
  composerSeat: '[data-composer-seat]',                          // 探针实测在场
  composerHide: '[data-composer-card]',                          // 一期键复核通过（卡 attr 实况 data-composer-card=true，presence 选择器命中）
  composerField: '[data-composer-card] textarea',                // 镜像冒烟同款锚，mirrored:true
  composerSend: '[data-composer-card] [aria-label="发送消息"]',   // 实测命中；镜像后 disabled 翻转
  composerStop: '',                                              // 勘不出（busy 态才渲染）→ 降级
  composerPhase: '',                                             // 勘不出（data-phase=页面态非忙闲）→ 降级
```

> audit 前缀键登记（Step 6）：**跳过**——四个非空值全部为闭合 bracket 形态，由 map 值自动提取，无前缀形态键。

### 验收轮1 回填（2026-09-01 live-runtime 探针 `tools/probe-dock-live.mjs`，acceptance1-probe）

> 探针：`tools/probe-dock-live.mjs`（live @127.0.0.1:3080，宿主 0.1.1-rc.2 bundle rev aba836a0c42d，2026-09-01T07:39:44Z 起，SAW_BUSY=true，exit 0）；原始输出 `tools/probe-dock-live.out.txt`（运行产物不入库）；全文结论见 `.superpowers/sdd/2026-09-01-macintosh-theme-dock/acceptance1-probe.md`。

| 勘察项 | 结果 |
|--------|------|
| busy 面貌（B 段） | busy 时官方 Send **卸载**（非 hidden）、「停止生成」同槽挂载（t=9ms）；`停止生成` aria-label 全 busy 窗恒定 → **干净忙闲沿**；`uV2eYG_primary` 与 Send 共享哈希类（不可用锚） |
| composerStop 回填 | `'[data-composer-card] button[aria-label="停止生成"]'`（busy 才挂载；勿用哈希类） |
| composerPhase 裁定 | **维持空**：`div[data-phase]`（settling\|hero\|active）是页面生命周期非忙闲，`running\|busy` 值不存在；`[role=status]` 是 busy-only 元素面非属性锚；busy 改由 composerStop 在场判定（syncBusy 判定改 `off.stop 在场且 !hidden`——旧降级式 `off.stop && off.send` 因 Send 卸载恒 false） |
| bar 钮锚回填（A 段 idle 全清单） | `composerCmd: '[data-composer-card] button[aria-label="命令"]'`；`composerPerm: '[data-composer-card] button[aria-label^="访问模式"]'`（动态后缀=当前模式明文「访问模式，当前：Full access」）；`composerModel: '[data-composer-card] button[aria-label^="选择模型"]'`（**title 属性=精确模型名**）；`composerCtx: '[data-composer-card] button[aria-label^="上下文已用"]'`（busy 态挂载、aria-label 实时自增 1→2→4→5） |
| ctx 用量数据面（C/D 段） | **FOUND（仅一处）**：宿主 ctx 用量面=官方卡钮 aria-label（上文 composerCtx）；模块级数据面零命中，bar 控件「当前值」只活在 DOM aria-label/title |
| 用户裁定（bar 壳） | 裁定 4 修订：bar 按钮**壳必须**（镜像官方实有钮，值自 aria-label/title 解析）；菜单项仍只官方实有动作 |
| MutationObserver | attributeFilter 追加 `aria-label`/`title`（官方 ctx % 与权限/模型值是 aria-label 原地变异，须触发重查）；childList（Stop↔Send 换槽/ctx 钮挂载）照旧 |
| 自增高（新增裁定） | 自绘 textarea input 自增高（`height:auto→scrollHeight`，40vh 封顶，无 transition）；发送清稿后复位 |

## Self-Review 结论

- **Spec 覆盖**：§0 裁定 1（B 路线=Task 4/5 全自绘）、裁定 2（镜像桥四通道=Task 4 Step 1 四通道代码）、裁定 3（go/no-go=Task 1 Step 5 + Global Constraints 回退条款）、裁定 4（勘不通不渲染=Task 5 左组/模型位 + Task 6 DOCK_DATA 空表静默）、裁定 5（范围四件=Task 2-6；ask 向导出栈）；§1 架构（Task 2 装配 + Task 4 挂载双通道/失配退场）；§2 组件（Task 2 CSS 全集 + Task 5/6 DOM）；§3 数据流（Task 3 纯函数 + Task 4/5 桥）；§4 动画纪律（Global Constraints + Task 6 accToggle）；§5 测试/门禁/拔桥/kit/验收（Task 3/7/8）。无缺口。
- **占位符**：MC_MAP dock 六键、左组/模型位、DOCK_DATA 均为显式探针依赖（Task 1 附录 A 回填；spec §0 裁定 3/4 已声明该模式）；每处均有定义完整的降级路径（空串跳过/空表静默/桥断退场）。无 TBD。
- **类型一致**：`mcDockState(state,ev)→{mode,has}`、`mcTodoSegments/mcTodoMeta/mcCtxArc`、`mcMirrorValue(ta,text)→bool`、`MC_DOCK_API={state,onState,setText,send,stop,officials,die}`、MC_MAP dock 六键名、`[data-mc-dock]/[data-mc-dock-furn]/[data-mc-dock-cmp]/html[data-mc-dock-on]` 各任务一致；audit `DOCK_WHITELIST` 七键与 MC_MAP dock 段键集一致。
- **顺序依赖**：1 先行（go/no-go 门 + 勘定回填）；2→3 顺序链；4 依赖 1+2+3；5 依赖 4；6 依赖 4（与 5 可并行的部分经 furn/cmp 容器隔离）；7 依赖 2-6；8 收尾。

---

## 验收轮 1 状态快照（2026-09-01 下班时点，续作必读）

**分支 `feat/mc-dock`（未合并 main）；实施 8 任务 + 终审 + 验收轮 1 修复全部完成（HEAD `69b3b94`）；`npm test` 45/45 + audit + verify-dock 门禁全绿。**

### 已交付（验收轮 1 修复，commit 69b3b94，审查 Approved）

- busy/Stop 链路接线：MC_MAP 回填 `composerStop`（busy 独占钮，aria=停止生成）；syncBusy 判定改「Stop 在场且 !hidden」（busy 时官方 Send 是卸载非 hidden）；活体验证点击自绘 Stop → 官方中断 → 回 idle
- composer-bar 四钮补全：命令/权限/模型/ctx 圆环镜像官方钮（值自 aria-label/title 解析实时同步；官方钮缺席→对应钮隐藏降级）
- textarea 自增高（scrollHeight 瞬切、40vh 封顶、发送复位）
- ctx 圆环：busy 期官方钮 aria-label「上下文已用 N%」实时解析进环与 pop

### 弹层勘定结论（6 轮活体探针，详见 workspace acceptance1-popover-probe.md）

- **模型**：隐藏态纯合成 click 可真实换值（GLM-5.3-flash⇄GLM-5.3 已验证+复原）→ **自绘菜单转写成立**
- **权限**：不可驱动——宿主会话策略门吞掉一切升级方向（合成/悬停/键盘/真实点击全试）→ **降级为状态显示**
- **命令**：role=listbox 7 项（compact/export/feedback/goal/permission/plan/model）仅清点未测驱动
- 三弹层全挂 display:none 官方卡内（menuInCard:true，零 portal）——镜像点击对用户不可见

### 用户裁定（验收轮 1 反馈 + 后续）

1. bar 按钮壳必须（修订裁定 4 的 bar 适用面）
2. textarea 自增高为新增需求
3. **命令钮走「斜杠填稿桥」**：点选命令只把 `/xxx` 文本填入自绘 textarea 草稿，用户审查后 Enter 走官方执行链（零副作用）

### 待办（验收轮 2，按序）

1. **权限钮降级状态显示**（宿主策略门，弹菜单无意义）
2. **模型钮自绘菜单转写**（点选驱动隐藏官方 menuitemradio，已证可行；两段式：cell click 展开 23 项 radio）
3. **命令钮斜杠填稿桥**（7 项命令清单已清点）
4. **产物行抽搐根因续查**（用户报告：turn-tail 产物行文字/元素概率性两种样式或内容来回切换。Phase 1 半程：假设=宿主测宽探针（`.P4kPIW_probe`×3 + `.P4kPIW_measure` 容器，`width:max-content` 绝对定位——已实锤存在）被主题皮肤（`.P4kPIW_root .P4kPIW_file` max-width:220px/24px 高/13px mono）改变度量 → 测量↔渲染反馈振荡。已取证：15s 窗口 0 mutation（概率性未捕获）；待做：流式期间/resize 触发长窗复测、对比探针测量值与 220px 钳制差、查宿主是否 inline width 回写。探针脚本 `tools/probe-deliver-twitch.mjs` 留盘 untracked）
5. ledger 4 条 minors（lastCtxPct 跨会话清零 / autogrow resize 重算 / 断言8 busy 窗挤压 / perm 前缀正则双处字面重复）

### ⚠️ 环境遗留

- **会话权限卡在 Read Only**（探针真实点击流副作用，服务端持久、程序化无法复原）——须在 GUI 手动 `/permission` 切回 Full access

## 验收轮 2 状态快照（2026-09-01，commit 9d8fb93）

**弹层方案改判（用户裁定）**：弃「自绘菜单转写/斜杠填稿桥」，改**官方弹层 + CSS 注入**——原待办 1/2/3 三项合并为一套机制。

### 已交付（commit 9d8fb93）

- **官方弹层 CSS 注入门控**：bar 四钮（命令/权限/模型/busy-ctx）点击 = `openOfficialPop`——设 `--mc-pop-l/--mc-pop-b` 锚位（左锚定+视口钳制）+ `html[data-mc-pop]`；官方卡门控期从 `display:none` 切「离屏抹除态」（fixed -32000px 1px 盒、overflow:visible、pointer-events:none），卡内官方菜单（`[role=menu]/[role=listbox]`）经 `position:fixed` 逃逸到视口（display:none 祖先纯 CSS 不可复活，故门控期换藏匿形态；卡无 transform，fixed 子件仍视口定位）。菜单卸载由 `syncPopGate`（MO 每拍）收口摘属性，`popSeen` 防开层当拍误收
- **注入皮**：像素边框/硬投影/`--font-ui`，菜单内 `*{font-family:inherit}`（宿主 span 自带字体曾令 CJK 回退不一致）；属性选择器一律不带引号（带引号形态撞 map 值提取 token，审计 §5）；无 :hover/transition
- **ctx 圆环方案 2**：busy 走官方弹层门控；idle 官方钮缺席 → 自绘 ctx-pop 兜底（`lastCtxPct`）
- **模型钮字体**：去 `--font-mono`，统一 `--font-ui`（与正文一致）
- **Send/Stop 去图标**：纯文字（用户裁定）
- 验证：npm test 45/45 + audit 全绿；verify-dock GREEN；活体冒烟 `tools/probe-pop-smoke.mjs`（三钮弹层/锚位/收口全 PASS，截图 `shots/dock-pop-*.png` 不入库）

### 勘定补充（验收轮 2 探针）

- **idle 期官方无上下文入口**（`tools/probe-ctx-idle*.mjs` 只读探针：卡内 5 交互件无 ctx 件，全页唯一「上下文」命中=「移除聊天框底部的上下文组成条插件」管理条目）——用户记忆的原版 idle 可点入口=宿主「上下文组成条」插件，**当前实例未渲染**（条本体不在 DOM）。busy 期才有卡内「上下文已用 N%」钮 → 方案 2 双轨裁定依据
- 顶部菜单（menus 批）现为「藏官方 portal + 全自绘转写」——本轮 CSS 注入机制验证可行后为后续切换候选（另批）

### 待办（验收轮 3）

1. 产物行抽搐根因续查（用户裁定本轮搁置；Phase 1 半程，假设=宿主测宽探针被主题皮肤改变度量，探针 `tools/probe-deliver-twitch.mjs` 留盘）
2. ledger 4 条 minors（lastCtxPct 跨会话清零 / autogrow resize 重算 / 断言8 busy 窗挤压 / perm 前缀正则双处字面重复）
3. 弹层活体验收：浅色态/IME 态/菜单键盘导航（Tab/箭头）未系统过验；模型菜单两段式（23 项 radio）驱动实链路未测（本轮仅验弹层形态与皮）

## 验收轮 3 状态快照（2026-09-01，commit 8a3f839）

- **弹层直角化**：菜单容器 `border-radius:0`（用户裁定，弃 `--mc-r-card`）
- **flashIn/flashOut 接入**：出场=官方菜单元素直挂 `flashIn`（按元素身份判新，二段式换卡亦闪）；退场=宿主瞬时卸载菜单元素不可闪，以最近 rect+皮底色建「同形替身块」（`[data-mc-popfx]`）补 `flashOut`，拍1 撤块零残留
- 冒烟实证（`tools/probe-popfx-smoke.mjs`）：半径 0px / 开层 80ms `mcfx mc-ghost`→400ms 撤净 / 关层 80ms 替身 `mc-flash`→500ms 零残留+门控摘除；npm test 45/45+audit 全绿；verify-dock GREEN
- **ctx 圆环 busy/idle 同款弹窗**（commit 762de04，用户裁定）：idle 官方卡三轮勘定无圆环锚（busy 卸载；vanilla 态真实会话/active/有用量复核仍四钮无环——用户原版所见可点环判定为 busy 残留窗口）→ idle 用同款皮本地弹层顶上（直角/`--font-ui`/同底色），开合走 `popFlash`（mcfx 三拍+防重入），点外收口同款闪退；busy 路径不变（官方锚+门控）
- 主题临时停用勘验三例（profile 补丁层 `disabled: true` 热重载，勘毕即恢复）：vanilla idle/hero/active 全态无 ctx 环；`tools/probe-ctx-*.mjs` 留盘
- **ctx 锚勘定改判（commit b0c91bd，终局）**：官方 ctx 钮挂载条件=**用量>0**（busy→idle 40s 采样实证：回复结束后 idle 持续在场 `上下文已用 1%`）——旧结论「busy 才挂载」系 idle 探针全测在 0% 用量会话的误判（用户活体观察正确）。圆环点击**不判忙闲**：锚在场→转点官方钮+门控→官方真弹窗（ctx=`role=dialog`，皮选择器并入 dialog）；锚缺席（0% 空会话）→本地同款皮兜底。终验：idle 点环→官方 dialog（系统提示词/工具/对话消息分项真数据）弹出+收口 GREEN。**装回 dsh-context 插件**（profile bundle `^0.40.0`，用户裁定；idle 锚存续观测系插件在场态，移除或影响 idle 常驻）。装饰级 backlog：dialog 内滚动条/关闭图标像素化、深色下硬投影弱可见
- 待办 1-3 照旧顺延
