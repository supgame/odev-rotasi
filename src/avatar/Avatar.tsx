// Avatar = Fluent Emoji 3D karakter + kafa süsü + gözlük + elindeki eşya + arkadaşı + arka plan.
// Yerleşim: anchors.ts (karakterde kafa/göz yeri) ve fxmeta.ts (her görselin dolu alanı).
import type { CSSProperties } from 'react'
import type { Equipped } from '../data/types'
import { ANCHORS } from './anchors'
import { BG } from './bg'
import { SPECIES, fx, type Species } from './catalog'
import { FXMETA } from './fxmeta'

export type Mood = 'idle' | 'happy'
export interface Look { x: number; y: number } // -1..1

const BY_ID = new Map(SPECIES.map((s) => [s.id, s]))
const BY_EMOJI = new Map<string, Species>()
for (const s of SPECIES) if (!BY_EMOJI.has(s.emoji)) BY_EMOJI.set(s.emoji, s)

/** Öğrencinin görünen karakteri: taktığı karakter, yoksa öğretmenin verdiği (tür id'si ya da eski emoji). */
export function speciesOf(animal: string, equipped?: Equipped): Species {
  const ch = equipped?.char?.replace(/^char_/, '')
  return (ch && BY_ID.get(ch)) || BY_ID.get(animal) || BY_EMOJI.get(animal) || SPECIES[0]
}
export const canWearGlasses = (sp: Species) => (ANCHORS[sp.id]?.[5] ?? 0) > 0
export const pawColor = (sp: Species) => FXMETA[sp.id]?.c ?? '#f28a3c'
/** Kart kenarından bakarken: görselin ne kadarı görünsün (göz hizasının biraz altına kadar) ve üstte ne kadar yer lazım. */
export function peekMetrics(sp: Species, size: number, hasHat: boolean) {
  const ey = ANCHORS[sp.id]?.[4] ?? 0.5
  const top = FXMETA[sp.id]?.b[1] ?? 0.1
  const cut = Math.min(0.8, ey + 0.14)
  return { offset: Math.round(cut * size), room: Math.round((cut - top) * size + (hasHat ? 34 : 10)) }
}

// Kafa süsü ayarı: [genişlik çarpanı (kafa genişliğine göre), kafaya gömülme, yana kayma]
const HATFIT: Record<string, [number, number, number]> = {
  hat_headphone: [1.3, 0.62, 0], hat_helmet: [1.1, 0.22, 0], hat_cap: [1.05, 0.22, 0], hat_sunhat: [1.3, 0.2, 0],
  hat_tophat: [0.8, 0.03, 0], hat_crown: [0.75, 0.1, 0], hat_grad: [1.0, 0.14, 0], hat_mushroom: [1.0, 0.18, 0],
  hat_rainbow: [1.1, 0.02, 0], hat_cloud: [0.95, 0.02, 0], hat_cake: [0.8, 0.04, 0], hat_icecream: [0.6, 0.03, 0],
  hat_ribbon: [0.5, 0.12, 0.28], hat_blossom: [0.42, 0.12, 0.3], hat_tulip: [0.36, 0.1, 0.3], hat_hibiscus: [0.45, 0.12, 0.3],
  hat_sunflower: [0.48, 0.12, 0.28], hat_clover: [0.4, 0.1, -0.28], hat_feather: [0.42, 0.1, 0.25], hat_sprout: [0.5, 0.04, 0],
  hat_star: [0.55, 0.03, 0], hat_glowstar: [0.6, 0.03, 0], hat_bulb: [0.5, 0.01, 0], hat_chick: [0.62, 0.06, 0],
  hat_bird: [0.6, 0.05, 0.1], hat_butterfly: [0.6, 0.04, 0.12], hat_ladybug: [0.5, 0.05, 0.12],
}

type Box = { l: number; t: number; w: number } // karakter kutusu (avatar kutusunun yüzdesi)

