# Auditoría de producción — Inspira Church

**Fecha:** 2026-08-28
**Alcance:** auditoría técnica completa (SEO, seguridad, rendimiento, accesibilidad,
formularios, Cloudflare/Vercel) previa al lanzamiento profesional del sitio en
`https://inspirachurch.co`. No se modificó diseño visual, estructura, tipografías,
paleta de colores ni animaciones existentes — solo se corrigieron problemas técnicos
reales.

---

## 1. Resumen ejecutivo

El sitio está construido sobre una base sólida: Next.js 16 (App Router) + Supabase,
desplegado en **Vercel** (no Cloudflare Pages/Workers — Cloudflare aquí es solo
registrador de dominio + DNS + Turnstile). La auditoría no encontró vulnerabilidades,
secretos expuestos, ni errores de build. Los problemas reales estaban concentrados en
tres áreas: **metadata/SEO incompleta** (14 de 19 páginas sin `canonical`/Open Graph,
la portada sin metadata propia), **una página 404 sin identidad de marca**, y
**accesibilidad de errores de formulario** implementada solo en uno de cinco
formularios públicos. Todo eso ya se corrigió en esta sesión.

Quedan dos decisiones/pasos que requieren acceso a Vercel/Cloudflare que esta sesión
no pudo completar por no tener el navegador disponible — ver secciones 5 y 8.

**¿Listo para lanzamiento?** Sí, a nivel técnico — ver el veredicto detallado en la
sección 8 al final.

---

## 2. Cambios realizados

### Archivos nuevos (2)
- `app/not-found.tsx` — página 404 con identidad de marca (cartel, negro, Anton,
  enlace de vuelta a inicio y a Contacto). Antes se mostraba el 404 genérico de
  Next.js, sin marca y en inglés.
- `components/public/OrganizationJsonLd.tsx` — datos estructurados JSON-LD
  (`schema.org/Church`) con solo datos reales ya configurados en `site_settings`
  (dirección, coordenadas, redes sociales, correo). Nunca inventa un campo: cada uno
  se omite si no está configurado. Se excluye explícitamente el número de WhatsApp
  placeholder (`573000000000`) para no publicar un teléfono falso.

### Archivos modificados (30)

**SEO — metadata, canonical y Open Graph** (`alternates.canonical` + `openGraph` en
14 páginas que tenían título/descripción pero nada más; título/descripción propios
en la portada, que no tenía ninguno de los dos):
`app/(public)/page.tsx`, `app/(public)/nosotros/page.tsx`,
`app/(public)/predicas/page.tsx`, `app/(public)/grupos/page.tsx`,
`app/(public)/grupos/unirme/page.tsx`, `app/(public)/eventos/page.tsx`,
`app/(public)/oraciones/page.tsx`, `app/(public)/contacto/page.tsx`,
`app/(public)/primera-vez/page.tsx`, `app/(public)/oracion/page.tsx`,
`app/(public)/generaciones/page.tsx`, `app/(public)/generaciones/inscripcion/page.tsx`,
`app/(public)/donaciones/page.tsx`, `app/(public)/politica-de-privacidad/page.tsx`.

**SEO — Twitter Card `summary_large_image`** (antes `summary`, sin imagen) en
`app/layout.tsx` y en las 3 páginas dinámicas que ya tenían Open Graph con imagen:
`app/(public)/predicas/[slug]/page.tsx`, `app/(public)/eventos/[slug]/page.tsx`,
`app/(public)/oraciones/[slug]/page.tsx`, `app/(public)/series/[slug]/page.tsx`
(esta última ganó canonical/OG que no tenía).

**SEO — sitemap** (`app/sitemap.ts`): se agregaron las 6 rutas estáticas que
faltaban (`/oraciones`, `/primera-vez`, `/generaciones`,
`/generaciones/inscripcion`, `/donaciones`, `/politica-de-privacidad`) y todas las
entradas dinámicas de `/oraciones/[slug]` (grabaciones de oración), que no se
generaban nunca.

**Datos estructurados**: `app/(public)/layout.tsx` renderiza el nuevo
`OrganizationJsonLd`.

