/* Estrela que acompanha o ponteiro (detalhe anos 90). Não esconde o cursor do sistema.
   Só com mouse/trackpad e sem "reduzir movimento". A cor respeita a marca (nunca verde sobre violeta). */
import { $, CONFIG, raiz, ponteiroFino, movimentoReduzido } from '../util.js';

function corPara(el) {
	if (!el || !el.closest) return '';
	const ctx = el.closest('.o-ctx-violeta, .o-ctx-verde, .o-ctx-branco, .o-ctx-preto, .o-form, .o-faixa--verde, .o-faixa--violeta, .o-plano--destaque');
	if (!ctx) return '';
	if (ctx.matches('.o-ctx-violeta, .o-form, .o-faixa--violeta')) return '#ffffff';
	if (ctx.matches('.o-ctx-verde, .o-faixa--verde, .o-plano--destaque')) return '#000000';
	if (ctx.matches('.o-ctx-branco')) return '#7e3bed';
	return '';
}

export function iniciarCursor() {
	const estrela = $('[data-o-cursor]');
	if (!estrela || !CONFIG.cursor || !ponteiroFino || movimentoReduzido) return;
	raiz.classList.add('o-has-cursor');
	let x = -100, y = -100, cx = -100, cy = -100, quadro = null;
	function laco() {
		cx += (x - cx) * 0.3;
		cy += (y - cy) * 0.3;
		estrela.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0) rotate(' + ((x - cx) * 0.8).toFixed(1) + 'deg)';
		quadro = Math.abs(x - cx) > 0.2 || Math.abs(y - cy) > 0.2 ? window.requestAnimationFrame(laco) : null;
	}
	window.addEventListener('mousemove', (e) => {
		x = e.clientX;
		y = e.clientY;
		if (!quadro) quadro = window.requestAnimationFrame(laco);
	}, { passive: true });
	document.addEventListener('mouseover', (e) => {
		estrela.classList.add('is-visivel');
		estrela.style.setProperty('--cor-cursor', corPara(e.target) || '#ecff36');
	});
	document.addEventListener('mouseleave', () => estrela.classList.remove('is-visivel'));
	window.addEventListener('blur', () => estrela.classList.remove('is-visivel'));
}
