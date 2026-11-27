# Ödev Rotası

Birleştirilmiş 3-4. sınıf için hafta sonu tekrar ödevi. Tek sabit link (WhatsApp grubuna sabitlenir), cuma öğretmen seti yükler, çocuk adını seçip 4 haneli şifresiyle girer, çözer, yıldız kazanır, yıldızla avatarına eşya alır. Puanlar çocuklar arasında görünmez; avatarlar ve sınıfın ortak yıldız hedefi görünür.

- Öğrenci: `/`  · Öğretmen paneli: `/#/ogretmen`
- `npm run dev` → Supabase ayarı yoksa DEMO modu (veri yalnız o tarayıcıda).
- Canlı: `supabase/README.md` adımları, sonra `.env.example` → `.env`.
- Veri/RPC sözleşmesi: `docs/SOZLESME.md`. Soru yazma biçimi: `src/teacher/questionText.ts`.

Durum (26 Kas 2026): Supabase projesi kuruldu (0001 + 0002 migration, `seed_sinif.sql` ile DOGANLI sınıfı, yeni kayıt kapalı, tek öğretmen kullanıcısı). Öğrenci akışı canlı veritabanıyla denendi, test verisi silindi. Öğretmen paneli canlıda henüz denenmedi (öğretmen şifresi kullanıcıda). Yayın (GitHub Pages) yok.

Avatarlar (27 Kas 2026, 2. sürüm): çocuk, saç, şapka, gözlük, kıyafet, ifade ve 89 hayvan arkadaş ImageGen (Codex) ile aynı çizgide üretildi; elle SVG yok. Hepsi tek 1024 kanvasta hizalı katmanlar, `public/av/` altında 512 px WebP, katalog `public/av/manifest.json`. Tarayıcı katmanları canvas'ta birleştirir; ten, saç rengi, kıyafet rengi ve şapka/gözlük renkleri gri ton + maske ile boyanır (formül `src/avatar/render.ts` ve `gelistirme/avatar_uretim/BRIEF.md`). Şapka takılınca saçın "şapka altı" katmanı kullanılır. İçerik: 5 ten, 14 saç (başörtüsü dahil), 15 saç rengi, 30 şapka, 16 gözlük, 14 kıyafet, 17 kıyafet rengi, 9 ifade, 89 hayvan, 20 arka plan (CSS). Fiyat düzeltmeleri `src/avatar/catalog.ts` PRICE'ta. Hepsini görmek için `#/galeri`.
Üretim tarifi, promptlar, ana PNG'ler: `gelistirme/avatar_uretim/` (NOTLAR.md, paketle.py). Yeni eşya: aynı tarifle Codex'e ürettir → manifest'e ekle → `node scripts/shop-sql.ts > supabase/migrations/000X_....sql` ve SQL Editor'da çalıştır.
Canlı veritabanı: 0006 (yeni katalog) ve 0007 (anon/authenticated fonksiyon yetkileri; 27 Kas'ta canlıda `permission denied for function roster` çıkmıştı) SQL Editor'da çalıştırıldı, öğrenci sayfası canlıda yeniden açıldı. **0008 (yüz şekli, kulak, göz rengi, yanak, poz yuvaları) henüz canlıda değil:** `supabase/migrations/0008_yuz_cesitleri_poz.sql` SQL Editor'da çalıştırılmalı.
