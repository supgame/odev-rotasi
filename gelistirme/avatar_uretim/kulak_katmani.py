"""Faz 8: ImageGen yüzlerini kulaksız taban ve bağımsız kulaklara ayırır.

Yeni çizim üretmez. Pilot konturunun dar şeridi yeniden örneklenerek Faz 7'de
kulak ile yanak arasındaki düzensiz birleştirme temizlenir; yüzün içi ve y>=280
çene pikselleri kendi ImageGen kaynağından aynen korunur. İkinci bir yüz/çene
şekillendirme uygulanmaz. Tek başına çalıştırmak yalnız base/ears ve ilgili
manifest alanlarını günceller.
"""
from pathlib import Path
import json
import shutil
import numpy as np
from PIL import Image
from scipy.interpolate import PchipInterpolator

ROOT = Path(__file__).resolve().parents[2]
AV = ROOT / 'public/av'
SOURCE = Path(__file__).resolve().parent / 'kaynak'
MASTER = SOURCE / 'faz8_yuz_kulak'
SHAPES = ('oval', 'round', 'long', 'square', 'heart', 'wide')
SIZES = {'small': 8., 'medium': 13., 'big': 19.}
ROWS = np.arange(512)
XX = np.arange(512)[None, :]


def source(shape):
    stem = SOURCE / ('base_orijinal/base' if shape == 'oval' else f'shape/shape_{shape}')
    return (np.array(Image.open(str(stem) + '.webp').convert('RGBA'), dtype=float),
            np.array(Image.open(str(stem) + '_mask.webp').convert('L'), dtype=float))


def curves(a):
    """Kontur, özgün şakak çizgisinden kulaksız alt yanağa yumuşak geçer."""
    result = []
    for side in (0, 1):
        values = [149., 154.5, 159.5, 165., 168.]
        for row in (270, 280):
            visible = np.flatnonzero(a[row, :, 3] > 80)
            values.append(float(visible.min() if side == 0 else 511 - visible.max()))
        c = PchipInterpolator((195, 205, 215, 230, 240, 270, 280), values)(np.clip(ROWS, 195, 280))
        result.append(c if side == 0 else 511 - c)
    return result


def original_curves():
    # Pilotun kulak önündeki özgün koyu çizgisi: elle yeni bir çizgi çizilmez.
    ys = (195, 205, 215, 225, 235, 245, 255, 265, 275, 280)
    left = (149., 154.5, 159.5, 163.8, 166.6, 168.9, 171., 174., 179.5, 183.)
    right = (362., 357., 352., 348., 345., 342.5, 340., 337., 332., 328.5)
    return [PchipInterpolator(ys, v)(np.clip(ROWS, 195, 280)) for v in (left, right)]


def resample(a, x):
    """RGBA dahil premultiplied kanallarda yatay yeniden örnekleme."""
    out = np.zeros_like(a)
    for y in range(195, 281):
        for c in range(a.shape[2]):
            out[y, :, c] = np.interp(x[y], np.arange(512), a[y, :, c], left=0, right=0)
    return out


def save_rgba(a, stem):
    im = Image.fromarray(np.clip(a, 0, 255).round().astype('uint8'), 'RGBA')
    im.save(MASTER / f'{stem}.png')
    # Lossless keeps all unedited jaw/cheek pixels identical to their source.
    im.save(AV / f'{stem}.webp', 'WEBP', lossless=True, method=6)


def save_mask(a, stem):
    im = Image.fromarray(np.clip(a, 0, 255).round().astype('uint8'), 'L')
    im.save(MASTER / f'{stem}_mask.png')
    im.convert('RGB').save(AV / f'{stem}_mask.webp', 'WEBP', lossless=True, method=6)


