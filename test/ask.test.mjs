// test/ask.test.mjs —— 模块11 问题卡/审批卡换皮（TDD 先行;交接档 §5 步骤1）
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { loadSrc } from './load-src.mjs';
const { mcAskGateCss, mcAskCss, McAsk } = loadSrc('src/conv/ask.js');

// —— gate 三态：pending 藏坞门控（composerSeat :has 问卡/审批卡 → 藏自绘坞;纯 CSS 零 JS）——
test('mcAskGateCss: 双卡在场→两条 :has 藏坞规则(问卡+审批卡)', () => {
  const css = mcAskGateCss('SEAT', 'ASKFRAME', 'PLANFRAME');
  assert.match(css, /SEAT:has\(ASKFRAME\)\s+\[data-mc-dock\]\{display:none!important\}/);
  assert.match(css, /SEAT:has\(PLANFRAME\)\s+\[data-mc-dock\]\{display:none!important\}/);
});

test('mcAskGateCss: 单卡(仅问卡/仅审批卡)→对应单条;空(全缺席)→空串', () => {
  const onlyAsk = mcAskGateCss('SEAT', 'ASKFRAME', null);
  assert.match(onlyAsk, /SEAT:has\(ASKFRAME\)/);
  assert.doesNotMatch(onlyAsk, /PLANFRAME/);
  const onlyPlan = mcAskGateCss('SEAT', null, 'PLANFRAME');
  assert.match(onlyPlan, /SEAT:has\(PLANFRAME\)/);
  assert.doesNotMatch(onlyPlan, /ASKFRAME/);
  assert.equal(mcAskGateCss('SEAT', null, null), '');
  assert.equal(mcAskGateCss(null, 'ASKFRAME', 'PLANFRAME'), ''); // 席位锚缺席不产死规则
});

// —— builder 全键含断言：哨兵值逐键入射,产出 CSS 必须逐键消费（窗框/环勾切换/按钮/strip）——
const M = {
  composerSeat: 'K-composerSeat', askFrame: 'K-askFrame', askCard: 'K-askCard', askScroll: 'K-askScroll',
  askFoldOn: 'K-askFoldOn', askFoldOff: 'K-askFoldOff', askCancel: 'K-askCancel',
  askPrev: 'K-askPrev', askNext: 'K-askNext', askEyebrow: 'K-askEyebrow', askTitle: 'K-askTitle',
  askOpts: 'K-askOpts', askOptRdo: 'K-askOptRdo', askOptChk: 'K-askOptChk', askOptOn: 'K-askOptOn',
  askNumber: 'K-askNumber', askCheckbox: 'K-askCheckbox', askBadge: 'K-askBadge', askDetail: 'K-askDetail',
  askCustomRow: 'K-askCustomRow', askProgress: 'K-askProgress',
  askFeedback: 'K-askFeedback', btnOutline: 'K-btnOutline', btnPrimary: 'K-btnPrimary',
  askChkChecked: 'K-askChkChecked', askCustomOn: 'K-askCustomOn',
  planFrame: 'K-planFrame', planCard: 'K-planCard', planScroll: 'K-planScroll',
  planStrip: 'K-planStrip', planDot: 'K-planDot', planDiscuss: 'K-planDiscuss',
};
test('mcAskCss: 全键消费——每枚哨兵出现在产出 CSS 中', () => {
  const css = mcAskCss(M);
  for (const k of Object.keys(M)) assert.ok(css.includes(M[k]), '缺键 ' + k);
});

test('mcAskCss: 皮配方落位——卡片 r-card+panel 投影/双内环通用钮/pgbtn 方框/选中反色/环勾 mask/strip 警示条', () => {
  const css = mcAskCss(M);
  assert.match(css, /K-askCard[^{]*\{[^}]*border-radius:var\(--mc-r-card\)/); // 卡片语汇圆角(验收轮4:非窗框直角)
  assert.match(css, /K-askCard[^{]*\{[^}]*var\(--mc-shadow-panel\)/);         // panel 投影(非 pop)
  assert.match(css, /K-btnOutline[^{]*\{[^}]*height:28px/);                    // 通用钮 28px 高
  assert.match(css, /K-btnOutline[^{]*\{[^}]*inset 0 0 0 1px var\(--mc-surface\)/); // 双内环外圈(.mc-btn 直译)
  assert.match(css, /K-btnOutline[^{]*\{[^}]*background:var\(--mc-surface-2\)/);    // surface-2 底
  assert.match(css, /K-btnPrimary[^{]*\{[^}]*background:var\(--mc-accent\)/);       // primary=accent 周紫底
  assert.match(css, /K-btnPrimary[^{]*\{[^}]*inset 0 0 0 1px var\(--mc-accent\)/);  // primary 内环 1px accent
  assert.match(css, /K-askPrev[^{]*\{[^}]*width:20px/);                        // pgbtn 20×20 方框
  assert.match(css, /K-askPrev[^{]*\{[^}]*border:1px solid var\(--mc-border\)/); // pgbtn 带边框(非裸三角)
  assert.match(css, /K-askOptOn[^{]*\{[^}]*background:var\(--mc-fg\)/);  // 选中行整行反色(System 7)
  assert.match(css, /mask:url\("data:image\/svg\+xml/);                  // 环/勾/三角走 mask data-URI
  assert.match(css, /K-askOptRdo[^{]*::before/);                          // 单选环 ::before mask
  assert.match(css, /K-askNumber[^{]*\{display:none/);                    // 单选隐数字(裁定项,活体复核)
  assert.match(css, /K-planStrip[^{]*\{[^}]*var\(--mc-warn\)/);           // 审批卡警示条
  assert.match(css, /K-askFoldOn/); assert.match(css, /K-askFoldOff/);    // 折叠 tri 双态
  assert.match(css, /K-askCancel/);                                       // 关闭盒 glyph(#i-close 近形)
  assert.match(css, /K-planDiscuss[^{]*\{[^}]*inset 0 0 0 1px var\(--mc-surface\)/); // 去聊天里说=默认钮(幽灵退役)
});

test('mcAskCss: 空 map/缺核心锚 → 空串(不产垃圾规则)', () => {
  assert.equal(mcAskCss(null), '');
  assert.equal(mcAskCss(undefined), '');
  assert.equal(mcAskCss({}), '');
});

// —— Node 侧(CJS 单文件装载,MC_MAP 缺席):MC_ASK_CSS 守卫回退空串 ——
test('McAsk.css: CJS 装载无 MC_MAP → 空串;mount 返回 teardown 函数', () => {
  assert.equal(McAsk.css, '');
  assert.equal(typeof McAsk.mount, 'function');
  const td = McAsk.mount({});
  assert.equal(typeof td, 'function');
  td(); // noop teardown 可安全调用
});

test('mcAskCss: 状态钩子带引号形态(与 dock 段无引号形态 deliberate 区分)', () => {
  const css = mcAskCss(M);
  assert.ok(css.includes('[aria-checked=\\"true\\"]') || css.includes('K-askOptOn'));
  // 哨兵值本身即带引号形态的锚——直接验产出含引号形态字面量
  const quoted = mcAskCss({ ...M, askOptOn: '[aria-checked="true"]' });
  assert.ok(quoted.includes('[aria-checked="true"]'));
});
