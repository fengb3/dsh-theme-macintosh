# Macintosh 主题 · 家具区（furn 批：queue-row / todo-acc / goal-card）Design Spec

> 依据：`2026-09-02-macintosh-theme-furniture-recon.md`（数据面勘定，四源全命中）。
> 用户裁定（2026-09-02）：**ctx 圆环已交付不动，其余三件都做。**
> 宿主基线：0.1.1-rc.2（`ctx.sessions` 直达；`binding(id).session` = ISession +
> ObservableSnapshot<ConversationSnapshot>；`session.projections.faceOf(key)`）。

## 0. 裁定清单

1. **范围**：queue-row（追加消息条）/ todo-acc（todo 折叠卡）/ goal-card（目标卡）三件做活；
   ctx 圆环维持 dock 批官方锚实现（`composerCtx` + lastCtxPct + 官方弹层），本批不动；
   renderFurn 内 `DOCK_DATA.ctx` 死分支随本批移除。
2. **首版纯只读**：不接写通道（`updateQueue` / goal 动词 / `/goal` 命令一概不调）。
   遗留候选：goal 动词走官方 GoalBar 镜像驱动（其挂 `conversation.input.dock` 槽、goal
   设置期才在场，需独立勘定，另批）。
3. **todo now 语义（数据驱动）**：`status==='in_progress'` 的行全标 now（宿主允许多行并行）；
   零 in_progress 时首未完成行标 now（原型语义兜底）。
4. **goal 相位**：`complete` → 不渲染（官方 GoalBar 同款终态消失）；active/paused/blocked 渲染；
   blocked 琥珀边（已有 CSS）；paused/blocked 显文字徽标；轮次 `第 N/M 轮` 进 title 提示。
5. **队列文案**（原型语汇）：`队列中还有 N 条消息 — 第一条:<preview>`，仅计
   `placement==='queued'`（steering/context 不混入）；N=0 → 整件不渲染。
6. **数据通道**（四订阅，全守卫，缺席即静默）：
   `ctx.sessions.list.subscribe`（换会话检测 + 粗唤醒）；
   `binding(cur).session.subscribe`（queue：ConversationSnapshot.queue）；
   `binding(cur).session.projections.faceOf('todos'|'goal').subscribe`（精确唤醒）。
   读值一律 `getSnapshot()` 即时取；`binding` 缺席（未列出/未开）= 该路静默。
7. **渲染纪律**：订阅回调 → 差分签名（queue 文本 + todos 规范形 + goal 规范形 的 JSON）比对，
   变了才 `renderFurn()` 重建；todo-acc 开合态跨重建保持（重建前读 `open` 类，重建后回放）；
   换会话（list.current 变）重订 session 级订阅；teardown 全退订；全动态文本 `esc2`；
   无 :hover/transition；出场不重放 flashIn（坞整体已 flashIn，家具只重绘内容）。
8. **门禁/验收**：verify-dock 补家具断言（在场性结构 + 无页面错误 + 无数据时静默合法）；
   真实数据呈现（todo/goal/queue 实值）归**用户活体验收**（验收流程规则不变）。

## 1. 数据 → 内部形态（纯函数归一）

```
TodoItem{content,status}          → { done: status==='completed', now: status==='in_progress', text: content }
                                    （{done,text} 旧原型形仍兼容——kit 样本与既有测试用）
ConversationSnapshot.queue        → mcQueueText(queue) → null | '队列中还有 N 条消息 — 第一条:X'
                                    N=∑ placement==='queued'；X=首条 preview||text||''
GoalProjection{goal,roundsStarted}→ mcGoalCard(p) → null | { text: objective, phase,
                                    badge: paused?'已暂停':blocked?'受阻':'',
                                    rounds: '第 N/M 轮'(N≥1 且 M>0，否则 '') }
                                    （p 为 null/undefined / phase==='complete' → null）
```

## 2. DOM/CSS

- 三件 markup 维持 dock 批 renderFurn 既有结构（原型 §9 语汇）；goal-card 增
  `<span class="gc-badge">` 徽标（paused/blocked 时）；title 提示含轮次与 objective。
- CSS 补两条：`.gc-badge`（mono 小徽标）与 `goal-card[data-phase="paused"]` 边框降灰。
- todo 行类：done/now 皆数据驱动（now= in_progress 全标）。

## 3. 失配与降级

- `ctx.sessions` 缺席（动态评审态/服务未就绪）→ DOCK_DATA 三键不装，家具静默（现状即合法态）。
- 任一订阅/读值异常 → try/catch 吞（该路静默），绝不影响坞本体（composer/桥/圆环）。
- 数据迟到（projection undefined）→ 家具先静默，订阅唤醒后补挂（无空壳闪烁）。

## 4. 测试与门禁

- 纯函数 TDD：`test/dock.test.mjs` 扩（status 形 segments / 多 now / 零 in_progress 兜底 /
  mcQueueText 计数与 steering 排除 / mcGoalCard complete→null 与徽标轮次）。
- `npm test`（含 audit）全绿；`node tools/verify-dock.mjs` GREEN（家具断言段）。
- 装配链：改 `src/conv/dock.js`（+ `src/kit.js` 注记）→ `assemble` + `make-persistent-client`
  重建 dist/client.js，三者一致由 audit 保障。

## 5. 非目标

- ctx 圆环换 `contextBreakdown` 三路分项数据源（官方 N% 锚够用；分项弹层另批候选）。
- goal/queue 写通道、官方 GoalBar 镜像驱动、jobs（后台任务）家具。
