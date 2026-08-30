// 截原型参照图：interactive 的侧栏区 + workspace 全景
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('file:///C:/Users/fohhy/source/repos/dsh-theme-macintosh/prototype/macintosh-interactive.html', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
await p.screenshot({ path: 'shots/proto-interactive-full.png' });
// workspace 规范源（首屏桌面 + 侧栏窗 + 主窗）
await p.goto('file:///C:/Users/fohhy/source/repos/dsh-theme-macintosh/prototype/macintosh-workspace.html', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
await p.screenshot({ path: 'shots/proto-workspace-top.png' });
await b.close();
