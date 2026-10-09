/* Origem da visita (PROMPT 7 e 10.2): utm_*, gclid, gbraid, wbraid e fbclid, com primeiro e último toque,
   guardados na sessão para valer em qualquer página até o envio do formulário. */
import { doc, lerArmazenamento, gravarArmazenamento } from '../util.js';

export const CHAVES = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid'];
const CHAVE = 'olorin_origem';
let cache = null;

export function origem() {
	if (cache) return cache;
	const salvo = lerArmazenamento('sessionStorage', CHAVE) || {};
	const params = new URLSearchParams(window.location.search);
	const novo = {};
	CHAVES.forEach((k) => {
		const v = params.get(k);
		if (v) novo[k] = v.slice(0, 255);
	});
	if (Object.keys(novo).length) {
		salvo.ultimo = novo;
		if (!salvo.primeiro) salvo.primeiro = novo;
	}
	if (!salvo.entrada) salvo.entrada = window.location.pathname;
	if (!salvo.referencia && doc.referrer && doc.referrer.indexOf(window.location.host) === -1) {
		salvo.referencia = doc.referrer.slice(0, 300);
	}
	gravarArmazenamento('sessionStorage', CHAVE, salvo);
	cache = salvo;
	return salvo;
}

/** Último toque (o que vale para utm_* do formulário e dos eventos). */
export function ultimoToque() {
	return origem().ultimo || {};
}

/** Primeiro toque em uma linha só: "utm_source=google&utm_medium=cpc ... | entrada=/servicos/..." */
export function primeiroToqueTexto() {
	const o = origem();
	const p = o.primeiro ? new URLSearchParams(o.primeiro).toString() : '';
	return (p + (o.entrada ? (p ? ' | ' : '') + 'entrada=' + o.entrada : '')).slice(0, 500);
}
