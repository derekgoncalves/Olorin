<?php
/**
 * Funções utilitárias usadas no tema inteiro.
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

/**
 * Valores padrão de todas as opções editáveis em Aparência → Personalizar → Olorin.
 * Se a opção nunca foi salva, o site usa o valor daqui.
 *
 * @return array<string, mixed>
 */
function olorin_defaults() {
	static $defaults = null;
	if ( null !== $defaults ) {
		return $defaults;
	}

	$defaults = array(
		// Contato.
		'whatsapp'            => '5541900000000',
		'whatsapp_msg'        => 'Oi! Vim pelo site da Olorin e quero um orçamento.',
		'telefone'            => '(41) 90000-0000',
		'email'               => 'oi@olorindigital.com.br',
		'instagram'           => 'https://instagram.com/olorin_digital',
		'instagram_handle'    => '@olorin_digital',
		'linkedin'            => '',
		'cidade'              => 'Curitiba, PR',
		'cnpj'                => '',

		// Cabeçalho.
		'header_cta'          => 'Pedir orçamento',
		'header_wa'           => 'Falar no WhatsApp',

		// Rodapé.
		'footer_frase'        => 'Não é sobre aparecer. É sobre vender.',
		'footer_servicos'     => "Tráfego pago\nRedes sociais\nIdentidade visual\nMaterial impresso\nSite e loja virtual\nRastreamento e relatório",
		'footer_copy'         => 'olorin_digital © {ano} · Curitiba, PR',

		// Formulário de orçamento.
		'form_email'          => '',
		'form_barra'          => 'orcamento.exe',
		'form_servicos'       => "Tráfego pago\nRedes sociais e conteúdo\nIdentidade visual e criação\nMaterial impresso\nSite ou loja virtual\nAinda não sei, quero conversar",
		'form_investimento'   => "Ainda não invisto\nAté R$ 2 mil por mês\nDe R$ 2 a 5 mil por mês\nDe R$ 5 a 15 mil por mês\nAcima de R$ 15 mil por mês",
		'form_botao'          => 'Pedir orçamento',
		'form_sucesso_titulo' => 'Recebido.',
		'form_sucesso_texto'  => 'Vou montar sua proposta e te chamo no WhatsApp em até 1 dia útil.',
		'form_nota'           => 'Seus dados são usados só para esse contato. Nada de lista de disparo.',

		// SEO.
		'seo_titulo'          => 'Olorin Digital | Agência de marketing em Curitiba: tráfego pago, conteúdo, site e impresso',
		'seo_descricao'       => 'Anúncio, conteúdo, site e material impresso feitos pela mesma cabeça. Agência de marketing 360 em Curitiba com foco em venda e relatório que qualquer pessoa entende.',
		'seo_imagem'          => '',

		// Rastreamento e cookies.
		'gtm_id'              => '',
		'ga4_id'              => '',
		'pixel_id'            => '',
		'cookies_texto'       => 'Usamos cookies para medir as visitas e melhorar nossos anúncios. Você escolhe se aceita.',

		// Efeitos.
		'cursor'              => true,
		'barra_mobile'        => true,
		'wa_flutuante'        => true,
	);

	return $defaults;
}

/**
 * Lê uma opção do tema (Personalizar) com fallback para o padrão.
 *
 * @param string $key Chave sem o prefixo "olorin_".
 * @return mixed
 */
function olorin_opt( $key ) {
	$defaults = olorin_defaults();
	$default  = isset( $defaults[ $key ] ) ? $defaults[ $key ] : '';
	$value    = get_theme_mod( 'olorin_' . $key, $default );

	// Campos de texto apagados por engano voltam ao padrão (exceto os que podem ficar vazios).
	$may_be_empty = array( 'linkedin', 'cnpj', 'form_email', 'gtm_id', 'ga4_id', 'pixel_id', 'seo_imagem', 'instagram', 'email' );
	if ( is_string( $value ) && '' === trim( $value ) && ! in_array( $key, $may_be_empty, true ) ) {
		return $default;
	}

	return $value;
}

/**
 * Transforma um texto com uma opção por linha em array limpo.
 *
 * @param string $text Texto multilinha.
 * @return string[]
 */
