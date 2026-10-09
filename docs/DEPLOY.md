# Como publicar o site pelo WebFTP da Locaweb

Guia para subir a versão nova de `olorin.com.br` usando só o navegador, pelo **WebFTP** (Gerenciador de arquivos web da Locaweb), sem instalar programa nenhum. Se algo der errado, dá para voltar ao site antigo em 5 minutos.

**Resumo em 6 passos**

1. Entre no WebFTP (seção 1).
2. Baixe uma cópia dos 7 arquivos do site atual. É o seu "botão de desfazer" (seção 2).
3. No computador, descompacte `olorin-site-v3.zip` (seção 3).
4. Envie os arquivos para dentro da pasta `public_html` (seção 4).
5. Teste o site e o formulário (seção 6).
6. Depois que tudo estiver certo, ative o HTTPS obrigatório (seção 7) e apague os arquivos velhos (seção 8).

> **Nunca apague no servidor:** `config.php` (tem a senha do e-mail), a pasta `leads/` (os pedidos do formulário) e a pasta `.well-known/` (certificado SSL). A publicação só **acrescenta e substitui** arquivos; ela não apaga nada.

---

## 1. Entrar no WebFTP

1. Entre na **Central do Cliente** da Locaweb.
2. Abra **Hospedagem de Sites**, escolha o site `olorin.com.br` e clique em **Administrar**.
3. No painel, procure **Arquivos e FTP** e clique em **Gerenciador de arquivos web**.
4. Abre uma aba nova. Marque o "não sou um robô" e clique em **Ir para o WebFTP**.
5. Entre com o **usuário e a senha de FTP** da hospedagem. Se não lembrar a senha, troque no próprio painel, em **Arquivos e FTP**. Você digita a senha só lá: ela não precisa ser enviada para ninguém.
6. Você verá a pasta principal da hospedagem. O site fica dentro da pasta **`public_html`**.

**Antes de continuar, confira duas coisas no painel da Locaweb (só uma vez):**

- **Versão do PHP:** em Hospedagem → PHP, precisa ser **7.4 ou mais nova** (recomendado 8.1 ou mais). É o que faz o formulário funcionar.
- **Certificado SSL:** em SSL / Let's Encrypt, deixe ativo para `olorin.com.br` e `www.olorin.com.br`. Pode levar algumas horas para ficar pronto.

---

## 2. Backup rápido (o seu botão de desfazer)

Como a publicação **não apaga nada**, para voltar ao site antigo basta ter uma cópia destes arquivos. No WebFTP, dentro de `public_html`, baixe cada um para uma pasta no seu computador chamada `backup-olorin` (normalmente: marcar o arquivo e clicar em **Download** / **Baixar**).

| Arquivo | Onde está |
|---|---|
| `index.html` | `public_html/` |
| `404.html` | `public_html/` |
| `.htaccess` | `public_html/` (veja a dica abaixo se ele não aparecer) |
| `enviar.php` | `public_html/` |
| `robots.txt` | `public_html/` |
| `sitemap.xml` | `public_html/` |
| `index.html` da pasta `politica-de-privacidade` | `public_html/politica-de-privacidade/` (salve como `politica-index.html` para não confundir com o da home) |

**Dica sobre o `.htaccess`:** arquivos que começam com ponto são "ocultos" e alguns gerenciadores não os mostram. Procure no WebFTP uma opção como **Mostrar arquivos ocultos**. Se não houver, tudo bem. Existe uma cópia do `.htaccess` que estava no ar no projeto (`site-atual/.htaccess`) e eu posso te mandar se precisar.

Se o WebFTP tiver a opção de **baixar a pasta inteira** ou **compactar** (`Compactar`/`Download como zip`), melhor ainda: baixe o `public_html` inteiro, **menos** a pasta `leads/`. Ela tem dados pessoais e não precisa sair do servidor.

---

## 3. Preparar os arquivos no computador

1. Baixe `olorin-site-v3.zip` (o último que mandei).
2. Clique com o botão direito → **Extrair tudo** (Windows) ou dê dois cliques (Mac). Vai aparecer uma pasta com:

