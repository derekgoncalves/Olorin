// Vale para todos os artigos desta pasta (um arquivo .md por artigo). Como escrever: docs/BLOG.md.
// O endereço sai do nome do arquivo: do-clique-a-matricula.md → /blog/do-clique-a-matricula/
import { ehRascunho, prepararArtigo, slugificar } from '../../../scripts/blog.mjs';

export default {
	layout: 'layouts/artigo.njk',
	modo: 'hub',
	pagina_dados: 'blog',
	eleventyComputed: {
		// "rascunho: true" no artigo: a página não é gerada (o arquivo já fica de fora em scripts/blog.mjs).
		permalink: (d) => (ehRascunho(d) ? false : `/blog/${slugificar(d.page.fileSlug)}/`),
		artigo: (d) => prepararArtigo(d),
		// (o Eleventy roda cada função uma vez "de teste" com valores vazios: daí os "?.")
		titulo: (d) => d.artigo?.tituloPagina,
		og_titulo: (d) => d.artigo?.titulo,
		og_imagem: (d) => d.artigo?.og || '/assets/img/og/blog.jpg',
		slug: (d) => `blog-${d.artigo?.slug}`,
		atualizado: (d) => d.artigo?.atualizado || d.artigo?.data,
		migalhas: (d) => [
			{ nome: 'Home', url: '/' },
			{ nome: 'Blog', url: '/blog/' },
			{ nome: d.artigo?.titulo, url: d.artigo?.url },
		],
		pessoasSchema: (d) => d.artigo?.autor?.slug,
		artigoSchema: (d) => d.artigo,
	},
};
