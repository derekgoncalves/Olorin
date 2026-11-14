/* Páginas internas: serviços, Educação, Influenciadores, quem somos e perfis, sobre, portfólio,
   privacidade, obrigado e 404. Os textos vêm de dados/conteudo.json. */
export function internas(x) {
	const { D, S, SERVICOS, NOME_SERV, ARTE_SERV, I, esc, rico, wa, WA_PADRAO, img, btn, linhas, fita, janela, banda, secaoFinal, marcas, secTime } = x;
	const P = D.paginas;
	const equipe = D.equipe.pessoas;
	const FOTO = { 'natalia-arruda': 'equipe-natalia', 'vinicius-mafra': 'equipe-vinicius', 'derek-goncalves': 'equipe-derek' };
	const pessoa = (slug) => equipe.find((p) => p.slug === slug);
	const md = (t) => rico(t).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	/** Quebra um título em linhas no ponto final ou na vírgula ("Anúncios que lucram." fica inteiro). */
	const partir = (t) => {
		const s = String(t).trim();
		const p = s.match(/[^.?!]+[.?!]?/g).map((v) => v.trim()).filter(Boolean);
		if (p.length > 1) return p;
		const pal = s.split(' ');
		if (pal.length < 3) return [s];
		const meio = Math.ceil(pal.length / 2);
		return [pal.slice(0, meio).join(' '), pal.slice(meio).join(' ')];
	};
	const cab = (etiqueta, titulo, texto, { lado = true, cls = 'mega', tag = 'h2' } = {}) => `<div class="cab${lado && texto ? ' cab--lado' : ''}">${etiqueta ? fita(etiqueta) : ''}${linhas((Array.isArray(titulo) ? titulo : partir(titulo)).map(esc), cls, tag)}${texto ? `<p class="lede" data-r>${esc(texto)}</p>` : ''}</div>`;
	const capa = ({ tema, etiqueta, titulo, texto, botoes = '', arte = '', nivel = 'início', cls = '' }) => `
<section class="capa ${tema} ${cls}" data-nivel="${nivel}">
	<div class="c capa__c">
		<div class="capa__txt">
			${fita(etiqueta)}
			${linhas((Array.isArray(titulo) ? titulo : partir(titulo)).map((t) => (t.includes('<') ? t : esc(t))), 'giga capa__t', 'h1')}
			${texto ? `<p class="lede" data-r>${esc(texto)}</p>` : ''}
			${botoes ? `<div class="botoes" data-r style="--d:.1s">${botoes}</div>` : ''}
		</div>
		${arte ? `<div class="capa__arte">${arte}</div>` : ''}
	</div>
</section>`;
	const checks = (itens) => `<ul class="hero__checks capa__checks" data-r>${itens.map((c) => `<li>${I.check}${esc(c)}</li>`).join('')}</ul>`;
	const peca = (p) => `<figure class="peca" data-servicos="${p.servicos.join(' ')}"><div class="peca__img">${img(p.imagem, `Trabalho para ${p.titulo}`, { sizes: '(min-width:900px) 26vw, 240px' })}</div><figcaption><b>${esc(p.titulo)}</b><span>${esc(p.rotulo)}</span></figcaption></figure>`;
	const cartaoPessoa = (p, i, frase) => `<a class="jog" href="/quem-somos/${p.slug}/" data-r style="--d:${i * 0.08}s">
		<div class="jog__foto">${img(FOTO[p.slug], `Foto de ${p.nome}`, { sizes: '(min-width:900px) 30vw, 92vw' })}<span class="jog__p">player ${i + 1}</span></div>
		<div class="jog__info"><b>${esc(p.nome)}</b><span>${esc(p.funcao)}</span>${frase ? `<span class="jog__frase">${esc(frase)}</span>` : ''}<i>Ver perfil →</i></div></a>`;
	const secEquipe = (E, tema = 't-preto', frases = null) => `
<section class="sec ${tema}" id="equipe" data-nivel="time">
	<div class="c">${cab(E.etiqueta, E.titulo, E.texto)}
		<div class="time">${equipe.map((p, i) => cartaoPessoa(p, i, frases ? frases[p.slug] : '')).join('')}</div>
	</div>
</section>`;
	const out = [];

	/* ---------- Serviços ---------- */
	const TEMAS = {
		'trafego-pago': ['t-neon', 't-preto', 't-branco', 't-preto', 't-branco'],
		'redes-sociais': ['t-violeta', 't-preto', 't-branco', 't-preto', 't-branco'],
		'identidade-visual': ['t-branco', 't-preto', 't-branco', 't-preto', 't-branco'],
		'material-impresso': ['t-preto', 't-branco', 't-preto', 't-branco', 't-preto'],
		'site-e-loja-virtual': ['t-neon', 't-preto', 't-branco', 't-preto', 't-branco'],
		'rastreamento-e-relatorio': ['t-violeta', 't-preto', 't-branco', 't-preto', 't-branco'],
	};
	for (const s of SERVICOS) {
		const T = TEMAS[s.slug];
		const msgWa = `Oi! Vim pela página de ${s.nome} da Olorin e quero saber do Raio-X.`;
		const trabalhos = D.portfolio.itens.filter((p) => p.servicos.includes(s.slug));
		const linhasJanela = `<ul class="lista-ok">${s.hero.janela_linhas.map((l) => `<li>${I.check}<span>${esc(l)}</span></li>`).join('')}</ul>`;
		const arte = `${ARTE_SERV[s.slug] ? img(ARTE_SERV[s.slug], '', { sizes: '(min-width:900px) 40vw, 80vw', cls: 'capa__pessoa adesivo', lazy: false }) : `<div class="capa__icones" aria-hidden="true">${I.o}${I.pixel}</div>`}<div class="capa__janela" data-r="cola" style="--fim:-3deg">${janela(s.janela, linhasJanela)}</div>`;
		const corpo = `
${capa({ tema: T[0], etiqueta: s.hero.eyebrow, titulo: s.hero.h1, texto: s.hero.sub, arte, botoes: btn('Quero meu Raio-X', '#raio-x', { cls: 'btn--g', id: 'cta-diagnostico-hero' }) + btn('Falar no WhatsApp', wa(msgWa, 'hero-servico'), { wa: true, cls: 'btn--vazado btn--g' }) })}
${marcas()}
<section class="sec ${T[1]}" data-nivel="o que é">
	<div class="c duas">
		<div>${fita(s.nome)}${linhas(partir(s.o_que_e.titulo).map(esc), 'mega', 'h2', ' style="margin-top:22px"')}
			<ul class="tags" data-r>${s.o_que_e.destaques.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
		<div class="prosa" data-r>${s.o_que_e.texto.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
	</div>
</section>
<section class="sec ${T[2]}" data-nivel="sinais">
	<div class="c">${cab(s.dores.etiqueta, s.dores.titulo, s.dores.texto)}
		<div class="grade grade--4">${s.dores.itens.map((d, i) => `<article class="cartao" data-r style="--d:${i * 0.06}s"><span class="pixel">0${i + 1}</span><h3 class="medio">${esc(d.titulo)}</h3><p>${esc(d.texto)}</p></article>`).join('')}</div>
	</div>
</section>
<section class="sec ${T[3]}" data-nivel="entregas">
	<div class="c">${cab('Entregas', s.entregas.titulo, s.entregas.texto)}
		<ul class="entregas">${s.entregas.itens.map((e, i) => `<li data-r style="--d:${(i % 2) * 0.06}s"><span class="pixel">${esc(e.frequencia)}</span><h3 class="medio">${esc(e.titulo)}</h3><p>${esc(e.texto)}</p></li>`).join('')}</ul>
		${s.ferramentas ? `<div class="ferr" data-r><div><p class="pixel acento">${esc(s.ferramentas.etiqueta)}</p><h3 class="grande" style="margin:12px 0">${esc(s.ferramentas.titulo)}</h3><p class="lede">${esc(s.ferramentas.texto)}</p>${s.ferramentas.credencial ? `<p class="ferr__cred"><b>${esc(s.ferramentas.credencial.titulo)}</b> ${rico(s.ferramentas.credencial.funcao)}.</p>` : ''}</div><ul class="ferr__logos">${s.ferramentas.itens.map((f) => `<li><img src="/assets/marcas/${f.logo}.svg" alt="" width="22" height="22" loading="lazy">${esc(f.nome)}</li>`).join('')}</ul></div>` : ''}
	</div>
</section>
<section class="sec ${T[4]}" data-nivel="na prática">
	<div class="c">${trabalhos.length ? `${cab('Portfólio', s.portfolio.titulo, s.portfolio.texto)}
		<div class="trilho" data-trilho tabindex="0" aria-label="Portfólio: arraste para o lado">${trabalhos.map(peca).join('')}</div>` : ''}
		<div class="combina"><p class="pixel">Combina com</p>${s.combina_com.map((c) => { const o = SERVICOS.find((v) => v.slug === c.slug); return `<a class="combina__i" href="${o.url}" data-r><b class="grande">${esc(NOME_SERV[o.slug])}</b><span>${esc(c.porque)}</span>${I.seta}</a>`; }).join('')}</div>
		<p class="quem-faz" data-r>Quem coordena: ${s.quem_faz.map((q) => `<a class="link" href="/quem-somos/${q}/">${esc(pessoa(q).nome)}</a>`).join(' e ')}.</p>
	</div>
</section>
${secTime(T[4] === 't-preto' ? 't-branco' : 't-preto')}
${secaoFinal({ pagina: s.slug, servico: s.slug, nomeServico: s.nome, mensagemWa: msgWa })}`;
		out.push({
			url: s.url, modo: 'servico', slug: s.slug, titulo: s.seo.title, descricao: s.seo.description, corpo, mensagemWa: msgWa,
			esquema: [{ '@context': 'https://schema.org', '@type': 'Service', name: s.nome, description: s.resposta_curta, provider: { '@id': S.URL + '/#org' }, areaServed: 'BR', url: S.URL + s.url }],
		});
	}

	/* hub de serviços */
	{
		const H = P.servicos, nomeDe = (slug) => SERVICOS.find((v) => v.slug === slug);
		out.push({
			url: '/servicos/', modo: 'hub', slug: 'servicos', titulo: H.seo.titulo, descricao: H.seo.descricao,
			corpo: `${capa({ tema: 't-preto', etiqueta: H.etiqueta, titulo: H.titulo, texto: H.texto, cls: 'capa--baixa', botoes: btn('Quero meu Raio-X', '#raio-x', { cls: 'btn--g', id: 'cta-diagnostico-hero' }) })}
${marcas()}
<section class="sec t-neon" id="servicos" data-nivel="serviços"><div class="c">${cab(H.cards.etiqueta, H.cards.titulo, H.cards.texto)}<div class="servs">${SERVICOS.map((s, i) => `<a class="serv" href="${s.url}" data-r><span class="serv__n">0${i + 1}</span><span><span class="serv__nome">${esc(NOME_SERV[s.slug])}</span><span class="serv__txt">${esc(s.card.resumo)}</span></span><span class="serv__seta" aria-hidden="true">${I.seta}</span></a>`).join('')}</div></div></section>
<section class="sec t-preto" id="por-onde-comecar" data-nivel="por onde começar"><div class="c">${cab(H.escolher.etiqueta, H.escolher.titulo, '')}
	<div class="grade grade--3">${H.escolher.situacoes.map((c, i) => `<article class="cartao" data-r style="--d:${i * 0.06}s"><span class="pixel">${esc(nomeDe(c.servico).nome)}</span><h3 class="medio medio--frase">${esc(c.situacao)}</h3><p>${esc(c.porque)}</p><a class="link" href="${nomeDe(c.servico).url}">Ver o serviço →</a></article>`).join('')}</div>
	<div class="servs__pe" data-r><p class="medio medio--frase">${esc(H.escolher.nao_sei)}</p>${btn('Quero meu Raio-X', '#raio-x', { cls: 'btn--g' })}</div>
</div></section>
<section class="sec t-branco" id="combinacoes" data-nivel="combinações"><div class="c">${cab(H.combinacoes.etiqueta, H.combinacoes.titulo, H.combinacoes.texto)}
	<div class="grade grade--2">${H.combinacoes.itens.map((c, i) => `<article class="cartao cartao--g" data-r style="--d:${i * 0.06}s"><span class="pixel">${esc(c.janela)}</span><h3 class="grande grande--frase">${esc(c.nome)}</h3><p>${esc(c.texto)}</p><div>${btn(H.combinacoes.botao, wa(`Oi! Vim pelo site da Olorin e quero saber da combinação ${c.nome}.`, 'combinacao'), { wa: true })}</div></article>`).join('')}</div>
</div></section>
${secTime('t-preto')}
${secaoFinal({ pagina: 'servicos' })}`,
		});
	}

	/* ---------- Olorin Educação ---------- */
	{
		const E = P.educacao, B = E.hero.boletim, msg = E.whatsapp.padrao;
		const boletim = janela(B.janela, `<p class="medio">${esc(B.titulo)}</p><p class="pixel" style="margin:6px 0 10px;font-size:.62rem">${esc(B.escola)} · ${esc(B.periodo)}</p>
			<table class="boletim"><thead><tr><th>${esc(B.coluna_materia)}</th><th>${esc(B.coluna_nota)}</th></tr></thead><tbody>${B.materias.map((m) => `<tr${m.alerta ? ' class="alerta"' : ''}><td>${esc(m.nome)}${m.obs ? `<small>${esc(m.obs)}</small>` : ''}</td><td>${esc(m.nota)}</td></tr>`).join('')}</tbody></table><p class="boletim__aviso">${esc(B.aviso)}</p>`);
		const C = E.calendario, mesAtual = new Date().getMonth() + 1;
		const corpo = `
${capa({ tema: 't-violeta', etiqueta: E.hero.etiqueta, titulo: ['sua escola', 'em outro', 'nível.'], texto: `${E.hero.apoio} ${E.hero.texto}`, cls: 'capa--edu',
		botoes: btn(E.hero.botao, '#raio-x', { cls: 'btn--g', id: 'cta-diagnostico-hero' }) + btn(E.cabecalho.whatsapp, wa(msg, 'hero-educacao'), { wa: true, cls: 'btn--vazado btn--g' }),
		arte: `${img('adesivo-educacao', '', { sizes: '(min-width:900px) 46vw, 90vw', cls: 'capa__pessoa adesivo', lazy: false })}<div class="capa__janela capa__janela--boletim" data-r="cola" style="--fim:2deg">${boletim}</div>` })}
${banda(E.regua.join('  ✦  '), 't-preto')}
<section class="sec t-branco" id="para-quem" data-nivel="para quem">
	<div class="c duas">
		<div>${fita(E.chamada.etiqueta)}${linhas(['feita para', 'quem vende', 'matrícula.'], 'mega', 'h2', ' style="margin-top:22px"')}<p class="lede" data-r style="margin-top:22px">${esc(E.chamada.texto)}</p><p data-r style="margin-top:14px;font-size:.9rem">${esc(E.chamada.nota)}</p></div>
		<div data-r>${janela(E.chamada.janela, `<p class="pixel" style="margin-bottom:10px">${esc(E.chamada.turma)}</p><ul class="chamada">${E.chamada.itens.map((i) => `<li><span>${esc(i)}</span><b>${esc(E.chamada.presente)}</b></li>`).join('')}<li class="falta"><span>${esc(E.chamada.ausente_texto)}</span><b>${esc(E.chamada.ausente)}</b></li></ul>`)}</div>
	</div>
</section>
<section class="sec t-preto" id="calendario" data-nivel="calendário">
	<div class="c">${cab(C.etiqueta, C.titulo, C.texto)}
		<ol class="cal">${C.meses.map((m, i) => `<li class="cal__m${m.pico ? ' pico' : ''}${m.mes === mesAtual ? ' aqui' : ''}" data-r style="--d:${i * 0.07}s"><span class="pixel">${esc(m.nome)}${m.mes === mesAtual ? ` · ${esc(C.aqui)}` : ''}</span><b class="grande">${esc(m.fase)}</b><p>${esc(m.texto)}</p><div class="cal__turma" aria-hidden="true">${Array.from({ length: C.vagas }, (_, k) => `<i${k < m.turma ? ' class="on"' : ''}></i>`).join('')}</div></li>`).join('')}</ol>
		<p class="cal__nota" data-r>${esc(C.turma_legenda)} ${esc(C.nota)}</p>
		<div data-r style="margin-top:28px">${btn(C.botao, '#raio-x', { cls: 'btn--g' })}</div>
	</div>
</section>
<section class="sec t-branco" id="cases" data-nivel="clientes">
	<div class="c">${cab(E.cases.etiqueta, E.cases.titulo, E.cases.texto)}
		<div class="grade grade--2">${D.cases.itens.map((c, i) => `<article class="cartao cartao--g" data-r style="--d:${i * 0.08}s"><span class="pixel">${esc(E.cases.ficha)} 0${i + 1} · ${esc(E.cases.carimbo)}</span><h3 class="grande">${esc(c.edu.nome)}</h3><dl class="ficha">${c.edu.campos.map((f) => `<div><dt>${esc(f.rotulo)}</dt><dd>${esc(f.valor)}</dd></div>`).join('')}<div><dt>Serviços</dt><dd>${esc(c.servicos_texto)}</dd></div></dl>${c.edu.site ? `<a class="link" href="${c.edu.site}" target="_blank" rel="noopener">${esc(c.edu.site_texto)} ↗</a>` : ''}</article>`).join('')}</div>
	</div>
</section>
${secEquipe(E.equipe, 't-preto', E.equipe.frases)}
${secaoFinal({ segmento: 'educacao', pagina: 'educacao', mensagemWa: msg, titulo: ['turma cheia', 'não é sorte.'], texto: 'Peça o Raio-X gratuito da sua instituição. Leva um minuto, e a gente te chama no WhatsApp para marcar a conversa.', passos: E.raio_x.passos, janelaNome: E.formulario.barra_topo })}`;
		out.push({ url: '/educacao/', modo: 'educacao', slug: 'educacao', segmento: 'educacao', titulo: E.seo.titulo, descricao: E.seo.descricao, corpo, mensagemWa: msg, og: 'educacao' });
	}

	/* ---------- Olorin para influenciadores ---------- */
	{
		const F = P.influenciadores, msg = F.whatsapp.padrao;
		const corpo = `
${capa({ tema: 't-preto', etiqueta: F.hero.etiqueta, titulo: ['seu perfil', 'em outro', '<em class="acento">nível.</em>'], texto: F.hero.texto, cls: 'capa--inf',
		botoes: btn(F.hero.botao, '#raio-x', { cls: 'btn--g', id: 'cta-diagnostico-hero' }) + btn(F.cabecalho.whatsapp, wa(msg, 'hero-influenciadores'), { wa: true, cls: 'btn--vazado btn--g' }),
		arte: `<div class="visor">${img('influenciadores-hero', 'Pessoa diante de uma parede de telas acesas', { sizes: '(min-width:900px) 34vw, 80vw', lazy: false })}<span class="visor__rec pixel">● ${esc(F.hero.osd.rec)}</span><span class="visor__ch pixel">${esc(F.hero.osd.canal)}</span><span class="visor__play pixel">${esc(F.hero.osd.fita)}</span></div>${img('adesivo-criadora', '', { sizes: '(min-width:900px) 18vw, 40vw', cls: 'visor__adesivo adesivo' })}` })}
${banda(F.faixa.join('  ✦  '), 't-neon')}
<section class="sec t-branco" id="para-quem" data-nivel="para quem">
	<div class="c">${cab(F.para_quem.etiqueta, F.para_quem.titulo, F.para_quem.texto)}
		<div class="grade grade--3">${F.para_quem.perfis.map((p, i) => `<article class="cartao" data-r style="--d:${i * 0.06}s"><span class="pixel">0${i + 1}</span><h3 class="medio">${esc(p.nome)}</h3><p>${esc(p.texto)}</p></article>`).join('')}</div>
		<div class="nichos" data-r><p class="pixel">${esc(F.para_quem.nichos_rotulo)}</p><ul class="tags">${F.para_quem.nichos.map((n) => `<li>${esc(n)}</li>`).join('')}</ul><p style="margin-top:18px;font-weight:700">${esc(F.para_quem.fora)}</p></div>
	</div>
</section>
<section class="sec t-preto" id="canais" data-nivel="programação">
	<div class="c">${cab(F.canais.etiqueta, ['a programação', 'do seu perfil.'], F.canais.texto, { lado: false })}
		<ul class="canais">${F.canais.itens.map((c, i) => `<li data-r style="--d:${i * 0.05}s"><span class="canais__ch">${esc(F.canais.rotulo_canal)} ${esc(c.canal)}</span><div><h3 class="grande">${esc(c.nome)}</h3><p>${esc(c.texto)}</p></div><span class="pixel canais__tag">${esc(c.tag)}</span></li>`).join('')}</ul>
	</div>
</section>
<section class="sec t-branco" id="enquadramento" data-nivel="estratégia">
	<div class="c duas">
		<div>${fita(F.enquadramento.etiqueta)}${linhas(['primeiro o', 'enquadramento.', 'depois o play.'], 'grande quadro__t', 'h2', ' style="margin-top:22px"')}<p class="lede" data-r style="margin-top:22px">${esc(F.enquadramento.texto)}</p><div data-r style="margin-top:26px">${btn(F.enquadramento.botao, '#raio-x', { cls: 'btn--g' })}</div></div>
		<div class="quadro" data-r>${img('influenciadores-quadro', 'Criadora enquadrando o rosto com as mãos', { sizes: '(min-width:900px) 40vw, 92vw' })}<span class="pixel quadro__a">● ${esc(F.enquadramento.visor.rec)} ${esc(F.enquadramento.visor.tempo)}</span><span class="pixel quadro__b">${esc(F.enquadramento.visor.info)}</span>${img('adesivo-fone', '', { sizes: '200px', cls: 'quadro__adesivo adesivo' })}</div>
	</div>
</section>
<section class="sec t-preto" id="como-funciona" data-nivel="roteiro">
	<div class="c">${cab(F.como_funciona.etiqueta, F.como_funciona.titulo, F.como_funciona.texto)}
		<div class="roteiro-l"><div class="roteiro" data-r>${janela(`${F.como_funciona.roteiro.titulo} · ${F.como_funciona.roteiro.formato}`, `<ol class="cenas">${F.como_funciona.passos.map((p) => `<li><span class="pixel">${esc(p.tempo)} · ${esc(p.cena)}</span><b class="medio">${esc(p.titulo)}</b><span>${esc(p.texto)}</span></li>`).join('')}</ol><p class="postit">${esc(F.como_funciona.postit)}</p>`)}</div><div class="roteiro__arte" data-r style="--d:.12s">${img('adesivo-selfie', '', { sizes: '(min-width:900px) 30vw, 70vw', cls: 'adesivo' })}<span class="fita">${esc(F.como_funciona.adesivo_tag)}</span></div></div>
	</div>
</section>
${secEquipe(F.equipe, 't-branco', F.equipe.frases).replace('class="sec t-branco"', 'class="sec t-branco sec--time-claro"')}
${secaoFinal({ segmento: 'influenciadores', pagina: 'influenciadores', mensagemWa: msg, titulo: ['bora dar', 'o play?'], texto: 'Peça o Raio-X gratuito do seu perfil. Leva um minuto, e a gente te chama no WhatsApp.', passos: F.como_funciona.passos.map((p) => p.titulo), janelaNome: F.formulario.barra_topo })}`;
		out.push({ url: '/influenciadores/', modo: 'influenciadores', slug: 'influenciadores', segmento: 'influencer', titulo: F.seo.titulo, descricao: F.seo.descricao, corpo, mensagemWa: msg, og: 'influenciadores' });
	}

	/* ---------- Quem somos + perfis ---------- */
	{
		const Q = P.sobre;
		const msg = 'Oi! Vim pelo site da Olorin e quero falar com a equipe.';
		const corpo = `
${capa({ tema: 't-preto', etiqueta: Q.etiqueta, titulo: ['Um time inteiro.', 'Sua marca em', 'outro nível.'], texto: Q.sub, cls: 'capa--longa', botoes: btn('Quero meu Raio-X', '#raio-x', { cls: 'btn--g' }) + btn(Q.whatsapp, wa(msg, 'quem-somos'), { wa: true, cls: 'btn--vazado btn--g' }),
		arte: `<div class="pilha">${equipe.map((p, i) => `<div class="pilha__f" style="--i:${i}" data-r="cola">${img(FOTO[p.slug], '', { sizes: '(min-width:900px) 20vw, 40vw', lazy: i > 0 })}</div>`).join('')}</div>` })}
${marcas()}
<section class="sec t-branco" data-nivel="história">
	<div class="c duas">
		<div>${fita(Q.historia.etiqueta)}${linhas(['Tudo no', 'mesmo time.'], 'mega', 'h2', ' style="margin-top:22px"')}<div class="numeros numeros--col" data-r>${D.claims.itens.filter((c) => c.verificado).map((n) => `<div class="numero"><b>${esc(n.valor)}</b><span>${esc(n.rotulo)}</span></div>`).join('')}</div></div>
		<div class="prosa" data-r><p><strong>${esc(Q.historia.apoio)}</strong></p>${Q.historia.paragrafos.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
	</div>
</section>
${secEquipe(Q.equipe, 't-preto', Object.fromEntries(equipe.map((p) => [p.slug, p.frase])))}
<section class="sec t-neon" data-nivel="jeito">
	<div class="c">${cab(Q.jeito.etiqueta, Q.jeito.titulo, '')}
		<div class="grade grade--4">${Q.jeito.itens.map((j, i) => `<article class="cartao" data-r style="--d:${i * 0.06}s"><span class="pixel">0${i + 1}</span><h3 class="medio">${esc(j.titulo)}</h3><p>${esc(j.texto)}</p></article>`).join('')}</div>
	</div>
</section>
<section class="sec t-preto" data-nivel="atendimento">
	<div class="c duas">
		<div>${fita(Q.remoto.etiqueta)}${linhas(['Longe só', 'no mapa.'], 'mega', 'h2', ' style="margin-top:22px"')}</div>
		<ul class="lista-ok lista-ok--g" data-r>${Q.remoto.itens.map((t) => `<li>${I.check}<span>${esc(t)}</span></li>`).join('')}</ul>
	</div>
</section>
${secaoFinal({ pagina: 'quem-somos', mensagemWa: msg })}`;
		out.push({ url: '/quem-somos/', modo: 'sobre', slug: 'quem-somos', titulo: Q.seo.titulo, descricao: Q.seo.descricao, corpo, mensagemWa: msg });

		equipe.forEach((p) => {
			const frentes = SERVICOS.filter((s) => s.quem_faz.includes(p.slug));
			const trabalhos = D.portfolio.itens.filter((t) => t.servicos.some((sv) => frentes.some((f) => f.slug === sv))).slice(0, 6);
			const primeiro = p.nome.split(' ')[0];
			const msgP = `Oi! Vim pelo perfil de ${p.nome} no site da Olorin e quero falar com a equipe.`;
			const destaques = [...p.destaques, { valor: String(frentes.length), rotulo: frentes.length > 1 ? Q.perfil.frentes : Q.perfil.frente }];
			const corpoP = `
${capa({ tema: 't-preto', etiqueta: p.funcao, titulo: p.nome.split(' ').map((n) => `<span class="nome">${esc(n)}</span>`), texto: p.credencial ? p.credencial.texto : '', cls: 'capa--perfil',
				botoes: btn('Quero meu Raio-X', '#raio-x', { cls: 'btn--g' }) + btn('WhatsApp', wa(msgP, 'perfil'), { wa: true, cls: 'btn--vazado btn--g' }) + `<button class="btn btn--vazado btn--g" type="button" data-copiar>${esc(Q.perfil.copiar)}</button>`,
				arte: `<div class="retrato" data-r="cola" style="--fim:2deg">${img(FOTO[p.slug], `Foto de ${p.nome}`, { sizes: '(min-width:900px) 34vw, 80vw', lazy: false })}<span class="retrato__emojis" aria-hidden="true">${p.emojis.join(' ')}</span></div>` })}
${marcas()}
<section class="sec t-branco" data-nivel="sobre">
	<div class="c">
		<div class="numeros" data-r>${destaques.map((n) => `<div class="numero"><b>${esc(n.valor)}</b><span>${esc(n.rotulo)}</span></div>`).join('')}${p.credencial ? `<div class="cred">${p.credencial.marcas.map((m) => `<img src="/assets/marcas/${m}-original.webp" alt="${m === 'meta' ? 'Meta' : 'Google'}" height="30" width="${m === 'meta' ? 130 : 99}" loading="lazy">`).join('')}<b>${esc(p.credencial.texto)}</b></div>` : ''}</div>
		<div class="duas perfil-sobre"><div>${fita(Q.perfil.sobre)}${linhas([`<span class="nome">${esc(primeiro)}.</span>`], 'mega', 'h2', ' style="margin-top:22px"')}</div><div class="prosa" data-r><p>${esc(p.bio)}</p><p><strong>“${esc(p.frase)}”</strong></p></div></div>
		<p class="pixel" style="margin-bottom:14px">${esc(Q.perfil.dia_a_dia)}</p>
		<div class="servs servs--claro">${frentes.map((s, i) => `<a class="serv" href="${s.url}" data-r><span class="serv__n">0${i + 1}</span><span><span class="serv__nome">${esc(NOME_SERV[s.slug])}</span><span class="serv__txt">${esc(s.card.resumo_curto)}</span></span><span class="serv__seta" aria-hidden="true">${I.seta}</span></a>`).join('')}</div>
		${trabalhos.length ? `<div style="margin-top:clamp(48px,7vw,96px)">${cab(Q.perfil.trabalhos, 'Na prática.', Q.perfil.trabalhos_texto)}<div class="trilho" data-trilho tabindex="0" aria-label="Portfólio: arraste para o lado">${trabalhos.map(peca).join('')}</div><div class="botoes">${btn(Q.perfil.trabalhos_link, '/portfolio/')}</div></div>` : ''}
	</div>
</section>
<section class="sec t-preto" data-nivel="time">
	<div class="c">${cab('', Q.perfil.time, '')}
		<div class="time time--2">${equipe.filter((o) => o.slug !== p.slug).map((o, i) => cartaoPessoa(o, i, '')).join('')}</div>
	</div>
</section>
${secaoFinal({ pagina: 'perfil', mensagemWa: msgP })}`;
			out.push({
				url: `/quem-somos/${p.slug}/`, modo: 'perfil', slug: p.slug, titulo: p.titulo_seo || `${p.nome}, ${p.funcao.replace(/^Diretora? de /, '')} | Olorin`, descricao: p.descricao, corpo: corpoP, mensagemWa: msgP,
				esquema: [{ '@context': 'https://schema.org', '@type': 'Person', name: p.nome, jobTitle: p.funcao, worksFor: { '@id': S.URL + '/#org' }, url: `${S.URL}/quem-somos/${p.slug}/` }],
			});
		});
	}

	/* ---------- Sobre: método, relatório e dúvidas ---------- */
	{
		const M = P['sobre-metodo'], R = M.relatorio, max = Math.max(...R.grafico.map((g) => g.valor));
		const painel = janela(R.janela, `<p class="pixel" style="margin-bottom:12px">${esc(R.mes)} · ${esc(R.aviso)}</p>
			<div class="painel__ind">${R.indicadores.map((i) => `<div><span>${esc(i.rotulo)}</span><b>${esc(i.valor)}</b><small class="${i.tendencia}">${esc(i.variacao)}</small></div>`).join('')}</div>
			<p class="painel__t">${esc(R.grafico_titulo)}</p>
			<div class="painel__graf" role="img" aria-label="${esc(R.grafico.map((g) => `${g.rotulo}: R$ ${g.valor.toLocaleString('pt-BR')}`).join('; '))}">${R.grafico.map((g) => `<div style="--h:${Math.round((g.valor / max) * 100)}%"><b>R$ ${g.valor.toLocaleString('pt-BR')}</b><i></i><span>${esc(g.rotulo)}</span></div>`).join('')}</div>
			<p class="painel__t">${esc(R.proxima_titulo)}</p><ul class="lista-ok">${R.proxima.map((t) => `<li>${I.check}<span>${esc(t)}</span></li>`).join('')}</ul><p class="boletim__aviso">${esc(R.glossario)}</p>`);
		const corpo = `
${capa({ tema: 't-neon', etiqueta: M.etiqueta, titulo: [M.titulo], texto: M.sub, botoes: btn('Quero meu Raio-X', '#raio-x', { cls: 'btn--g' }), arte: img('adesivo-lupa', '', { sizes: '(min-width:900px) 36vw, 70vw', cls: 'capa__pessoa adesivo', lazy: false }) })}
${marcas()}
<section class="sec t-preto" id="metodo" data-nivel="método">
	<div class="c">${cab(M.metodo.etiqueta, M.metodo.titulo, M.metodo.texto)}
		<ol class="etapas">${M.metodo.etapas.map((e, i) => `<li data-r style="--d:${i * 0.07}s"><span class="etapas__n">${i + 1}</span><h3 class="grande">${esc(e.nome)}</h3><p>${esc(e.texto)}</p></li>`).join('')}</ol>
		<div class="servs__pe" data-r><p class="medio">${esc(M.metodo.cta_texto)}</p>${btn('Quero meu Raio-X', '#raio-x', { cls: 'btn--g' })}</div>
	</div>
</section>
<section class="sec t-branco" id="relatorio" data-nivel="relatório">
	<div class="c duas">
		<div>${fita(R.etiqueta)}${linhas(['Faturamento,', 'não só', 'alcance.'], 'mega', 'h2', ' style="margin-top:22px"')}<p class="lede" data-r style="margin-top:22px">${esc(R.texto)}</p></div>
		<div class="painel" data-r>${painel}</div>
	</div>
</section>
<section class="sec t-preto" id="duvidas" data-nivel="dúvidas">
	<div class="c">${cab(M.duvidas.etiqueta, M.duvidas.titulo, '')}
		<div class="faq">${D.faq.perguntas.map((q) => `<details id="${q.id}" data-faq><summary><span>${esc(q.pergunta)}</span><i aria-hidden="true">+</i></summary><p>${md(q.resposta)}</p></details>`).join('')}</div>
		<p data-r style="margin-top:28px">${esc(M.duvidas.texto)} <a class="link" href="${wa('Oi! Vim pelo site da Olorin e tenho uma dúvida.', 'duvidas')}" target="_blank" rel="noopener" data-wa>${esc(D.faq.whatsapp)}</a></p>
	</div>
</section>
${secTime('t-branco')}
${secaoFinal({ pagina: 'sobre' })}`;
		out.push({
			url: '/sobre/', modo: 'sobre', slug: 'sobre', titulo: M.seo.titulo, descricao: M.seo.descricao, corpo,
			esquema: [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: D.faq.perguntas.map((q) => ({ '@type': 'Question', name: q.pergunta, acceptedAnswer: { '@type': 'Answer', text: q.resposta.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '') } })) }],
		});
	}

	/* ---------- Portfólio ---------- */
	{
		const F = P.portfolio, filtros = D.portfolio.filtros.filter((f) => D.portfolio.itens.some((p) => p.servicos.includes(f.id)));
		const corpo = `
${capa({ tema: 't-branco', etiqueta: F.etiqueta, titulo: F.titulo, texto: F.sub, cls: 'capa--baixa' })}
${marcas()}
<section class="sec t-branco" data-nivel="trabalhos">
	<div class="c">${cab(F.portfolio.etiqueta, F.portfolio.titulo, '')}
		<div class="filtros" data-filtros role="group" aria-label="Filtrar por serviço"><button type="button" data-filtro="" aria-pressed="true">${esc(F.portfolio.filtro_todos)}</button>${filtros.map((f) => `<button type="button" data-filtro="${f.id}" aria-pressed="false">${esc(f.rotulo)}</button>`).join('')}</div>
		<div class="mural">${D.portfolio.itens.map(peca).join('')}</div>
		<div class="botoes" style="margin-top:clamp(36px,5vw,64px)">${btn(F.portfolio.botao, S.INSTAGRAM_URL, { cls: 'btn--vazado', attrs: 'target="_blank" rel="noopener"' })}</div>
	</div>
</section>
${secTime('t-preto')}
${secaoFinal({ pagina: 'portfolio' })}`;
		out.push({ url: '/portfolio/', modo: 'portfolio', slug: 'portfolio', titulo: F.seo?.titulo || 'Portfólio | Olorin Digital', descricao: F.seo?.descricao || 'Identidade, redes, impressos, sites e campanhas feitos pelo time da Olorin Digital. Veja as marcas atendidas e peça o seu Raio-X gratuito.', corpo });
	}

	/* ---------- Política de Privacidade ---------- */
	{
		const V = P.privacidade;
		const data = V.atualizado.split('-').reverse().join('/');
		const bloco = (s) => `<section id="${s.id}"><h2 class="grande">${esc(s.titulo)}</h2>${(s.paragrafos || []).map((t) => `<p>${md(t)}</p>`).join('')}${s.lista ? `<ul>${s.lista.map((t) => `<li>${md(t)}</li>`).join('')}</ul>` : ''}${(s.paragrafos_fim || []).map((t) => `<p>${md(t)}</p>`).join('')}</section>`;
		const corpo = `
${capa({ tema: 't-preto', etiqueta: `Atualizada em ${data}`, titulo: ['política de', 'privacidade.'], texto: '', cls: 'capa--baixa' })}
<section class="sec t-branco" style="padding-top:clamp(40px,6vw,80px)" data-nivel="privacidade"><div class="c"><div class="prosa prosa--legal"><p>${md(V.introducao)}</p>${V.secoes.map(bloco).join('')}<p><button type="button" class="link" data-cookies-abrir hidden>Abrir as preferências de cookies</button></p></div></div></section>`;
		out.push({ url: '/politica-de-privacidade/', modo: 'simples', slug: 'privacidade', titulo: V.seo.titulo, descricao: V.seo.descricao, corpo, semForm: true });
	}

	/* ---------- Obrigado (um por público) ---------- */
	{
		const O = P.obrigado;
		const variantes = [['site', '/obrigado/', O, WA_PADRAO.replace('quero saber do', 'acabei de pedir o')], ['educacao', '/obrigado-educacao/', O.educacao, O.educacao.whatsapp], ['influenciadores', '/obrigado-influenciadores/', O.influenciadores, O.influenciadores.whatsapp]];
		for (const [seg, url, T, msg] of variantes) {
			const corpo = `
<section class="capa t-preto capa--obrigado" data-nivel="recebido" data-obrigado="${seg}">
	<div class="c capa__c">
		<div class="capa__txt">
			${fita(T.etiqueta)}
			<h1 class="giga capa__t linhas v"><span class="l"><span>${esc(T.titulo)}</span></span></h1>
			<p class="lede">${esc(T.texto)} ${esc(T.prazo)}</p>
			<div class="botoes">${btn(T.botao, wa(msg, 'obrigado'), { wa: true, cls: 'btn--g' })}<a class="btn btn--vazado" href="#" target="_blank" rel="noopener" data-agenda hidden>${esc(T.agendar)}</a></div>
		</div>
		<div class="capa__arte">${img('adesivo-salto', '', { sizes: '(min-width:900px) 34vw, 70vw', cls: 'capa__pessoa adesivo', lazy: false })}<span class="selo" style="--tam:150px;position:absolute;right:-3%;top:-2%;z-index:3" aria-hidden="true"><span><small>pedido</small>+1<br>nível</span></span></div>
	</div>
</section>
<section class="sec t-neon" data-nivel="enquanto isso"><div class="c">${cab('', T.enquanto_titulo, '')}<div class="servs">${T.enquanto.map((l, i) => `<a class="serv" href="${l.url}"><span class="serv__n">0${i + 1}</span><span><span class="serv__nome serv__nome--p">${esc(l.rotulo)}</span></span><span class="serv__seta" aria-hidden="true">${I.seta}</span></a>`).join('')}</div></div></section>`;
			out.push({ url, modo: 'obrigado', slug: url.replace(/\//g, ''), segmento: seg === 'influenciadores' ? 'influencer' : seg === 'educacao' ? 'educacao' : '', titulo: (T.seo || O.seo).titulo, descricao: (T.seo || O.seo).descricao, corpo, noindex: true, semForm: true, mensagemWa: msg });
		}
	}

	/* ---------- 404 ---------- */
	{
		const E4 = P.erro404;
		out.push({
			url: '/404.html', modo: 'erro', slug: '404', titulo: E4.seo.titulo, descricao: E4.seo.descricao, noindex: true, semForm: true,
			corpo: `${capa({ tema: 't-preto', etiqueta: 'Erro 404', titulo: E4.titulo, texto: E4.texto, cls: 'capa--baixa', botoes: btn(E4.inicio, '/', { cls: 'btn--g' }) + btn(E4.raio_x, '/#raio-x', { cls: 'btn--vazado btn--g' }) })}
<section class="sec t-neon" data-nivel="serviços"><div class="c"><div class="servs">${SERVICOS.map((s, i) => `<a class="serv" href="${s.url}"><span class="serv__n">0${i + 1}</span><span><span class="serv__nome serv__nome--p">${esc(NOME_SERV[s.slug])}</span></span><span class="serv__seta" aria-hidden="true">${I.seta}</span></a>`).join('')}</div></div></section>`,
		});
	}
	return out;
}
