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
SESSIONS = [{ id, title, run?, auto?, goal?, todos?[], injects?[{ic,tt}],
  script: [turn[], ...] }]          // turn = block[]，按 500ms 逐块播放
block = { md:'<html>' }             // assistant 正文（含 tail 复制/重发/统计）
      | { tool:{ ic, name, args, state, out, doneOut?, doneMs? } }   // doneOut+doneMs = running→done 延时翻转
      | { row:'retry'|'cap', tt }   // 自动重试行 / 上限行
      | { ask:{ steps:[{type:'radio'|'check'|'open', cap, q, ph?, opts:[{t,d}|{t:'__free__',ph}]}] } }
state = { view, current, sessions, busy:{}, fallback:{}, queue:{}, stats:{}, todos:{}, askMode, flows:{} }
```
- 脚本播完走 `FALLBACK` 兜底循环；`s.auto` 会话点开即自动跑一轮。
- `state.busy[sid]` 存在 = 回合运行中（Send 变 Stop）；`state.flows[sid]` = 会话消息流 DOM 留档。

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
- `.titlebar`：20px pinstripe（`repeating-linear-gradient(180deg, stripe 0 1px, transparent 1px 3px)` 叠 surface-2）+ `::before` 顶部 1px accent 线 + 13px close/zoom box（SVG 三色位）；`.t-title` 自带 surface-2 实底打断条纹、max-width 60% ellipsis；padding 0 26px 给 box 让位
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
- `.md`：14px/1.8 ui 族；h1–h3 统一 display 600 17px（h2 15/h3 14）；行内 code = sel-bg 底 + r-tag；pre = bg-deep + 横滚；table 全格线 border-soft、th display 体 surface-2 底；blockquote 左 2px accent-dim
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
- **hero**：居中列；h-mark 48px HappyMac（深色 drop-shadow 硬投影、**浅色 filter:none**）；h-title 34px（em 染 accent、≤640 降 26）；h-badge sel-bg 底方角；h-chip 26px 无 hover；interactive 为 JS 渲染（renderHero → 首条消息 flashOut 移除，chip 有真实切会话行为）
- **.menu**：min-width 210 + padding 4 + shadow-pop + z:70；m-group uppercase 10px；m-opt.on = accent 实底反色；danger 染红；m-sep 1px 软线；**无 hover**；快捷键列 .mo-key 规格预留未实现
- **dialog**：mask（z:80，`color-mix(bg-deep 55%)`，grid 居中）+ `.dialog.win`（min(720,92vw) × min(520,86vh)）= titlebar + 左 nav 172px（dn-item.on = sel-bg 底非反色）+ 右 main 滚动 + statusbar；`.set-row` 底软线末行去线；**`.switch`** 34×18 方块开关（input:checked ~ 兄弟选择器，knob 2px→18px 硬切，focus 虚线环经 ~ 透传）
- **toast**：260–360px 单条，**仅图标变色**（ok 绿/err 红）；宿主 fixed 右下 z:90；**无自动消失定时器，点击自身 flashOut 关闭**
- **scrim**：z:95 点阵幕（radial-gradient 1px 点 + 8px 栅格，与桌面同栅格）；整块可点关闭

### 11.2 显隐协议
- HTML `hidden` 属性 + `[hidden]{display:none}` 兜底；显示/隐藏必须放 flashIn/flashOut 回调里（帧中途）
- interactive 无 dialog/toast/scrim（文件头声明 §9 只取 hero+菜单）——**这三件以 workspace 为唯一规范源**

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

---

## 13 · 移植核对清单（正式页开发收尾用）

1. **删 KIT-CHROME**：`[KIT-CHROME begin/end]` 区间（检视带家具样式）不随主题移植
2. **PORT-NOTE 语义**：86 处（65 描边）—— 描边默认 transparent 的逐处例外声明；变更 selector 走 BREAKING 并同步附录 A
3. **附录 A selector 门禁**：文件尾清单为移植比对基准（details.* 与 composer.stats 已随死代码清理移除）
4. **已删项勿复活**：--dot/--info-w/--rail-raised/--spark-dim/--spark-ink/--danger-strong/--scroll-arrow、mc-blink/mc-in、m-clock/win-body(workspace)/infobar/desk-icons/s-act、i-caretdown/i-machd/i-trash/i-px-image/i-appmenu、Fusion Pixel 10px 字体、§4b/§8 整节
5. **顶栏右上无元素**（已按规格移除）；主题切换入口 = 侧栏页脚月牙钮
6. **`.flow > *{flex:none}`** 与 min-height:0 链：任何列表滚动区必带
7. **动画纪律终检**：无 hover / 无 transition / 出场只闪烁 / 一切延时走 CLOCK.next / pulse·sweep 负延迟对相位 / 浅色遮罩三处反转齐全
8. **正式 token 以 workspace 全集为准**（interactive 删减的动效 token 需恢复）
9. **动态文本一律 `esc()`**；innerHTML 里的用户数据防注入
10. **本地字体 + sprite 随包分发**；图标映射优先官方组件，特异件保留 symbol
