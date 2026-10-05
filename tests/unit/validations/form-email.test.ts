import { describe, expect, it } from "vitest";
import { formEmailConfigSchema, globalFormEmailSchema } from "@/lib/validations/form-email";

const valid = {
  internalEnabled: true,
  useDefaultRecipient: true,
  primary: "",
  additional: [] as string[],
  autoReplyEnabled: true,
  autoReplySubject: "Recibimos tu mensaje",
  autoReplyMessage: "Hola {{nombre}},\n\nGracias.\n\nInspira Church",
};

const issues = (input: unknown) => {
  const r = formEmailConfigSchema.safeParse(input);
  return r.success ? [] : r.error.issues.map((i) => ({ path: String(i.path[0]), message: i.message }));
};

describe("formEmailConfigSchema", () => {
  it("acepta la configuración predeterminada", () => {
    expect(formEmailConfigSchema.safeParse(valid).success).toBe(true);
  });

  it("notificación interna OFF con respuesta automática ON es válido (son independientes)", () => {
    expect(formEmailConfigSchema.safeParse({ ...valid, internalEnabled: false }).success).toBe(true);
  });

  it("notificación interna ON con respuesta automática OFF es válido, incluso con el texto vacío", () => {
    expect(
      formEmailConfigSchema.safeParse({ ...valid, autoReplyEnabled: false, autoReplySubject: "", autoReplyMessage: "" })
        .success
    ).toBe(true);
  });

  describe("principal propio", () => {
    it("exige un correo cuando NO se usa el predeterminado", () => {
      expect(issues({ ...valid, useDefaultRecipient: false, primary: "" })[0].path).toBe("primary");
    });

    it("rechaza un correo inválido", () => {
      expect(issues({ ...valid, useDefaultRecipient: false, primary: "no-es-correo" })[0]).toMatchObject({
        path: "primary",
        message: "Correo no válido.",
      });
    });

    it("acepta uno válido (recortado)", () => {
      const r = formEmailConfigSchema.safeParse({ ...valid, useDefaultRecipient: false, primary: "  pastor@inspirachurch.co " });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.primary).toBe("pastor@inspirachurch.co");
    });

    it("con «usar predeterminado» marcado, el principal puede quedar vacío", () => {
      expect(formEmailConfigSchema.safeParse({ ...valid, useDefaultRecipient: true, primary: "" }).success).toBe(true);
    });
  });

  describe("correos adicionales", () => {
    it("acepta varios válidos", () => {
      expect(formEmailConfigSchema.safeParse({ ...valid, additional: ["a@x.co", "b@x.co"] }).success).toBe(true);
    });

    it("rechaza uno inválido y nombra cuál", () => {
      const [i] = issues({ ...valid, additional: ["a@x.co", "malo"] });
      expect(i.path).toBe("additional");
      expect(i.message).toContain("malo");
    });

    it("rechaza duplicados sin distinguir mayúsculas", () => {
      const [i] = issues({ ...valid, additional: ["a@x.co", "A@X.CO"] });
      expect(i.path).toBe("additional");
      expect(i.message).toContain("repetido");
    });

    it("rechaza repetir el principal propio como adicional", () => {
      const [i] = issues({ ...valid, useDefaultRecipient: false, primary: "p@x.co", additional: ["P@x.co"] });
      expect(i.path).toBe("additional");
      expect(i.message).toContain("principal");
    });

    it("máximo 10", () => {
      const eleven = Array.from({ length: 11 }, (_, n) => `u${n}@x.co`);
      expect(issues({ ...valid, additional: eleven })[0].path).toBe("additional");
      const ten = eleven.slice(0, 10);
      expect(formEmailConfigSchema.safeParse({ ...valid, additional: ten }).success).toBe(true);
    });
  });

  describe("respuesta automática", () => {
    it("ON exige asunto y mensaje", () => {
      const paths = issues({ ...valid, autoReplySubject: "", autoReplyMessage: "" }).map((i) => i.path);
      expect(paths).toContain("autoReplySubject");
      expect(paths).toContain("autoReplyMessage");
    });

    it("el asunto debe ir en una sola línea", () => {
      expect(issues({ ...valid, autoReplySubject: "Hola\nBcc: x@y.com" })[0].path).toBe("autoReplySubject");
    });

    it("solo permite la variable {{nombre}}", () => {
      expect(formEmailConfigSchema.safeParse({ ...valid, autoReplyMessage: "Hola {{nombre}}" }).success).toBe(true);
      const [i] = issues({ ...valid, autoReplyMessage: "Hola {{nombre}} {{correo}} {{process.env.X}}" });
      expect(i.path).toBe("autoReplyMessage");
      expect(i.message).toContain("{{correo}}");
    });

    it("también rechaza variables no permitidas en el asunto", () => {
      expect(issues({ ...valid, autoReplySubject: "Hola {{apellido}}" })[0].path).toBe("autoReplySubject");
    });

    it("límites de longitud", () => {
      expect(issues({ ...valid, autoReplySubject: "a".repeat(151) })[0].path).toBe("autoReplySubject");
      expect(issues({ ...valid, autoReplyMessage: "a".repeat(3001) })[0].path).toBe("autoReplyMessage");
    });
  });
});

describe("globalFormEmailSchema", () => {
  it("acepta un correo válido", () => {
    expect(globalFormEmailSchema.safeParse({ defaultRecipient: "admin@inspirachurch.co" }).success).toBe(true);
  });

  it('acepta "" (se usa el respaldo del servidor)', () => {
    expect(globalFormEmailSchema.safeParse({ defaultRecipient: "" }).success).toBe(true);
  });

  it("rechaza un correo inválido", () => {
    expect(globalFormEmailSchema.safeParse({ defaultRecipient: "admin" }).success).toBe(false);
  });
});
