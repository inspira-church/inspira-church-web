"use client";

import { useActionState } from "react";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { updateAboutLocation } from "@/lib/actions/settings";
import type { ActionState } from "@/lib/form-errors";
import type { SiteSettings } from "@/lib/queries/settings";

const initialState: ActionState = {};

type Values = Pick<SiteSettings, "churchAddress" | "churchLat" | "churchLng">;

export function AboutLocationForm({ defaultValues }: { defaultValues: Values }) {
  const [state, formAction] = useActionState(updateAboutLocation, initialState);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <FormError message={state.error} />
      {state.success && (
        <p className="rounded-md border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-ink">
          Ubicación guardada.
        </p>
      )}

      <TextField
        label="Dirección de la iglesia"
        name="churchAddress"
        defaultValue={defaultValues.churchAddress}
        hint="Se muestra en esta página, junto al mapa, y en el footer."
      />
      {state.fieldErrors?.churchAddress && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.churchAddress}</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Latitud"
          name="churchLat"
          type="number"
          step="any"
          defaultValue={defaultValues.churchLat ?? ""}
          hint="Si defines lat. y long., el mapa aparece abajo."
        />
        <TextField
          label="Longitud"
          name="churchLng"
          type="number"
          step="any"
          defaultValue={defaultValues.churchLng ?? ""}
        />
      </div>
      {(state.fieldErrors?.churchLat || state.fieldErrors?.churchLng) && (
        <p className="-mt-3 text-xs text-danger">
          {state.fieldErrors.churchLat ?? state.fieldErrors.churchLng}
        </p>
      )}

      <SubmitButton>Guardar</SubmitButton>
    </form>
  );
}
