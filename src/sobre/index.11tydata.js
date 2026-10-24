// FAQ da página /sobre/ para o JSON-LD: todas as perguntas de src/content/faq.yml (são as que aparecem na página).
export default {
	eleventyComputed: {
		faqSchema: (data) => data.conteudo.faq.perguntas,
	},
};
