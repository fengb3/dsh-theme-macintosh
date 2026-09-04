# dsh-theme-macintosh

<p align="center">
  <img src="shots/banner.png" alt="dsh-theme-macintosh banner — HappyMac + Seek Different + 主界面级联双窗(深浅活体截图 4px 抖动溶解)" width="100%">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/dsh-theme-macintosh"><img src="https://img.shields.io/npm/v/dsh-theme-macintosh.svg" alt="npm version"></a>
</p>

**dsh-theme-macintosh** 是 DSH（DeepSeek Harness Web GUI）的
Classic Macintosh 主题插件：把整个界面换回 System 7 的像素语汇——ChiKareGo / Fusion Pixel 像素字体、
桌面噪点画布、Finder 式会话侧栏、方角按钮与月牙深浅切换，零构建、安装即常驻生效。

## 特性

- **全套像素换皮**：会话流 md 渲染、推理卡流式揭开、工具卡三态、问题卡 / 计划审批卡、弹出菜单、输入坞、设置弹窗、浮层
- **像素字体随包分发**：经宿主静态路由提供，无外部服务依赖
- **深浅双色**：跟随官方 设置 → 外观 的浅色 / 深色切换，两套 token 全程适配
- **kit 检视页**：devtools 控制台执行 `__MC_KIT_OPEN__ = true`，在线翻全部组件的活体形态
- **常驻插件**：安装后刷新页面即生效，无需任何 Run 操作

## 安装

以 DSH web profile 的持久化插件形式安装，三步：

1. 在 profile 目录（`~/.dsh/profiles/web/`）里安装本包：

   ```
   pnpm add dsh-theme-macintosh
   ```

2. 在该 profile 的 `package.json` 的 `dsh.profile.bundles` 数组中加入 `"dsh-theme-macintosh"`。

3. 重启 web 宿主（仅安装 / 清单级变更需要），然后刷新页面 —— Macintosh 主题常驻生效。

**卸载**：从 bundles 数组移除本包并重启宿主。

## 组件 Showcase

以下截图全部为**深浅两套配色在运行中的宿主里实拍**。

### 主界面 · 开机空态 · 弹窗 · 抽屉

| 形态 | 深色 | 浅色 |
| --- | --- | --- |
| 主界面（会话流 + Finder 侧栏 + 输入坞） | ![](shots/showcase/overview-dark.png) | ![](shots/showcase/overview-light.png) |
| 开机空态 · hero 相（新建会话） | ![](shots/showcase/boot-dark.png) | ![](shots/showcase/boot-light.png) |
| 设置弹窗 · 官方 scrim 点阵幕换皮 | ![](shots/showcase/dlg-dark.png) | ![](shots/showcase/dlg-light.png) |
| ≤1023 抽屉形态（汉堡 + 点阵遮罩） | ![](shots/showcase/responsive-dark.png) | ![](shots/showcase/responsive-light.png) |
| 实况 · 会话行 ⋯ 菜单 | ![](shots/showcase/menu-live-dark.png) | ![](shots/showcase/menu-live-light.png) |

### 基础原语

| 形态 | 深色 | 浅色 |
| --- | --- | --- |
| push button（默认 / Primary / Danger / 禁用） | ![](shots/showcase/btn-dark.png) | ![](shots/showcase/btn-light.png) |
| 按下反色（:active，内外圈互换实底） | ![](shots/showcase/btn-active-dark.png) | ![](shots/showcase/btn-active-light.png) |
| 状态胶囊（运行中 / 完成 / 失败 / 等待 / 强调） | ![](shots/showcase/pills-dark.png) | ![](shots/showcase/pills-light.png) |
| 输入域聚焦 accent 外环 + 折叠三角双态 | ![](shots/showcase/field-tri-dark.png) | ![](shots/showcase/field-tri-light.png) |

