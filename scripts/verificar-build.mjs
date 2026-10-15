/**
 * Verificações automáticas do site pronto (dist/). Roda no fim de "npm run build".
 * Qualquer ERRO interrompe o build (código de saída 1); AVISOS só aparecem na tela.
 *
 * Confere: marcadores [CONFIRMAR], domínio e Instagram certos, WhatsApp da config,
 * <title> ≤ 60 e description ≤ 155, um <h1> por página, imagens com alt, IDs únicos,
 * JSON-LD válido, chips do formulário iguais à lista do enviar.php e arquivos obrigatórios.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const SAIDA = process.env.OLORIN_SAIDA || 'dist';
const cfg = JSON.parse(readFileSync('src/_data/site/config.json', 'utf8'));
const REDES = [cfg.FACEBOOK_URL, cfg.X_URL, cfg.LINKEDIN_URL].filter(Boolean).flatMap((u) => [u, u.replace(/^https?:/, ''), u.replace(/\//g, '\\/')]);
const erros = [];
const avisos = [];
const erro = (arquivo, msg) => erros.push(`${arquivo}: ${msg}`);
const aviso = (arquivo, msg) => avisos.push(`${arquivo}: ${msg}`);

function listar(pasta) {
	const saida = [];
	for (const nome of readdirSync(pasta)) {
		const caminho = path.join(pasta, nome);
		if (statSync(caminho).isDirectory()) saida.push(...listar(caminho));
		else saida.push(caminho);
	}
	return saida;
}

const decodificar = (t) =>
	t
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&#x27;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&nbsp;/g, ' ');

if (!existsSync(SAIDA)) {
	console.error('dist/ não existe. Rode "npm run build" primeiro.');
	process.exit(1);
}

const arquivos = listar(SAIDA);
const rel = (a) => path.relative(SAIDA, a);
const textos = arquivos.filter((a) => /\.(html|php|txt|xml|webmanifest|css|js|json)$/.test(a) || path.basename(a) === '.htaccess');

// 1. Arquivos obrigatórios e proibidos
for (const obrigatorio of ['index.html', '404.html', '.htaccess', 'enviar.php', 'config.example.php', 'olorin-ids.js', 'robots.txt', 'sitemap.xml', 'llms.txt', 'site.webmanifest', 'favicon.ico', 'leads/.htaccess', 'obrigado/index.html', 'politica-de-privacidade/index.html', 'quem-somos/index.html', 'servicos/index.html']) {
	if (!existsSync(path.join(SAIDA, obrigatorio))) erro(obrigatorio, 'arquivo obrigatório não foi gerado');
}
for (const a of arquivos) {
	const r = rel(a);
	if (/(^|\/)(config|olorin-config)\.php$/.test(r)) erro(r, 'config.php com senha não pode ir no pacote (só config.example.php)');
	if (/^_estilo\//.test(r)) erro(r, 'o guia de estilo é só de desenvolvimento');
	if (/\.(md|yml|yaml|csv|env|log)$/.test(r)) erro(r, 'tipo de arquivo que não deve ir para o servidor');
	if (/^assets\/fonts\/licenciadas\//.test(r)) aviso(r, 'fonte paga incluída no pacote (confira se a licença cobre uso na web)');
}

// 2. Regras de texto em todos os arquivos de texto
for (const a of textos) {
	const r = rel(a);
	const t = readFileSync(a, 'utf8');
	// TEMPORÁRIO durante a reescrita (13/10/2026): volta a ser erro antes da entrega.
	if (/\[CONFIRMAR/i.test(t)) erro(r, 'tem marcador [CONFIRMAR] (o visitante veria o colchete; marque com # PENDENTE no YAML)');
	// Perfis oficiais nas redes (config.json) não contam como domínio errado.
	const semRedes = REDES.reduce((texto, url) => texto.split(url).join(''), t);
	if (/olorindigital/i.test(semRedes)) erro(r, 'domínio errado "olorindigital"');
	const digital = semRedes.match(/[\w@./-]*olorin\.digital[\w./-]*/gi) || [];
	for (const ocorrencia of digital) {
		if (!/^(@olorin\.digital_|((https?:)?\/\/)?(www\.)?instagram\.com\/olorin\.digital_\/?)$/i.test(ocorrencia)) {
			erro(r, `"olorin.digital" fora do Instagram: ${ocorrencia}`);
		}
	}
	if (/5541900000000|90000-0000|99999-9999(?!<\/)/.test(t) && !/placeholder|exemplo|Ex\./i.test(t)) {
		aviso(r, 'número de telefone de exemplo encontrado');
	}
	const numeros = new Set((t.match(/wa\.me\/(\d+)/g) || []).map((m) => m.split('/')[1]));
	for (const n of numeros) {
		if (n !== cfg.WHATSAPP) erro(r, `link de WhatsApp para número diferente da config: ${n}`);
	}
}

