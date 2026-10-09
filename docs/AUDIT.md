# Auditoria do site atual · Olorin Digital

> **Data:** 08/10/2026 · **Escopo:** `site-atual/` (referência somente leitura) · **Base:** PROMPT.md, seções 0.3 e 1.
> Caminhos de arquivo são relativos a `site-atual/`, salvo indicação. "Linha" = número de linha no arquivo.

**Origem dos arquivos auditados** (conforme `site-atual/LEIA-ANTES.md`):

- `index.html` e `.htaccess`: versão **do servidor** (baixada do FTP pelo dono).
- Todo o resto (`404.html`, `enviar.php`, `config.php`, `sitemap.xml`, `robots.txt`, `politica-de-privacidade/`, `assets/`, `leads/`, `LEIA-ME.txt`): exportação estática **v1**. Conferi com `diff -rq` que esses arquivos são idênticos a `legado/site-estatico-v1/`. As versões do servidor desses arquivos **não foram enviadas** e, portanto, **não foram verificadas**.
- O `diff` entre `legado/site-estatico-v1/index.html` e `site-atual/index.html` mostra que o dono corrigiu à mão, no servidor, o domínio, o WhatsApp, o e-mail, o Instagram e parte dos textos em primeira pessoa **só no `index.html`**. É provável (inferência, não verificada) que `404.html`, a política, o `sitemap.xml` e o `robots.txt` do servidor continuem como na v1.

**Segurança:** nenhum segredo aparece neste documento. O `config.php` desta cópia tem o campo `smtp_senha` vazio; o do servidor (com a senha real) não foi visto.

---

## 0. Resumo

### 0.1 Linha de base (PageSpeed Insights, celular, 08/10/2026, informada no PROMPT)

| Desempenho | Acessibilidade | Práticas recomendadas | SEO | LCP | FCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|---|---|
| 97 | 100 | 100 | 100 | 2,3 s | 1,5 s | 70 ms | 0 | 2,8 s |

Não reexecutei o PageSpeed nem o Lighthouse nesta auditoria: os números acima são os do PROMPT. O v3 precisa ficar igual ou melhor em todos eles.

### 0.2 Situação dos 16 achados do PROMPT

| Situação | Achados |
|---|---|
| Confirmado | 1, 2, 5, 6, 7, 10, 13, 14, 15, 16 |
| Confirmado com ressalva (o problema existe, mas o detalhe é diferente do descrito) | 3, 9, 12 |
| Parcialmente confirmado | 4 (a checagem de tempo **roda** quando o JavaScript está ligado), 8 (só o `LEIA-ME.txt` pôde ser conferido), 11 (os dois preloads atuais são de fontes usadas na primeira dobra; falta a Silkscreen) |
| Refutado | nenhum |

Além deles, registrei **35 achados novos** (seção 3), sendo 3 críticos (N01, N02, N33).

### 0.3 Prioridades (o que mais pesa para o negócio)

1. **Domínio errado e dados de exemplo fora do `index.html`:** sitemap, `robots.txt`, `404.html` e Política de Privacidade (cópia v1) apontam para um domínio que não é o `olorin.com.br`, com WhatsApp `5541900000000`, e-mail no domínio errado e Instagram errado. A política tem até o `canonical` no domínio errado (achados 1, 2, N01, N02, N03).
2. **Anti-spam do formulário quase decorativo:** o tempo mínimo só vale para quem roda o JavaScript do site; um robô que envia direto para o `enviar.php` nunca é checado, e não há checagem de `Origin`/`Referer` (achados 4, N30).
3. **Leads e senha dentro da pasta pública**, protegidos só por `.htaccess` (achados 3, 6, N34).
4. **Sem HTTPS forçado e sem nenhuma medição:** nenhum GTM, GA4 ou pixel está instalado; os eventos do `dataLayer` não vão para lugar nenhum (achados 7, N33).
5. **Formulário sem a opção "Rastreamento e relatório"** e mensagens de WhatsApp sem origem (achados 5, 14).

### 0.4 Limitações (o que eu não consegui verificar)

- **Site no ar:** o proxy desta sessão bloqueou o acesso a `https://olorin.com.br` (erro 403 no túnel). Não conferi cabeçalhos, redirecionamentos, certificado SSL, status do `/404.html` nem se `/leads/pedidos.csv` responde 403.
- **Versões do servidor** de `404.html`, política, `config.php`, `enviar.php`, `sitemap.xml`, `robots.txt` e `assets/`: não enviadas.
- **`license.txt` e `error.log`:** não estão nesta cópia (existem só no servidor, segundo o PROMPT).
- **Número `5541996327657`** (que o PROMPT diz estar no `config.php` do servidor): não aparece em nenhum arquivo desta cópia.
- **Ortografia automática:** não há `hunspell`/dicionário pt-BR instalado no ambiente; a revisão de texto foi manual.
- **Lighthouse/axe:** não reexecutados; a atribuição exata do "reflow forçado" e da cadeia crítica de fontes não foi medida por mim.
- **Origem das imagens** (hero, bastidores, portfólio): não há metadados nem registro que permitam saber se são trabalhos reais, fotos próprias ou banco de imagens.

---

## 1. Inventário e pesos

Medições com `wc -c` e `gzip -9` (o Apache da Locaweb pode usar outro nível de compressão; os valores comprimidos são estimativas).

