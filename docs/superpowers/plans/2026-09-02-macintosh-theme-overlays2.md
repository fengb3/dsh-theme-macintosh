# Macintosh 主题 · hero 空态 + dialog/scrim 换皮（overlays 批 2）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development 或
> executing-plans，逐任务实施。Steps 用 checkbox 跟踪。
> **Spec:** `docs/superpowers/specs/2026-09-02-macintosh-theme-overlays2-design.md`（同行；
> 五裁定在 spec §0，勘定项①②归本计划 Task 1 探针）。
> 原型基准：workspace §9 L766-857（样式）/ L2458-2484（hero DOM）/ L2567-2611（dialog·scrim DOM）；
> 笔记 §11（interactive 无 dialog/toast/scrim，以 workspace 为唯一规范源）。

## Global Constraints

- plain JS（src 顶层声明，禁 import/TS/JSX）；原生构造器 `window.*`；禁裸 setTimeout（`CLOCK.next`）；
  动态文本 `esc2`（本批全静态字面量，esc 面为零）；无 `:hover`/`transition`；
  每任务 `npm test` 全绿后一 commit；改 `src/**` → 重建
  （`node tools/assemble.mjs && node tools/make-persistent-client.mjs`），client.js 为生成物不手改；
  官方 selector 只进 `src/chrome/map.js`（MC_MAP），overlays 段内经 `MC_MAP.<key>` 名引用拼接；
  活体验收归用户（多会话规则）；**探针/门禁是实现期动作**；每 commit 前 `npm test`。

## File Structure

```
tools/probe-overlays.mjs        勘定探针（Task 1 建，勘定后留复勘用；throwaway 级）
src/chrome/map.js               hero/conv/dlg 锚键组（探针回填，DRIFT-RISK 标注）
tools/audit.mjs                 OVERLAYS_WHITELIST 防御性扩容（键名放行，照 dock 先例）
src/conv/overlays.js            §B hero（纯函数+CSS+mount/teardown）+ §C dialog/scrim 换皮
                                （menuPortal styleEl 形态复刻 data-mc-dlgskin）；CJS shim 扩
test/overlays.test.mjs          纯函数测试（新建，TDD 先行）
src/kit.js                      「浮层」分区（hero 样本 + switch/set-row 控件样本）
tools/verify-overlays.mjs       活体门禁（新建）
prototype/component-dev-notes.md §11 追加落地差异注记（收尾）
README.md                       终验工具行补 verify-overlays（收尾）
dist/client-body.js + client.js 重建产物（不手改）
```

---

### Task 1: 勘定探针 + MC_MAP 键组 + audit 对齐

**Files:** `tools/probe-overlays.mjs`（新建）、`src/chrome/map.js`、`tools/audit.mjs`

**Interfaces:**
- Produces: MC_MAP 新键 `heroRoot`（ConversationRoot 根 div）/`heroOfficial`（官方空态内容容器，
  可空串降级）/`dlgCard`（role=dialog 卡）/`dlgMask`（backdrop 遮罩）/`dlgNav`（左 nav，勘不通空串）/
  `dlgTriggerSettings`（设置入口钮，verify 用）。Task 2/3/4 全部按名消费。

- [ ] **Step 1: 写探针**——`tools/probe-overlays.mjs`（照 verify-toolcard 头：playwright →
  `http://127.0.0.1:3080`，wait 8s）：

