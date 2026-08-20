-- Inspira Church · 024 · schedules.recurrence
--
-- Hasta ahora `schedules.day_of_week` solo podía expresar "cada [día] de la
-- semana" — no había forma de representar un horario que ocurre una vez al
-- mes (ej. "Reunión de Generaciones", último domingo de cada mes). Se agrega
-- un enum de recurrencia + una columna `monthly_week` (1..4 = primera a
-- cuarta semana del mes, -1 = última) en vez de texto libre, mismo criterio
-- que 021_sermons_meeting_type.sql: el selector de Admin no debe aceptar
-- texto libre cuando el conjunto de opciones reales es cerrado y pequeño.
-- Default 'weekly' preserva el comportamiento actual de todos los horarios
-- existentes sin necesitar backfill. `monthly_week` es nullable y solo
-- tiene sentido cuando recurrence = 'monthly'.

create type public.schedule_recurrence as enum ('weekly', 'monthly');

alter table public.schedules
  add column recurrence public.schedule_recurrence not null default 'weekly',
  add column monthly_week smallint;

alter table public.schedules
  add constraint schedules_monthly_week_check
  check (
    (recurrence = 'weekly' and monthly_week is null)
    or (recurrence = 'monthly' and monthly_week in (1, 2, 3, 4, -1))
  );
