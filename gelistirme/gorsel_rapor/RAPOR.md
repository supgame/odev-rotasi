# Ödev Rotası — görsel değerlendirme raporu

Tarih: 27 Kas 2026. Bakılan sürüm: `aa4b47f` (oyun gibi tasarım). DEMO modu, port 5198, veri yalnız tarayıcıda.
Ekran görüntüleri: `gelistirme/gorsel_rapor/ekranlar/` (75 dosya). Tablolarda yalnız dosya adı yazıyor.
Telefon: 375×812. Masaüstü: 1280×800 (galeri 780 px genişlikte tarandı, görüntü tam çözünürlük çıksın diye).

## 1. Özet

Site: **7/10**. Karakterler: **6/10**.
Açılış ekranı ilk bakışta "oyun" diyor; gökyüzü, kalın çizgi ve 3D butonlar 9 yaşındaki bir çocuğa okul formu gibi gelmez.
En güçlü 3 şey: soru ekranında kenardan bakan avatar, sonuç ekranındaki yıldız + konfeti anı, hayvan arkadaşların tek elden çıkmış gibi tutarlı çizimi.
En kötü 3 şey: ad seçme ekranı çocuğun aldığı eşyaları göstermiyor; geniş saç/başörtüsü avatarda yandan ve tepeden düz kesiliyor; dükkânda birçok eşya birbirinden ayırt edilmiyor (kıyafetler, saç renkleri, ten, yüz şekli, kulak, yanak).
Bir de satın alma tek dokunuşta, onaysız oluyor; çocuk yanlışlıkla yıldızını harcayabilir.

## 2. Site bulguları

