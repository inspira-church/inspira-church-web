"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";

interface GroupJoinFormProps {
  groupOptions: { value: string; label: string }[];
}

/**
 * UI del formulario "quiero pertenecer a un grupo". El envío real se
 * conecta en la Fase 11 (inserción en `group_join_requests`).
 */
export function GroupJoinForm({ groupOptions }: GroupJoinFormProps) {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("grupo") ?? "";
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-lg border border-border bg-paper-raised p-8 text-center">
        <p className="font-display text-xl font-semibold text-ink">
          ¡Listo! Recibimos tu solicitud
        </p>
        <p className="mt-2 text-ink-soft">
          El líder del grupo se pondrá en contacto contigo para darte la
          bienvenida.
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
        <TextField label="Nombre" name="firstName" autoComplete="given-name" required />
        <TextField label="Apellidos" name="lastName" autoComplete="family-name" required />
        <TextField label="Teléfono" name="phone" type="tel" autoComplete="tel" required />
        <TextField label="WhatsApp" name="whatsapp" type="tel" hint="Opcional" />
        <TextField
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          hint="Opcional"
        />
        <TextField label="Edad" name="age" type="number" min={0} hint="Opcional" />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <TextField label="Ciudad" name="city" defaultValue="Bogotá" required />
        <TextField label="Localidad" name="locality" />
        <TextField label="Barrio" name="neighborhood" />
      </div>

      <SelectField
        label="Grupo de interés"
        name="groupSlug"
        placeholder="No estoy seguro — recomiéndenme uno"
        options={groupOptions}
        defaultValue={preselected}
      />

      <TextField
        label="Disponibilidad"
        name="availability"
        placeholder="Ej: entre semana en la noche, fines de semana…"
      />

      <TextAreaField label="Observaciones" name="notes" hint="Opcional" rows={4} />

      <CheckboxField
        name="consent"
        required
        label="Autorizo el tratamiento de mis datos personales conforme a la política de privacidad de Inspira Church."
      />

      <Button type="submit" size="lg">
        Enviar solicitud
      </Button>
    </form>
  );
}
