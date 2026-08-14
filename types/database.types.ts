// Placeholder. Next.js 16 usa `proxy.ts`, no `middleware.ts` (ver proxy.ts en
// la raíz) — ese cambio de convención no afecta a este archivo.
//
// Este archivo se reemplaza por completo una vez el proyecto esté enlazado a
// una instancia real de Supabase (`supabase link`), ejecutando:
//
//   npx supabase gen types typescript --project-id <tu-project-id> > types/database.types.ts
//
// Hasta entonces se deja sin tipar (Database = unknown) para no inventar una
// forma de tipos que no ha sido generada realmente por la herramienta.
export type Database = Record<string, unknown>
