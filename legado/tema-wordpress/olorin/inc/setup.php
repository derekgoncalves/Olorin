<?php
/**
 * Configuração base do tema: suportes, menus, scripts e limpeza do <head>.
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

/**
 * Suportes do tema.
 */
function olorin_setup() {
	load_theme_textdomain( 'olorin', OLORIN_DIR . '/languages' );

	add_theme_support( 'title-tag' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'editor-styles' );
	add_theme_support(
		'html5',
		array( 'search-form', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' )
	);
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 64,
			'width'       => 360,
			'flex-height' => true,
			'flex-width'  => true,
		)
	);

	// O tema não usa os padrões genéricos do WordPress.org: só as seções da Olorin.
	remove_theme_support( 'core-block-patterns' );

	register_nav_menus(
		array(
			'principal' => __( 'Menu principal (topo)', 'olorin' ),
		)
	);

	add_image_size( 'olorin-portfolio', 900, 0, false );
	add_image_size( 'olorin-card', 960, 600, true );

	add_editor_style( array( 'assets/css/olorin.css', 'assets/css/editor.css' ) );
}
add_action( 'after_setup_theme', 'olorin_setup' );

/**
 * Carrega só o CSS dos blocos que aparecem na página (mais leve).
 */
add_filter( 'should_load_separate_core_block_assets', '__return_true' );

/**
 * CSS e JS do site.
 */
function olorin_enqueue_assets() {
	list( $css_url, $css_ver ) = olorin_asset( 'assets/css/olorin.css' );
	list( $js_url, $js_ver )   = olorin_asset( 'assets/js/olorin.js' );

	wp_enqueue_style( 'olorin', $css_url, array(), $css_ver );

	wp_enqueue_script( 'olorin', $js_url, array(), $js_ver, array( 'strategy' => 'defer', 'in_footer' => true ) );

	$config = array(
		'restUrl'    => esc_url_raw( rest_url( 'olorin/v1/lead' ) ),
		'whatsapp'   => olorin_whatsapp_number(),
		'waMsg'      => olorin_opt( 'whatsapp_msg' ),
		'cursor'     => (bool) olorin_opt( 'cursor' ),
		'pixelId'    => preg_replace( '/\D+/', '', (string) olorin_opt( 'pixel_id' ) ),
		'hasConsent' => olorin_tracking_enabled(),
	);
	wp_add_inline_script( 'olorin', 'window.OLORIN=' . wp_json_encode( $config ) . ';', 'before' );

	// O tema não precisa do CSS clássico de blocos nem de jQuery.
	wp_dequeue_style( 'wp-block-library-theme' );
	wp_dequeue_style( 'classic-theme-styles' );
}
add_action( 'wp_enqueue_scripts', 'olorin_enqueue_assets', 20 );

/**
 * Pré-carrega as fontes mais usadas e marca o <html> como "js" o quanto antes
 * (evita piscar conteúdo antes das animações de entrada).
 */
