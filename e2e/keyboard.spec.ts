import { test, expect } from "@playwright/test";
import { selectOptionWhenHydrated } from "./helpers";

test("keyboard navigation through quote form", async ({ page }) => {
  await page.goto("/quote");
  await expect(page.getByRole("heading", { name: "Request a Free Quote" })).toBeVisible();

  // Step 1: The Job
  await page.getByLabel("ZIP code").focus();
  await page.keyboard.type("92101");
  await selectOptionWhenHydrated(page, "Service type", "furniture-removal");

  // Activate a removal-item chip with the keyboard.
  const appliances = page.getByRole("button", { name: "Appliances", exact: true });
  await appliances.focus();
  await page.keyboard.press("Space");
  await expect(appliances).toHaveAttribute("aria-pressed", "true");

  await page.getByLabel("Anything else we should know?").fill("Keyboard navigation test items");

  // Tab to the Next button and activate it.
  const next = page.getByRole("button", { name: "Next", exact: true });
  await next.focus();
  await page.keyboard.press("Enter");

  // Step 2: Contact & Address
  await expect(page.getByRole("heading", { name: "How do we reach you?" })).toBeVisible();
  await page.getByLabel("First name").fill("E2E");
  await page.getByLabel("Last name").fill("Keyboard");
  await page.getByLabel("Phone").fill("5551112222");
  await page.getByLabel("Email").fill("e2e-keyboard@example.com");
  await selectOptionWhenHydrated(page, "Preferred contact method", "EMAIL");
  await page.getByLabel("Street address").fill("123 Main St");
  await page.getByLabel("City").fill("San Diego");
  await expect(page.getByLabel("State")).toHaveValue("CA");

  await next.focus();
  await page.keyboard.press("Enter");

  // Step 3: Preferred Date & Review
  await expect(page.getByRole("heading", { name: "Preferred date & review" })).toBeVisible();
  await expect(page.getByText("Keyboard navigation test items")).toBeVisible();

  await page.getByLabel("I consent to being contacted about my request").check();
  await page.getByLabel("I have read and acknowledge the privacy policy").check();
  await page.getByLabel("I understand that submitting this form does not guarantee").check();

  // The server enforces a minimum completion time.
  await page.waitForTimeout(3100);

  await page.getByRole("button", { name: "Submit Quote Request" }).click();

  await page.waitForURL("/thank-you?ref=**", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Thank You!" })).toBeVisible();
});