```js
// tools/probe-overlays.mjs — overlays 批2 勘定探针(实现期动作)
import { chromium } from 'playwright';
const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto('http://127.0.0.1:3080', { waitUntil: 'domcontentloaded' });
await pg.waitForTimeout(8000);

// A. hero 相：ConversationRoot data-phase 实值 + 官方空态内容 DOM
const hero = await pg.evaluate(() => {
  const root = document.querySelector('[data-phase]');
  const scroll = document.querySelector('[data-conversation-scroll]');
  const dump = (n) => n ? n.outerHTML.slice(0, 600) : null;
  return {
    phase: root ? root.getAttribute('data-phase') : null,
    rootTag: root ? root.tagName + '.' + root.className : null,
    scrollChildren: scroll ? [...scroll.children].map((c) => c.tagName + '.' + String(c.className).slice(0, 80)) : null,
    officialHeroHtml: scroll ? dump(scroll.firstElementChild) : null,
  };
});
console.log('A.hero:', JSON.stringify(hero, null, 2));

// B. 设置弹窗：触发钮 + portal/card/nav/backdrop DOM（点开 dump 后 Esc 关）
const trig = await pg.evaluate(() => {
  const cand = [...document.querySelectorAll('button,[role=button],[aria-label],[title]')].filter((n) =>
    /设置|settings|偏好|preferences/i.test((n.getAttribute('aria-label') || '') + (n.getAttribute('title') || '') + String(n.className)));
  return cand.map((n) => ({ tag: n.tagName, cls: String(n.className).slice(0, 80), aria: n.getAttribute('aria-label'), title: n.getAttribute('title') }));
});
console.log('B.triggers:', JSON.stringify(trig, null, 2));
// 取第一个候选点开（探针手工调参阶段允许试错重跑）
await pg.evaluate(() => { const el = document.querySelector('[aria-label*="设置"],[title*="设置"]'); if (el) el.click(); });
await pg.waitForTimeout(1200);
const dlg = await pg.evaluate(() => {
  const card = document.querySelector('[role="dialog"]');
  const chain = []; let n = card;
  while (n && n !== document.body) { chain.push(n.tagName + '.' + String(n.className).slice(0, 60)); n = n.parentElement; }
  const prev = card ? card.previousElementSibling : null;
  const dump = (x) => x ? x.outerHTML.slice(0, 800) : null;
  return {
    cardCls: card ? String(card.className) : null,
    cardHtml: dump(card ? card.firstElementChild : null),
    portalChain: chain,
    backdropPrev: prev ? { tag: prev.tagName, cls: String(prev.className), cs: (({ position, zIndex, background }) => ({ position, zIndex, background }))(getComputedStyle(prev)) } : null,
    navHtml: dump(card ? card.querySelector('nav,[class*="nav"],aside') : null),
    switches: card ? card.querySelectorAll('button[role="switch"],input[type="checkbox"]').length : 0,
  };
});
console.log('B.dialog:', JSON.stringify(dlg, null, 2));
await pg.keyboard.press('Escape');
await pg.waitForTimeout(600);

// C. 确认框（若有会话：右键/三点菜单里的删除项弹 confirm——只 dump 不点确认）
const confirmDlg = await pg.evaluate(() => {
  const cards = [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')];
  return cards.map((c) => ({ role: c.getAttribute('role'), cls: String(c.className).slice(0, 80), text: (c.textContent || '').slice(0, 120) }));
});
console.log('C.confirms:', JSON.stringify(confirmDlg, null, 2));
await b.close();
```

- [ ] **Step 2: 跑探针**——`node tools/probe-overlays.mjs`；输出三段 JSON。重点抄录：
  ①`data-phase` 空会话实值（map.js 注记候选 settling|hero|active，验证 'hero'）；②官方空态内容
  容器类名；③设置弹窗 card 的稳定特征（role=dialog + portal 容器类）；④backdrop 元素及其
  computed（z-index/背景）；⑤switch 数量与形态；⑥确认框特征。
- [ ] **Step 3: map.js 键组回填**——flow 段注释后追加（值取 Step 2 实勘；勘不通的键**空串降级**，
  composerPhase 先例；DRIFT-RISK 标注 + 勘定日期）：

```js
  // —— overlays2 段(hero 空态 + dialog/scrim 换皮;探针 probe-overlays 2026-09-02)——
  heroRoot: '<实勘:ConversationRoot 根 div 选择器,候选 [data-phase]>',
  heroOfficial: '<实勘:官方空态内容容器;勘不通→空串=官方无独立容器,仅挂自绘>',
  dlgCard: '<实勘:官方弹窗卡,候选 [role="dialog"] + portal 容器限定>',
  dlgMask: '<实勘:backdrop 遮罩元素;勘不通→空串=scrim 段整体跳过>',
  dlgNav: '<实勘:弹窗左 nav;无对应结构→空串=结构档该条放弃>',
  dlgTriggerSettings: '<实勘:设置入口钮,verify 用>',
```

- [ ] **Step 4: audit 对齐**——overlays 段经 `MC_MAP.<key>` 名引用不产生新 token（键名非括号
  形态）；防御性把六键名入 `OVERLAYS_WHITELIST`（照 dock 先例：`new Set(['menuPortal','menuHostItem',
  'heroRoot','heroOfficial','dlgCard','dlgMask','dlgNav','dlgTriggerSettings'])`）。`npm test` 全绿。
