import type { ShopItem } from './types'
import { ITEMS, SPECIES, charItemId } from '../avatar/catalog'

// Dükkan kataloğu src/avatar/catalog.ts'den üretilir. Canlıda shop_items tablosundan gelir (aynı id'ler);
// tabloyu güncellemek için: node scripts/shop-sql.ts > supabase/migrations/... (bkz. README).
export const SHOP_ITEMS: ShopItem[] = [
  ...SPECIES.map((s) => ({ id: charItemId(s.id), slot: 'char' as const, name: s.name, price: s.price })),
  ...ITEMS,
]

export const SLOT_NAMES: Record<string, string> = {
  char: 'Karakter',
  hat: 'Kafa süsü',
  glasses: 'Gözlük',
  item: 'Elindeki',
  pet: 'Arkadaşı',
  bg: 'Arka plan',
}
