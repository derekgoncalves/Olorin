/* Movimento: entrada do banner (título palavra por palavra), revelação na rolagem
   (títulos com máscara, janelas que abrem, cartões em cascata) e transição entre páginas.
   O CSS fica em src/styles/animacoes.css. A página de educação fica de fora. */
import { $, $$, doc, raiz, temIO, movimentoReduzido } from '../util.js';
import { iniciarRevelar } from './interacoes.js';

const educacao = !!$('link[rel="canonical"][href*="/educacao/"]');
const pausado = () => raiz.classList.contains('o-pausado');
/* Banners: o que está neles entra pelo CSS ao carregar, não pela rolagem. */
const ENTRADA = '.o-hero, .o-pagina-topo, .o-promo-topo, .o-erro, .o-obrigado__janela';
const ALVOS =
	'.o-etiqueta, .o-titulo, .o-janela, .o-check, .o-card-servico, .o-etapa, .o-numero, .o-case, .o-plano, .o-faq__item, .o-pessoa, .o-entrega, .o-dor, .o-passo, .o-painel, .o-calc, .o-trabalho, .o-depoimento, .o-combinacao';

/* Quebra o texto em palavras sem mudar o que é lido: os espaços continuam como nós de texto
   e o leitor de tela lê a mesma frase. Devolve quantas palavras animam (no máximo 11). */
function dividir(el) {
	const nos = [];
	const andar = doc.createTreeWalker(el, 4);
	while (andar.nextNode()) nos.push(andar.currentNode);
	let i = 0;
	nos.forEach((no) => {
		const f = doc.createDocumentFragment();
		no.nodeValue.split(/(\s+)/).forEach((parte) => {
			if (!parte) return;
			if (/^\s/.test(parte)) {
				f.appendChild(doc.createTextNode(parte));
				return;
			}
			const s = doc.createElement('span');
			s.className = 'o-mov-p';
			s.style.setProperty('--i', Math.min(i++, 10));
			s.textContent = parte;
			f.appendChild(s);
		});
		no.parentNode.replaceChild(f, no);
	});
	el.classList.add('o-mov-dividido');
	return Math.min(i, 11);
}

/* Depois da animação, devolve o texto original (sem os spans). */
function juntar(el, ms) {
	window.setTimeout(() => {
		$$('.o-mov-p', el).forEach((s) => s.replaceWith(s.textContent));
		el.normalize();
		el.classList.remove('o-mov-dividido');
	}, ms);
}

/* Transição entre páginas: o CSS liga; aqui só se pula quando o visitante pausou
   as animações ou quando a navegação sai da página de educação ou vai para ela. */
function transicao() {
	window.addEventListener('pageswap', (e) => {
		if (!e.viewTransition) return;
		let destino = '';
		try {
			destino = new URL(e.activation.entry.url).pathname;
		} catch (erro) {
			/* sem destino conhecido */
		}
		if (educacao || pausado() || /^\/educacao(\/|$)/.test(destino)) e.viewTransition.skipTransition();
	});
}

/* Imediato: título do banner palavra por palavra, só se a animação dele ainda não começou
   (assim nunca há "pulo"; sem JS a tempo, o título sobe inteiro pelo CSS). */
export function iniciarMovimento() {
	transicao();
	if (educacao || movimentoReduzido) return;
	$$('.o-hero__titulo, .o-pagina-topo__titulo').forEach((h) => {
		const a = h.getAnimations ? h.getAnimations()[0] : null;
		if (!a || a.currentTime > a.effect.getTiming().delay) return;
		dividir(h);
		juntar(h, 1800);
	});
	/* Depois da entrada, as regras do banner saem de cena (pausar e retomar não repete a entrada). */
	window.setTimeout(() => raiz.classList.add('o-mov-fim'), 2400);
}

/* Quando livre: revelação na rolagem (substitui iniciarRevelar; na educação continua o antigo). */
export function iniciarRevelarMovimento() {
	if (educacao) {
		iniciarRevelar();
		return;
	}
	if (movimentoReduzido || !temIO) return;
	window.requestAnimationFrame(() => {
		const main = $('.o-main') || doc.body;
		const altura = window.innerHeight;
		const itens = [];
		/* 1º só lê (posição), depois escreve: sem leitura e escrita intercaladas. */
		$$(ALVOS, main).forEach((el) => {
			if (el.closest(ENTRADA) || el.getBoundingClientRect().top <= altura) return;
			if (el.matches('.o-janela') && el.querySelector('form')) return;
			const pai = el.parentElement.closest(ALVOS);
			if (pai && itens.indexOf(pai) > -1) return;
			itens.push(el);
		});
		const grupos = new Map();
		itens.forEach((el) => {
			const p = el.parentElement;
			const k = grupos.has(p) ? grupos.get(p) + 1 : 0;
			grupos.set(p, k);
			el.style.setProperty('--atraso', Math.min(k, 6) * 70 + 'ms');
			el.classList.add(el.matches('.o-titulo') ? 'o-mov-titulo' : el.matches('.o-etiqueta') ? 'o-mov-mascara' : el.matches('.o-janela') ? 'o-mov-jan' : 'o-reveal');
		});
		raiz.classList.add('o-mov');
		const io = new IntersectionObserver(
			(entradas) => {
				entradas.forEach((en) => {
					if (!en.isIntersecting) return;
					const el = en.target;
					io.unobserve(el);
					if (el.classList.contains('o-mov-titulo') && !pausado()) {
						juntar(el, (parseFloat(el.style.getPropertyValue('--atraso')) || 0) + dividir(el) * 45 + 900);
					}
					el.classList.add('is-in');
				});
			},
			{ rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
		);
		itens.forEach((el) => io.observe(el));
		window.addEventListener('beforeprint', () => itens.forEach((el) => el.classList.add('is-in')));
	});
}
