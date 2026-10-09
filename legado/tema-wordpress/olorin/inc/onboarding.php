<?php
/**
 * Primeiros passos: ao ativar o tema, monta o site automaticamente.
 *
 *  1. Cria a página "Início" com todas as seções e define como página inicial
 *  2. Cria o "Menu principal" com as âncoras das seções
 *  3. Publica a "Política de Privacidade" (LGPD) e liga ao WordPress
 *  4. Ativa links amigáveis (/nome-da-pagina/)
 *
 * Nada é apagado nem sobrescrito: se algo já existir, fica como está.
 * Em Aparência → Olorin: primeiros passos dá para recriar a página inicial original.
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

/**
 * Ordem das seções da página inicial (arquivos em /patterns).
 *
 * @return string[]
 */
function olorin_home_patterns() {
	return array(
		'01-hero',
		'02-faixa-servicos',
		'03-problemas',
		'04-metodo',
		'05-servicos',
		'06-portfolio',
		'07-resultados',
		'08-sobre',
		'09-faixa-palavras',
		'10-planos',
		'11-duvidas',
		'12-orcamento',
	);
}

/**
 * Conteúdo (blocos) de um padrão do tema.
 *
 * @param string $file Nome do arquivo sem .php.
 * @return string
 */
function olorin_pattern_content( $file ) {
	$path = OLORIN_DIR . '/patterns/' . sanitize_file_name( $file ) . '.php';
	if ( ! is_readable( $path ) ) {
		return '';
	}
	ob_start();
	include $path;
	return trim( (string) ob_get_clean() );
}

/**
 * Conteúdo completo da página inicial.
 *
 * @return string
 */
function olorin_home_content() {
	$parts = array();
	foreach ( olorin_home_patterns() as $pattern ) {
		$parts[] = olorin_pattern_content( $pattern );
	}
	return implode( "\n\n", array_filter( $parts ) );
}

/**
 * Cria a página inicial.
 *
 * @param string $status Status da página.
 * @param string $title  Título.
 * @return int|WP_Error
 */
function olorin_create_home_page( $status = 'publish', $title = '' ) {
	return wp_insert_post(
		array(
			'post_type'    => 'page',
			'post_status'  => $status,
			'post_title'   => $title ? $title : __( 'Início', 'olorin' ),
			'post_name'    => 'publish' === $status ? 'inicio' : '',
			'post_content' => wp_slash( olorin_home_content() ),
			'meta_input'   => array( '_wp_page_template' => 'template-secoes.php' ),
		),
		true
	);
}

/**
 * Texto da Política de Privacidade (modelo — revise com seus dados).
 *
 * @return string
 */
