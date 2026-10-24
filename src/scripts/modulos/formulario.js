/* Formulário de orçamento em 2 etapas (PROMPT 10). Sem JavaScript ele continua enviando normalmente.
   Etapa 1: nome, WhatsApp e e-mail. Etapa 2: empresa, cargo, porte (obrigatórios), site, chips, verba,
   mensagem e consentimento. Os obrigatórios de cada etapa são os campos com "required" no HTML. */
import { $, $$, doc, raiz, temIO, movimentoReduzido, gravarArmazenamento, linkWhatsApp } from '../util.js';
import { track } from './rastreamento.js';
import { ultimoToque, primeiroToqueTexto, origem } from './origem.js';
import { desenharTudo } from './ancoras.js';

// DDDs válidos no Brasil (Anatel).
const DDDS = '11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99'.split(' ');
// Mesma ideia do filter_var do enviar.php: algo@dominio.extensao, sem espaço.
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
const SEGMENTOS = { site: 'site', educacao: 'educacao', influenciadores: 'influencer' };

export function mascaraTelefone(valor) {
	let d = String(valor).replace(/\D/g, '');
	if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
	d = d.slice(0, 11);
	if (d.length <= 2) return d.length ? '(' + d : '';
	if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
	if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
	return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
}

/** '' quando válido; senão o tipo do erro. */
export function validarTelefone(valor) {
	let d = String(valor).replace(/\D/g, '');
	if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
	if (d.length < 10 || d.length > 11) return 'whatsapp';
	if (DDDS.indexOf(d.slice(0, 2)) === -1) return 'ddd';
	if (d.length === 11 && d.charAt(2) !== '9') return 'whatsapp';
	return '';
}

export function validarEmail(valor) {
	const v = String(valor || '').trim();
	return v.length <= 120 && EMAIL.test(v);
}

function marcados(form, nome) {
	return $$('input[name="' + nome + '[]"]:checked', form).map((i) => i.value);
}

