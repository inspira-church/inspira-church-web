import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Los interruptores (ocultar/mostrar, activar/desactivar, publicar/despublicar)
 * antes ignoraban el resultado de Supabase: un fallo se veía igual que un
 * éxito y encima se auditaba y revalidaba como si hubiera funcionado.
 */
const state = vi.hoisted(() => ({
  calls: [] as { table: string; payload: Record<string, unknown>; id: unknown }[],
  result: { data: [{ id: "row-1" }] as { id: string }[] | null, error: null as unknown },
  role: "admin" as "admin" | "editor",
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "u-1" } } }) },
    from: (table: string) => ({
      // requireAdmin() de users.ts: profiles.select(...).eq(...).single()
      select: () => ({
        eq: () => ({ single: async () => ({ data: { role: state.role, active: true } }) }),
      }),
      update: (payload: Record<string, unknown>) => ({
        eq: (_col: string, id: unknown) => {
          state.calls.push({ table, payload, id });
          return { select: async () => state.result };
        },
      }),
    }),
  }),
}));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (...a: unknown[]) => revalidatePathMock(...a) }));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`NEXT_REDIRECT:${to}`);
  },
}));
const logAuditMock = vi.fn();
vi.mock("@/lib/audit", () => ({ logAudit: (...a: unknown[]) => logAuditMock(...a) }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({}) }));

const { toggleTeamMemberActive } = await import("@/lib/actions/team-members");
const { toggleGrowthGroupActive } = await import("@/lib/actions/growth-groups");
const { toggleScheduleActive } = await import("@/lib/actions/schedules");
const { toggleSermonSeriesActive } = await import("@/lib/actions/sermon-series");
const { toggleSermonPublished } = await import("@/lib/actions/sermons");
const { toggleEventPublished } = await import("@/lib/actions/events");
const { toggleStaffActive } = await import("@/lib/actions/users");

const toggles = [
  { name: "equipo", fn: toggleTeamMemberActive, table: "team_members", column: "active" },
  { name: "grupos", fn: toggleGrowthGroupActive, table: "growth_groups", column: "active" },
  { name: "horarios", fn: toggleScheduleActive, table: "schedules", column: "active" },
  { name: "series", fn: toggleSermonSeriesActive, table: "sermon_series", column: "active" },
  { name: "prédicas", fn: toggleSermonPublished, table: "sermons", column: "published" },
  { name: "eventos", fn: toggleEventPublished, table: "events", column: "published" },
  { name: "usuarios", fn: toggleStaffActive, table: "profiles", column: "active" },
] as const;

beforeEach(() => {
  state.calls = [];
  state.result = { data: [{ id: "row-1" }], error: null };
  state.role = "admin";
  revalidatePathMock.mockReset();
  logAuditMock.mockReset();
});

describe.each(toggles)("toggle de $name", ({ fn, table, column }) => {
  it("éxito: escribe el valor pedido, audita, revalida y devuelve success", async () => {
    const result = await fn("row-1", false);

    expect(result).toEqual({ success: true });
    expect(state.calls).toEqual([{ table, payload: { [column]: false }, id: "row-1" }]);
    expect(logAuditMock).toHaveBeenCalledTimes(1);
    expect(revalidatePathMock).toHaveBeenCalled();
  });

  it("error de Supabase: devuelve error visible y NO audita ni revalida como éxito", async () => {
    state.result = { data: null, error: { message: "boom" } };

    const result = await fn("row-1", true);

    expect(result).toHaveProperty("error");
    expect((result as { error: string }).error.length).toBeGreaterThan(0);
    expect(result).not.toHaveProperty("success");
    expect(logAuditMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("0 filas afectadas (RLS o id inexistente): no es un éxito falso", async () => {
    state.result = { data: [], error: null };

    const result = await fn("row-1", true);

    expect(result).toHaveProperty("error");
    expect(result).not.toHaveProperty("success");
    expect(logAuditMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});

describe("toggleStaffActive — reglas propias", () => {
  it("un no-administrador no escribe nada y recibe el error de permisos", async () => {
    state.role = "editor";

    const result = await toggleStaffActive("u-2", false);

    expect(result).toHaveProperty("error");
    expect(state.calls).toEqual([]);
    expect(logAuditMock).not.toHaveBeenCalled();
  });

  it("si el trigger del admin principal rechaza el cambio, muestra ese motivo", async () => {
    state.result = { data: null, error: { message: "protect_primary_admin" } };

    const result = await toggleStaffActive("u-1", false);

    expect((result as { error: string }).error).toMatch(/administrador principal/i);
  });
});

describe("revalidación de los toggles públicos", () => {
  it("ocultar a un miembro invalida /nosotros", async () => {
    await toggleTeamMemberActive("row-1", false);
    expect(revalidatePathMock).toHaveBeenCalledWith("/nosotros");
  });

  it("publicar una prédica invalida /predicas y /oraciones", async () => {
    await toggleSermonPublished("row-1", true);
    expect(revalidatePathMock).toHaveBeenCalledWith("/predicas");
    expect(revalidatePathMock).toHaveBeenCalledWith("/oraciones");
  });
});
