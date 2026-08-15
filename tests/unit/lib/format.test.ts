import { describe, expect, it } from "vitest";
import { dayName, formatDate, formatTime, getYouTubeId } from "@/lib/format";

describe("formatDate", () => {
  it("formatea una fecha ISO en español", () => {
    expect(formatDate("2026-03-15")).toBe("15 de marzo de 2026");
  });
});

describe("formatTime", () => {
  it("formatea 24h a 12h con a.m./p.m.", () => {
    expect(formatTime("19:00")).toMatch(/7:00\s*p\.?\s*m\.?/i);
    expect(formatTime("09:30")).toMatch(/9:30\s*a\.?\s*m\.?/i);
  });
});

describe("dayName", () => {
  it("devuelve el nombre del día para índices 0-6", () => {
    expect(dayName(0)).toBe("Domingo");
    expect(dayName(6)).toBe("Sábado");
  });

  it("devuelve cadena vacía para un índice fuera de rango", () => {
    expect(dayName(9)).toBe("");
  });
});

describe("getYouTubeId", () => {
  it("extrae el id de un enlace watch?v=", () => {
    expect(getYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extrae el id de un enlace youtu.be", () => {
    expect(getYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extrae el id de un enlace de embed", () => {
    expect(getYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("devuelve null para una URL que no es de YouTube", () => {
    expect(getYouTubeId("https://vimeo.com/12345")).toBeNull();
  });

  it("devuelve null para una cadena que no es una URL", () => {
    expect(getYouTubeId("no-es-una-url")).toBeNull();
  });
});
