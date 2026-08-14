# Supabase — Inspira Church

Esquema definitivo de la Fase 2 (+ Storage de la Fase 8). Once migraciones en
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

## Notas abiertas para confirmar antes de producción

- **Peticiones de oración privadas**: hoy solo el Admin las lee
  (`prayer_requests` en `008_forms.sql`). Confirmar con el equipo pastoral si
  el Editor también debería tener acceso.
- **Textos legales**: los checks `consent = true` en `contacts`,
  `group_join_requests` y `prayer_requests` garantizan que no se guarda un
  envío sin consentimiento, pero el texto exacto del aviso de tratamiento de
  datos debe redactarlo o revisarlo un abogado (Ley 1581 de 2012).
