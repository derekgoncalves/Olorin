"""Gera as imagens do site novo em static/img (rodar de dentro de novo/): python3 ferramentas/imagens.py <pasta-dos-recortes>
Recortes de pessoas viram "adesivos": preto e branco (regra do manual de marca), com contorno branco."""
import sys, os
from PIL import Image, ImageFilter, ImageOps, ImageEnhance

SAIDA = 'static/img'
REPO = '..'
os.makedirs(SAIDA, exist_ok=True)

def pb(im, contraste=1.12):
    a = im.getchannel('A') if im.mode == 'RGBA' else None
    g = ImageOps.autocontrast(im.convert('L'), cutoff=0.5)
    g = ImageEnhance.Contrast(g).enhance(contraste)
    out = Image.merge('RGB', (g, g, g))
    if a is not None:
        out.putalpha(a)
    return out

def salvar(im, nome, alturas, q=82):
    for h in alturas:
        w = round(im.width * h / im.height)
        r = im.resize((w, h), Image.LANCZOS)
        r.save(f'{SAIDA}/{nome}-{h}.webp', 'WEBP', quality=q, method=6)
    print(nome, im.size, alturas)

def adesivo(origem, nome, alturas=(1400, 800), contorno=0.012, ja_tem_contorno=False, cor=False, recorte=None):
    im = Image.open(origem).convert('RGBA')
    if recorte:
        im = im.crop(recorte)
    im = im.crop(im.getbbox())
    if not cor:
        im = pb(im)
    base = max(alturas)
    if im.height > base:
        im = im.resize((round(im.width * base / im.height), base), Image.LANCZOS)
    if not ja_tem_contorno:
        r = max(3, round(im.height * contorno))
        tela = Image.new('RGBA', (im.width + 4 * r, im.height + 4 * r), (0, 0, 0, 0))
        tela.paste(im, (2 * r, 2 * r))
        alfa = tela.getchannel('A').point(lambda v: 255 if v > 40 else 0)
        dil = alfa.filter(ImageFilter.GaussianBlur(r * 0.55)).point(lambda v: 255 if v > 18 else 0)
        dil = dil.filter(ImageFilter.GaussianBlur(1.2))
        branco = Image.new('RGBA', tela.size, (255, 255, 255, 0))
        branco.putalpha(dil)
        branco.alpha_composite(tela)
        im = branco.crop(branco.getbbox())
    salvar(im, nome, alturas, q=84)

def foto(origem, nome, alturas, proporcao=None, preto_branco=True, foco=(0.5, 0.5)):
    im = Image.open(origem).convert('RGB')
    if proporcao:
        im = ImageOps.fit(im, (round(im.height * proporcao), im.height) if im.width / im.height > proporcao else (im.width, round(im.width / proporcao)), Image.LANCZOS, centering=foco)
    if preto_branco:
        im = pb(im, 1.08)
    salvar(im, nome, [h for h in alturas if h <= im.height] or [im.height], q=80)

if __name__ == '__main__':
    cut = sys.argv[1]
    rec = '/mnt/project-files/criativos-trafego/fonte/recortes'
    adesivo(f'{cut}/salto.png', 'adesivo-salto')
    adesivo(f'{cut}/estrela.png', 'adesivo-estrela')
    adesivo(f'{cut}/selfie.png', 'adesivo-selfie')
    adesivo(f'{cut}/lupa.png', 'adesivo-lupa')
    adesivo(f'{rec}/sticker-edu.png', 'adesivo-educacao', ja_tem_contorno=True)
    adesivo(f'{rec}/sticker-traf.png', 'adesivo-megafone', ja_tem_contorno=True)
    adesivo(f'{rec}/sticker-site.png', 'adesivo-notebook', ja_tem_contorno=True)
    img = f'{REPO}/src/assets/img-src'
    adesivo(f'{img}/influenciadores-corda.webp', 'adesivo-criadora', ja_tem_contorno=True, cor=True)
    adesivo(f'{img}/influenciadores-fone.webp', 'adesivo-fone', ja_tem_contorno=True, cor=True)
    foto(f'{img}/equipe/derek-goncalves.webp', 'equipe-derek', (1000, 600), 0.8, foco=(0.5, 0.35))
    foto(f'{img}/equipe/natalia-arruda.png', 'equipe-natalia', (1000, 600), 0.8, foco=(0.5, 0.4))
    foto(f'{img}/equipe/vinicius-mafra.webp', 'equipe-vinicius', (1000, 600), 0.8, foco=(0.45, 0.4))
    for p in ['anacleto-abduch', 'bravo-film-festival', 'centro-sul-shop', 'governo-rs', 'harmonia-do-pet', 'izeta', 'john-deere', 'national-geographic']:
        foto(f'{img}/portfolio/{p}.webp', f'portfolio-{p}', (900, 560), preto_branco=False)
    foto(f'{img}/raio-x-celular.webp', 'raio-x-celular', (1061, 640), preto_branco=False)
    foto(f'{img}/influenciadores-hero.webp', 'influenciadores-hero', (1400, 800), preto_branco=False)
    foto(f'{img}/influenciadores-quadro.webp', 'influenciadores-quadro', (1200, 700), preto_branco=False)
    foto(f'{img}/hero-celular.webp', 'faixa-pedestres', (1000, 600))
    # manifesto: larguras e alturas de cada arquivo, para o build montar srcset
    import json, glob
    man = {}
    for f in sorted(glob.glob(f'{SAIDA}/*.webp')):
        w, h = Image.open(f).size
        nome = os.path.basename(f).rsplit('-', 1)[0]
        man.setdefault(nome, []).append({'arq': os.path.basename(f), 'w': w, 'h': h})
    for v in man.values():
        v.sort(key=lambda x: x['w'])
    json.dump(man, open('dados/imagens.json', 'w'), indent=1)