| Ekran | Sorun | Önem | Ekran görüntüsü | Önerilen düzeltme |
|---|---|---|---|---|
| Ad seçimi (`/`) | Kartlarda çocuğun taktığı eşyalar görünmüyor. Ali'ye kırmızı kep, Elif'e sihirbaz şapkası taktım; ana sayfadaki "Takım arkadaşların" listesinde çıkıyor, ad seçme kartlarında çıkmıyor. Çocuk kendini tanımayabilir, emek boşa gider. | Kritik | `masaustu_giris_ad_secimi_alinan_esyalar_gorunmuyor.jpg`, `telefon_takim_kucuk_avatar_kombinasyonlar.png` | `StudentApp.tsx` satır 125: `<Avatar ... equipped={s.equipped}>` ver. Bunun için `roster()` (mock + Supabase RPC) `equipped` alanını da döndürmeli. |
| Ad seçimi | İlk açılışta avatar halkaları boş, yalnız hayvan görünüyor; katmanlar sonra geliyor. Ucuz telefonda ve yavaş internette bu süre uzar. | Orta | `telefon_giris_avatarlar_bos_ilk_yukleme.jpg` | Katmanlar gelene kadar halkada ten rengi siluet ya da hafif "yükleniyor" dokusu göster. Ad seçim ekranı için önceden birleştirilmiş küçük bir PNG/WebP önbelleği düşün. |
| Ad seçimi | Varsayılan görünüm adla uyuşmuyor: "Ali" tepede topuzlu, "Yusuf" uzun kızıl saçlı, "Zeynep" kısa erkek kesimi. Çocuklar ilk gün buna gülebilir ya da alınabilir. | Orta | `telefon_giris_ad_secimi.jpg` | `Avatar.tsx` DEF: ilk gün saç havuzunu nötr kesimlerle (kısa kıvırcık, omuz boyu küt, yandan ayrık) sınırla ya da öğretmen öğrenci eklerken "saç" seçsin. |
| Ad seçimi (74 px) | Küçük kartta hayvan yanağın/çenenin üstüne biniyor (Ali'de aslan, Mert'te köpek). | Kozmetik | `telefon_giris_kucuk_avatar_hayvan_yuzu_kapatiyor.png` | Küçük boyda (`size < 90`) hayvanı ya gizle ya da halkanın dışına, sağ alta rozet gibi koy. |
| Ad seçimi | Uzun isim kesiliyor: "Muhammed Abdurrahma…" kartın dışına taşıyor. | Orta | `masaustu_giris_uzun_isim_kesik.png` | `.player-card` ad alanına `overflow-wrap: anywhere; font-size: clamp(.8rem, 3.2vw, 1rem)` ya da iki satıra izin verip kart yüksekliğini sabitle. |
| Şifre | Hata yazısı ("İki şifre aynı değil") küçük ve kutularla tuş takımı arasına sıkışmış; kart bir anlığına kayıyor. | Kozmetik | `telefon_sifre_hata_kucuk_kirmizi.jpg` | `.pin-err` için 1rem, açık kırmızı zeminli rozet; kutulara `shake` zaten var, yazıyı da kutunun üstüne al. |
| Şifre (masaüstü) | 1280×800'de tuş takımının alt sırası ekranın altında kalıyor, sayfa kaydırmak gerekiyor. | Kozmetik | `masaustu_sifre_tus_takimi_alt_kesik.jpg` | Masaüstünde avatarı küçült ya da tuşları 56 px yüksekliğe indir. |
| Ana sayfa | Konuşma balonu açılırken dönerek büyüyor; o anda yazı minicik ve yamuk (birkaç kez yakaladım). Sonra düzgün oturuyor. | Kozmetik | `telefon_ana_sayfa_ust.jpg` | `popin` animasyonunda dönmeyi -60°'den -8°'ye indir, süreyi kısa tut. |
| Ana sayfa | Sınıf sandığı hedefi aşınca (613/300) çubuk dolu ama sandık kapalı kalıyor, kutlama yok. | Orta | `telefon_sandik_hedef_asildi_acilmiyor.jpg` | Hedef dolunca açık sandık ikonu + "Sandık açıldı!" şeridi; 0 iken de çubukta görünen sarı kırıntıyı kaldır (`min-width: 0`). |
| Ana sayfa (masaüstü) | Tek dar sütun (~360 px), iki yan boş gökyüzü. Bozuk değil ama ekran boşa gidiyor. | Kozmetik | `masaustu_ana_sayfa_dar_sutun.jpg` | 900 px üstünde avatar + görev solda, rota + sandık + takım sağda iki sütun. Acil değil; çocuklar telefondan giriyor. |
| Soru | Seçilen şıkta beyaz ✓ işareti var. Cevaplar sonda kontrol edildiği için çocuk bunu "doğru bildim" diye okuyabilir. | Orta | `telefon_soru_secim_tik_isareti_dogru_sanilabilir.jpg` | ✓ yerine nötr bir işaret (dolu daire ya da parmak) kullan; mor zemin seçimi zaten belli ediyor. |
| Soru | "İleri/Bitir" butonu soru tipine göre yer değiştiriyor: çoktan seçmelide en altta, doğru/yanlışta ortada. Parmak her seferinde yeniden arıyor. | Orta | `telefon_dogru_yanlis_sorusu_ileri_butonu_yer_degistiriyor.jpg` | `.q-nav` telefonda `position: sticky; bottom: 12px` ya da soru kartına sabit `min-height` ver. |
| Soru | "1 soru boş kaldı. Önce onları cevapla." Tekil sayıda çoğul ek. Uyarı da Bitir'i aşağı itiyor. | Kozmetik | `telefon_bos_soru_uyarisi.jpg` | Metni sayıya göre yaz ("onu" / "onları"). Uyarıyı modal ya da üstte toast olarak göster. |
| Sonuç | Üst sağdaki yıldız sayacı daha animasyon başlamadan 13'ü gösteriyor; ortadaki sayaç +0'dan sayıyor. Sürpriz bozuluyor. | Kozmetik | `telefon_sonuc_ust_sayac_once_13_gosteriyor.jpg` | Üst sayacı ortadaki sayaç bitince güncelle (aynı `bump` animasyonuyla). |
| Sonuç | Konfeti metnin ve butonların üstünden geçiyor; birkaç saniye "yıldız kazandın" okunmuyor. Kısa olduğu için sorun değil, ama butonlar o sırada bulanık görünüyor. | Kozmetik | `telefon_sonuc_konfeti.jpg` | Konfetiyi butonların arkasına al (`z-index`) ya da 1,5 sn'de bitir. |
| Sonuç / cevaplar | Yanlış soruda "Doğrusu: 200" düz yazı; doğru cevap yeşil vurgulanmıyor. | Kozmetik | `telefon_sonuc_cevaplar.jpg` | Doğru cevabı yeşil rozet içinde göster. |
| Dükkân (telefon) | Reyon satırları yatay kayıyor ama ipucu yok. "Görünüş" satırında Yüz şekli, Kulak, Göz rengi, Yanak ekranın tamamen dışında; "Ten" tam sığdığı için devamı olduğu anlaşılmıyor. "Kıyafet re…" de kesik. | Kritik | `telefon_dukkan_ust_reyon_satirlari_gizli_kategori.jpg` | `.cat-row` telefonda `flex-wrap: wrap`'a dön (satır sayısı artar ama hepsi görünür) ya da sağ kenara solma gölgesi + "›" ekle. |
| Dükkân | Reyon düğmeleri 33 px yüksek; 44 px altında. | Orta | `telefon_dukkan_ust_reyon_satirlari_gizli_kategori.jpg` | `.cat-row button` için `min-height: 44px; padding: .45rem .8rem`. |
| Dükkân | Satın alma tek dokunuşta, onaysız. Puantiye'ye bir kez dokundum, 13 yıldızın 10'u gitti. | Kritik | `telefon_dukkan_tek_dokunusla_satin_alma.jpg` | Fiyat düğmesine ilk dokunuşta "10 ⭐ ile al?" onayı (aynı düğme "Evet, al!" olur) ya da küçük modal. `Shop.tsx` satır 129. |
| Dükkân | Satın alma anı sönük: yalnız aynanın yanında küçük yeşil "Puantiye artık senin!" yazısı. Konfeti, ses, avatar zıplaması yok. | Orta | `telefon_dukkan_satin_alma_geri_bildirimi_zayif.jpg` | Satın almada avatar `kidjump` + kalp/yıldız patlaması + 1 sn'lik büyük rozet. Takmada şimdiki hafif hâli yeter. |
| Dükkân | Telefonda yapışkan ayna 84 px; taç + gözlük + kucak pozunda neyin değiştiği seçilmiyor. | Orta | `telefon_dukkan_ayna_cok_esya_kucuk.png` | Aynaya dokununca büyük önizleme (modal, 240 px) aç. |
| Dükkân | Arka plan önizlemesi yalnız avatarın arkasında ince bir halka; kartın yeşil zemini öne çıkıyor. 10-70 yıldızlık eşyanın ne olduğu anlaşılmıyor. | Orta | `telefon_dukkan_arka_plan_onizleme_cok_kucuk.png` | Arka plan reyonunda kart zeminini (`.item-thumb`) arka planın kendisiyle doldur, avatarı küçült. |
| Dükkân | Nadirlik açıklaması (Bedava/Sıradan/Nadir/Destansı/Efsanevi) masaüstünde var, telefonda yok. | Kozmetik | `masaustu_dukkan.jpg` | `.legend`'i telefonda da göster (tek satır, kaydırmalı). |
| Dükkân | "TAKILI" ve "SIRADAN" etiketleri kartın üst kenarında yan yana sıkışıyor. | Kozmetik | `telefon_dukkan_tek_dokunusla_satin_alma.jpg` | "TAKILI" etiketini sol alt köşeye al. |
| Öğretmen (telefon) | Ödev tablosu yatay kayıyor; başlık kelime kelime alt alta, tarih saniyeyle (17:31:48). | Orta | `telefon_ogretmen_odevler_tablo_sikisik.jpg` | Telefonda tablo yerine kart listesi; tarihi "27 Kas 17:31" biçiminde yaz. |
| Öğretmen | Öğrenciler tablosunda "henüz yok" geniş harf aralıklı (`.mono`) italik ve iki satıra kırılıyor. | Kozmetik | `telefon_ogretmen_ogrenciler_henuz_yok_kirik.jpg` | O hücrede `.mono` kullanma; "—" ya da "yok" yaz. |
| Öğretmen | Hayvan seçici emojili (🦊 Tilki); yanında ImageGen tilkisi duruyor. Eski emoji dilinden kalıntı. Galeride de fiyatlar ⭐ emojisiyle. | Kozmetik | `telefon_ogretmen_ogrenci_ekle_emoji_secici.jpg` | Seçicide emoji yerine adları bırak, önizleme resmi zaten var. Galeride `Icon` yıldızını kullan. |
| Öğretmen | "← Öğrenci sayfası" düz mavi altı çizili bağlantı; diğer her şey butonlu. | Kozmetik | `telefon_ogretmen_giris.jpg` | `btn ghost small` yap. |
| Öğretmen | Düzenle ekranında tarih alanı "11/27/2026, 05:31 PM" (tarayıcı diline göre). Türkçe telefonda büyük ihtimalle düzgün çıkar, denemedim. | Kozmetik | `masaustu_ogretmen_odev_duzenle_tarih_formati.jpg` | Gerekirse tarih/saat için ayrı `date` + `time` alanı ya da yanında "27 Kasım Cuma 17:31" önizlemesi. |
| Genel | Koyu tema yok (aranmadı da). `prefers-reduced-motion` yalnız avatarın bakma hareketini kapatıyor; konfeti, dönen güneş ve süzülen bulutlar devam ediyor. | Kozmetik | — | Reduced-motion altında `.confetti`, `spin`, `drift` animasyonlarını da kapat. |

