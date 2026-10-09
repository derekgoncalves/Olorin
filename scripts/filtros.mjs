/**
 * Filtros e funções disponíveis nos templates Nunjucks.
 */
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync('src/_data/site/config.json', 'utf8'));

const MENSAGENS = {
	padrao: 'Oi! Vim pelo site da Olorin e quero um orçamento.',
	diagnostico: 'Oi! Vim pelo site da Olorin e quero o diagnóstico gratuito.',
	servico: 'Oi! Vim pelo site da Olorin e quero falar sobre {x}.',
	plano: 'Oi! Vim pelo site da Olorin e quero saber mais sobre o plano {x}.',
	duvida: 'Oi! Tenho uma dúvida sobre os serviços da Olorin.',
	equipe: 'Oi! Vim pelo site da Olorin e quero falar com a equipe.',
	obrigado: 'Oi! Acabei de pedir um orçamento pelo site da Olorin e quero adiantar a conversa.',
	erro: 'Oi! Cheguei numa página que não existe no site da Olorin. Podem me ajudar?',
};

/** Escapa texto para HTML. */
export function escapar(texto) {
	return String(texto ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/**
 * Link de WhatsApp com mensagem pertinente e a origem no fim: " [ref: hero]".
 * waLink("servico-trafego-pago-hero", { tipo: "servico", x: "Tráfego pago" })
 */
export function waLink(origem, contexto = {}) {
	const tipo = contexto.tipo || 'padrao';
	let mensagem = contexto.mensagem || (MENSAGENS[tipo] || MENSAGENS.padrao).replace('{x}', contexto.x || '');
	mensagem += ` [ref: ${origem}]`;
	return `https://wa.me/${config.WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
}

/** Formatação simples em linha: **negrito**, [texto](url). Escapa o resto. */
export function emLinha(texto) {
	let html = escapar(texto);
	html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
	html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, rotulo, url) => {
		if (/^\[CONFIRMAR/i.test(m)) return m;
		const externo = /^https?:/.test(url) && !url.includes('olorin.com.br');
		return `<a href="${url}"${externo ? ' target="_blank" rel="noopener"' : ''}>${rotulo}</a>`;
	});
	return html;
}

/** <picture> responsivo a partir do manifesto de imagens. */
export function imagem(imagens, id, opcoes = {}) {
	const img = imagens && imagens[id];
	if (!img) {
		throw new Error(`Imagem "${id}" não está no manifesto (src/assets/manifest.json).`);
	}
	const alt = opcoes.alt !== undefined ? opcoes.alt : img.alt;
	const sizes = opcoes.sizes || '100vw';
	const prioridade = opcoes.prioridade === true;
	const atributos = [
		`src="${img.src}"`,
		`alt="${escapar(alt)}"`,
		`width="${opcoes.largura || img.largura}"`,
		`height="${opcoes.altura || img.altura}"`,
		prioridade ? 'fetchpriority="high"' : 'loading="lazy"',
		prioridade ? '' : 'decoding="async"',
		opcoes.classe ? `class="${opcoes.classe}"` : '',
	].filter(Boolean);
	const fontes = Object.entries(img.srcset)
		.filter(([formato]) => formato !== 'jpg')
		.map(([formato, srcset]) => `<source type="image/${formato}" srcset="${srcset}" sizes="${sizes}">`)
		.join('');
	return `<picture${opcoes.classePicture ? ` class="${opcoes.classePicture}"` : ''}>${fontes}<img ${atributos.join(' ')}></picture>`;
}

/** JSON seguro dentro de <script type="application/ld+json">. */
export function jsonSeguro(objeto) {
	return JSON.stringify(objeto)
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e')
		.replace(/&/g, '\\u0026');
}

/** Texto puro (sem marcação em linha) — para JSON-LD e metas. */
export function textoPuro(texto) {
	return String(texto ?? '')
		.replace(/\*\*(.+?)\*\*/g, '$1')
		.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Texto dentro de aspas simples do PHP: escapa \\ e '. */
export function phpString(texto) {
	return String(texto ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/** Listas aceitas pelo enviar.php, tiradas do mesmo conteúdo que gera o formulário. */
export function listasParaPhp(content) {
	return JSON.stringify({
		servicos: (content.opcoesServico || []).map((o) => o.valor),
		investimento: (content.formulario && content.formulario.investimento) || [],
		planos: [''].concat(((content.planos && content.planos.planos) || []).map((p) => p.id)),
		slugs: [''].concat((content.servicos || []).map((s) => s.slug)),
	});
}

export function registrarFiltros(eleventyConfig, { prod }) {
	eleventyConfig.addFilter('waLink', waLink);
	eleventyConfig.addFilter('emLinha', (t) => emLinha(t));
	eleventyConfig.addFilter('textoPuro', textoPuro);
	eleventyConfig.addFilter('jsonSeguro', jsonSeguro);
	eleventyConfig.addFilter('escapar', escapar);
	eleventyConfig.addFilter('urlAbsoluta', (caminho) => new URL(caminho || '/', config.URL).href);
	eleventyConfig.addFilter('dataBR', (iso) => {
		const [a, m, d] = String(iso).slice(0, 10).split('-');
		return `${d}/${m}/${a}`;
	});
	eleventyConfig.addFilter('dataIso', (d) => (d instanceof Date ? d.toISOString() : String(d ?? '')).slice(0, 10));
	eleventyConfig.addFilter('reais', (n) => `R$ ${Number(n).toLocaleString('pt-BR')}`);
	eleventyConfig.addFilter('encontrar', (lista, campo, valor) => (lista || []).find((i) => i && i[campo] === valor));
	eleventyConfig.addFilter('filtrarPor', (lista, campo, valor) => (lista || []).filter((i) => i && [].concat(i[campo] || []).includes(valor)));
	eleventyConfig.addFilter('phpString', phpString);
	eleventyConfig.addFilter('semVazios', (lista) => (lista || []).filter(Boolean));

	// Marcadores [CONFIRMAR: ...]: destacados no modo de desenvolvimento.
	// Em produção o carregador de conteúdo já removeu tudo o que tinha marcador.
	eleventyConfig.addFilter('confirmar', (html) =>
		prod ? html : String(html ?? '').replace(/\[CONFIRMAR:?([^\]]*)\]/g, '<mark class="o-confirmar" title="Falta confirmar">[CONFIRMAR:$1]</mark>'),
	);

	eleventyConfig.addNunjucksGlobal('imagem', imagem);
	eleventyConfig.addNunjucksGlobal('waLink', waLink);
	eleventyConfig.addNunjucksGlobal('listasParaPhp', listasParaPhp);
}
