/* Olorin Digital — comportamento do site novo (sem dependências).
   1. medição com consentimento (LGPD + Google Consent Mode v2)   2. cabeçalho, menu e HUD de nível
   3. entradas ao rolar e colagem do banner                        4. Raio-X arrastável, trilho, prévia de serviço
   5. formulário em 2 passos (o 1º já registra o contato)          6. página de obrigado */
(function () {
	'use strict';
	var d = document, w = window, raiz = d.documentElement;
	var CFG = w.OLORIN_CONFIG || {};
	var $ = function (s, c) { return (c || d).querySelector(s); };
	var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
	var calmo = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var fino = w.matchMedia && w.matchMedia('(hover: hover) and (pointer: fine)').matches;
	function ler(tipo, k) { try { var v = w[tipo].getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
	function gravar(tipo, k, v) { try { w[tipo].setItem(k, JSON.stringify(v)); } catch (e) { /* armazenamento bloqueado */ } }

	/* ---------- IDs editáveis pelo WebFTP (olorin-ids.js) ---------- */
	(function () {
		var ids = w.OLORIN_IDS || {};
		var mapa = [['GTM_ID', 'gtm', /^GTM-[A-Z0-9]{4,12}$/i], ['GA4_ID', 'ga4', /^G-[A-Z0-9]{4,15}$/i], ['META_PIXEL_ID', 'pixel', /^\d{6,20}$/], ['GADS_CONVERSION_ID', 'adsId', /^(AW-)?\d{6,15}$/i], ['GADS_CONVERSION_LABEL', 'adsLabel', /^[\w-]{4,64}$/], ['SCHEDULING_URL', 'agenda', /^https:\/\/[^\s"'<>]+$/]];
		mapa.forEach(function (m) {
			var v = ids[m[0]] == null ? '' : String(ids[m[0]]).trim();
			if (v && m[2].test(v)) CFG[m[1]] = v;
		});
		CFG.peloGtm = ids.GA4_E_PIXEL_PELO_GTM === true && !!CFG.gtm;
		var n = String(CFG.adsId || '').replace(/^AW-/i, '');
		CFG.adsId = n ? 'AW-' + n : '';
	})();

	/* ---------- Origem do visitante (UTM do primeiro e do último toque; nada pessoal) ---------- */
	var origem = (function () {
		var q = new URLSearchParams(location.search), o = {}, tem = false;
		['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) { var v = q.get(k); if (v) { o[k] = v.slice(0, 120); tem = true; } });
		if (q.get('gclid')) { o.utm_source = o.utm_source || 'google'; o.utm_medium = o.utm_medium || 'cpc'; tem = true; }
		if (q.get('fbclid')) { o.utm_source = o.utm_source || 'meta'; o.utm_medium = o.utm_medium || 'paid_social'; tem = true; }
		if (tem) gravar('sessionStorage', 'olorin_origem', o);
		return ler('sessionStorage', 'olorin_origem') || {};
	})();

	/* ---------- Medição: track() + consentimento ---------- */
	var PROIBIDAS = /nome|name|whatsapp|telefone|phone|email|e-mail|mensagem|empresa|cargo|perfil|site/i;
	var escolha = null, carregado = {}, filaPixel = [];
	var direto = function () { return !CFG.peloGtm; };
	var temMedicao = function () { return !!(CFG.gtm || CFG.ga4 || CFG.pixel); };
	function gGtm() { w.dataLayer = w.dataLayer || []; w.dataLayer.push(arguments); }
	function gDir() { w.olorinGtag = w.olorinGtag || []; w.olorinGtag.push(arguments); }
	function script(src) { var s = d.createElement('script'); s.async = true; s.src = src; d.head.appendChild(s); }
	function depoisDoLoad(fn) {
		var feito = false, uma = function () { if (feito) return; feito = true; (w.requestIdleCallback || function (f) { setTimeout(f, 300); })(fn, { timeout: 2000 }); };
		if (d.readyState === 'complete') return uma();
		w.addEventListener('load', uma, { once: true }); setTimeout(uma, 3500);
	}
	function dadosPagina() { return { page_mode: CFG.modo || '', page_slug: CFG.slug || '', segmento: CFG.segmento || '' }; }
	function track(evento, params) {
		var dados = dadosPagina(); dados.event = evento;
		['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) { if (origem[k]) dados[k] = origem[k]; });
		Object.keys(params || {}).forEach(function (k) {
			var v = params[k];
			if (PROIBIDAS.test(k)) return;
			if (typeof v === 'string' && (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(v) || /(\d[\s().-]*){10,}/.test(v))) return;
			dados[k] = v;
		});
		w.dataLayer = w.dataLayer || []; w.dataLayer.push(dados);
		if (CFG.ga4 && direto() && evento !== 'consent_update') {
			var p = { send_to: CFG.ga4 };
			Object.keys(dados).forEach(function (k) { if (k !== 'event' && !/^utm_/.test(k) && dados[k] !== '' && dados[k] != null) p[k] = typeof dados[k] === 'boolean' ? String(dados[k]) : dados[k]; });
			gDir('event', evento, p);
		}
	}
	function pixel(evento, params) {
		if (!CFG.pixel || !direto()) return;
		var a = params ? ['track', evento, params] : ['track', evento];
		if (escolha && escolha.marketing && carregado.pixel) w.fbq.apply(w, a);
		else if (!escolha || escolha.marketing) filaPixel.push(a);
	}
	function carregarPixel() {
		if (!CFG.pixel || !direto() || carregado.pixel) return;
		carregado.pixel = true;
		/* eslint-disable */
		!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(w,d,'script','https://connect.facebook.net/en_US/fbevents.js');
		/* eslint-enable */
		w.fbq('init', CFG.pixel); w.fbq('track', 'PageView');
		if (/^(servico|educacao|influenciadores)$/.test(CFG.modo)) w.fbq('track', 'ViewContent', { content_name: CFG.slug, content_category: CFG.segmento || 'servico' });
		while (filaPixel.length) w.fbq.apply(w, filaPixel.shift());
	}
	function aplicar(e, registrar) {
		var a = e.analise ? 'granted' : 'denied', m = e.marketing ? 'granted' : 'denied', estado = { analytics_storage: a, ad_storage: m, ad_user_data: m, ad_personalization: m };
		escolha = e; gGtm('consent', 'update', estado); if (direto()) gDir('consent', 'update', estado);
		if (registrar) track('consent_update', { analytics: !!e.analise, marketing: !!e.marketing });
		if (e.marketing) { depoisDoLoad(carregarPixel); if (carregado.pixel) w.fbq('consent', 'grant'); }
		else { filaPixel.length = 0; if (carregado.pixel) w.fbq('consent', 'revoke'); }
	}
	function iniciarMedicao() {
		if (!temMedicao()) return;
		var padrao = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 };
		gGtm('consent', 'default', padrao);
		if (direto()) gDir('consent', 'default', padrao);
		var salvo = ler('localStorage', 'olorin_consentimento');
		if (salvo) aplicar(salvo, false);
		if (direto() && CFG.ga4) {
			gDir('set', 'ads_data_redaction', true); gDir('js', new Date()); gDir('config', CFG.ga4, dadosPagina());
			depoisDoLoad(function () { script('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CFG.ga4) + '&l=olorinGtag'); });
		}
		if (CFG.gtm) depoisDoLoad(function () {
			w.dataLayer = w.dataLayer || []; w.dataLayer.push(dadosPagina()); w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
			script('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(CFG.gtm));
		});
		$$('[data-cookies-abrir]').forEach(function (b) { b.hidden = false; });
		var aviso = $('[data-cookies]'); if (!aviso) return;
		var opcoes = $('[data-cookies-opcoes]', aviso), acoes = $('[data-cookies-acoes]', aviso), an = $('[data-cookies-analise]', aviso), mk = $('[data-cookies-marketing]', aviso);
		function decidir(e) { var r = { analise: !!e.analise, marketing: !!e.marketing, data: new Date().toISOString() }; gravar('localStorage', 'olorin_consentimento', r); aviso.hidden = true; aplicar(r, true); }
		$('[data-cookies-aceitar]', aviso).addEventListener('click', function () { decidir({ analise: true, marketing: true }); });
		$('[data-cookies-recusar]', aviso).addEventListener('click', function () { decidir({ analise: false, marketing: false }); });
		$('[data-cookies-personalizar]', aviso).addEventListener('click', function () { opcoes.hidden = false; acoes.hidden = true; an.focus(); });
		$('[data-cookies-salvar]', aviso).addEventListener('click', function () { decidir({ analise: an.checked, marketing: mk.checked }); });
		$$('[data-cookies-abrir]').forEach(function (b) { b.addEventListener('click', function () { var g = ler('localStorage', 'olorin_consentimento') || {}; an.checked = !!g.analise; mk.checked = !!g.marketing; opcoes.hidden = false; acoes.hidden = true; aviso.hidden = false; an.focus(); }); });
		if (!salvo) aviso.hidden = false;
	}
	function converterLead(segmento) {
		if (ler('sessionStorage', 'olorin_lead_contado')) return;
		gravar('sessionStorage', 'olorin_lead_contado', 1);
		track('generate_lead', { form_segmento: segmento || 'site' });
		pixel('Lead', { content_category: segmento || 'site' });
		if (direto() && !CFG.gtm && CFG.adsId && CFG.adsLabel) gDir('event', 'conversion', { send_to: CFG.adsId + '/' + CFG.adsLabel });
	}
	iniciarMedicao();

	/* cliques medidos: WhatsApp e chamadas do Raio-X */
	d.addEventListener('click', function (e) {
		var a = e.target.closest && e.target.closest('a');
		if (!a) return;
		if (a.hasAttribute('data-wa')) {
			var ref = 'sem-ref';
			try { ref = (/\[ref: ([^\]]+)\]/.exec(new URL(a.href).searchParams.get('text') || '') || [])[1] || ref; } catch (er) { /* link sem texto */ }
			track('whatsapp_click', { origem_clique: ref }); pixel('Contact');
		} else if (/#raio-x$/.test(a.getAttribute('href') || '')) {
			gravar('sessionStorage', 'olorin_cta', a.id || 'cta');
			track('cta_click', { origem_clique: a.id || 'cta' });
		}
	});

	/* ---------- Cabeçalho, menu e HUD de nível ---------- */
	(function () {
		var topo = $('[data-topo]'), menu = $('[data-menu]'), abrir = $('[data-menu-abrir]'), barra = $('[data-barra-m]'), nNivel = $('[data-nivel-n]');
		var secoes = $$('[data-nivel]'), ultimoY = 0, form = $('#raio-x'), herois = $('[data-hero], .capa');
		function fechar() { menu.classList.remove('aberto'); abrir.setAttribute('aria-expanded', 'false'); d.body.style.overflow = ''; abrir.focus(); }
		if (abrir && menu) {
			abrir.addEventListener('click', function () { menu.classList.add('aberto'); abrir.setAttribute('aria-expanded', 'true'); d.body.style.overflow = 'hidden'; $('[data-menu-fechar]', menu).focus(); });
			$('[data-menu-fechar]', menu).addEventListener('click', fechar);
			menu.addEventListener('click', function (e) { if (e.target.closest('a')) { menu.classList.remove('aberto'); abrir.setAttribute('aria-expanded', 'false'); d.body.style.overflow = ''; } });
			d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('aberto')) fechar(); });
		}
		$$('[data-sub]').forEach(function (b) {
			b.addEventListener('click', function () { var s = b.parentNode, on = !s.classList.contains('aberto'); $$('.sub.aberto').forEach(function (o) { o.classList.remove('aberto'); $('[data-sub]', o).setAttribute('aria-expanded', 'false'); }); s.classList.toggle('aberto', on); b.setAttribute('aria-expanded', String(on)); });
		});
		d.addEventListener('click', function (e) { if (!e.target.closest('.sub')) $$('.sub.aberto').forEach(function (o) { o.classList.remove('aberto'); }); });
		var pendente = false;
		function aoRolar() {
			pendente = false;
			var y = w.scrollY, alto = d.documentElement.scrollHeight - w.innerHeight;
			if (topo) {
				topo.style.setProperty('--xp', alto > 0 ? Math.min(1, y / alto).toFixed(4) : 0);
				topo.classList.toggle('some', y > 500 && y > ultimoY + 4 && !menu.classList.contains('aberto'));
				if (y < ultimoY - 4 || y < 500) topo.classList.remove('some');
			}
			if (nNivel && secoes.length) {
				var n = 1;
				secoes.forEach(function (s, i) { if (s.getBoundingClientRect().top < w.innerHeight * 0.55) n = i + 1; });
				var txt = (n < 10 ? '0' : '') + n;
				if (nNivel.textContent !== txt) nNivel.textContent = txt;
			}
			if (barra) {
				var passou = herois ? herois.getBoundingClientRect().bottom < 80 : y > 400;
				var noForm = form ? form.getBoundingClientRect().top < w.innerHeight * 0.7 : false;
				barra.classList.toggle('ativo', passou && !noForm);
			}
			ultimoY = y;
		}
		w.addEventListener('scroll', function () { if (!pendente) { pendente = true; requestAnimationFrame(aoRolar); } }, { passive: true });
		aoRolar();
	})();

	/* ---------- Entradas ao rolar ---------- */
	(function () {
		var alvos = $$('[data-r], [data-r-linhas]');
		if (!('IntersectionObserver' in w) || calmo) { alvos.forEach(function (el) { el.classList.add('v'); }); return; }
		var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('v'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
		alvos.forEach(function (el) { io.observe(el); });
	})();

	/* ---------- Banner: colagem viva (entrada, paralaxe, arrastar, nível subindo) ---------- */
	(function () {
		var hero = $('[data-hero]'); if (!hero) return;
		var cena = $('[data-cena]', hero), titulo = $('.hero__t', hero);
		requestAnimationFrame(function () { titulo.classList.add('v'); hero.classList.add('pronto'); });
		var demo = $('[data-nivel-demo]', hero);
		if (demo && !calmo) {
			var n = 7, p = 20, barra = $('.nivel__xp i', demo), num = $('[data-n]', demo);
			setInterval(function () {
				if (d.hidden) return;
				p += 20;
				if (p > 100) { p = 20; n = n >= 99 ? 7 : n + 1; num.textContent = (n < 10 ? '0' : '') + n; demo.classList.add('subiu'); setTimeout(function () { demo.classList.remove('subiu'); }, 1500); }
				barra.style.setProperty('--p', p + '%');
			}, 900);
		}
		if (!cena) return;
		if (fino && !calmo) {
			var camadas = $$('[data-px]', hero), alvoX = 0, alvoY = 0, x = 0, y = 0, rodando = false;
			var passo = function () {
				x += (alvoX - x) * 0.08; y += (alvoY - y) * 0.08;
				camadas.forEach(function (c) { if (c.classList.contains('arrasta')) return; var f = parseFloat(c.getAttribute('data-px')); c.style.setProperty('--px', (x * f * 9).toFixed(1) + 'px'); c.style.setProperty('--py', (y * f * 9).toFixed(1) + 'px'); });
				if (Math.abs(alvoX - x) > 0.002 || Math.abs(alvoY - y) > 0.002) requestAnimationFrame(passo); else rodando = false;
			};
			hero.addEventListener('pointermove', function (e) { alvoX = e.clientX / w.innerWidth - 0.5; alvoY = e.clientY / w.innerHeight - 0.5; if (!rodando) { rodando = true; requestAnimationFrame(passo); } });
		}
		// adesivos que dá para arrastar
		$$('.cola', hero).forEach(function (el) {
			var ox = 0, oy = 0, sx = 0, sy = 0, moveu = false;
			el.addEventListener('pointerdown', function (e) {
				if (e.button) return;
				sx = e.clientX - ox; sy = e.clientY - oy; moveu = false; el.setPointerCapture(e.pointerId); el.classList.add('arrasta');
			});
			el.addEventListener('pointermove', function (e) {
				if (!el.classList.contains('arrasta')) return;
				ox = e.clientX - sx; oy = e.clientY - sy; if (Math.abs(ox) + Math.abs(oy) > 6) moveu = true;
				el.style.setProperty('--dx', ox + 'px'); el.style.setProperty('--dy', oy + 'px');
			});
			var soltar = function () { el.classList.remove('arrasta'); };
			el.addEventListener('pointerup', soltar); el.addEventListener('pointercancel', soltar);
			el.addEventListener('click', function (e) { if (moveu) { e.preventDefault(); moveu = false; } });
		});
	})();

	/* ---------- Faixas rolantes: pausa ---------- */
	$$('[data-rolo-pausa]').forEach(function (b) {
		b.addEventListener('click', function () { var r = b.parentNode.querySelector('[data-rolo]'), on = r.classList.toggle('pausado'); b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '▶' : '❚❚'; b.setAttribute('aria-label', on ? 'Continuar a faixa de logos' : 'Pausar a faixa de logos'); });
	});

	/* ---------- Serviços: prévia que segue o cursor ---------- */
	(function () {
		var caixa = $('[data-previa-caixa]'); if (!caixa || !fino) return;
		var im = $('img', caixa);
		$$('[data-previa]').forEach(function (a, i) {
			a.addEventListener('pointerenter', function () { im.src = a.getAttribute('data-previa'); caixa.style.setProperty('--rot', (i % 2 ? -5 : 5) + 'deg'); caixa.classList.add('ativo'); });
			a.addEventListener('pointerleave', function () { caixa.classList.remove('ativo'); });
			a.addEventListener('pointermove', function (e) { caixa.style.setProperty('--x', Math.min(w.innerWidth - 330, e.clientX + 40) + 'px'); caixa.style.setProperty('--y', Math.max(90, e.clientY - 230) + 'px'); });
		});
	})();

	/* ---------- Raio-X: feixe automático e arrastável ---------- */
	(function () {
		var scan = $('[data-scan]'); if (!scan) return;
		var achados = $$('[data-achado]'), pos = 0.92, alvo = 0.92, auto = true, t0 = 0, visivel = false;
		function pintar() {
			scan.style.setProperty('--pos', (pos * 100).toFixed(2) + '%');
			achados.forEach(function (a) { a.classList.toggle('v', pos <= parseFloat(a.getAttribute('data-achado'))); });
		}
		function quadro(t) {
			if (!visivel) return;
			if (auto && !calmo) { if (!t0) t0 = t; var f = ((t - t0) / 7000) % 1; alvo = 0.5 + 0.44 * Math.cos(f * Math.PI * 2); }
			pos += (alvo - pos) * 0.12; pintar(); requestAnimationFrame(quadro);
		}
		if (calmo) { pos = alvo = 0.08; pintar(); }
		new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; if (visivel) requestAnimationFrame(quadro); }, { threshold: 0.15 }).observe(scan);
		function mover(e) { var r = scan.getBoundingClientRect(); alvo = Math.max(0.03, Math.min(0.97, (e.clientX - r.left) / r.width)); }
		scan.addEventListener('pointerdown', function (e) { auto = false; scan.setPointerCapture(e.pointerId); mover(e); });
		scan.addEventListener('pointermove', function (e) { if (e.buttons || e.pointerType === 'mouse') { auto = false; mover(e); } });
		scan.addEventListener('pointerleave', function () { t0 = 0; setTimeout(function () { auto = true; }, 2500); });
	})();

	/* ---------- Trilho do portfólio: arrastar com o mouse ---------- */
	$$('[data-trilho]').forEach(function (t) {
		var x0 = 0, s0 = 0, ativo = false, moveu = false;
		t.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; ativo = true; moveu = false; x0 = e.clientX; s0 = t.scrollLeft; });
		w.addEventListener('pointermove', function (e) { if (!ativo) return; var dx = e.clientX - x0; if (Math.abs(dx) > 4) { moveu = true; t.classList.add('arrasta'); } t.scrollLeft = s0 - dx; });
		w.addEventListener('pointerup', function () { ativo = false; t.classList.remove('arrasta'); });
		t.addEventListener('click', function (e) { if (moveu) e.preventDefault(); }, true);
	});

	/* ---------- Portfólio: filtros ---------- */
	(function () {
		var grupo = $('[data-filtros]'); if (!grupo) return;
		var itens = $$('[data-servicos]');
		grupo.addEventListener('click', function (e) {
			var b = e.target.closest('button'); if (!b) return;
			var f = b.getAttribute('data-filtro');
			$$('button', grupo).forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
			itens.forEach(function (it) { it.hidden = !!f && it.getAttribute('data-servicos').split(' ').indexOf(f) < 0; });
			track('portfolio_filtro', { filtro: f || 'tudo' });
		});
	})();

	/* ---------- Dúvidas: mede a abertura ---------- */
	$$('details[data-faq]').forEach(function (dt) { dt.addEventListener('toggle', function () { if (dt.open) track('faq_open', { pergunta_id: dt.id }); }); });

	/* ---------- Formulário do Raio-X ---------- */
	var DDDS = '11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99'.split(' ');
	function mascara(v) {
		var n = v.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').slice(0, 11);
		if (n.length > 10) return '(' + n.slice(0, 2) + ') ' + n.slice(2, 7) + '-' + n.slice(7);
		if (n.length > 6) return '(' + n.slice(0, 2) + ') ' + n.slice(2, 6) + '-' + n.slice(6);
		if (n.length > 2) return '(' + n.slice(0, 2) + ') ' + n.slice(2);
		return n.length ? '(' + n : '';
	}
	$$('[data-form]').forEach(function (form) {
		var seg = form.getAttribute('data-segmento') || 'site';
		var e1 = $('[data-etapa="1"]', form), e2 = $('[data-etapa="2"]', form), prog = $$('.form__prog i', form), erroGeral = $('[data-erro-geral]', form);
		var campo = function (n) { return form.elements[n]; };
		var inicio = Date.now(), comecou = false, pular = $('[data-pular]', form);
		e2.hidden = true; pular.hidden = false;
		campo('etapa').value = '1';
		campo('lead_id').value = (w.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
		Object.keys(origem).forEach(function (k) { if (campo(k)) campo(k).value = origem[k]; });
		var wa = campo('whatsapp');
		wa.addEventListener('input', function () { wa.value = mascara(wa.value); });
		form.addEventListener('focusin', function () { if (!comecou) { comecou = true; track('form_start', { form_segmento: seg }); } });
		function erro(el, msg) {
			var c = el.closest('.campo'), s = $('.erro', c);
			if (el.type !== 'checkbox') el.setAttribute('aria-invalid', msg ? 'true' : 'false');
			if (s) { s.textContent = msg || ''; s.hidden = !msg; }
			return !msg;
		}
		function validar1() {
			var E = { nome: 'Conta pra gente o seu nome.', wa: 'Confira o WhatsApp com DDD, por exemplo (41) 99999-9999.', ddd: 'Esse DDD não existe. Confira o número.', aceite: 'Precisamos do seu ok para entrar em contato.' };
			var n = wa.value.replace(/\D/g, ''), ok = true, primeiro = null;
			var checar = function (el, msg) { if (!erro(el, msg)) { ok = false; primeiro = primeiro || el; } };
			checar(campo('nome'), campo('nome').value.trim().length < 2 ? E.nome : '');
			checar(wa, n.length < 10 || n.length > 11 ? E.wa : DDDS.indexOf(n.slice(0, 2)) < 0 ? E.ddd : '');
			checar(campo('consentimento'), campo('consentimento').checked ? '' : E.aceite);
			if (primeiro) primeiro.focus();
			return ok;
		}
		function enviar(etapa) {
			campo('etapa').value = etapa; campo('olorin_tempo').value = Math.round((Date.now() - inicio) / 1000);
			if (campo('origem_clique')) campo('origem_clique').value = ler('sessionStorage', 'olorin_cta') || '';
			if (CFG.previa) return new Promise(function (ok) { setTimeout(function () { ok({ ok: true }); }, 500); });
			return fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } }).then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.ok) throw j; return j; }); });
		}
		function falha(j) {
			var nome = campo('nome').value.trim();
			erroGeral.innerHTML = '';
			erroGeral.appendChild(d.createTextNode((j && j.message) || 'Não conseguimos enviar agora. '));
			var a = d.createElement('a'); a.className = 'link'; a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('data-wa', '');
			a.href = 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent('Oi! Tentei pedir o Raio-X pelo site e não consegui enviar.' + (nome ? ' Meu nome é ' + nome + '.' : '') + ' [ref: form-erro]');
			a.textContent = ' Mande pelo WhatsApp'; erroGeral.appendChild(a); erroGeral.hidden = false;
			track('form_error', { form_segmento: seg });
		}
		function ocupado(b, sim) { b.disabled = sim; b.setAttribute('aria-busy', String(sim)); }
		form.addEventListener('submit', function (ev) {
			ev.preventDefault(); erroGeral.hidden = true;
			var nome = campo('nome').value.trim().split(/\s+/)[0];
			if (e2.hidden) {
				if (!validar1()) return;
				var b = $('[data-continuar]', form); ocupado(b, true);
				enviar('1').then(function () {
					gravar('sessionStorage', 'olorin_lead', { nome: nome, segmento: seg });
					converterLead(seg);
					e1.hidden = true; e2.hidden = false; prog[1].classList.add('on');
					$('[data-ola]', form).textContent = 'Recebido, ' + nome + '! Só mais um toque.';
					var alvo = $('input:not([type=hidden])', e2); if (alvo) alvo.focus({ preventScroll: true });
					form.closest('.form').scrollIntoView({ block: 'nearest', behavior: calmo ? 'auto' : 'smooth' });
				}).catch(falha).then(function () { ocupado(b, false); });
			} else {
				var em = campo('email');
				if (em.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim())) { erro(em, 'Confira o e-mail, por exemplo voce@email.com.br.'); em.focus(); return; }
				erro(em, '');
				var b2 = $('[data-enviar]', form); ocupado(b2, true);
				var emp = campo('empresa').value.trim();
				gravar('sessionStorage', 'olorin_lead', { nome: nome, segmento: seg, empresa: emp.slice(0, 80) });
				enviar('2').then(function () { track('form_complete', { form_segmento: seg }); location.href = pular.getAttribute('href'); }).catch(function (j) { ocupado(b2, false); falha(j); });
			}
		});
	});

	/* ---------- Página de obrigado: nome no título e conversa pronta no WhatsApp ---------- */
	(function () {
		var ob = $('[data-obrigado]'); if (!ob) return;
		var lead = ler('sessionStorage', 'olorin_lead') || {};
		converterLead(ob.getAttribute('data-obrigado'));
		var nome = String(lead.nome || '').replace(/[<>]/g, '').slice(0, 30);
		if (nome) { var t = $('[data-nome]', ob); if (t) t.textContent = nome + ','; }
		var b = $('[data-wa-obrigado]', ob);
		if (b && nome) {
			var msg = 'Oi, Derek! Aqui é ' + nome + (lead.empresa ? ', da ' + lead.empresa : '') + '. Acabei de pedir o Raio-X pelo site. Pode me chamar por aqui. [ref: obrigado]';
			b.href = 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(msg);
		}
		var ag = $('[data-agenda]', ob); if (ag && CFG.agenda) { ag.href = CFG.agenda; ag.hidden = false; }
	})();

	/* perfil: copiar link */
	$$('[data-copiar]').forEach(function (b) { b.addEventListener('click', function () { if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { var t = b.textContent; b.textContent = 'Link copiado'; setTimeout(function () { b.textContent = t; }, 1800); }); }); });
})();
