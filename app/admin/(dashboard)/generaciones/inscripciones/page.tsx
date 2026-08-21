import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/admin/EmptyState";
import { GenerationsRegistrationRow } from "@/components/admin/GenerationsRegistrationRow";
import { PageHeader } from "@/components/admin/PageHeader";
import { createClient } from "@/lib/supabase/server";

/**
 * Mismo patrón que /admin/oracion: la tabla es admin-only por RLS
 * (generations_registrations_select_admin), así que un Editor que llegue
 * aquí simplemente recibe una lista vacía — no hace falta un chequeo de
 * rol adicional en código.
 */
export default async function GenerationsRegistrationsPage() {
  const supabase = await createClient();
  const { data: registrations } = await supabase
    .from("generations_registrations")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Inscripciones de Generaciones"
        description="Datos de niños y jóvenes inscritos desde /generaciones/inscripcion — visibles solo para Administrador."
      />

      {!registrations || registrations.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Todavía no hay inscripciones." className="mt-8" />
      ) : (
        <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-paper-raised">
          {registrations.map((registration) => (
            <GenerationsRegistrationRow key={registration.id} registration={registration} />
          ))}
        </div>
      )}
    </div>
  );
}
