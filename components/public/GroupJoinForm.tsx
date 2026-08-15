"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { TurnstileWidget } from "@/components/public/TurnstileWidget";
import type { ActionState } from "@/lib/form-errors";
import { submitGroupJoin } from "@/lib/actions/group-join";

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
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-ink">
          {state.error}
        </p>
      )}

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
        name="groupId"
        placeholder="No estoy seguro — recomiéndenme uno"
        options={groupOptions.map((g) => ({ value: g.id, label: g.label }))}
        defaultValue={preselectedId}
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
        label={
          privacyPolicyUrl ? (
            <>
              Autorizo el tratamiento de mis datos personales conforme a la{" "}
              <a
                href={privacyPolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-accent"
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
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.consent}</p>
      )}

      <TurnstileWidget />

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Enviando…" : "Enviar solicitud"}
      </Button>
    </form>
  );
}
