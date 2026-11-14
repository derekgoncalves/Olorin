/* Olorin Digital — gerador do site novo (nov/2026).
   node build.mjs            → gera dist/ (o que vai para o public_html)
   node build.mjs --previa   → gera dist/ com caminhos relativos (abre direto do arquivo, usado na prévia)
   Textos: dados/conteudo.json (os mesmos do site de 24/10, já revisados pelo dono). Não inventar texto novo: só a identidade visual é nova.
   Sem dependências além do esbuild (minificação). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';
import { paginas } from './src/paginas.mjs';

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(RAIZ, 'dist');
const PREVIA = process.argv.includes('--previa');
const D = JSON.parse(fs.readFileSync(path.join(RAIZ, 'dados/conteudo.json'), 'utf8'));
const IMGS = JSON.parse(fs.readFileSync(path.join(RAIZ, 'dados/imagens.json'), 'utf8'));
const S = D.site;
const ler = (f) => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const svg = (f) => ler(f).replace(/<\?xml[^>]*>/, '').trim();

/* ---------- Utilitários de marcação ---------- */
export const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** [texto](link) vira <a>; o resto é escapado. */
export const rico = (t) => esc(t).replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="link" href="$2">$1</a>');
export const I = {
	seta: '<svg class="seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg>',
	check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 13l5 5L20 6"/></svg>',
	o: svg('static/logos/icone-o.svg'),
	pixel: svg('static/logos/icone-pixel.svg'),
	logo: svg('static/logos/logo-olorin.svg'),
	wa: svg('static/marcas/whatsapp.svg').replace('<svg', '<svg aria-hidden="true"'),
	instagram: svg('static/marcas/instagram.svg').replace('<svg', '<svg aria-hidden="true"'),
	facebook: svg('static/marcas/facebook.svg').replace('<svg', '<svg aria-hidden="true"'),
	linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>',
	x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3l13.31 17.41z"/></svg>',
};
export const wa = (mensagem, ref) => `https://wa.me/${S.WHATSAPP}?text=${encodeURIComponent(`${mensagem} [ref: ${ref}]`)}`;
export const WA_PADRAO = 'Oi! Vim pelo site da Olorin e quero saber do Raio-X da minha marca.';

/** <img> com srcset. nome = chave de dados/imagens.json. */
export function img(nome, alt, { sizes = '100vw', cls = '', lazy = true, attrs = '' } = {}) {
	const v = IMGS[nome];
	if (!v) throw new Error('imagem sem manifesto: ' + nome);
	const maior = v[v.length - 1];
	return `<img src="/assets/img/${maior.arq}" srcset="${v.map((i) => `/assets/img/${i.arq} ${i.w}w`).join(', ')}" sizes="${sizes}" width="${maior.w}" height="${maior.h}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ''}${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}${attrs ? ' ' + attrs : ''}>`;
}
export const btn = (texto, href, { cls = '', id = '', seta = true, wa: ehWa = false, attrs = '' } = {}) =>
	`<a class="btn ${ehWa ? 'btn--wa ' : ''}${cls}" href="${href}"${id ? ` id="${id}"` : ''}${ehWa ? ' target="_blank" rel="noopener" data-wa' : ''}${attrs ? ' ' + attrs : ''}>${ehWa ? I.wa : ''}<span>${esc(texto)}</span>${seta && !ehWa ? I.seta : ''}</a>`;
const reEsc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PROPRIOS = new RegExp('(' + ['Olorin Digital', 'Olorin', 'Natalia', 'Arruda', 'Vinícius', 'Mafra', 'Derek', 'Gonçalves', 'Meta Ads', 'Google Ads', 'Google Tag Manager', 'Meta', 'Google', ...new Set([...D.clientes.itens.map((c) => c.nome), ...D.portfolio.itens.map((c) => c.titulo)])].sort((a, b) => b.length - a.length).map((t) => reEsc(esc(t))).join('|') + ')', 'g');
/** Mantém as maiúsculas dos nomes próprios (time, Olorin e clientes) onde o CSS deixa o texto em minúsculas. Aplicado ao corpo inteiro de cada página. */
export const nomes = (t) => String(t).split(/(<[^>]+>)/).map((p) => (p.startsWith('<') ? p : p.replace(PROPRIOS, '<span class="nome">$1</span>'))).join('');
export const linhas = (partes, cls = '', tag = 'h2', extra = '') =>
	`<${tag} class="linhas ${cls}" data-r-linhas${extra}>${partes.map((p, i) => `<span class="l" style="--i:${i}"><span>${p}</span></span>`).join('')}</${tag}>`;
