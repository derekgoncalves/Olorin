# PROMPT MESTRE v3 · Site olorin.com.br no Claude Code

> **Versão 3 (08/10/2026).** Substitui a v2. Este arquivo é autossuficiente: tudo o que o Claude Code precisa saber está aqui ou nas pastas indicadas abaixo.

---

## ANTES DE ABRIR O CLAUDE CODE (para o dono do site, não para a IA)

**1. Monte a pasta do projeto assim:**

```
olorin-site/
├── PROMPT.md                ← este arquivo
├── site-atual/              ← cópia COMPLETA do que está hoje no public_html (baixe tudo pelo FTP:
│                              index.html, 404.html, .htaccess, enviar.php, config.php, sitemap.xml,
│                              politica-de-privacidade/, assets/ inteira com css, js, fonts e img, leads/.htaccess)
├── _brand/                  ← identidade visual da Olorin: manual de marca (PDF), logos (SVG/PNG),
│                              paleta, fontes, ícones, grafismos, mockups de referência
└── _inbox/                  ← fotos da equipe, logos de clientes, cases, portfólio, prints de depoimento,
                               bastidores (qualquer nome de arquivo; a IA organiza)
```

**2. Segurança, obrigatório antes de começar:** abra `site-atual/config.php` e troque o valor de `smtp_senha` por `'TROCAR_NO_SERVIDOR'`. A senha real nunca deve entrar no projeto, no Git nem no chat. Como ela já circulou fora do servidor, **troque a senha da caixa `digital@olorin.com.br` no painel da Locaweb** e coloque a nova apenas no `config.php` que fica no servidor.

**3. Abra o terminal na pasta `olorin-site/`, rode `claude` e cole:**

```
Leia o PROMPT.md inteiro, com atenção. Depois leia todo o conteúdo de site-atual/, _brand/ e _inbox/.
Execute a Fase 0 (auditoria, benchmark e plano) e me faça as perguntas bloqueantes da seção 0.5 numa única mensagem.
Em seguida, execute todas as fases em sequência, sem esperar aprovação, usando os padrões indicados
enquanto eu não responder. Só pare de novo antes do deploy (Fase 9).
```

Se quiser anexar imagens direto no chat do Claude Code (arrastando para o terminal), tudo bem: a IA deve **salvar cada imagem anexada em `_brand/` ou `_inbox/`** antes de usá-la, para que fique registrada no projeto.

---

## 0. COMO VOCÊ (CLAUDE CODE) DEVE TRABALHAR

### 0.1 Papel
Você é um time sênior em uma pessoa só: desenvolvedor front-end e back-end, designer de interface que respeita marca, especialista em performance web, SEO técnico e busca com IA, acessibilidade, rastreamento (GTM/GA4/Meta/Google Ads) e redator de conversão em português do Brasil. O objetivo é entregar um site **excelente de verdade**, medido por números (Lighthouse, axe, eventos de rastreamento, legibilidade), e não apenas bonito.

### 0.2 Regras de ouro (inegociáveis)
1. **Não invente fatos.** Nenhum número, resultado, nome de cliente, depoimento, CNPJ, endereço, avaliação, prêmio, selo de parceiro, prazo ou processo que não esteja neste documento, em `site-atual/`, `_brand/` ou `_inbox/`. Quando faltar informação, use o marcador `[CONFIRMAR: o que falta]` (visível só em modo de desenvolvimento, **nunca** no build de produção; o build deve falhar se encontrar um) e registre em `docs/CONTENT-TODO.md`.
2. **O único domínio é `olorin.com.br`.** Nunca crie nem cite outro domínio (`olorindigital.com.br`, `olorin.digital` etc.) em código, metas, schema, sitemap, e-mails, textos ou comentários. O Instagram `@olorin.digital_` é um handle e é permitido. No final, `grep -RniE "olorindigital" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=site-atual --exclude=PROMPT.md` deve retornar **zero**, e `olorin.digital` só pode aparecer como `instagram.com/olorin.digital_` ou `@olorin.digital_`. **Atenção: o `sitemap.xml` e o `404.html` atuais têm o domínio errado (seção 1).**
3. **Não quebre o que funciona.** Mantenha: formulário em 2 etapas, captura de UTM/gclid/fbclid, honeypot, link para `/politica-de-privacidade/`, link "Pular para o conteúdo", barra fixa no celular, os IDs dos CTAs (`cta-whatsapp-topo`, `cta-orcamento-topo`, `cta-whatsapp-flutuante`, `cta-whatsapp-barra-mobile`, `cta-form-barra-mobile`, `cta-whatsapp-rodape`), a identidade visual e o tom de voz.
4. **Nunca regrida a performance.** Linha de base (PageSpeed mobile, 08/10/2026): Desempenho 97, Acessibilidade 100, Práticas recomendadas 100, SEO 100; LCP 2,3 s, FCP 1,5 s, TBT 70 ms, CLS 0, Speed Index 2,8 s. Toda página nova deve ficar **igual ou melhor**.
5. **Zero JavaScript de framework no navegador.** Ferramentas de build são permitidas (seção 6); o que vai para o visitante é HTML, CSS e um JS pequeno e próprio. Sem jQuery, sem bibliotecas de animação, sem Google Fonts, sem scripts de terceiros além do GTM (só após consentimento).
6. **Segredos fora do repositório.** Senha SMTP, credenciais de FTP e IDs privados ficam em arquivos ignorados pelo Git (`.env`, `config.php` do servidor). Entregue `config.example.php` e `.env.example` sem valores reais. **Nunca leia em voz alta, imprima no terminal, copie para docs ou faça commit de uma senha**, mesmo que encontre uma.
7. **Voz da marca:** português do Brasil, direto, humano, sem jargão. Sempre **"nós"** (nunca "eu" nem "mesma cabeça"). O diferencial é **"o mesmo time"** (3 especialistas). Nunca prometa "garantido", "o melhor", "100% de resultado".
8. **Ortografia impecável.** Verificação pt-BR em todos os textos (`hunspell -d pt_BR` ou equivalente + revisão manual). Sem espaços duplos, crase correta, travessões e aspas consistentes.
9. **A identidade visual manda.** O manual em `_brand/` é a fonte da verdade de cores, tipografia, logo e grafismos (seção 3). Evolua o visual; não redesenhe a marca.

### 0.3 Fluxo de trabalho
- `git init` (se ainda não houver), branch `feat/site-v3`, commits pequenos por fase no padrão `feat:`, `fix:`, `perf:`, `docs:`, `chore:`.
- `site-atual/` é **somente leitura** (referência e fonte de conteúdo). O site novo nasce em `src/` e é gerado em `dist/`.
- Antes de codar: leia **todo** o `site-atual/` (HTML, `assets/css/olorin.css`, `assets/js/olorin.js`, `enviar.php`, `.htaccess`, política de privacidade), todo o `_brand/` (abra o PDF do manual e veja cada página; você consegue ler imagens) e todo o `_inbox/`. Escreva `docs/AUDIT.md`, `docs/BRAND.md`, `docs/BENCHMARK.md` e `docs/PLAN.md`.
- Use subagentes/tarefas paralelas quando ajudar (ex.: um para otimizar imagens enquanto outro escreve templates), mas consolide tudo nos docs.

### 0.4 Autonomia
Siga adiante com os padrões deste documento. Pare apenas em dois momentos: **(a)** no fim da Fase 0, para as perguntas da 0.5 (e continue trabalhando com os padrões enquanto espera); **(b)** antes do deploy (Fase 9), mostrando o relatório final e pedindo autorização explícita para publicar.

### 0.5 Perguntas bloqueantes (no máximo estas, em uma única mensagem)
1. **WhatsApp correto:** o site usa `5541996460861` e o `config.php` usa `5541996327657`. Qual vale? (padrão: `5541996460861`, que já está publicado e no schema; o outro fica registrado no CONTENT-TODO)
2. **Diagnóstico gratuito** existe? Escopo (duração, formato, o que a pessoa recebe)? (padrão: sim, "conversa de 30 minutos por vídeo + resumo por escrito do que encontramos", com `[CONFIRMAR]`)
3. **IDs:** GTM, GA4, Meta Pixel, conversão do Google Ads, link de agendamento (Calendly ou similar), ficha do Google Meu Negócio. (padrão: placeholders em `site.config.json`; o que estiver vazio não aparece)
4. Os números **"R$ 12M+", "87+ marcas", "4,42x", "320+ peças/mês"** e os 3 cases são comprováveis? Com que período e critério? (padrão: ocultos pela flag `SHOW_STATS=false` até confirmar; **hoje estão publicados sem contexto**)
5. As imagens atuais do portfólio (Ateliê de moda, Loja de tecnologia, Escritório de advocacia, Cafeteria, Estúdio de estética, Marcenaria autoral, Clínica médica, Loja infantil) são **trabalhos reais da Olorin** ou ilustrações provisórias? (padrão: tratar como provisórias e substituir pelas de `_inbox/` quando houver)
6. A Olorin tem selos reais (Google Partner, Meta Business Partner, certificações da Natália)? (padrão: não exibir nenhum)
7. CNPJ, razão social e endereço público, ou "atendimento 100% remoto"? (padrão: omitir e registrar)
8. Natália e Vinicius participam do início do projeto e da reunião mensal com o cliente? (padrão: `[CONFIRMAR]`; ver seção 12.3)
9. Prazo real de resposta: "até 1 dia útil" ou "no mesmo dia útil"? (padrão: manter "até 1 dia útil")
10. Versão do PHP no plano da Locaweb e se o PHP consegue ler arquivos um nível acima do `public_html`. (padrão: PHP 8.x; testar com um script e documentar)

