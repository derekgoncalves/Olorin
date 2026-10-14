/**
 * Gera as imagens de compartilhamento (Open Graph, 1200×630) em src/assets/og/.
 * São as prévias que aparecem quando alguém manda o link no WhatsApp, Instagram ou LinkedIn.
 *
 *   npm run og
 *
 * Usa o Chromium do Playwright e as mesmas fontes do site. Rode de novo sempre que mudar
 * o título de um serviço. As imagens geradas vão para o Git (o build só copia).
 */
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { chromium } from 'playwright-core';
import sharp from 'sharp';

const SAIDA = 'src/assets/og';
const cfg = JSON.parse(readFileSync('src/_data/site/config.json', 'utf8'));
const ler = (arquivo) => yaml.load(readFileSync(arquivo, 'utf8'));
// Fontes embutidas (data URI): a página é montada em memória, sem acesso a arquivos locais.
const fonte = (nome) => `data:font/woff2;base64,${readFileSync(path.join('src/assets/fonts', nome)).toString('base64')}`;
const logo = readFileSync('_brand/logos/logo-olorin.svg', 'utf8').replace('aria-hidden="true"', '');
const semMarcador = (t) => (/\[CONFIRMAR/i.test(String(t || '')) ? '' : String(t || ''));
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const CHROMIUM = [
	process.env.CHROMIUM_PATH,
	'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
	'/opt/pw-browsers/chromium',
].find((c) => c && existsSync(c));

/* Três combinações da marca. Violeta nunca encosta no verde-limão. */
const TEMAS = {
	preto: { fundo: '#000', texto: '#fff', destaque: '#ecff36', janela: '#000', borda: '#fff', barra: '#fff', barraTexto: '#000' },
	violeta: { fundo: '#7e3bed', texto: '#fff', destaque: '#fff', janela: '#7e3bed', borda: '#fff', barra: '#000', barraTexto: '#fff' },
	verde: { fundo: '#ecff36', texto: '#000', destaque: '#000', janela: '#ecff36', borda: '#000', barra: '#000', barraTexto: '#ecff36' },
};

function html({ janela, etiqueta, titulo, destaque, rodape, tema, foto }) {
	const t = TEMAS[tema];
	return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
@font-face { font-family: Titulo; src: url("${fonte('archivo-expanded-900.woff2')}") format("woff2"); }
@font-face { font-family: Texto; src: url("${fonte('cascadia-code-400.woff2')}") format("woff2"); }
@font-face { font-family: Texto; font-weight: 700; src: url("${fonte('cascadia-code-700.woff2')}") format("woff2"); }
@font-face { font-family: Pixel; src: url("${fonte('silkscreen-400.woff2')}") format("woff2"); }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { background: ${t.fundo}; color: ${t.texto}; font-family: Texto, monospace; padding: 44px 52px; display: flex; flex-direction: column; gap: 30px;
	background-image: radial-gradient(circle at 1px 1px, ${t.texto}22 1px, transparent 0); background-size: 24px 24px; }
.janela { flex: 1; border: 4px solid ${t.borda}; background: ${t.janela}; box-shadow: 12px 12px 0 ${t.borda}; display: flex; flex-direction: column; }
.barra { background: ${t.barra}; color: ${t.barraTexto}; font: 20px Pixel, monospace; letter-spacing: .04em; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; }
.ctrl { display: flex; gap: 8px; } .ctrl i { width: 18px; height: 18px; border: 3px solid ${t.barraTexto}; display: block; }
.corpo { flex: 1; padding: 36px 40px 34px; display: flex; flex-direction: column; justify-content: center; gap: 22px; }
.etiqueta { font: 22px Pixel, monospace; text-transform: uppercase; letter-spacing: .06em; color: ${t.destaque}; }
h1 { font: 900 64px/1.02 Titulo, sans-serif; text-transform: uppercase; letter-spacing: -.01em; max-width: 1000px; }
h1 em { font-style: normal; color: ${t.destaque}; ${tema === 'preto' ? '' : 'text-decoration: underline; text-decoration-thickness: 8px; text-underline-offset: 8px;'} }
.com-foto { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 40px; padding-right: 40px; }
.foto { align-self: center; width: 300px; height: 300px; border: 4px solid ${t.borda}; box-shadow: 10px 10px 0 ${t.barra}; background: ${t.barra} center / cover no-repeat; }
.rodape { display: flex; justify-content: space-between; align-items: center; }
.rodape svg { height: 38px; width: auto; color: ${t.texto}; }
.rodape p { font: 700 24px Texto, monospace; }
</style></head><body>
<div class="janela"><div class="barra"><span>${esc(janela)}</span><span class="ctrl"><i></i><i></i></span></div>
<div class="${foto ? 'com-foto' : ''}" style="flex: 1; display: ${foto ? 'grid' : 'flex'};"><div class="corpo">${etiqueta ? `<p class="etiqueta">${esc(etiqueta)}</p>` : ''}<h1>${esc(titulo)}${destaque ? ` <em>${esc(destaque)}</em>` : ''}</h1></div>${foto ? `<div class="foto" style="background-image: url('${foto}')"></div>` : ''}</div></div>
<div class="rodape">${logo}<p>${esc(rodape)}</p></div>
</body></html>`;
}

const home = ler('src/content/home.yml');
const hub = ler('src/content/paginas/servicos.yml');
const promo = ler('src/content/paginas/promo.yml');
const sobre = ler('src/content/paginas/sobre.yml');
const planos = ler('src/content/paginas/planos.yml');
const metodo = ler('src/content/paginas/como-trabalhamos.yml');
const portfolio = ler('src/content/paginas/portfolio.yml');
const equipe = ler('src/content/equipe.yml');
const manifesto = JSON.parse(readFileSync('src/assets/manifest.json', 'utf8')).imagens;
const servicos = readdirSync('src/content/servicos')
	.filter((n) => n.endsWith('.yml'))
	.map((n) => ler(path.join('src/content/servicos', n)))
	.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

/* Foto quadrada da pessoa (o mesmo recorte do site), embutida como data URI. */
async function fotoDe(id) {
	const m = manifesto[id];
	if (!m) return '';
	const [left, top, width, height] = m.recorte;
	const buf = await sharp(m.arquivo_original).extract({ left, top, width, height }).resize(600, 600).jpeg({ quality: 88 }).toBuffer();
	return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

const pecas = [
	{
		arquivo: 'home.jpg',
		tema: 'preto',
		janela: 'olorin.exe',
		etiqueta: `Agência de marketing · ${cfg.CIDADE}`,
		titulo: `${home.hero.titulo_1} ${home.hero.titulo_2}`,
		destaque: home.hero.titulo_destaque,
		rodape: 'olorin.com.br',
	},
	{
		arquivo: 'servicos.jpg',
		tema: 'preto',
		janela: hub.janela || 'servicos.exe',
		etiqueta: servicos.map((s) => s.chip || s.nome).join(' · '),
		titulo: semMarcador(hub.titulo) || 'Serviços de marketing digital',
		rodape: 'olorin.com.br/servicos',
	},
	{
		arquivo: 'sobre.jpg',
		tema: 'preto',
		janela: 'equipe.exe',
		etiqueta: sobre.etiqueta || 'Quem somos',
		titulo: semMarcador(sobre.titulo) || 'Um time inteiro cuidando da sua marca.',
		rodape: 'olorin.com.br/quem-somos',
	},
	{
		arquivo: 'promo.jpg',
		tema: 'verde',
		janela: 'raio_x.exe',
		etiqueta: promo.etiqueta || 'Raio-X gratuito',
		titulo: semMarcador(promo.titulo) || 'Onde a sua marca trava?',
		rodape: 'olorin.com.br',
	},
	{
		arquivo: 'planos.jpg',
		tema: 'verde',
		janela: planos.janela || 'precos.txt',
		etiqueta: planos.etiqueta || 'Planos e preços',
		titulo: semMarcador(planos.titulo) || 'Preço na mesa.',
		rodape: 'olorin.com.br/planos',
	},
	{
		arquivo: 'como-trabalhamos.jpg',
		tema: 'violeta',
		janela: metodo.janela || 'metodo.exe',
		etiqueta: metodo.etiqueta || 'Como trabalhamos',
		titulo: semMarcador(metodo.titulo) || 'Sem caixa-preta.',
		rodape: 'olorin.com.br/como-trabalhamos',
	},
	{
		arquivo: 'portfolio.jpg',
		tema: 'preto',
		janela: 'portfolio.exe',
		etiqueta: portfolio.etiqueta || 'Portfólio',
		titulo: semMarcador(portfolio.titulo) || 'Feito pela Olorin.',
		rodape: 'olorin.com.br/portfolio',
	},
	...(await Promise.all(
		(equipe.pessoas || []).map(async (p) => ({
			arquivo: `perfil-${p.slug}.jpg`,
			tema: 'violeta',
			janela: p.janela || `${p.slug}.jpg`,
			etiqueta: p.cargo || p.funcao,
			titulo: p.nome,
			rodape: `olorin.com.br/quem-somos/${p.slug}`,
			foto: await fotoDe(`${p.foto}-quadrada`),
		})),
	)),
	...servicos.map((s) => ({
		arquivo: `servico-${s.slug}.jpg`,
		tema: 'violeta',
		janela: s.janela || `${s.slug}.exe`,
		etiqueta: s.nome,
		titulo: semMarcador(s.hero && s.hero.h1) || s.nome,
		rodape: `olorin.com.br/servicos/${s.slug}`,
	})),
];

if (!CHROMIUM) {
	console.error('Chromium não encontrado. Defina CHROMIUM_PATH com o caminho do navegador.');
	process.exit(1);
}
mkdirSync(SAIDA, { recursive: true });
const navegador = await chromium.launch({ executablePath: CHROMIUM });
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const p of pecas) {
	await pagina.setContent(html(p), { waitUntil: 'load' });
	await pagina.evaluate(() => document.fonts.ready);
	// Título longo: reduz a fonte até caber.
	await pagina.evaluate(() => {
		const h1 = document.querySelector('h1');
		const corpo = document.querySelector('.corpo');
		let tamanho = 64;
		while (corpo.scrollHeight > corpo.clientHeight && tamanho > 36) {
			tamanho -= 2;
			h1.style.fontSize = `${tamanho}px`;
		}
	});
	await pagina.screenshot({ path: path.join(SAIDA, p.arquivo), type: 'jpeg', quality: 86 });
	console.log(`  ${p.arquivo}`);
}
await navegador.close();
console.log(`${pecas.length} imagens em ${SAIDA}/`);
