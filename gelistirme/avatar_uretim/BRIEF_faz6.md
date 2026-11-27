# Faz 6 · Gerçek yüz şekilleri + kucakta tutan eller (ImageGen)

Bağlam: avatar katmanlı 2D (bkz. `NOTLAR.md`, `BRIEF.md`, `katmanlari_hazirla.py`, `../pilot_avatar/`). Taban portre: `../pilot_avatar/kaynak/imagegen/base.png` (ham ImageGen), yayımlanan 512 hâli `kaynak/base_orijinal/base.webp` + `base_mask.webp` (gri ten + ten maskesi, `ref` manifest'te `base.skinRef`). Kullanıcı yüz şekillerinin yeterince farklı olmadığını söyledi; önceki "yüz şekli" yalnız geometrik bükmeydi (`yuz_varyant.py`), yetmedi.

Her çizim yerleşik image_gen ile. Tarayıcı açma, commit atma, `src/` ve `public/av/manifest.json` dosyalarına dokunma (onları Claude bağlayacak). Çıktıları aşağıdaki yollara yaz, bitince `NOTLAR.md`'ye "Faz 6" bölümü (istemler dahil) ekle ve `faz6.bitti` dosyasını oluştur.

## 1. Yüz şekilleri (5 adet)

Tabanın precise-object-edit düzenlemeleri, stil referansı önceki fazlardaki gibi. Kimlikler ve hedef:

| id | istenen |
| --- | --- |
| round | dolgun, tombul yanaklı, yuvarlak çene, bebeksi |
| long | uzun ve ince yüz, belirgin uzun çene |
| square | geniş köşeli çene hattı, düz yanaklar |
| heart | geniş elmacık, sivri küçük çene (kalp yüz) |
| wide | basık geniş yüz, alçak yuvarlak çene, kısa |

Farklar 96 px'de bile **açıkça** görülmeli (kontur, yanak dolgunluğu, çene). Kulaklar hepsinde doğal ve **küçük**, başa yakın (kepçe değil); dikey konum tabanla aynı bölgede (512'de y≈205–262).

Sıkı kurallar (saç/şapka/ifade katmanları tabana hizalı, bozulmasın):
- Düzenlemeyi tabana gözler ve ağızdan hizala (`face_transform` gibi).
- Hizaladıktan sonra 512 ölçeğinde şu bölgeleri **orijinal tabandan birebir geri kopyala**, kenarları 6–8 px yumuşak geçişle: alın ve tepe (y < 190, tüm genişlik), göz-kaş kutusu (x 150–362, y 160–252), ağız-burun kutusu (x 214–298, y 236–288), boyun ve tişört (y > 318). Yani yalnız yanak, çene hattı, kulak değişir. Yanak kontur çizgisi ve gölgelendirme kopyalanan bölgelerle dikişsiz birleşmeli.
- Ten maskesi tabanınkiyle aynı mantıkta (`skin_mask`), gözler/koyu çizgiler/tişört korunur. Gri ten, aynı `skinRef` ile boyandığında renk tabanla tutarlı olmalı (ref'i ölç, ±8 içinde değilse parlaklığı eşitle).
- Çıktı: `public/av/base/shape_<id>.webp` (RGBA, kalite 92) ve `public/av/base/shape_<id>_mask.webp` (kayıpsız). Ham PNG'ler `kaynak/imagegen/faz6/`.

## 2. Kucakta tutan eller (1 katman)

Çocuğun hayvanını göğsünün önünde tuttuğunu gösteren **iki küçük çocuk eli**: tabanla aynı çizgi ve gri ten, şeffaf arka plan, 512 kanvas, tabana göre konumlu. Eller göğüs hizasında (y≈360–470), merkez x=256 etrafında, aralarında ~150 px genişliğinde ve ~150 px yüksekliğinde bir hayvanın durduğu varsayılan boşluk var; parmaklar hayvanın iki yanını ve altını sarıyor, bilekler kanvasın altına doğru kayboluyor (kol/kol yeni yok, yalnız el ve bilek). Önden görünüş, sevimli, tombul çocuk elleri.
- Çıktı: `public/av/pose/hands.webp` + `public/av/pose/hands_mask.webp` (ten maskesi) + ölçülen `ref` değerini `NOTLAR.md`'ye yaz.

## 3. Kontrol

`kaynak/onizleme_faz6.png`: 5 şekil + orijinal, açık ve koyu tende, kısa saç (`public/av/hair/short_front.webp`) ve at kuyruğuyla, 256 ve 96 px; ayrıca ellerin tabanla birleşimi (ortaya bir hayvan, örn. `public/av/pet/cat.webp` ~150 px, ellerin arasına). Hizalama/dikiş hatası varsa düzelt.
