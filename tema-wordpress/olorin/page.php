<?php
/**
 * Páginas internas (ex.: Política de Privacidade).
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	?>
	<main id="conteudo" class="o-main" tabindex="-1">
		<header class="o-page-hero">
			<div class="o-wrap">
				<p class="is-style-o-etiqueta"><?php echo esc_html( get_bloginfo( 'name' ) ); ?></p>
				<h1><?php the_title(); ?></h1>
			</div>
		</header>
		<article <?php post_class( 'o-prose' ); ?>>
			<div class="o-prose__inner">
				<?php
				the_content();
				wp_link_pages();
				?>
			</div>
		</article>
	</main>
	<?php
endwhile;

get_footer();
