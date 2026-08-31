// src/chrome/map.js —— 宿主选择器管制文件：全主题唯一允许出现宿主选择器的地方（Task 6 探针回填）
// 探针方法：直读 DSH 部署源（@deepseek-ai/dsh 0.1.1-rc.1，node_modules 包体），未跑 DOM 探针——
// 发布包 lib/client.js 即页面运行源（window.__ModuleLoader__ 工厂），源码即 DOM 真相。
// 优先级纪律：data-* > aria/role > 结构/class（后两者标 DRIFT-RISK）。
//
// 探针出处（均在 C:\Users\fohhy\AppData\Roaming\npm\node_modules\@deepseek-ai\dsh\node_modules\@deepseek-ai\）：
//  - dsh-web-frontend/dist/index.html —— React 挂载点 <body><div id="root">（唯一稳定 id）
//  - dsh-client-ui-layout/lib/client.js —— AppFrame：frame=grid[sidebar|center|details]+overlayLayer，
//    无任何 data-* 业务锚点，class 为 CSS-module 哈希（pI_x6G_frame/_centerCol/_sidebarCol，随构建变）
//  - dsh-client-ui-conversation/lib/client.js ——
//      ConversationRoot(L~7287)：根 div 带 data-phase(settling|hero|active)，含 header 席位 +
//      div[data-conversation-scroll](L7292) + composer 席（data-composer-seat）
//      ConversationSessionHeader(L~7343)：<header> 元素，无 data-*（titleRow/crumbs/tabs 均哈希 class）
//      InputBar(L~3997-4000)：卡片 div 带 data-composer-card
//  - dsh-client-ui-workspace/lib/client.js —— SessionNodeItem(L718-721)：
//      会话行 div role="treeitem" + aria-selected（选中=true）
//  - dsh-client-ui-sidebar/lib/client.js —— SidebarRoot：logoRow/brand 全哈希 class、aria-label 走 i18n（不可用）
// src/chrome/map.js —— 宿主选择器管制文件：全主题唯一允许出现宿主选择器的地方（Task 6 探针回填）
// 探针方法：直读 DSH 部署源（@deepseek-ai/dsh 0.1.1-rc.1，node_modules 包体），未跑 DOM 探针——
// 发布包 lib/client.js 即页面运行源（window.__ModuleLoader__ 工厂），源码即 DOM 真相。
// 优先级纪律：data-* > aria/role > 结构/class（后两者标 DRIFT-RISK）。
//
// 探针出处（均在 C:\Users\fohhy\AppData\Roaming\npm\node_modules\@deepseek-ai\dsh\node_modules\@deepseek-ai\）：
//  - dsh-web-frontend/dist/index.html —— React 挂载点 <body><div id="root">（唯一稳定 id）
//  - dsh-client-ui-layout/lib/client.js —— AppFrame：frame=grid[sidebar|center|details]+overlayLayer，
//    无任何 data-* 业务锚点，class 为 CSS-module 哈希（pI_x6G_frame/_centerCol/_sidebarCol，随构建变）
//  - dsh-client-ui-conversation/lib/client.js ——
//      ConversationRoot(L~7287)：根 div 带 data-phase(settling|hero|active)，含 header 席位 +
//      div[data-conversation-scroll](L7292) + composer 席（data-composer-seat）
//      ConversationSessionHeader(L~7343)：<header> 元素，无 data-*（titleRow/crumbs/tabs 均哈希 class）
//      InputBar(L~3997-4000)：卡片 div 带 data-composer-card
//  - dsh-client-ui-workspace/lib/client.js —— SessionNodeItem(L718-721)：
//      会话行 div role="treeitem" + aria-selected（选中=true）
//  - dsh-client-ui-sidebar/lib/client.js —— SidebarRoot：logoRow/brand 全哈希 class、aria-label 走 i18n（不可用）
const MC_MAP = {
  // appRoot = 三列 frame grid（AppFrame 根 div）。注意：#root 与 frame 之间隔着一层
  // display:contents 的透传包装 div（padding 打在它上面无效）——真 grid 是 #root > div > div。
  // 无 data-* → 结构位。display:contents 包装经 probe-dom 实测（2026-08-30）。
  appRoot: '#root > div > div', /* DRIFT-RISK: structural */
  // appRootRail = 折叠态的 frame（官方 AppFrame 折叠时挂 data-sidebar-collapsed 属性，
  // 稳定 data-* 锚；供折叠态专属样式/检测引用）
  appRootRail: '#root > div > div[data-sidebar-collapsed]', /* stable: official data-attr */
  // mainColumn = 会话根（header + 滚动口 + composer 都在其内，正好是"主窗"区域）
  mainColumn: 'div[data-phase]',
  // sessionHeader = ConversationSessionHeader 的 <header>；无 data-* → 会话根内结构位
  sessionHeader: 'div[data-phase] > header', /* DRIFT-RISK: structural */
  scrollport: '[data-conversation-scroll]',
  composerCard: '[data-composer-card]',
  // —— 以下供 Task 7 侧栏使用（Task 7 已对部署包复核，出处行号如下） ——
  // sidebar = 网格首列 sidebarCol。frame children 顺序：sidebarCol / centerCol / detailsCol /
  //   overlayLayer / handle（后两者 absolute）。注意选择器要越过 display:contents 包装层。
  //   复核：dsh-client-ui-layout/lib/client.js L218-232；probe-dom 实测（2026-08-30）。
  sidebar: '#root > div > div > div:first-child', /* DRIFT-RISK: structural */
  // sidebarBrand = 侧栏列内首个 button。复核：dsh-client-ui-sidebar/lib/client.js L156-201 ——
  //   logoRow 首子 = 品牌 button（L158-181，仅 wide 形态渲染）；rail 收起时首个 button 变为
  //   折叠钮（L185-200）。aria-label 走 i18n（L161/188）不可依赖。样式覆写宽态命中品牌、窄态命中折叠钮，可接受。
  sidebarBrand: '#root > div > div > div:first-child > div > div > div:nth-child(2) button', /* DRIFT-RISK: structural（+1 标题栏占位；收窄到 logoRow——宽版会误伤标题栏 tbox 的 13px 规格） */
  // sessionRow / sessionRowSelected。复核：dsh-client-ui-workspace/lib/client.js L718-721 ——
  //   SessionNodeItem 行 div role="treeitem" + aria-selected（selected 时 "true"），稳定语义锚点。
  //   T10 复核（2026-08-31，本机宿主 rc.2：C:\Users\fengb\node_modules\@deepseek-ai\dsh-client-ui-workspace）：
  //   语义锚不变（工作区行 ownRow L469-472 亦 role=treeitem+aria-expanded）；但 rc.2 起行内图标均包进
  //   span 槽位（folder 槽=首 span / chevron 槽 / status 槽=会话行首 span），一期「直系 svg」三锚失配 → T10 换锚。
  sessionRow: 'div[role="treeitem"]',
  sessionRowSelected: 'div[role="treeitem"][aria-selected="true"]',
  // 会话树行细分（probe-tree 实测 2026-08-30；T10 对 rc.2 源码复核修正）：工作区行带 aria-expanded；
  //   会话行无 expanded（状态图标在首 span 槽）。行内"操作/新建"按钮走 aria-label。
  //   注意：主题在装时官方树被 McFinder 遮蔽（sidebar.workspaces 席位 priority:-1 lowest-render），
  //   live DOM 无 treeitem 属设计内行为——本组键是遮蔽失败（slots 服务缺席等）时的兜底样式通道。
  sessionRowWorkspace: 'div[role="treeitem"][aria-expanded]', /* DRIFT-RISK: structural */
  sessionRowArrow: 'div[role="treeitem"][aria-expanded] svg[class*="arrow"]', /* DRIFT-RISK: hashed-substring;T10 修:svg 入 chevron 槽→去直系改后代(箭头 svg 自带 *_arrow 哈希类,rc.2 源 L486-489) */
  sessionRowFolder: 'div[role="treeitem"][aria-expanded] > span:first-of-type > svg', /* DRIFT-RISK: structural;T10 修:首 span=folder 槽(rc.2 源 L482-485) */
  sessionStatusIcon: 'div[role="treeitem"]:not([aria-expanded]) > span:first-of-type > [data-state]', /* DRIFT-RISK: structural;T10 修:StateDot 恒带 data-state 且双形态(ongoing=svg/其余=span,primitives StateDot L66-93),纯 svg 锚先天不稳 */
  // —— 侧栏内部结构位（精修2：元素级 Finder 语汇）。经 probe-session 实测（2026-08-30）——
  //   sidebarCol > div(h0 包装) > .hHd-Xa_root，root 官方 children 恒序：
  //   [1]logoRow(DIV) [2]newSession(BUTTON) [3]regionArea(DIV 工作区树) [4]footArea(DIV)。
  //   我们在首位插入 .mc-titlebar 真标题栏（McSidebar.mount，自愈重插）→ 官方子元素整体后移一位，
  //   nth-child 序号 +1（titlebar 万一缺席则失配=回退官方样式，不破版）。
  //   全无 data-*，nth-child 结构位（DRIFT-RISK：随官方侧栏改版漂移，失配=回退底色不破版）。
  sidebarRoot: '#root > div > div > div:first-child > div > div', /* DRIFT-RISK: structural */
  sidebarLogoRow: '#root > div > div > div:first-child > div > div > div:nth-child(2)', /* DRIFT-RISK: structural (+1 标题栏占位) */
  sidebarNewSession: '#root > div > div > div:first-child > div > div > button:nth-child(3)', /* DRIFT-RISK: structural (+1 标题栏占位) */
  sidebarRegion: '#root > div > div > div:first-child > div > div > div:nth-child(4)', /* DRIFT-RISK: structural (+1 标题栏占位) */
  sidebarFoot: '#root > div > div > div:first-child > div > div > div:nth-child(5)', /* DRIFT-RISK: structural (+1 标题栏占位) */
  // 官方折叠钮 = logoRow 末钮（wide 态 logoRow=[品牌钮, 折叠钮]；collapsed 态只剩折叠钮=首=末）。
  // 注意 nth-child(2)：我们注入的 .mc-titlebar 占了第 1 位（官方子元素整体后移）。
  // 折叠机制（部署源探明 2026-08-30 + probe-round6-pre 实测）：钮 onClick → panels.sidebar=0 ↔ 280；
  // frame 内联 gridTemplateColumns 280px→56px（官方 300ms grid 过渡，我们以 transition-duration:0s 压平）；
  // frame 带 data-sidebar-collapsed 属性（稳定 data-* 锚 = 折叠态检测）；sidebarRoot 在 150ms settle 后
  // 加 collapsed 类并给 sidebar.workspaces 席位传 {wide:false, expandSidebar}（迷你形态的官方信号）。
  sidebarCollapseBtn: '#root > div > div > div:first-child > div > div > div:nth-child(2) button:last-child', /* DRIFT-RISK: structural */
  // 展开态/折叠态限定版（:not()/:attr 打在链中 frame 一级，不能前缀整串——否则造出嵌套 #root 的死选择器）：
  // *Wide 仅展开态命中（frame 无 data-sidebar-collapsed）；*Rail 仅折叠轨命中。
  sidebarLogoRowWide: '#root > div > div:not([data-sidebar-collapsed]) > div:first-child > div > div > div:nth-child(2)', /* DRIFT-RISK: structural */
  sidebarNewSessionWide: '#root > div > div:not([data-sidebar-collapsed]) > div:first-child > div > div > button:nth-child(3)', /* DRIFT-RISK: structural */
  sidebarCollapseBtnWide: '#root > div > div:not([data-sidebar-collapsed]) > div:first-child > div > div > div:nth-child(2) button:last-child', /* DRIFT-RISK: structural */
  sidebarNewSessionRail: '#root > div > div[data-sidebar-collapsed] > div:first-child > div > div > button:nth-child(3)', /* DRIFT-RISK: structural */
  sidebarFootRail: '#root > div > div[data-sidebar-collapsed] > div:first-child > div > div > div:nth-child(5)', /* DRIFT-RISK: structural */
  sidebarLogoRowRail: '#root > div > div[data-sidebar-collapsed] > div:first-child > div > div > div:nth-child(2)', /* DRIFT-RISK: structural */
  // —— flow 段(会话流;探针 2026-08-31,host 0.1.1-rc.2;dsh-client-ui-conversation 行号)——
  flowScroll: '[data-conversation-scroll]',                    // stable(L7276)
  flowColumn: '[data-chat-flow]',                             // stable(L5829)
  flowItem: '[data-chat-flow-kind]',                          // stable(L5506-5510)
  kindUser: '[data-chat-flow-kind="user"]',
  kindSteering: '[data-chat-flow-kind="steering"]',
  kindContext: '[data-chat-flow-kind="context"]',
  kindAssistantStep: '[data-chat-flow-kind="assistant-step"]',
  kindCommand: '[data-chat-flow-kind="command"]',
  kindCompaction: '[data-chat-flow-kind="compaction"]',
  kindManualCompaction: '[data-chat-flow-kind="manual-compaction"]',
  kindModelRetry: '[data-chat-flow-kind="model-retry"]',
  kindTurnError: '[data-chat-flow-kind="turn-error"]',
  kindTurnMaxTokens: '[data-chat-flow-kind="turn-max-tokens"]',
  kindTurnTail: '[data-chat-flow-kind="turn-tail"]',
  kindUnknown: '[data-chat-flow-kind="unknown"]',
  bubbleUser: ':is([data-chat-flow-kind="user"],[data-chat-flow-kind="steering"])>div>div>div>div', /* DRIFT-RISK: structural 四子级 flowItem>data-slot 包装>userRow>userStack>bubble;keyed slot 出口有 div[data-slot=…] 包装层(display:contents 不减选择器深度),结构位选择器须计入(裁定10;哈希三件套 gdEzaW_*,L5332-5361) */
  userGallery: '[data-align="end"] [data-variant]',            // stable(ATT L705-746)
  refChip: '[data-ref-chip]',                                 // stable(L5315-5324)
  mdRoot: '[data-chat-flow-kind="assistant-step"] > div > div', /* DRIFT-RISK: structural;第一层 div 为 data-slot 包装层,原一层值命中包装层——当前无消费者,防未来误用(裁定10;Sxvs8a_*,L9461-9521) */
  thinkCard: '[data-variant="think"]',                        // stable;双锚 [data-state](L9389-9439)
  ctxBody: '[data-context-injection-body]',                   // stable(L4863-4907)
  turnTailBar: '[data-turn-tail]',                            // stable(L9715-9752)
};

