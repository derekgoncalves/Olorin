// Dados calculados da LP Olorin Educação: título, descrição e FAQ para o JSON-LD (mesma fonte do HTML)
// e o mês do build, que marca o "Você está aqui" do calendário quando a página abre sem JavaScript
// (com JavaScript, o mês vem do relógio de quem visita).
//
// Formulário: o macro é o mesmo do site e lê conteudo.formulario. Só nesta página, os textos do
// bloco "formulario" de paginas/educacao.yml valem por cima dos de formulario.yml: o Eleventy
// mescla este objeto com o conteúdo global (dataDeepMerge, padrão), e as outras páginas não mudam.
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const { formulario = {} } = yaml.load(readFileSync('src/content/paginas/educacao.yml', 'utf8')) || {};

export default {
	conteudo: { formulario },
	eleventyComputed: {
		titulo: (data) => data.conteudo.paginas.educacao.seo.titulo,
		descricao: (data) => data.conteudo.paginas.educacao.seo.descricao,
		faqSchema: (data) => data.conteudo.paginas.educacao.faq,
		mesBuild: () => new Date().getMonth() + 1,
	},
};
