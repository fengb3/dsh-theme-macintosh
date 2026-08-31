// src/conv/flow.js —— 会话流覆写(spec 2026-08-31)
// 协议 { css, mount(ctx) }。选择器一律插值 MC_MAP;无 :hover 无 transition。
var McFlow = {
  css: [
    // §4-1:.flow 列(gap 16→14 原型 L462;padding 16;子项 flex:none 手册 §6.4)
    MC_MAP.flowColumn + '{gap:14px;padding:16px}',
    MC_MAP.flowItem + '{flex:none;min-width:0}',
  ].join('\n'),
  mount: function (ctx) {
    // Task 7 实装:MutationObserver 三拍 + syncAnim 相位同步
    return null;
  },
};
