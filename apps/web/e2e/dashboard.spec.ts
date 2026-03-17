import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("Dashboard loads", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("Page title is visible", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("Stats bar is visible", async ({ page }) => {
    await page.goto("/dashboard");
    // Stats grid contains stat cards with labels
    await expect(page.locator("text=전체").first()).toBeVisible();
    await expect(page.locator("text=진행중").first()).toBeVisible();
    await expect(page.locator("text=완료").first()).toBeVisible();
  });
});
