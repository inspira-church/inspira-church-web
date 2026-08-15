import { expect, test } from "@playwright/test";

test.describe("Protección del panel administrativo", () => {
  test("/admin sin sesión redirige a /admin/login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("/admin/usuarios sin sesión redirige a /admin/login con next", async ({ page }) => {
    await page.goto("/admin/usuarios");
    await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fusuarios/);
  });

  test("/admin/configuracion sin sesión redirige a /admin/login", async ({ page }) => {
    await page.goto("/admin/configuracion");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("/admin/login es accesible directamente y muestra el formulario", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByLabel("Correo")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
  });

  test("las páginas de admin no son indexables", async ({ page }) => {
    await page.goto("/admin/login");
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute("content", /noindex/);
  });

  test("credenciales incorrectas muestran un error sin entrar al panel", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Correo").fill("correo-que-no-existe@example.com");
    await page.getByLabel("Contraseña").fill("contraseña-incorrecta");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page.getByText(/correo o contraseña incorrectos/i)).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
