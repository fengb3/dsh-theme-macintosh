// tools/probe-menus.mjs — 宿主菜单管道探针(2026-09;勘定 MC_MAP menu 段与动作接线)
// 用法: node tools/probe-menus.mjs   (宿主须运行于 127.0.0.1:3080)
// 勘察目标:
//  1. sidebar 会话行/分组头是否有宿主原生 contextmenu(右键)或 dots 菜单 → portal 挂哪、菜单项 label 列表
//  2. 菜单项动作如何触发: 元素 data-* / aria / click 委托 / 服务名(ctx.sessions.* 有哪些方法)
//  3. slots 注册表有无 menu 相关 keyed 槽(遍历 slots.list?.() 或 fiber 注册表)
//  4. window 上的宿主调试钩子 dump
//  5. DOM mutation 监听: 右键/点 dots 后 300ms 内新增的 body 子节点(菜单 portal)
import { chromium } from 'playwright';
const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto('http://127.0.0.1:3080');
await pg.waitForTimeout(1500);

// 装一个常驻 mutation 观察器: 记录 body 直接子节点的新增(portal 最常见挂点)
await pg.evaluate(() => {
  window.__PROBE_ADDED__ = [];
  new MutationObserver((muts) => {
    for (const m of muts) for (const n of m.addedNodes) {
      if (n.nodeType === 1) window.__PROBE_ADDED__.push({
        parent: n.parentElement ? (n.parentElement.tagName + '.' + n.parentElement.className) : '(none)',
        tag: n.tagName, cls: n.className, id: n.id,
        attrs: [...n.attributes].map((a) => a.name + '=' + a.value).slice(0, 12).join(' '),
        text: (n.textContent || '').slice(0, 300),
      });
    }
  }).observe(document.body, { childList: true, subtree: true });
});
const drainAdded = () => pg.evaluate(() => { const a = window.__PROBE_ADDED__; window.__PROBE_ADDED__ = []; return a; });
const fmtAdded = (a) => a.map((x) => `[${x.parent}] <${x.tag} id=${x.id} class="${x.cls}" ${x.attrs}>\n  TEXT: ${x.text.replace(/\n/g, ' | ')}`).join('\n');

// 0: 侧栏结构 dump(确认当前是官方树还是我们主题渲染的 McFinder)
const sidebarDump = await pg.evaluate(() => {
  const pick = (sel) => [...document.querySelectorAll(sel)].slice(0, 12).map((n) =>
    n.tagName + '.' + String(n.className).slice(0, 60) + ' :: ' + (n.getAttribute('aria-label') || n.getAttribute('role') || '') + ' :: ' + (n.textContent || '').slice(0, 60));
  return {
    officialTreeitems: pick('div[role="treeitem"]'),
    mcRows: pick('.mc-sess, .mc-sb-folder, [data-mc-finder], .mc-titlebar'),
    dotsButtons: [...document.querySelectorAll('button')].map((b2) => b2.getAttribute('aria-label') || '').filter((l) => l && (l.includes('操作') || l.includes('菜单') || l.includes('更多'))),
    bodyChildren: [...document.body.children].map((n) => n.tagName + '.' + String(n.className).slice(0, 60)),
  };
});
console.log('SIDEBAR_DUMP:\n' + JSON.stringify(sidebarDump, null, 1));

// A: 右键会话行(先官方 treeitem;被遮蔽则回退我们主题的 .mc-sess 行) → dump 300ms 内新增节点
let row = await pg.$('div[role="treeitem"]');
let rowKind = 'official-treeitem';
if (!row) { row = await pg.$('.mc-sess'); rowKind = 'mc-sess(主题行)'; }
console.log('RIGHTCLICK_TARGET: ' + (row ? rowKind : 'NONE'));
if (row) {
  await drainAdded();
  await row.click({ button: 'right' });
  await pg.waitForTimeout(300);
  console.log('ADDED_AFTER_RIGHTCLICK:\n' + (fmtAdded(await drainAdded()) || '(无新增节点)'));
  await pg.keyboard.press('Escape').catch(() => {});
}
const dump = await pg.evaluate(() => {
  const out = [];
  for (const el of document.body.children) out.push(el.tagName + '.' + el.className + ' :: ' + (el.textContent || '').slice(0, 200));
  return out;
});
console.log('BODY_CHILDREN_AFTER_RIGHTCLICK:\n' + dump.join('\n'));

// A2: 左键 dots 按钮(aria-label 含「的操作」/「操作」) → dump 300ms 内新增节点(菜单 portal)
const dots = await pg.$('button[aria-label$="的操作"]');
if (dots) {
  await drainAdded();
  await dots.click();
  await pg.waitForTimeout(300);
  console.log('ADDED_AFTER_DOTS_CLICK:\n' + (fmtAdded(await drainAdded()) || '(无新增节点)'));
  const menuDump = await pg.evaluate(() => {
    // 全 DOM 找疑似菜单结构: role=menu / [data-menu] / 大段绝对定位浮层
    const menus = [...document.querySelectorAll('[role="menu"], [role="menuitem"], [data-menu], [data-radix-popper-content-wrapper], [data-floating-ui-portal]')];
    return menus.slice(0, 30).map((n) => n.tagName + '.' + String(n.className).slice(0, 80) + ' :: ' + (n.getAttribute('role') || '') + ' :: ' + (n.textContent || '').slice(0, 200));
  });
  console.log('MENU_LIKE_NODES_AFTER_DOTS:\n' + (menuDump.join('\n') || '(无)'));
  await pg.keyboard.press('Escape').catch(() => {});
} else {
  console.log('ADDED_AFTER_DOTS_CLICK: (无 dots 按钮)');
}

// B: slots 注册表(经我们插件的 ctx 不可达则跳过;kit __MC_KIT_OPEN__ 不开)
// C: 宿主 sessions 服务面(经 window 上的调试钩子若有;无则记 NO_SURFACE)
const hooks = await pg.evaluate(() => {
  const out = [];
  for (const k of Object.getOwnPropertyNames(window)) {
    if (/^(__|dsh|DSH|mc|MC)/i.test(k) || /debug|hook|slot|registry|portal/i.test(k)) {
      try { out.push(k + ' :: ' + typeof window[k]); } catch (e) {}
    }
  }
  return out;
});
console.log('WINDOW_HOOKS:\n' + hooks.join('\n'));
console.log('SESSIONS_SURFACE: NO_SURFACE (window 无宿主服务面直达;插件 ctx 才可达)');

console.log('PROBE_DONE');
await b.close();
