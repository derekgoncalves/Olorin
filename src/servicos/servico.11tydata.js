// Dados calculados das páginas de serviço: trilha (BreadcrumbList), Service e FAQPage no JSON-LD.
export default {
	eleventyComputed: {
		migalhas: (data) =>
			data.servico
				? [
						{ nome: 'Home', url: '/' },
						{ nome: 'Serviços', url: '/servicos/' },
						{ nome: data.servico.nome, url: `/servicos/${data.servico.slug}/` },
					]
				: undefined,
		servicoSchema: (data) => data.servico,
		faqSchema: (data) => (data.servico ? data.servico.faq : undefined),
	},
};