- [ ] **Step 5: Commit** `feat(mc-overlays2): 勘定探针+MC_MAP hero/dlg 键组回填+audit 白名单对齐`

### Task 2: hero 纯函数 TDD + §B 实现（遮蔽重绘）

**Files:** `test/overlays.test.mjs`（新建，先失败）、`src/conv/overlays.js`、`dist/*`、`client.js`（重建）

**Interfaces:**
- Consumes: MC_MAP.heroRoot/heroOfficial/flowScroll（Task 1）；mcfx `flashIn(el, cb)`（overlays.js
  L233 现款）；sprite `#i-cl-HappyMac`（McSprite，ORDER 前置）。
- Produces: `mcHeroAction(phase)`（'hero'→'mount'，余→'unmount'）；`MC_HERO_CSS`；mount 内
  `heroSync`（body observer 驱动）；teardown 追加 observer 断开 + heroEl 摘除。

- [ ] **Step 1: 失败测试**——`test/overlays.test.mjs`：

```js
// test/overlays.test.mjs — overlays 批2 纯函数
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { loadSrc } from './load-src.mjs';
const { mcHeroAction, MC_HERO_COPY } = loadSrc('src/conv/overlays.js');

test('mcHeroAction: 仅 hero 相挂载,active/settling/缺相一律摘除', () => {
  assert.equal(mcHeroAction('hero'), 'mount');
  assert.equal(mcHeroAction('active'), 'unmount');
  assert.equal(mcHeroAction('settling'), 'unmount');
  assert.equal(mcHeroAction(null), 'unmount');
  assert.equal(mcHeroAction(undefined), 'unmount');
});

test('MC_HERO_COPY: 文案沿原型字面(spec §0 裁定5)', () => {
  assert.equal(MC_HERO_COPY.title, 'Think Classic,跑点什么。');
  assert.equal(MC_HERO_COPY.titleEm, 'Classic');
  assert.equal(MC_HERO_COPY.badge, 'MACINTOSH · System 7 复古主题');
  assert.equal(MC_HERO_COPY.sub, '经典麦金塔工作区:白窗黑线、条纹标题栏、Finder 会话树。');
});
```

- [ ] **Step 2:** `node --test test/overlays.test.mjs` 确认 FAIL（无 export）。
- [ ] **Step 3: §B 实现**——overlays.js McMenus 段后追加：
  - 纯函数区（mcMenuState 后）：

```js
// —— §B hero 空态(overlays 批2;原型 §9 L769-787,用户裁定:去芯片行/去模式下拉,纯静态零行为)——
var MC_HERO_COPY = {
  title: 'Think Classic,跑点什么。', titleEm: 'Classic',
  badge: 'MACINTOSH · System 7 复古主题',
  sub: '经典麦金塔工作区:白窗黑线、条纹标题栏、Finder 会话树。',
};
function mcHeroAction(phase) { return phase === 'hero' ? 'mount' : 'unmount'; }
var MC_HERO_CSS = [
  '.mc-hero{display:flex;flex-direction:column;align-items:center;gap:14px;padding:52px 24px 40px;text-align:center}',
  '.mc-hero .mh-mark{width:48px;height:48px;color:var(--mc-fg);filter:drop-shadow(2px 2px 0 rgba(0,0,0,.4))}',
  'html[data-theme="light"] .mc-hero .mh-mark{filter:none}',
  '.mc-hero .mh-title{font:700 34px/1.15 var(--font-display);letter-spacing:.01em;color:var(--mc-fg)}',
  '.mc-hero .mh-title em{font-style:normal;color:var(--mc-accent)}',
  '.mc-hero .mh-badge{display:inline-flex;align-items:center;padding:3px 10px;background:var(--mc-sel-bg);',
  ' border:1px solid var(--mc-border-soft);border-radius:0;font:600 11px/1.6 var(--font-display);',
  ' letter-spacing:.05em;color:var(--mc-fg)}',
  '.mc-hero .mh-sub{max-width:420px;font:400 13px/1.8 var(--font-ui);color:var(--mc-muted)}',
  '@media (max-width:640px){.mc-hero .mh-title{font-size:26px}}',
].join('');
```

  - mount 内（styleEl menuPortal 皮之后）：hero 同步器 + observer（**heroRoot 缺席不轮询——
    body observer 兼职探测，吸取 McFlow「8s 上限耗尽」教训**）：

