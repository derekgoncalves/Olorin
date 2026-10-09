# Benchmark de sites de agência · Olorin Digital

> **Data da pesquisa:** 08/10/2026 · **Base:** PROMPT.md, seção 4 · **Escopo:** 21 sites (10 referências internacionais da tabela 4.1, 3 referências brasileiras e 8 agências de Curitiba).
> **Regra deste documento:** nada foi copiado de terceiros. Rótulos de botão aparecem entre aspas só como fato observado e não serão reaproveitados no site. Tudo o que não pude conferir está marcado como **não verificado**. Os números das agências são **declarados por elas mesmas** e não foram conferidos por mim.

---

## Resumo

1. **Nenhum dos 21 sites pôde ser aberto diretamente.** Tudo o que está aqui veio de resultados de busca. Por isso, a posição do formulário, o texto exato do botão principal e o layout ficaram **não verificados** na maioria dos sites.
2. **Preço aberto continua sendo um diferencial real.** Entre os 11 sites brasileiros, nenhum publica a mensalidade de gestão completa. O máximo encontrado foi um valor "a partir de" (Lab Growth) e um valor citado no FAQ (BUS Digital).
3. **Diagnóstico gratuito não diferencia sozinho.** Quatro das 8 agências de Curitiba oferecem diagnóstico ou consultoria gratuita. O que diferencia é dizer o que a pessoa recebe, e só uma delas (Miura) faz isso.
4. **A prova é quase toda autodeclarada.** Cases com cliente, número e período são raros (NP Digital, Ignite, Fresh Lab). Rankings feitos pela própria agência, títulos com "#1" ou "melhor", paredes de selos e páginas em massa por cidade são comuns e devem ser evitados.
5. **Das 11 decisões da tabela 4.1:** 7 confirmadas (3 delas com ajuste), 1 confirmada no princípio mas ajustada por decisão do dono (números e cases), 1 rebaixada a hipótese de teste A/B (formulário na primeira dobra) e 2 mantidas sem verificação da fonte (Unbounce e COLLINS).

---

## 1. Método

### 1.1 Seleção dos sites

| Grupo | Critério | Sites |
|---|---|---|
| Referências internacionais | Tabela 4.1 do PROMPT | Hook Agency, SmartSites, Scorpion, NoGood, True North Social, Ignite Visibility, Animalz, Digital Silk, Strictly Plumbers, COLLINS |
| Referências brasileiras | Texto abaixo da tabela 4.1 | V4 Company, Agência Mestre, NP Digital Brasil |
| Agências de Curitiba | 5 primeiras de cada consulta (seção 4.2) | iLuck, Fresh Lab, Azempresas, Lab Growth, BUS Digital, FourAds, Realiza Marketing Digital, Agência Miura |

### 1.2 Consultas feitas

- **Ferramenta:** WebSearch do Claude Code, no modo padrão e no modo estendido, com buscas restritas ao domínio de cada site e buscas abertas. **Não é o Google:** a ferramenta declara resultados dos EUA, não mostra anúncios, e a ordem registrada é a dela, não a da busca do Google no Brasil.
- **Consulta 1, "agência de marketing digital em Curitiba":** o modo padrão trouxe só diretórios e listas (Sortlist, Cronoshare, oHub, Reportei, revenuebase), que descartei. No modo estendido, a ordem foi: 1 iLuck, 2 Fresh Lab, 3 Azempresas, 4 Lab Growth, 5 BUS Digital. Depois vieram Booom Criative, Lunaweb, Alper e Nectarina, que não analisei.
- **Consulta 2, "gestão de tráfego pago Curitiba":** o modo padrão trouxe só vagas de emprego e notícias de trânsito. No modo estendido, a ordem foi: 1 Fresh Lab (repetida), 2 Lab Growth (repetida), 3 FourAds, 4 Realiza, 5 Miura. Depois vieram Mesa Performance, HSG, SPOT MKT e Rocket Mídia, que não analisei.
- **Resultado:** 8 agências únicas de Curitiba. Não completei a consulta 2 com mais 2 agências novas; se quiserem 10 únicas, as próximas da lista são Mesa Performance e SPOT MKT.

### 1.3 Limitações de acesso (leia antes de usar)

**Todos os 21 sites estavam inacessíveis e foram avaliados só por resultados de busca.** Nenhuma página foi lida diretamente.

| Grupo | WebFetch | curl pelo proxy | O que sobrou |
|---|---|---|---|
| Internacionais (10 sites) | Falhou em todos (`getaddrinfo ENOTFOUND`) | 403 no CONNECT em todos, inclusive nos espelhos `web.archive.org` e `r.jina.ai` | Trechos e resumos do WebSearch |
| Brasileiras (3 sites) | Falha de DNS em `v4company.com`, `www.v4company.com`, `www.agenciamestre.com`, `npdigital.com` e `neilpatel.com` | 403 em `v4company.com`, `agenciamestre.com`, `neilpatel.com` e `npdigital.com` | Trechos e resumos do WebSearch |
| Curitiba (8 sites) | Falha de DNS em 7; no domínio da Azempresas, o proxy bloqueou o acesso | 403 no CONNECT em todos os domínios testados, inclusive `web.archive.org` e serviços de leitura | Trechos e resumos do WebSearch estendido, restrito a cada domínio |

**Consequências práticas:**

- **Posição do formulário em relação à primeira dobra** (a parte da página visível sem rolar): não verificada em nenhum site. Na SmartSites há só um indício, pela busca, de que o formulário da home fica mais abaixo.
- **Texto exato do botão principal:** só aparece nos trechos de busca de alguns sites; nos demais, está marcado como não verificado.
- **Layout e visual:** não vistos em nenhum site.
- **Datas:** os trechos vêm de páginas em cache, de datas variadas; alguns têm mais de um ano.
- **Números:** clientes atendidos, verba gerida, notas e percentuais são autodeclarados e não foram conferidos de forma independente.
- **Fontes da tabela 4.1 que não consultei:** o relatório de benchmark de conversão da Unbounce não foi acessado nesta pesquisa.
- **Desempenho:** não medi o PageSpeed dos concorrentes, então não comparo velocidade.

**Recomendação ao dono:** refazer as duas consultas no Google, num navegador do Brasil, em aba anônima, anotando os anúncios e as 5 primeiras agências orgânicas; e abrir a home da SmartSites, da Scorpion e da Hook para conferir o que ficou não verificado na seção 4.

---

## 2. Sites analisados

### 2.1 Referências internacionais

#### 2.1.1 Hook Agency · hookagency.com

| Campo | Registro |
|---|---|
| Acesso | Só busca. Foram indexadas a home, `/pricing/`, `/contact-us/`, `/seo/` e posts do blog. |
| Oferta de entrada | Chamada de apresentação de 15 minutos. Se houver encaixe, vem uma reunião estratégica de cerca de 60 minutos por vídeo e, depois dela, a proposta. Público declarado: empresas de serviços residenciais em crescimento, com faturamento a partir de cerca de US$ 3 milhões. |
| CTA principal | Agendar uma chamada ("Book an Intro Call" / "Book a Call"), com link secundário para resultados de clientes. |
| Posição do formulário | Página própria (`/contact-us/`), com campos que qualificam o lead: setor, empresa, site, faturamento atual e origem. Formulário na home: não verificado. |
| Preço | Página `/pricing/` pública, com valor "a partir de" por serviço: SEO local a partir de US$ 2.800/mês; anúncios pagos por clique a partir de US$ 2.000/mês, subindo com a verba; site dividido em 12 parcelas. Admite ser mais cara que muitos concorrentes. O vídeo explicativo citado na 4.1: não verificado. |
| Prova | Página de cases, fotos da equipe e vídeos semanais. Selos e número de avaliações: não verificados. |
| Páginas de serviço | Uma página por serviço e por nicho, com comparação entre agência, equipe interna e agência barata. O FAQ cobre contrato (12 meses, depois mês a mês), cancelamento e prazo de resultado (1 a 3 meses para os primeiros sinais, 6 a 8 para o retorno). |
| Adotar | Preço "a partir de" por serviço, FAQ franco sobre prazo e contrato, e formulário que qualifica por porte e verba. |
| Evitar | Preços que divergem entre a página de preços e posts antigos: a busca encontrou ao menos 4 tabelas diferentes. Preço precisa de fonte única. |

