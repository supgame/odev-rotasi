# Avatar kataloğu

## Faz 1 · Ten ve saç

Pilotun ham kel portresi ve hizalama işlevi temel alındı. Kısa düz saç ve at kuyruğu pilotun yerleşik ImageGen çizimlerinden, diğer stiller bu fazdaki ImageGen düzenlemelerinden geliyor. Yeni ham PNG'ler `kaynak/imagegen/` altında. Ana kopyalar ve maskeleri 1024 × 1024, katalog katmanları ve maskeleri 512 × 512. Katalogdaki beş doğal ten ücretsiz. Saç paletindeki ilk altı renk ücretsiz.

### Katman ve şapka uyumu

- Yeni portre düzenlemeleri iki göz ve ağızdan hizalandı. Saç ve kumaşı turkuaz çizdirmek portreye dokunmadan ayıklamayı sağladı. Kod yalnız görüntüdeki mevcut pikselleri hizalar, ayıklar ve griye çevirir. İlk ayıklamadaki alt sınır uzun saçları ve örgüleri kestiği için kaldırıldı. Kumaş ve saçta kullanılan mavi tonları, tişörtün nötr piksellerinden renk farkıyla ayrılıyor.
- Ten maskesinde gözler, tişört ve koyu çizgiler korunur. Saç ve kumaş maskelerinde en koyu çizgilere daha az boya uygulanır. `ref` her WebP katmanının kodlama sonrasındaki parlaklığından, yayımlanan maske ile ağırlıklandırılarak hesaplanır.
- Ortak şapka referansı pilotun önden beyzbol şapkasıdır. 1024 px kanvasta kapladığı kutu `x=285–738, y=95–370`, orta eksen `x=512`. Faz 2'de yeni şapkaların oturuşunu bu referansın alın ve şakak temasına göre hizala. Maskede siperin alt çizgisinden yukarı doğru 9 px bindirme payı vardır. Hacimli saçların ve başörtüsünün üst bölümü şapkanın altında daralır, alt bölümleri şapkanın altında görünür kalır. At kuyruğu her iki durumda başın arkasında aynı konumu korur.
- Önizleme yayımlanan WebP katmanlarından ve uyum kontrolü için pilotun mevcut şapka ve gözlüğünden oluşturulur. On dört stil açık ve koyu tende şapkalı ve şapkasız, gözlüklü ve gözlüksüz olarak 112 bileşimde gösterilir. Bileşimlerin 96 px satırları da bulunur.

### Yeniden üretim

Depo kökünden ve mevcut pilot kaynaklarıyla çalıştırın. Yalnız WebP'leri yenilemek için ikinci komut yeterlidir. İlk komut, mevcut ham ImageGen PNG'lerini ayıklayıp hizalanmış ana kopyaları yeniden üretir. Son komut Noto Sans yazı tipini kullanır.

```sh
gelistirme/.venv/bin/python -B gelistirme/avatar_uretim/katmanlari_hazirla.py
gelistirme/.venv/bin/python -B gelistirme/avatar_uretim/paketle.py
gelistirme/.venv/bin/python -B gelistirme/avatar_uretim/onizle_faz1.py
```

### ImageGen istemleri

Yerleşik ImageGen ile her yeni stil için bir düzenleme istendi. `transparent_background=true`. İlk görsel pilotun `kaynak/imagegen/base.png` portresi, ikinci görsel stil referansı `kaynak/pet_fox_imagegen.png`. Yeniden üretim için aşağıdaki kalıpta `{style}` alanına ilgili satırı yerleştirin. Pilot portresi, kısa düz saç ve at kuyruğunun üretim istemleri `../pilot_avatar/NOTLAR.md` içinde.

> Use case: precise-object-edit. Make a layered paper-doll source 2D sprite. Image 1 is the edit target. Image 2 fox is a line/shading style reference only. Change ONLY the hairstyle, adding {style}. Absolutely keep the child's facial anatomy, forehead width, eyes, ears, placement, skin, shirt, size, straight-on angle and framing pixel-matched to Image 1. Keep the same square composition. Match clean tapered contours and broad warm cel-painted highlights. For extraction use distinctive saturated cool BLUE-TEAL (deep petrol blue, cyan-teal highlights, and dark saturated navy outline) for EVERY hair pixel including shadows and edges. Keep eyebrows and both eyes clear. Cover the bald crown all the way from temple to temple with hair. Background truly transparent, no objects, logos or text.

| PNG | `{style}` |
| --- | --- |
| curly.png | a low rounded short haircut with six clearly defined soft ringlet locks across the crown and subtle short sideburns |
| afro.png | a broad rounded full afro with clustered textured curls, a clearly defined close forehead hairline and overhang at the sides, the ears substantially visible |
| straight_long.png | center-parted long silky straight hair, with two continuous obvious wide locks coming forward along both sides of the face and over the shirt below the shoulders, clean vertical strands and blunt ends |
| bob.png | a straight blunt shoulder-length bob with a soft side part, clearly visible ends at the shoulders, curving inward |
| bun.png | a smooth brushed-back hairstyle with a distinguishable compact round high bun centered at the top; the front hair must form a smooth clean arc across the entire forehead |
| braids.png | two thick clearly braided sections hanging down in front over the shoulders with three to five readable interweaves, neat center part, and small blue-teal ties |
| space_buns.png | two small distinct round high side buns at the upper corners with a smooth center-parted front underneath, mirror balanced |
| wavy_long.png | center-parted long hair with distinct broad loose S-shaped waves on both sides, both locks hanging forward beyond the shoulders |
| bangs_long.png | long hair reaching the shoulders at both sides with a clear broad gently rounded horizontal fringe of bangs across the upper forehead and fully above the eyebrows |
| spiky.png | short low spiky hair, with six or seven sharp lifted pointed tips above the crown and close sides, clearly distinct airy spikes, covering the scalp |
| side_part.png | a classic trim neat side-parted school hairstyle, smooth wide slicked-over locks and a thin distinct part above the forehead, tidy tapered sideburns |
| headscarf.png | one fitted modest soft fabric headscarf wrapped over the crown and covering both ears, all hair and neck, with clearly visible modest folds, an oval opening that preserves the whole face and eyebrows, and a short neat wrap ending on the upper shoulders; the entire cloth must use the specified saturated cool BLUE-TEAL colors |

