// src/kit.js —— 检视页骨架（默认关闭零足迹；控制台 window.__MC_KIT_OPEN__ = true 打开）
// 布局类全部 kit- 前缀，样式不外泄 kit 根之外；组件类直接复用 mc- 原语
// 会话流分区（T8）：原型 §5 类定义 scoped 到 .kit-panel（Ruling 3，非宿主选择器不进
// MC_MAP）+ ReasoningDemo 五帧流式驱动（§8.2 状态机 kit 化，延时全走 CLOCK.next）
// 纯顶层声明，无模块系统语法；与 tokens/clock/mcfx/sprite 拼进同一作用域
// 问题卡分区 mask 帮手(ask 批):ask.js 同域出口(mcAskUri/mcAskPath/ASK_*_D,ORDER 先于本模块);
// 仅 kit 演示消费——真卡走 McAsk CSS,两处字形同源防漂移
const MC_KIT_ASK_MASK = {
  tri: mcAskUri(mcAskPath(ASK_TRI_D), 6, 11),
  rdo: mcAskUri(mcAskPath(ASK_RDO_D, true), 12, 12),
  rdoOn: mcAskUri(mcAskPath(ASK_RDO_ON_D, true), 12, 12),
  chkOn: mcAskUri("%3Crect x='.5' y='.5' width='11' height='11' fill='none' stroke='black'/%3E" + mcAskPath(ASK_CHK_D), 12, 12),
};
const McKit = {
  css: `/* ===== kit 检视页专属布局（全部 kit- 前缀，不外泄） ===== */
.kit-scrim{position:fixed;inset:0;z-index:95;overflow-y:auto;box-sizing:border-box;
  padding:32px 16px;pointer-events:auto;
  background:radial-gradient(rgba(0,0,0,.5) 1px,transparent 1.5px);
  background-size:8px 8px} /* 点阵幕：与桌面同 8px 栅格，整块可点关闭 */
.kit-panel{max-width:960px;margin:0 auto;
  background:var(--mc-surface);
  border:1px solid var(--mc-border);border-radius:var(--mc-r-window);
  box-shadow:var(--mc-shadow-panel);overflow:hidden} /* 复用 .win 窗口语汇 */
.kit-titlebar{position:relative;display:flex;align-items:center;justify-content:center;
  height:var(--mc-titlebar-h);flex:none;
  background:repeating-linear-gradient(180deg,var(--mc-title-stripe) 0 1px,transparent 1px 3px),
    var(--mc-surface-2);
  border-bottom:1px solid var(--mc-border);padding:0 26px}
.kit-titlebar::before{content:'';position:absolute;left:0;top:0;right:0;height:1px;background:var(--mc-accent)}
.kit-title{max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  padding:0 8px;background:var(--mc-surface-2);color:var(--mc-fg);
  font:600 12px/1 var(--font-display);letter-spacing:.03em}
.kit-body{padding:20px 24px 28px;display:flex;flex-direction:column;gap:26px;
  color:var(--mc-fg);font:400 13px/1.7 var(--font-ui)}
.kit-h{font:600 15px/1 var(--font-display);letter-spacing:.03em;margin:0 0 10px}
/* 响应式分区(responsive 批):抽屉形态静态样本(自有演示类,真门控在窄窗活体) */
.kit-resp-drawer{width:220px;border:1px solid var(--mc-border);background:var(--mc-surface);box-shadow:var(--mc-shadow-win,2px 2px 0 0 #000)}
.kit-resp-drawer-tb{height:20px;display:flex;align-items:center;justify-content:center;font:600 11px/1 var(--font-display);letter-spacing:.04em;color:var(--mc-fg);background:var(--mc-surface-2);border-bottom:1px solid var(--mc-border)}
.kit-resp-drawer-row{padding:5px 9px;font:400 12px/1.6 var(--font-ui);color:var(--mc-muted);border-bottom:1px solid var(--mc-border-soft)}
/* 问题卡分区(ask 批):换皮静态样本(自有演示类 .kit-ask-*;真卡=官方 DOM+McAsk CSS 运行时换皮,
   活体验收)——mask 帮手经装配同域引用 ask.js 出口(MC_HERO_COPY shim 先例,ORDER McAsk 先于 McKit) */
.kit-ask-card{position:relative;display:flex;flex-direction:column;gap:8px;max-width:430px;padding:14px;
  background:var(--mc-surface);border:1px solid var(--mc-border);box-shadow:var(--mc-shadow-pop)}
.kit-ask-cap{font:400 10.5px/1.4 var(--font-ui);color:var(--mc-faint)}
.kit-ask-tt{margin:0;padding-right:44px;font:600 13px/1.4 var(--font-display);color:var(--mc-fg)}
.kit-ask-opt{display:flex;align-items:flex-start;gap:7px;width:100%;text-align:left;padding:4px 6px;border:none;
  background:none;cursor:pointer;font:400 12.5px/1.6 var(--font-ui);color:var(--mc-fg)}
.kit-ask-opt.rdo::before{content:'';flex:0 0 12px;width:12px;height:12px;margin-top:4px;box-sizing:border-box;
  background:currentColor;color:var(--mc-muted);-webkit-mask:${MC_KIT_ASK_MASK.rdo};mask:${MC_KIT_ASK_MASK.rdo}}
.kit-ask-opt.on{background:var(--mc-fg);color:var(--mc-surface)}
.kit-ask-opt.rdo.on::before{color:var(--mc-surface);-webkit-mask:${MC_KIT_ASK_MASK.rdoOn};mask:${MC_KIT_ASK_MASK.rdoOn}}
.kit-ask-chk{flex:0 0 12px;width:12px;height:12px;margin-top:4px;box-sizing:border-box;
  border:1px solid var(--mc-muted);background:none}
.kit-ask-opt.on .kit-ask-chk{border:none;background:currentColor;color:var(--mc-surface);
  -webkit-mask:${MC_KIT_ASK_MASK.chkOn};mask:${MC_KIT_ASK_MASK.chkOn}}
.kit-ask-field{flex:1;min-width:0;padding:2px 0}
.kit-ask-field textarea{display:block;width:100%;box-sizing:border-box;border:none;background:transparent;resize:none;
  font:400 12.5px/1.7 var(--font-ui);color:var(--mc-fg)}
.kit-ask-foot{display:flex;align-items:center;gap:8px}
.kit-ask-nav{width:18px;height:18px;padding:0;border:none;background:currentColor;color:var(--mc-muted);cursor:pointer;
  -webkit-mask:${MC_KIT_ASK_MASK.tri};mask:${MC_KIT_ASK_MASK.tri}}
.kit-ask-nav.prev{transform:scaleX(-1)}
.kit-ask-nav:disabled{opacity:.35;cursor:default}
.kit-ask-progress{font:400 11px var(--font-ui);color:var(--mc-faint);margin-left:auto}
.kit-ask-strip{display:flex;align-items:center;gap:6px;padding:4px 8px;background:var(--mc-warn);color:var(--mc-bg-deep);
  font:600 11px/1.5 var(--font-display)}
.kit-ask-dot{width:6px;height:6px;flex:none;background:currentColor}
.kit-ask-plan{padding:6px 8px;font:400 12.5px/1.7 var(--font-ui);color:var(--mc-fg);background:var(--mc-surface-2);border:1px solid var(--mc-border)}
.kit-ask-btn{padding:4px 10px;border:1px solid var(--mc-border);background:var(--mc-surface);color:var(--mc-fg);
  font:400 12px/1.4 var(--font-ui);cursor:pointer;box-shadow:var(--mc-shadow-field)}
.kit-ask-btn.primary{background:var(--mc-fg);color:var(--mc-surface);border-color:var(--mc-fg)}
.kit-ask-ghost{padding:4px 10px;border:1px solid var(--mc-border);background:none;color:var(--mc-muted);
  font:400 12px/1.4 var(--font-ui);cursor:pointer}
.kit-grid{display:flex;flex-wrap:wrap;gap:10px}
.kit-chip{display:inline-flex;align-items:center;gap:8px;height:28px;padding:0 10px;
  border:1px solid var(--mc-border);border-radius:var(--mc-r-tag);background:var(--mc-surface-2);
  font:400 11px var(--font-mono);color:var(--mc-fg)}
.kit-swatch{width:18px;height:18px;flex:none;border:1px solid var(--mc-border)}
.kit-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.kit-cell{display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.kit-note{font:400 11px var(--font-mono);color:var(--mc-faint)}
.kit-demo{position:relative;display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  min-height:52px;padding:12px;border:1px dashed var(--mc-border-soft);background:var(--mc-surface-2)}
.kit-demo-target{position:relative;min-width:140px;padding:6px 12px;
  background:var(--mc-surface);border:1px solid var(--mc-border);
  font:400 12px var(--font-ui);color:var(--mc-fg)}
.kit-demo-target.kit-folded{display:none}
.kit-iconwall{display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:10px}
.kit-icell{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 4px;
  background:var(--mc-surface-2);border:1px solid var(--mc-border);border-radius:var(--mc-r-tag)}
.kit-icell svg{width:20px;height:20px;color:var(--mc-fg)}
.kit-ilabel{font:400 10px var(--font-mono);color:var(--mc-faint);word-break:break-all}
.kit-field{width:280px}
.kit-scrim{scrollbar-width:thin;scrollbar-color:var(--mc-scroll-box) transparent}
.kit-scrim::-webkit-scrollbar{width:15px}
.kit-scrim::-webkit-scrollbar-track{background:var(--mc-scroll-track);border-left:1px solid var(--mc-border)}
.kit-scrim::-webkit-scrollbar-thumb{background:var(--mc-scroll-box);border:1px solid var(--mc-border)}
/* ===== 会话流演示分区(Ruling 3):原型 §5 类定义 scoped 到 kit 面板 =====
   T2-T6 的 css 只覆写宿主选择器;.md/.msg/.bubble/.inject/.reasoning/.turn-tail/.retry-row/
   .cap-row 及其子件(tri/s-in/cover/icon-btn/s-dot…)在主题内无任何已定义样式 —— 此处照
   prototype/macintosh-workspace.html §5 段(L461-548)逐行移植,全部选择器以 .kit-panel
   前缀 scoped 不外溢;--* 换 --mc-* 对应名(--font-*/--r-*/--sel-bg 沿 McTokens 现有名)。
   非宿主选择器,不进 MC_MAP(audit §5 不红)。kit- 前缀为检视页自有布局件(kit-band 词汇)。 */
.kit-frames{display:grid;gap:16px;grid-template-columns:1fr}
.kit-frame{border-radius:var(--mc-r-window);overflow:hidden;background:var(--mc-surface);
  box-shadow:var(--mc-shadow-panel);border:1px solid var(--mc-border)}
.kit-frame-tag{display:flex;justify-content:space-between;gap:12px;align-items:center;
  padding:7px 12px;font:700 11px/1.3 var(--font-mono);letter-spacing:.08em;color:var(--mc-faint);
  text-transform:uppercase;background:var(--mc-surface-2);border-bottom:1px solid var(--mc-border)}
.kit-frame-tag em{font-style:normal;color:var(--mc-accent)}
.kit-frame-body{padding:16px}
.kit-stack{display:flex;flex-direction:column;gap:12px}
.kit-stack.sm{gap:10px}
.kit-injects{display:grid;gap:8px;max-width:680px}
.kit-panel .md{font:400 14px/1.8 var(--font-ui);color:var(--mc-fg);word-break:break-word}
.kit-panel .md p{margin:0} /* 原型 §2 全局 h/p{margin:0} 的 scoped 化:§5 的 p+p 间距依赖零基线 */
.kit-panel .md h1,.kit-panel .md h2,.kit-panel .md h3{font:600 17px/1.4 var(--font-display);letter-spacing:.01em;margin:14px 0 6px}
.kit-panel .md h2{font-size:15px}
.kit-panel .md h3{font-size:14px}
.kit-panel .md p + p{margin-top:8px}
.kit-panel .md ul,.kit-panel .md ol{margin:6px 0;padding-left:22px}
.kit-panel .md li{margin:3px 0}
.kit-panel .md code{font:500 12px/1.5 var(--font-code);
  padding:1px 5px;background:var(--mc-sel-bg);border-radius:var(--mc-r-tag);color:var(--mc-fg)}
.kit-panel .md pre{margin:8px 0;padding:10px 12px;overflow-x:auto;
  background:var(--mc-bg-deep);border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card)}
.kit-panel .md pre code{padding:0;background:none;font:400 12.5px/1.7 var(--font-code)}
.kit-panel .md table{border-collapse:collapse;margin:8px 0;font:400 12.5px/1.6 var(--font-ui)}
.kit-panel .md th,.kit-panel .md td{padding:4px 10px;text-align:left;
  border:1px solid var(--mc-border-soft)}
.kit-panel .md th{font:600 12px/1.4 var(--font-display);background:var(--mc-surface-2)}
.kit-panel .md blockquote{margin:8px 0;padding:2px 12px;color:var(--mc-muted);
  border-left:2px solid var(--mc-accent-dim)}
.kit-panel .md a{color:var(--mc-accent)} /* 原型 §2 全局 a 染 accent 的 scoped 化(两文件均有) */
.kit-panel .msg{display:flex;flex-direction:column;gap:6px}
.kit-panel .msg.user{align-items:flex-end}
.kit-panel .msg.user .bubble{max-width:520px;padding:7px 12px;
  background:var(--mc-accent);color:var(--mc-accent-ink);
  border:1px solid var(--mc-border);border-radius:8px;
  font:400 14px/1.7 var(--font-ui)}
.kit-panel .msg.user .attach{max-width:360px;display:flex;gap:8px;align-items:flex-end}
.kit-panel .msg.user .attach .ph{width:132px;height:92px;flex:none;position:relative;
  background:var(--mc-surface-3);
  border:1px solid var(--mc-border);border-radius:var(--mc-r-card)}
.kit-panel .msg.user .attach .ph::after{content:'IMG';position:absolute;right:5px;bottom:5px;
  padding:1px 5px;background:var(--mc-surface);color:var(--mc-muted);
  border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-tag);
  font:600 9px/1.4 var(--font-mono)}
.kit-panel .msg.user .attach .cap{font:400 12px/1.6 var(--font-ui);color:var(--mc-muted);max-width:180px}
.kit-panel .inject{display:flex;align-items:flex-start;gap:7px;padding:7px 9px;
  background:var(--mc-surface-2);
  border:1px dashed var(--mc-border-soft);border-radius:var(--mc-r-card)}
.kit-panel .inject svg{width:15px;height:15px;flex:none;margin-top:1px;color:var(--mc-faint)}
.kit-panel .inject .i-tt{flex:1;min-width:0;font:400 12px/1.7 var(--font-ui);color:var(--mc-muted);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.kit-panel .reasoning{background:var(--mc-surface-3);
  border:1px solid var(--mc-border);border-radius:var(--mc-r-card);
  overflow:hidden}
.kit-panel .reasoning.run{background:color-mix(in oklab,var(--mc-spark) 9%,var(--mc-surface-3))}
.kit-panel .reasoning-head{display:flex;align-items:center;gap:6px;width:100%;
  padding:6px 9px;background:none;border:none;cursor:pointer;text-align:left}
.kit-panel .reasoning-head .r-tag{font:400 13px/1.3 'FindersKeepers','Fusion Pixel 12px monospaced zh','Noto Sans SC',monospace;letter-spacing:.03em;color:var(--mc-fg)}
.kit-panel .reasoning-head .r-sum{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font:400 12px/1.5 var(--font-ui);color:var(--mc-faint)}
.kit-panel .reasoning-head .r-sum .s-in{position:relative}
.kit-panel .reasoning-head .r-sum .s-in::after{content:'';position:absolute;inset:-1px -2px;opacity:0;pointer-events:none;
  background:#fff;
  background-image:repeating-linear-gradient(0deg,transparent 0 2px,rgba(0,0,0,.06) 2px 3px)}
.kit-panel .reasoning-head .r-sum .s-in.flash::after{opacity:1}
.kit-panel .reasoning-head .r-dur{font:500 10px/1.5 var(--font-mono);color:var(--mc-faint);flex:none}
.kit-panel .reasoning.run .reasoning-head .r-tag{color:var(--mc-spark)}
.kit-panel .reasoning-body{overflow:hidden;height:auto}
.kit-panel .reasoning:not(.open) .reasoning-body{height:0}
.kit-panel .reasoning-body .r-txt{padding:2px 9px 9px 26px;
  font:400 12px/1.8 var(--font-ui);color:var(--mc-muted);white-space:pre-wrap}
.kit-panel .reasoning.run .r-txt .cover{color:transparent;background:#fff;
  background-image:repeating-linear-gradient(0deg,transparent 0 2px,rgba(0,0,0,.06) 2px 3px)}
html[data-theme="light"] .kit-panel .reasoning.run .r-txt .cover{background:#000;
  background-image:repeating-linear-gradient(0deg,transparent 0 2px,rgba(255,255,255,.07) 2px 3px)}
.kit-panel .turn-tail{display:flex;align-items:center;gap:8px;flex-wrap:wrap;
  padding-top:2px}
.kit-panel .turn-tail .t-stats{margin-left:auto;font:500 11px/1.6 var(--font-mono);color:var(--mc-faint);
  white-space:nowrap}
.kit-panel .retry-row{display:flex;align-items:center;gap:8px;padding:6px 9px;
  background:var(--mc-surface-2);
  border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card);
  font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}
.kit-panel .retry-row .s-dot{width:6px;height:6px;background:var(--mc-spark);flex:none;
  clip-path:polygon(33% 0,67% 0,100% 33%,100% 67%,67% 100%,33% 100%,0 67%,0 33%); /* 八角像素圆点(§4 款) */
  animation:mc-pulse 2.6s steps(1,end) infinite;animation-delay:var(--pulse-delay,0ms)}
.kit-panel .cap-row{display:flex;align-items:center;gap:8px;padding:6px 9px;
  background:var(--mc-surface-2);
  border:1px solid var(--mc-border-soft);border-radius:var(--mc-r-card);
  font:400 12px/1.6 var(--font-ui);color:var(--mc-muted)}
/* 原型 .cap-row .tri{border-left-color} 系死规则(svg 无 border),不移植 */
.kit-panel .tri{width:11px;height:11px;flex:none;color:var(--mc-fg);overflow:visible}
.kit-panel .tri.open{transform:rotate(90deg)}
.kit-panel .tri.dim{color:var(--mc-faint)}
.kit-panel .icon-btn{display:grid;place-items:center;width:26px;height:26px;flex:none;
  border-radius:var(--mc-r-tag);border:1px solid var(--mc-border);
  background:var(--mc-surface-2);color:var(--mc-fg);cursor:pointer}
.kit-panel .icon-btn:active{background:var(--mc-border);color:var(--mc-surface)}
.kit-panel .icon-btn:disabled{opacity:.4;cursor:not-allowed}
.kit-panel .icon-btn svg{width:13px;height:13px}
.kit-panel .icon-btn.sm{width:20px;height:20px}
.kit-panel .icon-btn.sm svg{width:11px;height:11px}
/* 菜单分区(Task 7):静态陈列的 .mc-menu 归位到文档流(原语 absolute 供弹出锚定) */
.kit-panel .kit-menustatic .mc-menu{position:relative;top:auto;left:auto;right:auto;max-width:280px}
/* 输入坞分区(Task 8):dock CSS 全部 scoped 到 [data-mc-dock],样本直接包 div[data-mc-dock]
   复用原语;kit-dockwrap 限宽对齐原型 kit-band 640px 惯例,kit-dockctx 给 ctx-pop 上弹留位 */
.kit-panel .kit-dockwrap{max-width:640px}
.kit-panel .kit-dockctx{max-width:640px;min-height:172px;justify-content:flex-end}
/* 浮层分区(overlays2 批 Task 4):hero 样本直用全局原语构图(静态陈列,面板内无
   observer——相位挂载行为由活体 heroSync 供;裁定轮后=窗框+mark+title 三件,窗框条
   .mc-hero-tb/.mc-tbx 类由 overlays 批全局供给);dialog 控件样本 = §C dlg 皮规格的 .mc-dlg-demo
   kit 局部复刻,自有类零官方属性(audit 宿主扫描零接触);switch 样本随 Task 3 勘定裁除
   (官方 settings 面板 0 switch——navCell/分段钮形态,不渲染官方没有的结构)。 */
.kit-panel .mc-dlg-demo{display:flex;flex-direction:column;gap:10px;max-width:420px;
  padding:14px;background:var(--mc-surface);border:1px solid var(--mc-border);border-radius:0;
  box-shadow:var(--mc-shadow-pop);font:400 12px/1.6 var(--font-ui);color:var(--mc-fg)}
.kit-panel .mc-dlg-demo button{background:var(--mc-surface-2);border:1px solid var(--mc-border);
  border-radius:0;font:500 12px/1.6 var(--font-ui);color:var(--mc-fg);padding:4px 12px;cursor:pointer}
.kit-panel .mc-dlg-demo button:active{background:var(--mc-fg);color:var(--mc-surface)}
.kit-panel .mc-dlg-demo input{background:var(--mc-surface);border:1px solid var(--mc-border);
  border-radius:0;font:400 12px/1.6 var(--font-ui);color:var(--mc-fg);padding:4px 8px}
.kit-panel .mc-dlg-demo .dd-sep{height:1px;background:var(--mc-border-soft)}`,

  slots(ctx) {
    // 席位：shell.overlay（additive 列表槽，order 靠后）；默认渲染 null。
    // 'slots' 服务经 ctx.get 可选读取（勿声明 inject，勿属性访问）。
    const S = (ctx && typeof ctx.get === 'function') ? ctx.get('slots') : null;
    if (!S || typeof S.register !== 'function' || typeof S.inject !== 'function') return;
    ctx.effect(() => S.inject('shell.overlay', () => S.register({
      name: 'shell.overlay',
      id: 'mc-kit',
      order: 900,
      label: () => 'MC Kit',
    }, function KitEntry() {
      if (typeof React === 'undefined') return null;
      return React.createElement(McKitPage);
    })));
  },
};

