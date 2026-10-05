import { describe, expect, it } from "vitest";
import {
  defaultFormEmailConfig,
  mergeFormEmailConfig,
  mergeGlobalSettings,
  resolveAllSettings,
  resolveSettingsFromRows,
} from "@/lib/email/form-config";
import { FORM_DEFINITIONS, FORM_TYPES, isFormType } from "@/lib/email/form-definitions";
import { isValidEmail, normalizeEmailList, resolveInternalRecipients } from "@/lib/email/form-recipients";

describe("defaults seguros", () => {
  it("todo formulario arranca con aviso interno ON hacia el predeterminado y respuesta automática ON", () => {
    for (const type of FORM_TYPES) {
      const c = defaultFormEmailConfig(type);
      expect(c.internal).toEqual({ enabled: true, useDefaultRecipient: true, primary: "", additional: [] });
      expect(c.autoReply.enabled).toBe(true);
      expect(c.autoReply.subject).toBe(FORM_DEFINITIONS[type].defaultAutoReply.subject);
      expect(c.autoReply.message).toContain("{{nombre}}");
      expect(c.autoReply.message).toContain("Inspira Church");
    }
  });

  it("no hay ningún formulario sin definición ni sin ruta del CMS", () => {
    for (const type of FORM_TYPES) {
      expect(FORM_DEFINITIONS[type].adminPath).toMatch(/^\/admin\//);
      expect(FORM_DEFINITIONS[type].publicRoute).toMatch(/^\//);
    }
  });

  it("isFormType rechaza claves desconocidas", () => {
    expect(isFormType("contacto")).toBe(true);
    expect(isFormType("global")).toBe(false);
    expect(isFormType("otro")).toBe(false);
  });
});

describe("mergeFormEmailConfig — un valor guardado como \"\" se respeta", () => {
  it("mensaje y asunto vacíos guardados NO se reemplazan por el default", () => {
    const c = mergeFormEmailConfig("contacto", { autoReply: { enabled: false, subject: "", message: "" } });
    expect(c.autoReply).toEqual({ enabled: false, subject: "", message: "" });
  });

  it("solo faltan los campos que no existen: se completan con el default", () => {
    const c = mergeFormEmailConfig("contacto", { internal: { enabled: false } });
    expect(c.internal.enabled).toBe(false);
    expect(c.internal.useDefaultRecipient).toBe(true);
    expect(c.autoReply.subject).toBe(FORM_DEFINITIONS.contacto.defaultAutoReply.subject);
  });

  it("valores de tipo inválido caen al default sin lanzar", () => {
    const c = mergeFormEmailConfig("oracion", { internal: { enabled: "sí", additional: "x" }, autoReply: 5 });
    expect(c).toEqual(defaultFormEmailConfig("oracion"));
  });

  it("filtra elementos no-string de los adicionales", () => {
    const c = mergeFormEmailConfig("contacto", { internal: { additional: ["a@b.co", 3, null] } });
    expect(c.internal.additional).toEqual(["a@b.co"]);
  });

  it("sin nada guardado devuelve los defaults", () => {
    expect(mergeFormEmailConfig("grupos", undefined)).toEqual(defaultFormEmailConfig("grupos"));
    expect(mergeFormEmailConfig("grupos", null)).toEqual(defaultFormEmailConfig("grupos"));
  });

  it("el correo predeterminado global vacío guardado se respeta", () => {
    expect(mergeGlobalSettings({ defaultRecipient: "" }).defaultRecipient).toBe("");
    expect(mergeGlobalSettings({}).defaultRecipient).toBe("");
  });
});

describe("resolveSettingsFromRows — aislamiento entre formularios", () => {
  const rows = [
    { form_key: "global", config: { defaultRecipient: "g@x.co" } },
    { form_key: "contacto", config: { internal: { enabled: false } } },
    { form_key: "oracion", config: { internal: { additional: ["o@x.co"] } } },
  ];

  it("cada formulario recibe solo su propia fila más la global", () => {
    expect(resolveSettingsFromRows("contacto", rows).config.internal.enabled).toBe(false);
    expect(resolveSettingsFromRows("oracion", rows).config.internal.enabled).toBe(true);
    expect(resolveSettingsFromRows("oracion", rows).config.internal.additional).toEqual(["o@x.co"]);
    expect(resolveSettingsFromRows("grupos", rows).config.internal.additional).toEqual([]);
    expect(resolveSettingsFromRows("grupos", rows).global.defaultRecipient).toBe("g@x.co");
  });

  it("resolveAllSettings entrega los 5 formularios aunque no haya filas", () => {
    const all = resolveAllSettings([]);
    expect(Object.keys(all.forms).sort()).toEqual([...FORM_TYPES].sort());
    expect(all.global.defaultRecipient).toBe("");
  });
});

describe("resolveInternalRecipients — prioridad", () => {
  const base = defaultFormEmailConfig("contacto");
  const withInternal = (internal: Partial<typeof base.internal>) => ({ ...base, internal: { ...base.internal, ...internal } });

  it("1) el de este formulario, si no usa el predeterminado", () => {
    expect(
      resolveInternalRecipients({
        config: withInternal({ useDefaultRecipient: false, primary: "form@x.co" }),
        defaultRecipient: "global@x.co",
        envRecipient: "env@x.co",
      })
    ).toEqual(["form@x.co"]);
  });

  it("2) el global del CMS", () => {
    expect(
      resolveInternalRecipients({ config: base, defaultRecipient: "global@x.co", envRecipient: "env@x.co" })
    ).toEqual(["global@x.co"]);
  });

  it("2b) marcada la casilla «usar predeterminado», el principal propio guardado se ignora", () => {
    expect(
      resolveInternalRecipients({
        config: withInternal({ useDefaultRecipient: true, primary: "form@x.co" }),
        defaultRecipient: "global@x.co",
        envRecipient: null,
      })
    ).toEqual(["global@x.co"]);
  });

  it("3) EMAIL_NOTIFICATION_TO como último respaldo", () => {
    expect(resolveInternalRecipients({ config: base, defaultRecipient: "", envRecipient: "env@x.co" })).toEqual([
      "env@x.co",
    ]);
  });

  it("4) ninguno: lista vacía", () => {
    expect(resolveInternalRecipients({ config: base, defaultRecipient: "", envRecipient: undefined })).toEqual([]);
  });

  it("principal propio inválido o vacío cae al siguiente nivel", () => {
    expect(
      resolveInternalRecipients({
        config: withInternal({ useDefaultRecipient: false, primary: "nope" }),
        defaultRecipient: "global@x.co",
        envRecipient: null,
      })
    ).toEqual(["global@x.co"]);
  });

  it("adicionales: se suman sin repetir al principal", () => {
    expect(
      resolveInternalRecipients({
        config: withInternal({ additional: ["a@x.co", "GLOBAL@x.co", "b@x.co"] }),
        defaultRecipient: "global@x.co",
        envRecipient: null,
      })
    ).toEqual(["global@x.co", "a@x.co", "b@x.co"]);
  });
});

describe("normalizeEmailList / isValidEmail", () => {
  it("recorta, descarta vacíos e inválidos y deduplica sin distinguir mayúsculas", () => {
    expect(normalizeEmailList([" a@x.co ", "", "A@X.CO", "malo", "b@x.co"])).toEqual(["a@x.co", "b@x.co"]);
  });

  it("valida el formato", () => {
    expect(isValidEmail("a@x.co")).toBe(true);
    expect(isValidEmail("a@x")).toBe(false);
    expect(isValidEmail("sin-arroba")).toBe(false);
  });
});