İlk başörtüsünün dış kenarı pilotun kulaklarını örtecek genişlikte değildi. Bu nedenle tek ek ImageGen çağrısıyla `headscarf_v2.png` üretildi ve katalogda bu görsel kullanıldı. İkinci düzenlemenin kumaş kenarı, kulak hizasında gerek duyulan yerlerde mevcut pikseller yeniden örneklenerek alnı ve yüz açıklığını koruyacak biçimde ayarlandı.

> Use case: precise-object-edit. Image 1 is the precise edit target; image 2 fox provides line and painted shading style only. Add ONLY a cobalt/teal blue soft modest headscarf, worn over the whole head and over the ears and neck. Keep the original exact pixel-matched size, head, face landmarks, shirt, body, frontal angle and square framing. It is essential that the scarf is generously draped like a slightly padded fabric layer directly IN FRONT OF both original ears, and EXTENDS AT LEAST 20 PX BEYOND THE ENTIRE OUTER SILHOUETTE OF BOTH EARS on all sides. On the 1254 square the existing ears reach x=315 and x=939 from y=550 to y=715, so scarf fabric completely wraps this whole area and reaches at least x=288 on the left and x=966 on the right at ear height. Do not erase or tuck the reference ears back behind a narrow scarf, physically put wide cloth over them. Preserve the oval cheek opening, eyebrows and full eyes at the original placement. Wrap softly across the neck, ending on the upper shoulders. For extraction use saturated cool BLUE-TEAL including dark navy outline for every cloth pixel, distinct from the warm skin and neutral purple shirt. Match tapered ink and painted cel shading of references. Transparent RGBA background, no words, logos or extra items.

## Faz 2 · Şapkalar ve gözlükler

Faz 2, 11 şapka ve 7 gözlük çiziminden 30 şapka ve 16 gözlük seçeneği ekler. Beyzbol şapkası ve yuvarlak gözlük için pilotun hizalanmış ImageGen çizimleri kullanıldı. Yeni ham PNG'ler `kaynak/imagegen/faz2/` altında. Şapka ve gözlüklerin ortak 1024 px ana kopyaları sırasıyla `kaynak/hat/` ve `kaynak/glasses/` altında.

- Şapkaların alın kenarı pilot siperine, gözlükler pilot çerçevesinin göz açıklığına göre hizalandı. Sihirbaz şapkası, korsan şapkası, altın taç ve ayı kulaklı taç, kenarlarından saçlı deri görünmeyecek biçimde yüksekliğine ölçeklendi. Pilot başlığının gözlüğü alnında kalır, ayrı gözlük katmanı göz hizasına oturur.
- Aynı eşyanın renk seçenekleri tek WebP katmanı, kayıpsız maske ve parlaklık referansını paylaşır. Koyu konturlara düşük maske verildi. Sihirbaz şapkasının yıldızları, kovboy şapkasının kemeri, gözlük menteşeleri ve güneş gözlüğünün camları kaynak rengini korur. Korsan şapkası, altın taç, pilot başlığı ve korsan bandı sabit renklidir.
- Kontakt kağıdında açık ve koyu ten, kısa saç ve başörtüsüyle denenir. Şapkalar gözlüklü ve gözlüksüz, gözlükler şapkalı ve şapkasız gösterilir. Her çizimin 96 px örnekleri renk seçeneklerini de gösterir.

### Yeniden üretim

Depo kökünden çalıştırın. Ham çizimlerin hizasını yeniden almak için ilk komutu çalıştırın. İkinci komut yalnız Faz 2 WebP'lerini paketler ve manifestteki `hat` ile `glasses` bölümlerini günceller. Faz belirtmeden paketleme, mevcut Faz 1 ve Faz 2 ana kopyalarını birlikte kullanır.

```sh
gelistirme/.venv/bin/python -B gelistirme/avatar_uretim/faz2_katmanlari_hazirla.py
gelistirme/.venv/bin/python -B gelistirme/avatar_uretim/paketle.py --phase 2
gelistirme/.venv/bin/python -B gelistirme/avatar_uretim/onizle_faz2.py
```

### ImageGen istemleri

Yeni çizimler yerleşik ImageGen ile, `transparent_background=true` kullanılarak tek tek istendi. İlk referans pilotun `kaynak/base_skin1.png` portresi, ikinci referans şapka için `hat_cap.png` ve gözlük için `glasses_round.png`, üçüncü referans `pet_fox_imagegen.png`. Yeniden üretim kalıbında `{kind}` yerine `headwear` veya `eyewear`, `{subject}` yerine tablodaki eşya, `{fit}` yerine ilgili hizalama cümlesi kullanılır. Pilotun iki özgün istemi `../pilot_avatar/NOTLAR.md` içinde.

