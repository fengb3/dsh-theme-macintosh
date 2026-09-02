# Macintosh 主题 · 工具卡（toolcard 批：tool-call 槽重绘）Design Spec

> 依据（部署包直读勘定，2026-09-02，host 0.1.1-rc.2，本地安装包与运行宿主同版本）：
> `@deepseek-ai/dsh-client-ui-tool`（ToolCallTree/ToolRow/GenericToolCard/keyed 注册表）、
> `@deepseek-ai/dsh-client-ui-conversation`（ChatNodeSeat keyed 派发）、
> `@deepseek-ai/dsh-client-runtime`（ToolCallBlock/ToolResultNode 形状）、
> `@deepseek-ai/dsh-tools/lib/types/presentation.d.ts`（ToolCallView/ToolResultView 词表）、
> `@deepseek-ai/dsh-client-ui-primitives` 类型面（内容块导出清单）。
> 原型基准：`prototype/macintosh-workspace.html` CSS §7（L705-763）+ kit §7 陈列（L2119-2445）；
> 行为规范 `prototype/component-dev-notes.md` §10。
> 二期待办出处：一期 plan「二期待办」第 4 条。

## 0. 勘定结论（GO 依据）

1. **挂载点是一颗 keyed 键**：工具卡不是独立 DOM 皮——`conversation.chat.node` keyed 槽的
   **`tool-call`** kind → `dsh-client-ui-tool` 注册的 `ToolCallTree`（`children` 声明内嵌
   `tool.call.toolview` keyed 子槽）。遮蔽这一颗键（priority:-1，McThink/McSysCard 同款
   `S.inject` 守卫先例）即整体接管会话内全部工具卡（根卡 + 子调用树）。
2. **官方行数据形状**（runtime `ToolCallBlock = RunningToolCall | ToolResultNode`）：
   - 运行形（无 `kind`）：`{ callId, name, argsRaw, callView, subCalls }`；
   - 落地形：`{ kind:'tool-result', callId, call:{name,argsRaw}|null, callTime, time,
     content, isError, error?, callView, resultView, subCalls }`；
   - `call` 为 null（窗口截断）时卡头以 callId 兜底（官方注释明示同款行为）。
3. **官方 state 推导**（照抄为纯函数）：`!done → running`；`error?.code==='interrupted' →
   stopped`；`isError → error`；否则 `ok`。四态全绿。
4. **结构化卡面材料挂在 wire view 上**：`callView/resultView.card ∈ 'generic'|'terminal'|
   'diff'|'read'|'search'|'web'`，载荷（`diffs[]`/`files[]`/`lines[]` 等）随 view 携带；
   官方 card models 只是「narrowing + 缺陷防御」薄层。我们可同法自建轻量纯函数。
5. **内容块组件全在 primitives 导出面**：`TerminalBlock / DiffBlock / ReadBlock /
   SearchBlock / WebBlock / CodeBlock / JsonBlock / StateDot / DisclosureRow`——
   重绘壳内复用宿主块保真内容（think 批 `MC_PRIM` require 守卫先例）。
6. **官方 keyed 子槽按精确工具名派发**（bash/read/edit/write/grep/glob/web_search/
   web_fetch/todo_write/ask_user_question 有专用行；其余走 GenericToolCard 兜底），
   无通配键 → mcp__* 开放集合无法逐名接管，**逐名遮蔽路线否决**，改遮蔽父级 `tool-call`。
7. 现有 flow 覆盖零冲突：MC_MAP 无 tool-call 段；`[data-chat-flow-kind]` 通用 flowItem
   规则（flex:none/min-width:0）照常作用于工具卡外壳（ChatNodeSeat 的 flowItem div），
   我们接管后重绘的是其**内部**。

## 1. 裁定清单

1. **路线：重绘，非 CSS 套壳**（syscard 批用户裁定同源；官方行是单行 DisclosureRow 扁平
   结构，原型卡是双行 meta + 图标格 + pill 的面板结构，CSS 无法表达）。遮蔽
   `conversation.chat.node` key `tool-call`（priority:-1）→ `McToolTree` 自绘。
   primitives/React 缺席或注册失败 → 不遮蔽，官方 ToolCallTree 兜底（think 先例）。
2. **壳 = 原型 §7 语汇**：`.tool`（surface 底 + 1px 边 + r-card + 硬投影 + overflow:hidden）
   > `.tool-head`（26×26 `.t-ic` 图标格 / `.t-meta` 双行：`.t-name` 12px display 族 +
   `.t-args` 11px code 族 ellipsis / `.pill` 三态 / `.tri` chev）+ `.tool-body > .tb-in`
   （上边框软线 + 12px code 族）。全部自有 `.mc-tool*` 类（audit §5 零宿主锚）。