function olorin_lines( $text ) {
	$lines = preg_split( '/\r\n|\r|\n/', (string) $text );
	$lines = array_map( 'trim', $lines );
	return array_values( array_filter( $lines, 'strlen' ) );
}

/**
 * Número de WhatsApp só com dígitos e DDI 55 quando faltar.
 *
 * @return string
 */
function olorin_whatsapp_number() {
	$digits = preg_replace( '/\D+/', '', (string) olorin_opt( 'whatsapp' ) );
	if ( strlen( $digits ) >= 10 && strlen( $digits ) <= 11 ) {
		$digits = '55' . $digits;
	}
	return $digits;
}

/**
 * Link wa.me com mensagem pré-preenchida.
 *
 * @param string|null $message Mensagem; null usa a mensagem padrão.
 * @return string
 */
function olorin_whatsapp_url( $message = null ) {
	if ( null === $message || '' === trim( $message ) ) {
		$message = olorin_opt( 'whatsapp_msg' );
	}
	return 'https://wa.me/' . olorin_whatsapp_number() . '?text=' . rawurlencode( $message );
}

/**
 * Resolve os "atalhos de link" usados nos botões e textos do editor.
 *
 *  #whatsapp                 → WhatsApp com a mensagem padrão
 *  #whatsapp=Sua mensagem    → WhatsApp com mensagem personalizada
 *  #instagram / #linkedin    → perfis configurados em Personalizar
 *  #email                    → mailto do e-mail de contato
 *  #orcamento-NOME           → rola até o formulário e marca o plano NOME
 *
 * @param string $href Valor do href.
 * @return array{url:string, external?:bool, plano?:string}|null
 */
function olorin_resolve_link_token( $href ) {
	$href = trim( (string) $href );

	if ( preg_match( '/^#whats(?:app|zap)(?:[=:](.*))?$/i', $href, $m ) ) {
		$message = isset( $m[1] ) ? rawurldecode( str_replace( '+', '%2B', $m[1] ) ) : null;
		return array(
			'url'      => olorin_whatsapp_url( $message ),
			'external' => true,
		);
	}

	if ( preg_match( '/^#(instagram|linkedin)$/i', $href, $m ) ) {
		$url = olorin_opt( strtolower( $m[1] ) );
		return $url ? array(
			'url'      => esc_url_raw( $url ),
			'external' => true,
		) : array( 'url' => '#' );
	}

	if ( preg_match( '/^#e-?mail$/i', $href ) ) {
		$email = sanitize_email( olorin_opt( 'email' ) );
		return array( 'url' => $email ? 'mailto:' . $email : '#' );
	}

	if ( preg_match( '/^#or[cç]amento-([a-z0-9_-]+)$/i', $href, $m ) ) {
		return array(
			'url'   => '#orcamento',
			'plano' => sanitize_title( $m[1] ),
		);
	}

	return null;
}

/**
 * Aplica olorin_resolve_link_token() em todos os <a> de um HTML.
 *
 * @param string $html HTML.
 * @return string
 */
function olorin_resolve_links_in_html( $html ) {
	if ( ! is_string( $html ) || false === strpos( $html, 'href="#' ) || ! class_exists( 'WP_HTML_Tag_Processor' ) ) {
		return $html;
	}

	$processor = new WP_HTML_Tag_Processor( $html );
	while ( $processor->next_tag( 'a' ) ) {
		$href = $processor->get_attribute( 'href' );
		if ( ! is_string( $href ) || '' === $href || '#' !== $href[0] ) {
			continue;
		}
		$resolved = olorin_resolve_link_token( $href );
		if ( ! $resolved ) {
			continue;
		}
		$processor->set_attribute( 'href', $resolved['url'] );
		if ( ! empty( $resolved['external'] ) ) {
			$processor->set_attribute( 'target', '_blank' );
			$processor->set_attribute( 'rel', 'noopener' );
		}
		if ( ! empty( $resolved['plano'] ) ) {
			$processor->set_attribute( 'data-plano', $resolved['plano'] );
		}
	}

	return $processor->get_updated_html();
}

