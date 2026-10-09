# Rastreamento, consentimento e conversões · Olorin Digital

> **Data:** 09/10/2026 · **Base:** PROMPT.md, seção 13 (e 10.2, 10.4, 10.6, 11.1).
> **Código lido para escrever este guia:** `src/scripts/modulos/rastreamento.js`, `consentimento.js`, `medicao.js`, `origem.js`, `formulario.js`, `interacoes.js`, `flutuantes.js`, `cabecalho.js`, `src/scripts/util.js`, `src/scripts/main.js`, `src/_includes/layouts/base.njk`, `src/_includes/partials/cookies.njk`, `src/_data/site/config.json`, `scripts/filtros.mjs` (função `waLink`), `src/php/enviar.njk` e `src/servidor/.htaccess`.
> **Arquivo que acompanha:** `gtm-container.json` (na raiz do projeto), um contêiner do Google Tag Manager pronto para importar.
> Tudo o que está aqui descreve o que o código **faz de verdade**. Onde o código difere do PROMPT, isso está marcado como **Diferença** ou **Não implementado**, e a seção 12 junta tudo.

---

## 0. Resumo para o dono (sem termos técnicos)

**Hoje o site não mede nada.** Os campos de identificação (GTM, GA4, Pixel, Google Ads) estão vazios em `src/_data/site/config.json`. Por isso o aviso de cookies também não aparece: ele só existe quando há alguma ferramenta para ligar.

**Como vai funcionar depois de configurado:**

1. A pessoa entra no site e vê o aviso de cookies com três botões do mesmo tamanho: **Aceitar tudo**, **Recusar** e **Personalizar**.
2. Enquanto ela não escolhe, **nenhuma ferramenta do Google ou da Meta é carregada**. Se ela recusar, continua assim.
3. Se ela aceitar (tudo ou só uma parte), o site carrega o **Google Tag Manager (GTM)**. O GTM é uma "central" que liga o Google Analytics, o Pixel da Meta e o Google Ads, cada um só se a pessoa permitiu.
4. O site anota o que a pessoa faz de importante: clique no WhatsApp, início do formulário, envio do pedido de orçamento etc. Esses registros **nunca levam nome, telefone ou e-mail**.
5. Quando alguém envia o formulário, a página `/obrigado/` avisa o Google Analytics (`generate_lead`), a Meta (`Lead`) e o Google Ads (conversão). Uma vez só por envio.
6. O pedido que chega no seu e-mail traz de onde a pessoa veio (Google Ads, Instagram, busca, indicação) e qual anúncio ou campanha.
7. Todo link de WhatsApp leva no fim da mensagem um código como `[ref: hero]`. Assim, quando a conversa chega, você sabe em qual botão a pessoa clicou.

**O que você precisa fazer (uma vez):**

1. Criar a conta do **Google Tag Manager** e colar o código `GTM-XXXXXXX` no `config.json` (seção 8.1).
2. Importar o arquivo `gtm-container.json` no GTM e trocar os textos `XXXX` pelos seus IDs (seção 7).
3. Criar o **GA4**, o **Pixel da Meta** e a **conversão do Google Ads** (seções 8.2 a 8.4).
4. Gerar o site de novo (`npm run build`) e publicar (seção 8.5).
5. Testar com o **Tag Assistant** e o **Meta Pixel Helper** (seção 10).

> **Importante:** para o rastreamento ficar completo, use o caminho do **GTM**. O site também sabe carregar o GA4 e o Pixel "direto" (sem GTM), mas nesse modo só a visita é medida: os cliques, o formulário e as conversões **não chegam** (detalhes na seção 3.4).

---

## 1. Visão geral (técnico)

```
Página carrega
  ├─ <head>: window.OLORIN_CONFIG = { gtm, ga4, pixel, adsId, adsLabel, modo, slug, whatsapp, ... }
  │          data-form-variant="a|b" no <html> (sorteio A/B antes da primeira pintura)
  ├─ main.js (defer) → iniciarConsentimento()
  │     ├─ sem nenhum ID (gtm/ga4/pixel) → para aqui: sem Consent Mode, sem aviso, nada carrega
  │     └─ com ID → gtag('consent','default', tudo 'denied') → mostra o aviso (se não há escolha salva)
  ├─ track(evento, params) → window.dataLayer.push({...})   ← sempre, com ou sem consentimento
  └─ escolha que libera Análise e/ou Marketing
        → gtag('consent','update', ...) → track('consent_update')
        → quando o navegador fica ocioso: carrega o GTM (ou, sem GTM, GA4/Pixel direto)
              └─ GTM lê a fila do dataLayer e dispara as tags conforme o consentimento
```

