"""Section 4 offline held-item reference sheets using art.json placement and tint."""
from pathlib import Path
import importlib.util,json
import numpy as np
from PIL import Image,ImageDraw,ImageFont
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('faz8matrix',HERE/'01_matris.py');mx=importlib.util.module_from_spec(spec);spec.loader.exec_module(mx)
spec2=importlib.util.spec_from_file_location('eyeRef',HERE/'02_referans.py');er=importlib.util.module_from_spec(spec2);spec2.loader.exec_module(er)
AV=mx.AV;ART=json.loads((AV/'held/art.json').read_text())
FONT=ImageFont.truetype('/usr/share/fonts/google-noto/NotoSans-Regular.ttf',12);SMALL=ImageFont.truetype('/usr/share/fonts/google-noto/NotoSans-Regular.ttf',10);TITLE=ImageFont.truetype('/usr/share/fonts/google-noto/NotoSans-Regular.ttf',17)
BG='#f3eee4';INK='#38291f';PANEL='#fffaf1';LINE='#ddcfbd';SKIN=mx.SKIN;CLOTH=mx.ITEM['ccolor_blue']['color']
ITEMS=[('football','Futbol topu'),('kite','Uçurtma'),('book','Kitap'),('toycar','Oyuncak araba'),('flower','Çiçek')]

def scene(item,size,football='rest'):
    art=ART[item]
    kid=er.face('round').resize((round(size*.98),round(size*.98)),Image.Resampling.LANCZOS)
    stage=Image.new('RGBA',(size,size),BG);stage.alpha_composite(kid,(round(-size*.10),round(-size*.015)))
    pet=Image.open(AV/'pet/chick.webp').convert('RGBA')
    pw=round(size*.33);pet=pet.resize((pw,pw),Image.Resampling.LANCZOS)
    stage.alpha_composite(pet,(round(size*.645),round(size*(1-.065-.33))))
    parts=[]
    if art.get('fixed'):parts.append({'src':art['fixed']})
    parts += [
      {'src':art['sleeve'],'color':CLOTH,'ref':art['sleeveRef']},
      {'src':art['hand'],'color':SKIN,'ref':art['skinRef']},
    ]
    grip=mx.compose(parts);w=round(size*art['size'])
    x=round(size*art['x']);y=round(size*art['y'])
    if item=='football' and football=='air':
        flight=Image.open(AV/art['motion']).convert('RGBA')
        fw=round(w*.68);flight=flight.resize((fw,fw),Image.Resampling.LANCZOS)
        fx=x+round(w*.16)+round(fw*.09);fy=y+round(w*.08)-round(fw*.51)
        stage.alpha_composite(flight,(fx,fy))
    elif item=='football' and football=='mid':
        flight=Image.open(AV/art['motion']).convert('RGBA')
        fw=round(w*.68);flight=flight.resize((fw,fw),Image.Resampling.LANCZOS)
        fx=x+round(w*.16)-round(fw*.05);fy=y+round(w*.08)-round(fw*.31)
        stage.alpha_composite(flight,(fx,fy))
    else:
        held=Image.open(AV/art['item']).convert('RGBA').resize((w,w),Image.Resampling.LANCZOS)
        stage.alpha_composite(held,(x,y))
    grip=grip.resize((w,w),Image.Resampling.LANCZOS)
    stage.alpha_composite(grip,(x,y));return stage.convert('RGB')
def baseline(size):
    kid=er.face('round').resize((round(size*.98),round(size*.98)),Image.Resampling.LANCZOS)
    stage=Image.new('RGBA',(size,size),BG);stage.alpha_composite(kid,(round(-size*.10),round(-size*.015)))
    pet=Image.open(AV/'pet/chick.webp').convert('RGBA');pw=round(size*.33);pet=pet.resize((pw,pw),Image.Resampling.LANCZOS)
    stage.alpha_composite(pet,(round(size*.645),round(size*(1-.065-.33))))
    return stage.convert('RGB')
def panel(d,box,title):d.rounded_rectangle(box,radius=10,fill=PANEL,outline=LINE,width=1);d.text((box[0]+9,box[1]+5),title,font=FONT,fill=INK)

