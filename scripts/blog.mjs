/**
 * Blog da Olorin: tudo o que o Eleventy precisa para montar /blog/ e os artigos.
 *
 *   Artigos:  src/blog/artigos/<slug>.md  (um arquivo por artigo; modelo em _modelo.md)
 *   Imagens:  src/assets/img-src/blog/     (fotos próprias; entram sozinhas no site)
 *   Capas:    src/assets/img-src/blog/capas/<slug>.jpg  (geradas por "npm run capas")
 *   Prévias:  src/assets/og/blog-<slug>.jpg              (geradas por "npm run capas")
 *
 * Guia passo a passo para quem escreve: docs/BLOG.md.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { escapar, imagem } from './filtros.mjs';

export const PASTA_ARTIGOS = 'src/blog/artigos';
export const PASTA_IMAGENS = 'src/assets/img-src/blog';
export const PASTA_CAPAS = 'src/assets/img-src/blog/capas';
export const PASTA_OG = 'src/assets/og';
export const EXTENSOES_IMAGEM = /\.(jpe?g|png|webp|avif)$/i;

export const LIMITE_TITULO = 60;
export const LIMITE_DESCRICAO = 155;

/* Cores da capa e do selo de cada categoria. Violeta nunca encosta no verde: a capa "preto"
   usa verde só por dentro, longe das bordas; "violeta" usa preto e branco; "branco" usa violeta.
   Categoria nova ganha uma das três sozinha (sempre a mesma para o mesmo nome). */
