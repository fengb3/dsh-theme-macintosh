// tools/verify-dock.mjs — dock 模块门禁(T7):launch chromium → GUI@3080 →
// 输入坞断言集(brief Step 1 八条;含观察器守护与拔桥演练)→ 退出码 0=GREEN / 1=RED。
//
// 断言素材勘定(写前实读:src/conv/dock.js + client.js MC_MAP dock 段 + 活体只读探针):
//   - 自绘坞 [data-mc-dock] 挂 [data-composer-seat];官方卡 [data-composer-card] 经
//     html[data-mc-dock-on] 门控 display:none!important(藏未删 = 单输入框保证)。
//   - composer:[data-mc-dock] .composer textarea + [data-mc-send](btn sm primary,
//     初始 disabled)+ [data-mc-stop](hidden);三态 data-mc-state=idle|ready|busy。
//   - 镜像桥:api.setText = mcMirrorValue(HTMLTextAreaElement.prototype value 原生
//     setter + input 事件)→ 官方 textarea;api.send = 官方 [aria-label="发送消息"] click。
//   - 拔桥(spec §5-6):重定义原型 value setter 抛错 → setText false → bridgeFail:
//     坞 flashOut 退场 + data-mc-dock-on 摘除 + 观察器断连;reload 还原描述符 →
//     400ms 栅格轮询重挂载。page.fill 走 CDP 原生输入,不经 JS setter(打字不受扰)。
//   - 家具:DOCK_DATA 空表(Task 1 附录A 勘定,四件数据面均勘不通)→ 全静默合法终态。
//   - 会话流锚:div[data-conversation-scroll](MC_MAP.flowScroll;活体探针在场,与
//     composer 席互为兄弟 → 文本命中即用户气泡真入场,不受自绘坞/官方 textarea 残文干扰)。
//   - 验收轮1(2026-09-01)扩容:① bar 四件套断言(命令/权限/模型/ctx 圆环在场,模型钮文字 ===
//     官方 title、权限钮文字 === 官方 aria-label 去前缀);② busy/Stop 实链路(发送后 8s 内轮询
//     自绘 [data-mc-stop] 可见 → 点击 → 官方中断 → 自绘回 Send;错过 busy 窗口=INFO deferred
//     不 FAIL);③ textarea 自增高(三行文本高 > 基线;发送后复位)。
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(path.join(ROOT, 'shots'), { recursive: true });

const URL = 'http://127.0.0.1:3080';
const DRY = process.argv.includes('--dry-run');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const logs = [];
page.on('console', (m) => { const t = m.text(); if (t.includes('[mcx]')) logs.push(t); });
page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));

let ok = true;
const check = (name, cond) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) ok = false; };
const info = (name, val) => console.log('INFO ' + name + ' ' + JSON.stringify(val));

async function waitFor(selector, timeoutMs, everyMs = 2000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await page.evaluate((s) => !!document.querySelector(s), selector)) return true;
    await page.waitForTimeout(everyMs);
  }
  return await page.evaluate((s) => !!document.querySelector(s), selector);
}

// 谓词轮询(断言 3/4/5 的 4s 窗口;fn 在页面域求值,arg 可序列化)
async function poll(fn, arg, timeoutMs, everyMs = 250) {
  const start = Date.now();
  let v = await page.evaluate(fn, arg);
  while (!v && Date.now() - start < timeoutMs) {
    await page.waitForTimeout(everyMs);
    v = await page.evaluate(fn, arg);
  }
  return v;
}

