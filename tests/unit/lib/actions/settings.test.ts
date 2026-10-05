import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  current: {} as Record<string, unknown>,
  upsert: undefined as { value: Record<string, unknown> } | undefined,
}));

vi.mock("@/lib/queries/settings", async () => {
  const actual = await vi.importActual<typeof import("@/lib/queries/settings")>("@/lib/queries/settings");
  return { ...actual, getSiteSettings: async () => state.current };
});
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "admin-1" } } }) },
    from: () => ({
      upsert: async (row: { value: Record<string, unknown> }) => {
        state.upsert = row;
        return { error: null };
      },
    }),
  }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/audit", () => ({ logAudit: async () => undefined }));

const { updateContactSettings, updateHomeSettings } = await import("@/lib/actions/settings");

const baseSettings = {
  whatsappNumber: "573001234567",
  whatsappMessage: "Hola",
  contactEmail: "admin@inspirachurch.co",
  facebookUrl: "https://facebook.com/inspira",
  instagramUrl: "",
  tiktokUrl: "",
  xUrl: "",
  youtubeUrl: "",
  privacyPolicyUrl: "",
  churchAddress: "",
  churchLat: null,
  churchLng: null,
  youtubeChannelId: "",
  heroText1: "uno",
  heroText2: "dos",
  firstTimeHeroText: "tres",
  contactHeroText: "cuatro",
};

function fd(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

describe("saveSettingsPartial (vía acciones de Inicio/Contacto)", () => {
  beforeEach(() => {
    state.current = { ...baseSettings };
    state.upsert = undefined;
  });

  it("vaciar un campo opcional (correo, Facebook) NO conserva el valor anterior", async () => {
    await updateContactSettings(
      {},
      fd({ whatsappNumber: "573001234567", whatsappMessage: "Hola", contactHeroText: "cuatro", contactEmail: "", facebookUrl: "" })
    );

    const saved = JSON.parse(JSON.stringify(state.upsert?.value));
    expect(saved.contactEmail ?? "").toBe("");
    expect(saved.facebookUrl ?? "").toBe("");
  });

  it("guardar otra sección sin sede configurada NO escribe latitud/longitud 0", async () => {
    await updateHomeSettings({}, fd({ heroText1: "uno", heroText2: "dos", youtubeChannelId: "" }));

    const saved = JSON.parse(JSON.stringify(state.upsert?.value));
    expect(saved.churchLat).toBeUndefined();
    expect(saved.churchLng).toBeUndefined();
  });

  it("guardar otra sección conserva las coordenadas reales ya configuradas", async () => {
    state.current = { ...baseSettings, churchLat: 4.722, churchLng: -74.052727 };

    await updateHomeSettings({}, fd({ heroText1: "uno", heroText2: "dos", youtubeChannelId: "" }));

    expect(state.upsert?.value.churchLat).toBe(4.722);
    expect(state.upsert?.value.churchLng).toBe(-74.052727);
  });
});
