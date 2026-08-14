import { ContactRow } from "@/components/admin/ContactRow";
import { GroupJoinRequestRow } from "@/components/admin/GroupJoinRequestRow";
import { createClient } from "@/lib/supabase/server";

export default async function FormsInboxPage() {
  const supabase = await createClient();

  const [{ data: contacts }, { data: groupRequests }, { data: staff }, { data: groups }] =
    await Promise.all([
      supabase.from("contacts").select("*").order("created_at", { ascending: false }),
      supabase
        .from("group_join_requests")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name").eq("active", true),
      supabase.from("growth_groups").select("id, name"),
    ]);

  const staffOptions = (staff ?? []).map((s) => ({ value: s.id, label: s.full_name }));
  const groupNameById = new Map((groups ?? []).map((g) => [g.id, g.name]));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Formularios</h1>
      <p className="mt-1 text-sm text-ink-faint">
        Contactos y solicitudes para pertenecer a un grupo.
      </p>

      <h2 className="mt-8 font-display text-lg font-semibold text-ink">
        Contactos ({contacts?.length ?? 0})
      </h2>
      {!contacts || contacts.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-border-strong p-10 text-center">
          <p className="text-ink-soft">Todavía no hay contactos.</p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-paper-raised">
          {contacts.map((contact) => (
            <ContactRow key={contact.id} contact={contact} staffOptions={staffOptions} />
          ))}
        </div>
      )}

      <h2 className="mt-10 font-display text-lg font-semibold text-ink">
        Solicitudes de grupo ({groupRequests?.length ?? 0})
      </h2>
      {!groupRequests || groupRequests.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-border-strong p-10 text-center">
          <p className="text-ink-soft">Todavía no hay solicitudes.</p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-paper-raised">
          {groupRequests.map((request) => (
            <GroupJoinRequestRow
              key={request.id}
              request={request}
              groupName={request.group_id ? (groupNameById.get(request.group_id) ?? null) : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
