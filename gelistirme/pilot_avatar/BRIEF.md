# Pilot: kaliteli katmanlı 2D avatar (Ödev Rotası)

Tarayıcı açma, commit atma, src/ altına dokunma. Yalnız gelistirme/pilot_avatar/ ve public/av/pilot/ içine yaz.
Görsel işleme için Python: gelistirme/.venv/bin/python (Pillow + numpy kurulu). ImageMagick (magick) da var.

## Amaç
Şu anki DiceBear Avataaars avatarları "elle çizilmiş SVG" gibi duruyor, şapka kafaya oturmuyor. 8-10 yaş çocuklar için,
modern mobil oyun kalitesinde, yumuşak gölgeli, temiz konturlu, sevimli ama bebeksi olmayan özgün bir çizgi lazım.
Var olan bir oyunun/markanın karakterini taklit etme; özgün tasarım.

## Kanvas sözleşmesi (çok önemli: her şey üst üste birebir oturacak)
- Tüm katmanlar 1024x1024 şeffaf PNG, aynı koordinat sistemi.
- Önden bakan büst portre (baş + boyun + omuzlar + göğsün üstü). Baş yatayda ortada.
- Kafatası tepesi ~y=190, çene ~y=600, omuzlar ~y=760, görsel tabanı y=1024'te kesik. Şapka için tepede boşluk kalsın.
- Hayvan ayrı kanvas: 512x512 şeffaf, aynı çizgide.

## Pilot içeriği
1. Temel çocuk (saçsız, kıyafetsiz değil: düz nötr tişörtle olabilir ama tişört ayrı katman olacak), 2 ten tonu (açık buğday ve esmer).
2. 2 saç: kısa (erkek çocuk), uzun at kuyruğu ya da omuz boyu (kız çocuk). Saç kafanın arkasına düşen kısmı varsa ayrı "arka saç" katmanı yap.
3. 1 şapka: kırmızı beyzbol şapkası ya da ponponlu bere — kafaya gerçekten oturan, hacimli. Şapka takılınca saçın ne olacağını çöz
   (şapka altına uyan "şapka saçı" varyantı ya da maske). İki saçla da şapka doğru görünmeli.
4. 1 gözlük (yuvarlak çerçeve).
5. 1 kıyafet (kapüşonlu sweatshirt), renk değiştirilebilir olsun istiyoruz: mümkünse nötr/gri tonlu üretip sonra renklendirmeye uygun maske de çıkar.
6. 1 ifade seti yeterli (gülümseme). Göz/ağız ayrı katmansa bonus, şart değil.
7. 1 hayvan arkadaş (tilki), aynı çizgide, 512x512.

## Yöntem önerisi (sen karar ver, ama hizalamayı garanti et)
- ImageGen ile önce stili oturt (temel çocuk). Sonra her eşyayı temel görsel üzerinde düzenleme (edit) ile üret ve
  katmanı temelden ayıkla (fark + alfa temizliği), ya da doğrudan şeffaf katman üret ve temel kanvasa hizala.
- Her katmanı temel üzerine bindirip kontrol et; kayma varsa düzelt (öteleme/ölçek) ya da yeniden üret.

## Çıktılar
- public/av/pilot/: katmanlar WebP (512x512'ye küçültülmüş, kaliteli) + PNG ana kopyalar gelistirme/pilot_avatar/kaynak/ altında.
  Adlar: base_skin1, base_skin2, hair_short_front, hair_long_front, hair_long_back, hat_cap(+ gerekiyorsa hat_cap_back / hair_under_cap_*),
  glasses_round, top_hoodie (+ top_hoodie_mask renklendirme için), pet_fox.
- public/av/pilot/manifest.json: katman listesi, çizim sırası (z), hangi katmanın hangisini gizlediği/değiştirdiği, renklendirilebilirlik.
- gelistirme/pilot_avatar/onizleme.png: tüm kombinasyonların kontakt kağıdı (2 ten × 2 saç × şapka var/yok × gözlük var/yok, hepsinde kapüşonlu, birinde farklı renk kapüşonlu, yanında tilki), ayrıca 96px küçük boy satırı (telefonda göründüğü boy).
- gelistirme/pilot_avatar/NOTLAR.md: ne yaptın, hangi promptlar, hizalama nasıl sağlandı, yeni eşya eklemek için tekrarlanabilir tarif, sorunlar.

---
## DÜZELTME (2. tur) — ZORUNLU
İlk denemede çocuk ve eşyaları Python/SVG ile kodla çizdin. Bu KABUL EDİLMEZ: kullanıcının şikâyeti tam olarak buydu.
Eski deneme gelistirme/pilot_avatar/eski_svg_deneme/ içinde, ona dönme.
- Görünen HER çizim (çocuk, saçlar, şapka, gözlük, kıyafet, hayvan) built-in `image_gen` ile üretilecek. SVG/PIL ile şekil çizmek yasak.
- Kod yalnız şunlar için: arka plan/alfa temizliği, hizalama (öteleme/ölçek kaydı, ör. çapraz korelasyon veya landmark), katman ayıklama
  (temel ile düzenlenmiş görsel farkı), ten ve kıyafet renklendirme (maskeyle ton kaydırma), WebP paketleme, kontakt kağıdı.
- Tilki zaten iyi: gelistirme/pilot_avatar/kaynak/pet_fox_imagegen.png. Çocuk bu tilkiyle AYNI çizgide olsun (referans olarak ver).
- Önerilen akış: (1) image_gen ile temel çocuk (kısa saçlı ya da saç bandı gibi minimal saç, düz nötr tişört), önden, sabit kadraj.
  (2) Her eşya için temel görseli edit hedefi verip "yalnız X ekle, başka hiçbir şeyi değiştirme" düzenlemesi; sonucu temele hizala,
  farkı alıp eşyanın katmanını çıkar (bölge sınırlı, gürültü temizlenmiş). Saç için de aynı yöntem; saçsız görünüm gerekiyorsa
  temel üzerinde ten rengiyle düzenleme yaptırıp onu "base" kabul et. (3) Her katmanı temel üzerine bindirip kontrol et.
- Ten 2: temeli maskeli renk kaydırmayla ya da image_gen düzenlemesiyle yap.
- Sonuçta kontakt kağıdında katmanlı birleşim, image_gen'in tek parça ürettiği görünümle aynı kalitede durmalı. Durmuyorsa NOTLAR.md'de dürüstçe yaz.