#### 2.1.2 SmartSites · smartsites.com

| Campo | Registro |
|---|---|
| Acesso | Só busca. Trechos da home, de `/ppc-marketing/` e de páginas de setor. |
| Oferta de entrada | Proposta gratuita por escrito, com escopo e valor antes da assinatura; dizem que a implantação é gratuita. Há também uma auditoria gratuita de Google Ads em página própria. |
| CTA principal | Pedir proposta gratuita ("Get a Free Proposal"), com o telefone ao lado e a opção de marcar reunião. |
| Posição do formulário | Pela busca, o formulário da home aparece mais abaixo, sob uma chamada final. **Não confirmei formulário no banner**, então a premissa da 4.1 não foi verificada. Campos: nome, e-mail, telefone, serviços de interesse e comentário, com promessa de resposta em 1 dia útil. A página para organizações sem fins lucrativos usa uma versão em 2 etapas. |
| Preço | Não publica o valor da gestão. Diz apenas que a implantação é gratuita e que a proposta traz escopo e valor. |
| Prova | Nota 4,9 com mais de 2.100 avaliações já no topo; total de receita gerada para clientes; faixa de cases com percentual e nome do cliente; selos de parceiro (Google, Microsoft, Meta e outros); depoimentos com nome. |
| Páginas de serviço | Na página de anúncios pagos, a ordem é: topo com nota e 2 botões (proposta e resultados) → faixa de cases → selos e depoimentos → mensuração (rastreamento desde o primeiro dia, painel do cliente) → tipos de negócio → um bloco por plataforma → analista dedicado → landing pages → mais resultados. O FAQ aparece só em subpáginas. |
| Adotar | Nota e número de avaliações perto do botão principal (quando a Olorin tiver avaliações reais) e prazo de resposta escrito junto do formulário. |
| Evitar | Títulos com "#1" e "melhor", e dezenas de subpáginas quase iguais. É autoelogio, não prova. |

#### 2.1.3 Scorpion · scorpion.co

| Campo | Registro |
|---|---|
| Acesso | Só busca. Home, `/home-services/`, `/hvac/`, mapa do site e páginas de produto. |
| Oferta de entrada | Reunião com especialista para definir o investimento conforme as metas. Não encontrei oferta gratuita específica. |
| CTA principal | Marcar reunião ("Book a Meeting") no cabeçalho, no topo e no fim das páginas, com telefone no cabeçalho. |
| Posição do formulário | Agendamento por formulário ou página de reunião, com telefone, SMS e chat (inclusive com IA) como canais paralelos. A barra fixa com várias opções citada na 4.1: não verificada. |
| Preço | Não publica: diz que o investimento depende das metas. O FAQ informa contrato de 12 meses para tecnologia e SEO, e mês a mês para anúncios. |
| Prova | Nota 4,7/5 com mais de 350 avaliações na página de serviços residenciais, depoimentos com número (como aumento de receita), bloco de resultados com retorno sobre o investimento, página de depoimento por cliente e selo de prêmio. |
| Páginas de serviço | Organizadas por setor (serviços residenciais, jurídico, franquias, saúde) e subsetor (encanamento, climatização, telhado e outros). Cada página traz depoimentos curtos, bloco de resultados e o botão de reunião repetido; o FAQ fica no rodapé. |
| Adotar | Páginas escritas na língua de cada setor e o mesmo CTA repetido no topo, no meio e no fim. |
| Evitar | Contrato de 12 meses, preço oculto e plataforma própria que o cliente perde ao sair (segundo a busca, ele leva o conteúdo, não o sistema). |

#### 2.1.4 NoGood · nogood.io

| Campo | Registro |
|---|---|
| Acesso | Só busca. Home, `/services/`, `/results/`, `/contact-us/` e posts do blog. |
| Oferta de entrada | Conversa inicial pela página de contato, que pergunta onde a empresa está e aonde quer chegar. Não encontrei diagnóstico gratuito. |
| CTA principal | Página de contato com título que convida para a conversa ("Let's talk"). Texto do botão principal da home: não verificado. |
| Posição do formulário | Página separada (`/contact-us/`). Formulário na home: não verificado. |
| Preço | Sem tabela. A home diz que trabalha com mensalidade e que a média passa de US$ 20 mil/mês, o que funciona como filtro de porte. |
| Prova | Logos de marcas grandes (Nike, TikTok, MongoDB, Intuit), página `/results/` com cases em percentual e números próprios agregados (como o percentual de clientes que dobraram a receita). Também publica, no próprio blog, rankings em que aparece em 1º lugar. |
| Páginas de serviço | Página central `/services/` com otimização para respostas de IA (AEO/GEO), SEO, anúncios pagos, redes sociais e otimização de conversão (CRO), mais uma página de diretor de marketing terceirizado. O modelo tem nome próprio, "growth squad" (time multidisciplinar montado por cliente), e a home informa o prazo esperado: 90 dias para melhora e 3 a 6 meses no orgânico. |
| Adotar | Dar nome ao modelo de trabalho, dizer quem compõe o time e em quanto tempo esperar resultado. |
| Evitar | Rankings de "melhores agências" no próprio blog com a agência em 1º: parece prova, mas é autoelogio. |

#### 2.1.5 True North Social · truenorthsocial.com

| Campo | Registro |
|---|---|
| Acesso | Só busca. Home, `/contact/`, páginas de serviço, de case e por cidade. |
| Oferta de entrada | Consultoria gratuita por telefone e conversa de descoberta antes de montar a campanha. |
| CTA principal | Agendar a consultoria gratuita por telefone. Um botão de orçamento ("Get a Quote") aparece na página Sobre. |
| Posição do formulário | Página `/contact/` separada, com nome, empresa, e-mail, telefone e descrição do projeto. Formulário na home: não verificado. |
| Preço | Não publica. A página de redes sociais diz que há pacotes para vários orçamentos, indicados depois da conversa. |
| Prova | Depoimentos na home, sem link para avaliações de terceiros. Cada cliente tem página de case com percentuais de engajamento e seguidores, sem linha de base nem período claros. |
| Páginas de serviço | Uma página por serviço (redes sociais, SEO para e-commerce, influenciadores, produção de conteúdo), mais muitas páginas por cidade geradas em série. |
| Adotar | Uma página por serviço e uma URL própria e indexável para cada case. |
| Evitar | Páginas por cidade em massa, quase idênticas, e cases com métrica vaga. A busca também mostrou um erro de copiar e colar entre cases. |

#### 2.1.6 Ignite Visibility · ignitevisibility.com

