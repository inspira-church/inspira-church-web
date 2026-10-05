import { beforeEach, describe, expect, it, vi } from "vitest";
import { mergeFormEmailConfig, resolveSettingsFromRows } from "@/lib/email/form-config";
import { FORM_DEFINITIONS, FORM_TYPES } from "@/lib/email/form-definitions";

/**
 * Correos adicionales de la configuración de Peticiones de oración, como los
 * ve la Server Action del CMS: agregar uno, varios, eliminar, persistir (lo
 * escrito vuelve a leerse igual), rechazar duplicados e inválidos, y que cada
 * formulario escriba SOLO su propia fila.
 */
const db = vi.hoisted(() => ({
  rows: new Map<string, unknown>(),
  failNext: false,
}));

vi.mock("@/lib/require-admin", () => ({ requireAdmin: async () => ({ id: "admin-1" }) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "admin-1" } } }) },
    from: () => ({
      upsert: (row: { form_key: string; config: unknown }) => ({
        select: async () => {
          if (db.failNext) return { data: null, error: { message: "boom" } };
          db.rows.set(row.form_key, row.config); // lo "persistido"
          return { data: [{ form_key: row.form_key }], error: null };
        },
      }),
    }),
  }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/audit", () => ({ logAudit: async () => undefined }));

const { updateFormEmailConfig } = await import("@/lib/actions/form-email-settings");

function fd(additional: string[], extra: Record<string, string> = {}) {
  const f = new FormData();
  const base: Record<string, string> = {
    internalEnabled: "on",
    useDefaultRecipient: "on",
    primary: "",
    autoReplyEnabled: "on",
    autoReplySubject: "Recibimos tu petición de oración | Inspira Church",
    autoReplyMessage: "Hola {{nombre}},\n\nGracias.\n\nInspira Church",
    ...extra,
  };
  for (const [k, v] of Object.entries(base)) f.set(k, v);
  f.set("additionalCount", String(additional.length));
  additional.forEach((a, i) => f.set(`additional.${i}`, a));
  return f;
}

const savedAdditional = (formKey = "oracion") =>
  mergeFormEmailConfig(formKey as "oracion", db.rows.get(formKey)).internal.additional;

beforeEach(() => {
  db.rows.clear();
  db.failNext = false;
});

