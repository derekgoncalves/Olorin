# Marca Olorin: guia para o site v3

> Fonte da verdade: o manual de marca `_brand/ID_OLORIN.pdf` (17 páginas, gerado no Adobe Illustrator 30.7, agosto de 2026), lido página a página nas imagens `_brand/paginas/pagina-01.webp` … `pagina-17.webp`, mais os vetores já extraídos em `_brand/logos/`. Comparação feita com o que está no ar hoje: `site-atual/assets/css/olorin.css` e `site-atual/index.html`.
>
> **Regra do PROMPT (seção 3.1.3): se o manual divergir do site, o manual vence.** Onde o manual não define algo, este documento diz **"não definido no manual"** e propõe uma regra prática marcada como **PROPOSTA** (vale até o dono aprovar ou mudar). O que depende de confirmação do dono vai marcado como `[CONFIRMAR: ...]` e deve ser copiado para `docs/CONTENT-TODO.md`.

**Legenda:** ✔ permitido · ✘ proibido · **PROPOSTA** regra nossa, não está no manual · `[CONFIRMAR]` depende do dono.

---

## 0. O que tem no manual (índice por página)

| Pág. | Conteúdo | Observação |
|---|---|---|
| 1 | Capa: logo principal **preto sobre verde** | fundo verde chapado |
| 2 | Logo principal **branco sobre gradiente violeta granulado** | o gradiente é uma imagem raster (819×1458) esticada |
| 3 | As três versões do logo, **verde sobre preto**, empilhadas | principal, secundária com o pixel na frente, só tipográfica |
| 4 | Aplicação: foto colorida (céu, mão com celular) + ícones verdes + "DIGITAL" gigante em Retro Computer | supergrafismo cortado na base |
| 5 | Aplicação: foto P&B (faixa de pedestres) + moldura de celular verde com "OLORIN" nos cantos e ícone O no centro | é a referência do hero atual |
| 6 | Aplicação: foto colorida (close de olho) + ícone pixel e ícone O gigantes em verde + "LOGO" | |
| 7 | **Ícones**: principal (O com estrela) e secundários (pixel; O + pixel lado a lado) | verde sobre preto |
| 8 | **Logo**: principal e secundários | verde sobre preto |
| 9 | **Cores**: branco, violeta, preto e verde (com a palavra "PRINCIPAL" e o logo sobre a faixa verde) | não traz códigos HEX impressos |
| 10 | **Cores: do's e don'ts** | regras de combinação |
| 11 | **Fontes**: Integral CF, Cascadia Code, Retro Computer | rótulos em violeta sobre branco |
| 12 | **Fonte principal**: Integral CF (pilha "OLORIN" sangrando a borda) | |
| 13 | **Fonte para textos longos**: Cascadia Code (texto corrido com trechos em negrito) | |
| 14 | **Fonte secundária**: Retro Computer (pilha "OLORIN" sangrando a borda) | |
| 15 | Aplicação: perfil de rede social (avatar = ícone O preto sobre círculo verde; nome "OLORIN_DIGITAL" em branco) | |
| 16 | Aplicação: foto colorida (mãos no notebook) + blocos pixel violeta + adesivos da marca | |
| 17 | Aplicação: foto em monocromia violeta (silhueta) + logo principal branco gigante, sangrando à direita | |

**O manual não define:** área de proteção, tamanho mínimo, usos proibidos do logo, códigos CMYK/Pantone, iconografia de interface, grade e espaçamento, sombras, raios de borda, movimento, regras de tratamento de foto (só mostra exemplos) e tom de voz. Tudo isso está proposto abaixo.

**Como os dados foram extraídos (verificado):**
- Cores: lidas direto dos operadores de cor vetorial do PDF (`rg`, espaço RGB) e conferidas por amostragem de pixel na página 9.
- Fontes: `pdffonts` + tabela `name`/CFF das fontes embutidas no PDF + métricas do `FontDescriptor`.
- Logo: geometria lida em `_brand/logos/logo-olorin.svg`, `icone-o.svg` e `icone-pixel.svg`.
- Teste de tamanho mínimo: páginas 7 e 8 renderizadas em resolução baixa (logo com 80, 100, 120 e 160 px de largura; ícone com 16, 20, 24 e 32 px) e inspecionadas visualmente.

---

## 1. Logo

### 1.1 Versões (págs. 3 e 8)

| Versão | Composição | Onde aparece no manual |
|---|---|---|
| **Principal** | ícone **O com estrela** + L + **O pixel** + R I N | págs. 1, 2, 3 (1ª linha), 8, 9, 16 (adesivo), 17 |
| **Secundária 1** | **O pixel** + L + ícone **O com estrela** + R I N (os dois "O" trocam de lugar) | págs. 3 (2ª linha), 8 |
| **Secundária 2 (tipográfica)** | "OLORIN" só em Integral CF Bold, sem símbolos | págs. 3 (3ª linha), 8; também nos cantos da moldura da pág. 5 |

Construção (medida no SVG oficial, `viewBox 0 0 731 125,6`):
- Proporção do logo principal: **5,82 : 1** (largura : altura).
- O O pixel é feito de quadrados de **34,4 unidades = 27,5% da altura do logo**. Esse quadrado é o módulo usado na área de proteção (1.4).
- O O pixel começa exatamente onde termina o pé do L (x = 254,28): **não abrir espaço entre o L e o pixel**.
- O descritor "DIGITAL" **não faz parte do logo**: aparece só como supergrafismo (pág. 4) e no nome do perfil (pág. 15).

### 1.2 Ícones (pág. 7)

