"""ImageGen tabanları, ayrı kulaklar, iris, yanak ve göz kırpma katmanları.

Yüz anatomisi kaynak/shape/ altındaki son ImageGen çiziminden korunur.
Kulakların ayıklanması kulak_katmani.py içindedir. Yüz şekline ikinci bir
prosedürel çene/yanak bükmesi uygulanmaz.
Çalıştır: gelistirme/.venv/bin/python -B gelistirme/avatar_uretim/yuz_varyant.py
Yalnız yüz/kulak: gelistirme/.venv/bin/python -B gelistirme/avatar_uretim/kulak_katmani.py
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from kulak_katmani import generate

KOK = Path(__file__).resolve().parents[2]
AV = KOK / 'public/av'
YEDEK = Path(__file__).resolve().parent / 'kaynak/base_orijinal'


def main():
    generate()

    # ---- iris: göz bebeği çevresindeki doygun kahve pikseller, boyanabilir ----
    o = np.array(Image.open(YEDEK / 'base.webp').convert('RGBA')).astype(np.float64)
    r, g, b = o[..., 0], o[..., 1], o[..., 2]
    mx, mn = o[..., :3].max(2), o[..., :3].min(2)
    sat = (mx - mn) / np.maximum(mx, 1)
    yy, xx = np.mgrid[0:512, 0:512]
    m = np.zeros((512, 512))
    for cx, cy in ((216, 221), (297, 221)):
        d = np.hypot(xx - cx, yy - cy)
        m = np.maximum(m, np.clip((19.5 - d) / 2.5, 0, 1))
    m *= np.clip((sat - 0.18) / 0.15, 0, 1) * (r > g)
    iris = o.copy()
    iris[..., 3] = 255 * m
    Image.fromarray(iris.round().astype(np.uint8), 'RGBA').save(AV / 'base' / 'iris.webp', 'WEBP', lossless=True)
    Image.fromarray((m * 255).round().astype(np.uint8), 'L').convert('RGB').save(AV / 'base' / 'iris_mask.webp', 'WEBP', lossless=True)
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    iris_ref = float((lum * m).sum() / m.sum())

    # ---- yanaklar ----
    def katman(ciz):
        im = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
        ciz(ImageDraw.Draw(im), im)
        return im
    YANAK = ((194, 256), (318, 256))

    def allik(d, im):
        for cx, cy in YANAK:
            d.ellipse([(cx - 17) * 2, (cy - 9) * 2, (cx + 17) * 2, (cy + 9) * 2], fill=(255, 110, 130, 95))

    def cil(d, im):
        rng = np.random.default_rng(7)
        for cx, cy in YANAK:
            for _ in range(9):
                x, y = cx + rng.uniform(-14, 14), cy - 4 + rng.uniform(-6, 6)
                rr = rng.uniform(1.1, 1.8) * 2
                d.ellipse([x * 2 - rr, y * 2 - rr, x * 2 + rr, y * 2 + rr], fill=(125, 65, 35, 115))

    for ad, fns, blur in (('blush', [allik], 9), ('freckles', [cil], 0.8), ('both', [allik, cil], None)):
        if blur is None:
            a1 = Image.open(AV / 'base' / 'cheek_blush.webp')
            a2 = Image.open(AV / 'base' / 'cheek_freckles.webp')
            im = a1.copy(); im.alpha_composite(a2)
        else:
            im = katman(lambda d, i: [f(d, i) for f in fns]).filter(ImageFilter.GaussianBlur(blur)).resize((512, 512), Image.LANCZOS)
        im.save(AV / 'base' / f'cheek_{ad}.webp', 'WEBP', lossless=True)

    # ---- göz kırpma: mutlu kapalı göz ifadesinin yalnız göz kısmı ----
    for s, d in (('happy_closed.webp', 'blink.webp'), ('happy_closed_mask.webp', 'blink_mask.webp')):
        im = Image.open(AV / 'face' / s)
        a = np.array(im); a[252:] = 0; a[:189] = 0  # yalnız göz kapakları: kaşlar oynamasın
        Image.fromarray(a, im.mode).save(AV / 'face' / d, 'WEBP', lossless=True)

    man = json.loads((AV / 'manifest.json').read_text())
    man['variants'] = {**man.get('variants', {}),
        'base': 'base/base_{shape}.webp', 'mask': 'base/base_{shape}_mask.webp',
        'iris': {'layer': 'base/iris.webp', 'mask': 'base/iris_mask.webp', 'ref': round(iris_ref, 4)},
        'cheek': {k: f'base/cheek_{k}.webp' for k in ('blush', 'freckles', 'both')},
        'blink': {'layer': 'face/blink.webp', 'mask': 'face/blink_mask.webp', 'ref': next(i['ref'] for i in man['slots']['face']['items'] if i['id'] == 'face_happy_closed')},
    }
    (AV / 'manifest.json').write_text(json.dumps(man, ensure_ascii=False, indent=2) + '\n')
    print('tamam, iris ref', round(iris_ref, 2))


if __name__ == '__main__':
    main()
