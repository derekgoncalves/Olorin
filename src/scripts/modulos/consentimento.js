/* Medição em todas as páginas + aviso de cookies (LGPD) + Google Consent Mode v2 avançado (rodada de 23/10/2026).

   Modo padrão (GA4_E_PIXEL_PELO_GTM: false), com os IDs do build ou do public_html/olorin-ids.js:
   - consentimento padrão "negado" logo que o script roda;
   - depois do "load" (sem atrasar o LCP), quando o navegador fica livre: o gtag.js do GA4 (config com page_view,
     page_mode, page_slug e segmento) e o contêiner do GTM, mesmo antes da escolha. Enquanto negado, o GA4 só
     recebe pings sem cookie; depois do aceite, completo;
   - todo evento do track() vai para o dataLayer (GTM) e também para o GA4 (gtag 'event');
   - Pixel da Meta só com Marketing liberado: PageView em cada página (inclusive na do aceite), ViewContent nas
     páginas de serviço e nas LPs, Contact no clique de WhatsApp e Lead nas páginas de obrigado;
   - Google Ads: com GTM, fica no contêiner (gtm-container.json); sem GTM, vai no mesmo gtag.js do GA4.
   O gtag.js usa uma fila própria (window.olorinGtag): o GTM não enxerga os eventos do GA4 direto e nada se repete.
   Modo antigo (GA4_E_PIXEL_PELO_GTM: true): só o GTM; GA4, Pixel e Google Ads ficam dentro do contêiner. */
import { $, $$, CONFIG, quandoLivre, lerArmazenamento, gravarArmazenamento } from '../util.js';
import { track, aoRastrear } from './rastreamento.js';

const CHAVE = 'olorin_consentimento';
const FILA_GTAG = 'olorinGtag';
const carregado = {};
const filaPixel = [];
const esperando = [];
let atual = null; // escolha valendo nesta página (null = ainda sem escolha)
let iniciado = false;

/* ---------- Filas do Google ---------- */

/** dataLayer do GTM (consentimento e eventos do track). */
function gtagGtm() {
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push(arguments);
}
/** Fila própria do gtag.js (GA4 e, sem GTM, Google Ads). */
function gtagDireto() {
	window[FILA_GTAG] = window[FILA_GTAG] || [];
	window[FILA_GTAG].push(arguments);
}
/** Consentimento vale para as duas filas. */
function consentir(acao, estado) {
	gtagGtm('consent', acao, estado);
	if (modoDireto()) gtagDireto('consent', acao, estado);
}

function temRastreamento() {
	return !!(CONFIG.gtm || CONFIG.ga4 || CONFIG.pixel || CONFIG.adsId);
}
/** GA4, Pixel e (sem GTM) Google Ads mandados pelo próprio site. */
function modoDireto() {
	return !CONFIG.ga4PeloGtm || !CONFIG.gtm;
}
/** Google Ads direto só sem GTM (com GTM, quem manda é o contêiner). */
function adsDireto() {
	return modoDireto() && !CONFIG.gtm && !!CONFIG.adsId;
}

function script(src) {
	const s = document.createElement('script');
	s.async = true;
	s.src = src;
	document.head.appendChild(s);
}

/** Depois do "load" (ou de 3,5 s, o que vier antes) e com o navegador livre: não disputa com o LCP. */
function depoisDoLoad(fn) {
	let feito = false;
	const uma = () => {
		if (feito) return;
		feito = true;
		quandoLivre(fn);
	};
	if (document.readyState === 'complete') {
		uma();
		return;
	}
	window.addEventListener('load', uma, { once: true });
	window.setTimeout(uma, 3500);
}

/* Parâmetros da página: vão no page_view do GA4 e no dataLayer, para o GTM. */
function dadosDaPagina() {
	return {
		page_mode: CONFIG.modo || '',
		page_slug: CONFIG.slug || '',
		segmento: CONFIG.segmento || '',
		form_variant: document.documentElement.getAttribute('data-form-variant') || '',
	};
}

/* Comandos do GA4 (e do Google Ads sem GTM) na fila própria, na ordem certa: consentimento (já na fila),
   js, config. O arquivo gtag.js entra só quando o navegador estiver livre e processa a fila inteira. */
