# Ödev Rotası — veri ve RPC sözleşmesi (MVP)

Köy okulu, birleştirilmiş 3. ve 4. sınıf, ~10-20 öğrenci. Hafta sonu tekrar ödevi.
Tek sabit link (WhatsApp grubuna sabitlenir). Cuma öğretmen seti yükler, link o setin açık olduğu sürede onu gösterir.

## İlkeler
- Gerçek isim, fotoğraf, veli telefonu tutulmaz. Öğrenci `display_name` (ör. "Kaplan Ali" ya da sadece "Ali K.") ve hayvan avatarıyla görünür.
- Öğrencinin şifresi 4 haneli PIN. Öğretmen panelinde görünür (kullanıcı kararı), sıfırlanabilir. Bu yüzden düz metin tutulur; şifre yalnız bu uygulamaya ait.
- Puanlama sunucuda. Cevap anahtarı öğrenciye giden veride YOK.
- Öğrenciler birbirinin puanını/yıldızını GÖRMEZ. Birbirinin avatarını ve taktığı aksesuarı görür. Sınıfın ortak yıldız hedefi görünür.
- Yıldız: set tamamlama = 10, her doğru = +1. Bir set için yıldız yalnız ilk gönderimde verilir. Kâğıttan çözen öğrenciye öğretmen elle aynı yıldızı ekleyebilir.

## Tablolar
- `classes(id uuid, name text, code text unique, teacher_id uuid -> auth.users, goal_target int default 300, goal_reward text)`
- `students(id uuid, class_id, display_name text, animal text, grade int check 3|4, pin text null, stars_bonus int default 0, equipped jsonb default '{}', created_at)`
  - `pin` null ise öğrenci ilk girişte kendi PIN'ini koyar.
  - `equipped`: `{ "char": "char_<tür>", "hat": "...", "glasses": "...", "item": "...", "pet": "...", "bg": "..." }` — `char` yoksa `animal` (tür id’si, eski kayıtlarda emoji) gösterilir.
- `assignments(id uuid, class_id, grade int, title text, opens_at timestamptz, closes_at timestamptz, questions jsonb, created_at)`
  - `questions`: `[{ "id": "q1", "type": "mc" | "tf", "text": "...", "options": ["..",".."], "answer": 0, "explanation": "..." }]`
  - `tf` için options `["Doğru","Yanlış"]`.
- `submissions(id uuid, assignment_id, student_id, answers jsonb, correct int, total int, stars_earned int, source text 'online'|'kagit', created_at, unique(assignment_id, student_id))`
- `shop_items(id text pk, slot text 'char'|'hat'|'glasses'|'item'|'pet'|'bg', name text, price int)` — `src/avatar/catalog.ts`'den üretilir (0003, 0004). Fiyatı 0 olan karakterler bedava alınır.
- `purchases(student_id, item_id, created_at, pk(student_id,item_id))`
- `student_sessions(token text pk, student_id, created_at, expires_at)` — 60 gün.
- `login_attempts(student_id, at timestamptz)` — 10 dakikada 5 yanlış PIN'den sonra kilit.

Yıldız bakiyesi = sum(submissions.stars_earned) + stars_bonus − sum(shop_items.price of purchases).

## Öğrenci RPC'leri (anon çağırır, SECURITY DEFINER, search_path sabit)
Hepsi `jsonb` döner. Hata: `raise exception` ile kısa Türkçe mesaj kodu (`PIN_HATALI`, `KILITLI`, `OTURUM_YOK`, `YETERSIZ_YILDIZ`, `ZATEN_GONDERILDI`, `SET_KAPALI`).

1. `roster(p_class_code text)` → `{ class: {name}, students: [{id, display_name, animal, grade, has_pin}] }`
2. `student_login(p_class_code text, p_student_id uuid, p_pin text)` → `{ token }`
   - pin null ise p_pin'i (4 hane) kaydeder ve girer.
3. `student_home(p_token text)` → 
   ```
   { me: {id, display_name, animal, grade, stars, equipped},
     owned: [item_id],
     assignment: null | {id, title, closes_at, questions: [{id,type,text,options}]},   // cevapsız
     my_result: null | <submit_assignment çıktısı>,
     past: [{title, correct, total, stars_earned, created_at}],
     classmates: [{id, display_name, animal, equipped}],      // yıldız YOK
     goal: {target, reward, current} }                          // current = sınıfın toplam kazanılan yıldızı (harcama düşülmez)
   ```
   - `assignment`: öğrencinin sınıfı ve grade'i için now() between opens_at and closes_at olan en yeni set.
4. `submit_assignment(p_token, p_assignment_id uuid, p_answers jsonb /* {"q1":0,...} */)` →
   `{ correct, total, stars_earned, items: [{id, given, answer, ok, explanation}] }`
5. `buy_item(p_token, p_item_id text)` → `{ stars, owned }`
6. `equip_item(p_token, p_slot text, p_item_id text|null)` → `{ equipped }` (sahip olmadığı eşyayı takamaz)

## Öğretmen
Supabase Auth (e-posta + şifre). RLS: öğretmen yalnız `classes.teacher_id = auth.uid()` olan sınıfın satırlarını görür/yazar.
- students CRUD (pin dahil görür), assignments CRUD, submissions okuma, kâğıt için `teacher_add_paper(p_assignment_id, p_student_id, p_correct int)` RPC (source='kagit', yıldız = 10 + correct).
- `teacher_reset_pin(p_student_id)` → pin = null.
