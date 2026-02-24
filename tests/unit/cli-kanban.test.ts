import { describe, it, expect, beforeEach } from "vitest";
import { createKanbanApi, resetIdCounter } from "../../src/domain/index.js";
import { createCli } from "../../src/cli/index.js";

describe("CLI Kanban Integration", () => {
  beforeEach(() => {
    resetIdCounter();
  });

  it("auto-generates all 11 Kanban commands", () => {
    const { router } = createKanbanApi();
    const cli = createCli(router);
    cli.exitProcess(false);

    const expectedCommands = [
      "getBoard",
      "listBoards",
      "createBoard",
      "deleteBoard",
      "createColumn",
      "updateColumn",
      "deleteColumn",
      "createCard",
      "updateCard",
      "deleteCard",
      "moveCard",
    ];

    for (const cmd of expectedCommands) {
      expect(cli.getInternalMethods().getCommandInstance().getCommands()).toContain(cmd);
    }
  });

  it("executes createBoard command programmatically", async () => {
    const { router } = createKanbanApi();
    const cli = createCli(router);
    cli.exitProcess(false);

    let output = "";
    const originalLog = console.log;
    console.log = (msg: string) => { output = msg; };

    try {
      await cli.parseAsync(["createBoard", "--title", "CLI Test Board"]);
    } finally {
      console.log = originalLog;
    }

    const result = JSON.parse(output);
    expect(result.title).toBe("CLI Test Board");
    expect(result.id).toBe("id-1");
    expect(result.columns).toEqual([]);
  });
});
