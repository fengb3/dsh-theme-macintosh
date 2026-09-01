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
  '[data-mc-dock] .todo-acc-head svg.tri.open{transform:rotate(90deg)}', // Task 8 QA 补:原型 L2746 开合瞬切拍同转 tri(落地初版漏)
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
  ' font:inherit;color:inherit;min-height:32px;overflow-y:auto}', // 验收轮1 自增高:超 40vh 封顶后容器内滚动(瞬切,无 transition)
  '[data-mc-dock] .composer textarea::placeholder{color:var(--mc-faint)}', // Task 8 QA 补:原型 §2 .field::placeholder 同款(落地初版只覆盖了 input)
  '[data-mc-dock] .composer-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
  '[data-mc-dock] .cb-btn{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 9px;',
  ' background:var(--mc-surface-2);border:1px solid var(--mc-border);border-radius:var(--mc-r-btn);',
  ' box-shadow:inset 0 0 0 1px var(--mc-surface),inset 0 0 0 2px var(--mc-border);',
  ' font:500 11px/1 var(--font-ui);color:var(--mc-muted);cursor:pointer;white-space:nowrap}',
  '[data-mc-dock] .cb-btn svg{width:12px;height:12px;flex:none}',
  '[data-mc-dock] .cb-btn.model{font-size:11px}', // 验收轮2:去 font-mono,与正文统一 --font-ui(用户裁定;族随 .cb-btn 基线)
  '[data-mc-dock] .cb-btn[hidden]{display:none}', // 验收轮1:author display 压过 UA [hidden],镜像代理降级隐藏须显式复原(同 .btn[hidden] 先例)
  // Task 8 浅色 QA 补:.btn 系(原型 §2 L205-224 直抄换 token)。renderCmp 照原型 §9.2 镜像
  // `btn sm primary/danger` 类,而主题原语命名 mc-btn → 落地初版活体 Send/Stop 裸奔(浏览器
  // 默认钮,浅色实拍坐实),此块补齐双内环/primary/danger/:active 反色/:disabled/.sm 缩尺。
  '[data-mc-dock] .btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;',
  ' height:28px;padding:0 16px;min-width:72px;border-radius:var(--mc-r-btn);',
  ' border:1px solid var(--mc-border);',
  ' box-shadow:inset 0 0 0 1px var(--mc-surface),inset 0 0 0 2px var(--mc-border);',
  ' background:var(--mc-surface-2);color:var(--mc-fg);',
  ' font:600 13px/1 var(--font-display);letter-spacing:.04em;white-space:nowrap;cursor:pointer}',
  '[data-mc-dock] .btn:active{background:var(--mc-border);color:var(--mc-surface);',
  ' box-shadow:inset 0 0 0 1px var(--mc-border),inset 0 0 0 2px var(--mc-surface)}',
  '[data-mc-dock] .btn.primary{background:var(--mc-accent);color:var(--mc-accent-ink);',
  ' box-shadow:inset 0 0 0 1px var(--mc-accent),inset 0 0 0 2px var(--mc-border)}',
  '[data-mc-dock] .btn.primary:active{background:var(--mc-border);color:var(--mc-surface);',
  ' box-shadow:inset 0 0 0 1px var(--mc-border),inset 0 0 0 2px var(--mc-surface)}',
  '[data-mc-dock] .btn.danger{background:var(--mc-danger);color:var(--mc-danger-ink);',
  ' box-shadow:inset 0 0 0 1px var(--mc-danger),inset 0 0 0 2px var(--mc-border)}',
  '[data-mc-dock] .btn:disabled{opacity:.4;cursor:not-allowed;transform:none;',
  ' box-shadow:inset 0 0 0 1px var(--mc-surface),inset 0 0 0 2px var(--mc-border)}',
  '[data-mc-dock] .btn.sm{height:22px;padding:0 10px;min-width:0;font-size:12px}',
  '[data-mc-dock] .btn svg{width:14px;height:14px;flex:none}',
  '[data-mc-dock] .btn[hidden]{display:none}', // Task 8 QA 补:author display 压过 UA [hidden] 会令 Send/Stop 双显,hidden 必须显式复原
  '[data-mc-dock] .cb-anchor{position:relative;display:inline-flex;flex:none}',
  '[data-mc-dock] .cb-right{margin-left:auto;display:flex;align-items:center;gap:8px;flex:none}',
  '[data-mc-dock] .ctx-ring{position:relative;width:22px;height:22px;flex:none;cursor:pointer}',
  '[data-mc-dock] .ctx-ring svg{width:22px;height:22px}',
  '[data-mc-dock] .ctx-ring .cr-track{stroke:var(--mc-surface-3)}',
  '[data-mc-dock] .ctx-ring .cr-arc{stroke:var(--mc-accent)}',
  '[data-mc-dock] .ctx-ring[data-hot] .cr-arc{stroke:var(--mc-danger)}',
  '[data-mc-dock] .ctx-pop{display:none;position:absolute;bottom:calc(100% + 6px);right:0;z-index:80;',
  ' width:236px;flex-direction:column;gap:6px;padding:9px 11px;background:var(--mc-surface);',
  ' border:1px solid var(--mc-border);border-radius:0;box-shadow:var(--mc-shadow-pop);',
  ' font:500 12px/1.6 var(--font-ui);color:var(--mc-muted)}', // 验收轮3:idle 本地弹层对齐官方注入皮(直角/--font-ui,用户裁定 busy/idle 同款弹窗)
  '[data-mc-dock] .ctx-pop.open{display:flex}',
  '[data-mc-dock] .ctx-pop b{color:var(--mc-fg);font-weight:500}',
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
  // 验收轮2:官方弹层 CSS 注入(用户裁定:弃自绘转写,官方菜单+皮)。html[data-mc-pop] 门控开层:
  // 官方卡从 display:none 切「离屏抹除态」(fixed -32000px 1px 盒,overflow:visible)——display:none
  // 祖先纯 CSS 不可复活,门控期换藏匿形态;卡无 transform/filter,fixed 子件仍以视口定位,卡内官方
  // 菜单经 position:fixed 逃逸到视口。锚位 --mc-pop-b/--mc-pop-r 由 JS 自绘钮 rect 回填(右下对齐,
  // 弹于钮上方)。菜单卸载后 JS 摘属性恢复 display:none 门控。权限/模型/命令/ctx(busy)四钮共用;
  // 皮观感对齐 overlays .mc-menu(像素边框/硬投影/--font-ui);无 :hover/transition(审计 §1),
  // 属性选择器一律不带引号(带引号形态会撞 map 值提取 token,审计 §5)。
  (function () {
    if (typeof MC_MAP === 'undefined' || !MC_MAP.composerHide) return '';
    var C = 'html[data-mc-pop] ' + MC_MAP.composerHide;
    return [
      C + '{display:block!important;position:fixed!important;left:-32000px;top:0;width:1px;height:1px;overflow:visible;pointer-events:none}',
      C + ' [role=menu],' + C + ' [role=listbox],' + C + ' [role=dialog]{position:fixed;left:var(--mc-pop-l,16px);right:auto;bottom:var(--mc-pop-b,140px);margin:0;min-width:216px;max-height:44vh;overflow-y:auto;pointer-events:auto;z-index:9000;background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:0;box-shadow:var(--mc-shadow-pop);padding:4px;font:500 12px/1.6 var(--font-ui);color:var(--mc-fg)}', // 直角(验收轮3 用户裁定,弃 --mc-r-card);ctx 弹窗=role=dialog(终验勘定)并入同款定位与皮
      'html[data-mc-pop=r] ' + MC_MAP.composerHide + ' [role=menu],html[data-mc-pop=r] ' + MC_MAP.composerHide + ' [role=listbox],html[data-mc-pop=r] ' + MC_MAP.composerHide + ' [role=dialog]{left:auto;right:var(--mc-pop-r,16px)}', // 验收轮4:右半屏钮右缘对齐(右下角对准点击处,修溢出)
      C + ' [role=menuitem],' + C + ' [role=menuitemradio],' + C + ' [role=option]{display:flex;align-items:center;gap:8px;padding:5px 9px;cursor:pointer;font:inherit;line-height:1.6;color:var(--mc-muted);background:none;border:none;white-space:nowrap}',
      C + ' [role=menuitem]:active,' + C + ' [role=menuitemradio]:active,' + C + ' [role=option]:active{background:var(--mc-fg);color:var(--mc-surface)}',
      C + ' [aria-checked=true],' + C + ' [aria-selected=true]{background:var(--mc-accent);color:var(--mc-accent-ink)}',
      C + ' [role=separator],' + C + ' hr{height:1px;margin:4px 5px;background:var(--mc-border-soft)}',
      C + ' [role=menu] *,' + C + ' [role=listbox] *,' + C + ' [role=dialog] *{font-family:inherit}', // 冒烟视觉勘定:宿主 span 自带字体令 CJK 回退不一致,全继承统一
    ].join('\n');
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
      try { document.documentElement.removeAttribute('data-mc-pop'); } catch (e) {} // 验收轮2:弹层门控随退场摘除
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
      renderCmp(); // Task 5:自绘 composer 卡壳(findOfficial 成功后 off 已填充,仅挂载成功路径可达)
      renderFurn(); // Task 6:家具渲染(勘定分级;DOCK_DATA 空表=全静默)
      flashIn(root, function () {});
      return true;
    }
    // 官方属性镜像 → 状态机(忙闲通道;验收轮1 勘定 2026-09-01:composerPhase 空=data-phase 是
    // 页面态非忙闲;busy 改判 composerStop 在场且未隐——busy 时官方 Send 是卸载非 hidden,
    // 降级式 off.stop&&off.send 恒 false,勿以 hidden 判,探针 B 段机理注记)
    function syncBusy() {
      try {
        if (dead) return;
        var busy = false;
        if (off.phaseEl) busy = off.phaseEl.getAttribute('data-phase') === 'running'
          || off.phaseEl.getAttribute('data-phase') === 'busy';
        else if (MC_MAP.composerStop) busy = !!(off.stop && !off.stop.hidden); // Stop 挂载=干净忙闲沿(验收轮1)
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
        syncBar(); // 验收轮1:官方钮 aria-label/title 变异与挂载沿每拍回填(文字/pct 镜像)
        syncPopGate(); // 验收轮2:官方弹层卸载收口(每拍)
      } catch (e) {}
    });
    // —— Task 5:自绘 composer 卡壳 + 三态 + Enter 纪律(定义在 api 前;onState 赋值在 api 后)——
    // 验收轮1(2026-09-01 用户裁定):bar 壳必须(裁定 4 修订)——左组命令/权限 + 右组模型/ctx 圆环,
    // 照原型 prototype L1254-1317 语汇;每颗自绘钮 = 官方对应钮的镜像代理(值 syncBar 回填)
    function renderCmp() {
      var bar = '';
      // —— 左组:命令钮(纯图标,title=斜杠命令)+ 权限钮(lock 图标+值文字+chevd)——
      bar += '<button type="button" class="cb-btn" data-mc-cmd title="斜杠命令">' +
        '<svg viewBox="0 0 9 9" aria-hidden="true"><use href="#i-command"/></svg></button>';
      bar += '<button type="button" class="cb-btn" data-mc-perm>' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-px-lock"/></svg>' +
        '<span data-mc-perm-txt></span>' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-px-chevd"/></svg></button>';
      // —— 右组:模型钮(mono+值文字+chevd)+ ctx 圆环(常驻,原型形态)+ Send/Stop ——
      bar += '<span class="cb-right">';
      bar += '<button type="button" class="cb-btn model" data-mc-model>' +
        '<span data-mc-model-txt></span>' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-px-chevd"/></svg></button>';
      var arc0 = mcCtxArc(lastCtxPct); // 圆环初始形态(挂载时 pct=最近观测值,通常 0)
      bar += '<span class="cb-anchor" data-mc-ctx>' +
        '<span class="ctx-ring"' + (arc0.hot ? ' data-hot' : '') + ' title="上下文已用 ' + Number(lastCtxPct) + '%">' +
        '<svg viewBox="0 0 22 22" aria-hidden="true" shape-rendering="crispEdges">' +
        '<circle class="cr-track" cx="11" cy="11" r="8.5" fill="none" stroke-width="3"/>' +
        '<circle class="cr-arc" cx="11" cy="11" r="8.5" fill="none" stroke-width="3" stroke-dasharray="' +
        arc0.dash + '" transform="rotate(-90 11 11)"/></svg></span>' +
        '<div class="ctx-pop" data-mc-ctxpop></div></span>';
      bar += '<button type="button" class="btn sm primary" data-mc-send disabled>Send</button>'; // 验收轮2:去图标(用户裁定,纯文字)
      bar += '<button type="button" class="btn sm danger" data-mc-stop hidden>Stop</button>';
      bar += '</span>';
      cmp.innerHTML = '<div class="composer" data-mc-state="idle">' +
        '<label class="mc-field"><textarea rows="1" placeholder="Message the agent…"></textarea></label>' +
        '<div class="composer-bar">' + bar + '</div></div>';
      var ta = cmp.querySelector('textarea');
      ta.addEventListener('input', function () {
        state = mcDockState(state, { t: 'input', has: !!ta.value.trim() });
        ta.style.height = 'auto'; // 验收轮1 自增高:塌到 auto 取 scrollHeight,40vh 封顶(无 transition 瞬切合规)
        ta.style.height = Math.min(ta.scrollHeight, Math.round(window.innerHeight * 0.4)) + 'px';
        paint();
      });
      ta.addEventListener('keydown', function (e) { // 原型 §9.2:Enter 无 Shift=发送;busy 早退
        if (e.isComposing) return; // 裁定:IME 组字期 Enter=选字确认,不得发送(中文交互主场景;Task 5 fix-1)
        try { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } } catch (er) {}
      });
      cmp.querySelector('[data-mc-send]').addEventListener('click', function () { doSend(); });
      cmp.querySelector('[data-mc-stop]').addEventListener('click', function () {
        try { api.stop(); } catch (er) {} // 官方中断(off.stop 每观察批次由 findOfficial 刷新,busy 期必到位)
      });
      // 验收轮2:官方弹层门控开层(用户裁定:弹窗弃自绘,官方菜单+CSS 注入皮)——
      // 设锚位参数 + html[data-mc-pop] 后镜像点击官方钮;菜单卸载由 syncPopGate 收口。
      // 验收轮4 选边锚定:钮在右半屏→右缘对齐钮右缘(右下角对准点击处,修圆环弹窗溢出右缘);
      // 左半屏→左缘对齐(命令钮先例,左锚防顶出左缘)。属性值 l/r 兼作门控与选边信号。
      function openOfficialPop(anchor, sel) {
        return function () {
          try {
            var b = q(sel); if (!b) return;
            var r = anchor.getBoundingClientRect();
            var useRight = r.left + r.width / 2 > window.innerWidth / 2;
            document.documentElement.style.setProperty('--mc-pop-b', Math.max(8, window.innerHeight - r.top + 8) + 'px');
            document.documentElement.style.setProperty('--mc-pop-r', Math.max(8, window.innerWidth - r.right) + 'px');
            document.documentElement.style.setProperty('--mc-pop-l',
              Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth - 224)) + 'px');
            popSeen = false; // 新一轮:菜单挂载异步,未见即不算(防开层当拍误收门)
            document.documentElement.setAttribute('data-mc-pop', useRight ? 'r' : 'l');
            b.click();
          } catch (er) {}
        };
      }
      var bCmd = cmp.querySelector('[data-mc-cmd]');
      if (bCmd) bCmd.addEventListener('click', openOfficialPop(bCmd, MC_MAP.composerCmd));
      var bPerm = cmp.querySelector('[data-mc-perm]');
      if (bPerm) bPerm.addEventListener('click', openOfficialPop(bPerm, MC_MAP.composerPerm));
      var bModel = cmp.querySelector('[data-mc-model]');
      if (bModel) bModel.addEventListener('click', openOfficialPop(bModel, MC_MAP.composerModel));
      var ringBar = cmp.querySelector('[data-mc-ctx] .ctx-ring');
      if (ringBar) ringBar.addEventListener('click', function (e) {
        // 验收轮3 终版(用户裁定:全态走官方真弹窗):ctx 官方锚 idle/busy 全态在场(深扫勘定 span/button
        // 双形态)→一律官方弹层门控;锚缺席(i18n 漂移等)才降级本地同款皮 pop
        try {
          e.stopPropagation();
          var pop = cmp.querySelector('[data-mc-ctxpop]');
          if (q(MC_MAP.composerCtx)) {
            if (pop) pop.classList.remove('open');
            openOfficialPop(ringBar, MC_MAP.composerCtx)();
            return;
          }
          if (pop) popFlash(pop, !pop.classList.contains('open'));
        } catch (er) {}
      });
      syncBar(); // 挂载路径首回填(观察器回调每拍续填)
    }
    // —— 验收轮1:bar 四钮镜像代理(syncBar)——显示文字自官方 aria-label/title 解析(模型取 title
    // 精确名;权限取 aria-label 去「访问模式，当前：」前缀剩余值;命令钮无文字纯图标);官方钮缺席
    // (i18n 等)→ 对应自绘钮隐藏,优雅降级(裁定 4 在菜单项层面继续适用)。文字一律 textContent 赋值
    // 或 esc()(esc 纪律);全部写入先比对后赋值——MO 盯 aria-label/title,同值回写会自激观察器。
    var lastCtxPct = 0; // 官方 ctx 钮仅 busy 挂载(aria-label 实时 %)——自绘环常驻(原型形态),pct 取最近观测值回填
    var popSeen = false; // 验收轮2:官方弹层「见过至少一拍」标记——菜单挂载前不算卸载,防开层当拍误收门(syncPopGate)
    function syncBar() {
      try {
        if (dead || !cmp) return;
        // 命令钮:纯图标镜像
        var cmd = cmp.querySelector('[data-mc-cmd]');
        if (cmd) { var cmdOff = !q(MC_MAP.composerCmd); if (cmd.hidden !== cmdOff) cmd.hidden = cmdOff; }
        // 权限钮:值文字 = 官方 aria-label 去前缀剩余值
        var perm = cmp.querySelector('[data-mc-perm]');
        var offPerm = q(MC_MAP.composerPerm);
        if (perm) {
          var pTxt = '';
          if (offPerm) pTxt = (offPerm.getAttribute('aria-label') || '').replace(/^访问模式，当前[:：]\s*/, '');
          var permOff = !offPerm || !pTxt;
          if (perm.hidden !== permOff) perm.hidden = permOff;
          var pSpan = perm.querySelector('[data-mc-perm-txt]');
          if (pSpan && pSpan.textContent !== pTxt) pSpan.textContent = pTxt;
        }
        // 模型钮:值文字 = 官方 title 精确模型名(缺 title 退 aria-label 去前缀;再缺 → 隐藏)
        var model = cmp.querySelector('[data-mc-model]');
        var offModel = q(MC_MAP.composerModel);
        if (model) {
          var mTxt = '';
          if (offModel) {
            mTxt = offModel.getAttribute('title') || '';
            if (!mTxt) mTxt = (offModel.getAttribute('aria-label') || '').replace(/^选择模型，当前\s*/, '');
          }
          var modelOff = !offModel || !mTxt;
          if (model.hidden !== modelOff) model.hidden = modelOff;
          var mSpan = model.querySelector('[data-mc-model-txt]');
          if (mSpan && mSpan.textContent !== mTxt) mSpan.textContent = mTxt;
        }
        // ctx 圆环:pct 自官方锚解析回填(idle=span[title]/busy=button[aria-label],验收轮3 勘定;取两属性拼串正则),mcCtxArc 出 dash/hot;
        // pop 一行总量行(无分项数据,不编造分项)
        var offCtx = q(MC_MAP.composerCtx);
        if (offCtx) {
          var mx = /上下文已用\s*(\d+)%/.exec((offCtx.getAttribute('aria-label') || '') + ' ' + (offCtx.getAttribute('title') || ''));
          if (mx) lastCtxPct = Number(mx[1]);
        }
        var ring = cmp.querySelector('[data-mc-ctx] .ctx-ring');
        if (ring) {
          var arc = mcCtxArc(lastCtxPct);
          var arcEl = ring.querySelector('.cr-arc');
          if (arcEl && arcEl.getAttribute('stroke-dasharray') !== arc.dash) arcEl.setAttribute('stroke-dasharray', arc.dash);
          if (arc.hot && !ring.hasAttribute('data-hot')) ring.setAttribute('data-hot', '');
          if (!arc.hot && ring.hasAttribute('data-hot')) ring.removeAttribute('data-hot');
          var ttl = '上下文已用 ' + Number(lastCtxPct) + '%';
          if (ring.getAttribute('title') !== ttl) ring.setAttribute('title', ttl);
          var pop = ring.parentNode.querySelector('[data-mc-ctxpop]');
          if (pop) {
            var line = '<div><b>上下文已用 ' + esc2(String(Number(lastCtxPct))) + '%</b></div>';
            if (pop._mcLine !== line) { pop._mcLine = line; pop.innerHTML = line; } // Number+esc2 后比对缓存,防自激
          }
        }
      } catch (e) {}
    }
    // 验收轮2:官方弹层收口——菜单卸载(点选/点外/ESC 后宿主摘 DOM)即摘 data-mc-pop,
    // 恢复官方卡 display:none 门控;观察器 childList 每拍回调此处(卸载必触发 mutation)。
    // 验收轮3:出场=官方菜单元素直挂 flashIn(mcfx 三拍类全局可用);退场=宿主瞬时卸载菜单
    // 元素不复存在,以「同形替身块」(最近 rect + 皮底色)补 flashOut 闪退(原型语义)
    var popMenuEl = null, popRect = null;
    function syncPopGate() {
      try {
        var de = document.documentElement;
        if (!de.hasAttribute('data-mc-pop')) { popMenuEl = null; return; }
        var menu = off.card ? off.card.querySelector('[role=menu],[role=listbox],[role=dialog]') : null;
        if (menu) {
          popSeen = true;
          if (menu !== popMenuEl) { // 新菜单元素(首开/二段式换卡)→ 出场三拍;React 若中途擦类只是闪不完整,无害
            popMenuEl = menu;
            try { flashIn(menu, function () {}); } catch (e) {}
          }
          var r = menu.getBoundingClientRect();
          popRect = { x: r.left, y: r.top, w: r.width, h: r.height }; // 每拍续记(二段式换卡移位)
          return;
        }
        if (popSeen) {
          popSeen = false; popMenuEl = null;
          de.removeAttribute('data-mc-pop');
          try {
            if (popRect && popRect.w > 20 && popRect.h > 10) {
              var ghost = document.createElement('div');
              ghost.setAttribute('data-mc-popfx', '');
              ghost.style.cssText = 'position:fixed;left:' + popRect.x + 'px;top:' + popRect.y +
                'px;width:' + popRect.w + 'px;height:' + popRect.h +
                'px;z-index:9000;background:var(--mc-surface);border:1px solid var(--mc-border);pointer-events:none';
              document.body.appendChild(ghost);
              var g = ghost;
              flashOut(g, function () { try { g.remove(); } catch (e) {} }); // 拍1 白闪后撤块,零残留
            }
          } catch (e) {}
          popRect = null;
        }
      } catch (e) {}
    }
    // 验收轮3:本地 ctx-pop 开合走 mcfx 三拍(与官方弹层门控的 flashIn/flashOut 同语言);
    // _mcfxBusy 防重入(闪拍期内再点/点外不叠闪;flashIn/flashOut 自身无守卫)
    function popFlash(pop, open) {
      try {
        if (!pop || pop._mcfxBusy) return;
        pop._mcfxBusy = 1;
        var done = function () { try { delete pop._mcfxBusy; } catch (er) {} };
        if (open) {
          flashIn(pop, function () { pop.classList.add('open'); });
          mcfxSchedule(function () { mcfxSchedule(done, 100); }, 100);
        } else {
          flashOut(pop, function () { pop.classList.remove('open'); });
          mcfxSchedule(done, 100);
        }
      } catch (er) { try { delete pop._mcfxBusy; } catch (e) {} }
    }
    function doSend() { // 镜像桥唯一发送路径:本地值 → 官方 textarea → 官方 Send click
      try {
        var ta = cmp.querySelector('textarea');
        var text = ta ? ta.value : '';
        if (state.mode === 'busy' || !text.trim()) return; // busy 早退(原型 §9.2)
        if (!api.setText(text)) { bridgeFail(); return; } // 镜像失败 = 桥断 → 降级
        if (!api.send()) return; // 官方钮 disabled = 官方拒绝,保留草稿不降级
        ta.value = '';
        ta.style.height = ''; // 验收轮1:清稿后自增高复位(回 rows=1 基线)
        state = mcDockState(state, { t: 'input', has: false });
        paint();
      } catch (er) {}
    }
    function paint() { // 三态渲染(原型 §9.2;accToggle 状态切换)
      var box = cmp.querySelector('.composer');
      if (!box) return;
      box.setAttribute('data-mc-state', state.mode);
      box.classList.toggle('busy', state.mode === 'busy');
      var send = cmp.querySelector('[data-mc-send]');
      var stop = cmp.querySelector('[data-mc-stop]');
      var busy = state.mode === 'busy';
      if (busy) { stop.hidden = false; send.hidden = true; }
      else { stop.hidden = true; send.hidden = false; send.disabled = !state.has; }
    }
    // DOCK_DATA:Task 1 附录A勘定回填——键 → function():数据|null。全部勘不通 = 空表(家具静默)。
    // 形态约定(照原型 §9;勘定后按实况调整字段名):
    //   queue: { text:'队列中还有 2 条消息 — …' }
    //   todos: [{done:true},{done:false},…]
    //   goal:  { text:'…', phase:'active'|'blocked' }
    //   ctx:   { pct: 74, used:'96.2k', total:'130k', parts:[{name:'对话消息',pct:52,color:'accent'},…] }
    var DOCK_DATA = {}; // Task 1 附录A:四件数据面均勘不通 → 空表静默(Task 6 合法终态)
    function esc2(s) { return esc(String(s == null ? '' : s)); }
    function renderFurn() {
      var html = '';
      try { var qd = DOCK_DATA.queue && DOCK_DATA.queue();
        if (qd) html += '<div class="queue-row"><svg aria-hidden="true"><use href="#i-px-clock"/></svg>' + esc2(qd.text) + '</div>';
      } catch (e) {}
      try { var td = DOCK_DATA.todos && DOCK_DATA.todos();
        if (td && td.length) {
          var segs = mcTodoSegments(td);
          var bar = '';
          for (var i = 0; i < segs.length; i++) bar += '<i class="' + segs[i] + '"></i>';
          var items = '';
          for (var j = 0; j < td.length; j++) {
            var cls = td[j].done ? ' done' : (segs[j] === 'now' ? ' now' : '');
            items += '<div class="t-item' + cls + '"><span class="t-box">' +
              (td[j].done ? '<svg viewBox="0 0 9 8" aria-hidden="true"><use href="#i-check"/></svg>' : '') +
              '</span><span class="t-txt">' + esc2(td[j].text) + '</span></div>';
          }
          html += '<div class="todo-acc open" data-mc-todo><button type="button" class="todo-acc-head">' +
            '<svg class="tri" aria-hidden="true"><use href="#i-tri"/></svg>' +
            '<span class="ta-title">To-Do List</span>' +
            '<div class="todo-bar">' + bar + '</div>' +
            '<span class="todo-meta">' + esc2(mcTodoMeta(td)) + '</span></button>' +
            '<div class="todo-body">' + items + '</div></div>';
        }
      } catch (e) {}
      try { var gd = DOCK_DATA.goal && DOCK_DATA.goal();
        if (gd) html += '<div class="goal-card" data-phase="' + esc2(gd.phase || 'active') + '">' +
          '<svg aria-hidden="true"><use href="#i-sparkle"/></svg><span class="gc-title">Goal</span>' +
          '<span class="gc-obj">' + esc2(gd.text) + '</span></div>';
      } catch (e) {}
      try { var cd = DOCK_DATA.ctx && DOCK_DATA.ctx();
        if (cd) {
          var arc = mcCtxArc(cd.pct);
          var lines = '';
          var colors = { accent: 'var(--mc-accent)', spark: 'var(--mc-spark)', muted: 'var(--mc-muted)' };
          var parts = Array.isArray(cd.parts) ? cd.parts : [];
          for (var k = 0; k < parts.length; k++) {
            lines += '<div class="ctx-line"><i style="background:' + colors[parts[k].color] + '"></i>' +
              esc2(parts[k].name) + '<span class="cl-bar"><i style="width:' + Number(parts[k].pct) +
              '%;background:' + colors[parts[k].color] + '"></i></span>' + Number(parts[k].pct) + '%</div>';
          }
          html += '<span class="cb-anchor" data-mc-ctx><span class="ctx-ring"' + (arc.hot ? ' data-hot' : '') +
            ' title="上下文占用 ' + Number(cd.pct) + '% · ' + esc2(cd.used) + ' / ' + esc2(cd.total) + ' tok">' +
            '<svg viewBox="0 0 22 22" aria-hidden="true" shape-rendering="crispEdges">' +
            '<circle class="cr-track" cx="11" cy="11" r="8.5" fill="none" stroke-width="3"/>' +
            '<circle class="cr-arc" cx="11" cy="11" r="8.5" fill="none" stroke-width="3" stroke-dasharray="' +
            arc.dash + '" transform="rotate(-90 11 11)"/></svg></span>' +
            '<div class="ctx-pop" data-mc-ctxpop><div><b>' + esc2(cd.used) + ' / ' + esc2(cd.total) +
            ' tok</b> · 上下文占用 ' + Number(cd.pct) + '%</div>' + lines + '</div></span>';
        }
      } catch (e) {}
      furn.innerHTML = html; // 全动态段经 esc2
      var head = furn.querySelector('.todo-acc-head');
      if (head) head.addEventListener('click', function () { // 折叠开合 = accToggle 状态切换
        var acc = furn.querySelector('[data-mc-todo]');
        accToggle(acc, function () { // 原型 L2746:瞬切拍 tri 同转(落地初版漏,Task 8 QA 补)
          acc.classList.toggle('open');
          var tri = head.querySelector('svg.tri');
          if (tri) tri.classList.toggle('open');
        });
      });
      var ring = furn.querySelector('[data-mc-ctx] .ctx-ring');
      if (ring) ring.addEventListener('click', function (e) { // ctx-pop 硬切显隐(原型 §9 无淡入)
        try {
          e.stopPropagation();
          var pop = furn.querySelector('[data-mc-ctxpop]');
          pop.classList.toggle('open');
        } catch (er) {}
      });
    }
    function onDocClose(e) { // 点外收 ctx-pop(浮层互斥,原型 §9.4;验收轮3:收口同样走 flashOut 闪退)
      try {
        var scopes = [furn, cmp];
        for (var i = 0; i < scopes.length; i++) {
          var pop = scopes[i] && scopes[i].querySelector('[data-mc-ctxpop]');
          if (pop && pop.classList.contains('open') && !pop.contains(e.target)) popFlash(pop, false);
        }
      } catch (er) {}
    }
    document.addEventListener('click', onDocClose); // bubble 相:capture 会抢在 ring toggle 前收 pop,再点 ring 即自锁(toggle 重开)
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
    api.onState = paint; // Task 4 syncBusy → 状态机 → 本渲染
    // 挂载成功后置:观察器守护注册 + 忙闲首同步(轮询路径挂载成功时同样要走)
    function activate() {
      // aria-label/title 入 filter:官方 ctx % 与权限/模型当前值是 aria-label 原地变异,须触发重查(验收轮1)
      mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-phase', 'disabled', 'hidden', 'aria-label', 'title'] });
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
      try { document.documentElement.removeAttribute('data-mc-pop'); } catch (e) {} // 验收轮2:弹层门控随 teardown 摘除
      try { if (rootEl) rootEl.remove(); } catch (e) {} // rootEl 捕获:bridgeFail 置空 root 后 teardown 仍能移除退场元素
      try { document.removeEventListener('click', onDocClose); } catch (e) {} // Task 6:点外收 pop 监听随坞撤除(两参=同一函数引用,注册相无关)
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
