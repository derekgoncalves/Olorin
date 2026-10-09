<?php
/**
 * Cabeçalho do site.
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

$olorin_quote_url = is_front_page() ? '#orcamento' : home_url( '/#orcamento' );
$olorin_wa_url    = olorin_whatsapp_url();
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="o-skip" href="#conteudo"><?php esc_html_e( 'Pular para o conteúdo', 'olorin' ); ?></a>

<header class="o-header" data-o-header>
	<div class="o-header__inner">
		<a class="o-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home" aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) . ' — ' . __( 'página inicial', 'olorin' ) ); ?>">
			<?php
			if ( has_custom_logo() ) {
				echo wp_get_attachment_image( (int) get_theme_mod( 'custom_logo' ), 'medium', false, array( 'alt' => '' ) );
			} else {
				echo olorin_svg( 'logo-olorin', array( 'aria-hidden' => 'true' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			}
			?>
		</a>

		<nav class="o-nav" aria-label="<?php esc_attr_e( 'Principal', 'olorin' ); ?>">
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'principal',
					'container'      => false,
					'menu_class'     => 'o-nav__list',
					'menu_id'        => 'o-nav-list',
					'depth'          => 1,
					'fallback_cb'    => 'olorin_menu_fallback',
				)
			);
			?>
		</nav>

		<div class="o-header__ctas">
			<a class="o-btn o-btn--ghost" id="cta-whatsapp-topo" href="<?php echo esc_url( $olorin_wa_url ); ?>" target="_blank" rel="noopener">
				<?php echo esc_html( olorin_opt( 'header_wa' ) ); ?>
			</a>
			<a class="o-btn o-btn--lime" id="cta-orcamento-topo" href="<?php echo esc_url( $olorin_quote_url ); ?>"><?php echo esc_html( olorin_opt( 'header_cta' ) ); ?></a>
		</div>

		<button class="o-burger" type="button" aria-expanded="false" aria-controls="o-menu" data-o-burger>
			<span class="screen-reader-text"><?php esc_html_e( 'Abrir menu', 'olorin' ); ?></span>
			<i></i><i></i><i></i>
		</button>
	</div>
</header>

<div class="o-menu" id="o-menu" data-o-menu inert aria-label="<?php esc_attr_e( 'Menu', 'olorin' ); ?>" role="dialog" aria-modal="true">
	<div class="o-menu__top">
		<a class="o-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
			<?php echo olorin_svg( 'logo-olorin', array( 'aria-hidden' => 'true' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</a>
		<button class="o-menu__close" type="button" data-o-menu-close>
			<span aria-hidden="true">X</span>
			<span class="screen-reader-text"><?php esc_html_e( 'Fechar menu', 'olorin' ); ?></span>
		</button>
	</div>
	<nav class="o-menu__nav" aria-label="<?php esc_attr_e( 'Menu do celular', 'olorin' ); ?>">
		<?php
		wp_nav_menu(
			array(
				'theme_location' => 'principal',
				'container'      => false,
				'menu_class'     => 'o-menu__list',
				'menu_id'        => 'o-menu-list',
				'depth'          => 1,
				'fallback_cb'    => 'olorin_menu_fallback',
			)
		);
		?>
	</nav>
	<div class="o-menu__ctas">
		<a class="o-btn o-btn--lime" href="<?php echo esc_url( $olorin_quote_url ); ?>" data-o-menu-close><?php echo esc_html( olorin_opt( 'header_cta' ) ); ?></a>
		<a class="o-btn o-btn--ghost" href="<?php echo esc_url( $olorin_wa_url ); ?>" target="_blank" rel="noopener"><?php echo esc_html( olorin_opt( 'header_wa' ) ); ?></a>
	</div>
	<p class="o-menu__foot"><?php echo esc_html( olorin_opt( 'instagram_handle' ) . ' · ' . olorin_opt( 'cidade' ) ); ?></p>
</div>
