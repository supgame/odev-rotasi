// Avatar = ImageGen katmanları (saç arkası, temel, ifade, kıyafet, saç önü, şapka, gözlük) canvas'ta birleşir + yanında hayvan + arka plan.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Equipped } from '../data/types'
import { BG } from './bg'
import { ITEMS, MANIFEST, SPECIES, fx, type CatalogItem, type ItemSlot, type Raw, type Species } from './catalog'
import { compose, composed, type Part } from './render'
import { cradleFor, cradleParts, hugSleeves, parrotGripSleeve, type CradleShape } from './companionCradle'

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
  skin: FREE('skin'), hair: ['hair_short', 'hair_curly', 'hair_bob', 'hair_side_part', 'hair_afro'].flatMap(ONE),
  hcolor: FREE('hcolor'), clothes: FREE('clothes'), ccolor: FREE('ccolor'),
  fshape: FREE('fshape'), ears: [...ONE('ears_small'), ...ONE('ears_small'), ...ONE('ears_medium')], eyes: FREE('eyes'),
  cheek: [...ONE('cheek_none'), ...FREE('cheek')],
  mouth: ONE('mouth_expression'), nose: ONE('nose_original'), brow: ONE('brow_expression'), eshape: ONE('eshape_expression'),
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
const STARTER_SMILES = [undefined, ITEM.get('face_smirk'), HAPPY]

const V = MANIFEST.variants
const NO_BLINK = ['face_wink', 'face_happy_closed']
const COLORED_EXPRESSIONS = new Set(['face_surprised', 'face_hearts', 'face_stars'])
const MOUTH_TOP = 251 // Ortak 512 px yüz tuvalinde göz katmanlarının bittiği çizgi.
const EYES_TOP = 188
const BASE_URL = import.meta.env.BASE_URL

const SIDE_PETS = new Set(['giraffe', 'elephant', 'flamingo', 'llama', 'camel', 'mammoth', 'sauropod', 'moose', 'whale'])
const HEAD_PETS = new Set(['hedgehog', 'snail', 'bee', 'ladybug', 'butterfly', 'chick', 'frog', 'mouse', 'hamster', 'turtle', 'owl'])
const BULKY_PETS = new Set(['dragon', 'trex', 'unicorn', 'phoenix', 'rhino', 'hippo', 'bison', 'croc', 'shark', 'peacock'])

export function availablePoses(petId: string): string[] {
  if (SIDE_PETS.has(petId) || BULKY_PETS.has(petId)) return ['pose_side', 'pose_peek']
  if (petId === 'rabbit') return ['pose_hug', 'pose_side', 'pose_peek']
  return ['pose_side', 'pose_hug', 'pose_shoulder', 'pose_peek', ...(HEAD_PETS.has(petId) ? ['pose_head'] : [])]
}

/** Arkadaşın duruşu (side | shoulder | peek | head | hug). */
export const poseOf = (eq: Equipped, petId: string) => {
  const poses = availablePoses(petId)
  const chosen = eq.pose && poses.includes(eq.pose) ? eq.pose : poses[0]
  return chosen.slice('pose_'.length)
}

const floorHat = (p: Part | null): Part | null => {
  if (p?.src === 'hat/crown.webp') return { ...p, scale: 0.85, dy: -24 }
  if (p?.src === 'hat/pirate.webp' || p?.src === 'hat/cowboy.webp') return { ...p, dy: -13 }
  return p
}

const BRIMMED_HATS = new Set(['hat/cap.webp', 'hat/bucket.webp', 'hat/cowboy.webp', 'hat/pirate.webp', 'hat/wizard.webp'])
const VOLUME_HAIR: Partial<Record<string, number>> = {
  hair_afro: 0.76, hair_bun: 0.78, hair_spiky: 0.84, hair_space_buns: 0.92, hair_curly: 0.96,
}
const AFRO_CAP = { scale: 1.12, dy: -8 }

function clothesPart(cl: Raw | undefined, color: CatalogItem | undefined) {
  const layer = part(cl, null, cl?.tintable === false ? undefined : color?.raw.color)
  return layer && color?.id === 'ccolor_gold' && layer.mask ? { ...layer, metallic: true } : layer
}

