-- Inspira Church · 020 · sermons.featured
--
-- "Último mensaje" (portada de /predicas) ya se resolvía por fecha —
-- publicada más reciente, sin selección manual (getFeaturedSermon(), antes
-- del rediseño, hacía justo eso pese al nombre). "Destacada" es un
-- concepto distinto: la iglesia puede querer resaltar un mensaje aunque no
-- sea el más reciente. Se agrega la columna para que la capacidad exista
-- en el modelo — el rediseño de /predicas no la usa todavía para un bloque
-- visual propio (ver CLAUDE.md), pero admin/editor ya pueden marcarla.

alter table public.sermons
  add column featured boolean not null default false;

create index sermons_featured_idx on public.sermons (featured) where featured = true;
