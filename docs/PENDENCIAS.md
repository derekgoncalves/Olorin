# Pendências do site Olorin (versão final, 14/10/2026)

O site vai ao ar completo. Onde faltava informação, ele mostra um **texto proposto**, uma **imagem ilustrativa** ou um espaço **"Sua marca aqui"**. Nada fica escondido e nenhum número, depoimento ou cliente foi inventado. Esta lista diz o que confirmar e onde trocar.

- No código, cada item está marcado com `# PENDENTE:` no arquivo indicado. Para ver a lista com arquivo e linha exatos, rode `npm run pendencias`.
- **Para responder:** mande as respostas no chat do projeto (o Claude atualiza os arquivos e gera um zip novo) ou edite o arquivo indicado seguindo o `docs/EDITAR.md` e rode `npm run build`.
- **Prioridade:** A = mexe com preço, contrato ou dado legal; B = deixa a página completa; C = detalhe.

## 1. Preços e contratos

| Prio. | O que confirmar | O que está no ar hoje | Onde |
|---|---|---|---|
| A | Serviço avulso (a partir de R$ 1.500/mês cada): tem contrato mínimo de 3 meses? Tem taxa de implantação? | "Nos formatos mensais, o contrato mínimo é de 3 meses. Depois, segue mês a mês…" (sem taxa no avulso) | `planos.yml`, `faq.yml`, `servicos/trafego-pago.yml` |
| A | Dados (rastreamento) contratado sozinho: preço e contrato mínimo | "Sozinho, a partir de R$ 1.500/mês" | `servicos/rastreamento-e-relatorio.yml` |
| A | Titularidade: as contas de anúncio, o domínio, a hospedagem e os arquivos ficam no nome do cliente? | "Você. As contas de anúncio, o domínio e o site ficam no nome da sua organização…" | `faq.yml`, `servicos/trafego-pago.yml`, `servicos/site-e-loja-virtual.yml` |
| B | Marketing 360: "Prioridade na fila de criação" é um diferencial real? | Aparece na lista do plano | `planos.yml` |
| B | Identidade visual: o que entra em cada faixa de preço (o que entra nos R$ 800) | "Projeto a partir de R$ 800" | `servicos/identidade-visual.yml` |
| B | Impressos: R$ 800 é uma peça ou um pacote? Valores de pacotes maiores | "A partir de R$ 800" | `servicos/material-impresso.yml` |
| B | Sites: o que fica de fora (domínio, hospedagem, plataforma da loja, manutenção) e quem escreve os textos | Lista "Não inclui" proposta | `servicos/site-e-loja-virtual.yml` |
| C | Troca de agência: como é a transição (acessos, histórico, prazo) | Resposta proposta na dúvida "Já tenho agência" | `faq.yml` |

**Arranque 30 dias.** Saiu da grade de planos, como você pediu. Recomendação: deixar fora por enquanto. Se quiser trazer de volta, use um banner separado na página de Planos com **R$ 3.500 em pagamento único** (a implantação de R$ 1.000 + o primeiro mês da Gestão mensal de R$ 2.500), acima dos R$ 2.500 da Gestão, como pede o molde de preços.

## 2. Como cada serviço funciona

| Prio. | O que confirmar | Onde |
|---|---|---|
| B | Ritmo dos primeiros 90 dias de tráfego pago, redes sociais e dados | os 3 arquivos em `servicos/` |
| B | Prazos típicos: identidade visual (e rodadas de ajuste), impressos, site, loja virtual e página de captação | `identidade-visual.yml`, `material-impresso.yml`, `site-e-loja-virtual.yml` |
| B | Redes sociais no avulso: quantas publicações por mês e se stories e Reels entram | `servicos/redes-sociais.yml` |
| B | O que pedimos no início do tráfego pago e quais dados de venda entram no relatório | `trafego-pago.yml`, `rastreamento-e-relatorio.yml` |
| C | Ferramenta do painel (proposta: Looker Studio, gratuito) e frequência de atualização | `servicos/rastreamento-e-relatorio.yml` |

## 3. Time