3. **三态**：running = 琥珀边 + 标题条条纹扫掠（repeating-linear-gradient + mc-sweep
   steps(2) 1s + `--sweep-delay` 相位对齐）；error/fail = 红边 + 图标转红；stopped =
   pill done 形 + 摘要后缀「已停止」；ok/done = 常态。pill 文案：running/done/fail。
> **用户裁定修订（2026-09-02 二轮）**：①首登场一律折叠（running 也不例外）；②落地不刻意折叠
> （不改变用户手动开合的折叠态）；③展开体内一切内容直角矩形 + 统一像素字体（--font-code，
> 宿主块圆角/字族 !important 压平）；④展开体内折叠面板（[data-expandable]/[aria-expanded]）点击
> 方向判定 + flashIn/flashOut 闪烁（捕获委托，宿主自身切换不拦截）。已实施。
4. **出场与开合**：整卡出场 flashIn（挂卡壳；红/白遮罩协议）；开合 accToggle 四拍
   （MC_MAP.toolcard 段零宿主锚，卡自带 position:relative）。**running 卡默认展开、
   落地后自动收起**（interactive appendToolCard 先例：running 默认 .open 出场，
   doneOut 后收；React 实现 = useState(true) + state 变迁 useEffect 收起），历史会话
   全部落地卡默认收起。
5. **图标语义映射**（笔记 §10.4 表适配真实 wire 名）：精确名表优先（bash/pwsh→terminal，
   read→doc，write→floppy，edit→edit，grep/glob→search/folder，web_search→search，
   web_fetch→ext，todo_write→list，ask_user_question→balloon，spawn_subagent/subagent→
   suitcase，workflow→timeline，ralph→reload，job→clock，goal→goal …），`mcp__` 前缀 →
   zap，fail 态换 warning（真失败才叹号），未知兜底 dots 三点（中性，明确不用叹号）。
   图标 = sprite symbol 经 mask data-URI（syscard 表单图标先例），26×26 格 15px。
6. **参数摘要 t-args**：`mcToolArgsSummary(name, argsRaw)` 纯函数——已知工具取关键参数
   （path/pattern/command/file_path/query/url/objective 等白名单键，截 60 字符）；
   未知/解析失败 → argsRaw 前 60 字符单行化；再退 callId。
7. **展开体内容两级**：① wire view 结构化材料（terminal/diff/read/search/web）→ 复用
   primitives 对应 Block（缺陷防御 narrowing 照官方谓词，坏载荷降级 ②）；
   ② generic 路径 = 输入段（argsRaw pretty JSON 经 JsonBlock，截断标签）+ 输出段
   （content text 块连缀，12px code 族，2 万字符截断照 syscard 先例）。error 态展开体
   首行红显 `error.name: error.code`。
8. **子调用**：`.subcalls` 缩进列表（左 2px 软线 + sc-row：图标 11px + 11.5px code 文案
   + 状态点 ok 绿/run 琥珀）——子调用是完整卡（可展开）还是行？**裁：子调用也渲染为
   完整 .tool 卡，缩进挂 14px + 左 2px 软线（原型 subcalls 语汇），递归 McToolTree 同构。**
9. **保留官方行为**：inspect 轨迹跳转与 openFile 文件链接一期不渲染（原型无此件）；
   记已知限制，后续按需补。
10. **纯只读**：不触任何服务面；卡内不调 sessions/workspaces。动态文本 esc2；
    无 :hover/transition；延时只走 CLOCK.next；reduced-motion 压 .01ms + 跳拍。
11. **kit 扩区**：McKit 增「工具卡」分区——文件操作/执行与后台/委派与编排/目标与规划/
    检索与 MCP/未知兜底 六组静态样本（照 kit §7 帧抄）+ 状态三帧循环演示
    （running→ok→error 单卡三态，CLOCK 驱动）。
12. **门禁/验收**：`tools/verify-toolcard.mjs` 新建（本会话即含大量工具卡的活体会话）：
    卡壳在场 + 边框/圆角/字体断言 + running 扫掠（若遇）+ 子调用缩进 + 深浅两遍 +
    拔演练（primitives require 失败 → 官方行兜底不破版）。活体验收归用户（多会话规则）。

