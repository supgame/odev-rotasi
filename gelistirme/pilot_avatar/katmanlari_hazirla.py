#!/usr/bin/env python3
"""Register, extract and recolor the original ImageGen pixels."""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SOURCE = Path(__file__).resolve().parent / "kaynak"
RAW = SOURCE / "imagegen"
CANVAS = (1024, 1024)
LANCZOS = Image.Resampling.LANCZOS


def clean(image):
    pixels = np.array(image.convert("RGBA"))
    pixels[pixels[:, :, 3] < 6] = 0
    pixels[:, :, 3][pixels[:, :, 3] > 250] = 255
    return Image.fromarray(pixels)


def source(name):
    return clean(Image.open(RAW / f"{name}.png"))


def put(image, box):
    x, y, width, height = box
    result = Image.new("RGBA", CANVAS)
    result.paste(image.resize((width, height), LANCZOS), (x, y))
    return clean(result)


def avatar_coordinates(image):
    # Fixed mapping for base and face edits. The neck and chest occupy the
    # second interval, with no margin added at the original crop edge.
    result = Image.new("RGBA", CANVAS)
    for top, bottom, target_y, height in [(0, 844, 35, 579), (844, 1254, 614, 410)]:
        strip = image.crop((0, top, 1254, bottom)).resize((991, height), LANCZOS)
        result.paste(strip, (17, target_y))
    return clean(result)


def skin_tones(base):
    pixels = np.array(base)
    colors = pixels[..., :3].astype(np.float32)
    red, green, blue = np.moveaxis(colors, -1, 0)
    y, x = np.ogrid[:base.height, :base.width]
    # Warm skin pixels, with iris centers protected by their source landmarks.
    weight = np.clip((red - blue - 26) / 43, 0, 1)
    weight *= np.clip((green - blue - 8) / 29, 0, 1)
    for iris_x in (513, 741):
        radius = ((x - iris_x) / 57) ** 2 + ((y - 582) / 58) ** 2
        weight *= np.clip((radius - .92) / .2, 0, 1)
    light = np.stack((.80 * red + .19 * green, .77 * green + .20 * red,
                      .72 * blue + .32 * green + 10), axis=-1)
    dark = light * np.array([.73, .62, .56], dtype=np.float32)
    for index, tone in enumerate((light, dark), 1):
        tinted = pixels.copy()
        tinted[..., :3] = np.clip(colors + weight[..., None] * (tone - colors), 0, 255)
        avatar_coordinates(Image.fromarray(tinted)).save(SOURCE / f"base_skin{index}.png")


def eye_registration(base, edit):
    """Find the integer offset of the edit at the eye and mouth contours."""
    base_luma = np.asarray(base.getchannel("G"), dtype=np.int16)
    edit_luma = np.asarray(edit.getchannel("G"), dtype=np.int16)
    landmarks = [(420, 540, 563, 639), (686, 540, 828, 639), (552, 708, 700, 745)]
    offsets = ((dx, dy) for dx in range(-4, 5) for dy in range(-4, 5))

    def difference(offset):
        dx, dy = offset
        return sum(np.mean(np.abs(
            base_luma[y0:y1, x0:x1] - edit_luma[y0+dy:y1+dy, x0+dx:x1+dx]
        )) for x0, y0, x1, y1 in landmarks)

    dx, dy = min(offsets, key=difference)
    return edit.transform(base.size, Image.Transform.AFFINE, (1, 0, dx, 0, 1, dy))


def connected(mask, seed):
    """Keep the connected extraction around the edited object's interior."""
    if mask.getpixel(seed) != 255:
        raise ValueError(f"Extraction seed {seed} is outside the selected object")
    ImageDraw.floodfill(mask, seed, 128)
    return np.asarray(mask) == 128


