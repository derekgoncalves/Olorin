# SEO, busca local e busca com IA

**Resumo:** cada página tem título e descrição próprios, um único título principal, endereço canônico em `https://olorin.com.br` e dados estruturados (JSON-LD) gerados do mesmo texto que aparece na tela. O sitemap lista só as páginas que devem ir para o Google. As páginas de campanha (`/promo/`) e de obrigado ficam fora, com `noindex`. O `robots.txt` libera buscadores e assistentes de IA, e o `llms.txt` resume a Olorin para eles.

## Títulos e descrições (gerados do conteúdo)

Para mudar: campo `seo:` de cada arquivo em `src/content/`. O build barra título acima de 60 caracteres e descrição acima de 155.

| Página | Título | Descrição |
|---|---|---|
| `/` | Olorin Digital \| Agência de marketing em Curitiba | Anúncio, conteúdo, site e impresso feitos pelo mesmo time. Marketing 360 com foco em venda e relatório que qualquer pessoa entende. |
| `/servicos/` | Serviços de marketing digital em Curitiba \| Olorin | Tráfego pago, redes sociais, identidade visual, material impresso, site e rastreamento feitos pelo mesmo time. Preços abertos. |
| `/servicos/identidade-visual/` | Criação de Identidade Visual em Curitiba \| Olorin Digital | Logotipo, manual de marca, papelaria e todo o material visual. Uma marca com cara de marca, não de improviso. Projetos a partir de R$ 800. |
| `/servicos/material-impresso/` | Material Impresso para Empresas em Curitiba \| Olorin | Cartão, folder, catálogo, banner, adesivo, fachada e embalagem. Arquivo fechado pronto para a gráfica e acompanhamento da prova. |
| `/servicos/rastreamento-e-relatorio/` | Rastreamento e Relatório de Marketing (GTM e GA4) \| Olorin | Google Tag Manager, pixel, conversões e painel de acompanhamento para saber quanto entrou, quanto saiu e qual foi o retorno. |
| `/servicos/redes-sociais/` | Gestão de Redes Sociais em Curitiba \| Olorin Digital | Calendário editorial, posts, stories e legendas com a mesma cara do seu anúncio e do seu site. Tudo incluso na Gestão mensal, a partir de R$ 2.500/mês. |
| `/servicos/site-e-loja-virtual/` | Criação de Sites e Lojas Virtuais em Curitiba \| Olorin | Site institucional, loja virtual e página de captação rápidos, bonitos no celular e feitos para trazer contato e venda. Projetos a partir de R$ 800. |
| `/servicos/trafego-pago/` | Gestão de Tráfego Pago em Curitiba \| Olorin Digital | Campanhas de Meta Ads e Google Ads com otimização semanal e relatório que mostra o retorno. Gestão a partir de R$ 2.500/mês. |
| `/sobre/` | Sobre a Olorin Digital \| Agência de marketing em Curitiba | Conheça o time de 3 especialistas da Olorin, o Método Olorin e como trabalhamos 100% remoto para marcas de todo o Brasil. |
| `/politica-de-privacidade/` | Política de Privacidade \| Olorin Digital | Como a Olorin Digital trata os dados de quem visita o site e pede orçamento, conforme a LGPD (Lei nº 13.709/2018). |

Palavra-chave principal: **agência de marketing digital em Curitiba** (home e Sobre). Cada serviço mira o termo "<serviço> em Curitiba" e atende o Brasil todo ("atendimento 100% remoto").

## Dados estruturados (JSON-LD)

| Página | Tipos |
|---|---|
| Todas | `ProfessionalService` (a Olorin: nome, lema, telefone, e-mail, Curitiba/PR, área atendida, Instagram), `WebSite`, `WebPage` |
| Home | + `FAQPage` (as mesmas perguntas da seção Dúvidas) |
| Páginas de serviço | + `Service` com preço (mensal ou "a partir de"), `BreadcrumbList`, `FAQPage` |
| Sobre | + `Person` para cada pessoa da equipe |
| Cases aprovados (quando houver) | + `BreadcrumbList` |

Não há avaliação (estrelas) nem preço inventado. Para testar: <https://search.google.com/test/rich-results> com o endereço de cada página.

