"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { FormError } from "@/components/admin/FormError";
import { FormSection } from "@/components/admin/FormSection";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Button } from "@/components/ui/Button";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { updateDefaultFormRecipient, updateFormEmailConfig } from "@/lib/actions/form-email-settings";
import { type FormEmailConfig, MAX_ADDITIONAL_RECIPIENTS } from "@/lib/email/form-config";
import type { FormType } from "@/lib/email/form-definitions";
import type { ActionState } from "@/lib/form-errors";

const initialState: ActionState = {};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-danger">
      {message}
    </p>
  );
}

function SavedNotice({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p role="status" className="rounded-md border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-ink">
      Configuración guardada.
    </p>
  );
}

interface FormEmailConfigFormProps {
  formKey: FormType;
  label: string;
  publicRoute: string;
  /** Ruta de la bandeja de solicitudes de este formulario en el CMS. */
  inboxPath?: string;
  /** Aviso opcional de reglas propias del formulario (ej. privacidad). */
  note?: string;
  config: FormEmailConfig;
  /** Correo administrativo predeterminado vigente (global), solo informativo. */
  defaultRecipient: string;
}

let rowSeq = 0;
const nextKey = () => `extra-${Date.now()}-${rowSeq++}`;

/**
 * Todos los campos son controlados (useState): React 19 limpia los campos no
 * controlados después de una acción, y si la validación falla el admin
 * perdería lo que acababa de escribir.
 */
