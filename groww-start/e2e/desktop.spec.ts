import { test, expect } from "@playwright/test";
import { ROUTES } from "./routes";

test.use({ viewport: { width: 1280, height: 800 } });

test("desktop: sidebar nav, no tab bar, order panel beside the chart, no overflow", async ({ page }) => {
  test.setTimeout(180_000);
  await page.addInitScript(() => localStorage.setItem("groww-genz", JSON.stringify({ version: 3, state: { welcomeSeen: true } })));
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Sidebar" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();
  await page.goto("/stocks/RELIANCE.NS");
  await expect(page.getByTestId("price")).toBeVisible({ timeout: 20_000 });
  const price = await page.getByTestId("price").boundingBox();
  const panel = await page.getByTestId("order-panel").boundingBox();
  expect(panel!.x).toBeGreaterThan(price!.x + 300);
  for (const r of ROUTES) {
    await page.goto(r, { waitUntil: "networkidle" });
    const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(o, r).toBe(0);
  }
});
