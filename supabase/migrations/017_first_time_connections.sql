-- Inspira Church · 017 · Ficha de conexión "Primera vez"
--
-- Formulario público en /primera-vez ("Déjanos tus datos"), distinto de
-- contacts (formulario general de /contacto). Mismo patrón de seguridad que
-- 008_forms.sql: cualquiera inserta, solo el staff lee/edita/borra.

create table public.first_time_connections (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  gender text not null check (gender in ('hombre', 'mujer')),
  email text not null,
  phone text not null,
  message text,
  attends_other_church boolean not null default false,
  wants_call boolean not null default false,
  consent boolean not null check (consent = true),
  status public.form_status not null default 'nueva',
  assigned_to uuid references public.profiles (id) on delete set null,
  internal_notes text,
  created_at timestamptz not null default now()
);

create index first_time_connections_status_idx on public.first_time_connections (status);
create index first_time_connections_assigned_idx on public.first_time_connections (assigned_to);

alter table public.first_time_connections enable row level security;

create policy first_time_connections_insert_public
  on public.first_time_connections for insert
  to anon, authenticated
  with check (true);

create policy first_time_connections_select_staff
  on public.first_time_connections for select
  to authenticated
  using (public.is_editor_or_admin());

create policy first_time_connections_update_staff
  on public.first_time_connections for update
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy first_time_connections_delete_staff
  on public.first_time_connections for delete
  to authenticated
  using (public.is_editor_or_admin());
