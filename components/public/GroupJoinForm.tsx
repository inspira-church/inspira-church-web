"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import {
  CartelCheckbox,
  CartelField,
  CartelSelect,
  CartelSubmitButton,
  CartelTextArea,
} from "@/components/public/cartel-form";
import { TurnstileWidget } from "@/components/public/TurnstileWidget";
import type { ActionState } from "@/lib/form-errors";
import { submitGroupJoin } from "@/lib/actions/group-join";
import { anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface GroupJoinFormProps {
  groupOptions: { id: string; slug: string; label: string }[];
  privacyPolicyUrl?: string;
}

const initialState: ActionState = {};

export function GroupJoinForm({ groupOptions, privacyPolicyUrl }: GroupJoinFormProps) {
  const searchParams = useSearchParams();
  const preselectedSlug = searchParams.get("grupo") ?? "";
  const preselectedId = groupOptions.find((g) => g.slug === preselectedSlug)?.id ?? "";

  const [state, formAction, pending] = useActionState(submitGroupJoin, initialState);

  if (state.success) {
    return (
      <div className="border border-white/10 bg-[#0d0d0d] p-8 text-center">
        <p className={cn(anton.className, "text-xl uppercase text-white")}>
          ¡Listo! Recibimos tu solicitud
        </p>
        <p className={cn(hind.className, "mt-2 text-white/60")}>
          El líder del grupo se pondrá en contacto contigo para darte la
          bienvenida.
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
        <CartelField label="Nombre" name="firstName" autoComplete="given-name" required />
        <CartelField label="Apellidos" name="lastName" autoComplete="family-name" required />
        <CartelField label="Teléfono" name="phone" type="tel" autoComplete="tel" required />
        <CartelField label="WhatsApp" name="whatsapp" type="tel" hint="Opcional" />
        <CartelField
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          hint="Opcional"
        />
        <CartelField label="Edad" name="age" type="number" min={0} hint="Opcional" />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <CartelField label="Ciudad" name="city" defaultValue="Bogotá" required />
        <CartelField label="Localidad" name="locality" />
        <CartelField label="Barrio" name="neighborhood" />
      </div>

      <CartelSelect
        label="Grupo de interés"
        name="groupId"
        placeholder="No estoy seguro — recomiéndenme uno"
        options={groupOptions.map((g) => ({ value: g.id, label: g.label }))}
        defaultValue={preselectedId}
      />

      <CartelField
        label="Disponibilidad"
        name="availability"
        placeholder="Ej: entre semana en la noche, fines de semana…"
      />

      <CartelTextArea label="Observaciones" name="notes" hint="Opcional" rows={4} />

      <CartelCheckbox
        name="consent"
        required
        label={
          privacyPolicyUrl ? (
            <>
              Autorizo el tratamiento de mis datos personales conforme a la{" "}
              <Link
                href="/politica-de-privacidad"
                target="_blank"
                className="underline hover:text-[#FF7F50]"
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
        <p className="-mt-3 text-xs text-red-400">{state.fieldErrors.consent}</p>
      )}

      <TurnstileWidget />

      <CartelSubmitButton pending={pending} pendingText="Enviando…">
        Enviar solicitud
      </CartelSubmitButton>
    </form>
  );
}
