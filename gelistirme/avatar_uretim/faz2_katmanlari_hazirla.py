#!/usr/bin/env python3
"""Clean and align the ImageGen accessory drawings on the 1024 px avatar."""

from pathlib import Path

import numpy as np
from PIL import Image

from faz2_katalog import ACCESSORIES
from paketle import SOURCE, _gray_in_mask


PILOT = Path(__file__).resolve().parent.parent / "pilot_avatar" / "kaynak"
RAW = SOURCE / "imagegen" / "faz2"
CANVAS = (1024, 1024)
LANCZOS = Image.Resampling.LANCZOS
LUMA = np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)

# Width, height and the center of the front lower edge (in avatar pixels).
HAT_FITS = {
    "pom": (478, 331, 341),
    "earflap": (498, 420, 341),
    "cat": (492, 313, 343),
    "bucket": (533, 310, 341),
    "cowboy": (593, 280, 350),
    "wizard": (625, 450, 350),
    "pirate": (560, 430, 340),
    "crown": (490, 343, 341),
    "pilot": (545, 388, 342),
    "bear": (520, 360, 338),
}

# Bounds are calibrated to the eye centers / hinge span of the round pilot
# frame. The one-sided patch uses the left iris, with its strap above the right.
GLASSES_FITS = {
    "square": (310, 369, 715, 513),
    "aviator": (309, 368, 715, 510),
    "sunglasses": (308, 368, 716, 509),
    "heart": (305, 366, 719, 520),
    "star": (289, 345, 735, 528),
    "eyepatch": (300, 339, 729, 503),
}


def read_rgba(path):
    with Image.open(path) as image:
        return image.convert("RGBA")


def ramp(value, start, end):
    return np.clip((value - start) / (end - start), 0, 1)


def clean_source(image):
    pixels = np.array(image)
    alpha = pixels[..., 3]
    solid_bounds = image.getchannel("A").point(lambda value: 255 if value >= 150 else 0).getbbox()
    if not solid_bounds:
        raise ValueError("ImageGen output has no opaque artwork")
    # Remove faint alpha haze outside the sprite and from the lens cutouts.
    alpha[:] = np.rint(255 * ramp(alpha.astype(np.float32), 14, 238)).astype(np.uint8)
    x0, y0, x1, y1 = solid_bounds
    return Image.fromarray(pixels).crop((x0 - 2, y0 - 2, x1 + 2, y1 + 2))


def fit(stem, slot, artwork):
    layer = Image.new("RGBA", CANVAS)
    if slot == "hat":
        width, height, anchor = HAT_FITS[stem]
        sprite = artwork.resize((width, height), LANCZOS)
        solid = np.array(sprite.getchannel("A")) > 190
        bottom = np.max(np.where(solid, np.arange(height)[:, None], 0), axis=0)
        center = round(float(np.median(bottom[width // 2 - 12:width // 2 + 12])))
        x, y = (CANVAS[0] - width) // 2, anchor - center
    else:
        x, y, right, bottom = GLASSES_FITS[stem]
        sprite = artwork.resize((right - x, bottom - y), LANCZOS)
    if x < 0 or y < 0 or x + sprite.width > CANVAS[0] or y + sprite.height > CANVAS[1]:
        raise ValueError(f"{stem}: artwork exceeds the 1024 px canvas")
    layer.alpha_composite(sprite, (x, y))
    return layer


def dye_mask(layer, stem):
    pixels = np.asarray(layer, dtype=np.float32)
    rgb = pixels[..., :3]
    lum = rgb @ LUMA
    red, green, blue = np.moveaxis(rgb, -1, 0)
    dye = ramp(lum, 19, 62) * ramp(pixels[..., 3], 0, 110)
    if stem in {"wizard", "aviator", "cowboy", "square", "bear", "star", "heart"}:
        # Keep warm stars, hinges, the hat band and teddy ear lining in source colors.
        dye *= ramp(np.maximum(green, blue) - red, 6, 25)
    if stem == "sunglasses":
        # Teal acetate has more green than red. The dark lenses do not.
        dye *= ramp(green - red, 7, 25)
    if stem == "round":
        # Preserve the gold rivets against the pilot's plum acetate frame.
        dye *= ramp(blue - green, -8, 4)
    return Image.fromarray(np.uint8(np.rint(dye * 255)))


def main():
    pilot_art = {"cap": "hat_cap.png", "round": "glasses_round.png"}
    for slot, accessories in ACCESSORIES.items():
        folder = SOURCE / slot
        folder.mkdir(parents=True, exist_ok=True)
        for stem, _, _, variants in accessories:
            if stem in pilot_art:
                layer = read_rgba(PILOT / pilot_art[stem])
            else:
                raw_stem = "eyepatch_v2" if stem == "eyepatch" else stem
                layer = fit(stem, slot, clean_source(read_rgba(RAW / f"{raw_stem}.png")))
            if variants:
                mask = dye_mask(layer, stem)
                mask.save(folder / f"{stem}_mask.png", optimize=True)
                layer = _gray_in_mask(layer, mask)
            layer.save(folder / f"{stem}.png", optimize=True)


if __name__ == "__main__":
    main()
