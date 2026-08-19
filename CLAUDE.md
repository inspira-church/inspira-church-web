@AGENTS.md

# Inspira Church — Referencia técnica del proyecto

Sitio de Inspira Church: sitio público + panel administrativo (CMS). Ver
[README.md](README.md) para instalación/quickstart y
[supabase/README.md](supabase/README.md) para el esquema de base de datos
migración por migración. Este archivo es la referencia persistente para
retomar el desarrollo sin volver a explorar todo el repo desde cero —
verificado contra el estado real del código, no contra lo que debería ser.

## Stack

Next.js 16 (App Router, `16.3.1`) · React 19.2 · TypeScript · Tailwind CSS 4 ·
Supabase (Postgres + Auth + Storage + RLS) · Zod 4 · Leaflet/react-leaflet
(mapas, tiles de OpenStreetMap, no Google Maps) · Vitest (unitarias) ·
Playwright (e2e).

> Next.js 16 renombró `middleware.ts` → **`proxy.ts`** (función exportada
> `proxy` en vez de `middleware`). El proyecto usa la convención nueva desde
> el inicio — no hay `middleware.ts` en el repo.

## Arquitectura de rutas

```
app/
├─ layout.tsx                 Shell raíz — fonts (Figtree/Petrona), metadata OG, sin auth
├─ (public)/layout.tsx        revalidate=60, Header+Footer+WhatsAppButton, sin auth
├─ (public)/…                 14 páginas públicas
├─ auth/confirm/page.tsx      Callback de invitación de staff (token en fragmento #, no PKCE)
└─ admin/
   ├─ layout.tsx              Solo aplica [data-admin-theme]; NO hace auth
   ├─ (auth)/…                login, recuperar, actualizar-password — sin layout propio, sin AdminShell
   └─ (dashboard)/
      ├─ layout.tsx           Auth gate real (ver abajo) + AdminShell
      └─ …                    33 páginas del CMS
```

51 `page.tsx` en total (14 público, 1 callback de auth, 3 admin-auth, 33
admin-dashboard). Inventario completo de rutas admin: `/admin` (dashboard),
`inicio`, `nosotros`, `primera-vez`, `contacto` (config general — antes
`configuracion`, que ahora solo redirige por compatibilidad), `predicas`,
`series`, `eventos`, `equipo`, `grupos`, `horarios`, `usuarios`, `oracion`
(peticiones), `oraciones` (grabaciones — mismos registros de `sermons`
filtrados por tag `PRAYER_TOPIC`, no es tabla propia), `medios`,
`actividad` (bitácora), `formularios` (bandeja: contactos + solicitudes de
grupo + fichas de "Primera vez"), cada módulo de contenido con `nuevo` y
`[id]` cuando aplica.

**Auth gate real** — vive en `app/admin/(dashboard)/layout.tsx`, no en
`app/admin/layout.tsx`: pide `supabase.auth.getUser()`, si no hay user
redirige a `/admin/login`; si `profiles.active = false` cierra sesión y
redirige con `?error=account_disabled`; deriva `role` de `profiles.role`
(default `"editor"` si no hay fila). El grupo `(auth)` (login/recuperar/
actualizar-password) NO pasa por este layout ni por `AdminShell`.

**`proxy.ts`** (raíz) es la primera capa: bloquea `/admin/**` sin sesión
(excepto `PUBLIC_ADMIN_PATHS`), redirige `/admin/login` → `/admin` si ya hay
sesión, y refresca la cookie de Supabase en cada request vía
`lib/supabase/middleware.ts`. **No** verifica `profiles.active` (eso es solo
el layout de arriba) ni hace control de acceso por rol/módulo — deliberado,
ver comentario en el archivo. Si faltan las env vars de Supabase,
`updateSession()` devuelve `user: null` sin tronar: el sitio público sigue
funcionando, `/admin/**` simplemente redirige siempre a login.

## Frontend — dos sistemas de diseño conviven

