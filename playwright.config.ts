import { defineConfig, devices } from "@playwright/test";

/**
 * E2E gate (docs/REWORK.md, milestone 1).
 *
 * Runs against `next start` on a production build, never against the Vercel
 * preview: no Deployment Protection bypass secret needed, and CI shares the
 * build with the Lighthouse step. Run `pnpm build` before `pnpm e2e` locally.
 *
 * Resend is mocked at the HTTP boundary: the SDK honours RESEND_BASE_URL, so
 * the real /api/contact route runs end to end against e2e/mock-resend.mjs.
 */

const APP_PORT = 3100;
const MOCK_RESEND_PORT = 3101;

export const APP_URL = `http://localhost:${APP_PORT}`;
export const MOCK_RESEND_URL = `http://127.0.0.1:${MOCK_RESEND_PORT}`;
export const CONTACT_EMAIL = "e2e@example.com";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : "list",
  use: {
    baseURL: APP_URL,
    // Deterministic theme baseline: the site falls back to
    // prefers-color-scheme when nothing is stored.
    colorScheme: "light",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node e2e/mock-resend.mjs",
      url: `${MOCK_RESEND_URL}/emails`,
      reuseExistingServer: !process.env.CI,
      env: { MOCK_RESEND_PORT: String(MOCK_RESEND_PORT) },
    },
    {
      command: `pnpm exec next start --port ${APP_PORT}`,
      url: `${APP_URL}/ca`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        RESEND_API_KEY: "re_e2e_mock",
        RESEND_BASE_URL: MOCK_RESEND_URL,
        CONTACT_EMAIL,
      },
    },
  ],
});
