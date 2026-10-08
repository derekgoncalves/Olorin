<?php
/**
 * Página não encontrada.
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="conteudo" class="o-main o-404" tabindex="-1" style="background-image:url('<?php echo esc_url( OLORIN_URI . '/assets/img/erro-404.webp' ); ?>')">
	<div class="is-style-o-janela o-404__win">
		<p>pagina_nao_encontrada.exe</p>
		<h1 class="o-404__code">404</h1>
		<p class="o-404__text"><?php esc_html_e( 'A gente procurou com atenção, mas esta página não existe (ou mudou de endereço).', 'olorin' ); ?></p>
		<div class="wp-block-buttons">
			<div class="wp-block-button is-style-o-verde"><a class="wp-block-button__link" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Voltar ao início', 'olorin' ); ?></a></div>
			<div class="wp-block-button is-style-o-contorno"><a class="wp-block-button__link" href="<?php echo esc_url( olorin_whatsapp_url() ); ?>" target="_blank" rel="noopener"><?php esc_html_e( 'Falar no WhatsApp', 'olorin' ); ?></a></div>
		</div>
	</div>
</main>
<?php
get_footer();
