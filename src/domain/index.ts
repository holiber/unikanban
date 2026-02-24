import { createRouter, createClient } from "../unapi/index.js";
import { KanbanStore } from "./store.js";
import { createKanbanProcedures } from "./procedures.js";

export { KanbanStore, resetIdCounter } from "./store.js";
export type { KanbanEvents } from "./store.js";
export { createKanbanProcedures } from "./procedures.js";
export * from "./schemas.js";

export type KanbanProcedures = ReturnType<typeof createKanbanProcedures>;

export const KANBAN_ALIASES = {
  // Legacy camelCase procedure names (compat)
  getBoard: "board.get",
  listBoards: "board.list",
  createBoard: "board.create",
  deleteBoard: "board.delete",
  importMermaid: "board.importMermaid",
  createColumn: "column.create",
  updateColumn: "column.update",
  deleteColumn: "column.delete",
  createCard: "card.create",
  updateCard: "card.update",
  deleteCard: "card.delete",
  moveCard: "card.move",
} as const satisfies Record<string, string>;

export const KANBAN_PROCEDURE_IDS: readonly (keyof KanbanProcedures & string)[] = [
  "board.get",
  "board.list",
  "board.create",
  "board.delete",
  "board.importMermaid",
  "column.create",
  "column.update",
  "column.delete",
  "card.create",
  "card.update",
  "card.delete",
  "card.move",
];

export function createKanbanApi(store?: KanbanStore) {
  const kanbanStore = store ?? new KanbanStore();
  const procedures = createKanbanProcedures(kanbanStore);
  const router = createRouter(procedures, {
    aliases: KANBAN_ALIASES,
  });
  const client = createClient(router);

  return { store: kanbanStore, router, client };
}
