/* Olorin Digital — comportamento do site novo (sem dependências).
   1. medição com consentimento (LGPD + Google Consent Mode v2)   2. cabeçalho, menu e HUD de nível
   3. entradas ao rolar e colagem do banner                        4. Raio-X arrastável, trilho, prévia de serviço
   5. formulário em 2 etapas e calculadora de orçamento            6. página de obrigado */
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
		var ids = CFG.previa ? {} : (w.OLORIN_IDS || {});
		if (CFG.previa) { CFG.gtm = CFG.ga4 = CFG.pixel = ''; } // prévia: sem medição
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
		['gclid', 'gbraid', 'wbraid', 'fbclid'].forEach(function (k) { var v = q.get(k); if (v) { o[k] = v.slice(0, 200); tem = true; } });
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
		grupo.hidden = false;
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
		var caixa = form.closest('.form'), E = {};
		try { E = JSON.parse(caixa.getAttribute('data-erros')) || {}; } catch (e) { /* usa os textos padrão */ }
		var e1 = $('[data-etapa="1"]', form), e2 = $('[data-etapa="2"]', form), prog = $$('.form__prog i', form), rot = $('[data-etapa-rotulo]', form), erroGeral = $('[data-erro-geral]', form);
		var avancar = $('[data-avancar]', form), voltar = $('[data-voltar]', form), botao = $('[data-enviar]', form);
		var campo = function (n) { return form.elements[n]; };
		var inicio = Date.now(), comecou = false;
		form.noValidate = true;
		e2.hidden = true; avancar.hidden = false; voltar.hidden = false;
		campo('olorin_ts').value = String(Math.floor(inicio / 1000));
		campo('pagina').value = location.pathname;
		campo('referencia').value = (d.referrer || '').slice(0, 200);
		Object.keys(origem).forEach(function (k) { if (campo(k)) campo(k).value = origem[k]; });
		var wa = campo('whatsapp');
		wa.addEventListener('input', function () { wa.value = mascara(wa.value); });
		form.addEventListener('focusin', function () { if (!comecou) { comecou = true; track('form_start', {}); } });

		function erro(el, msg) {
			var c = el.closest('.campo'), sp = $('.erro', c);
			if (el.type !== 'checkbox') el.setAttribute('aria-invalid', msg ? 'true' : 'false');
			if (sp) { sp.textContent = msg || ''; sp.hidden = !msg; }
			return !msg;
		}
		var limpar = function (ev) { var t = ev.target; if (t.getAttribute('aria-invalid') === 'true' || t.type === 'checkbox') { var c = t.closest('.campo'); if (c && $('.erro', c)) erro(t, ''); } };
		form.addEventListener('input', limpar); form.addEventListener('change', limpar);
		function checar(lista) {
			var primeiro = null;
			lista.forEach(function (par) { if (!erro(par[0], par[1])) primeiro = primeiro || par[0]; });
			if (primeiro) primeiro.focus();
			return !primeiro;
		}
		function validar1() {
			var n = wa.value.replace(/\D/g, ''), em = campo('email').value.trim();
			return checar([
				[campo('nome'), campo('nome').value.trim().length < 2 ? E.nome : ''],
				[wa, n.length < 10 || n.length > 11 ? E.whatsapp : DDDS.indexOf(n.slice(0, 2)) < 0 ? E.ddd : ''],
				[campo('email'), /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em) ? '' : E.email]
			]);
		}
		function validar2() {
			var falta = function (n) { var el = campo(n); return [el, el.value.trim().length < (el.tagName === 'SELECT' ? 1 : 2) ? el.getAttribute('data-msg') : '']; };
			return checar([falta('empresa'), falta('cargo'), falta('porte'), [campo('consentimento'), campo('consentimento').checked ? '' : E.consentimento]]);
		}
		function etapa(n) {
			e1.hidden = n === 2; e2.hidden = n === 1;
			prog[1].classList.toggle('on', n === 2);
			rot.textContent = 'Etapa ' + n + ' de 2';
			var alvo = $('legend', n === 2 ? e2 : e1); if (alvo) alvo.focus({ preventScroll: true });
			caixa.scrollIntoView({ block: 'nearest', behavior: calmo ? 'auto' : 'smooth' });
		}
		avancar.addEventListener('click', function () { if (validar1()) { etapa(2); track('form_step', { etapa: 2 }); } });
		voltar.addEventListener('click', function () { etapa(1); });
		$$('[data-etapa="1"] input', form).forEach(function (el) { el.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); avancar.click(); } }); });

		/* serviços: "Selecionar tudo" e a opção exclusiva "Ainda não sei" */
		var chips = $('[data-chips]', form), todos = $('[data-todos]', form), caixas = $$('input[name="servicos[]"]', form);
		var comuns = caixas.filter(function (c) { return !c.hasAttribute('data-exclusivo'); }), exclusivo = caixas.filter(function (c) { return c.hasAttribute('data-exclusivo'); })[0];
		$('[data-todos-rotulo]', form).hidden = false;
		chips.addEventListener('change', function (ev) {
			var t = ev.target;
			if (t === todos) { comuns.forEach(function (c) { c.checked = todos.checked; }); if (todos.checked && exclusivo) exclusivo.checked = false; }
			else if (t === exclusivo && t.checked) { comuns.forEach(function (c) { c.checked = false; }); todos.checked = false; }
			else { if (t.checked && exclusivo) exclusivo.checked = false; todos.checked = comuns.every(function (c) { return c.checked; }); }
		});
		/* verba: recado para quem ainda não investe */
		var verba = campo('investimento'), semVerba = $('[data-sem-verba]', form);
		verba.addEventListener('change', function () { semVerba.hidden = verba.selectedIndex !== 1; });

		function falha(j, conexao) {
			var nome = campo('nome').value.trim(), emp = campo('empresa').value.trim();
			erroGeral.innerHTML = '';
			erroGeral.appendChild(d.createTextNode(((j && j.message) || (conexao ? E.conexao : E.geral)) + ' '));
			var a = d.createElement('a'); a.className = 'link'; a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('data-wa', '');
			a.href = 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent('Oi! Tentei pedir o Raio-X pelo site e não consegui enviar.' + (nome ? ' Meu nome é ' + nome + (emp ? ', da ' + emp : '') + '.' : '') + ' [ref: form-erro]');
			a.textContent = E.wa_alternativa + '.'; erroGeral.appendChild(a); erroGeral.hidden = false;
			erroGeral.scrollIntoView({ block: 'nearest' });
			track('form_error', {});
		}
		form.addEventListener('submit', function (ev) {
			ev.preventDefault(); erroGeral.hidden = true;
			if (!validar1()) { if (e1.hidden) { etapa(1); validar1(); } return; }
			if (e2.hidden) { etapa(2); return; }
			if (!validar2()) return;
			campo('olorin_tempo').value = String(Math.round((Date.now() - inicio) / 1000));
			botao.disabled = true; botao.setAttribute('aria-busy', 'true');
			var pedido = CFG.previa
				? new Promise(function (ok) { setTimeout(function () { ok({ ok: true }); }, 500); })
				: fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } }).then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.ok) throw j; return j; }); });
			pedido.then(function (j) {
				track('form_submit', {});
				converterLead('site');
				var destino = j.redirect || '/obrigado/';
				if (CFG.previa) destino = (form.getAttribute('action') || '').replace(/enviar\.php.*$/, '') + 'obrigado/index.html';
				location.href = destino;
			}).catch(function (j) { botao.disabled = false; botao.removeAttribute('aria-busy'); falha(j && j.message ? j : null, !(j && j.message)); });
		});
	});

	/* ---------- Calculadora: monta o orçamento e manda por WhatsApp ---------- */
	(function () {
		var calc = $('[data-calc]'); if (!calc) return;
		var botao = $('[data-calc-botao]', calc), grupos = $$('[data-calc-grupo]', calc), usou = false;
		function montar() {
			var linhas = [calc.getAttribute('data-inicio')];
			grupos.forEach(function (g) {
				var m = $('input:checked', g); if (!m) return;
				var alvo = $('[data-calc-linha="' + g.getAttribute('data-calc-grupo') + '"]', calc); if (alvo) alvo.textContent = m.value;
				linhas.push('- ' + g.getAttribute('data-rotulo') + ': ' + m.value);
			});
			linhas.push(calc.getAttribute('data-fim'));
			botao.href = 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(linhas.join('\n') + ' [ref: calculadora]');
		}
		calc.addEventListener('change', function () {
			montar();
			var papel = $('[data-calc-papel]', calc); papel.classList.remove('pulso'); void papel.offsetWidth; papel.classList.add('pulso');
			if (!usou) { usou = true; track('calculator_use', {}); }
		});
		montar();
	})();

	/* ---------- Página de obrigado ---------- */
	(function () {
		var ob = $('[data-obrigado]'); if (!ob) return;
		converterLead(ob.getAttribute('data-obrigado'));
		var ag = $('[data-agenda]', ob); if (ag && CFG.agenda) { ag.href = CFG.agenda; ag.hidden = false; }
	})();

	/* perfil: copiar link */
	$$('[data-copiar]').forEach(function (b) { b.addEventListener('click', function () { if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { var t = b.textContent; b.textContent = 'Link copiado'; setTimeout(function () { b.textContent = t; }, 1800); }); }); });
})();