// —— 会话流演示数据（静态字面量；声明先于 McKitPage/McKitReasoningRun，任何求值时序下无 TDZ）——
// md 全要素 = interactive s-md 会话首条文案逐字（受信静态字面量，经 dangerouslySetInnerHTML
// 注入；无任何动态插值，audit §3 纪律不破）。其余分区文案一律结构化 h()，字面量无插值。
const MC_KIT_MD_HTML = `<h1>一级标题 Heading 1</h1><h2>二级标题 Heading 2</h2><h3>三级标题 Heading 3</h3><p>正文段落:经典麦金塔主题的 <strong>加粗</strong>、<em>斜体</em>、<code>行内代码 inline_code()</code>、以及一个 <a href="#" onclick="return false">超链接</a>。段与段之间有 8px 间距,长文本自动换行并保持 1.8 倍行距。</p><p>第二段:验证 p + p 的 margin-top。</p><blockquote>引用块 blockquote — 左侧 2px 淡紫竖线,文字 muted。适合放补充说明或原文摘录。</blockquote><h3>无序列表</h3><ul><li>列表项一</li><li>列表项二 <code>带行内代码</code></li><li>列表项三</li></ul><h3>有序列表</h3><ol><li>第一步:拆数</li><li>第二步:分配律</li><li>第三步:合并</li></ol><h3>代码块</h3><pre><code>function mul9(x) {
  return 9 * (x - 2) + 18; // 拆数还原
}
mul9(8); // =&gt; 72</code></pre><h3>表格</h3><table><thead><tr><th>拆法</th><th>算式</th><th>结果</th></tr></thead><tbody><tr><td>10 − 2</td><td>9×10 − 9×2</td><td>72</td></tr><tr><td>3 × 8 × 3</td><td>(9×8)×1</td><td>72</td></tr><tr><td><code>7 = 10 − 3</code></td><td>6×10 − 6×3</td><td>42</td></tr></tbody></table><p>以上覆盖 .md 支持的全部语法:h1–h3、段落、<strong>/<em>、行内 code、链接、引用、ul/ol、pre 代码块、table。</p>`;

