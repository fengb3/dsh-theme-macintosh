# 输入坞家具区 · 数据面勘定记录（recon，2026-09-02）

> 批次背景：dock 批收口裁定「家具区移下一期，做活需独立探针批解决数据来源」（plan 家具区排期裁定节）。
> 本文档 = 该探针批的勘定产物；设计裁定（spec）以其为据，另行成文。
> 勘定方法：本地部署包直读（`C:\Users\fengb\node_modules\@deepseek-ai\`，dsh 0.1.1-rc.2——
> 与运行宿主同版本；「发布包 lib/client.js 即页面运行源，源码即 DOM 真相」先例）。
> 上批「全零命中」的由来：dock 批探针只扫了页面已加载 chunk（沿 script src 相对导入图，80 文件上限），
> 未达 goal/plan/todo/jobs 等包；本批直读安装包全集，故命中。

## 结论：四件家具数据面全命中（GO）

| 家具 | 数据源 | 形态 |
|------|--------|------|
| queue-row（追加消息条） | `ConversationSnapshot.queue` | `QueuedMessage[]`（瞬态收件箱权威快照） |
| todo-acc（todo 折叠卡） | projection `todos` | `TodoItem[] \| null` |
| goal-card（目标卡） | projection `goal` | `GoalProjection \| null` |
| ctx-ring/ctx-pop（上下文圆环） | projection `contextBreakdown` | `ContextBreakdownState` |

## 读取通道（纯 JS，无 React）

- 会话句柄：`ctx.sessions.binding(sessionId)` → `SessionFace`（McFinder 已在用，
  `typeof binding === 'function'` 守卫先例照抄）。缺席/异常 = 家具静默（现状即合法终态）。
- 会话面本体 = `ObservableSnapshot<ConversationSnapshot>`：`getSnapshot()` / `subscribe(fn) → 退订`
  ——queue 家具订阅它即可（顺带 `running`/`pending`（待交互）/`composerPhase` 都在同一快照）。
- projection 面：`session.projections.faceOf(key)` → 同款 `ObservableSnapshot`（身份稳定，可先订阅后到值）。
  编译产物实证（rc.2 `dsh-client-runtime/lib/client.js` 含 `projections` 面）。
- 语义纪律：`undefined` = 能力缺席（宿主单元未挂载/基线未携带该键）→ 家具不渲染；
  `null` = 合法空态（如无 goal/未写过 todo）→ 同样不渲染；订阅期间值只增不回退（higher-seq-wins）。

## 数据形态（与原型映射）

```
QueuedMessage  { id, messageId, placement: 'queued'|'steering'|'context',
                 content: ContentBlock[], preview: string, text: string|null }
  → queue-row：placement==='queued' 计数与预览（原型「队列中还有 N 条消息」）；
    'steering' 为运行中追加转向消息（同快照另有 pending 待交互面，可后续扩）。

TodoItem  { content: string, status: 'pending'|'in_progress'|'completed' }
  → todo-acc：mcTodoSegments 需从原型 {done,text} 适配为 {content,status}；
    in_progress = now 行（原型语义「首个未完成」，实况允许多行并行 in_progress——
    渲染按实况：所有 in_progress 行标 now，分段条首未完成段标 now）。

GoalProjection  { goal: GoalSnapshot, roundsStarted, createdAt, updatedAt }
  GoalSnapshot = { id, revision, objective, phase: 'active'|'paused'|'blocked'|'complete',
                   blockedReason?: {code,message}, maxGoalRounds }
  → goal-card：objective 文案 + phase 徽标；blocked 边框高亮（MC_DOCK_CSS 的
    [data-phase="blocked"] 规则已在）；complete/paused 可显徽标；roundsStarted/maxGoalRounds
    可显「第 N/M 轮」。goal 创建走 /goal 命令（官方 UI 亦如此），主题侧只读即可起步。

ContextBreakdownState  { systemTokens, toolsTokens, messageTokens,
                         claim?: { start, end, tokens } }
  → ctx-ring：三路占比即 ctx-pop 的 parts（系统/工具/对话），总数 = 三者之和
    （与宿主 measure() 启发式同词表；官方「上下文已用 N%」钮的 N 同源）。
```

## 写通道（在场但未启用——spec 裁定项）

`ISession` 另有动词：`prompt(content,'queue'|'steer')`、`updateQueue(itemId,action)`、
`cancel()`、`command(line)`（如 `/goal`、`/plan off`）。dock 批纪律「发送唯一通道 = 官方原钮」
是否延伸到家具动作（queue-row 的删改、goal-card 的暂停/清除）→ **spec 待用户裁定**；
只读起步（本批默认）零风险。

## 出处

- `dsh-client-runtime/lib/types/client/contract/session.d.ts`（ISession/ProjectionsFace）、
  `sessions/conversation.d.ts`（ConversationSnapshot/QueuedMessage）、`sessions/projection-store.d.ts`、
  `contract/store.d.ts`（ObservableSnapshot）
- `dsh-tool-todo/lib/types/types.d.ts`（todos projection 注册）
- `dsh-goal/lib/types/types.d.ts`（goal projection 注册 + 全形态）、`domain.d.ts`（goal/changed 事件）
- `dsh-token-meter/lib/types/breakdown-projection.d.ts`（contextBreakdown）
- `dsh-client-ui-goal`（GoalBar 挂 conversation.input.dock 槽——该槽真实存在，dock 批
  页面 chunk 扫描未达而已）、`dsh-client-ui-plan`（plan projection + /plan）、
  `dsh-client-ui-jobs`（会话头后台任务钮，非消息队列，与 queue-row 无关）

## spec 需裁定的设计问题（ brainstorm 输入 ）

1. 四件全做 or 分级（queue/todo 先行，goal/ctx 次之）？
2. 家具动作是否接写通道（删队列条 / goal 暂停·清除 / /goal 命令发送），还是首版纯只读？
3. todo 分段条语义：多行 in_progress 并行时 now 标注策略（原型单 now）。
4. ctx-ring 百分比分母：contextBreakdown 无总量上限字段——用官方「上下文已用 N%」钮同源
   口径（需勘 measure() 的容量基准）还是只显三路绝对值？
5. goal-card 的 complete 相位展示（官方 GoalBar complete 不渲染——主题是否也隐藏 or 显完结徽标）。