| Campo | Registro |
|---|---|
| Acesso | Só busca. `/services/seo/`, páginas de setor, páginas de cidade e `/ai-information/`. |
| Oferta de entrada | Proposta gratuita, com retorno por e-mail em 1 dia útil para empresas qualificadas. |
| CTA principal | Pedir proposta gratuita ("Request a Free Proposal") nas páginas de serviço, com telefone e e-mail comercial visíveis. |
| Posição do formulário | Página `/contact/` e botões nas páginas de serviço. Formulário embutido no topo: não verificado. |
| Preço | Faixa em texto: SEO de US$ 2.000 a mais de US$ 10.000/mês; algumas páginas de cidade partem de US$ 3.000. Explica o que faz o valor subir (canais, locais, volume de conteúdo) e diz não exigir contrato longo. |
| Prova | Página de cases com percentual por tipo de cliente, cada um com PDF para baixar. Mostra também prêmio do setor, posição no ranking do Clutch e notas no Clutch e no Google. |
| Páginas de serviço | Serviço, setor e cidade em URLs separadas. A página de SEO descreve o processo (auditoria técnica → busca com IA → palavras-chave → conteúdo), as ferramentas e os painéis de relatório, e tem FAQ. |
| Adotar | Case em PDF para baixar (contexto, período, número) e faixa de preço que explica o que faz o valor subir. |
| Evitar | Excesso de páginas por cidade e "#1" ou "Top agency" nos títulos: para um time de 3 pessoas, soaria falso. |

#### 2.1.7 Animalz · animalz.co

| Campo | Registro |
|---|---|
| Acesso | Só busca. Home, `/services`, `/customers`, `/about` e o subdomínio da ferramenta Revive. |
| Oferta de entrada | Ferramenta gratuita (Revive) que lê o Google Analytics e entrega em até 24 horas a lista de artigos que perderam tráfego. Há também consultoria avulsa e um "sprint" de estratégia. |
| CTA principal | Convite para conversar ("Let's talk") na navegação. |
| Posição do formulário | Página de contato separada e formulário na página de consultoria. Campos: não verificados. |
| Preço | Não publica preço de serviço. Há um post de blog sobre quanto custa conteúdo, que não li. |
| Prova | Números na home (crescimento anual de leads qualificados), página `/customers` com resultado por cliente (visitas, leads, funil de vendas), logos de empresas de software conhecidas e cases longos. |
| Páginas de serviço | `/services` com subpáginas que listam as entregas: pesquisa de palavras-chave, auditorias, estratégia, produção e atualização. A página Sobre mostra as pessoas com o cargo. |
| Adotar | Ferramenta gratuita que demonstra o serviço e qualifica o lead ("mostre, não diga"), e equipe apresentada pelo nome. |
| Evitar | Nenhuma referência de preço: para pequena e média empresa brasileira, isso aumenta o atrito. |

#### 2.1.8 Digital Silk · digitalsilk.com

| Campo | Registro |
|---|---|
| Acesso | Só busca. Home, `/web-design/`, `/services/`, `/before-after/` e um artigo sobre custo. |
| Oferta de entrada | Orçamento gratuito e calculadora gratuita de custo de site. |
| CTA principal | Pedir orçamento gratuito ("Request a Free Quote") no topo da home e das páginas de serviço, com um botão secundário. |
| Posição do formulário | O botão leva a um formulário de orçamento. Formulário embutido na página: não verificado. |
| Preço | Sem tabela, mas com faixas em páginas e artigos (site a partir de cerca de US$ 15 mil; artigo com faixas por tamanho de site). Explica o modelo híbrido (preço fixo por entrega mais hora para customização) e o parcelamento. Os valores não batem entre páginas. |
| Prova | Cases com métrica (conversão, receita, itens adicionados ao carrinho), logos de clientes, parede de prêmios, contagem de projetos, página de antes e depois e depoimentos. |
| Páginas de serviço | A página de criação de sites mostra o processo em 6 etapas (descoberta → arquitetura → design → desenvolvimento → testes → lançamento) e um FAQ objetivo: prazo, mudança de escopo, testes, propriedade do código, hospedagem e retorno. Há dezenas de variações por cidade e setor. |
| Adotar | FAQ que responde objeções concretas (prazo, propriedade, mudança de escopo, o que acontece depois) e página de antes e depois no portfólio. |
| Evitar | Parede de selos e prêmios, e faixas de preço que se contradizem entre páginas. |

#### 2.1.9 Strictly Plumbers · strictlyplumbers.com

| Campo | Registro |
|---|---|
| Acesso | Só busca. Home, página de sites para encanadores, página de contas comerciais, página sobre Yelp e o podcast. |
| Oferta de entrada | Consulta gratuita, com o dono citado como contato. A página de contas comerciais oferece 50% de desconto no 1º mês para quem fecha 6 meses. |
| CTA principal | Pedir consulta gratuita, com telefone em destaque. |
| Posição do formulário | Não verificada; a busca destaca o telefone e a página de contato. |
| Preço | Sem tabela geral (orçamento sob consulta). Mostra alguns preços avulsos, como a taxa de gestão de Yelp, e cita uma página de preços de site com planos mensais que não consegui ler. |
| Prova | Depoimentos de encanadores, número de clientes desde 2017 (aparecem 300, 450 e mais de 500 em páginas diferentes) e podcast com exemplo de cliente (investimento × faturamento). |
| Páginas de serviço | Uma página por canal, sempre com o público no título (site, Facebook, anúncios pagos e SEO para encanador), mais conteúdo educativo. FAQ curto sobre contrato, propriedade do site e prazo de entrega. |
| Adotar | Cada página escrita para um único público, falando de resultado do jeito que o dono do negócio mede (telefone tocando, serviço agendado), com promessa de prazo concreta. |
| Evitar | Contagem de clientes e telefones diferentes entre páginas: todo número publicado precisa de fonte única. |

#### 2.1.10 COLLINS · wearecollins.com

| Campo | Registro |
|---|---|
| Acesso | Só busca. **A home não apareceu nos resultados**, só subpáginas (`/team/`, `/about/`, `/programs/`, `/ideas/` e cases). |
| Oferta de entrada | Nenhuma; o contato para novos negócios é por e-mail. |
| CTA principal | Não encontrei CTA de conversão; e-mail e telefone aparecem no rodapé. |
| Posição do formulário | Não verificada; a busca mostrou só e-mail e endereço. |
| Preço | Não mostra. |
| Prova | Prêmios da Ad Age (consultoria e estúdio de design do ano), cases de marcas conhecidas (sweetgreen, Mailchimp) e projetos editoriais que constroem autoridade. |
| Páginas de serviço | Serviços apresentados como "programas", com o nome da situação do cliente (renovar, reposicionar, criar marca, fusão e outras), cada um com página própria; cases em páginas longas. |
| Adotar | Como princípio: serviços nomeados pela situação do cliente. O banner com uma frase forte e muito respiro, citado na 4.1, não pôde ser conferido porque a home não apareceu. |
| Evitar | Sem preço, sem formulário e sem CTA claro: para a Olorin, que precisa de lead, vale só como referência estética. |

### 2.2 Referências brasileiras

#### 2.2.1 V4 Company · v4company.com

