begin;

revoke create on schema public from public, anon, authenticated;
grant usage on schema public to anon, authenticated;

-- Private implementation functions are never exposed as student RPCs.
create schema if not exists odev_private;
revoke all on schema odev_private from public, anon, authenticated;

create function odev_private.valid_questions(p_questions jsonb)
returns boolean language plpgsql immutable set search_path = pg_catalog
as $$
declare q jsonb; option_value jsonb; seen_ids text[] := array[]::text[]; question_id text;
begin
  if p_questions is null or jsonb_typeof(p_questions) <> 'array' then return false; end if;
  if jsonb_array_length(p_questions) = 0 then return false; end if;
  for q in select value from jsonb_array_elements(p_questions) loop
    if jsonb_typeof(q) <> 'object'
       or not (q ?& array['id','type','text','options','answer'])
       or jsonb_typeof(q->'id') <> 'string' or length(btrim(q->>'id')) = 0
       or jsonb_typeof(q->'type') <> 'string' or q->>'type' not in ('mc','tf')
       or jsonb_typeof(q->'text') <> 'string' or length(btrim(q->>'text')) = 0
       or (q ? 'explanation' and jsonb_typeof(q->'explanation') <> 'string')
       or jsonb_typeof(q->'options') <> 'array'
       or jsonb_typeof(q->'answer') <> 'number'
    then return false; end if;
    question_id := q->>'id';
    if question_id = any(seen_ids) then return false; end if;
    seen_ids := array_append(seen_ids, question_id);
    if jsonb_array_length(q->'options') < 2 then return false; end if;
    for option_value in select value from jsonb_array_elements(q->'options') loop
      if jsonb_typeof(option_value) <> 'string' or length(btrim(option_value #>> '{}')) = 0 then return false; end if;
    end loop;
    if q->>'type' = 'tf' and q->'options' <> '["Doğru","Yanlış"]'::jsonb then return false; end if;
    if (q->>'answer') !~ '^(0|[1-9][0-9]*)$' then return false; end if;
    if (q->>'answer')::numeric >= jsonb_array_length(q->'options') then return false; end if;
  end loop;
  return true;
end;
$$;

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  code text not null unique check (length(btrim(code)) > 0),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  goal_target integer not null default 300 check (goal_target > 0),
  goal_reward text
);
create table public.students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  display_name text not null check (length(btrim(display_name)) > 0),
  animal text not null check (length(btrim(animal)) > 0),
  grade integer not null check (grade in (3,4)),
  pin text check (pin ~ '^[0-9]{4}$'),
  stars_bonus integer not null default 0 check (stars_bonus >= 0),
  equipped jsonb not null default '{}'::jsonb check (jsonb_typeof(equipped) = 'object'),
  created_at timestamptz not null default now()
);
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  grade integer not null check (grade in (3,4)),
  title text not null check (length(btrim(title)) > 0),
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  questions jsonb not null check (odev_private.valid_questions(questions)),
  created_at timestamptz not null default now(),
  check (closes_at > opens_at)
);
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  correct integer not null check (correct >= 0),
  total integer not null check (total > 0 and correct <= total),
  stars_earned integer not null check (stars_earned = 10 + correct),
  source text not null check (source in ('online','kagit')),
  result_items jsonb not null default '[]'::jsonb check (jsonb_typeof(result_items) = 'array'),
  created_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);
create table public.shop_items (
  id text primary key check (length(btrim(id)) > 0),
  slot text not null check (slot in ('skin', 'hair', 'hcolor', 'hat', 'glasses', 'clothes', 'ccolor', 'face', 'fshape', 'ears', 'eyes', 'cheek', 'mouth', 'nose', 'brow', 'eshape', 'pose', 'bg', 'pet')),
  name text not null check (length(btrim(name)) > 0),
  price integer not null check (price >= 0)
);
create table public.purchases (
  student_id uuid not null references public.students(id) on delete cascade,
  item_id text not null references public.shop_items(id),
  created_at timestamptz not null default now(),
  primary key (student_id,item_id)
);
create table public.student_sessions (
  token text primary key,
  student_id uuid not null references public.students(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '60 days'),
  check (expires_at > created_at)
);
create table public.login_attempts (
  student_id uuid not null references public.students(id) on delete cascade,
  at timestamptz not null default now()
);

create index classes_teacher_idx on public.classes(teacher_id);
create index students_class_idx on public.students(class_id,grade);
create index assignments_active_idx on public.assignments(class_id,grade,opens_at desc);
create index submissions_student_idx on public.submissions(student_id,created_at desc);
create index purchases_item_idx on public.purchases(item_id);
create index student_sessions_student_idx on public.student_sessions(student_id);
create index student_sessions_expiry_idx on public.student_sessions(expires_at);
create index login_attempts_student_at_idx on public.login_attempts(student_id,at desc);

-- Preserve ownership; allow class/grade corrections only before dependent history exists.
create function odev_private.preserve_ancestry()
returns trigger language plpgsql security definer set search_path = pg_catalog
as $$
begin
  if tg_table_name = 'classes' then
    if new.id is distinct from old.id or new.teacher_id is distinct from old.teacher_id then
      raise exception 'SAHIPLIK_DEGISTIRILEMEZ';
    end if;
  else
    if new.id is distinct from old.id then raise exception 'KIMLIK_DEGISTIRILEMEZ'; end if;
    if new.class_id is distinct from old.class_id or new.grade is distinct from old.grade then
      if tg_table_name = 'students' then
        if exists (select 1 from public.submissions where student_id = old.id)
           or exists (select 1 from public.student_sessions where student_id = old.id) then
          raise exception 'SINIF_DEGISTIRILEMEZ';
        end if;
      elsif exists (select 1 from public.submissions where assignment_id = old.id) then
        raise exception 'SINIF_DEGISTIRILEMEZ';
      end if;
    end if;
  end if;
  return new;