| Ícone | Descrição | Arquivo |
|---|---|---|
| **Principal: ícone O** | quadrado de cantos muito arredondados com uma elipse diagonal vazada e uma estrela de quatro pontas alongada | `_brand/logos/icone-o.svg` (134×126) |
| **Secundário: pixel** | "O" desenhado com quadrados (cruz pixelada com miolo vazado) | `_brand/logos/icone-pixel.svg` (142×125,3) |
| **Dupla** | ícone O + pixel lado a lado | (montar com os dois SVGs) |

### 1.3 Cores do logo observadas no manual

| Aplicação | Página |
|---|---|
| Preto sobre verde | 1, 9 |
| Verde sobre preto | 3, 7, 8, 16 (adesivo em pílula preta) |
| Branco sobre gradiente violeta granulado | 2 |
| Branco sobre foto em monocromia violeta | 17 |
| Verde sobre foto (colorida ou P&B) | 4, 5, 6 |
| Ícone O **preto sobre círculo verde** (avatar) | 15, 16 (adesivo) |
| Ícone pixel **violeta sobre branco** (adesivo) | 16 |

Não aparecem no manual: logo violeta inteiro, logo preto sobre branco, logo verde sobre branco, logo sobre violeta chapado.
**PROPOSTA:** logo preto sobre branco ✔ só quando houver uma cor da marca na mesma composição (a pág. 10 proíbe "preto + branco" sozinhos); logo violeta sobre branco ✔ (combinação permitida, contraste 5,62:1); verde sobre branco ✘ sempre.

### 1.4 Área de proteção: **não definido no manual**

**PROPOSTA:** `x` = lado de um quadrado do O pixel = **27,5% da altura do logo**. Deixar no mínimo **1x livre em todos os lados** (nada de texto, borda ou outro elemento dentro dessa área). Para o ícone sozinho: **25% da largura do ícone** em todos os lados.
No CSS: `padding: calc(var(--logo-altura) * 0.275)`. Exemplo: logo com 22 px de altura → 6 px livres.

### 1.5 Tamanho mínimo: **não definido no manual**

Teste feito (renderização do PDF em tamanho reduzido): com **80 px** de largura a estrela do ícone O vira um traço quase invisível; com **100 px** ela ainda aparece; com **120 px** está nítida. O ícone sozinho com **16 px** perde a estrela (vira um ponto); com **24 px** ela aparece.

**PROPOSTA:**
| Peça | Mínimo na tela | Mínimo impresso (não testado em impressão) |
|---|---|---|
| Logo principal ou secundária 1 | **100 px de largura** (≈ 17 px de altura); ideal ≥ 120 px | 25 mm de largura |
| Logo tipográfica (secundária 2) | 72 px de largura | 18 mm |
| Ícone O | **24 px** | 8 mm |
| Ícone pixel | 16 px (desenho sem detalhe fino) | 5 mm |

Abaixo de 100 px, usar a **logo tipográfica** ou só o ícone. Para 16 e 32 px, usar o favicon dedicado (`_brand/logos/favicon.svg`: ícone O preto sobre quadrado verde arredondado). O cabeçalho atual usa `clamp(108px, 9vw, 136px)`, dentro da regra.

### 1.6 Usos proibidos: **não definido no manual**

**PROPOSTA** (✘ em todos os casos):
1. Esticar, achatar ou mudar a proporção de 5,82 : 1.
2. Recompor o logo: trocar a ordem dos elementos fora das duas versões do manual, afastar o pixel do L, trocar o ícone por outra forma.
3. Redigitar o logo com qualquer fonte (inclusive a Archivo Expanded do site). Usar sempre o SVG oficial.
4. Aplicar cor fora da paleta, gradiente, textura ou foto dentro das letras.
5. Verde sobre branco (contraste 1,1:1) e qualquer combinação de **verde encostado em violeta** (pág. 10).
6. Contorno, sombra, brilho, chanfro ou efeito 3D no logo.
7. Girar o logo. Exceção: linguagem de **adesivo** (pág. 16), com inclinação leve e o logo inteiro visível.
8. Colocar sobre foto com área movimentada atrás do logo. Em foto, usar verde ou branco sobre uma área escura ou uniforme (págs. 4, 5, 17).
9. Cortar o logo. Exceção: **supergrafismo decorativo** sangrando a borda (pág. 17), desde que o logo inteiro esteja presente em outro ponto da mesma tela (no site, o cabeçalho) e o recorte tenha `aria-hidden="true"`.
10. Usar o logo no meio de texto corrido. No texto, escrever **Olorin** ou **Olorin Digital**.

### 1.7 Arquivos e uso no site
- `_brand/logos/logo-olorin.svg`, `icone-o.svg`, `icone-pixel.svg`: vetores com `fill="currentColor"` (a cor vem do CSS). Otimizar com SVGO; no HTML, logo com `role="img"` e `<title>Olorin Digital</title>` (ou `aria-label` no link "página inicial"); ícones decorativos com `aria-hidden="true"`.
- `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`: base para o favicon e o `site.webmanifest`.

---

## 2. Paleta

Os valores abaixo são os **valores vetoriais do PDF** (operador `rg`, RGB de 0 a 1, convertidos para 0–255). O manual não imprime HEX, CMYK nem Pantone.

