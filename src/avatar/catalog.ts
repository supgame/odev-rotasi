// Avatar kataloğu: tek kaynak. Hem site (dükkan, çizim) hem SQL (scripts/shop-sql.ts) buradan beslenir.
// Bu dosya başka dosya import ETMEZ (node ile doğrudan çalışabilsin diye).

export type Ears =
  | 'point' | 'round' | 'smallround' | 'biground' | 'long' | 'droop' | 'big' | 'tuft' | 'horns'
  | 'antenna' | 'unihorn' | 'dragon' | 'antlers' | 'ossicone' | 'side' | 'fin' | 'comb' | 'bat' | 'goat' | 'none'
export type Back = 'mane' | 'spikes' | 'wool' | 'dinospikes' | 'wings' | 'leaf' | 'crest' | 'petals' | 'rays' | 'none'
export type Mark =
  | 'muzzle' | 'facedisc' | 'faceheart' | 'mask' | 'patches' | 'stripes' | 'zebra' | 'spots' | 'belly'
  | 'cheekfluff' | 'blaze' | 'monkeyface' | 'freckles' | 'bands' | 'ribs' | 'hexes' | 'seeds' | 'screen'
export type Nose = 'tri' | 'round' | 'pink' | 'snout' | 'beak' | 'bill' | 'trunk' | 'bignose' | 'carrot' | 'hook' | 'none'
export type Extra =
  | 'whiskers' | 'teeth' | 'fangs' | 'bolts' | 'tentacles' | 'thirdeye' | 'frogdomes' | 'wideMouth'
  | 'nocheeks' | 'beard' | 'flower' | 'stem' | 'wavy' | 'bigeyes' | 'sparkle'
export type Shape = 'round' | 'wide' | 'tall' | 'square' | 'drop'

export interface Species {
  id: string
  name: string
  price: number
  body: string // ana renk
  accent: string // ağız/yüz açığı
  mark?: string // desen rengi
  ear?: string // kulak/boynuz rengi (yoksa body)
  inner?: string // kulak içi
  back?: string // yele/diken rengi
  ears: Ears
  marks?: Mark[]
  nose: Nose
  extras?: Extra[]
  backKind?: Back
  shape?: Shape
  emoji: string // öğretmen listesinde ve eski kayıtlarda
}

const S = (id: string, name: string, price: number, emoji: string, o: Omit<Species, 'id' | 'name' | 'price' | 'emoji'>): Species =>
  ({ id, name, price, emoji, ...o })

