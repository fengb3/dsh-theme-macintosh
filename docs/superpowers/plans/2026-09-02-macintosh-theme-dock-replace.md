# Macintosh 主题 · dock 完全替代官方（furn2 批）Implementation Plan

> **Spec:** `docs/superpowers/specs/2026-09-02-macintosh-theme-dock-replace-design.md`（同行）。
> 纪律沿用（plain JS/window 构造器/CLOCK/esc2/无 hover·transition/每任务 npm test 绿一 commit/
> src 改后重建装配链/活体验收归用户）。

## File Structure

```
src/chrome/map.js + client.js   MC_MAP 增 composerDockSlot（同步双写）
src/conv/dock.js                藏匿规则行/goal 动作镜像+内联编辑/todo 闪烁/间距 CSS/MC_DOCK_FURN 注册表+api.slot
tools/audit.mjs                 DOCK_WHITELIST 增补
src/kit.js                      goal-card 样本补动作钮形态
tools/verify-dock.mjs           官方槽藏匿断言 + goal 钮形态断言（在场时）
prototype/component-dev-notes.md §8.10 注记
```

---

### Task 1: 官方 input dock 槽藏匿（MC_MAP 键 + CSS 行 + audit）

- [ ] Step 1: MC_MAP 增 `composerDockSlot`（client.js + src/chrome/map.js）；dock.js CSS 尾部
       追加藏匿行（同 composerHide 门控形态，IIFE 守卫）。
- [ ] Step 2: audit.mjs DOCK_WHITELIST 增补；`npm test` 全绿。
- [ ] Step 3: Commit `feat(mc-dock2): 官方 input dock 槽藏匿——自绘坞完全替代`

### Task 2: goal 动作镜像 + 内联编辑 + todo 闪烁 + 间距 + 家具注册表

- [ ] Step 1: MC_DOCK_FURN 注册表（内置三件迁入；api.slot 注册接口；renderFurn 按 order 排序渲染）。
- [ ] Step 2: goal-card 动作钮（按相位条件渲染）+ 镜像驱动（pause/resume/clear 直 click；
       edit 四步：官方编辑态开启→自绘内联输入→镜像保存→官方收讫；取消点官方取消钮）。
- [ ] Step 3: todo 闪烁（重建差分 text→cls，类变行 flashIn）+ 间距 CSS（.todo-acc + .goal-card
       margin-top:8px）。
- [ ] Step 4: `npm test` 全绿 → Commit `feat(mc-dock2): goal 动作镜像/编辑态/todo 闪烁/间距/家具注册表`

### Task 3: 重建 + 活体勘验 + 门禁 + 注记收尾

- [ ] Step 1: 装配重建（assemble + make-persistent）。
- [ ] Step 2: 活体勘验（scratch 会话）：/goal 建目标 → 官方条 display:none + 自绘 goal 卡四钮；
       Pause→paused 徽标/Resume 回 active/Edit 内联改文案/Clear 退场；todo 有无时弹菜单
       （.mc-menu/官方注入层）不被遮挡；todo 变换行闪。勘毕 Clear 目标清场。
- [ ] Step 3: verify-dock 增断言（官方槽藏匿确定性断言 + goal 钮形态 INFO/断言）→ GREEN。
- [ ] Step 4: kit goal 样本补钮 + §8.10 注记 + `npm test` 全绿 → Commit `test(mc-dock2): 门禁/kit/注记收尾`
