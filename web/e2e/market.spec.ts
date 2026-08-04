import { expect, test } from "@playwright/test";

// The market grid now fetches GET /api/listings from the real backend
// (server-rendered, ISR). Content depends on what's actually in Postgres —
// there is no seed data yet (see docs/DECISIONS.md), and if the backend is
// unreachable the page falls back to a small static sample. These specs
// assert on structure/behaviour rather than specific demo listing titles.

test("visitor can browse the market page", async ({ page }) => {
  await page.goto("/market");

  await expect(page.getByRole("heading", { name: /browse live produce/i })).toBeVisible();
  await expect(page.getByText(/listings match your board/i)).toBeVisible();
});

test("filtering by category updates the URL and results", async ({ page }) => {
  await page.goto("/market");

  await page.getByLabel("Category").selectOption("Vegetables");
  await expect(page).toHaveURL(/category=Vegetables/);
  await expect(page.getByRole("button", { name: /vegetables/i })).toBeVisible();
});

test("resetting filters clears the query string", async ({ page }) => {
  await page.goto("/market?category=Fruit&region=Yorkshire");

  await page.getByRole("button", { name: /reset filters/i }).click();
  await expect(page).toHaveURL(/\/market$/);
});

test("shows either real listings or the empty state, never a broken page", async ({ page }) => {
  await page.goto("/market?q=zzz-no-such-listing-zzz");

  await expect(page.getByRole("heading", { name: /no listings match these filters/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /clear filters/i })).toBeVisible();
});
