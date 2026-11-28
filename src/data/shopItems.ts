import type { ShopItem } from './types'
import { ITEMS, SPECIES, petItemId } from '../avatar/catalog'

// Dükkan kataloğu src/avatar/catalog.ts'den üretilir. Canlıda shop_items tablosundan gelir (aynı id'ler);
// tabloyu güncellemek için: node scripts/shop-sql.ts > supabase/migrations/... (bkz. README).
export const SHOP_ITEMS: ShopItem[] = [
  ...ITEMS.map(({ id, slot, name, price }) => ({ id, slot, name, price })),
  ...SPECIES.map((s) => ({ id: petItemId(s.id), slot: 'pet' as const, name: s.name, price: s.price })),
]

// Sekme sırası da bu sıradır.
export const SLOT_NAMES: Record<string, string> = {
  hat: 'Şapka',
  glasses: 'Gözlük',
  clothes: 'Kıyafet',
  held: 'Elimde',
  ccolor: 'Kıyafet rengi',
  hair: 'Saç',
  hcolor: 'Saç rengi',
  face: 'Yüz ifadesi',
  mouth: 'Ağız',
  nose: 'Burun',
  brow: 'Kaş',
  eshape: 'Göz biçimi',
  skin: 'Ten',
  fshape: 'Yüz şekli',
  ears: 'Kulak',
  eyes: 'Göz rengi',
  cheek: 'Yanak',
  pet: 'Arkadaşı',
  pose: 'Poz',
  bg: 'Arka plan',
}
