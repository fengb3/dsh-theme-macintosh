// tools/verify-flow.mjs — flow 模块门禁(T9):launch chromium → GUI@3080 →
// composer 发送 s-md 真消息驱动真实回合(T2 已验证可行)→ 深色断言集 →
// 官方 设置→外观 切浅色(Ruling 9:月牙钮不存在,UI 点击路径)→ 浅色断言集(accent/sel-bg 反转)→
// 还原深色并关设置面板。断言值 = T2-T7 各任务 live 断言的脚本化(与 progress.md 冲突扫描表一致)。
// 附带(有则门禁/无则记录):think 卡 r-card;steering live 不足时合成节点验 :is 同构(Ruling 4①)。
// 非门禁尝试(输出 INFO,不影响退出码):非空 images slot 附件上传(Ruling 4②,不稳则 deferred)。
// 退出码:0 = GREEN,1 = RED。
import { chromium } from 'playwright';
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(ROOT, 'shots'), { recursive: true });

const URL = 'http://127.0.0.1:3080';

// s-md 源文:prototype/macintosh-interactive.html L1016 的 md 值(HTML)按「去 JS 转义」
// 转写为 markdown 源字面量(T2 实测同款,助手原样回显后由宿主 .md 渲染)。
const S_MD = [
  '# 一级标题 Heading 1',
  '## 二级标题 Heading 2',
  '### 三级标题 Heading 3',
  '',
  '正文段落:经典麦金塔主题的 **加粗**、*斜体*、`行内代码 inline_code()`、以及一个 [超链接](https://example.com)。段与段之间有 8px 间距,长文本自动换行并保持 1.8 倍行距。',
  '',
  '第二段:验证 p + p 的 margin-top。',
  '',
  '> 引用块 blockquote — 左侧 2px 淡紫竖线,文字 muted。适合放补充说明或原文摘录。',
  '',
  '### 无序列表',
  '- 列表项一',
  '- 列表项二 `带行内代码`',
  '- 列表项三',
  '',
  '### 有序列表',
  '1. 第一步:拆数',
  '2. 第二步:分配律',
  '3. 第三步:合并',
  '',
  '### 代码块',
  '```js',
  'function mul9(x) {',
  '  return 9 * (x - 2) + 18; // 拆数还原',
  '}',
  'mul9(8); // => 72',
  '```',
  '',
  '### 表格',
  '| 拆法 | 算式 | 结果 |',
  '| --- | --- | --- |',
  '| 10 − 2 | 9×10 − 9×2 | 72 |',
  '| 3 × 8 × 3 | (9×8)×1 | 72 |',
  '| 7 = 10 − 3 | 6×10 − 6×3 | 42 |',
  '',
  '以上覆盖 .md 支持的全部语法:h1–h3、段落、加粗/斜体、行内 code、链接、引用、ul/ol、pre 代码块、table。',
].join('\n');
const PROMPT = '请把以下 markdown 内容作为你的回复正文逐字原样输出(不要把它包进代码块围栏里,直接输出 markdown 源码本身):\n\n' + S_MD;

// 期望值(tokens.js 深浅两套;与 T2-T7 live 实测一致)
const EXPECT = {
  dark: {
    bubbleBg: 'rgb(218, 218, 255)', bubbleColor: 'rgb(31, 31, 46)', // accent / accent-ink
    codeBg: 'rgba(218, 218, 255, 0.26)',                            // --mc-sel-bg
    preBg: 'rgb(31, 31, 31)',                                       // --mc-bg-deep
    thBg: 'rgb(74, 74, 74)',                                        // --mc-surface-2
    injectBg: 'rgb(74, 74, 74)',
  },
  light: {
    bubbleBg: 'rgb(143, 143, 192)', bubbleColor: 'rgb(255, 255, 255)',
    codeBg: 'rgb(218, 218, 255)',
    preBg: 'rgb(255, 255, 255)',
    thBg: 'rgb(238, 238, 238)',
    injectBg: 'rgb(238, 238, 238)',
  },
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const logs = [];
page.on('console', (m) => { const t = m.text(); if (t.includes('[mcx]')) logs.push(t); });
page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));