| Arquivo | Bruto | gzip -9 | Observação |
|---|---:|---:|---|
| `index.html` | 81,8 KiB | 17,7 KiB | ≈ 26 KiB são CSS inline do WordPress (32 % do HTML); 4 cópias inline do SVG do logo (≈ 9,7 KiB); JSON-LD 3,0 KiB |
| `404.html` | 34,1 KiB | 6,8 KiB | |
| `politica-de-privacidade/index.html` | 38,8 KiB | 8,3 KiB | |
| `assets/css/olorin.css` | 73,8 KiB | 15,4 KiB | não minificado, bloqueia a renderização |
| `assets/wp/blocks/paragraph/style.min.css` | 0,6 KiB | — | requisição bloqueante extra, só com classes não usadas |
| `assets/js/olorin.js` | 30,3 KiB | 9,2 KiB | não minificado, `defer` |
| **Fontes (5 arquivos `.woff2`)** | **94,0 KiB** | — | Archivo Expanded 900 (13,4), 800 (14,1); Cascadia Code 400 (28,8), 700 (29,5); Silkscreen 400 (8,2) |
| `assets/img/hero-celular.webp` | 83,4 KiB | — | 600×1000; exibida com no máximo 320 px de largura CSS |
| `assets/img/sobre-bastidores.webp` | 59,9 KiB | — | 736×920 |
| `assets/img/portfolio/*.webp` (8) | 228,6 KiB | — | 600×400 a 640×800; maior: `redes-conteudo.webp` (45,1 KiB) |
| `assets/img/erro-404.webp` | 73,7 KiB | — | 1200×675, fundo da 404 |
| `assets/img/compartilhamento.jpg` | 68,5 KiB | — | 1200×630 (`og:image`) |
| `assets/img/brand/*` | 8,8 KiB | — | favicon SVG e PNG 32, apple-touch-icon 180 |
| **Total de `assets/`** | **721,7 KiB** | | |

**Estimativa da primeira carga da home no celular** (antes de rolar; soma de arquivos, não medida em rede): HTML 17,7 + CSS 15,4 + CSS de parágrafo 0,6 + JS 9,2 + fontes 94,0 + hero 83,4 ≈ **220 KiB**. Com a rolagem completa entram mais ≈ 289 KiB de imagens com `loading="lazy"`.

---

## 2. Os 16 achados da seção 1 do PROMPT

Gravidade: **crítico** = risco de segurança, perda de lead ou dano direto em SEO; **importante** = qualidade, desempenho, consistência ou conversão.

