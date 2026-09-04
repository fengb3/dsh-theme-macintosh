# 投稿草稿 — 各 awesome list 提交材料（尚未提 PR）
#
# 使用方式：推送本仓库全部改造变更后，按各仓库流程提交下方对应内容。
# 提交顺序建议：awesome-dsh-plugin → imsai-sh → 0xsline → Anil-matcha → AdamPlatin123。

# ============================================================
# 1. awesome-dsh-plugin/awesome-dsh-plugin
#    PR 只加一个文件：data/plugins/fengb3__dsh-theme-macintosh.yml
#    （README 是生成的，不要手改；一个 PR 只加这一条）
# ============================================================
--- awesome-dsh-plugin/data/plugins/fengb3__dsh-theme-macintosh.yml
url: https://github.com/fengb3/dsh-theme-macintosh
name: fengb3/dsh-theme-macintosh
category: theme
description:
  en: 'Classic Macintosh (System 7) pixel theme: desktop pattern canvas, Finder sidebar, monochrome buttons and dialogs, light/dark support.'
  zh: '经典麦金塔 System 7 像素风主题：桌面网点画布、Finder 侧栏、黑白按钮与弹窗，深浅色随官方外观切换。'
--- end

# ============================================================
# 2. imsai-sh/awesome-deepseek-harness-plugins
#    PR 只加一个文件：catalog/plugins/fengb3__dsh-theme-macintosh.json
#    （符合 catalog/schema/plugin.schema.json；新增单条 PR 过静态审查后自动合并）
#    或者：npx skills add imsai-sh/awesome-deepseek-harness-plugins --skill submit-dsh-plugin -g
#          然后让助手「使用 $submit-dsh-plugin 检查并提交我的插件」
# ============================================================
--- imsai-sh/catalog/plugins/fengb3__dsh-theme-macintosh.json
{
  "$schema": "../schema/plugin.schema.json",
  "id": "fengb3/dsh-theme-macintosh",
  "name": "dsh-theme-macintosh",
  "repository": "https://github.com/fengb3/dsh-theme-macintosh",
  "category": "theme",
  "description": {
    "en": "Classic Macintosh (System 7) pixel theme: desktop pattern canvas, Finder sidebar, monochrome buttons and dialogs, light/dark support.",
    "zh": "经典麦金塔 System 7 像素风主题：桌面网点画布、Finder 侧栏、黑白按钮与弹窗，深浅色随官方外观切换。"
  },
  "added": "2026-09-04"
}
--- end

# ============================================================
# 3. 0xsline/awesome-deepseek-harness
#    Fork 后在 README.md 与 README.zh-CN.md 的「UI, Themes & Interaction」分类各加一行（同 PR），
#    PR 标题：docs: add fengb3/dsh-theme-macintosh
# ============================================================
--- 0xsline/README.md (UI, Themes & Interaction)
- [fengb3/dsh-theme-macintosh](https://github.com/fengb3/dsh-theme-macintosh) — Classic Macintosh (System 7) pixel theme with desktop pattern canvas, Finder sidebar and monochrome controls.
--- 0xsline/README.zh-CN.md (UI, Themes & Interaction)
- [fengb3/dsh-theme-macintosh](https://github.com/fengb3/dsh-theme-macintosh) — 经典麦金塔 System 7 像素风主题：桌面网点画布、Finder 侧栏与黑白控件。
--- end

# ============================================================
# 4. Anil-matcha/awesome-dsh-plugin
#    PR 在对应分类加一行（保持单行、链接本体仓库）
# ============================================================
--- Anil-matcha/README.md
- [fengb3/dsh-theme-macintosh](https://github.com/fengb3/dsh-theme-macintosh) — Classic Macintosh (System 7) pixel theme: desktop pattern, Finder sidebar, monochrome UI, light/dark.
--- end

# ============================================================
# 5. AdamPlatin123/awesome-dsh-plugins（登记 PR）
#    先跑预归类：python3 scripts/classify.py "dsh-theme-macintosh" "System 7 像素主题 皮肤 theme"
#    预期命中「🎨 主题皮肤」；把建议分类填进 PR 模板的分类字段。
#    描述建议：DSH 主题 · 经典麦金塔 Classic Macintosh(System 7 像素复古)
# ============================================================
