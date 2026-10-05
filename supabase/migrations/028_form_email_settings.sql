-- Inspira Church · 028 · configuración de correos de los formularios públicos
--
-- ESTADO: PROPUESTA — NO APLICADA. Requiere aprobación explícita antes de
-- correrla en el SQL Editor de Supabase (mismo procedimiento manual que 018–027).
--
-- Por qué una tabla nueva y no `site_settings`:
--   `site_settings` tiene la política `site_settings_select_public` (009):
--   `select to anon, authenticated using (true)`. Todo lo que vive ahí es legible
--   con la clave anónima pública. La configuración de correos contiene
--   direcciones internas del equipo (destinatarios de los avisos), que no deben
--   ser públicas. Esta tabla es SOLO-ADMIN en todas sus operaciones.
--
-- Quién la lee:
--   - El CMS (/admin/formularios/configuracion), con la sesión del Administrador.
--   - El envío de correos tras un formulario público (lib/email/form-notifications.ts),
--     que corre en el servidor con service_role (bypasea RLS) porque quien envía el
--     formulario es un visitante anónimo. El resultado nunca sale del servidor.
--
-- Contenido (una fila por clave):
--   form_key = 'global'        -> { "defaultRecipient": "admin@…" }
--   form_key = 'contacto' | 'primera-vez' | 'oracion' | 'grupos' | 'generaciones'
--                              -> { "internal": { "enabled", "useDefaultRecipient",
--                                     "primary", "additional": [] },
--                                   "autoReply": { "enabled", "subject", "message" } }
-- La validación de claves y de la forma del JSON vive en la aplicación (Zod),
-- igual que `site_settings`: agregar un formulario nuevo no requiere migración.
--
-- El remitente (EMAIL_FROM) NO se guarda aquí: se controla solo desde Vercel.

create table public.form_email_settings (
  id uuid primary key default gen_random_uuid(),
  form_key text not null unique,
  config jsonb not null,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.form_email_settings
  for each row execute function public.set_updated_at();

alter table public.form_email_settings enable row level security;

-- Sin ninguna política para `anon`: el visitante público no puede leerla ni escribirla.
create policy form_email_settings_select_admin
  on public.form_email_settings for select
  to authenticated
  using (public.is_admin());

create policy form_email_settings_insert_admin
  on public.form_email_settings for insert
  to authenticated
  with check (public.is_admin());

create policy form_email_settings_update_admin
  on public.form_email_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy form_email_settings_delete_admin
  on public.form_email_settings for delete
  to authenticated
  using (public.is_admin());

comment on table public.form_email_settings is
  'Destinatarios y textos de los correos de los formularios públicos. Solo Administrador (RLS); el envío lee con service_role desde el servidor. No contiene secretos ni el remitente.';
