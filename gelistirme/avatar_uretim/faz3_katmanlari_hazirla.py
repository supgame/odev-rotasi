#!/usr/bin/env python3
"""Extract registered clothing and expression masters from the ImageGen sources."""

import numpy as np
from PIL import Image, ImageFilter

from faz3_katalog import CLOTHES, FACES
from katmanlari_hazirla import PILOT, SOURCE, LUMA, RAW_SIDE, align_canvas, curve, pilot, rgba
from paketle import _gray_in_mask

SIDE = 1024
Y, X = np.ogrid[:SIDE, :SIDE]
SHORT_SLEEVES = {"overalls", "striped_tee", "football"}
# These measurements are in the aligned canvas. Higher collars may cover neck skin.
UPPER_EDGE = {"astronaut": 638, "tracksuit": 630, "winter_coat": 625, "dinosaur": 615}


def alpha_image(pixels, alpha):
    result = pixels.copy()
    result[..., 3] = np.rint(255 * np.clip(alpha, 0, 1)).astype(np.uint8)
    return pilot["clean"](Image.fromarray(result))


def gray_master(layer, coverage, path, mask_suffix):
    mask = Image.fromarray(np.uint8(np.rint(255 * np.clip(coverage, 0, 1))))
    _gray_in_mask(layer, mask).save(path)
    mask.save(path.with_stem(f"{path.stem}_{mask_suffix}"))


def edit(slot, stem):
    path = SOURCE / "imagegen" / f"faz3_{slot}_{stem}.png"
    return align_canvas(rgba(path).resize((RAW_SIDE, RAW_SIDE), Image.Resampling.LANCZOS))


def shirt_area(base, skin_mask):
    return (Y >= 645) & (skin_mask < 100) & (base[..., 3] > 12)


def bounds(opaque):
    return np.min(np.where(opaque, X, SIDE), axis=1), np.max(np.where(opaque, X, -1), axis=1)


def average(vector, radius):
    return np.convolve(np.pad(vector, radius, mode="edge"),
                       np.ones(2 * radius + 1) / (2 * radius + 1), mode="valid")


def remap(layer, source_x, source_y):
    source_x, source_y = (np.clip(a, 0, SIDE - 1) for a in (source_x, source_y))
    xi, yi = (np.floor(a).astype(int) for a in (source_x, source_y))
    xj, yj = np.minimum(xi + 1, SIDE - 1), np.minimum(yi + 1, SIDE - 1)
    dx, dy = (source_x - xi)[..., None], (source_y - yi)[..., None]
    rgb_a = np.asarray(layer.convert("RGBa"), dtype=np.float32)
    top = rgb_a[yi, xi] * (1 - dx) + rgb_a[yi, xj] * dx
    bottom = rgb_a[yj, xi] * (1 - dx) + rgb_a[yj, xj] * dx
    return Image.fromarray(np.uint8(np.rint(top * (1 - dy) + bottom * dy)), "RGBa").convert("RGBA")


def fabric(layer, stem):
    pixels = np.asarray(layer)
    red, green, blue = np.moveaxis(pixels[..., :3].astype(float), -1, 0)
    warm = (curve(red - green, 36, 60) * curve(green - blue, 18, 39)
            * curve(red - green - .69 * (green - blue), 10, 21))
    neck = (Y < 806) & (abs(X - 512) < 108)
    cut = np.where(neck, warm, 0)
    if stem in SHORT_SLEEVES:
        cut = np.maximum(cut, np.where((Y > 850) & (abs(X - 512) > 100), warm, 0))
        # Drop the isolated slip of arm outline outside the fabric's own hem.
        if stem == "striped_tee":
            cloth_color = (green > red) | ((red - green < 49) & (green > 50))
        elif stem == "overalls":
            cloth_color = (blue > red) | ((green - blue > 52) & (red - green < .85 * (green - blue)))
        else:
            cloth_color = blue >= red - 14
        body = (pixels[..., 3] > 150) & cloth_color
        left, right = bounds(body)
        out = (X < left[:, None] - 2) | (X > right[:, None] + 2)
        cut = np.where((Y > 940) & out, 1, cut)
    # Suppress the thin warm halo at the traced neckline and arm borders.
    cut = np.asarray(Image.fromarray(np.uint8(cut * 255)).filter(ImageFilter.MaxFilter(3))) / 255
    alpha = np.where(Y >= UPPER_EDGE.get(stem, 648), pixels[..., 3] / 255 * (1 - cut), 0)
    alpha[alpha > .985] = 1
    return alpha_image(pixels, alpha)


def fit_garment(layer, stem, base, tee):
    target = tee if stem in SHORT_SLEEVES else (base[..., 3] > 80) & (Y >= 655)
    present = np.asarray(layer)[..., 3] > 150
    left, right = bounds(present)
    target_left, target_right = bounds(target)
    src = (left, right)
    dst = (target_left, target_right)
    # Expand the sleeves only as needed to cover the old shirt and arms.
    # Use a smooth envelope so the new shoulder and sleeve lines stay curved.
    widths = []
    for side, source, desired in zip((-1, 1), src, dst):
        old_width = (source - 512) * side
        wanted_width = (desired - 512) * side
        ratio = np.clip((wanted_width + 5) / np.maximum(old_width, 1), 1, 1.27)
        ratio[:718] = ratio[718]
        nearby = np.lib.stride_tricks.sliding_window_view(np.pad(ratio, 12, mode="edge"), 25)
        widths.append(average(nearby.max(axis=1), 12))
    source_x = 512 + (X - 512) / np.where(X < 512, widths[0][:, None], widths[1][:, None])
    layer = remap(layer, source_x, Y)
    present = np.asarray(layer)[..., 3] > 140
    top = np.min(np.where(present, Y, SIDE), axis=0)
    tee_top = np.min(np.where(tee, Y, SIDE), axis=0)
    shift = np.clip(top - (tee_top - 3), 0, 43)
    shift[(top >= 920) | (tee_top >= 830)] = 0
    shift = average(shift, 7)
    source_y = Y + shift * (1 - curve(Y, 800, 950))
    return remap(layer, X, source_y)


