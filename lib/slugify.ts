const COMBINING_DIACRITICS = /[̀-ͯ]/g;

/** "Una Vida con Propósito" -> "una-vida-con-proposito" */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "") // quita acentos (á -> a) tras la normalización NFD
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