## Indexação

- `sitemap.xml`: home, serviços, as 6 páginas de serviço, Sobre, Privacidade (e `/cases/` quando existir), com data de atualização.
- `/promo/*` e `/obrigado/`: `noindex, follow` na página **e** no cabeçalho HTTP (`.htaccess`). Não são bloqueadas no `robots.txt` de propósito: o Google precisa entrar para ler o `noindex`. A landing de campanha aponta o canônico para a página do serviço.
- Endereços antigos redirecionados (301): `/index.html` → `/`; restos do WordPress (`/wp-admin`, `/wp-content`, `/feed`…) → `/`; `/orcamento` e `/contato` → `/#orcamento`; `/diagnostico` → `/#diagnostico`; `/privacidade` → `/politica-de-privacidade/`.
- HTTPS e domínio sem `www`: bloco pronto no `.htaccess`, ativado depois do SSL (`docs/DEPLOY.md`, seção 4).

## Google Search Console (depois de publicar)

1. <https://search.google.com/search-console> → **Adicionar propriedade → Domínio** → `olorin.com.br`. Verifique pelo registro TXT no DNS (painel da Locaweb → DNS).
2. **Sitemaps** → envie `https://olorin.com.br/sitemap.xml`. Se houver um sitemap antigo listado (do WordPress ou com outro domínio), remova.
3. **Inspeção de URL** → teste a home e as 6 páginas de serviço e clique em **Solicitar indexação**.
4. Uma vez por mês: **Páginas** (erros de indexação) e **Desempenho** (buscas que trazem gente).
5. Repita no **Bing Webmaster Tools** (<https://www.bing.com/webmasters>): dá para importar direto do Search Console. O Bing alimenta o Copilot e parte do ChatGPT.

## Perfil da Empresa no Google (busca local)

- Categoria principal: **Agência de marketing** (ou "Consultor de marketing"). Secundárias: "Agência de publicidade", "Designer gráfico", "Web designer".
- Área atendida: Curitiba e Brasil. Se não recebe clientes no endereço, esconda o endereço e use só a área atendida.
- Serviços: os 6 do site, com as mesmas descrições curtas.
- Site: `https://olorin.com.br`. Telefone/WhatsApp: (41) 99646-0861.
- Fotos **reais** da equipe e de trabalhos. Peça avaliações para clientes reais (nunca escreva nem compre avaliações).
- Depois, cole o link do perfil em `GBP_URL` (`src/_data/site/config.json`): ele entra no rodapé e nos dados estruturados.

## Busca com IA (rotina mensal, 20 minutos)

Uma vez por mês, faça estas perguntas no **ChatGPT (com busca)**, **Perplexity**, **Gemini**, **Copilot** e no **Google (Visão geral criada por IA)**, numa janela anônima, e anote se a Olorin aparece:

1. Agência de marketing digital em Curitiba com preço aberto
2. Quanto custa gestão de tráfego pago em Curitiba?
3. Agência que faz anúncio, redes sociais, site e material impresso no mesmo lugar
4. Melhor forma de saber quanto cada venda custou no Meta Ads
5. Agência de marketing remota que atende pequenas empresas no Brasil
6. Quanto investir em anúncio no Instagram por mês para começar?
7. Empresa em Curitiba que cria identidade visual e material impresso
8. Como configurar Google Tag Manager e GA4 para medir vendas
9. Agência de tráfego pago com relatório simples de entender
10. Olorin Digital é boa? / O que a Olorin Digital faz?

| Mês | Pergunta | ChatGPT | Perplexity | Gemini | Copilot | Google IA | Observação |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

**Se não aparecer:** confira se a página do serviço está indexada (Search Console). Garanta que o Perfil da Empresa está completo e com avaliações reais. Responda no site, com palavras do dia a dia, a pergunta exata que as pessoas fazem (FAQ do serviço). Peça para ser citado em listas e parcerias reais (fornecedores, gráficas, clientes).

## O que falta preencher

`GBP_URL` (Perfil da Empresa) e os IDs de rastreamento em `src/_data/site/config.json`. Ver `docs/CONTENT-TODO.md`.
