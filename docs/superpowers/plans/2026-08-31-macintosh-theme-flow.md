# Macintosh 主题 · 二期 flow(会话流)模块 Implementation Plan

> **续作状态(2026-09 复验)**:Task 1-10 全部完成并通过终审;用户验收一轮 5 项已修(5692331);**验收二轮 9 项已全部实现于 683b765**(存档 commit 同波落码+截图,存档段此前误记「未做」)并于复验通过——`npm test` 29/29 + audit 全绿,`tools/acc2-recheck.mjs` 活体断言全过(⑤ lead none/间距 17px、① i-doc 8×10 mask、⑦ 11px 像素三角+展开 rotate 90°、⑥ think/context 卡头四拍 mcfx/mc-ghost 命中且拍后零残留、⑧⑨③④② CSS 门控全命中),关键截图(⑤⑥⑦)视觉复核通过。剩余:finishing 菜单三选一(用户未选)。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付 flow 会话流模块——11+unknown 种 ChatNodeKind 的 Macintosh 语汇覆写(纯层3 CSS + 官方变量通道)、observer 出场三拍/相位同步管道、kit 会话流分区与五帧演示、双 verify 门禁。

**Architecture:** `client.js` 新增 `McFlow` 模块(`{css, mount(ctx)}`)入 mods/order;全部官方选择器进 `MC_MAP` flow 段(唯一管制点);循环动画经 MutationObserver + `CLOCK.syncAnim` 负延迟同步;出场走 mcfx 三拍;`theme.overrideTokens` 追加 `--dsw-specific-bubble`。零 slot 注册、零 kind 渲染替换。

**Tech Stack:** 纯 JavaScript(loader 格式 client.js,无 import/TS/JSX)、CSS 自定义属性、node --test、playwright(门禁脚本)、MutationObserver。

**Spec:** `docs/superpowers/specs/2026-08-31-macintosh-theme-flow-design.md`(本计划与之同行;组件精确值另见 `prototype/macintosh-workspace.html` L461-548)

## Global Constraints

- plain JavaScript;client.js 为函数体(loader 格式),禁 `import/require/TS/JSX`;React 用 `React.createElement`(仅 kit 需要)。
- 动画纪律:无 `:hover`、无 `transition`(宿主自带的一律 `transition:none` 压平)、按压只 `:active`、一切延时走 `CLOCK.next`(禁裸 setTimeout)、`prefers-reduced-motion:reduce` 压 `.01ms` + JS 跳拍、浅色遮罩反转复用一期 mc-ghost/mc-flash。
- 官方 selector 只允许出现在 client.js 的 `MC_MAP` 段(audit 管制);失配 = 组件级回退官方样式,不破版。
- **dev 循环 = 改 client.js → 浏览器刷新即生效(spike 实测 2026-08-31),无需重启宿主**;只有改 package.json/index.js/cordis.patch.yml 才需重启(`~/.dsh/restart-web.ps1`)。
- 每任务一 commit,`npm test` 全绿后才 commit;verify 门禁脚本用 playwright(devDependency)。
- 值源:颜色/几何/字号一律 `--mc-*`/`--font-*` token 引用,不硬编码色值(浅色自动跟随)。

## File Structure

```
client.js               主战场:MC_MAP flow 段 + McFlow 模块 + mods/order + overrideTokens 一行
src/conv/flow.js        设计参照镜像(与 client.js 内 McFlow 同源;含 MC_FLOW_ICONS 纯数据 + CJS 测试 shim)
test/flow-icons.test.mjs  form→icon 映射纯数据测试
tools/verify-flow.mjs   flow 域 playwright 门禁(新建)
tools/verify-persistent.mjs  扩 flow 断言(已有,改)
tools/audit.mjs         flow 段特征核验扩容(已有,改)
prototype/component-dev-notes.md  §8 追加 flow 落地差异注记(收尾)
README.md               dev 循环更正 + kit 分区说明(收尾)
```

---

### Task 1: MC_MAP flow 段 + McFlow 骨架 + .flow 列容器覆写

**Files:**
- Modify: `client.js`(MC_MAP 对象尾、mods/order、新模块段)
- Create: `src/conv/flow.js`
- Modify: `tools/audit.mjs`(map 段特征片段)

**Interfaces:**
- Produces: `MC_MAP` 新键(后续任务全部插值引用):`flowScroll/flowColumn/flowItem/kindUser/kindSteering/kindContext/kindAssistantStep/kindCommand/kindCompaction/kindManualCompaction/kindModelRetry/kindTurnError/kindTurnMaxTokens/kindTurnTail/kindUnknown/bubbleUser/userGallery/refChip/mdRoot/thinkCard/ctxBody/turnTailBar`;`McFlow = { css, mount }` 挂入 `mods`/`order`(McFinder 后、McKit 前)。

