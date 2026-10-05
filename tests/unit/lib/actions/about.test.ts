import { beforeEach, describe, expect, it, vi } from "vitest";

const upsertMock = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "admin-1" } } }) },
    from: () => ({ upsert: upsertMock }),
  }),
}));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}));

vi.mock("@/lib/audit", () => ({ logAudit: async () => undefined }));

const { updateAboutContent } = await import("@/lib/actions/about");

function buildFormData(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const fields: Record<string, string> = {
    historyEyebrow: "Nuestra historia",
    historyTitle: "FE QUE CONECTA",
    historyText: "Texto de historia.",
    purposeEyebrow: "Nuestro propósito",
    purposeTitle: "Existimos con un propósito",
    missionTitle: "Misión",
    missionHeadline: "Presentar a Jesús",
    missionText: "Texto de misión.",
    visionTitle: "Visión",
    visionHeadline: "Una iglesia movida por el Espíritu Santo",
    visionText: "Texto de visión.",
    essenceTitle: "Amamos a Dios.",
    essenceText: "Texto.",
    valuesEyebrow: "Lo que nos mueve",
    valuesTitle: "Nuestros valores",
    valuesCount: "2",
    "values.0.title": "SANTIDAD",
    "values.0.description": "Vivimos apartados para Dios.",
    "values.0.visible": "on",
    "values.1.title": "SERVICIO",
    "values.1.description": "",
    "values.1.visible": "on",
    beliefsEyebrow: "Lo que creemos",
    beliefsTitle: "Nuestra fe",
    beliefsIntro: "Intro.",
    beliefsCount: "1",
    "beliefs.0.category": "Santa Cena",
    "beliefs.0.content": "Creemos en la santa cena del Señor como recordatorio de su muerte.",
    "beliefs.0.visible": "on",
    visitEyebrow: "Queremos conocerte",
    visitTitle: "Tu lugar",
    ctaTitle: "No tienes que hacer este camino solo.",
    ctaText: "Hay una familia esperando conocerte.",
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

describe("updateAboutContent", () => {
  beforeEach(() => {
    upsertMock.mockReset().mockResolvedValue({ error: null });
    revalidatePathMock.mockReset();
  });

  it("guarda un valor con descripción vacía (antes la validación rechazaba TODO el formulario)", async () => {
    const result = await updateAboutContent({}, buildFormData());

    expect(result).toEqual({ success: true });
    expect(upsertMock).toHaveBeenCalledTimes(1);
    const saved = upsertMock.mock.calls[0][0].value;
    expect(saved.values[1]).toEqual({ title: "SERVICIO", description: "", visible: true });
  });

  it("persiste exactamente el texto editado de Santa Cena (santa en minúscula, título intacto)", async () => {
    await updateAboutContent({}, buildFormData());

    const saved = upsertMock.mock.calls[0][0].value;
    expect(saved.beliefs[0].category).toBe("Santa Cena");
    expect(saved.beliefs[0].content).toBe(
      "Creemos en la santa cena del Señor como recordatorio de su muerte."
    );
  });

  it("revalida /nosotros (y el panel) tras guardar, para que el cambio se vea sin deploy", async () => {
    await updateAboutContent({}, buildFormData());

    expect(revalidatePathMock).toHaveBeenCalledWith("/nosotros");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/nosotros");
  });

  it("si la validación falla (valor sin título) no guarda, no revalida y devuelve el error por campo", async () => {
    const result = await updateAboutContent({}, buildFormData({ "values.0.title": "" }));

    expect(result.success).toBeUndefined();
    expect(result.fieldErrors?.values).toBeTruthy();
    expect(upsertMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("si Supabase rechaza el guardado, devuelve error y no revalida", async () => {
    upsertMock.mockResolvedValue({ error: { message: "rls" } });

    const result = await updateAboutContent({}, buildFormData());

    expect(result.error).toBeTruthy();
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
