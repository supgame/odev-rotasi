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

/** Arkadaşın duruşu (side | shoulder | peek | head | hug). */
export const poseOf = (eq: Equipped, seed: string) => {
  const k = (pick(eq, 'pose', seed)?.raw.key as string | undefined) ?? 'side'
  return k === 'hug' && !V?.hands ? 'side' : k
}

interface Layers { all: Part[]; lower: Part[]; iris: Part[]; blink: Part[]; upper: Part[]; moving: boolean; skin?: string }

/** Katmanları sıraya koyar. Canlı avatar için ayrıca: alt (gözler boş), kayan iris, kırpma, üst (kıyafet, saç önü, şapka, gözlük). */
function layers(eq: Equipped, seed: string, mood?: Mood): Layers {
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
  const back = part(hair, hat ? 'backUnderHat' : 'back', hcol)
  const dx = V?.hairBackDx?.[shape] ?? 0 // dar yüzde at kuyruğu yanağa yaklaşsın
  const moving = !!V?.eyes && !V.eyes.ownEyes.includes(faceIt?.id ?? '')
  const P = (x: Part | null | undefined) => (x && x.src ? [x] : [])
  const lowerBase = [
    ...P(back && dx ? { ...back, dx } : back),
    ...P(part(hair, hat ? 'fillUnderHat' : 'fill', hcol)), // yüzün arkasındaki saç (dar yüzde boşluk kalmasın)
    { src: V ? sub(V.base) : b.layer, mask: V ? sub(V.mask) : b.skinMask, ref: b.skinRef, color: skin },
    ...P(V && eyes ? { src: V.iris.layer, mask: V.iris.mask, ref: V.iris.ref, color: eyes } : null),
  ]
  const mid = [...P(V && cheek && V.cheek[cheek] ? { src: V.cheek[cheek] } : null), ...P(part(face, null, skin))]
  const upper = [
    ...P(part(cl, null, cl?.tintable === false ? undefined : ccol)),
    ...P(part(hair, hat ? 'frontUnderHat' : 'front', hcol)),
    ...P(part(hat, null, hat?.color)),
    ...P(part(gl, null, gl?.color)),
  ]
  const ir = V?.eyes?.iris
  return {
    all: [...lowerBase, ...mid, ...upper],
    lower: moving && V.eyes ? [...lowerBase, { src: V.eyes.layer }, ...mid] : [...lowerBase, ...mid],
    iris: moving && ir ? [eyes ? { src: ir.layer, mask: ir.mask, ref: ir.ref, color: eyes } : { src: ir.layer }] : [],
    blink: V && !NO_BLINK.includes(faceIt?.id ?? '') ? [{ src: V.blink.layer, mask: V.blink.mask, ref: V.blink.ref, color: skin }] : [],
    upper,
    moving,
    skin,
  }
}

