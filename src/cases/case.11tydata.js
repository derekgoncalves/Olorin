// Trilha (BreadcrumbList) das páginas de case.
export default {
	eleventyComputed: {
		migalhas: (data) =>
			data.caso
				? [
						{ nome: 'Home', url: '/' },
						{ nome: 'Cases', url: '/cases/' },
						{ nome: data.caso.cliente || data.caso.segmento, url: `/cases/${data.caso.slug}/` },
					]
				: undefined,
	},
};
