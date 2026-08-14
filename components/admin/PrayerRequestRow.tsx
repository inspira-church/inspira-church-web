import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { Badge } from "@/components/ui/Badge";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { deletePrayerRequest, updatePrayerRequest } from "@/lib/actions/inbox";
import { FORM_STATUS_OPTIONS } from "@/lib/constants-admin";
import { formatDate } from "@/lib/format";

interface PrayerRequestRowProps {
  request: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    request_text: string;
    is_private: boolean;
    status: string;
    assigned_to: string | null;
    internal_notes: string | null;
    created_at: string;
  };
  staffOptions: { value: string; label: string }[];
  isAdmin: boolean;
}

export function PrayerRequestRow({ request, staffOptions, isAdmin }: PrayerRequestRowProps) {
  const updateWithId = updatePrayerRequest.bind(null, request.id);
  const deleteWithId = deletePrayerRequest.bind(null, request.id);

  return (
    <details className="group p-4">
      <summary className="flex cursor-pointer flex-wrap items-center gap-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{request.name}</p>
          <p className="truncate text-sm text-ink-faint">
            {formatDate(request.created_at.slice(0, 10))}
          </p>
        </div>
        {request.is_private && <Badge variant="accent">Privada</Badge>}
        <Badge variant={request.status === "nueva" ? "accent" : "neutral"}>
          {FORM_STATUS_OPTIONS.find((o) => o.value === request.status)?.label}
        </Badge>
      </summary>

      <div className="mt-4 space-y-4 border-t border-border pt-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {request.phone && (
            <div>
              <dt className="text-xs text-ink-faint">Teléfono</dt>
              <dd className="text-ink">{request.phone}</dd>
            </div>
          )}
          {request.email && (
            <div>
              <dt className="text-xs text-ink-faint">Correo</dt>
              <dd className="text-ink">{request.email}</dd>
            </div>
          )}
        </dl>
        <div>
          <p className="text-xs text-ink-faint">Petición</p>
          <p className="text-sm text-ink">{request.request_text}</p>
        </div>

        <form action={updateWithId} className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Estado"
            name="status"
            options={FORM_STATUS_OPTIONS}
            defaultValue={request.status}
          />
          <SelectField
            label="Responsable"
            name="assignedTo"
            placeholder="Sin asignar"
            options={staffOptions}
            defaultValue={request.assigned_to ?? ""}
          />
          <div className="sm:col-span-2">
            <TextAreaField
              label="Notas internas"
              name="internalNotes"
              defaultValue={request.internal_notes ?? ""}
            />
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-ink hover:bg-accent-strong"
            >
              Guardar
            </button>
          </div>
        </form>

        {isAdmin && (
          <ConfirmForm
            action={deleteWithId}
            confirmMessage="¿Borrar esta petición de oración? Esta acción no se puede deshacer."
          >
            <button
              type="submit"
              className="text-sm text-ink-soft transition-colors hover:text-danger"
            >
              Borrar definitivamente
            </button>
          </ConfirmForm>
        )}
      </div>
    </details>
  );
}
