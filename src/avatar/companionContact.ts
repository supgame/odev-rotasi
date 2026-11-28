import type { Part } from './render'
import placement from '../../public/av/pose/hero/placement.json' with { type: 'json' }

export const COMPANION_ACTIONS: Partial<Record<string, { label: string; reply: string }>> = {
  cat: { label: 'Kediyi sev', reply: 'Mırr!' },
  dog: { label: 'Köpeğin patisini tut', reply: 'Çak!' },
  chick: { label: 'Civcive dokun', reply: 'Cik cik!' },
  rabbit: { label: 'Tavşanın burnuna dokun', reply: 'Pıt pıt!' },
}

export const HERO_PETS = Object.keys(COMPANION_ACTIONS)

export interface ContactArt {
  x: number
  y: number
  size: number
  pet: string
  hand: string
  sleeve: string
  skinRef: number
  sleeveRef: number
}

const CONTACTS: Readonly<Partial<Record<string, ContactArt>>> = placement

export function contactFor(petId: string, pose: string) {
  return CONTACTS[`${petId}-${pose}`]
}

const FIXED_SLEEVE: Partial<Record<string, string>> = {
  'clothes/knight.webp': '98949f',
  'clothes/dinosaur.webp': '567f42',
  'clothes/astronaut.webp': 'd9dbe0',
  'clothes/doctor.webp': 'dddbe9',
  'clothes/overalls.webp': '597694',
}

export function gripParts(art: Pick<ContactArt, 'sleeve' | 'hand' | 'skinRef' | 'sleeveRef'>, skin: string | undefined, garment: Part | null): Part[] {
  const cloth = garment?.color ?? FIXED_SLEEVE[garment?.src ?? ''] ?? '665565'
  return [
    { src: art.sleeve, color: cloth, ref: art.sleeveRef },
    { src: art.hand, color: skin, ref: art.skinRef },
  ]
}

export function contactParts(art: ContactArt, skin: string | undefined, garment: Part | null): Part[] {
  return [{ src: art.pet }, ...gripParts(art, skin, garment)]
}
