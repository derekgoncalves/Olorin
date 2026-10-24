/**
 * Minijogo 8-bit do banner da home (23/10/2026, prévia aprovada pelo dono). Num canvas de 192 x 72 px
 * (escalado em pixel pelo CSS) o bonequinho com a cabeça no "O" da Olorin (VERDE, corpo branco) pega os
 * likes, sobe as barras do gráfico (violeta), clica no alvo e aparece "+1 nível". Ciclo de ~5 s.
 * Cores da marca: o verde nunca encosta no violeta (alvo em branco, preto e verde; ondas e corações só
 * longe das barras).
 * - No celular (até 767 px) o cenário é mais curto (120 x 72), para o jogo ficar maior na tela (dono, 24/10).
 * - Para quando o banner sai da tela, quando a aba fica oculta e com html.o-pausado (volta depois).
 * - Com prefers-reduced-motion: reduce desenha só o quadro final, parado.
 * - Sem JS o canvas fica escondido pelo CSS (é decoração, aria-hidden). Visual em hero.css.
 */
import { $, doc, raiz, movimentoReduzido, temIO } from '../util.js';

const VERDE = '#ecff36';
const BRANCO = '#fff';
const VIOLETA = '#7e3bed';
const LAVANDA = '#be96ff';
const PRETO = '#000';
const CORES = { G: VERDE, W: BRANCO, V: VIOLETA, L: LAVANDA, P: PRETO };

/* Sprites: cada letra é um pixel (G verde, W branco, V violeta, L lavanda, P preto; "." transparente). */
const CABECA = [
	'..GGGGGGGGG..',
	'.GGGGGGGGGGG.',
	'G....GGGGGGGG',
	'G......GGGGGG',
	'G.....G..GGGG',
	'GG...GGGGGGGG',
	'GGG...G....GG',
	'GGGG........G',
	'GGGGGG......G',
	'GGGGGGGG....G',
	'.GGGGGGGGGGG.',
	'..GGGGGGGGG..',
];
const CW = 13;
const CH = 12;
/* Corpo branco (contrasta com a cabeça verde e com o fundo preto): pescoço, braços e tronco. */
const CORPO = ['...W...', '.WWWWW.', 'W.WWW.W', '..WWW..'];
const PERNAS = [
	['..W.W..', '.W...W.'],
	['...W...', '..W.W..'],
	['..W.W..', '..W.W..'],
];
const CORACAO = ['.G.G.', 'GGGGG', '.GGG.', '..G..'];
/* Cenários: largura do canvas, trajeto [x0, y0, x1, y1, duração (ms), altura do pulo] (anda, pula 4 barras,
   vai até o alvo e comemora), likes, barras (x da 1ª e passo), alvo, corações do clique e raio da onda. */
const CENARIOS = {
	largo: {
		w: 192,
		trechos: [
			[4, 60, 58, 60, 1300, 0],
			[58, 60, 75, 52, 340, 9],
			[75, 52, 89, 44, 300, 9],
			[89, 44, 103, 36, 300, 9],
			[103, 36, 117, 28, 300, 9],
			[117, 28, 160, 20, 720, 10],
			[160, 20, 160, 20, 1800, 0],
		],
		likes: [[22, 46], [34, 42], [46, 46]],
		barra: [70, 14],
		alvo: 160,
		coracoes: [[146, 0], [172, 0.15], [184, 0.3]],
		onda: 16,
	},
	curto: {
		w: 120,
		trechos: [
			[2, 60, 26, 60, 1100, 0],
			[26, 60, 43, 52, 340, 9],
			[43, 52, 55, 44, 300, 9],
			[55, 44, 67, 36, 300, 9],
			[67, 36, 79, 28, 300, 9],
			[79, 28, 106, 20, 620, 10],
			[106, 20, 106, 20, 1800, 0],
		],
		likes: [[8, 46], [15, 42], [22, 46]],
		barra: [38, 12],
		alvo: 106,
		coracoes: [[92, 0], [113, 0.15]],
		onda: 12,
	},
};
const curtoMQ = window.matchMedia ? window.matchMedia('(max-width: 767px)') : null;

