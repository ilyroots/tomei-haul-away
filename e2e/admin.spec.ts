import { test, expect } from "@playwright/test";
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from "./global-setup";

test("admin login flow and leads list", async ({ page }) => {
  // Unauthenticated users are redirected to the login page.
  await page.goto("/admin");
  await page.waitForURL("/admin/login");
  await expect(page.getByRole("heading", { name: "Tomei Admin" })).toBeVisible();

  await page.getByLabel("Email").fill(TEST_ADMIN_EMAIL);
  await page.getByLabel("Password").fill(TEST_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  // After login the admin dashboard is shown.
  await page.waitForURL("/admin");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  // On small viewports the sidebar is a closed drawer; open it first.
  const openNav = page.getByRole("button", { name: "Open navigation" });
  if (await openNav.isVisible()) {
    await openNav.click();
  }

  // Navigate to the leads list.
  await page.getByRole("link", { name: "Leads" }).click();
  await page.waitForURL("/admin/leads");
  await expect(page.getByRole("heading", { name: /Leads/i })).toBeVisible();
});
