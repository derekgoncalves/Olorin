/* Componentes interativos: checklist, método, portfólio, FAQ, calculadora, planos, faixas e contadores. */
import { $, $$, doc, temIO, movimentoReduzido, lerArmazenamento, gravarArmazenamento, raiz, abaixoDaDobra, linkWhatsApp } from '../util.js';
import { track } from './rastreamento.js';

/* Checklist de dores: botões com aria-pressed; a partir de 2 marcados aparece a resposta. */
export function iniciarChecklist() {
	$$('[data-o-checklist]').forEach((lista) => {
		const secao = lista.closest('section') || doc;
		const botoes = $$('[data-o-check]', lista);
		const contador = $('[data-o-check-contador]', secao);
		const rotulo = $('[data-o-check-rotulo]', secao);
		const celulas = contador ? $$('.o-medidor i', contador) : [];
		const padrao = $('[data-o-check-padrao]', secao);
		const solucao = $('[data-o-check-solucao]', secao);
		function atualizar() {
			const n = botoes.filter((b) => b.getAttribute('aria-pressed') === 'true').length;
			celulas.forEach((c, i) => c.classList.toggle('is-on', i < n));
			if (rotulo && contador) {
				rotulo.textContent = n + ' de ' + botoes.length + ' ' + (n === 1 ? contador.getAttribute('data-um') : contador.getAttribute('data-varios'));
			}
			const resolve = n >= 2;
			if (solucao) solucao.hidden = !resolve;
			if (padrao) padrao.hidden = resolve;
		}
		botoes.forEach((b) => b.addEventListener('click', () => {
			b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
			atualizar();
		}));
		atualizar();
	});
}

/* Método: destaca a etapa em foco durante a rolagem. */
export function iniciarMetodo() {
	$$('[data-o-etapas]').forEach((lista) => {
		const etapas = $$('.o-etapa', lista);
		const secao = lista.closest('section');
		const progresso = secao ? $('[data-o-metodo-progresso]', secao) : null;
		const celulas = progresso ? $$('.o-medidor i', progresso) : [];
		const rotulo = progresso ? $('[data-o-metodo-rotulo]', progresso) : null;
		function ativar(i) {
			etapas.forEach((e, k) => e.classList.toggle('is-ativa', k === i));
			celulas.forEach((c, k) => c.classList.toggle('is-on', k <= i));
			if (rotulo) rotulo.textContent = 'Etapa ' + String(i + 1).padStart(2, '0') + '/' + String(etapas.length).padStart(2, '0');
		}
		ativar(0);
		if (!temIO) return;
		const io = new IntersectionObserver((entradas) => {
			entradas.forEach((en) => {
				if (en.isIntersecting) ativar(etapas.indexOf(en.target));
			});
		}, { rootMargin: '-42% 0px -48% 0px' });
		etapas.forEach((e) => io.observe(e));
	});
}

/* Portfólio: filtros com aria-pressed (os botões só aparecem com JS). */
export function iniciarPortfolio() {
	const filtros = $('[data-o-filtros]');
	const lista = $('[data-o-trabalhos]');
	if (!filtros || !lista) return;
	filtros.hidden = false;
	const botoes = $$('[data-filtro]', filtros);
	const itens = $$('.o-trabalho', lista);
	botoes.forEach((b) => b.addEventListener('click', () => {
		const f = b.getAttribute('data-filtro');
		botoes.forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
		itens.forEach((it) => {
			it.hidden = !(f === '*' || (it.getAttribute('data-categorias') || '').split(' ').indexOf(f) > -1);
		});
	}));
}

/* FAQ: evento ao abrir e abertura pelo endereço (#faq-...). */
export function iniciarFaq() {
	$$('[data-o-faq]').forEach((d) => {
		d.addEventListener('toggle', () => {
			if (d.open) track('faq_open', { pergunta_id: d.getAttribute('data-o-faq') });
		});
	});
	const alvo = window.location.hash && doc.getElementById(decodeURIComponent(window.location.hash.slice(1)));
	if (alvo && alvo.tagName === 'DETAILS') alvo.open = true;
}

