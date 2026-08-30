// 探针：查 __ModuleLoader__ 里 macintosh 相关的重复模块/fiber
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(8000);
const info = await page.evaluate(() => {
  const out = {};
  const boot = window.__DSH_BOOT__;
  out.bootKeys = boot ? Object.keys(boot) : null;
  const hits = [];
  const walk = (v, path, depth) => {
    if (depth > 6 || v == null) return;
    if (typeof v === 'string') { if (/macintosh/i.test(v)) hits.push(path + ' = ' + v.slice(0, 120)); return; }
    if (typeof v !== 'object') return;
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, path + '[' + i + ']', depth + 1)); return; }
    for (const k of Object.keys(v)) walk(v[k], path + '.' + k, depth + 1);
  };
  walk(boot, 'boot', 0);
  out.macintoshHits = hits.slice(0, 20);
  const scripts = [...document.querySelectorAll('script[src]')].map((s) => s.src).filter((s) => /plugin|macintosh/i.test(s));
  out.pluginScripts = scripts;
  return out;
});
console.log(JSON.stringify(info, null, 2).slice(0, 3000));
await browser.close();
