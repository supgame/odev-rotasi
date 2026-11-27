#!/usr/bin/env python3
"""Compose the published phase 1 sprites with the pilot fit overlays."""

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from paketle import PUBLIC, tint


HERE = Path(__file__).resolve().parent
LANCZOS = Image.Resampling.LANCZOS
FONT = "/usr/share/fonts/google-noto-vf/NotoSans[wght].ttf"
CELL = 148
GUTTER = 198
BG = "#f4efe9"
INK = "#362a25"


def open_layer(relative, mode="RGBA"):
    with Image.open(PUBLIC / relative) as im:
        return im.convert(mode)


def colored(layer, mask, ref, color):
    return tint(open_layer(layer), open_layer(mask, "L"), ref, color)


def draw_avatar(base, style, color, hat, glasses):
    suffix = "UnderHat" if hat else ""
    canvas = Image.new("RGBA", base.size)
    for kind in ("back" + suffix, "base", "front" + suffix, "hat", "glasses"):
        if kind == "base":
            canvas.alpha_composite(base)
        elif kind == "hat":
            if hat:
                canvas.alpha_composite(hat)
        elif kind == "glasses":
            if glasses:
                canvas.alpha_composite(glasses)
        elif style["layers"][kind]:
            canvas.alpha_composite(colored(style["layers"][kind], style["mask"][kind],
                                           style["ref"][kind], color))
    return canvas


def main():
    manifest = json.loads((PUBLIC / "manifest.json").read_text(encoding="utf-8"))
    skins, hairstyles, hair_colors = (
        manifest["slots"][slot]["items"] for slot in ("skin", "hair", "hcolor")
    )
    base = manifest["base"]
    bases = [colored(base["layer"], base["skinMask"], base["skinRef"], skin["color"])
             for skin in skins]
    cap = open_layer("pilot/hat_cap.webp")
    glasses = open_layer("pilot/glasses_round.webp")

    width = GUTTER + 8 * CELL + 18
    top = 348
    row_height = 254
    sheet = Image.new("RGBA", (width, top + row_height * len(hairstyles) + 12), BG)
    labels = ImageDraw.Draw(sheet)
    heading = ImageFont.truetype(FONT, 24)
    body = ImageFont.truetype(FONT, 16)
    tiny = ImageFont.truetype(FONT, 13)

    def place(sprite, x, y, size):
        sheet.alpha_composite(sprite.resize((size, size), LANCZOS), (x, y))

    labels.text((18, 12), "Faz 1 · Ten ve saç", font=heading, fill=INK)
    labels.text((18, 68), "Beş doğal ten", font=body, fill=INK)
    for i, (skin, sprite) in enumerate(zip(skins, bases)):
        x = GUTTER + i * 165
        place(sprite, x, 33, 124)
        labels.text((x + 62, 160), skin["name"], font=body, anchor="mt", fill=INK)

    labels.text((18, 215), "On beş saç rengi", font=body, fill=INK)
    for i, color in enumerate(hair_colors):
        x = GUTTER + 78 * i
        sprite = draw_avatar(bases[1], hairstyles[0], color["color"], None, None)
        place(sprite, x + 5, 192, 66)
        labels.text((x + 38, 262), color["name"], font=tiny, anchor="mt", fill=INK)

    combinations = [
        (bases[skin], cap if cap_on else None, glasses if glasses_on else None)
        for skin in (0, 4) for cap_on in (False, True) for glasses_on in (False, True)
    ]
    labels.text((GUTTER + 2 * CELL, 304), skins[0]["name"], font=body, anchor="mt", fill=INK)
    labels.text((GUTTER + 6 * CELL, 304), skins[4]["name"], font=body, anchor="mt", fill=INK)
    for col, label in enumerate(("Temel", "Gözlük", "Şapka", "Şapka + gözlük") * 2):
        labels.text((GUTTER + CELL * col + CELL // 2, 327), label,
                    font=tiny, anchor="mt", fill=INK)

    # Use the same brown for every fit test so edge artefacts are comparable.
    test_color = hair_colors[2]["color"]
    for row, style in enumerate(hairstyles):
        y = top + row * row_height
        labels.line((18, y, width - 18, y), fill="#dccfc2")
        labels.text((18, y + 52), style["name"], font=body, fill=INK)
        labels.text((18, y + 173), "96 px", font=tiny, fill=INK)
        for col, (base_sprite, hat, g) in enumerate(combinations):
            sprite = draw_avatar(base_sprite, style, test_color, hat, g)
            x = GUTTER + col * CELL
            place(sprite, x + 4, y + 4, 140)
            place(sprite, x + 26, y + 151, 96)

    sheet.convert("RGB").save(HERE / "onizleme_faz1.png", optimize=True)


if __name__ == "__main__":
    main()
