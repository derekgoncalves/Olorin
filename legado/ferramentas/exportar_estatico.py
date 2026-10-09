#!/usr/bin/env python3
"""
Gera a VERSÃO ESTÁTICA (HTML/CSS/JS puro) do site a partir de um WordPress
rodando com o tema Olorin.

Uso (com um WordPress local no ar, ex.: http://localhost:8080):

    python3 ferramentas/exportar_estatico.py --origem http://localhost:8080 \
        --dominio https://olorindigital.com.br --destino site-estatico

O resultado é uma pasta pronta para enviar por FTP ao public_html da Locaweb:
index.html, politica-de-privacidade/, 404.html, assets/, enviar.php,
config.php, .htaccess, robots.txt e sitemap.xml.
"""

import argparse
import os
import re
import shutil
import sys
import urllib.parse
import urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.join(AQUI, "estatico-base")

PAGINAS = [
    # (caminho no WordPress, arquivo de saída, profundidade de pasta; None = caminhos absolutos)
    ("/", "index.html", 0),
    ("/politica-de-privacidade/", "politica-de-privacidade/index.html", 1),
    ("/pagina-que-nao-existe-olorin/", "404.html", None),
]


def baixar(url):
    req = urllib.request.Request(url, headers={"User-Agent": "olorin-export"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def baixar_qualquer_status(url):
    try:
        return baixar(url)
    except urllib.error.HTTPError as erro:  # 404.html vem com status 404
        return erro.read()


def mapear(caminho):
    """Caminho do WordPress -> caminho dentro da pasta estática."""
    caminho = caminho.split("?")[0].split("#")[0]
    regras = [
        (r"^/wp-content/themes/olorin/assets/", "assets/"),
        (r"^/wp-content/uploads/", "assets/uploads/"),
        (r"^/wp-includes/", "assets/wp/"),
    ]
    for padrao, novo in regras:
        if re.match(padrao, caminho):
            return re.sub(padrao, novo, caminho)
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--origem", default="http://localhost:8080")
    ap.add_argument("--dominio", default="https://olorindigital.com.br")
    ap.add_argument("--destino", default="site-estatico")
    args = ap.parse_args()

    origem = args.origem.rstrip("/")
    dominio = args.dominio.rstrip("/")
    destino = os.path.abspath(args.destino)
    host = urllib.parse.urlparse(origem).netloc

    if os.path.isdir(destino):
        shutil.rmtree(destino)
    os.makedirs(destino)

    ativos = {}  # caminho WP -> caminho local

    url_re = re.compile(r"(?:https?:)?//" + re.escape(host) + r"(/[^\"'\s)<>,]*)")

    def coletar(texto):
        for m in url_re.finditer(texto):
            local = mapear(m.group(1))
            if local:
                ativos[m.group(1).split("#")[0]] = local

    paginas = []
    for caminho, saida, profundidade in PAGINAS:
        html = baixar_qualquer_status(origem + caminho).decode("utf-8")
        coletar(html)
        paginas.append((caminho, saida, profundidade, html))

    # Baixa CSS primeiro para descobrir fontes/imagens referenciadas dentro deles
    baixados = set()
    fila = list(ativos.items())
    while fila:
        wp_path, local = fila.pop()
        if local in baixados:
            continue
        baixados.add(local)
        dados = baixar(origem + wp_path)
        alvo = os.path.join(destino, local)
        os.makedirs(os.path.dirname(alvo), exist_ok=True)
        with open(alvo, "wb") as f:
            f.write(dados)
        if local.endswith(".css"):
            css = dados.decode("utf-8", "ignore")
            for ref in re.findall(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)", css):
                if ref.startswith(("data:", "http", "#", "%23")) or "%3C" in ref:
                    continue
                absoluto = urllib.parse.urljoin(wp_path, ref).split("?")[0]
                novo = mapear(absoluto)
                if novo and novo not in baixados:
                    fila.append((absoluto, novo))

    for caminho, saida, profundidade, html in paginas:
        prefixo = "/" if profundidade is None else "../" * profundidade

        def trocar(m):
            wp_path = m.group(1)
            local = mapear(wp_path)
            if local:
                return prefixo + local
            limpo = wp_path.split("#")[0]
            ancora = wp_path[len(limpo):]
            if limpo in ("/", ""):
                return (prefixo or "./") + ancora
            if limpo.startswith("/politica-de-privacidade"):
                return prefixo + "politica-de-privacidade/" + ancora
            if limpo.startswith("/wp-admin/admin-post.php") or limpo.startswith("/wp-json/olorin/v1/lead"):
                return prefixo + "enviar.php"
            return dominio + wp_path

        # Remove tags que só fazem sentido no WordPress
        html = re.sub(r"<link rel=['\"](?:https://api\.w\.org/|EditURI|shortlink|alternate)['\"][^>]*>\s*", "", html)
        html = re.sub(r"<link rel=\"alternate\"[^>]*>\s*", "", html)
        html = re.sub(r"<meta name=['\"]generator['\"][^>]*>\s*", "", html)
        html = html.replace('<input type="hidden" name="action" value="olorin_lead">', "")

        # Metadados precisam de URL absoluta do domínio final
        html = re.sub(
            r'(<link rel="canonical" href=")[^"]*(")',
            lambda m: m.group(1) + dominio + (caminho if profundidade is not None else "/") + m.group(2),
            html,
        )
        html = re.sub(r'(<link rel=.canonical. href=.)https?://' + re.escape(host), r"\1" + dominio, html)

        def absoluto(m):
            wp_path = m.group(2)
            local = mapear(wp_path)
            return m.group(1) + dominio + ("/" + local if local else wp_path)

        html = re.sub(r'(<meta property="og:(?:image|url)" content=")https?://' + re.escape(host) + r'(/[^"]*)', absoluto, html)

        # JSON-LD: URLs absolutas
        def jsonld(m):
            bloco = m.group(0)
            bloco = re.sub(r"https?://" + re.escape(host) + r"(/[^\"]*)", lambda x: dominio + ("/" + mapear(x.group(1)) if mapear(x.group(1)) else x.group(1)), bloco)
            return bloco

        html = re.sub(r'<script type="application/ld\+json">.*?</script>', jsonld, html, flags=re.S)

        # Configuração do JS: envio para enviar.php
        html = re.sub(r'"restUrl":"[^"]*"', '"restUrl":"' + prefixo.replace("/", "\\/") + 'enviar.php"', html)

        # Demais URLs do WordPress local
        html = url_re.sub(trocar, html)
        html = html.replace("\\/\\/" + host, "")

        if "localhost" in html:
            restos = sorted(set(re.findall(r".{0,40}localhost.{0,40}", html)))
            print("AVISO: restou 'localhost' em", saida, restos[:5], file=sys.stderr)

        alvo = os.path.join(destino, saida)
        os.makedirs(os.path.dirname(alvo), exist_ok=True)
        with open(alvo, "w", encoding="utf-8") as f:
            f.write(html)

    # Arquivos de servidor (formulário, .htaccess, pasta de leads)
    for raiz, _, arquivos in os.walk(BASE):
        for nome in arquivos:
            origem_arq = os.path.join(raiz, nome)
            rel = os.path.relpath(origem_arq, BASE)
            alvo = os.path.join(destino, rel)
            os.makedirs(os.path.dirname(alvo), exist_ok=True)
            shutil.copy2(origem_arq, alvo)

    with open(os.path.join(destino, "robots.txt"), "w") as f:
        f.write("User-agent: *\nAllow: /\nDisallow: /enviar.php\n\nSitemap: %s/sitemap.xml\n" % dominio)
    with open(os.path.join(destino, "sitemap.xml"), "w") as f:
        f.write(
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            "  <url><loc>%s/</loc><priority>1.0</priority></url>\n"
            "  <url><loc>%s/politica-de-privacidade/</loc><priority>0.3</priority></url>\n"
            "</urlset>\n" % (dominio, dominio)
        )

    total = sum(len(a) for _, _, a in os.walk(destino))
    print("Pronto: %s (%d arquivos)" % (destino, total))


if __name__ == "__main__":
    main()