function olorin_privacy_content() {
	$email   = sanitize_email( olorin_opt( 'email' ) );
	$company = get_bloginfo( 'name' );

	$p = static function ( $text ) {
		return "<!-- wp:paragraph -->\n<p>" . $text . "</p>\n<!-- /wp:paragraph -->\n\n";
	};
	$h = static function ( $text ) {
		return "<!-- wp:heading -->\n<h2 class=\"wp-block-heading\">" . $text . "</h2>\n<!-- /wp:heading -->\n\n";
	};
	$list = static function ( $items ) {
		$out = "<!-- wp:list -->\n<ul class=\"wp-block-list\">";
		foreach ( $items as $item ) {
			$out .= "<!-- wp:list-item -->\n<li>" . $item . "</li>\n<!-- /wp:list-item -->\n\n";
		}
		return $out . "</ul>\n<!-- /wp:list -->\n\n";
	};

	$c  = $p( sprintf( 'Esta política explica como a %s trata os dados pessoais de quem visita este site, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Última atualização: %s.', esc_html( $company ), wp_date( 'd/m/Y' ) ) );
	$c .= $h( '1. Quem é responsável pelos seus dados' );
	$c .= $p( sprintf( 'O controlador dos dados é a %s, com sede em %s. Contato do encarregado (DPO): <a href="mailto:%s">%s</a>.', esc_html( $company ), esc_html( olorin_opt( 'cidade' ) ), esc_attr( $email ), esc_html( $email ) ) . ( olorin_opt( 'cnpj' ) ? ' CNPJ: ' . esc_html( olorin_opt( 'cnpj' ) ) . '.' : '' ) );
	$c .= $h( '2. Quais dados coletamos' );
	$c .= $list(
		array(
			'<strong>Formulário de orçamento:</strong> nome, WhatsApp, site ou perfil do Instagram (opcional), serviços de interesse, faixa de investimento e a mensagem que você escrever.',
			'<strong>Origem da visita:</strong> parâmetros de campanha (utm, gclid, fbclid), a página em que o formulário foi enviado e o site de onde você veio, para sabermos qual anúncio trouxe o contato.',
			'<strong>Cookies de medição e anúncios</strong> (Google e Meta): só são ativados se você clicar em "Aceitar" no aviso de cookies.',
			'<strong>Dados técnicos:</strong> o endereço IP é usado apenas momentaneamente para bloquear envios automáticos (spam) e não é armazenado junto ao seu pedido.',
		)
	);
	$c .= $h( '3. Para que usamos' );
	$c .= $list(
		array(
			'Responder o seu pedido e preparar uma proposta comercial (base legal: procedimentos preliminares a contrato, art. 7º, V, e consentimento, art. 7º, I, da LGPD).',
			'Medir o desempenho do site e dos nossos anúncios, quando você autoriza os cookies (base legal: consentimento).',
			'Não enviamos listas de disparo e não vendemos seus dados.',
		)
	);
	$c .= $h( '4. Com quem compartilhamos' );
	$c .= $p( 'Os dados ficam armazenados no servidor de hospedagem do site (Locaweb, no Brasil) e no nosso e-mail. Se você aceitar os cookies, Google e Meta recebem dados de navegação conforme as políticas de privacidade dessas empresas. Não há outros compartilhamentos, salvo por obrigação legal.' );
	$c .= $h( '5. Por quanto tempo guardamos' );
	$c .= $p( 'Pedidos de orçamento ficam guardados por até 24 meses após o último contato, ou até você pedir a exclusão. Depois disso, são apagados.' );
	$c .= $h( '6. Seus direitos' );
	$c .= $p( sprintf( 'Você pode, a qualquer momento, confirmar se tratamos seus dados, pedir acesso, correção, anonimização, portabilidade ou exclusão, e revogar o consentimento (art. 18 da LGPD). Basta escrever para <a href="mailto:%1$s">%1$s</a>. Você também pode recusar os cookies a qualquer momento limpando os dados do site no seu navegador.', esc_html( $email ) ) );
	$c .= $h( '7. Segurança' );
	$c .= $p( 'O site usa conexão criptografada (HTTPS) e o acesso aos pedidos é restrito aos administradores.' );
	$c .= $h( '8. Mudanças nesta política' );
	$c .= $p( 'Podemos atualizar este texto. A data da última atualização fica sempre no início da página.' );

	return $c;
}

/**
 * Executa o onboarding (uma vez).
 */
