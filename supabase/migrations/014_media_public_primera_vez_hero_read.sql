-- Inspira Church · 014 · lectura pública de la foto del hero de "Primera vez"
--
-- Mismo patrón que 012: la página /primera-vez (rediseño con identidad de
-- cartel) necesita leer su propia foto de portada (module =
-- 'primera-vez-hero', bucket 'site') desde el cliente anon. Se reemplaza la
-- política de 012 por una que cubre ambos casos.

drop policy if exists media_select_public_hero on public.media;

create policy media_select_public_hero
  on public.media for select
  to anon, authenticated
  using (bucket = 'site' and (module like 'hero-slide-%' or module = 'primera-vez-hero'));
