import { expect, test } from "@playwright/test";

const widths = [320, 360, 390, 430, 768, 1024, 1280, 1440];

for (const width of widths) {
  test(`public header is usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 768 ? 900 : 1000 });
    await page.goto("/");

    await expect(page.getByRole("link", { name: /FarmNomad/i })).toBeVisible();

    const publicNav = page.getByRole("navigation", { name: "Public" });
    const header = page.getByRole("banner");
    await expect(publicNav).toBeVisible();

    for (const linkName of ["Market", "Network", "Surplus", "Sign in", "Dashboard"]) {
      await expect(publicNav.getByRole("link", { name: linkName })).toBeVisible();
    }

    const desktopMarketButton = header.getByRole("link", { name: "Browse market" });
    if (width >= 1024) {
      await expect(desktopMarketButton).toBeVisible();
    } else {
      await expect(desktopMarketButton).toBeHidden();
    }

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
