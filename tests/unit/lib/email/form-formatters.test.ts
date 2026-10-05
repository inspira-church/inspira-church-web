import { describe, expect, it } from "vitest";
import {
  formatContactSubmission,
  formatFirstTimeSubmission,
  formatGenerationsSubmission,
  formatGroupJoinSubmission,
  formatPrayerSubmission,
  PRAYER_EMAIL_EXCERPT_LENGTH,
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
  const base = {
    name: "Luis",
    phone: "3001112233",
    email: "luis@example.com",
    requestText: "Oren por mi familia.",
  };

  it("petición NO privada: incluye el texto, pero sin teléfono ni correo en el cuerpo", () => {
    const s = formatPrayerSubmission({ ...base, isPrivate: false });
    expect(labels(s)).toEqual(["Nombre", "Petición"]);
    expect(value(s, "Petición")).toBe("Oren por mi familia.");
    expect(JSON.stringify(s.fields)).not.toContain("3001112233");
    expect(JSON.stringify(s.fields)).not.toContain("luis@example.com");
    // El correo del visitante sí viaja como destino de la respuesta y Reply-To.
    expect(s.visitorEmail).toBe("luis@example.com");
    expect(s.suppressReplyTo).toBeUndefined();
  });

  it("petición NO privada larga: se recorta y avisa que la completa está en el CMS", () => {
    const long = "a".repeat(PRAYER_EMAIL_EXCERPT_LENGTH + 150);
    const s = formatPrayerSubmission({ ...base, requestText: long, isPrivate: false });
    const sent = value(s, "Petición") as string;
    expect(sent.length).toBeLessThanOrEqual(PRAYER_EMAIL_EXCERPT_LENGTH + 1);
    expect(sent.endsWith("…")).toBe(true);
    expect(s.note).toContain("recortada");
  });

  it("petición NO privada corta no se recorta", () => {
    const exact = "b".repeat(PRAYER_EMAIL_EXCERPT_LENGTH);
    const s = formatPrayerSubmission({ ...base, requestText: exact, isPrivate: false });
    expect(value(s, "Petición")).toBe(exact);
    expect(s.note).not.toContain("recortada");
  });

  it("petición PRIVADA: solo nombre y aviso; el texto, teléfono y correo NO viajan", () => {
    const s = formatPrayerSubmission({ ...base, isPrivate: true });
    expect(labels(s)).toEqual(["Nombre"]);
    // Todo lo que se escribe en el correo (visitorEmail solo es destino, no contenido).
    const content = JSON.stringify({ fields: s.fields, note: s.note, title: s.title, subject: s.subjectPrefix });
    expect(content).not.toContain("Oren por mi familia.");
    expect(content).not.toContain("3001112233");
    expect(content).not.toContain("luis@example.com");
    expect(s.title).toContain("PRIVADA");
    expect(s.subjectPrefix).toContain("privada");
    expect(s.note).toContain("registrada en el CMS");
    expect(s.note).toContain("panel autorizado");
  });

  it("petición PRIVADA: sin Reply-To (el correo del visitante no llega a todos los destinatarios), pero la respuesta automática sigue posible", () => {
    const s = formatPrayerSubmission({ ...base, isPrivate: true });
    expect(s.suppressReplyTo).toBe(true);
    expect(s.visitorEmail).toBe("luis@example.com");
  });

  it("sin correo: visitorEmail null", () => {
    const s = formatPrayerSubmission({ ...base, email: null, isPrivate: false });
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