/** Katman listesini birleştirip görsel döndürür: hazırsa hemen, değilse çizilince. */
function useComp(ps: Part[], px: number) {
  const n = Math.min(512, Math.max(96, Math.ceil(px / 64) * 64))
  const key = ps.length ? n + JSON.stringify(ps) : ''
  const [state, setState] = useState<{ key: string; uri?: string }>({ key, uri: ps.length ? composed(ps, n) : undefined })
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

// Arkadaşın sahnedeki yeri (boyuta oranla; çerçeve içindeyse kırpma kutusuna göre, kutu = size x 1.24 size).
// kid: çocuğun yana kayması (arkadaşa yer açılsın). gaze: çocuğun arkadaşa bakarken gözünün yönü.
const POSES: Record<string, { left: number; top: number; w: number; inClip: boolean; kid: number; gaze: number; ey: number }> = {
  side: { left: -0.06, top: 0.7, w: 0.56, inClip: true, kid: 0.09, gaze: -1, ey: 0.4 },
  shoulder: { left: 0.6, top: 0.62, w: 0.36, inClip: true, kid: -0.04, gaze: 1, ey: 0.1 },
  peek: { left: 0.56, top: 0.5, w: 0.42, inClip: true, kid: -0.03, gaze: 1, ey: 0 },
  hug: { left: 0.26, top: 0.74, w: 0.48, inClip: true, kid: 0, gaze: 0, ey: 1 },
  head: { left: 0.32, top: -0.34, w: 0.36, inClip: false, kid: 0, gaze: 0, ey: -1 },
}

const EX = 0.62 // gözün en fazla kayması: görsel genişliğinin yüzdesi (512'de ~3 px)

export function Avatar({ animal, equipped, seed, size = 96, bounce = false, look, mood, frame = true, pet, alive }: {
  animal: string; equipped?: Equipped; seed?: string; size?: number; bounce?: boolean; look?: Look; mood?: Mood; frame?: boolean
  /** Yanında hayvanı göster (varsayılan: çerçeveli ve yeterince büyükse). */ pet?: boolean
  /** Bakınma + göz kırpma + nefes (varsayılan: büyük avatarlarda; listelerde kapalı kalır). */ alive?: boolean
}) {
  const eq = equipped ?? {}
  const sd = seed ?? animal
  const showPet = (pet ?? (frame && size >= 56)) && frame
  const p = showPet ? petOf(animal, eq) : null
  const pose = poseOf(eq, sd)
  const pz = POSES[pose] ?? POSES.side
  const live = alive ?? size >= 100
  const dpr = typeof devicePixelRatio === 'number' ? Math.min(devicePixelRatio, 3) : 2
  const px = (frame ? 1.6 : 1) * size * dpr
  const L = layers(eq, sd, mood)
  const split = live && L.moving
  const uriAll = useComp(split ? [] : L.all, px)
  const uriLow = useComp(split ? L.lower : [], px)
  const uriIris = useComp(split ? L.iris : [], px)
  const uriUp = useComp(split ? L.upper : [], px)
  const uriBlink = useComp(live ? L.blink : [], px)
  const hands = p && pose === 'hug' && V?.hands ? [{ src: V.hands.layer, mask: V.hands.mask, ref: V.hands.ref, color: L.skin }] : []
  const uriHands = useComp(hands, px)
  const root = useRef<HTMLDivElement>(null)
  const [tap, setTap] = useState(0)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const poke = () => {
    setTap((t) => t + 1)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setTap(0), 900)
  }

  // Bakınma ve göz kırpma: React'i yeniden çizdirmeden CSS değişkenleriyle.
  const hasLook = !!look
  useEffect(() => {
    const el = root.current
    if (!el || !live) return
    let t = 0
    const ts: number[] = []
    const later = (f: () => void, ms: number) => { ts.push(window.setTimeout(f, ms)) }
    const gaze = (x: number, y = 0) => {
      el.style.setProperty('--ex', `${x * EX}%`)
      el.style.setProperty('--ey', `${y * EX * 0.5}%`)
      el.style.setProperty('--tl', `${x * 1.6}deg`)
      el.style.setProperty('--tx', `${x * 1.2}%`)
    }
    const blink = (twice = false) => {
      el.classList.add('blinking')
      later(() => el.classList.remove('blinking'), 120)
      if (twice) later(() => { el.classList.add('blinking'); later(() => el.classList.remove('blinking'), 110) }, 260)
    }
    const step = () => {
      if (document.hidden) { t = window.setTimeout(step, 1500); return }
      const r = Math.random()
      if (hasLook) { // soru ekranında bakışı dışarıdan alır, yalnız kırpar
        blink(r < 0.2)
      } else if (r < 0.22) gaze(-1, (Math.random() - 0.5) * 0.6)
      else if (r < 0.44) gaze(1, (Math.random() - 0.5) * 0.6)
      else if (r < 0.62 && p && pz.gaze !== 0) { // arkadaşına bakar, arkadaşı da sevinir
        gaze(pz.gaze, pz.ey * 0.8)
        later(() => el.classList.add('pet-hi'), 250)
        later(() => el.classList.remove('pet-hi'), 1100)
      } else if (r < 0.72 && p && pose === 'hug') { gaze(0, 1); later(() => blink(), 600) }
      else if (r < 0.9) { gaze(0); blink(r > 0.84) }
      else blink()
      if (!hasLook && Math.random() < 0.35) later(() => blink(), 300 + Math.random() * 500)
      t = window.setTimeout(step, 1300 + Math.random() * 2200)
    }
    gaze(0)
    t = window.setTimeout(step, 600 + Math.random() * 1200)
    return () => { window.clearTimeout(t); ts.forEach((x) => window.clearTimeout(x)) }
  }, [live, hasLook, pose, p, pz.gaze, pz.ey])

  const lookVars: CSSProperties = look
    ? ({ ['--ex' as string]: `${look.x * EX}%`, ['--ey' as string]: `${look.y * EX * 0.5}%`, ['--tl' as string]: `${look.x * 4}deg`, ['--tx' as string]: '0%' } as CSSProperties)
    : {}
  const kidStyle: CSSProperties | undefined = frame ? { top: (UP - 0.3) * size, left: -0.3 * size, width: 1.6 * size } : undefined
  const eyeBox: CSSProperties = { ...(kidStyle ?? { top: 0, left: 0, width: '100%' }), aspectRatio: '1', position: 'absolute' }
  if (V?.eyes) {
    const m = `url(${import.meta.env?.BASE_URL ?? '/'}av/${V.eyes.open})`
    eyeBox.maskImage = m; eyeBox.WebkitMaskImage = m; eyeBox.maskSize = '100% 100%'; eyeBox.WebkitMaskSize = '100% 100%'
  }
  const petStyle: CSSProperties = {
    left: pz.left * size, top: pz.inClip ? pz.top * size : (pz.top + 0.0) * size, width: pz.w * size,
  }
  const petImg = p && (
    <img key={'pet' + (tap ? 'x' + tap : '')} className={'av-pet pose-' + pose} src={fx(p.id)} alt={p.name} title={p.name} draggable={false} style={petStyle} />
  )
  const cls = ['avatar', frame ? '' : 'bare', bounce ? 'bounce' : '', mood === 'happy' ? 'happy' : '', live ? 'alive' : '', tap ? 'tap' : '', p ? 'with-pet' : ''].filter(Boolean).join(' ')
  const h = hash(sd)
  return (
    <div ref={root} className={cls} style={{ width: size, height: size, ['--breath-delay' as string]: `-${h % 3000}ms`, ...lookVars }} onPointerDown={poke}>
      {frame && <div className="av-bg" style={{ background: BG[eq.bg ?? 'none'] ?? BG.none }} />}
      <div className={frame ? 'av-clip' : 'av-free'} style={frame ? clipStyle(size) : undefined}>
        <div className="av-stage">
          {p && pz.inClip && pose === 'peek' && petImg}
          <div className="av-body" key={tap ? 'b' + tap : 'b'} style={p && pz.kid ? { left: pz.kid * size, right: -pz.kid * size } : undefined}>
            <div className="av-head">
              {split ? (
                <>
                  {uriLow && <img className="av-kid" src={uriLow} alt="" draggable={false} style={kidStyle} />}
                  {uriIris && <div className="av-eyes" style={eyeBox}><img className="av-iris" src={uriIris} alt="" draggable={false} /></div>}
                  {uriBlink && <img className="av-kid av-blink" src={uriBlink} alt="" draggable={false} style={kidStyle} />}
                  {uriUp && <img className="av-kid" src={uriUp} alt="" draggable={false} style={kidStyle} />}
                </>
              ) : (
                <>
                  {uriAll && <img className="av-kid" src={uriAll} alt="" draggable={false} style={kidStyle} />}
                  {live && uriBlink && <img className="av-kid av-blink" src={uriBlink} alt="" draggable={false} style={kidStyle} />}
                </>
              )}
            </div>
          </div>
          {p && pz.inClip && pose !== 'peek' && petImg}
          {uriHands && <img className="av-kid av-hands" src={uriHands} alt="" draggable={false} style={kidStyle} />}
        </div>
      </div>
      {p && !pz.inClip && petImg}
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
