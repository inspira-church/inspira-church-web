import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Peticiones de oración de punta a punta: la Server Action REAL + el servicio
 * central REAL. Solo se simulan Supabase (insert y lectura de configuración) y
 * Resend. Nada de esto envía correos reales.
 */
const calls: string[] = [];
const state = vi.hoisted(() => ({
  insertError: null as { message: string } | null,
  insertedRow: null as Record<string, unknown> | null,
  configRows: [] as { form_key: string; config: unknown }[],
  requestedKeys: [] as string[][],
}));
const { sendMock, batchMock } = vi.hoisted(() => ({ sendMock: vi.fn(), batchMock: vi.fn() }));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function () {
    return { emails: { send: sendMock }, batch: { send: batchMock } };
  }),
}));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: () => true, getClientIp: async () => "203.0.113.9" }));
vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: async () => true }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => ({
      insert: async (row: Record<string, unknown>) => {
        calls.push(`insert:${table}`);
        state.insertedRow = row;
        return { error: state.insertError };
      },
    }),
  }),
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        in: async (_c: string, keys: string[]) => {
          state.requestedKeys.push(keys);
          return { data: state.configRows.filter((r) => keys.includes(r.form_key)), error: null };
        },
      }),
    }),
  }),
}));

const PRIVATE_TEXT = "Mi hijo está muy enfermo y no se lo he dicho a nadie";
const PHONE = "3157778899";
const VISITOR_EMAIL = "maria@example.com";

