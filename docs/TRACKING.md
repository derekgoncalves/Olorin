# Rastreamento, consentimento e conversões · Olorin Digital

> **Data:** 09/10/2026, revisado em 14/10/2026 (IDs editáveis com o site no ar, `olorin-ids.js`) e em 23/10/2026 (GA4 e GTM em todas as páginas antes da escolha, com Consent Mode v2 avançado; Pixel da Meta direto, só com Marketing; páginas de obrigado por público; e-mail, empresa, cargo e porte no formulário) · **Base:** PROMPT.md, seção 13 (e 10.2, 10.4, 10.6, 11.1).
> **Código lido para escrever este guia:** `src/scripts/modulos/rastreamento.js`, `consentimento.js`, `ids.js`, `medicao.js`, `origem.js`, `formulario.js`, `interacoes.js`, `flutuantes.js`, `cabecalho.js`, `src/scripts/util.js`, `src/scripts/main.js`, `src/_includes/layouts/base.njk`, `src/_includes/partials/cookies.njk`, `src/servidor/olorin-ids.njk`, `src/_data/site/config.json`, `scripts/filtros.mjs` (função `waLink`), `src/php/enviar.njk` e `src/servidor/.htaccess`.
> **Arquivos que acompanham:** `gtm-container.json` (na raiz do projeto), o contêiner do Google Tag Manager pronto para importar, com as tags de GA4 e Pixel pausadas (seção 7), e `docs/RASTREAMENTO.txt`, o guia curto para o dono.
> Tudo o que está aqui descreve o que o código **faz de verdade**. Onde o código difere do PROMPT, isso está marcado como **Diferença** ou **Não implementado**, e a seção 12 junta tudo.

---

## 0. Resumo para o dono (sem termos técnicos)

O guia curto, para imprimir, está em `docs/RASTREAMENTO.txt`.

**Desde 23/10/2026 o site mede em todas as páginas.** Os IDs já estão no `config.json` e no `olorin-ids.js`: GTM `GTM-NDD92B4G`, GA4 `G-ZNZFCSGHZQ` e Pixel da Meta `1141955118186850`. O Google Ads ainda está vazio.

**Como funciona:**

1. A pessoa entra no site e vê o aviso de cookies com três botões do mesmo tamanho: **Aceitar tudo**, **Recusar** e **Personalizar**.
2. Logo depois que a página termina de carregar, mesmo antes da escolha, o site liga o **Google Analytics 4** e o **Google Tag Manager** no modo "sem cookies" (Consent Mode v2 avançado). Nesse modo o Google não grava cookie nem identificador: recebe só sinais anônimos, que ele usa para estimar as visitas. Se a pessoa aceitar **Análise**, a medição passa a ser completa.
3. O **Pixel da Meta** só carrega quando a pessoa libera **Marketing**. Se ela recusar, ele nunca carrega.
4. Cada página manda ao GA4 a visita (`page_view`) com o tipo da página, o nome da página e o público (`site`, `educacao` ou `influencer`). O Pixel manda `PageView` em toda página, `ViewContent` nas páginas de serviço e nas duas LPs, `Contact` no clique de WhatsApp e `Lead` no pedido enviado.
5. Pedido enviado: a página de obrigado do público (`/obrigado/`, `/obrigado-educacao/` ou `/obrigado-influenciadores/`) avisa o GA4 (`generate_lead`, com o público), a Meta (`Lead`) e o Google Ads (pelo GTM), uma vez só por envio. Se a pessoa ainda não respondeu ao aviso de cookies, a página espera a resposta por até 8 segundos (ou até ela sair da página).
6. Esses registros **nunca levam nome, telefone, e-mail, empresa ou cargo**.
7. O pedido que chega no seu e-mail traz o público no assunto, de onde a pessoa veio (Google Ads, Instagram, busca, indicação) e qual anúncio ou campanha.
8. Todo link de WhatsApp leva no fim da mensagem um código como `[ref: hero]`. Assim, quando a conversa chega, você sabe em qual botão a pessoa clicou.

**Para não contar em dobro:** o site já manda GA4 e Pixel direto. No seu GTM, **pause ou apague** as tags de GA4 (Tag do Google e eventos do GA4) e as do Pixel da Meta. Deixe no GTM só o que o site não faz: Google Ads e ferramentas extras (seção 7). O `gtm-container.json` do projeto já vem assim.

**O que você precisa fazer (uma vez):**

1. No GTM: pausar ou apagar as tags de GA4 e da Meta (ou importar o `gtm-container.json` em **Mesclar**) e publicar (seção 7.4).
2. No GA4: marcar `generate_lead` como **evento-chave**, desligar "Interações com formulários" na medição otimizada e criar as dimensões (seções 8.2 e 9).
3. Na Meta: usar `Lead` como conversão das campanhas e deixar a correspondência avançada automática desligada (seção 8.3).
4. Google Ads, quando for anunciar: criar a conversão e colar ID e rótulo no `olorin-ids.js` (seção 8.4).
5. Testar com o **Tag Assistant** e o **Meta Pixel Helper** (seção 10).

> **Modo antigo (tudo pelo GTM):** se um dia preferir que GA4 e Pixel fiquem só dentro do GTM, mude no `olorin-ids.js` para `GA4_E_PIXEL_PELO_GTM: true` e despause as tags do contêiner. Nesse modo o site carrega só o GTM. Nunca deixe os dois ligados ao mesmo tempo.

---

## 1. Visão geral (técnico)

```
Página carrega
  ├─ <head>: window.OLORIN_CONFIG = { gtm, ga4, pixel, adsId, adsLabel, ga4PeloGtm, modo, slug, segmento, ... } (build)
  │          data-form-variant="a|b" no <html> (sorteio A/B antes da primeira pintura)
  ├─ /olorin-ids.js (defer) → window.OLORIN_IDS = { GTM_ID, GA4_ID, ..., GA4_E_PIXEL_PELO_GTM } (editável no servidor)
  ├─ main.js (defer) → aplicarIds() → iniciarConsentimento()
  │     ├─ sem nenhum ID (gtm/ga4/pixel/adsId) → para aqui: sem aviso, nada carrega
  │     └─ com ID:
  │          consent default (tudo 'denied', wait_for_update 500) nas DUAS filas:
  │              window.dataLayer (lida pelo GTM) e window.olorinGtag (lida pelo gtag.js do GA4)
  │          escolha salva de antes? → consent update na hora
  │          depois do evento load (ou 3,5 s), quando o navegador fica livre:
  │             ├─ gtag.js?id=G-...&l=olorinGtag + gtag('config', GA4, { page_mode, page_slug, segmento, form_variant })
  │             └─ dataLayer.push({ page_mode, page_slug, segmento, form_variant }) e gtm.js?id=GTM-...
  ├─ track(evento, params) → window.dataLayer.push({ event, ... })   ← sempre
  │                         └─ com o GA4 do site: gtag('event', evento, { ..., send_to: GA4 }) na fila olorinGtag
  └─ escolha que libera Marketing → fbevents.js + fbq('init') + PageView (+ ViewContent) + fila do Pixel
```

**Por que duas filas.** O gtag.js do GA4 usa a fila própria `window.olorinGtag` (parâmetro `l=olorinGtag` na URL). O GTM lê só `window.dataLayer`, então nunca vê os comandos `gtag('event')` do GA4 e não os repete. O `dataLayer` continua recebendo todos os eventos da seção 4 (com `event`), que servem de gatilho para as tags do GTM (Google Ads e extras). O consentimento vai para as duas filas.

**Quem manda o quê** (`modoDireto` no `consentimento.js`):

