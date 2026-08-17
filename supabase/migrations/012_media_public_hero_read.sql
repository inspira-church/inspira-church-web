-- Inspira Church · 012 · lectura pública acotada del hero de Inicio
--
-- media (009) nació de uso exclusivo del panel — sin política de SELECT para
-- anon. El hero de Inicio (Fase de rediseño) necesita leer sus 5 fotos
-- (module = 'hero-slide-1'…'hero-slide-5', bucket 'site') desde el sitio
-- público (lib/queries/media.ts, con el cliente anon). En vez de abrir toda
-- la tabla, la política solo cubre esas filas — el resto de la biblioteca
-- (prédicas, eventos, equipo, grupos) sigue siendo de uso interno del staff,
-- igual que antes.

create policy media_select_public_hero
  on public.media for select
  to anon, authenticated
  using (bucket = 'site' and module like 'hero-slide-%');
