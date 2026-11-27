"""Saçın arka dolgusu: ön saç katmanındaki yan perçemlerin arasını (yüzün arkası) koyu saç rengiyle doldurur.

Dar yüz şekillerinde ve küçük kulaklarda uzun saçla yanak arasında arka plan görünüyordu; gerçekte orada saçın arkası olur.
Dolgu tabanın arkasına çizilir, saç rengiyle boyanır. Yalnız alın hizasının altında (y >= 190).
Çalıştır: gelistirme/.venv/bin/python -B gelistirme/avatar_uretim/sac_dolgu.py
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

KOK = Path(__file__).resolve().parents[2]
AV = KOK / 'public/av'
yy, xx = np.mgrid[0:512, 0:512]
disk = (np.hypot(*np.mgrid[-14:15, -14:15]) <= 14)

man = json.loads((AV / 'manifest.json').read_text())
for it in man['slots']['hair']['items']:
    lay = it.get('layers') or {}
    for k, fk in (('front', 'fill'), ('frontUnderHat', 'fillUnderHat')):
        src = lay.get(k)
        if not src:
            continue
        a = np.array(Image.open(AV / src).convert('RGBA')).astype(np.float64)
        hair = a[..., 3] > 60
        # her satırda soldaki ve sağdaki saç arasını doldur (iki yanda da saç varsa): yüzün arkasındaki saç
        dolgu = np.zeros((512, 512), bool)
        for y in range(190, 380):
            sol = np.where(hair[y, :256])[0]
            sag = np.where(hair[y, 256:])[0] + 256
            if len(sol) and len(sag):
                dolgu[y, sol.min():sag.max() + 1] = True
        dolgu &= ~hair
        dolgu = ndi.binary_opening(dolgu, iterations=2)
        dolgu = ndi.binary_dilation(dolgu, iterations=3) & (yy >= 186)
        if dolgu.sum() < 60:
            lay[fk] = None
            continue
        lum = a[..., :3] @ [0.2126, 0.7152, 0.0722]
        renk = float(np.median(lum[hair & (yy > 200)])) * 0.62 if (hair & (yy > 200)).any() else 40.0
        alfa = ndi.gaussian_filter(dolgu.astype(float), 1.0)
        out = np.zeros((512, 512, 4), np.uint8)
        out[..., :3] = int(round(renk))
        out[..., 3] = np.clip(alfa * 255, 0, 255).astype(np.uint8)
        ad = Path(src).stem.replace('_front', '') + ('_fill_hat' if k == 'frontUnderHat' else '_fill')
        Image.fromarray(out, 'RGBA').save(AV / 'hair' / f'{ad}.webp', 'WEBP', lossless=True)
        m = np.zeros((512, 512), np.uint8); m[dolgu] = 255
        Image.fromarray(m, 'L').convert('RGB').save(AV / 'hair' / f'{ad}_mask.webp', 'WEBP', lossless=True)
        lay[fk] = f'hair/{ad}.webp'
        it.setdefault('mask', {})[fk] = f'hair/{ad}_mask.webp'
        it.setdefault('ref', {})[fk] = round(renk, 4)
        print(it['id'], k, int(dolgu.sum()))
(AV / 'manifest.json').write_text(json.dumps(man, ensure_ascii=False, indent=2) + '\n')
