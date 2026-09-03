# MACINTOSH 主题 · 组件开发要点（原型 → 正式页移植手册）

> 规范源：`prototype/macintosh-workspace.html`（设计稿，§1–§10 分区 + KIT-CHROME 检视带 + 附录 A selector 门禁）
> 交互参照：`prototype/macintosh-interactive.html`（可交互实现，状态机与设计稿逐行同款）
> 已删节：§4b 详情列（info-win）、§8 瀑布图 —— 无 markup，details 插槽/轨迹可视化一期暂缓，PORT-NOTE 墓碑留在原位。

---

## 0 · 全局风格总纲（设计法则，先读这个）

1. **无 hover**：全主题一切控件不做 `:hover` 态（多处 PORT-NOTE 显式声明）。按压反馈只有 `:active`（反色），选中反馈只有 `.on`（整块反色）。
2. **无过渡**：所有状态切换硬切，零 `transition`。老电脑手感 = 4–5 格逐帧跳进，不做平滑插值。缓动 token（`--t-fast/--t-mid/--ease/--ease-sweep`）全是 `steps()`。
3. **闪烁是唯一出场/消失方式**：ghost（透明）→ flash（白块+扫描线）→ swap（换内容撤块），三拍各 100ms。退场为镜像。浮层、卡片、行、进度条全部走这套。
4. **100ms 栅格帧时钟**：全局 `CLOCK`，一切定时回调与 CSS 动画相位都对齐同一条时间轴 —— 多卡同屏永不交错。
5. **描边驱动**：`--border` 全族不透明实色（规范 transparent 默认的整体例外，65 处 PORT-NOTE 逐处标注）。白窗黑线（浅色）/ 暗窗亮线（深色）。
6. **硬投影**：`3px 3px 0 0` 无模糊单偏移（弹窗级）、输入框小一级 `2px 2px`。
7. **像素锯齿圆**：所有"圆点"用八角 `clip-path:polygon(33% 0,67% 0,100% 33%,100% 67%,67% 100%,33% 100%,0 67%,0 33%)`，禁止 `border-radius:50%`。三处同款：`.pill::before`、`.s-dot`、`.ctx-line i`。
8. **高度瞬切 + 遮罩过场**：折叠体（`.tool-body/.reasoning-body/.group-body/.todo-body`）一律 `:not(.open){height:0}`，开合动画交给四拍刷新遮罩，不给 body 加 transition。
9. **浅色主题遮罩反转**：所有白块（flash/cover/refresh）在 `html[data-theme="light"]` 下反转为黑块 + 扫描线反白。漏一处深浅切换即穿帮。
10. **`prefers-reduced-motion:reduce`**：全局压到 `.01ms`；闪烁是 class 切换不受影响，严格无障碍需 JS 侧检测后跳过 ghost/flash 拍。

---

## 1 · 全局 JS 基础设施（两文件同源，正式页必备）

### 1.1 帧时钟 CLOCK
```js
CLOCK.next(fn, ms)     // 把回调量化到 ≥ms 后的最近栅格沿（Math.ceil((now+ms+1)/100)*100）
CLOCK.syncAnim(el, period, prop)  // 设 --pulse-delay（默认）或 --sweep-delay = -(now % period)ms
                        // 令任意时刻挂上的 CSS 动画与全局相位同步
CLOCK.PULSE = 2600      // mc-pulse 三色周期
CLOCK.SWEEP = 1000      // mc-sweep 条纹扫掠周期
```
- 直接 `setTimeout` 会与全局动画错拍，**一切延时必须走 `CLOCK.next`**。
- `--pulse-delay`/`--sweep-delay` 必须由 JS 注入负延迟，静态 0 会导致多个 run 点各自起拍、交错闪烁。

### 1.2 闪烁三件套
```js
flashIn(el, show)   // 出场：ghost → show()（DOM 插入/hidden=false 在此拍）→ flash → 撤两类
flashOut(el, hide)  // 退场镜像：flash 盖住 → hide() → 撤块
accToggle(card, fn) // 开合四拍：①ghost ②flash ③fn()（.open 高度瞬切）④撤 flash、撤 ghost
                    // dataset.busy 防重入；调 fn 前须清内联 style.height 残留
dockSwap(fn)        // 输入坞 ⇄ 问答卡三拍换装（与 flashIn 同语言，作用于 #cmp-wrap）
```
- `show()/hide()` 回调在帧中途执行，hidden/插入 DOM 必须放回调里，不能与类切换同拍。

### 1.3 interactive 全局函数清单（按职责）
| 职责 | 函数 | 说明 |
|---|---|---|
| 转义 | `esc(s)` | `& < > "` HTML 转义，一切拼 innerHTML 的动态文本必须过它 |
| 分词 | `tokenize(s)` | CJK 一字一词（**无 + 号，勿合并**）、数字/拉丁连续段、空白、单符号 |
| 会话流宿主 | `flowOf(s)` / `flowHost(s)` / `mountFlow(s)` | 每会话独立 flow DOM，`state.flows[s.id]` 留档；切走 remove、切回插回 dock 前 |
| 状态栏 | `statsOf(s)` / `updateStatusbar(s)` | turns/steps/llm/cache/ctx；ctx 圆环 dasharray 按周长 ≈53.4 计算，>80% 挂 `data-hot` |
| 侧栏 | `renderSidebar()` | 整树 innerHTML 重建（无 diff）；run 行重建后 `CLOCK.syncAnim(row)` |
| 输入坞 | `renderDock(s)` / `renderTodo(s)` / `updateQueueRow(s)` | goal/todo/queue 三件家具的显隐编排 |
| 消息 | `appendUserMsg` / `appendInject` / `appendAgentBlock` / `appendRow` / `appendToolCard` | 出场一律 flashIn + scrollBottom |
| 思考卡 | `showThinking` / `finishThinking` / `hideThinking` / `stopTurn` | 流式状态机（见 §5 章） |
| 回复引擎 | `runReply(s)` / `endTurn(s)` | 脚本驱动：shift 取 turn → showThinking → 定时逐块 append → ask 挂起或 endTurn → 队列续跑 |
| composer | `updateSendState()` / `send()` | 三态：busy→Stop danger（优先级最高）→ 有值→Send primary → 空→禁用 |
| ask 向导 | `openAskWizard(ask, s)` 内 `optHtml/stepHtml/readStep/showStep/submitAll/closeWizard` | 完整协议见 §6 章 |
| 浮层 | `closeAllPops(except)` | 所有 `.cb-anchor .menu` + ctx-pop 互斥收起 |
| 视图 | `setView(v)` / `switchSession(s)` / `renderHero(s)` | 对话/轨迹切换、会话切换（flashIn 换 flow）、空会话铺 hero |
| 主题 | `flipTheme()` | 切 `data-theme`；入口 = 侧栏页脚月牙钮（顶栏右上已移除） |
| 模式 | `renderHero` 内模式下拉 / `titleEl` 点击 | hero `.cb-anchor+.menu` 设置 `state.mode` 并回写标题栏；点主窗标题循环 preset（演示） |

---

## 2 · 双主题与资产机制

- **切换**：`<html data-theme="dark|light">`，CSS 变量两套（浅色只覆盖差异项）。浅色**刻意不覆盖** `--desktop-pattern`，共用同一 8×8 噪点瓦片靠 `--bg` 区分。
- **SVG sprite**（body 头 `FIGMA-ASSETS`，`display:none` 的 `<symbol>` 库 + `<use href="#id">`）：
  - 单色位全部 `currentColor` 化随主题换装；white 面位挂 `var(--surface)`。
  - close/zoom box 多色位挂 `--box-line/--box-face/--surface-3`（深浅各自定义）。
  - 品牌图形（Apple/Finder/气球/HappyMac/Watch）手绘保留；功能图标 = Pixelarticons(MIT) 派生，统一 24×24 像素网格。
  - HappyMac/Watch viewBox `0 0 2000 2000`，use 处须显式带 viewBox；Inkpad 编辑器 metadata 已剥离。
  - 正式页图标可映射官方图标组件，特异者保留 sprite。
- **字体**：本地 ttf 相对路径 `../assets/fonts/`，须随主题包分发；`font-display:swap`；回退链末端 Noto Sans SC 离线兜底。

---

## 3 · 数据与状态模型（interactive 的脚本驱动层）

```js
MODES = ['标准模式', '创造模式', '计划模式']   // DSH preset;state.mode 默认标准模式
SESSIONS = [{ id, title, run?, auto?, goal?, todos?[], injects?[{ic,tt}],
  script: [turn[], ...] }]          // turn = block[]，按 500ms 逐块播放
block = { md:'<html>' }             // assistant 正文（含 tail 复制/重发/统计）
      | { tool:{ ic, name, args, state, out, doneOut?, doneMs? } }   // doneOut+doneMs = running→done 延时翻转
      | { row:'retry'|'cap', tt }   // 自动重试行 / 上限行
      | { ask:{ steps:[{type:'radio'|'check'|'open', cap, q, ph?, opts:[{t,d}|{t:'__free__',ph}]}] } }
state = { view, mode, current, sessions, busy:{}, fallback:{}, queue:{}, stats:{}, todos:{}, askMode, flows:{} }
```
- 脚本播完走 `FALLBACK` 兜底循环；`s.auto` 会话点开即自动跑一轮。
- `state.busy[sid]` 存在 = 回合运行中（Send 变 Stop）；`state.flows[sid]` = 会话消息流 DOM 留档。
- **模式（preset）**：主窗标题栏 = `"{会话标题} — {当前模式}"`（轨迹视图 = `"轨迹 — {模式}"`）；hero 下拉菜单设置、点标题栏标题循环切换（演示用）；示例会话 `s-md` 演示 `.md` 全要素语法。

---

## 4 · §1 令牌 + 画布

### 4.1 变量清单要点
**深色 `:root`（夜间单色 Mac：暗窗亮线）**
- 画布：`--bg:#2b2b2b`、`--bg-deep:#1f1f1f`、`--desktop-pattern`（内联 base64 PNG 瓦片）、`--box-line:#9d9dcf` / `--box-face:#31314f`
- 表面：`--surface:#3d3d3d` / `--surface-2:#4a4a4a` / `--surface-3:#575757`；栏面 `--rail-1:#383838` / `--rail-2:#414141`
- 文字：`--fg:#f2f2f2` / `--muted:#bdbdbd` / `--faint:#949494`；描边 `--border:#e9e9e9` / `--border-soft:.5`
- 强调：`--accent:#dadaff`（lavender）+ `--accent-strong/--accent-dim/--accent-ink`；次强调 `--spark:#e8b64c`（琥珀=运行/警示语义）；`--sel-bg:rgba(218,218,255,.26)`
- 状态：`--success:#7ed07e` / `--danger:#ff7a74` / `--danger-ink` / `--warn`
- 阴影（硬投影无模糊）：`--shadow-panel:3px 3px 0 0 .55` / `--shadow-pop:.7` / `--shadow-field:2px 2px 0 0 .35`
- 其他：`--title-stripe:.26`；`--scroll-track:#4a4a4a` / `--scroll-box:#717171`
- 几何：`--rail-w:264px`、`--menubar-h:20px`、`--titlebar-h:20px`、`--r-window:5px / --r-card:4px / --r-btn:4px / --r-tag:2px`、`--bw:1px`
- 动效：`--t-fast:.18s`、`--t-mid:.32s`、`--ease:steps(2,end)`、`--ease-sweep:steps(6,end)`

