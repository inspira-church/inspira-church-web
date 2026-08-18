-- Inspira Church · 013 · más formatos y tamaño para el hero de Inicio
--
-- El bucket "site" (donde van los 5 slides del hero) solo aceptaba
-- JPEG/PNG/WebP hasta 5 MB. El hero ya sabe mostrar video (ver
-- components/public/Hero.tsx), pero Supabase Storage rechazaba cualquier
-- video o GIF antes de que el formulario alcanzara a subirlo. Se amplía
-- solo este bucket — el resto (sermons/events/pastors/groups) sigue
-- limitado a fotos, 5 MB.

update storage.buckets
set
  allowed_mime_types = array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime'
  ],
  file_size_limit = 41943040 -- 40 MB
where id = 'site';
