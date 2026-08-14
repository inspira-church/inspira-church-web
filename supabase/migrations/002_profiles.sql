-- Inspira Church · 002 · profiles
-- Extiende auth.users con los datos que el panel administrativo necesita:
-- nombre, rol y estado. Un registro de profiles = una persona con acceso al CMS.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role public.user_role not null default 'editor',
  active boolean not null default true,
  -- Marca la cuenta fundadora del admin principal. Solo puede existir una.
  -- Protege contra el escenario "el equipo se queda sin nadie con acceso".
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_single_primary_idx
  on public.profiles (is_primary)
  where is_primary = true;

comment on table public.profiles is
  'Usuarios del panel administrativo (staff). No hay registro público: las cuentas las crea un Administrador desde /admin/usuarios.';

alter table public.profiles enable row level security;

-- --- Aprovisionamiento automático ------------------------------------------
-- Cuando se crea un usuario en auth.users (p. ej. al invitarlo desde el
-- dashboard de Supabase o desde el admin), se crea su fila en profiles con
-- rol 'editor' por defecto (privilegio mínimo). Ascender a 'admin' es una
-- acción explícita posterior, nunca automática.
create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'editor',
    true
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- --- Protección del admin principal -----------------------------------------
-- Ni siquiera un Administrador puede degradar, desactivar o borrar la cuenta
-- marcada como is_primary. Aplica el requisito "el Editor no puede eliminar
-- al administrador principal" con una barrera que no depende del rol de quien
-- ejecute la operación.
create function public.protect_primary_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if old.is_primary then
      raise exception 'No se puede eliminar la cuenta del administrador principal.';
    end if;
    return old;
  end if;

  if old.is_primary and (
    new.role <> 'admin' or new.active = false or new.is_primary = false
  ) then
    raise exception 'No se puede degradar, desactivar ni quitar la marca principal al administrador principal.';
  end if;

  return new;
end;
$$;

create trigger protect_primary_admin_trigger
  before update or delete on public.profiles
  for each row execute function public.protect_primary_admin();

-- --- Políticas RLS -----------------------------------------------------------
-- Nota: is_admin() / is_editor_or_admin() se definen en 003_helper_functions.sql.
-- Las políticas que dependen de ellas se agregan al final de ese archivo para
-- evitar referenciar funciones que todavía no existen en este punto.