| Nome no manual | HEX | RGB | Valor no PDF | Papel |
|---|---|---|---|---|
| **Verde** | `#ECFF36` | 236, 255, 54 | 0,925 · 1 · 0,212 | **cor principal da marca** (a pág. 9 coloca "PRINCIPAL" e o logo sobre a faixa verde): logo, ícones, destaque de texto e botão primário sobre preto, abas de seção, faixa de números |
| **Violeta** | `#7E3BED` | 126, 59, 237 | 0,494 · 0,231 · 0,929 | **cor secundária**: gradiente granulado, monocromia de foto, blocos pixel, rótulos sobre branco, seções de respiro |
| **Preto** | `#000000` | 0, 0, 0 | 0 · 0 · 0 | fundo base e texto |
| **Branco** | `#FFFFFF` | 255, 255, 255 | 1 · 1 · 1 | fundo base e texto sobre preto e violeta |

O vermelho `#ED1C24` da pág. 10 é só o "X" dos don'ts. **Não é cor da marca**; não usar (nem para erro: o site atual sinaliza erro com etiqueta preta e texto, o que está certo).

### 2.1 Proporções de uso observadas
- **Pág. 9 (faixas de cor, medidas na renderização):** branco 15,2% · violeta 15,9% · preto 15,9% · **verde 52,8%**.
- **Área somada das 17 páginas (medição aproximada por pixel):** preto 27,8% · branco 25,4% · verde 11,5% · violeta chapado 3,6% · foto e gradiente 31,7% (gradiente e fotos das págs. 2 e 17 são quase todos violeta).
- Leitura: **preto e branco são os fundos**; o **verde é o destaque** e assina quase todas as páginas (logo, abas, ícones); o **violeta aparece em blocos grandes de clima** (gradiente, foto monocromática, blocos pixel) e em rótulos.

**PROPOSTA para o site:** preto e branco alternados em ~70–75% da área; verde ~10–15% (faixa de números, marquee, botões e destaques sobre preto); violeta ~10–15% (no máximo duas seções inteiras por página, com gradiente granulado, e rótulos sobre branco).

### 2.2 Cores derivadas (permitidas só como token declarado)
**PROPOSTA:** além das 4 cores, o `tokens.css` só pode ter:
- **Transparências de preto e branco** para texto secundário e linhas (valores do site atual, todos com contraste verificado): branco 74% sobre preto (11,2:1), preto 70% sobre branco (8,5:1), branco 92% sobre violeta (5,0:1), preto 74% sobre verde (9,5:1).
- **Tons do gradiente violeta**, usados **só dentro de gradiente decorativo**, nunca como cor de texto, borda ou fundo chapado. Amostrados da pág. 2 (valores aproximados, imagem raster): índigo escuro ~`#200C51` nas bordas, violeta saturado ~`#7A1BF0` no topo, lavanda ~`#A781EE` no centro. O site atual usa `rgba(30, 6, 90, 0.55)` (≈ `#1E065A`), que é compatível com o índigo da pág. 2.

Qualquer outra cor (ver tabela de divergências, seção 11) sai do v3.

---

## 3. Regras de combinação de cores (pág. 10)

| ✔ Do's | ✘ Don'ts |
|---|---|
| verde + branco | **violeta + verde** |
| violeta + branco | **preto + branco** (sozinhos, sem cor da marca) |
| verde + preto | |
| violeta + preto | |
| verde + preto + branco | |
| violeta + preto + branco | |

**Como interpretar (com base no próprio manual):**
- **Verde e violeta nunca se encostam** (nem um sobre o outro, nem lado a lado). Podem estar na mesma tela se houver preto ou branco entre eles: a pág. 11 tem a aba verde e rótulos violeta separados pelo branco; a pág. 16 tem blocos violeta e adesivo verde separados por preto e branco.
- **Toda composição tem uma cor da marca.** Preto e branco sozinhos não são a Olorin. As págs. 12 a 14 (preto sobre branco) sempre trazem a aba verde.
- **"Verde + branco" é combinação de blocos** (aba verde com texto preto numa página branca, págs. 11 a 14). **Texto ou ícone verde sobre branco é proibido** por contraste (seção 4).

**Contextos de seção (o site atual já segue isto; manter no v3):**

| Fundo | Texto | Texto secundário | Destaque | Botão primário | Foco |
|---|---|---|---|---|---|
| Preto | branco | branco 74% | verde | verde com texto preto | contorno verde |
| Branco | preto | preto 70% | violeta | violeta com texto branco | contorno violeta |
| Violeta | branco | branco 92% | branco | branco com texto violeta | contorno branco |
| Verde | preto | preto 74% | preto | preto com texto verde | contorno preto |

Nunca: botão verde em seção violeta, texto verde em seção violeta, seção verde colada em seção violeta (inserir faixa preta ou branca entre elas).

---

## 4. Contraste (PROMPT, seção 3.3; já calculado, respeite)

| Combinação | Razão | Uso |
|---|---|---|
| Verde `#ECFF36` sobre preto | 18,9:1 | ✔ qualquer texto |
| Texto branco sobre violeta `#7E3BED` | 5,6:1 | ✔ |
| Verde sobre violeta | 5,1:1 | ✔ |
| Texto preto sobre violeta | 3,7:1 | **só para títulos grandes** (≥ 24 px, ou ≥ 18,66 px em negrito) |
| Verde sobre branco | 1,1:1 | ✘ **nunca** (nem em texto, nem em ícone com significado, nem em borda de campo) |

Conferido nesta etapa com a fórmula WCAG 2.2: os cinco valores batem (18,92; 5,62; 5,07; 3,74; 1,11).

**Atenção:** "verde sobre violeta" passa no contraste, mas **é proibido pela regra de combinação da pág. 10**. O manual vence: **não usar verde sobre violeta**.

