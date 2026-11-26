[Migration](/home/Edrow/ChatGPT/odev-rotasi/supabase/migrations/0001_init.sql), [DOGANLI demo verisi](/home/Edrow/ChatGPT/odev-rotasi/supabase/seed_demo.sql) ve [5 satırlık kurulum notu](/home/Edrow/ChatGPT/odev-rotasi/supabase/README.md) hazır. Demo, her seviyede 5 öğrenci ve şu anda açık 5 soruluk birer set içeriyor. Mağazada her slot için 4 eşya var.

İki uygulama kararını özellikle belirteyim:

- Cevap anahtarını gizleme şartına öncelik verdim. Öğrenci sonucunda `answer` alanı yok. Öğretmenin açıklaması doğru cevabı içerebileceğinden öğrenci kendi seçimini ve doğru/yanlış geri bildirimini görüyor.
- Yanlış PIN denemesini kaydeden çağrı, `RAISE` sayacı da geri alacağı için PostgREST üzerinden hata döndürüyor. On dakika içindeki beşinci yanlış deneme, hesabı o andan itibaren on dakika kilitliyor.

RLS kapsamını, RPC grantlerini ve demo verisini statik olarak kontrol ettim. Ortamda `postgres` ve `psql` bulunmadığından migration’ın PostgreSQL 15’te çalışmasını ve PostgREST hata yanıtlarını canlı doğrulayamadım.