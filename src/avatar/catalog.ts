// Avatar kataloğu: tek kaynak. Hem site (dükkan, çizim) hem SQL (scripts/shop-sql.ts) buradan beslenir.
// Çocuk: Avataaars (Pablo Stanley, DiceBear ile çizilir); şapka, gözlük, saç, kıyafet aynı setten, birbirine oturur.
// Arkadaşı (hayvan): Microsoft Fluent Emoji Flat (MIT, public/fx/LICENSE). `src` = Fluent klasör adı;
// scripts/fetch_fluent.py bunları indirip public/fx/<id>.svg yapar.
// Bu dosya başka dosya import ETMEZ (node ile doğrudan çalışabilsin diye).

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
// v = Avataaars seçeneği (saç/şapka adı ya da renk), v2 = ikinci seçenek (şapka rengi, tişört resmi, gözlük rengi).
export type ItemSlot = 'skin' | 'hair' | 'hcolor' | 'hat' | 'glasses' | 'clothes' | 'ccolor' | 'face' | 'pet' | 'bg'
export interface CatalogItem { id: string; slot: ItemSlot; name: string; price: number; v?: string; v2?: string }

const I = (slot: ItemSlot, list: [string, string, number, string?, string?][]): CatalogItem[] =>
  list.map(([id, name, price, v, v2]) => ({ id: `${slot}_${id}`, slot, name, price, v: v ?? id, v2 }))

// Renkler (hex, # yok)
const C: Record<string, [string, string]> = {
  black: ['Siyah', '262e33'], navy: ['Lacivert', '25557c'], blue: ['Mavi', '5199e4'], sky: ['Açık mavi', '65c9ff'],
  ice: ['Buz mavisi', 'b1e2ff'], mint: ['Nane yeşili', 'a7ffc4'], gray: ['Gri', '929598'], smoke: ['Duman', '3c4f5c'],
  white: ['Beyaz', 'ffffff'], cream: ['Krem', 'ffdeb5'], pink: ['Pembe', 'ffafb9'], lemon: ['Limon', 'ffffb1'],
  fuchsia: ['Fuşya', 'ff488e'], red: ['Kırmızı', 'ff5c5c'], green: ['Yeşil', '3fa34d'], purple: ['Mor', '8e5bd8'],
  orange: ['Turuncu', 'ff9f43'], gold: ['Altın', 'e8b923'],
}
const col = (keys: string[], price: (i: number) => number): [string, string, number, string][] =>
  keys.map((k, i) => [k, C[k][0], price(i), C[k][1]])

