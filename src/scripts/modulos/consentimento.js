/* Aviso de cookies próprio + Consent Mode v2 (PROMPT 13.2).
   Padrão "negado". O GTM (ou GA4/Pixel direto) só carrega depois de uma escolha que permita
   Análise e/ou Marketing — e só quando o navegador estiver livre, para não pesar no LCP. */
import { $, $$, CONFIG, quandoLivre, lerArmazenamento, gravarArmazenamento } from '../util.js';
import { track } from './rastreamento.js';

const CHAVE = 'olorin_consentimento';
let carregado = false;

function gtag() {
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push(arguments);
}

function temRastreamento() {
	return !!(CONFIG.gtm || CONFIG.ga4 || CONFIG.pixel);
}

function script(src) {
	const s = document.createElement('script');
	s.async = true;
	s.src = src;
	document.head.appendChild(s);
}

function carregarFerramentas(escolha) {
	if (carregado || !(escolha.analise || escolha.marketing)) return;
	carregado = true;
	if (CONFIG.gtm) {
		window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
		script('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(CONFIG.gtm));
		return;
	}
	if (CONFIG.ga4 && escolha.analise) {
		gtag('js', new Date());
		gtag('config', CONFIG.ga4);
		script('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CONFIG.ga4));
	}
	if (CONFIG.pixel && escolha.marketing && !window.fbq) {
		/* eslint-disable */
		!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
		/* eslint-enable */
		window.fbq('init', CONFIG.pixel);
		window.fbq('track', 'PageView');
	}
}

function aplicar(escolha, registrar) {
	const a = escolha.analise ? 'granted' : 'denied';
	const m = escolha.marketing ? 'granted' : 'denied';
	gtag('consent', 'update', { analytics_storage: a, ad_storage: m, ad_user_data: m, ad_personalization: m });
	if (registrar) {
		track('consent_update', { analytics: !!escolha.analise, marketing: !!escolha.marketing });
	}
	// Carrega depois da primeira interação ou quando o navegador estiver livre.
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
		const atual = consentimento() || {};
		if (analise) analise.checked = !!atual.analise;
		if (marketing) marketing.checked = !!atual.marketing;
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
