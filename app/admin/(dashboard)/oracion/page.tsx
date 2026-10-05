import { HeartHandshake } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { PrayerRequestRow } from "@/components/admin/PrayerRequestRow";
import { Button } from "@/components/ui/Button";
import { FORM_DEFINITIONS } from "@/lib/email/form-definitions";
import { createClient } from "@/lib/supabase/server";

export default async function PrayerRequestsInboxPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: requests }, { data: profile }, { data: staff }] = await Promise.all([
    supabase.from("prayer_requests").select("*").order("created_at", { ascending: false }),
    user
      ? supabase.from("profiles").select("role").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
    supabase.from("profiles").select("id, full_name").eq("active", true),
  ]);

  const isAdmin = profile?.role === "admin";
  const staffOptions = (staff ?? []).map((s) => ({ value: s.id, label: s.full_name }));

  return (
    <div>
      <PageHeader
        title="Peticiones de oración"
        description={
          isAdmin
            ? "Incluye las peticiones marcadas como privadas."
            : "Las peticiones privadas solo las puede ver el Administrador."
        }
        actions={
          // La configuración vive en un solo lugar (Formularios → Correos); aquí solo se enlaza.
          isAdmin ? (
            <Button
              as={Link}
              href={`/admin/formularios/configuracion#${FORM_DEFINITIONS.oracion.anchor}`}
              variant="secondary"
              size="sm"
            >
              Configurar correos
            </Button>
          ) : undefined
        }
      />

      {!requests || requests.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="Todavía no hay peticiones."
          className="mt-8"
        />
      ) : (
        <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-paper-raised">
          {requests.map((request) => (
            <PrayerRequestRow
              key={request.id}
              request={request}
              staffOptions={staffOptions}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
