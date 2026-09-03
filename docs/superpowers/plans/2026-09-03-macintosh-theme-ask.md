# ask 批（问题卡/审批卡换皮）· 勘定记录与实施清单

> **状态（2026-09-03 下班前落档）**：探针勘定 **ALL GREEN**，路线与键组已定案；
> **实现零动工**（src/test/kit/装配均未改）。本文档 = 交接真相源，下次开工按 §5 清单顺序执行即可，无需复勘。
> 复勘命令：`node tools/probe-ask.mjs`（自治全链路，用户零操作）。
>
> **✅ 实现 appended（2026-09-03 晚）**：§5 清单 1-7/9 已全部落地并验证——test 7 例红→绿、
> map/sprite/ask.js/装配/kit 分区/verify-ask.mjs 26 断言 ALL GREEN、audit M5 意外碰撞按段
> 白名单先例处置（sidebar 段 `[aria-label]`，记因入 audit.mjs 与 dev-notes §12.5）。
> **§1.2 勘误**：Mbwy4a 族类名实形 = 单下划线后缀（`Mbwy4a_progress`），非 `_x_` 双侧形态
> （primitives kz6gm 族才是 `_outline_kz6gm_56` 形）——map 键已按语义 token 后缀全修。
> **剩余**：仅 §5 步骤 8 活体验收（用户亲手点全链 + 单选隐数字裁定项）。

## 0. 背景与路线裁定

- dock spec（2026-09-01）出栈项：「ask 向导（dockSwap 换装接管）另写 spec 后置」。本批兑现。
- 官方实现勘定：`@deepseek-ai/dsh-client-ui-user-questions`（`lib/client.js` 737 行已直读）——
  `ctx.slots.inject("conversation.composer", ...)`，`selectQuestion` 在问题 pending 时**接管 composer 席位**。
  原型「ask-card 接管输入坞」概念宿主官方同构；dock 探针当年零命中是此包后装。
- **路线 = 换皮，不重建**：官方卡 React 受控 + wire boundary（`PendingQuestion.answer/cancel` →
  `wait.respond`），自绘接管零收益且脆。分页/跳过/折叠/作答全部官方行为原样保留。
- **范围（用户拍板）**：双卡一起——QuestionFlow 通用问题卡 + PlanReviewPanel 计划审批卡（同包同槽，+20 行 CSS 级）。
- **流程（用户拍板）**：口头设计即开干，不落 spec 文件；本文档仅为交接档。

## 1. 探针勘定记录（tools/probe-ask.mjs v3 自治版，2026-09-03 ALL GREEN）

自治链路：GUI 新建会话 → 自绘坞发指令（`[data-mc-dock] textarea` fill + `[data-mc-send]` click）
→ 新会话 agent 调 ask_user_question → pending 勘定 → 折叠态勘定 → **自动作答吃卡** → 坞归位。
截图证据：`tools/artifacts/probe-ask-pending.png`（官方卡原样 + 自绘坞同框共存实锤）。

### 1.1 挂载与共存（最关键事实）

| 事实 | 值 |
|---|---|
| frame 挂载点 | `Mbwy4a_frame` → 匿名 DIV → **`wSkVaW_composerSeat[data-composer-seat]` 内部**（`seatContainsFrame: true`） |
| 席位链 | seat ∈ `wSkVaW_scrollBody` → `wSkVaW_root` → `pI_x6G_centerCol`（sticky bottom 形态） |
| pending 时官方卡 | **仍挂载**（`composerCard in:true`），`display:none` 是主题 dock 门控所致 |
| pending 时自绘坞 | `display:flex` 在场（`seatContainsDock: true`）→ **不加门控必两卡同框**（截图坐实） |
| 藏坞门控方案 | **纯 CSS，零 JS**：`[data-composer-seat]:has([data-question-key]) [data-mc-dock]{display:none!important}`（+ planFrame 同款）；作答后坞自动归位（F.settled dockBack:true 实证） |

### 1.2 锚点与哈希类清单（勘定实值）

- **stable 属性锚**：`[data-question-key=q:UUID]`（frame）、`section[aria-labelledby^="question-"]`（卡壳）、
  `[data-question-scroll]`（卡体）、`[data-plan-review-key]` / `section[aria-label]` / `[data-plan-review-scroll]`（审批卡三件）。
- **iconButton 走 aria 前缀（i18n zh DRIFT-RISK）**：`收起问题卡片` / `放弃整组问题` / `上一题` / `下一题`
  （折叠态切换 `aria-label` ↔ `展开问题卡片`，同时卡壳加 `Mbwy4a_cardMinimized` 类、`[data-question-scroll]` 卸载——E 段实证）。
- **选项行**：`button[role="radio"]`（单选）/ `button[role="checkbox"]`（多选），`aria-checked` 翻转；
  行内文本结构 = 序号数字 + label + description（`1A 勘定正常主题 ask 卡显示与交互` 实值）。
- **primitives Button**（跳过/提交/下一题/审批三钮）：`_button_kz6gm_4 _outline_kz6gm_56 _md_kz6gm_24` /
  `_primary_kz6gm_38` —— 子串锚 `[class*="_outline_"]` / `[class*="_primary_"]`（dlgClose/uV2eYG 记因同源）。
