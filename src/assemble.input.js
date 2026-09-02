// src/assemble.input.js — 装配清单（顶层声明，无 import/export，由工具链读取）
// ORDER: 模块装配顺序（依赖链：tokens → mcfx → chrome → sidebar）
// MODULE_MAP: 快照名 → 源文件；缺失的文件由 sync-src 跳过（容忍后续任务才落地的模块）
const ORDER = ['McTokens', 'McClock', 'McMcfx', 'McSprite', 'MC_MAP', 'McChrome', 'McSidebar', 'McFinder', 'McFlow', 'McThink', 'McSysCard', 'McTool', 'McDock', 'McMenus', 'McKit'];
const MODULE_MAP = {
  McTokens: 'src/core/tokens.js',
  McClock: 'src/core/clock.js',
  McMcfx: 'src/core/mcfx.js',
  McSprite: 'src/core/sprite.js',
  MC_MAP: 'src/chrome/map.js',
  McChrome: 'src/chrome/chrome.js',
  McSidebar: 'src/chrome/sidebar.js',
  McFinder: 'src/finder.js',
  McFlow: 'src/conv/flow.js',
  McThink: 'src/conv/think.js',
  McSysCard: 'src/conv/syscard.js',
  McTool: 'src/conv/tool.js',
  McDock: 'src/conv/dock.js',
  McMenus: 'src/conv/overlays.js',
  McKit: 'src/kit.js',
};