// 推理流式正文（THINK_POOL 静态子集，三条长句量级对齐设计稿；静态字面量、无洗牌）
const MC_KIT_THINK_TXT = [
  '拆解意图:哪些约束是硬性的、哪些只是偏好,哪些信息已经给足、哪些还需要推断,这决定了回复的详略与结构',
  '组织骨架:先给结论,再给依据,最后给可选的延伸;推导链条超过三步就拆成分步列表,避免把过程铺成一大段没人读的文字',
  '收敛结论:主要判断已经过两路交叉验证,剩余的不确定性都标注了前提条件,现在可以停止思考,把结论组织成最终回复输出',
].join('\n');

// tokenize 副本（照 prototype/macintosh-interactive.html 逐行）：CJK 一字一词（无 + 号）、
// 数字/拉丁连续段为一词 → take(n) 的 n 即字符量级
function mcTokenize(s) {
  return s.match(/[\u2E80-\u9FFF\uF900-\uFFEF]|[0-9]+|[A-Za-z]+|\s|[^\s]/g) || [];
}
// —— 工具卡分区演示块（toolcard 批）：真 McToolCard 吃的 ToolCallBlock 字面量（wire 形状）——
const MC_KIT_TOOL_READ = { kind: 'tool-result', callId: 'demo-read',
  call: { name: 'read', argsRaw: '{"path":"prototype/macintosh-workspace.html","offset":1,"limit":260}' },
  isError: false, content: [{ type: 'text', text: 'L1-260 · 84.2 kB — 带行号返回 UTF-8 文本,offset/limit 分段读取。' }],
  callView: null, resultView: null, subCalls: [] };
const MC_KIT_TOOL_EDIT = { kind: 'tool-result', callId: 'demo-edit',
  call: { name: 'edit', argsRaw: '{"path":"prototype/macintosh-workspace.html"}' },
  isError: false, content: [{ type: 'text', text: '+2 −1 · .tool-head .t-name 字族落 display。' }],
  callView: null,
  resultView: { card: 'diff', diffs: [{ path: 'prototype/macintosh-workspace.html',
    oldText: 'font:600 12px/1 var(--font-ui)', newText: 'font:600 12px/1 var(--font-display)' }] },
  subCalls: [] };
const MC_KIT_TOOL_BASH = { kind: 'tool-result', callId: 'demo-bash',
  call: { name: 'bash', argsRaw: '{"command":"node verify-run.mjs verify/verify-proto-diff.js"}' },
  isError: true, error: { name: 'ToolError', code: 'exit_1' },
  content: [{ type: 'text', text: '✖ flow.tool .tool — rect dy +2.4px 超差(±1.5px)\nexit code: 1 · 148ms' }],
  callView: { card: 'terminal', title: 'node verify-run.mjs verify/verify-proto-diff.js', description: '几何差分门禁' },
  resultView: { card: 'terminal', output: '$ node verify-run.mjs\n✖ flow.tool .tool — rect dy +2.4px 超差(±1.5px)', exitCode: 1 },
  subCalls: [] };
const MC_KIT_TOOL_WEB = { kind: 'tool-result', callId: 'demo-web',
  call: { name: 'web_search', argsRaw: '{"queries":["Classic Macintosh System 7 UI 设计规范"]}' },
  isError: false, content: [{ type: 'text', text: '命中 2 条来源。' }],
  callView: null,
  resultView: { card: 'web', kind: 'search', truncated: false,
    sources: [
      { url: 'https://developer.apple.com/design/hig/', title: 'Apple HIG — System 7', snippet: '菜单栏/窗口语汇权威基准' },
      { url: 'https://guidebookgallery.org/screenshots/macos7', title: 'GUI Gallery — System 7 截图集' }] },
  subCalls: [] };
const MC_KIT_TOOL_UNKNOWN = { kind: 'tool-result', callId: 'demo-unknown',
  call: { name: 'cast_glyph_v9', argsRaw: '{"glyph":"aurum","weight":9}' },
  isError: true, error: { name: 'UnknownTool', code: 'not_found' },
  content: [{ type: 'text', text: '未知工具 · 兜底卡(名称照登 + 原始参数摘要)。' }],
  callView: null, resultView: null, subCalls: [] };
// 状态三帧循环节拍块：running(运行形,无 kind) → done → fail(同一 callId 模拟状态变迁)
const MC_KIT_TOOL_RUN = { callId: 'demo-state', name: 'job_output',
  argsRaw: '{"job_id":"pwsh-7f3a","wait":false}',
  callView: { card: 'terminal', title: 'pwsh -c long-job.ps1', description: '后台作业轮询' }, subCalls: [] };
const MC_KIT_TOOL_STATE_DONE = { kind: 'tool-result', callId: 'demo-state',
  call: { name: 'job_output', argsRaw: '{"job_id":"pwsh-7f3a","wait":false}' },
  isError: false, content: [{ type: 'text', text: 'job-2 完成 · 12.4s' }],
  callView: { card: 'terminal', title: 'pwsh -c long-job.ps1', description: '后台作业轮询' },
  resultView: { card: 'terminal', output: '$ pwsh -c long-job.ps1\nDONE in 12.4s', exitCode: 0 }, subCalls: [] };
const MC_KIT_TOOL_STATE_FAIL = { kind: 'tool-result', callId: 'demo-state',
  call: { name: 'job_output', argsRaw: '{"job_id":"pwsh-7f3a"}' },
  isError: true, error: { name: 'ToolError', code: 'exit_1' },
  content: [{ type: 'text', text: 'job 失败:exit 1' }],
  callView: { card: 'terminal', title: 'pwsh -c long-job.ps1', description: '后台作业轮询' },
  resultView: { card: 'terminal', output: '$ pwsh -c long-job.ps1\nexit 1', exitCode: 1 }, subCalls: [] };

