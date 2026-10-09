# Conteúdo: voz, fatos e legibilidade

## Resumo

- Todo texto vem de `src/content/` (ver `docs/EDITAR.md`). Nenhum número, cliente, prazo ou processo foi inventado: o que faltava ficou como `[CONFIRMAR: ...]`, que **não vai ao ar** (lista em `docs/CONTENT-TODO.md`, ou rode `npm run pendencias`).
- Voz: sempre "nós"; jeito de dono de negócio falar ("não sei quanto custou cada venda"); nada de "garantido", "o melhor" ou "100% de resultado" (o único "100%" é "atendimento 100% remoto"); sem urgência artificial nem comparação com concorrentes.
- Termos técnicos (ROAS, pixel, GTM, briefing) são explicados na primeira vez em que aparecem em cada página.
- Os 3 cases da home e as 8 imagens do portfólio são **exemplos** mantidos a pedido do dono (08/10/2026) até serem trocados por trabalhos reais. O relatório da home é rotulado como "Exemplo ilustrativo, com dados fictícios".
- Os números da seção Resultados (R$2M+ de verba gerida, 50+ marcas, 2x de retorno médio, 100+ peças por mês) foram informados pelo dono em 08/10/2026 (`src/content/claims.json`).

## Fontes dos fatos

| Fato | Fonte |
|---|---|
| Serviços, preços dos planos (R$ 800, R$ 2.500, R$ 5.000), verba recomendada (R$ 1.500), contrato mínimo de 3 meses, aviso de 30 dias, sem multa | `PROMPT.md`, seções 2 e 12.5 |
| Equipe (Natália, Vinicius, Derek), funções e experiência | `PROMPT.md`, seção 2; `src/content/equipe.yml` |
| Prazos de primeiros sinais (2 a 4 semanas em resposta direta; 2 a 3 meses em marca) | `PROMPT.md`, seções 9.4 e 12.6 |
| Atendimento remoto, Curitiba, WhatsApp, e-mail, Instagram | `PROMPT.md`, seção 2; `src/_data/site/config.json` |
| Medição do site anterior no PageSpeed (97/100/100/100 em 08/10/2026) | `PROMPT.md`, seções 0.2 e 9.4 (atualizar com a medição do site novo depois de publicar) |
| Números da seção Resultados | Dono, 08/10/2026 |

## Legibilidade

Índice de Flesch adaptado ao português (Martins et al., 1996): `248,835 − 1,015 × (palavras/frase) − 84,6 × (sílabas/palavra)`. Faixas: 75–100 muito fácil · 50–75 fácil · 25–50 difícil · 0–25 muito difícil. Meta do PROMPT: "fácil" a "razoavelmente fácil" e média de até 18 palavras por frase. Medido sobre o texto visível do conteúdo principal de cada página (sem menu, rodapé e formulário) com `npm run legibilidade`.

| Página | Palavras | Palavras/frase | Sílabas/palavra | Índice | Faixa |
|---|---:|---:|---:|---:|---|
| `/` | 1463 | 8.6 | 1.94 | 76 | muito fácil |
| `/politica-de-privacidade/` | 482 | 10.3 | 2.07 | 63 | fácil |
| `/promo/identidade-visual/` | 385 | 9.4 | 1.90 | 79 | muito fácil |
| `/promo/` | 331 | 8.1 | 1.89 | 81 | muito fácil |
| `/promo/material-impresso/` | 420 | 9.3 | 1.97 | 73 | fácil |
| `/promo/rastreamento-e-relatorio/` | 402 | 9.8 | 1.89 | 79 | muito fácil |
| `/promo/redes-sociais/` | 430 | 10.2 | 1.80 | 87 | muito fácil |
| `/promo/site-e-loja-virtual/` | 456 | 10.4 | 1.86 | 81 | muito fácil |
| `/promo/trafego-pago/` | 400 | 9.8 | 1.86 | 82 | muito fácil |
| `/servicos/identidade-visual/` | 1159 | 10.8 | 1.85 | 81 | muito fácil |
| `/servicos/` | 392 | 7.5 | 2.08 | 65 | fácil |
| `/servicos/material-impresso/` | 1340 | 10.2 | 1.94 | 74 | fácil |
| `/servicos/rastreamento-e-relatorio/` | 1263 | 10.4 | 1.91 | 76 | muito fácil |
| `/servicos/redes-sociais/` | 1142 | 10.1 | 1.80 | 87 | muito fácil |
| `/servicos/site-e-loja-virtual/` | 1441 | 11.7 | 1.87 | 79 | muito fácil |
| `/servicos/trafego-pago/` | 1059 | 9.8 | 1.93 | 76 | muito fácil |
| `/sobre/` | 418 | 9.5 | 1.98 | 71 | fácil |
| **Site todo** | 12983 | 9.9 | 1.91 | 78 | muito fácil |

