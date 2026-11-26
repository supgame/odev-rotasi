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
