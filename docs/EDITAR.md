# Como editar o site da Olorin

Guia para quem não programa (atualizado em 23/10/2026). Existem **três jeitos** de mudar o site:

| | Pedir ao Claude | Jeito rápido (direto no servidor) | Jeito certo (no projeto + build) |
|---|---|---|---|
| Quando usar | Quase sempre | Trocar uma palavra, um logo ou um ID com pressa | Qualquer mudança que deva durar, feita por você |
| Como | Escreva no chat do projeto o que quer mudar. O Claude atualiza o projeto e entrega um zip novo | Edite o arquivo no servidor pelo WebFTP da Locaweb | Edite os arquivos `.yml` em `src/content/` e rode o build |
| Precisa instalar algo? | Não | Não | Node.js 20 ou mais novo |
| Risco | Nenhum | No próximo zip, a mudança feita à mão no HTML **some** (o build reescreve as páginas) | Nenhum: tudo vem de um lugar só |

> **Regra de ouro:** se mudou algo pelo jeito rápido, conte no chat do projeto ou repita a mudança no `.yml`. Assim ela não se perde no próximo zip. A exceção é o `olorin-ids.js`, que foi feito para ser editado no servidor (veja a seção 6).

---

## 1. Jeito rápido: editar pelo WebFTP

1. Entre no WebFTP da Locaweb e abra a pasta `public_html`.
2. Baixe o arquivo da página:
   - Home: `index.html`
   - Uma página de serviço: `servicos/trafego-pago/index.html` (troque pelo serviço)
   - Quem somos: `quem-somos/index.html`
3. Abra no Bloco de Notas (ou no VS Code, gratuito).
4. Use **Localizar** (Ctrl+F) para achar o texto. Troque **só o texto entre as marcações**. Não apague `<`, `>`, aspas nem nada que comece com `class=`.
5. Salve em **UTF-8** e envie o arquivo de volta para o mesmo lugar, substituindo.
6. Abra o site com Ctrl+F5 e confira.

**Cuidados do jeito rápido:**

- Alguns textos aparecem **mais de uma vez** no mesmo arquivo. As perguntas das dúvidas, por exemplo, aparecem no texto da página e de novo num bloco `<script type="application/ld+json">` (é o que o Google lê). Troque nos dois.
- O site não mostra preço (dono, 23/10/2026): a calculadora monta um bilhete de orçamento sem valor, que a pessoa manda pelo WhatsApp, e a proposta sai depois do Raio-X.
- Não mexa em `enviar.php`, `.htaccess` nem `config.php`.
- Logos, fotos e imagens de compartilhamento podem ser trocados subindo um arquivo com o mesmo nome. A lista está em `docs/PENDENCIAS.md`, seção 6.

---

## 2. Jeito certo: preparar o computador (uma vez só)

1. Instale o **Node.js** (versão LTS) em <https://nodejs.org>.
2. Baixe o projeto (no GitHub, botão **Code → Download ZIP**, ou `git clone`).
3. Abra o terminal **dentro da pasta do projeto** e rode `npm install`.

### Comandos do dia a dia

| Comando | O que faz |
|---|---|
| `npm run dev` | Abre o site no seu computador em <http://localhost:8081>, atualizando sozinho a cada mudança |
| `npm run build` | Gera o site pronto na pasta `dist/` e confere tudo (títulos, preços, imagens sem descrição, tamanho dos arquivos). Se der erro, diz o arquivo e o motivo |
| `npm test` | Testa as páginas, a acessibilidade e o formulário de ponta a ponta |
| `npm run og` | Refaz as imagens de compartilhamento (a prévia do link no WhatsApp) depois de mudar títulos |
| `npm run pendencias` | Lista o que ainda está marcado como pendente, com arquivo e linha |

Depois do `npm run build`, o site inteiro está em `dist/`. Para publicar, compacte o **conteúdo** de `dist/` num zip e siga o `COMO-PUBLICAR-final.txt`.

---

## 3. Onde está cada texto

Todos os textos ficam em `src/content/`. Abra no VS Code (ele colore e avisa erros).

