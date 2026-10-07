import { test, expect } from "@playwright/test";

test("Groww flow with beginner features: hints → explainer → practice buy → SIP → habit → share", async ({ page }) => {
  // New user: optional hints prompt on Home
  await page.goto("/");
  await expect(page.getByTestId("welcome-sheet")).toBeVisible();
  await page.getByRole("button", { name: "Long-term wealth" }).click();
  await page.getByRole("button", { name: "Never" }).click();
  await page.getByRole("button", { name: "₹500–2k" }).click();
  await page.getByRole("button", { name: "3+ years" }).click();
  await page.getByRole("button", { name: "Turn on hints" }).click();
  await expect(page.getByTestId("practice-banner")).toBeVisible();

  // Fund page: explainer + what-if SIP card
  await page.getByRole("link", { name: "Start with ₹100" }).click();
  await expect(page.getByTestId("nav")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: /NAV ·/ }).click();
  await expect(page.getByText("For you, right now")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("what-if")).toBeVisible();

  // Stock page: practice buy next to Buy
  await page.goto("/stocks/RELIANCE.NS");
  await expect(page.getByTestId("price")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("beginner-tip")).toBeVisible();
  await page.getByRole("button", { name: /practice buy/i }).click();
  await page.getByRole("button", { name: "Confirm practice buy" }).click();
  await expect(page.getByTestId("practice-done")).toBeVisible();
  await page.getByRole("button", { name: "Skip" }).click();

  // Real-demo Buy uses the ₹25,000 demo balance (separate from Practice)
  await page.getByTestId("watch-toggle").click();
  await page.getByRole("button", { name: "Buy", exact: true }).click();
  await expect(page.getByTestId("trade-sheet-real")).toBeVisible();
  await page.getByRole("button", { name: "Confirm buy" }).click();
  await expect(page.getByTestId("order-done")).toBeVisible();

  // Practice tab shows the virtual holding
  await page.getByTestId("practice-done").click();
  await expect(page.getByTestId("holding-RELIANCE.NS")).toBeVisible();
  // "Ready to go real?" leads to the starter fund's SIP order (Start small quick-picks)
  await page.getByTestId("go-real").click();
  await expect(page).toHaveURL(/\/funds\/MF120716\/sip$/);
  await page.getByRole("button", { name: /₹250/ }).click();
  await expect(page.getByTestId("sip-amount")).toHaveValue("250");
  await page.getByRole("button", { name: /start sip/i }).click();
  await expect(page.getByText("SIP started")).toBeVisible();

  // Holdings: habit card, demo time travel → 3-month streak → share
  await page.goto("/holdings?demo=1");
  await page.getByRole("button", { name: "+1 month", exact: true }).click();
  await page.getByRole("button", { name: "+1 month", exact: true }).click();
  await expect(page.getByTestId("streak-count")).toHaveText("3");
  await page.getByRole("button", { name: /close demo controls/i }).click();
  await expect(page.getByTestId("real-RELIANCE.NS")).toBeVisible();
  await expect(page.getByTestId("wallet")).not.toHaveText("₹25,000.00");

  // Manage the SIP: pause it
  await page.getByTestId("sip-MF120716").click();
  await page.getByRole("button", { name: "Pause SIP" }).click();
  await expect(page.getByTestId("sip-status")).toHaveText("paused");
  await page.goto("/orders");
  await expect(page.getByTestId("order-row").first()).toBeVisible();
  await page.goto("/");
  await expect(page.getByTestId("watchlist")).toBeVisible();
  await page.goto("/holdings");
  await page.getByTestId("milestone-streak_3").click();
  const card = page.getByTestId("share-card");
  await expect(card).toBeVisible();
  await expect.poll(() => card.evaluate((img: HTMLImageElement) => img.naturalWidth), { timeout: 20_000 }).toBe(1080);
});