---

## 1. ACHADOS NO CÓDIGO ATUAL (corrigir obrigatoriamente)

Estes problemas foram encontrados nos arquivos publicados hoje. Confirme cada um no `site-atual/` e corrija no site novo; registre o antes/depois em `docs/AUDIT.md`.

**Críticos**
1. `sitemap.xml` lista `https://olorindigital.com.br/` e `https://olorindigital.com.br/politica-de-privacidade/`: **domínio errado** enviado ao Google. Regerar só com `https://olorin.com.br/...`.
2. `404.html` tem o WhatsApp de exemplo `5541900000000` e o domínio errado `olorindigital.com.br`.
3. `config.php` está dentro da pasta pública com a senha SMTP em texto puro (há bloqueio no `.htaccess`, mas é frágil). Mover para fora do `public_html` se o PHP permitir (`../olorin-config.php`); senão, manter com bloqueio e `<?php` no topo. Entregar `config.example.php`.
4. **Contrato do formulário quebrado:** o HTML envia o tempo de preenchimento como `olorin_ts`, mas o `enviar.php` lê `olorin_tempo`, então a checagem de tempo mínimo **nunca roda**. Corrija o back-end para ler `olorin_ts` (e aceite `olorin_tempo` por compatibilidade).
5. **Serviço sem opção no formulário:** a whitelist `servicos` do `config.php` não tem "Rastreamento e relatório", mas existe o card na home (e terá página própria). Acrescente a opção no front **e** na whitelist do back, senão o `array_intersect` descarta a escolha.
6. Os pedidos ficam em `leads/pedidos.csv` **dentro** da pasta pública. Mover para fora (`../leads/AAAA-MM.csv`), mantendo o bloqueio atual como fallback.
7. `.htaccess`: o comentário fala em "HTTPS obrigatório", mas **as linhas de redirecionamento não existem**. Não há redirecionamento `http→https` nem `www→sem www`. Ver seção 18.

**Importantes**
8. Arquivos que não deveriam estar no ar: `license.txt` (licença do WordPress, sobra da exportação, revela a origem do site), `error.log` (mensagens `downloader::recursive Timeout`, sobra da cópia do site), `LEIA-ME.txt` (bloqueado, mas desnecessário). Não levar para o `dist/`; documentar a remoção no servidor em `docs/DEPLOY.md`.
9. CSS morto: o `<style id="wp-block-library-inline-css">` traz presets padrão do WordPress que a marca não usa (`vivid-red`, `pale-pink`, `luminous-vivid-amber`, gradientes etc.) e a folha `assets/wp/blocks/paragraph/style.min.css`. Remover tudo o que não for usado; manter só os tokens da marca.
10. `window.OLORIN = {restUrl, whatsapp, waMsg, cursor, pixelId:"", hasConsent:false}`: substituir pela configuração da seção 13.1.
11. `<link rel="preload">` aponta para `archivo-expanded-900` e `cascadia-code-400`, mas a cadeia crítica medida usa `archivo-expanded-800`, `cascadia-code-700` e `silkscreen-400`. Alinhar (seção 14).
12. `hero-celular.webp` sem `width`/`height` e sem `srcset`; `sobre-bastidores.webp` sem dimensões.
13. Texto: "Esteve **a** frente" → "Esteve **à** frente"; "recomendo" (2 ocorrências, incluindo o JSON-LD do FAQ) → "recomendamos"; padronizar tudo em "nós".
14. A mesma mensagem genérica de WhatsApp aparece em quase todos os links; não dá para saber a origem das conversas (seção 13.4).
15. Rodapé com `olorin.digital ©` → `Olorin Digital ©`.
16. Contradições de comunicação: "Poucas marcas por vez" × "87+ marcas atendidas"; a dor "você fala com o atendimento, nunca com quem faz" × o Derek apresentado como "o atendimento" (seção 12.3).

---

## 2. CONTEXTO DO NEGÓCIO

**Olorin Digital** é uma agência de marketing digital de Curitiba/PR, com 3 pessoas e atendimento 100% remoto para clientes de todo o Brasil (a maioria fora de Curitiba). Lema: **"Não é sobre aparecer. É sobre vender."** Proposta: anúncio, conteúdo, site e impresso feitos pelo mesmo time, com preço aberto e relatório que qualquer pessoa entende. Nome do modelo de trabalho: **Método Olorin** (Diagnóstico → Direção → Execução → Leitura).

**Equipe (apenas estes fatos; não aumente):**
- **Natália Arruda**: analista de mídia paga há mais de seis anos; operou contas de comércio eletrônico, serviço, indústria, educação e campanha política.
- **Vinicius Mafra**: diretor de arte e designer há mais de 10 anos; esteve à frente de diversos projetos, de influenciadores digitais a produções culturais.
- **Derek Gonçalves**: comunicador digital com atuação 360 e o atendimento da Olorin.

**Contatos:**
- WhatsApp: `5541996460861`, exibido como `(41) 99646-0861` (sujeito à pergunta 0.5.1)
- E-mail: `digital@olorin.com.br`
- Instagram: `@olorin.digital_` (`https://instagram.com/olorin.digital_`)
- Cidade: Curitiba, PR · Domínio único: `https://olorin.com.br`
- Hospedagem: **Locaweb, Apache + PHP, hospedagem compartilhada**, publicação por FTP em `public_html`

**Planos e preços (não alterar sem ordem do dono):**
| Plano | Valor | Inclui |
|---|---|---|
| Pontual | a partir de R$ 800 /projeto | Uma entrega específica e fechada; identidade visual, site ou impresso; auditoria da conta de anúncio; prazo e escopo definidos no briefing |
| Gestão mensal (mais procurado) | R$ 2.500 /mês | Tráfego pago + conteúdo todo mês; criação de peças inclusa; otimização semanal das campanhas; relatório fechado todo mês |
| 360 completo | R$ 5.000 /mês | Estratégia, anúncio, redes e criação; material impresso e site; a marca inteira sob o mesmo comando; reunião estratégica mensal |

Nota fixa: *valores de gestão; a verba de anúncio é investida à parte, direto nas plataformas (Meta e Google)*. Verba mínima recomendada: **R$ 1.500/mês** (custo total de entrada na gestão mensal: a partir de **R$ 4.000/mês**, e isso deve ficar claro). Contrato mínimo de 3 meses na gestão mensal; depois, mês a mês com aviso de 30 dias; **sem multa rescisória**.

---

## 3. IDENTIDADE VISUAL (fonte: `_brand/`)

### 3.1 Extração
1. Leia o manual de marca página por página e extraia para `docs/BRAND.md`: logo (versões, área de proteção, tamanho mínimo, usos proibidos), paleta (HEX/RGB, proporções de uso), tipografia (famílias, pesos, hierarquia), grafismos, iconografia, tratamento de fotos, tom de voz e exemplos de aplicação.
2. Compare com o que está em produção: cores `preto #000000`, `branco #FFFFFF`, `verde #ECFF36`, `violeta #7E3BED`; fontes **Archivo Expanded** (títulos), **Cascadia Code** (apoio) e **Silkscreen** (detalhes); estética de janelas `.exe` (`relatorio.exe`, `case_01.exe`, `orcamento.exe`, `whatsapp.exe`) e rótulos tipo `projeto_01.jpg`.
3. **Se o manual divergir do site**, o manual vence. Registre cada divergência em `docs/BRAND.md` (o que mudou e por quê).
4. Gere `src/styles/tokens.css` com variáveis semânticas (`--cor-fundo`, `--cor-texto`, `--cor-destaque`, `--cor-acento`, espaçamentos em escala, raios, bordas, sombras "duras" estilo janela anos 90, durações de animação) e use **só** tokens no restante do CSS.
5. Use os arquivos de logo do `_brand/` (SVG otimizado com SVGO, `title` acessível); gere favicon SVG, PNG 32, apple-touch-icon 180 e `site.webmanifest` a partir deles.
6. Fontes: use os arquivos `.woff2` que já existem em `site-atual/assets/fonts/` ou os de `_brand/` (verifique a licença de uso na web e registre). Subset em latim + caracteres do pt-BR.

### 3.2 Regras de evolução
- A estética é **"anos 90 descolada"**: janelas `.exe` com barra de título, botões de minimizar/fechar decorativos, bordas sólidas, sombras deslocadas, tipografia pixel em detalhes. Use isso com moderação e propósito: uma janela por bloco de destaque, não em tudo.
- Crie uma **biblioteca de componentes** reutilizáveis: `janela-exe` (com título tipo `nome_arquivo.ext`), `botao` (primário, secundário, link), `chip`, `card-servico`, `card-plano`, `card-pessoa`, `case`, `faixa-marquee`, `etiqueta-pixel`, `acordeao`, `barra-mobile`, `breadcrumb`.
- Tratamento de foto consistente (definido pelo manual; se ele não definir, proponha um, por exemplo moldura de janela + leve duotone verde/violeta só em imagens decorativas, nunca em fotos de cliente ou de portfólio) e documente.
- Ícones: um único estilo (SVG inline, traço ou pixel, conforme o manual), `aria-hidden="true"` quando decorativos.

