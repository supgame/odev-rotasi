// Katmanlı avatar çizici: ImageGen ile üretilmiş katmanları canvas'ta üst üste koyar, boyanabilir bölgeleri boyar.
// Boyama sözleşmesi (gelistirme/avatar_uretim/BRIEF.md ile birebir aynı):
//   lum = 0.2126R + 0.7152G + 0.0722B ; dyed = clamp(color * lum / ref) ; out = rgb*(1-m) + dyed*m   (m = maske/255)

export type Box = [x: number, y: number, width: number, height: number]

export interface Part {
  src: string // public/av altına göre yol
  mask?: string
  ref?: number
  color?: string // 'rrggbb'
  dx?: number // yatay kaydırma, 512 px ölçeğinde
  dy?: number
  scale?: number
  scaleY?: number
  clip?: string | string[] // pozun 640 px tuvalinde kesim çizgilerinin ortak alanı
  fabric?: { crop: Box; center: [number, number]; width: number; length: number; angle: number }
  sourceRows?: [number, number] // 512 px kaynak tuvalinde görünen dikey aralık
  sourceColumns?: [number, number] // aynı tuvalde görünen yatay aralık
  metallic?: boolean
  iris?: string
  stronger?: boolean
}

const BASE = `${import.meta.env?.BASE_URL ?? '/'}av/`
const imgs = new Map<string, Promise<HTMLImageElement>>()
function load(path: string): Promise<HTMLImageElement> {
  let p = imgs.get(path)
  if (!p) {
    p = new Promise((ok, no) => {
      const im = new Image()
      im.decoding = 'async'
      im.onload = () => ok(im)
      im.onerror = () => no(new Error('görsel yüklenemedi: ' + path))
      im.src = BASE + path
    })
    imgs.set(path, p)
  }
  return p
}

const hex = (h: string) => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]

function tinted(im: HTMLImageElement, mask: HTMLImageElement | null, part: Part, n: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = n
  const x = c.getContext('2d', { willReadFrequently: true })!
  let m: Uint8ClampedArray | undefined
  if (mask) {
    x.drawImage(mask, 0, 0, n, n)
    m = x.getImageData(0, 0, n, n).data
    x.clearRect(0, 0, n, n)
  }
  x.drawImage(im, 0, 0, n, n)
  const d = x.getImageData(0, 0, n, n)
  const p = d.data
  const [cr, cg, cb] = hex(part.color!)
  const iris = part.iris ? hex(part.iris) : null
  const k = 1 / Math.max(part.ref ?? 128, 1)
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3] === 0) continue
    const a = m ? m[i] / 255 : 1 // maske gri: R kanalı yeterli
    const row = Math.floor(i / 4 / n) / n
    const col = (i / 4 % n) / n
    if (iris && a < 0.08 && row > .36 && row < .49 && (col > .32 && col < .46 || col > .54 && col < .68)) {
      const [r, g, b] = [p[i], p[i + 1], p[i + 2]]
      // İrisin sıcak kahvesi; beyazları, siyah çizgiyi ve kalp/yıldız desenini koru.
      if (r > g * 1.25 && g > b * 1.17 && r > 44 && g < 154) {
        const light = Math.min(1.25, (r * .21 + g * .72 + b * .07) / 94)
        const mix = Math.min(1, (r - g) / 27)
        p[i] = r * (1 - mix) + iris[0] * light * mix
        p[i + 1] = g * (1 - mix) + iris[1] * light * mix
        p[i + 2] = b * (1 - mix) + iris[2] * light * mix
      }
    }
    if (a === 0) continue
    const shine = part.metallic ? Math.max(0, 1 - Math.abs(col + row * 0.45 - 0.83) * 15) : 0
    const l = (0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2]) * k
    p[i] = p[i] * (1 - a) + Math.min(255, cr * l) * a
    p[i + 1] = p[i + 1] * (1 - a) + Math.min(255, cg * l) * a
    p[i + 2] = p[i + 2] * (1 - a) + Math.min(255, cb * l) * a
    if (shine) {
      p[i] += (255 - p[i]) * shine * a * 0.8
      p[i + 1] += (246 - p[i + 1]) * shine * a * 0.8
      p[i + 2] += (192 - p[i + 2]) * shine * a * 0.8
    }
  }
  x.putImageData(d, 0, 0)
  return c
}

const done = new Map<string, string>()
const pending = new Map<string, Promise<string>>()

/** Katmanları sırayla birleştirip data URI döndürür (n = piksel kenar). Aynı istek tek kez çizilir. */
export function compose(parts: Part[], n: number): Promise<string> {
  const key = n + '|' + JSON.stringify(parts)
  const hit = done.get(key)
  if (hit) return Promise.resolve(hit)
  let p = pending.get(key)
  if (!p) {
    p = (async () => {
      const loaded = await Promise.all(parts.map(async (pt) => ({ pt, im: await load(pt.src), mk: pt.mask && pt.color ? await load(pt.mask) : null })))
      const c = document.createElement('canvas')
      c.width = c.height = n
      const x = c.getContext('2d')!
      x.imageSmoothingQuality = 'high'
      const dyes = new Map<string, HTMLCanvasElement>()
      for (const { pt, im, mk } of loaded) {
        const size = n * (pt.scale ?? 1)
        const height = pt.scaleY === undefined ? size : n * pt.scaleY
        const ox = (n - size) / 2 + ((pt.dx ?? 0) * n) / 512
        const oy = (n - height) / 2 + ((pt.dy ?? 0) * n) / 512
        let layer: CanvasImageSource = im
        if (pt.color) {
          const dyeKey = [pt.src, pt.mask, pt.ref, pt.color, pt.metallic, pt.iris].join('|')
          const dyed = dyes.get(dyeKey) ?? tinted(im, mk, pt, n)
          dyes.set(dyeKey, dyed)
          layer = dyed
        }
        const clipped = pt.clip || pt.sourceRows || pt.sourceColumns || pt.fabric
        if (clipped) x.save()
        for (const curve of typeof pt.clip === 'string' ? [pt.clip] : pt.clip ?? []) {
          const path = new Path2D()
          path.addPath(new Path2D(curve), new DOMMatrix().scale(n / 640))
          x.clip(path)
        }
        if (pt.sourceRows || pt.sourceColumns) {
          const [top, bottom] = pt.sourceRows ?? [0, 512]
          const [left, right] = pt.sourceColumns ?? [0, 512]
          x.beginPath()
          x.rect(ox + left * size / 512, oy + top * height / 512, (right - left) * size / 512, (bottom - top) * height / 512)
          x.clip()
        }
        if (pt.fabric) {
          const { crop: [left, top, w, h], center: [cx, cy], width, length, angle } = pt.fabric
          const sourcePixel = (pt.color ? n : im.naturalWidth) / 512
          x.scale(n / 640, n / 640)
          x.translate(cx, cy)
          x.rotate(angle * Math.PI / 180)
          x.drawImage(layer, left * sourcePixel, top * sourcePixel, w * sourcePixel, h * sourcePixel,
            -width / 2, -length / 2, width, length)
        } else {
          x.drawImage(layer, ox, oy, size, height)
          if (pt.stronger) x.drawImage(layer, ox, oy, size, height)
        }
        if (clipped) x.restore()
      }
      const uri = c.toDataURL('image/webp', 0.92)
      done.set(key, uri)
      pending.delete(key)
      return uri
    })()
    pending.set(key, p)
  }
  return p
}

/** Hazırsa hemen döndürür (ilk çizimde titreme olmasın). */
export const composed = (parts: Part[], n: number) => done.get(n + '|' + JSON.stringify(parts))
