// FAQ da página de planos para o JSON-LD: todas as perguntas (são as que aparecem na página).
export default {
	eleventyComputed: {
		faqSchema: (data) => data.conteudo.faq.perguntas,
	},
};