export const fita = (t, cls = '') => `<span class="fita ${cls}">${esc(t)}</span>`;
export const janela = (titulo, corpo, cls = '') => `<div class="janela ${cls}"><div class="janela__barra"><span>${esc(titulo)}</span><i aria-hidden="true"></i></div><div class="janela__corpo">${corpo}</div></div>`;
export const banda = (texto, tema, cls = '') => {
	const item = `<span>${esc(texto)} ${I.o}</span>`;
	const trilho = `<div class="rolo__trilho" aria-hidden="true">${item.repeat(6)}</div>`;
	return `<div class="rolo banda ${tema} ${cls}">${trilho}${trilho}</div>`;
};

const SERVICOS = D.servicos.map((s) => ({ ...s, url: `/servicos/${s.slug}/` }));
const NOME_SERV = { 'trafego-pago': 'tráfego pago', 'redes-sociais': 'redes sociais', 'identidade-visual': 'identidade visual', 'material-impresso': 'impressos', 'site-e-loja-virtual': 'sites e lojas', 'rastreamento-e-relatorio': 'dados e relatórios' };
const ARTE_SERV = { 'trafego-pago': 'adesivo-megafone', 'redes-sociais': 'adesivo-selfie', 'site-e-loja-virtual': 'adesivo-notebook', 'rastreamento-e-relatorio': 'adesivo-lupa' };

