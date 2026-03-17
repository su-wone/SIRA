import { test, expect } from "@playwright/test";

test.describe("Tasks", () => {
  test("Tasks page loads and shows task table", async ({ page }) => {
    await page.goto("/tasks");
    await expect(page.locator("h1")).toContainText("Tasks");
    // Table should be present
    await expect(page.locator("table")).toBeVisible();
    // Table headers should be present
    await expect(page.locator("thead")).toBeVisible();
  });

  test("Kanban page loads and shows columns", async ({ page }) => {
    await page.goto("/tasks/kanban");
    await expect(page.locator("h1")).toContainText("Kanban");

    const columns = ["backlog", "todo", "in_progress", "review", "done"];
    for (const col of columns) {
      await expect(page.locator(`text=${col}`).first()).toBeVisible();
    }
  });
});
