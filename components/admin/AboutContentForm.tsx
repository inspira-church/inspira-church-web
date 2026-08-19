"use client";

import { useActionState } from "react";
import { BeliefsEditor } from "@/components/admin/BeliefsEditor";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ValuesEditor } from "@/components/admin/ValuesEditor";
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
        <h2 className="font-display text-lg font-semibold text-ink">Historia (hero)</h2>
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
          hint='Si el título contiene la palabra "familia", se resalta en coral automáticamente.'
          required
        />
        <TextAreaField
          label="Texto"
          name="historyText"
          defaultValue={defaultValues.historyText}
          rows={4}
          required
        />
        <TextField
          label="Alt de la foto principal"
          name="historyImageAlt"
          defaultValue={defaultValues.historyImageAlt}
          hint="Describe la foto para lectores de pantalla. La foto se sube más arriba, en 'Foto principal'."
        />
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">Nuestro propósito</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Texto pequeño"
            name="purposeEyebrow"
            defaultValue={defaultValues.purposeEyebrow}
            required
          />
          <TextField
            label="Título de la sección"
            name="purposeTitle"
            defaultValue={defaultValues.purposeTitle}
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-border p-4">
            <TextField
              label="Misión — etiqueta"
              name="missionTitle"
              defaultValue={defaultValues.missionTitle}
              required
            />
            <TextField
              label="Misión — frase protagonista"
              name="missionHeadline"
              hint="Recomendado: breve, 2-5 palabras."
              defaultValue={defaultValues.missionHeadline}
              required
            />
            <TextAreaField
              label="Misión — texto"
              name="missionText"
              defaultValue={defaultValues.missionText}
              hint="Recomendado: texto breve de 2-4 líneas en escritorio."
              rows={4}
              required
            />
          </div>
          <div className="space-y-3 rounded-lg border border-border p-4">
            <TextField
              label="Visión — etiqueta"
              name="visionTitle"
              defaultValue={defaultValues.visionTitle}
              required
            />
            <TextField
              label="Visión — frase protagonista"
              name="visionHeadline"
              hint="Recomendado: breve, 2-6 palabras."
              defaultValue={defaultValues.visionHeadline}
              required
            />
            <TextAreaField
              label="Visión — texto"
              name="visionText"
              defaultValue={defaultValues.visionText}
              hint="Recomendado: texto breve de 2-4 líneas en escritorio."
              rows={4}
              required
            />
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">
          Frase de identidad (&ldquo;Amamos a Dios...&rdquo;)
        </h2>
        <TextField
          label="Título"
          name="essenceTitle"
          defaultValue={defaultValues.essenceTitle}
          required
        />
        <TextAreaField
          label="Texto secundario"
          name="essenceText"
          defaultValue={defaultValues.essenceText}
          rows={2}
          required
        />
        <TextField
          label="Alt de la foto"
          name="essenceImageAlt"
          defaultValue={defaultValues.essenceImageAlt}
          hint="Describe la foto para lectores de pantalla. La foto se sube más arriba, en 'Foto de identidad'."
        />
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
        <p className="text-sm text-ink-soft">
          Los valores con descripción vacía, o marcados como no visibles, no aparecen en el
          sitio público — quedan preparados para completarlos después.
        </p>
        <ValuesEditor defaultValues={defaultValues.values} />
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
          label="Introducción"
          name="beliefsIntro"
          defaultValue={defaultValues.beliefsIntro}
          rows={2}
          required
        />
        <p className="text-sm text-ink-soft">
          Cada categoría se muestra como un acordeón en /nosotros. Las categorías con
          contenido vacío, o marcadas como no visibles, no aparecen en el sitio público —
          quedan preparadas para completarlas después.
        </p>
        <BeliefsEditor defaultBeliefs={defaultValues.beliefs} />
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">Visítanos</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Texto pequeño"
            name="visitEyebrow"
            defaultValue={defaultValues.visitEyebrow}
            required
          />
          <TextField
            label="Título de la sección"
            name="visitTitle"
            defaultValue={defaultValues.visitTitle}
            required
          />
        </div>
        <p className="text-xs text-ink-faint">
          La dirección y el mapa se administran abajo, en &ldquo;Ubicación&rdquo;.
        </p>
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">CTA final</h2>
        <TextField label="Título" name="ctaTitle" defaultValue={defaultValues.ctaTitle} required />
        <TextAreaField
          label="Texto"
          name="ctaText"
          defaultValue={defaultValues.ctaText}
          rows={2}
          required
        />
      </section>

      <SubmitButton>Guardar</SubmitButton>
    </form>
  );
}
