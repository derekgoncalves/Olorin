// Celular realista da chapa (estado A): captura a página de verdade no celular e monta o aparelho por cima.
// Uso (depois do build): node scripts/gerar-chapa-celular.mjs dist / /tmp/frente.png  (e /educacao/ para a LP)
// Depois converta o PNG para src/assets/img-src/chapa-frente-<olorin|educacao>.webp (sharp, qualidade 92).
import { readFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('/home/claude/Olorin/package.json');
const { chromium } = require('playwright-core');
const [dist, pagina, saida] = process.argv.slice(2);
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2' };
const pasta = path.resolve(dist);
const srv = createServer((req, res) => { let c = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (c.endsWith('/')) c += 'index.html'; const a = path.join(pasta, c); if (!a.startsWith(pasta) || !existsSync(a)) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': TIPOS[path.extname(a)] || 'application/octet-stream' }); res.end(readFileSync(a)); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
// 1) a tela: a página no celular (390 pt de largura), sem o aviso de cookies, parada
const ctx = await nav.newContext({ viewport: { width: 390, height: 778 }, deviceScaleFactor: 2.4, reducedMotion: 'reduce', isMobile: true, hasTouch: true });
await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
await ctx.addInitScript(() => { try { localStorage.setItem('olorin_consentimento', JSON.stringify({ analise: false, marketing: false, data: new Date().toISOString() })); } catch {} });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:${srv.address().port}${pagina}`, { waitUntil: 'load' });
await p.waitForTimeout(1200);
const tela = (await p.screenshot({ type: 'png' })).toString('base64');
await ctx.close();
const sharp = require('sharp');
const { data: px } = await sharp(Buffer.from(tela, 'base64')).extract({ left: 20, top: 6, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
const corTopo = `rgb(${px[0]},${px[1]},${px[2]})`;
// 2) o aparelho (489 x 996, o mesmo contorno do raio-x), fundo transparente
const html = `<!doctype html><html><head><style>
html,body{margin:0;background:transparent}
.cel{position:relative;width:489px;height:996px;border-radius:77px;overflow:hidden;
 background:linear-gradient(158deg,#8b9097 0%,#3b3e44 14%,#9aa0a8 30%,#2d3035 48%,#7d828a 66%,#26282c 82%,#6c7179 100%)}
.cel::before{content:"";position:absolute;inset:1.2px;border-radius:76px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.35),inset 0 0 3px 1px rgba(0,0,0,.6)}
.vidro{position:absolute;inset:6px;border-radius:71px;background:#030304;box-shadow:inset 0 0 0 1.2px #000,inset 0 0 6px rgba(255,255,255,.06)}
.tela{position:absolute;inset:17px;border-radius:60px;overflow:hidden;background:#000}
.status{position:absolute;left:0;right:0;top:0;height:55px;background:${corTopo};color:#fff;font:600 19px/1 Inter,sans-serif;letter-spacing:-.01em}
.hora{position:absolute;left:44px;top:21px}
.icones{position:absolute;right:34px;top:20px;display:flex;gap:7px;align-items:center}
.ilha{position:absolute;left:50%;top:12px;width:142px;height:41px;margin-left:-71px;border-radius:21px;background:#000;box-shadow:0 0 0 .6px #111}
.ilha::after{content:"";position:absolute;right:13px;top:12px;width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 40% 38%,#2a3a5c 0 18%,#0b0f1a 30%,#050608 70%)}
.pagina{position:absolute;left:0;top:55px;width:100%;height:calc(100% - 55px);object-fit:cover;object-position:top}
.barra-home{position:absolute;left:50%;bottom:9px;width:160px;height:6px;margin-left:-80px;border-radius:3px;background:rgba(255,255,255,.9)}
.reflexo{position:absolute;inset:6px;border-radius:71px;background:linear-gradient(116deg,rgba(255,255,255,.13) 0%,rgba(255,255,255,.05) 33%,rgba(255,255,255,0) 33.4%),linear-gradient(200deg,rgba(255,255,255,.05),rgba(255,255,255,0) 40%);pointer-events:none}
</style></head><body><div class="cel"><div class="vidro"></div><div class="tela">
<img class="pagina" src="data:image/png;base64,${tela}">
<div class="status"><span class="hora">9:41</span><span class="icones">
<svg width="24" height="15" viewBox="0 0 24 15"><g fill="#fff"><rect x="0" y="10" width="4" height="5" rx="1"/><rect x="6.5" y="7" width="4" height="8" rx="1"/><rect x="13" y="3.5" width="4" height="11.5" rx="1"/><rect x="19.5" y="0" width="4" height="15" rx="1"/></g></svg>
<svg width="21" height="15" viewBox="0 0 21 15"><g fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M1.5 5.3a13 13 0 0 1 18 0"/><path d="M4.8 8.6a8.3 8.3 0 0 1 11.4 0"/></g><circle cx="10.5" cy="12.6" r="2.1" fill="#fff"/></svg>
<svg width="33" height="16" viewBox="0 0 33 16"><rect x="1" y="1" width="27" height="14" rx="4.2" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.6"/><rect x="3.2" y="3.2" width="20" height="9.6" rx="2.4" fill="#fff"/><path d="M30.5 5.6v4.8a2.6 2.6 0 0 0 0-4.8z" fill="rgba(255,255,255,.45)"/></svg>
</span></div><div class="ilha"></div><div class="barra-home"></div></div><div class="reflexo"></div></div></body></html>`;
const ctx2 = await nav.newContext({ viewport: { width: 489, height: 996 }, deviceScaleFactor: 2 });
const p2 = await ctx2.newPage();
await p2.setContent(html, { waitUntil: 'load' });
await p2.waitForTimeout(300);
await p2.locator('.cel').screenshot({ path: saida, omitBackground: true });
await nav.close(); srv.close();
console.log('ok', saida);
