# Ödev Rotası

Birleştirilmiş 3-4. sınıf için hafta sonu tekrar ödevi. Tek sabit link (WhatsApp grubuna sabitlenir), cuma öğretmen seti yükler, çocuk adını seçip 4 haneli şifresiyle girer, çözer, yıldız kazanır, yıldızla avatarına eşya alır. Puanlar çocuklar arasında görünmez; avatarlar ve sınıfın ortak yıldız hedefi görünür.

- Öğrenci: `/`  · Öğretmen paneli: `/#/ogretmen`
- `npm run dev` → Supabase ayarı yoksa DEMO modu (veri yalnız o tarayıcıda).
- Canlı: `supabase/README.md` adımları, sonra `.env.example` → `.env`.
- Veri/RPC sözleşmesi: `docs/SOZLESME.md`. Soru yazma biçimi: `src/teacher/questionText.ts`.

Durum (26 Kas 2026): Supabase projesi kuruldu (0001 + 0002 migration, `seed_sinif.sql` ile DOGANLI sınıfı, yeni kayıt kapalı, tek öğretmen kullanıcısı). Öğrenci akışı canlı veritabanıyla denendi, test verisi silindi. Öğretmen paneli canlıda henüz denenmedi (öğretmen şifresi kullanıcıda). Yayın (GitHub Pages) yok.
