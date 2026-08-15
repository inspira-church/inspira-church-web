import { describe, expect, it } from "vitest";
import { SITE_CONFIG, SITE_URL, whatsappLink } from "@/lib/constants";

describe("whatsappLink", () => {
  it("usa el número y mensaje por defecto si no se pasan argumentos", () => {
    const link = whatsappLink();
    expect(link).toBe(
      `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(SITE_CONFIG.whatsappDefaultMessage)}`
    );
  });

  it("usa el número y mensaje dados", () => {
    const link = whatsappLink("Hola, tengo una pregunta", "573009999999");
    expect(link).toBe("https://wa.me/573009999999?text=Hola%2C%20tengo%20una%20pregunta");
  });

  it("codifica caracteres especiales del mensaje", () => {
    const link = whatsappLink("¿Cómo llego?", "573001234567");
    expect(link).toContain(encodeURIComponent("¿Cómo llego?"));
  });
});

describe("SITE_URL", () => {
  it("no termina en barra", () => {
    expect(SITE_URL.endsWith("/")).toBe(false);
  });

  it("es una URL absoluta", () => {
    expect(SITE_URL).toMatch(/^https?:\/\//);
  });
});
