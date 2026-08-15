import { expect, test } from "@playwright/test";

test.describe("Navegación del sitio público", () => {
  test("la página de inicio carga con el contenido principal", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Inspira Church/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Inspira Church" }).first()).toBeVisible();
  });

  test("el menú lleva a cada sección pública", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("header nav").first();

    await nav.getByRole("link", { name: "Nosotros" }).click();
    await expect(page).toHaveURL(/\/nosotros$/);

    await nav.getByRole("link", { name: "Prédicas" }).click();
    await expect(page).toHaveURL(/\/predicas$/);

    await nav.getByRole("link", { name: "Grupos" }).click();
    await expect(page).toHaveURL(/\/grupos$/);

    await nav.getByRole("link", { name: "Eventos" }).click();
    await expect(page).toHaveURL(/\/eventos$/);

    await nav.getByRole("link", { name: "Contacto" }).click();
    await expect(page).toHaveURL(/\/contacto$/);
  });

  test("la página de oración es accesible directamente", async ({ page }) => {
    await page.goto("/oracion");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("robots.txt y sitemap.xml responden", async ({ page }) => {
    const robots = await page.request.get("/robots.txt");
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain("Sitemap:");

    const sitemap = await page.request.get("/sitemap.xml");
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain("<urlset");
  });
});
