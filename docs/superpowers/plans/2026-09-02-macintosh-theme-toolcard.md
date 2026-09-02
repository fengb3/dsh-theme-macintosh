# Macintosh 主题 · 工具卡（toolcard 批：tool-call 槽重绘）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development 或
> executing-plans，逐任务实施。Steps 用 checkbox 跟踪。
> **Spec:** `docs/superpowers/specs/2026-09-02-macintosh-theme-toolcard-design.md`（同行；
> 勘定依据已在 spec §0 全量记录，无需另立 recon）。
> 原型基准：workspace CSS §7（L705-763）+ kit §7（L2119-2445）+ 笔记 §10。
> 纪律沿用：plain JS（src 顶层声明，禁 import/TS/JSX）；原生构造器 `window.*`；
> 禁裸 setTimeout（CLOCK.next）；动态文本 `esc2`；无 :hover/transition；
> 每任务 `npm test` 全绿后一 commit；改 `src/**` → 重建
> （`node tools/assemble.mjs && node tools/make-persistent-client.mjs`），client.js 为
> 生成物不手改；活体验收归用户（多会话规则）；**探针/门禁是实现期动作**。

## File Structure

```
src/conv/tool.js                新模块镜像：纯函数(mcToolState/mcToolName/mcToolIconName/
                                mcToolArgsSummary/mcViewCard/mcOutputText + 五类 narrowing)
                                + McToolTree/McToolBranch/McToolCard 组件 + MC_TOOL_ICONS
                                + CSS 段 + CJS shim 出口
client.js                       重建产物（McTool 段落位 McSysCard 后 McMenus 前；不手改）
src/assemble.input.js           ORDER/MODULE_MAP 加 McTool
tools/make-persistent-client.mjs 模板 mods/order + marks 清单加 McTool
test/tool.test.mjs              纯函数测试（新建，TDD 先行）
tools/audit.mjs                 tool 段特征片段进白名单反查
src/kit.js                      kit「工具卡」分区（六组样本 + 状态三帧演示）
tools/verify-toolcard.mjs       活体门禁（新建）
prototype/component-dev-notes.md §8.11 工具卡落地差异注记（收尾）
README.md                       工具行补 verify-toolcard（收尾）
dist/client-body.js + client.js 重建产物（不手改）
```

---

### Task 1: 纯函数 TDD——state/name/icon/argsSummary/viewCard/outputText

**Files:** `test/tool.test.mjs`（先写失败测试）、`src/conv/tool.js`（实现 + shim 出口）

- [x] **Step 1: 失败测试**——四态推导（running/ok/error/stopped=interrupted）；name 兜底链
      （call?.name → name → callId）；图标全表（bash→terminal、read→doc、write→floppy、
      edit→edit、grep→search、glob→folder、web_search→search、web_fetch→ext、
      todo_write→list、ask_user_question→balloon、spawn_subagent→suitcase、
      workflow→timeline、ralph→reload、job→clock、goal→goal；`mcp__` 前缀→zap；
      error 态换 warning；未知→dots）；argsSummary（path/pattern/command/query 白名单键、
      60 字符截断、argsRaw 单行化兜底、callId 末兜底）；mcViewCard 五类 narrowing
      （terminal/diff/read/search/web 正形 → card 对象；未知 card 值/坏载荷 → null）；
      mcOutputText（text 块连缀、20000 截断）。
- [x] **Step 2:** `node --test test/tool.test.mjs` 确认 FAIL（无 export）。
- [x] **Step 3:** 实现（src/conv/tool.js 纯函数区 + MC_TOOL_ICONS 表；shim 出口全导出；
      narrowing 谓词照官方 isValidFiles/narrowDiffs 防御式）。
- [x] **Step 4:** `npm test` 全绿 → Commit `feat(mc-tool): 工具卡纯函数(state/icon/args/view卡面/output)`

### Task 2: McTool 组件——遮蔽 tool-call 槽重绘（壳/三态/开合/子调用）

**Files:** `src/conv/tool.js`（组件区 + CSS 段 + 注册挂点）、`src/assemble.input.js`、
`tools/make-persistent-client.mjs`、`tools/audit.mjs`

- [x] **Step 1: CSS 段**（原型 L705-763 直抄换 token；全挂 `.mc-tool*` 自有类；pill 复用
      一期；扫掠 keyframes 复用 mc-sweep；子调用缩进 22px/软线）。
- [x] **Step 2: 组件**——`McToolTree`（node.data.root → McToolBranch）；
      `McToolBranch`（McToolCard + subCalls 递归 .mc-subcalls）；
      `McToolCard`（头：26×26 图标格 mask data-URI + t-name/t-args 双行 + pill + 三角；
      体：mcViewCard 命中 → primitives Block（TerminalBlock/DiffBlock/ReadBlock/
      SearchBlock/WebBlock）保真；未命中 → JsonBlock(argsRaw) + mcOutputText 文本；
      error 首行红显）。状态：useState(running 默认开) + 变迁自动收起 useEffect；
      开合 accToggle 四拍；出场 flashIn；running 头 syncAnim('--sweep-delay')。
      PRIM 缺席 → 注册函数整体 no-op（官方兜底）。
