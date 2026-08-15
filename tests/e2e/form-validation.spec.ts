import { expect, test } from "@playwright/test";

/**
 * Estas pruebas verifican la validación en el navegador SIN completar un
 * envío real — el proyecto no tiene una base de datos de Supabase separada
 * para pruebas, así que un envío exitoso automatizado dejaría filas de
 * prueba en la base de datos real cada vez que corra esta suite.
 */
test.describe("Validación de formularios públicos (sin enviar datos reales)", () => {
  test("Contacto no se envía si faltan los campos requeridos", async ({ page }) => {
    await page.goto("/contacto");
    await page.getByRole("button", { name: "Enviar mensaje" }).click();

    // La validación nativa del navegador bloquea el submit: seguimos en la misma página.
    await expect(page).toHaveURL(/\/contacto$/);
    await expect(page.getByLabel("Nombre")).toHaveJSProperty("validity.valid", false);
  });

  test("Petición de oración no se envía si faltan los campos requeridos", async ({ page }) => {
    await page.goto("/oracion");
    await page.getByRole("button", { name: "Enviar petición" }).click();

    await expect(page).toHaveURL(/\/oracion$/);
    await expect(page.getByLabel("Nombre")).toHaveJSProperty("validity.valid", false);
  });

  test("Unirme a un grupo no se envía si faltan los campos requeridos", async ({ page }) => {
    await page.goto("/grupos/unirme");
    await page.getByRole("button", { name: "Enviar solicitud" }).click();

    await expect(page).toHaveURL(/\/grupos\/unirme$/);
    await expect(page.getByLabel("Nombre")).toHaveJSProperty("validity.valid", false);
  });

  test("el checkbox de consentimiento es obligatorio en Contacto", async ({ page }) => {
    await page.goto("/contacto");
    await page.getByLabel("Nombre").fill("Persona de prueba");
    await page.getByLabel("Motivo del contacto").selectOption("informacion");
    await page.getByRole("button", { name: "Enviar mensaje" }).click();

    // Sin marcar el consentimiento, el navegador sigue bloqueando el envío.
    await expect(page).toHaveURL(/\/contacto$/);
    const consent = page.getByRole("checkbox", { name: /autorizo el tratamiento/i });
    await expect(consent).toHaveJSProperty("validity.valid", false);
  });
});
