import { beforeEach, describe, expect, it, vi } from "vitest";

const rows = vi.hoisted(() => ({
  data: [] as Record<string, unknown>[],
  selectedColumns: "",
}));

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: async () => ({
    from: () => ({
      select: (columns: string) => {
        rows.selectedColumns = columns;
        return { eq: () => ({ order: async () => ({ data: rows.data }) }) };
      },
    }),
  }),
}));

const { getActiveTeamMembers } = await import("@/lib/queries/team-members");

describe("getActiveTeamMembers (query pública)", () => {
  beforeEach(() => {
    rows.data = [];
  });

  it("F. pide photo_url y devuelve la foto guardada tal cual, sin sustituirla", async () => {
    const url = "https://x.supabase.co/storage/v1/object/public/pastors/luz.png";
    rows.data = [
      { id: "1", full_name: "Luz Marina", type: "pastor", role_title: "Pastor Fundador", bio: "", photo_url: url, order_index: 0 },
    ];

    const [member] = await getActiveTeamMembers();

    expect(rows.selectedColumns).toContain("photo_url");
    expect(member.photo_url).toBe(url);
  });

  it('E. una biografía "" llega como "" (no se reemplaza por un default ni por la anterior)', async () => {
    rows.data = [
      { id: "1", full_name: "Luz Marina", type: "pastor", role_title: "x", bio: "", photo_url: null, order_index: 0 },
    ];

    const [member] = await getActiveTeamMembers();

    expect(member.bio).toBe("");
  });
});
