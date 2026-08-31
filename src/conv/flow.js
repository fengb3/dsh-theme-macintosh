// src/conv/flow.js —— 会话流覆写(spec 2026-08-31)
// 协议 { css, mount(ctx) }。选择器一律插值 MC_MAP;无 :hover 无 transition。
// apply 段 overrideTokens 追加 --dsw-specific-bubble(见 client.js apply)
// MC_FLOW_ICONS:form→icon 名纯数据(kit 与 css 图标位共用;client.js McFlow 段同源保留映射)
var MC_FLOW_ICONS = { instructions:'doc', notice:'doc', relay:'doc', catalog:'list',
  snapshot:'copy', recall:'clock', compaction:'copy', 'manual-compaction':'copy' };
if (typeof module !== 'undefined') module.exports = { MC_FLOW_ICONS: MC_FLOW_ICONS };
// 注入条图标位 data-URI。验收二轮①:inject 四型原型(L958/L1245)用 sprite #i-doc(经典 Mac 手绘
// 款 8×10,FIGMA-ASSETS L633)而非 pixelarticons doc——DOC 常量换成 i-doc 双 path 联合剪影;
// catalog=list/snapshot=copy/recall=clock 保持 pixelarticons 24 栅格(原型即如此,L1245 特判 i-doc
// 独用 8×10 栅格)。mask 用,fill 仅占 alpha → 黑;百分号编码同 MC_TBOX 款:< > # 转义、属性单引号、
// d 串逐字保留(i-tri 同款:侧栏 .mc-tri 的 sprite 资产平移,fill 一并 %23000)
const MC_FLOW_ICON_DOC = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 10'%3E%3Cpath fill='%23000' fill-rule='evenodd' clip-rule='evenodd' d='M0 0H6V1H8V10H0V0ZM7 3H5V1H1V9H7V3Z'/%3E%3Cpath fill='%23000' d='M5 1H1V9H7V3H5V1Z'/%3E%3C/svg%3E";
const MC_FLOW_ICON_LIST = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M2 5h20v14H2V5zm2 2v2h16V7H4zm16 4H4v2h16v-2zm0 4H4v2h16v-2z'/%3E%3C/svg%3E";
const MC_FLOW_ICON_COPY = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M4 2h11v2H6v13H4V2zm4 4h12v16H8V6zm2 2v12h8V8h-8z'/%3E%3C/svg%3E";
const MC_FLOW_ICON_CLOCK = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M19 3H5v2H3v14h2v2h14v-2h2V5h-2V3zm0 2v14H5V5h14zm-8 2h2v6h4v2h-6V7z'/%3E%3C/svg%3E";
// 验收四轮:MC_FLOW_ICON_TRI(think 折叠三角 mask)退役——think 卡重写后用 sprite #i-tri 直引
var McFlow = {
  // IIFE 安放 var F:顶层作用域与 tokens/clock/mcfx/sprite 共享,F 不外泄
  css: (function () {
    if (typeof MC_MAP === 'undefined') return ''; // standalone CJS(测试 loadSrc)只消费纯数据;client.js 装配域恒有 MC_MAP
    var F = MC_MAP.kindAssistantStep;
    return [
      // §4-1:.flow 列(gap 16→14 原型 L462;padding 16;子项 flex:none 手册 §6.4)
      MC_MAP.flowColumn + '{gap:14px;padding:16px}',
      MC_MAP.flowItem + '{flex:none;min-width:0}',
      // §5:.md 正文覆写(md 全要素;值照原型 L298-315,前缀 .flow .md → F)
      F + '{font:400 14px/1.8 var(--font-ui);color:var(--mc-fg);word-break:break-word}',
      F + ' h1,' + F + ' h2,' + F + ' h3{font:600 17px/1.4 var(--font-display);letter-spacing:.01em;margin:14px 0 6px}',
      F + ' h2{font-size:15px}',
      F + ' h3{font-size:14px}',
      // h4-h6：原型 §5 未定义，官方样式兜底（spec §2 勘误见 ledger 裁定）
      F + ' p+p{margin-top:8px}',
      F + ' ul,' + F + ' ol{margin:6px 0;padding-left:22px}',
      F + ' li{margin:3px 0}',
      F + ' :not(pre)>code{font:500 12px/1.5 var(--font-code);padding:1px 5px;background:var(--mc-sel-bg);border-radius:var(--mc-r-tag);color:var(--mc-fg)}',
      F + ' pre{margin:8px 0;padding:10px 12px;overflow-x:auto;background:var(--mc-bg-deep);border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card)}',
      F + ' pre code{padding:0;background:none;font:400 12.5px/1.7 var(--font-code)}',
      F + ' table{border-collapse:collapse;margin:8px 0;font:400 12.5px/1.6 var(--font-ui)}',
      F + ' th,' + F + ' td{padding:4px 10px;text-align:left;border:1px solid var(--mc-border-soft)}',
      F + ' th{font:600 12px/1.4 var(--font-display);background:var(--mc-surface-2)}',
      F + ' blockquote{margin:8px 0;padding:2px 12px;color:var(--mc-muted);border-left:2px solid var(--mc-accent-dim)}',
      F + ' a{color:var(--mc-accent)}',
      F + ' input[type="checkbox"]{accent-color:var(--mc-accent)}',
      // 宿主代码块包装(.md-code-block 全局稳定类)。banner 重样式(验收② 2026-08-31 live 探明):
      // 首子 bannerWrap div 内还有一层 _banner 哈希壳(自带 tab 底/9px 粗 padding/12px 顶圆角 =
      // 宿主 tab 感来源)→ display:contents 让位;bannerWrap 直接作 22px 细条:surface-2 底 +
      // 底部 1px border-soft 分隔,infostring 语言名(mono 11 muted)左置,action 复制钮
      // (18×18 方钮+像素 copy 图标,「复制」文字 font-size:0 藏但 AT 可读)margin-left:auto 右置
      F + ' .md-code-block{background:var(--mc-bg-deep);border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card);overflow:hidden}',
      F + ' .md-code-block pre{margin:0;border:none;border-radius:0}',
      F + ' .md-code-block>div:first-child{display:flex;align-items:center;gap:8px;box-sizing:border-box;height:22px;padding:0 10px;background:var(--mc-surface-2);border-bottom:1px solid var(--mc-border-soft);border-radius:0;font:500 11px/1 var(--font-mono);color:var(--mc-muted)}',
      F + ' .md-code-block>div:first-child>div{display:contents}',
      F + ' .md-code-block>div:first-child>div>div:first-child{flex:none;min-width:0;font:500 11px/1 var(--font-mono);color:var(--mc-muted)}',
      F + ' .md-code-block>div:first-child>div>div:last-child{margin-left:auto;flex:none;display:inline-flex}',
      F + ' .md-code-block>div:first-child button{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:18px;height:18px;padding:0;border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);background:var(--mc-surface);color:var(--mc-fg);font-size:0;cursor:pointer}',
      F + ' .md-code-block>div:first-child button::before{content:"";width:11px;height:11px;background-color:currentColor;-webkit-mask:url("data:image/svg+xml,' + MC_FLOW_ICON_COPY + '") center/contain no-repeat;mask:url("data:image/svg+xml,' + MC_FLOW_ICON_COPY + '") center/contain no-repeat}',
      F + ' .md-code-block>div:first-child button:active{background:var(--mc-fg);color:var(--mc-surface);border-color:var(--mc-fg)}',
      F + ' .md-table-wide{overflow-x:auto}',
      // §6:用户气泡(user/steering)+ 变量通道(原型 L483-497;气泡底色走 overrideTokens --dsw-specific-bubble)
      // 验收①:宿主气泡自带 padding(~10px 16px)未覆写 → 补 7px 12px(原型 L485)
      MC_MAP.bubbleUser + '{color:var(--mc-accent-ink);border:1px solid var(--mc-border);border-radius:8px;padding:7px 12px;font:400 14px/1.7 var(--font-ui)}',
      MC_MAP.bubbleUser + ':active{border-color:var(--mc-fg)}',
      MC_MAP.userGallery + '{border:1px solid var(--mc-border);border-radius:var(--mc-r-card)}',
      // 验收六轮:refChip 宿主 chip 覆写随用户行重写退役(McUserNodeView 自有 .mc-user-chip)
      MC_MAP.pendingSteering + '{display:flex;flex-direction:column;align-items:flex-end;outline:1px dashed var(--mc-faint);outline-offset:2px;border-radius:8px}',
      // 六轮:pending steering 与正式气泡同皮(宿主收件箱直渲染,不经 keyed steering 槽——bubbleUser
      // flowItem 域选择器够不着)。行>栈>气泡 三级结构位(DRIFT-RISK:哈希 class 不可用,同 bubbleUser 先例);
      // :not([data-align]) 跳过图集廊;内层 _text_* 自带框距一律剥净(同 .mc-user-bubble>* 双边框修)
      MC_MAP.pendingSteering + '>div{display:flex;flex-direction:column;align-items:flex-end;gap:6px;max-width:100%}',
      MC_MAP.pendingSteering + '>div>div:not([data-align]){max-width:520px;padding:7px 12px;background:var(--mc-accent);color:var(--mc-accent-ink);border:1px solid var(--mc-border);border-radius:8px;font:400 14px/1.7 var(--font-ui);white-space:pre-wrap;word-break:break-word;text-align:left}',
      MC_MAP.pendingSteering + '>div>div:not([data-align])>*{border:none!important;padding:0!important;margin:0!important;background:none!important}',
      // §7:注入条(context + 双 compaction 同款;kind 行即条壳)
      // 验收③:行改 align-items:center、图标位去 margin-top(宿主行高下 flex-start+1px 不居中);
      // ctxBody 展开体在行外,不受影响
      ':is(' + MC_MAP.kindContext + ',' + MC_MAP.kindCompaction + ',' + MC_MAP.kindManualCompaction + '){display:flex;align-items:center;gap:7px;padding:7px 9px;background:var(--mc-surface-2);border:1px dashed var(--mc-border-soft);border-radius:var(--mc-r-card);font:400 12px/1.7 var(--font-ui);color:var(--mc-muted)}',
      MC_MAP.ctxBody + '{font:400 12px/1.7 var(--font-ui);color:var(--mc-muted);padding-left:22px}',
      // 图标:mask + data-URI;:has() 细分 form(Chromium 105+;form 锚在展开体 data-context-form 上,
      // 折叠态回落 DOC 基础位——宿主 children 仅展开渲染,裁定内既有行为)
      // 验收二轮⑤(live 探明):宿主 DisclosureRow 的 leading 槽(16px 定宽 + margin 6px,内藏
      // hover 才显的 chevronHover 绝对定位 svg)整槽占位 → 图标与文本间距虚大;原型注入条(L332-337)
      // 无 disclosure 箭头语汇 → 整槽 display:none(行点击开合保留,role=button 在行上)
      MC_MAP.kindContext + ' ' + MC_MAP.disclosureRow + '>span:first-of-type{display:none}',
      MC_MAP.kindContext + '::before{content:"";flex:none;width:15px;height:15px;background-color:var(--mc-faint);-webkit-mask:url("data:image/svg+xml,' + MC_FLOW_ICON_DOC + '") center/contain no-repeat;mask:url("data:image/svg+xml,' + MC_FLOW_ICON_DOC + '") center/contain no-repeat}',
      MC_MAP.kindContext + ':has(' + MC_MAP.contextForm + '"catalog"])::before{-webkit-mask-image:url("data:image/svg+xml,' + MC_FLOW_ICON_LIST + '");mask-image:url("data:image/svg+xml,' + MC_FLOW_ICON_LIST + '")}',
      MC_MAP.kindContext + ':has(' + MC_MAP.contextForm + '"snapshot"])::before{-webkit-mask-image:url("data:image/svg+xml,' + MC_FLOW_ICON_COPY + '");mask-image:url("data:image/svg+xml,' + MC_FLOW_ICON_COPY + '")}',
      MC_MAP.kindContext + ':has(' + MC_MAP.contextForm + '"recall"])::before{-webkit-mask-image:url("data:image/svg+xml,' + MC_FLOW_ICON_CLOCK + '");mask-image:url("data:image/svg+xml,' + MC_FLOW_ICON_CLOCK + '")}',
      // §8:细长条组(实线 soft 边,非虚线——inject 专属语汇)
      ':is(' + MC_MAP.kindModelRetry + ',' + MC_MAP.kindTurnMaxTokens + ',' + MC_MAP.kindUnknown + '){display:flex;align-items:center;gap:8px;padding:6px 9px;background:var(--mc-surface-2);border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card);font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}',
      // 验收二轮⑧+⑨:八角点静态常驻、pulse 仅限 active 态(宿主 <details data-active>——scheduled
      // 时才有,RetryNodeView active=data.current.retryState==="scheduled";live 探明 finished 行
      // 无此属性)→ 重试结束即停闪;宿主 summary::after chevron(6×6 旋转方块,行内唯一宿主图形
      // ——用户所见「时钟图标」即它)content:none 去重,只留我方八角点
      MC_MAP.kindModelRetry + '::before{content:"";flex:none;width:6px;height:6px;background:var(--mc-spark);clip-path:polygon(33% 0,67% 0,100% 33%,100% 67%,67% 100%,33% 100%,0 67%,0 33%)}',
      MC_MAP.kindModelRetry + ':has(' + MC_MAP.retryActive + ')::before{animation:mc-pulse 2600ms steps(1,end) infinite;animation-delay:var(--pulse-delay,0ms)}',
      MC_MAP.kindModelRetry + ' summary::after{content:none}',
      MC_MAP.kindTurnError + '{display:flex;align-items:center;gap:8px;padding:6px 9px;background:var(--mc-surface-2);border-left:2px solid var(--mc-danger);border-radius:var(--mc-r-card);font:400 12px/1.6 var(--font-ui);color:var(--mc-danger)}',
      MC_MAP.kindTurnMaxTokens + '::before{content:"";flex:none;border-left:5px solid var(--mc-faint);border-top:4px solid transparent;border-bottom:4px solid transparent}',
      // §9:TurnStatus(宿主运行中状态行)
      MC_MAP.flowColumn + ' ' + MC_MAP.statusRow + '{display:flex;align-items:center;gap:8px;font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}',
      MC_MAP.flowColumn + ' ' + MC_MAP.statusRow + '::before{content:"";flex:none;width:6px;height:6px;background:var(--mc-spark);clip-path:polygon(33% 0,67% 0,100% 33%,100% 67%,67% 100%,33% 100%,0 67%,0 33%);animation:mc-pulse 2600ms steps(1,end) infinite;animation-delay:var(--pulse-delay,0ms)}',
      // 验收四轮:think 卡整体重写(McThink 遮蔽 assistant-step 槽,自有 .mc-think 类)——
      // 此前对宿主 ReasoningRow 的全部覆写(shimmer/sweep 压制、像素三角替换、摘要行
      // .mc-line-flash 观察器)一并退役;.mc-app-cover 保留供 McThinkCard 正文追加段复用
      '.mc-app-cover{color:transparent;background:#fff;background-image:repeating-linear-gradient(0deg,transparent 0 2px,rgba(0,0,0,.06) 2px 3px);border-radius:1px}',
      'html[data-theme="light"] .mc-app-cover{background:#000;background-image:repeating-linear-gradient(0deg,transparent 0 2px,rgba(255,255,255,.07) 2px 3px)}',
      // T4 补遗(spec §2 行「compaction/manual-compaction → i-px-copy」;T4 裁定并入本 commit):
      // 压缩条 ::before 图标位,复用 T4 已内联的 copy data-URI 常量插值(context snapshot 同款)。
      // 验收二轮⑤ 同款占位清理(原型注入条语汇,无 disclosure 箭头):宿主 compactionButton 的
      // leading 槽(16px 定宽 + margin 6px,内藏 API 图标/hover chevron 双叠 span)整槽 display:none
      ':is(' + MC_MAP.kindCompaction + ',' + MC_MAP.kindManualCompaction + ')::before{content:"";flex:none;width:15px;height:15px;background-color:var(--mc-faint);-webkit-mask:url("data:image/svg+xml,' + MC_FLOW_ICON_COPY + '") center/contain no-repeat;mask:url("data:image/svg+xml,' + MC_FLOW_ICON_COPY + '") center/contain no-repeat}',
      ':is(' + MC_MAP.kindCompaction + ',' + MC_MAP.kindManualCompaction + ') button>span:first-of-type{display:none}',
      // §10:turn-tail 操作条(spec §4 行6;原型 L533-536)+ 钳形钮壳(只造壳不换宿主图标;
      // 后代选择器命中 .actions 容器内钮,data-slot 包装层不减后代深度)
      // 验收二轮④(live 探明):root 宿主为 column flex,原 align-items:center 会把 deliverables
      // 产物行(chain 槽注入的 .P4kPIW grid 行)水平居中 → 改 flex-start 靠左;actions 行自带
      // align-self:stretch(下条)不受影响
      MC_MAP.turnTailBar + '{display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap;padding-top:2px;font:500 11px/1.6 var(--font-mono);color:var(--mc-faint)}',
      // 验收三轮④:钮壳收窄到 actions 行(>div:last-child)——原后代 ' button' 误伤 chain 槽
      // 注入的产物文件钮(P4kPIW_file,宿主按文件名测宽),把长方形 chip 锁成 20×20 方块
      MC_MAP.turnTailBar + '>div:last-child button{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);background:var(--mc-surface);color:var(--mc-fg)}',
      MC_MAP.turnTailBar + '>div:last-child button:active{background:var(--mc-fg);color:var(--mc-surface);border-color:var(--mc-fg)}',
      // 验收三轮④:产物文件 chip——自然宽度按文件名长度(宿主 measure 探针同类复用本皮肤,
      // 测宽即所见),20px 高小长方块;超长名 220px 封顶截断;溢出标签 "+N 个文件" 同语汇
      MC_MAP.deliverRoot + ' ' + MC_MAP.deliverFile + '{display:inline-flex;align-items:center;height:20px;padding:0 7px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);background:var(--mc-surface);color:var(--mc-fg);font:500 11px/1.6 var(--font-mono)}',
      MC_MAP.deliverRoot + ' ' + MC_MAP.deliverFile + ':active{background:var(--mc-fg);color:var(--mc-surface);border-color:var(--mc-fg)}',
      MC_MAP.deliverRoot + ' ' + MC_MAP.deliverMore + '{display:inline-flex;align-items:center;height:20px;padding:0 7px;white-space:nowrap;border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-btn);background:var(--mc-surface-2);color:var(--mc-faint);font:500 11px/1.6 var(--font-mono)}',
      // 验收⑤(2026-08-31 live 探明):钮组靠左、统计常驻靠右——root[data-time-hover-root] 下
      // 统计 span(.actions 末子 timeEnd)宿主 opacity:0 hover 显隐 → opacity/visibility 反制
      // (裁定:此两属性允许作为对宿主动效反制)+transition:none 压平;DOM 序本就 [copy,extra
      // (contents),branch,time] time 末位。宿主 root 为 flex-direction:column(实测)→ actions
      // align-self:stretch 横向撑满(行向由 flex:1 兜底,方向无关),margin-left:auto 推右
      MC_MAP.turnTailBar + '>div:last-child{display:flex;align-items:center;gap:8px;flex:1;min-width:0;align-self:stretch}',
      MC_MAP.turnTailBar + '>div:last-child>span:last-child{margin-left:auto;flex:none;white-space:nowrap;opacity:1!important;visibility:visible!important;transition:none;font:500 11px/1.6 var(--font-mono);color:var(--mc-faint)}',
      // §11:command 三态卡壳(spec §4 行9;默认 border / running spark / error danger;
      // [data-variant="others"] 在 kindCommand 行内任意深度;细节留 toolcard 周期)
      MC_MAP.kindCommand + ' ' + MC_MAP.commandCard + '{background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:var(--mc-r-card);overflow:hidden}',
      MC_MAP.kindCommand + ' ' + MC_MAP.commandCard + MC_MAP.dataState + '"running"]{border-color:var(--mc-spark)}',
      MC_MAP.kindCommand + ' ' + MC_MAP.commandCard + MC_MAP.dataState + '"error"]{border-color:var(--mc-danger)}',
    ].join('\n');
  })(),
  mount: function (ctx) {
    // Task 7：MutationObserver 出场三拍 + syncAnim 相位同步管道（spec 2026-08-31）。
    // 一切延时走 CLOCK.next（audit：禁裸定时器直调）；REDUCED 用户零闪烁（类不加，内容照常）。
    if (typeof MutationObserver === 'undefined' || typeof CLOCK === 'undefined' || !CLOCK) return null;
    var REDUCED = false;
    try { REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var SYNC = [
      [MC_MAP.kindModelRetry, '--pulse-delay', CLOCK.PULSE],
      [MC_MAP.flowColumn + ' ' + MC_MAP.statusRow, '--pulse-delay', CLOCK.PULSE],
    ];
    // 验收二轮⑥→三轮⑥(通用五拍):折叠卡开合。flowColumn 捕获阶段 click 委托,命中三卡头
    // (context 的 DisclosureRow、model-retry 的 summary、双 compaction 的头部钮——
    // live 实测 click target=button 本体,[data-compaction-disclosure] span 是其子节点、closest
    // 只上溯不下降,故头锚取 kind 行内 button 元素;锚点语义见 MC_MAP.compactionDisclosure 注。
    // 验收四轮:think 卡头移出表——McThinkCard 自有 DOM,开合走 lib accToggle 真延迟 flip)
    // → 对卡容器(=各 kind 行)走 cardToggle 五拍(捕获拍先于宿主 React onClick,
    // ghost 在宿主瞬切前已把内容隐去;几何变化发生在白块遮盖下;t300 揭开 t400 内容显回)。
    // dataset.busy 防重入(断连/异常路径也清);REDUCED 跳过(开合功能不受影响,纯装饰拍);
    // teardown 一并注销
    var TOGGLE = [
      [MC_MAP.kindContext + ' ' + MC_MAP.disclosureRow, MC_MAP.kindContext],
      [MC_MAP.kindModelRetry + ' summary', MC_MAP.kindModelRetry],
      [':is(' + MC_MAP.kindCompaction + ',' + MC_MAP.kindManualCompaction + ') button', ':is(' + MC_MAP.kindCompaction + ',' + MC_MAP.kindManualCompaction + ')'],
    ];
    // 验收六轮改版:手抄变体全部收编回库——开合走 lib accToggle、新行入场走 lib flashIn,
    // 协议唯一定义在 src/core/mcfx.js(t0 ghost→t100 flash→t200 fn→t300 同撤 flash+ghost→t400 滞空)。
    // 宿主卡 fn=空转+清残高——宿主 React 在捕获拍后自行瞬切,几何变化发生在白块遮盖下
    var mo = null, tries = 0, timer = null, offClick = null;
    var seen = new WeakSet();
    function syncEl(el) {
      for (var i = 0; i < SYNC.length; i++) { try {
        if (el.matches(SYNC[i][0])) CLOCK.syncAnim(el, SYNC[i][2], SYNC[i][1]);
        var qs = el.querySelectorAll(SYNC[i][0]);
        for (var j = 0; j < qs.length; j++) CLOCK.syncAnim(qs[j], SYNC[i][2], SYNC[i][1]);
      } catch (e) {} }
    }
    // 验收六轮:enterFlash 收编为 lib flashIn 空回调(show 在 ghost 遮罩下空转,拍3 撤净含 mcfx)
    function enterFlash(el) { flashIn(el, function () {}); }
    // 验收四轮:think 摘要/正文观察器(thinkStream/thinkBodyStream)随宿主 ReasoningRow 覆写
    // 一并退役——think 卡由 McThink 组件整体重写(缓冲积攒+周期吐出),不再需要 DOM 干预
    function enter(node) {
      if (!(node instanceof Element)) return;
      syncEl(node); // 相位同步不限 flowItem 本行：[role=status] 常为 flowColumn 直接子节点，
      // 新入节点全量试 SYNC 两选择器（syncAnim 幂等，重复触发只是相位刷新）
      var items = node.matches(MC_MAP.flowItem) ? [node] : [];
      try { var q = node.querySelectorAll(MC_MAP.flowItem); for (var i = 0; i < q.length; i++) items.push(q[i]); } catch (e) {}
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (seen.has(it)) continue; seen.add(it);
        syncEl(it);
        // 验收六轮:user/steering 行由 McUserNodeView 气泡自带 flashIn 出场——
        // flowItem 级整行白块(铺满左右)不再适用,跳过
        var mk = null; try { mk = it.getAttribute('data-chat-flow-kind'); } catch (e) {}
        if (!REDUCED && mk !== 'user' && mk !== 'steering') enterFlash(it);
      }
    }
    function onHeadClick(ev) { // 验收二轮⑥:卡头捕获委托(见 TOGGLE 表注释;think 卡已由
      // McThinkCard 自管开合,不在表内)
      if (REDUCED) return;
      try {
        var t = ev.target;
        if (!(t instanceof Element)) return;
        for (var i = 0; i < TOGGLE.length; i++) {
          var head = null;
          try { head = t.closest(TOGGLE[i][0]); } catch (e) { head = null; }
          if (!head) continue;
          var card = null;
          try { card = head.closest(TOGGLE[i][1]); } catch (e) { card = null; }
          if (card) accToggle(card, function () {});
          break; // 卡头互不嵌套,单命中即止
        }
      } catch (e) { /* 委托失败不影响宿主自身开合 */ }
    }
    function attach() { // 验收三轮⑥ live 探明:切会话时宿主会整体替换 [data-chat-flow] 节点,
      // observer/click 绑列节点随会话切换失效——一律绑 document.body(稳定根;委托/域限定
      // 由 MC_MAP 选择器在 closest/matches 内完成,body 级观察回调轻量早退)
      var root = document.body;
      try { // 存量行标记不闪（历史加载）
        var q = root.querySelectorAll(MC_MAP.flowItem); for (var i = 0; i < q.length; i++) seen.add(q[i]);
      } catch (e) {}
      mo = new MutationObserver(function (muts) {
        try {
          for (var i = 0; i < muts.length; i++) {
            var m = muts[i];
            if (m.type === 'characterData') continue; // 文本变化观察已随 think 重写退役
            for (var j = 0; j < m.addedNodes.length; j++) {
              var n = m.addedNodes[j];
              if (n instanceof Element) enter(n);
            }
          }
        } catch (e) {}
      });
      mo.observe(root, { childList: true, subtree: true });
      try { root.addEventListener('click', onHeadClick, true); offClick = function () { try { root.removeEventListener('click', onHeadClick, true); } catch (e) {} }; } catch (e) {}
    }
    timer = CLOCK.next(function poll() { // flowColumn 晚挂载轮询（不再限次——boot 停在空会话
      // (hero 态无列)时 8s 上限会耗尽,之后切会话 observer 永不挂载;验收三轮⑥ live 复现。
      // 列出现即 attach(绑 body,不再依赖列节点存续);每拍一次 querySelector 开销可忽略)
      tries++;
      var root = null; try { root = document.querySelector(MC_MAP.flowColumn); } catch (e) {}
      if (root) { attach(); return; }
      timer = CLOCK.next(poll, 400);
    }, 400);
    return function teardown() {
      try { if (mo) mo.disconnect(); } catch (e) {}
      try { if (offClick) offClick(); } catch (e) {}
      try { if (timer) CLOCK.clear(timer); } catch (e) {}
    };
  },
};