Ekran bazında iyi olanlar: soru ekranı (büyük harfli renkli şıklar, kenardan bakan avatar), "Gönderelim mi?" modalı, sonuçta 3 yıldız düzeni, cevap inceleme kartları, öğretmen paneli masaüstünde. Öğretmen paneli çocuk tarafıyla aynı aileden görünüyor ve "oyuncak" kaçmıyor; yalnız telefonda tablolar sıkışık.

## 3. Karakter bulguları

| Eşya / ekran | Sorun | Önem | Ekran görüntüsü | Önerilen düzeltme |
|---|---|---|---|---|
| `hair_afro` | Avatar halkasında saçın tepesi dümdüz kesiliyor (galeri "Canlı hâli" shoulder, "Tilki ile", "Baykuş ile", "Maymun ile"). Eşya önizlemesinde kesilmiyor, yani sorun kırpmada. | Kritik | `galeri_afro_tepesi_duz_kesik_ve_hucre_tasmasi.png`, `galeri_canli_ve_baslangic.jpg` | `Avatar.tsx` `clipStyle`: `UP = 0.24` kafa payı afro için az. `UP`'u 0.34'e çıkar ya da `av-clip`'in üst sınırını kaldır (yalnız alt yarım daire maskelensin). |
| `hair_headscarf` | Büyük avatarda (150 px) başörtüsünün sağ kenarı dikey çizgiyle kesiliyor. | Kritik | `yakin_basortusu_sag_kenar_duz_kesilmis.png`, `telefon_ana_sayfa_gorev_tamam_basortusu_yandan_kesik.jpg` | Aynı kırpma sorunu, yan taraf. Maske genişliğini `size`'dan biraz geniş tut (`left/right: -8%`) ya da katman kanvasını yatayda biraz uzaklaştır. Başörtülü çocuk için bu çok görünür, ilk düzeltilecek iş. |
| `pose_hug` | Kucak pozunda eller ve hayvan ağzı, çoğu zaman çeneyi kapatıyor. İfade (`face_surprised`, `face_bigsmile`) görünmüyor. Kıyafet de kayboluyor (`clothes_superhero`, `clothes_astronaut`). | Orta | `kombin_platin_orgu_kucak_zurafa_agiz_kapali.png`, `telefon_cok_esya_tac_yildiz_gozluk_kucak_ejderha_agzi_kapatiyor.jpg`, `kombin_cok_esya_yuz_kayboluyor.png` | Kucak katmanını %10-12 aşağı al; hayvan kafası çene çizgisinin altında kalsın. Büyük hayvanlarda (zürafa, ejderha) kucak boyunu küçült. |
| `pose_head` | Hayvan kafanın üstünde, saçtan ayrık havada duruyor; boyu çok küçük (kirpi, tilki). Şapka varken şapkaya oturuyor (salyangoz), şapka yokken boşlukta. | Orta | `galeri_poz_head_hayvan_havada_kopuk.png`, `galeri_pozlar_hayvan_cok_kucuk.png`, `kombin_kovboy_kalp_goz_salyangoz_basta.png` | Şapkasızken hayvanı saç tepesine indir (saç türüne göre `dy`). Boyu %30 büyüt. 10 yıldızlık eşya, alınca görünür olmalı. |
| `pose_peek` | Fil gibi büyük hayvan omuz arkasında halkayla kesik. | Kozmetik | `kombin_kulaklikli_bere_kepce_kulak_gizli.png` | Peek pozunda hayvanı halkanın içinde tut ya da kırpmadan muaf et. |
| `clothes_*` önizlemesi | Kıyafet kartında saç (örgüler) göğsün önüne düşüyor, kıyafet görünmüyor. Varsayılan renk siyah olduğu için `clothes_tshirt`, `clothes_hoodie`, `clothes_tracksuit`, `clothes_winter_coat` aynı görünüyor. | Kritik | `galeri_kiyafet_onizleme_orgu_kapatiyor_hepsi_siyah.png`, `galeri_gozluk_kiyafet.jpg` | `ItemPreview` kıyafet için saçı kısa kesime çevir ve rengi `ccolor_blue` gibi açık bir renkle göster; ya da kıyafeti tek başına (avatarsız) çiz. |
| `hcolor_black` / `hcolor_dark_brown` | Siyah saç koyu kahve gibi; ikisi neredeyse aynı. | Orta | `galeri_siyah_ile_koyu_kahve_ayni.png` | Siyahın `color` değerini daha koyu ve daha az doygun yap (ör. `#1f1a1c`). |
| `hcolor_blonde` / `hcolor_golden_blonde` | Ayırt edilmiyor. | Orta | `galeri_sari_ile_altin_sarisi_ayni.png` | Altın sarısını turuncuya kaydır (ör. `#e0a030`) ya da birini kaldır. |
| `hcolor_platinum` (örgüde) | Kız çocuğunda yaşlı/gri saç gibi okunuyor. | Kozmetik | `kombin_platin_orgu_kucak_zurafa_agiz_kapali.png` | Platine hafif sarı ton ver (`#f1e6c8`). `hcolor_silver` zaten gri. |
| `skin_light` / `skin_wheat` | Açık ve Buğday çok yakın. 5 tenden ikisi neredeyse aynı. | Orta | `galeri_ten_acik_bugday_cok_yakin.png` | Buğdayı biraz daha sıcak/koyu yap. 5 ten yeterli ama aralar eşit olmalı. |
| `skin_dark` | Koyu tende kaş, burun ve ağız çizgileri kayboluyor; siyah saçla yüz sınırı seçilmiyor. | Orta | `kombin_koyu_ten_afro_kep_beyaz_kapusonlu.png`, `galeri_ifade_ten_yuz_sekli.jpg` | Koyu ten için iç çizgileri biraz açık kahve yap ya da `ref` kontrastını artır. Kırpma ve renk düzeltmesi bu çocuklar için ayrıca kontrol edilsin. |
| `fshape_*` (6 yüz şekli) | 84 px önizlemede Oval, Tombul, Uzun, Köşeli, Sivri çene, Geniş birbirinden ayırt edilmiyor. | Orta | `galeri_yuz_sekli_farklar_secilmiyor.png` | Farkları büyüt ya da reyonu 3 belirgin şekle indir. Önizlemede yüzü yakından göster (kırpma). |
| `ears_small` / `ears_medium` / `ears_big` | Önizlemede fark görünmüyor; şapkalı/kulaklıklı berede tamamen gizli. | Kozmetik | `galeri_kulak_farki_gorunmuyor.png`, `kombin_kulaklikli_bere_kepce_kulak_gizli.png` | Kepçeyi belirgin büyüt ya da reyonu kaldır. |
| `cheek_*` | Esmer tende Pembe yanak, Çilli, Çil ve allık neredeyse görünmüyor. | Kozmetik | `galeri_yanak_farki_gorunmuyor.png` | Allık opaklığını tene göre artır; çilleri bir ton koyulaştır. |
| `face_surprised`, `face_hearts`, `face_stars` | Kendi gözleriyle geliyor; seçilen göz rengini yok sayıyor (Şaşkın kahverengi göz, diğerleri gri-mavi). | Kozmetik | `galeri_ifade_saskin_goz_rengi_farkli.png` | Bu ifadelerde iris katmanını da göz rengiyle boya ya da göz rengi reyonunda "bazı ifadelerde değişmez" notu. |
| `ccolor_gold` (30 ⭐) | "Altın" düz sarı; `ccolor_lemon` (10 ⭐) ile çok yakın. Pahalı ama farkı yok. | Orta | `galeri_altin_renk_sari_ile_ayni.png` | Altına parlaklık şeridi ya da metalik degrade ver. Yoksa fiyatı 15'e indir. |
| `ccolor_navy` / `ccolor_smoke` / `ccolor_black` | Lacivert, Duman ve Siyah çok yakın. | Kozmetik | `galeri_kiyafet_rengi.jpg` | Dumanı açık griye kaydır. |
| `glasses_round_gold`, `glasses_star_gold` | Altın gözlük açık tende ve sarı saçta zor görünüyor. | Kozmetik | `galeri_altin_gozluk_kontrast_dusuk.png` | Çerçeveye koyu kontur ekle (diğer gözlüklerde var). |
| `hat_cowboy_*`, `hat_pirate` | Siper gözleri ve kaşları karartıyor; küçük boyda yüz gölgede kalıyor. | Kozmetik | `galeri_kovboy_siperlik_gozu_karartiyor.png` | Şapkayı %4-5 yukarı al ya da sipere düşen gölgeyi hafiflet. |
| `hat_crown` + `glasses_*` + `pose_hug` | Çok eşya takılınca yüzden geriye yalnız burun kalıyor. Taç kafaya göre çok büyük. | Orta | `kombin_cok_esya_yuz_kayboluyor.png`, `telefon_cok_esya_tac_yildiz_gozluk_kucak_ejderha_agzi_kapatiyor.jpg` | Tacı %15 küçült. Kucak pozundaki düzeltme bunu da çözer. |
| `hat_bear_*` | Ad "ayı kulaklı taç" ama görünüşü bere/kulaklı bant. | Kozmetik | `galeri_sapkalar.jpg` | Adı "ayı kulaklı bere" yap. |
| `hair_ponytail` | Önden bakınca `hair_short` ile neredeyse aynı; at kuyruğu çok az görünüyor. | Kozmetik | `galeri_sac_ve_sac_rengi.jpg` | Kuyruğu omuz hizasında yana taşır biçimde çiz. |
| `bg_*` | Avatar halkayı doldurduğu için arka planlar ince bir kenar olarak kalıyor. `bg_gold` (70 ⭐), `bg_rainbow` (55 ⭐) parasının karşılığını vermiyor. | Orta | `galeri_pahali_arka_plan_altin_gorunmuyor.png`, `galeri_arka_planlar.jpg` | Arka planı halkanın dışına da taşı (ana sayfadaki ada/platform arkasına) ya da avatarı halkada %85'e küçült. |
| Galeri "Canlı hâli" | 130 px avatarlar hücreden taşıp başlığa ve yan hücreye biniyor. | Kozmetik | `galeri_canli_ve_baslangic.jpg` | `.g-cell` yüksekliğini canlı satırda büyüt. (Yalnız öğretmen görüyor.) |
| Hayvan arkadaşlar | 89 hayvan aynı stilde; çizgi, gölge ve doygunluk tutarlı. Kart içindeki boyları biraz farklı: Zebra, Kurt, At küçük; Kirpi, Balon balığı kartı dolduruyor. | Kozmetik | `galeri_hayvanlar_1.jpg`, `galeri_hayvanlar_2.jpg`, `galeri_hayvanlar_3_ve_poz.jpg` | Önizlemede hayvanları kutu yüksekliğine göre ölçekle. |

