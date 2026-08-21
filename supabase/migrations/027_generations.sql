-- Inspira Church · 027 · Generaciones editable + inscripción propia
--
-- Dos partes, sin relación entre sí:
--
-- 1) `generations_registrations`: formulario de inscripción propio de
--    /generaciones (ya no reutiliza /contacto). Recolecta datos de menores
--    de edad — mismo patrón de RLS que `prayer_requests` (el dato más
--    sensible del proyecto hasta ahora): insert abierto, select/update/
--    delete exclusivos de is_admin(). `data_consent` (tratamiento de
--    datos, obligatorio) e `image_consent` (uso de imagen, opcional) son
--    campos separados a propósito — la decisión que había quedado
--    pendiente de aprobación humana antes de tocar este esquema.
--
-- 2) Extiende `media_select_public_hero` (ver 018) para que el cliente
--    anon pueda leer las fotos nuevas de Generaciones (bucket 'site',
--    módulo con prefijo 'generaciones-'). El contenido de texto de la
--    página vive en site_settings (key='generaciones'), que ya es de
--    lectura pública desde 009 — no necesita política nueva.

create table public.generations_registrations (
  id uuid primary key default gen_random_uuid(),
  child_first_name text not null,
  child_last_name text not null,
  child_age smallint not null check (child_age between 0 and 17),
  child_school text,
  allergies text,
  area_interest text,
  guardian_name text not null,
  guardian_phone text not null,
  guardian_email text,
  emergency_contact_name text,
  emergency_contact_phone text,
  data_consent boolean not null check (data_consent = true),
  image_consent boolean not null default false,
  consent_at timestamptz not null default now(),
  privacy_policy_version text,
  status public.form_status not null default 'nueva',
  internal_notes text,
  created_at timestamptz not null default now()
);

create index generations_registrations_status_idx on public.generations_registrations (status);

alter table public.generations_registrations enable row level security;

create policy generations_registrations_insert_public
  on public.generations_registrations for insert
  to anon, authenticated
  with check (true);

-- Solo Administrador puede leer/editar/borrar — decisión explícita del
-- usuario (mismo nivel que prayer_requests.is_private), a diferencia del
-- resto de bandejas de formularios (Contactos, Grupos, Primera vez), que
-- son is_editor_or_admin().
create policy generations_registrations_select_admin
  on public.generations_registrations for select
  to authenticated
  using (public.is_admin());

create policy generations_registrations_update_admin
  on public.generations_registrations for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy generations_registrations_delete_admin
  on public.generations_registrations for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------

drop policy if exists media_select_public_hero on public.media;

create policy media_select_public_hero
  on public.media for select
  to anon, authenticated
  using (
    bucket = 'site'
    and (
      module like 'hero-slide-%'
      or module like 'generaciones-%'
      or module in ('primera-vez-hero', 'nosotros-hero', 'nosotros-essence')
    )
  );
