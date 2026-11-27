# Avatar pilotu

Pilot, Ödev Rotası için 8–10 yaşa yönelik katmanlı büstü ve tilki arkadaşını içeriyor. Gülümseme temel portreye gömülü. İki saçın da şapka altında ayrı ön katmanı var. At kuyruğu şapka takıldığında görünür kalıyor.

## Kaynak ve hizalama

- Görünen altı yeni çizim yerleşik `image_gen` ile gerçek şeffaf arka plan isteyerek üretildi. Ham PNG’ler `kaynak/imagegen/` altında. Mevcut `kaynak/pet_fox_imagegen.png` üretimde stil referansıydı ve 512 px’e küçültülerek yeniden kullanıldı.
- Temel portrede kafatası tepesi y≈190, çene y≈614 ve omuz çizgisi dışta y≈740. Baş ve gövde ortak 1024 px koordinatlarına taşındı. Gövde kanvasın altında kesiliyor. Çocukta düz tişört, kapüşonlu çıkarıldığında da giyinik bir taban sağlıyor.
- Saç düzenlemeleri göz ve ağız bölgelerinde yeşil kanal farkı en düşük tamsayı ötelemeyle hizalandı. Alın bölgesinde temel ile düzenlemenin farkından ön saç, at kuyruğunun kahverengi piksellerinden arka saç ayrıldı. Saç uçlarında kaynak ten renginin karıştığı kenar piksellerinin alfası ve rengi düzeltildi. Şapkalı saçlar, üretilmiş saçların siper altında ve şakaklarda kalan kısmını kullanıyor.
- Şapka siperinin alt çizgisi kaşların üstüne, gözlük açıklıklarının merkezleri gözlere, kapüşonlu açıklığı boyun çizgisine ölçek ve ötelemeyle oturtuldu. Açık buğday ve esmer tonlar aynı temel portrede, irisleri koruyan ten maskesiyle üretildi.
- `top_hoodie_mask.png` çizilen bir katman içermeyen gri kapsam haritası. Beyaz tam renk değişimine, siyah kaynak rengin korunmasına karşılık geliyor. Renk karışımı kumaşın parlaklığını ve kaynak alfasını koruyor. Önizlemenin ilk hücresi mavi örneği gösteriyor.

## Yeniden üretim ve yeni eşya

Depo kökünden çalıştırın. Önizleme etiketleri için Noto Sans Regular ve SemiBold kullanılıyor.

```sh
gelistirme/.venv/bin/python -B gelistirme/pilot_avatar/katmanlari_hazirla.py
gelistirme/.venv/bin/python -B gelistirme/pilot_avatar/paketle.py
```

1. Yüze veya kafaya tam oturması gereken bir eşya için `kaynak/imagegen/base.png` portresini yerleşik ImageGen’e düzenleme hedefi olarak verin. Yalnız eşyayı ekletin. Kadraj, yüz anatomisi ve konumu ile alfayı korumasını isteyin. Bağımsız üretim uygunsa tilkiyi çizim dili referansı olarak verip eşyayı önden ve şeffaf olarak üretin.
2. Düzenlemede göz veya ağız gibi değişmemesi gereken bölgelerden konum kaydını ölçün. İlgili eşya bölgesindeki farkı kullanarak çizimi ayırın. Eşya bir ten veya arka planla karışan kenarlar içeriyorsa alfayı düzeltin. Bağımsız eşyada opak sınırları kırpıp kulak, şakak, göz veya boyun gibi temas noktalarına göre ortak koordinatlara yerleştirin.
3. PNG’yi ortak kanvasta kaydedin. `paketle.py` içindeki çizim sırasına ve ilgili seçim kuralına katmanı ekleyin. Şeffaf WebP’yi ve kontakt kağıdını yeniden alın. Her iki ten tonu üzerinde, eşya çakışmalarında ve 96 px’de kenarları kontrol edin.

## Kontrol ve sınırlar

- İki ten, iki saç, şapka ve gözlük durumlarının 16 birleşimi yayımlanan 512 px WebP’lerden oluşturuldu. Aynı birleşimler 96 px boyutta da önizlemede yer alıyor.
- Saçlı ImageGen düzenlemeleriyle kıyaslandığında birleşim, saçın boyalı dokusunu ve temel portrenin ifadesini koruyor. Saç çizgisindeki gölge, ayrı katman ve iki ten tonu kullanıldığı için tek parça düzenlemeyle piksel düzeyinde aynı değil. Şapka ve gözlük de temel portreye yeni bir gölge düşürmüyor.
- Çıktılar dosya ve birleşim üzerinden kontrol edildi. Tarayıcıda çalışma zamanı testi yapılmadı.

## Yerleşik ImageGen istemleri

Aşağıdaki istemlerin her biri için `transparent_background=true` kullanıldı. Çocuk, şapka, gözlük ve kapüşonlu için tilki stil referansıydı. İki saç için ham çocuk portresi düzenleme hedefiydi.

### Temel çocuk

