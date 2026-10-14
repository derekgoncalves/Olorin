/* Cliques em CTAs, WhatsApp e cards de serviço; profundidade de rolagem; seções vistas; lead na /obrigado/. */
import { $, $$, doc, CONFIG, temIO, origemWhatsApp, lerArmazenamento, gravarArmazenamento } from '../util.js';
import { track } from './rastreamento.js';
import { converter } from './consentimento.js';

export function iniciarCliques() {
	doc.addEventListener('click', (e) => {
		const link = e.target.closest('a, button');
		if (!link) return;
		const href = link.getAttribute('href') || '';
		if (/^https:\/\/wa\.me\//.test(href)) {
			const origem = origemWhatsApp(href);
			track('whatsapp_click', { origem, servico: link.getAttribute('data-servico') || (CONFIG.slug || '').replace(/^(servico|promo)-/, '') });
			converter('whatsapp', { origem });
		}
		const id = link.id && link.id.indexOf('cta-') === 0 ? link.id : link.getAttribute('data-cta');
		if (id) {
			const secao = link.closest('[data-secao], header, footer, nav, aside');
			track('cta_click', {
				cta_id: id,
				cta_label: (link.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
				cta_position: secao ? secao.getAttribute('data-secao') || secao.tagName.toLowerCase() : 'pagina',
				destino: href.indexOf('wa.me') > -1 ? 'whatsapp' : href,
			});
		}
		const card = link.getAttribute('data-o-card-servico');
		if (card) track('service_card_click', { servico: card });
	});
}

export function iniciarRolagem() {
	const marcos = [25, 50, 75, 90];
	const feitos = {};
	let agendado = false;
	function medir() {
		agendado = false;
		const total = doc.documentElement.scrollHeight - window.innerHeight;
		if (total <= 0) return;
		const pct = (window.scrollY / total) * 100;
		marcos.forEach((m) => {
			if (pct >= m && !feitos[m]) {
				feitos[m] = true;
				track('scroll_depth', { percent: m });
			}
		});
	}
	window.addEventListener('scroll', () => {
		if (!agendado) {
			agendado = true;
			window.requestAnimationFrame(medir);
		}
	}, { passive: true });
}

export function iniciarSecoes() {
	if (!temIO) return;
	const vistos = new Set();
	const io = new IntersectionObserver((entradas) => {
		entradas.forEach((en) => {
			const nome = en.target.getAttribute('data-secao');
			if (en.isIntersecting && !vistos.has(nome)) {
				vistos.add(nome);
				track('section_view', { secao: nome });
				io.unobserve(en.target);
			}
		});
	}, { threshold: 0.4 });
	$$('[data-secao]').forEach((s) => io.observe(s));
}

/* /obrigado/: link de agenda (do build ou do olorin-ids.js) e generate_lead uma única vez por envio
   (token guardado na sessão). */
export function iniciarObrigado() {
	if (!$('[data-o-obrigado]')) return;
	const agenda = $('[data-o-agendar]');
	const url = CONFIG.agendamento || '';
	if (agenda && /^https:\/\/[^\s"'<>]+$/.test(url)) {
		const link = $('a', agenda);
		link.href = url;
		link.target = '_blank';
		link.rel = 'noopener';
		agenda.hidden = false;
	}
	const pendente = lerArmazenamento('sessionStorage', 'olorin_lead_pendente');
	const feitos = lerArmazenamento('sessionStorage', 'olorin_leads_registrados') || [];
	if (!pendente || feitos.indexOf(pendente.token) > -1) return;
	const lead = {
		plano: pendente.plano || '',
		servicos: pendente.servicos || '',
		verba_faixa: pendente.verba_faixa || '',
		servico_pagina: pendente.servico_pagina || '',
		posicao: pendente.posicao || '',
	};
	track('generate_lead', lead);
	converter('lead', lead);
	feitos.push(pendente.token);
	gravarArmazenamento('sessionStorage', 'olorin_leads_registrados', feitos);
	gravarArmazenamento('sessionStorage', 'olorin_lead_pendente', null);
}