/* Calculadora da home, em forma de bilhete de orçamento (sem nenhum valor): cada escolha vai para a
   linha dela no bilhete e para a mensagem do botão do WhatsApp (uma resposta por linha e
   " [ref: calculadora]" no fim). Sem JS, o botão já leva a uma mensagem genérica. */
export function iniciarCalculadora() {
	const calc = $('[data-o-calc]');
	if (!calc) return;
	const form = $('[data-o-calc-form]', calc);
	const papel = $('[data-o-calc-papel]', calc);
	const botao = $('[data-o-calc-botao]', calc);
	if (!form || !papel) return;
	const inicio = calc.getAttribute('data-mensagem') || '';
	const fim = calc.getAttribute('data-mensagem-fim') || '';
	let usou = false;
	function escolhas() {
		return $$('fieldset', form)
			.map((grupo) => {
				const marcada = $('input:checked', grupo);
				return marcada ? { id: marcada.name.replace('calc-', ''), rotulo: grupo.getAttribute('data-rotulo') || '', valor: marcada.value } : null;
			})
			.filter(Boolean);
	}
	function atualizar(registrar) {
		const lista = escolhas();
		lista.forEach((e) => {
			const linha = $('[data-o-calc-linha="' + e.id + '"]', papel);
			if (linha) linha.textContent = e.valor;
		});
		if (botao) {
			const linhas = lista.map((e) => '- ' + e.rotulo + ': ' + e.valor);
			botao.href = linkWhatsApp([inicio].concat(linhas, fim ? [fim] : []).join('\n'), 'calculadora');
		}
		if (registrar) {
			papel.classList.remove('is-impresso');
			void papel.offsetWidth;
			papel.classList.add('is-impresso');
			const dados = { escolhas: lista.map((e) => e.valor).join(' | '), primeira_vez: !usou };
			lista.forEach((e) => {
				dados[e.id] = e.valor;
			});
			track('calculator_use', dados);
			usou = true;
		}
	}
	form.addEventListener('change', () => atualizar(true));
	atualizar(false);
}

/* "Quero esse": preenche o plano no formulário e pré-seleciona os serviços. */
export function iniciarPlanos() {
	doc.addEventListener('click', (e) => {
		const link = e.target.closest('[data-o-plano]');
		if (!link || !link.matches('a')) return;
		const plano = link.getAttribute('data-o-plano');
		const servicos = (link.getAttribute('data-servicos') || '').split(' ').filter(Boolean);
		$$('[data-o-form] input[name="plano"]').forEach((i) => {
			i.value = plano;
		});
		const destino = $('#form-fim') || $('[data-o-form]');
		if (destino && servicos.length) {
			$$('input[name="servicos[]"]', destino).forEach((c) => {
				c.checked = servicos.indexOf(c.getAttribute('data-servico')) > -1;
			});
			destino.dispatchEvent(new CustomEvent('o-servicos'));
		}
		track('pricing_plan_click', { plano });
	});
}

/* Faixas animadas: duplica os itens para o letreiro não ter buraco. Cada faixa é medida quando
   chega perto da tela (lê medidas uma vez, depois escreve). */
export function iniciarFaixas() {
	const faixas = $$('[data-o-faixa]');
	if (!faixas.length || movimentoReduzido) return;
	if (!temIO) {
		window.requestAnimationFrame(() => completarFaixas(faixas));
		return;
	}
	const io = new IntersectionObserver(
		(entradas) => {
			const perto = entradas.filter((en) => en.isIntersecting).map((en) => en.target);
			perto.forEach((f) => io.unobserve(f));
			if (perto.length) completarFaixas(perto);
		},
		{ rootMargin: '300px 0px' },
	);
	faixas.forEach((f) => io.observe(f));
}

function completarFaixas(faixas) {
	const medidas = faixas.map((f) => {
		const trilho = $('.o-faixa__trilho', f);
		return { f, trilho, largura: trilho.scrollWidth, tela: f.clientWidth };
	});
	medidas.forEach(({ f, trilho, largura, tela }) => {
		if (!largura) return;
		const originais = $$('li', trilho);
		const conjuntos = Math.max(1, Math.ceil(tela / largura));
		const fragmento = doc.createDocumentFragment();
		for (let i = 1; i < conjuntos * 2; i++) {
			originais.forEach((li) => {
				const c = li.cloneNode(true);
				c.setAttribute('aria-hidden', 'true');
				fragmento.appendChild(c);
			});
		}
		trilho.appendChild(fragmento);
		f.style.setProperty('--letreiro-tempo', Math.max(18, Math.round((largura * conjuntos) / 55)) + 's');
	});
}

