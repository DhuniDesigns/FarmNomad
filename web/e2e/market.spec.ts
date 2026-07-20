import { expect, test } from "@playwright/test";

test("visitor can browse market listings", async ({ page }) => {
  await page.goto("/market");

  await expect(page.getByRole("heading", { name: /browse produce/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /seasonal vegetable box/i })).toBeVisible();
});
