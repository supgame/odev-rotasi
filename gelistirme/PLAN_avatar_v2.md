# Avatar v2 planı (28 Kas 2026 → 5 Ara 2026)

Karar: **hibrit poz şablonu** (Opus ve GPT Astra bağımsız sorulunca ikisi de bunu seçti; ayrıntı `mimari_danisma/`).

- Kol ve gövde artık ayrı parça değil: her etkileşim pozu omuzdan parmak ucuna TEK çizim. Hayvanın önüne geçecek parmak/önkol aynı çizimden maskeyle ayrılır (yapıştırma değil, örtüşme). "Omuzdan kol çıkıyor" sorunu böyle biter.
- 4 etkileşim pozu: **avuç açık** (civciv, kuş, hamster), **kucak** (kedi, tavşan, capybara gibi orta boy), **el uzanmış** (köpek pati verir, fil hortum uzatır, robot çak yapar), **omuz** (papağan, baykuş). Mevcut serbest duruş portre ve kartlarda kalır.
- Her hayvanın **kendine özgü bir birincil etkileşimi** + dokununca kendine özgü tepkisi olur (89/89 hedef). Her etkileşim çizimi onaylı çocuk portresi + poz şablonu referans verilerek çizilir; böylece şimdiki karışık stil (gerçekçi civciv, çizgi film köpek) de biter.
- Kıyafetler her poza bir kez uyarlanır (14 × 4 = 56), renkler maskeyle.
- **Cinsiyet**: kız/erkek. Gövde çizimini ikiye katlamaz; başlangıç görünümünü (saç, kıyafet, kirpik/kaş) ve dükkânda "sana önerilenler" sırasını belirler. Eşya kilitlemez. Seçim değişince satın alınanlar korunur; eski kayıtta boşsa bugünkü görünüm aynen kalır.
- Satın alınmış hiçbir poz/eşya kaybolmaz (ör. ücretli "Başımda").

Toplam onaylı çizim tahmini: ~160-170 (4 poz + 56 kıyafet + 89 tür + 10-20 özel). Bir haftada gerçekçi hedef: cinsiyet + 4 poz + zor kıyafetler + **10-12 tür tam bitmiş** pilot. Kalan türler sonraki haftalarda 10-15'lik partilerle (ölçülen hıza göre).

## Gün gün
| Gün | İş | Kim | Bitti sayılır |
|---|---|---|---|
| 1 | Cinsiyet: DB alanı, ilk girişte seçim, öğretmen panelinde görme/değiştirme, iki başlangıç görünümü, eski kayıt uyumu | Claude | Seçim değişince eşyalar korunuyor, eski öğrenci aynı görünüyor |
| 2 | Pilot: civciv–avuç ve tavşan–kucak, tişört + kapüşonlu ile | Astra | Telefonda hareketsizken bile "tutuyor" okunuyor; omuz/bilek/öndeki parmak doğru. Kötüyse burada durup yöntemi değiştiriyoruz |
| 3 | Poz manifesti + canvas katman sırası; köpek (el uzanmış), papağan (omuz), fil (büyük hayvan); **kedi ve köpeğin eski temas/kucak sahneleri v2 şablonuna** | Astra + Claude kontrol | 5 hayvan aynı kodla çalışıyor, tepkide pati kaymıyor |
| 4 | 4 pozu mont, zırh, başörtüsü, afro ile sına; 89 türün her birine birincil etkileşim ata (liste); **Elimde için iki el önde poz şablonu + 5 eşyanın aynı stilde yeniden çizimi** | Astra | Zor kıyafetler bozulmuyor; 89 satırlık etkileşim listesi senin onayına hazır |
| 5 | İlk tür partisi (öncelik: çocukların en sevdikleri), dükkân geçişleri, Elimde eşyalarıyla uyum (**eşya + arkadaş birlikteyken arkadaş olaya katılsın**); **dükkân kartı ve sahne aynı kanonik hayvan çiziminden** | Astra | Her biten türde dokunma tepkisi var |
| 6 | İkinci parti + gerçek telefonda açılış/bellek ölçümü | Astra + Claude | Stili sapan/kötü çizimler yeniden üretim listesinde |
| 7 | Uçtan uca test, canlıya geçiş, kalan takvim | Claude | Pilot canlıda; kalan türlerin takvimi ölçülen hıza göre |

## Durum (28 Kas akşam)
- 1. gün bitti, canlıda (118353b): cinsiyet, ilk girişte seçim, öğretmen paneli, kirpiksiz 2 göz.
- 2. gün bitti, canlıda (58943f1): civciv avuçta, tavşan kucakta; yalnız tişört ve kapüşonluda. Dokunma tepkisi ve gerçek telefon görünümü denenmedi. ~160 çizimin 6'sı hazır.

## Kullanıcının 28 Kas akşamı eklediği hedefler (ekran: `kullanici_geri_bildirim_28kas/8_*.png`, `9_*.png`)
1. **Elimde eşyaları hâlâ garip.** Top: eller gövdeden ayrı yapıştırma gibi, top gerçekçi/kirli dokulu, çocukla aynı çizgide değil. Elimde eşyaları da poz şablonuna taşınacak (iki el önde tek çizim, eşya çocukla aynı stilde yeniden çizilir; kitap, araba, papatya, uçurtma dahil). Eşya varken yanındaki arkadaş boşta duruyor (civciv topun yanında ilgisiz): eşya + arkadaş birlikteyken arkadaş en azından olaya bakmalı/tepki vermeli ya da sahne buna göre kurulmalı. → 4. ve 5. güne eklendi.
2. **Kedi (ve eski temas sahneleri) hâlâ eski usul:** kol omuzdan yapıştırılmış, kedi gerçekçi stilde. Kedi ve köpeğin Yanımda/Kucağımda sahneleri v2 şablonuyla yeniden yapılacak (eski Faz 8 temas çizimleri emekliye). → 3. güne eklendi.
3. **Hayvanlar dükkândakiyle aynı değil:** dükkân kartındaki hayvan görseli ile sahnedeki (poz) çizimi farklı stil/görünüm. Her tür için tek kanonik çizim: dükkân kartı, yanımda duruşu ve poz sahneleri aynı karakterden türetilecek. 89 türün stil birliği bu kapsamda. → 5.-6. gün partilerinin kabul ölçüsü.

4. **Kombinasyon hataları (ekran `10_zirh_bere_tavsan.png`):** zırh + bere + tavşan kucak: kollar zırhın üstüne yapıştırılmış lacivert kumaş yamaları, zırh kesik, bere altından kısa saç iki yana kanat gibi taşıyor. Tek tek yamamak yerine **önce sistematik görsel denetim**: her kıyafet × poz × saç × şapka birleşimini otomatik çizen ızgara, hataları listele, öncelik sırala. Kural: düzgün çizimi olmayan birleşim gösterilmez (ör. v2 çizimi olmayan kıyafette Kucağımda yerine Yanımda'ya düş). → 3. günün başına, diğer işlerden önce.

Kabul (ek): telefonda Elimde eşyası tutarken kol tek parça, eşya çocukla aynı çizgide; kedi/köpek sahnelerinde omuzdan kol çıkmıyor; dükkân kartındaki hayvan ile avatarın yanındaki hayvan aynı karakter.

Her gün sonunda: Claude tarayıcıda bakar, sana 2-3 ekran görüntüsü atar, onaylarsan canlıya alır.