Pares extras calculados (não estão na seção 3.3): preto sobre branco 21:1 ✔; violeta sobre branco 5,62:1 ✔ (texto normal); **violeta sobre preto 3,74:1, só títulos grandes** (≥ 24 px, ou ≥ 18,66 px em negrito).

---

## 5. Tipografia

### 5.1 Famílias do manual (págs. 11 a 14)

| Papel no manual | Fonte | Pesos vistos no PDF | Características verificadas | Licença |
|---|---|---|---|---|
| **Principal** (títulos, rótulos, logo tipográfica) | **Integral CF** | Bold (títulos e rótulos como "PRINCIPAL", "SECUNDÁRIOS", "DO'S") e Regular (rótulo "INTEGRAL CF" da pág. 12, nome "OLORIN_DIGITAL" da pág. 15) | **só caixa-alta**: altura de maiúscula = altura de minúscula = 700/1000; o PDF marca a fonte como "AllCap"; aviso embutido "(c) 2017 Connary Fagen" | paga (Connary Fagen) |
| **Textos longos** | **Cascadia Code** | Regular e trechos em negrito na pág. 13 (o PDF embute dois subconjuntos com o nome interno "CascadiaCode-Regular"; o negrito deve ser uma instância da fonte variável, peso exato não verificado) | monoespaçada, com minúsculas; avanço 586/1000 | a cópia embutida no PDF é a que vem com o Windows ("Microsoft supplied font"); a distribuição oficial no GitHub é **SIL OFL** e é a que o site usa |
| **Secundária** (detalhes) | **Retro Computer** | um peso | **só caixa-alta**, monoespaçada (avanço 845/1000, altura de maiúscula 721); aviso embutido "© Petyka. 2010. All Rights Reserved" | demo para uso pessoal; uso comercial exige autorização do autor |

Nas abas de seção do manual (págs. 7 a 14), a Cascadia aparece **em minúsculas** ("cores", "fontes", "principal"): é um recurso de estilo da marca.

### 5.2 Substitutas em produção (todas SIL OFL, conferido nos arquivos `.woff2`)

| Manual | Site em produção | Diferença medida |
|---|---|---|
| Integral CF Bold | **Archivo Expanded 900** (instância da Archivo, largura 125) | a Integral é ~16% mais estreita na média dos glifos (medição anterior) e **18,8% mais estreita na palavra "OLORIN"** (medido nesta etapa: 4.180 × 5.147 unidades); altura de maiúscula 700 × 686 |
| Integral CF Regular | **Archivo Expanded 800** | a Integral Regular é visivelmente mais leve que a Archivo 800 |
| Cascadia Code | **Cascadia Code 400 e 700** | mesma família (versão OFL) |
| Retro Computer | **Silkscreen 400** | a Retro é ~14% mais larga na média (medição anterior) e **22,9% mais larga na palavra "OLORIN"**; ambas pixeladas |

Cobertura de pt-BR conferida nos cinco `.woff2` atuais: todos têm á à â ã é ê í ó ô õ ú ü ç (maiúsculas e minúsculas), aspas curvas, travessões, reticências, ª, º, ° e ×. Nenhum tem "→" nem "✓" (usar ícone SVG, não caractere).

Os `.woff2` da Archivo Expanded trazem o nome interno "Archivo SemiBold" (sobra da geração da instância). Não afeta o site, porque o `@font-face` define o nome da família, mas vale corrigir se os arquivos forem regerados.

### 5.3 Licenças e plano de troca

Levantado antes desta etapa (**não reverifiquei os sites dos fornecedores agora**):
- **Integral CF:** para usar no site é preciso a licença **"Web"** da própria Connary Fagen (connary.com), cobrada por visualizações mensais, com arquivos WOFF/WOFF2. A licença desktop **não** cobre site, e converter OTF/TTF em webfont é proibido.
- **Retro Computer:** uso comercial exige **autorização por escrito** do autor (Petyka).

**Decisão v3:** as substitutas livres continuam até a compra da licença Web da Integral CF e a autorização da Retro Computer. O build fica pronto para receber os arquivos:
- Tokens com a pilha só das fontes que existem: `--fonte-display: "Archivo Expanded", "Arial Black", Impact, sans-serif;`. **Não** colocar "Integral CF" na pilha antes de haver `@font-face` com arquivo licenciado: o navegador usaria a cópia instalada no computador do dono e ele veria um site diferente do que o público vê.
- Quando os arquivos licenciados forem colocados em `src/assets/fonts/` (ex.: `integral-cf-bold.woff2`, `integral-cf-regular.woff2`, `retro-computer.woff2`), o build gera o `@font-face` e põe a fonte do manual na frente da substituta. Documentar o passo a passo em `docs/EDITAR.md`.
- Na troca, refazer o QA visual: a Integral deixa os títulos ~19% mais estreitos e a Retro deixa as etiquetas ~23% mais largas (quebras de linha mudam). Ajustar `size-adjust`/`ascent-override` da fonte de reserva para manter CLS 0.
- `[CONFIRMAR: compra da licença Web da Integral CF (faixa de visualizações) e autorização por escrito do autor da Retro Computer]`.

### 5.4 Hierarquia para o site (PROPOSTA, a partir do manual e dos valores atuais)

