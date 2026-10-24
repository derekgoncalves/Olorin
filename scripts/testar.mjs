/**
 * Testes automáticos do site pronto (dist/). Rode depois do build:
 *
 *   npm run build && npm test
 *
 * O que testa (sem depender da internet: GTM, GA4 e Pixel são interceptados e respondidos com arquivos vazios):
 *  1. Todas as páginas abrem sem erro de JavaScript, com 1 <h1> e sem rolagem horizontal (360 e 1440 px)
 *  2. Acessibilidade básica com axe-core nas páginas principais (falha em problemas "sérios" e "críticos")
 *  3. Medição em várias páginas: gtag.js do GA4 e gtm.js do GTM pedidos antes da escolha dos cookies, com
 *     consentimento padrão negado, config/page_view com page_mode, page_slug e segmento; Pixel da Meta só depois
 *     do aceite (init + PageView, ViewContent nas páginas de serviço e LPs, Contact no WhatsApp); modo antigo
 *     (GA4_E_PIXEL_PELO_GTM: true) carrega só o GTM
 *  4. Formulário de ponta a ponta com o PHP de verdade (se o PHP estiver instalado), nas 3 variações (site,
 *     Educação e influenciadores): validação, etapa 2, envio, página de obrigado do segmento, generate_lead e
 *     Lead uma única vez (com e sem resposta ao aviso de cookies), nenhum dado pessoal na medição e o CSV
 *
 * Precisa do Chromium (Playwright). Defina CHROMIUM_PATH se ele não for encontrado sozinho.
 * O teste do formulário roda numa CÓPIA temporária do dist/ (nada é gravado no projeto).
 */
import { readFileSync, existsSync, mkdtempSync, cpSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright-core';

const SAIDA = path.resolve(process.env.OLORIN_SAIDA || 'dist');
const CHROMIUM = [
	process.env.CHROMIUM_PATH,
	'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
	'/usr/bin/chromium',
	'/usr/bin/chromium-browser',
	'/usr/bin/google-chrome',
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].find((c) => c && existsSync(c));

const falhas = [];
const ok = (msg) => console.log(`  ok    ${msg}`);
const falha = (msg) => {
	falhas.push(msg);
	console.log(`  FALHA ${msg}`);
};
const confere = (condicao, msgOk, msgFalha) => (condicao ? ok(msgOk) : falha(msgFalha || msgOk));

if (!existsSync(path.join(SAIDA, 'index.html'))) {
	console.error('dist/ não existe. Rode "npm run build" antes.');
	process.exit(1);
}
if (!CHROMIUM) {
	console.error('Chromium/Chrome não encontrado. Defina CHROMIUM_PATH com o caminho do navegador.');
	process.exit(1);
}

const cfg = JSON.parse(readFileSync('src/_data/site/config.json', 'utf8'));
const IDS = { gtm: cfg.GTM_ID, ga4: cfg.GA4_ID, pixel: cfg.META_PIXEL_ID };

/* ---------- Servidores ---------- */

const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json' };

function servidorEstatico(pasta) {
	return new Promise((resolve) => {
		const srv = createServer((req, res) => {
			let caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname);
			if (caminho.endsWith('/')) caminho += 'index.html';
			const arquivo = path.join(pasta, caminho);
			if (!arquivo.startsWith(pasta) || !existsSync(arquivo)) {
				res.writeHead(404, { 'Content-Type': TIPOS['.html'] });
				res.end(readFileSync(path.join(pasta, '404.html')));
				return;
			}
			res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] || 'application/octet-stream' });
			res.end(readFileSync(arquivo));
		});
		srv.listen(0, '127.0.0.1', () => resolve({ url: `http://127.0.0.1:${srv.address().port}`, fechar: () => srv.close() }));
	});
}

async function servidorPhp(pasta) {
	const porta = 18000 + Math.floor(Math.random() * 1000);
	const proc = spawn('php', ['-S', `127.0.0.1:${porta}`, '-t', pasta], { stdio: 'ignore' });
	for (let i = 0; i < 40; i++) {
		try {
			const r = await fetch(`http://127.0.0.1:${porta}/`);
			if (r.ok) break;
		} catch (e) {
			await new Promise((r) => setTimeout(r, 150));
		}
	}
	return { url: `http://127.0.0.1:${porta}`, fechar: () => proc.kill() };
}

