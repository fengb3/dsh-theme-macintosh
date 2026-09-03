// tools/probe-ask-diag.mjs — ask 批验收轮三疑点诊断(throwaway 保留复勘用)
// 疑点: ①单选题选项不可见 ②多选复选框与文字错位 ③plan 确认钮未吃 btnPrimary 皮
// 链路: 一会话三连——单选卡 dump→作答 / 多选卡几何 dump→作答 / plan 模式审批卡 dump→批准。
// 方法论: probe-ask v3 自治形态(新会话自问自答);ask 阻塞回合,指令逐条发。
import { chromium } from 'playwright';

const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(2500);

// 新建会话 + 等坞
await pg.evaluate(() => {
  const btn = [...document.querySelectorAll('button[aria-label="新建会话"]')].find((x) => !x.closest('[data-mc-finder]'));
  if (btn) btn.click();
});
await pg.waitForTimeout(1500);
const ready = await pg.evaluate(() => {
  const d = document.querySelector('[data-mc-dock]');
  return !!(d && d.querySelector('textarea'));
});
if (!ready) { console.log('FATAL no dock'); await b.close(); process.exit(2); }

const send = async (txt) => {
  await pg.fill('[data-mc-dock] textarea', txt);
  await pg.waitForTimeout(300);
  await pg.click('[data-mc-dock] [data-mc-send]');
};
const waitCard = async (sel, label) => {
  for (let i = 0; i < 300; i++) {
    if (await pg.evaluate((s) => !!document.querySelector(s), sel)) return true;
    if (i % 40 === 39) console.log('...polling ' + label + ' ' + (i + 1) + '/300');
    await pg.waitForTimeout(500);
  }
  return false;
};
const answer = async () => { // 选未选项→点 primary,循环至卡消
  for (let r = 0; r < 12; r++) {
    if (await pg.evaluate(() => !document.querySelector('[data-question-key]'))) return true;
    await pg.evaluate(() => {
      const o = document.querySelector('[data-question-key] [role=radio][aria-checked="false"],[data-question-key] [role=checkbox][aria-checked="false"]');
      if (o) o.click();
    });
    await pg.waitForTimeout(400);
    await pg.evaluate(() => {
      const card = document.querySelector('[data-question-key] section');
      const p = card && [...card.querySelectorAll('button')].find((x) => !x.disabled && /下一题|提交|Next|Submit/i.test(x.textContent || ''));
      if (p) p.click();
    });
    await pg.waitForTimeout(900);
  }
  return false;
};

// ═══ 疑点①: 单选卡(用户原题)——选项为何不可见 ═══
await send('调用 ask_user_question 工具问我一道单选题:question="主题验收:单选隐数字可以吗",header="验收",options=["A 隐数字,像素环足够","B 数字保留进方框"],收到回答后结束回合。');
if (await waitCard('[data-question-key]', 'single')) {
  await pg.waitForTimeout(800);
  const d1 = await pg.evaluate(() => {
    const frame = document.querySelector('[data-question-key]');
    const cs = (el) => {
      if (!el) return null;
      const c = getComputedStyle(el); const r = el.getBoundingClientRect();
      return { display: c.display, visibility: c.visibility, opacity: c.opacity, h: Math.round(r.height), w: Math.round(r.width), color: c.color, bg: c.backgroundColor };
    };
    const grp = frame.querySelector('[role="radiogroup"],[role="group"]');
    const radios = [...frame.querySelectorAll('[role="radio"]')];
    return {
      frameIn: !!frame,
      scrollIn: !!frame.querySelector('[data-question-scroll]'),
      bodyCls: (frame.querySelector('[data-question-scroll]') || {}).className || null,
      grpRole: grp ? grp.getAttribute('role') : null,
      grp: cs(grp),
      radioCount: radios.length,
      radios: radios.map((x) => ({ checked: x.getAttribute('aria-checked'), cs: cs(x), text: (x.textContent || '').slice(0, 24) })),
      optClsSample: radios.length ? String(radios[0].className) : null,
      parentChainCls: (() => { let n = radios[0] || grp; const out = []; while (n && n.tagName !== 'SECTION') { out.push(n.tagName + '.' + String(n.className).slice(0, 40)); n = n.parentElement; } return out; })(),
    };
  });
  console.log('① SINGLE:', JSON.stringify(d1, null, 1));
  await pg.screenshot({ path: 'shots/diag-single.png' });
  console.log('① answer:', await answer());
} else console.log('① TIMEOUT no single card');

