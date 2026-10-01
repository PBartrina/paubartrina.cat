import { test, expect } from "@playwright/test";

const NEWEST = {
  slug: "la-marca",
  title: "La marca canvia a cada desplegament",
};
const PREVIOUS = {
  slug: "cinc-mesos-de-bots-els-numeros",
  title: "Cinc mesos de bots: els números",
};

test.describe("blog navigation", () => {
  test("listing → post → adjacent post → back to listing", async ({ page }) => {
    await page.goto("/ca/blog");
    await expect(page.getByRole("heading", { level: 1, name: "Blog" })).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(5);

    await page.getByRole("link", { name: NEWEST.title }).click();

    await expect(page).toHaveURL(`/ca/blog/${NEWEST.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(NEWEST.title);
    await expect(page.getByRole("article")).toBeVisible();

    // Newest post: no "next", only "previous".
    const postNav = page.getByRole("navigation", { name: "Post navigation" });
    await expect(postNav.getByRole("link")).toHaveCount(1);
    await postNav.getByRole("link", { name: PREVIOUS.title }).click();

    await expect(page).toHaveURL(`/ca/blog/${PREVIOUS.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(PREVIOUS.title);

    await page.getByRole("link", { name: "← Tornar al blog" }).click();

    await expect(page).toHaveURL("/ca/blog");
    await expect(page.getByRole("article")).toHaveCount(5);
  });

  test("tag filter narrows the listing through the URL", async ({ page }) => {
    await page.goto("/ca/blog");

    await page.getByRole("button", { name: "dades", exact: true }).click();

    await expect(page).toHaveURL("/ca/blog?tag=dades");
    await expect(page.getByRole("article")).toHaveCount(1);
    // The only post tagged "dades" is the five-month retrospective.
    await expect(page.getByRole("link", { name: PREVIOUS.title })).toBeVisible();

    await page.getByRole("button", { name: "Tots", exact: true }).click();

    await expect(page).toHaveURL("/ca/blog");
    await expect(page.getByRole("article")).toHaveCount(5);
  });

  test("translated posts link back to the Catalan original", async ({ page }) => {
    await page.goto(`/en/blog/${NEWEST.slug}`);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.getByRole("link", { name: "Read the original in Catalan" }).click();

    await expect(page).toHaveURL(`/ca/blog/${NEWEST.slug}`);
    await expect(page.locator("html")).toHaveAttribute("lang", "ca");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(NEWEST.title);
  });

  test("an unknown slug renders the not-found page", async ({ page }) => {
    const response = await page.goto("/ca/blog/aquest-article-no-existeix");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("Article no trobat")).toBeVisible();
  });
});
