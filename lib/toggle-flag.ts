import { createClient } from "@/lib/supabase/server";

type FlagTable =
  | "team_members"
  | "growth_groups"
  | "schedules"
  | "sermon_series"
  | "sermons"
  | "events"
  | "profiles";

export const TOGGLE_ERROR = "No se pudo aplicar el cambio. Intenta de nuevo.";
export const TOGGLE_NO_ROWS_ERROR =
  "No se aplicó el cambio: el registro no existe o no tienes permiso para modificarlo.";

/**
 * Escribe un interruptor (active / published) y dice la verdad sobre el
 * resultado: devuelve el mensaje de error, o null si de verdad se cambió una
 * fila. Supabase no devuelve error cuando RLS filtra el update o el id no
 * existe (solo 0 filas), así que se pide `.select("id")` y se cuenta.
 *
 * Quien llama NO debe auditar ni revalidar si esto devuelve un mensaje.
 */
export async function setFlag(
  table: FlagTable,
  id: string,
  column: "active" | "published",
  value: boolean,
  dbErrorMessage: string = TOGGLE_ERROR
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .update({ [column]: value })
    .eq("id", id)
    .select("id");

  if (error) return dbErrorMessage;
  if (!data || data.length === 0) return TOGGLE_NO_ROWS_ERROR;
  return null;
}
