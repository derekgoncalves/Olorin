<?php
/**
 * Envio de e-mail autenticado (SMTP).
 *
 * Na Hospedagem de Sites da Locaweb a função mail() do PHP vem bloqueada,
 * então o WordPress só envia e-mail (avisos de lead, "esqueci a senha")
 * com SMTP autenticado. Configure em Configurações → E-mail (SMTP).
 *
 * Dados típicos da Locaweb (confirme no seu painel):
 *   Servidor: email-ssl.com.br · Porta: 465 · Segurança: SSL
 *   Usuário: o e-mail completo (ex.: oi@seudominio.com.br) · Senha: a senha dessa caixa
 *
 * Se preferir não guardar a senha no banco, defina no wp-config.php:
 *   define( 'OLORIN_SMTP_PASS', 'sua-senha' );
 * (também aceitos: OLORIN_SMTP_HOST, OLORIN_SMTP_PORT, OLORIN_SMTP_SECURE,
 *  OLORIN_SMTP_USER, OLORIN_SMTP_FROM, OLORIN_SMTP_FROM_NAME)
 *
 * Se você usar um plugin de SMTP (WP Mail SMTP, FluentSMTP, Post SMTP), este
 * módulo se desliga sozinho.
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

/**
 * Configuração efetiva do SMTP (constantes têm prioridade sobre a tela).
 *
 * @return array
 */
function olorin_smtp_settings() {
	$saved = get_option( 'olorin_smtp', array() );
	$saved = is_array( $saved ) ? $saved : array();

	$settings = wp_parse_args(
		$saved,
		array(
			'enabled'   => 0,
			'host'      => 'email-ssl.com.br',
			'port'      => 465,
			'secure'    => 'ssl',
			'user'      => '',
			'pass'      => '',
			'from'      => '',
			'from_name' => get_bloginfo( 'name' ),
		)
	);

	$constants = array(
		'host'      => 'OLORIN_SMTP_HOST',
		'port'      => 'OLORIN_SMTP_PORT',
		'secure'    => 'OLORIN_SMTP_SECURE',
		'user'      => 'OLORIN_SMTP_USER',
		'pass'      => 'OLORIN_SMTP_PASS',
		'from'      => 'OLORIN_SMTP_FROM',
		'from_name' => 'OLORIN_SMTP_FROM_NAME',
	);
	foreach ( $constants as $key => $constant ) {
		if ( defined( $constant ) ) {
			$settings[ $key ] = constant( $constant );
			if ( 'pass' === $key || 'user' === $key ) {
				$settings['enabled'] = 1;
			}
		}
	}

	if ( '' === $settings['from'] ) {
		$settings['from'] = $settings['user'];
	}

	return $settings;
}

/**
 * Outro plugin de SMTP ativo?
 *
 * @return bool
 */
function olorin_smtp_plugin_active() {
	return defined( 'WPMS_PLUGIN_VER' ) || defined( 'FLUENTMAIL' ) || class_exists( 'PostmanWpMail' ) || defined( 'EASY_WP_SMTP_PLUGIN_VERSION' );
}

/**
 * SMTP pronto para uso?
 *
 * @return bool
 */
function olorin_smtp_ready() {
	if ( olorin_smtp_plugin_active() ) {
		return true;
	}
	$s = olorin_smtp_settings();
	return ! empty( $s['enabled'] ) && '' !== $s['host'] && '' !== $s['user'] && '' !== $s['pass'];
}

/**
 * Configura o PHPMailer do WordPress.
 *
 * @param PHPMailer\PHPMailer\PHPMailer $mailer Mailer.
 */