- **hashed-substring 锚（全部 DRIFT-RISK 标注）**：`_eyebrow_`（题头小字）、`_progress_`（「1 / 1」）、
  `_number_`（序号圆点）、`_checkbox_`（多选方框 span）、`_badge_`（推荐徽标）、`_detail_`（题干补充 md）、
  `_customRow_`（自定义回答行）、`_field_`（自由输入场）、`_feedback_`（错误行，role=status 冗余）、
  `_strip_`/`_dot_`/`_discuss_`（审批卡警示条/圆点/去聊天里说）。

### 1.3 探针方法论教训（两轮扑空换来的）

- `ask_user_question` 阻塞回合；**后台 pwsh 任务的进程被压在阻塞调用之后**——同回合「起探针 + 发题」
  时序必错（探针日志全在用户交卷后）。v3 自治版（新会话自问自答）彻底消除该耦合，是唯一推荐形态。
- headless profile 是独立 harness 进程，其 pending 不保证浮到 web 宿主 GUI——勿走 `dsh --profile headless` 捷径。
- 跨客户端观察：第二只浏览器能否看到 pending 卡未单独验证（v3 不再需要）；勿再为此烧探针轮次。

## 2. 设计定案（已口头批准）

- **皮**（对齐 overlays dialog 窗框配方）：卡壳 `background:var(--mc-surface)!important; border:1px solid
  var(--mc-border)!important; border-radius:0!important; box-shadow:var(--mc-shadow-pop)!important` +
  `C *{font-family:inherit!important;border-radius:0!important}` 全域压平。
- **题头**：eyebrow → aq-cap（`400 10.5px var(--font-ui)` faint）；title h2 → aq-tt（`600 13px var(--font-display)`，
  `padding-right:44px` 让位右上角钮）；折叠钮 = `i-tri` mask（展开态 `rotate(90deg)`，折叠态 0deg），
  关闭叉 = 新 sprite `i-px-x` mask（24 格像素 X），官方 svg 一律 `display:none`，钮 18×18。
- **选项行**：单选隐数字（`_number_` display:none）+ `::before` 12px `i-rdo` 环 mask，`[aria-checked="true"]`
  换 `i-rdo-on` + **整行反色**（fg 底 surface 字，最 System 7）；多选 `_checkbox_` span 12px 1px 边框方框，
  官方勾 svg 藏，选中换 `i-chk-on` 整底 mask。label 600 字重、description 小字 faint、badge 1px 边框小方标。
- **自定义回答行 / 自由输入场**：`_field_` 1px 边框 + `var(--mc-surface-2)` 底，textarea 12.5px/1.7 透明底。
- **页脚**：prev/next iconButton → 18×18 方框 `i-caretright` mask（prev `scaleX(-1)`），disabled opacity .35；
  progress 11px faint；feedback 11px `var(--mc-danger)`；`_outline_`/`_primary_` 钮直角化 + `--mc-shadow-field`，
  primary = fg 底 surface 字（kit `.btn sm` 同语）。
- **审批卡**：卡壳同配方；`_strip_` → `var(--mc-warn)` 底 + `var(--mc-bg-deep)` 字 + 像素字，`_dot_` 直角化，
  正文滚动区基础 md 皮，`_discuss_` 幽灵化，approve/decline 走共享 btn 键。
- **状态钩子用带引号形态 `[aria-checked="true"]`**（dock 段无引号形态 deliberate 区分，避免 DOCK_WHITELIST 纠缠）。

## 3. audit M5 推演（已核，无需改 audit.mjs）

- ask.js **零宿主选择器字面量**——全部经 `MC_MAP` 键名运行时拼接（mask data-URI 与 `[data-mc-dock]` 自有命名空间
  不入 token）。map 新值自动进 token 反查集；其他 src 文件不含这些片段（已 grep：`aria-checked` 仅 dock 段
  无引号形态；`data-question-key`/`_progress_` 等零命中）。
- **kit 演示必须用自有类**（`.kit-ask-*`，responsive 分区先例）——kit.js 不在 M5 豁免清单，写宿主 attr 字面量必 FAIL。
- 既有纪律照旧：无 `:hover`、无 `transition:`、无裸 setTimeout（本批纯 CSS，天然合规）。

## 4. 装配面（改动点清单）

