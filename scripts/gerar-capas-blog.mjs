/**
 * Capas do blog: gera, para cada artigo de src/blog/artigos/ SEM foto própria, uma capa com
 * a cara da marca (título, categoria, logo e o pixel da Olorin), e para TODOS os artigos a
 * imagem de compartilhamento (WhatsApp, LinkedIn...).
 *
 *   npm run capas
 *
 *   Capa (1600×900):          src/assets/img-src/blog/capas/<artigo>.jpg
 *   Compartilhamento (1200×630): src/assets/og/blog-<artigo>.jpg  (e blog.jpg, da página /blog/)
 *
 * Artigo com foto própria (campo "imagem" ou arquivo com o nome do artigo em src/assets/img-src/blog/)
 * não ganha capa gerada: a imagem de compartilhamento sai da foto. Rode de novo sempre que
 * mudar o título ou a categoria de um artigo. As imagens geradas vão para o Git (o build só usa).
 *
 * Precisa de um navegador Chromium: no Windows serve o Microsoft Edge (já vem instalado) ou o
 * Google Chrome. Se não for encontrado, defina CHROMIUM_PATH com o caminho do navegador.
 */
import { readFileSync, readdirSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { listarArtigos, fotoPropria, temaDaCategoria, PASTA_CAPAS, PASTA_OG } from './blog.mjs';

const fonte = (nome) => `data:font/woff2;base64,${readFileSync(path.join('src/assets/fonts', nome)).toString('base64')}`;
const logo = readFileSync('_brand/logos/logo-olorin.svg', 'utf8').replace('aria-hidden="true"', '');
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const equipe = yaml.load(readFileSync('src/content/equipe.yml', 'utf8')).pessoas || [];
const paginaBlog = yaml.load(readFileSync('src/content/paginas/blog.yml', 'utf8'));

const CHROMIUM = [
	process.env.CHROMIUM_PATH,
	'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
	'/usr/bin/chromium',
	'/usr/bin/chromium-browser',
	'/usr/bin/google-chrome',
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
	'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
	'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
	'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
	'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find((c) => c && existsSync(c));

/* Três combinações da marca. Violeta nunca encosta no verde: o verde só aparece na capa preta,
   e longe das bordas (a borda de toda capa é da cor do fundo). */
const TEMAS = {
	preto: { fundo: '#000', texto: '#fff', destaque: '#ecff36', bloco: '#ecff36', ponto: 'rgba(255,255,255,.16)', apoio: 'rgba(255,255,255,.78)' },
	violeta: { fundo: '#7e3bed', texto: '#fff', destaque: '#000', bloco: '#000', ponto: 'rgba(255,255,255,.2)', apoio: 'rgba(255,255,255,.9)' },
	branco: { fundo: '#fff', texto: '#000', destaque: '#7e3bed', bloco: '#7e3bed', ponto: 'rgba(0,0,0,.14)', apoio: 'rgba(0,0,0,.72)' },
};

/* Escada de pixels (como na página 16 do manual): [coluna, linha] numa grade 4×4. */
const ESCADA = [[3, 0], [2, 1], [3, 1], [1, 2], [2, 2], [0, 3], [1, 3], [3, 3]];

/** Parte do título que ganha a cor de destaque: o que vem antes dos dois-pontos ou as duas últimas palavras. */
function dividirTitulo(titulo) {
	const t = String(titulo).trim();
	const i = t.indexOf(':');
	if (i > 0 && i < t.length - 1) return { destaque: t.slice(0, i + 1), resto: t.slice(i + 1).trim(), antes: true };
	const palavras = t.split(/\s+/);
	if (palavras.length < 3) return { destaque: '', resto: t, antes: false };
	return { destaque: palavras.slice(-2).join(' '), resto: palavras.slice(0, -2).join(' '), antes: false };
}

function html({ tema, etiqueta, titulo, rodape, autor, foto }) {
	const t = TEMAS[tema] || TEMAS.preto;
	const { destaque, resto, antes } = dividirTitulo(titulo);
	const tituloHtml = destaque ? (antes ? `<em>${esc(destaque)}</em> ${esc(resto)}` : `${esc(resto)} <em>${esc(destaque)}</em>`) : esc(resto);
	const pixels = `<svg viewBox="0 0 4 4" shape-rendering="crispEdges"><path fill="${t.bloco}" d="${ESCADA.map(([c, l]) => `M${c} ${l}h1v1h-1z`).join('')}"/></svg>`;
	return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
@font-face { font-family: Titulo; src: url("${fonte('archivo-expanded-900.woff2')}") format("woff2"); }
@font-face { font-family: Texto; src: url("${fonte('cascadia-code-400.woff2')}") format("woff2"); }
@font-face { font-family: Texto; font-weight: 700; src: url("${fonte('cascadia-code-700.woff2')}") format("woff2"); }
@font-face { font-family: Pixel; src: url("${fonte('silkscreen-400.woff2')}") format("woff2"); }
* { box-sizing: border-box; margin: 0; }
:root { --u: calc(100vw / 1600); --q: calc(var(--u) * 74); }
html, body { width: 100vw; height: 100vh; overflow: hidden; }
body { position: relative; display: flex; flex-direction: column; padding: calc(var(--u) * 84); background: ${t.fundo}; color: ${t.texto}; font-family: Texto, monospace;
	background-image: radial-gradient(circle at calc(var(--u) * 1.5) calc(var(--u) * 1.5), ${t.ponto} calc(var(--u) * 1.6), transparent 0); background-size: calc(var(--u) * 32) calc(var(--u) * 32); }
.topo { display: flex; justify-content: space-between; align-items: center; gap: calc(var(--u) * 40); }
.etiqueta { display: inline-flex; align-items: center; gap: calc(var(--u) * 16); padding: calc(var(--u) * 12) calc(var(--u) * 20); border: calc(var(--u) * 4) solid ${t.destaque}; color: ${tema === 'violeta' ? t.texto : t.destaque}; font: calc(var(--u) * 26) Pixel, monospace; letter-spacing: .1em; text-transform: uppercase; }
.etiqueta b { width: calc(var(--u) * 20); height: calc(var(--u) * 20); background: ${t.destaque}; }
.topo svg { height: calc(var(--u) * 46); width: auto; color: ${t.texto}; flex: none; }
.meio { flex: 1; display: flex; align-items: center; min-height: 0; padding: calc(var(--u) * 28) 0 calc(var(--u) * 40); }
h1 { max-width: calc(var(--u) * 1040); font: 900 calc(var(--u) * 100)/1.02 Titulo, sans-serif; text-transform: uppercase; letter-spacing: -.01em; overflow-wrap: break-word; }
h1 em { font-style: normal; color: ${t.destaque}; }
.pixels { position: absolute; right: calc(var(--u) * 96); top: 50%; width: calc(var(--q) * 4); height: calc(var(--q) * 4); translate: 0 -38%; }
.pixels svg { display: block; width: 100%; height: 100%; }
.base { display: flex; justify-content: space-between; align-items: flex-end; gap: calc(var(--u) * 40); font-size: calc(var(--u) * 26); color: ${t.apoio}; }
.base strong { color: ${t.texto}; font-weight: 700; }
.foto { position: absolute; inset: 0; background: #000 center / cover no-repeat; }
.foto::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.92) 0%, rgba(0,0,0,.62) 48%, rgba(0,0,0,.18) 100%); }
.com-foto { color: #fff; }
.com-foto > *:not(.foto) { position: relative; }
.com-foto .meio { align-items: flex-end; padding-bottom: calc(var(--u) * 36); }
.com-foto h1 { font-size: calc(var(--u) * 84); }
</style></head><body class="${foto ? 'com-foto' : ''}">
${foto ? `<div class="foto" style="background-image:url('${foto}')"></div>` : ''}
<div class="topo"><p class="etiqueta"><b></b>${esc(etiqueta)}</p>${logo}</div>
<div class="meio"><h1>${tituloHtml}</h1></div>
${foto ? '' : `<div class="pixels" aria-hidden="true">${pixels}</div>`}
<div class="base"><p>${autor ? `por <strong>${esc(autor)}</strong>` : ''}</p><p>${esc(rodape)}</p></div>
</body></html>`;
}

async function fotoEmDataUri(arquivo) {
	const buf = await sharp(arquivo, { failOn: 'none' }).rotate().resize(1600, 900, { fit: 'cover' }).jpeg({ quality: 86 }).toBuffer();
	return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

if (!CHROMIUM) {
	console.error('Navegador não encontrado. Instale o Google Chrome ou o Microsoft Edge, ou defina CHROMIUM_PATH com o caminho dele.');
	process.exit(1);
}

const artigos = listarArtigos();
const pecas = [
	{
		saida: path.join(PASTA_OG, 'blog.jpg'),
		largura: 1200,
		altura: 630,
		tema: 'preto',
		etiqueta: paginaBlog.etiqueta || 'Blog da Olorin',
		titulo: paginaBlog.titulo || 'Marketing sem rodeio.',
		rodape: 'olorin.com.br/blog',
	},
];
const capasValidas = new Set();
for (const a of artigos) {
	const d = a.dados;
	if (!d.titulo || !d.categoria) {
		console.log(`  (pulado: ${a.arquivo} está sem titulo ou categoria)`);
		continue;
	}
	const pessoa = equipe.find((p) => p.slug === d.autor);
	const base = {
		tema: temaDaCategoria(d.categoria),
		etiqueta: d.categoria,
		titulo: d.titulo,
		autor: pessoa ? pessoa.nome : '',
		rodape: 'olorin.com.br/blog',
	};
	const propria = fotoPropria(a.slug, d);
	if (propria) {
		pecas.push({ ...base, saida: path.join(PASTA_OG, `blog-${a.slug}.jpg`), largura: 1200, altura: 630, foto: await fotoEmDataUri(propria) });
	} else {
		capasValidas.add(`${a.slug}.jpg`);
		pecas.push({ ...base, saida: path.join(PASTA_CAPAS, `${a.slug}.jpg`), largura: 1600, altura: 900, qualidade: 92 });
		pecas.push({ ...base, saida: path.join(PASTA_OG, `blog-${a.slug}.jpg`), largura: 1200, altura: 630 });
	}
}

mkdirSync(PASTA_CAPAS, { recursive: true });
mkdirSync(PASTA_OG, { recursive: true });
const navegador = await chromium.launch({ executablePath: CHROMIUM });
for (const p of pecas) {
	const pagina = await navegador.newPage({ viewport: { width: p.largura, height: p.altura }, deviceScaleFactor: 1 });
	await pagina.setContent(html(p), { waitUntil: 'load' });
	await pagina.evaluate(() => document.fonts.ready);
	// Título longo: reduz a fonte até caber (e até não encostar na escada de pixels).
	await pagina.evaluate(() => {
		const h1 = document.querySelector('h1');
		const meio = document.querySelector('.meio');
		const pixels = document.querySelector('.pixels');
		const u = window.innerWidth / 1600;
		let tamanho = parseFloat(getComputedStyle(h1).fontSize) / u;
		const encosta = () => {
			if (!pixels) return false;
			const a = h1.getBoundingClientRect();
			const b = pixels.getBoundingClientRect();
			return a.right > b.left - 24 * u && a.bottom > b.top && a.top < b.bottom;
		};
		const estilo = getComputedStyle(meio);
		const espaco = meio.clientHeight - parseFloat(estilo.paddingTop) - parseFloat(estilo.paddingBottom);
		while ((h1.offsetHeight > espaco || encosta()) && tamanho > 40) {
			tamanho -= 2;
			h1.style.fontSize = `${tamanho * u}px`;
		}
	});
	await pagina.screenshot({ path: p.saida, type: 'jpeg', quality: p.qualidade || 86 });
	await pagina.close();
	console.log(`  ${p.saida}`);
}
await navegador.close();

// Limpeza: capas e prévias de artigos que não existem mais (ou que passaram a ter foto própria).
const slugs = new Set(artigos.map((a) => a.slug));
for (const nome of readdirSync(PASTA_CAPAS)) {
	if (/\.jpe?g$/i.test(nome) && !capasValidas.has(nome)) {
		rmSync(path.join(PASTA_CAPAS, nome));
		console.log(`  removida: ${path.join(PASTA_CAPAS, nome)}`);
	}
}
for (const nome of readdirSync(PASTA_OG)) {
	const m = nome.match(/^blog-(.+)\.jpg$/);
	if (m && !slugs.has(m[1])) {
		rmSync(path.join(PASTA_OG, nome));
		console.log(`  removida: ${path.join(PASTA_OG, nome)}`);
	}
}
console.log(`${pecas.length} imagens geradas. Agora rode "npm run build".`);
