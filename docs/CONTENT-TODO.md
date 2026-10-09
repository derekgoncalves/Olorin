# O que falta confirmar

Tudo aqui está no site como `[CONFIRMAR: ...]` e **não aparece no site publicado** até você responder: o item inteiro fica de fora. Para ver a lista atualizada com o arquivo e a linha exatos, rode `npm run pendencias`. Para responder, troque o marcador pelo texto confirmado no arquivo indicado (ver `docs/EDITAR.md`).

Prioridade: **A** = muda a venda ou o formulário; **B** = deixa a página de serviço completa; **C** = detalhe.

## 1. Você (dono): decisões comerciais

| Prio. | Pergunta | Onde |
|---|---|---|
| A | **Formato do diagnóstico gratuito.** É a oferta principal do site. Sugestão: conversa de 30 minutos por vídeo + resumo por escrito do que encontramos | `home.yml` (formulário do topo) |
| A | **Número de WhatsApp oficial.** O site usa (41) 99646-0861. O `config.php` antigo tinha outro número. Qual vale? | `src/_data/site/config.json` |
| A | **Rastreamento e relatório: preço e formato.** Já vem incluso na Gestão mensal e no 360, ou é contratado à parte? Projeto fechado ou mensal? Qual o valor? Hoje a página mostra "o valor depende do que já existe no seu site" | `servicos/rastreamento-e-relatorio.yml` |
| A | **Titularidade.** De quem são a conta de anúncio, o domínio, a hospedagem e os arquivos abertos, e o que acontece se o cliente encerrar | `faq.yml`, `trafego-pago.yml`, `site-e-loja-virtual.yml`, `identidade-visual.yml` |
| B | **Faixas de preço por escopo:** só logotipo × logotipo + manual × identidade completa; quais peças de impresso; página de captação × site × loja | `identidade-visual.yml`, `material-impresso.yml`, `site-e-loja-virtual.yml` |
| B | **Primeiros 30, 60 e 90 dias** de tráfego pago, redes sociais e rastreamento | os 3 arquivos de serviço |
| B | **Redes sociais:** quantos posts e stories por mês e em quais redes; quem responde comentários e direct; foto e vídeo inclusos ou à parte; dá para contratar só redes sociais? | `redes-sociais.yml` |
| B | **Rodadas de ajuste incluídas e formatos entregues** (vetor, PNG, PDF, arquivos abertos) | `identidade-visual.yml`, `material-impresso.yml`, `site-e-loja-virtual.yml` |
| B | **Site e loja:** plataforma da loja virtual; o cliente consegue editar e cadastrar produtos sozinho? Hospedagem, domínio e manutenção inclusos ou à parte? | `site-e-loja-virtual.yml` |
| B | **Prazos típicos** de identidade visual, impresso (por peça) e site/loja | os arquivos de serviço |
| B | **O que pedimos no início** (fotos, catálogo, margens, acessos, dados de venda) | os arquivos de serviço |
| C | **Troca de agência:** como é a transição (acessos, histórico, prazo) | `faq.yml` |
| C | **"Para quem não é"**: outros critérios de quem não é cliente ideal | os 6 arquivos de serviço |
| C | Impresso: quem escreve os textos das peças e quem fala com a gráfica | `material-impresso.yml` |
| C | Rastreamento: há conferência periódica depois de configurado? Em qual ferramenta fica o painel e como o cliente acessa? | `rastreamento-e-relatorio.yml` |
| C | Prazo real de resposta: o site diz "até 1 dia útil" (padrão do PROMPT). Está certo? | `home.yml` |

## 2. Equipe: quem faz o quê

| Prio. | Pergunta | Onde |
|---|---|---|
| B | Natália e Vinicius participam do início de cada projeto e da reunião mensal? (frase "você fala com quem executa") | `home.yml`, `paginas/sobre.yml` |
| B | Responsável principal por material impresso (Vinicius?), site e loja, e rastreamento (Natália? Derek?) | os arquivos de serviço, campo `quem_faz` |
| C | Em redes sociais: divisão entre arte (Vinicius) e comunicação (Derek) | `redes-sociais.yml` |
| B | **Fotos da equipe:** a identificação foi deduzida pela ordem das fotos enviadas (1 Natália, 2 Vinicius, 3 Derek). Confira no site. A foto da Natália é pequena (417 × 533 px); uma maior fica melhor | `src/assets/img-src/equipe/` |

## 3. Jurídico e cadastro

| Prio. | Pergunta | Onde |
|---|---|---|
| A | **Razão social, CNPJ e nome do encarregado de dados (DPO)** para a Política de Privacidade. A política é um rascunho: peça uma revisão jurídica | `paginas/privacidade.yml` |
| B | Prazo de guarda dos pedidos do formulário (o rascunho diz 24 meses) | `paginas/privacidade.yml` |

## 4. Imagens e licenças

| Prio. | Pergunta | Onde |
|---|---|---|
| A | **Portfólio:** as 8 imagens são ilustrativas. Troque por trabalhos reais e autorizados quando puder | `src/content/portfolio.yml` + `src/assets/img-src/portfolio/` |
| B | **Cases:** os 3 da home são exemplos (você pediu para manter). Para virarem cases reais com página própria, preencha os campos descritos em `cases.yml` e marque `aprovado: true` | `src/content/cases.yml` |
| B | Licença de uso das fotos do banner, dos bastidores e da 404 (vieram do site anterior e do manual) | `docs/ASSETS.md` |
| B | **Fontes pagas:** a Integral CF precisa de **licença para web** (webfont) da Connary Fagen; a Retro Computer precisa de **permissão por escrito** do autor (Petyka) para uso comercial na web. Com os arquivos em mãos, siga `docs/EDITAR.md`, seção 5 | `src/assets/fonts/licenciadas/` |

## 5. Contas e IDs (rastreamento e Google)

Campos vazios ficam desligados. Preencha quando tiver (passo a passo em `docs/TRACKING.md` e `docs/SEO.md`):

| Campo | O que é |
|---|---|
| `GTM_ID` | Contêiner do Google Tag Manager (GTM-XXXXXXX). Com ele, o aviso de cookies passa a aparecer. Há um contêiner pronto para importar: `gtm-container.json` |
| `GA4_ID`, `META_PIXEL_ID` | Só se não usar o GTM |
| `GADS_CONVERSION_ID`, `GADS_CONVERSION_LABEL` | Conversão do Google Ads (configurada pelo GTM) |
| `GBP_URL` | Link do Perfil da Empresa no Google |
| `SCHEDULING_URL` | Link de agenda (Calendly etc.) para a página de obrigado |

## 6. Servidor (Locaweb)

| Pergunta | Como descobrir |
|---|---|
| Versão do PHP (precisa ser 7.4 ou mais nova) | Painel da Locaweb → Hospedagem → PHP |
| O PHP consegue ler e gravar fora do `public_html`? (para a senha e os pedidos ficarem fora da pasta pública) | Siga `docs/DEPLOY.md`, seção 3 |
| SSL ativo para `olorin.com.br` e `www.olorin.com.br` | Painel → SSL; depois ative o bloco de HTTPS (`docs/DEPLOY.md`, seção 4) |

## 7. Depois de publicar

- Medir o site novo no PageSpeed e atualizar a frase da página Site e loja virtual que cita a nota do **site anterior** (97/100/100/100 em 08/10/2026). Arquivo `servicos/site-e-loja-virtual.yml`.
