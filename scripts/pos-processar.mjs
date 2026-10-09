/**
 * Pós-processamento do build de produção:
 *  - CSS crítico embutido em cada página (Beasties): só as regras usadas naquela página
 *    vão no <head>; a folha completa (com hash) carrega sem bloquear a primeira pintura.
 */
import { readFile, writeFile } from 'node:fs/promises';
import Beasties from 'beasties';

// Regras que dependem de estado criado por JavaScript (classe "js" no <html>, variante do
// formulário, menus abertos...) não aparecem no HTML estático, mas precisam estar no CSS
// embutido para não haver "pulo" de layout quando a folha completa chega.
const SEMPRE = [
	/(^|[\s,>])html\.js\b/,
	/\.js\s/,
	/data-form-variant/,
	/data-etapa/,
	/\.o-reveal/,
	/o-has-cursor/,
	/\.is-scrolled/,
	/:root/,
];

export async function posProcessar({ saida, resultados }) {
	const beasties = new Beasties({
		path: saida,
		publicPath: '/',
		preload: 'media',
		noscriptFallback: true,
		pruneSource: false,
		inlineFonts: false,
		preloadFonts: false,
		compress: true,
		mergeStylesheets: true,
		allowRules: SEMPRE,
		logLevel: 'silent',
	});

	const paginas = (resultados || []).filter((r) => r.outputPath && r.outputPath.endsWith('.html'));
	for (const pagina of paginas) {
		const html = await readFile(pagina.outputPath, 'utf8');
		const processado = await beasties.process(html);
		await writeFile(pagina.outputPath, processado);
	}
}