let ok = true;
const check = (name, cond) => { console.log((cond ? 'PASS ' : 'FAIL ') + name); if (!cond) ok = false; };
const info = (name, val) => console.log('INFO ' + name + ' ' + JSON.stringify(val));

// —— 通用:等待选择器出现(poll,不用 waitForSelector 以便打印进度)——
async function waitFor(selector, timeoutMs, everyMs = 3000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await page.evaluate((s) => !!document.querySelector(s), selector)) return true;
    await page.waitForTimeout(everyMs);
  }
  return await page.evaluate((s) => !!document.querySelector(s), selector);
}

// —— 官方深浅切换(Ruling 9:设置→外观,UI 点击;T5/T8 实测路径)——
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

// —— composer 定位(T2 实测:role textbox,名称取 placeholder)——
async function composerFill(text) {
  const byRole = page.getByRole('textbox', { name: '描述你想要构建的内容' });
  try { await byRole.fill(text, { timeout: 8000 }); return 'role'; } catch (e) { /* fallback */ }
  await page.locator('[data-composer-card] textarea').first().fill(text, { timeout: 8000 });
  return 'css-fallback';
}

// —— flow 探针:一次 evaluate 取齐全部断言素材(作用于当前打开的会话)——
async function flowProbe() {
  return await page.evaluate(() => {
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const fc = document.querySelector('[data-chat-flow]');
    // 气泡:bubbleUser 四层链全命中中挑「有盒」节点(空 images slot 为 display:contents 无盒,裁定10 归属注记)
    let bubble = null;
    for (const el of document.querySelectorAll(':is([data-chat-flow-kind="user"],[data-chat-flow-kind="steering"])>div>div>div>div')) {
      if (el.getClientRects().length) { bubble = el; break; }
    }
    const step = document.querySelector('[data-chat-flow-kind="assistant-step"]');
    const h1 = step && step.querySelector('h1');
    const code = step && step.querySelector('p code, li code');
    const mcb = document.querySelector('.md-code-block');
    const pre = mcb || (step && step.querySelector('pre')); // 真实回合 pre 透明由 wrapper 兜底(T2 实证);裸 pre 值同
    const th = step && step.querySelector('th');
    const inject = document.querySelector('[data-chat-flow-kind="context"], [data-chat-flow-kind="compaction"], [data-chat-flow-kind="manual-compaction"]');
    const ttBtn = document.querySelector('[data-turn-tail] button');
    const think = document.querySelector('[data-variant="think"]');
    const b = cs(bubble);
    return {
      theme: document.documentElement.getAttribute('data-theme'),
      gap: fc ? cs(fc).gap : null,
      bubble: b ? { radius: b.borderRadius, bg: b.backgroundColor, color: b.color, font: b.fontSize, btw: b.borderTopWidth } : null,
      h1: h1 ? { size: cs(h1).fontSize, weight: cs(h1).fontWeight, text: (h1.textContent || '').slice(0, 24) } : null,
      codeBg: code ? cs(code).backgroundColor : null,
      preBg: pre ? cs(pre).backgroundColor : null,
      thBg: th ? cs(th).backgroundColor : null,
      inject: inject ? { style: cs(inject).borderStyle, bg: cs(inject).backgroundColor, kind: inject.getAttribute('data-chat-flow-kind') } : null,
      ttBtn: ttBtn ? { w: cs(ttBtn).width, h: cs(ttBtn).height } : null,
      think: think ? { radius: cs(think).borderRadius, state: think.getAttribute('data-state') } : null,
      kinds: [...document.querySelectorAll('[data-chat-flow-kind]')]
        .map((e) => e.getAttribute('data-chat-flow-kind'))
        .reduce((m, k) => { m[k] = (m[k] || 0) + 1; return m; }, {}),
    };
  });
}

