"""Gözleri hareket ettirilebilir yapar: boş göz (göz akı) yaması + ayrı iris + göz açıklığı maskesi.

Tarayıcıda: alt katman (taban + boş göz) -> göz açıklığı maskesiyle kırpılmış, kaydırılabilir iris -> üst katmanlar.
Tüm taban çeşitleri göz bölgesini orijinal tabandan aynen taşıdığı için tek set yeter.
Çalıştır: gelistirme/.venv/bin/python -B gelistirme/avatar_uretim/goz_katmani.py
"""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

KOK = Path(__file__).resolve().parents[2]
AV = KOK / 'public/av/base'
SRC = Path(__file__).resolve().parent / 'kaynak/base_orijinal/base.webp'
R = 18.6   # iris yarıçapı (kapak hattı için)
RL = 21.0  # taşınan iris katmanının yarıçapı: koyu kenar halkası ve biraz göz akı dahil, kayınca dikiş kalmasın

a = np.array(Image.open(SRC).convert('RGBA')).astype(np.float64)
rgb, al = a[..., :3], a[..., 3]
lum = rgb @ [0.2126, 0.7152, 0.0722]
mx, mn = rgb.max(2), rgb.min(2)
sat = (mx - mn) / np.maximum(mx, 1)
yy, xx = np.mgrid[0:512, 0:512]

open_all = np.zeros((512, 512), bool)
iris_a = np.zeros((512, 512))
iris_tint = np.zeros((512, 512))
patch = np.zeros((512, 512, 4))
centers = []
for x0, x1, gx in ((165, 256, 215), (256, 347, 297)):
    box = (yy >= 188) & (yy <= 250) & (xx >= x0) & (xx < x1)
    # iris: turuncu-kahve; kaba tahminin çevresinde ağırlık merkezi
    ir = box & (sat > 0.45) & (rgb[..., 0] > rgb[..., 1] + 25) & (lum > 55) & (lum < 170) & (np.hypot(xx - gx, yy - 220) < 19)
    ys_, xs_ = np.where(ir)
    cy, cx = (ys_.min() + ys_.max()) / 2, (xs_.min() + xs_.max()) / 2  # alt yarı daha parlak, ağırlık merkezi aşağı kayıyor
    centers.append((round(cx, 1), round(cy, 1)))
    d = np.hypot(xx - cx, yy - cy)
    circ = d <= R
    # göz akı: açık krem (ten nötr gri olduğundan kırmızı-mavi farkıyla ayrılır)
    sclera = box & (lum > 175) & (rgb[..., 0] - rgb[..., 2] > 25) & (al > 200)
    iris_lit = ir
    # Göz kapakları: üst kapak, göz akının üst kenarına uydurulan parabol (irisin üstü kirpik gölgesinde kalır);
    # alt kapak, göz akı ve parlak irisin sütun bazında alt sınırı.
    cols = np.where((sclera | iris_lit).any(0))[0]
    sx = np.where(sclera.any(0))[0]
    stop = np.array([np.where(sclera[:, x])[0].min() for x in sx])
    up = np.polyfit(sx, stop, 2)
    low = np.array([np.where((sclera | iris_lit)[:, x])[0].max() for x in cols])
    low = ndi.median_filter(low, 3)
    op = np.zeros((512, 512), bool)
    for x, lo in zip(cols, low):
        t = np.polyval(up, x) + 0.5
        t = max(t, cy - R + 3)  # irisin üstü kirpik gölgesinde: kapak hattı irisin tepesinin biraz altından geçer
        if (x < sx.min() or x > sx.max()) and abs(x - cx) >= R:  # göz akı verisinin dışına taşan parabol kirpiğe girmesin
            continue
        op[int(np.ceil(t)):lo + 1, x] = True
    op &= box
    open_all |= op
    # iris katmanı: çember içindeki orijinal pikseller (göz bebeği, parıltı, kenar dahil)
    iris_a = np.maximum(iris_a, np.clip(RL + 0.5 - d, 0, 1))
    iris_tint = np.maximum(iris_tint, np.clip(R + 0.5 - d, 0, 1) * np.clip((sat - 0.25) / 0.2, 0, 1) * (lum > 45) * (lum < 175))
    # göz akı rengi: ölçülen göz akının medyanı, üstte kirpik gölgesi
    sc = np.median(rgb[sclera], axis=0)
    top = np.array([ys.min() if len(ys := np.where(op[:, x])[0]) else 0 for x in range(512)])
    depth = np.clip((yy - top[None, :]) / 7, 0, 1)
    shade = 0.80 + 0.20 * depth
    col = sc[None, None, :] * shade[..., None]
    patch[op] = np.concatenate([col, np.full((512, 512, 1), 255)], axis=2)[op]

# yumuşak kenarlı açıklık maskesi (CSS mask-image için beyaz-alfa)
soft = ndi.gaussian_filter(open_all.astype(float), 0.5)
m = np.zeros((512, 512, 4), np.uint8)
m[..., :3] = 255
m[..., 3] = np.clip(soft * 255 * 1.4, 0, 255).astype(np.uint8)
Image.fromarray(m, 'RGBA').save(AV / 'eye_open.webp', 'WEBP', lossless=True)

# boş göz yaması: açıklığın biraz dışına taşsın ki orijinal iris kenarı görünmesin
grow = open_all  # taşma yok: kenarda orijinal görünsün, dikiş çizgisi olmasın
patch_full = patch.copy()
for c in range(3):
    patch_full[..., c] = np.where(grow & ~open_all, ndi.grey_dilation(patch[..., c], size=3), patch[..., c])
patch_full[..., 3] = np.where(grow, 255, 0)
Image.fromarray(patch_full.round().astype(np.uint8), 'RGBA').save(AV / 'eyes_empty.webp', 'WEBP', lossless=True)

# kayan katman: açıklığın içindeki orijinal pikseller (göz akı + iris birlikte kayar, halka izi kalmaz)
hard = open_all
ir = a.copy()
ir[..., 3] = 255 * hard
Image.fromarray(ir.round().astype(np.uint8), 'RGBA').save(AV / 'iris_full.webp', 'WEBP', lossless=True)
iris_tint = iris_tint * hard
Image.fromarray((iris_tint * 255).round().astype(np.uint8), 'L').convert('RGB').save(AV / 'iris_full_mask.webp', 'WEBP', lossless=True)
ref = float((lum * iris_tint).sum() / iris_tint.sum())
print({'centers': centers, 'ref': round(ref, 4), 'open_px': int(open_all.sum())})

# Kendi gözünü çizen ifadeler (göz kutusunda belirgin alfa): bunlarda göz kaydırılmaz.
import json
own = []
for f in sorted((KOK / 'public/av/face').glob('*.webp')):
    if f.stem.endswith('_mask') or f.stem == 'blink':
        continue
    al_f = np.array(Image.open(f).convert('RGBA'))[..., 3]
    if (al_f[195:245, 175:340] > 128).mean() > 0.15:
        own.append('face_' + f.stem)
man = json.loads((KOK / 'public/av/manifest.json').read_text())
man['variants']['eyes'] = {'layer': 'base/eyes_empty.webp', 'open': 'base/eye_open.webp',
                           'iris': {'layer': 'base/iris_full.webp', 'mask': 'base/iris_full_mask.webp', 'ref': round(ref, 4)},
                           'ownEyes': own}
(KOK / 'public/av/manifest.json').write_text(json.dumps(man, ensure_ascii=False, indent=2) + '\n')
print('kendi gözü olanlar', own)
