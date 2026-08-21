/**
 * Solo constantes — sin imports de Supabase. Separado de
 * lib/queries/generations-media.ts a propósito: ese archivo importa el
 * cliente de sesión (`@/lib/supabase/server`, depende de `next/headers`),
 * y GenerationsAreasEditor.tsx (componente cliente) necesita el nombre del
 * módulo de foto por área sin arrastrar ese import al bundle del navegador.
 */

export const GENERATIONS_PHOTO_MODULES = {
  hero: "generaciones-hero",
  legacy1: "generaciones-legacy-1",
  legacy2: "generaciones-legacy-2",
  altar: "generaciones-altar",
  families: "generaciones-families",
  cta: "generaciones-cta",
} as const;

export const generationsAreaPhotoModule = (areaId: string) => `generaciones-area-${areaId}`;
