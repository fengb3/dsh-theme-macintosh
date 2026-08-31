// src/conv/flow.js —— 会话流覆写(spec 2026-08-31)
// 协议 { css, mount(ctx) }。选择器一律插值 MC_MAP;无 :hover 无 transition。
// apply 段 overrideTokens 追加 --dsw-specific-bubble(见 client.js apply)
// MC_FLOW_ICONS:form→icon 名纯数据(kit 与 css 图标位共用;client.js McFlow 段同源保留映射)
var MC_FLOW_ICONS = { instructions:'doc', notice:'doc', relay:'doc', catalog:'list',
  snapshot:'copy', recall:'clock', compaction:'copy', 'manual-compaction':'copy' };
if (typeof module !== 'undefined') module.exports = { MC_FLOW_ICONS: MC_FLOW_ICONS };
// 注入条图标位 data-URI(pixelarticons doc/list/copy/clock,24 栅格;mask 用,fill 仅占 alpha → 黑;
// 百分号编码同 MC_TBOX 款:< > # 转义、属性单引号、d 串逐字保留)
const MC_FLOW_ICON_DOC = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M3 22h18V8h-2V6h-2v2h-2V6h2V4h-2V2H3v20zm2-2V4h8v6h6v10H5z'/%3E%3C/svg%3E";
const MC_FLOW_ICON_LIST = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M2 5h20v14H2V5zm2 2v2h16V7H4zm16 4H4v2h16v-2zm0 4H4v2h16v-2z'/%3E%3C/svg%3E";
const MC_FLOW_ICON_COPY = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M4 2h11v2H6v13H4V2zm4 4h12v16H8V6zm2 2v12h8V8h-8z'/%3E%3C/svg%3E";
const MC_FLOW_ICON_CLOCK = "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M19 3H5v2H3v14h2v2h14v-2h2V5h-2V3zm0 2v14H5V5h14zm-8 2h2v6h4v2h-6V7z'/%3E%3C/svg%3E";
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
      // 宿主代码块包装(.md-code-block 全局稳定类;banner=首子 div:语言条+复制钮)
      F + ' .md-code-block{background:var(--mc-bg-deep);border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card);overflow:hidden}',
      F + ' .md-code-block pre{margin:0;border:none;border-radius:0}',
      F + ' .md-code-block>div:first-child{display:flex;align-items:center;gap:8px;padding:4px 10px;background:var(--mc-surface-2);border-bottom:1px solid var(--mc-border-soft);font:500 11px/1.4 var(--font-mono);color:var(--mc-muted)}',
      F + ' .md-code-block>div:first-child button{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);background:var(--mc-surface);color:var(--mc-fg)}',
      F + ' .md-code-block>div:first-child button:active{background:var(--mc-fg);color:var(--mc-surface);border-color:var(--mc-fg)}',
      F + ' .md-table-wide{overflow-x:auto}',
      // §6:用户气泡(user/steering)+ 变量通道(原型 L483-497;气泡底色走 overrideTokens --dsw-specific-bubble)
      MC_MAP.bubbleUser + '{color:var(--mc-accent-ink);border:1px solid var(--mc-border);border-radius:8px;font:400 14px/1.7 var(--font-ui)}',
      MC_MAP.bubbleUser + ':active{border-color:var(--mc-fg)}',
      MC_MAP.userGallery + '{border:1px solid var(--mc-border);border-radius:var(--mc-r-card)}',
      MC_MAP.refChip + '{background:var(--mc-sel-bg);border-radius:var(--mc-r-tag);padding:0 4px;font:500 12px var(--font-mono)}',
      '[data-pending-steering]{outline:1px dashed var(--mc-faint);outline-offset:2px;border-radius:8px}',
      // §7:注入条(context + 双 compaction 同款;kind 行即条壳)
      ':is(' + MC_MAP.kindContext + ',' + MC_MAP.kindCompaction + ',' + MC_MAP.kindManualCompaction + '){display:flex;align-items:flex-start;gap:7px;padding:7px 9px;background:var(--mc-surface-2);border:1px dashed var(--mc-border-soft);border-radius:var(--mc-r-card);font:400 12px/1.7 var(--font-ui);color:var(--mc-muted)}',
      MC_MAP.ctxBody + '{font:400 12px/1.7 var(--font-ui);color:var(--mc-muted);padding-left:22px}',
      // 图标:mask + data-URI;:has() 细分 form(Chromium 105+)。宿主原图标隐藏——live 实测
      // 2026-08-31(裁定10:data-slot 包装层计入):折叠态 idle 图标链 = kind 行>data-slot 包装>
      // root>disclosure row>leading span>iconIdle span>svg,brief 原 '>:first-child>svg' 两条
      // 均够不着,按实况改写;展开态 iconIdle 不渲染、chevron 为 leading 直接子 svg,均不受本条影响
      MC_MAP.kindContext + ' [data-disclosure-row]>span:first-of-type>span:first-child>svg:first-of-type{display:none}',
      MC_MAP.kindContext + '::before{content:"";flex:none;width:15px;height:15px;margin-top:1px;background-color:var(--mc-faint);-webkit-mask:url("data:image/svg+xml,' + MC_FLOW_ICON_DOC + '") center/contain no-repeat;mask:url("data:image/svg+xml,' + MC_FLOW_ICON_DOC + '") center/contain no-repeat}',
      MC_MAP.kindContext + ':has([data-context-form="catalog"])::before{-webkit-mask-image:url("data:image/svg+xml,' + MC_FLOW_ICON_LIST + '");mask-image:url("data:image/svg+xml,' + MC_FLOW_ICON_LIST + '")}',
      MC_MAP.kindContext + ':has([data-context-form="snapshot"])::before{-webkit-mask-image:url("data:image/svg+xml,' + MC_FLOW_ICON_COPY + '");mask-image:url("data:image/svg+xml,' + MC_FLOW_ICON_COPY + '")}',
      MC_MAP.kindContext + ':has([data-context-form="recall"])::before{-webkit-mask-image:url("data:image/svg+xml,' + MC_FLOW_ICON_CLOCK + '");mask-image:url("data:image/svg+xml,' + MC_FLOW_ICON_CLOCK + '")}',
      // §8:细长条组(实线 soft 边,非虚线——inject 专属语汇)
      ':is(' + MC_MAP.kindModelRetry + ',' + MC_MAP.kindTurnMaxTokens + ',' + MC_MAP.kindUnknown + '){display:flex;align-items:center;gap:8px;padding:6px 9px;background:var(--mc-surface-2);border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card);font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}',
      MC_MAP.kindModelRetry + '::before{content:"";flex:none;width:6px;height:6px;background:var(--mc-spark);clip-path:polygon(33% 0,67% 0,100% 33%,100% 67%,67% 100%,33% 100%,0 67%,0 33%);animation:mc-pulse 2600ms steps(1,end) infinite;animation-delay:var(--pulse-delay,0ms)}',
      MC_MAP.kindTurnError + '{display:flex;align-items:center;gap:8px;padding:6px 9px;background:var(--mc-surface-2);border-left:2px solid var(--mc-danger);border-radius:var(--mc-r-card);font:400 12px/1.6 var(--font-ui);color:var(--mc-danger)}',
      MC_MAP.kindTurnMaxTokens + '::before{content:"";flex:none;border-left:5px solid var(--mc-faint);border-top:4px solid transparent;border-bottom:4px solid transparent}',
      // §9:TurnStatus(宿主运行中状态行)
      MC_MAP.flowColumn + ' [role="status"]{display:flex;align-items:center;gap:8px;font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}',
      MC_MAP.flowColumn + ' [role="status"]::before{content:"";flex:none;width:6px;height:6px;background:var(--mc-spark);clip-path:polygon(33% 0,67% 0,100% 33%,100% 67%,67% 100%,33% 100%,0 67%,0 33%);animation:mc-pulse 2600ms steps(1,end) infinite;animation-delay:var(--pulse-delay,0ms)}',
      // §4-5:reasoning think 卡(spec §4 行5;原型 L506-526;双锚 [data-state=running|ok],任意深度)
      MC_MAP.thinkCard + '{background:var(--mc-surface-3);border:1px solid var(--mc-border);border-radius:var(--mc-r-card);overflow:hidden;transition:none}',
      MC_MAP.thinkCard + ' *{transition:none!important}',
      MC_MAP.thinkCard + '[data-state="running"]{background:color-mix(in oklab,var(--mc-spark) 9%,var(--mc-surface-3))}',
      MC_MAP.thinkCard + ' [class*="thinkBody"]{font:400 12px/1.8 var(--font-ui);color:var(--mc-muted);white-space:pre-wrap}',
      // 宿主 shimmer 移除(原型 run 态信号=琥珀染;标题染 spark 由行内继承,faint 摘要):
      MC_MAP.thinkCard + '[data-state="running"]::after{content:none}',
      MC_MAP.thinkCard + '[data-state="running"] *::after{animation:none!important}',
      // T4 补遗(spec §2 行「compaction/manual-compaction → i-px-copy」;T4 裁定并入本 commit):
      // 压缩条 ::before 图标位,复用 T4 已内联的 copy data-URI 常量插值(context snapshot 同款)
      ':is(' + MC_MAP.kindCompaction + ',' + MC_MAP.kindManualCompaction + ')::before{content:"";flex:none;width:15px;height:15px;margin-top:1px;background-color:var(--mc-faint);-webkit-mask:url("data:image/svg+xml,' + MC_FLOW_ICON_COPY + '") center/contain no-repeat;mask:url("data:image/svg+xml,' + MC_FLOW_ICON_COPY + '") center/contain no-repeat}',
      // §10:turn-tail 操作条(spec §4 行6;原型 L533-536)+ 钳形钮壳(只造壳不换宿主图标;
      // 后代选择器命中 .actions 容器内钮,data-slot 包装层不减后代深度)
      MC_MAP.turnTailBar + '{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-top:2px;font:500 11px/1.6 var(--font-mono);color:var(--mc-faint)}',
      MC_MAP.turnTailBar + ' button{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);background:var(--mc-surface);color:var(--mc-fg)}',
      MC_MAP.turnTailBar + ' button:active{background:var(--mc-fg);color:var(--mc-surface);border-color:var(--mc-fg)}',
      // §11:command 三态卡壳(spec §4 行9;默认 border / running spark / error danger;
      // [data-variant="others"] 在 kindCommand 行内任意深度;细节留 toolcard 周期)
      MC_MAP.kindCommand + ' [data-variant="others"]{background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:var(--mc-r-card);overflow:hidden}',
      MC_MAP.kindCommand + ' [data-variant="others"][data-state="running"]{border-color:var(--mc-spark)}',
      MC_MAP.kindCommand + ' [data-variant="others"][data-state="error"]{border-color:var(--mc-danger)}',
    ].join('\n');
  })(),
  mount: function (ctx) {
    // Task 7 实装:MutationObserver 三拍 + syncAnim 相位同步
    return null;
  },
};
