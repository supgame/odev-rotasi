"""İki pilotun 512 px gövdelerini, malzeme/örtüşme maskelerini ve manifestini paketle."""
from pathlib import Path
from statistics import median
import json

from PIL import Image, ImageChops, ImageDraw, ImageFilter
from v2_hayvan import pack_pet

HERE = Path(__file__).resolve().parent
SOURCE = HERE / 'kaynak/v2'
OUT = HERE.parents[1] / 'public/av/pose/v2'
SIZE = (512, 512)

# Orijinal ImageGen PNG'sinden sahneye ölçek ve sol üst ofset.
# Hayvan kutusu 512 px sahnede (x, y, genişlik, yükseklik).
LAYOUT = {
    'palm-tshirt': (.35, -26, 201, (378, 276, 108, 143)),
    'palm-hoodie': (.35, -26, 219, (372, 276, 108, 143)),
    'cradle-tshirt': (.308, 44, 201, (208, 236, 192, 234)),
    'cradle-hoodie': (.308, 47, 208, (208, 236, 192, 234)),
}

# Avuç çizgisi ve öne kıvrılan parmaklar. Noktalar özgün PNG'nin pikselleri.
PALM_EDGE = {
    'tshirt': [(1155,676),(1190,636),(1220,618),(1248,608),(1275,607),
               (1304,613),(1333,626),(1350,634),(1373,626),(1397,622),
               (1421,601),(1441,585),(1456,578),(1480,577),(1500,580)],
    'hoodie': [(1135,635),(1165,575),(1193,553),(1217,546),(1242,548),
               (1265,552),(1292,566),(1314,580),(1337,574),(1361,571),
               (1383,548),(1406,532),(1426,527),(1452,525),(1470,528)],
}

# Önkol ile mavi gövdenin paylaştığı sınır. Tişörtte deri/rengi segmentasyonu
# diğer bütün parmak kıvrımlarını asıl çizimin yumuşak kenarından alır.
HOODIE_FOREARM = [(181,818),(231,794),(278,782),(315,778),(345,779),
                   (373,785),(399,797),(424,809),(446,804),(461,805),
                   (485,818),(510,840),(582,843),(600,858),(628,880),
                   (625,944),(580,961),(500,986),(400,1010),(260,1020),
                   (175,967)]
HOODIE_OTHER_CUFF = [(885,737),(910,717),(930,700),(947,660),(959,655),
                      (994,675),(1037,686),(1100,725),(1142,790),(1150,955),
                      (1063,1000),(958,998),(904,944),(889,853),(889,806),
                      (866,780)]


def mask_for_front(body, skin, pose, garment):
    mask = Image.new('L', body.size)
    draw = ImageDraw.Draw(mask)
    if pose == 'palm':
        edge = PALM_EDGE[garment]
        draw.polygon([*edge, (edge[-1][0], 740), (edge[0][0], 740)], fill=255)
    else:
        # Kumaşın üstündeki sıcak ten ve parmak konturu. Boyun bu kutunun dışında.
        skin_or_line = skin.filter(ImageFilter.MaxFilter(9))
        mask.paste(skin_or_line.crop((0, 536, body.width, body.height)), (0, 536))
        if garment == 'hoodie':
            draw.polygon(HOODIE_FOREARM, fill=255)
            draw.polygon(HOODIE_OTHER_CUFF, fill=255)
    return mask


