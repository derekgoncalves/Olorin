# Relatório final · site v3 da Olorin Digital

Data: 09/10/2026 · Branch: `claude/olorin-website-locaweb-p5gj5n` · Pacote: `entrega/olorin-site-v3.zip`

## Em uma frase

Site novo em HTML estático, gerado a partir de arquivos de texto editáveis, pronto para subir por FTP na Locaweb. É mais rápido que o anterior, nota 99–100 no Lighthouse mobile, 100 em acessibilidade e SEO e zero violações sérias no axe. Tem formulário em 2 etapas, 6 páginas de serviço, página Sobre com a equipe, landings de campanha e rastreamento pronto para ligar.

## O que foi feito, por fase

| Fase | Entregue |
|---|---|
| 0. Auditoria, marca e plano | `docs/AUDIT.md` (todos os problemas do site anterior, confirmados no código), `docs/BRAND.md` (manual de marca página por página), `docs/BENCHMARK.md` (21 referências), `docs/PLAN.md` (arquitetura e decisões) |
| 1. Fundação | Eleventy + Nunjucks + YAML; tokens e componentes da marca; guia `/_estilo/` (só no `npm run dev`); formulário em 2 etapas; `enviar.php` gerado do mesmo conteúdo; `.htaccess` testado em Apache real |
| 2. Home | 14 blocos com ordem editável em `home.yml`; formulário curto logo abaixo do banner e completo no fim (teste A/B opcional); números R$2M+ / 50+ / 2x / 100+; 3 cases e portfólio de exemplo (como pedido); exemplo de relatório rotulado |
| 3. Serviços | Página `/servicos/` e 6 páginas de serviço. Cada uma tem resposta curta, para quem é, entregas, como funciona, quem faz, preço, perguntas, "combina com" e formulário. Os textos passaram por verificação de fatos e de português |
| 4. Sobre e cases | `/sobre/` com as 3 fotos; `/cases/` pronta, gerada sozinha quando houver um case aprovado |
| 5. Campanhas | `/promo/` e `/promo/<serviço>/`, sem menu, com formulário no topo e fora do Google |
| 6. Imagens | AVIF/WebP responsivas, fotos da equipe recortadas, 10 imagens de compartilhamento com a marca |
| 7. SEO e IA | Títulos e descrições por página, JSON-LD, sitemap, robots, `llms.txt`, redirecionamentos 301 |
| 8. Qualidade | `npm test` (páginas, acessibilidade, formulário de ponta a ponta com PHP), verificação automática do build, Lighthouse antes e depois, revisão visual em 360–1440 px e correções |
| 9. Publicação | **Não feita por mim** (precisa da sua autorização e das suas senhas). Pacote e guia prontos: `docs/DEPLOY.md` |

## Números antes × depois (home, Lighthouse mobile, mesmo servidor)

| | Desempenho | LCP | Peso transferido | Acessibilidade | SEO |
|---|---:|---:|---:|---:|---:|
| Site anterior | 96 | 2,6 s | 227 KiB | 100 | 100 |
| **Site novo** | **99** | **2,0 s** | **157 KiB** | **100** | **100** |

Demais páginas: entre 99 e 100. Detalhes em `docs/PERFORMANCE.md`.

## Problemas do site anterior que foram corrigidos

- Domínio errado, WhatsApp de exemplo e Instagram errado na 404 e na Política.
- Anti-spam por tempo que não funcionava.
- Lista de serviços do PHP diferente da lista do formulário.
- Pedidos e senha dentro da pasta pública.
- Envios aceitos de outros sites.
- Conversão contada antes de o envio dar certo.
- Redirecionamento para HTTPS que não existia (agora está pronto para ativar).
- CSS do WordPress que sobrou no site.
- Cursor personalizado que escondia o cursor do sistema.
- Animações sem botão de pausar.

A lista completa, com o antes e o depois, está em `docs/AUDIT.md`.

## Pendências suas (resumo; lista completa em `docs/CONTENT-TODO.md`)

1. **Formato do diagnóstico gratuito**, que é a oferta principal.
2. **WhatsApp oficial**: o site usa (41) 99646-0861.
3. **Rastreamento e relatório**: preço e formato. Também quem é o dono das contas, do domínio e dos arquivos.
4. **Razão social, CNPJ e encarregado de dados** para a Política de Privacidade. A política é um rascunho: peça revisão jurídica.
5. Detalhes das páginas de serviço: faixas de preço, prazos, rodadas de ajuste, primeiros 30/60/90 dias. São 58 itens marcados, que não aparecem no site até você responder.
6. **Portfólio real** no lugar das 8 imagens de exemplo, e conferir as fotos da equipe (a da Natália em resolução maior).
7. **Fontes pagas**:
   - Integral CF: licença *Web* da Connary Fagen.
   - Retro Computer: permissão por escrito do autor.
8. IDs do GTM, GA4, Meta Pixel e Google Ads, quando quiser medir (contêiner pronto em `gtm-container.json`).

## Os 5 primeiros passos para publicar com segurança

1. **Backup:** baixe o `public_html` inteiro pelo FileZilla para uma pasta no seu computador (`docs/DEPLOY.md`, seção 1).
2. **Envie** o conteúdo de `entrega/olorin-site-v3.zip` para dentro do `public_html`:
   - descompacte primeiro;
   - mostre os arquivos ocultos, para o `.htaccess` ir junto;
   - não apague o `config.php` nem a pasta `leads/`.
3. **Teste o formulário** com o seu número. Confira se o e-mail chega em digital@olorin.com.br e se a linha aparece na planilha do mês em `leads/`.
4. **Ative o HTTPS:**
   - confirme o SSL no painel da Locaweb;
   - tire os `#` das 5 linhas da "Variante A" no `.htaccess`;
   - teste `http://` e `www.` (`docs/DEPLOY.md`, seção 4).
5. **Google:**
   - envie `https://olorin.com.br/sitemap.xml` no Search Console;
   - atualize o Perfil da Empresa com o link do site;
   - depois de uma semana, apague os arquivos antigos listados em `docs/DEPLOY.md`, seção 3.

Para voltar atrás em 5 minutos: reenvie do backup só o `index.html`, o `404.html`, o `.htaccess`, o `enviar.php` e a pasta `politica-de-privacidade/` (`docs/DEPLOY.md`, seção 6).

## O que não foi feito (e por quê)

- **Publicação:** só você pode autorizar e tem as senhas.
- **Testes no Safari/WebKit:** o ambiente tinha só o Chromium. Faça o roteiro do `docs/A11Y.md` num iPhone.
- **Roteiro com leitor de tela:** precisa de uma pessoa (`docs/A11Y.md`).
- **Importar o contêiner do GTM num GTM real:** precisa da sua conta (`docs/TRACKING.md`).
- **Achados de rastreamento ainda abertos:**
  - sem o GTM, os eventos não vão para o GA4/Pixel (só a visita);
  - a escolha de cookies não expira;
  - nos eventos, o `page_mode` das campanhas é `promo` (o PROMPT pede `campanha`).

  Estão listados no fim do `docs/TRACKING.md` e entram na próxima rodada.
