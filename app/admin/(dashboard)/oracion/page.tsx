import { PrayerRequestRow } from "@/components/admin/PrayerRequestRow";
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
      <h1 className="font-display text-2xl font-semibold text-ink">
        Peticiones de oración
      </h1>
      <p className="mt-1 text-sm text-ink-faint">
        {isAdmin
          ? "Incluye las peticiones marcadas como privadas."
          : "Las peticiones privadas solo las puede ver el Administrador."}
      </p>

      {!requests || requests.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border-strong p-10 text-center">
          <p className="text-ink-soft">Todavía no hay peticiones.</p>
        </div>
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
