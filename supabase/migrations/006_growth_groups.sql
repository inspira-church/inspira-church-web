-- Inspira Church · 006 · growth_groups
--
-- Tabla con seguridad reforzada: mezcla columnas públicas (nombre, sector
-- aproximado, día, hora) con columnas privadas (dirección exacta, teléfono
-- personal del líder, notas internas). La tabla base NO tiene política de
-- lectura para anon: el sitio público lee siempre a través de la vista
-- public_growth_groups, que solo expone columnas seguras. Ver §16 del brief
-- y §9 del documento de arquitectura (Fase 1).
--
-- group_type es texto libre (no enum): la lista de tipos de grupo la
-- administra el equipo desde el CMS y puede crecer sin requerir una
-- migración de base de datos cada vez que se agregue una categoría nueva.

create table public.growth_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  group_type text not null,
  description text,

  -- Público (aproximado, nunca la dirección exacta)
  city text not null,
  locality text,
  sector text,
  lat_approx double precision,
  lng_approx double precision,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0 = domingo
  time_of_day time not null,

  leader_id uuid references public.team_members (id) on delete set null,
  coleader_id uuid references public.team_members (id) on delete set null,

  -- Privado — solo visible dentro del panel (staff autenticado)
  exact_address text,
  leader_phone_private text,
  internal_notes text,

  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index growth_groups_city_idx on public.growth_groups (city);
create index growth_groups_day_idx on public.growth_groups (day_of_week);
create index growth_groups_type_idx on public.growth_groups (group_type);
create index growth_groups_active_idx on public.growth_groups (active);
create index growth_groups_leader_idx on public.growth_groups (leader_id);

create trigger set_updated_at
  before update on public.growth_groups
  for each row execute function public.set_updated_at();

alter table public.growth_groups enable row level security;

-- Sin política de SELECT para anon a propósito: la tabla base solo la lee
-- staff autenticado. El público usa la vista de abajo.
create policy growth_groups_select_staff
  on public.growth_groups for select
  to authenticated
  using (public.is_editor_or_admin());

create policy growth_groups_insert
  on public.growth_groups for insert
  to authenticated
  with check (public.is_editor_or_admin());

create policy growth_groups_update
  on public.growth_groups for update
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy growth_groups_delete
  on public.growth_groups for delete
  to authenticated
  using (public.is_editor_or_admin());

-- --- Vista pública -----------------------------------------------------------
-- Las vistas en Postgres se ejecutan con los privilegios de quien las crea
-- (aquí, el rol propietario de growth_groups), no de quien las consulta.
-- Como ese rol es dueño de la tabla, la RLS de growth_groups no se le aplica
-- a él — por eso esta vista sí puede leer la tabla aunque anon no tenga
-- política de SELECT sobre ella. Es el patrón estándar de Supabase para
-- exponer un subconjunto de columnas sin duplicar la tabla.
create view public.public_growth_groups
with (security_invoker = false)
as
select
  g.id,
  g.name,
  g.slug,
  g.group_type,
  g.description,
  g.city,
  g.locality,
  g.sector,
  g.lat_approx,
  g.lng_approx,
  g.day_of_week,
  g.time_of_day,
  l.full_name as leader_full_name,
  l.photo_url as leader_photo_url,
  c.full_name as coleader_full_name
from public.growth_groups g
left join public.team_members l on l.id = g.leader_id
left join public.team_members c on c.id = g.coleader_id
where g.active = true;

grant select on public.public_growth_groups to anon, authenticated;

comment on view public.public_growth_groups is
  'Único punto de lectura de grupos para el sitio público. Nunca exponer growth_groups directamente en el frontend público.';