Os eventos ficam na fila `window.dataLayer` desde o início da página. Enquanto o GTM não carrega, **nada sai do navegador**: a fila é só uma lista na memória da aba. Quando o GTM carrega (depois do consentimento), ele processa a fila na ordem em que os itens entraram.

---

## 2. Onde fica cada ID

Arquivo: `src/_data/site/config.json` (o PROMPT 13.1 cita `src/_data/site.config.json`; o caminho real é `site/config.json`).

| Campo no `config.json` | Formato | Usar? | O que o código faz com ele |
|---|---|---|---|
| `GTM_ID` | `GTM-XXXXXXX` | **Sim** (recomendado) | Liga o aviso de cookies e carrega o GTM depois do consentimento. Com ele preenchido, `GA4_ID` e `META_PIXEL_ID` são ignorados pelo JavaScript |
| `GA4_ID` | `G-XXXXXXXXXX` | Só sem GTM | Liga o aviso; carrega o GA4 direto se Análise for aceita. Mede só a visita (seção 3.4) |
| `META_PIXEL_ID` | só números | Só sem GTM | Liga o aviso; carrega o Pixel direto se Marketing for aceito. Envia só `PageView` (seção 3.4) |
| `GADS_CONVERSION_ID`, `GADS_CONVERSION_LABEL` | números / texto | Não (por enquanto) | **Não usados.** Vão para `window.OLORIN_CONFIG.adsId/adsLabel`, mas nenhum script os lê. A conversão do Google Ads só funciona pelo GTM. Eles também não ligam o aviso de cookies |

No GTM, os IDs do GA4, do Pixel e do Google Ads ficam em **variáveis constantes** do contêiner (seção 7), não no `config.json`.

Os IDs entram no HTML **na hora do build**. Mudou o `config.json`? Rode `npm run build` e publique. O "jeito rápido" (editar o HTML pelo FTP, ver `docs/EDITAR.md`) **não serve** aqui: sem o build, o aviso de cookies nem existe no HTML.

---

## 3. Consentimento (LGPD) e Consent Mode v2

### 3.1 Quando o aviso aparece

- O HTML do aviso (`partials/cookies.njk`) só é incluído na página quando `GTM_ID`, `GA4_ID` ou `META_PIXEL_ID` está preenchido (`base.njk`, variável `temRastreamento`). O botão **"Preferências de cookies"** do rodapé (completo e mínimo) segue a mesma regra.
- O aviso começa escondido (`hidden`). O JavaScript o mostra quando **não há escolha salva**.
- Sem JavaScript: o aviso não aparece e nenhuma ferramenta carrega (tudo depende de JS).
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

### 3.3 Consent Mode v2 (como está no código)

Assim que o `main.js` roda (e só se houver algum ID):

```js
gtag('consent', 'default', {
  ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  analytics_storage: 'denied', wait_for_update: 500
});
```

Quando há escolha (salva de antes ou feita agora):

```js
gtag('consent', 'update', {
  analytics_storage: analise ? 'granted' : 'denied',
  ad_storage: marketing ? 'granted' : 'denied',
  ad_user_data: marketing ? 'granted' : 'denied',
  ad_personalization: marketing ? 'granted' : 'denied'
});
```

- `gtag()` aqui é uma função local que só faz `dataLayer.push(arguments)`, o formato que o GTM e o gtag.js entendem.
- O evento `consent_update` (com `analytics` e `marketing`) só é enviado quando a pessoa **decide no aviso**. Em visitas seguintes, com a escolha já salva, o `update` é aplicado sem esse evento.
- Não há `region`, `url_passthrough` nem `ads_data_redaction`.

### 3.4 Quando cada ferramenta carrega