end;
$$;
create trigger classes_preserve_ancestry before update on public.classes
for each row execute function odev_private.preserve_ancestry();
create trigger students_preserve_ancestry before update on public.students
for each row execute function odev_private.preserve_ancestry();
create trigger assignments_preserve_ancestry before update on public.assignments
for each row execute function odev_private.preserve_ancestry();

-- Lock the referenced assignment so edits and first submissions serialize.
create function odev_private.check_submission()
returns trigger language plpgsql security definer set search_path = pg_catalog
as $$
declare assignment_row public.assignments%rowtype; student_row public.students%rowtype;
begin
  select * into student_row from public.students where id = new.student_id for share;
  select * into assignment_row from public.assignments where id = new.assignment_id for share;
  if assignment_row.id is null or student_row.id is null
     or assignment_row.class_id <> student_row.class_id or assignment_row.grade <> student_row.grade then
    raise exception 'SINIF_UYUSMAZLIGI';
  end if;
  if new.total <> jsonb_array_length(assignment_row.questions) then raise exception 'SONUC_GECERSIZ'; end if;
  return new;
end;
$$;
create trigger submissions_check before insert or update on public.submissions
for each row execute function odev_private.check_submission();

alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.shop_items enable row level security;
alter table public.purchases enable row level security;
alter table public.student_sessions enable row level security;
alter table public.login_attempts enable row level security;

revoke all on table public.classes, public.students, public.assignments, public.submissions,
  public.shop_items, public.purchases, public.student_sessions, public.login_attempts from public, anon, authenticated;
grant select, insert, update, delete on public.classes, public.students, public.assignments to authenticated;
grant select on public.submissions, public.shop_items to authenticated;

create policy teacher_classes on public.classes for all to authenticated
using (teacher_id = (select auth.uid())) with check (teacher_id = (select auth.uid()));
create policy teacher_students on public.students for all to authenticated
using (exists (select 1 from public.classes c where c.id = class_id and c.teacher_id = (select auth.uid())))
with check (exists (select 1 from public.classes c where c.id = class_id and c.teacher_id = (select auth.uid())));
create policy teacher_assignments on public.assignments for all to authenticated
using (exists (select 1 from public.classes c where c.id = class_id and c.teacher_id = (select auth.uid())))
with check (exists (select 1 from public.classes c where c.id = class_id and c.teacher_id = (select auth.uid())));
create policy teacher_submissions on public.submissions for select to authenticated
using (exists (select 1 from public.assignments a join public.classes c on c.id = a.class_id
               where a.id = assignment_id and c.teacher_id = (select auth.uid())));
create policy authenticated_shop on public.shop_items for select to authenticated using (true);


