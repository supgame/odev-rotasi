#!/usr/bin/env python3
"""Align and isolate ImageGen pixels for phase 1."""

from pathlib import Path
import runpy

import numpy as np
from PIL import Image, ImageFilter

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "kaynak"
PILOT = HERE.parent / "pilot_avatar" / "kaynak"
# Use the pilot's coordinate mapping, including its separate neck/chest interval.
pilot = runpy.run_path(str(PILOT.parent / "katmanlari_hazirla.py"))
align_canvas = pilot["avatar_coordinates"]
LUMA = np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
RAW_SIDE = 1254

NEW_HAIR = (
    "curly", "afro", "straight_long", "bob", "bun", "braids",
    "space_buns", "wavy_long", "bangs_long", "spiky", "side_part", "headscarf",
)
# Raw portrait landmarks, in order left eye, right eye and smile.
LANDMARKS = ((502, 586, 124, 96), (749, 586, 124, 96), (626, 724, 136, 48))
# Skin exclusions follow the eye silhouette, including the whites and irises.
LEFT_EYE = ((406, 548), (439, 530), (479, 515), (518, 516),
            (550, 535), (566, 567), (578, 609), (580, 642),
            (478, 643), (451, 636), (427, 609), (420, 576))


def rgba(path):
    with Image.open(path) as im:
        return im.convert("RGBA")


def raw(name):
    return rgba(SOURCE / "imagegen" / f"{name}.png").resize(
        (RAW_SIDE, RAW_SIDE), Image.Resampling.LANCZOS)


def curve(values, start, end):
    return np.clip((values - start) / (end - start), 0, 1)


def polygon_mask(x, y, points):
    inside = np.zeros((RAW_SIDE, RAW_SIDE), dtype=bool)
    for (x1, y1), (x2, y2) in zip(points, (*points[1:], points[0])):
        if y1 != y2:
            crosses = (y1 > y) != (y2 > y)
            inside ^= crosses & (x < x1 + (x2 - x1) * (y - y1) / (y2 - y1))
    return inside


def skin_mask(base):
    rgb = np.asarray(base)[..., :3].astype(np.float32)
    red, green, blue = np.moveaxis(rgb, -1, 0)
    weight = curve(red - blue, 22, 49) * curve(green - blue, 9, 29)
    weight *= curve(rgb @ LUMA, 74, 115)
    x, y = np.ogrid[:RAW_SIDE, :RAW_SIDE][::-1]
    # Both eyes use the same center line in the approved bare portrait.
    for points in (LEFT_EYE, tuple((1252 - x, y) for x, y in LEFT_EYE)):
        weight[polygon_mask(x, y, points)] = 0
    weight[np.asarray(base.getchannel("A")) == 0] = 0
    matte = Image.fromarray(np.uint8(np.rint(weight * 255)))
    carrier = Image.merge("RGBA", (matte, matte, matte, Image.new("L", base.size, 255)))
    return align_canvas(carrier).getchannel("R")


def small_luma(im):
    return np.asarray(im.getchannel("G").resize((314, 314)), dtype=np.float32)


def locate(needle, edit, x, y, width, height):
    # Normalized patch matching tolerates differences in shading between edits.
    x, y = round(x / 4), round(y / 4)
    half_w, half_h = width // 8, height // 8
    template = needle[y-half_h:y+half_h, x-half_w:x+half_w].copy()
    template -= template.mean()
    radius = 20
    patch = edit[y-half_h-radius:y+half_h+radius, x-half_w-radius:x+half_w+radius]
    windows = np.lib.stride_tricks.sliding_window_view(patch, template.shape)
    areas = windows - windows.mean(axis=(-2, -1), keepdims=True)
    energy = np.sqrt(np.sum(areas * areas, axis=(-2, -1))) * np.linalg.norm(template)
    correlations = np.sum(areas * template, axis=(-2, -1)) / np.maximum(energy, 1)
    row, col = np.unravel_index(np.argmax(correlations), correlations.shape)
    # Subpixel estimate of the correlation peak along each axis.
    def refine(line, i):
        a, b, c = line[i-1:i+2]
        denominator = 2 * (a - 2 * b + c)
        return (a - c) / denominator if denominator else 0

    if min(row, col) == 0 or max(row, col) == 2 * radius:
        raise ValueError("Face landmark exceeded registration search window")
    dx = 4 * (col - radius + refine(correlations[row], col))
    dy = 4 * (row - radius + refine(correlations[:, col], row))
    return dx, dy