`carregarFerramentas()` roda **uma vez por página**, só se a escolha libera Análise **ou** Marketing, e só quando o navegador fica ocioso (`requestIdleCallback` com limite de 2 s; sem esse recurso, 300 ms).

| Configuração | Escolha | O que carrega | O que é medido |
|---|---|---|---|
| `GTM_ID` preenchido | Análise e/ou Marketing | Só o GTM (`gtm.js`). Ele decide o resto pelo consentimento | Tudo o que o contêiner tiver (seção 7) |
| sem GTM, `GA4_ID` preenchido | Análise | gtag.js com `gtag('config', GA4_ID)` | **Só `page_view`** (e o que a "medição otimizada" do GA4 capturar). O código não chama `gtag('event', ...)`, então os eventos da seção 4 **não chegam ao GA4** |
| sem GTM, `META_PIXEL_ID` preenchido | Marketing | Código base do Pixel + `fbq('init')` + `PageView` | **Só `PageView`.** `Lead`, `Contact` e `ViewContent` não são enviados |
| qualquer | Recusar | nada | nada |

**Limitações conhecidas (comportamento do código, não erro de configuração):**

- **Diferença:** o comentário do `consentimento.js` fala em carregar "depois da primeira interação ou quando o navegador estiver livre", e o PROMPT 13.2 pede "após interação/ociosidade". O código só espera a **ociosidade**. Não há gatilho por interação.
- Se a pessoa **retirar** o consentimento no meio da página, o que já carregou (GTM, Pixel) continua na memória até a próxima página. As tags do GTM com consentimento param de disparar; o Pixel direto (sem GTM) não recebe `fbq('consent','revoke')`.
- Se a pessoa enviar o formulário **sem ter respondido ao aviso** e só aceitar já na `/obrigado/`, o `generate_lead` entra na fila **antes** do `consent update`. Como o GTM processa a fila em ordem, é provável que as tags de conversão sejam bloqueadas nesse caso. É raro, porque o aviso aparece em todas as páginas até a pessoa escolher. Vale conferir no Tag Assistant (seção 10, teste 11).

---

## 4. Eventos enviados ao `dataLayer`

### 4.1 A função `track()` e os parâmetros comuns

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
| `calculator_use` | Cada mudança na calculadora (o cálculo inicial não conta) | `plano`, `verba_faixa` (valor em reais como texto: `1500`, `3000`, `5000`, `10000`), `primeira_vez` (`true` só na primeira mudança) | `interacoes.js` |
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
| 7 | `calculator_use` com `plano`, `verba_faixa` | Também envia `primeira_vez`. E `verba_faixa` aqui é um número (`3000`), enquanto no `generate_lead` é o texto da faixa (`De R$ 2 a 5 mil por mês`). Mesmo nome, formatos diferentes |
| 8 | — | `cta_label` some quando o texto do botão parece telefone. Ex.: o link do rodapé "WhatsApp (41) 99646-0861" (`cta-whatsapp-rodape`) chega **sem** `cta_label`, porque o filtro de dados pessoais confunde o telefone da empresa com dado pessoal |
| 9 | — | `faq_open` também dispara quando a pergunta abre pelo endereço (`/#id-da-pergunta`), sem clique. A primeira pergunta de cada lista já vem aberta no HTML; confira no teste se isso gera um `faq_open` sem clique (seção 10, teste 9) |
| 10 | — | Se o envio for tentado com a etapa 1 inválida, o código chama a validação **duas vezes** seguidas (`formulario.js`, no `submit`) e gera `form_error` em dobro para cada campo. Só acontece em caminhos raros (a etapa 1 normalmente é validada no "Continuar") |

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

Arquivo de exportação do GTM (`exportFormatVersion: 2`). Foi gerado a partir dos nomes reais de eventos e parâmetros do código. Validei com `JSON.parse` e com uma checagem de referências (todo gatilho, tag de configuração e variável citada existe). **Não foi importado num GTM real** (não há acesso a uma conta); faça a importação em modo **Mesclar** e confira na visualização.

### 7.1 Variáveis