function iniciarUm(caixa) {
	const form = $('[data-o-form-el]', caixa);
	if (!form) return;
	const posicao = caixa.getAttribute('data-posicao') || 'fim';
	const segmento = SEGMENTOS[caixa.getAttribute('data-segmento')] || 'site';
	let erros = {};
	try {
		erros = JSON.parse(caixa.getAttribute('data-o-erros') || '{}');
	} catch (e) {
		erros = {};
	}
	const status = $('[data-o-status]', form);
	const rotuloEtapa = $('[data-o-etapa-rotulo]', form);
	const medidor = $$('.o-form__progresso .o-medidor i', form);
	const enviar = $('[data-o-enviar]', form);
	const avancar = $('[data-o-avancar]', form);
	const voltar = $('[data-o-voltar]', form);
	const abertoEm = Date.now();
	let comecou = false;
	let enviando = false;

	form.noValidate = true;
	const campo = (nome) => form.elements[nome];
	const valor = (nome) => (campo(nome) && campo(nome).value ? String(campo(nome).value).trim() : '');

	// Campos ocultos: tempo, origem e contexto.
	if (campo('olorin_ts')) campo('olorin_ts').value = String(Math.floor(abertoEm / 1000));
	const toque = ultimoToque();
	['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid'].forEach((k) => {
		if (campo(k)) campo(k).value = toque[k] || '';
	});
	if (campo('primeiro_toque')) campo('primeiro_toque').value = primeiroToqueTexto();
	if (campo('referencia')) campo('referencia').value = origem().referencia || '';
	if (campo('pagina')) campo('pagina').value = window.location.pathname;
	if (campo('variante_formulario')) campo('variante_formulario').value = raiz.getAttribute('data-form-variant') || '';

	function definirEtapa(n, focar) {
		caixa.setAttribute('data-etapa', String(n));
		if (rotuloEtapa) rotuloEtapa.textContent = 'Etapa ' + n + ' de 2';
		medidor.forEach((cel, i) => cel.classList.toggle('is-on', i < n));
		if (focar) {
			const legenda = $('.o-form__etapa[data-etapa="' + n + '"] .o-form__legenda', form);
			if (legenda) legenda.focus({ preventScroll: true });
			const topo = caixa.getBoundingClientRect().top;
			if (topo < 0 || topo > window.innerHeight * 0.6) {
				desenharTudo();
				caixa.scrollIntoView({ behavior: movimentoReduzido ? 'auto' : 'smooth', block: 'start' });
			}
		}
	}

	function erroDe(nome) {
		return $('[data-erro-de="' + nome + '"]', form);
	}
	function mensagemDe(nome, tipo) {
		const caixaErro = erroDe(nome);
		const propria = caixaErro && caixaErro.getAttribute('data-msg');
		if (tipo === 'ddd') return erros.ddd || 'Esse DDD não existe. Confira o número.';
		return propria || erros[nome] || 'Confira este campo.';
	}
	function marcarErro(nome, mensagem) {
		const c = campo(nome);
		const caixaErro = erroDe(nome);
		if (c && c.setAttribute) c.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
		if (caixaErro) {
			caixaErro.textContent = mensagem || '';
			caixaErro.hidden = !mensagem;
		}
	}

	/** Tipo do erro do campo ('' = ok). */
	function conferir(el) {
		const nome = el.name;
		if (el.type === 'checkbox') return el.checked ? '' : 'vazio';
		const v = String(el.value || '').trim();
		if (nome === 'whatsapp') return validarTelefone(v);
		if (nome === 'email') return validarEmail(v) ? '' : 'email';
		const minimo = Number(el.getAttribute('minlength')) || 1;
		return v.length >= minimo ? '' : 'vazio';
	}
	function obrigatorios(etapa) {
		const seletor = etapa === 'tudo' ? '.o-form__etapa' : '.o-form__etapa[data-etapa="' + etapa + '"]';
		return $$(seletor, form).reduce((lista, fs) => lista.concat($$('[required]', fs)), []);
	}

	function validar(etapa) {
		const falhas = [];
		obrigatorios(etapa).forEach((el) => {
			const tipo = conferir(el);
			if (tipo) falhas.push([el.name, mensagemDe(el.name, tipo)]);
			else marcarErro(el.name, '');
		});
		falhas.forEach(([nome, msg]) => {
			marcarErro(nome, msg);
			track('form_error', { campo: nome, tipo: 'validacao', posicao });
		});
		if (falhas.length) {
			if (status) status.textContent = falhas.length === 1 ? 'Confira o campo destacado.' : 'Confira os ' + falhas.length + ' campos destacados.';
			const primeiro = campo(falhas[0][0]);
			if (primeiro && primeiro.focus) primeiro.focus();
		} else if (status) {
			status.textContent = '';
		}
		return falhas.length === 0;
	}

	// Primeiro foco = início do preenchimento.
	form.addEventListener('focusin', () => {
		if (!comecou) {
			comecou = true;
			track('form_start', { posicao });
		}
	});

	const tel = campo('whatsapp');
	if (tel) {
		tel.addEventListener('input', (e) => {
			if (e.inputType && e.inputType.indexOf('delete') === 0) return;
			tel.value = mascaraTelefone(tel.value);
		});
		tel.addEventListener('blur', () => {
			tel.value = mascaraTelefone(tel.value);
		});
	}
	const email = campo('email');
	if (email) email.addEventListener('blur', () => {
		email.value = email.value.trim().replace(/\s+/g, '');
	});
	// Erro some assim que a pessoa mexe no campo.
	obrigatorios('tudo').forEach((el) => {
		el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', () => {
			if (el.getAttribute('aria-invalid') === 'true' || el.type === 'checkbox') marcarErro(el.name, '');
		});
	});

	// "Ainda não invisto" → linha honesta (o CSS já faz com :has; isto cobre navegadores antigos).
	const verba = campo('investimento');
	if (verba) {
		const bloco = verba.closest('.o-campo--verba');
		verba.addEventListener('change', () => bloco && bloco.classList.toggle('tem-sem-verba', verba.selectedIndex === 1));
	}

	if (avancar) {
		avancar.addEventListener('click', () => {
			if (validar(1)) {
				definirEtapa(2, true);
				track('form_step1_complete', { posicao });
			}
		});
	}
	if (voltar) voltar.addEventListener('click', () => definirEtapa(1, true));
	form.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' && caixa.getAttribute('data-etapa') === '1' && e.target.tagName === 'INPUT') {
			e.preventDefault();
			if (avancar) avancar.click();
		}
	});

	function rotuloDe(nome) {
		const c = campo(nome);
		const l = c && c.id ? $('label[for="' + c.id + '"]', form) : null;
		return l ? l.firstChild.textContent.trim() : nome;
	}
	function resumoParaWhatsApp() {
		const partes = ['Oi! Sou ' + valor('nome') + ' e quero um orçamento.'];
		['empresa', 'cargo', 'porte'].forEach((nome) => {
			if (valor(nome)) partes.push(rotuloDe(nome) + ': ' + valor(nome) + '.');
		});
		const s = marcados(form, 'servicos').concat(marcados(form, 'desafios'));
		if (s.length) partes.push((marcados(form, 'desafios').length ? 'Desafio: ' : 'Preciso de: ') + s.join(', ') + '.');
		if (verba && verba.value) partes.push('Invisto hoje: ' + verba.value + '.');
		if (valor('site')) partes.push(rotuloDe('site') + ': ' + valor('site') + '.');
		return partes.join(' ');
	}

	function falhou(mensagem) {
		if (!status) return;
		status.textContent = '';
		status.appendChild(doc.createTextNode((mensagem || erros.geral || 'Não conseguimos enviar agora.') + ' '));
		const a = doc.createElement('a');
		a.href = linkWhatsApp(resumoParaWhatsApp(), (segmento === 'site' ? '' : segmento + '-') + 'form-erro-' + posicao);
		a.target = '_blank';
		a.rel = 'noopener';
		a.textContent = (erros.wa_alternativa || 'Mande pelo WhatsApp, com o que você já preencheu') + ' →';
		status.appendChild(a);
	}

	form.addEventListener('submit', (e) => {
		if (enviando) {
			e.preventDefault();
			return;
		}
		if (!validar(1)) {
			e.preventDefault();
			definirEtapa(1, false);
			validar(1);
			return;
		}
		if (!validar(2)) {
			e.preventDefault();
			return;
		}
		if (campo('olorin_tempo')) campo('olorin_tempo').value = String(Math.round((Date.now() - abertoEm) / 1000));
		if (!window.fetch || !window.FormData) return; // envio tradicional
		e.preventDefault();
		enviando = true;
		const textoBotao = enviar ? enviar.textContent : '';
		if (enviar) {
			enviar.setAttribute('aria-busy', 'true');
			enviar.disabled = true;
			enviar.textContent = 'Enviando…';
		}
		if (status) status.textContent = 'Enviando…';

		fetch(form.getAttribute('action'), {
			method: 'POST',
			body: new FormData(form),
			credentials: 'same-origin',
			headers: { Accept: 'application/json' },
		})
			.then((res) => res.json().catch(() => ({})).then((dados) => ({ ok: res.ok, dados })))
			.then(({ ok, dados }) => {
				if (ok && dados && dados.ok) {
					// generate_lead dispara na página de obrigado, uma vez por envio (token na sessão).
					// Só faixas e listas fechadas: nada que identifique a pessoa.
					gravarArmazenamento('sessionStorage', 'olorin_lead_pendente', {
						token: String(Date.now()) + Math.random().toString(36).slice(2, 8),
						segmento,
						plano: valor('plano'),
						servicos: marcados(form, 'servicos').join(', '),
						desafios: marcados(form, 'desafios').join(', '),
						porte: valor('porte'),
						verba_faixa: verba ? verba.value : '',
						servico_pagina: valor('servico_pagina'),
						posicao,
					});
					window.location.assign(dados.redirect || '/obrigado/');
					return;
				}
				const d = dados || {};
				if (d.fields) {
					Object.keys(d.fields).forEach((nome) => {
						marcarErro(nome, d.fields[nome]);
						track('form_error', { campo: nome, tipo: 'servidor', posicao });
					});
					if (d.fields.nome || d.fields.whatsapp || d.fields.email) definirEtapa(1, true);
				} else {
					track('form_error', { campo: '', tipo: 'servidor', posicao });
				}
				falhou(d.message);
			})
			.catch(() => {
				track('form_error', { campo: '', tipo: 'conexao', posicao });
				falhou(erros.conexao || 'Parece que a conexão caiu.');
			})
			.then(() => {
				enviando = false;
				if (enviar && caixa.isConnected) {
					enviar.removeAttribute('aria-busy');
					enviar.disabled = false;
					enviar.textContent = textoBotao;
				}
			});
	});

	definirEtapa(1, false);

	// form_view: formulário 50% visível.
	if (temIO) {
		const io = new IntersectionObserver((entradas) => {
			entradas.forEach((en) => {
				if (en.isIntersecting) {
					track('form_view', { posicao });
					io.disconnect();
				}
			});
		}, { threshold: 0.5 });
		io.observe(caixa);
	}
}

