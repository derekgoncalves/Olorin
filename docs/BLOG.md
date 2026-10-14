# Como publicar artigos no blog

Cada artigo do blog é **um arquivo de texto** (`.md`) na pasta `src/blog/artigos/`. O site monta o resto sozinho:

- a página do artigo em `olorin.com.br/blog/nome-do-arquivo/`;
- o card na página `/blog/`, dentro da categoria certa;
- o bloco da home, que mostra sempre os **3 artigos mais recentes**;
- o "Leia também", o tempo de leitura, a foto e a apresentação de quem escreveu, o convite para o Raio-X e o WhatsApp no fim;
- o sitemap, o feed e as informações para o Google.

Há dois jeitos de publicar.

---

## Jeito A: pedir para o Claude (o mais fácil)

No projeto **Olorin** do Claude, escreva algo como:

> Escreva e publique um artigo no blog sobre **como escolher o público de um anúncio**.
> Categoria: **Tráfego pago**. Autora: **Natália**. Data: **hoje**.
> Pontos que quero no texto: (cole aqui suas ideias, tópicos ou um rascunho).

Se tiver uma foto para a capa, anexe junto. Sem foto, o Claude gera uma capa com o título nas cores da marca.

O Claude escreve o arquivo, gera a capa, roda o build, confere tudo e te devolve o texto para aprovar e os arquivos para subir. **Leia o texto antes de publicar.**

---

## Jeito B: fazer você mesmo

### 1. Preparar o computador (uma vez só)

1. Instale o **Node.js** versão **LTS** em <https://nodejs.org> (no Windows, é só avançar no instalador).
2. Confira se tem o **Google Chrome** ou o **Microsoft Edge** (o Edge já vem no Windows). Ele é usado para desenhar as capas.
3. Baixe o projeto: no GitHub, abra `derekgoncalves/Olorin` → botão **Code** → **Download ZIP**, e descompacte.
4. Abra o terminal **dentro da pasta do projeto**: no Explorador de Arquivos, entre na pasta, clique na barra de endereço, digite `cmd` e aperte Enter.
5. Rode uma vez (leva alguns minutos):

```bash
npm ci
```

Para editar os artigos, o Bloco de Notas funciona. O **VS Code** (grátis) é mais confortável e mostra a prévia do Markdown.

> **Use sempre a versão mais nova do projeto.** Se a sua cópia estiver velha, ao publicar você pode trazer de volta textos antigos do site. Na dúvida, baixe o ZIP de novo antes de começar.

### 2. Criar o arquivo do artigo

1. Abra a pasta `src/blog/artigos/`.
2. Copie o arquivo `_modelo.md` e renomeie a cópia com o endereço que o artigo vai ter: letras minúsculas, sem acento, sem espaço, palavras separadas por hífen.
   - `como-escolher-o-publico.md` vira `olorin.com.br/blog/como-escolher-o-publico/`
3. **Windows:** ligue "Extensões de nomes de arquivos" (Explorador → **Exibir**) para o arquivo não virar `.md.txt` sem você perceber.

Arquivos que começam com `_` (como o modelo) não vão para o site.

### 3. Preencher os campos

O começo do arquivo, entre as duas linhas `---`, tem os dados do artigo. Exemplo preenchido:

```yaml
---
titulo: "Como escolher o público de um anúncio sem desperdiçar verba"
titulo_seo: "Como escolher o público de um anúncio"
descricao: "Interesses, região e momento de compra: um passo a passo para montar o público do anúncio e ajustar com o que os números mostrarem."
data: 2026-11-05
categoria: Tráfego pago
autor: natalia-arruda
imagem: publico-anuncio.jpg
imagem_alt: "Pessoa olhando o painel de anúncios no notebook"
---
```

| Campo | Precisa? | Como preencher |
|---|---|---|
| `titulo` | sim | Título que aparece no artigo e nos cards. Sempre entre aspas. |
| `titulo_seo` | só se o build pedir | Versão curta para o Google (até 60 caracteres). O build avisa quando o título é longo demais. |
| `descricao` | sim | Resumo de 1 ou 2 frases, **até 155 caracteres**, entre aspas. Aparece no card e no Google. |
| `data` | sim | Formato `AAAA-MM-DD`. O mais novo aparece primeiro. A data não agenda: o artigo entra no ar quando você publicar. |
| `categoria` | sim | Do jeito que deve aparecer: `Educação`, `Tráfego pago`, `Redes sociais` ou uma nova (passo 6). |
| `autor` | sim | `derek-goncalves`, `natalia-arruda` ou `vinicius-mafra`. A foto e a apresentação vêm da página da equipe. |
| `imagem` e `imagem_alt` | não | Foto de capa própria e a descrição dela (passo 5). |
| `atualizado` | não | Data de uma revisão do texto (`AAAA-MM-DD`). Aparece como "Atualizado em". |
| `rascunho` | não | `rascunho: true` esconde o artigo (passo 7). |

### 4. Escrever o texto (Markdown)

Depois da segunda linha `---` vem o texto. Deixe **uma linha em branco** entre os parágrafos.