```js
    // §B hero:官方空态 CSS 藏 + 自绘 .mc-hero 挂 flowScroll 首;-相变/内容换场全走一个 body observer
    var heroEl = null, heroRoot = null;
    try { heroRoot = document.querySelector(MC_MAP.heroRoot); } catch (e) {}
    function heroSync() {
      var act = mcHeroAction(heroRoot ? heroRoot.getAttribute('data-phase') : null);
      if (act === 'mount' && !heroEl) {
        var host = heroRoot ? (heroRoot.querySelector(MC_MAP.flowScroll) || heroRoot) : null;
        if (!host) return;
        heroEl = document.createElement('div');
        heroEl.className = 'mc-hero';
        heroEl.innerHTML = '<svg class="mh-mark" aria-hidden="true"><use href="#i-cl-HappyMac"/></svg>'
          + '<div class="mh-title">Think <em>' + MC_HERO_COPY.titleEm + '</em>,跑点什么。</div>'
          + '<span class="mh-badge">' + MC_HERO_COPY.badge + '</span>'
          + '<p class="mh-sub">' + MC_HERO_COPY.sub + '</p>'; // 静态字面量拼接常量,audit §3 豁免形态
        host.insertBefore(heroEl, host.firstChild);
        flashIn(heroEl, function () {});
      } else if (act === 'unmount' && heroEl) {
        heroEl.remove(); heroEl = null;
      }
    }
    var heroObs = new MutationObserver(function () {
      try { if (!heroRoot || !heroRoot.isConnected) heroRoot = document.querySelector(MC_MAP.heroRoot); } catch (e) {}
      heroSync();
    });
    try { heroObs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-phase', 'class'] }); } catch (e) {}
    heroSync();
```

  - teardown 追加：`try { heroObs.disconnect(); } catch (e) {}` + `try { if (heroEl) heroEl.remove(); } catch (e) {}`。
  - **官方空态藏匿 CSS**（`heroOfficial` 非空串时才拼入，进 `McMenus.css` 拼接）：

```js
var MC_OVERLAYS2_CSS = MC_HERO_CSS
  + (MC_MAP.heroOfficial ? MC_MAP.heroRoot + '[data-phase="hero"] ' + MC_MAP.heroOfficial + '{display:none!important}' : '');
```

  `css: MC_MENUS_CSS + MC_OVERLAYS2_CSS`（McMenus 定义处改）。shim 出口扩
  `mcHeroAction: mcHeroAction, MC_HERO_COPY: MC_HERO_COPY`。
- [ ] **Step 4:** `npm test` 全绿 → 装配重建 → `git diff client.js` 核对仅 overlays/map 段 →
  **Commit** `feat(mc-overlays2): hero 空态自绘——官方藏匿+HappyMac 构图(去芯片)+相变 observer`

### Task 3: §C dialog/scrim 换皮（CSS 注入，存在门控）

**Files:** `src/conv/overlays.js`、`dist/*`、`client.js`（重建）

**Interfaces:**
- Consumes: MC_MAP.dlgCard/dlgMask/dlgNav（Task 1）；token 面（--mc-surface/--mc-border/
  --mc-shadow-pop/--font-display/--font-sb）。
- Produces: `MC_DLG_CSS`（拼入 MC_OVERLAYS2_CSS）；styleEl `[data-mc-dlgskin]`（mount 挂/head，
  teardown 摘——menuPortal styleEl L255-264 现款复刻）。

- [ ] **Step 1: 基础档 CSS**——mount 内第二个 styleEl（空串键守卫同款）：

