import { describe, expect, it } from "vitest";
import { createMediaRecordSchema, MAX_HERO_MEDIA_SIZE_BYTES } from "@/lib/validations/media";

const valid = {
  bucket: "sermons",
  path: "sermons/2026/portada.jpg",
  filename: "portada.jpg",
  mimeType: "image/jpeg",
  sizeBytes: 1024 * 500,
  altText: "Portada de la prédica",
  module: "predicas",
} as const;

describe("createMediaRecordSchema", () => {
  it("acepta un registro de medio válido", () => {
    expect(createMediaRecordSchema.safeParse(valid).success).toBe(true);
  });

  it("rechaza un bucket fuera de la lista permitida", () => {
    expect(createMediaRecordSchema.safeParse({ ...valid, bucket: "otro-bucket" }).success).toBe(
      false
    );
  });

  it("rechaza un mime type no permitido", () => {
    expect(
      createMediaRecordSchema.safeParse({ ...valid, mimeType: "application/pdf" }).success
    ).toBe(false);
  });

  it("rechaza un archivo mayor al máximo permitido (40 MB, límite del hero)", () => {
    // El techo del esquema es el más amplio (video del hero); el límite de
    // 5 MB para fotos normales se aplica en el cliente vía el prop
    // maxSizeBytes de ImageUploadField, no en este esquema compartido.
    expect(
      createMediaRecordSchema.safeParse({ ...valid, sizeBytes: MAX_HERO_MEDIA_SIZE_BYTES + 1 })
        .success
    ).toBe(false);
  });

  it("rechaza tamaño cero o negativo", () => {
    expect(createMediaRecordSchema.safeParse({ ...valid, sizeBytes: 0 }).success).toBe(false);
  });
});
