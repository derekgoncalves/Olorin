<?php
/**
 * Artigo do blog.
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	$olorin_blog = get_option( 'page_for_posts' ) ? get_permalink( (int) get_option( 'page_for_posts' ) ) : home_url( '/' );
	?>
	<main id="conteudo" class="o-main" tabindex="-1">
		<header class="o-page-hero">
			<div class="o-wrap">
				<p class="is-style-o-etiqueta">
					<a href="<?php echo esc_url( $olorin_blog ); ?>"><?php esc_html_e( 'Blog', 'olorin' ); ?></a>
					· <?php echo esc_html( get_the_date() ); ?>
					<?php
					$olorin_cats = get_the_category();
					if ( $olorin_cats ) {
						echo ' · ' . esc_html( $olorin_cats[0]->name );
					}
					?>
				</p>
				<h1><?php the_title(); ?></h1>
				<?php if ( has_excerpt() ) : ?>
					<p class="o-page-hero__lead"><?php echo esc_html( get_the_excerpt() ); ?></p>
				<?php endif; ?>
			</div>
		</header>
		<article <?php post_class( 'o-prose' ); ?>>
			<div class="o-prose__inner">
				<?php if ( has_post_thumbnail() ) : ?>
					<figure class="o-post-cover"><?php the_post_thumbnail( 'large', array( 'loading' => 'eager' ) ); ?></figure>
				<?php endif; ?>
				<?php
				the_content();
				wp_link_pages();
				?>
				<nav class="o-post-nav" aria-label="<?php esc_attr_e( 'Mais artigos', 'olorin' ); ?>">
					<span><?php previous_post_link( '%link', '← %title' ); ?></span>
					<span><?php next_post_link( '%link', '%title →' ); ?></span>
				</nav>
			</div>
		</article>
	</main>
	<?php
endwhile;

get_footer();
