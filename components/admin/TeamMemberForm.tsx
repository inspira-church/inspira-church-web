"use client";

import { useActionState } from "react";
import { FormError } from "@/components/admin/FormError";
import { FormSection } from "@/components/admin/FormSection";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import type { ActionState } from "@/lib/form-errors";

interface TeamMemberFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    fullName: string;
    type: "pastor" | "lider";
    roleTitle: string;
    bio: string | null;
    photoUrl: string | null;
    orderIndex: number;
    active: boolean;
  };
}

const initialState: ActionState = {};

export function TeamMemberForm({ action, defaultValues }: TeamMemberFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <FormError message={state.error} />

      <FormSection title="Detalles">
        <TextField
          label="Nombre completo"
          name="fullName"
          defaultValue={defaultValues?.fullName}
          required
        />
        {state.fieldErrors?.fullName && (
          <p className="-mt-3 text-xs text-danger">{state.fieldErrors.fullName}</p>
        )}

        <SelectField
          label="Tipo"
          name="type"
          defaultValue={defaultValues?.type ?? "lider"}
          options={[
            { value: "pastor", label: "Pastor" },
            { value: "lider", label: "Líder" },
          ]}
          required
        />

        <TextField
          label="Cargo"
          name="roleTitle"
          placeholder="Ej: Pastor Principal, Líder de Alabanza…"
          defaultValue={defaultValues?.roleTitle}
          required
        />
        {state.fieldErrors?.roleTitle && (
          <p className="-mt-3 text-xs text-danger">{state.fieldErrors.roleTitle}</p>
        )}

        <TextAreaField
          label="Biografía"
          name="bio"
          defaultValue={defaultValues?.bio ?? ""}
          hint="Opcional — se muestra en la página Nosotros."
        />

        <ImageUploadField
          label="Foto"
          name="photoUrl"
          bucket="pastors"
          defaultValue={defaultValues?.photoUrl}
        />
      </FormSection>

      <FormSection title="Visibilidad">
        <TextField
          label="Orden"
          name="orderIndex"
          type="number"
          defaultValue={defaultValues?.orderIndex ?? 0}
          hint="Menor número aparece primero."
        />

        <CheckboxField
          name="active"
          label="Visible en el sitio público"
          defaultChecked={defaultValues?.active ?? true}
        />
      </FormSection>

      <SubmitButton cancelHref="/admin/equipo">Guardar</SubmitButton>
    </form>
  );
}
