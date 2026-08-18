"use client";

import { useActionState } from "react";
import {
  CartelCheckbox,
  CartelField,
  CartelSelect,
  CartelSubmitButton,
  CartelTextArea,
} from "@/components/public/cartel-form";
import { TurnstileWidget } from "@/components/public/TurnstileWidget";
import { submitContact } from "@/lib/actions/contact";
import { anton, hind } from "@/lib/fonts";
import type { ActionState } from "@/lib/form-errors";
import { cn } from "@/lib/utils";

const REASON_OPTIONS = [
  { value: "visitar", label: "Quiero visitar la iglesia" },
  { value: "grupo", label: "Quiero pertenecer a un grupo" },
  { value: "oracion", label: "Necesito oración" },
  { value: "informacion", label: "Quiero recibir información" },
  { value: "servir", label: "Deseo servir" },
  { value: "otro", label: "Otro" },
];

const initialState: ActionState = {};

export function ContactForm({ privacyPolicyUrl }: { privacyPolicyUrl?: string }) {
  const [state, formAction, pending] = useActionState(submitContact, initialState);

  if (state.success) {
    return (
      <div className="border border-white/10 bg-[#0d0d0d] p-8 text-center">
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
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-white">
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <CartelField label="Nombre" name="name" autoComplete="name" required />
        <CartelField
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
        />
        <CartelField label="Teléfono" name="phone" type="tel" autoComplete="tel" />
        <CartelField label="WhatsApp" name="whatsapp" type="tel" />
      </div>

      <CartelSelect
        label="Motivo del contacto"
        name="reason"
        placeholder="Selecciona una opción"
        options={REASON_OPTIONS}
        required
      />
      {state.fieldErrors?.reason && (
        <p className="-mt-3 text-xs text-red-400">{state.fieldErrors.reason}</p>
      )}

      <CartelTextArea label="Mensaje" name="message" />

      <CartelCheckbox
        name="consent"
        required
        label={
          privacyPolicyUrl ? (
            <>
              Autorizo el tratamiento de mis datos personales conforme a la{" "}
              <a
                href={privacyPolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#FF7F50]"
              >
                política de privacidad
              </a>{" "}
              de Inspira Church.
            </>
          ) : (
            "Autorizo el tratamiento de mis datos personales conforme a la política de privacidad de Inspira Church."
          )
        }
      />
      {state.fieldErrors?.consent && (
        <p className="-mt-3 text-xs text-red-400">{state.fieldErrors.consent}</p>
      )}

      <TurnstileWidget />

      <CartelSubmitButton pending={pending} pendingText="Enviando…">
        Enviar mensaje
      </CartelSubmitButton>
    </form>
  );
}
