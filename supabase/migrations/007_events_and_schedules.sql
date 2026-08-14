-- Inspira Church · 007 · events y schedules

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  event_date date not null,
  event_time time,
  location_name text,
  address text,
  lat double precision,
  lng double precision,
  capacity integer,
  registration_url text,
  status public.event_status not null default 'proximo',
  -- Mismo patrón que sermons.published: permite preparar un evento en el
  -- panel antes de que aparezca en el sitio público.
  published boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_date_idx on public.events (event_date);
create index events_status_idx on public.events (status);
create index events_published_idx on public.events (published);

create trigger set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

alter table public.events enable row level security;

create policy events_select_public
  on public.events for select
  to anon, authenticated
  using (published = true);

create policy events_select_staff
  on public.events for select
  to authenticated
  using (public.is_editor_or_admin());

create policy events_insert
  on public.events for insert
  to authenticated
  with check (public.is_editor_or_admin());

create policy events_update
  on public.events for update
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy events_delete
  on public.events for delete
  to authenticated
  using (public.is_editor_or_admin());

-- -----------------------------------------------------------------------------

create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  type public.schedule_type not null,
  name text not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  time_of_day time not null,
  location text,
  order_index integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index schedules_type_idx on public.schedules (type);
create index schedules_active_idx on public.schedules (active);

create trigger set_updated_at
  before update on public.schedules
  for each row execute function public.set_updated_at();

alter table public.schedules enable row level security;

create policy schedules_select_public
  on public.schedules for select
  to anon, authenticated
  using (active = true);

create policy schedules_select_staff
  on public.schedules for select
  to authenticated
  using (public.is_editor_or_admin());

create policy schedules_insert
  on public.schedules for insert
  to authenticated
  with check (public.is_editor_or_admin());

create policy schedules_update
  on public.schedules for update
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy schedules_delete
  on public.schedules for delete
  to authenticated
  using (public.is_editor_or_admin());
