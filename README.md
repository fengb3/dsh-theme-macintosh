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

2. 重启 web 宿主（插件集扫描为进程内缓存，重启才再生）：

   ```
   & $env:USERPROFILE\.dsh\restart-dsh-web.ps1
   ```

3. 刷新页面 —— Macintosh 主题常驻生效。

- **字体**：经宿主半 `index.js` 挂载的 `/mcx-assets/` 静态路由提供（本包 `assets/fonts/`），无外部服务依赖。
- **kit 检视页**：devtools 控制台执行 `__MC_KIT_OPEN__ = true`。
- **深浅切换**：侧栏底部的月牙按钮（翻转 `html[data-theme]`，token 经 `theme.overrideTokens` 常驻叠层动态跟随）。
- **卸载**：从 bundles 数组移除本包并重启宿主。

## 开发

- 源码：`src/`（模块化：core 四件 + chrome/sidebar + kit），`tools/assemble.mjs` 装配；
  `client.js` 为常驻浏览器半（loader 格式），`index.js` 为宿主半（静态资源路由）。
- 改 `client.js` 后同样需要**重启宿主**生效（boot 清单 rev 缓存）。
- 测试与静态纪律走查：

  ```
  npm test
  ```

  = 单元/冒烟测试 + `tools/audit.mjs`（无 `:hover`、无 `transition`、定时器管制、
  `innerHTML` 必经 `esc()`、`--desktop-pattern` 浅色不覆盖、宿主选择器仅限 map 段）。

- 终验（Playwright，含页面重载持久性断言）：

  ```
  node tools/verify-persistent.mjs
  ```

## 历史遗留（开发期工具，运行时不再依赖）

- `tools/serve-assets.mjs`：动态插件时期的字体服务（3199 端口）。常驻形态走宿主路由，已不需要。
- `tools/assemble.mjs`：把 `src/` 装配成动态插件产物 `dist/client-body.js`（`--font-base` URL 模式 / 默认 base64）。`client.js` 已手工接管为常驻格式；修改样式时以 `client.js` 为准，`src/` 为设计参照。
