# Macintosh 主题 · 二期 flow(会话流)模块 · 设计文档

日期:2026-08-31
状态:已与用户逐节确认(4/4 节)
上游文档:`2026-08-30-macintosh-theme-design.md`(总设计,§3 模块 6 / §4 映射三层 / §5 动画纪律)、`2026-08-30-macintosh-theme-phase1.md`(一期收尾实录 + 二期待办)
规范源:`prototype/macintosh-workspace.html` §5(L461-535 CSS + L1760 起 kit 陈列);交互参照 `prototype/macintosh-interactive.html`(s-md 全要素会话 L1014-1018);手册 `prototype/component-dev-notes.md` §8
宿主版本:0.1.1-rc.2(探针 2026-08-31,证据 `dsh-client-ui-conversation/lib/client.js` 行号见 §2)

## 0 · 范围与裁定

- **覆盖 kind(11/15)**:五件套(`.md` 正文 / user+steering 气泡 / context 注入条 / reasoning think 卡 / turn-tail)+ 同类细长条(model-retry / turn-error / turn-max-tokens / compaction / manual-compaction / command 卡壳)+ TurnStatus 运行中状态行 + unknown 兜底。
- **明确不做**:tool-call(toolcard 周期)、workflow-run、command-input(dock/goal 周期)三个 kind 零改动;md task-list checkbox 保原生 + `accent-color:var(--mc-accent)`;图片 IMG 徽章不移植(宿主是真图非占位);reasoning 五帧流式状态机不接宿主(spec §5 总设计裁定,kit 独占演示)。
- **实施路径 = 方案 A(纯层3 CSS 覆写 + 官方变量通道 + MC_MAP 管制)**:不替换任何 kind 的渲染,不注册任何 flow 域 slot。参照 aurum(层2 遮蔽为主)实践教训:turn-tail children 声明竞态雷(其 client.js L3172 注释,2026-08-24 实测)、md 正文即便接管也应委托官方 MarkdownText(其 assistant-step 接管亦如此)——方案 A 天然避开前者、与后者同向。
- **DX 裁定**:开发循环走 dev 热重载管道(§5),重启宿主会打断 agent 回合(实测 2026-08-31),二期迭代不再依赖逐次重启。

## 1 · 架构

- `client.js` 新增 `McFlow` 模块 `{ css, mount(ctx) }`,入 mods/order(McFinder 之后、McKit 之前);`src/conv/flow.js` 镜像作设计参照(client.js 为准)。
- 全部 flow 域官方选择器收进 `MC_MAP`「flow 段」(唯一管制点原则);audit「宿主选择器仅 map 段」特征核验扩容。
- 官方变量通道:`theme.overrideTokens` 追加 `--dsw-specific-bubble → var(--mc-accent)`(气泡底零选择器);`--dsh-chat-content-width` 不动(748px,与主窗协调);列 gap 16→14、padding 16 走 CSS。
- 降级语义:任一锚失配 → 该组件回退官方样式 + 层1 token 配色,不破版。

## 2 · MC_MAP flow 段与映射表

探针结论(行号 = dsh-client-ui-conversation/lib/client.js,0.1.1-rc.2):flow 三级稳定锚 `[data-conversation-scroll]`(L7276)→ `[data-chat-flow]`(L5829)→ 每消息行 `[data-chat-flow-kind]`(L5506-5510,keyed 槽 `conversation.chat.node` 15 种注册 key 之一)。

```
flowScroll   '[data-conversation-scroll]'                     // stable
flowColumn   '[data-chat-flow]'                                // stable
flowItem     '[data-chat-flow-kind]'                           // stable
kindUser / kindSteering / kindContext / kindAssistantStep / kindCommand /
kindCompaction / kindManualCompaction / kindModelRetry / kindTurnError /
kindTurnMaxTokens / kindTurnTail / kindUnknown
             '[data-chat-flow-kind="<kind>"]'                  // stable ×12
userBubble   '[data-chat-flow-kind="user"] > div > div'        // DRIFT-RISK structural(哈希三件套 gdEzaW_userRow/userStack/bubble,L5332-5361)
userGallery  '[data-align="end"] [data-variant]'               // stable(图片格,ATT L705-746)
refChip      '[data-ref-chip]'                                 // stable(引用小片,L5315-5324)
mdRoot       '[data-chat-flow-kind="assistant-step"] > div'    // DRIFT-RISK(md 容器哈希无 data;Sxvs8a_root/body,L9461-9521)
thinkCard    '[data-variant="think"]'                          // stable(双锚 [data-state="running|ok"],L9389-9439)
ctxBody      '[data-context-injection-body]'                   // stable(六 form:L4863-4907)
turnTailBar  '[data-turn-tail]'                                // stable(L9715-9752)
```

