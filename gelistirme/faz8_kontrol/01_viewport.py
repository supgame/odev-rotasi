"""Section 1 viewport-sized offline reference sheets. Not browser screenshots."""
from pathlib import Path
import importlib.util
from PIL import Image, ImageDraw, ImageFont

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('faz8matrix',HERE/'01_matris.py')
mx=importlib.util.module_from_spec(spec);spec.loader.exec_module(mx)
FONT=ImageFont.truetype('/usr/share/fonts/google-noto/NotoSans-Regular.ttf',12)
SMALL=ImageFont.truetype('/usr/share/fonts/google-noto/NotoSans-Regular.ttf',10)
TITLE=ImageFont.truetype('/usr/share/fonts/google-noto/NotoSans-Regular.ttf',17)
BG='#f3eee4';INK='#38291f';PANEL='#fffaf1';LINE='#ddcfbd'

def avatar(shape='oval',ear='small',hair='hair_short',hat=None,size=70):
    return mx.card(mx.compose(mx.layer_list(shape,ear,hair,hat)),size).convert('RGB')

def panel(draw,xyxy,title):
    draw.rounded_rectangle(xyxy,radius=10,fill=PANEL,outline=LINE,width=1)
    draw.text((xyxy[0]+10,xyxy[1]+6),title,font=FONT,fill=INK)

def mobile():
    im=Image.new('RGB',(375,812),BG);d=ImageDraw.Draw(im)
    d.text((14,12),'Faz 8 / 01 · Saç ve şapka',font=TITLE,fill=INK)
    d.text((14,38),'375×812 çevrimdışı görsel referansı',font=SMALL,fill='#695949')
    panel(d,(10,64,365,382),'Büyük ayna 250 px  ·  küçük kart 70 px')
    im.paste(avatar('oval','small','hair_short','hat_cap_red',250),(106,91))
    im.paste(avatar('oval','small','hair_short','hat_cap_red',70),(24,151))
    d=ImageDraw.Draw(im);d.text((17,236),'70 px',font=SMALL,fill=INK);d.text((182,350),'250 px büyük görünüm',font=SMALL,fill=INK)
    panel(d,(10,393,365,802),'Oval yüz · orta kulak · saç / şapka karşılaştırması')
    for hi,hair in enumerate(mx.HAIR):
        for ki,hat in enumerate(mx.HATS):
            x=22+ki*84;y=422+hi*92
            im.paste(avatar('oval','medium',hair,hat,70),(x,y))
            hair_short=mx.ITEM[hair]['name'].replace('düz','').replace('Saç','').strip()
            d=ImageDraw.Draw(im);d.text((x,y+71),f'{hair_short} · {mx.H_NAMES[ki]}',font=SMALL,fill=INK)
    d=ImageDraw.Draw(im);d.text((12,786),'Gerçek public/av katmanları + render.ts tint; tarayıcı ekran görüntüsü değildir.',font=SMALL,fill='#695949')
    im.save(HERE/'01-mobil-375x812.png')

def desktop():
    im=Image.new('RGB',(1280,800),BG);d=ImageDraw.Draw(im)
    d.text((18,12),'Faz 8 / 01 · Saç ve şapka',font=TITLE,fill=INK)
    d.text((18,39),'1280×800 çevrimdışı görsel referansı · gerçek katmanlarla büyük ayna ve küçük kart',font=SMALL,fill='#695949')
    panel(d,(12,66,575,440),'Aynı avatar · küçük kart 90 px ve büyük ayna 320 px')
    im.paste(avatar('oval','small','hair_short','hat_cap_red',320),(20,98))
    im.paste(avatar('oval','small','hair_short','hat_cap_red',90),(370,153))
    d=ImageDraw.Draw(im);d.text((370,248),'90 px kart',font=SMALL,fill=INK);d.text((112,419),'320 px büyük görünüm',font=SMALL,fill=INK)
    panel(d,(590,66,1268,440),'Oval yüz · orta kulak · 4 saç × 4 şapka')
    for hi,hair in enumerate(mx.HAIR):
        d.text((604,108+hi*80),mx.ITEM[hair]['name'],font=SMALL,fill=INK)
        for ki,hat in enumerate(mx.HATS):
            x=730+ki*128;y=94+hi*80
            im.paste(avatar('oval','medium',hair,hat,70),(x,y))
            d=ImageDraw.Draw(im);d.text((x,y+71),mx.H_NAMES[ki],font=SMALL,fill=INK)
    panel(d,(12,454,1268,778),'Kep / bere / kovboy · altı yüz şekli ve üç kulak biçimi · küçük kartlar 70 px')
    shapes=mx.SHAPES;ears=mx.EARS
    for row,ear in enumerate(ears):
        for col,shape in enumerate(shapes):
            x=26+col*121;y=485+row*94
            im.paste(avatar(shape,ear,'hair_short','hat_cap_red',70),(x,y))
            d=ImageDraw.Draw(im);d.text((x+73,y+16),f'{shape}\n{ear}',font=SMALL,fill=INK)
    d=ImageDraw.Draw(im);d.text((15,781),'Pillow ile katman birleştirme referansı; gerçek 1280×800 Chromium yakalaması değildir.',font=SMALL,fill='#695949')
    im.save(HERE/'01-masaustu-1280x800.png')

if __name__=='__main__':
    mobile();desktop();print('Wrote 01-mobil-375x812.png and 01-masaustu-1280x800.png (offline references)')