- **"Cartel"** (`components/public/cartel.tsx`, `cartel-form.tsx`) — negro,
  tipografía Anton (`lib/fonts.ts`), acento de color de campaña rotativo
  (`CAMPAIGN_COLORS`, hoy encabezado por coral `#FF7F50`, antes dorado).
  Aplicado a Inicio, Primera vez, Nosotros, Prédicas, Oraciones, Grupos,
  Eventos y Contacto — prácticamente todo el sitio público. Imita el
  lenguaje visual real de @inspira.church en Instagram.
- **Base/claro** (`components/ui/*`) — usado por `/oracion` (la única
  página pública que NO usa cartel) y reutilizado como esqueleto de
  `components/admin/*`, que tiene su propio tema oscuro vía atributo CSS
  `[data-admin-theme]` en `globals.css` — no tiene relación con "cartel".

`components/public/`, `components/admin/`, `components/ui/` — inventario
completo verificado en las últimas sesiones de exploración; usar `Glob` si
se necesita la lista exacta de archivos, cambia con cada feature.

## Backend / capa de datos (`lib/`)

- `lib/supabase/` — 5 variantes de cliente: `server.ts` (cookies, uso
  normal en Server Components/Actions), `client.ts` (browser), `public.ts`
  (sin `cookies()`, para queries cacheables del sitio público con
  `revalidate`), `admin.ts` (`service_role`, bypasea RLS — solo en acciones
  que ya verificaron `is_admin()` a mano, lanza si falta la env var),
  `middleware.ts` (`updateSession`, usado por `proxy.ts`).
- `lib/actions/` — Server Actions (mutaciones), un archivo por módulo.
- `lib/queries/` — lecturas del sitio público, usan el cliente `public`.
- `lib/validations/` — 15 esquemas Zod, uno por módulo/formulario.
- Utilidades raíz: `permissions.ts`, `audit.ts`, `admin-nav.ts`,
  `rate-limit.ts`, `turnstile.ts`, `youtube.ts`, `maps.ts`, `slugify.ts`,
  `format.ts`, `fonts.ts`, `constants.ts` / `constants-admin.ts`,
  `form-errors.ts`, `get-site-url.ts`, `utils.ts`.

## Roles y permisos — estado real, no aspiracional

Dos roles en `profiles.role`: `admin` / `editor` (default `editor` al
registrarse — mínimo privilegio). El **gate de autorización real, hoy, en
todas partes**, es binario: `is_admin()` / `is_editor_or_admin()`
(`SECURITY DEFINER`, `search_path` fijo, en `003_helper_functions.sql`).

`015_permissions.sql` agrega un catálogo fino `permissions` /
`role_permissions` + función `has_permission(module, action)` — **pero
ninguna política RLS lo usa todavía** (confirmado por grep en las 17
migraciones: `has_permission(` solo aparece dentro de la definición de la
función misma). Es infraestructura preparada, no un sistema activo.
`lib/permissions.ts` lo refleja: `hasPermission()` en el cliente es un
espejo hardcodeado (`EDITOR_MODULES`) solo para mostrar/ocultar UI — la
autorización real sigue siendo RLS vía `is_editor_or_admin()`/`is_admin()`.

`lib/admin-nav.ts` marca `adminOnly: true` en: Inicio, Nosotros, Primera
vez, Contacto (config), Actividad, Usuarios. Verificado contra RLS: los
cuatro primeros corresponden a escrituras en `site_settings`, que
`009_ministries_settings_media.sql` gatea con `is_admin()` únicamente (no
`is_editor_or_admin()`) — el nav y el RLS coinciden ahí, no es solo un
botón oculto. `profiles` (Usuarios) y `audit_logs` (Actividad, sin política
de update/delete para nadie) también coinciden con `adminOnly`. Único caso
con matiz: `prayer_requests` con `is_private = true` es legible/editable
solo por `is_admin()` aunque el módulo "Oración" no está marcado
`adminOnly` en el nav — ahí RLS es *más* estricto que el nav, no al revés,
así que sigue siendo seguro (filas privadas jamás llegan a un Editor por
API directa). Pendiente documentado en `supabase/README.md`: confirmar con
el equipo pastoral si el Editor debería ver peticiones privadas.

## Auditoría (`lib/audit.ts`)

