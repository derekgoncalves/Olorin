/**
 * Eleventy — gera o site estático da Olorin em dist/ (vai inteiro para o public_html da Locaweb).
 *
 *   npm run dev     → servidor local com recarga, guia /_estilo/ e marcadores [CONFIRMAR] visíveis
 *   npm run build   → dist/ de produção (CSS crítico inline, nomes com hash, verificações)
 *
 * Conteúdo editável: src/content/*.yml (textos e ordem dos blocos da home).
 * Artigos do blog: src/blog/artigos/*.md (um arquivo por artigo; guia em docs/BLOG.md).
 */
import { rm } from 'node:fs/promises';
import yaml from 'js-yaml';
import { construirAssets } from './scripts/assets.mjs';
import { processarImagens } from './scripts/imagens.mjs';
import { posProcessar } from './scripts/pos-processar.mjs';
import { registrarFiltros } from './scripts/filtros.mjs';
import { montarSchema } from './scripts/schema.mjs';
import { registrarBlog } from './scripts/blog.mjs';

const PROD = process.env.ELEVENTY_ENV === 'production';
// Pasta de saída (padrão dist/). OLORIN_SAIDA permite gerar um build de teste em outra pasta.
const SAIDA = process.env.OLORIN_SAIDA || 'dist';

export default async function (eleventyConfig) {
	let limpo = false;

	eleventyConfig.addDataExtension('yml,yaml', (conteudo) => yaml.load(conteudo));
	eleventyConfig.addGlobalData('ambiente', { prod: PROD, dev: !PROD });

	// CSS e JS com hash no nome + imagens responsivas: recalculados a cada build.
	eleventyConfig.addGlobalData('assets', async () => construirAssets({ prod: PROD, saida: SAIDA }));
	eleventyConfig.addGlobalData('imagens', async () => processarImagens({ saida: SAIDA }));

	eleventyConfig.on('eleventy.before', async () => {
		if (PROD && !limpo) {
			await rm(SAIDA, { recursive: true, force: true });
			limpo = true;
		}
	});
	eleventyConfig.on('eleventy.after', async ({ results }) => {
		if (PROD) {
			await posProcessar({ saida: SAIDA, resultados: results });
		}
	});

	// Guia de estilo /_estilo/: só no modo de desenvolvimento.
	if (PROD) eleventyConfig.ignores.add('src/_estilo/**');

	eleventyConfig.addWatchTarget('src/styles/');
	eleventyConfig.addWatchTarget('src/scripts/');
	eleventyConfig.addWatchTarget('src/content/');
	eleventyConfig.addWatchTarget('src/assets/');

	// Arquivos copiados como estão.
	eleventyConfig.addPassthroughCopy({ 'src/assets/fonts': 'assets/fonts' }, { filter: ['**/*', '!**/.gitkeep'] });
	eleventyConfig.addPassthroughCopy({ 'src/assets/brand': 'assets/img/brand' });
	eleventyConfig.addPassthroughCopy({ 'src/assets/og': 'assets/img/og' });
	eleventyConfig.addPassthroughCopy({ 'src/assets/clientes': 'assets/img/clientes' }, { filter: ['**/*', '!**/.gitkeep'] });
	eleventyConfig.addPassthroughCopy({ 'src/php/config.example.php': 'config.example.php' });
	eleventyConfig.addPassthroughCopy({ 'src/servidor/.htaccess': '.htaccess' });
	eleventyConfig.addPassthroughCopy({ 'src/servidor/leads.htaccess': 'leads/.htaccess' });
	eleventyConfig.addPassthroughCopy({ 'src/servidor/favicon.ico': 'favicon.ico' });

	registrarFiltros(eleventyConfig, { prod: PROD });
	// Blog: artigos em Markdown (src/blog/artigos/), coleções, datas e imagens do texto. Ver docs/BLOG.md.
	registrarBlog(eleventyConfig);
	eleventyConfig.addNunjucksGlobal('montarSchema', montarSchema);

	eleventyConfig.setServerOptions({ port: 8081, showAllHosts: false });
	eleventyConfig.setQuietMode(true);

	return {
		dir: { input: 'src', output: SAIDA, includes: '_includes', data: '_data' },
		templateFormats: ['njk', '11ty.js', 'md'],
		htmlTemplateEngine: 'njk',
		markdownTemplateEngine: false,
	};
}