| `GA4_E_PIXEL_PELO_GTM` | `GTM_ID` | O site carrega | GA4 e Pixel | Google Ads |
|---|---|---|---|---|
| `false` (padrão) | preenchido | gtag.js e gtm.js antes da escolha; Pixel com Marketing | o site, direto | o GTM (tags 19 e 20 do contêiner) |
| `false` | vazio | gtag.js (com o Ads, se houver `GADS_CONVERSION_ID`); Pixel com Marketing | o site, direto | o site (conversão nas páginas de obrigado) |
| `true` | preenchido | só gtm.js | o GTM (despause as tags de GA4 e Pixel) | o GTM |
| `true` | vazio | igual à segunda linha (o modo antigo só vale com GTM) | o site | o site |

Os eventos ficam na fila `window.dataLayer` desde o início da página. Antes do GTM carregar, nada sai do navegador. Com consentimento negado, o GA4 e o Google Ads só mandam pings sem cookies (parâmetro `gcs=G100`), sem `_ga` nem `_gcl`.

---

## 2. Onde fica cada ID

### 2.1 O arquivo `olorin-ids.js` (editável com o site no ar)

No servidor: **`public_html/olorin-ids.js`**. No projeto, ele é gerado por `src/servidor/olorin-ids.njk` e sai em `dist/olorin-ids.js`, com os valores do `src/_data/site/config.json`. Todas as páginas carregam esse arquivo com `defer`, **antes** do JavaScript principal (scripts com `defer` rodam na ordem do HTML). Cada campo preenchido e válido substitui o valor do build; campo vazio mantém o do build; formato errado é ignorado, com aviso `[olorin-ids]` no console.

O conteúdo editável é só este bloco (valores de 23/10/2026):

```js
window.OLORIN_IDS = {
	GTM_ID: "GTM-NDD92B4G",
	GA4_ID: "G-ZNZFCSGHZQ",
	META_PIXEL_ID: "1141955118186850",
	GADS_CONVERSION_ID: "",
	GADS_CONVERSION_LABEL: "",
	SCHEDULING_URL: "",
	GA4_E_PIXEL_PELO_GTM: false
};
```

| Campo | Formato aceito | Exemplo | O que o site faz com ele |
|---|---|---|---|
| `GTM_ID` | `GTM-` + letras/números | `GTM-XXXXXXX` | Carrega o GTM em todas as páginas, depois do `load`, antes da escolha (consentimento negado até o aceite). Com GTM, o Google Ads fica no contêiner |
| `GA4_ID` | `G-` + letras/números | `G-XXXXXXXXXX` | Carrega o gtag.js do GA4 (fila `olorinGtag`) em todas as páginas: `page_view` com `page_mode`, `page_slug`, `segmento` e `form_variant`, e todos os eventos da seção 4 |
| `META_PIXEL_ID` | só números (6 a 20) | `123456789012345` | Carrega o Pixel quando Marketing é liberado: `PageView`, `ViewContent`, `Contact` e `Lead` |
| `GADS_CONVERSION_ID` | números, com ou sem `AW-` | `AW-123456789` | Fica em `OLORIN_CONFIG.adsId` (`AW-123456789`) e `OLORIN_CONFIG.adsNumero` (`123456789`). Com GTM, o contêiner lê esse valor; sem GTM, o site carrega a tag do Ads com Marketing |
| `GADS_CONVERSION_LABEL` | letras, números, `_` e `-` | `AbCdEfGhIjKlMnOp` | Rótulo da conversão, enviada uma vez por pedido nas 3 páginas de obrigado (pelo GTM, ou pelo site sem GTM) |
| `SCHEDULING_URL` | começa com `https://` | `https://calendly.com/...` | Mostra o botão de agendar horário nas páginas de obrigado (abre em nova aba) |
| `GA4_E_PIXEL_PELO_GTM` | `true` ou `false`, sem aspas | `false` | `false` (o normal): o site manda GA4 e Pixel direto e o GTM fica para Google Ads e extras. `true`: modo antigo, o site carrega só o GTM e GA4 e Pixel precisam estar (despausados) no contêiner |

Cache: o `.htaccess` manda o navegador conferir o `olorin-ids.js` a cada visita (`Cache-Control: no-cache`, sem `Expires`). Ele é pequeno e não atrapalha a primeira pintura (`defer`).

**Os IDs ficam num lugar só.** As variáveis do contêiner leem `OLORIN_CONFIG` (seção 7.1), então trocar um ID no `olorin-ids.js` vale para o site e para o GTM.

**Ao publicar um zip novo:** o zip traz um `olorin-ids.js` com os valores do `config.json`. Antes de subir, baixe o seu `olorin-ids.js` do servidor e, depois de descompactar, envie de volta (ou copie os IDs também para o `config.json` do projeto, e o zip já sai com eles).

### 2.2 `config.json` (valores do build)

Arquivo: `src/_data/site/config.json`. Os mesmos campos (`GTM_ID`, `GA4_ID`, `META_PIXEL_ID`, `GADS_CONVERSION_ID`, `GADS_CONVERSION_LABEL`, `SCHEDULING_URL`) entram no HTML como `window.OLORIN_CONFIG` e viram os valores iniciais do `olorin-ids.js`. Mudou o `config.json`? Rode `npm run build` e publique. O `olorin-ids.js` do servidor, se preenchido, continua valendo por cima.

### 2.3 Guia rápido para o dono (WebFTP)

```
COMO TROCAR OS IDS DE MEDIÇÃO E O LINK DE AGENDA (com o site no ar)
1. Entre no WebFTP da Locaweb e abra a pasta public_html.
2. Ache o arquivo olorin-ids.js. Use "Editar" do WebFTP, ou baixe, abra no
   Bloco de Notas, altere e envie de volta substituindo o antigo.
3. Troque só o que está entre as aspas. Não apague vírgulas, aspas nem chaves.
   GTM_ID: "GTM-XXXXXXX"                  Google Tag Manager
   GA4_ID: "G-XXXXXXXXXX"                 Google Analytics 4
   META_PIXEL_ID: "123456789012345"       Pixel da Meta
   GADS_CONVERSION_ID: "AW-123456789"     ID de conversão do Google Ads
   GADS_CONVERSION_LABEL: "AbCdEfGhIjKl"  rótulo dessa conversão
   SCHEDULING_URL: "https://calendly.com/..."  link de agenda do obrigado
   GA4_E_PIXEL_PELO_GTM: false            deixe false (sem aspas)
   Campo vazio ("") = desligado.
4. Salve. Abra olorin.com.br numa janela anônima e aperte Ctrl+F5.
5. Conferir: o aviso de cookies aparece. Clique em Aceitar tudo e confira no
   Tag Assistant e no Meta Pixel Helper. Se nada mudar, aperte F12 > Console:
   "[olorin-ids]" avisa qual campo está com formato errado.
6. Ao subir um zip novo do site, baixe antes o seu olorin-ids.js e envie de
   volta depois de descompactar.
```

---

## 3. Consentimento (LGPD) e Consent Mode v2

### 3.1 Quando o aviso aparece

- O HTML do aviso (`partials/cookies.njk`) vai em **todas** as páginas, escondido (`hidden`), porque os IDs podem chegar pelo `olorin-ids.js` sem novo build. O JavaScript só o mostra quando existe algum ID (`gtm`, `ga4`, `pixel` ou `adsId`, do build ou do arquivo) e **não há escolha salva**.
- O botão **"Preferências de cookies"** do rodapé e o botão "Abrir preferências de cookies" da política (seção 7 da política) seguem a mesma regra: vêm escondidos (`data-o-cookies-link`) e aparecem quando há algum ID.
- Sem JavaScript: o aviso não aparece e nenhuma ferramenta carrega (tudo depende de JS).
- O texto do aviso diz "Sem a sua permissão, nenhum cookie de medição é gravado." (e não mais "Nada disso liga antes da sua escolha"), e a política de privacidade (seções 3, 4, 5, 6 e 7) descreve os sinais sem cookies do Consent Mode avançado.
- Visual: caixa fixa no canto inferior (`position: fixed`), por isso não empurra o conteúdo (sem CLS). Em telas de até 767 px fica 68 px acima da barra fixa de WhatsApp/orçamento, para não cobrir o botão principal (`responsivo.css`).
- É um `role="dialog"` não modal: a pessoa pode usar o site sem responder. `Esc` fecha o aviso **só se já houver uma escolha salva**.