## 2. 数据 → 内部形态（纯函数，src/conv/tool.js + CJS shim）

```
mcToolState(block)            → 'running'|'ok'|'error'|'stopped'   （官方推导照抄）
mcToolName(block)             → call?.name ?? name ?? callId 兜底链
mcToolIconName(name, state)   → sprite 名（精确表 → mcp__ 前缀 → fail→warning → dots）
mcToolArgsSummary(name, raw, callId) → 单行摘要 ≤60 字符
mcViewCard(view, cwd, home)   → null | { kind:'terminal'|'diff'|'read'|'search'|'web', card:<narrowed props> }
                                （card 判别 + 载荷防御 narrowing；坏形/未知 card 值 → null）
mcOutputText(content)         → text 块连缀（≤20000 截断）；error 展开 = name:code 首行
```

## 3. 组件结构（client.js McTool 段 + src/conv/tool.js 镜像）

```
McToolTree(props)              遮蔽组件：props.node.data.root → 递归 McToolBranch
McToolBranch(block, depth)     一卡：McToolCard + block.subCalls → .mc-subcalls 递归
McToolCard(block)              .mc-tool 卡：头(图标格/双行 meta/pill/chev) + 体(结构化块|文本)
mcNarrowXxx(view)              五类载荷防御 narrowing（纯函数区，可测）
```

注册（照 McThink/McSysCard 先例，PRIM 缺席不注册）：

```js
ctx.effect(() => S.inject('conversation.chat.node', () => S.register({
  name: 'conversation.chat.node', key: 'tool-call', priority: -1, registrant: 'macintosh',
}, McToolTree)));
```

mods/order 增 `McTool`（McSysCard 后、McMenus 前）；src/assemble.input.js 与
tools/make-persistent-client.mjs 同步。

## 4. CSS 要点（原型 L705-763 直抄，token 换 --mc-*，全挂 .mc-tool 自有类）

- `.mc-tool`：surface/边/r-card/`--mc-shadow-panel`/overflow:hidden/position:relative。
- `.mc-tool-head`：flex 全宽钮；`.mc-t-ic` 26×26 图标格（surface-2 底 + 边 + r-tag，
  svg 15px mask data-URI currentColor）；`.mc-t-meta` 纵向双行；`.mc-t-name` 12px
  display 族 ellipsis；`.mc-t-args` 11px code 族 ellipsis；chev 三角 `.open` 旋 90°
  （硬切）；pill 三态复用一期 `.pill`（run/done/fail）。
- running：边 spark；头条纹扫掠（`--mc-spark` 26% 0-4px/transparent 4-8px、
  background-size 12px、mc-sweep steps(2) 1s、`--sweep-delay` 组件内 CLOCK.syncAnim）。
- fail：边 danger；`.mc-t-ic` 色与边转 danger。
- `.mc-tool-body` 高度瞬切（`.open` 才有高）；`.mc-tb-in` 上边框软线 + 12px code 族。
- `.mc-subcalls`：margin-left:22px + padding-left:8px + 左 2px 软线 + gap 4px；
  内层 .mc-tool 同构（投影减弱一档可后续调）。
- diff/terminal/read/search/web 结构化块：宿主 Block 自带样式直接用（ themes alias
  已通 `--dsw-*`），外层只管 `.mc-tb-in` 边距与字体基调。

## 5. 测试与门禁

- `test/tool.test.mjs`：mcToolState 四态 / mcToolName 兜底链 / mcToolIconName 全表 +
  mcp__ 前缀 + fail 换 warning + 未知 dots / mcToolArgsSummary 白名单键与截断 /
  mcViewCard 五类 narrowing + 坏载荷 null / mcOutputText 截断。
- `tools/verify-toolcard.mjs`：活体（127.0.0.1:3080，本会话多工具卡）断言卡壳样式、
  子调用缩进、深浅两遍、零页面错误、拔演练（MC_PRIM 置空 → 官方行回退不破版）。
- `npm test` 全绿 + audit 扩容（McTool 段特征片段进白名单反查）。

## 6. 已知限制

- inspect 轨迹跳转、openFile 文件链接不渲染（原型无此件；官方 DetailsPanel 另有入口）。
- 官方专用行（BashRow 命令描述等）的摘要增强不保留——我们用统一 t-args 摘要规则替代。
- stopped 态 pill 文案沿用 done 形（「已停止」进摘要后缀），不新增第四种 pill。
- 工具卡密度高时会话增长：树走查 O(n) 每渲染，卡级 memo（React.memo by callId+seq）。
