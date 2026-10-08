<?php
/**
 * Template Name: Página com seções (largura total)
 * Template Post Type: page
 *
 * Use para landing pages montadas com as seções da Olorin
 * (inseridor de blocos → Padrões → "Olorin — seções do site").
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="conteudo" class="o-main" tabindex="-1">
	<?php
	while ( have_posts() ) {
		the_post();
		the_content();
	}
	?>
</main>
<?php
get_footer();