| # | Achado | Situação | Gravidade | Evidência (arquivo:linha · trecho) | Correção no v3 |
|---|---|---|---|---|---|
| 1 | Sitemap com domínio errado | Confirmado (cópia v1) | Crítico | `sitemap.xml:3-4`: as 2 URLs (`/` e `/politica-de-privacidade/`) usam o domínio errado; sem `lastmod`. Também `robots.txt:5` aponta o `Sitemap:` para o domínio errado (ver N02) | Sitemap gerado no build só com URLs indexáveis de `https://olorin.com.br/`, com `lastmod` real; teste de build que falha com qualquer outro domínio |
| 2 | 404 com WhatsApp de exemplo e domínio errado | Confirmado (cópia v1) | Crítico | `404.html:50, 81, 92, 107, 118, 150, 156`: 7 links `wa.me/5541900000000`; `404.html:107`: texto `(41) 90000-0000`; `404.html:167`: `"whatsapp":"5541900000000"`; `404.html:22-23`: `og:url` e `og:image` no domínio errado; `404.html:108`: e-mail `oi@` no domínio errado. Extras: título em inglês, "mesma cabeça" e Instagram errado (N03, N06, N07) | 404 gerada do mesmo layout, com dados de `site/config.json` (número, e-mail, Instagram), busca de serviços, home e WhatsApp com `[ref: 404]` |
| 3 | `config.php` com senha dentro da pasta pública | Confirmado com ressalva | Crítico | `config.php:1-32` fica ao lado do `index.html` e é lido por `enviar.php:15` (`require __DIR__ . '/config.php'`); `config.php:20`: `smtp_senha` [omitido]; bloqueio em `.htaccess:10`. Ressalva na seção 2.1 | Testar se o PHP lê `../olorin-config.php` (pergunta 0.5.10); se sim, mover; se não, manter com `<?php` no topo e bloqueio ampliado a cópias de backup. Entregar `config.example.php` sem valores reais |
| 4 | Contrato do tempo de preenchimento | Parcialmente confirmado | Crítico | `index.html:1006`: `<input type="hidden" name="olorin_ts" value="1791474859">` (carimbo fixo); `olorin.js:432-436, 554`: o JS cria e preenche `olorin_tempo`; `enviar.php:58`: só lê `olorin_tempo`, e só se ele existir. Comportamento real na seção 2.1 | `olorin_ts` sai vazio no HTML e o JS o preenche com os segundos desde a primeira interação; o PHP lê `olorin_ts` (aceita `olorin_tempo` por compatibilidade), rejeita < 3 s e, sem o campo (envio sem JS), aceita mas marca no CSV e depende de honeypot, limite por IP e `Origin`/`Referer` |
| 5 | "Rastreamento e relatório" fora do formulário | Confirmado | Crítico | `config.php:24-31`: a lista `servicos` não tem a opção; `index.html:1054-1077`: os chips do formulário também não; o card existe em `index.html:384`; `enviar.php:93`: `array_intersect(...)` descarta o que não está na lista | Opção nos chips **e** na lista do PHP, ambos gerados da mesma fonte de dados; teste que envia cada opção e confere o CSV |
| 6 | Leads dentro da pasta pública | Confirmado | Crítico | `enviar.php:112`: `$csv = __DIR__ . '/leads/pedidos.csv'` (arquivo único, sem rotação); bloqueio em duas camadas: `leads/.htaccess:2-8` (`Require all denied`) e `.htaccess:10` (`.*\.csv`). Depende de o `.htaccess` oculto ter subido pelo FTP (não verificado no servidor) | `../leads/AAAA-MM.csv` fora do `public_html`, com o bloqueio atual como reserva se o PHP não puder escrever lá |
| 7 | HTTPS "obrigatório" sem regra | Confirmado | Crítico | `.htaccess:20-21`: o comentário manda "descomente as 4 linhas abaixo", mas as linhas seguintes são a regra de compressão. Na v1 (`legado/site-estatico-v1/.htaccess:22-26`) o bloco comentado existia; na versão do servidor ele foi apagado. Não há regra `http→https` nem `www→sem www`, nem HSTS | Bloco da seção 18 do PROMPT (`RewriteRule ^ https://olorin.com.br%{REQUEST_URI} [L,R=301]`), ativado só depois de confirmar o SSL; HSTS depois do teste em produção |
| 8 | `license.txt`, `error.log` e `LEIA-ME.txt` no ar | Parcialmente confirmado | Importante | `LEIA-ME.txt` (1.244 bytes) está nesta cópia e bloqueado em `.htaccess:10`; ele ainda recomenda "usar a versão WordPress do tema". `license.txt` e `error.log` **não estão nesta cópia**: não verifiquei existência nem conteúdo. Pelo `.htaccess:10`, nem `.txt` (exceto o `LEIA-ME.txt`) nem `.log` são bloqueados, então, se existirem no servidor, estão públicos | Nenhum dos três vai para o `dist/`; `docs/DEPLOY.md` lista a remoção no servidor (e de `assets/wp/`); `.htaccess` bloqueia `.log`, `.md`, `.bak`, `license.txt` |
| 9 | CSS morto do WordPress | Confirmado com ressalva | Importante | `index.html:28-30` (`wp-block-library-inline-css`: `--wp-admin-theme-color`, gradientes como `has-purple-crush-gradient-background`); `index.html:1232-1255`: mais 8 blocos `<style>` no fim do `<body>`; os presets `vivid-red`, `pale-pink` e `luminous-vivid-amber` estão no `global-styles-inline-css` (`index.html:1254`), não no `wp-block-library`; `index.html:32`: folha `assets/wp/blocks/paragraph/style.min.css`. Ressalva na seção 2.1 | Remover todo o CSS do WordPress e a pasta `assets/wp/`; antes, migrar para os tokens da marca as poucas regras de que o visual depende |
| 10 | Objeto `window.OLORIN` herdado | Confirmado | Importante | `index.html:1257`: `window.OLORIN={"restUrl":"enviar.php","whatsapp":"5541996460861",...,"cursor":true,"pixelId":"","hasConsent":false}`; igual em `404.html:167` e `politica-de-privacidade/index.html:273` (com o número de exemplo); com `hasConsent:false`, `olorin.js:731` encerra o módulo de consentimento e o pixel nunca carrega | `window.OLORIN_CONFIG` gerado de `site/config.json` (seção 13.1), sem segredos, igual em todas as páginas |
| 11 | Preload de fontes desalinhado | Parcialmente confirmado | Importante | `index.html:8-9`: preload de `archivo-expanded-900` e `cascadia-code-400`. Pelo CSS, essas **são** as fontes da primeira dobra (H1 em 900: `olorin.css:888-891`; texto em 400: `olorin.css:155`). A **Silkscreen**, usada na primeira dobra (etiqueta do hero e botões: `olorin.css:356, 411`), **não** tem preload. A 800 (`olorin.css:1230, 1364, 2359`) e a 700 (`olorin.css:1847, 2205, 2283`) só aparecem abaixo da dobra, mas o navegador as baixa no carregamento porque o texto está no DOM. Não medi a cadeia crítica | Medir com Coverage/Lighthouse; preload só do que a primeira dobra usa (provavelmente 900, 400 e Silkscreen); subset latim + pt-BR; avaliar trocar 700/800 por 900/400 para eliminar arquivos |
| 12 | Imagens sem dimensões e sem `srcset` | Confirmado com ressalva | Importante | `index.html:121`: hero sem `width`/`height`, sem `srcset`, sem `fetchpriority`, com `decoding="async"`; `index.html:704`: bastidores sem `width`/`height`. Ressalva: não há CLS porque o CSS reserva o espaço (`.o-phone { aspect-ratio: 3 / 5 }` em `olorin.css:948-956`; `aspect-ratio: 4 / 5` em `olorin.css:1675-1680`) | AVIF + WebP em larguras responsivas, `width`/`height` reais, `srcset`/`sizes`; hero com `fetchpriority="high"`, sem lazy, ≤ 45 KiB |
| 13 | Erros de texto e primeira pessoa | Confirmado | Importante | `index.html:717`: "Esteve a frente de diversos projetos" (falta a crase); "recomendo" em `index.html:27` (JSON-LD do FAQ) e `index.html:950`. Há mais casos de primeira pessoa do singular (N06). "Em quanto tempo eu vejo resultado?" (`index.html:955`) é a voz do visitante e pode ficar | "Esteve à frente"; "recomendamos"; todo o texto em "nós"; FAQ e JSON-LD da mesma fonte; revisão ortográfica no build |
| 14 | Mesma mensagem de WhatsApp em quase tudo | Confirmado | Importante | `index.html` tem 12 links `wa.me` com só 5 textos diferentes; 8 deles usam "Oi! Vim pelo site da Olorin e quero um orçamento." (linhas 53, 84, 110, 1158, 1176, 1187, 1219, 1225); nenhum identifica a origem. `404.html` (7 links) e a política (6) usam um texto só | Função única `waLink(origem, contexto)` com sufixo `[ref: origem]` em **todos** os links, inclusive os montados pelo JS e pelo PHP |
| 15 | Rodapé com o handle no lugar do nome | Confirmado | Importante | `index.html:1210`: o rodapé mostra o handle `@olorin.digital_` sem a arroba e sem o sublinhado final, seguido de "© 2026 · Curitiba, PR". Em `404.html:141` e `politica-de-privacidade/index.html:238` aparece outra grafia errada (olorin\_digital ©) | `Olorin Digital © 2026 · Curitiba, PR` em todas as páginas, vindo de um único partial |
| 16 | Contradições de comunicação | Confirmado | Importante | `index.html:721`: "Poucas marcas por vez" × `index.html:602`: "87+ Marcas atendidas". `index.html:214`: dor "Você fala com o atendimento, nunca com quem realmente faz o trabalho" × `index.html:717`: "Derek Gonçalves, ... o atendimento da Olorin" × `index.html:731`: "Chamar o Derek no WhatsApp" × `index.html:713` e `1140`: "Você fala com quem faz" / "Você fala direto com quem executa" | Números novos informados pelo dono (seção 4); reescrever "Poucas marcas por vez" para não brigar com "50+ marcas atendidas"; ajustar a promessa e a dor conforme a pergunta 0.5.8 (seção 12.3 do PROMPT) |

