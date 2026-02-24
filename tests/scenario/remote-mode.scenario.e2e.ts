import { test, expect } from "@playwright/test";
import { createKanbanApi } from "../../src/domain/index.js";
import { createHttpServer } from "../../src/transports/http.js";
import { settle, hold, showCursor } from "../helpers.js";

test.describe("Remote mode — Browser uses remote store via HTTP", () => {
  let apiBaseUrl = "";
  let httpServer: ReturnType<typeof createHttpServer>;

  test.beforeAll(async () => {
    const { router } = createKanbanApi();
    httpServer = createHttpServer(router, { port: 0, host: "127.0.0.1" });
    await httpServer.start();

    const addr = httpServer.server.address();
    if (typeof addr === "object" && addr) {
      apiBaseUrl = `http://127.0.0.1:${addr.port}${httpServer.basePath}`;
    }
  });

  test.afterAll(async () => {
    await httpServer.stop();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`/demo/?mode=remote&apiBaseUrl=${encodeURIComponent(apiBaseUrl)}`);
    await page.waitForLoadState("networkidle");
    await showCursor(page);
    await settle(page);
  });

  test("persists board changes across reloads (remote store)", async ({ page }) => {
    const addColumnButton = page.getByRole("button", { name: /add column/i });
    await addColumnButton.click();
    await settle(page);

    const colInput = page.getByPlaceholder("Column title...");
    await colInput.fill("Remote Column");
    await page
      .locator("div")
      .filter({ has: page.getByPlaceholder("Column title...") })
      .getByRole("button", { name: "Add column" })
      .click();
    await settle(page);

    const remoteColumn = page
      .locator("[data-testid='kanban-column']")
      .filter({ hasText: "Remote Column" });
    await expect(remoteColumn).toBeVisible();
    await hold(page);

    await remoteColumn.getByRole("button", { name: /add card/i }).click();
    await settle(page);
    await remoteColumn.getByPlaceholder("Card title...").fill("Remote Card");
    await remoteColumn.getByRole("button", { name: "Add" }).click();
    await settle(page);
    await expect(remoteColumn.getByText("Remote Card")).toBeVisible();
    await hold(page);

    await page.reload();
    await page.waitForLoadState("networkidle");
    await settle(page);

    const remoteColumnAfterReload = page
      .locator("[data-testid='kanban-column']")
      .filter({ hasText: "Remote Column" });
    await expect(remoteColumnAfterReload).toBeVisible();
    await expect(remoteColumnAfterReload.getByText("Remote Card")).toBeVisible();
    await hold(page);
  });
});