- [x] **Step 3: 注册**——`S.inject('conversation.chat.node', register({key:'tool-call',
      priority:-1}))`（McSysCard 注册区同款守卫）；mods/order 加 McTool；assemble.input/
      make-persistent 同步；audit.mjs tool 段特征（'mc-tool' 类前缀）入白名单反查。
- [x] **Step 4: 装配重建**——`node tools/assemble.mjs && node tools/make-persistent-client.mjs`；
      git diff 核对 client.js 变更仅 tool 段。
- [x] **Step 5:** `npm test` 全绿 → Commit `feat(mc-tool): tool-call 槽遮蔽重绘——壳/三态/开合/子调用`

### Task 3: 活体冒烟 + 失配演练

**Files:** 无新增（浏览器刷新验证）

- [x] **Step 1: 刷新冒烟**——本会话（工具卡密集）刷新：卡壳 Macintosh 化、running 卡
      （如有）扫掠、done/fail pill、子调用缩进树、点开合四拍闪、官方卡不再出现。
- [x] **Step 2: 失配演练**——临时破坏 MC_PRIM require（模拟缺席）→ 刷新 → 官方 ToolRow
      照常（回退不破版）→ 还原。
- [x] **Step 3: 深浅两遍**——月牙切换逐区核对（卡壳/图标格/pill/扫掠/子调用）。
- [x] **Step 4:** Commit `test(mc-tool): 活体冒烟与失配演练记录`（若演练发现问题，修复
      并计入本 commit）。

### Task 4: kit 分区 + 门禁 + 注记收尾

**Files:** `src/kit.js`、`tools/verify-toolcard.mjs`、`prototype/component-dev-notes.md`、`README.md`

- [x] **Step 1: kit「工具卡」分区**——六组静态样本（文件操作/执行与后台/委派与编排/
      目标与规划/检索与 MCP/未知兜底，DOM 照 kit §7 帧抄换 .mc-tool 类）+ 状态三帧
      循环演示（单卡 running→ok→error，CLOCK 驱动，演示字面量经 esc）。
- [x] **Step 2: verify-toolcard.mjs**——活体断言：卡壳在场性 + 边框 1px/圆角/字体断言 +
      子调用缩进（遇子调用卡时）+ 深浅两遍 + 页面 error 监听零异常 + 拔演练断言
      （MC_PRIM 缺席 → `[data-variant]` 官方行回归）。→ `node tools/verify-toolcard.mjs` GREEN。
- [x] **Step 3: 注记回写**——笔记 §8.11（tool-call 槽勘定实况/重绘裁定/内容块复用面/
      已知限制 inspect·openFile）；README 工具行补 verify-toolcard。
- [x] **Step 4:** `npm test` 全绿 → Commit `test(mc-tool): 门禁/kit/注记收尾`
- [x] **Step 5: 汇报用户**——工具卡已重绘上线；活体验收（多会话：工具密集会话/
      空会话/历史会话/切回）由用户发起。

---

## Self-Review 结论

- **Spec 覆盖**：§0 勘定（已入 spec，无 Task 依赖）；§1 裁定 1-2（Task 2 组件/壳）、3-4
  （Task 2 三态/开合）、5-7（Task 1 图标/摘要 + Task 2 内容体）、8（Task 2 子调用）、
  10（纪律沿用）、11（Task 4 kit）、12（Task 4 门禁）。无缺口。
- **占位符**：无 TBD；图标表/白名单键/截断上限均为显式字面量。
- **类型一致**：`mcToolState/mcToolName/mcToolIconName/mcToolArgsSummary/mcViewCard/
  mcOutputText`、`McToolTree/McToolBranch/McToolCard`、`.mc-tool*` 类名各任务一致。
- **顺序依赖**：Task 1 先行（组件消费全部纯函数）；Task 2 依赖 1；Task 3 依赖 2（重建
  后才可活体）；Task 4 收尾。Task 2/4 的 kit、门禁段相互独立。

---

## 收尾实录（2026-09-02）

- Task 1 纯函数 61/61 + audit 绿（commit fd2b8a9）。真 bug 两枚：白名单扁平序 path 抢 pattern
  （改按名优先键表）；空形参 '{}' 误当摘要（加 raw 有用性判断）。web_search 实际键 = `queries`
  数组（取首两个 ' / ' 连接）。
- Task 2 重绘 + 装配（commit 86cf38f）。audit 首跑 FAIL：自有 CSS 的 `[data-state=…]` 撞
  audit 宿主选择器特征清单（官方 DOM 有 data-state 属性）→ 三态改类驱动（.mc-run/.mc-fail）。
- Task 3 活体（commit 105eaf7）：SMOKE GREEN（搜索胡锡进会话 6 卡：官方行 0/边框圆角硬投影/
  queries 摘要/开合 0→324px/深浅两遍/零 pageerror）。拔演练 PASS（require 破坏 → mcTool=0、
  官方 6 行回归、其余 19 节点无恙）。浅色 WebBlock 黑底修复（宿主硬编码深色 → mc-tbb-web 类
  浅色翻白）。子调用缩进本会话窗口无样本（verify 合法跳过；dsh-theme-macintosh 会话 42 卡可验）。
