/*
 * OLORIN DIGITAL: IDS DE MEDIÇÃO E LINK DE AGENDAMENTO
 * ====================================================
 * Pode ser editado com o site no ar (WebFTP da Locaweb, pasta public_html).
 * Troque só o que está ENTRE AS ASPAS. Não apague vírgulas, aspas nem chaves.
 * Depois de salvar, abra o site numa janela anônima e aperte Ctrl+F5.
 *
 * GTM_ID .................. Google Tag Manager. Exemplo: "GTM-XXXXXXX"
 * GA4_ID .................. Google Analytics 4. Exemplo: "G-XXXXXXXXXX"
 * META_PIXEL_ID ........... Pixel da Meta, só números. Exemplo: "123456789012345"
 * GADS_CONVERSION_ID ...... Google Ads, ID de conversão. Exemplo: "AW-123456789"
 * GADS_CONVERSION_LABEL ... Google Ads, rótulo da conversão. Exemplo: "AbCdEfGhIjKlMnOp"
 * SCHEDULING_URL .......... Link de agenda (aparece na página de obrigado), com https://
 * GA4_E_PIXEL_PELO_GTM .... false (o normal) ou true, SEM aspas. Veja abaixo.
 *
 * COMO FUNCIONA (GA4_E_PIXEL_PELO_GTM: false, o normal):
 * - Em TODAS as páginas o site carrega sozinho o GA4 e o GTM, com os cookies desligados
 *   até a pessoa escolher no aviso (o GA4 conta a visita sem cookie; depois do aceite, completo).
 * - O Pixel da Meta só liga quando a pessoa aceita os cookies de Marketing.
 * - O site manda sozinho: page_view e eventos para o GA4; PageView, ViewContent, Contact
 *   e Lead para a Meta. No GTM, NÃO deixe tags de GA4 nem do Pixel ligadas (contaria tudo duas vezes).
 * - O contato novo (evento generate_lead / Lead) é contado quando a pessoa envia nome e WhatsApp.
 * GA4_E_PIXEL_PELO_GTM: true = o site carrega SÓ o GTM; aí GA4 e Pixel precisam estar dentro do GTM.
 *
 * Ao publicar um site novo (zip), guarde uma cópia deste arquivo e envie a sua de volta depois.
 */
window.OLORIN_IDS = {
	GTM_ID: "__GTM__",
	GA4_ID: "__GA4__",
	META_PIXEL_ID: "__PIXEL__",
	GADS_CONVERSION_ID: "",
	GADS_CONVERSION_LABEL: "",
	SCHEDULING_URL: "",
	GA4_E_PIXEL_PELO_GTM: false
};
