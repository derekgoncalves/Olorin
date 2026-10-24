# Pendências do site Olorin (versão final, 23/10/2026)

O site vai ao ar completo. Onde ainda falta um arquivo ou uma confirmação, ele mostra um **texto proposto** ou um **material provisório**, e nada fica escondido. Nenhum número, depoimento ou cliente foi inventado. Esta lista diz o que falta e onde trocar.

- No código, cada item está marcado com `# PENDENTE:` no arquivo indicado. Para ver a lista com arquivo e linha exatos, rode `npm run pendencias`.
- **Para responder:** mande as respostas no chat do projeto (o Claude atualiza os arquivos e gera um zip novo) ou edite o arquivo indicado seguindo o `docs/EDITAR.md` e rode `npm run build`.
- **Prioridade:** A = mexe com contrato ou dado legal; B = deixa a página completa; C = detalhe.

## 1. Arquivos para mandar

| Prio. | O que mandar | Onde |
|---|---|---|
| B | Originais das 7 artes do Behance do Vinicius (BRAVO, Ambulatório da M.O.D.A, Bença, Viva Sem Veneno, Cartas para o Futuro, TORO AUDIO e Governo do RS). Hoje são recortes do PDF | `portfolio.yml` e `src/assets/img-src/portfolio/` |
| B | Serviço feito para a National Geographic (hoje o card do portfólio diz só "Marca atendida") e arte ou logo da Harmonia do Pet (hoje card provisório só com o nome) | `portfolio.yml` |
| C | Logos oficiais em vetor do BRAVO Film Festival e do Governo do Estado do RS. Hoje foram vetorizados a partir das artes | `clientes.yml` |
| C | Foto maior da Natalia (a original tem 417 × 533 px; o ideal é pelo menos 900 × 1125 px) | `src/assets/img-src/equipe/` |

## 2. Conferir o que entrou em 23/10/2026

| Prio. | O que conferir | Onde |
|---|---|---|
| A | "Agência parceira Meta e Google": o site agora diz que a parceria é da agência (antes era da Natalia). Confirme que o cadastro de parceiro está no nome da Olorin | `home.yml` → `resultados.credencial`, `servicos/trafego-pago.yml` e `rastreamento-e-relatorio.yml` → `credencial` |
| B | "+2x de retorno*" com a nota "*Resultados variam de cliente a cliente.": fonte "dono, 23/10/2026". Vale guardar a base do número (clientes, período, conta) | `claims.json` |
| B | Política de privacidade (23/10/2026): descreve o modo de consentimento (GA4 e GTM carregam com tudo negado e o Pixel só com o aceite de marketing). Se a medição mudar, mude o texto junto | `paginas/privacidade.yml` |

## 3. Textos propostos que valem conferir

| Prio. | O que confirmar | Onde |
|---|---|---|
| C | Troca de agência: como é a transição (acessos, histórico, prazo) | `faq.yml` |
| C | Calendário de captação da Olorin Educação: trocar título e texto a cada temporada (de março a agosto, algo como "Comece cedo.") | `paginas/educacao.yml` |

## 4. Jurídico e cadastro

A política de privacidade, o aviso de cookies e os textos de contrato foram revisados pelo Claude com base na LGPD e no Código de Defesa do Consumidor. Não substitui um advogado, mas não há pendência aberta além destas:

| Prio. | O que decidir | Onde |
|---|---|---|
| A | Razão social no site. O CNPJ já aparece no rodapé (`config.json` → `CNPJ`); o Decreto 7.962/2013 pede também o nome empresarial visível | `src/_data/site/config.json` → `NOME` |
| A | Direito de arrependimento: quem contrata pela internet pode desistir em até 7 dias e receber de volta o que pagou. A FAQ já explica. Sugestão: cobrar a implantação só depois do 7º dia, ou começar o trabalho com o cliente ciente disso por escrito | `faq.yml` |
| A | HTTPS ativo na Locaweb (o cadeado). O formulário e o aviso de cookies dependem dele | painel da Locaweb |
| B | Ao criar as contas de anúncio, deixar **desligadas** a correspondência avançada da Meta e as conversões otimizadas do Google. O site não envia e-mail nem telefone para elas, e a política diz isso | Gerenciador de Eventos e Google Ads |

