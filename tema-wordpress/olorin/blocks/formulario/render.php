<?php
/**
 * Bloco "Formulário de orçamento" (2 etapas).
 *
 * Funciona com e sem JavaScript: sem JS, envia para admin-post.php e volta com
 * ?orcamento=ok. Com JS, envia pela API (sem recarregar) e mostra a confirmação.
 *
 * @package Olorin
 * @var array $attributes
 */

defined( 'ABSPATH' ) || exit;

$olorin_services  = olorin_lines( olorin_opt( 'form_servicos' ) );
$olorin_budgets   = olorin_lines( olorin_opt( 'form_investimento' ) );
$olorin_privacy   = get_privacy_policy_url();
$olorin_sent      = isset( $_GET['orcamento'] ) && 'ok' === $_GET['orcamento']; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
$olorin_failed    = isset( $_GET['orcamento'] ) && 'erro' === $_GET['orcamento']; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
$olorin_uid       = 'o-form-' . wp_unique_id();
$olorin_wa_follow = olorin_whatsapp_url( __( 'Oi! Acabei de pedir um orçamento pelo site da Olorin e quero adiantar a conversa.', 'olorin' ) );

$olorin_consent = $olorin_privacy
	? sprintf(
		/* translators: %s: link Política de Privacidade */
		__( 'Concordo em ser contatado(a) pela Olorin sobre este pedido, conforme a %s.', 'olorin' ),
		'<a href="' . esc_url( $olorin_privacy ) . '" target="_blank" rel="noopener">' . esc_html__( 'Política de Privacidade', 'olorin' ) . '</a>'
	)
	: esc_html__( 'Concordo em ser contatado(a) pela Olorin sobre este pedido.', 'olorin' );
