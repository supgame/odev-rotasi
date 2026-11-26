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
  slot text not null check (slot in ('hat','glasses','neck','bg')),
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
  -- src/data/shopItems.ts ile aynı olmalı (avatar çizimleri bu id'lere bağlı).
  ('hat_party', 'hat', 'Parti şapkası', 10),
  ('hat_cap', 'hat', 'Kasket', 20),
  ('hat_wizard', 'hat', 'Büyücü şapkası', 45),
  ('hat_crown', 'hat', 'Taç', 60),
  ('glasses_round', 'glasses', 'Yuvarlak gözlük', 10),
  ('glasses_sun', 'glasses', 'Güneş gözlüğü', 25),
  ('glasses_star', 'glasses', 'Yıldız gözlük', 35),
  ('neck_bow', 'neck', 'Papyon', 10),
  ('neck_scarf', 'neck', 'Atkı', 20),
  ('neck_medal', 'neck', 'Madalya', 50),
  ('bg_sky', 'bg', 'Gökyüzü', 10),
  ('bg_grass', 'bg', 'Çimen', 15),
  ('bg_space', 'bg', 'Uzay', 40),
  ('bg_rainbow', 'bg', 'Gökkuşağı', 55);

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
      'grade', s.grade, 'has_pin', s.pin is not null
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
  if p_slot is null or p_slot not in ('hat', 'glasses', 'neck', 'bg') then
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