insert into public.shop_items (id, slot, name, price) values
  ('skin_light', 'skin', 'Açık', 0),
  ('skin_wheat', 'skin', 'Buğday', 0),
  ('skin_brown', 'skin', 'Esmer', 0),
  ('skin_tan', 'skin', 'Bronz', 0),
  ('skin_dark', 'skin', 'Koyu', 0),
  ('hair_short', 'hair', 'Kısa düz', 0),
  ('hair_ponytail', 'hair', 'At kuyruğu', 0),
  ('hair_curly', 'hair', 'Kısa kıvırcık', 0),
  ('hair_afro', 'hair', 'Afro', 0),
  ('hair_straight_long', 'hair', 'Uzun düz', 0),
  ('hair_bob', 'hair', 'Omuz boyu küt', 0),
  ('hair_bun', 'hair', 'Tepede topuz', 0),
  ('hair_braids', 'hair', 'İki örgü', 0),
  ('hair_space_buns', 'hair', 'İki yan topuz', 10),
  ('hair_wavy_long', 'hair', 'Uzun dalgalı', 10),
  ('hair_bangs_long', 'hair', 'Kahküllü uzun', 10),
  ('hair_spiky', 'hair', 'Dikenli kirpi saç', 15),
  ('hair_side_part', 'hair', 'Yandan ayrık düzgün', 0),
  ('hair_headscarf', 'hair', 'Başörtüsü', 0),
  ('hcolor_black', 'hcolor', 'Siyah', 0),
  ('hcolor_dark_brown', 'hcolor', 'Koyu kahve', 0),
  ('hcolor_brown', 'hcolor', 'Kahve', 0),
  ('hcolor_auburn', 'hcolor', 'Kızıl kahve', 0),
  ('hcolor_blonde', 'hcolor', 'Sarı', 0),
  ('hcolor_golden_blonde', 'hcolor', 'Altın sarısı', 0),
  ('hcolor_red', 'hcolor', 'Kızıl', 10),
  ('hcolor_platinum', 'hcolor', 'Platin', 10),
  ('hcolor_silver', 'hcolor', 'Gümüş', 15),
  ('hcolor_pink', 'hcolor', 'Pembe', 20),
  ('hcolor_blue', 'hcolor', 'Mavi', 20),
  ('hcolor_purple', 'hcolor', 'Mor', 20),
  ('hcolor_green', 'hcolor', 'Yeşil', 25),
  ('hcolor_crimson', 'hcolor', 'Kırmızı', 25),
  ('hcolor_turquoise', 'hcolor', 'Turkuaz', 25),
  ('hat_cap_red', 'hat', 'Kırmızı beyzbol şapkası', 15),
  ('hat_cap_blue', 'hat', 'Mavi beyzbol şapkası', 15),
  ('hat_cap_green', 'hat', 'Yeşil beyzbol şapkası', 15),
  ('hat_cap_black', 'hat', 'Siyah beyzbol şapkası', 15),
  ('hat_pom_red', 'hat', 'Kırmızı ponponlu bere', 15),
  ('hat_pom_purple', 'hat', 'Mor ponponlu bere', 15),
  ('hat_pom_navy', 'hat', 'Lacivert ponponlu bere', 15),
  ('hat_pom_cream', 'hat', 'Krem ponponlu bere', 15),
  ('hat_earflap_blue', 'hat', 'Mavi kulaklıklı kış beresi', 20),
  ('hat_earflap_green', 'hat', 'Yeşil kulaklıklı kış beresi', 20),
  ('hat_earflap_cream', 'hat', 'Krem kulaklıklı kış beresi', 20),
  ('hat_cat_black', 'hat', 'Siyah kedi kulaklı bere', 30),
  ('hat_cat_pink', 'hat', 'Pembe kedi kulaklı bere', 30),
  ('hat_cat_purple', 'hat', 'Mor kedi kulaklı bere', 30),
  ('hat_bucket_turquoise', 'hat', 'Turkuaz kova şapka', 20),
  ('hat_bucket_cream', 'hat', 'Krem kova şapka', 20),
  ('hat_bucket_pink', 'hat', 'Pembe kova şapka', 20),
  ('hat_bucket_navy', 'hat', 'Lacivert kova şapka', 20),
  ('hat_cowboy_brown', 'hat', 'Kahverengi kovboy şapkası', 35),
  ('hat_cowboy_cream', 'hat', 'Krem kovboy şapkası', 35),
  ('hat_cowboy_black', 'hat', 'Siyah kovboy şapkası', 35),
  ('hat_wizard_purple', 'hat', 'Mor yıldızlı sihirbaz şapkası', 40),
  ('hat_wizard_navy', 'hat', 'Lacivert yıldızlı sihirbaz şapkası', 40),
  ('hat_wizard_green', 'hat', 'Yeşil yıldızlı sihirbaz şapkası', 40),
  ('hat_pirate', 'hat', 'Korsan şapkası', 40),
  ('hat_crown', 'hat', 'Altın taç', 60),
  ('hat_pilot', 'hat', 'Gözlüklü pilot başlığı', 50),
  ('hat_bear_brown', 'hat', 'Kahverengi ayı kulaklı bere', 30),
  ('hat_bear_pink', 'hat', 'Pembe ayı kulaklı bere', 30),
  ('hat_bear_cream', 'hat', 'Krem ayı kulaklı bere', 30),
  ('glasses_round_plum', 'glasses', 'Mürdüm yuvarlak gözlük', 10),
  ('glasses_round_black', 'glasses', 'Siyah yuvarlak gözlük', 10),
  ('glasses_round_gold', 'glasses', 'Altın rengi yuvarlak gözlük', 10),
  ('glasses_square_navy', 'glasses', 'Lacivert kalın kare gözlük', 15),
  ('glasses_square_black', 'glasses', 'Siyah kalın kare gözlük', 15),
  ('glasses_square_turquoise', 'glasses', 'Turkuaz kalın kare gözlük', 15),
  ('glasses_aviator_gold', 'glasses', 'Altın rengi pilot gözlüğü', 25),
  ('glasses_aviator_black', 'glasses', 'Siyah pilot gözlüğü', 25),
  ('glasses_sunglasses_black', 'glasses', 'Siyah güneş gözlüğü', 20),
  ('glasses_sunglasses_turquoise', 'glasses', 'Turkuaz güneş gözlüğü', 20),
  ('glasses_sunglasses_red', 'glasses', 'Kırmızı güneş gözlüğü', 20),
  ('glasses_heart_pink', 'glasses', 'Pembe kalp gözlük', 25),
  ('glasses_heart_red', 'glasses', 'Kırmızı kalp gözlük', 25),
  ('glasses_star_gold', 'glasses', 'Altın rengi yıldız gözlük', 35),
  ('glasses_star_purple', 'glasses', 'Mor yıldız gözlük', 35),
  ('glasses_eyepatch', 'glasses', 'Korsan bandı', 25),
  ('clothes_tshirt', 'clothes', 'Düz tişört', 0),
  ('clothes_hoodie', 'clothes', 'Kapüşonlu', 0),
  ('clothes_tracksuit', 'clothes', 'Fermuarlı eşofman üstü', 15),
  ('clothes_collared_sweater', 'clothes', 'Yakalı kazak', 15),
  ('clothes_blazer', 'clothes', 'Ceket ve gömlek', 25),
  ('clothes_overalls', 'clothes', 'Salopet', 15),
  ('clothes_striped_tee', 'clothes', 'Çizgili tişört', 10),
  ('clothes_football', 'clothes', 'Futbol forması', 25),
  ('clothes_astronaut', 'clothes', 'Astronot giysisi', 60),
  ('clothes_knight', 'clothes', 'Şövalye zırhı', 55),
  ('clothes_superhero', 'clothes', 'Pelerinli süper kahraman', 50),
  ('clothes_doctor', 'clothes', 'Doktor önlüğü', 35),
  ('clothes_dinosaur', 'clothes', 'Dinozor kapüşonlu', 45),
  ('clothes_winter_coat', 'clothes', 'Kış montu', 20),
  ('ccolor_blue', 'ccolor', 'Mavi', 0),
  ('ccolor_red', 'ccolor', 'Kırmızı', 0),
  ('ccolor_gray', 'ccolor', 'Gri', 0),
  ('ccolor_navy', 'ccolor', 'Lacivert', 0),
  ('ccolor_white', 'ccolor', 'Beyaz', 0),
  ('ccolor_black', 'ccolor', 'Siyah', 0),
  ('ccolor_sky', 'ccolor', 'Açık mavi', 10),
  ('ccolor_mint', 'ccolor', 'Nane yeşili', 10),
  ('ccolor_pink', 'ccolor', 'Pembe', 10),
  ('ccolor_lemon', 'ccolor', 'Limon', 10),
  ('ccolor_ice', 'ccolor', 'Buz mavisi', 10),
  ('ccolor_smoke', 'ccolor', 'Duman', 10),
  ('ccolor_fuchsia', 'ccolor', 'Fuşya', 15),
  ('ccolor_green', 'ccolor', 'Yeşil', 15),
  ('ccolor_purple', 'ccolor', 'Mor', 15),
  ('ccolor_orange', 'ccolor', 'Turuncu', 15),
  ('ccolor_gold', 'ccolor', 'Altın', 30),
  ('face_smile', 'face', 'Gülümseme', 0),
  ('face_bigsmile', 'face', 'Kocaman gülüş', 10),
  ('face_wink', 'face', 'Göz kırpma', 10),
  ('face_tongue', 'face', 'Dil çıkarma', 15),
  ('face_surprised', 'face', 'Şaşkın', 15),
  ('face_hearts', 'face', 'Kalp gözler', 30),
  ('face_stars', 'face', 'Yıldız gözler', 35),
  ('face_smirk', 'face', 'Havalı yarım gülüş', 15),
  ('face_happy_closed', 'face', 'Mutlu kapalı gözler', 15),
  ('fshape_oval', 'fshape', 'Oval', 0),
  ('fshape_round', 'fshape', 'Tombul', 0),
  ('fshape_long', 'fshape', 'Uzun', 0),
  ('fshape_square', 'fshape', 'Köşeli', 0),
  ('fshape_heart', 'fshape', 'Sivri çene', 0),
  ('fshape_wide', 'fshape', 'Geniş', 0),
  ('ears_small', 'ears', 'Küçük', 0),
  ('ears_medium', 'ears', 'Orta', 0),
  ('ears_big', 'ears', 'Kepçe', 0),
  ('eyes_brown', 'eyes', 'Kahverengi', 0),
  ('eyes_dark', 'eyes', 'Koyu', 0),
  ('eyes_hazel', 'eyes', 'Ela', 0),
  ('eyes_green', 'eyes', 'Yeşil', 0),
  ('eyes_blue', 'eyes', 'Mavi', 0),
  ('eyes_gray', 'eyes', 'Gri', 0),
  ('eyes_purple', 'eyes', 'Mor', 10),
  ('eyes_gold', 'eyes', 'Altın', 15),
  ('eyes_red', 'eyes', 'Kırmızı', 15),
  ('cheek_none', 'cheek', 'Sade', 0),
  ('cheek_blush', 'cheek', 'Pembe yanak', 0),
  ('cheek_freckles', 'cheek', 'Çilli', 0),
  ('cheek_both', 'cheek', 'Çil ve allık', 0),
  ('mouth_expression', 'mouth', 'İfadeye göre', 0),
  ('mouth_smile', 'mouth', 'Kapalı gülümseme', 0),
  ('mouth_bigsmile', 'mouth', 'Dişli gülüş', 0),
  ('mouth_smirk', 'mouth', 'Yarım gülüş', 0),
  ('mouth_surprised', 'mouth', 'Yuvarlak ağız', 0),
  ('mouth_tongue', 'mouth', 'Dil çıkarma', 0),
  ('nose_original', 'nose', 'Klasik burun', 0),
  ('nose_button', 'nose', 'Yuvarlak burun', 0),
  ('nose_wide', 'nose', 'Geniş burun', 0),
  ('nose_straight', 'nose', 'Kısa düz burun', 0),
  ('brow_expression', 'brow', 'Klasik kaş', 0),
  ('brow_soft', 'brow', 'Yumuşak kavis', 0),
  ('brow_straight', 'brow', 'Düz kaş', 0),
  ('brow_bold', 'brow', 'Kalın kaş', 0),
  ('eshape_expression', 'eshape', 'Klasik göz', 0),
  ('eshape_round', 'eshape', 'Yuvarlak göz', 0),
  ('eshape_almond', 'eshape', 'Badem göz', 0),
  ('eshape_gentle', 'eshape', 'Yumuşak göz', 0),
  ('eshape_sparkle', 'eshape', 'İri parlak göz', 0),
  ('eshape_upturned', 'eshape', 'Uçları yukarı göz', 0),
  ('pose_side', 'pose', 'Yanımda', 0),
  ('pose_shoulder', 'pose', 'Omzumda', 0),
  ('pose_hug', 'pose', 'Kucağımda', 0),
  ('pose_peek', 'pose', 'Arkamdan bakıyor', 0),
  ('pose_head', 'pose', 'Başımda', 10),
  ('bg_polka', 'bg', 'Puantiye', 10),
  ('bg_checker', 'bg', 'Damalı', 10),
  ('bg_sky', 'bg', 'Gökyüzü', 10),
  ('bg_grass', 'bg', 'Çimen', 15),
  ('bg_sunset', 'bg', 'Gün batımı', 15),
  ('bg_sea', 'bg', 'Deniz', 15),
  ('bg_board', 'bg', 'Kara tahta', 15),
  ('bg_forest', 'bg', 'Orman', 20),
  ('bg_snow', 'bg', 'Kar', 20),
  ('bg_desert', 'bg', 'Çöl', 20),
  ('bg_autumn', 'bg', 'Sonbahar', 20),
  ('bg_candy', 'bg', 'Şeker', 25),
  ('bg_mountain', 'bg', 'Dağlar', 25),
  ('bg_night', 'bg', 'Yıldızlı gece', 30),
  ('bg_bubbles', 'bg', 'Pembe baloncuk', 30),
  ('bg_under', 'bg', 'Su altı', 35),
  ('bg_space', 'bg', 'Uzay', 40),
  ('bg_lava', 'bg', 'Volkan', 45),
  ('bg_rainbow', 'bg', 'Gökkuşağı', 55),
  ('bg_gold', 'bg', 'Altın', 70),
  ('pet_fox', 'pet', 'Tilki', 0),
  ('pet_cat', 'pet', 'Kedi', 0),
  ('pet_dog', 'pet', 'Köpek', 0),
  ('pet_bear', 'pet', 'Ayı', 0),
  ('pet_rabbit', 'pet', 'Tavşan', 0),
  ('pet_panda', 'pet', 'Panda', 0),
  ('pet_frog', 'pet', 'Kurbağa', 0),
  ('pet_lion', 'pet', 'Aslan', 0),
  ('pet_chick', 'pet', 'Civciv', 0),
  ('pet_pig', 'pet', 'Domuz', 0),
  ('pet_tiger', 'pet', 'Kaplan', 15),
  ('pet_monkey', 'pet', 'Maymun', 15),
  ('pet_mouse', 'pet', 'Fare', 15),
  ('pet_hamster', 'pet', 'Hamster', 15),
  ('pet_cow', 'pet', 'İnek', 15),
  ('pet_owl', 'pet', 'Baykuş', 15),
  ('pet_penguin', 'pet', 'Penguen', 15),
  ('pet_chicken', 'pet', 'Tavuk', 15),
  ('pet_duck', 'pet', 'Ördek', 15),
  ('pet_koala', 'pet', 'Koala', 20),
  ('pet_wolf', 'pet', 'Kurt', 20),
  ('pet_raccoon', 'pet', 'Rakun', 20),
  ('pet_horse', 'pet', 'At', 20),
  ('pet_zebra', 'pet', 'Zebra', 20),
  ('pet_polar', 'pet', 'Kutup ayısı', 20),
  ('pet_boar', 'pet', 'Yaban domuzu', 20),
  ('pet_blackcat', 'pet', 'Kara kedi', 20),
  ('pet_poodle', 'pet', 'Kaniş', 20),
  ('pet_hedgehog', 'pet', 'Kirpi', 20),
  ('pet_chipmunk', 'pet', 'Sincap', 20),
  ('pet_turtle', 'pet', 'Kaplumbağa', 20),
  ('pet_snail', 'pet', 'Salyangoz', 20),
  ('pet_bee', 'pet', 'Arı', 20),
  ('pet_ladybug', 'pet', 'Uğur böceği', 20),
  ('pet_butterfly', 'pet', 'Kelebek', 20),
  ('pet_fish', 'pet', 'Tropik balık', 20),
  ('pet_blowfish', 'pet', 'Balon balığı', 20),
  ('pet_crab', 'pet', 'Yengeç', 20),
  ('pet_goat', 'pet', 'Keçi', 20),
  ('pet_ewe', 'pet', 'Kuzu', 20),
  ('pet_rooster', 'pet', 'Horoz', 20),
  ('pet_parrot', 'pet', 'Papağan', 25),
  ('pet_flamingo', 'pet', 'Flamingo', 25),
  ('pet_dove', 'pet', 'Güvercin', 25),
  ('pet_swan', 'pet', 'Kuğu', 25),
  ('pet_eagle', 'pet', 'Kartal', 25),
  ('pet_octopus', 'pet', 'Ahtapot', 25),
  ('pet_dolphin', 'pet', 'Yunus', 25),
  ('pet_whale', 'pet', 'Balina', 25),
  ('pet_seal', 'pet', 'Fok', 25),
  ('pet_otter', 'pet', 'Su samuru', 25),
  ('pet_beaver', 'pet', 'Kunduz', 25),
  ('pet_skunk', 'pet', 'Kokarca', 25),
  ('pet_badger', 'pet', 'Porsuk', 25),
  ('pet_sloth', 'pet', 'Tembel hayvan', 25),
  ('pet_kangaroo', 'pet', 'Kanguru', 25),
  ('pet_llama', 'pet', 'Lama', 25),
  ('pet_camel', 'pet', 'Deve', 25),
  ('pet_deer', 'pet', 'Geyik', 25),
  ('pet_moose', 'pet', 'Sığın', 30),
  ('pet_bat', 'pet', 'Yarasa', 30),
  ('pet_giraffe', 'pet', 'Zürafa', 30),
  ('pet_elephant', 'pet', 'Fil', 30),
  ('pet_hippo', 'pet', 'Su aygırı', 30),
  ('pet_rhino', 'pet', 'Gergedan', 30),
  ('pet_gorilla', 'pet', 'Goril', 30),
  ('pet_orangutan', 'pet', 'Orangutan', 30),
  ('pet_leopard', 'pet', 'Leopar', 30),
  ('pet_bison', 'pet', 'Bizon', 30),
  ('pet_croc', 'pet', 'Timsah', 30),
  ('pet_lizard', 'pet', 'Kertenkele', 30),
  ('pet_shark', 'pet', 'Köpekbalığı', 35),
  ('pet_peacock', 'pet', 'Tavus kuşu', 35),
  ('pet_jelly', 'pet', 'Denizanası', 35),
  ('pet_dodo', 'pet', 'Dodo', 40),
  ('pet_mammoth', 'pet', 'Mamut', 45),
  ('pet_trex', 'pet', 'T-Rex', 45),
  ('pet_sauropod', 'pet', 'Uzun boyunlu dinozor', 45),
  ('pet_unicorn', 'pet', 'Unicorn', 50),
  ('pet_dragon', 'pet', 'Ejderha', 55),
  ('pet_phoenix', 'pet', 'Anka kuşu', 60),
  ('pet_robot', 'pet', 'Robot', 40),
  ('pet_alien', 'pet', 'Uzaylı', 40),
  ('pet_invader', 'pet', 'Uzay canavarı', 40),
  ('pet_ghost', 'pet', 'Hayalet', 35),
  ('pet_pumpkin', 'pet', 'Balkabağı', 30),
  ('pet_snowman', 'pet', 'Kardan adam', 35),
  ('pet_sun', 'pet', 'Güneş', 45),
  ('pet_moon', 'pet', 'Dolunay', 45);

