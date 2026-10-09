/**
 * CSS e JavaScript do site.
 *
 * CSS: os arquivos de src/styles/ são concatenados na ordem de ORDEM_CSS, processados
 *      pelo Lightning CSS (minificado em produção) e gravados como assets/css/olorin.<hash>.css.
 * JS:  src/scripts/main.js é empacotado pelo esbuild (um arquivo, sem dependências)
 *      e gravado como assets/js/olorin.<hash>.js.
 *
 * Fontes licenciadas (Integral CF e Retro Computer): se os arquivos existirem em
 * src/assets/fonts/licenciadas/, o @font-face é gerado e as fontes passam a valer no site.
 * Ver docs/BRAND.md (licenças) e docs/EDITAR.md (como ativar).
 */
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { transform } from 'lightningcss';
import * as esbuild from 'esbuild';

export const ORDEM_CSS = [
	'tokens.css',
	'base.css',
	'componentes/icone.css',
	'componentes/tipografia.css',
	'componentes/botao.css',
	'componentes/janela.css',
	'componentes/etiqueta.css',
	'componentes/chip.css',
	'componentes/cabecalho.css',
	'componentes/menu.css',
	'componentes/breadcrumb.css',
	'componentes/hero.css',
	'componentes/marquee.css',
	'componentes/checklist.css',
	'componentes/metodo.css',
	'componentes/card-servico.css',
	'componentes/resultados.css',
	'componentes/portfolio.css',
	'componentes/card-pessoa.css',
	'componentes/relatorio.css',
	'componentes/card-plano.css',
	'componentes/calculadora.css',
	'componentes/acordeao.css',
	'componentes/formulario.css',
	'componentes/orcamento.css',
	'componentes/rodape.css',
	'componentes/flutuantes.css',
	'componentes/cookies.css',
	'componentes/pagina.css',
	'componentes/servico.css',
	'componentes/sobre.css',
	'componentes/promo.css',
	'componentes/erro.css',
	'componentes/estilo.css',
	'animacoes.css',
	'responsivo.css',
];

/* Fontes pagas da marca. Métricas verticais iguais às das substitutas (medidas no manual)
   para que títulos, botões e etiquetas fiquem na mesma altura. */
const LICENCIADAS = [
	{
		familia: 'Integral CF',
		base: 'integral-cf-bold',
		variavel: '--fonte-titulo',
		reserva: '"Archivo Expanded", "Arial Black", Impact, sans-serif',
		metricas: 'ascent-override: 88%; descent-override: 21%; line-gap-override: 0%;',
	},
	{
		familia: 'Retro Computer',
		base: 'retro-computer',
		variavel: '--fonte-pixel',
		reserva: '"Silkscreen", "Courier New", monospace',
		metricas: 'ascent-override: 103%; descent-override: 25%; line-gap-override: 0%;',
	},
];
const FORMATOS = { woff2: 'woff2', woff: 'woff', ttf: 'truetype', otf: 'opentype' };

function hash(conteudo) {
	return createHash('sha256').update(conteudo).digest('hex').slice(0, 10);
}

async function limparPasta(pasta, prefixo) {
	if (!existsSync(pasta)) {
		return;
	}
	for (const nome of await readdir(pasta)) {
		if (nome.startsWith(prefixo)) {
			await rm(path.join(pasta, nome));
		}
	}
}

export async function fontesLicenciadas() {
	const pasta = 'src/assets/fonts/licenciadas';
	const ativas = [];
	for (const fonte of LICENCIADAS) {
		for (const ext of Object.keys(FORMATOS)) {
			const arquivo = path.join(pasta, `${fonte.base}.${ext}`);
			if (existsSync(arquivo)) {
				ativas.push({ ...fonte, arquivo: `/assets/fonts/licenciadas/${fonte.base}.${ext}`, formato: FORMATOS[ext], tipo: `font/${ext}` });
				break;
			}
		}
	}
	return ativas;
}

async function construirCss({ prod, saida }) {
	let css = '';
	for (const arquivo of ORDEM_CSS) {
		const caminho = path.join('src/styles', arquivo);
		if (!existsSync(caminho)) {
			throw new Error(`CSS não encontrado: ${caminho} (confira ORDEM_CSS em scripts/assets.mjs)`);
		}
		css += `/* ${arquivo} */\n${await readFile(caminho, 'utf8')}\n`;
	}

	const licenciadas = await fontesLicenciadas();
	if (licenciadas.length) {
		css += '/* fontes licenciadas da marca */\n';
		for (const f of licenciadas) {
			css += `@font-face { font-family: "${f.familia}"; src: url("${f.arquivo}") format("${f.formato}"); font-weight: 100 900; font-style: normal; font-display: swap; ${f.metricas} }\n`;
		}
		css += `:root { ${licenciadas.map((f) => `${f.variavel}: "${f.familia}", ${f.reserva};`).join(' ')} }\n`;
	}

	const { code } = transform({
		filename: 'olorin.css',
		code: Buffer.from(css),
		minify: prod,
		sourceMap: false,
		targets: { chrome: 100 << 16, firefox: 100 << 16, safari: 15 << 16 },
	});

	const nome = `olorin.${hash(code)}.css`;
	const pasta = path.join(saida, 'assets/css');
	await mkdir(pasta, { recursive: true });
	await limparPasta(pasta, 'olorin.');
	await writeFile(path.join(pasta, nome), code);
	return { href: `/assets/css/${nome}`, bytes: code.length, licenciadas };
}

async function construirJs({ prod, saida }) {
	const resultado = await esbuild.build({
		entryPoints: ['src/scripts/main.js'],
		bundle: true,
		format: 'iife',
		target: ['es2019'],
		minify: prod,
		write: false,
		legalComments: 'none',
		define: { 'process.env.NODE_ENV': JSON.stringify(prod ? 'production' : 'development') },
	});
	const codigo = resultado.outputFiles[0].contents;
	const nome = `olorin.${hash(codigo)}.js`;
	const pasta = path.join(saida, 'assets/js');
	await mkdir(pasta, { recursive: true });
	await limparPasta(pasta, 'olorin.');
	await writeFile(path.join(pasta, nome), codigo);
	return { src: `/assets/js/${nome}`, bytes: codigo.length };
}

export async function construirAssets({ prod, saida }) {
	const [css, js] = await Promise.all([construirCss({ prod, saida }), construirJs({ prod, saida })]);
	const fontes = [
		// Pré-carregadas: só as usadas na primeira dobra.
		css.licenciadas.find((f) => f.familia === 'Integral CF')
			? { href: css.licenciadas.find((f) => f.familia === 'Integral CF').arquivo, tipo: css.licenciadas.find((f) => f.familia === 'Integral CF').tipo }
			: { href: '/assets/fonts/archivo-expanded-900.woff2', tipo: 'font/woff2' },
		{ href: '/assets/fonts/cascadia-code-400.woff2', tipo: 'font/woff2' },
	];
	return { css: css.href, cssBytes: css.bytes, js: js.src, jsBytes: js.bytes, fontes, licenciadas: css.licenciadas.map((f) => f.familia) };
}
