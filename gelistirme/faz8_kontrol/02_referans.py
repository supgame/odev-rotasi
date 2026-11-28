"""Section 2 offline comparison sheets from real WebP layers. Not browser captures."""
from pathlib import Path
import importlib.util
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('faz8matrix',HERE/'01_matris.py')
mx=importlib.util.module_from_spec(spec);spec.loader.exec_module(mx)
AV=mx.AV;SKIN=mx.SKIN;EYE='5a3420'
FONT=ImageFont.truetype('/usr/share/fonts/google-noto/NotoSans-Regular.ttf',11)
SMALL=ImageFont.truetype('/usr/share/fonts/google-noto/NotoSans-Regular.ttf',9)
TITLE=ImageFont.truetype('/usr/share/fonts/google-noto/NotoSans-Regular.ttf',16)
BG='#f3eee4';INK='#38291f';PANEL='#fffaf1';LINE='#ddcfbd'
EYES=[('round','Yuvarlak','round'),('almond','Badem','almond'),('gentle','Yumuşak','gentle'),('sparkle','İri parlak','bright'),('upturned','Uçları yukarı','upturn')]
NOSES=['nose_button','nose_straight','nose_wide']
BROWS=['brow_soft','brow_straight','brow_bold']

def base_parts():return mx.layer_list('oval','small','hair_short',None)
def tinted_feature(src,mask=None,ref=None,color=None):return {'src':src,**({'mask':mask,'ref':ref,'color':color} if mask and color else {'color':color,'ref':ref} if color else {})}
def face(eye='round',closed=False,nose=None,brow=None):
    ps=base_parts()
    ps.append(tinted_feature('features/clear_eyes.webp',color=SKIN,ref=mx.M['base']['skinRef']))
    slug=dict((x[0],x[2]) for x in EYES)[eye]
    if closed: ps.append({'src':f'features/eshape_{slug}_closed.webp'})
    else: ps.append(tinted_feature(f'features/eshape_{slug}.webp',f'features/eshape_{slug}_mask.webp',{'round':81.421,'almond':76.1967,'gentle':70.5133,'sparkle':80.3819,'upturned':69.5094}[eye],EYE))
    if nose:
        ps.extend([tinted_feature('features/clear_nose.webp',color=SKIN,ref=mx.M['base']['skinRef']),tinted_feature(f'features/{nose}.webp',color=SKIN,ref=mx.M['base']['skinRef'])])
    if brow:
        ps.extend([tinted_feature('features/clear_brows.webp',color=SKIN,ref=mx.M['base']['skinRef']),tinted_feature(f'features/{brow}.webp',color=SKIN,ref=mx.M['base']['skinRef'])])
    return mx.compose(ps)
def card(eye='round',closed=False,nose=None,brow=None,size=70):
    return mx.card(face(eye,closed,nose,brow),size).convert('RGB')
def panel(d,rect,title):
    d.rounded_rectangle(rect,radius=10,fill=PANEL,outline=LINE,width=1);d.text((rect[0]+9,rect[1]+5),title,font=FONT,fill=INK)

def mobile():
    im=Image.new('RGB',(375,812),BG);d=ImageDraw.Draw(im)
    d.text((12,8),'Faz 8 / 02 · Yüz özellikleri',font=TITLE,fill=INK)
    d.text((12,29),'375×812 çevrimdışı katman referansı',font=SMALL,fill='#695949')
    panel(d,(8,47,367,324),'250 px büyük ayna · iri parlak göz')
    im.paste(mx.card(face('sparkle'),250).convert('RGB'),(62,68))
    panel(ImageDraw.Draw(im),(8,330,367,515),'70 px kartlar · üst açık, alt kapalı')
    for i,(id,name,_) in enumerate(EYES):
        x=8+i*72
        im.paste(card(id,size=70),(x,365));im.paste(card(id,closed=True,size=70),(x,438))
        d=ImageDraw.Draw(im);d.text((x,349),name,font=SMALL,fill=INK)
    panel(ImageDraw.Draw(im),(8,523,367,784),'Burun ve kaş · 70 px küçük görünüm')
    for i,nose in enumerate(NOSES):
        x=17+i*116;im.paste(card(nose=nose,size=70),(x,553));d=ImageDraw.Draw(im);d.text((x,625),nose.replace('nose_','burun '),font=SMALL,fill=INK)
    for i,brow in enumerate(BROWS):
        x=17+i*116;im.paste(card(brow=brow,size=70),(x,646));d=ImageDraw.Draw(im);d.text((x,718),brow.replace('brow_','kaş '),font=SMALL,fill=INK)
    d=ImageDraw.Draw(im);d.text((10,790),'Pillow katman referansı · tarayıcı görüntüsü değildir.',font=SMALL,fill='#695949')
    im.save(HERE/'02-mobil-375x812.png')

