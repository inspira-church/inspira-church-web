-- Inspira Church · 005 · sermon_series y sermons

create table public.sermon_series (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.sermon_series
  for each row execute function public.set_updated_at();

alter table public.sermon_series enable row level security;

create policy sermon_series_select_public
  on public.sermon_series for select
  to anon, authenticated
  using (active = true);

create policy sermon_series_select_staff
  on public.sermon_series for select
  to authenticated
  using (public.is_editor_or_admin());

create policy sermon_series_insert
  on public.sermon_series for insert
  to authenticated
  with check (public.is_editor_or_admin());

create policy sermon_series_update
  on public.sermon_series for update
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy sermon_series_delete
  on public.sermon_series for delete
  to authenticated
  using (public.is_editor_or_admin());

-- -----------------------------------------------------------------------------

create table public.sermons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  series_id uuid references public.sermon_series (id) on delete set null,
  preacher_id uuid references public.team_members (id) on delete set null,
  description text,
  youtube_url text not null,
  thumbnail_url text,
  sermon_date date not null,
  -- Temas libres para filtrar (p. ej. {"fe","familia"}); administrables desde
  -- el CMS sin necesidad de una tabla de catálogo aparte.
  topics text[] not null default '{}',
  published boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sermons_series_idx on public.sermons (series_id);
create index sermons_preacher_idx on public.sermons (preacher_id);
create index sermons_date_idx on public.sermons (sermon_date desc);
create index sermons_published_idx on public.sermons (published);
create index sermons_topics_idx on public.sermons using gin (topics);

create trigger set_updated_at
  before update on public.sermons
  for each row execute function public.set_updated_at();

alter table public.sermons enable row level security;

create policy sermons_select_public
  on public.sermons for select
  to anon, authenticated
  using (published = true);

create policy sermons_select_staff
  on public.sermons for select
  to authenticated
  using (public.is_editor_or_admin());

create policy sermons_insert
  on public.sermons for insert
  to authenticated
  with check (public.is_editor_or_admin());

create policy sermons_update
  on public.sermons for update
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy sermons_delete
  on public.sermons for delete
  to authenticated
  using (public.is_editor_or_admin());