?>
<div <?php echo get_block_wrapper_attributes( array( 'class' => 'o-form' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> data-o-form>
	<div class="o-form__bar" aria-hidden="true">
		<span><?php echo esc_html( olorin_opt( 'form_barra' ) ); ?></span>
		<span class="o-form__ctrl"><i></i><i></i><i></i></span>
	</div>

	<form class="o-form__body" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" method="post" novalidate data-endpoint="<?php echo esc_url( rest_url( 'olorin/v1/lead' ) ); ?>"<?php echo $olorin_sent ? ' hidden' : ''; ?>>
		<input type="hidden" name="action" value="olorin_lead">
		<input type="hidden" name="olorin_ts" value="<?php echo esc_attr( (string) time() ); ?>">
		<input type="hidden" name="plano" value="">
		<?php foreach ( array( 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'pagina', 'referencia' ) as $olorin_hidden ) : ?>
			<input type="hidden" name="<?php echo esc_attr( $olorin_hidden ); ?>" value="">
		<?php endforeach; ?>

		<div class="o-form__progress">
			<span class="o-meter" aria-hidden="true"><i class="is-on"></i><i class="is-on"></i><i></i><i></i></span>
			<span class="o-form__steplabel" data-o-steplabel><?php esc_html_e( 'Etapa 1 de 2', 'olorin' ); ?></span>
		</div>

		<?php if ( $olorin_failed ) : ?>
			<p class="o-form__alert" role="alert"><?php esc_html_e( 'Não conseguimos registrar seu pedido. Confira os campos ou chame no WhatsApp.', 'olorin' ); ?></p>
		<?php endif; ?>

		<fieldset class="o-form__step" data-step="1">
			<legend class="screen-reader-text"><?php esc_html_e( 'Seus dados de contato', 'olorin' ); ?></legend>

			<div class="o-field">
				<label for="<?php echo esc_attr( $olorin_uid ); ?>-nome"><?php esc_html_e( 'Nome', 'olorin' ); ?></label>
				<input id="<?php echo esc_attr( $olorin_uid ); ?>-nome" name="nome" type="text" autocomplete="name" required maxlength="80" placeholder="<?php esc_attr_e( 'Seu nome', 'olorin' ); ?>">
				<p class="o-field__error" data-error-for="nome" hidden></p>
			</div>

			<div class="o-field">
				<label for="<?php echo esc_attr( $olorin_uid ); ?>-whatsapp"><?php esc_html_e( 'WhatsApp', 'olorin' ); ?></label>
				<input id="<?php echo esc_attr( $olorin_uid ); ?>-whatsapp" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel-national" required maxlength="20" placeholder="(41) 99999-9999">
				<p class="o-field__error" data-error-for="whatsapp" hidden></p>
			</div>

			<div class="o-field">
				<label for="<?php echo esc_attr( $olorin_uid ); ?>-site"><?php esc_html_e( 'Site ou @ do Instagram', 'olorin' ); ?> <span class="o-field__opt"><?php esc_html_e( '(opcional)', 'olorin' ); ?></span></label>
				<input id="<?php echo esc_attr( $olorin_uid ); ?>-site" name="site" type="text" maxlength="120" autocomplete="url" placeholder="<?php esc_attr_e( '@suamarca ou seusite.com.br', 'olorin' ); ?>">
			</div>

			<button type="button" class="o-form__next" data-o-next>
				<?php esc_html_e( 'Continuar', 'olorin' ); ?> <?php echo olorin_icon( 'seta' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</button>
		</fieldset>

		<fieldset class="o-form__step" data-step="2">
			<legend class="screen-reader-text"><?php esc_html_e( 'Sobre o seu projeto', 'olorin' ); ?></legend>

			<?php if ( $olorin_services ) : ?>
				<div class="o-field">
					<span class="o-field__label" id="<?php echo esc_attr( $olorin_uid ); ?>-servicos"><?php esc_html_e( 'O que você precisa agora', 'olorin' ); ?></span>
					<div class="o-chips" role="group" aria-labelledby="<?php echo esc_attr( $olorin_uid ); ?>-servicos">
						<?php foreach ( $olorin_services as $olorin_service ) : ?>
							<label class="o-chip">
								<input type="checkbox" name="servicos[]" value="<?php echo esc_attr( $olorin_service ); ?>">
								<span><?php echo esc_html( $olorin_service ); ?></span>
							</label>
						<?php endforeach; ?>
					</div>
				</div>
			<?php endif; ?>

			<?php if ( $olorin_budgets ) : ?>
				<div class="o-field">
					<label for="<?php echo esc_attr( $olorin_uid ); ?>-investimento"><?php esc_html_e( 'Quanto você investe em anúncio hoje', 'olorin' ); ?></label>
					<div class="o-select">
						<select id="<?php echo esc_attr( $olorin_uid ); ?>-investimento" name="investimento">
							<option value=""><?php esc_html_e( 'Selecione', 'olorin' ); ?></option>
							<?php foreach ( $olorin_budgets as $olorin_budget ) : ?>
								<option value="<?php echo esc_attr( $olorin_budget ); ?>"><?php echo esc_html( $olorin_budget ); ?></option>
							<?php endforeach; ?>
						</select>
					</div>
				</div>
			<?php endif; ?>

			<div class="o-field">
				<label for="<?php echo esc_attr( $olorin_uid ); ?>-mensagem"><?php esc_html_e( 'Me conta rapidinho o que você precisa', 'olorin' ); ?> <span class="o-field__opt"><?php esc_html_e( '(opcional)', 'olorin' ); ?></span></label>
				<textarea id="<?php echo esc_attr( $olorin_uid ); ?>-mensagem" name="mensagem" rows="3" maxlength="1500" placeholder="<?php esc_attr_e( 'Contexto, urgência, desafio…', 'olorin' ); ?>"></textarea>
			</div>

			<div class="o-field">
				<label class="o-consent">
					<input type="checkbox" name="consentimento" value="1" required>
					<span><?php echo wp_kses( $olorin_consent, array( 'a' => array( 'href' => true, 'target' => true, 'rel' => true ) ) ); ?></span>
				</label>
				<p class="o-field__error" data-error-for="consentimento" hidden></p>
			</div>

			<div class="o-hp" aria-hidden="true">
				<label><?php esc_html_e( 'Não preencha este campo', 'olorin' ); ?> <input type="text" name="empresa_url" tabindex="-1" autocomplete="off"></label>
			</div>

			<button type="submit" class="o-form__submit" data-o-submit><?php echo esc_html( olorin_opt( 'form_botao' ) ); ?></button>
			<p class="o-form__note"><?php echo esc_html( olorin_opt( 'form_nota' ) ); ?></p>
			<button type="button" class="o-form__back" data-o-back><?php esc_html_e( '← voltar', 'olorin' ); ?></button>
		</fieldset>

		<p class="o-form__status" role="status" aria-live="polite" data-o-status></p>
	</form>

	<div class="o-form__done" tabindex="-1" data-o-done<?php echo $olorin_sent ? '' : ' hidden'; ?>>
		<?php echo olorin_icon( 'o', 'o-form__done-icon' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<p class="o-form__done-title"><?php echo esc_html( olorin_opt( 'form_sucesso_titulo' ) ); ?></p>
		<p class="o-form__done-text"><?php echo esc_html( olorin_opt( 'form_sucesso_texto' ) ); ?></p>
		<a class="o-form__wa" href="<?php echo esc_url( $olorin_wa_follow ); ?>" target="_blank" rel="noopener" data-o-wa-follow>
			<?php echo olorin_icon( 'whatsapp' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?php esc_html_e( 'Adiantar pelo WhatsApp', 'olorin' ); ?>
		</a>
	</div>
</div>
