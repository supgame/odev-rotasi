# Faz 7 · Yüz şekillerini doğal ve sevimli yeniden çiz (ImageGen)

Bağlam: `NOTLAR.md` Faz 6. Faz 6'daki 5 yüz (`kaynak/imagegen/faz6/*.png`, işlenmiş hâli `kaynak/shape/shape_<id>.webp`) **kötü oldu**: kullanıcı "leş" dedi. Sebep: istemler abartmayı istedi, sonuç karikatür. `square` kutu gibi düz kenarlı ve köşeli, `heart` çenede V/sivri uç, `wide` basık ve dibi düz, `long` uzun at suratı gibi. Bunlar bir çocuk avatar uygulamasında (Bitmoji, Zepeto, Nintendo Mii, Animal Crossing tarzı sevimlilik) asla seçilmeyecek yüzler.

Hedef: aynı 5 kimlik, ama her biri **tek başına bakınca güzel, sevimli, doğal bir çocuk yüzü**. Fark ölçülü ama 128 px avatarda saçla birlikte fark edilir. Hiçbir şekilde düz çizgi, keskin köşe, sivri uç, düz çene dibi yok; kontur her yerde yumuşak, sürekli bir eğri.

| id | istenen (yumuşak!) |
| --- | --- |
| round | tombul yanaklı, yuvarlak dolgun alt yüz (Faz 6 round fena değildi; biraz daha yumuşak ve dengeli) |
| long | biraz daha uzun ve ince oval; çene orijinalden ~8–10 px aşağı, yanaklar hafif dar. At suratı değil. |
| square | hafif geniş, güçlü ama **yuvarlatılmış** çene hattı; köşe yok, çene dibi geniş yuvarlak yay. Sağlıklı, sevimli bir oğlan/kız yüzü. |
| heart | elmacıklar biraz dolgun, alt yüz çeneye doğru hafif daralır, çene küçük ve **yuvarlak** (V değil, sivri uç değil). |
| wide | biraz daha geniş ve kısa, dolgun yanaklar, çene dibi yumuşak geniş yay (düz değil). |

Kulaklar: hepsinde küçük, doğal, başa yakın; y≈205–262.

## Kurallar
- Tarayıcı açma, commit atma. `src/` ve `public/av/manifest.json` dosyalarına dokunma.
- Her yüz yerleşik image_gen ile, orijinal taban (`../pilot_avatar/kaynak/imagegen/base.png`) referans/düzenleme hedefi. İstemde abartı kelimeleri ("distinctly", "dramatically", "unmistakably", "strongly", "obvious") **kullanma**; "subtle, soft, cute, natural, gently" yönünde yaz. Gerekirse bir şekli birkaç kez üret, en iyisini seç.
- Hizalama ve geri kopyalama Faz 6'daki gibi (gözler+ağızdan hizala; alın/tepe y<190, göz-kaş kutusu, ağız-burun kutusu, boyun ve tişört orijinalden). Geri kopyalanan kutuların kenarı yeni kontura değiyorsa geçişi konturu izleyerek yap; **hiçbir yerde kutu kenarı, dikiş, çift çizgi, kesik kontur kalmasın**. Çene konturu ağız kutusuna çok yakınsa kutuyu küçült.
- Ten maskesi ve `skinRef` tutarlılığı Faz 6'daki gibi (±8).
- Çıktılar: ham PNG `kaynak/imagegen/faz7/<id>.png`; işlenmiş `kaynak/shape/shape_<id>.webp` + `shape_<id>_mask.webp` (eskilerinin **üzerine yaz**, Faz 6 hâllerini önce `kaynak/shape/faz6_yedek/` içine kopyala).

## Kontrol (zorunlu, kendin bak)
`kaynak/onizleme_faz7.png`: 6 yüz (oval + 5) yan yana, açık ve orta tende, (a) saçsız 256 px, (b) kısa saç `public/av/hair/short_front.webp` ile 128 px, (c) uzun saç / at kuyruğu ile 128 px. Önizlemeye kendin bak; köşe, V, düz kenar, dikiş, kulak izi görürsen düzelt ve tekrar üret. Bitince `NOTLAR.md`'ye "Faz 7" bölümü (istemler, neyi neden seçtiğin) ekle ve `faz7.bitti` dosyasını oluştur.
