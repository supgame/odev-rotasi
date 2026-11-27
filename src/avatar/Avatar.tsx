// Avatar = ImageGen katmanları (saç arkası, temel, ifade, kıyafet, saç önü, şapka, gözlük) canvas'ta birleşir + yanında hayvan + arka plan.
// Şapka takılıyken saçın "şapka altı" katmanı kullanılır; tüm şapkalar ortak şapka bölgesine hizalı üretildi.
import { useEffect, useState, type CSSProperties } from 'react'
import type { Equipped } from '../data/types'
import { BG } from './bg'
import { ITEMS, MANIFEST, SPECIES, fx, type CatalogItem, type ItemSlot, type Raw, type Species } from './catalog'
import { compose, composed, type Part } from './render'

export type Mood = 'idle' | 'happy'
export interface Look { x: number; y: number } // -1..1

const BY_ID = new Map(SPECIES.map((s) => [s.id, s]))
const BY_EMOJI = new Map<string, Species>()
for (const s of SPECIES) if (!BY_EMOJI.has(s.emoji)) BY_EMOJI.set(s.emoji, s)
const ITEM = new Map(ITEMS.map((i) => [i.id, i]))

/** Öğretmenin verdiği hayvan (tür id'si ya da eski emoji). */
export function speciesOf(animal: string): Species {
  return BY_ID.get(animal) || BY_EMOJI.get(animal) || SPECIES[0]
}
/** Yanındaki hayvan: taktığı arkadaş, yoksa öğretmenin verdiği. */
export function petOf(animal: string, eq?: Equipped): Species {
  const p = eq?.pet?.replace(/^pet_/, '')
  return (p && BY_ID.get(p)) || speciesOf(animal)
}

// Takılmamış yuvalar için öğrenciye özgü (seed'den) bedava varsayılanlar: herkes ilk gün farklı görünsün.
const FREE = (slot: ItemSlot, skip: string[] = []) => ITEMS.filter((i) => i.slot === slot && i.price === 0 && !skip.includes(i.id))
const DEF: Partial<Record<ItemSlot, CatalogItem[]>> = {
  skin: FREE('skin'), hair: FREE('hair', ['hair_headscarf']), hcolor: FREE('hcolor'), clothes: FREE('clothes'), ccolor: FREE('ccolor'),
}
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}
function pick(eq: Equipped, slot: ItemSlot, seed: string): CatalogItem | undefined {
  const it = eq[slot] ? ITEM.get(eq[slot]!) : undefined
  if (it && it.slot === slot) return it // katalogdan kalkmış eski eşya sayılmaz
  const list = DEF[slot]
  return list?.length ? list[hash(seed + slot) % list.length] : undefined
}

/** Yuvada şu an görünen eşya id'si (takılı ya da varsayılan). */
export const currentId = (eq: Equipped, slot: ItemSlot, seed: string) => pick(eq, slot, seed)?.id

export const skinColor = (eq: Equipped, seed: string) => '#' + (pick(eq, 'skin', seed)?.raw.color ?? 'e0ac80')

// Manifest alanları eşyadan eşyaya biraz farklı olabilir: layer | layers[k], mask (yol ya da {k: yol}), ref (sayı ya da {k: sayı}).
const at = (v: unknown, k: string) => (v && typeof v === 'object' ? (v as Record<string, unknown>)[k] : v)
function part(r: Raw | undefined, k: string | null, color?: string): Part | null {
  if (!r) return null
  const src = (k ? at(r.layers, k) : r.layer) as string | undefined
  if (!src) return null
  const mask = (k ? at(r.mask, k) : r.mask) as string | undefined
  const ref = (k ? at(r.ref, k) : r.ref) as number | undefined
  return mask && color ? { src, mask, ref, color } : { src }
}

/** Mutluyken kullanılacak ifade (varsa). */
const HAPPY = ITEMS.find((i) => i.id === 'face_bigsmile' || i.id === 'face_grin')

function parts(eq: Equipped, seed: string, mood?: Mood): Part[] {
  const skin = pick(eq, 'skin', seed)?.raw.color as string | undefined
  const hair = pick(eq, 'hair', seed)?.raw
  const hcol = pick(eq, 'hcolor', seed)?.raw.color as string | undefined
  const hat = pick(eq, 'hat', seed)?.raw
  const gl = pick(eq, 'glasses', seed)?.raw
  const cl = pick(eq, 'clothes', seed)?.raw
  const ccol = pick(eq, 'ccolor', seed)?.raw.color as string | undefined
  const face = (mood === 'happy' && HAPPY ? HAPPY : pick(eq, 'face', seed))?.raw
  const b = MANIFEST.base
  const byKey: Record<string, Part | null> = {
    hairBack: part(hair, hat ? 'backUnderHat' : 'back', hcol),
    base: { src: b.layer, mask: b.skinMask, ref: b.skinRef, color: skin },
    face: part(face, null, skin),
    clothes: part(cl, null, cl?.tintable === false ? undefined : ccol),
    hairFront: part(hair, hat ? 'frontUnderHat' : 'front', hcol),
    hat: part(hat, null, hat?.color),
    glasses: part(gl, null, gl?.color),
  }
  return MANIFEST.order.map((k) => byKey[k]).filter((p): p is Part => !!p && !!p.src)
}

