// Avatar = ImageGen katmanları (saç arkası, temel, ifade, kıyafet, saç önü, şapka, gözlük) canvas'ta birleşir + yanında hayvan + arka plan.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Equipped, Gender } from '../data/types'
import { BG } from './bg'
import { ITEMS, MANIFEST, SPECIES, fx, type CatalogItem, type ItemSlot, type Raw, type Species } from './catalog'
import { compose, composed, type Part } from './render'
import { cradleFor, cradleParts, type CradleShape } from './companionCradle'
import { COMPANION_ACTIONS, contactFor, contactParts, gripParts } from './companionContact'
import { HELD_ACTION, HELD_ART, heldKind } from './held'
import { HeldScene } from './HeldScene'
import { GENDER_DEFAULTS } from './gender'

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
// Cinsiyetli havuzlar; cinsiyeti boş kayıt yalnız DEF'i görür (eski görünüm birebir kalır).
const GDEF: Record<Gender, Partial<Record<ItemSlot, CatalogItem[]>>> = {
  kiz: Object.fromEntries(Object.entries(GENDER_DEFAULTS.kiz).map(([k, ids]) => [k, ids.flatMap(ONE)])),
  erkek: Object.fromEntries(Object.entries(GENDER_DEFAULTS.erkek).map(([k, ids]) => [k, ids.flatMap(ONE)])),
}
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}
function pick(eq: Equipped, slot: ItemSlot, seed: string, g?: Gender | null): CatalogItem | undefined {
  const it = eq[slot] ? ITEM.get(eq[slot]!) : undefined
  if (it && it.slot === slot) return it // katalogdan kalkmış eski eşya sayılmaz
  const list = (g && GDEF[g]?.[slot]?.length ? GDEF[g][slot] : undefined) ?? DEF[slot]
  return list?.length ? list[hash(seed + slot) % list.length] : undefined
}

/** Yuvada şu an görünen eşya id'si (takılı ya da varsayılan). */
export const currentId = (eq: Equipped, slot: ItemSlot, seed: string, g?: Gender | null) => pick(eq, slot, seed, g)?.id

export const skinColor = (eq: Equipped, seed: string, g?: Gender | null) => '#' + (pick(eq, 'skin', seed, g)?.raw.color ?? 'e0ac80')

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
const BULKY_PETS = new Set(['dragon', 'trex', 'unicorn', 'phoenix', 'rhino', 'hippo', 'bison', 'croc', 'shark', 'peacock'])

export function availablePoses(petId: string): string[] {
  return cradleFor(petId) || contactFor(petId, 'hug')
    ? ['pose_side', 'pose_hug']
    : ['pose_side']
}

/** Eski, çizimi bulunmayan pozlar Yanımda olarak görünür. */
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
// These styles cover the original ears; their restored locks form one continuous silhouette.
const COVERED_EARS = new Set(['hair_straight_long', 'hair_bob', 'hair_wavy_long', 'hair_bangs_long', 'hair_braids', 'hair_headscarf'])
const HAT_HAIR_JOIN = 190
// Reserve the same head box for every hat, including the wizard's 6px tip.
const SOLO_SCALE = 1.2
const SOLO_TOP = 0.045 - 6 / 512 * SOLO_SCALE

function clothesPart(cl: Raw | undefined, color: CatalogItem | undefined) {
  const layer = part(cl, null, cl?.tintable === false ? undefined : color?.raw.color)
  return layer && color?.id === 'ccolor_gold' && layer.mask ? { ...layer, metallic: true } : layer
}

interface Layers { all: Part[]; lower: Part[]; iris: Part[]; blink: Part[]; upper: Part[]; moving: boolean; skin?: string; garment: Part | null; eyeOpen?: string }

