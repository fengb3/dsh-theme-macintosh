// finder 真数据冒烟：分组/会话/选中/控制台 error 断言 + 截图 shots/finder-data.png
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
p.on('pageerror', (e) => errors.push(String(e)));
await p.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(6000);

const r = await p.evaluate(() => {
  const find = document.querySelector('.mc-sb-find');
  if (!find) return { ok: false, reason: 'no .mc-sb-find' };
  const groups = [...find.querySelectorAll('.mc-group')].map((g) => ({
    name: (g.querySelector('.mc-g-name') || {}).textContent || '',
    count: (g.querySelector('.mc-g-count') || {}).textContent || '',
    sess: [...g.querySelectorAll('.mc-sess')].map((s) => ({
      title: (s.querySelector('.mc-s-tt') || {}).textContent || '',
      sel: s.getAttribute('aria-selected'), cls: s.className,
    })),
  }));
  const totalSess = find.querySelectorAll('.mc-sess').length;
  const selected = find.querySelectorAll('.mc-sess.on, .mc-sess[aria-selected="true"]').length;
  return {
    ok: true, groupCount: groups.length, groups, totalSess, selected,
    groupNames: groups.map((g) => g.name),
  };
});
mkdirSync('shots', { recursive: true });
await p.screenshot({ path: 'shots/finder-data.png' });

const groupNames = r.groupNames || [];
const checks = {
  finderMounted: r.ok === true,
  groupCountGe1: (r.groupCount || 0) >= 1,
  hasRealWorkspaceName: groupNames.some((n) => n === 'dsh-theme-macintosh' || /^(dsh-|repos|source|Users|[a-z0-9._-]+)$/i.test(n) && n !== '未命名'),
  sessRowsGt5: (r.totalSess || 0) > 5,
  hasSelectedRow: (r.selected || 0) >= 1,
  noNewConsoleErrors: errors.length === 0,
};
console.log(JSON.stringify({ checks, groupNames, totalSess: r.totalSess, selected: r.selected, errors: errors.slice(0, 5), sample: r.groups && r.groups[0] }, null, 2));
const allOk = Object.values(checks).every(Boolean);
console.log(allOk ? 'SMOKE: GREEN' : 'SMOKE: RED');
await b.close();
process.exit(allOk ? 0 : 1);