| Tipo | Nome | Valor |
|---|---|---|
| Constante | `GA4 - ID` | `G-XXXXXXXXXX` → **troque** pelo ID da métrica do GA4 |
| Constante | `Meta Pixel - ID` | `XXXXXXXXXXXXXXX` → **troque** pelo número do Pixel |
| Constante | `Google Ads - ID de conversão` | `XXXXXXXXXX` → **troque** pelos números depois de `AW-` |
| Constante | `Google Ads - Rótulo de conversão` | `XXXXXXXXXXXXXXXXXXXX` → **troque** pelo rótulo |
| JavaScript | `JS - modo da página` | `OLORIN_CONFIG.modo` |
| JavaScript | `JS - slug da página` | `OLORIN_CONFIG.slug` |
| Camada de dados (v2) | `DLV - <nome>` (25) | `page_mode`, `page_slug`, `form_variant`, `utm_source`, `utm_medium`, `utm_campaign`, `cta_id`, `cta_label`, `cta_position`, `destino`, `origem`, `servico`, `posicao`, `campo`, `tipo`, `plano`, `servicos`, `verba_faixa`, `servico_pagina`, `primeira_vez`, `pergunta_id`, `percent`, `secao`, `analytics`, `marketing` |

Por que existem as variáveis `JS - ...`: o `page_mode` só entra no `dataLayer` junto com algum evento. No momento em que o GTM carrega (`gtm.js`), ele pode ainda não existir. O `window.OLORIN_CONFIG.modo` existe desde o `<head>`, então é ele que define "página de serviço" para o `ViewContent`.

### 7.2 Gatilhos

| Gatilho | Tipo | Condição |
|---|---|---|
| `Evento - <nome>` (14) | Evento personalizado | `{{_event}}` igual a cada evento da seção 4.2 |
| `Página - todas` | Visualização de página | todas (dispara quando o GTM carrega, isto é, depois do consentimento) |
| `Página - serviço` | Visualização de página | `JS - modo da página` = `servico` |
| `Consentimento - análise liberada` | Evento personalizado | `consent_update` com `DLV - analytics` = `true` |
| `Consentimento - marketing liberado` | Evento personalizado | `consent_update` com `DLV - marketing` = `true` |
| `Consentimento - marketing liberado em serviço` | Evento personalizado | o anterior + `JS - modo da página` = `servico` |

Os gatilhos de consentimento cobrem quem libera Análise ou Marketing **no meio da visita** (por exemplo, primeiro só Análise e depois Marketing pelo rodapé): a tag base daquela ferramenta dispara na hora, sem esperar a próxima página.

### 7.3 Tags

Todas usam as **configurações de consentimento do GTM** ("Exigir consentimento adicional para a tag disparar"):

| Tag | Tipo | Gatilhos | Consentimento exigido | Disparo |
|---|---|---|---|---|
| `GA4 - Google tag` | Tag do Google (`googtag`), ID `{{GA4 - ID}}` | Página - todas; Consentimento - análise liberada | `analytics_storage` | uma vez por página |
| `GA4 - <evento>` (13) | Evento do GA4 (`gaawe`) | `Evento - <evento>` | `analytics_storage` | por evento; sequenciamento: a `GA4 - Google tag` roda antes |
| `Meta Pixel - Base (PageView)` | HTML personalizado | Página - todas; Consentimento - marketing liberado | `ad_storage` | uma vez por página |
| `Meta Pixel - Lead` | HTML personalizado | `Evento - generate_lead` | `ad_storage` | por evento; a base roda antes |
| `Meta Pixel - Contact` | HTML personalizado | `Evento - whatsapp_click` | `ad_storage` | por evento; a base roda antes |
| `Meta Pixel - ViewContent (serviço)` | HTML personalizado | Página - serviço; Consentimento - marketing liberado em serviço | `ad_storage` | uma vez por página; a base roda antes |
| `Google Ads - Vinculador de conversões` | Vinculador de conversões (`gclidw`) | Página - todas; Consentimento - marketing liberado | `ad_storage` | uma vez por página |
| `Google Ads - Conversão Lead do site` | Acompanhamento de conversões (`awct`) | `Evento - generate_lead` | `ad_storage` | por evento; o vinculador roda antes |

