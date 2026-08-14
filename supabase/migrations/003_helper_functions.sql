-- Inspira Church · 003 · Funciones auxiliares para RLS
--
-- is_admin() / is_editor_or_admin() se usan dentro de las políticas RLS de
-- todas las demás tablas. Son SECURITY DEFINER a propósito: si corrieran con
-- los permisos de quien las llama, su propia lectura de "profiles" quedaría
-- atrapada por la RLS de profiles (que a su vez las llama a ellas),
-- generando un ciclo. Como funciones "definer" se ejecutan con los permisos
-- de quien las creó y leen profiles sin pasar por sus políticas.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and active = true
  );
$$;

create function public.is_editor_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor') and active = true
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_editor_or_admin() to anon, authenticated;

-- --- updated_at automático ---------------------------------------------------
-- Se aplica con un trigger por tabla (ver cada archivo de módulo) en vez de
-- confiar en que cada Server Action recuerde setear la columna a mano.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- --- Políticas RLS de profiles ------------------------------------------------
-- (Definidas aquí, no en 002, porque dependen de is_admin()/is_editor_or_admin().)

-- Cualquier miembro del staff ve su propia fila; un admin ve a todos
-- (lo necesita /admin/usuarios para listar y gestionar cuentas).
create policy profiles_select
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

-- Solo un admin crea cuentas de staff (se hace desde el panel, con
-- supabase.auth.admin.createUser en el servidor; esta política cubre además
-- cualquier inserción directa que llegara a necesitarse).
create policy profiles_insert_admin
  on public.profiles for insert
  to authenticated
  with check (public.is_admin());

-- Solo un admin edita perfiles (rol, estado, datos). No hay autoedición en
-- esta fase: mantiene el modelo de permisos simple y evita construir un
-- control de "qué columnas sí puede tocar un editor sobre sí mismo".
create policy profiles_update_admin
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy profiles_delete_admin
  on public.profiles for delete
  to authenticated
  using (public.is_admin());
