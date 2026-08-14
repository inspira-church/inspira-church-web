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

> Nota de versión: Next.js 16 renombró `middleware.ts` a **`proxy.ts`**
> (mismo propósito, función exportada `proxy` en vez de `middleware`). Este
> proyecto usa la convención nueva desde el inicio.

## Instalación

Requiere Node.js LTS y una cuenta de Supabase.

```bash
npm install
```

Copia `.env.example` a `.env.local` y completa los valores desde tu proyecto
de Supabase (Settings → API):

```bash
cp .env.example .env.local
```

| Variable | Dónde se usa | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente y servidor | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente y servidor | Clave pública `anon` (protegida por RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor | Bypasea RLS. Nunca en código de cliente. Uso excepcional — ver `supabase/README.md` |

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
├─ (public)/         Sitio público (grupo de rutas, sin prefijo en la URL)
├─ admin/            Panel administrativo — protegido en proxy.ts (Fase 6)
proxy.ts              Refresco de sesión de Supabase (antes middleware.ts)
lib/
├─ supabase/         Clientes de Supabase (server, browser, proxy)
├─ validations/       Esquemas Zod por módulo (se agregan por fase)
├─ actions/           Server Actions por módulo (se agregan por fase)
types/
└─ database.types.ts  Placeholder — regenerar con `supabase gen types typescript`
supabase/
├─ migrations/        Esquema SQL + políticas RLS, en orden
└─ README.md          Bootstrap del admin, buckets de Storage
```

## Estado del proyecto

Desarrollo por fases (ver documento de arquitectura). Completadas:

1. ✅ Arquitectura
2. ✅ Diseño de base de datos
3. ✅ Configuración inicial — este commit
4. ⬜ Diseño visual
5. ⬜ Sitio público
6. ⬜ Autenticación
7. ⬜ Panel administrativo
8–15. ⬜ Módulos de contenido, seguridad, SEO, pruebas, producción

## Despliegue

Vercel, conectado al repositorio Git. Configurar las mismas variables de
entorno de `.env.local` en el dashboard de Vercel (Project → Settings →
Environment Variables) antes del primer deploy.
