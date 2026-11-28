import art from '../../public/av/held/art.json' with { type: 'json' }

export type HeldKind = keyof typeof art

export interface HeldArt {
  x: number
  y: number
  size: number
  item: string
  hand: string
  sleeve: string
  skinRef: number
  sleeveRef: number
  fixed?: string
  page?: string
  motion?: string
}

export const HELD_ACTION: Record<HeldKind, string> = {
  football: 'Topu avucunda sektir',
  book: 'Kitabın sayfasını çevir',
  kite: 'Uçurtmaya ip ver',
  toycar: 'Arabayı avucunda sür',
  flower: 'Çiçeği uzat',
}

export function heldKind(id?: string): HeldKind | undefined {
  const key = id?.slice('held_'.length)
  return id?.startsWith('held_') && key && Object.hasOwn(art, key) ? key as HeldKind : undefined
}

export const HELD_ART: Record<HeldKind, HeldArt> = art
