/* Páginas do site novo. Cada função devolve { url, titulo, descricao, corpo, ... } para o build.mjs. */
import { internas } from './internas.mjs';

export function paginas(x) {
	return [home(x), ...internas(x)];
}

function home(x) {
	const { D, S, SERVICOS, NOME_SERV, I, esc, wa, WA_PADRAO, img, btn, linhas, fita, janela, secaoFinal, marcas, cartaoPessoa, peca, calculadora } = x;
	const H = D.home, R = H.resultados;
	const portfolio = D.portfolio.itens.slice(0, R.limite || 6);
	const filtros = D.portfolio.filtros.filter((f) => portfolio.some((p) => p.servicos.includes(f.id)));
	const numeros = D.claims.itens.filter((c) => c.verificado);

	const corpo = `
<section class="hero t-preto" data-nivel="início" data-hero>
	<div class="hero__grade" aria-hidden="true"></div>
	<div class="c hero__c">
		<div>
			${fita(H.hero.linha_superior)}
			<div class="hero__tw">
			<h1 class="giga hero__t linhas" aria-label="${esc(S.LEMA)}">
				<span class="l" aria-hidden="true"><span>sua marca</span></span>
				<span class="l" aria-hidden="true"><span>em <i class="moeda">${I.o}</i>utro</span></span>
				<span class="l" aria-hidden="true"><span>nível.</span></span>
			</h1>
			<div class="cola cola--3" aria-hidden="true" style="--n:2" data-px="1.2">${janela('nivel.olo', `<div class="nivel" data-nivel-demo><span class="nivel__mais">${esc(H.hero.jogo_aviso)}</span><div class="nivel__linha"><span>sua marca</span><span>nível</span></div><div class="nivel__linha"><span></span><b class="nivel__n" data-n>07</b></div><div class="nivel__xp"><i></i></div></div>`)}</div>
			</div>
			<div class="botoes hero__acoes">${btn(H.hero.botao_start, '#raio-x', { cls: 'btn--g', id: 'cta-diagnostico-hero' })}</div>
			<ul class="hero__checks" aria-label="${esc(H.hero.checks_rotulo)}">${H.hero.checks.map((c) => `<li>${I.check}${esc(c)}</li>`).join('')}</ul>
		</div>
		<div class="hero__cena" data-cena aria-hidden="true">
			<div class="meio-tom" data-px=".6"></div>
			${img('adesivo-estrela', '', { sizes: '(min-width:900px) 47vw, 92vw', cls: 'hero__pessoa adesivo', lazy: false })}
			<a class="cola cola--4 selo" style="--n:3" data-px="3" href="#raio-x" tabindex="-1"><span><small>grátis</small>Raio-X<br>da sua<br>marca</span></a>
		</div>
	</div>
	${marcas()}
</section>

<section class="sec t-neon" id="resultados" data-nivel="resultados">
	<div class="c">
		<div class="cab cab--lado">
			${fita(R.etiqueta)}
			${linhas(['Provas, não', 'promessas.'], 'mega')}
			<p class="lede" data-r>${esc(R.texto)}</p>
		</div>
		<div class="numeros" data-r>
			${numeros.map((n) => `<div class="numero"><b>${esc(n.valor)}</b><span>${esc(n.rotulo)}</span></div>`).join('')}
			<div class="cred"><img src="/assets/marcas/meta-original.webp" alt="Meta" width="149" height="30" loading="lazy"><img src="/assets/marcas/google-original.webp" alt="Google" width="92" height="30" loading="lazy"><b>${esc(R.credencial)}</b></div>
		</div>
	</div>
</section>

<section class="sec t-branco" id="cases" data-nivel="portfólio">
	<div class="c">
		<div class="cab cab--lado">
			${fita(R.portfolio_etiqueta)}
			${linhas(['Marcas', 'atendidas.'], 'mega')}
			<p class="lede" data-r>${esc(R.portfolio_texto)}</p>
		</div>
		<div class="filtros" data-filtros role="group" aria-label="Filtrar trabalhos por serviço" hidden><button type="button" data-filtro="" aria-pressed="true">${esc(R.filtro_todos)}</button>${filtros.map((f) => `<button type="button" data-filtro="${f.id}" aria-pressed="false">${esc(f.curto || f.rotulo)}</button>`).join('')}</div>
		<div class="trilho" data-trilho tabindex="0" aria-label="Portfólio: arraste para o lado">${portfolio.map(peca).join('')}</div>
		<div class="botoes" data-r>${btn(R.link_mais.texto, R.link_mais.url)}${btn(R.botao_instagram, S.INSTAGRAM_URL, { cls: 'btn--vazado', attrs: 'target="_blank" rel="noopener"' })}</div>
	</div>
</section>

<section class="sec t-preto" id="servicos" data-nivel="serviços">
	<div class="c">
		<div class="cab">${linhas(['O que a', 'Olorin faz'], 'mega')}</div>
		<div class="sgrade">
			${SERVICOS.map((s, i) => `<a class="scard" href="${s.url}" data-r style="--d:${i * 0.04}s"><span class="pixel">0${i + 1}</span><b>${esc(NOME_SERV[s.slug])}</b><i>${esc(H.servicos.ver_detalhes)} ${I.seta}</i></a>`).join('')}
		</div>
		<div class="servs__pe" data-r>
			<p class="medio">${esc(H.servicos.faixa_texto)}</p>
			${btn(H.hero.botao, '#raio-x', { cls: 'btn--g' })}
		</div>
	</div>
</section>

${calculadora()}

<section class="sec t-preto" id="equipe" data-nivel="time">
	<div class="c">
		<div class="cab cab--lado">
			${fita(H.equipe.etiqueta)}
			${linhas(['Fale com quem', 'coordena.'], 'mega')}
			<p class="lede" data-r>${esc(H.equipe.texto)}</p>
		</div>
		<div class="time time--c">${D.equipe.pessoas.map((p, i) => cartaoPessoa(p, i)).join('')}</div>
		<div class="botoes" data-r style="margin-top:clamp(24px,3.4vw,44px)">${btn(H.equipe.botao, wa(WA_PADRAO, 'equipe'), { wa: true, cls: 'btn--g' })}${btn(H.equipe.link_sobre, '/quem-somos/', { cls: 'btn--vazado btn--g' })}</div>
	</div>
</section>

${secaoFinal({ pagina: 'home' })}`;

	return {
		url: '/', modo: 'home', slug: 'home', titulo: H.seo.titulo, descricao: H.seo.descricao, corpo,
		preload: `<link rel="preload" as="image" href="/assets/img/${x.IMGS['adesivo-estrela'][1].arq}" imagesrcset="${x.IMGS['adesivo-estrela'].map((i) => `/assets/img/${i.arq} ${i.w}w`).join(', ')}" imagesizes="(min-width:900px) 47vw, 92vw" fetchpriority="high">`,
		esquema: [{ '@context': 'https://schema.org', '@type': 'WebSite', url: S.URL + '/', name: S.NOME, inLanguage: 'pt-BR' }],
	};
}
