// Dükkan kataloğunu SQL'e çevirir: node scripts/shop-sql.ts > supabase/migrations/000X_....sql
import { ITEMS, SPECIES, petItemId } from '../src/avatar/catalog.ts'

const q = (s: string) => `'${s.replace(/'/g, "''")}'`
const rows = [
  ...ITEMS.map((i) => [i.id, i.slot, i.name, i.price] as const),
  ...SPECIES.map((s) => [petItemId(s.id), 'pet', s.name, s.price] as const),
]
const SLOTS = [...new Set(rows.map((r) => r[1]))].map(q).join(', ')
const ids = rows.map((r) => q(r[0])).join(', ')
console.log(`-- Avatar kataloğu (scripts/shop-sql.ts ile src/avatar/catalog.ts'den üretildi). Tekrar çalıştırılabilir.
-- Katalogdan kalkan eşyalar: önce takılı olanları çıkar, alımları sil (yıldızı geri döner), sonra eşyayı sil.
alter table public.shop_items drop constraint if exists shop_items_slot_check;
insert into public.shop_items (id, slot, name, price) values
${rows.map((r) => `  (${q(r[0])}, ${q(r[1])}, ${q(r[2])}, ${r[3]})`).join(',\n')}
on conflict (id) do update set slot = excluded.slot, name = excluded.name, price = excluded.price;

-- Eski "karakter" (char_X) alımı ve takılısı, aynı hayvanın arkadaş (pet_X) hâline geçer.
insert into public.purchases (student_id, item_id)
  select p.student_id, 'pet_' || substr(p.item_id, 6) from public.purchases p
  where p.item_id like 'char\_%' and exists (select from public.shop_items i where i.id = 'pet_' || substr(p.item_id, 6))
on conflict do nothing;
update public.students set equipped = (equipped - 'char') || jsonb_build_object('pet', 'pet_' || substr(equipped->>'char', 6))
  where equipped ? 'char' and exists (select from public.shop_items i where i.id = 'pet_' || substr(equipped->>'char', 6));
update public.students s set equipped = coalesce((select jsonb_object_agg(k, v) from jsonb_each(s.equipped) e(k, v)
  where v #>> '{}' in (${ids})), '{}'::jsonb);
delete from public.purchases where item_id not in (${ids});
delete from public.shop_items where id not in (${ids});
alter table public.shop_items drop constraint if exists shop_items_slot_check;
alter table public.shop_items add constraint shop_items_slot_check check (slot in (${SLOTS}));

create or replace function public.equip_item(p_token text, p_slot text, p_item_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_student public.students;
  v_equipped jsonb;
begin
  v_student := odev_private.lock_student(p_token);
  if p_slot is null or p_slot not in (${SLOTS}) then
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
`)