| 文件 | 改动 |
|---|---|
| `src/chrome/map.js` | 尾部追加 ask 段键组（§5.2 全量草案，含 DRIFT-RISK/i18n 注记） |
| `src/core/sprite.js` | 新增 `<symbol id="i-px-x" viewBox="0 0 24 24">`（像素 X，13 方格双对角） |
| `src/conv/ask.js`（新） | `mcAskUri/mcAskPath`（mask data-URI 帮手）、`mcAskGateCss(seat,askFrame,planFrame)`、`mcAskCss(M)`、`MC_ASK_CSS`（`typeof MC_MAP` 守卫）、`McAsk={css,mount(noop)}`、CJS shim 导出 `{mcAskGateCss,mcAskCss,McAsk}` |
| `src/assemble.input.js` | ORDER/MODULE_MAP 加 `McAsk: 'src/conv/ask.js'`（McResponsive 后、McKit 前） |
| `tools/make-persistent-client.mjs` | mods 对象 / order 数组 / marks 清单三处加 McAsk |
| `test/ask.test.mjs`（新） | loadSrc 契约测试：gate 三态（双卡/单卡/空）、builder 全键含断言（窗框/环勾切换/按钮/strip）、空 map → ''、Node 侧 McAsk.css === '' |
| `src/kit.js` | 「问题卡」分区：`.kit-ask-*` 自有类静态演示（单选选中反色/多选/自由输入/pagination/审批卡警示条），**禁用宿主 attr 字面量** |
| `tools/verify-ask.mjs`（新） | **自治门禁**（复用 probe v3 链路）：断言 pending 时 `[data-mc-dock]` display:none、卡 radius 0/shadow-pop、radio 环 mask-image、点选后行反色、折叠 tri 旋转、作答后卡消坞归位；kit 分区经 `__MC_KIT_OPEN__` 断言。一次性会话留侧栏打印提醒 |
| 文档 | `prototype/component-dev-notes.md` §12.5（换皮差异注记：槽链接管机制/门控/锚点 DRIFT 记因/探针方法论）；README 模块表 + 终验行 |

## 5. 剩余步骤（下次开工顺序）

1. **TDD**：写 `test/ask.test.mjs` → 红。
2. map.js ask 段键组（键名照 §4 表内定案；值照 §1.2 实值；i18n/DRIFT 注记齐全）。
3. sprite.js `i-px-x`；`src/conv/ask.js` 实装（绿）。
4. assemble.input.js + make-persistent-client.mjs + `node tools/assemble.mjs` + `node tools/make-persistent-client.mjs`。
5. `npm test` + `node tools/audit.mjs` 全绿（M5 若有意外 token 碰撞，按段白名单先例处置并记因）。
6. kit「问题卡」分区（自有类！）；刷新 GUI 冒烟。
7. `tools/verify-ask.mjs` 自治门禁 ALL GREEN。
8. 活体验收（用户裁定项）：真实会话发一道真探针题 + 一次 plan mode 出审批卡，用户亲手点全链；
   裁定项 = 单选隐数字是否可接受（备选：数字保留进方框）。
9. 文档收尾 + commit（`feat(mc-ask): 问题卡/审批卡换皮——模块11…`）+ push。

### 5.2 map.js ask 段键组草案（值 = 探针实值，照抄即用）

```js
// —— ask 段(问题卡/审批卡;dsh-client-ui-user-questions lib/client.js 直读 + probe-ask.mjs 自治探针勘定 2026-09-03)——
// 双卡同槽链 conversation.composer:pending 时官方卡仍挂载(被 dock 藏匿门控盖住),问题 frame 渲染于
// composerSeat 内部(probe:seatContainsFrame=true)→ 藏坞门控纯 CSS :has(McAsk 段),全批零 JS。
askFrame:     '[data-question-key]',
askCard:      '[data-question-key] section[aria-labelledby^="question-"]',
askScroll:    '[data-question-scroll]',
askFoldOn:    'button[aria-label^="收起问题卡片"]', // i18n zh DRIFT-RISK
askFoldOff:   'button[aria-label^="展开问题卡片"]', // 同上
askCancel:    'button[aria-label^="放弃整组问题"]', // 同上
askPrev:      'button[aria-label^="上一题"]',
askNext:      'button[aria-label^="下一题"]',
askEyebrow:   '[class*="_eyebrow_"]',   // DRIFT-RISK hashed-substring(下同)
askTitle:     'h2',                     // 卡内唯一 h2(结构锚)
askOpts:      '[role="radiogroup"], [role="group"]',
askOptRdo:    '[role="radio"]',
askOptChk:    '[role="checkbox"]',
askOptOn:     '[aria-checked="true"]',  // 带引号形态;dock 段无引号形态 deliberate 区分
askNumber:    '[class*="_number_"]',
askCheckbox:  '[class*="_checkbox_"]',
askBadge:     '[class*="_badge_"]',
askDetail:    '[class*="_detail_"]',
askCustomRow: '[class*="_customRow_"]',
askField:     '[class*="_field_"]',
askProgress:  '[class*="_progress_"]',
askFeedback:  '[class*="_feedback_"]',
btnOutline:   '[class*="_outline_"]',   // primitives Button(哈希构建 kz6gm;uV2eYG 记因同源)
btnPrimary:   '[class*="_primary_"]',
planFrame:    '[data-plan-review-key]',
planCard:     '[data-plan-review-key] section[aria-label]',
planScroll:   '[data-plan-review-scroll]',
planStrip:    '[class*="_strip_"]',
planDot:      '[class*="_dot_"]',
planDiscuss:  '[class*="_discuss_"]',
```

## 6. 本批已交付（随本 commit 入库）

- `tools/probe-ask.mjs` v3 自治探针（throwaway 保留复勘用；头注含方法论教训）。
- `tools/artifacts/probe-ask-pending.png` 勘定截图（共存实锤证据）。
- 本文档。
