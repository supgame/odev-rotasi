// Avatar = karakter (catalog.ts SPECIES) + eşya katmanları (items.tsx). Tamamı SVG; gözler bakış/göz kırpma alır.
import { useId } from 'react'
import type { Equipped } from '../data/types'
import { SPECIES, type Species } from './catalog'
import { BackFeature, Body, Ears, Face, Marks, PreHead, headShape, type Look, type Mood } from './Character'
import { BG, Glasses, Hat, Neck } from './items'

const BY_ID = new Map(SPECIES.map((s) => [s.id, s]))
const BY_EMOJI = new Map<string, Species>()
for (const s of SPECIES) if (!BY_EMOJI.has(s.emoji)) BY_EMOJI.set(s.emoji, s)

/** Öğrencinin görünen karakteri: taktığı karakter, yoksa öğretmenin verdiği (tür id'si ya da eski emoji). */
export function speciesOf(animal: string, equipped?: Equipped): Species {
  const ch = equipped?.char?.replace(/^char_/, '')
  return (ch && BY_ID.get(ch)) || BY_ID.get(animal) || BY_EMOJI.get(animal) || SPECIES[0]
}

export function AvatarSvg({ sp, eq, look = { x: 0, y: 0 }, mood = 'idle', fit = false }: { sp: Species; eq: Equipped; look?: Look; mood?: Mood; fit?: boolean }) {
  const clip = 'h' + useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg viewBox="0 0 100 100" className="avatar-layer" aria-hidden overflow="visible">
      <defs><clipPath id={clip}>{headShape(sp)}</clipPath></defs>
      {/* çerçevede: tepedeki şapka/kulak kesilmesin diye hafif küçült, aşağı kaydır */}
      <g transform={fit ? 'translate(9 12) scale(.82)' : undefined}>
      <BackFeature sp={sp} />
      <Ears sp={sp} front={false} />
      <Body sp={sp} />
      <PreHead sp={sp} />
      {headShape(sp, { fill: sp.body, stroke: 'rgba(0,0,0,.2)', strokeWidth: 1.2 })}
      <g clipPath={`url(#${clip})`}><Marks sp={sp} /></g>
      <Ears sp={sp} front />
      <Face sp={sp} look={look} mood={mood} />
      {eq.neck && <Neck id={eq.neck} />}
      {eq.glasses && <Glasses id={eq.glasses} />}
      {eq.hat && <Hat id={eq.hat} />}
      </g>
    </svg>
  )
}

export function Avatar({ animal, equipped, size = 96, bounce = false, look, mood, frame = true }: {
  animal: string; equipped?: Equipped; size?: number; bounce?: boolean; look?: Look; mood?: Mood; frame?: boolean
}) {
  const eq = equipped ?? {}
  const sp = speciesOf(animal, eq)
  return (
    <div
      className={'avatar' + (frame ? '' : ' bare') + (bounce ? ' bounce' : '')}
      style={{ width: size, height: size, background: frame ? BG[eq.bg ?? 'none'] ?? BG.none : 'none' }}
    >
      <AvatarSvg sp={sp} eq={eq} look={look} mood={mood} fit={frame} />
    </div>
  )
}

/** Dükkanda tek eşyanın önizlemesi (öğrencinin şu anki karakteri üstünde). */
export function ItemPreview({ id, slot, animal, equipped }: { id: string; slot: string; animal: string; equipped: Equipped }) {
  const base: Equipped = slot === 'char' ? { char: id } : { char: equipped.char, [slot]: id }
  return <Avatar animal={animal} equipped={base} size={76} />
}