### 2.1 Detalhes dos achados com nuance

**Achado 4: o que acontece de verdade com o tempo de preenchimento**

- **No HTML estático:** `olorin_ts` vale `1791474859`, que corresponde a 08/10/2026 às 12:54:19 (horário de Brasília), um instante fixo do dia da exportação (os arquivos v1 desta cópia têm data de modificação 08/10/2026 15:54 UTC, o mesmo instante). No tema WordPress, esse campo era impresso a cada visita com `time()` (`legado/tema-wordpress/olorin/blocks/formulario/render.php:38`) e lido pelo servidor (`legado/tema-wordpress/olorin/inc/leads.php:164-166`). A exportação estática **congelou** o valor: hoje ele é igual para todo visitante e não mede nada. O `enviar.php` estático nem o lê. Se passasse a lê-lo como carimbo de tempo, a diferença para "agora" só cresceria e a checagem passaria sempre; por isso "ler `olorin_ts`" só funciona se o campo mudar de significado no v3.
- **No JavaScript:** `olorin.js:432-436` cria o campo oculto `olorin_tempo`; `olorin.js:554` o preenche, no envio, com os segundos desde a inicialização do script (`openedAt = Date.now()` no `DOMContentLoaded`, não desde a primeira interação com o formulário).
- **No PHP:** `enviar.php:58` só aplica o mínimo de 3 s se `olorin_tempo` existir e não estiver vazio.
- **Resultado:** com o JavaScript ligado, a checagem **roda** (ao contrário do que diz o PROMPT), mas mede "tempo na página", não "tempo preenchendo". Sem JavaScript, o campo não existe e a checagem é pulada. Um robô que posta direto no `enviar.php` simplesmente omite o campo e nunca é checado. Como também não há checagem de `Origin`/`Referer` (N30), a proteção real contra robôs é só o honeypot (`enviar.php:55`) e o limite de 6 envios em 10 minutos por IP (`enviar.php:61-69`).

**Achado 3: por que o risco é real, mas diferente do descrito**

- O arquivo já começa com `<?php` (`config.php:1`) e só faz `return array(...)`. Uma requisição direta, executada pelo PHP, devolve página vazia mesmo sem o `.htaccess`. O bloqueio em `.htaccess:10` é uma segunda camada.
- O risco está em: cópias de edição (`config.php.bak`, `config.php~`, `.swp`), que **não** são bloqueadas e seriam servidas como texto; falha ou troca do manipulador de PHP; qualquer script comprometido na mesma pasta; e a senha em texto puro num arquivo que circula pelo FTP. O PROMPT informa que a senha já circulou fora do servidor: a troca da senha da caixa é pré-requisito, independente do código.
- O `config.php` desta cópia (v1) tem e-mail de destino no domínio errado (`config.php:10`), WhatsApp de exemplo (`config.php:13`) e `smtp_usuario`/`smtp_senha` vazios (com isso, o `enviar.php:165-171` cairia no `mail()` do PHP). A versão do servidor não foi vista.

**Achado 7: comentário órfão**

`.htaccess:20-21` diz "HTTPS obrigatório — descomente as 4 linhas abaixo DEPOIS de ativar o certificado SSL", mas a linha 22 está vazia e a 23 já abre o `mod_deflate`. Não verifiquei se o painel da Locaweb força HTTPS por fora do `.htaccess` (o site não abriu desta sessão). A Política de Privacidade afirma "O site usa conexão criptografada (HTTPS)" (`politica-de-privacidade/index.html:179`), o que hoje não é garantido pelo código.

**Achado 8: o que dá para afirmar sem os arquivos**

`license.txt` e `error.log` só existem no servidor: não verifiquei se ainda estão lá nem o que contêm (o PROMPT cita mensagens `downloader::recursive Timeout`). O que o código garante é que o `.htaccess` atual não os bloqueia. O `enviar.php:154` também usa `error_log()`; não sei para onde o PHP da Locaweb manda esse log (se for um arquivo na pasta pública, ele seria público pelo mesmo motivo).

**Achado 9: o que não pode ser apagado às cegas**

- Somando os 9 blocos `<style>` do WordPress no `index.html`, são ≈ 26 KiB (26.909 bytes), dos quais no máximo ≈ 6,8 KiB têm seletores que casam com classes da página (estimativa por script; a maior parte disso são variáveis `--wp--preset--*` não usadas).
- **Dependência escondida:** o `olorin.css` define as cores de texto de cada fundo (`olorin.css:263-302`), mas **não** define `background-color` para `.has-preto/branco/verde/violeta-background-color`. Os fundos das seções e o verde da palavra "vender." do H1 (`.has-verde-color`, `index.html:97`) vêm **só** do `global-styles-inline-css`, no fim do `<body>` (`index.html:1254`). Apagar esse bloco sem migrar essas regras quebra o visual.
- Por estarem no fim do `<body>`, essas regras podem chegar depois da primeira pintura (não medi).
- No `olorin.css`, 31 classes não aparecem em nenhuma página nem no JS (blog, paginação, busca, cartões de post, `o-admin-note`, cookies etc.), ≈ 4,3 KiB de regras mortas; há também regras `.admin-bar` (barra de administração do WordPress).

