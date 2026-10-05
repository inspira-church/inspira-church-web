import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Regresión transversal del CMS: vaciar un campo opcional en un formulario de
 * edición debe PERSISTIR el vacío, no conservar el valor anterior. El bug
 * original era `formData.get(x) || undefined` + `update({ x: undefined })`:
 * JSON.stringify omite la clave y Supabase nunca sobrescribe la columna.
 */
const state = vi.hoisted(() => ({
  updates: {} as Record<string, Record<string, unknown>>,
  updateResult: { data: [{ id: "row-1" }] as { id: string }[] | null, error: null as unknown },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => ({
      update: (payload: Record<string, unknown>) => {
        state.updates[table] = payload;
        return { eq: () => ({ select: async () => state.updateResult }) };
      },
    }),
  }),
}));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (...a: unknown[]) => revalidatePathMock(...a) }));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`NEXT_REDIRECT:${to}`);
  },
}));
vi.mock("@/lib/audit", () => ({ logAudit: async () => undefined }));

const { updateGrowthGroup } = await import("@/lib/actions/growth-groups");
const { updateSermonSeries } = await import("@/lib/actions/sermon-series");
const { updateSermon } = await import("@/lib/actions/sermons");
const { updateSchedule } = await import("@/lib/actions/schedules");
const { updateEvent } = await import("@/lib/actions/events");

function fd(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

async function run(action: () => Promise<unknown>) {
  try {
    return await action();
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("NEXT_REDIRECT")) return { success: true };
    throw e;
  }
}

/** Lo que de verdad viaja por la red: JSON.stringify omite las claves con undefined. */
const wire = (table: string) => JSON.parse(JSON.stringify(state.updates[table]));

beforeEach(() => {
  state.updates = {};
  state.updateResult = { data: [{ id: "row-1" }], error: null };
  revalidatePathMock.mockReset();
});

describe("Grupos — campos de texto opcionales vaciables", () => {
  const base = {
    name: "Grupo 1",
    slug: "grupo-1",
    groupType: "Crecimiento",
    city: "Bogotá",
    dayOfWeek: "3",
    timeOfDay: "19:00",
    active: "on",
    locationPublic: "on",
  };

  it("vaciar descripción, localidad, sector, dirección exacta, teléfono y notas persiste ''", async () => {
    await run(() =>
      updateGrowthGroup(
        "row-1",
        {},
        fd({
          ...base,
          description: "",
          locality: "",
          sector: "",
          exactAddress: "",
          leaderPhonePrivate: "",
          internalNotes: "",
        })
      )
    );
    const sent = wire("growth_groups");
    for (const col of [
      "description",
      "locality",
      "sector",
      "exact_address",
      "leader_phone_private",
      "internal_notes",
    ]) {
      expect(sent, col).toHaveProperty(col, "");
    }
  });

  it("un cambio sin filas afectadas no se reporta como guardado", async () => {
    state.updateResult = { data: [], error: null };
    const result = await run(() => updateGrowthGroup("row-1", {}, fd(base)));
    expect(result).toHaveProperty("error");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("guardar invalida /grupos y /grupos/unirme", async () => {
    await run(() => updateGrowthGroup("row-1", {}, fd(base)));
    expect(revalidatePathMock).toHaveBeenCalledWith("/grupos");
    expect(revalidatePathMock).toHaveBeenCalledWith("/grupos/unirme");
  });
});

describe("Series — descripción y portada vaciables", () => {
  it("vaciar descripción persiste '' y quitar la portada persiste null", async () => {
    await run(() =>
      updateSermonSeries("row-1", {}, fd({ name: "Serie", slug: "serie", description: "", coverImageUrl: "", active: "on" }))
    );
    const sent = wire("sermon_series");
    expect(sent).toHaveProperty("description", "");
    expect(sent).toHaveProperty("cover_image_url", null);
  });

  it("guardar invalida /predicas, donde se listan las series", async () => {
    await run(() => updateSermonSeries("row-1", {}, fd({ name: "Serie", slug: "serie" })));
    expect(revalidatePathMock).toHaveBeenCalledWith("/predicas");
  });
});

describe("Prédicas — descripción y miniatura vaciables", () => {
  const base = {
    title: "Mensaje",
    slug: "mensaje",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    sermonDate: "2026-08-02",
    topics: "fe",
    published: "on",
  };

  it("vaciar descripción persiste '' y quitar la miniatura persiste null", async () => {
    await run(() => updateSermon("row-1", {}, fd({ ...base, description: "", thumbnailUrl: "" })));
    const sent = wire("sermons");
    expect(sent).toHaveProperty("description", "");
    expect(sent).toHaveProperty("thumbnail_url", null);
  });

  it("guardar invalida Inicio y /oraciones (una grabación de oración es una fila de sermons)", async () => {
    await run(() => updateSermon("row-1", {}, fd(base)));
    for (const path of ["/predicas", "/oraciones", "/", "/admin/predicas", "/admin/oraciones"]) {
      expect(revalidatePathMock).toHaveBeenCalledWith(path);
    }
  });

  it("un cambio sin filas afectadas no se reporta como guardado", async () => {
    state.updateResult = { data: [], error: null };
    const result = await run(() => updateSermon("row-1", {}, fd(base)));
    expect(result).toHaveProperty("error");
  });
});

describe("Horarios — ubicación vaciable", () => {
  const base = { type: "servicio", name: "Oración Presencial", dayOfWeek: "3", timeOfDay: "19:00", active: "on" };

  it("vaciar la ubicación persiste ''", async () => {
    await run(() => updateSchedule("row-1", {}, fd({ ...base, location: "" })));
    expect(wire("schedules")).toHaveProperty("location", "");
  });

  it("guardar invalida /oraciones, que muestra los horarios de oración", async () => {
    await run(() => updateSchedule("row-1", {}, fd(base)));
    expect(revalidatePathMock).toHaveBeenCalledWith("/oraciones");
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
  });
});

describe("Eventos — vaciar opcionales (ya cubierto con ?? null) y falso éxito", () => {
  const base = { name: "Campamento", slug: "campamento", eventDate: "2026-10-10", adminStatus: "activo", published: "on" };

  it("vaciar subtítulo y descripción persiste null, no se conserva el anterior", async () => {
    await run(() => updateEvent("row-1", {}, fd({ ...base, subtitle: "", description: "", imageUrl: "" })));
    const sent = wire("events");
    expect(sent).toHaveProperty("subtitle", null);
    expect(sent).toHaveProperty("description", null);
    expect(sent).toHaveProperty("image_url", null);
  });

  it("un cambio sin filas afectadas no se reporta como guardado", async () => {
    state.updateResult = { data: [], error: null };
    const result = await run(() => updateEvent("row-1", {}, fd(base)));
    expect(result).toHaveProperty("error");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
