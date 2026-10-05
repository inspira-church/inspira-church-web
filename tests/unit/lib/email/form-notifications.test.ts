import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FormEmailConfig } from "@/lib/email/form-config";

const { sendMock, batchMock, adminState } = vi.hoisted(() => ({
  sendMock: vi.fn(),
  batchMock: vi.fn(),
  adminState: {
    rows: [] as { form_key: string; config: unknown }[],
    error: null as { message: string } | null,
    requestedKeys: [] as string[][],
  },
}));

vi.mock("resend", () => ({
  // function (no arrow) porque lib/email/resend.ts hace `new Resend(...)`.
  Resend: vi.fn().mockImplementation(function () {
    return { emails: { send: sendMock }, batch: { send: batchMock } };
  }),
}));

// Lectura de configuración (service_role): el test controla qué filas "existen" en la tabla.
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        in: async (_col: string, keys: string[]) => {
          adminState.requestedKeys.push(keys);
          return {
            data: adminState.error ? null : adminState.rows.filter((r) => keys.includes(r.form_key)),
            error: adminState.error,
          };
        },
      }),
    }),
  }),
}));

// Se importa dinámicamente tras fijar las env vars: lib/email/resend.ts las relee en cada caso.
async function load() {
  vi.resetModules();
  return import("@/lib/email/form-notifications");
}

const submission = {
  visitorName: "Juan Pérez",
  visitorEmail: "juan@example.com",
  fields: [
    { label: "Nombre", value: "Juan Pérez" },
    { label: "Mensaje", value: "Quisiera visitar la iglesia." },
  ],
};

function config(overrides: Partial<{ internal: Partial<FormEmailConfig["internal"]>; autoReply: Partial<FormEmailConfig["autoReply"]> }> = {}) {
  return {
    config: {
      internal: { enabled: true, useDefaultRecipient: true, primary: "", additional: [], ...overrides.internal },
      autoReply: {
        enabled: true,
        subject: "Gracias, {{nombre}}",
        message: "Hola {{nombre}},\n\nRecibimos tu mensaje.\n\nInspira Church",
        ...overrides.autoReply,
      },
    } as FormEmailConfig,
    defaultRecipient: "admin@example.com",
  };
}

const okBatch = { data: { data: [{ id: "b1" }] }, error: null };
const okSend = { data: { id: "e1" }, error: null };

function setEnv(configured = true) {
  vi.stubEnv("RESEND_API_KEY", configured ? "re_test_key" : "");
  vi.stubEnv("EMAIL_FROM", configured ? "Inspira Church <notificaciones@inspirachurch.co>" : "");
}

