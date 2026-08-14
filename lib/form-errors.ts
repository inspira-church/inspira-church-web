/** Primer mensaje de error por campo — suficiente para mostrar bajo cada input. */
export function firstFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export interface ActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}