- [ ] **Step 1: MC_MAP 追加 flow 段**(client.js `const MC_MAP = {...}` 闭合 `}` 前,带注释「flow 段·探针 2026-08-31·host 0.1.1-rc.2」):

```js
  // —— flow 段(会话流;探针 2026-08-31,host 0.1.1-rc.2;dsh-client-ui-conversation 行号)——
  flowScroll: '[data-conversation-scroll]',                    // stable(L7276)
  flowColumn: '[data-chat-flow]',                             // stable(L5829)
  flowItem: '[data-chat-flow-kind]',                          // stable(L5506-5510)
  kindUser: '[data-chat-flow-kind="user"]',
  kindSteering: '[data-chat-flow-kind="steering"]',
  kindContext: '[data-chat-flow-kind="context"]',
  kindAssistantStep: '[data-chat-flow-kind="assistant-step"]',
  kindCommand: '[data-chat-flow-kind="command"]',
  kindCompaction: '[data-chat-flow-kind="compaction"]',
  kindManualCompaction: '[data-chat-flow-kind="manual-compaction"]',
  kindModelRetry: '[data-chat-flow-kind="model-retry"]',
  kindTurnError: '[data-chat-flow-kind="turn-error"]',
  kindTurnMaxTokens: '[data-chat-flow-kind="turn-max-tokens"]',
  kindTurnTail: '[data-chat-flow-kind="turn-tail"]',
  kindUnknown: '[data-chat-flow-kind="unknown"]',
  bubbleUser: ':is([data-chat-flow-kind="user"],[data-chat-flow-kind="steering"])>div>div', /* DRIFT-RISK: structural(哈希三件套 gdEzaW_*,L5332-5361) */
  userGallery: '[data-align="end"] [data-variant]',            // stable(ATT L705-746)
  refChip: '[data-ref-chip]',                                 // stable(L5315-5324)
  mdRoot: '[data-chat-flow-kind="assistant-step"] > div',      /* DRIFT-RISK: structural(Sxvs8a_*,L9461-9521) */
  thinkCard: '[data-variant="think"]',                        // stable;双锚 [data-state](L9389-9439)
  ctxBody: '[data-context-injection-body]',                   // stable(L4863-4907)
  turnTailBar: '[data-turn-tail]',                            // stable(L9715-9752)
```

- [ ] **Step 2: McFlow 模块骨架**(插在 McFinder 段之后;`src/conv/flow.js` 同源镜像):

```js
// src/conv/flow.js —— 会话流覆写(spec 2026-08-31)
// 协议 { css, mount(ctx) }。选择器一律插值 MC_MAP;无 :hover 无 transition。
var McFlow = {
  css: [
    // §4-1:.flow 列(gap 16→14 原型 L462;padding 16;子项 flex:none 手册 §6.4)
    MC_MAP.flowColumn + '{gap:14px;padding:16px}',
    MC_MAP.flowItem + '{flex:none;min-width:0}',
  ].join('\n'),
  mount: function (ctx) {
    // Task 7 实装:MutationObserver 三拍 + syncAnim 相位同步
    return null;
  },
};
```

client.js 内同段代码直接放置(`var McFlow = {...}`,引用其上已定义的 `MC_MAP`),并在 `mods` 表加 `McFlow: McFlow,`、`order` 数组 McFinder 后插 `"McFlow"`。

- [ ] **Step 3: audit 扩容** —— `tools/audit.mjs` 的 map 段特征核验清单追加 2 个特征片段:`'[data-chat-flow-kind='` 与 `'[data-variant="think"]'`(确认它们只出现在 MC_MAP 段)。
- [ ] **Step 4: `npm test` 全绿**(audit 特征未命中新位置前先跑一次确认现状绿,再改)。
- [ ] **Step 5: 刷新验证** —— playwright `open http://127.0.0.1:3080` → `--raw eval "getComputedStyle(document.querySelector('[data-chat-flow]')).gap"` 应为 `14px`(有空会话时;无会话 hero 态则 eval flowColumn 存在性与 padding `16px`)。
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat(mcx-flow): MC_MAP flow 段与列容器覆写"`

### Task 2: .md 正文覆写(md 全要素)

**Files:** Modify `client.js`(McFlow.css)、`src/conv/flow.js` 镜像

**Interfaces:** Consumes Task 1 `kindAssistantStep`;Produces: md 全套规则(后续 .md 走查与 verify 断言依据)。

- [ ] **Step 1: McFlow.css 追加 md 段**(值照原型 L464-481;`var F = MC_MAP.kindAssistantStep;`):

