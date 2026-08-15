# Inspira Church — Plataforma Web

Sitio oficial de Inspira Church: sitio público informativo (prédicas, series,
grupos de crecimiento, eventos, horarios, formularios de contacto/oración) y
panel administrativo (CMS) para gestionar todo el contenido sin tocar código.

Documento de arquitectura completo (Fase 1): ver el artefacto publicado al
inicio del proyecto — roles, modelo de datos, seguridad y plan de fases.

## Stack

- **Frontend** — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend** — Supabase (Postgres, Auth, Storage, Row Level Security)
- **Hosting** — Vercel
- **Mapas** — OpenStreetMap + Leaflet
- **Video** — YouTube embebido (no se alojan archivos de video)
- **Anti-bot** — Cloudflare Turnstile (opcional en desarrollo, ver abajo)

> Nota de versión: Next.js 16 renombró `middleware.ts` a **`proxy.ts`**
> (mismo propósito, función exportada `proxy` en vez de `middleware`). Este
> proyecto usa la convención nueva desde el inicio.

## Instalación

Requiere Node.js LTS y una cuenta de Supabase.

```bash
npm install
```

Copia `.env.example` a `.env.local` y completa los valores:

```bash
cp .env.example .env.local
```

| Variable | Dónde se usa | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente y servidor | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente y servidor | Clave pública `anon`/`publishable` (protegida por RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor | Bypasea RLS. Nunca en código de cliente. Uso excepcional — ver `supabase/README.md` |
| `NEXT_PUBLIC_SITE_URL` | Servidor | Opcional. Origen del sitio para enlaces de correos de Auth |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cliente | Opcional en desarrollo — sin ella, los formularios funcionan sin verificación anti-bot |
| `TURNSTILE_SECRET_KEY` | Solo servidor | Opcional en desarrollo, ver nota anterior |

Aplica las migraciones de base de datos (`supabase/migrations/`) siguiendo
`supabase/README.md`, incluyendo el bootstrap del primer usuario admin.

## Ejecución local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El sitio público vive en
`/` y el panel administrativo en `/admin`.

## Estructura

```
app/
├─ (public)/          Sitio público (grupo de rutas, sin prefijo en la URL)
└─ admin/
   ├─ (auth)/          Login, recuperar/actualizar contraseña — sin sidebar
   └─ (dashboard)/      Panel protegido — sidebar + módulos del CMS
proxy.ts                Sesión de Supabase + protección de /admin (antes middleware.ts)
components/
├─ public/             Header, Footer, tarjetas y formularios del sitio público
├─ admin/              Shell del panel, formularios de cada módulo
└─ ui/                 Primitivos de diseño (Button, Card, campos de formulario…)
lib/
├─ supabase/           Clientes de Supabase (server, browser, proxy)
├─ actions/            Server Actions (mutaciones) por módulo
├─ queries/             Lecturas del sitio público por módulo
├─ validations/         Esquemas Zod por módulo
├─ rate-limit.ts        Límite de tasa en memoria (Fase 12)
└─ turnstile.ts         Verificación de Cloudflare Turnstile (Fase 12)
supabase/
├─ migrations/          Esquema SQL + políticas RLS, en orden
└─ README.md            Bootstrap del admin, buckets de Storage, auditoría RLS
```

## Seguridad

- **RLS en las 15 tablas/vista** — auditoría completa documentada en
  `supabase/README.md`.
- **Cabeceras HTTP** (`next.config.ts`): CSP, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`, HSTS.
- **Límite de tasa** en los 3 formularios públicos: 5 envíos cada 10 minutos
  por IP, en memoria del proceso (sin dependencias externas — ver el
  comentario en `lib/rate-limit.ts` sobre cuándo migrar a un store
  compartido).
- **Cloudflare Turnstile** en Contacto, Oración y "Unirme a un grupo" —
  gratis, se activa solo con las dos variables de entorno configuradas.

## Estado del proyecto

Desarrollo por fases (ver documento de arquitectura). Completadas:

1. ✅ Arquitectura
2. ✅ Diseño de base de datos
3. ✅ Configuración inicial
4. ✅ Diseño visual
5. ✅ Sitio público (datos de ejemplo)
6. ✅ Autenticación
7. ✅ Panel administrativo (estructura)
8. ✅ CRUD: Prédicas, Series, Equipo, Medios
9. ✅ CRUD: Grupos, Horarios
10. ✅ CRUD: Eventos
11. ✅ Formularios públicos conectados + bandejas admin
12. ✅ Seguridad: Turnstile, límite de tasa, cabeceras, auditoría RLS
13. ⬜ SEO y rendimiento
14. ⬜ Pruebas
15. ⬜ Producción

Pendientes dentro del alcance original que quedaron para más adelante:
módulos **Usuarios** y **Configuración** del panel (necesitan la
`service_role key` por primera vez para crear cuentas de staff).

## Despliegue

Vercel, conectado al repositorio Git. Configurar las mismas variables de
entorno de `.env.local` en el dashboard de Vercel (Project → Settings →
Environment Variables) antes del primer deploy.
