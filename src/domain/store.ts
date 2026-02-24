import type { Board, Card, Column } from "./schemas.js";
import { EventBus } from "../unapi/events.js";

export type KanbanEvents = {
  "board:created": Board;
  "board:deleted": { boardId: string };
  "column:created": { boardId: string; column: Column };
  "column:updated": { boardId: string; column: Column };
  "column:deleted": { boardId: string; columnId: string };
  "card:created": { boardId: string; columnId: string; card: Card };
  "card:updated": { boardId: string; columnId: string; card: Card };
  "card:deleted": { boardId: string; columnId: string; cardId: string };
  "card:moved": {
    boardId: string;
    cardId: string;
    sourceColumnId: string;
    targetColumnId: string;
  };
};

let nextId = 1;
function generateId(): string {
  return `id-${nextId++}`;
}

export function resetIdCounter(start = 1): void {
  nextId = start;
}

export class KanbanStore {
  private boards = new Map<string, Board>();
  readonly events = new EventBus<KanbanEvents>();

  createBoard(title: string): Board {
    const board: Board = {
      id: generateId(),
      title,
      columns: [],
    };
    this.boards.set(board.id, board);
    this.events.emit("board:created", board);
    return board;
  }

  getBoard(boardId: string): Board {
    const board = this.boards.get(boardId);
    if (!board) throw new Error(`Board not found: ${boardId}`);
    return board;
  }

  listBoards(): Board[] {
    return Array.from(this.boards.values());
  }

  deleteBoard(boardId: string): void {
    if (!this.boards.has(boardId)) {
      throw new Error(`Board not found: ${boardId}`);
    }
    this.boards.delete(boardId);
    this.events.emit("board:deleted", { boardId });
  }

  private getColumn(boardId: string, columnId: string): Column {
    const board = this.getBoard(boardId);
    const column = board.columns.find((c) => c.id === columnId);
    if (!column)
      throw new Error(`Column not found: ${columnId} in board ${boardId}`);
    return column;
  }

  createColumn(boardId: string, title: string): Column {
    const board = this.getBoard(boardId);
    const column: Column = {
      id: generateId(),
      title,
      cards: [],
    };
    board.columns.push(column);
    this.events.emit("column:created", { boardId, column });
    return column;
  }

  updateColumn(boardId: string, columnId: string, title: string): Column {
    const column = this.getColumn(boardId, columnId);
    column.title = title;
    this.events.emit("column:updated", { boardId, column });
    return column;
  }

  deleteColumn(boardId: string, columnId: string): void {
    const board = this.getBoard(boardId);
    const index = board.columns.findIndex((c) => c.id === columnId);
    if (index === -1)
      throw new Error(`Column not found: ${columnId} in board ${boardId}`);
    board.columns.splice(index, 1);
    this.events.emit("column:deleted", { boardId, columnId });
  }

  createCard(
    boardId: string,
    columnId: string,
    data: { title: string; description?: string; priority?: Card["priority"]; tags?: string[] },
  ): Card {
    const column = this.getColumn(boardId, columnId);
    const card: Card = {
      id: generateId(),
      title: data.title,
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.tags !== undefined && { tags: data.tags }),
    };
    column.cards.push(card);
    this.events.emit("card:created", { boardId, columnId, card });
    return card;
  }

  updateCard(
    boardId: string,
    columnId: string,
    cardId: string,
    updates: { title?: string; description?: string; priority?: Card["priority"]; tags?: string[] },
  ): Card {
    const column = this.getColumn(boardId, columnId);
    const card = column.cards.find((c) => c.id === cardId);
    if (!card) throw new Error(`Card not found: ${cardId}`);

    if (updates.title !== undefined) card.title = updates.title;
    if (updates.description !== undefined) card.description = updates.description;
    if (updates.priority !== undefined) card.priority = updates.priority;
    if (updates.tags !== undefined) card.tags = updates.tags;

    this.events.emit("card:updated", { boardId, columnId, card });
    return card;
  }

  deleteCard(boardId: string, columnId: string, cardId: string): void {
    const column = this.getColumn(boardId, columnId);
    const index = column.cards.findIndex((c) => c.id === cardId);
    if (index === -1) throw new Error(`Card not found: ${cardId}`);
    column.cards.splice(index, 1);
    this.events.emit("card:deleted", { boardId, columnId, cardId });
  }

  moveCard(
    boardId: string,
    sourceColumnId: string,
    targetColumnId: string,
    cardId: string,
    targetIndex?: number,
  ): Card {
    const sourceColumn = this.getColumn(boardId, sourceColumnId);
    const cardIndex = sourceColumn.cards.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) throw new Error(`Card not found: ${cardId}`);

    const [card] = sourceColumn.cards.splice(cardIndex, 1);
    const targetColumn = this.getColumn(boardId, targetColumnId);

    const insertAt = targetIndex ?? targetColumn.cards.length;
    targetColumn.cards.splice(insertAt, 0, card);

    this.events.emit("card:moved", {
      boardId,
      cardId,
      sourceColumnId,
      targetColumnId,
    });
    return card;
  }
}
