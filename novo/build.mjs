/* Olorin Digital — gerador do site novo (nov/2026).
   node build.mjs            → gera dist/ (o que vai para o public_html)
   node build.mjs --previa   → gera dist/ com caminhos relativos (abre direto do arquivo, usado na prévia)
   Textos: dados/conteudo.json (os mesmos já revisados pelo dono) + os textos novos da home, em paginas/.
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

/* ---------- Formulário do Raio-X (2 passos; o 1º já registra o contato) ---------- */
export function formulario({ segmento = 'site', pagina = 'home', titulo = 'raio-x.olo' } = {}) {
	const F = D.formulario;
	const seg = F.segmentos[segmento];
	const chipsDe = (nome, lista, tipo = 'checkbox') => `<div class="chips">${lista.map((o) => `<label><input type="${tipo}" name="${nome}" value="${esc(o)}"><span>${esc(o)}</span></label>`).join('')}</div>`;
	const opcoes = seg.desafios
		? `<fieldset class="campo"><legend>${esc(seg.desafios.rotulo)} <small>${esc(seg.desafios.dica)}</small></legend>${chipsDe('desafios[]', seg.desafios.opcoes)}</fieldset>`
		: `<fieldset class="campo"><legend>${esc(F.rotulos.servicos)} <small>${esc(F.rotulos.servicos_dica)}</small></legend>${chipsDe('servicos[]', [...SERVICOS.map((s) => s.chip), F.servicos_extra])}</fieldset>`;
	const porte = segmento === 'site' ? '' : `<fieldset class="campo"><legend>${esc(seg.porte.rotulo)} <small>(opcional)</small></legend>${chipsDe('porte', seg.porte.opcoes, 'radio')}</fieldset>`;
	const corpo = `
<form class="form__f" action="/enviar.php" method="post" novalidate data-form data-segmento="${segmento}">
	<input type="hidden" name="modo_pagina" value="${segmento}"><input type="hidden" name="pagina" value="${esc(pagina)}">
	<input type="hidden" name="lead_id" value=""><input type="hidden" name="etapa" value="completo"><input type="hidden" name="olorin_tempo" value="">
	<input type="hidden" name="utm_source" value=""><input type="hidden" name="utm_medium" value=""><input type="hidden" name="utm_campaign" value=""><input type="hidden" name="utm_content" value=""><input type="hidden" name="utm_term" value=""><input type="hidden" name="origem_clique" value="">
	<div class="mel" aria-hidden="true"><label>Não preencha este campo <input type="text" name="empresa_url" tabindex="-1" autocomplete="off"></label></div>
	<div class="form__prog" aria-hidden="true"><i class="on"></i><i></i></div>
	<div class="form__erro" role="alert" hidden data-erro-geral></div>
	<div class="form__etapa" data-etapa="1">
		<p class="form__t">${segmento === 'educacao' ? 'Raio-X da sua instituição' : segmento === 'influenciadores' ? 'Raio-X do seu perfil' : 'Raio-X da sua marca'}</p>
		<p class="form__sub">Gratuito e sem compromisso. Leva um minuto.</p>
		<div class="campo"><label for="f-nome-${pagina}">${esc(F.rotulos.nome)}</label><input id="f-nome-${pagina}" type="text" name="nome" autocomplete="name" required maxlength="80" placeholder="${esc(F.placeholders.nome)}"><span class="erro" hidden></span></div>
		<div class="campo"><label for="f-wa-${pagina}">${esc(F.rotulos.whatsapp)}</label><input id="f-wa-${pagina}" type="tel" name="whatsapp" autocomplete="tel-national" inputmode="tel" required maxlength="20" placeholder="${esc(F.placeholders.whatsapp)}"><span class="erro" hidden></span></div>
		<div class="campo"><label class="aceite"><input type="checkbox" name="consentimento" value="1" required><span>${esc(F.consentimento)} <a class="link" href="/politica-de-privacidade/" target="_blank" rel="noopener">${esc(F.consentimento_link)}</a>.</span></label><span class="erro" hidden></span></div>
		<button class="btn btn--g" type="submit" data-continuar><span>${esc(F.botao_enviar_diagnostico)}</span>${I.seta}</button>
		<p class="form__nota">${esc(F.nota)}</p>
	</div>
	<div class="form__etapa" data-etapa="2">
		<p class="form__t" data-ola>Recebido! Só mais um toque.</p>
		<p class="form__sub">Opcional, mas deixa o seu Raio-X mais certeiro.</p>
		${opcoes}
		<div class="campo"><label for="f-emp-${pagina}">${esc(seg.empresa.rotulo)}</label><input id="f-emp-${pagina}" type="text" name="empresa" autocomplete="organization" maxlength="120" placeholder="${esc(seg.empresa.placeholder)}"></div>
		<div class="campo"><label for="f-site-${pagina}">${esc(seg.site.rotulo)}</label><input id="f-site-${pagina}" type="text" name="site" maxlength="160" autocapitalize="none" placeholder="${esc(seg.site.placeholder)}"></div>
		${porte}
		<fieldset class="campo"><legend>Melhor horário para a gente te chamar</legend>${chipsDe('horario', ['Agora mesmo', 'De manhã', 'À tarde', 'À noite'], 'radio')}</fieldset>
		<div class="campo"><label for="f-email-${pagina}">${esc(F.rotulos.email)} <small>(opcional, para receber o PDF)</small></label><input id="f-email-${pagina}" type="email" name="email" autocomplete="email" maxlength="120" placeholder="${esc(F.placeholders.email)}"><span class="erro" hidden></span></div>
		<div class="campo"><label for="f-msg-${pagina}">${esc(F.rotulos.mensagem)} <small>${esc(F.rotulos.mensagem_opcional)}</small></label><textarea id="f-msg-${pagina}" name="mensagem" rows="2" maxlength="1500" placeholder="${esc(seg.mensagem_placeholder)}"></textarea></div>
		<button class="btn btn--g" type="submit" data-enviar><span>Enviar e finalizar</span>${I.seta}</button>
		<a class="form__voltar" href="/obrigado/" data-pular hidden>Pular esta parte</a>
	</div>
</form>`;
	return `<div class="form" id="form-raio-x">${janela(titulo, corpo)}</div>`;
}

