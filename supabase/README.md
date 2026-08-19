# Supabase — Inspira Church

Esquema definitivo de la Fase 2 (+ Storage de la Fase 8, permisos y
auditoría de la reorganización del panel admin). Veintidós migraciones en
`migrations/`, en orden:

| Archivo | Contenido |
|---|---|
| `001_extensions_and_types.sql` | Extensión `pgcrypto` y tipos enum del dominio |
| `002_profiles.sql` | Usuarios del staff, alta automática, protección del admin principal |
| `003_helper_functions.sql` | `is_admin()`, `is_editor_or_admin()`, `set_updated_at()`, políticas de `profiles` |
| `004_team_members.sql` | Pastores y líderes |
| `005_sermon_series_and_sermons.sql` | Series y prédicas |
| `006_growth_groups.sql` | Grupos de crecimiento + vista pública `public_growth_groups` |
| `007_events_and_schedules.sql` | Eventos y horarios |
| `008_forms.sql` | Contactos, solicitudes de grupo, peticiones de oración |
| `009_ministries_settings_media.sql` | Ministerios, configuración del sitio, biblioteca de medios |
| `010_audit_logs.sql` | Bitácora de auditoría (solo inserción) |
| `011_storage_buckets.sql` | Buckets de Storage + políticas (ver más abajo, ya no es manual) |
| `012_media_public_hero_read.sql` | Lectura pública acotada de `media` para el slide del hero de Inicio |
| `013_site_bucket_hero_media_formats.sql` | Bucket "site": admite GIF y video corto (MP4/WebM/MOV), hasta 40 MB |
| `014_media_public_primera_vez_hero_read.sql` | Lectura pública de la foto del hero de /primera-vez |
| `015_permissions.sql` | Catálogo `permissions`/`role_permissions` por módulo.acción + `has_permission()` — preparado para permisos finos, sin cambiar el acceso actual |
| `016_audit_logs_extend.sql` | `audit_logs`: columnas `module`, `user_role`, `user_name`, `previous_data`, `new_data` |
| `017_first_time_connections.sql` | Ficha de conexión "Déjanos tus datos" de /primera-vez — tabla propia, distinta de `contacts` |
| `018_media_public_nosotros_hero_read.sql` | Agrega `nosotros-hero`/`nosotros-essence` a la lectura pública de `media` (reemplaza la política de `014`) — fotos del rediseño de /nosotros |
| `019_growth_groups_location_visibility.sql` | `growth_groups.location_public` (default `true`) — cuando es `false`, `public_growth_groups` oculta lat/lng por completo (sin pin en el mapa), aunque el sector/localidad en texto se sigue mostrando |
| `020_sermons_featured.sql` | `sermons.featured` (default `false`) — "Destacada", independiente de "Último mensaje" (que sigue siendo la publicada más reciente por fecha) |
| `021_sermons_meeting_type.sql` | Enum `sermon_meeting_type` ('presencial'\|'virtual') + `sermons.meeting_type` (nullable, sin default) — rediseño de /oraciones, ver CLAUDE.md sección "Página Oraciones" |
| `022_events_redesign.sql` | 12 columnas nuevas en `events` (subtitle, end_date/end_time, modality, category, requires_registration, registration_status, show_countdown, practical_info, cost, age_range, location_public) + enums `event_modality`/`event_registration_status` — rediseño de /eventos, ver CLAUDE.md sección "Página Eventos" |

## Aplicar las migraciones

Con el CLI de Supabase, desde la raíz del proyecto (una vez exista el proyecto Next.js, Fase 3):

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```

## Bootstrap del primer administrador

El trigger `on_auth_user_created` da de alta automáticamente a **todo** usuario
nuevo de `auth.users` como `profiles.role = 'editor'` — privilegio mínimo por
defecto. La primera cuenta admin se promueve a mano, una sola vez:

1. Crea el usuario desde el dashboard de Supabase (Authentication → Add user)
   o con `supabase.auth.admin.createUser` desde un script de servidor.
2. Ejecuta en el SQL Editor de Supabase, reemplazando el correo:

   ```sql
   update public.profiles
   set role = 'admin', is_primary = true
   where email = 'correo-del-fundador@inspirachurch.com';
   ```

`is_primary` solo puede estar en `true` para una fila (índice único parcial en
`002_profiles.sql`) y esa fila queda protegida por un trigger: ni un admin
puede degradarla, desactivarla ni borrarla desde la aplicación.

## Buckets de Storage

Los crea `011_storage_buckets.sql`: cinco buckets (`sermons`, `events`,
`pastors`, `groups`, `site`), todos **públicos de lectura** (las imágenes del
sitio no son sensibles), con `file_size_limit` (5 MB) y `allowed_mime_types`
(`jpeg`, `png`, `webp`) aplicados por Supabase Storage en el servidor — no
solo confiados al formulario del navegador (brief §22). Escritura restringida
a `authenticated` + rol staff, igual que el resto del esquema.

La subida real de archivos ocurre desde el navegador con el cliente de
Supabase (`lib/supabase/client.ts`), directo al bucket — el `anon key` más
estas políticas RLS son suficiente protección, no hace falta pasar el archivo
por el servidor de Next.js. Después de subir, una Server Action guarda los
metadatos en `media` (Fase 8, `lib/actions/media.ts`).

## Auditoría de RLS (Fase 12)

Revisión completa de las 15 tablas/vista antes de cerrar la fase de
seguridad. Confirmado:

- Ninguna tabla usa `FORCE ROW LEVEL SECURITY` — necesario para que la vista
  `public_growth_groups` siga funcionando (depende de que el dueño de la
  tabla, que la crea, pueda saltarse la RLS al leerla).
- `contacts`, `group_join_requests` y `prayer_requests` solo permiten
  `INSERT` a `anon` — nunca `SELECT`, `UPDATE` ni `DELETE`. Un visitante
  puede escribir su propio envío, jamás leer los de otros.
- `growth_groups` no tiene ninguna política de `SELECT` para `anon`: el
  único camino público es la vista, que expone columnas explícitas (nunca
  `exact_address` ni `leader_phone_private`). Verificado en vivo en la Fase
  9 inspeccionando el HTML completo de una página de grupo real.
- `audit_logs` no tiene política de `UPDATE` ni `DELETE` — con RLS activa y
  sin una política que lo permita, la operación queda denegada por defecto,
  incluso para un admin desde la API.
- `is_admin()` / `is_editor_or_admin()` son `SECURITY DEFINER` con
  `search_path` fijo — evita tanto el ciclo de RLS sobre sí mismas como el
  secuestro de `search_path`.

## Notas abiertas para confirmar antes de producción

- **Peticiones de oración privadas**: hoy solo el Admin las lee
  (`prayer_requests` en `008_forms.sql`). Confirmar con el equipo pastoral si
  el Editor también debería tener acceso.
- **Textos legales**: los checks `consent = true` en `contacts`,
  `group_join_requests` y `prayer_requests` garantizan que no se guarda un
  envío sin consentimiento, pero el texto exacto del aviso de tratamiento de
  datos debe redactarlo o revisarlo un abogado (Ley 1581 de 2012).
