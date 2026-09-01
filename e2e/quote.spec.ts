import { test, expect } from "@playwright/test";

const futureDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split("T")[0];
};

test("quote multi-step form submits and reaches thank-you", async ({ page }) => {
  await page.goto("/quote");
  await expect(page.getByRole("heading", { name: "Request a Free Quote" })).toBeVisible();

  // Step 0: Contact
  await page.getByLabel("First name").fill("E2E");
  await page.getByLabel("Last name").fill("Test");
  await page.getByLabel("Email", { exact: true }).fill("e2e-quote@example.com");
  await page.getByLabel("Phone").fill("5551234567");
  await page.getByLabel("Preferred contact method").selectOption("EMAIL");
  await page.getByRole("button", { name: "Next" }).click();

  // Step 1: Job Location
  await page.getByLabel("Address line 1").fill("123 Test St");
  await page.getByLabel("City").fill("Haverhill");
  await page.getByLabel("State").fill("MA");
  await page.getByLabel("ZIP code").fill("01830");
  await page.getByRole("button", { name: "Next" }).click();

  // Step 2: Job Details
  await page.getByRole("button", { name: "Furniture Removal" }).click();
  await page.getByLabel("Describe the items to remove").fill("Old couch and two chairs");
  await page.getByLabel("Estimated load size").selectOption("SMALL_LOAD");
  await page.getByLabel("Property type").selectOption("RESIDENTIAL_SINGLE_FAMILY");
  await page.getByRole("button", { name: "Next" }).click();

  // Step 3: Photos (skip)
  await page.getByRole("button", { name: "Next" }).click();

  // Step 4: Timing
  await page.getByLabel("Preferred date").fill(futureDate());
  await page.getByLabel("Preferred arrival window").selectOption("MORNING");
  await page.getByRole("button", { name: "Next" }).click();

  // Step 5: Review & Consent
  await page.getByLabel("I consent to being contacted about my request").check();
  await page.getByLabel("I have read and acknowledge the privacy policy").check();
  await page.getByLabel("I understand that submitting this form does not guarantee").check();

  // The server enforces a 3-second minimum completion time.
  await page.waitForTimeout(3100);

  await page.getByRole("button", { name: "Submit Quote Request" }).click();

  // Thank-you page
  await page.waitForURL("/thank-you?ref=**", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Thank You!" })).toBeVisible();
  await expect(page.getByText(/Your reference number/)).toBeVisible();
});