**Achado 11: preload × cadeia crítica**

Pela leitura do CSS, os dois preloads atuais (900 e 400) não estão errados, porque o H1 e o texto do hero os usam. O que falta é a Silkscreen (etiqueta "Marketing 360 · …" e botões do hero). A 800 e a 700 entram na cadeia porque o navegador baixa uma fonte assim que algum texto do documento a usa, mesmo fora da tela (perguntas do FAQ, frase do rodapé, frase final do checklist). Não reexecutei o Lighthouse para ver a cadeia medida.

**Achado 12: peso e uso real do hero**

O hero tem 600×1000 px e 83,4 KiB, mas é exibido com no máximo 320 px de largura CSS (`olorin.css:914-917`; 270 px no celular, `olorin.css:3111`) e em **preto e branco** via `filter: grayscale(1)` (`olorin.css:957-963`). Uma versão já em tons de cinza, no tamanho certo, pesaria bem menos. Não verifiquei qual elemento é o LCP no celular (a imagem ou o H1).

---

## 3. Achados novos

Gravidade: crítico, importante ou **menor** (ajuste de acabamento, sem risco).

### 3.1 Contatos, domínio e consistência

| ID | Achado | Gravidade | Evidência | Correção no v3 |
|---|---|---|---|---|
| N01 | Política de Privacidade (cópia v1) com `canonical`, `og:url` e `og:image` no domínio errado, e-mail do encarregado no domínio errado e WhatsApp de exemplo | Crítico | `politica-de-privacidade/index.html:21, 22, 30` (canonical); `:103, 171, 205` (e-mail `oi@` no domínio errado); `:50, 81, 204, 215, 247, 253` (6 links `wa.me/5541900000000`) e `:273` | Política gerada do layout comum, `canonical` em `https://olorin.com.br/politica-de-privacidade/`, e-mail `digital@olorin.com.br` |
| N02 | `robots.txt` aponta o sitemap para o domínio errado | Crítico | `robots.txt:5` | `Sitemap: https://olorin.com.br/sitemap.xml`; permitir rastreadores de IA (seção 15.3) |
| N03 | Instagram errado na 404 e na política: link para @olorin\_digital (sublinhado no lugar do ponto, sem o sublinhado final), que pode ser outro perfil (não verifiquei de quem é) | Importante | `404.html:83, 117`; `politica-de-privacidade/index.html:83, 214` | `@olorin.digital_` e `https://instagram.com/olorin.digital_` vindos de `site/config.json` |
| N04 | O WhatsApp do pós-envio vem do `config.php`, não do HTML: `enviar.php:158-159` monta o link com `$cfg['whatsapp']` e `olorin.js:579` troca o botão "Adiantar pelo WhatsApp" por ele. Se o `config.php` do servidor tiver `5541996327657` (PROMPT, pergunta 0.5.1; não verificado), quem acabou de pedir orçamento é levado a um número diferente do resto do site | Importante | `enviar.php:158-159`; `olorin.js:578-579`; `config.php:13` (aqui, número de exemplo) | Uma única fonte para o número (`site/config.json` → HTML, JS e PHP); registrar o número alternativo no CONTENT-TODO |
| N05 | Formatos inconsistentes: "Curitiba/PR" × "Curitiba, PR"; "R$12M+" sem espaço × "R$ 380k" e "R$ 800" | Menor | `index.html:93` × `:86, 1178, 1210`; `index.html:592` × `:646, 787` | Padrão único: "Curitiba, PR" e "R$" seguido de espaço |

### 3.2 Texto e voz da marca

| ID | Achado | Gravidade | Evidência | Correção no v3 |
|---|---|---|---|---|
| N06 | Primeira pessoa do singular além do achado 13 | Importante | `index.html:1096`: "Me conta rapidinho o que você precisa"; `index.html:1122`: "Vou montar sua proposta e te chamo no WhatsApp"; `404.html:16, 21`: "feitos pela mesma cabeça" | "Conte rapidinho o que você precisa"; "Recebido. Vamos montar sua proposta e te chamar no WhatsApp" (texto da seção 10.6); "pelo mesmo time" |
| N07 | Título da 404 em inglês | Importante | `404.html:6` e `:20`: "Page not found \| Olorin Digital" | "Página não encontrada \| Olorin Digital" |
| N08 | Acabamento de texto: espaço duplo ("site e  impresso"), maiúscula depois de dois-pontos ("Curitiba: Anúncio"), espaços sobrando no fim do parágrafo, meta description da política cortada com "—…" | Menor | `index.html:101` (duas ocorrências); `index.html:717`; `politica-de-privacidade/index.html:15, 20` | Texto novo do hero (seção 8 do PROMPT); verificação de espaços duplos no build; description escrita à mão (≤ 155 caracteres) |
| N09 | O checklist diz "Se você marcou mais de dois" (três ou mais), mas o v3 pede resposta a partir de dois; hoje o JS só conta "N de 6 marcados" e não responde nada | Menor | `index.html:221`; `olorin.js:306-314` | Frase de resposta coerente a partir de 2 itens e CTA "Ver como a gente resolve" (seção 8.5) |
| N10 | Mistura de "a gente" e "nós" no mesmo texto (o PROMPT pede "nós"); "pra/pro" coloquial em vários pontos | Menor | "a gente": `index.html:221, 226, 256, 944`; `enviar.php:66, 98`; `olorin.js:495` | Textos institucionais em "nós"; "a gente" só onde for escolha deliberada de tom (ex.: CTA "Ver como a gente resolve", que o PROMPT mantém); registrar a regra em `docs/CONTENT.md` |