| Você escreve | Aparece |
|---|---|
| `## Subtítulo` | subtítulo grande |
| `### Subtítulo menor` | subtítulo menor |
| `**palavra**` | **negrito** |
| `*palavra*` | *itálico* |
| `- item` (um por linha) | lista com marcadores |
| `1. passo` (um por linha) | lista numerada |
| `[texto do link](/servicos/trafego-pago/)` | link para outra página do site |
| `[texto do link](https://site.com)` | link para outro site (abre em outra aba sozinho) |
| `> frase` | frase em destaque |
| `![Descrição da foto](foto.jpg "Legenda")` | imagem no meio do texto, com legenda (a foto fica em `src/assets/img-src/blog/`) |

Não use uma cerquilha só (`# Título`): o título do artigo já vem do campo `titulo`. Tabelas também funcionam: veja o exemplo no `_modelo.md`.

As regras de sempre valem aqui: nada de números inventados nem promessa de resultado.

### 5. Imagem de capa

**Com foto própria:**

1. Use JPG (PNG ou WebP também servem), de preferência com **1600 x 900 pixels** (formato 16:9, o de vídeo do YouTube). O mínimo é 1200 x 675.
2. Dê um nome simples, sem espaço e sem acento: `publico-anuncio.jpg`.
3. Salve em `src/assets/img-src/blog/`.
4. No artigo, preencha `imagem: publico-anuncio.jpg` e `imagem_alt: "o que aparece na foto"`.
   - Atalho: se a foto tiver **o mesmo nome do artigo** (`como-escolher-o-publico.jpg`), nem precisa do campo `imagem`.

**Sem foto:** não preencha `imagem`. O passo 8 (`npm run capas`) desenha uma capa com o título, a categoria e o autor, nas cores da marca.

Nos dois casos, rode `npm run capas`: ele também cria a imagem que aparece quando alguém compartilha o link no WhatsApp. Rode de novo sempre que mudar o título.

O site gera sozinho as versões leves da foto para celular e computador.

### 6. Categoria nova

É só escrever o nome novo no campo `categoria`. Ela ganha uma seção e um botão na página `/blog/`, e a cor da capa é escolhida automaticamente. Escreva sempre do mesmo jeito (com os mesmos acentos e maiúsculas).

### 7. Tirar um artigo do ar

- **Por um tempo:** coloque `rascunho: true` nos campos. Para voltar, apague a linha.
- **De vez:** apague o arquivo `.md` (e a foto, se tiver).

Depois, gere o site (passo 8), envie (passo 9) e **apague no WebFTP a pasta do artigo** (`public_html/blog/nome-do-artigo/`). O envio nunca apaga nada sozinho: sem esse passo, a página antiga continua abrindo para quem tiver o link.

### 8. Gerar o site

No terminal, dentro da pasta do projeto:

```bash
npm run capas
npm run build
```

Espere aparecer **"Tudo certo."**. Se der erro, a mensagem diz o arquivo e o que corrigir (por exemplo: "a descricao tem 170 caracteres; o limite é 155").

Para ver antes de publicar: `npm run dev` e abra <http://localhost:8081/blog/> no navegador (Ctrl+C no terminal para parar).

O site pronto fica na pasta **`dist/`**.

### 9. Enviar para a Locaweb (WebFTP)

O passo a passo do WebFTP está em `docs/DEPLOY.md`, seção 4. Escolha um dos jeitos:

**Jeito seguro (recomendado):** envie **todo o conteúdo da pasta `dist/`** para dentro de `public_html`, substituindo quando perguntar. Dá para compactar o conteúdo de `dist/` num zip (os arquivos de dentro, não a pasta) e usar o **Descompactar** do WebFTP.

Nunca apague nem substitua no servidor:

- `olorin-ids.js` (se a sua `dist/` tiver um, não envie: o do servidor é o que vale);
- `config.php` e `olorin-config.php`;
- as pastas `leads/` e `.well-known/`.

**Jeito mínimo (só um artigo novo, sem outras mudanças no site):**

1. a pasta `blog/` inteira (os outros artigos também mudam por causa do "Leia também");
2. o `index.html` da raiz de `dist/` (a home, que mostra os 3 mais recentes);
3. `sitemap.xml` e `llms.txt`;
4. de `dist/assets/img/`, os arquivos que começam com `blog-capas-nome-do-artigo` (capa gerada) ou `blog-nome-da-foto` (foto própria);
5. de `dist/assets/img/og/`, o `blog-nome-do-artigo.jpg`.

Se mexeu em mais alguma coisa ou ficou na dúvida, use o jeito seguro.

No fim, abra `olorin.com.br/blog/` e o artigo (Ctrl+F5 para recarregar). A prévia do link no WhatsApp pode demorar para atualizar.

### 10. Guardar no GitHub

Para o artigo não sumir na próxima atualização do site, guarde os arquivos novos no GitHub (`derekgoncalves/Olorin` → abra a pasta → **Add file** → **Upload files**):

- o artigo, em `src/blog/artigos/`;
- a foto própria, se tiver, em `src/assets/img-src/blog/`;
- as imagens geradas, em `src/assets/img-src/blog/capas/` e `src/assets/og/`.

Ou mande esses arquivos no projeto Olorin do Claude e peça para guardar no repositório.