export function FormEmailConfigForm({
  formKey,
  label,
  publicRoute,
  inboxPath,
  note,
  config,
  defaultRecipient,
}: FormEmailConfigFormProps) {
  const [state, formAction] = useActionState(updateFormEmailConfig.bind(null, formKey), initialState);

  const [internalEnabled, setInternalEnabled] = useState(config.internal.enabled);
  const [useDefault, setUseDefault] = useState(config.internal.useDefaultRecipient);
  const [primary, setPrimary] = useState(config.internal.primary);
  const [extras, setExtras] = useState(() =>
    config.internal.additional.map((value) => ({ key: nextKey(), value }))
  );
  const [autoEnabled, setAutoEnabled] = useState(config.autoReply.enabled);
  const [subject, setSubject] = useState(config.autoReply.subject);
  const [message, setMessage] = useState(config.autoReply.message);

  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6 rounded-lg border border-border bg-paper-raised p-5">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">{label}</h2>
        <p className="mt-0.5 text-xs text-ink-faint">Formulario público: {publicRoute}</p>
        {inboxPath && (
          <p className="mt-0.5 text-xs text-ink-faint">
            Las solicitudes recibidas se ven en{" "}
            <Link href={inboxPath} className="text-accent underline">
              su bandeja
            </Link>
            ; esta pantalla solo configura los correos.
          </p>
        )}
        {note && (
          <p className="mt-3 rounded-md border border-border bg-paper px-3 py-2 text-xs text-ink-soft">{note}</p>
        )}
      </div>

      <FormError message={state.error} />
      <SavedNotice show={Boolean(state.success)} />

      <FormSection title="Notificación interna" description="Aviso por correo al equipo cuando alguien envía este formulario.">
        <CheckboxField
          name="internalEnabled"
          label="Enviar notificación"
          checked={internalEnabled}
          onChange={(e) => setInternalEnabled(e.target.checked)}
        />

        <CheckboxField
          name="useDefaultRecipient"
          label="Usar el correo administrativo predeterminado"
          hint={defaultRecipient ? `Hoy: ${defaultRecipient}` : "Hoy no hay uno configurado: se usa el respaldo del servidor."}
          checked={useDefault}
          onChange={(e) => setUseDefault(e.target.checked)}
        />

        <div>
          <TextField
            label="Correo principal personalizado"
            name="primary"
            type="email"
            autoComplete="off"
            placeholder="correo@inspirachurch.co"
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
            disabled={useDefault}
            hint={useDefault ? "Desmarca la casilla de arriba para usar otro correo principal." : undefined}
          />
          <FieldError message={errors.primary} />
        </div>

        <div>
          <p className="text-sm font-medium text-ink">Correos adicionales</p>
          <p className="mt-0.5 text-xs text-ink-faint">
            Cada uno recibe su propio correo; no ven las direcciones de los demás. Máximo {MAX_ADDITIONAL_RECIPIENTS}.
          </p>
          <input type="hidden" name="additionalCount" value={extras.length} />
          <div className="mt-2 space-y-2">
            {extras.map((row, i) => (
              <div key={row.key} className="flex items-center gap-2">
                <input
                  type="email"
                  name={`additional.${i}`}
                  aria-label={`Correo adicional ${i + 1}`}
                  autoComplete="off"
                  placeholder="correo@dominio.com"
                  value={row.value}
                  onChange={(e) =>
                    setExtras((prev) => prev.map((r) => (r.key === row.key ? { ...r, value: e.target.value } : r)))
                  }
                  className="w-full rounded-md border border-border-strong bg-paper-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setExtras((prev) => prev.filter((r) => r.key !== row.key))}
                >
                  Eliminar
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-2"
            disabled={extras.length >= MAX_ADDITIONAL_RECIPIENTS}
            onClick={() => setExtras((prev) => [...prev, { key: nextKey(), value: "" }])}
          >
            + Agregar correo
          </Button>
          <FieldError message={errors.additional} />
        </div>
      </FormSection>

      <FormSection
        title="Respuesta automática"
        description="Correo de agradecimiento al visitante. Solo se envía si dejó su correo; nunca se vuelve obligatorio."
      >
        <CheckboxField
          name="autoReplyEnabled"
          label="Enviar correo de agradecimiento"
          checked={autoEnabled}
          onChange={(e) => setAutoEnabled(e.target.checked)}
        />

        <div>
          <TextField
            label="Asunto"
            name="autoReplySubject"
            maxLength={150}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <FieldError message={errors.autoReplySubject} />
        </div>

        <div>
          <TextAreaField
            label="Mensaje"
            name="autoReplyMessage"
            rows={9}
            maxLength={3000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            hint="Texto plano (no se interpreta HTML). Escribe {{nombre}} donde quieras que aparezca el nombre de quien envió el formulario."
          />
          <FieldError message={errors.autoReplyMessage} />
        </div>
      </FormSection>

      <SubmitButton>Guardar configuración</SubmitButton>
    </form>
  );
}

/** "Correo administrativo predeterminado": respaldo común de todos los formularios. */
export function DefaultRecipientForm({
  defaultRecipient,
  envFallbackConfigured,
}: {
  defaultRecipient: string;
  envFallbackConfigured: boolean;
}) {
  const [state, formAction] = useActionState(updateDefaultFormRecipient, initialState);
  const [value, setValue] = useState(defaultRecipient);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-paper-raised p-5">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Correo administrativo predeterminado</h2>
        <p className="mt-0.5 text-xs text-ink-faint">
          Recibe los avisos de todos los formularios que tengan marcada la casilla «Usar el correo administrativo
          predeterminado». Así no repites la misma dirección en cada formulario.
        </p>
      </div>

      <FormError message={state.error} />
      <SavedNotice show={Boolean(state.success)} />

      <div>
        <TextField
          label="Correo"
          name="defaultRecipient"
          type="email"
          autoComplete="off"
          placeholder="admin@inspirachurch.co"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          hint={
            envFallbackConfigured
              ? "Si lo dejas vacío se usa el respaldo configurado en el servidor (EMAIL_NOTIFICATION_TO)."
              : "Si lo dejas vacío y el servidor no tiene un respaldo configurado, no se enviará ningún aviso interno."
          }
        />
        <FieldError message={state.fieldErrors?.defaultRecipient} />
      </div>

      <p className="text-xs text-ink-faint">
        El remitente de los correos (Inspira Church &lt;notificaciones@…&gt;) no se edita aquí: se controla desde las
        variables de entorno del servidor.
      </p>

      <SubmitButton>Guardar correo predeterminado</SubmitButton>
    </form>
  );
}