/* ---------- Formulário do Raio-X: o mesmo do site de 24/10 (2 etapas: contatos, depois a empresa) ---------- */
export function formulario({ pagina = 'home', servico = '' } = {}) {
	const F = D.formulario, R = F.rotulos, seg = F.segmentos.site;
	const campo = (nome, rotulo, controle, antes = '') => `<div class="campo"><label for="f-${nome}">${rotulo}</label>${antes}${controle}<span class="erro" data-erro-de="${nome}" hidden></span></div>`;
	const escolha = (nome, opcoes, vazio, extra = '') => `<span class="sel"><select id="f-${nome}" name="${nome}"${extra}><option value="">${esc(vazio)}</option>${opcoes.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select></span>`;
	const chips = [...SERVICOS.map((s) => ({ v: s.chip, slug: s.slug })), { v: F.servicos_extra, slug: 'nao-sei' }];
	const ocultos = ['olorin_ts', 'olorin_tempo', 'plano', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'primeiro_toque', 'pagina', 'referencia', 'variante_formulario'].map((c) => `<input type="hidden" name="${c}" value="">`).join('');
	const corpo = `
<form class="form__f" action="/enviar.php" method="post" accept-charset="UTF-8" data-form>
	<p class="form__prog" aria-hidden="true"><span><i class="on"></i><i></i></span><b data-etapa-rotulo>Etapa 1 de 2</b></p>
	<div class="form__erro" role="alert" hidden data-erro-geral></div>
	<fieldset class="form__etapa" data-etapa="1">
		<legend class="form__t" tabindex="-1">${esc(F.etapa1_legenda)}</legend>
		${campo('nome', esc(R.nome), `<input id="f-nome" type="text" name="nome" autocomplete="name" autocapitalize="words" required minlength="2" maxlength="80" placeholder="${esc(F.placeholders.nome)}">`)}
		${campo('whatsapp', esc(R.whatsapp), `<input id="f-whatsapp" type="tel" name="whatsapp" inputmode="tel" autocomplete="tel-national" required pattern="[0-9()+ .-]{10,20}" maxlength="20" placeholder="${esc(F.placeholders.whatsapp)}">`)}
		${campo('email', esc(R.email), `<input id="f-email" type="email" name="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" required maxlength="120" placeholder="${esc(F.placeholders.email)}">`)}
		<button class="btn btn--g" type="button" data-avancar hidden><span>${esc(F.botao_continuar)}</span>${I.seta}</button>
	</fieldset>
	<fieldset class="form__etapa" data-etapa="2">
		<legend class="form__t" tabindex="-1">${esc(seg.etapa2_legenda)}</legend>
		${campo('empresa', esc(seg.empresa.rotulo), `<input id="f-empresa" type="text" name="empresa" autocomplete="organization" required minlength="2" maxlength="120" placeholder="${esc(seg.empresa.placeholder)}" data-msg="${esc(seg.empresa.erro)}">`)}
		${campo('cargo', esc(seg.cargo.rotulo), `<input id="f-cargo" type="text" name="cargo" autocomplete="organization-title" required minlength="2" maxlength="80" data-msg="${esc(seg.cargo.erro)}">`, `<small class="campo__ex">${esc(seg.cargo.exemplo)}</small>`)}
		${campo('porte', esc(seg.porte.rotulo), escolha('porte', seg.porte.opcoes, F.selecione, ` required data-msg="${esc(seg.porte.erro)}"`))}
		${campo('site', `${esc(seg.site.rotulo)} <small>${esc(R.site_opcional)}</small>`, `<input id="f-site" type="text" name="site" inputmode="url" autocomplete="url" autocapitalize="off" spellcheck="false" maxlength="120" placeholder="${esc(seg.site.placeholder)}">`)}
		<fieldset class="campo"><legend>${esc(R.servicos)} <small>${esc(R.servicos_dica)}</small></legend>
			<div class="chips" data-chips><label class="chips__todos" hidden data-todos-rotulo><input type="checkbox" data-todos><span>${esc(R.selecionar_tudo)}</span></label>${chips.map((c) => `<label><input type="checkbox" name="servicos[]" value="${esc(c.v)}"${c.slug === 'nao-sei' ? ' data-exclusivo' : ''}${c.slug === servico ? ' checked' : ''}><span>${esc(c.v)}</span></label>`).join('')}</div>
		</fieldset>
		<div class="campo" data-verba><label for="f-investimento">${esc(R.investimento)}</label>${escolha('investimento', F.investimento, F.investimento_placeholder)}<small class="campo__dica" hidden data-sem-verba>${esc(F.sem_verba)}</small></div>
		${campo('mensagem', `${esc(R.mensagem)} <small>${esc(R.mensagem_opcional)}</small>`, `<textarea id="f-mensagem" name="mensagem" rows="3" maxlength="1500" placeholder="${esc(seg.mensagem_placeholder)}"></textarea>`)}
		<div class="campo"><label class="aceite"><input type="checkbox" name="consentimento" value="1" required><span>${esc(F.consentimento)} <a class="link" href="/politica-de-privacidade/" target="_blank" rel="noopener">${esc(F.consentimento_link)}</a>.</span></label><span class="erro" data-erro-de="consentimento" hidden></span></div>
		<div class="mel" aria-hidden="true"><label>Não preencha este campo <input type="text" name="empresa_url" tabindex="-1" autocomplete="off"></label></div>
		${ocultos}<input type="hidden" name="modo_pagina" value="${pagina === 'home' ? 'home' : servico ? 'servico' : pagina === 'servicos' ? 'hub' : 'sobre'}"><input type="hidden" name="servico_pagina" value="${esc(servico)}"><input type="hidden" name="posicao_formulario" value="fim">
		<button class="btn btn--g" type="submit" data-enviar><span>${esc(F.botao_enviar_diagnostico)}</span>${I.seta}</button>
		<button class="form__voltar" type="button" data-voltar hidden>${esc(F.botao_voltar)}</button>
		<p class="form__nota">${esc(F.nota)}</p>
	</fieldset>
</form>`;
	return `<div class="form" id="form-raio-x" data-erros="${esc(JSON.stringify(F.erros))}">${janela(F.barra_fim, corpo)}</div>`;
}