/** Katmanları sıraya koyar. Canlı avatar için ayrıca: alt (gözler boş), kayan iris, kırpma, üst (kıyafet, saç önü, şapka, gözlük). */
function layers(eq: Equipped, seed: string, mood?: Mood, cradle?: CradleShape, g?: Gender | null): Layers {
  const skin = pick(eq, 'skin', seed, g)?.raw.color as string | undefined
  const hairItem = pick(eq, 'hair', seed, g)
  const hair = hairItem?.raw
  const hcol = pick(eq, 'hcolor', seed, g)?.raw.color as string | undefined
  const hat = pick(eq, 'hat', seed, g)?.raw
  const volume = hat && BRIMMED_HATS.has(hat.layer ?? '') ? VOLUME_HAIR[hairItem?.id ?? ''] : undefined
  const underHat = hat && !volume
  const gl = pick(eq, 'glasses', seed, g)?.raw
  const clothes = pick(eq, 'clothes', seed, g)
  const ccol = pick(eq, 'ccolor', seed, g)
  const faceIt = mood === 'happy' && HAPPY ? HAPPY : pick(eq, 'face', seed, g)
  const face = (faceIt ?? STARTER_SMILES[hash(seed + 'smile') % STARTER_SMILES.length])?.raw
  const mouth = pick(eq, 'mouth', seed, g)
  const overrideMouth = mood !== 'happy' && mouth && mouth.id !== 'mouth_expression'
  const shape = (pick(eq, 'fshape', seed, g)?.raw.key as string) ?? 'oval'
  const ears = (pick(eq, 'ears', seed, g)?.raw.key as string) ?? 'small'
  const eyes = pick(eq, 'eyes', seed, g)?.raw.color as string | undefined
  const cheek = pick(eq, 'cheek', seed, g)?.raw.key as string | undefined
  const b = MANIFEST.base
  const sub = (t: string) => t.replace('{shape}', shape).replace('{ears}', ears)
  const back = part(hair, 'back', hcol)
  const dx = V?.hairBackDx?.[shape] ?? 0 // dar yüzde at kuyruğu yanağa yaklaşsın
  const brow = part(pick(eq, 'brow', seed, g)?.raw, null)
  const nose = part(pick(eq, 'nose', seed, g)?.raw, null)
  // Decorative eye expressions retain their own artwork. Every ordinary
  // expression uses the chosen registered open/closed pair, including default.
  const eyeStyle = pick(eq, 'eshape', seed, g)?.raw
  const ownExpressionEyes = ['face_happy_closed', ...COLORED_EXPRESSIONS].includes(faceIt?.id ?? '')
  const openEye = ownExpressionEyes ? null : part(eyeStyle, null, eyes)
  const closedEye = openEye && eyeStyle?.closed ? { src: eyeStyle.closed as string } : null
  const wink = faceIt?.id === 'face_wink'
  const movingIris = !!V?.eyes && !openEye && !V.eyes.ownEyes.includes(faceIt?.id ?? '')
  const moving = movingIris || !!openEye
  const clearSkin = (feature: string): Part => ({ src: `features/clear_${feature}.webp`, color: skin, ref: b.skinRef })
  // Göz kırpma ifadesi seçildiyse biçim yalnız açık kalan göze uygulanır.
  const openColumns: [number, number] | undefined = wink ? [256, 512] : undefined
  const eyeDraw = openEye && { ...openEye, sourceColumns: openColumns }
  const gazeEyes = !!openEye && !!eyeStyle?.empty && !!eyeStyle?.iris
  const clearEyes = openEye ? { ...clearSkin('eyes'), sourceColumns: openColumns } : null
  const P = (x: Part | null | undefined) => (x && x.src ? [x] : [])
  const backHair = [
    ...P(back && dx ? { ...back, dx } : back),
    ...P(part(hair, 'fill', hcol)), // yüzün arkasındaki saç (dar yüzde boşluk kalmasın)
  ]
  const ear = V?.ears && !COVERED_EARS.has(hairItem?.id ?? '')
    ? { src: sub(V.ears.layer), mask: sub(V.ears.mask), ref: V.ears.ref, color: skin } : null
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
  const deeperSkin = ['skin_brown', 'skin_tan', 'skin_dark'].includes(currentId(eq, 'skin', seed, g) ?? '')
  const mid = [
    ...P(V && cheek && V.cheek[cheek] ? { src: V.cheek[cheek], stronger: deeperSkin } : null),
    ...expressionLayers,
    ...P(brow && clearSkin('brows')),
    ...P(nose && clearSkin('nose')),
    ...P(clearEyes),
    ...P(eyeDraw),
    ...P(brow),
    ...P(nose && { ...nose, color: skin, ref: b.skinRef }),
    ...P(mouthLayer),
  ]
  const movingMid = gazeEyes ? mid.map((p) => p === eyeDraw
    ? { src: eyeStyle!.empty as string, sourceColumns: openColumns } : p) : mid
  const glasses = part(gl, null, gl?.color)
  const hairFront = part(hair, 'front', hcol)
  const fittedTop = part(hair, underHat ? 'frontUnderHat' : 'front', hcol)
  const headwear = floorHat(part(hat, null, hat?.color))
  const front = [
    // Fit only the crown. Side locks, temples and the jaw keep their exact
    // registration when headwear changes; fitting the whole sprite moved them.
    ...P(hat && fittedTop ? { ...fittedTop, ...(volume ? { scaleY: volume, dy: -12 * (1 - volume) } : {}), sourceRows: [0, HAT_HAIR_JOIN], clip: `M0 0H640V${HAT_HAIR_JOIN * 640 / 512}H0Z` } : hairFront),
    ...P(hat && hairFront ? { ...hairFront, sourceRows: [HAT_HAIR_JOIN, 512] } : null),
    // Short styles expose the ears in front of the hair; covered styles omit
    // them so the original extraction cannot punch holes through the locks.
    ...P(ear),
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
    lower: movingIris && V?.eyes ? [...lowerBase, { src: V.eyes.layer }, ...mid] : [...lowerBase, ...movingMid],
    iris: gazeEyes ? [{ src: eyeStyle!.iris as string, mask: eyeStyle!.mask as string, ref: eyeStyle!.ref as number, color: eyes, sourceColumns: openColumns }]
      : movingIris && ir ? [eyes ? { src: ir.layer, mask: ir.mask, ref: ir.ref, color: eyes } : { src: ir.layer }] : [],
    eyeOpen: gazeEyes ? eyeStyle!.open as string : undefined,
    blink: V && !NO_BLINK.includes(faceIt?.id ?? '') ? [
      ...(closedEye ? [clearSkin('eyes'), closedEye] : [{ src: V.blink.layer, mask: V.blink.mask, ref: V.blink.ref, color: skin }]),
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

const EX = 0.62 // gözün en fazla kayması: görsel genişliğinin yüzdesi (512'de ~3 px)

export function Avatar({ animal, equipped, seed, gender, size = 96, bounce = false, look, mood, frame = true, pet, alive, interactive = false }: {
  animal: string; equipped?: Equipped; seed?: string; gender?: Gender | null; size?: number; bounce?: boolean; look?: Look; mood?: Mood; frame?: boolean
  /** Yanında hayvanı göster (varsayılan: çerçeveli ve 96 piksel veya daha büyük). */ pet?: boolean
  /** Bakınma + göz kırpma + nefes (varsayılan: büyük avatarlarda; listelerde kapalı kalır). */ alive?: boolean
  /** Profil ve büyük ayna gibi kendi düğmesine yer olan sahneler. */ interactive?: boolean
}) {
  const eq = equipped ?? {}
  const sd = seed ?? animal
  const showPet = (pet ?? size >= 96) && frame
  const p = showPet ? petOf(animal, eq) : null
  const pose = p ? poseOf(eq, p.id) : 'side'
  const cradle = p && pose === 'hug' ? cradleFor(p.id) : undefined
  const item = frame && pose !== 'hug' ? heldKind(eq.held) : undefined
  const held = item ? HELD_ART[item] : undefined
  const contact = p && !held && contactFor(p.id, pose)
  const action = interactive && p && (contact || cradle) && COMPANION_ACTIONS[p.id]
  const live = !cradle && (alive ?? size >= 100)
  const root = useRef<HTMLDivElement>(null)
  const [tap, setTap] = useState(0)
  const [playing, setPlaying] = useState<{ key: string; motion: boolean } | null>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const companionKey = (p?.id ?? '') + ':' + pose
  const isPlaying = tap > 0 && playing?.key === companionKey
  const heldPlaying = tap > 0 && item !== undefined && playing?.key === item
  const play = (key: string) => {
    const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setPlaying({ key, motion })
    setTap((t) => t + 1)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setTap(0), key === 'football' ? 1350 : 1000)
  }
  const dpr = typeof devicePixelRatio === 'number' ? Math.min(devicePixelRatio, 3) : 2
  const px = (frame ? 1.6 : 1) * size * dpr
  const L = layers(eq, sd, (action && isPlaying) || heldPlaying ? 'happy' : mood, cradle, gender)
  const split = live && L.moving
  const uriCradle = useComp(cradle ? L.all : [], px)
  const uriAll = useComp(split || cradle ? [] : L.all, px)
  const uriLow = useComp(split ? L.lower : [], px)
  const uriIris = useComp(split ? L.iris : [], px)
  const uriUp = useComp(split ? L.upper : [], px)
  const uriBlink = useComp(live ? L.blink : [], px)
  const uriContact = useComp(contact ? contactParts(contact, L.skin, L.garment) : [], px)
  const uriHeldGrip = useComp(held ? [
    ...(held.fixed ? [{ src: held.fixed }] : []),
    ...gripParts(held, L.skin, L.garment),
  ] : [], px)

  // Bakış çocukta kalır. Temas katmanı, elle temas noktasını korur.
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
      else if (r < 0.64 && p) { gaze(pose === 'hug' ? 0 : 1, 0.7); later(() => blink(), 500) }
      else if (r < 0.9) { gaze(0); blink(r > 0.84) }
      else blink()
      if (!hasLook && Math.random() < 0.35) later(() => blink(), 300 + Math.random() * 500)
      t = window.setTimeout(step, 1300 + Math.random() * 2200)
    }
    gaze(0)
    t = window.setTimeout(step, 600 + Math.random() * 1200)
    return () => { window.clearTimeout(t); ts.forEach((x) => window.clearTimeout(x)) }
  }, [live, hasLook, pose, p])

  const lookVars: CSSProperties = look
    ? ({ ['--ex' as string]: `${look.x * EX}%`, ['--ey' as string]: `${look.y * EX * 0.5}%`, ['--tl' as string]: `${look.x * 4}deg`, ['--tx' as string]: '0%' } as CSSProperties)
    : {}
  const broadPet = p && (SIDE_PETS.has(p.id) || BULKY_PETS.has(p.id))
  const scale = held ? 0.98 : p ? (broadPet ? 1.02 : 1.16) : SOLO_SCALE
  const kidTop = held ? -0.015 : p ? 0.035 : SOLO_TOP
  const kidOffset = p ? (held ? -0.11 : pose === 'hug' ? -0.018 : -0.145) : 0
  const kidLeft = (1 - scale) / 2 + kidOffset
  const kidStyle: CSSProperties | undefined = frame
    ? { top: kidTop * size, left: kidLeft * size, width: scale * size }
    : undefined
  const eyeBox: CSSProperties = { ...(kidStyle ?? { top: 0, left: 0, width: '100%' }), aspectRatio: '1', position: 'absolute' }
  const opening = L.eyeOpen ?? V?.eyes?.open
  if (opening) {
    const m = `url(${import.meta.env?.BASE_URL ?? '/'}av/${opening})`
    eyeBox.maskImage = m; eyeBox.WebkitMaskImage = m; eyeBox.maskSize = '100% 100%'; eyeBox.WebkitMaskSize = '100% 100%'
  }
  const petWidth = broadPet ? 0.34 : 0.33
  const petStyle = { left: (0.81 - petWidth / 2) * size, bottom: size * 0.065, width: petWidth * size }
  const contactStyle = contact ? { left: contact.x * size, top: contact.y * size, width: contact.size * size } : undefined
  const heldStyle = held ? {
    left: (held.x + (p ? 0 : 0.11)) * size,
    top: held.y * size,
    width: held.size * size,
  } : undefined
  const grounded = p && pose === 'side' && p.id !== 'chick'
  const cls = [
    'avatar', frame ? '' : 'bare', bounce ? 'bounce' : '', mood === 'happy' ? 'happy' : '',
    live ? 'alive' : '', isPlaying && !action ? 'tap' : '', p ? 'with-pet' : '',
    p && `scene-${pose}`, contact || held ? 'scene-contact' : '', held ? 'scene-held' : '',
  ].filter(Boolean).join(' ')
  const h = hash(sd)
  return (
    <div ref={root} className={cls} style={{ width: size, height: size, ['--breath-delay' as string]: `-${h % 3000}ms`, ...lookVars }} onPointerDown={action || (interactive && held) ? undefined : () => play(companionKey)}>
      {frame && <div className="av-bg" style={{ background: BG[eq.bg ?? 'none'] ?? BG.none }} />}
      {cradle ? (
        <div key={isPlaying ? tap : 0} className={`av-stage av-illustration${isPlaying && action ? ` av-react-${p?.id}` : ''}`}>
          {uriCradle && <img src={uriCradle} alt={p ? `Kucağında ${p.name.toLocaleLowerCase('tr-TR')} tutan çocuk` : ''} draggable={false} />}
        </div>
      ) : (
        <div className={frame ? 'av-clip' : 'av-free'}>
          <div className="av-stage">
            <div className="av-body" key={tap ? 'b' + tap : 'b'}>
              <div className="av-head">
                {frame && !(uriAll || uriLow) && <span className="av-placeholder" style={{ background: skinColor(eq, sd, gender) }} />}
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
            {held && item && heldStyle && (
              <HeldScene key={heldPlaying ? tap : 0} art={held} kind={item} grip={uriHeldGrip}
                style={heldStyle} playing={!!(heldPlaying && playing?.motion)} />
            )}
            {grounded && <span className="av-companion-ground" aria-hidden="true"
              style={{ left: '83%', bottom: contact ? '3.5%' : '7%' }} />}
            {contact ? (
              uriContact && <img key={isPlaying ? tap : 0} className={`av-contact${isPlaying && action ? ` av-react-${p?.id}` : ''}`}
                src={uriContact} style={contactStyle} alt={p?.name ?? ''} draggable={false} />
            ) : p && (
              <img className="av-pet pose-side" src={fx(p.id)} alt={p.name} title={p.name} draggable={false} style={petStyle} />
            )}
          </div>
        </div>
      )}
      {action && <button type="button" className={`av-play-pet${pose === 'hug' ? ' av-play-pet-hug' : ''}`}
        onClick={() => play(companionKey)} aria-label={action.label} title={action.label} />}
      {interactive && held && item && <button type="button" className="av-play-held"
        style={heldStyle} onClick={() => play(item)} aria-label={HELD_ACTION[item]} title={HELD_ACTION[item]} />}
      {isPlaying && action && <span key={tap} className="av-companion-reply" role="status">{action.reply}</span>}
      {isPlaying && !action && <span className="av-hearts" key={tap} aria-hidden><i>💖</i><i>✨</i><i>💛</i></span>}
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

export function ItemPreview({ id, slot, animal, equipped, seed, gender }: { id: string; slot: string; animal: string; equipped: Equipped; seed: string; gender?: Gender | null }) {
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
    const color = slot === 'ccolor' ? ITEM.get(id) : pick(equipped, 'ccolor', seed, gender)
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
  if (slot === 'held') return <Avatar animal={animal} equipped={eq} seed={seed} gender={gender} size={90} pet={false} alive={false} />
  if (slot === 'pose') {
    const pet = petOf(animal, eq)
    return <Avatar animal={pet.id} equipped={eq} seed={seed} gender={gender} size={84} pet alive={false} />
  }
  const portrait = ['face', 'mouth', 'skin', 'ears', 'fshape', 'cheek', 'eyes', 'eshape', 'brow', 'nose'].includes(slot)
  const size = slot === 'fshape' ? 122 : portrait ? 112 : 84
  return <Avatar animal={animal} equipped={eq} seed={seed} gender={gender} size={size} pet={false} alive={false} />
}
