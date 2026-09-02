# Macintosh 主题 · dock 完全替代官方（furn2 批）Design Spec

> 用户裁定（2026-09-02，五项报障/诉求）：
> ① TODO list z-index 遮挡其他 UI（弹菜单）；② todo 与 goal 卡之间加间隔；
> ③ todo 完成步骤变换需用闪烁效果；④ 官方 dock 的 goal & todo 仍显示，与自绘重复；
> ⑤ 自绘 goal 缺 暂停/编辑/删除 钮——**自绘 dock 完全替代官方方案，支持 slot 插入新元素**。

## 0. 勘定基础（部署包直读 + 源码实证）

- 官方 input dock = `div[data-slot="conversation.input.dock"]`（renderer SlotOutlet：每槽
  `div[data-slot=<key>]` display:contents 包装）——渲染于 composerStack 内、官方卡**之外**，
  藏卡不藏它 ⇒ 与自绘家具重复（用户所见）。三注入方：todo（conversation 包，order 0）、
  goal（goal 包 `[data-goal-bar]`，order 10）、queue（conversation 包 QueueDock，order 20）。
- GoalBar 全形态（dsh-client-ui-goal lib/client.js 直读）：常驻条 = glyph+相位 label+objective+
  动作钮（aria：暂停目标/恢复目标/编辑目标/清除目标，按相位条件渲染）；编辑态 = 受控
  `input[aria-label="目标内容"]`（Enter=存/Esc=撤）+ 保存目标/取消编辑 钮。动词经
  ctx.remote.goals.*（服务面）——**主题不直调**，一律镜像官方钮（display:none 内 click/镜像
  先例：官方卡内四钮+textarea 桥）。

## 1. 裁定

1. **官方 input dock 槽整体藏匿**：`html[data-mc-dock-on] [data-slot="conversation.input.dock"]`
   {display:none!important}（MC_MAP 新键 composerDockSlot；藏未删——goal 动作镜像钮仍在内）。
   自绘坞 = 唯一 input dock（「完全替代」）。官方 QueueDock 的队列删改随整槽退场
   （自绘 queue-row 保持只读；队列编辑写通道列遗留候选）。
2. **goal-card 动作四钮**（镜像官方 GoalBar，不直调服务面）：
   active → Pause/Edit/Delete；paused → Resume/Edit/Delete；blocked → Edit/Delete。
   - Pause/Resume/Delete = click 官方对应 aria 钮；钮缺席（官方改版/相位不符）→ 自绘钮隐藏。
   - Edit = 点官方「编辑目标」→（CLOCK 轮 ≤5 拍候 `input[aria-label="目标内容"]`）→ 自绘卡内
     转内联编辑（mc-field 输入 + 确认/取消）→ 确认：镜像草稿进官方 input（native setter+input）
     → click 官方「保存目标」；取消：click 官方「取消编辑」（官方编辑态守卫生涯内才点）。
     projection 回流（goal/changed）后卡片自重绘；编辑态随 goal.id 变化重置。
3. **todo 变换闪烁**：renderFurn 重建差分（text→done/now 类映射），类变行 flashIn 三拍
   （出场闪烁同款；新行同闪，消失行自然无靶）。
4. **间距**：`.todo-acc + .goal-card{margin-top:8px}`（叠 .dock flex gap:8 ⇒ 视觉 16px）。
5. **z 叠压**：官方条藏匿后，自绘家具全部 z:auto 静态位——body 挂载弹菜单（.mc-menu z:70）/
   官方注入弹层（data-mc-pop z:9000）恒在上；①的遮挡源头即官方条（其面板 position:relative
   +负 margin 叠压带），藏匿即根治，活体复测确认。
6. **家具 slot 注册表**：`MC_DOCK_FURN`（{id, order, get:()=>html|null}，内置 queue=0/
   todos=10/goal=20）；`MC_DOCK_API.slot(id, order, getter)` 注册/替换条目并触发重绘——
   自绘坞支持插入新元素（kit/后续模块可挂）。
7. 门禁：官方槽藏匿断言（data-mc-dock-on 在场时 display:none，确定性）；goal 动作真驱动
   涉 /goal 建目标（goal-round-driver 会自动续轮）——**不入门禁**，归用户活体验收。

## 2. MC_MAP / audit

- 新键 `composerDockSlot: '[data-slot="conversation.input.dock"]'`（client.js + src/chrome/map.js
  同步；audit DOCK_WHITELIST 增补）。

## 3. 非目标

- 队列条编辑（官方 QueueDock 删改动词）、todo 行内编辑（官方 TodoDock 有 editor）——写通道
  遗留候选另批；官方 todo/goal/queue 三条不再单独转写（整槽已藏）。
