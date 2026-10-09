/* Cabeçalho (fundo ao rolar, some ao descer), submenu de serviços, menu do celular e índice das páginas de serviço. */
import { $, $$, doc, raiz, temIO } from '../util.js';

export function iniciarCabecalho() {
	const topo = $('[data-o-topo]');
	if (!topo) return;
	let ultimoY = 0;
	let agendado = false;
	function atualizar() {
		agendado = false;
		const y = window.scrollY;
		topo.classList.toggle('is-scrolled', y > 24);
		const menuAberto = raiz.classList.contains('o-menu-aberto');
		if (!menuAberto && y > 640 && y > ultimoY + 6) {
			topo.classList.add('is-hidden');
		} else if (y < ultimoY - 6 || y < 640) {
			topo.classList.remove('is-hidden');
		}
		ultimoY = y;
	}
	window.addEventListener('scroll', () => {
		if (!agendado) {
			agendado = true;
			window.requestAnimationFrame(atualizar);
		}
	}, { passive: true });
	topo.addEventListener('focusin', () => topo.classList.remove('is-hidden'));
	window.requestAnimationFrame(atualizar);
}

export function iniciarSubmenu() {
	$$('[data-o-sub]').forEach((item) => {
		const botao = $('[data-o-sub-botao]', item);
		if (!botao) return;
		function abrir(aberto) {
			item.classList.toggle('is-open', aberto);
			botao.setAttribute('aria-expanded', aberto ? 'true' : 'false');
		}
		botao.addEventListener('click', () => abrir(botao.getAttribute('aria-expanded') !== 'true'));
		item.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') {
				abrir(false);
				botao.focus();
			}
		});
		item.addEventListener('focusout', (e) => {
			if (!item.contains(e.relatedTarget)) abrir(false);
		});
		doc.addEventListener('click', (e) => {
			if (!item.contains(e.target)) abrir(false);
		});
	});
}

export function iniciarMenuCelular() {
	const menu = $('[data-o-menu]');
	const botao = $('[data-o-hamburguer]');
	if (!menu || !botao) return;

	const focaveis = () => $$('a[href], button:not([disabled])', menu).filter((el) => el.offsetParent !== null);

	function abrir() {
		menu.removeAttribute('inert');
		menu.classList.add('is-open');
		raiz.classList.add('o-menu-aberto');
		raiz.style.overflow = 'hidden';
		botao.setAttribute('aria-expanded', 'true');
		window.setTimeout(() => {
			const primeiro = $('.o-menu__lista a, .o-menu__lista button', menu);
			(primeiro || menu).focus();
		}, 60);
	}
	function fechar(devolverFoco) {
		menu.classList.remove('is-open');
		menu.setAttribute('inert', '');
		raiz.classList.remove('o-menu-aberto');
		raiz.style.overflow = '';
		botao.setAttribute('aria-expanded', 'false');
		if (devolverFoco) botao.focus();
	}

	botao.addEventListener('click', abrir);
	menu.addEventListener('click', (e) => {
		const alvo = e.target.closest('[data-o-menu-fechar], a');
		if (alvo) fechar(alvo.matches('button'));
	});
	$$('[data-o-acordeao]', menu).forEach((b) => {
		const painel = doc.getElementById(b.getAttribute('aria-controls'));
		b.addEventListener('click', () => {
			const aberto = b.getAttribute('aria-expanded') === 'true';
			b.setAttribute('aria-expanded', aberto ? 'false' : 'true');
			if (painel) painel.hidden = aberto;
		});
	});
	doc.addEventListener('keydown', (e) => {
		if (!menu.classList.contains('is-open')) return;
		if (e.key === 'Escape') {
			fechar(true);
			return;
		}
		if (e.key === 'Tab') {
			const itens = focaveis();
			if (!itens.length) return;
			const primeiro = itens[0];
			const ultimo = itens[itens.length - 1];
			if (e.shiftKey && doc.activeElement === primeiro) {
				e.preventDefault();
				ultimo.focus();
			} else if (!e.shiftKey && doc.activeElement === ultimo) {
				e.preventDefault();
				primeiro.focus();
			}
		}
	});
	window.addEventListener('resize', () => {
		if (window.innerWidth > 1100 && menu.classList.contains('is-open')) fechar(false);
	});
}

/** Índice das páginas de serviço: marca a seção atual. */
export function iniciarIndice() {
	const indice = $('[data-o-indice]');
	if (!indice || !temIO) return;
	const links = $$('a[href^="#"]', indice);
	const secoes = links.map((a) => doc.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
	const visiveis = new Set();
	const io = new IntersectionObserver((entradas) => {
		entradas.forEach((en) => (en.isIntersecting ? visiveis.add(en.target) : visiveis.delete(en.target)));
		let atual = null;
		secoes.forEach((s) => {
			if (visiveis.has(s)) atual = s.id;
		});
		links.forEach((a) => {
			if (atual && a.getAttribute('href') === '#' + atual) a.setAttribute('aria-current', 'true');
			else a.removeAttribute('aria-current');
		});
	}, { rootMargin: '-35% 0px -55% 0px' });
	secoes.forEach((s) => io.observe(s));
}
