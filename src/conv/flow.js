// src/conv/flow.js —— 会话流覆写(spec 2026-08-31)
// 协议 { css, mount(ctx) }。选择器一律插值 MC_MAP;无 :hover 无 transition。
// apply 段 overrideTokens 追加 --dsw-specific-bubble(见 client.js apply)
var McFlow = {
  // IIFE 安放 var F:顶层作用域与 tokens/clock/mcfx/sprite 共享,F 不外泄
  css: (function () {
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
    ].join('\n');
  })(),
  mount: function (ctx) {
    // Task 7 实装:MutationObserver 三拍 + syncAnim 相位同步
    return null;
  },
};
