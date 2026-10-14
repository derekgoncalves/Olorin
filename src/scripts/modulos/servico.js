/* Páginas de serviço e hub: a cena animada do banner para quando sai da tela (poupa bateria). */
export function iniciarServico() {
	const cenas = document.querySelectorAll('[data-o-cena]');
	if (!cenas.length || !('IntersectionObserver' in window)) return;
	const observador = new IntersectionObserver((entradas) => {
		entradas.forEach((e) => e.target.classList.toggle('is-fora', !e.isIntersecting));
	});
	cenas.forEach((cena) => observador.observe(cena));
}
