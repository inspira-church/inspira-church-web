"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { TurnstileWidget } from "@/components/public/TurnstileWidget";
import { submitPrayerRequest } from "@/lib/actions/prayer-request";
import type { ActionState } from "@/lib/form-errors";

const initialState: ActionState = {};

export function PrayerRequestForm({ privacyPolicyUrl }: { privacyPolicyUrl?: string }) {
  const [state, formAction, pending] = useActionState(submitPrayerRequest, initialState);

  if (state.success) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border border-border bg-paper-raised p-8 text-center"
      >
        <p className="font-display text-xl font-semibold text-ink">
          Recibimos tu petición
        </p>
        <p className="mt-2 text-ink-soft">
          Nuestro equipo de oración la tendrá presente. Gracias por confiarnos esto.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-ink">
          {state.error}
        </p>
      )}

      <TextField label="Nombre" name="name" autoComplete="name" required />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Teléfono"
          name="phone"
          type="tel"
          autoComplete="tel"
          hint="Opcional"
        />
        <TextField
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          hint="Opcional"
        />
      </div>

      <TextAreaField
        label="Tu petición de oración"
        name="request"
        required
        rows={6}
        aria-describedby={state.fieldErrors?.requestText ? "request-error" : undefined}
        aria-invalid={Boolean(state.fieldErrors?.requestText)}
      />
      {state.fieldErrors?.requestText && (
        <p id="request-error" className="-mt-3 text-xs text-danger">
          {state.fieldErrors.requestText}
        </p>
      )}

      <CheckboxField
        name="isPrivate"
        label="Marcar como privada — solo el administrador podrá leerla (no el resto del equipo)."
      />

      <CheckboxField
        name="consent"
        required
        aria-describedby={state.fieldErrors?.consent ? "consent-error" : undefined}
        aria-invalid={Boolean(state.fieldErrors?.consent)}
        label={
          privacyPolicyUrl ? (
            <>
              Autorizo el tratamiento de mis datos personales conforme a la{" "}
              <Link
                href="/politica-de-privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-accent"
              >
                política de privacidad
              </Link>{" "}
              de Inspira Church.
            </>
          ) : (
            "Autorizo el tratamiento de mis datos personales conforme a la política de privacidad de Inspira Church."
          )
        }
      />
      {state.fieldErrors?.consent && (
        <p id="consent-error" className="-mt-3 text-xs text-danger">
          {state.fieldErrors.consent}
        </p>
      )}

      <TurnstileWidget />

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Enviando…" : "Enviar petición"}
      </Button>
    </form>
  );
}
