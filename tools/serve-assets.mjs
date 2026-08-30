// tools/serve-assets.mjs — 静态资源服务（无依赖，纯 node:http）
// 服务仓库 assets/ 目录，默认 http://127.0.0.1:3199/assets
// 用法: node tools/serve-assets.mjs [--port 3199] [--host 127.0.0.1]
// 字体从 web 应用跨域加载，需带 Access-Control-Allow-Origin: *
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const argVal = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : dflt;
};
const PORT = Number(argVal('--port', '3199'));
const HOST = argVal('--host', '127.0.0.1');

const MIME = {
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
};

// 只允许 assets/ 下的常规文件，防路径穿越
const resolveSafe = (urlPath) => {
  const rel = decodeURIComponent(urlPath).replace(/^\/+/, '');
  const abs = path.resolve(ROOT, 'assets', rel);
  if (!abs.startsWith(path.resolve(ROOT, 'assets') + path.sep)) return null;
  if (!existsSync(abs) || !statSync(abs).isFile()) return null;
  return abs;
};

const server = createServer(async (req, res) => {
  try {
    // CORS：字体跨域加载必需
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.writeHead(204).end();
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' }).end('405 Method Not Allowed');
      return;
    }
    // 挂载前缀 /assets（也接受去掉前缀的路径）
    let p = new URL(req.url, `http://${HOST}:${PORT}`).pathname;
    if (p === '/assets') p = '/assets/';
    if (p.startsWith('/assets/')) p = p.slice('/assets'.length);
    const abs = resolveSafe(p);
    if (!abs) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not Found');
      return;
    }
    const type = MIME[path.extname(abs).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    if (req.method === 'HEAD') return res.end();
    if (statSync(abs).size < 512 * 1024) {
      res.end(await readFile(abs));
    } else {
      createReadStream(abs).pipe(res);
    }
  } catch {
    if (!res.headersSent) res.writeHead(500).end('500 Internal Server Error');
    else res.end();
  }
});

server.listen(PORT, HOST, () => {
  console.log(`serve-assets: http://${HOST}:${PORT}/assets -> ${path.join(ROOT, 'assets')}`);
});
