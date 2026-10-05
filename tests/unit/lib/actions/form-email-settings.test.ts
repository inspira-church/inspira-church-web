import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  isAdmin: true,
  upserts: [] as { row: Record<string, unknown>; options: unknown }[],
  result: { data: [{ form_key: "contacto" }] as { form_key: string }[] | null, error: null as { code?: string; message?: string } | null },
}));

vi.mock("@/lib/require-admin", () => ({
  requireAdmin: async () => (state.isAdmin ? { id: "admin-1" } : null),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "admin-1" } } }) },
    from: () => ({
      upsert: (row: Record<string, unknown>, options: unknown) => {
        state.upserts.push({ row, options });
        return { select: async () => state.result };
      },
    }),
  }),
}));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (...a: unknown[]) => revalidatePathMock(...a) }));
const logAuditMock = vi.fn();
vi.mock("@/lib/audit", () => ({ logAudit: (...a: unknown[]) => logAuditMock(...a) }));

const { updateDefaultFormRecipient, updateFormEmailConfig } = await import("@/lib/actions/form-email-settings");

function fd(fields: Record<string, string>, additional: string[] = []) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  f.set("additionalCount", String(additional.length));
  additional.forEach((a, i) => f.set(`additional.${i}`, a));
  return f;
}

const baseFields = {
  internalEnabled: "on",
  useDefaultRecipient: "on",
  primary: "",
  autoReplyEnabled: "on",
  autoReplySubject: "Recibimos tu mensaje",
  autoReplyMessage: "Hola {{nombre}},\n\nGracias.\n\nInspira Church",
};

beforeEach(() => {
  state.isAdmin = true;
  state.upserts = [];
  state.result = { data: [{ form_key: "contacto" }], error: null };
  revalidatePathMock.mockReset();
  logAuditMock.mockReset();
});

describe("updateFormEmailConfig", () => {
  it("guarda la estructura esperada en la fila del formulario y devuelve success", async () => {
    const result = await updateFormEmailConfig(
      "contacto",
      {},
      fd({ ...baseFields, useDefaultRecipient: "", primary: "pastor@inspirachurch.co" }, ["uno@x.co", "dos@x.co"])
    );

    expect(result).toEqual({ success: true });
    expect(state.upserts).toHaveLength(1);
    expect(state.upserts[0].row).toMatchObject({
      form_key: "contacto",
      updated_by: "admin-1",
      config: {
        internal: {
          enabled: true,
          useDefaultRecipient: false,
          primary: "pastor@inspirachurch.co",
          additional: ["uno@x.co", "dos@x.co"],
        },
        autoReply: { enabled: true, subject: "Recibimos tu mensaje" },
      },
    });
    expect(state.upserts[0].options).toEqual({ onConflict: "form_key" });
  });

  it("las filas de correo adicional en blanco no se guardan", async () => {
    await updateFormEmailConfig("contacto", {}, fd(baseFields, ["uno@x.co", "", "   ", "dos@x.co"]));

    expect((state.upserts[0].row.config as { internal: { additional: string[] } }).internal.additional).toEqual([
      "uno@x.co",
      "dos@x.co",
    ]);
  });

  it("las casillas desmarcadas se guardan como false (notificación OFF y respuesta OFF)", async () => {
    await updateFormEmailConfig(
      "contacto",
      {},
      fd({ ...baseFields, internalEnabled: "", autoReplyEnabled: "", autoReplySubject: "", autoReplyMessage: "" })
    );

    const config = state.upserts[0].row.config as { internal: { enabled: boolean }; autoReply: { enabled: boolean; subject: string } };
    expect(config.internal.enabled).toBe(false);
    expect(config.autoReply.enabled).toBe(false);
    // "" es un valor válido y se respeta.
    expect(config.autoReply.subject).toBe("");
  });

  it("no revalida páginas públicas (la configuración no se cachea) pero sí refresca la pantalla del CMS", async () => {
    await updateFormEmailConfig("contacto", {}, fd(baseFields));
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/formularios/configuracion");
    expect(revalidatePathMock).not.toHaveBeenCalledWith("/contacto");
  });

  it("audita el cambio", async () => {
    await updateFormEmailConfig("oracion", {}, fd(baseFields));
    expect(logAuditMock).toHaveBeenCalledWith(expect.objectContaining({ entityType: "form_email_settings" }));
  });

  it("un no-administrador no escribe nada", async () => {
    state.isAdmin = false;

    const result = await updateFormEmailConfig("contacto", {}, fd(baseFields));

    expect(result).toHaveProperty("error");
    expect(state.upserts).toEqual([]);
  });

  it("rechaza una clave de formulario desconocida (no se puede escribir una fila arbitraria)", async () => {
    const result = await updateFormEmailConfig("global", {}, fd(baseFields));
    expect(result).toHaveProperty("error");
    expect(state.upserts).toEqual([]);
  });

  it("datos inválidos: devuelve errores por campo y no escribe", async () => {
    const result = await updateFormEmailConfig("contacto", {}, fd(baseFields, ["malo"]));

    expect(result.fieldErrors?.additional).toContain("malo");
    expect(result.success).toBeUndefined();
    expect(state.upserts).toEqual([]);
  });

  it("error de Supabase: devuelve error, no success ni auditoría", async () => {
    state.result = { data: null, error: { message: "boom" } };

    const result = await updateFormEmailConfig("contacto", {}, fd(baseFields));

    expect(result).toHaveProperty("error");
    expect(result.success).toBeUndefined();
    expect(logAuditMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("0 filas escritas (RLS) NO es un éxito falso", async () => {
    state.result = { data: [], error: null };

    const result = await updateFormEmailConfig("contacto", {}, fd(baseFields));

    expect(result).toHaveProperty("error");
    expect(result.success).toBeUndefined();
  });

  it("tabla inexistente (migración sin aplicar): mensaje claro", async () => {
    state.result = { data: null, error: { code: "PGRST205", message: "Could not find the table" } };

    const result = await updateFormEmailConfig("contacto", {}, fd(baseFields));

    expect(result.error).toContain("migración 028");
  });
});

describe("updateDefaultFormRecipient", () => {
  it("guarda el correo predeterminado en la fila global", async () => {
    const f = new FormData();
    f.set("defaultRecipient", " admin@inspirachurch.co ");

    const result = await updateDefaultFormRecipient({}, f);

    expect(result).toEqual({ success: true });
    expect(state.upserts[0].row).toMatchObject({
      form_key: "global",
      config: { defaultRecipient: "admin@inspirachurch.co" },
    });
  });

  it('vaciar el campo guarda "" (se usa el respaldo del servidor)', async () => {
    const f = new FormData();
    f.set("defaultRecipient", "");

    await updateDefaultFormRecipient({}, f);

    expect(state.upserts[0].row).toMatchObject({ config: { defaultRecipient: "" } });
  });

  it("correo inválido: error por campo y no escribe", async () => {
    const f = new FormData();
    f.set("defaultRecipient", "no-es-correo");

    const result = await updateDefaultFormRecipient({}, f);

    expect(result.fieldErrors?.defaultRecipient).toBeTruthy();
    expect(state.upserts).toEqual([]);
  });

  it("solo un Administrador", async () => {
    state.isAdmin = false;
    const f = new FormData();
    f.set("defaultRecipient", "a@x.co");

    expect(await updateDefaultFormRecipient({}, f)).toHaveProperty("error");
    expect(state.upserts).toEqual([]);
  });
});
