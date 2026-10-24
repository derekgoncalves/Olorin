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
	'componentes/calculadora.css',
	'componentes/acordeao.css',
	'componentes/formulario.css',
	'componentes/orcamento.css',
	'componentes/chapa.css', // 23/10/2026: chapa do Raio-X (celular normal, flash e raio-x do celular), em todas as páginas e LPs
	'componentes/rodape.css',
	'componentes/flutuantes.css',
	'componentes/cookies.css',
	'componentes/pagina.css',
	'componentes/servico.css',
	'componentes/montagem.css', // 23/10/2026: montagem do celular (saiu do banner da home e foi para Redes sociais)
	'componentes/sobre.css',
	'componentes/promo.css',
	'componentes/erro.css',
	'componentes/estilo.css',
	'componentes/sociais.css',
	'componentes/prova.css',
	// 13/10/2026 (versão final): cada área do site tem o seu arquivo.
	'componentes/fundos.css', // fundos animados e interações de desktop (todas as páginas)
	'componentes/home.css', // blocos novos da home (resultados, Raio-X, atalho do banner)
	'componentes/perfil.css', // Quem somos e perfis da equipe
	'componentes/educacao.css', // LP Olorin Educação (tema próprio: .o-tema-educacao)
	'componentes/influenciadores.css', // 23/10/2026: LP Olorin para influenciadores (tema próprio: .o-tema-influenciadores)
	'animacoes.css',
	'responsivo.css',
];

/* Arquivos que só a LP Olorin Educação usa. A LP carrega o olorin-educacao.<hash>.css, que é o CSS
   completo na ordem acima; as outras páginas carregam o olorin.<hash>.css, sem estes arquivos
   (as fontes da LP também ficam fora do @font-face embutido delas). */
const SO_EDUCACAO = ['componentes/educacao.css'];
/* 23/10/2026: a LP de influenciadores também tem o próprio arquivo (olorin-influenciadores.<hash>.css). */
const SO_INFLUENCIADORES = ['componentes/influenciadores.css'];
/* E o contrário: arquivos que a LP Olorin Educação não usa (ficam fora do CSS dela, que é mais justo). */
const FORA_DA_EDUCACAO = [
	'componentes/acordeao.css', 'componentes/breadcrumb.css', 'componentes/calculadora.css', 'componentes/card-pessoa.css',
	'componentes/card-servico.css', 'componentes/checklist.css', 'componentes/estilo.css', 'componentes/metodo.css',
	'componentes/prova.css', 'componentes/resultados.css', 'componentes/sobre.css', 'componentes/portfolio.css',
	'componentes/orcamento.css', 'componentes/montagem.css', ...SO_INFLUENCIADORES,
];
/* Arquivos que a LP de influenciadores não usa. Ela usa o formulário do Raio-X igual ao da home
   (orcamento.css e chapa.css), a faixa de logos (marquee.css) e as redes (sociais.css); banner, seções,
   equipe e títulos são dela (influenciadores.css), por isso hero, home, página, serviço, resultados,
   relatório e prova também ficam fora. */
const FORA_DOS_INFLUENCIADORES = [
	'componentes/acordeao.css', 'componentes/breadcrumb.css', 'componentes/calculadora.css', 'componentes/card-pessoa.css',
	'componentes/card-servico.css', 'componentes/checklist.css', 'componentes/estilo.css', 'componentes/metodo.css',
	'componentes/sobre.css', 'componentes/portfolio.css', 'componentes/perfil.css', 'componentes/montagem.css',
	'componentes/promo.css', 'componentes/erro.css', 'componentes/hero.css', 'componentes/home.css',
	'componentes/pagina.css', 'componentes/servico.css', 'componentes/resultados.css', 'componentes/relatorio.css',
	'componentes/prova.css', ...SO_EDUCACAO,
];
/* Pacotes de CSS: o do site (todas as páginas menos as LPs) e o de cada LP. */
const PACOTES = {
	site: { prefixo: 'olorin.', fora: [...SO_EDUCACAO, ...SO_INFLUENCIADORES] },
	educacao: { prefixo: 'olorin-educacao.', fora: FORA_DA_EDUCACAO },
	influenciadores: { prefixo: 'olorin-influenciadores.', fora: FORA_DOS_INFLUENCIADORES },
};

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

async function construirCss({ prod, saida, pacote = 'site' }) {
	const { prefixo, fora } = PACOTES[pacote];
	let css = '';
	for (const arquivo of ORDEM_CSS.filter((a) => !fora.includes(a))) {
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

	// @font-face separado para ir embutido no <head> (as fontes começam a baixar antes do CSS completo,
	// evitando salto de layout). As fontes licenciadas, se existirem, entram também.
	const blocosFonte = (css.match(/@font-face\s*\{[^}]*\}/g) || []).join('\n');
	const fontFace = transform({ filename: 'fontes.css', code: Buffer.from(blocosFonte), minify: true, sourceMap: false }).code.toString();

	const { code } = transform({
		filename: 'olorin.css',
		code: Buffer.from(css),
		minify: prod,
		sourceMap: false,
		targets: { chrome: 100 << 16, firefox: 100 << 16, safari: 15 << 16 },
	});

	const nome = `${prefixo}${hash(code)}.css`;
	const pasta = path.join(saida, 'assets/css');
	await mkdir(pasta, { recursive: true });
	await limparPasta(pasta, prefixo);
	await writeFile(path.join(pasta, nome), code);
	return { href: `/assets/css/${nome}`, bytes: code.length, licenciadas, fontFace };
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
	const [css, cssEducacao, cssInfluenciadores, js] = await Promise.all([
		construirCss({ prod, saida }),
		construirCss({ prod, saida, pacote: 'educacao' }),
		construirCss({ prod, saida, pacote: 'influenciadores' }),
		construirJs({ prod, saida }),
	]);
	const fontes = [
		// Pré-carregadas: só as usadas na primeira dobra.
		css.licenciadas.find((f) => f.familia === 'Integral CF')
			? { href: css.licenciadas.find((f) => f.familia === 'Integral CF').arquivo, tipo: css.licenciadas.find((f) => f.familia === 'Integral CF').tipo }
			: { href: '/assets/fonts/archivo-expanded-900.woff2', tipo: 'font/woff2' },
		{ href: '/assets/fonts/cascadia-code-400.woff2', tipo: 'font/woff2' },
		// Fonte pixel da linha acima do título do banner (2,8 KiB): pré-carregada para a linha não mudar de tamanho.
		css.licenciadas.find((f) => f.familia === 'Retro Computer')
			? { href: css.licenciadas.find((f) => f.familia === 'Retro Computer').arquivo, tipo: css.licenciadas.find((f) => f.familia === 'Retro Computer').tipo }
			: { href: '/assets/fonts/silkscreen-400.woff2', tipo: 'font/woff2' },
	];
	return {
		css: css.href,
		cssBytes: css.bytes,
		cssEducacao: cssEducacao.href,
		fontFaceEducacao: cssEducacao.fontFace,
		cssInfluenciadores: cssInfluenciadores.href,
		fontFaceInfluenciadores: cssInfluenciadores.fontFace,
		js: js.src, jsBytes: js.bytes, fontes, fontFace: css.fontFace, licenciadas: css.licenciadas.map((f) => f.familia) };
}