### 3.2 O que cada botão faz

| Botão | Análise | Marketing |
|---|---|---|
| Aceitar tudo | sim | sim |
| Recusar | não | não |
| Personalizar → marcar e "Salvar escolha" | o que marcar | o que marcar |

- A escolha fica no `localStorage`, chave `olorin_consentimento`, no formato `{ "analise": true, "marketing": false, "data": "2026-10-09T12:00:00.000Z" }`.
- "Preferências de cookies" no rodapé reabre o aviso com as três ações (as caixas de "Personalizar" já vêm com a escolha atual).
- **Não implementado:** a escolha não expira. Não há lógica para pedir de novo depois de um tempo (por exemplo, 12 meses). A data é só guardada.

### 3.3 Consent Mode v2 avançado (como está no código)

Assim que o `main.js` roda (e só se houver algum ID, do build ou do `olorin-ids.js`), nas duas filas (`dataLayer` e `olorinGtag`):

```js
gtag('consent', 'default', {
  ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  analytics_storage: 'denied', wait_for_update: 500
});
```

Na fila do gtag.js entra também `gtag('set', 'ads_data_redaction', true)`: sem Marketing, os pings de anúncio vão sem identificadores.

Quando há escolha (salva de antes ou feita agora), nas duas filas:

```js
gtag('consent', 'update', {
  analytics_storage: analise ? 'granted' : 'denied',
  ad_storage: marketing ? 'granted' : 'denied',
  ad_user_data: marketing ? 'granted' : 'denied',
  ad_personalization: marketing ? 'granted' : 'denied'
});
```

- "Avançado" quer dizer que as tags do Google carregam antes da escolha e mandam só pings sem cookies enquanto o consentimento estiver negado. É o que permite a modelagem de conversões do Google.
- O evento `consent_update` (com `analytics` e `marketing`) só é enviado quando a pessoa **decide no aviso**. Em visitas seguintes, o `update` é aplicado sem esse evento.
- Não há `region` nem `url_passthrough`.

### 3.4 Quando cada ferramenta carrega

| Ferramenta | Quando carrega | Condição |
|---|---|---|
| gtag.js do GA4 | depois do `load` (ou 3,5 s, o que vier antes), quando o navegador fica livre; não atrasa o LCP | `GA4_ID` e o modo do site (`GA4_E_PIXEL_PELO_GTM: false`, ou sem GTM) |
| GTM | igual | `GTM_ID` |
| Google Ads pelo site | junto com o gtag.js | sem GTM e com `GADS_CONVERSION_ID` |
| Pixel da Meta | quando a escolha libera Marketing (na hora, se já estava salva), depois do `load` | `META_PIXEL_ID` e o modo do site |
| Recusar | GA4 e GTM continuam carregados, só com pings sem cookies; o Pixel não carrega | qualquer |

**Pixel da Meta (direto):**

| Evento | Quando | Parâmetros |
|---|---|---|
| `PageView` | toda página, ao carregar o Pixel (inclusive a página do aceite) | nenhum |
| `ViewContent` | páginas de serviço (`modo: servico`), landings `promo-*`, LP Educação e LP de influenciadores | `content_name` = slug; `content_category` = `servico`, `educacao` ou `influencer` |
| `Contact` | clique em qualquer link de WhatsApp (junto com o `whatsapp_click`) | nenhum |
| `Lead` | página de obrigado, uma vez por envio | `content_category` = segmento |

`Contact` e `Lead` feitos antes do Pixel carregar esperam numa fila e só saem se Marketing estiver liberado. Se a pessoa retirar o Marketing pelo rodapé, o Pixel recebe `fbq('consent', 'revoke')`.

**Conversão sem resposta ao aviso.** Se a pessoa envia o formulário sem ter respondido ao aviso, a página de obrigado espera a escolha (por até 8 s, ou até a pessoa sair da página) e só então manda `generate_lead`, `Lead` e a conversão do Ads, já com o consentimento certo. O envio fica marcado como contado na hora, então recarregar não repete.

**Limitação:** se a pessoa retirar o consentimento no meio da página, o que já carregou continua na memória até a próxima página; as tags do GTM com consentimento param de disparar e o Pixel recebe `revoke`.

---

## 4. Eventos enviados ao `dataLayer`

### 4.1 A função `track()` e os parâmetros comuns

**Desde 23/10/2026:** todo evento leva também `segmento` (`site`, `educacao` ou `influencer`), e o filtro barra também parâmetros com `empresa`, `cargo` e `perfil` no nome. O `generate_lead` leva ainda `porte` e `desafios` (opções marcadas, em texto). Com o GA4 do site, cada evento também vai ao GA4 por `gtag('event')` (seção 1), com textos cortados em 100 caracteres, `true`/`false` em texto e sem as UTMs (o GA4 já lê a campanha da URL).

Todos os eventos passam por uma função única, `track(evento, params)` (`rastreamento.js`). Ela monta:

```js
{
  event: '<nome>',
  page_mode: OLORIN_CONFIG.modo,         // home | servico | hub | sobre | promo | obrigado | simples | erro
  page_slug: OLORIN_CONFIG.slug,         // ex.: home, servico-trafego-pago, promo-trafego-pago, obrigado
  form_variant: <html data-form-variant>,// a | b
  utm_source, utm_medium, utm_campaign,  // só se a sessão tiver UTM (último toque)
  ...params                              // os do evento, depois do filtro de dados pessoais
}
```

**Filtro de dados pessoais** (só nos `params` do evento):

- descarta qualquer parâmetro cujo **nome** contenha `nome`, `name`, `whatsapp`, `telefone`, `phone`, `email`, `e-mail` ou `mensagem`;
- descarta qualquer **valor de texto** que pareça e-mail (`algo@algo.algo`) ou telefone (10 ou mais dígitos, com ou sem espaço, parênteses, ponto ou hífen).

`track()` grava no `dataLayer` **sempre**, mesmo sem IDs e sem consentimento. É só uma lista na memória da aba; nada é enviado sem o GTM ou o gtag carregados.

### 4.2 Tabela de eventos (o que o código faz)