// —— 状态三帧循环演示：running(默认展开+扫掠) → done(自动收起) → fail(红边+warning) ———
// CLOCK 1.6s 一帧；同一 callId 走真状态变迁（含 running 默认展开/落地自动收起行为）。
const MC_KIT_TOKS = mcTokenize(MC_KIT_THINK_TXT);
const MC_KIT_PER_TICK = 28; /* 一次追加 = 帧 B + 帧 A 两帧的量（设计稿同款） */

// —— 检视页根组件：window.__MC_KIT_OPEN__ 真值才渲染，关闭走本地 state 强刷 ——
// hook 纪律：全部 hook 先于 `if (!open) return null` 早退（React #310：同一 fiber 两次
// 渲染的 hook 数必须恒定 —— 旧版 runPill 系列挂在早退之后，关闭→打开翻转即崩，T8 修复）；
// 相位对齐 effect 依赖 [open]：关闭态 ref 为 null 安全跳过，翻开时元素上树后再补对相。
function McKitPage() {
  const h = React.createElement;
  const force = React.useState(0)[1];
  const open = !!(typeof window !== 'undefined' && window.__MC_KIT_OPEN__);

  // run 胶囊：挂载即向 CLOCK 对相位（负延迟），多 run 点同屏不交错
  const runPill = React.useRef(null);
  React.useEffect(function () {
    if (CLOCK && runPill.current) CLOCK.syncAnim(runPill.current);
  }, [open]);

  // 会话流分区 retry 细长条 s-dot：同款负延迟相位对齐（与宿主 SYNC 管道同参数）
  const retryDot = React.useRef(null);
  React.useEffect(function () {
    if (CLOCK && retryDot.current) CLOCK.syncAnim(retryDot.current);
  }, [open]);

  // 输入坞轮播(Task 8):kit 本地 mcDockState 状态机。hook 纪律:ref/effect 全部先于
  // `if (!open) return null` 早退(React #310,同 runPill 先例);[open] 翻转即停拍,
  // CLOCK.clear 注销未决 tick(禁裸定时器,audit §2)。
  const dockCmpRef = React.useRef(null);
  const dockSt = React.useRef({ on: false, seqIx: 0, timer: null, state: { mode: 'idle', has: false } }).current;
  React.useEffect(function () {
    if (!open && dockSt.on) dockStop();
    return function () { // 卸载兜底(关闭路径由上一行覆盖;时钟已 dispose 时 clear 无害)
      dockSt.on = false;
      if (dockSt.timer) { try { CLOCK.clear(dockSt.timer); } catch (e) { /* 无害 no-op */ } dockSt.timer = null; }
    };
  }, [open]);

  // mcfx 演示靶
  const tgtIn = React.useRef(null);
  const tgtOut = React.useRef(null);
  const tgtAcc = React.useRef(null);

  if (!open) return null;

  const close = () => {
    window.__MC_KIT_OPEN__ = false;
    force(function (n) { return n + 1; });
  };

  const doFlashIn = () => {
    const el = tgtIn.current;
    if (el) flashIn(el, function () { el.textContent = '出场后的内容 ' + new Date().getSeconds(); });
  };
  const doFlashOut = () => {
    const el = tgtOut.current;
    if (el) flashOut(el, function () { el.textContent = '已退场（再点出场复原）'; });
  };
  const doAccToggle = () => {
    const el = tgtAcc.current;
    if (el) accToggle(el, function () { el.classList.toggle('kit-folded'); });
  };

  // 菜单分区（Task 7）：真 openMenu 管道演示 —— MC_MENU_OPEN 桥由 McMenus.mount 赋值
  // （模块卸载时置 null 安全空转）。载荷取 sess 菜单；ctxData 传 null → 接线守卫
  // （w.ctxData.sess 缺席即 return）全部静默 no-op，纯演示开合/出场形态。
  const popMenu = (e) => {
    if (typeof MC_MENU_OPEN === 'function') MC_MENU_OPEN('sess', e.currentTarget, null);
  };

  // —— 输入坞分区(Task 8)——[data-mc-dock] 全形态陈列:composer 三态 / todo-acc / goal-card /
  // queue-row / ctx-ring。kit 上下文无官方镜像桥 → 不触 MC_DOCK_API/officials(桥空转守卫已保
  // 安全);轮播由上方 dockSt 本地状态机经 mcDockState 纯函数推进(CLOCK.next 400ms 栅格)。
  // DOM 照 prototype/macintosh-workspace.html L1243-1320(dock)/L1898-1959(todo-acc)/
  // L1978-1998(goal-card) 直抄换 --mc-* token;勘定差异:queue 图标 #i-px-clock(T5 勘定,
  // 非原型 #i-cl-Watch)、ctx dash 39.5 = mcCtxArc(74) 主题纯函数值(原型手写 39.6)。
  const dockStatic = function (mode, txt) { // 陈列卡 = paint() 终态直出:idle 禁用 Send / ready 可发 / busy Send 隐 Stop 接管
    const busy = mode === 'busy';
    return h('div', { className: 'composer' + (busy ? ' busy' : ''), 'data-mc-state': mode, key: mode },
      h('label', { className: 'mc-field' },
        h('textarea', { rows: '1', placeholder: 'Message the agent…', readOnly: true, defaultValue: txt })),
      h('div', { className: 'composer-bar' },
        h('span', { className: 'cb-right' },
          h('button', { type: 'button', className: 'btn sm primary', 'data-mc-send': '', hidden: busy, disabled: mode === 'idle' },
            h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-send' })), 'Send'),
          h('button', { type: 'button', className: 'btn sm danger', 'data-mc-stop': '', hidden: !busy },
            h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-stop' })), 'Stop'))));
  };
  // 轮播靶卡:React 只出 idle 骨架,dockPaint 接管 attr/类/显隐(ReasoningDemo 命令式同款)
  const dockDemoCard = h('div', { className: 'composer', 'data-mc-state': 'idle', ref: dockCmpRef },
    h('label', { className: 'mc-field' },
      h('textarea', { rows: '1', placeholder: 'Message the agent…' })),
    h('div', { className: 'composer-bar' },
      h('span', { className: 'cb-right' },
        h('button', { type: 'button', className: 'btn sm primary', 'data-mc-send': '' },
          h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-send' })), 'Send'),
        h('button', { type: 'button', className: 'btn sm danger', 'data-mc-stop': '', hidden: true },
          h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-stop' })), 'Stop'))));
  const dockTodoItems = [ // 原型 L1906-1925 直抄(2 done / 1 now / 2 todo)
    { done: true, txt: '枚举 DSH 插槽清单并映射到原型分区' },
    { done: true, txt: '详情列 Info 窗 + 设置弹窗补位' },
    { now: true, txt: '输入坞五件套 + 上下文注入四型' },
    { txt: '§7 工具卡按 DSH 目录重列(20 张)' },
    { txt: '图标库统一(Pixelarticons + 经典点缀)' },
  ];
  const dockAccClick = function (e) { // 开合 = accToggle 五拍(dock.js renderFurn 接线同款,含 tri 同转)
    const head = e.currentTarget;
    const acc = head.closest('[data-mc-todo]');
    if (!acc) return;
    accToggle(acc, function () {
      acc.classList.toggle('open');
      const tri = head.querySelector('svg.tri');
      if (tri) tri.classList.toggle('open');
    });
  };
  const dockTodoCard = function (isOpen, keyAttr) { // 原型 L1898-1927(折叠) / L1930-1959(展开) 直抄
    return h('div', { className: 'todo-acc' + (isOpen ? ' open' : ''), 'data-mc-todo': '', key: keyAttr },
      h('button', { type: 'button', className: 'todo-acc-head', onClick: dockAccClick },
        h('svg', { className: 'tri' + (isOpen ? ' open' : ''), 'aria-hidden': true }, h('use', { href: '#i-tri' })),
        h('span', { className: 'ta-title' }, 'To-Do List'),
        h('div', { className: 'todo-bar' },
          h('i', { className: 'done' }), h('i', { className: 'done' }), h('i', { className: 'now' }),
          h('i', null), h('i', null)),
        h('span', { className: 'todo-meta' }, '2/5')),
      h('div', { className: 'todo-body' },
        dockTodoItems.map(function (it) {
          return h('div', {
            className: 't-item' + (it.done ? ' done' : '') + (it.now ? ' now' : ''),
            key: it.txt,
          },
            h('span', { className: 't-box' },
              it.done ? h('svg', { viewBox: '0 0 9 8', 'aria-hidden': true }, h('use', { href: '#i-check' })) : null),
            h('span', { className: 't-txt' }, it.txt));
        })));
  };
  const dockGoalCard = function (phase, obj, acts, keyAttr) { // 原型 L1978-1998 直抄(钮组为陈列态)
    return h('div', { className: 'goal-card', 'data-phase': phase, key: keyAttr },
      h('svg', { 'aria-hidden': true }, h('use', { href: '#i-sparkle' })),
      h('span', { className: 'gc-title' }, 'Goal'),
      h('span', { className: 'gc-obj' }, obj),
      h('span', { className: 'gc-acts' },
        acts.map(function (a) {
          return h('button', { type: 'button', className: 'btn sm' + (a.d ? ' danger' : ''), key: a.t }, a.t);
        })));
  };
  const dockCtxClick = function (e) { // ctx-pop 硬切显隐(dock.js renderFurn 同款;kit 无全局互斥,再点自收)
    e.stopPropagation();
    const pop = e.currentTarget.parentNode.querySelector('[data-mc-ctxpop]');
    if (pop) pop.classList.toggle('open');
  };
  const dockCtx = h('span', { className: 'cb-anchor', 'data-mc-ctx': '' }, // 原型 L1298-1312 直抄(pct 74 静态)
    h('span', { className: 'ctx-ring', title: '上下文占用 74% · 96.2k / 130k tok', onClick: dockCtxClick },
      h('svg', { viewBox: '0 0 22 22', 'aria-hidden': true, shapeRendering: 'crispEdges' },
        h('circle', { className: 'cr-track', cx: '11', cy: '11', r: '8.5', fill: 'none', strokeWidth: '3' }),
        h('circle', {
          className: 'cr-arc', cx: '11', cy: '11', r: '8.5', fill: 'none', strokeWidth: '3',
          strokeDasharray: '39.5 53.4', transform: 'rotate(-90 11 11)',
        }))),
    h('div', { className: 'ctx-pop', 'data-mc-ctxpop': '' },
      h('div', null, h('b', null, '96.2k / 130k tok'), ' · 上下文占用 74%'),
      h('div', { className: 'ctx-line' },
        h('i', { style: { background: 'var(--mc-accent)' } }), '对话消息',
        h('span', { className: 'cl-bar' }, h('i', { style: { width: '52%', background: 'var(--mc-accent)' } })), '52%'),
      h('div', { className: 'ctx-line' },
        h('i', { style: { background: 'var(--mc-spark)' } }), '系统提示词',
        h('span', { className: 'cl-bar' }, h('i', { style: { width: '18%', background: 'var(--mc-spark)' } })), '21%'),
      h('div', { className: 'ctx-line' },
        h('i', { style: { background: 'var(--mc-muted)' } }), '工具调用',
        h('span', { className: 'cl-bar' }, h('i', { style: { width: '8%', background: 'var(--mc-muted)' } })), '17%')));

  // 轮播状态机:idle→ready(模拟打字上屏)→busy(回合跑)→idle(回合完)→清稿复位,循环
  const dockSeq = [
    { t: 'input', has: true, text: '轮播演示:模拟已输入的一段话' },
    { t: 'busy' },
    { t: 'idle' },
    { t: 'input', has: false },
  ];
  function dockPaint() { // 照 dock.js paint():data-mc-state + busy 类 + Send/Stop 显隐(disabled=!has)
    const box = dockCmpRef.current;
    if (!box) return;
    const busy = dockSt.state.mode === 'busy';
    box.setAttribute('data-mc-state', dockSt.state.mode);
    box.classList.toggle('busy', busy);
    const send = box.querySelector('[data-mc-send]');
    const stop = box.querySelector('[data-mc-stop]');
    if (busy) { stop.hidden = false; send.hidden = true; }
    else { stop.hidden = true; send.hidden = false; send.disabled = !dockSt.state.has; }
  }
  function dockStop() { // 停拍 + 复位空稿(陈列回 idle;[open] 翻转/■ 停轮播共用)
    dockSt.on = false;
    if (dockSt.timer) { try { CLOCK.clear(dockSt.timer); } catch (e) { /* 时钟已 dispose:无害 */ } dockSt.timer = null; }
    dockSt.seqIx = 0;
    dockSt.state = { mode: 'idle', has: false };
    const box = dockCmpRef.current;
    if (box) {
      const ta = box.querySelector('textarea');
      if (ta) ta.value = '';
      dockPaint();
    }
  }
  function dockTick() {
    dockSt.timer = null;
    if (!dockSt.on || !dockCmpRef.current) return; // 关闭/卸载:旧流不写(ReasoningDemo 同款守卫)
    const ev = dockSeq[dockSt.seqIx % dockSeq.length];
    dockSt.seqIx += 1;
    const ta = dockCmpRef.current.querySelector('textarea');
    if (ta && ev.text !== undefined) ta.value = ev.text; // 模拟打字上屏
    if (ta && ev.t === 'input' && !ev.has) ta.value = ''; // 复位拍清稿(dock doSend 同款)
    dockSt.state = (typeof mcDockState === 'function') ? mcDockState(dockSt.state, ev) : dockSt.state;
    dockPaint();
    dockSt.timer = CLOCK.next(dockTick, 400); // 400ms 一拍(dock 挂载轮询同栅格)
  }
  const dockCarousel = function () { // ▶/■ 切换;mcDockState/CLOCK 缺席(孤立加载)静默 no-op(popMenu 同款守卫)
    if (typeof mcDockState !== 'function' || typeof CLOCK === 'undefined' || !CLOCK) return;
    if (dockSt.on) dockStop();
    else { dockSt.on = true; dockTick(); }
    force(function (n) { return n + 1; }); // 钮标 ▶/■ 重渲
  };

  // —— 浮层分区(overlays2 批 Task 4):hero 文案读 MC_HERO_COPY shim(Task 2 出口)。
  // kit 面板内无需 observer,纯陈列(相位挂载/官方藏匿由活体 heroSync 供)。孤立加载
  // (单文件 CJS 测试域)MC_HERO_COPY 缺席 → 空 copy 降级(dock mcDockState 守卫同款)。
  // 验收裁定轮(2026-09-03):shim 改 zh/en 双语字段,标题按 locale 取值(lang 前缀 zh → zh 否则
  // en;与活体 heroSync 的 mcHeroTitle 同规);样本构图随裁定砍成窗框+mark+title 三件,无 badge/sub。
  const heroCopy = (typeof MC_HERO_COPY !== 'undefined' && MC_HERO_COPY) ? MC_HERO_COPY
    : { zh: '', en: '' };
  const heroLang = (function () {
    try {
      return (document.documentElement && document.documentElement.lang)
        || (typeof navigator !== 'undefined' && navigator.language) || '';
    } catch (e) { return ''; }
  })();
  const heroTitleText = String(heroLang).toLowerCase().indexOf('zh') === 0 ? heroCopy.zh : heroCopy.en;

  const swatches = [
    ['--mc-bg', 'bg 桌面底'], ['--mc-surface', 'surface 窗面'], ['--mc-fg', 'fg 文字'],
    ['--mc-border', 'border 描边'], ['--mc-accent', 'accent 强调'], ['--mc-spark', 'spark 次强调'],
    ['--mc-success', 'success'], ['--mc-danger', 'danger'],
  ];
  const pills = [
    ['run', '运行中'], ['done', '完成'], ['fail', '失败'], ['wait', '等待'], ['accent', '强调'],
  ];
  const icons = [
    'i-close', 'i-zoom', 'i-apple', 'i-doc', 'i-folder', 'i-suitcase', 'i-finder',
    'i-check', 'i-command', 'i-sparkle', 'i-px-plus', 'i-px-search',
  ];

  // 外层 svg 不带 viewBox：<use> 引 <symbol> 时由 symbol 自带 viewBox 缩放适配
  return h('div', { className: 'kit-scrim', onClick: close },
    h('div', {
      className: 'kit-panel', onClick: function (e) { e.stopPropagation(); },
    },
      h('div', { className: 'kit-titlebar' }, h('span', { className: 'kit-title' }, 'MC Kit — 检视页')),
      h('div', { className: 'kit-body' },
        // (a) tokens 色板
        h('section', null,
          h('h3', { className: 'kit-h' }, 'Tokens 色板'),
          h('div', { className: 'kit-grid' },
            swatches.map(function (s) {
              return h('span', { className: 'kit-chip', key: s[0] },
                h('span', { className: 'kit-swatch', style: { background: 'var(' + s[0] + ')' } }),
                esc(s[1]));
            }))),
        // (b) 基础原语五态
        h('section', null,
          h('h3', { className: 'kit-h' }, '基础原语'),
          h('div', { className: 'kit-row' },
            h('div', { className: 'kit-cell' }, h('button', { className: 'mc-btn' }, '默认')),
            h('div', { className: 'kit-cell' }, h('button', { className: 'mc-btn primary' }, 'Primary')),
            h('div', { className: 'kit-cell' }, h('button', { className: 'mc-btn danger' }, 'Danger')),
            h('div', { className: 'kit-cell' }, h('button', { className: 'mc-btn', disabled: true }, '禁用')),
            h('span', { className: 'kit-note' }, '按住看 :active 反色（无 hover / 无过渡）')),
          h('div', { className: 'kit-row' },
            pills.map(function (p) {
              return h('span', {
                className: 'mc-pill ' + p[0],
                key: p[0],
                ref: p[0] === 'run' ? runPill : null,
              }, esc(p[1]));
            })),
          h('div', { className: 'kit-row' },
            h('div', { className: 'kit-cell kit-field' },
              h('div', { className: 'mc-field' },
                h('input', { placeholder: 'mc-field 聚焦看 accent 外环' }))),
            h('div', { className: 'kit-cell' },
              h('span', { className: 'kit-note' }, 'mc-tri：'),
              h('svg', { className: 'mc-tri' }, h('use', { href: '#i-tri' })),
              h('svg', { className: 'mc-tri open' }, h('use', { href: '#i-tri' }))))),
        // (c) mcfx 闪烁演示
        h('section', null,
          h('h3', { className: 'kit-h' }, 'mcfx 闪烁演示'),
          h('div', { className: 'kit-demo' },
            h('button', { className: 'mc-btn', onClick: doFlashIn }, 'flashIn'),
            h('span', { className: 'kit-demo-target', ref: tgtIn }, '出场演示靶'),
            h('button', { className: 'mc-btn', onClick: doFlashOut }, 'flashOut'),
            h('span', { className: 'kit-demo-target', ref: tgtOut }, '退场演示靶'),
            h('button', { className: 'mc-btn', onClick: doAccToggle }, 'accToggle'),
            h('span', { className: 'kit-demo-target', ref: tgtAcc }, '开合演示靶'))),
        // (d) sprite 图标墙
        h('section', null,
          h('h3', { className: 'kit-h' }, 'Sprite 图标墙'),
          h('div', { className: 'kit-iconwall' },
            icons.map(function (id) {
              return h('div', { className: 'kit-icell', key: id },
                h('svg', null, h('use', { href: '#' + id })),
                h('span', { className: 'kit-ilabel' }, esc(id)));
            }))),
        // (e) 会话流分区（Ruling 3：原型 §5 类 scoped 定义 + 五帧流式演示；
        //     DOM 照 prototype/macintosh-workspace.html §5 kit-band L1760-1840 直抄，
        //     文案为演示字面量；md 全要素区走受信静态字面量 dangerouslySetInnerHTML）
        h('section', null,
          h('h3', { className: 'kit-h' }, '会话流'),
          h('div', { className: 'kit-frames' },
            // md 全要素
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, 'md 全要素 · h1–h3 / 段落 / 加粗斜体 / 行内 code / 链接 / 引用 / ul / ol / pre / table'),
                h('em', null, 'md')),
              h('div', { className: 'kit-frame-body' },
                h('div', { className: 'md', dangerouslySetInnerHTML: { __html: MC_KIT_MD_HTML } }))),
            // 用户消息 · 含图片附件
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '用户消息 · 含图片附件'),
                h('em', null, 'msg-user')),
              h('div', { className: 'kit-frame-body' },
                h('div', { className: 'msg user' },
                  h('div', { className: 'attach' },
                    h('span', { className: 'ph' }),
                    h('span', { className: 'cap' }, '截图:Finder 里手动验证 9×8 = 72 的便签一张,很长的说明文本用来验证多行换行形态。')),
                  h('div', { className: 'bubble' }, '顺便把这张桌面截图也存进会话记录里喵。')))),
            // 上下文注入 · 细长条四型
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '上下文注入 · 细长条四型（system-reminder / 运行时上下文 / 压缩 checkpoint / 技能内容）'),
                h('em', null, 'inject')),
              h('div', { className: 'kit-frame-body' },
                h('div', { className: 'kit-injects' },
                  h('div', { className: 'inject' },
                    h('svg', { 'aria-hidden': true }, h('use', { href: '#i-doc' })),
                    h('span', { className: 'i-tt' }, '上下文注入 <system-reminder> — 可用技能目录变更:grilling 已移除,brainstorming 已加入(完整目录见 system prompt)')),
                  h('div', { className: 'inject' },
                    h('svg', { 'aria-hidden': true }, h('use', { href: '#i-doc' })),
                    h('span', { className: 'i-tt' }, '上下文注入 Current runtime context — file policy: danger-full-access;approval prompts disabled;目标 round 2/6')),
                  h('div', { className: 'inject' },
                    h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-copy' })),
                    h('span', { className: 'i-tt' }, '压缩 checkpoint — 会话前段已压缩:菜单栏/图标库/输入坞五件套决策保留,逐 token 流式细节折叠(96.2k → 12.4k tok)')),
                  h('div', { className: 'inject' },
                    h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-attach' })),
                    h('span', { className: 'i-tt' }, '技能内容注入 <skill_content> brainstorming — 探索意图/需求/设计后再实现,禁止跳过直接动手…'))))),
            // 推理卡 · 五帧流式 vs 完成（ReasoningDemo 组件自带控制钮）
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '推理卡 · 五帧流式（帧 B 白块 → 帧 A 揭开 → 顿拍 ×3） vs 完成'),
                h('em', null, 'reasoning')),
              h('div', { className: 'kit-frame-body' },
                h(McKitReasoningRun, null))),
            // 自动重试行 / 上限行 / 回合尾部
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '自动重试行 / 上限行 / 回合尾部'),
                h('em', null, 'rows')),
              h('div', { className: 'kit-frame-body kit-stack sm' },
                h('div', { className: 'retry-row' },
                  h('i', { className: 's-dot', ref: retryDot }),
                  h('span', null, '自动重试第 2/3 次 · 等待上游恢复(5s 后发起)')),
                h('div', { className: 'cap-row' },
                  h('svg', { className: 'tri', 'aria-hidden': true }, h('use', { href: '#i-tri' })),
                  h('span', null, '已到单回合步数上限(50 steps)— 继续请发送「继续」')),
                h('div', { className: 'turn-tail' },
                  h('button', { className: 'icon-btn sm', type: 'button', title: '复制' },
                    h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-copy' }))),
                  h('button', { className: 'icon-btn sm', type: 'button', title: '重发' },
                    h('svg', { viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-reload' }))),
                  h('span', { className: 't-stats' }, '8.9s · token 1.9s · 83 tok/s')))))),
        // (f) 弹出菜单分区（Task 7）：静态陈列 .mc-menu 全形态 + 真 openMenu 管道演示。
        //     DOM 照 prototype/macintosh-workspace.html L2485-2507 直抄换 mc- 前缀
        //     （span 陈列态；#i-px-list 不在 sprite → 按时间排序按 T5 勘定用 #i-px-clock）
        h('section', null,
          h('h3', { className: 'kit-h' }, '弹出菜单'),
          h('div', { className: 'kit-frames' },
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '通用菜单 · m-group / 常规项 / danger 项 / m-sep / on 选中态'),
                h('em', null, 'menu')),
              h('div', { className: 'kit-frame-body kit-menustatic' },
                h('div', { className: 'mc-menu' },
                  h('span', { className: 'm-group' }, '会话'),
                  h('span', { className: 'm-opt' },
                    h('svg', { className: 'mo-ic', viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-plus' })), '新建会话'),
                  h('span', { className: 'm-opt' },
                    h('svg', { className: 'mo-ic', viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-edit' })), '重命名'),
                  h('span', { className: 'm-sep' }),
                  h('span', { className: 'm-group' }, '视图'),
                  h('span', { className: 'm-opt on' },
                    h('svg', { className: 'mo-ic', viewBox: '0 0 11 9', 'aria-hidden': true }, h('use', { href: '#i-folder' })), '按工作区分组'),
                  h('span', { className: 'm-opt' },
                    h('svg', { className: 'mo-ic', viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-clock' })), '按时间排序'),
                  h('span', { className: 'm-sep' }),
                  h('span', { className: 'm-opt danger' },
                    h('svg', { className: 'mo-ic', viewBox: '0 0 24 24', 'aria-hidden': true }, h('use', { href: '#i-px-trash' })), '删除会话')))),
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '弹出演示 · flashIn 出场 / 外点关 / Esc / :active 反色'),
                h('em', null, 'openMenu')),
              h('div', { className: 'kit-frame-body' },
                h('div', { className: 'kit-demo' },
                  h('button', { className: 'mc-btn', type: 'button', onClick: popMenu }, '▶ 弹出菜单(闪烁出场)'),
                  h('span', { className: 'kit-note' }, '演示载荷 = sess 菜单；ctxData 为空 → 接线守卫静默 no-op')))))),
        // (g) 输入坞分区(Task 8):[data-mc-dock] 全形态陈列。dock CSS 全部 scoped 到 [data-mc-dock],
        //     样本各包一层 div[data-mc-dock] 复用原语(kit-dockwrap 限宽);composer 三态 + 轮播走
        //     kit 本地 mcDockState 状态机(无镜像桥,不触 MC_DOCK_API);轮播延时全走 CLOCK.next。
        h('section', null,
          h('h3', { className: 'kit-h' }, '输入坞'),
          h('div', { className: 'kit-frames' },
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, 'composer 三态 · idle(禁用 Send)/ ready(可发)/ busy(Stop 接管)· 轮播 = kit 本地 mcDockState 状态机(无镜像桥)'),
                h('em', null, 'dock·composer')),
              h('div', { className: 'kit-frame-body kit-stack sm' },
                h('div', { className: 'kit-dockwrap', 'data-mc-dock': '' },
                  dockStatic('idle', ''),
                  dockStatic('ready', '把输入坞的浅色形态也核一遍'),
                  dockStatic('busy', '回合运行中 — busy 仍可打字,发送权归 Stop'),
                  dockDemoCard),
                h('div', { className: 'kit-demo' },
                  h('button', { className: 'mc-btn', type: 'button', onClick: dockCarousel },
                    dockSt.on ? '■ 停轮播' : '▶ 三态轮播'),
                  h('span', { className: 'kit-note' }, '400ms 一拍 · CLOCK.next 栅格 · idle→ready→busy→idle 循环')))),
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '家具 · queue-row / todo-acc 折叠+展开(点头开合)/ goal-card active+blocked —— dock2 批:goal 动作钮镜像官方 GoalBar,官方槽整条藏匿;本区为静态样本'),
                h('em', null, 'dock·furn')),
              h('div', { className: 'kit-frame-body' },
                h('div', { className: 'kit-dockwrap', 'data-mc-dock': '' },
                  h('div', { className: 'queue-row' },
                    h('svg', { 'aria-hidden': true }, h('use', { href: '#i-px-clock' })),
                    '队列中还有 2 条消息 — 第一条:继续验证 7×6 的拆数过程'),
                  dockTodoCard(false, 'folded'),
                  dockTodoCard(true, 'open'),
                  dockGoalCard('active', '完成 MACINTOSH 主题原型十分区(插槽映射 / 详情列 / 输入坞五件套 / 工具卡目录 / 图标统一 / 响应式)',
                    [{ t: 'Pause' }, { t: 'Edit' }, { t: 'Delete', d: true }], 'ga'),
                  dockGoalCard('blocked', '展示用目标:保持 active 供 GUI 查看 — round-limit,等待人工处理',
                    [{ t: 'Edit' }, { t: 'Delete', d: true }], 'gb')))),
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, 'ctx 圆环 + pop · pct 74 静态示意(dash 39.5 53.4 = mcCtxArc(74);>80% 转 data-hot danger;点 ring 展开)'),
                h('em', null, 'dock·ctx')),
              h('div', { className: 'kit-frame-body' },
                h('div', { className: 'kit-dockctx', 'data-mc-dock': '' },
                  h('div', { className: 'composer-bar' },
                    h('span', { className: 'cb-right' }, dockCtx))))))),
        // (h) 浮层分区(overlays2 批 Task 4):hero 空态静态陈列 + dialog 控件样本 + 注记行。
        //     hero 直接复用全局原语构图(真类真样式;标题读 MC_HERO_COPY 按 locale 取值,kit 面板内
        //     无 observer 纯陈列——相位挂载/官方藏匿由活体 heroSync 供:body observer +
        //     own gate html[data-mc-hero]);验收裁定轮构图=窗框(.mc-hero-tb,sprite 方块)+mark+title
        //     三件(badge/sub 已裁);裁定轮 2(R10)=mark‖title 横排成对居中(.mc-hero column→row,
        //     CSS 一处即 kit 样本随链生效);dialog 控件样本 = §C dlg 皮规格的 .mc-dlg-demo
        //     kit 局部复刻,自有类零官方属性(audit 宿主扫描零接触);switch 样本随 Task 3
        //     勘定裁除(官方 settings 面板 0 switch,不渲染官方没有的结构——控制器裁定 1)。
        h('section', null,
          h('h3', { className: 'kit-h' }, '浮层'),
          h('div', { className: 'kit-frames' },
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, 'hero 空态 · 窗框标题栏+HappyMac mark‖标题横排成对居中(裁定轮2 R10;badge/sub 裁除,标题随 locale zh/en)· 活体挂 flowScroll 首+窗框挂 heroRoot 首,官方空态与 hero 晕经自有门控属性藏匿'),
                h('em', null, 'hero')),
              h('div', { className: 'kit-frame-body' },
                h('div', { className: 'mc-hero-tb' },
                  h('span', { className: 'mc-tb-title' }, 'DeepSeek Harness'),
                  h('button', { type: 'button', className: 'mc-tbx cl', 'aria-label': '关闭（装饰）', title: '关闭', tabIndex: -1 },
                    h('svg', { 'aria-hidden': true }, h('use', { href: '#i-close' }))),
                  h('button', { type: 'button', className: 'mc-tbx zm', 'aria-label': '缩放（装饰）', title: '缩放', tabIndex: -1 },
                    h('svg', { 'aria-hidden': true }, h('use', { href: '#i-zoom' })))),
                h('div', { className: 'mc-hero' },
                  h('svg', { className: 'mh-mark', 'aria-hidden': true }, h('use', { href: '#i-cl-HappyMac' })),
                  h('div', { className: 'mh-title' }, heroTitleText)))),
            h('div', { className: 'kit-frame' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, 'dialog 控件样本 · §C 皮规格直抄(方角钮/输入域/发丝分隔线)· 活体=官方弹窗纯 CSS 存在门控换皮,零 JS 门控'),
                h('em', null, 'dlg')),
              h('div', { className: 'kit-frame-body' },
                h('div', { className: 'mc-dlg-demo' },
                  h('div', { className: 'kit-row' },
                    h('button', { type: 'button' }, '确认'),
                    h('button', { type: 'button' }, '取消')),
                  h('input', { placeholder: '输入域 · 直角 1px 边', readOnly: true }),
                  h('div', { className: 'dd-sep' }),
                  h('span', { className: 'kit-note' }, 'toast 不做裁定(spec §0 范围外);switch 样本随 Task 3 勘定裁除(官方面板 0 switch)'))))),
          h('div', { className: 'kit-row' },
            h('span', { className: 'kit-note' }, '门控差异注记:dialog/scrim 皮 = head 常驻 style 标签纯 CSS 存在门控(官方自开自关,JS 门控不可靠);hero = body observer 相位同步 + 自有门控属性置/撤;dock = JS 置撤属性门控 — 存在门控与 JS 门控异构,不混用。'))),
        // (h2) 响应式分区（responsive 批）：汉堡/遮罩/抽屉静态样本（真显隐门控在窄窗活体验）。
        h('section', null,
          h('h3', { className: 'kit-h' }, '响应式'),
          h('div', { className: 'kit-frames' },
            h('div', { className: 'kit-frame', key: 'burger' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '汉堡方块 · 窗框左端首子（hero/main 两态共用 #i-px-menu）—— ≤1023 显形（对齐宿主折叠断点，实测 1024 展/1000 收）'),
                h('em', null, 'resp')),
              h('div', { className: 'kit-frame-body' },
                h('button', { type: 'button', className: 'mc-tbx mc-burger', 'aria-label': '汉堡（样本）', style: { display: 'flex' } },
                  h('svg', { 'aria-hidden': true }, h('use', { href: '#i-px-menu' }))))),
            h('div', { className: 'kit-frame', key: 'mask' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '抽屉遮罩 · 点阵幕 z:75 压抽屉 60、窗框 76 盖之；显隐全 CSS（:has 官方 data-sidebar-collapsed 派生，零 JS 状态）；浅色反转'),
                h('em', null, 'resp')),
              h('div', { className: 'kit-frame-body' },
                h('div', { style: { position: 'relative', height: '64px' } },
                  h('div', { className: 'mc-mask', style: { display: 'block', position: 'absolute', top: '0', right: '0', bottom: '0', left: '0' } })))),
            h('div', { className: 'kit-frame', key: 'drawer' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '抽屉形态 · 官方侧栏展开态挤占式在场（壳提层 z:60，遮罩 z:50 盖主列，窗框 76 恒可点；不脱流不压轨——grid 自动放置实证 fixed 化会错位）—— 树 DOM 宿主挂载、Finder 皮自动生效，零克隆'),
                h('em', null, 'resp')),
              h('div', { className: 'kit-frame-body' },
                h('div', { className: 'kit-resp-drawer' },
                  h('div', { className: 'kit-resp-drawer-tb' }, 'Sessions'),
                  ['dsh-theme-macintosh', 'dsh-theme-aurum', 'dsh-plugins'].map(function (n) {
                    return h('div', { className: 'kit-resp-drawer-row', key: n }, n);
                  })))),
            h('div', { className: 'kit-frame', key: 'bp' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '断点表 · ≤1023 结构（汉堡+抽屉+遮罩）/ ≤640 密度（flow 12 + 气泡满宽）/ ≤480 极窄（dock 8 + 设置 nav 52px 图标列）；mode 钮/统计条隐藏无 DSH 对应物记因不做；safe-area 不做（桌面 GUI）'),
                h('em', null, 'resp')),
              h('div', { className: 'kit-frame-body' },
                h('div', { className: 'kit-note' }, '原型 §12 转译：结构档断点 820 → 1023（宿主折叠实测）；硬切无 transition；抽屉=官方展开通道 overlay 化（tclose 同通道，零克隆）'))))),
        // (h3) 问题卡分区（ask 批）：换皮静态样本（自有演示类 .kit-ask-*;真卡=官方 DOM+McAsk CSS
        // 运行时换皮,零 JS 接管——官方 React 受控分页/跳过/折叠/作答原样保留,活体验收）。
        h('section', null,
          h('h3', { className: 'kit-h' }, '问题卡'),
          h('div', { className: 'kit-frames' },
            h('div', { className: 'kit-frame', key: 'ask' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '问题卡 · 窗框直角+pop 投影/单选选中整行反色(fg 底 surface 字,最 System 7)/多选方框整底 i-chk-on/自由输入 surface-2 场/pagination 翻页 18×18——单选隐数字为裁定项(备选:数字进方框,活体拍板)'),
                h('em', null, 'ask')),
              h('div', { className: 'kit-frame-body' },
                h('div', { className: 'kit-ask-card' },
                  h('div', { className: 'kit-ask-cap' }, 'QUESTION'),
                  h('h4', { className: 'kit-ask-tt' }, '探针:主题 ask 卡勘定'),
                  h('button', { type: 'button', className: 'kit-ask-opt rdo on' }, 'A 勘定正常(推荐)'),
                  h('button', { type: 'button', className: 'kit-ask-opt rdo' }, 'B 需要重试'),
                  h('button', { type: 'button', className: 'kit-ask-opt on' },
                    h('span', { className: 'kit-ask-chk', 'aria-hidden': 'true' }), '多选:回滚预案'),
                  h('button', { type: 'button', className: 'kit-ask-opt' },
                    h('span', { className: 'kit-ask-chk', 'aria-hidden': 'true' }), '多选:灰度发布'),
                  h('div', { className: 'kit-ask-field' },
                    h('textarea', { rows: '2', placeholder: '自定义回答…' })),
                  h('div', { className: 'kit-ask-foot' },
                    h('button', { type: 'button', className: 'kit-ask-nav prev', 'aria-label': '上一题(样本)', disabled: true }),
                    h('button', { type: 'button', className: 'kit-ask-nav', 'aria-label': '下一题(样本)' }),
                    h('span', { className: 'kit-ask-progress' }, '1 / 2'))))),
            h('div', { className: 'kit-frame', key: 'plan' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '计划审批卡 · 同槽同包双卡之二——警示条 warn 底 bg-deep 像素字/正文滚动区基础 md 皮/审批三钮走共享 btn 键(primary=fg 底 surface 字)/「去聊天里说」幽灵化'),
                h('em', null, 'ask·plan')),
              h('div', { className: 'kit-frame-body' },
                h('div', { className: 'kit-ask-card' },
                  h('div', { className: 'kit-ask-cap' }, 'PLAN REVIEW'),
                  h('div', { className: 'kit-ask-strip' },
                    h('span', { className: 'kit-ask-dot', 'aria-hidden': 'true' }), '计划将改动 3 个文件,退出前请审批'),
                  h('div', { className: 'kit-ask-plan' }, '1. map.js 追加 ask 段键组\n2. 实装 src/conv/ask.js(纯 CSS)\n3. verify-ask 自治门禁'),
                  h('div', { className: 'kit-ask-foot' },
                    h('button', { type: 'button', className: 'kit-ask-ghost' }, '去聊天里说'),
                    h('button', { type: 'button', className: 'kit-ask-btn' }, '拒绝'),
                    h('button', { type: 'button', className: 'kit-ask-btn primary' }, '批准'))))),
            h('div', { className: 'kit-frame', key: 'gate' },
              h('div', { className: 'kit-frame-tag' },
                h('span', null, '藏坞门控 · pending 时问卡 frame 渲染于 composerSeat 内部(probe:seatContainsFrame=true),自绘坞同框共存→:has 问卡锚 纯 CSS 藏坞零 JS,作答后坞自动归位(F.settled dockBack:true 实证)'),
                h('em', null, 'ask·gate')),
              h('div', { className: 'kit-frame-body' },
                h('div', { className: 'kit-note' }, '门控形态:存在门控(CSS :has 派生)——与 hero(:has 相位)/dialog(head 常驻)同族;锚点三层=stable data-*/aria 前缀(i18n DRIFT-RISK)/primitives 哈希子串,记因见 component-dev-notes §12.5'))))),
        // (g) 工具卡分区（toolcard 批）：MC_TOOL_DEMO 桥真卡渲染（primitives 缺席 → 降级说明）
        h('section', null,
          h('h3', { className: 'kit-h' }, '工具卡'),
          h('div', { className: 'kit-frames' },
            MC_TOOL_DEMO ? [
              h('div', { className: 'kit-frame', key: 'samples' },
                h('div', { className: 'kit-frame-tag' },
                  h('span', null, '样本 · read 文本体 / edit diff 体 / bash 终端体(fail 红边) / web_search 引用体 / 未知工具 Sparkle 兜底 —— 图标 = DSH 默认工具图标像素渲染(用户裁定 2026-09-02 二轮)'),
                  h('em', null, 'tool')),
                h('div', { className: 'kit-frame-body kit-stack sm' },
                  MC_TOOL_DEMO.card(MC_KIT_TOOL_READ),
                  MC_TOOL_DEMO.card(MC_KIT_TOOL_EDIT),
                  MC_TOOL_DEMO.card(MC_KIT_TOOL_BASH),
                  MC_TOOL_DEMO.card(MC_KIT_TOOL_WEB),
                  MC_TOOL_DEMO.card(MC_KIT_TOOL_UNKNOWN))),
              h('div', { className: 'kit-frame', key: 'states' },
                h('div', { className: 'kit-frame-tag' },
                  h('span', null, '状态三帧循环 · running(琥珀扫掠) → done → fail(红边+warning 图标) — CLOCK 1.6s 一帧;首登场一律折叠,落地不改折叠态(用户裁定 2026-09-02)'),
                  h('em', null, 'tool·state')),
                h('div', { className: 'kit-frame-body' },
                  h(McKitToolStates, null))),
            ] : [
              h('div', { className: 'kit-frame', key: 'na' },
                h('div', { className: 'kit-frame-tag' }, h('span', null, '工具卡'), h('em', null, 'tool')),
                h('div', { className: 'kit-frame-body' },
                  h('div', { className: 'kit-note' }, 'McTool 未装配（primitives 缺席）— 宿主原生工具卡渲染中。'))),
            ])))));

