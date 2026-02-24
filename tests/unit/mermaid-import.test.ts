import { describe, it, expect, beforeEach } from "vitest";
import { createKanbanApi, resetIdCounter } from "../../src/domain/index.js";
import { parseMermaidKanban } from "../../src/domain/mermaid.js";

describe("Mermaid Kanban import", () => {
  beforeEach(() => {
    resetIdCounter();
  });

  it("parses Mermaid kanban syntax into columns/cards", () => {
    const mermaid = `
---
title: Demo Board
---
kanban
  Backlog
    [Design Unapi schema format] #core
    [Research transport options] #research
  Done
    [Create GOALS.md] #docs
`;
    const seed = parseMermaidKanban(mermaid);
    expect(seed.title).toBe("Demo Board");
    expect(seed.columns.map((c) => c.title)).toEqual(["Backlog", "Done"]);
    expect(seed.columns[0]!.cards[0]!.title).toBe("Design Unapi schema format");
    expect(seed.columns[0]!.cards[0]!.tags).toEqual(["core"]);
  });

  it("imports Mermaid into a real Kanban board via Unapi procedure", async () => {
    const { client } = createKanbanApi();
    const mermaid = `
kanban
  To Do
    [Write tests]
  Done
    [Ship]
`;
    const board = await client.board.importMermaid({ mermaid });
    expect(board.title).toBe("Imported Kanban");
    expect(board.columns.map((c) => c.title)).toEqual(["To Do", "Done"]);
    expect(board.columns[0]!.cards[0]!.title).toBe("Write tests");
  });
});

