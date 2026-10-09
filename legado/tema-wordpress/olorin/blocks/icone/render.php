<?php
/**
 * Bloco "Ícone pixel".
 *
 * @package Olorin
 * @var array $attributes
 */

defined( 'ABSPATH' ) || exit;

$olorin_icon_slug = isset( $attributes['icone'] ) ? sanitize_key( $attributes['icone'] ) : 'pixel';
if ( ! array_key_exists( $olorin_icon_slug, olorin_icons() ) ) {
	$olorin_icon_slug = 'pixel';
}

printf(
	'<span %s></span>',
	get_block_wrapper_attributes(
		array(
			'class'       => 'o-icon o-icon--' . $olorin_icon_slug,
			'aria-hidden' => 'true',
		)
	)
);
