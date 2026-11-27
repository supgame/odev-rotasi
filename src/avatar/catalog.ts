// Avatar kataloğu: tek kaynak. Hem site (dükkan, çizim) hem SQL (scripts/shop-sql.ts) buradan beslenir.
// Çocuk ve eşyalar: ImageGen ile üretilmiş katmanlar (public/av, tarif: gelistirme/avatar_uretim/). Katalog public/av/manifest.json'dan okunur.
// Arkadaşı (hayvan): aynı çizgide ImageGen görseli, public/av/pet (manifest'in pet bölümü). Species.src eski Fluent adı, artık kullanılmıyor.
// Bu dosya yalnız manifest'i import eder (node ile doğrudan çalışabilsin diye).
import M from '../../public/av/manifest.json' with { type: 'json' }
import type { Equipped, Slot } from '../data/types'

export const RABBIT_CRADLE: Equipped = {
  skin: 'skin_tan', hair: 'hair_side_part', hcolor: 'hcolor_dark_brown', clothes: 'clothes_tshirt', ccolor: 'ccolor_gray',
  fshape: 'fshape_oval', ears: 'ears_small', cheek: 'cheek_none', eyes: 'eyes_brown', face: 'face_smile', pose: 'pose_hug',
}

export interface Species {
  id: string
  name: string
  price: number
  emoji: string
  src: string
}

const S = (id: string, name: string, price: number, emoji: string, src: string): Species => ({ id, name, price, emoji, src })

