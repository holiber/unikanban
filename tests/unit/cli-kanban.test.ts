import { describe, it, expect, beforeEach } from "vitest";
import { createKanbanApi, resetIdCounter } from "../../src/domain/index.js";
import { createCli } from "../../src/cli/index.js";

describe("CLI Kanban Integration", () => {
  beforeEach(() => {
    resetIdCounter();
  });

  it("auto-generates kanban command groups (board/column/card)", () => {
    const { router } = createKanbanApi();
    const cli = createCli(router);
    cli.exitProcess(false);

    const commands = cli.getInternalMethods().getCommandInstance().getCommands();
    expect(commands).toContain("board");
    expect(commands).toContain("column");
    expect(commands).toContain("card");
  });

  it("executes the full CLI workflow (board/column/card)", async () => {
    const api = createKanbanApi();
    const { router } = api;
    const cli = createCli(router);
    cli.exitProcess(false);

    const outputs: string[] = [];
    const originalLog = console.log;
    console.log = (msg: string) => { outputs.push(String(msg)); };

    try {
      await cli.parseAsync(["board", "create", "--title", "CLI Test Board"]);
    } finally {
      console.log = originalLog;
    }

    const board = JSON.parse(outputs.at(-1) ?? "{}");
    expect(board.title).toBe("CLI Test Board");
    expect(board.id).toBe("id-1");

    outputs.length = 0;
    console.log = (msg: string) => { outputs.push(String(msg)); };
    try {
      await cli.parseAsync(["column", "create", "--boardId", board.id, "--title", "To Do"]);
      const col1 = JSON.parse(outputs.at(-1) ?? "{}");

      await cli.parseAsync(["column", "create", "--boardId", board.id, "--title", "Done"]);
      const col2 = JSON.parse(outputs.at(-1) ?? "{}");

      await cli.parseAsync([
        "card",
        "create",
        "--boardId",
        board.id,
        "--columnId",
        col1.id,
        "--title",
        "Write tests",
      ]);
      const card = JSON.parse(outputs.at(-1) ?? "{}");
      expect(card.title).toBe("Write tests");

      await cli.parseAsync([
        "card",
        "move",
        "--boardId",
        board.id,
        "--sourceColumnId",
        col1.id,
        "--targetColumnId",
        col2.id,
        "--cardId",
        card.id,
      ]);

      await cli.parseAsync([
        "card",
        "update",
        "--boardId",
        board.id,
        "--columnId",
        col2.id,
        "--cardId",
        card.id,
        "--title",
        "Write more tests",
      ]);
      const updatedCard = JSON.parse(outputs.at(-1) ?? "{}");
      expect(updatedCard.title).toBe("Write more tests");

      await cli.parseAsync([
        "card",
        "delete",
        "--boardId",
        board.id,
        "--columnId",
        col2.id,
        "--cardId",
        card.id,
      ]);

      await cli.parseAsync([
        "column",
        "update",
        "--boardId",
        board.id,
        "--columnId",
        col2.id,
        "--title",
        "Completed",
      ]);
      const renamed = JSON.parse(outputs.at(-1) ?? "{}");
      expect(renamed.title).toBe("Completed");

      await cli.parseAsync([
        "column",
        "delete",
        "--boardId",
        board.id,
        "--columnId",
        col1.id,
      ]);

      await cli.parseAsync(["board", "get", "--boardId", board.id]);
      const fetched = JSON.parse(outputs.at(-1) ?? "{}");
      expect(fetched.id).toBe(board.id);

      await cli.parseAsync(["board", "list"]);
      const listed = JSON.parse(outputs.at(-1) ?? "{}");
      expect(Array.isArray(listed.boards)).toBe(true);

      await cli.parseAsync(["board", "delete", "--boardId", board.id]);
      const del = JSON.parse(outputs.at(-1) ?? "{}");
      expect(del.success).toBe(true);
    } finally {
      console.log = originalLog;
    }
  });
});
