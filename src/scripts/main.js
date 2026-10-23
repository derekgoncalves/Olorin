/**
 * Olorin Digital — JavaScript do site (sem dependências, empacotado pelo esbuild).
 * Tudo é melhoria progressiva: sem JS o site continua legível, navegável e o formulário envia.
 * O que é essencial inicia na hora; o resto, quando o navegador estiver livre.
 */
import { quandoLivre } from './util.js';
import { aplicarIds } from './modulos/ids.js';
import { iniciarConsentimento } from './modulos/consentimento.js';
import { iniciarAncoras, manterAncora } from './modulos/ancoras.js';
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
} from './modulos/interacoes.js';
import { iniciarMovimento, iniciarRevelarMovimento } from './modulos/movimento.js';
import { iniciarFlutuantes } from './modulos/flutuantes.js';
import { iniciarCursor } from './modulos/cursor.js';
import { iniciarCliques, iniciarRolagem, iniciarSecoes, iniciarObrigado } from './modulos/medicao.js';
import { iniciarFundos } from './modulos/fundos.js';
import { iniciarServico } from './modulos/servico.js';
import { iniciarPerfil } from './modulos/perfil.js';
import { iniciarEducacao } from './modulos/educacao.js';
import { iniciarJogo } from './modulos/jogo.js';
import { iniciarChapa } from './modulos/chapa.js';
import { iniciarInfluenciadores } from './modulos/influenciadores.js';

function rodar(lista) {
	lista.forEach((fn) => {
		try {
			fn();
		} catch (erro) {
			if (window.console) window.console.error('[olorin]', erro);
		}
	});
}

// Primeiro: IDs de medição e agendamento editados no servidor (olorin-ids.js), antes de qualquer leitura.
rodar([aplicarIds]);
rodar([iniciarAncoras, iniciarConsentimento, iniciarCabecalho, iniciarSubmenu, iniciarMenuCelular, iniciarFormularios, iniciarChecklist, iniciarFaq, iniciarPlanos, iniciarCliques, iniciarObrigado, iniciarPausa, iniciarMovimento]);
quandoLivre(() =>
	rodar([iniciarFaixas, iniciarRevelarMovimento, iniciarContadores, iniciarMetodo, iniciarPortfolio, iniciarCalculadora, iniciarFlutuantes, iniciarIndice, iniciarRolagem, iniciarSecoes, iniciarCursor, iniciarFundos, iniciarServico, iniciarPerfil, iniciarEducacao, iniciarJogo, iniciarChapa, iniciarInfluenciadores, manterAncora]),
);