`logAudit()` (sesión normal, try/catch — nunca bloquea la acción real si
falla el log) y `logAuthEvent()` (usa `service_role`, solo desde
`lib/actions/auth.ts`, porque un login fallido no tiene sesión para
satisfacer RLS). Cobertura confirmada por módulo: `users`, `team`,
`sermons`, `schedules`, `home`/`first_time` (media), `inbox`/
`prayer_requests`, `groups`, `events`, `about`, `auth`, y `settings` (con
`module` dinámico). **Hueco real y actual**: `lib/actions/sermon-series.ts`
no llama a `logAudit` en ninguna operación (crear/editar/eliminar/activar
series no queda auditado), aunque el módulo hermano `sermons.ts` sí está
cubierto por completo — vale la pena cerrarlo antes de producción.

## Base de datos — Supabase

19 migraciones en `supabase/migrations/`, 001 a 019 (`018` agregó
`nosotros-hero`/`nosotros-essence` a la política de lectura pública de
`media`; `019` agregó `growth_groups.location_public` — ver secciones
"Página Nosotros" y "Página Grupos" más abajo, y la tabla de
`supabase/README.md`, ya actualizada). Ver ese archivo para el detalle
migración por migración, el bootstrap del primer admin, y la auditoría de
RLS completa (Fase 12). Resumen de lo no cubierto ahí:

- Patrón de RLS confirmado con spot-checks: tablas de contenido (`sermons`,
  `sermon_series`, `ministries`) → lectura pública solo si
  `published`/`active`, escritura `is_editor_or_admin()`. Tablas de
  formularios (`contacts`, `group_join_requests`, `prayer_requests`,
  `first_time_connections`) → `insert` abierto a `anon`/`authenticated`
  (con `consent = true`), `select`/`update`/`delete` solo staff. Nunca
  `FORCE ROW LEVEL SECURITY` (necesario para que la vista
  `public_growth_groups` funcione).
- Buckets de Storage (`011`, ampliados por `013`): `sermons`, `events`,
  `pastors`, `groups` — públicos de lectura, 5 MB, solo jpeg/png/webp.
  `site` — igual pero 40 MB y admite además gif/mp4/webm/mov (para el
  hero de Inicio). Escritura de los 5 restringida a `is_editor_or_admin()`.
  Subida real ocurre directo del navegador al bucket con el cliente
  `anon`; una Server Action en `lib/actions/media.ts` guarda los metadatos
  en `media` después.

## Página Nosotros — rediseño editorial (arquitectura final)

`/nosotros` se reconstruyó como 9 secciones narrativas, cada una su propio
componente en `components/public/`: `AboutHero`, `MissionVision`,
`EssenceStatement`, `ChurchValues`, `BeliefsAccordion`, `PastoralTeam`,
`LeadershipMosaic`, `VisitUs`, `AboutCTA`. Ritmo cromático fijo por sección
(negro → crema → foto → negro → verde `#266C62` → negro → negro → coral →
negro) usando `ABOUT_COLORS` (`lib/fonts.ts`) — paleta de marca fija,
**distinta** de `CAMPAIGN_COLORS` (esa sigue rotando libremente en Inicio).

**Una sola migración nueva (018), de política RLS — no de esquema.** Todo el
contenido nuevo cabe en la arquitectura existente:
- Texto: sigue en `site_settings` (key='about'), mismo patrón JSONB de
  siempre — `AboutContent` en `lib/queries/about.ts` creció mucho (historia,
  propósito, misión/visión con etiqueta+frase protagonista+texto, frase de
  identidad, valores, creencias, visita, CTA final) pero es un solo blob,
  sin nueva tabla ni columna.