function olorin_onboarding() {
	if ( get_option( 'olorin_onboarded' ) ) {
		return;
	}

	olorin_portfolio_default_terms();

	// 1) Página inicial.
	$front_id = (int) get_option( 'page_on_front' );
	if ( 'page' !== get_option( 'show_on_front' ) || ! $front_id || ! get_post( $front_id ) ) {
		$existing = get_page_by_path( 'inicio' );
		$home_id  = $existing ? $existing->ID : olorin_create_home_page();
		if ( $home_id && ! is_wp_error( $home_id ) ) {
			update_option( 'show_on_front', 'page' );
			update_option( 'page_on_front', (int) $home_id );
		}
	}

	// 2) Menu principal.
	$locations = get_theme_mod( 'nav_menu_locations', array() );
	if ( empty( $locations['principal'] ) ) {
		$menu = wp_get_nav_menu_object( 'Menu principal' );
		$menu_id = $menu ? (int) $menu->term_id : wp_create_nav_menu( 'Menu principal' );
		if ( $menu_id && ! is_wp_error( $menu_id ) && ! $menu ) {
			$items = array(
				'Serviços'   => '#servicos',
				'Método'     => '#metodo',
				'Portfólio'  => '#portfolio',
				'Resultados' => '#resultados',
				'Sobre'      => '#sobre',
				'Dúvidas'    => '#duvidas',
			);
			$order = 1;
			foreach ( $items as $label => $url ) {
				wp_update_nav_menu_item(
					$menu_id,
					0,
					array(
						'menu-item-title'    => $label,
						'menu-item-url'      => $url,
						'menu-item-status'   => 'publish',
						'menu-item-type'     => 'custom',
						'menu-item-position' => $order++,
					)
				);
			}
		}
		if ( $menu_id && ! is_wp_error( $menu_id ) ) {
			$locations['principal'] = (int) $menu_id;
			set_theme_mod( 'nav_menu_locations', $locations );
		}
	}

	// 3) Política de Privacidade.
	$privacy_id = (int) get_option( 'wp_page_for_privacy_policy' );
	$privacy    = $privacy_id ? get_post( $privacy_id ) : null;
	if ( ! $privacy || 'publish' !== $privacy->post_status ) {
		$args = array(
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => __( 'Política de Privacidade', 'olorin' ),
			'post_name'    => 'politica-de-privacidade',
			'post_content' => wp_slash( olorin_privacy_content() ),
		);
		if ( $privacy ) {
			$args['ID'] = $privacy->ID;
			$new_id     = wp_update_post( $args, true );
		} else {
			$new_id = wp_insert_post( $args, true );
		}
		if ( $new_id && ! is_wp_error( $new_id ) ) {
			update_option( 'wp_page_for_privacy_policy', (int) $new_id );
		}
	}

	// 4) Links amigáveis.
	if ( '' === (string) get_option( 'permalink_structure' ) ) {
		update_option( 'permalink_structure', '/%postname%/' );
		flush_rewrite_rules( true );
	}

	// 5) Frase do site (só se ainda for a padrão do WordPress).
	$tagline = (string) get_option( 'blogdescription' );
	if ( '' === $tagline || in_array( $tagline, array( 'Just another WordPress site', 'Só mais um site WordPress', 'Mais um site WordPress' ), true ) ) {
		update_option( 'blogdescription', __( 'Agência de marketing 360 em Curitiba', 'olorin' ) );
	}

	// 6) Site de agência: comentários desligados por padrão (evita spam). Reative em Configurações → Discussão.
	$comments = wp_count_comments();
	if ( empty( $comments->approved ) ) {
		update_option( 'default_comment_status', 'closed' );
		update_option( 'default_ping_status', 'closed' );
	}

	update_option( 'olorin_onboarded', OLORIN_VERSION );
	set_transient( 'olorin_welcome', 1, DAY_IN_SECONDS );
}
add_action( 'after_switch_theme', 'olorin_onboarding' );

/**
 * Aviso de boas-vindas depois de ativar o tema.
 */
function olorin_welcome_notice() {
	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
	if ( ! get_transient( 'olorin_welcome' ) || ! current_user_can( 'edit_theme_options' ) || ! $screen || ! in_array( $screen->id, array( 'dashboard', 'themes' ), true ) ) {
		return;
	}
	printf(
		'<div class="notice notice-success is-dismissible"><p><strong>%s</strong> %s</p><p><a class="button button-primary" href="%s">%s</a> <a class="button" href="%s">%s</a></p></div>',
		esc_html__( 'Tema Olorin ativado!', 'olorin' ),
		esc_html__( 'A página inicial, o menu e a política de privacidade já foram criados.', 'olorin' ),
		esc_url( admin_url( 'themes.php?page=olorin-inicio' ) ),
		esc_html__( 'Ver os primeiros passos', 'olorin' ),
		esc_url( home_url( '/' ) ),
		esc_html__( 'Ver o site', 'olorin' )
	);
}
add_action( 'admin_notices', 'olorin_welcome_notice' );

