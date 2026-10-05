/** PostgREST responde PGRST205 (o Postgres 42P01) cuando la tabla consultada no existe todavía. */
export function isMissingTableError(error: { code?: string } | null | undefined): boolean {
  return error?.code === "PGRST205" || error?.code === "42P01";
}