- md 元素级选择器全部 `${kindAssistantStep} <tag>` 下钻(h1-h6/p/ul/ol/li/code/pre/blockquote/a/table);稳定全局类 `.md-code-block` / `.md-table-wide` / `.contains-task-list` 直选(dsh-client-ui-primitives)。
- 行内 code 与代码块区分:`:not(pre)>code`(宿主同款结构区分,无专属类)。
- **context form → sprite 图标映射**(原型四型语汇,六 form 全覆盖):instructions/notice/relay → `i-doc`;catalog(skill 目录)→ `i-px-list`;snapshot(runtime context)→ `i-px-copy`;recall → `i-clock`(sprite 缺则从 assets/img/icons/pixelarticons 补,复用一期 sprite 注入协议)。compaction/manual-compaction → `i-px-copy`。图标经 CSS 注入(替换/叠加宿主图标位),宿主原图标隐藏。

## 3 · 动画管道(核心:observer 三拍,不做 CSS one-shot)

- `McFlow.mount(ctx)` 起**单个 MutationObserver** 观察 flowColumn 子树(childList),`ctx.effect` teardown 时 disconnect。
- **出场三拍**:新增 `[data-chat-flow-kind]` 行 → mcfx `flashIn` 语言(mc-ghost → mc-flash → 撤,各 100ms 全走 `CLOCK.next`);每拍前 `isConnected` 校验 + try/catch(React 重渲染可能抹 class——抹掉即静默失效,不重试)。
- **循环动画相位同步**:映射表声明「锚 → 属性」对——thinkCard running 的 mc-pulse(覆写宿主 shimmer)、kindModelRetry 的 s-dot pulse、command running 的 mc-sweep → `CLOCK.syncAnim(el, PULSE|SWEEP, prop)` 注负延迟,多卡同相位。
- `prefers-reduced-motion: reduce`:JS 检测后跳过 ghost/flash 拍(直接 swap);CSS 侧全局 .01ms 压缩一期已备。
- 浅色反转:mc-ghost/mc-flash 及浅色反白块复用一期 McTokens 定义,零新增。
- 纪律:新 CSS 零 hover 零 transition(audit 管制);宿主自带的 transition(如 think 折叠)以 `transition:none` 压平保持硬切。

## 4 · 组件覆写规格

值全部照抄原型 §5(`prototype/macintosh-workspace.html:461-535`);此处记结构裁定,精确值以原型为准。

| # | 组件 | 锚 | 结构裁定 |
|---|---|---|---|
| 1 | .flow 列 | flowColumn/flowItem | gap 14、padding 16、`flex:none` 防压扁(手册 §6.4) |
| 2 | .md 正文 | kindAssistantStep 下钻 | 14px/1.8 ui 族;h1-h3 统一 display 600 17/15/14;行内 code=sel-bg 底+r-tag 角;pre(.md-code-block)=bg-deep+1px border-soft+r-card,横滚;code 块 banner(语言条+复制钮)→ surface-2 细条 + icon-btn sm 钳形;table 全格线 border-soft、th display 体 surface-2 底;blockquote 左 2px accent-dim、muted;a 染 accent |
| 3 | 用户气泡 | userBubble(结构位) | accent 实底 + accent-ink 反白 + 1px border + radius 8(压官方 22px)+ ui 14/1.7;`--dsw-specific-bubble` 走变量通道;userGallery 图廓 1px 边+r-card;refChip sel-bg 小片;steering 同款,[data-pending-steering] 加 faint 虚线廓 |
| 4 | context 注入条 | kindContext+ctxBody | surface-2 底 + **1px dashed** border-soft + r-card;折叠态单行 ellipsis 12px muted;15px faint 图标(§2 映射);展开体 12px muted 左缩进 |
| 5 | reasoning think 卡 | thinkCard 双锚 | surface-3 底+1px 边+r-card;[data-state=running]=spark 9% 琥珀染 + 标题 spark 色;宿主 shimmer 覆写为 mc-pulse 三色硬切+负延迟;摘要行 faint 12px ellipsis;时长 mono 10px;折叠行为宿主 DisclosureRow 自理 |
| 6 | turn-tail | turnTailBar | 统计文本 11px mono faint;复制/分支钮容器→ icon-btn sm 钳形(不换宿主图标内容,只造壳) |
| 7 | 细长条组 | kindModelRetry/TurnError/TurnMaxTokens | retry=s-dot 八角点 mc-pulse+muted 12px 文案;error=danger 文字+左 2px danger 线;max-tokens=spark 同款 |
| 8 | 压缩条 | kindCompaction/ManualCompaction | inject 同款虚线条(i-px-copy)+ 可展开摘要体 12px muted |
| 9 | command 卡壳 | `[data-variant="others"][data-state]` | 本轮只做卡壳+三态色(r-card+边+running spark sweep);细节留 toolcard 周期 |
| 10 | TurnStatus | flowColumn 内 role="status" | spark 脉冲点 + muted 小字(宿主特有,低强度) |
| 11 | unknown 兜底 | kindUnknown | surface-2 + mono 小字,不破版 |

