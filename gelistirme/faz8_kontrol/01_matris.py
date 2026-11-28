"""Bölüm 1: kaynak katmanları Pillow ile çevrimdışı birleştirir (tarayıcı testi değildir)."""
from pathlib import Path
from functools import lru_cache
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parent
AV=ROOT/'public/av'
M=json.loads((AV/'manifest.json').read_text())
V=M['variants']
ITEM={i['id']:i for s in M['slots'].values() for i in s['items']}
SHAPES=('oval','round','long','square','heart','wide')
EARS=('small','medium','big')
HAIR=('hair_short','hair_straight_long','hair_afro','hair_headscarf')
HATS=(None,'hat_cap_red','hat_pom_navy','hat_cowboy_brown')
H_NAMES=('Şapkasız','Kep','Bere','Kovboy')
COVERED={'hair_straight_long','hair_bob','hair_wavy_long','hair_bangs_long','hair_braids','hair_headscarf'}
BRIMMED={'hat/cap.webp','hat/bucket.webp','hat/cowboy.webp','hat/pirate.webp','hat/wizard.webp'}
VOLUME={'hair_afro':.76,'hair_bun':.78,'hair_spiky':.84,'hair_space_buns':.92,'hair_curly':.96}
SKIN=ITEM['skin_wheat']['color']; HCOLOR=ITEM['hcolor_dark_brown']['color']


def part(item,key=None,color=None):
    if not item:return None
    def get(prop):
        v=item.get(prop)
        return v.get(key) if key and isinstance(v,dict) else v
    src=get('layers') if key else item.get('layer')
    if not src:return None
    mask=get('mask');ref=get('ref')
    return {'src':src,**({'mask':mask,'ref':ref,'color':color} if mask and color else {})}


@lru_cache(maxsize=None)
def tinted(src,mask=None,ref=None,color=None):
    a=np.array(Image.open(AV/src).convert('RGBA')).astype(float)
    if color:
        rgb=a[:,:,:3];lum=rgb@[.2126,.7152,.0722]
        m=np.array(Image.open(AV/mask).convert('L'))/255 if mask else np.ones(a.shape[:2])
        c=np.array([int(color[i:i+2],16) for i in (0,2,4)])
        dyed=np.minimum(255,c[None,None,:]*lum[:,:,None]/max(ref or 128,1))
        a[:,:,:3]=rgb*(1-m[:,:,None])+dyed*m[:,:,None]
    return Image.fromarray(np.clip(np.rint(a),0,255).astype('uint8'),'RGBA')


def layer_list(shape,ear,hair_id,hat_id):
    hair=ITEM[hair_id];hat=ITEM.get(hat_id)
    volume=VOLUME.get(hair_id) if hat and hat['layer'] in BRIMMED else None
    under=bool(hat and not volume)
    sub=lambda s:s.replace('{shape}',shape).replace('{ears}',ear)
    ps=[]
    back=part(hair,'back',HCOLOR)
    if back:ps.append({**back,'dx':V.get('hairBackDx',{}).get(shape,0)})
    ps.append(part(hair,'fill',HCOLOR))
    ps.append({'src':sub(V['base']),'mask':sub(V['mask']),'ref':M['base']['skinRef'],'color':SKIN})
    ps.append(part(ITEM['clothes_tshirt'],color=ITEM['ccolor_blue']['color']))
    front=part(hair,'front',HCOLOR)
    if hat:
        top=part(hair,'frontUnderHat' if under else 'front',HCOLOR)
        ps.append({**top,'rows':(0,190),'clipBottom':190,**({'scaleY':volume,'dy':-12*(1-volume)} if volume else {})})
        ps.append({**front,'rows':(190,512)})
    else:ps.append(front)
    # Current Avatar.tsx draws visible ears in front of exposed short hair.
    if hair_id not in COVERED:
        ps.append({'src':sub(V['ears']['layer']),'mask':sub(V['ears']['mask']),'ref':V['ears']['ref'],'color':SKIN})
    hp=part(hat,color=hat.get('color') if hat else None)
    if hp:
        if hp['src'] in ('hat/pirate.webp','hat/cowboy.webp'):hp['dy']=-13
        if hp['src']=='hat/cap.webp' and hair_id=='hair_afro':hp.update(scale=1.12,dy=-8)
        ps.append(hp)
    return [p for p in ps if p]


