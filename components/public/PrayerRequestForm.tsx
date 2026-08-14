"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";

/**
 * UI del formulario de petición de oración. El envío real se conecta en la
 * Fase 11 (inserción en `prayer_requests`, visible solo dentro del panel
 * administrativo).
 */
export function PrayerRequestForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-lg border border-border bg-paper-raised p-8 text-center">
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-5"
    >
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
      />

      <CheckboxField
        name="isPrivate"
        label="Marcar como privada — solo el administrador podrá leerla (no el resto del equipo)."
      />

      <CheckboxField
        name="consent"
        required
        label="Autorizo el tratamiento de mis datos personales conforme a la política de privacidad de Inspira Church."
      />

      <Button type="submit" size="lg">
        Enviar petición
      </Button>
    </form>
  );
}