### 3.3 Acessibilidade

O PageSpeed deu 100 em Acessibilidade, mas os itens abaixo não são detectados por testes automáticos ou só aparecem depois de interação.

| ID | Achado | Gravidade | Evidência | Correção no v3 |
|---|---|---|---|---|
| N11 | Animações infinitas sem controle de pausa na página (WCAG 2.2.2): letreiro, cursor piscante do H1, símbolo girando, anel do botão flutuante. Só o `prefers-reduced-motion` atenua; o letreiro pausa apenas com o mouse em cima | Importante | `olorin.css:1115` e `:1120` (letreiro); `:905` (cursor do H1); `:931, 1282, 2297` (giro); `:2451` (anel); `:2991-3009` (movimento reduzido) | Animação que pare sozinha em até 5 s ou botão de pausa no letreiro; manter o respeito a `prefers-reduced-motion` |
| N12 | Cursor personalizado esconde o cursor do sistema (`cursor: none`) e é ligado por padrão em mouse/trackpad | Importante | `olorin.css:2537-2546`; `olorin.js:661`; `index.html:1257` (`"cursor":true`) | Desligado por padrão ou sem esconder o cursor nativo; nunca com `prefers-reduced-motion` (seção 14) |
| N13 | HTML inválido (html-validate 11.16.2): `<figcaption>` dentro de `<div>` (não é filho direto de `<figure>`) e `<style>` dentro do `<body>` | Importante | `index.html:441, 458, 475, 492, 509, 526, 543, 560` (figcaption); `index.html:1232-1253` (8 blocos `<style>`); `404.html:163`; `politica-de-privacidade/index.html:260-269` (4 blocos) | Componente `case`/portfólio com `figcaption` como filho direto; nenhum `<style>` no `<body>`; html-validate no `npm run test` |
| N14 | Formulário sem JavaScript: quando o servidor recusa o envio, ele volta para `?orcamento=erro#orcamento` sem nenhuma mensagem na página (o JS só trata `?orcamento=ok`); o `novalidate` desliga a validação nativa do navegador mesmo sem JS | Importante | `enviar.php:36-41`; `olorin.js:418`; `index.html:1004` | `novalidate` só aplicado pelo JS; mensagem de erro visível sem JS (bloco `:target` ou página de erro) com link de WhatsApp |
| N15 | No portfólio, o `alt` repete o que a legenda já diz: o leitor de tela lê duas vezes | Menor | `index.html:437` × `:443-444` (e nos outros 7 itens) | `alt` descrevendo a imagem; legenda com cliente e serviço |
| N16 | Checklist feito com `<div role="checkbox">` (o PROMPT pede botões com `aria-pressed`); `aria-label` aplicado em `<p>` nos contadores, atributo proibido nesse papel pela ARIA 1.2 (o axe não pega porque roda antes da animação; não testei) | Menor | `olorin.js:316-330`; `olorin.js:270` | `<button aria-pressed>`; números sem animação de contagem ou com texto acessível estável |
| N17 | Texto decorativo gerado por CSS que alguns leitores de tela anunciam ("OLORIN" no celular do hero e "Role" no rodapé do hero); `<mark>` no H1 pode ser anunciado como "destacado" | Menor | `olorin.css:965-975`, `:1053-1066`; `index.html:97` | Conteúdo decorativo com texto alternativo vazio (`content: "OLORIN" / ""`) ou em SVG; `<span>` no lugar de `<mark>` |
| N18 | Fonte pixel muito pequena em textos com significado: erros de campo e chips com 11 px, rótulos com 12 px | Menor | `olorin.css:2075` (erro), `:2135` (chip), `:2015` (rótulo), `:1023` (rótulo da janela do hero) | Erros e rótulos em Cascadia Code ≥ 14 px; Silkscreen só em detalhes decorativos |
| N19 | Erros de campo não ficam numa região `aria-live`; ao trocar de etapa, o foco vai para o primeiro campo, não para o título da etapa | Menor | `olorin.js:477-489`, `:455-456` | Seção 10.3 do PROMPT |

### 3.4 Navegação e chamadas para ação

| ID | Achado | Gravidade | Evidência | Correção no v3 |
|---|---|---|---|---|
| N20 | O botão "Falar no WhatsApp" do topo some em telas ≤ 1280 px (a maioria dos notebooks) e todos os CTAs do topo somem ≤ 1100 px; o botão flutuante aparece a partir de 768 px (o v3 pede só ≥ 1024 px) | Importante | `olorin.css:3012-3016`, `:3018-3022`, `:3099-3101` | Cabeçalho do v3 com os dois botões até a quebra para o hambúrguer; flutuante só ≥ 1024 px; barra do celular some com formulário visível |
| N21 | Menu sem "Planos", embora a seção `#planos` exista; serviços do rodapé são texto sem link | Menor | `index.html:44-49` × `:766`; `index.html:1194-1199` | Menu da seção 7 do PROMPT; rodapé com links para as 6 páginas de serviço |

### 3.5 SEO