```
.htaccess              ← regras do servidor (arquivo "oculto": pode não aparecer no Windows; ver dica)
404.html
config.example.php     ← modelo da configuração do e-mail (sem senha)
enviar.php             ← recebe o formulário
favicon.ico
index.html             ← a home
llms.txt
robots.txt
site.webmanifest
sitemap.xml
assets/                ← CSS, JavaScript, fontes e imagens
leads/                 ← só tem o .htaccess que tranca a pasta
obrigado/
politica-de-privacidade/
promo/
servicos/
sobre/
```

**Dica (Windows):** para ver o `.htaccess` na pasta, abra o Explorador de Arquivos → menu **Exibir** → marque **Itens ocultos**.

---

## 4. Enviar os arquivos para o `public_html`

Primeiro veja qual dos dois caminhos o seu WebFTP permite.

### Caminho A — o WebFTP descompacta zip (mais rápido)

Se, ao clicar num arquivo `.zip` no WebFTP, aparecer uma opção como **Descompactar**, **Extrair** ou **Unzip**:

1. Entre na pasta `public_html`.
2. Clique em **Upload** / **Enviar arquivo** e envie o próprio `olorin-site-v3.zip`, **sem descompactar**.
3. Selecione o zip no WebFTP e escolha **Descompactar** / **Extrair** ali mesmo, dentro de `public_html`. Se perguntar sobre arquivos que já existem, escolha **substituir** / **sobrescrever**.
4. Confira se os arquivos ficaram **direto** dentro de `public_html` (o `index.html` precisa estar em `public_html/index.html`, e não em `public_html/olorin-site-v3/index.html`). Se tiver criado uma subpasta, avise que eu te digo como resolver.
5. Apague o arquivo `olorin-site-v3.zip` do servidor.

### Caminho B — enviar pasta por pasta (se não houver "descompactar")

O site tem 125 arquivos em 25 pastas. Dá trabalho, mas é só repetir: **criar a pasta → entrar nela → enviar os arquivos**.

Na maioria dos gerenciadores dá para selecionar **vários arquivos de uma vez** na janela de upload (Ctrl+A dentro da pasta do computador). Alguns aceitam **arrastar uma pasta inteira**: se o seu aceitar, use, porque poupa muito tempo.

**Ordem recomendada** (assim nenhuma página nova aparece sem o visual dela):

1. **Arquivos soltos da raiz.** Dentro de `public_html`, envie `enviar.php`, `config.example.php`, `favicon.ico`, `robots.txt`, `llms.txt`, `site.webmanifest`, `sitemap.xml` e `.htaccess`. **Deixe `index.html` e `404.html` para o fim.**
2. **Pasta `assets`.** Crie em `public_html` as pastas abaixo (se `assets` já existir, só entre nela) e envie em cada uma os arquivos da pasta de mesmo nome do computador:

| Pasta no servidor | Arquivos |
|---|---|
| `assets/css` | 1 arquivo (`olorin.<código>.css`) |
| `assets/js` | 1 arquivo (`olorin.<código>.js`) |
| `assets/fonts` | 5 fontes `.woff2` + `LICENCA-FONTES.txt` |
| `assets/img` | todas as imagens `.avif` e `.webp` (são muitas: selecione todas de uma vez) |
| `assets/img/brand` | 5 ícones |
| `assets/img/og` | 10 imagens `.jpg` |

3. **Páginas.** Crie as pastas e envie o `index.html` de cada uma:

```
servicos/                              servicos/identidade-visual/
servicos/trafego-pago/                 servicos/material-impresso/
servicos/redes-sociais/                servicos/site-e-loja-virtual/
servicos/rastreamento-e-relatorio/     sobre/
promo/                                 promo/trafego-pago/
promo/redes-sociais/                   promo/identidade-visual/
promo/material-impresso/               promo/site-e-loja-virtual/
promo/rastreamento-e-relatorio/        obrigado/
politica-de-privacidade/
```