def garment_mask(layer, stem):
    pixels = np.asarray(layer)
    rgb = pixels[..., :3].astype(float)
    red, green, blue = np.moveaxis(rgb, -1, 0)
    lum = rgb @ LUMA
    ink = curve(lum, 18, 47)
    if stem in {"tracksuit", "football", "superhero", "winter_coat"}:
        # Keep white piping and the cape/clasp art in their drawn colors.
        dye = curve(blue - red, 8, 41) * curve(blue - green, 5, 24)
    elif stem == "collared_sweater":
        dye = curve(green - red, 8, 30) * curve(blue - red, 8, 30)
    elif stem == "blazer":
        dye = curve(blue - green, 8, 28) * curve(red - green, 8, 27)
    else:
        dye = 1
    return dye * ink * curve(pixels[..., 3].astype(float), 85, 243)


# Use local crop mattes around the original and edited graphic features. These
# masks control extraction of drawn pixels; all visible marks come from ImageGen.
FACE_REGIONS = {
    "big_grin": ("mouth",),
    "wink": ("left",),
    "tongue": ("mouth",),
    "surprised": ("left", "right", "mouth"),
    "heart_eyes": ("left_eye", "right_eye", "mouth"),
    "star_eyes": ("left_eye", "right_eye"),
    "smirk": ("left_brow", "right_brow", "mouth"),
    "happy_closed": ("left", "right", "mouth"),
}
PATCHES = {
    "left": (325, 285, 493, 498),
    "right": (532, 285, 698, 498),
    "left_eye": (333, 375, 487, 490),
    "right_eye": (537, 375, 691, 490),
    "left_brow": (338, 321, 487, 388),
    "right_brow": (535, 321, 684, 388),
    "mouth": (431, 509, 593, 585),
}


def patch_alpha(box):
    left, top, right, bottom = box
    distance = np.minimum(np.minimum(X - left, right - X), np.minimum(Y - top, bottom - Y))
    return curve(distance, 0, 12)


def face_layer(layer, stem, base, base_skin):
    pixels = np.asarray(layer)
    rgb = pixels[..., :3].astype(float)
    red, green, blue = np.moveaxis(rgb, -1, 0)
    lum = rgb @ LUMA
    mask = (curve(red - green, 36, 66) * curve(green - blue, 30, 57)
            * curve(lum, 112, 153))
    # Prevent orange/brown irises, yellow stars, pink hearts and mouth interiors
    # from moving with the selected skin tone.
    if stem == "star_eyes":
        mask *= 1 - curve(green - 179, 0, 11) * curve(green - blue, 74, 97) * (Y < 485)
    crop = np.maximum.reduce([patch_alpha(PATCHES[region]) for region in FACE_REGIONS[stem]])
    # Cover both sets of features, including the old feature when the new
    # expression has bare skin there. Feather only around their contours.
    drawn = ((base_skin < 155) | (mask < .65)) & (crop > .5) & (pixels[..., 3] > 250)
    matte = Image.fromarray(np.uint8(drawn) * 255)
    matte = matte.filter(ImageFilter.MaxFilter(13)).filter(ImageFilter.GaussianBlur(3))
    alpha = np.minimum(1, np.asarray(matte) / 230) * crop
    known_skin = (alpha > .08) & (base_skin > 245) & (mask > .9)
    offset = float(np.median(base[..., 0][known_skin] - lum[known_skin]))
    gray = np.clip(lum + offset, 0, 255)
    overlap = curve(base_skin.astype(float), 205, 250) * curve(mask, .9, 1)
    gray = gray * (1 - overlap) + base[..., 0] * overlap
    result = pixels.copy()
    result[..., :3] = np.where(mask[..., None] > .95, np.rint(gray[..., None]), result[..., :3])
    alpha[alpha > .985] = 1
    return alpha_image(result, alpha), mask * (alpha > .03)


def main():
    clothes_path, face_path = (SOURCE / slot for slot in ("clothes", "face"))
    for folder in (clothes_path, face_path):
        folder.mkdir(exist_ok=True)
    base = np.asarray(rgba(SOURCE / "base" / "base.png"))
    base_skin = np.asarray(Image.open(SOURCE / "base" / "base_skinmask.png").convert("L"))
    tee = shirt_area(base, base_skin)
    for stem, _, _, tintable in CLOTHES:
        path = clothes_path / f"{stem}.png"
        if stem == "tshirt":
            layer = alpha_image(base, base[..., 3] / 255 * tee)
        elif stem == "hoodie":
            layer = fit_garment(rgba(PILOT / "top_hoodie.png"), stem, base, tee)
        else:
            layer = fit_garment(fabric(edit("clothes", stem), stem), stem, base, tee)
        if tintable:
            gray_master(layer, garment_mask(layer, stem), path, "mask")
        else:
            layer.save(path)

    for stem, _, _, raw in FACES:
        if raw:
            layer, mask = face_layer(edit("face", raw), raw, base, base_skin)
            gray_master(layer, mask, face_path / f"{stem}.png", "skinmask")


if __name__ == "__main__":
    main()
