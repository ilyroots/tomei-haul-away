import { test, expect } from "@playwright/test";

test("quote two-step form submits and reaches thank-you", async ({ page }) => {
  await page.goto("/quote");
  await expect(page.getByRole("heading", { name: "Request a Free Quote" })).toBeVisible();

  // Step 1: The Job
  await page.getByLabel("ZIP code").fill("92101");
  await page.getByLabel("Service type").selectOption("furniture-removal");
  await page.getByRole("button", { name: "Furniture" }).click();
  await page.getByLabel("Anything else we should know?").fill("Old couch and two chairs");
  await page.getByRole("button", { name: "Next" }).click();

  // Step 2: Contact & Timing
  await page.getByLabel("First name").fill("E2E");
  await page.getByLabel("Last name").fill("Test");
  await page.getByLabel("Phone").fill("5551234567");
  await page.getByLabel("Email", { exact: true }).fill("e2e-quote@example.com");
  await page.getByLabel("Preferred contact method").selectOption("EMAIL");

  await expect(page.getByText("Job summary")).toBeVisible();

  await page.getByLabel("I consent to being contacted about my request").check();
  await page.getByLabel("I have read and acknowledge the privacy policy").check();
  await page.getByLabel("I understand that submitting this form does not guarantee").check();

  // The server enforces a minimum completion-time check.
  await page.waitForTimeout(3100);

  await page.getByRole("button", { name: "Submit Quote Request" }).click();

  // Thank-you page
  await page.waitForURL("/thank-you?ref=**", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Thank You!" })).toBeVisible();
  await expect(page.getByText(/Your reference number/)).toBeVisible();
});
