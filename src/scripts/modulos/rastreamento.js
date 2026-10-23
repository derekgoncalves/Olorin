/* Eventos (PROMPT 13.4): função única track(). Nunca envia nome, telefone, e-mail, empresa ou cargo.
   Cada evento vai para o window.dataLayer (GTM) e, no modo direto, também para o GA4 (ver consentimento.js,
   que registra o encaminhamento com aoRastrear). */
import { CONFIG, raiz } from '../util.js';
import { ultimoToque } from './origem.js';

const PROIBIDAS = /nome|name|whatsapp|telefone|phone|email|e-mail|mensagem|empresa|cargo|perfil/i;
const PARECE_EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PARECE_TELEFONE = /(\d[\s().-]*){10,}/;
let encaminhar = null;

/** Quem mais recebe cada evento (o GA4 direto). Uma função só; chamada depois do push no dataLayer. */
export function aoRastrear(fn) {
	encaminhar = fn;
}

export function track(evento, params) {
	const dados = {
		event: evento,
		page_mode: CONFIG.modo || '',
		page_slug: CONFIG.slug || '',
		segmento: CONFIG.segmento || '',
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
	if (encaminhar) {
		try {
			encaminhar(evento, dados);
		} catch (e) {
			/* a medição nunca quebra a página */
		}
	}
}