| Campo | Registro |
|---|---|
| Acesso | Só busca (WebSearch padrão e estendido). Alguns trechos indexados são antigos, e nenhum mostra o visual da página. |
| Oferta de entrada | Contato com especialista depois do formulário. O blog diz que o atendimento começa com um diagnóstico do momento do negócio, mas **não encontrei no site oficial nenhum diagnóstico anunciado como gratuito**. Um site de terceiro com a marca V4 vende diagnóstico de Meta e Google Ads como produto pago (não verifiquei se é oficial). |
| CTA principal | Texto exato do botão da home: não verificado. Os trechos mostram chamadas para falar com um especialista ou preencher o formulário, uma página de assessoria dizendo que o próximo passo leva menos de um minuto e um 0800 com horário de atendimento no rodapé. |
| Posição do formulário | Há formulário na home, numa seção de passos (preencher, enviar o contato, receber uma ligação para marcar a reunião; um trecho antigo falava em retorno em 12 horas, sem confirmação atual), e também em landing pages num subdomínio próprio. Campos: nome, telefone e e-mail e, em algumas versões, empresa, número de funcionários e faturamento. Posição em relação à primeira dobra: não verificada. |
| Preço | Não mostra preço no site. A imprensa (Brazil Journal) descreve cobrança de mensalidade mais taxa por resultado. Os valores que aparecem na busca vêm de reclamações e de terceiros, não de tabela oficial. |
| Prova | Números de escala na home (clientes ativos na rede, escritórios, receita gerada para clientes), páginas de cases com marcas grandes (como a XP), lista de setores atendidos e FAQ. Os números mudam entre fontes e anos. |
| Páginas de serviço | Oferta organizada no "Método V4", com quatro pilares (aquisição, engajamento, monetização, retenção) e mais de 30 soluções. As páginas de serviço parecem artigos voltados a SEO, com seções sobre por que contratar, diferenciais, como avaliar e depoimentos. Layout não visto. |
| Adotar | Método com nome e etapas claras, qualificação no formulário com uma faixa opcional de verba e prazo de resposta escrito depois do envio. Reforça o "Método Olorin". |
| Evitar | Números de escala que mudam de uma página para outra e promessas genéricas de crescimento. A busca mostrou reclamações públicas sobre resultados prometidos e não entregues; não li o conteúdo nem avaliei o mérito. |

#### 2.2.2 Agência Mestre · agenciamestre.com

| Campo | Registro |
|---|---|
| Acesso | Só busca, com páginas de serviços, cases, clientes e consultoria de SEO indexadas. Layout não visto. |
| Oferta de entrada | Pedido de orçamento por serviço, com muito conteúdo gratuito como porta de autoridade (blog extenso, guia de serviços, cursos). Não encontrei diagnóstico nem auditoria gratuita. |
| CTA principal | A página de serviços pede para escolher um serviço e solicitar orçamento. A home tem duas chamadas: uma para busca orgânica e outra para anúncios pagos. Texto exato dos botões da home: não verificado. O menu usa "Contato". |
| Posição do formulário | Dentro das páginas de conteúdo (clientes, consultoria de SEO). Pede nome, e-mail, telefone, empresa, número de funcionários e como podem ajudar; na consultoria de SEO, também o investimento mensal em marketing digital e o endereço do site. Posição na página: não verificada. |
| Preço | Não publica preços nem pacotes. Tudo passa por orçamento. |
| Prova | Cases com o percentual de resultado no título e no resumo, página de clientes, depoimentos com nome, cargo e empresa, prêmios do ecossistema RD Station, o título de "melhor agência" por anos seguidos e o tempo de mercado (desde 2008). |
| Páginas de serviço | Hub `/servicos/` por categoria (SEO, inbound, tráfego pago), com subpáginas em URL hierárquica (consultoria, auditoria, SEO para e-commerce, migração, remoção de penalização, GEO) e páginas por segmento (construtoras, clínicas odontológicas). |
| Adotar | Hierarquia hub → serviço → segmento com URLs limpas, cases com resultado numérico no título e depoimento com nome e cargo. Serve de modelo para o hub `/servicos/` e para as futuras páginas por segmento (seção 21). |
| Evitar | Percentuais altíssimos (na casa dos milhares por cento) sem base e período ao lado, que soam inflados para o dono de pequeno negócio, e preço escondido atrás de orçamento. |

#### 2.2.3 NP Digital Brasil · npdigital.com/br

| Campo | Registro |
|---|---|
| Acesso | Só busca (serviços, mídia paga, contato, resultados e consultoria). A marca usa vários domínios para o Brasil (`npdigital.com/br`, `neilpatel.com/br` e `npdigital.com.br`). |
| Oferta de entrada | Contato com especialista por formulário. Na página de mídia paga, o primeiro passo descrito é uma avaliação de maturidade da operação. Há materiais gratuitos como isca (kit de SEO e de mídia paga). Não encontrei consultoria gratuita. |
| CTA principal | Falar com os especialistas e preencher o formulário (na página de contato, um formulário de proposta com escolha do setor). Texto exato do botão da home: não verificado. |
| Posição do formulário | Página de contato separada, com formulário de proposta. A página de mídia paga e as landing pages de consultoria têm formulário próprio, com nome, e-mail corporativo, empresa e telefone ou WhatsApp. Posição em relação à primeira dobra: não verificada. |
| Preço | Não mostra preço nem orçamento mínimo; fala em soluções sob medida. |
| Prova | Prêmios internacionais em destaque (Ad Age, Search Engine Land, MediaPost), página `/resultados/` com cases que têm marca, métrica e período no título (como crescimento orgânico em 12 ou 24 meses) e o nome do fundador como autoridade. |
| Páginas de serviço | Hub `/servicos/` dividido em SEO, mídia paga, dados e conversão, e tecnologia. Há subpáginas por disciplina (SEO técnico, SEO local, conteúdo, link building, YouTube, App Store) e uma página de mídia paga que explica o processo a partir da avaliação, com formulário. A consultoria já fala de GEO (aparecer nas respostas de IA). |
| Adotar | Cases com métrica, período e contexto já no título, e páginas de serviço que explicam o processo passo a passo a partir de uma avaliação inicial. Combina com a seção 12.2 e com o relatório de exemplo. |
| Evitar | Domínios e contatos espalhados, que confundem e dividem a busca, e a exigência de e-mail corporativo, que afasta pequenos negócios que usam e-mail pessoal (o público da Olorin). A Olorin mantém só `olorin.com.br` e um único contato. |

### 2.3 Agências de Curitiba

#### 2.3.1 iLuck · agenciailuck.com.br (consulta 1, posição 1)

| Campo | Registro |
|---|---|
| Acesso | Só busca estendida restrita ao domínio (home, página de tráfego pago em Curitiba, contato). |
| Oferta de entrada | Diagnóstico da estrutura atual (conta de anúncio, landing page, oferta e processo comercial) antes de uma proposta personalizada. Se é anunciado como gratuito: não verificado. |
| CTA principal | Contato pelo WhatsApp e pela página de contato. Texto exato do botão do topo: não verificado. |
| Posição do formulário | Não verificada. A busca só confirma contato por WhatsApp, telefone, e-mail e um formulário no site. |
| Preço | Sem tabela. O FAQ da home diz que o valor depende de análise e recomenda verba mínima de R$ 1.000/mês para tráfego. |
| Prova | Números autodeclarados (mais de 200 avaliações 5 estrelas no Google, mais de 160 empresas, R$ 10 milhões gerenciados), selos Google Partners e Meta Business Partner, um case com percentuais de custo por lead e volume de leads, e um depoimento com nome. |
| Páginas de serviço | Uma página por serviço com palavra-chave + cidade (tráfego pago, Meta Ads, SEO, landing page, aplicativos) e muitos posts de blog do tipo "X em Curitiba". A página de tráfego traz processo (diagnóstico, estratégia, execução, acompanhamento semanal), cases e FAQ. |
| Adotar | Dizer a verba mínima recomendada no FAQ da própria página de serviço, para a pessoa se qualificar sozinha. |
| Evitar | Dados que se contradizem entre páginas (prazo de resultado de "7 a 30 dias" num lugar e "poucos dias" em outro; telefone com e sem o 9). |

