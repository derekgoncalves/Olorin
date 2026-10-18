/**
 * LP Olorin Educação (/educacao/). Só roda com body.o-tema-educacao; tudo é melhoria progressiva.
 * - Calendário: põe o "Você está aqui" no mês de quem visita (sem JS, vale o mês do build).
 * - Entradas na rolagem (chamada, título de giz, calendário e fichas): só no que está abaixo da dobra.
 * - Depois da entrada do banner, o boletim passa a "respirar" (html.o-edu-entrou).
 * - Desktop (mouse, sem "reduzir movimento"): o quadriculado acende perto do ponteiro, o lápis pinta
 *   os quadradinhos vazios do fundo e a lousa do calendário ganha rastro de apagador. Nada disso roda
 *   pausado. Os flashes do raio-x (fim da página) são só CSS.
 * Visual em src/styles/componentes/educacao.css.
 */
import { $, $$, doc, raiz, movimentoReduzido, ponteiroFino, temIO } from '../util.js';

const pausado = () => raiz.classList.contains('o-pausado');
/* O lápis só pinta o papel vazio: nunca por baixo de texto, botão, campo ou janela. */
const OCUPADO = 'a, button, input, label, select, textarea, summary, p, li, h1, h2, h3, figure, form, .o-janela, .o-form';
const LIMITE_LAPIS = 40;
const LIMITE_APAGADOR = 18;

function marcarMes() {
	const calendario = $('[data-o-edu-calendario]');
	if (!calendario) return;
	const mes = new Date().getMonth() + 1;
	const meses = $$('[data-mes]', calendario);
	const atual = meses.filter((li) => Number(li.getAttribute('data-mes')) === mes)[0];
	const etiqueta = $('[data-o-edu-aqui]', calendario);
	const fora = $('[data-o-edu-fora]', calendario);
	meses.forEach((li) => {
		if (li !== atual) li.removeAttribute('aria-current');
	});
	if (atual) {
		atual.setAttribute('aria-current', 'date');
		if (etiqueta) {
			if (etiqueta.parentElement !== atual) atual.appendChild(etiqueta);
			etiqueta.hidden = false;
		}
		if (fora) fora.hidden = true;
	} else {
		if (etiqueta) etiqueta.hidden = true;
		if (fora) fora.hidden = false;
	}
}

/* Peças que começam abaixo da dobra. Mede primeiro a seção do <main> e só mede a peça quando a
   seção já começa dentro da tela, para não obrigar o navegador a desenhar seções que ele ainda
   deixou de lado (content-visibility). */
function abaixoDaTela(elementos, limite) {
	const topos = new Map();
	return elementos.filter((el) => {
		const secao = el.closest('.o-main > *');
		if (secao && secao !== el) {
			if (!topos.has(secao)) topos.set(secao, secao.getBoundingClientRect().top);
			if (topos.get(secao) > limite) return true;
		}
		return el.getBoundingClientRect().top > limite;
	});
}

