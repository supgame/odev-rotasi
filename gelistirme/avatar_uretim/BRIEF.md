# Tam avatar kataloğu (ImageGen, katmanlı) — ANA BRIEF

Tarayıcı açma, commit atma, src/ ve supabase/ altına dokunma. Yalnız gelistirme/avatar_uretim/ ve public/av/ (pilot hariç yeni klasörler) içine yaz.
Python: gelistirme/.venv/bin/python (Pillow, numpy). ImageMagick var.

Pilot onaylandı: gelistirme/pilot_avatar/ (NOTLAR.md, katmanlari_hazirla.py, paketle.py, kaynak/imagegen/*.png, onizleme.png).
Aynı çizgi, aynı kanvas, aynı yöntem. Temel çocuk = gelistirme/pilot_avatar/kaynak/imagegen/base.png (ve hizalanmış base_skin1.png).
Stil referansı: tilki (gelistirme/pilot_avatar/kaynak/pet_fox_imagegen.png) + base.png.

## KESİN KURALLAR
- Görünen her çizim built-in `image_gen` ile. Kodla şekil çizmek YASAK (SVG/PIL draw yok). Kod: hizalama, ayıklama, alfa temizliği, gri tonlama, maske, paketleme, kontakt kağıdı.
- Her eşya iki tende ve şapkalı/şapkasız, gözlüklü kombinasyonlarda kontrol edilir. Kötü çıkanı yeniden üret.
- Var olan bir oyun/markanın karakterini, logosunu, yazısını taklit etme. Kıyafette yazı/logo yok.

## Ortak çıktı düzeni
- Ana kopyalar: gelistirme/avatar_uretim/kaynak/<slot>/<id>*.png (1024 kanvas). Ham ImageGen çıktıları: gelistirme/avatar_uretim/kaynak/imagegen/.
- Yayın: public/av/<slot>/<dosya>.webp, 512x512 (hayvanlar 256x256), kaliteli lossy (q~90), maskeler lossless.
- Katalog: public/av/manifest.json — TEK dosya, her faz kendi bölümünü ekler/günceller (öncekini bozmadan). Biçim aşağıda.
- Kontakt kağıdı: gelistirme/avatar_uretim/onizleme_<faz>.png (96 px satırı dahil).
- Notlar: gelistirme/avatar_uretim/NOTLAR.md (fazlara göre ekle: promptlar, sorunlar, yeniden üretim tarifi).
- Paketleme scripti tekrar çalıştırılabilir olsun: gelistirme/avatar_uretim/paketle.py (hepsini kaynaktan yeniden üretir).

## RENKLENDİRME SÖZLEŞMESİ (tarayıcı canvas'ta birebir aynısı uygulanacak)
Renklendirilebilir katmanın renkli bölgesi GRİ TONLU kaydedilir (gölge/ışık korunur). Yanında maske: tek kanal (L) webp, 255 = tam boya, 0 = dokunma.
Formül (her piksel, 0-255 uzayında): lum = 0.2126R+0.7152G+0.0722B ; dyed = clamp(color * lum / ref) ; out = rgb*(1-m) + dyed*m  (m = maske/255).
`ref` = o katmanın maske içindeki ağırlıklı ortalama lum değeri (manifest'te katman başına yazılır), böylece ortalama ton tam seçilen renge eşit olur.
Kontur (koyu çizgi) maske dışında kalsın ya da maskesi düşük olsun ki her renkte kontur koyu kalsın.

## manifest.json biçimi
{
  "version": 2, "canvas": 512,
  "palette": { "<renkId>": {"name": "Türkçe ad", "hex": "rrggbb"} , ... },
  "slots": {
    "skin":  { "items": [ {"id":"skin_1","name":"Açık","price":0,"color":"ffdcb8"} ... ] },
    "hair":  { "items": [ {"id":"hair_short","name":"Kısa düz","price":0,"layers":{"back":"hair/short_back.webp|null","front":"hair/short_front.webp","frontUnderHat":"hair/short_hat.webp","backUnderHat": "...|null"},"mask":{"front":"...","back":"...","frontUnderHat":"..."},"ref":{...}} ] },
    "hcolor": { "items": [ {"id":"hcolor_black","name":"Siyah","price":0,"color":"2c1b18"} ... ] },
    "hat":   { "items": [ {"id":"hat_cap_red","name":"Kırmızı beyzbol şapkası","price":15,"layer":"hat/cap.webp","mask":"hat/cap_mask.webp","ref":123,"color":"d83a3a","back":null} ... ] },   // renk varyantları aynı katmanı farklı "color" ile kullanır; boyanmayan eşyada mask/color yok
    "glasses": { ...aynı biçim... },
    "clothes": { "items": [ {"id":"clothes_hoodie","name":"Kapüşonlu","price":0,"layer":...,"mask":...,"ref":..,"tintable":true} ] },
    "ccolor": { "items": [ {"id":"ccolor_blue","name":"Mavi","price":0,"color":"..."} ] },
    "face":  { "items": [ {"id":"face_smile","name":"Gülümseme","price":0,"layer":null} , {"id":"face_wink",...,"layer":"face/wink.webp","mask":"face/wink_skinmask.webp","ref":..} ] },
    "pet":   { "items": [ {"id":"pet_fox","name":"Tilki","price":0,"image":"pet/fox.webp"} ] }
  },
  "base": {"layer":"base/base.webp","skinMask":"base/base_skinmask.webp","skinRef":..},
  "order": ["hairBack","base","face","clothes","hairFront","hat","glasses"],
  "notes": "çakışma kuralları: şapka takılıyken hair.frontUnderHat (+backUnderHat) kullanılır; ..."
}
Ten de renklendirme sözleşmesiyle: base'deki ten gri tonlu + skinMask (göz akı, iris, dudak içi, kontur maske dışı). Yüz ifadesi katmanlarında ten içeren pikseller varsa onlar da aynı ten maskesiyle boyanır.
Saç: gri tonlu + maske, saç rengi slotu boyar. Kıyafet: tintable olanlar ccolor ile boyanır; desenli/özel olanlar (forma, astronot vs.) tintable=false.
Fiyatlar: bedava başlangıç eşyaları 0, sıradan 10-20, havalı 25-40, çok özel 45-70 (yıldız). Adlar Türkçe, çocuk dili.

## FAZLAR (her çalıştırmada SADECE istenen fazı yap; en sonda manifest + paketle + önizleme güncelle)
Faz 1 — Altyapı + ten + saç:
  base'i gri tonlu ten + skinMask'e çevir, 5 doğal ten (açık, buğday, esmer, bronz, koyu) + 2 eğlenceli (yeşil uzaylı? hayır — sadece doğal 5 + "pembe yanaklı" yok) → yalnız 5 doğal ten.
  Saç stilleri (pilot kısa + at kuyruğu dahil, toplam 14): kısa düz, at kuyruğu, kısa kıvırcık, afro, uzun düz, omuz boyu küt, tepede topuz, iki örgü,
  iki yan topuz, uzun dalgalı, kahküllü uzun, dikleştirilmiş kirpi saç, yandan ayrık düzgün, başörtüsü (saç değil, kumaş; renklendirilebilir, şapka takılınca başörtüsünün üstüne oturur — kendin mantıklı çöz).
  Her saç için şapka altı varyantı (standart bir "şapka bölgesi" tanımla: tüm şapkalar bu bölgeyi kapatacak şekilde hizalanır).
  Saç renkleri 15: siyah, koyu kahve, kahve, kızıl kahve, sarı, altın sarısı, kızıl, platin, gümüş, pembe, mavi, mor, yeşil, kırmızı, turkuaz (ilk 6 bedava).
Faz 2 — Şapkalar + gözlükler:
  Şapka türleri (her biri renklendirilebilir değilse belirt): beyzbol şapkası (pilot), ponponlu bere, kulaklıklı kışlık bere, kedi kulaklı bere, kova şapka,
  kovboy şapkası, sihirbaz şapkası (yıldızlı), korsan şapkası (boyanmaz), altın taç (boyanmaz), astronot kaskı yerine "pilot başlığı ve gözlüğü" (boyanmaz), ayı kulaklı taç/bant.
  Renkli şapkalar için 3-5 renk varyantı (aynı katman, farklı color) → toplam ~30 şapka.
  Gözlük türleri: yuvarlak (pilot), kalın kare çerçeve, pilot (aviator), güneş gözlüğü, kalp gözlük, yıldız gözlük, korsan bandı. Renk varyantlarıyla ~16.
Faz 3 — Kıyafetler + yüz ifadeleri:
  Kıyafet: düz tişört (base'in tişörtü yerine renklendirilebilir katman), kapüşonlu (pilot), fermuarlı eşofman üstü, yakalı kazak, ceket ve gömlek, salopet,
  çizgili tişört, futbol forması (renklendirilebilir, numara/yazı yok), astronot giysisi (boyanmaz), şövalye zırhı (boyanmaz), süper kahraman pelerinli (renklendirilebilir),
  doktor önlüğü (boyanmaz), dinozor kapüşonlu (boyanmaz, yeşil), kış montu. ~14 tür; kıyafet renkleri 17 (pilotteki palet + altın).
  Yüz ifadeleri (base üzerinde edit, göz/kaş/ağız bölgesi ayıklanır): gülümseme (base), kocaman gülüş, göz kırpma, dil çıkarma, şaşkın, kalp gözler, yıldız gözler,
  havalı yarım gülüş, mutlu kapalı gözler. ~9.
Faz 4 — Hayvan arkadaşlar:
  Mevcut src/avatar/catalog.ts içindeki SPECIES listesindeki 89 tür (id, Türkçe ad, fiyat orada; aynen kullan). Tilki stiliyle, oturan tam boy, şeffaf, 512 kaynak → 256 webp.
  Çağrı sayısını azaltmak için ızgara üretim (ör. 2x2 veya 3x3, aralarda bol boşluk) + kesme serbest, ama her hayvan tek başına net ve aynı stilde olmalı;
  kalitesi düşük çıkanı tek başına yeniden üret. Robot/uzaylı/hayalet/kardan adam/güneş/ay da aynı sevimli çizgide.

Faz sonunda kısa rapor: ne üretildi, kaç image_gen çağrısı, sorunlar, hangi eşyayı atladın (varsa nedenini yaz; atlamak son çare).
