-- Inspira Church · 010 · audit_logs
--
-- Bitácora de solo-inserción para acciones sensibles (cambios de rol, alta o
-- baja de usuarios, publicar/despublicar contenido). A propósito no hay
-- políticas de UPDATE ni DELETE: con RLS activa y sin una política que lo
-- permita, la operación queda denegada por defecto para cualquiera — incluido
-- un admin desde la API. Corregir un registro erróneo se hace insertando uno
-- nuevo que lo aclare, nunca reescribiendo el historial.
--
-- Sin datos personales sensibles en "description" (Regla del brief §25):
-- describir la acción ("Editor Juan publicó la prédica X"), no volcar el
-- contenido de una petición de oración o los datos de un contacto.

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  description text not null,
  created_at timestamptz not null default now()
);

create index audit_logs_user_idx on public.audit_logs (user_id);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

alter table public.audit_logs enable row level security;

-- El registro lo escribe la propia Server Action que ejecuta la acción
-- sensible, siempre a nombre de quien la hizo (user_id = auth.uid()).
create policy audit_logs_insert_staff
  on public.audit_logs for insert
  to authenticated
  with check (public.is_editor_or_admin() and user_id = auth.uid());

create policy audit_logs_select_admin
  on public.audit_logs for select
  to authenticated
  using (public.is_admin());