**浅色 `html[data-theme="light"]`（正统 System 7：白窗黑线）**
- `--bg:#8f8f8f`（桌面灰）、`--surface:#fff`、`--border:#0a0a0a`、`--accent:#8f8fc0`、`--sel-bg:#dadaff`（Finder 实底选中，黑字对比 ≈12:1）
- 状态色降为低亮度可读版；阴影加深（`--shadow-pop` 纯 `#000`）；`--box-line:#545487 / --box-face:#dadaff`
- **不覆盖 `--desktop-pattern`**（刻意，勿补两张纹理）

描边驱动例外：头注声明 86 处 PORT-NOTE、其中 65 处描边逐处标注。

### 4.2 字体策略（@font-face × 5）
- FindersKeepers（边缘小字/状态条/会话标题）+ ChiKareGo（按钮·菜单·正文拉丁）
- Fusion Pixel 12px 缝合：latin + zh_hans 两个族名，CJK 由中文文件回退接住
- **`'ChiKareGo Latin'` unicode-range 别名**：同一 ttf 只截获字母/扩展拉丁/通用标点 —— **数字有意不截获**（走等宽 Fusion Pixel），勿"修复"
- 五族回退链：`--font-display`（ChiKareGo→Pixelify Sans→Fusion zh→Noto SC）/ `--font-ui` / `--font-mono`（FindersKeepers 打头）/ `--font-code`（等宽像素）/ `--font-sb`（侧栏专用：ChiKareGo Latin 打头）
- workspace 另有 Google Fonts 外链与 `--font-serif`（检视带用）；interactive 无外链

### 4.3 画布细节
- body 即桌面：`--bg` + 噪点瓦片 `background-size:8px 8px`
- `::selection` 双主题（深=accent 反白 / 浅=sel-bg 黑字）
- 焦点环：`:focus-visible{outline:1px dashed var(--border);outline-offset:2px}`；`:focus:not(:focus-visible)` 清除
- 15px 经典滚动条：双轨（`scrollbar-width:thin` + `::-webkit-scrollbar`），track 带 border-left、thumb 带 1px 边、**四向 single-button 箭头 SVG**，浅色 4 条覆盖换黑三角；Firefox 无按钮等价物
- `-webkit-font-smoothing:none;font-smooth:never`（渲染提示，无几何影响）

### 4.4 差异与坑
- interactive 删了动效 token/`--font-serif/--warn/--bw`、锁视口（`html,body overflow:hidden`）；正式主题以 workspace token 全集为准
- 滚动条箭头 SVG fill 硬编码 `%23e9e9e9/%230a0a0a` 与 `--border` 耦合，改 token 手动同步 8 条 data-URI
- ctx 圆环 74% 为静态示意值（运行时数据 CSS 不可达）

---

## 5 · §2 基础原语

### 5.1 关键样式
- **`.btn` 双线按钮**：28px 高 / min-width 72px（`.sm` 22 / `.lg` 32 仅 workspace）；`border:1px` + **双内环** `box-shadow:inset 0 0 0 1px var(--surface),inset 0 0 0 2px var(--border)`；字 `600 13px var(--font-display)`；`.primary`/`.danger` 换底色与内环 1px 色
- **`.icon-btn`**：26×26（sm 20）方块，r-tag 圆角，无内环（close/zoom box 语汇）
- **`.pill`**：20px 高胶囊 + `::before` 6×6 八角像素圆点；五态 run(spark)/done(success)/fail(danger)/wait(faint)/accent
- **`.field`**：31px 直角 + `--shadow-field`；`:focus-within` 只换 `box-shadow:0 0 0 1px var(--accent-dim)`
- **`.tri`**：11×11 实心三角，`.open` = `rotate(90deg)` 硬切；workspace 另有 `.dim`
- keyframes：`mc-pulse`（三色硬切 2.6s，亮灭各 1/6 周期，百分比 + `steps(1,end)` 勿动比例）、`mc-sweep`（background-position 0→12px，配 `background-size:12px 100%` + `steps(2,end)` 1s）

### 5.2 状态机
- 存在：`:active`（按下 = 内外圈反色，双环色互换）、`:disabled`（.4 + not-allowed，workspace 版显式恢复默认双环）、变体类、focus-within
- 刻意不做：**一切 hover**、focus 过渡、按下位移、颜色渐变

### 5.3 动画协议
- mcfx 三拍（ghost→flash→swap）是唯一出场方式；refresh 四拍遮罩（workspace `.reasoning/.tool/.group/.todo-acc` 的 `.refresh::after`，interactive 泛化为 mcfx 类，两者等价）
- 相位对齐靠 `syncAnim` 负延迟；周期常量 PULSE 2600 / SWEEP 1000

### 5.4 坑
- 双内环必须成对，`:active` 时两 inset 色都要互换，漏一个出"半按下"怪态
- 八角 clip-path 三处同款，抽共享规则，勿换正圆
- 闪烁不是 CSS animation —— 只抄 CSS 没有出场效果，必须带 JS 帧时钟
- `.field:focus-within` box-shadow 与全局 `:focus-visible` 虚线环并存，键盘导航双提示需取舍
- interactive 的 `pill.run::before` 动画自包含；workspace 写在 §4 与 `.s-dot` 合并 —— 等效

---

## 6 · §3 应用骨架

### 6.1 布局尺寸链
- `.app` 纵向 flex（设计稿 `min-height:100vh`；interactive 锁视口 `height:100vh;overflow:hidden`）
- `.menubar`：20px sticky z:76，白底黑字 + 1px 底线；`.m-apple`(16px) → `.m-sep`(1×12px) → `.m-item`（`.on` 整块反色）；横向可滚但隐藏滚动条（Firefox/WebKit 双写）；**顶栏右上元素已按规格移除**
- `.desk`：`grid-template-columns:var(--rail-w,264px) minmax(0,1fr)`（**主列必须 minmax(0,1fr)**）；设计稿 gap:20 padding:20/24 max-width:1440（规范源）；interactive gap:14 padding:14（演示适配勿照抄）
- `.rail-mini .desk`：56px 细条形态（gap 12）

### 6.2 窗口语汇
- `.win`：白面 + 1px 边 + 5px 圆角 + 3px 硬投影 + overflow:hidden；`.desk > .win{border-radius:0}` 直角特例（**依赖直接子选择器**，DOM 多包一层即失效）
- `.titlebar`：20px pinstripe（`repeating-linear-gradient(180deg, stripe 0 1px, transparent 1px 3px)` 叠 surface-2）+ `::before` 顶部 1px accent 线 + 13px close/zoom box（SVG 三色位）；`.t-title` 自带 surface-2 实底打断条纹、max-width 60% ellipsis；padding 0 26px 给 box 让位；**主窗标题 = `"{会话标题} — {当前模式}"`**（DSH preset：标准模式/创造模式/计划模式，interactive 由 `state.mode` 维护，hero 下拉设置、点标题循环切换）
- `.statusbar`：24px surface-3 + 1px 顶线，FindersKeepers 等宽族，span ellipsis
- `.win-body`（interactive）：titlebar/statusbar 之间标准夹层 `flex:1;min-height:0`

### 6.3 z-index 层级表（完整）
| z | 用途 |
|---|---|
| 60 | 抽屉 |
| 70 | 菜单 .menu |
| 75 | 移动遮罩 .m-mask |
| 76 | 移动顶栏 = .menubar sticky |
| 80 | dialog-mask / .cb-anchor 下拉 / .ctx-pop |
| 84 | 弹窗 .dialog |
| 90 | toast |
| 95 | scrim（最顶） |

非连续刻度（间距 4–6），新浮层按语义插入。

### 6.4 滚动容器（interactive 实现细节）
- 视口锁定：`html,body{height:100%;overflow:hidden}` → `.app/.desk` overflow:hidden → 滚动只在 `.flow/.sb-tree` 内部
- **min-height:0 链**：`.win → .win-body → .flow`，缺一级 flex 默认 min-height:auto 就把窗撑破视口
- **`.flow > *{flex:none}`**：column flex 子项默认可被压缩成细线，此句强制"超高走滚动"；任何同类列表区都要带

---

## 7 · §4 侧栏 Finder 窗

### 7.1 结构
- `.sidebar.win`：`--rail-1` 底 + 整窗 `--font-sb`；sb-head 品牌行（24px Finder 图标 + sb-brand 17px + sb-tag 反色小块）→ sb-actions（New Session primary flex:1）→ sb-listbar（"工作区" + 搜索/视图/加工作区三枚 gh-btn）→ sb-tree 会话树 → sb-foot（Preferences + 主题月牙钮）
- 会话树：`group > group-head(gh-main: tri+folder+g-name 15px+g-count / gh-act 两钮) + group-body(:not(.open){height:0})`
- **`--font-sb` 覆盖段顺序敏感**：必须列在各基础 `font:` 简写**之后**（同优先级后者胜），文件集中一段枚举侧栏全部文案类

### 7.2 会话行状态机
- 行序：`s-slot(order:-1, 15px, margin-left:20px)` | `s-tt(flex:1 ellipsis)` | `s-menu`；空态也保留 slot 占位（列对齐）
- run = `.s-dot` 八角点跑 mc-pulse（`--pulse-delay` 对齐）；done = `.s-ok` ✓ success 色；wait/idle = 空槽
- 选中 `.on`：整行反色 `background:var(--fg)` + **`border-radius:0`**（方角，漏掉出"胶囊"破形）；文字/菜单/✓ 全转 surface
- `.xtra` + `.sb-more`：>5 会话折叠余量，`data-toggle-class="expanded"`；缩进 46px 对齐 s-tt
- `.editing`：行内重命名，field 压 24px；`.drop-into`：`inset 0 2px 0 accent` 顶部金线

