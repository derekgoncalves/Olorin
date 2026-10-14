/**
 * Carrega todo o conteúdo editável de src/content/ (arquivos .yml e .json).
 *
 *   conteudo.home         ← src/content/home.yml (textos e ORDEM das seções da home)
 *   conteudo.servicos     ← src/content/servicos/*.yml (lista ordenada pelo campo "ordem")
 *   conteudo.paginas.sobre ← src/content/paginas/sobre.yml (idem para as demais páginas)
 *   conteudo.faq, conteudo.equipe, conteudo.planos, conteudo.cases, conteudo.portfolio,
 *   conteudo.depoimentos, conteudo.claims
 *
 * Nada fica escondido (dono, 13/10/2026): todo texto vai ao ar. O que ainda falta confirmar
 * fica marcado com um comentário "# PENDENTE: ..." no .yml, logo acima do texto proposto
 * (lista completa: npm run pendencias). Marcador [CONFIRMAR] no meio do texto não é mais
 * usado: o build falha se sobrar algum, para nenhum colchete aparecer para o visitante.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const PASTA = 'src/content';

function ler(arquivo) {
	const texto = readFileSync(arquivo, 'utf8');
	return arquivo.endsWith('.json') ? JSON.parse(texto) : yaml.load(texto);
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
	const conteudo = carregarPasta(PASTA);

	// Serviços: lista ordenada + atalho por slug.
	const servicos = Object.values(conteudo.servicos || {}).sort((a, b) => (a.ordem || 99) - (b.ordem || 99));
	conteudo.servicos = servicos;
	conteudo.servicoPorSlug = Object.fromEntries(servicos.map((s) => [s.slug, s]));

	// Opções do formulário (chips): os 6 serviços + "Ainda não sei".
	conteudo.opcoesServico = servicos
		.filter((s) => s.chip)
		.map((s) => ({ valor: s.chip, slug: s.slug }))
		.concat(conteudo.formulario && conteudo.formulario.servicos_extra ? [{ valor: conteudo.formulario.servicos_extra, slug: 'nao-sei' }] : []);

	// Cases: o bloco de destaque (home e páginas de serviço) só aparece com "destaque_no_site: true"
	// em cases.yml (desligado pelo dono em 14/10/2026). A Olorin Educação mostra os clientes do bloco
	// "edu" de forma genérica (casesEdu). Os que têm "pagina: true" ganham também /cases/<slug>/,
	// e para isso precisam dos campos abaixo.
	const OBRIGATORIOS = ['slug', 'segmento', 'situacao', 'o_que_fizemos', 'resultado', 'periodo', 'servicos'];
	const casesItens = ((conteudo.cases && conteudo.cases.itens) || []).filter(Boolean);
	conteudo.casesTodos = conteudo.cases && conteudo.cases.destaque_no_site ? casesItens : [];
	conteudo.casesEdu = casesItens.filter((c) => c.edu);
	conteudo.casesAprovados = conteudo.casesTodos.filter((c) => c.pagina);
	for (const c of conteudo.casesAprovados) {
		const faltando = OBRIGATORIOS.filter((campo) => !c[campo] || (Array.isArray(c[campo]) && !c[campo].length));
		if (faltando.length) {
			throw new Error(`Case "${c.slug || c.segmento}" está com pagina: true, mas faltam os campos: ${faltando.join(', ')} (src/content/cases.yml).`);
		}
	}

	// Portfólio: todos os trabalhos vão ao ar (só trabalhos reais, com o nome do cliente).
	conteudo.portfolioPublicado = ((conteudo.portfolio && conteudo.portfolio.itens) || []).filter(Boolean);

	// Equipe: atalho por slug.
	conteudo.pessoaPorSlug = Object.fromEntries(((conteudo.equipe && conteudo.equipe.pessoas) || []).map((p) => [p.slug, p]));
	// Frentes de cada pessoa: vêm do quem_faz de cada serviço (fonte única), em src/content/servicos/*.yml.
	((conteudo.equipe && conteudo.equipe.pessoas) || []).forEach((p) => {
		p.servicos = servicos.filter((s) => (s.quem_faz || []).includes(p.slug)).map((s) => s.slug);
	});

	// FAQ geral: atalho por id.
	conteudo.faqPorId = Object.fromEntries(((conteudo.faq && conteudo.faq.perguntas) || []).map((p) => [p.id, p]));

	return conteudo;
}
