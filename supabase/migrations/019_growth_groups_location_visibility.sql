-- Inspira Church · 019 · visibilidad de ubicación en growth_groups
--
-- lat_approx/lng_approx ya eran "aproximadas" por convención de captura (el
-- formulario admin pide "del sector, no de la vivienda"), pero nada a nivel
-- de base de datos impedía que un admin guardara ahí una coordenada exacta
-- de una vivienda particular y esta se sirviera igual en el mapa público.
-- Esta migración agrega un control explícito: cuando location_public es
-- false, la vista pública nunca entrega lat/lng (el pin del mapa
-- desaparece), pero el sector/localidad en texto se sigue mostrando —
-- exactamente el comportamiento que ya tenían GroupCard/[slug] al recibir
-- lat/lng en null (degradan solo. Rediseño de /grupos, ver CLAUDE.md).
--
-- Default true: preserva el comportamiento visual actual para los grupos
-- que ya existen (si tenían coordenadas, seguían mostrando pin).

alter table public.growth_groups
  add column location_public boolean not null default true;

comment on column public.growth_groups.location_public is
  'Si es false, la vista pública oculta lat_approx/lng_approx (sin pin en el mapa) aunque existan — para grupos que se reúnen en vivienda particular. El sector/localidad en texto se sigue mostrando.';

create or replace view public.public_growth_groups
with (security_invoker = false)
as
select
  g.id,
  g.name,
  g.slug,
  g.group_type,
  g.description,
  g.city,
  g.locality,
  g.sector,
  case when g.location_public then g.lat_approx else null end as lat_approx,
  case when g.location_public then g.lng_approx else null end as lng_approx,
  g.day_of_week,
  g.time_of_day,
  l.full_name as leader_full_name,
  l.photo_url as leader_photo_url,
  c.full_name as coleader_full_name
from public.growth_groups g
left join public.team_members l on l.id = g.leader_id
left join public.team_members c on c.id = g.coleader_id
where g.active = true;

grant select on public.public_growth_groups to anon, authenticated;

comment on view public.public_growth_groups is
  'Único punto de lectura de grupos para el sitio público. Nunca exponer growth_groups directamente en el frontend público. lat/lng se ocultan por completo cuando location_public = false.';
