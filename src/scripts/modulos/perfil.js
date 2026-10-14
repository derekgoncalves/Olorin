/**
 * Perfis da equipe (/quem-somos/<pessoa>/): botão que copia o link do perfil
 * (no celular, abre o compartilhar do aparelho). Sem suporte, o botão continua escondido.
 */
export function iniciarPerfil() {
	const botao = document.querySelector('[data-o-copiar]');
	if (!botao) return;
	const compartilhar = typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches;
	const copiar = !!(navigator.clipboard && window.isSecureContext);
	if (!compartilhar && !copiar) return;
	const rotulo = botao.textContent;
	botao.hidden = false;
	botao.addEventListener('click', async () => {
		const url = window.location.href.split('#')[0];
		try {
			if (compartilhar) {
				await navigator.share({ title: document.title, url });
				return;
			}
			await navigator.clipboard.writeText(url);
			botao.textContent = botao.getAttribute('data-copiado') || rotulo;
			window.setTimeout(() => {
				botao.textContent = rotulo;
			}, 2200);
		} catch (erro) {
			/* compartilhamento cancelado ou cópia negada: nada a fazer */
		}
	});
}
