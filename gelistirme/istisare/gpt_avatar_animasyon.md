Önce kulakları düzeltip **yanında** ve **arkadan bakıyor** pozlarını deneyin. Tek sprite’la bu iki poz doğal durabilir. Kucak ve omuz, çizime daha çok bağımlı.

**Kulaklar ve pozlar**

- Kulakları taban görselde küçültüp başa yaklaştırmak doğru başlangıç. Tek tek pikselleri silmek yerine kenarı yumuşak bir maskeyle yeniden şekillendirin. Sonucu kısa saçla, birkaç ten renginde ve avatarın listedeki gerçek boyutunda kontrol edin.
- **Arkadan bakıyor** pozunda hayvanı birleşik portrenin arkasına alıp yüzünün bir kısmını yandan gösterin. Azıcık eğim bile meraklı bir ifade verir.
- **Başının üstünde** pozu şapkayla çakışabilir. Şapkalı ve şapkasız hâli deneyin. **Omuzda** ve özellikle **kucakta** pozlarında aynı sprite havada asılı ya da gövdeye yapışmış görünebilir. Kucak pozu için sarılan kolların göründüğü ayrı bir çizim daha inandırıcı olur.
- Pozları ücretsiz tutun ve seçimleri küçük önizlemelerle gösterin. Çocuk, “Arkadan bakıyor” yazısını okumadan da neyi seçtiğini anlayabilsin.

**Sevimlilik ve hareket**

- En ucuz sevimlilik, hayvanın dokununca kısa bir sıçrayıp gülümsemesi. Bu tepkiyi klavyeyle de tetiklenebilen bir düğmeye bağlayın.
- Göz kırpmada açık ve kapalı gözlü iki birleşik kareyi kullanın. Kapalı kareyi yaklaşık 100–150 ms gösterin. Uzun bir opaklık geçişi iki gözü üst üste gösterip ifadeyi bulanıklaştırabilir.
- Her poza ayrı animasyon yazmak yerine aynı kısa hareketi uyarlayın. Yanındaki hayvan hafifçe sıçrayabilir, arkadaki başını biraz uzatabilir. Sürekli nefes hareketini çok hafif tutun. `prefers-reduced-motion` açıkken hareket yerine kısa bir gülümseme yeter.

**20 avatarlı sınıf listesi**

- Listeyi varsayılan olarak statik tutun. Göz kırpma ve nefes alma profil veya avatar düzenleme ekranında daha çok fark edilir. Böylece listede 20 ayrı animasyon ve zamanlayıcı çalışmaz.
- Birleştirmeyi görünüm değiştiğinde yapın ve sonucu önbelleğe alın. Göz kırpma sırasında canvas’ı yeniden çizdirmeyin veya her karede React state güncellemeyin.
- Liste için küçük çıktı üretin. 20 adet 512×512 RGBA kare açıldığında yaklaşık **20 MiB** piksel belleği tutar. Kapalı göz kareleri de yüklenirse bu yaklaşık **40 MiB** olur. WebP’nin küçük dosya boyutu, açılmış piksel belleğini küçültmez.
- Sıçrama için `transform`, kare değişimi için `opacity` kullanın. Tüm listeye `will-change` vermek ek bellek tüketebilir. Düşük seviye bir telefonda en anlamlı kontrol, 20 avatar ilk kez yüklenirken listeyi kaydırmaktır.