| Evento | Quando dispara | Parâmetros enviados | Onde está |
|---|---|---|---|
| `cta_click` | Clique em `<a>` ou `<button>` com `id` começando por `cta-` **ou** com atributo `data-cta` | `cta_id`, `cta_label` (texto do botão, até 60 caracteres), `cta_position` (`data-secao` do bloco mais próximo, ou `header`/`footer`/`nav`/`aside`, ou `pagina`), `destino` (`whatsapp` para links `wa.me`; senão o `href`) | `medicao.js` |
| `whatsapp_click` | Clique em qualquer link cujo `href` começa com `https://wa.me/` | `origem` (o texto de `[ref: ...]`; `sem-ref` se não houver), `servico` (atributo `data-servico` do link; senão o `slug` da página sem o prefixo `servico-`/`promo-`) | `medicao.js` |
| `service_card_click` | Clique no link de um card de serviço (`data-o-card-servico`), na home e no hub | `servico` (slug) | `medicao.js` |
| `form_view` | Formulário 50% visível, uma vez por formulário por página | `posicao` (`topo` \| `fim` \| `promo`) | `formulario.js` |
| `form_start` | Primeiro foco em qualquer campo do formulário | `posicao` | `formulario.js` |
| `form_step1_complete` | "Continuar" com nome e WhatsApp válidos | `posicao` | `formulario.js` |
| `form_error` | Um evento por campo inválido na validação; um por campo recusado pelo servidor; um sem campo se o servidor recusar sem detalhar ou a conexão cair | `campo` (`nome`, `whatsapp`, `consentimento`, outro campo do servidor, ou vazio), `tipo` (`validacao` \| `servidor` \| `conexao`), `posicao` | `formulario.js` |
| `generate_lead` | Na `/obrigado/`, se a sessão tem um envio pendente com token ainda não registrado. Uma vez por envio; recarregar não repete | `plano`, `servicos` (marcados, separados por vírgula), `verba_faixa` (texto da faixa escolhida, ex.: `De R$ 2 a 5 mil por mês`), `servico_pagina`, `posicao` | `formulario.js` grava; `medicao.js` envia |
| `pricing_plan_click` | Clique em "Quero esse" (`a[data-o-plano]`) | `plano` (`pontual` \| `gestao-mensal` \| `360-completo`) | `interacoes.js` |
| `calculator_use` | Cada mudança na calculadora da home (seção `#orcamento-calculadora`; o cálculo inicial não conta) | `escolhas` (as respostas juntas, separadas por ` \| `), `frente`, `verba` e `objetivo` (cada resposta em texto), `primeira_vez` (`true` só na primeira mudança). O botão da calculadora (`cta-whatsapp-calculadora`) abre o WhatsApp com as respostas e gera `whatsapp_click` (`origem: calculadora`) e `Contact` | `interacoes.js` |
| `faq_open` | Pergunta aberta (`<details>` passa para aberto) | `pergunta_id` (o `id` da pergunta) | `interacoes.js` |
| `scroll_depth` | 25, 50, 75 e 90% da página, uma vez cada | `percent` (número) | `medicao.js` |
| `section_view` | Bloco com `data-secao` 40% visível, uma vez por página | `secao` (ex.: `hero`, `planos`, `orcamento`, `servico-hero`, `preco`, `faq-servico`, `promo-hero`, `obrigado`) | `medicao.js` |
| `consent_update` | Quando a pessoa decide no aviso (não em visitas com escolha salva) | `analytics`, `marketing` (verdadeiro/falso) | `consentimento.js` |

Observações:

- Um clique pode gerar **dois eventos**: um link de WhatsApp com `id="cta-whatsapp-..."` gera `whatsapp_click` e `cta_click`; "Quero esse" gera `pricing_plan_click` e `cta_click` (`data-cta="planos-<plano>"`).
- `generate_lead` depende do envio pelo JavaScript (`fetch`). Se o formulário for enviado do jeito tradicional (sem JS, ou navegador sem `fetch`/`FormData`), o `enviar.php` redireciona para `/obrigado/`, mas **não há token na sessão e o `generate_lead` não dispara**. O pedido chega por e-mail e CSV normalmente.
- Abrir a `/obrigado/` direto (sem envio) não gera `generate_lead`.

### 4.3 Diferenças em relação à tabela 13.4 do PROMPT

| # | O que o PROMPT pede | O que o código faz |
|---|---|---|
| 1 | Parâmetros comuns com "UTMs guardadas" | Envia só `utm_source`, `utm_medium` e `utm_campaign` do **último toque**. `utm_content`, `utm_term`, `gclid`, `gbraid`, `wbraid` e `fbclid` vão só para o formulário |
| 2 | `page_mode: "campanha"` nas landings `/promo/` (PROMPT 11.1) | O `<body>` tem `data-mode="campanha"`, mas o `dataLayer` recebe `page_mode: "promo"` (vem de `OLORIN_CONFIG.modo`) |
| 3 | `cta_click` para "CTA com ID `cta-*`" | Também dispara para qualquer elemento com `data-cta` (ex.: `planos-pontual`, `metodo-diagnostico`, `hub-planos`, `promo-final`, `servico-<slug>-preco`) |
| 4 | `whatsapp_click` com `servico` | Fora das páginas de serviço/campanha, `servico` recebe o slug da página (`home`, `sobre`, `obrigado`, `404`, `promo`) |
| 5 | `form_error` com `campo`, `tipo` | Também envia `posicao` (a mais) |
| 6 | `generate_lead` com `plano`, `servicos`, `verba_faixa`, `servico_pagina` | Também envia `posicao` (a mais) |
| 7 | `calculator_use` com `plano`, `verba_faixa` | Desde 23/10/2026 envia `escolhas`, `frente`, `verba`, `objetivo` e `primeira_vez` (a calculadora não tem mais planos e o botão leva ao WhatsApp, não ao formulário) |
| 8 | (não pede) | `cta_label` some quando o texto do botão parece telefone. Ex.: o link do rodapé "WhatsApp (41) 99646-0861" (`cta-whatsapp-rodape`) chega **sem** `cta_label`, porque o filtro de dados pessoais confunde o telefone da empresa com dado pessoal |
| 9 | (não pede) | `faq_open` também dispara quando a pergunta abre pelo endereço (`/#id-da-pergunta`), sem clique. A primeira pergunta de cada lista já vem aberta no HTML; confira no teste se isso gera um `faq_open` sem clique (seção 10, teste 9) |
| 10 | (não pede) | Se o envio for tentado com a etapa 1 inválida, o código chama a validação **duas vezes** seguidas (`formulario.js`, no `submit`) e gera `form_error` em dobro para cada campo. Só acontece em caminhos raros (a etapa 1 normalmente é validada no "Continuar") |

---

## 5. Origem da visita: UTM, gclid e companhia

Arquivo: `origem.js`. Chave na sessão: `sessionStorage['olorin_origem']`.

**O que é guardado** (em toda página, na primeira vez que o código pede a origem):

| Item | Como |
|---|---|
| `ultimo` (último toque) | Se a URL tem algum de `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `gbraid`, `wbraid`, `fbclid`, o conjunto **inteiro** substitui o anterior. Cada valor é cortado em 255 caracteres |
| `primeiro` (primeiro toque) | O primeiro conjunto de parâmetros visto na sessão. Nunca é sobrescrito |
| `entrada` | O caminho da primeira página da sessão (ex.: `/servicos/trafego-pago/`) |
| `referencia` | O primeiro `document.referrer` de **outro** site (até 300 caracteres) |

**Limitação:** é `sessionStorage`, então vale **enquanto a aba estiver aberta**. Se a pessoa veio por um anúncio ontem e voltou hoje digitando o endereço, o "primeiro toque" de ontem não existe mais. Guardar entre visitas (cookie ou `localStorage`) **não foi implementado**.

**Como chega no formulário** (campos ocultos preenchidos ao abrir a página):

| Campo oculto | Valor |
|---|---|
| `utm_source` … `utm_term`, `gclid`, `gbraid`, `wbraid`, `fbclid` | Último toque |
| `primeiro_toque` | Texto único, ex.: `utm_source=google&utm_medium=cpc&utm_campaign=x \| entrada=/servicos/trafego-pago/` (até 500 caracteres) |
| `referencia` | Site de onde veio |
| `pagina` | Caminho da página do envio |
| `modo_pagina`, `servico_pagina`, `posicao_formulario` | Do template (`home`/`servico`/`promo`/`sobre`…, slug do serviço, `topo`/`fim`/`promo`) |
| `variante_formulario` | `a` ou `b` |
| `plano` | Preenchido ao clicar em "Quero esse" |
| `olorin_ts`, `olorin_tempo` | Hora de abertura e segundos até o envio (anti-robô) |

O `enviar.php` grava tudo no e-mail e no CSV e monta o assunto `Novo lead: {serviço ou plano} | {origem}`, onde a origem é, nesta ordem: `utm_source/utm_medium`; `google ads` (se houver gclid/gbraid/wbraid); `meta` (se houver fbclid); o domínio de `referencia`; ou `site (direto)`.

Para o Google Ads preencher o `gclid`, a **codificação automática** precisa estar ligada na conta do Google Ads (seção 8.4).

---

## 6. Links de WhatsApp e o sufixo `[ref: ...]`

**Refs por público (23/10/2026):** nas LPs, o botão flutuante e a barra do celular usam `educacao-flutuante` e `educacao-barra-mobile` ou `influencer-flutuante` e `influencer-barra-mobile`, com a mensagem do público, e o Raio-X da barra vai a `#raio-x`. O link "Chame no WhatsApp" embaixo do formulário usa o `origemWa` que a página passa (ex.: `influencer-form-raio-x`) ou, por padrão, `<segmento>-form-<posição>` nas LPs e `form-<posição>` no site. O link do erro de envio usa `<segmento>-form-erro-<posição>`. As páginas de obrigado usam `obrigado`, `obrigado-educacao` e `obrigado-influencer`, e os flutuantes delas `obrigado-flutuante`, `obrigado-educacao-flutuante`, `obrigado-influencer-barra-mobile` etc.

