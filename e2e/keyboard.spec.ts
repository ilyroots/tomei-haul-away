import { test, expect } from "@playwright/test";

test("keyboard navigation through quote form", async ({ page }) => {
  await page.goto("/quote");
  await expect(page.getByRole("heading", { name: "Request a Free Quote" })).toBeVisible();

  // Step 1: The Job
  await page.getByLabel("ZIP code").focus();
  await page.keyboard.type("92101");
  await page.getByLabel("Service type").selectOption("furniture-removal");

  // Activate a removal-item chip with the keyboard.
  await page.getByRole("button", { name: "Appliances", exact: true }).focus();
  await page.keyboard.press("Space");

  await page.getByLabel("Anything else we should know?").fill("Keyboard navigation test items");

  // Tab to the Next button and activate it.
  await page.getByRole("button", { name: "Next" }).focus();
  await page.keyboard.press("Enter");

  // Step 2: Contact & Timing
  await expect(page.getByRole("heading", { name: "How do we reach you?" })).toBeVisible();
  await page.getByLabel("First name").fill("E2E");
  await page.getByLabel("Last name").fill("Keyboard");
  await page.getByLabel("Phone").fill("5551112222");
  await page.getByLabel("Email", { exact: true }).fill("e2e-keyboard@example.com");
  await page.getByLabel("Preferred contact method").selectOption("EMAIL");

  await expect(page.getByText("Job summary")).toBeVisible();

  await page.getByLabel("I consent to being contacted about my request").check();
  await page.getByLabel("I have read and acknowledge the privacy policy").check();
  await page.getByLabel("I understand that submitting this form does not guarantee").check();

  // The server enforces a minimum completion time.
  await page.waitForTimeout(3100);

  await page.getByRole("button", { name: "Submit Quote Request" }).click();

  await page.waitForURL("/thank-you?ref=**", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Thank You!" })).toBeVisible();
});
