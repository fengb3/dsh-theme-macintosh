// src/core/mcfx.js —— 层2：闪烁三件套（ghost→flash→swap 三拍协议，照《笔记》§0.3/§5.3/§8.2）
// 纯顶层声明，无模块系统语法；与 clock.js 拼进同一作用域，直接引用 CLOCK，勿重复声明
// 纯函数/入口经 CJS 兼容出口供测试 createRequire 使用

// 拍调度器：默认走 CLOCK.next（100ms 栅格），测试可经 __setSchedulerForTest 注入假时钟
let mcfxSchedule = (fn, ms) => CLOCK.next(fn, ms);

function esc(s) {
  // & 必须最先，避免把后续实体里的 & 再转一次
  return String(s).replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 出场三拍：拍0 同步 ghost+show()（DOM 插入/显形）→ 拍1 换 flash → 拍2 撤净（含 mcfx，零残留）
function flashIn(el, show) {
  try {
    if (!el || !el.isConnected) return;
    el.classList.add('mcfx', 'mc-ghost');
    show(); // 拍0：内容在 ghost 遮罩下瞬换（原型 §910-912）
  } catch (e) { /* 单元素失败不拖垮调用方 */ }
  mcfxSchedule(() => {
    try {
      if (!el || !el.isConnected) return;
      el.classList.remove('mc-ghost');
      el.classList.add('mc-flash');
    } catch (e) { /* 同上 */ }
    mcfxSchedule(() => {
      try {
        if (!el || !el.isConnected) return;
        el.classList.remove('mc-flash', 'mc-ghost', 'mcfx');
      } catch (e) { /* 同上 */ }
    }, 100);
  }, 100);
}

// 退场镜像（原型 §919-927）：拍0 flash 白块 → 拍1 hide() + 撤净（含 mcfx，零残留）
function flashOut(el, hide) {
  try {
    if (!el || !el.isConnected) return;
    el.classList.add('mcfx', 'mc-flash');
  } catch (e) { /* 同上 */ }
  mcfxSchedule(() => {
    try {
      if (!el || !el.isConnected) return;
      hide();
      el.classList.remove('mc-flash', 'mc-ghost', 'mcfx');
    } catch (e) { /* 同上 */ }
  }, 100);
}

// 状态切换五拍（验收六轮改版：一切同内容状态切换统一走此——卡片折叠/展开、文字 A→B）：
// t0 ghost(整卡透明) → t100 flash(白块遮盖) → t200 清残高+fn(被遮内容在此拍瞬变,可大可小)
// → t300 同时撤 flash+ghost+mcfx(揭开且显回,一步到位) → t400 什么都不动(纯滞空拍,只清 busy)。
// dataset.busy 防重入；断连/异常路径也要清 busy，避免卡片永久卡死
function accToggle(card, fn) {
  try {
    if (!card || !card.isConnected) return;
    if (card.dataset.busy) return; // 防重入
    card.dataset.busy = '1';
    card.classList.add('mcfx', 'mc-ghost');
  } catch (e) { return; }
  const done = () => { try { delete card.dataset.busy; } catch (e) { /* 忽略 */ } };
  mcfxSchedule(() => {
    try {
      if (!card || !card.isConnected) { done(); return; }
      card.classList.add('mc-flash');
    } catch (e) { done(); return; }
    mcfxSchedule(() => {
      try {
        if (card && card.isConnected) {
          card.style.height = ''; // 清展开动画残留的 inline 高度
          fn();
        }
      } catch (e) { /* fn 抛错仍走完撤拍 */ }
      mcfxSchedule(() => {
        // 拍3：flash 与 ghost 同时撤（含 mcfx 连撤，元素零残留、内容一步显回）
        try {
          if (card && card.isConnected) card.classList.remove('mc-flash', 'mc-ghost', 'mcfx');
        } catch (e) { /* 同上 */ }
        mcfxSchedule(() => {
          // 拍4：什么都不动（滞空拍，维持五拍栅格；只清 busy）
          done();
        }, 100);
      }, 100);
    }, 100);
  }, 100);
}

// 测试钩子：注入假调度器，返回原调度器便于还原
function __setSchedulerForTest(fn) {
  const prev = mcfxSchedule;
  mcfxSchedule = fn;
  return prev;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { esc, flashIn, flashOut, accToggle, __setSchedulerForTest };
}

// 装配模块句柄：mcfx 无需 mount，仅登记入口供后续层引用
const McMcfx = { esc, flashIn, flashOut, accToggle };