### Stilden kopan eşyalar

Gördüğüm kadarıyla çizgi kalınlığı ve ışık yönü olarak tamamen başka elden çıkmış bir katman yok. Hayvanlar, şapkalar ve gözlükler aynı ailede. Göze batanlar stil değil, görünürlük ve ölçek:
- `hat_crown`: diğer şapkalara göre büyük ve daha parlak/doygun.
- `pet_robot`, `pet_alien`, `pet_invader`, `pet_sun`, `pet_moon`: biraz daha "sticker" gibi ama sırıtmıyor.
- `face_surprised`, `face_hearts`, `face_stars`: göz rengini dinlemedikleri için seçili göz rengiyle uyumsuz duruyor.
- `glasses_*_gold`: kontur zayıf, diğer gözlüklerden silik.

### Çeşitlilik ve çekicilik (kısa)

Beş ten ve 14 saç, sınıftaki çocukların kendini bulmasına yetiyor. Başörtüsü özenli çizilmiş ve şapka/gözlükle düzgün oturuyor (`kombin_basortusu_pembe_sihirbaz_gozluk.png`). Tek sorun kırpma. Kız/erkek seçenekler eşit özende. Garip ya da karikatür duran seçenek görmedim.
Çocuğun "almaya değer" diyeceği eşyalar: sihirbaz şapkaları, taç, kedi kulaklı bere, dinozor kapüşonlu, astronot, şövalye, ejderha/unicorn/anka. Sönük kalanlar: kıyafet renkleri (Altın), arka planlar, yüz şekli, kulak, yanak, 'Başımda' pozu.
İfadeler büyük boyda ayırt ediliyor (Kalp gözler, Yıldız gözler, Göz kırpma belirgin). Dokununca zıplama + kalp çıkması, göz kırpma ve nefes doğal; rahatsız edici bir şey görmedim.

