/* Páginas do site novo. Cada função devolve { url, titulo, descricao, corpo, ... } para o build.mjs. */
import { internas } from './internas.mjs';

export function paginas(x) {
	return [home(x), ...internas(x)];
}

function home(x) {
	const { D, S, SERVICOS, NOME_SERV, ARTE_SERV, I, esc, wa, WA_PADRAO, img, btn, linhas, fita, janela, banda, secaoFinal } = x;
	const H = D.home;
	const logos = D.clientes.itens.map((c) => `<img src="/assets/clientes/${c.logo}" alt="${esc(c.nome)}" width="${c.largura}" height="${c.altura}" loading="lazy">`).join('');
	const portfolio = D.portfolio.itens;
	const equipe = D.equipe.pessoas;
	const FOTO = { 'natalia-arruda': 'equipe-natalia', 'vinicius-mafra': 'equipe-vinicius', 'derek-goncalves': 'equipe-derek' };
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
			<div class="cola cola--3" aria-hidden="true" style="--n:2" data-px="1.2">${janela('nivel.olo', `<div class="nivel" data-nivel-demo><span class="nivel__mais">+1 nível</span><div class="nivel__linha"><span>sua marca</span><span>nível</span></div><div class="nivel__linha"><span></span><b class="nivel__n" data-n>07</b></div><div class="nivel__xp"><i></i></div></div>`)}</div>
			</div>
			<div class="botoes hero__acoes">
				${btn(H.hero.botao_start, '#raio-x', { cls: 'btn--g', id: 'cta-diagnostico-hero' })}
				${btn('Falar no WhatsApp', wa(WA_PADRAO, 'hero'), { wa: true, cls: 'btn--vazado btn--g' })}
			</div>
			<ul class="hero__checks" aria-label="${esc(H.hero.checks_rotulo)}">${H.hero.checks.map((c) => `<li>${I.check}${esc(c)}</li>`).join('')}</ul>
		</div>
		<div class="hero__cena" data-cena aria-hidden="true">
			<div class="meio-tom" data-px=".6"></div>
			${img('adesivo-estrela', '', { sizes: '(min-width:900px) 47vw, 92vw', cls: 'hero__pessoa adesivo', lazy: false })}
			<div class="cola cola--1 toast" style="--n:0" data-px="1.8"><span class="toast__ic">${I.o}</span><span><small>instagram · agora</small><b>novo contato recebido</b></span></div>
			<div class="cola cola--2 toast" style="--n:1" data-px="2.4"><span class="toast__ic">${I.o}</span><span><small>whatsapp · 2 min</small><b>“quero um orçamento”</b></span></div>
			<a class="cola cola--4 selo" style="--n:3" data-px="3" href="#raio-x" tabindex="-1"><span><small>grátis</small>raio-x<br>da sua<br>marca</span></a>
		</div>
	</div>
	<div class="marcas">
		<div class="c marcas__r">
			<p class="pixel">${esc(D.clientes.etiqueta)}</p>
			<div class="rolo" data-rolo><div class="rolo__trilho">${logos}</div><div class="rolo__trilho" aria-hidden="true">${logos.replace(/alt="[^"]*"/g, 'alt=""')}</div></div>
			<button class="pausa" type="button" aria-label="Pausar a faixa de logos" aria-pressed="false" data-rolo-pausa>❚❚</button>
		</div>
	</div>
</section>

<section class="sec t-neon" id="servicos" data-nivel="serviços">
	<div class="c">
		<div class="cab cab--lado">
			${fita('O que a Olorin faz')}
			${linhas(['tudo num', 'time só.'], 'mega')}
			<p class="lede" data-r>Anúncio, redes, marca, site, impressos e dados com o mesmo time, a mesma estratégia e um relatório todo mês.</p>
		</div>
		<div class="servs" data-servs>
			${SERVICOS.map((s, i) => `<a class="serv" href="${s.url}" data-r style="--d:${i * 0.05}s"${ARTE_SERV[s.slug] ? ` data-previa="/assets/img/${x.IMGS[ARTE_SERV[s.slug]][0].arq}"` : ''}>
				<span class="serv__n">0${i + 1}</span>
				<span><span class="serv__nome">${esc(NOME_SERV[s.slug])}</span><span class="serv__txt">${esc(s.card.resumo_curto)}</span></span>
				<span class="serv__seta" aria-hidden="true">${I.seta}</span>
			</a>`).join('')}
		</div>
		<div class="servs__pe" data-r>
			<p class="medio">${esc(H.servicos.faixa_texto)}</p>
			${btn(H.hero.botao, '#raio-x', { cls: 'btn--g' })}
		</div>
	</div>
	<div class="previa" data-previa-caixa aria-hidden="true"><img alt="" width="300" height="320"></div>
</section>

<section class="sec t-preto" id="como-funciona" data-nivel="raio-x">
	<div class="c rx">
		<div>
			${fita('Raio-X gratuito')}
			${linhas(['primeiro,', 'o raio-x.'], 'mega', 'h2', ' style="margin-top:22px"')}
			<p class="lede" data-r style="margin-top:22px">Antes de qualquer proposta, a gente olha o que já existe. Uma conversa de 30 minutos por vídeo e um PDF com o que mais trava o seu resultado. Sem compromisso.</p>
			<ol class="rx__passos" data-r>
				<li><div><b>${esc(H.orcamento.passos[0])}</b><span>Nome e WhatsApp. Leva um minuto.</span></div></li>
				<li><div><b>${esc(H.orcamento.passos[1])}</b><span>Anúncio, redes, site e material da marca.</span></div></li>
				<li><div><b>${esc(H.orcamento.passos[2])}</b><span>Os pontos que travam e por onde começar.</span></div></li>
			</ol>
			<div data-r>${btn(H.hero.botao, '#raio-x', { cls: 'btn--g', id: 'cta-raio-x-meio' })}</div>
		</div>
		<div>
			<div class="rx__palco" data-r>
				<div class="scan" data-scan role="img" aria-label="Demonstração: o Raio-X da Olorin passa por um perfil e aponta o que trava o resultado.">
					<div class="scan__cam scan__tela">${mockPerfil(I)}</div>
					<div class="scan__cam scan__raio">${img('raio-x-celular', '', { sizes: '300px' })}</div>
					<div class="scan__feixe"></div>
				</div>
				<span class="achado toast" style="--t:14%;--r:-2%;--giro:3deg" data-achado=".72">bio sem chamada</span>
				<span class="achado toast" style="--t:38%;--l:-4%;--giro:-4deg" data-achado=".5">anúncio sem medição</span>
				<span class="achado toast" style="--t:60%;--r:-6%;--giro:2deg" data-achado=".3">site lento no celular</span>
				<span class="achado toast" style="--t:82%;--l:22%;--giro:-2deg" data-achado=".12">resposta demorada</span>
				${img('adesivo-lupa', '', { sizes: '300px', cls: 'rx__lupa adesivo' })}
			</div>
			<p class="rx__nota">Exemplo ilustrativo. Arraste o feixe para examinar.</p>
		</div>
	</div>
</section>

${banda('provas, não promessas', 't-neon', 'banda--torta')}

<section class="sec t-branco" id="provas" data-nivel="provas">
	<div class="c">
		<div class="cab cab--lado">
			${fita(H.resultados.etiqueta)}
			${linhas(['provas, não', 'promessas.'], 'mega')}
			<p class="lede" data-r>${esc(H.resultados.portfolio_texto)}</p>
		</div>
		<div class="numeros" data-r>
			${numeros.map((n) => `<div class="numero"><b>${esc(n.valor)}</b><span>${esc(n.rotulo)}</span></div>`).join('')}
			<div class="cred"><img src="/assets/marcas/meta-original.webp" alt="Meta" width="149" height="30" loading="lazy"><img src="/assets/marcas/google-original.webp" alt="Google" width="92" height="30" loading="lazy"><b>${esc(H.resultados.credencial)}</b></div>
		</div>
		<div class="trilho" data-trilho tabindex="0" aria-label="Portfólio: arraste para o lado">
			${portfolio.map((p) => `<figure class="peca"><div class="peca__img">${img(p.imagem, `Trabalho para ${p.titulo}`, { sizes: '(min-width:900px) 26vw, 240px' })}</div><figcaption><b>${esc(p.titulo)}</b><span>${esc(p.rotulo)}</span></figcaption></figure>`).join('')}
		</div>
		<div class="botoes" data-r>${btn(H.resultados.link_mais.texto, '/portfolio/')}${btn(H.resultados.botao_instagram, S.INSTAGRAM_URL, { cls: 'btn--vazado', attrs: 'target="_blank" rel="noopener"' })}</div>
	</div>
</section>

<section class="sec t-violeta" id="segmentos" data-nivel="segmentos">
	<div class="c">
		<div class="cab">
			${fita('Segmentos')}
			${linhas(['cada jogo,', 'uma fase.'], 'mega')}
			<p class="lede" data-r>Escolas e criadores de conteúdo têm frentes só deles na Olorin, com método, calendário e linguagem próprios.</p>
		</div>
		<div class="portas">
			<a class="porta" href="/educacao/" data-r>
				${fita('Olorin Educação')}
				<div><p class="porta__t">sua escola<br>em <em>outro<br>nível.</em></p><p style="margin-top:14px">Captação de alunos para escolas, cursos e faculdades.</p></div>
				<span class="porta__ir">conhecer ${I.seta}</span>
				${img('adesivo-educacao', '', { sizes: '(min-width:860px) 30vw, 60vw' })}
			</a>
			<a class="porta" href="/influenciadores/" data-r style="--d:.1s">
				${fita('Olorin para influenciadores')}
				<div><p class="porta__t">seu perfil<br>em <em>outro<br>nível.</em></p><p style="margin-top:14px">Estratégia, conteúdo, design e anúncio para quem cria.</p></div>
				<span class="porta__ir">conhecer ${I.seta}</span>
				${img('adesivo-fone', '', { sizes: '(min-width:860px) 30vw, 60vw' })}
			</a>
		</div>
	</div>
</section>

<section class="sec t-preto" id="time" data-nivel="time">
	<div class="c">
		<div class="cab cab--lado">
			${fita(H.equipe.etiqueta)}
			${linhas(['fale com quem', 'coordena.'], 'mega')}
			<p class="lede" data-r>${esc(H.equipe.texto)}</p>
		</div>
		<div class="time">
			${equipe.map((p, i) => `<a class="jog" href="/quem-somos/${p.slug}/" data-r style="--d:${i * 0.08}s">
				<div class="jog__foto">${img(FOTO[p.slug], `Foto de ${p.nome}`, { sizes: '(min-width:900px) 30vw, 92vw' })}<span class="jog__p">player ${i + 1}</span></div>
				<div class="jog__info"><b>${esc(p.nome)}</b><span>${esc(p.funcao)}</span><i>${esc(H.equipe.ver_perfil)} →</i></div>
			</a>`).join('')}
		</div>
		<div class="botoes" data-r style="margin-top:clamp(28px,4vw,48px)">${btn(H.equipe.link_sobre, '/quem-somos/', { cls: 'btn--vazado' })}</div>
	</div>
</section>

${secaoFinal({ pagina: 'home' })}`;

	return {
		url: '/', modo: 'home', slug: 'home', titulo: H.seo.titulo, descricao: H.seo.descricao, corpo,
		preload: `<link rel="preload" as="image" href="/assets/img/${x.IMGS['adesivo-estrela'][1].arq}" imagesrcset="${x.IMGS['adesivo-estrela'].map((i) => `/assets/img/${i.arq} ${i.w}w`).join(', ')}" imagesizes="(min-width:900px) 47vw, 92vw" fetchpriority="high">`,
		esquema: [{ '@context': 'https://schema.org', '@type': 'WebSite', url: S.URL + '/', name: S.NOME, inLanguage: 'pt-BR' }],
	};
}

/** Perfil de exemplo dentro do celular do Raio-X (só CSS, sem imagem). */
function mockPerfil(I) {
	return `<div class="perfil" aria-hidden="true">
	<div class="perfil__topo"><span>@suamarca</span><span>···</span></div>
	<div class="perfil__cab"><span class="perfil__av">${I.pixel}</span><span><b>128</b>posts</span><span><b>2.431</b>seguidores</span></div>
	<div class="perfil__bio"><b>Sua Marca</b><i></i><i style="width:62%"></i></div>
	<div class="perfil__bts"><span>seguir</span><span>mensagem</span></div>
	<div class="perfil__grade">${'<i></i>'.repeat(12)}</div>
</div>`;
}