/**
 * Página Aparência → Olorin: primeiros passos.
 */
function olorin_start_menu() {
	add_theme_page(
		__( 'Olorin: primeiros passos', 'olorin' ),
		__( 'Olorin: primeiros passos', 'olorin' ),
		'edit_theme_options',
		'olorin-inicio',
		'olorin_start_page'
	);
}
add_action( 'admin_menu', 'olorin_start_menu' );

/**
 * Recria a página inicial original (como rascunho, sem mexer na atual).
 */
function olorin_recreate_home() {
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		wp_die( esc_html__( 'Sem permissão.', 'olorin' ) );
	}
	check_admin_referer( 'olorin_recreate_home' );
	delete_transient( 'olorin_welcome' );
	$id = olorin_create_home_page( 'draft', __( 'Início (modelo original)', 'olorin' ) );
	$to = is_wp_error( $id ) ? admin_url( 'themes.php?page=olorin-inicio' ) : admin_url( 'post.php?post=' . (int) $id . '&action=edit' );
	wp_safe_redirect( $to );
	exit;
}
add_action( 'admin_post_olorin_recreate_home', 'olorin_recreate_home' );

/**
 * HTML da página de primeiros passos.
 */
function olorin_start_page() {
	delete_transient( 'olorin_welcome' );
	$front   = (int) get_option( 'page_on_front' );
	$steps   = array(
		array(
			__( 'Troque o número do WhatsApp, e-mail e redes', 'olorin' ),
			__( 'Todos os botões de WhatsApp do site usam o número salvo aqui.', 'olorin' ),
			admin_url( 'customize.php?autofocus[section]=olorin_contato' ),
			__( 'Abrir Contato', 'olorin' ),
		),
		array(
			__( 'Configure o e-mail (SMTP)', 'olorin' ),
			__( 'Necessário na Locaweb para receber o aviso de cada lead.', 'olorin' ),
			admin_url( 'options-general.php?page=olorin-smtp' ),
			__( 'Configurar e-mail', 'olorin' ),
		),
		array(
			__( 'Revise os textos e números da página inicial', 'olorin' ),
			__( 'Clique em qualquer texto para editar. Use as setas ↑↓ da barra do bloco (ou a Visão geral/List View) para mudar a ordem das seções.', 'olorin' ),
			$front ? admin_url( 'post.php?post=' . $front . '&action=edit' ) : admin_url( 'edit.php?post_type=page' ),
			__( 'Editar página inicial', 'olorin' ),
		),
		array(
			__( 'Cadastre os trabalhos do portfólio', 'olorin' ),
			__( 'Enquanto não houver projetos, o site mostra exemplos ilustrativos.', 'olorin' ),
			admin_url( 'post-new.php?post_type=olorin_projeto' ),
			__( 'Adicionar projeto', 'olorin' ),
		),
		array(
			__( 'Revise a Política de Privacidade', 'olorin' ),
			__( 'Modelo pronto para a LGPD — confira empresa, CNPJ e e-mail.', 'olorin' ),
			get_option( 'wp_page_for_privacy_policy' ) ? admin_url( 'post.php?post=' . (int) get_option( 'wp_page_for_privacy_policy' ) . '&action=edit' ) : admin_url( 'options-privacy.php' ),
			__( 'Editar política', 'olorin' ),
		),
		array(
			__( 'Rastreamento (opcional)', 'olorin' ),
			__( 'Cole o ID do Google Tag Manager, GA4 e/ou Meta Pixel. O aviso de cookies aparece sozinho.', 'olorin' ),
			admin_url( 'customize.php?autofocus[section]=olorin_rastreamento' ),
			__( 'Abrir Rastreamento', 'olorin' ),
		),
	);
	?>
	<div class="wrap" style="max-width:880px">
		<h1><?php esc_html_e( 'Olorin: primeiros passos', 'olorin' ); ?></h1>
		<p><?php esc_html_e( 'Seu site já está no ar com todas as seções. Siga a lista abaixo para deixar tudo com os seus dados.', 'olorin' ); ?></p>
		<ol style="padding-left:1.2em">
			<?php foreach ( $steps as $step ) : ?>
				<li style="margin:0 0 18px">
					<strong><?php echo esc_html( $step[0] ); ?></strong><br>
					<span><?php echo esc_html( $step[1] ); ?></span><br>
					<a class="button" style="margin-top:6px" href="<?php echo esc_url( $step[2] ); ?>"><?php echo esc_html( $step[3] ); ?></a>
				</li>
			<?php endforeach; ?>
		</ol>

		<h2><?php esc_html_e( 'Deixar o site mais rápido (recomendado)', 'olorin' ); ?></h2>
		<?php
		$olorin_ht = isset( $_GET['olorin_htaccess'] ) ? sanitize_key( wp_unslash( $_GET['olorin_htaccess'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( 'on' === $olorin_ht ) {
			echo '<div class="notice notice-success inline"><p>' . esc_html__( 'Compressão e cache ativados. Abra o site para conferir se está tudo normal.', 'olorin' ) . '</p></div>';
		} elseif ( 'off' === $olorin_ht ) {
			echo '<div class="notice notice-info inline"><p>' . esc_html__( 'Regras removidas do .htaccess.', 'olorin' ) . '</p></div>';
		} elseif ( 'erro' === $olorin_ht ) {
			echo '<div class="notice notice-error inline"><p>' . esc_html__( 'Não foi possível gravar o arquivo .htaccess (permissão). Veja o guia do tema para colar as regras manualmente.', 'olorin' ) . '</p></div>';
		}
		$olorin_ht_on = (bool) get_option( 'olorin_htaccess' );
		?>
		<p><?php esc_html_e( 'Ativa compressão (gzip), cache de imagens, fontes, CSS e JS por 1 ano e cabeçalhos de segurança no servidor Apache da Locaweb. Pode ser desfeito a qualquer momento.', 'olorin' ); ?></p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="olorin_htaccess">
			<input type="hidden" name="ativar" value="<?php echo $olorin_ht_on ? '0' : '1'; ?>">
			<?php wp_nonce_field( 'olorin_htaccess' ); ?>
			<?php
			submit_button(
				$olorin_ht_on ? __( 'Desativar otimização do servidor', 'olorin' ) : __( 'Ativar compressão e cache', 'olorin' ),
				$olorin_ht_on ? 'secondary' : 'primary',
				'submit',
				false
			);
			?>
			<?php if ( $olorin_ht_on ) : ?>
				<span style="margin-left:8px;color:#00a32a">✓ <?php esc_html_e( 'Ativo', 'olorin' ); ?></span>
			<?php endif; ?>
		</form>

		<h2><?php esc_html_e( 'Atalhos de link para usar nos botões', 'olorin' ); ?></h2>
		<table class="widefat striped" style="max-width:880px">
			<tbody>
				<tr><td><code>#whatsapp</code></td><td><?php esc_html_e( 'Abre o WhatsApp com a mensagem padrão', 'olorin' ); ?></td></tr>
				<tr><td><code>#whatsapp=Sua mensagem aqui</code></td><td><?php esc_html_e( 'Abre o WhatsApp com uma mensagem personalizada', 'olorin' ); ?></td></tr>
				<tr><td><code>#orcamento</code></td><td><?php esc_html_e( 'Rola até o formulário', 'olorin' ); ?></td></tr>
				<tr><td><code>#orcamento-nome-do-plano</code></td><td><?php esc_html_e( 'Rola até o formulário e registra o plano no lead', 'olorin' ); ?></td></tr>
				<tr><td><code>#instagram</code> · <code>#linkedin</code> · <code>#email</code></td><td><?php esc_html_e( 'Links configurados em Personalizar → Contato', 'olorin' ); ?></td></tr>
				<tr><td><code>[olorin_telefone]</code> · <code>[olorin_email]</code></td><td><?php esc_html_e( 'Escreva no texto para mostrar o telefone/e-mail configurados', 'olorin' ); ?></td></tr>
			</tbody>
		</table>

		<h2><?php esc_html_e( 'Voltar ao modelo original', 'olorin' ); ?></h2>
		<p><?php esc_html_e( 'Cria uma cópia da página inicial original como rascunho (sua página atual não é alterada). Útil para copiar uma seção que você apagou.', 'olorin' ); ?></p>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="olorin_recreate_home">
			<?php wp_nonce_field( 'olorin_recreate_home' ); ?>
			<?php submit_button( __( 'Criar rascunho com a página original', 'olorin' ), 'secondary', 'submit', false ); ?>
		</form>
		<p style="margin-top:16px"><?php esc_html_e( 'Dica: todas as seções também ficam no inseridor de blocos (+), aba Padrões → "Olorin — seções do site".', 'olorin' ); ?></p>
	</div>
	<?php
}

/**
 * Regras de desempenho e segurança para o .htaccess (Apache da Locaweb).
 * Tudo dentro de <IfModule>: se o servidor não tiver o módulo, a regra é ignorada.
 *
 * @return string[]
 */
function olorin_htaccess_rules() {
	return array(
		'<IfModule mod_deflate.c>',
		'	AddOutputFilterByType DEFLATE text/html text/plain text/css text/xml application/xml application/rss+xml application/javascript text/javascript application/json image/svg+xml',
		'</IfModule>',
		'<IfModule mod_expires.c>',
		'	ExpiresActive On',
		'	ExpiresByType image/webp "access plus 1 year"',
		'	ExpiresByType image/avif "access plus 1 year"',
		'	ExpiresByType image/jpeg "access plus 1 year"',
		'	ExpiresByType image/png "access plus 1 year"',
		'	ExpiresByType image/gif "access plus 1 year"',
		'	ExpiresByType image/svg+xml "access plus 1 year"',
		'	ExpiresByType image/x-icon "access plus 1 year"',
		'	ExpiresByType font/woff2 "access plus 1 year"',
		'	ExpiresByType text/css "access plus 1 year"',
		'	ExpiresByType application/javascript "access plus 1 year"',
		'	ExpiresByType text/javascript "access plus 1 year"',
		'</IfModule>',
		'<IfModule mod_headers.c>',
		'	Header always set X-Content-Type-Options "nosniff"',
		'	Header always set Referrer-Policy "strict-origin-when-cross-origin"',
		'	Header always set X-Frame-Options "SAMEORIGIN"',
		'	Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"',
		'</IfModule>',
	);
}

/**
 * Liga/desliga as regras de desempenho no .htaccess da raiz do WordPress.
 */
function olorin_toggle_htaccess() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'Sem permissão.', 'olorin' ) );
	}
	check_admin_referer( 'olorin_htaccess' );
	require_once ABSPATH . 'wp-admin/includes/misc.php';

	$enable = ! empty( $_POST['ativar'] );
	$file   = get_home_path() . '.htaccess';
	$ok     = insert_with_markers( $file, 'Olorin desempenho', $enable ? olorin_htaccess_rules() : array() );
	if ( $ok ) {
		update_option( 'olorin_htaccess', $enable ? 1 : 0 );
	}
	wp_safe_redirect( admin_url( 'themes.php?page=olorin-inicio&olorin_htaccess=' . ( $ok ? ( $enable ? 'on' : 'off' ) : 'erro' ) ) );
	exit;
}
add_action( 'admin_post_olorin_htaccess', 'olorin_toggle_htaccess' );