def generate():
    for where in (AV / 'ears', MASTER / 'ears', MASTER / 'base'):
        where.mkdir(parents=True, exist_ok=True)
    original, original_mask = source('oval')
    old = original_curves()
    band = ((ROWS >= 195) & (ROWS < 280))[:, None]
    ear_band = ((ROWS >= 207) & (ROWS <= 265))[:, None]
    # Ear pixels come from the original ImageGen pilot, with 2px root overlap.
    ear_select = np.maximum(np.clip(old[0][:, None] + 2 - XX, 0, 1),
                            np.clip(XX - old[1][:, None] + 2, 0, 1)) * ear_band
    ear_source = original.copy()
    ear_source[:, :, 3] *= ear_select
    ear_source[:, :, :3] *= ear_source[:, :, 3:4] / 255
    for shape in SHAPES:
        a, mask = source(shape)
        target = curves(a)
        # Preserve the source's anatomy; replace only a narrow ear-side edge
        # with the same registered pilot outline used above the cheek.
        for side in (0, 1):
            inward = XX - target[side][:, None] if side == 0 else target[side][:, None] - XX
            amount = np.clip((9 - inward) / 4, 0, 1) * band
            amount *= np.clip((280 - ROWS[:, None]) / 10, 0, 1)
            sx = np.broadcast_to(XX + old[side][:, None] - target[side][:, None], (512, 512))
            sampled = resample(original, sx)
            sampled_mask = resample(original_mask[:, :, None], sx)[:, :, 0]
            a = a * (1 - amount[:, :, None]) + sampled * amount[:, :, None]
            mask = mask * (1 - amount) + sampled_mask * amount
        keep = np.minimum(np.clip(XX - target[0][:, None] + 1.5, 0, 1),
                          np.clip(target[1][:, None] - XX + 1.5, 0, 1))
        keep = np.where(band, keep, 1)
        a[:, :, 3] *= keep
        mask *= a[:, :, 3] / 255
        save_rgba(a, f'base/base_{shape}')
        save_mask(mask, f'base/base_{shape}')
        # Legacy asset paths remain valid; all three now share one earless face.
        for size in SIZES:
            for suffix in ('', '_mask'):
                shutil.copy2(AV / f'base/base_{shape}{suffix}.webp', AV / f'base/base_{shape}_{size}{suffix}.webp')
        for size, width in SIZES.items():
            ears = np.zeros_like(ear_source)
            ear_mask = np.zeros_like(mask)
            for side in (0, 1):
                half = XX < 256 if side == 0 else XX >= 256
                src = ear_source * half[:, :, None]
                extent = max(abs(XX - old[side][:, None])[((src[:, :, 3] > 40) & (XX < old[side][:, None] if side == 0 else XX > old[side][:, None]))])
                scale = width / extent
                sx = np.broadcast_to(old[side][:, None] + (XX - target[side][:, None]) / scale, (512, 512))
                resized = resample(src, sx)
                # Root overlaps the face by up to 2px; render ears before face.
                ears += resized
                ear_mask += resample((original_mask * ear_select * half)[:, :, None], sx)[:, :, 0]
            al = ears[:, :, 3:4] / 255
            ears[:, :, :3] /= np.maximum(al, 1e-6)
            save_rgba(ears, f'ears/{size}_{shape}')
            save_mask(ear_mask * ears[:, :, 3] / 255, f'ears/{size}_{shape}')
        print(shape, 'earless face + 3 standalone ears')
    for suffix in ('', '_mask'):
        shutil.copy2(AV / f'base/base_oval{suffix}.webp', AV / f'base/base{suffix}.webp')
    path = AV / 'manifest.json'
    man = json.loads(path.read_text())
    man['variants']['base'] = 'base/base_{shape}.webp'
    man['variants']['mask'] = 'base/base_{shape}_mask.webp'
    man['variants']['ears'] = {
        'layer': 'ears/{ears}_{shape}.webp',
        'mask': 'ears/{ears}_{shape}_mask.webp',
        'ref': man['base']['skinRef'],
    }
    path.write_text(json.dumps(man, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    generate()
