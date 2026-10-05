import { beforeEach, describe, expect, it, vi } from "vitest";

// --- next/headers: getClientIp (lib/rate-limit.ts) solo necesita headers(). ---
let fakeIp = "203.0.113.10";
vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => (name === "x-forwarded-for" ? fakeIp : null),
  }),
}));

// --- Supabase (server): insert configurable por test. ---
const insertMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: () => ({ insert: insertMock }),
  }),
}));

// --- site_settings: correo de contacto configurable. ---
const getSiteSettingsMock = vi.fn();
vi.mock("@/lib/queries/settings", () => ({
  getSiteSettings: () => getSiteSettingsMock(),
}));

// --- Turnstile: siempre "humano" en estos tests, sin depender de env ambiental. ---
vi.mock("@/lib/turnstile", () => ({
  verifyTurnstile: async () => true,
}));

// --- Capa de email: nunca se llama al Resend real desde un test. ---
const sendFormNotificationsMock = vi.fn();
vi.mock("@/lib/email/form-notifications", () => ({
  sendFormNotifications: (...args: unknown[]) => sendFormNotificationsMock(...args),
}));

const { submitContact } = await import("@/lib/actions/contact");

function buildFormData(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const fields: Record<string, string> = {
    name: "Juan Pérez",
    phone: "3001234567",
    preferredChannel: "whatsapp",
    reason: "visitar",
    message: "Quisiera visitar la iglesia.",
    consent: "on",
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

describe("submitContact", () => {
  beforeEach(() => {
    fakeIp = `203.0.113.${Math.floor(Math.random() * 250) + 1}`; // evita chocar con el rate limit entre tests
    insertMock.mockReset().mockResolvedValue({ error: null });
    getSiteSettingsMock.mockReset().mockResolvedValue({ privacyPolicyUrl: "" });
    sendFormNotificationsMock
      .mockReset()
      .mockResolvedValue({ internal: "sent", visitor: "sent", internalRecipients: 1 });
  });

  it("guarda el contacto en Supabase y responde éxito en el caso normal", async () => {
    const result = await submitContact({}, buildFormData({ email: "juan@example.com" }));
    expect(result).toEqual({ success: true });
    expect(insertMock).toHaveBeenCalledTimes(1);
  });

  it("el contacto se guarda aunque el envío de email interno falle", async () => {
    sendFormNotificationsMock.mockRejectedValue(new Error("Resend caído"));

    const result = await submitContact({}, buildFormData({ email: "juan@example.com" }));

    expect(result).toEqual({ success: true });
    expect(insertMock).toHaveBeenCalledTimes(1);
  });

  it("un fallo en la confirmación al visitante no revierte el contacto ya guardado", async () => {
    sendFormNotificationsMock.mockResolvedValue({ internal: "sent", visitor: "error", internalRecipients: 1 });

    const result = await submitContact({}, buildFormData({ email: "juan@example.com" }));

    expect(result).toEqual({ success: true });
    expect(insertMock).toHaveBeenCalledTimes(1);
  });

  it("sin correo del visitante, se llama al servicio central sin email (no se inventa confirmación)", async () => {
    const result = await submitContact({}, buildFormData());

    expect(result).toEqual({ success: true });
    const [{ formType, submission }] = sendFormNotificationsMock.mock.calls[0];
    expect(formType).toBe("contacto");
    expect(submission.visitorEmail).toBeNull();
  });

  it("con correo del visitante, se pasa al servicio central (respuesta automática y Reply-To)", async () => {
    await submitContact({}, buildFormData({ email: "juan@example.com" }));

    const [{ formType, submission }] = sendFormNotificationsMock.mock.calls[0];
    expect(formType).toBe("contacto");
    expect(submission.visitorEmail).toBe("juan@example.com");
    expect(submission.visitorName).toBe("Juan Pérez");
  });

  it("el correo interno lo decide la configuración del CMS: la acción ya no resuelve destinatarios", async () => {
    await submitContact({}, buildFormData({ email: "juan@example.com" }));

    const [arg] = sendFormNotificationsMock.mock.calls[0];
    expect(arg).not.toHaveProperty("internalTo");
    expect(arg).not.toHaveProperty("config");
  });

  it("proveedor de email no configurado no rompe el flujo (sigue guardando y respondiendo éxito)", async () => {
    sendFormNotificationsMock.mockResolvedValue({
      internal: "not_configured",
      visitor: "not_configured",
      internalRecipients: 0,
    });

    const result = await submitContact({}, buildFormData({ email: "juan@example.com" }));

    expect(result).toEqual({ success: true });
    expect(insertMock).toHaveBeenCalledTimes(1);
  });

  it("si el insert en Supabase falla, no se intenta enviar ningún email", async () => {
    insertMock.mockResolvedValue({ error: { message: "db down" } });

    const result = await submitContact({}, buildFormData({ email: "juan@example.com" }));

    expect(result.success).toBeUndefined();
    expect(result.error).toBeTruthy();
    expect(sendFormNotificationsMock).not.toHaveBeenCalled();
  });
});
