/**
 * Imagens responsivas (AVIF + WebP) a partir de src/assets/manifest.json.
 *
 * Cada imagem do manifesto vira várias larguras (srcset) em dist/assets/img/,
 * sem metadados (EXIF/GPS). Os originais nunca vão para o dist/.
 * Resultado em cache (.cache/img/) para o build ficar rápido.
 *
 * Uso nos templates: {{ imagem("equipe-natalia", { sizes: "...", classe: "..." }) | safe }}
 */
import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import { PASTA_IMAGENS as PASTA_BLOG, EXTENSOES_IMAGEM, idImagemBlog } from './blog.mjs';

const QUALIDADE = { avif: 52, webp: 74, jpg: 78 };

function chave(buffer, params) {
	return createHash('sha256').update(buffer).update(JSON.stringify(params)).digest('hex').slice(0, 12);
}

async function preparar(entrada, cfg) {
	let img = sharp(entrada, { failOn: 'none' }).rotate();
	const meta = await img.metadata();
	let largura = meta.width;
	let altura = meta.height;

	if (cfg.recorte) {
		// recorte: [esquerda, topo, largura, altura] em pixels da imagem original
		const [left, top, width, height] = cfg.recorte;
		img = img.extract({ left, top, width, height });
		largura = width;
		altura = height;
	}
	if (cfg.tratamento === 'pb') {
		img = img.grayscale().linear(1.18, -12);
	}
	return { img, largura, altura };
}

// Além do manifest.json principal, qualquer src/assets/manifest-<area>.json entra junto
// (cada área do site cuida do seu arquivo; ids repetidos travam o build).
async function lerManifestos() {
	const pasta = 'src/assets';
	const arquivos = ['manifest.json'].concat(
		(await readdir(pasta)).filter((n) => /^manifest-[\w-]+\.json$/.test(n)).sort(),
	);
	const imagens = {};
	for (const nome of arquivos) {
		const dados = JSON.parse(await readFile(path.join(pasta, nome), 'utf8'));
		for (const [id, cfg] of Object.entries(dados.imagens || {})) {
			if (imagens[id]) throw new Error(`Imagem "${id}" aparece em mais de um manifesto (src/assets/${nome}).`);
			imagens[id] = cfg;
		}
	}
	// Blog: toda imagem de src/assets/img-src/blog/ (fotos dos artigos e capas/ geradas por
	// "npm run capas") entra sozinha, sem mexer no manifesto. Id: "blog-" + nome do arquivo
	// sem extensão ("capas/meu-artigo.jpg" → "blog-capas-meu-artigo"). Ver docs/BLOG.md.
	for (const [id, cfg] of Object.entries(await imagensDoBlog())) {
		if (imagens[id]) throw new Error(`Imagem "${id}" do blog repete um id do manifesto (renomeie o arquivo em ${PASTA_BLOG}/).`);
		imagens[id] = cfg;
	}
	return { imagens };
}

async function imagensDoBlog(pasta = PASTA_BLOG, saida = {}) {
	if (!existsSync(pasta)) return saida;
	for (const item of await readdir(pasta, { withFileTypes: true })) {
		const caminho = path.join(pasta, item.name);
		if (item.isDirectory()) {
			await imagensDoBlog(caminho, saida);
		} else if (EXTENSOES_IMAGEM.test(item.name)) {
			const id = idImagemBlog(path.relative(PASTA_BLOG, caminho));
			if (saida[id]) throw new Error(`Duas imagens do blog com o mesmo nome: ${caminho} (troque o nome de uma delas).`);
			saida[id] = { arquivo_original: caminho, alt: '', larguras: [480, 800, 1200, 1600], largura_padrao: 800, formatos: ['avif', 'webp'] };
		}
	}
	return saida;
}

export async function processarImagens({ saida }) {
	const manifesto = await lerManifestos();
	const cache = '.cache/img';
	await mkdir(cache, { recursive: true });
	await mkdir(path.join(saida, 'assets/img'), { recursive: true });

	const resultado = {};
	for (const [id, cfg] of Object.entries(manifesto.imagens)) {
		if (cfg.publicar === false) {
			continue;
		}
		const origem = await readFile(cfg.arquivo_original);
		const { img, largura, altura } = await preparar(origem, cfg);
		const proporcao = altura / largura;
		const larguras = (cfg.larguras || [480, 960]).filter((w) => w <= largura);
		if (!larguras.length || larguras[larguras.length - 1] < Math.min(largura, Math.max(...(cfg.larguras || [480])))) {
			larguras.push(largura);
		}
		const formatos = cfg.formatos || ['avif', 'webp'];
		const fontes = {};

		for (const formato of formatos) {
			const itens = [];
			for (const w of [...new Set(larguras)].sort((a, b) => a - b)) {
				const h = Math.round(w * proporcao);
				const k = chave(origem, { cfg, w, formato });
				const nome = `${id}-${w}.${formato === 'jpg' ? 'jpg' : formato}`;
				const emCache = path.join(cache, `${k}-${nome}`);
				if (!existsSync(emCache)) {
					let pipeline = img.clone().resize({ width: w, height: h, fit: 'cover' });
					if (formato === 'avif') pipeline = pipeline.avif({ quality: QUALIDADE.avif, effort: 5 });
					else if (formato === 'webp') pipeline = pipeline.webp({ quality: QUALIDADE.webp, effort: 5 });
					else pipeline = pipeline.jpeg({ quality: QUALIDADE.jpg, mozjpeg: true });
					await writeFile(emCache, await pipeline.toBuffer());
				}
				await copyFile(emCache, path.join(saida, 'assets/img', nome));
				itens.push({ url: `/assets/img/${nome}`, w });
			}
			fontes[formato] = itens;
		}

		const maior = Math.max(...larguras);
		const padraoFormato = formatos.includes('webp') ? 'webp' : formatos[formatos.length - 1];
		const padrao = fontes[padraoFormato].find((i) => i.w === (cfg.largura_padrao || larguras[Math.min(1, larguras.length - 1)])) || fontes[padraoFormato][0];
		resultado[id] = {
			alt: cfg.alt || '',
			largura: maior,
			altura: Math.round(maior * proporcao),
			srcset: Object.fromEntries(Object.entries(fontes).map(([f, itens]) => [f, itens.map((i) => `${i.url} ${i.w}w`).join(', ')])),
			src: padrao.url,
		};
	}
	return resultado;
}