def desktop():
    im=Image.new('RGB',(1280,800),BG);d=ImageDraw.Draw(im)
    d.text((16,10),'Faz 8 / 02 · Yüz özellikleri',font=TITLE,fill=INK)
    d.text((16,33),'1280×800 çevrimdışı katman referansı · yeni göz biçimleri, kırpma, burun ve kaş',font=SMALL,fill='#695949')
    panel(d,(10,54,302,470),'250 px büyük ayna')
    im.paste(mx.card(face('sparkle'),250).convert('RGB'),(31,88))
    d=ImageDraw.Draw(im);d.text((50,345),'İri parlak göz · açık',font=FONT,fill=INK)
    im.paste(mx.card(face('sparkle',closed=True),90).convert('RGB'),(104,365))
    d=ImageDraw.Draw(im);d.text((110,458),'70 px kırpma örneği',font=SMALL,fill=INK)
    panel(d,(320,54,1270,470),'Beş biçim · her biri açık ve kapalı · 90 px')
    for i,(id,name,_) in enumerate(EYES):
        x=340+i*184
        im.paste(card(id,size=90),(x,104));im.paste(card(id,closed=True,size=90),(x,247))
        d=ImageDraw.Draw(im);d.text((x,83),name,font=FONT,fill=INK);d.text((x,340),'Açık                 Kapalı',font=SMALL,fill=INK)
    panel(ImageDraw.Draw(im),(10,485,1270,780),'Burun ve kaş · 90 px kart')
    for i,nose in enumerate(NOSES):
        x=32+i*120;im.paste(card(nose=nose,size=90),(x,525));d=ImageDraw.Draw(im);d.text((x,617),nose.replace('nose_','Burun '),font=SMALL,fill=INK)
    for i,brow in enumerate(BROWS):
        x=452+i*120;im.paste(card(brow=brow,size=90),(x,525));d=ImageDraw.Draw(im);d.text((x,617),brow.replace('brow_','Kaş '),font=SMALL,fill=INK)
    d=ImageDraw.Draw(im);d.text((14,788),'Katmanlar manifest / Avatar.tsx sırasına göre Pillow ile birleştirildi; gerçek Chromium ekranı değildir.',font=SMALL,fill='#695949')
    im.save(HERE/'02-masaustu-1280x800.png')

def measurements():
    variants=[np.array(card(id,size=70)) for id,_,_ in EYES]
    reference=variants[0][28:48,14:56]
    counts=[]
    for (id,name,_),arr in zip(EYES[1:],variants[1:]):
        crop=arr[28:48,14:56]
        changed=int(np.any(crop!=reference,axis=2).sum())
        counts.append(f'{name} vs yuvarlak: eye-bandında {changed} değişen piksel (70 px kart, RGB PNG)')
    closed=[np.array(card(id,closed=True,size=70)) for id,_,_ in EYES]
    closed_counts=[f'{name}: açık/kapalı bandında {int(np.any(o[28:48,14:56]!=c[28:48,14:56],axis=2).sum())} değişen piksel' for (_,name,_),o,c in zip(EYES,variants,closed)]
    (HERE/'02-olcum.txt').write_text('Bölüm 2 · 70 px göz görünürlüğü\nPillow katman karşılaştırması; tarayıcı Canvas birebir doğrulaması değildir.\n'+'\n'.join(counts+closed_counts)+'\n')
    print('\n'.join(counts+closed_counts))

if __name__=='__main__':
    mobile();desktop();measurements();print('Wrote section 2 mobile and desktop offline reference sheets.')
