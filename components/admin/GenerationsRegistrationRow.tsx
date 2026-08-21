import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { Badge } from "@/components/ui/Badge";
import { SelectField } from "@/components/ui/SelectField";
import { deleteGenerationsRegistration, updateGenerationsRegistration } from "@/lib/actions/inbox";
import { FORM_STATUS_OPTIONS } from "@/lib/constants-admin";
import { formatDate } from "@/lib/format";

interface GenerationsRegistrationRowProps {
  registration: {
    id: string;
    child_first_name: string;
    child_last_name: string;
    child_age: number;
    child_school: string | null;
    allergies: string | null;
    area_interest: string | null;
    guardian_name: string;
    guardian_phone: string;
    guardian_email: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    image_consent: boolean;
    status: string;
    internal_notes: string | null;
    created_at: string;
  };
}

export function GenerationsRegistrationRow({ registration }: GenerationsRegistrationRowProps) {
  const updateWithId = updateGenerationsRegistration.bind(null, registration.id);
  const childName = `${registration.child_first_name} ${registration.child_last_name}`;

  return (
    <details className="group p-4">
      <summary className="flex cursor-pointer flex-wrap items-center gap-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">
            {childName} <span className="text-ink-faint">· {registration.child_age} años</span>
          </p>
          <p className="truncate text-sm text-ink-faint">
            {registration.guardian_name} · {formatDate(registration.created_at.slice(0, 10))}
          </p>
        </div>
        <Badge variant={registration.status === "nueva" ? "accent" : "neutral"}>
          {FORM_STATUS_OPTIONS.find((o) => o.value === registration.status)?.label}
        </Badge>
      </summary>

      <div className="mt-4 space-y-4 border-t border-border pt-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Niño o joven</p>
          <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-faint">Nombre</dt>
              <dd className="text-ink">{childName}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Edad</dt>
              <dd className="text-ink">{registration.child_age} años</dd>
            </div>
            {registration.child_school && (
              <div>
                <dt className="text-xs text-ink-faint">Colegio</dt>
                <dd className="text-ink">{registration.child_school}</dd>
              </div>
            )}
            {registration.area_interest && (
              <div>
                <dt className="text-xs text-ink-faint">Área de interés</dt>
                <dd className="text-ink">{registration.area_interest}</dd>
              </div>
            )}
            {registration.allergies && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-ink-faint">Alergias / condiciones</dt>
                <dd className="text-ink">{registration.allergies}</dd>
              </div>
            )}
          </dl>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Padre, madre o acudiente
          </p>
          <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-faint">Nombre</dt>
              <dd className="text-ink">{registration.guardian_name}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Teléfono</dt>
              <dd className="text-ink">{registration.guardian_phone}</dd>
            </div>
            {registration.guardian_email && (
              <div>
                <dt className="text-xs text-ink-faint">Correo</dt>
                <dd className="text-ink">{registration.guardian_email}</dd>
              </div>
            )}
          </dl>
        </div>

        {(registration.emergency_contact_name || registration.emergency_contact_phone) && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Contacto de emergencia
            </p>
            <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
              {registration.emergency_contact_name && (
                <div>
                  <dt className="text-xs text-ink-faint">Nombre</dt>
                  <dd className="text-ink">{registration.emergency_contact_name}</dd>
                </div>
              )}
              {registration.emergency_contact_phone && (
                <div>
                  <dt className="text-xs text-ink-faint">Teléfono</dt>
                  <dd className="text-ink">{registration.emergency_contact_phone}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        <p className="text-xs text-ink-faint">
          Uso de imagen: {registration.image_consent ? "autorizado" : "no autorizado"}.
        </p>

        <form action={updateWithId} className="flex flex-wrap items-end gap-4">
          <div className="w-48">
            <SelectField
              label="Estado"
              name="status"
              options={FORM_STATUS_OPTIONS}
              defaultValue={registration.status}
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-ink hover:bg-accent-strong"
          >
            Guardar
          </button>
        </form>
        <ConfirmForm
          action={deleteGenerationsRegistration.bind(null, registration.id)}
          confirmMessage={`¿Eliminar la inscripción de "${childName}"? Esta acción no se puede deshacer.`}
        >
          <button type="submit" className="text-sm text-danger hover:underline">
            Eliminar
          </button>
        </ConfirmForm>
      </div>
    </details>
  );
}
