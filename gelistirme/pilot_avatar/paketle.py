#!/usr/bin/env python3
"""Export the aligned avatar layers and assemble the contact sheet from WebP."""

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "kaynak"
WEBP = ROOT.parents[1] / "public" / "av" / "pilot"
SIZE = (512, 512)
LANCZOS = Image.Resampling.LANCZOS
TINT = (91, 133, 190)
LUMA = (0.2126, 0.7152, 0.0722)
Z_BY_LAYER = {
    "hair_long_back": 10,
    "base_skin1": 20,
    "base_skin2": 20,
    "top_hoodie": 30,
    "hair_short_front": 40,
    "hair_long_front": 40,
    "hair_under_cap_short": 40,
    "hair_under_cap_long": 40,
    "hat_cap": 50,
    "glasses_round": 60,
}
STYLES = {
    style: {
        "back": "hair_long_back" if style == "long" else None,
        "front": f"hair_{style}_front",
        "frontWithCap": f"hair_under_cap_{style}",
    }
    for style in ("short", "long")
}


def package_layer(name, *, is_mask=False):
    expected_size = SIZE if name == "pet_fox" else (1024, 1024)
    with Image.open(SOURCE / f"{name}.png") as source:
        if source.size != expected_size:
            raise ValueError(f"{name} must be {expected_size}, found {source.size}")
        image = source.convert("L" if is_mask else "RGBA").resize(SIZE, LANCZOS)
    path = WEBP / f"{name}.webp"
    image.save(path, "WEBP", lossless=is_mask, quality=94, method=6)
    with Image.open(path) as exported:
        return exported.convert(image.mode)


def tint_hoodie(image, mask, color):
    pixels = np.array(image, dtype=np.float32)
    coverage = np.asarray(mask, dtype=np.float32)[..., None] / 255
    rgb = pixels[..., :3]
    luminance = rgb @ LUMA
    color_luminance = max(float(np.dot(color, LUMA)), 1)
    dyed = np.clip(np.array(color) * (luminance[..., None] / color_luminance), 0, 255)
    pixels[..., :3] = rgb * (1 - coverage) + dyed * coverage
    return Image.fromarray(np.rint(pixels).astype(np.uint8))


def manifest():
    layers = {
        name: {"file": f"{name}.webp", "source": f"{name}.png", "z": z}
        for name, z in Z_BY_LAYER.items()
    }
    return {
        "version": 1,
        "avatarCanvas": {"width": 512, "height": 512, "masterWidth": 1024, "masterHeight": 1024},
        "layers": layers,
        "composition": {
            "skin": {"1": "base_skin1", "2": "base_skin2"},
            "hair": STYLES,
            "top": "top_hoodie",
            "cap": {"layer": "hat_cap", "frontReplacementField": "frontWithCap"},
            "glasses": "glasses_round",
        },
        "occlusion": {
            "hat_cap": {"replacesFrontHair": True, "preservesRearHair": True},
            "top_hoodie": {"overlays": ["base_skin1", "base_skin2"]},
        },
        "tint": {
            "layer": "top_hoodie",
            "mask": {"file": "top_hoodie_mask.webp", "source": "top_hoodie_mask.png", "channel": "red"},
            "coverage": {"0": "original", "255": "full tint"},
            "method": "luminance-preserving-rgb-mix",
            "lumaWeights": list(LUMA),
            "previewColor": list(TINT),
        },
        "pet": {"id": "pet_fox", "file": "pet_fox.webp", "source": "pet_fox.png", "width": 512, "height": 512},
    }


def assemble(layers, skin, style, cap, glasses, hoodie):
    hair = STYLES[style]
    names = [f"base_skin{skin}", "top_hoodie", hair["frontWithCap" if cap else "front"]]
    if hair["back"]:
        names.append(hair["back"])
    if cap:
        names.append("hat_cap")
    if glasses:
        names.append("glasses_round")

    result = Image.new("RGBA", SIZE)
    for name in sorted(names, key=Z_BY_LAYER.__getitem__):
        result.alpha_composite(hoodie if name == "top_hoodie" else layers[name])
    return result


