"""Elimde çizimlerinin tutuş, eşya ve hareket katmanlarını hazırlar."""
import json

import numpy as np
from PIL import Image, ImageDraw, ImageOps

from faz8_temas import AV, SOURCE, LUMINANCE, cutout, materials

FOLDER = AV / 'held'
CELLS = {
    'football': ((0, 0, 512, 512), (.195, .575, .40)),
    'book': ((512, 0, 1024, 512), (.165, .57, .44)),
    'kite': ((0, 512, 512, 1024), (.275, .23, .62)),
    'toycar': ((512, 512, 1024, 1024), (.24, .59, .41)),
    'flower': ((0, 1024, 512, 1536), (.22, .57, .43)),
}


def normalized(image):
    fitted = ImageOps.contain(image, (512, 512), Image.Resampling.LANCZOS)
    out = Image.new(image.mode, (512, 512))
    out.paste(fitted, ((512 - fitted.width) // 2, 512 - fitted.height))
    return out


def save(image, name, *, align=True):
    if align:
        image = normalized(image)
    image.save(FOLDER / f'{name}.webp', lossless=True, method=6)
    return f'held/{name}.webp'


def piece(pixels, select, gray=None):
    rgba = pixels.copy()
    rgba[:, :, 3] *= select
    if gray is not None:
        rgba[:, :, :3] = gray[:, :, None]
    return Image.fromarray(rgba)


def publish(name, atlas, bounds, position):
    image = cutout(atlas.crop(bounds))
    pixels, label, skin, cloth = materials(image)
    gray = np.rint(pixels[:, :, :3] @ LUMINANCE).astype(np.uint8)
    art = dict(zip(('x', 'y', 'size'), position))
    art.update(
        skinRef=float(np.median(gray[skin])),
        sleeveRef=float(np.median(gray[cloth])),
        hand=save(piece(pixels, label == 2, gray), f'{name}-hand'),
        sleeve=save(piece(pixels, label == 3, gray), f'{name}-sleeve'),
    )
    content = label == 1
    if name == 'kite':
        # Keep the reel in the grip. The string rotates with the kite around the reel's opening.
        y, x = np.mgrid[:image.height, :image.width]
        flying = (y < 281) | ((x > 230) & (y < 330))
        art['fixed'] = save(piece(pixels, content & ~flying), f'{name}-reel')
        content &= flying
    if name == 'book':
        # The right leaf is an overlay over the already painted spread.
        leaf = Image.new('L', image.size)
        outline = [(.51,.16),(.62,.072),(.75,.022),(.907,.014),(.892,.34),(.868,.544),(.754,.53),(.626,.56),(.51,.65)]
        ImageDraw.Draw(leaf).polygon([(round(x*image.width),round(y*image.height)) for x,y in outline], fill=255)
        art['page'] = save(piece(pixels, content & (np.asarray(leaf) > 0)), f'{name}-page')
    art['item'] = save(piece(pixels, content), f'{name}-item')
    return art


def main():
    FOLDER.mkdir(parents=True, exist_ok=True)
    atlas = Image.open(SOURCE / 'elde_esya.png')
    art = {name: publish(name, atlas, bounds, position) for name, (bounds, position) in CELLS.items()}
    ball = cutout(atlas.crop((512, 1024, 1024, 1259)))
    art['football']['motion'] = save(ball, 'football-motion')
    (FOLDER / 'art.json').write_text(json.dumps(art, indent=2) + '\n')


if __name__ == '__main__':
    main()
