// tools/probe-banner-diag2.mjs — 舞台背景三联对照(纯色 / 纯 pattern / 色+pattern)+ pattern 贴片解码
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const URL = 'http://127.0.0.1:3080';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
const pg = await ctx.newPage();
await pg.goto(URL, { waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(8000);
await pg.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });
await pg.addInitScript(() => { window.__MC_KIT_OPEN__ = true; });
await pg.reload({ waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(9000);
await pg.evaluate(() => { document.documentElement.dataset.theme = 'dark'; });

const r = await pg.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const bg = cs.getPropertyValue('--mc-bg').trim();
  const pat = cs.getPropertyValue('--mc-desktop-pattern').trim();
  const mk = (id, extra) => {
    const d = document.createElement('div');
    d.id = id;
    d.style.cssText = 'position:fixed;top:40px;width:300px;height:300px;z-index:2147483000;' + extra;
    document.body.appendChild(d);
    return d;
  };
  mk('mcx-a', 'left:40px;background-color:' + bg + ';');
  mk('mcx-b', 'left:380px;background-image:' + pat + ';background-size:8px 8px;');
  mk('mcx-c', 'left:720px;background-color:' + bg + ';background-image:' + pat + ';background-size:8px 8px;');
  const out = { bg, pat: pat.slice(0, 260) };
  const strip = (id) => {
    const n = document.getElementById(id);
    const c = getComputedStyle(n);
    return { bgc: c.backgroundColor, bgi: c.backgroundImage.slice(0, 50) };
  };
  out.a = strip('mcx-a'); out.b = strip('mcx-b'); out.c = strip('mcx-c');
  // pattern 贴片本体:把 data-URI 里的 base64 抠出来交给外部解码
  const m = pat.match(/base64,([A-Za-z0-9+/=]+)/);
  out.tileB64 = m ? m[1] : null;
  return out;
});
console.log(JSON.stringify({ ...r, tileB64: r.tileB64 ? r.tileB64.slice(0, 40) + '...' : null, tileB64Len: (r.tileB64 || '').length }, null, 1));
if (r.tileB64) writeFileSync(join(process.cwd(), 'shots', 'mcx-pattern-tile.png'), Buffer.from(r.tileB64, 'base64'));

await wait(300);
await pg.screenshot({ path: join(process.cwd(), 'shots', 'mcx-bg-abc.png'), clip: { x: 40, y: 40, width: 980, height: 300 } });
console.log('SHOT shots/mcx-bg-abc.png');
await browser.close();
