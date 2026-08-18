import { History } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { createClient } from "@/lib/supabase/server";

const MODULE_LABELS: Record<string, string> = {
  home: "Inicio",
  about: "Nosotros",
  first_time: "Primera vez",
  contact_settings: "Contacto",
  team: "Equipo",
  sermons: "Prédicas",
  groups: "Grupos",
  schedules: "Horarios",
  events: "Eventos",
  inbox: "Formularios",
  prayer_requests: "Peticiones de oración",
  media: "Medios",
  users: "Usuarios",
  auth: "Sesión",
};

const ACTION_LABELS: Record<string, string> = {
  create: "Creó",
  update: "Actualizó",
  delete: "Borró",
  publish: "Publicó",
  unpublish: "Despublicó",
  activate: "Activó",
  deactivate: "Desactivó",
  login: "Inicio de sesión",
  login_failed: "Inicio de sesión fallido",
  logout: "Cierre de sesión",
};

const PAGE_SIZE = 40;

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface SearchParams {
  modulo?: string;
  accion?: string;
  usuario?: string;
  desde?: string;
  hasta?: string;
  page?: string;
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { modulo, accion, usuario, desde, hasta, page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  const supabase = await createClient();
  let query = supabase
    .from("audit_logs")
    .select(
      "id, user_name, user_role, action, module, entity_type, entity_id, description, previous_data, new_data, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE - 1);

  if (modulo) query = query.eq("module", modulo);
  if (accion) query = query.eq("action", accion);
  if (usuario) query = query.ilike("user_name", `%${usuario}%`);
  if (desde) query = query.gte("created_at", `${desde}T00:00:00`);
  if (hasta) query = query.lte("created_at", `${hasta}T23:59:59`);

  const { data: logs, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const hasFilters = Boolean(modulo || accion || usuario || desde || hasta);

  return (
    <div>
      <PageHeader
        title="Actividad"
        description="Quién hizo qué en el panel, y cuándo — inicios de sesión y acciones administrativas. Solo lectura."
      />

      <form className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-paper-raised p-4">
        <div>
          <label className="block text-xs font-medium text-ink-soft">Usuario</label>
          <input
            type="text"
            name="usuario"
            defaultValue={usuario}
            placeholder="Nombre"
            className="mt-1 rounded-md border border-border-strong bg-paper px-2.5 py-1.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-soft">Módulo</label>
          <select
            name="modulo"
            defaultValue={modulo ?? ""}
            className="mt-1 rounded-md border border-border-strong bg-paper px-2.5 py-1.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="">Todos</option>
            {Object.entries(MODULE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-soft">Acción</label>
          <select
            name="accion"
            defaultValue={accion ?? ""}
            className="mt-1 rounded-md border border-border-strong bg-paper px-2.5 py-1.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="">Todas</option>
            {Object.entries(ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-soft">Desde</label>
          <input
            type="date"
            name="desde"
            defaultValue={desde}
            className="mt-1 rounded-md border border-border-strong bg-paper px-2.5 py-1.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-soft">Hasta</label>
          <input
            type="date"
            name="hasta"
            defaultValue={hasta}
            className="mt-1 rounded-md border border-border-strong bg-paper px-2.5 py-1.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-strong"
        >
          Filtrar
        </button>
        {hasFilters && (
          <Link
            href="/admin/actividad"
            className="text-sm font-medium text-ink-soft hover:text-ink"
          >
            Limpiar
          </Link>
        )}
      </form>

      {!logs || logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No hay actividad registrada con esos filtros."
          description={hasFilters ? "Prueba a ajustar o limpiar los filtros." : undefined}
          className="mt-8"
        />
      ) : (
        <div className="mt-6">
          <Table>
            <TableHead>
              <TableHeaderCell>Fecha</TableHeaderCell>
              <TableHeaderCell>Usuario</TableHeaderCell>
              <TableHeaderCell>Rol</TableHeaderCell>
              <TableHeaderCell>Acción</TableHeaderCell>
              <TableHeaderCell>Módulo</TableHeaderCell>
              <TableHeaderCell>Elemento</TableHeaderCell>
              <TableHeaderCell>Detalle</TableHeaderCell>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-ink-soft">
                    {formatDateTime(log.created_at)}
                  </TableCell>
                  <TableCell className="text-ink">{log.user_name ?? "—"}</TableCell>
                  <TableCell>
                    {log.user_role && (
                      <Badge variant={log.user_role === "admin" ? "accent" : "neutral"}>
                        {log.user_role === "admin" ? "Administrador" : "Editor"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-ink">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </TableCell>
                  <TableCell className="text-ink-soft">
                    {(log.module && MODULE_LABELS[log.module]) ?? log.module ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-ink-soft" title={log.description}>
                    {log.description}
                  </TableCell>
                  <TableCell>
                    {(log.previous_data || log.new_data) && (
                      <details>
                        <summary className="cursor-pointer text-xs font-medium text-accent">
                          Ver detalle
                        </summary>
                        <div className="mt-2 max-w-sm space-y-2 text-xs">
                          {log.previous_data != null && (
                            <div>
                              <p className="font-semibold text-ink-faint">Antes</p>
                              <pre className="overflow-x-auto rounded-md bg-paper p-2 text-ink-soft">
                                {JSON.stringify(log.previous_data, null, 1)}
                              </pre>
                            </div>
                          )}
                          {log.new_data != null && (
                            <div>
                              <p className="font-semibold text-ink-faint">Después</p>
                              <pre className="overflow-x-auto rounded-md bg-paper p-2 text-ink-soft">
                                {JSON.stringify(log.new_data, null, 1)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          {pageNum > 1 && (
            <Link
              href={{
                pathname: "/admin/actividad",
                query: { modulo, accion, usuario, desde, hasta, page: pageNum - 1 },
              }}
              className="text-accent hover:underline"
            >
              ← Anterior
            </Link>
          )}
          <span className="text-ink-faint">
            Página {pageNum} de {totalPages}
          </span>
          {pageNum < totalPages && (
            <Link
              href={{
                pathname: "/admin/actividad",
                query: { modulo, accion, usuario, desde, hasta, page: pageNum + 1 },
              }}
              className="text-accent hover:underline"
            >
              Siguiente →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
