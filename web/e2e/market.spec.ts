import { expect, test } from "@playwright/test";

test("visitor can browse market listings", async ({ page }) => {
  await page.goto("/market");

  await expect(page.getByRole("heading", { name: /browse live produce/i })).toBeVisible();
  await expect(page.getByText(/bread trays/i).first()).toBeVisible();
});
