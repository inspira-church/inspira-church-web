import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Compone clases condicionales sin colisiones (p. ej. dos valores de
 * `px-*` en el mismo elemento): clsx arma la lista, tailwind-merge resuelve
 * cuál gana.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
