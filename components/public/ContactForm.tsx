"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";

const REASON_OPTIONS = [
  { value: "visitar", label: "Quiero visitar la iglesia" },
  { value: "grupo", label: "Quiero pertenecer a un grupo" },
  { value: "oracion", label: "Necesito oración" },
  { value: "informacion", label: "Quiero recibir información" },
  { value: "servir", label: "Deseo servir" },
  { value: "otro", label: "Otro" },
];

/**
 * UI del formulario general de contacto. El envío real (Server Action,
 * verificación Turnstile, límite de tasa, inserción en `contacts`) se
 * conecta en la Fase 11 — por ahora solo valida y muestra confirmación
 * local, para poder probar la experiencia completa del formulario.
 */
export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-5"
    >
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

      <TextAreaField label="Mensaje" name="message" />

      <CheckboxField
        name="consent"
        required
        label="Autorizo el tratamiento de mis datos personales conforme a la política de privacidad de Inspira Church."
      />

      <Button type="submit" size="lg">
        Enviar mensaje
      </Button>
    </form>
  );
}
