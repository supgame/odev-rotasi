#!/usr/bin/env python3
"""Build the Phase 4 contact sheet and avatar fit checks from published WebPs."""

import json
from itertools import product

from PIL import Image, ImageDraw, ImageFont

from onizle_faz1 import BG, FONT, HERE, INK, LANCZOS, colored, draw_avatar, open_layer
from onizle_faz3 import dyed
from paketle import PUBLIC


def avatars(manifest):
    slots = manifest["slots"]
    skins = slots["skin"]["items"]
    short = next(item for item in slots["hair"]["items"] if item["id"] == "hair_short")
    cap = slots["hat"]["items"][0]
    glasses = slots["glasses"]["items"][0]
    cap_layer = dyed(cap, cap.get("color", "d83a3a"))
    glasses_layer = dyed(glasses, glasses.get("color", "222222"))
    base = manifest["base"]
    for skin in (skins[0], skins[-1]):
        layer = colored(base["layer"], base["skinMask"], base["skinRef"], skin["color"])
        for use_cap, use_glasses in product((False, True), repeat=2):
            yield draw_avatar(layer, short, "74472e", cap_layer if use_cap else None,
                              glasses_layer if use_glasses else None)


def main():
    manifest = json.loads((PUBLIC / "manifest.json").read_text(encoding="utf-8"))
    pets = manifest["slots"]["pet"]["items"]
    cols, cell_width, cell_height, top = 4, 580, 251, 90
    row_count = (len(pets) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * cell_width, top + row_count * cell_height), BG)
    draw = ImageDraw.Draw(sheet)
    heading, label, small = [ImageFont.truetype(FONT, size) for size in (30, 17, 13)]
    draw.text((16, 10), f"Faz 4 · {len(pets)} hayvan arkadaşı", font=heading, fill=INK)
    draw.text((16, 56), "Önizleme 128 px ve 96 px · Açık ve koyu tende, şapkalı ve gözlüklü kombinasyonlar",
              font=label, fill=INK)
    avatar_samples = [avatar.resize((96, 96), LANCZOS) for avatar in avatars(manifest)]

    for i, item in enumerate(pets):
        x = i % cols * cell_width + 15
        y = i // cols * cell_height + top
        layer = open_layer(item["image"])
        draw.line((x, y, x + cell_width - 30, y), fill="#dccfc2")
        draw.text((x, y + 10), f"{item['name']} · {item['price']} yıldız", font=label, fill=INK)
        sheet.alpha_composite(layer.resize((128, 128), LANCZOS), (x + 29, y + 35))
        sheet.alpha_composite(layer.resize((96, 96), LANCZOS), (x + 45, y + 150))
        draw.text((x + 5, y + 215), "96 px", font=small, fill=INK)

        # In the app the pet is 42% as wide as the avatar and sits slightly
        # to the left of and below the avatar's bottom-left corner.
        pet_sample = layer.resize((40, 40), LANCZOS)
        for j, avatar in enumerate(avatar_samples):
            col, row = j % 4, j // 4
            offset = (x + 180 + col * 100, y + 34 + row * 101)
            sheet.alpha_composite(avatar, offset)
            sheet.alpha_composite(pet_sample, (offset[0] - 12, offset[1] + 62))
    sheet.convert("RGB").save(HERE / "onizleme_faz4.png", optimize=True)


if __name__ == "__main__":
    main()