| Nível | Família (substituta hoje) | Peso | Tamanho | Caixa | Entrelinha / espaçamento | Uso |
|---|---|---|---|---|---|---|
| Display (H1 do hero) | Integral CF Bold (Archivo Expanded 900) | 900 | `clamp(34px, 6.6vw, 108px)` | alta | 0,95 / −0,01em | uma frase por página |
| Título de seção (H2) | idem | 900 | `clamp(26px, 4vw, 56px)` | alta | 0,95 / −0,01em; máx. 24ch | |
| Título de card (H3) | idem | 900 | `clamp(17px, 1.6vw, 24px)` | alta | 1,1 | serviço, plano, case |
| Número de destaque | idem | 900 | `clamp(34px, 4vw, 60px)` | — | 1 / −0,03em | ex.: `R$ 2M+` |
| Rótulo e botão | Integral CF Bold (Archivo Expanded 800) | 800 | 13–15 px | alta | 1,2 / 0,06–0,08em | como os rótulos "PRINCIPAL" e "DO'S" do manual |
| Texto corrido | Cascadia Code | 400; 700 para ênfase | 16–18 px | normal | 1,65–1,7; 56–65ch | o manual a define "para textos longos" |
| Aba de seção | Cascadia Code | 400 | 13–14 px | **minúscula** | 1,2 | como as abas das págs. 7 a 14 |
| Etiqueta pixel, título de janela, nome de arquivo | Retro Computer (Silkscreen) | 400 | **≥ 12 px** | alta (títulos de janela em minúscula, como nome de arquivo) | 1,2 / 0,08–0,18em | **no máximo 4 palavras** |

Regras:
- Escrever o HTML em caixa normal e aplicar a caixa-alta pelo CSS (`text-transform: uppercase`): leitor de tela e busca leem certo, e a troca para a Integral (que já é só caixa-alta) não muda nada.
- A fonte pixel é **detalhe**: nunca em frase, parágrafo, rótulo de campo, mensagem de erro ou botão. No manual ela só aparece como supergrafismo ("DIGITAL", pág. 4) e na amostra.
- Manter `font-feature-settings: "calt" 0, "liga" 0` na Cascadia (o site atual já faz) para não virar ligadura de código em texto de marketing.

---

## 6. Grafismos

| Grafismo | Onde está no manual | Como usar no site |
|---|---|---|
| **Pixel** (quadrados do O pixel) | ícone secundário; blocos violeta em grade sobre a foto (pág. 16) | marcador de etiqueta; "quadradinhos" decorativos ao lado de janelas e fotos; blocos violeta sobre preto ou branco. Lado do quadrado em múltiplos do módulo (ex.: 12, 24, 48 px) |
| **Estrela de quatro pontas** | só dentro do ícone O | o site atual usa a estrela isolada como separador da faixa animada. **PROPOSTA:** manter (vem do símbolo), sempre pequena (≤ 1em) e nunca no lugar do ícone O |
| **Gradiente violeta granulado** | pág. 2 (manchas difusas: índigo nas bordas, violeta no topo, lavanda no centro, com grão) | fundo das seções violeta (Método, Orçamento), com `radial-gradient` + grão. Texto branco por cima |
| **Monocromia violeta em foto** | pág. 17 | só em imagem decorativa (seção 8) |
| **Grão de filme** | págs. 2, 4, 5, 17 | textura SVG (`feTurbulence`) em sobreposição a ~9% (valor atual), só em fundos e imagens decorativas; nunca sobre rosto ou portfólio |
| **Moldura de celular** | pág. 5 (retângulo arredondado com contorno verde, "OLORIN" nos cantos opostos, ícone O no centro) | hero e imagem de compartilhamento (já em uso) |
| **Adesivos** | pág. 16 (pílula preta com logo verde, quadrado branco com pixel violeta, círculo verde com ícone O preto, levemente girados) | detalhe decorativo pontual (ex.: sobre a foto do time ou no 404) |
| **Tipografia como imagem** | palavra repetida em pilha sangrando a borda (págs. 12 e 14); palavra gigante cortada na base (pág. 4); logo gigante sangrando (pág. 17) | faixa animada, 404 (ex.: "404" gigante em pixel cortado), fundo de seção. Sempre `aria-hidden="true"` |
| **Aba de seção** | págs. 7 a 14: bloco verde no canto com rótulo em Cascadia minúscula + barra preta com subtítulo em Cascadia verde | **PROPOSTA:** componente "etiqueta de seção" (ex.: `serviços` / `o que fazemos`); conversa com a barra de título das janelas |
| **Janelas `.exe`** | **não estão no manual**; são evolução do site (PROMPT 3.2) | ver 6.1 |

### 6.1 Janela `.exe` (componente `janela-exe`)
Anatomia (valores do site atual, mantidos como base):
- **Moldura:** borda sólida de 2 px na cor do texto do contexto; **sem raio**.
- **Barra de título:** fundo na cor do texto (ou do destaque); título em fonte pixel 12 px, no formato **`nome_arquivo.ext`**, minúsculo, **sem acento e sem espaço**, como um nome de arquivo de verdade (`relatorio.exe`, `case_01.exe`, `orcamento.exe`, `whatsapp.exe`, `projeto_01.jpg`). Esses nomes são intencionais: entram na lista de exceções do corretor ortográfico.
- **Controles** (minimizar, maximizar, fechar): ícone pixel de 41×9, decorativo, `aria-hidden="true"`. Se algum controle tiver função de verdade, vira `<button>` com nome acessível.
- **Sombra dura:** deslocada, sem desfoque (tokens: `4px 4px 0` em botão no hover, `8px 8px 0` em janela, `10px 10px 0` em cartão de destaque). Cor: preto sobre fundo claro ou verde; verde a 25% sobre preto.
- **Moderação:** **uma janela por bloco de destaque**, não em tudo (PROMPT 3.2).

