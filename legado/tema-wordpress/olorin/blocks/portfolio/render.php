<?php
/**
 * Bloco "Portfólio": grade em mosaico com filtros por tipo de trabalho.
 *
 * @package Olorin
 * @var array $attributes
 */

defined( 'ABSPATH' ) || exit;

$olorin_limit   = isset( $attributes['quantidade'] ) ? max( 1, min( 48, (int) $attributes['quantidade'] ) ) : 12;
$olorin_filters = ! isset( $attributes['filtros'] ) || (bool) $attributes['filtros'];
$olorin_data    = olorin_portfolio_items( $olorin_limit );
$olorin_items   = $olorin_data['items'];

$olorin_cats = array();
foreach ( $olorin_items as $olorin_item ) {
	$olorin_cats = array_merge( $olorin_cats, $olorin_item['cats'] );
}
?>
<div <?php echo get_block_wrapper_attributes( array( 'class' => 'o-portfolio-block' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> data-o-portfolio>
	<?php if ( $olorin_data['examples'] && current_user_can( 'edit_posts' ) ) : ?>
		<p class="o-admin-note">
			<?php
			printf(
				/* translators: %s: link para o painel de portfólio */
				esc_html__( 'Só você (logado) vê este aviso: estes trabalhos são exemplos ilustrativos. Cadastre os reais em %s — eles substituem os exemplos automaticamente.', 'olorin' ),
				'<a href="' . esc_url( admin_url( 'post-new.php?post_type=olorin_projeto' ) ) . '">' . esc_html__( 'Portfólio → Adicionar projeto', 'olorin' ) . '</a>'
			);
			?>
		</p>
	<?php endif; ?>

	<?php if ( $olorin_filters && count( $olorin_cats ) > 1 ) : ?>
		<div class="o-filters" role="group" aria-label="<?php esc_attr_e( 'Filtrar trabalhos por tipo', 'olorin' ); ?>">
			<button type="button" class="o-filter" data-filter="*" aria-pressed="true"><?php esc_html_e( 'Tudo', 'olorin' ); ?></button>
			<?php foreach ( $olorin_cats as $olorin_slug => $olorin_name ) : ?>
				<button type="button" class="o-filter" data-filter="<?php echo esc_attr( $olorin_slug ); ?>" aria-pressed="false"><?php echo esc_html( $olorin_name ); ?></button>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>

	<div class="o-works">
		<?php foreach ( $olorin_items as $olorin_index => $olorin_item ) : ?>
			<?php
			$olorin_tag   = $olorin_item['link'] ? 'a' : 'div';
			$olorin_attrs = $olorin_item['link'] ? ' href="' . esc_url( $olorin_item['link'] ) . '" target="_blank" rel="noopener"' : '';
			$olorin_file  = sprintf( 'projeto_%02d.jpg', $olorin_index + 1 );
			?>
			<figure class="o-work" data-cats="<?php echo esc_attr( implode( ' ', array_keys( $olorin_item['cats'] ) ) ); ?>">
				<<?php echo $olorin_tag . $olorin_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> class="o-work__inner">
					<img
						src="<?php echo esc_url( $olorin_item['src'] ); ?>"
						<?php if ( $olorin_item['srcset'] ) : ?>
							srcset="<?php echo esc_attr( $olorin_item['srcset'] ); ?>"
							sizes="(min-width: 1024px) 25vw, 50vw"
						<?php endif; ?>
						width="<?php echo (int) $olorin_item['w']; ?>"
						height="<?php echo (int) $olorin_item['h']; ?>"
						alt="<?php echo esc_attr( $olorin_item['alt'] ); ?>"
						loading="lazy"
						decoding="async"
					>
					<figcaption class="o-work__cap">
						<span class="o-work__bar" aria-hidden="true"><?php echo esc_html( $olorin_file ); ?></span>
						<strong class="o-work__title"><?php echo esc_html( $olorin_item['title'] ); ?></strong>
						<span class="o-work__label"><?php echo esc_html( $olorin_item['label'] ); ?></span>
					</figcaption>
				</<?php echo $olorin_tag; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			</figure>
		<?php endforeach; ?>
	</div>
</div>
