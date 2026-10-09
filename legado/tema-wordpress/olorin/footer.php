<?php
/**
 * Rodapé do site.
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

$olorin_wa_url    = olorin_whatsapp_url();
$olorin_quote_url = is_front_page() ? '#orcamento' : home_url( '/#orcamento' );
$olorin_email     = sanitize_email( olorin_opt( 'email' ) );
$olorin_privacy   = get_privacy_policy_url();
$olorin_cnpj      = trim( (string) olorin_opt( 'cnpj' ) );
?>
<footer class="o-footer">
	<div class="o-wrap o-footer__grid">
		<div class="o-footer__brand">
			<a class="o-footer__logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
				<?php echo olorin_svg( 'logo-olorin', array( 'aria-hidden' => 'true' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</a>
			<p><?php echo esc_html( olorin_opt( 'footer_frase' ) ); ?></p>
		</div>

		<div>
			<p class="o-footer__h"><?php esc_html_e( 'Contato', 'olorin' ); ?></p>
			<ul>
				<li><a href="<?php echo esc_url( $olorin_wa_url ); ?>" target="_blank" rel="noopener" id="cta-whatsapp-rodape"><?php echo esc_html( olorin_opt( 'telefone' ) ); ?></a></li>
				<?php if ( $olorin_email ) : ?>
					<li><a href="mailto:<?php echo esc_attr( $olorin_email ); ?>"><?php echo esc_html( $olorin_email ); ?></a></li>
				<?php endif; ?>
				<li><?php echo esc_html( olorin_opt( 'cidade' ) ); ?></li>
				<li><a href="<?php echo esc_url( $olorin_quote_url ); ?>"><?php esc_html_e( 'Pedir orçamento', 'olorin' ); ?></a></li>
			</ul>
		</div>

		<div>
			<p class="o-footer__h"><?php esc_html_e( 'Redes', 'olorin' ); ?></p>
			<ul>
				<?php if ( olorin_opt( 'instagram' ) ) : ?>
					<li><a href="<?php echo esc_url( olorin_opt( 'instagram' ) ); ?>" target="_blank" rel="noopener"><?php echo esc_html( 'Instagram ' . olorin_opt( 'instagram_handle' ) ); ?></a></li>
				<?php endif; ?>
				<?php if ( olorin_opt( 'linkedin' ) ) : ?>
					<li><a href="<?php echo esc_url( olorin_opt( 'linkedin' ) ); ?>" target="_blank" rel="noopener">LinkedIn</a></li>
				<?php endif; ?>
				<li><a href="<?php echo esc_url( $olorin_wa_url ); ?>" target="_blank" rel="noopener">WhatsApp</a></li>
			</ul>
		</div>

		<div>
			<p class="o-footer__h"><?php esc_html_e( 'Serviços', 'olorin' ); ?></p>
			<ul>
				<?php foreach ( olorin_lines( olorin_opt( 'footer_servicos' ) ) as $olorin_service ) : ?>
					<li><?php echo esc_html( $olorin_service ); ?></li>
				<?php endforeach; ?>
			</ul>
		</div>
	</div>

	<div class="o-footer__giant" aria-hidden="true">
		<?php echo olorin_svg( 'logo-olorin', array( 'aria-hidden' => 'true', 'focusable' => 'false' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	</div>

	<div class="o-footer__bottom">
		<div class="o-wrap o-footer__bottom-inner">
			<p>
				<?php echo esc_html( olorin_replace_year( olorin_opt( 'footer_copy' ) ) ); ?>
				<?php if ( $olorin_cnpj ) : ?>
					· <?php echo esc_html( 'CNPJ ' . $olorin_cnpj ); ?>
				<?php endif; ?>
			</p>
			<p>
				<?php if ( $olorin_privacy ) : ?>
					<a href="<?php echo esc_url( $olorin_privacy ); ?>"><?php esc_html_e( 'Política de Privacidade', 'olorin' ); ?></a>
				<?php endif; ?>
				<?php if ( olorin_tracking_enabled() ) : ?>
					· <button type="button" data-o-cookies-open><?php esc_html_e( 'Preferências de cookies', 'olorin' ); ?></button>
				<?php endif; ?>
			</p>
		</div>
	</div>
</footer>

<?php if ( olorin_opt( 'wa_flutuante' ) ) : ?>
	<aside class="o-float-wrap" aria-label="<?php esc_attr_e( 'Atalho de contato', 'olorin' ); ?>">
	<a class="o-wa-float" id="cta-whatsapp-flutuante" href="<?php echo esc_url( $olorin_wa_url ); ?>" target="_blank" rel="noopener" aria-label="<?php esc_attr_e( 'Falar no WhatsApp', 'olorin' ); ?>" data-o-float>
		<?php echo olorin_icon( 'whatsapp' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<span aria-hidden="true"><?php esc_html_e( 'Falar agora', 'olorin' ); ?></span>
	</a>
	</aside>
<?php endif; ?>

<?php if ( olorin_opt( 'barra_mobile' ) ) : ?>
	<nav class="o-mobilebar" aria-label="<?php esc_attr_e( 'Atalhos de contato', 'olorin' ); ?>" data-o-mobilebar>
		<a id="cta-whatsapp-barra-mobile" href="<?php echo esc_url( $olorin_wa_url ); ?>" target="_blank" rel="noopener">
			<?php echo olorin_icon( 'whatsapp' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?php esc_html_e( 'WhatsApp', 'olorin' ); ?>
		</a>
		<a id="cta-form-barra-mobile" href="<?php echo esc_url( $olorin_quote_url ); ?>"><?php esc_html_e( 'Orçamento', 'olorin' ); ?></a>
	</nav>
<?php endif; ?>

<?php if ( olorin_opt( 'cursor' ) ) : ?>
	<div class="o-cursor" aria-hidden="true" data-o-cursor></div>
<?php endif; ?>

<?php wp_footer(); ?>
</body>
</html>
