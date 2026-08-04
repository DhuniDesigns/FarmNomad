import { expect, test } from "@playwright/test";

test("visitor sees the FarmNomad landing page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /move local food before it spoils/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /browse market/i }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /the platform shape matches the real food chain/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /good food should have a second route/i })).toBeVisible();
  await expect(page.getByText(/UK AgriTech marketplace, surplus, and logistics/i)).toBeVisible();
});