/** Seção final: chamada + formulário. A mesma em todas as páginas (com textos do público). */
export function secaoFinal({ segmento = 'site', pagina = 'home', titulo = ['bora subir', 'de nível?'], texto = 'Peça o seu Raio-X gratuito. Leva um minuto, e a gente te chama no WhatsApp para marcar a conversa.', passos = D.home.orcamento.passos, mensagemWa = WA_PADRAO, janelaNome = 'raio-x.olo' } = {}) {
	return `
<section class="sec t-neon" id="raio-x" data-nivel="raio-x">
	<div class="c fim">
		<div>
			${fita('Raio-X gratuito')}
			${linhas(titulo.map(esc), 'mega fim__t', 'h2', ' style="margin-top:22px"')}
			<p class="lede" data-r>${esc(texto)}</p>
			<ol class="passos3" data-r>${passos.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>
			<div class="quem" data-r>
				${img('equipe-derek', 'Derek Gonçalves', { sizes: '74px' })}
				<div><small>Quem vai te chamar</small><b>Derek Gonçalves</b><span>${esc(S.TELEFONE_EXIBICAO)} · salve o número para reconhecer</span></div>
			</div>
			<p style="margin-top:22px;font-size:.9rem" data-r>${esc(D.formulario.alternativa_wa)} <a class="link" href="${wa(mensagemWa, 'form-fim')}" target="_blank" rel="noopener" data-wa>${esc(D.formulario.alternativa_wa_link)}</a></p>
		</div>
		<div data-r style="--d:.1s">${formulario({ segmento, pagina, titulo: janelaNome })}</div>
	</div>
</section>`;
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
			<div class="sub"><button type="button" aria-expanded="false" data-sub>Segmentos <span aria-hidden="true">▾</span></button><div class="sub__lista"><a href="/educacao/"${atual('/educacao/')}>Educação</a><a href="/influenciadores/"${atual('/influenciadores/')}>Influenciadores</a></div></div>
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
		<a href="/educacao/"${atual('/educacao/')}>educação</a>
		<a href="/influenciadores/"${atual('/influenciadores/')}>influenciadores</a>
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
			<div><h2>Segmentos</h2><ul><li><a href="/educacao/">Olorin Educação</a></li><li><a href="/influenciadores/">Olorin para influenciadores</a></li></ul></div>
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
	const cfg = { whatsapp: S.WHATSAPP, gtm: S.GTM_ID, ga4: S.GA4_ID, pixel: S.META_PIXEL_ID, modo: pg.modo || 'pagina', slug: pg.slug || '', segmento: pg.segmento || '' };
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
${pg.corpo}
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
		.replace(/(href|src|action)="\/(?!\/)([^"]*)"/g, (m, a, c) => `${a}="${base}${c.replace(/^([^#?]*\/)?(#.*|\?.*)?$/, (x, p, r) => `${p || ''}index.html${r || ''}`)}"`)
		.replace(/srcset="([^"]+)"/g, (m, s) => `srcset="${s.replace(/(^|,\s*)\//g, `$1${base}`)}"`)
		.replace(/url\(\/assets\//g, `url(${base}assets/`);
}

const ctx = { D, S, SERVICOS, NOME_SERV, ARTE_SERV, IMGS, I, esc, rico, wa, WA_PADRAO, img, btn, linhas, fita, janela, banda, formulario, secaoFinal };
const lista = paginas(ctx);

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
const php = ler('src/enviar.php')
	.replace('__LISTAS__', JSON.stringify({ servicos: [...SERVICOS.map((s) => s.chip), D.formulario.servicos_extra], horario: ['Agora mesmo', 'De manhã', 'À tarde', 'À noite'], segmentos: Object.fromEntries(Object.entries(D.formulario.segmentos).map(([k, v]) => [k, { nome: v.nome, porte: v.porte.opcoes, desafios: v.desafios ? v.desafios.opcoes : [], obrigado: k === 'site' ? '/obrigado/' : `/obrigado-${k}/` }])) }).replace(/'/g, "\\'"));
fs.writeFileSync(path.join(DIST, 'enviar.php'), php);
fs.copyFileSync(path.join(RAIZ, 'src/config.example.php'), path.join(DIST, 'config.example.php'));
fs.writeFileSync(path.join(DIST, 'olorin-ids.js'), ler('src/olorin-ids.js').replace('__GTM__', S.GTM_ID).replace('__GA4__', S.GA4_ID).replace('__PIXEL__', S.META_PIXEL_ID));
const indexaveis = lista.filter((p) => !p.noindex && !p.url.endsWith('.html'));
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexaveis.map((p) => `<url><loc>${S.URL}${p.url}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /enviar.php\nDisallow: /leads/\nDisallow: /obrigado\n\nSitemap: ${S.URL}/sitemap.xml\n`);
console.log(`${lista.length} páginas · css ${(css.length / 1024).toFixed(1)} KB · js ${(js.length / 1024).toFixed(1)} KB · v${versao}${PREVIA ? ' · prévia' : ''}`);