```js
    // §C dialog/scrim 换皮:纯 CSS 存在门控(官方自开自关,JS 门控不可靠);menuPortal 皮形态复刻
    var dlgCss = '';
    if (MC_MAP.dlgCard) {
      var D = MC_MAP.dlgCard;
      dlgCss = D + '{background:var(--mc-surface)!important;border:1px solid var(--mc-border)!important;'
        + 'border-radius:0!important;box-shadow:var(--mc-shadow-pop)!important;'
        + 'font-family:var(--font-ui)!important;color:var(--mc-fg)!important}'
        + D + ' *{font-family:inherit!important;border-radius:0!important}'           // 像素字+直角全域压平
        + D + ' h1,h2,h3{font-family:var(--font-display)!important}'                    // 标题像素字
        + D + ' button{background:var(--mc-surface-2)!important;border:1px solid var(--mc-border)!important;'
        + 'border-radius:0!important;font:500 12px/1.6 var(--font-ui)!important;color:var(--mc-fg)!important;padding:4px 12px}'
        + D + ' button:active{background:var(--mc-fg)!important;color:var(--mc-surface)!important}'
        + D + ' input,textarea{background:var(--mc-surface)!important;border:1px solid var(--mc-border)!important;'
        + 'border-radius:0!important;font:400 12px/1.6 var(--font-ui)!important;color:var(--mc-fg)!important}'
        + D + ' hr,[class*="separator"]{background:var(--mc-border-soft)!important;height:1px}'
        + D + ' button[role="switch"]{width:34px!important;height:18px!important;border:1px solid var(--mc-border)!important;'
        + 'border-radius:0!important;background:var(--mc-surface-3)!important;position:relative!important}'
        + D + ' button[role="switch"][aria-checked="true"],' + D + ' button[role="switch"][data-state="checked"]'
        + '{background:var(--mc-accent)!important}';                                     // 方块开关 34×18,checked 染 accent(原型 .switch 规格,形态按勘定)
    }
    if (MC_MAP.dlgMask) {
      dlgCss += MC_MAP.dlgMask + '{background-image:radial-gradient(rgba(0,0,0,.55) 1px,transparent 1px)!important;'
        + 'background-size:8px 8px!important;background-color:var(--mc-bg)!important}'; // scrim 点阵幕;z 不动(spec 裁定4)
    }
    // 结构档(勘定裁:dlgNav 非空才上;官方无对应结构不强造——spec §2 硬前提)
    if (MC_MAP.dlgNav) {
      dlgCss += MC_MAP.dlgCard + ' ' + MC_MAP.dlgNav + '{width:172px!important;flex:none!important;'
        + 'border-right:1px solid var(--mc-border-soft)!important;font-family:var(--font-sb)!important}';
    }
    if (dlgCss) {
      var dlgEl = document.createElement('style');
      dlgEl.setAttribute('data-mc-dlgskin', '');
      dlgEl.textContent = dlgCss;
      document.head.appendChild(dlgEl);
    }
```

  teardown 追加 `try { if (dlgEl) dlgEl.remove(); } catch (e) {}`。
- [ ] **Step 2: 装配重建**——`node tools/assemble.mjs && node tools/make-persistent-client.mjs`；
  `git diff client.js` 核对仅 overlays 段。
- [ ] **Step 3: 手工冒烟**（实现期动作）——刷新 → 开官方设置：卡直角/白面黑边/硬投影/像素字、
  switch 方块化、input 直角；backdrop 点阵幕且 z-index 不变；Esc 关闭恢复。删除会话确认框
  （若有会话）同款皮小卡。锚失配面：对话框外官方 UI 零变化。
- [ ] **Step 4:** `npm test` 全绿 → **Commit** `feat(mc-overlays2): dialog/scrim 换皮——存在门控 CSS+基础档+结构档(勘定裁量)`

### Task 4: kit 浮层分区 + verify-overlays 门禁 + 注记收尾

**Files:** `src/kit.js`、`tools/verify-overlays.mjs`（新建）、`prototype/component-dev-notes.md`、`README.md`

**Interfaces:**
- Consumes: `mcHeroAction`/`MC_HERO_COPY` shim（Task 2）；MC_MAP 六键（Task 1）。
- Produces: verify-overlays GREEN 断言集（深浅两遍）。

- [ ] **Step 1: kit「浮层」分区**——McKitPage 输入坞分区后追加 section：
  - hero 样本：静态 h() 结构复刻 `.mc-hero` 构图（`h('div',{className:'mc-hero'},...)` 四件套，
    文案读 `MC_HERO_COPY`；kit 面板内无需 observer，纯陈列）；
  - 控件样本：switch 方块开关 + set-row 行分隔（`.mc-hero` 同族的 kit 局部类 `.mc-dlg-demo`
    作用域样式直抄 §C 规格——**不渲染官方属性**，audit 宿主扫描零接触）；
  - 注记行：toast 不做裁定 + dialog 存在门控说明（静态文案）。
