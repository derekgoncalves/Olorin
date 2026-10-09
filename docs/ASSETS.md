# Imagens e fontes

**Resumo:** os originais ficam em `src/assets/img-src/`. O build gera sozinho as versões AVIF e WebP em vários tamanhos em `dist/assets/img/`, e o navegador escolhe a menor que serve. Tudo é descrito em `src/assets/manifest.json`: arquivo original, descrição (`alt`), recorte e tratamento.

## Inventário de imagens

| id | Original (`src/assets/img-src/`) | Categoria | Larguras geradas (px) | Peso AVIF | Tratamento | Autorização (manifesto) |
|---|---|---|---|---|---|---|
| `hero-celular` | `hero-celular.webp` | marca | 270, 400, 540 | 9–36 KiB | P&B | confirmada |
| `sobre-bastidores` | `sobre-bastidores.webp` | bastidor | 400, 736 | 12–32 KiB | P&B | confirmada |
| `erro-404` | `erro-404.webp` | marca | 640, 1200 | 21–55 KiB | cor | confirmada |
| `equipe-natalia` | `equipe/natalia-arruda.png` | equipe | 320, 417 | 11–19 KiB | cor | confirmada |
| `equipe-natalia-quadrada` | `equipe/natalia-arruda.png` | equipe | 160, 320 | 3–9 KiB | cor | confirmada |
| `equipe-vinicius` | `equipe/vinicius-mafra.webp` | equipe | 320, 480, 640 | 5–19 KiB | cor | confirmada |
| `equipe-vinicius-quadrada` | `equipe/vinicius-mafra.webp` | equipe | 160, 320 | 2–6 KiB | cor | confirmada |
| `equipe-derek` | `equipe/derek-goncalves.webp` | equipe | 320, 480, 660 | 8–31 KiB | cor | confirmada |
| `equipe-derek-quadrada` | `equipe/derek-goncalves.webp` | equipe | 160, 320 | 2–6 KiB | cor | confirmada |
| `portfolio-marca-identidade` | `portfolio/marca-identidade.webp` | portfolio | 300, 600 | 8–19 KiB | cor | confirmada |
| `portfolio-campanha-trafego` | `portfolio/campanha-trafego.webp` | portfolio | 300, 600 | 8–25 KiB | cor | confirmada |
| `portfolio-impresso-catalogo` | `portfolio/impresso-catalogo.webp` | portfolio | 300, 600 | 6–16 KiB | cor | confirmada |
| `portfolio-site-institucional` | `portfolio/site-institucional.webp` | portfolio | 300, 600 | 3–8 KiB | cor | confirmada |
| `portfolio-redes-conteudo` | `portfolio/redes-conteudo.webp` | portfolio | 320, 640 | 5–38 KiB | cor | confirmada |
| `portfolio-campanha-google-ads` | `portfolio/campanha-google-ads.webp` | portfolio | 300, 600 | 4–10 KiB | cor | confirmada |
| `portfolio-marca-producao` | `portfolio/marca-producao.webp` | portfolio | 300, 600 | 4–9 KiB | cor | confirmada |
| `portfolio-impresso-loja` | `portfolio/impresso-loja.webp` | portfolio | 300, 600 | 8–17 KiB | cor | confirmada |

As fotos da equipe também têm versão quadrada (`<id>-quadrada`, 160 e 320 px) para as páginas de serviço.

**Origem:**
- **Fotos da equipe:** enviadas pelo dono em 08/10/2026. A identidade de cada pessoa foi deduzida pela ordem das fotos e precisa ser conferida. A da Natália tem só 417 × 533 px, então uma maior é melhor.
- **Banner, bastidores, 404 e portfólio:** vieram do site anterior. As 8 do portfólio são **ilustrativas** e devem ser trocadas por trabalhos reais. Confirme a licença de uso das demais (`docs/CONTENT-TODO.md`).

## Como trocar uma imagem

1. Salve o original (JPG, PNG ou WebP, com 1200 px ou mais de largura) em `src/assets/img-src/` (equipe em `equipe/`, portfólio em `portfolio/`).
2. Em `src/assets/manifest.json`, no item da imagem:
   - aponte `"arquivo_original"` para o arquivo novo;
   - escreva o `"alt"`, que é o que a imagem mostra, para quem não enxerga;
   - ajuste ou apague o `"recorte"` (`[esquerda, topo, largura, altura]` em pixels do original).
3. `npm run build`. O build avisa se faltar arquivo ou `alt`.

Passo a passo com exemplos em `docs/EDITAR.md`, seção 4.

## Imagens de compartilhamento (prévia no WhatsApp e redes)

São 10 imagens 1200 × 630 em `src/assets/og/`, geradas por `npm run og` com as fontes e cores da marca: `home`, `servicos`, `sobre`, `promo` e uma para cada serviço. Rode de novo quando mudar o título de um serviço.

## Ícones

`src/assets/brand/`: `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, além de `src/servidor/favicon.ico`. Os logos vetoriais (logo, símbolo O e versão pixel) estão em `_brand/logos/` e embutidos no HTML como símbolos SVG.

## Fontes

| Fonte | Uso | Arquivos | Peso | Licença |
|---|---|---|---|---|
| Archivo Expanded 800 e 900 | Títulos e botões (substituta da Integral CF) | `archivo-expanded-800.woff2`, `-900.woff2` | 11 + 10 KiB | SIL OFL 1.1 |
| Cascadia Code 400 e 700 | Texto | `cascadia-code-400.woff2`, `-700.woff2` | 17 + 18 KiB | SIL OFL 1.1 |
| Silkscreen 400 | Rótulos em pixel (substituta da Retro Computer) | `silkscreen-400.woff2` | 3 KiB | SIL OFL 1.1 |

As fontes foram reduzidas só aos caracteres do português (de 94 para 61 KiB no total). Três são pré-carregadas: o título, o texto e o pixel da primeira dobra.

**Fontes pagas da marca:**
- **Integral CF** exige a licença *Web* da Connary Fagen.
- **Retro Computer** exige permissão por escrito do autor para uso comercial.

Com os arquivos em mãos, salve `integral-cf-bold.woff2` e `retro-computer.woff2` em `src/assets/fonts/licenciadas/` e rode o build. As medidas já estão ajustadas para nada pular de lugar. Esses arquivos não vão para o Git (`docs/EDITAR.md`, seção 5).
