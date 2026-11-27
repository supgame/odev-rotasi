#!/usr/bin/env python3
"""Extract individual pet masters from the generated transparent sheets."""

import argparse
import json
import re
import subprocess

import numpy as np
from PIL import Image

from faz4_katalog import species
from paketle import SOURCE


RAW = SOURCE / "imagegen" / "faz4"
SIZE = 512
ARTWORK_SIZE = 460


def silhouettes(path, threshold):
    """Read the opaque foreground components with ImageMagick."""
    info = subprocess.run(
        ["magick", str(path), "-alpha", "extract", "-threshold", f"{threshold / 255:.2%}",
         "-define", "connected-components:area-threshold=100",
         "-define", "connected-components:verbose=true", "-connected-components", "8", "null:"],
        check=True, capture_output=True, text=True,
    ).stdout
    for box in re.finditer(r"(\d+)x(\d+)\+(\d+)\+(\d+)\s+([\d.]+),([\d.]+)\s+(\d+)\s+(?:s?rgb\(255,255,255\)|gray\(255\))", info):
        width, height, x, y = map(int, box.groups()[:4])
        cx, cy = map(float, box.groups()[4:6])
        yield (x, y, x + width, y + height), (cx, cy), int(box[7])


def boxes_by_cell(path, size, threshold):
    width, height = size
    boxes = {}
    for (x0, y0, x1, y1), (cx, cy), area in silhouettes(path, threshold):
        if area < width * height * .004:
            continue
        col, row = int(3 * cx / width), int(3 * cy / height)
        cell = row * 3 + col
        if cell in boxes:
            raise ValueError(f"Multiple large silhouettes in {path.name} cell {cell + 1}")
        boxes[cell] = x0, y0, x1, y1
    return boxes


def master(sprite, box, alpha_floor):
    x0, y0, x1, y1 = box
    padding = 3
    crop = sprite.crop((max(0, x0 - padding), max(0, y0 - padding),
                        min(sprite.width, x1 + padding), min(sprite.height, y1 + padding)))
    alpha = np.asarray(crop.getchannel("A"), dtype=np.float32)
    # Remove low-alpha matte noise while preserving the antialiased silhouette.
    alpha = np.rint(np.clip((alpha - alpha_floor) * 255 / (252 - alpha_floor), 0, 255)).astype(np.uint8)
    crop.putalpha(Image.fromarray(alpha))
    scale = ARTWORK_SIZE / max(crop.size)
    crop = crop.resize(tuple(round(side * scale) for side in crop.size), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (SIZE, SIZE))
    out.alpha_composite(crop, ((SIZE - crop.width) // 2, 486 - crop.height))
    return out


def extract():
    recipe = json.loads((RAW / "kesimler.json").read_text(encoding="utf-8"))
    extracted = {}
    for filename, sheet in recipe.items():
        path = RAW / filename
        with Image.open(path) as sprite:
            if sprite.mode != "RGBA":
                raise ValueError(f"Expected a transparent source: {path}")
            alpha_floor = sheet.get("alpha_floor", 16)
            boxes = boxes_by_cell(path, sprite.size, max(107, alpha_floor))
            cells = {i: stem for i, stem in enumerate(sheet["cells"]) if stem}
            if boxes.keys() != cells.keys():
                raise ValueError(f"Detected cells in {path.name}: {sorted(boxes)}. Expected: {sorted(cells)}.")
            for cell, stem in cells.items():
                if stem in extracted:
                    raise ValueError(f"Duplicate source for {stem}")
                extracted[stem] = master(sprite, boxes[cell], alpha_floor)
    return extracted


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Validate the recipe without writing masters")
    args = parser.parse_args()
    extracted = extract()
    expected = {stem for stem, _, _ in species()}
    actual = set(extracted)
    if actual != expected:
        raise ValueError(f"Missing pets: {sorted(expected - actual)}. Unexpected pets: {sorted(actual - expected)}.")
    if not args.check:
        folder = SOURCE / "pet"
        folder.mkdir(exist_ok=True)
        for stem, layer in extracted.items():
            layer.save(folder / f"{stem}.png")


if __name__ == "__main__":
    main()
