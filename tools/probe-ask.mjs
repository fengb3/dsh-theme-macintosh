// tools/probe-ask.mjs v3 — ask 批勘定探针(自治版;实现期动作,勘定后保留复勘用)
// 流程:GUI 新建会话 → 自绘坞发指令让新会话 agent 调 ask_user_question → pending 卡勘定 → 自动作答吃卡 → 退出。
// 一次性会话留在侧栏(首条消息为题),主人可删。用户零操作。
import { chromium } from 'playwright';

const INSTR = '请不要输出任何文字,直接调用 ask_user_question 工具问我一道单选题:' +
  'question="探针:主题 ask 卡勘定",header="探针",options=["A 勘定正常","B 需要重试"]。' +
  '收到回答后立即结束回合,不要再输出内容。';

const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(2500);

// A. 新建会话(官方钮;排除主题同名钮) → 等自绘坞挂载
const created = await pg.evaluate(() => {
  const btn = [...document.querySelectorAll('button[aria-label="新建会话"]')].find((x) => !x.closest('[data-mc-finder]'));
  if (btn) { btn.click(); return true; }
  return false;
});
console.log('[probe-ask] new-session click:', created);
await pg.waitForTimeout(1500);
const dockReady = await pg.evaluate(() => {
  const dock = document.querySelector('[data-mc-dock]');
  return { dock: !!dock, ta: !!(dock && dock.querySelector('textarea')), on: document.documentElement.hasAttribute('data-mc-dock-on') };
});
console.log('[probe-ask] dock:', JSON.stringify(dockReady));
if (!dockReady.ta) { console.log('[probe-ask] FATAL: dock textarea not ready'); await b.close(); process.exit(2); }

// B. 自绘坞发指令(真实用户路径:textarea 输入 + Send 点击)
await pg.fill('[data-mc-dock] textarea', INSTR);
await pg.waitForTimeout(300);
await pg.click('[data-mc-dock] [data-mc-send]');
console.log('[probe-ask] instruction sent; polling for pending card ...');

// C. 轮询 pending 卡(上限 150s;agent 思考 + 工具调用)
let hit = false;
for (let i = 0; i < 300; i++) {
  if (await pg.evaluate(() => !!document.querySelector('[data-question-key]'))) { hit = true; break; }
  if (i % 40 === 39) console.log('[probe-ask] ...polling ' + (i + 1) + '/300');
  await pg.waitForTimeout(500);
}
if (!hit) {
  const diag = await pg.evaluate(() => {
    const steps = [...document.querySelectorAll('[data-phase=active] [class*="message"], [data-conversation-scroll] > *')];
    return { lastText: (steps.length ? steps[steps.length - 1].textContent : '').slice(-400) };
  });
  console.log('[probe-ask] TIMEOUT no card. lastText:', JSON.stringify(diag));
  await b.close(); process.exit(2);
}

// D. pending 勘定:挂载链 + 共存三件 + 卡内结构 + 哈希类清单
const q = await pg.evaluate(() => {
  const frame = document.querySelector('[data-question-key]');
  const chain = []; let n = frame;
  while (n && n !== document.body) {
    chain.push(n.tagName + (n.id ? '#' + n.id : '') + '.' + String(n.className).slice(0, 60)
      + (n.hasAttribute('data-composer-seat') ? '[data-composer-seat]' : ''));
    n = n.parentElement;
  }
  const cs = (el) => el ? (({ display, position }) => ({ display, position }))(getComputedStyle(el)) : null;
  const card = frame.querySelector('section');
  return {
    frameAttrs: [...frame.attributes].map((a) => a.name + '=' + a.value.slice(0, 40)),
    cardAttrs: card ? [...card.attributes].map((a) => a.name + '=' + a.value.slice(0, 60)) : null,
    mountChain: chain,
    composerSeat: { in: !!document.querySelector('[data-composer-seat]'), cs: cs(document.querySelector('[data-composer-seat]')) },
    composerCard: { in: !!document.querySelector('[data-composer-card]'), cs: cs(document.querySelector('[data-composer-card]')) },
    mcDock: { in: !!document.querySelector('[data-mc-dock]'), cs: cs(document.querySelector('[data-mc-dock]')) },
    dockOnAttr: document.documentElement.hasAttribute('data-mc-dock-on'),
    seatContainsFrame: !!document.querySelector('[data-composer-seat] [data-question-key]'),
    seatContainsDock: !!document.querySelector('[data-composer-seat] [data-mc-dock]'),
    buttons: card ? [...card.querySelectorAll('button')].map((x) => ({
      aria: x.getAttribute('aria-label'), role: x.getAttribute('role'), cls: String(x.className), text: (x.textContent || '').slice(0, 20),
    })) : [],
    progress: card ? ((card.querySelector('[class*="progress"]') || {}).textContent || null) : null,
    optionRows: card ? [...card.querySelectorAll('[role=radio],[role=checkbox]')].map((x) => ({
      role: x.getAttribute('role'), checked: x.getAttribute('aria-checked'), cls: String(x.className),
    })) : [],
  };
});
console.log('D.question-pending:', JSON.stringify(q, null, 2));
await pg.screenshot({ path: 'tools/artifacts/probe-ask-pending.png' });

// E. 折叠态勘定:点收起 → dump → 复原
const folded = await pg.evaluate(() => {
  const btn = [...document.querySelectorAll('[data-question-key] button[aria-label]')].find((x) => /收起|minimize/i.test(x.getAttribute('aria-label')));
  if (btn) btn.click();
  return !!btn;
});
if (folded) {
  await pg.waitForTimeout(500);
  const mini = await pg.evaluate(() => {
    const card = document.querySelector('[data-question-key] section');
    return { cls: card ? String(card.className) : null, bodyGone: !document.querySelector('[data-question-key] [data-question-scroll]') };
  });
  console.log('E.minimized:', JSON.stringify(mini));
  await pg.evaluate(() => {
    const btn = [...document.querySelectorAll('[data-question-key] button[aria-label]')].find((x) => /展开|maximize/i.test(x.getAttribute('aria-label')));
    if (btn) btn.click();
  });
  await pg.waitForTimeout(400);
}

// F. 自动作答吃卡:选第一枚未选选项 → 点 footer primary(下一题/提交) → 循环至卡消(上限 12 轮)
for (let r = 0; r < 12; r++) {
  const gone = await pg.evaluate(() => !document.querySelector('[data-question-key]'));
  if (gone) break;
  await pg.evaluate(() => {
    const opt = document.querySelector('[data-question-key] [role=radio][aria-checked="false"],[data-question-key] [role=checkbox][aria-checked="false"]');
    if (opt) opt.click();
  });
  await pg.waitForTimeout(400);
  await pg.evaluate(() => {
    const card = document.querySelector('[data-question-key] section');
    if (!card) return;
    const primary = [...card.querySelectorAll('button[class*="_primary"],button[class*="primary"]')]
      .find((x) => !x.disabled && /下一题|提交|Next|Submit/i.test(x.textContent || ''));
    if (primary) primary.click();
  });
  await pg.waitForTimeout(900);
  console.log('[probe-ask] answer round ' + (r + 1) + ' done');
}
const settled = await pg.evaluate(() => ({ cardGone: !document.querySelector('[data-question-key]'), dockBack: !!document.querySelector('[data-mc-dock]') }));
console.log('F.settled:', JSON.stringify(settled));
console.log('[probe-ask] done(一次性会话留侧栏,主人可删)。');
await b.close();
