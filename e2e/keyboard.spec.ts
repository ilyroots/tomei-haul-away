import { test, expect } from "@playwright/test";

const futureDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split("T")[0];
};

test("keyboard navigation through quote form", async ({ page }) => {
  await page.goto("/quote");
  await expect(page.getByRole("heading", { name: "Request a Free Quote" })).toBeVisible();

  // Focus the first field and tab through the contact step.
  await page.getByLabel("First name").focus();
  await page.keyboard.press("Tab");
  await page.keyboard.type("E2E");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Keyboard");
  await page.keyboard.press("Tab");
  await page.keyboard.type("e2e-keyboard@example.com");
  await page.keyboard.press("Tab");
  await page.keyboard.type("5551112222");

  // Tab to the contact preference select and choose email with arrow keys.
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowDown");

  // Tab to the Next button and activate it.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");

  // Step 1: Job Location
  await expect(page.getByRole("heading", { name: "Job Location" })).toBeVisible();
  await page.keyboard.type("123 Test St");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Apt 1");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Haverhill");
  await page.keyboard.press("Tab");
  await page.keyboard.type("MA");
  await page.keyboard.press("Tab");
  await page.keyboard.type("01830");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");

  // Step 2: Job Details
  await expect(page.getByRole("heading", { name: "Job Details" })).toBeVisible();

  // Tab to a service toggle button and activate it with Space.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");

  await page.keyboard.press("Tab");
  await page.keyboard.type("Keyboard navigation test items");

  // Move to Next and submit step.
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
  }
  await page.keyboard.press("Enter");

  // Step 3: Photos (skip)
  await expect(page.getByRole("heading", { name: "Photos" })).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");

  // Step 4: Timing
  await expect(page.getByRole("heading", { name: "Timing" })).toBeVisible();
  await page.getByLabel("Preferred date").fill(futureDate());
  await page.getByLabel("Preferred arrival window").selectOption("ANYTIME");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");

  // Step 5: Review & Consent
  await expect(page.getByRole("heading", { name: "Review & Consent" })).toBeVisible();
  await page.getByLabel("I consent to being contacted about my request").check();
  await page.getByLabel("I have read and acknowledge the privacy policy").check();
  await page.getByLabel("I understand that submitting this form does not guarantee").check();

  // The server enforces a 3-second minimum completion time.
  await page.waitForTimeout(3100);

  await page.getByRole("button", { name: "Submit Quote Request" }).click();

  await page.waitForURL("/thank-you?ref=**", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Thank You!" })).toBeVisible();
});
