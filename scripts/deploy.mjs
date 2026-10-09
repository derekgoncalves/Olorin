/**
 * Envio do site para a Locaweb por FTP (opcional — dá para subir na mão pelo FileZilla).
 *
 *   npm run deploy:dry   → só mostra o que seria enviado (não conecta se não houver .env)
 *   npm run deploy       → build + testes + backup do servidor + envio
 *
 * Credenciais: arquivo .env na raiz (copie de .env.example). A senha fica SÓ no seu computador.
 *
 * Regras de segurança (PROMPT seção 18):
 *  - NUNCA apaga nada no servidor (sem opção de "espelhar" ou "sincronizar com exclusão").
 *  - NUNCA envia nem sobrescreve: config.php, olorin-config.php, a pasta leads/ (só o leads/.htaccess
 *    de proteção), .well-known/ (certificado SSL), planilhas .csv.
 *  - Antes de enviar, baixa um backup do que existe no servidor para backups/AAAA-MM-DD_HHMM/
 *    (sem config.php e sem leads: esses nunca são alterados).
 *  - Envia primeiro os arquivos de apoio (CSS, JS, fontes, imagens, PHP) e por último as páginas HTML,
 *    para nenhuma página nova apontar para um arquivo que ainda não chegou.
 */
import { readFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { Client } from 'basic-ftp';

const SAIDA = process.env.OLORIN_SAIDA || 'dist';
const SECO = process.argv.includes('--dry');
const SEM_BACKUP = process.argv.includes('--sem-backup');

// Nunca enviados e nunca baixados no backup.
const PROTEGIDOS = [/^config\.php$/, /^olorin-config\.php$/, /^leads\/(?!\.htaccess$)/, /^\.well-known\//, /\.csv$/i, /^backups?\//];
const protegido = (rel) => PROTEGIDOS.some((r) => r.test(rel));

function lerEnv() {
	if (!existsSync('.env')) return {};
	const env = {};
	for (const linha of readFileSync('.env', 'utf8').split(/\r?\n/)) {
		const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
		if (m && !linha.trim().startsWith('#')) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
	}
	return env;
}

function listar(pasta, base = pasta) {
	const saida = [];
	for (const nome of readdirSync(pasta)) {
		const caminho = path.join(pasta, nome);
		if (statSync(caminho).isDirectory()) saida.push(...listar(caminho, base));
		else saida.push(path.relative(base, caminho).split(path.sep).join('/'));
	}
	return saida;
}

if (!existsSync(path.join(SAIDA, 'index.html'))) {
	console.error('dist/ não existe. Rode "npm run build" antes.');
	process.exit(1);
}

const arquivos = listar(SAIDA).filter((rel) => !protegido(rel));
const ehPagina = (rel) => rel.endsWith('.html');
const ordem = [...arquivos.filter((r) => !ehPagina(r)), ...arquivos.filter(ehPagina)];
const total = ordem.reduce((s, r) => s + statSync(path.join(SAIDA, r)).size, 0);

console.log(`\n${ordem.length} arquivos para enviar (${(total / 1024 / 1024).toFixed(2)} MB).`);
console.log('Nunca enviados/alterados: config.php, olorin-config.php, leads/ (exceto leads/.htaccess), .well-known/, *.csv.');

const env = lerEnv();
const host = env.FTP_HOST;
const usuario = env.FTP_USUARIO;
const senha = env.FTP_SENHA;
const pastaRemota = (env.FTP_PASTA || '/public_html').replace(/\/$/, '');
const seguro = String(env.FTP_SEGURO || 'true') !== 'false';

if (SECO) {
	for (const rel of ordem) console.log(`  enviar  ${rel}`);
	console.log('\nSimulação: nada foi enviado.');
	if (!host || !usuario || !senha) console.log('(Sem .env completo: a conexão não foi testada.)');
	if (!host || !usuario || !senha) process.exit(0);
}

if (!host || !usuario || !senha) {
	console.error('\nFaltam FTP_HOST, FTP_USUARIO ou FTP_SENHA no arquivo .env (copie de .env.example e preencha no seu computador).');
	process.exit(1);
}

const cliente = new Client(30000);
try {
	await cliente.access({ host, user: usuario, password: senha, secure: seguro, secureOptions: { servername: host } });
	await cliente.cd(pastaRemota);
	console.log(`Conectado em ${host}${pastaRemota} (${seguro ? 'FTPS' : 'FTP sem criptografia'}).`);

	if (SECO) {
		const lista = await cliente.list();
		console.log(`Conexão ok. ${lista.length} itens na raiz do site.`);
		cliente.close();
		process.exit(0);
	}

	// 1. Backup do que existe no servidor (para desfazer em minutos).
	if (!SEM_BACKUP) {
		const carimbo = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '');
		const destino = path.join('backups', carimbo);
		mkdirSync(destino, { recursive: true });
		console.log(`\nBaixando backup para ${destino}/ ...`);
		async function baixar(remota, local) {
			for (const item of await cliente.list(remota)) {
				const rel = path.posix.join(remota, item.name).replace(/^\.\//, '');
				if (item.name === '.' || item.name === '..' || protegido(rel) || protegido(rel + '/')) continue;
				if (item.isDirectory) {
					mkdirSync(path.join(local, item.name), { recursive: true });
					await baixar(rel, path.join(local, item.name));
				} else {
					await cliente.downloadTo(path.join(local, item.name), rel);
				}
			}
		}
		await baixar('.', destino);
		console.log('Backup concluído.');
	}

	// 2. Envio (apoio primeiro, páginas por último). Nada é apagado.
	console.log('\nEnviando...');
	let n = 0;
	for (const rel of ordem) {
		const pasta = path.posix.dirname(rel);
		await cliente.cd(pastaRemota);
		if (pasta !== '.') await cliente.ensureDir(pasta);
		await cliente.cd(pastaRemota);
		await cliente.uploadFrom(path.join(SAIDA, rel), rel);
		n++;
		if (n % 20 === 0 || n === ordem.length) console.log(`  ${n}/${ordem.length}`);
	}
	console.log('\nPronto. Abra https://olorin.com.br e faça um envio de teste do formulário (docs/DEPLOY.md).');
	console.log('CSS e JS antigos (olorin.<hash>.css/js) ficam no servidor sem atrapalhar; apague pelo FTP se quiser.');
} catch (erro) {
	console.error(`\nFalha no envio: ${erro.message}`);
	console.error('Nada foi apagado no servidor. Se parte dos arquivos subiu, rode de novo ou siga o rollback em docs/DEPLOY.md.');
	process.exitCode = 1;
} finally {
	cliente.close();
}
