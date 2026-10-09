/**
 * Olorin Digital — JavaScript do site (sem dependências, empacotado pelo esbuild).
 * Tudo é melhoria progressiva: sem JS o site continua legível, navegável e o formulário envia.
 * O que é essencial inicia na hora; o resto, quando o navegador estiver livre.
 */
import { quandoLivre } from './util.js';
import { iniciarConsentimento } from './modulos/consentimento.js';
import { iniciarCabecalho, iniciarSubmenu, iniciarMenuCelular, iniciarIndice } from './modulos/cabecalho.js';
import { iniciarFormularios } from './modulos/formulario.js';
import {
	iniciarChecklist,
	iniciarMetodo,
	iniciarPortfolio,
	iniciarFaq,
	iniciarCalculadora,
	iniciarPlanos,
	iniciarFaixas,
	iniciarPausa,
	iniciarContadores,
	iniciarRevelar,
} from './modulos/interacoes.js';
import { iniciarFlutuantes } from './modulos/flutuantes.js';
import { iniciarCursor } from './modulos/cursor.js';
import { iniciarCliques, iniciarRolagem, iniciarSecoes, iniciarObrigado } from './modulos/medicao.js';

function rodar(lista) {
	lista.forEach((fn) => {
		try {
			fn();
		} catch (erro) {
			if (window.console) window.console.error('[olorin]', erro);
		}
	});
}

rodar([iniciarConsentimento, iniciarCabecalho, iniciarSubmenu, iniciarMenuCelular, iniciarFormularios, iniciarChecklist, iniciarFaq, iniciarPlanos, iniciarCliques, iniciarObrigado, iniciarPausa]);
quandoLivre(() =>
	rodar([iniciarFaixas, iniciarRevelar, iniciarContadores, iniciarMetodo, iniciarPortfolio, iniciarCalculadora, iniciarFlutuantes, iniciarIndice, iniciarRolagem, iniciarSecoes, iniciarCursor]),
);
