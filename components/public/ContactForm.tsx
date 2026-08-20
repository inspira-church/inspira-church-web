"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  CartelCheckbox,
  CartelField,
  CartelRadioGroup,
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
  { value: "visitar", label: "Quiero visitar Inspira" },
  { value: "grupo", label: "Quiero unirme a un grupo de crecimiento" },
  { value: "oracion", label: "Necesito oración" },
  { value: "informacion", label: "Quiero conocer más de la iglesia" },
  { value: "servir", label: "Quiero servir" },
  { value: "evento", label: "Información sobre un evento" },
  { value: "otro", label: "Otro" },
];

const CHANNEL_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "llamada", label: "Llamada" },
  { value: "correo", label: "Correo" },
];

const initialState: ActionState = {};

interface ContactFormProps {
  privacyPolicyUrl?: string;
  /** Presente cuando se llega desde /contacto?evento=<slug> — evita volver a pedir qué evento era. */
  eventContext?: { slug: string; name: string };
}

export function ContactForm({ privacyPolicyUrl, eventContext }: ContactFormProps) {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const [reason, setReason] = useState(eventContext ? "evento" : "");
  const [preferredChannel, setPreferredChannel] = useState("");

  if (state.success) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border border-white/10 bg-[#0d0d0d] p-8 text-center"
      >
        <p className={cn(anton.className, "text-xl uppercase text-white")}>
          ¡Recibimos tu mensaje!
        </p>
        <p className={cn(hind.className, "mt-2 text-white/60")}>
          Gracias por escribirnos. Nuestro equipo revisará tu solicitud y se pondrá en contacto
          contigo.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-bold uppercase tracking-wide text-[#FF7F50] transition-colors hover:brightness-110"
        >
          Volver al inicio →
        </Link>
      </div>
    );
  }

  const isRedirectReason = reason === "oracion" || reason === "grupo";

  return (
    <form action={formAction} className="space-y-5">
      <div aria-live="polite">
        {state.error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-white">
            {state.error}
          </p>
        )}
      </div>

      <CartelField
        label="Nombre"
        name="name"
        autoComplete="name"
        aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
        aria-invalid={Boolean(state.fieldErrors?.name)}
        required
      />
      {state.fieldErrors?.name && (
        <p id="name-error" className="-mt-3 text-xs text-red-400">
          {state.fieldErrors.name}
        </p>
      )}

      <CartelSelect
        label="Motivo del contacto"
        name="reason"
        placeholder="Selecciona una opción"
        options={REASON_OPTIONS}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        aria-describedby={state.fieldErrors?.reason ? "reason-error" : undefined}
        aria-invalid={Boolean(state.fieldErrors?.reason)}
        required
      />
      {state.fieldErrors?.reason && (
        <p id="reason-error" className="-mt-3 text-xs text-red-400">
          {state.fieldErrors.reason}
        </p>
      )}

      {reason === "evento" && eventContext && (
        <p className={cn(hind.className, "-mt-2 text-sm text-white/60")}>
          Nos escribes sobre:{" "}
          <span className="font-semibold text-white">{eventContext.name}</span>
        </p>
      )}
      {eventContext && <input type="hidden" name="eventSlug" value={eventContext.slug} />}

      {reason === "oracion" && (
        <div className="border border-white/10 bg-[#0d0d0d] p-6">
          <p className={cn(hind.className, "text-white/80")}>
            Para cuidar tu privacidad, las peticiones de oración se reciben en un espacio
            separado.
          </p>
          <Link
            href="/oracion"
            className="mt-4 inline-block text-sm font-bold uppercase tracking-wide text-[#FF7F50] transition-colors hover:brightness-110"
          >
            Compartir mi petición →
          </Link>
        </div>
      )}

      {reason === "grupo" && (
        <div className="border border-white/10 bg-[#0d0d0d] p-6">
          <p className={cn(hind.className, "text-white/80")}>
            Para conectarte con el grupo indicado, tenemos un formulario dedicado que nos ayuda a
            ubicarte mejor.
          </p>
          <Link
            href="/grupos/unirme"
            className="mt-4 inline-block text-sm font-bold uppercase tracking-wide text-[#FF7F50] transition-colors hover:brightness-110"
          >
            Ir a unirme a un grupo →
          </Link>
        </div>
      )}

      {!isRedirectReason && (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <CartelField
              label="Teléfono / WhatsApp"
              name="phone"
              type="tel"
              autoComplete="tel"
              aria-describedby={state.fieldErrors?.phone ? "phone-error" : undefined}
              aria-invalid={Boolean(state.fieldErrors?.phone)}
              required
            />
            <CartelField
              label="Correo electrónico"
              name="email"
              type="email"
              autoComplete="email"
              required={preferredChannel === "correo"}
              hint={preferredChannel === "correo" ? undefined : "Opcional"}
              aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
              aria-invalid={Boolean(state.fieldErrors?.email)}
            />
          </div>
          {state.fieldErrors?.phone && (
            <p id="phone-error" className="-mt-3 text-xs text-red-400">
              {state.fieldErrors.phone}
            </p>
          )}
          {state.fieldErrors?.email && (
            <p id="email-error" className="-mt-3 text-xs text-red-400">
              {state.fieldErrors.email}
            </p>
          )}

          <CartelRadioGroup
            label="¿Cómo prefieres que te contactemos?"
            name="preferredChannel"
            options={CHANNEL_OPTIONS}
            defaultValue={preferredChannel}
            onChange={setPreferredChannel}
            aria-describedby={state.fieldErrors?.preferredChannel ? "channel-error" : undefined}
            required
          />
          {state.fieldErrors?.preferredChannel && (
            <p id="channel-error" className="-mt-3 text-xs text-red-400">
              {state.fieldErrors.preferredChannel}
            </p>
          )}

          <CartelTextArea
            label="¿Cómo podemos ayudarte?"
            name="message"
            placeholder="Cuéntanos un poco más..."
            aria-describedby={state.fieldErrors?.message ? "message-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors?.message)}
            required
          />
          {state.fieldErrors?.message && (
            <p id="message-error" className="-mt-3 text-xs text-red-400">
              {state.fieldErrors.message}
            </p>
          )}

          <CartelCheckbox
            name="consent"
            required
            aria-describedby={state.fieldErrors?.consent ? "consent-error" : undefined}
            aria-invalid={Boolean(state.fieldErrors?.consent)}
            label={
              privacyPolicyUrl ? (
                <>
                  Autorizo a Inspira Church para tratar mis datos personales con el fin de
                  responder esta solicitud, de acuerdo con la{" "}
                  <Link
                    href="/politica-de-privacidad"
                    target="_blank"
                    className="underline hover:text-[#FF7F50]"
                  >
                    Política de Tratamiento de Datos Personales
                  </Link>
                  .
                </>
              ) : (
                "Autorizo a Inspira Church para tratar mis datos personales con el fin de responder esta solicitud, de acuerdo con la Política de Tratamiento de Datos Personales."
              )
            }
          />
          {state.fieldErrors?.consent && (
            <p id="consent-error" className="-mt-3 text-xs text-red-400">
              {state.fieldErrors.consent}
            </p>
          )}

          <TurnstileWidget />

          <CartelSubmitButton pending={pending} pendingText="Enviando…">
            Enviar mensaje
          </CartelSubmitButton>
        </>
      )}
    </form>
  );
}
