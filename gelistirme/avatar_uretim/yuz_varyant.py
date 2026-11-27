"""Yüz çeşitlerini üretir: 6 yüz şekli x 3 kulak boyu, ayrıca iris, yanak ve göz kırpma katmanı.

Taban kaynak/base_orijinal/, diğer yüz şekilleri kaynak/shape/ altındaki ImageGen çizimleridir.
Saç/şapka katmanları alın ve tepe bölgesine hizalı olduğu için yalnız yanak-çene (y>=246) ve kulaklar oynatılır;
ağız çevresi (merkezden 44 px) sabit kalır ki ifade katmanları kaymasın.
Çalıştır: gelistirme/.venv/bin/python -B gelistirme/avatar_uretim/yuz_varyant.py
"""
from pathlib import Path
import json
import shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

KOK = Path(__file__).resolve().parents[2]
AV = KOK / 'public/av'
YEDEK = Path(__file__).resolve().parent / 'kaynak/base_orijinal'
KAYNAK_SEKIL = Path(__file__).resolve().parent / 'kaynak/shape'  # Faz 6 ImageGen yüzleri (Codex)
CX = 256.0

# ---- kulak: başın kenarından dışarı taşan kısım F oranına iner ----
SOL, SAG, KY0, KY1 = 158.0, 352.0, 200, 268
KULAK = {'small': 0.42, 'medium': 0.68, 'big': 1.0}

# ---- yüz şekli: satır başına yatay ölçek (merkezden SABIT px'e kadar dokunulmaz) ----
SABIT = 44.0


def tumsek(y, y0, y1, p=1.0):
    t = np.clip((y - y0) / (y1 - y0), 0, 1)
    return np.sin(np.pi * t) ** p


def olcek(sekil: str, y: float) -> float:
    if sekil == 'round':
        return 1 + 0.32 * tumsek(y, 252, 304, 0.9)
    if sekil == 'long':
        return 1 - 0.22 * tumsek(y, 245, 302, 0.95)
    if sekil == 'square':
        return 1 + 0.54 * tumsek(y, 263, 306, 0.7)
    if sekil == 'heart':
        return 1 - 0.33 * tumsek(y, 258, 304, 1.0)
    if sekil == 'wide':
        return 1 + 0.35 * tumsek(y, 246, 291, 0.95)
    return 1.0


def satir_warp(a, src_of_x):
    """src_of_x(y) -> kaynak x dizisi ya da None. a: premultiplied float."""
    out = a.copy()
    xs = np.arange(a.shape[1], dtype=np.float64)
    for y in range(a.shape[0]):
        src = src_of_x(y, xs)
        if src is None:
            continue
        for c in range(a.shape[2]):
            out[y, :, c] = np.interp(src, xs, a[y, :, c], left=0, right=0)
    return out


def kulak_src(F, SOL=SOL, SAG=SAG):
    def f(y, xs):
        if abs(F - 1) < 0.02 or y < KY0 or y > KY1:
            return None
        k = float(tumsek(y, KY0, KY1, 0.6))
        s = 1 - (1 - F) * k
        src = xs.copy()
        L, R = xs < SOL, xs > SAG
        src[L] = SOL - (SOL - xs[L]) / s
        src[R] = SAG + (xs[R] - SAG) / s
        return src
    return f


def sekil_src(sekil):
    def f(y, xs):
        s = olcek(sekil, y)
        if abs(s - 1) < 1e-4:
            return None
        d = xs - CX
        ad = np.abs(d)
        src = xs.copy()
        dis = ad > SABIT
        src[dis] = CX + np.sign(d[dis]) * (SABIT + (ad[dis] - SABIT) / s)
        return src
    return f


def premul(im):
    a = np.array(im.convert('RGBA')).astype(np.float64)
    al = a[..., 3:4] / 255
    return np.concatenate([a[..., :3] * al, a[..., 3:4]], axis=2)


