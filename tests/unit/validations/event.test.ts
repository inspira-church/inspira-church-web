import { describe, expect, it } from "vitest";
import { eventSchema } from "@/lib/validations/event";

const valid = {
  name: "Retiro de jóvenes",
  slug: "retiro-de-jovenes",
  description: "Un fin de semana fuera de la ciudad.",
  imageUrl: "https://example.com/imagen.jpg",
  eventDate: "2026-03-15",
  eventTime: "09:00",
  locationName: "Finca La Esperanza",
  address: "Km 5 vía Cota",
  lat: "4.7110",
  lng: "-74.0721",
  capacity: "50",
  registrationUrl: "https://example.com/inscripcion",
  adminStatus: "activo",
  published: true,
} as const;

describe("eventSchema", () => {
  it("acepta un evento completo válido", () => {
    expect(eventSchema.safeParse(valid).success).toBe(true);
  });

  it("rechaza un slug con mayúsculas o espacios", () => {
    expect(eventSchema.safeParse({ ...valid, slug: "Retiro De Jovenes" }).success).toBe(false);
  });

  it("rechaza un estado administrativo fuera del enum", () => {
    expect(eventSchema.safeParse({ ...valid, adminStatus: "en-curso" }).success).toBe(false);
  });

  it("rechaza latitud fuera de rango", () => {
    expect(eventSchema.safeParse({ ...valid, lat: "200" }).success).toBe(false);
  });

  it("rechaza una URL de registro inválida", () => {
    expect(eventSchema.safeParse({ ...valid, registrationUrl: "no-es-url" }).success).toBe(false);
  });

  it("rechaza capacidad no positiva", () => {
    expect(eventSchema.safeParse({ ...valid, capacity: "0" }).success).toBe(false);
  });

  it("rechaza una fecha de finalización anterior a la de inicio", () => {
    expect(eventSchema.safeParse({ ...valid, endDate: "2026-03-10" }).success).toBe(false);
  });

  it("acepta una fecha de finalización igual o posterior a la de inicio", () => {
    expect(eventSchema.safeParse({ ...valid, endDate: "2026-03-17" }).success).toBe(true);
  });
});
