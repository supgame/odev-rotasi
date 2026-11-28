# Avatar v2 · 2. gün pilotu: civciv avuçta, tavşan kucakta (28 Kas 2026)

Proje: `/home/Edrow/ChatGPT/odev-rotasi` (React+Vite, GitHub Pages; ucuz Android telefonda 8-10 yaş köy çocukları). Önce oku: `gelistirme/PLAN_avatar_v2.md`, `gelistirme/mimari_danisma/CEVAP_astra.md` (senin önerin, bu pilot onun 2. günü), `gelistirme/avatar_uretim/NOTLAR.md` (Faz 6-8), `src/avatar/Avatar.tsx` (`layers`), `src/avatar/render.ts`, `src/avatar/companionCradle.ts`, `src/avatar/companionContact.ts`, `src/avatar/gender.ts`. Kullanıcının itirazı: `gelistirme/kullanici_geri_bildirim_28kas/6.png` (civciv: kol kapüşonlunun omzundan yapıştırma gibi çıkıyor, civciv gerçekçi, çocuk çizgi film) ve `7.png` (köpek: el küçük, köpek başka stil).

## Hedef
Hibrit poz şablonunun iki pozunu kur ve gerçekten işe yarıyor mu ölç. Kötü çıkarsa dürüstçe "olmuyor" demek de geçerli sonuç; plan burada durup yöntemi değiştirecek.

1. **Avuç açık pozu + civciv.** Çocuğun bir kolu omuzdan parmak ucuna TEK çizim: gövdeyle bütün, omuz çizgisi kesintisiz, dirsek ve bilek doğal; avuç açık öne/yana uzanmış. Civciv avucun içinde durur: ayakları avuca basar, öndeki parmak uçları civcivin ayaklarının/göğsünün önüne geçer (aynı çizimden maskeyle ayrılan ön katman), temas gölgesi var.
2. **Kucak pozu + tavşan.** İki kol tek çizim: arka kol tavşanın arkasında, önkol tavşanın göğsünün/karnının önünde, eller tavşanı gerçekten taşıyor (ağırlık okunuyor). Tavşan göğse sokulmuş, başı çocuğun omzuna/çenesine doğru.
3. Her iki poz **tişört** ve **kapüşonlu** ile. Kıyafet poz siluetine göre çizilir (kol kumaşı dahil), rengi bugünkü gibi gri ton + maske ile boyanır (bütün kıyafet renkleri çalışsın). Ten de maskeyle boyanır (5 ten). Diğer 12 kıyafet bu pilotta mevcut görünümde kalabilir.
4. **Stil:** civciv ve tavşan, onaylı çocuk portresiyle AYNI çizgi dilinde (koyu sıcak kahve kontur, yumuşak boyama) yeniden çizilir. Gerçekçi tüy dokusu, iri bebek gözü, kirpikli hayvan yok. Her çizimde referans olarak mevcut çocuk portresinden bir birleşik görüntü ve poz şablonu verilir.

## Kafa ve gövde bağlantısı
- Baş, saç, yüz katmanları bugünkü 512 tuvalinden gelir (Avatar.tsx `layers`). Yeni gövde/kol çizimi, mevcut boyun ve omuz hizasına oturmalı; boynun bittiği yerde dikiş, çift kontur veya kayma olmasın. Kucak pozundaki `atHead` dönüşümünü gerekiyorsa yeniden hesapla.
- Uzun saç (`hair_straight_long`, `hair_braids`) ve başörtüsü omuzda doğru katmanda kalsın; kucakta tavşanın başı saçı kesmesin.
- Kız ve erkek aynı gövdeyi kullanır (cinsiyet yalnız başlangıç saçı/yüz ayrıntısı, `gender.ts`).

## Koda bağlama
- Pilotta: civcivin bugünkü "Yanımda" temas sahnesi (avuçta) ve tavşanın "Kucağımda" sahnesi, kıyafet tişört ya da kapüşonluysa yeni pozla çizilir; diğer kıyafetlerde bugünkü çizim kalır. Eşya/poz kimlikleri ve satın alımlar değişmez, migration gerekmez.
- Poz verisini yeni bir manifest dosyasında tut (ör. `public/av/pose/v2/manifest.json`: poz adı, katman yolları, ten/kumaş maskeleri, ön katman, hayvan yerleşimi, dokunma tepkisi). Kod bunu okuyup çizsin; 3. günde köpek, papağan ve fil aynı koddan geçecek, buna göre genel yaz ama gereksiz soyutlama yapma.
- Dokunma tepkisi: civciv başını eğip "cik" yapar, tavşan burnunu oynatır; ayaklar/pençeler temas yerinden kaymaz. `prefers-reduced-motion` açıksa hareket yok.
- Galeriye (`src/avatar/Gallery.tsx`) "v2 pilot" bölümü ekle: eski ve yeni yan yana; 5 ten × (tişört, kapüşonlu) × (kısa saç, uzun saç, başörtüsü) × (kız, erkek başlangıç) ızgarasından makul bir alt küme.

## Kabul
- Telefon boyutunda (160 px ayna ve 240 px ana sayfa avatarı) **hareketsizken** bile "çocuk civcivi avucunda tutuyor" ve "tavşanı kucağında taşıyor" okunuyor.
- Omuzdan kol çıkma görüntüsü yok; tek omuz silueti, temas yerinde boşluk yok; çocuk ve hayvan aynı ışık ve çizgi dilinde.
- 5 ten ve birkaç kıyafet rengiyle maskeler taşmıyor; 70-90 px kartta da bozulmuyor.
- Kabul edilen her çizim için ImageGen deneme sayısı ve süresi `NOTLAR.md`'ye yazılı (3. günün hız tahmini buna dayanacak).
- `npm run build` temiz.

## Kurallar
- Çizimler yerleşik ImageGen ile. Ana PNG'ler `gelistirme/avatar_uretim/kaynak/v2/` altına, web webp'leri `public/av/pose/v2/` altına; istemleri ve ayırma betiklerini `NOTLAR.md`'ye ("Avatar v2 · 2. gün" başlığı) yaz.
- Kontrol görüntülerini `gelistirme/v2_gun2_kontrol/` altına koy: her iki poz için 375×812 telefon ve 1280×800 masaüstü kadrajı, küçük kart, büyük ayna; eskisiyle yan yana.
- Tarayıcıyı kullanıcının Chrome'unda açma (headless serbest). 5198 ve 8765 portlarına dokunma; gerekirse 5197.
- Push etme. `.git` yazılamazsa commitleri `gelistirme/v2_gun2_kontrol/v2_gun2.bundle` git bundle'ı olarak teslim et (bugünkü main `118353b` tabanından).
- Mevcut öğrencilerin `equipped`/satın alımları ve diğer pozlar bozulmasın.

## Bitiş
`gelistirme/son_codex_yaniti_v2_gun2.md` içine kısa Türkçe özet: ne yaptın, commit(ler)/bundle, çizim başına deneme ve süre, hangi kabul maddesi geçti/geçmedi, dürüst kanaat (yöntem tutuyor mu, 3. güne nasıl devam edilmeli), denemediğin şeyler.
