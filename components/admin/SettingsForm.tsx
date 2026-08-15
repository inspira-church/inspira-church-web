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

      <TextField
        label="Dirección de la iglesia"
        name="churchAddress"
        defaultValue={defaultValues.churchAddress}
        hint="Opcional — se muestra en la página Nosotros, junto al mapa."
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
          hint="Opcional — si defines lat. y long., el mapa aparece en Nosotros."
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
