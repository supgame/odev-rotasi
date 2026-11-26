-- Dükkan kataloğu herkese açık (yalnız okuma): öğrenci sayfası anon anahtarla okur.
grant select on public.shop_items to anon;
create policy anon_shop on public.shop_items for select to anon using (true);