```js
    F + '{font:400 14px/1.8 var(--font-ui);color:var(--mc-fg);word-break:break-word}',
    F + ' h1,' + F + ' h2,' + F + ' h3{font:600 17px/1.4 var(--font-display);letter-spacing:.01em;margin:14px 0 6px}',
    F + ' h2{font-size:15px}',
    F + ' h3{font-size:14px}',
    F + ' p+p{margin-top:8px}',
    F + ' ul,' + F + ' ol{margin:6px 0;padding-left:22px}',
    F + ' li{margin:3px 0}',
    F + ' :not(pre)>code{font:500 12px/1.5 var(--font-code);padding:1px 5px;background:var(--mc-sel-bg);border-radius:var(--mc-r-tag);color:var(--mc-fg)}',
    F + ' pre{margin:8px 0;padding:10px 12px;overflow-x:auto;background:var(--mc-bg-deep);border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card)}',
    F + ' pre code{padding:0;background:none;font:400 12.5px/1.7 var(--font-code)}',
    F + ' table{border-collapse:collapse;margin:8px 0;font:400 12.5px/1.6 var(--font-ui)}',
    F + ' th,' + F + ' td{padding:4px 10px;text-align:left;border:1px solid var(--mc-border-soft)}',
    F + ' th{font:600 12px/1.4 var(--font-display);background:var(--mc-surface-2)}',
    F + ' blockquote{margin:8px 0;padding:2px 12px;color:var(--mc-muted);border-left:2px solid var(--mc-accent-dim)}',
    F + ' a{color:var(--mc-accent)}',
    F + ' input[type="checkbox"]{accent-color:var(--mc-accent)}',
    // 宿主代码块包装(.md-code-block 全局稳定类;banner=首子 div:语言条+复制钮)
    F + ' .md-code-block{background:var(--mc-bg-deep);border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card);overflow:hidden}',
    F + ' .md-code-block pre{margin:0;border:none;border-radius:0}',
    F + ' .md-code-block>div:first-child{display:flex;align-items:center;gap:8px;padding:4px 10px;background:var(--mc-surface-2);border-bottom:1px solid var(--mc-border-soft);font:500 11px/1.4 var(--font-mono);color:var(--mc-muted)}',
    F + ' .md-code-block>div:first-child button{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);background:var(--mc-surface);color:var(--mc-fg)}',
    F + ' .md-code-block>div:first-child button:active{background:var(--mc-fg);color:var(--mc-surface);border-color:var(--mc-fg)}',
    F + ' .md-table-wide{overflow-x:auto}',
```

- [ ] **Step 2: banner 结构微探**(实现时一次):playwright eval dump `.md-code-block` 首子元素 tagName/class,若首子非 div(结构出入)按实况改选择器并在此记录;`>div:first-child` 失配仅丢 banner 样式,不破版。
- [ ] **Step 3: 真实消息验证** —— playwright 打开会话,在 composer 输入 s-md 全要素文本(取 `prototype/macintosh-interactive.html:1016` 的 md 源,去掉外层引号转义)发送;断言(eval):h1 `font-size`≈17px、行内 code `background` 为 rgba(218,218,255,.26)(深色)、pre `background` rgb(31,31,31)、th `background` rgb(74,74,74)。
- [ ] **Step 4: `npm test` + Commit** — `feat(mcx-flow): .md 正文全要素覆写`

### Task 3: 用户气泡(user/steering)+ 变量通道

**Files:** Modify `client.js`(overrideTokens 对象 + McFlow.css)、镜像

**Interfaces:** Consumes `bubbleUser/userGallery/refChip`;Produces: `--dsw-specific-bubble` override(后续撤除演练引用)。

- [ ] **Step 1: overrideTokens 追加一行**(apply 内 override 对象,`--dsw-font-family` 行后):

```js
          '--dsw-specific-bubble': pair('var(--mc-accent)'),
```

- [ ] **Step 2: McFlow.css 追加气泡段**(原型 L483-497):

```js
    MC_MAP.bubbleUser + '{color:var(--mc-accent-ink);border:1px solid var(--mc-border);border-radius:8px;font:400 14px/1.7 var(--font-ui)}',
    MC_MAP.bubbleUser + ':active{border-color:var(--mc-fg)}',
    MC_MAP.userGallery + '{border:1px solid var(--mc-border);border-radius:var(--mc-r-card)}',
    MC_MAP.refChip + '{background:var(--mc-sel-bg);border-radius:var(--mc-r-tag);padding:0 4px;font:500 12px var(--font-mono)}',
    '[data-pending-steering]{outline:1px dashed var(--mc-faint);outline-offset:2px;border-radius:8px}',
```

