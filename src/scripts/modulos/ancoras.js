/* As seções depois do banner ficam com altura estimada até chegarem perto da tela
   (content-visibility em src/styles/base.css). Antes da primeira rolagem até uma âncora
   desta página, o navegador desenha tudo de uma vez, para a rolagem parar no lugar certo.
   Ao recarregar, voltar no histórico ou abrir com #âncora, o script do <head> já faz isso. */
import { doc, raiz } from '../util.js';

export function desenharTudo() {
	if (raiz.classList.contains('o-cv-tudo')) return;
	raiz.classList.add('o-cv-tudo');
	void doc.body.offsetHeight;
}

let mexeu = false;

export function iniciarAncoras() {
	const marcar = () => {
		mexeu = true;
	};
	['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach((tipo) => window.addEventListener(tipo, marcar, { once: true, passive: true }));
	doc.addEventListener(
		'click',
		(e) => {
			const a = e.target && e.target.closest ? e.target.closest('a[href*="#"]') : null;
			if (a && a.hash.length > 1 && a.pathname === window.location.pathname && a.host === window.location.host) desenharTudo();
		},
		true,
	);
}

/* Abrindo a página com #âncora: o que roda quando o navegador está livre pode mudar alturas acima
   do alvo (a calculadora troca a tabela pelo formulário). Se o visitante ainda não mexeu, alinha de novo. */
export function manterAncora() {
	let id = '';
	try {
		id = decodeURIComponent(window.location.hash.slice(1));
	} catch (erro) {
		return;
	}
	const alvo = id && doc.getElementById(id);
	if (!alvo) return;
	window.requestAnimationFrame(() => {
		if (!mexeu) alvo.scrollIntoView({ block: 'start' });
	});
}
