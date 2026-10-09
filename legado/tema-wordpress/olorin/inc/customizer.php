<?php
/**
 * Aparência → Personalizar → "Olorin".
 *
 * Aqui ficam as informações que aparecem em vários lugares do site
 * (WhatsApp, e-mail, redes, rodapé, formulário, SEO e rastreamento).
 * Os textos das seções da página inicial são editados direto na página
 * (Páginas → Início), no editor de blocos.
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registra painel, seções e campos.
 *
 * @param WP_Customize_Manager $wp_customize Gerenciador.
 */
function olorin_customize_register( $wp_customize ) {
	$wp_customize->add_panel(
		'olorin',
		array(
			'title'       => __( 'Olorin — configurações do site', 'olorin' ),
			'description' => __( 'Contato, rodapé, formulário, SEO e rastreamento. Os textos das seções são editados na própria página (Páginas → Início).', 'olorin' ),
			'priority'    => 1,
		)
	);

	$sections = array(
		'olorin_contato'     => array(
			'title'  => __( 'Contato e WhatsApp', 'olorin' ),
			'fields' => array(
				'whatsapp'         => array( 'label' => __( 'Número do WhatsApp (com DDD)', 'olorin' ), 'type' => 'text', 'description' => __( 'Só números, ex.: 41999998888. Todos os botões de WhatsApp do site usam este número.', 'olorin' ) ),
				'whatsapp_msg'     => array( 'label' => __( 'Mensagem padrão do WhatsApp', 'olorin' ), 'type' => 'textarea' ),
				'telefone'         => array( 'label' => __( 'Telefone como aparece no site', 'olorin' ), 'type' => 'text', 'description' => __( 'Ex.: (41) 99999-8888. No editor, use [olorin_telefone] para exibir.', 'olorin' ) ),
				'email'            => array( 'label' => __( 'E-mail de contato (público)', 'olorin' ), 'type' => 'email' ),
				'instagram'        => array( 'label' => __( 'Link do Instagram', 'olorin' ), 'type' => 'url' ),
				'instagram_handle' => array( 'label' => __( '@ do Instagram', 'olorin' ), 'type' => 'text' ),
				'linkedin'         => array( 'label' => __( 'Link do LinkedIn (opcional)', 'olorin' ), 'type' => 'url' ),
				'cidade'           => array( 'label' => __( 'Cidade, UF', 'olorin' ), 'type' => 'text' ),
				'cnpj'             => array( 'label' => __( 'CNPJ (opcional, aparece no rodapé)', 'olorin' ), 'type' => 'text' ),
			),
		),
		'olorin_cabecalho'   => array(
			'title'       => __( 'Topo do site', 'olorin' ),
			'description' => __( 'Os links do menu são editados em Aparência → Menus (menu "Menu principal").', 'olorin' ),
			'fields'      => array(
				'header_wa'  => array( 'label' => __( 'Texto do botão de WhatsApp', 'olorin' ), 'type' => 'text' ),
				'header_cta' => array( 'label' => __( 'Texto do botão de orçamento', 'olorin' ), 'type' => 'text' ),
			),
		),
		'olorin_rodape'      => array(
			'title'  => __( 'Rodapé', 'olorin' ),
			'fields' => array(
				'footer_frase'    => array( 'label' => __( 'Frase do rodapé', 'olorin' ), 'type' => 'text' ),
				'footer_servicos' => array( 'label' => __( 'Lista de serviços (um por linha)', 'olorin' ), 'type' => 'textarea' ),
				'footer_copy'     => array( 'label' => __( 'Texto de direitos', 'olorin' ), 'type' => 'text', 'description' => __( '{ano} vira o ano atual automaticamente.', 'olorin' ) ),
			),
		),
		'olorin_formulario'  => array(
			'title'       => __( 'Formulário de orçamento', 'olorin' ),
			'description' => __( 'Os pedidos ficam em Leads (menu lateral) e chegam por e-mail — configure o envio em Configurações → E-mail (SMTP).', 'olorin' ),
			'fields'      => array(
				'form_email'          => array( 'label' => __( 'E-mail que recebe os pedidos', 'olorin' ), 'type' => 'email', 'description' => __( 'Vazio = e-mail do administrador do WordPress.', 'olorin' ) ),
				'form_barra'          => array( 'label' => __( 'Título da janela do formulário', 'olorin' ), 'type' => 'text' ),
				'form_servicos'       => array( 'label' => __( 'Opções de "O que você precisa" (uma por linha)', 'olorin' ), 'type' => 'textarea' ),
				'form_investimento'   => array( 'label' => __( 'Faixas de investimento (uma por linha)', 'olorin' ), 'type' => 'textarea' ),
				'form_botao'          => array( 'label' => __( 'Texto do botão de envio', 'olorin' ), 'type' => 'text' ),
				'form_nota'           => array( 'label' => __( 'Nota abaixo do botão', 'olorin' ), 'type' => 'text' ),
				'form_sucesso_titulo' => array( 'label' => __( 'Título após o envio', 'olorin' ), 'type' => 'text' ),
				'form_sucesso_texto'  => array( 'label' => __( 'Mensagem após o envio', 'olorin' ), 'type' => 'textarea' ),
			),
		),
		'olorin_seo'         => array(
			'title'       => __( 'SEO e compartilhamento', 'olorin' ),
			'description' => __( 'Como o site aparece no Google e quando o link é compartilhado no WhatsApp/redes. Se você instalar um plugin de SEO (Yoast, Rank Math), ele assume esta parte.', 'olorin' ),
			'fields'      => array(
				'seo_titulo'    => array( 'label' => __( 'Título da página inicial (até ~60 caracteres ideais)', 'olorin' ), 'type' => 'text' ),
				'seo_descricao' => array( 'label' => __( 'Descrição (até ~155 caracteres)', 'olorin' ), 'type' => 'textarea' ),
				'seo_imagem'    => array( 'label' => __( 'Imagem de compartilhamento (1200×630)', 'olorin' ), 'type' => 'image' ),
			),
		),
		'olorin_rastreamento' => array(
			'title'       => __( 'Rastreamento e cookies', 'olorin' ),
			'description' => __( 'Ao preencher qualquer ID, o banner de cookies (LGPD) passa a aparecer. Os eventos de clique no WhatsApp e envio do formulário vão para o dataLayer.', 'olorin' ),
			'fields'      => array(
				'gtm_id'        => array( 'label' => __( 'Google Tag Manager (GTM-XXXXXXX)', 'olorin' ), 'type' => 'text' ),
				'ga4_id'        => array( 'label' => __( 'Google Analytics 4 (G-XXXXXXXXXX) — só se não usar o GTM', 'olorin' ), 'type' => 'text' ),
				'pixel_id'      => array( 'label' => __( 'Meta Pixel (só números)', 'olorin' ), 'type' => 'text' ),
				'cookies_texto' => array( 'label' => __( 'Texto do aviso de cookies', 'olorin' ), 'type' => 'textarea' ),
			),
		),
		'olorin_efeitos'     => array(
			'title'  => __( 'Efeitos e botões flutuantes', 'olorin' ),
			'fields' => array(
				'cursor'       => array( 'label' => __( 'Cursor de estrela (computador)', 'olorin' ), 'type' => 'checkbox' ),
				'wa_flutuante' => array( 'label' => __( 'Botão flutuante de WhatsApp (computador)', 'olorin' ), 'type' => 'checkbox' ),
				'barra_mobile' => array( 'label' => __( 'Barra fixa WhatsApp/Orçamento (celular)', 'olorin' ), 'type' => 'checkbox' ),
			),
		),
	);

	$defaults = olorin_defaults();
	$priority = 10;

	foreach ( $sections as $section_id => $section ) {
		$wp_customize->add_section(
			$section_id,
			array(
				'title'       => $section['title'],
				'panel'       => 'olorin',
				'priority'    => $priority,
				'description' => isset( $section['description'] ) ? $section['description'] : '',
			)
		);
		$priority += 10;

		foreach ( $section['fields'] as $key => $field ) {
			$setting_id = 'olorin_' . $key;
			$type       = $field['type'];

			switch ( $type ) {
				case 'checkbox':
					$sanitize = 'olorin_sanitize_checkbox';
					break;
				case 'email':
					$sanitize = 'sanitize_email';
					break;
				case 'url':
				case 'image':
					$sanitize = 'esc_url_raw';
					break;
				case 'textarea':
					$sanitize = 'sanitize_textarea_field';
					break;
				default:
					$sanitize = 'sanitize_text_field';
			}

			$wp_customize->add_setting(
				$setting_id,
				array(
					'default'           => isset( $defaults[ $key ] ) ? $defaults[ $key ] : '',
					'type'              => 'theme_mod',
					'capability'        => 'edit_theme_options',
					'sanitize_callback' => $sanitize,
					'transport'         => 'refresh',
				)
			);

			$args = array(
				'label'       => $field['label'],
				'section'     => $section_id,
				'description' => isset( $field['description'] ) ? $field['description'] : '',
			);

			if ( 'image' === $type ) {
				$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, $setting_id, $args ) );
			} else {
				$args['type'] = $type;
				$wp_customize->add_control( $setting_id, $args );
			}
		}
	}
}
add_action( 'customize_register', 'olorin_customize_register' );

/**
 * Sanitiza checkbox.
 *
 * @param mixed $value Valor.
 * @return bool
 */
function olorin_sanitize_checkbox( $value ) {
	return (bool) $value;
}

/**
 * O tema não usa widgets: desliga o painel de widgets do Personalizar
 * (evita um aviso do WordPress em temas sem áreas de widget).
 *
 * @param string[] $components Componentes.
 * @return string[]
 */
function olorin_customize_components( $components ) {
	return array_values( array_diff( $components, array( 'widgets' ) ) );
}
add_filter( 'customize_loaded_components', 'olorin_customize_components' );
