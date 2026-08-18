/**
 * Servidor de desenvolvimento — espelha o que o nginx faz em produção:
 * serve os arquivos estáticos da landing e faz proxy de /api para a API.
 * Assim o front roda localmente na mesma origem, sem CORS, igual ao deploy.
 *
 *   Terminal 1:  npm start            (API na 4100)
 *   Terminal 2:  npm run dev:site     (landing na 8080)
 *   Abrir:       http://localhost:8080
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORTA = Number(process.env.SITE_PORT || 8080);
const API = `http://127.0.0.1:${Number(process.env.PORT || 4100)}`;

const TIPOS = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".mp4": "video/mp4", ".webm": "video/webm", ".woff2": "font/woff2",
};

http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORTA}`);

  if (url.pathname.startsWith("/api")) {
    const up = http.request(
      API + url.pathname + url.search,
      { method: req.method, headers: { ...req.headers, host: `127.0.0.1:${new URL(API).port}` } },
      (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); }
    );
    up.on("error", (e) => {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, erro: `API fora do ar (${e.code}). Rode 'npm start' no outro terminal.` }));
    });
    req.pipe(up);
    return;
  }

  // server/ guarda o .env com as chaves — nunca pode ser servido
  if (/^\/(server|tools|deploy|node_modules)(\/|$)|(^|\/)\.[^/]/i.test(decodeURIComponent(url.pathname))) {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("404");
    return;
  }

  // impede path traversal antes de tocar no disco
  const rel = path.normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
  let alvo = path.join(RAIZ, rel || "index.html");
  if (!alvo.startsWith(RAIZ)) { res.writeHead(403).end("proibido"); return; }
  if (fs.existsSync(alvo) && fs.statSync(alvo).isDirectory()) alvo = path.join(alvo, "index.html");

  fs.readFile(alvo, (err, buf) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain" }).end("404"); return; }
    res.writeHead(200, {
      "Content-Type": TIPOS[path.extname(alvo).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(buf);
  });
}).listen(PORTA, () => {
  console.log(`[dev-site] landing em http://localhost:${PORTA}`);
  console.log(`[dev-site] /api -> ${API}`);
});
