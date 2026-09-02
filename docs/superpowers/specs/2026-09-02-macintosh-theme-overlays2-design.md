# Macintosh 主题 · hero 空态 + dialog/scrim 换皮（overlays 批 2）Design Spec

> 日期：2026-09-02 · 状态：brainstorming 六节设计经用户逐节确认（2026-09-02 对话存档）
> 上游：`docs/superpowers/specs/2026-08-30-macintosh-theme-design.md` §9（浮层）；原型
> `prototype/macintosh-workspace.html` §9（L766-857 样式 / L2458-2484 hero DOM / L2567-2611 dialog·scrim DOM）；
> 移植笔记 `prototype/component-dev-notes.md` §11（interactive 无 dialog/toast/scrim——三件以 workspace 为唯一规范源）。
> 前批：menus（overlays 批 1，`2026-09-01-macintosh-theme-menus-design.md`）已交付 .menu 体系与
> `src/conv/overlays.js` 模块本体；本批为同文件扩区。

## 0 · 用户裁定（设计前提，2026-09-02 对话四裁定）

1. **范围**：dialog + scrim（官方设置/确认弹窗 + 遮罩）与 hero 空会话页入选；**toast 不做**——
   用户在宿主未见 toast 面，不空转（宿主日后出现再立批）。
2. **hero 芯片行去掉**：hero 只保留 HappyMac 标志 + 大像素标题 + badge + 副标题；无芯片行、
   无模式下拉，模式切换走官方既有入口。
3. **路线双 A**：dialog/scrim 走 **CSS 注入换皮**（dock 批验收轮 2「官方弹层+皮」裁定同族；
   不遮蔽重绘——设置面板官方演化快且是主题切换唯一入口，破一次 = 主题自断生路）；
   hero 走 **自绘遮蔽重绘**（finder 换场/toolcard 遮蔽先例；纯静态零行为，自绘风险低还原度高）。
4. **scrim 只换视觉不动层级**：官方 backdrop 元素换点阵幕皮，z-index 不改，避免对官方层级的副作用。
5. **文案沿原型字面**：标题/badge/副题照抄 workspace 原型（见 §2），不改写。

## 1 · 架构

- **模块归属**：扩 `src/conv/overlays.js`（McMenus 同文件），文件内新分区——McMenus 段后加
  「§B hero 空态」与「§C dialog/scrim 换皮」两段（CSS + mount + teardown）。不开新模块。
- **MC_MAP 扩容**：dialog/scrim/hero 涉及的官方 selector 全部入 `src/chrome/map.js` 新键组
  （探针 Task 1 回填，标 DRIFT-RISK 与勘定日期）；audit overlays 段白名单同步扩容。
- **hero 挂载**（勘定项①定锚）：观察会话列容器——官方空会话态标记在场 → 藏官方空态 + 挂
  `.mc-hero`；有会话内容 → 摘 hero。判定思路复用 McFlow boot 空会话轮询的经验（笔记 §8
  「hero 态无列」陷阱在册）但不共享其状态；observer 驱动，teardown 全撤。
- **dialog 门控**（勘定项②定锚）：与 dock 批 `data-mc-pop` 的 JS 门控**不同**——dialog 由官方
  自开自关，主题 JS 侧不可靠；改**纯 CSS 存在选择器**：锚定官方弹窗容器/portal 特征，官方开着
  即命中。锚失配 = 不命中 = 官方原样，不破版（menus 批兼容承诺同款）。

## 2 · 组件清单

### hero（自绘，纯静态零行为）

居中列 `gap:14px`，构图与值源（原型 L2458-2484 / §11 笔记直抄）：

| 件 | 规格 |
|----|------|
| h-mark | 48px HappyMac sprite；深色 `drop-shadow(2px 2px 0 rgba(0,0,0,.4))`、浅色 `filter:none` |
| h-title | 34px/1.15 像素字宽字距，`em` 染 accent；≤640 降 26px（responsive 顺手，仅此一条） |
| h-badge | sel-bg 底、方角（--r-tag 归零语义）、11px 像素字 `.05em` 宽字距、1px border-soft |
| h-sub | 13px/1.8 --font-ui muted，max-width 420px |

文案（静态字面量，esc 面为零）：`Think Classic,跑点什么。`（title，em 包 `Classic`）/
`MACINTOSH · System 7 复古主题`（badge）/ `经典麦金塔工作区:白窗黑线、条纹标题栏、Finder 会话树。`（sub）。

出场 flashIn 三拍；深浅两态 token 自跟随；无定时器、无 hover。

### dialog 换皮（CSS 注入，分两档按勘定可达性落）

