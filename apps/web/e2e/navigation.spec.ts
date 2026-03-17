import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("/ redirects to /dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("Dashboard link loads dashboard page", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("Tasks link loads tasks page", async ({ page }) => {
    await page.goto("/tasks");
    await expect(page).toHaveURL(/\/tasks/);
    await expect(page.locator("h1")).toContainText("Tasks");
  });

  test("Kanban link loads kanban page", async ({ page }) => {
    await page.goto("/tasks/kanban");
    await expect(page).toHaveURL(/\/tasks\/kanban/);
    await expect(page.locator("h1")).toContainText("Kanban");
  });

  test("Gantt link loads gantt page", async ({ page }) => {
    await page.goto("/gantt");
    await expect(page).toHaveURL(/\/gantt/);
    await expect(page).not.toHaveTitle(/error/i);
  });

  test("Members link loads members page", async ({ page }) => {
    await page.goto("/members");
    await expect(page).toHaveURL(/\/members/);
    await expect(page).not.toHaveTitle(/error/i);
  });

  test("Projects link loads projects page", async ({ page }) => {
    await page.goto("/projects");
    await expect(page).toHaveURL(/\/projects/);
    await expect(page).not.toHaveTitle(/error/i);
  });
});
