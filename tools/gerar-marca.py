#!/usr/bin/env python3
"""Gera os assets de marca da landing a partir do logo mestre.

Entrada : assets/games/logoPraus.png   (500x500 RGBA, line art branca)
Saida   : assets/brand/*.png + favicon.ico

Uso: python tools/gerar-marca.py     (requer Pillow: pip install pillow)
"""
from PIL import Image
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SRC = RAIZ / "assets" / "games" / "logoPraus.png"
DEST = RAIZ / "assets" / "brand"

INK = (244, 239, 234)   # --ink: mesma cor do letreiro PRAUS
FUNDO = (20, 17, 15)    # --bg: fundo dos favicons (a marca e branca e sumiria
                        #       numa aba de navegador clara)


def quadrado(img, lado, pad=0.10, fundo=None):
    """Centraliza a marca num canvas quadrado, com respiro proporcional."""
    util = int(lado * (1 - 2 * pad))
    esc = min(util / img.width, util / img.height)
    nw, nh = max(1, round(img.width * esc)), max(1, round(img.height * esc))
    red = img.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new("RGBA", (lado, lado), (fundo + (255,)) if fundo else (0, 0, 0, 0))
    canvas.alpha_composite(red, ((lado - nw) // 2, (lado - nh) // 2))
    return canvas


def main():
    if not SRC.exists():
        raise SystemExit(f"logo mestre nao encontrado: {SRC}")
    DEST.mkdir(parents=True, exist_ok=True)

    src = Image.open(SRC).convert("RGBA")
    rec = src.crop(src.getchannel("A").getbbox())   # remove a moldura vazia
    print(f"{SRC.name}: {src.size} -> conteudo util {rec.size}")

    # line art branca: uniformiza o RGB para o --ink, preservando o alpha
    marca = Image.new("RGBA", rec.size, INK + (0,))
    marca.putalpha(rec.getchannel("A"))

    # maior uso da marca e o rodape (~49 CSS px); 160px cobre 3x de retina
    # com folga, sem o desperdicio de servir 256px para um render de 31px.
    ALTURA = 160
    esc = ALTURA / marca.height
    marca.resize((round(marca.width * esc), ALTURA), Image.LANCZOS) \
         .save(DEST / "praus-mark.png", optimize=True)

    for lado in (16, 32, 48, 192):
        quadrado(marca, lado, 0.10, FUNDO).save(DEST / f"favicon-{lado}.png", optimize=True)

    quadrado(marca, 180, 0.18, FUNDO).save(DEST / "apple-touch-icon.png", optimize=True)
    quadrado(marca, 256, 0.10, FUNDO).save(RAIZ / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

    gerados = sorted(DEST.glob("*.png")) + [RAIZ / "favicon.ico"]
    for g in gerados:
        print(f"  {g.stat().st_size / 1024:6.1f} KB  {g.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
