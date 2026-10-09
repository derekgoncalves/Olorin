/* Eventos para o dataLayer (PROMPT 13.4) — função única track(). Nunca envia nome, telefone ou e-mail. */
import { CONFIG, raiz } from '../util.js';
import { ultimoToque } from './origem.js';

const PROIBIDAS = /nome|name|whatsapp|telefone|phone|email|e-mail|mensagem/i;
const PARECE_EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PARECE_TELEFONE = /(\d[\s().-]*){10,}/;

export function track(evento, params) {
	const dados = {
		event: evento,
		page_mode: CONFIG.modo || '',
		page_slug: CONFIG.slug || '',
		form_variant: raiz.getAttribute('data-form-variant') || '',
	};
	const toque = ultimoToque();
	['utm_source', 'utm_medium', 'utm_campaign'].forEach((k) => {
		if (toque[k]) dados[k] = toque[k];
	});
	Object.keys(params || {}).forEach((k) => {
		const v = params[k];
		if (PROIBIDAS.test(k)) return;
		if (typeof v === 'string' && (PARECE_EMAIL.test(v) || PARECE_TELEFONE.test(v))) return;
		dados[k] = v;
	});
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push(dados);
}
