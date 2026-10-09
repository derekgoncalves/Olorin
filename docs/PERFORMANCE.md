# Desempenho

**Resumo:** o site novo é mais leve e mais rápido que o anterior. No Lighthouse mobile ele fica entre 99 e 100 em desempenho, com 100 em acessibilidade, práticas recomendadas e SEO. A home baixa 31% menos dados (157 KiB contra 227 KiB) e o maior elemento da tela aparece mais cedo (2,0 s contra 2,6 s).

## Como foi medido

- **Ferramenta:** Lighthouse 13.5 no modo celular padrão (Moto G Power simulado, rede 4G lenta simulada, CPU 4× mais lenta) e Chromium 141.
- **Servidor:** Apache 2.4 com o mesmo `.htaccess` que vai para a Locaweb, com compressão gzip e cache. Rodou na mesma máquina, em 09/10/2026.
- **Site anterior:** cópia de `site-atual/` servida do mesmo jeito.
- **Rodadas:** 3 rodadas da home antiga e da nova, valendo a mediana; 1 rodada final nas demais páginas.
- **Atenção:** os números no ar vão variar um pouco, porque dependem do servidor da Locaweb e da rede. Depois de publicar, meça em <https://pagespeed.web.dev> e anote aqui.

## Antes × depois (home)

| | Desempenho | LCP | FCP | TBT | CLS | Speed Index | Peso transferido |
|---|---:|---:|---:|---:|---:|---:|---:|
| Site anterior (PageSpeed real, 08/10/2026) | 97 | 2,3 s | 1,5 s | 70 ms | 0 | 2,8 s | — |
| Site anterior (mesmo laboratório) | 96 | 2,6 s | 1,7 s | 0 ms | 0 | 1,8 s | 227 KiB |
| **Site novo** | **99** | **2,0 s** | **1,2 s** | **46 ms** | **0,003** | **1,2 s** | **157 KiB** |

## Site novo, por página (build final)

| Página | Desempenho | Acessib. | Práticas | SEO | LCP | FCP | TBT | CLS | Speed Index | Peso |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 99 | 100 | 100 | 100 | 2,0 s | 1,2 s | 46 ms | 0,003 | 1,2 s | 157 KiB |
| `/servicos/` | 100 | 100 | 100 | 100 | 1,7 s | 1,2 s | 0 ms | 0,004 | 1,2 s | 121 KiB |
| `/servicos/trafego-pago/` | 100 | 100 | 100 | 100 | 1,7 s | 1,2 s | 6 ms | 0,003 | 1,2 s | 126 KiB |
| `/sobre/` | 99 | 100 | 100 | 100 | 2,1 s | 1,4 s | 47 ms | 0 | 1,4 s | 175 KiB |
| `/promo/` | 100 | 100 | 100 | 66* | 1,7 s | 1,2 s | 0 ms | 0,002 | 1,2 s | 117 KiB |

\* As páginas `/promo/` têm SEO 66 **de propósito**. Elas são de campanha e levam `noindex` para não competir no Google com as páginas de serviço (PROMPT, seção 11). O Lighthouse desconta por isso.

## O que deixou o site rápido

| Técnica | Onde |
|---|---|
| CSS crítico de cada página embutido no HTML; o resto carrega sem bloquear | `scripts/pos-processar.mjs` (Beasties) |
| `@font-face` embutido no `<head>` e as 3 fontes da primeira dobra pré-carregadas | `src/_includes/layouts/base.njk`, `scripts/assets.mjs` |
| Fontes reduzidas só aos caracteres do português: de 94 KiB para 61 KiB no total | `src/assets/fonts/` |
| Título do banner com `font-display: optional`: a fonte não troca com a página já pintada (antes havia um salto de layout de 0,135) | `src/styles/tokens.css` |
| Um arquivo de CSS (87 KiB, 17 KiB com gzip) e um de JS (24 KiB, 9 KiB com gzip), os dois com hash no nome e cache de 1 ano | `scripts/assets.mjs`, `.htaccess` |
| JavaScript com `defer`; o que não é urgente roda quando o navegador está ocioso | `src/scripts/main.js` |
| Imagens em AVIF e WebP em vários tamanhos (`srcset`), com largura e altura definidas; `lazy` abaixo da dobra; `fetchpriority="high"` no banner | `scripts/imagens.mjs`, `src/assets/manifest.json` |
| Sem bibliotecas de terceiros; GTM, GA4 e Pixel só carregam depois do consentimento e com o navegador ocioso | `src/scripts/modulos/consentimento.js` |
| Gzip, cache longo para arquivos com hash e cache curto para HTML | `src/servidor/.htaccess` |

## Orçamento de peso

O `npm run build` avisa se o JavaScript passar de 60 KiB ou o CSS de 90 KiB (sem compressão). Hoje: JS 23,7 KiB, CSS 87,3 KiB, fontes 59,5 KiB.

## Como medir de novo

1. Depois de publicar: <https://pagespeed.web.dev> → `https://olorin.com.br` → aba **Celular**. Repita 3 vezes e anote a mediana.
2. No computador, com o site gerado (via Chrome DevTools → Lighthouse, modo "Navigation", dispositivo "Mobile"):
   ```bash
   npm run build
   npx lighthouse http://localhost:8081/ --view
   ```