function olorin_phpmailer_init( $mailer ) {
	if ( olorin_smtp_plugin_active() || ! olorin_smtp_ready() ) {
		return;
	}
	$s = olorin_smtp_settings();

	$mailer->isSMTP();
	$mailer->Host     = $s['host']; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	$mailer->Port     = (int) $s['port']; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	$mailer->SMTPAuth = true; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	$mailer->Username = $s['user']; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	$mailer->Password = $s['pass']; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	$mailer->Timeout  = 15; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase

	$secure = strtolower( (string) $s['secure'] );
	if ( in_array( $secure, array( 'ssl', 'tls' ), true ) ) {
		$mailer->SMTPSecure = $secure; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	} else {
		$mailer->SMTPSecure  = ''; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		$mailer->SMTPAutoTLS = false; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	}

	// O remetente precisa ser a própria conta autenticada (exigência da Locaweb).
	$from = is_email( $s['from'] ) ? $s['from'] : $s['user'];
	if ( is_email( $from ) ) {
		$mailer->setFrom( $from, $s['from_name'] ? $s['from_name'] : get_bloginfo( 'name' ), false );
		$mailer->Sender = $from; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	}
}
add_action( 'phpmailer_init', 'olorin_phpmailer_init', 20 );

/**
 * Página Configurações → E-mail (SMTP).
 */
function olorin_smtp_menu() {
	add_options_page(
		__( 'E-mail (SMTP)', 'olorin' ),
		__( 'E-mail (SMTP)', 'olorin' ),
		'manage_options',
		'olorin-smtp',
		'olorin_smtp_page'
	);
}
add_action( 'admin_menu', 'olorin_smtp_menu' );

/**
 * Registra a opção.
 */
function olorin_smtp_register_setting() {
	register_setting(
		'olorin_smtp',
		'olorin_smtp',
		array(
			'type'              => 'array',
			'sanitize_callback' => 'olorin_smtp_sanitize',
			'show_in_rest'      => false,
		)
	);
}
add_action( 'admin_init', 'olorin_smtp_register_setting' );

/**
 * Limpa os dados (senha em branco mantém a senha atual).
 *
 * @param array $input Dados enviados.
 * @return array
 */
function olorin_smtp_sanitize( $input ) {
	$current = get_option( 'olorin_smtp', array() );
	$current = is_array( $current ) ? $current : array();
	$input   = is_array( $input ) ? $input : array();

	$secure = isset( $input['secure'] ) ? strtolower( sanitize_text_field( $input['secure'] ) ) : 'ssl';

	return array(
		'enabled'   => empty( $input['enabled'] ) ? 0 : 1,
		'host'      => isset( $input['host'] ) ? sanitize_text_field( $input['host'] ) : '',
		'port'      => isset( $input['port'] ) ? absint( $input['port'] ) : 465,
		'secure'    => in_array( $secure, array( 'ssl', 'tls', 'none' ), true ) ? $secure : 'ssl',
		'user'      => isset( $input['user'] ) ? sanitize_text_field( $input['user'] ) : '',
		'pass'      => isset( $input['pass'] ) && '' !== $input['pass'] ? (string) $input['pass'] : ( isset( $current['pass'] ) ? $current['pass'] : '' ),
		'from'      => isset( $input['from'] ) ? sanitize_email( $input['from'] ) : '',
		'from_name' => isset( $input['from_name'] ) ? sanitize_text_field( $input['from_name'] ) : '',
	);
}

/**
 * HTML da página de configurações.
 */
