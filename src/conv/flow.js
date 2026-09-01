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
      // 六轮续:pending steering 重绘改观察器嫁接(见 skinPending)——结构位皮肤规则退役,
      // 只留 .mc-pending 虚线待定廓(嫁接标记)
      '.mc-pending{outline:1px dashed var(--mc-faint);outline-offset:2px;border-radius:8px}',
      // 验收七轮:注入条/压缩条/重试条 CSS 皮肤随 syscard 重绘退役(McSysCard 遮蔽 context/
      // compaction/manual-compaction/model-retry 四槽,自有 .mc-inject/.mc-comp/.mc-retry 类)——
      // 原 §7 虚线条 + 表单图标 + leading 槽清理 + §8 重试八角点/chevron 规则与 T4 压缩图标位一并下岗;
      // 行级出场 flashIn(观察器)对四 kind 照常供给
      // §8:细长条组(实线 soft 边;retry 已重绘移出,余 unknown 同款壳)
      ':is(' + MC_MAP.kindTurnMaxTokens + ',' + MC_MAP.kindUnknown + '){display:flex;align-items:center;gap:8px;padding:6px 9px;background:var(--mc-surface-2);border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card);font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}',
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
      // 验收七轮:压缩条图标位/leading 槽清理随 syscard 重绘退役(.mc-comp 自有图标)
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
      MC_MAP.deliverRoot + ' ' + MC_MAP.deliverFile + '{display:inline-flex;align-items:center;height:24px;padding:0 8px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);background:var(--mc-surface);color:var(--mc-fg);font:500 13px/1.6 var(--font-mono)}',
      MC_MAP.deliverRoot + ' ' + MC_MAP.deliverFile + ':active{background:var(--mc-fg);color:var(--mc-surface);border-color:var(--mc-fg)}',
      MC_MAP.deliverRoot + ' ' + MC_MAP.deliverMore + '{display:inline-flex;align-items:center;height:20px;padding:0 7px;white-space:nowrap;border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-btn);background:var(--mc-surface-2);color:var(--mc-faint);font:500 11px/1.6 var(--font-mono)}',
      // 验收轮5:产物行抽搐根治——宿主行撤下重绘(McFlow 观察器嫁接,见 mount skinDeliver)。
      // 根因:宿主测宽-折叠判定反馈环(文件钮↔"+N 个文件"+showFolder 两态 33ms 互切,vanilla 差分
      // 零事件定责主题)。宿主行保测量摘视觉(absolute+visibility,几何不变测量照常),自绘
      // .mc-deliver 全量 chip 平铺(flex-wrap,无折叠判定=无环);点击镜像回官方文件钮
      '.mc-deliver{display:flex;align-items:center;flex-wrap:wrap;gap:6px;max-width:100%}',
      '.mc-deliver .mc-dl-file{display:inline-flex;align-items:center;height:24px;padding:0 8px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);background:var(--mc-surface);color:var(--mc-fg);font:500 13px/1.6 var(--font-mono);cursor:pointer}',
      '.mc-deliver .mc-dl-file:active{background:var(--mc-fg);color:var(--mc-surface);border-color:var(--mc-fg)}',
      MC_MAP.deliverRoot + '{position:absolute;visibility:hidden;pointer-events:none}', // 轮5补2:无条件藏匿——振荡中宿主整建重挂 root(新元素无属性,观察器补挂有空窗=闪;且分消息位好坏系重挂与否之别)。藏匿与 JS 解耦,root 一入 DOM 即隐;visibility 保测量几何
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
      [MC_MAP.flowColumn + ' ' + MC_MAP.statusRow, '--pulse-delay', CLOCK.PULSE],
    ];
    // 验收七轮:折叠卡开合点击委托表整体退役——context/model-retry/双 compaction 四卡已由
    // McSysCard 重绘(自有 DOM,开合/状态切换在组件内走 lib accToggle);think 卡四轮起已自管。
    // click 委托/onHeadClick/offClick 一并下岗,观察器只剩出场 flashIn/相位同步/pending 嫁接
    // 验收六轮改版:手抄变体全部收编回库——开合走 lib accToggle、新行入场走 lib flashIn,
    // 协议唯一定义在 src/core/mcfx.js(t0 ghost→t100 flash→t200 fn→t300 同撤 flash+ghost→t400 滞空)。
    // 宿主卡 fn=空转+清残高——宿主 React 在捕获拍后自行瞬切,几何变化发生在白块遮盖下
    var mo = null, tries = 0, timer = null;
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
    // 六轮续:pending steering 重绘(嫁接)——宿主收件箱直渲染 PendingSteeringBubble(L5877),
    // 无 keyed 槽可遮蔽 → 观察器把自有类直接嫁到宿主结构上,吃到与 McUserNodeView 同一套 CSS:
    // 行→.mc-user-row 栈→flex 右对齐 气泡→.mc-user-bubble 图集→.mc-user-attach 引用→.mc-user-ref,
    // 标记 .mc-pending(虚线待定廓,host data-pending-steering 保留作锚)。幂等:已嫁接即跳过
    // 验收轮5:产物行重绘(抽搐根治)——宿主 .P4kPIW_root 保测量摘视觉(.mc-dl-host),
    // 同 parent 前插自绘 .mc-deliver 行;数据面=官方文件钮 ∪ 测宽探针(P4kPIW_probe 文本,
    // 滤 "+N" 溢出项)的并集,单调累积;chip 点击镜像回官方同名文件钮(勘不到即静默)。
    // 幂等:宿主行标记 data-mc-dl 即跳过;名集未变不重绘(振荡源读值在变,但并集单调→稳态零重绘)
    var DL_DRAWN = [];
    function skinDeliver(scope) {
      try {
        var list = [];
        try { if (scope && scope.matches && scope.matches(MC_MAP.deliverRoot)) list.push(scope); } catch (e) {}
        var roots = (scope && scope.querySelectorAll) ? scope.querySelectorAll(MC_MAP.deliverRoot) : [];
        for (var qi = 0; qi < roots.length; qi++) list.push(roots[qi]);
        if (!list.length) return;
        for (var ri = 0; ri < list.length; ri++) (function (host) {
          if (host.hasAttribute('data-mc-dl')) { dlPaint(host); return; }
          host.setAttribute('data-mc-dl', ''); // 嫁接标记(藏匿已改无条件 CSS,与 JS 解耦)
          // 轮5补3:流式期宿主把整个产物块(含 root 的无类包装 DIV)整体挂/卸循环——自绘行若插在
          // 包装内会随之消失复现("有、没有")。上提一层:插到包装 DIV 之前的兄弟位,挂卸带不走;
          // 复用检测同位(包装前的既有行)
          var box = host.parentNode; // 无类包装 DIV(osXY9a_root 直下;可能整体被挂卸)
          var anchor = box && box.parentNode ? box : host;
          var prev = anchor.previousElementSibling;
          if (!(prev && prev.classList && prev.classList.contains('mc-deliver'))) {
            // 深层重挂(包装层也换新):全局回收失联行(宿主已断链)搬到锚前复用,防重复行
            try {
              var orphans = document.querySelectorAll('.mc-deliver');
              for (var oi = 0; oi < orphans.length; oi++) {
                if (orphans[oi].__mcHost && !orphans[oi].__mcHost.isConnected) {
                  prev = orphans[oi];
                  anchor.parentNode.insertBefore(prev, anchor);
                  break;
                }
              }
            } catch (e) {}
          }
          if (prev && prev.classList && prev.classList.contains('mc-deliver')) {
            host.__mcRow = prev;
            prev.__mcHost = host;
            host.__mcNames = [];
            DL_DRAWN.push(host);
            dlPaint(host);
            return;
          }
          host.__mcNames = [];
          var row = document.createElement('div');
          row.className = 'mc-deliver';
          row.setAttribute('data-mc-deliver', '');
          anchor.parentNode.insertBefore(row, anchor);
          row.__mcHost = host;
          host.__mcRow = row;
          DL_DRAWN.push(host);
          if (!REDUCED) flashIn(row, function () {});
          dlPaint(host);
        })(list[ri]);
      } catch (e) { /* 宿主结构漂移即回退官方行,不破版 */ }
    }
    function dlNames(host) { // 数据面:官方钮 title/text ∪ 探针 text(滤 "+N" 溢出标签),保序去重
      var names = [];
      var put = function (s) { s = String(s || '').trim(); if (s && s.charAt(0) !== '+' && names.indexOf(s) < 0) names.push(s); };
      try {
        var btns = host.querySelectorAll(MC_MAP.deliverFile);
        for (var i = 0; i < btns.length; i++) put(btns[i].getAttribute('title') || btns[i].textContent);
      } catch (e) {}
      try {
        var pr = host.querySelectorAll(MC_MAP.deliverProbe);
        for (var j = 0; j < pr.length; j++) put(pr[j].textContent);
      } catch (e) {}
      return names;
    }
    function dlPaint(host) {
      var row = host.__mcRow; if (!row) return;
      var names = dlNames(host), old = host.__mcNames;
      if (names.length === old.length) return; // 并集单调:长度不变=名集不变
      host.__mcNames = names;
      while (row.firstChild) row.removeChild(row.firstChild);
      for (var i = 0; i < names.length; i++) (function (nm) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'mc-dl-file'; b.textContent = nm;
        b.addEventListener('click', function () {
          try {
            var t = null, qs = document.querySelectorAll(MC_MAP.deliverRoot + ' ' + MC_MAP.deliverFile);
            for (var k = 0; k < qs.length; k++) if ((qs[k].getAttribute('title') || qs[k].textContent).trim() === nm) { t = qs[k]; break; }
            if (t) t.click();
          } catch (e) {}
        });
        row.appendChild(b);
      })(names[i]);
    }
    function skinPending(el) {
      try {
        if (el.classList.contains('mc-user-row')) return;
        el.classList.add('mc-user-row', 'mc-pending');
        var stack = el.firstElementChild; // 宿主 userStack
        if (!stack) return;
        stack.style.display = 'flex';
        stack.style.flexDirection = 'column';
        stack.style.alignItems = 'flex-end';
        stack.style.gap = '6px';
        var bub = null;
        for (var c = stack.firstElementChild; c; c = c.nextElementSibling) {
          if (c.hasAttribute('data-align')) { c.classList.add('mc-user-attach'); continue; }
          if (!bub) { bub = c; c.classList.add('mc-user-bubble'); }
          else c.classList.add('mc-user-ref');
        }
        if (bub && !REDUCED) flashIn(bub, function () {});
      } catch (e) { /* 宿主结构漂移即回退官方样式,不破版 */ }
    }
    // 验收四轮:think 摘要/正文观察器(thinkStream/thinkBodyStream)随宿主 ReasoningRow 覆写
    // 一并退役——think 卡由 McThink 组件整体重写(缓冲积攒+周期吐出),不再需要 DOM 干预
    function enter(node) {
      if (!(node instanceof Element)) return;
      syncEl(node); // 相位同步不限 flowItem 本行：[role=status] 常为 flowColumn 直接子节点，
      // 新入节点全量试 SYNC 两选择器（syncAnim 幂等，重复触发只是相位刷新）
      // pending steering:直渲染节点(flowColumn 直接子节点,非 flowItem),命中即嫁接重绘
      try {
        if (node.matches(MC_MAP.pendingSteering)) skinPending(node);
        var pq = node.querySelectorAll(MC_MAP.pendingSteering);
        for (var pi = 0; pi < pq.length; pi++) skinPending(pq[pi]);
      } catch (e) {}
      try { skinDeliver(node); } catch (e) {} // 产物行重绘(轮5):新入子树含 .P4kPIW_root 即嫁接
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
    function attach() { // 验收三轮⑥ live 探明:切会话时宿主会整体替换 [data-chat-flow] 节点,
      // observer/click 绑列节点随会话切换失效——一律绑 document.body(稳定根;域限定
      // 由 MC_MAP 选择器在 matches 内完成,body 级观察回调轻量早退)
      var root = document.body;
      try { // 存量行标记不闪（历史加载）
        var q = root.querySelectorAll(MC_MAP.flowItem); for (var i = 0; i < q.length; i++) seen.add(q[i]);
      } catch (e) {}
      try { skinDeliver(root); } catch (e) {} // 存量产物行(历史加载)即轮重绘
      mo = new MutationObserver(function (muts) {
        try {
          for (var i = 0; i < muts.length; i++) {
            var m = muts[i];
            if (m.type === 'characterData') continue; // 文本变化观察已随 think 重写退役
            // 产物行重绘(轮5):已嫁接宿主行内部振荡性增删(钮↔标签互切)→ 名集并集复算(稳态零重绘)
            try {
              if (m.type === 'childList' && m.target instanceof Element) {
                var dh = m.target.closest ? m.target.closest(MC_MAP.deliverRoot) : null;
                if (dh && dh.hasAttribute('data-mc-dl')) dlPaint(dh);
              }
            } catch (e) {}
            for (var j = 0; j < m.addedNodes.length; j++) {
              var n = m.addedNodes[j];
              if (n instanceof Element) enter(n);
            }
          }
        } catch (e) {}
      });
      mo.observe(root, { childList: true, subtree: true });
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
      try { if (timer) CLOCK.clear(timer); } catch (e) {}
      // 产物行重绘回收(轮5):自绘行拆除,宿主行摘标记复明(卸载即恢复官方行)
      for (var i = 0; i < DL_DRAWN.length; i++) try {
        var h = DL_DRAWN[i];
        if (h.__mcRow && h.__mcRow.parentNode) h.__mcRow.parentNode.removeChild(h.__mcRow);
        h.removeAttribute('data-mc-dl');
      } catch (e) {}
      DL_DRAWN.length = 0;
    };
  },
};
