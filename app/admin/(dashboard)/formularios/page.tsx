import { DoorOpen, Inbox, UserPlus } from "lucide-react";
import { ContactRow } from "@/components/admin/ContactRow";
import { EmptyState } from "@/components/admin/EmptyState";
import { FirstTimeConnectionRow } from "@/components/admin/FirstTimeConnectionRow";
import { GroupJoinRequestRow } from "@/components/admin/GroupJoinRequestRow";
import { PageHeader } from "@/components/admin/PageHeader";
import { createClient } from "@/lib/supabase/server";

export default async function FormsInboxPage() {
  const supabase = await createClient();

  const [
    { data: contacts },
    { data: groupRequests },
    { data: firstTimeConnections },
    { data: staff },
    { data: groups },
    { data: events },
  ] = await Promise.all([
    supabase.from("contacts").select("*").order("created_at", { ascending: false }),
    supabase
      .from("group_join_requests")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("first_time_connections")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name").eq("active", true),
    supabase.from("growth_groups").select("id, name"),
    supabase.from("events").select("id, name"),
  ]);

  const staffOptions = (staff ?? []).map((s) => ({ value: s.id, label: s.full_name }));
  const groupNameById = new Map((groups ?? []).map((g) => [g.id, g.name]));
  const eventNameById = new Map((events ?? []).map((e) => [e.id, e.name]));

  return (
    <div>
      <PageHeader
        title="Formularios"
        description="Contactos, solicitudes para pertenecer a un grupo y fichas de conexión de Primera vez."
      />

      <h2 className="mt-8 font-display text-lg font-semibold text-ink">
        Contactos ({contacts?.length ?? 0})
      </h2>
      {!contacts || contacts.length === 0 ? (
        <EmptyState icon={Inbox} title="Todavía no hay contactos." className="mt-4" />
      ) : (
        <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-paper-raised">
          {contacts.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              staffOptions={staffOptions}
              eventName={contact.event_id ? (eventNameById.get(contact.event_id) ?? null) : null}
            />
          ))}
        </div>
      )}

      <h2 className="mt-10 font-display text-lg font-semibold text-ink">
        Solicitudes de grupo ({groupRequests?.length ?? 0})
      </h2>
      {!groupRequests || groupRequests.length === 0 ? (
        <EmptyState icon={UserPlus} title="Todavía no hay solicitudes." className="mt-4" />
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

      <h2 className="mt-10 font-display text-lg font-semibold text-ink">
        Primera vez ({firstTimeConnections?.length ?? 0})
      </h2>
      {!firstTimeConnections || firstTimeConnections.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="Todavía no hay fichas de conexión."
          description='Aparecen aquí cuando alguien completa "Déjanos tus datos" en /primera-vez.'
          className="mt-4"
        />
      ) : (
        <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-paper-raised">
          {firstTimeConnections.map((connection) => (
            <FirstTimeConnectionRow
              key={connection.id}
              connection={connection}
              staffOptions={staffOptions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