/** Seção final "Raio X da Olorin": a mesma em todas as páginas, com os textos do site de 24/10. */
export function secaoFinal({ pagina = 'home', servico = '', nomeServico = '', mensagemWa = '' } = {}) {
	const T = D.home.orcamento;
	const msg = mensagemWa || (nomeServico ? `Oi! Vim pelo site da Olorin e quero saber de ${nomeServico}.` : WA_PADRAO);
	return `
<section class="sec t-neon" id="raio-x" data-nivel="raio-x">
	<span id="orcamento"></span>
	<div class="c fim">
		<div class="fim__lado">
			<h2 class="mega fim__t" data-r>Raio X da <span class="fim__logo" role="img" aria-label="Olorin">${I.logo}</span></h2>
			<div class="fim__rx" data-r>
				<div class="scan scan--p" data-scan aria-hidden="true">
					<div class="scan__cam scan__tela">${mockPerfil()}</div>
					<div class="scan__cam scan__raio">${img('raio-x-celular', '', { sizes: '200px' })}</div>
					<div class="scan__feixe"></div>
				</div>
				<ol class="passos3">${T.passos.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>
			</div>
			<p class="fim__alt" data-r>${esc(D.formulario.alternativa_wa)} <a class="link" href="${wa(msg, 'form-fim')}" target="_blank" rel="noopener" data-wa>${esc(D.formulario.alternativa_wa_link)}</a></p>
		</div>
		<div data-r style="--d:.1s">${formulario({ pagina, servico })}</div>
	</div>
</section>`;
}

/** Faixa "Marcas que o nosso time já atendeu" (a mesma em todas as páginas). */
export function marcas(cls = '') {
	const logos = D.clientes.itens.map((c) => `<img src="/assets/clientes/${c.logo}" alt="${esc(c.nome)}" width="${c.largura}" height="${c.altura}" loading="lazy">`).join('');
	return `<div class="marcas ${cls}"><div class="c marcas__r"><p class="pixel">${esc(D.clientes.etiqueta)}</p><div class="rolo" data-rolo><div class="rolo__trilho">${logos}</div><div class="rolo__trilho" aria-hidden="true">${logos.replace(/alt="[^"]*"/g, 'alt=""')}</div></div><button class="pausa" type="button" aria-label="Pausar a faixa de logos" aria-pressed="false" data-rolo-pausa>❚❚</button></div></div>`;
}
const FOTO = { 'natalia-arruda': 'equipe-natalia', 'vinicius-mafra': 'equipe-vinicius', 'derek-goncalves': 'equipe-derek' };
/** Cartão de pessoa do time: só nome e função (como no site de 24/10). */
export const cartaoPessoa = (p, i = 0) => `<a class="jog" href="/quem-somos/${p.slug}/" data-r style="--d:${i * 0.08}s">
	<div class="jog__foto">${img(FOTO[p.slug], `Foto de ${p.nome}`, { sizes: '(min-width:900px) 30vw, 40vw' })}<span class="jog__p">player ${i + 1}</span></div>
	<div class="jog__info"><b>${esc(p.nome)}</b><span>${esc(p.funcao)}</span><i>${esc(D.home.equipe.ver_perfil)} →</i></div></a>`;
