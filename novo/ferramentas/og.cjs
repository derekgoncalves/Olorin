// Gera as imagens de compartilhamento (1200x630) em static/og/.
// Uso: node build.mjs && (cd dist && php -S 127.0.0.1:8091 &) && node ferramentas/og.cjs http://127.0.0.1:8091
// Precisa do Playwright instalado na máquina (não é dependência do site).
const { chromium } = require('playwright');
const path = require('path');
const base = process.argv[2] || 'http://127.0.0.1:8091';
const LOGO = require('fs').readFileSync(path.join(__dirname, '..', 'static', 'logos', 'logo-olorin.svg'), 'utf8').replace('<svg', '<svg class="l"');
const PECAS = [
	{ arq: 'olorin', tema: 'preto', linhas: ['sua marca', 'em outro', '<em>nível.</em>'], fita: 'Agência de marketing digital', img: 'adesivo-estrela-1400.webp' },
	{ arq: 'educacao', tema: 'violeta', linhas: ['sua escola', 'em outro', 'nível.'], fita: 'Olorin Educação · captação de alunos', img: 'adesivo-educacao-1400.webp', dx: -200, alt: 600 },
	{ arq: 'influenciadores', tema: 'preto', linhas: ['seu perfil', 'em outro', '<em>nível.</em>'], fita: 'Olorin para influenciadores', img: 'adesivo-selfie-1400.webp' },
];
const html = (p) => `<!doctype html><html><head><meta charset="utf-8"><base href="${base}/"><link rel="stylesheet" href="${base}/assets/site.css"><style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{background:${p.tema === 'violeta' ? '#7E3BED' : '#000'};color:#fff;position:relative}
.g{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:60px 60px}
.t{position:absolute;left:64px;top:176px;font:900 82px/.9 "Archivo Expanded";letter-spacing:-.04em;text-transform:lowercase;margin:0}
.t em{font-style:normal;color:#ECFF36}
.f{position:absolute;left:64px;top:74px;background:#fff;color:#000;font:400 20px "Silkscreen";letter-spacing:.14em;text-transform:uppercase;padding:9px 16px;transform:rotate(-2deg)}
.l{position:absolute;left:64px;bottom:56px;height:54px;width:auto;color:${p.tema === 'violeta' ? '#fff' : '#ECFF36'}}
.p{position:absolute;right:${p.dx || -10}px;bottom:-30px;height:${p.alt || 640}px;width:auto;filter:drop-shadow(-10px 10px 0 rgba(0,0,0,.35))}
.s{position:absolute;right:40px;top:36px}
</style></head><body><div class="g"></div><img class="p" src="${base}/assets/img/${p.img}"><span class="f">${p.fita}</span><h1 class="t">${p.linhas.join('<br>')}</h1>
${LOGO}</body></html>`;
(async () => {
	const b = await chromium.launch();
	const pg = await b.newPage({ viewport: { width: 1200, height: 630 } });
	for (const p of PECAS) {
		await pg.route('**/__og', (r) => r.fulfill({ contentType: 'text/html; charset=utf-8', body: html(p) }));
		await pg.goto(base + '/__og', { waitUntil: 'networkidle' });
		await pg.unroute('**/__og');
		await pg.evaluate(() => document.fonts.ready);
		await pg.waitForTimeout(300);
		await pg.screenshot({ path: path.join(__dirname, '..', 'static', 'og', p.arq + '.png') });
		console.log('ok', p.arq);
	}
	await b.close();
})();
