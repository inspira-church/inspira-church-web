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
const sendContactNotificationsMock = vi.fn();
vi.mock("@/lib/email/contact-emails", () => ({
  sendContactNotifications: (...args: unknown[]) => sendContactNotificationsMock(...args),
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
    getSiteSettingsMock.mockReset().mockResolvedValue({ contactEmail: "iglesia@example.com" });
    sendContactNotificationsMock.mockReset().mockResolvedValue({ internal: "sent", visitor: "sent" });
  });

  it("guarda el contacto en Supabase y responde éxito en el caso normal", async () => {
    const result = await submitContact({}, buildFormData({ email: "juan@example.com" }));
    expect(result).toEqual({ success: true });
    expect(insertMock).toHaveBeenCalledTimes(1);
  });

  it("el contacto se guarda aunque el envío de email interno falle", async () => {
    sendContactNotificationsMock.mockRejectedValue(new Error("Resend caído"));

    const result = await submitContact({}, buildFormData({ email: "juan@example.com" }));

    expect(result).toEqual({ success: true });
    expect(insertMock).toHaveBeenCalledTimes(1);
  });

  it("un fallo en la confirmación al visitante no revierte el contacto ya guardado", async () => {
    sendContactNotificationsMock.mockResolvedValue({ internal: "sent", visitor: "error" });

    const result = await submitContact({}, buildFormData({ email: "juan@example.com" }));

    expect(result).toEqual({ success: true });
    expect(insertMock).toHaveBeenCalledTimes(1);
  });

  it("sin correo del visitante, se llama a la capa de email sin email (no se inventa confirmación)", async () => {
    const result = await submitContact({}, buildFormData());

    expect(result).toEqual({ success: true });
    const [data] = sendContactNotificationsMock.mock.calls[0];
    expect(data.email).toBeUndefined();
  });

  it("con correo del visitante, se pasa el email a la capa de notificaciones", async () => {
    await submitContact({}, buildFormData({ email: "juan@example.com" }));

    const [data] = sendContactNotificationsMock.mock.calls[0];
    expect(data.email).toBe("juan@example.com");
  });

  it("reutiliza site_settings.contactEmail como destinatario interno cuando existe", async () => {
    getSiteSettingsMock.mockResolvedValue({ contactEmail: "pastor@inspirachurch.co" });

    await submitContact({}, buildFormData({ email: "juan@example.com" }));

    const [, opts] = sendContactNotificationsMock.mock.calls[0];
    expect(opts.internalTo).toBe("pastor@inspirachurch.co");
  });

  it("proveedor de email no configurado no rompe el flujo (sigue guardando y respondiendo éxito)", async () => {
    sendContactNotificationsMock.mockResolvedValue({
      internal: "not_configured",
      visitor: "not_configured",
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
    expect(sendContactNotificationsMock).not.toHaveBeenCalled();
  });
});