export const peca = (p) => `<figure class="peca" data-servicos="${p.servicos.join(' ')}"><div class="peca__img">${img(p.imagem, `Trabalho para ${p.titulo}`, { sizes: '(min-width:900px) 26vw, 240px' })}</div><figcaption><b>${esc(p.titulo)}</b><span>${esc(p.rotulo)}</span></figcaption></figure>`;
/** Seção "Fale com quem coordena." das páginas internas (textos da home de 24/10). */
export function secTime(tema = 't-preto') {
	const E = D.home.equipe;
	return `
<section class="sec ${tema}${tema === 't-preto' ? '' : ' sec--time-claro'}" id="equipe" data-nivel="time">
	<div class="c">
		<div class="cab cab--lado">${fita(E.etiqueta)}${linhas(['Fale com quem', 'coordena.'], 'mega')}<p class="lede" data-r>${esc(E.texto)}</p></div>
		<div class="time time--c">${D.equipe.pessoas.map((p, i) => cartaoPessoa(p, i)).join('')}</div>
	</div>
</section>`;
}
/** Calculadora "Monte o seu orçamento." (sem valores: monta o pedido e manda por WhatsApp). */
export function calculadora() {
	const C = D.calculadora, B = C.bilhete;
	const marcada = (q) => q.opcoes.find((o) => o.marcada) || q.opcoes[0];
	const grupos = C.perguntas.map((q) => `<fieldset class="campo" data-calc-grupo="${q.id}" data-rotulo="${esc(q.mensagem)}"><legend>${esc(q.rotulo)}</legend><div class="chips">${q.opcoes.map((o) => `<label><input type="radio" name="calc-${q.id}" value="${esc(o.texto)}"${o === marcada(q) ? ' checked' : ''}><span>${esc(o.texto)}</span></label>`).join('')}</div></fieldset>`).join('');
	const bilhete = `<div class="bilhete" data-calc-papel>
		<p class="bilhete__topo"><span class="bilhete__logo" role="img" aria-label="Olorin Digital">${I.logo}</span><span>${esc(B.topo)} <b>${esc(B.numero)}</b></span></p>
		<p class="bilhete__para">${esc(B.para)}</p>
		<dl>${C.perguntas.map((q) => `<div><dt>${esc(q.curto)}</dt><dd data-calc-linha="${q.id}">${esc(marcada(q).texto)}</dd></div>`).join('')}<div class="bilhete__extra"><dt>${esc(B.extra_rotulo)}</dt><dd>${esc(B.extra_valor)}</dd></div></dl>
		<p class="bilhete__pe">${esc(B.rodape)}</p>
	</div>`;
	return `
<section class="sec t-branco" id="orcamento-calculadora" data-nivel="orçamento">
	<div class="c">
		<div class="cab cab--lado">${fita(C.etiqueta)}${linhas(['Monte o seu', 'orçamento.'], 'mega')}<p class="lede" data-r>${esc(C.texto)}</p></div>
		<div class="calc" id="calculadora" data-calc data-inicio="${esc(C.mensagem)}" data-fim="${esc(C.mensagem_fim)}" data-r>${janela(C.janela, `<div class="calc__g"><form class="calc__form" data-calc-form>${grupos}</form><div class="calc__lado">${bilhete}<a class="btn btn--wa calc__btn" id="cta-whatsapp-calculadora" href="${wa(C.mensagem_sem_js, 'calculadora')}" target="_blank" rel="noopener" data-wa data-calc-botao>${I.wa}<span>${esc(C.botao)}</span></a></div></div>`)}</div>
	</div>
</section>`;
}

/** Perfil de exemplo dentro do celular do Raio-X (só CSS, sem imagem). */
export function mockPerfil() {
	return `<div class="perfil" aria-hidden="true">
	<div class="perfil__topo"><span>@suamarca</span><span>···</span></div>
	<div class="perfil__cab"><span class="perfil__av">${I.pixel}</span><span><b>128</b>posts</span><span><b>2.431</b>seguidores</span></div>
	<div class="perfil__bio"><b>Sua Marca</b><i></i><i style="width:62%"></i></div>
	<div class="perfil__bts"><span>seguir</span><span>mensagem</span></div>
	<div class="perfil__grade">${'<i></i>'.repeat(12)}</div>
</div>`;
}