#### 2.3.2 Fresh Lab · freshlab.com.br (consulta 1, posição 2; consulta 2, posição 1)

| Campo | Registro |
|---|---|
| Acesso | Só busca estendida restrita ao domínio (home, tráfego pago, contato, páginas de segmento e de case). |
| Oferta de entrada | Proposta personalizada. Tem também um material gratuito (modelo de planejamento de marketing) como isca, e o "diagnóstico digital" aparece como entrega da etapa de planejamento. |
| CTA principal | Pedir proposta ("Quero uma Proposta") nas páginas de serviço, segundo a busca. CTA do topo da home: não verificado. |
| Posição do formulário | Formulário com nome, e-mail, WhatsApp e empresa, com promessa de contato de um especialista. Posição na página: não verificada. |
| Preço | Sem tabela. A página de tráfego destaca que não cobra taxa sobre a verba e que a conta de anúncio fica com o cliente. Um post do blog dá uma faixa de mercado (R$ 2.500 a R$ 15.000/mês para pequenas e médias empresas B2B), que não é a tabela da agência. |
| Prova | Nomes de clientes (UTFPR, Senai, CIEE PR e outros), depoimentos com nome e cargo, números (mais de 700 empresas, mais de 50 segmentos, mais de 15 anos) e uma página de case com o resultado no título (+267%). |
| Páginas de serviço | Uma página por serviço mais páginas por segmento (advogados, imobiliárias, turismo, indústria, saúde). A de tráfego traz metodologia em 6 etapas, benefícios e FAQ (custo, prazo de 1 a 2 semanas para montar a campanha, qualificação de leads). |
| Adotar | Case com o número principal no título e na URL, e resposta clara sobre quem é o dono da conta de anúncio (pergunta que a Olorin ainda tem como `[CONFIRMAR]`). |
| Evitar | Tempo de mercado que muda entre páginas e dados estruturados (desde 2009, 16 anos, 17 anos). |

#### 2.3.3 Azempresas · azempresas.com.br (consulta 1, posição 3)

| Campo | Registro |
|---|---|
| Acesso | Só busca estendida restrita ao domínio (home, planos, hospedagem, loja virtual, proposta comercial, portfólio). |
| Oferta de entrada | Pedido de orçamento e pacotes mensais de redes sociais por volume de entregas (4, 8, 12 ou 30 publicações por mês). |
| CTA principal | Pedir orçamento ("Solicite um orçamento"), segundo a busca. |
| Posição do formulário | A home tem um bloco de orçamento (nome, telefone, e-mail, mensagem), e a página de sites tem outro. Posição em relação à primeira dobra: não verificada. |
| Preço | Misto: hospedagem (a partir de R$ 69,90/mês) e loja virtual (R$ 129,90/mês + R$ 590 de instalação) têm preço aberto; os planos de marketing não têm valor; uma página pública de proposta mostra o valor ainda como modelo ("R$ xx.xxx,xx"). |
| Prova | Dois depoimentos na home, portfólio com página por projeto e a menção a 14 anos de experiência. Não encontrei números de resultado. |
| Páginas de serviço | Páginas por produto (sites, loja virtual, logomarcas, hospedagem, marketing jurídico) e uma por projeto do portfólio. Seções internas: não verificadas. |
| Adotar | Descrever cada plano pela quantidade de entregas (peças ou publicações por mês), o que facilita comparar. |
| Evitar | Página pública com valor de modelo não preenchido. Passa descuido: nenhum texto provisório pode ir ao ar. |

#### 2.3.4 Lab Growth · labgrowth.com.br (consulta 1, posição 4; consulta 2, posição 2)

| Campo | Registro |
|---|---|
| Acesso | Só busca estendida restrita ao domínio (home, tráfego pago em Curitiba, manifesto, artigos de preço). |
| Oferta de entrada | Diagnóstico gratuito e conversa sem compromisso para montar a proposta. |
| CTA principal | Contato por WhatsApp, e-mail ou formulário. Texto exato do botão principal: não verificado. |
| Posição do formulário | A busca confirma um formulário no site; posição não verificada. |
| Preço | Valor "a partir de": mensalidade a partir de R$ 1.500/mês (outro artigo cita R$ 1.200), com a verba paga à parte ao Google e à Meta e sugestão de verba diária (R$ 20/dia na Meta, R$ 60/dia no Google). Tem também um artigo com tabela de preços de 2026. |
| Prova | Números autodeclarados (mais de 250 empresas, R$ 8 milhões em mídia), selos Google Partner e Meta Business Partner, avaliações do Google e um ranking das "10 melhores agências de Curitiba em 2026" publicado por ela mesma, com ela em 1º lugar. |
| Páginas de serviço | A página de tráfego traz processo (planejamento, configuração, criativos e testes, otimização e relatórios), prazo de 30 a 60 dias de otimização e FAQ. Há páginas clonadas por cidade (Pinhais, Paranaguá, Lapa). |
| Adotar | Explicar com números a separação entre gestão e verba, com verba de referência e prazo até o custo estabilizar. |
| Evitar | Ranking feito pela própria agência apresentado como se fosse de terceiros, valor de mensalidade diferente entre artigos e telefones diferentes entre páginas. |

#### 2.3.5 BUS Digital · busdigital.com.br (consulta 1, posição 5)

| Campo | Registro |
|---|---|
| Acesso | Só busca estendida restrita ao domínio principal e ao subdomínio de landing page. |
| Oferta de entrada | Consultoria gratuita com especialista pelo WhatsApp e análise gratuita de conta de Google Ads, Meta Ads ou site. |
| CTA principal | Na landing page, um botão de contato para a consultoria gratuita pelo WhatsApp. Texto exato: não verificado. |
| Posição do formulário | A página de contato tem formulário; na landing page, o caminho é um botão. Posição na home: não verificada. |
| Preço | O FAQ da página de anúncios cita mensalidade de cerca de R$ 957, verba mínima de R$ 1.000 e contrato mínimo de 6 meses. Compara também com o custo de montar um time próprio (cerca de R$ 23 mil/mês), com salário por função. |
| Prova | Dois depoimentos com nome, certificações Google e Facebook e uma página de portfólio. Diz ter dezenas de depoimentos, mas a busca só mostrou dois. |
| Páginas de serviço | Uma página por serviço (Google Ads, sites, e-commerce, redes sociais), mais uma landing page de anúncios em subdomínio separado e muito conteúdo de blog local. Estrutura interna: não verificada. |
| Adotar | Comparação entre time interno e agência com o custo de cada função, que ajuda a ancorar o preço. Para a Olorin, só com fonte de salário citada (ver seção 4.2). |
| Evitar | Prometer mais prova do que mostra e afirmar baixa chance de ficar sem resultado sem dado nenhum. Há também e-mails e telefones divergentes. |

#### 2.3.6 FourAds · fourads.com.br (consulta 2, posição 3)

