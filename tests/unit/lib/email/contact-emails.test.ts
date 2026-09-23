import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock("resend", () => ({
  // function (no arrow) porque lib/email/resend.ts hace `new Resend(...)`.
  Resend: vi.fn().mockImplementation(function () {
    return { emails: { send: sendMock } };
  }),
}));

// sendContactNotifications se importa dinámicamente en cada test (después
// de fijar las env vars) para que lib/email/resend.ts relea
// process.env.RESEND_API_KEY / EMAIL_FROM en cada caso.
async function loadSendContactNotifications() {
  vi.resetModules();
  const mod = await import("@/lib/email/contact-emails");
  return mod.sendContactNotifications;
}

const baseData = {
  name: "Juan Pérez",
  reason: "visitar",
  phone: "3001234567",
  preferredChannel: "whatsapp",
  message: "Quisiera visitar la iglesia.",
};

describe("sendContactNotifications", () => {
  beforeEach(() => {
    sendMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("proveedor no configurado: no llama a Resend y devuelve not_configured para ambos", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("EMAIL_FROM", "");
    const sendContactNotifications = await loadSendContactNotifications();

    const result = await sendContactNotifications(
      { ...baseData, email: "juan@example.com" },
      { internalTo: "iglesia@example.com" }
    );

    expect(result).toEqual({ internal: "not_configured", visitor: "not_configured" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("con email del visitante: envía el aviso interno y la confirmación", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("EMAIL_FROM", "Inspira Church <notificaciones@inspirachurch.co>");
    sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });
    const sendContactNotifications = await loadSendContactNotifications();

    const result = await sendContactNotifications(
      { ...baseData, email: "juan@example.com" },
      { internalTo: "iglesia@example.com" }
    );

    expect(result).toEqual({ internal: "sent", visitor: "sent" });
    expect(sendMock).toHaveBeenCalledTimes(2);

    const internalCall = sendMock.mock.calls.find((c) => c[0].to === "iglesia@example.com");
    expect(internalCall?.[0].replyTo).toBe("juan@example.com");
    expect(internalCall?.[0].subject).toContain("Juan Pérez");

    const visitorCall = sendMock.mock.calls.find((c) => c[0].to === "juan@example.com");
    expect(visitorCall?.[0].subject).toBe("Recibimos tu mensaje | Inspira Church");
    expect(visitorCall?.[0].replyTo).toBeUndefined();
  });

  it("sin email del visitante: omite la confirmación pero sí envía el aviso interno", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("EMAIL_FROM", "Inspira Church <notificaciones@inspirachurch.co>");
    sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });
    const sendContactNotifications = await loadSendContactNotifications();

    const result = await sendContactNotifications(baseData, { internalTo: "iglesia@example.com" });

    expect(result).toEqual({ internal: "sent", visitor: "skipped" });
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "iglesia@example.com" })
    );
    // Sin correo del visitante nunca se configura un replyTo inventado.
    expect(sendMock.mock.calls[0][0].replyTo).toBeUndefined();
  });

  it("sin destinatario interno: omite el aviso a la iglesia sin afectar la confirmación", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("EMAIL_FROM", "Inspira Church <notificaciones@inspirachurch.co>");
    sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });
    const sendContactNotifications = await loadSendContactNotifications();

    const result = await sendContactNotifications(
      { ...baseData, email: "juan@example.com" },
      { internalTo: null }
    );

    expect(result).toEqual({ internal: "skipped", visitor: "sent" });
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("el fallo de un correo no afecta al otro ni lanza", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("EMAIL_FROM", "Inspira Church <notificaciones@inspirachurch.co>");
    sendMock
      .mockResolvedValueOnce({ data: null, error: { message: "boom", statusCode: 500 } })
      .mockResolvedValueOnce({ data: { id: "email_2" }, error: null });
    const sendContactNotifications = await loadSendContactNotifications();

    const result = await sendContactNotifications(
      { ...baseData, email: "juan@example.com" },
      { internalTo: "iglesia@example.com" }
    );

    // Uno de los dos falla, el otro se envía igual — el orden de envío no
    // está garantizado (Promise.allSettled en paralelo), solo que ninguno
    // de los dos "contamina" al otro.
    const outcomes = Object.values(result);
    expect(outcomes).toContain("error");
    expect(outcomes).toContain("sent");
  });

  it("una excepción de red al enviar no revierte ni bloquea el otro envío", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("EMAIL_FROM", "Inspira Church <notificaciones@inspirachurch.co>");
    sendMock
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce({ data: { id: "email_2" }, error: null });
    const sendContactNotifications = await loadSendContactNotifications();

    const result = await sendContactNotifications(
      { ...baseData, email: "juan@example.com" },
      { internalTo: "iglesia@example.com" }
    );

    const outcomes = Object.values(result);
    expect(outcomes).toContain("error");
    expect(outcomes).toContain("sent");
  });
});
