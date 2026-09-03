// src/conv/ask.js —— 层3 模块11：问题卡/审批卡换皮（ask 批,交接档 2026-09-03-macintosh-theme-ask.md）
// 路线 = 换皮不重建（§0 裁定）：官方卡 React 受控 + wire boundary（PendingQuestion.answer/cancel →
// wait.respond），自绘接管零收益且脆——分页/跳过/折叠/作答全部官方行为原样保留,本批纯 CSS 零 JS。
// 关键勘定（probe-ask.mjs v3 自治探针 ALL GREEN）：双卡同槽链 conversation.composer,pending 时
// 官方卡仍挂载、自绘坞同框共存（seatContainsFrame=true）→ 藏坞门控纯 CSS :has,作答后坞自动归位。
// 纪律：本文件在 audit check5 无豁免 → 零宿主选择器字面量,全部经 MC_MAP 键名运行时拼接
// （mask data-URI 与 [data-mc-dock] 自有命名空间不入 token）;无 :hover、无 transition、无定时器。
// 皮配方对齐 overlays dialog 窗框（§2 定案,用户口头批准）：surface 底/1px 边/直角/pop 投影 +
// C * 全域压平;单选选中整行反色（fg 底 surface 字,最 System 7）;状态钩子带引号形态
// [aria-checked="true"]（与 dock 段无引号形态 deliberate 区分,避免 DOCK_WHITELIST 纠缠）。
// —— mask data-URI 帮手（sidebar.js 内联先例函数化;silhouette only,fill 恒黑）——
function mcAskPath(d, eo) {
  return "%3Cpath d='" + d + "' fill='black'" + (eo ? " fill-rule='evenodd'" : '') + "/%3E";
}
function mcAskUri(inner, w, h) {
  return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 " + w + ' ' + h + "'%3E" + inner + "%3C/svg%3E\") center/contain no-repeat";
}
// 像素字形 d 常量（silhouette;ring/chk 取 sprite i-rdo*/i-chk-on 同源路径,tri/caret 为其右指剪影）
var ASK_TRI_D = 'M0 0h1v1h1v1h1v1h1v1h1v1h1v1h-1v1h-1v1h-1v1h-1v1h-1v1H0z'; // 右指像素三角(viewBox 6×11;折叠钮展开态 rotate(90) 指下/prev scaleX(-1) 指左)
var ASK_RDO_D = 'M8 0H4V1H2V2H1V4H0V8H1V10H2V11H4V12H8V11H10V10H11V8H12V4H11V2H10V1H8V0ZM8 1V2H10V4H11V8H10V10H8V11H4V10H2V8H1V4H2V2H4V1H8Z'; // 像素环(evenodd 挖孔)
var ASK_RDO_ON_D = ASK_RDO_D + 'M8 3H4V4H3V8H4V9H8V8H9V4H8V3Z'; // 环+心(evenodd 三层:外1孔0心1)
var ASK_CHK_D = 'M1 1H2V2H1V1ZM3 3H2V2H3V3ZM4 4H3V3H4V4ZM5 5H4V4H5V5ZM7 5H5V7H4V8H3V9H2V10H1V11H2V10H3V9H4V8H5V7H7V8H8V9H9V10H10V11H11V10H10V9H9V8H8V7H7V5ZM8 4V5H7V4H8ZM9 3V4H8V3H9ZM10 2V3H9V2H10ZM10 2V1H11V2H10Z'; // 勾格(i-chk-on 勾部;边框另以 stroke rect 片段补)
// —— gate 纯函数（三态:双卡/单卡/空;席位锚缺席不产死规则）——
// 藏坞门控:composerSeat 内出现问卡/审批卡 frame → 藏自绘坞(官方卡接管席位);作答后 frame 卸载,坞自动归位。
function mcAskGateCss(seat, askFrame, planFrame) {
  if (!seat) return '';
  var rules = [];
  if (askFrame) rules.push(seat + ':has(' + askFrame + ') [data-mc-dock]{display:none!important}');
  if (planFrame) rules.push(seat + ':has(' + planFrame + ') [data-mc-dock]{display:none!important}');
  return rules.join('\n');
}
// —— 皮 builder 纯函数（M=MC_MAP 形状;测试以哨兵 mock 逐键断言）——
function mcAskCss(M) {
  if (!M || !M.askCard || !M.planCard) return ''; // 核心锚缺席(空 map/半装配)→ 空串,不产垃圾规则
  var mTri = mcAskUri(mcAskPath(ASK_TRI_D), 6, 11);
  var mRdo = mcAskUri(mcAskPath(ASK_RDO_D, true), 12, 12);
  var mRdoOn = mcAskUri(mcAskPath(ASK_RDO_ON_D, true), 12, 12);
  var mChkOn = mcAskUri("%3Crect x='.5' y='.5' width='11' height='11' fill='none' stroke='black'/%3E" + mcAskPath(ASK_CHK_D), 12, 12);
  var mPxX = mcAskUri(mcAskPath('M5 5h2v2H5V5zM17 5h2v2h-2V5zM7 7h2v2H7V7zM15 7h2v2h-2V7zM9 9h2v2H9V9zM13 9h2v2h-2V9zM11 11h2v2h-2v-2zM9 13h2v2H9v-2zM13 13h2v2h-2v-2zM7 15h2v2H7v-2zM15 15h2v2h-2v-2zM5 17h2v2H5v-2zM17 17h2v2h-2v-2z'), 24, 24);
  var L = [];
  // gate（见上;两卡同款）
  L.push(mcAskGateCss(M.composerSeat, M.askFrame, M.planFrame));
  // —— 卡壳(问卡+审批卡共用配方;C * 全域压平)——
  L.push(M.askCard + ',' + M.planCard + '{background:var(--mc-surface)!important;border:1px solid var(--mc-border)!important;'
    + 'border-radius:0!important;box-shadow:var(--mc-shadow-pop)!important;position:relative;font-family:var(--font-ui)}');
  L.push(M.askCard + ' *,' + M.planCard + ' *{font-family:inherit!important;border-radius:0!important}');
  // 卡体滚动区基础 md 皮(问卡题干域+审批卡正文域同语)
  L.push(M.askCard + ' ' + M.askScroll + '{font:400 12.5px/1.7 var(--font-ui)!important;color:var(--mc-fg)!important}');
  L.push(M.planCard + ' ' + M.planScroll + '{font:400 12.5px/1.7 var(--font-ui)!important;color:var(--mc-fg)!important}');
  // —— 题头:eyebrow 小字 faint / title 像素显示字(右让位 44px 给折叠+关闭双钮)——
  L.push(M.askCard + ' ' + M.askEyebrow + '{font:400 10.5px var(--font-ui)!important;color:var(--mc-faint)!important}');
  L.push(M.askCard + ' ' + M.askTitle + '{font:600 13px var(--font-display)!important;color:var(--mc-fg)!important;padding-right:44px!important}');
  // 折叠钮:官方 svg 藏,钮本体 mask i-tri(展开态[收起]rotate(90) 指下/折叠态[展开]0deg 指右;DRIFT:i18n zh 锚)
  L.push(M.askCard + ' ' + M.askFoldOn + ',' + M.askCard + ' ' + M.askFoldOff + ','
    + M.askCard + ' ' + M.askCancel + '{width:18px!important;height:18px!important;padding:0!important;border:none!important;'
    + 'background:currentColor!important;color:var(--mc-muted)!important;cursor:pointer}');
  L.push(M.askCard + ' ' + M.askFoldOn + ' svg,' + M.askCard + ' ' + M.askFoldOff + ' svg,'
    + M.askCard + ' ' + M.askCancel + ' svg{display:none!important}');
  L.push(M.askCard + ' ' + M.askFoldOn + '{-webkit-mask:' + mTri + ';mask:' + mTri + ';transform:rotate(90deg)}');
  L.push(M.askCard + ' ' + M.askFoldOff + '{-webkit-mask:' + mTri + ';mask:' + mTri + ';transform:none}');
  L.push(M.askCard + ' ' + M.askCancel + '{-webkit-mask:' + mPxX + ';mask:' + mPxX + ';color:var(--mc-fg)!important}');
  // —— 选项行:role 语义锚;官方 option 本就 display:flex+align-items:flex-start(源码勘定
  // 2026-09-03),框件 margin-top 锚首行——换皮不夺布局,环/勾做 flex 首子件(绝对定位与官方
  // flex 打架+官方 ::before 14px 框漏藏出双框叠影,验收轮勘误,记因 dev-notes §12.5)——
  // 单选:隐数字(裁定项,活体复核备选=数字进方框)+ ::before 12px 环 mask 占 number 位;选中整行反色
  L.push(M.askCard + ' ' + M.askOpts + ' ' + M.askNumber + '{display:none!important}');
  L.push(M.askCard + ' ' + M.askOpts + ' ' + M.askOptRdo + '::before{content:\'\';flex:0 0 12px;width:12px;height:12px;'
    + 'margin-top:6px;box-sizing:border-box;background:currentColor;-webkit-mask:' + mRdo + ';mask:' + mRdo + ';color:var(--mc-muted)}');
  L.push(M.askCard + ' ' + M.askOpts + ' ' + M.askOptRdo + M.askOptOn + '{background:var(--mc-fg)!important;color:var(--mc-surface)!important}');
  L.push(M.askCard + ' ' + M.askOpts + ' ' + M.askOptRdo + M.askOptOn + ' *{color:inherit!important}');
  L.push(M.askCard + ' ' + M.askOpts + ' ' + M.askOptRdo + M.askOptOn + '::before{color:var(--mc-surface);'
    + '-webkit-mask:' + mRdoOn + ';mask:' + mRdoOn + '}');
  // 多选:官方勾 svg 与官方 ::before 14px 框一律藏,_checkbox_ span 本体化 12px 边框方框(flex 首行位);
  // 选中整底 i-chk-on mask(边框+勾一体)
  L.push(M.askCard + ' ' + M.askOpts + ' ' + M.askOptChk + ' ' + M.askCheckbox + '{flex:0 0 12px;width:12px;height:12px;'
    + 'margin-top:6px;box-sizing:border-box;border:1px solid currentColor;background:none;color:var(--mc-muted);padding:0}');
  L.push(M.askCard + ' ' + M.askOpts + ' ' + M.askOptChk + ' ' + M.askCheckbox + '::before{content:none!important}');
  L.push(M.askCard + ' ' + M.askOpts + ' ' + M.askOptChk + ' ' + M.askCheckbox + ' *{display:none!important}');
  L.push(M.askCard + ' ' + M.askOpts + ' ' + M.askOptChk + M.askOptOn + ' ' + M.askCheckbox + '{border:none;background:currentColor;color:var(--mc-surface);'
    + '-webkit-mask:' + mChkOn + ';mask:' + mChkOn + '}');
  L.push(M.askCard + ' ' + M.askOpts + ' ' + M.askOptChk + M.askOptOn + '{background:var(--mc-fg)!important;color:var(--mc-surface)!important}');
  L.push(M.askCard + ' ' + M.askOpts + ' ' + M.askOptChk + M.askOptOn + ' *{color:inherit!important}');
  // 行内件:推荐徽标 1px 边框小方标(行内 label 无独立锚,字重保持官方——DRIFT 记因);题干补充 md 小字 faint
  L.push(M.askCard + ' ' + M.askOpts + ' ' + M.askBadge + '{border:1px solid var(--mc-border)!important;background:none!important;'
    + 'font:400 10px var(--font-ui)!important;color:var(--mc-muted)!important;padding:1px 4px!important}');
  L.push(M.askCard + ' ' + M.askDetail + '{font:400 12.5px/1.7 var(--font-ui)!important;color:var(--mc-muted)!important}');
  // 自定义回答行/自由输入场:1px 边框 + surface-2 底;textarea/input 透明底 12.5px/1.7
  L.push(M.askCard + ' ' + M.askCustomRow + ',' + M.askCard + ' ' + M.askField
    + '{border:1px solid var(--mc-border)!important;background:var(--mc-surface-2)!important}');
  L.push(M.askCard + ' ' + M.askField + ' textarea,' + M.askCard + ' ' + M.askField + ' input'
    + '{background:transparent!important;border:none!important;font:400 12.5px/1.7 var(--font-ui)!important;color:var(--mc-fg)!important}');
  // —— 页脚:progress 页码 faint / feedback 错误 danger / 翻页钮 18×18 caretright mask(prev scaleX(-1),disabled .35)——
  L.push(M.askCard + ' ' + M.askProgress + '{font:400 11px var(--font-ui)!important;color:var(--mc-faint)!important}');
  L.push(M.askCard + ' ' + M.askFeedback + '{font:400 11px var(--font-ui)!important;color:var(--mc-danger)!important}');
  L.push(M.askCard + ' ' + M.askPrev + ',' + M.askCard + ' ' + M.askNext
    + '{width:18px!important;height:18px!important;padding:0!important;border:none!important;'
    + 'background:currentColor!important;color:var(--mc-muted)!important;'
    + '-webkit-mask:' + mTri + ';mask:' + mTri + ';cursor:pointer}');
  L.push(M.askCard + ' ' + M.askPrev + '{transform:scaleX(-1)}');
  L.push(M.askCard + ' ' + M.askPrev + ':disabled,' + M.askCard + ' ' + M.askNext + ':disabled{opacity:.35}');
  // primitives Button(跳过/提交/下一题/审批三钮):直角化 + field 投影;primary = fg 底 surface 字(kit .btn sm 同语)
  L.push(M.askCard + ' ' + M.btnOutline + ',' + M.planCard + ' ' + M.btnOutline + ','
    + M.askCard + ' ' + M.btnPrimary + ',' + M.planCard + ' ' + M.btnPrimary
    + '{border-radius:0!important;box-shadow:var(--mc-shadow-field)!important;border:1px solid var(--mc-border)!important;'
    + 'background:var(--mc-surface)!important;color:var(--mc-fg)!important;font:400 12px var(--font-ui)!important}');
  L.push(M.askCard + ' ' + M.btnPrimary + ',' + M.planCard + ' ' + M.btnPrimary
    + '{background:var(--mc-fg)!important;color:var(--mc-surface)!important;border-color:var(--mc-fg)!important}');
  L.push(M.askCard + ' ' + M.btnPrimary + ':disabled,' + M.planCard + ' ' + M.btnPrimary + ':disabled{opacity:.35}');
  // —— 审批卡:警示条 warn 底 + bg-deep 像素字;圆点直角(* 压平已盖,显式记因);去聊天里说幽灵化——
  L.push(M.planCard + ' ' + M.planStrip + '{background:var(--mc-warn)!important;color:var(--mc-bg-deep)!important;'
    + 'font:600 11px var(--font-display)!important}');
  L.push(M.planCard + ' ' + M.planStrip + ' *{color:inherit!important}');
  L.push(M.planCard + ' ' + M.planDot + '{border-radius:0!important}');
  L.push(M.planCard + ' ' + M.planDiscuss + '{background:none!important;border:1px solid var(--mc-border)!important;'
    + 'box-shadow:none!important;color:var(--mc-muted)!important}');
  return L.join('\n');
}
// —— 装配出口(typeof MC_MAP 守卫同 dock/responsive:CJS 单测装载无 MC_MAP → 空串,纯函数仍可测)——
var MC_ASK_CSS = (typeof MC_MAP === 'undefined' ? '' : mcAskCss(MC_MAP));
// 纯 CSS 批:mount 为 noop(占协议位;门控/换皮全在 CSS 层,官方行为零干预)
var McAsk = {
  css: MC_ASK_CSS,
  mount: function () { return function () {}; },
};
if (typeof module !== 'undefined') module.exports = { mcAskGateCss: mcAskGateCss, mcAskCss: mcAskCss, McAsk: McAsk };
