"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { TurnstileWidget } from "@/components/public/TurnstileWidget";
import { submitContact } from "@/lib/actions/contact";
import type { ActionState } from "@/lib/form-errors";

const REASON_OPTIONS = [
  { value: "visitar", label: "Quiero visitar la iglesia" },
  { value: "grupo", label: "Quiero pertenecer a un grupo" },
  { value: "oracion", label: "Necesito oración" },
  { value: "informacion", label: "Quiero recibir información" },
  { value: "servir", label: "Deseo servir" },
  { value: "otro", label: "Otro" },
];

const initialState: ActionState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialState);

  if (state.success) {
    return (
      <div className="rounded-lg border border-border bg-paper-raised p-8 text-center">
        <p className="font-display text-xl font-semibold text-ink">
          ¡Gracias por escribirnos!
        </p>
        <p className="mt-2 text-ink-soft">
          Alguien de nuestro equipo se pondrá en contacto contigo pronto.
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

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Nombre" name="name" autoComplete="name" required />
        <TextField
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
        />
        <TextField label="Teléfono" name="phone" type="tel" autoComplete="tel" />
        <TextField label="WhatsApp" name="whatsapp" type="tel" />
      </div>

      <SelectField
        label="Motivo del contacto"
        name="reason"
        placeholder="Selecciona una opción"
        options={REASON_OPTIONS}
        required
      />
      {state.fieldErrors?.reason && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.reason}</p>
      )}

      <TextAreaField label="Mensaje" name="message" />

      <CheckboxField
        name="consent"
        required
        label="Autorizo el tratamiento de mis datos personales conforme a la política de privacidad de Inspira Church."
      />
      {state.fieldErrors?.consent && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.consent}</p>
      )}

      <TurnstileWidget />

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
