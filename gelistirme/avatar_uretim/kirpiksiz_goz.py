# Kullanım: python3 kirpiksiz_goz.py public/av/features <round|almond> public/av/features 5 1
# Kirpiksiz göz: açıklık maskesinin biraz genişletilmişi dışında kalan (kirpik) pikselleri siler;
# dış köşedeki kirpik uçları için her gözü açıklığın yatay sınırına kırpar.
import sys
from PIL import Image, ImageFilter, ImageChops, ImageDraw
d, shape, out = sys.argv[1:4]
grow, side = int(sys.argv[4]), int(sys.argv[5])
op = Image.open(f'{d}/eshape_{shape}_open.webp').split()[-1].point(lambda v: 255 if v > 20 else 0)
boxes = [op.crop((0, 0, 256, 512)).getbbox(), op.crop((256, 0, 512, 512)).getbbox()]
boxes[1] = (boxes[1][0] + 256, boxes[1][1], boxes[1][2] + 256, boxes[1][3])
lim = Image.new('L', op.size, 0)
dr = ImageDraw.Draw(lim)
for (x0, y0, x1, y1) in boxes:
    dr.rectangle((x0 - side, 0, x1 + side, 511), fill=255)
lim = lim.filter(ImageFilter.GaussianBlur(1.5))
keep = ImageChops.multiply(op.filter(ImageFilter.MaxFilter(grow)).filter(ImageFilter.GaussianBlur(1.2)), lim)
def cut(src, dst, mask):
    im = Image.open(src).convert('RGBA'); r, g, b, a = im.split()
    Image.merge('RGBA', (r, g, b, ImageChops.multiply(a, mask))).save(dst, lossless=True)
for suf in ['', '_empty']:
    cut(f'{d}/eshape_{shape}{suf}.webp', f'{out}/eshape_{shape}_plain{suf}.webp', keep)
cl = Image.new('L', op.size, 0); dr = ImageDraw.Draw(cl)
for (x0, y0, x1, y1) in boxes:
    dr.rectangle((x0 + 1, y0 + 6, x1 - 1, 511), fill=255)
cut(f'{d}/eshape_{shape}_closed.webp', f'{out}/eshape_{shape}_plain_closed.webp', cl.filter(ImageFilter.GaussianBlur(1.5)))