- [ ] **Step 3: 刷新验证** —— 发一条用户消息,断言气泡 computed `border-radius: 8px`、`color` 为 accent-ink 深色 rgb(31,31,46)、`background-color` rgb(218,218,255)(经变量通道);浅色切月牙再断言 accent 底白字。
- [ ] **Step 4: `npm test` + Commit** — `feat(mcx-flow): 用户气泡与 --dsw-specific-bubble 变量通道`

### Task 4: context/compaction 注入条 + 细长条组 + TurnStatus + unknown + 图标映射

**Files:** Modify `client.js`、`src/conv/flow.js`(MC_FLOW_ICONS + CJS shim);Create `test/flow-icons.test.mjs`

**Interfaces:** Produces: `MC_FLOW_ICONS`(form→icon 名纯数据,kit 与 css 共用)、注入条/细长条全套规则。

- [ ] **Step 1: 写失败测试**(纯数据,`src/conv/flow.js` 需 CJS shim):

```js
// test/flow-icons.test.mjs
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { MC_FLOW_ICONS } = createRequire(import.meta.url)('../src/conv/flow.js');
const FORMS = ['instructions','notice','relay','catalog','snapshot','recall','compaction','manual-compaction'];
const ICONS = ['doc','list','copy','clock'];
test('flow form→icon 映射覆盖全 form 且值合法', () => {
  for (const f of FORMS) assert.ok(MC_FLOW_ICONS[f], 'missing: ' + f);
  for (const v of Object.values(MC_FLOW_ICONS)) assert.ok(ICONS.includes(v), 'bad icon: ' + v);
});
```

`src/conv/flow.js` 头部加(CJS shim 与映射,client.js 内 McFlow 段同源保留映射):

```js
var MC_FLOW_ICONS = { instructions:'doc', notice:'doc', relay:'doc', catalog:'list',
  snapshot:'copy', recall:'clock', compaction:'copy', 'manual-compaction':'copy' };
if (typeof module !== 'undefined') module.exports = { MC_FLOW_ICONS: MC_FLOW_ICONS };
```

- [ ] **Step 2: 跑测试确认失败** — `node --test test/flow-icons.test.mjs` → FAIL(无 export)。
- [ ] **Step 3: 实现 McFlow.css 追加**(原型 L499-504 inject、L538-548 retry/cap;图标经 mask data-URI,svg 内容从 `assets/img/icons/pixelarticons/{doc,list,copy,clock}.svg` 读取后按 client.js `MC_TBOX_*` 同款百分号编码内联):

```js
    // 注入条(context + 双 compaction 同款;kind 行即条壳)
    ':is(' + MC_MAP.kindContext + ',' + MC_MAP.kindCompaction + ',' + MC_MAP.kindManualCompaction + '){display:flex;align-items:flex-start;gap:7px;padding:7px 9px;background:var(--mc-surface-2);border:1px dashed var(--mc-border-soft);border-radius:var(--mc-r-card);font:400 12px/1.7 var(--font-ui);color:var(--mc-muted)}',
    MC_MAP.ctxBody + '{font:400 12px/1.7 var(--font-ui);color:var(--mc-muted);padding-left:22px}',
    // 图标:mask + data-URI(宿主原图标隐藏;:has() 细分 form,Chromium 105+)
    MC_MAP.kindContext + '>:first-child>svg:first-of-type,' + MC_MAP.kindContext + '>svg:first-of-type{display:none}',
    MC_MAP.kindContext + '::before{content:"";flex:none;width:15px;height:15px;margin-top:1px;background-color:var(--mc-faint);-webkit-mask:<DOC_URI> center/contain no-repeat;mask:<DOC_URI> center/contain no-repeat}',
    MC_MAP.kindContext + ':has([data-context-form="catalog"])::before{-webkit-mask-image:<LIST_URI>;mask-image:<LIST_URI>}',
    MC_MAP.kindContext + ':has([data-context-form="snapshot"])::before{-webkit-mask-image:<COPY_URI>;mask-image:<COPY_URI>}',
    MC_MAP.kindContext + ':has([data-context-form="recall"])::before{-webkit-mask-image:<CLOCK_URI>;mask-image:<CLOCK_URI>}',
    // 细长条组(实线 soft 边,非虚线——inject 专属语汇)
    ':is(' + MC_MAP.kindModelRetry + ',' + MC_MAP.kindTurnMaxTokens + ',' + MC_MAP.kindUnknown + '){display:flex;align-items:center;gap:8px;padding:6px 9px;background:var(--mc-surface-2);border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card);font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}',
    MC_MAP.kindModelRetry + '::before{content:"";flex:none;width:6px;height:6px;background:var(--mc-spark);clip-path:polygon(33% 0,67% 0,100% 33%,100% 67%,67% 100%,33% 100%,0 67%,0 33%);animation:mc-pulse 2600ms steps(1,end) infinite;animation-delay:var(--pulse-delay,0ms)}',
    MC_MAP.kindTurnError + '{display:flex;align-items:center;gap:8px;padding:6px 9px;background:var(--mc-surface-2);border-left:2px solid var(--mc-danger);border-radius:var(--mc-r-card);font:400 12px/1.6 var(--font-ui);color:var(--mc-danger)}',
    MC_MAP.kindTurnMaxTokens + '::before{content:"";flex:none;border-left:5px solid var(--mc-faint);border-top:4px solid transparent;border-bottom:4px solid transparent}',
    // TurnStatus(宿主运行中状态行)
    MC_MAP.flowColumn + ' [role="status"]{display:flex;align-items:center;gap:8px;font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}',
    MC_MAP.flowColumn + ' [role="status"]::before{content:"";flex:none;width:6px;height:6px;background:var(--mc-spark);clip-path:polygon(33% 0,67% 0,100% 33%,100% 67%,67% 100%,33% 100%,0 67%,0 33%);animation:mc-pulse 2600ms steps(1,end) infinite;animation-delay:var(--pulse-delay,0ms)}',
```