// Fiyat: 0 = başlangıç karakteri (dükkandan bedava alınır), gerisi yıldızla.
export const SPECIES: Species[] = [
  // --- Başlangıç (bedava) ---
  S('fox', 'Tilki', 0, '🦊', { body: '#f28a3c', accent: '#fff4e6', inner: '#fff4e6', ears: 'point', marks: ['muzzle'], nose: 'tri' }),
  S('cat', 'Kedi', 0, '🐱', { body: '#f6b35f', accent: '#fff1dc', mark: '#d9822b', inner: '#ffc2c2', ears: 'point', marks: ['stripes', 'muzzle'], nose: 'pink', extras: ['whiskers'] }),
  S('dog', 'Köpek', 0, '🐶', { body: '#d3a06e', accent: '#f6e2c8', ear: '#8b5a35', ears: 'droop', marks: ['muzzle'], nose: 'round' }),
  S('bear', 'Ayı', 0, '🐻', { body: '#a06c43', accent: '#e8c9a4', inner: '#e8c9a4', ears: 'round', marks: ['muzzle'], nose: 'round' }),
  S('rabbit', 'Tavşan', 0, '🐰', { body: '#f3eef1', accent: '#ffffff', inner: '#ffb7c9', ears: 'long', nose: 'pink', extras: ['teeth', 'whiskers'] }),
  S('panda', 'Panda', 0, '🐼', { body: '#fbfbfb', accent: '#ffffff', mark: '#2c2c34', ear: '#2c2c34', ears: 'round', marks: ['patches'], nose: 'round' }),
  S('frog', 'Kurbağa', 0, '🐸', { body: '#7cc75b', accent: '#c9eeb0', ears: 'none', nose: 'none', extras: ['frogdomes', 'wideMouth'] }),
  S('lion', 'Aslan', 0, '🦁', { body: '#f4bf52', accent: '#fff0cc', back: '#d2782c', inner: '#f9dc9a', ears: 'smallround', marks: ['muzzle'], nose: 'tri', backKind: 'mane' }),
  S('chick', 'Civciv', 0, '🐥', { body: '#ffd84d', accent: '#fff0a8', ears: 'tuft', nose: 'beak' }),
  S('pig', 'Domuz', 0, '🐷', { body: '#f8aebd', accent: '#ffd0da', inner: '#f07f99', ears: 'point', nose: 'snout' }),

  // --- Hayvanlar ---
  S('tiger', 'Kaplan', 15, '🐯', { body: '#f6923a', accent: '#ffffff', mark: '#3b2a20', inner: '#ffffff', ears: 'smallround', marks: ['stripes', 'muzzle'], nose: 'pink', extras: ['whiskers'] }),
  S('owl', 'Baykuş', 15, '🦉', { body: '#8f6a4b', accent: '#e9d3b5', ears: 'tuft', marks: ['facedisc'], nose: 'beak', extras: ['bigeyes'] }),
  S('penguin', 'Penguen', 15, '🐧', { body: '#2f3654', accent: '#ffffff', ears: 'none', marks: ['faceheart'], nose: 'beak' }),
  S('mouse', 'Fare', 15, '🐭', { body: '#b9bcc8', accent: '#e8e9ef', inner: '#ffb7c9', ears: 'biground', nose: 'pink', extras: ['whiskers', 'teeth'] }),
  S('hamster', 'Hamster', 15, '🐹', { body: '#f2c48e', accent: '#fff7ec', inner: '#ffb7c9', ears: 'smallround', marks: ['cheekfluff'], nose: 'pink', extras: ['teeth'] }),
  S('duck', 'Ördek', 15, '🦆', { body: '#fdfdfd', accent: '#ffffff', ears: 'tuft', nose: 'bill' }),
  S('koala', 'Koala', 20, '🐨', { body: '#a8b0bc', accent: '#e4e7ec', inner: '#eceef2', ears: 'biground', nose: 'bignose' }),
  S('monkey', 'Maymun', 20, '🐵', { body: '#8a5a3b', accent: '#f1cfa6', inner: '#f1cfa6', ears: 'side', marks: ['monkeyface'], nose: 'round' }),
  S('cow', 'İnek', 20, '🐮', { body: '#ffffff', accent: '#ffc4cf', mark: '#2c2c34', ear: '#ffffff', inner: '#ffc4cf', ears: 'horns', marks: ['spots'], nose: 'snout' }),
  S('sheep', 'Kuzu', 20, '🐑', { body: '#f6e8d6', accent: '#fff7ee', back: '#ffffff', ear: '#e9d4bb', ears: 'droop', nose: 'pink', backKind: 'wool' }),
  S('squirrel', 'Sincap', 20, '🐿️', { body: '#c9743a', accent: '#f6dcc0', inner: '#f6dcc0', ears: 'point', marks: ['muzzle'], nose: 'round', extras: ['teeth'] }),
  S('seal', 'Fok', 20, '🦭', { body: '#a3b7cc', accent: '#dce7f1', ears: 'none', marks: ['muzzle'], nose: 'round', extras: ['whiskers'] }),
  S('bee', 'Arı', 20, '🐝', { body: '#ffcf33', accent: '#fff1b0', mark: '#2c2c34', ear: '#2c2c34', ears: 'antenna', marks: ['bands'], nose: 'none', backKind: 'wings' }),
  S('ladybug', 'Uğur böceği', 20, '🐞', { body: '#e5484d', accent: '#ffd5d5', mark: '#2c2c34', ear: '#2c2c34', ears: 'antenna', marks: ['spots'], nose: 'none' }),
  S('fish', 'Balık', 20, '🐟', { body: '#4dabf7', accent: '#d0ebff', ear: '#1c7ed6', ears: 'fin', nose: 'none', extras: ['nocheeks'] }),
  S('goat', 'Keçi', 20, '🐐', { body: '#f4f1ea', accent: '#ffffff', ear: '#b9a58a', ears: 'goat', nose: 'pink', extras: ['beard'] }),
  S('raccoon', 'Rakun', 25, '🦝', { body: '#8f909a', accent: '#f2f2f4', mark: '#3a3a44', inner: '#f2f2f4', ears: 'point', marks: ['mask', 'muzzle'], nose: 'round' }),
  S('elephant', 'Fil', 25, '🐘', { body: '#a9b5c4', accent: '#c6d0dc', inner: '#f3c5cf', ears: 'big', nose: 'trunk' }),
  S('giraffe', 'Zürafa', 25, '🦒', { body: '#f6c94b', accent: '#fbe2a0', mark: '#b36b2c', ear: '#b36b2c', ears: 'ossicone', marks: ['spots', 'muzzle'], nose: 'none' }),
  S('zebra', 'Zebra', 25, '🦓', { body: '#ffffff', accent: '#5a5a66', mark: '#2c2c34', inner: '#5a5a66', ears: 'point', marks: ['zebra', 'muzzle'], nose: 'none' }),
  S('wolf', 'Kurt', 25, '🐺', { body: '#8c97a8', accent: '#f3f5f8', inner: '#f3f5f8', ears: 'point', marks: ['muzzle'], nose: 'tri' }),
  S('hedgehog', 'Kirpi', 25, '🦔', { body: '#f2d8b6', accent: '#fff4e4', back: '#7a5236', ears: 'smallround', nose: 'round', backKind: 'spikes' }),
  S('turtle', 'Kaplumbağa', 25, '🐢', { body: '#8bc34a', accent: '#d7efb8', mark: '#5f9a2c', ears: 'none', marks: ['hexes'], nose: 'none' }),
  S('horse', 'At', 25, '🐴', { body: '#a8693f', accent: '#f0d2b6', back: '#4a2c1a', inner: '#f0d2b6', ears: 'point', marks: ['blaze', 'muzzle'], nose: 'none', backKind: 'crest' }),
  S('parrot', 'Papağan', 25, '🦜', { body: '#38c172', accent: '#fff3a8', back: '#e5484d', ears: 'none', marks: ['facedisc'], nose: 'hook', backKind: 'crest' }),
  S('flamingo', 'Flamingo', 25, '🦩', { body: '#ff9ec2', accent: '#ffd6e6', ears: 'tuft', nose: 'hook' }),
  S('polar', 'Kutup ayısı', 25, '🐻‍❄️', { body: '#f7fbff', accent: '#ffffff', inner: '#dbe8f5', ears: 'round', marks: ['muzzle'], nose: 'round' }),
  S('deer', 'Geyik', 30, '🦌', { body: '#bb7c4b', accent: '#f6e1c9', mark: '#fff6ea', ear: '#8a5530', inner: '#f6e1c9', ears: 'antlers', marks: ['freckles', 'muzzle'], nose: 'round' }),
  S('bat', 'Yarasa', 30, '🦇', { body: '#6a5486', accent: '#a996c4', inner: '#c7b5e0', ears: 'bat', nose: 'pink', extras: ['fangs'], backKind: 'wings' }),
  S('cheetah', 'Çita', 30, '🐆', { body: '#f2c063', accent: '#fff3d6', mark: '#4a3523', inner: '#fff3d6', ears: 'smallround', marks: ['spots', 'muzzle'], nose: 'tri', extras: ['whiskers'] }),
  S('octopus', 'Ahtapot', 30, '🐙', { body: '#c77dff', accent: '#e8c8ff', mark: '#a855f7', ears: 'none', marks: ['freckles'], nose: 'none', extras: ['tentacles'], shape: 'tall' }),
  S('shark', 'Köpekbalığı', 35, '🦈', { body: '#7f9dbb', accent: '#f2f6fa', ear: '#6a87a5', ears: 'fin', marks: ['belly'], nose: 'none', extras: ['teeth', 'nocheeks', 'wideMouth'] }),
  S('croc', 'Timsah', 35, '🐊', { body: '#4caf50', accent: '#c5e8b0', mark: '#2f7d32', ears: 'none', marks: ['freckles', 'belly'], nose: 'none', extras: ['frogdomes', 'teeth', 'wideMouth'] }),
  S('peacock', 'Tavus kuşu', 40, '🦚', { body: '#2a7fd1', accent: '#c9f0e2', back: '#1fb58f', ears: 'tuft', nose: 'beak', backKind: 'petals' }),

  // --- Renk varyantları ---
  S('cat_black', 'Kara kedi', 20, '🐈‍⬛', { body: '#3a3a46', accent: '#5b5b6b', inner: '#ff9db2', ears: 'point', marks: ['muzzle'], nose: 'pink', extras: ['whiskers'] }),
  S('cat_white', 'Beyaz kedi', 20, '🐱', { body: '#fbfaf7', accent: '#ffffff', inner: '#ffc2c2', ears: 'point', nose: 'pink', extras: ['whiskers'] }),
  S('cat_gray', 'Tekir', 20, '🐱', { body: '#a6abb6', accent: '#e9ebef', mark: '#6b7280', inner: '#ffc2c2', ears: 'point', marks: ['stripes', 'muzzle'], nose: 'pink', extras: ['whiskers'] }),
  S('dog_dalmatian', 'Dalmaçyalı', 30, '🐶', { body: '#ffffff', accent: '#ffffff', mark: '#2c2c34', ear: '#2c2c34', ears: 'droop', marks: ['spots'], nose: 'round' }),
  S('dog_husky', 'Kurt köpeği', 30, '🐕', { body: '#7d8796', accent: '#ffffff', inner: '#ffffff', ears: 'point', marks: ['faceheart'], nose: 'round' }),
  S('fox_arctic', 'Kutup tilkisi', 30, '🦊', { body: '#eef4fb', accent: '#ffffff', inner: '#c9daf0', ears: 'point', marks: ['muzzle'], nose: 'tri' }),
  S('frog_blue', 'Mavi kurbağa', 25, '🐸', { body: '#3d8bfd', accent: '#a9cbff', mark: '#1a3a80', ears: 'none', marks: ['spots'], nose: 'none', extras: ['frogdomes', 'wideMouth'] }),
  S('bear_brown', 'Bal ayısı', 20, '🐻', { body: '#d9923f', accent: '#ffe0b0', inner: '#ffe0b0', ears: 'round', marks: ['muzzle'], nose: 'round' }),

  // --- Hayal ürünü ---
  S('dino', 'Dinozor', 40, '🦖', { body: '#6bcb77', accent: '#c8f0cc', back: '#2f9e44', ears: 'none', marks: ['freckles'], nose: 'none', extras: ['wideMouth'], backKind: 'dinospikes' }),
  S('dino_blue', 'Mavi dinozor', 40, '🦕', { body: '#5ab4f0', accent: '#cbe9ff', back: '#1971c2', ears: 'none', marks: ['freckles'], nose: 'none', extras: ['wideMouth'], backKind: 'dinospikes' }),
  S('dino_orange', 'Turuncu dinozor', 40, '🦖', { body: '#ff9f43', accent: '#ffe0bf', back: '#d9480f', ears: 'none', marks: ['freckles'], nose: 'none', extras: ['wideMouth'], backKind: 'dinospikes' }),
  S('dragon', 'Kırmızı ejderha', 50, '🐉', { body: '#e5584a', accent: '#ffd0b0', ear: '#ffd43b', back: '#b02a2a', ears: 'dragon', marks: ['belly'], nose: 'none', extras: ['fangs'], backKind: 'wings' }),
  S('dragon_green', 'Yeşil ejderha', 50, '🐲', { body: '#40c057', accent: '#d3f9d8', ear: '#ffd43b', back: '#2b8a3e', ears: 'dragon', marks: ['belly'], nose: 'none', extras: ['fangs'], backKind: 'wings' }),
  S('dragon_purple', 'Mor ejderha', 55, '🐉', { body: '#845ef7', accent: '#e5dbff', ear: '#ffd43b', back: '#5f3dc4', ears: 'dragon', marks: ['belly'], nose: 'none', extras: ['fangs'], backKind: 'wings' }),
  S('dragon_gold', 'Altın ejderha', 80, '🐉', { body: '#fcc419', accent: '#fff3bf', ear: '#e67700', back: '#e67700', ears: 'dragon', marks: ['belly'], nose: 'none', extras: ['fangs', 'sparkle'], backKind: 'wings' }),
  S('unicorn', 'Unicorn', 50, '🦄', { body: '#ffffff', accent: '#fff0f7', ear: '#ffd43b', back: '#c77dff', inner: '#ffc2dd', ears: 'unihorn', nose: 'none', extras: ['sparkle'], backKind: 'crest' }),
  S('unicorn_pink', 'Pembe unicorn', 55, '🦄', { body: '#ffc2dd', accent: '#ffe3ef', ear: '#ffd43b', back: '#4dabf7', inner: '#ffffff', ears: 'unihorn', nose: 'none', extras: ['sparkle'], backKind: 'crest' }),
  S('unicorn_night', 'Gece unicorn', 60, '🦄', { body: '#4c3b8a', accent: '#6d5bb0', ear: '#ffd43b', back: '#22d3ee', inner: '#a78bfa', ears: 'unihorn', nose: 'none', extras: ['sparkle'], backKind: 'crest' }),
  S('robot', 'Robot', 40, '🤖', { body: '#a3b1c2', accent: '#2c3440', ear: '#ff6b6b', ears: 'antenna', marks: ['screen'], nose: 'none', extras: ['bolts', 'nocheeks'], shape: 'square' }),
  S('robot_red', 'Kırmızı robot', 45, '🤖', { body: '#ef6461', accent: '#2c3440', ear: '#ffd43b', ears: 'antenna', marks: ['screen'], nose: 'none', extras: ['bolts', 'nocheeks'], shape: 'square' }),
  S('robot_gold', 'Altın robot', 70, '🤖', { body: '#f2c14e', accent: '#2c3440', ear: '#4dabf7', ears: 'antenna', marks: ['screen'], nose: 'none', extras: ['bolts', 'nocheeks', 'sparkle'], shape: 'square' }),
  S('alien', 'Uzaylı', 35, '👽', { body: '#8ee66b', accent: '#c8f7b4', ear: '#5cb83a', ears: 'antenna', nose: 'none', extras: ['thirdeye', 'bigeyes'], shape: 'drop' }),
  S('alien_purple', 'Mor uzaylı', 40, '👾', { body: '#b583f5', accent: '#e2ccff', ear: '#8b5cf6', ears: 'antenna', nose: 'none', extras: ['thirdeye', 'bigeyes'], shape: 'drop' }),
  S('alien_blue', 'Mavi uzaylı', 40, '👽', { body: '#5ccfe6', accent: '#c5f3fb', ear: '#1c9ab3', ears: 'antenna', nose: 'none', extras: ['thirdeye', 'bigeyes'], shape: 'drop' }),
  S('monster', 'Mavi canavar', 30, '👹', { body: '#6c8cff', accent: '#c6d2ff', ear: '#fff3bf', ears: 'horns', marks: ['freckles'], nose: 'none', extras: ['fangs', 'wideMouth'] }),
  S('monster_green', 'Yeşil canavar', 30, '👹', { body: '#51cf66', accent: '#c3fae8', ear: '#fff3bf', ears: 'horns', marks: ['freckles'], nose: 'none', extras: ['fangs', 'wideMouth'] }),
  S('monster_pink', 'Pembe canavar', 30, '👹', { body: '#f783ac', accent: '#ffdeeb', ear: '#fff3bf', ears: 'horns', marks: ['freckles'], nose: 'none', extras: ['fangs', 'wideMouth'] }),
  S('monster_orange', 'Turuncu canavar', 30, '👹', { body: '#ff922b', accent: '#ffe8cc', ear: '#fff3bf', ears: 'horns', marks: ['freckles'], nose: 'none', extras: ['fangs', 'wideMouth'] }),
  S('ghost', 'Hayalet', 30, '👻', { body: '#f8f9ff', accent: '#ffffff', ears: 'none', nose: 'none', extras: ['wavy'], shape: 'tall' }),
  S('snowman', 'Kardan adam', 30, '⛄', { body: '#ffffff', accent: '#ffffff', ears: 'none', nose: 'carrot', extras: ['nocheeks'] }),
  S('pumpkin', 'Balkabağı', 25, '🎃', { body: '#ff922b', accent: '#ffa94d', mark: '#e8590c', ears: 'none', marks: ['ribs'], nose: 'none', extras: ['stem', 'wideMouth'], shape: 'wide' }),
  S('cactus', 'Kaktüs', 25, '🌵', { body: '#5cb85c', accent: '#8fd18f', mark: '#2f6b2f', ears: 'none', marks: ['seeds'], nose: 'none', extras: ['flower'], shape: 'tall' }),
  S('sun', 'Güneş', 45, '🌞', { body: '#ffd43b', accent: '#fff3bf', back: '#ffa94d', ears: 'none', nose: 'none', backKind: 'rays' }),
  S('flowerhead', 'Çiçek', 35, '🌻', { body: '#ffe066', accent: '#fff3bf', back: '#ff8787', ears: 'none', nose: 'none', backKind: 'petals' }),
  S('sprout', 'Fidan', 20, '🌱', { body: '#94d82d', accent: '#d8f5a2', back: '#2f9e44', ears: 'none', nose: 'none', backKind: 'leaf' }),
  S('slime', 'Jöle', 25, '🟢', { body: '#63e6be', accent: '#c3fae8', ears: 'none', nose: 'none', extras: ['wavy', 'sparkle'], shape: 'drop' }),
]

