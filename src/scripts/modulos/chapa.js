/* Chapa do Raio-X (23/10/2026): celular normal, flash e raio-x do celular (partials/chapa-raio-x.njk).
   O ciclo é todo em CSS (componentes/chapa.css). Aqui só: pausa fora da tela (.is-fora) e, na primeira vez
   que a chapa aparece, recomeça o ciclo do estado A (celular normal), para quem chega ver o flash. */
import { $$, temIO } from '../util.js';

export function iniciarChapa() {
	const chapas = $$('[data-o-chapa]');
	if (!chapas.length || !temIO) return;
	const io = new IntersectionObserver((entradas) => {
		entradas.forEach((en) => {
			const el = en.target;
			el.classList.toggle('is-fora', !en.isIntersecting);
			if (en.isIntersecting && !el.hasAttribute('data-o-chapa-visto') && el.getAnimations) {
				el.setAttribute('data-o-chapa-visto', '');
				el.getAnimations({ subtree: true }).forEach((a) => {
					a.currentTime = 0;
				});
			}
		});
	}, { rootMargin: '0px 0px -12% 0px' });
	chapas.forEach((el) => io.observe(el));
}
