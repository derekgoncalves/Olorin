<?php
/**
 * Configurações do formulário da VERSÃO ESTÁTICA do site Olorin.
 *
 * Edite este arquivo, salve e envie por FTP para a mesma pasta do index.html.
 * (Ele não aparece para visitantes: o servidor bloqueia o acesso direto.)
 */
return array(
	// Quem recebe os pedidos de orçamento.
	'email_destino'  => 'oi@olorindigital.com.br',

	// WhatsApp da agência: DDI + DDD + número, só números (ex.: 5541999998888).
	'whatsapp'       => '5541900000000',

	// SMTP da Locaweb (Hospedagem de Sites). Confira os dados no seu painel.
	'smtp_host'      => 'email-ssl.com.br',
	'smtp_porta'     => 465,
	'smtp_seguranca' => 'ssl', // 'ssl' (porta 465) ou 'tls' (porta 587).
	'smtp_usuario'   => '',    // e-mail completo da caixa criada na Locaweb (ex.: site@seudominio.com.br).
	'smtp_senha'     => '',    // senha dessa caixa.
	'remetente_nome' => 'Site Olorin',

	// Opções aceitas no campo "O que você precisa agora" (iguais às do formulário).
	'servicos'       => array(
		'Tráfego pago',
		'Redes sociais e conteúdo',
		'Identidade visual e criação',
		'Material impresso',
		'Site ou loja virtual',
		'Ainda não sei, quero conversar',
	),
);
