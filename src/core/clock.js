// src/core/clock.js —— 层1：100ms 栅格帧时钟（值照《笔记》§1.1；一切延时必须走 CLOCK.next）
// 纯顶层声明，无模块系统语法；纯函数经 CJS 兼容出口供测试 createRequire 使用
function computeNext(now, at, grid) {
  // at = 目标时刻（调用方传 now+ms）：量化到 ≥at 的最近栅格沿
  // CLOCK.next 侧即 Math.ceil((now+ms+1)/grid)*grid（控制器裁定公式）
  if (!grid) grid = 100;
  return Math.ceil((at + 1) / grid) * grid;
}
if (typeof module !== 'undefined' && module.exports) module.exports = { computeNext };

// CLOCK 惰性单例：mount(ctx) 时才创建并起 100ms 分发定时器
let CLOCK = null;

const McClock = {
  mount(ctx) {
    if (CLOCK) return CLOCK.dispose;

    let timer = null;
    let queue = []; // { fn, at } —— at 已量化到 100ms 栅格沿

    const clock = {
      PULSE: 2600, // mc-pulse 三色周期
      SWEEP: 1000, // mc-sweep 条纹扫掠周期
      // 量化延时：回调推迟到 ≥ms 后的最近栅格沿，与全局动画同轴
      next(fn, ms) {
        const job = { fn, at: computeNext(Date.now(), Date.now() + ms, 100) };
        queue.push(job);
        return () => { queue = queue.filter((j) => j !== job); };
      },
      // 负延迟注入：任意时刻挂上的 CSS 动画与全局相位同步
      syncAnim(el, period, prop) {
        if (period === undefined) period = clock.PULSE;
        if (!prop) prop = '--pulse-delay';
        el.style.setProperty(prop, -(Date.now() % period) + 'ms');
      },
      dispose() { teardown(); },
    };

    function teardown() {
      if (timer !== null) { clearInterval(timer); timer = null; }
      queue = [];
      CLOCK = null;
    }

    CLOCK = clock;
    timer = setInterval(() => {
      const t = Date.now();
      const due = [];
      queue = queue.filter((j) => (j.at <= t ? (due.push(j), false) : true));
      for (const j of due) { try { j.fn(); } catch (e) { /* 单回调失败不拖垮时钟 */ } }
    }, 100);

    return teardown;
  },
};