create function odev_private.session_student(p_token text) returns uuid
language plpgsql stable set search_path = public as $$
declare
  v_id uuid;
begin
  select student_id into v_id from public.student_sessions
  where token = p_token and expires_at > statement_timestamp();
  if not found then raise exception 'OTURUM_YOK'; end if;
  return v_id;
end;
$$;

-- Internal helpers are revoked from API roles by the migration footer.
create or replace function odev_private.balance(p_student_id uuid)
returns bigint
language sql stable security definer set search_path = public
as $$
  select coalesce((select sum(s.stars_earned)::bigint from public.submissions s where s.student_id = p_student_id), 0)
       + coalesce((select s.stars_bonus::bigint from public.students s where s.id = p_student_id), 0)
       - coalesce((select sum(i.price)::bigint from public.purchases p join public.shop_items i on i.id = p.item_id where p.student_id = p_student_id), 0);
$$;

create or replace function odev_private.owned(p_student_id uuid)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select coalesce(jsonb_agg(p.item_id order by p.item_id), '[]'::jsonb)
  from public.purchases p where p.student_id = p_student_id;
$$;

-- Store only student-facing feedback so later edits preserve the original grade.
create function odev_private.result(p_submission public.submissions)
returns jsonb language sql immutable set search_path = public as $$
  select jsonb_build_object('correct', p_submission.correct, 'total', p_submission.total,
    'stars_earned', p_submission.stars_earned, 'items', p_submission.result_items);
