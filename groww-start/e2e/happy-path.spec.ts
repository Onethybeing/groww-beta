import { test, expect } from "@playwright/test";

test("Learn → Practice → Invest → Build → Share", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /start here/i }).click();

  // Onboarding
  await page.getByRole("button", { name: /long-term wealth/i }).click();
  await page.getByRole("button", { name: "FD or RD" }).click();
  await page.getByRole("button", { name: /₹500 – ₹2,000/ }).click();
  await page.getByRole("button", { name: /wait it out/i }).click();
  await page.getByRole("button", { name: /3\+ years/i }).click();
  await page.getByRole("button", { name: /save my goal/i }).click();
  await expect(page.getByTestId("persona-title")).toHaveText("Steady Starter");

  // Learn
  await page.getByRole("link", { name: /start lesson 1/i }).click();
  for (let i = 0; i < 4; i++) await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "4 units" }).click();
  await page.getByRole("button", { name: /finish lesson/i }).click();
  await expect(page.getByText(/practice unlocked/i)).toBeVisible();

  // Practice: Time Machine
  await page.getByRole("link", { name: /go to practice/i }).click();
  await page.getByRole("button", { name: "Replay" }).click();
  await expect(page.getByTestId("tm-result")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Skip" }).click();

  // Practice: Mock buy
  await page.getByRole("tab", { name: /mock portfolio/i }).click();
  await page.getByTestId("instrument-RELIANCE.NS").click({ timeout: 20_000 });
  await page.getByRole("button", { name: "Confirm buy" }).click();
  await expect(page.getByTestId("holding-RELIANCE.NS")).toBeVisible();

  // Invest
  await page.goto("/invest");
  await page.getByRole("radio", { name: /₹250/ }).click();
  for (let i = 0; i < 2; i++) await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /confirm with upi/i }).click();
  await expect(page.getByText("First investment done")).toBeVisible();

  // Build: demo time travel
  await page.goto("/progress?demo=1");
  await page.getByRole("button", { name: "+1 month", exact: true }).click();
  await page.getByRole("button", { name: "+1 month", exact: true }).click();
  await expect(page.getByTestId("streak-count")).toHaveText("3");
  await expect(page.getByTestId("milestone-streak_3")).toHaveAttribute("data-achieved", "true");

  // Share
  await page.getByRole("button", { name: /close demo controls/i }).click();
  await page.getByTestId("milestone-streak_3").click();
  const card = page.getByTestId("share-card");
  await expect(card).toBeVisible();
  await expect.poll(() => card.evaluate((img: HTMLImageElement) => img.naturalWidth), { timeout: 20_000 }).toBe(1080);
});
