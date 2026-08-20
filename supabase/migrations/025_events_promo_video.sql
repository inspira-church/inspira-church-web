-- Inspira Church · 025 · events.promo_video_url
--
-- El detalle de un evento (/eventos/[slug]) no tenía forma de mostrar un
-- video promocional de YouTube — solo la imagen del hero. Se agrega una
-- columna de texto libre, nullable y sin default, mismo patrón que
-- `registration_url` (cualquier URL, sin tabla de catálogo). La sección
-- pública solo se renderiza si el campo tiene valor: un evento sin video no
-- muestra nada (nunca un reproductor roto ni un placeholder).

alter table public.events
  add column promo_video_url text;