Todos os links de WhatsApp do HTML são gerados por `waLink(origem, contexto)` (`scripts/filtros.mjs`), no build:

```
https://wa.me/5541996460861?text=<mensagem pertinente> [ref: <origem>]
```

Exemplo: `Oi! Vim pelo site da Olorin e quero falar sobre Tráfego pago. [ref: servico-trafego-pago-hero]`.

No navegador, `origemWhatsApp()` (`util.js`) lê o que está entre `[ref: ` e `]` e manda como `origem` no `whatsapp_click`. O único link montado pelo JavaScript é o do erro de envio do formulário (`linkWhatsApp()`), que leva os dados já digitados na **mensagem do WhatsApp** (nunca no `dataLayer`) e a origem `form-erro-<posicao>`.

Conferi no `dist/` atual: todos os links `wa.me` têm `[ref: ...]`.

**Origens que existem no código:**

| Origem | Onde |
|---|---|
| `hero` | Banner da home |
| `topo` | Botão de WhatsApp do cabeçalho |
| `menu` | Menu do celular |
| `barra-mobile` | Barra fixa do celular |
| `flutuante` | Botão flutuante |
| `servicos-faixa` | Faixa da seção de serviços da home |
| `faq` | Seção de dúvidas da home |
| `equipe` | Seção da equipe |
| `form-topo`, `form-fim` | Link "prefere WhatsApp?" dos formulários da home |
| `orcamento-final` | Telefone ao lado do formulário final da home |
| `rodape` | Rodapé completo |
| `sobre`, `sobre-form`, `sobre-final` | Página Sobre |
| `servico-<slug>-hero`, `-form-topo`, `-form-fim`, `-final`, `-faq` | Páginas de serviço |
| `promo-form`, `promo-final` | `/promo/` |
| `promo-<slug>-form`, `promo-<slug>-final` | `/promo/<slug>/` |
| `promo-rodape` | Rodapé mínimo das landings |
| `obrigado` | `/obrigado/` (também é o link que o `enviar.php` devolve no JSON) |
| `404` | Página de erro |
| `form-erro-<posicao>` | Link criado pelo JS quando o envio falha |

**Diferenças em relação ao PROMPT 13.4:**

- **Não implementado:** `planos-{plano}`. Os botões dos planos ("Quero esse") levam ao formulário, não ao WhatsApp. O nome `planos-<plano>` existe só como `data-cta`, no evento `cta_click`.
- Origens a mais: `topo`, `menu`, `servicos-faixa`, `form-*`, `orcamento-final`, `sobre-form`, `sobre-final`, `promo-rodape`, `form-erro-*`.
- Nas campanhas, o código usa `promo-<slug>-<posicao>` além de `promo-<posicao>`.

---

## 7. O contêiner do GTM (`gtm-container.json`)

Arquivo de exportação do GTM (`exportFormatVersion: 2`), gerado por script a partir dos nomes reais de eventos e parâmetros do código. Validado com `JSON.parse` e com uma checagem de referências. **Não foi importado num GTM real** (não há acesso à conta): importe em **Mesclar** e confira na visualização.

**Desde 23/10/2026 (modo padrão, `GA4_E_PIXEL_PELO_GTM: false`):** o site manda GA4 e Pixel direto. Por isso as 18 tags de GA4 e do Pixel vêm **pausadas**, com a nota "PAUSADA de propósito". Ficam **ativas** só as 2 do Google Ads. Use o GTM para o que o site não faz: Google Ads e ferramentas extras (Clarity, LinkedIn, Hotjar), disparadas pelos eventos do `dataLayer`.

### 7.1 Variáveis

| Tipo | Nome | Valor |
|---|---|---|
| Variável JavaScript | `GA4 - ID` | `OLORIN_CONFIG.ga4` (o `GA4_ID` do `olorin-ids.js`). Só usada no modo `true` |
| Variável JavaScript | `Meta Pixel - ID` | `OLORIN_CONFIG.pixel` (o `META_PIXEL_ID`). Só usada no modo `true` |
| Variável JavaScript | `Google Ads - ID de conversão` | `OLORIN_CONFIG.adsNumero` (os números do `GADS_CONVERSION_ID`, sem `AW-`) |
| Variável JavaScript | `Google Ads - Rótulo de conversão` | `OLORIN_CONFIG.adsLabel` |
| Variável JavaScript | `JS - modo da página` e `JS - slug da página` | `OLORIN_CONFIG.modo` e `OLORIN_CONFIG.slug` |
| Camada de dados (v2) | `DLV - <nome>` (31) | `page_mode`, `page_slug`, `form_variant`, `utm_source`, `utm_medium`, `utm_campaign`, `cta_id`, `cta_label`, `cta_position`, `destino`, `origem`, `servico`, `posicao`, `campo`, `tipo`, `plano`, `servicos`, `verba_faixa`, `servico_pagina`, `primeira_vez`, `pergunta_id`, `percent`, `secao`, `analytics`, `marketing`, `segmento`, `porte` e, da calculadora, `escolhas`, `frente`, `verba` e `objetivo` |

Nenhum ID fica escrito no contêiner. "Variável JavaScript" só lê uma variável global; não é "JavaScript personalizado" e não precisa de `'unsafe-eval'` na CSP. O site põe `page_mode`, `page_slug`, `segmento` e `form_variant` no `dataLayer` **antes** do `gtm.js`, então as variáveis `DLV - ...` já têm valor no carregamento do contêiner.

### 7.2 Gatilhos

| Gatilho | Tipo | Condição |
|---|---|---|
| `Evento - <nome>` (14) | Evento personalizado | `{{_event}}` igual a cada evento da seção 4.2 |
| `Página - todas` | Visualização de página | todas (agora o GTM carrega antes da escolha) |
| `Página - serviço` | Visualização de página | `JS - modo da página` = `servico` |
| `Consentimento - análise liberada` | Evento personalizado | `consent_update` com `DLV - analytics` = `true` |
| `Consentimento - marketing liberado` | Evento personalizado | `consent_update` com `DLV - marketing` = `true` |
| `Consentimento - marketing liberado em serviço` | Evento personalizado | o anterior + `JS - modo da página` = `servico` |

Como o GTM carrega antes da escolha, as tags com consentimento exigido ficam bloqueadas em `Página - todas` até o aceite; os gatilhos de consentimento as disparam na hora em que a pessoa aceita.

### 7.3 Tags

Todas usam as **configurações de consentimento do GTM** ("Exigir consentimento adicional para a tag disparar"):

| Tag | Estado | Gatilhos | Consentimento exigido |
|---|---|---|---|
| `GA4 - Google tag` e `GA4 - <evento>` (13) | **Pausadas** | Página - todas; Consentimento - análise liberada; `Evento - <evento>` | `analytics_storage` |
| `Meta Pixel - Base (PageView)`, `- Lead`, `- Contact`, `- ViewContent (serviço)` | **Pausadas** | Página - todas; Consentimento - marketing liberado; `Evento - generate_lead`; `Evento - whatsapp_click`; Página - serviço | `ad_storage` |
| `Google Ads - Vinculador de conversões` | Ativa | Página - todas; Consentimento - marketing liberado | `ad_storage` |
| `Google Ads - Conversão Lead (páginas de obrigado)` | Ativa | `Evento - generate_lead` (uma vez por envio, nas 3 páginas de obrigado) | `ad_storage` |

