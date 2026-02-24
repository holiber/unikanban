import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createKanbanApi,
  KanbanStore,
  resetIdCounter,
} from "../../src/domain/index.js";

describe("KanbanStore", () => {
  let store: KanbanStore;

  beforeEach(() => {
    store = new KanbanStore();
    resetIdCounter();
  });

  describe("boards", () => {
    it("creates a board", () => {
      const board = store.createBoard("My Board");
      expect(board.id).toBe("id-1");
      expect(board.title).toBe("My Board");
      expect(board.columns).toEqual([]);
    });

    it("gets a board by id", () => {
      const created = store.createBoard("Test");
      const fetched = store.getBoard(created.id);
      expect(fetched).toBe(created);
    });

    it("throws when getting a non-existent board", () => {
      expect(() => store.getBoard("nope")).toThrow("Board not found: nope");
    });

    it("lists all boards", () => {
      store.createBoard("A");
      store.createBoard("B");
      expect(store.listBoards()).toHaveLength(2);
    });

    it("deletes a board", () => {
      const board = store.createBoard("Doomed");
      store.deleteBoard(board.id);
      expect(() => store.getBoard(board.id)).toThrow();
    });

    it("throws when deleting a non-existent board", () => {
      expect(() => store.deleteBoard("nope")).toThrow("Board not found: nope");
    });
  });

  describe("columns", () => {
    it("creates a column in a board", () => {
      const board = store.createBoard("B");
      const col = store.createColumn(board.id, "To Do");
      expect(col.title).toBe("To Do");
      expect(col.cards).toEqual([]);
      expect(store.getBoard(board.id).columns).toHaveLength(1);
    });

    it("updates a column title", () => {
      const board = store.createBoard("B");
      const col = store.createColumn(board.id, "Old");
      const updated = store.updateColumn(board.id, col.id, "New");
      expect(updated.title).toBe("New");
    });

    it("deletes a column", () => {
      const board = store.createBoard("B");
      const col = store.createColumn(board.id, "Gone");
      store.deleteColumn(board.id, col.id);
      expect(store.getBoard(board.id).columns).toHaveLength(0);
    });

    it("throws when deleting a non-existent column", () => {
      const board = store.createBoard("B");
      expect(() => store.deleteColumn(board.id, "nope")).toThrow(
        "Column not found",
      );
    });
  });

  describe("cards", () => {
    it("creates a card in a column", () => {
      const board = store.createBoard("B");
      const col = store.createColumn(board.id, "Col");
      const card = store.createCard(board.id, col.id, {
        title: "Task 1",
        priority: "high",
      });
      expect(card.title).toBe("Task 1");
      expect(card.priority).toBe("high");
    });

    it("creates a card with all optional fields", () => {
      const board = store.createBoard("B");
      const col = store.createColumn(board.id, "Col");
      const card = store.createCard(board.id, col.id, {
        title: "Full Card",
        description: "A description",
        priority: "low",
        tags: ["tag1", "tag2"],
      });
      expect(card.description).toBe("A description");
      expect(card.tags).toEqual(["tag1", "tag2"]);
    });

    it("updates a card", () => {
      const board = store.createBoard("B");
      const col = store.createColumn(board.id, "Col");
      const card = store.createCard(board.id, col.id, { title: "Old" });
      const updated = store.updateCard(board.id, col.id, card.id, {
        title: "New",
        priority: "medium",
      });
      expect(updated.title).toBe("New");
      expect(updated.priority).toBe("medium");
    });

    it("deletes a card", () => {
      const board = store.createBoard("B");
      const col = store.createColumn(board.id, "Col");
      const card = store.createCard(board.id, col.id, { title: "Bye" });
      store.deleteCard(board.id, col.id, card.id);

      const updatedCol = store.getBoard(board.id).columns[0];
      expect(updatedCol.cards).toHaveLength(0);
    });

    it("throws when deleting a non-existent card", () => {
      const board = store.createBoard("B");
      const col = store.createColumn(board.id, "Col");
      expect(() => store.deleteCard(board.id, col.id, "nope")).toThrow(
        "Card not found",
      );
    });

    it("moves a card between columns", () => {
      const board = store.createBoard("B");
      const col1 = store.createColumn(board.id, "From");
      const col2 = store.createColumn(board.id, "To");
      const card = store.createCard(board.id, col1.id, { title: "Moving" });

      store.moveCard(board.id, col1.id, col2.id, card.id);

      expect(store.getBoard(board.id).columns[0].cards).toHaveLength(0);
      expect(store.getBoard(board.id).columns[1].cards).toHaveLength(1);
      expect(store.getBoard(board.id).columns[1].cards[0].title).toBe(
        "Moving",
      );
    });

    it("moves a card to a specific index", () => {
      const board = store.createBoard("B");
      const col1 = store.createColumn(board.id, "From");
      const col2 = store.createColumn(board.id, "To");

      store.createCard(board.id, col2.id, { title: "Existing 1" });
      store.createCard(board.id, col2.id, { title: "Existing 2" });
      const card = store.createCard(board.id, col1.id, { title: "Insert" });

      store.moveCard(board.id, col1.id, col2.id, card.id, 1);

      const targetCards = store.getBoard(board.id).columns[1].cards;
      expect(targetCards[1].title).toBe("Insert");
    });

    it("throws when moving a non-existent card", () => {
      const board = store.createBoard("B");
      const col = store.createColumn(board.id, "Col");
      expect(() =>
        store.moveCard(board.id, col.id, col.id, "nope"),
      ).toThrow("Card not found");
    });
  });

  describe("events", () => {
    it("emits board:created", () => {
      const handler = vi.fn();
      store.events.on("board:created", handler);
      const board = store.createBoard("Test");
      expect(handler).toHaveBeenCalledWith(board);
    });

    it("emits board:deleted", () => {
      const handler = vi.fn();
      const board = store.createBoard("Test");
      store.events.on("board:deleted", handler);
      store.deleteBoard(board.id);
      expect(handler).toHaveBeenCalledWith({ boardId: board.id });
    });

    it("emits column:created", () => {
      const handler = vi.fn();
      const board = store.createBoard("B");
      store.events.on("column:created", handler);
      const col = store.createColumn(board.id, "Col");
      expect(handler).toHaveBeenCalledWith({ boardId: board.id, column: col });
    });

    it("emits card:created", () => {
      const handler = vi.fn();
      const board = store.createBoard("B");
      const col = store.createColumn(board.id, "Col");
      store.events.on("card:created", handler);
      const card = store.createCard(board.id, col.id, { title: "T" });
      expect(handler).toHaveBeenCalledWith({
        boardId: board.id,
        columnId: col.id,
        card,
      });
    });

    it("emits card:moved", () => {
      const handler = vi.fn();
      const board = store.createBoard("B");
      const col1 = store.createColumn(board.id, "From");
      const col2 = store.createColumn(board.id, "To");
      const card = store.createCard(board.id, col1.id, { title: "M" });
      store.events.on("card:moved", handler);
      store.moveCard(board.id, col1.id, col2.id, card.id);
      expect(handler).toHaveBeenCalledWith({
        boardId: board.id,
        cardId: card.id,
        sourceColumnId: col1.id,
        targetColumnId: col2.id,
      });
    });
  });
});

