import { Badge } from "@/components/ui/Badge";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { updateContact } from "@/lib/actions/inbox";
import { CONTACT_REASON_LABEL, FORM_STATUS_OPTIONS } from "@/lib/constants-admin";
import { formatDate } from "@/lib/format";

interface ContactRowProps {
  contact: {
    id: string;
    name: string;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    reason: string;
    message: string | null;
    status: string;
    assigned_to: string | null;
    internal_notes: string | null;
    follow_up_date: string | null;
    created_at: string;
  };
  staffOptions: { value: string; label: string }[];
}

export function ContactRow({ contact, staffOptions }: ContactRowProps) {
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
              <dt className="text-xs text-ink-faint">Teléfono</dt>
              <dd className="text-ink">{contact.phone}</dd>
            </div>
          )}
          {contact.whatsapp && (
            <div>
              <dt className="text-xs text-ink-faint">WhatsApp</dt>
              <dd className="text-ink">{contact.whatsapp}</dd>
            </div>
          )}
          {contact.email && (
            <div>
              <dt className="text-xs text-ink-faint">Correo</dt>
              <dd className="text-ink">{contact.email}</dd>
            </div>
          )}
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
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-ink hover:bg-accent-strong"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </details>
  );
}