> Use case: stylized-concept. Create a single isolated {kind} accessory layer for the supplied original child avatar. Subject: {subject}. Image 1 is the avatar geometry reference; Image 2 is the accessory viewpoint and scale reference; Image 3 is the contour and cel-painted style reference. Deliver only the requested accessory on genuine transparent RGBA, like a removed paper-doll wardrobe layer. No child, head, hair, skin, face, hands, display stand, ground, drop shadow, background, writing or logos. Strict straight-on front-facing orthographic view, level and centered, meant to be worn by the child in image 1. Clean rich tapered outlines, broad painted 2D cel shading and smooth well-defined silhouette matching image 3. Leave generous fully transparent margins. {fit}

- `headwear` için `{fit}` cümlesi
  > The lower main front edge must be low enough to cover the upper scalp down to the pilot cap line in image 2, with a smooth broad brow contact approximately as wide as the cap. Leave the eyebrow area and face opening entirely clear.
- `eyewear` için `{fit}` cümlesi
  > Scale both lens centers to roughly 46% of frame width apart like the sample, bridge on center line, and no perspective.

| PNG | `{subject}` |
| --- | --- |
| pom.png | a cozy knitted beanie with a single fluffy pom-pom, broad folded ribbed cuff; use blue and teal fabric throughout |
| earflap.png | a winter trapper beanie with subtle knitted ribbing and soft rounded matching blue ear flaps on each side of the face opening, flaps short and broad with no dangling cords; all deep blue and teal |
| cat.png | a cat-ear beanie with two distinct soft triangular fabric peaks, smooth close-knit blue fabric and a wide folded cuff; blue and teal fabric throughout |
| bucket.png | a soft bucket hat with a low domed crown and continuous wide downward sloping brim, clearly readable as a bucket hat in a direct front view; blue teal canvas throughout |
| cowboy.png | a Western cowboy hat with a broad curved upturned brim, pinched crown, and simple unlettered dark contrasting band; hat fabric petrol-blue teal |
| wizard.png | a whimsical tall softly bent pointed wizard hat, with a wide rounded brim, teal blue fabric with several crisp warm gold five-point stars and dark trim, no other symbols |
| pirate.png | a dark charcoal-brown pirate tricorn, a broad deep curved central brow line, pointed side corners, aged warm gold stitching and one tiny centered white skull emblem, no lettering |
| crown.png | a gleaming warm gold royal crown with five readable peaks, golden lower brow band and three small ruby and jade cabochons, solid gold plate and scalloped peaks, no floating detail |
| pilot.png | a vintage warm brown leather aviator helmet with goggles resting high on the forehead above the brows, amber lightly reflective lenses and small rounded ear flaps along the sides; entirely open face, mature design for a cute kids avatar |
| bear.png | a broad curved soft blue teddy bear ear headband with two blue round teddy ears attached, one at each upper corner; a substantial arched padded blue fabric band follows the full upper half of the head and a lower cuff covers the brow area, leaves face and eyebrows clear |
| square.png | thick soft-cornered square eyeglass frames, deep blue and turquoise plastic, completely empty see-through lens openings with genuine transparent alpha |
| aviator.png | thin oval teardrop aviator eyeglass frames with delicate double bridge, blue-teal metal and a small fixed warm brass hinge detail, empty see-through lens openings with genuine transparent alpha |
| sunglasses.png | sporty softly rounded rectangular sunglasses, teal blue frame with opaque dark charcoal neutral lenses and restrained painted lens gleam |
| heart.png | a mirror-balanced pair of distinct heart-shaped eyeglass frames joined by a short blue bridge, deep blue teal plastic, completely empty transparent lens openings |
| star.png | a mirror-balanced pair of distinctly five-pointed star-shaped eyeglass frames joined by a short bridge, deep blue teal plastic, completely empty transparent lens openings |
| eyepatch.png | a single charcoal leather eyepatch with a soft oval cup and a thin upper strap extended both sides, a full wearable continuous diagonal strap that subtly rises toward the viewer's right, dark warm brown hand-painted leather, no marks. Cup centered approximately a quarter of the way from left edge, right half has only the thin strap passing ABOVE uncovered eye level. No second cup or lenses |

İlk korsan bandı gözün kenarlarını açık bıraktı. Bandın gözü tamamen kapatması için bir ek ImageGen düzenlemesi yapıldı. Katalogda `eyepatch_v2.png` kullanılır. Faz boyunca toplam 17 ImageGen çağrısı yapıldı.

> Use case: precise-object-edit. Image 1 is the isolated transparent leather pirate eyepatch to edit. Image 2 is the face alignment reference only. Keep the same hand-painted dark brown leather and sparse antique brass rivets. Enlarge the single cup horizontally so it covers the ENTIRE left eye from outer lash to nasal corner on the child, with no whites or lashes showing. The cup should be a wide soft oval, roughly 36 to 40 percent of the total strap-and-cup width from end to end, centered at 27 percent of the total width from the viewer's left. Its minimum vertical coverage allows the entire left eye to be covered too. Keep the left end of the strap short. On the right side the plain thin strap rises far enough to sit between eyebrow and eyelashes of the open right eye. Preserve the full right eye opening, no second lens or cup. Deliver ONLY the eyepatch layer as a single sprite, genuine transparent alpha, no face or display stand, no writing, no other objects. Straight-on orthographic front view.

## Faz 3 · Kıyafetler ve yüz ifadeleri