## 5. Contas e IDs de medição (quando tiver)

Os IDs ficam no arquivo `olorin-ids.js`, na raiz do `public_html`, e podem ser preenchidos **pelo WebFTP com o site no ar, sem build novo**. Campo vazio fica desligado, e o aviso de cookies aparece sozinho quando há algum ID. Passo a passo em `COMO-PUBLICAR-final.txt` e em `docs/TRACKING.md`, seção 2.

| Campo | O que é |
|---|---|
| `GTM_ID` | Contêiner do Google Tag Manager (GTM-XXXXXXX). Com ele, GA4 e Pixel ficam configurados dentro do GTM |
| `GA4_ID`, `META_PIXEL_ID` | Só se não usar o GTM |
| `GADS_CONVERSION_ID`, `GADS_CONVERSION_LABEL` | Conversão do Google Ads no envio do formulário |
| `SCHEDULING_URL` | Link de agenda (Calendly ou Google Agenda), que aparece na página de obrigado |

O link do Perfil da Empresa no Google (`GBP_URL`) fica em `src/_data/site/config.json` e pede build novo.

## 6. O que dá para trocar só pelo WebFTP (sem build novo)

Suba o arquivo novo **com o mesmo nome**, na mesma pasta, substituindo o antigo. Textos e menus ficam dentro das páginas e precisam de build novo.

| No servidor (dentro de `public_html`) | O que é | Como deve ser |
|---|---|---|
| `olorin-ids.js` | IDs de medição e link de agenda | Edite só o que está entre as aspas. Ao subir um zip novo, guarde o seu antes e envie de volta depois |
| `assets/img/clientes/*.svg` (por exemplo `central-sul-moveis.svg`) | Logos da faixa "Marcas que o nosso time já atendeu" | SVG em preto, fundo transparente e sem margem. A altura se mantém e a largura segue a proporção |
| `assets/img/clientes/izeta-cor.svg` e `anacleto-cor.svg` | Logos coloridos da Olorin Educação | SVG com o mesmo nome |
| `assets/img/og/*.jpg` | Imagens que aparecem quando alguém compartilha o link | JPG de 1200 × 630 px |
| Fotos do portfólio, por exemplo `assets/img/portfolio-benca-480.avif` | Cada trabalho tem 8 arquivos: AVIF e WebP em 320, 480, 640 e 860 px de largura, na proporção 4:5 | Os 8 com o mesmo nome. Mais fácil: mande as imagens e o Claude gera o pacote |
| Fotos do time, por exemplo `assets/img/equipe-derek-480.webp` | Cada pessoa tem a foto 4:5 (de 320 a 660 px) e a quadrada (160 e 320 px), em AVIF e WebP | Mesma regra das fotos do portfólio |
| `favicon.ico` | Ícone da aba do navegador | ICO de 32 × 32 px |

## Resolvido em 23/10/2026

Saíram do site os preços, planos, mensalidades, "a partir de" e a "expectativa de investimento"; a calculadora virou um bilhete de orçamento que vai pelo WhatsApp; o menu ganhou Segmentos (Educação e Influenciadores) e o rodapé também; os 3 itens com check são os mesmos em todas as páginas (`selos.yml`); o lema novo "Sua marca em outro nível." entrou no lugar de "Do clique ao cliente"; a montagem do celular foi para Redes sociais; as imagens de compartilhamento da home, da Educação, de Quem somos e a nova de Influenciadores foram refeitas.

## Resolvido em 14/10/2026

Preços (Gestão mensal R$ 3.000, implantação de R$ 1.000, contrato mínimo de 3 meses, Dados sem implantação), prazos, cargos e quem coordena cada frente, redes sociais em criativos, portfólio só com trabalhos reais, logos dos clientes, cases sem resultado, política de privacidade, IDs editáveis pelo WebFTP e o blog.
