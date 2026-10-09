# Como publicar o site na Locaweb

Guia para subir a versão nova do site para `olorin.com.br` com segurança e voltar atrás em 5 minutos se algo der errado.

**Resumo em 5 passos**

1. Faça o **backup** do `public_html` inteiro (seção 1).
2. Gere o site: `npm run build` e `npm test` (ou use o pacote pronto `entrega/olorin-site-v3.zip`).
3. **Envie o conteúdo** da pasta `dist/` para dentro do `public_html` (seção 2). Não apague nada antes.
4. **Teste** o site e o formulário no ar (seção 5).
5. Depois que tudo estiver certo: ative o **HTTPS obrigatório** (seção 4) e faça a **limpeza** dos arquivos velhos (seção 3).

> A publicação é sempre feita por você. Ninguém mais precisa da senha do FTP nem da senha do e-mail: elas ficam só no seu computador e no servidor.

---

## 0. Antes de começar (uma vez só)

- **Programa de FTP:** FileZilla (gratuito) em <https://filezilla-project.org>.
- **Dados de acesso:** no painel da Locaweb → Hospedagem → **FTP**. Anote servidor (host), usuário e a pasta do site (normalmente `public_html`). A senha você digita direto no FileZilla.
- **Versão do PHP:** no painel da Locaweb → Hospedagem → **PHP**. O formulário precisa de **PHP 7.4 ou mais novo** (recomendado 8.1+).
- **Certificado SSL:** no painel → **SSL / Let's Encrypt** (gratuito). Ative para `olorin.com.br` e `www.olorin.com.br` se ainda não estiver ativo. Pode levar algumas horas.

---

## 1. Backup completo (obrigatório)

1. No FileZilla, conecte e abra a pasta `public_html` do lado direito (servidor).
2. Do lado esquerdo (seu computador), crie uma pasta `backup-olorin-AAAA-MM-DD` num lugar seguro **fora** do projeto.
3. Selecione **tudo** dentro do `public_html` e arraste para essa pasta.

Esse backup contém o `config.php` (com a senha do e-mail) e a pasta `leads/` (pedidos com dados pessoais). **Guarde com cuidado, não envie para ninguém e não coloque no GitHub.**

Se você usar `npm run deploy` (seção 2B), ele também baixa um backup automático em `backups/` (sem o `config.php` e sem os pedidos, que ele nunca altera).

---

## 2. Enviar os arquivos

### 2A. Pelo FileZilla (recomendado na primeira vez)

1. Gere o site: `npm run build` (precisa terminar com "Tudo certo") e `npm test`. Ou descompacte `entrega/olorin-site-v3.zip`.
2. No FileZilla, do lado esquerdo abra a pasta **`dist`** (ou a pasta descompactada). Do lado direito, o `public_html`.
3. Selecione **todo o conteúdo** de `dist` (não a pasta em si) e arraste para dentro do `public_html`.
4. Quando perguntar sobre arquivos que já existem, escolha **Sobrescrever** e marque "sempre usar esta ação".

**O que vai junto (está tudo em `dist/`):**

| Arquivo ou pasta | O que é |
|---|---|
| `index.html`, `404.html` | Home e página de erro |
| `servicos/`, `sobre/`, `promo/`, `obrigado/`, `politica-de-privacidade/` | Demais páginas |
| `assets/` | CSS, JavaScript, fontes e imagens |
| `enviar.php` | Recebe o formulário |
| `config.example.php` | Modelo de configuração (sem senha). Fica bloqueado para visitantes |
| `.htaccess` | Regras do servidor (segurança, cache, erros). **No FileZilla, ative "Servidor → Forçar exibição de arquivos ocultos"** para ver e enviar arquivos que começam com ponto |
| `leads/.htaccess` | Tranca a pasta de pedidos |
| `sitemap.xml`, `robots.txt`, `llms.txt`, `site.webmanifest`, `favicon.ico` | Buscadores, assistentes de IA e ícones |