/* "Selecionar tudo" nos serviços: só aparece com JS; "Ainda não sei" fica de fora. */
function iniciarSelecionarTudo(caixa) {
	const todos = $('[data-o-todos]', caixa);
	if (!todos) return;
	const rotulo = todos.closest('[data-o-todos-rotulo]');
	const caixas = $$('input[name="servicos[]"]', caixa).filter((c) => !c.hasAttribute('data-o-exclusivo'));
	if (!caixas.length) return;
	if (rotulo) rotulo.hidden = false;
	function sincronizar() {
		const n = caixas.filter((c) => c.checked).length;
		todos.checked = n === caixas.length;
		todos.indeterminate = n > 0 && n < caixas.length;
	}
	todos.addEventListener('change', () => {
		caixas.forEach((c) => {
			c.checked = todos.checked;
		});
		if (todos.checked) caixa.dispatchEvent(new CustomEvent('o-desmarcar-exclusivo'));
	});
	caixas.forEach((c) => c.addEventListener('change', sincronizar));
	caixa.addEventListener('o-servicos', sincronizar);
	sincronizar();
}

/* "Ainda não sei, quero conversar" não combina com as outras opções: marcar um desmarca o outro. */
function iniciarExclusivo(caixa) {
	$$('[data-o-chips]', caixa).forEach((grupo) => {
		const exclusivo = $('input[data-o-exclusivo]', grupo);
		if (!exclusivo) return;
		const outras = $$('input[type="checkbox"]', grupo).filter((c) => c !== exclusivo);
		const avisar = () => caixa.dispatchEvent(new CustomEvent('o-servicos'));
		exclusivo.addEventListener('change', () => {
			if (!exclusivo.checked) return;
			outras.forEach((c) => {
				c.checked = false;
				c.indeterminate = false;
			});
			avisar();
		});
		outras.forEach((c) => c.addEventListener('change', () => {
			if (c.checked) exclusivo.checked = false;
		}));
		caixa.addEventListener('o-desmarcar-exclusivo', () => {
			exclusivo.checked = false;
		});
	});
}