- Yerleşik ImageGen ile 12 kıyafet düzenlemesi ve 8 ifade düzenlemesi yapıldı. Ham çıktılar `kaynak/imagegen/faz3_clothes_*.png` ve `kaynak/imagegen/faz3_face_*.png` altında. Düz tişört ImageGen temel portresindeki kumaştan, kapüşonlu pilotun ImageGen katmanından alındı. Gülümseme temel portrede kalıyor.
- Kıyafetler temel tişörtün üstüne, yüz ifadeleri tenin üstüne yerleşir. Kıyafetlerde kol ve omuz çizgileri tabana göre hizalandı. Futbol formasının beyaz şeritleri, pelerinin bordo kumaşı, kazak ve ceketin gömlekleri kendi renginde kalır. Dinozorun kapüşonu omuzda durur ve şapka katmanı için başı açık bırakır.
- Yüz kırpımları hem temel yüzdeki hem de düzenlemedeki çizgilerin çevresini kapsıyor. Geçişler yumuşatıldı. Ten maskesi göz akını, irisi, dişi, dil ve ağız içini, kalp ve yıldızları dışarıda bırakır. Referans parlaklık her maskenin yayımlanan 512 px katmanından hesaplanır.
- Renkler depodaki mevcut 16 kıyafet tonunu ve altını kullanır. Kontakt kağıdında 14 kıyafet ve 9 ifadenin açık ve koyu tende, şapka ve gözlük seçeneklerinin dört birleşimiyle ayrıntı ve 96 px örnekleri bulunur. Altta 17 renk düz tişörtte gösterilir.

### Yeniden üretim

Depo kökünden:

```sh
gelistirme/.venv/bin/python -B gelistirme/avatar_uretim/faz3_katmanlari_hazirla.py
gelistirme/.venv/bin/python -B gelistirme/avatar_uretim/paketle.py --phase 3
gelistirme/.venv/bin/python -B gelistirme/avatar_uretim/onizle_faz3.py
```

### Yerleşik ImageGen istemleri

Tüm çağrılarda `transparent_background=true` kullanıldı. Düzenleme hedefi `gelistirme/pilot_avatar/kaynak/imagegen/base.png` idi. Aşağıdaki ortak başlangıç, eşya veya ifade cümlesi ve ortak bitiş birleştirilerek çağrı başına bir istem oluşturuldu.

**Kıyafetler**

> Use case: precise-object-edit. Image 1 is the edit target for an original 2D paper-doll avatar. Replace ONLY its T-shirt and bare arms below the sleeve if appropriate, with this garment:

- `tracksuit` — A cobalt blue zip-up tracksuit jacket with white piped seams and a dark navy zipper.
- `collared_sweater` — A teal knitted V-neck sweater over a cream shirt with a crisp pointed collar.
- `blazer` — An eggplant purple tailored blazer over a pale cream button-up shirt.
- `overalls` — Classic medium blue denim bib overalls with brass fasteners over a warm yellow crew-neck shirt.
- `striped_tee` — A short-sleeved cream T-shirt with wide alternating pine green horizontal stripes.
- `football` — A cobalt blue short-sleeved soccer jersey with white sleeve trim and small plain white shoulder panels. Completely unbranded, blank front, no number.
- `astronaut` — A white retro astronaut suit with sky-blue edging and a simple colorful control panel made of plain geometric buttons. The head and neck remain completely visible, no helmet.
- `knight` — A friendly toy-like medieval knight's steel chest armor with layered round silver pauldrons, dark navy cloth underneath and gold rivets. No weapon, helmet or emblem.
- `superhero` — A cheerful original cobalt superhero suit with a small golden diamond clasp and rich burgundy cape draped outside both shoulders. No insignia on the chest, head remains bare.
- `doctor` — An ivory doctor's lab coat over a sky-blue shirt, with a dark stethoscope lying flat across the chest, plain pockets.
- `dinosaur` — A bright leafy green dinosaur hoodie with dark green plate-like soft spikes and a light green belly panel. Hood down and bunched behind neck, three soft green spikes on the folded hood below the chin, no costume pieces over the head.
- `winter_coat` — A warm cobalt blue quilted puffer coat with rounded padded channels, a dipped stand collar ending below the chin and rich navy zip trim.

> Preserve the exact bald head, ears, jaw, chin, neck, expression, horizontally centered pose, square canvas, and size and position of the full bust. Original warm hand drawn game ink and soft cel shading. Keep the avatar body extending through the very bottom edge with no hem visible. Match or slightly expand the original torso outline so this garment can be cut out and composited over the same child. Keep the garment's collar opening at the original neck opening and maintain the same square framing and available transparent space. No hands, brand, logo, lettering, extra accessory or backdrop. Real transparent RGBA.

**Yüzler**

> Use case: precise-object-edit. Image 1 is the edit target. Edit ONLY the eye, eyebrow and mouth regions of this exact original school avatar to show:

- `big_grin` — A very big happy open grin with an upper row of white teeth, dark mouth interior, visible pink tongue, and cheerful slightly raised cheeks. Keep the eyes open.
- `wink` — Close the viewer-left eye in a playful unmistakable wink with a gently curved dark eyelid. Right eye stays open. Keep the friendly little smile.
- `tongue` — A cheeky small open smile with a pink tongue sticking out over the lower lip. Both eyes open.
- `surprised` — Raised brows and big round wide-open eyes with a small round dark O-shaped mouth, innocent surprise.
- `heart_eyes` — Replace both dark irises with bright raspberry red heart shapes with small highlights inside the existing cream eye openings and eyelid contours. Keep both pink hearts perfectly clear. Small delighted open smile.
- `star_eyes` — Replace both dark irises with large five-pointed golden yellow stars with thin dark brown edges and a little highlight, within the existing eye openings. Both golden stars clearly visible, delighted small smile.
- `smirk` — A confidently cool, gentle asymmetrical closed half-smile, one corner raised, with one arched eyebrow and both eyes open.
- `happy_closed` — Both eyes closed in upward little crescents, a contented bright smile showing a little white teeth, joyful eyebrows.