**Nunca envie:** `site-atual/`, `_brand/`, `_inbox/`, `docs/`, `src/`, `node_modules/`, `.env`, `backups/`, nem um `config.php` do seu computador.

**Nunca apague no servidor:** `config.php`, `olorin-config.php`, a pasta `leads/` (pedidos), a pasta `.well-known/` (certificado SSL).

### 2B. Pelo comando `npm run deploy` (opcional)

1. Copie `.env.example` para `.env` e preencha `FTP_HOST`, `FTP_USUARIO`, `FTP_SENHA` e `FTP_PASTA` **no seu computador** (o `.env` nunca vai para o GitHub).
2. `npm run deploy:dry` mostra a lista do que seria enviado e testa a conexão, sem enviar nada.
3. `npm run deploy` faz build, testes, backup do servidor em `backups/AAAA-MM-DD_HHMM/` e o envio. Ele **nunca apaga nada** no servidor e nunca toca em `config.php`, `leads/` e `.well-known/`.

Se a Locaweb recusar a conexão segura, troque `FTP_SEGURO=true` por `false` no `.env`.

---

## 3. Configuração do formulário e limpeza

### O `config.php` que já está no servidor continua valendo

O `enviar.php` novo lê o mesmo `config.php` da versão anterior. Confira só, abrindo pelo Gerenciador de Arquivos da Locaweb:

- `email_destino` = `digital@olorin.com.br`
- `whatsapp` = `5541996460861`
- `smtp_usuario` = `digital@olorin.com.br` e `smtp_senha` preenchida (é a senha dessa caixa de e-mail)

### Mais seguro: tirar a senha de dentro da pasta pública (recomendado)

1. No Gerenciador de Arquivos, suba **um nível** acima do `public_html` (a pasta "home" da hospedagem).
2. Crie ali o arquivo `olorin-config.php` copiando o conteúdo do `config.example.php` e preencha a senha **lá mesmo**.
3. Faça um envio de teste (seção 5). Se chegar, apague o `config.php` de dentro do `public_html`.
4. Se não chegar, a hospedagem não deixa o PHP ler fora do site: mantenha o `config.php` no `public_html` (ele é bloqueado pelo `.htaccess`) e apague o `olorin-config.php`.

### Onde ficam os pedidos agora

Cada pedido é gravado numa planilha por mês (`AAAA-MM.csv`, abre no Excel). O `enviar.php` tenta primeiro a pasta `leads/` **fora** do `public_html` (ninguém acessa pela internet); se não conseguir, usa `public_html/leads/` (trancada pelo `.htaccess`). Os pedidos antigos continuam em `public_html/leads/pedidos.csv`. Baixe pelo FTP.

### Arquivos velhos para apagar do servidor (depois que o site novo estiver no ar e testado)

| Apagar | Por quê |
|---|---|
| `license.txt` | Sobra da exportação do WordPress; mostra a origem do site |
| `error.log` | Log de erro da cópia antiga; não deve ficar público |
| `LEIA-ME.txt` | Não é mais usado |
| `assets/wp/` | CSS do WordPress que o site novo não usa |
| `assets/css/olorin.css` e `assets/js/olorin.js` | CSS/JS da versão antiga (o novo tem nomes como `olorin.3f9a1c27e0.css`) — apague **uma semana** depois, para quem ainda estiver com a página antiga aberta |
| `assets/img/portfolio/`, `assets/img/hero-celular.webp`, `assets/img/sobre-bastidores.webp`, `assets/img/erro-404.webp` | Imagens da versão antiga (as novas têm a largura no nome, ex.: `hero-celular-400.webp`) — mesma regra: uma semana depois |
| `assets/img/compartilhamento.jpg` | Prévia antiga de compartilhamento; pode apagar depois de um mês |

Arquivos `olorin.<código>.css/js` antigos de publicações futuras também podem ser apagados com o tempo; eles não atrapalham.

---

