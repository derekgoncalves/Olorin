<?php
/**
 * Leads do formulário de orçamento.
 *
 * Cada pedido é salvo no painel (menu "Leads") ANTES de enviar o e-mail,
 * então nenhum contato se perde mesmo que o e-mail falhe.
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

/**
 * Campos do lead: chave => rótulo.
 *
 * @return array<string, string>
 */
function olorin_lead_fields() {
	return array(
		'nome'         => __( 'Nome', 'olorin' ),
		'whatsapp'     => __( 'WhatsApp', 'olorin' ),
		'site'         => __( 'Site / Instagram', 'olorin' ),
		'servicos'     => __( 'Precisa de', 'olorin' ),
		'investimento' => __( 'Investimento em anúncio', 'olorin' ),
		'mensagem'     => __( 'Mensagem', 'olorin' ),
		'plano'        => __( 'Plano clicado', 'olorin' ),
		'utm_source'   => 'utm_source',
		'utm_medium'   => 'utm_medium',
		'utm_campaign' => 'utm_campaign',
		'utm_content'  => 'utm_content',
		'utm_term'     => 'utm_term',
		'gclid'        => 'gclid',
		'fbclid'       => 'fbclid',
		'pagina'       => __( 'Página de envio', 'olorin' ),
		'referencia'   => __( 'Veio de (referrer)', 'olorin' ),
		'consentimento' => __( 'Consentimento LGPD', 'olorin' ),
	);
}

/**
 * Tipo de conteúdo privado "Lead" (só administradores veem).
 */
function olorin_register_leads() {
	register_post_type(
		'olorin_lead',
		array(
			'labels'          => array(
				'name'          => __( 'Leads', 'olorin' ),
				'singular_name' => __( 'Lead', 'olorin' ),
				'menu_name'     => __( 'Leads', 'olorin' ),
				'all_items'     => __( 'Todos os leads', 'olorin' ),
				'edit_item'     => __( 'Lead', 'olorin' ),
				'search_items'  => __( 'Buscar leads', 'olorin' ),
				'not_found'     => __( 'Nenhum lead ainda. Eles aparecem aqui quando alguém envia o formulário.', 'olorin' ),
			),
			'public'          => false,
			'show_ui'         => true,
			'show_in_menu'    => true,
			'show_in_rest'    => false,
			'menu_position'   => 3,
			'menu_icon'       => 'dashicons-megaphone',
			'supports'        => array( 'title' ),
			'capability_type' => 'post',
			'capabilities'    => array(
				'create_posts'       => 'do_not_allow',
				'edit_post'          => 'manage_options',
				'read_post'          => 'manage_options',
				'delete_post'        => 'manage_options',
				'edit_posts'         => 'manage_options',
				'edit_others_posts'  => 'manage_options',
				'delete_posts'       => 'manage_options',
				'publish_posts'      => 'manage_options',
				'read_private_posts' => 'manage_options',
				'delete_private_posts'   => 'manage_options',
				'delete_published_posts' => 'manage_options',
				'delete_others_posts'    => 'manage_options',
				'edit_private_posts'     => 'manage_options',
				'edit_published_posts'   => 'manage_options',
			),
			'map_meta_cap'    => false,
			'rewrite'         => false,
			'query_var'       => false,
		)
	);
}
add_action( 'init', 'olorin_register_leads' );

/**
 * Endpoint usado pelo formulário (fetch).
 */
