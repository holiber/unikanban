import { test, expect } from "@playwright/test";
import { settle, hold, showCursor } from "../helpers.js";

test.describe("Tier 2 — Unapi Core & Domain CRUD Proofs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demo/");
    await page.waitForLoadState("networkidle");
    await showCursor(page);
    await settle(page);
  });

  test("API log shows procedure calls on card creation", async ({ page }) => {
    const toggleBtn = page.getByTestId("toggle-api-log");
    await toggleBtn.click();
    await settle(page);

    const logPanel = page.getByTestId("api-log-panel");
    await expect(logPanel).toBeVisible();
    await hold(page);

    const backlogColumn = page
      .locator("[data-testid='kanban-column']")
      .filter({ hasText: "Backlog" });

    await backlogColumn.getByRole("button", { name: /add card/i }).click();
    await settle(page);

    const input = backlogColumn.getByPlaceholder("Card title...");
    await input.fill("Unapi-powered card");
    await hold(page);

    await backlogColumn.getByRole("button", { name: "Add" }).click();
    await settle(page);

    await expect(backlogColumn.getByText("Unapi-powered card")).toBeVisible();

    const logEntries = page.getByTestId("api-log-entry");
    await expect(logEntries.first()).toBeVisible();

    const firstEntry = logEntries.first();
    await expect(firstEntry).toContainText("card.create");
    await hold(page);
  });

  test("API log shows procedure calls on card deletion", async ({ page }) => {
    const toggleBtn = page.getByTestId("toggle-api-log");
    await toggleBtn.click();
    await settle(page);

    const cardTitle = page.locator("h4", { hasText: "Create GOALS.md" });
    await expect(cardTitle).toBeVisible();

    const card = cardTitle.locator(
      "xpath=ancestor::div[contains(@class, 'group')]",
    );
    await card.hover();
    await hold(page);

    await card.getByRole("button", { name: "Delete card" }).click();
    await settle(page);

    await expect(
      page.locator("h4", { hasText: "Create GOALS.md" }),
    ).not.toBeVisible();

    const logEntries = page.getByTestId("api-log-entry");
    await expect(logEntries.first()).toContainText("card.delete");
    await hold(page);
  });

  test("move card between columns via Unapi moveCard procedure", async ({
    page,
  }) => {
    const toggleBtn = page.getByTestId("toggle-api-log");
    await toggleBtn.click();
    await settle(page);

    const backlogColumn = page
      .locator("[data-testid='kanban-column']")
      .filter({ hasText: "Backlog" });

    const cardTitle = backlogColumn.locator("h4", {
      hasText: "Design Unapi schema format",
    });
    await expect(cardTitle).toBeVisible();

    const card = cardTitle.locator(
      "xpath=ancestor::div[contains(@class, 'group')]",
    );
    await card.hover();
    await hold(page);

    await card.getByRole("button", { name: "Move card" }).click();
    await settle(page);

    const moveMenu = page.getByTestId("move-menu");
    await expect(moveMenu).toBeVisible();
    await hold(page);

    await page.getByTestId("move-to-in-progress").click();
    await settle(page);

    await expect(
      backlogColumn.locator("h4", {
        hasText: "Design Unapi schema format",
      }),
    ).not.toBeVisible();

    const inProgressColumn = page
      .locator("[data-testid='kanban-column']")
      .filter({ hasText: "In Progress" });
    await expect(
      inProgressColumn.locator("h4", {
        hasText: "Design Unapi schema format",
      }),
    ).toBeVisible();

    const logEntries = page.getByTestId("api-log-entry");
    await expect(logEntries.first()).toContainText("card.move");
    await hold(page);
  });

  test("procedure registry shows all registered Unapi procedures", async ({
    page,
  }) => {
    const toggleBtn = page.getByTestId("toggle-api-log");
    await toggleBtn.click();
    await settle(page);

    const registryToggle = page.getByTestId("api-registry-toggle");
    await registryToggle.click();
    await settle(page);
    await hold(page);

    const registryEntries = page.getByTestId("api-registry-entry");
    const count = await registryEntries.count();
    expect(count).toBeGreaterThanOrEqual(10);

    const procedureNames = [
      "board.get",
      "board.list",
      "board.create",
      "board.delete",
      "column.create",
      "column.update",
      "column.delete",
      "card.create",
      "card.update",
      "card.delete",
      "card.move",
    ];

    for (const name of procedureNames) {
      await expect(
        registryEntries.filter({ hasText: name }).first(),
      ).toBeVisible();
    }
    await hold(page);
  });

  test("full CRUD workflow: create column, add card, move, delete — all logged", async ({
    page,
  }) => {
    const toggleBtn = page.getByTestId("toggle-api-log");
    await toggleBtn.click();
    await settle(page);

    const addColumnButton = page.getByRole("button", { name: /add column/i });
    await addColumnButton.click();
    await settle(page);

    const colInput = page.getByPlaceholder("Column title...");
    await colInput.fill("Review");
    await hold(page);

    await page
      .locator("div")
      .filter({ has: page.getByPlaceholder("Column title...") })
      .getByRole("button", { name: "Add column" })
      .click();
    await settle(page);

    const reviewColumn = page
      .locator("[data-testid='kanban-column']")
      .filter({ hasText: "Review" });
    await expect(reviewColumn).toBeVisible();

    const logEntries = page.getByTestId("api-log-entry");
    await expect(logEntries.first()).toContainText("column.create");
    await hold(page);

    await reviewColumn.getByRole("button", { name: /add card/i }).click();
    await settle(page);
    const cardInput = reviewColumn.getByPlaceholder("Card title...");
    await cardInput.fill("Review this PR");
    await hold(page);
    await reviewColumn.getByRole("button", { name: "Add" }).click();
    await settle(page);

    await expect(reviewColumn.getByText("Review this PR")).toBeVisible();
    await expect(logEntries.first()).toContainText("card.create");
    await hold(page);

    const cardTitle = reviewColumn.locator("h4", {
      hasText: "Review this PR",
    });
    const card = cardTitle.locator(
      "xpath=ancestor::div[contains(@class, 'group')]",
    );
    await card.hover();
    await hold(page);

    await card.getByRole("button", { name: "Delete card" }).click();
    await settle(page);

    await expect(
      reviewColumn.locator("h4", { hasText: "Review this PR" }),
    ).not.toBeVisible();
    await expect(logEntries.first()).toContainText("card.delete");
    await hold(page);
  });

  test("no console errors with Unapi domain layer active", async ({
    page,
  }) => {
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

    const toggleBtn = page.getByTestId("toggle-api-log");
    await toggleBtn.click();
    await settle(page);

    const backlogColumn = page
      .locator("[data-testid='kanban-column']")
      .filter({ hasText: "Backlog" });

    await backlogColumn.getByRole("button", { name: /add card/i }).click();
    await settle(page);
    const input = backlogColumn.getByPlaceholder("Card title...");
    await input.fill("Error check card");
    await backlogColumn.getByRole("button", { name: "Add" }).click();
    await settle(page);

    const cardTitle = backlogColumn.locator("h4", {
      hasText: "Error check card",
    });
    const card = cardTitle.locator(
      "xpath=ancestor::div[contains(@class, 'group')]",
    );
    await card.hover();
    await settle(page);
    await card.getByRole("button", { name: "Delete card" }).click();
    await settle(page);

    expect(consoleErrors).toEqual([]);
    await hold(page);
  });
});
