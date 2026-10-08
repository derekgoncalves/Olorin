<?php
/**
 * SEO básico: título, descrição, Open Graph e dados estruturados (schema.org).
 *
 * Se você instalar Yoast, Rank Math, AIOSEO ou SEOPress, este módulo se
 * desliga sozinho para não duplicar as tags.
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

/**
 * Título da página inicial.
 *
 * @param string $title Título.
 * @return string
 */
function olorin_front_title( $title ) {
	if ( is_front_page() && ! olorin_has_seo_plugin() ) {
		return olorin_opt( 'seo_titulo' );
	}
	return $title;
}
add_filter( 'pre_get_document_title', 'olorin_front_title' );

add_filter(
	'document_title_separator',
	static function () {
		return '|';
	}
);

/**
 * Descrição da página atual.
 *
 * @return string
 */
function olorin_meta_description() {
	if ( is_front_page() || ( is_home() && ! get_option( 'page_for_posts' ) ) ) {
		return olorin_opt( 'seo_descricao' );
	}
	if ( is_singular() ) {
		$post = get_queried_object();
		if ( $post instanceof WP_Post ) {
			$text = has_excerpt( $post ) ? $post->post_excerpt : wp_strip_all_tags( strip_shortcodes( $post->post_content ) );
			$text = trim( preg_replace( '/\s+/', ' ', $text ) );
			if ( '' !== $text ) {
				return wp_trim_words( $text, 30, '…' );
			}
		}
	}
	if ( is_category() || is_tag() ) {
		$desc = trim( wp_strip_all_tags( term_description() ) );
		if ( '' !== $desc ) {
			return $desc;
		}
	}
	return olorin_opt( 'seo_descricao' );
}

/**
 * Imagem de compartilhamento.
 *
 * @return array{url:string,w:int,h:int}
 */
function olorin_share_image() {
	if ( is_singular() && has_post_thumbnail() && ! is_front_page() ) {
		$img = wp_get_attachment_image_src( get_post_thumbnail_id(), 'large' );
		if ( $img ) {
			return array(
				'url' => $img[0],
				'w'   => (int) $img[1],
				'h'   => (int) $img[2],
			);
		}
	}
	$custom = olorin_opt( 'seo_imagem' );
	if ( $custom ) {
		$id  = attachment_url_to_postid( $custom );
		$img = $id ? wp_get_attachment_image_src( $id, 'full' ) : false;
		return array(
			'url' => $custom,
			'w'   => $img ? (int) $img[1] : 0,
			'h'   => $img ? (int) $img[2] : 0,
		);
	}
	return array(
		'url' => OLORIN_URI . '/assets/img/compartilhamento.jpg',
		'w'   => 1200,
		'h'   => 630,
	);
}

/**
 * Meta tags no <head>.
 */
function olorin_seo_head() {
	if ( olorin_has_seo_plugin() ) {
		return;
	}

	$description = olorin_meta_description();
	$image       = olorin_share_image();
	$title       = wp_get_document_title();
	$url         = is_front_page() ? home_url( '/' ) : ( is_singular() ? get_permalink() : home_url( add_query_arg( array() ) ) );
	$type        = is_singular( 'post' ) ? 'article' : 'website';

	echo "\n";
	printf( '<meta name="description" content="%s">' . "\n", esc_attr( $description ) );
	echo '<meta property="og:locale" content="pt_BR">' . "\n";
	printf( '<meta property="og:type" content="%s">' . "\n", esc_attr( $type ) );
	printf( '<meta property="og:site_name" content="%s">' . "\n", esc_attr( get_bloginfo( 'name' ) ) );
	printf( '<meta property="og:title" content="%s">' . "\n", esc_attr( $title ) );
	printf( '<meta property="og:description" content="%s">' . "\n", esc_attr( $description ) );
	printf( '<meta property="og:url" content="%s">' . "\n", esc_url( $url ) );
	printf( '<meta property="og:image" content="%s">' . "\n", esc_url( $image['url'] ) );
	if ( $image['w'] && $image['h'] ) {
		printf( '<meta property="og:image:width" content="%d">' . "\n", (int) $image['w'] );
		printf( '<meta property="og:image:height" content="%d">' . "\n", (int) $image['h'] );
	}
	echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
}
add_action( 'wp_head', 'olorin_seo_head', 4 );

