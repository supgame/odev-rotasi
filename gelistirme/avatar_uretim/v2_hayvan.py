"""Package generated v2 animals as rigid contact body + isolated moving detail.

Only alpha<=2 generator speckles are removed. The real generated chick head and
rabbit nose are used verbatim. Underlap is behind the moving detail, never feet.
Coordinates below are measured in the original generated PNG, before mirroring.
"""
from pathlib import Path
import json

from PIL import Image, ImageChops, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(__file__).resolve().parent / 'kaynak' / 'v2'
OUTPUT = ROOT / 'public' / 'av' / 'pose' / 'v2'
SIZE = 512


def _clean(image):
    image = image.convert('RGBA')
    alpha = image.getchannel('A').point(lambda value: 0 if value <= 2 else value)
    image.putalpha(alpha)
    return image


def _separate(animal):
    image = _clean(Image.open(SOURCE / f'{animal}.png'))
    mask = Image.new('L', image.size)
    draw = ImageDraw.Draw(mask)
    if animal == 'chick':
        # Upper boundary follows the existing head/neck contour, while keeping
        # every body feather, wing and planted toe in the rigid layer.
        draw.polygon([(0, 0), (1254, 0), (1254, 545), (778, 545),
                      (752, 557), (704, 570), (635, 574), (565, 563),
                      (525, 549), (0, 549)], fill=255)
        pivot = (664, 562)
    elif animal == 'rabbit':
        # Nose only; mouth, eyes, ears, paws and body remain stationary.
        draw.polygon([(406, 510), (412, 503), (428, 499), (444, 502),
                      (454, 509), (458, 519), (453, 526), (438, 531),
                      (425, 534), (416, 528), (410, 520)], fill=255)
        pivot = (433, 518)
    else:
        raise ValueError(f'Unknown animal: {animal}')
    alpha = image.getchannel('A')
    mask = ImageChops.multiply(mask, alpha)
    detail = image.copy()
    detail.putalpha(mask)
    fixed = image.copy()
    fixed.putalpha(ImageChops.subtract(alpha, mask))
    underlap = Image.new('RGBA', image.size)
    paint = ImageDraw.Draw(underlap)
    if animal == 'chick':
        # The neck bridge covers the tiny exposed wedge during a 5 degree nod.
        # This patch stays hidden at rest below the original painted head.
        paint.ellipse((553, 519, 771, 622), fill=(239, 181, 67, 255))
        underlap.alpha_composite(fixed)
        fixed = underlap
        image = ImageOps.mirror(image)
        fixed = ImageOps.mirror(fixed)
        detail = ImageOps.mirror(detail)
        pivot = (image.width - pivot[0], pivot[1])
    else:
        # A nearby clean muzzle patch provides an actual painted cream underlap.
        # It removes the old nose so twitching never reveals a duplicate nose.
        patch = image.crop((458, 499, 512, 536))
        underlap.paste(patch, (405, 499))
        underlap.putalpha(ImageChops.multiply(underlap.getchannel('A'), mask))
        underlap.alpha_composite(fixed)
        fixed = underlap
    return image, fixed, detail, pivot


def pack_pet(animal, stem, target_rect):
    """Fit alpha bbox inside left/top/width/height; write full 512 RGBA WebPs.

    Returns manifest-friendly paths plus pixel pivot and the actual fitted bbox.
    Parent draws pet first, detail second, then the child's foreground fingers.
    """
    image, fixed, detail, pivot = _separate(animal)
    box = image.getchannel('A').getbbox()
    left, top, width, height = target_rect
    scale = min(width / (box[2] - box[0]), height / (box[3] - box[1]))
    fitted = (round((box[2] - box[0]) * scale), round((box[3] - box[1]) * scale))
    offset = (round(left + (width - fitted[0]) / 2), round(top + height - fitted[1]))
    OUTPUT.mkdir(parents=True, exist_ok=True)
    paths = {}
    for name, layer in [('pet', fixed), ('detail', detail)]:
        canvas = Image.new('RGBA', (SIZE, SIZE))
        crop = layer.crop(box).resize(fitted, Image.Resampling.LANCZOS)
        canvas.alpha_composite(crop, offset)
        filename = f'{stem}-{name}.webp'
        canvas.save(OUTPUT / filename, lossless=True, method=6)
        paths[name] = f'pose/v2/{filename}'
    return {
        **paths,
        'pivot': [round(offset[0] + (pivot[0] - box[0]) * scale, 3),
                  round(offset[1] + (pivot[1] - box[1]) * scale, 3)],
        'rect': [*offset, *fitted],
        'detailMotion': 'nod' if animal == 'chick' else 'nose',
    }


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('animal', choices=['chick', 'rabbit'])
    parser.add_argument('stem')
    parser.add_argument('rect', nargs=4, type=float)
    args = parser.parse_args()
    print(json.dumps(pack_pet(args.animal, args.stem, args.rect), indent=2))