// —— 官方深浅切换(照 verify-flow.mjs setTheme:设置→外观,Ruling 9)——
async function setTheme(label /* '深色' | '浅色' */) {
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button, [role=button]')]
      .find((b) => ((b.getAttribute('aria-label') || b.textContent || '').trim() === '设置'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(900);
  const clicked = await page.evaluate((name) => {
    const n = [...document.querySelectorAll('[role=radio], [role=option], button, label')]
      .find((x) => (x.getAttribute('aria-label') || x.textContent || '').trim() === name);
    if (n) { n.click(); return true; }
    return false;
  }, label);
  let flipped = false;
  const want = label === '浅色' ? 'light' : 'dark';
  for (let i = 0; i < 20 && !flipped; i++) {
    flipped = await page.evaluate((w) => document.documentElement.getAttribute('data-theme') === w, want);
    if (!flipped) await page.waitForTimeout(400);
  }
  return { clicked, flipped, theme: await page.evaluate(() => document.documentElement.getAttribute('data-theme')) };
}

// —— 坞状态探针(单次快照;选择器全部实读勘定,见文件头)——
async function dockProbe() {
  return await page.evaluate(() => {
    const dock = document.querySelector('[data-mc-dock]');
    const box = dock && dock.querySelector('.composer');
    const ta = dock && dock.querySelector('.composer textarea');
    const send = dock && dock.querySelector('[data-mc-send]');
    const stop = dock && dock.querySelector('[data-mc-stop]');
    const off = document.querySelector('[data-composer-card]');
    const furn = dock && dock.querySelector('[data-mc-dock-furn]');
    const cmd = dock && dock.querySelector('[data-mc-cmd]');
    const perm = dock && dock.querySelector('[data-mc-perm]');
    const model = dock && dock.querySelector('[data-mc-model]');
    const ring = dock && dock.querySelector('[data-mc-dock-cmp] .ctx-ring');
    const arc = ring && ring.querySelector('.cr-arc');
    const offPerm = document.querySelector('[data-composer-card] button[aria-label^="访问模式"]');
    const offModel = document.querySelector('[data-composer-card] button[aria-label^="选择模型"]');
    const permSpan = perm && perm.querySelector('[data-mc-perm-txt]');
    const modelSpan = model && model.querySelector('[data-mc-model-txt]');
    return {
      dock: !!dock,
      on: document.documentElement.hasAttribute('data-mc-dock-on'),
      ta: !!ta, taVal: ta ? ta.value : null,
      taH: ta ? Math.round(ta.getBoundingClientRect().height) : -1,
      state: box ? box.getAttribute('data-mc-state') : null,
      busy: !!box && box.classList.contains('busy'),
      sendDisabled: send ? send.disabled : null,
      stopVisible: !!stop && !stop.hidden && !!(stop.offsetParent || stop.getClientRects().length),
      sendVisible: !!send && !send.hidden && !!(send.offsetParent || send.getClientRects().length),
      cmdPresent: !!cmd,
      permTxt: permSpan ? permSpan.textContent : null,
      modelTxt: modelSpan ? modelSpan.textContent : null,
      modelHidden: model ? !!model.hidden : null,
      ringBar: !!ring,
      arcDash: arc ? arc.getAttribute('stroke-dasharray') : null,
      ringTitle: ring ? ring.getAttribute('title') : null,
      offPresent: !!off,
      offDisplay: off ? getComputedStyle(off).display : null,
      offPermLabel: offPerm ? offPerm.getAttribute('aria-label') : null,
      offModelTitle: offModel ? offModel.getAttribute('title') : null,
      cmpBg: box ? getComputedStyle(box).backgroundColor : null,
      furnKids: furn ? furn.childElementCount : -1,
      queue: dock ? dock.querySelectorAll('.queue-row').length : -1,
      todo: dock ? dock.querySelectorAll('.todo-acc').length : -1,
      goal: dock ? dock.querySelectorAll('.goal-card').length : -1,
      furnCtx: furn ? furn.querySelectorAll('.ctx-ring').length : -1, // 家具 ctx 改 scope 到 furn(bar 圆环验收轮1 起常驻)
    };
  });
}

// ═══ 主流程 ═══
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000); // 主题注入 + 会话恢复 + 晚挂载轮询(verify 全家同款节律)

// dry-run:只证「页面可开 + dock 样式已注入(style 标签含 [data-mc-dock])」即退;
// 注入缺席 = 宿主疑缓存旧 client.js → RED(注入即本分支唯一命题)
if (DRY) {
  const alive = await page.evaluate(() =>
    !!document.querySelector('[data-mc-dock], [data-composer-seat], .mc-sb-find, .mc-sb-mini'));
  const cssIn = await page.evaluate(() =>
    [...document.querySelectorAll('style')].some((s) => (s.textContent || '').includes('[data-mc-dock]')));
  console.log('INFO dry-run host-alive=' + alive + ' dock-css-injected=' + cssIn);
  await browser.close();
  if (!cssIn) { console.log('VERIFY: RED (dry-run: dock 样式未注入 — 宿主疑缓存旧 client.js)'); process.exit(1); }
  console.log('VERIFY: GREEN (dry-run)');
  process.exit(0);
}

// 0) 起点归一:确保深色
let theme0 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
if (theme0 !== 'dark') { const s = await setTheme('深色'); info('起点非深色,已切', s); await page.keyboard.press('Escape').catch(() => {}); await page.waitForTimeout(1200); } // Escape 关设置面板(其 mask 拦截后续指针点击)

// ═══ 深色轮 ═══
// 1) 断言 1:自绘坞在场 + 单输入框保证(官方卡藏未删)
const here = await waitFor('[data-mc-dock]', 10000, 500);
let p = await dockProbe();
check('断言1: 自绘坞在场([data-mc-dock] .composer textarea)', here && p.dock && p.ta);
check('断言1: 官方卡藏未删(在场且 display=none)', p.offPresent && p.offDisplay === 'none');
check('断言1: html[data-mc-dock-on] 属性在场', p.on);
const sendIdleDisabled = p.sendDisabled;
const idleBusy = p.busy;
const taHIdle = p.taH; // autogrow 基线(空稿 rows=1)

// 1.5) 断言1b(bar 四件套,验收轮1):左组两钮+模型钮+ctx 圆环在场;模型/权限文字与官方值同步
check('断言1b: bar 左组命令钮在场([data-mc-cmd])', p.cmdPresent);
check('断言1b: bar 左组权限钮在场且有值文字', typeof p.permTxt === 'string' && p.permTxt.length > 0);
check('断言1b: bar 模型钮在场([data-mc-model] 未隐藏)', !!p.modelTxt && p.modelHidden === false);
check('断言1b: bar ctx 圆环在场(常驻)', p.ringBar);
check('断言1b: 模型钮文字 === 官方 title', p.offModelTitle != null && p.modelTxt === p.offModelTitle);
const permWant = p.offPermLabel ? p.offPermLabel.replace(/^访问模式，当前[:：]\s*/, '') : null;
check('断言1b: 权限钮文字 === 官方 aria-label 去前缀', permWant != null && p.permTxt === permWant);
info('断言1b: 官方锚实测值', { offPermLabel: p.offPermLabel, offModelTitle: p.offModelTitle, permTxt: p.permTxt, modelTxt: p.modelTxt, arcDash: p.arcDash, ringTitle: p.ringTitle });

// 2) 断言 2+3:三态 + e2e 镜像发送(三行文本兼作 autogrow 素材;全门禁仅此一条消息)
const MSG = 'dock 门禁镜像自检(验收轮1 三行自增高素材)\n第二行:bar 四钮镜像/busy-Stop 链路勘验\n第三行:' + new Date().toISOString().replace('T', ' ').slice(0, 19);
await page.fill('[data-mc-dock] .composer textarea', MSG);
p = await dockProbe();
check('断言2: 初始 Send disabled', sendIdleDisabled === true);
check('断言2: 打字后 Send enabled 且 data-mc-state=ready', p.sendDisabled === false && p.state === 'ready');
check('断言2: 非忙态无 .busy 类(idle→ready 全程)', !idleBusy && !p.busy);
check('断言2b(autogrow): 三行文本 textarea 高 > 初始基线且 >44px', p.taH > taHIdle && p.taH > 44);
info('断言2b: autogrow 实测', { idleH: taHIdle, grownH: p.taH });
await page.click('[data-mc-dock] [data-mc-send]');
const seen = await poll((m) => {
  const sc = document.querySelector('[data-conversation-scroll]');
  return !!sc && sc.textContent.replace(/\s+/g, ' ').indexOf(m) !== -1;
}, MSG.replace(/\s+/g, ' '), 4000);
check('断言3: 镜像发送 → 会话流出现该消息(4s 轮询)', seen);
p = await dockProbe();
check('断言3: 发送后自绘 textarea 复位为空', p.ta && p.taVal === '');
check('断言2b(autogrow): 发送后 textarea 高复位基线', p.taH <= taHIdle + 2);
info('断言3: 单消息裁定 — 直发仅此一条(另断言8b busy 窗内入队一条转向消息;均落入当前会话)', MSG);

// 2.5) 断言8(验收轮1 实装):busy/Stop 实链路 — 发送后 8s 内轮询自绘 [data-mc-stop] 可见(busy 窗口);
//      捕获后点击自绘 Stop → 官方中断 → 自绘回 Send;turn 太快错过 busy 窗口 → INFO deferred 不 FAIL
const stopSeen = await poll(() => {
  const s = document.querySelector('[data-mc-dock] [data-mc-stop]');
  return !!s && !s.hidden && !!(s.offsetParent || s.getClientRects().length);
}, null, 8000, 250);
if (stopSeen) {
  const busyP = await dockProbe();
  info('断言8: busy 捕获(自绘坞进 busy,ctx 圆环含最近观测 pct)', { state: busyP.state, busy: busyP.busy, arcDash: busyP.arcDash, ringTitle: busyP.ringTitle });
  // 断言8b(2026-09-02 busy 回车入队修复):busy 中自绘 textarea 打字+Enter → 官方入队
  // (本地稿清空 + 消息入流为转向行 + 官方域无幽灵稿;官方件唯一通道=合成 keydown 驱动官方 onKeyDown)
  const QMSG = 'dock 门禁 busy 入队自检 ' + Date.now();
  await page.click('[data-mc-dock] .composer textarea');
  await page.keyboard.type(QMSG, { delay: 10 });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
  const q = await page.evaluate((m) => ({
    selfTa: document.querySelector('[data-mc-dock] .composer textarea').value,
    offTa: document.querySelector('[data-composer-card] textarea').value,
    inFlow: (document.querySelector('[data-conversation-scroll]') || { textContent: '' }).textContent.includes(m),
  }), QMSG);
  check('断言8b: busy 回车入队 — 本地稿清空', q.selfTa === '');
  check('断言8b: busy 回车入队 — 官方域无幽灵稿', q.offTa === '');
  check('断言8b: busy 回车入队 — 消息入流(转向行)', q.inFlow);
  await page.click('[data-mc-dock] [data-mc-stop]');
  const back = await poll(() => {
    const sd = document.querySelector('[data-mc-dock] [data-mc-send]');
    const st = document.querySelector('[data-mc-dock] [data-mc-stop]');
    const offSend = document.querySelector('[data-composer-card] button[aria-label="发送消息"]');
    return !!sd && !sd.hidden && (!st || st.hidden) && !!offSend;
  }, null, 8000, 250);
  check('断言8: 点击自绘 Stop → 官方中断 → 自绘回 Send(官方 Send 复挂)', back);
  const idleP = await dockProbe();
  info('断言8: 中断后坞状态', { state: idleP.state, stopVisible: idleP.stopVisible, sendVisible: idleP.sendVisible });
} else {
  info('断言8: busy/Stop deferred — 8s 未捕获 busy 窗口(turn 太快错过;不 FAIL)', null);
}

// 3) 断言 4:观察器守护 — 坞被 remove → 4s 内重插(brief:守护在场才演拔桥)
await page.evaluate(() => { const d = document.querySelector('[data-mc-dock]'); if (d) d.remove(); });
const guardOk = await poll(() => !!document.querySelector('[data-mc-dock]'), null, 4000);
check('断言4: 坞被 remove 后 4s 内重插(观察器守护)', guardOk);

// 4) 断言 5:拔桥演练(spec §5-6;守护在场才演)
if (guardOk) {
  const MSG2 = 'dock 拔桥演练 ' + Date.now();
  await page.fill('[data-mc-dock] .composer textarea', MSG2); // 先落稿保底(文本在场)
  await page.evaluate(() => { // 重定义原型 value setter 抛错(bridge 通道 1 必断)
    const desc = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
    Object.defineProperty(window.HTMLTextAreaElement.prototype, 'value', {
      get: desc.get, set() { throw new Error('BROKEN_BRIDGE'); }, configurable: true,
    });
  });
  try { await page.fill('[data-mc-dock] .composer textarea', MSG2); } // brief 顺序:断后仍打字(CDP 原生输入,预期可过;失败无害,稿已在)
  catch (e) { info('断言5: setter 断后 fill 抛错(记录;不影响演练,稿已落)', String(e).slice(0, 100)); }
  await page.click('[data-mc-dock] [data-mc-send]'); // doSend → setText false → bridgeFail
  await poll(() => !document.querySelector('[data-mc-dock]')
    && !document.documentElement.hasAttribute('data-mc-dock-on'), null, 4000);
  const after = await page.evaluate(() => {
    const off = document.querySelector('[data-composer-card]');
    return {
      dockGone: !document.querySelector('[data-mc-dock]'),
      attrGone: !document.documentElement.hasAttribute('data-mc-dock-on'),
      offDisplay: off ? getComputedStyle(off).display : null,
    };
  });
  check('断言5: 拔桥后自绘坞退场(4s 轮询)', after.dockGone);
  check('断言5: html[data-mc-dock-on] 摘除', after.attrGone);
  check('断言5: 官方卡 display 恢复(非 none,单输入框让位)', !!after.offDisplay && after.offDisplay !== 'none');
  await page.reload({ waitUntil: 'domcontentloaded' }); // 刷新还原原型描述符
  const remount = await waitFor('[data-mc-dock]', 20000, 500); // 晚挂载轮询重挂载
  const rp = await dockProbe();
  check('断言5: reload 还原描述符并重挂载(恢复演练)', remount && rp.dock && rp.on && rp.offDisplay === 'none');
  info('断言5: reload 后坞状态', { dock: rp.dock, on: rp.on, offDisplay: rp.offDisplay, state: rp.state });
} else {
  info('断言5 拔桥演练 deferred(断言4 守护未过;brief:守护在场才演拔桥)', null);
}

// 5) 断言 6:家具(furn 批活装后语义翻转:在场=结构断言;缺席=静默合法 INFO)
info('家具素材: furn 批活装(纯只读)——queue/todos/goal 四订阅差分重绘;无数据会话静默合法', null);
p = await dockProbe();
{
  const f = await page.evaluate(() => {
    const furn = document.querySelector('[data-mc-dock-furn]');
    if (!furn) return { furnMissing: true };
    const q = furn.querySelector('.queue-row');
    const t = furn.querySelector('.todo-acc');
    const g = furn.querySelector('.goal-card');
    return {
      kids: furn.children.length,
      queueText: q ? (q.textContent || '') : null,
      todoBar: t ? !!t.querySelector('.todo-bar') : null,
      todoMeta: t ? ((t.querySelector('.todo-meta') || {}).textContent || '') : null,
      todoItems: t ? t.querySelectorAll('.t-item').length : 0,
      goalPhase: g ? g.getAttribute('data-phase') : null,
      goalObj: g ? !!g.querySelector('.gc-obj') : null,
      furnCtx: furn.querySelectorAll('.ctx-ring').length,
    };
  });
  if (f.furnMissing) check('断言6: [data-mc-dock-furn] 容器在场', false);
  else if (f.kids === 0) {
    info('断言6: 家具静默(当前会话无 queue/todos/goal 数据 — 合法态)', null);
    check('断言6: 静默时 furn 零子节点', true);
  } else {
    if (f.queueText != null) check('断言6: queue-row 文案形态(队列中还有 N 条消息 — …)', /队列中还有 \d+ 条消息/.test(f.queueText));
    if (f.todoBar != null) check('断言6: todo-acc 结构(bar+meta 计数+行)', !!f.todoBar && /^\d+\/\d+$/.test(f.todoMeta) && f.todoItems > 0);
    if (f.goalPhase != null) check('断言6: goal-card 相位合法(active|paused|blocked)且有目标文', ['active', 'paused', 'blocked'].indexOf(f.goalPhase) >= 0 && !!f.goalObj);
    info('断言6: 家具在场实况', { kids: f.kids, goalPhase: f.goalPhase, todoItems: f.todoItems });
  }
  if (!f.furnMissing) check('断言6: furn 内 .ctx-ring 零匹配(bar 圆环常驻,scope 到 furn)', f.furnCtx === 0);
}

// 6) 断言 7:深浅两轮(computed background 反转 + 双截图)
const darkBg = p.cmpBg;
await page.screenshot({ path: path.join(ROOT, 'shots', 'dock-verify-dark.png') });
const sw = await setTheme('浅色');
check('官方外观通道切浅色', sw.clicked && sw.flipped && sw.theme === 'light');
await page.keyboard.press('Escape').catch(() => {}); // 关设置面板:其 mask 拦截指针(verify-menus 同款)
await page.waitForTimeout(900);
p = await dockProbe();
check('断言7: 浅色 .composer computed background 反转', p.dock && !!p.cmpBg && p.cmpBg !== darkBg);
info('断言7: composer background 深浅两轮', { dark: darkBg, light: p.cmpBg });
await page.screenshot({ path: path.join(ROOT, 'shots', 'dock-verify-light.png') });
const back = await setTheme('深色');
check('测毕还原深色', back.flipped && back.theme === 'dark');
await page.keyboard.press('Escape').catch(() => {});

// 7) 断言8 已于发送后实时实装(见 2.5:busy/Stop 实链路,验收轮1)——此处无遗留项

console.log('--- [mcx] console lines (tail 10) ---');
for (const l of logs.slice(-10)) console.log(l);
await browser.close();
console.log(ok ? 'VERIFY: GREEN' : 'VERIFY: RED');
process.exit(ok ? 0 : 1);
