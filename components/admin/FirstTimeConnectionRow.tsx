import { Badge } from "@/components/ui/Badge";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { updateFirstTimeConnection } from "@/lib/actions/inbox";
import { FORM_STATUS_OPTIONS } from "@/lib/constants-admin";
import { formatDate } from "@/lib/format";

const GENDER_LABEL: Record<string, string> = {
  hombre: "Hombre",
  mujer: "Mujer",
};

interface FirstTimeConnectionRowProps {
  connection: {
    id: string;
    first_name: string;
    last_name: string;
    gender: string;
    email: string;
    phone: string;
    message: string | null;
    attends_other_church: boolean;
    wants_call: boolean;
    status: string;
    assigned_to: string | null;
    internal_notes: string | null;
    created_at: string;
  };
  staffOptions: { value: string; label: string }[];
}

export function FirstTimeConnectionRow({ connection, staffOptions }: FirstTimeConnectionRowProps) {
  const updateWithId = updateFirstTimeConnection.bind(null, connection.id);
  const fullName = `${connection.first_name} ${connection.last_name}`;

  return (
    <details className="group p-4">
      <summary className="flex cursor-pointer flex-wrap items-center gap-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{fullName}</p>
          <p className="truncate text-sm text-ink-faint">
            {GENDER_LABEL[connection.gender] ?? connection.gender} ·{" "}
            {formatDate(connection.created_at.slice(0, 10))}
          </p>
        </div>
        {connection.wants_call && <Badge variant="accent">Quiere que le llamen</Badge>}
        <Badge variant={connection.status === "nueva" ? "accent" : "neutral"}>
          {FORM_STATUS_OPTIONS.find((o) => o.value === connection.status)?.label}
        </Badge>
      </summary>

      <div className="mt-4 space-y-4 border-t border-border pt-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-ink-faint">Correo</dt>
            <dd className="text-ink">{connection.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">Celular</dt>
            <dd className="text-ink">{connection.phone}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">¿Asiste a otra iglesia?</dt>
            <dd className="text-ink">{connection.attends_other_church ? "Sí" : "No"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">¿Desea que lo llamemos?</dt>
            <dd className="text-ink">{connection.wants_call ? "Sí" : "No"}</dd>
          </div>
        </dl>
        {connection.message && (
          <div>
            <p className="text-xs text-ink-faint">Mensaje / petición de oración</p>
            <p className="text-sm text-ink">{connection.message}</p>
          </div>
        )}

        <form action={updateWithId} className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Estado"
            name="status"
            options={FORM_STATUS_OPTIONS}
            defaultValue={connection.status}
          />
          <SelectField
            label="Responsable"
            name="assignedTo"
            placeholder="Sin asignar"
            options={staffOptions}
            defaultValue={connection.assigned_to ?? ""}
          />
          <div className="sm:col-span-2">
            <TextAreaField
              label="Notas internas"
              name="internalNotes"
              defaultValue={connection.internal_notes ?? ""}
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
