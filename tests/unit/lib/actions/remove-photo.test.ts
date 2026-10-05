import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * "Quitar foto" tiene dos mecánicas:
 *  - Campo de una fila (equipo, eventos, prédicas, series): el formulario envía
 *    el campo vacío y se persiste null.
 *  - Slot de media (hero, Nosotros, Primera vez, Generaciones): se desvincula la
 *    fila de `media` (module = null) sin borrar el archivo.
 */
const state = vi.hoisted(() => ({
  updates: {} as Record<string, Record<string, unknown>>,
  mediaUpdates: [] as { payload: Record<string, unknown>; module: unknown }[],
  result: { data: [{ id: "row-1" }] as { id: string }[] | null, error: null as unknown },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => ({
      update: (payload: Record<string, unknown>) => ({
        eq: (_col: string, value: unknown) => {
          if (table === "media") state.mediaUpdates.push({ payload, module: value });
          else state.updates[table] = payload;
          return { select: async () => state.result };
        },
      }),
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
const logAuditMock = vi.fn();
vi.mock("@/lib/audit", () => ({ logAudit: (...a: unknown[]) => logAuditMock(...a) }));

const { updateTeamMember } = await import("@/lib/actions/team-members");
const { updateEvent } = await import("@/lib/actions/events");
const { updateSermon } = await import("@/lib/actions/sermons");
const { updateSermonSeries } = await import("@/lib/actions/sermon-series");
const { unlinkMediaSlot } = await import("@/lib/actions/media");

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
  state.mediaUpdates = [];
  state.result = { data: [{ id: "row-1" }], error: null };
  revalidatePathMock.mockReset();
  logAuditMock.mockReset();
});

describe("Quitar foto — campos de imagen de una fila", () => {
  // Al pulsar "Quitar foto" el formulario envía el campo vacío.
  it("equipo: la foto quitada se persiste como null y la URL anterior no reaparece", async () => {
    await run(() =>
      updateTeamMember("row-1", {}, fd({ fullName: "Luz", type: "pastor", roleTitle: "Pastor", photoUrl: "", active: "on" }))
    );
    expect(wire("team_members")).toHaveProperty("photo_url", null);
  });

  it("eventos: la imagen quitada se persiste como null", async () => {
    await run(() =>
      updateEvent("row-1", {}, fd({ name: "Campamento", slug: "campamento", eventDate: "2026-10-10", adminStatus: "activo", imageUrl: "" }))
    );
    expect(wire("events")).toHaveProperty("image_url", null);
  });

  it("prédicas: la miniatura quitada se persiste como null", async () => {
    await run(() =>
      updateSermon(
        "row-1",
        {},
        fd({ title: "M", slug: "m", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sermonDate: "2026-08-02", thumbnailUrl: "" })
      )
    );
    expect(wire("sermons")).toHaveProperty("thumbnail_url", null);
  });

  it("series: la portada quitada se persiste como null", async () => {
    await run(() => updateSermonSeries("row-1", {}, fd({ name: "S", slug: "s", coverImageUrl: "" })));
    expect(wire("sermon_series")).toHaveProperty("cover_image_url", null);
  });

  it("una foto que se conserva viaja intacta (quitar es siempre una acción explícita)", async () => {
    const url = "https://x.supabase.co/storage/v1/object/public/sermons/portada.png";
    await run(() => updateSermonSeries("row-1", {}, fd({ name: "S", slug: "s", coverImageUrl: url })));
    expect(wire("sermon_series")).toHaveProperty("cover_image_url", url);
  });

  it("quitar la foto de un miembro invalida /nosotros", async () => {
    await run(() =>
      updateTeamMember("row-1", {}, fd({ fullName: "Luz", type: "pastor", roleTitle: "Pastor", photoUrl: "", active: "on" }))
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/nosotros");
  });
});

describe("unlinkMediaSlot — Quitar foto de un slot", () => {
  it("desvincula las filas del slot (module = null), sin borrar archivos ni filas", async () => {
    const r = await unlinkMediaSlot("nosotros-hero");

    expect(r).toEqual({ success: true });
    expect(state.mediaUpdates).toEqual([{ payload: { module: null }, module: "nosotros-hero" }]);
    expect(logAuditMock).toHaveBeenCalledWith(expect.objectContaining({ module: "about" }));
  });

  it("revalida la página pública del slot y la librería de medios", async () => {
    await unlinkMediaSlot("generaciones-area-ninos");

    expect(revalidatePathMock).toHaveBeenCalledWith("/generaciones");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/medios");
  });

  it("cada slot invalida su propia página", async () => {
    await unlinkMediaSlot("hero-slide-2");
    await unlinkMediaSlot("primera-vez-hero");
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/primera-vez");
  });

  it("rechaza módulos que no son slots (no se desvincula la foto de un pastor desde aquí)", async () => {
    const r = await unlinkMediaSlot("pastors");

    expect(r).toHaveProperty("error");
    expect(state.mediaUpdates).toEqual([]);
  });

  it("error de Supabase: devuelve error y no revalida ni audita", async () => {
    state.result = { data: null, error: { message: "boom" } };

    expect(await unlinkMediaSlot("hero-slide-1")).toHaveProperty("error");
    expect(revalidatePathMock).not.toHaveBeenCalled();
    expect(logAuditMock).not.toHaveBeenCalled();
  });

  it("0 filas afectadas: no es un éxito falso", async () => {
    state.result = { data: [], error: null };

    expect(await unlinkMediaSlot("hero-slide-1")).toHaveProperty("error");
    expect(revalidatePathMock).not.toHaveBeenCalled();
    expect(logAuditMock).not.toHaveBeenCalled();
  });
});