/** Bir görseli, dolu alanının (FXMETA) istenen yere ve genişliğe oturacağı şekilde yerleştirir. */
function placed(id: string, box: Box, cx: number, w: number, y: number, yAt: 'bottom' | 'center'): CSSProperties {
  const b = FXMETA[id]?.b ?? [0, 0, 1, 1]
  const W = w / Math.max(0.05, b[2] - b[0]) // görselin tam genişliği (karakter kutusu biriminde)
  const left = cx - W * ((b[0] + b[2]) / 2)
  const top = yAt === 'bottom' ? y - W * b[3] : y - W * ((b[1] + b[3]) / 2)
  return { left: `${box.l + left * box.w}%`, top: `${box.t + top * box.w}%`, width: `${W * box.w}%` }
}

function Img({ id, style, className }: { id: string; style?: CSSProperties; className?: string }) {
  return <img src={fx(id)} alt="" draggable={false} decoding="async" className={'av-img ' + (className ?? '')} style={style} />
}

export function AvatarLayers({ sp, eq, box, extras }: { sp: Species; eq: Equipped; box: Box; extras: boolean }) {
  const a = ANCHORS[sp.id] ?? [0.5, 0.2, 0.6, 0.5, 0.5, 0.25]
  const [hx, hy, hw, ex, ey, ed] = a
  const ok = (id?: string) => (id && FXMETA[id] ? id : null) // katalogdan kalkmış eski eşya çizilmez
  const hat = ok(eq.hat)
  const hf = hat ? HATFIT[hat] ?? [1, 0.12, 0] : null
  const glasses = ed > 0 ? ok(eq.glasses) : null
  const pet = ok(eq.pet), item = ok(eq.item)
  return (
    <>
      <Img id={sp.id} className="av-char" style={{ left: `${box.l}%`, top: `${box.t}%`, width: `${box.w}%` }} />
      {glasses && <Img id={glasses} style={placed(glasses, box, ex, ed * (glasses === 'glasses_diving' ? 2.0 : glasses === 'glasses_goggles' ? 2.1 : 1.8), ey, 'center')} />}
      {hat && hf && <Img id={hat} className="av-hat" style={placed(hat, box, hx + hf[2] * hw, Math.min(0.9, Math.max(0.24 * hf[0], hw * hf[0])), hy + hf[1] * hw, 'bottom')} />}
      {extras && pet && <Img id={pet} className="av-pet" style={{ left: '-6%', top: '62%', width: '40%' }} />}
      {extras && item && <Img id={item} className="av-item" style={{ left: '64%', top: '60%', width: '42%' }} />}
    </>
  )
}

export function Avatar({ animal, equipped, size = 96, bounce = false, look, mood, frame = true }: {
  animal: string; equipped?: Equipped; size?: number; bounce?: boolean; look?: Look; mood?: Mood; frame?: boolean
}) {
  const eq = equipped ?? {}
  const sp = speciesOf(animal, eq)
  const tilt = look ? `rotate(${look.x * 7}deg) translateY(${look.y * 2}%)` : undefined
  return (
    <div className={'avatar' + (frame ? '' : ' bare') + (bounce ? ' bounce' : '') + (mood === 'happy' ? ' happy' : '')} style={{ width: size, height: size }}>
      {frame && <div className="av-bg" style={{ background: BG[eq.bg ?? 'none'] ?? BG.none }} />}
      <div className="av-stage" style={{ transform: tilt }}>
        <AvatarLayers sp={sp} eq={eq} box={frame ? { l: 11, t: 13, w: 78 } : { l: 0, t: 0, w: 100 }} extras={frame} />
      </div>
    </div>
  )
}

/** Dükkanda tek eşyanın önizlemesi (öğrencinin şu anki karakteri üstünde; gözlük uymuyorsa tilkide). */
export function ItemPreview({ id, slot, animal, equipped }: { id: string; slot: string; animal: string; equipped: Equipped }) {
  if (slot === 'char') return <Avatar animal={animal} equipped={{ char: id }} size={84} />
  let ch = equipped.char
  if (slot === 'glasses' && !canWearGlasses(speciesOf(animal, equipped))) ch = 'char_fox'
  return <Avatar animal={animal} equipped={{ char: ch, [slot]: id }} size={84} />
}