| | 深色 | 浅色 |
| --- | --- | --- |
| Tokens 色板 | ![](shots/showcase/tokens-dark.png) | ![](shots/showcase/tokens-light.png) |
| Sprite 图标墙（Pixelarticons + 经典点缀） | ![](shots/showcase/icons-dark.png) | ![](shots/showcase/icons-light.png) |

### 会话流

**md 全要素**（h1–h3 / 加粗斜体 / 行内 code / 链接 / 引用 / ul / ol / pre / table）：

| 深色 | 浅色 |
| --- | --- |
| ![](shots/showcase/flow-md-dark.png) | ![](shots/showcase/flow-md-light.png) |

| 形态 | 深色 | 浅色 |
| --- | --- | --- |
| 用户消息 · 含图片附件 | ![](shots/showcase/flow-msg-dark.png) | ![](shots/showcase/flow-msg-light.png) |
| 上下文注入 · 细长条四型 | ![](shots/showcase/flow-inject-dark.png) | ![](shots/showcase/flow-inject-light.png) |
| 推理卡 · 流式（白块 cover 逐帧揭开） | ![](shots/showcase/flow-reasoning-run-dark.png) | ![](shots/showcase/flow-reasoning-run-light.png) |
| 推理卡 · 收合态（摘要前 26 字 + 用时） | ![](shots/showcase/flow-reasoning-done-dark.png) | ![](shots/showcase/flow-reasoning-done-light.png) |
| 自动重试行 / 步数上限行 / 回合尾部 | ![](shots/showcase/flow-rows-dark.png) | ![](shots/showcase/flow-rows-light.png) |

### 输入坞

| 形态 | 深色 | 浅色 |
| --- | --- | --- |
| composer 三态（idle 禁用 Send / ready 可发 / busy Stop 接管） | ![](shots/showcase/dock-composer-dark.png) | ![](shots/showcase/dock-composer-light.png) |
| 家具（queue-row / todo 折叠+展开 / goal active+blocked） | ![](shots/showcase/dock-furn-dark.png) | ![](shots/showcase/dock-furn-light.png) |
| ctx 占用圆环 + pop 明细（点 ring 展开） | ![](shots/showcase/dock-ctx-dark.png) | ![](shots/showcase/dock-ctx-light.png) |

### 弹出菜单

| 形态 | 深色 | 浅色 |
| --- | --- | --- |
| 通用菜单（m-group / 选中态 / danger 项 / m-sep） | ![](shots/showcase/menu-dark.png) | ![](shots/showcase/menu-light.png) |

### 浮层

| 形态 | 深色 | 浅色 |
| --- | --- | --- |
| hero 空态样本（窗框 + HappyMac‖标题横排） | ![](shots/showcase/hero-dark.png) | ![](shots/showcase/hero-light.png) |
| dialog 控件样本（方角钮 / 直角输入域 / 发丝分隔线） | ![](shots/showcase/dlg-controls-dark.png) | ![](shots/showcase/dlg-controls-light.png) |

### 问题卡

| 形态 | 深色 | 浅色 |
| --- | --- | --- |
| 问题卡（单选整行反色 / 多选方框 / 自由输入 / 翻页）+ 计划审批卡（警示条 / 三钮） | ![](shots/showcase/ask-dark.png) | ![](shots/showcase/ask-light.png) |

### 工具卡

**样本五张**（read 文本体 / edit diff 体 / bash fail 红边 / web_search 引用体 / 未知工具兜底）：

| 深色 | 浅色 |
| --- | --- |
| ![](shots/showcase/tools-dark.png) | ![](shots/showcase/tools-light.png) |

| 形态 | 深色 | 浅色 |
| --- | --- | --- |
| 状态三帧 · running（琥珀扫掠） | ![](shots/showcase/tool-running-dark.png) | ![](shots/showcase/tool-running-light.png) |
| 状态三帧 · done | ![](shots/showcase/tool-done-dark.png) | ![](shots/showcase/tool-done-light.png) |
| 状态三帧 · fail（红边 + warning） | ![](shots/showcase/tool-fail-dark.png) | ![](shots/showcase/tool-fail-light.png) |
