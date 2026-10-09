<?php
/**
 * Olorin Digital — MODELO de configuração do formulário (enviar.php).
 *
 * COMO USAR (faça você mesma, pelo FTP ou pelo Gerenciador de Arquivos da Locaweb):
 *
 *  1. Copie este arquivo com o nome  olorin-config.php
 *  2. Coloque-o UMA PASTA ACIMA do public_html (fora da pasta pública), se a Locaweb permitir.
 *     Se não der, salve como  config.php  dentro do public_html, ao lado do enviar.php
 *     (o .htaccess bloqueia a leitura pelo navegador).
 *  3. Troque  TROCAR_NO_SERVIDOR  pela senha da caixa digital@olorin.com.br.
 *     Digite a senha SÓ no servidor. Nunca mande a senha por WhatsApp, e-mail ou chat,
 *     nem salve em arquivo dentro do projeto do site.
 *
 * Se você já tem um config.php no servidor (da versão anterior do site), ele continua funcionando:
 * não precisa apagar nem substituir.
 */

return array(
	// Para onde vão os avisos de pedido novo.
	'email_destino'  => 'digital@olorin.com.br',

	// WhatsApp que aparece no aviso de pedido (só números, com 55 e DDD).
	'whatsapp'       => '5541996460861',

	// SMTP da Locaweb. Usuário = o e-mail completo. Senha = a senha dessa caixa.
	// Com a senha vazia (ou TROCAR_NO_SERVIDOR), o envio usa a função mail() do PHP.
	'smtp_host'      => 'email-ssl.com.br',
	'smtp_porta'     => 465,
	'smtp_seguranca' => 'ssl',
	'smtp_usuario'   => 'digital@olorin.com.br',
	'smtp_senha'     => 'TROCAR_NO_SERVIDOR',

	// Nome de quem "envia" o aviso.
	'remetente_nome' => 'Site Olorin',

	// Domínios aceitos no envio do formulário (proteção contra envio de outros sites).
	'dominios'       => array('olorin.com.br', 'www.olorin.com.br'),

	// Pasta das planilhas de pedidos. Vazio = automático: ../leads (fora do site) ou leads/ (bloqueada).
	'pasta_leads'    => '',

	// Opcional: endereço que recebe cada pedido em JSON (Zapier, Make, n8n, CRM). Vazio = desligado.
	'lead_webhook_url' => '',
);
