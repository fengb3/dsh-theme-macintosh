// tools/live-common.mjs — 验收二轮共用:打开 3080、可选切会话、便利函数
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SHOTS = join(ROOT, 'shots');
mkdirSync(SHOTS, { recursive: true });
export const URL = 'http://127.0.0.1:3080';

export async function boot(viewport = { width: 1440, height: 900 }) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  return { browser, page };
}

// 侧栏按标题开头切会话(先展开全部「展开其余 N 个会话」)
export async function openSession(page, titlePrefix) {
  await page.evaluate(() => { for (const more of [...document.querySelectorAll('.mc-sb-more')]) { try { more.click(); } catch (e) {} } });
  await page.waitForTimeout(700);
  const r = await page.evaluate((p) => {
    const rows = [...document.querySelectorAll('.mc-sess')];
    const row = rows.find((n) => ((n.getAttribute('title') || '')).startsWith(p));
    if (row) { row.click(); return row.getAttribute('title').slice(0, 50); }
    return null;
  }, titlePrefix);
  await page.waitForTimeout(3000);
  return r;
}

export async function send(page, text) {
  const byRole = page.getByRole('textbox', { name: '描述你想要构建的内容' });
  try { await byRole.fill(text, { timeout: 8000 }); } catch (e) {
    await page.locator('[data-composer-card] textarea').first().fill(text, { timeout: 8000 });
  }
  await page.keyboard.press('Enter');
}

export async function setTheme(page, label) {
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button, [role=button]')]
      .find((b) => ((b.getAttribute('aria-label') || b.textContent || '').trim() === '设置'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(900);
  await page.evaluate((name) => {
    const n = [...document.querySelectorAll('[role=radio], [role=option], button, label')]
      .find((x) => (x.getAttribute('aria-label') || x.textContent || '').trim() === name);
    if (n) n.click();
  }, label);
  const want = label === '浅色' ? 'light' : 'dark';
  for (let i = 0; i < 20; i++) {
    if (await page.evaluate((w) => document.documentElement.getAttribute('data-theme') === w, want)) break;
    await page.waitForTimeout(400);
  }
  return page.evaluate(() => document.documentElement.getAttribute('data-theme'));
}

// 滚动到某元素并截其区域图(带 padding)
export async function shotEl(page, el, name, pad = 30) {
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const clip = await el.evaluate((node, p) => {
    const r = node.getBoundingClientRect();
    return { x: Math.max(0, r.x - p), y: Math.max(0, r.y - p), width: r.width + 2 * p, height: r.height + 2 * p };
  }, pad);
  await page.screenshot({ path: join(SHOTS, name), clip });
}
