import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "admin-1" } } }) },
    from: () => ({
      insert: () => ({
        select: () => ({
          single: async () => ({ data: { id: "media-1", bucket: "site", path: "p.png" }, error: null }),
        }),
      }),
    }),
    storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: "https://x/p.png" } }) }) },
  }),
}));

const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (...a: unknown[]) => revalidatePathMock(...a) }));
vi.mock("@/lib/audit", () => ({ logAudit: async () => undefined }));

const { createMediaRecord } = await import("@/lib/actions/media");

const input = (module: string) => ({
  bucket: "site",
  path: "p.png",
  filename: "p.png",
  mimeType: "image/png",
  sizeBytes: 1000,
  module,
});

describe("createMediaRecord — revalida la página pública que usa la foto", () => {
  beforeEach(() => revalidatePathMock.mockReset());

  it("fotos de Generaciones invalidan /generaciones (antes solo esperaban al ISR de 60 s)", async () => {
    const result = await createMediaRecord(input("generaciones-hero"));
    expect(result).toHaveProperty("data");
    expect(revalidatePathMock).toHaveBeenCalledWith("/generaciones");
  });

  it("fotos de cada área de Generaciones también", async () => {
    await createMediaRecord(input("generaciones-area-bebes"));
    expect(revalidatePathMock).toHaveBeenCalledWith("/generaciones");
  });

  it("la foto principal de Nosotros sigue invalidando /nosotros", async () => {
    await createMediaRecord(input("nosotros-hero"));
    expect(revalidatePathMock).toHaveBeenCalledWith("/nosotros");
  });

  it("una foto de otro módulo (ej. pastors) no invalida páginas ajenas", async () => {
    await createMediaRecord({ ...input("pastors"), bucket: "pastors" });
    expect(revalidatePathMock).not.toHaveBeenCalledWith("/generaciones");
    expect(revalidatePathMock).not.toHaveBeenCalledWith("/nosotros");
  });
});
