# Macintosh 主题 · 家具区（furn 批）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development 或 executing-plans，逐任务实施。
> **Spec:** `docs/superpowers/specs/2026-09-02-macintosh-theme-furniture-design.md`（同行）；
> 数据勘定：`2026-09-02-macintosh-theme-furniture-recon.md`。

**Goal:** DOCK_DATA 三键活装（queue/todos/goal）——ctx.sessions 四订阅 → 差分重绘 renderFurn，
纯只读，缺席静默，teardown 全退订；ctx 圆环不动；门禁补家具断言。

**纪律沿用：** plain JS（src 顶层声明）；原生构造器 `window.*`；禁裸 setTimeout（CLOCK）；
动态文本 `esc2`；无 :hover/transition；每任务 `npm test` 全绿后一 commit；
改 `src/**` → 重建（`node tools/assemble.mjs && node tools/make-persistent-client.mjs`），
client.js 为生成物不手改；活体验收归用户。

## File Structure

```
src/conv/dock.js     纯函数扩(mcTodoSegments 状态形/mcQueueText/mcGoalCard) + DOCK_DATA 活装 + renderFurn 适配 + CSS 徽标 + teardown 退订;CJS shim 出口扩
test/dock.test.mjs   新增三函数测试段
src/kit.js           家具 kit 注记文案更新(静默→活)
tools/verify-dock.mjs 家具断言段(在场性/无错/静默合法)
prototype/component-dev-notes.md  §8.9 家具落地注记
dist/client-body.js + client.js   重建产物(不手改)
```

---

### Task 1: 纯函数 TDD——mcTodoSegments 状态形 / mcQueueText / mcGoalCard

**Files:** `test/dock.test.mjs`（先写失败测试）、`src/conv/dock.js`（实现 + shim 出口）

- [x] Step 1: 失败测试——status 形 segments（completed→done、in_progress→now 全标、pending→todo、
      零 in_progress 首未完成兜底 now、{done} 旧形兼容）；mcQueueText（N 计数仅 queued、
      steering 排除、preview||text、0/空/非数组→null）；mcGoalCard（null/undefined/complete→null、
      active→无徽标、paused→已暂停、blocked→受阻、rounds 轮次串、M=0 或 N=0 无轮次）。
- [x] Step 2: `node --test test/dock.test.mjs` 确认 FAIL（无 export）。
- [x] Step 3: 实现（src/conv/dock.js 纯函数区；shim 出口加三函数——mcTodoSegments 原地改）：
      归一 `it.status ? {done:status==='completed',now:status==='in_progress'} : {done:!!it.done,now:false}`。
- [x] Step 4: `npm test` 全绿 → Commit `feat(mc-furn): 家具纯函数(status形segments/queueText/goalCard)`

### Task 2: DOCK_DATA 活装——四订阅 + furnSync 差分 + renderFurn 适配 + teardown 退订

**Files:** `src/conv/dock.js`（mount 内）

- [x] Step 1: 订阅层——`subList/subSess/subTodos/subGoal` 四句柄 + `furnSync()`：
      list 快照取 current；current 变 → 重订 session 级三订阅（binding 缺席置空）；
      todos/goal 经 faceOf('todos'/'goal').getSnapshot() 读（undefined/null→null）；
      queue 经 binding.session.getSnapshot().queue → mcQueueText；签名比对变了才 renderFurn。
      全 try/catch；ctx.sessions 缺席整层不装（DOCK_DATA 三键不写）。
- [x] Step 2: DOCK_DATA 三键 getter 改读 furnSync 维护的快照变量（queue:{text}/todos:规范化
      {done,now,text}[]/goal:mcGoalCard 形）；renderFurn：todo 行类 now 数据驱动；
      goal-card 加 gc-badge/title 轮次；开合态保持（重建前读 open，重建后回放）；
      DOCK_DATA.ctx 死分支移除。
- [x] Step 3: CSS 两条（.gc-badge / goal-card[data-phase="paused"]）。
- [x] Step 4: teardown 追加四退订。
- [x] Step 5: `npm test` 全绿 → Commit `feat(mc-furn): DOCK_DATA 活装——四订阅差分重绘(纯只读)`

### Task 3: 装配重建 + kit 注记 + 刷新冒烟

**Files:** `src/kit.js`、`dist/*`、`client.js`（重建产物）

- [x] Step 1: `node tools/assemble.mjs && node tools/make-persistent-client.mjs`；git diff 核对
      client.js 变更仅为 dock/kit 段。
- [x] Step 2: src/kit.js 家具 kit 注记更新（「活体暂全静默」→「数据面活装(纯只读)」）。
- [x] Step 3: 刷新宿主冒烟：dock 在场、无页面错误、无数据会话家具静默（预期态）。
- [x] Step 4: `npm test` 全绿 → Commit `feat(mc-furn): 装配重建+kit 注记(静默→活)`

### Task 4: verify-dock 家具断言 + 注记回写 + 终验

**Files:** `tools/verify-dock.mjs`、`prototype/component-dev-notes.md`

- [ ] Step 1: verify-dock 增家具段——dock 在场性不变；`[data-mc-dock-furn]` 内：若有
      `.todo-acc` 断言 bar/meta/行结构；若有 `.goal-card` 断言 data-phase 与徽标；若有
      `.queue-row` 断言文案正则；全无 = 静默合法（INFO）；页面 error 监听零异常。
- [ ] Step 2: `node tools/verify-dock.mjs` GREEN（截图两张刷新留证）。
- [ ] Step 3: component-dev-notes §8.9 注记（数据通道实况/只读裁定/遗留写通道候选）。
- [ ] Step 4: `npm test` 全绿 → Commit `test(mc-furn): 门禁家具断言+注记收尾`
- [ ] Step 5: 汇报用户：三件家具已活装；活体验收（含 todo/goal 实数据的会话）由用户发起。