**Accesibilidad de formularios** — se llevó el patrón ya usado en `ContactForm.tsx`
(único formulario con `aria-describedby`/`aria-invalid` en errores y
`role="status" aria-live="polite"` en el mensaje de éxito) a los otros cuatro
formularios públicos: `components/public/PrayerRequestForm.tsx`,
`components/public/GroupJoinForm.tsx`,
`components/public/FirstTimeConnectionForm.tsx`,
`components/public/GenerationsRegistrationForm.tsx`.

**Enlaces internos** — se agregó `rel="noopener noreferrer"` a los 7 enlaces
`target="_blank"` hacia `/politica-de-privacidad` que no lo tenían (en los 5
formularios de arriba, `ContactForm.tsx` y `Footer.tsx`, este último con 2 enlaces).

**`prefers-reduced-motion`** — se agregó `motion-reduce:transition-none` a las
transiciones de hover que no lo tenían en `components/public/SermonCard.tsx`,
`components/public/GroupCard.tsx` y `components/public/SermonSeriesShowcase.tsx`.

**Contenido** — se corrigió una tilde faltante en `app/(public)/page.tsx`
("habra" → "habrá" en "¡En Inspira Church siempre habrá un lugar para ti!").

### Verificación

- `npx eslint .` → 0 errores (2 warnings preexistentes/no relacionados).
- `npx tsc --noEmit` → sin errores.
- `npx vitest run` → 129/129 pruebas pasando.
- `npx next build` → build de producción exitoso, 54 páginas generadas
  correctamente, incluida la nueva `/_not-found`.
- No se pudo verificar visualmente en navegador (a pedido explícito del usuario
  durante esta sesión) — la verificación fue por tipos, lint, tests y build.
  **Recomendación**: revisar visualmente `/nosotros`, `/predicas`, `/eventos` y los
  5 formularios en una próxima sesión con navegador disponible, para confirmar que
  ningún cambio de accesibilidad alteró el layout visual (no debería, son solo
  atributos `aria-*`/`rel`, sin clases nuevas).

---

## 3. Problemas encontrados

### CRÍTICO
Ninguno. Se verificó en vivo contra `https://inspirachurch.co`: headers de
seguridad activos y coincidentes con el código, `sitemap.xml`/`robots.txt` con el
dominio correcto (no `localhost`), 0 vulnerabilidades en `npm audit`, 0 secretos
expuestos en el repositorio, service role key nunca usada en cliente.

### ALTO (ya corregido)
1. La portada (`/`) no tenía `title`/`description`/`canonical`/Open Graph propios
   — heredaba el genérico del layout raíz. Es la página más visitada del sitio.
2. No existía página 404 con identidad de marca — se mostraba el 404 por defecto
   de Next.js, en inglés y sin ninguna forma de volver al sitio.
3. La accesibilidad de errores de formulario (`aria-describedby`/`aria-invalid`,
   confirmación con `aria-live`) solo estaba implementada en el formulario de
   Contacto, no en los otros cuatro formularios públicos.
4. No existían datos estructurados (JSON-LD) pese a tener ya datos reales
   disponibles (dirección, coordenadas, redes sociales) en `site_settings`.

### MEDIO (ya corregido, salvo lo marcado)
5. 14 de 19 páginas públicas no tenían `canonical` ni Open Graph (sí tenían
   título/descripción).
6. El sitemap no incluía 6 rutas estáticas ni ninguna entrada de
   `/oraciones/[slug]`.
7. La Twitter Card era `summary` (sin imagen) en vez de `summary_large_image`.
8. 7 enlaces internos a la política de privacidad con `target="_blank"` sin
   `rel="noopener noreferrer"`.
9. Faltaba `motion-reduce:` en 3 componentes con animación de hover
   (`SermonCard`, `GroupCard`, `SermonSeriesShowcase`).
10. Tilde faltante en un texto de la portada.
11. **No corregido — requiere decisión/acceso externo**: el Hero de la portada
    (`components/public/Hero.tsx`) usa `<img>` en vez de `next/image` para las
    fotos (con un comentario explicando que es por la URL dinámica de Supabase
    Storage). Es optimizable — `*.supabase.co` ya está en `remotePatterns` de
    `next.config.ts`, así que `next/image` probablemente funcionaría — pero es el
    elemento más visible del sitio (LCP de la portada) y no se pudo verificar
    visualmente en esta sesión. **Recomendación**: intentarlo en una sesión con
    navegador disponible, comparando visualmente antes/después.
