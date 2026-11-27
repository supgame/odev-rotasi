"""Fluent Emoji Flat (SVG) hayvan görsellerini indirir -> public/fx/<id>.svg.
Kullanım: python3 scripts/fetch_fluent.py   (catalog.ts'deki SPECIES src adlarını okur)"""
import json, re, sys, urllib.parse, urllib.request, pathlib, subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'fx'; OUT.mkdir(parents=True, exist_ok=True)
cat = (ROOT / 'src/avatar/catalog.ts').read_text()
entries = re.findall(r"S\('([^']+)', '[^']*', \d+, '[^']*', '([^']+)'\)", cat)

tree = json.loads(subprocess.check_output(['gh', 'api', 'repos/microsoft/fluentui-emoji/git/trees/main?recursive=1']))
paths = {}
for t in tree['tree']:
    p = t['path']
    if p.endswith('.svg') and '/Flat/' in p and ('/Default/' in p or p.count('/') == 3):
        paths.setdefault(p.split('/')[1], p)

missing = []
for fid, src in entries:
    p = paths.get(src)
    if not p: missing.append(src); continue
    raw = urllib.request.urlopen('https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/' + urllib.parse.quote(p), timeout=60).read()
    (OUT / f'{fid}.svg').write_bytes(raw)
    print(fid, end=' ', flush=True)
print()
lic = urllib.request.urlopen('https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/LICENSE').read()
(OUT / 'LICENSE').write_bytes(b'Images in this folder: Microsoft Fluent Emoji Flat (https://github.com/microsoft/fluentui-emoji).\n\n' + lic)
if missing: print('EKSIK:', missing); sys.exit(1)