### 7.3 两形态 + 切换动画
- mini 形态 = **祖先类钩子** `.rail-mini`（挂 .app 或 demo 容器均可）：desk 改 56px、display:none 掉 name/actions/listbar/tree/pref/**titlebar**，剩品牌图标 + sb-mini 三钮 + sb-foot 纵排；264↔56 硬切无 transition
- sb-anim 三拍播放：ghost → flash → 白块下同时 toggle mini+rail-mini、撤块、解锁按钮（disabled 防重入）
- 开合四拍（data-toggle 机制）：`data-toggle="#目标"` + `data-toggle-class`（默认 open）；①ghost ②白块 ③**此拍才切类** + tri 旋 90° ④撤块；先清 `style.height`；`stopPropagation` 防嵌套按钮误触

### 7.4 interactive 差异
- 会话行全 JS 生成（innerHTML 重建，无 diff）；slot 三态由数据推导（run→点 / turns>0 且 !busy→✓ / 空）；**无 wait 类、无 xtra/editing/drop-into/多分组**；mini 只靠 @media 820；重建后 `CLOCK.syncAnim(row)` 防闪跳

---

## 8 · §5 会话流

### 8.1 组件要点
- `.flow`：`flex:1;overflow-y:auto;min-height:0` + gap 14 padding 16 + **`> *{flex:none}`**
- `.md`：14px/1.8 ui 族；h1–h3 统一 display 600 17px（h2 15/h3 14）；行内 code = sel-bg 底 + r-tag；`a` 染 accent（两文件均有）；pre = bg-deep + 横滚；table 全格线 border-soft、th display 体 surface-2 底；blockquote 左 2px accent-dim。interactive 示例会话 `s-md` 覆盖全要素（标题/段落/加粗斜体/行内 code/链接/引用/ul/ol/pre/table），可作 `.md` 渲染的自测基准
- `.msg.user`：右对齐；bubble = accent 实底 accent-ink 反白、520px、radius 8px（比卡片大一档）；attach：132×92 `.ph` 占位 + IMG 徽 + `.cap` 说明
- `.inject` 四型：surface-2 灰底 + **1px dashed** 虚线边 + 15px faint 图标 + 单行 ellipsis；四型（system-reminder / runtime context / 压缩 checkpoint / skill_content）同款样式靠图标文案区分
- `.reasoning`：surface-3 底；run 态 `color-mix(spark 9%)` 琥珀染色 + r-tag 变 spark；头部 = tri + r-tag + r-sum（内层 `.s-in` position:relative 供白块闪）+ r-dur；体 `pre-wrap` 12px muted；`.cover` = 透明字 + 白块底（浅色反黑）
- `.turn-tail`：复制/重发 icon-btn sm + t-stats 右浮 mono 11px
- `.retry-row`（s-dot 跑脉冲）/ `.cap-row`（tri 前缀）：同款细长条；**工具错误不独立成行**，归 §7 fail 卡

### 8.2 推理卡流式状态机（两文件逐行同款，核心资产）
- **五帧一周期 500ms**：帧 B（白块出现）→ 帧 A（揭开）→ 空 ×3 顿拍；`PER_TICK = 28` token
- **帧 B（t+0）**：`take(28)` → 追加 `span.cover`（不显字）；标题栏 `.s-in` 换字 = **本周期新追加字符**（换行折叠空格、超 44 字 `…+slice(-44)`）+ 挂 `.flash`；scrollBottom
- **帧 A（t+100）**：`T.data += blk.textContent` **合并进持久文本节点**（勿 innerHTML 重建）→ `blk.remove()` → 标题撤 flash；取尽且 `st.done` 则收尾，否则 `pause=3`
- **出场**：折叠态 flashIn（只见标题行流式摘要）；点开走 accToggle 四拍
- **收尾协议**：`hideThinking` 置 done；无在途 cover 立即 finish，否则等帧 A。`finishThinking` = flashOut：摘 run/open、s-in 定格正文**前 26 字**摘要、清 flash、r-dur 写实际秒、tri 复位。`stopTurn` = cancelled + hide + 300ms 兜底
- 坑：tokenize 一字一词（CJK 无 `+`）；`blk` 漏置 null 卡死帧 A；tick 开头校验 `st.card === card`（防切走会话旧卡继续写）；展开态不裁行、卡片持续长高（滚动容器必须 flex:none）

### 8.3 宿主差异
- interactive `flowOf(s)` 每会话独立 flow DOM 留档（思考卡/工具卡/历史切走不丢）；workspace 静态单流陈列

### 8.4 flow 落地差异（2026-08-31 二期实录，host 0.1.1-rc.2）
- **banner 结构位选择器**：宿主 `.md-code-block`（全局稳定类）内部无锚——语言条+复制钮 banner 只能走
  `>div:first-child` 结构位；pre 透明也靠 wrapper 兜底（裸 pre 值同）。banner 换版即失配回退官方，不破版
- **:has() form 图标**：注入条四型细分靠 `:has([data-context-form=…])`（Chromium 105+）；**form 属性仅展开态
  渲染**——折叠行恒出 doc 兜底图标（MC_FLOW_ICONS 映射 form→doc/list/copy/clock）。宿主原图标链深达
  `[data-disclosure-row]>span:first-of-type>span:first-child>svg:first-of-type`，隐藏它同样要计入包装层
- **TurnStatus 宿主特有件**：`flowColumn [role="status"]` 运行中状态行（原型没有）；同款 s-dot 负延迟脉冲，
  经 mount SYNC 管道对相位（`--pulse-delay`）
- **command 卡壳仅色壳**：`kindCommand [data-variant="others"]` 三态只覆写边色（默认 border / running spark /
  error danger），标题条/图标/输出体细节留 toolcard 周期
- **data-slot 出口包装层（本周期最重要的宿主知识，裁定10）**：keyed slot 出口一律多包一层
  `div[data-slot=…]`；**`display:contents` 只影响布局、不减选择器深度**——结构位选择器必须把这层数进去。
  实锤两例：气泡四层锚 `:is(user,steering)>div>div>div>div`（flowItem>data-slot 包装>userRow>userStack>bubble，
  哈希三件套 gdEzaW_*）；`mdRoot` 一层值命中的其实是包装层（原两层值已修正）。空 images slot 也可能有盒性
  差异（display:contents 无盒——取「有 ClientRect」的命中者才是真气泡）
- **气泡四层锚**：同上——四子级直击宿主 `.bubble` 类；底色另走 `--dsw-specific-bubble` 变量通道
  （overrideTokens 供值），与选择器通道分层降级

### 8.5 flow 验收三轮差异（2026-09 实录，host 0.1.1-rc.2）
- **开合动画统一协议（五拍）**：用户裁定一切显示/隐藏/换形/换内容动画与原型 `accToggle`（§7 注释 L1290）
  逐拍同款——t0 ghost → t100 flash 白块 → t200 被遮内容瞬变（可大可小）→ t300 撤块 → t400 内容显回。
  lib `accToggle` 与 McFlow `cardToggle`（宿主卡版，fn=空转+清残高）均已对齐；宿主卡因 React 自管开合，
  捕获拍（t0 ghost）必须先于宿主 onClick 才能遮住瞬切
- **running think 摘要「积攒—吐出」**：宿主摘要流式改字=滚动跑马灯观感，须冻结回显（`textContent`
  回写 frozen 值）≥400ms，周期末白块（`.mc-line-flash`）盖住→文本瞬换积攒尾部（≤44 字符，原型同款窗口）
  →100ms 撤块显现；我方回写值==frozen 的自触发 mutation 靠「值相等即跳过」判别，不丢积攒
- **产物文件 chip（dsh-client-ui-deliverables）**：`[data-turn-tail]` 后代 `button` 规则会误伤
  `P4kPIW_file` 文件钮（宿主按文件名测宽，被锁 20×20 方块）——钮壳规则必须收窄到 actions 行
  （`>div:last-child`）；chip 皮肤与 measure 探针同类复用（测宽即所见）；`.P4kPIW_*` 为 build-hash
  类，无 data-* 稳定锚，DRIFT-RISK 入 MC_MAP
- **flowColumn 两个生命周期陷阱**（McFlow mount）：① boot 停在空会话（hero 态无列）时轮询 8s 上限会
  耗尽，之后切会话永不挂载——轮询不限次；② 切会话时宿主整体替换 `[data-chat-flow]` 节点，绑列节点的
  observer/click 随之失效——一律绑 `document.body`（域限定由 MC_MAP 选择器在 closest/matches 内完成）
- **headless 验证节流**：Playwright headless 下 100ms 栅格拍会被节流到 ~200ms/拍，五拍全程 ~800ms；
  验证脚本采样窗口须按 2× 放宽，勿误判卡死

### 8.6 think 卡整体重写（2026-09 验收四轮实录，host 0.1.1-rc.2）
- **组件化路线（用户裁定）**：不再在宿主 ReasoningRow 上做 CSS/观察器干预——遮蔽
  `conversation.chat.node` keyed 槽 `assistant-step`（priority:-1），自建 McAssistantNodeView
  （AssistantMarkdown L9476-9537 平移：text→宿主 primitives MarkdownText 保真、reasoning→自研
  McThinkCard、image→renderMessageImages、tool-call 跳过）+ McThinkCard（原型 showThinking
  L1362-1450 的 React 版）
- **缓冲区 + 定期吐出（核心模型）**：text prop 增量先进 React state 缓冲；每 500ms 周期
  （400 顿 + 100 揭，CLOCK 栅格）吐 ≤140 字：摘要 `.s-in` 只装本次新字（白块=span 宽=字宽，
  **零测宽**——被盖元素本身就是文本容器）+ 正文追加 `.mc-app-cover` 行内白块（color:transparent
  同理）；结束定格前 26 字首行。宿主整段重写（前缀不符）时从头再来（mcThinkTick 纯函数可测）
- **开合五拍真延迟 flip**：自有 DOM 才能做到「几何变化发生在白块遮盖下」——lib accToggle 的
  flip 回调在 t200 拍执行（.open 切换），live 实测 body 高度 0→918 精确发生在遮盖期间
- **ghost 整卡透明**：`.mc-ghost` 须 `background/border-image/box-shadow/outline:transparent!important`
  （仅子内容 opacity:0 会漏出卡底，用户裁定「先让整个卡片变透明」）
- **primitives 直取**：`require('@deepseek-ai/dsh-client-ui-primitives')` 在 loader 工厂域无需
  inject 声明即可解析（注册表全局；缺席静默 null→不遮蔽，宿主原生渲染兜底）——避免了改
  package.json dsh.client 字段的宿主重启成本
- **槽位 props 全量**：chat.node 槽把 useSessions/useTurnData/fileMentions/renderMessageImages/
  node(data.blocks/status) 全数传入遮蔽组件——mentions 的 owner 判定可复刻，仅 t/locale 需自带
- **摘要行五阶段节拍（验收五轮，用户逐拍定义）**：每拍 100ms、500ms 一循环——
  A 旧字全透明(.s-in.mcut{color:transparent}) → B 白块盖住(.flash) → C 文本瞬换新字
  （span 宽即块宽，白块随新字变宽；被盖元素=文本容器，零测宽） → D 撤两类新字显现 → E 滞空一拍。
  live 采样序列 `-, mcut, mcut+flash(旧), mcut+flash(新/w变), -` 与之逐拍对应

### 8.7 菜单落地差异（2026-09-01 菜单批实录，host 0.1.1-rc.2）
- **自绘兜底 vs 槽路径实采**：宿主菜单无 keyed 槽可遮蔽（MenuPortal 走 React 受控渲染）→ 弃槽路径，
  全部自绘 `.mc-menu`（原型 §9 直抄换 mc- 前缀）挂触发钮 offsetParent（`.mc-anchor{position:relative}`）；
  官方原生菜单走 MC_MAP.menuPortal 藏匿样式 `display:none!important`——**藏未删**（节点仍在 DOM，
  兼容层证据 `style[data-mc-menuhide]`）
- **onSelect 不可伪造**：宿主菜单项是受控 React 组件，外部 `click()`/合成事件皆无法触发其 onSelect →
  接线全部改走**官方服务面**（sessions.binding().session.rename / sessions.fork / workspaces.archiveSession
  / workspaces.rename/delete / sessions.create / workspaces.create），动作外层 try/catch 失败静默、
  官方状态为准
- **inject 补 workspaces 教训**：workspaces 服务不在 inject 直达面时 `ctx.workspaces` 为 undefined，
  须经 `ctx.get('workspaces')` 可选读取兜底；但常驻 client.js 的 inject 数组漏写 `"workspaces"`
  会连 get 都拿不到——package.json `dsh.client` 声明与常驻导出 inject 两处都要补（Task 5 fix round 1）
- **勘不通被滤除的菜单项清单（mcMenuItems 自动过滤）**：view 菜单 viewGroup（按工作区分组）/
  viewSortTime（按时间排序）——宿主无对应读写服务且 onSelect 不可伪造 → 不写 WIRING 键 → 项不出现 →
  整菜单静默 no-op（控制器裁定：不渲染空壳）。图标勘定：#i-px-box/#i-px-list 不在 sprite →
  归档用 #i-suitcase、排序用 #i-px-clock
- **对齐参照=最近裁剪容器（Task 7 浅色 QA 发现）**：`.mc-sb-tree`（overflow:auto）会把向左溢出的
  菜单右缘拦腰截断（首跑实证 group 菜单 r=467 > tree r=293）——openMenu 对齐参照从
  `window.innerWidth` 收紧为「最近 overflow 祖先右缘」（向上遍历取最小 right，无则退回视口宽），
  靠右触发钮（分组头 dots/新建）自动翻转 right 对齐；`mcMenuAlign` 纯函数签名不变，只传更严的 limit
- **浅色形态**：菜单仅依赖 --mc-surface/--mc-border/--mc-shadow-pop/--mc-danger/--mc-accent，
  深浅两套 token 直通，无需专门浅色规则（QA 实拍：白底黑边硬阴影 ✓、danger 红 ✓、on 选中 accent ✓）

### 8.8 输入坞落地差异（2026-09-01 dock 批实录，host 0.1.1-rc.2）
- **B 路线全自绘 + 镜像驱动桥实况**：槽通道全零命中（部署源 chunk 扫描无 composer 输入槽）→
  自绘坞挂 `[data-composer-seat]` 席位插入（官方卡 `closest` 可命中；seat 在 parentElement 链 5 级
  之外，勿用 parentElement 兜底猜位）；官方卡 `[data-composer-card]` 经 `html[data-mc-dock-on]`
  `display:none!important` **藏未删**（单输入框红线）。桥通道实测：`composerField`=
  `[data-composer-card] textarea`（原生 textarea 非 contenteditable），setText 走
  `HTMLTextAreaElement.prototype` value **native setter + input 事件**（探针 mirrored:true、
  官方 Send disabled true→false 真翻转）；`composerSend`=`[aria-label="发送消息"]` **程序化
  click** 为唯一发送通道（官方钮 disabled = 官方拒绝 → 保留草稿不降级）。
- **挂载时序**：live 实测主题 apply（style 注入 788ms）**早于**宿主 React 渲染官方卡（912ms）
  → 一次性探测必败且观察器只在挂载成功后注册 → CLOCK 400ms 栅格**晚挂载轮询**候卡（McFlow
  poll 同款先例）；CLOCK 缺席（装配域不可达）退一次性语义，探针失配 = 静默退场官方照常。
- **MISS_MAX=3 观察器去抖与桥断退场**：MutationObserver（childList/subtree + attributes 过滤
  data-phase/disabled/hidden）——瞬时失配（切会话/React keyed 重挂 1-2 批）不桥断，连续 3 拍
  官方件缺席才判真失配 `bridgeFail`：坞 flashOut 退场 + 摘 `data-mc-dock-on` + 观察器断连；
  **rootEl 置空前捕获**（flashOut hide 回调异步派发，触发时外层 root 已置空，闭包必须捕 el 才能
  真移除）；reload 还原被演练破坏的 value 描述符 → 轮询重挂载（verify-dock 断言5 演练 GREEN）。
- **IME isComposing 守卫**：自绘 textarea keydown 中 `e.isComposing` 早退——组字期 Enter=选字
  确认不得发送（中文主场景，Task 5 fix 轮补）。
- **勘不通被滤除清单（全部有定义完整的降级路径）**：数据面 todo/goal/queue/ctx 四件 regex 面
  勘不通 → `DOCK_DATA` 空表静默（家具零渲染=合法终态）；`composerStop`（busy 态才渲染，idle 无
  此钮）/`composerPhase`（data-phase=页面态 hero 非忙闲）两键空串降级（改读 Send/Stop
  disabled/hidden）；composer-bar **左组**（斜杠命令/权限位）与**模型位**勘不通不渲染 → bar 仅
  `.cb-right`（Send/Stop）；field 简化为纯 textarea（原型 lead 加号位随 Task 5 卡壳简化未移植，
  与活体一致）。
- **sprite 勘定结果（Task 8 收尾勘定）**：dock 标记引用六符号——`#i-px-clock/#i-check/#i-tri/
  #i-sparkle` 在库；`#i-px-send/#i-px-stop` 缺 → 照 workspace FIGMA-ASSETS L952-953 同 id 几何
  补进 sprite.js（菜单批 #i-px-clock 补缺同款先例），无重映射。
- **ask 向导出栈**：§0 裁定 5——ask-card 向导不落地本批（数据面同勘不通；自绘坞被问答题卡接管
  的 swap 动画原型专有，宿主 ask 流为官方渲染）。
- **Task 8 浅色 QA 修复（计入 docs(mc-dock) 提交）**：① `.btn` 系 scoped 补齐——renderCmp 照原型
  镜像 `btn sm primary/danger` 类而主题原语名 mc-btn，活体 Send/Stop 自落地起裸奔（浅色实拍坐实
  浏览器默认钮）；② `[data-mc-dock] .btn[hidden]{display:none}`——author display:inline-flex
  特异性压过 UA `[hidden]` 会令 idle 双钮同显（修复 .btn 时引入、同批修死）；③ textarea
  `::placeholder` 染 faint（原型 §2 `.field::placeholder` 同款，初版只覆盖 input）；④
  todo-acc 开合 **tri 同转**（原型 L2746 瞬切拍 toggle，初版接线漏）+ `svg.tri.open` 旋 90° 规则。
  kit 输入坞分区（composer 三态+本地 mcDockState 轮播/todo/goal/queue/ctx pct74）随批陈列于检视页。

### 8.9 家具区落地差异（2026-09-02 furn 批实录，host 0.1.1-rc.2）
- **上批「数据面全零命中」翻案**：dock 批页面 chunk 扫描（script src 相对导入图 80 文件上限）未达
  goal/plan/todo 包；furn 批改本地部署包直读（`C:\Users\fengb\node_modules\@deepseek-ai\`，rc.2 同版本）
  勘出全量数据面（recon 记录：specs/2026-09-02-macintosh-theme-furniture-recon.md）。
- **数据通道实况（纯 JS 零 React）**：`ctx.sessions.list`（`getSnapshot().current` 换会话检测）+
  `binding(cur).session.subscribe`（queue=ConversationSnapshot.queue 瞬态收件箱）+
  `session.projections.faceOf('todos'|'goal')`（ObservableSnapshot{getSnapshot,subscribe}，身份稳定
  可先订后值；undefined=能力缺席、null=合法空态，均静默）。
- **纯只读裁定（spec 裁定 2）**：`ISession` 的 prompt('queue')/updateQueue/cancel/command('/goal')
  写通道一概不接；goal-card 原型 Pause/Edit/Delete 钮组不落地（写通道候选=官方 GoalBar 镜像驱动，
  其挂 conversation.input.dock 槽、goal 设置期才在场，另批勘定）。
- **todo 归一**：宿主 `TodoItem{content,status:pending|in_progress|completed}` → `{done,now,text}`；
  **in_progress 全标 now**（宿主允许多行并行；原型单 now 语义仅在零 in_progress 时兜底——首未完成
  标 now）；开合态跨重绘保持（重建前读 open 类回放，tri 同转）。
- **goal 归一**：complete → 整件不渲染（官方 GoalBar 同款终态消失）；paused/blocked 显 gc-badge 文字
  徽标（+paused 边框降灰、blocked 琥珀边沿用）；轮次「第 N/M 轮」进 title 提示（roundsStarted=0 或
  maxGoalRounds 缺席不显）。
- **queue 文案**：`队列中还有 N 条消息 — 第一条:<preview||text>`，仅计 `placement==='queued'`
  （steering/context 不混入——steering 是转向即时消费，非排队追加）。
- **差分重绘纪律**：四通道唤醒收敛 furnSync → 签名 `JSON.stringify([queueText,todos,goal])` 比对，
  变了才 renderFurn（innerHTML 重建）——list 通知高频（running 态增量），无差分会自激重绘；
  换会话清态重订（跨会话不留残影）；teardown 四退订。
- **门禁语义翻转**：verify-dock 断言6 由「全静默零匹配」改为「在场=结构断言（queue 文案正则/
  todo bar+meta+行/goal 相位枚举）/缺席=静默合法 INFO」；真实数据呈现归用户活体验收
  （需含 todo/goal 实数据的会话，门禁会话无数据）。
- **busy 回车入队修复（2026-09-02 用户报障：busy 态回车无效）**：dock 批把原型 §9.2「有队列时
  入队不直发」简化成了 busy 早退 → agent 运行中打字回车什么都不发生。修复：busy 态 Enter =
  镜像官方 textarea + 派发**合成 keydown Enter**（`keyCode:13` 冒泡）驱动官方 onKeyDown 入队
  （勘定 probe-busy-enter B：官方收讫即 `defaultPrevented`+受控清稿，消息即时入流为转向行）——
  官方件唯一通道纪律保持，不直调 `prompt('queue')` 服务面。收讫信号用 `kd.defaultPrevented`
  （同步、免轮询），另置 600ms 幽灵稿清扫拍（慢 flush 角落撤镜像）；官方未收（宿主改版）则撤
  镜像留本地稿可重试。门禁断言8b 固化（稿清空/无幽灵稿/消息入流）。idle 回车与 IME 组字守卫
  勘定无恙（probe-enter-send：纯键序回车发送正常，isComposing 跳过语义正确）。

### 8.10 dock 完全替代官方（2026-09-02 dock2 批实录，host 0.1.1-rc.2）
- **官方 input dock 勘定**：renderer SlotOutlet 每槽 `div[data-slot=<key>]` display:contents 包装；
  `conversation.input.dock` 三注入 = todo（conversation 包 order0）/goal（`[data-goal-bar]` order10）/
  queue（QueueDock order20），渲染于 composerStack **官方卡之外**——dock 批藏卡不藏它，故与自绘
  家具重复（用户报障④）。修复：`html[data-mc-dock-on] [data-slot="conversation.input.dock"]`
  {display:none!important}（MC_MAP.composerDockSlot）——自绘坞完全替代；官方 QueueDock 队列删改
  随整槽退场（写通道遗留候选）。
- **goal 动作镜像（用户报障⑤）**：GoalBar 全形态部署包直读——常驻条钮 aria（暂停目标/恢复目标/
  编辑目标/清除目标，按相位条件渲染）+ 编辑态受控 `input[aria-label="目标内容"]`（Enter=存/Esc=撤）
  + 保存目标/取消编辑。自绘卡四钮=click 官方钮（display:none 内 click 先例）；Edit 四步=官方编辑态
  开启→自绘内联输入（.gc-input，Enter/Esc/IME 守卫）→`mcMirrorAny`（textarea/input 按原型选
  描述符）镜像草稿→click 官方保存；goal 变更（text|phase 键）重置编辑态（官方 goalId 同款）。
  活体全周期实证：/goal 建→Pause(paused 徽标)→Resume→Edit(文案回写)→Delete(退场)。
- **todo 变换闪烁（用户报障③）**：renderFurn 重建差分（text→done/now/todo 基线），类变行/新行
  flashIn 三拍（`mcfx mc-ghost`→拍毕净）；活体实证：清单首现三行全闪、完成步骤一后 done 行闪 +
  fallback now 迁移行（步骤二）同闪。
- **todo 初始折叠（2026-09-02 用户裁定）**：开合态改入注册表状态 `furnLive.todoOpen`（初值 false=
  折叠；点头开合写入；跨重绘保持；换会话重置折叠）——替换原「DOM 读 prevAcc 类」的隐式保持
  （其初值恒 open）。活体实证：首现折叠（body 高 0）→点头展开→数据重绘后展开态保持。
- **furn 内部布局（用户报障②）**：`[data-mc-dock-furn]` 此前普通 block——子件零间距（.dock flex
  gap 只及 furn↔composer）——即「todo 与 goal 无间隔」根因。修复：furn 自身 flex column gap:8 +
  `.todo-acc + .goal-card{margin-top:8}` ⇒ 实测 16px。
- **z 遮挡（用户报障①）**：官方条（面板 position:relative+负 margin 叠压带）藏匿即根治；自绘家具
  全静态位，弹菜单（body 挂载 .mc-menu z:70 / 官方注入层 z:9000）恒在上——活体 elementFromPoint
  命中实证（模型弹层中心命中弹层自身）。
- **家具 slot 注册表**：`MC_DOCK_FURN`（{id,order,get}；内置 queue=0/todos=10/goal=20）+
  `MC_DOCK_API.slot(id, order, get)` 注册/注销——自绘坞支持插入新元素（官方槽能力对等）。
- **弹层被 todo 遮挡修复（2026-09-02 用户报障续）**：`position:fixed` 现代浏览器**恒创建层叠
  上下文**——pop 门控期官方卡（fixed,z:auto）自成上下文，卡内弹层 z:9000 被困；自绘坞在
  composerSeat 树序靠后，同为 positioned z:auto 按树序后赢 → todo 盖住整卡（弹层上半/下半
  露出、中段被 todo 条盖住，probe-menu-z 截图+命中实证）。修复：门控卡规则补
  `z-index:9999!important`（抬卡即抬弹层；门控期卡体仅 1×1px 透明靶，视觉无副作用）。
  活体复测：cmd/perm/ctx 三弹层与 todo 重叠区 elementFromPoint 全命中 MENU。门禁断言1d
  固化（pop 门控期卡 computed z=9999）。

### 8.11 工具卡落地差异（2026-09-02 toolcard 批实录，host 0.1.1-rc.2）

- **挂载点是一颗 keyed 键**（部署包直读勘定，本地安装包与运行宿主同版本）：工具卡不是
  独立 chat node kind 皮——`conversation.chat.node` keyed 槽的 **`tool-call`** kind →
  `dsh-client-ui-tool` 的 `ToolCallTree`（根卡+子调用树）；树内每次调用再经
  `tool.call.toolview` keyed 槽按**精确工具名**派发（bash/read/edit/write/grep/glob/
  web_search/web_fetch/todo_write/ask_user_question 有官方专用行，其余走 GenericToolCard
  兜底；无通配键 → mcp__* 开放集合无法逐名接管）。**遮蔽父级 `tool-call` 一颗键即整体
  接管**（McTool，priority:-1 同 think/syscard 先例）；primitives 缺席不注册，官方
  ToolCallTree 兜底（拔演练实测：自绘卡退场、官方 6 行回归、其余 19 节点无恙）。
- **数据形状**：node.data.root = RunningToolCall{name,argsRaw,callView,subCalls}（运行形，
  无 kind）| ToolResultNode{kind:'tool-result',call:{name,argsRaw}|null,isError,error?,
  content,callView,resultView,subCalls}；`call` 为 null（窗口截断）时卡头以 callId 兜底。
  **官方 state 推导**：`!done→running；error?.code==='interrupted'→stopped；isError→
  error；否则 ok`（照抄为 mcToolState 纯函数）。
- **结构化卡面材料挂 wire view**：callView/resultView.card ∈ generic/terminal/diff/
  read/search/web，载荷随 view 携带（diffs/lines/files/paths/sources），官方 card models
  只是防御 narrowing 薄层——我们同法自建 mcViewCard（坏载荷/未知 card 值 → null 走
  generic），组件层 shape→kind 映射后喂 primitives 块（TerminalBlock/DiffBlock/
  ReadBlock/SearchBlock/WebBlock 均在 primitives 导出面）。search 块组件判别字段叫
  `kind`（wire 叫 shape）；web 块 kind 与卡面 kind 撞名，narrowing 改名 webKind。
- **内容体两级**：结构化 view 命中 → 宿主 Block 保真；未命中 → JsonBlock(argsRaw) +
  content text 连缀（20k 截断）。error 态展开体首行红显 `error.name: error.code`。
- **行为（用户裁定 2026-09-02 二轮修订）**：首登场一律折叠；落地不刻意折叠（不改用户手动
  开合态）；running 头条纹扫掠 `--sweep-delay` 组件内 CLOCK.syncAnim
  相位对齐（syscard retry 先例）；开合 accToggle 四拍；出场 flash 由 McFlow 观察器在
  flowItem 行级供给（每张工具卡是独立 tool-call 节点 = 独立 flowItem，免费获得出场闪）。
- **图标 = DSH 默认工具图标 + 像素渲染（用户裁定 2026-09-02 三轮，替换原 sprite 语义映射表）**：
  变体表 TOOL_VARIANTS 照抄为 mcToolVariant（bash/pwsh→bash、read/web_fetch→read、
  web_search/grep/glob→search、write、edit、run_code→code、cordis_inspect 系→read、余→others）；
  图标组件 = primitives 的 IconSearchOutline16/IconBrowseOutline16/IconApiOutline14/
  IconEditOutline16/IconCodeOutline16/IconSparkle16（VARIANT_ICONS 同源）；leading 照抄官方
  leadingFor：error→StateDot(error)、stopped→StateDot(warning)。像素渲染 = 
  `.mc-t-ic svg{shape-rendering:crispEdges}`。sprite 六只新图标保留（kit/他处备用）。
  委托命中面三轮补：JsonBlock IN 钮是裸 button（无 aria/data 钩子，方向读 ▸/▾ 文案前缀），
  委托选择器扩 `button` 并加 mcPanelOpen 方向判定。
- **四轮修订**：IN 裸钮本身不闪，flash 只打在展开收起的内容部分（JsonBlock = head 下一兄弟
  pre.body；收起时捕获期先存 preContent）；方向判定不变，调用即现成 flashIn/flashOut。
  坑：`CLOCK.next(fn)` 缺省 ms → `Date.now()+undefined` = NaN 调度永不触发，必须显式传 0。

- **参数摘要**：按工具名优先键表（grep→pattern 非 path；web_search 实际键是 `queries`
  数组，取首两个 ' / ' 连接），白名单兜底；非法 JSON → argsRaw 单行化；空形参 → callId。
- **浅色陷阱**：WebBlock 根底色为宿主**硬编码深色**（非 token），浅色不翻转——
  `html[data-theme="light"] .mc-tbb-web{background:var(--mc-surface)…}` 翻白（仅 web 块
  挂 mc-tbb-web 类；terminal/diff 等块宿主两主题同为深底，视为嵌入终端语汇保留）。
- **audit 协同**：自有 CSS 三态用类（.mc-run/.mc-fail）不用 `[data-state=…]` 属性选择器
  ——该片段在 audit 的宿主选择器特征清单内（官方 DOM 有 data-state），自有 DOM 用它会
  误触 MC_MAP 泄漏检查。

- **展开体二轮裁定**：内容直角化 + 像素字体（`.mc-tb-in,.mc-tb-in *{border-radius:0;
  font-family:var(--font-code)}` !important 压平宿主块）；展开体内宿主折叠面板点击 → 方向判定
  （捕获阶段读 aria-expanded）+ flashIn/flashOut 闪烁（宿主自身切换不拦截，CLOCK.next(100) 补闪）。
- **已知限制**：inspect 轨迹跳转、openFile 文件链接不渲染（原型无此件；官方 DetailsPanel
  另有入口）；官方专用行（BashRow 命令描述等）摘要增强不保留；stopped 态 pill 沿用 done
  形（「已停止」进摘要后缀）。




---

## 9 · §6 输入坞

### 9.1 家具清单
| 家具 | 要点 |
|---|---|
| `.dock` | flex:none 纵向 gap:8，rail-2 底 + 上边线 |
| `.queue-row` | 队列条：spark 钟 13px + muted 文案；显隐走闪烁 |
| `.todo-acc` | 折叠清单：tri+标题+分段进度条+计数；`.todo-bar` 段 i：done=success / now=spark / 空=surface-2，acc 内高 6px `min-width:0`（收缩由进度条吸收）；`.t-item`：done=反色底+✓+划线、now=琥珀边+6px ::after 脉冲点；增长三拍（todo-bar.mc-ghost 专用规则连轨道底一起隐） |
| `.goal-card` | sparkle(accent)+Goal+单行 ellipsis+钮组；`data-phase="blocked"`=琥珀边；Pause↔blocked、Delete=flashOut 消失、Edit=prompt |
| `.composer` | surface+边+硬投影；textarea field min-height 44；`.busy .field` 底 `color-mix(fg 4%)` |
| `.composer-bar` | 左组（斜杠命令 data-pop + 权限下拉）+ `.cb-right{margin-left:auto}`（模型下拉+ctx 圆环+Send） |
| `.cb-btn` | 24px 双线小钮（同 .btn 双 inset）；`.model` 用 mono 族；`.cb-anchor .menu` 绝对定位 `bottom:calc(100%+6px)` **向上弹**（避 .win overflow 裁切）z:80 |
| `.ctx-ring` | 22px SVG 双圆 r8.5 stroke 3，arc=stroke-dasharray（周长≈53.4），rotate(-90) 起点顶；`data-hot`(>80%) arc 转 danger |
| `.ctx-pop` | 236px 硬切换显隐；构成行 = 八角点 + 直角扁长 cl-bar；字族 sb |
| `.ask-card` | 接管输入坞；aq-corner（折叠 tri + close 叉）/aq-cap/aq-tt/aq-chrome（pagination+warn+跳过+下一题） |

### 9.2 composer 三态（updateSendState）
```
busy → Stop · danger · 可点（最高优先级 return）
否则 has = input 非空 → Send · (+primary) · disabled=!has
```
触发点：input 事件 / runReply 置 busy / endTurn 复位。Enter 无 Shift = 发送；busy 时 send() 早退；有队列时入队不直发。

### 9.3 ask 向导协议
- 单卡多题 `.aq-step`（display 切换）；radio 互斥 / check toggle / 点 INPUT 仅加 sel；选项图标 = 双 SVG display 切换（ico-rdo/chk + -on）
- **isAnswered/readStep**：open = textarea trim 非空；选项题过滤 `.sel`，**自由项须 input 非空**（空值自由项被过滤 → 可能 sel 非空但未答）
- 末题 nextq 变"提交"；被拦 = warn.show + `findIndex(!answers[i] && !readStep(i))` 回跳第一道未答
- submitAll 再读一遍兜底 → "第N题：a、b"·分隔；全空 = 已跳过
- closeWizard：dockSwap 换回 composer → appendUserMsg(答案) → 700ms 后 runReply 续跑（ask 期间不收运行态）
- 折叠角三拍（ghost→flash→toggle .folded）

### 9.4 浮层互斥
- `closeAllPops(except)`：所有 cb 菜单 + ctx-pop；data-pop 点击 stopPropagation → 互斥 → flashIn；再点自己 = flashOut；document 点外收起
- 选择落地：移旧 on 加新 on → 回写 label → 收全部

---

## 10 · §7 工具卡

### 10.1 卡壳
`.tool`（surface+边+r-card+硬投影+overflow:hidden）> `.tool-head`（全宽按钮：`.t-ic` 26×26 图标格 / `.t-meta`（t-name 12px display + t-args 11px code 族 ellipsis）/ `.pill` / `.chev`）+ `.tool-body > .tb-in`（上边框软线 + 12px code 族）。

### 10.2 三态 + 切换
- **running**：琥珀边 + 标题条 `repeating-linear-gradient(90deg, spark 26% 0-4px, transparent 4-8px)` + `background-size:12px 100%` + `mc-sweep 1s steps(2,end)` + `--sweep-delay` 负延迟相位对齐
- **fail**：红边 + t-ic 图标转红（color+border）+ pill fail（pwsh 用「exit 1」文案）
- 切换四拍：ghost → flash → **状态瞬切**（data-state/pill/输出体同拍换）→ 撤块；切 running 后必须重 `syncAnim(head, SWEEP, '--sweep-delay')`
- 两套遮罩类等价：设计稿 `.ghost/.refresh`（::after 内建）/ interactive `mcfx` 泛化 —— 统一走 mcfx，但卡需 position:relative

### 10.3 interactive appendToolCard
- innerHTML 一次拼完；running 默认 `.open` 展开出场；flashIn + 双 syncAnim（head sweep + pill pulse）
- **running→done 翻转**：`doneOut/doneMs`（默认 2500ms）后 flashOut，拍内换 data-state/pill/tb-in
- tool-spawn：克隆模板卡、去 id/摘 data-toggle、收 body、"先插透明占位再闪"

### 10.4 图标语义映射
| 目录 | 图标 |
|---|---|
| read/write/edit/glob/grep | i-doc / i-floppy / i-px-edit / i-folder / i-px-search |
| pwsh/job_output/interrupt_agent | i-px-terminal / i-px-clock / i-px-stop |
| subagent/fork/send_message/workflow/ralph | i-suitcase / i-px-copy / i-px-send / i-px-timeline / i-px-reload |
| goal/todo_write/plan/ask | i-px-goal / i-px-list / i-px-sliders / i-balloon |
| web_search/web_fetch/mcp__* | i-px-search / i-px-ext / i-px-zap（名带 `服务器__` 前缀即套） |
| 失败语境 | i-px-warning（叹号只留真失败） |
| 未知兜底 | **i-px-dots 三点**（中性，明确不用叹号），名称照登 |

subcalls：左 2px 软线缩进 + sc-row（ok=绿 i-check / run=琥珀 clock）；diff：d-line 行号列 + d-add success 14% / d-del danger 12%（i 列再叠浓）/ d-hunk sel-bg。

---

## 11 · §9 全局浮层

### 11.1 结构要点
- **hero**：居中列；h-mark 48px HappyMac（深色 drop-shadow 硬投影、**浅色 filter:none**）；h-title 34px（em 染 accent、≤640 降 26）；h-badge sel-bg 底方角；h-chip 26px 无 hover；chips 行下方**模式下拉**（`.cb-anchor + .menu` 向下弹，设 `state.mode` 同步主窗标题栏，选项 `.on` = accent 反色）；interactive 为 JS 渲染（renderHero → 首条消息 flashOut 移除，chip 有真实切会话行为）
- **.menu**：min-width 210 + padding 4 + shadow-pop + z:70；m-group uppercase 10px；m-opt.on = accent 实底反色；danger 染红；m-sep 1px 软线；**无 hover**；快捷键列 .mo-key 规格预留未实现
- **dialog**：mask（z:80，`color-mix(bg-deep 55%)`，grid 居中）+ `.dialog.win`（min(720,92vw) × min(520,86vh)）= titlebar + 左 nav 172px（dn-item.on = sel-bg 底非反色）+ 右 main 滚动 + statusbar；`.set-row` 底软线末行去线；**`.switch`** 34×18 方块开关（input:checked ~ 兄弟选择器，knob 2px→18px 硬切，focus 虚线环经 ~ 透传）
- **toast**：260–360px 单条，**仅图标变色**（ok 绿/err 红）；宿主 fixed 右下 z:90；**无自动消失定时器，点击自身 flashOut 关闭**
- **scrim**：z:95 点阵幕（radial-gradient 1px 点 + 8px 栅格，与桌面同栅格）；整块可点关闭

### 11.2 显隐协议
- HTML `hidden` 属性 + `[hidden]{display:none}` 兜底；显示/隐藏必须放 flashIn/flashOut 回调里（帧中途）
- interactive 无 dialog/toast/scrim（文件头声明 §9 只取 hero+菜单）——**这三件以 workspace 为唯一规范源**

### 11.3 overlays 批 2 落地注记（2026-09-02，host 0.1.1-rc.2）

- **hero 相锚实勘**：`heroRoot` = `div[data-phase]`（ConversationRoot 根 div，`settling|hero|active`
  三相载体；与 flow 批 `mainColumn` 同源同点——probe 实勘全页唯一，弃 build-hash 类锚）。
  官方空态容器 `heroOfficial` = `.pXSMma_root`（build-hash 类，DRIFT-RISK 在册）：不在滚动口内
  （scroll 首子为空 `div[data-slot=conversation.session]`），挂 composerStack 的 composerHero 变体；
  容器自身无 data-*，内层仅 `conversation.hero.brand.mark` 槽位。锚漂移即失配回退官方空态，不破版。
- **`html[data-mc-hero]` own-gate 裁定**：官方空态藏匿不走 `heroRoot[data-phase="hero"] heroOfficial`
  相位选择器拼接（overlays 段禁宿主属性片段硬编码），改 own gate 属性——heroSync 挂载置
  `data-mc-hero`、摘除/teardown 撤之，藏匿规则 `html[data-mc-hero] .pXSMma_root{display:none!important}`。
  相位判定全在 JS（`mcHeroAction(phase)` 纯函数：仅 `'hero'`→mount），属性翻转与 DOM 挂摘同拍，
  官方空态显隐自动一致（dock 批 composerHide 藏匿同款形态）。滞留态自愈：宿主 React 重建子树
  而 phase 仍 hero 时闭包 heroEl 变 detached 但恒真值 → 挂载判定加 `isConnected` 重挂路径。
- **存在门控 vs JS 门控（三浮层门控异构谱）**：dialog/scrim 皮 = head 常驻 `style[data-mc-dlgskin]`
  **纯 CSS 存在门控**——官方弹窗自开自关（React 受控），JS 置撤属性反而会与官方时序竞争；
  hero = body observer 相位同步 + own gate 属性置/撤（JS 门控）；dock = `html[data-mc-dock-on]`
  JS 置撤属性门控。择型依据：**挂载者是谁**——官方自管开合的浮层用存在门控，主题自绘件的
  生命周期归主题管的用 JS 门控。hero observer 兼职探测（childList+subtree+attributes 过滤
  `data-phase/class`），heroRoot 缺席不轮询（McFlow「8s 上限耗尽」教训在案）。
- **`:has` scrim 域定**：全 app 四处 `role=dialog`（settings 面板/图片 lightbox/ctx meter popover/
  feedback note），仅 settings 面板以 `aria-labelledby` 定题（其余 aria-label）→ `dlgMask` 走
  `[role="presentation"]:has([role="dialog"][aria-labelledby]) > div[aria-hidden="true"]`——裸
  `[role=presentation]>div[aria-hidden]` 会误伤其余三处 overlay 的遮罩（live 普查 ctx popover
  零命中实证，z-index 1000 官方原值不动=spec 裁定 4）。`:has` 需 Chromium 105+（宿主部署面达标）。
- **逗号臂修复实录（三臂同族缺陷，fix round 1/1b）**：计划原稿 `D h1,h2,h3{…}` / `D hr,[class*=
  "separator"]{…}` / `D input,textarea{…}` 三条选择器列表的裸逗号臂重置后代组合符 → `h2/h3`、
  `[class*=separator]`、`textarea` 三个裸臂**全文档生效**（latent×2 + active×1——活体实证
  composer textarea 正被裸 textarea 臂染 `--mc-surface` 底）。修复=逐臂补卡锚 `D h1,D h2,D h3` /
  `D hr,D [class*="separator"]` / `D input,D textarea`（声明一字不动，只收域）。教训入册：
  **带后代组合符的选择器列表，逗号每一臂都要独立携带域定前缀**——audit 查不出（宿主片段仍在
  卡锚臂内），只有活体 computed 对照能抓。
- **switch 砍除记因**：Task 1 探针实证 settings 面板 0 枚 `button[role=switch]`——通用/模型/插件/
  Agent 预设/豆包模式五节全为 navCell/分段钮形态（「外观」三态是分段钮组非开关）。spec §2
  「官方没有的结构不强造」硬前提 → brief 的 `button[role="switch"]` 两行皮不实施，裁剪处码内
  注记留位（官方日后引入 switch 时补一小段，verify B 段会暴露）。kit 控件样本随之改 button/input
  形态（无 switch 样本），verify 亦无 switch 断言（控制器裁定 1）。
- **confirm 不可达实证**：删除会话确认小卡非破坏路径无靶——官方会话树被 McFinder 遮蔽（live 无
  `treeitem`），McFinder 行菜单项集为 rename/fork/archive（无删除项）；工作区删除动真实数据故
  不做破坏性实勘。verify C 段按条件断言落地：确认卡在场（`[role=dialog|alertdialog]` 文含
  「删除」）才断同款壳，否则 INFO 合法跳过——今日跑实录即 INFO 分支。
- **toast 缺席记因**：spec §0 裁定 1 范围表 toast 无任务=裁定落地——宿主通知面（运行结果/
  错误横幅）为官方内联渲染，无可锚定的浮层 toast 结构；原型 §9 toast（fixed 右下 z:90、点击
  flashOut 关）无宿主挂载点，强造即空转。kit 注记行照登「toast 不做裁定」，原型规格留在本节
  备查（宿主日后出现 toast 形态再议）。
- **结构档取舍实录**：`dlgNav` 结构档成立——live 实勘面板 `display:flex row`，nav 即固定宽
  flex 兄弟（188×800，旁 content 612×800）→ 172px+border-right 结构照上；唯 brief 原稿
  `dlgCard+' '+dlgNav` 双前缀拼出嵌套 dialog 死选择器（`…[aria-labelledby] [role="dialog"]… nav`，
  live 0 命中）——`dlgNav` 值本身已含 dlgCard 全前缀，单键即完整域定，修正拼接（声明四项一字
  未动）。皮活体形态：卡 bg=--mc-surface/1px 边/直角/`3px 3px 0` 硬投影/ChiKareGo 像素字，
  按钮面 surface-2 直角、input 直角（豆包模式节 2 枚原生 input 实证命中），分段钮/分隔线发丝
  化；Esc 关净后 `style[data-mc-dlgskin]` 仍在 head（mount 生存期单例，官方自开自关语义正确）。
  kit「浮层」分区同批陈列（hero 构图静态样本读 `MC_HERO_COPY` + `.mc-dlg-demo` 控件样本 +
  门控差异注记行）；verify 门禁 `tools/verify-overlays.mjs`（A 相变/B 换皮/C 条件/D 深浅两遍，
  34 断言 GREEN）随批落库。

- **验收裁定轮实录（2026-09-03，hero 简化+窗框+渐变勘定+dialog 顶栏）**：用户五条裁定落地——
  - **构图简化**：badge（「MACINTOSH · System 7 复古主题」）与 sub（「经典麦金塔工作区…」）两行
    整体退役，hero = mark+title 两件；`.mh-badge/.mh-sub` CSS 与 kit 样本同步裁除。
  - **标题 i18n**：`MC_HERO_COPY` 改 `{zh:'探索未知之境', en:'Think Classic'}` + `mcHeroTitle(lang)`
    纯函数（`documentElement.lang || navigator.language` 前缀 `zh` 判定；测试域零 DOM）。zh 文案为
    用户裁定字面；en = 主题初代 hero slogan「Think Classic」——用户口谕「原版的那个 slogan」的
    转译（Classic Mac 语汇+本主题 v1 标题），若用户另有所指改 `MC_HERO_COPY.en` 一处即全链生效。
  - **hero 窗框**：chrome 批 `div[data-phase="hero"]::before` 伪元素版（data-URI 双色方块）装不进
    `<use>` → 让位给真 DOM `.mc-hero-tb`（heroSync 随相挂 heroRoot 首子，sidebar `.mc-titlebar`
    同款 pinstripe 语汇；方块 = Kit Sprite 墙前两枚 `#i-close`/`#i-zoom` 三色位，深浅自动反色）。
    伪元素经 `html[data-mc-hero] heroRoot::before{display:none}` 让位（gate 撤即回返，双批互不锁）。
  - **「椭圆形渐变」勘定实录**：CSS 三路全零命中——元素+伪元素 `background-image`
    （大小写不敏感扫全文档）、大 blur `box-shadow`、内联 `<svg>` `radialGradient`。真身是官方
    **hero 晕 SVG**（`svg[class*="heroGlow"]`：`<ellipse rx=425.5 ry=134 fill=#6187D8
    fill-opacity=.08>` + `feGaussianBlur 50`，absolute z:-1 1100×490）——挂 composerStack 的
    composerHero 变体内，**不在 `heroOfficial` 藏匿域**（官方空态藏了晕还在）。新 map 键
    `heroGlow`（hashed-substring 同 `sessionRowArrow` 纪律）+ gate 藏匿。教训：**SVG 内部图形
    自绘的渐变不走 CSS background 通道，扫渐变须连 `<defs>/<filter>` 一起查**。
  - **composer 钉底**：`html[data-mc-hero] composerSeat{margin-top:auto}` + `.mc-hero` 上下 auto
    margin——flex 滚动口剩余空间三分（标题栏/构图/输入坞间距均等），composer 席贴窗口底
    （实测 seat bottom 887 vs 窗底 888，差 1px 边框；距视口底 13px = chrome 批 12px 桌面缝隙）。
    active 相不受影响（gate 随 hero 摘除归零）。
  - **dialog Mac 顶栏注入**：官方 settings 面板无 titlebar DOM → 家具级注入。同一 body observer
    兼职 `dlgSync()`（开卡=childList 突变），`.mc-dlg-tb` 插卡首子；幂等 =「bar 在场且父为卡」
    短路，React 重建卡走 `isConnected` 重建（heroEl 自愈同款）。布局：官方卡 `display:flex row`
    （nav|content）→ 顶栏 **absolute 横贯卡顶**零打断 flex，占位走
    `dlgCard:has(.mc-dlg-tb){padding-top:20px;box-sizing:border-box}`（自有类 `:has` 门控零官方
    锚，20px 吃进官方原高不增高）。顶栏标题读 `aria-labelledby` 指题元素（动态文本经 esc）。
  - **dialog 关闭语义（用户裁定「像 Mac 窗口一样点掉」）**：官方面板实有「关闭」钮
    （`VOzbGW_close`，content>header 右上 28×28，全面板 button 普查唯一 `.close` 后缀）→ 新
    map 键 `dlgClose`（hashed-substring），关闭方块镜像其程序化 **click**（活体实证关净，保官方
    行为）；锚漂移兜底 = 向卡派发 `Esc` keydown（**document 级派发无效**——传播路径不经 React
    根；必须派发在卡元素上冒泡至 React 根委托，live 实证同效）。缩放方块装饰（tabindex -1）。
    皮冲突修正：dlg 按钮皮 `D button{…!important}` 会压过方块裸规则 → 逐臂收域
    `:not(.mc-tbx)`。verify 门禁 42→58 断言（badge/sub 退役/locale 标题/窗框双方块/晕藏/
    composer 钉底/顶栏注入+关闭方块关窗/演练②含窗框自愈）。

- **裁定轮 2 实录（2026-09-03，主列窗框+hero 双下拉居中+横排+官方关闭钮隐 R8-R11）**：用户
  四条裁定落地，verify 58→75 PASS GREEN——
  - **R8 主聊天列窗口框**：勘定 active 相主列顶 = 官方 `header.wSkVaW_header`（经
    `display:contents` 槽位壳 `div[data-slot=conversation.session.header]` 成为 root 的 flex 子件；
    内含 titleCluster 会话标题面包屑钮 `wSkVaW_crumb.wSkVaW_crumbCurrent`+模式指示+Session log
    钮+对话/轨迹/上下文三页签；**模型选择器不在 header**，在输入坞域）。处置=**家具级注入**
    （官方 header 无 bar 元素可皮，且零外科保全交互）：`.mc-main-tb` 插 root 首子（root 是 flex
    column，header/滚动口自然整体下移 21px，无需 dialog 那套 `:has` padding 占位），hero
    窗框同面同方块三方共用一族 CSS；标题**只读镜像**官方 crumb（新 map 键 `sessTitle`
    `[class*="crumbCurrent"]` hashed-substring，textContent 写入零 HTML 注入面，每拍 observer
    校对——切会话/行内改名随拍刷新，锚漂移回退 'DeepSeek Harness'）；关闭/缩放方块装饰
    （active 相无「关窗」官方语义，tabindex -1）。hero 相=hero 窗框、active 相=本条，同根
    互斥共存（mainSync 与 heroSync 各按 data-phase 挂摘，同一 body observer 兼职）。
  - **R9 hero 双下拉居中**：勘定两枚官方下拉（`pXSMma_workspace`「选择工作区」+
    `cubgiG_seat`「标准模式」）挂 `wSkVaW_heroWorkspaceRow`（composerStack 的 composerHero
    变体内，**不在 heroOfficial 藏匿域**——hero 相本就可见，无需 un-hide，只需重排）。处置=
    **display:contents 拍平**：gate CSS 把 composer 席位与 composerHero 变体栈拍平（两中间层
    本就是官方 contents 匿名壳），行升为滚动口直接 flex 子件，DOM 序恰在 `.mc-hero` 之后
    （零 order 零 re-parent）；`align-self:center`+内部 `justify-content:center`+拍掉 20px 左
    内衬=双钮真居中；`margin-top:26px` 紧贴 hero。纵向构图重排：hero 只留 `margin-top:auto`
    （原上下 auto+席位 auto 三分改两分——hero 上方/自绘坞上方各半），自绘坞
    `[data-mc-dock]{margin-top:auto}` 接棒钉底。实测 1440×900：hero 295-435、行 461-489
    （行垂直中心 475 = 屏幕中线 450 偏下 ✓）、坞 750-887（与轮 1 持平）；`max-width+flex-wrap`
    窄幅折行兜底。**勘定陷阱**：composerHero 栈内另有官方 hero 变体 composer 卡根
    （`uV2eYG_hero`，visible 但 h=0——真卡 `uV2eYG_card` 带 `data-composer-card` 被 dock 批
    gate 藏匿）——拍平后以 812×0 空盒参与 flow，零视觉；钉底断言从席位改量自绘坞本体
    （display:contents 盒消隐 getBoundingClientRect 全零）。
  - **R10 logo+slogan 横排**：`.mc-hero` column→row（align/justify center+flex-wrap 兜底），
    mark 在左 title 在右成对居中，窗框仍在顶；kit 样本同链生效（真类复用）+tag 文案改版。
  - **R11 官方关闭钮隐**：`dlgClose{display:none!important}` 入 `style[data-mc-dlgskin]`
    （选择器自带 dlgCard 前缀零越域）；**display:none 不影响程序化 `.click()`**（live 实证：
    置 none 后 click 仍令 dlgCard 退场）——关窗只走顶栏左上方块（镜像官方钮），Esc-on-card
    兜底不变；皮摘演练① 官方钮随皮回返，语义自洽。
  - map 增键：`sessTitle`/`heroRow`（`[class*="heroWorkspaceRow"]`）/`heroStack`
    （`[class*="composerHero"]`）三键全 hashed-substring DRIFT-RISK（同 heroGlow 纪律），
    audit OVERLAYS_WHITELIST 防御性登记同步。verify 增断言：R8 主列窗框六断（在场 20px
    root 首子/sprite 双方块/标题镜像 crumb/官方 header 保全钮数≥4/窗框在 header 上方/装饰
    方块零 tab 序）+hero 相退场、R9 四断（双钮可见/水平居中≤8px/紧贴 hero/行中心过半屏）、
    R10 两断（深浅横排 Δmid≤4px）、R11 两断（深浅官方钮 display:none）+钉底改坞本体+
    kit 横排断言。

---

## 12 · §10 响应式

### 12.1 三档断点
- **≤820（结构切换档）**：48px app-bar（fixed z:76 + 汉堡钮）+ `.app.has-bar{padding-top:48px}` + desk 转 block + 抽屉（sidebar fixed `min(300px,84vw)` z:60 `translateX(-102%)`→drawer-open `transform:none` **硬切**）+ m-mask 遮罩 z:75 + 主窗 `height:calc(100vh - 48px - 24px)`
- **≤640（密度档）**：flow padding 12 / 气泡 100% / hero 26px（断点表另述 mode 钮隐藏——CSS 未落地，实现侧补）
- **≤480（极窄档）**：dock padding 8 / dialog-nav 收 52px 图标列（断点表另述统计条中段隐藏——同样需补）

### 12.2 两原型差异
- workspace = 顶栏+抽屉+遮罩完整移动结构（规范源，PORT-NOTE：结构由实现侧组件接管，原型给样式基准）
- interactive ≤820 直接收 56px 细条（复用 rail-mini 语汇，**非移动规范**），仅一档

### 12.3 坑
- 勿加 `transition:transform` —— 过场语言只有闪烁
- 层级序必须遵守：遮罩 75 压抽屉 60、被顶栏 76 盖
- calc 公式中 24px = desk 上下 padding 之和，改 padding 同步改
- `viewport-fit=cover` 已设，safe-area-inset 实现侧建议补

### 12.4 DSH 落地差异注记（responsive 批 2026-09-03）
- **结构档断点 820 → 1023**：对齐宿主折叠断点（实测 1024 展开/1000 强制收叠卸树）——824~1023
  宿主收轨后树不可达带一并治理；汉堡方块嵌主列窗框（hero/main 两态共用 i-px-menu），
  不造 48px app-bar（DSH 窗框常驻，双栏冗余）。
- **抽屉 = 官方展开通道挤占式**：汉堡/Mask/Esc 三通道全走 tclose 同款程序化 click
  （sidebarCollapseBtn + accToggle 五拍）——树 DOM 宿主挂载、Finder 皮自动生效，零克隆。
  **不脱流不压轨**（v2 裁定）：sidebarCol fixed 化会令 grid 自动放置把 centerCol 掉进
  0px 首轨全盘错位（实测）；改为层级方案——抽屉壳(relative z:60) > 遮罩(z:50) > 主列
  (auto)，窗框 z:76 盖遮罩保汉堡常可点。原型「遮罩 75 压抽屉 60」序不适用（会盖死抽屉）。
- **遮罩/壳提层显隐全 CSS**：`:has(appRootWide)` 派生自官方 data-sidebar-collapsed 稳定
  data-* 锚，零 JS 状态；硬切无 transition（§12.3 坑表照守）。
- **密度两档**：≤640 flow padding 12 + 气泡满宽（bubbleUser 键）；≤480 dock padding 8
  （dock 根即 [data-mc-dock] 本体）+ 设置 nav 收 52px 图标列（官方 nav 文字裁切=已知限制）。
  mode 钮/统计条中段隐藏无 DSH 对应物，记因不做；safe-area-inset 不做（桌面 GUI）。
- **白块伪影修复顺带**：`.mc-field{width:100%}` 在 content-box composer 下解析成 border-box
  宽溢出右缘 9px（各宽度恒在，窄窗最显眼）——dock 皮 width:auto 压掉（stretch 由 flex column 兜）。
- 门禁：`node tools/verify-responsive.mjs`（resize 驱动 20 断言，只读不发消息）。

### 12.5 ask 批换皮差异注记（模块11 问题卡/审批卡 2026-09-03）

- **槽链接管机制**：官方 `@deepseek-ai/dsh-client-ui-user-questions` 经
  `ctx.slots.inject("conversation.composer", ...)` 注入，`selectQuestion` 在问题 pending 时
  **接管 composer 席位**——问题 frame 渲染于 `composerSeat` 内部（probe:seatContainsFrame=true），
  与原型「ask-card 接管输入坞」概念宿主官方同构。**路线 = 换皮不重建**：官方卡 React 受控 +
  wire boundary（`PendingQuestion.answer/cancel` → `wait.respond`），分页/跳过/折叠/作答官方
  行为原样保留，主题层纯 CSS 零 JS（`src/conv/ask.js` mount 为 noop）。
- **藏坞门控 = 存在门控（CSS `:has` 派生）**：pending 时官方卡仍挂载、自绘坞同框共存
  （截图坐实）→ `[data-composer-seat]:has(问卡锚/审批卡锚) [data-mc-dock]{display:none!important}`，
  作答后 frame 卸载坞自动归位（F.settled dockBack:true 实证）。与 hero（observer 相位 +
  属性门控）/dialog（head 常驻 style）异构，三态门控不混用。
- **锚点 DRIFT 记因（两处勘误，均 verify-ask 活体实证）**：
  1. **Mbwy4a 族类名实形 = 单下划线后缀**（`Mbwy4a_progress`/`Mbwy4a_eyebrow`/`Mbwy4a_number`），
     交接档 §1.2 的 `_progress_` 双侧下划线形态**全错**（源码 CSS-module 引用形误当 DOM 形）；
     map 键一律改语义 token 后缀形态 `[class*="progress"]`（同 dlgClose/heroGlow 纪律，
     前缀哈希随构建漂移、后缀语义稳）。
  2. **primitives kz6gm 族才是双侧下划线**（`_outline_kz6gm_56`/`_primary_kz6gm_38`）——
     两族哈希方案异构，`btnOutline`/`btnPrimary` 键保留 `_x_` 形态。
  3. **复合选择器逗号劈裂**：`askOpts` 初版值 `[role="radiogroup"], [role="group"]` 拼进
     `C OPTS X` 复合规则时逗号把规则劈成两半（后半段脱域、::before/反色全落空）——
     改 `:is([role="radiogroup"], [role="group"])` 单一复合形态。**凡 map 值拟作复合选择器
     中段者必须 :is() 化**。验收轮追加实证：旧版第一支裸命中 `[role="radiogroup"]` 容器,
     `askNumber` 隐藏规则劈裂后即 `radiogroup{display:none}` **整组选项消失**（用户截图 ① 真身）。
  4. **aria-label 条件挂载 = 锚死**（验收轮 2026-09-03）：`planCard` 原锚
     `section[aria-label]`——源码 `aria-label={review.question}`,plan review 的 question 为空时
     React 略掉属性,锚全段死（plan 皮零命中真身）。改结构锚 `[data-plan-review-key] section`
     （frame 内 section 唯一,源码直读级稳定）。**凡 aria 锚必须核条件挂载面**。
  5. **换皮不夺布局**（验收轮 2026-09-03）：官方 option 本就 `display:flex;align-items:
     flex-start`（框件 margin-top:2px 锚首行）——主题的绝对定位环/勾与官方 flex 打架,且官方
     `_checkbox_::before` 14px 框漏藏出**双框叠影**（用户截图 ② 真身）。改官方 flex 首子件
     方案：环 = 行 `::before`（flex:0 0 12px + margin-top:6px 对齐 24px 行高首线）,勾 = span
     本体化（官方 ::before content:none + svg display:none）。**换皮先读官方布局,顺势不逆势**。
  6. aria 前缀锚（收起/展开问题卡片、放弃整组问题、上一题/下一题）= i18n zh DRIFT-RISK，
     官方换语言即失配（失配 = 回退官方样式不破版）。
  7. **plan 模式入口勘定（diag7/8）**：`/plan` 斜杠命令（"Enter or leave plan mode"）——composer
     访问模式菜单（仅可查看/可写入工作区/完全权限）与 agent 预设下拉（标准/PTC/极简/创造/豆包
     语音/猫娘/Web UI Design）均非入口（diag3/4 排除法实证）。diag8 全链活体：`/plan` → 发任务 →
     agent 提交计划 → 审批卡入场,planCard 结构锚命中,strip/outline/ghost/primary 皮全生效。
  9. **按钮 = 通用双内环 push button 全配方直译**（验收轮3→4 递进 2026-09-03 用户两轮指认）：轮3
     只把 primary 换成 accent 周紫仍不够——「直角+field 投影+ui 字」的表单件风与通用钮是两个
     物种。**通用钮 = `.mc-btn` 配方逐项直译**（tokens.js §5.1/prototype `.btn` L205）：28px 高/
     min-width 72px/`--mc-r-btn` 圆角/外 1px 线+内双环 `box-shadow:inset 0 0 0 1px var(--mc-surface),
     inset 0 0 0 2px var(--mc-border)`/`surface-2` 底（非 surface）/`600 13px var(--font-display)`
     显示字+`.04em`/`:active` 内外圈反色;primary = accent 底+accent-ink 字+**内环 1px 换 accent**。
     planDiscuss（去聊天里说）幽灵化退役——System 7 无幽灵钮,一律 push button。**换皮钮的「像
     不像换了」以主题通用控件全配方为基准,不以换底色/反色技巧为基准**;选中行整行反色（fg 底）
     是另一条独立裁定,不随之改动。
  10. **卡片语汇 ≠ 窗框语汇**（验收轮4 2026-09-03）：问卡/审批卡 = `r-card` 4px 圆角 +
     `shadow-panel` 投影（原型 `.ask-card` L616,与工具卡/composer/To-Do/Goal 同族卡片语言）;
     直角+`shadow-pop` 是 dialog 窗框配方（§C 换皮定案）,误套到卡上即「样式不太对」的观感来源。
     同批勘定三件：翻页钮 = 原型 `.pgbtn` 20×20 带边框方框+内嵌 9px 像素箭头（caret 移 `::before`,
     非裸三角 mask）;关闭钮 = `#i-close` 盒形 glyph 近形（11×11 方框 2px 环 evenodd mask,非裸 X,
     与窗框双方块同语言）;选项行盒度量对齐原型（padding 4px 6px+r-tag,容器 gap 3px——不触行高,
     环勾 margin-top:6px 锚 24px 行高的勘定数学不动）。
  8. **自定义行 = 选项之一**（验收轮2 2026-09-03 用户裁定）：线框/surface-2 场退役（field 域
     零规则,官方 field>* font:inherit 自足;askField 键撤,无死键纪律）——单选形态给 ::before
     像素环（:not(:has(checkbox)) 区分单/多形态,多选行内已有官方空 span 勾）、激活态
     customRowActive 换实心环;多选勾统 12px 方框,选中 checkboxChecked 整底 chk-on。几何实测
     （probe-ask-diag5）：框与 optionLabel 中心完全同心（24px 行高 vs 12px 框 margin-top:6px）,
     「错位」观感真身 = 自定义行官方 20px 大框列线参差,统 12px 后齐。
- **audit M5 意外碰撞处置先例**：`planCard` 语义锚 `section[aria-label]` 拆出裸 `[aria-label]`
  token，与 sidebar 既存 `:not([aria-label])` 页脚规则同形碰撞——sidebar 照 overlays/dock/
  finder/tool 四段先例改**段扫描 + SIDEBAR_WHITELIST**（`[aria-label]` 存在性判定放行，记因入 audit.mjs）。
- **探针方法论（交接档 §1.3 照录 + 两轮扑空教训）**：`ask_user_question` 阻塞回合，后台
  pwsh 进程被压在阻塞调用之后——同回合「起探针 + 发题」时序必错；**v3 自治版（新会话
  自问自答）为唯一推荐形态**（verify-ask 同款链路）。headless profile 是独立 harness 进程，
  其 pending 不保证浮到 web 宿主 GUI。
- **裁定项（活体拍板）**：单选隐数字（`Mbwy4a_number` display:none + ::before 像素环代形）
  是否可接受,备选 = 数字保留进方框。
- 门禁：`node tools/verify-ask.mjs`（自治链路 26 断言：藏坞/卡皮/环勾 mask/反色/折叠双态/
  归位/kit 分区；每次运行发一条真实 agent 指令 + 留一次性会话在侧栏,主人可删）。

---

## 13 · 移植核对清单（正式页开发收尾用）

1. **删 KIT-CHROME**：`[KIT-CHROME begin/end]` 区间（检视带家具样式）不随主题移植
2. **PORT-NOTE 语义**：86 处（65 描边）—— 描边默认 transparent 的逐处例外声明；变更 selector 走 BREAKING 并同步附录 A
3. **附录 A selector 门禁**：文件尾清单为移植比对基准（details.* 与 composer.stats 已随死代码清理移除）
4. **已删项勿复活**：--dot/--info-w/--rail-raised/--spark-dim/--spark-ink/--danger-strong/--scroll-arrow、mc-blink/mc-in、m-clock/win-body(workspace)/infobar/desk-icons/s-act、i-caretdown/i-machd/i-trash/i-px-image/i-appmenu、Fusion Pixel 10px 字体、§4b/§8 整节
5. **顶栏右上无元素**（已按规格移除）；主题切换入口 = 侧栏页脚月牙钮；**主窗标题后缀 = 当前模式（DSH preset）**，正式页接宿主真实 mode 状态（hero 下拉/点标题切换仅为演示交互）
6. **`.flow > *{flex:none}`** 与 min-height:0 链：任何列表滚动区必带
7. **动画纪律终检**：无 hover / 无 transition / 出场只闪烁 / 一切延时走 CLOCK.next / pulse·sweep 负延迟对相位 / 浅色遮罩三处反转齐全
8. **正式 token 以 workspace 全集为准**（interactive 删减的动效 token 需恢复）
9. **动态文本一律 `esc()`**；innerHTML 里的用户数据防注入
10. **本地字体 + sprite 随包分发**；图标映射优先官方组件，特异件保留 symbol