$$;

create or replace function public.roster(p_class_code text)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  v_class public.classes%rowtype;
begin
  select * into v_class from public.classes where code = p_class_code;
  if not found then
    raise exception 'SINIF_YOK';
  end if;
  return jsonb_build_object(
    'class', jsonb_build_object('name', v_class.name),
    'students', (select coalesce(jsonb_agg(jsonb_build_object(
      'id', s.id, 'display_name', s.display_name, 'animal', s.animal,
      'grade', s.grade, 'equipped', s.equipped, 'has_pin', s.pin is not null
    ) order by s.display_name, s.id), '[]'::jsonb)
    from public.students s where s.class_id = v_class.id)
  );
end;
$$;

create or replace function public.student_home(p_token text)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  v_student_id uuid;
  v_student public.students%rowtype;
  v_assignment public.assignments%rowtype;
  v_submission public.submissions%rowtype;
  v_assignment_json jsonb := null;
  v_result jsonb := null;
begin
  v_student_id := odev_private.session_student(p_token);
  select * into v_student from public.students where id = v_student_id;
  if not found then
    raise exception 'OTURUM_YOK';
  end if;

  select * into v_assignment from public.assignments a
  where a.class_id = v_student.class_id and a.grade = v_student.grade
    and now() between a.opens_at and a.closes_at
  order by a.opens_at desc, a.created_at desc, a.id desc limit 1;
  if found then
    v_assignment_json := jsonb_build_object(
      'id', v_assignment.id, 'title', v_assignment.title, 'closes_at', v_assignment.closes_at,
      'questions', (select coalesce(jsonb_agg(jsonb_build_object(
        'id', q.value ->> 'id', 'type', q.value ->> 'type',
        'text', q.value ->> 'text', 'options', q.value -> 'options'
      ) order by q.ordinality), '[]'::jsonb)
      from jsonb_array_elements(v_assignment.questions) with ordinality as q(value, ordinality))
    );
    select * into v_submission from public.submissions
    where assignment_id = v_assignment.id and student_id = v_student_id;
    if found then
      v_result := odev_private.result(v_submission);
    end if;
  end if;

  return jsonb_build_object(
    'me', jsonb_build_object(
      'id', v_student.id, 'display_name', v_student.display_name,
      'animal', v_student.animal, 'grade', v_student.grade,
      'stars', odev_private.balance(v_student_id), 'equipped', v_student.equipped
    ),
    'owned', odev_private.owned(v_student_id),
    'assignment', v_assignment_json,
    'my_result', v_result,
    'past', (select coalesce(jsonb_agg(jsonb_build_object(
      'title', a.title, 'correct', s.correct, 'total', s.total,
      'stars_earned', s.stars_earned, 'created_at', s.created_at
    ) order by s.created_at desc, s.id desc), '[]'::jsonb)
    from public.submissions s join public.assignments a on a.id = s.assignment_id
    where s.student_id = v_student_id and a.id is distinct from v_assignment.id),
    'classmates', (select coalesce(jsonb_agg(jsonb_build_object(
      'id', s.id, 'display_name', s.display_name, 'animal', s.animal, 'equipped', s.equipped
    ) order by s.display_name, s.id), '[]'::jsonb)
    from public.students s where s.class_id = v_student.class_id and s.id <> v_student_id),
    'goal', (select jsonb_build_object(
      'target', c.goal_target, 'reward', c.goal_reward,
      'current', coalesce((select sum(s.stars_earned)::bigint from public.submissions s
        join public.students st on st.id = s.student_id where st.class_id = c.id), 0)
        + coalesce((select sum(st.stars_bonus)::bigint from public.students st where st.class_id = c.id), 0)
    ) from public.classes c where c.id = v_student.class_id)
  );