### 3.3 Contraste (já calculado; respeite)
- Verde `#ECFF36` sobre preto: 18,9:1 ✔ (qualquer texto).
- Texto branco sobre violeta `#7E3BED`: 5,6:1 ✔.
- Verde sobre violeta: 5,1:1 ✔.
- Texto preto sobre violeta: 3,7:1, **só para títulos grandes** (≥ 24 px, ou ≥ 18,66 px em negrito).
- Verde sobre branco: 1,1:1 ✘ **nunca** (nem em texto, nem em ícone com significado, nem em borda de campo).

### 3.4 Guia de estilo vivo
Gere `/_estilo/` (só no build de desenvolvimento, nunca no `dist/` de produção) mostrando tokens, tipografia e todos os componentes em todos os estados (hover, foco, erro, desabilitado). Serve para o dono revisar e para QA visual.

---

## 4. BENCHMARK: O QUE OS SITES DE AGÊNCIA QUE MAIS CONVERTEM FAZEM

### 4.1 Padrões já levantados (aplique)
Análises recentes de sites de agências de marketing (2026) apontam um padrão claro, que vira decisão de projeto aqui:

| Padrão de sucesso | Referência para estudar | Decisão para a Olorin |
|---|---|---|
| **Preço aberto** é raro e diferencia; ajuda a pessoa a se qualificar sozinha | hookagency.com (página de preços + vídeo explicando o serviço) | Manter preços públicos, mostrar o **custo total** (gestão + verba) e criar a calculadora da seção 8 |
| **Formulário na primeira dobra**: cada clique entre o interesse e o envio perde gente | smartsites.com | Etapa 1 do formulário logo abaixo do banner (seção 10.5) |
| **Vários caminhos de contato** para tipos diferentes de pessoa | scorpion.co (barra fixa com várias opções) | Formulário + WhatsApp + agendamento (se houver link), sempre visíveis, sem competir na mesma tela |
| **Nomear o modelo de serviço** torna a oferta concreta | nogood.io ("growth squad") | Usar "Método Olorin" e "o mesmo time" como nomes fixos |
| **Uma página profunda por serviço**: cada uma é uma porta de entrada na busca | truenorthsocial.com, ignitevisibility.com | 6 páginas de serviço completas (seção 9), com índice de seções para não enterrar preço e contato |
| **Mostrar o time** com foto e trajetória: agência é relação | hookagency.com, animalz.co | Cartões de equipe na home, nas páginas de serviço ("quem faz") e página `/sobre/` |
| **Ferramenta interativa que demonstra o serviço** ("mostre, não diga") | animalz.co | Checklist de dores (já existe) + calculadora de custo de entrada + relatório de exemplo |
| **Prova de terceiros > autoelogio**; case com número, período e contexto | ignitevisibility.com, digitalsilk.com | Só números e selos verificados (`content/claims.json`), cases completos, avaliações do Google quando houver |
| **Linguagem do público**, não de agência | strictlyplumbers.com, scorpion.co | Dores escritas como o dono de negócio fala; futura fase com páginas por segmento (seção 21) |
| **Texto simples converte mais**: páginas escritas em linguagem fácil têm taxa mediana de conversão muito maior que as escritas em tom "profissional"; a maioria das visitas vem do celular | Relatório de benchmark de conversão da Unbounce | Frases curtas, palavras comuns, meta de legibilidade na seção 17; projetar primeiro para 360 px |
| **Confiança de uma frase só no banner**: um título forte respirando vale mais que um hero lotado | wearecollins.com (como princípio, não como modelo) | Um H1, um parágrafo, **um** botão principal e um link secundário |

Referências brasileiras para comparar posicionamento e oferta de entrada (não copiar): **V4 Company** (assessoria de performance com diagnóstico como porta de entrada), **Agência Mestre** (autoridade por conteúdo), **NP Digital Brasil** (performance + SEO). Agências de Curitiba que aparecerem na busca por "agência de marketing digital em Curitiba" também entram no estudo.

### 4.2 Sua pesquisa (Fase 0, com WebSearch/WebFetch)
1. Visite as referências acima e as **5 primeiras agências** que aparecerem no Google para "agência de marketing digital em Curitiba" e "gestão de tráfego pago Curitiba".
2. Para cada uma, registre em `docs/BENCHMARK.md`: oferta de entrada, CTA principal, posição do formulário, como mostra preço, como mostra prova, estrutura das páginas de serviço, uma coisa a adotar e uma coisa a evitar.
3. Feche com uma tabela "o que a Olorin faz melhor / o que falta" e confirme ou ajuste as decisões da 4.1.
4. **Nunca copie** textos, layouts, imagens ou marcas de terceiros. Inspire-se em padrões, não em peças.

---

## 5. OBJETIVOS E INDICADORES

**Negócio:** gerar mais leads **qualificados** (verba compatível) a custo menor, com medição confiável do clique ao fechamento.

**Definição de pronto técnica:**
- Lighthouse mobile em **todas** as páginas: Desempenho ≥ 95 (meta 98+), Acessibilidade 100, Práticas recomendadas 100, SEO 100. LCP ≤ 2,0 s, CLS 0, TBT ≤ 100 ms, INP saudável (sem tarefas longas em interações).
- Zero erros no console, zero links quebrados, HTML válido, zero IDs duplicados, zero violações axe.
- Todos os eventos da seção 13 disparando (testados com Playwright), sem dados pessoais.
- `grep` do domínio errado = 0; nenhum `[CONFIRMAR]` no `dist/`.

**Funil a medir:** visita → clique em CTA → início do formulário → etapa 1 → envio (lead) → conversa no WhatsApp → proposta → fechamento (as duas últimas são manuais; o lead deve chegar com origem e UTM).

---

## 6. STACK, ESTRUTURA E EDIÇÃO

### 6.1 Decisão
Gerador de site estático leve: **Eleventy (11ty), versão estável atual, com Nunjucks**. Motivos: gera HTML puro (desempenho igual ao atual), não manda JavaScript de framework para o visitante, roda na hospedagem compartilhada sem nada especial e permite editar o conteúdo em arquivos de dados. O PHP fica **só** no `enviar.php`. Se encontrar um motivo técnico forte contra o Eleventy, documente em `docs/PLAN.md` e use um script Node simples equivalente.

### 6.2 Estrutura
```
src/
  _includes/layouts/   base.njk, servico.njk, campanha.njk, simples.njk
  _includes/partials/  header, footer, form, cookie-banner, mobilebar, schema
  _includes/components/ janela-exe, card-servico, card-plano, card-pessoa, case, faq, breadcrumb...
  _data/               site.config.json (seção 13.1), navegacao.yml
  content/
    home.yml           ← textos E ORDEM dos blocos da home (lista "secoes:")
    servicos/*.yml     ← uma fonte por serviço (seção 9.4)
    faq.yml, equipe.yml, planos.yml, claims.json, cases.yml, depoimentos.yml
  styles/              tokens.css, base.css, componentes/*.css (concatenado e minificado no build)
  scripts/             olorin.js (módulos pequenos, empacotados com esbuild)
  assets/              fontes, imagens processadas, logos
  php/                 enviar.php, config.example.php
dist/                  ← resultado final que vai para o public_html
```

### 6.3 Comandos (no `package.json`)
- `npm run dev`: servidor local com recarga, `/_estilo/` e marcadores `[CONFIRMAR]` visíveis.
- `npm run build`: gera `dist/` de produção (minifica, faz hash nos nomes de CSS/JS, gera sitemap, falha se houver `[CONFIRMAR]`, domínio errado, imagem sem `alt` ou title/description fora do limite).
- `npm run test`: Playwright + axe + validações (seção 20).
- `npm run deploy:dry` e `npm run deploy`: envio por FTPS para a Locaweb com `lftp mirror` (ou `basic-ftp` em Node), lendo `FTP_HOST`, `FTP_USER`, `FTP_PASS` do `.env`. **Nunca apagar no servidor** `config.php`, `../leads/`, `.well-known/` nem arquivos fora do `dist/` conhecidos. O `deploy` sempre roda o `build` e o `test` antes.
- Teste local do PHP: `php -S localhost:8080 -t dist` com um `config.php` local de teste (SMTP desligado, só CSV).

### 6.4 Editar depois sem programador
Escreva `docs/EDITAR.md` em português simples: como trocar um texto (qual arquivo `.yml`, qual campo), como **reordenar ou esconder blocos da home** (lista `secoes:` em `home.yml`), como trocar preços, adicionar uma pergunta no FAQ, adicionar um case aprovado, trocar uma foto, e como rodar `npm run build` + `npm run deploy`. Inclua exemplos antes/depois. (Um painel tipo CMS fica como fase futura na seção 21.)

---

## 7. MAPA DE PÁGINAS E URLs

