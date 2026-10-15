// Dados calculados da home: título, descrição e FAQ para o JSON-LD (só as perguntas que aparecem na página).
export default {
	eleventyComputed: {
		titulo: (data) => data.conteudo.home.seo.titulo,
		descricao: (data) => data.conteudo.home.seo.descricao,
		faqSchema: (data) => {
			const ids = (data.conteudo.home.duvidas && data.conteudo.home.duvidas.ids) || [];
			const todas = data.conteudo.faq.perguntas || [];
			return ids.length ? ids.map((id) => todas.find((p) => p && p.id === id)).filter(Boolean) : todas;
		},
	},
};
