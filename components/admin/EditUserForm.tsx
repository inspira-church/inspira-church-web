"use client";

import { useActionState } from "react";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import type { ActionState } from "@/lib/form-errors";

interface EditUserFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  email: string;
  isPrimary: boolean;
  defaultValues: {
    fullName: string;
    phone: string | null;
    role: "admin" | "editor";
    active: boolean;
  };
}

const initialState: ActionState = {};

export function EditUserForm({ action, email, isPrimary, defaultValues }: EditUserFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <FormError message={state.error} />

      <div>
        <p className="text-sm font-medium text-ink">Correo electrónico</p>
        <p className="mt-1.5 text-sm text-ink-soft">{email}</p>
      </div>

      <TextField
        label="Nombre completo"
        name="fullName"
        defaultValue={defaultValues.fullName}
        required
      />
      {state.fieldErrors?.fullName && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.fullName}</p>
      )}

      <TextField
        label="Teléfono"
        name="phone"
        type="tel"
        defaultValue={defaultValues.phone ?? ""}
        hint="Opcional"
      />

      <SelectField
        label="Rol"
        name="role"
        defaultValue={defaultValues.role}
        options={[
          { value: "editor", label: "Editor" },
          { value: "admin", label: "Administrador" },
        ]}
        required
      />

      <CheckboxField name="active" label="Cuenta activa" defaultChecked={defaultValues.active} />

      {isPrimary && (
        <p className="text-xs text-ink-faint">
          Esta es la cuenta del administrador principal — el sistema no permite degradarla,
          desactivarla ni quitarle esa marca, sin importar lo que elijas aquí.
        </p>
      )}

      <SubmitButton>Guardar</SubmitButton>
    </form>
  );
}
