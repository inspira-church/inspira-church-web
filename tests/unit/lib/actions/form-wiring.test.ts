import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Cableado de los 5 formularios públicos con el servicio central: la base de
 * datos SIEMPRE va primero; el correo nunca cambia el resultado que ve el
 * visitante.
 */
const calls: string[] = [];
const state = vi.hoisted(() => ({
  insertError: null as { message: string } | null,
  insertedTable: "" as string,
}));
const notifyMock = vi.fn();

vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: () => true, getClientIp: async () => "203.0.113.1" }));
vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: async () => true }));
vi.mock("@/lib/queries/settings", () => ({ getSiteSettings: async () => ({ privacyPolicyUrl: "" }) }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => ({
      insert: async () => {
        state.insertedTable = table;
        calls.push(`insert:${table}`);
        return { error: state.insertError };
      },
    }),
  }),
}));
vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: { id: "ev-1" } }) }),
          maybeSingle: async () => ({ data: { name: "Grupo 1" } }),
        }),
      }),
    }),
  }),
}));
vi.mock("@/lib/email/form-notifications", () => ({
  sendFormNotifications: async (arg: unknown) => {
    calls.push("notify");
    return notifyMock(arg);
  },
}));

const { submitContact } = await import("@/lib/actions/contact");
const { submitFirstTimeConnection } = await import("@/lib/actions/first-time-connection");
const { submitPrayerRequest } = await import("@/lib/actions/prayer-request");
const { submitGroupJoin } = await import("@/lib/actions/group-join");
const { submitGenerationsRegistration } = await import("@/lib/actions/generations-registrations");

function fd(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const forms = [
  {
    name: "contacto",
    table: "contacts",
    run: (extra: Record<string, string> = {}) =>
      submitContact(
        {},
        fd({ name: "Juan Pérez", phone: "3001234567", preferredChannel: "whatsapp", reason: "visitar", message: "Hola", consent: "on", ...extra })
      ),
    emailField: "email",
    visitorName: "Juan Pérez",
  },
  {
    name: "primera-vez",
    table: "first_time_connections",
    run: (extra: Record<string, string> = {}) =>
      submitFirstTimeConnection(
        {},
        fd({ firstName: "Ana", lastName: "Gómez", gender: "mujer", email: "ana@example.com", phone: "300", consent: "on", ...extra })
      ),
    emailField: "email",
    visitorName: "Ana",
  },
  {
    name: "oracion",
    table: "prayer_requests",
    run: (extra: Record<string, string> = {}) =>
      submitPrayerRequest({}, fd({ name: "Luis", request: "Oren por mi familia.", consent: "on", ...extra })),
    emailField: "email",
    visitorName: "Luis",
  },
  {
    name: "grupos",
    table: "group_join_requests",
    run: (extra: Record<string, string> = {}) =>
      submitGroupJoin({}, fd({ firstName: "Pedro", lastName: "Ruiz", phone: "300", city: "Bogotá", consent: "on", ...extra })),
    emailField: "email",
    visitorName: "Pedro",
  },
  {
    name: "generaciones",
    table: "generations_registrations",
    run: (extra: Record<string, string> = {}) =>
      submitGenerationsRegistration(
        {},
        fd({
          childFirstName: "Sofía",
          childLastName: "Mora",
          childAge: "8",
          guardianName: "Carlos Mora",
          guardianPhone: "300",
          dataConsent: "on",
          ...extra,
        })
      ),
    emailField: "guardianEmail",
    visitorName: "Carlos Mora",
  },
] as const;

beforeEach(() => {
  calls.length = 0;
  state.insertError = null;
  notifyMock.mockReset().mockResolvedValue({ internal: "sent", visitor: "sent", internalRecipients: 1 });
});

describe.each(forms)("formulario $name", ({ name, table, run, emailField, visitorName }) => {
  it("guarda en Supabase PRIMERO y solo después notifica", async () => {
    const result = await run({ [emailField]: "visitante@example.com" });

    expect(result).toEqual({ success: true });
    expect(calls).toEqual([`insert:${table}`, "notify"]);
  });

  it("llama al servicio central con su propio tipo de formulario y el nombre/correo del visitante", async () => {
    await run({ [emailField]: "visitante@example.com" });

    const [{ formType, submission }] = notifyMock.mock.calls[0];
    expect(formType).toBe(name);
    expect(submission.visitorName).toBe(visitorName);
    expect(submission.visitorEmail).toBe("visitante@example.com");
    expect(submission.fields.length).toBeGreaterThan(0);
  });

  it("sin correo del visitante igual guarda y notifica internamente (no se vuelve obligatorio)", async () => {
    if (name === "primera-vez") return; // Primera vez pide el correo como campo obligatorio desde siempre.

    const result = await run();

    expect(result).toEqual({ success: true });
    expect(notifyMock.mock.calls[0][0].submission.visitorEmail).toBeNull();
  });

  it("si el insert falla: error para el visitante y NO se envía ningún correo", async () => {
    state.insertError = { message: "db down" };

    const result = await run({ [emailField]: "visitante@example.com" });

    expect(result).toHaveProperty("error");
    expect(notifyMock).not.toHaveBeenCalled();
  });

  it("si el correo falla (error del proveedor), el visitante igual ve éxito y la solicitud queda guardada", async () => {
    notifyMock.mockResolvedValue({ internal: "error", visitor: "error", internalRecipients: 1 });

    const result = await run({ [emailField]: "visitante@example.com" });

    expect(result).toEqual({ success: true });
    expect(calls[0]).toBe(`insert:${table}`);
  });
});

describe("contacto — tolerancia extra", () => {
  it("si el servicio de correo lanzara una excepción, el visitante igual ve éxito", async () => {
    notifyMock.mockRejectedValue(new Error("Resend caído"));

    const result = await forms[0].run({ email: "juan@example.com" });

    expect(result).toEqual({ success: true });
  });
});

describe("privacidad en los avisos", () => {
  it("una petición de oración privada no manda su texto al servicio de correo", async () => {
    await forms[2].run({ isPrivate: "on", request: "Texto muy personal" });

    expect(JSON.stringify(notifyMock.mock.calls[0][0])).not.toContain("Texto muy personal");
  });

  it("la inscripción de Generaciones no manda alergias ni contacto de emergencia", async () => {
    await forms[4].run({ allergies: "Maní", emergencyContactName: "Tía Rosa", emergencyContactPhone: "311" });

    const sent = JSON.stringify(notifyMock.mock.calls[0][0]);
    expect(sent).not.toContain("Maní");
    expect(sent).not.toContain("Tía Rosa");
  });
});