| Campo | Registro |
|---|---|
| Acesso | Só busca estendida restrita ao domínio (home, tráfego pago, sobre, contato, páginas por nicho). |
| Oferta de entrada | Orçamento ou reunião. Não encontrei oferta explícita de diagnóstico gratuito. |
| CTA principal | Dois botões nas páginas de serviço: pedir orçamento e agendar reunião ("Solicitar Orçamento" e "Agendar Reunião"). |
| Posição do formulário | Não verificada. A página de contato lista WhatsApp, telefone e e-mail. |
| Preço | Não publica valores. O FAQ explica o modelo (mensalidade de gestão mais verba paga direto às plataformas) e diz que o contrato é mensal, sem fidelidade obrigatória. |
| Prova | Selo Google Partner, números autodeclarados (mais de 6 anos, mais de 50 clientes, 95% de retenção, R$ 3 milhões investidos, 27 mil leads) e depoimentos com nome de escritórios de advocacia, um deles citando crescimento de mais de 100% em 2 anos. |
| Páginas de serviço | Uma página por serviço (tráfego, Google Ads, YouTube Ads, Facebook e Instagram Ads, e-commerce, infoproduto, rastreamento com GA4) mais páginas por nicho (advogados, médicos). Cada uma tem processo em 4 etapas (análise, estratégia, implementação, monitoramento) e FAQ. |
| Adotar | Dois CTAs com intenções diferentes (pedir orçamento ou agendar conversa) e "sem fidelidade" em destaque no FAQ, como o "sem multa rescisória" da Olorin. |
| Evitar | URLs duplicadas para o mesmo assunto (duas para tráfego pago para advogados, duas para YouTube Ads). Uma página canônica por tema evita que elas disputem a mesma busca. |

#### 2.3.7 Realiza Marketing Digital · realizamktdigital.com.br (consulta 2, posição 4)

| Campo | Registro |
|---|---|
| Acesso | Só busca estendida restrita ao domínio (home, duas páginas de tráfego pago, artigos). |
| Oferta de entrada | "Diagnóstico gratuito" no menu. Na página de SEO, a primeira reunião e a análise inicial do site são gratuitas. |
| CTA principal | Botões para conversar pelo WhatsApp e para pedir orçamento, segundo a busca. Texto exato: não verificado. |
| Posição do formulário | Não verificada. |
| Preço | Não publica mensalidade; a página de sites diz "sob consulta". Um artigo dá referências de verba (a partir de R$ 10/dia; R$ 600 a R$ 1.200/mês para conversão; 5% a 10% do faturamento). Os serviços podem ser contratados separadamente. |
| Prova | Seção de depoimentos na home (o texto não apareceu na busca). A nota 5,0 com 33 avaliações aparece só nos dados estruturados, e não consegui conferi-la na ficha do Google. |
| Páginas de serviço | Páginas por serviço (tráfego, SEO, redes sociais, sites, logo) e por segmento (dentistas, estética, restaurantes, médicos). A de tráfego traz etapas, comparação entre Google e Meta, acompanhamento por painel e FAQ. |
| Adotar | Um bloco "Google ou Meta: quando usar cada um" na página de tráfego, escrito como o cliente pergunta, e acompanhamento por painel. |
| Evitar | "Sob consulta" em serviço de entrada, telefones diferentes entre páginas, duas URLs para o mesmo serviço e nota publicada só nos dados estruturados, sem fonte visível. |

#### 2.3.8 Agência Miura · agenciamiura.com.br (consulta 2, posição 5)

| Campo | Registro |
|---|---|
| Acesso | Só busca estendida restrita ao domínio (home, tráfego pago em Curitiba, páginas de segmento). |
| Oferta de entrada | Diagnóstico gratuito e sem compromisso: uma reunião que analisa a presença digital e os concorrentes em Curitiba e leva a um plano personalizado com metas, orçamento e cronograma. |
| CTA principal | Pedir o diagnóstico gratuito ou falar pelo WhatsApp, com promessa de retorno em até 2 horas úteis. Texto exato do botão: não verificado. |
| Posição do formulário | Uma página de segmento cita um formulário breve ou o WhatsApp. Posição: não verificada. |
| Preço | Não publica. Diz que o investimento é personalizado e definido no diagnóstico. |
| Prova | Três cases com números (retorno de 3,8 vezes sobre o investimento num e-commerce, R$ 280 mil em agendamentos numa clínica, +127% de reservas num restaurante), sem nome de cliente nem período. Não encontrei depoimentos com nome. |
| Páginas de serviço | Páginas por serviço (tráfego, sites, redes sociais, identidade visual, aplicativos) e por segmento (restaurantes, estética, odontologia, veterinária). A de tráfego traz diagnóstico, plano, prazos (primeiras semanas e 90 dias) e FAQ. |
| Adotar | Prazo de resposta concreto e escrito. A Olorin deve publicar o prazo que de fato cumpre. |
| Evitar | Case anônimo, sem período e sem contexto: é o tipo de prova que a seção 4.1 manda não usar. |

### 2.4 Padrões comuns

| Padrão | Onde apareceu | Leitura para a Olorin |
|---|---|---|
| Porta de entrada gratuita e vaga | Diagnóstico ou consultoria gratuita em Lab Growth, BUS, Realiza e Miura; proposta ou consulta gratuita em SmartSites, Ignite, True North, Strictly Plumbers e Digital Silk | O gratuito é o padrão, não o diferencial. Diferencia dizer duração, formato e o que a pessoa recebe (só a Miura descreve a entrega). |
| Preço escondido | Nenhum dos 11 sites brasileiros publica tabela completa de gestão. Lab Growth mostra "a partir de"; BUS cita um valor no FAQ. Fora do Brasil: Hook ("a partir de" por serviço) e Ignite (faixa) | O preço aberto da Olorin, com custo total, é diferencial real e deve ficar visível. |
| Verba mínima declarada | iLuck e BUS (R$ 1.000/mês); Lab Growth (verba diária de referência) | A Olorin recomenda R$ 1.500/mês: precisa aparecer junto dos planos, não só no FAQ. |
| Contrato | Scorpion e Hook: 12 meses; BUS: 6 meses; FourAds: mensal sem fidelidade; Ignite: sem contrato longo (declarado) | Os 3 meses sem multa da Olorin são competitivos, mas não exclusivos. |
| Qualificação no formulário | Hook (faturamento), V4 (funcionários e faturamento), Agência Mestre (funcionários e investimento), NP Digital (e-mail corporativo e setor) | A Olorin já pergunta a verba, com menos atrito. Não acrescentar faturamento, funcionários nem e-mail corporativo. |
| Prova autodeclarada | Selos de parceiro, "X empresas atendidas", "R$ X milhões gerenciados" em quase todos | Prova de terceiros (avaliação no Google com link) pesa mais e é rara. |
| Autoelogio disfarçado | Rankings próprios (NoGood, Lab Growth); "#1" ou "melhor" nos títulos (SmartSites, Ignite, Agência Mestre); parede de prêmios (Digital Silk); nota só nos dados estruturados (Realiza) | Nada disso no site da Olorin. |
| Cases com contexto | NP Digital (métrica e período no título), Ignite (PDF), Fresh Lab (número no título) | Modelo a seguir. Contraexemplos: Miura (anônimo, sem período) e True North (métrica vaga). |
| Páginas em massa por cidade | True North, Ignite, Digital Silk, Lab Growth; iLuck com palavra-chave + cidade em tudo | Uma página por serviço, com "em Curitiba e para todo o Brasil" no texto, sem clones por município. |
| Dados contraditórios | Hook, Digital Silk, Strictly Plumbers, V4, NP Digital, iLuck, Fresh Lab, Lab Growth, BUS, Realiza (10 dos 21) | Preços, números e contatos com fonte única no projeto. |
| Prazo de resposta escrito | SmartSites e Ignite (1 dia útil), Miura (2 horas úteis); V4 (12 horas, só num trecho antigo) | A Olorin já escreve "até 1 dia útil"; manter enquanto for verdade (pergunta 0.5.9). |

---

## 3. O que a Olorin faz melhor / o que falta

