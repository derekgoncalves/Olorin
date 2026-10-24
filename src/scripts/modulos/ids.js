/* IDs de medição e link de agendamento editáveis com o site no ar (public_html/olorin-ids.js).
   O olorin-ids.js carrega com defer ANTES deste pacote, então window.OLORIN_IDS já existe aqui.
   Cada campo preenchido e válido substitui o valor que veio do build em window.OLORIN_CONFIG;
   campo vazio mantém o do build. Valor com formato errado é ignorado (aviso no console). */
import { CONFIG } from '../util.js';

const CAMPOS = [
	['GTM_ID', 'gtm', /^GTM-[A-Z0-9]{4,12}$/i, 'GTM-XXXXXXX'],
	['GA4_ID', 'ga4', /^G-[A-Z0-9]{4,15}$/i, 'G-XXXXXXXXXX'],
	['META_PIXEL_ID', 'pixel', /^\d{6,20}$/, '123456789012345'],
	['GADS_CONVERSION_ID', 'adsId', /^(AW-)?\d{6,15}$/i, 'AW-123456789'],
	['GADS_CONVERSION_LABEL', 'adsLabel', /^[\w-]{4,64}$/, 'AbCdEfGhIjKlMnOp'],
	['SCHEDULING_URL', 'agendamento', /^https:\/\/[^\s"'<>]+$/, 'https://calendly.com/...'],
];

/* Sim ou não. true/false sem aspas é o esperado; "sim"/"não" e "true"/"false" entre aspas também valem. */
const SIM_NAO = [['GA4_E_PIXEL_PELO_GTM', 'ga4PeloGtm']];
function simNao(valor) {
	if (typeof valor === 'boolean') return valor;
	const t = String(valor).trim().toLowerCase();
	if (t === 'true' || t === 'sim') return true;
	if (t === 'false' || t === 'não' || t === 'nao') return false;
	return null;
}

export function aplicarIds() {
	const ids = window.OLORIN_IDS;
	if (ids && typeof ids === 'object') {
		CAMPOS.forEach(([nome, chave, formato, exemplo]) => {
			const valor = ids[nome] == null ? '' : String(ids[nome]).trim();
			if (!valor) return;
			if (formato.test(valor)) {
				CONFIG[chave] = chave === 'gtm' || chave === 'ga4' ? valor.toUpperCase() : valor;
			} else if (window.console) {
				window.console.warn('[olorin-ids] ' + nome + ' ignorado: formato esperado ' + exemplo);
			}
		});
		SIM_NAO.forEach(([nome, chave]) => {
			if (ids[nome] == null || ids[nome] === '') return;
			const valor = simNao(ids[nome]);
			if (valor === null) {
				if (window.console) window.console.warn('[olorin-ids] ' + nome + ' ignorado: use true ou false');
			} else {
				CONFIG[chave] = valor;
			}
		});
	}
	CONFIG.ga4PeloGtm = CONFIG.ga4PeloGtm === true;
	// Google Ads: aceita com ou sem "AW-". adsId fica "AW-123", adsNumero fica "123" (para o GTM).
	const numero = String(CONFIG.adsId || '').replace(/^AW-/i, '');
	CONFIG.adsId = numero ? 'AW-' + numero : '';
	CONFIG.adsNumero = numero;
	if (!window.OLORIN_CONFIG) window.OLORIN_CONFIG = CONFIG;
}
