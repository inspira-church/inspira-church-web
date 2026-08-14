import { Badge } from "@/components/ui/Badge";
import { SelectField } from "@/components/ui/SelectField";
import { updateGroupJoinRequest } from "@/lib/actions/inbox";
import { FORM_STATUS_OPTIONS } from "@/lib/constants-admin";
import { formatDate } from "@/lib/format";

interface GroupJoinRequestRowProps {
  request: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    whatsapp: string | null;
    email: string | null;
    city: string;
    locality: string | null;
    neighborhood: string | null;
    age: number | null;
    availability: string | null;
    notes: string | null;
    status: string;
    created_at: string;
  };
  groupName: string | null;
}

export function GroupJoinRequestRow({ request, groupName }: GroupJoinRequestRowProps) {
  const updateWithId = updateGroupJoinRequest.bind(null, request.id);
  const fullName = `${request.first_name} ${request.last_name}`;

  return (
    <details className="group p-4">
      <summary className="flex cursor-pointer flex-wrap items-center gap-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{fullName}</p>
          <p className="truncate text-sm text-ink-faint">
            {groupName ?? "Sin grupo específico"} ·{" "}
            {formatDate(request.created_at.slice(0, 10))}
          </p>
        </div>
        <Badge variant={request.status === "nueva" ? "accent" : "neutral"}>
          {FORM_STATUS_OPTIONS.find((o) => o.value === request.status)?.label}
        </Badge>
      </summary>

      <div className="mt-4 space-y-4 border-t border-border pt-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-ink-faint">Teléfono</dt>
            <dd className="text-ink">{request.phone}</dd>
          </div>
          {request.whatsapp && (
            <div>
              <dt className="text-xs text-ink-faint">WhatsApp</dt>
              <dd className="text-ink">{request.whatsapp}</dd>
            </div>
          )}
          {request.email && (
            <div>
              <dt className="text-xs text-ink-faint">Correo</dt>
              <dd className="text-ink">{request.email}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-ink-faint">Ubicación</dt>
            <dd className="text-ink">
              {[request.neighborhood, request.locality, request.city]
                .filter(Boolean)
                .join(", ")}
            </dd>
          </div>
          {request.age && (
            <div>
              <dt className="text-xs text-ink-faint">Edad</dt>
              <dd className="text-ink">{request.age}</dd>
            </div>
          )}
          {request.availability && (
            <div>
              <dt className="text-xs text-ink-faint">Disponibilidad</dt>
              <dd className="text-ink">{request.availability}</dd>
            </div>
          )}
        </dl>
        {request.notes && (
          <div>
            <p className="text-xs text-ink-faint">Observaciones</p>
            <p className="text-sm text-ink">{request.notes}</p>
          </div>
        )}

        <form action={updateWithId} className="flex flex-wrap items-end gap-4">
          <div className="w-48">
            <SelectField
              label="Estado"
              name="status"
              options={FORM_STATUS_OPTIONS}
              defaultValue={request.status}
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-ink hover:bg-accent-strong"
          >
            Guardar
          </button>
        </form>
      </div>
    </details>
  );
}
