import { describe, expect, it } from "vitest";
import {
  buildAutoReplyEmail,
  buildInternalEmail,
  findUnsupportedPlaceholders,
  renderTemplate,
  sanitizeInline,
  textToHtml,
} from "@/lib/email/form-templates";

describe("renderTemplate — {{nombre}}", () => {
  it("sustituye {{nombre}} por el nombre real (con o sin espacios, en cualquier capitalización)", () => {
    expect(renderTemplate("Hola {{nombre}},", { nombre: "Ana" })).toBe("Hola Ana,");
    expect(renderTemplate("Hola {{ nombre }},", { nombre: "Ana" })).toBe("Hola Ana,");
    expect(renderTemplate("Hola {{NOMBRE}},", { nombre: "Ana" })).toBe("Hola Ana,");
  });

  it("sustituye todas las apariciones", () => {
    expect(renderTemplate("{{nombre}}, gracias {{nombre}}", { nombre: "Ana" })).toBe("Ana, gracias Ana");
  });

  it("sin nombre usa un saludo neutro: quita la variable y el espacio que la precede", () => {
    expect(renderTemplate("Hola {{nombre}},", {})).toBe("Hola,");
    expect(renderTemplate("Hola {{nombre}},", { nombre: "   " })).toBe("Hola,");
    expect(renderTemplate("Hola {{nombre}},", { nombre: null })).toBe("Hola,");
  });

  it("no ejecuta nada: otras variables o expresiones quedan como texto literal", () => {
    expect(renderTemplate("{{process.env.RESEND_API_KEY}}", { nombre: "Ana" })).toBe("{{process.env.RESEND_API_KEY}}");
    expect(renderTemplate("{{ 1 + 1 }} ${nombre}", { nombre: "Ana" })).toBe("{{ 1 + 1 }} ${nombre}");
  });

  it("el nombre se inserta tal cual (no reevalúa llaves que traiga el visitante)", () => {
    expect(renderTemplate("Hola {{nombre}}", { nombre: "{{nombre}}" })).toBe("Hola {{nombre}}");
  });

  it("limpia saltos de línea del nombre (no puede romper un asunto ni inyectar cabeceras)", () => {
    expect(renderTemplate("Hola {{nombre}}", { nombre: "Ana\r\nBcc: x@y.com" })).toBe("Hola Ana Bcc: x@y.com");
  });
});

describe("findUnsupportedPlaceholders", () => {
  it("acepta solo {{nombre}}", () => {
    expect(findUnsupportedPlaceholders("Hola {{nombre}} y {{ nombre }}")).toEqual([]);
  });

  it("detecta cualquier otra variable", () => {
    expect(findUnsupportedPlaceholders("{{nombre}} {{correo}} {{telefono}} {{correo}}")).toEqual([
      "{{correo}}",
      "{{telefono}}",
    ]);
  });
});

describe("sanitizeInline", () => {
  it("colapsa espacios, quita caracteres de control y recorta", () => {
    expect(sanitizeInline("  Ana \n\t María \u0000 ")).toBe("Ana María");
  });

  it("respeta el máximo", () => {
    expect(sanitizeInline("a".repeat(200), 80)).toHaveLength(80);
  });
});

describe("HTML seguro", () => {
  it("escapa el HTML que escriba un administrador o el visitante", () => {
    const html = textToHtml('<script>alert("x")</script>\n\nSegundo párrafo & más');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
  });

  it("párrafos por línea en blanco, saltos simples como <br>", () => {
    expect(textToHtml("uno\ndos\n\ntres")).toBe(
      '<p style="margin: 0 0 14px;">uno<br>dos</p>\n<p style="margin: 0 0 14px;">tres</p>'
    );
  });

  it("la respuesta automática escapa el nombre del visitante en el HTML", () => {
    const { html, text } = buildAutoReplyEmail(
      { subject: "Hola {{nombre}}", message: "Hola {{nombre}}" },
      { nombre: "<img src=x onerror=alert(1)>" }
    );
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
    // En texto plano va tal cual, sin interpretarse.
    expect(text).toContain("<img src=x onerror=alert(1)>");
  });
});

describe("buildInternalEmail", () => {
  const base = {
    title: "NUEVO CONTACTO RECIBIDO",
    subjectPrefix: "Nuevo contacto desde inspirachurch.co",
    summary: "Juan Pérez",
    fields: [
      { label: "Nombre", value: "Juan Pérez" },
      { label: "Teléfono", value: null },
      { label: "Mensaje", value: "Línea 1\nLínea 2 <b>x</b>" },
    ],
    cmsUrl: "https://inspirachurch.co/admin/formularios",
  };

  it("incluye título, campos con valor, aviso de CMS y enlace; omite campos vacíos", () => {
    const { subject, text } = buildInternalEmail(base);
    expect(subject).toBe("Nuevo contacto desde inspirachurch.co — Juan Pérez");
    expect(text).toContain("NUEVO CONTACTO RECIBIDO");
    expect(text).toContain("Nombre: Juan Pérez");
    expect(text).not.toContain("Teléfono");
    expect(text).toContain("https://inspirachurch.co/admin/formularios");
  });

  it("escapa los valores en el HTML", () => {
    const { html } = buildInternalEmail(base);
    expect(html).toContain("Línea 1<br>Línea 2 &lt;b&gt;x&lt;/b&gt;");
    expect(html).not.toContain("<b>x</b>");
  });

  it("un nombre con saltos de línea no rompe el asunto", () => {
    const { subject } = buildInternalEmail({ ...base, summary: "Ana\r\nBcc: x@y.com" });
    expect(subject).not.toMatch(/[\r\n]/);
  });

  it("muestra la nota cuando existe", () => {
    const { text, html } = buildInternalEmail({ ...base, note: "Petición privada." });
    expect(text).toContain("Petición privada.");
    expect(html).toContain("Petición privada.");
  });
});
