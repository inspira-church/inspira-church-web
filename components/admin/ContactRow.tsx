import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { Badge } from "@/components/ui/Badge";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { deleteContact, updateContact } from "@/lib/actions/inbox";
import { CONTACT_REASON_LABEL, FORM_STATUS_OPTIONS, PREFERRED_CHANNEL_LABEL } from "@/lib/constants-admin";
import { formatDate } from "@/lib/format";

interface ContactRowProps {
  contact: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    preferred_channel: string;
    reason: string;
    message: string | null;
    status: string;
    assigned_to: string | null;
    internal_notes: string | null;
    follow_up_date: string | null;
    consent: boolean;
    consent_at: string;
    created_at: string;
  };
  staffOptions: { value: string; label: string }[];
  /** Nombre del evento de origen, si la solicitud llegó desde /contacto?evento=<slug> — nunca se muestra el UUID. */
  eventName?: string | null;
}

export function ContactRow({ contact, staffOptions, eventName }: ContactRowProps) {
  const updateWithId = updateContact.bind(null, contact.id);

  return (
    <details className="group p-4">
      <summary className="flex cursor-pointer flex-wrap items-center gap-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{contact.name}</p>
          <p className="truncate text-sm text-ink-faint">
            {CONTACT_REASON_LABEL[contact.reason] ?? contact.reason} ·{" "}
            {formatDate(contact.created_at.slice(0, 10))}
          </p>
        </div>
        <Badge variant={contact.status === "nueva" ? "accent" : "neutral"}>
          {FORM_STATUS_OPTIONS.find((o) => o.value === contact.status)?.label}
        </Badge>
      </summary>

      <div className="mt-4 space-y-4 border-t border-border pt-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {contact.phone && (
            <div>
              <dt className="text-xs text-ink-faint">Teléfono / WhatsApp</dt>
              <dd className="text-ink">{contact.phone}</dd>
            </div>
          )}
          {contact.email && (
            <div>
              <dt className="text-xs text-ink-faint">Correo</dt>
              <dd className="text-ink">{contact.email}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-ink-faint">Canal preferido</dt>
            <dd className="text-ink">
              {PREFERRED_CHANNEL_LABEL[contact.preferred_channel] ?? contact.preferred_channel}
            </dd>
          </div>
          {eventName && (
            <div>
              <dt className="text-xs text-ink-faint">Evento de origen</dt>
              <dd className="text-ink">{eventName}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-ink-faint">Consentimiento</dt>
            <dd className="text-ink">
              {contact.consent ? "Autorizado" : "No autorizado"} ·{" "}
              {formatDate(contact.consent_at.slice(0, 10))}
            </dd>
          </div>
        </dl>
        {contact.message && (
          <div>
            <p className="text-xs text-ink-faint">Mensaje</p>
            <p className="text-sm text-ink">{contact.message}</p>
          </div>
        )}

        <form action={updateWithId} className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Estado"
            name="status"
            options={FORM_STATUS_OPTIONS}
            defaultValue={contact.status}
          />
          <SelectField
            label="Responsable"
            name="assignedTo"
            placeholder="Sin asignar"
            options={staffOptions}
            defaultValue={contact.assigned_to ?? ""}
          />
          <TextField
            label="Fecha de seguimiento"
            name="followUpDate"
            type="date"
            defaultValue={contact.follow_up_date ?? ""}
          />
          <div className="sm:col-span-2">
            <TextAreaField
              label="Notas internas"
              name="internalNotes"
              defaultValue={contact.internal_notes ?? ""}
            />
          </div>
          <div className="flex items-center gap-4 sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-ink hover:bg-accent-strong"
            >
              Guardar
            </button>
          </div>
        </form>
        <ConfirmForm
          action={deleteContact.bind(null, contact.id)}
          confirmMessage={`¿Eliminar el contacto de "${contact.name}"? Esta acción no se puede deshacer.`}
        >
          <button type="submit" className="text-sm text-danger hover:underline">
            Eliminar
          </button>
        </ConfirmForm>
      </div>
    </details>
  );
}
