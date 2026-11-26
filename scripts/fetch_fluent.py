"""Fluent Emoji 3D görsellerini indirir -> public/fx/<id>.webp ve src/avatar/fxmeta.ts (renk + görsel sınırları).
Kullanım: python3 scripts/fetch_fluent.py   (catalog.ts'deki src adlarını okur)"""
import io, json, re, sys, urllib.parse, urllib.request, pathlib, subprocess
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'fx'; OUT.mkdir(parents=True, exist_ok=True)
cat = (ROOT / 'src/avatar/catalog.ts').read_text()
entries = []  # (file_id, src, kind)
for m in re.finditer(r"S\('([^']+)', '[^']*', \d+, '[^']*', '([^']+)'\)", cat):
    entries.append((m.group(1), m.group(2), 'char'))
slot = None
for line in cat.splitlines():
    s = re.search(r"\.\.\.I\('(\w+)'", line)
    if s: slot = s.group(1)
    for m in re.finditer(r"\['([^']+)', '[^']*', \d+, '([^']+)'\]", line):
        entries.append((f'{slot}_{m.group(1)}', m.group(2), slot))

tree = json.loads(subprocess.check_output(['gh', 'api', 'repos/microsoft/fluentui-emoji/git/trees/main?recursive=1']))
paths = {}
for t in tree['tree']:
    p = t['path']
    if p.endswith('.png') and '/3D/' in p and '/Default/' not in p:
        paths.setdefault(p.split('/')[1], p)
    elif p.endswith('.png') and '/Default/3D/' in p:
        paths.setdefault(p.split('/')[1], p)  # ten rengi olanlarda varsayılan

meta = {}
missing = []
for fid, src, kind in entries:
    p = paths.get(src)
    if not p: missing.append(src); continue
    url = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/' + urllib.parse.quote(p)
    raw = urllib.request.urlopen(url, timeout=60).read()
    im = Image.open(io.BytesIO(raw)).convert('RGBA')
    size = 256 if kind == 'char' else 160
    im = im.resize((size, size), Image.LANCZOS)
    im.save(OUT / f'{fid}.webp', 'WEBP', quality=88, method=6)
    a = im.getchannel('A'); bb = a.point(lambda v: 255 if v > 40 else 0).getbbox()
    small = im.resize((32, 32)); px = [c for c in small.getdata() if c[3] > 200]
    px.sort(key=lambda c: c[0] + c[1] + c[2]); mid = px[len(px) // 2] if px else (200, 150, 100, 255)
    meta[fid] = {'b': [round(v / size, 3) for v in bb], 'c': '#%02x%02x%02x' % mid[:3]}
    print(fid, end=' ', flush=True)
print()
(ROOT / 'src/avatar/fxmeta.ts').write_text('// scripts/fetch_fluent.py üretir: b = görsel sınırı [sol, üst, sağ, alt] (0-1), c = baskın renk.\nexport const FXMETA: Record<string, { b: [number, number, number, number]; c: string }> = ' + json.dumps(meta, ensure_ascii=False) + '\n')
lic = urllib.request.urlopen('https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/LICENSE').read()
(OUT / 'LICENSE').write_bytes(b'Images in this folder: Microsoft Fluent Emoji (https://github.com/microsoft/fluentui-emoji), resized/converted to WebP.\n\n' + lic)
if missing: print('EKSIK:', missing); sys.exit(1)
