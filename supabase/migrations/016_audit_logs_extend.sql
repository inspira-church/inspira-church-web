-- Inspira Church · 016 · audit_logs: columnas para módulo, autor y diffs
--
-- 010_audit_logs.sql ya tenía la tabla y las políticas correctas (insert
-- solo de tus propias acciones, select solo admin, sin update/delete — no
-- se toca nada de eso aquí). Faltaban columnas para lo que pedía el panel
-- de Actividad: módulo (para agrupar/filtrar), nombre y rol del usuario
-- denormalizados (si se borra el perfil, el log conserva quién fue — hoy
-- user_id tiene "on delete set null"), y el detalle de qué cambió.
--
-- Los eventos de login/logout (lib/actions/auth.ts) se insertan con el
-- cliente service_role porque un intento de login fallido no tiene sesión
-- todavía para pasar por la política RLS normal — ese cliente bypasea RLS
-- por completo, así que estas columnas nuevas no necesitan política propia.

alter table public.audit_logs
  add column module text,
  add column user_role text,
  add column user_name text,
  add column previous_data jsonb,
  add column new_data jsonb;

create index audit_logs_module_idx on public.audit_logs (module);