Raios de borda (**PROPOSTA**, o manual não define): **0** em componentes de interface (janela, botão, campo, cartão, chip); arredondado só onde o manual arredonda: moldura de celular (~40 px), adesivo (pílula e círculo) e os próprios ícones.

Movimento (**PROPOSTA**, o manual não define): curva `cubic-bezier(0.2, 0.7, 0.1, 1)` (atual), animações curtas (≤ 0,6 s) e decorativas, faixa animada com pausa no hover, e tudo desligado com `prefers-reduced-motion: reduce`.

---

## 7. Iconografia

- **Ícones da marca** (pág. 7): ícone O e pixel. São assinatura; não viram ícone de interface (exceção já em uso: o pixel como marcador de etiqueta).
- **Ícones de interface: não definido no manual.** O site atual tem um conjunto próprio desenhado em **grade de 12×12 pixels** (`trafego`, `redes`, `marca`, `impresso`, `site`, `dados`, `check`, `seta`, `relogio`, `mais`, `caixa`, `caixa-ok`, `ctrl`), coerente com o grafismo pixel.

**PROPOSTA (um único estilo):**
- Pixel 12×12, uma cor (`currentColor`), `shape-rendering="crispEdges"`, SVG inline ou máscara CSS.
- Tamanhos **múltiplos de 12** (12, 24, 36, 48 px) para os pixels caírem inteiros na tela. Hoje o padrão é 28 px, o que borra os quadrados: trocar para 24 px.
- `aria-hidden="true"` quando decorativo; quando o ícone for o único conteúdo de um botão ou link, nome acessível no elemento.
- Exceção: **WhatsApp** usa o símbolo oficial da marca (vetorial, uma cor), porque o reconhecimento importa mais que o estilo.
- Nunca usar caractere de texto como ícone ("→", "✓"): as fontes não têm esses glifos.

---

## 8. Fotografia

### 8.1 Tratamento observado no manual

| Pág. | Foto | Cor | Tratamento | Sobreposições |
|---|---|---|---|---|
| 2 | (não é foto) gradiente | violeta | manchas difusas + grão forte | logo branco no centro |
| 4 | céu azul com nuvem; mão de pele escura segura um celular cuja tela reflete as nuvens; manga de moletom branco | **colorida natural** (azuis frios, leve rosado à direita) | grão leve | ícone O e pixel em verde; "DIGITAL" gigante em Retro Computer verde, cortado na base |
| 5 | faixa de pedestres vista de cima, pessoas borradas em movimento | **P&B** de alto contraste | grão; desfoque de movimento | moldura de celular verde; "OLORIN" verde nos cantos; ícone O verde no centro |
| 6 | close de um olho castanho, pele escura, cílios nítidos | **colorida natural**, tons quentes (âmbar e marrom) | nítida, sem filtro aparente | ícone pixel e ícone O gigantes em verde; "LOGO" pequeno em verde sobre a pupila |
| 16 | mãos (unhas claras, anel, pulseira de contas) digitando num notebook preto sobre calça jeans preta | **colorida**, mas com pouca saturação (domínio de preto e cinza; só a pele tem cor) | baixa resolução (736×920 no PDF) | blocos pixel violeta chapados entrando pela direita; três adesivos da marca, girados |
| 17 | silhueta de uma pessoa em ambiente enevoado, com faixas de luz | **monocromia violeta** (duotone índigo → lavanda) | muito granulada e desfocada | logo principal branco gigante, sangrando à direita |

Resumo: o manual usa **três modos** (colorida natural, P&B de alto contraste, monocromia violeta), quase sempre com grão, e **sempre** com um elemento da marca por cima (logo, ícone, pixel, moldura ou tipografia gigante). Não há regra escrita: são exemplos.

A origem e a licença dessas fotos **não estão no manual** e não foram verificadas. Duas delas já estão no site atual: `hero-celular.webp` é a foto da pág. 5 e `sobre-bastidores.webp` é a foto da pág. 16 (mesmo arquivo, 736×920). O PROMPT (12.1.5) proíbe banco de imagens. `[CONFIRMAR: origem e licença das fotos das págs. 4, 5, 6, 16 e 17 antes de usar qualquer uma no site]`.

### 8.2 Como o site atual trata fotos
- Hero: foto da pág. 5 em P&B (`grayscale(1) contrast(1.25)`) dentro da moldura de celular verde. Coerente com o manual.
- "Sobre": foto da pág. 16 em P&B, com quadrados violeta nos cantos.
- Portfólio: imagens em P&B, que ficam coloridas no hover, com sobreposição em gradiente violeta escuro (`rgba(75, 31, 166, 0.95)`) na legenda.

### 8.3 Proposta de tratamento para o v3 (PROPOSTA)

1. **Fotos da equipe: coloridas e naturais, dentro de moldura de janela `.exe`.** Só correção de luz (balanço de branco e exposição para igualar as três), sem filtro, sem P&B, sem duotone, sem grão no rosto. Recorte 4:5 (card) e 1:1 (avatar), cabeça e ombros, olhos perto do terço superior. Janela com barra de título no padrão de nome de arquivo (ex.: `natalia.jpg`), corpo preto, sombra dura.
2. **Duotone e gradiente violeta: só em imagem decorativa** (`alt=""`), como a pág. 17. Aplicar no build (com `sharp`, gravando a imagem já tingida), não com filtro CSS em tempo real. Sombras em índigo (~`#1E065A`), luzes em violeta/lavanda, grão por cima.
3. **Nunca duotone, gradiente, P&B ou sobreposição colorida em foto de cliente ou de portfólio.** O trabalho aparece com as cores em que foi entregue. Legenda em barra sólida preta ou branca, fora da imagem ou na borda, sem véu violeta.
4. **P&B de alto contraste** (pág. 5): permitido em imagem decorativa, com elemento verde por cima.
5. **Toda foto decorativa leva um elemento da marca** (moldura, pixel, ícone ou tipografia), como em todas as aplicações do manual.
6. Sem banco de imagens e sem rosto gerado por IA (PROMPT 12.1.5). Faltou foto: placeholder com iniciais na estética `.exe`.

