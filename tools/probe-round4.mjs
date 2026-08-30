// 第4轮探针：标题栏 ::before / 浅色文档区 / 像素图标 mask
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const root = document.querySelector('#root > div > div > div:first-child > div > div');
  const before = root && getComputedStyle(root, '::before');
  const btn = document.querySelector('#root > div > div > div:first-child > div > div > button:nth-child(2)');
  const bs = btn && getComputedStyle(btn);
  const btnSvg = btn && btn.querySelector('svg');
  return {
    titlebar: before ? { content: before.content, h: before.height, layers: (before.backgroundImage.match(/linear-gradient/g) || []).length } : 'no ::before',
    newSession: bs ? { mask: (bs.getPropertyValue('mask-image') || '').slice(0, 40), svgMask: btnSvg ? (getComputedStyle(btnSvg).maskImage || '').slice(0, 40) : null } : null,
    theme: document.documentElement.getAttribute('data-theme'),
  };
});
console.log(JSON.stringify(r, null, 2));
// 切浅色再查文档区底色
await p.click('[aria-label="切换深浅主题"]');
await p.waitForTimeout(800);
const r2 = await p.evaluate(() => {
  const sp = document.querySelector('[data-conversation-scroll]');
  const html = getComputedStyle(document.documentElement);
  return {
    theme: document.documentElement.getAttribute('data-theme'),
    bgDeepVar: html.getPropertyValue('--mc-bg-deep').trim(),
    scrollportBg: sp ? getComputedStyle(sp).backgroundColor : '(no scrollport)',
  };
});
console.log(JSON.stringify(r2, null, 2));
await p.screenshot({ path: 'shots/round4-light.png' });
await b.close();
