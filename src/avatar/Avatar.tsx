// Avatar = ImageGen katmanları (saç arkası, temel, ifade, kıyafet, saç önü, şapka, gözlük) canvas'ta birleşir + yanında hayvan + arka plan.
// Şapka takılıyken saçın "şapka altı" katmanı kullanılır; tüm şapkalar ortak şapka bölgesine hizalı üretildi.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
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
const ONE = (id: string) => ITEMS.filter((i) => i.id === id)
const DEF: Partial<Record<ItemSlot, CatalogItem[]>> = {
  skin: FREE('skin'), hair: FREE('hair', ['hair_headscarf']), hcolor: FREE('hcolor'), clothes: FREE('clothes'), ccolor: FREE('ccolor'),
  fshape: FREE('fshape'), ears: [...ONE('ears_small'), ...ONE('ears_small'), ...ONE('ears_medium')], eyes: FREE('eyes'),
  cheek: [...ONE('cheek_none'), ...FREE('cheek')], pose: [...ONE('pose_side'), ...ONE('pose_side'), ...ONE('pose_shoulder'), ...ONE('pose_peek')],
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

const V = MANIFEST.variants
const NO_BLINK = ['face_wink', 'face_happy_closed']

/** Arkadaşın duruşu (pose_side | pose_shoulder | pose_peek | pose_head). */
export const poseOf = (eq: Equipped, seed: string) => (pick(eq, 'pose', seed)?.raw.key as string | undefined) ?? 'side'

function parts(eq: Equipped, seed: string, mood?: Mood, blink = false): Part[] {
  const skin = pick(eq, 'skin', seed)?.raw.color as string | undefined
  const hair = pick(eq, 'hair', seed)?.raw
  const hcol = pick(eq, 'hcolor', seed)?.raw.color as string | undefined
  const hat = pick(eq, 'hat', seed)?.raw
  const gl = pick(eq, 'glasses', seed)?.raw
  const cl = pick(eq, 'clothes', seed)?.raw
  const ccol = pick(eq, 'ccolor', seed)?.raw.color as string | undefined
  const faceIt = mood === 'happy' && HAPPY ? HAPPY : pick(eq, 'face', seed)
  const face = faceIt?.raw
  const shape = (pick(eq, 'fshape', seed)?.raw.key as string) ?? 'oval'
  const ears = (pick(eq, 'ears', seed)?.raw.key as string) ?? 'small'
  const eyes = pick(eq, 'eyes', seed)?.raw.color as string | undefined
  const cheek = pick(eq, 'cheek', seed)?.raw.key as string | undefined
  const b = MANIFEST.base
  const sub = (t: string) => t.replace('{shape}', shape).replace('{ears}', ears)
  const blinkOn = blink && !NO_BLINK.includes(faceIt?.id ?? '')
  const byKey: Record<string, Part | null> = {
    hairBack: part(hair, hat ? 'backUnderHat' : 'back', hcol),
    base: { src: V ? sub(V.base) : b.layer, mask: V ? sub(V.mask) : b.skinMask, ref: b.skinRef, color: skin },
    iris: V && eyes ? { src: V.iris.layer, mask: V.iris.mask, ref: V.iris.ref, color: eyes } : null,
    cheek: V && cheek && V.cheek[cheek] ? { src: V.cheek[cheek] } : null,
    face: part(face, null, skin),
    blink: V && blinkOn ? { src: V.blink.layer, mask: V.blink.mask, ref: V.blink.ref, color: skin } : null,
    clothes: part(cl, null, cl?.tintable === false ? undefined : ccol),
    hairFront: part(hair, hat ? 'frontUnderHat' : 'front', hcol),
    hat: part(hat, null, hat?.color),
    glasses: part(gl, null, gl?.color),
  }
  const order = MANIFEST.order.flatMap((k) => (k === 'base' ? ['base', 'iris', 'cheek'] : k === 'face' ? ['face', 'blink'] : [k]))
  return order.map((k) => byKey[k]).filter((p): p is Part => !!p && !!p.src)
}

/** Avatar görseli: hazırsa hemen, değilse çizilince. */
function useKid(eq: Equipped, seed: string, mood: Mood | undefined, px: number, blink = false, on = true) {
  const ps = on ? parts(eq, seed, mood, blink) : []
  const n = Math.min(512, Math.max(96, Math.ceil(px / 64) * 64))
  const key = n + JSON.stringify(ps)
  const [state, setState] = useState<{ key: string; uri?: string }>({ key, uri: composed(ps, n) })
  useEffect(() => {
    let live = true
    if (!ps.length) return
    compose(ps, n).then((uri) => live && setState({ key, uri })).catch(() => {})
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  if (!ps.length) return undefined
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

export function Avatar({ animal, equipped, seed, size = 96, bounce = false, look, mood, frame = true, pet, alive }: {
  animal: string; equipped?: Equipped; seed?: string; size?: number; bounce?: boolean; look?: Look; mood?: Mood; frame?: boolean
  /** Yanında hayvanı göster (varsayılan: çerçeveli ve yeterince büyükse). */ pet?: boolean
  /** Nefes + göz kırpma (varsayılan: büyük avatarlarda; listelerde kapalı kalır). */ alive?: boolean
}) {
  const eq = equipped ?? {}
  const sd = seed ?? animal
  const tilt = look ? `rotate(${look.x * 6}deg) translateY(${look.y * 2}%)` : undefined
  const showPet = pet ?? (frame && size >= 56)
  const p = showPet ? petOf(animal, eq) : null
  const pose = poseOf(eq, sd)
  const live = alive ?? size >= 100
  const dpr = typeof devicePixelRatio === 'number' ? Math.min(devicePixelRatio, 3) : 2
  const px = (frame ? 1.6 : 1) * size * dpr
  const uri = useKid(eq, sd, mood, px)
  const blinkUri = useKid(eq, sd, mood, px, true, live)
  const [tap, setTap] = useState(0)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const poke = () => {
    setTap((t) => t + 1)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setTap(0), 900)
  }
  const h = hash(sd)
  const kidStyle: CSSProperties | undefined = frame ? { top: (UP - 0.3) * size, left: -0.3 * size, width: 1.6 * size } : undefined
  const petImg = p && <img key={'pet' + (tap ? 'x' + tap : '')} className={'av-pet pose-' + pose} src={fx(p.id)} alt={p.name} title={p.name} draggable={false} />
  const cls = ['avatar', frame ? '' : 'bare', bounce ? 'bounce' : '', mood === 'happy' ? 'happy' : '', live ? 'alive' : '', tap ? 'tap' : ''].filter(Boolean).join(' ')
  return (
    <div className={cls} style={{ width: size, height: size, ['--blink-delay' as string]: `-${h % 4000}ms`, ['--breath-delay' as string]: `-${(h >> 8) % 3000}ms` }} onPointerDown={poke}>
      {frame && <div className="av-bg" style={{ background: BG[eq.bg ?? 'none'] ?? BG.none }} />}
      <div className={frame ? 'av-clip' : 'av-free'} style={frame ? clipStyle(size) : undefined}>
        <div className="av-stage" style={{ transform: tilt }}>
          {pose === 'peek' && petImg}
          <div className="av-body" key={tap ? 'b' + tap : 'b'}>
            {uri && <img className="av-kid" src={uri} alt="" draggable={false} style={kidStyle} />}
            {live && blinkUri && <img className="av-kid av-blink" src={blinkUri} alt="" draggable={false} style={kidStyle} />}
          </div>
        </div>
      </div>
      {pose !== 'peek' && petImg}
      {tap > 0 && <span className="av-hearts" key={'h' + tap} aria-hidden><i>💖</i><i>✨</i><i>💛</i></span>}
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
  if (slot === 'hair' || slot === 'ears' || slot === 'fshape') eq.hat = undefined // saç/kulak görünsün diye şapkayı çıkar
  if (slot === 'ears') eq.hair = 'hair_short' // uzun saç kulağı örtmesin
  if (slot === 'pose') return <Avatar animal={animal} equipped={eq} seed={seed} size={84} pet alive={false} />
  if (slot === 'clothes' || slot === 'ccolor')
    return <div className="pet-preview body"><Avatar animal={animal} equipped={{ ...eq, hat: undefined }} seed={seed} size={150} frame={false} pet={false} alive={false} /></div>
  return <Avatar animal={animal} equipped={eq} seed={seed} size={84} pet={false} alive={false} />
}