// 3. Páginas HTML
const titulos = new Map();
let paginas = 0;
for (const a of arquivos.filter((x) => x.endsWith('.html'))) {
	const r = rel(a);
	const html = readFileSync(a, 'utf8');
	paginas++;

	const titulo = decodificar((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').trim();
	if (!titulo) erro(r, 'sem <title>');
	else if (titulo.length > 60) erro(r, `<title> com ${titulo.length} caracteres (máx. 60): "${titulo}"`);
	const semIndice = /<meta name="robots" content="noindex/.test(html);
	if (titulo && !semIndice) {
		if (titulos.has(titulo)) aviso(r, `<title> repetido com ${titulos.get(titulo)}`);
		else titulos.set(titulo, r);
	}

	const descricao = decodificar((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').trim();
	if (!descricao) erro(r, 'sem meta description');
	else if (descricao.length > 155) erro(r, `meta description com ${descricao.length} caracteres (máx. 155)`);

	const h1 = (html.match(/<h1[\s>]/g) || []).length;
	if (h1 !== 1) erro(r, `${h1} <h1> na página (precisa ser exatamente 1)`);

	if (!/<html lang="pt-BR"/.test(html)) erro(r, 'sem lang="pt-BR"');
	if (!/<link rel="canonical" href="https:\/\/olorin\.com\.br\//.test(html)) erro(r, 'canonical ausente ou fora de https://olorin.com.br/');

	for (const img of html.match(/<img\b[^>]*>/g) || []) {
		if (!/\salt(=|\s|>)/.test(img)) erro(r, `imagem sem alt: ${img.slice(0, 90)}`);
		if (!/\swidth="\d+"/.test(img) || !/\sheight="\d+"/.test(img)) aviso(r, `imagem sem width/height: ${img.slice(0, 90)}`);
	}

	const ids = (html.match(/\sid="([^"]+)"/g) || []).map((m) => m.slice(5, -1));
	const vistos = new Set();
	for (const id of ids) {
		if (vistos.has(id)) erro(r, `id repetido: "${id}"`);
		vistos.add(id);
	}
	for (const alvo of html.match(/\s(?:for|aria-labelledby|aria-describedby|aria-controls)="([^"]+)"/g) || []) {
		const valor = alvo.split('="')[1].slice(0, -1);
		for (const id of valor.split(/\s+/)) {
			if (id && !vistos.has(id)) erro(r, `referência a id inexistente: ${alvo.trim()}`);
		}
	}

	for (const bloco of html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || []) {
		try {
			JSON.parse(bloco.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, ''));
		} catch (e) {
			erro(r, `JSON-LD inválido: ${e.message}`);
		}
	}

	for (const link of html.match(/<a\b[^>]*target="_blank"[^>]*>/g) || []) {
		if (!/rel="[^"]*noopener/.test(link)) erro(r, `link target=_blank sem rel="noopener": ${link.slice(0, 90)}`);
	}
}

// 4. Formulário × enviar.php: as opções precisam ser idênticas
const php = existsSync(path.join(SAIDA, 'enviar.php')) ? readFileSync(path.join(SAIDA, 'enviar.php'), 'utf8') : '';
const listaPhp = php.match(/json_decode\('([\s\S]*?)', true\)/);
if (!listaPhp) {
	erro('enviar.php', 'lista de opções ($OLORIN_LISTAS) não encontrada');
} else {
	const listas = JSON.parse(listaPhp[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\'));
	for (const a of arquivos.filter((x) => x.endsWith('.html'))) {
		const html = readFileSync(a, 'utf8');
		for (const m of html.match(/name="servicos\[\]" value="([^"]+)"/g) || []) {
			const valor = decodificar(m.split('value="')[1].slice(0, -1));
			if (!listas.servicos.includes(valor)) erro(rel(a), `opção de serviço "${valor}" não existe na lista do enviar.php`);
		}
		const selecao = html.match(/<select[^>]*name="investimento"[\s\S]*?<\/select>/);
		if (selecao) {
			for (const m of selecao[0].match(/<option value="([^"]+)"/g) || []) {
				const valor = decodificar(m.split('value="')[1].slice(0, -1));
				if (!listas.investimento.includes(valor)) erro(rel(a), `faixa de investimento "${valor}" não existe na lista do enviar.php`);
			}
		}
	}
	if (/\{\{|\{%/.test(php)) erro('enviar.php', 'sobrou marcação do Nunjucks no PHP');
}

// 5. Sitemap: só páginas indexáveis, todas existentes
const sitemap = existsSync(path.join(SAIDA, 'sitemap.xml')) ? readFileSync(path.join(SAIDA, 'sitemap.xml'), 'utf8') : '';
for (const loc of sitemap.match(/<loc>([^<]+)<\/loc>/g) || []) {
	const url = loc.slice(5, -6);
	const caminho = url.replace(/^https:\/\/olorin\.com\.br/, '');
	const arquivo = path.join(SAIDA, caminho, caminho.endsWith('/') ? 'index.html' : '');
	if (!existsSync(arquivo)) erro('sitemap.xml', `URL sem página: ${url}`);
	else if (/<meta name="robots" content="noindex/.test(readFileSync(arquivo, 'utf8'))) erro('sitemap.xml', `página com noindex no sitemap: ${url}`);
}

// 5b. Toda página indexável precisa estar no sitemap
const noSitemap = new Set((sitemap.match(/<loc>([^<]+)<\/loc>/g) || []).map((l) => l.slice(5, -6)));
for (const a of arquivos.filter((x) => x.endsWith('index.html'))) {
	const html = readFileSync(a, 'utf8');
	if (/<meta name="robots" content="noindex/.test(html)) continue;
	const url = 'https://olorin.com.br/' + rel(a).replace(/index\.html$/, '');
	if (!noSitemap.has(url)) erro('sitemap.xml', `página indexável fora do sitemap: ${url}`);
}

// 6. Orçamento de peso (PROMPT seção 15). Conta o tamanho comprimido, que é o que o visitante baixa
// (o .htaccess liga o gzip); o CSS de cada página já vai embutido no HTML e o arquivo completo carrega depois.
const pesar = (filtro) => arquivos.filter(filtro).reduce((s, a) => s + statSync(a).size, 0);
const comprimido = (filtro) => arquivos.filter(filtro).reduce((s, a) => s + gzipSync(readFileSync(a), { level: 9 }).length, 0);
const kb = (b) => `${(b / 1024).toFixed(1)} KiB`;
const ehCss = (a) => /assets\/css\/olorin\.[^/]*\.css$/.test(a);
const ehCssEducacao = (a) => /assets\/css\/olorin-educacao\.[^/]*\.css$/.test(a);
const ehJs = (a) => /assets\/js\/.*\.js$/.test(a);
const css = pesar(ehCss);
const js = pesar(ehJs);
const cssGz = comprimido(ehCss);
const jsGz = comprimido(ehJs);
const fontes = pesar((a) => /assets\/fonts\/.*\.woff2?$/.test(a));
if (jsGz > 20 * 1024) aviso('assets/js', `JavaScript com ${kb(jsGz)} comprimido (meta: até 20 KiB)`);
const cssEduGz = comprimido(ehCssEducacao);
if (cssGz > 35 * 1024) aviso('assets/css', `CSS com ${kb(cssGz)} comprimido (meta: até 35 KiB)`);
// A LP Olorin Educação carrega o CSS completo (o do site + o visual próprio dela) num arquivo só dela.
if (cssEduGz > 40 * 1024) aviso('assets/css', `CSS da LP Olorin Educação com ${kb(cssEduGz)} comprimido (meta: até 40 KiB)`);

console.log(`\nVerificação do build: ${paginas} páginas · CSS ${kb(css)} (${kb(cssGz)} comprimido; LP Educação ${kb(cssEduGz)}) · JS ${kb(js)} (${kb(jsGz)} comprimido) · fontes ${kb(fontes)}`);
for (const a of avisos) console.log(`  aviso  ${a}`);
for (const e of erros) console.log(`  ERRO   ${e}`);
if (erros.length) {
	console.log(`\n${erros.length} erro(s). Corrija antes de enviar para o FTP.\n`);
	process.exit(1);
}
console.log(`Tudo certo${avisos.length ? ` (${avisos.length} aviso(s))` : ''}.\n`);
