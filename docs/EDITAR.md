# Como editar o site da Olorin

Guia para quem não programa. Existem **dois jeitos** de mudar o site:

| | Jeito rápido (direto no servidor) | Jeito certo (no projeto + build) |
|---|---|---|
| Quando usar | Trocar uma palavra ou um número com pressa | Qualquer mudança que deva durar |
| Onde edita | O arquivo `.html` no servidor, pelo FileZilla ou Gerenciador de Arquivos da Locaweb | Arquivos `.yml` em `src/content/` no computador |
| Precisa instalar algo? | Não | Node.js 20 ou mais novo |
| Risco | Na próxima publicação pelo jeito certo, a mudança feita à mão **some** (o build reescreve o HTML) | Nenhum: tudo vem de um lugar só |

> **Regra de ouro:** se você mudou algo pelo jeito rápido, anote e repita a mudança no `.yml` depois. Assim ela não se perde.

---

## 1. Jeito rápido: editar o HTML pelo FTP

1. Abra o FileZilla (ou o Gerenciador de Arquivos no painel da Locaweb) e entre na pasta `public_html`.
2. Baixe o arquivo da página:
   - Home: `index.html`
   - Uma página de serviço: `servicos/trafego-pago/index.html` (troque pelo serviço)
   - Sobre: `sobre/index.html`
   - Campanhas: `promo/index.html` e `promo/<serviço>/index.html`
3. Abra no Bloco de Notas (Windows) ou TextEdit em modo texto puro (Mac). Um editor melhor e gratuito: **VS Code**.
4. Use **Localizar** (Ctrl+F / Cmd+F) para achar o texto. Troque **só o texto entre as marcações** — não apague `<`, `>`, aspas nem nada que comece com `class=`.
5. Salve com codificação **UTF-8** e envie o arquivo de volta para o mesmo lugar, substituindo.
6. Abra o site com Ctrl+F5 (atualizar sem cache) e confira.

**Exemplo (portfólio da home):**

```html
antes:  <figcaption class="o-trabalho__legenda"><strong>Ateliê de moda</strong><span>Marca · Identidade visual</span></figcaption>
depois: <figcaption class="o-trabalho__legenda"><strong>Ateliê Flor de Lis</strong><span>Marca · Identidade visual</span></figcaption>
```

**Cuidados do jeito rápido:**

- Alguns textos aparecem **em mais de um lugar** no mesmo arquivo. As perguntas do FAQ, por exemplo, aparecem no texto da página e de novo dentro de um bloco `<script type="application/ld+json">` (é o que o Google lê). Troque nos dois.
- Preços aparecem nos planos, na calculadora, nas páginas de serviço, nas perguntas e no `llms.txt`. Para mudar preço, use o jeito certo (seção 4).
- Não mexa em `enviar.php`, `.htaccess` nem `config.php` pelo jeito rápido.

---

## 2. Jeito certo: preparar o computador (uma vez só)

1. Instale o **Node.js** (versão LTS) em <https://nodejs.org>.
2. Baixe o projeto (pasta do repositório no GitHub → botão **Code → Download ZIP**, ou `git clone`).
3. Abra o terminal **dentro da pasta do projeto** e rode:

```bash
npm install
```

### Comandos do dia a dia

| Comando | O que faz |
|---|---|
| `npm run dev` | Abre o site no seu computador em <http://localhost:8081>, atualizando sozinho a cada mudança. Mostra os marcadores `[CONFIRMAR]` em amarelo e o guia de estilo em <http://localhost:8081/_estilo/> |
| `npm run build` | Gera o site pronto na pasta `dist/` e confere tudo (texto sem confirmação, domínio, títulos, imagens sem descrição). Se der erro, ele diz o arquivo e o motivo |
| `npm test` | Testa todas as páginas, a acessibilidade e o formulário de ponta a ponta |
| `npm run og` | Refaz as imagens de compartilhamento (prévia do link no WhatsApp) depois de mudar títulos |
| `npm run deploy:dry` | Mostra o que seria enviado ao servidor, sem enviar |
| `npm run deploy` | Build + testes + backup do servidor + envio por FTP (ver `docs/DEPLOY.md`) |

Depois do `npm run build`, o site inteiro está em `dist/`. Você pode subir essa pasta pelo FileZilla em vez de usar o `npm run deploy`.

---

## 3. Onde está cada texto

Todos os textos ficam em `src/content/`. Abra no VS Code (ele colore e avisa erros).

