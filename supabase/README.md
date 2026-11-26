1. SQL Editor'da `migrations/` altındaki dosyalar sırayla çalıştırılır (0001, 0002, 0003...). 0003 avatar kataloğudur, tekrar çalıştırılabilir.
2. Authentication → Users → Add user → Create new user (Auto confirm işaretli). Tek öğretmen kullanıcısı.
3. `seed_sinif.sql` çalıştırılır: DOGANLI sınıfını bu kullanıcıya bağlar.
4. Authentication → Sign In / Providers → "Allow new users to sign up" kapalı.
5. Öğrenciler ve ödevler öğretmen panelinden (`/#/ogretmen`) eklenir. `seed_demo.sql` yalnız deneme içindir.