- Task 4 kit 分区走 MC_TOOL_DEMO 桥真卡渲染；TDZ 一枚（slots 体 inject 在 L173 触发渲染早于
  const 初始化）→ 演示块 const 上移 McKitPage 之前。verify-toolcard GREEN（17 断言）。
- 全套证据：shots/toolcard-smoke-{dark,dark-card,light-card,light-card2}.png /
  toolcard-kit-section.png / toolcard-verify-{dark,light}.png。
- 遗留：子调用缩进的实会话断言（遇子调用卡时断，verify 内条件断言已备）；活体验收归用户
  （多会话规则：工具密集/空会话/历史会话/切回）。
## 用户裁定补丁（2026-09-02 二轮，四条全落地）

1. **首登场一律折叠**：`useState(false)`（原 running 默认展开撤销）。
2. **落地不改折叠态**：删除 running→settle 自动收起 useEffect（用户手动展开的卡完成后保持展开）。
3. **展开体直角 + 像素字体**：`.mc-tb-in,.mc-tb-in *{border-radius:0!important;font-family:var(--font-code)!important}`
   （宿主块圆角/dsw 字族压平；.mc-tb-out 圆角移除）。
4. **展开体内折叠面板闪烁**：卡体 `onClickCapture` 委托，命中 `[data-expandable],[aria-expanded]`
   （DisclosureRow 系真实钩子，部署包类型面核验）；捕获阶段读 pre-click 方向 → `CLOCK.next(100)`
   补 `flashIn`（展开）/`flashOut`（收起）；宿主自身切换不拦截，REDUCED 不挂。
- 验证：npm test 61/61 + audit 绿；verify-toolcard GREEN（新增裁定断言：全部首登折叠/展开体
  直角化 tb·inner·block 全 0px/像素字体 Fusion Pixel 压平）。
- 待活体：面板闪烁的实会话观察（当前窗口无 DisclosureRow 折叠面板样本，归用户活体验收)。
## 用户裁定补丁（2026-09-02 三轮，两条）

1. **IN 按钮闪烁补漏**：JsonBlock 的 IN 钮是裸 `button`（无 aria-expanded/data-expandable，
   方向读 ▸/▾ 文案前缀）——首轮委托选择器 `[data-expandable],[aria-expanded]` 漏网。
   修：委托扩 `button` + `mcPanelOpen` 方向判定（aria-expanded → data-state → ▸/▾ → false）。
2. **图标全换 DSH 默认 + 像素渲染**：mcToolIconName 语义表退役，改 `mcToolVariant`
   （官方 TOOL_VARIANTS 照抄，余→others）；图标组件 = primitives 七只 outline 图标
   （VARIANT_ICONS 同源）；leading 照抄 leadingFor（error→StateDot error/stopped→warning）；
   像素渲染 = `.mc-t-ic svg{shape-rendering:crispEdges}`。
- 验证：npm test 61/61 + audit 绿（variant 测试改写）；verify-toolcard GREEN 25 断言
  （新增：图标 svg+crispedges、IN 钮点击 flash 闪类轮询命中）。commit 后 push。
## 用户裁定补丁（2026-09-02 四轮：IN 闪打内容不打钮）

- 闪类从 JsonBlock 根容器改为「内容部分」= head 下一兄弟（pre.body）——IN 裸钮本身不再闪；
  收起方向在捕获期先存 preContent 再调度；展开方向 click 后取 head.nextElementSibling。
- 调用维持现成 flashIn/flashOut（出现/消失语义）。
- 坑实录：`CLOCK.next(fn)` 缺省 ms → NaN 调度（`Date.now()+undefined`）回调永不触发——
  显式传 0。verify-toolcard GREEN（新增断言：闪类命中元素非 BUTTON 且为 button 兄弟）。
## audit 补账（2026-09-02，收尾后复跑发现）

- npm test 复跑曝出 audit FAIL：二轮裁定的 `closest('[data-expandable],[aria-expanded],button')`
  读态钩子含 MC_MAP 特征片段 `[aria-expanded]`（map.js 会话树行选择器自动提取），且产物 tool 段
  同步命中（distNoMap/clientNoMap 无 tool 跨度豁免）。
- 根因：计划 Task 2 Step 3 的「audit.mjs tool 段特征入白名单反查」实际未落地——toolcard 批
  零次改 audit.mjs，收尾记录「audit 绿」只对四轮之前的代码成立。
- 补：照 dock/finder 段先例加 tool 段白名单反查（`TOOL_WHITELIST={'[aria-expanded]'}`——纯读态
  行为钩子非样式选择器；样式仍全走 .mc-* 自有类，data-state 三态早已裁改类驱动）+ 主循环豁免
  tool.js + distNoMap/clientNoMap 补 tool 跨度。npm test 全绿（53 片段核验）。