| O que você quer mudar | Arquivo | Campo |
|---|---|---|
| Banner principal da home (título, parágrafo, botões) | `src/content/home.yml` | `hero:` |
| Formulário do topo da home | `src/content/home.yml` | `formulario_topo:` |
| Checklist "Se você se reconhece aqui" | `src/content/home.yml` | `checklist:` → `itens:` |
| Método (4 etapas) | `src/content/home.yml` | `metodo:` |
| Faixas animadas | `src/content/home.yml` | `faixa_servicos:` e `faixa_palavras:` |
| Números (R$2M+, 50+, 2x, 100+) | `src/content/claims.json` | `itens` |
| Os 3 cases da home | `src/content/cases.yml` | `itens:` |
| Portfólio | `src/content/portfolio.yml` | `itens:` |
| Equipe (nome, função, frase, biografia) | `src/content/equipe.yml` | `pessoas:` |
| Exemplo de relatório | `src/content/home.yml` | `relatorio:` |
| Planos, preços e calculadora | `src/content/planos.yml` | `planos:` e `calculadora:` |
| Perguntas da home | `src/content/faq.yml` | `perguntas:` |
| Chamada final + formulário | `src/content/home.yml` | `orcamento:` |
| Rótulos, opções e erros do formulário | `src/content/formulario.yml` | — |
| Cada página de serviço (tudo dela) | `src/content/servicos/<serviço>.yml` | — |
| Página de serviços (hub) | `src/content/paginas/servicos.yml` | — |
| Sobre | `src/content/paginas/sobre.yml` | — |
| Campanhas (`/promo/`) | `src/content/paginas/promo.yml` | — |
| Obrigado, 404, Privacidade | `src/content/paginas/obrigado.yml`, `erro404.yml`, `privacidade.yml` | — |
| Menu | `src/_data/navegacao.yml` | — |
| WhatsApp, e-mail, Instagram, IDs do Google e da Meta | `src/_data/site/config.json` | ver seção 9 |

**Como o arquivo `.yml` funciona:** cada linha é `nome: valor`. A indentação (os espaços no começo) importa — use sempre 2 espaços, nunca Tab. Se o texto tiver `: ` (dois-pontos seguido de espaço) ou começar com `@`, `*`, `[` ou `"`, coloque entre aspas:

```yaml
antes (quebra):  - Cada peça parece de uma empresa diferente: o anúncio e o site.
depois (certo):  - "Cada peça parece de uma empresa diferente: o anúncio e o site."
```

Se errar, o `npm run build` avisa a linha exata.

---

## 4. Tarefas comuns

### Reordenar ou esconder blocos da home

Em `src/content/home.yml`, a lista `secoes:` define a ordem. Mude a ordem das linhas; para esconder, ponha `#` no começo da linha.

```yaml
antes:                      depois (portfólio antes dos números, sem a faixa violeta):
secoes:                     secoes:
  - hero                      - hero
  - formulario-topo           - formulario-topo
  - faixa-servicos            - faixa-servicos
  - checklist                 - checklist
  - metodo                    - metodo
  - servicos                  - servicos
  - resultados                - portfolio
  - portfolio                 - resultados
  ...                         ...
  - faixa-palavras            # - faixa-palavras
```

Regra da marca: **violeta nunca encosta no verde-limão**. Blocos verdes: `faixa-servicos`, `resultados`. Blocos violeta: `metodo`, `faixa-palavras`, `orcamento` e o cartão do `formulario-topo`. Não ponha um verde colado num violeta.

### Trocar um preço

1. `src/content/planos.yml` → `valor:` do plano (só o número, sem R$ e sem ponto: `2500`).
2. Confira os textos que citam o valor: `custo_total:` do plano, `nota:` e `calculadora:` no mesmo arquivo; `preco:` e `faq:` das páginas de serviço em `src/content/servicos/`; perguntas em `src/content/faq.yml`. Dica: no VS Code, **Editar → Localizar nos arquivos** por `2.500` acha todos.
3. `npm run build`.

### Adicionar uma pergunta no FAQ da home

Em `src/content/faq.yml`, copie um bloco e mude. O `id` precisa ser único, sem acento e sem espaço:

```yaml
  - id: faq-reuniao-presencial
    pergunta: Dá pra fazer reunião presencial?
    resposta: Sim, em Curitiba. Fora daqui, as reuniões são por vídeo.
```

A mesma pergunta vai sozinha para os dados que o Google lê. Para perguntas de um serviço, use o `faq:` do arquivo do serviço.

### Editar os cases da home