def unpremul(p):
    al = p[..., 3:4] / 255
    rgb = np.where(al > 0, p[..., :3] / np.maximum(al, 1e-6), 0)
    return Image.fromarray(np.clip(np.concatenate([rgb, p[..., 3:4]], axis=2), 0, 255).round().astype(np.uint8), 'RGBA')


def main():
    YEDEK.mkdir(parents=True, exist_ok=True)
    for ad in ('base.webp', 'base_mask.webp'):
        if not (YEDEK / ad).exists():
            shutil.copy2(AV / 'base' / ad, YEDEK / ad)
    taban = premul(Image.open(YEDEK / 'base.webp'))
    maske_im = Image.open(YEDEK / 'base_mask.webp')
    maske = np.array(maske_im.convert('L')).astype(np.float64)[..., None]

    # Yüz şekilleri: oval = orijinal taban, diğerleri Faz 6 ImageGen çizimleri (public/av/base/shape_<id>.webp).
    # Kulak boyu: başın kenarından taşan kısım hedef piksel kadar olacak şekilde kulak bükülür (sıkıştırma ya da genişletme).
    HEDEF = {'small': 8.0, 'medium': 13.0, 'big': 19.0}
    for sekil in ('oval', 'round', 'long', 'square', 'heart', 'wide'):
        if sekil == 'oval':
            t0, m0 = taban, maske
        else:
            t0 = premul(Image.open(KAYNAK_SEKIL / f'shape_{sekil}.webp'))
            m0 = np.array(Image.open(KAYNAK_SEKIL / f'shape_{sekil}_mask.webp').convert('L')).astype(np.float64)[..., None]
        alfa = t0[..., 3]
        def kenar(y):
            r = np.where(alfa[y] > 40)[0]
            return r.min(), r.max()
        ust, alt = kenar(KY0 - 2), kenar(KY1 - 2)
        sol, sag = (ust[0] + alt[0]) / 2, (ust[1] + alt[1]) / 2
        ek = [kenar(y) for y in range(KY0 + 8, KY1 - 10)]
        cikis = max(1.0, ((sol - min(e[0] for e in ek)) + (max(e[1] for e in ek) - sag)) / 2)
        for kulak, hedef in HEDEF.items():
            F = hedef / cikis
            kulak_warp = kulak_src(F, sol, sag)
            yuz_warp = sekil_src(sekil)
            t2 = satir_warp(satir_warp(t0, kulak_warp), yuz_warp)
            m2 = satir_warp(satir_warp(m0, kulak_warp), yuz_warp)
            ad = f'base_{sekil}_{kulak}'
            unpremul(t2).save(AV / 'base' / f'{ad}.webp', 'WEBP', quality=92, method=6)
            Image.fromarray(np.clip(m2[..., 0], 0, 255).round().astype(np.uint8), 'L').convert('RGB').save(AV / 'base' / f'{ad}_mask.webp', 'WEBP', lossless=True)
            if (sekil, kulak) == ('oval', 'small'):  # eski yol da yeni varsayılanı göstersin
                shutil.copy2(AV / 'base' / f'{ad}.webp', AV / 'base' / 'base.webp')
                shutil.copy2(AV / 'base' / f'{ad}_mask.webp', AV / 'base' / 'base_mask.webp')
        print(sekil, 'kenar', sol, sag, 'kulak çıkışı', round(cikis, 1))

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
        'base': 'base/base_{shape}_{ears}.webp', 'mask': 'base/base_{shape}_{ears}_mask.webp',
        'iris': {'layer': 'base/iris.webp', 'mask': 'base/iris_mask.webp', 'ref': round(iris_ref, 4)},
        'cheek': {k: f'base/cheek_{k}.webp' for k in ('blush', 'freckles', 'both')},
        'blink': {'layer': 'face/blink.webp', 'mask': 'face/blink_mask.webp', 'ref': next(i['ref'] for i in man['slots']['face']['items'] if i['id'] == 'face_happy_closed')},
    }
    (AV / 'manifest.json').write_text(json.dumps(man, ensure_ascii=False, indent=2) + '\n')
    print('tamam, iris ref', round(iris_ref, 2))


if __name__ == '__main__':
    main()
