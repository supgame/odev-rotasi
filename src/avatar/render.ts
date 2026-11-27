// Katmanlı avatar çizici: ImageGen ile üretilmiş katmanları canvas'ta üst üste koyar, boyanabilir bölgeleri boyar.
// Boyama sözleşmesi (gelistirme/avatar_uretim/BRIEF.md ile birebir aynı):
//   lum = 0.2126R + 0.7152G + 0.0722B ; dyed = clamp(color * lum / ref) ; out = rgb*(1-m) + dyed*m   (m = maske/255)

export interface Part {
  src: string // public/av altına göre yol
  mask?: string
  ref?: number
  color?: string // 'rrggbb'
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

function tinted(im: HTMLImageElement, mask: HTMLImageElement, ref: number, color: string, n: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = n
  const x = c.getContext('2d', { willReadFrequently: true })!
  x.drawImage(mask, 0, 0, n, n)
  const m = x.getImageData(0, 0, n, n).data
  x.clearRect(0, 0, n, n)
  x.drawImage(im, 0, 0, n, n)
  const d = x.getImageData(0, 0, n, n)
  const p = d.data
  const [cr, cg, cb] = hex(color)
  const k = 1 / Math.max(ref, 1)
  for (let i = 0; i < p.length; i += 4) {
    const a = m[i] / 255 // maske gri: R kanalı yeterli
    if (a === 0 || p[i + 3] === 0) continue
    const l = (0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2]) * k
    p[i] = p[i] * (1 - a) + Math.min(255, cr * l) * a
    p[i + 1] = p[i + 1] * (1 - a) + Math.min(255, cg * l) * a
    p[i + 2] = p[i + 2] * (1 - a) + Math.min(255, cb * l) * a
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
      for (const { pt, im, mk } of loaded) {
        if (mk) x.drawImage(tinted(im, mk, pt.ref ?? 128, pt.color!, n), 0, 0)
        else x.drawImage(im, 0, 0, n, n)
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