### 8.4 Fotos da equipe recebidas (`_inbox/`)

| Arquivo | Tamanho | O que se vê |
|---|---|---|
| `equipe-1.png` | 417×533 | mulher de cabelo cacheado, ambiente interno claro, luz de janela, tons neutros e frios; selfie |
| `equipe-2.webp` | 1080×1080 | homem de barba, piercings, jaqueta preta, ângulo de baixo para cima contra parede clara; tons quentes e contraste alto (parece já ter filtro) |
| `equipe-3.webp` | 960×1200 | homem de barba, camiseta bege, ao ar livre, céu azul e prédios ao fundo; sol forte e cores saturadas |

- As três têm luz e fundo muito diferentes. O recorte justo (cabeça e ombros) e a correção leve de balanço de branco ajudam a dar unidade sem descaracterizar.
- `equipe-1.png` tem só 417 px de largura: serve para card de até ~208 px em tela de alta densidade (ou até 417 px com perda de nitidez). `[CONFIRMAR: original em resolução maior]`.
- Os nomes dos arquivos não dizem quem é quem. `[CONFIRMAR: qual foto é de Natália Arruda, Vinicius Mafra e Derek Gonçalves]` (registrar no `manifest.json`; não deduzir no site sem confirmação).
- As três são fotos da própria equipe enviadas pelo dono; a autorização de uso das próprias imagens fica como `confirmada` no manifest só depois de o dono confirmar.

---

## 9. Tom de voz

**O manual não define tom de voz.** A fonte é o PROMPT (seção 0.2, regra 7, e seção 17).

Regras:
- Português do Brasil, **direto, humano, sem jargão**.
- Sempre **"nós"**. Nunca "eu" nem "mesma cabeça".
- O diferencial é **"o mesmo time"** (três especialistas). Usar também **"Método Olorin"** (Diagnóstico → Direção → Execução → Leitura).
- Lema: **"Não é sobre aparecer. É sobre vender."**
- Nunca prometer "garantido", "o melhor", "100% de resultado".
- Escrever como o dono de negócio fala ("não sei quanto custou cada venda"), não como agência fala ("otimização de KPIs").
- Frases curtas (média ≤ 18 palavras), uma ideia por parágrafo, palavras do dia a dia. Termos técnicos (ROAS, CPA, pixel, GTM) explicados na primeira vez em que aparecem.
- Preços no formato `R$ 2.500`. Sem espaços duplos. Travessões e aspas consistentes.
- Botão principal: **`Quero meu diagnóstico gratuito`**. Orçamento tradicional: **`Pedir orçamento`**.
- Sem urgência ou escassez artificial; sem comparação com concorrentes.

| ✔ Assim | ✘ Assim não |
|---|---|
| "Nós cuidamos do anúncio, do conteúdo e do site. É o mesmo time do começo ao fim." | "Eu cuido de tudo pra você." |
| "Recomendamos pelo menos R$ 1.500/mês de verba." | "Recomendo pelo menos R$ 1.500/mês." |
| "Você sabe quanto custou cada venda." | "Otimizamos seus KPIs de performance." |
| "ROAS (quanto volta em vendas para cada real investido em anúncio)" | "ROAS" sem explicação |
| "Resposta em até 1 dia útil." | "Últimas vagas! Garanta já o melhor resultado." |

Observado no texto atual (corrigir no v3): "recomendo" (2 ocorrências, inclusive no JSON-LD), "Vou montar sua proposta" (primeira pessoa do singular), "Esteve a frente" (falta crase). **PROPOSTA:** trocar "a gente" por formas com "nós" ("Começamos pelo diagnóstico") e usar "para" em vez de "pra" no texto corrido, para manter a regra do "nós" e a revisão ortográfica limpas.

---

## 10. Exemplos de aplicação

**No manual:** capa (pág. 1), logo sobre gradiente (pág. 2), foto + supergrafismo (págs. 4 e 6), moldura de celular/story (pág. 5), perfil de rede social (pág. 15), foto com adesivos e pixels (pág. 16), foto monocromática com logo gigante (pág. 17).

**No site v3 (PROPOSTA, a partir do manual):**

| Lugar | Aplicação | Base no manual |
|---|---|---|
| Cabeçalho | logo principal verde sobre preto | págs. 3 e 8 |
| Hero | fundo preto, título branco com "vender." em verde; moldura de celular + janela `relatorio.exe` | pág. 5 (foto só com licença confirmada; senão, composição gráfica) |
| Faixa animada | verde com texto preto, ou violeta com texto branco; separador estrela | págs. 1, 2 |
| Seções Método e Orçamento | violeta com gradiente granulado, texto e botões brancos | pág. 2 |
| Resultados | fundo verde, números pretos em display (`R$ 2M+`, `50+`, `2x`, `100+`) | págs. 1 e 9 |
| Equipe | três janelas `.exe` com fotos coloridas | evolução (seção 8.3) |
| Cartões de serviço e plano | fundo branco ou preto, borda de 2 px, rótulo violeta (no branco) ou verde (no preto) | págs. 10 e 11 |
| Imagem de compartilhamento (`og:image`) | preto + logo verde + título branco com destaque verde + moldura de celular | págs. 3 e 5 (o `compartilhamento.jpg` atual já segue isso) |
| Favicon e ícone do app | ícone O preto sobre verde | pág. 15 |
| 404 | "404" gigante em fonte pixel cortado na base + ícones verdes | pág. 4 |

