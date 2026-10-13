/**
 * Fundos animados e interações de desktop: a grade de pixels acende sob o mouse, um clique no fundo
 * solta um respingo de pixels e os cards de serviço ganham um holofote que segue o ponteiro.
 * Só com mouse e sem prefers-reduced-motion; sem JS, os fundos ficam estáticos (e nada some).
 */
import { $$, doc, raiz, movimentoReduzido, ponteiroFino } from '../util.js';

const INTERATIVO = 'a, button, input, label, select, textarea, summary, [role="button"], .o-janela';

/* Atualiza --mx/--my de um elemento no máximo uma vez por quadro (lê a posição e escreve no mesmo quadro). */
function seguir(area, alvo) {
	let pedido = 0;
	let ex = 0;
	let ey = 0;
	area.addEventListener(
		'pointermove',
		(e) => {
			ex = e.clientX;
			ey = e.clientY;
			if (pedido) return;
			pedido = window.requestAnimationFrame(() => {
				pedido = 0;
				const r = alvo.getBoundingClientRect();
				alvo.style.setProperty('--mx', Math.round(ex - r.left) + 'px');
				alvo.style.setProperty('--my', Math.round(ey - r.top) + 'px');
			});
		},
		{ passive: true },
	);
	area.addEventListener('pointerenter', () => alvo.classList.add('is-perto'));
	area.addEventListener('pointerleave', () => alvo.classList.remove('is-perto'));
}

/* Respingo: 8 pixels que saem do ponto do clique e somem (o elemento se remove sozinho). */
function respingo(fundo, x, y) {
	if (raiz.classList.contains('o-pausado')) return;
	const r = doc.createElement('span');
	r.className = 'o-respingo';
	r.style.left = x + 'px';
	r.style.top = y + 'px';
	for (let i = 0; i < 8; i++) {
		const p = doc.createElement('i');
		p.style.setProperty('--a', i * 45 + Math.round(Math.random() * 20 - 10) + 'deg');
		p.style.setProperty('--d', 34 + Math.round(Math.random() * 46) + 'px');
		r.appendChild(p);
	}
	fundo.appendChild(r);
	window.setTimeout(() => r.remove(), 900);
}

export function iniciarFundos() {
	if (movimentoReduzido || !ponteiroFino) return;
	$$('[data-o-fundo]').forEach((fundo) => {
		const secao = fundo.parentElement;
		fundo.classList.add('is-ativo');
		seguir(secao, fundo);
		secao.addEventListener('pointerdown', (e) => {
			if (e.button !== 0 || e.target.closest(INTERATIVO)) return;
			const r = fundo.getBoundingClientRect();
			respingo(fundo, e.clientX - r.left, e.clientY - r.top);
		});
	});
	$$('[data-o-holofote]').forEach((grade) => {
		grade.classList.add('is-holofote');
		seguir(grade, grade);
	});
}
