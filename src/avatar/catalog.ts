// Avatar kataloğu: tek kaynak. Hem site (dükkan, çizim) hem SQL (scripts/shop-sql.ts) buradan beslenir.
// Görseller: Microsoft Fluent Emoji 3D (MIT lisansı, public/fx/LICENSE). `src` = Fluent klasör adı;
// scripts/fetch_fluent.py bunları indirip public/fx/<id>.webp yapar.
// Bu dosya başka dosya import ETMEZ (node ile doğrudan çalışabilsin diye).

export interface Species {
  id: string
  name: string
  price: number
  emoji: string
  src: string
}

const S = (id: string, name: string, price: number, emoji: string, src: string): Species => ({ id, name, price, emoji, src })

// Fiyat 0 = başlangıç karakteri (dükkandan bedava alınır).
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

export type ItemSlot = 'hat' | 'glasses' | 'item' | 'pet' | 'bg'
export interface CatalogItem { id: string; slot: ItemSlot; name: string; price: number; src?: string }

const I = (slot: ItemSlot, list: [string, string, number, string?][]): CatalogItem[] =>
  list.map(([id, name, price, src]) => ({ id: `${slot}_${id}`, slot, name, price, ...(src ? { src } : {}) }))

export const ITEMS: CatalogItem[] = [
  // Kafa süsü (karakterin kafasının üstüne oturur)
  ...I('hat', [
    ['sprout', 'Filiz', 10, 'Seedling'], ['clover', 'Dört yapraklı yonca', 10, 'Four leaf clover'], ['ribbon', 'Kurdele', 10, 'Ribbon'],
    ['blossom', 'Kiraz çiçeği', 15, 'Cherry blossom'], ['tulip', 'Lale', 15, 'Tulip'], ['hibiscus', 'Ebegümeci', 15, 'Hibiscus'],
    ['feather', 'Tüy', 15, 'Feather'], ['cap', 'Kasket', 20, 'Billed cap'], ['sunflower', 'Ayçiçeği', 20, 'Sunflower'],
    ['mushroom', 'Mantar şapka', 20, 'Mushroom'], ['ladybug', 'Uğur böceği', 20, 'Lady beetle'], ['butterfly', 'Kelebek', 25, 'Butterfly'],
    ['chick', 'Yumurtadan civciv', 25, 'Hatching chick'], ['bird', 'Kuş', 25, 'Bird'], ['sunhat', 'Hasır şapka', 25, 'Womans hat'],
    ['star', 'Yıldız', 25, 'Star'], ['bulb', 'Fikir ampulü', 30, 'Light bulb'], ['cloud', 'Bulut', 30, 'Cloud'],
    ['icecream', 'Dondurma', 30, 'Soft ice cream'], ['headphone', 'Kulaklık', 35, 'Headphone'], ['helmet', 'Kurtarıcı kaskı', 35, 'Rescue workers helmet'],
    ['tophat', 'Silindir şapka', 40, 'Top hat'], ['cake', 'Doğum günü pastası', 40, 'Birthday cake'], ['rainbow', 'Gökkuşağı', 45, 'Rainbow'],
    ['glowstar', 'Parlayan yıldız', 45, 'Glowing star'], ['grad', 'Mezuniyet kepi', 55, 'Graduation cap'], ['crown', 'Taç', 60, 'Crown'],
  ]),
  ...I('glasses', [
    ['glasses', 'Gözlük', 15, 'Glasses'], ['sun', 'Güneş gözlüğü', 25, 'Sunglasses'],
    ['goggles', 'Kayak gözlüğü', 30, 'Goggles'], ['diving', 'Dalgıç maskesi', 35, 'Diving mask'],
  ]),
  // Elindeki eşya (sağ alt köşede durur)
  ...I('item', [
    ['pencil', 'Kalem', 10, 'Pencil'], ['apple', 'Elma', 10, 'Red apple'], ['balloon', 'Balon', 10, 'Balloon'],
    ['lollipop', 'Lolipop', 15, 'Lollipop'], ['crayon', 'Pastel boya', 15, 'Crayon'], ['ruler', 'Cetvel', 15, 'Straight ruler'],
    ['books', 'Kitaplar', 20, 'Books'], ['ball', 'Futbol topu', 20, 'Soccer ball'], ['basket', 'Basketbol topu', 20, 'Basketball'],
    ['icecream', 'Dondurma', 20, 'Ice cream'], ['abacus', 'Abaküs', 20, 'Abacus'], ['kite', 'Uçurtma', 25, 'Kite'],
    ['yoyo', 'Yoyo', 25, 'Yo-yo'], ['dice', 'Zar', 25, 'Game die'], ['puzzle', 'Yapboz', 25, 'Puzzle piece'],
    ['palette', 'Boya paleti', 25, 'Artist palette'], ['magnifier', 'Büyüteç', 30, 'Magnifying glass tilted left'],
    ['compass', 'Pusula', 30, 'Compass'], ['globe', 'Dünya küresi', 30, 'Globe showing europe-africa'], ['testtube', 'Deney tüpü', 30, 'Test tube'],
    ['teddy', 'Oyuncak ayı', 30, 'Teddy bear'], ['umbrella', 'Şemsiye', 30, 'Umbrella'], ['skate', 'Kaykay', 35, 'Skateboard'],
    ['guitar', 'Gitar', 35, 'Guitar'], ['violin', 'Keman', 35, 'Violin'], ['trumpet', 'Trompet', 35, 'Trumpet'],
    ['drum', 'Davul', 35, 'Drum'], ['microscope', 'Mikroskop', 40, 'Microscope'], ['telescope', 'Teleskop', 40, 'Telescope'],
    ['gift', 'Hediye kutusu', 40, 'Wrapped gift'], ['crystal', 'Sihirli küre', 45, 'Crystal ball'], ['wand', 'Sihirli değnek', 45, 'Magic wand'],
    ['rocket', 'Roket', 50, 'Rocket'], ['gem', 'Elmas', 55, 'Gem stone'], ['trophy', 'Kupa', 60, 'Trophy'],
  ]),
  // Arkadaşı (sol alt köşedeki küçük hayvan)
  ...I('pet', [
    ['chick', 'Civciv', 15, 'Baby chick'], ['snail', 'Salyangoz', 15, 'Snail'], ['ladybug', 'Uğur böceği', 15, 'Lady beetle'],
    ['worm', 'Solucan', 15, 'Worm'], ['turtle', 'Kaplumbağa', 20, 'Turtle'], ['fish', 'Balık', 20, 'Tropical fish'],
    ['bee', 'Arı', 20, 'Honeybee'], ['butterfly', 'Kelebek', 20, 'Butterfly'], ['mouse', 'Fare', 20, 'Mouse'],
    ['bird', 'Kuş', 25, 'Bird'], ['rabbit', 'Tavşan', 25, 'Rabbit'], ['cat', 'Kedi', 25, 'Cat'], ['dog', 'Köpek', 25, 'Dog'],
    ['duck', 'Ördek', 25, 'Duck'], ['hedgehog', 'Kirpi', 25, 'Hedgehog'], ['crab', 'Yengeç', 25, 'Crab'],
    ['octopus', 'Ahtapot', 30, 'Octopus'], ['owl', 'Baykuş', 30, 'Owl'], ['parrot', 'Papağan', 30, 'Parrot'],
    ['penguin', 'Penguen', 30, 'Penguin'], ['ghost', 'Hayalet', 35, 'Ghost'], ['robot', 'Robot', 40, 'Robot'],
    ['trex', 'Minik T-Rex', 45, 'T-rex'], ['dragon', 'Minik ejderha', 55, 'Dragon'], ['unicorn', 'Minik unicorn', 55, 'Unicorn'],
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
/** Görselin yolu (Vite base'e göre). */
export const fx = (id: string) => `${import.meta.env?.BASE_URL ?? '/'}fx/${id}.webp`
