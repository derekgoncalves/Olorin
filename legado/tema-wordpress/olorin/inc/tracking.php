<?php
/**
 * Rastreamento (Google Tag Manager, GA4, Meta Pixel) com consentimento (LGPD).
 *
 * Preencha os IDs em Aparência → Personalizar → Olorin → Rastreamento e cookies.
 * - Google: carrega com "Consent Mode v2" em modo negado e só libera cookies
 *   depois que o visitante clica em "Aceitar".
 * - Meta Pixel: só carrega depois do "Aceitar".
 * - O banner de cookies só aparece se algum ID estiver preenchido.
 *
 * Eventos enviados ao dataLayer pelo tema (use como gatilho no GTM):
 *   olorin_whatsapp_click  { olorin_location }   clique em qualquer link de WhatsApp
 *   olorin_cta_click       { olorin_location, olorin_label }
 *   olorin_form_start / olorin_form_step { olorin_step }
 *   generate_lead          { olorin_services, olorin_budget, olorin_plan }
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

/**
 * Algum rastreamento configurado?
 *
 * @return bool
 */
function olorin_tracking_enabled() {
	return '' !== olorin_gtm_id() || '' !== olorin_ga4_id() || '' !== preg_replace( '/\D+/', '', (string) olorin_opt( 'pixel_id' ) );
}

/**
 * ID do GTM validado.
 *
 * @return string
 */
function olorin_gtm_id() {
	$id = strtoupper( trim( (string) olorin_opt( 'gtm_id' ) ) );
	return preg_match( '/^GTM-[A-Z0-9]{4,12}$/', $id ) ? $id : '';
}

/**
 * ID do GA4 validado.
 *
 * @return string
 */
function olorin_ga4_id() {
	$id = strtoupper( trim( (string) olorin_opt( 'ga4_id' ) ) );
	return preg_match( '/^G-[A-Z0-9]{4,14}$/', $id ) ? $id : '';
}

/**
 * Scripts no <head>.
 */
function olorin_tracking_head() {
	if ( ! olorin_tracking_enabled() || is_customize_preview() ) {
		return;
	}
	$gtm = olorin_gtm_id();
	$ga4 = olorin_ga4_id();
	?>
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
try{if(localStorage.getItem('olorin_consent')==='granted'){gtag('consent','update',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});}}catch(e){}
</script>
	<?php if ( $gtm ) : ?>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','<?php echo esc_js( $gtm ); ?>');</script>
	<?php endif; ?>
	<?php if ( $ga4 && ! $gtm ) : ?>
<script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr( $ga4 ); ?>"></script>
<script>gtag('js',new Date());gtag('config','<?php echo esc_js( $ga4 ); ?>');</script>
	<?php endif; ?>
	<?php
}
add_action( 'wp_head', 'olorin_tracking_head', 3 );

/**
 * GTM <noscript> logo após o <body>.
 */
function olorin_tracking_body() {
	$gtm = olorin_gtm_id();
	if ( ! $gtm || is_customize_preview() ) {
		return;
	}
	printf(
		'<noscript><iframe src="%s" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>' . "\n",
		esc_url( 'https://www.googletagmanager.com/ns.html?id=' . $gtm )
	);
}
add_action( 'wp_body_open', 'olorin_tracking_body', 1 );

/**
 * Banner de cookies (fica oculto até o JS decidir mostrar).
 */
function olorin_consent_banner() {
	if ( ! olorin_tracking_enabled() ) {
		return;
	}
	$privacy = get_privacy_policy_url();
	?>
	<div class="o-cookies" data-o-cookies hidden role="dialog" aria-modal="false" aria-labelledby="o-cookies-title">
		<p class="o-cookies__bar" id="o-cookies-title"><span>cookies.exe</span><span class="o-form__ctrl" aria-hidden="true"><i></i><i></i><i></i></span></p>
		<div class="o-cookies__body">
			<p>
				<?php echo esc_html( olorin_opt( 'cookies_texto' ) ); ?>
				<?php if ( $privacy ) : ?>
					<a href="<?php echo esc_url( $privacy ); ?>"><?php esc_html_e( 'Política de Privacidade', 'olorin' ); ?></a>
				<?php endif; ?>
			</p>
			<div class="o-cookies__actions">
				<button type="button" class="o-cookies__btn is-primary" data-o-cookies-accept><?php esc_html_e( 'Aceitar', 'olorin' ); ?></button>
				<button type="button" class="o-cookies__btn" data-o-cookies-reject><?php esc_html_e( 'Recusar', 'olorin' ); ?></button>
			</div>
		</div>
	</div>
	<?php
}
add_action( 'wp_footer', 'olorin_consent_banner', 5 );
