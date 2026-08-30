# dsh-theme-macintosh

DSH（DeepSeek Harness Web GUI）的 Classic Macintosh 像素风主题插件（一期）。详见
`docs/superpowers/specs/2026-08-30-macintosh-theme-design.md` 与
`docs/superpowers/plans/2026-08-30-macintosh-theme-phase1.md`。

## 一期预览

### 前置

- Node.js（无需安装依赖，零 npm 包）。

### 构建（URL 字体模式，推荐）

1. 起本地字体服务（**须保持运行**）：

   ```
   node tools/serve-assets.mjs
   ```

   字体经 `http://127.0.0.1:3199/assets/...` 提供。

2. 装配产物：

   ```
   node tools/assemble.mjs --font-base http://127.0.0.1:3199/assets
   ```

   输出 `dist/client-body.js`（自包含的 client 插件函数体，plain JS、无 import）。

### 装载与卸载（harness 动态插件流程）

在 DSH 会话中让 agent 用 `cordis_define` 新建插件：`code.client` 填入
`dist/client-body.js` 的文件内容（Host 半留空），随后 `cordis_run` 该 Package ——
UI 弹出批准请求，用户允许后**刷新页面**即可看到 Classic Macintosh 主题。

- **kit 检视页**：devtools 控制台执行 `__MC_KIT_OPEN__=true` 打开组件检视页。
- **深浅切换**：侧栏底部（sidebar foot）的月亮按钮。
- **卸载**：`cordis_stop` 即完全干净撤除（样式、sprite、时钟全随 Run 销毁），
  刷新后官方配色恢复。

### 字体两种模式

| 模式 | 命令 | 特点 |
| --- | --- | --- |
| URL 模式 | `--font-base http://127.0.0.1:3199/assets` | 产物小，但须保持 `serve-assets.mjs` 运行 |
| base64 模式 | `node tools/assemble.mjs`（默认） | 自包含单文件，无外部依赖，但体积巨大 |

### 测试与静态走查

```
npm test
```

= `node --test "test/*.test.mjs"`（单元/冒烟测试）+ `node tools/audit.mjs`
（静态纪律走查：无 `:hover`、无 `transition:`（reduced-motion 豁免除外）、
定时器仅限 `src/core/clock.js`、`innerHTML` 插值必经 `esc()`、
`--desktop-pattern` 浅色不覆盖、宿主选择器仅限 `src/chrome/map.js`）。