end;
$$;

-- Serialize mutations per student, including purchases, paper credit and PIN reset.
-- Check the token again after the lock in case a reset just revoked it.
create function odev_private.lock_student(p_token text) returns public.students
language plpgsql set search_path = public as $$
declare
  v_student public.students;
begin
  select * into strict v_student from public.students
  where id = odev_private.session_student(p_token) for update;
  perform odev_private.session_student(p_token);
  return v_student;
exception when no_data_found then
  raise exception 'OTURUM_YOK';
end;
$$;

create function public.student_login(p_class_code text, p_student_id uuid, p_pin text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_student public.students;
  v_now timestamptz;
  v_count integer;
  v_first timestamptz;
  v_last timestamptz;
  v_error text;
  v_token text;
begin
  select s.* into v_student from public.students s
  join public.classes c on c.id = s.class_id
  where c.code = p_class_code and s.id = p_student_id for update of s;
  if not found then raise exception 'PIN_HATALI'; end if;
  v_now := clock_timestamp();

  -- Five failures within ten minutes lock the account until ten minutes after the fifth.
  select count(*), min(at), max(at) into v_count, v_first, v_last
  from (select at from public.login_attempts where student_id = p_student_id
        order by at desc limit 5) recent;
  if v_count = 5 and v_last - v_first <= interval '10 minutes'
     and v_now < v_last + interval '10 minutes' then
    raise exception using errcode = 'PT429', message = 'KILITLI';
  end if;
  delete from public.login_attempts where student_id = p_student_id
    and at <= v_now - interval '10 minutes';

  if p_pin is null or p_pin !~ '^[0-9]{4}$'
     or (v_student.pin is not null and v_student.pin <> p_pin) then
    insert into public.login_attempts(student_id, at) values (p_student_id, v_now);
    select count(*) into v_count from public.login_attempts where student_id = p_student_id;
    v_error := case when v_count >= 5 then 'KILITLI' else 'PIN_HATALI' end;
    -- RAISE would roll back the attempt. PostgREST forwards this as an HTTP error.
    perform set_config('response.status', case when v_count >= 5 then '429' else '403' end, true);
    return jsonb_build_object('code', v_error, 'message', v_error);
  end if;

  if v_student.pin is null then
    update public.students set pin = p_pin where id = p_student_id;
  end if;
  delete from public.student_sessions where student_id = p_student_id and expires_at <= v_now;
  v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  insert into public.student_sessions(token, student_id, expires_at)
    values (v_token, p_student_id, v_now + interval '60 days');
  return jsonb_build_object('token', v_token);
end;
$$;

create function public.submit_assignment(p_token text, p_assignment_id uuid, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_student public.students;
  v_set public.assignments;
  v_submission public.submissions;
  v_total integer;
  v_correct integer;
  v_items jsonb;
begin
  v_student := odev_private.lock_student(p_token);
  select * into v_set from public.assignments where id = p_assignment_id
    and class_id = v_student.class_id and grade = v_student.grade for share;
  if not found or clock_timestamp() not between v_set.opens_at and v_set.closes_at then
    raise exception 'SET_KAPALI';
  end if;
  if exists (select from public.submissions where student_id = v_student.id
             and assignment_id = v_set.id) then raise exception 'ZATEN_GONDERILDI'; end if;

  v_total := jsonb_array_length(v_set.questions);
  if jsonb_typeof(p_answers) is distinct from 'object' then raise exception 'CEVAP_GECERSIZ'; end if;
  if (select count(*) from jsonb_object_keys(p_answers)) <> v_total or exists (
    select from jsonb_array_elements(v_set.questions) q
    where not exists (select from generate_series(0, jsonb_array_length(q->'options') - 1) idx
                      where p_answers->(q->>'id') = to_jsonb(idx))
  ) then raise exception 'CEVAP_GECERSIZ'; end if;

  -- Kullanıcı kararı: gönderimden sonra doğru şık ve açıklama çocuğa gösterilir (tek gönderim hakkı var).
  select count(*) filter (where ok), jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
    'id', id, 'given', given, 'answer', answer, 'ok', ok, 'explanation', explanation
  )) order by pos) into v_correct, v_items
  from (
    select q->>'id' as id, p_answers->(q->>'id') as given, q->'answer' as answer,
      nullif(q->>'explanation', '') as explanation,
      p_answers->(q->>'id') = q->'answer' as ok, pos
    from jsonb_array_elements(v_set.questions) with ordinality as questions(q, pos)
  ) graded;
  insert into public.submissions(assignment_id, student_id, answers, correct, total, stars_earned, source, result_items)
    values (v_set.id, v_student.id, p_answers, v_correct, v_total, 10 + v_correct, 'online', v_items)
    on conflict (assignment_id, student_id) do nothing returning * into v_submission;
  if not found then raise exception 'ZATEN_GONDERILDI'; end if;
  return odev_private.result(v_submission);
