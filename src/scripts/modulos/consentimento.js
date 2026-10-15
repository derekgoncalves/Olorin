/* Aviso de cookies próprio + Consent Mode v2 (PROMPT 13.2).
   Padrão "negado". O GTM (ou GA4/Pixel/Google Ads direto) só carrega depois de uma escolha que
   permita Análise e/ou Marketing, e só quando o navegador estiver livre, para não pesar no LCP.
   Os IDs podem vir do build ou do public_html/olorin-ids.js (ver ids.js), por isso o HTML do
   aviso existe em todas as páginas, escondido, e só aparece quando há algum ID. */
import { $, $$, CONFIG, quandoLivre, lerArmazenamento, gravarArmazenamento } from '../util.js';
import { track } from './rastreamento.js';

const CHAVE = 'olorin_consentimento';
const carregado = {};
const fila = [];
let pronto = false;
let atual = {};

function gtag() {
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push(arguments);
}

function temRastreamento() {
	return !!(CONFIG.gtm || CONFIG.ga4 || CONFIG.pixel || CONFIG.adsId);
}

function script(src) {
	const s = document.createElement('script');
	s.async = true;
	s.src = src;
	document.head.appendChild(s);
}

/* Google (GA4 e/ou Google Ads) direto, sem GTM: um gtag.js só, um "config" por ID liberado. */
function google(id) {
	if (!id || carregado[id]) return;
	if (!carregado.gtag) {
		carregado.gtag = true;
		gtag('js', new Date());
		script('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id));
	}
	carregado[id] = true;
	gtag('config', id);
}

function carregarFerramentas(escolha) {
	if (!(escolha.analise || escolha.marketing)) return;
	if (CONFIG.gtm) {
		if (carregado.gtm) return;
		carregado.gtm = true;
		window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
		script('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(CONFIG.gtm));
		return;
	}
	if (escolha.analise) google(CONFIG.ga4);
	if (escolha.marketing) google(CONFIG.adsId);
	if (CONFIG.pixel && escolha.marketing && !carregado.pixel) {
		carregado.pixel = true;
		/* eslint-disable */
		!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
		/* eslint-enable */
		window.fbq('init', CONFIG.pixel);
		window.fbq('track', 'PageView');
	}
	pronto = true;
	while (fila.length) enviar(fila.shift());
}

/* Conversões no modo direto (sem GTM). Com GTM, quem decide é o contêiner (eventos do dataLayer). */
function enviar(item) {
	const tipo = item[0];
	const params = item[1] || {};
	const ga4 = carregado[CONFIG.ga4] && atual.analise;
	const ads = carregado[CONFIG.adsId] && atual.marketing && CONFIG.adsLabel;
	const pixel = carregado.pixel && atual.marketing;
	if (tipo === 'lead') {
		if (ga4) gtag('event', 'generate_lead', Object.assign({ send_to: CONFIG.ga4 }, params));
		if (ads) gtag('event', 'conversion', { send_to: CONFIG.adsId + '/' + CONFIG.adsLabel });
		if (pixel) window.fbq('track', 'Lead');
	} else if (tipo === 'whatsapp') {
		if (ga4) gtag('event', 'whatsapp_click', Object.assign({ send_to: CONFIG.ga4 }, params));
		if (pixel) window.fbq('track', 'Contact');
	}
}

/** Registra uma conversão (lead ou whatsapp). Só sai do navegador se o consentimento permitir. */
export function converter(tipo, params) {
	if (CONFIG.gtm || !temRastreamento()) return;
	if (pronto) enviar([tipo, params]);
	else fila.push([tipo, params]);
}

function aplicar(escolha, registrar) {
	const a = escolha.analise ? 'granted' : 'denied';
	const m = escolha.marketing ? 'granted' : 'denied';
	atual = escolha;
	gtag('consent', 'update', { analytics_storage: a, ad_storage: m, ad_user_data: m, ad_personalization: m });
	if (carregado.pixel) window.fbq('consent', escolha.marketing ? 'grant' : 'revoke');
	if (registrar) {
		track('consent_update', { analytics: !!escolha.analise, marketing: !!escolha.marketing });
	}
	// Carrega quando o navegador estiver livre.
	quandoLivre(() => carregarFerramentas(escolha));
}

/** Escolha atual do visitante (ou null). */
export function consentimento() {
	return lerArmazenamento('localStorage', CHAVE);
}

export function iniciarConsentimento() {
	if (!temRastreamento()) return;
	gtag('consent', 'default', {
		ad_storage: 'denied',
		ad_user_data: 'denied',
		ad_personalization: 'denied',
		analytics_storage: 'denied',
		wait_for_update: 500,
	});

	// "Preferências de cookies" (rodapé e política) só aparece quando há o que escolher.
	$$('[data-o-cookies-link]').forEach((el) => {
		el.hidden = false;
	});

	const aviso = $('[data-o-cookies]');
	const salvo = consentimento();
	if (salvo) aplicar(salvo, false);
	if (!aviso) return;

	const opcoes = $('[data-o-cookies-opcoes]', aviso);
	const acoes = $('[data-o-cookies-acoes]', aviso);
	const analise = $('[data-o-cookies-analise]', aviso);
	const marketing = $('[data-o-cookies-marketing]', aviso);

	function decidir(escolha) {
		const registro = { analise: !!escolha.analise, marketing: !!escolha.marketing, data: new Date().toISOString() };
		gravarArmazenamento('localStorage', CHAVE, registro);
		aviso.hidden = true;
		aplicar(registro, true);
	}
	function abrir() {
		const guardada = consentimento() || {};
		if (analise) analise.checked = !!guardada.analise;
		if (marketing) marketing.checked = !!guardada.marketing;
		opcoes.hidden = true;
		acoes.hidden = false;
		aviso.hidden = false;
		const primeiro = $('button', acoes);
		if (primeiro) primeiro.focus();
	}

	$('[data-o-cookies-aceitar]', aviso).addEventListener('click', () => decidir({ analise: true, marketing: true }));
	$('[data-o-cookies-recusar]', aviso).addEventListener('click', () => decidir({ analise: false, marketing: false }));
	$('[data-o-cookies-personalizar]', aviso).addEventListener('click', () => {
		opcoes.hidden = false;
		acoes.hidden = true;
		if (analise) analise.focus();
	});
	$('[data-o-cookies-salvar]', aviso).addEventListener('click', () =>
		decidir({ analise: analise && analise.checked, marketing: marketing && marketing.checked }),
	);
	aviso.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && consentimento()) aviso.hidden = true;
	});
	$$('[data-o-cookies-abrir]').forEach((b) => b.addEventListener('click', abrir));

	if (!salvo) {
		aviso.hidden = false;
	}
}
