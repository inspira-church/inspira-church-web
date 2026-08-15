"use client";

import { useActionState } from "react";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { updateSiteSettings } from "@/lib/actions/settings";
import type { ActionState } from "@/lib/form-errors";
import type { SiteSettings } from "@/lib/queries/settings";

const initialState: ActionState = {};

export function SettingsForm({ defaultValues }: { defaultValues: SiteSettings }) {
  const [state, formAction] = useActionState(updateSiteSettings, initialState);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <FormError message={state.error} />
      {state.success && (
        <p className="rounded-md border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-ink">
          Configuración guardada.
        </p>
      )}

      <TextField
        label="Número de WhatsApp"
        name="whatsappNumber"
        defaultValue={defaultValues.whatsappNumber}
        hint="Formato internacional, solo dígitos. Ej: 573001234567"
        required
      />
      {state.fieldErrors?.whatsappNumber && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.whatsappNumber}</p>
      )}

      <TextField
        label="Mensaje por defecto de WhatsApp"
        name="whatsappMessage"
        defaultValue={defaultValues.whatsappMessage}
        required
      />
      {state.fieldErrors?.whatsappMessage && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.whatsappMessage}</p>
      )}

      <TextField
        label="Facebook"
        name="facebookUrl"
        type="url"
        defaultValue={defaultValues.facebookUrl}
        hint="Opcional"
      />
      {state.fieldErrors?.facebookUrl && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.facebookUrl}</p>
      )}

      <TextField
        label="Instagram"
        name="instagramUrl"
        type="url"
        defaultValue={defaultValues.instagramUrl}
        hint="Opcional"
      />
      {state.fieldErrors?.instagramUrl && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.instagramUrl}</p>
      )}

      <TextField
        label="TikTok"
        name="tiktokUrl"
        type="url"
        defaultValue={defaultValues.tiktokUrl}
        hint="Opcional"
      />
      {state.fieldErrors?.tiktokUrl && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.tiktokUrl}</p>
      )}

      <TextField
        label="X (Twitter)"
        name="xUrl"
        type="url"
        defaultValue={defaultValues.xUrl}
        hint="Opcional"
      />
      {state.fieldErrors?.xUrl && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.xUrl}</p>
      )}

      <TextField
        label="YouTube"
        name="youtubeUrl"
        type="url"
        defaultValue={defaultValues.youtubeUrl}
        hint="Opcional"
      />
      {state.fieldErrors?.youtubeUrl && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.youtubeUrl}</p>
      )}

      <TextField
        label="URL de la política de privacidad"
        name="privacyPolicyUrl"
        type="url"
        defaultValue={defaultValues.privacyPolicyUrl}
        hint="Opcional — si la defines, los formularios públicos enlazan aquí en el texto de consentimiento."
      />
      {state.fieldErrors?.privacyPolicyUrl && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.privacyPolicyUrl}</p>
      )}

      <SubmitButton>Guardar</SubmitButton>
    </form>
  );
}