| URL | Página | Indexável | Observação |
|---|---|---|---|
| `/` | Home | sim | Seção 8 |
| `/servicos/` | Hub de serviços | sim | Os 6 serviços, como escolher, combinações e planos resumidos |
| `/servicos/trafego-pago/` | Serviço | sim | Seção 9 |
| `/servicos/redes-sociais/` | Serviço | sim | |
| `/servicos/identidade-visual/` | Serviço | sim | |
| `/servicos/material-impresso/` | Serviço | sim | |
| `/servicos/site-e-loja-virtual/` | Serviço | sim | |
| `/servicos/rastreamento-e-relatorio/` | Serviço | sim | |
| `/sobre/` | A Olorin e o time | sim | História, Método Olorin, 3 pessoas com bio, como trabalhamos remoto |
| `/cases/` e `/cases/<slug>/` | Cases | sim | **Só são gerados se houver ao menos 1 case aprovado** em `cases.yml` |
| `/promo/` | Landing de campanha geral | **não** | Seção 11 |
| `/promo/<slug>/` | Serviço em modo campanha | **não** | `canonical` para `/servicos/<slug>/` |
| `/obrigado/` | Confirmação do lead | **não** | Conversões Google Ads/Meta |
| `/politica-de-privacidade/` | Existente, atualizada | sim | Seção 13.3 |
| `/404.html` | Erro com a marca | não | Busca de serviços, home, WhatsApp |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt` | Técnicos | n/a | Seção 15 |

**Menu principal (desktop):** Serviços (menu suspenso com os 6 + "Ver todos") · Método · Cases (só se existir) · Planos · Sobre · Dúvidas · botões "Falar no WhatsApp" (secundário) e "Diagnóstico gratuito" (primário). **Celular:** logo + hambúrguer; serviços em acordeão.

**Regra:** cada serviço tem **uma única fonte de conteúdo** (`content/servicos/<slug>.yml`) renderizada em dois modos (`completo` e `campanha`). Nada de texto duplicado à mão.

**Persistência de origem:** ao chegar com `utm_*`, `gclid`, `gbraid`, `wbraid` ou `fbclid`, guarde em `sessionStorage` (primeiro e último toque) e envie tudo no formulário, em qualquer página.

---

## 8. HOME: ORDEM, COMPONENTES E COPY

A ordem abaixo é o padrão de `home.yml` (editável depois):

1. **Cabeçalho** (seção 7).
2. **Banner (hero)**
   - Linha superior: `Agência de marketing digital em Curitiba · Tráfego pago · Conteúdo · Site · Impresso`
   - H1 (manter): `Não é sobre aparecer. É sobre vender.`
   - Parágrafo: `Anúncio, conteúdo, site e impresso feitos pelo mesmo time de 3 especialistas. Sua marca falando a mesma língua em todo lugar — e cada real investido com nome, sobrenome e retorno.`
   - **Um** botão principal: `Quero meu diagnóstico gratuito` (âncora para a etapa 1 logo abaixo). Link de texto secundário: `ou fale no WhatsApp`.
   - Microtexto: `Sem compromisso · Resposta em até 1 dia útil`.
   - Linha de prova: números só com `SHOW_STATS=true` e contexto; senão `Preços abertos · Sem multa após 3 meses · Relatório mensal`.
   - Imagem/janela `relatorio.exe` ("Vendas do mês"): responsiva (`srcset`/`sizes`, AVIF/WebP, `width`/`height`, `fetchpriority="high"`, sem lazy). No celular (≤ 640 px) com altura máxima de ≈ 280 px **ou** posicionada depois da etapa 1 (escolha a que der melhor LCP e registre).
3. **Formulário, etapa 1 (compacto)** logo abaixo do banner. Mesmo componente do formulário final (seção 10).
4. **Faixa (marquee)**: manter; parada com `prefers-reduced-motion`.
5. **Checklist de dores** ("Se você se reconhece aqui…"): botões reais com `aria-pressed`, operável por teclado. Ao marcar 2 ou mais itens, mostrar uma frase de resposta coerente e o CTA `Ver como a gente resolve`.
6. **Método Olorin** (Diagnóstico, Direção, Execução, Leitura). CTA `Pedir diagnóstico`.
7. **Serviços** (grade de quadrados com ícones): **cada card é um link** para `/servicos/<slug>/` com "Ver detalhes" e seta. Padrão acessível: um único `<a>` no título, estendido com `::after { position:absolute; inset:0 }`. Foco visível, hover, evento `service_card_click`. Abaixo: `Precisa de um desses agora? Chamar no WhatsApp`.
8. **Resultados e prova** (seção 12): números verificados, cases completos, depoimentos, logos aprovados. Sem itens aprovados, a seção mostra o **relatório de exemplo** no lugar.
9. **Portfólio** com filtros (Tudo, Marca, Campanha, Site, Impresso, Redes sociais), botões com `aria-pressed`. "Ver mais trabalhos" abre o Instagram em nova aba (`rel="noopener"`).
10. **Quem toca** (equipe): 3 cartões com foto, nome, função e frase (seção 12.3). Link para `/sobre/`.
11. **Como é o nosso relatório** (seção 12.4).
12. **Planos** (3 cartões) com linha de custo total, garantias nos cartões e **calculadora de custo de entrada**: a pessoa escolhe o plano e a faixa de verba e vê "Gestão R$ X + verba R$ Y = a partir de R$ Z por mês", com o aviso de que a verba vai direto para Meta/Google. Sem JS, mostra uma tabela estática equivalente. O botão "Quero esse" preenche o campo oculto `plano` e pré-seleciona serviços.
13. **FAQ ampliado** (seção 12.6), `<details>/<summary>`, mesma fonte para HTML e JSON-LD.
14. **CTA final + formulário completo**, com `whatsapp.exe` "Prefere resolver agora?".
15. **Rodapé**: `Olorin Digital © 2026 · Curitiba, PR`, contatos, links para os 6 serviços, Sobre, Política de Privacidade, "Preferências de cookies", Instagram; CNPJ/razão social se confirmados.

**Barra fixa do celular** (WhatsApp + Orçamento): manter, **ocultar enquanto um formulário estiver visível** (IntersectionObserver) e enquanto o teclado virtual estiver aberto. **Botão flutuante de WhatsApp** só em telas ≥ 1024 px. Nada pode cobrir campos, botões ou texto (teste em 360×640, 390×844, 412×915).

---

## 9. PÁGINAS DE SERVIÇO (o centro deste projeto)

### 9.1 Princípios
- Cada página precisa funcionar **sozinha**: quem chega do Google ou de um anúncio deve entender o serviço, ver preço, ver quem faz, ver prova e conseguir pedir o diagnóstico sem voltar para a home.
- **Profundidade útil:** 900 a 1.500 palavras úteis no modo completo, sem encher linguiça. Use um **índice de seções** fixo no topo (âncoras) para quem quer ir direto ao preço ou ao FAQ.
- **Resposta curta logo no início** (2 a 3 frases que respondem "o que é, para quem é, quanto custa, em quanto tempo"), pensada para leitores apressados e para buscas com IA (seção 15.3).
- Visual: mesma identidade, mas cada serviço tem uma **janela `.exe` própria** (ex.: `campanhas.exe`, `feed.exe`, `marca.ai`, `grafica.pdf`, `site.html`, `painel.exe`) e um ícone, para que as páginas não pareçam cópias.

### 9.2 Template (modo completo), nesta ordem
1. **Migalhas de pão** (Home › Serviços › {Serviço}) com `BreadcrumbList`.
2. **Hero:** eyebrow com a palavra-chave, H1 específico, subtítulo, CTA `Quero meu diagnóstico gratuito`, **etapa 1 do formulário** e a janela `.exe` do serviço.
3. **Resposta curta** (seção 9.1) em destaque discreto.
4. **"Isso acontece com você?"**: 3 a 4 dores específicas.
5. **Para quem é / para quem não é** (2 colunas): ajuda a pessoa a se qualificar. Use só critérios verdadeiros (ex.: "não é para quem quer começar a anunciar com menos de R$ 1.500 por mês"; outros com `[CONFIRMAR]`).
6. **O que entregamos:** cartões com ícone, itens concretos e **frequência** (ex.: "otimização toda semana", "relatório todo mês").
7. **Como funciona:** as 4 etapas do Método Olorin adaptadas ao serviço; quando houver informação, "primeiros 30 dias / 60 / 90" com `[CONFIRMAR]`.
8. **O que precisamos de você:** acessos, materiais, aprovações (reduz atrito e mostra organização; `[CONFIRMAR]` onde faltar).
9. **Quem faz:** pessoa responsável, foto e frase; link para `/sobre/`.
10. **Resultados e cases** do serviço (filtrados pela tag; sem itens aprovados, a seção não aparece).
11. **Quanto custa:** formato de contratação + custo total quando houver verba + "o que está incluso e o que não está".
12. **Combina com:** 2 serviços relacionados e por quê (link interno com texto âncora descritivo).
13. **FAQ específico** (5 a 6 perguntas, com schema).
14. **CTA final + formulário completo**, com o serviço já marcado nos chips.

### 9.3 Hub `/servicos/`
H1 `Serviços de marketing digital`, parágrafo sobre o mesmo time, os 6 cards (mesmo componente da home), bloco "Como escolher por onde começar" (3 situações comuns → serviço indicado), combinações mais comuns (ex.: tráfego + redes = Gestão mensal), planos resumidos e CTA.

### 9.4 Conteúdo por serviço
> Use apenas fatos deste documento. `title` ≤ 60 caracteres e `description` ≤ 155 (o build valida). Onde houver fato novo, `[CONFIRMAR]`.

**1) Tráfego pago** · `trafego-pago` · janela `campanhas.exe`
- Title: `Gestão de Tráfego Pago em Curitiba | Olorin Digital`
- Description: `Campanhas de Meta Ads e Google Ads com otimização semanal e relatório que mostra o retorno. Gestão a partir de R$ 2.500/mês.`
- H1: `Tráfego pago que mostra quanto cada real investido devolveu.`
- Sub: `Meta Ads e Google Ads para venda, mensagem, cadastro e reconhecimento, com funil estruturado, públicos limpos e otimização toda semana.`
- Dores: investe todo mês e não sabe o custo por venda; relatório só mostra alcance e impressão; conta de anúncio sem estrutura; criativos que não conversam com o site.
- Entregas: estrutura de campanhas e funil; públicos e segmentações; criativos alinhados à marca; otimização semanal; relatório mensal com faturamento, custo e retorno; rastreamento correto (link para Rastreamento e relatório).
- Quem faz: Natália Arruda.
- Preço: Gestão mensal R$ 2.500/mês + verba à parte (recomendamos a partir de R$ 1.500/mês); mínimo de 3 meses, sem multa depois.
- Combina com: Redes sociais; Rastreamento e relatório.
- FAQ: Quanto preciso investir por mês? Em quanto tempo vejo resultado? (sinais claros em 2 a 4 semanas em campanhas de resposta direta) Meta Ads ou Google Ads, qual escolher? Quem é o dono da conta de anúncio? `[CONFIRMAR]` Como é o relatório? Vocês atendem fora de Curitiba?

**2) Redes sociais e conteúdo** · `redes-sociais` · janela `feed.exe`
- Title: `Gestão de Redes Sociais em Curitiba | Olorin Digital`
- Description: `Calendário editorial, posts, stories e legendas com a mesma cara do seu anúncio e do seu site. Incluso na gestão a partir de R$ 2.500/mês.`
- H1: `Um feed que sustenta o anúncio, em vez de brigar com ele.`
- Entregas: calendário editorial; criação de post, story e legenda; alinhamento visual com anúncios e site; relatório mensal.
- Quem faz: Vinicius (arte) e Derek (comunicação) `[CONFIRMAR a divisão]`.
- Preço: incluso na Gestão mensal (tráfego + conteúdo) e no 360. Contratação só de redes `[CONFIRMAR]`.
- Combina com: Tráfego pago; Identidade visual.

**3) Identidade visual e criação** · `identidade-visual` · janela `marca.ai`
- Title: `Criação de Identidade Visual em Curitiba | Olorin Digital`
- Description: `Logotipo, manual de marca, papelaria e todo o material visual. Uma marca com cara de marca, não de improviso. Projetos a partir de R$ 800.`
- H1: `A marca com cara de marca, não de improviso.`
- Entregas: logotipo; manual de marca; papelaria; material visual de apoio.
- Quem faz: Vinicius Mafra.
- Preço: Pontual a partir de R$ 800/projeto `[CONFIRMAR faixa por escopo]`.
- Combina com: Material impresso; Site e loja virtual.

**4) Material impresso** · `material-impresso` · janela `grafica.pdf`
- Title: `Material Impresso para Empresas em Curitiba | Olorin`
- Description: `Cartão, folder, catálogo, banner, adesivo, fachada e embalagem. Arquivo fechado pronto para a gráfica e acompanhamento da prova.`
- H1: `Impresso que conversa com o seu digital.`
- Entregas: cartão, folder, catálogo, banner, adesivo, fachada, embalagem; arquivo fechado pronto para gráfica; indicação de gráficas parceiras em Curitiba; acompanhamento da aprovação da prova. **Diga com clareza: a Olorin entrega o arquivo fechado, não imprime.**
- Preço: Pontual a partir de R$ 800/projeto `[CONFIRMAR]`.
- Combina com: Identidade visual; Redes sociais.

**5) Site e loja virtual** · `site-e-loja-virtual` · janela `site.html`
- Title: `Criação de Sites e Lojas Virtuais em Curitiba | Olorin`
- Description: `Site institucional, loja virtual e página de captação rápidos, bonitos no celular e preparados para converter. Projetos a partir de R$ 800.`
- H1: `Site rápido, bonito no celular e feito para converter.`
- Entregas: site institucional; loja virtual; página de captação; rastreamento configurado; velocidade e acessibilidade como padrão.
- Prova permitida: este próprio site foi medido em 97/100/100/100 no PageSpeed mobile em 08/10/2026 (atualize com a medição final do site novo, citando a data).
- Preço: Pontual a partir de R$ 800/projeto `[CONFIRMAR para site/loja]`.
- Combina com: Rastreamento e relatório; Tráfego pago.

**6) Rastreamento e relatório** · `rastreamento-e-relatorio` · janela `painel.exe`
- Title: `Rastreamento e Relatório de Marketing (GTM e GA4) | Olorin`
- Description: `Google Tag Manager, pixel, conversões e painel de acompanhamento para saber quanto entrou, quanto saiu e qual foi o retorno.`
- H1: `Se o dado não chega certo, nada depois disso funciona.`
- Entregas: configuração do GTM; GA4; pixel da Meta; conversões do Google Ads; painel de acompanhamento; relatório que mostra faturamento, não só alcance.
- Preço: `[CONFIRMAR]` (incluso na gestão mensal? projeto pontual?).
- Combina com: Tráfego pago; Site e loja virtual.

---

## 10. FORMULÁRIO (COMPONENTE ÚNICO)

### 10.1 Campos (mantenha os nomes atuais, que o back-end já entende)
**Etapa 1:** `nome` (obrigatório, 2 a 80), `whatsapp` (obrigatório, máscara `(41) 99999-9999`, DDD válido, `inputmode="tel"`, `autocomplete="tel-national"`), `site` (opcional: `@suamarca` ou URL).
**Etapa 2:** `servicos[]` (chips múltiplos: Tráfego pago · Redes sociais e conteúdo · Identidade visual e criação · Material impresso · Site ou loja virtual · **Rastreamento e relatório** · Ainda não sei, quero conversar), `investimento` (select atual: Ainda não invisto; Até R$ 2 mil por mês; De R$ 2 a 5 mil por mês; De R$ 5 a 15 mil por mês; Acima de R$ 15 mil por mês), `mensagem` (opcional), `consentimento` (checkbox com link para a Política) e botão `Pedir orçamento` (em campanhas: `Quero meu diagnóstico`).
Microcopy (manter): `Seus dados são usados só para esse contato. Nada de lista de disparo.`

### 10.2 Campos ocultos
`olorin_ts`, `plano`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `gbraid`, `wbraid`, `fbclid`, `pagina`, `referencia`, `modo_pagina` (`home|servico|promo|sobre`), `servico_pagina`, `variante_formulario` (`a|b`) e o honeypot **`empresa_url`** (fora da tela, `tabindex="-1"`, `autocomplete="off"`, `aria-hidden="true"`; nunca só `display:none`).

### 10.3 Comportamento e acessibilidade
- Erros por campo com `aria-describedby` e região `aria-live="polite"`; foco no primeiro campo inválido; ao trocar de etapa, foco no título da nova etapa; botão "voltar" sem perder dados.
- Sem JavaScript: o formulário envia normalmente (o `enviar.php` já redireciona com `?orcamento=ok|erro`) e um link de WhatsApp fica visível.
- Alvos de toque ≥ 44 px; campos com `font-size` ≥ 16 px; estado de envio acessível e bloqueio de duplo clique.
- Ao escolher "Ainda não invisto", mostrar uma linha honesta: `Sem problema: começamos pelo diagnóstico e te dizemos por onde vale começar.`

### 10.4 Back-end (`enviar.php`): evoluir sem quebrar o contrato JSON atual
- Corrigir a leitura do tempo (`olorin_ts`, seção 1.4) e incluir "Rastreamento e relatório" na whitelist (1.5). Aceitar `gbraid`, `wbraid`, `modo_pagina`, `servico_pagina`, `variante_formulario`.
- Validação e sanitização no servidor; normalizar WhatsApp para `+55DDDNÚMERO`.
- Anti-spam: honeypot, tempo mínimo ≥ 3 s, limite por IP (já existe: 6 em 10 min; manter), checagem de `Origin`/`Referer` do mesmo domínio, proteção contra injeção de cabeçalho.
- SMTP autenticado da Locaweb (o cliente SMTP atual funciona; mantenha-o, reforçando timeouts e o tratamento de erro). Assunto: `Novo lead: {serviço ou plano} | {origem}`.
- CSV mensal **fora** da pasta pública (`../leads/AAAA-MM.csv`), com proteção contra injeção de fórmula (já existe; manter).
- Webhook opcional (`LEAD_WEBHOOK_URL`, timeout curto, falha silenciosa).
- Resposta JSON compatível com o front atual (`ok`, `message`, `fields`, `whatsapp`). No erro, o front mostra a mensagem e um WhatsApp pré-preenchido com os dados já digitados.
- **Sucesso:** redirecionar para `/obrigado/` (sem dados pessoais na URL); `generate_lead` dispara lá, uma única vez por envio (token de envio em `sessionStorage`).

### 10.5 Posição do formulário (A/B)
`FORM_TOP_VARIANT = 'ab' | 'a' | 'b'` em `site.config.json`. **A:** só no fim. **B (padrão):** etapa 1 abaixo do banner + completo no fim. Modo `ab`: sorteio 50/50 na primeira visita, guardado em `sessionStorage`, override `?v=a|b`, variante no `dataLayer` e no campo oculto. Em `/promo/*` o formulário fica sempre no topo.

### 10.6 Página `/obrigado/`
`Recebido. Vamos montar sua proposta e te chamar no WhatsApp.` · botão `Adiantar pelo WhatsApp` (mensagem com `[ref: obrigado]`) · link de agendamento se `SCHEDULING_URL` existir · "Enquanto isso": links para Método Olorin e relatório de exemplo · `noindex`. É aqui que disparam as conversões de Google Ads e Meta.

---

## 11. LANDINGS DE CAMPANHA

### 11.1 Modo campanha (`/promo/<slug>/`, mesma fonte do serviço)
Cabeçalho mínimo (logo + 1 botão), **sem menu**, sem links de saída além de WhatsApp e Política. Ordem: hero com **formulário completo no topo** → prova disponível → "Como funciona" em 3 passos → preço resumido com custo total → 4 perguntas do FAQ → CTA final. `<meta name="robots" content="noindex,follow">`, `canonical` para `/servicos/<slug>/`, cabeçalho `X-Robots-Tag: noindex, follow`, `data-mode="campanha"` no `<body>`, `page_mode: "campanha"` no `dataLayer`. **Não** bloquear no `robots.txt`. Sem pop-ups, sem contadores falsos, sem escassez inventada, sem promessas proibidas pelas políticas do Google e da Meta.

### 11.2 Landing geral `/promo/`
Oferta **Diagnóstico gratuito da sua marca** (`OFERTA_DIAGNOSTICO=true`; se `false`, vira "Peça seu orçamento").
- H1: `Descubra onde o seu marketing está travado.` Sub: `Diagnóstico gratuito de anúncio, redes, site e material impresso, feito por quem executa. Sem compromisso.`
- Formulário completo ao lado do texto (desktop) ou logo abaixo (celular).
- Prova + "Como funciona" em 3 passos (1. Você conta sobre a marca; 2. Fazemos o diagnóstico; 3. Você recebe a proposta com preço aberto) + preço resumido + FAQ de 4 perguntas (tempo, verba mínima, contrato, atendimento remoto) + CTA.
- `?s=<slug>` troca **só** título, subtítulo e imagem pelo serviço do anúncio (coerência anúncio × página), com fallback ao texto geral e whitelist de slugs.

---

## 12. PROVA SOCIAL, EQUIPE, IMAGENS E CONFIANÇA

### 12.1 Protocolo de imagens (`_inbox/`)
1. **Inventário** em `src/assets/manifest.json`: `arquivo_original`, `categoria` (`equipe|cliente-logo|case|portfolio|depoimento|bastidor|marca|outro`), `pessoa_ou_cliente`, `servico_tags[]`, `alt`, `autorizacao_de_uso` (`confirmada|pendente`), `observacoes`. Se os nomes não ajudarem, **olhe a imagem** e deduza, registrando a dedução para o dono revisar.
2. **Otimização** com `sharp`: AVIF + WebP em larguras responsivas (360, 480, 720, 960, 1280), `width`/`height` reais, `srcset`/`sizes`, sem EXIF/GPS; originais fora do `dist/`. Rostos: recortes 4:5 e 1:1 com foco no rosto. Peso alvo: cartões ≤ 60 KiB, portfólio ≤ 120 KiB por derivado.
3. **Alt descritivo** (nunca "imagem" ou "foto"); decorativas com `alt=""`.
4. **LGPD e direitos:** logos de clientes, rostos de terceiros e prints de conversa ficam `pendente` e **não são publicados** sem estar em `APPROVED_ASSETS`. Nunca exibir telefone ou sobrenome em print sem autorização; se não for possível desfocar e conferir visualmente, marcar como pendente de edição manual.
5. **Nada de banco de imagens nem rostos gerados por IA.** Faltou foto: placeholder com iniciais na estética `.exe` + registro no CONTENT-TODO.
6. **Imagens de compartilhamento** (`og:image` 1200×630) para home, hub, cada serviço, sobre e `/promo/`, geradas em HTML/CSS com a identidade e capturadas com Playwright.

### 12.2 Números e cases
- `content/claims.json` com `valor`, `rotulo`, `periodo`, `criterio`, `verificado`. Só renderiza item com `verificado: true` e `periodo`/`criterio` preenchidos (linha pequena: "base: contas gerenciadas de 20XX a 2026").
- Case completo: cliente (ou segmento), situação, o que fizemos, resultado (com período, verba e como foi medido), serviços, imagem, depoimento. Os 3 cases atuais (E-commerce de moda: R$ 380k em 90 dias; Clínica estética: 8x de retorno; Indústria alimentícia: do zero ao mercado em 3 meses) **só aparecem** com o contexto preenchido; caso contrário, ficam ocultos.
- Resolver a frase "Poucas marcas por vez" conforme o número final confirmado.

### 12.3 Equipe e promessa de atendimento
- **Natália Arruda**, Mídia paga. `Mais de seis anos operando contas de e-commerce, serviço, indústria, educação e campanha política.`
- **Vinicius Mafra**, Direção de arte e design. `Mais de 10 anos à frente de projetos, de influenciadores digitais a produções culturais.`
- **Derek Gonçalves**, Atendimento e comunicação 360. `Seu primeiro contato e quem coordena a sua conta.`
- Texto de apoio (`[CONFIRMAR]`, pergunta 0.5.8): `Natália e Vinicius participam do início de cada projeto e da reunião mensal, então você fala com quem executa.` Se não for verdade, **ajuste a promessa** ("Você fala com quem faz") e a dor correspondente; nunca invente processo. Botão: `Falar com a equipe no WhatsApp`.
- Na página `/sobre/`: bio um pouco mais longa (só fatos), `Person` no schema ligado à organização.

### 12.4 Relatório de exemplo
Seção "Como é o nosso relatório": painel em HTML/SVG (leve, acessível, com tabela equivalente para leitor de tela) com investimento, faturamento atribuído, custo por venda, retorno, comparação com o mês anterior e "o que faremos na próxima rodada". Se o dono mandar um relatório real em `_inbox/`, use-o com dados sensíveis cobertos. Senão, dados fictícios com o rótulo **"Exemplo ilustrativo, com dados fictícios"** sempre visível.

### 12.5 Planos
Três cartões; linha fixa `Valores de gestão. A verba de anúncio (recomendamos a partir de R$ 1.500/mês) é investida à parte, direto nas plataformas Meta e Google.`; destaques `Sem multa após 3 meses`, `Relatório mensal`, `Otimização semanal` onde se aplicar; calculadora de custo de entrada (seção 8.12); `SHOW_TOTAL_COST=true` mostra "Custo total de entrada: a partir de R$ 4.000/mês".

### 12.6 FAQ (fonte única → HTML + JSON-LD)
Manter as 7 atuais, em "nós" ("Não cobramos multa rescisória", "recomendamos pelo menos R$ 1.500/mês"), e acrescentar (respostas só com fatos ou `[CONFIRMAR]`): Vocês atendem o meu segmento? Como é o relatório? Quem cuida da minha conta no dia a dia? Já tenho agência, como funciona a troca? E se eu ainda não tiver verba? Quem é o dono das contas de anúncio, do site e dos arquivos? Cada pergunta ganha um `id` estável (para links e para o evento `faq_open`).

### 12.7 Confiança formal
Rodapé com `Olorin Digital ©`, e-mail, WhatsApp, cidade; CNPJ e razão social se confirmados; link de avaliações do Google se `GBP_URL` existir; selos de parceiro **só** se a pergunta 0.5.6 confirmar.

---

## 13. RASTREAMENTO, CONSENTIMENTO E LGPD

### 13.1 `src/_data/site.config.json`
`WHATSAPP`, `EMAIL`, `GTM_ID`, `GA4_ID`, `META_PIXEL_ID`, `GADS_CONVERSION_ID`, `SCHEDULING_URL`, `GBP_URL`, `SHOW_STATS`, `SHOW_TOTAL_COST`, `OFERTA_DIAGNOSTICO`, `FORM_TOP_VARIANT`, `APPROVED_ASSETS`, `LEAD_WEBHOOK_URL` (este só no PHP). Uma pequena parte vai para o navegador como `window.OLORIN_CONFIG` (sem segredos).

### 13.2 Banner de consentimento próprio
Três ações com **o mesmo peso visual**: `Aceitar tudo`, `Recusar`, `Personalizar` (Necessários, Análise, Marketing). Escolha em `localStorage` com data; "Preferências de cookies" no rodapé reabre. **Consent Mode v2** com padrão `denied` para `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`; o GTM só carrega depois de uma escolha que permita Análise e/ou Marketing, e após interação/ociosidade para não afetar o LCP. O banner não pode causar CLS nem cobrir o botão principal no celular.

### 13.3 Política de Privacidade
Atualizar (rascunho para revisão jurídica do dono): dados coletados no formulário, finalidade, base legal, cookies e ferramentas (GTM, GA4, Meta, Google Ads), retenção dos leads, direitos do titular e contato do encarregado `[CONFIRMAR]`. Data de atualização visível.

### 13.4 Eventos (`window.dataLayer`, via função única `track()`)
Parâmetros comuns: `page_mode`, `page_slug`, `form_variant`, UTMs guardadas.

| Evento | Quando | Parâmetros |
|---|---|---|
| `cta_click` | CTA com ID `cta-*` | `cta_id`, `cta_label`, `cta_position`, `destino` |
| `whatsapp_click` | Qualquer link `wa.me` | `origem`, `servico` |
| `service_card_click` | Card de serviço (home/hub) | `servico` |
| `form_view` | Formulário 50% visível | `posicao` |
| `form_start` | Primeiro foco em campo | `posicao` |
| `form_step1_complete` | "Continuar" válido | `posicao` |
| `form_error` | Erro de validação/servidor | `campo`, `tipo` |
| `generate_lead` | Na `/obrigado/`, uma vez | `plano`, `servicos`, `verba_faixa`, `servico_pagina` |
| `pricing_plan_click` | "Quero esse" | `plano` |
| `calculator_use` | Uso da calculadora | `plano`, `verba_faixa` |
| `faq_open` | Pergunta aberta | `pergunta_id` |
| `scroll_depth` | 25/50/75/90% | `percent` |
| `section_view` | Seções principais | `secao` |
| `consent_update` | Mudança de consentimento | `analytics`, `marketing` |

- **Nunca** enviar nome, telefone ou e-mail ao `dataLayer`.
- Mapeamento: GA4 eventos-chave `generate_lead` e `whatsapp_click`; Meta `Lead`, `Contact`, `ViewContent` (páginas de serviço); Google Ads na `/obrigado/`.
- **`waLink(origem, contexto)`** monta `https://wa.me/<WHATSAPP>?text=...` com mensagem pertinente + sufixo ` [ref: {origem}]` (ex.: `Oi! Vim pelo site da Olorin e quero falar sobre Tráfego pago. [ref: servico-trafego-pago-hero]`). Origens: `hero`, `barra-mobile`, `flutuante`, `planos-{plano}`, `faq`, `rodape`, `obrigado`, `equipe`, `sobre`, `servico-{slug}-{posicao}`, `promo-{posicao}`, `404`. Substituir **todas** as ocorrências atuais.
- Entregar `docs/TRACKING.md` (tags, gatilhos e variáveis do GTM; checklist com Tag Assistant e Meta Pixel Helper) e `gtm-container.json` importável, se viável.

---

## 14. PERFORMANCE

- **Hero:** `srcset`/`sizes`, AVIF/WebP, `width`/`height`, `fetchpriority="high"`, sem lazy; de ≈ 83 KiB para ≤ 45 KiB.
- **CSS:** um arquivo único com hash, minificado; CSS crítico da primeira dobra **inline** por template; o restante sem bloquear. Remover o CSS do WordPress (seção 1.9).
- **Fontes:** preload só dos arquivos realmente usados na primeira dobra (medir com Coverage); `font-display: swap`; subset latim + pt-BR (`ÁÀÂÃÉÊÍÓÔÕÚÇáàâãéêíóôõúç`); reduzir a Cascadia Code 700 (30 KiB); `size-adjust`/métricas de fallback para CLS 0.
- **JS:** `defer`, empacotado com esbuild, < 15 KiB comprimido; corrigir o **reflow forçado do `olorin.js` (≈ linha 70)** separando leituras e escritas de layout com `requestAnimationFrame`; inicializações não críticas em `requestIdleCallback`; cursor personalizado só com `(pointer: fine)` e sem `prefers-reduced-motion`; listeners passivos; IntersectionObserver em vez de `scroll`.
- **Cache:** ativos com hash `max-age=31536000, immutable`; HTML com cache curto; Gzip (e Brotli se o Apache tiver).
- `content-visibility: auto` com `contain-intrinsic-size` abaixo da dobra (cuidando das âncoras); `loading="lazy"` + `decoding="async"` abaixo da dobra; sem `preconnect` inútil.
- Medição antes/depois (3 execuções por página, mediana) em `docs/PERFORMANCE.md`.

---

## 15. SEO, BUSCA LOCAL E BUSCA COM IA

### 15.1 On-page
- Title ≤ 60, description ≤ 155, `canonical` autorreferente (exceto `/promo/*`), `og:*`/`twitter:*` completos com imagem própria.
- Home: manter `Olorin Digital | Agência de marketing em Curitiba` e a descrição atual (131 caracteres).
- Palavra-chave principal "agência de marketing digital em Curitiba"; secundárias por serviço (9.4). Um H1 por página, hierarquia coerente, links internos com âncora descritiva entre home, hub, serviços, sobre e cases.
- Local × nacional: nas páginas de serviço, "em Curitiba e para todo o Brasil" onde fizer sentido, sem repetição forçada.

### 15.2 Dados estruturados (JSON-LD gerado dos mesmos dados visíveis)
- `ProfessionalService` `@id https://olorin.com.br/#empresa` (name, url, logo, image, telephone, email, address Curitiba/PR/BR sem rua, `areaServed` Curitiba e Brasil, `knowsAbout`, `sameAs` Instagram, `founder`/`employee` com os 3 `Person` se fizer sentido).
- `WebSite`, `BreadcrumbList` nas internas, `Service` em cada serviço (`provider` → `#empresa`, `offers` só com preço confirmado), `FAQPage` idêntico ao texto visível, `Person` na `/sobre/`.
- **Nunca** `aggregateRating` ou avaliações sem fonte real.

### 15.3 Busca com IA (Google AI Overviews, ChatGPT, Perplexity, Gemini, Claude)
- **Resposta curta** no início de cada página de serviço e respostas de FAQ que funcionam sozinhas (2 a 4 frases, com números concretos: preço, verba mínima, prazos de sinal).
- Fatos consistentes em todo lugar (nome, cidade, contatos, preços), equipe com credenciais reais e data de atualização visível nas páginas de serviço.
- `robots.txt` permitindo rastreadores de IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) por padrão; documentar como bloquear se o dono preferir.
- `/llms.txt` simples (o que a Olorin é, serviços com links, preços, contato). Custo baixo, sem promessa de efeito.
- Em `docs/SEO.md`, um roteiro para o dono testar mensalmente perguntas como "agência de marketing digital em Curitiba com preço aberto" nos buscadores com IA e anotar se a Olorin aparece.

### 15.4 Técnico
- `sitemap.xml` gerado no build, só com páginas indexáveis e `lastmod` real. `robots.txt` com `Allow: /` e `Sitemap: https://olorin.com.br/sitemap.xml`. **Não** bloquear `/promo/` nem `/obrigado/` (usar `noindex`).
- URLs com barra final, sem duplicidade; 404 com a marca.
- Em `docs/SEO.md`: checklist do Google Search Console (enviar sitemap novo, inspecionar URLs, remover o sitemap antigo com domínio errado) e do Google Meu Negócio (categoria, serviços, link do site, fotos reais).

---

## 16. ACESSIBILIDADE (WCAG 2.2 AA)
- Teclado em tudo: menu (armadilha de foco, `Esc` fecha), menu suspenso de serviços, filtros, checklist, acordeões, calculadora, formulário, banner de cookies. Foco sempre visível com bom contraste.
- Contraste conforme a seção 3.3; alvos de toque ≥ 44×44 px; `prefers-reduced-motion` respeitado (marquee, cursor, animações).
- Marcos (`header`, `nav`, `main`, `footer`), `lang="pt-BR"`, ordem de leitura = ordem visual, `aria-expanded`/`aria-controls`, `aria-current="page"` no menu, `aria-live` no formulário.
- axe-core em todas as páginas (zero violações) + roteiro de teste manual com NVDA/VoiceOver em `docs/A11Y.md` (enviar formulário, abrir FAQ, chegar a um serviço pelo menu).

---

## 17. COPY: REGRAS FINAIS
- "Nós", "o mesmo time", "Método Olorin". Preços como `R$ 2.500`. Sem espaços duplos. Travessões e aspas consistentes.
- **Legibilidade:** frases curtas (média ≤ 18 palavras), uma ideia por parágrafo, palavras do dia a dia; termos técnicos (ROAS, CPA, pixel, GTM) explicados na primeira vez em que aparecem. Rode um índice de legibilidade em português (Flesch adaptado ao pt-BR) e registre em `docs/CONTENT.md`; meta: texto "fácil" a "razoavelmente fácil".
- Escreva como o dono de negócio fala ("não sei quanto custou cada venda"), não como agência fala ("otimização de KPIs").
- Botão principal: `Quero meu diagnóstico gratuito`. Orçamento tradicional: `Pedir orçamento`.
- Sem urgência ou escassez artificial, sem comparação com concorrentes.

---

## 18. SERVIDOR E SEGURANÇA (`.htaccess` para Apache/Locaweb)
- Manter o que já existe (DirectoryIndex, `Options -Indexes`, deflate, expires, nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy, bloqueio de arquivos sensíveis) e acrescentar:
```apache
RewriteEngine On
# Ativar só depois de confirmar que o SSL está ativo no painel da Locaweb
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} ^www\. [NC]
RewriteRule ^ https://olorin.com.br%{REQUEST_URI} [L,R=301]

<FilesMatch "^(config\.php|.*\.(csv|log|md|yml|bak)|LEIA-ME\.txt|license\.txt)$">
  Require all denied
</FilesMatch>

<IfModule mod_headers.c>
  SetEnvIf Request_URI "^/(promo|obrigado)(/|$)" NOINDEX
  Header set X-Robots-Tag "noindex, follow" env=NOINDEX
  # HSTS: ativar só depois de testar o HTTPS em produção (confirmar se a Locaweb expõe a variável HTTPS)
  Header always set Strict-Transport-Security "max-age=31536000" env=HTTPS
  <FilesMatch "\.(css|js|woff2|avif|webp|svg|png|jpg)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>
```
- `Content-Security-Policy-Report-Only` inicial compatível com o GTM, documentada para ser imposta depois.
- Redirecionamentos 301 para qualquer URL antiga que mude.
- O `deploy` nunca envia `site-atual/`, `_brand/`, `_inbox/`, `docs/`, `.env`, `node_modules/`, originais de imagem nem o `config.php` local.
- Documente em `docs/DEPLOY.md`: backup completo do `public_html` antes, o que enviar, o que apagar do servidor (`license.txt`, `error.log`, `LEIA-ME.txt`, `assets/wp/` se não for mais usada), como ativar o SSL e depois o bloco de HTTPS, como testar o formulário em produção e como desfazer (rollback) em 5 minutos.

---

## 19. FASES (um commit por fase, no mínimo)

- **Fase 0 · Auditoria, marca, benchmark e plano:** ler tudo; `AUDIT.md` (confirmando a seção 1), `BRAND.md`, `BENCHMARK.md`, `PLAN.md`; perguntas da 0.5; `site.config.json`, `config.example.php`, `.env.example`, `.gitignore`.
- **Fase 1 · Fundação:** Eleventy, tokens, componentes, guia `/_estilo/`, layouts, `track()`, `waLink()`, consentimento, persistência de UTM, componente de formulário, `enviar.php` corrigido, `/obrigado/`, 404, `.htaccess`.
- **Fase 2 · Home:** seção 8 completa, com `home.yml` controlando a ordem.
- **Fase 3 · Serviços:** template, hub `/servicos/`, 6 páginas, menu suspenso, migalhas, "Combina com".
- **Fase 4 · Sobre e cases:** `/sobre/`; `/cases/` só se houver case aprovado.
- **Fase 5 · Campanhas:** `/promo/` e `/promo/<slug>/`.
- **Fase 6 · Imagens:** inventário, manifesto, otimização, portfólio, equipe, cases, depoimentos, OG images (pode rodar em paralelo às fases 2 a 5).
- **Fase 7 · SEO, schema e IA:** metas, JSON-LD, sitemap, robots, llms.txt, redirecionamentos.
- **Fase 8 · Performance, acessibilidade e QA:** seções 14, 16 e 20; correção do reflow; relatório final.
- **Fase 9 · Deploy (só com autorização explícita):** `deploy:dry`, revisão da lista de arquivos com o dono, `deploy`, testes em produção (formulário real, redirecionamentos, cabeçalhos, eventos no modo de visualização do GTM), envio do sitemap no Search Console.

---

## 20. QA (execute e comprove)
1. **Lighthouse CI mobile** em todas as páginas; relatórios em `docs/lighthouse/`; resumo antes/depois.
2. **Playwright (Chromium e WebKit)**: envio feliz (inclui `/obrigado/` e um único `generate_lead`), erros de validação, honeypot, tempo mínimo (agora funcionando), limite por IP, fluxo sem JS, persistência de UTM entre home → serviço → formulário, modo campanha (sem menu, `noindex`, canonical), `?s=<slug>`, A/B com `?v=a|b`, barra fixa que some com o formulário visível, calculadora, teclado em todos os componentes.
3. **Eventos:** testes lendo `window.dataLayer` para cada evento da 13.4, provando ausência de dados pessoais.
4. **Capturas** em 360, 390, 768, 1024 e 1440 px de todas as páginas (`docs/screenshots/`), sem sobreposição nem rolagem horizontal; compare a home nova com a atual lado a lado.
5. **Validações:** HTML (html-validate), links (linkinator), IDs duplicados, limites de title/description, JSON-LD válido e igual ao texto visível (script compara FAQ visível × schema), ortografia pt-BR, legibilidade.
6. **Checagens finais:** `grep` do domínio errado = 0; nenhum `[CONFIRMAR]` no `dist/`; nenhuma imagem sem `alt`; nenhum segredo no repositório (`git grep -i senha`, `gitleaks` se disponível); `sitemap.xml` só com URLs indexáveis de `olorin.com.br`; `license.txt` e `error.log` fora do `dist/`.

---

## 21. FASES FUTURAS (só documentar em `docs/ROADMAP.md`, não executar agora)
- Páginas por segmento (ex.: marketing para clínicas, e-commerce, indústria), quando houver cases reais em cada um.
- Painel de edição (Decap CMS com GitHub, ou migração para o tema WordPress) se o dono quiser editar pelo navegador.
- Conteúdo/blog com perguntas reais dos clientes.
- Vídeo curto de 1 a 2 minutos explicando o Método Olorin com o time (padrão Hook Agency).
- Conversões avançadas (dados de lead com hash), só com consentimento.

---

## 22. ENTREGÁVEIS
- Código na branch `feat/site-v3` e `dist/` pronto para publicar.
- `docs/AUDIT.md`, `BRAND.md`, `BENCHMARK.md`, `PLAN.md`, `TRACKING.md`, `PERFORMANCE.md`, `SEO.md`, `A11Y.md`, `ASSETS.md`, `CONTENT.md`, `CONTENT-TODO.md` (todos os `[CONFIRMAR]`, agrupados por quem responde), `EDITAR.md`, `DEPLOY.md`, `ROADMAP.md`, `CHANGELOG.md`.
- `gtm-container.json` (se viável), `config.example.php`, `.env.example`.
- **Relatório final** (terminal + `docs/RELATORIO-FINAL.md`): o que foi feito por fase, números antes/depois (Lighthouse e pesos), pendências do dono e os 5 primeiros passos para publicar com segurança.

---

## 23. O QUE NÃO FAZER
- Inventar números, depoimentos, clientes, selos, endereço, CNPJ, avaliações, prazos ou processos.
- Usar banco de imagens, rostos gerados ou depoimentos fictícios apresentados como reais.
- Carregar scripts de terceiros antes do consentimento; colocar dados pessoais em URL, `dataLayer` ou log público.
- Duplicar conteúdo entre modo completo e campanha.
- Indexar `/promo/*` e `/obrigado/`, ou bloqueá-los no `robots.txt`.
- Mandar framework de JavaScript para o navegador ou dependências que a Locaweb não rode.
- Alterar preços, planos, nome da marca ou identidade visual sem ordem do dono.
- Mencionar qualquer domínio além de `olorin.com.br`.
- Publicar no servidor sem autorização explícita, ou apagar `config.php`/leads do servidor.
- Imprimir, copiar ou versionar senhas.

---

## 24. DEFINIÇÃO DE PRONTO
- [ ] Todos os achados da seção 1 corrigidos e documentados.
- [ ] Tokens e componentes extraídos do manual de marca; guia `/_estilo/` revisável; divergências registradas.
- [ ] `docs/BENCHMARK.md` com as referências visitadas e as decisões tomadas.
- [ ] Home reorganizada, com ordem editável em `home.yml`; etapa 1 abaixo do banner; formulário completo no fim; A/B funcionando.
- [ ] Hub `/servicos/` + 6 páginas de serviço com resposta curta, para quem é, entregas, como funciona, quem faz, preço, FAQ, schema e "Combina com".
- [ ] Cards de serviço da home e do hub levam às páginas, com teclado e foco.
- [ ] `/sobre/` com o time; `/cases/` só se houver case aprovado.
- [ ] `/promo/` e `/promo/<slug>/` em modo campanha, `noindex`, canonical correto, formulário no topo.
- [ ] Formulário com contrato corrigido (`olorin_ts`, "Rastreamento e relatório"), leads fora da pasta pública, `/obrigado/` com um único `generate_lead`.
- [ ] Consentimento, GTM condicionado, eventos validados, sem PII; todos os links de WhatsApp com `[ref: ...]`.
- [ ] Números e cases só com contexto verificado; relatório de exemplo rotulado.
- [ ] Lighthouse mobile ≥ 95 em todas; acessibilidade 100; zero violações axe.
- [ ] Sitemap, robots, llms.txt, redirecionamentos e cabeçalhos corretos; 404 com a marca e o número certo.
- [ ] `grep` do domínio errado = 0; ortografia e legibilidade revisadas; nenhum segredo no repositório.
- [ ] `docs/EDITAR.md` e `docs/DEPLOY.md` claros para quem não programa; relatório final entregue.
