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

  test("el modal de áreas de Generaciones cierra con Escape", async ({ page }) => {
    await page.goto("/generaciones");

    const areaButton = page.getByRole("button", { name: /alabanza/i });
    await areaButton.scrollIntoViewIfNeeded();
    await areaButton.click();

    const dialog = page.locator("dialog[aria-labelledby='generations-area-name']");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("ContactFAB: los enlaces ocultos no son tabulables cerrado, y sí cuando se abre", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Abrir opciones de contacto" });
    // Selector por atributo (no getByRole): el enlace vive dentro de un
    // contenedor aria-hidden mientras el FAB está cerrado, y getByRole
    // respeta el árbol de accesibilidad — no lo encontraría en ese estado.
    const whatsapp = page.locator('a[aria-label="WhatsApp"][href*="wa.me"]');

    await expect(whatsapp).toHaveAttribute("tabindex", "-1");

    await toggle.click();
    await expect(whatsapp).toHaveAttribute("tabindex", "0");
    await expect(whatsapp).toBeVisible();

    await page.getByRole("button", { name: "Cerrar opciones de contacto" }).click();
    await expect(whatsapp).toHaveAttribute("tabindex", "-1");
  });

  test("Hero: cada dot activa su propio slide, sin robarle el clic al vecino", async ({ page }) => {
    await page.goto("/");

    // Regresión real encontrada en el Ajuste 1.5: con las áreas táctiles
    // ampliadas y solapadas, un clic en el dot 1 activaba el dot 2 por
    // orden de pintado. Se prueban varios dots, no solo uno, para que esto
    // no pueda repetirse en silencio.
    for (const n of [1, 3, 5]) {
      const dot = page.getByRole("button", { name: `Ver foto/video ${n}` });
      await dot.click();
      const dotSpan = dot.locator("span");
      await expect(dotSpan).toHaveClass(/(?:^|\s)bg-white(?:$|\s)/);

      // Ningún otro dot debe quedar marcado como activo al mismo tiempo.
      for (const other of [1, 2, 3, 4, 5]) {
        if (other === n) continue;
        const otherSpan = page
          .getByRole("button", { name: `Ver foto/video ${other}` })
          .locator("span");
        await expect(otherSpan).not.toHaveClass(/(?:^|\s)bg-white(?:$|\s)/);
      }
    }
  });
});
