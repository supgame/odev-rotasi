# Ödev Rotası

Birleştirilmiş 3-4. sınıf için hafta sonu tekrar ödevi. Tek sabit link (WhatsApp grubuna sabitlenir), cuma öğretmen seti yükler, çocuk adını seçip 4 haneli şifresiyle girer, çözer, yıldız kazanır, yıldızla avatarına eşya alır. Puanlar çocuklar arasında görünmez; avatarlar ve sınıfın ortak yıldız hedefi görünür.

- Öğrenci: `/`  · Öğretmen paneli: `/#/ogretmen`
- `npm run dev` → Supabase ayarı yoksa DEMO modu (veri yalnız o tarayıcıda).
- Canlı: `supabase/README.md` adımları, sonra `.env.example` → `.env`.
- Veri/RPC sözleşmesi: `docs/SOZLESME.md`. Soru yazma biçimi: `src/teacher/questionText.ts`.

Durum (26 Kas 2026): Supabase projesi kuruldu (0001 + 0002 migration, `seed_sinif.sql` ile DOGANLI sınıfı, yeni kayıt kapalı, tek öğretmen kullanıcısı). Öğrenci akışı canlı veritabanıyla denendi, test verisi silindi. Öğretmen paneli canlıda henüz denenmedi (öğretmen şifresi kullanıcıda). Yayın (GitHub Pages) yok.

Avatarlar (27 Kas 2026): çocuk Avataaars (Pablo Stanley, ticari dahil serbest; DiceBear ile tarayıcıda çizilir). Şapka, gözlük, saç, kıyafet aynı setten olduğu için kafaya kendiliğinden oturur. Yuvalar: ten, saç, saç rengi, şapka, gözlük, kıyafet, kıyafet rengi, yüz ifadesi, arkadaşı (89 hayvan, Microsoft Fluent Emoji Flat, MIT, `public/fx/LICENSE`), arka plan. Takılmayan yuvalar öğrenci id'sinden bedava bir varsayılan alır (herkes ilk gün farklı). Öğretmenin verdiği hayvan öğrencinin bedava arkadaşıdır. Tek kaynak `src/avatar/catalog.ts`; hepsini görmek için `#/galeri`. Soru çözerken avatar kartın üstünden bakar, şıkkın doğruluğunu belli etmez.
Yeni eşya: `catalog.ts`'e ekle (hayvansa `python3 scripts/fetch_fluent.py` görseli indirir) → `node scripts/shop-sql.ts > supabase/migrations/000X_....sql` ve SQL Editor'da çalıştır.