/**
 * Perguntas e respostas dos blocos "Detalhes" da página (para o FAQPage).
 *
 * @param array $blocks Blocos.
 * @return array[]
 */
function olorin_collect_faq( $blocks ) {
	$faq = array();
	foreach ( $blocks as $block ) {
		if ( 'core/details' === $block['blockName'] ) {
			$question = '';
			if ( preg_match( '#<summary[^>]*>(.*?)</summary>#s', (string) $block['innerHTML'], $m ) ) {
				$question = trim( wp_strip_all_tags( $m[1] ) );
			}
			$answer = '';
			foreach ( $block['innerBlocks'] as $inner ) {
				$answer .= ' ' . wp_strip_all_tags( render_block( $inner ) );
			}
			$answer = trim( preg_replace( '/\s+/', ' ', $answer ) );
			if ( '' !== $question && '' !== $answer ) {
				$faq[] = array(
					'@type'          => 'Question',
					'name'           => $question,
					'acceptedAnswer' => array(
						'@type' => 'Answer',
						'text'  => $answer,
					),
				);
			}
		}
		if ( ! empty( $block['innerBlocks'] ) ) {
			$faq = array_merge( $faq, olorin_collect_faq( $block['innerBlocks'] ) );
		}
	}
	return $faq;
}

/**
 * Dados estruturados (JSON-LD).
 */
function olorin_schema() {
	if ( olorin_has_seo_plugin() || ! is_front_page() ) {
		return;
	}

	$logo  = function_exists( 'get_custom_logo' ) && has_custom_logo() ? wp_get_attachment_image_url( get_theme_mod( 'custom_logo' ), 'full' ) : OLORIN_URI . '/assets/img/brand/apple-touch-icon.png';
	$same  = array_values( array_filter( array( olorin_opt( 'instagram' ), olorin_opt( 'linkedin' ) ) ) );
	$phone = olorin_whatsapp_number();
	$city  = olorin_opt( 'cidade' );
	$parts = array_map( 'trim', explode( ',', (string) $city ) );

	$business = array(
		'@type'       => 'ProfessionalService',
		'@id'         => home_url( '/#empresa' ),
		'name'        => get_bloginfo( 'name' ),
		'description' => olorin_opt( 'seo_descricao' ),
		'url'         => home_url( '/' ),
		'logo'        => $logo,
		'image'       => olorin_share_image()['url'],
		'areaServed'  => 'BR',
		'address'     => array(
			'@type'           => 'PostalAddress',
			'addressLocality' => isset( $parts[0] ) ? $parts[0] : '',
			'addressRegion'   => isset( $parts[1] ) ? $parts[1] : '',
			'addressCountry'  => 'BR',
		),
		'knowsAbout'  => array( 'Tráfego pago', 'Meta Ads', 'Google Ads', 'Redes sociais', 'Identidade visual', 'Material impresso', 'Criação de sites', 'Google Tag Manager' ),
	);
	if ( $phone ) {
		$business['telephone'] = '+' . $phone;
	}
	if ( olorin_opt( 'email' ) ) {
		$business['email'] = sanitize_email( olorin_opt( 'email' ) );
	}
	if ( $same ) {
		$business['sameAs'] = $same;
	}

	$graph = array(
		$business,
		array(
			'@type'      => 'WebSite',
			'@id'        => home_url( '/#site' ),
			'url'        => home_url( '/' ),
			'name'       => get_bloginfo( 'name' ),
			'inLanguage' => 'pt-BR',
			'publisher'  => array( '@id' => home_url( '/#empresa' ) ),
		),
	);

	$post = get_queried_object();
	if ( $post instanceof WP_Post ) {
		$faq = olorin_collect_faq( parse_blocks( $post->post_content ) );
		if ( $faq ) {
			$graph[] = array(
				'@type'      => 'FAQPage',
				'@id'        => home_url( '/#duvidas' ),
				'mainEntity' => $faq,
			);
		}
	}

	printf(
		'<script type="application/ld+json">%s</script>' . "\n",
		wp_json_encode(
			array(
				'@context' => 'https://schema.org',
				'@graph'   => $graph,
			),
			JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP
		)
	);
}
add_action( 'wp_head', 'olorin_schema', 5 );