| O que você quer mudar | Arquivo | Campo |
|---|---|---|
| Ordem dos blocos da home | `src/content/home.yml` | `secoes:` |
| Banner principal da home | `src/content/home.yml` | `hero:`: `linha_superior` (etiqueta), `titulo` e `titulo_destaque` (o lema, "Sua marca em" + "outro nível."), `selo` (Level up), `jogo_aviso` (+1 nível do minijogo), `botao_start`, `apoio`, `checks_rotulo` e `checks` (os 3 itens com check). A prova do banner saiu |
| Resultados da home (números, logos e portfólio) | `src/content/home.yml` | `resultados:`; `credencial` é a frase embaixo das logos da Meta e do Google ("Agência parceira Meta e Google") |
| Números (R$ 5M+, +50, +2x) | `src/content/claims.json` | `itens`; `nota` é a letra pequena embaixo dos números ("*Resultados variam de cliente a cliente.") |
| Logos da faixa "Marcas que o nosso time já atendeu" | `src/content/clientes.yml` | `etiqueta:` e `itens:` |
| Os 3 itens com check (serviços, Sobre, Quem somos, Portfólio, campanhas) | `src/content/selos.yml` | `itens:` |
| Calculadora da home (bilhete de orçamento, sem valores) | `src/content/calculadora.yml` | `perguntas:` (cada uma com `rotulo`, `curto` e `mensagem`), `bilhete:`, `botao:` e as mensagens do WhatsApp |
| Portfólio (home, serviços, perfis e /portfolio/) | `src/content/portfolio.yml` | `itens:` |
| Time (nome, cargo, frase, biografia) | `src/content/equipe.yml` | `pessoas:` |
| Dúvidas (página Sobre) | `src/content/faq.yml` | `perguntas:` |
| Formulário (rótulos, opções e erros) | `src/content/formulario.yml` | |
| Cada página de serviço (tudo dela) | `src/content/servicos/<serviço>.yml` | em Redes sociais, `montagem:` tem os textos do celular do banner (`janela`, `rotulo`, `aviso`) |
| Página de serviços | `src/content/paginas/servicos.yml` | |
| Quem somos | `src/content/paginas/sobre.yml` | `titulo` + `titulo_destaque` (o "outro nível." em destaque) |
| Sobre (como trabalhamos) e Portfólio | `src/content/paginas/sobre-metodo.yml` e `portfolio.yml` | |
| Olorin Educação | `src/content/paginas/educacao.yml` e `src/content/cases.yml` | |
| Influenciadores | `src/content/paginas/influenciadores.yml` | |
| Campanhas (`/promo/`) | `src/content/paginas/promo.yml` | |
| Obrigado, 404, Privacidade | `src/content/paginas/obrigado.yml`, `erro404.yml`, `privacidade.yml` | |
| Menu | `src/_data/navegacao.yml` | Serviços, Portfólio, Sobre, Quem somos e Segmentos; o submenu de Segmentos é a lista `itens:` (rótulo, endereço, resumo e ícone de Educação e Influenciadores). O rodapé usa a mesma lista |
| WhatsApp, e-mail e redes sociais | `src/_data/site/config.json` | veja a seção 7 |

**Como o arquivo `.yml` funciona:** cada linha é `nome: valor`. A indentação (os espaços no começo) importa: use sempre 2 espaços, nunca Tab. Se o texto tiver `: ` (dois-pontos seguido de espaço) ou começar com `@`, `*`, `[` ou `"`, coloque entre aspas:

```yaml
antes (quebra):  - Cada peça parece de uma empresa diferente: o anúncio e o site.
depois (certo):  - "Cada peça parece de uma empresa diferente: o anúncio e o site."
```

Se errar, o `npm run build` avisa a linha exata.

**Padrões de texto do site:** sem travessão (use vírgula, ponto ou dois-pontos); serviços listados sempre como "Anúncios, redes, marca, site, impressos e dados"; nada de prometer resultado; sem preço, plano, mensalidade ou "a partir de"; o lema é "Sua marca em outro nível.", com "outro nível." sempre em destaque.

---

## 4. Tarefas comuns

### Reordenar ou esconder blocos da home

Em `src/content/home.yml`, a lista `secoes:` define a ordem. Mude a ordem das linhas; para esconder, ponha `#` no começo da linha.

### Preço e orçamento

O site não mostra valor em lugar nenhum (dono, 23/10/2026). A calculadora da home (`src/content/calculadora.yml`) só monta o bilhete com o que a pessoa quer (frente, verba de anúncio e objetivo) e o botão manda esse bilhete pelo WhatsApp, com `[ref: calculadora]` no fim. A pergunta "Quanto custa?" das dúvidas (`faq-preco` em `src/content/faq.yml`) responde que o orçamento sai sob medida, depois do Raio-X.

### Adicionar uma pergunta nas dúvidas

Em `src/content/faq.yml`, copie um bloco e mude. O `id` precisa ser único, sem acento e sem espaço:

```yaml
  - id: faq-reuniao-video
    pergunta: As reuniões são por vídeo?
    resposta: Sim, por vídeo, no dia e no horário combinados com você.
```

A mesma pergunta vai sozinha para os dados que o Google lê. Para perguntas de um serviço, use o `faq:` do arquivo do serviço.

### Incluir ou trocar um trabalho do portfólio

O passo a passo está no começo de `src/content/portfolio.yml`:

1. Salve a imagem em `src/assets/img-src/portfolio/<nome>.webp`, já recortada em 4:5 (1080 × 1350 px é o ideal).
2. Crie ou ajuste a entrada `portfolio-<nome>` em `src/assets/manifest.json` (copie uma existente e escreva o `alt`, a descrição do que aparece na imagem).
3. Acrescente ou ajuste a linha em `itens:` de `src/content/portfolio.yml` (`titulo`, `rotulo` só com o tipo de serviço e `servicos`).
4. `npm run build`. As versões AVIF e WebP em 4 tamanhos são geradas sozinhas.

### Trocar um logo de cliente

