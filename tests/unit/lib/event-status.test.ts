import { describe, expect, it } from "vitest";
import { deriveEventStatus, registrationCtaLabel } from "@/lib/event-status";

const PAST_DATE = "2020-01-01";
const FUTURE_DATE = "2099-01-01";

describe("deriveEventStatus", () => {
  it("es 'proximo' cuando la fecha/hora de inicio todavía no llega", () => {
    expect(
      deriveEventStatus({ status: "proximo", eventDate: FUTURE_DATE, eventTime: null, endDate: null, endTime: null })
    ).toBe("proximo");
  });

  it("es 'finalizado' cuando ya pasó la fecha/hora, aunque status siga en 'proximo' en la base de datos", () => {
    expect(
      deriveEventStatus({ status: "proximo", eventDate: PAST_DATE, eventTime: null, endDate: null, endTime: null })
    ).toBe("finalizado");
  });

  it("usa end_date/end_time cuando existen, en vez de la fecha de inicio", () => {
    // Empieza en el pasado pero termina en el futuro -> sigue "próximo" (evento multidía en curso).
    expect(
      deriveEventStatus({
        status: "proximo",
        eventDate: PAST_DATE,
        eventTime: null,
        endDate: FUTURE_DATE,
        endTime: null,
      })
    ).toBe("proximo");
  });

  it("'cancelado' siempre gana, sin importar la fecha", () => {
    expect(
      deriveEventStatus({ status: "cancelado", eventDate: FUTURE_DATE, eventTime: null, endDate: null, endTime: null })
    ).toBe("cancelado");
    expect(
      deriveEventStatus({ status: "cancelado", eventDate: PAST_DATE, eventTime: null, endDate: null, endTime: null })
    ).toBe("cancelado");
  });
});

describe("registrationCtaLabel", () => {
  it("reconoce enlaces de WhatsApp", () => {
    expect(registrationCtaLabel("https://wa.me/573001234567")).toBe("Escríbenos por WhatsApp");
  });

  it("reconoce Google Forms", () => {
    expect(registrationCtaLabel("https://forms.gle/abc123")).toBe("Completar formulario");
    expect(registrationCtaLabel("https://docs.google.com/forms/d/e/123")).toBe("Completar formulario");
  });

  it("cae a una etiqueta genérica para cualquier otra URL", () => {
    expect(registrationCtaLabel("https://ejemplo.com/inscripcion")).toBe("Inscribirme");
  });
});
