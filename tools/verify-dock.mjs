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
//   - Stop/busy:composerStop/composerPhase 键为空(Task 1 裁定)→ 仅 INFO(断言 8)。
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
    const off = document.querySelector('[data-composer-card]');
    const furn = dock && dock.querySelector('[data-mc-dock-furn]');
    return {
      dock: !!dock,
      on: document.documentElement.hasAttribute('data-mc-dock-on'),
      ta: !!ta, taVal: ta ? ta.value : null,
      state: box ? box.getAttribute('data-mc-state') : null,
      busy: !!box && box.classList.contains('busy'),
      sendDisabled: send ? send.disabled : null,
      offPresent: !!off,
      offDisplay: off ? getComputedStyle(off).display : null,
      cmpBg: box ? getComputedStyle(box).backgroundColor : null,
      furnKids: furn ? furn.childElementCount : -1,
      queue: dock ? dock.querySelectorAll('.queue-row').length : -1,
      todo: dock ? dock.querySelectorAll('.todo-acc').length : -1,
      goal: dock ? dock.querySelectorAll('.goal-card').length : -1,
      ctx: dock ? dock.querySelectorAll('.ctx-ring').length : -1,
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

// 2) 断言 2+3:三态 + e2e 镜像发送(一次填文,激活断言后即发送;全门禁仅此一条消息)
const MSG = 'dock 门禁镜像自检 ' + new Date().toISOString().replace('T', ' ').slice(0, 19);
await page.fill('[data-mc-dock] .composer textarea', MSG);
p = await dockProbe();
check('断言2: 初始 Send disabled', sendIdleDisabled === true);
check('断言2: 打字后 Send enabled 且 data-mc-state=ready', p.sendDisabled === false && p.state === 'ready');
check('断言2: 非忙态无 .busy 类(idle→ready 全程)', !idleBusy && !p.busy);
await page.click('[data-mc-dock] [data-mc-send]');
const seen = await poll((m) => {
  const sc = document.querySelector('[data-conversation-scroll]');
  return !!sc && sc.textContent.indexOf(m) !== -1;
}, MSG, 4000);
check('断言3: 镜像发送 → 会话流出现该消息(4s 轮询)', seen);
p = await dockProbe();
check('断言3: 发送后自绘 textarea 复位为空', p.ta && p.taVal === '');
info('断言3: 单消息裁定 — 门禁全程仅此一条(落入当前会话,Tasks 5/6 冒烟同款)', MSG);

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

// 5) 断言 6:家具断言(DOCK_DATA 空表 → 全静默合法终态)
info('家具素材: DOCK_DATA 空表(Task 1 附录A 勘定,四件数据面均勘不通 → 全静默)', null);
p = await dockProbe();
check('断言6: 家具静默 — .queue-row 零匹配', p.queue === 0);
check('断言6: 家具静默 — .todo-acc 零匹配', p.todo === 0);
check('断言6: 家具静默 — .goal-card 零匹配', p.goal === 0);
check('断言6: 家具静默 — .ctx-ring 零匹配', p.ctx === 0);
check('断言6: [data-mc-dock-furn] 零子节点', p.furnKids === 0);

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

// 7) 断言 8:Stop/busy — 仅 INFO(真实 busy 态需活体运行,用户验收窗口覆盖)
info('断言8: Stop/busy 断言 deferred — composerStop/composerPhase 键为空(Task 1 裁定),busy 三态需真实运行态', null);

console.log('--- [mcx] console lines (tail 10) ---');
for (const l of logs.slice(-10)) console.log(l);
await browser.close();
console.log(ok ? 'VERIFY: GREEN' : 'VERIFY: RED');
process.exit(ok ? 0 : 1);
