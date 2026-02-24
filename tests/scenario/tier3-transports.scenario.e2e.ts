import { test, expect } from "@playwright/test";
import { cursorClick, hold, settle, showCursor } from "../helpers.js";

test.describe("Tier 3 — Transports & UI Integration Proofs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo/");
    await page.waitForLoadState("networkidle");
    await showCursor(page);
    await settle(page);
  });

  test("Browser UI renders Kanban board with columns and cards", async ({ page }) => {
    const columns = page.locator("[data-testid='kanban-column']");
    await expect(columns.first()).toBeVisible();
    const count = await columns.count();
    expect(count).toBeGreaterThanOrEqual(2);
    await hold(page);
  });

  test("Browser UI supports theme toggle (light/dark)", async ({ page }) => {
    const themeToggle = page.getByRole("button", { name: /switch to/i });
    await expect(themeToggle).toBeVisible();

    await cursorClick(page, themeToggle);
    await settle(page);
    await hold(page);

    await cursorClick(page, themeToggle);
    await settle(page);
    await hold(page);
  });

  test("Full board CRUD workflow through the React UI", async ({ page }) => {
    const toggleBtn = page.getByTestId("toggle-api-log");
    await cursorClick(page, toggleBtn);
    await settle(page);

    const addColumnButton = page.getByRole("button", { name: /add column/i });
    await cursorClick(page, addColumnButton);
    await settle(page);

    const colInput = page.getByPlaceholder("Column title...");
    await cursorClick(page, colInput);
    await colInput.fill("Tier3 Column");
    await hold(page);

    await cursorClick(
      page,
      page
        .locator("div")
        .filter({ has: page.getByPlaceholder("Column title...") })
        .getByRole("button", { name: "Add column" }),
    );
    await settle(page);

    const newColumn = page
      .locator("[data-testid='kanban-column']")
      .filter({ hasText: "Tier3 Column" });
    await expect(newColumn).toBeVisible();
    await hold(page);

    await cursorClick(page, newColumn.getByRole("button", { name: /add card/i }));
    await settle(page);
    const cardInput = newColumn.getByPlaceholder("Card title...");
    await cursorClick(page, cardInput);
    await cardInput.fill("HTTP Transport Task");
    await cursorClick(page, newColumn.getByRole("button", { name: "Add" }));
    await settle(page);

    await expect(newColumn.getByText("HTTP Transport Task")).toBeVisible();
    await hold(page);

    const logEntries = page.getByTestId("api-log-entry");
    await expect(logEntries.first()).toBeVisible();
    await hold(page);
  });

  test("no console errors during full interaction", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState("networkidle");
    await showCursor(page);
    await settle(page);

    const columns = page.locator("[data-testid='kanban-column']");
    await expect(columns.first()).toBeVisible();

    const backlogColumn = page
      .locator("[data-testid='kanban-column']")
      .filter({ hasText: "Backlog" });

    await cursorClick(page, backlogColumn.getByRole("button", { name: /add card/i }));
    await settle(page);
    const input = backlogColumn.getByPlaceholder("Card title...");
    await cursorClick(page, input);
    await input.fill("No-error card");
    await cursorClick(page, backlogColumn.getByRole("button", { name: "Add" }));
    await settle(page);

    expect(consoleErrors).toEqual([]);
    await hold(page);
  });
});
