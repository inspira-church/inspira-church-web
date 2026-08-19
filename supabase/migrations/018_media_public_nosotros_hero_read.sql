-- Inspira Church · 018 · lectura pública de las fotos de "Nosotros"
--
-- Mismo patrón que 012/014: el rediseño de /nosotros necesita leer sus dos
-- fotos (module = 'nosotros-hero', 'nosotros-essence', bucket 'site') desde
-- el cliente anon (lib/queries/media.ts: getAboutHeroImage/
-- getAboutEssenceImage). Se reemplaza la política de 014 por una que cubre
-- los cuatro casos — el resto de la biblioteca (prédicas, eventos, equipo,
-- grupos) sigue siendo de uso interno del staff, igual que antes.

drop policy if exists media_select_public_hero on public.media;

create policy media_select_public_hero
  on public.media for select
  to anon, authenticated
  using (
    bucket = 'site'
    and (
      module like 'hero-slide-%'
      or module in ('primera-vez-hero', 'nosotros-hero', 'nosotros-essence')
    )
  );