describe("createKanbanApi (client)", () => {
  beforeEach(() => resetIdCounter());

  it("creates a fully functional API", () => {
    const api = createKanbanApi();
    expect(api.store).toBeInstanceOf(KanbanStore);
    expect(api.router).toBeDefined();
    expect(api.client).toBeDefined();
  });

  it("performs full CRUD workflow through the client", async () => {
    const { client } = createKanbanApi();

    const board = await client.createBoard({ title: "Sprint 1" });
    expect(board.title).toBe("Sprint 1");

    const col = await client.createColumn({
      boardId: board.id,
      title: "Backlog",
    });
    expect(col.title).toBe("Backlog");

    const card = await client.createCard({
      boardId: board.id,
      columnId: col.id,
      title: "Write tests",
      priority: "high",
    });
    expect(card.title).toBe("Write tests");

    const updatedCard = await client.updateCard({
      boardId: board.id,
      columnId: col.id,
      cardId: card.id,
      title: "Write comprehensive tests",
    });
    expect(updatedCard.title).toBe("Write comprehensive tests");

    const fetched = await client.getBoard({ boardId: board.id });
    expect(fetched.columns).toHaveLength(1);
    expect(fetched.columns[0].cards).toHaveLength(1);

    const { boards } = await client.listBoards({});
    expect(boards).toHaveLength(1);

    await client.deleteCard({
      boardId: board.id,
      columnId: col.id,
      cardId: card.id,
    });
    const afterDelete = await client.getBoard({ boardId: board.id });
    expect(afterDelete.columns[0].cards).toHaveLength(0);

    await client.deleteColumn({ boardId: board.id, columnId: col.id });
    const afterColDelete = await client.getBoard({ boardId: board.id });
    expect(afterColDelete.columns).toHaveLength(0);

    const result = await client.deleteBoard({ boardId: board.id });
    expect(result.success).toBe(true);
  });

  it("moves cards between columns through the client", async () => {
    const { client } = createKanbanApi();

    const board = await client.createBoard({ title: "Kanban" });
    const todo = await client.createColumn({ boardId: board.id, title: "To Do" });
    const done = await client.createColumn({ boardId: board.id, title: "Done" });
    const card = await client.createCard({
      boardId: board.id,
      columnId: todo.id,
      title: "Task A",
    });

    const moved = await client.moveCard({
      boardId: board.id,
      sourceColumnId: todo.id,
      targetColumnId: done.id,
      cardId: card.id,
    });
    expect(moved.title).toBe("Task A");

    const updatedBoard = await client.getBoard({ boardId: board.id });
    expect(updatedBoard.columns[0].cards).toHaveLength(0);
    expect(updatedBoard.columns[1].cards).toHaveLength(1);
  });

  it("validates input through the client (rejects bad data)", async () => {
    const { client } = createKanbanApi();
    await expect(client.createBoard({ title: "" })).rejects.toThrow();
  });

  it("self-documents via router.describe()", () => {
    const { router } = createKanbanApi();
    const desc = router.describe();
    expect(desc.procedures.length).toBeGreaterThanOrEqual(10);

    const names = desc.procedures.map((p) => p.name);
    expect(names).toContain("createBoard");
    expect(names).toContain("getBoard");
    expect(names).toContain("createCard");
    expect(names).toContain("moveCard");

    for (const proc of desc.procedures) {
      expect(proc.description).toBeTruthy();
      expect(proc.inputSchema).toBeDefined();
      expect(proc.outputSchema).toBeDefined();
    }
  });

  it("accepts a custom store instance", async () => {
    const store = new KanbanStore();
    store.createBoard("Pre-existing");
    const { client } = createKanbanApi(store);

    const { boards } = await client.listBoards({});
    expect(boards).toHaveLength(1);
    expect(boards[0].title).toBe("Pre-existing");
  });
});