/* ---------- Casca: cabeçalho, rodapé, cookies ---------- */
function cabecalho(pg) {
	const atual = (u) => (pg.url === u ? ' aria-current="page"' : '');
	const servs = SERVICOS.map((s) => `<a href="${s.url}"${atual(s.url)}>${esc(s.nome)}</a>`).join('');
	return `
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo" data-topo>
	<div class="topo__barra">
		<a class="topo__logo" href="/" aria-label="Olorin Digital, página inicial">${I.logo}</a>
		<nav class="topo__nav" aria-label="Principal">
			<div class="sub"><button type="button" aria-expanded="false" data-sub>Serviços <span aria-hidden="true">▾</span></button><div class="sub__lista">${servs}</div></div>
			<a href="/portfolio/"${atual('/portfolio/')}>Portfólio</a>
			<a href="/quem-somos/"${atual('/quem-somos/')}>Quem somos</a>
			<a href="/sobre/"${atual('/sobre/')}>Sobre</a>
		</nav>
		<span class="topo__nivel" aria-hidden="true">nível <b data-nivel-n>01</b></span>
		<div class="topo__acoes">
			<a class="topo__wa" href="${wa(pg.mensagemWa || WA_PADRAO, 'cabecalho')}" target="_blank" rel="noopener" data-wa aria-label="Falar no WhatsApp">${I.wa}</a>
			${btn('Raio-X gratuito', pg.semForm ? '/#raio-x' : '#raio-x', { id: 'cta-raio-x-topo', seta: false })}
			<button class="topo__menu" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu" data-menu-abrir><span></span></button>
		</div>
		<i class="topo__xp" aria-hidden="true"></i>
	</div>
</header>
<div class="menu" id="menu" data-menu aria-label="Menu" role="dialog" aria-modal="true">
	<div class="menu__topo"><a class="topo__logo" href="/" aria-label="Olorin Digital, página inicial">${I.logo}</a><button class="menu__fechar" type="button" aria-label="Fechar menu" data-menu-fechar>✕</button></div>
	<nav aria-label="Menu">
		<a href="/servicos/"${atual('/servicos/')}>serviços</a>
		<div class="menu__serv">${servs}</div>
		<a href="/portfolio/"${atual('/portfolio/')}>portfólio</a>
		<a href="/quem-somos/"${atual('/quem-somos/')}>quem somos</a>
		<a href="/sobre/"${atual('/sobre/')}>sobre</a>
	</nav>
	<div class="menu__pe t-preto">${btn('Raio-X gratuito', pg.semForm ? '/#raio-x' : '#raio-x', { attrs: 'data-menu-link' })}${btn('Falar no WhatsApp', wa(pg.mensagemWa || WA_PADRAO, 'menu'), { wa: true, cls: 'btn--vazado' })}</div>
</div>`;
}

function rodape(pg) {
	return `
<footer class="rodape">
	<div class="c">
		<div class="rodape__g">
			<div><p class="rodape__lema">sua marca em <em>outro nível.</em></p></div>
			<div><h2>Contato</h2><ul>
				<li><a href="${wa(pg.mensagemWa || WA_PADRAO, 'rodape')}" target="_blank" rel="noopener" data-wa>WhatsApp ${esc(S.TELEFONE_EXIBICAO)}</a></li>
				<li><a href="mailto:${S.EMAIL}">${S.EMAIL}</a></li>
				<li>Atendimento 100% remoto</li></ul>
				<div class="rodape__redes">
					<a href="${S.INSTAGRAM_URL}" target="_blank" rel="noopener" aria-label="Instagram da Olorin">${I.instagram}</a>
					<a href="https://www.linkedin.com/company/olorindigital" target="_blank" rel="noopener" aria-label="LinkedIn da Olorin">${I.linkedin}</a>
					<a href="${S.FACEBOOK_URL}" target="_blank" rel="noopener" aria-label="Facebook da Olorin">${I.facebook}</a>
					<a href="${S.X_URL}" target="_blank" rel="noopener" aria-label="X da Olorin">${I.x}</a>
				</div>
			</div>
		</div>
		<div class="rodape__marca" aria-hidden="true">${I.logo}</div>
		<div class="rodape__legal"><span>© ${new Date().getFullYear()} ${esc(S.NOME)} · CNPJ ${esc(S.CNPJ)}</span><a href="/politica-de-privacidade/">Política de Privacidade</a><button type="button" data-cookies-abrir hidden>Preferências de cookies</button></div>
	</div>
</footer>
<div class="barra-m t-preto" data-barra-m>${btn('WhatsApp', wa(pg.mensagemWa || WA_PADRAO, 'barra-mobile'), { wa: true, cls: 'btn--vazado' })}${btn('Raio-X gratuito', pg.semForm ? '/#raio-x' : '#raio-x', { seta: false })}</div>
<a class="flut-wa" href="${wa(pg.mensagemWa || WA_PADRAO, 'flutuante')}" target="_blank" rel="noopener" data-wa aria-label="Falar no WhatsApp">${I.wa}</a>
<div class="cookies" data-cookies hidden role="dialog" aria-label="Cookies">
	${janela('cookies.olo', `
	<div data-cookies-acoes><p>Usamos cookies para medir as visitas e o resultado dos nossos anúncios. Sem a sua permissão, nenhum cookie de medição é gravado. <a class="link" href="/politica-de-privacidade/#cookies">Saiba mais</a>.</p>
	<div class="cookies__b"><button type="button" class="cheio" data-cookies-aceitar>Aceitar tudo</button><button type="button" data-cookies-recusar>Recusar</button><button type="button" data-cookies-personalizar>Personalizar</button></div></div>
	<div data-cookies-opcoes hidden><label><input type="checkbox" checked disabled><span><b>Necessários</b>: guardam a sua escolha de cookies. Sempre ativos.</span></label><label><input type="checkbox" data-cookies-analise><span><b>Análise</b>: contam as visitas (Google Analytics).</span></label><label><input type="checkbox" data-cookies-marketing><span><b>Marketing</b>: medem os nossos anúncios (Meta e Google).</span></label>
	<div class="cookies__b"><button type="button" class="cheio" data-cookies-salvar>Salvar escolha</button></div></div>`)}
</div>`;
}