A tag pausada `GA4 - generate_lead` já leva `segmento` e `porte`, para o caso de alguém voltar ao modo `true`. Enquanto não houver `GADS_CONVERSION_ID` no `olorin-ids.js`, pause a tag de conversão do Ads (o vinculador pode ficar ativo).

`consent_update` **não tem** tag no GA4, de propósito. No contêiner ele serve só de **gatilho**.

**Mudar algo no contêiner.** O arquivo foi gerado por script. Se mudar à mão no GTM, a fonte passa a ser o GTM: exporte de novo (Administrador > Exportar contêiner) e substitua o `gtm-container.json`, para o projeto não ficar desatualizado.

### 7.4 Como ajustar o seu GTM (ou importar o do projeto)

Se o seu GTM `GTM-NDD92B4G` já tem tags:

1. Abra **Tags**. Pause (botão direito > Pausar) ou exclua toda tag do tipo **Tag do Google** ou **Google Analytics: evento do GA4** com `G-ZNZFCSGHZQ`, e toda tag do Pixel da Meta (HTML personalizado com `fbq` ou modelo da Meta).
2. Mantenha Google Ads e o que for extra.
3. **Enviar** > **Publicar**.

Para importar o do projeto:

1. GTM > **Administrador** > **Importar contêiner** > `gtm-container.json`.
2. Espaço de trabalho: **Existente**. Opção: **Mesclar** > **Renomear tags, acionadores e variáveis conflitantes**.
3. Vão aparecer 20 tags (18 pausadas), 19 acionadores, 37 variáveis e 5 pastas.
4. **Visualizar** (seção 10). Só depois: **Enviar** > **Publicar**.

> **Não cole o código de instalação que o GTM mostra** (`<script>` e `<noscript>`). O site já carrega o GTM sozinho, depois do `load`, com o Consent Mode configurado antes.

---

## 8. Passo a passo: criar as contas e colar os IDs

Use sempre a mesma conta Google da empresa. Domínio: **olorin.com.br**.

### 8.1 Google Tag Manager

1. Acesse `tagmanager.google.com` > **Criar conta**.
2. Conta: `Olorin Digital` · País: Brasil · Contêiner: `olorin.com.br` · Plataforma: **Web** > Criar > aceite os termos.
3. Copie o ID que aparece no topo (`GTM-XXXXXXX`).
4. Cole no `public_html/olorin-ids.js` (seção 2.3): `GTM_ID: "GTM-XXXXXXX"`. Preencha também `GA4_ID` e `META_PIXEL_ID`: o site manda GA4 e Pixel direto (seção 1). Para o próximo zip já sair com ele, cole também no `src/_data/site/config.json`.
5. Importe o contêiner (seção 7.4).

### 8.2 Google Analytics 4

1. `analytics.google.com` > **Administrador** > **Criar** > **Propriedade**. Nome `olorin.com.br`, fuso **Brasil (São Paulo)**, moeda **Real (BRL)**.
2. **Fluxos de dados** > **Web** > URL `https://olorin.com.br`, nome `Site`.
3. Copie o **ID da métrica** (`G-XXXXXXXXXX`) e cole em `GA4_ID` no `olorin-ids.js` (e no `config.json`). A variável `GA4 - ID` do contêiner já lê esse valor.
4. No mesmo fluxo, em **Medição otimizada** (engrenagem):
   - **Desligue "Interações com formulários".** Ela cria sozinha um evento chamado `form_start`, que se mistura com o `form_start` do site.
   - Desligue "Rolagens" (o site já envia `scroll_depth` com 25/50/75/90%).
   - "Cliques de saída" pode ficar ligado (registra cliques em `wa.me` como `click`, sem atrapalhar).
5. **Administrador** > **Coleta e retenção de dados** > **Retenção de dados**: 14 meses.
6. Eventos-chave e dimensões: seção 9.
7. **Vinculações de produtos** > **Google Ads**: vincule a conta do Ads (seção 8.4).

### 8.3 Meta Pixel (conjunto de dados)

1. `business.facebook.com` > **Gerenciador de Eventos** > **Conectar fontes de dados** > **Web** > nome `Olorin site` > Criar.
2. Quando perguntar como instalar, escolha a instalação **manual** e **não** cole código no site. Copie só o **ID** (15 ou 16 dígitos).
3. Cole em `META_PIXEL_ID` no `olorin-ids.js` (e no `config.json`). Nas campanhas de cadastro, use o evento `Lead` como conversão; `Contact` serve para campanhas de mensagem.
   - Nas configurações do conjunto de dados, deixe **desligada** a "Correspondência avançada automática". Ligada, ela lê os campos do formulário (nome, telefone) e manda para a Meta, e a política de privacidade diz que o site não faz isso.
4. Recomendado: **Configurações do negócio** > **Segurança da marca** > **Domínios** > adicionar `olorin.com.br` e verificar por **registro DNS TXT** (no painel de DNS da Locaweb ou do Registro.br). Verificar pela meta tag exigiria mudar o `base.njk` (não implementado).
5. Depois de publicar, use **Testar eventos** no Gerenciador de Eventos junto com o Pixel Helper (seção 10).

### 8.4 Google Ads (conversão de lead)

1. `ads.google.com` > **Metas** > **Conversões** > **Resumo** > **Nova ação de conversão** > **Site** > domínio `olorin.com.br`.
2. Escolha **adicionar uma ação de conversão manualmente**:
   - Categoria: **Enviar formulário de lead**
   - Nome: `Lead do site`
   - Valor: opcional (pode usar um valor médio por lead)
   - Contagem: **Uma**
3. Em **Configuração da tag** > **Usar o Gerenciador de tags do Google**: copie o **ID de conversão** (só números) e o **Rótulo de conversão**.
4. Cole em `GADS_CONVERSION_ID` (pode ser `AW-123456789` ou só `123456789`) e `GADS_CONVERSION_LABEL` no `olorin-ids.js`. As variáveis `Google Ads - ID de conversão` e `Google Ads - Rótulo de conversão` do contêiner leem esses campos sozinhas. Com GTM, quem manda a conversão é o GTM; sem GTM, o site.
5. **Administrador** > **Configurações da conta** > **Codificação automática**: ligada (é o que cria o `gclid`, que o site guarda no pedido).
6. Vincule o GA4 (seção 8.2, passo 7). Se também importar o `generate_lead` do GA4 como conversão no Ads, marque-o como **secundária**. Assim o mesmo lead não conta duas vezes (a tag `Google Ads - Conversão Lead (páginas de obrigado)` já é a principal).

Conversões otimizadas (enhanced conversions) **não foram implementadas**: elas exigiriam mandar e-mail ou telefone para o Google, e o site, por regra, não coloca dados pessoais no `dataLayer`. Deixe as conversões otimizadas automáticas **desligadas** na conta do Google Ads, pelo mesmo motivo da Meta (seção 8.3, passo 3).

### 8.5 Ligar o `GTM_ID` com o site no ar

1. Pelo WebFTP, edite `public_html/olorin-ids.js` e preencha `GTM_ID` (seção 2.3). Salve.
2. Abra o site numa janela anônima e aperte Ctrl+F5: o aviso de cookies deve aparecer.
3. No GTM, faça os testes da seção 10 e então **Publicar**.
4. Para o próximo zip já sair com o ID, copie também para o `src/_data/site/config.json` e rode `npm run build`.

### 8.6 Política de segurança de conteúdo (CSP)

