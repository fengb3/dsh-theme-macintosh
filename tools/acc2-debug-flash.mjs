// tools/acc2-debug-flash.mjs — ②think 摘要 flash 白块渲染 live 诊断 + ③渐变残留验证
// 真实流式回合:running think 卡上手动挂 .mc-line-flash 冻结观察几何/遮挡 + 自动流捕获
import { boot, openSession, send, shotEl } from './live-common.mjs';

const { browser, page } = await boot();
const log = (...a) => console.log(...a);
await openSession(page, '请先认真思考一下 9.11 与 9.9');

// 等待流式 running think 出现
log('sending...');
await send(page, '请先认真思考一下 12.34 与 43.21 哪个更大,思考过程长一些,然后一句话回答。');
let running = null;
for (let i = 0; i < 300 && !running; i++) {
  running = await page.evaluate(() => document.querySelector('[data-variant="think"][data-state="running"]'));
  if (!running) await page.waitForTimeout(200);
}
log('running think:', !!running);
if (!running) { await browser.close(); process.exit(1); }

// ═══ ③ running 态:disclosure row ::after(宿主 sweep)是否清净 ═══
{
  const r = await page.evaluate(() => {
    const t = document.querySelector('[data-variant="think"][data-state="running"]');
    const row = t.querySelector('[data-disclosure-row]');
    const ra = getComputedStyle(row, '::after');
    return { content: ra.content, bg: ra.backgroundImage, bgColor: ra.backgroundColor, anim: ra.animationName, w: ra.width };
  });
  log('③ sweep ::after:', JSON.stringify(r));
  const el = await page.$('[data-variant="think"][data-state="running"]');
  await shotEl(page, el, 'acc2-03-running-nosweep.png', 16);
}

// ═══ ② 诊断:冻结挂类 + 几何/遮挡全量画像 ═══
{
  const geo = await page.evaluate(() => {
    const t = document.querySelector('[data-variant="think"][data-state="running"]');
    const span = t.querySelector('[data-follow-end]');
    if (!span) return { err: 'no summary span' };
    span.classList.add('mc-line-flash'); // 冻结手动挂类(诊断渲染)
    const sr = span.getBoundingClientRect();
    const cs = getComputedStyle(span);
    const af = getComputedStyle(span, '::after');
    // 遮挡探测:取 span 中心点与四角内缩点,看 elementFromPoint 命谁
    const pts = [[sr.x + 5, sr.y + sr.height / 2], [sr.x + sr.width / 2, sr.y + sr.height / 2], [sr.x + sr.width - 5, sr.y + sr.height / 2]];
    const hits = pts.map(([x, y]) => {
      const el = document.elementFromPoint(x, y);
      return el ? el.tagName + '.' + (el.className || '').toString().slice(0, 40) : 'null';
    });
    // 祖先链 overflow / z-index / stacking
    const chain = [];
    for (let n = span.parentElement; n && n !== document.body; n = n.parentElement) {
      const c = getComputedStyle(n);
      chain.push({ tag: n.tagName, cls: (n.className || '').toString().slice(0, 36), ov: c.overflow, z: c.zIndex, pos: c.position, disp: c.display });
    }
    return {
      spanRect: { x: sr.x, y: sr.y, w: sr.width, h: sr.height },
      spanDisp: cs.display, spanPos: cs.position, spanOv: cs.overflow,
      after: { content: af.content, pos: af.position, inset: af.inset, w: af.width, h: af.height, bg: af.backgroundColor, bgi: af.backgroundImage.slice(0, 60), op: af.opacity, z: af.zIndex, clip: af.clipPath },
      hits, chain,
    };
  });
  log('② frozen geo:', JSON.stringify(geo, null, 1));
  const el = await page.$('[data-variant="think"][data-state="running"]');
  await shotEl(page, el, 'acc2-02-debug-frozen.png', 16);
}

// ═══ ② 自动流捕:轮询 .mc-line-flash 出现即截(100ms 窗口,尽力而为) ═══
{
  let caught = false;
  for (let i = 0; i < 250 && !caught; i++) {
    caught = await page.evaluate(() => !!document.querySelector('[data-follow-end].mc-line-flash'));
    if (caught) break;
    await page.waitForTimeout(40);
  }
  log('② auto flash caught:', caught);
  if (caught) {
    const el = await page.$('[data-variant="think"][data-state="running"]');
    await shotEl(page, el, 'acc2-02-auto-flash.png', 16);
  }
}

// 清理冻结类
await page.evaluate(() => { const s = document.querySelector('.mc-line-flash'); if (s) s.classList.remove('mc-line-flash'); });
await browser.close();
log('done');
