// Dados calculados da landing de educação: título, descrição e FAQ para o JSON-LD (mesma fonte do HTML).
export default {
	eleventyComputed: {
		titulo: (data) => data.conteudo.paginas.educacao.seo.titulo,
		descricao: (data) => data.conteudo.paginas.educacao.seo.descricao,
		faqSchema: (data) => data.conteudo.paginas.educacao.faq,
	},
};