> Keep skin hue, placement, dimensions, outline, jaw, ears, nose, posture, shirt, and upper-forehead highlights exactly the same. Keep both eyes and mouth as close as possible to the exact original positions, matching warm brown line style. Use the same whole square bust framing and transparent background. No extra shapes outside the face, text or objects.


## Faz 4 — Hayvan arkadaşları

`SPECIES` sırasındaki 89 arkadaş, yerleşik ImageGen ile 10 levhada üretildi. Her levhada pilot tilki `gelistirme/pilot_avatar/kaynak/pet_fox_imagegen.png` stil referansı olarak kullanıldı ve `transparent_background=true` istendi. Ham levhalar `kaynak/imagegen/faz4/`, kesim eşlemesi `kesimler.json`, 512×512 RGBA ana kopyalar `kaynak/pet/` altında. Yayın dosyaları `public/av/pet/` altında 256×256, kalite 90 WebP olarak paketlendi.

Altıncı levhanın arka planında yarı saydam bir mat kaldı. Levhaya özel alfa eşiği ile temizlendi ve balinanın su damlaları korundu. Önizlemede her arkadaş 128 ve 96 pikselde, ayrıca açık ve koyu tende, şapka ve gözlük seçeneklerinin sekiz kombinasyonunda yer alıyor.

### Yeniden paketleme

Depo kökünden aşağıdaki komutları çalıştır. İlk komut ham levhalardan ana PNG'leri çıkarır. Yalnız WebP ve manifest güncellemesi gerekiyorsa ikinci komut yeterli.

```sh
gelistirme/.venv/bin/python -B gelistirme/avatar_uretim/faz4_katmanlari_hazirla.py
gelistirme/.venv/bin/python -B gelistirme/avatar_uretim/paketle.py --phase 4
gelistirme/.venv/bin/python -B gelistirme/avatar_uretim/onizle_faz4.py
```

### Yerleşik ImageGen istemleri

Her çağrı aşağıdaki ortak metinle başladı. `10.png` için `exactly nine` ifadesi `exactly eight` olarak değiştirildi.

> Use case: illustration-story. Create one square sprite sheet for a children's avatar app. Input 1 is a STYLE REFERENCE ONLY: match the pilot fox's polished 2D cel shaded cartoon, warm dark fine contours, bold shapes, expressive illustrated eyes, friendly smile and big head. Draw exactly nine full-body individual companion sprites, positioned on an exact equally spaced 3 by 3 grid, each centered within its cell at x/y centers 16.7%, 50%, 83.3%. Each sprite is small enough for generous blank gutters around all four edges of its own cell; nothing crosses cell borders. Seated in relaxed three-quarter view where anatomically possible; birds perch without a branch, marine animals float without water. Natural distinct colors or character-appropriate colors. Entire silhouette including ears, tail, feet visible with consistent relative scale. True transparent background, no cast shadows, no props, no grid lines, no text. Precisely the following row-major positions, one per cell:

- `01.png` — Row 1: orange red fox, orange tabby house cat, golden floppy-eared puppy. Row 2: brown bear cub, white rabbit, black-and-white giant panda. Row 3: green frog, golden lion cub with a small mane, yellow baby chick.
- `02.png` — Row 1: pink domestic piglet, orange striped tiger cub, brown monkey with curling tail. Row 2: gray mouse with long thin tail, golden hamster with cheek pouches and stubby tail, black-and-white cow calf. Row 3: brown owl with large amber eyes, black-and-white penguin, reddish brown domestic hen with small comb.
- `03.png` — Row 1: mallard duck with green head and yellow bill, gray koala, gray wolf. Row 2: gray raccoon with mask and ringed tail, chestnut horse foal, black-and-white zebra foal. Row 3: polar bear cub, dark bristly wild boar with small tusks, charcoal black housecat with green eyes.
- `04.png` — Row 1: white curly-haired poodle, brown hedgehog with spiny back, striped reddish-brown chipmunk with a fluffy upright tail. Row 2: green land turtle with brown shell, tan snail with spiral orange shell, golden honeybee with black stripes. Row 3: red ladybug with black spots, orange monarch butterfly with open wings, yellow-and-blue tropical tang fish.
- `05.png` — Row 1: golden round pufferfish with soft spikes, red crab with two claws, white mountain goat with small horns and beard. Row 2: white fluffy lamb with dark legs, red-combed colorful male rooster, vivid scarlet macaw parrot. Row 3: pink flamingo naturally standing on one leg, small white dove with pink feet, elegant white swan with orange beak and curved neck.
- `06.png` — Row 1: bald eagle with white head and brown body, pink octopus with eight curling arms, blue bottlenose dolphin with long beak. Row 2: dark blue round spouting whale with short white spout integrated close above head, gray harbor seal with spotted body, brown sea otter upright with round furry face and small paws. Row 3: brown beaver with broad flat crosshatched tail, black skunk with white stripe and fluffy raised tail, short gray European badger with distinct black-and-white longitudinal face stripes.
- `07.png` — Row 1: light brown sloth with dark eye marks and long arms, rust brown kangaroo with long sturdy tail, fluffy white llama with tall banana ears. Row 2: golden Bactrian camel showing two humps seated folded legs, fawn-colored spotted deer with narrow branching antlers, dark brown moose with broad flat antlers and large muzzle. Row 3: purple-gray bat with spread wings, golden spotted giraffe calf seated with long neck, gray elephant calf with trunk and big ears.
- `08.png` — Row 1: slate-gray hippo with broad muzzle, gray rhinoceros with one large nasal horn, charcoal black gorilla sitting on haunches. Row 2: orange orangutan with long arm fur, golden leopard with black rosettes and visible long tail, brown American bison with shaggy hump and small horns. Row 3: olive green crocodile with long toothy snout, bright green lizard with slender legs and long tail, gray-blue shark with triangular fins and tail.
- `09.png` — Row 1: blue and green peacock with a fanned tail, lavender jellyfish with flowing tentacles, plump gray dodo with huge hooked beak. Row 2: woolly brown mammoth with curving ivory tusks, green T-Rex with little arms and sturdy legs, long-necked turquoise sauropod with tiny head and long tail. Row 3: white unicorn with pastel mane and gold horn, seated teal dragon with bat-like wings and long tail, red-gold phoenix bird with flowing flame-colored feathers.
- `10.png` — Row 1: cute rounded metal robot with two eyes and little legs, lime green classic alien with a large head and long oval eyes and small limbs, fluffy purple space monster with three eyes and little limbs. Row 2: cute white floating ghost with scalloped wavy bottom, orange jack-o'-lantern pumpkin with expressive carved face, white snowman with carrot nose and scarf. Row 3: bright yellow round sun with face and rays, silver full moon disk with subtle craters and a friendly face, LEAVE THIS LAST CELL EMPTY.


