import { test, expect } from "@playwright/test";
import { selectOptionWhenHydrated } from "./helpers";

test("quote three-step form submits and reaches thank-you", async ({ page }) => {
  await page.goto("/quote");
  await expect(page.getByRole("heading", { name: "Request a Free Quote" })).toBeVisible();

  // Step 1: The Job
  await selectOptionWhenHydrated(page, "Service type", "furniture-removal");
  await page.getByRole("button", { name: "Furniture" }).click();
  await page.getByLabel("Anything else we should know?").fill("Old couch and two chairs");
  await page.getByLabel("ZIP code").fill("92101");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  // Step 2: Contact & Address
  await page.getByLabel("First name").fill("E2E");
  await page.getByLabel("Last name").fill("Test");
  await page.getByLabel("Phone").fill("5551234567");
  await page.getByLabel("Email").fill("e2e-quote@example.com");
  await selectOptionWhenHydrated(page, "Preferred contact method", "EMAIL");
  await page.getByLabel("Street address").fill("123 Main St");
  await page.getByLabel("City").fill("San Diego");
  await expect(page.getByLabel("State")).toHaveValue("CA");
  await expect(page.getByLabel("ZIP code", { exact: true })).toHaveValue("92101");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  // Step 3: Preferred Date & Review
  await expect(page.getByText("Review your request")).toBeVisible();
  await expect(page.getByText("Old couch and two chairs")).toBeVisible();
  await expect(page.getByText(/123 Main St/)).toBeVisible();
  await expect(page.getByText(/San Diego, CA 92101/)).toBeVisible();

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
