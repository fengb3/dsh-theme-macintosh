# Macintosh 主题 · 菜单体系（overlays 批 1：.menu + sidebar 菜单补全）Design Spec

> 日期：2026-09 · 状态：brainstorming 四节设计经用户逐节确认（2026-09 对话存档）
> 上游：`docs/superpowers/specs/2026-08-30-macintosh-theme-design.md` §9（浮层）、§4（映射策略）；原型 `prototype/macintosh-workspace.html` §9 `.menu` DOM 基准
> 本批与 dock 输入坞（§6）分项：菜单先行，dock 另写 spec。dialog/toast/scrim/hero 留下批。

## 0 · 用户裁定（设计前提）

1. **重绘优先**：菜单走自有 DOM 整体重绘，不在官方组件上加 CSS——最大限度还原设计稿。
2. **槽替换优先，自绘兜底**：有 keyed 槽的菜单走 McSysCard 先例（priority:-1 遮蔽 + primitives 直取）；无槽的菜单藏宿主原生件后自绘。
3. **兼容承诺**：保留 DSH 默认插槽注册表——其他插件注册的菜单项不受影响；探针失配 = 官方原生菜单照常（优雅降级）。
4. 菜单项**只做宿主真有的动作**：探针勘明一个接一个；勘不明的项不渲染，不发明宿主没有的功能，不做死钮。

## 1 · 架构

- 新模块 `src/conv/overlays.js` → client.js 镜像 `McMenus`（协议 `{ css, mount }`），挂 mods/order：McSysCard 后、McKit 前。
- MC_MAP 追加 menu 段（唯一官方 selector 管制点；探针回填，标 DRIFT-RISK 与勘定日期/宿主版本）。
- 三层策略：
  1. **探针先行**（plan Task 1，throwaway playwright 脚本）：dump 宿主各弹出菜单渲染管道——keyed 槽有无（`menu.*`/`contextmenu.*`）、portal 挂载点、菜单项数据源、动作触发方式（服务调用 or 程序化 click）。
  2. **槽替换**：有槽 → 槽组件重绘，宿主 props（label/icon/action）直接渲染；第三方注册项天然保留（只换皮不换注册表）。
  3. **自绘兜底**：无槽 → CSS 藏宿主原生菜单（不删 DOM，保留可程序化 click 的原项），自绘 `.menu` 挂触发钮旁。
- 卸载：teardown 撤 document 级监听 + 关闭活动菜单（McFlow observer 先例）；失配 = 官方菜单照常。

## 2 · 组件清单

**`.menu` 原语**（原型 §9 直抄）：白底黑线方角卡、`--shadow-pop` 硬投影、菜单项 `.mi`（图标位 + 文字 + 快捷键位）、`.sep` 分隔线、危险项红字态；出场 flashIn 三拍、按压 `:active` 反色、值源一律 `--mc-*`/`--font-*` token（浅色自动跟随）。

**sidebar 待补菜单**（对照原型与一期 McFinder 现状；最终以探针实勘为准，勘明的项才上）：

| # | 菜单 | 触发点 | 现状 | 预期项（以宿主实有动作为准） |
|---|------|--------|------|------------------------------|
| 1 | 会话行菜单 | 会话行三点钮 | 钮已有、菜单无 | 重命名 / 归档 / 删除 / 复制 ID 等（探针定） |
| 2 | 分组头菜单 | group-head dots 钮 | 同上 | 重命名工作区 / 折叠展开 / 新会话等 |
| 3 | 分组头新建 | group-head plus 钮 | 同上 | 新会话 / 新工作区 |
| 4 | listbar 视图选项 | 「工作区」标签右侧滑块钮 | 一期 no-op 占位 | 显示/隐藏已完成、排序等（宿主有则接） |
| 5 | listbar 添加 | 「工作区」右侧加号钮 | 一期 no-op 占位 | 新建工作区 / 新建会话 |

**范围外**：dialog/toast/scrim/hero（下批浮层）、composer/dock 相关菜单（dock 批）、主窗 menubar（spec §4 明确不做）、菜单动作后的 toast 反馈（toast 属下批，动作静默执行）。

## 3 · 数据流与动作接线

- **开合状态机**（自绘路径）：模块级单例 `MC_MENU`——同一时刻只开一个菜单，开新先 `flashOut` 旧菜单；关闭三渠道：点菜单项 / 点外部（document 捕获 click）/ ESC（keydown 委托）。全走库函数，REDUCED 自动跳拍。
- **动作接线**（可靠性降序，探针定案）：
  1. 官方服务 `ctx.sessions.*`（一期已消费 sessions 快照；动作面探针勘明）——最稳；
  2. 程序化 click 官方原钮/原菜单项（tclose 先例同款，保官方行为与状态持久化）；
  3. 两路不通 → 不渲染该菜单项。
- **定位**：自绘菜单挂触发钮 `position:relative` 容器（`top:calc(100% + 6px)` 原型同款）；右缘溢出翻转对齐（getBoundingClientRect 一次测算，无动画）。
- **槽替换路径**：宿主 props 直渲；第三方菜单项经注册表自然汇入。

## 4 · 动画纪律（沿用全项目）

无 `:hover`、无 `transition`（宿主自带压平 `transition:none`）；按压只 `:active`；一切延时 `CLOCK.next`（禁裸 setTimeout）；`prefers-reduced-motion:reduce` 压 `.01ms` + JS 跳拍；出场 flashIn 三拍、状态切换 accToggle 四拍（七轮统一裁定）；innerHTML 静态字面量或经 esc。

## 5 · 测试与验收

- **纯函数单测**（node --test，CJS shim 出口照 syscard 先例）：菜单状态机（单例互斥/ESC/外点关闭）、动作派发表映射合法、定位翻转断言。
- **静态纪律**：audit 自动并入（src 全量：hover/transition/裸定时器/esc/宿主 selector 只进 MC_MAP menu 段 + 特征片段扩容）。
- **活体门禁** `tools/verify-menus.mjs`（照 verify-flow 结构）：每菜单开 → computed 样式断言（白底/方角/shadow-pop）→ 点一项 → 官方动作生效断言（如归档后会话消失）；兼容断言（官方原生菜单 DOM 存在被藏未删 / 槽路径第三方项保留）；失配演练（改锚失配 → 官方照常 → 改回复验）；深浅两色截图 `shots/menu-*.png`。
- **验收流程规则**（用户六轮裁定，沿用）：实现完不自动跑探针活体；活体验证须用户发起且覆盖多会话（空/历史/切回），单会话不作数。
- **kit 扩区**（收尾）：检视页「菜单」分区陈列 .menu 全形态（常规项/危险项/分隔线/禁用态）。

## 6 · 文件结构（plan 细化）

```
client.js               McMenus 模块 + MC_MAP menu 段 + mods/order
src/conv/overlays.js    设计参照镜像（CJS shim 出口纯函数）
test/menus.test.mjs     状态机/派发表/定位纯函数测试
tools/verify-menus.mjs  活体门禁（新建）
tools/audit.mjs         menu 段特征片段扩容
prototype/component-dev-notes.md  §8 追加菜单落地差异注记（收尾）
```

## Self-Review

- 占位符：菜单项内容多处「探针定」——这是显式探针依赖（Task 1 勘定回填），非 TBD；失配兜底路径已定义。
- 一致性：三层策略与用户裁定 2/3 一致；范围外清单与分批决议一致；动画纪律与全项目一致。
- 范围：单一实现计划可承载（估 6-8 任务）；dock 与其余浮层明确出栈。