function assertRound(label, r, exp) {
  console.log(`[${label}-probe] ` + JSON.stringify(r, null, 2));
  check(`${label}: html[data-theme=${exp === EXPECT.dark ? 'dark' : 'light'}]`, r.theme === (exp === EXPECT.dark ? 'dark' : 'light'));
  check(`${label}: flowColumn gap 14px`, r.gap === '14px');
  check(`${label}: 气泡 radius 8px`, !!r.bubble && r.bubble.radius === '8px');
  check(`${label}: 气泡 accent 底(${exp.bubbleBg})`, !!r.bubble && r.bubble.bg === exp.bubbleBg);
  check(`${label}: 气泡 accent-ink 字(${exp.bubbleColor})`, !!r.bubble && r.bubble.color === exp.bubbleColor);
  check(`${label}: 气泡 1px border + ui 14px`, !!r.bubble && r.bubble.btw === '1px' && r.bubble.font === '14px');
  check(`${label}: md h1 17px/600`, !!r.h1 && r.h1.size === '17px' && r.h1.weight === '600');
  check(`${label}: 行内 code sel-bg(${exp.codeBg})`, r.codeBg === exp.codeBg);
  check(`${label}: 代码块 bg-deep(${exp.preBg})`, r.preBg === exp.preBg);
  check(`${label}: th surface-2(${exp.thBg})`, r.thBg === exp.thBg);
  check(`${label}: 注入条 dashed + surface-2`, !!r.inject && r.inject.style === 'dashed' && r.inject.bg === exp.injectBg);
  check(`${label}: turn-tail 钮 20×20`, !!r.ttBtn && r.ttBtn.w === '20px' && r.ttBtn.h === '20px');
  if (r.think) check(`${label}: think 卡 r-card 4px(有则)`, r.think.radius === '4px');
  else info(`${label}: think 卡不在场(live streaming 已结束/无 reasoning)→ 记 deferred`, null);
}

// ═══ 主流程 ═══
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000); // 主题样式注入 + 会话恢复(verify-persistent 同款节律)

// 0) 起点归一:确保深色(T8 收尾即深色;若漂移走官方通道切回)
let theme0 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
if (theme0 !== 'dark') { const s = await setTheme('深色'); info('起点非深色,已切', s); await page.waitForTimeout(1200); }

// 1) 发送 s-md 真消息(hero 态 composer 发送即新建会话;T2 路径)
const how = await composerFill(PROMPT);
await page.keyboard.press('Enter');
info('s-md 已发送', { composer: how, chars: PROMPT.length });
const gotUser = await waitFor('[data-chat-flow-kind="user"]', 45000, 2000);
check('发送后 user 回合渲染', gotUser);
const gotH1 = await waitFor('[data-chat-flow-kind="assistant-step"] h1', 300000, 3000);
check('助手回显 s-md(assistant-step h1 在场)', gotH1);
const gotTail = await waitFor('[data-turn-tail]', 120000, 3000);
check('回合收尾 turn-tail 在场', gotTail);
await page.waitForTimeout(1500); // 收尾渲染稳定

// 2) 深色轮断言
const dark = await flowProbe();
assertRound('dark', dark, EXPECT.dark);

