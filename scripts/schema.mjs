/**
 * Dados estruturados (JSON-LD) gerados dos MESMOS dados que aparecem na página.
 * Nunca inclui avaliação (aggregateRating) nem preço não confirmado.
 */
import { textoPuro } from './filtros.mjs';

export function montarSchema({ cfg, content, modo, url, descricao, migalhas, servico, faq, pessoas, imagemOg }) {
	const base = cfg.URL.replace(/\/$/, '');
	const empresaId = `${base}/#empresa`;
	const equipe = (content.equipe && content.equipe.pessoas) || [];

	const pessoa = (p) => ({
		'@type': 'Person',
		'@id': `${base}/quem-somos/#${p.slug}`,
		name: p.nome,
		jobTitle: p.funcao,
		description: textoPuro(p.bio || p.frase),
		worksFor: { '@id': empresaId },
		image: p.foto ? `${base}/assets/img/${p.foto}-quadrada-320.webp` : undefined,
	});

	const grafo = [
		{
			'@type': 'ProfessionalService',
			'@id': empresaId,
			name: cfg.NOME,
			slogan: cfg.LEMA,
			description: 'Agência de marketing digital em Curitiba: anúncio, conteúdo, site e impresso feitos pelo mesmo time, com preço aberto e relatório que qualquer pessoa entende.',
			url: `${base}/`,
			logo: `${base}/assets/img/brand/icon-512.png`,
			image: `${base}/assets/img/og/home.jpg`,
			telephone: `+${cfg.WHATSAPP}`,
			email: cfg.EMAIL,
			address: { '@type': 'PostalAddress', addressLocality: cfg.CIDADE, addressRegion: cfg.UF, addressCountry: 'BR' },
			areaServed: [
				{ '@type': 'City', name: 'Curitiba' },
				{ '@type': 'Country', name: 'Brasil' },
			],
			knowsAbout: ['Tráfego pago', 'Meta Ads', 'Google Ads', 'Gestão de redes sociais', 'Identidade visual', 'Material impresso', 'Criação de sites', 'Google Tag Manager', 'Google Analytics 4'],
			sameAs: [cfg.INSTAGRAM_URL, cfg.FACEBOOK_URL, cfg.LINKEDIN_URL, cfg.X_URL, cfg.GBP_URL].filter(Boolean),
			employee: equipe.map((p) => ({ '@id': `${base}/quem-somos/#${p.slug}` })),
		},
		{
			'@type': 'WebSite',
			'@id': `${base}/#site`,
			url: `${base}/`,
			name: cfg.NOME,
			inLanguage: 'pt-BR',
			publisher: { '@id': empresaId },
		},
		{
			'@type': 'WebPage',
			'@id': `${url}#pagina`,
			url,
			description: descricao,
			inLanguage: 'pt-BR',
			isPartOf: { '@id': `${base}/#site` },
			about: { '@id': empresaId },
			primaryImageOfPage: imagemOg ? { '@type': 'ImageObject', url: imagemOg } : undefined,
		},
	];

	if (migalhas && migalhas.length) {
		grafo.push({
			'@type': 'BreadcrumbList',
			'@id': `${url}#migalhas`,
			itemListElement: migalhas.map((m, i) => ({ '@type': 'ListItem', position: i + 1, name: m.nome, item: `${base}${m.url}` })),
		});
	}

	if (servico) {
		const s = {
			'@type': 'Service',
			'@id': `${base}/servicos/${servico.slug}/#servico`,
			name: servico.nome,
			serviceType: servico.nome,
			description: textoPuro(servico.resposta_curta || servico.seo.description),
			provider: { '@id': empresaId },
			areaServed: [
				{ '@type': 'City', name: 'Curitiba' },
				{ '@type': 'Country', name: 'Brasil' },
			],
			url: `${base}/servicos/${servico.slug}/`,
		};
		const sc = servico.preco && servico.preco.schema;
		if (sc && sc.valor) {
			// "a partir de" → preço mínimo; mensal → preço por unidade de tempo.
			const especificacao = sc.minimo
				? { '@type': 'PriceSpecification', minPrice: sc.valor, priceCurrency: 'BRL' }
				: sc.unidade
					? { '@type': 'UnitPriceSpecification', price: sc.valor, priceCurrency: 'BRL', unitCode: sc.unidade, referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: sc.unidade } }
					: undefined;
			s.offers = {
				'@type': 'Offer',
				priceCurrency: 'BRL',
				price: sc.minimo ? undefined : sc.valor,
				description: textoPuro(sc.descricao || ''),
				priceSpecification: especificacao,
			};
		}
		grafo.push(s);
	}

	if (faq && faq.length) {
		grafo.push({
			'@type': 'FAQPage',
			'@id': `${url}#faq`,
			mainEntity: faq.map((p) => ({
				'@type': 'Question',
				name: textoPuro(p.pergunta),
				acceptedAnswer: { '@type': 'Answer', text: textoPuro(p.resposta) },
			})),
		});
	}

	if (pessoas) {
		equipe.forEach((p) => grafo.push(pessoa(p)));
	}

	return { '@context': 'https://schema.org', '@graph': JSON.parse(JSON.stringify(grafo)) };
}
