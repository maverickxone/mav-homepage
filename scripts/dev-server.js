// 本地预览服务器：静态托管 Mav/ 目录（线上由 Nginx 托管同一目录）
// 用法：npm run dev [-- --port 7100] [--host 127.0.0.1]
const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function argValue(name, fallback) {
  const i = args.findIndex(a => a === name || a.startsWith(name + '='));
  if (i === -1) return fallback;
  const a = args[i];
  return a.includes('=') ? a.split('=')[1] : (args[i + 1] || fallback);
}
const port = parseInt(argValue('--port', process.env.PORT || '7100'), 10);
const host = argValue('--host', process.env.HOST || '127.0.0.1');

const root = path.join(__dirname, '..', 'Mav');
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.pdf': 'application/pdf',
  '.md': 'text/markdown; charset=utf-8', '.yaml': 'text/yaml; charset=utf-8', '.yml': 'text/yaml; charset=utf-8'
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  let file = path.normalize(path.join(root, urlPath));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not Found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, host, () => console.log(`Preview: http://${host}:${port}/  (root: ${root})`));
