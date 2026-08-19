-- Inspira Church · 023 · rediseño de Contacto
--
-- `contacts.phone` y `contacts.whatsapp` eran dos campos redundantes (ambos
-- texto libre para un número de teléfono, sin distinción funcional real en
-- el formulario ni en Admin). Verificado antes de esta migración: la tabla
-- tiene 0 filas en producción, así que eliminar `whatsapp` no pierde
-- ningún dato real — no habría sido seguro hacerlo sin verificar primero.
-- El concepto de "cómo prefiere que lo contactemos" pasa a resolverse con
-- la columna nueva `preferred_channel`, que sí aporta información real
-- (WhatsApp/llamada/correo) en vez de duplicar el número.

alter type public.contact_reason add value if not exists 'evento' before 'otro';

create type public.contact_preferred_channel as enum ('whatsapp', 'llamada', 'correo');

alter table public.contacts
  drop column whatsapp,
  add column preferred_channel public.contact_preferred_channel not null,
  add column event_id uuid references public.events (id) on delete set null,
  add column consent_at timestamptz not null default now(),
  add column privacy_policy_version text;

comment on column public.contacts.event_id is
  'Evento de origen cuando el visitante llega desde /contacto?evento=<slug> — nunca se le pide repetirlo. NULL para el resto de motivos.';
comment on column public.contacts.privacy_policy_version is
  'settings.privacyPolicyUrl vigente en el momento del envío — trazabilidad de qué política aceptó la persona, sin inventar un sistema de versiones que no existe.';