**Base:** `site-atual/index.html` (versão do servidor). Números de linha referem-se a esse arquivo. A comparação usa só o que a busca mostrou dos concorrentes; o layout deles não foi visto.

### 3.1 O que a Olorin faz melhor (manter e destacar)

| O que | Onde está hoje | Comparação |
|---|---|---|
| Preço público dos 3 planos (a partir de R$ 800, R$ 2.500 e R$ 5.000) | Linhas 766 a 912 | Nenhum dos 11 sites brasileiros publica a mensalidade completa. O mais perto é um "a partir de" (Lab Growth) e um valor citado no FAQ (BUS). |
| Contrato curto e sem multa (3 meses, depois mês a mês com aviso de 30 dias) | FAQ, linhas 959 e 960 | Mais flexível que Scorpion e Hook (12 meses) e BUS (6 meses). FourAds e Ignite também não prendem: é um ponto forte, não uma exclusividade. |
| Formulário que qualifica pela verba, sem pedir faturamento, número de funcionários nem e-mail corporativo | Linhas 1080 a 1088 | V4, Agência Mestre e Hook pedem porte ou faturamento; NP Digital exige e-mail corporativo. A Olorin qualifica com menos atrito. |
| Método com nome e etapas (Diagnóstico, Direção, Execução, Leitura) | Linhas 235 a 297 | Mesmo princípio de NoGood e V4, com menos jargão. |
| Ferramenta interativa: checklist de dores | Linhas 168 a 224 | Só Animalz (Revive) e Digital Silk (calculadora) mostraram ferramenta; nos 8 de Curitiba, a busca não mostrou nenhuma (layout não verificado). |
| Prazo de resposta escrito junto do botão e do formulário | Linhas 113, 1120 e 1130 | Mesmo nível de SmartSites e Ignite (1 dia útil). |
| FAQ franco sobre verba mínima, prazo de resultado, contrato, impressão e atendimento remoto | Linhas 941 a 978 | Mesmo nível da Hook; a maioria das agências de Curitiba deixa verba e contrato para a conversa. |
| Banner com um H1 curto e forte | Linha 95 | Em linha com o princípio da 4.1. |

O site atual mediu 97/100/100/100 no PageSpeed (celular, 08/10/2026, conforme o PROMPT), mas não medi os concorrentes; não há comparação de velocidade neste documento.

### 3.2 O que falta

| O que falta | Situação no site atual | Quem faz bem | Onde se resolve |
|---|---|---|---|
| Páginas de serviço | Os 6 serviços são cartões sem link (linhas 306 a 400); só existe a home | Todos os 21 sites | PROMPT, seções 7 e 9 |
| Formulário perto do topo | Só no fim da página (linhas 988 a 1112); o banner leva até lá pelo botão "Pedir um orçamento" (linha 104) | Hipótese, não padrão comprovado (seção 4) | PROMPT, seção 10.5 |
| Custo total visível | A nota dos planos fala da verba à parte, mas não diz a mínima (linha 912); os R$ 1.500 estão só no FAQ (linha 948) | Lab Growth e BUS explicam gestão × verba com números | PROMPT, seções 8.12 e 12.5 |
| Oferta de entrada com escopo | O banner pede orçamento; "Pedir diagnóstico" aparece no Método (linha 297) sem dizer o que a pessoa recebe | Miura (diz o que entrega no diagnóstico) | Pergunta 0.5.2 |
| Prova com contexto | Números sem período nem critério (linhas 590 a 624); cases com segmento e número, sem verba, período nem forma de medição (linhas 632 a 692) | NP Digital, Ignite, Fresh Lab | PROMPT, seção 12.2, e decisão do dono (seção 4.1 abaixo) |
| Avaliações de terceiros | Nenhuma avaliação do Google, depoimento com nome ou logo de cliente | SmartSites, Scorpion e Ignite mostram nota e volume | `GBP_URL` (pergunta 0.5.3); seção 12.7 |
| Equipe com foto | "Quem toca" é um parágrafo corrido com foto de bastidores (linhas 704 a 731); as fotos reais da equipe já estão em `_inbox/` | Hook, Animalz | PROMPT, seção 12.3 |
| Relatório de exemplo | A janela `relatorio.exe` do banner é só um rótulo ("Vendas do mês") sobre a imagem (linhas 124 e 128) | Animalz ("mostre, não diga"); SmartSites (painel do cliente) | PROMPT, seção 12.4 |
| Agendamento | Só WhatsApp e formulário | Scorpion, FourAds, Hook | `SCHEDULING_URL` (pergunta 0.5.3) |
| FAQ de objeções | Faltam: dono das contas e dos arquivos, troca de agência, quem cuida da conta no dia a dia, atendimento por segmento | Digital Silk, Hook, Strictly Plumbers, Fresh Lab | PROMPT, seção 12.6 |
| Coerência interna | "Poucas marcas por vez" (linha 719) × número de marcas atendidas (linha 600); dor "fala com o atendimento" (linha 212) × Derek apresentado como o atendimento (linha 715) | Problema comum: 10 dos 21 sites têm dados contraditórios | Fonte única de dados; `docs/AUDIT.md`, achado 16 |
| Quantidade de entregas por plano | "Criação de peças inclusa" sem quantidade (linha 847) | Azempresas (publicações por mês em cada pacote) | `[CONFIRMAR]` com o dono |

### 3.3 Pontos de atenção que o benchmark levanta

- **Cases de exemplo publicados:** por decisão do dono (08/10/2026), os 3 cases continuam visíveis com o conteúdo atual, para edição posterior direto no HTML. Eles têm o mesmo formato que o benchmark aponta como fraco (segmento e número, sem período, verba nem forma de medição, como na Miura). Recomendação: trocar por casos reais com contexto antes de investir em campanhas pagas.
- **Números novos sem base:** os números informados pelo dono (R$ 2M+ de verba gerida em anúncio, 50+ marcas atendidas, 2x de retorno médio sobre o investimento, 100+ peças entregues por mês) ainda não têm período nem critério. Quando houver, vale a linha pequena de base da seção 12.2 ("base: contas gerenciadas de 20XX a 2026"), que é o que separa a Olorin dos números de escala que mudam de página para página.
- **"Poucas marcas por vez" × "50+ marcas atendidas":** ajustar a frase para deixar claro que fala de quantas contas o time toca ao mesmo tempo, não do total histórico (`docs/AUDIT.md`, seção 4, item 5).

---

## 4. Decisões da tabela 4.1: confirmação ou ajuste

### 4.1 As 11 decisões originais

