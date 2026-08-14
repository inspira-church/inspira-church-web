-- Inspira Church · 004 · team_members
-- Pastores y líderes son la misma entidad (persona con bio y foto que se
-- muestra en "Nosotros" o como predicador/líder de grupo): una sola tabla
-- con "type" evita mantener dos tablas casi idénticas (Regla 3).

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  type public.team_member_type not null,
  role_title text not null,
  bio text,
  photo_url text,
  order_index integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index team_members_type_idx on public.team_members (type);
create index team_members_active_idx on public.team_members (active);

create trigger set_updated_at
  before update on public.team_members
  for each row execute function public.set_updated_at();

alter table public.team_members enable row level security;

create policy team_members_select_public
  on public.team_members for select
  to anon, authenticated
  using (active = true);

create policy team_members_select_staff
  on public.team_members for select
  to authenticated
  using (public.is_editor_or_admin());

create policy team_members_write
  on public.team_members for insert
  to authenticated
  with check (public.is_editor_or_admin());

create policy team_members_update
  on public.team_members for update
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy team_members_delete
  on public.team_members for delete
  to authenticated
  using (public.is_editor_or_admin());
