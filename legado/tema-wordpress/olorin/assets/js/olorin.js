/**
 * Olorin Digital — interações do site (JavaScript puro, sem dependências).
 *
 * Tudo aqui é "melhoria progressiva": sem JavaScript o site continua
 * legível, navegável e o formulário envia normalmente.
 *
 * Módulos: cabeçalho · menu do celular · menu ativo · animação de entrada ·
 * letreiro · contadores · checklist · etapas do método · filtros do portfólio ·
 * formulário · botões flutuantes · cursor · cookies (LGPD) · eventos (dataLayer)
 */
(function () {
	'use strict';

	var doc = document;
	var root = doc.documentElement;
	var CFG = window.OLORIN || {};
	var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	var hasIO = 'IntersectionObserver' in window;

	function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
	function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

	/* ---------- Eventos para GTM / GA4 / Pixel ---------- */
	function track(event, data) {
		window.dataLayer = window.dataLayer || [];
		var payload = { event: event };
		if (data) {
			for (var k in data) {
				if (Object.prototype.hasOwnProperty.call(data, k)) { payload[k] = data[k]; }
			}
		}
		window.dataLayer.push(payload);
	}

	function locationOf(el) {
		if (el.id) { return el.id; }
		var holder = el.closest('section[id], footer, header, .o-menu, .o-mobilebar, .o-wa-float');
		if (!holder) { return 'site'; }
		return holder.id || holder.className.split(' ')[0].replace(/^o-/, '');
	}

	/* ---------- Origem da visita (utm, gclid, fbclid) ---------- */
	var ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];

	function readAttribution() {
		var stored = {};
		try { stored = JSON.parse(sessionStorage.getItem('olorin_attr') || '{}') || {}; } catch (e) { stored = {}; }
		var params = new URLSearchParams(window.location.search);
		var fresh = {};
		var hasFresh = false;
		ATTR_KEYS.forEach(function (key) {
			var value = params.get(key);
			if (value) { fresh[key] = value.slice(0, 255); hasFresh = true; }
		});
		if (hasFresh) {
			stored = fresh;
		}
		if (!stored.ref && doc.referrer && doc.referrer.indexOf(window.location.host) === -1) {
			stored.ref = doc.referrer.slice(0, 500);
		}
		try { sessionStorage.setItem('olorin_attr', JSON.stringify(stored)); } catch (e) { /* modo privado */ }
		return stored;
	}

	/* ---------- Cabeçalho: fundo ao rolar e esconde ao descer ---------- */
	function initHeader() {
		var header = $('[data-o-header]');
		if (!header) { return; }
		var lastY = window.scrollY;
		var ticking = false;

		function update() {
			var y = window.scrollY;
			header.classList.toggle('is-scrolled', y > 24);
			var menuOpen = root.classList.contains('o-menu-open');
			if (!menuOpen && y > 640 && y > lastY + 6) {
				header.classList.add('is-hidden');
			} else if (y < lastY - 6 || y < 640) {
				header.classList.remove('is-hidden');
			}
			lastY = y;
			ticking = false;
		}
		window.addEventListener('scroll', function () {
			if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
		}, { passive: true });
		header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });
		update();
	}

	/* ---------- Menu do celular ---------- */
	function initMenu() {
		var menu = $('[data-o-menu]');
		var burger = $('[data-o-burger]');
		if (!menu || !burger) { return; }

		function focusables() {
			return $$('a[href], button:not([disabled])', menu).filter(function (el) { return el.offsetParent !== null; });
		}
		function open() {
			menu.removeAttribute('inert');
			menu.classList.add('is-open');
			root.classList.add('o-menu-open');
			root.style.overflow = 'hidden';
			burger.setAttribute('aria-expanded', 'true');
			var first = $('.o-menu__nav a', menu);
			window.setTimeout(function () { (first || menu).focus(); }, 60);
		}
		function close(restoreFocus) {
			menu.classList.remove('is-open');
			menu.setAttribute('inert', '');
			root.classList.remove('o-menu-open');
			root.style.overflow = '';
			burger.setAttribute('aria-expanded', 'false');
			if (restoreFocus) { burger.focus(); }
		}

		burger.addEventListener('click', open);
		menu.addEventListener('click', function (e) {
			var target = e.target.closest('[data-o-menu-close], .o-menu__nav a');
			if (target) { close(target.matches('button')); }
		});
		doc.addEventListener('keydown', function (e) {
			if (!menu.classList.contains('is-open')) { return; }
			if (e.key === 'Escape') { close(true); return; }
			if (e.key === 'Tab') {
				var items = focusables();
				if (!items.length) { return; }
				var first = items[0];
				var last = items[items.length - 1];
				if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
				else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
			}
		});
		window.addEventListener('resize', function () {
			if (window.innerWidth > 1100 && menu.classList.contains('is-open')) { close(false); }
		});
	}

	/* ---------- Menu ativo conforme a seção na tela ---------- */
	function initScrollSpy() {
		if (!hasIO) { return; }
		var links = $$('.o-nav__list a, .o-menu__list a').filter(function (a) {
			return a.hash && a.hash.length > 1 && (a.pathname === window.location.pathname || a.getAttribute('href').charAt(0) === '#');
		});
		if (!links.length) { return; }
		var sections = [];
		links.forEach(function (a) {
			var section = doc.getElementById(decodeURIComponent(a.hash.slice(1)));
			if (section && sections.indexOf(section) === -1) { sections.push(section); }
		});
		var visible = new Set();
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) { visible.add(entry.target); } else { visible.delete(entry.target); }
			});
			var current = null;
			sections.forEach(function (s) { if (visible.has(s)) { current = '#' + s.id; } });
			links.forEach(function (a) {
				if (current && a.hash === current) { a.setAttribute('aria-current', 'true'); } else { a.removeAttribute('aria-current'); }
			});
		}, { rootMargin: '-45% 0px -50% 0px' });
		sections.forEach(function (s) { io.observe(s); });
	}

	/* ---------- Animação de entrada ---------- */
	function initReveal() {
		if (reduceMotion || !hasIO) { return; }
		var selector = [
			'.o-sec:not(.o-hero) .is-style-o-etiqueta',
			'.o-sec:not(.o-hero) .o-title',
			'.o-sec:not(.o-hero) .is-style-o-apoio',
			'.o-check', '.o-card', '.o-step', '.o-stat', '.o-case', '.o-plan',
			'.o-faq__list .wp-block-details', '.o-about__photo', '.o-about__text > p',
			'.o-quote__aside', '.o-form', '.o-problems__end', '.o-method__cta', '.o-filters', '.o-plans__note'
		].join(',');
		var items = $$(selector);
		var groups = new Map();
		items.forEach(function (el) {
			var parent = el.parentElement;
			var index = groups.has(parent) ? groups.get(parent) + 1 : 0;
			groups.set(parent, index);
			el.style.setProperty('--o-delay', Math.min(index, 6) * 0.07 + 's');
			el.classList.add('o-reveal');
		});
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-in');
					io.unobserve(entry.target);
				}
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
		items.forEach(function (el) { io.observe(el); });

		// Segurança: nada fica invisível se o observador falhar (ex.: impressão).
		window.addEventListener('beforeprint', function () {
			items.forEach(function (el) { el.classList.add('is-in'); });
		});
	}

	/* ---------- Letreiro infinito ---------- */
	function initMarquees() {
		$$('.o-marquee').forEach(function (marquee) {
			var originals = $$(':scope > p', marquee);
			if (!originals.length) { return; }
			var track = doc.createElement('div');
			track.className = 'o-marquee__track';
			originals.forEach(function (p) { track.appendChild(p); });
			marquee.appendChild(track);

			var safety = 0;
			while (track.scrollWidth < marquee.offsetWidth * 1.2 && safety < 12) {
				originals.forEach(function (p) {
					var clone = p.cloneNode(true);
					clone.setAttribute('aria-hidden', 'true');
					track.appendChild(clone);
				});
				safety++;
			}
			$$(':scope > p', track).forEach(function (p) {
				var clone = p.cloneNode(true);
				clone.setAttribute('aria-hidden', 'true');
				track.appendChild(clone);
			});
			var seconds = Math.max(18, Math.round((track.scrollWidth / 2) / 55));
			marquee.style.setProperty('--o-marquee-time', seconds + 's');
		});
	}

	/* ---------- Contadores (R$12M+, 4,42x, 320+...) ---------- */
	function initCounters() {
		var nodes = $$('.o-stat__num, .o-case__result');
		if (!nodes.length || reduceMotion || !hasIO) { return; }

		function parse(text) {
			var m = text.match(/^([^\d]*)(\d[\d.,]*)(.*)$/);
			if (!m) { return null; }
			var raw = m[2].replace(/[.,]$/, '');
			var tail = m[2].slice(raw.length) + m[3];
			var decimals = raw.indexOf(',') > -1 ? raw.split(',')[1].length : 0;
			var value = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
			if (isNaN(value)) { return null; }
			return { prefix: m[1], value: value, decimals: decimals, grouping: raw.indexOf('.') > -1, suffix: tail };
		}

		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) { return; }
				io.unobserve(entry.target);
				var el = entry.target;
				var original = el.textContent;
				var info = parse(original.trim());
				if (!info || el.children.length) { return; }
				var formatter = new Intl.NumberFormat('pt-BR', {
					minimumFractionDigits: info.decimals,
					maximumFractionDigits: info.decimals,
					useGrouping: info.grouping
				});
				var start = null;
				var duration = 1500;
				function frame(ts) {
					if (start === null) { start = ts; }
					var t = Math.min(1, (ts - start) / duration);
					var eased = 1 - Math.pow(1 - t, 3);
					el.textContent = info.prefix + formatter.format(info.value * eased) + info.suffix;
					if (t < 1) { window.requestAnimationFrame(frame); } else { el.textContent = original; }
				}
				el.setAttribute('aria-label', original.trim());
				window.requestAnimationFrame(frame);
			});
		}, { threshold: 0.6 });
		nodes.forEach(function (n) { io.observe(n); });
	}

	/* ---------- Checklist de problemas ---------- */
	function initChecklist() {
		$$('.o-checklist').forEach(function (list) {
			var items = $$('.o-check', list);
			if (!items.length) { return; }
			var section = list.closest('.o-sec') || doc;
			var end = $('.o-problems__end', section);
			var score = null;
			var meter = null;
			var label = null;

			if (end) {
				score = doc.createElement('p');
				score.className = 'o-problems__score';
				score.setAttribute('aria-live', 'polite');
				meter = doc.createElement('span');
				meter.className = 'o-meter';
				meter.setAttribute('aria-hidden', 'true');
				items.forEach(function () { meter.appendChild(doc.createElement('i')); });
				label = doc.createElement('span');
				score.appendChild(meter);
				score.appendChild(label);
				var verdict = $('.o-problems__verdict', end);
				var holder = doc.createElement('div');
				end.insertBefore(holder, end.firstChild);
				holder.appendChild(score);
				if (verdict) { holder.appendChild(verdict); }
			}

			function refresh() {
				var count = items.filter(function (i) { return i.classList.contains('is-checked'); }).length;
				if (meter) {
					$$('i', meter).forEach(function (i, idx) { i.classList.toggle('is-on', idx < count); });
				}
				if (label) {
					label.textContent = count + ' de ' + items.length + (count === 1 ? ' marcado' : ' marcados');
				}
			}

			items.forEach(function (item) {
				item.setAttribute('role', 'checkbox');
				item.setAttribute('aria-checked', 'false');
				item.setAttribute('tabindex', '0');
				function toggle() {
					var on = !item.classList.contains('is-checked');
					item.classList.toggle('is-checked', on);
					item.setAttribute('aria-checked', on ? 'true' : 'false');
					refresh();
				}
				item.addEventListener('click', toggle);
				item.addEventListener('keydown', function (e) {
					if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
				});
			});
			refresh();
		});
	}

	/* ---------- Método: etapa em foco ---------- */
	function initSteps() {
		$$('.o-steps').forEach(function (list) {
			var steps = $$('.o-step', list);
			if (!steps.length) { return; }
			var section = list.closest('.o-sec');
			var head = section ? $('.o-method__head', section) : null;
			var meter = null;
			var label = null;

			if (head) {
				var progress = doc.createElement('p');
				progress.className = 'o-method__progress';
				progress.setAttribute('aria-hidden', 'true');
				meter = doc.createElement('span');
				meter.className = 'o-meter';
				steps.forEach(function () { meter.appendChild(doc.createElement('i')); });
				label = doc.createElement('span');
				progress.appendChild(meter);
				progress.appendChild(label);
				head.appendChild(progress);
			}

			function activate(index) {
				steps.forEach(function (s, i) { s.classList.toggle('is-active', i === index); });
				if (meter) { $$('i', meter).forEach(function (i, idx) { i.classList.toggle('is-on', idx <= index); }); }
				if (label) { label.textContent = 'Etapa ' + String(index + 1).padStart(2, '0') + '/' + String(steps.length).padStart(2, '0'); }
			}
			activate(0);
			if (!hasIO) { return; }
			var io = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) { activate(steps.indexOf(entry.target)); }
				});
			}, { rootMargin: '-42% 0px -48% 0px' });
			steps.forEach(function (s) { io.observe(s); });
		});
	}

	/* ---------- Portfólio: filtros ---------- */
	function initPortfolio() {
		$$('[data-o-portfolio]').forEach(function (block) {
			var buttons = $$('.o-filter', block);
			var works = $$('.o-work', block);
			buttons.forEach(function (btn) {
				btn.addEventListener('click', function () {
					var filter = btn.getAttribute('data-filter');
					buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
					works.forEach(function (w) {
						var cats = (w.getAttribute('data-cats') || '').split(' ');
						w.hidden = !(filter === '*' || cats.indexOf(filter) > -1);
					});
					track('olorin_portfolio_filter', { olorin_filter: filter });
				});
			});
		});
	}

	/* ---------- Formulário de orçamento ---------- */
	function formatPhone(value) {
		var d = value.replace(/\D/g, '');
		if (d.length > 11 && d.indexOf('55') === 0) { d = d.slice(2); }
		d = d.slice(0, 11);
		if (d.length <= 2) { return d.length ? '(' + d : ''; }
		if (d.length <= 6) { return '(' + d.slice(0, 2) + ') ' + d.slice(2); }
		if (d.length <= 10) { return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6); }
		return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
	}

	function waUrl(message) {
		var number = String(CFG.whatsapp || '').replace(/\D/g, '');
		return 'https://wa.me/' + number + '?text=' + encodeURIComponent(message || CFG.waMsg || '');
	}

	function initForms() {
		var attribution = readAttribution();

		$$('[data-o-form]').forEach(function (wrap) {
			var form = $('form', wrap);
			var done = $('[data-o-done]', wrap);
			if (!form) { return; }

			// Envio sem JS concluído (volta com ?orcamento=ok)
			if (done && done.hidden && /[?&]orcamento=ok\b/.test(window.location.search)) {
				form.hidden = true;
				done.hidden = false;
			}
			if (done && !done.hidden) {
				track('generate_lead', { olorin_method: 'sem-js' });
				if (window.history && window.history.replaceState) {
					var clean = window.location.href.replace(/([?&])orcamento=(ok|erro)&?/, '$1').replace(/[?&]$/, '').replace(/[?&]#/, '#');
					window.history.replaceState(null, '', clean);
				}
				return;
			}

			var endpoint = form.getAttribute('data-endpoint');
			var openedAt = Date.now();
			var elapsed = doc.createElement('input');
			elapsed.type = 'hidden';
			elapsed.name = 'olorin_tempo';
			form.appendChild(elapsed);
			var status = $('[data-o-status]', form);
			var stepLabel = $('[data-o-steplabel]', form);
			var meterCells = $$('.o-form__progress .o-meter i', form);
			var submit = $('[data-o-submit]', form);
			var started = false;

			ATTR_KEYS.concat(['referencia']).forEach(function (key) {
				var input = form.elements[key];
				if (!input) { return; }
				input.value = key === 'referencia' ? (attribution.ref || '') : (attribution[key] || '');
			});
			if (form.elements.pagina) { form.elements.pagina.value = window.location.href.split('#')[0]; }

			function setStep(n, focus, silent) {
				wrap.setAttribute('data-step', String(n));
				if (stepLabel) { stepLabel.textContent = 'Etapa ' + n + ' de 2'; }
				meterCells.forEach(function (cell, i) { cell.classList.toggle('is-on', i < n * 2); });
				if (focus) {
					var first = $('.o-form__step[data-step="' + n + '"] input:not([type="hidden"]), .o-form__step[data-step="' + n + '"] select', form);
					if (first) { first.focus({ preventScroll: true }); }
					var top = wrap.getBoundingClientRect().top;
					if (top < 0 || top > window.innerHeight * 0.6) { wrap.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); }
				}
				if (!silent) { track('olorin_form_step', { olorin_step: n }); }
			}
			setStep(1, false, true);

			form.addEventListener('focusin', function () {
				if (!started) { started = true; track('olorin_form_start'); }
			});

			var phone = form.elements.whatsapp;
			if (phone) {
				phone.addEventListener('input', function (e) {
					if (e.inputType && e.inputType.indexOf('delete') === 0) { return; }
					phone.value = formatPhone(phone.value);
				});
				phone.addEventListener('blur', function () { phone.value = formatPhone(phone.value); });
			}

			function errorEl(name) { return $('[data-error-for="' + name + '"]', form); }
			function setError(name, message) {
				var field = form.elements[name];
				var box = errorEl(name);
				if (field && field.setAttribute) {
					field.setAttribute('aria-invalid', message ? 'true' : 'false');
					if (box) {
						box.id = box.id || (field.id || name) + '-erro';
						if (message) { field.setAttribute('aria-describedby', box.id); } else { field.removeAttribute('aria-describedby'); }
					}
				}
				if (box) { box.textContent = message || ''; box.hidden = !message; }
			}
			function validate(step) {
				var ok = true;
				var firstBad = null;
				if (step === 1 || step === 'all') {
					var nome = (form.elements.nome.value || '').trim();
					if (nome.length < 2) { setError('nome', 'Conta pra gente seu nome'); ok = false; firstBad = firstBad || form.elements.nome; } else { setError('nome', ''); }
					var digits = (form.elements.whatsapp.value || '').replace(/\D/g, '');
					if (digits.length < 10 || digits.length > 13) { setError('whatsapp', 'Confira o WhatsApp com DDD'); ok = false; firstBad = firstBad || form.elements.whatsapp; } else { setError('whatsapp', ''); }
				}
				if (step === 2 || step === 'all') {
					var consent = form.elements.consentimento;
					if (consent && !consent.checked) { setError('consentimento', 'Precisamos do seu ok para entrar em contato'); ok = false; firstBad = firstBad || consent; } else { setError('consentimento', ''); }
				}
				if (firstBad) { firstBad.focus(); }
				return ok;
			}

			['nome', 'whatsapp'].forEach(function (name) {
				var field = form.elements[name];
				if (field) { field.addEventListener('input', function () { if (field.getAttribute('aria-invalid') === 'true') { setError(name, ''); } }); }
			});
			if (form.elements.consentimento) {
				form.elements.consentimento.addEventListener('change', function () { setError('consentimento', ''); });
			}

			var next = $('[data-o-next]', form);
			if (next) {
				next.addEventListener('click', function () { if (validate(1)) { setStep(2, true); } });
			}
			var back = $('[data-o-back]', form);
			if (back) { back.addEventListener('click', function () { setStep(1, true); }); }

			// Enter no passo 1 avança em vez de enviar
			form.addEventListener('keydown', function (e) {
				if (e.key === 'Enter' && wrap.getAttribute('data-step') === '1' && e.target.tagName === 'INPUT') {
					e.preventDefault();
					if (next) { next.click(); }
				}
			});

			function summaryMessage() {
				var services = $$('input[name="servicos[]"]:checked', form).map(function (i) { return i.value; });
				var parts = ['Oi! Sou ' + (form.elements.nome.value || '').trim() + ' e quero um orçamento.'];
				if (services.length) { parts.push('Preciso de: ' + services.join(', ') + '.'); }
				if (form.elements.investimento && form.elements.investimento.value) { parts.push('Invisto hoje: ' + form.elements.investimento.value + '.'); }
				if (form.elements.site && form.elements.site.value) { parts.push('Site/Instagram: ' + form.elements.site.value + '.'); }
				return parts.join(' ');
			}

			function fail(message) {
				if (!status) { return; }
				status.innerHTML = '';
				status.appendChild(doc.createTextNode((message || 'Não conseguimos enviar agora.') + ' '));
				var a = doc.createElement('a');
				a.href = waUrl(summaryMessage());
				a.target = '_blank';
				a.rel = 'noopener';
				a.textContent = 'Mandar pelo WhatsApp →';
				status.appendChild(a);
			}

			form.addEventListener('submit', function (e) {
				if (!validate(1)) { e.preventDefault(); setStep(1, true); validate(1); return; }
				if (!validate(2)) { e.preventDefault(); return; }
				elapsed.value = String(Math.round((Date.now() - openedAt) / 1000));
				if (!endpoint || !window.fetch || !window.FormData) { return; } // envio tradicional
				e.preventDefault();

				var label = submit ? submit.textContent : '';
				if (submit) { submit.setAttribute('aria-busy', 'true'); submit.textContent = 'Enviando'; }
				if (status) { status.textContent = ''; }

				fetch(endpoint, {
					method: 'POST',
					body: new FormData(form),
					credentials: 'same-origin',
					headers: { Accept: 'application/json' }
				}).then(function (res) {
					return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok, data: data }; });
				}).then(function (result) {
					if (result.ok && result.data && result.data.ok) {
						var services = $$('input[name="servicos[]"]:checked', form).map(function (i) { return i.value; });
						track('generate_lead', {
							olorin_services: services.join(', '),
							olorin_budget: form.elements.investimento ? form.elements.investimento.value : '',
							olorin_plan: form.elements.plano ? form.elements.plano.value : ''
						});
						if (typeof window.fbq === 'function') { window.fbq('track', 'Lead'); }
						var follow = $('[data-o-wa-follow]', wrap);
						if (follow && result.data.whatsapp) { follow.href = result.data.whatsapp; }
						form.hidden = true;
						if (done) {
							done.hidden = false;
							done.focus({ preventScroll: true });
							wrap.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
						}
						return;
					}
					var data = result.data || {};
					if (data.fields) {
						Object.keys(data.fields).forEach(function (name) { setError(name, data.fields[name]); });
						if (data.fields.nome || data.fields.whatsapp) { setStep(1, true); }
					}
					fail(data.message);
				}).catch(function () {
					fail('Sem conexão no momento.');
				}).then(function () {
					if (submit) { submit.removeAttribute('aria-busy'); submit.textContent = label; }
				});
			});
		});
	}

	/* ---------- Links "Quero esse" (planos) ---------- */
	function initPlanLinks() {
		doc.addEventListener('click', function (e) {
			var link = e.target.closest('a[data-plano]');
			if (!link) { return; }
			var plan = link.getAttribute('data-plano');
			$$('[data-o-form] input[name="plano"]').forEach(function (input) { input.value = plan; });
			track('olorin_cta_click', { olorin_location: 'planos', olorin_label: plan });
		});
	}

	/* ---------- Cliques em WhatsApp e CTAs ---------- */
	function initClickTracking() {
		doc.addEventListener('click', function (e) {
			var link = e.target.closest('a');
			if (!link || !link.href) { return; }
			if (/(^|\/\/)(wa\.me|api\.whatsapp\.com)/.test(link.href)) {
				track('olorin_whatsapp_click', { olorin_location: locationOf(link) });
				if (typeof window.fbq === 'function') { window.fbq('track', 'Contact'); }
			} else if (link.hash === '#orcamento' && !link.hasAttribute('data-plano')) {
				track('olorin_cta_click', { olorin_location: locationOf(link), olorin_label: (link.textContent || '').trim().slice(0, 60) });
			}
		});
	}

	/* ---------- Botão flutuante e barra do celular ---------- */
	function initFloats() {
		var float = $('[data-o-float]');
		var bar = $('[data-o-mobilebar]');
		var quote = doc.getElementById('orcamento');
		if (!float && !bar) { return; }
		var ticking = false;

		function update() {
			ticking = false;
			var y = window.scrollY;
			if (float) {
				float.classList.toggle('is-away', y < 320);
				var r = float.getBoundingClientRect();
				var el = doc.elementFromPoint(Math.max(0, r.left - 12), r.top + r.height / 2);
				var tinted = el && el.closest('.has-violeta-background-color, .has-verde-background-color');
				float.classList.toggle('is-alt', !!tinted);
			}
			if (bar && quote) {
				var q = quote.getBoundingClientRect();
				bar.classList.toggle('is-away', q.top < window.innerHeight * 0.7 && q.bottom > 0);
			}
		}
		window.addEventListener('scroll', function () {
			if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
		}, { passive: true });
		window.addEventListener('resize', update);
		update();
	}

	/* ---------- Cursor de estrela ---------- */
	function initCursor() {
		var cursor = $('[data-o-cursor]');
		if (!cursor || !CFG.cursor || !finePointer || reduceMotion) { return; }
		root.classList.add('o-has-cursor');

		var x = -100, y = -100, cx = -100, cy = -100, scale = 1, target = 1, raf = null;
		var textual = 'input:not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable]';
		var interactive = 'a, button, summary, label, .o-check, [role="button"], input[type="checkbox"]';

		// Cor da estrela conforme o fundo sob o ponteiro (regras da marca: nada de verde sobre violeta).
		function colorFor(el) {
			if (!el || !el.closest) { return ''; }
			if (el.closest('.o-card')) { return '#000'; }
			if (el.closest('.o-check, .o-work')) { return '#fff'; }
			while (el && el !== doc.documentElement) {
				var bg = window.getComputedStyle(el).backgroundColor || '';
				var m = bg.match(/[\d.]+/g);
				if (m && m.length >= 3 && (m.length < 4 || parseFloat(m[3]) > 0.5)) {
					var r = +m[0], g = +m[1], b = +m[2];
					if (r > 200 && g > 230 && b < 120) { return '#000'; }
					if (b > 180 && g < 110 && r < 170) { return '#fff'; }
					return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.6 ? '#7e3bed' : '';
				}
				el = el.parentElement;
			}
			return '';
		}

		function loop() {
			cx += (x - cx) * 0.35;
			cy += (y - cy) * 0.35;
			scale += (target - scale) * 0.25;
			cursor.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0) scale(' + scale.toFixed(3) + ') rotate(' + ((x - cx) * 0.6).toFixed(1) + 'deg)';
			if (Math.abs(x - cx) > 0.2 || Math.abs(y - cy) > 0.2 || Math.abs(target - scale) > 0.01) {
				raf = window.requestAnimationFrame(loop);
			} else {
				raf = null;
			}
		}

		window.addEventListener('mousemove', function (e) {
			x = e.clientX;
			y = e.clientY;
			if (!raf) { raf = window.requestAnimationFrame(loop); }
		}, { passive: true });

		doc.addEventListener('mouseover', function (e) {
			var el = e.target;
			if (el.closest && el.closest(textual)) {
				cursor.classList.remove('is-visible');
				return;
			}
			cursor.classList.add('is-visible');
			target = el.closest && el.closest(interactive) ? 1.9 : 1;
			cursor.style.setProperty('--o-cursor-color', colorFor(el) || 'var(--o-lime)');
		});
		doc.addEventListener('mouseleave', function () { cursor.classList.remove('is-visible'); });
		window.addEventListener('blur', function () { cursor.classList.remove('is-visible'); });
	}

	/* ---------- Cookies (LGPD) + Meta Pixel ---------- */
	function loadPixel() {
		var id = String(CFG.pixelId || '');
		if (!id || window.fbq) { return; }
		/* eslint-disable */
		!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
		/* eslint-enable */
		window.fbq('init', id);
		window.fbq('track', 'PageView');
	}

	function initConsent() {
		if (!CFG.hasConsent) { return; }
		var banner = $('[data-o-cookies]');
		var choice = null;
		try { choice = localStorage.getItem('olorin_consent'); } catch (e) { choice = null; }

		function apply(granted) {
			var state = granted ? 'granted' : 'denied';
			if (typeof window.gtag === 'function') {
				window.gtag('consent', 'update', { ad_storage: state, analytics_storage: state, ad_user_data: state, ad_personalization: state });
			}
			track('olorin_consent', { olorin_consent: state });
			if (granted) { loadPixel(); }
		}
		function decide(granted) {
			try { localStorage.setItem('olorin_consent', granted ? 'granted' : 'denied'); } catch (e) { /* sem storage */ }
			apply(granted);
			if (banner) { banner.hidden = true; }
		}

		if (choice === 'granted') { loadPixel(); }
		if (banner) {
			if (!choice) { window.setTimeout(function () { banner.hidden = false; }, 1200); }
			var accept = $('[data-o-cookies-accept]', banner);
			var reject = $('[data-o-cookies-reject]', banner);
			if (accept) { accept.addEventListener('click', function () { decide(true); }); }
			if (reject) { reject.addEventListener('click', function () { decide(false); }); }
		}
		$$('[data-o-cookies-open]').forEach(function (btn) {
			btn.addEventListener('click', function () { if (banner) { banner.hidden = false; var a = $('[data-o-cookies-accept]', banner); if (a) { a.focus(); } } });
		});
	}

	/* ---------- Início ---------- */
	function boot() {
		var steps = [initHeader, initMenu, initScrollSpy, initMarquees, initReveal, initCounters, initChecklist, initSteps, initPortfolio, initForms, initPlanLinks, initClickTracking, initFloats, initCursor, initConsent];
		steps.forEach(function (fn) {
			try { fn(); } catch (err) {
				if (window.console) { window.console.error('[olorin]', fn.name, err); }
			}
		});
	}

	if (doc.readyState === 'loading') {
		doc.addEventListener('DOMContentLoaded', boot);
	} else {
		boot();
	}
})();