- Fotos: dos módulos nuevos en la tabla `media` existente (bucket `site`,
  igual que el hero de Inicio y de Primera vez) — `nosotros-hero` y
  `nosotros-essence`. `lib/queries/media.ts` expone
  `getAboutHeroImage()`/`getAboutEssenceImage()`; si no hay foto cargada,
  cada sección degrada con su propio fallback (columna de texto centrada en
  el Hero, gradiente de marca en la transición) — nunca un roto ni un mock.
  **Gotcha real que costó depurar**: `media` no tiene lectura pública
  general — cada módulo de hero nuevo necesita su propia línea en la
  política `media_select_public_hero` (ver `012`/`014`), si no, el cliente
  `anon` del sitio público simplemente no ve la fila aunque exista (se ve
  bien en `/admin` porque esa página usa el cliente con sesión, que sí pasa
  `is_editor_or_admin()`). `018_media_public_nosotros_hero_read.sql` agrega
  `nosotros-hero`/`nosotros-essence` a esa misma política — aplicada ya en
  producción vía el SQL Editor de Supabase, y committeada en el repo. **Si
  se agrega un futuro módulo de foto pública nuevo (otro hero, otra
  transición), hay que repetir este paso** — es fácil olvidarlo porque el
  bug es invisible en `/admin` y solo se nota en el sitio público.
- Equipo pastoral y liderazgo: se reutiliza `team_members` sin cambios
  (`type='pastor'` → `PastoralTeam` con modal de biografía nativo
  `<dialog>`; `type='lider'` → `LeadershipMosaic`, mosaico sin biografía).
  `active`/`order_index` ya cubrían "visible en Nosotros"/"orden" — no hizo
  falta ningún campo nuevo tipo `show_on_about_page`.
- Ubicación: reutiliza `site_settings.churchAddress/Lat/Lng` (mapa grande
  vía `SinglePointMap`/Leaflet, sin cambios). CTA final: botón "Quiero
  visitar Inspira" apunta a `/contacto` (mismo destino que "Planea tu
  visita" del header/Inicio) — decisión explícita del usuario, no
  `/primera-vez` como en el primer borrador. Ninguna ruta nueva.

**Creencias — accordion de 10 categorías + "La Iglesia".** `beliefs` pasó de
`string[]` plano a `{ category, content, visible }[]`. `getAboutContent()`
migra en lectura cualquier fila vieja en formato `string[]` (nunca se pierde
contenido doctrinal real por el cambio de forma). Las 12 creencias reales
que ya existían en producción se recategorizaron una sola vez (script
puntual, ya no vive en el repo) dentro de las 10 categorías del brief — hoy
las 10 tienen contenido real y visible; no quedó ninguna vacía. `visible`
permite preparar una categoría sin publicarla; `BeliefsAccordion` filtra
`visible && content` antes de renderizar, así que una categoría vacía u
oculta simplemente no aparece (nunca un placeholder visible). El acordion
es accesible: botones reales, `aria-expanded`/`aria-controls`, animación vía
`grid-rows-[0fr/1fr]` (mismo truco que `FirstTimeConnectionReveal`).

**Editable desde el panel, no desde código.** `/admin/nosotros` (ya
`adminOnly` en el nav — sin cambios de permisos) ganó dos `ImageUploadField`
(mismo patrón que `/admin/primera-vez`) y `AboutContentForm` creció con
todos los campos nuevos, incluida `BeliefsEditor` — lista dinámica
cliente-side (agregar/quitar/reordenar categoría, con `beliefsCount` oculto
para que el Server Action sepa cuántas filas leer de `FormData`). Diseño,
layout, animaciones y paleta siguen en código — el panel solo edita texto,
fotos y visibilidad, igual que el resto del CMS.

**Reveal en scroll** — `components/public/useScrollReveal.ts`, hook
compartido (`IntersectionObserver`, dispara una sola vez). Las clases
`motion-reduce:transition-none` en cada consumidor respetan
`prefers-reduced-motion` sin bifurcar la lógica del hook.

## Página Grupos — rediseño "encuentra tu comunidad" (arquitectura final)

`/grupos` pasó de "directorio" a experiencia narrativa: Hero (negro) →
`GroupsIntro` (crema, "Más que una reunión") → búsqueda+filtros+resultados
(`GroupsExplorer`) → `GroupsHelpCTA` (teal, siempre visible, con o sin
resultados). `/grupos/[slug]` (detalle) y `/grupos/unirme` (interés/contacto)
ya existían de fases anteriores — se restilizaron pero **no se dupli­caron**.