- **基础档（保底必上）**：直角归零、像素字体、token 色板、1px 边、`--shadow-pop` 硬投影；
  内部控件 Mac 化——按钮/输入框/行分隔（`.set-row` 底软线末行去线）、**`.switch` 34×18 方块开关**
  （原型规格：`input:checked ~` 兄弟选择器、knob 2px→18px 硬切、focus 虚线环 ~ 透传）——设置
  面板正好是 switch 密集面。宿主 DOM 无对应结构的控件不强造，原生照常。
- **结构档（官方 DOM 有对应结构才上，勘定裁）**：条纹顶线（::before pinstripe）、左右分栏时
  nav 172px/像素字/`dn-item.on` sel-bg 底、底条 statusbar 化。**官方没有的结构不强造。**
- 确认框（删除会话等小型 confirm）：同款皮小卡形态，勘定有则披、无则略。

### scrim

官方 backdrop 换点阵幕：`radial-gradient` 1px 点 + 8px 栅格（与桌面噪点同栅格语义）；
z 不动；`[hidden]`/条件渲染跟随官方自有开合。

## 3 · 数据流

- hero：observer 回调 → 空态标记在场性判定（布尔，无数据解析）→ 挂/摘 `.mc-hero` +
  藏/显官方空态。无订阅、无 store 消费——比家具批更轻，纯 DOM 面观察。
- dialog/scrim：零 JS 数据流——纯 CSS 存在门控，官方开合官方自理。
- teardown：observer 断开 + `.mc-hero` 摘除；CSS 注入随模块卸载自然失效。

## 4 · 动画纪律（沿用全项目）

无 `:hover`、无 `transition`（压平声明例外）；按压只 `:active`；一切延时 `CLOCK.next`
（禁裸 setTimeout）；REDUCED 压 `.01ms` + JS 跳拍；出场 flashIn 三拍；innerHTML 静态字面量
（本批无动态文本，esc 面为零）。

## 5 · 测试与验收

- **纯函数单测** `test/overlays.test.mjs`（node --test，CJS shim 出口）：hero 构图常量（文案/
  尺寸/类名规约）、空态判定纯函数（标记在场 → 动作枚举）、MC_MAP 新键清单合法性。
- **静态纪律**：audit 自动并入（overlays 段白名单扩容——新宿主锚特征片段反查）。
- **活体门禁** `tools/verify-overlays.mjs`：hero（空会话在场性/构图断言/官方空态藏匿/切会话
  退场）+ dialog（开官方设置 → 直角/像素字/边框断言 → 关 → 恢复）+ scrim（点阵背景断言，
  随 dialog 开合在场性）+ 深浅两遍 + pageerror 零异常 + 失配演练（破坏锚 → 官方原样 → 还原）。
- **验收流程规则**（用户多轮裁定，沿用）：实现完不自动跑活体验证；活体须用户发起且覆盖多会话，
  单会话不作数。**探针是实现期动作。**
- **kit 扩区**（收尾）：检视页「浮层」分区——hero 静态样本 + dialog 换皮对照帧（官方形 vs
  Mac 皮形，静态仿官方 DOM）。

## 6 · 文件结构（plan 细化）

```
src/conv/overlays.js        §B hero（observer/构图/teardown）+ §C dialog/scrim 换皮 CSS；CJS shim 扩
src/chrome/map.js           dialog/scrim/hero 锚键组（探针回填，DRIFT-RISK 标注）
tools/audit.mjs             overlays 段白名单扩容
test/overlays.test.mjs      纯函数测试（新建）
tools/verify-overlays.mjs   活体门禁（新建）
tools/probe-overlays.mjs    勘定探针（Task 1 建，勘定后留复勘用）
src/kit.js                  「浮层」分区
prototype/component-dev-notes.md  §11 追加落地差异注记（收尾）
dist/client-body.js + client.js   重建产物（不手改）
```

## Self-Review

- **裁定覆盖**：§0 五条全部落位（范围→标题与 §2；芯片去掉→§2 hero 构图无 chips；路线双 A→
  §1/§2/§3；scrim 视觉→§2 scrim；文案→§2 表）。无缺口。
- **占位符**：无 TBD；两处勘定项（§1 hero 锚、§1 dialog 锚）显式标记归 plan Task 1 探针，
  与 menus 批「探针先行」先例同构，非遗漏。
- **范围边界**：toast 明确不做且记因；responsive 仅做 hero 标题降档一条（全档断点属独立批）；
  结构档改造以「官方 DOM 有对应结构」为硬前提，不强造。
- **一致性**：`.mc-hero` 类名、§B/§C 分区名、勘定项①②编号全篇一致；mc- 前缀纪律与 token
  值源贯穿。
