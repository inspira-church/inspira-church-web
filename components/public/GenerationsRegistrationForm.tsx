"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  CartelCheckbox,
  CartelField,
  CartelSelect,
  CartelSubmitButton,
  CartelTextArea,
} from "@/components/public/cartel-form";
import { TurnstileWidget } from "@/components/public/TurnstileWidget";
import { submitGenerationsRegistration } from "@/lib/actions/generations-registrations";
import type { ActionState } from "@/lib/form-errors";
import { anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface GenerationsRegistrationFormProps {
  areaOptions: { value: string; label: string }[];
}

const initialState: ActionState = {};

export function GenerationsRegistrationForm({ areaOptions }: GenerationsRegistrationFormProps) {
  const [state, formAction, pending] = useActionState(submitGenerationsRegistration, initialState);

  if (state.success) {
    return (
      <div className="border border-white/10 bg-[#0d0d0d] p-8 text-center">
        <p className={cn(anton.className, "text-xl uppercase text-white")}>
          ¡Listo! Recibimos la inscripción
        </p>
        <p className={cn(hind.className, "mt-2 text-white/60")}>
          Un líder del equipo de Generaciones se pondrá en contacto contigo.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-white">
          {state.error}
        </p>
      )}

      <div>
        <p className={cn(anton.className, "text-sm uppercase tracking-wide text-white/50")}>
          Datos del niño o joven
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <CartelField label="Nombre" name="childFirstName" required />
          <CartelField label="Apellidos" name="childLastName" required />
          <CartelField label="Edad" name="childAge" type="number" min={0} max={17} required />
          <CartelField label="Colegio" name="childSchool" hint="Opcional" />
        </div>
        <div className="mt-5">
          <CartelSelect
            label="Área de interés"
            name="areaInterest"
            placeholder="No estoy seguro — recomiéndenme una"
            options={areaOptions}
          />
        </div>
        <div className="mt-5">
          <CartelTextArea
            label="Alergias o condiciones a tener en cuenta"
            name="allergies"
            hint="Opcional — ayúdanos a cuidarlo mejor."
            rows={3}
          />
        </div>
      </div>

      <div>
        <p className={cn(anton.className, "text-sm uppercase tracking-wide text-white/50")}>
          Padre, madre o acudiente
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <CartelField label="Nombre" name="guardianName" required />
          <CartelField label="Teléfono" name="guardianPhone" type="tel" required />
          <CartelField label="Correo electrónico" name="guardianEmail" type="email" hint="Opcional" />
        </div>
      </div>

      <div>
        <p className={cn(anton.className, "text-sm uppercase tracking-wide text-white/50")}>
          Contacto de emergencia
        </p>
        <p className="mt-1.5 text-xs text-white/40">Opcional, si es distinto al de arriba.</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <CartelField label="Nombre" name="emergencyContactName" />
          <CartelField label="Teléfono" name="emergencyContactPhone" type="tel" />
        </div>
      </div>

      <div className="space-y-3">
        <CartelCheckbox
          name="dataConsent"
          required
          label={
            <>
              Autorizo el tratamiento de los datos personales de mi hijo/a conforme a la{" "}
              <Link href="/politica-de-privacidad" target="_blank" className="underline hover:text-[#508A8C]">
                política de privacidad
              </Link>{" "}
              de Inspira Church.
            </>
          }
        />
        {state.fieldErrors?.dataConsent && (
          <p className="text-xs text-red-400">{state.fieldErrors.dataConsent}</p>
        )}
        <CartelCheckbox
          name="imageConsent"
          label="Autorizo también el uso de fotos o videos donde aparezca mi hijo/a en las actividades de Generaciones (opcional)."
        />
      </div>

      <TurnstileWidget />

      <CartelSubmitButton pending={pending} pendingText="Enviando…">
        Enviar inscripción
      </CartelSubmitButton>
    </form>
  );
}
