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
  // appRoot = 三列 frame（AppFrame 根 div）。无 data-* → 结构位（#root 唯一子div）
  appRoot: '#root > div', /* DRIFT-RISK: structural */
  // mainColumn = 会话根（header + 滚动口 + composer 都在其内，正好是"主窗"区域）
  mainColumn: 'div[data-phase]',
  // sessionHeader = ConversationSessionHeader 的 <header>；无 data-* → 会话根内结构位
  sessionHeader: 'div[data-phase] > header', /* DRIFT-RISK: structural */
  scrollport: '[data-conversation-scroll]',
  composerCard: '[data-composer-card]',
  // —— 以下供 Task 7 侧栏使用（Task 7 已对部署包复核，出处行号如下） ——
  // sidebar = 网格首列 sidebarCol。复核：dsh-client-ui-layout/lib/client.js L218-232 ——
  //   AppFrame 根 div（frame，即 #root 唯一子 div）children[0] 恒为 sidebarCol div
  //   （L226-232，无 data-*，class 为哈希 pI_x6G_sidebarCol）。结构位成立但随宿主改版漂移。
  sidebar: '#root > div > div:first-child', /* DRIFT-RISK: structural */
  // sidebarBrand = 侧栏列内首个 button。复核：dsh-client-ui-sidebar/lib/client.js L156-201 ——
  //   logoRow 首子 = 品牌 button（L158-181，仅 wide 形态渲染）；rail 收起时首个 button 变为
  //   折叠钮（L185-200）。aria-label 走 i18n（L161/188）不可依赖。样式覆写宽态命中品牌、窄态命中折叠钮，可接受。
  sidebarBrand: '#root > div > div:first-child button', /* DRIFT-RISK: structural */
  // sessionRow / sessionRowSelected。复核：dsh-client-ui-workspace/lib/client.js L718-721 ——
  //   SessionNodeItem 行 div role="treeitem" + aria-selected（selected 时 "true"），稳定语义锚点。
  sessionRow: 'div[role="treeitem"]',
  sessionRowSelected: 'div[role="treeitem"][aria-selected="true"]',
};
