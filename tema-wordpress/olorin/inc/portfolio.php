<?php
/**
 * Portfólio: tipo de conteúdo "Projeto" + tipos de trabalho (filtros).
 *
 * No painel: Portfólio → Adicionar projeto.
 *  - Título: nome do cliente ou do segmento (ex.: "Clínica de estética")
 *  - Imagem destacada: a peça
 *  - Resumo: legenda curta (ex.: "Identidade visual · Papelaria")
 *  - Tipo de trabalho: usado nos filtros (Marca, Impresso, Redes sociais, Site, Campanha)
 *  - Ordem (Atributos): define a posição na grade
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registra o tipo de conteúdo e a taxonomia.
 */
function olorin_register_portfolio() {
	register_post_type(
		'olorin_projeto',
		array(
			'labels'              => array(
				'name'               => __( 'Portfólio', 'olorin' ),
				'singular_name'      => __( 'Projeto', 'olorin' ),
				'menu_name'          => __( 'Portfólio', 'olorin' ),
				'add_new'            => __( 'Adicionar projeto', 'olorin' ),
				'add_new_item'       => __( 'Adicionar projeto', 'olorin' ),
				'edit_item'          => __( 'Editar projeto', 'olorin' ),
				'new_item'           => __( 'Novo projeto', 'olorin' ),
				'all_items'          => __( 'Todos os projetos', 'olorin' ),
				'search_items'       => __( 'Buscar projetos', 'olorin' ),
				'not_found'          => __( 'Nenhum projeto ainda.', 'olorin' ),
				'not_found_in_trash' => __( 'Nenhum projeto na lixeira.', 'olorin' ),
				'featured_image'     => __( 'Imagem do projeto', 'olorin' ),
				'set_featured_image' => __( 'Definir imagem do projeto', 'olorin' ),
			),
			'public'              => false,
			'publicly_queryable'  => false,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_rest'        => true,
			'menu_position'       => 21,
			'menu_icon'           => 'dashicons-format-gallery',
			'supports'            => array( 'title', 'thumbnail', 'excerpt', 'page-attributes' ),
			'has_archive'         => false,
			'rewrite'             => false,
			'exclude_from_search' => true,
		)
	);

	register_taxonomy(
		'olorin_tipo',
		'olorin_projeto',
		array(
			'labels'            => array(
				'name'          => __( 'Tipos de trabalho', 'olorin' ),
				'singular_name' => __( 'Tipo de trabalho', 'olorin' ),
				'add_new_item'  => __( 'Adicionar tipo', 'olorin' ),
				'search_items'  => __( 'Buscar tipos', 'olorin' ),
				'menu_name'     => __( 'Tipos de trabalho', 'olorin' ),
			),
			'public'            => false,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'show_admin_column' => true,
			'hierarchical'      => true,
			'rewrite'           => false,
		)
	);

	register_post_meta(
		'olorin_projeto',
		'olorin_link',
		array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => true,
			'sanitize_callback' => 'esc_url_raw',
			'auth_callback'     => static function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);
}
add_action( 'init', 'olorin_register_portfolio' );

/**
 * Campo "Link do projeto" (opcional) na tela de edição.
 */
function olorin_portfolio_metabox() {
	add_meta_box(
		'olorin_projeto_link',
		__( 'Link do projeto (opcional)', 'olorin' ),
		static function ( $post ) {
			wp_nonce_field( 'olorin_projeto_link', 'olorin_projeto_link_nonce' );
			printf(
				'<p><input type="url" name="olorin_link" value="%s" class="widefat" placeholder="https://instagram.com/p/..."></p><p class="description">%s</p>',
				esc_attr( get_post_meta( $post->ID, 'olorin_link', true ) ),
				esc_html__( 'Post do Instagram, Behance ou site do cliente. Deixe vazio se não quiser link.', 'olorin' )
			);
		},
		'olorin_projeto',
		'side'
	);
}
add_action( 'add_meta_boxes', 'olorin_portfolio_metabox' );

/**
 * Salva o link do projeto (editor clássico de metabox).
 *
 * @param int $post_id ID.
 */