function iniciarEntradas() {
	if (movimentoReduzido || !temIO || pausado()) return;
	/* Primeiro só lê as posições; depois escreve as classes. */
	const abaixo = abaixoDaTela($$('[data-o-edu-entra]'), window.innerHeight * 0.92);
	if (!abaixo.length) return;
	abaixo.forEach((el) => el.classList.add('o-edu-espera'));
	const io = new IntersectionObserver(
		(entradas) => {
			entradas.forEach((en) => {
				if (!en.isIntersecting) return;
				const el = en.target;
				io.unobserve(el);
				el.classList.add('is-visto');
				/* Terminada a entrada, a peça volta a ser comum (o hover usa as próprias transições). */
				window.setTimeout(() => el.classList.remove('o-edu-espera'), 2600);
			});
		},
		{ rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
	);
	abaixo.forEach((el) => io.observe(el));
}

/* Acompanha o ponteiro numa seção e chama "aoMover" no máximo uma vez por quadro. */
function seguir(secao, alvo, aoMover) {
	let pedido = 0;
	let ex = 0;
	let ey = 0;
	let sob = null;
	secao.addEventListener(
		'pointermove',
		(e) => {
			if (e.pointerType && e.pointerType !== 'mouse') return;
			ex = e.clientX;
			ey = e.clientY;
			sob = e.target;
			if (pedido) return;
			pedido = window.requestAnimationFrame(() => {
				pedido = 0;
				if (pausado()) return;
				const r = alvo.getBoundingClientRect();
				aoMover(ex - r.left, ey - r.top, sob);
			});
		},
		{ passive: true },
	);
}

function soltar(pai, el, limite) {
	if (pai.querySelectorAll('.o-edu-lapis-q, .o-edu-apagado').length >= limite) return;
	let feito = false;
	const tirar = () => {
		if (feito) return;
		feito = true;
		el.remove();
	};
	el.addEventListener('animationend', tirar, { once: true });
	window.setTimeout(tirar, 4000);
	pai.appendChild(el);
}

function iniciarQuadriculado() {
	$$('.o-edu-fundo').forEach((fundo) => {
		const secao = fundo.parentElement;
		const lapis = fundo.hasAttribute('data-o-edu-lapis');
		const q = parseFloat(window.getComputedStyle(fundo).getPropertyValue('--edu-q')) || 32;
		let ultima = '';
		seguir(secao, fundo, (x, y, sob) => {
			fundo.style.setProperty('--mx', Math.round(x) + 'px');
			fundo.style.setProperty('--my', Math.round(y) + 'px');
			if (!lapis || (sob && sob.closest && sob.closest(OCUPADO))) return;
			const col = Math.floor(x / q);
			const lin = Math.floor(y / q);
			const chave = col + ':' + lin;
			if (chave === ultima) return;
			ultima = chave;
			const quadrado = doc.createElement('i');
			quadrado.className = 'o-edu-lapis-q';
			quadrado.style.left = col * q + 'px';
			quadrado.style.top = lin * q + 'px';
			soltar(fundo, quadrado, LIMITE_LAPIS);
		});
		secao.addEventListener('pointerenter', (e) => {
			if (e.pointerType === 'mouse' && !pausado()) fundo.classList.add('is-perto');
		});
		secao.addEventListener('pointerleave', () => {
			fundo.classList.remove('is-perto');
			ultima = '';
		});
	});
}

function iniciarApagador() {
	$$('[data-o-edu-apagador]').forEach((po) => {
		const secao = po.parentElement;
		let px = null;
		let py = null;
		seguir(secao, po, (x, y) => {
			if (px === null) {
				px = x;
				py = y;
				return;
			}
			const dx = x - px;
			const dy = y - py;
			if (dx * dx + dy * dy < 36 * 36) return;
			px = x;
			py = y;
			const marca = doc.createElement('span');
			marca.className = 'o-edu-apagado';
			marca.style.left = Math.round(x) + 'px';
			marca.style.top = Math.round(y) + 'px';
			marca.style.setProperty('--r', Math.round((Math.atan2(dy, dx) * 180) / Math.PI) + 'deg');
			soltar(po, marca, LIMITE_APAGADOR);
		});
		secao.addEventListener('pointerleave', () => {
			px = null;
		});
	});
}

export function iniciarEducacao() {
	if (!doc.body || !doc.body.classList.contains('o-tema-educacao')) return;
	marcarMes();
	iniciarEntradas();
	if (movimentoReduzido) return;
	/* O boletim do banner termina de abrir em ~1 s; depois disso ele pode respirar. */
	const agora = window.performance && window.performance.now ? window.performance.now() : 0;
	window.setTimeout(() => raiz.classList.add('o-edu-entrou'), Math.max(0, 1200 - agora));
	if (!ponteiroFino) return;
	iniciarQuadriculado();
	iniciarApagador();
}
