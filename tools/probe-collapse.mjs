// 探官方侧栏折叠：点折叠钮前后 DOM/宽度/类名变化 + 官方明暗信号属性
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(6000);
const snap = () => p.evaluate(() => {
  const col = document.querySelector('#root > div > div > div:first-child');
  const root = document.querySelector('#root > div > div > div:first-child > div > div');
  const logoBtns = [...(document.querySelector('#root > div > div > div:first-child > div > div > div:nth-child(1)') || { querySelectorAll: () => [] }).querySelectorAll('button')].map((x) => x.getAttribute('aria-label'));
  return {
    colW: Math.round(col.getBoundingClientRect().width),
    rootCls: String(root.className),
    logoBtns,
    gridCols: getComputedStyle(document.querySelector('#root > div > div')).gridTemplateColumns,
    bodyAttrs: [...document.body.attributes].map((a) => a.name + (a.value ? '=' + a.value : '')).filter((s) => /theme|dark|light|ds/i.test(s)),
    htmlAttrs: [...document.documentElement.attributes].map((a) => a.name).filter((s) => /theme|dark|light/i.test(s)),
    regionChildren: [...document.querySelector('#root > div > div > div:first-child > div > div > div:nth-child(3)').children].map((c) => String(c.className).slice(0, 30)),
  };
});
const before = await snap();
// 找侧栏切换钮并点击
const tog = p.locator('#root > div > div > div:first-child button[aria-label*="侧"], #root > div > div > div:first-child button').last();
await tog.click({ force: true }).catch((e) => console.log('click fail', e.message));
await p.waitForTimeout(1200);
const after = await snap();
// 再点回来（同一个钮或新位置）
await p.locator('#root > div > div > div:first-child button').first().click({ force: true }).catch(() => {});
await p.waitForTimeout(800);
const restored = await snap();
console.log(JSON.stringify({ before, after, restored }, null, 1));
await b.close();