function esquema(pg) {
	const org = {
		'@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': S.URL + '/#org', name: S.NOME, url: S.URL + '/', slogan: S.LEMA, email: S.EMAIL,
		telephone: '+' + S.WHATSAPP, image: S.URL + '/assets/og/olorin.png', logo: S.URL + '/assets/logos/icon-512.png', taxID: S.CNPJ,
		address: { '@type': 'PostalAddress', addressLocality: S.CIDADE, addressRegion: S.UF, addressCountry: 'BR' }, areaServed: 'BR',
		sameAs: [S.INSTAGRAM_URL, S.FACEBOOK_URL, S.X_URL, 'https://www.linkedin.com/company/olorindigital'],
	};
	const itens = [org, ...(pg.esquema || [])];
	return `<script type="application/ld+json">${JSON.stringify(itens.length > 1 ? itens : org).replace(/</g, '\\u003c')}</script>`;
}

function pagina(pg, versao) {
	const canon = S.URL + pg.url;
	const cfg = { ...(PREVIA ? { previa: true } : {}), whatsapp: S.WHATSAPP, gtm: S.GTM_ID, ga4: S.GA4_ID, pixel: S.META_PIXEL_ID, modo: pg.modo || 'pagina', slug: pg.slug || '', segmento: pg.segmento || '' };
	const og = `${S.URL}/assets/og/${pg.og || 'olorin'}.png`;
	return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(pg.titulo)}</title>
