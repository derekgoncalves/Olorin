<?php
/**
 * Formulário de busca.
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;
?>
<form role="search" method="get" class="o-search" action="<?php echo esc_url( home_url( '/' ) ); ?>">
	<label class="screen-reader-text" for="o-search-field"><?php esc_html_e( 'Buscar', 'olorin' ); ?></label>
	<input id="o-search-field" type="search" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="<?php esc_attr_e( 'Buscar no blog…', 'olorin' ); ?>">
	<button type="submit" class="o-btn o-btn--black"><?php esc_html_e( 'Buscar', 'olorin' ); ?></button>
</form>
