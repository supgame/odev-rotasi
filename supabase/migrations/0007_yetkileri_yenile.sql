-- 27 Kas 2026: canlıda "permission denied for function roster" çıktı (anon rolün EXECUTE yetkisi gitmiş).
-- 0001'deki yetki bloğunun aynısı; tekrar çalıştırılabilir, veri değiştirmez.
grant usage on schema public to anon, authenticated;
grant usage on schema odev_private to authenticated;
grant execute on function odev_private.valid_questions(jsonb) to authenticated;

grant select, insert, update, delete on public.classes, public.students, public.assignments to authenticated;
grant select on public.submissions, public.shop_items to authenticated;
grant select on public.shop_items to anon;

grant execute on function public.roster(text), public.student_login(text, uuid, text),
  public.student_home(text), public.submit_assignment(text, uuid, jsonb),
  public.buy_item(text, text), public.equip_item(text, text, text) to anon;
grant execute on function public.teacher_star_balances(uuid),
  public.teacher_add_paper(uuid, uuid, integer), public.teacher_reset_pin(uuid) to authenticated;
