import { describe, expect, it } from "vitest";
import { optionalText } from "@/lib/form-data";

function fd(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

describe("optionalText", () => {
  it('conserva "" (el usuario vació el campo a propósito)', () => {
    expect(optionalText(fd({ bio: "" }), "bio")).toBe("");
  });

  it("devuelve el texto tal cual, incluido un punto", () => {
    expect(optionalText(fd({ bio: "." }), "bio")).toBe(".");
  });

  it("devuelve undefined solo si el campo no vino en el formulario", () => {
    expect(optionalText(fd({}), "bio")).toBeUndefined();
  });

  it("ignora archivos (no son texto)", () => {
    const f = new FormData();
    f.set("bio", new File(["x"], "x.txt"));
    expect(optionalText(f, "bio")).toBeUndefined();
  });
});