def face_transform(base, edit):
    baseline, sample = small_luma(base), small_luma(edit)
    left, right, mouth = [locate(baseline, sample, *box) for box in LANDMARKS]
    # Match eye spacing and vertical eye-to-smile distance independently.
    vertical_eye = (left[1] + right[1]) / 2
    sx = 1 + (right[0] - left[0]) / (LANDMARKS[1][0] - LANDMARKS[0][0])
    sy = 1 + (mouth[1] - vertical_eye) / (LANDMARKS[2][1] - LANDMARKS[0][1])
    tx = left[0] - (sx - 1) * LANDMARKS[0][0]
    ty = vertical_eye - (sy - 1) * LANDMARKS[0][1]
    return sx, 0, tx, 0, sy, ty


def isolate_hair(edit):
    pixels = np.array(edit)
    rgb = pixels[..., :3].astype(np.float32)
    red, green, blue = np.moveaxis(rgb, -1, 0)
    # Blue-teal is present only in the generated hair. Refuse neutral shirt
    # pixels while keeping dark navy ink and translucent antialiasing.
    cool = np.maximum(green, blue) - red
    weight = curve(cool, 6, 15) * curve(blue - red, 6, 12)
    pixels[..., 3] = np.rint(pixels[..., 3] * weight).astype(np.uint8)
    return Image.fromarray(pixels)


def cap_profile(cap):
    cap_alpha = np.asarray(cap.getchannel("A"))
    y = np.arange(cap.height)[:, None]
    lower = np.max(np.where(cap_alpha > 220, y, 0), axis=0)
    return np.maximum(np.where(lower > 0, lower, 352) - 9, 296)


def remap_rows(layer, lookup):
    # Interpolate premultiplied RGB so adjacent transparent pixels do not
    # darken the extracted antialiased fringe.
    premultiplied = np.asarray(layer.convert("RGBa"), dtype=np.float32)
    y = np.arange(layer.height)[:, None]
    lookup = np.clip(lookup, 0, layer.width - 1)
    left = lookup.astype(int)
    right = np.minimum(left + 1, layer.width - 1)
    mix = (lookup - left)[..., None]
    pixels = premultiplied[y, left] * (1 - mix) + premultiplied[y, right] * mix
    return Image.fromarray(np.uint8(np.rint(pixels)), "RGBa").convert("RGBA")


def fit_scarf(layer, base):
    # Match the pilot's ear silhouette by moving only the outside of each
    # cloth panel. Keep the traced opening around the cheeks in place.
    y, x = np.ogrid[:layer.height, :layer.width]
    ear_band = curve(y, 325, 402) * (1 - curve(y, 519, 594))
    cloth = np.asarray(layer.getchannel("A")) > 220
    head = np.asarray(base.getchannel("A")) > 8
    lookup = np.broadcast_to(x, cloth.shape).astype(float).copy()
    for side in (-1, 1):
        distance = (x - 512) * side
        panel = cloth & (distance > 120)
        inner = np.min(np.where(panel, distance, layer.width), axis=1, keepdims=True)
        outer = np.max(np.where(panel, distance, 0), axis=1, keepdims=True)
        silhouette = np.max(np.where(head, distance, 0), axis=1, keepdims=True)
        needed = np.maximum(silhouette + 4 - outer, 0)
        nearby = np.lib.stride_tricks.sliding_window_view(
            np.pad(needed[:, 0], 28, mode="edge"), 57)
        envelope = nearby.max(axis=1)
        smoothed = np.convolve(np.pad(envelope, 17, mode="edge"),
                               np.ones(35) / 35, mode="valid")
        extension = smoothed[:, None] * ear_band
        span = np.maximum(outer - inner, 1)
        shrink = span / (span + extension)
        shift = side * np.maximum(distance - inner, 0) * (1 - shrink)
        lookup -= shift
    return remap_rows(layer, lookup)


