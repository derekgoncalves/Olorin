// Dados calculados da home: título, descrição e FAQ para o JSON-LD (mesma fonte do HTML).
export default {
	eleventyComputed: {
		titulo: (data) => data.conteudo.home.seo.titulo,
		descricao: (data) => data.conteudo.home.seo.descricao,
		faqSchema: (data) => data.conteudo.faq.perguntas,
	},
};
