/**
 * Olorin — interface dos blocos próprios no editor (sem etapa de build).
 */
(function (wp) {
	'use strict';
	if (!wp || !wp.blocks) { return; }

	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var registerBlockType = wp.blocks.registerBlockType;
	var be = wp.blockEditor;
	var c = wp.components;
	var ServerSideRender = wp.serverSideRender;
	var DATA = window.OLORIN_EDITOR || {};
	var icons = DATA.icons || {};

	/* Ícone pixel */
	registerBlockType('olorin/icone', {
		edit: function (props) {
			var icon = props.attributes.icone || 'pixel';
			var blockProps = be.useBlockProps({ className: 'o-icon o-icon--' + icon, 'aria-hidden': 'true' });
			var options = Object.keys(icons).map(function (key) { return { label: icons[key], value: key }; });
			return el(Fragment, null,
				el(be.InspectorControls, null,
					el(c.PanelBody, { title: 'Desenho do ícone', initialOpen: true },
						el(c.SelectControl, {
							label: 'Ícone',
							value: icon,
							options: options,
							onChange: function (value) { props.setAttributes({ icone: value }); }
						})
					)
				),
				el(be.BlockControls, null,
					el(c.ToolbarGroup, null,
						el(c.ToolbarDropdownMenu, {
							icon: 'star-filled',
							label: 'Trocar ícone',
							controls: options.map(function (opt) {
								return { title: opt.label, isActive: opt.value === icon, onClick: function () { props.setAttributes({ icone: opt.value }); } };
							})
						})
					)
				),
				el('span', blockProps)
			);
		},
		save: function () { return null; }
	});

	/* Portfólio */
	registerBlockType('olorin/portfolio', {
		edit: function (props) {
			var blockProps = be.useBlockProps();
			return el('div', blockProps,
				el(be.InspectorControls, null,
					el(c.PanelBody, { title: 'Portfólio', initialOpen: true },
						el(c.RangeControl, {
							label: 'Quantidade de trabalhos',
							min: 1,
							max: 48,
							value: props.attributes.quantidade,
							onChange: function (value) { props.setAttributes({ quantidade: value || 12 }); }
						}),
						el(c.ToggleControl, {
							label: 'Mostrar filtros por tipo',
							checked: !!props.attributes.filtros,
							onChange: function (value) { props.setAttributes({ filtros: value }); }
						}),
						el('p', null,
							el('a', { href: DATA.portfolioUrl, target: '_blank', rel: 'noopener' }, 'Gerenciar projetos do portfólio ↗')
						)
					)
				),
				el('p', { className: 'o-editor-hint' }, 'Os trabalhos vêm do menu Portfólio do painel. Clique em "Gerenciar projetos" na barra lateral.'),
				el(c.Disabled, null, el(ServerSideRender, { block: 'olorin/portfolio', attributes: props.attributes }))
			);
		},
		save: function () { return null; }
	});

	/* Formulário de orçamento */
	registerBlockType('olorin/formulario', {
		edit: function () {
			var blockProps = be.useBlockProps();
			return el('div', blockProps,
				el(be.InspectorControls, null,
					el(c.PanelBody, { title: 'Formulário', initialOpen: true },
						el('p', null, 'Textos, opções e e-mail de recebimento ficam em Aparência → Personalizar → Olorin → Formulário de orçamento.'),
						el('p', null, el('a', { href: DATA.customizeUrl, target: '_blank', rel: 'noopener' }, 'Abrir configurações ↗'))
					)
				),
				el(c.Disabled, null, el(ServerSideRender, { block: 'olorin/formulario' }))
			);
		},
		save: function () { return null; }
	});
})(window.wp);