describe("Peticiones de oración — correos adicionales", () => {
  it("1. agregar UN adicional", async () => {
    const result = await updateFormEmailConfig("oracion", {}, fd(["pastor@inspirachurch.co"]));

    expect(result).toEqual({ success: true });
    expect(savedAdditional()).toEqual(["pastor@inspirachurch.co"]);
  });

  it("2. agregar VARIOS", async () => {
    await updateFormEmailConfig("oracion", {}, fd(["uno@x.co", "dos@x.co", "tres@x.co"]));

    expect(savedAdditional()).toEqual(["uno@x.co", "dos@x.co", "tres@x.co"]);
  });

  it("3. eliminar uno: al guardar sin esa fila, desaparece de lo persistido y los demás se conservan", async () => {
    await updateFormEmailConfig("oracion", {}, fd(["uno@x.co", "dos@x.co", "tres@x.co"]));
    // El admin pulsa «Eliminar» en la fila 2: el formulario ahora envía 2 filas.
    await updateFormEmailConfig("oracion", {}, fd(["uno@x.co", "tres@x.co"]));

    expect(savedAdditional()).toEqual(["uno@x.co", "tres@x.co"]);
  });

  it("3b. eliminar todos: queda la lista vacía (no revive la anterior)", async () => {
    await updateFormEmailConfig("oracion", {}, fd(["uno@x.co"]));
    await updateFormEmailConfig("oracion", {}, fd([]));

    expect(savedAdditional()).toEqual([]);
  });

  it("4. persistencia: lo guardado se lee igual al recargar (misma ruta de lectura que usa el CMS y el envío)", async () => {
    await updateFormEmailConfig("oracion", {}, fd([" Uno@X.co ", "dos@x.co"], { useDefaultRecipient: "", primary: "principal@x.co" }));

    const rows = [...db.rows.entries()].map(([form_key, config]) => ({ form_key, config }));
    const { config } = resolveSettingsFromRows("oracion", rows);
    expect(config.internal).toEqual({
      enabled: true,
      useDefaultRecipient: false,
      primary: "principal@x.co",
      additional: ["Uno@X.co", "dos@x.co"], // recortados
    });
  });

  it("5. un duplicado se rechaza, no se guarda nada y el mensaje dice cuál", async () => {
    const result = await updateFormEmailConfig("oracion", {}, fd(["uno@x.co", "UNO@x.co"]));

    expect(result.fieldErrors?.additional).toContain("repetido");
    expect(result.success).toBeUndefined();
    expect(db.rows.size).toBe(0);
  });

  it("5b. repetir el principal propio como adicional también se rechaza", async () => {
    const result = await updateFormEmailConfig(
      "oracion",
      {},
      fd(["principal@x.co"], { useDefaultRecipient: "", primary: "principal@x.co" })
    );

    expect(result.fieldErrors?.additional).toContain("principal");
    expect(db.rows.size).toBe(0);
  });

  it("6. un correo inválido se rechaza y no se guarda nada", async () => {
    const result = await updateFormEmailConfig("oracion", {}, fd(["uno@x.co", "no-es-un-correo"]));

    expect(result.fieldErrors?.additional).toContain("no-es-un-correo");
    expect(db.rows.size).toBe(0);
  });

  it("las filas en blanco no se guardan (ni vacías ni solo espacios)", async () => {
    await updateFormEmailConfig("oracion", {}, fd(["uno@x.co", "", "   ", "dos@x.co"]));

    expect(savedAdditional()).toEqual(["uno@x.co", "dos@x.co"]);
  });

  it("máximo 10: el 10.º se acepta y el 11.º se rechaza", async () => {
    const ten = Array.from({ length: 10 }, (_, i) => `u${i}@x.co`);
    expect(await updateFormEmailConfig("oracion", {}, fd(ten))).toEqual({ success: true });
    expect(savedAdditional()).toHaveLength(10);

    db.rows.clear();
    const result = await updateFormEmailConfig("oracion", {}, fd([...ten, "u10@x.co"]));
    expect(result.fieldErrors?.additional).toContain("Máximo 10");
    expect(db.rows.size).toBe(0);
  });

  it("si la base de datos falla NO se reporta éxito (no hay falso 'guardado')", async () => {
    db.failNext = true;

    const result = await updateFormEmailConfig("oracion", {}, fd(["uno@x.co"]));

    expect(result).toHaveProperty("error");
    expect(result.success).toBeUndefined();
    expect(db.rows.size).toBe(0);
  });
});

describe("cada formulario conserva su propia configuración", () => {
  it("guardar adicionales en Oración escribe SOLO la fila 'oracion' (nada en Contacto, Primera vez, Grupos ni Generaciones)", async () => {
    await updateFormEmailConfig("oracion", {}, fd(["pastor@x.co"]));

    expect([...db.rows.keys()]).toEqual(["oracion"]);
    for (const other of FORM_TYPES.filter((t) => t !== "oracion")) {
      expect(db.rows.has(other)).toBe(false);
      expect(resolveSettingsFromRows(other, [{ form_key: "oracion", config: db.rows.get("oracion") }]).config.internal.additional).toEqual([]);
    }
  });

  it("los adicionales de Contacto no aparecen en la configuración de Oración", async () => {
    await updateFormEmailConfig("contacto", {}, fd(["contacto@x.co"]));
    await updateFormEmailConfig("oracion", {}, fd(["oracion@x.co"]));

    expect(savedAdditional("contacto")).toEqual(["contacto@x.co"]);
    expect(savedAdditional("oracion")).toEqual(["oracion@x.co"]);
  });
});

describe("acceso y anclas del CMS", () => {
  it("cada tarjeta tiene un ancla única", () => {
    const anchors = FORM_TYPES.map((t) => FORM_DEFINITIONS[t].anchor);
    expect(new Set(anchors).size).toBe(anchors.length);
    for (const a of anchors) expect(a).toMatch(/^[a-z0-9-]+$/);
  });

  it("el enlace desde /admin/oracion apunta a la tarjeta de Peticiones de oración", () => {
    expect(FORM_DEFINITIONS.oracion.anchor).toBe("peticiones-oracion");
    expect(FORM_DEFINITIONS.oracion.adminPath).toBe("/admin/oracion");
  });

  it("la nota de la tarjeta dice que los adicionales también reciben las privadas", () => {
    const note = FORM_DEFINITIONS.oracion.cmsNote ?? "";
    expect(note).toContain("autorizados");
    expect(note).toContain("también las privadas");
    expect(note).not.toContain("no reciben");
  });
});
