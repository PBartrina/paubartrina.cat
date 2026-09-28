import { test, expect, type Page } from "@playwright/test";
import { CONTACT_EMAIL, MOCK_RESEND_URL } from "../playwright.config";

type RecordedEmail = {
  to: string | string[];
  subject: string;
  html: string;
  reply_to?: string | string[];
};

// The mock inbox is shared by every worker, so each test tags its submission
// with a unique name and only ever looks at its own emails. No resets needed.
function uniqueName(testInfo: { testId: string }) {
  // testId is "<file hash>-<test hash>"; only the second half varies per test.
  return `Prova E2E ${testInfo.testId.split("-").pop()}`;
}

async function emailsFrom(page: Page, name: string): Promise<RecordedEmail[]> {
  const res = await page.request.get(`${MOCK_RESEND_URL}/emails`);
  const all = (await res.json()) as RecordedEmail[];
  return all.filter((e) => e.subject.includes(name));
}

async function fillForm(
  page: Page,
  { name, email, message }: { name: string; email: string; message: string },
) {
  await page.getByLabel("Nom", { exact: false }).fill(name);
  await page.getByLabel("Correu electrònic").fill(email);
  await page.getByLabel("Missatge").fill(message);
}

const submit = (page: Page) =>
  page.getByRole("button", { name: "Envia el missatge →" });

test.describe("contact form", () => {
  test.beforeEach(async ({ page }) => {
    // /api/contact rate-limits 5 requests per IP per 15 minutes in memory.
    // Every test run gets its own forwarded IP so the suite never trips the
    // limiter it is not here to test, whatever the worker count or retries.
    const octet = () => 1 + Math.floor(Math.random() * 254);
    await page.setExtraHTTPHeaders({
      "x-forwarded-for": `10.${octet()}.${octet()}.${octet()}`,
    });
    await page.goto("/ca/contacte");
  });

  test("a valid submission reaches Resend and shows the success state", async ({
    page,
  }, testInfo) => {
    const name = uniqueName(testInfo);
    await fillForm(page, {
      name,
      email: "prova@example.com",
      message: "Hola Pau,\nmissatge de prova.",
    });
    await submit(page).click();

    await expect(page.getByText("Missatge enviat correctament!")).toBeVisible();
    await expect(page.getByText("Et respondré tan aviat com pugui.")).toBeVisible();

    const emails = await emailsFrom(page, name);
    expect(emails).toHaveLength(1);
    const [email] = emails;
    expect([email.to].flat()).toContain(CONTACT_EMAIL);
    expect(String(email.reply_to)).toContain("prova@example.com");
    expect(email.html).toContain("Hola Pau,<br>missatge de prova.");

    await page.getByRole("button", { name: "Envia un altre missatge" }).click();
    await expect(submit(page)).toBeVisible();
    await expect(page.getByLabel("Nom", { exact: false })).toHaveValue("");
  });

  test("server-side validation errors are shown and nothing is sent", async ({
    page,
  }, testInfo) => {
    const name = uniqueName(testInfo);
    await fillForm(page, { name, email: "no-es-un-correu", message: "Hola" });
    await submit(page).click();

    await expect(
      page.getByText("Cal indicar un correu electrònic vàlid."),
    ).toBeVisible();
    await expect(submit(page)).toBeEnabled();
    expect(await emailsFrom(page, name)).toHaveLength(0);
  });

  test("a Resend failure surfaces as a retryable error", async ({
    page,
  }, testInfo) => {
    const name = uniqueName(testInfo);
    await page.request.post(`${MOCK_RESEND_URL}/__mock/fail`, {
      data: { subjectIncludes: name },
    });
    await fillForm(page, { name, email: "prova@example.com", message: "Hola" });
    await submit(page).click();

    await expect(
      page.getByText("No s'ha pogut enviar el missatge. Torna-ho a intentar."),
    ).toBeVisible();
    await expect(submit(page)).toBeEnabled();
    expect(await emailsFrom(page, name)).toHaveLength(0);
  });
});
