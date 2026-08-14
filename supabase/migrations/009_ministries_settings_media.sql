-- Inspira Church · 009 · ministries, site_settings, media

create table public.ministries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  leader_id uuid references public.team_members (id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.ministries
  for each row execute function public.set_updated_at();

alter table public.ministries enable row level security;

create policy ministries_select_public
  on public.ministries for select
  to anon, authenticated
  using (active = true);

create policy ministries_select_staff
  on public.ministries for select
  to authenticated
  using (public.is_editor_or_admin());

create policy ministries_insert
  on public.ministries for insert
  to authenticated
  with check (public.is_editor_or_admin());

create policy ministries_update
  on public.ministries for update
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy ministries_delete
  on public.ministries for delete
  to authenticated
  using (public.is_editor_or_admin());

-- -----------------------------------------------------------------------------
-- Configuración global del sitio como pares clave/valor: número de WhatsApp,
-- redes sociales, textos legales, mensaje de bienvenida, etc. Nada de lo que
-- vive aquí es sensible — todo está pensado para renderizarse en el sitio
-- público — por eso la lectura es abierta. La escritura es exclusiva de
-- Administrador: es "configuración crítica" según la tabla de permisos de
-- la Fase 1, el Editor no la toca.

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

create policy site_settings_select_public
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy site_settings_write_admin
  on public.site_settings for insert
  to authenticated
  with check (public.is_admin());

create policy site_settings_update_admin
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy site_settings_delete_admin
  on public.site_settings for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Metadatos de archivos en Supabase Storage. Las páginas públicas leen las
-- URLs guardadas directamente en cada tabla de contenido (sermons.thumbnail_url,
-- events.image_url, etc.) — esta tabla es solo para la biblioteca de medios
-- del panel (organizar, reutilizar, dar alt text), por eso es de uso interno.

create table public.media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null check (bucket in ('sermons', 'events', 'pastors', 'groups', 'site')),
  path text not null,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  alt_text text,
  module text,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index media_bucket_idx on public.media (bucket);

alter table public.media enable row level security;

create policy media_all_staff
  on public.media for select
  to authenticated
  using (public.is_editor_or_admin());

create policy media_insert_staff
  on public.media for insert
  to authenticated
  with check (public.is_editor_or_admin());

create policy media_update_staff
  on public.media for update
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy media_delete_staff
  on public.media for delete
  to authenticated
  using (public.is_editor_or_admin());