Parâmetros que cada tag de evento do GA4 envia: os da seção 4.2 **mais** `page_mode`, `page_slug` e `form_variant`. As UTMs **não** são repetidas como parâmetro no GA4, de propósito: o GA4 já atribui a campanha pela URL de entrada, e repetir criaria colunas duplicadas.

`consent_update` **não tem** tag no GA4, de propósito. Esse evento só chegaria quando a Análise já está liberada, então não mede nada útil. No contêiner ele serve como **gatilho** para ligar as ferramentas no meio da visita.

Parâmetros do Pixel: `Lead` envia `content_name` = `servico_pagina` (ou `geral`) e `content_category` = `servicos`; `Contact` envia `content_name` = `origem`; `ViewContent` envia `content_name` = slug da página e `content_category` = `servico`.

**Mudar algo no contêiner.** O arquivo foi gerado por script. Se mudar à mão no GTM, a fonte passa a ser o GTM: exporte de novo (Administrador > Exportar contêiner) e substitua o `gtm-container.json`, para o projeto não ficar desatualizado.

### 7.4 Como importar

1. GTM > **Administrador** > **Importar contêiner**.
2. Escolha `gtm-container.json`.
3. Espaço de trabalho: **Existente** (Default Workspace).
4. Opção: **Mesclar** > **Renomear tags, acionadores e variáveis conflitantes**.
5. Confirme. Vão aparecer 20 tags, 19 acionadores, 31 variáveis e 5 pastas.
6. Em **Variáveis**, abra as 4 constantes e troque os `XXXX` pelos IDs reais (seção 8).
7. Ainda não anuncia no Google ou na Meta? **Pause** as tags daquela ferramenta (clique com o botão direito na tag > Pausar). Assim elas não disparam com IDs falsos.
8. **Visualizar** (seção 10). Só depois: **Enviar** > **Publicar**.

> **Não cole o código de instalação que o GTM mostra** (`<script>` e `<noscript>`). O site já carrega o GTM sozinho, e só depois do consentimento. Colar o código no HTML pularia o aviso de cookies.

---

## 8. Passo a passo: criar as contas e colar os IDs

Use sempre a mesma conta Google da empresa. Domínio: **olorin.com.br**.

### 8.1 Google Tag Manager

1. Acesse `tagmanager.google.com` > **Criar conta**.
2. Conta: `Olorin Digital` · País: Brasil · Contêiner: `olorin.com.br` · Plataforma: **Web** > Criar > aceite os termos.
3. Copie o ID que aparece no topo (`GTM-XXXXXXX`).
4. Cole em `src/_data/site/config.json`: `"GTM_ID": "GTM-XXXXXXX"`. Deixe `GA4_ID` e `META_PIXEL_ID` vazios.
5. Importe o contêiner (seção 7.4).

### 8.2 Google Analytics 4

1. `analytics.google.com` > **Administrador** > **Criar** > **Propriedade**. Nome `olorin.com.br`, fuso **Brasil (São Paulo)**, moeda **Real (BRL)**.
2. **Fluxos de dados** > **Web** > URL `https://olorin.com.br`, nome `Site`.
3. Copie o **ID da métrica** (`G-XXXXXXXXXX`) e cole na variável `GA4 - ID` do GTM.
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
3. Cole na variável `Meta Pixel - ID` do GTM.
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
4. Cole nas variáveis `Google Ads - ID de conversão` e `Google Ads - Rótulo de conversão` do GTM.
5. **Administrador** > **Configurações da conta** > **Codificação automática**: ligada (é o que cria o `gclid`, que o site guarda no pedido).
6. Vincule o GA4 (seção 8.2, passo 7). Se também importar o `generate_lead` do GA4 como conversão no Ads, marque-o como **secundária**. Assim o mesmo lead não conta duas vezes (a tag `Google Ads - Conversão Lead do site` já é a principal).

Conversões otimizadas (enhanced conversions) **não foram implementadas**: elas exigiriam mandar e-mail ou telefone para o Google, e o site, por regra, não coloca dados pessoais no `dataLayer`.

### 8.5 Publicar o site com o `GTM_ID`

