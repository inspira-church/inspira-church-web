"use client";

import { useActionState } from "react";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { updateHomeSettings } from "@/lib/actions/settings";
import type { ActionState } from "@/lib/form-errors";
import type { SiteSettings } from "@/lib/queries/settings";

const initialState: ActionState = {};

type Values = Pick<SiteSettings, "heroText1" | "heroText2" | "youtubeChannelId">;

export function HomeSettingsForm({ defaultValues }: { defaultValues: Values }) {
  const [state, formAction] = useActionState(updateHomeSettings, initialState);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <FormError message={state.error} />
      {state.success && (
        <p className="rounded-md border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-ink">
          Configuración guardada.
        </p>
      )}

      <div>
        <p className="font-display text-lg font-semibold text-ink">
          Texto del hero
        </p>
        <p className="mt-1 text-sm text-ink-faint">
          Los dos textos que aparecen sobre el slide de fotos, alternando.
          Encierra una palabra o frase entre <code>**dobles asteriscos**</code>{" "}
          para que se muestre en negrita.
        </p>
      </div>

      <TextAreaField
        label="Texto 1 del hero"
        name="heroText1"
        defaultValue={defaultValues.heroText1}
        rows={2}
        required
      />
      {state.fieldErrors?.heroText1 && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.heroText1}</p>
      )}

      <TextAreaField
        label="Texto 2 del hero"
        name="heroText2"
        defaultValue={defaultValues.heroText2}
        rows={2}
        required
      />
      {state.fieldErrors?.heroText2 && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.heroText2}</p>
      )}

      <div className="border-t border-border pt-5">
        <p className="font-display text-lg font-semibold text-ink">En vivo</p>
      </div>

      <TextField
        label="YouTube Channel ID"
        name="youtubeChannelId"
        defaultValue={defaultValues.youtubeChannelId}
        hint="YouTube Studio → Configuración → Canal → Avanzada. Empieza con 'UC'. Si lo defines, Inicio muestra una sección En Vivo automáticamente cuando el canal está transmitiendo."
      />
      {state.fieldErrors?.youtubeChannelId && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.youtubeChannelId}</p>
      )}

      <SubmitButton>Guardar</SubmitButton>
    </form>
  );
}
