-- Mevcut seçimler ve alımlar korunur.
insert into public.shop_items (id, slot, name, price) values
  ('brow_expression', 'brow', 'Klasik kaş', 0),
  ('eshape_expression', 'eshape', 'Klasik göz', 0),
  ('eshape_sparkle', 'eshape', 'İri parlak göz', 0),
  ('eshape_upturned', 'eshape', 'Uçları yukarı göz', 0)
on conflict (id) do update set name = excluded.name, price = excluded.price;