**Resultado:** todas as páginas na faixa fácil ou muito fácil, com média de 7,5 a 11,7 palavras por frase (meta: até 18).

### Frases longas (mais de 25 palavras)

Não são erro, mas são as primeiras candidatas a quebrar em duas numa revisão. As de páginas de campanha repetem as da página do serviço (é o mesmo texto).

- `/` — 33 palavras: Todo mês você recebe um relatório fechado que mostra quanto foi investido, quanto voltou em faturamento, quanto custou cada venda e qual foi…
- `/politica-de-privacidade/` — 34 palavras: Esta política explica como a Olorin Digital trata os dados pessoais de quem visita o site olorin.com.br e pede orçamento, de acordo com a Le…
- `/politica-de-privacidade/` — 40 palavras: Origem da visita: parâmetros de campanha (utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, gbraid, wbraid e fbclid), a pá…
- `/politica-de-privacidade/` — 29 palavras: Os demais só são ativados depois da sua escolha no aviso de cookies, que tem três opções com o mesmo peso — Aceitar tudo, Recusar e Personal…
- `/promo/identidade-visual/` — 26 palavras: Identidade visual é o conjunto que dá cara à sua marca: o logotipo, as cores, as fontes e o manual que explica como usar tudo isso.
- `/promo/identidade-visual/` — 26 palavras: O Vinicius Mafra, diretor de arte e designer há mais de 10 anos, que já esteve à frente de projetos de influenciadores digitais a produções …
- `/promo/rastreamento-e-relatorio/` — 26 palavras: Rastreamento é deixar o seu site e as suas contas de anúncio contando o que acontece depois do clique: quem visitou, quem chamou e quem comp…
- `/promo/rastreamento-e-relatorio/` — 28 palavras: São os códigos que registram o que a pessoa faz depois do clique no anúncio ou da visita ao site: se chamou, se fez cadastro ou se comprou.
- `/promo/redes-sociais/` — 26 palavras: Está inclusa na Gestão mensal, que junta tráfego pago e conteúdo por R$ 2.500/mês (verba de anúncio à parte), e no 360 completo, por R$ 5.00…
- `/promo/redes-sociais/` — 26 palavras: Quando as redes andam junto com o tráfego pago, as campanhas de resposta direta (venda e mensagem) costumam dar sinais claros em 2 a 4 seman…
- `/promo/site-e-loja-virtual/` — 28 palavras: Criamos site institucional, loja virtual e página de captação, todos rápidos e bonitos no celular e preparados para converter — ou seja, par…
- `/promo/site-e-loja-virtual/` — 31 palavras: Para ter uma referência, o site anterior da própria Olorin foi medido no PageSpeed — a ferramenta do Google que dá notas de 0 a 100 para a q…
- `/promo/site-e-loja-virtual/` — 29 palavras: Em 08/10/2026, no celular, ele tirou 97 em desempenho, 100 em acessibilidade, 100 em práticas recomendadas e 100 em SEO (o que ajuda o Googl…
- `/promo/trafego-pago/` — 28 palavras: Gestão de tráfego pago é cuidar das campanhas de Meta Ads e Google Ads para que o dinheiro investido vire venda, mensagem ou cadastro — e nã…
- `/servicos/identidade-visual/` — 26 palavras: Logotipo, manual de marca, papelaria e todo o material visual, criados pelo mesmo time que faz o seu anúncio, o seu site e o seu impresso.
- `/servicos/identidade-visual/` — 26 palavras: Identidade visual é o conjunto que dá cara à sua marca: o logotipo, as cores, as fontes e o manual que explica como usar tudo isso.
- `/servicos/identidade-visual/` — 30 palavras: Se seguir com a gente na Gestão mensal ou no 360 completo, o mesmo time aplica a marca em tudo, e o relatório mostra todo mês o que está vol…
- `/servicos/identidade-visual/` — 26 palavras: O Vinicius Mafra, diretor de arte e designer há mais de 10 anos, que já esteve à frente de projetos de influenciadores digitais a produções …
- `/servicos/rastreamento-e-relatorio/` — 26 palavras: Rastreamento é deixar o seu site e as suas contas de anúncio contando o que acontece depois do clique: quem visitou, quem chamou e quem comp…
- `/servicos/rastreamento-e-relatorio/` — 27 palavras: Os números de anúncio e de site num lugar só — investimento, faturamento atribuído (o que entrou de venda e veio das campanhas), custo por v…
- `/servicos/rastreamento-e-relatorio/` — 28 palavras: São os códigos que registram o que a pessoa faz depois do clique no anúncio ou da visita ao site: se chamou, se fez cadastro ou se comprou.
- `/servicos/redes-sociais/` — 26 palavras: Está inclusa na Gestão mensal, que junta tráfego pago e conteúdo por R$ 2.500/mês (verba de anúncio à parte), e no 360 completo, por R$ 5.00…
- `/servicos/redes-sociais/` — 26 palavras: Quando as redes andam junto com o tráfego pago, as campanhas de resposta direta (venda e mensagem) costumam dar sinais claros em 2 a 4 seman…
- `/servicos/site-e-loja-virtual/` — 28 palavras: Criamos site institucional, loja virtual e página de captação, todos rápidos e bonitos no celular e preparados para converter — ou seja, par…
- `/servicos/site-e-loja-virtual/` — 27 palavras: 01 O anúncio leva a pessoa até o site, mas a página demora a abrir no celular — e ela desiste antes de ver o que você vende.
- `/servicos/site-e-loja-virtual/` — 27 palavras: No briefing, combinamos o escopo, o prazo e o papel de cada página: o que ela precisa dizer, para quem e qual ação a pessoa deve tomar.
- `/servicos/site-e-loja-virtual/` — 28 palavras: Se você seguir com a gente na Gestão mensal ou no 360 completo, o relatório fechado todo mês mostra quanto entrou, quanto saiu e qual foi o …
- `/servicos/site-e-loja-virtual/` — 31 palavras: Para ter uma referência, o site anterior da própria Olorin foi medido no PageSpeed — a ferramenta do Google que dá notas de 0 a 100 para a q…
- `/servicos/site-e-loja-virtual/` — 29 palavras: Em 08/10/2026, no celular, ele tirou 97 em desempenho, 100 em acessibilidade, 100 em práticas recomendadas e 100 em SEO (o que ajuda o Googl…
- `/servicos/trafego-pago/` — 28 palavras: Gestão de tráfego pago é cuidar das campanhas de Meta Ads e Google Ads para que o dinheiro investido vire venda, mensagem ou cadastro — e nã…
- `/servicos/trafego-pago/` — 32 palavras: Todo mês você recebe um relatório fechado com o que foi investido, quanto voltou em faturamento, quanto custou cada venda e qual foi o retor…
