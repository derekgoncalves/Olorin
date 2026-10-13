/**
 * Carrega todo o conteúdo editável de src/content/ (arquivos .yml e .json).
 *
 *   conteudo.home         ← src/content/home.yml (textos e ORDEM das seções da home)
 *   conteudo.servicos     ← src/content/servicos/*.yml (lista ordenada pelo campo "ordem")
 *   conteudo.paginas.sobre ← src/content/paginas/sobre.yml (idem para as demais páginas)
 *   conteudo.faq, conteudo.equipe, conteudo.planos, conteudo.cases, conteudo.portfolio,
 *   conteudo.depoimentos, conteudo.claims
 *
 * Regra do [CONFIRMAR: ...]: no site publicado (npm run build), qualquer item de lista que
 * contenha um marcador é retirado, e qualquer texto solto com marcador fica vazio — assim
 * nada sem confirmação vai ao ar. No modo de desenvolvimento os marcadores aparecem destacados.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const PASTA = 'src/content';
const PROD = process.env.ELEVENTY_ENV === 'production';
const MARCADOR = /\[CONFIRMAR/i;

function ler(arquivo) {
	const texto = readFileSync(arquivo, 'utf8');
	return arquivo.endsWith('.json') ? JSON.parse(texto) : yaml.load(texto);
}

function temMarcador(valor) {
	if (typeof valor === 'string') return MARCADOR.test(valor);
	if (Array.isArray(valor)) return valor.some(temMarcador);
	if (valor && typeof valor === 'object') return Object.values(valor).some(temMarcador);
	return false;
}

/** Remove o que tem [CONFIRMAR] (só em produção). */
function limpar(valor) {
	if (typeof valor === 'string') return MARCADOR.test(valor) ? null : valor;
	if (Array.isArray(valor)) return valor.filter((item) => !temMarcador(item)).map(limpar);
	if (valor && typeof valor === 'object') {
		const saida = {};
		for (const [chave, v] of Object.entries(valor)) {
			saida[chave] = limpar(v);
		}
		return saida;
	}
	return valor;
}

function carregarPasta(pasta) {
	const saida = {};
	for (const nome of readdirSync(pasta).sort()) {
		const caminho = path.join(pasta, nome);
		if (statSync(caminho).isDirectory()) {
			saida[nome] = carregarPasta(caminho);
		} else if (/\.(ya?ml|json)$/.test(nome)) {
			saida[nome.replace(/\.(ya?ml|json)$/, '')] = ler(caminho);
		}
	}
	return saida;
}

export default function () {
	let conteudo = carregarPasta(PASTA);
	if (PROD) {
		conteudo = limpar(conteudo);
	}

	// Serviços: lista ordenada + atalho por slug.
	const servicos = Object.values(conteudo.servicos || {}).sort((a, b) => (a.ordem || 99) - (b.ordem || 99));
	conteudo.servicos = servicos;
	conteudo.servicoPorSlug = Object.fromEntries(servicos.map((s) => [s.slug, s]));

	// Opções do formulário (chips): os 6 serviços + "Ainda não sei".
	conteudo.opcoesServico = servicos
		.filter((s) => s.chip)
		.map((s) => ({ valor: s.chip, slug: s.slug }))
		.concat(conteudo.formulario && conteudo.formulario.servicos_extra ? [{ valor: conteudo.formulario.servicos_extra, slug: 'nao-sei' }] : []);

	// Cases aprovados: geram /cases/ e /cases/<slug>/ (PROMPT 12.2). Sem nenhum aprovado, as páginas não existem.
	const OBRIGATORIOS = ['slug', 'segmento', 'situacao', 'o_que_fizemos', 'resultado', 'periodo', 'servicos'];
	conteudo.casesAprovados = ((conteudo.cases && conteudo.cases.itens) || []).filter((c) => c && c.aprovado);
	for (const c of conteudo.casesAprovados) {
		const faltando = OBRIGATORIOS.filter((campo) => !c[campo] || (Array.isArray(c[campo]) && !c[campo].length));
		if (faltando.length) {
			throw new Error(`Case "${c.slug || c.segmento}" está com aprovado: true, mas faltam os campos: ${faltando.join(', ')} (src/content/cases.yml).`);
		}
	}

	// Portfólio: só trabalhos reais publicados (gera /portfolio/ e o item do menu quando houver).
	conteudo.portfolioPublicado = ((conteudo.portfolio && conteudo.portfolio.itens) || []).filter((i) => i && i.publicado);

	// Equipe: atalho por slug.
	conteudo.pessoaPorSlug = Object.fromEntries(((conteudo.equipe && conteudo.equipe.pessoas) || []).map((p) => [p.slug, p]));

	// FAQ geral: atalho por id.
	conteudo.faqPorId = Object.fromEntries(((conteudo.faq && conteudo.faq.perguntas) || []).map((p) => [p.id, p]));

	return conteudo;
}