// steering:live 有则断言 live;无则合成节点验 :is 同构(Ruling 4①)
if ((dark.kinds.steering || 0) > 0) {
  const liveSteer = await page.evaluate(() => {
    let bubble = null;
    for (const el of document.querySelectorAll('[data-chat-flow-kind="steering"]>div>div>div>div')) {
      if (el.getClientRects().length) { bubble = el; break; }
    }
    if (!bubble) return null;
    const c = getComputedStyle(bubble);
    return { radius: c.borderRadius, bg: c.backgroundColor, color: c.color };
  });
  check('steering live 气泡同构(radius 8/accent/ink)', !!liveSteer && liveSteer.radius === '8px' && liveSteer.bg === EXPECT.dark.bubbleBg && liveSteer.color === EXPECT.dark.bubbleColor);
} else {
  const synth = await page.evaluate(() => {
    const fc = document.querySelector('[data-chat-flow]');
    if (!fc) return null;
    const el = document.createElement('div');
    el.setAttribute('data-chat-flow-kind', 'steering');
    el.innerHTML = '<div><div><div><div>steering-synth</div></div></div></div>';
    fc.appendChild(el);
    const inner = el.firstElementChild.firstElementChild.firstElementChild.firstElementChild;
    const c = getComputedStyle(inner);
    const out = { radius: c.borderRadius, bg: c.backgroundColor, color: c.color };
    el.remove();
    return out;
  });
  // 背景不参与合成断言:气泡 accent 底来自宿主 .bubble 类的 background:var(--dsw-specific-bubble)
  // (由 overrideTokens 变量通道供值),合成节点无宿主类、结构上不可能有底——变量通道已由真 user
  // 气泡断言证得;此处验 :is 规则本身对 kind=steering 的同构命中(radius/color/border 均我方规则)。
  check('steering 合成 :is 同构(radius 8 + ink 字)', !!synth && synth.radius === '8px' && synth.color === EXPECT.dark.bubbleColor);
  info('steering live 0 节点 → 已用合成节点验 :is 同构(Ruling 4①;bg 不适用,见注释)', synth);
}
await page.screenshot({ path: join(ROOT, 'shots', 'flow-verify-dark.png') });

// 3) 浅色轮(官方 设置→外观→浅色)
const sw = await setTheme('浅色');
check('官方外观通道切浅色', sw.clicked && sw.flipped && sw.theme === 'light');
await page.waitForTimeout(1200);
const light = await flowProbe();
assertRound('light', light, EXPECT.light);
await page.screenshot({ path: join(ROOT, 'shots', 'flow-verify-light.png') });

// 4) 还原深色 + 关设置
const back = await setTheme('深色');
check('测毕还原深色', back.flipped && back.theme === 'dark');
await page.keyboard.press('Escape').catch(() => {});
await page.waitForTimeout(600);

// 5) 非门禁尝试:非空 images slot(Ruling 4②;不稳则 deferred)
try {
  const hasInput = await page.evaluate(() => !!document.querySelector('input[type=file]'));
  if (!hasInput) {
    info('images slot 回验 deferred:composer 无 input[type=file] 可锚', null);
  } else {
    const shotsDir = join(ROOT, 'shots');
    const png = readdirSync(shotsDir).filter((f) => f.endsWith('.png'))
      .map((f) => ({ f, s: statSync(join(shotsDir, f)).size })).sort((a, b) => a.s - b.s)[0];
    await page.locator('input[type=file]').first().setInputFiles(join(shotsDir, png.f), { timeout: 10000 });
    await page.waitForTimeout(1500);
    await composerFill('气泡图片附件样式验证(T9 images slot 回验)');
    await page.keyboard.press('Enter');
    const gotImg = await waitFor('[data-slot="conversation.message.images"]:not(:empty)', 120000, 3000);
    if (!gotImg) {
      info('images slot 回验 deferred:上传后未出现非空 images slot(上传链不稳)', { tried: png.f });
    } else {
      const g = await page.evaluate(() => {
        const item = document.querySelector('[data-align="end"] [data-variant]');
        if (!item) return null;
        const c = getComputedStyle(item);
        return { btw: c.borderTopWidth, radius: c.borderRadius };
      });
      check('非空 images slot:userGallery 图廓 1px + r-card', !!g && g.btw === '1px' && g.radius === '4px');
    }
  }
} catch (e) {
  info('images slot 回验 deferred(异常):' + e.message.split('\n')[0], null);
}

console.log('--- [mcx] console lines (tail 10) ---');
for (const l of logs.slice(-10)) console.log(l);
await browser.close();
console.log(ok ? 'VERIFY: GREEN' : 'VERIFY: RED');
process.exit(ok ? 0 : 1);
