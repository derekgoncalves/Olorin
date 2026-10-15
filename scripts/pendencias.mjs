/**
 * Lista o que ainda falta o dono confirmar no conteúdo.
 *
 *   npm run pendencias
 *
 * Convenção (13/10/2026): o texto proposto vai ao ar e fica marcado com um comentário
 * "# PENDENTE: o que confirmar" na linha de cima do .yml. Marcadores [CONFIRMAR: ...]
 * antigos também são listados (e travam o build, porque apareceriam para o visitante).
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
					const pendente = linha.match(/^\s*#\s*PENDENTE:\s*(.+)$/);
					if (pendente) {
						itens.push({ arquivo: caminho, linha: i + 1, texto: pendente[1].trim() });
						return;
					}
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
console.log(`\n${itens.length} pendência(s). Lista comentada para o dono: docs/PENDENCIAS.md\n`);
