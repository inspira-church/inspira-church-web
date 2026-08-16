"use client";

import { useActionState } from "react";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { updateAboutContent } from "@/lib/actions/about";
import type { ActionState } from "@/lib/form-errors";
import type { AboutContent } from "@/lib/queries/about";

const initialState: ActionState = {};

export function AboutContentForm({ defaultValues }: { defaultValues: AboutContent }) {
  const [state, formAction] = useActionState(updateAboutContent, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-10">
      <FormError message={state.error} />
      {state.success && (
        <p className="rounded-md border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-ink">
          Contenido guardado.
        </p>
      )}

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">Historia</h2>
        <TextField
          label="Texto pequeño (arriba del título)"
          name="historyEyebrow"
          defaultValue={defaultValues.historyEyebrow}
          required
        />
        <TextField
          label="Título principal"
          name="historyTitle"
          defaultValue={defaultValues.historyTitle}
          required
        />
        <TextAreaField
          label="Texto"
          name="historyText"
          defaultValue={defaultValues.historyText}
          rows={4}
          required
        />
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-5">
          <h2 className="font-display text-lg font-semibold text-ink">Misión</h2>
          <TextField
            label="Título"
            name="missionTitle"
            defaultValue={defaultValues.missionTitle}
            required
          />
          <TextAreaField
            label="Texto"
            name="missionText"
            defaultValue={defaultValues.missionText}
            rows={4}
            required
          />
        </div>
        <div className="space-y-5">
          <h2 className="font-display text-lg font-semibold text-ink">Visión</h2>
          <TextField
            label="Título"
            name="visionTitle"
            defaultValue={defaultValues.visionTitle}
            required
          />
          <TextAreaField
            label="Texto"
            name="visionText"
            defaultValue={defaultValues.visionText}
            rows={4}
            required
          />
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">Nuestros valores</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Texto pequeño"
            name="valuesEyebrow"
            defaultValue={defaultValues.valuesEyebrow}
            required
          />
          <TextField
            label="Título de la sección"
            name="valuesTitle"
            defaultValue={defaultValues.valuesTitle}
            required
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {defaultValues.values.map((value, i) => (
            <div key={i} className="space-y-3 rounded-lg border border-border p-4">
              <TextField
                label={`Valor ${i + 1} — título`}
                name={`values.${i}.title`}
                defaultValue={value.title}
                required
              />
              <TextAreaField
                label="Descripción"
                name={`values.${i}.description`}
                defaultValue={value.description}
                rows={2}
                required
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">Nuestras creencias</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Texto pequeño"
            name="beliefsEyebrow"
            defaultValue={defaultValues.beliefsEyebrow}
            required
          />
          <TextField
            label="Título de la sección"
            name="beliefsTitle"
            defaultValue={defaultValues.beliefsTitle}
            required
          />
        </div>
        <TextAreaField
          label="Creencias"
          name="beliefs"
          defaultValue={defaultValues.beliefs.join("\n")}
          rows={6}
          hint="Una por línea. Se muestran en el mismo orden."
          required
        />
      </section>

      <SubmitButton>Guardar</SubmitButton>
    </form>
  );
}