/* Ferramentas externas (GTM, GA4, Pixel) sem internet: cada pedido é anotado e respondido com um arquivo vazio.
   O window.dataLayer, a fila do gtag (window.olorinGtag) e a fila do fbq ficam como o site deixou. */
async function novoContexto(opcoes) {
	const ctx = await navegador.newContext(opcoes);
	ctx.pedidosExternos = [];
	await ctx.route(/^https:\/\/(www\.googletagmanager\.com|connect\.facebook\.net|www\.google-analytics\.com|[^/]*\.doubleclick\.net)\//, (rota) => {
		ctx.pedidosExternos.push(rota.request().url());
		rota.fulfill({ status: 200, contentType: 'text/javascript', body: '/* teste */' });
	});
	return ctx;
}
const filas = (p) =>
	p.evaluate(() => {
		const lista = (fila) => (fila || []).map((item) => (item && typeof item === 'object' && 'length' in item && typeof item !== 'string' ? Array.from(item) : item));
		return { dataLayer: lista(window.dataLayer), gtag: lista(window.olorinGtag), fbq: window.fbq && window.fbq.queue ? lista(window.fbq.queue) : null };
	});
const eventosGa4 = (f, nome) => f.gtag.filter((c) => c[0] === 'event' && c[1] === nome);
const eventosPixel = (f, nome) => (f.fbq || []).filter((c) => c[0] === 'track' && c[1] === nome);

/* ---------- Páginas ---------- */

const sitemap = readFileSync(path.join(SAIDA, 'sitemap.xml'), 'utf8');
const paginas = [...sitemap.matchAll(/<loc>https:\/\/olorin\.com\.br([^<]*)<\/loc>/g)].map((m) => m[1]);
for (const extra of ['/obrigado/', '/obrigado-educacao/', '/obrigado-influenciadores/', '/404.html', '/promo/']) if (!paginas.includes(extra)) paginas.push(extra);
for (const nome of readdirSync(path.join(SAIDA, 'promo'))) {
	if (existsSync(path.join(SAIDA, 'promo', nome, 'index.html'))) paginas.push(`/promo/${nome}/`);
}

const navegador = await chromium.launch({ executablePath: CHROMIUM });
const estatico = await servidorEstatico(SAIDA);