---

## 11. Divergências manual × site

| Item | Manual | Site em produção | Decisão no v3 e por quê |
|---|---|---|---|
| Fonte principal | Integral CF Bold e Regular | Archivo Expanded 900 e 800 (SIL OFL) | **Manter a substituta até a compra da licença Web** da Integral CF; o build já fica pronto para receber os `.woff2` licenciados (5.3). Converter o OTF desktop é proibido pela licença |
| Fonte secundária | Retro Computer | Silkscreen (SIL OFL) | **Manter a substituta até a autorização por escrito** do autor; build pronto para a troca |
| Fonte de texto longo | Cascadia Code (cópia do Windows embutida no PDF) | Cascadia Code OFL | Sem divergência de desenho; usar a versão OFL, que permite uso na web |
| Uso da fonte pixel | só supergrafismo ("DIGITAL") e amostra; rótulos do manual são em Integral CF Bold | Silkscreen em botões, rótulos de campo, filtros, títulos do rodapé, barra do celular, mensagens de erro (11 px) | **Restringir** a etiquetas curtas, títulos de janela e nomes de arquivo (≥ 12 px). Botões e rótulos passam para a display 800 em caixa-alta (como no manual); rótulos de campo e erros, para Cascadia (legibilidade e acessibilidade) |
| Paleta | 4 cores | 4 cores **+** `#4B1FA6`, `#A77BFF`, `#111`, `#F4F0FF`, `#F1F1F1`, `#FFFDE0`, `rgba(190, 150, 255, …)`, `rgba(20, 0, 70, …)` | **Só as 4 cores** + transparências de preto/branco + tons de gradiente declarados como token (2.2). `#A77BFF` (arroba do Instagram) vira branco ou verde; `#4B1FA6` sai junto com o véu do portfólio; `#111` vira preto; `#FFFDE0` era do painel do WordPress e deixa de existir |
| Verde × violeta | proibido encostar (pág. 10) | respeitado (nenhuma seção verde encosta em violeta) | Manter; a seção 3.3 do PROMPT diz que verde sobre violeta passa no contraste, mas **o manual vence: não usar** |
| Gradiente violeta | manchas difusas índigo → violeta → lavanda com grão (pág. 2) | `radial-gradient` índigo sobre violeta + grão SVG a 9% | Manter a técnica; aproximar da pág. 2 incluindo a mancha clara lavanda; tons como tokens |
| Janelas `.exe` | não existem | relatorio, case_01–03, orcamento, whatsapp, projeto_01–08 | **Manter** (pedido do PROMPT 3.2), com moderação: uma por bloco de destaque. A aba de seção do manual (págs. 7–14) é a referência visual mais próxima |
| Raio de borda | arredondado nos símbolos, na moldura de celular e nos adesivos | 0 nos componentes; 40 px na moldura de celular | Manter: 0 em interface, arredondado só onde o manual arredonda (6.1) |
| Estrela isolada | só dentro do ícone O | separador da faixa animada | Manter como detalhe pequeno (deriva do símbolo); nunca no lugar do ícone |
| Fotos | colorida, P&B e monocromia violeta, sempre com elemento da marca; origem não informada | duas fotos do próprio manual (págs. 5 e 16) em P&B | Equipe colorida em janela `.exe`; duotone só decorativo; `[CONFIRMAR]` licença antes de reutilizar foto do manual |
| Portfólio | não tratado no manual | P&B, cor no hover, véu violeta escuro na legenda | **Cor natural sempre**, sem véu violeta; legenda em barra sólida (8.3) |
| Ícones de interface | não definidos | pixel 12×12, exibidos a 28 px | Manter o estilo; exibir em múltiplos de 12 (24 px) para não borrar |
| Nome no perfil | "OLORIN_DIGITAL" (maquete da pág. 15) | `@olorin.digital_` | Usar sempre o perfil real `@olorin.digital_` |
| Nome da empresa no rodapé | logo "OLORIN" | o rodapé usa o perfil do Instagram como nome da empresa | Escrever **Olorin Digital ©** (PROMPT, achado 15) |
| Logo nos cantos da moldura | "OLORIN" em Integral CF Bold | "OLORIN" em Archivo Expanded 900 (texto via CSS) | Usar a logo tipográfica em SVG (versão secundária 2), não texto redigitado |

---

## 12. Pendências para `docs/CONTENT-TODO.md`

- `[CONFIRMAR: compra da licença Web da Integral CF e faixa de visualizações mensais]`
- `[CONFIRMAR: autorização por escrito do autor da Retro Computer para uso comercial]`
- `[CONFIRMAR: origem e licença das fotos das págs. 4, 5, 6, 16 e 17 do manual; hoje duas delas estão no ar]`
- `[CONFIRMAR: qual foto de _inbox/ é de cada pessoa da equipe]`
- `[CONFIRMAR: versão em resolução maior de equipe-1.png]`
- `[CONFIRMAR: aprovação das regras marcadas como PROPOSTA (área de proteção, tamanho mínimo, usos proibidos, hierarquia tipográfica, tratamento de foto)]`