function olorin_smtp_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$s       = olorin_smtp_settings();
	$saved   = get_option( 'olorin_smtp', array() );
	$has_pwd = ( is_array( $saved ) && ! empty( $saved['pass'] ) ) || defined( 'OLORIN_SMTP_PASS' );
	$test    = isset( $_GET['olorin_test'] ) ? sanitize_key( wp_unslash( $_GET['olorin_test'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$error   = get_transient( 'olorin_smtp_error' );
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'E-mail (SMTP)', 'olorin' ); ?></h1>

		<?php if ( 'ok' === $test ) : ?>
			<div class="notice notice-success"><p><?php esc_html_e( 'E-mail de teste enviado! Confira sua caixa de entrada (e o spam).', 'olorin' ); ?></p></div>
		<?php elseif ( 'erro' === $test ) : ?>
			<div class="notice notice-error"><p><?php esc_html_e( 'O teste falhou.', 'olorin' ); ?> <?php echo $error ? '<code>' . esc_html( $error ) . '</code>' : ''; ?></p></div>
		<?php endif; ?>

		<?php if ( olorin_smtp_plugin_active() ) : ?>
			<div class="notice notice-info"><p><?php esc_html_e( 'Um plugin de SMTP está ativo e cuida do envio. Esta tela fica desligada.', 'olorin' ); ?></p></div>
		<?php endif; ?>

		<p style="max-width:720px"><?php esc_html_e( 'A Locaweb bloqueia o envio simples de e-mail do PHP. Sem esta configuração, os avisos de novos leads e o "esqueci minha senha" não chegam. Os leads continuam salvos no menu Leads de qualquer forma.', 'olorin' ); ?></p>
		<p style="max-width:720px"><strong><?php esc_html_e( 'Locaweb (Hospedagem de Sites):', 'olorin' ); ?></strong> <?php esc_html_e( 'servidor email-ssl.com.br, porta 465, segurança SSL, usuário = e-mail completo da caixa criada no painel da Locaweb. Confirme os dados no seu painel.', 'olorin' ); ?></p>

		<form method="post" action="options.php">
			<?php settings_fields( 'olorin_smtp' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><?php esc_html_e( 'Ativar SMTP', 'olorin' ); ?></th>
					<td><label><input type="checkbox" name="olorin_smtp[enabled]" value="1" <?php checked( ! empty( $s['enabled'] ) ); ?>> <?php esc_html_e( 'Enviar os e-mails do site pelo servidor abaixo', 'olorin' ); ?></label></td>
				</tr>
				<tr>
					<th scope="row"><label for="olorin-smtp-host"><?php esc_html_e( 'Servidor SMTP', 'olorin' ); ?></label></th>
					<td><input id="olorin-smtp-host" class="regular-text" type="text" name="olorin_smtp[host]" value="<?php echo esc_attr( $s['host'] ); ?>"></td>
				</tr>
				<tr>
					<th scope="row"><label for="olorin-smtp-port"><?php esc_html_e( 'Porta', 'olorin' ); ?></label></th>
					<td><input id="olorin-smtp-port" class="small-text" type="number" name="olorin_smtp[port]" value="<?php echo esc_attr( (string) $s['port'] ); ?>"></td>
				</tr>
				<tr>
					<th scope="row"><label for="olorin-smtp-secure"><?php esc_html_e( 'Segurança', 'olorin' ); ?></label></th>
					<td>
						<select id="olorin-smtp-secure" name="olorin_smtp[secure]">
							<option value="ssl" <?php selected( $s['secure'], 'ssl' ); ?>>SSL (465)</option>
							<option value="tls" <?php selected( $s['secure'], 'tls' ); ?>>TLS (587)</option>
							<option value="none" <?php selected( $s['secure'], 'none' ); ?>><?php esc_html_e( 'Nenhuma', 'olorin' ); ?></option>
						</select>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="olorin-smtp-user"><?php esc_html_e( 'Usuário (e-mail completo)', 'olorin' ); ?></label></th>
					<td><input id="olorin-smtp-user" class="regular-text" type="text" name="olorin_smtp[user]" value="<?php echo esc_attr( $s['user'] ); ?>" autocomplete="off"></td>
				</tr>
				<tr>
					<th scope="row"><label for="olorin-smtp-pass"><?php esc_html_e( 'Senha', 'olorin' ); ?></label></th>
					<td>
						<input id="olorin-smtp-pass" class="regular-text" type="password" name="olorin_smtp[pass]" value="" autocomplete="new-password" placeholder="<?php echo $has_pwd ? esc_attr__( '•••••••• (salva — deixe em branco para manter)', 'olorin' ) : ''; ?>">
						<?php if ( defined( 'OLORIN_SMTP_PASS' ) ) : ?>
							<p class="description"><?php esc_html_e( 'Usando a senha definida no wp-config.php.', 'olorin' ); ?></p>
						<?php endif; ?>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="olorin-smtp-from"><?php esc_html_e( 'E-mail do remetente', 'olorin' ); ?></label></th>
					<td><input id="olorin-smtp-from" class="regular-text" type="email" name="olorin_smtp[from]" value="<?php echo esc_attr( $s['from'] ); ?>"><p class="description"><?php esc_html_e( 'Use o mesmo e-mail do usuário acima.', 'olorin' ); ?></p></td>
				</tr>
				<tr>
					<th scope="row"><label for="olorin-smtp-from-name"><?php esc_html_e( 'Nome do remetente', 'olorin' ); ?></label></th>
					<td><input id="olorin-smtp-from-name" class="regular-text" type="text" name="olorin_smtp[from_name]" value="<?php echo esc_attr( $s['from_name'] ); ?>"></td>
				</tr>
			</table>
			<?php submit_button( __( 'Salvar', 'olorin' ) ); ?>
		</form>

		<hr>
		<h2><?php esc_html_e( 'Testar envio', 'olorin' ); ?></h2>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="olorin_smtp_test">
			<?php wp_nonce_field( 'olorin_smtp_test' ); ?>
			<p>
				<input type="email" class="regular-text" name="to" value="<?php echo esc_attr( wp_get_current_user()->user_email ); ?>">
				<?php submit_button( __( 'Enviar e-mail de teste', 'olorin' ), 'secondary', 'submit', false ); ?>
			</p>
		</form>
	</div>
	<?php
}

/**
 * Captura o erro do wp_mail para mostrar no teste.
 *
 * @param WP_Error $error Erro.
 */
function olorin_capture_mail_error( $error ) {
	if ( is_wp_error( $error ) ) {
		set_transient( 'olorin_smtp_error', $error->get_error_message(), 5 * MINUTE_IN_SECONDS );
	}
}
add_action( 'wp_mail_failed', 'olorin_capture_mail_error' );

/**
 * Envia o e-mail de teste.
 */
function olorin_smtp_test() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'Sem permissão.', 'olorin' ) );
	}
	check_admin_referer( 'olorin_smtp_test' );
	delete_transient( 'olorin_smtp_error' );

	$to = isset( $_POST['to'] ) ? sanitize_email( wp_unslash( $_POST['to'] ) ) : '';
	$ok = $to && wp_mail(
		$to,
		__( 'Teste de e-mail do site — Olorin', 'olorin' ),
		__( 'Se você recebeu esta mensagem, os avisos de novos leads vão chegar normalmente.', 'olorin' )
	);

	wp_safe_redirect( admin_url( 'options-general.php?page=olorin-smtp&olorin_test=' . ( $ok ? 'ok' : 'erro' ) ) );
	exit;
}
add_action( 'admin_post_olorin_smtp_test', 'olorin_smtp_test' );

/**
 * Aviso no painel enquanto o SMTP não estiver configurado.
 */
function olorin_smtp_notice() {
	$screen = get_current_screen();
	if ( ! $screen || ! current_user_can( 'manage_options' ) || olorin_smtp_ready() ) {
		return;
	}
	if ( ! in_array( $screen->id, array( 'dashboard', 'edit-olorin_lead', 'themes' ), true ) ) {
		return;
	}
	printf(
		'<div class="notice notice-warning"><p><strong>%s</strong> %s <a href="%s">%s</a></p></div>',
		esc_html__( 'Olorin:', 'olorin' ),
		esc_html__( 'configure o e-mail (SMTP) para receber o aviso de cada novo lead. Até lá, eles ficam salvos no menu Leads.', 'olorin' ),
		esc_url( admin_url( 'options-general.php?page=olorin-smtp' ) ),
		esc_html__( 'Configurar agora', 'olorin' )
	);
}
add_action( 'admin_notices', 'olorin_smtp_notice' );