12. **No corregido — requiere decisión/acceso externo**: dominio canónico. Ver
    sección 5.

### BAJO / informativo
13. CSP con `script-src`/`style-src` `'unsafe-inline'` en producción — reduce la
    defensa en profundidad contra XSS. Es un trade-off común de Next.js App Router
    (sin estrategia de nonce/hash). No es un defecto, es una decisión a evaluar si
    se quiere endurecer más adelante.
14. Dependencias de desarrollo (`eslint`, `typescript`, `@types/node`) varias
    versiones mayores por detrás de la última — sin vulnerabilidades conocidas, sin
    urgencia.
15. `lib/turnstile.ts` fallа abierto (deja pasar el envío) si
    `TURNSTILE_SECRET_KEY` no está configurada — diseño deliberado documentado en
    el código, pero **hay que confirmar manualmente que esa variable sí está
    puesta en el entorno de producción de Vercel** (no se pudo verificar desde el
    repo).
16. Dos posibles huecos de altura fija en móviles muy bajos (no confirmados
    visualmente): el mapa de `/grupos` (`GroupsExplorer.tsx`, 480px) y la grilla de
    áreas de `/generaciones` (`GenerationsAreas.tsx`, filas de 120px).
17. Fotos de equipo pastoral/liderazgo con `alt=""` (decorativo) — argumentable
    que deberían llevar el nombre de la persona en el `alt`, ya que la foto en sí
    aporta información (quién es) más allá del nombre visible al lado. Judgment
    call de baja severidad, no un error.
18. Homepage (`app/(public)/page.tsx`) tiene ~9 transiciones de hover sin
    `motion-reduce:` — de menor severidad que animaciones automáticas porque solo
    se activan con hover, pero inconsistente con el resto del sitio. No corregido
    en esta sesión por alcance (requiere tocar muchos puntos de un archivo grande).

---

## 4. Configuración pendiente en Cloudflare

**Ninguna.** Cloudflare aquí solo es registrador de dominio + DNS + Turnstile — no
hay Cloudflare Pages ni Workers en este proyecto (confirmado: no existe
`wrangler.toml`, `_headers`, `_redirects`, `functions/`, ni el paquete
`@cloudflare/next-on-pages`). Todo lo que sigue son registros DNS ya existentes,
sin cambios pendientes de este lado salvo verificarlos:

- **DNS**: confirmar que `google._domainkey` (DKIM), el registro MX y el SPF de
  `inspirachurch.co` siguen intactos (se configuraron en la sesión anterior de
  correo empresarial) — no se tocaron en esta auditoría.
- **Turnstile**: confirmar que el widget en el dashboard de Cloudflare
  (Turnstile → tu widget) tiene autorizados `inspirachurch.co` y
  `www.inspirachurch.co` como hostnames (esto ya se corrigió en la sesión
  anterior, antes de esta auditoría).

## 5. Configuración pendiente en Vercel

**Dominio canónico — decisión pendiente de ejecutar.** Verificado por HTTP en vivo:
hoy el dominio final es `https://inspirachurch.co` (sin `www`) —
`www.inspirachurch.co` redirige hacia el apex. Tus instrucciones de esta sesión piden
lo contrario: que `https://www.inspirachurch.co` sea el dominio final. Esto es un
cambio de configuración en Vercel, no de código (el código ya usa la variable de
entorno `NEXT_PUBLIC_SITE_URL`, así que en cuanto cambie ahí, `sitemap.xml`,
`robots.txt` y todos los `canonical`/`og:url` nuevos de esta auditoría se actualizan
solos, sin tocar nada más). Pasos exactos:

1. **Vercel Dashboard** → proyecto `inspira-church-web` → **Settings** →
   **Domains** → junto a `www.inspirachurch.co`, marcarlo como el dominio
   **primario** (Vercel reconfigura automáticamente el redirect de
   `inspirachurch.co` hacia `www.inspirachurch.co`).
