<?php
/**
 * Lista de artigos (blog, categorias, busca).
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

get_header();

if ( is_search() ) {
	/* translators: %s: termo buscado */
	$olorin_title = sprintf( __( 'Busca: %s', 'olorin' ), get_search_query() );
} elseif ( is_archive() ) {
	$olorin_title = wp_strip_all_tags( get_the_archive_title() );
} elseif ( is_home() && get_option( 'page_for_posts' ) ) {
	$olorin_title = get_the_title( (int) get_option( 'page_for_posts' ) );
} else {
	$olorin_title = __( 'Blog', 'olorin' );
}
?>
<main id="conteudo" class="o-main" tabindex="-1">
	<header class="o-page-hero">
		<div class="o-wrap">
			<p class="is-style-o-etiqueta"><?php echo esc_html( get_bloginfo( 'name' ) ); ?></p>
			<h1><?php echo esc_html( $olorin_title ); ?></h1>
		</div>
	</header>

	<section class="o-prose">
		<div class="o-wrap">
			<?php if ( have_posts() ) : ?>
				<div class="o-posts">
					<?php
					while ( have_posts() ) :
						the_post();
						?>
						<a class="o-post-card is-style-o-janela" href="<?php the_permalink(); ?>">
							<p><?php echo esc_html( sprintf( 'post_%s.txt', get_the_date( 'dmY' ) ) ); ?></p>
							<?php if ( has_post_thumbnail() ) : ?>
								<figure class="o-post-card__img"><?php the_post_thumbnail( 'olorin-card', array( 'alt' => '' ) ); ?></figure>
							<?php endif; ?>
							<p class="o-post-card__meta"><?php echo esc_html( get_the_date() ); ?></p>
							<h2 class="o-post-card__title"><?php the_title(); ?></h2>
							<p class="o-post-card__excerpt"><?php echo esc_html( get_the_excerpt() ); ?></p>
						</a>
					<?php endwhile; ?>
				</div>
				<nav class="o-pagination" aria-label="<?php esc_attr_e( 'Páginas', 'olorin' ); ?>">
					<?php
					echo paginate_links( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						array(
							'prev_text' => '←',
							'next_text' => '→',
						)
					);
					?>
				</nav>
			<?php else : ?>
				<p class="o-empty"><?php esc_html_e( 'Nada por aqui ainda.', 'olorin' ); ?></p>
				<?php get_search_form(); ?>
			<?php endif; ?>
		</div>
	</section>
</main>
<?php
get_footer();
