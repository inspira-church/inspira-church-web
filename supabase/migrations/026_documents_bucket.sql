-- Inspira Church · 026 · Bucket "documents"
--
-- La política de privacidad / tratamiento de datos pasa de ser un link
-- externo pegado a mano a un PDF subido desde /admin/contacto. Bucket
-- nuevo (no se reutiliza "site", que es para fotos/video del hero) —
-- lectura pública, solo PDF, 10 MB. Escritura restringida a `is_admin()`
-- (no `is_editor_or_admin()`) porque `/admin/contacto` ya es adminOnly en
-- el nav y su RLS de escritura en site_settings ya usa ese mismo gate más
-- estricto — ver CLAUDE.md, sección "Roles y permisos".

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', true, 10485760, array['application/pdf'])
on conflict (id) do nothing;

create policy documents_public_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'documents');

create policy documents_admin_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'documents' and public.is_admin());

create policy documents_admin_update on storage.objects
  for update to authenticated using (bucket_id = 'documents' and public.is_admin());

create policy documents_admin_delete on storage.objects
  for delete to authenticated using (bucket_id = 'documents' and public.is_admin());