## 4. Ativar o HTTPS obrigatório (depois do SSL ativo)

1. Abra `https://olorin.com.br` e `https://www.olorin.com.br` no navegador. Os dois precisam abrir **com cadeado e sem aviso**.
2. Baixe o `.htaccess` do servidor e abra num editor de texto.
3. No bloco **"Variante A (padrão)"**, apague o `# ` do começo das 5 linhas (de `<IfModule mod_rewrite.c>` até `</IfModule>`). Salve e envie de volta.
4. Teste: `http://olorin.com.br`, `http://www.olorin.com.br` e `https://www.olorin.com.br` devem ir todos para `https://olorin.com.br/`.
5. Se o site entrar em **"redirecionamento em excesso"**: recoloque os `# ` da Variante A e tire os da **Variante B** (para hospedagens em que o HTTPS passa por um proxy). Teste de novo.
6. Uma semana depois, com tudo estável, ative o **HSTS**: apague o `# ` da linha `Header always set Strict-Transport-Security ...`. A partir daí o navegador só aceita HTTPS (não dá para desfazer rápido, por isso fica por último).

Para impor a **Política de Segurança de Conteúdo** (CSP): hoje ela está em modo "só observar". Depois de uma semana com o rastreamento ligado e sem avisos "Content-Security-Policy" no console do navegador (F12), troque `Content-Security-Policy-Report-Only` por `Content-Security-Policy` no `.htaccess`.

---

## 5. Testes depois de publicar

Use uma janela anônima e o celular.

- [ ] Home, `/servicos/`, as 6 páginas de serviço, `/sobre/`, `/promo/` e `/politica-de-privacidade/` abrem com o visual novo.
- [ ] Uma página que não existe (ex.: `olorin.com.br/teste-404`) mostra a 404 da Olorin com o WhatsApp certo.
- [ ] **Formulário:** preencha com o seu nome e o seu WhatsApp, marque "Teste" na mensagem e envie. Deve ir para `/obrigado/`, o e-mail deve chegar em `digital@olorin.com.br` e a linha deve aparecer na planilha do mês em `leads/`.
- [ ] Todos os botões de WhatsApp abrem a conversa com **(41) 99646-0861** e uma mensagem com `[ref: ...]` no fim (isso mostra de qual botão a pessoa veio).
- [ ] `olorin.com.br/config.php`, `olorin.com.br/leads/` e `olorin.com.br/config.example.php` devem dar **acesso negado (403)**.
- [ ] `olorin.com.br/sitemap.xml` e `olorin.com.br/robots.txt` abrem.
- [ ] Opcional: <https://pagespeed.web.dev> com `https://olorin.com.br` (celular).
- [ ] Depois: Search Console e Perfil da Empresa no Google (`docs/SEO.md`); rastreamento (`docs/TRACKING.md`).

Se o e-mail do formulário não chegar mas o pedido estiver na planilha, o problema é só o SMTP: confira usuário e senha no `config.php` / `olorin-config.php` e se a caixa `digital@olorin.com.br` existe.

---

## 6. Desfazer (rollback) em 5 minutos

Como **nada é apagado** na publicação, o site antigo volta só reenviando os arquivos dele:

1. No FileZilla, do lado esquerdo abra a pasta do backup (seção 1) ou `backups/AAAA-MM-DD_HHMM/`.
2. Envie para o `public_html`, sobrescrevendo, **apenas**: `index.html`, `404.html`, `.htaccess`, `enviar.php`, `politica-de-privacidade/`, `robots.txt`, `sitemap.xml`.
3. Abra o site com Ctrl+F5. Pronto: os CSS/JS e imagens antigos continuam no servidor, então o site antigo aparece inteiro.
4. As páginas novas (`servicos/`, `sobre/`, `promo/`, `obrigado/`) podem ficar no servidor sem atrapalhar, ou ser apagadas.

Não restaure o `config.php` nem a pasta `leads/` do backup por cima dos atuais (você perderia pedidos novos).