## Faz 5 · Yüz çeşitleri, poz, animasyon (27 Kas 2026)

Yeni çizim yok; `yuz_varyant.py` orijinal tabandan (kaynak/base_orijinal/) 4 yüz şekli (oval, yuvarlak, ince, köşeli) x 3 kulak (küçük, orta, kepçe) taban üretir. Yanak-çene yalnız y>=246'da ve merkezden 44 px dışında oynar, ifade katmanları kaymaz. Ayrıca boyanabilir iris (göz rengi), yanak katmanları (allık, çil) ve göz kırpma katmanı (mutlu kapalı gözlerin üst yarısı). Manifest `variants` bölümüne yazar. Yüz şekli, kulak, göz rengi, yanak ve arkadaşın pozu ilk gün öğrenciye seed'den rastgele dağılır. Nefes ve göz kırpma yalnız 100 px üstü avatarlarda (GPT istişaresi: listede 20 animasyon telefonu yorar).


## Faz 6 · Yüz şekilleri ve kucakta tutan eller

Yerleşik ImageGen, pilotun `../pilot_avatar/kaynak/imagegen/base.png` portresini referans alarak beş yüzü ve iki eli gösteren tek katmanı ayrı çağrılarda çizdi. Altı ham PNG `kaynak/imagegen/faz6/` klasöründe. Yüz katmanları `public/av/base/shape_<id>.webp`, el katmanı `public/av/pose/hands.webp` yolunda. Katmanlar 512 × 512 RGBA, WebP kalite 92. Eşleşen `_mask.webp` dosyaları kayıpsız.

- Yüzler iki göz ve ağızdan hizalandı. Alın, yüz çizgileri, boyun ve tişört `kaynak/base_orijinal/` içindeki 512 px tabandan geri kopyalandı. Geçişler yaklaşık 7 px. Göz kutusunun kulaklara taşan yan kenarlarında eski kulakların izini engellemek için geçiş yeni kulak ve yanak konturunu izliyor. Piksel kopyası WebP kodlamasından önce alındı.
- Katalog tabanının `skinRef` değeri **163.7334**. Kodlanmış yüzler ve ten maskelerinden ölçülen referanslar `round` 164.5132, `long` 165.1164, `square` 164.1902, `heart` 163.7820 ve `wide` 162.7327. Beş yüz ortak `skinRef` ile boyanabilir. El katmanının kendi `ref` değeri **157.0464**.
- `kaynak/onizleme_faz6.png` orijinal tabanı ve beş yeni yüzü açık ve koyu tende, kısa saç ve at kuyruğuyla, 256 ve 96 px olarak gösterir. Kedi göğüste, eller kedinin önünde birleştirildi.
- At kuyruğunun arka katmanının kökü küçük kulakların altında görünür hâle geldiği için önizlemede arka katman şu miktarlarda sola alındı. 512 px kanvasta yatay kaydırma miktarları `round` 5 px, `long` 13 px, `square` 7 px, `heart` 10 px, `wide` 5 px. Ön saç katmanı aynı koordinatlarda kullanılır.

### ImageGen istemleri

Altı çağrıda da `transparent_background=true` kullanıldı. Beş yüz istemi aşağıdaki ortak metin ile ilgili şekil paragrafının birleşimidir.

**Ortak yüz istemi**

> Use case: precise-object-edit. Input image: the existing transparent 2D avatar portrait is the edit target. Produce a tightly registered replacement portrait on the same square canvas, genuine transparent alpha, same framing, cel illustration, line weight, warm orange skin and light direction. Lock the forehead and scalp above y=190, eyes and eyebrows, nose and mouth coordinates and dimensions, shirt, neck position and shoulder framing. Pixel coordinates refer to the inherited image on a 512x512 grid. Edit ONLY cheeks, jawline, chin and ears. Both ears should be small natural ears tucked close to the face, around y=223–262 (much smaller and less protruding than the input). Make the lower-face outline read unmistakably at 96x96. The upper forehead remains the exact original silhouette, with a smooth natural transition into the new cheeks below the outer eye corners. Short jaw shapes need natural continuous neck skin behind the jaw, matching the original neck from y=318 down. Keep the mouth on the face with room underneath. No hair, accessories, text, sex/gender cues, new clothing or marks.

**`round.png`**

> Shape ROUND: distinctly baby-faced pillowy full round cheeks, strongly bowed out below eyes, rounded jaw with a curved generous chin, contour visibly fuller than reference and widest at y=255–273. Chin low point y=310–315 and width at y=295 around 165px; strongly circular lower shape.

