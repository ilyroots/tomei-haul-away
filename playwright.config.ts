import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.APP_URL ?? "http://localhost:3000";

// Disable Turnstile for E2E tests. The forms only render/require Turnstile when
// NEXT_PUBLIC_TURNSTILE_SITE_KEY is set, and the server skips verification when
// TURNSTILE_SECRET_KEY is empty in non-production environments.
process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "";
process.env.TURNSTILE_SECRET_KEY = "";
// Let the app's submission rate limiter know it is being driven by Playwright.
process.env.PLAYWRIGHT_E2E = "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