function McKitToolStates() {
  const h = React.createElement;
  const ixV = React.useState(0);
  const ix = ixV[0], setIx = ixV[1];
  React.useEffect(function () {
    if (!CLOCK || typeof CLOCK.next !== 'function') return undefined;
    let timer = null; let n = 0;
    const tick = function () { n = (n + 1) % 3; setIx(n); timer = CLOCK.next(tick, 1600); };
    timer = CLOCK.next(tick, 1600);
    return function () { if (timer) { try { CLOCK.clear(timer); } catch (e) {} } };
  }, []);
  const seq = [MC_KIT_TOOL_RUN, MC_KIT_TOOL_STATE_DONE, MC_KIT_TOOL_STATE_FAIL];
  return MC_TOOL_DEMO.card(seq[ix]);
}

// —— ReasoningDemo：推理卡五帧流式演示（§8.2 状态机 kit 化）——
// 五帧一周期 500ms：帧 B（t+0）追加 span.cover + 标题换字挂 flash → 帧 A（t+100）合并进
// 持久文本节点 + 撤 cover → 空 ×3 顿拍。一切延时走 CLOCK.next（禁裸定时器）；组件卸载 /
// 关闭 kit / 重开演示均停流（CLOCK clear）。DOM 命令式照原型逐行，组件零 state 重渲，
// React 只负责静态骨架 —— r-txt 内的文本节点与 cover 由状态机独占管理。
function McKitReasoningRun() {
  const h = React.createElement;
  const cardRef = React.useRef(null);
  const triRef = React.useRef(null);  // 标题行 tri（开合态）
  const sumRef = React.useRef(null);  // .s-in 摘要行（帧 B 换字挂 flash）
  const txtRef = React.useRef(null);  // .r-txt（持久文本节点 T + cover 白块）
  const durRef = React.useRef(null);  // .r-dur（streaming → 实际秒）
  const st = React.useRef({
    running: false, timer: null, T: null, blk: null, pos: 0, pause: 0, card: null,
  }).current;

  function stopTimer() {
    if (st.timer) {
      try { CLOCK.clear(st.timer); } catch (e) { /* 时钟已 dispose：无害 no-op */ }
      st.timer = null;
    }
  }
  function take(n) { /* 顺序取 token：取尽返回空串（照原型） */
    var out = '';
    for (var j = 0; j < n && st.pos < MC_KIT_TOKS.length; j++, st.pos++) out += MC_KIT_TOKS[st.pos];
    return out;
  }
  function tick() {
    if (!st.running || st.card !== cardRef.current) return; /* 卸载/重开后旧流不写 */
    var txt = txtRef.current, sum = sumRef.current;
    if (!txt || !sum) return;
    if (st.pause > 0) {                        /* 帧 C/D/E：连续空帧，追加间顿三拍 */
      st.pause--;
    } else if (st.blk) {                       /* 帧 A（t+100）：白块消失，揭开成文字 */
      st.T.data = st.T.data + st.blk.textContent; /* 合并进持久文本节点（勿 innerHTML 重建） */
      st.blk.remove(); st.blk = null;
      sum.classList.remove('flash');           /* 标题栏白块同步消失 */
      if (st.pos >= MC_KIT_TOKS.length) {      /* 取尽：停拍挂 run 态，等「■ 收尾」信号 */
        st.running = false;
        return;
      }
      st.pause = 3;
    } else {                                   /* 帧 B（t+0）：白块出现（追加占位，不显字） */
      var nxt = take(MC_KIT_PER_TICK);
      if (nxt) {
        var blk = document.createElement('span');
        blk.className = 'cover';
        blk.textContent = nxt;
        txt.appendChild(blk);
        st.blk = blk;
        var flat = nxt.replace(/\n/g, ' ');    /* 标题栏：换行折叠空格，超 44 字掐头留尾 */
        sum.textContent = flat.length > 44 ? '…' + flat.slice(-44) : flat;
        sum.classList.add('flash');
      }
    }
    st.timer = CLOCK.next(tick, 100);          /* 每 tick 一格；五帧合计一周期 500ms */
  }
  function startStream() { /* 「▶ 播放流式」：重开演示从头流（复位全部帧状态） */
    var card = cardRef.current, txt = txtRef.current, sum = sumRef.current;
    if (!card || !txt || !sum || typeof CLOCK === 'undefined' || !CLOCK) return;
    stopTimer();
    st.pos = 0; st.pause = 0; st.blk = null;
    st.running = true; st.card = card;
    card.classList.add('run', 'open');
    if (triRef.current) triRef.current.classList.add('open');
    sum.classList.remove('flash');
    sum.textContent = '正在思考…';
    if (durRef.current) durRef.current.textContent = 'streaming';
    txt.textContent = '';                      /* 清上轮残余（含未收尾的 cover） */
    st.T = document.createTextNode('');
    txt.appendChild(st.T);
    st.timer = CLOCK.next(tick, 200);          /* 起拍 200ms（照原型） */
  }
  function finishStream() { /* 「■ 收尾」：finishThinking 语义（摘前 26 字 / r-dur 定格 / 撤 run） */
    var card = cardRef.current, sum = sumRef.current;
    if (!card || !sum || !st.card) return;     /* 未开过流：无收尾对象 */
    stopTimer();
    st.running = false;
    if (st.blk && st.T) {                      /* 在途 cover 先按帧 A 合并（hideThinking「等帧 A」） */
      st.T.data = st.T.data + st.blk.textContent;
      st.blk.remove(); st.blk = null;
    }
    var full = st.T ? st.T.data : '';
    card.classList.remove('run', 'open');      /* 摘 run：琥珀染与 cover 白块规则一并失效 */
    if (triRef.current) triRef.current.classList.remove('open');
    sum.classList.remove('flash');
    sum.textContent = full.length > 26 ? full.slice(0, 26) + '…' : full; /* 摘正文前 26 字 */
    if (durRef.current) durRef.current.textContent = '1.8s';             /* 演示定值（原型 r-dur 位） */
  }
  // 卸载 / 关闭 kit：停流（未决 tick 经 CLOCK.clear 注销，不再分发）
  React.useEffect(function () {
    return function () { st.running = false; stopTimer(); };
  }, []);

  // 点标题行：accToggle 五拍开合（照原型 accToggle 通道；与宿主 think 卡同款）
  function accCard(card) {
    if (!card) return;
    accToggle(card, function () {
      card.classList.toggle('open');
      var tri = card.querySelector('.tri');
      if (tri) tri.classList.toggle('open');
    });
  }

  const doneRef = React.useRef(null); // 完成帧卡（收合态）

  return h('div', { className: 'kit-stack' },
    h('div', { className: 'kit-row' },
      h('button', { className: 'mc-btn', type: 'button', onClick: startStream }, '▶ 播放流式'),
      h('button', { className: 'mc-btn', type: 'button', onClick: finishStream }, '■ 收尾'),
      h('span', { className: 'kit-note' }, '五帧一周期 500ms · PER_TICK=28 · CLOCK 100ms 栅格驱动')),
    // 运行帧（reasoning.run.open：流式靶卡）
    h('div', { className: 'reasoning run open', ref: cardRef },
      h('button', { className: 'reasoning-head', type: 'button', onClick: function () { accCard(cardRef.current); } },
        h('svg', { className: 'tri open', ref: triRef, 'aria-hidden': true }, h('use', { href: '#i-tri' })),
        h('span', { className: 'r-tag' }, 'Think'),
        h('span', { className: 'r-sum' }, h('span', { className: 's-in', ref: sumRef }, '待机 — 点「▶ 播放流式」')),
        h('span', { className: 'r-dur', ref: durRef }, 'streaming')),
      h('div', { className: 'reasoning-body' },
        h('div', { className: 'r-txt', ref: txtRef }))),
    // 完成帧（收合态定格，对照 workspace L1815-1824）
    h('div', { className: 'reasoning', ref: doneRef },
      h('button', { className: 'reasoning-head', type: 'button', onClick: function () { accCard(doneRef.current); } },
        h('svg', { className: 'tri', 'aria-hidden': true }, h('use', { href: '#i-tri' })),
        h('span', { className: 'r-tag' }, 'Think'),
        h('span', { className: 'r-sum' }, h('span', { className: 's-in' }, '已收敛:两种拆法互相验证 42。收合态。')),
        h('span', { className: 'r-dur' }, '1.8s')),
      h('div', { className: 'reasoning-body' },
        h('div', { className: 'r-txt' }, '收合态正文(窗口高度过渡露出)。'))));
}
}