function olorin_head_early() {
	$fonts = array( 'assets/fonts/archivo-expanded-900.woff2', 'assets/fonts/cascadia-code-400.woff2' );
	foreach ( $fonts as $font ) {
		printf( '<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n", esc_url( OLORIN_URI . '/' . $font ) );
	}
	echo "<script>document.documentElement.classList.add('js');</script>\n";
	echo '<meta name="theme-color" content="#000000">' . "\n";
}
add_action( 'wp_head', 'olorin_head_early', 1 );

/**
 * Favicon padrão da marca enquanto nenhum "Ícone do site" for definido em Personalizar.
 */
function olorin_default_favicon() {
	if ( has_site_icon() ) {
		return;
	}
	$base = OLORIN_URI . '/assets/img/brand/';
	printf( '<link rel="icon" href="%s" type="image/svg+xml">' . "\n", esc_url( $base . 'favicon.svg' ) );
	printf( '<link rel="icon" href="%s" sizes="32x32" type="image/png">' . "\n", esc_url( $base . 'favicon-32.png' ) );
	printf( '<link rel="apple-touch-icon" href="%s">' . "\n", esc_url( $base . 'apple-touch-icon.png' ) );
}
add_action( 'wp_head', 'olorin_default_favicon', 2 );

/**
 * Limpa itens desnecessários do <head> (desempenho e segurança).
 */
function olorin_cleanup_head() {
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
	remove_action( 'admin_print_styles', 'print_emoji_styles' );
	remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
	remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
	remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
	remove_action( 'wp_head', 'wp_generator' );
	remove_action( 'wp_head', 'wlwmanifest_link' );
	remove_action( 'wp_head', 'rsd_link' );
	remove_action( 'wp_head', 'wp_shortlink_wp_head' );
	add_filter( 'emoji_svg_url', '__return_false' );
}
add_action( 'init', 'olorin_cleanup_head' );

/**
 * Atalhos de link (#whatsapp, #instagram, #orcamento-plano...) no conteúdo.
 */
add_filter( 'the_content', 'olorin_resolve_links_in_html', 20 );
add_filter( 'widget_block_content', 'olorin_resolve_links_in_html', 20 );

/**
 * Shortcodes simples para textos que dependem das opções de contato.
 */
function olorin_register_shortcodes() {
	add_shortcode(
		'olorin_telefone',
		static function () {
			return esc_html( olorin_opt( 'telefone' ) );
		}
	);
	add_shortcode(
		'olorin_email',
		static function () {
			return esc_html( olorin_opt( 'email' ) );
		}
	);
	add_shortcode(
		'olorin_instagram',
		static function () {
			return esc_html( olorin_opt( 'instagram_handle' ) );
		}
	);
	add_shortcode(
		'olorin_ano',
		static function () {
			return esc_html( wp_date( 'Y' ) );
		}
	);
}
add_action( 'init', 'olorin_register_shortcodes' );

/**
 * Classes no <body>.
 *
 * @param string[] $classes Classes.
 * @return string[]
 */
function olorin_body_class( $classes ) {
	$classes[] = 'o-site';
	if ( is_front_page() ) {
		$classes[] = 'o-home';
	}
	if ( olorin_opt( 'barra_mobile' ) ) {
		$classes[] = 'has-mobile-bar';
	}
	return $classes;
}
add_filter( 'body_class', 'olorin_body_class' );

/**
 * Resumo dos posts do blog.
 */
add_filter(
	'excerpt_length',
	static function () {
		return 26;
	}
);
add_filter(
	'excerpt_more',
	static function () {
		return '…';
	}
);

/**
 * Itens de menu de âncora (#servicos) apontam para a página inicial quando
 * o visitante está em outra página (ex.: blog).
 *
 * @param array $atts Atributos do link.
 * @return array
 */
function olorin_menu_anchor_links( $atts ) {
	if ( ! empty( $atts['href'] ) && '#' === $atts['href'][0] && strlen( $atts['href'] ) > 1 && ! is_front_page() ) {
		$atts['href'] = home_url( '/' ) . $atts['href'];
	}
	return $atts;
}
add_filter( 'nav_menu_link_attributes', 'olorin_menu_anchor_links' );

/**
 * Menu padrão enquanto nenhum menu for atribuído em Aparência → Menus.
 *
 * @param array $args Argumentos do wp_nav_menu.
 */
function olorin_menu_fallback( $args ) {
	$items  = array(
		'#servicos'   => __( 'Serviços', 'olorin' ),
		'#metodo'     => __( 'Método', 'olorin' ),
		'#portfolio'  => __( 'Portfólio', 'olorin' ),
		'#resultados' => __( 'Resultados', 'olorin' ),
		'#sobre'      => __( 'Sobre', 'olorin' ),
		'#duvidas'    => __( 'Dúvidas', 'olorin' ),
	);
	$prefix = is_front_page() ? '' : home_url( '/' );
	$class  = isset( $args['menu_class'] ) ? $args['menu_class'] : 'o-nav__list';

	echo '<ul class="' . esc_attr( $class ) . '">';
	foreach ( $items as $hash => $label ) {
		echo '<li><a href="' . esc_url( $prefix . $hash ) . '">' . esc_html( $label ) . '</a></li>';
	}
	echo '</ul>';
}

/**
 * O menu aparece duas vezes (computador e celular): sem IDs repetidos nos itens.
 */
add_filter( 'nav_menu_item_id', '__return_empty_string' );

/**
 * O conteúdo do tema é em português: garante lang="pt-BR" mesmo se o
 * WordPress tiver sido instalado em outro idioma (SEO e leitores de tela).
 *
 * @param string $output Atributos.
 * @return string
 */
function olorin_language_attributes( $output ) {
	if ( 0 !== strpos( get_locale(), 'pt' ) ) {
		$output = preg_replace( '/lang="[^"]*"/', 'lang="pt-BR"', $output );
	}
	return $output;
}
add_filter( 'language_attributes', 'olorin_language_attributes' );

/**
 * Carregamento sob demanda: a primeira imagem da página carrega na hora
 * (normalmente a do topo); as demais só quando o visitante chega perto delas.
 *
 * @param string $content HTML do bloco de imagem.
 * @return string
 */
function olorin_lazy_images( $content ) {
	static $seen = 0;
	if ( false === strpos( $content, '<img' ) ) {
		return $content;
	}
	++$seen;
	if ( 1 === $seen || false !== strpos( $content, ' loading=' ) ) {
		return $content;
	}
	return preg_replace( '/<img\b/', '<img loading="lazy"', $content, 1 );
}
add_filter( 'render_block_core/image', 'olorin_lazy_images' );