1. Salve o `config.json` com o `GTM_ID`.
2. `npm run build` (gera o `dist/` com o aviso de cookies e o `GTM_ID` em `window.OLORIN_CONFIG`).
3. `npm run deploy`, ou suba o `dist/` pelo FileZilla (ver `docs/EDITAR.md`).
4. No GTM, faça os testes da seção 10 e então **Publicar**.

**Sobre o `.htaccess`:** a política de segurança de conteúdo (CSP) está em modo **"só observar"** (`Content-Security-Policy-Report-Only`) e já lista GTM, GA4, Google Ads e Meta. Nada é bloqueado hoje. Se um dia trocar para `Content-Security-Policy` (bloqueando), refaça o checklist inteiro e confira o console do navegador: qualquer domínio de medição que faltar na lista para de funcionar.

---

## 9. GA4: eventos-chave e dimensões personalizadas

**Eventos-chave** (antigas "conversões"): **Administrador** > **Exibição de dados** > **Eventos-chave** > **Novo evento-chave**, e digite o nome exato:

- `generate_lead` (pedido de orçamento enviado)
- `whatsapp_click` (clique em qualquer WhatsApp)

Dá para criar pelo nome antes do primeiro evento chegar.

**Dimensões personalizadas** (escopo **Evento**), para ver os parâmetros nos relatórios: **Administrador** > **Definições personalizadas** > **Criar dimensão personalizada**. O nome do parâmetro tem que ser exatamente este:

| Parâmetro | Sugestão de nome | Parâmetro | Sugestão de nome |
|---|---|---|---|
| `page_mode` | Tipo de página | `plano` | Plano |
| `page_slug` | Página (slug) | `servicos` | Serviços pedidos |
| `form_variant` | Variante do formulário | `verba_faixa` | Faixa de verba |
| `origem` | Origem do WhatsApp | `servico_pagina` | Serviço da página |
| `servico` | Serviço | `pergunta_id` | Pergunta do FAQ |
| `posicao` | Posição do formulário | `secao` | Seção vista |
| `cta_id` | CTA | `percent` | Profundidade de rolagem |
| `cta_position` | Posição do CTA | `campo` | Campo com erro |
| `tipo` | Tipo de erro | | |

São 17, dentro do limite de 50 do GA4 gratuito. `cta_label` e `destino` são opcionais.

**Funil sugerido** (Explorar > Exploração de funil): `form_view` → `form_start` → `form_step1_complete` → `generate_lead`, dividido por `posicao` e por `form_variant` (teste A/B do formulário do topo).

---

## 10. Checklist de teste

Prepare antes: Chrome atualizado, extensão **Tag Assistant Companion** (opcional) e extensão **Meta Pixel Helper**. Use dados **falsos** no formulário (ex.: nome "Teste Rastreamento", WhatsApp `(41) 90000-0000`) e avise a equipe para ignorar esse lead.

### 10.1 Tag Assistant (modo de visualização do GTM)

1. No GTM, clique em **Visualizar** e informe `https://olorin.com.br/?utm_source=teste&utm_medium=cpc&utm_campaign=tagassistant`.
2. O site abre em outra janela com o aviso de cookies. **O Tag Assistant só conecta depois que você aceitar**, porque o GTM só carrega depois do consentimento (e quando o navegador fica ocioso, até ~2 s). Se não conectar, recarregue a página do site depois de aceitar.

| # | Faça | Confira no Tag Assistant |
|---|---|---|
| 1 | Em janela anônima, clique **Recusar** | O Tag Assistant **não conecta**. Na aba Rede (F12), nada de `gtm.js`, `collect` ou `fbevents.js` |
| 2 | Limpe a escolha (F12 > Application > Local Storage > apague `olorin_consentimento`), recarregue e clique **Aceitar tudo** | Na linha do tempo: `Consent` (padrão negado) → atualização → `consent_update` → `Container Loaded`. Aba **Consentimento**: `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization` = Granted na atualização |
| 3 | Mesmo passo | Disparam: `GA4 - Google tag`, `Meta Pixel - Base (PageView)`, `Google Ads - Vinculador de conversões` (uma vez cada) |
| 4 | Clique em um botão de WhatsApp | `whatsapp_click` com `origem` igual ao `[ref: ...]` do link → `GA4 - whatsapp_click` e `Meta Pixel - Contact` |
| 5 | Clique em "Quero esse" de um plano | `pricing_plan_click` (`plano`) e `cta_click` (`cta_id` = `planos-<plano>`) |
| 6 | Role a página até o fim | `scroll_depth` 25/50/75/90 e vários `section_view` |
| 7 | Mude a calculadora | `calculator_use` (`primeira_vez: true` só na primeira) |
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
| Clique no WhatsApp | `Contact` |
| `/obrigado/` depois de um envio | `Lead` (uma vez; recarregar não repete) |

