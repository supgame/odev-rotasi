"""Hero pose offline references using placement.json and render.ts tint approximation."""
from pathlib import Path
import importlib.util,json
import numpy as np
from PIL import Image,ImageDraw,ImageFont

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('faz8matrix',HERE/'01_matris.py');mx=importlib.util.module_from_spec(spec);spec.loader.exec_module(mx)
spec2=importlib.util.spec_from_file_location('eyeRef',HERE/'02_referans.py');er=importlib.util.module_from_spec(spec2);spec2.loader.exec_module(er)
AV=mx.AV; PLACEMENT=json.loads((AV/'pose/hero/placement.json').read_text())
FONT=ImageFont.truetype('/usr/share/fonts/google-noto/NotoSans-Regular.ttf',12);SMALL=ImageFont.truetype('/usr/share/fonts/google-noto/NotoSans-Regular.ttf',10);TITLE=ImageFont.truetype('/usr/share/fonts/google-noto/NotoSans-Regular.ttf',17)
BG='#f3eee4';INK='#38291f';PANEL='#fffaf1';LINE='#ddcfbd'
PETS=[('cat','Kedi'),('dog','Köpek'),('rabbit','Tavşan'),('chick','Civciv')]
SKIN=mx.SKIN;CLOTH=mx.ITEM['ccolor_blue']['color'];SKIN_REF=mx.M['base']['skinRef']

def part(src,color=None,ref=None):return {'src':src,**({'color':color,'ref':ref} if color else {})}
def child(size,pose='side'):
    im=er.face('round')
    scaled=im.resize((round(size*1.16),round(size*1.16)),Image.Resampling.LANCZOS)
    stage=Image.new('RGBA',(size,size),BG);stage.alpha_composite(scaled,(round((-.098 if pose=='hug' else -.225)*size),round(.035*size)))
    return stage
def contact(name,pose,size):
    art=PLACEMENT[f'{name}-{pose}']
    pieces=[part(art['pet']),part(art['sleeve'],CLOTH,art['sleeveRef']),part(art['hand'],SKIN,art['skinRef'])]
    overlay=mx.compose(pieces)
    w=round(size*art['size']);x=round(size*art['x']);y=round(size*art['y'])
    overlay=overlay.resize((w,w),Image.Resampling.LANCZOS)
    out=child(size,pose);out.alpha_composite(overlay,(x,y));return out.convert('RGB')
def old_cradle(name,size):
    # Existing cradle source is a full illustrated scene; this is clearly shown as an older-style preview.
    im=Image.open(AV/f'pose/{name}-cradle.webp').convert('RGBA').resize((size,size),Image.Resampling.LANCZOS)
    bg=Image.new('RGBA',(size,size),BG);bg.alpha_composite(im);return bg.convert('RGB')
def panel(d,box,title):d.rounded_rectangle(box,radius=10,fill=PANEL,outline=LINE,width=1);d.text((box[0]+9,box[1]+5),title,font=FONT,fill=INK)

def mobile():
    im=Image.new('RGB',(375,812),BG);d=ImageDraw.Draw(im)
    d.text((12,8),'Faz 8 / 03 · Arkadaş pozları',font=TITLE,fill=INK);d.text((12,31),'375×812 · çevrimdışı sahne referansı',font=SMALL,fill='#695949')
    panel(d,(8,48,367,328),'Civciv · kucakta temas · 250 px')
    im.paste(contact('chick','hug',250),(62,68));d=ImageDraw.Draw(im);d.text((94,319),'El önde; civciv avuçta tutuluyor',font=SMALL,fill=INK)
    panel(ImageDraw.Draw(im),(8,338,367,475),'Yanımda · oyun teması · 90 px kart')
    for i,(pet,name) in enumerate(PETS):
        x=8+i*90;im.paste(contact(pet,'side',90),(x,358));d=ImageDraw.Draw(im);d.text((x+3,450),name,font=SMALL,fill=INK)
    panel(ImageDraw.Draw(im),(8,484,367,789),'Önceki kucak çizimleri · 70 px yaklaşık önizleme')
    for i,(pet,name) in enumerate([p for p in PETS if p[0]!='chick']):
        x=22+i*110;im.paste(old_cradle(pet,70),(x,515));d=ImageDraw.Draw(im);d.text((x,587),name,font=SMALL,fill=INK)
        d.text((x,602),'eski sahne',font=SMALL,fill='#695949')
    d=ImageDraw.Draw(im);d.text((15,771),'Gerçek temas katmanları + render.ts tint; eski kucak görselleri yaklaşık.',font=SMALL,fill='#695949')
    im.save(HERE/'03-mobil-375x812.png')

def desktop():
    im=Image.new('RGB',(1280,800),BG);d=ImageDraw.Draw(im)
    d.text((16,10),'Faz 8 / 03 · Arkadaş pozları',font=TITLE,fill=INK);d.text((16,34),'1280×800 · çevrimdışı referans · 4 tür / kolda temas ve civciv kucağı',font=SMALL,fill='#695949')
    panel(d,(10,55,1270,375),'Yanımda · oyun teması · 250 px büyük görünüm')
    for i,(pet,name) in enumerate(PETS):
        x=30+i*305;im.paste(contact(pet,'side',250),(x,82));d=ImageDraw.Draw(im);d.text((x+70,340),name+' · oyun teması',font=FONT,fill=INK)
    panel(ImageDraw.Draw(im),(10,391,1270,768),'90 px küçük kartlar · yanımda, civciv kucakta ve eski kucak sahneleri')
    for i,(pet,name) in enumerate(PETS):
        x=30+i*140;im.paste(contact(pet,'side',90),(x,420));d=ImageDraw.Draw(im);d.text((x,513),name+' yanımda',font=SMALL,fill=INK)
    im.paste(contact('chick','hug',90),(620,420));d=ImageDraw.Draw(im);d.text((620,513),'Civciv kucakta',font=SMALL,fill=INK)
    for i,(pet,name) in enumerate([p for p in PETS if p[0]!='chick']):
        x=760+i*120;im.paste(old_cradle(pet,90),(x,420));d=ImageDraw.Draw(im);d.text((x,513),name+' eski kucak',font=SMALL,fill=INK)
    d=ImageDraw.Draw(im);d.text((14,783),'Eski kucak görselleri yeni çizim değildir; offline Pillow referansı tarayıcı yakalaması değildir.',font=SMALL,fill='#695949')
    im.save(HERE/'03-masaustu-1280x800.png')

if __name__=='__main__':mobile();desktop();print('Wrote section 3 mobile and desktop offline reference sheets.')