def under_cap(hair, threshold, taper_end=520):
    pixels = np.array(hair)
    height, width = pixels.shape[:2]
    y = np.arange(height)[:, None]
    x = np.arange(width)
    # Bring full-volume hair inward at the brim, easing back out below it.
    # The fitted roots overlap the brim so the visible locks never start with
    # a clean horizontal edge outside the cap.
    visible = pixels[..., 3] > 90
    widest = np.max(np.where(visible, abs(x - 512), 0), axis=1)
    factor = np.broadcast_to(1., (height,)).copy()
    for row in range(296, taper_end):
        if widest[row] > 195:
            narrow = min(1., 195 / widest[row])
            blend = curve(row, 354, taper_end)
            blend = blend * blend * (3 - 2 * blend)
            factor[row] = narrow + (1 - narrow) * blend
    kernel = np.ones(9) / 9
    factor = np.convolve(np.pad(factor, 4, mode="edge"), kernel, mode="valid")
    lookup = (x - 512) / factor[:, None] + 512
    trimmed = np.array(remap_rows(hair, lookup))
    trimmed[..., 3] = np.rint(trimmed[..., 3] * curve(y - threshold, 0, 5)).astype(np.uint8)
    return Image.fromarray(trimmed)


def save_layer(layer, destination, mask=None):
    pixels = np.array(layer)
    luminance = pixels[..., :3] @ LUMA
    if mask is None:
        # Preserve the darkest printed linework while tinting shaded fills.
        coverage = curve(luminance, 14, 48)
        coverage *= curve(pixels[..., 3], 0, 35)
        mask = Image.fromarray(np.uint8(np.rint(coverage * 255)))
        gray_region = pixels[..., 3] > 0
    else:
        gray_region = np.asarray(mask) > 8
    pixels[gray_region, :3] = np.rint(luminance[gray_region, None]).astype(np.uint8)
    pixels[pixels[..., 3] == 0] = 0
    Image.fromarray(pixels).save(destination)
    mask_path = destination.with_stem(
        destination.stem + ("_skinmask" if destination.stem == "base" else "_mask"))
    mask.save(mask_path)


def main():
    base_dir, hair_dir = SOURCE / "base", SOURCE / "hair"
    for folder in (base_dir, hair_dir):
        folder.mkdir(parents=True, exist_ok=True)
    base = rgba(PILOT / "imagegen" / "base.png")
    aligned_base = align_canvas(base)
    save_layer(aligned_base, base_dir / "base.png", skin_mask(base))

    for stem, source_names in {
        "short": {"front": "hair_short_front", "front_hat": "hair_under_cap_short"},
        "ponytail": {"front": "hair_long_front", "front_hat": "hair_under_cap_long",
                     "back": "hair_long_back", "back_hat": "hair_long_back"},
    }.items():
        for part, source_name in source_names.items():
            save_layer(rgba(PILOT / f"{source_name}.png"), hair_dir / f"{stem}_{part}.png")

    threshold = cap_profile(rgba(PILOT / "hat_cap.png"))
    for stem in NEW_HAIR:
        edit = raw("headscarf_v2" if stem == "headscarf" else stem)
        transform = face_transform(base, edit)
        print(f"{stem}: {tuple(round(value, 3) for value in transform)}")
        hair = align_canvas(isolate_hair(edit).transform(
            base.size, Image.Transform.AFFINE, transform, Image.Resampling.BICUBIC))
        if stem == "headscarf":
            hair = fit_scarf(hair, aligned_base)
        hatted = under_cap(hair, threshold, taper_end=408 if stem == "headscarf" else 520)
        save_layer(hair, hair_dir / f"{stem}_front.png")
        save_layer(hatted, hair_dir / f"{stem}_front_hat.png")


if __name__ == "__main__":
    main()