// Hayvanlar = "Arkadaşı" yuvası. Öğretmenin verdiği hayvan hep öğrencinindir. Fiyat 0 = bedava.
export const SPECIES: Species[] = [
  S('fox', 'Tilki', 0, '🦊', 'Fox'),
  S('cat', 'Kedi', 0, '🐱', 'Cat face'),
  S('dog', 'Köpek', 0, '🐶', 'Dog face'),
  S('bear', 'Ayı', 0, '🐻', 'Bear'),
  S('rabbit', 'Tavşan', 0, '🐰', 'Rabbit face'),
  S('panda', 'Panda', 0, '🐼', 'Panda'),
  S('frog', 'Kurbağa', 0, '🐸', 'Frog'),
  S('lion', 'Aslan', 0, '🦁', 'Lion'),
  S('chick', 'Civciv', 0, '🐥', 'Front-facing baby chick'),
  S('pig', 'Domuz', 0, '🐷', 'Pig face'),

  S('tiger', 'Kaplan', 15, '🐯', 'Tiger face'),
  S('monkey', 'Maymun', 15, '🐵', 'Monkey face'),
  S('mouse', 'Fare', 15, '🐭', 'Mouse face'),
  S('hamster', 'Hamster', 15, '🐹', 'Hamster'),
  S('cow', 'İnek', 15, '🐮', 'Cow face'),
  S('owl', 'Baykuş', 15, '🦉', 'Owl'),
  S('penguin', 'Penguen', 15, '🐧', 'Penguin'),
  S('chicken', 'Tavuk', 15, '🐔', 'Chicken'),
  S('duck', 'Ördek', 15, '🦆', 'Duck'),
  S('koala', 'Koala', 20, '🐨', 'Koala'),
  S('wolf', 'Kurt', 20, '🐺', 'Wolf'),
  S('raccoon', 'Rakun', 20, '🦝', 'Raccoon'),
  S('horse', 'At', 20, '🐴', 'Horse face'),
  S('zebra', 'Zebra', 20, '🦓', 'Zebra'),
  S('polar', 'Kutup ayısı', 20, '🐻‍❄️', 'Polar bear'),
  S('boar', 'Yaban domuzu', 20, '🐗', 'Boar'),
  S('blackcat', 'Kara kedi', 20, '🐈‍⬛', 'Black cat'),
  S('poodle', 'Kaniş', 20, '🐩', 'Poodle'),
  S('hedgehog', 'Kirpi', 20, '🦔', 'Hedgehog'),
  S('chipmunk', 'Sincap', 20, '🐿️', 'Chipmunk'),
  S('turtle', 'Kaplumbağa', 20, '🐢', 'Turtle'),
  S('snail', 'Salyangoz', 20, '🐌', 'Snail'),
  S('bee', 'Arı', 20, '🐝', 'Honeybee'),
  S('ladybug', 'Uğur böceği', 20, '🐞', 'Lady beetle'),
  S('butterfly', 'Kelebek', 20, '🦋', 'Butterfly'),
  S('fish', 'Tropik balık', 20, '🐠', 'Tropical fish'),
  S('blowfish', 'Balon balığı', 20, '🐡', 'Blowfish'),
  S('crab', 'Yengeç', 20, '🦀', 'Crab'),
  S('goat', 'Keçi', 20, '🐐', 'Goat'),
  S('ewe', 'Kuzu', 20, '🐑', 'Ewe'),
  S('rooster', 'Horoz', 20, '🐓', 'Rooster'),
  S('parrot', 'Papağan', 25, '🦜', 'Parrot'),
  S('flamingo', 'Flamingo', 25, '🦩', 'Flamingo'),
  S('dove', 'Güvercin', 25, '🕊️', 'Dove'),
  S('swan', 'Kuğu', 25, '🦢', 'Swan'),
  S('eagle', 'Kartal', 25, '🦅', 'Eagle'),
  S('octopus', 'Ahtapot', 25, '🐙', 'Octopus'),
  S('dolphin', 'Yunus', 25, '🐬', 'Dolphin'),
  S('whale', 'Balina', 25, '🐳', 'Spouting whale'),
  S('seal', 'Fok', 25, '🦭', 'Seal'),
  S('otter', 'Su samuru', 25, '🦦', 'Otter'),
  S('beaver', 'Kunduz', 25, '🦫', 'Beaver'),
  S('skunk', 'Kokarca', 25, '🦨', 'Skunk'),
  S('badger', 'Porsuk', 25, '🦡', 'Badger'),
  S('sloth', 'Tembel hayvan', 25, '🦥', 'Sloth'),
  S('kangaroo', 'Kanguru', 25, '🦘', 'Kangaroo'),
  S('llama', 'Lama', 25, '🦙', 'Llama'),
  S('camel', 'Deve', 25, '🐫', 'Two-hump camel'),
  S('deer', 'Geyik', 25, '🦌', 'Deer'),
  S('moose', 'Sığın', 30, '🫎', 'Moose'),
  S('bat', 'Yarasa', 30, '🦇', 'Bat'),
  S('giraffe', 'Zürafa', 30, '🦒', 'Giraffe'),
  S('elephant', 'Fil', 30, '🐘', 'Elephant'),
  S('hippo', 'Su aygırı', 30, '🦛', 'Hippopotamus'),
  S('rhino', 'Gergedan', 30, '🦏', 'Rhinoceros'),
  S('gorilla', 'Goril', 30, '🦍', 'Gorilla'),
  S('orangutan', 'Orangutan', 30, '🦧', 'Orangutan'),
  S('leopard', 'Leopar', 30, '🐆', 'Leopard'),
  S('bison', 'Bizon', 30, '🦬', 'Bison'),
  S('croc', 'Timsah', 30, '🐊', 'Crocodile'),
  S('lizard', 'Kertenkele', 30, '🦎', 'Lizard'),
  S('shark', 'Köpekbalığı', 35, '🦈', 'Shark'),
  S('peacock', 'Tavus kuşu', 35, '🦚', 'Peacock'),
  S('jelly', 'Denizanası', 35, '🪼', 'Jellyfish'),
  S('dodo', 'Dodo', 40, '🦤', 'Dodo'),
  S('mammoth', 'Mamut', 45, '🦣', 'Mammoth'),
  S('trex', 'T-Rex', 45, '🦖', 'T-rex'),
  S('sauropod', 'Uzun boyunlu dinozor', 45, '🦕', 'Sauropod'),
  S('unicorn', 'Unicorn', 50, '🦄', 'Unicorn'),
  S('dragon', 'Ejderha', 55, '🐲', 'Dragon face'),
  S('phoenix', 'Anka kuşu', 60, '🐦‍🔥', 'Phoenix bird'),
  S('robot', 'Robot', 40, '🤖', 'Robot'),
  S('alien', 'Uzaylı', 40, '👽', 'Alien'),
  S('invader', 'Uzay canavarı', 40, '👾', 'Alien monster'),
  S('ghost', 'Hayalet', 35, '👻', 'Ghost'),
  S('pumpkin', 'Balkabağı', 30, '🎃', 'Jack-o-lantern'),
  S('snowman', 'Kardan adam', 35, '⛄', 'Snowman without snow'),
  S('sun', 'Güneş', 45, '🌞', 'Sun with face'),
  S('moon', 'Dolunay', 45, '🌝', 'Full moon face'),
]