Em `src/content/cases.yml`, cada case tem `segmento`, `servicos_texto`, `resultado` (o número grande) e `detalhe` (a linha embaixo). Hoje os 3 são **exemplos** (você pediu para manter). Quando tiver um case real e autorizado pelo cliente, marque `aprovado: true` e preencha o que está pedido no comentário do arquivo; aí ele também aparece nas páginas dos serviços ligados a ele. Para tirar um case da home: `exibir: false`.

### Trocar uma imagem do portfólio

1. Coloque a imagem (JPG, PNG ou WebP, de preferência com 1200 px ou mais de largura) em `src/assets/img-src/portfolio/`.
2. Em `src/assets/manifest.json`, no item da imagem (ex.: `"portfolio-marca-identidade"`), troque `"arquivo_original"` pelo novo arquivo e escreva o `"alt"` (descrição do que aparece na imagem, para quem não enxerga).
3. Em `src/content/portfolio.yml`, ajuste `titulo`, `rotulo` e `categorias` do item.
4. `npm run build` (as versões AVIF/WebP em vários tamanhos são geradas sozinhas).

### Trocar a foto de alguém da equipe

1. Salve a foto em `src/assets/img-src/equipe/` (ex.: `natalia-arruda.jpg`).
2. Em `src/assets/manifest.json`, nos itens `equipe-natalia` e `equipe-natalia-quadrada`, troque `"arquivo_original"`. O `"recorte"` é `[esquerda, topo, largura, altura]` em pixels da foto original; para usar a foto inteira, apague a linha do recorte.
3. `npm run build`.

### Mudar os números da seção Resultados

`src/content/claims.json`: `valor` (o número grande) e `rotulo`. Só aparecem itens com `"verificado": true`. Se quiser mostrar a base do número em letra pequena, preencha `periodo` e `criterio`.

### Texto que ainda falta confirmar

Onde faltava informação, o texto está como `[CONFIRMAR: o que falta]`. No `npm run dev` ele aparece em amarelo. No site publicado, **some sozinho** (o item inteiro sai da lista). Para publicar, troque o marcador pelo texto confirmado. A lista completa está em `docs/CONTENT-TODO.md`.

---

## 5. Fontes pagas (Integral CF e Retro Computer)

O site usa substitutas gratuitas parecidas (Archivo Expanded e Silkscreen). Quando você comprar as licenças **para uso na web** (webfont):

1. Converta ou baixe as fontes em `.woff2` e salve exatamente com estes nomes em `src/assets/fonts/licenciadas/`:
   - `integral-cf-bold.woff2`
   - `retro-computer.woff2`
2. `npm run build`. O site passa a usar as fontes da marca sozinho (já com o ajuste de altura para nada pular de lugar).

Esses arquivos **não vão para o GitHub** (a licença não permite redistribuir). Guarde uma cópia com você.

---

## 6. Depois de editar

1. `npm run build` (sem erro)
2. `npm test` (sem falha)
3. Publique: `npm run deploy` ou suba a pasta `dist/` pelo FileZilla — passo a passo em `docs/DEPLOY.md`.

---

## 7. Configurações gerais (`src/_data/site/config.json`)

| Campo | Para que serve |
|---|---|
| `WHATSAPP` | Número de todos os botões de WhatsApp (só números, com 55 e DDD) |
| `TELEFONE_EXIBICAO`, `EMAIL`, `INSTAGRAM_HANDLE`, `INSTAGRAM_URL` | Contatos que aparecem no site |
| `GTM_ID`, `GA4_ID`, `META_PIXEL_ID`, `GADS_CONVERSION_ID`, `GADS_CONVERSION_LABEL` | Rastreamento. Vazio = desligado e sem aviso de cookies. Ver `docs/TRACKING.md` |
| `SCHEDULING_URL` | Link de agenda (Calendly etc.) para a página de obrigado. Vazio = não aparece |
| `GBP_URL` | Link do Perfil da Empresa no Google |
| `SHOW_STATS` | `true` mostra os números da seção Resultados |
| `SHOW_TOTAL_COST` | `true` mostra "custo total de entrada" nos planos |
| `OFERTA_DIAGNOSTICO` | `true` usa "diagnóstico gratuito" como oferta principal; `false` troca por "pedir orçamento" |
| `FORM_TOP_VARIANT` | `b` (padrão): formulário curto embaixo do banner + completo no fim. `a`: só no fim. `ab`: sorteia metade/metade para teste |
| `CURSOR_ESTRELA` | `true` liga a estrelinha que segue o mouse no computador |
| `ATUALIZADO_EM` | Data da última atualização (vai para o sitemap) |