def contact_sheet(layers, mask):
    sheet = Image.new("RGB", (1160, 1218), "#f4f5f7")
    draw = ImageDraw.Draw(sheet)
    ink, secondary = "#25233a", "#555469"
    title = ImageFont.truetype("NotoSans-SemiBold.ttf", 29)
    body = ImageFont.truetype("NotoSans-Regular.ttf", 16)
    small = ImageFont.truetype("NotoSans-Regular.ttf", 13)
    draw.text((27, 24), "Ödev Rotası avatar pilotu", font=title, fill=ink)
    draw.text((27, 62), "16 kombinasyon, iki ten tonu ve iki saç", font=body, fill=secondary)

    options = [(False, False), (False, True), (True, False), (True, True)]
    columns = ["Şapkasız · gözlüksüz", "Şapkasız · gözlüklü", "Şapkalı · gözlüksüz", "Şapkalı · gözlüklü"]
    rows = [(1, "short"), (1, "long"), (2, "short"), (2, "long")]
    row_labels = [("Açık buğday", "Kısa saç"), ("Açık buğday", "At kuyruğu"),
                  ("Esmer", "Kısa saç"), ("Esmer", "At kuyruğu")]
    left, top, step_x, step_y = 135, 123, 197, 201

    def place(sprite, x, y, size):
        thumbnail = sprite.resize((size, size), LANCZOS)
        sheet.paste(thumbnail, (x, y), thumbnail)

    for column, label in enumerate(columns):
        center_x = left + step_x * column + 91
        draw.text((center_x, 103), label, font=small, anchor="mm", fill=secondary)

    dyed = tint_hoodie(layers["top_hoodie"], mask, TINT)
    rendered = []
    for row, (skin, style) in enumerate(rows):
        y = top + step_y * row
        draw.text((27, y + 77), row_labels[row][0], font=body, fill=ink)
        draw.text((27, y + 102), row_labels[row][1], font=small, fill=secondary)
        for column, (cap, glasses) in enumerate(options):
            x = left + step_x * column
            use_dyed = (row, column) == (0, 0)
            hoodie = dyed if use_dyed else layers["top_hoodie"]
            avatar = assemble(layers, skin, style, cap, glasses, hoodie)
            rendered.append(avatar)
            draw.rounded_rectangle((x, y, x + 182, y + 183), radius=14, fill="#e6eaf1")
            place(avatar, x + 4, y + 2, 176)
            if use_dyed:
                draw.text((x + 8, y + 8), "Mavi", font=small, fill=secondary)

    draw.rounded_rectangle((924, 123, 1132, 333), radius=14, fill="#f6eadc")
    place(layers["pet_fox"], 932, 132, 192)
    draw.text((1028, 358), "Tilki arkadaş", font=body, anchor="mm", fill=ink)
    draw.text((27, 944), "96 px görünüm", font=body, fill=ink)
    draw.text((27, 969), "Kombinasyonlar yukarıdaki sırada", font=small, fill=secondary)
    for index, avatar in enumerate(rendered):
        row, column = divmod(index, 8)
        x, y = 139 + 111 * column, 989 + 106 * row
        draw.rounded_rectangle((x, y, x + 96, y + 96), radius=8, fill="#e6eaf1")
        place(avatar, x, y, 96)
    sheet.save(ROOT / "onizleme.png", optimize=True)


def main():
    WEBP.mkdir(parents=True, exist_ok=True)
    layers = {name: package_layer(name) for name in (*Z_BY_LAYER, "pet_fox")}
    mask = package_layer("top_hoodie_mask", is_mask=True)
    contact_sheet(layers, mask)
    (WEBP / "manifest.json").write_text(
        json.dumps(manifest(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()
