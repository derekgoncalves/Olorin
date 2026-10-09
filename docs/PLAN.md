# Plano e arquitetura do site v3 · Olorin Digital

> **Data:** 09/10/2026 · **Escopo:** o código do site v3 como está hoje (`eleventy.config.js`, `scripts/`, `src/`) · **Base:** PROMPT.md, seções 6, 7, 10, 11, 13, 14, 16, 18 e 20.
> Formato de registro de decisões de arquitetura (ADR): para cada escolha, o contexto, o que foi decidido, as alternativas e as consequências.
> Tudo aqui foi conferido lendo o código. Quando algo do PROMPT **não foi implementado**, está escrito assim, com o motivo (ou "motivo não registrado" quando o código não explica).
> Os números de tamanho vêm do `dist/` gerado em 09/10/2026 às 09:31 (este documento não rodou o build). Alterações feitas depois disso podem mudar esses números um pouco.

---

## Resumo em linguagem simples (para o dono)

- **O que é o site:** um conjunto de páginas prontas (HTML) geradas **no seu computador** a partir de arquivos de texto (`.yml`). O resultado sai na pasta `dist/`, que vai inteira para o `public_html` da Locaweb pelo FTP. Não há WordPress, nem banco de dados, nem painel para atualizar.
- **Onde ficam os textos:** em `src/content/`. Um arquivo por serviço, um para a home (que também define **a ordem dos blocos**), um para o FAQ, um para os planos, e assim por diante. O passo a passo está em `docs/EDITAR.md`.
- **O único pedaço "programado" no servidor** é o formulário (`enviar.php`). Ele é gerado junto com o site, a partir das **mesmas listas** que aparecem na tela. Assim, uma opção nova no formulário nunca é recusada pelo servidor por esquecimento.
- **O que ainda não foi confirmado não vai ao ar:** todo texto com `[CONFIRMAR: ...]` some do site publicado. Se sobrar algum, o build para com erro.
- **Os pedidos (leads)** são gravados numa planilha mensal **fora** da pasta pública, quando a Locaweb permite. Também chegam por e-mail. O formulário recusa envios de outros sites, robôs que preenchem um campo-isca e excesso de envios do mesmo endereço.
- **Rastreamento (GTM, GA4, Meta, Google Ads)** está pronto, mas **desligado** enquanto os IDs estiverem vazios em `src/_data/site/config.json`. Quando ligado, nada de terceiros carrega antes de a pessoa aceitar no aviso de cookies.
- **Por que assim:** é o jeito mais rápido, seguro e barato de rodar na hospedagem que você já tem, com o mesmo resultado de velocidade do site atual ou melhor.
- **O que precisa de atenção antes de publicar** está na seção 13.1. Os mais importantes:
  - o `robots.txt` bloqueia `/promo/` e `/obrigado/`, o que o PROMPT proíbe;
  - o número de WhatsApp usado pelo formulário está digitado dentro do PHP, fora da configuração geral;
  - a checagem de "tempo mínimo" contra robôs pode ser pulada por quem envia direto para o servidor.

---

## Índice

