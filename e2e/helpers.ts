import { expect, type Page } from "@playwright/test";

/**
 * Select an option in a React-controlled <select> and verify the value sticks.
 *
 * Under parallel test load the dev server can hydrate the page after Playwright
 * has already set the native select value; hydration then clobbers the selection
 * back to the controlled value (""), silently dropping the change. Re-selecting
 * inside an auto-retrying assertion converges once hydration has completed.
 */
export async function selectOptionWhenHydrated(
  page: Page,
  label: string,
  value: string
): Promise<void> {
  const select = page.getByLabel(label);
  await expect(async () => {
    await select.selectOption(value);
    await expect(select).toHaveValue(value);
  }).toPass({ timeout: 15_000 });
}
