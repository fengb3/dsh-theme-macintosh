# Macintosh 主题 · 设计文档（DSH 主题 · 方案 B）

日期：2026-08-30
状态：已与用户逐节确认（7/7 节）

## 0 · 背景与目标

将 `prototype/macintosh-workspace.html`（规范源）与 `prototype/macintosh-interactive.html`（交互参照）中的经典 Macintosh（System 7 / 夜间单色 Mac）原型，制作成 DeepSeek Harness (DSH) 的主题。

- **交付路径**：先用动态 Cordis 插件在当前 GUI 快速迭代预览（方案 B：样式覆写为主 + 少量增量 Slot），验证通过后另行立项落地为 DSH 仓库正式主题。
- **组件化要求**：UI 元素归纳为独立组件模块，分别开发、统一拼装；每模块自带示例态，配统一检视页（kit page）支持后续单组件展示。
- **规范源**：`prototype/component-dev-notes.md`（移植手册，含全局风格总纲 §0 与移植核对清单 §13）。token 全集以 workspace 为准。
- **已删节项不复活**：§4b 详情列、§8 瀑布图及笔记 §13.4 列出的死代码 token/图标。

## 1 · 总体架构（方案 B）

一个动态 Cordis 插件，客户端为主，按模块演进：每模块成熟后 append 新 Package（版本化、可回滚）。

客户端插件 apply 时按依赖序装配五层：

1. **assets 层**：`@font-face ×5`（本地 ttf，`font-display:swap`，回退链末端 Noto Sans SC）+ SVG sprite（隐藏 symbol 库注入 body，`currentColor` 化规则照笔记 §2）。
2. **tokens 层**：主题变量用独立前缀 `--mc-*`（双主题：`<html data-theme="dark|light">`，浅色只覆盖差异项，不覆盖 `--desktop-pattern`）。同时把 13 个官方 `--dsw-alias-*`/`--dsw-specific-sidebar-fill` token alias 到 `--mc-*` 等价值，未覆写的官方组件自动大体协调。
3. **CLOCK 单例**：100ms 栅格帧时钟，`ctx.effect` 可逆销毁；`CLOCK.next`/`syncAnim` 与原型同签名（PULSE 2600 / SWEEP 1000）。
4. **组件样式层**：每模块一段 `<style>`，按依赖序注入，`data-mc-layer` 标记归属。
5. **Slot 增量件**（只占 replaceRisk:none 的增量座位）：
   - `sidebar.footer.action` → 主题切换月牙钮（切 `data-theme`）；
   - `shell.overlay` → 桌面噪点画布层（pointer-events:none，置底）+ 检视页入口（见 §2）；
   - `conversation.input.dock` / `conversation.composer.dock` → queue/todo/goal 家具（二期）。

一切副作用（style 元素、sprite、CLOCK、Slot 占用）走 `ctx.effect()`/Slot 自带销毁，插件 stop 即整体干净撤除。

## 2 · 文件组织与检视页

```
dsh-theme-macintosh/
├─ assets/            （已有：fonts / icons / swatch）
├─ prototype/         （已有：两份 HTML + 笔记，规范源）
├─ src/
│  ├─ core/    tokens.js · clock.js · mcfx.js · sprite.js      （模块 1–3）
│  ├─ chrome/  chrome.js · sidebar.js                           （模块 4–5）
│  ├─ conv/    flow.js · dock.js · toolcard.js · overlays.js    （模块 6–9，二期）
│  ├─ responsive.js                                             （模块 10）
│  └─ kit.js   统一检视页
└─ docs/superpowers/specs/2026-08-30-macintosh-theme-design.md
```

- 每模块导出 `{ css, mount?, slots? }`；装配器按序消费；模块可单独 import 进检视页。
- **检视页 `kit.js`**：注册为 `shell.overlay` 入口（默认关闭，工具行卡片/命令打开），点阵 scrim 全屏，按模块分区渲染示例态（按钮五态、pill 五态、工具卡三态、ask 向导等），自带演示数据，脚本驱动复用原型思想。打开检视页不影响真实 UI 主题。

## 3 · 组件模块清单与分期

