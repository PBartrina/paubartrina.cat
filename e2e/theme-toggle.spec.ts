import { test, expect, type Page } from "@playwright/test";

const html = (page: Page) => page.locator("html");
const toggle = (page: Page) =>
  page.getByRole("button", { name: "Canviar tema" });

test.describe("theme toggle", () => {
  test("flips data-theme, persists it, and toggles back", async ({ page }) => {
    await page.goto("/ca");
    await expect(html(page)).toHaveAttribute("data-theme", "light");
    await expect(toggle(page)).toHaveText("[dark]");

    await toggle(page).click();

    await expect(html(page)).toHaveAttribute("data-theme", "dark");
    await expect(toggle(page)).toHaveText("[light]");
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("theme")))
      .toBe("dark");

    // The inline init script must apply the stored theme before hydration.
    await page.reload();
    await expect(html(page)).toHaveAttribute("data-theme", "dark");

    await toggle(page).click();

    await expect(html(page)).toHaveAttribute("data-theme", "light");
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("theme")))
      .toBe("light");
  });

  test("the toggle label reflects the stored theme after reload", async ({ page }) => {
    test.fixme(true, "Server text survives hydration, label reads [dark] — see #270");

    await page.goto("/ca");
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload();

    await expect(html(page)).toHaveAttribute("data-theme", "dark");
    await expect(toggle(page)).toHaveText("[light]");
  });

  test("a stored theme wins over the system preference", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/ca");
    await expect(html(page)).toHaveAttribute("data-theme", "dark");

    await page.evaluate(() => localStorage.setItem("theme", "light"));
    await page.reload();
    await expect(html(page)).toHaveAttribute("data-theme", "light");
  });
});
