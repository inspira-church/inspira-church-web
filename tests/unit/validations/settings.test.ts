import { describe, expect, it } from "vitest";
import { siteSettingsSchema } from "@/lib/validations/settings";

const valid = {
  whatsappNumber: "573001234567",
  whatsappMessage: "Hola, quiero más información.",
  facebookUrl: "https://facebook.com/inspirachurch",
  instagramUrl: "https://instagram.com/inspirachurch",
  tiktokUrl: "https://tiktok.com/@inspirachurch",
  xUrl: "https://x.com/inspirachurch",
  youtubeUrl: "https://youtube.com/@inspirachurch",
  privacyPolicyUrl: "https://inspirachurch.com/privacidad",
  heroText1: "Somos una iglesia donde el **amor de Dios** restaura vidas.",
  heroText2: "Vivimos para **adorar a Dios** cada día.",
  firstTimeHeroText: "Sin compromiso, solo para conocernos.",
  contactHeroText: "Queremos escucharte.",
} as const;

describe("siteSettingsSchema", () => {
  it("acepta una configuración completa válida", () => {
    expect(siteSettingsSchema.safeParse(valid).success).toBe(true);
  });

  it("acepta con las redes sociales vacías", () => {
    const result = siteSettingsSchema.safeParse({
      ...valid,
      facebookUrl: "",
      instagramUrl: "",
      tiktokUrl: "",
      xUrl: "",
      youtubeUrl: "",
      privacyPolicyUrl: "",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un número de WhatsApp con letras o símbolos", () => {
    expect(
      siteSettingsSchema.safeParse({ ...valid, whatsappNumber: "+57 300 123 4567" }).success
    ).toBe(false);
  });

  it("rechaza un número de WhatsApp demasiado corto", () => {
    expect(siteSettingsSchema.safeParse({ ...valid, whatsappNumber: "12345" }).success).toBe(
      false
    );
  });

  it("rechaza una URL de red social mal formada", () => {
    expect(siteSettingsSchema.safeParse({ ...valid, tiktokUrl: "no-es-una-url" }).success).toBe(
      false
    );
  });

  it("rechaza mensaje de WhatsApp vacío", () => {
    expect(siteSettingsSchema.safeParse({ ...valid, whatsappMessage: "" }).success).toBe(false);
  });

  it("acepta un Channel ID de YouTube válido", () => {
    expect(
      siteSettingsSchema.safeParse({ ...valid, youtubeChannelId: "UC" + "a".repeat(22) }).success
    ).toBe(true);
  });

  it("acepta Channel ID vacío (opcional)", () => {
    expect(siteSettingsSchema.safeParse({ ...valid, youtubeChannelId: "" }).success).toBe(true);
  });

  it("rechaza un Channel ID que no empieza con UC o tiene largo distinto", () => {
    expect(siteSettingsSchema.safeParse({ ...valid, youtubeChannelId: "abc123" }).success).toBe(
      false
    );
  });
});

describe("siteSettingsSchema — coordenadas de la sede", () => {
  it("null (sede sin coordenadas) no se convierte en 0,0", () => {
    // saveSettingsPartial mergea sobre getSiteSettings(), donde "sin sede" es null.
    const result = siteSettingsSchema.safeParse({ ...valid, churchLat: null, churchLng: null });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.churchLat).toBeUndefined();
      expect(result.data.churchLng).toBeUndefined();
    }
  });

  it('"" (campo vaciado en el formulario) tampoco es 0', () => {
    const result = siteSettingsSchema.safeParse({ ...valid, churchLat: "", churchLng: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.churchLat).toBeUndefined();
  });

  it("un valor real sigue aceptándose y coaccionándose", () => {
    const result = siteSettingsSchema.safeParse({ ...valid, churchLat: "4.722", churchLng: "-74.052727" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.churchLat).toBe(4.722);
      expect(result.data.churchLng).toBe(-74.052727);
    }
  });

  it("sigue rechazando coordenadas fuera de rango", () => {
    expect(siteSettingsSchema.safeParse({ ...valid, churchLat: 120 }).success).toBe(false);
  });
});