4. **Pasta `leads`.** Ela já deve existir no servidor. Entre nela e envie o `.htaccess` que está na pasta `leads` do computador, substituindo. **Não apague nada que já esteja lá** (são os pedidos antigos).
5. **Por último**, na raiz de `public_html`, envie `404.html` e `index.html`, substituindo os antigos. A partir daqui o site novo está no ar.

### Se o `.htaccess` não subir ou não aparecer

1. No computador, renomeie uma cópia do arquivo para `htaccess.txt`.
2. Envie `htaccess.txt` para `public_html` (ou para `public_html/leads`, no caso do outro).
3. No WebFTP, use **Renomear** e troque o nome para `.htaccess` (com o ponto na frente, sem `.txt`). Se perguntar, confirme que quer substituir o que já existe.

---

## 5. Configuração do formulário (normalmente não precisa mexer)

O `enviar.php` novo usa o **mesmo `config.php`** que já está no servidor. Só confira, abrindo o `config.php` no WebFTP com **Editar** (ou baixando e abrindo no Bloco de Notas):

- `email_destino` = `digital@olorin.com.br`
- `whatsapp` = `5541996460861`
- `smtp_usuario` = `digital@olorin.com.br` e `smtp_senha` preenchida (é a senha dessa caixa de e-mail). Não copie a senha para lugar nenhum.

**Onde ficam os pedidos agora:** numa planilha por mês (`AAAA-MM.csv`, abre no Excel). O formulário tenta gravar na pasta `leads` **fora** do `public_html` (ninguém acessa pela internet); se não puder, usa `public_html/leads/` (trancada). Os pedidos antigos continuam em `public_html/leads/pedidos.csv`. Para ler, é só baixar pelo WebFTP.

**Opcional, mais seguro:** tirar a senha de dentro da pasta pública.

1. No computador, copie o `config.example.php` do zip e renomeie a cópia para `olorin-config.php`.
2. Abra no Bloco de Notas, troque `TROCAR_NO_SERVIDOR` pela senha do e-mail e salve.
3. No WebFTP, volte **uma pasta acima** do `public_html` (a pasta principal) e envie o `olorin-config.php` para lá.
4. **Apague a cópia do seu computador.**
5. Faça um envio de teste (seção 6). Se o e-mail chegar, apague o `config.php` de dentro do `public_html`. Se não chegar, apague o `olorin-config.php` e deixe tudo como estava. O `config.php` atual é bloqueado para visitantes.

---

## 6. Testar depois de publicar

Use uma janela anônima no computador e também o celular.

- [ ] A home, `/servicos/`, as 6 páginas de serviço, `/sobre/` e `/promo/` abrem com o visual novo.
- [ ] Se aparecer o visual antigo, atualize com **Ctrl+F5** (no celular, feche e abra o navegador).
- [ ] `olorin.com.br/qualquer-coisa` mostra a página 404 da Olorin.
- [ ] **Formulário:**
  - preencha com o seu nome e o seu WhatsApp e escreva "teste" na mensagem;
  - depois de enviar, a página tem que mudar para "obrigado";
  - o aviso tem que chegar em `digital@olorin.com.br`;
  - no WebFTP, tem que aparecer uma planilha nova (ex.: `2026-10.csv`) na pasta `leads`, fora ou dentro do `public_html`.
- [ ] Os botões de WhatsApp abrem conversa com **(41) 99646-0861**. No fim da mensagem aparece `[ref: ...]`, que mostra de qual botão a pessoa veio.
- [ ] `olorin.com.br/config.php` e `olorin.com.br/leads/` precisam dar **acesso negado (erro 403)**.

**Se o pedido chegou na planilha mas o e-mail não chegou:** o problema é só a senha ou o usuário do e-mail no `config.php`. Os pedidos não se perdem.

**Se aparecer "Erro 500" em todas as páginas:** o `.htaccess` não foi aceito pelo servidor. Renomeie o `.htaccess` do `public_html` para `htaccess-novo.txt` e me avise: o site volta a abrir na hora (sem as regras extras) enquanto eu ajusto.

