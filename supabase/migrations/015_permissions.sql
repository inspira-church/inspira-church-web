-- Inspira Church · 015 · Catálogo de permisos por módulo/acción
--
-- Prepara el modelo de datos para permisos granulares (module.action) sin
-- cambiar ningún comportamiento actual: el seed de abajo le da a 'editor'
-- exactamente el acceso que ya tiene hoy vía is_editor_or_admin() y los
-- nav items sin `adminOnly` (ver lib/admin-nav.ts). Nada en este archivo
-- reemplaza las políticas RLS existentes — siguen siendo la barrera real.
-- Cuando se decida el alcance exacto de Editor, ajustar esto es un UPDATE
-- de filas en role_permissions, no una migración de esquema.

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  action text not null,
  unique (module, action)
);

create table public.role_permissions (
  role public.user_role not null,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role, permission_id)
);

alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

-- Lectura pública (autenticado): la UI necesita poder consultar el catálogo
-- para decidir qué mostrar. Escritura solo admin — es configuración de
-- seguridad, no contenido del sitio.
create policy permissions_select on public.permissions
  for select to authenticated using (true);
create policy permissions_write_admin on public.permissions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy role_permissions_select on public.role_permissions
  for select to authenticated using (true);
create policy role_permissions_write_admin on public.role_permissions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Chequeo puntual desde SQL/RLS cuando se necesite (hoy no lo usa ninguna
-- política — is_editor_or_admin() sigue siendo la que manda — queda listo
-- para cuando se reescriban las políticas con permisos finos).
create function public.has_permission(p_module text, p_action text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.role_permissions rp
    join public.permissions p on p.id = rp.permission_id
    join public.profiles pr on pr.role = rp.role
    where pr.id = auth.uid()
      and pr.active = true
      and p.module = p_module
      and p.action = p_action
  );
$$;

grant execute on function public.has_permission(text, text) to authenticated;

-- --- Catálogo -----------------------------------------------------------
insert into public.permissions (module, action) values
  ('home', 'view'), ('home', 'edit'),
  ('about', 'view'), ('about', 'edit'),
  ('first_time', 'view'), ('first_time', 'edit'),
  ('contact_settings', 'view'), ('contact_settings', 'edit'),
  ('team', 'view'), ('team', 'create'), ('team', 'edit'), ('team', 'delete'),
  ('sermons', 'view'), ('sermons', 'create'), ('sermons', 'edit'), ('sermons', 'delete'), ('sermons', 'publish'),
  ('groups', 'view'), ('groups', 'create'), ('groups', 'edit'), ('groups', 'delete'),
  ('schedules', 'view'), ('schedules', 'create'), ('schedules', 'edit'), ('schedules', 'delete'),
  ('events', 'view'), ('events', 'create'), ('events', 'edit'), ('events', 'delete'), ('events', 'publish'),
  ('inbox', 'view'), ('inbox', 'edit'), ('inbox', 'delete'),
  ('prayer_requests', 'view'), ('prayer_requests', 'edit'), ('prayer_requests', 'delete'),
  ('media', 'view'), ('media', 'create'), ('media', 'delete'),
  ('users', 'view'), ('users', 'manage'),
  ('audit', 'view');

-- admin: todo el catálogo.
insert into public.role_permissions (role, permission_id)
select 'admin', id from public.permissions;

-- editor: todo lo que hoy puede hacer (nav items sin adminOnly), nada más.
insert into public.role_permissions (role, permission_id)
select 'editor', id from public.permissions
where module in (
  'team', 'sermons', 'groups', 'schedules', 'events',
  'inbox', 'prayer_requests', 'media'
);
