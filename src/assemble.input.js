// src/assemble.input.js — 装配清单（顶层声明，无 import/export，由工具链读取）
// ORDER: 模块装配顺序（依赖链：tokens → mcfx → chrome → sidebar）
// MODULE_MAP: 快照名 → 源文件；缺失的文件由 sync-src 跳过（容忍后续任务才落地的模块）
const ORDER = ['McTokens', 'McClock', 'McMcfx', 'McSprite', 'McChrome', 'McSidebar', 'McKit'];
const MODULE_MAP = {
  McTokens: 'src/core/tokens.js',
  McClock: 'src/core/clock.js',
  McMcfx: 'src/core/mcfx.js',
  McSprite: 'src/core/sprite.js',
  McChrome: 'src/chrome/chrome.js',
  McSidebar: 'src/chrome/sidebar.js',
  McKit: 'src/kit.js',
};