| ID | Achado | Gravidade | Evidência | Correção no v3 |
|---|---|---|---|---|
| N22 | Detalhes de SEO técnico: sitemap sem `lastmod`; sem `og:image:alt`; `areaServed` só "BR" no JSON-LD; a 404 não tem `noindex` (acessada direto em `/404.html` provavelmente responde 200; não verifiquei) | Menor | `sitemap.xml:3-4`; `index.html:23-26`; `index.html:27` (`"areaServed":"BR"`); `404.html:7` | Seções 15.1, 15.2 e 15.4 do PROMPT; `noindex` na 404 |

Pontos de SEO que estão certos e devem ser mantidos: título da home com 49 caracteres e description com 131 (`index.html:6, 16`); um H1 por página; JSON-LD do FAQ idêntico ao texto visível (conferido por script: 7 de 7 perguntas e respostas); `lang="pt-BR"`; `canonical` da home correto (`index.html:33`); nenhum ID duplicado nas 3 páginas; os 6 IDs de CTA exigidos pelo PROMPT existem (`index.html:53, 55, 1176, 1219, 1225, 1227`).

### 3.6 Desempenho

| ID | Achado | Gravidade | Evidência | Correção no v3 |
|---|---|---|---|---|
| N23 | Reflow forçado: `olorin.js:70` é a primeira leitura de layout (`window.scrollY`) no boot, logo após o `DOMContentLoaded`; depois, `initMarquees` alterna escrita (`appendChild`) e leitura (`scrollWidth`/`offsetWidth`) em laço; `initFloats` troca classe e logo lê `getBoundingClientRect`/`elementFromPoint` a cada quadro de rolagem; o cursor chama `getComputedStyle` subindo a árvore a cada `mouseover`. Não confirmei com o Lighthouse qual deles é o atribuído | Importante | `olorin.js:70`, `:210-227`, `:640-642`, `:673-683` | Leituras e escritas separadas com `requestAnimationFrame`; letreiro duplicado no build (sem medir no JS); IntersectionObserver no lugar de cálculo por rolagem |
| N24 | Os 15 módulos do JS rodam juntos no `DOMContentLoaded`, sem `requestIdleCallback`; JS e CSS sem minificação e sem hash no nome | Importante | `olorin.js:764-771`; tamanhos na seção 1 | esbuild + minificação + hash; inicializações não críticas em `requestIdleCallback` |
| N25 | 94 KiB de fontes em 5 arquivos, sem subset; a Cascadia Code 700 (29,5 KiB) aparece em 5 regras, das quais só 2 têm elemento visível no carregamento da home (perguntas do FAQ e link da política no consentimento); as outras são o link de erro do formulário, a citação da prosa e um aviso de administração que não existe no site estático | Importante | `assets/fonts/`; `olorin.css:1847, 2205` (usadas); `:2283, 2724, 1459` | Subset latim + pt-BR; reavaliar 700 e 800; métricas de fallback para manter CLS 0 |
| N26 | Logo SVG repetido inline 4 vezes no `index.html` (≈ 2,4 KiB cada) | Menor | `index.html:41, 68, 1169, 1205` | Um `<symbol>` reutilizado com `<use>` |
| N27 | Imagens só em WebP, sem AVIF e sem `srcset` (também no portfólio, 228,6 KiB); fundo da 404 com 73,7 KiB | Menor | `index.html:433-566`; `404.html:85` | Pipeline de imagens da seção 12.1 (AVIF + WebP, larguras responsivas) |
| N28 | Cache: CSS e JS com validade de 1 mês e sem `immutable`; não há regra para AVIF; nenhuma diretiva de Brotli (não sei se o Apache da Locaweb tem o módulo) | Menor | `.htaccess:27-38` | Nomes com hash + `max-age=31536000, immutable`; HTML com cache curto (seção 14) |

### 3.7 Marcação herdada do WordPress

| ID | Achado | Gravidade | Evidência | Correção no v3 |
|---|---|---|---|---|
| N29 | O `index.html` carrega 50 classes diferentes do WordPress, em 458 ocorrências (`wp-block-*`, `is-layout-*`, `has-*`, `menu-item-*`, `page-id-4`, `wp-embed-responsive`, `page-template-template-secoes-php`), além de `data-wp-strategy="defer"` e `id="olorin-js-before"`; muitas linhas em branco deixadas pelo editor de blocos | Importante | `index.html:35`, `:44-49`, `:90-1163`, `:1256-1259` | HTML semântico próprio, com classes dos componentes do v3 (seção 3.2 do PROMPT) |

### 3.8 Formulário, back-end e atribuição

| ID | Achado | Gravidade | Evidência | Correção no v3 |
|---|---|---|---|---|
| N30 | O `enviar.php` não confere `Origin`/`Referer` (aceita POST de qualquer site); o limite por IP é contado **antes** da validação, então seis envios com erro de digitação bloqueiam uma pessoa real por 10 minutos; campos de uma linha aceitam quebra de linha (o filtro remove caracteres de controle, mas não `\n` e `\r`), o que permite forjar linhas no corpo do e-mail | Importante | `enviar.php:61-69` (limite) × `:96-109` (validação); `enviar.php:46` (filtro); ausência de checagem de origem em todo o arquivo | Seção 10.4 do PROMPT: checagem de `Origin`/`Referer`, limite contando só envios válidos ou com peso menor para erros, quebras de linha removidas dos campos de uma linha |
| N31 | Atribuição incompleta: guarda só o último toque (UTMs novas apagam as antigas), não captura `gbraid`/`wbraid` e não envia `modo_pagina`, `servico_pagina` nem `variante_formulario` | Importante | `olorin.js:44`, `:56-58`; `enviar.php:72-91` | Primeiro e último toque em `sessionStorage`; campos da seção 10.2 |
| N32 | `generate_lead` dispara sempre que alguém abre uma URL com `?orcamento=ok`, inclusive por link compartilhado ou recarga | Menor | `olorin.js:418-423` | `generate_lead` só na `/obrigado/`, uma vez por envio, com token em `sessionStorage` (seção 10.4) |