function prepararGoogle() {
	if (!modoDireto() || !(CONFIG.ga4 || adsDireto())) return;
	gtagDireto('set', 'ads_data_redaction', true);
	gtagDireto('js', new Date());
	if (CONFIG.ga4) gtagDireto('config', CONFIG.ga4, dadosDaPagina());
	if (adsDireto()) gtagDireto('config', CONFIG.adsId);
	depoisDoLoad(() => {
		if (carregado.gtag) return;
		carregado.gtag = true;
		script('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CONFIG.ga4 || CONFIG.adsId) + '&l=' + FILA_GTAG);
	});
}

function carregarGtm() {
	if (!CONFIG.gtm) return;
	depoisDoLoad(() => {
		if (carregado.gtm) return;
		carregado.gtm = true;
		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push(dadosDaPagina());
		window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
		script('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(CONFIG.gtm));
	});
}

/* ---------- Eventos do track() também no GA4 (modo direto) ---------- */

const SO_GTM = /^(utm_|event$)/;
function paraGa4(evento, dados) {
	if (!CONFIG.ga4 || !modoDireto() || evento === 'consent_update' || !/^[a-z][a-z0-9_]{0,39}$/i.test(evento)) return;
	const p = { send_to: CONFIG.ga4 };
	Object.keys(dados).forEach((k) => {
		let v = dados[k];
		if (SO_GTM.test(k) || v === '' || v == null) return;
		if (typeof v === 'boolean') v = v ? 'true' : 'false';
		if (typeof v === 'string') v = v.slice(0, 100);
		else if (typeof v !== 'number') return;
		p[k.slice(0, 40)] = v;
	});
	gtagDireto('event', evento, p);
}

/* ---------- Pixel da Meta (só com Marketing) ---------- */

/** Páginas de serviço (e campanhas de um serviço) e as duas LPs: ViewContent depois do PageView. */
function conteudoDaPagina() {
	const slug = CONFIG.slug || '';
	const lp = CONFIG.segmento === 'educacao' || CONFIG.segmento === 'influencer';
	if (CONFIG.modo === 'obrigado' || !(CONFIG.modo === 'servico' || /^promo-/.test(slug) || lp)) return null;
	return { content_name: slug, content_category: lp ? CONFIG.segmento : 'servico' };
}

function carregarPixel() {
	if (!CONFIG.pixel || !modoDireto() || carregado.pixel) return;
	carregado.pixel = true;
	/* eslint-disable */
	!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
	/* eslint-enable */
	window.fbq('init', CONFIG.pixel);
	window.fbq('track', 'PageView');
	const conteudo = conteudoDaPagina();
	if (conteudo) window.fbq('track', 'ViewContent', conteudo);
	while (filaPixel.length) window.fbq.apply(window, filaPixel.shift());
}

/** Evento do Pixel: sai na hora se Marketing está liberado; espera a escolha se ainda não há; some se recusado. */
function pixel(evento, params) {
	if (!CONFIG.pixel || !modoDireto()) return;
	const args = params ? ['track', evento, params] : ['track', evento];
	if (atual && atual.marketing && carregado.pixel) window.fbq.apply(window, args);
	else if (!atual || atual.marketing) filaPixel.push(args);
}

/**
 * Conversões que não passam pelo dataLayer: Contact/Lead do Pixel e, sem GTM, a conversão do Google Ads.
 * O GA4 recebe whatsapp_click e generate_lead pelo track() (aoRastrear), sem repetir.
 */
export function converter(tipo, params) {
	if (!temRastreamento() || !modoDireto()) return;
	if (tipo === 'lead') {
		pixel('Lead', params && params.segmento ? { content_category: params.segmento } : null);
		if (adsDireto() && CONFIG.adsLabel) gtagDireto('event', 'conversion', { send_to: CONFIG.adsId + '/' + CONFIG.adsLabel });
	} else if (tipo === 'whatsapp') {
		pixel('Contact');
	}
}

/**
 * Roda fn quando o visitante decidir no aviso de cookies (ou na hora, se já decidiu ou não há medição).
 * Sem decisão, roda depois de "limite" ms ou quando a pessoa sair da página, o que vier antes.
 * Usado no generate_lead das páginas de obrigado: com o aceite, a conversão já sai com cookie.
 */
export function quandoDecidir(fn, limite) {
	if (!temRastreamento() || atual || !iniciado || !$('[data-o-cookies]')) {
		fn();
		return;
	}
	let feito = false;
	const uma = () => {
		if (feito) return;
		feito = true;
		fn();
	};
	esperando.push(uma);
	window.setTimeout(uma, limite || 8000);
	window.addEventListener('pagehide', uma, { once: true });
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') uma();
	});
}

/* ---------- Escolha do visitante ---------- */

function aplicar(escolha, registrar) {
	const a = escolha.analise ? 'granted' : 'denied';
	const m = escolha.marketing ? 'granted' : 'denied';
	atual = escolha;
	consentir('update', { analytics_storage: a, ad_storage: m, ad_user_data: m, ad_personalization: m });
	if (registrar) track('consent_update', { analytics: !!escolha.analise, marketing: !!escolha.marketing });
	if (escolha.marketing) {
		depoisDoLoad(carregarPixel);
		if (carregado.pixel) window.fbq('consent', 'grant');
	} else {
		filaPixel.length = 0;
		if (carregado.pixel) window.fbq('consent', 'revoke');
	}
	while (esperando.length) esperando.shift()();
}

/** Escolha atual do visitante (ou null). */
export function consentimento() {
	return lerArmazenamento('localStorage', CHAVE);
}

export function iniciarConsentimento() {
	if (!temRastreamento() || iniciado) return;
	iniciado = true;
	consentir('default', {
		ad_storage: 'denied',
		ad_user_data: 'denied',
		ad_personalization: 'denied',
		analytics_storage: 'denied',
		wait_for_update: 500,
	});
	aoRastrear(paraGa4);

	// "Preferências de cookies" (rodapé e política) só aparece quando há o que escolher.
	$$('[data-o-cookies-link]').forEach((el) => {
		el.hidden = false;
	});

	const salvo = consentimento();
	if (salvo) aplicar(salvo, false);
	prepararGoogle();
	carregarGtm();

	const aviso = $('[data-o-cookies]');
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

	if (!salvo) aviso.hidden = false;
}