(`<DOC_URI>` 等 = 内联后的 `url("data:image/svg+xml,…")`;实现时替换。`mc-pulse` keyframes 一期已有。)

- [ ] **Step 4: 跑测试通过** — `node --test test/` 全绿。
- [ ] **Step 5: 刷新验证** —— 找含 system-reminder 的会话断言注入条 `border-style: dashed`、`background` rgb(74,74,74);细长条(有 retry/error 会话则断言,无则 kit 分区补)。
- [ ] **Step 6: Commit** — `feat(mcx-flow): 注入条/细长条/图标映射(mask data-URI)`

### Task 5: reasoning think 卡(静态样式)

**Files:** Modify `client.js`、镜像

**Interfaces:** Consumes `thinkCard`;Produces: think 双态样式(宿主 shimmer 移除,无替代卡面动画——spec §4 行 5)。

- [ ] **Step 1: McFlow.css 追加**(原型 L506-526):

```js
    MC_MAP.thinkCard + '{background:var(--mc-surface-3);border:1px solid var(--mc-border);border-radius:var(--mc-r-card);overflow:hidden;transition:none}',
    MC_MAP.thinkCard + ' *{transition:none!important}',
    MC_MAP.thinkCard + '[data-state="running"]{background:color-mix(in oklab,var(--mc-spark) 9%,var(--mc-surface-3))}',
    MC_MAP.thinkCard + ' [class*="thinkBody"]{font:400 12px/1.8 var(--font-ui);color:var(--mc-muted);white-space:pre-wrap}',
    // 宿主 shimmer 移除(原型 run 态信号=琥珀染;标题染 spark 由行内继承,faint 摘要):
    MC_MAP.thinkCard + '[data-state="running"]::after{content:none}',
    MC_MAP.thinkCard + '[data-state="running"] *::after{animation:none!important}',
```

- [ ] **Step 2: 刷新验证** —— 有 reasoning 的会话(或触发一轮回复)断言 think 卡 `border-radius` 4px、深色 `background` 为 surface-3 与 spark 9% 混合(约 rgb(74-90 区间));运行态存在时断言无 shimmer 动画(computed `animation-name` 非 host 原名)。
- [ ] **Step 3: `npm test` + Commit** — `feat(mcx-flow): reasoning think 卡琥珀染与 shimmer 移除`

### Task 6: turn-tail + command 卡壳

**Files:** Modify `client.js`、镜像

**Interfaces:** Consumes `turnTailBar/kindCommand`。

- [ ] **Step 1: McFlow.css 追加**(原型 L533-536;command 只做壳):

```js
    MC_MAP.turnTailBar + '{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-top:2px;font:500 11px/1.6 var(--font-mono);color:var(--mc-faint)}',
    MC_MAP.turnTailBar + ' button{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);background:var(--mc-surface);color:var(--mc-fg)}',
    MC_MAP.turnTailBar + ' button:active{background:var(--mc-fg);color:var(--mc-surface);border-color:var(--mc-fg)}',
    MC_MAP.kindCommand + ' [data-variant="others"]{background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:var(--mc-r-card);overflow:hidden}',
    MC_MAP.kindCommand + ' [data-variant="others"][data-state="running"]{border-color:var(--mc-spark)}',
    MC_MAP.kindCommand + ' [data-variant="others"][data-state="error"]{border-color:var(--mc-danger)}',
```

- [ ] **Step 2: 刷新验证** —— 任意完整回合断言 turn-tail 钮 20×20、边框 1px;command 卡(有则断言,无则记录「待 goal 周期回验」)。
- [ ] **Step 3: `npm test` + Commit** — `feat(mcx-flow): turn-tail 操作条与 command 卡壳`

### Task 7: MutationObserver 出场三拍 + 相位同步管道