A CSP do `.htaccess` está em modo **"só observar"** (`Content-Security-Policy-Report-Only`): nada é bloqueado. Ela já lista o que GTM (inclusive o modo de visualização do Tag Assistant), GA4, Google Ads e Meta Pixel precisam: `*.googletagmanager.com`, `tagmanager.google.com`, `*.google-analytics.com`, `*.analytics.google.com`, `*.g.doubleclick.net`, `td.doubleclick.net`, `bid.g.doubleclick.net`, `www.googleadservices.com`, `www.google.com`, `www.google.com.br`, `www.gstatic.com`, `ssl.gstatic.com`, `fonts.googleapis.com` e `fonts.gstatic.com` (só a tela do Tag Assistant), `connect.facebook.net` e `www.facebook.com`. O `olorin-ids.js` é do próprio site (`'self'`).

Para impor de verdade, troque `Content-Security-Policy-Report-Only` por `Content-Security-Policy` só depois de uma semana com as ferramentas ligadas e **sem avisos de CSP no console** (F12) em todas as páginas, com Aceitar tudo. Tags novas no GTM com outros domínios (Hotjar, Clarity, LinkedIn) precisam entrar na lista antes. Variáveis "JavaScript personalizado" do GTM exigiriam `'unsafe-eval'`; o contêiner do projeto não usa nenhuma.

## 9. GA4: eventos-chave e dimensões personalizadas

**Eventos-chave** (antigas "conversões"): **Administrador** > **Exibição de dados** > **Eventos-chave** > **Novo evento-chave**, e digite o nome exato:

- `generate_lead` (pedido enviado, nas 3 páginas de obrigado; o parâmetro `segmento` diz o público)
- `whatsapp_click` (opcional: clique em qualquer WhatsApp)

Dá para criar pelo nome antes do primeiro evento chegar.

**Medição otimizada** (Administrador > Fluxos de dados > Site > engrenagem): desligue **"Interações com formulários"** (ela cria um `form_start` próprio, que se mistura com o do site) e **"Rolagens"** (o site já manda `scroll_depth`).

**Dimensões personalizadas** (escopo **Evento**): **Administrador** > **Definições personalizadas** > **Criar dimensão personalizada**. O nome do parâmetro tem que ser exatamente este:

| Parâmetro | Sugestão de nome | Parâmetro | Sugestão de nome |
|---|---|---|---|
| `segmento` | Público | `porte` | Porte |
| `page_mode` | Tipo de página | `plano` | Plano |
| `page_slug` | Página (slug) | `servicos` | Serviços pedidos |
| `form_variant` | Variante do formulário | `verba_faixa` | Faixa de verba |
| `origem` | Origem do WhatsApp | `servico_pagina` | Serviço da página |
| `servico` | Serviço | `pergunta_id` | Pergunta do FAQ |
| `posicao` | Posição do formulário | `secao` | Seção vista |
| `cta_id` | CTA | `percent` | Profundidade de rolagem |
| `cta_position` | Posição do CTA | `campo` | Campo com erro |
| `tipo` | Tipo de erro | `desafios` | Desafios marcados |
| `frente` | Calculadora: frente | `objetivo` | Calculadora: objetivo |
| `verba` | Calculadora: verba | | |

São 23, dentro do limite de 50 do GA4 gratuito. `cta_label` e `destino` são opcionais.

**Funil sugerido** (Explorar > Exploração de funil): `form_view` → `form_start` → `form_step1_complete` → `generate_lead`, dividido por `segmento`, `posicao` e `form_variant`.

---

## 10. Checklist de teste

> **Atualizado em 23/10/2026.** Onde a tabela abaixo diz que o GTM só carrega depois do aceite, vale agora: GA4 (`gtag/js?id=G-ZNZFCSGHZQ&l=olorinGtag`) e GTM carregam em todas as páginas logo depois do carregamento, antes da escolha, com consentimento negado (chamadas `collect` com `gcs=G100`, sem cookie `_ga`). O Tag Assistant conecta sem aceitar. Depois de **Recusar**, continua sem `fbevents.js` e o GA4 segue sem cookies. No GTM, as tags `GA4 - ...` e `Meta Pixel - ...` aparecem como pausadas (não disparadas): o GA4 se confere no **DebugView** e na aba do `G-ZNZFCSGHZQ` no Tag Assistant; o Pixel, no **Meta Pixel Helper**. No GTM, confira as duas tags do Google Ads. A página de obrigado é a do público (`/obrigado/`, `/obrigado-educacao/` ou `/obrigado-influenciadores/`) e o assunto do e-mail é `Novo lead (Site|Educação|Influenciadores): ...`.
>
> **Testes automáticos:** `npm test` (seção 3 e 4 do `scripts/testar.mjs`) confere tudo isso sem internet, com as chamadas externas interceptadas.

Prepare antes: Chrome atualizado, extensão **Tag Assistant Companion** (opcional) e extensão **Meta Pixel Helper**. Use dados **falsos** no formulário (ex.: nome "Teste Rastreamento", WhatsApp `(41) 90000-0000`) e avise a equipe para ignorar esse lead.

### 10.1 Tag Assistant (modo de visualização do GTM)

1. No GTM, clique em **Visualizar** e informe `https://olorin.com.br/?utm_source=teste&utm_medium=cpc&utm_campaign=tagassistant`.
2. O site abre em outra janela com o aviso de cookies. O Tag Assistant conecta logo depois do carregamento da página, mesmo sem aceitar (o GTM carrega antes da escolha, com consentimento negado). Se não conectar, recarregue a página.

| # | Faça | Confira no Tag Assistant |
|---|---|---|
| 1 | Em janela anônima, clique **Recusar** | O Tag Assistant **não conecta**. Na aba Rede (F12), nada de `gtm.js`, `collect` ou `fbevents.js` |
| 2 | Limpe a escolha (F12 > Application > Local Storage > apague `olorin_consentimento`), recarregue e clique **Aceitar tudo** | Na linha do tempo: `Consent` (padrão negado) → atualização → `consent_update` → `Container Loaded`. Aba **Consentimento**: `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization` = Granted na atualização |
| 3 | Mesmo passo | Disparam: `GA4 - Google tag`, `Meta Pixel - Base (PageView)`, `Google Ads - Vinculador de conversões` (uma vez cada) |
| 4 | Clique em um botão de WhatsApp | `whatsapp_click` com `origem` igual ao `[ref: ...]` do link → `GA4 - whatsapp_click` e `Meta Pixel - Contact` |
| 5 | Clique em "Quero esse" de um plano | `pricing_plan_click` (`plano`) e `cta_click` (`cta_id` = `planos-<plano>`) |
| 6 | Role a página até o fim | `scroll_depth` 25/50/75/90 e vários `section_view` |
| 7 | Mude a calculadora | `calculator_use` com `escolhas`, `frente`, `verba` e `objetivo` (`primeira_vez: true` só na primeira). O botão de WhatsApp da calculadora (`cta-whatsapp-calculadora`) gera `whatsapp_click` com `origem: calculadora` |
| 8 | Abra uma página de serviço | `Meta Pixel - ViewContent (serviço)` dispara no carregamento |
| 9 | Abra uma pergunta do FAQ | `faq_open` com `pergunta_id`. Confira também se apareceu algum `faq_open` **sem** clique ao carregar (a primeira pergunta já vem aberta) |
| 10 | Formulário: clique em Continuar vazio; depois preencha certo, avance e envie | `form_view` → `form_start` → `form_error` (`campo: nome`, `tipo: validacao`) → `form_step1_complete` → redireciona para `/obrigado/` → `generate_lead` → `GA4 - generate_lead`, `Meta Pixel - Lead`, `Google Ads - Conversão Lead do site` |
| 11 | Recarregue a `/obrigado/` | **Nenhum** `generate_lead` novo |
| 12 | Janela anônima nova, aceite só **Análise** (Personalizar) | Tags do GA4 disparam; Pixel e Google Ads aparecem como **não disparadas** (bloqueadas por consentimento) |
| 13 | Depois, pelo rodapé "Preferências de cookies", marque também Marketing | `consent_update` com `marketing: true` → `Meta Pixel - Base` e o vinculador disparam na hora |
| 14 | Janela anônima, aceite só **Marketing** | GA4 não dispara; Pixel e Ads sim |
| 15 | Em qualquer evento, aba **Camada de dados** | Aparecem `page_mode`, `page_slug`, `form_variant` e as UTMs do teste (`utm_source: teste`...). **Nenhum** nome, telefone ou e-mail |

