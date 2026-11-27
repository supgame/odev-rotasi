// Avatar = Avataaars çocuk (ten, saç, saç rengi, şapka, gözlük, kıyafet, ifade) + yanında hayvan arkadaşı + arka plan.
// Şapka/gözlük/saç aynı çizim setinden geldiği için kafaya kendiliğinden oturur; elle konum ayarı yok.
import type { CSSProperties } from 'react'
import { createAvatar } from '@dicebear/core'
import * as avataaars from '@dicebear/avataaars'
import type { Equipped } from '../data/types'
import { BG } from './bg'
import { ITEMS, SPECIES, fx, type CatalogItem, type ItemSlot, type Species } from './catalog'

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
  skin: FREE('skin'), hair: FREE('hair', ['hair_hijab']), hcolor: FREE('hcolor'), clothes: FREE('clothes'), ccolor: FREE('ccolor'),
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

export const skinColor = (eq: Equipped, seed: string) => '#' + (pick(eq, 'skin', seed)?.v ?? 'edb98a')

const cache = new Map<string, string>()
function svgUri(eq: Equipped, seed: string, mood?: Mood): string {
  const hat = pick(eq, 'hat', seed), hair = pick(eq, 'hair', seed)!, gl = pick(eq, 'glasses', seed)
  const cl = pick(eq, 'clothes', seed)!, face = (pick(eq, 'face', seed)?.v ?? 'default|defaultNatural|smile').split('|')
  let [eyes, brows, mouth] = face
  if (mood === 'happy') { eyes = eyes === 'hearts' ? 'hearts' : 'happy'; brows = 'raisedExcitedNatural'; mouth = 'smile' }
  const opt = {
    top: [hat ? hat.v! : hair.v!],
    hatColor: [hat?.v2 ?? '262e33'],
    hairColor: [pick(eq, 'hcolor', seed)!.v!],
    skinColor: [pick(eq, 'skin', seed)!.v!],
    accessories: [gl?.v ?? 'round'], accessoriesProbability: gl ? 100 : 0, accessoriesColor: [gl?.v2 ?? '262e33'],
    clothing: [cl.v!], clothingGraphic: [cl.v2 ?? 'bear'], clothesColor: [pick(eq, 'ccolor', seed)!.v!],
    eyes: [eyes], eyebrows: [brows], mouth: [mouth], facialHairProbability: 0, topProbability: 100,
  }
  const key = JSON.stringify(opt)
  let uri = cache.get(key)
  if (!uri) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    uri = createAvatar(avataaars, { ...(opt as any), seed: 'x' }).toDataUri()
    cache.set(key, uri)
  }
  return uri
}

/** Kart kenarından bakarken (çerçevesiz avatar): görselin ne kadarı kartın üstünde kalsın. */
export function peekMetrics(size: number) {
  return { offset: Math.round(0.7 * size), room: Math.round(0.68 * size) }
}

// Çerçeve: alt yarı dairenin içinde kalır, kafa ve şapka dairenin üstünden taşabilir (profil rozeti gibi).
const UP = 0.2 // kutunun üstünde kafaya ayrılan pay (boyuta oranı)
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
  return (
    <div className={'avatar' + (frame ? '' : ' bare') + (bounce ? ' bounce' : '') + (mood === 'happy' ? ' happy' : '')} style={{ width: size, height: size }}>
      {frame && <div className="av-bg" style={{ background: BG[eq.bg ?? 'none'] ?? BG.none }} />}
      <div className={frame ? 'av-clip' : 'av-free'} style={frame ? clipStyle(size) : undefined}>
        <div className="av-stage" style={{ transform: tilt }}>
          <img className="av-kid" src={svgUri(eq, sd, mood)} alt="" draggable={false} style={frame ? { top: (UP - 0.04) * size, left: -0.06 * size, width: 1.12 * size } : undefined} />
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
    return <div className="pet-preview body"><Avatar animal={animal} equipped={eq} seed={seed} size={84} frame={false} /></div>
  return <Avatar animal={animal} equipped={eq} seed={seed} size={84} pet={false} />
}