export function iniciarJogo() {
	const caixa = $('[data-o-jogo]');
	const canvas = caixa && $('canvas', caixa);
	const x = canvas && canvas.getContext ? canvas.getContext('2d') : null;
	if (!x) return;
	const aviso = $('[data-o-jogo-aviso]', caixa);
	let avisoOn = null;
	let C = CENARIOS.largo;
	let TOTAL = 0;
	const escolher = () => {
		C = curtoMQ && curtoMQ.matches ? CENARIOS.curto : CENARIOS.largo;
		TOTAL = C.trechos.reduce((s, t) => s + t[4], 0);
		canvas.width = C.w;
		canvas.height = 72;
		caixa.classList.toggle('is-curto', C === CENARIOS.curto);
	};
	escolher();

	const px = (cor, a, b, w, h) => {
		x.fillStyle = cor;
		x.fillRect(Math.round(a), Math.round(b), w || 1, h || 1);
	};
	const sprite = (m, ox, oy) => {
		m.forEach((linha, r) => {
			for (let k = 0; k < linha.length; k++) if (linha[k] !== '.') px(CORES[linha[k]], ox + k, oy + r);
		});
	};
	const disco = (cx, cy, r, cor) => {
		for (let yy = -r; yy <= r; yy++) {
			const w = Math.floor(Math.sqrt(r * r - yy * yy));
			px(cor, cx - w, cy + yy, w * 2 + 1, 1);
		}
	};
	const mostrarAviso = (on) => {
		if (!aviso || on === avisoOn) return;
		avisoOn = on;
		aviso.classList.toggle('is-on', on);
	};

	function cenario(t, fx, fim) {
		x.setTransform(1, 0, 0, 1, 0, 8);
		x.clearRect(0, -8, C.w, 72);
		for (let i = 0; i < C.w; i += 4) px(LAVANDA, i, 61, 2, 1); // chão
		for (let k = 0; k < 4; k++) {
			// barras do gráfico, cada uma mais alta
			const h = 8 * (k + 1);
			const bx = C.barra[0] + C.barra[1] * k;
			px(VIOLETA, bx, 60 - h, 10, h);
			px(LAVANDA, bx, 60 - h, 10, 1);
		}
		// alvo: haste e disco branco, preto e verde
		const a = C.alvo;
		px(BRANCO, a, 33, 1, 27);
		disco(a, 27, 6, BRANCO);
		disco(a, 27, 4, PRETO);
		disco(a, 27, 2, VERDE);
		C.likes.forEach((m) => {
			if (fx < m[0]) sprite(CORACAO, m[0], m[1] + Math.round(Math.sin(t / 180 + m[0])));
		});
		if (fim >= 0) {
			// clique no alvo: 2 ondas e 3 corações que sobem
			for (let n = 0; n < 2; n++) {
				const u = fim - n * 0.25;
				if (u > 0 && u < 1) {
					x.globalAlpha = 1 - u;
					x.strokeStyle = VERDE;
					x.lineWidth = 1;
					x.beginPath();
					x.arc(a + 0.5, 27.5, 7 + u * C.onda, 0, 7);
					x.stroke();
					x.globalAlpha = 1;
				}
			}
			C.coracoes.forEach((c) => {
				const u = fim - c[1];
				if (u > 0 && u < 0.8) {
					x.globalAlpha = 1 - u / 0.8;
					sprite(CORACAO, c[0], 22 - u * 22);
					x.globalAlpha = 1;
				}
			});
		}
	}
	function boneco(fx, fy, passo) {
		const ox = Math.round(fx - 3);
		const oy = Math.round(fy - 6);
		sprite(CABECA, Math.round(fx - CW / 2), oy - CH);
		sprite(CORPO, ox, oy);
		sprite(PERNAS[passo], ox, oy + 4);
	}
	function quadro(t) {
		let acc = 0;
		let i = 0;
		const T = C.trechos;
		for (; i < T.length; i++) {
			if (t < acc + T[i][4]) break;
			acc += T[i][4];
		}
		if (i >= T.length) {
			i = T.length - 1;
			acc = TOTAL - T[i][4];
		}
		const s = T[i];
		const u = (t - acc) / s[4];
		const fx = s[0] + (s[2] - s[0]) * u;
		const fy = s[1] + (s[3] - s[1]) * u - Math.sin(Math.PI * u) * s[5];
		const fim = i === T.length - 1 ? u : -1;
		cenario(t, fx, fim);
		boneco(fx, fy + (fim >= 0 && fim < 0.12 ? 1 : 0), s[5] || fim >= 0 ? 2 : Math.floor(t / 110) % 2);
		mostrarAviso(fim >= 0);
	}
	/* Quadro final parado: todos os likes pegos, o bonequinho no alvo e "+1 nível". */
	function quadroFinal() {
		cenario(0, 999, -1);
		boneco(C.alvo, 20, 2);
		mostrarAviso(true);
	}

	caixa.classList.add('is-pronto');
	// Girou o celular ou mudou a janela de faixa: troca o cenário e recomeça do quadro final.
	const trocar = () => {
		escolher();
		quadroFinal();
	};
	if (curtoMQ) {
		if (curtoMQ.addEventListener) curtoMQ.addEventListener('change', trocar);
		else if (curtoMQ.addListener) curtoMQ.addListener(trocar);
	}
	if (movimentoReduzido) {
		quadroFinal();
		return;
	}

	let visivel = true;
	let pedido = 0;
	let t0 = null;
	let tempo = 0; // onde o ciclo parou (para voltar do mesmo ponto)
	const pausado = () => raiz.classList.contains('o-pausado');
	function laco(ts) {
		pedido = 0;
		if (t0 === null) t0 = ts - tempo;
		tempo = (ts - t0) % TOTAL;
		quadro(tempo);
		pedido = window.requestAnimationFrame(laco);
	}
	function atualizar() {
		const rodar = visivel && !doc.hidden && !pausado();
		if (rodar && !pedido) {
			t0 = null;
			pedido = window.requestAnimationFrame(laco);
		} else if (!rodar && pedido) {
			window.cancelAnimationFrame(pedido);
			pedido = 0;
		}
	}
	// Antes do 1º quadro (ou se começar pausado), o quadro final já fica desenhado.
	quadroFinal();
	if (temIO) {
		new IntersectionObserver((en) => {
			visivel = en[en.length - 1].isIntersecting;
			atualizar();
		}).observe(caixa);
	}
	doc.addEventListener('visibilitychange', atualizar);
	if ('MutationObserver' in window) new MutationObserver(atualizar).observe(raiz, { attributes: true, attributeFilter: ['class'] });
	atualizar();
}