> Use case: stylized-concept. A single original, polished 2D mobile game avatar sprite of a smiling 9-year-old child. Image 1 is solely the style reference: matching the fox's warm dark brown tapered contours, shaped highlights, soft painted cel shading and expressive eyes. No fox in output. Child has a smooth hairless head for interchangeable wigs (no hair, no stubble), gentle wheat-golden tan skin, brown eyes, friendly closed tiny smile, clearly school-age proportions. Straight-on, level symmetrical head, shoulders square to camera. Plain dark slate fitted crew-neck T-shirt. True transparent RGBA background, crisp silhouette, no shadow beyond the body. Single 1024 square canvas, centered head, skull crown around y=190, chin around y=600, upper shoulder line around y=760 and chest continuing exactly through bottom canvas edge; leave ample space above skull for hats. No glasses, jewelry, words, gradients in the transparent area or other objects. A refined hand-illustrated raster sprite with rich cinnamon contours and warm directional highlights, closely matching the reference rendering technique.

### Kısa saç

> Use case: precise-object-edit. Image 1 is the edit target. Add ONLY the specified hairstyle to this same straight-on 9-year-old child sprite. Pixel-match the supplied character's position, face anatomy, head scale, visible skin, face highlights, neck, tee, and exact framing. Do not reillustrate the face, body or shirt, change the skin, or change the eye style. Keep the background genuinely transparent RGBA and keep the bust crossing the bottom edge at the same positions. Match the original 2D premium mobile game illustrated line work, contour thickness and warm cel shading. Hair is espresso-chestnut brown with soft chestnut highlight shapes; no orange or skin-colored strands. Keep both eyes and eyebrows fully uncovered. Add a low-volume, neatly textured short schoolboy crop with an asymmetrical tapered little side sweep whose tips end over the upper forehead, above eyebrows. Fit the locks closely around the existing head top and temples and end the haircut in short sideburns just in front of the upper ears; keep the ears exposed. Maintain the skull's broad round proportions. No objects or lettering.

### At kuyruğu

> Use case: precise-object-edit. Image 1 is the edit target. Add ONLY the specified hairstyle to this same straight-on 9-year-old child sprite. Pixel-match the supplied character's position, face anatomy, head scale, visible skin, face highlights, neck, tee, and exact framing. Do not reillustrate the face, body or shirt, change the skin, or change the eye style. Keep the background genuinely transparent RGBA and keep the bust crossing the bottom edge at the same positions. Match the original 2D premium mobile game illustrated line work, contour thickness and warm cel shading. Hair is espresso-chestnut brown with soft chestnut highlight shapes; no orange or skin-colored strands. Keep both eyes and eyebrows fully uncovered. Add a brunette schoolgirl hairstyle, a side-swept fringe with low crown volume and a single distinctly separate low ponytail which is entirely BEHIND the head and neck and visible to the right of the image, extending to just above the shoulder line. Keep visible ears, except a narrow taper at the temples. The front hair must stay only on the top and upper half of the head, far above the neck and shoulder, and the ponytail should emerge behind the right ear. Smooth broad locks that read well under a hat, with clean lines and no stray flyaways. A small dark chestnut elastic is okay. No objects or lettering.

### Beyzbol şapkası

> Use case: stylized-concept. Make ONE isolated red baseball cap wearable sprite on genuinely transparent RGBA. Reference 1 fox is STYLE ONLY, match its crisp warm auburn ink contours, pleasing layered cel shading and softly painted edge highlights; no fox. Camera orthographic exactly straight on at the avatar's eye level, symmetrical, centered. Vintage cherry and tomato red cloth dome, top button, two subtle sewn panel seams, and a moderately curved short peak facing directly forward. Make the soft dome broad and low with rounded sides to suit a 9-year-old child. The lower outer ends of the cap sit low over the outer temples, while the bottom edge of the central peak lies only slightly lower. No underside head opening visible, human, hair, words, embroidery, icons, background, cast shadow or surrounding objects. Fill 85% of the square width with the opaque cap and leave alpha around all sides. A refined premium 2D game inventory asset, not a diagram.

### Yuvarlak gözlük

> Use case: stylized-concept. Make ONE isolated pair of symmetrical round eyeglass frames, flat frontal orthographic view, level and dead straight from the front, as a wearable overlay for a 9-year-old child in an original mobile game. Reference 1 fox is style only: match warm soft shading with crisp rounded contours. Two distinct equal circular rim openings joined by a small arched bridge with generous open area for the eyes. Deep warm aubergine acetate frames with subtle lighter highlight on the upper edges. Small horizontal hinges on the outside edges, no earpieces visible behind. Both lens holes must contain perfectly transparent pixels with no lenses, no lens tint, no shine in the holes and no shadow. Genuinely transparent RGBA also outside frames. The glasses occupy 85% of square width, centered. No head, eyes, text, other objects or duplicate assets.

### Kapüşonlu

> Use case: stylized-concept. One isolated front-facing torso-only pullover hoodie sprite for a 9-year-old child's paper-doll bust in a premium 2D mobile game. Reference 1 is the fox for style only: match precise rounded contours, rich warm shadow edges and soft illustrated cel shading, no fox. Neutral medium slate gray main fabric, dark gray cast folds, gentle highlights on the seams. The hood is down, bunched behind the narrow neck opening, with a small crescent-shaped cutout at upper center for the child's neck. A pair of short drawstrings. Symmetric squared front view, shoulders and upper chest only, continues exactly beyond the bottom image edge. High cropped bust; no hem, pockets, cuffs, bottom contour line, hands, person, head, mannequin, filler shape in the neck opening, insignia or text. Genuinely transparent open background and neck cutout. Center garment at x=512 and make torso reach to the canvas bottom edge, with ample blank space above.