def materials(im):
    color = im.copy()
    al = im.getchannel('A').point(lambda a: 0 if a <= 3 else a)
    color.putalpha(al)
    skin = Image.new('L', im.size)
    cloth = Image.new('L', im.size)
    # Cilt turuncu, kumaş arduvaz mavisi. En koyu dış çizgiye boya karışmaz.
    skin_values = bytearray()
    cloth_values = bytearray()
    skin_lights, cloth_lights = [], []
    gray = bytearray()
    for r, g, b, a in color.getdata():
        lum = round(.2126*r + .7152*g + .0722*b)
        warm = max(0, min(1, (r-b-4)/20))
        strength = max(0, min(1, (lum-27)/27)) if a else 0
        skin_values.append(round(255 * strength * warm))
        cloth_values.append(round(255 * strength * (1-warm)))
        gray.append(lum)
        if a > 248 and strength == 1:
            if warm == 1:
                skin_lights.append(lum)
            if warm == 0:
                cloth_lights.append(lum)
    skin.frombytes(bytes(skin_values))
    cloth.frombytes(bytes(cloth_values))
    luminance = Image.frombytes('L', im.size, bytes(gray))
    neutral = Image.merge('RGBA', (luminance, luminance, luminance, al))
    # Düşük ışıklardaki sıcak konturu koru.
    result = Image.composite(neutral, color, ImageChops.add(skin, cloth))
    return result, skin, cloth, median(skin_lights), median(cloth_lights)


def register(im, scale, x, y):
    w, h = im.size
    fitted = im.resize((round(w*scale), round(h*scale)), Image.Resampling.LANCZOS)
    result = Image.new(im.mode, SIZE)
    result.paste(fitted, (x, y))
    return result


def save_layer(im, stem, suffix):
    name = f'{stem}-{suffix}.webp'
    im.save(OUT / name, lossless=True, method=6)
    return 'pose/v2/' + name


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    poses = []
    for pose, animal, pose_id, dx, label, reply in [
        ('palm', 'chick', 'side', -58, 'Civcive dokun', 'Cik!'),
        ('cradle', 'rabbit', 'hug', -20, 'Tavşanın burnuna dokun', 'Pıt pıt!'),
    ]:
        scene = dict(animal=animal, pose=pose_id, name=pose,
                     head=dict(scale=1.18, dx=dx, dy=-30, clip='M0 0H640V405H0Z'),
                     garments={})
        for garment in ('tshirt', 'hoodie'):
            stem = f'{pose}-{garment}'
            scale, x, y, rect = LAYOUT[stem]
            art = Image.open(SOURCE / (stem+'.png')).convert('RGBA')
            body, skin, cloth, sr, cr = materials(art)
            front_mask = mask_for_front(art, skin, pose, garment)
            front = body.copy()
            front.putalpha(ImageChops.multiply(body.getchannel('A'), front_mask))
            body, skin, cloth, front = (register(i, scale, x, y) for i in (body, skin, cloth, front))
            pet = pack_pet(animal, stem, rect)
            if pose == 'palm':
                # Ağırlık gölgesi doğrudan avuca düşer, ön parmak gölgeyi örter.
                left, top, width, height = pet['rect']
                foot_y = top + height - 3
                shadow = Image.new('L', SIZE)
                d = ImageDraw.Draw(shadow)
                d.ellipse((left+width*.24, foot_y-2, left+width*.81, foot_y+2), fill=84)
                shadow = shadow.filter(ImageFilter.GaussianBlur(1.2))
                shadow = ImageChops.multiply(shadow, skin)
                shade = Image.new('RGBA', SIZE, (52, 43, 40, 255))
                body = Image.composite(shade, body, shadow)
            reaction = dict(type=pet['detailMotion'], pivot=pet['pivot'], label=label, reply=reply)
            # Malzeme koordinatları ortaktır; boş önde alfa zaten sıfırdır.
            art = dict(body=save_layer(body, stem, 'body'),
                       skinMask=save_layer(skin, stem, 'skin-mask'),
                       clothMask=save_layer(cloth, stem, 'cloth-mask'),
                       skinRef=sr, clothRef=cr, front=save_layer(front, stem, 'front'),
                       pet=pet['pet'], detail=pet['detail'], petRect=pet['rect'])
            art.update(frontSkinMask=art['skinMask'], frontClothMask=art['clothMask'])
            if 'reaction' not in scene:
                scene['reaction'] = reaction
            elif reaction != scene['reaction']:
                art['reaction'] = reaction
            scene['garments']['clothes_'+garment] = art
        poses.append(scene)
    (OUT / 'manifest.json').write_text(json.dumps({'poses': poses}, ensure_ascii=False, indent=2)+'\n')


if __name__ == '__main__':
    build()