interface Layers { all: Part[]; lower: Part[]; iris: Part[]; blink: Part[]; upper: Part[]; moving: boolean; skin?: string; garment: Part | null }

/** Katmanları sıraya koyar. Canlı avatar için ayrıca: alt (gözler boş), kayan iris, kırpma, üst (kıyafet, saç önü, şapka, gözlük). */
function layers(eq: Equipped, seed: string, mood?: Mood, cradle?: CradleShape): Layers {
  const skin = pick(eq, 'skin', seed)?.raw.color as string | undefined
  const hairItem = pick(eq, 'hair', seed)
  const hair = hairItem?.raw
  const hcol = pick(eq, 'hcolor', seed)?.raw.color as string | undefined
  const hat = pick(eq, 'hat', seed)?.raw
  const volume = hat && BRIMMED_HATS.has(hat.layer ?? '') ? VOLUME_HAIR[hairItem?.id ?? ''] : undefined
  const underHat = hat && !volume
  const gl = pick(eq, 'glasses', seed)?.raw
  const clothes = pick(eq, 'clothes', seed)
  const ccol = pick(eq, 'ccolor', seed)
  const faceIt = mood === 'happy' && HAPPY ? HAPPY : pick(eq, 'face', seed)
  const face = (faceIt ?? STARTER_SMILES[hash(seed + 'smile') % STARTER_SMILES.length])?.raw
  const mouth = pick(eq, 'mouth', seed)
  const overrideMouth = mood !== 'happy' && mouth && mouth.id !== 'mouth_expression'
  const shape = (pick(eq, 'fshape', seed)?.raw.key as string) ?? 'oval'
  const ears = (pick(eq, 'ears', seed)?.raw.key as string) ?? 'small'
  const eyes = pick(eq, 'eyes', seed)?.raw.color as string | undefined
  const cheek = pick(eq, 'cheek', seed)?.raw.key as string | undefined
  const b = MANIFEST.base
  const sub = (t: string) => t.replace('{shape}', shape).replace('{ears}', ears)
  const back = part(hair, underHat ? 'backUnderHat' : 'back', hcol)
  const dx = V?.hairBackDx?.[shape] ?? 0 // dar yüzde at kuyruğu yanağa yaklaşsın
  const brow = part(pick(eq, 'brow', seed)?.raw, null)
  const nose = part(pick(eq, 'nose', seed)?.raw, null)
  const openEye = faceIt?.id === 'face_happy_closed' ? null : part(pick(eq, 'eshape', seed)?.raw, null, eyes)
  const wink = faceIt?.id === 'face_wink'
  const movingIris = !!V?.eyes && !openEye && !V.eyes.ownEyes.includes(faceIt?.id ?? '')
  const moving = movingIris || !!openEye
  const clearSkin = (feature: string): Part => ({ src: `features/clear_${feature}.webp`, color: skin, ref: b.skinRef })
  // Göz kırpma ifadesi seçildiyse biçim yalnız açık kalan göze uygulanır.
  const openColumns: [number, number] | undefined = wink ? [256, 512] : undefined
  const clearEyes = openEye ? { ...clearSkin('eyes'), sourceColumns: openColumns } : null
  const P = (x: Part | null | undefined) => (x && x.src ? [x] : [])
  const backHair = [
    ...P(back && dx ? { ...back, dx } : back),
    ...P(part(hair, underHat ? 'fillUnderHat' : 'fill', hcol)), // yüzün arkasındaki saç (dar yüzde boşluk kalmasın)
  ]
  const head = [
    { src: V ? sub(V.base) : b.layer, mask: V ? sub(V.mask) : b.skinMask, ref: b.skinRef, color: skin },
    ...P(V && eyes && !openEye ? { src: V.iris.layer, mask: V.iris.mask, ref: V.iris.ref, color: eyes } : null),
  ]
  const lowerBase = [...backHair, ...head]
  const expression = part(face, null, skin)
  if (expression && eyes && COLORED_EXPRESSIONS.has(faceIt?.id ?? '')) expression.iris = eyes
  const expressionTop = brow ? EYES_TOP : 0
  const expressionBottom = overrideMouth ? MOUTH_TOP : 512
  const expressionLayers: Part[] = !expression ? [] : openEye && !wink ? [
    ...(brow ? [] : [{ ...expression, sourceRows: [0, EYES_TOP] as [number, number] }]),
    { ...expression, sourceRows: [249, expressionBottom] },
  ] : [{ ...expression, sourceRows: [expressionTop, expressionBottom] }]
  const mouthLayer = overrideMouth && mouth.raw.sourceFace ? part(ITEM.get(mouth.raw.sourceFace)?.raw, null, skin) : null
  if (mouthLayer) mouthLayer.sourceRows = [MOUTH_TOP, 512]
  const deeperSkin = ['skin_brown', 'skin_tan', 'skin_dark'].includes(currentId(eq, 'skin', seed) ?? '')
  const mid = [
    ...P(brow && clearSkin('brows')),
    ...P(nose && clearSkin('nose')),
    ...P(V && cheek && V.cheek[cheek] ? { src: V.cheek[cheek], stronger: deeperSkin } : null),
    ...expressionLayers,
    ...P(clearEyes),
    ...P(openEye && { ...openEye, sourceColumns: openColumns }),
    ...P(brow),
    ...P(nose && { ...nose, color: skin, ref: b.skinRef }),
    ...P(mouthLayer),
  ]
  const glasses = part(gl, null, gl?.color)
  const hairFront = part(hair, underHat ? 'frontUnderHat' : 'front', hcol)
  const headwear = floorHat(part(hat, null, hat?.color))
  const front = [
    // Saç uçlarının yerini koruyarak tepeyi siperin içine al, şakaklardaki bukleler dışarıda kalsın.
    ...P(hairFront && volume ? { ...hairFront, scaleY: volume, dy: -12 * (1 - volume) } : hairFront),
    ...P(headwear?.src === 'hat/cap.webp' && hairItem?.id === 'hair_afro' ? { ...headwear, ...AFRO_CAP } : headwear),
    ...P(glasses && { ...glasses, scale: 0.92, dy: -4 }),
  ]
  const garment = clothesPart(clothes?.raw, ccol)
  const upper = [...P(garment), ...front]
  const ir = V?.eyes?.iris
  const tshirt = clothes?.id === 'clothes_tshirt'
  const shirtDye = tshirt && garment ? { color: garment.color, metallic: garment.metallic } : undefined
  return {
    all: cradle
      ? cradleParts(cradle, backHair, [...head, ...mid], front, tshirt ? null : garment, skin, shirtDye)
      : [...lowerBase, ...mid, ...upper],
    lower: movingIris && V?.eyes ? [...lowerBase, { src: V.eyes.layer }, ...mid] : [...lowerBase, ...mid],
    iris: movingIris && ir ? [eyes ? { src: ir.layer, mask: ir.mask, ref: ir.ref, color: eyes } : { src: ir.layer }] : [],
    blink: V && !NO_BLINK.includes(faceIt?.id ?? '') ? [
      ...P(clearEyes), { src: V.blink.layer, mask: V.blink.mask, ref: V.blink.ref, color: skin },
    ] : [],
    upper,
    moving,
    skin,
    garment,
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

// Temas çizgisi kaynağın 512 px tuvalinde, başın orta 64 pikselindeki opak tepeye denk gelir.
const HAIR_TOP: Record<string, number> = {
  hair_short: 87, hair_ponytail: 92, hair_curly: 87, hair_afro: 20, hair_straight_long: 90, hair_bob: 80, hair_bun: 29,
  hair_braids: 91, hair_space_buns: 94, hair_wavy_long: 90, hair_bangs_long: 90, hair_spiky: 56,
  hair_side_part: 78, hair_headscarf: 90,
}
const HAT_TOP: Record<string, number> = {
  cap: 48, pom: 37, earflap: 43, cat: 71, bucket: 57, cowboy: 37, wizard: 12, pirate: 18, crown: 40, pilot: 81, bear: 87,
}

// Koordinatlar sahnenin genişliğine göre. Peek x'i çocuğun tuvaline göre ölçülür.
const POSES: Record<string, { x: number; bottom: number; width: number; kid: number; gaze: number; ey: number }> = {
  side: { x: 0.79, bottom: 0.94, width: 0.42, kid: -0.13, gaze: 1, ey: 0.45 },
  shoulder: { x: 0.79, bottom: 0.79, width: 0.30, kid: -0.10, gaze: 1, ey: 0.20 },
  peek: { x: 338 / 512, bottom: 0.90, width: 0.42, kid: -0.14, gaze: 1, ey: 0.15 },
  hug: { x: 0.56, bottom: 0.91, width: 0.35, kid: -0.025, gaze: 0, ey: 1 },
  head: { x: 0.50, bottom: 0.31, width: 0.30, kid: 0, gaze: 0, ey: -1 },
}

// Omza değen pençe veya pati, hayvanın 256 px tuvalindeki konumuyla sabitlenir.
const SHOULDER_CONTACT: Partial<Record<string, { x: number; y: number; width: number; angle?: number; faceChild?: boolean }>> = {
  owl: { x: 120, y: 230, width: 0.30, faceChild: true },
  parrot: { x: 91, y: 224, width: 0.30 },
  dove: { x: 148, y: 229, width: 0.29, faceChild: true },
  chick: { x: 104, y: 232, width: 0.26, faceChild: true },
  eagle: { x: 142, y: 233, width: 0.32, faceChild: true },
  lion: { x: 117, y: 239, width: 0.27, angle: 7 },
  tiger: { x: 120, y: 241, width: 0.27, angle: 8 },
  leopard: { x: 211, y: 239, width: 0.31, angle: 8 },
  wolf: { x: 74, y: 239, width: 0.27, angle: 8 },
}

// 512 px kıyafet katmanında omuz çizgisi (x=368). Kapüşon ve zırh daha yukarıda.
const SHOULDER_Y: Partial<Record<string, number>> = {
  clothes_tshirt: 367, clothes_hoodie: 349, clothes_knight: 347, clothes_dinosaur: 337,
}

const EX = 0.62 // gözün en fazla kayması: görsel genişliğinin yüzdesi (512'de ~3 px)

export function Avatar({ animal, equipped, seed, size = 96, bounce = false, look, mood, frame = true, pet, alive }: {
  animal: string; equipped?: Equipped; seed?: string; size?: number; bounce?: boolean; look?: Look; mood?: Mood; frame?: boolean
  /** Yanında hayvanı göster (varsayılan: çerçeveli ve 96 piksel veya daha büyük). */ pet?: boolean
  /** Bakınma + göz kırpma + nefes (varsayılan: büyük avatarlarda; listelerde kapalı kalır). */ alive?: boolean
}) {
  const eq = equipped ?? {}
  const sd = seed ?? animal
  const showPet = (pet ?? size >= 96) && frame
  const p = showPet ? petOf(animal, eq) : null
  const pose = p ? poseOf(eq, p.id) : 'side'
  const pz = POSES[pose]
  const cradle = p && pose === 'hug' ? cradleFor(p.id) : undefined
  const fingerPerch = p?.id === 'parrot' && pose === 'hug' ? V?.parrotGrip : undefined
  const live = !cradle && (alive ?? size >= 100)
  const dpr = typeof devicePixelRatio === 'number' ? Math.min(devicePixelRatio, 3) : 2
  const px = (frame ? 1.6 : 1) * size * dpr
  const L = layers(eq, sd, mood, cradle)
  const split = live && L.moving
  const uriCradle = useComp(cradle ? L.all : [], px)
  const uriAll = useComp(split || cradle ? [] : L.all, px)
  const uriLow = useComp(split ? L.lower : [], px)
  const uriIris = useComp(split ? L.iris : [], px)
  const uriUp = useComp(split ? L.upper : [], px)
  const uriBlink = useComp(live ? L.blink : [], px)
  const hands = !cradle && !fingerPerch && p && pose === 'hug' && V?.hands
    ? [{ src: V.hands.layer, mask: V.hands.mask, ref: V.hands.ref, color: L.skin }, ...hugSleeves(L.garment)]
    : []
  const uriHands = useComp(hands, px)
  const uriGrip = useComp(fingerPerch ? [
    { src: fingerPerch.layer, mask: fingerPerch.mask, ref: fingerPerch.ref, color: L.skin },
    ...parrotGripSleeve(L.garment),
  ] : [], px)
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
  const hairId = currentId(eq, 'hair', sd) ?? 'hair_short'
  const hatName = String(pick(eq, 'hat', sd)?.raw.layer ?? '').split('/').at(-1)?.replace('.webp', '') ?? ''
  const wideHair = hairId === 'hair_afro' || hairId === 'hair_headscarf'
  const broadPet = p && (SIDE_PETS.has(p.id) || BULKY_PETS.has(p.id))
  const scale = p ? (pose === 'head' || wideHair || broadPet ? 1.03 : 1.16) : (wideHair || hatName === 'wizard' ? 1.29 : 1.48)
  const hatTop = hairId === 'hair_afro' && hatName === 'cap'
    ? 256 + (HAT_TOP.cap - 256) * AFRO_CAP.scale + AFRO_CAP.dy
    : HAT_TOP[hatName]
  const crownTop = (hatTop ?? HAIR_TOP[hairId] ?? 88) / 512 * scale
  const kidTop = p
    ? Math.max(pose === 'hug' ? -0.015 : 0, (pose === 'head' ? pz.bottom - 0.014 : 0.055) - crownTop)
    : Math.max(-0.15, 0.045 - crownTop)
  const kidOffset = p ? pz.kid * (wideHair ? 0.8 : 1) : 0
  const kidLeft = (1 - scale) / 2 + kidOffset
  const kidStyle: CSSProperties | undefined = frame
    ? { top: kidTop * size, left: kidLeft * size, width: scale * size }
    : undefined
  const eyeBox: CSSProperties = { ...(kidStyle ?? { top: 0, left: 0, width: '100%' }), aspectRatio: '1', position: 'absolute' }
  if (V?.eyes) {
    const m = `url(${import.meta.env?.BASE_URL ?? '/'}av/${V.eyes.open})`
    eyeBox.maskImage = m; eyeBox.WebkitMaskImage = m; eyeBox.maskSize = '100% 100%'; eyeBox.WebkitMaskSize = '100% 100%'
  }
  const perch = p && pose === 'shoulder' ? SHOULDER_CONTACT[p.id] : undefined
  const perchX = kidLeft + 368 / 512 * scale
  const perchY = kidTop + ((SHOULDER_Y[currentId(eq, 'clothes', sd) ?? ''] ?? 364) + 3) / 512 * scale
  const petWidth = perch?.width ?? (p?.id === 'giraffe' ? 0.51 : pz.width)
  // Arkadaki hayvan başını dışa eğerken ağırlığı omuzun arkasında kalır.
  const peek = pose === 'peek'
  const petX = peek ? kidLeft + pz.x * scale : pz.x
  const petStyle: CSSProperties = perch ? {
    left: (perchX - perch.x / 256 * petWidth) * size,
    top: (perchY - perch.y / 256 * petWidth) * size,
    width: petWidth * size,
    transformOrigin: `${perch.x / 2.56}% ${perch.y / 2.56}%`,
    transform: `rotate(${perch.angle ?? 12}deg)${perch.faceChild ? ' scaleX(-1)' : ''}`,
  } : {
    left: (petX - petWidth / 2) * size, top: (pz.bottom - petWidth * 0.95) * size, width: petWidth * size,
    ...(peek ? { transform: 'rotate(24deg)', transformOrigin: '50% 95%' } : {}),
  }
  const petImg = p && (
    <img key={'pet' + (tap ? 'x' + tap : '')} className={`av-pet pose-${pose}${perch ? ' av-perched' : ''}`}
      src={fx(p.id)} alt={p.name} title={p.name} draggable={false} style={petStyle} />
  )
  const cls = ['avatar', frame ? '' : 'bare', bounce ? 'bounce' : '', mood === 'happy' ? 'happy' : '', live ? 'alive' : '', tap ? 'tap' : '', p ? 'with-pet' : '', p && `scene-${pose}`].filter(Boolean).join(' ')
  const h = hash(sd)
  return (
    <div ref={root} className={cls} style={{ width: size, height: size, ['--breath-delay' as string]: `-${h % 3000}ms`, ...lookVars }} onPointerDown={poke}>
      {frame && <div className="av-bg" style={{ background: BG[eq.bg ?? 'none'] ?? BG.none }} />}
      {cradle ? (
        <div className="av-stage av-illustration">
          {uriCradle && <img src={uriCradle} alt={p ? `Kucağında ${p.name.toLocaleLowerCase('tr-TR')} tutan çocuk` : ''} draggable={false} />}
        </div>
      ) : (
        <div className={frame ? 'av-clip' : 'av-free'}>
          <div className="av-stage">
            {pose === 'peek' && petImg}
            <div className="av-body" key={tap ? 'b' + tap : 'b'}>
              <div className="av-head">
                {frame && !(uriAll || uriLow) && <span className="av-placeholder" style={{ background: skinColor(eq, sd) }} />}
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
            {perch && <span className="av-perch-shadow" aria-hidden="true" style={{ left: perchX * size, top: perchY * size }} />}
            {pose !== 'peek' && !uriGrip && petImg}
            {uriGrip && <img className="av-kid av-hands" src={uriGrip} alt="Parmağa tutunan papağan" draggable={false}
              style={{ left: 0, top: 0, width: '100%' }} />}
            {uriHands && <img className="av-kid av-hands" src={uriHands} alt="" draggable={false}
              style={{ left: size * 0.10, top: size * 0.10, width: size * 0.90 }} />}
          </div>
        </div>
      )}
      {tap > 0 && <span className="av-hearts" key={'h' + tap} aria-hidden><i>💖</i><i>✨</i><i>💛</i></span>}
    </div>
  )
}

function ProductLayer({ layer, kind }: { layer: Part; kind: 'hat' | 'clothes' | 'glasses' | 'costume' }) {
  const src = useComp([layer], 320)
  const base = BASE_URL + 'av/' + layer.src
  return <div className={`av-product av-product-${kind}`}>
    <img src={src ?? base} alt="" draggable={false} />
  </div>
}

export function ItemPreview({ id, slot, animal, equipped, seed }: { id: string; slot: string; animal: string; equipped: Equipped; seed: string }) {
  if (slot === 'pet') {
    const sp = BY_ID.get(id.replace(/^pet_/, '')) ?? SPECIES[0]
    return <div className="pet-preview"><img src={fx(sp.id)} alt="" /></div>
  }
  if (slot === 'bg') return <div className="av-background-preview" style={{ background: BG[id] ?? BG.none }} />
  const eq: Equipped = { ...equipped, [slot]: id }
  const raw = ITEM.get(id)?.raw
  if (slot === 'hat' || slot === 'glasses') {
    const layer = part(raw, null, raw?.color)
    if (layer) return <ProductLayer layer={layer} kind={slot} />
  }
  if (slot === 'clothes' || slot === 'ccolor') {
    const color = slot === 'ccolor' ? ITEM.get(id) : equipped.ccolor ? ITEM.get(equipped.ccolor) : ITEM.get('ccolor_blue')
    const garment = slot === 'ccolor' ? ITEM.get('clothes_tshirt')?.raw : raw
    const layer = clothesPart(garment, color)
    if (layer && id === 'clothes_dinosaur') {
      return <ProductLayer layer={{ src: 'clothes/dinosaur-card.webp' }} kind="costume" />
    }
    if (layer && id === 'clothes_superhero') {
      return <ProductLayer layer={{ ...layer, src: 'clothes/superhero-card.webp', mask: 'clothes/superhero-card-mask.webp', ref: 58 }} kind="costume" />
    }
    if (layer) return <ProductLayer layer={layer} kind="clothes" />
  }
  if (slot === 'pose') {
    const pet = petOf(animal, eq)
    const samplePet = availablePoses(pet.id).includes(id) ? pet.id : id === 'pose_head' ? 'hedgehog' : 'fox'
    return <Avatar animal={samplePet} equipped={{ ...eq, pet: undefined }} seed={seed} size={84} pet alive={false} />
  }
  const portrait = ['face', 'mouth', 'skin', 'ears', 'fshape', 'cheek', 'eyes', 'eshape', 'brow', 'nose'].includes(slot)
  const size = slot === 'fshape' ? 122 : portrait ? 112 : 84
  return <Avatar animal={animal} equipped={eq} seed={seed} size={size} pet={false} alive={false} />
}
