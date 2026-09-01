import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 375, height: 667 } });

test("mobile hamburger menu opens and closes, bottom bar is visible", async ({ page }) => {
  await page.goto("/");

  const menuButton = page.getByRole("button", { name: /Open menu|Close menu/ });
  await expect(menuButton).toBeVisible();

  // Mobile primary nav is hidden initially.
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();

  await menuButton.click();
  await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Services" })).toBeVisible();

  await menuButton.click();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Mobile" })).toBeHidden();

  // Bottom quick-contact bar is visible on mobile only.
  const bottomBar = page.getByRole("toolbar", { name: "Quick contact" });
  await expect(bottomBar).toBeVisible();
  await expect(bottomBar.getByRole("link", { name: "Call" })).toBeVisible();
  await expect(bottomBar.getByRole("link", { name: "Text" })).toBeVisible();
  await expect(bottomBar.getByRole("link", { name: "Free Quote" })).toBeVisible();
});
