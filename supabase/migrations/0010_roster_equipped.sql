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

grant execute on function public.roster(text) to anon, authenticated;
