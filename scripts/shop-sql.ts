// Dükkan kataloğunu SQL'e çevirir: node scripts/shop-sql.ts > supabase/migrations/000X_....sql
import { ITEMS, SPECIES, charItemId } from '../src/avatar/catalog.ts'

const q = (s: string) => `'${s.replace(/'/g, "''")}'`
const rows = [
  ...SPECIES.map((s) => [charItemId(s.id), 'char', s.name, s.price] as const),
  ...ITEMS.map((i) => [i.id, i.slot, i.name, i.price] as const),
]
console.log(`-- Avatar kataloğu (scripts/shop-sql.ts ile src/avatar/catalog.ts'den üretildi). Tekrar çalıştırılabilir.
alter table public.shop_items drop constraint if exists shop_items_slot_check;
alter table public.shop_items add constraint shop_items_slot_check check (slot in ('char','hat','glasses','neck','bg'));

create or replace function public.equip_item(p_token text, p_slot text, p_item_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_student public.students;
  v_equipped jsonb;
begin
  v_student := odev_private.lock_student(p_token);
  if p_slot is null or p_slot not in ('char', 'hat', 'glasses', 'neck', 'bg') then
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

insert into public.shop_items (id, slot, name, price) values
${rows.map((r) => `  (${q(r[0])}, ${q(r[1])}, ${q(r[2])}, ${r[3]})`).join(',\n')}
on conflict (id) do update set slot = excluded.slot, name = excluded.name, price = excluded.price;`)