| # | Padrão | Decisão original | Situação | Por quê |
|---|---|---|---|---|
| 1 | Preço aberto | Preços públicos, custo total (gestão + verba) e calculadora | **Confirmada, com ajuste** | Nenhum dos 11 sites brasileiros publica a mensalidade completa. A página de preços da Hook foi confirmada pela busca; o vídeo, não. A Ignite publica faixa e explica o que faz o valor subir. **Ajuste:** dizer, junto do preço, o que faz o valor mudar e a diferença entre gestão e verba; manter preço com fonte única (Hook e Digital Silk têm valores contraditórios). Valores em dólar não servem de argumento: só o formato de apresentação. |
| 2 | Formulário na primeira dobra | Etapa 1 logo abaixo do banner | **Ajustada: vira hipótese de teste** | Não confirmei formulário no banner da SmartSites; a busca indica que ele fica mais abaixo na home. A decisão segue como variante B da seção 10.5, mas como hipótese a medir, não como padrão comprovado. **Ajuste:** usar B como padrão enquanto o rastreamento não estiver ativo e trocar para `ab` quando GTM e GA4 estiverem configurados. Manter o prazo de resposta escrito junto do formulário (SmartSites, Ignite). |
| 3 | Vários caminhos de contato | Formulário + WhatsApp + agendamento, sempre visíveis | **Confirmada, com ajuste** | A Scorpion oferece telefone, SMS, chat e reunião (a barra fixa não foi verificada); a FourAds separa "pedir orçamento" de "agendar reunião". **Ajuste:** o agendamento só aparece se houver `SCHEDULING_URL`; nada de chat automático; um único telefone e um único e-mail em todo o site (NP Digital, BUS, Lab Growth e Realiza mostram contatos divergentes). |
| 4 | Nomear o modelo de serviço | "Método Olorin" e "o mesmo time" como nomes fixos | **Confirmada** | A NoGood nomeia o modelo ("growth squad"), diz quem compõe o time e informa o prazo esperado; a V4 organiza a oferta no "Método V4". **Complemento:** ligar cada etapa do método a quem faz e ao prazo que o FAQ já informa (2 a 4 semanas para sinais em resposta direta). |
| 5 | Uma página profunda por serviço | 6 páginas completas, com índice de seções | **Confirmada, com ajuste** | Todos os 21 sites têm página por serviço; Ignite, Lab Growth, FourAds e Digital Silk trazem processo e FAQ em cada uma. **Ajuste:** nenhuma página em massa por cidade (True North, Ignite, Lab Growth); uma URL canônica por tema (FourAds e Realiza têm duplicadas); hierarquia hub → serviço, com segmento só no futuro (modelo da Agência Mestre). |
| 6 | Mostrar o time | Cartões de equipe na home, nas páginas de serviço e em `/sobre/` | **Confirmada** | A busca confirma fotos da equipe na Hook e página Sobre com nome e cargo na Animalz. As fotos reais da equipe já estão em `_inbox/`. |
| 7 | Ferramenta interativa | Checklist de dores + calculadora de custo + relatório de exemplo | **Confirmada** | A Animalz usa uma ferramenta gratuita (Revive) que demonstra o serviço e qualifica o lead; a Digital Silk tem calculadora de custo. A calculadora de custo de entrada é o equivalente para a Olorin. |
| 8 | Prova de terceiros acima do autoelogio | Só números e selos verificados, cases completos, avaliações do Google quando houver | **Confirmada no princípio; ajustada por decisão do dono** | Cases com número, período e contexto aparecem na NP Digital, na Ignite e na Fresh Lab; autoelogio (rankings próprios, "#1", paredes de selos, cases anônimos) aparece em muitos. **Ajuste por ordem do dono (08/10/2026):** os números R$ 2M+, 50+, 2x e 100+ ficam visíveis, e os 3 cases e o portfólio de exemplo também, sem flag. Período e critério dos números vão para `docs/CONTENT-TODO.md`; recomendação de trocar os cases por casos reais com contexto (seção 3.3). Selos de parceiro e `aggregateRating` continuam fora até haver fonte real. |
| 9 | Linguagem do público | Dores escritas como o dono de negócio fala; páginas por segmento no futuro | **Confirmada** | Strictly Plumbers e Scorpion escrevem na língua de cada setor; Fresh Lab, Agência Mestre, Miura e Realiza já têm páginas por segmento. Mantém-se na seção 21, só quando houver case real em cada segmento. O FAQ de tráfego já prevê "Meta Ads ou Google Ads, qual escolher?", no espírito do bloco da Realiza. |
| 10 | Texto simples converte mais | Frases curtas, palavras comuns, meta de legibilidade, projeto a partir de 360 px | **Mantida, fonte não verificada** | Não consultei o relatório da Unbounce nesta pesquisa, nem o dado de que a maioria das visitas vem do celular. A decisão fica porque tem custo baixo e coincide com a meta de legibilidade da seção 17, mas nenhum número desse relatório deve ser citado no site ou nos docs antes de conferido. |
| 11 | Uma frase só no banner | Um H1, um parágrafo, um botão principal e um link secundário | **Mantida, referência não verificada** | A home da COLLINS não apareceu na busca, então o princípio não foi conferido nela. A decisão fica porque o H1 atual já segue essa linha. **Ajuste:** hoje o banner tem dois botões de peso parecido ("Pedir um orçamento" e "Falar no WhatsApp", linhas 104 e 108); no v3, um botão principal e o WhatsApp como link de texto. |

### 4.2 Decisões novas sugeridas pelo benchmark

| Decisão | Base no benchmark | Onde entra |
|---|---|---|
| Manter a faixa de verba como única pergunta de qualificação; não pedir faturamento, número de funcionários nem e-mail corporativo | V4, Agência Mestre, Hook e NP Digital pedem mais; e-mail corporativo afasta pequenos negócios | PROMPT, seção 10.1 |
| Ampliar o FAQ com: diferença entre gestão e verba, verba mínima, prazo esperado de resultado, prazo de resposta, dono da conta de anúncio e dos arquivos, contrato sem fidelidade | Lab Growth, BUS, FourAds, Hook, NoGood, Fresh Lab, Digital Silk, Strictly Plumbers | PROMPT, seção 12.6 (respostas com fatos ou `[CONFIRMAR]`) |
| Fonte única para preços, números e contatos, com checagem no build | Dados contraditórios em 10 dos 21 sites | `content/claims.json`, dados dos planos e `site/config.json` (seções 12.2 e 13.1) |
| Nada de "#1", "melhor", "top", ranking próprio, parede de selos ou nota sem fonte visível | SmartSites, Ignite, Agência Mestre, NoGood, Lab Growth, Digital Silk, Realiza | PROMPT, seções 0.2, 15.2 e 17 |
| Uma URL canônica por tema e nenhuma página clonada por cidade | True North, Ignite, Lab Growth, FourAds, Realiza | PROMPT, seções 7 e 15.4 |
| Escrever o escopo do diagnóstico gratuito (duração, formato, o que a pessoa recebe) | 4 das 8 agências de Curitiba oferecem diagnóstico ou consultoria gratuita; só a Miura diz o que entrega | Pergunta 0.5.2 |
| Dizer a quantidade de entregas de cada plano (por exemplo, peças por mês) | Azempresas | `[CONFIRMAR]` com o dono antes de publicar (seção 12.5) |
| Nenhum texto provisório no ar | Azempresas (proposta pública com valor de modelo) | Checagem do build (seção 0.2, regra 1) |

### 4.3 Para o roadmap (não executar agora)

| Ideia | Base | Condição |
|---|---|---|
| Case em PDF para baixar, com contexto, período e número | Ignite | Ter ao menos um case real aprovado |
| Página de antes e depois no portfólio | Digital Silk | Ter imagens reais de trabalhos da Olorin |
| Comparação entre montar um time interno e contratar "o mesmo time" | BUS, Hook | Só com fonte de salário citada e sem comparar com concorrentes (seção 17) |
| Páginas por segmento | Fresh Lab, Agência Mestre, Miura, Realiza | Já previsto na seção 21: só com case real em cada segmento |
| Vídeo curto explicando o Método Olorin | Hook (o vídeo não foi verificado) | Já previsto na seção 21 |

### 4.4 O que não fazer com este benchmark

- Não copiar textos, layouts, imagens nem marcas de nenhum dos sites. Os rótulos de botão citados acima são registro de fato observado, não sugestão de texto.
- Não usar os números das agências como argumento no site da Olorin (seção 17: sem comparação com concorrentes).
- Não tratar como verificado o que está marcado como não verificado. Os itens em aberto estão na seção 1.3.