**`long.png`**

> Shape LONG: notably slender and vertically elongated lower face, like a tall oval, long tapering sides and a slim elongated softly rounded chin reaching toward y=324. Cheeks are narrow and relatively straight below the eyes. Lower face is visibly slim, especially around y=284–312. Keep enough space next to eyes and mouth so contours do not overlap them.

**`square.png`**

> Shape SQUARE: distinctly broad squared jaw with visually clear rounded angular corners around y=288 and a broad nearly horizontal bottom of chin at y=311–315, straight broad side cheeks. An obvious blocky jaw compared to the input, while still a cute child.

**`heart.png`**

> Shape HEART: strong wide cheekbone shoulders next to and just below the eyes, then dramatically diagonal tapered lower cheeks leading to a small sharply pointed but softly finished chin at y=316–320. The narrow point is obvious and visually distinct. Avoid squaring off the chin.

**`wide.png`**

> Shape WIDE: very broad squat face contour, width emphasized low on either side of the mouth, shallow broadly rounded chin and dramatically short height below the mouth. Chin bottom y=292–296, wide at y=281, curves rapidly into a low gently rounded horizontal arc, almost flat bottom without any square angles. Narrow neck skin becomes visible directly below this short jaw.

**`hands.png`**

> Use case: illustration-story, transparent compositing asset for a 2D layered avatar. The input avatar is only a style, scale and positioning reference. Draw precisely two small chubby children's hands with a little wrist each, in the same softly shaded semi-gloss 2D cartoon illustration and dark thin warm brown outlines. Draw the two hands in warm tawny orange skin matching the reference; these will be converted to grayscale skin. Front view. Both hands cup the sides and bottom of the same invisible small upright animal held against the chest. Empty transparent canvas everywhere else including all space at the top. The imaginary animal occupies x=181 to 331, is about 150px tall, centered at x=256 on a virtual 512x512 square canvas, with its feet around y=455. Each hand wraps partly inward in front of its invisible lower sides, with curved rounded separated fingertips. Outer hand boundaries around x=149 and x=363, highest fingertips around y=361–380. Palms curve under the animal at about y=431–467. Wrists point down and continue to the lower canvas edge, about x=165–205 and x=307–347. Preserve the central transparent gap between the two hands. Show two natural gripping hands, genuine alpha, no person, animal, sleeves, arms, shirt, scene, text or placement guides.

### Faz 6 bağlama (Claude, 27 Kas 2026)

Codex'in yüzleri `kaynak/shape/` altına taşındı; `yuz_varyant.py` oval (orijinal) + 5 yüzden 3'er kulak boyu (taşma 8/13/19 px) üretir. `goz_katmani.py` gözü hareketli yapar: göz açıklığı maskesi (`base/eye_open.webp`), açıklık içi kayan katman (`base/iris_full.webp`, göz akı + iris birlikte kayar, halka izi kalmaz), altta göz akı yaması (`base/eyes_empty.webp`). Kendi gözünü çizen ifadelerde (manifest `variants.eyes.ownEyes`) göz kaymaz. `sac_dolgu.py` her saç için yüzün arkasına koyu saç dolgusu üretir (dar yüzde arka plan görünmesin). Sırayla: yuz_varyant → goz_katmani → sac_dolgu, sonra manifest'e `hands` ve `hairBackDx` (Codex'in at kuyruğu kaydırmaları) elle.


## Faz 7 · Yumuşak yüz şekilleri

Beş yüz, yerleşik ImageGen ile pilotun `../pilot_avatar/kaynak/imagegen/base.png` tabanı düzenlenerek üretildi. Ham seçimler `kaynak/imagegen/faz7/` altında. 512 × 512 RGBA yüzler WebP kalite 92, ten maskeleri kayıpsız WebP olarak `kaynak/shape/` altına yazıldı. Önceki on dosyanın birebir kopyası `kaynak/shape/faz6_yedek/` altında.

Yüzler iki göz ve ağızdan hizalandı. Alın ve tepe, kaşlar ve gözler, burun ve ağız, boyun ve tişört orijinal 512 px tabandan alındı. Göz ve ağız çevresindeki geçişler iki portrenin konturundan içeri alınarak kulak kenarları korundu. Uzun yüzde, tek çene çizgisini korumak için boyun geçişi birkaç piksel aşağı taşındı. Seçimlerin yanak ve çene konturuna küçük, kademeli düzeltmeler uygulandı. Uzun yüzün merkezindeki çene çizgisi orijinalin yaklaşık 9 px altında, geniş yüzünki yaklaşık 4 px üstünde.

| Yüz | Aday ve seçim nedeni | Ölçülen `skinRef` |
| --- | --- | ---: |
| `round` | İkinci adayın dengeli alt yüzü seçildi. Dolgunluk çene köşelerine doğru yayılmadan üst yanağa taşındı. | 164.1649 |
| `long` | İkinci adayın yuvarlak çene yayı seçildi. Alt oval biraz uzatıldı ve yanaklar hafif daraltıldı. | 165.0364 |
| `square` | İlk aday seçildi. Çenenin alt yanlarındaki genişlik artırılıp yanaktan çene dibine geçiş yumuşatıldı. | 164.2578 |
| `heart` | İkinci adayın küçük, yuvarlak çenesi seçildi. Elmacık çevresine hafif dolgunluk verildi. | 164.2800 |
| `wide` | İlk adayın geniş yanakları seçildi. Çene yayı biraz yukarı alındı. | 163.5961 |

