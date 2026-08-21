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
├─ (public)/layout.tsx        revalidate=60, Header+Footer+ContactFAB, sin auth
├─ (public)/…                 18 páginas públicas (incluye /oraciones/[slug])
├─ auth/confirm/page.tsx      Callback de invitación de staff (token en fragmento #, no PKCE)
└─ admin/
   ├─ layout.tsx              Solo aplica [data-admin-theme]; NO hace auth
   ├─ (auth)/…                login, recuperar, actualizar-password — sin layout propio, sin AdminShell
   └─ (dashboard)/
      ├─ layout.tsx           Auth gate real (ver abajo) + AdminShell
      └─ …                    33 páginas del CMS
```

55 `page.tsx` en total (18 público, 1 callback de auth, 3 admin-auth, 33
admin-dashboard). Inventario completo de rutas admin: `/admin` (dashboard),
`inicio`, `nosotros`, `primera-vez`, `contacto` (config general — antes
`configuracion`, que ahora solo redirige por compatibilidad), `predicas`,
`series`, `eventos`, `equipo`, `grupos`, `horarios`, `usuarios`, `oracion`
(peticiones), `oraciones` (grabaciones — mismos registros de `sermons`
filtrados por tag `PRAYER_TOPIC`, no es tabla propia), `medios`,
`actividad` (bitácora), `formularios` (bandeja: contactos + solicitudes de
grupo + fichas de "Primera vez"), cada módulo de contenido con `nuevo` y
`[id]` cuando aplica. Público: `/oraciones` (archivo + "Último encuentro")
gana hermana `/oraciones/[slug]` (página individual propia, no comparte
ruta con `/predicas/[slug]` — ver sección "Página Oraciones"). Rutas
públicas nuevas desde la última actualización de este archivo:
`/generaciones` (pilar de ministerios por edad, rediseño editorial
completo — ver sección propia más abajo), `/donaciones` ("próximamente",
enlazada desde el Footer y el menú principal) y `/politica-de-privacidad`
(muestra embebido el PDF que el admin sube en `/admin/contacto` — ver
sección "Política de privacidad").

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

26 migraciones en `supabase/migrations/`, 001 a 026 (`018` agregó
`nosotros-hero`/`nosotros-essence` a la política de lectura pública de
`media`; `019` agregó `growth_groups.location_public`; `020` agregó
`sermons.featured`; `021` agregó `sermons.meeting_type`; `022` agregó 12
columnas nuevas a `events`; `023` rediseñó `contacts` (canal preferido,
evento de origen, consentimiento con timestamp); `024` agregó recurrencia
mensual a `schedules`; `025` agregó `events.promo_video_url`; `026` creó el
bucket de Storage `documents` para la política de privacidad en PDF — ver
secciones "Página Nosotros", "Página Grupos", "Página Prédicas", "Página
Oraciones", "Página Eventos", "Página Contacto", "Horarios — recurrencia
mensual", "Video promocional en Eventos" y "Política de privacidad" más
abajo, y la tabla de `supabase/README.md`, ya actualizada). Ver ese archivo
para el detalle migración por migración, el bootstrap del primer admin, y
la auditoría de RLS completa (Fase 12). **Todas las migraciones 018–026 se
aplicaron a producción a mano vía el SQL Editor de Supabase** (el entorno
de desarrollo no tiene el CLI de Supabase enlazado — `supabase login`
requeriría un Personal Access Token que no existe en este proyecto; ver
nota en "Estado del proyecto y pendientes" si se quiere automatizar esto a
futuro).
Resumen de lo no cubierto ahí:

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
- Sexto bucket, `documents` (`026`): público de lectura, solo
  `application/pdf`, 10 MB. **Escritura restringida a `is_admin()`** (no
  `is_editor_or_admin()` como los otros cinco) porque el único consumidor
  hoy es `/admin/contacto`, que ya es `adminOnly` en el nav. Sube directo
  desde el navegador igual que los demás, pero **no** pasa por la tabla
  `media` — es un único documento legal (`site_settings.privacyPolicyUrl`),
  no un asset reutilizable de la librería (ver "Política de privacidad").

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

## Página Prédicas — biblioteca audiovisual (arquitectura final)

`/predicas` pasó de "catálogo" a experiencia editorial: Hero → `LatestSermon`
("Último mensaje", 60/40, siempre la más reciente por fecha) →
`SermonsExplore` (buscador con debounce + predicador/serie/tema) →
`SermonsList` (grid + "Cargar más") → `SermonSeriesShowcase` ("Explora por
series", solo series con al menos una prédica publicada) →
`SermonsClosingCTA` (teal). `/predicas/[slug]` y `/series/[slug]` ya
existían — se restilizaron al lenguaje cartel (el segundo usaba todavía el
sistema base/claro) y `/predicas/[slug]` ganó "Sigue creciendo"
(`getRelatedSermons`: misma serie → temas en común → mismo predicador, en
ese orden, sin motor de recomendación).

**Corrección post-entrega: el CTA final sí enlaza al canal de YouTube.**
El brief original de este rediseño pedía explícitamente lo contrario
("no enlazar el canal general de YouTube"), y así se implementó al
principio — pero el usuario pidió el cambio después, mostrando el botón
"Explorar todos los mensajes" y su URL real
(`https://www.youtube.com/@InspiraChurch1`). `SermonsClosingCTA` ahora
recibe `youtubeUrl` (de `settings.youtubeUrl`, el mismo campo que ya
alimenta el ícono de YouTube del footer — no se creó un campo nuevo) y
abre el canal en pestaña nueva (`target="_blank"`, `rel="noopener
noreferrer"`); si `youtubeUrl` está vacío, cae de vuelta a `/predicas`
para no dejar un enlace roto. De paso se corrigió el valor guardado de
`settings.youtubeUrl`, que tenía una URL vieja
(`https://youtube.com/inspirachurch`) distinta de la real que dio el
usuario — ahora el footer y este CTA muestran el mismo canal.

**EN VIVO de Inicio — cero cambios, verificado explícitamente.** `lib/youtube.ts`,
`components/public/YouTubeEmbed.tsx` y el bloque "En vivo" de
`app/(public)/page.tsx` no se tocaron (`git diff` vacío en los tres,
confirmado antes de terminar la sesión). El reproductor nuevo de
`/predicas/[slug]` es un componente aparte, `LazySermonVideo.tsx` — mismo
patrón de `getYouTubeId()`, pero deliberadamente **no** comparte código con
`YouTubeEmbed` para que nada en Prédicas pueda afectar el EN VIVO por
accidente en un futuro cambio.

**Búsqueda server-side con debounce, a propósito distinta de Grupos.**
A diferencia de `/grupos` (que pasó a filtrar 100% en cliente por su
volumen pequeño), aquí el buscador y los filtros de predicador/serie/tema
siguen actualizando `searchParams` vía `router.push` — la biblioteca de
prédicas puede crecer a cientos de registros y no tiene sentido traer todo
el catálogo al cliente. El campo de texto sí es local (400ms de debounce)
para no navegar en cada tecla; los `<select>` navegan de inmediato, igual
que antes del rediseño. `/predicas` volvió a quedar `ƒ` (dinámico, por
`searchParams`) — a diferencia de `/grupos`, que si pudo volverse estático.

**Paginación real, no solo cosmética.** `getPublishedSermonsPage()` trae
`limit + 1` filas para saber si mostrar "Cargar más" sin una query de
conteo aparte. `SermonsList` (cliente) parte de la primera página ya
resuelta en el servidor y acumula páginas siguientes llamando al Server
Action de solo lectura `loadMoreSermons()`; se remonta por completo
(`key={filterKey}` en el padre) cada vez que cambian filtros/búsqueda, así
nunca mezcla resultados de un filtro viejo con uno nuevo. El filtro que
excluye grabaciones de oración (`PRAYER_TOPIC`) se aplica en JS después de
paginar en Postgres — con el volumen actual (unas pocas grabaciones de
oración entre el resto) es una simplificación consciente frente a
excluirlas desde SQL, que habría exigido una vista o función nueva solo
para esto.

**"Último mensaje" vs. "Destacada" — dos conceptos ya no confundidos.**
Antes del rediseño existía `getFeaturedSermon()`, pero pese al nombre
calculaba la más reciente por fecha (sin campo `featured` en el esquema).
Se separó en dos: `getLatestSermon()` (lo que ya hacía, ahora bien
nombrado) y un `getFeaturedSermon()` nuevo que sí lee
`sermons.featured` (migración `020_sermons_featured.sql`, default
`false`). Admin/Editor ya pueden marcar una prédica como Destacada desde
`/admin/predicas`, pero **el rediseño no le agregó un bloque público
propio** — el brief permitía explícitamente omitirlo si no aportaba al
diseño, y con un catálogo real de 2 prédicas no había necesidad. La
capacidad de dato queda lista para cuando se decida usarla.

**Video con carga diferida — solo en Prédicas.** `LazySermonVideo` muestra
la miniatura + botón Play (mismo `SermonPlayIndicator` que las tarjetas) y
recién monta el `<iframe>` de YouTube al hacer clic — evita cargar el
reproductor de YouTube en cada visita a una página de prédica. Encontrado
en el camino: la miniatura interna que carga el reproductor de YouTube usa
`i.ytimg.com` (dominio distinto de `img.youtube.com`, que sí ya estaba
permitido) — la CSP de `next.config.ts` no lo tenía y bloqueaba esa
imagen; se agregó. No afecta el EN VIVO (usa `YouTubeEmbed`, sin miniatura
propia).

**Auditoría de `sermon-series.ts` — hueco cerrado.** Documentado como
pendiente desde la sesión de arquitectura inicial: `createSermonSeries`,
`updateSermonSeries` y `toggleSermonSeriesActive` no llamaban a
`logAudit()`, a diferencia de `sermons.ts`. Ahora sí, con
`module: "sermons"` (no existe un módulo de permisos separado para
"series" — comparte el mismo gate `is_editor_or_admin()` que prédicas).

**Tipos de prédica sin cambios.** `sermons.published` (borrador/publicada),
`sermons.topics` (texto libre, sin tabla de catálogo) y el slug
autogenerado desde el título ya existían exactamente como pide el brief —
no se tocó ese modelo, solo se le agregó `featured`.

## Página Oraciones — rediseño contemplativo + página individual (arquitectura final)

`/oraciones` pasó de "grid de grabaciones" a experiencia deliberadamente
distinta de `/predicas` (comunión/pausa/acompañamiento, no catálogo
audiovisual): Hero contemplativo (negro, sin decoración, horarios de
oración discretos debajo del texto) → `LatestPrayerMoment` ("Último
encuentro", derivado solo por publicada+fecha vía `getLatestSermonByTopic`,
igual que ya hacía Inicio — nunca elegido a mano) → sección de pausa
(fondo crema `ABOUT_COLORS.cream`, solo texto, sin cards/botones/iconos,
mucho espacio negativo) → archivo (`PrayerArchive`, negro, grid +
"Cargar más momentos" + filtro Presencial/Virtual opcional) →
`PrayerRequestCTA` (teal, enlaza a `/oracion`, el formulario de petición
que ya existía — no se creó un segundo). `/oraciones/[slug]` es nueva:
página individual propia, más simple que una prédica (etiqueta + fecha
grande + persona + video + horarios + hasta 3 relacionadas).

**Sigue siendo la misma tabla `sermons`, sin tabla propia.** Una grabación
de oración es una prédica con `PRAYER_TOPIC` ("Oración") en `topics` — eso
no cambió. Lo nuevo es la migración `021_sermons_meeting_type.sql`: agrega
el enum `sermon_meeting_type` ('presencial'|'virtual') y la columna
nullable `sermons.meeting_type` — no existía ninguna forma de distinguir
presencial/virtual por grabación antes de este rediseño (solo el *nombre*
de un horario, ej. "Oración Presencial", lo insinuaba). Nullable a
propósito: no se inventó el valor para la grabación real que ya existía
("Oración // Miércoles 12 de agosto de 2026") — se dejó sin especificar y
se fijó a mano en "Presencial" desde `/admin/predicas/[id]` durante la
validación de esta sesión, exactamente como cualquier admin lo haría (mismo
patrón que la corrección de `lng_approx` en la sesión de Grupos: editado
desde el propio panel, no con SQL directo, así quedó en `audit_logs`).
**Aplicada en producción vía el SQL Editor de Supabase durante esta misma
sesión** (no vía `supabase db push` — el entorno no tiene el CLI de
Supabase enlazado, mismo procedimiento manual que `018`/`019`/`020`).

**Un solo formulario admin, selector condicional.** `SermonForm` (compartido
por Prédicas y Oraciones) ganó `showMeetingType?: boolean` — un
`SelectField` "Tipo de encuentro" (Presencial/Virtual, sin texto libre) que
solo se renderiza cuando aplica. `/admin/oraciones/nuevo` lo pasa siempre
en `true`; `/admin/predicas/[id]` (edición compartida por ambos módulos) lo
calcula leyendo si `sermon.topics` ya contiene `PRAYER_TOPIC` — así una
prédica normal nunca ve el campo, y una grabación de oración sí, sin
necesitar una ruta de edición separada. El listado `/admin/oraciones`
también muestra el tipo como badge cuando está definido.

**Filtro Presencial/Virtual: solo aparece si los datos reales lo justifican.**
`getPrayerMeetingTypesInUse()` cuenta modalidades distintas entre
grabaciones publicadas; `PrayerArchive` (cliente) solo renderiza los
botones "Todas/Presenciales/Virtuales" si hay 2 o más — con una sola
modalidad en uso, el filtro simplemente no se muestra (nunca una opción sin
sentido). El filtro actúa sobre lo ya cargado en cliente; "Cargar más
momentos" sigue trayendo páginas reales del servidor
(`getPublishedPrayerSermonsPage`, mismo patrón "trae `limit + 1`" que
`getPublishedSermonsPage` de Prédicas) — combinación deliberada: no hay
volumen aún para justificar un filtro 100% servidor, pero tampoco tiene
sentido traer todo el catálogo al cliente como si fuera Grupos.

**Horarios: una sola fuente, nunca hardcodeados.** `getPrayerSchedules()`
(nueva, en `lib/queries/schedules.ts`) envuelve `getActiveSchedules()` y
filtra por nombre que empieza con "oración" — exactamente la misma regla
que Inicio ya aplicaba de forma local en su sección "Ora con nosotros".
Esa lógica (y `prayerModality()`, que traduce "Oración Presencial" →
"Presencial") se extrajo a `lib/format.ts` y ambas páginas (Inicio y
`/oraciones`, y también `/oraciones/[slug]`) importan las mismas
funciones — si un horario cambia desde `/admin/horarios`, las tres vistas
se actualizan solas, nunca hay que tocar código. Con los datos reales de
producción hoy solo existe un horario de oración ("Oración Presencial",
miércoles 7:00 p. m.) — el Hero de `/oraciones` lo refleja tal cual, sin
inventar un segundo horario "Viernes · Virtual" que no existe todavía en
`schedules`.

**Encabezados grandes derivados de la fecha, no del texto libre del
título.** "MIÉRCOLES" / "12 DE AGOSTO DE 2026" (en `LatestPrayerMoment`,
`PrayerCard` y el `<h1>` de `/oraciones/[slug]`) se calculan con
`dayNameFromDate(sermon_date)` + `formatDate(sermon_date)` — nunca se
parsea `sermon.title`. Decisión explícita (confirmada con el usuario): así
el diseño no depende de que cada admin futuro escriba el título siguiendo
un patrón exacto tipo "Oración // Miércoles ...". El título libre sigue
existiendo (se usa para SEO/metadata y como identificador en Admin), pero
no se muestra tal cual en las piezas grandes del sitio público.

**Nunca la misma grabación en dos URLs.** `getSermonBySlug()` (usada por
`/predicas/[slug]`) ahora excluye grabaciones con `PRAYER_TOPIC` (mismo
filtro `excludePrayerTopic` que ya usaban las consultas de listado) — una
grabación de oración deja de ser accesible por `/predicas/[slug]` una vez
existe su URL canónica en `/oraciones/[slug]` (`getPrayerSermonBySlug`,
exige el tema y trae la fila completa con `youtube_url` para el
reproductor). El slug es único en toda la tabla `sermons`, así que nunca
hay colisión entre ambas rutas. De paso, el enlace de "Ora con nosotros" en
Inicio (que antes apuntaba a `/predicas/${slug}`) se corrigió a
`/oraciones/${slug}`.

**Video embebido — reutiliza `LazySermonVideo` tal cual**, sin componente
nuevo: mismo patrón miniatura+Play hasta el clic, mismo `getYouTubeId()`.
La página individual pasa un `title` propio ("oración del 12 de agosto de
2026") para que el `aria-label` del botón Play sea el correcto sin tocar el
componente. El listado (`PrayerArchive`, relacionadas) nunca monta un
iframe — solo miniaturas, igual que Prédicas.

**Relacionadas ("Otros momentos de oración"): hasta 3, prioriza misma
modalidad.** `getRelatedPrayerSermons()` trae publicadas ordenadas por
fecha, excluye la actual, y si `meeting_type` está definido antepone las
de la misma modalidad — sin motor de recomendación, igual de simple que
`getRelatedSermons` de Prédicas.

**Un solo h1 real.** Antes del rediseño `/oraciones` no tenía ningún
`<h1>` (usaba `PosterHeading`, que renderiza `<h2>`) — se corrigió: el
título "ORACIONES" del Hero es ahora un `<h1>` explícito, igual que ya
hacía `/predicas`.

## Página Eventos — "esto es lo que viene" (arquitectura final)

`/eventos` pasó de listado plano a experiencia editorial: Hero → `FeaturedEvent`
("Próximo evento", el futuro publicado más cercano, nunca elegido a mano) →
grid "Próximos eventos" (excluye explícitamente al destacado) → "Eventos
pasados" (solo si hay contenido real) → `EventsClosingCTA` (teal, sin botón
forzado — el brief permite cierre puramente visual cuando no hay volumen que
justifique un CTA de "ver todo"). `/eventos/[slug]` se rediseñó completo:
Hero visual → franja Fecha/Hora/Lugar/Capacidad → Descripción (si existe) →
Información práctica (si hay ítems) → Cómo llegar (si aplica) → Inscripción o
"evento finalizado" → hasta 3 relacionados.

**"Próximo"/"Finalizado" ya no se guardan — se calculan siempre.** Antes,
`events.status` (`proximo`/`finalizado`/`cancelado`) era 100% manual: un
evento pasado seguía marcado "Próximo" si nadie lo actualizaba a mano — el
bug exacto que el brief pedía evitar. `lib/event-status.ts` (nuevo) expone
`deriveEventStatus()`: si `status === 'cancelado'` gana siempre (única
bandera manual real); si no, compara `end_date/end_time` (o `event_date/
event_time` si no hay fin) contra `Date.now()`. **La columna `status` no se
migró** — sigue siendo el mismo enum de `001`, pero desde este rediseño el
formulario de Admin solo escribe `'proximo'` o `'cancelado'` (su selector
"Estado" ahora es binario: Activo/Cancelado — "Próximo/Finalizado se
calculan solos por fecha" como dice el propio hint del campo). Todas las
vistas (`EventCard`, `FeaturedEvent`, el detalle, y el filtro de "Próximos
eventos" de Inicio) usan `deriveEventStatus()`/`isEventUpcoming()` en vez de
leer `event.status` directamente — confirmado con tests unitarios nuevos en
`tests/unit/lib/event-status.test.ts`.

**Migración `022_events_redesign.sql` — 12 columnas nuevas, sin tocar las
existentes.** `subtitle`, `end_date`, `end_time`, `modality` (enum
`presencial`\|`virtual`\|`hibrido`, default `presencial`), `category` (texto
libre, mismo patrón que `group_type`/`topics` — sin tabla de catálogo),
`requires_registration`, `registration_status` (enum `abiertas`\|
`ultimos_cupos`\|`cerradas`\|`agotado`, solo relevante si requiere
inscripción), `show_countdown`, `practical_info` (JSONB `{title,content}[]`,
mismo patrón que `about.beliefs` — `PracticalInfoEditor.tsx` es
prácticamente un fork de `BeliefsEditor.tsx`), `cost` y `age_range` (texto
libre — no existe configuración de moneda en el proyecto, así que no se
inventó una; el admin escribe "Gratuito" o "$50.000 COP" tal cual) y
`location_public` (mismo patrón que `growth_groups.location_public`, 019,
pero resuelto en la capa de queries en vez de una vista nueva: `mapRow()` en
`lib/queries/events.ts` pone `address`/`lat`/`lng` en `null` cuando es
`false`, `location_name` en texto se sigue mostrando). **Aplicada en
producción vía el SQL Editor de Supabase** (mismo procedimiento manual que
`018`-`021` — el entorno no tiene el CLI de Supabase enlazado).

**Bug real encontrado y corregido: los campos opcionales no se podían
vaciar.** Al mover "Cara a Cara con Jesús" del campo Descripción (donde
vivía por error) al nuevo Subtítulo, guardar con Descripción vacía no
borraba el valor viejo. Causa: `toRow()` en `lib/actions/events.ts` pasaba
campos opcionales como `data.campo` sin normalizar — cuando el campo queda
`undefined`, `JSON.stringify` lo omite del payload que el cliente de
Supabase envía, así que la columna nunca se sobrescribía (el `update` sí se
ejecutaba, solo que sin esa clave). Se corrigió con `?? null` en todos los
campos opcionales de `toRow()` — mismo patrón de bug que probablemente
exista en otros `lib/actions/*.ts` con la misma forma (`campo: data.campo`
sin coalescer), no auditado en esta sesión por estar fuera de alcance.
Validado en vivo: subtítulo movido correctamente, "Sobre este evento" ahora
desaparece del sitio público cuando la descripción está vacía.

**Cuenta regresiva — opt-in, sin timers pesados, invisible a lectores de
pantalla.** `sermons.show_countdown` (booleano, toggle en Admin) controla si
`EventCountdown` se renderiza; el cálculo (`msUntilEventStart()`) vive en
`lib/event-status.ts`. El componente se actualiza cada 30 s (no cada
segundo) y retorna `null` sin mostrar valores negativos una vez que el
evento ya empezó. Todo el bloque lleva `aria-hidden="true"` a propósito — la
fecha completa ya existe como texto semántico en el resto de la página
(franja Fecha/Hora/Lugar/Capacidad), así que ocultarlo del árbol de
accesibilidad evita que un lector de pantalla anuncie el conteo
constantemente sin perder información real. Validado en vivo activando el
toggle para "Campamento de Jóvenes" (evento real, no de prueba — encaja
exactamente en el caso de uso que el brief describe).

**Inscripción: se reutiliza `registration_url`, sin campo "tipo" nuevo.**
El brief pedía poder configurar "tipo y destino" de inscripción, pero ya
existía `registration_url` (acepta cualquier URL: WhatsApp, Google Forms,
formulario propio). En vez de agregar un campo `registration_type` redundante
que el admin tendría que mantener sincronizado con la URL, `lib/event-
status.ts` expone `registrationCtaLabel(url)`: detecta `wa.me`/
`whatsapp.com` → "Escríbenos por WhatsApp", `forms.gle`/`docs.google.com/
forms` → "Completar formulario", cualquier otra URL → "Inscribirme". El CTA
se adapta solo al destino real, nunca puede desincronizarse. No existe
todavía un sistema interno de inscripciones con datos de inscritos (§42 del
brief) — la inscripción siempre sale del sitio hacia una URL externa, así
que no aplica ninguna consideración de RLS/privacidad de inscritos nueva.

**Ubicación — reutiliza `SinglePointMap`/`LocationPicker`/`googleMapsLink`/
`wazeLink` tal cual**, sin una tercera implementación de mapas. `LocationPicker`
(ya existía para Grupos) se reutiliza en `EventForm` para que el admin fije
`lat`/`lng` con un clic en vez de escribir coordenadas a mano. La sección
"Cómo llegar" del detalle solo se renderiza si `modality !== 'virtual'` **y**
`location_public` **y** hay coordenadas — nunca mapa para un evento virtual
ni para uno con ubicación marcada privada.

**Relacionados: hasta 3, prioriza misma categoría, siempre próximos.**
`getRelatedEvents()` filtra por `isEventUpcoming()` (nunca sugiere un evento
ya finalizado) y antepone los de la misma `category` cuando el evento actual
tiene una — sin motor de recomendación, mismo patrón simple que
`getRelatedSermons`/`getRelatedPrayerSermons`.

**`deleteEvent` — hueco cerrado.** El listado de Admin no tenía botón
"Eliminar" (a diferencia de Prédicas/Oraciones, que sí). Se agregó
`deleteEvent()` en `lib/actions/events.ts` + `ConfirmForm` en el listado,
mismo patrón exacto que `deleteSermon` — usado en esta sesión para limpiar
el evento de prueba creado durante la validación, auditado como cualquier
otra eliminación.

**Contenido real preservado.** El único evento real ("Campamento de
Jóvenes", 10 de octubre de 2026, La Vega - Cundinamarca, 80 personas) nunca
se eliminó ni se reemplazó — solo se editó dos veces desde el propio panel
(mover subtítulo, activar cuenta regresiva), igual que cualquier edición
normal de un admin, con su rastro completo en `audit_logs`.

## Página Contacto — "queremos escucharte" (arquitectura final)

`/contacto` pasó de "formulario administrativo" a experiencia editorial:
Hero (con CTA de texto a WhatsApp, no solo un ícono) → "Dos caminos"
(Quiero escribirles / Quiero hablar ahora, columnas editoriales sin
tarjetas) → formulario → "También puedes encontrarnos aquí" (dirección +
Cómo llegar, sin mapa — ver más abajo) → cierre en crema. Sigue siendo
`ƒ` (dinámico) desde este rediseño porque ahora lee `searchParams.evento`
(antes era `○` estático, sin dependencias por request).

**`contacts.phone`/`contacts.whatsapp` eran redundantes — verificado antes
de tocar nada.** La tabla tenía **0 filas reales en producción** (contacto
nunca se había usado todavía), así que la migración
`023_contacts_redesign.sql` pudo **eliminar `whatsapp` sin ningún riesgo de
pérdida de datos** — verificación explícita antes de una operación
destructiva, no un default. El campo único `phone` ("Teléfono / WhatsApp")
cubre el número; "cómo prefiere que lo contactemos" ahora es un concepto
real y propio: `preferred_channel` (enum `whatsapp`\|`llamada`\|`correo`).
La misma migración agrega `'evento'` al enum `contact_reason` (con
`ALTER TYPE ... ADD VALUE ... BEFORE 'otro'`, no destructivo), y dos
columnas de trazabilidad de consentimiento: `consent_at` (timestamptz,
default `now()`) y `privacy_policy_version` (texto — guarda el
`privacyPolicyUrl` vigente en el momento del envío; no existe un sistema
de versiones real, así que no se inventó uno, solo se dejó registro de
cuál URL estaba activa).

**Formulario dinámico según motivo — evita duplicar sistemas ya
existentes.** `ContactForm` (cliente) reacciona al `<select>` de Motivo:
- **"Necesito oración"**: oculta el resto del formulario y muestra un
  aviso ("Para cuidar tu privacidad, las peticiones de oración se reciben
  en un espacio separado.") + CTA a `/oracion` (el formulario de petición
  que ya existía, `prayer_requests`, con su propio RLS más estricto). La
  petición **nunca se duplica** en `contacts`.
- **"Quiero unirme a un grupo de crecimiento"**: mismo patrón, redirige a
  `/grupos/unirme` (`GroupJoinForm`, `group_join_requests`), que ya captura
  zona/localidad/grupo específico — campos que `contacts` no tiene y no se
  le agregaron, para no duplicar el modelo de datos de Grupos.
- **"Información sobre un evento"**: si se llega desde
  `/contacto?evento=<slug>` (nuevo — ver `/eventos/[slug]`, que ahora tiene
  un enlace discreto "¿Tienes preguntas sobre este evento? Contáctanos →"),
  el motivo se preselecciona solo y se muestra "Nos escribes sobre: {evento}"
  en vez de volver a preguntar. El slug viaja en un input oculto;
  `lib/actions/contact.ts` **resuelve el id real en el servidor** contra
  `events` (`published = true`) — nunca confía en un id enviado desde el
  cliente. El resto de motivos (visitar, información general, servir,
  otro) usan el formulario completo sin cambios.

**Canal preferido exige coherencia con el dato de contacto.**
`preferredChannel === "correo"` solo es válido si hay `email` (validado con
`.refine()` en `contactSchema`, servidor — nunca solo en el navegador).
WhatsApp/Llamada solo necesitan `phone`, que ya es obligatorio siempre. El
`<input type="email">` se marca `required` en el cliente dinámicamente
cuando el radio "Correo" está seleccionado (mismo patrón reactivo que el
motivo), pero la validación real y definitiva vive en el servidor.

**Accesibilidad de errores — no solo color.** Cada campo del formulario
lleva `aria-describedby`/`aria-invalid` apuntando al `<p id="...-error">`
correspondiente cuando existe un error de ese campo — antes los errores
eran visualmente adyacentes pero sin relación programática. Se extendió
`CartelRadioGroup` (`components/public/cartel-form.tsx`) con `onChange` y
`aria-describedby`, que no existían.

**Anti-spam y rate limiting — ya existían, no se reconstruyeron.**
Turnstile (`verifyTurnstile()`, deja pasar si no hay claves configuradas
todavía) y rate limiting en memoria (`checkRateLimit`, 5 envíos / 10 min
por IP) ya cubrían Contacto desde la Fase 12 — se conservan tal cual.
`privacyPolicyUrl` configurado hoy (`https://inspirachurch.com/privacidad-prueba`)
**es un valor de prueba**, no la política real — pendiente documentado
abajo, no se inventó una política nueva ni se cambió el mecanismo (sigue
siendo el mismo campo `site_settings.privacyPolicyUrl` que ya usan
Oración y Grupos).

**Estados de solicitud — se conserva el modelo de 4 estados existente, a
propósito.** El brief de esta sesión sugería simplificar a
Nuevo/En gestión/Atendido, pero `form_status` (`nueva`/`contactada`/
`en_seguimiento`/`finalizada`) es un enum **compartido** con
`group_join_requests` y `prayer_requests` — cambiarlo habría afectado
esos dos módulos, fuera de alcance de esta sesión sobre Contacto. El
modelo de 4 estados ya es simple y funcional; se documenta la decisión de
no tocarlo en vez de forzar un cambio no solicitado en otros módulos.

**Bandeja de Admin — ya existía (`/admin/formularios`), se actualizó para
el nuevo esquema.** `ContactRow.tsx` ahora muestra "Canal preferido",
consentimiento con fecha, y el nombre del evento de origen cuando
`event_id` no es null (resuelto contra una lista de eventos cargada en la
página, igual que ya se hacía con `groupNameById` para
`group_join_requests` — nunca se muestra el UUID). El indicador de
solicitudes nuevas en el Dashboard (`StatCard` "Contactos nuevos") **ya
existía** desde antes de esta sesión.

**Permisos — verificados, sin cambios.** `/admin/formularios` (módulo de
permisos `inbox`) es accesible para Editor; `/admin/contacto` (módulo
`contact_settings`, configuración de WhatsApp/redes/política/texto del
hero) es `adminOnly`. Esto ya separaba correctamente "gestionar
solicitudes" de "editar contenido público" antes de esta sesión — el
Editor puede leer contactos (dato personal) sin poder cambiar la
configuración del sitio, y viceversa no aplica. `prayer_requests` sigue
siendo un módulo de permisos aparte con su propio RLS (privadas solo para
admin) — Contacto y Oración nunca comparten tabla ni permisos.

**Texto del hero, administrable — mismo patrón que Inicio/Primera vez.**
`site_settings.contactHeroText` (nuevo campo en el blob JSONB `general`,
sin migración de esquema) sigue exactamente el patrón de
`heroText1`/`heroText2`/`firstTimeHeroText` — editable desde
`/admin/contacto` → "Página Contacto". El mensaje de WhatsApp por defecto
(`whatsappMessage`) ya era editable desde antes; no se duplicó.

**Sin mapa en Contacto, a propósito.** El brief permite omitirlo si ya
existe en Nosotros y sobrecarga la página — Contacto solo muestra
dirección en texto + enlace "Cómo llegar" a Google Maps
(`googleMapsLink()`, reutilizado, mismo helper que Inicio/Nosotros/Eventos).
No se creó una tercera implementación de mapas.

## Botón flotante de contacto (`ContactFAB`)

Reemplaza el botón fijo de WhatsApp que vivía en `app/(public)/layout.tsx`
— un botón circular (`#D2431B`, ícono de tres puntos vía `lucide-react`
`MoreHorizontal`/`X`) se despliega en sub-botones apilados verticalmente al
hacer clic. Cierra con Escape, clic afuera, o clic de nuevo en el botón
principal. `components/public/WhatsAppButton.tsx` **no se tocó** — sigue
usándose tal cual para el enlace "inline" dentro de `/contacto` (la línea
"¿Prefieres algo más directo?"), caso de uso distinto.

**Rediseñado en esta sesión — ahora muestra todas las redes sociales, no
solo correo/WhatsApp.** `ContactFAB` recibe `facebookUrl`/`instagramUrl`/
`tiktokUrl`/`xUrl`/`youtubeUrl` desde `app/(public)/layout.tsx` (los mismos
campos de `site_settings` que ya alimentan `SocialLinks` en el Footer) y
construye una lista de opciones (correo → WhatsApp → Facebook → Instagram
→ TikTok → X → YouTube, cada una `&&` condicional sobre si el dato existe)
en vez de dos bloques hardcodeados. Los íconos de cada red (`FacebookIcon`,
`InstagramIcon`, `TikTokIcon`, `XIcon`, `YouTubeIcon`) se **exportaron**
desde `SocialLinks.tsx` (antes privados a ese archivo) para reutilizarlos
aquí sin duplicar el SVG — cada uno ahora acepta un `className` opcional
para el tamaño, con el color fijado vía atributo `fill`/`stroke`
`currentColor` directo en el SVG (no una clase Tailwind `fill-current`),
así el llamador puede cambiar el tamaño sin perder el color.

**Un solo diseño, no el color de marca de cada red.** Todas las opciones
comparten el mismo círculo (`ABOUT_COLORS.tealLight`, `#508A8C`) en vez del
azul de Facebook/rosa de Instagram/etc. — la marca solo vive en el ícono.
Cada opción lleva una etiqueta de texto a la izquierda (Montserrat
Alternates, `9px`, color `#AFD6D3`) para identificarla sin depender del
ícono solo. Orden de abajo hacia arriba (más cerca del botón principal →
más lejos): WhatsApp, Instagram, TikTok, Facebook, YouTube, X, Correo.

`site_settings.contactEmail` sigue siendo el mismo campo (sin migración,
blob JSONB `general`) — administrable desde `/admin/contacto`. Vacío por
defecto; si no se configura, el FAB simplemente no muestra la opción de
correo (nunca un `mailto:` roto) — mismo criterio para cada red social si
su URL no está configurada.

## Ajustes puntuales en Inicio (post-Contacto)

Sesión corta de retoques visuales sobre `app/(public)/page.tsx`, sin cambios
de esquema ni de datos — documentada aquí porque tocó una tipografía nueva
que vale la pena conocer antes de seguir editando esa página:

- **Fuente local nueva, solo para una frase.** `lib/fonts.ts` agrega
  `gistesy` vía `next/font/local` (`public/fonts/Gistesy.ttf`, archivo
  provisto por el usuario — no es de Google Fonts, así que no requiere API
  key ni aparece en la tabla de "Servicios externos"). Se usa únicamente en
  la frase "¡En Inspira Church siempre habrá un lugar para ti!" del bloque
  "¿Eres nuevo?" — el resto de Inicio sigue en Anton/Hind. La fuente
  `caveat` (Google Font) que existía antes para esa misma frase se eliminó
  de `lib/fonts.ts` por quedar sin uso.
- **Color de esa frase**: cambiado de `CAMPAIGN_COLORS[4]` (rotativo) a
  `ABOUT_COLORS.tealLight` (`#508A8C`, fijo) en las 4 piezas del bloque
  (eyebrow, frase, borde del link, flecha). `CAMPAIGN_COLORS[4]` sigue
  usándose sin cambios en el paso 3 de "Tres pasos", más abajo en la misma
  página — son dos usos distintos, no confundir si se vuelve a tocar este
  archivo.
- **"Agenda" (eyebrow de "Próximos eventos")**: se experimentó con
  Gistesy/minúsculas/tamaños distintos y se revirtió explícitamente a como
  estaba — sigue siendo `<Eyebrow color={CAMPAIGN_COLORS[2]}>Agenda</Eyebrow>`,
  sin cambios netos.
- **`<h1>` faltante corregido**: el encabezado de la sección "Bienvenida"
  de Inicio pasó de `<h2>` a `<h1>` (antes de esto, Inicio no tenía ningún
  `<h1>` real — mismo tipo de hueco que ya se había corregido en
  `/oraciones`, ver esa sección arriba).
- **Bug de contenido (no de código) encontrado y corregido**: la sección
  "En vivo" no aparecía pese a que el canal de YouTube sí estaba
  transmitiendo en el momento. Causa: `site_settings.youtubeChannelId`
  apuntaba a un canal distinto del real — `lib/youtube.ts` solo falla en
  silencio cuando la variable de entorno o el canal *faltan*, no cuando el
  ID configurado es simplemente el equivocado, así que no había ningún
  error visible en logs. Corregido desde `/admin/inicio`, no en código. Si
  "En vivo" vuelve a no aparecer con el canal transmitiendo, revisar ese
  campo antes que el código.

## Logo y color de marca (`#508A8C`)

El logo (`public/logo.png`, `public/logo-square.png`, `app/icon.png`,
`app/apple-icon.png`) se reemplazó por el diseño nuevo del usuario,
recoloreado de negro a `#508A8C` (`ABOUT_COLORS.tealLight`) preservando el
alpha/anti-aliasing original — procesado con `sharp` (recolor por
`RGB=target` + alpha original tal cual, sin tocar la forma). Las versiones
cuadradas (`logo-square.png`/`icon.png`/`apple-icon.png`) son **planas, sin
halo ni resplandor** — se probó un halo blanco de contraste para el
favicon y se quitó a pedido explícito ("ningún logo debe tener efectos").
El texto "Inspira Church" del Header (junto al logo) también pasa de
blanco a `#508A8C`. El botón "Generaciones" del Header (ver abajo) ya usa
ese mismo color. La paleta de "Tres pasos" en Inicio (`app/(public)/
page.tsx`) se fijó a 3 colores propios en vez de `CAMPAIGN_COLORS`
rotativo — ver commit `ad2cd9b` para los valores exactos si se necesita
retocar.

## Header — botón "Generaciones" (reemplaza "Planea tu visita" ahí)

El botón del Header que antes decía "Planea tu visita" (→ `/contacto`)
ahora dice **"Generaciones"** y lleva a `/generaciones`, con ícono
`Users` de `lucide-react` y fondo `ABOUT_COLORS.tealLight` en vez del
coral estándar — deliberadamente distinto de los demás CTA del sitio.
**Alcance acotado a propósito**: el CTA "Planea tu visita" de Inicio
(`app/(public)/page.tsx`, sección Bienvenida) **no se tocó** y sigue
apuntando a `/contacto` — la decisión del usuario fue "el del header", no
todos los usos del texto. `NAV_LINKS` (`lib/constants.ts`) ganó
"Donaciones" al final (después de "Contacto") — ese sí es un ítem normal
del menú, sin estilo especial; aparece tanto en el nav de escritorio/móvil
del Header como en la lista "Explora" del Footer (mismo array, sin
duplicar datos). `Footer.tsx` ganó el ícono `HandCoins` en `NAV_ICONS`
para esa entrada.

## Página Donaciones

`/donaciones` — página "próximamente" con la misma identidad cartel que
Generaciones (Eyebrow, `PosterHeading`-style, sección "Muy pronto", CTA a
`/contacto`). Enlazada de forma discreta desde el Footer (barra inferior,
junto a "Política de privacidad") y desde `NAV_LINKS` (ver arriba). Sin
tabla ni migración propia — es contenido 100% estático en código, como
Generaciones lo era antes de su rediseño de esta sesión.

## Página Generaciones — rediseño editorial completo (arquitectura final)

`/generaciones` pasó de un "próximamente" de 3 secciones a una experiencia
editorial de **13 secciones narrativas**, cada una su propio componente en
`components/public/` con el prefijo `Generations*`: `GenerationsHero`,
`GenerationsVision`, `GenerationsLegacy`, `GenerationsAreas`,
`GenerationsJourney`, `GenerationsRatio`, `GenerationsAltar`,
`GenerationsFamilies`, `GenerationsNextDate`, `GenerationsRhythm`,
`GenerationsSafety`, `GenerationsFAQ`, `GenerationsCTA`, compuestos en
`app/(public)/generaciones/page.tsx`. Presenta Generaciones como el pilar
de ministerios por edad (niños/jóvenes descubriendo dones y sirviendo),
con el mismo sistema cartel del resto del sitio (negro, Anton, coral,
`ABOUT_COLORS`) y usando **el `Container` real compartido** (no un ancho
propio) — el usuario pidió explícitamente cuidar los márgenes; reusar
`Container` los deja consistentes con el resto de páginas sin esfuerzo
extra.

**Iteración: prototipo primero, código real después, a pedido explícito.**
El usuario pidió primero "una página de ejemplo sin tocar el código
actual" — se construyó como un Artifact HTML autocontenido (sistema visual
Cartel replicado en CSS puro + Google Fonts Anton/Hind), se iteró ahí
(corrección de márgenes edge-to-edge), y **solo después** de su aprobación
("reemplaza esto la página generaciones con el código que acabas de
crear") se migró a componentes React reales. El artifact prototipo no
forma parte del repo — es una referencia visual externa, no una fuente de
verdad de código.

**Sin fotos reales todavía — mismo patrón de placeholder que Hero.tsx.**
`components/public/GenerationsPhotoSlot.tsx` es el helper compartido:
acepta `photoUrl?: string | null` (para cuando exista integración real con
`media`) y si es `null` muestra un degradado con el color de la sección +
etiqueta de texto ("Foto — niños y jóvenes sirviendo", etc.) — igual que
`PLACEHOLDER_SLIDES` en `Hero.tsx` para el hero de Inicio. Nunca una foto
inventada ni un `<img>` roto.

**Reveal en scroll, reutilizado, no reinventado.** `components/public/
Reveal.tsx` es un wrapper genérico nuevo alrededor de `useScrollReveal`
(el mismo hook que ya usan `AboutHero`/`PastoralTeam`/`LeadershipMosaic`)
para no repetir el hook a mano en cada bloque suelto de las 13 secciones.
`GenerationsJourney` (línea de progreso de 4 etapas) y `GenerationsRhythm`
(palabra activa entre Prepárate/Practica/Sirve/Crece) usan su propio
`IntersectionObserver` en vez de `Reveal`/`useScrollReveal` porque
necesitan saber *cuántos* elementos están activos o hacer *toggle* (no
solo "una vez visible, se queda así") — documentado inline en cada
archivo. **Gotcha real encontrado**: la regla de lint `react-hooks/
set-state-in-effect` (parte del set de reglas "React Compiler" que ya usa
este proyecto) prohíbe llamar `setState` de forma síncrona como primera
instrucción de un efecto — el patrón correcto es un *lazy initializer* de
`useState(() => ...)` que llama a una función de verificación aparte (no
un `ref`, esa regla también prohíbe leer `ref.current` durante el render)
para el estado inicial, y el efecto solo se salta el `IntersectionObserver`
si ese valor inicial ya lo hace innecesario (`prefers-reduced-motion`) —
ver `prefersReducedMotion()` en `GenerationsJourney.tsx`/`GenerationsRhythm.tsx`
como referencia si se repite este patrón en otro componente.

**Detalle de área vía `<dialog>` nativo, mismo patrón que la biografía de
`PastoralTeam.tsx`.** `GenerationsAreas` (el mosaico "Descubre tu lugar",
9 áreas de servicio en grilla asimétrica con Tailwind `col-span`/
`row-span`) usa un único `<dialog>` compartido con estado `selected` (no
9 diálogos independientes) — al tocar una tarjeta, `showModal()` con los
datos de esa área (edad sugerida, horario, práctica, propósito — texto
literal de la documentación que dio el usuario, nada inventado). El FAQ
(`GenerationsFAQ`) reutiliza el mismo acordeón `grid-rows-[0fr]/[1fr]` +
`aria-expanded`/`aria-controls` de `BeliefsAccordion.tsx`.

**Datos sin definir → estados neutros, nunca inventados.** "Próximo
Generaciones" (`GenerationsNextDate`) no tiene fecha real todavía → muestra
"Próxima fecha muy pronto" en vez de una fecha falsa. "Guía para padres" y
"Lineamientos de cuidado" (`GenerationsFamilies`/`GenerationsSafety`) no
tienen documento real todavía → botones deshabilitados con nota explicando
que se activan solos cuando exista el enlace real — nunca un link muerto.
"Inscríbete en Generaciones" (`GenerationsCTA`) lleva a `/contacto` por
ahora, no a un formulario de inscripción propio.

**Pendiente real, marcado explícitamente para consulta humana antes de
construirlo:** un flujo de inscripción real recolectaría datos de
**menores de edad** (nombre, edad, colegio, alergias, contacto de
emergencia) — antes de crear cualquier tabla o política RLS para esto hace
falta decidir con el usuario: ¿tabla nueva o reutilizar alguna existente?,
¿quién en Admin puede leerla (solo `is_admin()`, o también
`is_editor_or_admin()`)?, ¿cómo se separa la autorización de tratamiento
de datos de la autorización de uso de imagen? Ninguna de estas decisiones
se tomó todavía — no existe ninguna tabla, RLS ni Server Action para
inscripciones de Generaciones en el repo.

**Otro pendiente real, más simple**: fotos reales, "Próxima fecha", "Guía
para padres" y "Lineamientos de cuidado" siguen sin ningún dato — hoy se
ven bien (placeholder/estado neutro), pero conectarlos a Admin de verdad
(nuevos módulos de `media`, un campo de fecha en `site_settings` o una
tabla propia, subida de PDF reutilizando el patrón de "Política de
privacidad" de abajo) es trabajo aparte, no incluido en este rediseño.

## Página Prédicas — corrección: grabaciones de oración se colaban

**Bug real encontrado y corregido, en dos lugares.** Las grabaciones de
oración (tema `PRAYER_TOPIC`) deben aparecer solo en `/oraciones` y
`/admin/oraciones`, nunca en `/predicas` ni `/admin/predicas` — pero dos
consultas no aplicaban el filtro `excludePrayerTopic` que sí usa el resto
de `lib/queries/sermons.ts`:
1. `getLatestSermon()` (usada para "Último mensaje" en `/predicas`) tomaba
   la prédica publicada más reciente por fecha sin filtrar el tema — si la
   grabación de oración más reciente era justo lo último publicado,
   aparecía ahí. Corregido: ahora trae `limit(10)` filas ordenadas por
   fecha y descarta las de tema oración antes de elegir la primera.
2. `app/admin/(dashboard)/predicas/page.tsx` seleccionaba **todas** las
   filas de `sermons` sin filtrar — a diferencia de `/admin/oraciones`,
   que sí filtra (al revés, incluyéndolas). Corregido con el mismo
   criterio invertido, mismo helper de comparación case-insensitive que ya
   usa `/admin/oraciones`.

## Horarios — recurrencia mensual (`schedules.recurrence`)

Un horario en `/admin/horarios` ya no está limitado a "cada semana" —
puede marcarse como recurrencia mensual (ej. "Reunión de Generaciones, el
último domingo de cada mes"). Migración `024_schedules_recurrence.sql`:
enum `schedule_recurrence` ('weekly'|'monthly', default 'weekly') +
`schedules.monthly_week` (nullable, `1`/`2`/`3`/`4` = primera–cuarta
semana, `-1` = última semana del mes, sin importar si tiene 4 o 5). El
formulario (`ScheduleForm.tsx`) muestra un selector "¿Qué semana del mes?"
solo cuando `recurrence = 'monthly'`. `lib/format.ts` gana
`scheduleDayLabel(dayOfWeek, recurrence, monthlyWeek)` — "Domingo" para
semanal, "Último domingo de cada mes" para mensual — usado en el listado
de Admin, Inicio y `/oraciones` en vez de `dayName()` a secas (que sigue
usándose tal cual para Grupos, que no tiene este concepto). `lib/queries/
schedules.ts` (`getActiveSchedules()`) selecciona los dos campos nuevos.

## Eventos — video promocional de YouTube

`events.promo_video_url` (migración `025_events_promo_video.sql`, text
nullable) — un evento puede tener un video promocional opcional, editable
desde `/admin/eventos` (`EventForm.tsx`, campo "Video promocional
(YouTube)", validado como URL). En `/eventos/[slug]` se muestra una
sección "Video promocional" (título grande centrado, `anton`, coral) que
reutiliza `LazySermonVideo` tal cual (mismo componente de Prédicas/
Oraciones, miniatura + Play hasta el clic) — **la sección entera no se
renderiza si el campo está vacío**, nunca un reproductor roto.

## Política de privacidad — ahora se sube como PDF, no como link

Antes `site_settings.privacyPolicyUrl` era un campo de texto donde el
admin pegaba a mano un link externo. Ahora es un **PDF subido** desde
`/admin/contacto` (`components/admin/DocumentUploadField.tsx`, nuevo,
mismo patrón de subida directa navegador→Storage que `ImageUploadField`
pero **sin pasar por la tabla `media`** — es un único documento legal, no
un asset reutilizable de la librería). El campo `privacyPolicyUrl` en
`site_settings` sigue llamándose igual y sigue siendo una URL — solo que
ahora esa URL es la del archivo en el bucket `documents` (ver arriba) en
vez de un link pegado a mano; ningún otro código tuvo que cambiar de
nombre de campo.

**Se muestra dentro del sitio, no como archivo crudo.** Nueva página
`/politica-de-privacidad` (con Header/Footer normales) embebe el PDF vía
`<iframe>` — si no hay `privacyPolicyUrl` configurado, muestra un mensaje
neutro en vez de una página vacía o rota. Los 5 lugares que antes
enlazaban directo a `privacyPolicyUrl` (Footer × 2 enlaces, y los
formularios de Contacto/Oración/Grupos/Primera vez que piden
consentimiento) ahora enlazan a `/politica-de-privacidad` en su lugar —
así el visitante nunca sale del sitio a ver un PDF crudo sin la marca de
Inspira Church. **Gotcha real**: hubo que agregar `https://*.supabase.co`
a la directiva `frame-src` de la CSP en `next.config.ts` — sin eso, el
`<iframe>` que apunta al PDF en Supabase Storage queda bloqueado en
silencio por el navegador (nada en consola aparte del error de CSP).

## Librería de medios (Admin) — agrupada por página, con miniaturas

`/admin/medios` pasó de una sola grilla de tarjetas grandes sin orden a
miniaturas pequeñas **agrupadas por la página del sitio a la que
pertenecen** (Inicio, Nosotros, Primera vez, Prédicas y series, Equipo,
Grupos, Eventos, y un grupo "Otros" para lo que no encaje). La agrupación
usa el campo `media.module` que ya se guardaba en cada subida (los slides
del hero de Inicio son `hero-slide-N`, Nosotros usa `nosotros-hero`/
`nosotros-essence`, Primera vez usa `primera-vez-hero`; el resto de
buckets sin `module` explícito caen al nombre del bucket — `sermons`,
`pastors`, `events`, `groups`) — la función `pageGroup(bucket, module)` en
`app/admin/(dashboard)/medios/page.tsx` mapea esos valores a la etiqueta
de página, sin ningún campo ni migración nueva. El botón de borrar pasó de
texto a un ícono `Trash2` que aparece solo al pasar el mouse sobre la
miniatura.

## Formularios (Admin) — ahora se pueden eliminar

`/admin/formularios` (Contactos, Solicitudes de grupo, Primera vez) ganó
botón "Eliminar" en cada fila (`ConfirmForm` + Server Action, mismo patrón
exacto que ya usaban Eventos/Prédicas/Oración). `lib/actions/inbox.ts`
gana `deleteContact`, `deleteGroupJoinRequest`, `deleteFirstTimeConnection`
— cada una con `logAudit()`, siguiendo el patrón ya establecido por
`deletePrayerRequest`. **No hizo falta ninguna migración**: las políticas
`contacts_delete_staff`, `group_join_requests_delete_staff` y
`first_time_connections_delete_staff` (`is_editor_or_admin()`) ya existían
desde `008_forms.sql`/`017_first_time_connections.sql` — el hueco era solo
de UI, no de seguridad. (Peticiones de oración ya tenían su botón "Borrar
definitivamente" desde antes, gateado a `isAdmin` — sin cambios ahí.)

## Retoques visuales puntuales (Nosotros, Liderazgo)

- **Contorno oscuro en texto sobre foto**: `EssenceStatement.tsx` (sección
  "foto" de Nosotros, "Amamos a Dios, amamos a las personas") tenía solo
  una sombra suave que no bastaba para leerse sobre partes claras de la
  foto de fondo — se reforzó con un contorno negro sólido en las 4
  direcciones + resplandor, vía `text-shadow` con múltiples capas
  (Tailwind arbitrary value, no una clase nueva).
- **Mosaico de liderazgo con rotación automática**: `LeadershipMosaic.tsx`
  ("Lideramos sirviendo") — antes el elemento "grande" del mosaico era
  siempre el mismo (índice `i % 4 === 0` fijo); con menos de 4 líderes
  activos esa fórmula a veces no le tocaba a nadie ser grande (bug real,
  encontrado con los 3 líderes reales de producción). Ahora los **cuadros
  son fijos** (tamaño/posición/color por posición nunca cambian, el slot 0
  siempre es el grande) y **el contenido rota** cada 12s entre los
  líderes disponibles (sin repetir a nadie, tipo "sillas musicales"),
  con un disolvido lento de 4s que atenúa hasta 12% de opacidad antes de
  cambiar la foto — así el momento del cruce queda oculto y nunca se ve
  brusco. Respeta `prefers-reduced-motion` (sin rotación si el usuario lo
  prefiere).

## Servicios externos

| Servicio | Uso confirmado | Evidencia |
|---|---|---|
| **GitHub** | Remoto único, `origin` | `github.com/edwinosman/inspira-church-web.git` |
| **Supabase** | Postgres + Auth + Storage, las tres superficies activas | `@supabase/ssr` + `@supabase/supabase-js` en `package.json`, `lib/supabase/*` |
| **Cloudflare Turnstile** | Anti-bot en Contacto, Oración, Unirme a grupo, Primera vez (Déjanos tus datos) | `lib/turnstile.ts`, `TurnstileWidget.tsx`, allowlisted en CSP de `next.config.ts` |
| **Google — Fonts** | `next/font/google` (Anton/Hind/Montserrat Alternates en `lib/fonts.ts`, Figtree/Petrona en `app/layout.tsx`). Aparte, `gistesy` en el mismo archivo es `next/font/local` con un archivo `.ttf` provisto por el usuario — no es un servicio de Google, no requiere configuración | Self-hosted en build, **no requiere API key** |
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
oración fuera de Prédicas hacia `/oraciones`, la ficha de conexión "Déjanos
tus datos" de Primera vez (migración 017, tabla `first_time_connections`,
bandeja en `/admin/formularios`), el rediseño contemplativo de Oraciones
con página individual `/oraciones/[slug]` y `sermons.meeting_type`
(migración 021), el rediseño editorial de Eventos con estado calculado por
fecha, cuenta regresiva, inscripción, información práctica y ubicación
(migración 022), y el rediseño de Contacto con canal preferido, formulario
dinámico según motivo (redirige a Oración/Grupos en vez de duplicar) y
contexto de evento de origen (migración 023).

**Sesión más reciente (esta), también ya en `main`**: logo recoloreado a
`#508A8C` sin efectos de brillo (favicon/OG/header/footer incluidos),
botón "Generaciones" reemplazando "Planea tu visita" en el Header, colores
fijos nuevos en "Tres pasos" e "Bienvenido a Inspira Church" de Inicio,
recurrencia mensual en Horarios (migración 024), video promocional
opcional en Eventos (migración 025), corrección de dos huecos donde
grabaciones de oración se colaban en Prédicas (`getLatestSermon()` y el
listado de `/admin/predicas`), refuerzo de contraste de texto en
`EssenceStatement` (Nosotros), rediseño de `LeadershipMosaic` con rotación
automática de fotos (cuadros fijos, contenido rota, disolvido de 4s cada
12s — corrigiendo además un bug real donde podía no haber ninguna foto
"grande" con menos de 4 líderes), redes sociales completas en `ContactFAB`
(antes solo correo/WhatsApp), Política de privacidad migrada de link
externo a PDF subido y embebido en `/politica-de-privacidad` (bucket
`documents`, migración 026), rediseño de la librería de medios agrupada
por página, capacidad de eliminar en Contactos/Solicitudes de
grupo/Primera vez, páginas nuevas `/donaciones` (próximamente) y el
rediseño editorial completo de `/generaciones` (13 secciones, ver sección
"Página Generaciones" arriba) — ver detalle de cada uno en sus secciones
correspondientes arriba y `git log` para los commits exactos.

**Nota operativa**: `.claude/launch.json` tiene `autoPort: true` en la
config `inspira-church-dev` porque han corrido varias sesiones de Claude
Code contra este mismo repo en paralelo en la máquina del usuario — evita
el error "Another next dev server is already running" reasignando puerto
en vez de fallar. Si el servidor de desarrollo no responde donde se espera,
revisar qué puerto tomó antes de asumir que está caído.

**Pendiente / abierto, en orden de relevancia:**

1. Fase 15 (Producción) — no iniciada. Falta confirmar si existe ya un
   proyecto Vercel conectado (no hay evidencia en el repo).
2. ~~Auditoría de `sermon-series.ts` sin cobertura de `logAudit`~~ — resuelto
   durante el rediseño de Prédicas (ver sección "Página Prédicas" arriba).
3. Sistema de permisos finos (`has_permission`, `015_permissions.sql`)
   sigue sin usarse en ninguna política RLS — decidir si se activa o se
   retira si no va a usarse.
4. Confirmar con el equipo pastoral si el Editor debe leer peticiones de
   oración privadas (`prayer_requests.is_private`).
5. Revisión legal del texto de consentimiento de datos (Ley 1581 de 2012,
   Colombia) en los formularios públicos — pendiente desde la Fase 12. El
   mecanismo cambió esta sesión (`site_settings.privacyPolicyUrl` ahora es
   un PDF subido desde `/admin/contacto`, embebido en
   `/politica-de-privacidad` — ver esa sección arriba), pero **el contenido
   legal del documento sigue sin confirmar que sea el definitivo** —
   verificar con el usuario que el PDF actualmente cargado es la política
   real antes de considerar este punto resuelto.
6. ~~Nosotros — fotos de marca sin cargar~~ — resuelto: `nosotros-hero` y
   `nosotros-essence` ya tienen foto real subida desde `/admin/nosotros`,
   confirmado en vivo en `/nosotros` tras aplicar la migración `018`.
7. ~~Nosotros — sin líderes activos~~ — resuelto: ya hay 3 filas
   `type='lider', active=true` en `team_members`, `LeadershipMosaic`
   ("Lideramos sirviendo") se renderiza correctamente en producción.
8. Oraciones — solo existe un horario real en `schedules`
   ("Oración Presencial", miércoles). El Hero de `/oraciones` y la sección
   "Ora con nosotros" de Inicio ya están preparados para mostrar más
   horarios de oración automáticamente (fuente única, `getPrayerSchedules()`)
   en cuanto el equipo pastoral cree uno nuevo (ej. "Oración Virtual",
   viernes) desde `/admin/horarios` — no requiere ningún cambio de código.
9. Solo existe una cuenta en `profiles` (Edwin Osman, Administrador) — nunca
   se ha validado en vivo el comportamiento del rol Editor (permisos ocultos
   en el nav, RLS aplicada de verdad) porque no hay con quién probarlo.
   Verificado únicamente por lectura de código (`admin-nav.ts`, políticas
   RLS) en las últimas sesiones. Crear una cuenta Editor de prueba desde
   `/admin/usuarios` → "Invitar" para poder validarlo en vivo.
10. El bug de `toRow()` corregido en `lib/actions/events.ts` (campos
    opcionales en `undefined` que `JSON.stringify` omite del payload, así
    que un `update` nunca los vacía aunque el admin borre el campo) tiene la
    misma forma en varios otros `lib/actions/*.ts` no auditados — vale la
    pena revisar `sermons.ts`, `growth-groups.ts`, `team-members.ts`,
    `about.ts` y `sermon-series.ts` por el mismo patrón.
11. **Generaciones — inscripción real, requiere decisión humana antes de
    tocar Supabase.** `/generaciones` (rediseño de esta sesión) todavía no
    tiene un formulario de inscripción propio — "Inscríbete en
    Generaciones" enlaza a `/contacto`. Un formulario real recolectaría
    datos de **menores de edad** (nombre, edad, colegio, alergias, contacto
    de emergencia) y necesita, antes de crear cualquier tabla/política RLS:
    decidir si reutiliza alguna tabla existente o crea una nueva, quién en
    Admin puede leerla (`is_admin()` vs. `is_editor_or_admin()`), y cómo se
    separa el consentimiento de tratamiento de datos del de uso de imagen.
    Ver sección "Página Generaciones" arriba.
12. Generaciones — fotos reales, "Próxima fecha", "Guía para padres" y
    "Lineamientos de cuidado" siguen sin contenido real (todos con estado
    neutro/deshabilitado a propósito, nunca inventado) — conectarlos exige
    nuevos módulos de `media`/`site_settings` o subida de PDF (mismo patrón
    que Política de privacidad), trabajo aparte no incluido en el rediseño.
13. Discrepancia de logo reportada por el usuario durante esta sesión
    ("sigo viendo el mismo [logo]") nunca se confirmó resuelta con
    evidencia visual en vivo — el código y los archivos en el repo ya
    reflejan el logo nuevo (`#508A8C`, sin brillo), pero si se reporta de
    nuevo, sospechar primero de caché del navegador/CDN antes que del
    código.
