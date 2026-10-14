---
# MODELO DE ARTIGO DO BLOG (este arquivo não vai para o site: nomes que começam com "_" são ignorados)
#
# Como usar:
#   1. Copie este arquivo nesta mesma pasta (src/blog/artigos/).
#   2. Renomeie a cópia com o endereço do artigo: só letras minúsculas, números e hífens, sem acento.
#      Exemplo: "como-escolher-o-publico.md" vira olorin.com.br/blog/como-escolher-o-publico/
#   3. Preencha os campos abaixo e troque o texto depois da linha "---".
#   4. Rode "npm run capas" (gera a capa) e depois "npm run build". Guia completo: docs/BLOG.md
#
# Linhas que começam com "#" são comentários: pode apagar todas na sua cópia.

# Título que aparece no artigo e nos cards. Use aspas.
titulo: "Título do artigo, claro e direto"

# (Opcional) Versão curta do título para o Google, com até 60 caracteres. Para usar, tire o "#" da frente.
# Só precisa quando o build avisar que o título passou do limite.
# titulo_seo: "Versão curta do título"

# Resumo de 1 ou 2 frases, com até 155 caracteres (aparece no card e no Google). Use aspas.
descricao: "Resumo do artigo em uma ou duas frases, dizendo o que a pessoa vai aprender."

# Data de publicação: AAAA-MM-DD. O artigo mais novo aparece primeiro (e vai para a home).
data: 2026-11-05

# Categoria, escrita do jeito que deve aparecer. Uma categoria nova é criada sozinha.
# Já existem: Educação, Tráfego pago, Redes sociais
categoria: Tráfego pago

# Quem escreveu: derek-goncalves, natalia-arruda ou vinicius-mafra
autor: natalia-arruda

# (Opcional) Foto de capa própria, salva em src/assets/img-src/blog/ (JPG, 1600 x 900 pixels).
# Para usar, tire o "#" da frente das duas linhas. Sem foto, "npm run capas" cria uma capa com o título.
# imagem: minha-foto.jpg
# imagem_alt: "O que aparece na foto, em poucas palavras"

# (Opcional) Data em que o artigo foi revisado. Aparece como "Atualizado em". Para usar, tire o "#".
# atualizado: 2026-12-01

# (Opcional) Tire o "#" para esconder o artigo do site sem apagar o arquivo. Para publicar, apague a linha.
# rascunho: true
---

Primeiro parágrafo: diga em poucas linhas o problema e o que a pessoa vai levar do artigo.

Deixe uma linha em branco entre um parágrafo e outro.

## Subtítulo (duas cerquilhas)

Texto normal, com **negrito** para destacar e um [link para outra página do site](/servicos/trafego-pago/).
Links para outros sites também funcionam: [Central de Ajuda da Meta](https://www.facebook.com/business/help).

### Subtítulo menor (três cerquilhas)

Lista com marcadores:

- primeiro item;
- segundo item;
- terceiro item.

Lista numerada:

1. Primeiro passo.
2. Segundo passo.
3. Terceiro passo.

> Frase em destaque (citação).

Imagem no meio do texto (o arquivo fica em src/assets/img-src/blog/; o texto entre aspas vira a legenda). Apague este exemplo se não for usar imagem:

![Descrição da imagem para quem não enxerga](minha-foto-2.jpg "Legenda que aparece embaixo da imagem")

Tabela:

| Etapa | O que medir |
| --- | --- |
| Anúncio | Cliques |
| Página | Contatos |

Último parágrafo: feche com o próximo passo. O convite para o Raio-X e o WhatsApp entram sozinhos no fim do artigo.
