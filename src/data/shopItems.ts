import type { ShopItem } from './types'

// Demo modunda kullanılan dükkan. Canlıda shop_items tablosundan gelir (aynı id'ler).
export const SHOP_ITEMS: ShopItem[] = [
  { id: 'hat_party', slot: 'hat', name: 'Parti şapkası', price: 10 },
  { id: 'hat_crown', slot: 'hat', name: 'Taç', price: 60 },
  { id: 'hat_cap', slot: 'hat', name: 'Kasket', price: 20 },
  { id: 'hat_wizard', slot: 'hat', name: 'Büyücü şapkası', price: 45 },
  { id: 'glasses_round', slot: 'glasses', name: 'Yuvarlak gözlük', price: 10 },
  { id: 'glasses_star', slot: 'glasses', name: 'Yıldız gözlük', price: 35 },
  { id: 'glasses_sun', slot: 'glasses', name: 'Güneş gözlüğü', price: 25 },
  { id: 'neck_bow', slot: 'neck', name: 'Papyon', price: 10 },
  { id: 'neck_scarf', slot: 'neck', name: 'Atkı', price: 20 },
  { id: 'neck_medal', slot: 'neck', name: 'Madalya', price: 50 },
  { id: 'bg_sky', slot: 'bg', name: 'Gökyüzü', price: 10 },
  { id: 'bg_grass', slot: 'bg', name: 'Çimen', price: 15 },
  { id: 'bg_space', slot: 'bg', name: 'Uzay', price: 40 },
  { id: 'bg_rainbow', slot: 'bg', name: 'Gökkuşağı', price: 55 },
]

export const SLOT_NAMES: Record<string, string> = {
  hat: 'Şapka',
  glasses: 'Gözlük',
  neck: 'Boyun',
  bg: 'Arka plan',
}