1. [Contexto e restrições](#1-contexto-e-restrições)
2. [Decisões de arquitetura (ADRs)](#2-decisões-de-arquitetura-adrs)
3. [Estrutura de pastas](#3-estrutura-de-pastas)
4. [Fluxo de dados](#4-fluxo-de-dados)
5. [Pipeline de build](#5-pipeline-de-build)
6. [Modos de página: completo × campanha](#6-modos-de-página-completo--campanha)
7. [Formulário em 2 etapas e contrato com o PHP](#7-formulário-em-2-etapas-e-contrato-com-o-php)
8. [Segurança](#8-segurança)
9. [Rastreamento com consentimento](#9-rastreamento-com-consentimento)
10. [Desempenho](#10-desempenho)
11. [Acessibilidade](#11-acessibilidade)
12. [Verificação e testes](#12-verificação-e-testes)
13. [Riscos e trade-offs](#13-riscos-e-trade-offs)
14. [Como evoluir](#14-como-evoluir)

---

## 1. Contexto e restrições

| Restrição | De onde vem | Consequência para a arquitetura |
|---|---|---|
| **Hospedagem compartilhada da Locaweb** (Apache + PHP, sem Node, sem acesso de administrador) | PROMPT 2 | O site no servidor precisa ser arquivo estático. Configuração só por `.htaccess`. Nada de processo rodando em segundo plano. |
| **Publicação por FTP** no `public_html` | PROMPT 2 e 6.3 | O "deploy" é copiar arquivos. Não há como rodar comandos no servidor. O build acontece na máquina de quem publica. |
| **Dono não programador**, que quer editar textos | PROMPT 6.4; AUDIT 4.3 | Conteúdo em arquivos `.yml` com comentários em português, separado do HTML. Ordem da home editável por uma lista. |
| **Sem WordPress** | Decisão do dono (AUDIT 4.3) | Nada de banco de dados, plugins nem painel. O tema WordPress antigo ficou em `legado/` só como referência. |
| **PHP só no formulário** | PROMPT 6.1 | Um único `enviar.php`. Versão mínima declarada no arquivo: PHP 7.4. A versão real do plano ainda não foi confirmada (pergunta 0.5.10). |
| **Zero JavaScript de framework** no navegador | PROMPT 0.2.5 | JS próprio, sem dependências, empacotado num arquivo só. Ferramentas de build podem usar Node. |
| **Não regredir o desempenho** (PageSpeed mobile 97/100/100/100, LCP 2,3 s, CLS 0) | PROMPT 0.2.4 | HTML pré-gerado, CSS crítico embutido, imagens AVIF/WebP, fontes próprias com pré-carregamento, terceiros só depois do consentimento. |
| **Segredos fora do repositório** | PROMPT 0.2.6 | Senha do e-mail só no servidor (`olorin-config.php` ou `config.php`); senha do FTP só no `.env` local. O deploy nunca envia esses arquivos. |
| **Um único domínio:** `olorin.com.br` | PROMPT 0.2.2 | URLs absolutas saem de um campo só (`URL` na config). O build falha se encontrar o domínio errado. |
| **Nada sem confirmação no ar** | PROMPT 0.2.1 | Marcador `[CONFIRMAR: ...]` removido em produção e checado no fim do build. |

---

## 2. Decisões de arquitetura (ADRs)

### ADR-01 · Gerador de site estático: Eleventy 3 + Nunjucks + YAML

**Status:** aceita e implementada (`@11ty/eleventy` 3.1.6, Node 20 ou mais novo).

**Contexto.** O site precisa de cerca de 20 páginas com muitas partes repetidas: o mesmo formulário aparece em quase todas, cada um dos 6 serviços tem uma página completa e uma landing de campanha, e os mesmos dados (preços, FAQ, equipe) aparecem no texto, nos dados estruturados (JSON-LD), no `llms.txt` e nas listas do PHP. Tudo isso precisa rodar numa hospedagem que só serve arquivos e PHP.

**Decisão.** Eleventy gera HTML puro a partir de templates Nunjucks (`.njk`) e de dados em YAML/JSON. Nenhum código do Eleventy vai para o navegador. O conteúdo editável fica em `src/content/`. O PHP do formulário também é um template, gerado do mesmo conteúdo.

**Alternativas consideradas**

| Alternativa | Por que não |
|---|---|
| **WordPress** (já existia um tema em `legado/`) | O dono decidiu não usar (AUDIT 4.3). Traria banco de dados, plugins e atualizações constantes, uma superfície de ataque maior e o risco de sobras como `license.txt` e CSS de blocos que a marca não usa (achados 8 e 9 da auditoria). A vantagem real, editar pelo navegador, ficou como fase futura (`docs/ROADMAP.md`). |
| **HTML escrito à mão** (como o site atual) | É o que gerou os problemas da auditoria: o dono corrigiu domínio e WhatsApp só no `index.html`, e `404.html`, sitemap e política continuaram errados (AUDIT, seção "Origem dos arquivos"). Com 6 serviços em 2 modos e o mesmo formulário em várias páginas, cada correção teria de ser feita em muitos lugares, e nada garantiria que as opções do formulário batessem com a lista do PHP. |
| **Next.js** | É orientado a React. Mesmo exportado como estático, envia o runtime do React para o navegador, o que contraria a regra "zero JavaScript de framework". |
| **Astro** | Também geraria HTML sem JS, mas traz mais peças (Vite, sintaxe de componentes própria, atualizações maiores frequentes). Para um site de conteúdo com cerca de 20 páginas, o ganho não paga a complexidade extra para quem vai manter. |
| **Script Node próprio** (alternativa aceita pelo PROMPT 6.1) | Não houve motivo técnico contra o Eleventy. Escrever um gerador próprio seria reinventar paginação, includes e servidor de desenvolvimento. |

**Consequências**

- (+) Desempenho de site estático, sem servidor de aplicação. Funciona na Locaweb sem nada especial.
- (+) Uma fonte por informação. Um serviço novo vira página, landing, opção do formulário, item do sitemap e do `llms.txt` (seção 14).
- (−) Quem publica precisa de Node no computador para gerar o `dist/`. Editar o HTML direto no servidor funciona, mas é sobrescrito na próxima publicação (seção 13).
- (−) As páginas geradas são pouco legíveis à mão: o CSS crítico vai embutido em cada uma (a home tem cerca de 146 KiB de HTML).

### ADR-02 · Conteúdo em YAML com fonte única e regra do `[CONFIRMAR]`

**Decisão.** Todo texto editável fica em `src/content/` (`.yml` e `.json`), lido por um carregador único (`src/_data/conteudo.js`). Em produção, o carregador remove o que tem `[CONFIRMAR`. O mesmo dado alimenta HTML, JSON-LD, `llms.txt`, sitemap e as listas do PHP. Detalhes na seção 4.

**Alternativa descartada:** Markdown com front matter por página. Não combina com páginas montadas por blocos (home com ordem editável, serviço com 14 seções fixas) e não daria as listas estruturadas que o PHP e o JSON-LD precisam.

### ADR-03 · PHP só no formulário, gerado a partir do conteúdo

**Decisão.** `src/php/enviar.njk` gera `dist/enviar.php`. As listas aceitas (serviços, faixas de investimento, planos e slugs) entram no PHP como JSON no momento do build. A configuração com senha **não** é gerada: fica só no servidor. Detalhes na seção 7.

**Alternativa descartada:** um `enviar.php` fixo com listas digitadas à mão. Foi exatamente o que causou o achado 5 da auditoria ("Rastreamento e relatório" existia no site, mas não na lista do PHP, então o servidor descartava a escolha).

### ADR-04 · CSS sem pré-processador, concatenado e processado pelo Lightning CSS

**Decisão.** 36 arquivos CSS (tokens, base, componentes, animações e responsivo) concatenados numa ordem fixa (`ORDEM_CSS` em `scripts/assets.mjs`), processados pelo Lightning CSS 1.33.0, com hash no nome. O CSS usado em cada página é embutido no `<head>` pelo Beasties (seção 5).

**Alternativas descartadas:** Sass (variáveis CSS nativas bastam para os tokens) e Tailwind (classes utilitárias no HTML dificultariam a leitura dos templates por quem não programa).

### ADR-05 · JavaScript próprio, em módulos, empacotado pelo esbuild

**Decisão.** `src/scripts/main.js` importa 9 módulos (`src/scripts/modulos/`). O esbuild 0.28.2 gera um arquivo único (IIFE, ES2019), carregado com `defer`. O que é essencial (consentimento, menu, formulário, FAQ, cliques) inicia na hora. O resto (faixas, animações de entrada, portfólio, calculadora, botões flutuantes, rolagem, cursor) inicia quando o navegador estiver livre (`requestIdleCallback`).

### ADR-06 · Rastreamento só depois do consentimento, por uma função única

**Decisão.** Consent Mode v2 começa negado. GTM (ou GA4/Pixel direto, se não houver GTM) só carrega depois de uma escolha que permita Análise ou Marketing. Todo evento passa por `track()`, que filtra dados pessoais. Detalhes na seção 9.

### ADR-07 · Publicação por FTP que nunca apaga nada

**Decisão.** `scripts/deploy.mjs` (biblioteca `basic-ftp`) faz backup do servidor, envia primeiro os arquivos de apoio e por último as páginas, e **nunca apaga** nada nem envia `config.php`, `olorin-config.php`, `leads/` (exceto o `.htaccess` de proteção), `.well-known/` ou `.csv`.

**Alternativa descartada:** espelhamento com exclusão (`lftp mirror --delete`). Seria rápido, mas um erro de configuração poderia apagar a senha do servidor ou os pedidos.

---

## 3. Estrutura de pastas

```
/home/user/Olorin
├── PROMPT.md                 especificação (somente leitura)
├── package.json              comandos (npm run ...) e dependências de build
├── eleventy.config.js        liga tudo: dados, filtros, assets, imagens, pós-processamento
├── .env.example              modelo do .env do FTP (o .env real nunca vai para o Git)
├── scripts/                  ferramentas de build, teste e publicação (Node)
│   ├── assets.mjs            CSS (concatena + Lightning CSS + hash) e JS (esbuild + hash); fontes licenciadas
│   ├── imagens.mjs           AVIF/WebP responsivos com sharp, a partir de src/assets/manifest.json
│   ├── filtros.mjs           filtros dos templates: waLink, imagem, emLinha, textoPuro, listasParaPhp...
│   ├── schema.mjs            monta o JSON-LD a partir do conteúdo
│   ├── pos-processar.mjs     Beasties: CSS crítico embutido em cada página (só em produção)
│   ├── verificar-build.mjs   checagens do dist/; erro interrompe o build
│   ├── testar.mjs            npm test: Chromium (Playwright), axe-core e formulário com PHP real
│   ├── capturas.mjs          npm run capturas: telas de todas as páginas em 5 larguras
│   ├── legibilidade.mjs      npm run legibilidade: índice de Flesch adaptado ao português
│   ├── pendencias.mjs        npm run pendencias: lista os [CONFIRMAR] do conteúdo
│   ├── gerar-og.mjs          npm run og: imagens de compartilhamento 1200×630 (fora do build)
│   └── deploy.mjs            npm run deploy / deploy:dry (FTP/FTPS)
├── src/
│   ├── _data/
│   │   ├── conteudo.js       carregador único de src/content/ (regra do [CONFIRMAR])
│   │   ├── site/config.json  configuração geral (vira "site.config" nos templates)
│   │   └── navegacao.yml     menu principal
│   ├── content/              TEXTOS EDITÁVEIS
│   │   ├── home.yml          textos e ORDEM dos blocos da home (lista "secoes")
│   │   ├── servicos/*.yml    1 arquivo por serviço = página completa + landing de campanha
│   │   ├── paginas/*.yml     sobre, hub de serviços, promo, obrigado, 404, privacidade
│   │   ├── faq.yml, planos.yml, equipe.yml, formulario.yml
│   │   ├── cases.yml, depoimentos.yml, portfolio.yml, claims.json (números)
│   ├── _includes/
│   │   ├── layouts/          base.njk (todas as páginas) e campanha.njk (landings)
│   │   ├── partials/         cabeçalho, rodapé (completo e mínimo), cookies, flutuantes, schema, ícones SVG
│   │   ├── secoes/           os 14 blocos da home (hero, formulario-topo, checklist, metodo, ...)
│   │   └── components/       ui.njk (cards, FAQ, migalhas, calculadora) e formulario.njk
│   ├── index.njk, 404.njk    home e página de erro
│   ├── servicos/             hub (index.njk) e servico.njk (gera as 6 páginas por paginação)
│   ├── promo/                landing geral (index.njk) e servico.njk (gera as 6 landings)
│   ├── cases/                lista e página de case (só existem com case aprovado)
│   ├── sobre/, obrigado/, politica-de-privacidade/
│   ├── seo/                  sitemap.xml, robots.txt, llms.txt, site.webmanifest
│   ├── _estilo/              guia de estilo vivo (só em "npm run dev"; ignorado em produção)
│   ├── php/                  enviar.njk (gera enviar.php) e config.example.php
│   ├── servidor/             .htaccess, leads.htaccess, favicon.ico (copiados como estão)
│   ├── styles/               tokens.css, base.css, componentes/*.css, animacoes.css, responsivo.css
│   ├── scripts/              main.js, util.js, modulos/*.js
│   └── assets/
│       ├── img-src/          originais das imagens (NUNCA vão para o dist/)
│       ├── manifest.json     inventário das imagens (alt, categoria, autorização, larguras)
│       ├── fonts/            .woff2 já reduzidos + licenciadas/ (fontes pagas, fora do Git)
│       ├── brand/            favicon e ícones
│       └── og/               imagens de compartilhamento geradas por "npm run og"
├── dist/                     RESULTADO: vai inteiro para o public_html (fora do Git)
├── .cache/img/               cache das imagens já convertidas (acelera o build)
├── docs/                     documentação
├── site-atual/               cópia do site no ar (somente leitura)
├── legado/                   tema WordPress e exportação estática v1 (referência)
└── _brand/, _inbox/          manual de marca e material bruto
```

**Diferenças em relação à estrutura sugerida no PROMPT 6.2** (todas de nome ou organização, sem perda de função):

- Não existem layouts `servico.njk` e `simples.njk`. As páginas de serviço são templates com paginação (`src/servicos/servico.njk`) sobre o layout `base.njk`. As páginas simples usam o `base.njk` direto.
- Os componentes ficam como macros num único `components/ui.njk`, e não em arquivos separados. Os blocos da home ficam em `_includes/secoes/`.
- A configuração está em `src/_data/site/config.json` (e não em `site.config.json`). Nos templates ela é lida como `site.config`.
- O JS de origem é `src/scripts/main.js` + `modulos/` (o PROMPT falava em `olorin.js`). O arquivo final se chama `olorin.<hash>.js`.
- O PHP de origem é `src/php/enviar.njk` (template), e não `enviar.php`.

---

## 4. Fluxo de dados

### 4.1 Diagrama (do texto editável até o servidor)

```
 VOCÊ EDITA                         BUILD (npm run build, no seu computador)
 ----------                         ----------------------------------------

 src/content/*.yml, *.json ----+
 src/content/servicos/*.yml    +--> src/_data/conteudo.js
 src/content/paginas/*.yml ----+      - lê todos os .yml/.json
                                      - (produção) retira o que tem [CONFIRMAR]
                                      - monta: servicos (ordenados), servicoPorSlug,
                                        opcoesServico (chips), pessoaPorSlug, faqPorId
                                              |
 src/_data/site/config.json --> site.config  |      src/_data/navegacao.yml --> menu
                                              v
              Eleventy + Nunjucks (layouts, partials, secoes, components)
              + filtros.mjs (waLink, imagem, emLinha, listasParaPhp...)
              + schema.mjs (JSON-LD a partir dos mesmos dados)
                  |                 |                      |
                  v                 v                      v
          páginas .html       enviar.php            sitemap.xml, robots.txt,
          (+ JSON-LD)         (listas do form)      llms.txt, site.webmanifest

 src/styles/*.css  --> assets.mjs: concatena -> Lightning CSS -> assets/css/olorin.<hash>.css
 src/scripts/*.js  --> assets.mjs: esbuild ------------------> assets/js/olorin.<hash>.js
 src/assets/img-src --> imagens.mjs (sharp + manifest.json) --> assets/img/<id>-<largura>.avif|webp
 fontes, ícones, og/, .htaccess, favicon ---------------------> cópia direta
                                              |
                                              v
              eleventy.after: Beasties embute no <head> o CSS usado em cada página
                                              |
                                              v
              verificar-build.mjs  -- erro? --> build PARA (nada vai para o FTP)
                                              |
                                              v
                                    dist/  (pronto)
                                              |
              npm test (Chromium + axe + PHP)  -->  npm run deploy (FTP, sem apagar nada)
                                              |
                                              v
                                    public_html na Locaweb
```

**No navegador do visitante, depois de publicado:**

```
 Visitante --> HTML estático (Apache)  --> olorin.<hash>.js (defer)
                                           |- origem.js: guarda utm_*, gclid, gbraid, wbraid, fbclid (sessionStorage)
                                           |- formulário: etapa 1 -> etapa 2 -> POST /enviar.php
                                           |      PHP: método -> origem -> isca -> tempo -> validação
                                           |           -> limite por IP -> e-mail SMTP -> CSV ../leads/AAAA-MM.csv
                                           |           -> webhook (opcional) -> JSON { ok, redirect }
                                           |- /obrigado/: generate_lead (uma vez por envio)
                                           '- track() --> window.dataLayer --(só com consentimento)--> GTM / GA4 / Meta
```

### 4.2 Fonte única: o que sai de cada dado

| Dado (arquivo) | Onde aparece |
|---|---|
| `servicos/<slug>.yml` | `/servicos/<slug>/`, `/promo/<slug>/`, card da home e do hub, submenu, chip do formulário (campo `chip`), lista do `enviar.php`, JSON-LD `Service` e `FAQPage`, sitemap, `llms.txt`, lista de serviços da 404, imagem de compartilhamento (via `npm run og`) |
| `faq.yml` | FAQ da home, FAQ das landings (por `id`), JSON-LD `FAQPage` da home, `llms.txt` |
| `planos.yml` | Cartões de planos, calculadora e tabela equivalente sem JS, resumo das landings, lista de planos aceitos no PHP, `llms.txt` |
| `formulario.yml` | Rótulos, mensagens de erro (também usadas pelo JS), faixas de investimento (também na lista do PHP) |
| `equipe.yml` | Cards de pessoa, "Quem faz", página Sobre, JSON-LD `Person` e `employee` |
| `cases.yml` | Seção Resultados da home (`exibir: true`). Com `aprovado: true`: `/cases/`, `/cases/<slug>/`, item "Cases" no menu, bloco de cases nas páginas dos serviços listados e sitemap. O carregador **para o build** se um case aprovado não tiver `slug`, `segmento`, `situacao`, `o_que_fizemos`, `resultado`, `periodo` e `servicos` |
| `site/config.json` | Contatos, links de WhatsApp (`waLink`), flags (`SHOW_STATS`, `SHOW_TOTAL_COST`, `OFERTA_DIAGNOSTICO`, `FORM_TOP_VARIANT`), IDs de rastreamento, URL base de canonical/OG/sitemap |

### 4.3 A regra do `[CONFIRMAR]`

- **No desenvolvimento** (`npm run dev`): os marcadores aparecem na página. Onde o template usa o filtro `confirmar`, eles ficam destacados em amarelo (`<mark class="o-confirmar">`).
- **Em produção** (`npm run build`), `conteudo.js` aplica a função `limpar` ao conteúdo inteiro:
  - um **texto** com o marcador vira vazio (`null`), e o template não mostra o bloco;
  - um **item de lista** com o marcador em qualquer campo é **retirado inteiro**. Exemplos: uma pergunta do FAQ sem resposta confirmada, ou uma entrega de serviço com a frequência a confirmar.
- **Segunda barreira:** `verificar-build.mjs` falha se encontrar `[CONFIRMAR` em qualquer arquivo de texto do `dist/` (HTML, PHP, XML, TXT, CSS, JS, JSON, `.htaccess`). `testar.mjs` também procura o marcador no texto visível.
- **Cuidado:** a retirada de itens é silenciosa. Hoje há marcadores em 10 arquivos de conteúdo (o de rastreamento e relatório tem 14). O build não lista o que foi retirado. Para saber o que falta, rode `npm run pendencias` (lista arquivo, linha e descrição de cada marcador), abra o site com `npm run dev` ou consulte `docs/CONTENT-TODO.md`.

### 4.4 `enviar.php` gerado do mesmo conteúdo

- `src/php/enviar.njk` chama `listasParaPhp(conteudo)` (em `scripts/filtros.mjs`), que monta um JSON com:
  - `servicos`: os `chip` dos 6 serviços + "Ainda não sei, quero conversar" (`formulario.yml → servicos_extra`);
  - `investimento`: as 5 faixas de `formulario.yml`;
  - `planos`: `''` + os `id` de `planos.yml`;
  - `slugs`: `''` + os slugs dos serviços.
- O JSON entra no PHP como texto entre aspas simples (escapado pelo filtro `phpString`) e é lido com `json_decode` em `$OLORIN_LISTAS`. O resto do PHP fica dentro de `{% raw %}` e sai igual.
- `verificar-build.mjs` confere se cada chip `servicos[]` e cada `<option>` de investimento de **todas** as páginas existem na lista do PHP, e se não sobrou marcação do Nunjucks no PHP.
- Compatibilidade: se o `config.php` antigo do servidor tiver uma lista `servicos`, ela é **somada** à lista gerada.
- **Exceção à fonte única:** o número de WhatsApp usado pelo PHP (link da página de erro sem JS e link `whatsapp` da resposta de sucesso) está **digitado** no template (`OLORIN_WHATSAPP_SITE_PADRAO`), e não vem de `config.json`. O campo `whatsapp` do `config.php` não é usado em lugar nenhum. A checagem do build só olha links `wa.me/<número>` escritos por extenso, então não pegaria uma diferença aqui (seção 13.1).

### 4.5 Configuração: o que vai para o navegador e o que fica no servidor

- **Vai para o navegador** como `window.OLORIN_CONFIG` (sem segredos): `whatsapp`, `gtm`, `ga4`, `pixel`, `adsId`, `adsLabel`, `agendamento`, `modo` (modo da página), `slug` e `cursor`.
- **Fica só no servidor** (`olorin-config.php` ou `config.php`, modelo em `config.example.php`): e-mail de destino, dados do SMTP (com a senha), domínios aceitos, pasta dos leads e `lead_webhook_url`.
- **Campos da config que existem, mas não têm efeito no código:** `APPROVED_ASSETS` (quem decide se uma imagem é publicada é o campo `publicar` do `manifest.json`) e `adsId`/`adsLabel` no navegador (nenhum script usa; as conversões dependem do GTM). Ver seção 13.1.

---

## 5. Pipeline de build

### 5.1 Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor local em `http://localhost:8081`, com recarga automática, guia `/_estilo/` e marcadores `[CONFIRMAR]` visíveis. Sem CSS crítico, sem minificação, sem verificação. |
| `npm run build` | `dist/` de produção + `verificar-build.mjs`. Qualquer erro interrompe com código 1. |
| `npm run build:dev` | Gera o `dist/` em modo de desenvolvimento, sem verificação. |
| `npm test` | Testes no `dist/` já gerado (seção 12). |
| `npm run og` | Regera as imagens de compartilhamento em `src/assets/og/` (precisa do Chromium). Não faz parte do build: as imagens ficam no Git. |
| `npm run pendencias` | Lista todos os `[CONFIRMAR]` de `src/content/` e `src/_data/`. |
| `npm run legibilidade` | Índice de Flesch adaptado ao português no texto visível do `<main>` de cada página do `dist/` (seção 12). |
| `npm run capturas` | Telas de página inteira em 360, 390, 768, 1024 e 1440 px, salvas em `docs/screenshots/` (seção 12). |
| `npm run deploy:dry` | Lista o que seria enviado. Com `.env` completo, só testa a conexão. Não roda o build. |
| `npm run deploy` | `build` → `test` → backup do servidor → envio por FTP/FTPS. |

A variável de ambiente `OLORIN_SAIDA` troca a pasta de saída (padrão `dist/`) no build, na verificação, nas capturas e na legibilidade. Serve para gerar um build de teste sem mexer no `dist/`.

### 5.2 Etapas do `npm run build`, na ordem

1. **Limpeza:** em produção, `eleventy.before` apaga o `dist/` (uma vez por execução).
2. **CSS** (`scripts/assets.mjs → construirCss`):
   - concatena os 36 arquivos de `ORDEM_CSS` (falha se um não existir);
   - se houver **fontes licenciadas** em `src/assets/fonts/licenciadas/`, acrescenta o `@font-face` delas e redefine `--fonte-titulo`/`--fonte-pixel` (ver 5.4);
   - Lightning CSS: minifica em produção e ajusta a sintaxe para Chrome 100, Firefox 100 e Safari 15;
   - nome com os 10 primeiros caracteres do SHA-256 do conteúdo (`olorin.<hash>.css`). Versões antigas na pasta de saída são apagadas.
3. **JS** (`construirJs`): esbuild empacota `src/scripts/main.js` num arquivo IIFE (ES2019), minificado em produção, sem comentários de licença, com o mesmo esquema de hash (`olorin.<hash>.js`).
4. **Pré-carregamento de fontes:** a lista é fixa no código. Se a Integral CF licenciada existir, ela substitui a `archivo-expanded-900`. A `cascadia-code-400` é sempre pré-carregada. Não há medição automática da cadeia crítica (o PROMPT 14 pedia medir com Coverage).
5. **Imagens** (`scripts/imagens.mjs`), para cada item de `src/assets/manifest.json` sem `publicar: false`:
   - lê o original em `src/assets/img-src/`, corrige a rotação pelo EXIF, aplica o recorte opcional (`recorte: [esquerda, topo, largura, altura]`) e o tratamento opcional preto e branco (`tratamento: pb`);
   - gera cada largura de `larguras` (padrão 480 e 960, nunca maior que o original) em AVIF (qualidade 52) e WebP (qualidade 74). O sharp não copia metadados (EXIF/GPS) por padrão;
   - guarda o resultado em `.cache/img/`, com chave = hash do original + parâmetros, e copia para `dist/assets/img/<id>-<largura>.<formato>`;
   - o filtro `imagem()` monta o `<picture>` com `srcset`/`sizes`, `width`/`height` reais, `loading="lazy"` + `decoding="async"`, ou `fetchpriority="high"` na imagem principal. Se um template pedir uma imagem que não está no manifesto, o build para com erro.
6. **Páginas:** Eleventy renderiza os templates. Arquivos copiados como estão: fontes, ícones (`assets/img/brand`), imagens OG (`assets/img/og`), `config.example.php`, `.htaccess`, `leads/.htaccess` e `favicon.ico`.
7. **CSS crítico** (`scripts/pos-processar.mjs`, só em produção): o Beasties 0.5.4 lê cada `.html` e embute no `<head>` as regras usadas naquela página, mais as da lista `SEMPRE` (estados criados por JS: `html.js`, `data-form-variant`, `data-etapa` etc., para não haver pulo de layout). A folha completa passa a carregar sem bloquear a pintura (`media="print"` trocado para `all` no `onload`), com `<noscript>` de reserva.
8. **Verificação** (`scripts/verificar-build.mjs`):

| Grupo | Erro (para o build) | Aviso |
|---|---|---|
| Arquivos | Faltar algum dos 15 obrigatórios (`index.html`, `404.html`, `.htaccess`, `enviar.php`, `robots.txt`, `sitemap.xml`, `llms.txt`...). Ter `config.php`/`olorin-config.php`, `_estilo/`, `.md`, `.yml`, `.csv`, `.env` ou `.log` no pacote | Fonte paga dentro do pacote |
| Texto (todos os arquivos de texto) | `[CONFIRMAR`; domínio errado; `olorin.digital` fora do Instagram; link `wa.me` para número diferente do da config | Telefone de exemplo |
| Cada página HTML | `<title>` vazio ou com mais de 60 caracteres; description vazia ou com mais de 155; número de `<h1>` diferente de 1; sem `lang="pt-BR"`; canonical fora de `https://olorin.com.br/`; `<img>` sem `alt`; `id` repetido; `for`/`aria-*` apontando para `id` inexistente; JSON-LD que não é JSON válido; `target="_blank"` sem `rel="noopener"` | `<img>` sem `width`/`height`; `<title>` repetido entre páginas indexáveis |
| Formulário × PHP | Chip ou faixa que não está na lista do `enviar.php`; sobra de Nunjucks no PHP | — |
| Sitemap | URL sem página; página `noindex` no sitemap; página indexável fora do sitemap | — |
| Peso | — | JS acima de 60 KiB ou CSS acima de 90 KiB (sem compressão) |

### 5.3 Pesos medidos (dist de 09/10/2026, 09:31)

| Arquivo | Tamanho | Comprimido (gzip -9) |
|---|---|---|
| `olorin.<hash>.css` | 85,6 KiB | 17,1 KiB |
| `olorin.<hash>.js` | 23,7 KiB | 8,6 KiB (meta do PROMPT: menos de 15 KiB ✔) |
| Home (`index.html`), com 64,2 KiB de CSS embutido | 146,2 KiB | 32,7 KiB |
| Página de serviço (média), com cerca de 49 KiB de CSS embutido | cerca de 105 KiB | cerca de 23,6 KiB |
| Landing de campanha (média), com cerca de 31 KiB de CSS embutido | cerca de 56 KiB | cerca de 14,6 KiB |
| 5 arquivos de fonte (2 pré-carregados: 10,4 + 17,4 KiB) | 59,5 KiB | — (`.woff2` já é comprimido) |
| Imagem do banner no celular (`hero-celular-540.avif`, a maior candidata) | 36,3 KiB | — (meta: até 45 KiB ✔) |

### 5.4 Fontes

- **Fontes livres** (Archivo Expanded 800 e 900, Cascadia Code 400 e 700, Silkscreen 400): os `.woff2` em `src/assets/fonts/` **já estão reduzidos** aos caracteres do português (`LICENCA-FONTES.txt`) e são copiados como estão, com `font-display: swap`.
- **O build não faz o subset.** O corte foi feito uma vez, fora do pipeline, e nenhum script do repositório o refaz. Uma fonte nova (ou uma licenciada em `.ttf`/`.otf`) entra inteira, sem redução.
- **Fontes licenciadas, detectadas automaticamente:** se existir `src/assets/fonts/licenciadas/integral-cf-bold.<ext>` ou `retro-computer.<ext>` (procura `woff2`, depois `woff`, `ttf` e `otf`), o build:
  1. gera o `@font-face` com métricas verticais ajustadas (`ascent-override`, `descent-override`, `line-gap-override`) para a altura dos títulos ficar igual à das substitutas;
  2. troca `--fonte-titulo` (Integral CF) e `--fonte-pixel` (Retro Computer), mantendo as livres como reserva;
  3. passa a pré-carregar a Integral CF no lugar da Archivo 900.

  A pasta está no `.gitignore` (licença individual, não pode ser redistribuída), e o build avisa que o arquivo vai no pacote. **Ainda não estão presentes:** hoje o site usa as fontes livres.
- **Não implementado:** fontes de reserva com `size-adjust` e métricas próprias para reduzir o deslocamento na troca de fonte (PROMPT 14). Os ajustes de métricas só existem para as fontes licenciadas. Motivo não registrado.

### 5.5 Imagens de compartilhamento (OG)

`npm run og` monta cada imagem em HTML/CSS, com as fontes do site embutidas, e fotografa em 1200×630 com o Chromium. Gera: `home.jpg`, `servicos.jpg`, `sobre.jpg`, `promo.jpg` e `servico-<slug>.jpg` (6). Títulos longos têm a fonte reduzida até caber (de 64 até 36 px). Política, obrigado, 404 e páginas de case usam a da home. O build não confere se a imagem apontada em `og_imagem` existe.

---

## 6. Modos de página: completo × campanha

### 6.1 Tabela de modos

Cada página define `modo` (no front matter ou no layout). Esse valor vai para `window.OLORIN_CONFIG.modo`, para o parâmetro `page_mode` de todos os eventos e para o campo oculto `modo_pagina` do formulário.

| `modo` | Páginas | Cabeçalho/rodapé | Indexável | Canonical | Formulário |
|---|---|---|---|---|---|
| `home` | `/` | completo | sim | própria | etapa 1 no topo + completo no fim |
| `hub` | `/servicos/` | completo | sim | própria | completo no fim |
| `servico` | `/servicos/<slug>/` (6) | completo | sim | própria | etapa 1 no topo + completo no fim, com o serviço marcado |
| `sobre` | `/sobre/` | completo | sim | própria | completo no fim |
| `cases` e `case` | `/cases/` e `/cases/<slug>/` (só com case aprovado; hoje nenhum) | completo | sim | própria | completo no fim |
| `promo` | `/promo/` e `/promo/<slug>/` (6) | **mínimo** (logo + 1 botão, sem menu) | **não** | `/promo/` → própria; `/promo/<slug>/` → `/servicos/<slug>/` | completo **no topo** |
| `obrigado` | `/obrigado/` | completo | não | própria | — |
| `erro` | `/404.html` | completo | não | própria | — |
| `simples` | política de privacidade (e `/_estilo/` no dev) | completo | sim (política) | própria | — |

### 6.2 Modo completo × modo campanha (mesma fonte)

- Os dois modos de um serviço leem **o mesmo arquivo** `src/content/servicos/<slug>.yml`. Nada é copiado à mão.
- **Modo completo** (`src/servicos/servico.njk`), na ordem do PROMPT 9.2: migalhas, banner com CTA e janela `.exe` do serviço, índice de seções, etapa 1 do formulário, resposta curta (com data de atualização), dores, para quem é / não é, entregas, como funciona (+ "primeiros 90 dias" se houver), o que precisamos de você, quem faz, cases do serviço (só com case aprovado), quanto custa, combina com, FAQ do serviço e formulário completo.
- **Modo campanha** (`src/promo/servico.njk` + `layouts/campanha.njk` + `partials/campanha-blocos.njk`): usa do mesmo YAML só `campanha.titulo`, `campanha.subtitulo`, `campanha.faq` (ids das perguntas), `resposta_curta` e `preco`. Ordem: banner com o formulário completo → números (se `SHOW_STATS` e houver itens verificados) → "Como funciona" em 3 passos (texto comum, de `paginas/promo.yml`) → preço resumido → perguntas → CTA final.
- **Sinais de "não indexar"**, todos implementados: `<meta name="robots" content="noindex, follow">`, cabeçalho `X-Robots-Tag: noindex, follow` no `.htaccess` (para `/promo` e `/obrigado`), `data-mode="campanha"` no `<body>` e fora do sitemap.
- **Saídas da landing:** só WhatsApp e Política de Privacidade (o logo não é link). Conferido no `dist/`.
- **`/promo/?s=<slug>`:** um script embutido logo após o banner troca título e subtítulo pelos do serviço, marca o chip e preenche `servico_pagina`. Só aceita slugs que existiam no build (lista fechada). Se o slug não existir, fica o texto geral. A troca de **imagem** pedida no PROMPT 11.2 **não se aplica**: o banner da `/promo/` não tem imagem.
- **Divergências** (seção 13.1): `page_mode` sai como `"promo"`, e não `"campanha"` (PROMPT 11.1); e o `robots.txt` bloqueia `/promo/` e `/obrigado/`, o que o PROMPT proíbe.

### 6.3 Posição do formulário (teste A/B)

- `FORM_TOP_VARIANT` em `config.json`: `"a"` (só no fim), `"b"` (etapa 1 abaixo do banner + completo no fim; **valor atual**) ou `"ab"` (sorteio).
- Um script no `<head>`, antes do CSS, marca `<html class="js" data-form-variant="a|b">` e guarda a variante em `sessionStorage` (`olorin_variante`). `?v=a` ou `?v=b` força a variante. Assim não há pulo de layout.
- Na variante A, o CSS esconde `.o-form-topo`. A variante vai em todo evento (`form_variant`) e no campo oculto `variante_formulario`.
- Sem JavaScript, o atributo não existe, e a página se comporta como a variante B.
- **Problema latente na variante A:** o botão principal do banner (`#cta-diagnostico-hero`) e o da página de serviço apontam para `#diagnostico`, que é justamente a seção escondida. Com `"a"` ou `"ab"`, o botão principal não leva a lugar nenhum (seção 13.1).
- Em `/promo/*` o formulário fica sempre no topo, independentemente da variante.

---

## 7. Formulário em 2 etapas e contrato com o PHP

### 7.1 Componente único

`{{ formulario({ id, posicao, modo, servico, nomeServico, origemWa, plano }) }}` em `src/_includes/components/formulario.njk`. `posicao` = `topo` (abaixo do banner), `fim` (CTA final) ou `promo` (landing). Os textos vêm de `formulario.yml`. O botão diz "Quero meu diagnóstico" no topo e nas landings (se `OFERTA_DIAGNOSTICO`) e "Pedir orçamento" no fim.

| Etapa | Campos |
|---|---|
| 1 · Seus contatos | `nome` (obrigatório, 2 a 80), `whatsapp` (obrigatório, `inputmode="tel"`, `autocomplete="tel-national"`), `site` (opcional) |
| 2 · O que você precisa | `servicos[]` (chips), `investimento` (select), `mensagem` (opcional, até 1.500), `consentimento` (obrigatório, com link para a Política) |
| Ocultos | `olorin_ts`, `olorin_tempo`, `plano`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `gbraid`, `wbraid`, `fbclid`, `primeiro_toque`, `pagina`, `referencia`, `modo_pagina`, `servico_pagina`, `posicao_formulario`, `variante_formulario` |
| Isca (honeypot) | `empresa_url`, dentro de um bloco fora da tela com `aria-hidden="true"`; o campo tem `tabindex="-1"` e `autocomplete="off"` |

### 7.2 Comportamento

**Sem JavaScript:** as duas etapas aparecem juntas (o CSS só separa as etapas quando existe `html.js`). O envio é um POST comum para `/enviar.php`. Sucesso → redirecionamento 303 para `/obrigado/`. Erro → página HTML simples com a mensagem, a lista de campos, "Voltar ao formulário" e "Chamar no WhatsApp". O link "Prefere conversar agora? Chame no WhatsApp" fica sempre visível abaixo do formulário.

**Com JavaScript** (`src/scripts/modulos/formulario.js`):

- desliga a validação nativa (`novalidate`) e valida por etapa: nome com 2+ caracteres; WhatsApp com 10 ou 11 dígitos, DDD da lista da Anatel (a mesma do PHP) e 9 na terceira posição quando há 11 dígitos; consentimento marcado;
- aplica a máscara `(41) 99999-9999` enquanto digita;
- mostra o erro em cada campo (`aria-invalid` + `aria-describedby`), resume em `role="status"` + `aria-live="polite"` e põe o foco no primeiro campo inválido;
- ao trocar de etapa, põe o foco no título (`legend`) da nova etapa. "Voltar e editar contatos" não perde dados. Enter na etapa 1 avança;
- "Ainda não invisto" mostra a linha honesta do PROMPT 10.3 (por CSS `:has`, com classe de reserva para navegadores antigos);
- preenche os campos ocultos: horário de abertura (`olorin_ts`), origem da visita (seção 9.3), página, referência e variante. No envio, calcula `olorin_tempo` (segundos desde a abertura);
- bloqueia o duplo clique (flag `enviando`, `disabled`, `aria-busy`, texto "Enviando…") e envia por `fetch` com `Accept: application/json`;
- **sucesso:** grava em `sessionStorage` (`olorin_lead_pendente`) um token aleatório + plano, serviços, faixa de verba, página do serviço e posição (**sem nome nem telefone**) e vai para `/obrigado/`;
- **erro do servidor:** marca os campos devolvidos em `fields` (volta para a etapa 1 se o erro for de nome ou WhatsApp) e mostra a mensagem + um link de WhatsApp com o que a pessoa já digitou (nome, serviços, verba, site), com `[ref: form-erro-<posição>]`. Sem conexão: mensagem própria + o mesmo link.

### 7.3 Contrato HTTP com `enviar.php`

**Requisição:** `POST /enviar.php`, `application/x-www-form-urlencoded` (sem JS) ou `multipart/form-data` (`FormData`, com JS). O modo da resposta depende do cabeçalho `Accept`: se contém `application/json`, o PHP responde JSON; senão, redireciona ou mostra a página de erro.

**Ordem de processamento no PHP:**

1. só aceita `POST` (senão, 405);
2. confere a origem: `Origin` (ou, sem ele, `Referer`) precisa ser `olorin.com.br`, `www.olorin.com.br` (lista `dominios` da config) ou o próprio host da requisição. Senão, **403**;
3. isca preenchida → responde **sucesso** sem gravar nada (o robô não percebe);
4. tempo mínimo: lê `olorin_tempo` (segundos) ou, na falta dele, `olorin_ts` (carimbo de até 2 dias atrás). Menos de 3 s → **429**;
5. limpa e valida todos os campos (7.4). Erro → **422** com `fields`;
6. limite por IP: 6 pedidos **válidos** a cada 10 minutos. Acima disso → **429**;
7. envia o e-mail (SMTP autenticado; sem senha configurada, tenta a função `mail()` do PHP);
8. grava o CSV mensal (seção 8);
9. chama o webhook, se configurado (só `https://`, 3 s de limite, falha silenciosa);
10. se nem o e-mail nem o CSV funcionaram → **500**. Se só o e-mail falhou, registra no log de erros do PHP e responde sucesso (o pedido está no CSV).

**Respostas JSON:**

| Situação | Status | Corpo |
|---|---|---|
| Sucesso | 200 | `{ "ok": true, "message": "Recebido.", "redirect": "/obrigado/", "whatsapp": "<link com [ref: obrigado]>" }` |
| Isca preenchida | 200 | `{ "ok": true, "redirect": "/obrigado/" }` |
| Campos inválidos | 422 | `{ "ok": false, "message": "Confira os campos destacados.", "fields": { "nome": "...", "whatsapp": "...", "consentimento": "..." } }` |
| Rápido demais / limite por IP | 429 | `{ "ok": false, "message": "..." }` |
| Origem de outro site | 403 | `{ "ok": false, "message": "Envio recusado: origem desconhecida." }` |
| Nada registrado | 500 | `{ "ok": false, "message": "Não conseguimos registrar agora." }` |

Os campos `ok`, `message`, `fields` e `whatsapp` mantêm o contrato do site anterior (PROMPT 10.4). O link de WhatsApp pré-preenchido do erro é montado pelo navegador, com os dados digitados, e não pelo PHP.

### 7.4 Tratamento de cada campo no servidor

| Campo | Tratamento |
|---|---|
| `nome`, `site`, UTMs, ids de clique, `pagina`, `referencia`, `primeiro_toque` | uma linha só: sem tags, sem caracteres de controle nem quebras de linha, espaços repetidos reduzidos, tamanho máximo por campo |
| `mensagem` | mantém as quebras de linha e tira o resto; até 1.500 caracteres |
| `whatsapp` | só dígitos, tira o `55` inicial, exige 10 ou 11 dígitos, DDD válido e 9 no celular; normaliza para `+55DDDNÚMERO` (usado no e-mail e no webhook). Na planilha vira `(41) 99999-0000` + coluna `whatsapp_link` |
| `servicos[]` | só as opções da lista gerada (+ lista antiga do `config.php`, se houver) |
| `investimento`, `plano`, `servico_pagina` | só valores da lista gerada; senão, vazio |
| `modo_pagina`, `posicao_formulario`, `variante_formulario` | listas fixas no PHP. A de `modo_pagina` aceita `home`, `servico`, `promo`, `sobre`, `hub`, `simples`, `obrigado` e `erro`: **não inclui** `cases` nem `case` (seção 13.1) |
| `consentimento` | vira a data e hora do aceite |

**Assunto do e-mail:** `Novo lead: {plano ou serviços ou "orçamento"} | {origem}`. A origem é `utm_source/utm_medium` ou, na falta deles, "google ads" (gclid/gbraid/wbraid), "meta" (fbclid), o domínio de referência ou "site (direto)". O corpo lista os campos preenchidos com rótulos em português e termina com o link para responder no WhatsApp do cliente.

### 7.5 Página `/obrigado/`

`noindex`, botão "Adiantar pelo WhatsApp" (`[ref: obrigado]`), link de agendamento só se `SCHEDULING_URL` existir e links de "Enquanto isso". O módulo `medicao.js` lê o token de `olorin_lead_pendente`. Se ele ainda não está em `olorin_leads_registrados`, dispara `generate_lead` **uma vez** e apaga o pendente. Recarregar a página não duplica (isso é testado).

---

## 8. Segurança

| Ameaça | Controle implementado | Onde | Limite conhecido |
|---|---|---|---|
| Senha do e-mail exposta | Config procurada primeiro **fora** do site (`../olorin-config.php`); a reserva `config.php` fica bloqueada no `.htaccess`. `TROCAR_NO_SERVIDOR` é tratado como senha vazia. `.gitignore` exclui `config.php`, `olorin-config.php` e `.env*`. O build falha se houver `config.php` no `dist/`. O deploy nunca envia nem baixa esses arquivos | `enviar.njk`, `.htaccess`, `.gitignore`, `verificar-build.mjs`, `deploy.mjs` | Depende de a Locaweb permitir o PHP ler um nível acima do `public_html` (pergunta 0.5.10, não confirmada) |
| Planilha de leads aberta na web | CSV mensal `AAAA-MM.csv` gravado na primeira pasta que funcionar: `pasta_leads` da config → `../leads` (fora do site) → `leads/` dentro do site. Neste último caso, cria o `.htaccess` de bloqueio se faltar. Pasta criada com permissão 0750. O build também entrega `leads/.htaccess` (`Require all denied`) | `enviar.njk`, `src/servidor/leads.htaccess` | — |
| Envio a partir de outro site | `Origin`/`Referer` precisam ser do próprio domínio (403). Testado pelo `npm test` | `enviar.njk` | Um robô que não manda nenhum dos dois cabeçalhos passa (navegadores sempre mandam) |
| Robôs de formulário | Isca `empresa_url` (finge sucesso) | `formulario.njk`, `enviar.njk` | — |
| Envio rápido demais | Tempo mínimo de 3 s | `enviar.njk` | **Só vale quando o campo de tempo chega preenchido.** Sem JS os campos vão vazios (de propósito, para não barrar quem não tem JS), e um robô que simplesmente não manda os campos também passa (seção 13) |
| Inundação | 6 pedidos válidos por IP a cada 10 min, contados em arquivo na pasta temporária do sistema (`olorin_rl_<hash do IP>`) | `enviar.njk` | Pedidos inválidos não contam; numa hospedagem compartilhada a pasta temporária pode ser limpa a qualquer momento |
| Injeção de cabeçalho no e-mail | Campos de uma linha sem quebra de linha; assunto e remetente codificados em base64; destinatário fixo da config; corpo em base64 | `enviar.njk` | — |
| Injeção de fórmula na planilha | Valores que começam com `=`, `+`, `-`, `@`, tab ou retorno ganham um `'` na frente. O WhatsApp vai para a planilha no formato `(41) 99999-0000` (não começa com `+`), seguido de uma coluna `whatsapp_link` com o link da conversa | `enviar.njk` | — |
| Valores fora do esperado | Listas fechadas para serviços, investimento, plano, slugs, modo, posição e variante | `enviar.njk` | — |
| HTML/JS injetado pelo conteúdo | `emLinha` escapa tudo antes de aplicar `**negrito**` e `[link](url)`; JSON-LD e config passam por `jsonSeguro` (escapa `<`, `>`, `&`); o build exige `rel="noopener"` em `target="_blank"` | `filtros.mjs`, `verificar-build.mjs` | — |
| Arquivos sensíveis no servidor | `.htaccess`: `Options -Indexes`; bloqueio de `config*.php`, `olorin-config.php`, `.csv`, `.log`, `.md`, `.yml`, `.bak`, `.sql`, `.zip`, `.env`, `.ini`, `.sh`, `LEIA-ME.txt`, `license.txt`, `readme.html` e `error_log`; bloqueio de `.git` e `node_modules` | `src/servidor/.htaccess` | — |
| Cabeçalhos de segurança | `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy` (câmera, microfone, localização, pagamento e USB desligados) | `.htaccess` | — |
| Scripts injetados | `Content-Security-Policy-Report-Only` já liberando GTM, GA4, Google Ads e Meta | `.htaccess` | Só observa (não bloqueia), aceita `'unsafe-inline'` e não tem endereço de relatório: os avisos só aparecem no console do navegador |
| Tráfego sem criptografia | Redirecionamento para `https://olorin.com.br` (sem www) em duas variantes (direta e atrás de proxy) e HSTS | `.htaccess` | **Comentados.** Precisam ser ativados à mão depois de confirmar o SSL (`docs/DEPLOY.md`). Até lá, o site aceita `http://` e `www.` |
| Publicação destrutiva | O deploy nunca apaga; faz backup antes; envia CSS/JS/imagens antes do HTML | `deploy.mjs` | Arquivos antigos acumulam no servidor |

---

## 9. Rastreamento com consentimento

### 9.1 Ligado ou desligado

- **Desligado** (hoje): `GTM_ID`, `GA4_ID` e `META_PIXEL_ID` vazios. Não aparece aviso de cookies nem "Preferências de cookies" no rodapé, e nenhum script de terceiros carrega. Os eventos continuam indo para `window.dataLayer`, mas ninguém os lê.
- **Ligado** (algum ID preenchido):
  1. `consentimento.js` envia ao `dataLayer` o padrão do Consent Mode v2: `ad_storage`, `ad_user_data`, `ad_personalization` e `analytics_storage` como `denied`, com `wait_for_update: 500`;
  2. o aviso (`partials/cookies.njk`) tem três botões com o mesmo estilo: Aceitar tudo, Recusar e Personalizar (Necessários sempre ligados, Análise, Marketing);
  3. a escolha fica em `localStorage` (`olorin_consentimento`), com a data. "Preferências de cookies" no rodapé reabre o aviso;
  4. com Análise ou Marketing permitidos, `consent update` + carregamento **quando o navegador estiver livre**: o GTM, se houver `GTM_ID`; senão, `gtag.js` do GA4 (só com Análise) e o Pixel da Meta com `PageView` (só com Marketing).
- O GTM processa os eventos que já estavam no `dataLayer` quando carrega, então o `generate_lead` da `/obrigado/` não se perde se o GTM chegar depois.

### 9.2 Eventos (`track()` em `src/scripts/modulos/rastreamento.js`)

**Parâmetros comuns:** `page_mode`, `page_slug`, `form_variant` e, se existirem, `utm_source`/`utm_medium`/`utm_campaign` do último toque.

**Proteção de dados pessoais:** descarta parâmetros cujo nome contenha nome, name, whatsapp, telefone, phone, email ou mensagem, e qualquer texto que pareça e-mail ou tenha 10 ou mais dígitos. O `npm test` confere que nome e telefone do teste não aparecem no `dataLayer`.

| Evento (PROMPT 13.4) | Implementado | Quando dispara no código |
|---|---|---|
| `cta_click` | sim | clique em elemento com `id="cta-*"` ou `data-cta` (`cta_id`, `cta_label`, `cta_position` = `data-secao` mais próximo, `destino`) |
| `whatsapp_click` | sim | clique em link `https://wa.me/` (`origem` lida do `[ref: ...]`, `servico`) |
| `service_card_click` | sim | link do card de serviço |
| `form_view` | sim | formulário 50% visível (uma vez por formulário) |
| `form_start` | sim | primeiro foco em qualquer campo |
| `form_step1_complete` | sim | "Continuar" válido |
| `form_error` | sim | erro de validação, do servidor ou de conexão (`campo`, `tipo`, `posicao`) |
| `generate_lead` | sim | `/obrigado/`, uma vez por token |
| `pricing_plan_click` | sim | "Quero esse" (também preenche `plano` e pré-marca os serviços no formulário do fim) |
| `calculator_use` | sim | mudança na calculadora |
| `faq_open` | sim | `<details>` aberto (`pergunta_id` = id estável da pergunta) |
| `scroll_depth` | sim | 25, 50, 75 e 90% |
| `section_view` | sim | elemento com `data-secao` 40% visível |
| `consent_update` | sim | escolha no aviso (`analytics`, `marketing`) |

### 9.3 Origem da visita

`origem.js` guarda em `sessionStorage` (`olorin_origem`): o **primeiro** e o **último** conjunto de `utm_*`/`gclid`/`gbraid`/`wbraid`/`fbclid` vistos na sessão, a página de **entrada** e a **referência** externa. O formulário envia o último toque nos campos próprios e o primeiro toque resumido em `primeiro_toque` (por exemplo, `utm_source=google&utm_medium=cpc | entrada=/servicos/trafego-pago/`).

### 9.4 Links de WhatsApp

Todos os links do site são montados por `waLink(origem, contexto)`. A mensagem é escolhida por tipo (padrão, diagnóstico, serviço, plano, dúvida, equipe, obrigado, erro) e recebe o sufixo ` [ref: <origem>]`. O build recusa qualquer `wa.me/` com número diferente do da config.

### 9.5 O que não está no código (fica para a configuração do GTM)

- **Conversões do Google Ads e `Lead` da Meta:** o PROMPT 10.6 diz que disparam na `/obrigado/`. O código só publica `generate_lead` no `dataLayer`. `GADS_CONVERSION_ID`/`LABEL` chegam ao navegador, mas nenhum script os usa, e não há `fbq('track', 'Lead')`. **Sem GTM, essas conversões não acontecem.** `ViewContent` nas páginas de serviço também não é disparado pelo código.
- **Leads enviados sem JavaScript** chegam por e-mail e CSV, mas não geram `generate_lead` (não há token na sessão).
- **Modo de consentimento "básico":** nada do Google carrega antes da escolha, então não há sinais sem cookies para modelagem. É a opção mais conservadora para a LGPD, ao custo de menos dados de quem recusa.
- O passo a passo de tags, gatilhos e variáveis do GTM é assunto de `docs/TRACKING.md`.

---

## 10. Desempenho

**Implementado**

- HTML pronto no servidor; nenhum framework; um CSS e um JS por site, com hash no nome e cache de 1 ano (`immutable`); HTML com `no-cache`.
- CSS da página embutido e folha completa sem bloquear a pintura (seção 5.2, etapa 7).
- JS com `defer`, 8,6 KiB comprimido; inicializações não essenciais em `requestIdleCallback` (com reserva por `setTimeout`); erros de um módulo não derrubam os outros (`rodar()` em `main.js`).
- **Reflow forçado corrigido** (PROMPT 14): as faixas animadas medem tudo primeiro e só depois escrevem, dentro de `requestAnimationFrame`. As animações de entrada leem posições num quadro e observam com IntersectionObserver.
- Listeners de rolagem passivos e agrupados por `requestAnimationFrame` (cabeçalho e `scroll_depth`). IntersectionObserver para formulários visíveis, seções vistas, índice da página de serviço, botões flutuantes e contadores.
- Cursor-estrela só com mouse (`hover: hover` e `pointer: fine`), sem "reduzir movimento" e se `CURSOR_ESTRELA` for `true`. Não esconde o cursor do sistema.
- Imagens: AVIF + WebP com `srcset`/`sizes`, `width`/`height` reais, `lazy` abaixo da dobra e `fetchpriority="high"` na imagem do banner (sem `lazy`).
- Fontes no próprio domínio (sem Google Fonts), `font-display: swap`, 2 pré-carregamentos.
- GTM e Pixel só depois do consentimento **e** quando o navegador estiver livre.
- Compressão `mod_deflate` para HTML, CSS, JS, JSON, XML, SVG e manifesto.

**Não implementado**

| Item do PROMPT 14 | Situação |
|---|---|
| `content-visibility: auto` com `contain-intrinsic-size` abaixo da dobra | Não existe no CSS. Motivo não registrado (o PROMPT alerta para o cuidado com âncoras). |
| Brotli | Só `mod_deflate` no `.htaccess`. A Locaweb não foi consultada sobre `mod_brotli`. |
| Métricas de fonte de reserva (`size-adjust`) | Só para as fontes licenciadas (seção 5.4). |
| Pré-carregamento medido com Coverage | Lista fixa no código (Archivo 900 + Cascadia 400). A Silkscreen, apontada pela auditoria como parte da primeira dobra, não é pré-carregada. |
| Imagens com cache `immutable` | Os nomes das imagens não têm hash. Por isso o `.htaccess` dá 30 dias, e não 1 ano. |
| Medição antes/depois em `docs/PERFORMANCE.md` | Fora do escopo deste documento; não há Lighthouse automatizado no repositório (seção 12). |

---

## 11. Acessibilidade

**Garantido pelo build** (o build falha se quebrar): `lang="pt-BR"`, um único `<h1>` por página, `alt` em toda imagem, nenhum `id` repetido, `for`/`aria-labelledby`/`aria-describedby`/`aria-controls` sempre apontando para um `id` existente.

**Implementado nos templates e no JS**

- Link "Pular para o conteúdo" e `<main id="conteudo" tabindex="-1">`; marcos `header`, `nav`, `main` e `footer`.
- Menu do celular como diálogo (`role="dialog"`, `aria-modal`), `inert` quando fechado, foco preso enquanto aberto, `Esc` fecha e devolve o foco ao botão; serviços em acordeão com `aria-expanded`/`aria-controls`.
- Submenu de serviços no desktop: `aria-expanded`, `Esc` fecha, fecha ao sair com o foco ou clicar fora. `aria-current="page"` no menu e nas migalhas.
- Formulário: rótulos visíveis, erros por campo com `aria-describedby`/`aria-invalid`, região `aria-live`, foco no primeiro erro e no título da etapa, `aria-busy` no envio.
- Checklist de dores e filtros do portfólio com `aria-pressed`; FAQ com `<details>/<summary>`; calculadora com tabela equivalente (visível sem JS e disponível para leitores de tela com JS).
- Card de serviço com um único link no título, estendido por `::after` (o card inteiro é clicável sem links duplicados).
- `prefers-reduced-motion` respeitado em todas as animações, mais o botão **"Pausar animações"** no rodapé (WCAG 2.2.2), lembrado em `localStorage`. Os contadores animados têm o valor final num texto só para leitores de tela.

**Não automatizado:** teste manual com NVDA/VoiceOver (roteiro em `docs/A11Y.md`) e testes de teclado por componente. O axe-core roda, mas só reprova violações "sérias" e "críticas" (seção 12).

---

## 12. Verificação e testes

**`npm test` (`scripts/testar.mjs`), no `dist/` já gerado, com Chromium (Playwright):**

1. Todas as páginas do sitemap + `/obrigado/`, `/404.html`, `/promo/` e as 6 landings, em 360 e 1440 px: nenhum erro de JavaScript ou de console, exatamente 1 `<h1>`, nenhuma rolagem horizontal, nenhum texto quebrado (`[object Object]`, `undefined`, `NaN`, `[CONFIRMAR`).
2. axe-core (regras WCAG 2.0/2.1/2.2 A e AA) em 7 páginas (home, hub, tráfego pago, sobre, promo, obrigado, política), em 390 e 1280 px. Reprova só violações "sérias" ou "críticas".
3. Formulário de ponta a ponta com o **PHP de verdade** (`php -S`, se o PHP estiver instalado; sem PHP, o teste é pulado com aviso), numa cópia temporária do `dist/` com config de teste: erro de nome vazio, DDD inexistente recusado, etapa 2, envio com UTM, redirecionamento para `/obrigado/`, `generate_lead` exatamente uma vez, recarga sem duplicar, nenhum dado pessoal no `dataLayer`, pedido no CSV com WhatsApp legível, link da conversa e UTM, e 403 para envio vindo de outro site.

**Ferramentas de apoio, rodadas à mão (não fazem parte do `npm test` nem do deploy):**

- `npm run capturas`: telas de página inteira em 360, 390, 768, 1024 e 1440 px, gravadas em WebP em `docs/screenshots/`. Acusa rolagem horizontal e erros de JavaScript. Se `site-atual/` existir, captura também a home antiga para comparar.
- `npm run legibilidade`: índice de Flesch adaptado ao português (Martins et al., 1996) sobre o texto visível do `<main>` de cada página. Meta: "fácil" (50 ou mais) e até 18 palavras por frase em média.
- `npm run pendencias`: lista os `[CONFIRMAR]`.

**O que o PROMPT 20 pede e ainda não está automatizado:** Lighthouse CI (o pacote `lighthouse` está instalado, mas nenhum script o usa); WebKit; testes de isca, tempo mínimo, limite por IP, fluxo sem JS, persistência de UTM entre páginas, modo campanha, `?s=`, `?v=`, barra fixa, calculadora e teclado; `html-validate`, `linkinator` e verificação ortográfica (`nspell` + `dictionary-pt`), todos instalados e não usados; comparação automática entre o FAQ visível e o JSON-LD (hoje garantida porque os dois saem do mesmo dado, mas sem teste). A pasta `.github/workflows/` existe e está vazia.

---

## 13. Riscos e trade-offs

### 13.1 Lacunas e bugs encontrados (código × PROMPT)

Em ordem de prioridade. Nenhum foi corrigido por este documento.

| # | O quê | Onde | Efeito | Correção sugerida |
|---|---|---|---|---|
| 1 | **`robots.txt` bloqueia `/promo/` e `/obrigado/`** (`Disallow` para todos e de novo para GPTBot e ClaudeBot). O PROMPT 11.1, 15.4 e 23 proíbem: o certo é só `noindex` | `src/seo/robots.njk` | O Google não lê o `noindex` de páginas bloqueadas e pode listar a URL sem conteúdo se ela tiver links. O próprio comentário do arquivo contradiz o PROMPT | Tirar as linhas `Disallow: /promo/` e `Disallow: /obrigado/` (manter `/enviar.php` e `/leads/`) |
| 2 | **Variante A do formulário quebra o botão principal**: `#cta-diagnostico-hero` e o botão do banner do serviço apontam para `#diagnostico`, que fica `display: none` na variante A | `secoes/hero.njk`, `servicos/servico.njk`, `componentes/orcamento.css` | Com `FORM_TOP_VARIANT` `"a"` ou `"ab"`, o CTA principal não leva a lugar nenhum para metade (ou todos) os visitantes. Hoje está em `"b"`, então não acontece | Na variante A, apontar o CTA para `#orcamento` (por CSS/JS) ou esconder só o formulário, deixando a âncora |
| 3 | **Tempo mínimo contornável**: sem `olorin_tempo` e sem `olorin_ts`, a checagem não roda | `enviar.njk` (bloco "Tempo mínimo") | Um robô que posta direto no `enviar.php` sem esses campos nunca é checado. A auditoria já tinha apontado isso (AUDIT 0.3, item 2); a checagem de origem foi acrescentada, mas esse ponto continua | Ver seção 14 (exigir o campo quando o envio vier com `Accept: application/json`, ou token emitido pelo servidor) |
| 4 | **WhatsApp digitado dentro do PHP** (`OLORIN_WHATSAPP_SITE_PADRAO`), fora da fonte única. O `whatsapp` do `config.php` é ignorado | `enviar.njk` | Se o número mudar em `config.json`, o PHP continua com o antigo, e a checagem do build não pega | Gerar a constante a partir de `site.config.WHATSAPP` (fora do bloco `raw`) |
| 5 | **Páginas de case fora da lista do PHP**: os modos `cases` e `case` não estão na lista aceita de `modo_pagina`, e essas páginas têm o formulário completo | `enviar.njk`, `src/cases/*.njk` | Quando houver case aprovado, pedidos feitos nessas páginas chegam com "Tipo de página" vazio. Hoje não há case aprovado | Acrescentar `cases` e `case` à lista do PHP |
| 6 | **`APPROVED_ASSETS` não tem efeito**: a publicação de imagens depende só de `publicar: false` no manifesto; `autorizacao_de_uso: pendente` não bloqueia nada | `scripts/imagens.mjs`, `config.json` | Hoje todas as imagens estão "confirmada", então não há impacto. Uma imagem nova marcada como pendente seria publicada mesmo assim | Fazer `imagens.mjs` pular `pendente` que não esteja em `APPROVED_ASSETS` |
| 7 | **Conversões de Ads e Meta só via GTM** (`adsId`/`adsLabel` não usados; sem `fbq('track','Lead')`) | `consentimento.js`, `medicao.js` | Com só GA4/Pixel configurados (sem GTM), não há conversão de anúncio | Documentar o GTM como obrigatório (`docs/TRACKING.md` e `gtm-container.json`), ou disparar as conversões no `iniciarObrigado` quando não houver GTM |
| 8 | **`page_mode` = `"promo"`** nas landings; o PROMPT 11.1 pede `"campanha"` (o `<body>` já tem `data-mode="campanha"`) | `layouts/campanha.njk` + `rastreamento.js` | Relatórios do GTM/GA4 precisam filtrar por `promo` | Mapear `promo` → `campanha` em `track()` (mantendo `modo_pagina=promo` no PHP, que é o que o PROMPT 10.2 pede) |
| 9 | **Números publicados sem período nem critério**: `claims.json` tem `verificado: true` com `periodo` e `criterio` vazios, e o template só filtra por `verificado`. O PROMPT 12.2 exige os dois preenchidos | `secoes/resultados.njk`, `campanha-blocos.njk` | Decisão do dono (AUDIT 4.1), mas a regra do PROMPT não está no código | Manter a decisão e registrar no `CONTENT-TODO`; quando houver os dados, exigir os dois campos no template |
| 10 | **O build não confere links internos nem a imagem de `og_imagem`** | `verificar-build.mjs` | Um link para página inexistente ou uma imagem de compartilhamento que falta só aparece no ar | Ligar o `linkinator` (já instalado) e conferir o arquivo de `og:image` no `verificar-build` |
| 11 | **Não implementados** (detalhes nas seções 5.4, 9.5, 10 e 12): subset de fontes no pipeline, `content-visibility`, Brotli, métricas de fonte de reserva, Lighthouse/WebKit/html-validate/linkinator/ortografia automáticos, `ViewContent` | vários | Riscos de desempenho e QA não medidos automaticamente | Ver seção 14 |

### 13.2 Trade-offs assumidos

| Trade-off | Ganho | Custo | Como conviver |
|---|---|---|---|
| **Build no computador** em vez de editar no servidor | Fonte única, verificações automáticas, sem banco de dados | Precisa de Node instalado. Editar o HTML direto pelo FTP (que o dono disse que faria, AUDIT 4.3) funciona, mas **é apagado no próximo deploy** | Editar sempre os `.yml` (`docs/EDITAR.md`). Se editar no servidor numa emergência, repetir a mudança no `.yml` no mesmo dia |
| **CSS da página inteira embutido** (o Beasties não sabe o que está na primeira dobra, então embute tudo o que a página usa) | Nenhum CSS bloqueia a primeira pintura | A home tem 64 KiB de CSS dentro do HTML (75% da folha), e esse CSS é baixado de novo em cada página, além da folha completa | Medir o LCP real. Se pesar, limitar o que é embutido (por exemplo, a lista `allowRules` + seletores do topo) |
| **`[CONFIRMAR]` retira itens inteiros** | Nada sem confirmação vai ao ar | Um plano, uma pessoa ou uma pergunta inteira podem sumir por causa de um campo, sem aviso no build | Rever no `npm run dev` antes de publicar; nunca pôr marcador em campos de plano ou de equipe |
| **Classe `js` marcada no `<head>`, antes do JS principal** | Sem pulo de layout entre as etapas do formulário | Se o `olorin.<hash>.js` não carregar (por exemplo, HTML novo no servidor com JS antigo faltando), a etapa 2 fica escondida e o "Continuar" não funciona | O deploy envia CSS/JS **antes** do HTML e nunca apaga os arquivos antigos com hash |
| **Imagens e fontes sem hash no nome** | Nomes legíveis, editáveis à mão | Fontes ficam 1 ano em cache `immutable`; imagens, 30 dias. Trocar o arquivo mantendo o nome não chega a quem já visitou | Ao trocar uma fonte ou imagem, mudar o nome do arquivo (ou o `id` no manifesto) |
| **Deploy que nunca apaga** | Impossível perder `config.php`, leads ou o certificado | CSS/JS antigos e páginas removidas continuam no servidor | Limpeza manual periódica pelo FTP (`docs/DEPLOY.md`) |
| **HTTPS e HSTS comentados** | Não derruba o site se o SSL da Locaweb não estiver pronto ou vier por proxy | Até alguém ativar, o site aceita `http://` e `www.` | Ativar logo após o primeiro deploy, seguindo `docs/DEPLOY.md` |
| **CSP só observando** | Não quebra o GTM nem as tags que vierem dele | Não protege de fato | Impor depois de uma semana sem avisos no console (comentário no `.htaccess`) |
| **Limite por IP em arquivo temporário** | Funciona sem banco de dados | A pasta pode ser limpa; IPs compartilhados (por exemplo, redes móveis) dividem o limite | Aceitável para o volume de uma agência; acompanhar pelos e-mails |
| **Webhook com `file_get_contents`** | Sem dependências | Precisa de `allow_url_fopen` ligado na Locaweb; se não estiver, falha em silêncio | Testar com um webhook real antes de depender dele |
| **`lastmod` do sitemap manual** (campo `atualizado` do serviço ou `ATUALIZADO_EM`) | Data controlada e estável | Não muda sozinha quando o texto muda (o PROMPT 15.4 pede "real") | Atualizar a data ao mudar uma página de serviço |

---

## 14. Como evoluir

### 14.1 Primeiro: fechar as lacunas da seção 13.1

Ordem sugerida (do mais barato e mais arriscado para o resto): 1 (robots), 4 (WhatsApp no PHP), 5 (modos de case no PHP), 2 (variante A), 10 (links e OG no build), 6 (`APPROVED_ASSETS`), 8 (`page_mode`), 3 (tempo mínimo), 7 (conversões sem GTM).

Para o item 3, as opções em ordem de esforço:

1. Quando o envio vier com `Accept: application/json` (só o JS do site manda assim), **exigir** `olorin_tempo`/`olorin_ts`; sem JS, continuar sem exigir.
2. Pequeno `token.php` que devolve um carimbo assinado (HMAC com um segredo do `config.php`), pedido pelo JS ao abrir o formulário e conferido no `enviar.php`.

### 14.2 Receitas

**Adicionar um serviço**

1. Copiar um `src/content/servicos/<slug>.yml`, mudar `slug`, `ordem`, `nome`, `chip`, `icone`, `janela`, `seo`, `card`, `hero`, `resposta_curta`, `preco`, `faq`, `campanha` etc.
2. Se o ícone for novo, criar a variável `--icone-<nome>` e a classe `.o-icone--<nome>` (`src/styles/componentes/icone.css` e `tokens.css`).
3. Rodar `npm run og` (gera `servico-<slug>.jpg`).
4. `npm run build`. Sem mais nada, surgem a página, a landing `/promo/<slug>/`, o card, o item do submenu, o chip do formulário, a entrada na lista do `enviar.php`, o sitemap, o `llms.txt`, o JSON-LD e o link na 404. O `?s=<slug>` da `/promo/` passa a aceitar o slug novo.

**Adicionar uma página simples:** criar `src/<pasta>/index.njk` com `layout: layouts/base.njk`, `modo`, `slug`, `titulo` (até 60 caracteres), `descricao` (até 155) e `og_imagem`, e o texto num `src/content/paginas/<nome>.yml`. Ela entra no sitemap automaticamente (se indexável).

**Adicionar um campo ao formulário**

1. Campo em `components/formulario.njk` (+ rótulo em `formulario.yml`).
2. No `enviar.njk`: ler em `$lead` (com `olorin_linha`/`olorin_permitido`) e dar um rótulo em `$rotulos`.
3. **Pôr o campo novo no fim de `$lead`.** O cabeçalho do CSV é escrito só quando o arquivo do mês é criado, então um campo no meio desalinha as colunas até o mês virar.
4. Se for lista fechada, gerar a lista em `listasParaPhp` e acrescentar a conferência em `verificar-build.mjs`.

**Publicar o primeiro case:** corrigir antes o item 5 da seção 13.1. Depois, em `src/content/cases.yml`, preencher pelo menos `slug`, `segmento`, `situacao`, `o_que_fizemos`, `resultado`, `periodo` e `servicos` (o build para se faltar algum); `verba`, `medicao`, `imagem` e `depoimento` são opcionais. Marcar `aprovado: true`. Surgem sozinhos: `/cases/`, `/cases/<slug>/`, o item "Cases" no menu, o bloco de cases nas páginas dos serviços listados e as entradas no sitemap.

**Ligar o rastreamento:** preencher `GTM_ID` (recomendado) em `config.json`; montar no GTM as tags de GA4, Meta e Google Ads disparadas por `generate_lead`, `whatsapp_click` etc. (`docs/TRACKING.md`); testar com o modo de visualização do GTM. O aviso de cookies passa a aparecer sozinho.

**Ligar o teste A/B:** só depois de corrigir o item 2 da seção 13.1. Trocar `FORM_TOP_VARIANT` para `"ab"` e comparar `generate_lead` por `form_variant` no GA4.

**Endurecer o servidor**, nesta ordem, cada passo testado em produção: HTTPS (variante A ou B do `.htaccess`) → HSTS → CSP imposta (trocar `Report-Only` por `Content-Security-Policy`, de preferência sem `'unsafe-inline'`, movendo os scripts embutidos para arquivo) → Brotli, se a Locaweb oferecer.

### 14.3 Automação de QA (fecha o PROMPT 20)

1. Acrescentar ao `testar.mjs`: WebKit, isca, tempo mínimo, limite por IP, fluxo sem JS (contexto com JavaScript desligado), modo campanha (sem menu, `noindex`, canonical), `?s=`, `?v=`, calculadora e teclado.
2. Ligar os pacotes já instalados: `html-validate` e `linkinator` sobre o `dist/` (resolve o item 10 da seção 13.1), `nspell` + `dictionary-pt` nos textos de `src/content/`, e Lighthouse mobile com mediana de 3 execuções, gravando em `docs/lighthouse/`.
3. Rodar tudo num workflow do GitHub Actions (a pasta `.github/workflows/` já existe) a cada push, sem o deploy.

### 14.4 Mais adiante

Ver `docs/ROADMAP.md`: páginas por segmento, painel de edição (Decap CMS sobre os mesmos `.yml`, sem mudar a arquitetura), blog, vídeo do Método Olorin e conversões avançadas com consentimento. Nenhuma dessas mudanças exige trocar o Eleventy: todas cabem como novos dados em `src/content/` e novos templates.