## 4. Tasarım yönü kararı

**"Oyun gibi" yön kalsın.** Kâğıt + mürekkep sadeliğine dönmeye gerek yok.
Gerekçe: gökyüzü, kalın çizgiler ve 3D butonlar ImageGen avatarların çizgi film diliyle uyuşuyor; ekranlar arası tutarlılık iyi (köşe, çizgi, gölge aynı). Telefonda okunabilirlik genel olarak yerinde, Türkçe karakterler (ğ, ş, İ, ı) Baloo 2 ve Nunito'da düzgün.
Dağınıklık riski düşük. Sorunlar yöndeki değil, ayrıntıdaki işler: kırpma, dükkân önizlemeleri, satın alma onayı. Eski tasarımdan kalan izler küçük: öğretmen sayfasındaki emoji seçici, galerideki ⭐ emojisi, düz mavi bağlantı.

## 5. Öncelik sırası (ilk 10 iş)

1. Avatar kırpmasını düzelt: afro tepesi ve başörtüsü yanı kesilmesin (`clipStyle`, `UP`). — küçük/orta
2. Ad seçme kartlarında takılı eşyaları göster (`roster` + `equipped`). — orta
3. Satın almaya tek adımlı onay ekle. — küçük
4. Dükkân reyonlarını telefonda sar ya da kaydırma ipucu ver; düğmeleri 44 px yap. — küçük
5. Kucak pozunda eller/hayvanı aşağı al, ağız görünsün. — orta (katman ofseti)
6. Kıyafet önizlemesi: saçı kısa, rengi açık göster; siyah kıyafetler ayırt edilsin. — küçük
7. Satın alma anına kutlama (zıplama + yıldız patlaması). — küçük
8. Benzer renkleri ayır: Siyah/Koyu kahve, Sarı/Altın sarısı, Açık/Buğday ten, Altın kıyafet. — küçük (manifest renk değerleri)
9. Soru ekranında İleri/Bitir butonunu sabit yere al; seçimde ✓ yerine nötr işaret. — küçük
10. Arka plan ve 'Başımda' pozunu görünür yap (arka planı halkanın dışına taşı, hayvanı saça indir). — orta