## 5 · dev 热重载管道(Task 0)

两层设计,第一层通则第二层不建:

1. **HMR 可行性 spike**:宿主依赖含 cordis-plugin-hmr/dsh-client-hmr,aurum README 言 link 安装「编辑即生效,hot-reload 能升级已加载插件版本」。spike = link 安装态注释级改动 → 不重启 → 触发页内 HMR/刷新 → 验证 rev 与内容更新。通过 → 热重载零自建,只写使用协议。
2. **自建 reload 管道(spike 不通的 fallback)**:
   - `apply(ctx)` disposers 化:全部副作用(style/sprite/desk 移除、slot unreg、overrideTokens off、observer disconnect、CLOCK dispose)登记 `window.__MC_DEV__.disposers`,逆序执行——同时强化一期「撤除干净」验收;
   - `index.js` 加 `GET /mcx-assets/__dev__/client.js`(包根 client.js,`Cache-Control: no-store` 绕 boot rev 缓存);
   - `window.__MC_DEV__.reload()`:跑旧 disposers → no-store fetch → `new Function` 包裹 eval → 以保存的 ctx 调新 `apply`(React 等 external 全局可用性在 spike 一并验证);
   - 开关 `localStorage.mcdev==='1'`,生产零影响;失败(fetch/eval)console.error 明示、旧实例保持。

## 6 · kit 扩区(会话流分区)

- McKit 新增「会话流」分区,照原型 §5 kit-band(L1760 起)陈列:md 全要素静态复刻(s-md 基准)、用户气泡(attach 占位 + pending steering)、inject 四型、reasoning run/done 双帧 + **五帧流式状态机演示**(tokenize/PER_TICK 28/帧 B 白块/帧 A 揭开/顿拍,自 interactive 移植 mini 驱动,按钮触发)、turn-tail、retry/cap 行。
- 原型类名直用(自有 slot DOM),布局类 `kit-` 前缀;与 workspace 原型并排目视比对为验收件。

## 7 · 错误处理

- 锚失配 → 组件级回退官方样式+层1 配色;走查含失配演练(改坏一键验证降级再复原,一期同款)。
- observer 回调全 try/catch + 每拍 isConnected;observer 不可用/挂掉 → 静默退化,静态主题完整。
- 三拍 class 被 React 抹 → 静默失效不重试(闪烁是装饰不是功能)。
- dev 管道:disposers 逐项 try/catch;eval 失败保留旧实例。

## 8 · 测试与验收

- `npm test`:audit 扩容(flow 段特征核验);新增 context form→icon 映射表纯数据测试。
- **`tools/verify-flow.mjs`**(playwright 门禁):s-md 全要素内容发真实消息 → .md 各元素 computed style 断言;气泡/think 卡/inject 条/细长条断言;深浅切换反转断言。
- `verify-persistent` 扩 flow 域断言 + 重载持久。
- 浅色 QA 专项:flow 域逐组件,kit 与 workspace 原型并排比对。
- 走查清单(笔记 §13 裁剪):无 hover/无 transition/延时走 CLOCK/负延迟对相位/reduced-motion/浅色反转/动态文本 esc。
- 每任务一 commit,全绿才 commit。
- **DoD**:真实会话流各 kind 呈 Macintosh 语汇(截图对照原型)、kit 分区与原型并排一致、`npm test` + 双 verify GREEN、dev 热重载可用、浅色 QA 过。

## 9 · 自审记录

- 占位符:无 TBD/TODO;form→icon 映射已定(spike 类条目自带判定路径)。
- 一致性:与总设计 §4/§5、一期收尾实录裁定(overrideTokens 通道、map 管制、mcfx 协议)无冲突;aurum 教训已消化(§0)。
- 范围:单周期可实施(Task 0 dev 管道 + 映射 + 11 组件 + kit 分区 + 双 verify);toolcard/dock/overlays/responsive 各自周期另行 spec。
- 歧义检查:气泡 radius 8(原型 L487)非 r-tag/r-card;TurnStatus 锚 `role="status"` 限定在 flowColumn 内;command 卡壳仅色壳不入 toolcard 细节——均已显式。