**Files:** Modify `client.js`(McFlow.mount 实装)、镜像

**Interfaces:** Consumes: `CLOCK.next/syncAnim/PULSE/SWEEP`(一期)、mcfx ghost/flash 类;Produces: `McFlow.mount` 返回 teardown(disconnect)。

- [ ] **Step 1: mount 实现**(替换骨架占位;flowColumn 可能晚于 apply 出现,CLOCK 轮询挂载):

```js
  mount: function (ctx) {
    if (typeof MutationObserver === 'undefined') return null;
    var REDUCED = false;
    try { REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var SYNC = [
      [MC_MAP.kindModelRetry, '--pulse-delay', CLOCK.PULSE],
      [MC_MAP.flowColumn + ' [role="status"]', '--pulse-delay', CLOCK.PULSE],
    ];
    var mo = null, tries = 0, timer = null;
    var seen = new WeakSet();
    function syncEl(el) {
      for (var i = 0; i < SYNC.length; i++) { try {
        if (el.matches(SYNC[i][0])) CLOCK.syncAnim(el, SYNC[i][2], SYNC[i][1]);
        var qs = el.querySelectorAll(SYNC[i][0]);
        for (var j = 0; j < qs.length; j++) CLOCK.syncAnim(qs[j], SYNC[i][2], SYNC[i][1]);
      } catch (e) {} }
    }
    function enterFlash(el) { // 三拍:ghost→flash→撤(无 show 回调变体)
      try { el.classList.add('mc-ghost'); } catch (e) { return; }
      CLOCK.next(function () { try {
        if (!el.isConnected) return;
        el.classList.remove('mc-ghost'); el.classList.add('mc-flash');
        CLOCK.next(function () { try { el.classList.remove('mc-flash'); } catch (e) {} }, 100);
      } catch (e) {} }, 100);
    }
    function enter(node) {
      if (!(node instanceof Element)) return;
      var items = node.matches(MC_MAP.flowItem) ? [node] : [];
      try { var q = node.querySelectorAll(MC_MAP.flowItem); for (var i = 0; i < q.length; i++) items.push(q[i]); } catch (e) {}
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (seen.has(it)) continue; seen.add(it);
        syncEl(it);
        if (!REDUCED) enterFlash(it);
      }
    }
    function attach(root) {
      try { // 存量行标记不闪(历史加载)
        var q = root.querySelectorAll(MC_MAP.flowItem); for (var i = 0; i < q.length; i++) seen.add(q[i]);
      } catch (e) {}
      mo = new MutationObserver(function (muts) {
        try { for (var i = 0; i < muts.length; i++) for (var j = 0; j < muts[i].addedNodes.length; j++) enter(muts[i].addedNodes[j]); } catch (e) {}
      });
      mo.observe(root, { childList: true, subtree: true });
    }
    timer = CLOCK.next(function poll() { // flowColumn 晚挂载轮询(最多 ~8s)
      tries++;
      var root = null; try { root = document.querySelector(MC_MAP.flowColumn); } catch (e) {}
      if (root) { attach(root); return; }
      if (tries < 20) timer = CLOCK.next(poll, 400);
    }, 400);
    return function teardown() {
      try { if (mo) mo.disconnect(); } catch (e) {}
      try { if (timer) CLOCK.clear(timer); } catch (e) {}
    };
  },
```

(注:`CLOCK.clear(id)` 若一期 CLOCK 无此 API,以「timer 句柄 + dispose 时忽略」方式适配——实装时核对 `src/core/clock.js`,缺则在 CLOCK 补 `clear` 并同步镜像;此处为唯一允许动 core 的口子。)

- [ ] **Step 2: 刷新验证** —— 会话中发新消息,300ms 窗口内 eval `document.querySelector('[data-chat-flow-kind="user"]').className` 含 `mc-flash`/`mc-ghost`(时序敏感,重试 3 次);存量行无闪烁类;`[role="status"]` 行 computed `--pulse-delay` 为负值。
- [ ] **Step 3: `npm test` + Commit** — `feat(mcx-flow): observer 出场三拍与 pulse 相位同步`

### Task 8: kit 会话流分区 + 五帧状态机演示

**Files:** Modify `client.js`(McKit 组件树 + 五帧 mini 驱动)、镜像同步说明段

**Interfaces:** Consumes: 一期 kit 结构(`kit-scrim/kit-panel/kit-body/kit-h` 类、`h = React.createElement` 闭包)、`CLOCK/tokenize/esc`;Produces: kit「会话流」分区(走查并排比对件)。

- [ ] **Step 1: 五帧 mini 驱动 + 分区实现**(McKit 渲染函数内,sprite/原语区后追加 section;演示数据为静态字面量):

