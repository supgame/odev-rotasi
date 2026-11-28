-- Avatar v2, 1. gün: öğrenci cinsiyeti (kız/erkek). Yalnız başlangıç görünümünü ve dükkânda
-- "sana önerilenler" sırasını belirler; hiçbir eşyayı kilitlemez. Eski kayıtlarda null kalır,
-- görünüm bugünküyle aynı. Takılı eşyalar ve alımlar korunur.
begin;

alter table public.students add column if not exists gender text;
alter table public.students drop constraint if exists students_gender_check;
alter table public.students add constraint students_gender_check check (gender is null or gender in ('kiz', 'erkek'));

-- Kirpiksiz iki göz biçimi (erkek başlangıç havuzu; herkes alabilir).
insert into public.shop_items (id, slot, name, price) values
  ('eshape_plain', 'eshape', 'Sade göz', 0),
  ('eshape_plain_almond', 'eshape', 'Sade badem göz', 0)
on conflict (id) do update set name = excluded.name, price = excluded.price;

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
      'grade', s.grade, 'equipped', s.equipped, 'has_pin', s.pin is not null,
      'gender', s.gender
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
      'stars', odev_private.balance(v_student_id), 'equipped', v_student.equipped,
      'gender', v_student.gender
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
      'id', s.id, 'display_name', s.display_name, 'animal', s.animal, 'equipped', s.equipped,
      'gender', s.gender
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

-- Öğrenci kendi seçimini kaydeder (ilk girişte iki kart). Eşyalara dokunmaz.
create or replace function public.set_my_gender(p_token text, p_gender text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_student public.students;
begin
  if p_gender is null or p_gender not in ('kiz', 'erkek') then
    raise exception 'CINSIYET_GECERSIZ';
  end if;
  v_student := odev_private.lock_student(p_token);
  update public.students set gender = p_gender where id = v_student.id;
  return jsonb_build_object('gender', p_gender);
end;
$$;

revoke all on function public.roster(text), public.student_home(text), public.set_my_gender(text, text)
  from public, anon, authenticated;
grant execute on function public.roster(text) to anon, authenticated;
grant execute on function public.student_home(text) to anon;
grant execute on function public.set_my_gender(text, text) to anon;

commit;
