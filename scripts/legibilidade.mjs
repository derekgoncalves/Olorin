/**
 * Legibilidade dos textos do site (PROMPT seção 17): índice de Flesch adaptado ao português
 * (Martins et al., 1996): 248,835 − 1,015 × (palavras/frase) − 84,6 × (sílabas/palavra).
 *
 *   npm run build && npm run legibilidade
 *
 * Faixas: 75–100 muito fácil · 50–75 fácil · 25–50 difícil · 0–25 muito difícil.
 * Meta do site: "fácil" (≥ 50) e média de até 18 palavras por frase.
 * Mede o texto visível do <main> de cada página (sem menus, rodapé, formulário nem dados ocultos).
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

const SAIDA = process.env.OLORIN_SAIDA || 'dist';

function listar(pasta) {
	const saida = [];
	for (const nome of readdirSync(pasta)) {
		const caminho = path.join(pasta, nome);
		if (statSync(caminho).isDirectory()) saida.push(...listar(caminho));
		else if (nome === 'index.html') saida.push(caminho);
	}
	return saida;
}

/** Texto visível do <main>, um bloco por parágrafo/item/título. */
function textoPrincipal(html) {
	let main = (html.match(/<main[\s\S]*?<\/main>/) || [html])[0];
	main = main
		.replace(/<script[\s\S]*?<\/script>/g, ' ')
		.replace(/<style[\s\S]*?<\/style>/g, ' ')
		.replace(/<form[\s\S]*?<\/form>/g, ' ')
		.replace(/<(svg|table|figure)[\s\S]*?<\/\1>/g, ' ')
		.replace(/<[^>]*class="[^"]*\b(o-sr|o-etiqueta|o-janela__barra|o-faixa|o-migalhas)\b[^"]*"[^>]*>[\s\S]*?<\/[a-z0-9]+>/g, ' ');
	const blocos = main
		.split(/<\/(?:p|li|h[1-6]|dd|dt|summary|blockquote|figcaption)>/)
		.map((b) =>
			b
				.replace(/<[^>]+>/g, ' ')
				.replace(/&nbsp;/g, ' ')
				.replace(/&amp;/g, '&')
				.replace(/&[a-z#0-9]+;/g, ' ')
				.replace(/\s+/g, ' ')
				.trim(),
		)
		.filter((b) => b.split(' ').length >= 3);
	return blocos;
}

/** Sílabas em português: grupos de vogais, separando hiatos comuns. */
function silabas(palavra) {
	const p = palavra.toLowerCase().replace(/[^a-záàâãéêíóôõúüç]/g, '');
	if (!p) return 0;
	const grupos = p
		.replace(/([aeoáéíóú])([íúaeoáéó])/g, '$1-$2') // hiatos (sa-ú-de, po-e-ma)
		.replace(/gu(?=[eiéí])|qu(?=[aeioáéíó])/g, 'g') // "u" mudo
		.match(/[aeiouáàâãéêíóôõúü]+/g);
	return Math.max(1, grupos ? grupos.length : 1);
}

function medir(blocos) {
	let frases = 0;
	let palavras = 0;
	let sil = 0;
	const longas = [];
	for (const bloco of blocos) {
		const partes = bloco.split(/(?<=[.!?…])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9"“])/).filter((f) => f.trim());
		for (const frase of partes) {
			const ps = frase.split(/\s+/).filter((w) => /[a-záàâãéêíóôõúç0-9]/i.test(w));
			if (!ps.length) continue;
			frases++;
			palavras += ps.length;
			sil += ps.reduce((s, w) => s + silabas(w), 0);
			if (ps.length > 25) longas.push(`${ps.length} palavras: ${frase.slice(0, 140)}${frase.length > 140 ? '…' : ''}`);
		}
	}
	const ppf = palavras / Math.max(1, frases);
	const spp = sil / Math.max(1, palavras);
	const indice = 248.835 - 1.015 * ppf - 84.6 * spp;
	return { frases, palavras, ppf, spp, indice, longas };
}

const faixa = (i) => (i >= 75 ? 'muito fácil' : i >= 50 ? 'fácil' : i >= 25 ? 'difícil' : 'muito difícil');

if (!existsSync(SAIDA)) {
	console.error('Rode "npm run build" antes.');
	process.exit(1);
}

const linhas = [];
let total = { frases: 0, palavras: 0, sil: 0 };
for (const arquivo of listar(SAIDA).sort()) {
	const html = readFileSync(arquivo, 'utf8');
	if (/<meta name="robots" content="noindex/.test(html) && !arquivo.includes('promo')) continue;
	const url = '/' + path.relative(SAIDA, arquivo).replace(/index\.html$/, '');
	const m = medir(textoPrincipal(html));
	total.frases += m.frases;
	total.palavras += m.palavras;
	total.sil += m.spp * m.palavras;
	linhas.push({ url, ...m });
}

console.log('\n| Página | Palavras | Palavras/frase | Sílabas/palavra | Índice | Faixa |');
console.log('|---|---:|---:|---:|---:|---|');
for (const l of linhas) {
	console.log(`| \`${l.url}\` | ${l.palavras} | ${l.ppf.toFixed(1)} | ${l.spp.toFixed(2)} | ${l.indice.toFixed(0)} | ${faixa(l.indice)} |`);
}
const ppf = total.palavras / total.frases;
const spp = total.sil / total.palavras;
const indice = 248.835 - 1.015 * ppf - 84.6 * spp;
console.log(`| **Site todo** | ${total.palavras} | ${ppf.toFixed(1)} | ${spp.toFixed(2)} | ${indice.toFixed(0)} | ${faixa(indice)} |`);

const longas = linhas.flatMap((l) => l.longas.map((t) => `- \`${l.url}\` — ${t}`));
console.log(`\nFrases com mais de 25 palavras: ${longas.length}`);
longas.forEach((t) => console.log(t));
