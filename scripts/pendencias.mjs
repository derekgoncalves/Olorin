/**
 * Lista todos os marcadores [CONFIRMAR: ...] do conteúdo (o que ainda falta o dono responder).
 *
 *   npm run pendencias
 *
 * Esses textos não aparecem no site publicado até serem trocados pelo texto confirmado.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const PASTAS = ['src/content', 'src/_data'];
const itens = [];

function varrer(pasta) {
	for (const nome of readdirSync(pasta).sort()) {
		const caminho = path.join(pasta, nome);
		if (statSync(caminho).isDirectory()) varrer(caminho);
		else if (/\.(ya?ml|json)$/.test(nome)) {
			readFileSync(caminho, 'utf8')
				.split('\n')
				.forEach((linha, i) => {
					if (linha.trim().startsWith('#')) return;
					for (const m of linha.matchAll(/\[CONFIRMAR:?\s*([^\]]*)\]/g)) {
						itens.push({ arquivo: caminho, linha: i + 1, texto: m[1].trim() || '(sem descrição)' });
					}
				});
		}
	}
}

PASTAS.forEach(varrer);
let atual = '';
for (const it of itens) {
	if (it.arquivo !== atual) {
		atual = it.arquivo;
		console.log(`\n${atual}`);
	}
	console.log(`  linha ${String(it.linha).padStart(3)}  ${it.texto}`);
}
console.log(`\n${itens.length} pendência(s). Detalhes e quem responde: docs/CONTENT-TODO.md\n`);