---

## 7. Ativar o HTTPS obrigatório (depois do SSL ativo)

1. Abra `https://olorin.com.br` e `https://www.olorin.com.br`. Os dois precisam abrir **com cadeado e sem aviso**.
2. No WebFTP, abra o `.htaccess` do `public_html` com **Editar**. Se o WebFTP não editar, baixe, edite no Bloco de Notas e envie de volta.
3. Ache o trecho **"Variante A (padrão)"** e apague o `# ` (cerquilha e espaço) do começo destas 5 linhas:

```
# <IfModule mod_rewrite.c>
# RewriteCond %{HTTPS} off [OR]
# RewriteCond %{HTTP_HOST} ^www\. [NC]
# RewriteRule ^ https://olorin.com.br%{REQUEST_URI} [L,R=301]
# </IfModule>
```

4. Salve e teste: `http://olorin.com.br`, `http://www.olorin.com.br` e `https://www.olorin.com.br` precisam ir todos para `https://olorin.com.br/`.
5. **Se o navegador disser "redirecionamento em excesso":** recoloque os `# ` nas 5 linhas da Variante A e tire os da **Variante B**, logo abaixo. Teste de novo. Se continuar, recoloque os `#` e me avise.
6. **Uma semana depois**, com tudo estável, apague o `# ` da linha que começa com `# Header always set Strict-Transport-Security`. A partir daí o navegador só aceita HTTPS. Isso é difícil de desfazer, por isso fica por último.

---

## 8. Limpeza (uma semana depois de tudo funcionando)

Apague do `public_html` pelo WebFTP:

| Apagar | Por quê |
|---|---|
| `license.txt` | Sobra da exportação do WordPress; mostra a origem do site |
| `error.log` | Log de erro antigo; não deve ficar público |
| `LEIA-ME.txt` | Não é mais usado |
| pasta `assets/wp/` | CSS do WordPress que o site novo não usa |
| `assets/css/olorin.css` e `assets/js/olorin.js` | CSS e JS da versão antiga. Os novos têm um código no nome, ex.: `olorin.602c5d12f8.css`. **Não apague os que têm código** |
| pasta `assets/img/portfolio/` e os arquivos `assets/img/hero-celular.webp`, `assets/img/sobre-bastidores.webp`, `assets/img/erro-404.webp`, `assets/img/compartilhamento.jpg` | Imagens da versão antiga. As novas têm a largura no nome, ex.: `hero-celular-400.webp`. **Não apague as que têm número no nome** |

**Nunca apague:** `config.php`, `olorin-config.php`, a pasta `leads/` e a pasta `.well-known/`.

---

## 9. Desfazer (voltar ao site antigo em 5 minutos)

1. Entre no WebFTP (seção 1) e abra a pasta `public_html`.
2. Envie de volta os arquivos do seu `backup-olorin` (seção 2), **substituindo**:
   - `index.html`, `404.html`, `.htaccess`, `enviar.php`, `robots.txt` e `sitemap.xml` vão na raiz de `public_html`;
   - o `politica-index.html` vai para `public_html/politica-de-privacidade/`, renomeado de volta para `index.html`.
3. Atualize o site com **Ctrl+F5**.

Pronto: os CSS, JS e imagens antigos continuaram no servidor, então o site antigo volta inteiro. As pastas novas (`servicos/`, `sobre/`, `promo/`, `obrigado/`) podem ficar lá sem atrapalhar.

**Não restaure o `config.php` nem a pasta `leads/`** por cima dos atuais: você perderia pedidos que chegaram nesse meio-tempo.

---

## Outras formas de publicar (opcionais)

- **FileZilla** (programa de FTP): se um dia quiser usar, baixe só do site oficial `filezilla-project.org`, usando o botão que **não** traz ofertas de outros programas, porque é o instalador com ofertas que o antivírus costuma acusar. Mesmo assim o WebFTP resolve tudo.
- **`npm run deploy`**: envio automático pelo terminal, para quem tiver o Node.js instalado. Veja `scripts/deploy.mjs`.