<meta name="description" content="${esc(pg.descricao)}">
${pg.noindex ? '<meta name="robots" content="noindex,follow">' : `<link rel="canonical" href="${canon}">`}
<meta name="theme-color" content="#000000">
<meta property="og:type" content="website"><meta property="og:locale" content="pt_BR"><meta property="og:site_name" content="${esc(S.NOME)}">
<meta property="og:title" content="${esc(pg.titulo)}"><meta property="og:description" content="${esc(pg.descricao)}"><meta property="og:url" content="${canon}">
<meta property="og:image" content="${og}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="32x32"><link rel="icon" href="/assets/logos/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/logos/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/archivo-expanded-900.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/cascadia-code-400.woff2" as="font" type="font/woff2" crossorigin>
${pg.preload || ''}
<link rel="stylesheet" href="/assets/site.css?v=${versao}">
<script>document.documentElement.className='js';window.OLORIN_CONFIG=${JSON.stringify(cfg)};</script>
<script defer src="/olorin-ids.js?v=${versao}"></script>
<script defer src="/assets/site.js?v=${versao}"></script>
${esquema(pg)}
</head>
<body class="pg-${pg.modo || 'pagina'}${pg.cls ? ' ' + pg.cls : ''}">
${cabecalho(pg)}
<main id="conteudo">
${nomes(pg.corpo)}
</main>
${rodape(pg)}
</body>
</html>`;
}

/* ---------- Build ---------- */
function copiar(de, para) {
	fs.mkdirSync(para, { recursive: true });
	for (const e of fs.readdirSync(de, { withFileTypes: true })) {
		const a = path.join(de, e.name), b = path.join(para, e.name);
		if (e.isDirectory()) copiar(a, b); else fs.copyFileSync(a, b);
	}
}
function relativizar(html, url) {
	// Prévia: troca caminhos absolutos por relativos e aponta as pastas para index.html.
	const prof = url.split('/').filter(Boolean).length - (url.endsWith('.html') ? 1 : 0);
	const base = prof ? '../'.repeat(prof) : './';
	return html
		.replace(/(href|src|action|data-previa)="\/(?!\/)([^"]*)"/g, (m, a, c) => `${a}="${base}${c.replace(/^([^#?]*\/)?(#.*|\?.*)?$/, (x, p, r) => `${p || ''}index.html${r || ''}`)}"`)
		.replace(/srcset="([^"]+)"/g, (m, s) => `srcset="${s.replace(/(^|,\s*)\//g, `$1${base}`)}"`)
		.replace(/url\(\/assets\//g, `url(${base}assets/`);
}

const ctx = { D, S, SERVICOS, NOME_SERV, ARTE_SERV, IMGS, I, esc, rico, wa, WA_PADRAO, img, btn, linhas, fita, janela, banda, formulario, secaoFinal, nomes, mockPerfil, marcas, cartaoPessoa, peca, secTime, calculadora };
/* Segmentos em pausa (dono, 14/11/2026): as páginas de Educação e Influenciadores continuam no código, mas não são publicadas. */
const FORA = ['/educacao/', '/influenciadores/', '/obrigado-educacao/', '/obrigado-influenciadores/'];
const lista = paginas(ctx).filter((p) => !FORA.includes(p.url));

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });
for (const p of ['fonts', 'img', 'logos', 'clientes', 'marcas', 'og']) if (fs.existsSync(path.join(RAIZ, 'static', p))) copiar(path.join(RAIZ, 'static', p), path.join(DIST, 'assets', p));
copiar(path.join(RAIZ, 'static/raiz'), DIST);

let css = (await transform(ler('src/base.css') + ler('src/paginas.css'), { loader: 'css', minify: true })).code;
const js = (await transform(ler('src/site.js'), { loader: 'js', minify: true, target: 'es2019' })).code;
if (PREVIA) css = css.replace(/url\(\/assets\//g, 'url(');
fs.writeFileSync(path.join(DIST, 'assets/site.css'), css);
fs.writeFileSync(path.join(DIST, 'assets/site.js'), js);
const versao = String(Math.abs([...css + js].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7))).slice(0, 8);

for (const pg of lista) {
	let html = pagina(pg, versao);
	if (PREVIA) html = relativizar(html, pg.url);
	const arq = pg.url.endsWith('.html') ? pg.url : pg.url + 'index.html';
	fs.mkdirSync(path.join(DIST, path.dirname(arq)), { recursive: true });
	fs.writeFileSync(path.join(DIST, arq), html);
}

// PHP, IDs, sitemap, robots
const php = ler('src/enviar.php');
fs.writeFileSync(path.join(DIST, 'enviar.php'), php);
fs.copyFileSync(path.join(RAIZ, 'src/config.example.php'), path.join(DIST, 'config.example.php'));
fs.writeFileSync(path.join(DIST, 'olorin-ids.js'), ler('src/olorin-ids.js').replace('__GTM__', S.GTM_ID).replace('__GA4__', S.GA4_ID).replace('__PIXEL__', S.META_PIXEL_ID));
const indexaveis = lista.filter((p) => !p.noindex && !p.url.endsWith('.html'));
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexaveis.map((p) => `<url><loc>${S.URL}${p.url}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /enviar.php\nDisallow: /leads/\nDisallow: /obrigado\n\nSitemap: ${S.URL}/sitemap.xml\n`);
console.log(`${lista.length} páginas · css ${(css.length / 1024).toFixed(1)} KB · js ${(js.length / 1024).toFixed(1)} KB · v${versao}${PREVIA ? ' · prévia' : ''}`);
