/**
 * dsh-theme-macintosh — host half: /mcx-assets/ 静态资源路由。
 *
 * 浏览器半（client.js）的 @font-face 与后续图片素材经
 * url(/mcx-assets/fonts/<file>) 引用本路由；宿主半在 webserver 上注册
 * prefix 路由，把本包 assets/ 目录按原样服务（GET/HEAD only，越界 403，
 * 未命中 404，未知扩展名 application/octet-stream）。
 * 路由注册经 ctx.effect 归入本 fiber —— 停插件即撤路由。
 */
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const inject = ['webServer'];

const MIME = {
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

const PREFIX = '/mcx-assets';

export function apply(ctx) {
  const root = join(dirname(fileURLToPath(import.meta.url)), 'assets');
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: PREFIX,
    handler: (req, res) => {
      try {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.writeHead(405); res.end(); return;
        }
        const rawPath = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
        const rel = rawPath.slice(PREFIX.length).replace(/^[/\\]+/, '');
        const file = normalize(join(root, rel));
        if (file !== root && !file.startsWith(root + sep)) {
          res.writeHead(403); res.end(); return;
        }
        const st = statSync(file);
        if (!st.isFile()) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, {
          'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
          'content-length': st.size,
          'cache-control': 'public, max-age=86400',
        });
        if (req.method === 'HEAD') { res.end(); return; }
        createReadStream(file).pipe(res);
      } catch (e) {
        try { res.writeHead(404); res.end(); } catch (e2) { /* 已断连 */ }
      }
    },
  }));
  console.log('[mcx] host: /mcx-assets/ 静态路由已挂载（root=' + root + '）');
}