Sonraki tur: yüz şekli/kulak/yanak reyonlarını sadeleştir, sandık "açıldı" durumu, öğretmen tablolarını telefonda karta çevir.

## 6. Denenmeyenler

- Koyu tema: sitede yok, bakılmadı.
- Gerçek ucuz Android cihaz ve 360 px genişlik denenmedi; yalnız 375×812 emülasyonu. Gerçek klavye açılması denenmedi; şifre ekranı kendi tuş takımını kullandığı için telefon klavyesi açılmıyor.
- Masaüstünde fiziksel klavyeyle şifre yazmayı denedim, ekranda değişiklik görmedim; ama sonuçtan emin değilim, bulgu tablosuna koymadım.
- 3. sınıf öğrencisiyle soru çözülmedi (3. sınıf soruları yalnız öğretmen önizlemesinde görüldü). 4. sınıfla (Ayşe telefonda, Emir masaüstünde) çözüldü.
- Öğretmen tarafında "Sil", "Şifre sıfırla", yeni ödev kaydetme ve "Demo verisini sıfırla" düğmelerine basılmadı. Öğretmen sonuçlar ekranında yalnız 3. sınıf listesi görüldü.
- Ödev olmayan durum (hiç ödev yok) denenmedi; "görev tamam" durumu görüldü.
- Yavaş ağ, canvas'ın eski telefonda performansı ve bellek kullanımı ölçülmedi.
- Her ten × her saç rengi × her kıyafet rengi tek tek denenmedi; 7 elle seçilmiş kombinasyon ve galerinin tek tabanı (esmer, sarı örgü) üzerinden bakıldı. Maske kenarında hale ya da kirli gri görmedim, ama bu kadar örnekle "yok" diyemem.
- Animasyonlar ekran görüntüsüyle değerlendirildi; video kaydı yok.

Not: Teste yardım olsun diye DEMO verisinde Ayşe'ye yıldız ekledim ve birkaç öğrenciye eşya taktım (yalnız tarayıcıdaki localStorage). İş bitince bu tarayıcı verisini sildim. Kod değişmedi, commit atılmadı, Supabase'e bağlanılmadı.
