// Cinsiyet yalnız iki şeyi belirler: takılmamış yuvaların başlangıç havuzu ve dükkânda öneri sırası.
// Hiçbir eşyayı kilitlemez, gövde çizimi ortaktır. Cinsiyeti boş (eski) kayıt Avatar.tsx'teki DEF'i kullanır, görünümü değişmez.
import type { Gender, Slot } from '../data/types'

/** Başlangıç havuzları (hepsi bedava). Listede olmayan yuva ortak DEF'ten gelir. */
export const GENDER_DEFAULTS: Record<Gender, Partial<Record<Slot, string[]>>> = {
  kiz: {
    hair: ['hair_ponytail', 'hair_straight_long', 'hair_bob', 'hair_bun', 'hair_braids'],
    ccolor: ['ccolor_red', 'ccolor_white', 'ccolor_blue', 'ccolor_navy'],
    brow: ['brow_soft', 'brow_expression'],
    eshape: ['eshape_expression', 'eshape_sparkle', 'eshape_almond', 'eshape_gentle', 'eshape_upturned'],
    cheek: ['cheek_none', 'cheek_blush', 'cheek_blush', 'cheek_both', 'cheek_freckles'],
  },
  erkek: {
    hair: ['hair_short', 'hair_side_part', 'hair_short', 'hair_side_part', 'hair_curly', 'hair_afro'],
    ccolor: ['ccolor_blue', 'ccolor_navy', 'ccolor_gray', 'ccolor_black', 'ccolor_red'],
    brow: ['brow_straight', 'brow_bold', 'brow_expression'],
    eshape: ['eshape_plain', 'eshape_plain_almond'],
    cheek: ['cheek_none', 'cheek_none', 'cheek_freckles'],
  },
}

// "Sana önerilenler": id ya da id öneki. Yalnız sıralamayı öne alır.
const RECOMMENDED: Record<Gender, string[]> = {
  kiz: [
    'hair_ponytail', 'hair_straight_long', 'hair_bob', 'hair_bun', 'hair_braids', 'hair_space_buns', 'hair_wavy_long', 'hair_bangs_long', 'hair_headscarf',
    'hat_pom_', 'hat_cat_', 'hat_bear_pink', 'hat_bucket_pink', 'hat_crown',
    'glasses_heart_', 'glasses_star_', 'glasses_round_',
    'clothes_overalls', 'clothes_striped_tee', 'clothes_collared_sweater', 'clothes_winter_coat', 'clothes_doctor',
    'ccolor_pink', 'ccolor_fuchsia', 'ccolor_purple', 'ccolor_mint', 'ccolor_lemon', 'ccolor_sky',
    'held_flower', 'held_book', 'held_kite',
    'eshape_sparkle', 'eshape_upturned', 'eshape_gentle', 'eshape_almond', 'brow_soft', 'cheek_blush', 'cheek_both',
  ],
  erkek: [
    'hair_short', 'hair_side_part', 'hair_spiky', 'hair_afro',
    'hat_cap_', 'hat_cowboy_', 'hat_pirate', 'hat_pilot', 'hat_wizard_', 'hat_earflap_',
    'glasses_aviator_', 'glasses_sunglasses_', 'glasses_square_', 'glasses_eyepatch',
    'clothes_football', 'clothes_tracksuit', 'clothes_astronaut', 'clothes_knight', 'clothes_superhero', 'clothes_dinosaur',
    'ccolor_navy', 'ccolor_black', 'ccolor_green', 'ccolor_orange', 'ccolor_sky',
    'held_football', 'held_toycar', 'held_kite',
    'eshape_plain', 'brow_straight', 'brow_bold',
  ],
}

export function isRecommended(id: string, gender?: Gender | null): boolean {
  if (!gender) return false
  return RECOMMENDED[gender].some((r) => (r.endsWith('_') ? id.startsWith(r) : id === r || (r === 'eshape_plain' && id.startsWith(r))))
}

export const GENDER_LABEL: Record<Gender, string> = { kiz: 'Kız', erkek: 'Erkek' }
