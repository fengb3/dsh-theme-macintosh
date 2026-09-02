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

- [ ] **Step 1: 失败测试**——四态推导（running/ok/error/stopped=interrupted）；name 兜底链
      （call?.name → name → callId）；图标全表（bash→terminal、read→doc、write→floppy、
      edit→edit、grep→search、glob→folder、web_search→search、web_fetch→ext、
      todo_write→list、ask_user_question→balloon、spawn_subagent→suitcase、
      workflow→timeline、ralph→reload、job→clock、goal→goal；`mcp__` 前缀→zap；
      error 态换 warning；未知→dots）；argsSummary（path/pattern/command/query 白名单键、
      60 字符截断、argsRaw 单行化兜底、callId 末兜底）；mcViewCard 五类 narrowing
      （terminal/diff/read/search/web 正形 → card 对象；未知 card 值/坏载荷 → null）；
      mcOutputText（text 块连缀、20000 截断）。
- [ ] **Step 2:** `node --test test/tool.test.mjs` 确认 FAIL（无 export）。
- [ ] **Step 3:** 实现（src/conv/tool.js 纯函数区 + MC_TOOL_ICONS 表；shim 出口全导出；
      narrowing 谓词照官方 isValidFiles/narrowDiffs 防御式）。
- [ ] **Step 4:** `npm test` 全绿 → Commit `feat(mc-tool): 工具卡纯函数(state/icon/args/view卡面/output)`

### Task 2: McTool 组件——遮蔽 tool-call 槽重绘（壳/三态/开合/子调用）

**Files:** `src/conv/tool.js`（组件区 + CSS 段 + 注册挂点）、`src/assemble.input.js`、
`tools/make-persistent-client.mjs`、`tools/audit.mjs`

- [ ] **Step 1: CSS 段**（原型 L705-763 直抄换 token；全挂 `.mc-tool*` 自有类；pill 复用
      一期；扫掠 keyframes 复用 mc-sweep；子调用缩进 22px/软线）。
- [ ] **Step 2: 组件**——`McToolTree`（node.data.root → McToolBranch）；
      `McToolBranch`（McToolCard + subCalls 递归 .mc-subcalls）；
      `McToolCard`（头：26×26 图标格 mask data-URI + t-name/t-args 双行 + pill + 三角；
      体：mcViewCard 命中 → primitives Block（TerminalBlock/DiffBlock/ReadBlock/
      SearchBlock/WebBlock）保真；未命中 → JsonBlock(argsRaw) + mcOutputText 文本；
      error 首行红显）。状态：useState(running 默认开) + 变迁自动收起 useEffect；
      开合 accToggle 四拍；出场 flashIn；running 头 syncAnim('--sweep-delay')。
      PRIM 缺席 → 注册函数整体 no-op（官方兜底）。
- [ ] **Step 3: 注册**——`S.inject('conversation.chat.node', register({key:'tool-call',
      priority:-1}))`（McSysCard 注册区同款守卫）；mods/order 加 McTool；assemble.input/
      make-persistent 同步；audit.mjs tool 段特征（'mc-tool' 类前缀）入白名单反查。
- [ ] **Step 4: 装配重建**——`node tools/assemble.mjs && node tools/make-persistent-client.mjs`；
      git diff 核对 client.js 变更仅 tool 段。
- [ ] **Step 5:** `npm test` 全绿 → Commit `feat(mc-tool): tool-call 槽遮蔽重绘——壳/三态/开合/子调用`

### Task 3: 活体冒烟 + 失配演练

**Files:** 无新增（浏览器刷新验证）

- [ ] **Step 1: 刷新冒烟**——本会话（工具卡密集）刷新：卡壳 Macintosh 化、running 卡
      （如有）扫掠、done/fail pill、子调用缩进树、点开合四拍闪、官方卡不再出现。
- [ ] **Step 2: 失配演练**——临时破坏 MC_PRIM require（模拟缺席）→ 刷新 → 官方 ToolRow
      照常（回退不破版）→ 还原。
- [ ] **Step 3: 深浅两遍**——月牙切换逐区核对（卡壳/图标格/pill/扫掠/子调用）。
- [ ] **Step 4:** Commit `test(mc-tool): 活体冒烟与失配演练记录`（若演练发现问题，修复
      并计入本 commit）。

### Task 4: kit 分区 + 门禁 + 注记收尾

**Files:** `src/kit.js`、`tools/verify-toolcard.mjs`、`prototype/component-dev-notes.md`、`README.md`

- [ ] **Step 1: kit「工具卡」分区**——六组静态样本（文件操作/执行与后台/委派与编排/
      目标与规划/检索与 MCP/未知兜底，DOM 照 kit §7 帧抄换 .mc-tool 类）+ 状态三帧
      循环演示（单卡 running→ok→error，CLOCK 驱动，演示字面量经 esc）。
- [ ] **Step 2: verify-toolcard.mjs**——活体断言：卡壳在场性 + 边框 1px/圆角/字体断言 +
      子调用缩进（遇子调用卡时）+ 深浅两遍 + 页面 error 监听零异常 + 拔演练断言
      （MC_PRIM 缺席 → `[data-variant]` 官方行回归）。→ `node tools/verify-toolcard.mjs` GREEN。
- [ ] **Step 3: 注记回写**——笔记 §8.11（tool-call 槽勘定实况/重绘裁定/内容块复用面/
      已知限制 inspect·openFile）；README 工具行补 verify-toolcard。
- [ ] **Step 4:** `npm test` 全绿 → Commit `test(mc-tool): 门禁/kit/注记收尾`
- [ ] **Step 5: 汇报用户**——工具卡已重绘上线；活体验收（多会话：工具密集会话/
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