def mobile():
    im=Image.new('RGB',(375,812),BG);d=ImageDraw.Draw(im)
    d.text((12,8),'Faz 8 / 04 · Elimde',font=TITLE,fill=INK);d.text((12,31),'375×812 · çevrimdışı eşya referansı',font=SMALL,fill='#695949')
    panel(d,(8,48,367,328),'250 px büyük ayna · civciv + top')
    im.paste(scene('football',250),(62,68));d=ImageDraw.Draw(im);d.text((116,319),'Top elde tutuluyor',font=SMALL,fill=INK)
    panel(ImageDraw.Draw(im),(8,341,367,514),'70 px kartlar · beş eşya')
    for i,(item,name) in enumerate(ITEMS):
        x=7+i*73;im.paste(scene(item,70),(x,363));d=ImageDraw.Draw(im);d.text((x+1,435),name.replace(' ','\n',1) if len(name)>10 else name,font=SMALL,fill=INK)
    panel(ImageDraw.Draw(im),(8,527,367,783),'Tutma ve hareket kontrolü')
    notes=['Futbol topu avuçta seker','Uçurtma makaradan salınır','Kitabın sayfası döner','Araba ilerler, demet uzatılır','Hareketi azaltma tercihinde eşya sabit kalır.']
    for i,note in enumerate(notes):d.text((18,555+i*34),'• '+note,font=FONT,fill=INK)
    d=ImageDraw.Draw(im);d.text((12,790),'WebP katmanları + render.ts tint; tarayıcı yakalaması değildir.',font=SMALL,fill='#695949')
    im.save(HERE/'04-mobil-375x812.png')

def desktop():
    im=Image.new('RGB',(1280,800),BG);d=ImageDraw.Draw(im)
    d.text((16,10),'Faz 8 / 04 · Elimde',font=TITLE,fill=INK);d.text((16,34),'1280×800 · çevrimdışı katman referansı · 5 elde tutulan eşya',font=SMALL,fill='#695949')
    panel(d,(10,55,1270,485),'Civciv yanında · büyük ayna · eşya başına 205 px')
    for i,(item,name) in enumerate(ITEMS):
        x=25+i*250;im.paste(scene(item,205),(x,82));d=ImageDraw.Draw(im);d.text((x+35,292),name,font=FONT,fill=INK)
    panel(ImageDraw.Draw(im),(10,500,1270,775),'90 px küçük kart · item / sleeve / hand katmanları')
    for i,(item,name) in enumerate(ITEMS):
        x=40+i*145;im.paste(scene(item,90),(x,530));d=ImageDraw.Draw(im);d.text((x,623),name,font=SMALL,fill=INK)
    d=ImageDraw.Draw(im);d.text((16,785),'Sabit reel ve kitap sayfası ek katmanları gösterilir; dokunma animasyonları bu çevrimdışı karede oynatılmaz.',font=SMALL,fill='#695949')
    im.save(HERE/'04-masaustu-1280x800.png')
def football_montage():
    im=Image.new('RGB',(212,122),BG);d=ImageDraw.Draw(im)
    d.text((8,3),'Futbol topu · hareket karesi referansı',font=SMALL,fill=INK)
    im.paste(scene('football',90,'rest'),(8,20));im.paste(scene('football',90,'air'),(114,20))
    d=ImageDraw.Draw(im);d.text((15,110),'elde',font=SMALL,fill=INK);d.text((119,110),'havada',font=SMALL,fill=INK)
    im.save(HERE/'04-futbol-montaj.png')
def measurements():
    base=np.array(baseline(90)).astype(int);rows=[]
    for item,name in ITEMS:
        arr=np.array(scene(item,90)).astype(int)
        delta=np.max(np.abs(arr-base),axis=2)
        changed=int(np.count_nonzero(delta>8))
        rows.append(f'{name}: 90 px kartta {changed} piksel 8/255 üstü değişti; x={ART[item]["x"]:.3f}, y={ART[item]["y"]:.3f}, boyut={ART[item]["size"]:.2f}.')
    (HERE/'04-olcum.txt').write_text('Bölüm 4 · elde tutulan eşya katmanları\nÇevrimdışı Pillow karşılaştırması; render.ts tint ve held/art.json yerleşimi kullanıldı.\n'+'\n'.join(rows)+'\n')
    print('\n'.join(rows))
if __name__=='__main__':
    mobile();desktop();football_montage();measurements();print('Wrote section 4 mobile and desktop offline reference sheets.')
