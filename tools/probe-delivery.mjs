// 实验：保持页面连接，等待外部触发 cordis_run 后检查插件是否被投递
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded', timeout: 60000 });
console.log('page loaded, waiting 75s for controller to trigger cordis_run...');
// 轮询检测 style[data-mc-root] 是否出现（run 后由 runner 注入）
for (let i = 0; i < 15; i++) {
  await page.waitForTimeout(5000);
  const st = await page.evaluate(() => ({
    root: document.querySelectorAll('style[data-mc-root]').length,
    t: Date.now(),
  }));
  console.log(`t+${(i + 1) * 5}s root=${st.root}`);
  if (st.root > 0) {
    const shot = 'shots/delivered.png';
    await page.screenshot({ path: shot });
    console.log('DELIVERED! screenshot:', shot);
    break;
  }
}
await browser.close();