/** Avatar görseli: hazırsa hemen, değilse çizilince. */
function useKid(eq: Equipped, seed: string, mood: Mood | undefined, px: number) {
  const ps = parts(eq, seed, mood)
  const n = Math.min(512, Math.max(96, Math.ceil(px / 64) * 64))
  const key = n + JSON.stringify(ps)
  const [state, setState] = useState<{ key: string; uri?: string }>({ key, uri: composed(ps, n) })
  useEffect(() => {
    let live = true
    compose(ps, n).then((uri) => live && setState({ key, uri })).catch(() => {})
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return state.key === key ? state.uri ?? composed(ps, n) : composed(ps, n) ?? state.uri
}

/** Kart kenarından bakarken (çerçevesiz avatar): görselin ne kadarı kartın üstünde kalsın. */
export function peekMetrics(size: number) {
  return { offset: Math.round(0.66 * size), room: Math.round(0.56 * size) }
}

// Çerçeve: alt yarı dairenin içinde kalır, kafa ve şapka dairenin üstünden taşabilir (profil rozeti gibi).
const UP = 0.24 // kutunun üstünde kafaya/şapkaya ayrılan pay (boyuta oranı)
function clipStyle(size: number): CSSProperties {
  const cy = UP * size + size / 2, r = size / 2 - 3
  const m = `radial-gradient(circle at 50% ${cy}px, #000 ${r}px, transparent ${r + 1}px), linear-gradient(#000 ${cy}px, transparent ${cy}px)`
  return { top: -UP * size, height: (1 + UP) * size, maskImage: m, WebkitMaskImage: m }
}

export function Avatar({ animal, equipped, seed, size = 96, bounce = false, look, mood, frame = true, pet }: {
  animal: string; equipped?: Equipped; seed?: string; size?: number; bounce?: boolean; look?: Look; mood?: Mood; frame?: boolean
  /** Yanında hayvanı göster (varsayılan: çerçeveli ve yeterince büyükse). */ pet?: boolean
}) {
  const eq = equipped ?? {}
  const sd = seed ?? animal
  const tilt = look ? `rotate(${look.x * 6}deg) translateY(${look.y * 2}%)` : undefined
  const showPet = pet ?? (frame && size >= 56)
  const p = showPet ? petOf(animal, eq) : null
  const dpr = typeof devicePixelRatio === 'number' ? Math.min(devicePixelRatio, 3) : 2
  const uri = useKid(eq, sd, mood, (frame ? 1.6 : 1) * size * dpr)
  return (
    <div className={'avatar' + (frame ? '' : ' bare') + (bounce ? ' bounce' : '') + (mood === 'happy' ? ' happy' : '')} style={{ width: size, height: size }}>
      {frame && <div className="av-bg" style={{ background: BG[eq.bg ?? 'none'] ?? BG.none }} />}
      <div className={frame ? 'av-clip' : 'av-free'} style={frame ? clipStyle(size) : undefined}>
        <div className="av-stage" style={{ transform: tilt }}>
          {uri && <img className="av-kid" src={uri} alt="" draggable={false} style={frame ? { top: (UP - 0.3) * size, left: -0.3 * size, width: 1.6 * size } : undefined} />}
        </div>
      </div>
      {p && <img className="av-pet" src={fx(p.id)} alt={p.name} title={p.name} draggable={false} />}
    </div>
  )
}

/** Dükkanda tek eşyanın önizlemesi: öğrencinin şu anki hâli + o eşya. Hayvanlar tek başına büyük gösterilir. */
export function ItemPreview({ id, slot, animal, equipped, seed }: { id: string; slot: string; animal: string; equipped: Equipped; seed: string }) {
  if (slot === 'pet') {
    const sp = BY_ID.get(id.replace(/^pet_/, '')) ?? SPECIES[0]
    return <div className="pet-preview"><img src={fx(sp.id)} alt="" /></div>
  }
  const eq: Equipped = { ...equipped, [slot]: id }
  if (slot === 'hair') eq.hat = undefined // saç görünsün diye şapkayı çıkar
  if (slot === 'clothes' || slot === 'ccolor')
    return <div className="pet-preview body"><Avatar animal={animal} equipped={{ ...eq, hat: undefined }} seed={seed} size={150} frame={false} pet={false} /></div>
  return <Avatar animal={animal} equipped={eq} seed={seed} size={84} pet={false} />
}
