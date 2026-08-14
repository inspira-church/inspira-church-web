-- Inspira Church · 011 · Buckets de Storage
--
-- Los cinco buckets documentados en supabase/README.md (Fase 2), creados por
-- SQL en vez de a mano en el dashboard, para que quede reproducible como el
-- resto del esquema. Todos son de lectura pública (son imágenes del sitio,
-- nada sensible) y escritura solo para staff autenticado.
--
-- file_size_limit y allowed_mime_types los aplica Supabase Storage en el
-- servidor antes de aceptar el archivo — es la validación real, no solo la
-- del formulario en el navegador (brief §22: "no permitir archivos
-- peligrosos").

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('sermons', 'sermons', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('events', 'events', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('pastors', 'pastors', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('groups', 'groups', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('site', 'site', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

do $$
declare
  bucket_id text;
begin
  foreach bucket_id in array '{sermons,events,pastors,groups,site}'::text[]
  loop
    execute format(
      'create policy %I on storage.objects for select to anon, authenticated using (bucket_id = %L)',
      bucket_id || '_public_read', bucket_id
    );
    execute format(
      'create policy %I on storage.objects for insert to authenticated with check (bucket_id = %L and public.is_editor_or_admin())',
      bucket_id || '_staff_insert', bucket_id
    );
    execute format(
      'create policy %I on storage.objects for update to authenticated using (bucket_id = %L and public.is_editor_or_admin())',
      bucket_id || '_staff_update', bucket_id
    );
    execute format(
      'create policy %I on storage.objects for delete to authenticated using (bucket_id = %L and public.is_editor_or_admin())',
      bucket_id || '_staff_delete', bucket_id
    );
  end loop;
end $$;