def compose(parts):
    c=Image.new('RGBA',(512,512))
    for p in parts:
        im=tinted(p['src'],p.get('mask'),p.get('ref'),p.get('color')).copy()
        if 'rows' in p:
            lo,hi=p['rows'];a=np.array(im);a[:lo]=0;a[hi:]=0;im=Image.fromarray(a)
        w=round(512*p.get('scale',1));h=round(512*p.get('scaleY',p.get('scale',1)))
        if (w,h)!=(512,512):im=im.resize((w,h),Image.Resampling.BICUBIC)
        x=round((512-w)/2+p.get('dx',0));y=round((512-h)/2+p.get('dy',0))
        layer=Image.new('RGBA',(512,512));layer.alpha_composite(im,(x,y))
        if 'clipBottom' in p:
            a=np.array(layer);a[p['clipBottom']:]=0;layer=Image.fromarray(a)
        c.alpha_composite(layer)
    return c


def card(im,size=70):
    # Avatar.tsx SOLO_SCALE / SOLO_TOP when no animal is displayed.
    scaled=im.resize((round(size*1.2),round(size*1.2)),Image.Resampling.LANCZOS)
    c=Image.new('RGBA',(size,size),'#f3eee4')
    c.alpha_composite(scaled,(round((size-scaled.width)/2),round(size*(.045-6/512*1.2))))
    return c


def main():
    font=ImageFont.truetype('/usr/share/fonts/google-noto/NotoSans-Regular.ttf',11)
    title=ImageFont.truetype('/usr/share/fonts/google-noto/NotoSans-Regular.ttf',17)
    CW,RH,LEFT,TOP=82,82,105,104
    sheet=Image.new('RGB',(LEFT+16*CW+12,TOP+18*RH+20),'#fffaf1');d=ImageDraw.Draw(sheet)
    d.text((16,12),'Faz 8 · kulak / saç / şapka · 288 birleşim · 70 px kart',font=title,fill='#30251d')
    d.text((16,38),'6 yüz × 3 kulak × 4 saç × 4 şapka | Buğday ten, koyu kahve saç | Çevrimdışı Pillow; tarayıcı testi değildir.',font=font,fill='#5f5145')
    for j,hair_id in enumerate(HAIR):
        d.text((LEFT+j*4*CW+8,62),ITEM[hair_id]['name'],font=title,fill='#30251d')
        for k,label in enumerate(H_NAMES):d.text((LEFT+(j*4+k)*CW+7,86),label,font=font,fill='#57483a')
    measurements=[];max_diff=0;bad=0
    for si,shape in enumerate(SHAPES):
        for ei,ear in enumerate(EARS):
            row=si*3+ei;y=TOP+row*RH
            d.text((10,y+24),f'{shape}\n{ear}',font=font,fill='#49372a')
            for j,hair in enumerate(HAIR):
                ims=[compose(layer_list(shape,ear,hair,hat)) for hat in HATS]
                ref=np.array(ims[0]);local=[]
                for k,im in enumerate(ims):
                    arr=np.array(im)
                    # Entire cheek/jaw band, all columns: includes contour and neighboring hair.
                    diff=np.abs(arr[245:335].astype(int)-ref[245:335].astype(int))
                    n=int(np.any(diff>0,axis=2).sum());mx=int(diff.max());max_diff=max(max_diff,mx)
                    if n:bad+=1
                    local.append(n)
                    sheet.paste(card(im).convert('RGB'),(LEFT+(j*4+k)*CW+5,y+4))
                measurements.append(f'{shape}/{ear}/{hair}: şapkasız,kep,bere,kovboy değişen piksel={local}')
    sheet.save(OUT/'01-matris.png')
    summary=[
      'Bölüm 1 — çevrimdışı piksel kontrolü',
      '288 birleşim: 6 yüz × 3 kulak × 4 şapka × 4 saç. Görsel kartlar 70×70 px.',
      'Renkler manifestten: skin_wheat, hcolor_dark_brown, ccolor_blue; kep kırmızı, bere lacivert, kovboy kahverengi.',
      'Mevcut Avatar.tsx sırası, 190 px saç üst/alt ayrımı, sabit arka saç/dolgu, kapalı kulak seçimi, floorHat, afro kep uyarlaması ve render.ts ten boyama formülü izlenir.',
      'Ölçüm: 512×512 RGBA katmanlar birleştirildikten sonra, çıktı PNG kodlanmadan önce y=245..334 ve x=0..511 alanı şapkasız birleşimle karşılaştırıldı.',
      f'Sonuç: şapkalı 216 karşılaştırmada farklı alan sayısı={bad}; en büyük RGBA kanal farkı={max_diff}.',
      'Sınır: Pillow örnekleme/yuvarlama tarayıcı Canvas ile birebir eşdeğer sayılmaz. Bu ölçüm varlıkların ve izlenen katman kuralının değişmezliğini doğrular; gerçek 375×812 ve 1280×800 tarayıcı ekran görüntüsü değildir.',
      '',*measurements]
    (OUT/'01-olcum.txt').write_text('\n'.join(summary)+'\n')
    print('\n'.join(summary[:8]))
    if bad:raise SystemExit('FAIL: hat changes cheek/jaw pixels')

if __name__=='__main__':main()