const TEMAS = ['preto', 'violeta', 'branco'];
const TEMAS_FIXOS = { 'trafego-pago': 'preto', 'redes-sociais': 'violeta', educacao: 'branco' };

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** "Tráfego pago" → "trafego-pago" (serve para endereço, âncora e nome de arquivo). */
export function slugificar(texto) {
	return String(texto ?? '')
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function temaDaCategoria(nome) {
	const slug = slugificar(nome);
	if (TEMAS_FIXOS[slug]) return TEMAS_FIXOS[slug];
	let soma = 0;
	for (const letra of slug) soma = (soma * 31 + letra.charCodeAt(0)) % 9973;
	return TEMAS[soma % TEMAS.length];
}

/** Id da imagem no site a partir do arquivo em src/assets/img-src/blog/ ("capas/x.jpg" → "blog-capas-x"). */
export function idImagemBlog(arquivo) {
	const semExtensao = String(arquivo).replace(/\\/g, '/').replace(EXTENSOES_IMAGEM, '');
	return `blog-${semExtensao.split('/').map(slugificar).filter(Boolean).join('-')}`;
}

/** Data do front matter (Date do YAML ou texto "AAAA-MM-DD") → "AAAA-MM-DD". */
export function dataIso(valor) {
	if (valor instanceof Date && !Number.isNaN(valor.getTime())) return valor.toISOString().slice(0, 10);
	const texto = String(valor ?? '').trim();
	return /^\d{4}-\d{2}-\d{2}/.test(texto) ? texto.slice(0, 10) : '';
}

/** "2026-10-13" → "13 de outubro de 2026" */
export function dataExtenso(valor) {
	const iso = dataIso(valor);
	if (!iso) return '';
	const [a, m, d] = iso.split('-').map(Number);
	return `${d} de ${MESES[m - 1]} de ${a}`;
}

/** "2026-10-13" → "13 out 2026" */
export function dataCurta(valor) {
	const iso = dataIso(valor);
	if (!iso) return '';
	const [a, m, d] = iso.split('-').map(Number);
	return `${d} ${MESES[m - 1].slice(0, 3)} ${a}`;
}

/** Minutos de leitura do texto (sem o front matter), a 200 palavras por minuto. */
export function tempoLeitura(markdown) {
	const corpo = String(markdown ?? '').replace(/^---[\s\S]*?\n---/, '');
	const palavras = corpo
		.replace(/<[^>]+>/g, ' ')
		.replace(/[#*_>`[\]()!-]/g, ' ')
		.split(/\s+/)
		.filter((p) => /[\p{L}\p{N}]/u.test(p)).length;
	return Math.max(1, Math.round(palavras / 200));
}

/** <title> do artigo: título (ou titulo_seo) + nome do blog quando couber em 60 caracteres. */
export function tituloDaPagina(base) {
	const texto = String(base ?? '').trim();
	for (const sufixo of [' | Blog da Olorin', ' | Olorin']) {
		if (texto.length + sufixo.length <= LIMITE_TITULO) return texto + sufixo;
	}
	return texto;
}

/** Lê o front matter de um arquivo .md (usado pelo gerador de capas, fora do Eleventy). */
export function lerFrontMatter(arquivo) {
	const texto = readFileSync(arquivo, 'utf8').replace(/^﻿/, '');
	const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	return { dados: (m && yaml.load(m[1])) || {}, corpo: m ? texto.slice(m[0].length) : texto };
}

/** Lista os artigos (arquivos .md da pasta, sem os que começam com "_"). */
export function listarArtigos() {
	if (!existsSync(PASTA_ARTIGOS)) return [];
	return readdirSync(PASTA_ARTIGOS)
		.filter((n) => n.endsWith('.md') && !n.startsWith('_'))
		.sort()
		.map((nome) => {
			const arquivo = path.join(PASTA_ARTIGOS, nome);
			const { dados, corpo } = lerFrontMatter(arquivo);
			return { arquivo, slug: slugificar(nome.replace(/\.md$/, '')), dados, corpo };
		});
}

/** Foto própria do artigo: o campo "imagem" ou um arquivo com o mesmo nome do artigo. */
export function fotoPropria(slug, dados) {
	if (dados && dados.imagem) {
		const caminho = path.join(PASTA_IMAGENS, String(dados.imagem));
		return existsSync(caminho) ? caminho : null;
	}
	if (!existsSync(PASTA_IMAGENS)) return null;
	for (const nome of readdirSync(PASTA_IMAGENS, { withFileTypes: true })) {
		if (nome.isFile() && EXTENSOES_IMAGEM.test(nome.name) && slugificar(nome.name.replace(EXTENSOES_IMAGEM, '')) === slug) {
			return path.join(PASTA_IMAGENS, nome.name);
		}
	}
	return null;
}

/* ---------- Dados calculados de cada artigo (src/blog/artigos/artigos.11tydata.js) ---------- */

function erroArtigo(data, mensagem) {
	return new Error(`\n\nArtigo do blog "${data.page.inputPath.replace(/^\.\//, '')}": ${mensagem}\n(veja docs/BLOG.md)\n`);
}

/**
 * Confere os campos do artigo e devolve tudo o que o layout precisa.
 * Os campos vêm direto do front matter do arquivo: assim o "titulo" do artigo continua sendo o
 * título visível, enquanto o "titulo" da página (o <title>, ver base.njk) recebe a versão curta.
 */
export function prepararArtigo(data) {
	const { dados: fm, corpo } = lerFrontMatter(data.page.inputPath);
	const slug = slugificar(data.page.fileSlug);
	const titulo = String(fm.titulo ?? '').trim();
	const descricao = String(fm.descricao ?? '').trim();
	const categoria = String(fm.categoria ?? '').trim();
	const data_iso = dataIso(fm.data);
	const pessoas = (data.conteudo && data.conteudo.pessoaPorSlug) || {};
	const autor = pessoas[String(fm.autor ?? '').trim()];

	if (!titulo) throw erroArtigo(data, 'falta o campo "titulo".');
	if (!descricao) throw erroArtigo(data, 'falta o campo "descricao".');
	if (descricao.length > LIMITE_DESCRICAO) throw erroArtigo(data, `a "descricao" tem ${descricao.length} caracteres; o limite é ${LIMITE_DESCRICAO}. Encurte o texto.`);
	if (!data_iso) throw erroArtigo(data, 'o campo "data" precisa estar no formato AAAA-MM-DD (exemplo: 2026-11-05).');
	if (!categoria) throw erroArtigo(data, 'falta o campo "categoria" (exemplo: Tráfego pago).');
	if (!autor) throw erroArtigo(data, 'o campo "autor" precisa ser um destes: derek-goncalves, natalia-arruda ou vinicius-mafra (o mesmo nome do perfil em src/content/equipe.yml).');
	if (/\[CONFIRMAR/i.test(titulo + descricao + corpo)) throw erroArtigo(data, 'tem marcador [CONFIRMAR] no texto.');

	const curto = String(fm.titulo_seo || titulo).trim();
	const tituloPagina = tituloDaPagina(curto);
	if (tituloPagina.length > LIMITE_TITULO) {
		throw erroArtigo(data, `o título tem ${curto.length} caracteres e o título que aparece no Google aceita até ${LIMITE_TITULO}. Escreva uma versão curta no campo "titulo_seo".`);
	}

	// Capa: foto própria (campo "imagem" ou arquivo com o nome do artigo) ou a capa gerada.
	const imagens = data.imagens || {};
	let capa = '';
	if (fm.imagem) {
		capa = idImagemBlog(String(fm.imagem));
		if (!imagens[capa]) throw erroArtigo(data, `a imagem "${fm.imagem}" não foi encontrada em ${PASTA_IMAGENS}/ (confira o nome e a extensão do arquivo).`);
	} else if (imagens[idImagemBlog(slug)]) {
		capa = idImagemBlog(slug);
	} else if (imagens[idImagemBlog(`capas/${slug}`)]) {
		capa = idImagemBlog(`capas/${slug}`);
	}
	const capaPropria = Boolean(capa) && !capa.startsWith('blog-capas-');
	const capaUrl = capa ? String(imagens[capa].srcset.webp).split(', ').pop().split(' ')[0] : '';

	return {
		slug,
		url: `/blog/${slug}/`,
		titulo,
		descricao,
		categoria,
		categoriaSlug: slugificar(categoria),
		tema: temaDaCategoria(categoria),
		data: data_iso,
		atualizado: dataIso(fm.atualizado) > data_iso ? dataIso(fm.atualizado) : '',
		autor,
		tituloPagina,
		minutos: tempoLeitura(corpo),
		capa,
		capaPropria,
		// Foto própria: texto alternativo do campo "imagem_alt". Capa gerada: só repete o título (decorativa).
		capaAlt: capaPropria ? String(fm.imagem_alt || '').trim() : '',
		capaUrl,
		og: existsSync(path.join(PASTA_OG, `blog-${slug}.jpg`)) ? `/assets/img/og/blog-${slug}.jpg` : '',
	};
}

/* ---------- Imagens dentro do texto do artigo ---------- */

/**
 * Troca as imagens do texto (![Descrição](foto.jpg)) pela versão responsiva do site.
 * Imagem sozinha num parágrafo vira <figure>; o "título" do Markdown vira a legenda:
 * ![Descrição](foto.jpg "Legenda")
 */
export function imagensDoArtigo(html, imagens) {
	const montar = (src, alt) => {
		if (/^(https?:)?\/\//.test(src) || src.startsWith('/')) {
			return `<img src="${src}" alt="${alt}" loading="lazy" decoding="async">`;
		}
		const id = idImagemBlog(decodeURIComponent(src));
		if (!imagens[id]) {
			throw new Error(`\n\nA imagem "${decodeURIComponent(src)}" usada no texto de um artigo não está em ${PASTA_IMAGENS}/.\n`);
		}
		return imagem(imagens, id, { alt: alt.replace(/&quot;/g, '"').replace(/&amp;/g, '&'), sizes: '(max-width: 760px) 92vw, 720px', classe: 'o-prosa__img' });
	};
	const IMG = '<img src="([^"]+)" alt="([^"]*)"(?: title="([^"]*)")?\\s*/?>';
	return String(html ?? '')
		.replace(new RegExp(`<p>${IMG}</p>`, 'g'), (m, src, alt, legenda) => `<figure class="o-prosa__figura">${montar(src, alt)}${legenda ? `<figcaption>${legenda}</figcaption>` : ''}</figure>`)
		.replace(new RegExp(IMG, 'g'), (m, src, alt) => montar(src, alt));
}

/* ---------- Registro no Eleventy ---------- */

const ehArtigo = (item) => item.inputPath.replace(/\\/g, '/').includes(`${PASTA_ARTIGOS}/`) && item.inputPath.endsWith('.md');

function porData(a, b) {
	return String(b.data.artigo.data).localeCompare(String(a.data.artigo.data)) || a.data.artigo.titulo.localeCompare(b.data.artigo.titulo, 'pt-BR');
}

export function registrarBlog(eleventyConfig) {
	// (o formato "md" está ligado em eleventy.config.js → templateFormats)
	// O modelo para copiar (_modelo.md) não vira página.
	eleventyConfig.ignores.add(`${PASTA_ARTIGOS}/_*.md`);
	eleventyConfig.addWatchTarget(PASTA_ARTIGOS);

	// Links para outros sites abrem em nova aba.
	eleventyConfig.amendLibrary('md', (md) => {
		const padrao = md.renderer.rules.link_open || ((tokens, i, opcoes, env, self) => self.renderToken(tokens, i, opcoes));
		md.renderer.rules.link_open = (tokens, i, opcoes, env, self) => {
			const href = tokens[i].attrGet('href') || '';
			if (/^https?:\/\//.test(href) && !/^https?:\/\/(www\.)?olorin\.com\.br/.test(href)) {
				tokens[i].attrSet('target', '_blank');
				tokens[i].attrSet('rel', 'noopener');
			}
			return padrao(tokens, i, opcoes, env, self);
		};
	});

	// Todos os artigos publicados, do mais novo para o mais antigo.
	eleventyConfig.addCollection('artigos', (api) =>
		api
			.getAll()
			.filter((item) => ehArtigo(item) && item.url && !item.data.rascunho)
			.sort(porData),
	);

	// Artigos separados por categoria (ordem alfabética), cada grupo do mais novo para o mais antigo.
	eleventyConfig.addCollection('blogCategorias', (api) => {
		const grupos = new Map();
		for (const item of api.getAll().filter((i) => ehArtigo(i) && i.url && !i.data.rascunho).sort(porData)) {
			const a = item.data.artigo;
			if (!grupos.has(a.categoriaSlug)) grupos.set(a.categoriaSlug, { nome: a.categoria, slug: a.categoriaSlug, tema: a.tema, artigos: [] });
			grupos.get(a.categoriaSlug).artigos.push(item);
		}
		return [...grupos.values()].sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR'));
	});

	eleventyConfig.addFilter('dataExtenso', dataExtenso);
	eleventyConfig.addFilter('dataCurta', dataCurta);
	eleventyConfig.addFilter('slugificar', slugificar);
	eleventyConfig.addFilter('imagensDoArtigo', imagensDoArtigo);

	// "Leia também": até n artigos, primeiro da mesma categoria, depois os mais novos.
	eleventyConfig.addFilter('leiaTambem', (artigos, url, categoriaSlug, n = 2) => {
		const outros = (artigos || []).filter((i) => i.url !== url);
		const mesma = outros.filter((i) => i.data.artigo.categoriaSlug === categoriaSlug);
		return [...mesma, ...outros.filter((i) => !mesma.includes(i))].slice(0, n);
	});

	eleventyConfig.addFilter('escaparXml', (t) => escapar(t).replace(/'/g, '&apos;'));
}
