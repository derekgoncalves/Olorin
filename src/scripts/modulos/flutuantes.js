/* Barra fixa do celular e botão flutuante de WhatsApp:
   somem enquanto um formulário está visível e enquanto o teclado do celular está aberto. */
import { $, $$, doc, temIO } from '../util.js';

export function iniciarFlutuantes() {
	const barra = $('[data-o-barra]');
	const flutuante = $('[data-o-flutuante]');
	if (!barra && !flutuante) return;
	const formularios = $$('[data-o-form]');
	const visiveis = new Set();
	let teclado = false;
	let perto = true;
	let sobreCor = false;

	function aplicar() {
		const esconder = visiveis.size > 0 || teclado;
		if (barra) {
			barra.classList.toggle('is-longe', esconder);
			barra.classList.toggle('is-alt', sobreCor);
		}
		if (flutuante) {
			flutuante.classList.toggle('is-longe', esconder || perto);
			flutuante.classList.toggle('is-alt', sobreCor);
		}
	}

	if (temIO && formularios.length) {
		const io = new IntersectionObserver((entradas) => {
			entradas.forEach((en) => (en.isIntersecting ? visiveis.add(en.target) : visiveis.delete(en.target)));
			aplicar();
		}, { threshold: 0.05 });
		formularios.forEach((f) => io.observe(f));
	}

	// Teclado virtual aberto: a área visível encolhe bastante.
	if (window.visualViewport) {
		const vv = window.visualViewport;
		vv.addEventListener('resize', () => {
			teclado = vv.height < window.innerHeight * 0.75;
			aplicar();
		});
	}
	doc.addEventListener('focusin', (e) => {
		if (e.target.matches && e.target.matches('input, select, textarea') && window.innerWidth < 768) {
			teclado = true;
			aplicar();
		}
	});
	doc.addEventListener('focusout', () => {
		window.setTimeout(() => {
			const ativo = doc.activeElement;
			teclado = !!(ativo && ativo.matches && ativo.matches('input, select, textarea') && window.innerWidth < 768);
			aplicar();
		}, 100);
	});

	if (flutuante && temIO) {
		// Perto do topo: o botão fica escondido (o banner já tem o WhatsApp).
		const sentinela = doc.createElement('div');
		sentinela.setAttribute('aria-hidden', 'true');
		sentinela.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:320px;pointer-events:none';
		doc.body.appendChild(sentinela);
		new IntersectionObserver((en) => {
			perto = en[0].isIntersecting;
			aplicar();
		}).observe(sentinela);

		// Sobre seção violeta, verde ou branca, o botão fica preto (verde nunca encosta no violeta nem fica no branco).
		const coloridas = $$('.o-ctx-violeta, .o-ctx-verde, .o-ctx-branco, .o-faixa');
		const sob = new Set();
		const io = new IntersectionObserver((entradas) => {
			entradas.forEach((en) => (en.isIntersecting ? sob.add(en.target) : sob.delete(en.target)));
			sobreCor = sob.size > 0;
			aplicar();
		}, { rootMargin: '-' + Math.max(0, window.innerHeight - 100) + 'px 0px -20px 0px' });
		coloridas.forEach((s) => io.observe(s));
	}
	aplicar();
}