/**
 * SVG da marca embutido no HTML (herda a cor do texto via currentColor).
 *
 * @param string $name  Nome do arquivo em assets/img/brand, sem extensão.
 * @param array  $attrs Atributos extras (class, aria-label...).
 * @return string
 */
function olorin_svg( $name, $attrs = array() ) {
	static $cache = array();

	$name = sanitize_file_name( $name );
	if ( ! isset( $cache[ $name ] ) ) {
		$file           = OLORIN_DIR . '/assets/img/brand/' . $name . '.svg';
		$cache[ $name ] = is_readable( $file ) ? trim( (string) file_get_contents( $file ) ) : ''; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	}

	$svg = $cache[ $name ];
	if ( '' === $svg ) {
		return '';
	}

	// O arquivo vem com aria-hidden; quem chama decide (rótulo acessível ou decorativo).
	$svg = str_replace( ' aria-hidden="true"', '', $svg );
	if ( ! isset( $attrs['aria-label'] ) && ! isset( $attrs['aria-hidden'] ) ) {
		$attrs['aria-hidden'] = 'true';
	}
	if ( isset( $attrs['aria-label'] ) ) {
		$attrs['role'] = 'img';
	}

	$extra = '';
	foreach ( $attrs as $attr => $value ) {
		$extra .= ' ' . esc_attr( $attr ) . '="' . esc_attr( $value ) . '"';
	}

	return preg_replace( '/^<svg\b/', '<svg' . $extra, $svg, 1 );
}

/**
 * Ícones pixel disponíveis no bloco "Ícone".
 *
 * @return array<string, string> slug => rótulo
 */
function olorin_icons() {
	return array(
		'trafego'  => __( 'Cursor (tráfego pago)', 'olorin' ),
		'redes'    => __( 'Balão de conversa (redes sociais)', 'olorin' ),
		'marca'    => __( 'Brilho (identidade visual)', 'olorin' ),
		'impresso' => __( 'Impressora (material impresso)', 'olorin' ),
		'site'     => __( 'Janela (site)', 'olorin' ),
		'dados'    => __( 'Gráfico (rastreamento e dados)', 'olorin' ),
		'check'    => __( 'Visto', 'olorin' ),
		'seta'     => __( 'Seta', 'olorin' ),
		'relogio'  => __( 'Relógio', 'olorin' ),
		'pixel'    => __( 'Símbolo pixel da marca', 'olorin' ),
		'o'        => __( 'Símbolo "O" da marca', 'olorin' ),
		'whatsapp' => __( 'WhatsApp', 'olorin' ),
	);
}

/**
 * HTML de um ícone pixel.
 *
 * @param string $slug  Slug do ícone.
 * @param string $class Classes extras.
 * @return string
 */
function olorin_icon( $slug, $class = '' ) {
	$icons = olorin_icons();
	if ( ! isset( $icons[ $slug ] ) ) {
		$slug = 'pixel';
	}
	return '<span class="o-icon o-icon--' . esc_attr( $slug ) . ( $class ? ' ' . esc_attr( $class ) : '' ) . '" aria-hidden="true"></span>';
}

/**
 * Texto do rodapé/aviso com {ano} substituído.
 *
 * @param string $text Texto.
 * @return string
 */
function olorin_replace_year( $text ) {
	return str_replace( '{ano}', wp_date( 'Y' ), (string) $text );
}

/**
 * URL de um arquivo do tema com versão para cache (muda quando o arquivo muda).
 *
 * @param string $relative Caminho relativo à raiz do tema.
 * @return array{0:string,1:string} URL e versão.
 */
function olorin_asset( $relative ) {
	$path    = OLORIN_DIR . '/' . ltrim( $relative, '/' );
	$version = file_exists( $path ) ? (string) filemtime( $path ) : OLORIN_VERSION;
	return array( OLORIN_URI . '/' . ltrim( $relative, '/' ), $version );
}

/**
 * Há algum plugin de SEO cuidando das meta tags?
 *
 * @return bool
 */
function olorin_has_seo_plugin() {
	return defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || defined( 'AIOSEO_VERSION' ) || defined( 'SEOPRESS_VERSION' ) || class_exists( 'The_SEO_Framework\Core' );
}
