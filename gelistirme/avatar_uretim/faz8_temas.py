"""ImageGen temas çizimlerinden hizalı hayvan, el ve manşet katmanları üretir."""
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

HERE = Path(__file__).resolve().parent
AV = HERE.parents[1] / 'public/av'
SOURCE = HERE / 'kaynak/imagegen/faz8'
LUMINANCE = (0.2126, 0.7152, 0.0722)


def cutout(image):
    """Temas siluetini koru, renkli dış kenar artıklarını temizle."""
    pixels = np.asarray(image.convert('RGBA')).copy()
    alpha = pixels[:, :, 3]
    labels, count = ndimage.label(alpha > 92)
    areas = np.bincount(labels.ravel(), minlength=count + 1)
    areas[0] = 0
    keep = ndimage.binary_dilation(labels == areas.argmax(), iterations=2)
    alpha[:] = np.where(keep & (alpha >= 16), alpha, 0)
    cut = Image.fromarray(pixels)
    return cut.crop(cut.getbbox())


def materials(image):
    """Camgöbeği teni ve eflatun kumaşı, çevre çizgileriyle ayır."""
    pixels = np.asarray(image).copy()
    r, g, b = pixels[:, :, :3].astype(float).transpose(2, 0, 1)
    opaque = pixels[:, :, 3] > 86
    skin = (g - r > 19) & (b - r > 10) & (g > 58) & opaque
    cloth = (r - g > 37) & (b - g > 9) & (r > 68) & (b > r * .45) & opaque
    skin = ndimage.binary_opening(skin, iterations=2)
    cloth = ndimage.binary_fill_holes(ndimage.binary_closing(cloth, iterations=3))
    # Saturation varies in the fabric fold and along the ink at the sleeve edge.
    # Limit the looser color test to the seam surrounding verified fabric.
    cloth |= ndimage.binary_dilation(cloth, iterations=8) & (r > g * 1.22) & (b > g * .96) & opaque
    cloth = ndimage.binary_opening(cloth, iterations=2)
    pet = opaque & ~ndimage.binary_dilation(skin | cloth, iterations=3)
    seed = np.zeros(opaque.shape, np.uint8)
    seed[pet] = 1
    seed[skin] = 2
    seed[cloth] = 3
    near = ndimage.distance_transform_edt(seed == 0, return_distances=False, return_indices=True)
    label = seed[tuple(near)]
    return pixels, label, skin, cloth


def publish(image, key, placement):
    image = cutout(image)
    ratio = 512 / max(image.size)
    w, h = (round(side * ratio) for side in image.size)
    pixels, label, skin, cloth = materials(image)
    gray = np.rint(pixels[:, :, :3] @ LUMINANCE).astype(np.uint8)
    entry = dict(zip(('x', 'y', 'size'), placement))
    entry['skinRef'] = float(np.median(gray[skin]))
    entry['sleeveRef'] = float(np.median(gray[cloth]))
    for part, value in [('pet', 1), ('hand', 2), ('sleeve', 3)]:
        mask = label == value
        rgba = pixels.copy()
        rgba[:, :, 3] *= mask
        if part != 'pet':
            rgba[:, :, :3] = gray[:, :, None]
        # All siblings share one coordinate space and meet along the same ink.
        tile = Image.fromarray(rgba).resize((w, h), Image.Resampling.LANCZOS)
        layer = Image.new('RGBA', (512, 512))
        layer.paste(tile, ((512 - w) // 2, 512 - h))
        path = f'pose/hero/{key}-{part}.webp'
        layer.save(AV / path, lossless=True, method=6)
        entry[part] = path
    return entry


def main():
    (AV / 'pose/hero').mkdir(parents=True, exist_ok=True)
    side = Image.open(SOURCE / 'arkadas_yanimda.png')
    boundary_x, boundary_y = 644, 606
    specifications = {
        'cat-side': ((0, 0, boundary_x, boundary_y), (.54, .54, .43)),
        'dog-side': ((boundary_x, 0, side.width, boundary_y), (.54, .54, .43)),
        'chick-side': ((0, boundary_y, boundary_x, side.height), (.535, .51, .43)),
        'rabbit-side': ((boundary_x, boundary_y, side.width, side.height), (.54, .54, .43)),
    }
    entries = {key: publish(side.crop(bounds), key, position)
               for key, (bounds, position) in specifications.items()}
    entries['chick-hug'] = publish(Image.open(SOURCE / 'civciv_kucak.png'), 'chick-hug', (.27, .58, .43))
    (AV / 'pose/hero/placement.json').write_text(json.dumps(entries, indent=2) + '\n')


if __name__ == '__main__':
    main()