/* Atalho do banner: o WhatsApp digitado vai para o formulário do Raio-X e o foco segue para o nome. */
function iniciarAtalhos() {
	$$('[data-o-atalho]').forEach((atalho) => {
		const campoAtalho = $('input[type="tel"]', atalho);
		if (campoAtalho) {
			campoAtalho.addEventListener('input', (e) => {
				if (e.inputType && e.inputType.indexOf('delete') === 0) return;
				campoAtalho.value = mascaraTelefone(campoAtalho.value);
			});
		}
		atalho.addEventListener('submit', (e) => {
			const caixa = doc.getElementById(atalho.getAttribute('data-o-atalho'));
			if (!caixa) return;
			e.preventDefault();
			const tel = $('input[name="whatsapp"]', caixa);
			const nome = $('input[name="nome"]', caixa);
			if (tel && campoAtalho && campoAtalho.value.trim()) tel.value = mascaraTelefone(campoAtalho.value);
			track('hero_shortcut', { preenchido: !!(campoAtalho && campoAtalho.value.trim()) });
			desenharTudo();
			caixa.scrollIntoView({ behavior: movimentoReduzido ? 'auto' : 'smooth', block: 'start' });
			if (nome) window.setTimeout(() => nome.focus({ preventScroll: true }), movimentoReduzido ? 0 : 500);
		});
	});
}

export function iniciarFormularios() {
	$$('[data-o-form]').forEach((caixa) => {
		iniciarUm(caixa);
		iniciarSelecionarTudo(caixa);
		iniciarExclusivo(caixa);
	});
	iniciarAtalhos();
}