### 3.9 Rastreamento e LGPD

| ID | Achado | Gravidade | Evidência | Correção no v3 |
|---|---|---|---|---|
| N33 | **Nenhuma ferramenta de medição está instalada**: não há GTM, GA4 nem pixel no HTML (0 ocorrências de `googletagmanager`, `gtag(` ou `fbq(` no `index.html`); `pixelId` vazio e `hasConsent:false`. Os eventos do `dataLayer` (com nomes `olorin_*`, fora do padrão da seção 13.4) não vão para lugar nenhum. A política fala de um aviso de cookies com botão "Aceitar" que não existe no site | Crítico | `index.html:1257`; `olorin.js:731`; `olorin.js:387, 460, 465, 610, 620, 623`; `politica-de-privacidade/index.html:120` | Banner próprio de consentimento + Consent Mode v2 + GTM só após consentimento; `track()` com os eventos da seção 13.4; política atualizada (seção 13.3) |

### 3.10 Servidor e segurança

| ID | Achado | Gravidade | Evidência | Correção no v3 |
|---|---|---|---|---|
| N34 | O `.htaccess` não bloqueia `.log`, `.md`, `.bak`, `.env`, `license.txt` nem cópias de backup do `config.php`; não tem HSTS nem `Content-Security-Policy-Report-Only`; a proteção dos leads depende de o arquivo oculto `leads/.htaccess` ter sido enviado (não verificado) | Importante | `.htaccess:10`; `.htaccess:40-45`; `leads/.htaccess` | Bloco da seção 18 do PROMPT; `docs/DEPLOY.md` com teste de `curl -I` para `config.php`, `leads/` e arquivos bloqueados |

### 3.11 Imagens e conteúdo de prova

| ID | Achado | Gravidade | Evidência | Correção no v3 |
|---|---|---|---|---|
| N35 | Origem das imagens não verificável: o hero ("Pessoas atravessando a faixa de pedestres…") e os bastidores ("Mãos digitando em um notebook, nos bastidores da Olorin") podem ser banco de imagens, o que o PROMPT proíbe; o portfólio usa 8 imagens de exemplo | Importante | `index.html:121`, `:704`, `:433-566` | Fotos reais da equipe (`_inbox/equipe-1.png`, `_inbox/equipe-2.webp`, `_inbox/equipe-3.webp`) nos cartões "Quem toca"; portfólio de exemplo mantido por decisão do dono (seção 4) até a troca; registrar a origem de cada imagem em `src/assets/manifest.json` |

---

## 4. Decisões do dono (08/10/2026) que mudam as correções

Registradas a partir da mensagem do dono nesta sessão; prevalecem sobre os padrões do PROMPT quando houver conflito.

1. **Números da seção Resultados:** substituir os atuais (`index.html:592, 602, 612, 622`: "R$12M+", "87+", "4,42x", "320+") por **R$ 2M+** verba gerida em anúncio, **50+** marcas atendidas, **2x** retorno médio sobre o investimento e **100+** peças entregues por mês. Período e critério não foram informados: registrar no `docs/CONTENT-TODO.md`. Grafia sugerida com espaço depois do "R$", no padrão do site.
2. **Os 3 cases e o portfólio** ficam visíveis com o conteúdo de exemplo atual, **sem bloqueio por flag**; o dono vai editar os textos direto no HTML depois. As imagens do portfólio ficam para outra etapa.
3. **Só HTML estático**, sem WordPress, publicado por FTP na Locaweb (`public_html`), como a versão atual. O dono disse que vai alterar textos direto no `index.html`: o HTML publicado deve continuar fácil de ler e editar à mão.
4. **Fotos da equipe:** `_inbox/equipe-1.png`, `_inbox/equipe-2.webp`, `_inbox/equipe-3.webp`. **Manual de marca:** `_brand/ID_OLORIN.pdf`.
5. **Consequência para o achado 16:** com "50+ marcas atendidas", a frase "Poucas marcas por vez" ainda pode ficar, desde que deixe claro que fala de quantas contas o time toca **ao mesmo tempo**, e não do total histórico.

---

## 5. Como reproduzir

```bash
cd site-atual
# domínio errado (o padrão não escreve o domínio por extenso)
grep -rn 'digital\.com\.br' .
# WhatsApp de exemplo
grep -rnc '5541900000000' . | grep -v ':0$'
# contrato do tempo de preenchimento
grep -rn 'olorin_ts\|olorin_tempo' index.html assets/js/olorin.js enviar.php
python3 -c "import datetime as d;print(d.datetime.fromtimestamp(1791474859,d.timezone(d.timedelta(hours=-3))))"
# whitelist de serviços × chips do formulário
sed -n 24,31p config.php; grep -n 'name="servicos\[\]"' index.html
# primeira pessoa e erros de texto
grep -noiE 'recomendo|esteve a frente|me conta|vou montar|mesma cabeça' index.html 404.html
# tamanhos
for f in index.html assets/css/olorin.css assets/js/olorin.js; do echo "$f $(wc -c <$f) $(gzip -9 -c $f | wc -c)"; done
# origem do carimbo fixo (tema WordPress)
grep -n 'olorin_ts' ../legado/tema-wordpress/olorin/blocks/formulario/render.php
# diferenças entre a exportação v1 e o que está no servidor
diff -rq ../legado/site-estatico-v1 .
```

Validação de HTML: `npx html-validate` (versão 11.16.2), instalado numa pasta temporária fora do projeto, com as regras de estilo de aspas e de barra em elementos vazios desligadas. Erros restantes: 16 no `index.html`, 1 na `404.html` e 4 na política, todos do tipo `element-permitted-content` (N13).
