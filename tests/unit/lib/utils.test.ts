import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("une clases simples", () => {
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold");
  });

  it("ignora valores falsy", () => {
    expect(cn("text-sm", false, undefined, null, "font-bold")).toBe("text-sm font-bold");
  });

  it("resuelve colisiones de Tailwind quedándose con la última", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("aplica clases condicionales con objetos", () => {
    expect(cn("base", { "text-accent": true, "text-danger": false })).toBe("base text-accent");
  });
});
