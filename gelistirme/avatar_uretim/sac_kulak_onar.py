"""Restore strands interrupted by the original portrait's extracted ears.

Only resamples the existing registered hair masters; no face/base/manifest writes.
The two strand cross-sections above and below the removed ears define a smooth
bridge. Published frontUnderHat layers keep the same lower strands as front.
Run after paketle.py: gelistirme/.venv/bin/python -B .../sac_kulak_onar.py
"""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
AV = ROOT.parents[1] / 'public/av/hair'
SOURCE = ROOT / 'kaynak/hair'
# Full side locks continue past the original ears. Afro ends at ear height and
# intentionally leaves the ear exposed, so it is kept behind the ear layer.
STYLES = ('straight_long', 'bob', 'wavy_long', 'bangs_long', 'braids')


def repair(image, mask):
    rgba = np.array(image).copy()
    dye = np.array(mask).copy()
    original, original_mask = rgba.copy(), dye.copy()
    top, bottom = 201, 272
    for side in (0, 1):
        lo, hi = (80, 215) if side == 0 else (295, 430)
        strips = []
        for row in (top, bottom):
            xs = np.flatnonzero(original[row, lo:hi, 3] > 96) + lo
            strips.append((int(xs.min()), int(xs.max())))
        for y in range(top + 1, bottom):
            t = (y - top) / (bottom - top)
            left, right = np.rint(np.array(strips[0]) * (1-t) + np.array(strips[1]) * t).astype(int)
            for x in range(left, right + 1):
                u = (x-left) / max(1, right-left)
                samples, masks = [], []
                for row, (a, b) in zip((top, bottom), strips):
                    sx = round(a + u * (b-a))
                    samples.append(original[row, sx].astype(float))
                    masks.append(float(original_mask[row, sx]))
                value = np.rint(samples[0]*(1-t) + samples[1]*t).astype(np.uint8)
                # Replace the complete strip: retaining the extraction boundary
                # would leave a dark ear-shaped scar inside the restored lock.
                rgba[y, x] = value
                dye[y, x] = round(masks[0]*(1-t) + masks[1]*t)
    return Image.fromarray(rgba), Image.fromarray(dye)


def main():
    for style in STYLES:
        im = Image.open(SOURCE / f'{style}_front.png').convert('RGBA').resize((512,512), Image.Resampling.LANCZOS)
        mk = Image.open(SOURCE / f'{style}_front_mask.png').convert('L').resize((512,512), Image.Resampling.LANCZOS)
        im, mk = repair(im, mk)
        # Save normal and hatted fronts with identical cheek-height geometry.
        for suffix in ('', '_hat'):
            front = im.copy()
            mask = mk.copy()
            if suffix:
                old = Image.open(SOURCE / f'{style}_front_hat.png').convert('RGBA').resize((512,512), Image.Resampling.LANCZOS)
                oldmask = Image.open(SOURCE / f'{style}_front_hat_mask.png').convert('L').resize((512,512), Image.Resampling.LANCZOS)
                front.paste(old.crop((0,0,512,190)), (0,0))
                mask.paste(oldmask.crop((0,0,512,190)), (0,0))
            front.save(AV / f'{style}_front{suffix}.webp', 'WEBP', lossless=True)
            mask.convert('RGB').save(AV / f'{style}_front{suffix}_mask.webp', 'WEBP', lossless=True)
        print(style, 'ear cutouts repaired; lower hat geometry identical')

if __name__ == '__main__':
    main()
