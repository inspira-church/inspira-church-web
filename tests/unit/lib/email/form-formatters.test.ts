import { describe, expect, it } from "vitest";
import {
  formatContactSubmission,
  formatFirstTimeSubmission,
  formatGenerationsSubmission,
  formatGroupJoinSubmission,
  formatPrayerSubmission,
} from "@/lib/email/form-formatters";

const labels = (s: { fields: { label: string; value: string | null }[] }) => s.fields.map((f) => f.label);
const value = (s: { fields: { label: string; value: string | null }[] }, label: string) =>
  s.fields.find((f) => f.label === label)?.value;

describe("formatContactSubmission", () => {
  const data = {
    name: "Juan Pérez",
    reason: "visitar",
    phone: "3001234567",
    email: "juan@example.com",
    preferredChannel: "whatsapp",
    message: "Quisiera visitar.",
  };

  it("conserva los campos del aviso original de Contacto", () => {
    const s = formatContactSubmission(data);
    expect(labels(s)).toEqual([
      "Nombre",
      "Motivo",
      "Teléfono / WhatsApp",
      "Correo",
      "Prefiere que lo contacten por",
      "Mensaje",
    ]);
    expect(s.visitorName).toBe("Juan Pérez");
    expect(s.visitorEmail).toBe("juan@example.com");
  });

  it("sin correo: visitorEmail null y el aviso dice «No proporcionado»", () => {
    const s = formatContactSubmission({ ...data, email: undefined });
    expect(s.visitorEmail).toBeNull();
    expect(value(s, "Correo")).toBe("No proporcionado");
  });

  it("traduce motivo y canal a etiquetas legibles", () => {
    const s = formatContactSubmission(data);
    expect(value(s, "Motivo")).not.toBe("visitar");
    expect(value(s, "Prefiere que lo contacten por")).not.toBe("whatsapp");
  });
});

describe("formatFirstTimeSubmission", () => {
  it("usa el nombre de pila para el saludo y trae el correo (obligatorio en este formulario)", () => {
    const s = formatFirstTimeSubmission({
      firstName: "Ana",
      lastName: "Gómez",
      gender: "mujer",
      email: "ana@example.com",
      phone: "300",
      message: "Hola",
      attendsOtherChurch: false,
      wantsCall: true,
    });
    expect(s.visitorName).toBe("Ana");
    expect(s.visitorEmail).toBe("ana@example.com");
    expect(value(s, "Nombre")).toBe("Ana Gómez");
    expect(value(s, "Asiste a otra iglesia")).toBe("No");
    expect(value(s, "Quiere recibir una llamada")).toBe("Sí");
  });
});

describe("formatPrayerSubmission", () => {
  const base = { name: "Luis", phone: null, email: null, requestText: "Oren por mi familia." };

  it("petición pública: incluye el texto", () => {
    const s = formatPrayerSubmission({ ...base, isPrivate: false });
    expect(value(s, "Petición")).toBe("Oren por mi familia.");
    expect(s.note).toBeNull();
  });

  it("petición PRIVADA: el texto NO viaja por correo (solo el Administrador la lee en el CMS)", () => {
    const s = formatPrayerSubmission({ ...base, isPrivate: true });
    expect(JSON.stringify(s)).not.toContain("Oren por mi familia.");
    expect(value(s, "Petición")).toContain("Privada");
    expect(s.note).toContain("privada");
  });

  it("sin correo ni teléfono, esos campos no aparecen", () => {
    const s = formatPrayerSubmission({ ...base, isPrivate: false });
    expect(value(s, "Teléfono")).toBeNull();
    expect(s.visitorEmail).toBeNull();
  });
});

describe("formatGroupJoinSubmission", () => {
  it("incluye el grupo elegido y omite opcionales vacíos", () => {
    const s = formatGroupJoinSubmission({
      firstName: "Pedro",
      lastName: "Ruiz",
      phone: "300",
      whatsapp: "",
      email: "",
      age: 30,
      city: "Bogotá",
      locality: "Suba",
      groupName: "Grupo 1",
    });
    expect(value(s, "Grupo de interés")).toBe("Grupo 1");
    expect(value(s, "Edad")).toBe("30");
    expect(value(s, "WhatsApp")).toBeNull();
    expect(s.visitorEmail).toBeNull();
    expect(s.visitorName).toBe("Pedro");
  });

  it("sin grupo elegido lo dice claramente", () => {
    const s = formatGroupJoinSubmission({ firstName: "P", lastName: "R", phone: "3", city: "Bogotá", groupName: null });
    expect(value(s, "Grupo de interés")).toBe("Pidió que le recomienden uno");
  });
});

describe("formatGenerationsSubmission — datos de un menor", () => {
  const s = formatGenerationsSubmission({
    childFirstName: "Sofía",
    childLastName: "Mora",
    childAge: 8,
    areaInterest: "Pequeños Cristos",
    guardianName: "Carlos Mora",
    guardianPhone: "300",
    guardianEmail: "carlos@example.com",
  });

  it("el saludo y la respuesta van al ACUDIENTE", () => {
    expect(s.visitorName).toBe("Carlos Mora");
    expect(s.visitorEmail).toBe("carlos@example.com");
  });

  it("por minimización de datos no viajan alergias, colegio ni contacto de emergencia", () => {
    expect(labels(s)).not.toContain("Alergias");
    expect(labels(s)).not.toContain("Colegio");
    expect(labels(s).join(" ")).not.toMatch(/emergencia/i);
    expect(s.note).toContain("CMS");
  });

  it("sin correo del acudiente no hay respuesta automática posible", () => {
    const sin = formatGenerationsSubmission({
      childFirstName: "S",
      childLastName: "M",
      childAge: 8,
      guardianName: "C",
      guardianPhone: "3",
      guardianEmail: "",
    });
    expect(sin.visitorEmail).toBeNull();
  });
});
