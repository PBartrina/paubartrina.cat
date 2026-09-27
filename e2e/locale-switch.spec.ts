import { test, expect } from "@playwright/test";

test.describe("locale switch", () => {
  test("switching locale keeps the route and swaps chrome", async ({ page }) => {
    await page.goto("/ca/ara");
    await expect(page.locator("html")).toHaveAttribute("lang", "ca");
    await expect(page.getByRole("link", { name: "Contacte" })).toBeVisible();

    await page.getByRole("button", { name: "Idioma: EN" }).click();

    await expect(page).toHaveURL("/en/ara");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("link", { name: "Contact" })).toBeVisible();

    const active = page.getByRole("button", { name: "Language: EN" });
    await expect(active).toBeDisabled();
    await expect(active).toHaveAttribute("aria-current", "true");

    await page.getByRole("button", { name: "Language: ES" }).click();

    await expect(page).toHaveURL("/es/ara");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.getByRole("link", { name: "Contacto" })).toBeVisible();
  });

  test("the chosen locale survives a full reload", async ({ page }) => {
    await page.goto("/ca");
    await page.getByRole("button", { name: "Idioma: EN" }).click();
    await expect(page).toHaveURL("/en");

    await page.reload();
    await expect(page).toHaveURL("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});

test.describe("locale detection at the root", () => {
  test.use({ locale: "es-ES" });

  test("/ redirects to the browser locale", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/es");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });
});