```js
// 五帧驱动状态(组件 useState/useRef 经 React 闭包;PER_TICK=28、帧 B 白块、帧 A 揭开、顿拍 3)
// 结构:reasoning.run.open 卡(r-tag "Think" + r-sum(s-in 摘要) + r-dur "streaming") + r-txt 正文;
// 「▶ 播放流式」按钮:tokenize(DEMO_TXT) 每 500ms 一周期,CLOCK.next 驱动帧 B/帧 A;
// 「■ 收尾」按钮:finishThinking 语义(摘 s-in 前 26 字、r-dur 写 "1.8s"、撤 run)。
// tokenize 移植自 prototype/macintosh-interactive.html(CJK 一字一词、数字/拉丁连续段、单符号)。
```

组件代码量约 90 行(ReasoningDemo 组件 + tokenize 副本),DOM 结构照原型 L1803-1825(`reasoning.run.open`/`reasoning-head`/`r-tag`/`r-sum`/`s-in`/`r-dur`/`reasoning-body`/`r-txt`)、inject 四型照 L1782-1797(`inject`/svg `#i-doc`/`#i-px-copy`/`#i-px-attach`/`i-tt`)、气泡照 L1770-1776(`msg user`/`attach ph cap bubble`)、turn-tail/retry/cap 照 L1828-1840。分区标题「会话流」,样式类复用主题类 + `kit-` 布局前缀。实装时从 prototype 对应行直抄 DOM,文案用演示字面量(经 esc)。

- [ ] **Step 2: 刷新验证** —— `__MC_KIT_OPEN__ = true` 打开 kit:与 `prototype/macintosh-workspace.html` §5 kit-band(L1760-1840)并排目视比对(md 全要素/气泡/四型/双帧/尾部行);点「▶ 播放流式」断言 s-in 文本变化 + `.cover` 白块出现后消失(轮询 eval);点「■ 收尾」断言 run 类撤除。
- [ ] **Step 3: `npm test` + Commit** — `feat(mcx-flow): kit 会话流分区与五帧流式演示`

### Task 9: verify 门禁 + 失配演练

**Files:** Create `tools/verify-flow.mjs`;Modify `tools/verify-persistent.mjs`;`package.json`(devDependencies.playwright)

**Interfaces:** Consumes: Tasks 1-7 全部样式;Produces: 门禁脚本(收尾终验跑)。

- [ ] **Step 1: 装 playwright** — `pnpm add -D playwright && npx playwright install chromium`(本机首次)。
- [ ] **Step 2: 写 verify-flow.mjs**(结构照 verify-persistent:launch chromium → goto 127.0.0.1:3080 → 断言集 → 退出码):断言 = Task 2/3/4/5 各 Step 的 computed style 断言脚本化(气泡 radius 8/accent 底、md h1 17px/pre bg-deep/th surface-2、注入条 dashed、think 卡 r-card;深色一遍 + 点月牙切浅色再断言 accent/sel-bg 反转)+ 发送 s-md 消息驱动。s-md 文本作为脚本内字面量常量。
- [ ] **Step 3: verify-persistent.mjs 扩容** — 追加:flowColumn gap 14、气泡 accent、注入条存在性(任一 system-reminder 会话)三断言 + 既有重载持久段复跑。
- [ ] **Step 4: 失配演练** — 临时把 MC_MAP.kindUser 改为 `'[data-chat-flow-kind="nope"]'` → 刷新 → 断言气泡回退宿主样式(border-radius ≈ 22px、无 accent 底)→ **改回** → 刷新复验;演练结论记入 commit message。
- [ ] **Step 5: 双 verify GREEN + Commit** — `test(mcx-flow): verify 门禁与失配降级演练`

### Task 10: 浅色 QA + 走查 + 文档收尾 + 终验

**Files:** Modify `README.md`、`prototype/component-dev-notes.md`(§8 注记)、二期待办清单(plan 文件 L279)

- [ ] **Step 1: 浅色 QA 专项** —— playwright 切浅色(点月牙钮)逐组件截图(`shots/flow-light-*.png`):气泡白底黑线、md 代码块白底黑边、注入条浅虚线、think 卡浅琥珀;与 workspace 原型浅色形态并排核对;异常项当场修(计入本任务 commit)。
- [ ] **Step 2: 走查清单**(笔记 §13 裁剪):grep 新增 css 无 `:hover`/`transition:`(audit 已含)、延时无裸 setTimeout(audit)、`--pulse-delay` 负延迟生效(Task 7 已证)、reduced-motion(模拟媒体查询跑一次 kit)、动态文本经 esc(kit 文案)。
- [ ] **Step 3: README 更新** —— 「开发」节更正:改 client.js **刷新即生效**(link 安装实测),删除「必须重启宿主」结论;重启仅限清单级变更;kit 分区说明补「会话流」。
- [ ] **Step 4: 注记回写** —— component-dev-notes §8 追加「flow 落地差异」段(banner 结构位、:has() form 图标、TurnStatus 宿主特有件、command 壳待 toolcard 细化);二期待办 L279 flow 行标注完成。
- [ ] **Step 5: 终验** — `npm test` + `node tools/verify-flow.mjs` + `node tools/verify-persistent.mjs` 全 GREEN;向用户演示:真实会话流 + kit 五帧演示 + 深浅切换 + 失配降级说明。
- [ ] **Step 6: Commit** — `docs(mcx-flow): 浅色 QA/走查/README dev 循环更正`

