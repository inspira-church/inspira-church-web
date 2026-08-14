# Supabase — Inspira Church

Esquema definitivo de la Fase 2. Diez migraciones en `migrations/`, en orden:

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

Crear cinco buckets, todos **públicos de lectura** (las imágenes del sitio no
son sensibles) con escritura restringida a `authenticated` + rol staff, según
la organización del brief (§22):

```
sermons/
events/
pastors/
groups/
site/
```

Política sugerida por bucket (ejemplo con `sermons`, repetir por bucket):

```sql
create policy "sermons_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'sermons');

create policy "sermons_staff_write"
on storage.objects for insert
to authenticated
with check (bucket_id = 'sermons' and public.is_editor_or_admin());
```

Validar en la Server Action de subida (no solo confiar en el bucket): tipo
MIME real, tamaño máximo, y que el nombre de archivo no incluya rutas (`../`).

## Notas abiertas para confirmar antes de producción

- **Peticiones de oración privadas**: hoy solo el Admin las lee
  (`prayer_requests` en `008_forms.sql`). Confirmar con el equipo pastoral si
  el Editor también debería tener acceso.
- **Textos legales**: los checks `consent = true` en `contacts`,
  `group_join_requests` y `prayer_requests` garantizan que no se guarda un
  envío sin consentimiento, pero el texto exacto del aviso de tratamiento de
  datos debe redactarlo o revisarlo un abogado (Ley 1581 de 2012).