function fd(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const baseForm = { name: "María López", request: "Oren por mi familia, por favor.", consent: "on" };

async function submit(fields: Record<string, string> = {}) {
  vi.resetModules();
  const { submitPrayerRequest } = await import("@/lib/actions/prayer-request");
  return submitPrayerRequest({}, fd({ ...baseForm, ...fields }));
}

/** Todo lo que se mandó a Resend, como un solo texto (asunto, cuerpos, destinatarios, cabeceras). */
function everythingSent() {
  return JSON.stringify([...batchMock.mock.calls, ...sendMock.mock.calls]);
}

beforeEach(() => {
  calls.length = 0;
  state.insertError = null;
  state.insertedRow = null;
  state.configRows = [{ form_key: "global", config: { defaultRecipient: "admin@example.com" } }];
  state.requestedKeys = [];
  sendMock.mockReset().mockImplementation(async () => {
    calls.push("email:visitor");
    return { data: { id: "v1" }, error: null };
  });
  batchMock.mockReset().mockImplementation(async () => {
    calls.push("email:internal");
    return { data: { data: [{ id: "b1" }] }, error: null };
  });
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("EMAIL_FROM", "Inspira Church <notificaciones@inspirachurch.co>");
  vi.stubEnv("EMAIL_NOTIFICATION_TO", "");
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("1. la petición se guarda ANTES de cualquier correo", () => {
  it("orden: insert, aviso interno y respuesta; el visitante ve éxito", async () => {
    const result = await submit({ email: VISITOR_EMAIL });

    expect(result).toEqual({ success: true });
    expect(calls[0]).toBe("insert:prayer_requests");
    expect(calls.slice(1).sort()).toEqual(["email:internal", "email:visitor"]);
  });

  it("si el insert falla: no se envía ningún correo", async () => {
    state.insertError = { message: "db down" };

    const result = await submit({ email: VISITOR_EMAIL });

    expect(result).toHaveProperty("error");
    expect(batchMock).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });
});

describe("2. petición PRIVADA — nada sensible en los correos", () => {
  const privateForm = {
    request: PRIVATE_TEXT,
    phone: PHONE,
    email: VISITOR_EMAIL,
    isPrivate: "on",
  };

  it("el aviso interno no contiene el texto, el teléfono ni el correo (ni en asunto, ni en cuerpo, ni en HTML)", async () => {
    state.configRows.push({ form_key: "oracion", config: { internal: { additional: ["pastor@example.com"] } } });

    await submit(privateForm);

    const [payloads] = batchMock.mock.calls[0];
    expect(payloads).toHaveLength(2);
    for (const p of payloads) {
      const mail = JSON.stringify({ subject: p.subject, text: p.text, html: p.html });
      expect(mail).not.toContain(PRIVATE_TEXT);
      expect(mail).not.toContain("enfermo");
      expect(mail).not.toContain(PHONE);
      expect(mail).not.toContain(VISITOR_EMAIL);
    }
  });

  it("dice que es privada, trae solo el nombre y apunta al módulo correcto del CMS", async () => {
    await submit(privateForm);

    const p = batchMock.mock.calls[0][0][0];
    expect(p.subject).toContain("privada");
    expect(p.text).toContain("NUEVA PETICIÓN DE ORACIÓN PRIVADA");
    expect(p.text).toContain("Nombre: María López");
    expect(p.text).toContain("La petición quedó registrada en el CMS");
    expect(p.text).toContain("panel autorizado");
    expect(p.text).toContain("/admin/oracion");
    expect(p.html).toContain("/admin/oracion");
  });

  it("sin Reply-To: el correo del visitante no llega a los destinatarios internos", async () => {
    await submit(privateForm);

    expect(batchMock.mock.calls[0][0][0]).not.toHaveProperty("replyTo");
  });

  it("la respuesta automática al visitante tampoco repite su petición", async () => {
    await submit(privateForm);

    const mail = sendMock.mock.calls[0][0];
    expect(mail.to).toBe(VISITOR_EMAIL);
    expect(JSON.stringify(mail)).not.toContain("enfermo");
  });

  it("los logs de la acción no contienen la petición", async () => {
    batchMock.mockResolvedValue({ data: null, error: { message: "boom" } });

    await submit(privateForm);

    const logged = JSON.stringify([
      ...(console.error as unknown as { mock: { calls: unknown[] } }).mock.calls,
      ...(console.warn as unknown as { mock: { calls: unknown[] } }).mock.calls,
    ]);
    expect(logged).not.toContain("enfermo");
    expect(logged).not.toContain(VISITOR_EMAIL);
    expect(logged).not.toContain(PHONE);
  });

  it("la petición privada SÍ queda completa en la base de datos", async () => {
    await submit(privateForm);

    expect(state.insertedRow).toMatchObject({ request_text: PRIVATE_TEXT, is_private: true, phone: PHONE });
  });
});

describe("petición NO privada — minimización", () => {
  it("lleva el texto recortado, sin teléfono ni correo en el cuerpo, y con Reply-To", async () => {
    await submit({ phone: PHONE, email: VISITOR_EMAIL });

    const p = batchMock.mock.calls[0][0][0];
    expect(p.text).toContain("Oren por mi familia, por favor.");
    expect(p.text).not.toContain(PHONE);
    expect(p.text).not.toContain(VISITOR_EMAIL);
    expect(p.text).toContain("/admin/oracion");
    expect(p.replyTo).toBe(VISITOR_EMAIL);
  });

  it("una petición larga viaja recortada", async () => {
    await submit({ request: "x".repeat(900) });

    const p = batchMock.mock.calls[0][0][0];
    expect(p.text).not.toContain("x".repeat(400));
    expect(p.text).toContain("recortada");
  });
});

describe("3, 6, 9. configuración propia de Oración (independiente de los demás formularios)", () => {
  it("usa la configuración de 'oracion' y solo pide su fila y la global", async () => {
    state.configRows.push({
      form_key: "oracion",
      config: { internal: { useDefaultRecipient: false, primary: "oracion@example.com", additional: ["pastor@example.com"] } },
    });

    await submit();

    expect(batchMock.mock.calls[0][0].map((p: { to: string[] }) => p.to[0])).toEqual([
      "oracion@example.com",
      "pastor@example.com",
    ]);
    expect(state.requestedKeys[0].sort()).toEqual(["global", "oracion"]);
  });

  it("6. cada destinatario recibe su propio correo (nadie ve las direcciones de los demás)", async () => {
    state.configRows.push({ form_key: "oracion", config: { internal: { additional: ["a@example.com", "b@example.com"] } } });

    await submit();

    const payloads = batchMock.mock.calls[0][0];
    expect(payloads.map((p: { to: string[] }) => p.to)).toEqual([
      ["admin@example.com"],
      ["a@example.com"],
      ["b@example.com"],
    ]);
    for (const p of payloads) {
      expect(p).not.toHaveProperty("cc");
      expect(p).not.toHaveProperty("bcc");
    }
  });

  it("9. la configuración de Contacto (o cualquier otro) NO se aplica a Oración", async () => {
    state.configRows.push(
      { form_key: "contacto", config: { internal: { enabled: false, additional: ["contacto@example.com"] }, autoReply: { enabled: false } } },
      { form_key: "grupos", config: { internal: { additional: ["grupos@example.com"] } } }
    );

    await submit({ email: VISITOR_EMAIL });

    expect(batchMock.mock.calls[0][0].map((p: { to: string[] }) => p.to[0])).toEqual(["admin@example.com"]);
    expect(sendMock).toHaveBeenCalledTimes(1); // la respuesta automática de Oración sigue activa
  });

  it("9b. y la configuración de Oración tampoco se aplica a Contacto", async () => {
    state.configRows.push({ form_key: "oracion", config: { internal: { additional: ["oracion@example.com"] } } });
    vi.resetModules();
    const { sendFormNotifications } = await import("@/lib/email/form-notifications");
    const { formatContactSubmission } = await import("@/lib/email/form-formatters");

    await sendFormNotifications({
      formType: "contacto",
      submission: formatContactSubmission({
        name: "Juan",
        reason: "visitar",
        phone: "300",
        preferredChannel: "whatsapp",
        message: "Hola",
      }),
    });

    expect(batchMock.mock.calls[0][0].map((p: { to: string[] }) => p.to[0])).toEqual(["admin@example.com"]);
  });

  it("un cambio en el CMS aplica a la SIGUIENTE petición, sin deploy", async () => {
    await submit();
    expect(batchMock.mock.calls[0][0].map((p: { to: string[] }) => p.to[0])).toEqual(["admin@example.com"]);

    state.configRows.push({ form_key: "oracion", config: { internal: { additional: ["nuevo@example.com"] } } });
    await submit();

    expect(batchMock.mock.calls[1][0].map((p: { to: string[] }) => p.to[0])).toEqual([
      "admin@example.com",
      "nuevo@example.com",
    ]);
  });
});

describe("aviso interno ON/OFF", () => {
  it("desactivado: no se envía aviso interno, la petición se guarda y la respuesta automática sale", async () => {
    state.configRows.push({ form_key: "oracion", config: { internal: { enabled: false } } });

    const result = await submit({ email: VISITOR_EMAIL });

    expect(result).toEqual({ success: true });
    expect(batchMock).not.toHaveBeenCalled();
    expect(sendMock).toHaveBeenCalledTimes(1);
  });
});

describe("4, 5, 7. respuesta automática al visitante", () => {
  it("4. con correo: se envía con el texto sugerido, el nombre sustituido y el asunto por defecto", async () => {
    await submit({ email: VISITOR_EMAIL });

    const mail = sendMock.mock.calls[0][0];
    expect(mail.to).toBe(VISITOR_EMAIL);
    expect(mail.subject).toBe("Recibimos tu petición de oración | Inspira Church");
    expect(mail.text).toContain("Hola María López,");
    expect(mail.text).toContain("Gracias por compartir tu petición de oración con Inspira Church.");
    expect(mail.text).toContain("Hemos recibido tu solicitud y estaremos orando por ella.");
    expect(mail.text).toContain("Dios te bendiga.");
    expect(mail.text).not.toContain("{{");
    expect(mail).not.toHaveProperty("replyTo");
  });

  it("4b. asunto y mensaje salen de la configuración del CMS (no están hardcodeados como definitivos)", async () => {
    state.configRows.push({
      form_key: "oracion",
      config: { autoReply: { enabled: true, subject: "Estamos contigo, {{nombre}}", message: "Querido {{nombre}}: oramos por ti." } },
    });

    await submit({ email: VISITOR_EMAIL });

    const mail = sendMock.mock.calls[0][0];
    expect(mail.subject).toBe("Estamos contigo, María López");
    expect(mail.text).toContain("Querido María López: oramos por ti.");
    expect(mail.text).not.toContain("estaremos orando");
  });

  it("5. sin correo: no se intenta la respuesta automática (y la petición se guarda)", async () => {
    const result = await submit();

    expect(result).toEqual({ success: true });
    expect(sendMock).not.toHaveBeenCalled();
    expect(batchMock).toHaveBeenCalledTimes(1);
  });

  it("7. desactivada: no se envía aunque haya correo, el aviso interno sí", async () => {
    state.configRows.push({ form_key: "oracion", config: { autoReply: { enabled: false } } });

    await submit({ email: VISITOR_EMAIL });

    expect(sendMock).not.toHaveBeenCalled();
    expect(batchMock).toHaveBeenCalledTimes(1);
  });

  it("sin nombre en la plantilla, el saludo es neutro", async () => {
    vi.resetModules();
    const { sendFormNotifications } = await import("@/lib/email/form-notifications");
    const { formatPrayerSubmission } = await import("@/lib/email/form-formatters");

    await sendFormNotifications({
      formType: "oracion",
      submission: { ...formatPrayerSubmission({ name: " ", email: VISITOR_EMAIL, requestText: "x", isPrivate: false }), visitorName: null },
    });

    expect(sendMock.mock.calls[0][0].text).toContain("Hola,");
  });
});

describe("8. si Resend falla, la petición NO se pierde", () => {
  it("error del proveedor en ambos correos: éxito para el visitante y la petición guardada", async () => {
    batchMock.mockResolvedValue({ data: null, error: { message: "boom", statusCode: 500 } });
    sendMock.mockResolvedValue({ data: null, error: { message: "boom", statusCode: 500 } });

    const result = await submit({ email: VISITOR_EMAIL });

    expect(result).toEqual({ success: true });
    expect(state.insertedRow).toMatchObject({ name: "María López" });
  });

  it("excepción de red: tampoco cambia el resultado", async () => {
    batchMock.mockRejectedValue(new Error("network down"));
    sendMock.mockRejectedValue(new Error("network down"));

    const result = await submit({ email: VISITOR_EMAIL });

    expect(result).toEqual({ success: true });
    expect(calls[0]).toBe("insert:prayer_requests");
  });

  it("un fallo del aviso interno no impide la respuesta al visitante", async () => {
    batchMock.mockResolvedValue({ data: null, error: { message: "boom" } });

    await submit({ email: VISITOR_EMAIL });

    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("sin proveedor configurado la petición igual se guarda", async () => {
    vi.stubEnv("RESEND_API_KEY", "");

    const result = await submit({ email: VISITOR_EMAIL });

    expect(result).toEqual({ success: true });
    expect(batchMock).not.toHaveBeenCalled();
    expect(everythingSent()).not.toContain(VISITOR_EMAIL);
  });
});
