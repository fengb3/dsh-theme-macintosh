# Macintosh 主题 · 输入坞（dock 批：自绘 composer + 家具 + ctx 圆环）Design Spec

> 日期：2026-09-01 · 状态：brainstorming 三节设计经用户逐节确认（2026-09-01 对话存档）
> 上游：`docs/superpowers/specs/2026-08-30-macintosh-theme-design.md` §3 模块 7（dock）、§4（映射策略）；原型 `prototype/component-dev-notes.md` §9（§6 输入坞）、`prototype/macintosh-workspace.html` composer 区 DOM 基准
> 本批与 ask 向导分项：壳/三态/家具/圆环先行，ask 向导（dockSwap 换装接管）另写 spec 后置。plan 3 遗留的「工作区排序设置钮缺失」不在本批。

## 0 · 用户裁定（设计前提）

1. **B 路线 · 全自绘**（用户明示裁定，2026-09-01）：「如果不用自绘，就无法还原原型稿」——输入坞整体自绘，样式覆写仅作为探针失败时的批次回退形态（方案 A），不作为主路线。
2. **镜像驱动桥 · 官方为唯一真相源**：自绘坞不重新实现发送管道——输入镜像进官方受控 textarea、发送/中断程序化 click 官方原钮、忙闲/禁用从官方属性镜像读取。React 重渲染、草稿、内部校验全由官方自管。
3. **Go/No-Go 探针门**：Task 1 探针必须勘定三件事——① 官方 textarea 可经 native setter + input event 镜像、Send/Stop 钮可程序化 click；② 自绘坞挂载入口（`conversation.input.dock` / `composer.dock` 槽真实性，或 `data-composer-seat` 容器插入）；③ 家具数据面（todo/goal/queue/ctx 用量）。**①勘不通 = 批次整体回退方案 A**（MC_MAP 样式覆写收官），spec 即刻修订。
4. **勘不通不渲染**：数据面/桥接勘不通的控件与家具直接不出现——宁可少一个钮，不留一个死钮（用户确认，排除「摆样子但点官方弹层」混合形态）。延续 menus 批 `mcMenuItems` 过滤哲学。
5. **范围四件**：composer 卡壳与三态、todo/goal/queue 家具、ctx 圆环、（kit 演示与门禁收尾）。ask 向导、dialog/toast/scrim/hero、responsive 均不在本批。

## 1 · 架构

- 新模块 `src/conv/dock.js` → client.js 镜像 `McDock`（协议 `{ css, mount }`），挂 mods/order：**McSysCard 后、McMenus 前**；`src/assemble.input.js` 同步，重跑 assemble/make-persistent 链。
- MC_MAP 追加 **dock 段**（唯一官方 selector 管制点，audit 扩容核验；探针回填，标 DRIFT-RISK 与勘定日期/宿主版本）。既有 `composerCard: '[data-composer-card]'` 一期键保留——回退形态 A 直接复用。
- **挂载入口**（探针 ② 定）：官方槽真实存在 → 槽渲染（McSysCard priority:-1 遮蔽先例）；无槽 → 自绘坞插入 `data-composer-seat` 容器 + MutationObserver 守护重插（McThink 观察器嫁接先例）。官方 composer 卡壳经 MC_MAP 藏匿（`display:none`，藏未删）。
- **失配降级**：探针失配或运行期桥断 = 官方 composer 取消藏匿照常，自绘坞 flashOut 退场——**绝不双输入框并存，绝不无声吞输入**。

## 2 · 组件清单（原型 §9 直抄，token 换 `--mc-*`）

| 子件 | 要点（原型出处） | 降级 |
|------|------------------|------|
| `.composer` 卡壳 | surface+边+硬投影方角；原生 textarea field min-height 44；`.busy .field` 底 `color-mix(fg 4%)` | go/no-go 门保底 |
| `.composer-bar` | 左组（斜杠命令位+权限位）+ `.cb-right{margin-left:auto}`（模型位+ctx 圆环+Send）；`.cb-btn` 24px 双线小钮；模型 mono 族 | 勘不通的钮不渲染 |
| 三态 Send/Stop | busy→Stop danger（优先级最高）→ 有值→Send primary → 空→disabled（原型 §9.2 updateSendState） | 同上 |
| `.ctx-ring` | 22px SVG 双圆 r8.5 stroke 3，dasharray 周长≈53.4，rotate(-90) 顶起点；>80% `data-hot` 转 danger；`.ctx-pop` 236px 构成行 | 勘不到用量不渲染（kit 留演示） |
| `.todo-acc` | tri+标题+分段进度条（done=success/now=spark/空=surface-2，高 6px）+ `.t-item`（done=反色底+✓+划线、now=琥珀边+脉冲点）；增长三拍 | 勘不到 todo 数据面不渲染 |
| `.goal-card` | sparkle(accent)+单行 ellipsis+钮组；`data-phase="blocked"` 琥珀边 | 勘不到 goal 数据面不渲染 |
| `.queue-row` | spark 钟 13px+muted 文案；显隐走闪烁 | 勘不到队列快照不渲染 |