function olorin_register_lead_route() {
	register_rest_route(
		'olorin/v1',
		'/lead',
		array(
			'methods'             => 'POST',
			'callback'            => 'olorin_rest_lead',
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'olorin_register_lead_route' );

/**
 * Resposta do endpoint REST.
 *
 * @param WP_REST_Request $request Requisição.
 * @return WP_REST_Response
 */
function olorin_rest_lead( WP_REST_Request $request ) {
	$result = olorin_process_lead( $request->get_params() );

	if ( is_wp_error( $result ) ) {
		$data = $result->get_error_data();
		return new WP_REST_Response(
			array(
				'ok'      => false,
				'code'    => $result->get_error_code(),
				'message' => $result->get_error_message(),
				'fields'  => isset( $data['fields'] ) ? $data['fields'] : array(),
			),
			isset( $data['status'] ) ? (int) $data['status'] : 400
		);
	}

	return new WP_REST_Response(
		array(
			'ok'       => true,
			'whatsapp' => $result['whatsapp_url'],
		),
		200
	);
}

/**
 * Envio sem JavaScript (form tradicional → admin-post.php).
 */
function olorin_admin_post_lead() {
	$result   = olorin_process_lead( wp_unslash( $_POST ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- formulário público; protegido por honeypot, tempo mínimo e limite por IP.
	$referer  = wp_get_referer();
	$target   = $referer ? $referer : home_url( '/' );
	$target   = remove_query_arg( 'orcamento', strtok( $target, '#' ) );
	$redirect = add_query_arg( 'orcamento', is_wp_error( $result ) ? 'erro' : 'ok', $target ) . '#orcamento';
	wp_safe_redirect( $redirect );
	exit;
}
add_action( 'admin_post_nopriv_olorin_lead', 'olorin_admin_post_lead' );
add_action( 'admin_post_olorin_lead', 'olorin_admin_post_lead' );

/**
 * Valida, salva e notifica um lead.
 *
 * @param array $raw Dados recebidos.
 * @return array|WP_Error
 */
function olorin_process_lead( $raw ) {
	$raw = is_array( $raw ) ? $raw : array();

	// 1) Anti-spam: campo isca preenchido = robô. Respondemos "ok" para não ensinar o robô.
	if ( ! empty( $raw['empresa_url'] ) ) {
		return array( 'whatsapp_url' => olorin_whatsapp_url() );
	}

	// 2) Tempo mínimo entre carregar a página e enviar.
	$ts      = isset( $raw['olorin_ts'] ) ? (int) $raw['olorin_ts'] : 0;
	$elapsed = isset( $raw['olorin_tempo'] ) && '' !== $raw['olorin_tempo'] ? (int) $raw['olorin_tempo'] : null;
	if ( ( null !== $elapsed && $elapsed < 3 ) || ( null === $elapsed && $ts > 0 && ( time() - $ts ) < 3 ) ) {
		return new WP_Error( 'olorin_too_fast', __( 'Envio rápido demais. Tente de novo em alguns segundos.', 'olorin' ), array( 'status' => 429 ) );
	}

	// 3) Limite de 6 envios a cada 10 minutos por IP.
	$ip_hash = 'olorin_rl_' . md5( olorin_client_ip() . wp_salt( 'nonce' ) );
	$count   = (int) get_transient( $ip_hash );
	if ( $count >= 6 ) {
		return new WP_Error( 'olorin_rate_limited', __( 'Muitos envios seguidos. Chame a gente no WhatsApp.', 'olorin' ), array( 'status' => 429 ) );
	}
	set_transient( $ip_hash, $count + 1, 10 * MINUTE_IN_SECONDS );

	// 4) Limpeza e validação.
	$text = static function ( $key, $max = 200 ) use ( $raw ) {
		$value = isset( $raw[ $key ] ) && is_scalar( $raw[ $key ] ) ? sanitize_text_field( (string) $raw[ $key ] ) : '';
		return function_exists( 'mb_substr' ) ? mb_substr( $value, 0, $max ) : substr( $value, 0, $max );
	};

	$lead = array(
		'nome'          => $text( 'nome', 80 ),
		'whatsapp'      => $text( 'whatsapp', 20 ),
		'site'          => $text( 'site', 120 ),
		'servicos'      => '',
		'investimento'  => $text( 'investimento', 80 ),
		'mensagem'      => isset( $raw['mensagem'] ) && is_scalar( $raw['mensagem'] ) ? sanitize_textarea_field( (string) $raw['mensagem'] ) : '',
		'plano'         => $text( 'plano', 40 ),
		'utm_source'    => $text( 'utm_source', 120 ),
		'utm_medium'    => $text( 'utm_medium', 120 ),
		'utm_campaign'  => $text( 'utm_campaign', 160 ),
		'utm_content'   => $text( 'utm_content', 160 ),
		'utm_term'      => $text( 'utm_term', 160 ),
		'gclid'         => $text( 'gclid', 255 ),
		'fbclid'        => $text( 'fbclid', 255 ),
		'pagina'        => esc_url_raw( $text( 'pagina', 500 ) ),
		'referencia'    => esc_url_raw( $text( 'referencia', 500 ) ),
		'consentimento' => ! empty( $raw['consentimento'] ) ? wp_date( 'd/m/Y H:i' ) : '',
	);
	$lead['mensagem'] = function_exists( 'mb_substr' ) ? mb_substr( $lead['mensagem'], 0, 1500 ) : substr( $lead['mensagem'], 0, 1500 );

	$allowed_services = olorin_lines( olorin_opt( 'form_servicos' ) );
	if ( isset( $raw['servicos'] ) ) {
		$services         = array_map( 'sanitize_text_field', (array) $raw['servicos'] );
		$services         = array_values( array_intersect( $services, $allowed_services ) );
		$lead['servicos'] = implode( ', ', $services );
	}

	$errors = array();
	if ( '' === $lead['nome'] || strlen( $lead['nome'] ) < 2 ) {
		$errors['nome'] = __( 'Conta pra gente seu nome.', 'olorin' );
	}
	$phone_digits = preg_replace( '/\D+/', '', $lead['whatsapp'] );
	if ( strlen( $phone_digits ) < 10 || strlen( $phone_digits ) > 13 ) {
		$errors['whatsapp'] = __( 'Confira o WhatsApp com DDD.', 'olorin' );
	}
	if ( '' === $lead['consentimento'] ) {
		$errors['consentimento'] = __( 'Precisamos do seu ok para entrar em contato.', 'olorin' );
	}
	if ( $errors ) {
		return new WP_Error(
			'olorin_invalid',
			__( 'Confira os campos destacados.', 'olorin' ),
			array(
				'status' => 422,
				'fields' => $errors,
			)
		);
	}

	// 5) Salva no painel.
	$post_id = wp_insert_post(
		array(
			'post_type'   => 'olorin_lead',
			'post_status' => 'publish',
			'post_title'  => sprintf( '%s — %s', $lead['nome'], $lead['whatsapp'] ),
		),
		true
	);
	if ( is_wp_error( $post_id ) ) {
		return new WP_Error( 'olorin_save_failed', __( 'Não conseguimos registrar agora. Chame no WhatsApp.', 'olorin' ), array( 'status' => 500 ) );
	}
	foreach ( $lead as $key => $value ) {
		update_post_meta( $post_id, '_olorin_' . $key, $value );
	}

	// 6) Notifica por e-mail (falha de e-mail não perde o lead).
	$sent = olorin_send_lead_email( $lead, $post_id );
	update_post_meta( $post_id, '_olorin_email_enviado', $sent ? 'sim' : 'falhou' );

	/**
	 * Gancho para integrações (CRM, planilha, etc.).
	 *
	 * @param array $lead    Dados.
	 * @param int   $post_id ID do lead.
	 */
	do_action( 'olorin_lead_received', $lead, $post_id );

	$follow = sprintf(
		/* translators: 1: nome, 2: serviços */
		__( 'Oi! Sou %1$s, acabei de pedir um orçamento pelo site. %2$s', 'olorin' ),
		$lead['nome'],
		$lead['servicos'] ? sprintf( __( 'Tenho interesse em: %s.', 'olorin' ), $lead['servicos'] ) : ''
	);

	return array(
		'post_id'      => $post_id,
		'whatsapp_url' => olorin_whatsapp_url( trim( $follow ) ),
	);
}

/**
 * IP do visitante (só para limitar envios; não é salvo).
 *
 * @return string
 */
function olorin_client_ip() {
	$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	return (string) filter_var( $ip, FILTER_VALIDATE_IP );
}

/**
 * E-mail de aviso de novo lead.
 *
 * @param array $lead    Dados.
 * @param int   $post_id ID.
 * @return bool
 */
function olorin_send_lead_email( $lead, $post_id ) {
	$to = sanitize_email( olorin_opt( 'form_email' ) );
	if ( ! $to ) {
		$to = get_option( 'admin_email' );
	}

	$fields = olorin_lead_fields();
	$lines  = array();
	foreach ( $lead as $key => $value ) {
		if ( '' === $value || ! isset( $fields[ $key ] ) ) {
			continue;
		}
		$lines[] = $fields[ $key ] . ': ' . $value;
	}

	$digits = preg_replace( '/\D+/', '', $lead['whatsapp'] );
	if ( strlen( $digits ) <= 11 ) {
		$digits = '55' . $digits;
	}
	$lines[] = '';
	$lines[] = __( 'Responder no WhatsApp:', 'olorin' ) . ' https://wa.me/' . $digits;
	$lines[] = __( 'Ver no painel:', 'olorin' ) . ' ' . admin_url( 'post.php?post=' . (int) $post_id . '&action=edit' );

	$subject = sprintf(
		/* translators: %s: nome */
		__( '[Site] Novo pedido de orçamento — %s', 'olorin' ),
		$lead['nome']
	);

	return (bool) wp_mail( $to, $subject, implode( "\n", $lines ) );
}

/**
 * Colunas da lista de leads.
 *
 * @param array $columns Colunas.
 * @return array
 */
function olorin_lead_columns( $columns ) {
	return array(
		'cb'                  => $columns['cb'],
		'title'               => __( 'Lead', 'olorin' ),
		'olorin_servicos'     => __( 'Precisa de', 'olorin' ),
		'olorin_investimento' => __( 'Investe', 'olorin' ),
		'olorin_origem'       => __( 'Origem', 'olorin' ),
		'olorin_email'        => __( 'E-mail', 'olorin' ),
		'date'                => __( 'Data', 'olorin' ),
	);
}
add_filter( 'manage_olorin_lead_posts_columns', 'olorin_lead_columns' );

/**
 * Conteúdo das colunas.
 *
 * @param string $column  Coluna.
 * @param int    $post_id ID.
 */
function olorin_lead_column_content( $column, $post_id ) {
	switch ( $column ) {
		case 'olorin_servicos':
			echo esc_html( get_post_meta( $post_id, '_olorin_servicos', true ) );
			$plano = get_post_meta( $post_id, '_olorin_plano', true );
			if ( $plano ) {
				echo '<br><small>' . esc_html__( 'Plano:', 'olorin' ) . ' ' . esc_html( $plano ) . '</small>';
			}
			break;
		case 'olorin_investimento':
			echo esc_html( get_post_meta( $post_id, '_olorin_investimento', true ) );
			break;
		case 'olorin_origem':
			$parts = array_filter(
				array(
					get_post_meta( $post_id, '_olorin_utm_source', true ),
					get_post_meta( $post_id, '_olorin_utm_medium', true ),
					get_post_meta( $post_id, '_olorin_utm_campaign', true ),
				)
			);
			if ( ! $parts ) {
				$parts[] = get_post_meta( $post_id, '_olorin_gclid', true ) ? 'google ads (gclid)' : '';
				$parts[] = get_post_meta( $post_id, '_olorin_fbclid', true ) ? 'meta (fbclid)' : '';
				$parts   = array_filter( $parts );
			}
			echo esc_html( $parts ? implode( ' / ', $parts ) : __( 'direto / orgânico', 'olorin' ) );
			break;
		case 'olorin_email':
			$status = get_post_meta( $post_id, '_olorin_email_enviado', true );
			echo 'sim' === $status ? '✓' : '<span style="color:#b32d2e">' . esc_html__( 'falhou — configure o SMTP', 'olorin' ) . '</span>';
			break;
	}
}
add_action( 'manage_olorin_lead_posts_custom_column', 'olorin_lead_column_content', 10, 2 );

/**
 * Tela do lead: mostra os dados (somente leitura) e um atalho para o WhatsApp.
 */
function olorin_lead_metabox() {
	add_meta_box(
		'olorin_lead_data',
		__( 'Dados do pedido', 'olorin' ),
		static function ( $post ) {
			$whatsapp = get_post_meta( $post->ID, '_olorin_whatsapp', true );
			$digits   = preg_replace( '/\D+/', '', (string) $whatsapp );
			if ( strlen( $digits ) <= 11 ) {
				$digits = '55' . $digits;
			}
			echo '<table class="widefat striped"><tbody>';
			foreach ( olorin_lead_fields() as $key => $label ) {
				$value = get_post_meta( $post->ID, '_olorin_' . $key, true );
				if ( '' === $value ) {
					continue;
				}
				printf( '<tr><th style="width:220px">%s</th><td>%s</td></tr>', esc_html( $label ), nl2br( esc_html( $value ) ) );
			}
			echo '</tbody></table>';
			printf(
				'<p><a class="button button-primary" href="%s" target="_blank" rel="noopener">%s</a></p>',
				esc_url( 'https://wa.me/' . $digits ),
				esc_html__( 'Responder no WhatsApp', 'olorin' )
			);
		},
		'olorin_lead',
		'normal',
		'high'
	);
}
add_action( 'add_meta_boxes_olorin_lead', 'olorin_lead_metabox' );

/**
 * Botão "Exportar CSV" na lista de leads.
 *
 * @param string $which Posição.
 */
function olorin_lead_export_button( $which ) {
	$screen = get_current_screen();
	if ( 'top' !== $which || ! $screen || 'edit-olorin_lead' !== $screen->id ) {
		return;
	}
	printf(
		'<div class="alignleft actions"><a class="button" href="%s">%s</a></div>',
		esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=olorin_export_leads' ), 'olorin_export_leads' ) ),
		esc_html__( 'Exportar CSV (Excel/Planilhas)', 'olorin' )
	);
}
add_action( 'manage_posts_extra_tablenav', 'olorin_lead_export_button' );

/**
 * Gera o CSV.
 */
function olorin_export_leads() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'Sem permissão.', 'olorin' ) );
	}
	check_admin_referer( 'olorin_export_leads' );

	$leads = get_posts(
		array(
			'post_type'      => 'olorin_lead',
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'orderby'        => 'date',
			'order'          => 'DESC',
		)
	);

	nocache_headers();
	header( 'Content-Type: text/csv; charset=utf-8' );
	header( 'Content-Disposition: attachment; filename=leads-olorin-' . wp_date( 'Y-m-d' ) . '.csv' );

	$out    = fopen( 'php://output', 'w' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen
	$fields = olorin_lead_fields();
	fwrite( $out, "\xEF\xBB\xBF" ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fwrite -- BOM para o Excel abrir acentos.
	fputcsv( $out, array_merge( array( __( 'Data', 'olorin' ) ), array_values( $fields ) ), ';' );
	foreach ( $leads as $lead ) {
		$row = array( get_the_date( 'd/m/Y H:i', $lead ) );
		foreach ( array_keys( $fields ) as $key ) {
			$value = (string) get_post_meta( $lead->ID, '_olorin_' . $key, true );
			// Evita fórmulas maliciosas ao abrir no Excel.
			if ( '' !== $value && in_array( $value[0], array( '=', '+', '-', '@' ), true ) ) {
				$value = "'" . $value;
			}
			$row[] = $value;
		}
		fputcsv( $out, $row, ';' );
	}
	fclose( $out ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
	exit;
}
add_action( 'admin_post_olorin_export_leads', 'olorin_export_leads' );

/**
 * Contador de leads novos (últimos 7 dias) no menu.
 */
function olorin_lead_menu_badge() {
	global $menu;
	if ( ! current_user_can( 'manage_options' ) || ! is_array( $menu ) ) {
		return;
	}
	$recent = get_posts(
		array(
			'post_type'      => 'olorin_lead',
			'post_status'    => 'publish',
			'date_query'     => array( array( 'after' => '7 days ago' ) ),
			'fields'         => 'ids',
			'posts_per_page' => 99,
			'no_found_rows'  => true,
		)
	);
	if ( ! $recent ) {
		return;
	}
	foreach ( $menu as $index => $item ) {
		if ( isset( $item[2] ) && 'edit.php?post_type=olorin_lead' === $item[2] ) {
			$menu[ $index ][0] .= ' <span class="awaiting-mod"><span class="pending-count">' . count( $recent ) . '</span></span>'; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		}
	}
}
add_action( 'admin_menu', 'olorin_lead_menu_badge', 99 );
