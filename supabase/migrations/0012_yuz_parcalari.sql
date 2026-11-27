-- Burun, kaş biçimi ve göz biçimi ayrı seçilebilir yüz yuvaları olsun.
-- Mevcut öğrencilerin görünümleri, sahiplikleri ve alımları korunur.
begin;

alter table public.shop_items drop constraint if exists shop_items_slot_check;
alter table public.shop_items add constraint shop_items_slot_check
  check (slot in ('skin', 'hair', 'hcolor', 'hat', 'glasses', 'clothes', 'ccolor', 'face', 'fshape', 'ears', 'eyes', 'cheek', 'mouth', 'nose', 'brow', 'eshape', 'pose', 'bg', 'pet'));

insert into public.shop_items (id, slot, name, price) values
  ('nose_original', 'nose', 'Klasik burun', 0),
  ('nose_button', 'nose', 'Yuvarlak burun', 0),
  ('nose_wide', 'nose', 'Geniş burun', 0),
  ('nose_straight', 'nose', 'Kısa düz burun', 0),
  ('brow_expression', 'brow', 'İfadeye göre', 0),
  ('brow_soft', 'brow', 'Yumuşak kavis', 0),
  ('brow_straight', 'brow', 'Düz kaş', 0),
  ('brow_bold', 'brow', 'Kalın kaş', 0),
  ('eshape_expression', 'eshape', 'İfadeye göre', 0),
  ('eshape_round', 'eshape', 'Yuvarlak göz', 0),
  ('eshape_almond', 'eshape', 'Badem göz', 0),
  ('eshape_gentle', 'eshape', 'Yumuşak göz', 0)
on conflict (id) do update set slot = excluded.slot, name = excluded.name, price = excluded.price;

create or replace function public.equip_item(p_token text, p_slot text, p_item_id text)
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

revoke all on function public.equip_item(text, text, text) from public, anon, authenticated;
grant execute on function public.equip_item(text, text, text) to anon;

commit;
