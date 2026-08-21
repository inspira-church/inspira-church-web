"use client";

import { useActionState } from "react";
import { DocumentUploadField } from "@/components/admin/DocumentUploadField";
import { FormError } from "@/components/admin/FormError";
import { GenerationsAreasEditor } from "@/components/admin/GenerationsAreasEditor";
import { GenerationsFAQEditor } from "@/components/admin/GenerationsFAQEditor";
import { GenerationsJourneyEditor } from "@/components/admin/GenerationsJourneyEditor";
import { GenerationsRhythmEditor } from "@/components/admin/GenerationsRhythmEditor";
import { GenerationsSafetyEditor } from "@/components/admin/GenerationsSafetyEditor";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { updateGenerationsContent } from "@/lib/actions/generations";
import type { ActionState } from "@/lib/form-errors";
import type { GenerationsContent } from "@/lib/queries/generations";

const initialState: ActionState = {};

export function GenerationsContentForm({
  defaultValues,
  mediaMap,
}: {
  defaultValues: GenerationsContent;
  mediaMap: Record<string, string>;
}) {
  const [state, formAction] = useActionState(updateGenerationsContent, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-10">
      <FormError message={state.error} />
      {state.success && (
        <p className="rounded-md border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-ink">
          Contenido guardado.
        </p>
      )}

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">Hero</h2>
        <TextField label="Texto pequeño" name="heroEyebrow" defaultValue={defaultValues.heroEyebrow} required />
        <TextField label="Título" name="heroTitle" defaultValue={defaultValues.heroTitle} required />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Frase — parte blanca"
            name="heroTaglineWhite"
            defaultValue={defaultValues.heroTaglineWhite}
            required
          />
          <TextField
            label="Frase — parte en coral"
            name="heroTaglineCoral"
            defaultValue={defaultValues.heroTaglineCoral}
            required
          />
        </div>
        <TextAreaField
          label="Versículo"
          name="heroVerseText"
          defaultValue={defaultValues.heroVerseText}
          rows={2}
          required
        />
        <TextField label="Referencia" name="heroVerseRef" defaultValue={defaultValues.heroVerseRef} required />
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">Visión</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Título — línea 1, blanco" name="visionTitleWhite1" defaultValue={defaultValues.visionTitleWhite1} required />
          <TextField label="Título — línea 1, coral" name="visionTitleCoral1" defaultValue={defaultValues.visionTitleCoral1} required />
          <TextField label="Título — línea 2, blanco" name="visionTitleWhite2" defaultValue={defaultValues.visionTitleWhite2} required />
          <TextField label="Título — línea 2, coral" name="visionTitleCoral2" defaultValue={defaultValues.visionTitleCoral2} required />
        </div>
        <TextAreaField label="Texto" name="visionText" defaultValue={defaultValues.visionText} rows={3} required />
        <TextField label="Frase de cierre" name="visionClosing" defaultValue={defaultValues.visionClosing} required />
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">Legado</h2>
        <TextAreaField
          label="Título — parte blanca"
          name="legacyTitleWhite"
          defaultValue={defaultValues.legacyTitleWhite}
          rows={2}
          hint="Puede tener varias líneas."
          required
        />
        <TextField label="Título — parte en coral" name="legacyTitleCoral" defaultValue={defaultValues.legacyTitleCoral} required />
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">Descubre tu lugar (áreas)</h2>
        <TextField label="Título" name="areasTitle" defaultValue={defaultValues.areasTitle} required />
        <TextAreaField label="Introducción" name="areasIntro" defaultValue={defaultValues.areasIntro} rows={2} required />
        <p className="text-sm text-ink-soft">
          El color y el tamaño de cada tarjeta se quedan fijos en el diseño — aquí solo se edita el
          contenido y la foto de cada área.
        </p>
        <GenerationsAreasEditor defaultAreas={defaultValues.areas} mediaMap={mediaMap} />
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">Proceso</h2>
        <TextField label="Título" name="journeyTitle" defaultValue={defaultValues.journeyTitle} required />
        <GenerationsJourneyEditor defaultSteps={defaultValues.journey} />
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">70/30</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-border p-4">
            <TextField label="Porcentaje izquierdo" name="ratioLeftPercent" defaultValue={defaultValues.ratioLeftPercent} required />
            <TextField label="Etiqueta" name="ratioLeftLabel" defaultValue={defaultValues.ratioLeftLabel} required />
            <TextAreaField label="Texto" name="ratioLeftText" defaultValue={defaultValues.ratioLeftText} rows={2} required />
          </div>
          <div className="space-y-3 rounded-lg border border-border p-4">
            <TextField label="Porcentaje derecho" name="ratioRightPercent" defaultValue={defaultValues.ratioRightPercent} required />
            <TextField label="Etiqueta" name="ratioRightLabel" defaultValue={defaultValues.ratioRightLabel} required />
            <TextAreaField label="Texto" name="ratioRightText" defaultValue={defaultValues.ratioRightText} rows={2} required />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Cierre — parte tenue" name="ratioClosingFaded" defaultValue={defaultValues.ratioClosingFaded} required />
          <TextField label="Cierre — parte blanca" name="ratioClosingWhite" defaultValue={defaultValues.ratioClosingWhite} required />
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">Toda área es altar</h2>
        <TextAreaField label="Título" name="altarTitle" defaultValue={defaultValues.altarTitle} rows={2} hint="Puede tener varias líneas." required />
        <TextAreaField label="Texto" name="altarText" defaultValue={defaultValues.altarText} rows={3} required />
        <TextField label="Frase (coral)" name="altarTagline" defaultValue={defaultValues.altarTagline} required />
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">Familias</h2>
        <TextAreaField label="Título" name="familiesTitle" defaultValue={defaultValues.familiesTitle} rows={2} hint="Puede tener varias líneas." required />
        <TextAreaField label="Texto" name="familiesText" defaultValue={defaultValues.familiesText} rows={3} required />
        <DocumentUploadField
          label="Guía para padres (PDF)"
          name="parentsGuideUrl"
          defaultValue={defaultValues.parentsGuideUrl}
          hint="El botón 'Conoce la guía para padres' se activa solo en cuanto subas el documento."
        />
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">Próximo Generaciones</h2>
        <TextField label="Texto pequeño" name="nextDateEyebrow" defaultValue={defaultValues.nextDateEyebrow} required />
        <TextField
          label="Próxima fecha"
          name="nextDate"
          type="date"
          defaultValue={defaultValues.nextDate ?? ""}
          hint="Vacío = se muestra 'Próxima fecha muy pronto'."
        />
        <TextAreaField
          label="Nota"
          name="nextDateNote"
          defaultValue={defaultValues.nextDateNote}
          rows={2}
          hint="Texto que acompaña la fecha (o el estado 'muy pronto')."
        />
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">Prepárate · Practica · Sirve · Crece</h2>
        <GenerationsRhythmEditor defaultWords={defaultValues.rhythm} />
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">Cuidado y seguridad</h2>
        <TextField label="Texto pequeño" name="safetyEyebrow" defaultValue={defaultValues.safetyEyebrow} required />
        <TextAreaField label="Título" name="safetyTitle" defaultValue={defaultValues.safetyTitle} rows={2} hint="Puede tener varias líneas." required />
        <GenerationsSafetyEditor defaultPrinciples={defaultValues.safetyPrinciples} />
        <DocumentUploadField
          label="Lineamientos de cuidado (PDF)"
          name="careGuidelinesUrl"
          defaultValue={defaultValues.careGuidelinesUrl}
          hint="El botón 'Conoce los lineamientos de cuidado' se activa solo en cuanto subas el documento."
        />
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">Preguntas frecuentes</h2>
        <TextField label="Título" name="faqTitle" defaultValue={defaultValues.faqTitle} required />
        <GenerationsFAQEditor defaultItems={defaultValues.faq} />
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-ink">CTA final</h2>
        <TextAreaField label="Título" name="ctaTitle" defaultValue={defaultValues.ctaTitle} rows={2} hint="Puede tener varias líneas." required />
        <TextField label="Frase" name="ctaTagline" defaultValue={defaultValues.ctaTagline} required />
        <TextAreaField label="Texto de cierre" name="ctaClosing" defaultValue={defaultValues.ctaClosing} rows={2} required />
        <p className="text-xs text-ink-faint">
          El botón &ldquo;Inscríbete en Generaciones&rdquo; siempre lleva a /generaciones/inscripcion — no
          es editable aquí. &ldquo;Guía para padres&rdquo; reutiliza el documento subido arriba, en
          &ldquo;Familias&rdquo;.
        </p>
      </section>

      <SubmitButton>Guardar</SubmitButton>
    </form>
  );
}
