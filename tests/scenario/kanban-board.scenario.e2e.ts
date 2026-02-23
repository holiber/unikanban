import { test, expect } from "@playwright/test";
import { breath, settle } from "../helpers.js";

test.describe("UniKanban Board — Video Proofs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await settle(page);
  });

  test("board loads with header, columns, and cards", async ({ page }) => {
    await expect(page.locator("h1")).toHaveText("UniKanban");

    const columns = page.locator("h3");
    await expect(columns).toHaveCount(4);
    await expect(columns.nth(0)).toHaveText("Backlog");
    await expect(columns.nth(1)).toHaveText("To Do");
    await expect(columns.nth(2)).toHaveText("In Progress");
    await expect(columns.nth(3)).toHaveText("Done");

    await expect(page.getByText("Design Unapi schema format")).toBeVisible();
    await expect(page.getByText("Research transport options")).toBeVisible();
    await expect(page.getByText("Implement CLI wrapper")).toBeVisible();
    await expect(page.getByText("Project scaffolding")).toBeVisible();
    await expect(page.getByText("Create GOALS.md")).toBeVisible();
    await breath(page);

    const badges = page.locator("span", { hasText: /^(high|medium|low)$/ });
    await expect(badges.first()).toBeVisible();
    await breath(page);

    await expect(page.locator("body")).not.toHaveText(/error/i);
    await settle(page);
  });

  test("theme toggle switches between light and dark mode", async ({
    page,
  }) => {
    const themeButton = page.getByRole("button", { name: /switch to/i });
    await expect(themeButton).toBeVisible();
    await settle(page);

    const html = page.locator("html");
    const initialHasDark = await html.evaluate((el) =>
      el.classList.contains("dark"),
    );

    await themeButton.click();
    await settle(page);

    const afterFirstToggle = await html.evaluate((el) =>
      el.classList.contains("dark"),
    );
    expect(afterFirstToggle).toBe(!initialHasDark);
    await breath(page);

    await themeButton.click();
    await settle(page);

    const afterSecondToggle = await html.evaluate((el) =>
      el.classList.contains("dark"),
    );
    expect(afterSecondToggle).toBe(initialHasDark);
    await breath(page);
  });

  test("add a new card to a column", async ({ page }) => {
    const columns = page.locator("main > div > div").filter({ has: page.locator("h3") });
    const backlogColumn = columns.filter({ hasText: "Backlog" });

    await backlogColumn.getByRole("button", { name: /add card/i }).click();
    await settle(page);

    const input = backlogColumn.getByPlaceholder("Card title...");
    await expect(input).toBeVisible();
    await input.fill("My new test card");
    await breath(page);

    await backlogColumn.getByRole("button", { name: "Add" }).click();
    await settle(page);

    await expect(backlogColumn.getByText("My new test card")).toBeVisible();
    await breath(page);
  });

  test("delete a card from a column", async ({ page }) => {
    const cardTitle = page.locator("h4", { hasText: "Create GOALS.md" });
    await expect(cardTitle).toBeVisible();

    const card = cardTitle.locator("xpath=ancestor::div[contains(@class, 'group')]");
    await card.hover();
    await settle(page);

    await card.getByRole("button", { name: "Delete card" }).click();
    await settle(page);

    await expect(page.locator("h4", { hasText: "Create GOALS.md" })).not.toBeVisible();
    await breath(page);
  });

  test("add a new column to the board", async ({ page }) => {
    const addColumnButton = page.getByRole("button", { name: /add column/i });
    await addColumnButton.click();
    await settle(page);

    const input = page.getByPlaceholder("Column title...");
    await expect(input).toBeVisible();
    await input.fill("Review");
    await breath(page);

    await page
      .locator("div")
      .filter({ has: page.getByPlaceholder("Column title...") })
      .getByRole("button", { name: "Add column" })
      .click();
    await settle(page);

    await expect(page.locator("h3", { hasText: "Review" })).toBeVisible();

    const columns = page.locator("h3");
    await expect(columns).toHaveCount(5);
    await breath(page);
  });

  test("no console errors during interaction", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState("networkidle");
    await settle(page);

    const themeButton = page.getByRole("button", { name: /switch to/i });
    await themeButton.click();
    await settle(page);
    await themeButton.click();
    await settle(page);

    const addCardButton = page.getByRole("button", { name: /add card/i }).first();
    await addCardButton.click();
    await settle(page);

    const input = page.getByPlaceholder("Card title...");
    await input.fill("Console test card");
    await input.press("Escape");
    await settle(page);

    expect(consoleErrors).toEqual([]);
    await breath(page);
  });
});