Pelo WebFTP, sem build: suba o SVG novo para `public_html/assets/img/clientes/` com o **mesmo nome** (por exemplo `central-sul-moveis.svg`), em preto, fundo transparente e sem margem. Com nome ou extensão diferentes, ajuste `src/content/clientes.yml` e rode o build.

### Trocar a foto de alguém do time

1. Salve a foto em `src/assets/img-src/equipe/` (por exemplo `natalia-arruda.jpg`).
2. Em `src/assets/manifest.json`, nos itens `equipe-natalia` e `equipe-natalia-quadrada`, troque `"arquivo_original"`. O `"recorte"` é `[esquerda, topo, largura, altura]` em pixels da foto original; para usar a foto inteira, apague a linha do recorte.
3. `npm run build`.

### Mudar os números da seção Resultados

`src/content/claims.json`: `valor` (o número grande) e `rotulo`. Só aparecem itens com `"verificado": true`. A base de cada número fica em `fonte`, `periodo` e `criterio`; a `nota` aparece em letra pequena embaixo dos números (hoje: "*Resultados variam de cliente a cliente.", do +2x de retorno).

### Imagens de compartilhamento (a prévia do link)

`npm run og` refaz as imagens de `src/assets/og/`: a da home lê `hero.titulo` e `hero.titulo_destaque` do `home.yml`; a de Quem somos lê `paginas/sobre.yml`; as de serviço leem o `h1` de cada serviço. As da Educação ("Sua escola em outro nível.") e de Influenciadores ("Seu perfil em outro nível.", `og/influenciadores.jpg`) estão escritas em `scripts/gerar-og.mjs`.

### Cases da Olorin Educação

`src/content/cases.yml` guarda iZETA e Anacleto Abduch como clientes atendidos, sem resultado e sem detalhe, como você pediu. Quando houver um case com resultado medido e autorizado, siga o comentário do topo do arquivo.

### Texto que ainda falta confirmar

O que é proposta fica marcado com um comentário `# PENDENTE:` na linha de cima, no `.yml`. O texto proposto aparece no site normalmente. `npm run pendencias` lista todos. O build **para com erro** se encontrar um `[CONFIRMAR]` no texto, porque o visitante veria o colchete.

---

## 5. Fontes pagas (Integral CF e Retro Computer)

O site usa substitutas gratuitas parecidas (Archivo Expanded e Silkscreen). Quando tiver as licenças **para uso na web**:

1. Salve os arquivos `.woff2` que vêm com a licença Web exatamente com estes nomes em `src/assets/fonts/licenciadas/`:
   - `integral-cf-bold.woff2`
   - `retro-computer.woff2`
2. `npm run build`. O site passa a usar as fontes da marca sozinho, já com o ajuste de altura para nada pular de lugar.
3. Peça ao Claude uma conferência visual: a Integral deixa os títulos mais estreitos e a Retro deixa as etiquetas mais largas, então algumas quebras de linha mudam.

Esses arquivos **não vão para o GitHub** (a licença não permite redistribuir). Guarde uma cópia com você. Detalhes de cada licença em `FONTES-E-LICENCAS.txt`.

---

## 6. IDs de medição e link de agenda (`olorin-ids.js`)

Os IDs do Google Tag Manager, do Google Analytics, do Pixel da Meta, da conversão do Google Ads e o link de agenda ficam em `public_html/olorin-ids.js`. Ele é editado **pelo WebFTP, com o site no ar, sem build**. O passo a passo está no `COMO-PUBLICAR-final.txt` e em `docs/TRACKING.md`, seção 2.

Ao subir um zip novo, o `olorin-ids.js` do zip vem vazio: baixe o seu antes e envie de volta depois (ou peça ao Claude para gravar os IDs no projeto, em `src/_data/site/config.json`).

---

## 7. Configurações gerais (`src/_data/site/config.json`)

| Campo | Para que serve |
|---|---|
| `LEMA` | O lema ("Sua marca em outro nível."), usado no rodapé |
| `CNPJ` | CNPJ do rodapé |
| `WHATSAPP` | Número de todos os botões de WhatsApp (só números, com 55 e DDD) |
| `TELEFONE_EXIBICAO`, `EMAIL` | Contatos que aparecem no site |
| `INSTAGRAM_URL`, `FACEBOOK_URL`, `X_URL`, `LINKEDIN_URL` | Redes sociais do rodapé |
| `GTM_ID`, `GA4_ID`, `META_PIXEL_ID`, `GADS_CONVERSION_ID`, `GADS_CONVERSION_LABEL`, `SCHEDULING_URL` | Valores iniciais do `olorin-ids.js` (veja a seção 6) |
| `GBP_URL` | Link do Perfil da Empresa no Google |
| `SHOW_STATS` | `true` mostra os números da seção Resultados |
| `OFERTA_DIAGNOSTICO` | `true` usa o Raio-X gratuito como oferta principal; `false` troca por "pedir orçamento" |
| `FORM_TOP_VARIANT` | `b` (padrão): formulário curto embaixo do banner e completo no fim. `a`: só no fim |
| `CURSOR_ESTRELA` | `true` liga a estrelinha que segue o mouse no computador |
| `ATUALIZADO_EM` | Data da última atualização (vai para o sitemap) |
