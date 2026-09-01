// src/conv/dock.js —— 输入坞体系(spec 2026-09-01 dock 批,B 路线全自绘+镜像驱动桥)
// 协议 { css, mount(ctx) }。自绘坞挂官方 composer 席位;官方卡经 html[data-mc-dock-on] 属性门控藏匿。
// 原语(原型 §6 L554-703 直抄;token 换 --mc-*;全部 scoped 到 [data-mc-dock])
const MC_DOCK_CSS = [
  // (藏匿门控规则 Task 4 已追加:见数组末位;standalone CJS 载入无 MC_MAP 由末位守卫回退)
  '[data-mc-dock]{flex:none;display:flex;flex-direction:column;gap:8px;padding:10px 12px;background:var(--mc-rail-2);',
  ' border-top:1px solid var(--mc-border)}',
  '[data-mc-dock] .queue-row{display:flex;align-items:center;gap:8px;padding:5px 9px;',
  ' background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:var(--mc-r-card);',
  ' font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}',
  '[data-mc-dock] .queue-row svg{width:13px;height:13px;flex:none;color:var(--mc-spark)}',
  '[data-mc-dock] .todo-bar{flex:1;height:8px;background:var(--mc-surface-3);',
  ' border:1px solid var(--mc-border);padding:1px;display:flex;gap:1px}',
  '[data-mc-dock] .todo-bar i{flex:1;background:var(--mc-surface-2)}',
  '[data-mc-dock] .todo-bar.mc-ghost{background:transparent;border-color:transparent}',
  '[data-mc-dock] .todo-bar i.done{background:var(--mc-success)}',
  '[data-mc-dock] .todo-bar i.now{background:var(--mc-spark)}',
  '[data-mc-dock] .todo-meta{font:500 10px/1.6 var(--font-mono);color:var(--mc-faint);white-space:nowrap}',
  '[data-mc-dock] .todo-acc{background:var(--mc-surface);border:1px solid var(--mc-border);',
  ' border-radius:var(--mc-r-card);box-shadow:var(--mc-shadow-panel);overflow:hidden;position:relative}',
  '[data-mc-dock] .todo-acc-head{display:flex;align-items:center;gap:8px;width:100%;',
  ' padding:6px 9px;background:none;border:none;cursor:pointer;text-align:left}',
  '[data-mc-dock] .todo-acc-head .ta-title{flex:none;font:600 12px/1.4 var(--font-display);',
  ' letter-spacing:.02em;color:var(--mc-fg)}',
  '[data-mc-dock] .todo-acc-head svg.tri{width:12px;height:12px;flex:none;color:var(--mc-muted)}',
  '[data-mc-dock] .todo-acc .todo-bar{height:6px;min-width:0}',
  '[data-mc-dock] .todo-acc .todo-meta{flex:none}',
  '[data-mc-dock] .todo-body{overflow:hidden;height:auto}',
  '[data-mc-dock] .todo-acc:not(.open) .todo-body{height:0}',
  '[data-mc-dock] .todo-acc.open .todo-body{padding:2px 0 6px;border-top:1px solid var(--mc-border-soft)}',
  '[data-mc-dock] .t-item{display:flex;align-items:flex-start;gap:7px;padding:3px 9px;',
  ' font:400 12px/1.6 var(--font-ui);color:var(--mc-fg)}',
  '[data-mc-dock] .t-item .t-box{width:12px;height:12px;flex:none;margin-top:2px;',
  ' background:var(--mc-surface-2);border:1px solid var(--mc-border);border-radius:var(--mc-r-tag);',
  ' display:grid;place-items:center;color:var(--mc-surface)}',
  '[data-mc-dock] .t-item .t-box svg{width:9px;height:8px;display:none}',
  '[data-mc-dock] .t-item.done .t-box{background:var(--mc-fg);border-color:var(--mc-fg)}',
  '[data-mc-dock] .t-item.done .t-box svg{display:block}',
  '[data-mc-dock] .t-item.done .t-txt{color:var(--mc-muted);text-decoration:line-through}',
  '[data-mc-dock] .t-item.now .t-box{border-color:var(--mc-spark)}',
  '[data-mc-dock] .t-item.now .t-box::after{content:\'\';width:6px;height:6px;background:var(--mc-spark);',
  ' animation:mc-pulse 2.6s steps(1,end) infinite}',
  '[data-mc-dock] .goal-card{display:flex;align-items:center;gap:8px;padding:6px 9px;',
  ' background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:var(--mc-r-card);',
  ' box-shadow:var(--mc-shadow-panel);font:400 12px/1.6 var(--font-ui)}',
  '[data-mc-dock] .goal-card svg{width:13px;height:13px;flex:none;color:var(--mc-accent)}',
  '[data-mc-dock] .goal-card .gc-title{flex:none;font:600 12px/1.4 var(--font-display);',
  ' letter-spacing:.02em;color:var(--mc-fg)}',
  '[data-mc-dock] .goal-card .gc-obj{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;',
  ' white-space:nowrap;color:var(--mc-muted)}',
  '[data-mc-dock] .goal-card .gc-acts{flex:none;display:flex;gap:6px}',
  '[data-mc-dock] .goal-card[data-phase="blocked"]{border-color:var(--mc-spark)}',
  '[data-mc-dock] .composer{display:flex;flex-direction:column;gap:8px;background:var(--mc-surface);',
  ' border:1px solid var(--mc-border);border-radius:var(--mc-r-card);',
  ' box-shadow:var(--mc-shadow-panel);padding:8px}',
  '[data-mc-dock] .composer .mc-field{height:auto;min-height:44px;padding:6px 8px}',
  '[data-mc-dock] .composer.busy .mc-field{background:color-mix(in oklab,var(--mc-fg) 4%,var(--mc-surface))}',
  '[data-mc-dock] .composer textarea{flex:1;background:transparent;border:none;resize:none;outline:none;',
  ' font:inherit;color:inherit;min-height:32px}',
  '[data-mc-dock] .composer-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
  '[data-mc-dock] .cb-btn{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 9px;',
  ' background:var(--mc-surface-2);border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);',
  ' box-shadow:inset 0 0 0 1px var(--mc-surface),inset 0 0 0 2px var(--mc-border);',
  ' font:500 11px/1 var(--font-ui);color:var(--mc-muted);cursor:pointer;white-space:nowrap}',
  '[data-mc-dock] .cb-btn svg{width:12px;height:12px;flex:none}',
  '[data-mc-dock] .cb-btn.model{font-family:var(--font-mono);font-size:11px}',
  '[data-mc-dock] .cb-anchor{position:relative;display:inline-flex;flex:none}',
  '[data-mc-dock] .cb-right{margin-left:auto;display:flex;align-items:center;gap:8px;flex:none}',
  '[data-mc-dock] .ctx-ring{position:relative;width:22px;height:22px;flex:none;cursor:pointer}',
  '[data-mc-dock] .ctx-ring svg{width:22px;height:22px}',
  '[data-mc-dock] .ctx-ring .cr-track{stroke:var(--mc-surface-3)}',
  '[data-mc-dock] .ctx-ring .cr-arc{stroke:var(--mc-accent)}',
  '[data-mc-dock] .ctx-ring[data-hot] .cr-arc{stroke:var(--mc-danger)}',
  '[data-mc-dock] .ctx-pop{display:none;position:absolute;bottom:calc(100% + 6px);right:0;z-index:80;',
  ' width:236px;flex-direction:column;gap:6px;padding:9px 11px;background:var(--mc-surface);',
  ' border:1px solid var(--mc-border);border-radius:var(--mc-r-card);box-shadow:var(--mc-shadow-pop);',
  ' font:400 11.5px/1.7 var(--font-ui);color:var(--mc-muted);font-family:var(--font-sb)}',
  '[data-mc-dock] .ctx-pop.open{display:flex}',
  '[data-mc-dock] .ctx-pop b{color:var(--mc-fg);font-family:var(--font-sb);font-weight:500}',
  '[data-mc-dock] .ctx-line{display:flex;align-items:center;gap:7px}',
  '[data-mc-dock] .ctx-line i{width:8px;height:8px;flex:none;',
  ' clip-path:polygon(33% 0,67% 0,100% 33%,100% 67%,67% 100%,33% 100%,0 67%,0 33%)}',
  '[data-mc-dock] .ctx-line .cl-bar{flex:1;height:5px;background:var(--mc-surface-3);',
  ' border:1px solid var(--mc-border-soft);border-radius:0}',
  '[data-mc-dock] .ctx-line .cl-bar i{display:block;height:100%;border-radius:0;clip-path:none}',
  // 藏匿门控行(brief 逐字;包守卫因本数组顶层求值——standalone CJS(测试 loadSrc)无 MC_MAP
  // 会 ReferenceError,flow.js css 同款先例 typeof 守卫回退空串;client.js 装配域恒有 MC_MAP)
  (function () {
    return typeof MC_MAP === 'undefined' ? '' : 'html[data-mc-dock-on] ' + MC_MAP.composerHide + '{display:none!important}';
  })(),
].join('\n');
var McDock = {
  css: MC_DOCK_CSS,
  mount: function (ctx) {
    var state = { mode: 'idle', has: false };
    var root = null, rootEl = null, furn = null, cmp = null; // rootEl 持元素引用:置空 root 后退场/teardown 仍能 remove
    var mo = null, dead = false;
    var off = { card: null, field: null, send: null, stop: null, phaseEl: null, phaseVal: '' };
    var MC_DOCK_API = null; // 模块级桥(Task 5/6/kit 消费)
    function q(sel) { try { return sel ? document.querySelector(sel) : null; } catch (e) { return null; } }
    function findOfficial() {
      off.card = q(MC_MAP.composerHide);
      off.field = q(MC_MAP.composerField);
      off.send = q(MC_MAP.composerSend);
      off.stop = q(MC_MAP.composerStop);
      off.phaseEl = q(MC_MAP.composerPhase);
      return !!(off.card && off.field);
    }
    function bridgeFail() { // 桥断降级(spec §1):自绘坞退场 + 摘门控属性恢复官方;绝不双输入框
      if (dead) return; dead = true;
      try { if (MC_DOCK_API === api) MC_DOCK_API = null; } catch (e) {}
      try { document.documentElement.removeAttribute('data-mc-dock-on'); } catch (e) {}
      try { if (mo) { mo.disconnect(); mo = null; } } catch (e) {}
      var el = root; // 置空前捕获:flashOut hide 回调经 mcfxSchedule 异步派发,触发时外层 root 已置空,闭包须捕 el 才能真正移除
      try { if (el) flashOut(el, function () { try { el.remove(); } catch (e) {} }); } catch (e) {}
      root = null;
    }
    function mountDock() {
      if (!findOfficial()) return false;
      var seat = q(MC_MAP.composerSeat) || off.card.parentElement;
      if (!seat) return false;
      root = document.createElement('div');
      rootEl = root;
      root.setAttribute('data-mc-dock', '');
      root.className = 'dock';
      furn = document.createElement('div'); // Task 6 家具区(本任务先空置)
      furn.setAttribute('data-mc-dock-furn', '');
      cmp = document.createElement('div');  // Task 5 composer 卡(本任务先空置)
      cmp.setAttribute('data-mc-dock-cmp', '');
      root.appendChild(furn); root.appendChild(cmp);
      seat.appendChild(root); // 官方卡之后(视觉在下方;官方卡被藏后占整个席位)
      document.documentElement.setAttribute('data-mc-dock-on', '');
      flashIn(root, function () {});
      return true;
    }
    // 官方属性镜像 → 状态机(忙闲通道;composerPhase 空 = 降级读 Send/Stop disabled)
    function syncBusy() {
      try {
        if (dead) return;
        var busy = false;
        if (off.phaseEl) busy = off.phaseEl.getAttribute('data-phase') === 'running'
          || off.phaseEl.getAttribute('data-phase') === 'busy';
        else if (off.stop && off.send) busy = !off.stop.hidden || off.send.hidden;
        if (busy !== (state.mode === 'busy')) {
          state = mcDockState(state, { t: busy ? 'busy' : 'idle' });
          if (api && api.onState) api.onState(state);
        }
      } catch (e) {}
    }
    // React 重渲染守护:官方卡/自绘坞被冲 → 重插;官方件失活 → 降级(McThink 观察器嫁接先例)
    var missCount = 0, MISS_MAX = 3; // 失配去抖裁定:瞬时失配(切会话/React keyed 重挂 1-2 批)不桥断;连续 MISS_MAX 拍缺席才判真失配退场(真失配约 3 拍内恢复官方,绝不双输入框红线不变)
    mo = new window.MutationObserver(function () {
      try {
        if (dead) return;
        if (!findOfficial()) {
          missCount += 1;
          if (missCount >= MISS_MAX) bridgeFail();
          return;
        }
        missCount = 0;
        if ((!root || !root.isConnected) && off.card) {
          var seat = q(MC_MAP.composerSeat) || off.card.parentElement;
          if (seat && root && root.parentNode !== seat) seat.appendChild(root);
        }
        syncBusy();
      } catch (e) {}
    });
    var api = {
      state: function () { return state; },
      onState: null, // Task 5 注册:状态机 → 三态渲染回调
      setText: function (text) { return mcMirrorValue(off.field, text); }, // 桥通道 1
      send: function () { // 桥通道 2:唯一发送通道 = 官方原钮
        if (!off.send || off.send.disabled) return false;
        try { off.send.click(); return true; } catch (e) { return false; }
      },
      stop: function () {
        if (!off.stop) return false;
        try { off.stop.click(); return true; } catch (e) { return false; }
      },
      officials: function () { return off; },
      die: bridgeFail,
    };
    // 挂载成功后置:观察器守护注册 + 忙闲首同步(轮询路径挂载成功时同样要走)
    function activate() {
      mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-phase', 'disabled', 'hidden'] });
      syncBusy();
    }
    function poll4Dock() { // 400ms 栅格候卡:在场即挂;不在场续候(teardown 兜底撤轮询)
      timer = null;
      if (dead) return;
      if (mountDock()) { activate(); return; }
      timer = CLOCK.next(poll4Dock, 400);
    }
    MC_DOCK_API = api;
    // 晚挂载轮询(McFlow poll 同款纪律):live 实测主题 apply(style 注入 788ms)早于宿主 React
    // 渲染官方卡(912ms),一次性探测必败且观察器仅在挂载成功后才注册、永不重试 → 400ms 栅格
    // 轮询候卡;CLOCK 缺席(装配域不可达)退一次性语义,探针失配=静默退场,官方照常
    var timer = null;
    if (!mountDock() && typeof CLOCK !== 'undefined') timer = CLOCK.next(poll4Dock, 400);
    if (root) activate();
    else if (!timer) { MC_DOCK_API = null; return function () {}; } // 探针失配=静默退场,官方照常
    return function teardown() {
      try { if (MC_DOCK_API === api) MC_DOCK_API = null; } catch (e) {}
      try { if (mo) mo.disconnect(); } catch (e) {}
      try { if (timer) CLOCK.clear(timer); } catch (e) {}
      try { document.documentElement.removeAttribute('data-mc-dock-on'); } catch (e) {}
      try { if (rootEl) rootEl.remove(); } catch (e) {} // rootEl 捕获:bridgeFail 置空 root 后 teardown 仍能移除退场元素
    };
  },
};
// —— 纯函数(Task 3)——
function mcDockState(state, ev) {
  var s = state || { mode: 'idle', has: false };
  if (!ev) return s;
  if (ev.t === 'busy') return { mode: 'busy', has: s.has };
  if (ev.t === 'idle') return { mode: 'idle', has: s.has };
  if (ev.t === 'input') return { mode: s.mode === 'busy' ? 'busy' : (ev.has ? 'ready' : 'idle'), has: !!ev.has };
  return s; // 未知事件无害返回
}
function mcTodoSegments(todos) {
  var list = Array.isArray(todos) ? todos : [];
  var nowSet = false;
  return list.map(function (t) {
    if (t && t.done) return 'done';
    if (!nowSet) { nowSet = true; return 'now'; }
    return 'todo';
  });
}
function mcTodoMeta(todos) {
  var list = Array.isArray(todos) ? todos : [];
  var done = 0;
  for (var i = 0; i < list.length; i++) if (list[i] && list[i].done) done++;
  return done + '/' + list.length;
}
function mcCtxArc(pct) {
  var C = 53.4; var p = Math.max(0, Math.min(100, Number(pct) || 0));
  return { dash: (p / 100 * C).toFixed(1) + ' ' + C.toFixed(1), hot: p > 80 };
}
// React 受控 textarea 镜像(native setter + input event;spec §3 桥通道 1)
// Node 桩(无原型描述符)走 desc 缺省 false? 否——桩需镜像语义:true 路径不依赖宿主原型:
function mcMirrorValue(ta, text) {
  if (!ta) return false;
  var desc = (typeof window !== 'undefined' && window.HTMLTextAreaElement)
    ? Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value') : { set: function (v) { ta.value = v; } };
  if (!desc || !desc.set) return false;
  try {
    desc.set.call(ta, text);
    ta.dispatchEvent(new (typeof window !== 'undefined' ? window.Event : function (t) { return { type: t }; })('input', { bubbles: true }));
    return true;
  } catch (e) { return false; }
}
if (typeof module !== 'undefined') module.exports = { McDock: McDock, mcDockState: mcDockState, mcTodoSegments: mcTodoSegments, mcTodoMeta: mcTodoMeta, mcCtxArc: mcCtxArc, mcMirrorValue: mcMirrorValue };