No **Gerenciador de Eventos** > **Testar eventos**, os mesmos eventos devem aparecer em tempo real.

---

## 11. Como conferir que nenhum dado pessoal vai para o `dataLayer`

**O que protege hoje:**

1. O formulário **nunca** chama `track()` com o que a pessoa digita. Os eventos do formulário levam só a posição, o nome do **campo** com erro (`nome`, `whatsapp`…), o tipo do erro e, no lead, plano, serviços marcados, faixa de verba e serviço da página.
2. O filtro de `track()` (seção 4.1) descarta parâmetros com nomes sensíveis e valores que pareçam e-mail ou telefone.
3. A `/obrigado/` não recebe dados na URL: o `enviar.php` responde `redirect: '/obrigado/'` e o JS guarda na sessão só `token`, `plano`, `servicos`, `verba_faixa`, `servico_pagina`, `posicao` e o link de WhatsApp **da empresa**. Esse link é gravado e nunca lido; não é dado pessoal, mas é um resto que pode ser removido.
4. Os dados digitados só aparecem na mensagem do WhatsApp do link de erro de envio (é a própria pessoa que os manda, pelo WhatsApp dela).

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
| 1 | Sem GTM, o GA4 direto mede só `page_view` e o Pixel direto só `PageView` (o código não converte os eventos em `gtag('event')`/`fbq('track')`) | Limitação. Use o GTM |
| 2 | `GADS_CONVERSION_ID` e `GADS_CONVERSION_LABEL` do `config.json` não são lidos por nenhum script | Não implementado (só via GTM) |
| 3 | `page_mode` é `promo` nas landings; o PROMPT 11.1 pede `campanha` | Diferença |
| 4 | Parâmetros comuns levam só 3 UTMs (último toque) | Diferença |
| 5 | Primeiro e último toque valem só na aba/sessão (`sessionStorage`) | Limitação |
| 6 | GTM carrega por ociosidade, não por "interação ou ociosidade" | Diferença pequena |
| 7 | Escolha de cookies não expira | Não implementado |
| 8 | Origem `planos-{plano}` de WhatsApp | Não implementado (os planos levam ao formulário) |
| 9 | `servico` no `whatsapp_click` vira o slug da página fora das páginas de serviço | Diferença |
| 10 | `verba_faixa` com formatos diferentes no `calculator_use` (número) e no `generate_lead` (texto) | Inconsistência |
| 11 | `cta_label` some no link do rodapé com o telefone da empresa (o filtro o toma por dado pessoal) | Efeito colateral do filtro |
| 12 | `form_error` em dobro se o envio for tentado com a etapa 1 inválida (validação chamada duas vezes no `submit`) | Erro pequeno, caminho raro |
| 13 | `generate_lead` não dispara em envios sem JavaScript/`fetch` | Limitação (o lead chega por e-mail/CSV) |
| 14 | Lead enviado antes de responder ao aviso e aceito só na `/obrigado/`: conversões provavelmente bloqueadas | Limitação a conferir |
| 15 | PROMPT 5 pede "todos os eventos da seção 13 testados com Playwright"; o `npm test` cobre só `generate_lead` (uma vez, sem duplicar) e dados pessoais na `/obrigado/` | Cobertura parcial |
| 16 | Eventos a mais: `posicao` em `form_error`/`generate_lead`, `primeira_vez` em `calculator_use`; `cta_click` também por `data-cta` | Extras (inofensivos) |
| 17 | `whatsapp_link` gravado em `olorin_lead_pendente` e nunca lido | Resto de código |
