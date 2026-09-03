# dsh-theme-macintosh

DSH（DeepSeek Harness Web GUI）的 Classic Macintosh 像素风主题插件。详见
`docs/superpowers/specs/2026-08-30-macintosh-theme-design.md`（设计）与
`docs/superpowers/plans/2026-08-30-macintosh-theme-phase1.md`（一期计划 + 收尾实录 + 二期待办）。

## 安装（常驻插件形态，一期最终形态）

本包以**持久化组合插件**形式安装（同 dsh-theme-aurum 的机制），页面刷新即生效，无需任何 Run 操作：

1. 在 DSH web profile 里链接本包（`~/.dsh/profiles/web/`）：

   ```
   pnpm add link:<本仓库绝对路径>
   ```

   并在 `package.json` 的 `dsh.profile.bundles` 数组中加入 `"dsh-theme-macintosh"`。

2. 重启 web 宿主（**仅安装/清单级变更需要**——插件集扫描为进程内缓存，重启才再生）：

   ```
   & $env:USERPROFILE\.dsh\restart-web.ps1
   ```

3. 刷新页面 —— Macintosh 主题常驻生效。

- **字体**：经宿主半 `index.js` 挂载的 `/mcx-assets/` 静态路由提供（本包 `assets/fonts/`），无外部服务依赖。
- **kit 检视页**：devtools 控制台执行 `__MC_KIT_OPEN__ = true`（含「会话流」分区：md 全要素 / 用户气泡 /
  注入条四型 / 推理卡**五帧流式演示** / 重试·上限·turn-tail 细长条）。
- **深浅切换**：官方 设置 → 外观（浅色/深色）；token 经 `theme.overrideTokens` 常驻叠层跟随
  `html[data-theme]`（月牙钮已在一期轮6移除，官方通道是唯一入口）。
- **卸载**：从 bundles 数组移除本包并重启宿主。

## 开发

- 源码：`src/`（模块化：core 四件 + chrome/sidebar + conv/flow/dock/think/syscard/tool/overlays/responsive/ask + kit），`tools/assemble.mjs` 装配；
  `client.js` 为常驻浏览器半（loader 格式），`index.js` 为宿主半（静态资源路由）。
- **改 `client.js` 刷新页面即生效**（link 安装实测 2026-08-31：profile 里 `link:` 指向本仓库，
  页面每次加载都取当前工作树——开发循环 = 改文件 → 刷新浏览器，无需动宿主）。
  **重启宿主仅限清单级变更**：`package.json`（依赖 / bundles 数组）、`cordis.patch.yml`、`index.js`
  改动后才需要：
  ```
  & $env:USERPROFILE\.dsh\restart-web.ps1
  ```
- `src/` 为设计参照，与 `client.js` 手工保持镜像（宿主选择器唯一管制文件为 `src/chrome/map.js`，
  `client.js` 内 MC_MAP 快照须同步维护，`tools/audit.mjs` 会核对泄漏）。
- 测试与静态纪律走查：

  ```
  npm test
  ```

  = 单元/冒烟测试 + `tools/audit.mjs`（无 `:hover`、无 `transition`、定时器管制、
  `innerHTML` 必经 `esc()`、`--desktop-pattern` 浅色不覆盖、宿主选择器仅限 map 段）。

- 终验（Playwright）：

  ```
  node tools/verify-persistent.mjs   # 常驻持久性 + flow 三断言（只读，不发消息）
  node tools/verify-flow.mjs         # flow 门禁：真实回合驱动，深浅两轮 32 断言
  node tools/verify-menus.mjs        # 菜单门禁：五菜单开合/样式/归档接线深浅两轮（--dry-run 只验注入）
  node tools/verify-dock.mjs         # 输入坞门禁：镜像发送/守护重插/拔桥降级深浅两轮（--dry-run 只验注入）
  node tools/verify-toolcard.mjs    # 工具卡门禁：卡壳样式/开合/深浅两遍/kit 分区（只读，不发消息）
  node tools/verify-overlays.mjs    # 浮层门禁：hero 相变/dialog 换皮/深浅两遍/失配演练（不发消息；每跑留一个空会话）
  node tools/verify-responsive.mjs  # 响应式门禁：汉堡断点/抽屉三通道/层级/密度两档/溢出修复/深浅两遍（resize 驱动，只读）
  node tools/verify-ask.mjs         # ask 门禁：问题卡/审批卡换皮——藏坞门控/卡皮/radio 环勾/选中反色/折叠双态/坞归位/kit 分区（自治链路，发一条真实 agent 指令，留一次性会话可删）
  ```

  **注意：`verify-flow` / `verify-dock` 每次运行都会发送一条真实模型消息**（经 composer 驱动真实回合，
  产生模型调用成本；测试会话落在运行时活动工作区，跑完留档不删）。

## 历史遗留（开发期工具，运行时不再依赖）

- `tools/assemble.mjs`：把 `src/` 装配成动态插件产物 `dist/client-body.js`（`--font-base` URL 模式 / 默认 base64），再经 `tools/make-persistent-client.mjs` 变换为常驻 `client.js`。修改样式时以 `client.js` 为准、`src/` 为设计参照，改完同步镜像后可整链重刷。
- 已清理（2026-09）：`tools/serve-assets.mjs` 字体服务（常驻形态走宿主路由）；acc2~6 验收探针与 probe-*/dbg-* 历史脚本（结论已存 plan 与 shots/）。