beforeEach(() => {
  sendMock.mockReset().mockResolvedValue(okSend);
  batchMock.mockReset().mockResolvedValue(okBatch);
  adminState.rows = [];
  adminState.error = null;
  adminState.requestedKeys = [];
  vi.stubEnv("EMAIL_NOTIFICATION_TO", "");
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("sendFormNotifications — proveedor", () => {
  it("proveedor no configurado: no llama a Resend y devuelve not_configured", async () => {
    setEnv(false);
    const { sendFormNotifications } = await load();

    const result = await sendFormNotifications({ formType: "contacto", submission, config: config() });

    expect(result).toEqual({ internal: "not_configured", visitor: "not_configured", internalRecipients: 0 });
    expect(batchMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });
});

describe("notificación interna", () => {
  it("ON: envía al correo administrativo predeterminado, con Reply-To del visitante", async () => {
    setEnv();
    const { sendFormNotifications } = await load();

    const result = await sendFormNotifications({ formType: "contacto", submission, config: config() });

    expect(result.internal).toBe("sent");
    const [payloads] = batchMock.mock.calls[0];
    expect(payloads).toHaveLength(1);
    expect(payloads[0].to).toEqual(["admin@example.com"]);
    expect(payloads[0].replyTo).toBe("juan@example.com");
    expect(payloads[0].subject).toContain("Juan Pérez");
    expect(payloads[0].from).toBe("Inspira Church <notificaciones@inspirachurch.co>");
  });

  it("OFF: no envía el aviso interno pero sí la respuesta automática (son independientes)", async () => {
    setEnv();
    const { sendFormNotifications } = await load();

    const result = await sendFormNotifications({
      formType: "contacto",
      submission,
      config: config({ internal: { enabled: false } }),
    });

    expect(result).toMatchObject({ internal: "skipped", visitor: "sent", internalRecipients: 0 });
    expect(batchMock).not.toHaveBeenCalled();
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("principal propio sobrescribe al predeterminado cuando no se usa el predeterminado", async () => {
    setEnv();
    const { sendFormNotifications } = await load();

    await sendFormNotifications({
      formType: "contacto",
      submission,
      config: config({ internal: { useDefaultRecipient: false, primary: "pastor@example.com" } }),
    });

    expect(batchMock.mock.calls[0][0][0].to).toEqual(["pastor@example.com"]);
  });

  it("EMAIL_NOTIFICATION_TO es el último respaldo cuando no hay correo en el CMS", async () => {
    setEnv();
    vi.stubEnv("EMAIL_NOTIFICATION_TO", "respaldo@example.com");
    const { sendFormNotifications } = await load();

    await sendFormNotifications({
      formType: "contacto",
      submission,
      config: { ...config(), defaultRecipient: "" },
    });

    expect(batchMock.mock.calls[0][0][0].to).toEqual(["respaldo@example.com"]);
  });

  it("sin ningún destinatario: omite el aviso interno, lo registra y no afecta la respuesta", async () => {
    setEnv();
    const { sendFormNotifications } = await load();

    const result = await sendFormNotifications({
      formType: "contacto",
      submission,
      config: { ...config(), defaultRecipient: "" },
    });

    expect(result).toMatchObject({ internal: "skipped", visitor: "sent", internalRecipients: 0 });
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("sin destinatario"));
  });

  it("múltiples destinatarios: un correo POR destinatario en una sola llamada de lote (nadie ve las direcciones de los demás)", async () => {
    setEnv();
    const { sendFormNotifications } = await load();

    const result = await sendFormNotifications({
      formType: "contacto",
      submission,
      config: config({ internal: { additional: ["uno@example.com", "dos@example.com"] } }),
    });

    expect(result).toMatchObject({ internal: "sent", internalRecipients: 3 });
    expect(batchMock).toHaveBeenCalledTimes(1);
    const payloads = batchMock.mock.calls[0][0];
    expect(payloads.map((p: { to: string[] }) => p.to)).toEqual([
      ["admin@example.com"],
      ["uno@example.com"],
      ["dos@example.com"],
    ]);
    // Ningún payload usa cc/bcc ni lista a varios en `to`.
    for (const p of payloads) {
      expect(p.to).toHaveLength(1);
      expect(p).not.toHaveProperty("cc");
      expect(p).not.toHaveProperty("bcc");
    }
  });

  it("duplicados: el principal repetido como adicional (incluso con otras mayúsculas) recibe un solo correo", async () => {
    setEnv();
    const { sendFormNotifications } = await load();

    await sendFormNotifications({
      formType: "contacto",
      submission,
      config: config({ internal: { additional: ["ADMIN@example.com", "uno@example.com", "Uno@example.com"] } }),
    });

    expect(batchMock.mock.calls[0][0].map((p: { to: string[] }) => p.to[0])).toEqual([
      "admin@example.com",
      "uno@example.com",
    ]);
  });

  it("direcciones inválidas guardadas en la configuración se ignoran sin romper el envío", async () => {
    setEnv();
    const { sendFormNotifications } = await load();

    await sendFormNotifications({
      formType: "contacto",
      submission,
      config: config({ internal: { additional: ["no-es-un-correo", "", "  ", "bueno@example.com"] } }),
    });

    expect(batchMock.mock.calls[0][0].map((p: { to: string[] }) => p.to[0])).toEqual([
      "admin@example.com",
      "bueno@example.com",
    ]);
  });

  it("sin correo del visitante no se configura un replyTo inventado", async () => {
    setEnv();
    const { sendFormNotifications } = await load();

    await sendFormNotifications({
      formType: "contacto",
      submission: { ...submission, visitorEmail: null },
      config: config(),
    });

    expect(batchMock.mock.calls[0][0][0]).not.toHaveProperty("replyTo");
  });

  it("solo adicionales (sin principal resuelto) igual reciben el aviso", async () => {
    setEnv();
    const { sendFormNotifications } = await load();

    await sendFormNotifications({
      formType: "contacto",
      submission,
      config: { ...config({ internal: { additional: ["uno@example.com"] } }), defaultRecipient: "" },
    });

    expect(batchMock.mock.calls[0][0].map((p: { to: string[] }) => p.to[0])).toEqual(["uno@example.com"]);
  });
});

describe("respuesta automática", () => {
  it("ON con correo del visitante: la envía con {{nombre}} sustituido y sin replyTo", async () => {
    setEnv();
    const { sendFormNotifications } = await load();

    const result = await sendFormNotifications({ formType: "contacto", submission, config: config() });

    expect(result.visitor).toBe("sent");
    const call = sendMock.mock.calls[0][0];
    expect(call.to).toBe("juan@example.com");
    expect(call.subject).toBe("Gracias, Juan Pérez");
    expect(call.text).toContain("Hola Juan Pérez,");
    expect(call.text).not.toContain("{{");
    expect(call.html).toContain("Juan Pérez");
    expect(call).not.toHaveProperty("replyTo");
  });

  it("OFF: no se envía aunque el visitante haya dejado correo (el aviso interno sí)", async () => {
    setEnv();
    const { sendFormNotifications } = await load();

    const result = await sendFormNotifications({
      formType: "contacto",
      submission,
      config: config({ autoReply: { enabled: false } }),
    });

    expect(result).toMatchObject({ internal: "sent", visitor: "skipped" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("visitante sin correo: se omite la respuesta (el correo no se vuelve obligatorio)", async () => {
    setEnv();
    const { sendFormNotifications } = await load();

    const result = await sendFormNotifications({
      formType: "contacto",
      submission: { ...submission, visitorEmail: null },
      config: config(),
    });

    expect(result).toMatchObject({ internal: "sent", visitor: "skipped" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("visitante sin nombre: saludo neutro, sin dejar la variable ni un espacio colgando", async () => {
    setEnv();
    const { sendFormNotifications } = await load();

    await sendFormNotifications({
      formType: "contacto",
      submission: { ...submission, visitorName: null },
      config: config(),
    });

    const call = sendMock.mock.calls[0][0];
    expect(call.text).toContain("Hola,");
    expect(call.text).not.toContain("{{");
    expect(call.subject).toBe("Gracias,");
  });

  it("un asunto o mensaje vacío con la respuesta activa cae al texto predeterminado (nunca un correo en blanco)", async () => {
    setEnv();
    const { sendFormNotifications } = await load();

    await sendFormNotifications({
      formType: "contacto",
      submission,
      config: config({ autoReply: { subject: "", message: "" } }),
    });

    const call = sendMock.mock.calls[0][0];
    expect(call.subject).toBe("Recibimos tu mensaje | Inspira Church");
    expect(call.text).toContain("Gracias por comunicarte con Inspira Church");
  });
});

describe("tolerancia a fallos", () => {
  it("falla Resend en el aviso interno: devuelve error, no lanza y la respuesta al visitante sale igual", async () => {
    setEnv();
    batchMock.mockResolvedValue({ data: null, error: { message: "boom", statusCode: 500 } });
    const { sendFormNotifications } = await load();

    const result = await sendFormNotifications({ formType: "contacto", submission, config: config() });

    expect(result).toMatchObject({ internal: "error", visitor: "sent" });
  });

  it("falla Resend en la respuesta al visitante: devuelve error y el aviso interno sale igual", async () => {
    setEnv();
    sendMock.mockResolvedValue({ data: null, error: { message: "boom", statusCode: 500 } });
    const { sendFormNotifications } = await load();

    const result = await sendFormNotifications({ formType: "contacto", submission, config: config() });

    expect(result).toMatchObject({ internal: "sent", visitor: "error" });
  });

  it("una excepción de red en cualquiera de los dos no revierte ni bloquea al otro", async () => {
    setEnv();
    batchMock.mockRejectedValue(new Error("network down"));
    const { sendFormNotifications } = await load();

    const result = await sendFormNotifications({ formType: "contacto", submission, config: config() });

    expect(result).toMatchObject({ internal: "error", visitor: "sent" });
  });

  it("los errores se registran sin datos personales", async () => {
    setEnv();
    batchMock.mockResolvedValue({ data: null, error: { message: "boom" } });
    const { sendFormNotifications } = await load();

    await sendFormNotifications({ formType: "contacto", submission, config: config() });

    const logged = JSON.stringify((console.error as unknown as { mock: { calls: unknown[] } }).mock.calls);
    expect(logged).not.toContain("juan@example.com");
    expect(logged).not.toContain("Juan Pérez");
  });
});

describe("configuración del CMS leída en cada envío", () => {
  it("usa la configuración guardada (global + del formulario) sin que se la pasen", async () => {
    setEnv();
    adminState.rows = [
      { form_key: "global", config: { defaultRecipient: "global@example.com" } },
      {
        form_key: "contacto",
        config: { internal: { additional: ["extra@example.com"] }, autoReply: { subject: "Asunto del CMS" } },
      },
    ];
    const { sendFormNotifications } = await load();

    await sendFormNotifications({ formType: "contacto", submission });

    expect(batchMock.mock.calls[0][0].map((p: { to: string[] }) => p.to[0])).toEqual([
      "global@example.com",
      "extra@example.com",
    ]);
    expect(sendMock.mock.calls[0][0].subject).toBe("Asunto del CMS");
  });

  it("una configuración actualizada se respeta de inmediato (no hay caché entre envíos)", async () => {
    setEnv();
    adminState.rows = [{ form_key: "global", config: { defaultRecipient: "viejo@example.com" } }];
    const { sendFormNotifications } = await load();

    await sendFormNotifications({ formType: "contacto", submission });
    adminState.rows = [{ form_key: "global", config: { defaultRecipient: "nuevo@example.com" } }];
    batchMock.mockClear();
    await sendFormNotifications({ formType: "contacto", submission });

    expect(batchMock.mock.calls[0][0][0].to).toEqual(["nuevo@example.com"]);
  });

  it("el formulario A no usa la configuración del formulario B", async () => {
    setEnv();
    adminState.rows = [
      { form_key: "global", config: { defaultRecipient: "global@example.com" } },
      { form_key: "oracion", config: { internal: { enabled: false } } },
      { form_key: "grupos", config: { internal: { additional: ["grupos@example.com"] } } },
    ];
    const { sendFormNotifications } = await load();

    const contacto = await sendFormNotifications({ formType: "contacto", submission });

    // Contacto no tiene fila propia: recibe los valores predeterminados, no los de oración ni los de grupos.
    expect(contacto.internal).toBe("sent");
    expect(batchMock.mock.calls[0][0].map((p: { to: string[] }) => p.to[0])).toEqual(["global@example.com"]);
    // Solo pidió su propia fila y la global.
    expect(adminState.requestedKeys[0].sort()).toEqual(["contacto", "global"]);
  });

  it("si la lectura de configuración falla (ej. tabla aún inexistente) usa los valores predeterminados y el envío continúa", async () => {
    setEnv();
    vi.stubEnv("EMAIL_NOTIFICATION_TO", "respaldo@example.com");
    adminState.error = { message: "Could not find the table" };
    const { sendFormNotifications } = await load();

    const result = await sendFormNotifications({ formType: "contacto", submission });

    expect(result).toMatchObject({ internal: "sent", visitor: "sent" });
    expect(batchMock.mock.calls[0][0][0].to).toEqual(["respaldo@example.com"]);
    // Y deja constancia en el log del servidor.
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("configuración de correos"), expect.anything());
  });

  it("Contacto conserva su respuesta automática original con la configuración predeterminada", async () => {
    setEnv();
    const { sendFormNotifications } = await load();

    await sendFormNotifications({ formType: "contacto", submission });

    const call = sendMock.mock.calls[0][0];
    expect(call.subject).toBe("Recibimos tu mensaje | Inspira Church");
    expect(call.text).toContain("Hola Juan Pérez,");
    expect(call.text).toContain("uno de nuestros servidores se pondrá en contacto contigo lo antes posible");
    expect(call.text).toContain("Dios te bendiga.");
  });
});
