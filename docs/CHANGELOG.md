# Histórico de versões

## 3.0.0 — outubro de 2026

Reconstrução completa do site em HTML estático gerado (Eleventy), substituindo a exportação do WordPress.

**Novo**
- Home reorganizada, com a ordem dos blocos editável (`src/content/home.yml`), formulário curto logo abaixo do banner e completo no fim (teste A/B opcional).
- Página de serviços e 6 páginas de serviço (preço, entregas, como funciona, quem faz, perguntas, "combina com").
- Página Sobre com o time e fotos reais; landings de campanha `/promo/` e `/promo/<serviço>/` sem menu e fora do Google.
- Página de obrigado com a conversão contada uma única vez; 404 com a marca.
- Formulário em 2 etapas com máscara e validação de DDD, mensagens claras, alternativa pelo WhatsApp e funcionamento sem JavaScript.
- Números da seção Resultados (R$2M+, 50+, 2x, 100+), planos com calculadora do custo de entrada, exemplo ilustrativo de relatório.
- Rastreamento pronto (GTM/GA4/Meta/Google Ads) com consentimento (Consent Mode v2) — desligado até os IDs serem preenchidos.
- Dados estruturados (JSON-LD), sitemap, robots, `llms.txt`, imagens de compartilhamento por página.
- Imagens em AVIF/WebP em vários tamanhos; fontes reduzidas ao português; CSS crítico embutido.
- Controle para pausar animações (acessibilidade).
- Suporte automático às fontes pagas da marca quando os arquivos forem colocados no projeto.

**Corrigido** (detalhes em `docs/AUDIT.md`)
- Domínio errado, WhatsApp de exemplo e Instagram errado em páginas antigas.
- Anti-spam por tempo que não funcionava; lista de serviços do PHP diferente da do formulário.
- Pedidos e senha dentro da pasta pública; envio aceito de outros sites; limite por IP contado antes da validação.
- Conversão disparada antes da confirmação do envio; cursor personalizado escondendo o cursor do sistema.
- Redirecionamento HTTPS que não existia (agora pronto para ativar); arquivos que não deveriam estar no ar.

## 2.x e 1.x

Tema WordPress e exportação estática anteriores — ver `legado/README-v1.md`.
