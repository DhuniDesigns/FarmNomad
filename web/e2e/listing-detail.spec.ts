import { expect, test } from "@playwright/test";

// GET /api/listings/{id} is now real (see docs/DECISIONS.md), but local
// Postgres has no seed data yet, so we can't assert on a specific known
// listing. These specs cover the parts that don't depend on real data: the
// 404 page for missing/malformed ids, and — conditionally, only if the
// market happens to have listings — that a real detail page renders and the
// auth-gated CTA redirects with returnTo preserved (Phase 2.3).

test("unknown listing id shows the not-found page, not a crash", async ({ page }) => {
  await page.goto("/market/00000000-0000-4000-8000-000000000000");

  await expect(page.getByRole("heading", { name: /listing not found/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /back to market/i })).toBeVisible();
});

test("malformed listing id shows the not-found page rather than an error page", async ({ page }) => {
  await page.goto("/market/not-a-real-id");

  await expect(page.getByRole("heading", { name: /listing not found/i })).toBeVisible();
});

test("a real listing's order CTA redirects to login with returnTo preserved", async ({ page }) => {
  await page.goto("/market");

  const firstListing = page.locator("main a[href^='/market/']").first();
  const hasListings = (await firstListing.count()) > 0;
  test.skip(!hasListings, "No listings in the local database yet — nothing to click through to.");

  await firstListing.click();
  await expect(page).toHaveURL(/\/market\/[^/]+/);
  const listingPath = new URL(page.url()).pathname;

  // Not sold out listings show a sign-in CTA; sold-out ones show an
  // unavailable message instead — either is a valid outcome here.
  const signInCta = page.getByRole("link", { name: /sign in to (order|claim this surplus)/i });
  if (!(await signInCta.isVisible().catch(() => false))) {
    await expect(page.getByText(/sold out and can't be ordered right now/i)).toBeVisible();
    return;
  }

  await signInCta.click();
  await expect(page).toHaveURL(/\/login\?returnTo=/);
  const returnTo = new URL(page.url()).searchParams.get("returnTo") ?? "";
  expect(decodeURIComponent(returnTo)).toContain(listingPath);
});
