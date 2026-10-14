/* Utilitários comuns: seletores, preferências do visitante e execução quando o navegador estiver livre. */
export const doc = document;
export const raiz = doc.documentElement;
export const CONFIG = window.OLORIN_CONFIG || {};

export const $ = (sel, ctx) => (ctx || doc).querySelector(sel);
export const $$ = (sel, ctx) => Array.prototype.slice.call((ctx || doc).querySelectorAll(sel));

const mm = (q) => (window.matchMedia ? window.matchMedia(q).matches : false);
export const movimentoReduzido = mm('(prefers-reduced-motion: reduce)');
export const ponteiroFino = mm('(hover: hover) and (pointer: fine)');
export const temIO = 'IntersectionObserver' in window;

/**
 * Lista os elementos que começam abaixo da dobra sem obrigar o navegador a desenhar as seções
 * que ele ainda deixou de lado (content-visibility, ver base.css): mede primeiro a seção do
 * <main> e só mede o elemento quando a seção já começa dentro da tela.
 */
export function abaixoDaDobra(elementos) {
	const altura = window.innerHeight;
	const topos = new Map();
	return elementos.filter((el) => {
		const secao = el.closest('.o-main > *');
		if (secao && secao !== el) {
			if (!topos.has(secao)) topos.set(secao, secao.getBoundingClientRect().top);
			if (topos.get(secao) > altura) return true;
		}
		return el.getBoundingClientRect().top > altura;
	});
}

/** Executa quando o navegador estiver ocioso (não atrapalha a primeira pintura nem as interações). */
export function quandoLivre(fn) {
	if ('requestIdleCallback' in window) {
		window.requestIdleCallback(fn, { timeout: 2000 });
	} else {
		window.setTimeout(fn, 300);
	}
}

export function lerArmazenamento(tipo, chave) {
	try {
		const v = window[tipo].getItem(chave);
		return v ? JSON.parse(v) : null;
	} catch (e) {
		return null;
	}
}
export function gravarArmazenamento(tipo, chave, valor) {
	try {
		if (valor === null) {
			window[tipo].removeItem(chave);
		} else {
			window[tipo].setItem(chave, JSON.stringify(valor));
		}
	} catch (e) {
		/* modo privado ou armazenamento bloqueado: segue sem guardar */
	}
}

/** Origem de um link de WhatsApp: o que vem depois de "[ref: " na mensagem. */
export function origemWhatsApp(href) {
	try {
		const texto = new URL(href).searchParams.get('text') || '';
		const m = /\[ref: ([^\]]+)\]/.exec(texto);
		return m ? m[1] : 'sem-ref';
	} catch (e) {
		return 'sem-ref';
	}
}

/** Link de WhatsApp com mensagem livre (usado no erro do formulário). */
export function linkWhatsApp(mensagem, origem) {
	const numero = String(CONFIG.whatsapp || '').replace(/\D/g, '');
	return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(mensagem + ' [ref: ' + origem + ']');
}
