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
