# Ödev Rotası görsel düzenleme

- [x] Mevcut kodu, görsel raporu ve iki referansı incele. Yerel demo ve kullanıcı değişikliklerini koru.
- [x] Çocuk ve tavşan çizimini canlı avatarla bağla. Küçük portreleri ve hayvan pozlarını biçime göre kadrajla.
- [x] Dükkân sekmelerini ve ürün sunumunu yenile. Yıldız yalnız açık satın alma onayından sonra harcansın.
- [x] Öğrenci giriş, rota, soru, sonuç ve öğretmen mobil düzenlerini tamamla.
- [x] Mobil ve masaüstünde Chrome ile girişten sonuca, dükkâna ve öğretmen ödevleriyle sonuçlarına kadar doğrula. Avatar kombinlerini görsel olarak incele. Derleme ve lint çalıştır.

## Sonuç

- Chrome'da 360 × 800, 375 × 812 ve 1280 × 800 boyutlarında ad seçimi, PIN, görev, sonuç, cevap inceleme, deneme, satın alma, takma, öğretmen ödev listesi, düzenleyici ve öğretmen sonuçları geçti. İki seçenekli ve dört seçenekli soruda gezinme aynı konumda kaldı.
- Portreler 375 × 812 ve 1280 × 800 Chrome görünümlerinde incelendi. Tam tavşan çizimi, kişiselleştirilmiş tavşan, saçta ve berede kirpi, zürafa, taç/gözlükle ejderha, afro, başörtüsü ve fil doğrulandı.
- Derleme, lint ve `git diff --check` tamamlandı. Derlemede ana paketin boyutu, lint'te React ve betik uyarıları var. Manifestte eşya kimlikleri ve fiyatlar karşılaştırıldı.
- Sabit tavşan illüstrasyonu yeni demo Ayşe görünümünde, onunla aynı kombinlerde ve galeride kullanılıyor. Kişiselleştirme değişince katmanlı sahne gösteriliyor. Eski kayıtlar için veri dönüşümü yok. Üretim Supabase ve fiziksel telefon kullanılmadı.

## İllüstrasyon

Yerleşik ImageGen aracı, şeffaf PNG ve ikinci ekran görüntüsü referansıyla çalıştırıldı. Projede web için küçültülen WebP kullanılıyor. Kaydedilen çizim `public/av/pose/rabbit-cradle.webp`.

> Create one polished transparent PNG character illustration asset for a Turkish primary-school homework game. Children's picture book / crisp 2D cartoon with deep brown ink contours, softly painted gradients, large warm eyes, and clean shapes matching the supplied UI reference. Same child visual identity as reference: warm dark brown skin, short chocolate side-swept hair, bright brown eyes, grey blue crew-neck shirt. Same little cream rabbit with pink inner ears. Redesign the composition entirely as an integrated waist-up/below-chest posed illustration. Child physically cradles rabbit just below the child's chin and slightly toward viewer's right. Show bent supporting arm beneath rabbit and a clearly visible foreground hand resting over rabbit's lower body with warm contact shadow at their meeting. Rabbit's ears can rise by cheek but stay clear of eyes and mouth. Both friendly, child face and eyebrows readable. Center the complete tightly unified silhouette with slight padding in square format, include full head and ears, crop at below chest with rounded outer shirt hem rather than abrupt ground strip. Plain true alpha everywhere outside character. No stand, frame, letters, additional objects, or ground shadow.

## Yüz düzenleyici

- [x] Yerleşik ImageGen ile üç burun, üç kaş ve üç göz biçimi üret. Bunları mevcut ten paleti, iris rengi ve ifade katmanlarıyla hizala.
- [x] Yeni ücretsiz seçenekleri dükkâna bağla. 0012, tek seferlik kurulum ve demo kataloğunda aynı yuvaları doğrula.
- [x] Yanak ve çene hatlarını belirginleştir. Küçük yüz kartlarında oyuncunun saç, şapka ve gözlüğünü göster.
- [x] 360 × 640 ve 1440 × 900 yerel Chrome demolarında parçaları tek tek dene, geri al, tak ve yenile. Yerel PostgreSQL kurulumunu ve geçişi kontrol et.

## Kıyafet ve hayvan arkadaşları

- [x] Kucak pozlarında uzun kolları giysiye uydur. Kep altında Afro hacmini, küçük kartlarda dinozor kapüşonu ile pelerinin okunurluğunu artır.
- [x] Papağanın kucak pozunu parmağa bağla. Aslan, kaplan, leopar, kurt, kara kedi ve kanişe ayırt edici duruşlar ver.
- [x] Ortak kucak pozunda hayvanı ve elleri ağız çizgisinin altında tut. Küçük kartlarda ve dükkân aynasında kontrol et.
- [x] Başımda pozunda 11 hayvanın temasını saç veya şapkaya hizala. Seçili arka planı hayvanın arkasına kadar uzat.
- [x] Omzumda pozunda pati ve pençeleri kıyafetin omuz çizgisine hizala. Süzülen türleri omzun yanında göster.
