"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  CartelCheckbox,
  CartelField,
  CartelGhostButton,
  CartelRadioGroup,
  CartelSubmitButton,
  CartelTextArea,
} from "@/components/public/cartel-form";
import { TurnstileWidget } from "@/components/public/TurnstileWidget";
import { submitFirstTimeConnection } from "@/lib/actions/first-time-connection";
import { anton, hind } from "@/lib/fonts";
import type { ActionState } from "@/lib/form-errors";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS = [
  { value: "hombre", label: "Hombre" },
  { value: "mujer", label: "Mujer" },
];

const YES_NO_OPTIONS = [
  { value: "no", label: "No" },
  { value: "si", label: "Sí" },
];

const initialState: ActionState = {};

export function FirstTimeConnectionForm({
  privacyPolicyUrl,
  onCancel,
}: {
  privacyPolicyUrl?: string;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(submitFirstTimeConnection, initialState);

  if (state.success) {
    return (
      <div role="status" aria-live="polite" className="border border-white/10 bg-black p-8 text-center">
        <p className={cn(anton.className, "text-xl uppercase text-white")}>
          ¡Gracias por escribirnos!
        </p>
        <p className={cn(hind.className, "mt-2 text-white/60")}>
          Alguien de nuestro equipo se pondrá en contacto contigo pronto.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5 text-left">
      <p className={cn(hind.className, "text-xs text-white/40")}>
        Los campos con (*) son obligatorios.
      </p>

      {state.error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-white">
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <CartelField label="Nombre" name="firstName" autoComplete="given-name" required />
        <CartelField label="Apellido" name="lastName" autoComplete="family-name" required />
      </div>

      <CartelRadioGroup label="Género" name="gender" options={GENDER_OPTIONS} required />

      <div className="grid gap-5 sm:grid-cols-2">
        <CartelField
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <CartelField
          label="Número celular"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
        />
      </div>

      <CartelTextArea
        label="¿Quieres contarnos algo adicional? / Petición de oración"
        name="message"
        hint="Máximo 200 caracteres"
        maxLength={200}
        rows={4}
        aria-describedby={state.fieldErrors?.message ? "message-error" : undefined}
        aria-invalid={Boolean(state.fieldErrors?.message)}
      />
      {state.fieldErrors?.message && (
        <p id="message-error" className="-mt-3 text-xs text-red-400">
          {state.fieldErrors.message}
        </p>
      )}

      <CartelRadioGroup
        label="¿Actualmente asistes a otra iglesia?"
        name="attendsOtherChurch"
        options={YES_NO_OPTIONS}
        defaultValue="no"
      />

      <CartelRadioGroup
        label="¿Deseas que te llamemos?"
        name="wantsCall"
        options={YES_NO_OPTIONS}
        defaultValue="no"
      />

      <CartelCheckbox
        name="consent"
        required
        aria-describedby={state.fieldErrors?.consent ? "consent-error" : undefined}
        aria-invalid={Boolean(state.fieldErrors?.consent)}
        label={
          privacyPolicyUrl ? (
            <>
              Acepto la{" "}
              <Link
                href="/politica-de-privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#FF7F50]"
              >
                política de privacidad
              </Link>
            </>
          ) : (
            "Acepto la política de privacidad"
          )
        }
      />
      {state.fieldErrors?.consent && (
        <p id="consent-error" className="-mt-3 text-xs text-red-400">
          {state.fieldErrors.consent}
        </p>
      )}

      <TurnstileWidget />

      <div className="flex flex-wrap items-center gap-4">
        <CartelSubmitButton pending={pending} pendingText="Enviando…">
          Aceptar
        </CartelSubmitButton>
        <CartelGhostButton onClick={onCancel}>Cancelar</CartelGhostButton>
      </div>
    </form>
  );
}
