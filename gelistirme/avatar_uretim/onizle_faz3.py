#!/usr/bin/env python3
"""Build the phase 3 contact sheet from published clothes and face layers."""

import json
from functools import lru_cache

from PIL import Image, ImageDraw, ImageFont

from onizle_faz1 import BG, FONT, HERE, INK, LANCZOS, colored, draw_avatar, open_layer
from paketle import PUBLIC, tint


CELL = 150
GUTTER = 230
DETAIL = 132
THUMB = 96
COLS = 8
BASE_COLOR = "74472e"
OUTFIT_COLORS = {
    "clothes_tshirt": "blue",
    "clothes_hoodie": "mint",
    "clothes_tracksuit": "red",
    "clothes_collared_sweater": "green",
    "clothes_blazer": "purple",
    "clothes_football": "blue",
    "clothes_superhero": "navy",
    "clothes_winter_coat": "orange",
}


@lru_cache(maxsize=None)
def asset(path):
    return open_layer(path)


def dyed(item, color):
    if not item.get("mask"):
        return asset(item["layer"])
    return tint(asset(item["layer"]), open_layer(item["mask"], "L"),
                float(item["ref"]), color)


def composite(base, face, clothes, skin_color):
    out = Image.new("RGBA", base.size)
    out.alpha_composite(base)
    if face.get("layer"):
        out.alpha_composite(dyed(face, skin_color))
    if clothes:
        out.alpha_composite(clothes)
    return out


def main():
    manifest = json.loads((PUBLIC / "manifest.json").read_text(encoding="utf-8"))
    slots = manifest["slots"]
    skins = [slots["skin"]["items"][0], slots["skin"]["items"][-1]]
    clothes = slots["clothes"]["items"]
    faces = slots["face"]["items"]
    colors = slots["ccolor"]["items"]
    palette = {item["id"].removeprefix("ccolor_"): item for item in colors}
    tee = next(item for item in clothes if item["id"] == "clothes_tshirt")

    # Column order matches the eight fit combinations used in earlier sheets.
    combinations = [(skin_i, cap_on, glasses_on)
                    for skin_i in range(2)
                    for cap_on in (False, True)
                    for glasses_on in (False, True)]
    skin_layers = [colored(manifest["base"]["layer"], manifest["base"]["skinMask"],
                           manifest["base"]["skinRef"], skin["color"])
                   for skin in skins]
    short = next(item for item in slots["hair"]["items"] if item["id"] == "hair_short")
    cap_item = slots["hat"]["items"][0]
    glasses_item = slots["glasses"]["items"][0]
    cap = dyed(cap_item, cap_item.get("color", "d83a3a"))
    glasses = dyed(glasses_item, glasses_item.get("color", "222222"))

    heading, title, body, tiny = [ImageFont.truetype(FONT, n) for n in (28, 22, 15, 12)]
    row_height = 236
    top = 190
    color_height = 342
    width = GUTTER + COLS * CELL + 16
    height = top + (len(clothes) + len(faces)) * row_height + color_height + 60
    sheet = Image.new("RGBA", (width, height), BG)
    draw = ImageDraw.Draw(sheet)
    draw.text((18, 12), "Faz 3 · Kıyafetler ve yüz ifadeleri", font=heading, fill=INK)
    draw.text((18, 52), "İki ten · şapka ve yuvarlak gözlük", font=body, fill=INK)

    def center(text, col, y, font=tiny):
        draw.text((GUTTER + (col + .5) * CELL, y), text, font=font, fill=INK, anchor="mt")

    def place(sprite, col, y, size):
        x = GUTTER + col * CELL + (CELL - size) // 2
        sheet.alpha_composite(sprite.resize((size, size), LANCZOS), (x, y))

    for col, (skin_i, cap_on, glasses_on) in enumerate(combinations):
        center(f"{skins[skin_i]['name']} · {'şapka' if cap_on else 'şapkasız'}", col, 92)
        center("yuvarlak gözlük" if glasses_on else "gözlüksüz", col, 110)

    def avatar(skin_i, cap_on, glasses_on, face, garment):
        base = composite(skin_layers[skin_i], face, garment, skins[skin_i]["color"])
        return draw_avatar(base, short, BASE_COLOR, cap if cap_on else None,
                           glasses if glasses_on else None)

    y = top
    draw.text((18, y - 36), "Kıyafet türleri", font=title, fill=INK)
    for item in clothes:
        draw.line((16, y, width - 16, y), fill="#dccfc2")
        draw.text((18, y + 48), item["name"], font=body, fill=INK)
        draw.text((18, y + 154), "96 px", font=tiny, fill=INK)
        option = OUTFIT_COLORS.get(item["id"])
        garment = dyed(item, palette[option]["color"]) if option else asset(item["layer"])
        for col, (skin_i, cap_on, glasses_on) in enumerate(combinations):
            sprite = avatar(skin_i, cap_on, glasses_on, {"layer": None}, garment)
            place(sprite, col, y + 3, DETAIL)
            place(sprite, col, y + 132, THUMB)
        y += row_height

    y += 18
    draw.text((18, y - 26), "Yüz ifadeleri · düz tişört", font=title, fill=INK)
    sample_clothes = dyed(tee, palette["ice"]["color"])
    for face in faces:
        draw.line((16, y, width - 16, y), fill="#dccfc2")
        draw.text((18, y + 48), face["name"], font=body, fill=INK)
        draw.text((18, y + 154), "96 px", font=tiny, fill=INK)
        for col, (skin_i, cap_on, glasses_on) in enumerate(combinations):
            sprite = avatar(skin_i, cap_on, glasses_on, face, sample_clothes)
            place(sprite, col, y + 3, DETAIL)
            place(sprite, col, y + 132, THUMB)
        y += row_height

    y += 8
    draw.line((16, y, width - 16, y), fill="#c9b8a9", width=2)
    draw.text((18, y + 16), "Düz tişört · 17 renk", font=title, fill=INK)
    color_face = next((face for face in faces if face.get("layer") is None), {"layer": None})
    for i, color in enumerate(colors):
        col = i % COLS
        row = i // COLS
        x = GUTTER + col * CELL
        sy = y + 43 + row * 102
        sample = avatar(0, False, False, color_face, dyed(tee, color["color"]))
        place(sample, col, sy, 72)
        draw.text((x + CELL // 2, sy + 74), color["name"], font=tiny, fill=INK, anchor="mt")
    sheet.crop((0, 0, width, y + color_height)).convert("RGB").save(
        HERE / "onizleme_faz3.png", optimize=True)


if __name__ == "__main__":
    main()
