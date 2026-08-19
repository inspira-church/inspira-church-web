-- Inspira Church · 021 · sermons.meeting_type
--
-- El rediseño de /oraciones necesita distinguir Presencial/Virtual por
-- grabación (hoy esa distinción solo vivía en el nombre de los horarios,
-- ej. "Oración Presencial" en schedules.name — nada en sermons la
-- expresaba). Se agrega un enum de dos valores en vez de texto libre
-- porque el selector de Admin no debe aceptar texto libre cuando solo
-- existen esas dos opciones reales (ver CLAUDE.md, sección "Página
-- Oraciones"). Nullable y sin default: no se inventa el valor para la
-- grabación ya existente, queda pendiente de que un editor la marque desde
-- /admin/predicas/[id] (mismo patrón no-destructivo que 020_sermons_featured.sql).

create type public.sermon_meeting_type as enum ('presencial', 'virtual');

alter table public.sermons
  add column meeting_type public.sermon_meeting_type;
