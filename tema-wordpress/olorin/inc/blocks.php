<?php
/**
 * Blocos próprios, estilos de bloco e categoria de padrões (seções).
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

/**
 * Script do editor (registra a interface dos blocos próprios).
 */
function olorin_register_editor_script() {
	list( $url, $ver ) = olorin_asset( 'assets/js/editor.js' );
	wp_register_script(
		'olorin-editor',
		$url,
		array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-server-side-render', 'wp-i18n' ),
		$ver,
		true
	);
	wp_add_inline_script(
		'olorin-editor',
		'window.OLORIN_EDITOR=' . wp_json_encode(
			array(
				'icons'        => olorin_icons(),
				'portfolioUrl' => admin_url( 'edit.php?post_type=olorin_projeto' ),
				'customizeUrl' => admin_url( 'customize.php?autofocus[panel]=olorin' ),
			)
		) . ';',
		'before'
	);
}
add_action( 'init', 'olorin_register_editor_script', 5 );

/**
 * Blocos: Ícone pixel, Portfólio e Formulário de orçamento.
 */
function olorin_register_blocks() {
	foreach ( array( 'icone', 'portfolio', 'formulario' ) as $block ) {
		register_block_type( OLORIN_DIR . '/blocks/' . $block );
	}
}
add_action( 'init', 'olorin_register_blocks' );

/**
 * Categoria "Olorin" no inseridor de blocos.
 *
 * @param array $categories Categorias.
 * @return array
 */
function olorin_block_category( $categories ) {
	array_unshift(
		$categories,
		array(
			'slug'  => 'olorin',
			'title' => __( 'Olorin', 'olorin' ),
			'icon'  => null,
		)
	);
	return $categories;
}
add_filter( 'block_categories_all', 'olorin_block_category' );

/**
 * Categoria de padrões com todas as seções do site.
 */
function olorin_pattern_category() {
	register_block_pattern_category(
		'olorin',
		array(
			'label'       => __( 'Olorin — seções do site', 'olorin' ),
			'description' => __( 'Seções prontas da Olorin. Insira, reordene e edite à vontade.', 'olorin' ),
		)
	);
}
add_action( 'init', 'olorin_pattern_category', 9 );

/**
 * Estilos de bloco (aparecem no painel "Estilos" da barra lateral do editor).
 */
function olorin_block_styles() {
	$styles = array(
		'core/button'    => array(
			'o-verde'    => __( 'Verde', 'olorin' ),
			'o-violeta'  => __( 'Violeta', 'olorin' ),
			'o-preto'    => __( 'Preto', 'olorin' ),
			'o-branco'   => __( 'Branco', 'olorin' ),
			'o-contorno' => __( 'Contorno', 'olorin' ),
		),
		'core/paragraph' => array(
			'o-etiqueta' => __( 'Etiqueta pixel', 'olorin' ),
			'o-apoio'    => __( 'Texto de apoio', 'olorin' ),
		),
		'core/heading'   => array(
			'o-gigante' => __( 'Título gigante', 'olorin' ),
		),
		'core/group'     => array(
			'o-janela' => __( 'Janela anos 90', 'olorin' ),
			'o-cartao' => __( 'Cartão com borda', 'olorin' ),
		),
		'core/list'      => array(
			'o-pixel' => __( 'Marcadores pixel', 'olorin' ),
		),
		'core/image'     => array(
			'o-pb'       => __( 'Preto e branco', 'olorin' ),
			'o-pb-hover' => __( 'P&B → cor no hover', 'olorin' ),
		),
	);

	foreach ( $styles as $block => $variations ) {
		foreach ( $variations as $name => $label ) {
			register_block_style(
				$block,
				array(
					'name'  => $name,
					'label' => $label,
				)
			);
		}
	}
}
add_action( 'init', 'olorin_block_styles' );