3. Em paralelo, no GA4: **Administrador** > **DebugView**. Os eventos do teste aparecem em segundos, com os parâmetros.
4. Confira o e-mail do lead de teste: assunto `Novo lead: ... | teste/cpc` e os campos de origem preenchidos.

### 10.2 Meta Pixel Helper

| Situação | O que o Pixel Helper deve mostrar |
|---|---|
| Antes de responder ao aviso, ou depois de Recusar | Nenhum pixel na página |
| Depois de Aceitar tudo (ou Marketing) | O seu ID com `PageView` |
| Página `/servicos/<slug>/` | `PageView` + `ViewContent` (`content_name` = `servico-<slug>`) |
| `/educacao/` e `/influenciadores/` | `PageView` + `ViewContent` (`content_category` = `educacao` ou `influencer`) |
| Clique no WhatsApp | `Contact` |
| Página de obrigado depois de um envio (`/obrigado/`, `/obrigado-educacao/`, `/obrigado-influenciadores/`) | `PageView` + `Lead` (uma vez; recarregar não repete) |

No **Gerenciador de Eventos** > **Testar eventos**, os mesmos eventos devem aparecer em tempo real.

---

## 11. Como conferir que nenhum dado pessoal vai para o `dataLayer`

**O que protege hoje:**

1. O formulário **nunca** chama `track()` com o que a pessoa digita. Os eventos do formulário levam só a posição, o nome do **campo** com erro (`nome`, `whatsapp`…), o tipo do erro e, no lead, plano, serviços marcados, faixa de verba e serviço da página.
2. O filtro de `track()` (seção 4.1) descarta parâmetros com nomes sensíveis e valores que pareçam e-mail ou telefone.
3. A `/obrigado/` não recebe dados na URL: o `enviar.php` responde `redirect: '/obrigado/'` e o JS guarda na sessão só `token`, `plano`, `servicos`, `verba_faixa`, `servico_pagina`, `posicao` e o link de WhatsApp **da empresa**. Esse link é gravado e nunca lido; não é dado pessoal, mas é um resto que pode ser removido.
4. Os dados digitados só aparecem na mensagem do WhatsApp do link de erro de envio (é a própria pessoa que os manda, pelo WhatsApp dela).

Desde 23/10/2026 o formulário pede também e-mail, empresa e cargo. Eles vão só para o `enviar.php` (e-mail e CSV), nunca para `track()`, e o `npm test` confere nas 3 versões do formulário (site, Educação e influenciadores) que nada disso aparece no `dataLayer`, na fila do GA4 nem na do Pixel.

**Como conferir (faça depois de qualquer mudança no formulário ou nos scripts):**

1. Preencha o formulário com dados de teste fáceis de achar (ex.: nome `Fulano Rastreio`, WhatsApp `(41) 90000-0000`).
2. Antes de enviar, no console (F12): `JSON.stringify(dataLayer).match(/Fulano|90000|0000-0000/)` deve dar `null`.
3. Envie e, na `/obrigado/`, repita o comando. Deve dar `null` de novo.
4. No Tag Assistant, abra a aba **Camada de dados** de `form_error`, `form_step1_complete` e `generate_lead`.
5. No GA4 DebugView, abra os parâmetros do `generate_lead`.
6. `npm test` faz uma checagem automática parecida. **Limitação:** o teste só examina o `dataLayer` da página `/obrigado/`, depois do envio. Os eventos da página do formulário não entram na checagem (`scripts/testar.mjs`).

**Cuidados que o código não cobre:**

- As **UTMs não passam pelo filtro** (são parâmetros comuns, adicionados antes dele). Nunca coloque e-mail ou telefone em UTMs de campanhas (algumas ferramentas de e-mail marketing fazem isso automaticamente: confira).
- O GA4 recebe a URL completa da página (`page_location`). Não crie links para o site com dados pessoais no endereço.
- Ao criar tags novas no GTM, não use variáveis que leiam campos do formulário (ex.: "Elemento do formulário", "Variável JavaScript" apontando para inputs).

---

## 12. Divergências e pendências (código × PROMPT)

| # | Item | Situação |
|---|---|---|
| 1 | Com o GA4 do site, todos os eventos do `track()` (seção 4) também vão ao GA4 | Resolvido em 23/10/2026 |
| 2 | Google Ads: com GTM, só o contêiner manda (vinculador e conversão, lendo `OLORIN_CONFIG.adsNumero` e `adsLabel`); sem GTM, o site manda a conversão | Resolvido em 23/10/2026 |
| 3 | `page_mode` é `promo` nas landings; o PROMPT 11.1 pede `campanha` | Diferença |
| 4 | Parâmetros comuns levam só 3 UTMs (último toque) | Diferença |
| 5 | Primeiro e último toque valem só na aba/sessão (`sessionStorage`) | Limitação |
| 6 | GA4 e GTM carregam depois do `load` (ou 3,5 s), quando o navegador fica livre, antes da escolha (Consent Mode avançado). O Pixel espera Marketing | Resolvido em 23/10/2026 |
| 7 | Escolha de cookies não expira | Não implementado |
| 7b | O aviso de cookies vai escondido em todas as páginas (cerca de 1 KB comprimido por página, entre HTML e CSS crítico) para funcionar com IDs colocados no servidor | Escolha consciente |
| 8 | Origem `planos-{plano}` de WhatsApp | Não implementado (os planos levam ao formulário) |
| 9 | `servico` no `whatsapp_click` vira o slug da página fora das páginas de serviço | Diferença |
| 10 | `verba_faixa` só no `generate_lead` (texto da faixa); a calculadora manda `verba` | Resolvido em 23/10/2026 |
| 11 | `cta_label` some no link do rodapé com o telefone da empresa (o filtro o toma por dado pessoal) | Efeito colateral do filtro |
| 12 | `form_error` em dobro se o envio for tentado com a etapa 1 inválida (validação chamada duas vezes no `submit`) | Erro pequeno, caminho raro |
| 13 | `generate_lead` não dispara em envios sem JavaScript/`fetch` | Limitação (o lead chega por e-mail/CSV) |
| 14 | Lead enviado antes de responder ao aviso: a página de obrigado espera a escolha por até 8 s (ou até sair da página) e só então manda as conversões | Resolvido em 23/10/2026 |
| 15 | `npm test` cobre carregamento antes da escolha, Consent Mode negado, Pixel só com aceite, `page_view` com parâmetros, `ViewContent`, `Contact`, `generate_lead` e `Lead` uma vez nas 3 páginas de obrigado e ausência de dados pessoais. Rolagem, FAQ e calculadora não | Cobertura parcial nos eventos menores |
| 16 | Eventos a mais: `posicao` em `form_error`/`generate_lead`, `primeira_vez` em `calculator_use`; `cta_click` também por `data-cta` | Extras (inofensivos) |
| 17 | `whatsapp_link` gravado em `olorin_lead_pendente` e nunca lido | Resto de código |
| 18 | "Interações com formulários" ligada na medição otimizada do GA4 duplicaria o `form_start` | Desligar no GA4 (seção 9) |
| 19 | Com consentimento negado, GA4 e Google Ads recebem só pings sem cookies: os relatórios mostram menos usuários do que a realidade (o Google modela o resto) | Comportamento esperado do modo avançado |
