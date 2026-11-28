-- Elimde yuvası. Önceki takılı eşyalar ve alımlar korunur.
begin;

alter table public.shop_items drop constraint if exists shop_items_slot_check;
alter table public.shop_items add constraint shop_items_slot_check
  check (slot in ('skin', 'hair', 'hcolor', 'hat', 'glasses', 'clothes', 'ccolor', 'face', 'fshape', 'ears', 'eyes', 'cheek', 'mouth', 'nose', 'brow', 'eshape', 'pose', 'bg', 'pet', 'held'));

insert into public.shop_items (id, slot, name, price) values
  ('held_football', 'held', 'Futbol topu', 15),
  ('held_book', 'held', 'Hikâye kitabı', 18),
  ('held_toycar', 'held', 'Tahta araba', 20),
  ('held_flower', 'held', 'Papatya demeti', 22),
  ('held_kite', 'held', 'Uçurtma', 25)
on conflict (id) do update set name = excluded.name, price = excluded.price;

create or replace function public.equip_item(p_token text, p_slot text, p_item_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_student public.students;
  v_equipped jsonb;
begin
  v_student := odev_private.lock_student(p_token);
  if p_slot is null or p_slot not in ('skin', 'hair', 'hcolor', 'hat', 'glasses', 'clothes', 'ccolor', 'face', 'fshape', 'ears', 'eyes', 'cheek', 'mouth', 'nose', 'brow', 'eshape', 'pose', 'bg', 'pet', 'held') then
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

revoke all on function public.equip_item(text, text, text) from public, anon, authenticated;
grant execute on function public.equip_item(text, text, text) to anon;

commit;