def front_hair(base, edit):
    baseline = np.asarray(base, dtype=np.int16)
    pixels = np.array(edit)
    green_delta = baseline[..., 1] - pixels[..., 1]
    y, x = np.ogrid[:edit.height, :edit.width]
    scalp = ((y < 632) & (x > 340) & (x < 907)
             & ((y < 518) | (x < 417) | (x > 835)))
    hair = scalp & (pixels[..., 3] > 25) & ((baseline[..., 3] < 96) | (green_delta > 32))
    candidate = Image.fromarray(hair.astype(np.uint8) * 255)
    candidate = candidate.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
    mask = connected(candidate, (624, 315))
    # Fill enclosed pixels in textured highlights and on the edge of a brow.
    holes = Image.fromarray(mask.astype(np.uint8) * 255).copy()
    ImageDraw.floodfill(holes, (0, 0), 128)
    matte = Image.fromarray((np.asarray(holes) != 128).astype(np.uint8) * 255)
    coverage = np.asarray(matte.filter(ImageFilter.GaussianBlur(.65))) / 255

    # Remove the original light forehead baked into the contact pixels at
    # fringe tips. Those pixels must also composite cleanly on the dark skin.
    boundary = np.asarray(matte.filter(ImageFilter.MinFilter(9))) == 0
    over_skin = (baseline[..., 3] > 200) & (baseline[..., 0] > 140)
    displaced_skin = (pixels[..., 0] > 215) & (pixels[..., 1] > 115)
    mixed = over_skin & (pixels[..., 0] > 149) & (boundary | displaced_skin) & (coverage > 0)
    edge_alpha = np.clip((green_delta[mixed] - 22) / 95, 0, 1)
    background = baseline[mixed, :3]
    edited = pixels[mixed, :3]
    unmatted = background + (edited - background) / np.maximum(edge_alpha[:, None], .05)
    pixels[mixed, :3] = np.clip(unmatted, 0, 255)
    coverage[mixed] = np.minimum(coverage[mixed], edge_alpha)
    pixels[..., 3] = np.rint(coverage * pixels[..., 3]).astype(np.uint8)
    return avatar_coordinates(Image.fromarray(pixels))


def back_hair(edit):
    pixels = np.array(edit)
    y, x = np.ogrid[:edit.height, :edit.width]
    rgb = pixels[..., :3].astype(np.int16)
    red, green, blue = np.moveaxis(rgb, -1, 0)
    # The ponytail is behind the unchanged portrait. The brown selection
    # keeps the purple T-shirt and the ear out of the isolated layer.
    tail_region = (x > 756) & (x < 950) & (y > 708) & (y < 974)
    is_brown = (red - blue > 18) & (red - green > 11) & (green < 126)
    mask = Image.fromarray(((pixels[..., 3] > 20) & tail_region & is_brown).astype(np.uint8) * 255)
    mask = mask.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    mask = connected(mask, (860, 842))
    pixels[..., 3] = np.where(mask, pixels[..., 3], 0)
    return avatar_coordinates(Image.fromarray(pixels))


def hair_under_cap(hair, cap):
    pixels = np.array(hair)
    cap_alpha = np.asarray(cap.getchannel("A"))
    y = np.arange(CANVAS[1])[:, None]
    lower_edge = np.max(np.where(cap_alpha > 192, y, 0), axis=0)
    lower_edge = np.where(lower_edge > 0, lower_edge, 365)
    threshold = np.maximum(lower_edge - 12, 300)
    coverage = np.clip((y - threshold) / 6, 0, 1)
    pixels[..., 3] = np.rint(coverage * pixels[..., 3]).astype(np.uint8)
    return clean(Image.fromarray(pixels))


def main():
    base = source("base")
    skin_tones(base)
    cap_source = source("hat")
    cap = put(cap_source.crop(cap_source.getbbox()), (285, 95, 454, 276))
    cap.save(SOURCE / "hat_cap.png")

    glasses_source = source("glasses")
    put(glasses_source.crop(glasses_source.getbbox()), (313, 361, 398, 152)).save(SOURCE / "glasses_round.png")

    hoodie_source = source("hoodie")
    hoodie = put(hoodie_source.crop(hoodie_source.getbbox()), (167, 620, 690, 404))
    hoodie.save(SOURCE / "top_hoodie.png")
    hoodie.getchannel("A").save(SOURCE / "top_hoodie_mask.png")

    for style in ("short", "long"):
        edit = eye_registration(base, source(style))
        front = front_hair(base, edit)
        front.save(SOURCE / f"hair_{style}_front.png")
        hair_under_cap(front, cap).save(SOURCE / f"hair_under_cap_{style}.png")
        if style == "long":
            back_hair(edit).save(SOURCE / "hair_long_back.png")

    clean(Image.open(SOURCE / "pet_fox_imagegen.png")).resize((512, 512), LANCZOS).save(SOURCE / "pet_fox.png")


if __name__ == "__main__":
    main()
