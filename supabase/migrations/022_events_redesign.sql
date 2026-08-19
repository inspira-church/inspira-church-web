-- Inspira Church · 022 · rediseño de Eventos
--
-- No se toca la columna `status` (proximo|finalizado|cancelado, 001) ni su
-- semántica en base de datos: "cancelado" sigue siendo la única bandera
-- manual real. "Próximo"/"Finalizado" pasan a calcularse siempre en la
-- aplicación desde event_date/event_time/end_date/end_time (ver
-- lib/event-status.ts) — el admin ya no puede dejarlos desactualizados a
-- mano. El formulario de Admin solo seguirá escribiendo 'proximo' o
-- 'cancelado' desde ahora.
--
-- practical_info sigue el mismo patrón que about.beliefs (JSONB, lista de
-- {title, content} administrada desde el panel) en vez de columnas rígidas
-- por cada dato opcional (qué llevar, transporte, punto de encuentro...).

create type public.event_modality as enum ('presencial', 'virtual', 'hibrido');

create type public.event_registration_status as enum (
  'abiertas',
  'ultimos_cupos',
  'cerradas',
  'agotado'
);

alter table public.events
  add column subtitle text,
  add column end_date date,
  add column end_time time,
  add column modality public.event_modality not null default 'presencial',
  add column category text,
  add column requires_registration boolean not null default false,
  add column registration_status public.event_registration_status,
  add column show_countdown boolean not null default false,
  add column practical_info jsonb not null default '[]'::jsonb,
  add column cost text,
  add column age_range text,
  add column location_public boolean not null default true;

comment on column public.events.location_public is
  'Si es false, el sitio público oculta address/lat/lng (mismo patrón que growth_groups.location_public, 019) — location_name en texto se sigue mostrando.';
comment on column public.events.practical_info is
  'Lista libre {title, content}[] administrada desde Admin — qué llevar, transporte, punto de encuentro, etc. Nunca HTML, solo texto plano.';
