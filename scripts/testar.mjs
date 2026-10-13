/**
 * Testes automáticos do site pronto (dist/). Rode depois do build:
 *
 *   npm run build && npm test
 *
 * O que testa:
 *  1. Todas as páginas abrem sem erro de JavaScript, com 1 <h1> e sem rolagem horizontal (360 e 1440 px)
 *  2. Acessibilidade básica com axe-core nas páginas principais (falha em problemas "sérios" e "críticos")
 *  3. Formulário de ponta a ponta com o PHP de verdade (se o PHP estiver instalado):
 *     validação, etapa 2, envio, /obrigado/, evento generate_lead uma única vez e nenhum dado pessoal no dataLayer
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

if (!existsSync(path.join(SAIDA, 'index.html'))) {
	console.error('dist/ não existe. Rode "npm run build" antes.');
	process.exit(1);
}
if (!CHROMIUM) {
	console.error('Chromium/Chrome não encontrado. Defina CHROMIUM_PATH com o caminho do navegador.');
	process.exit(1);
}

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

/* ---------- Páginas ---------- */

const sitemap = readFileSync(path.join(SAIDA, 'sitemap.xml'), 'utf8');
const paginas = [...sitemap.matchAll(/<loc>https:\/\/olorin\.com\.br([^<]*)<\/loc>/g)].map((m) => m[1]);
for (const extra of ['/obrigado/', '/404.html', '/promo/']) if (!paginas.includes(extra)) paginas.push(extra);
for (const nome of readdirSync(path.join(SAIDA, 'promo'))) {
	if (existsSync(path.join(SAIDA, 'promo', nome, 'index.html'))) paginas.push(`/promo/${nome}/`);
}

const navegador = await chromium.launch({ executablePath: CHROMIUM });
const estatico = await servidorEstatico(SAIDA);

console.log(`\n1. Páginas (${paginas.length}) em 360 e 1440 px`);
for (const largura of [360, 1440]) {
	const ctx = await navegador.newContext({ viewport: { width: largura, height: 800 }, reducedMotion: 'reduce' });
	const p = await ctx.newPage();
	let erros = [];
	p.on('pageerror', (e) => erros.push(e.message));
	p.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
	for (const pg of paginas) {
		erros = [];
		await p.goto(estatico.url + pg, { waitUntil: 'load' });
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
for (const pg of ['/', '/educacao/', '/servicos/', '/servicos/trafego-pago/', '/quem-somos/', '/promo/', '/obrigado/', '/politica-de-privacidade/']) {
	for (const largura of [390, 1280]) {
		const ctx = await navegador.newContext({ viewport: { width: largura, height: 900 }, reducedMotion: 'reduce' });
		const p = await ctx.newPage();
		await p.goto(estatico.url + pg, { waitUntil: 'load' });
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
estatico.fechar();

/* ---------- Formulário com PHP ---------- */

console.log('\n3. Formulário de ponta a ponta');
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
	const ctx = await navegador.newContext({ viewport: { width: 1280, height: 900 } });
	const p = await ctx.newPage();
	try {
		await p.goto(`${php.url}/?utm_source=teste&utm_medium=cpc&utm_campaign=npm-test`, { waitUntil: 'load' });
		const form = p.locator('#orcamento [data-o-form]');
		await form.scrollIntoViewIfNeeded();
		await form.locator('[data-o-avancar]').click();
		const erroNome = await form.locator('[data-erro-de="nome"]').isVisible();
		erroNome ? ok('validação: nome vazio mostra erro') : falha('validação: nome vazio não mostrou erro');

		await form.locator('input[name="nome"]').fill('Teste Automático');
		await form.locator('input[name="whatsapp"]').fill('20999999999');
		await form.locator('[data-o-avancar]').click();
		const erroDdd = await form.locator('[data-erro-de="whatsapp"]').innerText();
		/DDD/i.test(erroDdd) ? ok('validação: DDD inexistente recusado') : falha(`validação de DDD: "${erroDdd}"`);

		await form.locator('input[name="whatsapp"]').fill('41999990000');
		await form.locator('[data-o-avancar]').click();
		(await form.getAttribute('data-etapa')) === '2' ? ok('etapa 2 aberta') : falha('não avançou para a etapa 2');

		await form.locator('input[name="servicos[]"]').first().check({ force: true });
		await form.locator('select[name="investimento"]').selectOption({ index: 2 });
		await form.locator('input[name="consentimento"]').check({ force: true });
		await p.waitForTimeout(3200); // tempo mínimo anti-robô
		await Promise.all([p.waitForURL('**/obrigado/', { timeout: 15000 }), form.locator('[data-o-enviar]').click()]);
		ok('envio aceito e redirecionado para /obrigado/');

		await p.waitForTimeout(800);
		const eventos = await p.evaluate(() => (window.dataLayer || []).filter((e) => e && e.event));
		const leads = eventos.filter((e) => e.event === 'generate_lead').length;
		leads === 1 ? ok('generate_lead disparado uma vez') : falha(`generate_lead disparado ${leads} vezes`);
		await p.reload({ waitUntil: 'load' });
		await p.waitForTimeout(800);
		const depois = await p.evaluate(() => (window.dataLayer || []).filter((e) => e && e.event === 'generate_lead').length);
		depois === 0 ? ok('recarregar /obrigado/ não duplica a conversão') : falha('recarregar /obrigado/ duplicou generate_lead');

		const camada = JSON.stringify(eventos);
		/Teste Autom|99999-?0000|41999990000/.test(camada) ? falha('dado pessoal no dataLayer') : ok('nenhum dado pessoal no dataLayer');

		const csvs = existsSync(path.join(temp, 'leads')) ? readdirSync(path.join(temp, 'leads')).filter((n) => n.endsWith('.csv')) : [];
		if (!csvs.length) falha('nenhum CSV de pedido gravado');
		else {
			const csv = readFileSync(path.join(temp, 'leads', csvs[0]), 'utf8');
			csv.includes('Teste Automático') && csv.includes('(41) 99999-0000') && csv.includes('https://wa.me/5541999990000') ? ok('pedido gravado no CSV com WhatsApp legível e link da conversa') : falha('CSV sem o pedido de teste');
			csv.includes('npm-test') ? ok('origem (UTM) registrada no pedido') : falha('UTM não chegou ao CSV');
		}

		const outro = await fetch(`${php.url}/enviar.php`, { method: 'POST', headers: { Origin: 'https://exemplo-invasor.com', Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'nome=X&whatsapp=41999990000' });
		outro.status === 403 ? ok('envio vindo de outro site bloqueado (403)') : falha(`envio de outro domínio respondeu ${outro.status}`);
	} catch (e) {
		falha(`formulário: ${e.message.split('\n')[0]}`);
	} finally {
		await ctx.close();
		php.fechar();
		rmSync(temp, { recursive: true, force: true });
	}
}

await navegador.close();
console.log(falhas.length ? `\n${falhas.length} falha(s).\n` : '\nTodos os testes passaram.\n');
process.exit(falhas.length ? 1 : 0);
