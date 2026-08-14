-- Inspira Church · 008 · Formularios públicos: contacts, group_join_requests,
-- prayer_requests
--
-- Las tres tablas comparten el mismo patrón de seguridad: cualquier persona
-- (autenticada o no) puede INSERTAR, pero solo el staff puede LEER, editar
-- o eliminar. Esto es intencional: un formulario público nunca debe poder
-- leer lo que otros han enviado, solo agregar su propio registro.
--
-- "consent" se exige en las tres (check consent = true) porque las tres
-- recolectan datos personales — ver §15 del brief (Ley 1581 de 2012). El
-- texto legal exacto del aviso de tratamiento de datos debe ser revisado por
-- un abogado antes de publicarse; aquí solo se garantiza que no se guarda el
-- registro si la persona no marcó su consentimiento.

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  whatsapp text,
  email text,
  reason public.contact_reason not null,
  message text,
  consent boolean not null check (consent = true),
  status public.form_status not null default 'nueva',
  assigned_to uuid references public.profiles (id) on delete set null,
  internal_notes text,
  follow_up_date date,
  created_at timestamptz not null default now()
);

create index contacts_status_idx on public.contacts (status);
create index contacts_reason_idx on public.contacts (reason);
create index contacts_assigned_idx on public.contacts (assigned_to);

alter table public.contacts enable row level security;

create policy contacts_insert_public
  on public.contacts for insert
  to anon, authenticated
  with check (true);

create policy contacts_select_staff
  on public.contacts for select
  to authenticated
  using (public.is_editor_or_admin());

create policy contacts_update_staff
  on public.contacts for update
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy contacts_delete_staff
  on public.contacts for delete
  to authenticated
  using (public.is_editor_or_admin());

-- -----------------------------------------------------------------------------

create table public.group_join_requests (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text not null,
  whatsapp text,
  email text,
  city text not null,
  locality text,
  neighborhood text,
  age smallint,
  group_id uuid references public.growth_groups (id) on delete set null,
  availability text,
  notes text,
  consent boolean not null check (consent = true),
  status public.form_status not null default 'nueva',
  created_at timestamptz not null default now()
);

create index group_join_requests_status_idx on public.group_join_requests (status);
create index group_join_requests_group_idx on public.group_join_requests (group_id);

alter table public.group_join_requests enable row level security;

create policy group_join_requests_insert_public
  on public.group_join_requests for insert
  to anon, authenticated
  with check (true);

create policy group_join_requests_select_staff
  on public.group_join_requests for select
  to authenticated
  using (public.is_editor_or_admin());

create policy group_join_requests_update_staff
  on public.group_join_requests for update
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy group_join_requests_delete_staff
  on public.group_join_requests for delete
  to authenticated
  using (public.is_editor_or_admin());

-- -----------------------------------------------------------------------------

create table public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  request_text text not null,
  is_private boolean not null default false,
  consent boolean not null check (consent = true),
  status public.form_status not null default 'nueva',
  assigned_to uuid references public.profiles (id) on delete set null,
  internal_notes text,
  created_at timestamptz not null default now()
);

create index prayer_requests_status_idx on public.prayer_requests (status);
create index prayer_requests_private_idx on public.prayer_requests (is_private);

alter table public.prayer_requests enable row level security;

create policy prayer_requests_insert_public
  on public.prayer_requests for insert
  to anon, authenticated
  with check (true);

-- Una petición marcada como privada solo la puede leer un admin; el resto
-- las ve también el editor. Confirmar con el equipo pastoral si este es el
-- corte correcto antes de producción (queda anotado en el documento de
-- arquitectura, Fase 1, §5).
create policy prayer_requests_select_staff
  on public.prayer_requests for select
  to authenticated
  using (public.is_admin() or (public.is_editor_or_admin() and is_private = false));

create policy prayer_requests_update_staff
  on public.prayer_requests for update
  to authenticated
  using (public.is_admin() or (public.is_editor_or_admin() and is_private = false))
  with check (public.is_admin() or (public.is_editor_or_admin() and is_private = false));

-- Eliminar una petición de oración es exclusivo del admin: es el dato más
-- sensible de todo el sistema.
create policy prayer_requests_delete_admin
  on public.prayer_requests for delete
  to authenticated
  using (public.is_admin());