**IME 与草稿**：输入发生在自绘坞的原生 `<textarea>` 上（IME 组字/粘贴/焦点天然成立）；草稿态留存自绘 textarea 内，官方侧仅在提交瞬间被镜像——官方自身草稿逻辑若有（探针勘），以官方为准并注记。

## 3 · 数据流与镜像驱动桥

| 通道 | 方向 | 机制 |
|------|------|------|
| 文本输入 | 自绘 → 官方 | 提交时 native setter（`Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set`）+ `dispatchEvent(new Event('input',{bubbles:true}))` 镜像进官方受控 textarea（React 18 受控组件标准驱动法） |
| 发送/中断 | 自绘 → 官方 | 程序化 click 官方 Send/Stop 原钮（tclose 先例）——保官方行为、状态持久化与校验 |
| 忙闲/phase | 官方 → 自绘 | MutationObserver 盯官方 composer `data-*`/aria 属性与 `div[data-phase]`，驱动 `mcDockState` 状态机 |
| 禁用条件 | 官方 → 自绘 | 官方 textarea disabled/readonly 镜像读取 |
| 家具数据 | 官方 → 自绘 | 探针勘定的服务面/store 快照读取（todo/goal/queue/ctx 用量各自独立，勘定一处亮一件） |

**状态机纯函数**（TDD，CJS shim 出口照 syscard/menus 先例）：
- `mcDockState(state, ev)`——三态互斥：busy（Stop danger，最高优先）→ has 值（Send primary）→ 空（disabled）；ev ∈ `busy/idle/input/clear`。
- `mcTodoSegments(todos)`——进度条分段纯函数（done/now/todo 三段比例）。
- `mcCtxArc(pct)`——dasharray 值计算（周长≈53.4、`data-hot` 阈值 80%）。

**Enter 纪律**（原型 §9.2）：Enter 无 Shift = 发送；busy 时 send 早退；Shift+Enter 换行。

## 4 · 动画纪律（沿用全项目）

无 `:hover`、无 `transition`；按压只 `:active`；一切延时 `CLOCK.next`（禁裸 setTimeout）；`prefers-reduced-motion:reduce` 压 `.01ms` + JS 跳拍；出场 flashIn 三拍、三态切换 accToggle、家具增长三拍（todo-bar.mc-ghost 专用规则连轨道底一起隐）；innerHTML 静态字面量或经 `esc()`。

## 5 · 测试与验收

- **纯函数单测** `test/dock.test.mjs`（node --test）：三态状态机、todo 分段、ctx 弧值、Enter/ busy 早退逻辑。
- **静态纪律**：audit 扩容——宿主 selector 只进 MC_MAP dock 段 + 特征片段核验；hover/transition/裸定时器/esc 全量照旧。
- **活体门禁** `tools/verify-dock.mjs`（照 verify-menus 结构）：
  1. 自绘坞渲染断言（textarea/三态钮/圆环 computed 样式）；
  2. 打字→镜像→click 发送 → 官方会话流真出现用户消息（polling）；
  3. busy 态 Stop 可点（或以官方 busy 属性模拟断言状态机）；
  4. 家具按勘定显隐（勘定项逐件断言）；
  5. 深浅两轮截图 `shots/dock-*.png`；
  6. **拔桥演练**：临时破坏镜像 setter → 自绘坞退场 + 官方 composer 恢复 → 改回复验（结论记 commit message）。
- **探针** `tools/probe-dock.mjs`：Task 1 建（throwaway 保留复勘），结论回填本 spec 附录 A（新建）与 plan。
- **验收流程规则**（沿用多轮裁定）：实现完不自动跑活体验证；活体须用户发起且覆盖多会话，单会话不作数。门禁属实现期验证，不在此列。
- **kit 扩区**（收尾）：检视页「输入坞」分区——composer 三态演示、家具全形态、ctx 圆环、镜像桥示意。
- **文档收尾**：README 工具行补 verify-dock；`prototype/component-dev-notes.md` 追加 dock 落地差异注记（桥实况/勘不通清单/降级实录）。

## 6 · 文件结构（plan 细化）

```
client.js               McDock 模块 + MC_MAP dock 段 + mods/order
src/conv/dock.js        设计参照镜像（CJS shim 出口纯函数）
test/dock.test.mjs      状态机/分段/弧值纯函数测试
tools/probe-dock.mjs    挂载与桥探针（Task 1 建）
tools/verify-dock.mjs   活体门禁（新建，含拔桥演练）
tools/audit.mjs         dock 段特征片段扩容
prototype/component-dev-notes.md  追加输入坞落地差异注记（收尾）
README.md               工具行补 verify-dock（收尾）
```

## Self-Review

- 占位符：家具数据面/挂载入口多处「探针定」——显式探针依赖（Task 1 勘定回填，裁定 3），非 TBD；每处均有定义完整的降级路径。
- 一致性：B 路线与裁定 1/2/4 一致；回退方案 A 与裁定 3 一致；范围边界（ask 向导/排序钮/浮层出栈）与上游文档一致；动画纪律与全项目一致。
- 范围：单一实现计划可承载（估 7-9 任务：探针/原语与镜像桥/纯函数/卡壳三态/家具/圆环/门禁/kit 收尾）；ask 向导明确出栈。