**Filtrado 100% cliente, sin round-trip al servidor por tecleo.** Antes,
`GroupFilters` actualizaba `searchParams` vía `router.push` (recarga RSC por
cada cambio); ahora `GroupsExplorer` recibe la lista completa ya resuelta
server-side (`getPublicGroups()`, sin filtrar) y hace búsqueda+localidad+
día+tipo con `useMemo` en el cliente — sin debounce porque no hay query de
servidor que evitar. Efecto colateral bueno: `/grupos` volvió a ser
**estático con ISR** (`○`, antes `ƒ` por depender de `searchParams`).
Lista y Mapa comparten exactamente el mismo array `filtered` — nunca pueden
desincronizarse. Búsqueda ignora tildes (`normalizeSearch`, NFD) para que
"suba"/"Suba" o "bogota"/"Bogotá" coincidan igual. `titleCase()` normaliza
solo la **etiqueta visible** de localidad en el filtro (`suba` → `Suba`) sin
tocar el valor real guardado — el dato en Supabase no se migró.

**Privacidad de ubicación — capa nueva sobre una que ya era segura.**
`growth_groups` (006) ya nunca exponía `exact_address`/`leader_phone_private`
al público — el sitio siempre lee `public_growth_groups`, una vista que ni
siquiera tiene esas columnas. Lo que faltaba: una forma de que un admin
suprima *incluso el pin aproximado* para un grupo que se reúne en vivienda
particular. Migración `019_growth_groups_location_visibility.sql` agrega
`growth_groups.location_public boolean default true` y la vista ahora hace
`case when location_public then lat_approx else null end` — si es `false`,
`lat_approx`/`lng_approx` llegan `null` al público (sin pin en mapa/tarjeta/
detalle) pero `sector`/`locality` en texto se siguen mostrando. Validado en
vivo: se desactivó para "Grupo - 1" (sector real "Conjunto residencial -
colina"), se confirmó que el pin desaparece de tarjeta+mapa general+detalle
sin tocar el texto, y se reactivó al terminar la prueba. Admin gana
`components/admin/LocationPicker.tsx` — mapa Leaflet clicable que fija
`latApprox`/`lngApprox` sin que el admin necesite conocer coordenadas (los
inputs numéricos siguen ahí, sincronizados, para ajuste fino).

**Bug de datos real encontrado y corregido**: los dos grupos existentes
tenían `lng_approx` guardado en **positivo** (~74.05–74.06) cuando Bogotá es
~-74 — los pines renderizaban ~245 000 px fuera del contenedor del mapa
(verificado por `getBoundingClientRect`), es decir la vista Mapa llevaba
rota todo este tiempo para datos reales. Corregido con el usuario en
sesión (confirmó "sí" explícitamente) editando ambos grupos desde el propio
panel admin — no con SQL directo — así quedó auditado igual que cualquier
edición normal (`audit_logs`, módulo `groups`).

**Colores por tipo, no por índice rotativo.** `lib/group-types.ts` mapea
`group_type` (texto libre administrado desde el CMS, sin tabla de
catálogo — ver comentario en `006_growth_groups.sql`) a un color de
`ABOUT_COLORS` por coincidencia de patrón ("crecimiento"→teal claro,
"joven"→coral, "famil"→crema, etc.), con un color por defecto para
cualquier tipo nuevo que se cree sin tocar código. Mismo helper en
`GroupCard`, `GroupsMap` (popup) y `/grupos/[slug]`.

**Contacto reutilizado, no duplicado.** El CTA "Quiero que me contacten" del
estado sin-resultados y de `GroupsHelpCTA` apunta a `/grupos/unirme` (sin
`?grupo=`) — el mismo formulario ya existente (`GroupJoinForm`,
`group_join_requests`, Turnstile + rate limit) ya soporta "No estoy seguro —
recomiéndenme uno" como opción de grupo. `/grupos/[slug]` sigue enlazando a
`/grupos/unirme?grupo=<slug>` para preseleccionar. No se creó ningún
formulario ni tabla nueva.

## Servicios externos

| Servicio | Uso confirmado | Evidencia |
|---|---|---|
| **GitHub** | Remoto único, `origin` | `github.com/edwinosman/inspira-church-web.git` |
| **Supabase** | Postgres + Auth + Storage, las tres superficies activas | `@supabase/ssr` + `@supabase/supabase-js` en `package.json`, `lib/supabase/*` |
| **Cloudflare Turnstile** | Anti-bot en Contacto, Oración, Unirme a grupo, Primera vez (Déjanos tus datos) | `lib/turnstile.ts`, `TurnstileWidget.tsx`, allowlisted en CSP de `next.config.ts` |
| **Google — Fonts** | Solo `next/font/google` (Anton/Caveat/Hind/Montserrat Alternates en `lib/fonts.ts`, Figtree/Petrona en `app/layout.tsx`) | Self-hosted en build, **no requiere API key** |
| **Google — YouTube Data API v3** | Sección "En vivo" en Inicio | `lib/youtube.ts` llama `googleapis.com/youtube/v3/search` — **sí requiere** proyecto en Google Cloud Console + `YOUTUBE_API_KEY`. Falla en silencio (sección oculta) si falta |
| **Google — Maps** | Solo enlaces profundos | `lib/maps.ts`: `google.com/maps?q=lat,lng` y enlace de Waze — texto plano, **no requiere API key** ni SDK. El mapa interactivo real usa Leaflet + tiles de OpenStreetMap |
| **Vercel** | Mencionado como destino de hosting en `README.md`, cabeceras de IP compatibles con su proxy en `lib/rate-limit.ts` | **No confirmado en el repo** — no hay `vercel.json` ni config de build específica. No hay evidencia de que exista un proyecto Vercel ya conectado; verificar con el usuario antes de asumir que el deploy vive ahí |

Sin analytics, error tracking, ni servicio de email transaccional en
`package.json` (no Sentry/PostHog/GA/Resend/SendGrid/Stripe).

## Variables de entorno (nombres — ver `.env.example` para la lista con
descripciones, nunca commitear valores reales)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`,
`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`,
`YOUTUBE_API_KEY`. Confirmado por grep: todo `process.env.*` referenciado
en `lib/`/`app/`/`components/` está declarado en `.env.example`, sin
huecos en ninguna dirección.

## Estado del proyecto y pendientes

Fases 1–14 completadas y documentadas en `README.md` (arquitectura, DB,
auth, CRUD de todos los módulos, formularios públicos + bandejas,
seguridad, SEO/rendimiento, pruebas). **Sin commitear en el README pero
confirmado en `git log`**, trabajo posterior a la Fase 14 ya en `main`:
reorganización y rediseño oscuro del panel admin con catálogo de permisos
y extensión de auditoría (migraciones 015/016), rollout del sistema de
diseño "cartel" a Nosotros/Prédicas/Oraciones/Grupos/Eventos/Contacto,
cambio de acento dorado → coral (`#FF7F50`), separación de grabaciones de
oración fuera de Prédicas hacia `/oraciones`, y la ficha de conexión
"Déjanos tus datos" de Primera vez (migración 017, tabla
`first_time_connections`, bandeja en `/admin/formularios`).

