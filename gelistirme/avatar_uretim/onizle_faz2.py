#!/usr/bin/env python3
"""Make the phase 2 contact sheet from the published WebP layers."""

import json
from functools import lru_cache

from PIL import Image, ImageDraw, ImageFont

from onizle_faz1 import BG, FONT, HERE, INK, LANCZOS, colored, draw_avatar, open_layer
from paketle import PUBLIC


CELL = 153
GUTTER = 212
DETAIL = 140
THUMB = 96
COLS = 8


@lru_cache(maxsize=None)
def accessory(layer, mask=None, ref=None, color=None):
    return colored(layer, mask, ref, color) if mask else open_layer(layer)


def layer(item):
    return accessory(item["layer"], item.get("mask"), item.get("ref"), item.get("color"))


def main():
    manifest = json.loads((PUBLIC / "manifest.json").read_text(encoding="utf-8"))
    slots = manifest["slots"]
    base = manifest["base"]
    skins = (slots["skin"]["items"][0], slots["skin"]["items"][-1])
    bases = [colored(base["layer"], base["skinMask"], base["skinRef"], skin["color"]) for skin in skins]
    hairstyles = {item["id"]: item for item in slots["hair"]["items"]}
    styles = [hairstyles[key] for key in ("hair_short", "hair_headscarf")]
    hats, glasses = (slots[slot]["items"] for slot in ("hat", "glasses"))
    cap, round_glasses = layer(hats[0]), layer(glasses[0])
    rows = [len({item["layer"] for item in items}) for items in (hats, glasses)]
    row_height = 250
    width = GUTTER + COLS * CELL + 15
    height = 50 + 120 * len(rows) + sum(rows) * row_height
    sheet = Image.new("RGBA", (width, height), BG)
    labels = ImageDraw.Draw(sheet)
    heading, title, body, tiny = [ImageFont.truetype(FONT, size) for size in (28, 23, 16, 12)]
    labels.text((16, 10), "Faz 2 · Şapkalar ve gözlükler", fill=INK, font=heading)

    def place(sprite, col, y, size):
        x = GUTTER + col * CELL + (CELL - size) // 2
        sheet.alpha_composite(sprite.resize((size, size), LANCZOS), (x, y))

    def centered(text, col, y):
        x = GUTTER + (col + 0.5) * CELL
        labels.text((x, y), text, fill=INK, font=tiny, anchor="mt")

    y = 60
    for slot, section, items in (("hat", "Şapkalar", hats), ("glasses", "Gözlükler", glasses)):
        labels.text((16, y), section, fill=INK, font=title)
        labels.text((16, y + 38), "Kısa saç ve başörtüsü", font=body, fill=INK)
        context = ("Gözlüksüz", "Yuvarlak gözlük") if slot == "hat" else ("Şapkasız", "Beyzbol şapkası")
        for col in range(COLS):
            style = styles[(col // 2) % 2]
            centered(f"{skins[col // 4]['name']} · {style['name']}", col, y + 28)
            centered(context[col % 2], col, y + 48)
        y += 75
        grouped = {}
        for item in items:
            grouped.setdefault(item["layer"], []).append(item)
        for variants in grouped.values():
            labels.line((16, y, width - 16, y), fill="#dccfc2")
            item = variants[0]
            labels.text((16, y + 53), item["name"], fill=INK, font=body)
            labels.text((16, y + 179), "96 px · renk seçenekleri", fill=INK, font=tiny)
            primary = layer(item)
            for col in range(COLS):
                hat, glasses_layer = ((primary, round_glasses if col % 2 else None) if slot == "hat"
                                      else (cap if col % 2 else None, primary))
                sprite = draw_avatar(bases[col // 4], styles[(col // 2) % 2], "74472e", hat, glasses_layer)
                place(sprite, col, y + 5, DETAIL)
                variant = variants[col % len(variants)]
                option = layer(variant)
                hat, glasses_layer = (option, glasses_layer) if slot == "hat" else (hat, option)
                sprite = draw_avatar(bases[col // 4], styles[(col // 2) % 2], "74472e", hat, glasses_layer)
                place(sprite, col, y + 148, THUMB)
            y += row_height
        y += 35
    sheet.crop((0, 0, width, y)).convert("RGB").save(HERE / "onizleme_faz2.png", optimize=True)


if __name__ == "__main__":
    main()
