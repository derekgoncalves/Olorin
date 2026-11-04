# Olorin v3 — contrato de design (LP de venda de sites)

Direção: minimalista e moderno. Fundo branco, muito respiro, grade suíça de 12 colunas,
linhas finas de 1px, tipografia enorme. Cor da marca só como acento (violeta) e faixas escuras
pontuais (preto/índigo, onde o verde neon pode aparecer). Nada de visual "videogame" pesado:
o tema de nível aparece só em rótulos pixel (Silkscreen) e na ideia de "subir de nível".

## Tokens (definidos no :root do index.html — use SEMPRE estes nomes)
--ink: #0E0B14        texto / preto da marca (leve viés violeta)
--paper: #FFFFFF      fundo
--mist: #F5F3F9       neutro claro (fundos de bloco)
--line: rgba(14,11,20,.12)  linhas finas
--muted: #5D576B      texto secundário
--violet: #7E3BED     acento principal
--indigo: #1E065A     faixa escura
--lavender: #BE96FF   acento claro (sobre escuro)
--neon: #ECFF36       destaque, SÓ sobre fundo escuro (ink/indigo/violet)
--f-display: "Olorin Display", "Arial Black", sans-serif   (Archivo Expanded 800/900)
--f-pixel: "Olorin Pixel", ui-monospace, monospace          (Silkscreen 400, sempre MAIÚSCULAS, letter-spacing .06em, tamanho pequeno)
--f-body: "Olorin Mono", ui-monospace, "SFMono-Regular", Menlo, monospace (Cascadia Code 400/700)
--ease: cubic-bezier(.2,.7,.1,1)
--r: 14px (raio padrão; usar com parcimônia)

Breakpoints: mobile-first; 720px (tablet), 1080px (desktop). Testar 360, 390, 768, 1366, 1440.
Sem rolagem horizontal. prefers-reduced-motion respeitado. Classes prefixadas por componente
(ex.: .bd- para o construtor do hero) para não colidir.

## Regras de conteúdo
PT-BR. Lema "Sua marca em outro nível." Preço público só "a partir de R$ 3.000".
Nada de resultados inventados, números de desempenho, depoimentos falsos ou fotos geradas por IA.
Nunca estética Mario. Clientes reais: iZETA Educação, Harmonia do Pet, José Anacleto Abduch
(sites); faixa de marcas que o time já atendeu: National Geographic, John Deere, iZETA, BRAVO Film
Festival, Governo do RS, José Anacleto Abduch, Centro Sul Shop, Harmonia do Pet.
WhatsApp 5541996460861.