| Prio. | O que confirmar | Onde |
|---|---|---|
| B | Quem coordena cada frente. Hoje: Tráfego pago = Natália; Redes sociais = Vinicius e Derek; Identidade visual = Vinicius; Impressos = Vinicius; Sites = Vinicius e Derek; Dados = Natália e Derek. Os perfis de cada pessoa listam as frentes a partir daqui | campo `quem_faz` de cada arquivo em `servicos/` |
| B | Natália e Vinicius participam do início de cada projeto e das reuniões de planejamento? | `paginas/sobre.yml` |
| B | Cargos: Coordenadora de Mídia Paga, Coordenador de Design e Coordenador de Atendimento | `equipe.yml` |
| C | Links de LinkedIn e Instagram de cada pessoa, se quiserem mostrar no perfil | `equipe.yml` (campo `redes`) |
| C | Foto da Natália: a original é pequena (417 × 533 px). Uma de pelo menos 900 × 1125 px fica melhor | `src/assets/img-src/equipe/` |

## 4. Cases, logos e portfólio

| Prio. | O que mandar | Onde |
|---|---|---|
| A | Cases iZETA e Anacleto Abduch: o que a Olorin fez, o resultado (número, período e como foi medido) e a autorização para mostrar | `cases.yml` |
| A | Logos reais (SVG) da iZETA e do Anacleto Abduch. Hoje são letreiros feitos com o nome | `clientes.yml` |
| B | Até 6 logos de outros clientes autorizados (substituem as vagas "Sua marca aqui") | `clientes.yml` |
| A | Portfólio: as 8 imagens são ilustrativas. Trocar por trabalhos reais e autorizados (título, serviço e imagem) | `portfolio.yml` |

## 5. Jurídico e cadastro

| Prio. | O que confirmar | Onde |
|---|---|---|
| A | Razão social e CNPJ. Hoje a política diz que são informados a quem pedir pelo e-mail | `paginas/privacidade.yml` |
| A | Encarregado pelo tratamento de dados (DPO). Proposta no ar: Derek Gonçalves | `paginas/privacidade.yml` |
| B | Prazo de guarda dos pedidos do formulário (no ar: até 24 meses após o último contato) | `paginas/privacidade.yml` |
| B | Revisão da política por um advogado (recomendado) | `paginas/privacidade.yml` |

## 6. Contas e IDs de medição (quando tiver)

Campos vazios ficam desligados. Ficam em `src/_data/site/config.json` e pedem um build novo (o passo a passo está em `docs/TRACKING.md`).

| Campo | O que é |
|---|---|
| `GTM_ID` | Contêiner do Google Tag Manager (GTM-XXXXXXX). Com ele, o aviso de cookies passa a aparecer |
| `GA4_ID`, `META_PIXEL_ID` | Só se não usar o GTM |
| `GADS_CONVERSION_ID`, `GADS_CONVERSION_LABEL` | Conversão do Google Ads no envio do formulário |
| `SCHEDULING_URL` | Link de agenda (Calendly ou Google Agenda), que aparece na página de obrigado |
| `GBP_URL` | Link do Perfil da Empresa no Google (Google Meu Negócio) |

## 7. O que dá para trocar só pelo WebFTP (sem build novo)

Suba o arquivo novo **com o mesmo nome**, na mesma pasta, substituindo o antigo. Textos, preços e menus ficam dentro das páginas e precisam de build novo.

| No servidor (dentro de `public_html`) | O que é | Como deve ser |
|---|---|---|
| `assets/img/clientes/izeta.svg` e `assets/img/clientes/anacleto-duas-linhas.svg` | Logos da faixa de clientes | SVG, de preferência com o desenho em uma cor só e cerca de 48 px de altura |
| `assets/img/clientes/vaga-01.svg` e `vaga-02.svg` | Espaços "Sua marca aqui" | SVG do logo do cliente. O nome lido pelo leitor de tela só muda com build novo |
| `assets/img/og/*.jpg` | Imagens que aparecem quando alguém compartilha o link | JPG de 1200 × 630 px |
| Fotos do portfólio, por exemplo `assets/img/portfolio-marca-identidade-300.avif` | Cada foto tem 4 arquivos: AVIF e WebP, em 2 larguras (300 e 600 px; a de redes tem 320 e 640) | Os 4 com o mesmo nome e a **mesma proporção** da foto atual. Mais fácil: mande as fotos e o Claude gera o pacote |
| Fotos do time, por exemplo `assets/img/equipe-derek-480.webp` | Cada pessoa tem a foto 4:5 (em 3 ou 4 larguras, de 320 a 660 px) e a quadrada (160 e 320 px), em AVIF e WebP | Mesma regra das fotos do portfólio |
| `favicon.ico` | Ícone da aba do navegador | ICO de 32 × 32 px |