2. **Vercel Dashboard** → **Settings** → **Environment Variables** → editar
   `NEXT_PUBLIC_SITE_URL` de `https://inspirachurch.co` a
   `https://www.inspirachurch.co`.
3. **Deployments** → volver a desplegar (`Redeploy`) la última producción — las
   variables `NEXT_PUBLIC_*` se compilan en el build, un cambio de valor no se
   aplica solo con guardar.
4. Verificar con `curl -I https://inspirachurch.co` (debe dar 307/308 hacia
   `https://www.inspirachurch.co`) y `curl https://www.inspirachurch.co/sitemap.xml`
   (las URLs internas deben decir `www`).

**Confirmar variable de Turnstile en producción**: en **Settings** →
**Environment Variables**, confirmar que `TURNSTILE_SECRET_KEY` tiene un valor real
en el entorno de Production (ver hallazgo #15 — si falta, los 5 formularios
públicos aceptan envíos sin verificación anti-bot, sin ningún error visible).

---

## 6. Configuración pendiente en Google

- **Search Console**: agregar la propiedad `https://www.inspirachurch.co` (o
  `https://inspirachurch.co`, según lo que se decida en la sección 5) y verificarla
  — el sitio ya está técnicamente listo para esto: `robots.txt` no bloquea nada
  relevante, `sitemap.xml` es accesible y dinámico, no hay `noindex` accidental en
  ninguna página pública (solo en `/admin`, correcto). No se generó ningún código de
  verificación ficticio — eso lo debes obtener tú directamente de Search Console.
- **Analítica**: no existe ningún sistema de analítica instalado hoy (ni Google
  Analytics, ni GTM, ni Cloudflare Web Analytics). No se instaló ninguno en esta
  sesión para no decidir por ti ni poner IDs ficticios. Si quieres agregar uno,
  dime cuál prefieres y su ID/measurement ID real, y lo dejo conectado vía variable
  de entorno.

---

## 7. Información que necesito de ti

1. **Confirmación para ejecutar el cambio de dominio canónico** (sección 5) — o
   dime si prefieres hacerlo tú mismo siguiendo esos 4 pasos.
2. **`TURNSTILE_SECRET_KEY` en Vercel producción** — confirma que está puesta (no
   necesito el valor, solo que exista).
3. **Imagen social (Open Graph)**: hoy el sitio usa una imagen generada
   automáticamente a partir del logo (`app/opengraph-image.tsx`) para cuando se
   comparte cualquier página sin imagen propia. Funciona, pero si más adelante
   quieres una imagen social diseñada a propósito (1200×630, con foto real de la
   iglesia), dime y la conecto — no inventé ninguna en esta sesión.
4. **Revisión legal del texto de consentimiento de datos** (Ley 1581 de 2012,
   Colombia) — sigue pendiente desde antes de esta auditoría (ver `CLAUDE.md`,
   pendiente #5). El PDF cargado en `/politica-de-privacidad` hoy es un valor de
   prueba, no confirmado como la política real definitiva.
5. Si quieres que intente la conversión del Hero de la portada a `next/image`
   (hallazgo #11) en una próxima sesión con navegador disponible, para poder
   verificarlo visualmente antes de darlo por bueno.

---

## 8. Veredicto

**El sitio está técnicamente listo para lanzamiento**, con dos pendientes menores
que no bloquean publicar pero conviene cerrar pronto:

- El dominio canónico (`www` vs. apex) es una decisión de configuración en Vercel,
  no un defecto — el sitio funciona correctamente en cualquiera de los dos casos
  hoy, solo hay que decidir cuál es el definitivo y aplicarlo (sección 5).
- Confirmar la variable `TURNSTILE_SECRET_KEY` en producción, para que la
  protección anti-spam de los 5 formularios esté realmente activa.

Todo lo demás — seguridad, SEO técnico, sitemap, robots, 404, datos estructurados,
accesibilidad de formularios, headers, dependencias, secretos — se verificó limpio
o se corrigió en esta sesión, con build de producción exitoso y 129/129 pruebas
pasando.
