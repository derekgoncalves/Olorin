<?php
/**
 * Tema Olorin Digital — arquivo principal.
 *
 * Cada responsabilidade fica num arquivo próprio em /inc:
 *  - helpers.php     funções utilitárias (opções, WhatsApp, ícones, SVG)
 *  - setup.php       suportes do tema, menus, scripts/estilos, limpeza do <head>
 *  - customizer.php  Aparência → Personalizar → "Olorin": contato, rodapé, formulário, SEO, rastreamento
 *  - blocks.php      blocos próprios (ícone, portfólio, formulário), estilos de bloco e padrões
 *  - portfolio.php   tipo de conteúdo "Portfólio"
 *  - leads.php       recebimento do formulário, lista de leads no painel e exportação CSV
 *  - smtp.php        envio de e-mail autenticado (necessário na Locaweb)
 *  - seo.php         meta tags, Open Graph e dados estruturados (desligado se houver plugin de SEO)
 *  - tracking.php    GTM / GA4 / Meta Pixel com banner de consentimento (LGPD)
 *  - onboarding.php  monta a página inicial, o menu e a política de privacidade ao ativar o tema
 *
 * @package Olorin
 */

defined( 'ABSPATH' ) || exit;

define( 'OLORIN_VERSION', '1.0.0' );
define( 'OLORIN_DIR', get_template_directory() );
define( 'OLORIN_URI', get_template_directory_uri() );

require OLORIN_DIR . '/inc/helpers.php';
require OLORIN_DIR . '/inc/setup.php';
require OLORIN_DIR . '/inc/customizer.php';
require OLORIN_DIR . '/inc/blocks.php';
require OLORIN_DIR . '/inc/portfolio.php';
require OLORIN_DIR . '/inc/leads.php';
require OLORIN_DIR . '/inc/smtp.php';
require OLORIN_DIR . '/inc/seo.php';
require OLORIN_DIR . '/inc/tracking.php';
require OLORIN_DIR . '/inc/onboarding.php';
