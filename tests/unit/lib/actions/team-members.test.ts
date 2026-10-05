import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  updatePayload: undefined as Record<string, unknown> | undefined,
  insertPayload: undefined as Record<string, unknown> | undefined,
  updateResult: { data: [{ id: "m-1" }] as { id: string }[] | null, error: null as unknown },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: () => ({
      update: (payload: Record<string, unknown>) => {
        state.updatePayload = payload;
        return { eq: () => ({ select: async () => state.updateResult }) };
      },
      insert: (payload: Record<string, unknown>) => {
        state.insertPayload = payload;
        return { select: () => ({ single: async () => ({ data: { id: "m-new" }, error: null }) }) };
      },
    }),
  }),
}));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (...a: unknown[]) => revalidatePathMock(...a) }));

// redirect() de Next lanza una excepción para cortar la ejecución; se imita igual.
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`NEXT_REDIRECT:${to}`);
  },
}));

const logAuditMock = vi.fn();
vi.mock("@/lib/audit", () => ({ logAudit: (...a: unknown[]) => logAuditMock(...a) }));

const { createTeamMember, toggleTeamMemberActive, updateTeamMember } = await import(
  "@/lib/actions/team-members"
);

function form(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const fields: Record<string, string> = {
    fullName: "Luz Marina",
    type: "pastor",
    roleTitle: "Pastor Fundador",
    bio: ".",
    photoUrl: "https://x.supabase.co/storage/v1/object/public/pastors/foto.png",
    orderIndex: "0",
    active: "on",
    ...overrides,
  };
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

async function run(fd: FormData) {
  try {
    return await updateTeamMember("m-1", {}, fd);
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("NEXT_REDIRECT")) return { success: true as const };
    throw e;
  }
}

describe("updateTeamMember — biografía opcional", () => {
  beforeEach(() => {
    state.updatePayload = undefined;
    state.updateResult = { data: [{ id: "m-1" }], error: null };
    revalidatePathMock.mockReset();
    logAuditMock.mockReset();
  });

  it('A/E. vaciar la biografía (previo ".") persiste "" y no revive el valor anterior', async () => {
    await run(form({ bio: "" }));

    // La clave DEBE viajar en el payload: si fuera undefined, JSON.stringify la
    // omitiría y Supabase conservaría el "." para siempre (el bug original).
    expect(state.updatePayload).toBeDefined();
    expect(Object.prototype.hasOwnProperty.call(state.updatePayload, "bio")).toBe(true);
    expect(JSON.parse(JSON.stringify(state.updatePayload)).bio).toBe("");
  });

  it("una biografía con contenido se guarda exactamente como se escribió", async () => {
    await run(form({ bio: "Pastor desde 1998." }));
    expect(state.updatePayload?.bio).toBe("Pastor desde 1998.");
  });

  it("F. la foto subida se guarda en photo_url", async () => {
    await run(form());
    expect(state.updatePayload?.photo_url).toBe(
      "https://x.supabase.co/storage/v1/object/public/pastors/foto.png"
    );
  });

  it("sin foto, photo_url viaja como null (no se omite) para poder limpiar una foto anterior", async () => {
    await run(form({ photoUrl: "" }));
    expect(JSON.parse(JSON.stringify(state.updatePayload)).photo_url).toBeNull();
  });

  it("G. guardar invalida /nosotros (y las demás páginas públicas que muestran al equipo)", async () => {
    await run(form());
    expect(revalidatePathMock).toHaveBeenCalledWith("/nosotros");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/equipo");
    expect(revalidatePathMock).toHaveBeenCalledWith("/oraciones");
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
  });

  it("si el update no afecta ninguna fila (RLS o id inexistente) NO reporta éxito ni revalida", async () => {
    state.updateResult = { data: [], error: null };

    const result = await run(form());

    expect(result).toHaveProperty("error");
    expect(revalidatePathMock).not.toHaveBeenCalled();
    expect(logAuditMock).not.toHaveBeenCalled();
  });

  it("si Supabase devuelve error, lo reporta y no revalida", async () => {
    state.updateResult = { data: null, error: { message: "boom" } };

    const result = await run(form());

    expect(result).toHaveProperty("error");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("si la validación falla (sin nombre) no escribe nada", async () => {
    const result = await run(form({ fullName: "" }));

    expect(result).toHaveProperty("fieldErrors");
    expect(state.updatePayload).toBeUndefined();
  });
});

describe("createTeamMember / toggleTeamMemberActive", () => {
  beforeEach(() => {
    state.insertPayload = undefined;
    revalidatePathMock.mockReset();
  });

  it("crear invalida /nosotros para que el nuevo pastor aparezca sin esperar el ISR", async () => {
    await expect(createTeamMember({}, form())).rejects.toThrow("NEXT_REDIRECT");
    expect(state.insertPayload?.photo_url).toContain("foto.png");
    expect(revalidatePathMock).toHaveBeenCalledWith("/nosotros");
  });

  it("ocultar/mostrar a un miembro invalida /nosotros", async () => {
    await toggleTeamMemberActive("m-1", false);
    expect(revalidatePathMock).toHaveBeenCalledWith("/nosotros");
  });
});
