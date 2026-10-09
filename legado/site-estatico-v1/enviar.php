<?php
/**
 * Recebe o formulário de orçamento da versão estática do site Olorin.
 *
 *  1. Confere anti-spam (campo isca, tempo mínimo e limite por IP)
 *  2. Salva o pedido em leads/pedidos.csv (pasta bloqueada para visitantes)
 *  3. Envia o aviso por e-mail via SMTP autenticado (exigência da Locaweb)
 *  4. Responde em JSON (envio pelo site) ou redireciona (navegador sem JavaScript)
 *
 * Configure em config.php. Requer PHP 7.4 ou superior.
 */

date_default_timezone_set( 'America/Sao_Paulo' );

$cfg  = require __DIR__ . '/config.php';
$ajax = isset( $_SERVER['HTTP_ACCEPT'] ) && false !== strpos( $_SERVER['HTTP_ACCEPT'], 'application/json' );

if ( 'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
	http_response_code( 405 );
	header( 'Allow: POST' );
	exit( 'Método não permitido.' );
}

/**
 * Responde e encerra.
 */
function olorin_respond( $ok, $status = 200, $extra = array() ) {
	global $ajax;
	if ( $ajax ) {
		http_response_code( $status );
		header( 'Content-Type: application/json; charset=utf-8' );
		header( 'Cache-Control: no-store' );
		echo json_encode( array_merge( array( 'ok' => $ok ), $extra ), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
		exit;
	}
	$back = isset( $_SERVER['HTTP_REFERER'] ) ? strtok( $_SERVER['HTTP_REFERER'], '?#' ) : './';
	if ( ! preg_match( '#^https?://' . preg_quote( $_SERVER['HTTP_HOST'] ?? '', '#' ) . '/#', $back ) ) {
		$back = './';
	}
	header( 'Location: ' . $back . '?orcamento=' . ( $ok ? 'ok' : 'erro' ) . '#orcamento', true, 303 );
	exit;
}

function olorin_field( $key, $max = 200 ) {
	$value = isset( $_POST[ $key ] ) && is_scalar( $_POST[ $key ] ) ? (string) $_POST[ $key ] : '';
	$value = trim( preg_replace( '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', strip_tags( $value ) ) );
	return function_exists( 'mb_substr' ) ? mb_substr( $value, 0, $max ) : substr( $value, 0, $max );
}

function olorin_wa_url( $number, $message ) {
	return 'https://wa.me/' . preg_replace( '/\D+/', '', $number ) . '?text=' . rawurlencode( $message );
}

// 1) Anti-spam.
if ( ! empty( $_POST['empresa_url'] ) ) {
	olorin_respond( true, 200, array( 'whatsapp' => olorin_wa_url( $cfg['whatsapp'], 'Oi!' ) ) );
}
if ( isset( $_POST['olorin_tempo'] ) && '' !== $_POST['olorin_tempo'] && (int) $_POST['olorin_tempo'] < 3 ) {
	olorin_respond( false, 429, array( 'message' => 'Envio rápido demais. Tente de novo em alguns segundos.' ) );
}
$ip      = isset( $_SERVER['REMOTE_ADDR'] ) ? $_SERVER['REMOTE_ADDR'] : '';
$rl_file = sys_get_temp_dir() . '/olorin_rl_' . md5( $ip . __DIR__ );
$hits    = is_readable( $rl_file ) ? array_filter( array_map( 'intval', explode( ',', (string) file_get_contents( $rl_file ) ) ) ) : array();
$hits    = array_filter( $hits, static function ( $t ) { return $t > time() - 600; } );
if ( count( $hits ) >= 6 ) {
	olorin_respond( false, 429, array( 'message' => 'Muitos envios seguidos. Chame a gente no WhatsApp.' ) );
}
$hits[] = time();
@file_put_contents( $rl_file, implode( ',', $hits ) );

// 2) Dados.
$lead = array(
	'data'          => date( 'd/m/Y H:i' ),
	'nome'          => olorin_field( 'nome', 80 ),
	'whatsapp'      => olorin_field( 'whatsapp', 20 ),
	'site'          => olorin_field( 'site', 120 ),
	'servicos'      => '',
	'investimento'  => olorin_field( 'investimento', 80 ),
	'mensagem'      => olorin_field( 'mensagem', 1500 ),
	'plano'         => olorin_field( 'plano', 40 ),
	'utm_source'    => olorin_field( 'utm_source', 120 ),
	'utm_medium'    => olorin_field( 'utm_medium', 120 ),
	'utm_campaign'  => olorin_field( 'utm_campaign', 160 ),
	'utm_content'   => olorin_field( 'utm_content', 160 ),
	'utm_term'      => olorin_field( 'utm_term', 160 ),
	'gclid'         => olorin_field( 'gclid', 255 ),
	'fbclid'        => olorin_field( 'fbclid', 255 ),
	'pagina'        => olorin_field( 'pagina', 500 ),
	'referencia'    => olorin_field( 'referencia', 500 ),
	'consentimento' => ! empty( $_POST['consentimento'] ) ? date( 'd/m/Y H:i' ) : '',
);
if ( isset( $_POST['servicos'] ) && is_array( $_POST['servicos'] ) ) {
	$lead['servicos'] = implode( ', ', array_values( array_intersect( array_map( 'strval', $_POST['servicos'] ), $cfg['servicos'] ) ) );
}

$errors = array();
if ( strlen( $lead['nome'] ) < 2 ) {
	$errors['nome'] = 'Conta pra gente seu nome.';
}
$digits = preg_replace( '/\D+/', '', $lead['whatsapp'] );
if ( strlen( $digits ) < 10 || strlen( $digits ) > 13 ) {
	$errors['whatsapp'] = 'Confira o WhatsApp com DDD.';
}
if ( '' === $lead['consentimento'] ) {
	$errors['consentimento'] = 'Precisamos do seu ok para entrar em contato.';
}
if ( $errors ) {
	olorin_respond( false, 422, array( 'message' => 'Confira os campos destacados.', 'fields' => $errors ) );
}

// 3) Salva no CSV (abre no Excel/Planilhas Google).
$csv     = __DIR__ . '/leads/pedidos.csv';
$is_new  = ! file_exists( $csv );
$handle  = @fopen( $csv, 'a' );
$saved   = false;
if ( $handle ) {
	flock( $handle, LOCK_EX );
	if ( $is_new ) {
		fwrite( $handle, "\xEF\xBB\xBF" );
		fputcsv( $handle, array_keys( $lead ), ';' );
	}
	$row = array_map(
		static function ( $v ) {
			return ( '' !== $v && in_array( $v[0], array( '=', '+', '-', '@' ), true ) ) ? "'" . $v : $v;
		},
		array_values( $lead )
	);
	$saved = false !== fputcsv( $handle, $row, ';' );
	flock( $handle, LOCK_UN );
	fclose( $handle );
}

// 4) E-mail.
$labels = array(
	'nome' => 'Nome', 'whatsapp' => 'WhatsApp', 'site' => 'Site / Instagram', 'servicos' => 'Precisa de',
	'investimento' => 'Investimento em anúncio', 'mensagem' => 'Mensagem', 'plano' => 'Plano clicado',
	'utm_source' => 'utm_source', 'utm_medium' => 'utm_medium', 'utm_campaign' => 'utm_campaign',
	'utm_content' => 'utm_content', 'utm_term' => 'utm_term', 'gclid' => 'gclid', 'fbclid' => 'fbclid',
	'pagina' => 'Página de envio', 'referencia' => 'Veio de', 'consentimento' => 'Consentimento LGPD',
);
$body = '';
foreach ( $labels as $key => $label ) {
	if ( '' !== $lead[ $key ] ) {
		$body .= $label . ': ' . $lead[ $key ] . "\n";
	}
}
$reply = strlen( $digits ) <= 11 ? '55' . $digits : $digits;
$body .= "\nResponder no WhatsApp: https://wa.me/" . $reply . "\n";

$mail_error = '';
$sent       = olorin_send_mail( $cfg, $cfg['email_destino'], '[Site] Novo pedido de orçamento — ' . $lead['nome'], $body, $mail_error );

if ( ! $saved && ! $sent ) {
	error_log( 'Olorin: pedido não salvo nem enviado. ' . $mail_error );
	olorin_respond( false, 500, array( 'message' => 'Não conseguimos registrar agora.' ) );
}

$follow = 'Oi! Sou ' . $lead['nome'] . ', acabei de pedir um orçamento pelo site.' . ( $lead['servicos'] ? ' Tenho interesse em: ' . $lead['servicos'] . '.' : '' );
olorin_respond( true, 200, array( 'whatsapp' => olorin_wa_url( $cfg['whatsapp'], $follow ) ) );

/**
 * Envia e-mail: SMTP autenticado se configurado; senão tenta mail() do PHP.
 */
function olorin_send_mail( $cfg, $to, $subject, $body, &$error ) {
	if ( empty( $cfg['smtp_usuario'] ) || empty( $cfg['smtp_senha'] ) ) {
		$from    = 'no-reply@' . preg_replace( '/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'localhost' );
		$headers = 'From: ' . $from . "\nContent-Type: text/plain; charset=UTF-8";
		$ok      = function_exists( 'mail' ) && @mail( $to, '=?UTF-8?B?' . base64_encode( $subject ) . '?=', $body, $headers, '-r' . $from );
		$error   = $ok ? '' : 'mail() indisponível — configure o SMTP em config.php';
		return $ok;
	}
	return olorin_smtp( $cfg, $to, $subject, $body, $error );
}

/**
 * Cliente SMTP mínimo (SSL na 465 ou STARTTLS na 587) com AUTH LOGIN.
 */
function olorin_smtp( $cfg, $to, $subject, $body, &$error ) {
	$secure = strtolower( (string) $cfg['smtp_seguranca'] );
	$remote = ( 'ssl' === $secure ? 'ssl://' : 'tcp://' ) . $cfg['smtp_host'] . ':' . (int) $cfg['smtp_porta'];
	$ctx    = stream_context_create( array( 'ssl' => array( 'verify_peer' => true, 'verify_peer_name' => true, 'SNI_enabled' => true ) ) );
	$fp     = @stream_socket_client( $remote, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $ctx );
	if ( ! $fp ) {
		$error = 'Conexão SMTP falhou: ' . $errstr;
		return false;
	}
	stream_set_timeout( $fp, 15 );

	$talk = static function ( $command, $expect ) use ( $fp, &$error ) {
		if ( null !== $command ) {
			fwrite( $fp, $command . "\r\n" );
		}
		$reply = '';
		while ( false !== ( $line = fgets( $fp, 1024 ) ) ) {
			$reply .= $line;
			if ( strlen( $line ) < 4 || ' ' === $line[3] ) {
				break;
			}
		}
		if ( ! in_array( (int) substr( $reply, 0, 3 ), (array) $expect, true ) ) {
			$error = trim( $reply ) ? trim( $reply ) : 'sem resposta do servidor';
			return false;
		}
		return true;
	};

	$host = preg_replace( '/[^a-z0-9.-]/i', '', $_SERVER['HTTP_HOST'] ?? 'localhost' );
	$from = $cfg['smtp_usuario'];
	$ok   = $talk( null, 220 ) && $talk( 'EHLO ' . $host, 250 );
	if ( $ok && 'tls' === $secure ) {
		$ok = $talk( 'STARTTLS', 220 )
			&& stream_socket_enable_crypto( $fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT )
			&& $talk( 'EHLO ' . $host, 250 );
	}
	$ok = $ok
		&& $talk( 'AUTH LOGIN', 334 )
		&& $talk( base64_encode( $cfg['smtp_usuario'] ), 334 )
		&& $talk( base64_encode( $cfg['smtp_senha'] ), 235 )
		&& $talk( 'MAIL FROM:<' . $from . '>', 250 )
		&& $talk( 'RCPT TO:<' . $to . '>', array( 250, 251 ) )
		&& $talk( 'DATA', 354 );

	if ( $ok ) {
		$enc     = static function ( $text ) { return '=?UTF-8?B?' . base64_encode( $text ) . '?='; };
		$message = 'Date: ' . date( 'r' ) . "\r\n"
			. 'From: ' . $enc( $cfg['remetente_nome'] ) . ' <' . $from . ">\r\n"
			. 'To: <' . $to . ">\r\n"
			. 'Subject: ' . $enc( $subject ) . "\r\n"
			. 'Message-ID: <' . bin2hex( random_bytes( 8 ) ) . '@' . $host . ">\r\n"
			. "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
			. chunk_split( base64_encode( $body ) );
		fwrite( $fp, $message . "\r\n.\r\n" );
		$ok = $talk( null, 250 );
	}
	@fwrite( $fp, "QUIT\r\n" );
	fclose( $fp );
	return $ok;
}