/* Botão "Pausar animações" (WCAG 2.2.2): vale para o site todo e fica lembrado. */
export function iniciarPausa() {
	const botoes = $$('[data-o-pausar]');
	function aplicar(pausado) {
		raiz.classList.toggle('o-pausado', pausado);
		botoes.forEach((b) => {
			b.setAttribute('aria-pressed', pausado ? 'true' : 'false');
			const t = $('[data-o-pausar-texto]', b) || b;
			t.textContent = pausado ? 'Retomar animações' : 'Pausar animações';
		});
	}
	aplicar(!!lerArmazenamento('localStorage', 'olorin_pausado'));
	botoes.forEach((b) => b.addEventListener('click', () => {
		const pausado = !raiz.classList.contains('o-pausado');
		gravarArmazenamento('localStorage', 'olorin_pausado', pausado || null);
		aplicar(pausado);
	}));
}

/* Contadores dos números ("+ de R$ 5M", "50+"): só a parte numérica anima, o texto em volta fica; leitores de tela leem o valor final. */
export function iniciarContadores() {
	const nos = $$('[data-o-contador]');
	if (!nos.length || movimentoReduzido || !temIO) return;
	const io = new IntersectionObserver((entradas) => {
		entradas.forEach((en) => {
			if (!en.isIntersecting) return;
			io.unobserve(en.target);
			const el = en.target;
			const original = el.textContent.trim();
			const m = /^([^\d]*)(\d[\d.,]*)(.*)$/.exec(original);
			if (!m) return;
			const bruto = m[2].replace(/[.,]$/, '');
			const casas = bruto.indexOf(',') > -1 ? bruto.split(',')[1].length : 0;
			const valor = parseFloat(bruto.replace(/\./g, '').replace(',', '.'));
			if (isNaN(valor)) return;
			const fmt = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas, useGrouping: bruto.indexOf('.') > -1 });
			el.textContent = '';
			const visivel = doc.createElement('span');
			visivel.setAttribute('aria-hidden', 'true');
			const leitor = doc.createElement('span');
			leitor.className = 'o-sr';
			leitor.textContent = original;
			el.appendChild(visivel);
			el.appendChild(leitor);
			let inicio = null;
			function quadro(ts) {
				if (inicio === null) inicio = ts;
				const t = Math.min(1, (ts - inicio) / 1400);
				visivel.textContent = m[1] + fmt.format(valor * (1 - Math.pow(1 - t, 3))) + m[3];
				if (t < 1) window.requestAnimationFrame(quadro);
				else el.textContent = original;
			}
			window.requestAnimationFrame(quadro);
		});
	}, { threshold: 0.6 });
	nos.forEach((n) => io.observe(n));
}

/* Entrada suave: só em elementos abaixo da dobra (nada some depois de aparecer, sem pulo de layout). */
export function iniciarRevelar() {
	if (movimentoReduzido || !temIO) return;
	const seletor = '.o-sec:not(.o-hero) .o-titulo, .o-check, .o-card-servico, .o-etapa, .o-numero, .o-case, .o-plano, .o-faq__item, .o-pessoa, .o-entrega, .o-dor, .o-passo, .o-painel, .o-calc';
	window.requestAnimationFrame(() => {
		const itens = abaixoDaDobra($$(seletor));
		const grupos = new Map();
		itens.forEach((el) => {
			const pai = el.parentElement;
			const i = grupos.has(pai) ? grupos.get(pai) + 1 : 0;
			grupos.set(pai, i);
			el.style.setProperty('--atraso', Math.min(i, 6) * 0.07 + 's');
			el.classList.add('o-reveal');
		});
		const io = new IntersectionObserver((entradas) => {
			entradas.forEach((en) => {
				if (en.isIntersecting) {
					en.target.classList.add('is-in');
					io.unobserve(en.target);
				}
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
		itens.forEach((el) => io.observe(el));
		window.addEventListener('beforeprint', () => itens.forEach((el) => el.classList.add('is-in')));
	});
}
