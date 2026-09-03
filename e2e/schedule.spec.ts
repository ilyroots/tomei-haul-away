import { test, expect } from "@playwright/test";

const futureDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split("T")[0];
};

test("schedule form submits and reaches thank-you", async ({ page }) => {
  await page.goto("/schedule");
  await expect(page.getByRole("heading", { name: "Schedule an Appointment" })).toBeVisible();

  await page.getByLabel("Service type").selectOption("furniture-removal");
  await page.getByLabel("ZIP code", { exact: true }).fill("92101");
  await page.getByLabel("Preferred date").fill(futureDate());
  await page.getByLabel("Arrival window").selectOption("AFTERNOON");

  await page.getByLabel("Name", { exact: true }).fill("E2E Scheduler");
  await page.getByLabel("Email", { exact: true }).fill("e2e-schedule@example.com");
  await page.getByLabel("Phone").fill("5559876543");

  await page.getByLabel("Address line 1").fill("456 Test Ave");
  await page.getByLabel("Address line 2").fill("Apt 2");
  await page.getByLabel("City").fill("San Diego");
  await page.getByLabel("State").fill("CA");
  await page.getByLabel("ZIP", { exact: true }).fill("92101");

  await page.getByLabel("Notes").fill("Please call when arriving.");

  // The server enforces a 3-second minimum completion time.
  await page.waitForTimeout(3100);

  await page.getByRole("button", { name: "Request Appointment" }).click();

  await page.waitForURL("/thank-you?ref=**&scheduled=true", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Thank You!" })).toBeVisible();
  await expect(page.getByText(/Your reference number/)).toBeVisible();
  await expect(page.getByText(/appointment request/)).toBeVisible();
});
