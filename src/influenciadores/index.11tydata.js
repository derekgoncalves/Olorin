// Dados calculados da LP Olorin para influenciadores: título e descrição (mesma fonte do HTML).
//
// Formulário: o macro é o mesmo do site e lê conteudo.formulario. Só nesta página, os textos do
// bloco "formulario" de paginas/influenciadores.yml valem por cima dos de formulario.yml: o Eleventy
// mescla este objeto com o conteúdo global (dataDeepMerge, padrão), e as outras páginas não mudam.
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const { formulario = {} } = yaml.load(readFileSync('src/content/paginas/influenciadores.yml', 'utf8')) || {};

export default {
	conteudo: { formulario },
	eleventyComputed: {
		titulo: (data) => data.conteudo.paginas.influenciadores.seo.titulo,
		descricao: (data) => data.conteudo.paginas.influenciadores.seo.descricao,
	},
};