console.log(`\n1. Páginas (${paginas.length}) em 360 e 1440 px`);
for (const largura of [360, 1440]) {
	const ctx = await novoContexto({ viewport: { width: largura, height: 800 }, reducedMotion: 'reduce' });
	const p = await ctx.newPage();
	let erros = [];
	p.on('pageerror', (e) => erros.push(e.message));
	p.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
	for (const pg of paginas) {
		erros = [];
		await p.goto(estatico.url + pg, { waitUntil: 'load' });
		// Desenha a página inteira (as seções abaixo da dobra usam content-visibility; ver base.css).
		await p.evaluate(() => document.documentElement.classList.add('o-cv-tudo'));
		const r = await p.evaluate(() => ({
			h1: document.querySelectorAll('h1').length,
			largura: document.documentElement.scrollWidth,
			texto: document.body.innerText,
		}));
		const problemas = [];
		if (erros.length) problemas.push(`erro de JavaScript: ${erros[0]}`);
		if (r.h1 !== 1) problemas.push(`${r.h1} <h1>`);
		if (r.largura > largura + 1) problemas.push(`rolagem horizontal (${r.largura}px)`);
		if (/\[object Object\]|undefined|NaN|\[CONFIRMAR/.test(r.texto)) problemas.push('texto quebrado ("[object Object]", "undefined", "NaN" ou [CONFIRMAR])');
		if (problemas.length) falha(`${pg} @${largura}: ${problemas.join('; ')}`);
	}
	ok(`${paginas.length} páginas verificadas em ${largura} px`);
	await ctx.close();
}

/* ---------- Acessibilidade ---------- */

console.log('\n2. Acessibilidade (axe-core)');
const axe = readFileSync(path.resolve('node_modules/axe-core/axe.min.js'), 'utf8');
for (const pg of ['/', '/educacao/', '/influenciadores/', '/servicos/', '/servicos/trafego-pago/', '/quem-somos/', '/sobre/', '/portfolio/', '/promo/', '/obrigado/', '/obrigado-educacao/', '/obrigado-influenciadores/', '/politica-de-privacidade/']) {
	for (const largura of [390, 1280]) {
		const ctx = await novoContexto({ viewport: { width: largura, height: 900 }, reducedMotion: 'reduce' });
		const p = await ctx.newPage();
		await p.goto(estatico.url + pg, { waitUntil: 'load' });
		// Desenha a página inteira (as seções abaixo da dobra usam content-visibility; ver base.css).
		await p.evaluate(() => document.documentElement.classList.add('o-cv-tudo'));
		await p.addScriptTag({ content: axe });
		const resultado = await p.evaluate(async () =>
			// eslint-disable-next-line no-undef
			(await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] })).violations
				.filter((v) => v.impact === 'serious' || v.impact === 'critical')
				.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0].target.join(' ')}`),
		);
		if (resultado.length) resultado.forEach((v) => falha(`${pg} @${largura}: ${v}`));
		await ctx.close();
	}
	ok(`${pg}`);
}

/* ---------- Medição (GA4, GTM e Pixel da Meta) ---------- */

console.log('\n3. Medição em todas as páginas (GA4, GTM e Pixel da Meta)');
if (!IDS.gtm || !IDS.ga4 || !IDS.pixel) {
	console.log('  (config.json sem GTM_ID, GA4_ID ou META_PIXEL_ID: teste de medição pulado)');
} else {
	const CASOS = [
		{ pg: '/', slug: 'home', modo: 'home', segmento: 'site', conteudo: false },
		{ pg: '/servicos/trafego-pago/', slug: 'servico-trafego-pago', modo: 'servico', segmento: 'site', conteudo: true },
		{ pg: '/educacao/', slug: 'educacao', segmento: 'educacao', conteudo: true },
		{ pg: '/influenciadores/', slug: 'influenciadores', modo: 'influenciadores', segmento: 'influencer', conteudo: true },
		{ pg: '/quem-somos/', slug: 'quem-somos', modo: 'sobre', segmento: 'site', conteudo: false },
		{ pg: '/politica-de-privacidade/', slug: 'politica-de-privacidade', segmento: 'site', conteudo: false },
		{ pg: '/404.html', slug: '404', modo: 'erro', segmento: 'site', conteudo: false },
	];
	for (const caso of CASOS) {
		const ctx = await novoContexto({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
		const p = await ctx.newPage();
		try {
			await p.goto(estatico.url + caso.pg, { waitUntil: 'load' });
			await p.waitForFunction(() => (window.olorinGtag || []).length > 0 && (window.dataLayer || []).some((e) => e && e.event === 'gtm.js'), null, { timeout: 8000 });
			let f = await filas(p);
			const pedidos = ctx.pedidosExternos;
			const problemas = [];
			if (!pedidos.some((u) => u.includes('/gtag/js?id=' + IDS.ga4))) problemas.push('gtag.js do GA4 não foi pedido');
			if (!pedidos.some((u) => u.includes('/gtm.js?id=' + IDS.gtm))) problemas.push('gtm.js do GTM não foi pedido');
			if (pedidos.some((u) => u.includes('fbevents.js'))) problemas.push('Pixel carregou antes do aceite');
			const padrao = f.gtag.find((c) => c[0] === 'consent' && c[1] === 'default');
			if (!padrao || padrao[2].analytics_storage !== 'denied' || padrao[2].ad_storage !== 'denied') problemas.push('consentimento padrão não é "negado" no GA4');
			if (!f.dataLayer.some((c) => c[0] === 'consent' && c[1] === 'default')) problemas.push('consentimento padrão não chegou ao GTM');
			const config = f.gtag.find((c) => c[0] === 'config' && c[1] === IDS.ga4);
			if (!config) problemas.push('sem gtag config do GA4');
			else if (config[2].page_slug !== caso.slug || config[2].segmento !== caso.segmento || (caso.modo && config[2].page_mode !== caso.modo)) problemas.push(`page_view com parâmetros errados: ${JSON.stringify(config[2])}`);
			if (f.gtag.findIndex((c) => c[0] === 'config') < f.gtag.findIndex((c) => c[0] === 'consent')) problemas.push('config antes do consentimento padrão');
			if (f.dataLayer.some((c) => c[0] === 'config' || c[0] === 'event')) problemas.push('comando do gtag no dataLayer do GTM (contaria em dobro)');

			// Aceitar os cookies: Pixel com init + PageView (e ViewContent nas páginas de serviço e LPs).
			await p.click('[data-o-cookies-aceitar]');
			await p.waitForFunction(() => window.fbq && window.fbq.queue && window.fbq.queue.length > 1, null, { timeout: 8000 });
			f = await filas(p);
			if (!ctx.pedidosExternos.some((u) => u.includes('fbevents.js'))) problemas.push('fbevents.js não foi pedido depois do aceite');
			if (!f.fbq.some((c) => c[0] === 'init' && c[1] === IDS.pixel)) problemas.push(`sem fbq('init', '${IDS.pixel}')`);
			if (eventosPixel(f, 'PageView').length !== 1) problemas.push(`PageView ${eventosPixel(f, 'PageView').length} vez(es)`);
			if (eventosPixel(f, 'ViewContent').length !== (caso.conteudo ? 1 : 0)) problemas.push(`ViewContent ${eventosPixel(f, 'ViewContent').length} vez(es)`);
			const atualizado = f.gtag.filter((c) => c[0] === 'consent' && c[1] === 'update').pop();
			if (!atualizado || atualizado[2].analytics_storage !== 'granted') problemas.push('consentimento não foi atualizado no GA4');

			// WhatsApp: whatsapp_click no dataLayer e no GA4, Contact na Meta (sem abrir o WhatsApp).
			await p.evaluate(() => {
				window.addEventListener('click', (e) => e.target.closest('a[href^="https://wa.me/"]') && e.preventDefault());
				const link = document.querySelector('#cta-whatsapp-flutuante') || document.querySelector('a[href^="https://wa.me/"]');
				link.click();
			});
			f = await filas(p);
			if (!f.dataLayer.some((e) => e && e.event === 'whatsapp_click')) problemas.push('whatsapp_click não chegou ao dataLayer');
			if (!eventosGa4(f, 'whatsapp_click').length) problemas.push('whatsapp_click não foi para o GA4');
			if (eventosPixel(f, 'Contact').length !== 1) problemas.push('Contact não foi para a Meta');
			const origem = (eventosGa4(f, 'whatsapp_click')[0] || [])[2] || {};
			if (caso.segmento !== 'site' && !String(origem.origem || '').startsWith(caso.segmento + '-')) problemas.push(`ref do WhatsApp sem o segmento: ${origem.origem}`);

			problemas.length ? falha(`${caso.pg}: ${problemas.join('; ')}`) : ok(`${caso.pg}: GA4 e GTM antes da escolha, page_view "${caso.slug}" (${caso.segmento}), Pixel só depois do aceite${caso.conteudo ? ' (com ViewContent)' : ''}, Contact no WhatsApp`);
		} catch (e) {
			falha(`${caso.pg}: ${e.message.split('\n')[0]}`);
		}
		await ctx.close();
	}

	// Página seguinte, com o aceite já salvo: Pixel e PageView sem perguntar de novo; consentimento já liberado no config.
	{
		const ctx = await novoContexto({ viewport: { width: 1280, height: 900 } });
		await ctx.addInitScript(() => localStorage.setItem('olorin_consentimento', JSON.stringify({ analise: true, marketing: true, data: '2026-10-23T00:00:00.000Z' })));
		const p = await ctx.newPage();
		await p.goto(estatico.url + '/sobre/', { waitUntil: 'load' });
		try {
			await p.waitForFunction(() => window.fbq && window.fbq.queue && window.fbq.queue.length > 1, null, { timeout: 8000 });
			const f = await filas(p);
			const iUpdate = f.gtag.findIndex((c) => c[0] === 'consent' && c[1] === 'update');
			const iConfig = f.gtag.findIndex((c) => c[0] === 'config');
			const aviso = await p.locator('[data-o-cookies]').isVisible();
			confere(iUpdate > -1 && iUpdate < iConfig && eventosPixel(f, 'PageView').length === 1 && !aviso, 'aceite salvo: page_view já com consentimento, Pixel com PageView e sem aviso de cookies', 'aceite salvo não foi aplicado antes do page_view (ou o aviso voltou)');
		} catch (e) {
			falha(`aceite salvo: ${e.message.split('\n')[0]}`);
		}
		await ctx.close();
	}

	// Recusar: nada da Meta; GA4 e GTM seguem só com pings sem cookie (consentimento negado).
	{
		const ctx = await novoContexto({ viewport: { width: 1280, height: 900 } });
		const p = await ctx.newPage();
		await p.goto(estatico.url + '/servicos/', { waitUntil: 'load' });
		await p.click('[data-o-cookies-recusar]');
		await p.waitForTimeout(1500);
		const f = await filas(p);
		confere(!ctx.pedidosExternos.some((u) => u.includes('fbevents.js')) && !f.fbq, 'Recusar: o Pixel da Meta não carrega', 'Recusar: o Pixel carregou');
		await ctx.close();
	}

	// Modo antigo: GA4_E_PIXEL_PELO_GTM: true no olorin-ids.js → só o GTM (GA4 e Pixel ficam dentro do contêiner).
	{
		const ctx = await novoContexto({ viewport: { width: 1280, height: 900 } });
		const ids = readFileSync(path.join(SAIDA, 'olorin-ids.js'), 'utf8').replace(/^(\s*)GA4_E_PIXEL_PELO_GTM: false/m, '$1GA4_E_PIXEL_PELO_GTM: true');
		await ctx.route('**/olorin-ids.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: ids }));
		const p = await ctx.newPage();
		await p.goto(estatico.url + '/', { waitUntil: 'load' });
		await p.waitForFunction(() => (window.dataLayer || []).some((e) => e && e.event === 'gtm.js'), null, { timeout: 8000 });
		await p.click('[data-o-cookies-aceitar]');
		await p.waitForTimeout(1500);
		const pedidos = ctx.pedidosExternos;
		confere(
			pedidos.some((u) => u.includes('gtm.js')) && !pedidos.some((u) => u.includes('/gtag/js') || u.includes('fbevents.js')),
			'GA4_E_PIXEL_PELO_GTM: true carrega só o GTM',
			`GA4_E_PIXEL_PELO_GTM: true pediu ${pedidos.join(', ')}`,
		);
		await ctx.close();
	}
}
estatico.fechar();

/* ---------- Formulário com PHP ---------- */

console.log('\n4. Formulário de ponta a ponta');
const temPhp = spawnSync('php', ['-v']).status === 0;
if (!temPhp) {
	console.log('  (PHP não instalado nesta máquina: teste do formulário pulado. Ele roda no servidor da Locaweb.)');
} else {
	const temp = mkdtempSync(path.join(tmpdir(), 'olorin-teste-'));
	const site = path.join(temp, 'public_html');
	cpSync(SAIDA, site, { recursive: true });
	// Config de teste: sem SMTP, leads numa pasta temporária, domínio local aceito.
	writeFileSync(
		path.join(site, 'config.php'),
		`<?php return array('smtp_usuario' => '', 'smtp_senha' => '', 'pasta_leads' => ${JSON.stringify(path.join(temp, 'leads'))}, 'dominios' => array('127.0.0.1', 'localhost', 'olorin.com.br'));\n`,
	);
	const php = await servidorPhp(site);
	const PESSOAIS = /Teste Autom|99999-?0000|41999990000|teste@exemplo|Empresa Teste|Coordenadora Teste|@perfilteste/i;
	// Cada variação: página, o que o visitante faz no aviso de cookies, campos da etapa 2 e o que esperar.
	const VARIACOES = [
		{
			nome: 'site', pg: '/', obrigado: '/obrigado/', segmento: 'site', csv: 'Site', cookies: 'aceitar-antes',
			etapa2: async (form) => {
				await form.locator('input[name="empresa"]').fill('Empresa Teste');
				await form.locator('input[name="cargo"]').fill('Sócia');
				await form.locator('select[name="porte"]').selectOption({ index: 2 });
				await form.locator('input[name="servicos[]"]').first().check({ force: true });
			},
		},
		{
			nome: 'educacao', pg: '/educacao/', obrigado: '/obrigado-educacao/', segmento: 'educacao', csv: 'Educação', cookies: 'aceitar-no-obrigado',
			etapa2: async (form) => {
				await form.locator('input[name="empresa"]').fill('Empresa Teste');
				await form.locator('input[name="cargo"]').fill('Coordenadora Teste');
				await form.locator('select[name="porte"]').selectOption({ index: 3 });
				await form.locator('input[name="desafios[]"]').nth(1).check({ force: true });
			},
		},
		{
			nome: 'influenciadores', pg: '/influenciadores/', obrigado: '/obrigado-influenciadores/', segmento: 'influencer', csv: 'Influenciadores', cookies: 'sem-resposta',
			etapa2: async (form) => {
				await form.locator('input[name="empresa"]').fill('@perfilteste');
				await form.locator('select[name="cargo"]').selectOption({ index: 1 });
				await form.locator('select[name="porte"]').selectOption({ index: 2 });
				await form.locator('input[name="desafios[]"]').first().check({ force: true });
			},
		},
	];
	try {
		for (const v of VARIACOES) {
			const ctx = await novoContexto({ viewport: { width: 1280, height: 900 } });
			const p = await ctx.newPage();
			const erros = [];
			p.on('pageerror', (e) => erros.push(e.message));
			try {
				await p.goto(`${php.url}${v.pg}?utm_source=teste&utm_medium=cpc&utm_campaign=npm-test-${v.nome}`, { waitUntil: 'load' });
				if (v.cookies === 'aceitar-antes') await p.click('[data-o-cookies-aceitar]');
				const form = p.locator('#raio-x [data-o-form]');
				await form.scrollIntoViewIfNeeded();
				confere((await form.getAttribute('data-segmento')) === v.nome, `${v.nome}: formulário com os textos do segmento`, `${v.nome}: formulário com o segmento ${await form.getAttribute('data-segmento')}`);

				if (v.nome === 'site') {
					await form.locator('[data-o-avancar]').click();
					confere(await form.locator('[data-erro-de="nome"]').isVisible(), 'validação: nome vazio mostra erro', 'validação: nome vazio não mostrou erro');
					await form.locator('input[name="nome"]').fill('Teste Automático');
					await form.locator('input[name="whatsapp"]').fill('20999999999');
					await form.locator('input[name="email"]').fill('teste@exemplo');
					await form.locator('[data-o-avancar]').click();
					const erroDdd = await form.locator('[data-erro-de="whatsapp"]').innerText();
					confere(/DDD/i.test(erroDdd), 'validação: DDD inexistente recusado', `validação de DDD: "${erroDdd}"`);
					confere(await form.locator('[data-erro-de="email"]').isVisible(), 'validação: e-mail inválido recusado', 'validação: e-mail inválido passou');
				}
				await form.locator('input[name="nome"]').fill('Teste Automático');
				await form.locator('input[name="whatsapp"]').fill('41999990000');
				await form.locator('input[name="email"]').fill('teste@exemplo.com.br');
				await form.locator('[data-o-avancar]').click();
				confere((await form.getAttribute('data-etapa')) === '2', `${v.nome}: etapa 2 aberta`, `${v.nome}: não avançou para a etapa 2`);

				await p.waitForTimeout(900); // a etapa 2 rola suave até o topo da caixa
				if (v.nome === 'site') {
					await form.locator('input[name="consentimento"]').check({ force: true });
					await form.locator('[data-o-enviar]').click();
					const visiveis = await Promise.all(['empresa', 'cargo', 'porte'].map((n) => form.locator(`[data-erro-de="${n}"]`).isVisible()));
					confere(visiveis.every(Boolean), 'validação: empresa, cargo e porte obrigatórios', 'validação: empresa, cargo ou porte vazio passou');
					// "Ainda não sei" desmarca as outras opções (e vice-versa).
					await form.locator('[data-o-todos]').check({ force: true });
					await form.locator('input[data-o-exclusivo]').check({ force: true });
					const marcados = await form.locator('input[name="servicos[]"]:checked').count();
					confere(marcados === 1, '"Ainda não sei" desmarca as outras opções', `"Ainda não sei" deixou ${marcados} opções marcadas`);
					await form.locator('input[data-o-exclusivo]').uncheck({ force: true });
				}
				await v.etapa2(form);
				await form.locator('select[name="investimento"]').selectOption({ index: 2 });
				await form.locator('input[name="consentimento"]').check({ force: true });
				await p.waitForTimeout(3200); // tempo mínimo anti-robô
				await Promise.all([p.waitForURL(`**${v.obrigado}`, { timeout: 15000 }), form.locator('[data-o-enviar]').click()]);
				ok(`${v.nome}: envio aceito e redirecionado para ${v.obrigado}`);

				// Conversão: com aceite antes, sai na hora; sem resposta, espera o aceite na própria página (ou 8 s).
				if (v.cookies === 'aceitar-no-obrigado') {
					await p.waitForTimeout(800);
					const antes = (await filas(p)).dataLayer.filter((e) => e && e.event === 'generate_lead').length;
					confere(antes === 0, `${v.nome}: sem resposta ao aviso, a conversão espera a escolha`, `${v.nome}: generate_lead saiu antes da escolha`);
					await p.click('[data-o-cookies-aceitar]');
					await p.waitForTimeout(1500);
				} else if (v.cookies === 'sem-resposta') {
					await p.waitForTimeout(9000);
				} else {
					await p.waitForTimeout(1500);
				}
				const f = await filas(p);
				const leads = f.dataLayer.filter((e) => e && e.event === 'generate_lead');
				const ga4 = eventosGa4(f, 'generate_lead');
				const lead = eventosPixel(f, 'Lead');
				const problemas = [];
				if (leads.length !== 1) problemas.push(`generate_lead ${leads.length} vez(es) no dataLayer`);
				if (ga4.length !== 1) problemas.push(`generate_lead ${ga4.length} vez(es) no GA4`);
				else if (ga4[0][2].segmento !== v.segmento) problemas.push(`generate_lead com segmento "${ga4[0][2].segmento}"`);
				if (v.cookies === 'sem-resposta') {
					if (ctx.pedidosExternos.some((u) => u.includes('fbevents.js'))) problemas.push('Pixel carregou sem aceite');
				} else if (lead.length !== 1) problemas.push(`Lead ${lead.length} vez(es) na Meta`);
				problemas.length
					? falha(`${v.nome}: ${problemas.join('; ')}`)
					: ok(`${v.nome}: generate_lead (segmento ${v.segmento}) uma vez no dataLayer e no GA4${v.cookies === 'sem-resposta' ? ', sem Pixel (sem aceite)' : ' e Lead uma vez na Meta'}`);
				const wa = await p.locator('#cta-whatsapp-obrigado').getAttribute('href');
				const refEsperada = v.segmento === 'site' ? 'obrigado' : `obrigado-${v.segmento}`;
				confere(decodeURIComponent(wa).includes(`[ref: ${refEsperada}]`), `${v.nome}: WhatsApp da página de obrigado com ref ${refEsperada}`, `${v.nome}: WhatsApp da página de obrigado sem ref ${refEsperada}`);

				await p.reload({ waitUntil: 'load' });
				await p.waitForTimeout(1500);
				const depois = (await filas(p)).dataLayer.filter((e) => e && e.event === 'generate_lead').length;
				confere(depois === 0, `${v.nome}: recarregar a página de obrigado não duplica a conversão`, `${v.nome}: recarregar duplicou generate_lead`);
				const tudo = JSON.stringify(f);
				confere(!PESSOAIS.test(tudo), `${v.nome}: nenhum dado pessoal no dataLayer, no GA4 nem na Meta`, `${v.nome}: dado pessoal na medição: ${(tudo.match(PESSOAIS) || [])[0]}`);
				if (erros.length) falha(`${v.nome}: erro de JavaScript: ${erros[0]}`);
			} catch (e) {
				falha(`${v.nome}: ${e.message.split('\n')[0]}`);
			}
			await ctx.close();
		}

		const csvs = existsSync(path.join(temp, 'leads')) ? readdirSync(path.join(temp, 'leads')).filter((n) => n.endsWith('.csv')) : [];
		if (!csvs.length) falha('nenhum CSV de pedido gravado');
		else {
			const csv = csvs.map((n) => readFileSync(path.join(temp, 'leads', n), 'utf8')).join('\n');
			confere(csv.includes('Teste Automático') && csv.includes('(41) 99999-0000') && csv.includes('https://wa.me/5541999990000'), 'pedido gravado no CSV com WhatsApp legível e link da conversa', 'CSV sem o pedido de teste');
			const cabecalho = csv.split('\n')[0];
			confere(['email', 'empresa', 'cargo', 'porte', 'desafios', 'segmento'].every((c) => cabecalho.includes(c)), 'CSV com e-mail, empresa, cargo, porte, desafios e segmento', `CSV sem as colunas novas: ${cabecalho.slice(0, 120)}`);
			confere(['Site', 'Educação', 'Influenciadores'].every((s) => csv.includes(`;${s};`)) && csv.includes('teste@exemplo.com.br') && csv.includes('Contatos que não viram matrícula') && csv.includes('Criador ou criadora de conteúdo'), 'as 3 variações chegaram ao CSV com os campos novos', 'CSV sem alguma das 3 variações');
			confere(csv.includes('npm-test-site') && csv.includes('npm-test-educacao'), 'origem (UTM) registrada no pedido', 'UTM não chegou ao CSV');
		}

		const post = (corpo, cabecalhos = {}) =>
			fetch(`${php.url}/enviar.php`, { method: 'POST', redirect: 'manual', headers: { Origin: php.url, 'Content-Type': 'application/x-www-form-urlencoded', ...cabecalhos }, body: new URLSearchParams(corpo).toString() });
		const base = { nome: 'Pessoa', whatsapp: '41999990000', email: 'pessoa@exemplo.com.br', olorin_tempo: '9', consentimento: '1' };
		const outro = await post({ nome: 'X', whatsapp: '41999990000' }, { Origin: 'https://exemplo-invasor.com', Accept: 'application/json' });
		confere(outro.status === 403, 'envio vindo de outro site bloqueado (403)', `envio de outro domínio respondeu ${outro.status}`);
		const errado = await post({ ...base, modo_pagina: 'influenciadores', empresa: '@x', cargo: 'Diretora', porte: '2 a 10 pessoas' }, { Accept: 'application/json' });
		const corpoErrado = await errado.json().catch(() => ({}));
		confere(errado.status === 422 && corpoErrado.fields && corpoErrado.fields.cargo && corpoErrado.fields.porte, 'enviar.php recusa "Você é" e porte fora da lista do segmento', `enviar.php aceitou opções fora da lista (${errado.status})`);
		const semJs = await post({ ...base, modo_pagina: 'educacao', empresa: 'Escola', cargo: 'Diretor', porte: 'Até 200' });
		confere(semJs.status === 303 && /\/obrigado-educacao\/$/.test(semJs.headers.get('location') || ''), 'sem JavaScript, o enviar.php redireciona para /obrigado-educacao/', `sem JavaScript: ${semJs.status} ${semJs.headers.get('location')}`);
	} catch (e) {
		falha(`formulário: ${e.message.split('\n')[0]}`);
	} finally {
		php.fechar();
		rmSync(temp, { recursive: true, force: true });
	}
}

await navegador.close();
console.log(falhas.length ? `\n${falhas.length} falha(s).\n` : '\nTodos os testes passaram.\n');
process.exit(falhas.length ? 1 : 0);