export type ItemSlot = 'hat' | 'glasses' | 'neck' | 'bg'
export interface CatalogItem { id: string; slot: ItemSlot; name: string; price: number }

const I = (slot: ItemSlot, list: [string, string, number][]): CatalogItem[] =>
  list.map(([id, name, price]) => ({ id: `${slot}_${id}`, slot, name, price }))

export const ITEMS: CatalogItem[] = [
  ...I('hat', [
    ['party', 'Parti şapkası', 10], ['sprout', 'Filiz', 10], ['bow', 'Kurdele', 10], ['band', 'Ter bandı', 15],
    ['beanie', 'Ponponlu bere', 15], ['cap', 'Kasket', 20], ['straw', 'Hasır şapka', 20], ['flower', 'Çiçek taç', 25],
    ['builder', 'Baret', 25], ['bunny', 'Tavşan kulağı', 25], ['chef', 'Aşçı şapkası', 30], ['propeller', 'Pervaneli şapka', 30],
    ['cowboy', 'Kovboy şapkası', 35], ['headphones', 'Kulaklık', 35], ['detective', 'Dedektif şapkası', 35],
    ['pirate', 'Korsan şapkası', 40], ['top', 'Silindir şapka', 40], ['wizard', 'Büyücü şapkası', 45],
    ['fire', 'İtfaiyeci kaskı', 45], ['tiara', 'Prenses tacı', 45], ['viking', 'Viking miğferi', 50],
    ['grad', 'Mezuniyet kepi', 55], ['crown', 'Kral tacı', 60], ['astro', 'Astronot kaskı', 75],
  ]),
  ...I('glasses', [
    ['round', 'Yuvarlak gözlük', 10], ['nerd', 'Kare gözlük', 15], ['goggles', 'Yüzücü gözlüğü', 20],
    ['sun', 'Güneş gözlüğü', 25], ['party', 'Parti gözlüğü', 25], ['3d', '3D gözlük', 25], ['heart', 'Kalp gözlük', 30],
    ['swirl', 'Hipnoz gözlük', 30], ['star', 'Yıldız gözlük', 35], ['pilot', 'Pilot gözlüğü', 35],
    ['monocle', 'Tek gözlük', 40], ['mask', 'Kahraman maskesi', 40], ['visor', 'Robot vizörü', 45],
  ]),
  ...I('neck', [
    ['bow', 'Papyon', 10], ['tie', 'Kravat', 15], ['bandana', 'Bandana', 15], ['bell', 'Zilli tasma', 15],
    ['scarf', 'Atkı', 20], ['heart', 'Kalp kolye', 20], ['winter', 'Kış atkısı', 20], ['lei', 'Çiçek kolye', 25],
    ['sailor', 'Denizci yakası', 25], ['pearls', 'İnci kolye', 30], ['camera', 'Fotoğraf makinesi', 35],
    ['stetho', 'Steteskop', 35], ['chain', 'Altın zincir', 40], ['cape', 'Süper pelerin', 45], ['medal', 'Madalya', 50],
  ]),
  ...I('bg', [
    ['polka', 'Puantiye', 10], ['checker', 'Damalı', 10], ['sky', 'Gökyüzü', 10], ['grass', 'Çimen', 15],
    ['sunset', 'Gün batımı', 15], ['sea', 'Deniz', 15], ['board', 'Kara tahta', 15], ['forest', 'Orman', 20],
    ['snow', 'Kar', 20], ['desert', 'Çöl', 20], ['autumn', 'Sonbahar', 20], ['candy', 'Şeker', 25],
    ['mountain', 'Dağlar', 25], ['night', 'Yıldızlı gece', 30], ['bubbles', 'Pembe baloncuk', 30], ['under', 'Su altı', 35],
    ['space', 'Uzay', 40], ['lava', 'Volkan', 45], ['rainbow', 'Gökkuşağı', 55], ['gold', 'Altın', 70],
  ]),
]

export const charItemId = (speciesId: string) => `char_${speciesId}`
