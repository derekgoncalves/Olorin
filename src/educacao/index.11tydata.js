// Dados calculados da LP Olorin Educação: título, descrição e FAQ para o JSON-LD (mesma fonte do HTML)
// e o mês do build, que marca o "Você está aqui" do calendário quando a página abre sem JavaScript
// (com JavaScript, o mês vem do relógio de quem visita).
export default {
	eleventyComputed: {
		titulo: (data) => data.conteudo.paginas.educacao.seo.titulo,
		descricao: (data) => data.conteudo.paginas.educacao.seo.descricao,
		faqSchema: (data) => data.conteudo.paginas.educacao.faq,
		mesBuild: () => new Date().getMonth() + 1,
	},
};