---

## Self-Review 结论

- **Spec 覆盖**:§1 架构(Task 1)、§2 映射表(Task 1)、§3 动画管道(Task 7 + Task 4 pulse 行)、§4 组件 1-11(Task 1/2/3/4/5/6 + Task 4 TurnStatus/unknown)、§5 dev 已由 spike 定案(README 更正在 Task 10)、§6 kit(Task 8)、§7 错误处理(Task 7 isConnected/try-catch + Task 9 失配演练)、§8 测试验收(Task 4 单测 + Task 9 门禁 + Task 10 QA/走查/终验)。无缺口。
- **占位符**:Task 4 `<DOC_URI>` 等四处为显式待内联常量(svg 文件路径与编码模式均已指定,非 TBD);Task 8 五帧驱动以结构+行为规格给出(90 行 DOM 照原型行号直抄,源行已指明);无其它占位。
- **类型一致**:MC_MAP 键名、`MC_FLOW_ICONS`、`McFlow = {css, mount}`、`CLOCK.next/syncAnim/PULSE/SWEEP/clear`(clear 缺口已注明补齐路径)、kit 类名沿一期。
- **顺序依赖**:Task 1 是全部前置;Task 2-6 相互独立可并行;Task 7 依赖 4(SYNC 引用 kindModelRetry);Task 8 依赖 5(演示卡样式);Task 9/10 收尾。

---

## 验收二轮待办(2026-08-31)—— ✅ 2026-09 已全部完成并复验

**状态**:9 项修复已全部实现于 683b765(与存档同 commit 落码,含 acc2-01~09 全套截图证据与 tools/acc2-check1~3.mjs 检查脚本);2026-09 复验:`npm test` 全绿 + `tools/acc2-recheck.mjs` 活体断言全过 + 关键截图视觉复核(复验截图已刷新入库)。原恢复动作(派单实施/复审)不再需要,直接进 finishing。

1. **注入条图标**:instructions/notice/relay 换 sprite `#i-doc` 经典款(从 client.js McSprite 段提取 symbol 做 data-URI mask;现用 pixelarticons doc 与原型不符);catalog/snapshot/recall/compaction 保持。
2. **think 摘要行 flash 白块未渲染**:`.mc-line-flash` 类出现但视觉无白块——live debug(疑 inline 定位/React 节点替换),修到截图可见(深白浅黑)。
3. **think running 诡异渐变**:`animation:none` 只停动画,宿主渐变元素静态残留——探明来源 `background:none` 清除。
4. **turn-tail 产物行**(dsh-client-ui-deliverables):column root 下不靠左——探明结构对齐之。
5. **context 行宿主 hover 箭头占位**(图标与文本间距大):探明位置 `display:none` + 收间距;think/retry 同款占位一并清。
6. **折叠卡开合四拍 flash**(spec §3 已修订):click 捕获委托于 flowColumn,命中 think/context/model-retry/compaction 卡头 → 卡壳 mcfx 四拍(CLOCK 100ms/拍,REDUCED 跳过,dataset.busy 防重入,卡需 position:relative)。
7. **think 箭头像素化**:参考侧栏折叠面板三角形实现(T10 换锚后的像素 mask,client.js McFinder/McSidebar 段),复用同款;宿主 chevron 残留一并清。
8. **retry 图标闪烁门控**:pulse 无条件挂——探明 active 态锚(data-active/当前 attempt)限定之。
9. **retry 双图标去重**:藏宿主时钟图标,只留我方八角点(8 门控后)。

建议实施序:⑤①⑦⑨⑧③④ 纯样式先行,②⑥ 压轴(需 live 回合)。验证:每项截图 shots/acc2-*.png + `npm test` 全绿 + commit `fix(mcx-flow): 验收二轮九项…`。

**其余未决(合并前)**:finishing 菜单三选一(本地合 main / PR / 保留分支)——用户尚未选。工具清理批(audit longhand/MO 批级 catch/teardown 三拍/脚本对照/make-persistent-client mods 缺 McFlow/dist 快照旧版)归待办 #11 一并议。
