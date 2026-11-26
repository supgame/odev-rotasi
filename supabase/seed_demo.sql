-- DOGANLI demo sınıfı. Supabase Dashboard > SQL Editor'da çalıştırmadan önce
-- aşağıdaki öğretmen UUID'sini Auth > Users bölümündeki öğretmen kullanıcısının
-- UUID'siyle değiştirin. Bu değer zorunludur; sınıf sahipliği/RLS buna bağlıdır.
-- Tekrar çalıştırmak güvenlidir: mevcut öğrenci PIN’leri korunur, set tarihleri yenilenir.

with demo_teacher as (
  select '00000000-0000-0000-0000-000000000000'::uuid as teacher_id -- TODO: Gerçek auth.users.id ile değiştirin
), demo_class as (
  insert into public.classes (id, name, code, teacher_id, goal_target, goal_reward)
  select 'd06a0000-0000-4000-8000-000000000001'::uuid,
         'Demo Okulu', 'DOGANLI', teacher_id, 300, 'Sınıfça kitap saati'
  from demo_teacher
  on conflict (id) do update set
    name = excluded.name,
    code = excluded.code,
    teacher_id = excluded.teacher_id,
    goal_target = excluded.goal_target,
    goal_reward = excluded.goal_reward
  returning id
), demo_students as (
  insert into public.students (id, class_id, display_name, animal, grade)
  select v.id::uuid, c.id, v.display_name, v.animal, v.grade
  from demo_class c
  cross join (values
    ('d06a0000-0000-4000-8000-000000000101', 'Kaplan Ali', '🐯', 3),
    ('d06a0000-0000-4000-8000-000000000102', 'Tilki Ece', '🦊', 3),
    ('d06a0000-0000-4000-8000-000000000103', 'Tavşan Can', '🐰', 3),
    ('d06a0000-0000-4000-8000-000000000104', 'Baykuş Deniz', '🦉', 3),
    ('d06a0000-0000-4000-8000-000000000105', 'Kedi Ada', '🐱', 3),
    ('d06a0000-0000-4000-8000-000000000201', 'Aslan Mert', '🦁', 4),
    ('d06a0000-0000-4000-8000-000000000202', 'Ayı Zeynep', '🐻', 4),
    ('d06a0000-0000-4000-8000-000000000203', 'Yunus Eylül', '🐬', 4),
    ('d06a0000-0000-4000-8000-000000000204', 'Kirpi Bora', '🦔', 4),
    ('d06a0000-0000-4000-8000-000000000205', 'Panda Elif', '🐼', 4)
  ) as v(id, display_name, animal, grade)
  on conflict (id) do nothing
  returning id
)
insert into public.assignments (id, class_id, grade, title, opens_at, closes_at, questions)
select v.id::uuid, c.id, v.grade, v.title,
       now() - interval '1 day', now() + interval '30 days', v.questions::jsonb
from demo_class c
cross join (values
  ('d06a0000-0000-4000-8000-000000000301', 3, '3. Sınıf Hafta Sonu Tekrarı',
   '[{"id":"q1","type":"mc","text":"246 sayısında 4 rakamının basamak değeri kaçtır?","options":["4","40","400"],"answer":1,"explanation":"4 onlar basamağındadır; değeri 40 olur."},
     {"id":"q2","type":"mc","text":"125 + 37 işleminin sonucu kaçtır?","options":["152","162","172"],"answer":1,"explanation":"125 + 37 = 162."},
     {"id":"q3","type":"tf","text":"Bir üçgenin üç kenarı vardır.","options":["Doğru","Yanlış"],"answer":0,"explanation":"Üçgenin üç kenarı bulunur."},
     {"id":"q4","type":"mc","text":"Bir hafta kaç gündür?","options":["5","7","10"],"answer":1,"explanation":"Bir hafta 7 gündür."},
     {"id":"q5","type":"mc","text":"En yakın onluğa yuvarlandığında 68 hangi sayıya dönüşür?","options":["60","70","80"],"answer":1,"explanation":"Birler basamağı 8 olduğu için 70''e yuvarlanır."}]'),
  ('d06a0000-0000-4000-8000-000000000401', 4, '4. Sınıf Hafta Sonu Tekrarı',
   '[{"id":"q1","type":"mc","text":"3 406 sayısında 4 rakamının basamak değeri kaçtır?","options":["40","400","4 000"],"answer":1,"explanation":"4 yüzler basamağındadır ve basamak değeri 400 olur."},
     {"id":"q2","type":"mc","text":"236 + 148 işleminin sonucu kaçtır?","options":["374","384","394"],"answer":1,"explanation":"236 + 148 = 384."},
     {"id":"q3","type":"tf","text":"Dikdörtgenin karşılıklı kenarları eşit uzunluktadır.","options":["Doğru","Yanlış"],"answer":0,"explanation":"Dikdörtgende karşılıklı kenarlar eşittir."},
     {"id":"q4","type":"mc","text":"Bir saat kaç dakikadır?","options":["30","60","100"],"answer":1,"explanation":"Bir saat 60 dakikadır."},
     {"id":"q5","type":"mc","text":"3/8 kesrinde payda hangisidir?","options":["3","5","8"],"answer":2,"explanation":"Kesrin altındaki sayı olan 8 paydadır."}]')
) as v(id, grade, title, questions)
on conflict (id) do update set
  class_id = excluded.class_id,
  grade = excluded.grade,
  title = excluded.title,
  opens_at = excluded.opens_at,
  closes_at = excluded.closes_at,
  questions = excluded.questions;
