<?php
/**
 * Página inicial.
 *
 * Mostra o conteúdo da página definida como inicial (Páginas → Início),
 * editável no editor de blocos. Se nenhuma página estática estiver definida,
 * mostra o modelo original com todas as seções.
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="conteudo" class="o-main" tabindex="-1">
	<?php
	if ( 'page' === get_option( 'show_on_front' ) && have_posts() ) {
		while ( have_posts() ) {
			the_post();
			the_content();
		}
	} else {
		echo olorin_resolve_links_in_html( do_shortcode( do_blocks( olorin_home_content() ) ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- conteúdo do próprio tema.
	}
	?>
</main>
<?php
get_footer();
