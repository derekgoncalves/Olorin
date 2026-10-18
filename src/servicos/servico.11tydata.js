// Dados calculados das páginas de serviço: trilha (BreadcrumbList) e Service no JSON-LD.
// Sem FAQPage desde 17/10/2026: as dúvidas saíram das páginas de serviço (ficam só na página Sobre).
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
	},
};