Katalogdaki ortak `skinRef` 163.7334. Kodlanmış tüm yüzler ±8 aralığında. `kaynak/onizleme_faz7.png` oval referansı ve beş yüzü açık ve orta tende gösteriyor. Saçsız satırlar 256 px, kısa saç ve at kuyruğu satırları 128 px. Konturlar, kulak birleşimleri ve saç katmanları altı satırda görsel olarak kontrol edildi. At kuyruğu için mevcut katalogdaki arka katman konumları kullanıldı.

### Yerleşik ImageGen istemleri

Sekiz düzenlemenin tamamında pilot taban düzenleme hedefi olarak verildi ve `transparent_background=true` kullanıldı. Her çağrıda ortak isteme ilgili şeklin aşağıdaki İngilizce metni eklendi.

> Use case: precise-object-edit. Image 1 is the edit target. Edit the cheeks, jaw, chin and ears only. Keep this exact friendly bald child, square bust framing, upper forehead and scalp, identical eyes, eyebrows, nose and small smile in the same positions, same neck and dark T-shirt. Match the warm thin brown ink and soft orange cel shading. Draw both ears small, natural and close to the head, around y=205–262 on the inherited 512px grid. The outline from temple past cheeks to chin should flow in continuously rounded curves, with a smooth jaw-to-neck join. Keep all proportions natural and cute, and the requested variation subtle. Avoid straight edge segments, corners, points, V-shaped tips and flat spots at the base of the chin. Transparent square canvas, no hair, text, accessories or props.

- `round`, ilk aday — Give the child softly full, round cheeks and a gently rounded lower face. Let the cheek curve flow into a balanced circular chin arc.
- `round`, seçilen aday — Use a fuller curved cheek silhouette between the lower eyelids and the corners of the smile. The cheeks extend only a few pixels farther outward on each side. Below the smile they flow into a compact, plush, circular lower face. Keep the chin a gently rounded arc. Keep the ears tucked close to the head.
- `long`, ilk aday — Give the child a softly elongated slim oval with slightly narrower cheeks and jaw. On the 512px reference grid the rounded chin reaches about 8–10 pixels below the input chin. Keep a cute childlike ratio between width and height, with softly curved cheek sides.
- `long`, seçilen aday — Keep the cheek curve gently oval and a little narrower than the edit target, with a broad rounded turn at the very bottom of the chin. Add a small amount of vertical space below the mouth, about 9 pixels on the inherited 512-pixel grid or 3 percent of head height. The chin is a rounded arc with no tip. Keep the soft cheek volume of a child.
- `square` — Give the child a slightly wider jaw that stays rounded all the way down. Let the jaw carry some width to visible soft lower cheeks before it sweeps into one broad, continuously rounded chin arc. Use a modest change that looks like a healthy cute child.
- `heart`, ilk aday — Give the child slightly fuller cheekbones and cheeks that gently narrow toward a modest small round chin. Keep the very bottom rounded, like a small U-shaped arc with a soft transition from each side.
- `heart`, seçilen aday — Keep the child's cheeks softly full alongside the outer corners of the eyes. Give the lower jaw gently tapered upper sides that curve into a small, smooth oval chin with the bottom fully rounded. The base of the chin should follow a smooth bowl-shaped arc, with no tip and no corners. Preserve natural room around the smile.
- `wide` — Give the child a slightly wider and shorter lower face with full cheeks. Use one visible, broad convex arc curving gently down at the center of the chin and smoothly up into the cheeks. Keep the compact shape subtle, cute and natural.

## Kucak pozunda uzun kol ve küçük kıyafet kartları

Tavşan, kedi ve köpek pozlarında manşet çizgileri 640 px poz tuvalinde. Kısa kollular mevcut kol katmanını kullanır. Uzun kollularda omuz ve gövde seçilen giysiden, bileğe kadar olan kumaş da aynı giysinin opak kol bölgesinden gelir. Kış montunun kapitone kumaşı ayrı bir ImageGen katmanından alınır ve mont rengiyle boyanır. Ortak kucak pozunda manşet bilek parçasının alt ucuna eklenir.

Kep, balıkçı, kovboy, korsan ve sihirbaz şapkalarıyla Afro, kıvırcık, topuz, çift topuz ve dikenli saçların yanları tam saç katmanından geliyor. Üstteki saç hattı saç modeline göre şapkanın içine doğru ayarlanır. Afro için kep genişletilir.

### Yerleşik ImageGen

Şeffaf çıktı için mevcut WebP'ler referans verildi. Kıyafet kartları alfa sınırına kırpılıp 512 px kareye ortalandı. Pelerin kartındaki doygun kırmızı ve altın maske dışında kalır. Mont kumaşının yalnız opak ortası 256 px WebP olarak paketlendi.

- `clothes/winter-coat-sleeve.webp` için `clothes/winter_coat.webp` çizgi ve kumaş referansı, `pose/dog-cradle.webp` boyama stili referansı. İstem, kol sınırına kırpılabilecek orta gri yumuşak kapitone kumaş, üç-dört geniş kavisli dikiş kanalı, kapama ve fermuar içermeyen opak orta bölge.
- `clothes/dinosaur-card.webp` için `clothes/dinosaur.webp` düzenleme hedefi, `clothes/superhero.webp` stil referansı. İstem, 75 px kartta omuzlara inik kapüşonun dışına taşan iri koyu yeşil plakalar ve gövdeden daha güçlü ayrılan kapüşon. Önden görünüm ve açık yeşil karın paneli korunur.
- `clothes/superhero-card.webp` için `clothes/superhero.webp` düzenleme hedefi, `clothes/dinosaur.webp` stil referansı. İstem, 75 px kartta kolların yanına doğru açılan geniş bordo pelerin panelleri ve büyük, basit altın baklava toka. Kömür gri gövde ve önden açık yaka korunur.