| # | 模块 | 内容（原型出处） | 期 |
|---|---|---|---|
| 1 | `core/tokens` | 双主题变量全集、字体 5 族、::selection、滚动条、画布噪点（§1/§4） | 一期 |
| 2 | `core/primitives`（并入 tokens.js 样式段） | .btn/.icon-btn/.pill/.field/.tri + mc-pulse/mc-sweep（§5） | 一期 |
| 3 | `core/mcfx` | CLOCK + flashIn/flashOut/accToggle/dockSwap（§0/§1） | 一期 |
| 4 | `chrome` | .win/.titlebar/.statusbar/.menubar 语汇 + z 层级 + 桌面画布染色（§3） | 一期 |
| 5 | `sidebar` | Finder 窗、会话树、mini 形态（§4 侧栏） | 一期 |
| 6 | `flow` | .md、user bubble、inject、reasoning 样式、turn-tail（§5） | 二期 |
| 7 | `dock` | composer 三态、todo/goal/queue、ctx 圆环、ask 向导（§6） | 二期 |
| 8 | `toolcard` | 工具卡三态、图标映射、subcalls/diff（§7） | 二期 |
| 9 | `overlays` | .menu/.dialog/.toast/scrim、hero（§9，dialog/toast/scrim 以 workspace 为准） | 二期 |
| 10 | `responsive` | 三档断点、抽屉（§10） | 二期（随 6–9 各自落地） |

依赖链：`tokens → primitives/mcfx → chrome → sidebar`（一期）；二期模块依赖一期三层。

## 4 · 宿主 DOM 映射策略（三层）

- **层 1 · 官方 token 映射（零选择器）**：13 个官方 token alias 到 `--mc-*`。未覆写官方组件自动获得 Macintosh 配色，无漂移风险。
- **层 2 · Slot 容器锚点（低风险）**：我们占用 Slot 渲染的 DOM 自带原型 class（`.btn`/`.pill`/`.win`…），样式按原型 selector 直抄。这是覆写主体。
- **层 3 · 官方固有元素结构选择器（中风险，集中隔离）**：官方渲染但不改结构的区域（会话滚动容器、消息气泡、composer 卡壳、工具卡壳）由集中映射表 `conv/map.js` 管理：
  - 选择器优先级：`data-*` 属性 > aria/role 结构特征 > class（最后手段）。
  - 开发前先写 throwaway 探针模块在真实页 dump 各区稳定锚点，回填映射表。
  - 映射表是唯一允许出现官方 selector 的文件；失配症状 = 该区域回退层 1 token 配色（优雅降级不破版）。
  - 宿主没有的结构（pinstripe titlebar/menubar 等）**不做**：主窗头部只做层 3 染色；titlebar 语汇保留在 `chrome` 模块与检视页供正式落地用。

## 5 · 动画与状态纪律

- **CLOCK**：单例，`ctx.effect(() => CLOCK.dispose())`。
- **闪烁三件套**：自渲染 DOM 照抄原型；作用于官方 DOM 时仅限映射表声明元素，帧回调一律先校验 `el.isConnected`，包 try/catch（React 重渲染可能中途移走节点）。
- **推理卡**：二期不重写官方 reasoning 渲染，只做样式覆写（琥珀染色、cover CSS-only 近似）；完整五帧流式状态机保留在检视页演示，正式落地再评估接官方流式事件。
- 全局纪律照笔记：无 hover、无 transition、按压只 `:active`、选中只 `.on` 整块反色、`prefers-reduced-motion:reduce` 压 `.01ms`、浅色遮罩三处反转齐全、一切延时走 `CLOCK.next`。

## 6 · 错误处理

- 字体加载失败：swap 回退链，字形回退不破版；CLOCK 启动 try/catch，失败降级为静态无闪烁主题。
- Slot 占用失败：各注册互相独立可缺省（月牙钮挂不上则退化为手动 `data-theme` 切换命令）；单模块失败不拖垮其余。
- 帧回调 DOM 消失：`isConnected` 校验 + try/catch 静默跳过。
- 映射失配：层 3 降级 token 配色。
- Package 激活失败：Run 卡诊断读 stack，append 修复版重试。

## 7 · 测试与验证

1. **检视页回归**：kit 页固定示例态，与 prototype HTML 并排目视比对。
2. **真实 UI 走查清单**：深浅切换遮罩反转、`flow > *{flex:none}`、min-height:0 链、动画纪律终检（照笔记 §13 裁剪）。
3. **`s-md` 基准**：用原型示例会话 markdown 全要素发真实消息对照 `.md` 渲染。
4. **撤除回归**：stop 插件后确认无残留 style/DOM/定时器。

## 8 · 分期交付

- **一期（基础壳）**：`core/` + `chrome/` + `sidebar` 覆写 + 月牙钮 + kit 检视页骨架。交付 = 本 GUI 可见 Macintosh 风格侧栏与画布，深浅可切。
- **二期（会话区）**：flow/dock/toolcard/overlays/responsive，逐模块 append Package + kit 扩区。交付 = 完整主题预览。
- **三期（正式落地，另行立项）**：模块搬进 DSH Web 仓库成正式主题，映射表换官方结构契约，titlebar 等结构级语汇此期接入。
