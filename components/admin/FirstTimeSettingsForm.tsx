"use client";

import { useActionState } from "react";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { updateFirstTimeSettings } from "@/lib/actions/settings";
import type { ActionState } from "@/lib/form-errors";
import type { SiteSettings } from "@/lib/queries/settings";

const initialState: ActionState = {};

type Values = Pick<SiteSettings, "firstTimeHeroText">;

export function FirstTimeSettingsForm({ defaultValues }: { defaultValues: Values }) {
  const [state, formAction] = useActionState(updateFirstTimeSettings, initialState);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <FormError message={state.error} />
      {state.success && (
        <p className="rounded-md border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-ink">
          Configuración guardada.
        </p>
      )}

      <TextAreaField
        label="Texto del hero"
        name="firstTimeHeroText"
        defaultValue={defaultValues.firstTimeHeroText}
        hint="El texto debajo del título en la página /primera-vez."
        rows={2}
        required
      />
      {state.fieldErrors?.firstTimeHeroText && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.firstTimeHeroText}</p>
      )}

      <SubmitButton>Guardar</SubmitButton>
    </form>
  );
}