- [ ] **Step 2: verify-overlays.mjs**——照 verify-toolcard 结构（`http://127.0.0.1:3080`，
  viewport 1440×900，pageerror 收集，`ok()`/`info()` 助手，shots 留证）：

```
断言清单:
A. hero:boot 空会话 → [data-phase] 值='hero'(info);.mc-hero 在场;官方空态容器 computed display=none(heroOfficial 非空时);
   构图: .mh-mark 宽48px+svg use#i-cl-HappyMac / .mh-title font-family 含 ChiKareGo / .mh-badge borderRadius=0px;
   切进任一会话 → phase 变 → .mc-hero 退场(count=0);切回空会话(新建会话钮镜像 click)→ 复挂。
B. dialog:点 MC_MAP.dlgTriggerSettings → dlgCard 在场 → computed(borderRadius=0px/borderTop 1px solid/
   fontFamily 含 ChiKareGo 或 Fusion Pixel/boxShadow 含 '3px');switch 首 button[role=switch] 尺寸 34×18;
   backdrop background-image 含 radial-gradient 且 zIndex 与官方原值一致(info 记录,不 assert 官方值本身);
   Esc 关闭 → dlgCard 退场。
C. 确认框(遇则断):删除确认小卡在场时同款 border/radius 断言(无样本合法跳过,INFO)。
D. 深浅两遍:html[data-theme] 切换后 A/B 核心断言复跑。
E. pageerror 零异常;截图 shots/overlays2-{dark,light}-{hero,dlg}.png。
```

  → `node tools/verify-overlays.mjs` GREEN。
- [ ] **Step 3: 注记回写**——笔记 §11 追加「overlays 批 2 落地注记」：hero 相锚实勘值、官方
  空态容器形态、dialog portal 实勘结构、存在门控与 dock JS 门控的差异裁定、结构档取舍实录、
  toast 缺席记因。
- [ ] **Step 4: README**——终验工具行补 `node tools/verify-overlays.mjs   # 浮层门禁：hero 相变/dialog 换皮/深浅两遍（只读，不发消息）`。
- [ ] **Step 5:** `npm test` 全绿 → **Commit** `test(mc-overlays2): 门禁/kit/注记收尾`
- [ ] **Step 6: 汇报用户**——hero+dialog/scrim 已上线；活体验收（多会话：空会话/有会话切换/
  设置弹窗深浅/确认框）由用户发起。

---

## Self-Review 结论

- **Spec 覆盖**：§0 裁定 1（范围——Task 2 hero/Task 3 dialog·scrim，toast 无任务=裁定落地）、
  2（Task 2 构图四件套无 chips）、3（Task 3 换皮/menuPortal 形态 + Task 2 遮蔽重绘）、
  4（Task 3 scrim 段 `z 不动`）、5（Task 2 MC_HERO_COPY 字面量）；§1 架构（同文件扩区 Task 2/3、
  MC_MAP Task 1、observer Task 2、存在门控 Task 3）；§2 分档（Task 3 基础档/结构档硬前提）；
  §3 数据流（observer/teardown Task 2）；§5 测试（Task 2 单测/Task 4 verify+kit）。无缺口。
- **占位符**：无 TBD。MC_MAP 六键值为探针回填项（Task 1 Step 2/3 显式流程 + 空串降级语义），
  与 menus 批「探针先行」同构，非遗漏。
- **类型一致**：`mcHeroAction(phase)→'mount'|'unmount'`、`MC_HERO_COPY{title,titleEm,badge,sub}`、
  `MC_OVERLAYS2_CSS`/`MC_DLG_CSS`、六键名 `heroRoot/heroOfficial/dlgCard/dlgMask/dlgNav/dlgTriggerSettings`
  各任务一致；shim 出口清单 Task 2 定义、Task 4 消费对齐。
- **顺序依赖**：Task 1 先行（键组被 2/3/4 消费）；Task 2 依赖 1；Task 3 依赖 1（与 2 独立可并行，
  同文件追加区不冲突）；Task 4 收尾依赖 2/3。
