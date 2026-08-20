"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { DAY_NAMES, MONTHLY_WEEK_OPTIONS } from "@/lib/constants";
import type { ActionState } from "@/lib/form-errors";

interface ScheduleFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    type: "servicio" | "reunion" | "grupo" | "actividad";
    name: string;
    dayOfWeek: number;
    timeOfDay: string;
    location: string | null;
    orderIndex: number;
    active: boolean;
    recurrence: "weekly" | "monthly";
    monthlyWeek: number | null;
  };
}

const initialState: ActionState = {};
const dayOptions = DAY_NAMES.map((day, index) => ({ value: String(index), label: day }));
const typeOptions = [
  { value: "servicio", label: "Servicio" },
  { value: "reunion", label: "Reunión" },
  { value: "grupo", label: "Grupo" },
  { value: "actividad", label: "Actividad especial" },
];
const recurrenceOptions = [
  { value: "weekly", label: "Cada semana" },
  { value: "monthly", label: "Una vez al mes" },
];
const monthlyWeekOptions = MONTHLY_WEEK_OPTIONS.map((o) => ({
  value: String(o.value),
  label: o.label,
}));

export function ScheduleForm({ action, defaultValues }: ScheduleFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [recurrence, setRecurrence] = useState(defaultValues?.recurrence ?? "weekly");

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <FormError message={state.error} />

      <TextField
        label="Nombre"
        name="name"
        placeholder="Ej: Servicio Dominical"
        defaultValue={defaultValues?.name}
        required
      />
      {state.fieldErrors?.name && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.name}</p>
      )}

      <SelectField
        label="Tipo"
        name="type"
        options={typeOptions}
        defaultValue={defaultValues?.type ?? "servicio"}
        required
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Día"
          name="dayOfWeek"
          options={dayOptions}
          defaultValue={String(defaultValues?.dayOfWeek ?? 0)}
          required
        />
        <TextField
          label="Hora"
          name="timeOfDay"
          type="time"
          defaultValue={defaultValues?.timeOfDay}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Recurrencia"
          name="recurrence"
          options={recurrenceOptions}
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as "weekly" | "monthly")}
          required
        />
        {recurrence === "monthly" && (
          <SelectField
            label="¿Qué semana del mes?"
            name="monthlyWeek"
            options={monthlyWeekOptions}
            defaultValue={
              defaultValues?.monthlyWeek != null ? String(defaultValues.monthlyWeek) : "-1"
            }
            required
          />
        )}
      </div>
      {state.fieldErrors?.monthlyWeek && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.monthlyWeek}</p>
      )}

      <TextField
        label="Lugar"
        name="location"
        defaultValue={defaultValues?.location ?? ""}
        hint="Opcional"
      />

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

      <SubmitButton>Guardar</SubmitButton>
    </form>
  );
}