end;
$$;

create function public.buy_item(p_token text, p_item_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_student public.students;
  v_price integer;
  v_stars bigint;
begin
  v_student := odev_private.lock_student(p_token);
  select price into v_price from public.shop_items where id = p_item_id for share;
  if not found then raise exception 'ESYA_YOK'; end if;
  v_stars := odev_private.balance(v_student.id);
  if not exists (select from public.purchases where student_id = v_student.id and item_id = p_item_id) then
    if v_stars < v_price then raise exception 'YETERSIZ_YILDIZ'; end if;
    insert into public.purchases(student_id, item_id) values (v_student.id, p_item_id);
    v_stars := v_stars - v_price;
  end if;
  return jsonb_build_object('stars', v_stars, 'owned', odev_private.owned(v_student.id));
end;
$$;

create function public.equip_item(p_token text, p_slot text, p_item_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_student public.students;
  v_equipped jsonb;
begin
  v_student := odev_private.lock_student(p_token);
  if p_slot is null or p_slot not in ('skin', 'hair', 'hcolor', 'hat', 'glasses', 'clothes', 'ccolor', 'face', 'fshape', 'ears', 'eyes', 'cheek', 'mouth', 'nose', 'brow', 'eshape', 'pose', 'bg', 'pet') then
    raise exception 'YUVA_GECERSIZ';
  end if;
  if p_item_id is null then
    v_equipped := v_student.equipped - p_slot;
  else
    if not exists (select from public.purchases p join public.shop_items i on i.id = p.item_id
                   where p.student_id = v_student.id and i.id = p_item_id and i.slot = p_slot) then
      raise exception 'ESYA_TAKILAMAZ';
    end if;
    v_equipped := v_student.equipped || jsonb_build_object(p_slot, p_item_id);
  end if;
  update public.students set equipped = v_equipped where id = v_student.id;
  return jsonb_build_object('equipped', v_equipped);
end;
$$;

create function public.teacher_add_paper(p_assignment_id uuid, p_student_id uuid, p_correct int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_student public.students;
  v_total integer;
begin
  select s.* into v_student from public.students s join public.classes c on c.id = s.class_id
  where s.id = p_student_id and c.teacher_id = auth.uid() for update of s for share of c;
  if not found then raise exception 'YETKISIZ'; end if;
  select jsonb_array_length(questions) into v_total from public.assignments where id = p_assignment_id
    and class_id = v_student.class_id and grade = v_student.grade for share;
  if not found then raise exception 'SET_BULUNAMADI'; end if;
  if p_correct is null or p_correct not between 0 and v_total then raise exception 'PUAN_GECERSIZ'; end if;
  insert into public.submissions(assignment_id, student_id, answers, correct, total, stars_earned, source)
    values (p_assignment_id, p_student_id, '{}'::jsonb, p_correct, v_total, 10 + p_correct, 'kagit')
    on conflict (assignment_id, student_id) do nothing;
  if not found then raise exception 'ZATEN_GONDERILDI'; end if;
  return jsonb_build_object('correct', p_correct, 'total', v_total, 'stars_earned', 10 + p_correct);
end;
$$;

create function public.teacher_reset_pin(p_student_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform 1 from public.students s join public.classes c on c.id = s.class_id
    where s.id = p_student_id and c.teacher_id = auth.uid() for update of s for share of c;
  if not found then raise exception 'YETKISIZ'; end if;
  update public.students set pin = null where id = p_student_id;
  delete from public.student_sessions where student_id = p_student_id;
  delete from public.login_attempts where student_id = p_student_id;
end;
$$;

create function public.teacher_star_balances(p_class_id uuid)
returns table(student_id uuid, stars bigint) language sql stable security definer set search_path = public as $$
  select s.id, odev_private.balance(s.id) from public.students s
  join public.classes c on c.id = s.class_id
  where s.class_id = p_class_id and c.teacher_id = auth.uid();
$$;

-- PostgreSQL grants EXECUTE to PUBLIC by default. Supabase can also grant it
-- directly to API roles. Clear both forms before granting individual RPCs.
revoke all on all functions in schema odev_private from public, anon, authenticated;
grant usage on schema odev_private to authenticated;
grant execute on function odev_private.valid_questions(jsonb) to authenticated;

revoke all on function public.roster(text), public.student_login(text, uuid, text),
  public.student_home(text), public.submit_assignment(text, uuid, jsonb),
  public.buy_item(text, text), public.equip_item(text, text, text),
  public.teacher_add_paper(uuid, uuid, integer), public.teacher_reset_pin(uuid),
  public.teacher_star_balances(uuid) from public, anon, authenticated;
grant execute on function public.teacher_star_balances(uuid) to authenticated;
grant execute on function public.roster(text), public.student_login(text, uuid, text),
  public.student_home(text), public.submit_assignment(text, uuid, jsonb),
  public.buy_item(text, text), public.equip_item(text, text, text) to anon;
grant execute on function public.teacher_add_paper(uuid, uuid, integer), public.teacher_reset_pin(uuid) to authenticated;

commit;

-- Gerçek sınıf kaydı. Öğrenciler ve ödevler öğretmen panelinden eklenir.
-- Öğretmen: Authentication > Users'taki TEK kullanıcı. Kullanıcı yoksa ya da birden fazlaysa durur.
do $$
declare v_teacher uuid; v_count int;
begin
  select count(*), min(id::text)::uuid into v_count, v_teacher from auth.users;
  if v_count <> 1 then
    raise exception 'Önce Authentication > Users bölümünde tek bir öğretmen kullanıcısı olmalı (şu an: %).', v_count;
  end if;
  insert into public.classes (name, code, teacher_id, goal_target, goal_reward)
  values ('3-4. Sınıf', 'DOGANLI', v_teacher, 300, 'Pazartesi 15 dakika oyun!')
  on conflict (code) do nothing;
end $$;