**Pendiente / abierto, en orden de relevancia:**

1. Fase 15 (Producción) — no iniciada. Falta confirmar si existe ya un
   proyecto Vercel conectado (no hay evidencia en el repo).
2. Auditoría de `sermon-series.ts` sin cobertura de `logAudit` (ver
   arriba) — inconsistente con `sermons.ts`.
3. Sistema de permisos finos (`has_permission`, `015_permissions.sql`)
   sigue sin usarse en ninguna política RLS — decidir si se activa o se
   retira si no va a usarse.
4. Confirmar con el equipo pastoral si el Editor debe leer peticiones de
   oración privadas (`prayer_requests.is_private`).
5. Revisión legal del texto de consentimiento de datos (Ley 1581 de 2012,
   Colombia) en los formularios públicos — pendiente desde la Fase 12.
6. ~~Nosotros — fotos de marca sin cargar~~ — resuelto: `nosotros-hero` y
   `nosotros-essence` ya tienen foto real subida desde `/admin/nosotros`,
   confirmado en vivo en `/nosotros` tras aplicar la migración `018`.
7. ~~Nosotros — sin líderes activos~~ — resuelto: ya hay 3 filas
   `type='lider', active=true` en `team_members`, `LeadershipMosaic`
   ("Lideramos sirviendo") se renderiza correctamente en producción.
