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

- 源码：`src/`（模块化：core 四件 + chrome/sidebar + conv/flow + kit），`tools/assemble.mjs` 装配；
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
  ```

  **注意：`verify-flow` 每次运行都会发送一条真实模型消息**（经 composer 驱动真实回合，
  产生模型调用成本；测试会话落在运行时活动工作区，跑完留档不删）。

## 历史遗留（开发期工具，运行时不再依赖）

- `tools/serve-assets.mjs`：动态插件时期的字体服务（3199 端口）。常驻形态走宿主路由，已不需要。
- `tools/assemble.mjs`：把 `src/` 装配成动态插件产物 `dist/client-body.js`（`--font-base` URL 模式 / 默认 base64）。`client.js` 已手工接管为常驻格式；修改样式时以 `client.js` 为准，`src/` 为设计参照。