export const ITEMS: CatalogItem[] = [
  ...I('skin', [
    ['1', 'Açık', 0, 'ffdbb4'], ['2', 'Buğday', 0, 'edb98a'], ['3', 'Esmer', 0, 'd08b5b'], ['4', 'Bronz', 0, 'ae5d29'],
    ['5', 'Koyu', 0, '614335'], ['6', 'Sarı (çizgi film)', 10, 'f8d25c'], ['7', 'Turuncu (çizgi film)', 10, 'fd9841'],
  ]),
  ...I('hair', [
    ['shortFlat', 'Kısa düz', 0], ['shortRound', 'Kısa yuvarlak', 0], ['shortWaved', 'Kısa dalgalı', 0],
    ['shortCurly', 'Kısa kıvırcık', 0], ['theCaesar', 'Asker tıraşı', 0], ['theCaesarAndSidePart', 'Yandan ayrık', 0],
    ['straight01', 'Uzun düz', 0], ['straight02', 'Uzun düz 2', 0], ['bob', 'Küt', 0], ['bun', 'Topuz', 0],
    ['curly', 'Uzun kıvırcık', 0], ['longButNotTooLong', 'Omuz boyu', 0], ['hijab', 'Başörtüsü', 0],
    ['sides', 'Yanlar', 5], ['shaggy', 'Dağınık', 10], ['frizzle', 'Kabarık kısa', 10], ['straightAndStrand', 'Perçemli', 10],
    ['curvy', 'Dalgalı uzun', 10], ['fro', 'Afro', 15], ['froBand', 'Bantlı afro', 20], ['shavedSides', 'Yanları kazınmış', 15],
    ['shaggyMullet', 'Rock yıldızı', 20], ['dreads', 'Örgülü', 20], ['dreads01', 'Kısa örgü', 15], ['dreads02', 'Örgü 2', 15],
    ['miaWallace', 'Kahküllü', 20], ['bigHair', 'Kocaman saç', 25], ['frida', 'Çiçekli örgü', 30],
  ]),
  ...I('hcolor', [
    ['black', 'Siyah', 0, '2c1b18'], ['dark', 'Koyu kahve', 0, '4a312c'], ['brown', 'Kahverengi', 0, '724133'],
    ['auburn', 'Kızıl kahve', 0, 'a55728'], ['blonde', 'Sarı', 0, 'b58143'], ['golden', 'Altın sarısı', 0, 'd6b370'],
    ['ginger', 'Kızıl', 10, 'c93305'], ['platinum', 'Platin', 15, 'ecdcbf'], ['silver', 'Gümüş', 15, 'e8e1e1'],
    ['pink', 'Pembe', 20, 'f59797'], ['blue', 'Mavi', 25, '5aa9e6'], ['purple', 'Mor', 25, '9b6bd6'],
    ['green', 'Yeşil', 25, '4fbf73'], ['red', 'Kırmızı', 25, 'e63946'], ['rainbow', 'Turkuaz', 30, '2ec4b6'],
  ]),
  // Şapka saçın yerini alır (Avataaars'ta şapkanın altında saç görünmez).
  ...I('hat', [
    ...col(['red', 'blue', 'mint', 'pink', 'lemon', 'black'], (i) => 15 + i * 2).map(([k, n, p, h]) => [`hat_${k}`, `${n} şapka`, p, 'hat', h] as [string, string, number, string, string]),
    ...col(['red', 'sky', 'fuchsia', 'green', 'purple'], (i) => 20 + i * 2).map(([k, n, p, h]) => [`w1_${k}`, `${n} ponponlu bere`, p, 'winterHat1', h] as [string, string, number, string, string]),
    ...col(['navy', 'red', 'orange', 'lemon'], (i) => 20 + i * 3).map(([k, n, p, h]) => [`w2_${k}`, `${n} kulaklı bere`, p, 'winterHat02', h] as [string, string, number, string, string]),
    ...col(['white', 'pink', 'blue', 'gold'], (i) => 25 + i * 3).map(([k, n, p, h]) => [`w3_${k}`, `${n} kar beresi`, p, 'winterHat03', h] as [string, string, number, string, string]),
    ...col(['pink', 'black', 'cream', 'purple'], (i) => 35 + i * 3).map(([k, n, p, h]) => [`w4_${k}`, `${n} kedi kulaklı bere`, p, 'winterHat04', h] as [string, string, number, string, string]),
    ...col(['white', 'red', 'navy'], (i) => 25 + i * 3).map(([k, n, p, h]) => [`turban_${k}`, `${n} sarık`, p, 'turban', h] as [string, string, number, string, string]),
  ]),
  ...I('glasses', [
    ['round_black', 'Yuvarlak gözlük', 10, 'round', '262e33'], ['round_red', 'Kırmızı yuvarlak', 15, 'round', 'ff5c5c'],
    ['round_gold', 'Altın yuvarlak', 25, 'round', 'e8b923'], ['p1_black', 'Okuma gözlüğü', 10, 'prescription01', '262e33'],
    ['p1_blue', 'Mavi okuma gözlüğü', 15, 'prescription01', '5199e4'], ['p2_black', 'Kalın çerçeve', 15, 'prescription02', '262e33'],
    ['p2_pink', 'Pembe çerçeve', 20, 'prescription02', 'ff488e'], ['kurt_black', 'Pilot gözlüğü', 25, 'kurt', '262e33'],
    ['kurt_fuchsia', 'Fuşya pilot', 30, 'kurt', 'ff488e'], ['sun_black', 'Güneş gözlüğü', 20, 'sunglasses', '262e33'],
    ['sun_sky', 'Mavi güneş gözlüğü', 25, 'sunglasses', '65c9ff'], ['way_black', 'Havalı gözlük', 25, 'wayfarers', '262e33'],
    ['way_red', 'Kırmızı havalı', 30, 'wayfarers', 'ff5c5c'], ['way_lemon', 'Sarı havalı', 30, 'wayfarers', 'ffffb1'],
    ['eyepatch', 'Korsan bandı', 35, 'eyepatch', '262e33'],
  ]),
  ...I('clothes', [
    ['tshirt', 'Tişört', 0, 'shirtCrewNeck'], ['vneck', 'V yaka', 0, 'shirtVNeck'], ['scoop', 'Geniş yaka', 0, 'shirtScoopNeck'],
    ['hoodie', 'Kapüşonlu', 0, 'hoodie'], ['overall', 'Salopet', 10, 'overall'], ['sweater', 'Yakalı kazak', 15, 'collarAndSweater'],
    ['blazer', 'Ceket ve gömlek', 25, 'blazerAndShirt'], ['blazer2', 'Ceket ve kazak', 30, 'blazerAndSweater'],
    ['g_bear', 'Ayıcıklı tişört', 15, 'graphicShirt', 'bear'], ['g_pizza', 'Pizzalı tişört', 15, 'graphicShirt', 'pizza'],
    ['g_deer', 'Geyikli tişört', 20, 'graphicShirt', 'deer'], ['g_bat', 'Yarasalı tişört', 20, 'graphicShirt', 'bat'],
    ['g_diamond', 'Elmaslı tişört', 25, 'graphicShirt', 'diamond'], ['g_hola', 'Hola tişört', 20, 'graphicShirt', 'hola'],
    ['g_skull', 'Kurukafa tişört', 25, 'graphicShirt', 'skullOutline'],
  ]),
  ...I('ccolor', [
    ...col(['blue', 'red', 'gray', 'navy', 'white', 'black'], () => 0),
    ...col(['sky', 'mint', 'pink', 'lemon', 'ice', 'smoke'], () => 10),
    ...col(['fuchsia', 'green', 'purple', 'orange'], () => 15), ...col(['gold'], () => 30),
  ]),
  // Yüz ifadesi: [göz, kaş, ağız] (v = 'göz|kaş|ağız')
  ...I('face', [
    ['smile', 'Gülümseme', 0, 'default|defaultNatural|smile'], ['happy', 'Mutlu', 0, 'happy|defaultNatural|smile'],
    ['wink', 'Göz kırpma', 10, 'wink|raisedExcitedNatural|smile'], ['side', 'Yan bakış', 10, 'side|defaultNatural|twinkle'],
    ['squint', 'Kısık göz', 10, 'squint|defaultNatural|smile'], ['tongue', 'Dil çıkarma', 15, 'happy|raisedExcitedNatural|tongue'],
    ['surprised', 'Şaşkın', 15, 'surprised|raisedExcited|default'], ['wacky', 'Çılgın', 20, 'winkWacky|upDown|tongue'],
    ['hearts', 'Kalp gözler', 30, 'hearts|raisedExcited|smile'], ['eating', 'Afiyetle', 15, 'closed|defaultNatural|eating'],
  ]),
  ...I('bg', [
    ['polka', 'Puantiye', 10], ['checker', 'Damalı', 10], ['sky', 'Gökyüzü', 10], ['grass', 'Çimen', 15],
    ['sunset', 'Gün batımı', 15], ['sea', 'Deniz', 15], ['board', 'Kara tahta', 15], ['forest', 'Orman', 20],
    ['snow', 'Kar', 20], ['desert', 'Çöl', 20], ['autumn', 'Sonbahar', 20], ['candy', 'Şeker', 25],
    ['mountain', 'Dağlar', 25], ['night', 'Yıldızlı gece', 30], ['bubbles', 'Pembe baloncuk', 30], ['under', 'Su altı', 35],
    ['space', 'Uzay', 40], ['lava', 'Volkan', 45], ['rainbow', 'Gökkuşağı', 55], ['gold', 'Altın', 70],
  ]),
]

export const petItemId = (speciesId: string) => `pet_${speciesId}`
/** Hayvan görseli (Vite base'e göre). */
export const fx = (id: string) => `${import.meta.env?.BASE_URL ?? '/'}fx/${id}.svg`