// ---- Dükkan eşyaları -------------------------------------------------------------------------------
export type ItemSlot = Slot
/** Manifest'teki ham eşya (katman yolları, maske, ref, renk). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Raw = Record<string, any>
export interface CatalogItem { id: string; slot: ItemSlot; name: string; price: number; raw: Raw }

export const MANIFEST = M as unknown as {
  base: { layer: string; skinMask: string; skinRef: number }
  order: string[]
  slots: Record<string, { items: Raw[] }>
  variants: {
    base: string; mask: string
    iris: { layer: string; mask: string; ref: number }
    cheek: Record<string, string>
    blink: { layer: string; mask: string; ref: number }
    eyes?: { layer: string; open: string; iris: { layer: string; mask: string; ref: number }; ownEyes: string[] }
    hands?: { layer: string; mask: string; ref: number }
    hairBackDx?: Record<string, number>
  }
}

// Fiyat düzeltmeleri (manifest'in önerisinin üstüne). Temel saçlar ve başörtüsü bedava.
const PRICE: Record<string, number> = {
  hair_curly: 0, hair_afro: 0, hair_straight_long: 0, hair_bob: 0, hair_bun: 0, hair_braids: 0, hair_side_part: 0, hair_headscarf: 0,
  hair_spiky: 15,
}
const fromManifest = (slot: ItemSlot): CatalogItem[] =>
  (MANIFEST.slots[slot]?.items ?? []).map((r) => ({ id: r.id, slot, name: r.name, price: PRICE[r.id] ?? r.price, raw: r }))

const I = (slot: ItemSlot, list: [string, string, number, Raw?][]): CatalogItem[] =>
  list.map(([id, name, price, raw]) => ({ id: `${slot}_${id}`, slot, name, price, raw: { key: id, ...raw } }))

// Yüz çeşitleri: tek tabanın dönüşümleri (gelistirme/avatar_uretim/yuz_varyant.py). Hepsi bedava, ilk gün rastgele dağılır.
export const FACE_ITEMS: CatalogItem[] = [
  ...I('fshape', [['oval', 'Oval', 0], ['round', 'Tombul', 0], ['long', 'Uzun', 0], ['square', 'Köşeli', 0], ['heart', 'Sivri çene', 0], ['wide', 'Geniş', 0]]),
  ...I('ears', [['small', 'Küçük', 0], ['medium', 'Orta', 0], ['big', 'Kepçe', 0]]),
  ...I('eyes', [
    ['brown', 'Kahverengi', 0], ['dark', 'Koyu', 0, { color: '5a3420' }], ['hazel', 'Ela', 0, { color: '8c6d35' }],
    ['green', 'Yeşil', 0, { color: '5fae4e' }], ['blue', 'Mavi', 0, { color: '4f95e8' }], ['gray', 'Gri', 0, { color: '9aa8b8' }],
    ['purple', 'Mor', 10, { color: 'a46be8' }], ['gold', 'Altın', 15, { color: 'f2b632' }], ['red', 'Kırmızı', 15, { color: 'e8505b' }],
  ]),
  ...I('cheek', [['none', 'Sade', 0], ['blush', 'Pembe yanak', 0], ['freckles', 'Çilli', 0], ['both', 'Çil ve allık', 0]]),
  ...I('mouth', [
    ['expression', 'İfadeye göre', 0],
    ['smile', 'Kapalı gülümseme', 0],
    ['bigsmile', 'Dişli gülüş', 0, { sourceFace: 'face_bigsmile' }],
    ['smirk', 'Yarım gülüş', 0, { sourceFace: 'face_smirk' }],
    ['surprised', 'Yuvarlak ağız', 0, { sourceFace: 'face_surprised' }],
    ['tongue', 'Dil çıkarma', 0, { sourceFace: 'face_tongue' }],
  ]),
  ...I('nose', [
    ['original', 'Klasik burun', 0],
    ['button', 'Yuvarlak burun', 0, { layer: 'features/nose_button.webp' }],
    ['wide', 'Geniş burun', 0, { layer: 'features/nose_wide.webp' }],
    ['straight', 'Kısa düz burun', 0, { layer: 'features/nose_straight.webp' }],
  ]),
  ...I('brow', [
    ['expression', 'İfadeye göre', 0],
    ['soft', 'Yumuşak kavis', 0, { layer: 'features/brow_soft.webp' }],
    ['straight', 'Düz kaş', 0, { layer: 'features/brow_straight.webp' }],
    ['bold', 'Kalın kaş', 0, { layer: 'features/brow_bold.webp' }],
  ]),
  ...I('eshape', [
    ['expression', 'İfadeye göre', 0],
    ['round', 'Yuvarlak göz', 0, { layer: 'features/eshape_round.webp', mask: 'features/eshape_round_mask.webp', ref: 81 }],
    ['almond', 'Badem göz', 0, { layer: 'features/eshape_almond.webp', mask: 'features/eshape_almond_mask.webp', ref: 81 }],
    ['gentle', 'Yumuşak göz', 0, { layer: 'features/eshape_gentle.webp', mask: 'features/eshape_gentle_mask.webp', ref: 81 }],
  ]),
]

// Arkadaşın duruşu: yalnız konum ve hareket (Avatar.tsx + index.css .pose-*).
export const POSE_ITEMS: CatalogItem[] = I('pose', [
  ['side', 'Yanımda', 0], ['shoulder', 'Omzumda', 0], ['hug', 'Kucağımda', 0], ['peek', 'Arkamdan bakıyor', 0], ['head', 'Başımda', 10],
])

export const ITEMS: CatalogItem[] = [
  ...(['skin', 'hair', 'hcolor', 'hat', 'glasses', 'clothes', 'ccolor', 'face'] as ItemSlot[]).flatMap(fromManifest),
  ...FACE_ITEMS,
  ...POSE_ITEMS,
  ...I('bg', [
    ['polka', 'Puantiye', 10], ['checker', 'Damalı', 10], ['sky', 'Gökyüzü', 10], ['grass', 'Çimen', 15],
    ['sunset', 'Gün batımı', 15], ['sea', 'Deniz', 15], ['board', 'Kara tahta', 15], ['forest', 'Orman', 20],
    ['snow', 'Kar', 20], ['desert', 'Çöl', 20], ['autumn', 'Sonbahar', 20], ['candy', 'Şeker', 25],
    ['mountain', 'Dağlar', 25], ['night', 'Yıldızlı gece', 30], ['bubbles', 'Pembe baloncuk', 30], ['under', 'Su altı', 35],
    ['space', 'Uzay', 40], ['lava', 'Volkan', 45], ['rainbow', 'Gökkuşağı', 55], ['gold', 'Altın', 70],
  ]),
]

export const petItemId = (speciesId: string) => `pet_${speciesId}`
const PET_IMG = new Map<string, string>((MANIFEST.slots.pet?.items ?? []).filter((r) => r.image).map((r) => [String(r.id).replace(/^pet_/, ''), r.image]))
const BASE_URL = import.meta.env?.BASE_URL ?? '/'
/** Hayvan görseli (Vite base'e göre). */
export const fx = (id: string) => `${BASE_URL}av/${PET_IMG.get(id) ?? PET_IMG.get('fox')}`