function olorin_portfolio_save_link( $post_id ) {
	if ( ! isset( $_POST['olorin_projeto_link_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['olorin_projeto_link_nonce'] ) ), 'olorin_projeto_link' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	$link = isset( $_POST['olorin_link'] ) ? esc_url_raw( wp_unslash( $_POST['olorin_link'] ) ) : '';
	update_post_meta( $post_id, 'olorin_link', $link );
}
add_action( 'save_post_olorin_projeto', 'olorin_portfolio_save_link' );

/**
 * Coluna com miniatura na lista de projetos.
 *
 * @param array $columns Colunas.
 * @return array
 */
function olorin_portfolio_columns( $columns ) {
	$new = array();
	foreach ( $columns as $key => $label ) {
		if ( 'title' === $key ) {
			$new['olorin_thumb'] = __( 'Imagem', 'olorin' );
		}
		$new[ $key ] = $label;
	}
	return $new;
}
add_filter( 'manage_olorin_projeto_posts_columns', 'olorin_portfolio_columns' );

add_action(
	'manage_olorin_projeto_posts_custom_column',
	static function ( $column, $post_id ) {
		if ( 'olorin_thumb' === $column ) {
			echo get_the_post_thumbnail( $post_id, array( 64, 64 ), array( 'style' => 'width:64px;height:64px;object-fit:cover' ) );
		}
	},
	10,
	2
);

/**
 * Projetos de exemplo (aparecem só enquanto nenhum projeto real for publicado).
 *
 * @return array[]
 */
function olorin_portfolio_examples() {
	$base = OLORIN_URI . '/assets/img/portfolio/';
	return array(
		array( 'img' => 'marca-identidade.webp', 'w' => 600, 'h' => 600, 'title' => 'Ateliê de moda', 'label' => 'Marca · Identidade visual', 'cats' => array( 'marca' => 'Marca' ) ),
		array( 'img' => 'campanha-trafego.webp', 'w' => 600, 'h' => 600, 'title' => 'Loja de tecnologia', 'label' => 'Campanha · Tráfego pago', 'cats' => array( 'campanha' => 'Campanha' ) ),
		array( 'img' => 'site-institucional.webp', 'w' => 600, 'h' => 400, 'title' => 'Escritório de advocacia', 'label' => 'Site · Institucional', 'cats' => array( 'site' => 'Site' ) ),
		array( 'img' => 'impresso-catalogo.webp', 'w' => 600, 'h' => 800, 'title' => 'Cafeteria', 'label' => 'Impresso · Catálogo', 'cats' => array( 'impresso' => 'Impresso' ) ),
		array( 'img' => 'redes-conteudo.webp', 'w' => 640, 'h' => 800, 'title' => 'Estúdio de estética', 'label' => 'Redes sociais · Conteúdo', 'cats' => array( 'redes-sociais' => 'Redes sociais' ) ),
		array( 'img' => 'marca-producao.webp', 'w' => 600, 'h' => 400, 'title' => 'Marcenaria autoral', 'label' => 'Marca · Fotografia', 'cats' => array( 'marca' => 'Marca' ) ),
		array( 'img' => 'campanha-google-ads.webp', 'w' => 600, 'h' => 400, 'title' => 'Clínica médica', 'label' => 'Campanha · Google Ads', 'cats' => array( 'campanha' => 'Campanha' ) ),
		array( 'img' => 'impresso-loja.webp', 'w' => 600, 'h' => 500, 'title' => 'Loja infantil', 'label' => 'Impresso · Ponto de venda', 'cats' => array( 'impresso' => 'Impresso' ) ),
	);
}

/**
 * Itens do portfólio prontos para o bloco.
 *
 * @param int $limit Quantidade.
 * @return array{items: array[], examples: bool}
 */
function olorin_portfolio_items( $limit = 12 ) {
	$query = new WP_Query(
		array(
			'post_type'              => 'olorin_projeto',
			'post_status'            => 'publish',
			'posts_per_page'         => $limit,
			'orderby'                => array(
				'menu_order' => 'ASC',
				'date'       => 'DESC',
			),
			'no_found_rows'          => true,
			'update_post_term_cache' => true,
			'meta_query'             => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
				array(
					'key'     => '_thumbnail_id',
					'compare' => 'EXISTS',
				),
			),
		)
	);

	$items = array();
	foreach ( $query->posts as $post ) {
		$thumb_id = get_post_thumbnail_id( $post );
		$image    = wp_get_attachment_image_src( $thumb_id, 'olorin-portfolio' );
		if ( ! $image ) {
			continue;
		}
		$cats  = array();
		$terms = get_the_terms( $post, 'olorin_tipo' );
		if ( is_array( $terms ) ) {
			foreach ( $terms as $term ) {
				$cats[ $term->slug ] = $term->name;
			}
		}
		$alt = trim( (string) get_post_meta( $thumb_id, '_wp_attachment_image_alt', true ) );

		$items[] = array(
			'id'     => $thumb_id,
			'src'    => $image[0],
			'w'      => (int) $image[1],
			'h'      => (int) $image[2],
			'srcset' => (string) wp_get_attachment_image_srcset( $thumb_id, 'olorin-portfolio' ),
			'alt'    => '' !== $alt ? $alt : get_the_title( $post ),
			'title'  => get_the_title( $post ),
			'label'  => has_excerpt( $post ) ? get_the_excerpt( $post ) : implode( ' · ', $cats ),
			'cats'   => $cats,
			'link'   => (string) get_post_meta( $post->ID, 'olorin_link', true ),
		);
	}
	wp_reset_postdata();

	if ( $items ) {
		return array(
			'items'    => $items,
			'examples' => false,
		);
	}

	$examples = array();
	foreach ( array_slice( olorin_portfolio_examples(), 0, $limit ) as $example ) {
		$examples[] = array(
			'id'     => 0,
			'src'    => OLORIN_URI . '/assets/img/portfolio/' . $example['img'],
			'w'      => $example['w'],
			'h'      => $example['h'],
			'srcset' => '',
			'alt'    => $example['title'] . ' — ' . $example['label'],
			'title'  => $example['title'],
			'label'  => $example['label'],
			'cats'   => $example['cats'],
			'link'   => '',
		);
	}

	return array(
		'items'    => $examples,
		'examples' => true,
	);
}

/**
 * Tipos de trabalho padrão (criados na ativação do tema).
 */
function olorin_portfolio_default_terms() {
	$terms = array(
		'marca'         => 'Marca',
		'impresso'      => 'Impresso',
		'redes-sociais' => 'Redes sociais',
		'site'          => 'Site',
		'campanha'      => 'Campanha',
	);
	foreach ( $terms as $slug => $name ) {
		if ( ! term_exists( $slug, 'olorin_tipo' ) ) {
			wp_insert_term( $name, 'olorin_tipo', array( 'slug' => $slug ) );
		}
	}
}