// ═══ 疑点②: 多选卡——复选框与文字几何 ═══
await send('再问一道多选题:question="主题验收:多选对齐",header="验收",options=["A 选项甲","B 选项乙","C 选项丙"],收到回答后结束回合。');
if (await waitCard('[data-question-key] [role="checkbox"]', 'multi')) {
  await pg.waitForTimeout(800);
  const d2 = await pg.evaluate(() => {
    const frame = document.querySelector('[data-question-key]');
    const rows = [...frame.querySelectorAll('[role="checkbox"]')];
    const rect = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), h: Math.round(r.height) }; };
    return rows.slice(0, 2).map((row) => {
      const box = row.querySelector('[class*="checkbox"]');
      const label = row.querySelector('[class*="Label"],[class*="label"],[class*="Line"]');
      const rowR = rect(row); const boxR = box ? rect(box) : null; const labR = label ? rect(label) : null;
      return {
        rowCls: String(row.className).slice(0, 50), row: rowR,
        boxCls: box ? String(box.className).slice(0, 40) : null, box: boxR,
        labelCls: label ? String(label.className).slice(0, 40) : null, label: labR,
        boxDisp: box ? getComputedStyle(box).position + '/' + getComputedStyle(box).top : null,
        rowPad: getComputedStyle(row).paddingLeft + '/' + getComputedStyle(row).paddingTop,
      };
    });
  });
  console.log('② MULTI:', JSON.stringify(d2, null, 1));
  await pg.screenshot({ path: 'shots/diag-multi.png' });
  console.log('② answer:', await answer());
} else console.log('② TIMEOUT no multi card');

// ═══ 疑点③: plan 审批卡——确认钮类别与挂载位 ═══
// 访问模式切 plan: 点 composer 访问模式钮 → 官方菜单选「计划」项
const permOk = await pg.evaluate(() => {
  const btn = document.querySelector('[data-composer-card] button[aria-label^="访问模式"]');
  if (btn) { btn.click(); return true; }
  return false;
});
console.log('③ perm click:', permOk);
await pg.waitForTimeout(800);
const planMode = await pg.evaluate(() => {
  const items = [...document.querySelectorAll('body > div[role="menu"] [role="menuitem"]')];
  const it = items.find((x) => /计划|plan/i.test(x.textContent || ''));
  if (it) { it.click(); return (it.textContent || '').trim().slice(0, 20); }
  return null;
});
console.log('③ plan mode pick:', planMode);
await pg.waitForTimeout(600);
await send('请制定一个最小计划:在 README.md 末尾添加一行「ask 验收记录」。用计划提交通道把计划交给我审批,等我批准后再执行,除此之外什么都不要做。');
if (await waitCard('[data-plan-review-key]', 'plan')) {
  await pg.waitForTimeout(1000);
  const d3 = await pg.evaluate(() => {
    const frame = document.querySelector('[data-plan-review-key]');
    const cs = (el) => { if (!el) return null; const c = getComputedStyle(el); return { cls: String(el.className).slice(0, 60), bg: c.backgroundColor, border: c.borderTopWidth + ' ' + c.borderTopStyle + ' ' + c.borderTopColor, shadow: c.boxShadow.slice(0, 40), radius: c.borderRadius }; };
    const sec = frame.querySelector('section');
    const btns = [...frame.querySelectorAll('button')];
    const inSec = (el) => !!el.closest('section');
    return {
      secAria: sec ? sec.getAttribute('aria-label') : null,
      btns: btns.map((x) => ({ text: (x.textContent || '').trim().slice(0, 12), cls: String(x.className).slice(0, 70), inSection: inSec(x) })),
      primaryCandidates: btns.filter((x) => /_primary|primary/i.test(String(x.className))).map((x) => ({ text: (x.textContent || '').trim().slice(0, 12), inSection: inSec(x), cs: cs(x) })),
      strip: cs(frame.querySelector('[class*="strip"]')),
    };
  });
  console.log('③ PLAN:', JSON.stringify(d3, null, 1));
  await pg.screenshot({ path: 'shots/diag-plan.png' });
  // 批准放行(点确认类钮)
  await pg.evaluate(() => {
    const frame = document.querySelector('[data-plan-review-key]');
    const ok = frame && [...frame.querySelectorAll('button')].find((x) => /确认|批准|approve/i.test(x.textContent || ''));
    if (ok) ok.click();
  });
  await pg.waitForTimeout(2500);
} else console.log('③ TIMEOUT no plan card');

console.log('[diag] done(一次性会话留侧栏,主人可删)。');
await b.close();
