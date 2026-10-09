#!/usr/bin/env bash
# Gera os arquivos .zip da pasta entrega/:
#   entrega/olorin-tema-wordpress.zip  → Aparência → Temas → Adicionar novo → Enviar tema
#   entrega/olorin-site-estatico.zip   → conteúdo para public_html (versão HTML)
#
# Uso: bash ferramentas/empacotar.sh
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
cd "$RAIZ"
mkdir -p entrega

# Tema: o zip precisa conter a pasta "olorin/" na raiz
rm -f entrega/olorin-tema-wordpress.zip
(cd tema-wordpress && zip -rq -X ../entrega/olorin-tema-wordpress.zip olorin \
	-x "*.DS_Store" "*/node_modules/*" "*/.git/*")

# Site estático: conteúdo direto na raiz do zip (inclui .htaccess)
rm -f entrega/olorin-site-estatico.zip
(cd site-estatico && zip -rq -X ../entrega/olorin-site-estatico.zip . -x "*.DS_Store" "leads/pedidos.csv")

ls -lh entrega/
