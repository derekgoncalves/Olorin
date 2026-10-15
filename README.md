# Site da Olorin Digital — versão 3

Site de [olorin.com.br](https://olorin.com.br): HTML estático gerado com [Eleventy](https://www.11ty.dev), hospedado na Locaweb (Apache + PHP) e publicado por FTP. Sem WordPress e sem banco de dados. O único código no servidor é o `enviar.php`, que recebe o formulário.

## Começo rápido

```bash
npm install          # uma vez
npm run dev          # site no seu computador: http://localhost:8081 (guia de estilo em /_estilo/)
npm run build        # gera o site pronto em dist/ e confere tudo
npm test             # testa páginas, acessibilidade e o formulário
```

Para publicar: `docs/DEPLOY.md`. Para mudar textos, preços, fotos e a ordem dos blocos: `docs/EDITAR.md`.

## Pastas

| Pasta | O que tem |
|---|---|
| `src/content/` | **Todos os textos** do site em arquivos `.yml` (home, serviços, planos, perguntas, equipe, páginas) |
| `src/_data/site/config.json` | WhatsApp, e-mail, Instagram, IDs de rastreamento e chaves liga/desliga |
| `src/_includes/` | Modelos das páginas e dos blocos (HTML com Nunjucks) |
| `src/styles/`, `src/scripts/` | CSS e JavaScript (empacotados no build) |
| `src/php/` | `enviar.php` (gerado a partir de `enviar.njk`) e `config.example.php` |
| `src/servidor/` | `.htaccess` do site e da pasta de pedidos, `favicon.ico` |
| `src/assets/` | Fontes, ícones, imagens originais (`img-src/`), imagens de compartilhamento (`og/`) e o manifesto das imagens |
| `scripts/` | Build de CSS/JS/imagens, verificação, testes, envio por FTP e gerador das imagens de compartilhamento |
| `dist/` | Site pronto para o FTP (gerado; não vai para o Git) |
| `entrega/` | Pacote `.zip` pronto para subir |
| `docs/` | Documentação (lista abaixo) |
| `site-atual/` | Cópia de referência do site que estava no ar em 08/10/2026 (não editar) |
| `legado/` | Versões anteriores (tema WordPress e estático v1) |
| `_brand/` | Páginas do manual de marca e logos (o PDF não vai para o Git) |

## Documentação

| Documento | Para quê |
|---|---|
| [EDITAR](docs/EDITAR.md) | Como mudar qualquer coisa no site |
| [DEPLOY](docs/DEPLOY.md) | Como publicar, testar e desfazer |
| [BLOG](docs/BLOG.md) | Como publicar artigos no blog |
| [PENDENCIAS](docs/PENDENCIAS.md) | O que ainda falta mandar ou confirmar |
| [CONTENT-TODO](docs/CONTENT-TODO.md) | Lista antiga de confirmações (histórico; a atual é a PENDENCIAS) |
| [RELATORIO-FINAL](docs/RELATORIO-FINAL.md) | O que foi feito, números e próximos passos |
| [PLAN](docs/PLAN.md) | Arquitetura e decisões técnicas |
| [TRACKING](docs/TRACKING.md) | Google Tag Manager, GA4, Meta Pixel, Google Ads e consentimento |
| [SEO](docs/SEO.md) | Buscadores, Google Meu Negócio e busca com IA |
| [PERFORMANCE](docs/PERFORMANCE.md), [A11Y](docs/A11Y.md) | Velocidade e acessibilidade |
| [ASSETS](docs/ASSETS.md), [CONTENT](docs/CONTENT.md) | Imagens e fontes; legibilidade dos textos |
| [AUDIT](docs/AUDIT.md), [BRAND](docs/BRAND.md), [BENCHMARK](docs/BENCHMARK.md) | Auditoria do site anterior, manual de marca e referências |
| [ROADMAP](docs/ROADMAP.md), [CHANGELOG](docs/CHANGELOG.md) | Próximas fases e histórico |

## Regras do projeto

- Nenhum número, cliente, depoimento ou prazo inventado. O que falta confirmar fica marcado com `[CONFIRMAR: ...]` e **não vai ao ar** (o build remove).
- Senhas nunca entram no Git: a do e-mail fica só no `config.php`/`olorin-config.php` do servidor; a do FTP, só no `.env` do seu computador.
- Domínio único: `olorin.com.br`. Instagram: `@olorin.digital_`.
- As fontes pagas da marca (Integral CF e Retro Computer) não vão para o Git; veja `docs/EDITAR.md`, seção 5.
