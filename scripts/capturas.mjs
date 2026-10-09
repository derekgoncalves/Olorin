/**
 * Capturas de tela de todas as páginas em 360, 390, 768, 1024 e 1440 px (PROMPT seção 20.4).
 * Salva em docs/screenshots/ como WebP reduzido (página inteira), para revisar sem abrir o site.
 * Também acusa rolagem horizontal e erros de JavaScript.
 *
 *   npm run build && npm run capturas
 *   npm run capturas -- / /sobre/        → só algumas páginas
 *
 * Com a pasta site-atual/ presente, captura também a home antiga para comparar lado a lado.
 */
import { readFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { chromium } from 'playwright-core';

const sharp = createRequire(import.meta.url)('sharp');
const SAIDA = path.resolve(process.env.OLORIN_SAIDA || 'dist');
const DESTINO = 'docs/screenshots';
const LARGURAS = (process.env.LARGURAS || '360,390,768,1024,1440').split(',').map(Number);
const CHROMIUM = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((c) => c && existsSync(c));
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };

function servir(pasta) {
	return new Promise((resolve) => {
		const srv = createServer((req, res) => {
			let caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname);
			if (caminho.endsWith('/')) caminho += 'index.html';
			const arquivo = path.join(pasta, caminho);
			if (!arquivo.startsWith(pasta) || !existsSync(arquivo)) {
				res.writeHead(404);
				res.end();
				return;
			}
			res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] || 'application/octet-stream' });
			res.end(readFileSync(arquivo));
		});
		srv.listen(0, '127.0.0.1', () => resolve({ url: `http://127.0.0.1:${srv.address().port}`, fechar: () => srv.close() }));
	});
}

function paginasDoSite() {
	const lista = [...readFileSync(path.join(SAIDA, 'sitemap.xml'), 'utf8').matchAll(/<loc>https:\/\/olorin\.com\.br([^<]*)<\/loc>/g)].map((m) => m[1]);
	lista.push('/promo/', '/obrigado/', '/404.html');
	for (const nome of readdirSync(path.join(SAIDA, 'promo'))) if (existsSync(path.join(SAIDA, 'promo', nome, 'index.html'))) lista.push(`/promo/${nome}/`);
	return lista;
}

async function capturar(navegador, base, paginas, prefixo, problemas) {
	for (const largura of LARGURAS) {
		const ctx = await navegador.newContext({ viewport: { width: largura, height: 900 }, reducedMotion: 'reduce' });
		const p = await ctx.newPage();
		let erros = [];
		p.on('pageerror', (e) => erros.push(e.message));
		for (const pg of paginas) {
			erros = [];
			await p.goto(base + pg, { waitUntil: 'networkidle' });
			// Rola até o fim para carregar imagens "lazy" e disparar as animações de entrada.
			await p.evaluate(async () => {
				for (let y = 0; y < document.body.scrollHeight; y += 700) {
					window.scrollTo(0, y);
					await new Promise((r) => setTimeout(r, 40));
				}
				window.scrollTo(0, 0);
			});
			await p.waitForTimeout(250);
			const largo = await p.evaluate(() => document.documentElement.scrollWidth);
			if (largo > largura + 1) problemas.push(`${prefixo}${pg} @${largura}: rolagem horizontal (${largo}px)`);
			if (erros.length) problemas.push(`${prefixo}${pg} @${largura}: ${erros[0]}`);
			const nome = `${prefixo}${(pg.replace(/^\/|\/$/g, '').replace(/[/.]/g, '_') || 'home')}-${largura}.webp`;
			const png = await p.screenshot({ fullPage: true });
			await sharp(png, { limitInputPixels: false })
				.resize({ width: Math.min(largura, 720) })
				.webp({ quality: 62 })
				.toFile(path.join(DESTINO, nome));
		}
		await ctx.close();
		console.log(`  ${prefixo || 'site novo'} @${largura}: ${paginas.length} página(s)`);
	}
}

if (!CHROMIUM) {
	console.error('Chromium/Chrome não encontrado. Defina CHROMIUM_PATH.');
	process.exit(1);
}
mkdirSync(DESTINO, { recursive: true });
const pedidas = process.argv.slice(2).filter((a) => a.startsWith('/'));
const paginas = pedidas.length ? pedidas : paginasDoSite();
const navegador = await chromium.launch({ executablePath: CHROMIUM });
const problemas = [];
const novo = await servir(SAIDA);
await capturar(navegador, novo.url, paginas, '', problemas);
novo.fechar();
if (!pedidas.length && existsSync('site-atual/index.html')) {
	const antigo = await servir(path.resolve('site-atual'));
	await capturar(navegador, antigo.url, ['/'], 'antes-', problemas);
	antigo.fechar();
}
await navegador.close();
console.log(problemas.length ? `\n${problemas.length} problema(s):\n${problemas.join('\n')}` : `\nCapturas em ${DESTINO}/ sem rolagem horizontal nem erro de JavaScript.`);
