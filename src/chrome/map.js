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
  // 验收七轮:kindUser/kindSteering/kindContext/kindCompaction/kindManualCompaction/kindModelRetry
  // 六键随 McSysCard 重绘退役(user/steering 六轮、context/compaction/manual-compaction/model-retry
  // 七轮——四卡自有 .mc-* 类零宿主锚;行级出场 flashIn 走 flowItem 泛锚即可)
  kindAssistantStep: '[data-chat-flow-kind="assistant-step"]',
  kindCommand: '[data-chat-flow-kind="command"]',
  kindTurnError: '[data-chat-flow-kind="turn-error"]',
  kindTurnMaxTokens: '[data-chat-flow-kind="turn-max-tokens"]',
  kindTurnTail: '[data-chat-flow-kind="turn-tail"]',
  kindUnknown: '[data-chat-flow-kind="unknown"]',
  bubbleUser: ':is([data-chat-flow-kind="user"],[data-chat-flow-kind="steering"])>div>div>div>div', /* DRIFT-RISK: structural 四子级 flowItem>data-slot 包装>userRow>userStack>bubble;keyed slot 出口有 div[data-slot=…] 包装层(display:contents 不减选择器深度),结构位选择器须计入(裁定10;哈希三件套 gdEzaW_*,L5332-5361) */
  userGallery: '[data-align="end"] [data-variant]',            // stable(ATT L705-746)
  // 验收六轮:refChip 键随用户行重写退役(McUserNodeView 自有 .mc-user-chip 类)
  mdRoot: '[data-chat-flow-kind="assistant-step"] > div > div', /* DRIFT-RISK: structural;第一层 div 为 data-slot 包装层,原一层值命中包装层——当前无消费者,防未来误用(裁定10;Sxvs8a_*,L9461-9521) */
  // 验收四轮:thinkCard/thinkSummary/ariaExpanded 三键随宿主 ReasoningRow 覆写退役
  // (McThink 组件整体重写 assistant-step,自有 .mc-think 类零宿主锚)
  // 验收七轮:ctxBody/disclosureRow/contextForm/retryActive/compactionDisclosure 五键随 McSysCard
  // 重绘退役(宿主 context/retry/compaction DOM 整体被遮蔽,皮肤锚与 :has 图标细分、pulse 门控
  // data-active 锚、折叠图标 span 锚全部无消费者;重绘卡自有 .mc-* 类零宿主锚)
  turnTailBar: '[data-turn-tail]',                            // stable(L9715-9752)
  // —— 终审 F2 收编（2026-08-31）：此前 flow 规则里直写的宿主选择器一律进管制表（spec §1 唯一管制点）——
  pendingSteering: '[data-pending-steering]',  // stable(steering 待定态虚线廓，spec §4 行3)
  statusRow: '[role="status"]',                // stable(TurnStatus 宿主状态行；使用时限定 flowColumn 内，spec §4 行10)
  commandCard: '[data-variant="others"]',      // stable(command 卡壳锚，spec §4 行9「[data-variant="others"][data-state]」)
  dataState: '[data-state=',                   // 属性前缀键（任意取值形态；command 三态）
  // —— 用户验收三轮④收编（2026-09 live 探测，host 0.1.1-rc.2）——
  deliverRoot: '.P4kPIW_root',   // DRIFT-RISK: build-hash class(dsh-client-ui-deliverables 产物行;无 data-* 稳定锚,宿主升级先复核)
  deliverFile: '.P4kPIW_file',   // DRIFT-RISK: 同上(文件名 chip 按钮;含 measure 探针 P4kPIW_probe 同类复用)
  deliverMore: '.P4kPIW_more',   // DRIFT-RISK: 同上("+N 个文件"溢出标签)
  deliverProbe: '.P4kPIW_probe', // DRIFT-RISK: 同上(宿主测宽探针,同类复用 chip 皮肤;轮5 重绘数据面)
  // —— overlays2 段(hero 空态 + dialog/scrim 换皮;探针 probe-overlays 实勘 2026-09-02,host 0.1.1-rc.2)——
  // heroRoot = ConversationRoot 根 div(实勘空会话 data-phase="hero" 同点在场)。与 mainColumn 同源
  // ——div[data-phase] 即 phase 载体根(根 div 兼带 data-phase settling|hero|active);probe 2026-09-02
  // 验证全页唯一。弃旧 build-hash 类锚(哈希类随构建漂移,宿主升级必断)。
  heroRoot: 'div[data-phase]',    /* stable: official data-attr(同 mainColumn 同源;uniqueness 勘定 2026-09-02) */
  // heroOfficial = 官方空态内容容器(fish 品牌+「探索未至之境」headline+预览徽标+工作区选择位)。
  // 不在滚动口内(scroll 首子为空 div[data-slot=conversation.session]),挂 composerStack 的
  // composerHero 变体内;容器自身无 data-*(内层仅 conversation.hero.brand.mark 槽位)。
  heroOfficial: '.pXSMma_root',   /* DRIFT-RISK: build-hash class(同上;勘定 2026-09-02) */
  // heroGlow = 官方 hero 空态背后的装饰晕 SVG——用户验收报告的「椭圆形的圆形渐变色」真身
  // (勘定 2026-09-03 probe-recon5/6:svg.wSkVaW_heroGlow viewBox 0 0 1051 468,内含
  // <ellipse rx=425.5 ry=134 fill=#6187D8 fill-opacity=.08> + feGaussianBlur 50,position:absolute
  // z:-1 1100×490;挂 composerStack 的 composerHero 变体内,不在 heroOfficial 藏匿域 → 官方空态
  // 藏了晕还在)。CSS background/box-shadow/伪元素全零命中——渐变由 SVG 内部图形自绘,选择器
  // 只能锚 class 后缀 heroGlow(语义 token,前缀哈希随构建漂移,同 sessionRowArrow 纪律)。
  heroGlow: 'svg[class*="heroGlow"]', /* DRIFT-RISK: hashed-substring */
  // dlg 组 = 官方 settings 弹窗(settings-general SettingsRoot:触发钮居侧栏 footArea>settingsArea,
  // 面板 role=dialog aria-modal+aria-labelledby,overlay role=presentation fixed inset:0 z:1000,
  // mask rgba(0,0,0,.5)+blur(2px) 点击/Esc 关)。实勘 2026-09-02:触发钮点开→Esc 关净(role=dialog 归零)。
  // 全 app 四处 role=dialog(settings 面板/图片 lightbox/ctx meter popover/feedback note 面板),
  // 仅 settings 面板以 aria-labelledby 定题(其余 aria-label)→ dlgCard 以此唯一化;
  // mask = overlay 首子 div[aria-hidden];:has 域定 overlay 必须内嵌 aria-labelledby dialog(=settings
  // 面板语义)——裸 [role=presentation]>div[aria-hidden] 会误伤其余宿主 overlay(lightbox/ctx meter/feedback
  // note)的遮罩,四 dialog 普查见报告 §1;input-trigger 的 role=presentation 皆叶子标题,本就零碰撞;
  // 面板 switch 数 0(通用设置节为 navCell/分段钮形态,无 role=switch)。
  dlgCard: '[role="dialog"][aria-labelledby]',                // aria 语义锚 stable
  dlgMask: '[role="presentation"]:has([role="dialog"][aria-labelledby]) > div[aria-hidden="true"]', // aria 语义锚 stable+:has 域定 settings 语义
  dlgNav: '[role="dialog"][aria-labelledby] nav',             // 弹窗左 nav(节序:通用/模型/插件/Agent 预设/豆包模式)
  dlgTriggerSettings: '#root > div > div > div:first-child button[aria-haspopup="dialog"]', /* DRIFT-RISK: structural 前缀(同 sidebar* 列链)+aria 语义锚后缀;源级另有 ctx meter/feedback note 两 haspopup=dialog 钮(条件挂载、会话列内),侧栏列限定零碰撞 */
  // —— menu 段(弹出菜单;探针 2026-09-01,host 0.1.1-rc.1——附录A)——
  // 宿主原生菜单 = dsh-client-ui-primitives Menu(portal:true):createPortal(list,document.body),
  // list 为 div[role="menu"] 定位浮层(position:fixed 内联 left/top,viewport 内 clamp;
  // primitives lib/index.js L1525-1704)。项为 button[role="menuitem"],分隔线 div[role="separator"]。
  // 触发 = 行内 dots 钮左键(workspace SessionNodeItem/ProjectRowItem 的 rowActions),无 contextmenu 右键。
  // 主题在装时官方树被 McFinder 遮蔽,此组键是遮蔽失败时的兜底隐藏通道(Task 4 自绘兜底藏原生菜单)。
  menuPortal: 'body > div[role="menu"]',            // 宿主菜单 portal 容器(createPortal 直挂 body;类名全哈希,role 语义锚 stable)
  sidebarViewOpts: 'button[aria-label=视图选项]',    // 官方侧栏「视图选项」钮(轮5:视图钮官方代理;主题同名钮经 data-mc-finder 在代理侧过滤,防自点递归)
  sidebarNewSess: 'button[aria-label=新建会话]',     // 官方侧栏「新建会话」图标钮(轮5:加号官方代理,直建会话无弹层)
  menuHostItem: 'body > div[role="menu"] [role="menuitem"]', // 宿主原生菜单项(button[role=menuitem];自绘兜底藏;stable)
  // —— dock 段(输入坞;探针 2026-09-01,host 0.1.1-rc.2 rev aba836a0c42d——dock 附录A;
  //     验收轮1 回填 2026-09-01:live-runtime 探针 acceptance1-probe 勘定 busy 面貌)——
  composerSeat: '[data-composer-seat]', // composer 席位容器(探针实测在场;官方卡 closest 命中)
  composerHide: '[data-composer-card]', // 官方卡壳=藏匿锚(一期键复核;属性门控 html[data-mc-dock-on] 藏未删)
  composerField: '[data-composer-card] textarea', // 官方 textarea(镜像目标;镜像冒烟 mirrored:true)
  composerSend: '[data-composer-card] [aria-label="发送消息"]', // 官方发送钮(程序化 click;镜像后 disabled true→false 翻转实测)
  // 验收轮1 勘定(B 段):busy 时官方 Send 卸载(非 hidden)、「停止生成」同槽挂载——挂载沿=干净忙闲沿
  composerStop: '[data-composer-card] button[aria-label="停止生成"]',  // busy 才挂载;勿用哈希类(uV2eYG_primary 与 Send 共享,随构建漂移)
  composerPhase: '',      // 勘定裁定(2026-09-01 验收轮1):data-phase(settling|hero|active)是页面态非忙闲,'running|busy' 值不存在——busy 改由 composerStop 在场判定(syncBusy)
  composerCmd:   '[data-composer-card] button[aria-label="命令"]',       // 斜杠命令入口(idle/busy 全程在场)
  composerPerm:  '[data-composer-card] button[aria-label^="访问模式"]',   // 动态后缀=当前模式明文(「访问模式，当前：Full access」)
  composerModel: '[data-composer-card] button[aria-label^="选择模型"]',   // title 属性=当前模型名(精确读值锚)
  composerCtx:   '[data-composer-card] [title^="上下文已用"], [data-composer-card] button[aria-label^="上下文已用"]', // 全态在场(验收轮3 深扫勘定:idle=SPAN[title] 非交互形态,busy=BUTTON[aria-label];title/aria 均带 %)
  // —— dock2 段(官方 input dock 槽;部署包直读 2026-09-02,host 0.1.1-rc.2)——
  // renderer SlotOutlet:每槽 div[data-slot=<key>] display:contents 包装;官方 input dock
  // 三注入(todo=conversation包 order0/goal=[data-goal-bar] order10/queue=QueueDock order20)
  // 渲染于 composerStack 官方卡之外——藏卡不藏它,故整槽藏匿(自绘坞完全替代;藏未删,goal 镜像钮在内)。
  composerDockSlot: '[data-slot="conversation.input.dock"]',
  // —— dock2 段:官方 GoalBar 动作镜像锚(dsh-client-ui-goal lib/client.js 直读 2026-09-02;aria=i18n zh,DRIFT-RISK 同 composerSend)——
  // 常驻条钮(按相位条件渲染):暂停目标/恢复目标/编辑目标/清除目标;编辑态:目标内容 input + 保存目标/取消编辑。
  goalPause:   '[data-goal-bar] button[aria-label="暂停目标"]',
  goalResume:  '[data-goal-bar] button[aria-label="恢复目标"]',
  goalEditBtn: '[data-goal-bar] button[aria-label="编辑目标"]',
  goalClear:   '[data-goal-bar] button[aria-label="清除目标"]',
  goalInput:   '[data-goal-bar] input[aria-label="目标内容"]',
  goalSave:    '[data-goal-bar] button[aria-label="保存目标"]',
  goalCancel:  '[data-goal-bar] button[aria-label="取消编辑"]',
};

