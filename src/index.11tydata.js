// Dados calculados da home: título, descrição e FAQ para o JSON-LD (só quando o bloco de dúvidas
// está na lista "secoes" de home.yml, e só com as perguntas que aparecem na página).
export default {
	eleventyComputed: {
		titulo: (data) => data.conteudo.home.seo.titulo,
		descricao: (data) => data.conteudo.home.seo.descricao,
		faqSchema: (data) => {
			const home = data.conteudo.home;
			if (!(home.secoes || []).includes('duvidas')) return undefined;
			const ids = (home.duvidas && home.duvidas.ids) || [];
			const todas = data.conteudo.faq.perguntas || [];
			return ids.length ? ids.map((id) => todas.find((p) => p && p.id === id)).filter(Boolean) : todas;
		},
	},
};
