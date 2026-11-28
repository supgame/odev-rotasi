"""Package registered face sprites from the phase-eight ImageGen atlas."""
from pathlib import Path
import json
import argparse
import numpy as np
from PIL import Image, ImageDraw
from scipy.spatial import ConvexHull
from scipy import ndimage as ndi

ROOT=Path.cwd()
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--atlas', type=Path, default=ROOT/'gelistirme/avatar_uretim/kaynak/imagegen/faz8/features_atlas.png')
parser.add_argument('--out', type=Path, default=ROOT/'public/av/features')
parser.add_argument('--contact', type=Path, default=ROOT/'gelistirme/faz8_kontrol/yuz_ozellikleri_kaynak.png')
args=parser.parse_args()
OUT=args.out;OUT.mkdir(parents=True,exist_ok=True)
ATLAS=Image.open(args.atlas).convert('RGBA')
NAMES=('round','almond','gentle','bright','upturn')
HEIGHTS=(38,30,29,42,25)


def clean(im):
    a=np.array(im).copy()
    # Discard only the low-opacity ambient glow, retaining sprite antialiasing.
    a[:,:,3]=np.rint(np.clip((a[:,:,3].astype(float)-30)/210,0,1)*255).astype('uint8')
    a[a[:,:,3]==0,:3]=0
    return Image.fromarray(a)


def pair(row,col,width,height,y):
    layer=Image.new('RGBA',(512,512))
    for side,cx in enumerate((204,309)):
        tile=clean(ATLAS.crop((col*512+side*256,row*205,col*512+(side+1)*256,min(1024,(row+1)*205))))
        # Crop on a useful alpha threshold so the faint outer glow cannot set
        # registration. A small pad preserves the tapered lash tips.
        alpha=np.array(tile)[:,:,3];yy,xx=np.where(alpha>100)
        box=(max(0,int(xx.min())-3),max(0,int(yy.min())-3),min(256,int(xx.max())+4),min(tile.height,int(yy.max())+4))
        tile=tile.crop(box).resize((width,height),Image.Resampling.LANCZOS)
        layer.alpha_composite(tile,(cx-width//2,y-height//2))
    return layer


def save(name,im):
    im.save(OUT/(name+'.webp'),'WEBP',lossless=True)

refs={}
for row,(name,height) in enumerate(zip(NAMES,HEIGHTS)):
    eye=pair(row,0,64,height,217)
    save('eshape_'+name,eye)
    closed=pair(row,1,64,12,220)
    save('eshape_'+name+'_closed',closed)
    a=np.array(eye).astype(float);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
    y,x=np.mgrid[:512,:512]
    color=(r>g*1.2)&(g>b*1.2)&(r>78)&(g>30)&(g<155)&(a[:,:,3]>100)
    # The iris has warm pigment; the outline, pupil and catchlights stay intact.
    color &= ((x-207)**2/23**2+(y-219)**2/(height*.48)**2<1)|((x-306)**2/23**2+(y-219)**2/(height*.48)**2<1)
    mask=np.zeros((512,512),np.uint8);mask[color]=255
    save('eshape_'+name+'_mask',Image.fromarray(mask).convert('RGB'))
    lum=r*.2126+g*.7152+b*.0722
    refs[name]=round(float(lum[color].mean()),4)
    # Keep the printed outline fixed while the whole aperture interior (white,
    # iris, pupil and highlights) follows gaze. Moving the full interior avoids
    # leaving a residual iris ring in the fixed image.
    interior=np.zeros((512,512),bool)
    seed=(a[:,:,3]>150)&(lum>55)&(r>85)
    for side in (0,1):
        region=seed.copy();region[:,:256] &= side==0;region[:,256:] &= side==1
        sy,sx=np.where(region)
        points=np.column_stack((sx,sy))
        hull=ConvexHull(points)
        plane=Image.new('L',(512,512));ImageDraw.Draw(plane).polygon([tuple(map(int,p)) for p in points[hull.vertices]],fill=255)
        interior |= np.array(plane)>0
    aperture=ndi.gaussian_filter(interior.astype(float),.45)
    empty=np.array(eye).astype(float)
    white=np.array([248,241,228.])
    empty[:,:,:3]=empty[:,:,:3]*(1-aperture[:,:,None])+white*aperture[:,:,None]
    moving=np.array(eye).copy()
    moving[:,:,3]=np.rint(moving[:,:,3]*aperture).astype('uint8')
    save('eshape_'+name+'_empty',Image.fromarray(np.rint(empty).astype('uint8')))
    save('eshape_'+name+'_iris',Image.fromarray(moving))
    opening=Image.new('RGBA',(512,512),'white');opening.putalpha(Image.fromarray(np.rint(aperture*255).astype('uint8')))
    save('eshape_'+name+'_open',opening)
for row,name,height in [(0,'soft',14),(1,'straight',10),(2,'bold',17)]:
    save('brow_'+name,pair(row,2,62,height,177))
# Classic retains the soft arch; the older default ID remains valid.
save('brow_classic',pair(0,2,60,13,177))
for row,name,width,height in [(3,'button',25,20),(3,'wide',32,19),(4,'straight',21,24),(3,'classic',24,18)]:
    tile=clean(ATLAS.crop((1024,row*205,1536,min(1024,(row+1)*205))))
    a=np.array(tile); yy,xx=np.where(a[:,:,3]>110)
    tile=tile.crop((int(xx.min())-3,int(yy.min())-3,int(xx.max())+4,int(yy.max())+4)).resize((width,height),Image.Resampling.LANCZOS)
    layer=Image.new('RGBA',(512,512));layer.alpha_composite(tile,(256-width//2,246-height//2))
    # Match base luminance so dyeing uses the existing skin palette naturally.
    pix=np.array(layer).astype(float);lum=pix[:,:,:3]@[.2126,.7152,.0722]
    pix[:,:,:3]=np.minimum(255,lum[:,:,None]/190*163.7334)
    save('nose_'+name,Image.fromarray(np.rint(pix).astype('uint8')))
(OUT/'refs.json').write_text(json.dumps(refs,indent=2))
print(refs)
# Contact sheet shows the actual registered 512px layers at card size.
base=Image.open(ROOT/'public/av/base/base_oval_small.webp').convert('RGBA')
clear=Image.open(ROOT/'public/av/features/clear_eyes.webp').convert('RGBA')
can=Image.new('RGBA',(5*256,512),'#eadfcd')
for col,name in enumerate(NAMES):
    for row,suffix in enumerate(('', '_closed')):
        child=base.copy();child.alpha_composite(clear);child.alpha_composite(Image.open(OUT/('eshape_'+name+suffix+'.webp')).convert('RGBA'))
        can.alpha_composite(child.resize((256,256)),(col*256,row*256))
args.contact.parent.mkdir(parents=True,exist_ok=True)
can.convert('RGB').save(args.contact)
